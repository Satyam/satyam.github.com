YUI.add('fields', function (Y) {						
	"use strict";
	/*
		This is the base for a cell editor, basically, it uses a plain <input> box.
		See methods _uiSetValue, _afterInputValueChange and _afterInputBlur
		They all use the schema configuration attribute to pick the formatter, parser and validator
		from Y.DataTypes.
	*/
	var Lang = Y.Lang,
	
		CBX = 'contentBox',
		BBX = 'boundingBox',
		VALUE = 'value',
		VALUES = 'values',
		EDITOR = 'editor',
		TITLE = 'title',
		LABEL = 'label',
		INPUT = 'input',
		ERR_MSG = 'errorMsg',
		VALIDATOR = 'validator',
		SCHEMA = 'schema',
		
		DTs = Y.DataTypes,
		UI = DTs.UI,
		FORMATTER = DTs.FORMATTER,
		PARSER = DTs.PARSER,
		
		BODY = Y.WidgetStdMod.BODY,
		HEADER = Y.WidgetStdMod.HEADER,
		
		POPUP = 'popup',
		BUTTON = 'button',
		HOST = 'host',
		OK = 'ok';
		
	Y.BaseCellEditor = Y.Base.create(
		'base-cell-editor',
		Y.Widget,
		[Y.WidgetChild, Y.MakeNode],
		{
			renderUI: function () {
				this.get(CBX).append(this._makeNode());
				this._locateNodes();
			},
			bindUI: function () {
				// interim solution because as of 3.4.0, valueChange cannot be listened to by delegation
				this._eventHandles.push(this._inputNode.after('valueChange', this._afterInputValueChange, this));
			},
			_uiSetValue: function (value, src) {
				if (src === UI) {
					return;
				}
				this._inputNode.set(VALUE, DTs.invoke(this.get(SCHEMA), UI, FORMATTER, value));
			},
			_uiSetSchema: function (value) {
				this._inputNode.set(TITLE, value.description || value.title);
			},
			_uiSetErrorMsg: function (value) {
				this._inputNode.set(TITLE, value || this.get(LABEL));
			},
			_afterInputValueChange: function (ev) {
				this.set(VALUE, DTs.invoke(this.get(SCHEMA), UI, PARSER, ev.target.get(VALUE)), {src: UI});
			},
			_afterInputBlur: function (value)  {
				this.set(ERR_MSG, DTs.invoke(this.get(SCHEMA), UI, VALIDATOR, value));
			}								
		},
		{
			ATTRS: {
				value: {
				},
				errorMsg: {
				},
				schema: {
				}
			},
			_TEMPLATE: '<input class="{c input}" />',
			_CLASS_NAMES:[INPUT],
			_ATTRS_2_UI: {
				SYNC: [SCHEMA, VALUE],
				BIND: [SCHEMA, ERR_MSG, VALUE]
			},
			_EVENTS: {
				// Unfortunately, valueChange is a synthetic event and cannot be hooked via _EVENTS
				// so I had to bind it in bindUI
				// input: 'valueChange'
				input: 'blur'
			}
		}
	);
	
	/*
		This is the plugin that adds a label in between the bounding box and the content box
		and captures the _uiSetLabel method of the host to display it on the label.
		
		A similar plugin should be available to turn the base cell editor into a popup
		that could be overlayed anywhere.
	*/
	
	Y.FormFieldPlugin = Y.Base.create(
		'form-field-plugin',
		Y.Plugin.Base,
		[],
		{
			initializer: function () {
				this.afterHostEvent('render',this._afterHostRender);
				this.afterHostEvent('schemaChange', this._afterHostSchemaChange);
				
			},
			_afterHostSchemaChange: function(ev) {
				this._setLabel(ev.newVal);
				return new Y.Do.Prevent();
			},
			_setLabel: function (schema) {
				this._labelNode.setAttrs({
					innerHTML:schema.title || schema.description,
					title:schema.description
				});
			},
			
			_afterHostRender: function () {
				var host = this.get(HOST),
					bbx = host.get(BBX);
				this._labelNode = Y.Node.create('<label class="yui3-form-field-plugin-label"><\/label>');
				bbx.insert(this._labelNode,0);
				this._setLabel(host.get(SCHEMA));
			}
			
		},
		{
			NS:'FieldPlugin'							
		}
	);
	
	Y.FloatingFieldPlugin = Y.Base.create(
		'floating-field-plugin',
		Y.Plugin.Base,
		[],
		{
			initializer: function (config) {
				var host = config.host,
					YCM = Y.ClassNameManager.getClassName;
				this.afterHostEvent('render',this._afterHostRender);
				this._classNames = {};
				Y.each(this._classNameKeys, function (key) {
					this._classNames[key] = YCM(this.name, key);
				},this);
				host.addAttr('node', {
					setter: function (value) {
						return Y.Node.one(value);
					}
				});
				host.set('visible', false);
				this.afterHostEvent('nodeChange', this._afterNodeChange, this);
			},
			_classNameKeys: ['buttons', BUTTON, OK,'cancel',POPUP],
			_afterHostRender: function () {
				var host = this.get(HOST),
					bbx = host.get(BBX);
					
				bbx.addClass(this._classNames[POPUP]);
				this._buttonsNode = Y.Node.create(Lang.sub(this._template,this._classNames));
				bbx.append(this._buttonsNode);
				this._buttonsNode.delegate('click', this._afterButtonClick, '.' + this._classNames[BUTTON], this);
			},
			_afterButtonClick: function (ev) {
				var host = this.get(HOST);
				if (ev.target.hasClass(this._classNames[OK])) {
					host.fire('cellEditorSave', {value: host.get(VALUE)});
				}
				host.set('visible', false);
			},
			_afterNodeChange: function (ev) {
				var host = this.get(HOST),
					bbx = host.get(BBX),
					node = ev.newVal,
					region = node.get('region');
					
				bbx.setXY([region.left, region.top]);
				bbx.set('offsetWidth', region.width);
				
			},
			_template: [
				'<div class="{buttons}">',
				'<div class="{button} {ok}">Ok<\/div>',
				'<div class="{button} {cancel}">Cancel<\/div>',
				'<\/div>'
			].join('')
		},
		{
			// they have the same NS since the two cannot coexist so loading one implicitly unloads the other.
			NS:'FieldPlugin'							
		}
	);

					
	/*
		So, this is the real thing, finally.  
		This form takes 
			a) a full schema 
			b) a set of values
		and it builds a form from those.
		It will take the header of the form from the description or the name of the schema.
		Each of the fields is taken from the schema, their labels from the title or description.
		The editor to use is taken from the Y.DataTypes based on the type/format in the schema.
		Each cell editor field is plugged in with the FormFieldPlugin and passes the schema info
		for that particular field.  The field itself will take the label from the title or description for that field,
		and the formatter, parser and validator.
		Each field will take its value from the record passed, using the formatter from the schema.
		
		The form uses a three section WidgetStdMod and is also a WidgetParent, with the form fields its children.
	*/
	Y.Form = Y.Base.create(
		'form',
		Y.Widget,
		[Y.WidgetStdMod, Y.WidgetParent, Y.MakeNode],
		{
			CONTENT_TEMPLATE: '<form><\/form>',
			renderUI: function () {
				this.setStdModContent(BODY,'');
				this._childrenContainer = this.getStdModNode(BODY);
			},
				
			_uiSetSchema: function (value) {

				this.setStdModContent(HEADER, value.description || value.name);
				Y.each(value.properties , function (schema) {
					this.add(DTs.invoke(schema, UI, EDITOR, {
						plugins: [Y.FormFieldPlugin]
					}));
				}, this);
				this._stdModParsed = {bodyContent:true};
			},
			_uiSetValues: function (value) {
				var i = 0;
				Y.each(this.get(SCHEMA).properties, function (schema, key) {
					this.item(i).set(VALUE, value[key]);
					i+=1;
				}, this);
			}
		},
		{
			_ATTRS_2_UI: {
				SYNC: [SCHEMA, VALUES],
				BIND: [SCHEMA, VALUES]
			},							
			ATTRS:  {
				schema: {
				},
				values: {
				}
			}
		}
	);
	
	/*
		This is the trick on how a form library adds itself to the Y.DataTypes.
		In this case, I am adding a function that returns an instance of BaseCellEditor as default editor for all types/formats (the first null, null).
		Since I have only a single editor type, I add it as the default and since no type has any other, it will fall back to this one.
		In a real case, a library would add the proper type for each individual schema type/format, though the default
		will always remain as a fallback.
		
		** Important ** it is not DataTypes that should know about possible editors,
		it is the library that should register its editors with Y.DataTypes when loaded.
	*/
	
	DTs.add(null, null, UI, EDITOR, function (config, schema) {
		return new Y.BaseCellEditor( Y.merge({schema: schema}, config));
	});

}, '0.99' ,{
	requires:['base-build','widget', 'widget-parent', 'widget-child','plugin','widget-stdmod','datatypes', 'gallery-makenode','event-valuechange']
});
