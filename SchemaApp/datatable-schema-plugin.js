YUI.add('datatable-schema-plugin', function (Y) {
	"use strict";
	/*
		This is a plugin that reads and schema and sets the column definitions of a DataTable
		with information taken from the JSON-Schema and Y.DataTypes
	*/
	var DTs = Y.DataTypes,
		UI = DTs.UI,
		FORMATTER = DTs.FORMATTER;
		
	Y.DataTableSchemaPlugin = Y.Base.create(
		'datatable-schema-plugin',
		Y.Plugin.Base,
		[],
		{
			initializer: function (config) {
				var host = config.host,
					colDefs = [],
					schema = config.schema;
				
				host.set('caption', schema.description || schema.name);
				
				Y.each(schema.properties, function (fieldDefs, name) {
					colDefs.push({
						key: name,
						label: fieldDefs.title || fieldDefs.description,
						formatter: function (o) {
							return DTs.invoke(fieldDefs, UI, FORMATTER, o.value);
						}
					});
				});
				host.set('columnset',colDefs);
			}
		},
		{
			NS:'DataTableSchemaPlugin',
			ATTRS: {
				schema: {
				}
			}
		}
	);
	
}, '0.99' ,{
	requires:['base-build','plugin','datatypes']
});