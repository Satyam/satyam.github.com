YUI.add('datatypes', function(Y) {
	"use strict";
	/*
		I improved on the original DataTypes by providing methods to help manipulate the data.
		Now, the data is stored under a private variable _types and the methods help you reach it.
		
		Normally, the data would be composed from bits and pieces loaded according to locale and other environment circumstances.
		An entry can be reached via the use() method passing it the schema entry and which side, UI or server you want.
		
		The use() method reads from the _types and merges the information from all levels so that if an entry exists 
		for a particular type and format, it will use that, but it will fall back to the entry for the generic type 
		(without format) if there is no entry for format.  If there is not entry at all, it will default to a basic do-nothing
		set.  Since assembling this datatype entry takes time, the results are cached so that in later requests, the 
		cached value is read.  The cache is emptied if new data is added to the types (not implemented yet).
		
		Method get() takes an schema entry, the side UI or server and what is it that you want.  It returns the value for that
		property.  
		
		Method invoke() takes the schema entry, the side, what function you want to call (usually 'formatter', 'parser',
		'validator' and so on) and any extra arguments the function might need.  It will return the result of that function.
		
		Functions to be called by invoke will receive any values
		the caller to invoke might have passed and a reference to the schema entry, 
		so it could read any extra information stored there.  
		
		The number of arguments a function receives might vary.  It is usually one, the value to be formatted,
		parsed or validated, but other functions might need more.  Thus schemaEntry might not always be the second
		argument, it all depends on how many other values have been passed.  Originally, to avoid this issue
		of getting the schema entry bumped to different positions according to how many values are there,
		I placed it in the first position and then the values, but since the schema entry is rarely used,
		it was really annoying to have it declared just as a placeholder and never used, so I put the
		values firts.
		
		The context for the invoked function will be set to the data type entry.
		This entry is a composition of the specific entries and all the fallback values.  
		Thus, if there is a property formatMask for a particular type, lets say, type:number, format: currency,
		it will have that, if it doesn't, the one for type:number will be available and, since the property
		has no default, if that isn't available, formatMask would be undefined, otherwise you would get that default.
		
		This means that the entries for type/format do not need to repeat information that can be provided at
		the type level.

	*/
	var Lang = Y.Lang,
		PARSER = 'parser',
		FORMATTER = 'formatter',
		UI = 'UI',
		SERVER = 'server',
		SEPARATOR = '|',
		DTs =  null;
	DTs = {
		PARSER: PARSER,
		FORMATTER: FORMATTER,
		UI: UI,
		SERVER: SERVER,
		
		get: function (schemaEntry, side, what) {
			return DTs.use(schemaEntry, side)[what];
		},
		invoke: function (schemaEntry, side, what) {
			var branch = DTs.use(schemaEntry, side),
				args = Y.Array(arguments).slice(3);
			args.push(schemaEntry);
			if (branch[what]) {
				return branch[what].apply(branch, args);
			}
		},
		use: function (schemaEntry, side) {
			/* In order for Y.cached to work, the method needs to receive string arguments
			   or objects whose toString() method produces unique strings so that cached
			   can used them as keys.  Since schemaEntry has no toString() method,
			   the fallback is Object.toString() which produces [object: object] or
			   something like that, the very same key for all entries so it would always
			   return the same value.  That's why I had to expand it.
			*/
			return this._use(schemaEntry.type, schemaEntry.format, side);
		},
		_flush: function  (type, format) {
			var c = DTs._cache;
			type = type || '';
			if (format) {
				type += SEPARATOR + format;
			}
			Y.each(c, function (value, key) {
				if (key.indexOf(type) === 0) {
					delete c[key];
				}
			});
		},
		
		add: function (type, format, side, entry, value) {
			var self = this, item, next;
			if (value) {
				item = DTs._types;
				if (format) {
					type = type + SEPARATOR + format;
				}
				
				next = type?item[type]:DTs._defaults;
				if (!next) {
					next = item[type] = {};
				}
				item = next;
				next = item[side];
				if (!next) {
					next = item[side] = {};
				}
				next[entry] = value;
				this._flush(type, format);
				return;
			} 
			if (Lang.isObject(entry)) {
				Y.each(entry, function (values, entry) {
					self.add(type, format, side, entry, values);
				});
				return;
			}
			if (Lang.isObject(side)) {
				Y.each(side, function (values, side) {
					self.add(type, format, side, values);
				});
				return;
			}
					
			if (Lang.isObject(format)) {
				Y.each(format, function (values, format) {
					self.add(type, format, values);
				});
				return;
			}
			if (Lang.isObject(type)) {
				Y.each(type, function (values, type) {
					self.add(type, values);
				});
				return;
			}
			Y.log('If it ever reaches this far, it is an error','error','datatypes');
		},

		_cache: {},
		_defaults: {
			UI: {
				formatter: function (value) {
					return value;
				},
				parser: function (value) {
					return value;
				},
				validator: function() {
					return null;
				}
			},
			server: {
				formatter: function (value) {
					return value;
				},
				parser: function (value) {
					return value;
				}
			}
				
		},
		_types: {
			'string|date-time': {
				UI: {
					formatMask: '%d/%b/%Y %T',
					formatter: function (value) {
						return Y.DataType.Date.format(value, {format:this.formatMask});
					},
					parser: function (value) {
						return Date.parse(value);
					}
				},
				server: {
					// YYYY-MM-DDThh:mm:ssZ
					formatMask:'%FT%T%Z',
					formatter: function (value) {
						return Y.DataType.Date.format(value, {format: this.formatMask});
					},
					// this one would fail in so many ways that it's worthless, but for an example, it will do.
					parser: function (value) {
						var tmz = value.substr(-1),  // I am doing nothing with the timezone, though I should :P
							a = value.substr(0,value.length -1);
						a = a.split('T');
						a[0] = a[0].split('-');
						a[1] = a[1].split(':');
						return new Date(a[0][0],a[0][1] -1 ,a[0][2],a[1][0],a[1][1],a[1][2]);
					}
				}
			},
			'integer': {
				UI: {
					formatter: function (value) {
						return value.toString();
					},
					parser: function (value) {
						return parseInt(value, 10);
					}
				},
				server: {
					formatter: function (value) {
						return value.toString();
					},
					parser: function (value) {
						return parseInt(value, 10);
					}
				}
			},
			'number': {
				UI: {
					formatter: function (value) {
						return String(value);
					},
					parser: function (value) {
						return parseFloat(value);
					}
				},
				server: {
					formatter: function (value) {
						return String(value);
					},
					parser: function (value) {
						return parseFloat(value);
					}
				}
			},
			'number|currency': {
				UI: {
					formatter: function (value) {
						return Y.DataType.Number.format(value, {
							suffix:'€',
							decimalPlaces:2,
							decimalSeparator: ',',
							thousandsSeparator:'.'
						});
					},
					parser: function (value) {
						return parseFloat(value.replace(/[€\.]/g,'').replace(',','.'));
					}
				},
				server: {
					formatter: function (value) {
						return value.toString();
					},
					parser: function (value) {
						return parseFloat(value);
					}
				}
			}
		}
	};	
	
	// I had to put this method here because the last argument, DTs._cache
	// gives an error if defined within DTs because DTs itself is not defined
	// at that point.
	DTs._use = Y.cached(function (type, format, side) {
		var t = DTs._types[type],
			f = format?DTs._types[type + SEPARATOR + format]:{};
		return Y.merge(
			DTs._defaults[side],
			(t?t[side]:{}),
			(f[side] || {})
		);
	}, DTs._cache);
	
	
	Y.DataTypes = DTs;
	
}, '0.99' ,{
	requires:['datatype']
});