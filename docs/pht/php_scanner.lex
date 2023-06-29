/*
 * phc -- the open source PHP compiler
 * See license/README.license for licensing information
 *
 * Lexical analyser
 *
 * NOTE: 
 * In PHP, the constant "01090" is taken to be an octal number; everything
 * from the 9 onwards is silently ignored (so, the number evaluates to 8
 * decimal). phc will give an error message instead.
*/

%{
	#include <assert.h>
	#include <string.h>
	#include <phc/lib/Integer.h>
	#include "generated/php_parser.tab.hpp"
	#include "generated/cmdline.h"
	#include "parsing/PHP_lexer.h"

	extern struct gengetopt_args_info args_info;
	extern "C" const struct keyword* in_word_set(const char*, unsigned int);

	#define yywrap() 1
	#define YY_SKIP_YYWRAP

	/*
	 * Macros to return a token
	 * If dump_tokens_flag is set, also print the token to stdout
	 */

	#define RETURN(x) {													\
		if(args_info.dump_tokens_flag)								\
			printf("%ld: " #x "\n", source_line);					\
		after_arrow = (x) == O_SINGLEARROW;							\
		return x; }
	#define RETURN_OP(x) { 												\
		if(args_info.dump_tokens_flag) 								\
			printf("%ld: SIMPLE_OP %c\n", source_line, x); 		\
		after_arrow = false;												\
		return x; } 

	#define RETURN_ALL(state)			\
		mt_final_state = state;			\
		mt_index = 1;						\
		BEGIN(RET_MULTI);					\
		semantic_value = mt_lval[0];	\
		RETURN(mt_type[0]);

	struct keyword { char* name; int token; };
%}

%option c++
%option yyclass="PHP_lexer"

	/* Define lexical states */

%x PHP
%x SQ_STR		
%x SQ_ESC
%x BT_STR
%x DQ_STR		
%x HD_STR
%x HD_NL
%x HD_MAIN
%x HD_END
%x ESCAPE
%x ML_COMM
%x SL_COMM

%x COMPLEX1
%x COMPLEX2

%x RET_MULTI

	/* Define a few tokens referenced in the grammar, below */

NL					\r?\n?
WS					[ \t\n\r]
ANY				[\x00-\xff]	

START				"<?php"|"<?"
START_ECHO		"<?="
STOP				"?>"{NL}?

IDENT				[a-zA-Z_\x7F-\xFF][a-zA-Z0-9_\x7F-\xFF]*

DEC				([1-9][0-9]*)|0
HEX				0[xX][0-9a-fA-F]+
OCT				0[0-7]+
INT				({DEC}|{HEX}|{OCT})

LNUM				[0-9]+
DNUM				([0-9]*[\.]{LNUM})|({LNUM}[\.][0-9]*)
EXPONENT_DNUM	(({LNUM}|{DNUM})[eE][+-]?{LNUM})
REAL				{DNUM}|{EXPONENT_DNUM}

BRACKET			[(){}[\]]
ARITHMETIC		[+\-/*%^]
BITWISE			[&|~]
RELATIONAL		[=><]
OTHER_OP			[.!,?:$@]
SIMPLE_OP		{BRACKET}|{ARITHMETIC}|{BITWISE}|{RELATIONAL}|{OTHER_OP}

CS					"("{WS}*
CE					{WS}*")"
INT_CAST			{CS}("integer"|"int"){CE}
REAL_CAST		{CS}("float"|"real"|"double"){CE}
STRING_CAST		{CS}"string"{CE} 
ARRAY_CAST		{CS}"array"{CE}
OBJECT_CAST		{CS}"object"{CE} 
BOOL_CAST		{CS}("bool"|"boolean"){CE}
UNSET_CAST		{CS}"unset"{CE}


XML_NAME	 	[a-zA-Z_\x7F-\xFF][a-zA-Z0-9_\.\-\x7F-\xFF]*

%%

	/* Update source_line, source_column */

<*>{NL}					{
								if(YY_START != SL_COMM && YY_START != ML_COMM)

									attach_to_previous = 0;

								source_line++; 
								source_column = 0;
								REJECT;
							}
<*>.						{
								if((*yytext != '\n') && (*yytext != '\r'))
									source_column++;
								REJECT; 
							}

	/* Casts */

<PHP>{INT_CAST}		{ RETURN(CAST_INT);  }
<PHP>{REAL_CAST}		{ RETURN(CAST_REAL);  }
<PHP>{STRING_CAST}	{ RETURN(CAST_STRING);  }
<PHP>{ARRAY_CAST}		{ RETURN(CAST_ARRAY);  }
<PHP>{OBJECT_CAST}	{ RETURN(CAST_OBJECT);  }
<PHP>{BOOL_CAST}		{ RETURN(CAST_BOOL);  }
<PHP>{UNSET_CAST}		{ RETURN(CAST_UNSET);  }

	/* Operators */

<PHP>"=="				{ RETURN(O_EQEQ); }
<PHP>"==="				{ RETURN(O_EQEQEQ); }
<PHP>"!="				{ RETURN(O_NOTEQ); }
<PHP>"<>"				{ RETURN(O_NOTEQ); }
<PHP>"!=="				{ RETURN(O_NOTEQEQ); }
<PHP>"<="				{ RETURN(O_LE); }
<PHP>">="				{ RETURN(O_GE); }
<PHP>"++"				{ RETURN(O_INC); }
<PHP>"--"				{ RETURN(O_DEC); }
<PHP>"=>"				{ RETURN(O_DOUBLEARROW); }
<PHP>"->"				{ RETURN(O_SINGLEARROW); }

<PHP>"<<"				{ RETURN(O_SL); }
<PHP>">>"				{ RETURN(O_SR); }

<PHP>"+="				{ RETURN(O_PLUSEQ); }
<PHP>"-="				{ RETURN(O_MINUSEQ); }
<PHP>"*="				{ RETURN(O_MULEQ); }
<PHP>"/="				{ RETURN(O_DIVEQ); }
<PHP>".="				{ RETURN(O_CONCATEQ); }
<PHP>"%="				{ RETURN(O_MODEQ); }
<PHP>"&="				{ RETURN(O_ANDEQ); }
<PHP>"|="				{ RETURN(O_OREQ); }
<PHP>"^="				{ RETURN(O_XOREQ); }
<PHP>"<<="				{ RETURN(O_SLEQ); }
<PHP>">>="				{ RETURN(O_SREQ); }
<PHP>"::"				{ RETURN(O_COLONCOLON); }

<PHP>"&&"				{ RETURN(O_LOGICAND); }
<PHP>"||"				{ RETURN(O_LOGICOR); }

<PHP>{SIMPLE_OP}		{ RETURN_OP(*yytext); }
<PHP>";"					{ attach_to_previous = true; RETURN_OP(';'); } 

	/* Tokens */

<PHP>${IDENT}			{
								// variable names do not contain $
								semantic_value = new String(yytext+1); 
								RETURN(VARIABLE);
							}
<PHP>{IDENT}			%{
							{	// Can't declare local variables without scoping them
								
								// We generate a semantic value which equals the 
								// keyword so that we can reproduce it exactly the
								// same way in the unparsers, if we so desire 
								// (keywords are case insensitive)
								semantic_value = new String(yytext);
								
								// Check if the ident is in fact a keyword
								const struct keyword* keyword;
								keyword = in_word_set(yytext, yyleng);
								if(keyword != 0 && !after_arrow)
								{
									switch(keyword->token)
									{
										case K_CLASS:
										case K_FUNCTION:
											attach_to_previous = 1;
											break;
									}
									
									RETURN(keyword->token);
								}
								else
								{
									RETURN(IDENT);
								}
							}
							%}

<PHP>{XML_NAME}			{ semantic_value = new String(yytext);	RETURN(XML_IDENT);}

<PHP>{INT}				{ semantic_value = new String(yytext); RETURN(INT); }
<PHP>{REAL}				{ semantic_value = new String(yytext); RETURN(REAL); }
<PHP>{STOP}				{ buffer = ""; BEGIN(INITIAL); RETURN(';'); }

	/* Strings */

<PHP>"'"					{ buffer = ""; BEGIN(SQ_STR); }
<PHP>"`"					{ buffer = ""; BEGIN(BT_STR); }
<PHP>"\""				{ buffer = ""; BEGIN(DQ_STR); }
<PHP>"<<<"" "?			{ buffer = ""; BEGIN(HD_STR); }

	/* Comments */

<PHP>"/*"				{
								buffer = yytext;	
								BEGIN(ML_COMM); 
							}
<PHP>#|"//"				{ 
								buffer = yytext;	
								BEGIN(SL_COMM); 
							}

<ML_COMM>"*/"			{ 
								buffer.append(yytext);
								
								if(attach_to_previous)
									attach_comment(new String(buffer));
								else
									last_comments.push_back(new String(buffer));
								BEGIN(PHP); 
							
								buffer = "";
							}
<ML_COMM>{ANY}			{ buffer.push_back(*yytext); }

<SL_COMM>{NL}			{ 
								if(attach_to_previous)
									attach_comment(new String(buffer));
								else
									last_comments.push_back(new String(buffer));
								attach_to_previous = 0;
								BEGIN(PHP);

								buffer = "";
							}
<SL_COMM>{STOP}		{ buffer = ""; BEGIN(INITIAL); }
<SL_COMM>.				{ buffer.push_back(*yytext); }	

	/* Any other character */

<PHP>{WS}				/* Ignore */
<PHP>{ANY}				{ RETURN(INVALID_TOKEN); }

	/* Deal with singly quoted strings */

<SQ_STR>\'			{
							semantic_value = new String(buffer);
							BEGIN(PHP);
							buffer = "";
							RETURN(STRING);
						}
<SQ_STR>\\			{ BEGIN(SQ_ESC); }
<SQ_STR>{ANY}		{ buffer.push_back(*yytext); }

<SQ_ESC>\'			{ buffer.push_back(*yytext); BEGIN(SQ_STR); }
<SQ_ESC>{ANY}		{
							buffer.push_back('\\');
							buffer.push_back(*yytext);
							BEGIN(SQ_STR); 
						}

	/* Deal with backticked strings. */

<BT_STR>\`			{
							schedule_return(IDENT, "shell_exec");
							schedule_return('(');
							schedule_return(STRING, buffer);
							schedule_return(')');
							buffer = "";
							RETURN_ALL(PHP);
						}
<BT_STR>{ANY}		{ buffer.push_back(*yytext); }

	/* Deal with in-string syntax (in DQ_STR, and HD_STR) */

<DQ_STR,HD_MAIN>"$"{IDENT} {
							schedule_return(STRING, buffer);
							schedule_return('.');
							schedule_return(VARIABLE, &yytext[1]);
							schedule_return('.');

							buffer = "";
							RETURN_ALL(YY_START);
						}	
<DQ_STR,HD_MAIN>"${"{IDENT}"}" {
							schedule_return(STRING, buffer);
							schedule_return('.');
							schedule_return(VARIABLE, &yytext[2], yyleng - 3);
							schedule_return('.');
							buffer = "";
							RETURN_ALL(YY_START);
						}
<DQ_STR,HD_MAIN>"$"{IDENT}"["{INT}"]" %{
						{
							long left, right;
							left = strchr(yytext, '[') - yytext;
							right = strchr(yytext, ']') - yytext;

							schedule_return(STRING, buffer);
							schedule_return('.');
							schedule_return(VARIABLE, &yytext[1], left - 1);
							schedule_return('[');
							schedule_return(INT, &yytext[left+1], right - left - 1);
							schedule_return(']');
							schedule_return('.');
							
							buffer = "";
							RETURN_ALL(YY_START);
						} 
						%}
<DQ_STR,HD_MAIN>"$"{IDENT}"["{IDENT}"]" %{
						{
							long left, right;
							left = strchr(yytext, '[') - yytext;
							right = strchr(yytext, ']') - yytext;
							
							schedule_return(STRING, buffer);
							schedule_return('.');
							schedule_return(VARIABLE, &yytext[1], left - 1);
							schedule_return('[');
							schedule_return(STRING, &yytext[left+1], right - left - 1);
							schedule_return(']');
							schedule_return('.');
							
							buffer = "";
							RETURN_ALL(YY_START);
						} 
						%}
<DQ_STR,HD_MAIN>"$"{IDENT}"->"{IDENT} %{
						{
							long arrow;
							arrow = strchr(yytext, '-') - yytext;
							
							schedule_return(STRING, buffer);
							schedule_return('.');
							schedule_return(VARIABLE, &yytext[1], arrow - 1);
							schedule_return(O_SINGLEARROW);
							schedule_return(IDENT, &yytext[arrow+2]);
							schedule_return('.');

							buffer = "";
							RETURN_ALL(YY_START);
						} 
						%}

<DQ_STR,HD_MAIN>"{$"	{
							return_state = YY_START;
							semantic_value = new String(buffer);
							yyless(1);
							BEGIN(COMPLEX1);

							buffer = "";
							RETURN(STRING);
						}

<ESCAPE>n			{ buffer.push_back('\n'); BEGIN(return_state); }
<ESCAPE>t			{ buffer.push_back('\t'); BEGIN(return_state); }
<ESCAPE>r			{ buffer.push_back('\r'); BEGIN(return_state); }
<ESCAPE>\\			{ buffer.push_back('\\'); BEGIN(return_state); }
<ESCAPE>\$			{ buffer.push_back('$');  BEGIN(return_state); }
<ESCAPE>x[0-9A-Fa-f]{1,2} %{
						{
							char c = (char) strtol(yytext + 1, 0, 16);
							buffer.push_back(c);
							BEGIN(return_state);
						}
						%}
<ESCAPE>[0-7]{1,3} %{
						{
							char c = (char) strtol(yytext, 0, 8);
							buffer.push_back(c);
							BEGIN(return_state);
						}
						%}
<ESCAPE>{ANY}		{ 
							buffer.push_back('\\');
							buffer.push_back(*yytext);
							BEGIN(return_state); 
						}

	/* Complex syntax */

<COMPLEX1>{ANY}	{
							yyless(0);
							BEGIN(PHP);
							semantic_value = new Integer(return_state);
							RETURN_OP(O_MAGIC_CONCAT);
						}
<COMPLEX2>{ANY}	{
							yyless(0);
							BEGIN(return_state);
							RETURN_OP('.');
						}

	/* Deal with (doubly quoted) strings. */

<DQ_STR>\"			{
							semantic_value = new String(buffer);
							BEGIN(PHP);
							buffer = "";
							RETURN(STRING);
						}

<DQ_STR>\\\"		{ buffer.push_back('"'); }
<DQ_STR>\\			{ return_state = YY_START; BEGIN(ESCAPE); }
<DQ_STR>{ANY}		{ buffer.push_back(*yytext); }

	/* Heredoc syntax */

<HD_STR>{IDENT}	{
							heredoc_id = strdup(yytext);
							heredoc_id_len = yyleng;
							heredoc_id_ptr = 0;
							BEGIN(HD_NL);
						}
<HD_STR>.			{ 
							yyless(0); 
							BEGIN(PHP); 
							RETURN(INVALID_TOKEN);
						}

<HD_NL>{NL}			{ BEGIN(HD_MAIN); }
<HD_NL>{ANY}		{ RETURN(INVALID_TOKEN);	}

<HD_MAIN>\\			{ return_state = YY_START; BEGIN(ESCAPE); }
<HD_MAIN>{ANY}		%{
							buffer.push_back(*yytext);

							if((source_column == 1) && (*yytext == heredoc_id[0]))
								heredoc_id_ptr = &heredoc_id[1];
							else if(heredoc_id_ptr && (*heredoc_id_ptr == *yytext))
								heredoc_id_ptr++;
							else
								heredoc_id_ptr = 0;

							if(heredoc_id_ptr - heredoc_id == heredoc_id_len)
							{	
								BEGIN(HD_END);
							}
						%}
<HD_END>{NL}|;		%{ 
							{
								// Remove heredoc_id from the buffer 
								long string_len = buffer.size() - heredoc_id_len;

								// The linebreak of the last line of the HEREDOC
								// string should also be stripped
								if(buffer.size() >= 0 && buffer[string_len - 1] == '\n')
									string_len--;
								if(buffer.size() >= 0 && buffer[string_len - 1] == '\r')
									string_len--; // Windows file
							
								semantic_value = new String(buffer.substr(0, string_len));
								
								if(yytext[0] == ';')
									yyless(0);
								
								BEGIN(PHP);
								buffer = "";
								RETURN(STRING);
							}
						%}
<HD_END>.			%{
							buffer.push_back(*yytext);
							heredoc_id_ptr = 0;
							BEGIN(HD_MAIN);
						%}

	/* Returning multiple tokens */

<RET_MULTI>{ANY}	{
							yyless(0);

							if(mt_index == mt_count - 1)
							{
								mt_count = 0;
								BEGIN(mt_final_state);
							}
							semantic_value = mt_lval[mt_index];
							mt_index++;
							RETURN(mt_type[mt_index - 1]);
						}

	/* Deal with HTML fragments */

{START_ECHO}		{
							// The logic that deals with returning multiple tokens
							// needs at least two tokens to work with.
							if(!buffer.empty())
								schedule_return(INLINE_HTML, buffer);
							else
								schedule_return(';');

							schedule_return(K_ECHO);
							RETURN_ALL(PHP);
						}
{START}				%{
							BEGIN(PHP); 

							if(!buffer.empty())
							{
								semantic_value = new String(buffer);
								RETURN(INLINE_HTML);
							}
						%}
<<EOF>>				%{
							if(buffer.empty())
							{
								yyterminate();
							} 
							else 
							{
								semantic_value = new String(buffer);	
								buffer = "";
								RETURN(INLINE_HTML);
							}
						%}
{ANY}					{ buffer.push_back(*yytext); }

%%

/**
 * We need to define this here rather than in PHP_lexer.h because we
 * need access to the BEGIN and COMPLEX2 macros defined in lex.yy.cc
 */

YYSTYPE PHP_lexer::get_yylval()
{
	return semantic_value;
}

PHP_lexer::PHP_lexer(istream* _is)
{
	is = _is;
	yyin = _is;
	source_line = 1;
	attach_to_previous = false;
	source_column = 0;
	mt_index = 0;
	mt_count = 0;
	last_commented_node = 0;
	after_arrow = false;
}

void PHP_lexer::return_to_complex_syntax()
{
	BEGIN(COMPLEX2);
}
	
void PHP_lexer::attach_comment(String *s)
{
	assert(last_commented_node);
	last_commented_node->get_comments()->push_back(s);
}	
	
void PHP_lexer::schedule_return(long type, const char* lval, long length)
{
	mt_type[mt_count] = type;

	if(lval)
	{
		if(length == -1)
			mt_lval[mt_count] = new String(lval);
		else
			mt_lval[mt_count] = new String(lval, length);
	}
	else
	{
		mt_lval[mt_count] = NULL;
	}

	mt_count++;
}

void PHP_lexer::schedule_return(long type, string& s)
{
	schedule_return(type, s.c_str(), s.size());
}
