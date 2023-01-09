/*
Copyright (c) 2009, Daniel Barreiro (a.k.a. Satyam). All rights reserved.
satyam at satyam dot com dot ar (yes, it ends with ar)
It is the intention of the author to make this component freely available for use along the YAHOO User Interface Library
so it is licensed with the same BSD License: http://developer.yahoo.net/yui/license.txt

This is experimental code, not a supported product
*/ 

YAHOO.util.YQLDataSource = function (oLiveData, oConfigs) {
	oLiveData = oLiveData || 'http://query.yahooapis.com/v1/public/yql?format=json&q=';
	YAHOO.util.YQLDataSource.superclass.constructor.call(this, oLiveData, oConfigs); 
};

YAHOO.lang.extend(YAHOO.util.YQLDataSource, YAHOO.util.ScriptNodeDataSource, {
	responseType:YAHOO.util.DataSource.TYPE_JSON,
	parseJSONData: function  ( oRequest , oFullResponse ) {	
		var i,q = oFullResponse.query.results,
			rSch = this.responseSchema,
			m = rSch.metaFields,
			fs = {};
			
		// fill in the responseSchema.metaFields object to retrive the meta information provided by YQL
		// without overwriting any such information set by the user
		if (!m) {
			m = rSch.metaFields = {};
		}
		m.count = m.count || 'query.count';
		m.created = m.created || 'query.created';
		m.lang = m.lang || 'query.lang';
			
		// if there is a fields list in the responseSchema, we loop through it recording in fs the name of those fields
		// whose definition was given by the user.  This list will later help us tell those we add from the query 
		// from those that were provided by the user.
		// If there is no fields list, we create an empty one.
		if ('fields' in rSch  && rSch.fields.length) {
			for (i = 0;i < rSch.fields.length;i++) {
				fs[rSch.fields[i].key || rSch.fields[i]] = i;
			}
		} else {
			rSch.fields = [];
		}
		
		// This method reads the field names of a record and, if they weren't already defined by the user
		// we push them into the responseSchema.fields array.
		// Since the fields can have nested fields, this function is called recursively concatenating the
		// field names with dots in between.
		var pushFields = function(node,prefix) {
			if (prefix) {
				prefix += '.';
			} else {
				prefix = '';
			}
			for (var field in node) {
				// we check if the field is in the fs array, which means the user has defined it
				// if so, we leave it alone
				if (node.hasOwnProperty(field) && !(field in fs)) {
					if (YAHOO.lang.isObject(node[field])) {
						pushFields(node[field],prefix + field);
					} else {
						rSch.fields.push(prefix + field);
					}
				}
			}
		};
		
		// if the result set is empty, it won't return an empty array but null
		if (q === null) {
			q = {dummy:[]};
		}
		// For some reason, the YQL results come nested under one property under query.results.  
		// That property changes from one query to the next so the only way to find out is to 
		// loop though all properties under query.results.  Since there is only one property,
		// whatever it is, we'll take that one, unless the user explicitly set one.
		for (var list in q) {
			if (q.hasOwnProperty(list)) {
				rSch.resultsList = rSch.resultsList || 'query.results.' + list;
				// if the result set contains a single item, it will not be an array with that single item
				// but the item itself so, if it is not an array, we make it one.
				if (!YAHOO.lang.isArray(q[list])) {
					q[list] = [q[list]];
				}
				// we go an fill in the responseSchema.fields array with the fields 
				// of the very first record received (we cannot but trust it has a complete list of fields)
				pushFields(q[list][0]);
				
				// now we let Datasource JSON parser handle the response based on those fields
				return YAHOO.util.YQLDataSource.superclass.parseJSONData.apply(this,arguments);
			}
		}
	},
	makeConnection : function(oRequest, oCallback, oCaller) {
		YAHOO.util.YQLDataSource.superclass.makeConnection.call(this,encodeURIComponent(oRequest),oCallback,oCaller);
	}
});

YAHOO.lang.augmentObject(YAHOO.util.YQLDataSource, YAHOO.util.DataSourceBase);
