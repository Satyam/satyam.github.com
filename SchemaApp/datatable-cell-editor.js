YUI.add('datatable-cell-editor', function (Y) {
	"use strict";
	
	var BBX = 'boundingBox',
		SCHEMA  = 'schema',
		EDITOR = 'editor',
		PARENT = 'parentNode',
		
		DTs = Y.DataTypes,
		UI = DTs.UI,
		FORMATTER = DTs.FORMATTER;
	/*
		This plugin allows for cell editing, it uses the editor configured in Y.DataTypes which,
		in these tests is a very simple input box for all fields.
	*/
	
	Y.DataTableCellEditor = Y.Base.create(
		'datatable-cell-editor',
		Y.Plugin.Base,
		[],
		{
			initializer: function (config) {
				var host = config.host,
					schema = config[SCHEMA],
					column,
					editor,
					bbx = host.get(BBX);
				
				Y.each(schema.properties, function (fieldDefs, name) {
					column = host.get('columnset').keyHash[name];
					column.addAttr(EDITOR, {});
					editor = DTs.invoke(fieldDefs, UI, EDITOR, {
						plugins:[Y.FloatingFieldPlugin]
					}).render(bbx);
					column.set(EDITOR, editor);
					editor.after('cellEditorSave', this._saveCellEditor, this);
				}, this);
				bbx.delegate('click', this._afterCellClick, '.yui3-datatable-liner', this);
			},
			_afterCellClick: function (ev) {
				var dt = this.get('host'),
					liner = ev.target,
					td = liner.ancestor('td'),
					tr = td.get(PARENT);
				if (tr.get(PARENT).hasClass('yui3-datatable-data')) {
					var record = dt.get('recordset').getRecord(tr.get('id')),
						column = dt.get('columnset').keys[td.get('cellIndex')],
						key = column.get('key'),
						editor = column.get(EDITOR);
					if (this._openEditor) {
						this._openEditor.set('visible', false);
					}
					this._openEditor = editor;
					this._key = key;
					this._record = record;
					this._liner = liner;
					editor.setAttrs({
						visible: true,
						node: td,
						value: record.getValue(key)
					});
				}
			},
			_openEditor: null,
			_record: null,
			_key: null,
			_liner: null,
			_saveCellEditor: function (ev) {
				var record = this._record,
					key = this._key,
					schema = this._openEditor.get(SCHEMA),
					value = ev.value;
					
				if (record && key) {
					record.get('data')[key] = value;
					this._liner.setContent(DTs.invoke(schema, UI, FORMATTER, value));
				}
			}
		},
		{
			NS:'DataTableCellEditor',
			ATTRS: {
				schema: {
				}
			}
		}
	);
	Y.Column.prototype._getClassnames = function () {
		return Y.ClassNameManager.getClassName('column', this.get("key"));
	};
}, '0.99' ,{
	requires:['base-build','plugin','datatypes']
});