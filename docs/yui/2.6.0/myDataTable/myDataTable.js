// setting up my own namespace
var SATYAM = YAHOO.namespace('satyam');

/* This will have plenty of comments, but I'm not there yet.  
Please come back in a couple of days and I'll have it done.
Sorry for the delay */

// See:  http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html
YAHOO.util.DateLocale.es = YAHOO.lang.merge(YAHOO.util.DateLocale, {
	a: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
	A: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'sábado', 'domingo'],
	b: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
	B: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junnio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
	c: '%d/%m/%Y %T',
	p: ['', ''],
	P: ['', ''],
	x: '%d/%b/%Y',
	X: '%T'
});

YAHOO.util.DateLocale['es-ES'] = YAHOO.lang.merge(YAHOO.util.DateLocale.es, {});


(function () {
// Enclosing everything within this anonymous function
// makes everything declared inside invisible outside
// so I am free to declare any handy shortcuts as the ones below
// without messing up the global namespace.


	var Lang = YAHOO.lang,
		JSON = Lang.JSON,
		Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		DS = YAHOO.util.DataSource,
		XDS = YAHOO.util.XHRDataSource,
		DT = YAHOO.widget.DataTable;

/* The current 2.6.0 release of DataSource has an error in the constructor and the following code cannot be executed
It has been replaced by the code right below which works, though it is 'formally' not so nice

	SATYAM.DataSource = function (url,oConfig) {
		oConfig = oConfig || {};
		oConfig.responseSchema.resultsList = 'data';
		oConfig.responseSchema.metaFields = ['replyCode','replyText']
		SATYAM.DataSource.superclass.constructor.call(this,url,oConfig);
		return new XDS(udl,oConfig)
	};
	
	Lang.extend(SATYAM.DataSource,XDS, {
		doBeforeParseData: function (oRequest, oFullResponse, oCallback) {
			var replyCode = oFullResponse.replyCode
			if (replyCode) {
				if (replyCode < 200 || replyCode > 299) {
					alert(oFullResponse.replyText);
					return {};
				}
			} else {
				alert(oFullResponse);
				return {};
			}
			return oFullResponse;
		}
		// the other methods which extend DataSource should be added here just as doBeforeParseData was
	});
*/
	SATYAM.DataSource = function (url,oConfig) {
		oConfig = oConfig || {};
		oConfig.responseSchema = oConfig.responseSchema || {};
		// Since I know the format of the standard messsage response I can already set up a
		// good chunk of the responseSchema since it will always be the same
		oConfig.responseSchema.resultsList = 'data';
		oConfig.responseSchema.metaFields = ['replyCode','replyText'];
		// I'll always send my requests as POST
		oConfig.connMethodPost = true;
		// I will always use a XHRDataSource
		var myDS = new XDS(url,oConfig);
		
		// This is to read and process the replyCode and replyText 
		// In case they are out of the 200-299 range which is the no-error response
		myDS.doBeforeParseData = function (oRequest, oFullResponse, oCallback) {
			var replyCode = oFullResponse.replyCode;
			if (replyCode) {
				if (replyCode < 200 || replyCode > 299) {
					// This could be replace by a SimpleDialog
					alert(oFullResponse.replyText);
					return {};
				}
			} else {
				alert(oFullResponse);
				return {};
			}
			return oFullResponse;
		};
		
		// Here I am using part of the same information from the original
		// request for data to send further requests.  
		
		// I know the following:  all requests will go as POSTs,
		// All POST messages will contain two main URL-arguments:
		// ajaxObject: a string that identifies the object you want to deal with
		// ajaxAction: the action you want to perform on that object
		// Object usually correspond to Database table names
		// actions can be 'insert', 'delete', 'update', 'cellEdit' or whatever 
		// other action you provide a method on the server side to handle
		
		// all replies will come in the standard format
		// with the very same envelope as all do
		
		// argument data contains the url-encoded date, the question to be asked
		// callbacks is an object with possible replyCodes as keys and
		// functions as properties (you'll see them below)
		// callback[0] is like the default on a switch statement.
		// 0 is not a valid replyCode so it is a good number to use as a key
		myDS.ask = function (data,callbacks, scope) {
		
			// This handles the default case when the replyCode
			// does not match any of the ones listed.
			// This usually means an error but still the client might want to know.
			var callDefault = function (data) {
				var callback = callbacks[0];
				if (callback) { 
					if (scope) {
						callback.call(scope,data); 
					} else {
						callback(data); 
					}
				}
			};
			// I start the communication
			YAHOO.util.Connect.asyncRequest(
				'POST',
				// using the same server address as the DataSource
				this.liveData,
				{
					success: function (o) {
						// The reply is always JSON
						var r = JSON.parse(o.responseText);
						// and it always have a resplyCode
						if (r.replyCode) {
							// if there is a callback to handle that reply code
							var callback = callbacks[r.replyCode];
							// I call it, possibly using the scope received
							if (callback) { 
								if (scope) {
									callback.call(scope,r.data); 
								} else {
									callback(r.data); 
								}
								return;
							// for all other replies or error conditions, I display a message and call the default callback, if any
							} else {
								alert(r.replyText);
							}
						} else {
							alert(o.responseText);
						}
						callDefault(r.data);
					},
					failure: function (o) {
						alert(o.statusText);
						callDefault();
					},
					scope:this
				},
				data
			);
		};
		
		// This was a replacement for an actual subclass of DataSource.  
		// Since a bug in the code prevents us from extending DataSource, I made it a factory
		// so I need to produce the generated object.
		return myDS;
	};
	

	// The DataSource.Parser  is a hash table containing all the parsers.
	// All my dates will come from the server in YYYY-MM-SS HH:MM:SS format
	// so I change the default parser to this one.
	DS.Parser.date = function (oData) {
		var parts = oData.split(' ');
		var datePart = parts[0].split('-');
		if (parts.length > 1) {
				var timePart = parts[1].split(':');
				return new Date(datePart[0],datePart[1]-1,datePart[2],timePart[0],timePart[1],timePart[2]);
		} else {
				return new Date(datePart[0],datePart[1]-1,datePart[2]);
		}
	};
	

	// This is the constructor for my own custom DataTable
	// Notice that the oDataSource argument is missing, it doesn't need one
	SATYAM.DataTable = function (elContainer,aColumnDefs,oConfigs) {

		// For the benefit of inner functions, which have no access to 'this' I have to store it in a variable
		var self = this;
		
		// This array will be the responseSchema.fields array I will end up passing to the DataSource
		this.DSfields = [];
		
		// This is where I keep my copy of a few of the definitions in the generic column definitions
		// I only copy the few I care about, not the whole of them, and I also use the key as index
		// to make it faster to find.
		this.myColDefs = {};

		// This is an inner function that walks through the received column defst
		// processing some of the options that it cares about, 
		// copying them to either of the arrays above depending on what they are
		
		var searchColDefs = function (colDefs) {
			// I have to loop backwards due to the reordering the Array.splice causes
			var i,c,f,typeInfo,myCD;
			for (i = colDefs.length -1 ; i >= 0;i--) {
				c = colDefs[i];
				
				// I don't do much about children, I just keep walking through them
				if (c.children) {
					searchColDefs(c.children);
				} else {
					// Here I start collecting the information I care about.  
					// myCD would be an item into myColDefs (see above)
					myCD = {};
					// If no type is specified, I always assume 'string'
					myCD.type = c.type || 'string';
					// See the type table below.  Here I look for the properties for this particular type
					typeInfo = SATYAM.DataTable.types[myCD.type];
					myCD.typeInfo = typeInfo;
					myCD.isPrimaryKey = c.isPrimaryKey;
					myCD.defaultValue = c.defaultValue;
					myCD.madeUp = c.madeUp;
					if (!c.madeUp) {
						// Made up fields are create on the client side, they don't came
						// from the server so I don't need to tell the DataSource about them
						// for those that are not made up I do need to collect the fields information
						f = {key:c.key};
						f.parser = typeInfo.parser;
						myCD.parser = typeInfo.parser;
						// This is the cool thing about JSON or XML, the fields are read by field name
						// so I really don't care about their order in the fields array.  For other data formats
						// such as text, array or HTML tables, the order would be important.
						self.DSfields.push(f);
					}
					c.formatter = typeInfo.formatter;
					if (c.edit) {
						// If the edit flag is set I create an instance of the corresponding editor with
						// either the options explicitly given or the defaults coming from the field types table
						var edOpts = c.editorOptions || typeInfo.editorOptions || {};
						c.editor = new YAHOO.widget.CellEditor(typeInfo.editor,edOpts);
						// If there is not asyncSubmitter set on the original colDefs, I set the default one
						// which always makes sure to check everything against the server.
						if (!c.editor.asyncSubmitter) {
							c.editor.asyncSubmitter = self.asyncSubmitter;
						}
					}
					//If the field is not really meant to be shown, I remove its entry from the colDefs array
					if (c.noShow) {
						colDefs.splice(i,1);
					}
					// I store myColumnDefinition for this field in the hash of column definitions.
					self.myColDefs[c.key] = myCD;
				}
			}
		};
		searchColDefs(aColumnDefs);

		// I really expect to receive a 'serverURL' configuration setting in the DataTable options
		// If no serverURL is provided, I assume it to be the same as the client filename with 'html'  (or 'htm' for Windowsy people) replaced by 'php'
		var oDataSource = new SATYAM.DataSource(oConfigs.serverURL || document.location.pathname.replace(/.html?$/,'.php'));
		// here I set the fields I have just assembled with the inner function above.
		oDataSource.responseSchema.fields = this.DSfields;

		//  I really don't expect an initialRequest configuration setting but will honor it if it comes
		// If none comes I will set a default.
		// All my sever actions are classified by object to be acted upon and the action to do on it.
		// I expect the 'serverObject' to contain the string that will serve as object identifier in the server
		// I expect that all objects in the server to be listed in a DataTable to have a 'select' action
		// that will produce the original listing.
		oConfigs.initialRequest = oConfigs.initialRequest || 'ajaxAction=select&ajaxObj=' + escape(oConfigs.serverObject);
		
		// here I actually call the constructor of a real DataTable using the DataSource I have just instantiated
		// and the processed version of the columns definitions
		SATYAM.DataTable.superclass.constructor.call(this,elContainer,aColumnDefs,oDataSource,oConfigs);
		
		// I subscribe to the cellClickEvent to respond to the action icons and, if none, to pop up the cell editor
		this.subscribe('cellClickEvent',function(oArgs) {
			var target = oArgs.target;
			var column = this.getColumn(target);
			// columns with action icons should have an action property
			// The action thus independent of the visual image, if you click on that cell, whatever is displayed in it, the action will happen
			switch (column.action) {
				// for the delete action I request user confirmation and call the ask method of the DataSource
				case 'delete':
					if (confirm('Are you sure?')) {
						var record = this.getRecord(target);
						this.getDataSource().ask(
							// for a delete action, the ajaxAction argument has to be 'delete' and then I call method buildUrl which 
							// will assemble the rest of the URL which will have the value of the database table primary record
							// so the database know what it is to delete
							'ajaxAction=delete' + this.buildUrl(record), 
							{
								// If I receive an answer with replyCode == 200, I just go and delete the record
								200: function (data) {
									this.deleteRow(target);
								}
							},
							// I want the callback to execute in this same scope
							this
						);
					}
					break;
				case 'insert':
					this.getDataSource().ask(
						// For an insert, the arguments are just the action to be performed (insert) and the object to perform it on.
						'ajaxAction=insert&ajaxObj=' + this.get('serverObject'),
						{
							// Inserts will always reply with data, not a plain Ok so I would expect a replyCode == 201
							201: function (data) {
								var index,tr;
								// From the target I find out the location of the row
								index = this.getRecordIndex(target);
								// I add the record received from the server, properly assembled (see below) at that location
								this.addRow( this.assembleResponse(data) , index);
								
								// I use the following to focus the user attention on the record just inserted
								tr = this.getTrEl(index);
								// This next call is somewhat annoying
								// tr.scrollIntoView();
								Dom.addClass(tr,'my-highlight-row');
								Lang.later(2000,this,function() {
									Dom.removeClass(tr,'my-highlight-row');
								});
							}
						},
						this
					);
					break;
				default:
					// If no action is given, I try to edit it
					this.onEventShowCellEditor(oArgs);
					break;
			}
		});
		
		// Here I'm setting my default formats for dates and currency
		// Notice the locale which I declared at the top of this source.
		this.set('dateOptions',{format:"%d-%b-%Y",locale:'es-ES'});
		this.set('currencyOptions',{prefix: '&euro; ', decimalPlaces:2, decimalSeparator:",", thousandsSeparator:"."}); 
	};
	
	// This is the main data type table.  I just placed a few types there, you migth add as many as you want.
	SATYAM.DataTable.types = {
		'date': {
			parser:'date',
			formatter:'date',
			editor:'date',
			// I don't want the calendar to have the Ok-Cancel buttons below
			editorOptions:{disableBtns:true},
			// I want to send the dates to my server in the same format that it sends it to me
			// so I use this stringer to convert data on the way from the client to the server
			stringer: function (date) {
				return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() +
					' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
			}
		},
		number: {
			parser:'number',
			// I am using my own RegularExpressionCellEditor, defined below
			editor:'regexp',
			// I'm only accepting digits (probably this data type should be called integer)
			editorOptions: {
				regExp:'^\\d*$',
				validator: DT.validateNumber
			}
		},
		currency: {
			parser:'number',
			formatter:'currency',
			editor:'regexp',
			// for currency I accept numbers with up to two decimals, with dot or comma as a separator
			// It won't accept currency signs and thousands separators really messes things up
			editorOptions: {
				regExp:'^\\d*([.,]\\d{0,2})?$',
				validator: function (value) {
					return parseFloat(value.replace(',','.'));
				}
			},
			// When I pop up the cell editor, if I don't change the dots into commas, the whole thing will look inconsistent.
			cellEditorFormatter: function(value) {
				return ('' + value).replace('.',',');
			}
		},
		// This is the default, do-nothing data type.  
		// There is no need to parse, format or stringify anything and if an editor is needed, the textbox editor will have to do.
		string: {
			editor:'textbox'
		}
	};
	
		
	// Here I am finally declaring my datatable as an extension of the original one
	Lang.extend(SATYAM.DataTable, DT, {
	
		// this method builds an url-encoded string made of the field names and values of all thos
		// fields in the record marked with 'isPrimaryKey' .
		// It also adds the ajaxObj argument, since it is always good to have
		buildUrl: function(record) {
			var url = '';
			for (var k in this.myColDefs) {
				if (this.myColDefs.hasOwnProperty(k) && this.myColDefs[k].isPrimaryKey) {
					url += '&' + k + '=' + escape(record.getData(k));
				}
			}
			var ajaxObj = this.get('serverObject');
			if (ajaxObj) { url += '&ajaxObj=' + escape(ajaxObj); }
			return url;
		},
		
		// Perhaps you noticed that I've been using a couple of DataTable configuration settings that are documented nowhere
		// It is because they don't exist in the recular DataTable.  
		// The following method overrides the standard initAttribute method, calls the original one and then adds
		// serverURL and serverObject so from then on I can use them as if they had always been there.
		initAttributes: function (oConfigs) {
		
		    SATYAM.DataTable.superclass.initAttributes.call(this, oConfigs);
		    this.setAttributeConfig('serverURL', {
		        value: document.location.pathname.replace(/.js$/,'.php'),
				validator:Lang.isString
		    });
		    this.setAttributeConfig('serverObject', {
		        value: '',
				validator:Lang.isString
		    });

		},
		
		// This is the wonderful new addition to 2.6, the asyncSubmitter
		// This is the one I set up for all editable fields that have none explicitly specified
		// Please read the article and the docs to know where it fits
		asyncSubmitter: function (callback, newValue) {
			// To start with, I collect lots of information
			var record = this.getRecord(),
				column = this.getColumn(),
				oldValue = this.value,
				datatable = this.getDataTable(),
				myCD = datatable.myColDefs[column.key],
				// If the data type declared has no stringer defined (which is the usual thing) I provide a pass-through one
				stringer = myCD.typeInfo.stringer || function(v) { return v; };
				
				
debugger;
				// This is the third time I use this same 'ask' method in this library, should I still comment it
				// perhaps, but I won't
			datatable.getDataSource().ask(
				// This is the longest URL-encoded thing I used so far
				'ajaxAction=cellEdit&column=' + column.key + '&newValue=' + 
					escape(stringer(newValue)) + '&oldValue=' + escape(stringer(oldValue)) + 
					datatable.buildUrl(record),
				{ 
					// If I get an Ok response with no data, I just accept the newValue received in the arguments to this function
					200: function(data) {
						callback(true, newValue);
					},
					// If I do get extra information, I update the cell edited and any other field in the same record
					201: function (data) {
						callback(true, data[column.key]);
						this.updateRow(record, this.assembleResponse(data,record.getData()));
					},
					// If I get any other response, it has to be an error so I callback the callback with no arguments
					0:		callback
				},
				datatable
			);
		},
		
		// This method provides suitable data to both addRow and updateRow.
		
		// updateRow requires that the array provided has data for all its fields
		// otherwise, it will leave them empty
		// so what assemble response does is to merge the newData object
		// into the 'existing' object filling in those changed and letting the others alone
		
		// For addRow, there is no 'existing' record so it assembles a full response
		// made up from the values actually received and for those that didn't come
		// it will use the default values declared.  
		
		// The most important thing, though, is that all these data
		// need to be parsed just as the original data was so
		// it uses the same parsers the DataSource would have used for each of the fields
		assembleResponse: function (newData,existing) {
			var response = {},i,key,parser, myCD;
			for (key in this.myColDefs) {
				if (this.myColDefs.hasOwnProperty(key)) {
					myCD = this.myColDefs[key];
					if (!myCD.madeUp) {
						if (key in newData) {
							parser = DS.Parser[myCD.parser];
							if (parser) {
								response[key] = parser(newData[key]);
							} else {
								response[key] = newData[key];
							}
						} else {
							if (existing && (key in existing)) {
								response[key] = existing[key];
							} else {						
								response[key] = myCD.defaultValue;
							}
						}
					}
				}
			}
			return response;
		},
		
		// This method processed the values of the fields about to be shown for editing.
		// If the datatype has a cellEditorFormatter function defined, it will call it, just that.
		doBeforeShowCellEditor: function(editor) {
			var myCD = this.myColDefs[editor.getColumn().key];
			var typeInfo = myCD.typeInfo;
			var cellEditorFormatter = typeInfo.cellEditorFormatter;
			if (cellEditorFormatter) {
				editor.value = cellEditorFormatter(editor.value);
			}
			return true;
		}
	});

	
	// From here on, the declaration of my Regular Expression editor
	// It is commented on the article
	var RECE = function (oConfigs) {
		this._sId = "yui-regexptextboxceditor" + YAHOO.widget.BaseCellEditor._nCount++;
		oConfigs = oConfigs || {};
		oConfigs.type = 'regexptextbox';
		RECE.superclass.constructor.call(this, oConfigs); 
		
	};
	
	YAHOO.widget.RegExpCellEditor = RECE;
	
	Lang.extend(RECE, YAHOO.widget.TextboxCellEditor, {
		regExp: null,
		finalRegExp: null,
		failedRegExpClassName : '',
		render: function () {
			if (this.regExp && Lang.isString(this.regExp)) { this.regExp = new RegExp(this.regExp); }
			if (this.finalRegExp && Lang.isString(this.finalRegExp)) { this.finalRegExp = new RegExp(this.finalRegExp); }
			RECE.superclass.render.call(this);
			Event.on(this.textbox,'keypress', function(ev) {
				if (Lang.isNull(this.regExp)) { return; }
				var textbox = this.textbox;
				if (YAHOO.env.ua.gecko > 0 && ev.keyCode) { 
					return;
				}
				var ch = ev.keyCode || ev.charCode, 
					val = textbox.value, 
					start, 
					end; 
				if (document.selection && document.selection.createRange) {
					//undocumented IE trick to get the selection box.
					start = Math.abs(document.selection.createRange().moveStart("character", -1000000));
					end = Math.abs(document.selection.createRange().moveEnd("character", -1000000)); 
				} else {
					start = textbox.selectionStart;
					end = textbox.selectionEnd;
				}
				val = val.substr(0,start) + String.fromCharCode(ch) + val.substr(end);
				if (!this.regExp.test(val)) {
					Event.stopEvent(ev);
				}
			},this,true);
			Event.on(this.textbox,'keyup',function(ev) {
				if (Lang.isNull(this.finalRegExp)) { return; }
				if (this.finalRegExp.test(this.textbox.value)) {
					Dom.removeClass(this.textbox,this.failedRegExpClassName);
				} else {
					Dom.addClass(this.textbox,this.failedRegExpClassName);
				}
			},this,true);
		}
	
	});
	Lang.augmentObject(RECE, YAHOO.widget.TextboxCellEditor);
	
	// This is the way to add it to the Editors hash so it can be located by keyname.
	DT.Editors.regexp = RECE;

})();



YAHOO.register('SATYAM.DataTable',SATYAM.DataTable,{version:'2.6.0',build:'0'});