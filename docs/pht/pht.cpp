#include "pht.h"

// #include "process_ast/XML_unparser.h"

// The PHT define is set by /process_ast/process_ast.cpp in order to 
// compile this file within it and produce a standalone precompiler
// To generate a plugin, PHT should not be defined.

#ifdef PHT
void process_ast(AST_php_script* php_script)
#else
extern "C" void process_ast(AST_php_script* php_script)
#endif
{
	// initializing a bunch of patterns that I use in several places.
	pattern_echo = new Token_method_name(new String("echo"));
	pattern_escaped_echo = new Token_method_name(new String("?"));
	pattern_printf = new Token_method_name(new String("printf"));
	
	// First pass, look for all method declarations and add them to the map
	Search_method_declarations* smd = new Search_method_declarations();
	php_script->visit(smd);
	
	// Now, we have to analyze each method trying to figure out what kind of output they have.
	// Since methods can call others still not analyzed, or call themselves recursively and enter a loop
	// we have to go through several times.  
	// After a while, (10 iterations) I'll just assume that it got in a loop which would only add more elements of the same kind
	map<string, AST_method*>::const_iterator m;
	bool pending = true;
	for(int i=0;i<10 && pending;i++) {
		// printf("Try # %d\n",i);
		pending = false;
		for(m = method_declarations.begin(); m != method_declarations.end(); m++) {
// 			printf("método [%s] \n",m->first);
			if (!FLAGS(m->second)->found_all) {
				Analyze_method* am = new Analyze_method(m->second);
				am->flags->found_all = true;
				m->second->visit(am);
				pending |= !am->flags->found_all;
			}
		}
	}
	/*	
	if (pending) {
		puts("Still pending");
		exit(1);
	}
	*/

	// final step, do the conversion	
	Convert_xml_elements*  che = new Convert_xml_elements();
	php_script->transform(che);

#ifdef PHT
	Compact_echo* ce = new Compact_echo();
	php_script->transform(ce);	
#endif
}

// first pass, look for method declarations and add them to the method_declarations map indexed by the method name
void Search_method_declarations::pre_method(AST_method* in) {
	in->attrs->set("Structured_tags", new Starts_with());
	// TODO actually, the methods should be indexed by class_name::method_name
	method_declarations[in->signature->method_name->value->c_str()] = in;
}

// Each method is analyzed separately so it is handy to have a variable pointing to it and to its flags
Analyze_method::Analyze_method(AST_method* in) {
	method = in;
	flags = FLAGS(in);
}

// If it has a start tag before any attribute, flag it so.
void Analyze_method::pre_xml_element(AST_xml_element* in) {
	if (!flags->starts_with_att) flags->starts_with_output = true;
}

// if it has any attribute before any other output, flag it so
void Analyze_method::pre_xml_element_attribute(AST_xml_element_attribute* in) {
	if (!flags->starts_with_output) flags->starts_with_att = true;
}

// if it has any output (be it an echo, print, printf or escaped_echo (?) flag it as an output
void Analyze_method::pre_method_invocation(AST_method_invocation* in) {

	if (	   in->method_name->match(pattern_echo) 
		|| in->method_name->match(pattern_escaped_echo) 
		|| in->method_name->match(pattern_printf)
	) {
		if (!flags->starts_with_att) flags->starts_with_output = true;
	} else {
		// If it is not any of the standard output functions, which are the only ones on the stdlib that outputs anything
		// check to see if it is any of our own functions.
		if (strcmp(CLASS_NAME(in),"%STDLIB%")) {
 			
			const char *mn = METHOD_NAME(in);
			
			if (method_declarations.count(mn) > 0) {
				if (!FLAGS(method_declarations[mn])->found_all) {
					flags->found_all = false;
				} else {
					if (!(flags->starts_with_output || flags->starts_with_att)) {
						flags->starts_with_att = FLAGS(method_declarations[mn])->starts_with_att;
						flags->starts_with_output = FLAGS(method_declarations[mn])->starts_with_output;
					}
				}
			}
		}
	}
}


// utility functions, since echo is what I often make

AST_eval_expr* echo(char* s) {
	return echo(new String(s));
}
	
AST_eval_expr* echo(String * s) {
	return echo(new Token_string(s,s));
}
 
AST_eval_expr* echo(AST_expr* expr) {
	AST_method_invocation* e = new AST_method_invocation("%STDLIB%","echo",expr);
	e->attrs->set("Structured_tags_built",new Boolean( true));
	return new AST_eval_expr(e);
}

// private method to close a start tag, after the tag name and attributes, if any.
void Convert_xml_elements::close_start_tag(AST_node* in,AST_statement_list* out) {
	if (s.top() == ANY_TAG) printf("\n<!-- %s[%d]:  ***** Warning: might not have a start tag to close-->\n"
		, in->get_filename()->c_str(),in->get_line_number());
	if (s.top() == START_TAG_OPEN || s.top() == ANY_TAG) {
		s.pop();
		s.push(START_TAG_CLOSED);
		out->push_back(echo(">"));
	} else {
		printf("\n<!-- %s[%d]:  ***** Error: no start tag to close-->\n", in->get_filename()->c_str(),in->get_line_number());
	}
}


// changes a '&'<attribute name> <value> into a series of echos.
void Convert_xml_elements::pre_xml_element_attribute(AST_xml_element_attribute* in, AST_statement_list* out) {

	// can't have an attribute if a start tag is not open.   
	// It might also be used within a processing instruction
	// or at the start of a method declaration, which might be called from anywhere.
	switch(s.top()) {
		case START_TAG_OPEN:
		case PI_OPEN:
			break;  // Fine, this is as it should be
		case ANY_TAG:
			printf("\n<!-- %s[%d]:  ***** Warning: attribute when a start tag might not be open-->\n", in->get_filename()->c_str(),in->get_line_number());
			break;
		default:
			printf("\n<!-- %s[%d]:  ***** Error: attribute when no start tag is open-->\n",in->get_filename()->c_str(),in->get_line_number());
			break;
	}
	out->push_back(echo(" "));
	print_element_name(in->xml_element_name,out);

	out->push_back(echo("=\""));
	escape_expr(in->expr,out);
	out->push_back(echo(new String("\"")));
	
	if (in_xml_pi && strcmp(in->xml_element_name->tag_name->value->c_str(),"encoding") == 0) {
		Token_string *ts = new Token_string(WILDCARD,WILDCARD);
		if (in->expr->match(ts)) encoding = strdup(ts->value->c_str());
	}
}

// changes a '<' <element name> <statement> into a series of echos
void Convert_xml_elements::pre_xml_element(AST_xml_element* in, AST_statement_list* out) {
	
	// close any previous open start tag
	if (s.top() == START_TAG_OPEN) close_start_tag(in,out);
	// push the new state of the tags
	s.push(START_TAG_OPEN);
	
	// The start tag is left open since attributes might follow.
	out->push_back(echo("<"));
	print_element_name(in->xml_element_name,out);

	out->push_back(in);
}

// finishes up the conversion of the xml element
void Convert_xml_elements::post_xml_element(AST_xml_element* in, AST_statement_list* out) {
	
	// if the statement list was empty, it is an empty element, such as <br /> or <hr />
	// notice that if the statement_list originally contained xml attributes, these have been output as echoes
	// and taken out of the statement list.
	if (in->statements->size() == 0) {
		// if it is still open, close it
		if (s.top() == START_TAG_OPEN) {
			out->push_back(echo("/>"));
			s.pop();
			// no need to do anything else
			return;
		}
	// if the statement list is not empty, then append the statements to the initial echo of the start tag.
	} else {
		out->push_back_all(in->statements);
	}
	
	// just to be sure, there shouldn't be any start tag open this far, meaning something like <html  
	if (s.top() == START_TAG_OPEN) close_start_tag(in,out);
	// likewise, there should be a full tag to close, like <html>
	switch(s.top()) {
		case START_TAG_CLOSED:
			break;  // This is fine, nothing to do
		case ANY_TAG:
			printf("\n<!-- %s[%d]:  ***** Warning: there might not be a  tag to close -->\n", in->get_filename()->c_str(),in->get_line_number());
			break;
		default:
			printf("\n<!-- %s[%d]:  ***** Error: no  tag to close -->\n", in->get_filename()->c_str(),in->get_line_number());
	}
	// So, just close the tag and pop whatever flags were there
	// TODO warning, if the tag name is given as a variable, the value might have changed in the statements in between
	// and the closing tag would not match the initial one
	out->push_back(echo("</"));
	print_element_name(in->xml_element_name,out);
	out->push_back(echo(">"));
	s.pop();
}


// This is mostly like an xml element, except that it does not have an start and end tag, it just ends with a ?>
void Convert_xml_elements::pre_xml_processing_instruction(AST_xml_processing_instruction* in, AST_statement_list* out) {
	
	// close any pending start tag	
	if (s.top() == START_TAG_OPEN) close_start_tag(in,out);
	// flag new state
	s.push(PI_OPEN);
	
	out->push_back(echo("<?"));
	print_element_name(in->xml_element_name,out);
	if (!in->xml_element_name->is_var) {
		in_xml_pi = strcmp("xml",in->xml_element_name->tag_name->value->c_str()) == 0;
	}
	out->push_back(in);
}

// close the processing instruction
void Convert_xml_elements::post_xml_processing_instruction(AST_xml_processing_instruction* in, AST_statement_list* out) {
	// we don't care about whether it has statements or not, a PI is close just the same, there is no shortcut like in a <br />
	out->push_back_all(in->statements);
	switch(s.top()) {
		case PI_OPEN:
			break;   // this is fine, nothing to do
		case ANY_TAG:
			printf("\n<!-- %s[%d]:  ***** Warning: there might be no  processing instruction to close -->\n", in->get_filename()->c_str(),in->get_line_number());
			break;
		default:
			printf("\n<!-- %s[%d]:  ***** Error: no  processing instruction to close -->\n", in->get_filename()->c_str(),in->get_line_number());
	}
	s.pop();
	out->push_back(echo("?>"));
	in_xml_pi = false;
}


// Here I'm looking for different types of method_invocations, but I can't use pre_method_invocation
// because it doesn't allow me to add new statements, so I have to go one level up
// were the method has a list of statements as the output, which I can add to
void Convert_xml_elements::pre_eval_expr(AST_eval_expr* in, AST_statement_list* out) {

	AST_method_invocation* mi = new AST_method_invocation(WILDCARD,WILDCARD,WILDCARD);
	
	// So, first of all, check for any kind of method_invocation
	if (in->match(new AST_eval_expr(mi))) {
		const char *mn = METHOD_NAME(mi);
		
		// if it is any sort of output
		if (mi->method_name->match(pattern_echo) || mi->method_name->match(pattern_printf)) {
			// If the start tag is still open
			if (s.top() == START_TAG_OPEN) {
				// and the echo is not one of my own
				Boolean *b = mi->attrs->get_boolean("Structured_tags_built");
				// then, first, have any start tag closed since any output, except for attributes, is not valid within a start tag
				if (b == NULL) 	close_start_tag(in,out);
			}
		// if it is an escaped_echo
		} else if (mi->method_name->match(pattern_escaped_echo)) {
			// if the start tag is open, close it.
			if (s.top() == START_TAG_OPEN) close_start_tag(in,out);
			
			AST_actual_parameter_list* apl  = mi->actual_parameters;
			//puts("-------------------------\n-------------------------apl-------------------------");
			//apl->visit(new XML_unparser());
			// Loop through the list of parameters
			List<AST_actual_parameter*>::const_iterator p;
			for(p = apl->begin(); p != apl->end(); p++) {
// 				puts("-------------------------\n-------------------------*p -------------------------");
// 				(*p)->visit(new XML_unparser());
				escape_expr((*p)->expr,out);
			}
			return;
		
		} else {
			// if the call is not to a stdlib function, it is my own function
			if (strcmp(CLASS_NAME(mi),"%STDLIB%")) {
				// find out if I have it analyzed
				if (method_declarations.count(mn) > 0) {
					Starts_with* st = FLAGS(method_declarations[mn]);
					// If the method starts with output and the last start tag is still open, close it.
					if (st->starts_with_output) {
						if (s.top() == START_TAG_OPEN) close_start_tag(in,out);
					}
					// If the method starts with an attribute and there is no open start tag, its an error
					if (st->starts_with_att) {
						switch(s.top()) {
							case START_TAG_OPEN:
								break;
							case  ANY_TAG:
								printf("\n<!-- %s[%d]:  ***** Warning: attribute with possibly no start tag open -->\n", in->get_filename()->c_str(),in->get_line_number());
								break;
							default:
								printf("\n<!-- %s[%d]:  ***** Error: attribute when no start tag is open -->\n", in->get_filename()->c_str(),in->get_line_number());
						}
					}
//				//  If the method is not found  TODO shall we assume it outputs anything?
//				// after all leaving an start tag open is kind of an unstable state.
//				} else {
//					printf("\n<!-- **** Method %s not found-->\n",mn);
				}
			}
		}
	}
	out->push_back(in);
}

// A very primitive version, I have to take the good one from php/ext/standard/html.c
// function php_html_entities 
void Convert_xml_elements::escape_expr(AST_expr* expr,AST_statement_list* out) {
	if (
		  dynamic_cast<Token_int*>(expr)
		||dynamic_cast<Token_bool*>(expr)
		||dynamic_cast<Token_real*>(expr)
		||dynamic_cast<Token_null*>(expr)
	) {
		// expressions of these types don't need to be escaped, pass them on.
		;
	} else if (dynamic_cast<Token_string*>(expr)) {
		// if the output is a literal, escape the string first
		String *st = dynamic_cast<Token_string*>(expr)->get_value_as_string();
		string *s = new string(st->c_str());
		for (unsigned int pos = 0;(pos = s->find('&',pos)) != s->npos;pos++) {
			s->replace(pos,1,"&amp;");
		}
		for (unsigned int pos = 0;(pos = s->find('<',pos)) != s->npos;pos++) {
			s->replace(pos,1,"&lt;");
		}
		for (unsigned int pos = 0;(pos = s->find('>',pos)) != s->npos;pos++) {
			s->replace(pos,1,"&gt;");
		}
		for (unsigned int pos = 0;(pos = s->find('"',pos)) != s->npos;pos++) {
			s->replace(pos,1,"&quot;");
		}
		for (unsigned int pos = 0;(pos = s->find('\'',pos)) != s->npos;pos++) {
			s->replace(pos,1,"&apos;");
		}
		st = new String(s->c_str());		
		expr = new Token_string(st,st);
	} else {
		// if it is any other sort of expression, leave the escaping to php
		expr = new AST_method_invocation("%STDLIB%","htmlentities",expr);
	}
	out->push_back(new AST_eval_expr(new AST_method_invocation("%STDLIB%","echo",expr)));
}


// At the definition of a new function, anything can go so I have to put that on the stack
void Convert_xml_elements::pre_method(AST_method* in, AST_member_list* out) {
	s.push(ANY_TAG);
	out->push_back(in);
}

// I have to pop out the state I pushed in on the pre_method, making sure it is what I did put.
void Convert_xml_elements::post_method(AST_method* in, AST_member_list* out) {
	if (s.top() != ANY_TAG) {
		printf("\n<!-- %s[%d]:  ***** Error: unbalanced stack on exit from %s -->\n"
			, in->get_filename()->c_str(),in->get_line_number(),in->signature->method_name->value->c_str());
	}
	s.pop();
	out->push_back(in);
}

// by the end of it, everything should be balanced and the stack empty
AST_php_script* Convert_xml_elements::post_php_script(AST_php_script* in) {
	if (s.size()) printf("\n<!-- %s[%d]:  ***** Error: unbalanced stack  %d elements left -->\n"
		, in->get_filename()->c_str(),in->get_line_number(),s.size());
	return in;
}

void Convert_xml_elements::print_element_name(AST_xml_element_name* name,AST_statement_list* out) {
	if (name->xml_namespace) {
		if (name->ns_is_var) {
			out->push_back(echo(new AST_variable(new Token_variable_name(name->xml_namespace->value))));
		} else {
			out->push_back(echo(name->xml_namespace->value));
		}
		out->push_back(echo(":"));
	}
	if (name->is_var) {
		out->push_back(echo(new AST_variable(new Token_variable_name(name->tag_name->value))));
	} else {
		out->push_back(echo(name->tag_name->value));
	}
}
