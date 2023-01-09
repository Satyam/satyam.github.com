#include <phc/Tree_transform.h>
#include <phc/Tree_visitor.h>
// This was used for debugging, not needed in production
//#include <phc/process_ast/XML_unparser.h>

//This one is used in the standalone version to call the unparser right away
// since that's what the compiler is all about.
#include <phc/process_ast/PHP_unparser.h>
#include <map>
#include <stack>
#include <iostream>

#define CLASS_NAME(x)  (dynamic_cast<Token_class_name*>(x->target)->value->c_str())
#define METHOD_NAME(x) (dynamic_cast<Token_method_name*>(x->method_name)->value->c_str())
#define FLAGS(x) dynamic_cast<Starts_with*>(x->attrs->get("Structured_tags"))

/*
Just a place to hold a static copy of a wildcard for any echo, so it can be compared against method_invocations.
*/
Token_method_name* pattern_echo;
Token_method_name* pattern_escaped_echo;
Token_method_name* pattern_printf;


/*
All of these build a method invocation to echo with different sorts of parameters
*/
AST_eval_expr* echo(AST_expr* expr);
AST_eval_expr* echo(String * s);
AST_eval_expr* echo(char* s);


/*
Map of method declarations using the method name as the key
It helps to find out what kind of element (tag, attribute, plain output, nothing) it produces
so it can be checked on method_invocations to see if it outputs something propper.
*/
map<string, AST_method*> method_declarations;

/*
	This class (almost a struct) is added to method declarations to add information about what kind of output they produce
	so that I can later figure out whether tags need to be open, closed or no tags when calling them
*/
class Starts_with: public Object {
public:

/*
starts with attributes:
	needs and open_start_tag
has output:
has elements:
	needs no tag or a closed start tag
starts with attributes and has output or elements:
	needs an open start tag and closes it

*/
	bool starts_with_output;
	bool starts_with_att;
	bool found_all;
	
	Starts_with() {
		starts_with_output = false;
		starts_with_att = false;
		found_all = false;
	}
};


/*
This is the first class to be instantiated to process a php_script
It searches for method declarations and puts them into the
method_declarations map above.
It adds to the attribute list of each node an instance of class Starts_with
which allows us to figure out what kind of output it generates.
The class will be filled in on the next, repeating step.
*/
class Search_method_declarations: public Tree_visitor {
	void pre_method(AST_method* in);
};



/*
Second step:
It tries to figure out what each function does, the possibilities are those given in class Starts_with
Since  a function might call a function which might not have been resolved yet
this list has to be traveled over and over until we find out.
WARNING:  be careful with recursive calls (directly or indirectly) because it can make a never ending loop.
Anyway, recursive calls are not a problem since, after all, they have to loop back to the same method, 
which would produce just more of the same, whatever it is.
*/

class Analyze_method: public Tree_visitor {
private:
	AST_method* method;
	
public:
	Starts_with*  flags;
	Analyze_method(AST_method* in);
	void pre_xml_element(AST_xml_element* in);
	void pre_xml_element_attribute(AST_xml_element_attribute* in);
	void pre_method_invocation(AST_method_invocation* in);
};

class Convert_xml_elements : public Tree_transform {
private:
	enum State {
		ANY_TAG,
		START_TAG_OPEN,
		START_TAG_CLOSED,
		TAG_CLOSED,   // never used, when the tag is closed, the stack is poped so it is never stored
		PI_OPEN,  // processing instruction
		PI_CLOSED  // never used, when the tag is closed, the stack is poped so it is never stored
	};
	stack<State> s;
	
	void close_start_tag(AST_node* in,AST_statement_list* out);
	void escape_expr(AST_expr* in, AST_statement_list* out);
	void print_element_name(AST_xml_element_name *name, AST_statement_list* out);

	bool in_xml_pi;
	char *encoding;
public:
	
	
 	void pre_xml_element_attribute(AST_xml_element_attribute* in, AST_statement_list* out);
	void pre_xml_element(AST_xml_element* in, AST_statement_list* out);
	void post_xml_element(AST_xml_element* in, AST_statement_list* out);
	void pre_eval_expr(AST_eval_expr* in, AST_statement_list* out);
	void pre_xml_processing_instruction(AST_xml_processing_instruction* in, AST_statement_list* out);
	void post_xml_processing_instruction(AST_xml_processing_instruction* in, AST_statement_list* out);
	void pre_method(AST_method* in, AST_member_list* out);
	void post_method(AST_method* in, AST_member_list* out);
	AST_php_script* post_php_script(AST_php_script* in);
};
