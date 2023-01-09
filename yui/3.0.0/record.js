/**
 * The recordset module provides a standard way to store tabular data, load it from any DataSource
 * and serialize it in several formats.  It can also keep meta-information about that data
 * such as parsers, formatters and labels
 * @module recordset
 */

YUI.add('recordset', function (Y) {
	var Lang = Y.Lang,
		getClassName = Y.ClassNameManager.getClassName,

	
		FIELD_DEF = 'FieldDef',
		FIELD_DEF_SET = 'FieldDefSet',
		FIELD = 'Field',
		RECORD = 'Record',
		RECORDSET = 'RecordSet',
		NEW = 'new',
		DIRTY = 'dirty',
		DELETED = 'deleted',
		JOINT = '',
		
		NAME = 'name',
		DATASOURCE = 'dataSource',
		SERIALIZE_FORMAT = 'serializeFormat',
		SERIALIZE_DIRTY_ONLY = 'serializeDirtyOnly',
		PRIMARY_KEY = 'primaryKey',
		SORTED_BY = 'sortedBy',
		SORT_COMPARE = 'sortCompareFunction',
		TYPE = 'type',
		SERVER = 'server',
		UI = 'ui',
		CHILDREN = 'children',
		ROOT = 'root',
		PARENT = 'parent',
		VALUE = 'value',
		OLD_VALUE = 'oldValue',
		INITIAL_VALUE = 'initialValue',
		
		TRAVERSE_DEEP = 'traverseDeep',
		TRAVERSE_SHALLOW = 'traverseShallow',
		TRAVERSE_LEAVES = 'traverseLeaves',
		
		LOAD_DATA_EVENT = 'loadData',
		LOAD_FAIL_EVENT = 'loadFail',
		
		INFO = 'info',
		WARN = 'warn',
		ERROR = 'error';
	/**
	 * Stores definitions for a field
	 * @class FieldDef
	 * @uses Y.Attribute
	 */
	var FieldDefSet; // Just to avoid a forward reference
	var FieldDef = Y.Base.create(
		FIELD_DEF,
		Y.Base,
		[],
		{
			/**
			 * Reference to the parent of this definition or null if none
			 * @property _parent
			 * @type FieldDef
			 * @default null
			 * @private
			 */
			_parent: null,
			/** 
			 * Reference to the top-most field definition or to itself if at the top
			 * @property _root
			 * @type FieldDef
			 * @default null
			 * @private
			 */
			_root:null,
			/**
			 * Adds a child item to the array of children at the given index or at the end of none
			 * @method add
			 * @param item {FieldDef or object} Definition to be added
			 * @param index {integer} (optional) Position to add the definition
			 */
			add: function (item, index) {
				var children = this.get(CHILDREN);
				if (children) {
					children.add(item, index);
				}
			},
			/**
			 * Returns the number of children under this defition
			 * @method getChildCount
			 * @return {integer} Number of children
			 */
			getChildCount: function() {
				var children = this.get(CHILDREN);
				return (children && children.size()) || 0;
			}
		},
		{
			ATTRS: {
				/**
				 * Name of the field for this definition. 
				 * @attribute name
				 * @type string
				 * @default null
				 */
				name: {
					value:null,
					validator: Lang.isString,
					lazyAdd:false
				},
				/**
				 * Label to be shown for this field (defaults to field name)
				 * @attribute label
				 * @type string
				 * @default null
				 */
				label: {
					value: null,
					validator: Lang.isString,
					getter: function (value) {
						return value || this.get(NAME);
					}
				},
				/**
				 * Provided as an internal-use setting to read the parent of this node
				 * even before the initializer method gets called.
				 * The parent is required to find out the root, which is used in setting some of the other attributes
				 * @attribute _parent
				 * @type FieldDef
				 * @private
				 */
				_parent: {
					setter: function (value) {
						this._parent = value;
						this._root = (value && value._root) || this;
						return Y.Attribute.INVALID_VALUE;
						
					},
					lazyAdd:false
				},
				/**
				 * Reference to the parent of this definition
				 * @attribute parent
				 * @type FieldDef
				 * @readOnly
				 */
				parent: {
					readOnly: true,
					getter: function() {
						return this._parent;
					}
				},
				/**
				 * Reference to the top-most definition containing this definition
				 * @attribute root
				 * @type FieldDef
				 * @readOnly
				 */
				root: {
					readOnly: true,
					getter: function() {
						return this._root;
					}
				},
				
				/**
				 * Definitions of fields group under this field
				 * @attribute children
				 * @type FieldDefs
				 * @default null
				 */
				children: {
					value: null,
					validator: function(value) {
						if (! Lang.isArray(value)) {
							return false;
						}
						if (this.get(TYPE) || this.get('server.parser') || this.get('server.formatter') || this.get('ui.parser') || this.get('ui.formatter') || this.get(INITIAL_VALUE) || this.get(PRIMARY_KEY)) {
							Y.log("Can't define 'children' on fields that already have a 'type', 'server', 'ui', 'initialValue' or 'primaryKey' defined", ERROR, FIELD_DEF);
							return false;
						}
						return true;
					},
					setter: function (value) {
						if (Lang.isNull(value)) {
							return Y.Attribute.INVALID_VALUE;
						}
						if (value instanceof FieldDefSet) {
							FieldDefSet._parent = this;
							return value;
						}
						return new FieldDefSet(value,this);
					},
					lazyAdd:false
				},
					
				/**
				 * Formatting and parsing functions for exchanging data with the server
				 * @attribute server
				 * @type {object}
				 */
				server: {
					value: {
						/**
						 * Function to be used for parsing the field when it is received from the server
						 * @attribute server.parser
						 * @type function or null
						 * @default null
						 */
						parser:null,
						/**
						 * Function to be used for formatting the field value when it is sent to the server
						 * @attribute server.formatter
						 * @type function or null
						 * @default null
						 */
						formatter:null
					},
					validator: function (value, name) {
						if (this.get(CHILDREN)) {
							Y.log("Can't set attribute 'server' on a field with children",ERROR, FIELD_DEF);
							return false;
						}
						var check = function (fn) {
							return Lang.isNull(fn) || Lang.isFunction (fn);
						};
						switch (name) {
							case 'server':
								return ('parser' in value?check(value.parser):true) && ('formatter' in value? check(value.formatter):true);
							case 'server.parser':
								return check(value.parser);
							case 'server.formatter':
								return check(value.formatter);
							default:
								return false;
						}
					}
				},
				/**
				 * Formatting and parsing functions for exchanging data with the user
				 * @attribute ui
				 * @type {object}
				 */
				ui: {
					value: {
						/**
						 * Function to be used for parsing the field when it is received from some user input component
						 * @attribute ui.parser
						 * @type function or null
						 * @default null
						 */
						parser:null,
						/**
						 * Function to be used for formatting the field value when it is presented to the user
						 * @attribute ui.formatter
						 * @type function or null
						 * @default null
						 */
						formatter:null
					},
					validator: function (value, name) {
						if (this.get(CHILDREN)) {
							Y.log("Can't set attribute 'ui' on a field with children",ERROR, FIELD_DEF);
							return false;
						}
						var check = function (fn) {
							return Lang.isNull(fn) || Lang.isFunction (fn);
						};
						switch (name) {
							case 'ui':
								return ('parser' in value?check(value.parser):true) && ('formatter' in value? check(value.formatter):true);
							case 'ui.parser':
								return check(value.parser);
							case 'ui.formatter':
								return check(value.formatter);
							default:
								return false;
						}
					}
				},
				/**
				 * DataType information.  It should be a reference to any of the types stored in DataType.Types
				 * @attribute type
				 * @type string
				 * @default null
				 */
				type: {
					validator: function (value) {
						if (this.get(CHILDREN)) {
							Y.log("Can't set attribute 'type' on a field with children",ERROR, FIELD_DEF);
							return false;
						}
						return value in Y.DataType.Types;
					}
				},
				/**
				 * Signals that the field is a primary key.
				 * Fields marked as being a primaryKey will be indexed and can be used to <a href="RecordSet.html#method_search"><code>search</code></a> for Records
				 * They will also be included in any serialized output even when not dirty
				 * @attribute primaryKey
				 * @type Boolean
				 * @default false
				 */
				primaryKey: {
					value:false,
					validator: function (value) {
						if (this.get(CHILDREN)) {
							Y.log("Can't set attribute 'primaryKey' on a field with children",ERROR, FIELD_DEF);
							return false;
						}
						return Lang.isBoolean(value);
					},
					broadcast:1,
					lazyAdd: false
				},
				/**
				 * Initial value for a field when no value is provided.
				 * @attribute initialValue
				 * @type any
				 * @default null
				 */
				initialValue: {
					value: null,
					validator: function (value) {
						if (this.get(CHILDREN)) {
							Y.log("Can't set attribute 'initialValue' on a field with children",ERROR, FIELD_DEF);
							return false;
						}
						return true;
					}					
				},
				/**
				 * Function to sort records by when sorted by this field.  
				 * If none provided (the default) the sortCompareFunction attribute 
				 * for the whole RecordSet will be used and finally the regular lexical comparison.
				 * The function will receive:</ol>
				 * <li><code>a</code>: first record to compare</li>
				 * <li><code>b</code>: second record to compare</li>
				 * <li><code>desc</code>: Boolean indicating the sort should be in descending order
				 * <li><code>fieldName</code>: Name of the field to sort by
				 * </ol>
				 * @attribute sortCompareFunction
				 * @type function or null
				 * @default null.
				 */
				sortCompareFunction: {
					value: null,
					validator: function (value) {
						return Lang.isFunction(value) || Lang.isNull(value);
					}
				}
				
			}
		}
	);
	Y[FIELD_DEF] = FieldDef;
	
	/**
	 * Collection of FieldDef instances
	 * @class FieldDefSet
	 * @constructor
	 * @param defs {FieldDef or object} Initial set of definitions
	 * @param _parent {FieldDef} (private) Reference to the parent definition of this collection
	 */
	FieldDefSet = function (defs, _parent) {
		this._init(defs, _parent);
	};
	
	FieldDefSet.prototype = {
		/**
		 * Reference to the top-most FieldDefSet instance
		 * @property _root
		 * @type FieldDefs
		 * @default null
		 * @private
		 */
		_root: null,
		/**
		 * Reference to the FieldDef instance this set is a child of
		 * @property _parent
		 * @type FieldDef
		 * @default null
		 * @private
		 */
		 _parent: null,
		/**
		 * Array containing the names of the fields in this level. 
		 * It is this array that gives the order of the fields when traversing them
		 * @property _items
		 * @type [strings]
		 * @default []
		 * @private
		 */
		_items:null,
		/**
		 * Collection of FieldDef indexed by name.  Valid only on the root FieldDefSet.
		 * @propery _keys
		 * @type object
		 * @default {}
		 * @private
		 */
		_keys:null,
		
		/**
		 * Number of levels of nesting. Valid only on the root FieldDefSet.
		 * @propery _totalDepth
		 * @type integer
		 * @default 0
		 * @private
		 */
		_totalDepth:0,
	
		/**
		 * Initialization method (called by constructor)
		 * @method _init
		 * @param defs {FieldDef or object} Initial set of definitions
		 * @param _parent {FieldDef} (private) Reference to the parent definition of this collection
		 */
		_init: function (defs, _parent) {
			this._items = [];
			this._keys = {};
			this._parent = _parent || null;
			this._root = (this._parent && this._parent._root) || this;
			for (var depth = 0, self = this;self == this._root; self = self._parent) {
				depth++;
			}
			if (depth >= this._totalDepth) {
				this._totalDepth = depth + 1;
			}
			Y.each(defs, this.add, this);
		},

		/**
		 * Adds a field definition at a given position, if provided
		 * @method add
		 * @param item {object or FieldDef} FieldDef to add or object literal to convert to a FieldDef and add
		 * @param index {integer} Position to add this item at (at the end if missing)
		 */
		
		add: function(item, index) {
			var setPrimaryKey = false;
			if (!Lang.isObject(item)) {
				return null;
			}
			if (!(item instanceof FieldDef)) {
				item._parent = this;
				if (item.primaryKey) {
					delete item.primaryKey;
					item = new FieldDef(item);
					setPrimaryKey = true;
				} else {
					item = new FieldDef(item);
				}
			}
			if (!(item instanceof FieldDef)) {
				Y.log('Failed to add field definition',ERROR,FIELD_DEF_SET);
				return null;
			}
			var name = item.get(NAME);
			if (!Lang.isString(name)) {
				Y.log("Field definitions require a NAME attribute", ERROR, FIELD_DEF_SET);
				return null;
			}
			this._root._keys[name] = item;
			if (Lang.isNumber(index) && index >= 0 && index < this._items.length - 1 ) {
				this._items.slice(index,0,name);
			} else {
				this._items.push(name);
			}
			if (setPrimaryKey) {
				// This to make sure event FieldDef:primaryKeyChange is fired
				item.set(PRIMARY_KEY,true);
			}
			return this;
		},
		/**
		 * Returns the total nesting level of the whole tree.
		 * @method getDepth
		 * @return {integer} Total depth of the whole tree
		 */
		getDepth: function () {
			return this._root._totalDepth;
		},
		/**
		 * Traverses the field definitions tree in several ways, calling the provided function for each field definition.
		 * Traversing is done in the order in which the definitions were added, unless added with explicit indices.
		 * @method traverse
		 * @param method {string} Any of the following constants: <ul>
		 * <li><code>FieldDefSet.TRAVERSE_SHALLOW</code> fieldDefs are traversed by level, useful for building HTML table headers</li>
		 * <li><code>FieldDefSet.TRAVERSE_DEEP</code> fieldDefs are traversed going deep into each branch before going to the next, 
		 * useful for building HTML forms with nested fieldSets.</li>
		 * <li><code>FieldDefSet.TRAVERSE_LEAVES</code> only fieldDefs which have no children, lists only the ones that store data</li>
		 * </ul>
		 * @param fn {function} Function to be called for each field definition.
		 * It will receive: <ul>
		 * <li><code>fieldDef</code> Definition for each field</li>
		 * <li><code>depth</code> Level of nesting of this definition</li>
		 * </ul>
		 * @param context {object} (optional) Context to execute the function in (defaults to this FieldDefSet instance)
		 * @param _depth {integer} (private) Used to keep track of the depth in recursive calling.
		 */
		traverse: function(method, fn, context, _depth) {
			var item, pending = [], children, keys = this._root._keys;
			context = context || this;
			_depth = _depth || 0;
			switch (method) {
				case TRAVERSE_DEEP:
					Y.each(this._items, function (name) {
						item = keys[name];
						fn.call(context, item, _depth);
						children = item.get(CHILDREN);
						if (children) {
							children.traverse(method, fn, context, _depth + 1);
						}
					});
					break;
				case TRAVERSE_SHALLOW:
					Y.each(this._items, function (name) {
						item = keys[name];
						children = item.get(CHILDREN);
						if (children) {
							pending.push(children);
						}
						fn.call(context, item, _depth);
					});
					Y.each(pending, function (item) {
						item.traverse(method, fn, context, _depth + 1);
					});
					break;
				case TRAVERSE_LEAVES:
					Y.each(this._items, function (name) {
						item = keys[name];
						children = item.get(CHILDREN);
						if (children) {
							children.traverse(method, fn, context, _depth + 1);
						} else {
							fn.call(context, item, _depth);
						}
					});
					break;
				default:
					Y.log('Unknown traverse method: ' + method, WARN, FIELD_DEF_SET);
			}
		},
		/**
		 * Shortcut to traverse leaves, that is, definitions for fields containing data.
		 * @method each
		 * @param fn {function} Function to be called for each field definition.
		 * It will receive: <ul>
		 * <li><code>fieldDef</code> Definition for each field</li>
		 * <li><code>depth</code> Level of nesting of this definition</li>
		 * </ul>
		 * @param context {object} (optional) Context to execute the function in (defaults to this FieldDefSet instance)
		 */
		each: function(fn, context) {
			this.traverse(TRAVERSE_LEAVES,fn,context);
		},
		/**
		 * Returns the FieldDef with the given name
		 * @method item
		 * @param name {string} Name of the field definition sought
		 * @return {FieldDef} Definition for that field
		 */
		item: function (name) {
			return this._root._keys[name];
		},
		/**
		 * Returns the number of definitions contained in this set at this level
		 * @method size
		 * @return {integer} number of definitions
		 */
		size: function () {
			return this._items.length;
		},
		/**
		 * True if this set has no definitions
		 * @method isEmpty
		 * @return {Boolean} 
		 */
		isEmpty: function () {
			return this._items.length === 0;
		},
		/**
		 * Adds or create a field definition and sets the value for a particular key.
		 * FieldDefs are sought by name at any depth in the definitions tree, but if it doesn't exist, 
		 * it will be created in this set.
		 * @method set
		 * @param name {string} name of the field whose definition is to be set
		 * @param key {string} name of the definition to be set
		 * @param value {any} value to be set
		 */
		
		set: function (name, key, value) {
			var def = this.item(name);
			if (def) {
				def.set(key,value);
			} else {
				var fd = {name: name};
				fd[key] = value;
				this.add(fd);
			}
		},
		/**
		 * Returns the value of a definition for a given field
		 * @method get
		 * @param name {string} Name of the field
		 * @param key {string} Name of the definition
		 * @return {any} value for that definition or Y.Attribute.INVALID_VALUE if no such field is found.
		 */
		get: function (name, key) {
			var def = this.item(name);
			if (def) {
				return def.get(key);
			} else {
				return Y.Attribute.INVALID_VALUE;
			}
		}
		
	};
	/**
	 * Constant to indicate <a href="#method_traverse">traversal</a> method
	 * @property FieldDefSet.TRAVERSE_DEEP
	 * @type string
	 * @static
	 */
	FieldDefSet.TRAVERSE_DEEP = TRAVERSE_DEEP;
	/**
	 * Constant to indicate <a href="#method_traverse">traversal</a> method
	 * @property FieldDefSet.TRAVERSE_SHALLOW
	 * @type string
	 * @static
	 */
	FieldDefSet.TRAVERSE_SHALLOW = TRAVERSE_SHALLOW;
	/**
	 * Constant to indicate <a href="#method_traverse">traversal</a> method
	 * @property FieldDefSet.TRAVERSE_LEAVES
	 * @type string
	 * @static
	 */
	FieldDefSet.TRAVERSE_LEAVES = TRAVERSE_LEAVES;
	Y.augment(FieldDefSet,Y.EventTarget);
	Y[FIELD_DEF_SET] = FieldDefSet;

		
	/**
	 * The Record class provides storage for a single row of data. 
	 * @class Record
	 * @extends Base
	 * @constructor
	 * @param cfg {object} Configuration Attributes
	 */
	
	var Record = Y.Base.create(
		RECORD,
		Y.Base,
		[],
		{
			/**
			 * Array of <a href="Record.Field.html"><code>Record.Field</code></a> objects
			 * @property _fields
			 * @type [Record.Field]
			 * @private
			 */
			_fields: null,
			/**
			 * Adds a new <a href="Record.Field.html"><code>Record.Field</code></a> to the Record
			 * @method addField
			 * @param fieldName {string} Name of the field
			 * @param value {any} initial value
			 * @return Instance of <a href="Record.Field.html"><code>Record.Field</code></a> just added
			 */
			addField: function(fieldName, value) {
				return (this._fields[fieldName] = new Record.Field({name:fieldName,value:value}));
			},
			/**
			 * Returns the instance of <a href="Record.Field.html"><code>Record.Field</code></a> for the field
			 * @method getField
			 * @param fieldName {string} Name of the field
			 * @return {Record.Field} field definition
			 */
			getField: function (fieldName) {
				return this._fields[fieldName];
			},
			/**
			 * Returns the value of a field or an object with all the field values
			 * @method getValue
			 * @param fieldName {string} Optional: if provided it will return the value of that field, 
			 *        otherwise it will return an object literal with all values
			 * @return {any} The value of the field requested, an object with all values or null if the Record is marked as deleted
			 */
			getValue: function (fieldName) {
				if (this.get(DELETED)) {
					return null;
				}
				if (Lang.isString(fieldName)) {
					return (fieldName in this._fields?this._fields[fieldName].get(VALUE)||null:null);
				} else {
					var oData = {};
					this.each(function(field, fieldName) {
						oData[fieldName] = field.get(VALUE);
					});
					return oData;
				}
			},
			/**
			 * Sets the value for a specific field.  If field does not exist, it creates it.
			 * @method setValue
			 * @param fieldName {string} Name of the field
			 * @param value {any} value to be set
			 */
			setValue: function(fieldName, value) {
				if (!(fieldName in this._fields)) {
					this.addField(fieldName);
				}
				var field = this._fields[fieldName];
				if (field.get(VALUE) !== value) {
					field.set(OLD_VALUE,field.get(VALUE));
					field.set(VALUE,value);
					field.set(DIRTY,true);
				}
				
			},
			/**
			 * Loops through each of the fields
			 * @method each
			 * @param fn {function} Function to be executed on each field.  It will receive the Field object and the field name
			 * @param context {object} Context to execute the function in
			 * @return The YUI instance
			 */
			each: function(fn, context) {
				return Y.each(this._fields, fn, context);
			},
			/**
			 * Restores the previous value of a field or of a whole record.  There is only one level of undo.
			 * @method undo
			 * @param fieldName {string} (optional) If provided, it will undo the named field, otherwise, it undoes the whole record
			 */
			undo: function(fieldName) {
				var undoField = function(field) {
					field.set(VALUE,field.get(OLD_VALUE));
					field.set(DIRTY, field.get(VALUE) !== field.get(INITIAL_VALUE));
				};
				if (Lang.isString(fieldName)) {
					undoField(this._fields[fieldName]);
				} else {
					this.each(undoField);
				}
			},
			/**
			 * Restores the initial value of a field or of a whole record
			 * @method reset
			 * @param fieldName {string} (optional) If provided, it will reset the named field, otherwise, it resets the whole record
			 */
			reset: function(fieldName) {
				var resetField = function (field) {
					field.set(VALUE,field.get(INITIAL_VALUE));
					field.set(DIRTY,false);
					field.set(OLD_VALUE,undefined);
				};
				if (Lang.isString(fieldName)) {
					resetField(this._fields[fieldName]);
				} else {
					this.each(resetField);
				}
			},
			/**
			 * Accepts the current value of a field or of whole record as good.  
			 * Used when the Record has been synchronized with the original source 
			 * (usually a database table in the server) 
			 * to signal that the current value has been accepted as good by the server.
			 * @method accept
			 * @param fieldName {string} (optional) If provided, it will accept the named field, otherwise, it accepts the whole record
			 */

			accept: function(fieldName) {
				var acceptField = function (field) {
					field.set(INITIAL_VALUE, field.get(VALUE));
					field.set(OLD_VALUE, field.get(VALUE));
					field.setAttrs({
						dirty:false,
						'new':false
					});
				};
				if (Lang.isString(fieldName)) {
					acceptField(this._fields[fieldName]);
				} else {
					this.each(acceptField);
				}
			},
			/**
			 * Initializer inherited from Y.Base and overridden
			 * @method initializer
			 * @param cfg {object} Initial configuration
			 * If the configuration object has a <code>data</code> property containing an oject literal, 
			 * it will load the Record with those values
			 */
				
			initializer: function(cfg) {
				Y.stamp(this);
				cfg = cfg || {};
				this._fields = {};
				if ('data' in cfg) {
					Y.each(cfg.data,function (value, fieldName) {
						this.addField(fieldName,value);
					}, this);
				}
				Y.after('Field:newChange',this._onNewChange,this);
				Y.after('Field:dirtyChange',this._onDirtyChange,this);
			},		
			_onDirtyChange:function (ev) {
				var target = ev.target, d = false, mine = false;
				this.each(function (field) {
					mine = mine || field == target;
					d = d || field.get(DIRTY);
				});
				if (mine) {
					this._set(DIRTY,d,{fieldName:target.get(NAME)});
				}
			},
			_onNewChange:function (ev) {
				var target = ev.target, n = true, mine = false;
				
				this.each(function (field) {
					mine = mine || field == target;
					n = n && field.get(NEW);
				});
				if (mine) {
					this._set(NEW,n,{fieldName:target.get(NAME)});
				}
			},
			destructor: function() {
				Y.detach('Field:newChange',this._onNewChange,this);
				Y.detach('Field:dirtyChange',this._onDirtyChange,this);
				this.each(function (f) {
					f.destroy();
				});
			}
		},
		{
			ATTRS: {
				/**
				 * True when any of the fields is dirty. Read only.
				 * @attribute dirty
				 * @type Boolean
				 * @readOnly
				 */
				dirty: {
					readOnly:true,
					value:false,
					getter: function(value) {
						return this.get(DELETED) || value;
					}
				},
				/**
				 * True when all the fields are new. Read Only
				 * @attribute new
				 * @type Boolean
				 * @readOnly
				 */
				'new': {
					value:true,
					readOnly:true
				},
				/**
				 * Marks the record as deleted
				 * @attribute deleted
				 * @type Boolean
				 */
				deleted: {
					value:false,
					validator: Lang.isBoolean
				}
			},
			/**
			 * The Record.Field class stores a single piece of data, keeping track of its modified (dirty) or newly created(new)
			 * current, previous and initial values.
			 * @class Record.Field
			 * @constructor
			 * @extends Base
			 * @param value {mixed} initial value for this field
			 */
			Field: Y.Base.create(
				FIELD,
				Y.Base,
				[],
				{
					/**
					 * Ensures the initialValue is set
					 * @method initializer
					 * @param cfg {object} initial configuration
					 */
					initializer: function(cfg) {
						if (VALUE in cfg) {
							if (!(INITIAL_VALUE in cfg)) {
								this.set(INITIAL_VALUE,cfg.value);
							}
						}
					}
				},
				{
					ATTRS: {
						/**
						 * Stores the name for this field
						 * @attribute name
						 * @type string
						 */
						name: {
							validator:Lang.isString
						},
						/**
						 * Stores the value for this field
						 * @attribute value
						 * @type any
						 */
						value:{
						},
						/**
						 * Stores the initial value of the field
						 * @attribute initialValue
						 * @type any
						 */
						initialValue: {
						},
						/**
						 * Stores the most recent previous value. Used for undoing
						 * @attribute oldValue
						 * @type any
						 */
						oldValue:{
						},
						/**
						 * Signals if the field has been newly created instead of loaded from a remote source
						 * @attribute new
						 * @type Boolean
						 */
						'new': {
							value:true,
							validator:Lang.isBoolean,
							broadcast:1,
							lazyAdd: false
						},
						/**
						 * Signals if the value was modified since last created or accepted as good
						 * @attribute dirty
						 * @type Boolean
						 */
						dirty: {
							value:false,
							validator:Lang.isBoolean,
							broadcast:2,
							lazyAdd: false
						}
					}
				}
			)
			
		}
	);
	Y[RECORD] = Record;
	
	

	/**
	 * Represents a collection of Records
	 * @class RecordSet
	 * @extends Base
	 * @uses ArrayList
	 * @constructor
	 * @param cfg {object} Configuration attributes
	 */
	var RecordSet = Y.Base.create(
		RECORDSET,
		Y.Base,
		[],
		{
			/**
			 * Array storing the Records (ArrayList expects it to have this name)
			 * @property _items
			 * @type [Record]
			 * @private
			 */
			_items: null,
			/**
			 * Hash storing the field definitions, indexed by the name of the field
			 * @property _defs
			 * @type {object}
			 * @private
			 */
			_defs: null,
			/**
			 * Index of records indexed by all fields marked as <a  href="RecordSet.FieldDef.html#config_primaryKey"><code>primaryKey</code></a>.
			 * @property _index
			 * @type {object}
			 * @private
			 */
			_index: null,
			
			/**
			 * Loads data from DataSource.  Default function for event <a href="#event_loadData"><code>loadData</code></a>.
			 * @method _defLoadData
			 * @param ev {event} Event object created by <code>loadData</code>
			 * @private
			 */
			_defLoadData: function(ev) {
				var parser, type,  parsers = {};
				this.eachDef(function(fieldDef, fieldName) {
					parser = fieldDef.get('server.parser');
					if (!parser) {
						type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
						if (type) {
							parser = type.server && type.server.parser;
						}
					}
					parsers[fieldName] = parser;
				});
				Y.each(ev.response.results, function(row) {
					var newRow = {};
						
					Y.each(row, function(value, fieldName) {
						if (parsers[fieldName]) {
							newRow[fieldName] = parsers[fieldName](value);
						} else {
							newRow[fieldName] = value;
						}
					},this);
					this.add(new Record({data:newRow}));
				}, this);
			},
			/**
			 * Initializer inherited from Y.Base and overridden
			 * @method initializer
			 * @param cfg {object} Initial configuration (not used)
			 */
			initializer: function(cfg) {
				this._items = [];
				this._index = {};
				Y.stamp(this);

				Y.after('FieldDef:primaryKeyChange',this._reIndex ,this);
				Y.mix(RecordSet.Serializers, {
					JSON:Y.JSON && Y.JSON.stringify,
					XML:Y.DataType.XML.format,
					URL:RecordSet.serializeURL
				},true);
			},
			/**
			 * Destructor
			 * @method destructor
			 */
			destructor: function() {
				Y.detach('FieldDef:primaryKeyChange',this._reIndex ,this);
				this.each(function (r) {
					r.destroy();
				});
			},
			/**
			 * Adds a Record to the collection.
			 * Overrides ArrayList.add checking that record is an instance of Record and adding indexes if required.
			 * @method add
			 * @param record {Record} Record to be added
			 * @param index {integer} (optional) position to insert it in, otherwise, at the end.
			 * @return {Record} Record just added
			 */
			add: function (record, index) {
				if (record instanceof Record) {
					record.each(function (fieldDef, fieldName) {
						this.setFieldDef(fieldName,{});
					},this);
					var value, branch, initialValue;
					this.eachDef(function (def,fieldName) {
						if (def.get(PRIMARY_KEY)) {
							branch = (branch?branch[value]:this._index);  // yes, I am looking for the branch for the previous value
							value = record.getValue(fieldName);           // now I get the new fieldName value
							if (!(value in branch)) {
								branch[value] = {};
							}
						}
						initialValue = def.get(INITIAL_VALUE);
						if (!(Lang.isNull(initialValue) || record.getField(fieldName))) {
							record.setValue(fieldName, initialValue);
						}
							
					},this);
					if (branch) {
						if (branch[value] instanceof Record) {
							this.remove(branch[value]._yuid, false, function (a, b) {
								return a === b._yuid;
							});
						}
						branch[value] = record;
					}
					Y.ArrayList.prototype.add.apply(this,arguments);
				}
				return record;
			},
			/**
			 * Searches the RecordSet by primaryKey values
			 * @method search
			 * @param needles {value or object} key values of item to be located. 
			 *        For RecordSets with a single primaryKey field, needles can be a string containing the value of the key sought.
			 *        For all, needles is an object containing fieldName: value sets of the key values sought
			 * @return {Record} Record sought or null
			 * !Warning:  For values containing objects, such as Date, use an object literal as search argument, not the plain value
			 */
			search: function (needles) {
				if (Lang.isObject(needles)) {
					var value, branch = this._index;
					this.eachDef(function (def,fieldName) {
						if (def.get(PRIMARY_KEY)) {
							if (!(fieldName in needles)) {
								return null;
							}
							branch = branch[needles[fieldName]];
							if (!branch) {
								return null;
							}
						}
					},this);
					return branch || null;
				} else {
					return this._index[needles] || null;
				}
			},
			/**
			 * Rebuilds the index whenever the <a  href="RecordSet.FieldDef.html#config_primaryKey"><code>primaryKey</code></a> setting of a field is changed
			 * @method _reIndex
			 * @private
			 */
			_reIndex: function(ev) {
				var fieldNames = [], value, branch;
				this.eachDef(function (def, fieldName) {
					if (def.get(PRIMARY_KEY)) {
						fieldNames.push(fieldName);
					}
				});
				this._index = {};
				if (fieldNames.length) {
					this.each(function(record) {
						branch = null;
						Y.each(fieldNames, function (fieldName) {
							branch = (branch?branch[value]:this._index);  // yes, I am looking for the branch for the previous value
							value = record.getValue(fieldName);                 // now I get the new fieldName value
							if (!(value in branch)) {
								branch[value] = {};
							}
						}, this);
						if (branch) {
							branch[value] = record;
						}				
					}, this);
				}

			},
			/**
			 * Sorts by the given field in ascending order unless the second argument says otherwise.
			 * If either exists, it will use the comparison function set in the 
			 * sortCompareFunction for the <a  href="RecordSet.FieldDef.html#config_sortCompareFunction"><code>field</code></a> 
			 * or the <a  href="#config_sortCompareFunction"><code>whole RecordSet</code></a>, in that order.
			 * @method sort
			 * @param fieldName {string} Name of fields to sort the RecordSet by
			 * @param desc {Boolean} sort descending
			 */
			sort: function(fieldName, desc) {
				this.publish('sort',{defaultFn:this._defSortFn});
				this.fire('sort',{
					fieldName:fieldName,
					desc: desc || false
				});
			},
			/**
			 * Compares a couple of values returning integers to be used in sorting functions
			 * @method _valueCompare
			 * @param a {any} first value to compare
			 * @param b {any} second value to compare
			 * @param desc {Boolean} true if comparing in descending order
			 * @return {0, 1 or -1} depending on compare and order
			 * @private
			 */
			// This taken from YAHOO.util.Sort in datatable.js:
			_valueCompare:function(a, b, desc) {
				if((a === null) || (typeof a == "undefined")) {
					if((b === null) || (typeof b == "undefined")) {
						return 0;
					}
					else {
						return 1;
					}
				}
				else if((b === null) || (typeof b == "undefined")) {
					return -1;
				}

				if(a.constructor == String) {
					a = a.toLowerCase();
				}
				if(b.constructor == String) {
					b = b.toLowerCase();
				}
				if(a < b) {
					return (desc) ? 1 : -1;
				}
				else if (a > b) {
					return (desc) ? -1 : 1;
				}
				else {
					return 0;
				}
			},
			/**
			 * Default Record compare function for sort
			 * @method _fieldCompare
			 * @param a {Record} first record to compare
			 * @param b {Record} second record to compare
			 * @param desc {Boolean} true if comparing in descending order
			 * @param fieldName {string} name of the field to sort on
			 * @return {0, 1 or -1} result suitable for Array.sort()
			 * @private
			 */
			_fieldCompare:function (a, b, desc, fieldName) {
				var sorted = this._valueCompare(a.getValue(fieldName),b.getValue(fieldName), desc);
				if(sorted === 0) {
					return this._valueCompare(Y.stamp(a),Y.stamp(b), desc); 
				}
				else {
					return sorted;
				}
			},
			/**
			 * Default sort function for sort event.
			 * @method _defSortFn
			 * @param ev {event} event object
			 * @private
			 */
			_defSortFn: function(ev) {
				var fieldName = ev.fieldName, desc = ev.desc,
					sortedBy = this.get(SORTED_BY),
					sortComp = this.getFieldDef(fieldName,SORT_COMPARE) || this.get(SORT_COMPARE) || this._fieldCompare,
					self = this;
				if (sortedBy && sortedBy.fieldName == fieldName) {
					if (sortedBy.desc != desc) {
						this._items.reverse();
					}
				} else {
					if (Lang.isFunction(sortComp)) {
						this._items.sort(function(a, b) {
							return sortComp.call(self,a,b,desc, fieldName);
						});
					} else {
						this._items.sort();
					}
				}
				this.set(SORTED_BY,{
					fieldName: fieldName,
					desc: desc || false
				});
			},
			_createFieldDef: function(value) {
				var fds = new FieldDefSet(value);
				this._defs = fds;
				return fds;
			},
			/**
			 * Sets or adds definitions for a field
			 * @method setFieldDef
			 * @param fieldName {string} Name of the field to add the definition to
			 * @param key {string or object} Depending on the type, it may:<ul>
			 * <li><i>string</i> Name of <a href="FieldDef.html"><code>FieldDef</code></a> attribute to set (requires third argument)</li>
			 * <li><i>object</i> Object literal with names and values of attributes to set</li>
			 * </ul>
			 * @param value {any} If <code>key</code> is a string, value to be set. Ignored otherwise.
			 * @return {object} new field definition
			 */
			setFieldDef: function(fieldName, key, value) {
				
				var fds = this._defs, fd;
				if (fds instanceof FieldDefSet) {
					if (Lang.isString(key)) {
						fds.set(fieldName,key,value);
					} else if (Lang.isObject(key)) {
						key.name = fieldName;
						Y.each(key, function (value, key) {
							fds.set(fieldName,key,value);
						});
					}
				} else {
					if (Lang.isObject(key)) {
						key.name = fieldName;
						this._createFieldDef([key]);
					} else if (Lang.isString(key)) {
						fd = {name:fieldName};
						fd[key] = value;
						this._createFieldDef([fd]);
					}
				}
			},
			/**
			 * Sets or adds a set of field definitions.  
			 * Takes an object literal with names and FieldDef instances or configuration properties and calls <a href="#method_setFieldDef"><code>setFieldDef</code></a> for each
			 * @method setFieldDefs
			 * @param cfg {object} Object containing definitions to set. It will use the properties as the names of the fields to set
			 */
			setFieldDefs: function(cfg) {
				var fds = this._defs;
				if (!fds) {
					this._createFieldDef();
				}
				Y.each(cfg,function(fieldDef,fieldName) {
					this.setFieldDef(fieldName,fieldDef);
				},this);
			},
			/**
			 * Returns the value of a given attribute for a field  or the whole <a href="RecordSet.FieldDef.html"><code>RecordSet.FieldDef</code></a>
			 * @method getFieldDef
			 * @param fieldName {string} Name of the field
			 * @param key {string} (optional) Name of the attribute to look for
			 * @return if <code>key</code> is provided, the value of the attribute, otherwise, the whole <a href="RecordSet.FieldDef.html"><code>RecordSet.FieldDef</code></a> instance of the filed
			 */
			getFieldDef: function (fieldName, key) {
				if (this._defs) {
					return this._defs.get(fieldName,key);
				} else {
					return Y.Attribute.INVALID_VALUE;
				}
			},
			/**
			 * Loops though each of the field definitions and calls the given function providing it with the instance
			 * of <a href="RecordSet.FieldDef.html"><code>RecordSet.FieldDef</code></a> for a field and the field key
			 * @method eachDef
			 * @param fn {function} A function to be called for each field definition.
			 *        It will receive:<ul>
			 *        <li>def {RecordSet.FieldDef} the field definition instance</li>
			 *        <li>name {string} the name of the field</li>
			 *        </ul>
			 * @param context {object} (optional) the context to execute the function in.  Defaults to this RecordSet
			 */
			eachDef: function(fn,context) {
				if (this._defs) {
					this._defs.each(function(def,depth) {
						fn.call(this,def,def.get(NAME));
					}, context || this);
				}
			},
			/**
			 * Loads the RecordSet with values read from the DataSource instance set in the <code>dataSource</code> configuration attribute
			 * @method sendRequest
			 * @param request {mixed} Request to be passed to DataSource's sendRequest method
			 */
			sendRequest: function (request) {
				var ds = this.get(DATASOURCE);
				if (ds) {
					var self = this;
					ds.sendRequest({
						request: request,
						callback: {
							success: function(ev) {
								/**
								 * Fires when data has been received and loaded
								 * @event loadData
								 * @param ev {event} Event object as received from DataSource.sendRequest
								 */
								self.publish(LOAD_DATA_EVENT,{defaultFn: self._defLoadData});
								self.fire(LOAD_DATA_EVENT, ev);
							},
							failure: function(ev) {
								/**
								 * Fires when data reception has failed
								 * @event loadFail
								 * @param ev {event} Event object as received from DataSource.sendRequest
								 */
								self.fire(LOAD_FAIL_EVENT,ev.error.message);
							}
						}
					});
				}
			},
			/**
			 * Serializes the RecordSet in various formats according to attribute <code>serializeFormat</code>.
			 * If the serializer is not found, it will return the raw array of objects containing the fields to be serialized.
			 * @method serialize
			 * @return {string or [object]} Serialized fields
			 */
			serialize: function() {
				var dirtyOnly = this.get(SERIALIZE_DIRTY_ONLY),
					output = [], recOut,

					formatter, type,  formatters = {}, primaryKeys = {};
				this.eachDef(function(fieldDef, fieldName) {
					if (fieldDef.get(PRIMARY_KEY)) {
						primaryKeys[fieldName] = true;
					}
					formatter = fieldDef.get('server.formatter');
					if (!formatter) {
						type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
						if (type) {
							formatter = type.server && type.server.formatter;
						}
					}
					formatters[fieldName] = formatter;
				});

					
				this.each(function(record) {
					if (! dirtyOnly || record.get(DIRTY)) {
						recOut = {};
						record.each(function(fieldDef,fieldName) {
							if (primaryKeys[fieldName] || !dirtyOnly || fieldDef.get(DIRTY)) {
								if (formatters[fieldName]) {
									recOut[fieldName] = formatters[fieldName](fieldDef.get(VALUE));
								} else {
									recOut[fieldName] = fieldDef.get(VALUE);
								}
							}
						},this);
						output.push(recOut);
					}
				},this);
				var fn = this.get(SERIALIZE_FORMAT);
				if (!Lang.isFunction(fn)) {
					fn = RecordSet.Serializers[fn];
					if (!fn) {
						return output;
					}
				}
				return fn.call(this, output);
			},
			/**
			 * Produces an HTML table out of the RecordSet.
			 * It uses the structure and classNames of YUI2 DataTable but none of its functionality
			 * @method tabulate
			 * @param container {string} CSS3 selector for the container of the table
			 */
			tabulate: function (container) {
				var formatter, type,  formatters = {};
				
				// Resolve formatter to use for all fields and have them handy
				this.eachDef(function(fieldDef, fieldName) {
					formatter = fieldDef.get('ui.formatter');
					if (!formatter) {
						type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
						if (type) {
							formatter = type.ui && type.ui.formatter;
						}
					}
					formatters[fieldName] = formatter;
				});

				var output = ['<table>'], 
					row = ['<thead><tr class="yui-dt-first yui-dt-last">'],
					fds = this._defs,
					totalDepth = fds.getDepth(),
					lastDepth = 0,
					childCount,
					fieldName,
					fieldNames = [],
					fieldDef;
				
				// Traverse the fields definitions in shallow order (by rows) to build the headings
				fds.traverse(FieldDefSet.TRAVERSE_SHALLOW, function(fieldDef, depth) {
					fieldName = fieldDef.get(NAME);
					childCount = fieldDef.getChildCount();
					
					// Changed depth means it is a new row
					if (depth != lastDepth) {
						lastDepth = depth;
						row.push('</tr><tr>');
					}
					row.push(Y.substitute('<th class="yui-dt-col-{sanitizedKey}" rowspan="{rowspan}" colspan="{colspan}"><div class="yui-dt-liner"><span class="yui-dt-label">{label}</span></div></th>', {
						fieldName:fieldName,
						sanitizedKey: fieldName.replace(/[^\w\-]/g,""),
						label:fieldDef.get('label'),
						colspan: childCount || 1,
						rowspan: (childCount?1:totalDepth - depth)
					}));
				});
				row.push('</tr></thead>');
				output.push(row.join(JOINT));
				
				// Traverse the fields defitinions leaves, that is, the ones that have the data
				// and make a list of fieldNames in the proper order
				// traverse() makes sure the order is the same as when it was defined
				fds.traverse(FieldDefSet.TRAVERSE_LEAVES, function (fieldDef,depth) {
					fieldNames.push(fieldDef.get(NAME));
				});
				
				output.push('<tbody class="yui-dt-data">');
				// For each record
				this.each(function(record,index) {
					row = ['<tr class="' + (index === 0?'yui-dt-first ':' ') + (index & 1?'yui-dt-odd':'yui-dt-even') + '">'];
					// read and process the fields in the order of a leaves-only traverse
					Y.each(fieldNames,function(fieldName) {
						fieldDef = {
							value: record.getField(fieldName).get(VALUE),
							sanitizedKey: fieldName.replace(/[^\w\-]/g,"")
						};
						fieldDef.formatted = (formatters[fieldName]?formatters[fieldName](fieldDef.value):fieldDef.value);
						row.push(Y.substitute('<td class="yui-dt-col-{sanitizedKey}"><div class="yui-dt-liner">{formatted}</div></td>', fieldDef));
					});
					row.push('</tr>');
					output.push(row.join(JOINT));
				});
				output.push('</tbody></table>');
				Y.one(container).addClass('yui-dt').appendChild(Y.Node.create(output.join(JOINT)));
			},
			/**
			 * Produces an HTML form out of a Record in the RecordSet.
			 * I'm not trying to be serious with this method, I'm just showing a different traversal method and the possibility of building a form
			 * from a Record instance.  The form doesn't even have <code>method</code> or <code>action</code> HTMLAttributes or buttons to submit it.
			 * @method formalize
			 * @param container {string} CSS3 selector for the container of the table
			 * @param item {integer} Position of the record to be shown.
			 * @param cfg {object} (optional) Additional configuration attributes such as <ul>
			 * <li><code>method</code>: method for the form submit, defaults to GET</li>
			 * <li><code>action</code>: action attribute for the form, defaults to #</li>
			 * <li><code>pager</code>: selector to locate the container for the record paginator</li>
			 * <li><code>submitLabel</code>: label to be shown in the submit button</li>
			 */
			 formalize: function (container, index, cfg) {
				var formatter, type,  formatters = {}, editor, editors = {}, pager, output;
				
				if (cfg.pager && (pager = Y.one(cfg.pager))) {
					output = ['<div class="yui3-pager"><a href="#0">&lt;&lt;</a> <a href="#-">&lt;</a> '];
					for (var i = 0; i < this.size();i++) {
						output.push('<a href="#');
						output.push(i);
						output.push('">');
						output.push(i + 1);
						output.push('</a> ');
					}
					output.push('<a href="#+">&gt;</a> <a href="#');
					output.push(i -1);
					output.push('">&gt;&gt;</a>');
					pager.set('innerHTML',output.join(JOINT));
				}
				
				// Resolve formatter to use for all fields and have them handy
				this.eachDef(function(fieldDef, fieldName) {
					formatter = fieldDef.get('ui.formatter');
					if (!formatter) {
						type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
						if (type) {
							formatter = type.ui && type.ui.formatter;
						}
					}
					formatters[fieldName] = formatter;
					editor = fieldDef.get('ui.editor');
					if (!editor) {
						type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
						if (type) {
							editor = type.ui && type.ui.editor;
						}
					}
					editors[fieldName] = editor;
				});	
				output = ['<form method="', cfg.method || 'GET', '" action="' ,cfg.action || '#' , '">'];
				var row,
					fds = this._defs,
					childCount,
					fieldName,
					fieldId,
					fieldNames = [],
					fieldDef,
					stack =['<input disabled="true" class="yui-form-button" type="submit" value="' + (cfg.submitLabel || 'Ok') + '"</form>'],
					settings,
					record = this.item(index);
				fds.traverse(FieldDefSet.TRAVERSE_DEEP, function(fieldDef, depth) {
					row = [];
					while (stack.length > depth + 1) {
						row.push(stack.pop());
					}
					fieldName = fieldDef.get(NAME);				
					childCount = fieldDef.getChildCount();		
					if (childCount) {
						row.push('<fieldset><legend>');
						row.push(fieldDef.get('label'));
						row.push('</legend>');
						stack[depth + 1] = '</fieldset>';
					} else {
		
						row.push('<div class="yui-form-fieldset-container"><label for="yui-field-');
						row.push(fieldName);
						row.push('">');
						row.push(fieldDef.get('label'));
						row.push('</label><div class="yui-form-field-container" id="yui-field-container-');
						row.push(fieldName);
						row.push('"></div></div>');
					}
					output.push(row.join(JOINT));
				});
				while(stack.length) {
					output.push(stack.pop());
				}
				Y.one(container).addClass('yui-form').set('innerHTML',output.join(JOINT));
				Y.each(editors, function (editor, fieldName) {
					settings = {
						id: 'yui-field-' + fieldName,
						name: fieldName,
						value: (formatters[fieldName]?formatters[fieldName](record.getValue(fieldName)):record.getValue(fieldName))
					};
					if (editor) {
						(new editor(settings).render('#yui-field-container-' + fieldName));
					} else {
						Y.one('#yui-field-container-' + fieldName).set('innerHTML',
							Y.substitute('<input type="text" id="{id}" name="{name}" value="{value}" />',settings));
					}
				});
			}
		},
		{
			ATTRS: {
				/**
				 * Holds a reference to the FieldDefSet instance which defines the properties of the Records stored
				 * @attribute fieldDefSet
				 * @type FieldDefSet
				 */
				fieldDefSet: {
					value: null,
					validator: function (value) {
						if (Lang.isArray(value) || (value instanceof FieldDefSet)) {
							return true;
						}
						return false;
					},
					setter: function (value) {
						if (!(value instanceof FieldDefSet)) {
							if (Lang.isObject(value)) {
								return this._createFieldDef(value);
							} else {
								return Y.Attribute.INVALID_VALUE;
							}
						}
						this._defs = value;
						return value;
					},
					getter: function (value) {
						return this._defs;
					}
				},
				/**
				 * Instance of DataSource to use for loading the RecordSet
				 * @attribute dataSource
				 * @type Y.DataSource
				 * @default null
				 */
				dataSource: {
					validator: function(value) {
						return value instanceof Y.DataSource.Local;
					}
				},
				/**
				 * Format of the RecordSet serialization. 
				 * Can be any of the properties in <a href="#property_RecordSet.Serializers"><code>RecordSet.Serializers</code></a> (built in or added by the developer)
				 * or a function that will receive an object to serialize and should return a string
				 * @attribute serializeFormat
				 * @type string or function
				 * @default "JSON"
				 */
				serializeFormat: {
					value: 'JSON',
					validator: function(value) {
						return (value in RecordSet.Serializers) || Lang.isFunction(value) || Lang.isNull(value);
					}
				},
				/**
				 * Signals that only dirty fields should be included in the serialization
				 * @attribute serializeDirtyOnly
				 * @type Boolean
				 * @default true
				 */
				 
				serializeDirtyOnly: {
					value:true,
					validator: Lang.isBoolean
				},
				/** 
				 * Signals if the RecordSet is sorted, on which field and in which direction.
				 * It contains: <ul>
				 * <li><code>fieldName</code>: Name of the field it is sorted by
				 * <li><code>desc</code>: true if sort was descending
				 * </ul>
				 * @attribute sortedBy
				 * @type object
				 * @default null (not sorted)
				 */
				 sortedBy: {
					value: null,
					validator: function (value) {
						if (Lang.isNull(value)) {
							return true;
						}
						if (Lang.isObject(value)) {
							return this._fields?value.fieldName in this._fields: true;
							// I'll let 'desc' take any Booleanish value, even undefined
						}
						return false;
					}
				},
				/**
				 * Function to sort records by.  If none provided (the default) regular comparisons will be used.
				 * The function will receive:</ol>
				 * <li><code>a</code>: first record to compare</li>
				 * <li><code>b</code>: second record to compare</li>
				 * <li><code>desc</code>: Boolean indicating the sort should be in descending order
				 * <li><code>fieldName</code>: Name of the field to sort by
				 * </ol>
				 * @attribute sortCompareFunction
				 * @type function or null
				 * @default null.
				 */
				sortCompareFunction: {
					value: null,
					validator: function (value) {
						return Lang.isFunction(value) || Lang.isNull(value);
					}
				}
			},
			/**
			 * Serializes an array of objects in www-url-encoded format
			 * @method serializeURL
			 * @param array {array} Array of objects to serialize
			 * @return {string} www-url-encoded output
			 * @static
			 */
			serializeURL: function(array) {
				var output = [],
					serializeRow = function(item, suffix) {
						suffix = suffix +'';
						Y.each(array[item],function(value,fieldName) {
							output.push(encodeURIComponent(fieldName + suffix) + '=' + encodeURIComponent(value));
						});
					};
				
				switch(array.length) {
					case 0:
						return '';
					case 1:
						serializeRow(0,'');
						break;
					default: 
						for (var i = 0;i < array.length;i++) {
							serializeRow(i,i);
						}
						break;
				}
				return output.join('&');
							
			},
			/** 
			 * Hash containing the list of serializers available.  
			 * The developer is expected to add to this list, if so wished.
			 * The following serializers are already set:
			 * <ul><li>"JSON"</li><li>"XML"</li><li>"URL"</li></ul>
			 * @property RecordSet.Serializers
			 * @type {object}
			 * @static
			 */
			Serializers: {}
		}
	);

	Y.augment(RecordSet,Y.ArrayList);
	Y[RECORDSET] = RecordSet;

	var FORM = 'Form',
		PAGER = 'pager',
		METHOD = 'method',
		ACTION = 'action',
		RECORDSET_ATTR = 'recordSet',
		BASE_FIELD = 'BaseField',
		TEXTBOX_FIELD = 'TextBoxField',
		UNEDITABLE_FIELD = 'UneditableField',
		INDEX = 'index',
		classNames = {
			c_form: getClassName(FORM),
			c_content: getClassName(FORM, 'content'),
			c_buttons: getClassName(FORM, 'buttons'),
			c_submit: getClassName(FORM, 'submit'),
			c_clear: getClassName(FORM, 'clear'),
			c_input: getClassName(BASE_FIELD, 'input')
		};
		
	/**
	 * Base for form input fields.  It displays a textBox.
	 * @class Form.BaseField
	 * @extends Widget
	 */
	var BaseField = Y.Base.create(
		BASE_FIELD,
		Y.Widget,
		[],
		{
			/**
			 * Holds a reference to the actual input element
			 * @property _input
			 * @type HTMLElement
			 * @private
			 */
			_input:null
		},
		{
			ATTRS: {
				/**
				 * Name to be given to this field
				 * @attribute name
				 * @type string
				 * @default ''
				 */
				name: {
					value:'',
					validator:Lang.isString
				},
				/**
				 * Text label to be shown along the input element
				 * @attribute label
				 * @type string
				 * @default ''
				 */
				label:{
					value:'',
					validator:Lang.isString
				},
				/**
				 * ID attribute of the form element
				 * @attribute formId
				 * @type string
				 * @default ''
				 */
				formId:{
					value:'',
					validator:Lang.isString
				},
				/**
				 * Value to be shown or entered in this input box
				 * @attribute value
				 */
				value: {
					value:'',
					broadcast:1,
					lazyAdd: false
				}
			}
		}
	);
	
	var TextBoxField = Y.Base.create(
		TEXTBOX_FIELD,
		BaseField,
		[],
		{
			/**
			 * Detaches event listeners
			 * @method destructor
			 */
			destructor:function () {
				this._input.detach('keyup',this._onInputChange,this);
				this._input.detach('paste',this._onInputChange,this);
				this._input.detach('reset',this._onInputChange,this);
				this._input.detach('change',this._onInputChange,this);
				this.detach('valueChange',this._onValueChange);	
			},
			/**
			 * Renders the input element
			 * @method renderUI
			 */
			renderUI:function () {
				var cb = this.get('contentBox');
				cb.appendChild(Y.Node.create(Y.substitute(Y.substitute(TextBoxField.FIELD_TEMPLATE,classNames),this.getAttrs())));
				this._input = cb.one('input');
			},
			/**
			 * Sets listeners for changes in the input textbox and for changes in the value configuration attribute
			 * @method bindUI
			 */
			bindUI:function () {
				this._input.after('keyup',this._onInputChange,this);
				this._input.after('paste',this._onInputChange,this);
				this._input.after('reset',this._onInputChange,this);
				this._input.after('change',this._onInputChange,this);
				this.after('valueChange',this._onValueChange);
			},
			/**
			 * Called whenever there is any change in the input box.
			 * @method _onInputChange
			 * @param ev {Event}
			 * @private
			 */
			_onInputChange: function (ev) {
				this.set(VALUE,ev.target.get(VALUE),{source:'ui'});
			},
			/**
			 * Called whenever the value attribute is changed
			 * @method _onValueChange
			 * @param ev {Event}
			 * @private
			 */
			 
			_onValueChange: function (ev) {
				if (ev.source === 'ui') {
					return;
				}
				var value = ev.newVal + '';
				if (this._input) {
					this._input.set(VALUE,value);
				}
			}
		},
		{
			/**
			 * Template to build the label and input elements with.  
			 * The template will have the classNames substituted in first and then the values
			 * @property FIELD_TEMPLATE
			 * @type string
			 * @static
			 */
			FIELD_TEMPLATE: '<label for="{formId}-{name}">{label}</label><input class="{c_input}" type="text" autocomplete="off" name="{name}" id="{formId}-{name}" />'
		}
	);
		
	var UneditableField = Y.Base.create(
		UNEDITABLE_FIELD,
		BaseField,
		[],
		{
			/**
			 * Holds a reference to the SPAN element that shows the value of the field
			 * @property _span
			 * @type HTMLElement
			 * @private
			 */
			_span:null,
			/**
			 * Detaches event listeners
			 * @method destructor
			 */
			destructor:function () {
				this.detach('valueChange',this._onValueChange);	
			},
			/**
			 * Renders the hidden input element and the span that shows it
			 * @method renderUI
			 */
			renderUI:function () {
				var cb = this.get('contentBox');
				cb.appendChild(Y.Node.create(Y.substitute(Y.substitute(UneditableField.FIELD_TEMPLATE,classNames),this.getAttrs())));
				this._input = cb.one('input');
				this._span = cb.one('span');
			},
			/**
			 * Sets listeners for changes in the value configuration attribute
			 * @method bindUI
			 */
			bindUI:function () {
				this.after('valueChange',this._onValueChange);
			},
			
			/**
			 * Called whenever the value attribute is changed
			 * @method _onValueChange
			 * @param ev {Event}
			 * @private
			 */
			_onValueChange: function (ev) {
				var value = ev.newVal + '';
				if (this._input) {
					this._input.set(VALUE,value);
				}
				if (this._span) {
					this._span.set('innerHTML',value);
				}
			}
		},
		{
			/**
			 * Template to build the label and input elements with.  
			 * The template will have the classNames substituted in first and then the values
			 * @property FIELD_TEMPLATE
			 * @type string
			 * @static
			 */
			FIELD_TEMPLATE: '<label>{label}</label><span  class="{c_input}">{value}</span><input type="hidden" name="{name}" id="{formId}-{name}" />'
		}
	);

	/**
	 * Handles an html form
	 * @class Form
	 * @extends Widget
	 */
	var	Form = Y.Base.create(
		FORM,
		Y.Widget,
		[],
		{
			/**
			 * Hash with UI formatters for each of the fields to be shown, indexed by field name
			 * @property _formatters
			 * @type object
			 * @private
			 */
			_formatters:null,
			/**
			 * Hash with Form.Field instances for each of the fields, indexed by field name
			 * @property _editors
			 * @type object
			 * @private
			 */
			_editors:null,
			/**
			 * Hash with Form.Field classes to be instanced for each of the fields, indexed by field name
			 * @property _editorTypes
			 * @type object
			 * @private
			 */
			_editorTypes: null,
			/**
			 * Hash with parser to accept each of the fields when input, indexed by field name
			 * @property _parsers
			 * @type object
			 * @private
			 */
			_parsers: null,
			/**
			 * Reference to the form element
			 * @property _form
			 * @type HTMLelement (form)
			 * @private
			 */
			_form: null,
			/**
			 * Reference to the container element for the submit and other buttons in the form
			 * @property _buttons
			 * @type HTMLElement
			 * @private
			 */
			_buttons: null,
			/**
			 * Reference to the current Record instance withing the RecordSet being shown 
			 * @property _currentRecord
			 * @type Record
			 * @private
			 */
			_currentRecord: null,
			/**
			 * Initializer called by Base
			 * @method initializer
			 * @param cfg {object} initial configuration attributes
			 */
			initializer: function(cfg) {
				this.after('recordSetChange', this._fillConverters);
				this._fillConverters();
				this._editors = {};
				this.publish('recordIndexChange', {	defaultFn:this._defRecordIndexChange});
				this._defRecordIndexChange();
					
			},
			/**
			 * Destructor called by Base
			 * @method destructor
			 */
			destructor: function() {
				Y.each(this._editors, function (ed,name) {
					ed.detach('valueChange', this._fieldValueChanged,this);
				},this);
				this.detach('recordSetChange', this._fillConverters);
				this.detach('indexChange',this._defRecordIndexChange);
				this.detach('recordSetChange',this._defRecordIndexChange);
				var pager = this.get(PAGER);
				if (pager) {
					pager.detach('click',this._onPagerClick);
				}				
			},
			/**
			 * Renderer called by Widget
			 * @method renderUI
			 */
			renderUI:function() {
				this._renderPager();
				this._renderForm();
			},
			/**
			 * Binds events in the widget, called by Widget
			 * @bindUI
			 */
			bindUI: function() {
				this._bindPager();
				this._bindForm();
			},
			/**
			 * synchs the internal state with the widget that shows it
			 * @method syncUI
			 */
			syncUI: function () {
				this._syncForm();
			},
			/**
			 * Reads the field definitions for each field looking either for the ui set of functions (parser, formatter and editor) 
			 * and stores it in the internal tables for later use.  If a field doesn't have a specific function, it will read
			 * its type atribute and find the standard function for that type
			 * @method _fillConverters
			 * @private
			 */
			_fillConverters: function() {
				var converter, type,
					rs = this.get(RECORDSET_ATTR);
				this._formatters = {};
				this._editorTypes = {};
				this._parsers = {};
				if (rs) {
					var findConverter = function (fieldDef,which) {
						converter = fieldDef.get('ui.' + which);
						if (!converter) {
							type = Y.DataType && Y.DataType.Types && Y.DataType.Types[fieldDef.get('type')];
							if (type) {
								converter = type.ui && type.ui[which];
							}
						}
						return converter;
					};
					rs.eachDef(function(fieldDef, fieldName) {
						this._formatters[fieldName] = findConverter(fieldDef,'formatter');
						this._editorTypes[fieldName] = findConverter(fieldDef,'editor');
						this._parsers[fieldName] = findConverter(fieldDef,'parser');
					},this);	
				}
			},
			/**
			 * Renders the pager
			 * @method _renderPager
			 * @private
			 */
			_renderPager: function () {
				var pager = this.get(PAGER),
					output = ['<div class="yui3-pager"><a href="#0">&lt;&lt;</a> <a href="#-">&lt;</a> '];
				if (!pager) {
					return;
				}
				for (var i = 0; i < this.get(RECORDSET_ATTR).size();i++) {
					output.push(['<a href="#', i, '">', i + 1,	'</a> '].join(JOINT));
				}
				output.push(['<a href="#+">&gt;</a> <a href="#', i - 1, '">&gt;&gt;</a>'].join(JOINT));
				pager.appendChild(Y.Node.create(output.join(JOINT)));
			},
			/**
			 * Binds the pager HTMLelements to the listener
			 * @method _bindPager
			 * @private
			 */
			_bindPager: function() {
				var pager = this.get(PAGER);
				if (pager) {
					pager.delegate('click',this._onPagerClick,'a',this);
				}
			},
			/**
			 * Responds to clicks on the pager controls to move about the Records
			 * @method _onPagerClick
			 * @param ev {Event}
			 * @private
			 */
			_onPagerClick:function(ev) {
				ev.halt();
				var index = ev.target.getAttribute('href').substr(1);
				switch(index) {
					case '+':
						index = this.get(INDEX) + 1;
						if (index >= this.get(RECORDSET_ATTR).size()) {
							index--;
						}
						break;
					case '-':
						index = this.get(INDEX) - 1;
						if (index < 0) {
							index = 0;
						}
						break;
					default:
						index = parseInt(index,10);
				}
				this.set(INDEX,index);
				this._syncForm();
			},

			/**
			 * Binds the index and recordSet change events so the current record can be changed and the screen updated
			 * @method _bindForm
			 * @private
			 */
			_bindForm: function ()  {
				this.after('indexChange',this._defRecordIndexChange);
				this.after('recordSetChange',this._defRecordIndexChange);
				Y.each(this._editors, function (ed,name) {
					ed.after('valueChange', this._fieldValueChanged,this);
				},this);
				this.publish('submit',{defaultFn:this._defSubmitForm});
				this._form.after('submit', function(ev) {
					ev.halt();
					this.fire('submit',{form:this._form});
				},this);
			},
			/**
			 * Default action for the Form:submit event, it submits the form.
			 * @method _defSubmitForm
			 * @param ev {Event}
			 * @private
			 */
			_defSubmitForm: function (ev) {
				this._form.submit();
			},
			/**
			 * Renders the form and its input fields
			 * @method _renderForm
			 * @private
			 */
			_renderForm: function () {
				var yuid = Y.guid(FORM + '-'),
					container = this.get('contentBox'),
					rs = this.get(RECORDSET_ATTR),
					fds = rs && rs._defs,
					childCount,
					fieldName,
					editor;
					
				this._form = Y.Node.create(Y.substitute(
					Y.substitute(Form.FORM_TEMPLATE, classNames),
					Y.mix(this.getAttrs([METHOD,ACTION]),{id:yuid})
				));
				container.appendChild(this._form);
				
				var stack = [container.one('#content-' + yuid)];
				fds.traverse(FieldDefSet.TRAVERSE_DEEP, function(fieldDef, depth) {
					fieldName = fieldDef.get(NAME);				
					childCount = fieldDef.getChildCount();		
					if (childCount) {
						stack[depth+1] = Y.Node.create(Y.substitute(Form.FIELDSET_TEMPLATE,fieldDef.getAttrs(['label'])));
						stack[depth].appendChild(stack[depth+1]);
					} else {
						editor = (fieldDef.get(PRIMARY_KEY)?UneditableField:(this._editorTypes[fieldName] || TextBoxField));
						this._editors[fieldName] = new editor({
							name:fieldName,
							formId:yuid,
							label:fieldDef.get('label')
						}).render(stack[depth]);
					}
				},this);
				this._buttons = Y.Node.create(Y.substitute(
					Y.substitute(Form.BUTTON_TEMPLATE, classNames),
					this.getAttrs(['submitLabel']))
				);
				this._form.appendChild(this._buttons);
			},
			/**
			 * Refreshes the elements in the form with the values in the current record
			 * @method _syncForm
			 * @private
			 */
			_syncForm: function () {
				var r = this._currentRecord,
					formatter, editor;
				if (r) {
					r.each(function (fieldDef,fieldName) {
						formatter = this._formatters[fieldName];
						editor = this._editors[fieldName];
						if (editor) {
							if (formatter) {
								editor.set(VALUE,formatter(r.getValue(fieldName)));
							} else {
								editor.set(VALUE,r.getValue(fieldName));
							}
						}
					
					},this);
					this._buttons.set('disabled',!r.get(DIRTY));
				}				
			},
			/**
			 * Default action for the recordIndexChange event, updates the current record
			 * @method _defRecordIndexChange
			 * @param ev {Event} event object
			 * @private
			 */
			_defRecordIndexChange:function (ev) {
				var rs = this.get(RECORDSET_ATTR);
				if (rs) {
					if (this._currentRecord) {
						this._currentRecord.detach('dirtyChange',this._enableButtons,this);
					}
					this._currentRecord = rs.item(this.get(INDEX));
					this._currentRecord.after('dirtyChange',this._enableButtons,this);
				}
			},
			/**
			 * Enables the submit button if the record is dirty
			 * @method _enableButtons
			 * @param ev {Event}
			 * @private
			 */
			_enableButtons: function(ev) {
				this._buttons.set('disabled',!ev.newVal);
			},
			/**
			 * Saves the value of any changed field to the Record object
			 * @method _fieldValueChanged
			 * @param ev {Event}
			 * @private
			 */
			_fieldValueChanged: function (ev) {
				if (ev.source === 'ui') {
					var name = ev.target.get(NAME),
						parser = this._parsers[name];
					if (parser) {
						this._currentRecord.setValue(name,parser(ev.newVal));
					} else {
						this._currentRecord.setValue(name,ev.newVal);
					}
				}
			}
		},
		{
			ATTRS: {
				/**
				 * Method to be used when submitting the form
				 * @attribute method
				 * @type string
				 * @default 'GET'
				 */
				method: {
					value:'GET',
					validator: Lang.isString
				},
				/**
				 * Default action attribute for the form
				 * @attribute action
				 * @type string
				 * @default '#'
				 */
				action: {
					value:'#',
					validator: Lang.isString
				},
				/**
				 * Label for the submit button
				 * @attribute submitLabel
				 * @type string
				 * @default 'Ok'
				 */
				submitLabel: {
					value:'Ok',
					validator: Lang.isString
				},
				/**
				 * Container for the pager, if any
				 * @attribute pager
				 * @type HTMLElement
				 * @default null
				 */
				pager: {
					value:null,
					setter: function (value) {
						var p = Y.one(value);
						return (p?p:Y.Attribute.INVALID_VALUE);
					}
				},
				/**
				 * RecordSet holding the record being shown
				 * @attribute recordSet
				 * @type RecordSet
				 * @default null
				 */
				recordSet: {
					value:null,
					validator: function (value) {
						return value instanceof RecordSet;
					}
				},
				/**
				 * Index of the Record to be shown
				 * @attribute index
				 * @type integer
				 * @default 0
				 */
				index: {
					value:0,
					validator: function(value) {
						return Lang.isNumber(value) && value >= 0 && value < this.get(RECORDSET_ATTR).size();
					}
				}
			},
			/**
			 * Template to be used in building the form.
			 * @property FORM_TEMPLATE
			 * @type string
			 * @static
			 */
			FORM_TEMPLATE: '<form id="{id}" class="{c_form}" method="{method}" action="{action}"><div class="{c_content}" id="content-{id}"></div><div class="{c_buttons}" id="buttons-{id}"></div></form>',
			/**
			 * Template to be used in building all fieldset elements.
			 * @property FIELDSET_TEMPLATE
			 * @type string
			 * @static
			 */
			FIELDSET_TEMPLATE: '<fieldset><legend>{label}</legend></fieldset>',
			/**
			 * Template to be used in building the buttons in the form.
			 * @property BUTTON_TEMPLATE
			 * @type string
			 * @static
			 */
			BUTTON_TEMPLATE:'<input class="{c_submit}" disabled="true" class="yui-form-button" type="submit" value="{submitLabel}" />'
		}
	);
	Y[FORM] = Form;
	Y[FORM][BASE_FIELD] = BaseField;
	Y[FORM][TEXTBOX_FIELD] = TextBoxField;
	Y[FORM][UNEDITABLE_FIELD] = UneditableField;

	
	/**
	 * Contains a list of converters (parsers and formatters) for several standard formats.
	 * The developer is expected to add custom application converters for his/her own data types to this list.
	 * @class DataType.Converters
	 *
	 */
	
	Y.mix(Y.namespace('DataType.Converters'), {
		/**
		 * Converters for dates used in SQL, DD-MM-YYYY hh:mm:ss
		 * @property DataType.Converters.SQLDate
		 * @type object
		 * @static
		 */
		SQLDate: {
			/**
			 * Parses a date in SQL format  YYYY-MM-DD hh:mm:ss (the time being optional) into a Date() object instance
			 * @property DataType.Converters.SQLDate.parser
			 * @type function
			 * @static
			 */
			parser:function(value) {
				var parts = value.split(' ');
				var datePart = parts[0].split('-');
				if (parts.length > 1) {
					var timePart = parts[1].split(':');
					return new Date(datePart[0],datePart[1]-1,datePart[2],timePart[0],timePart[1],timePart[2]);
				} else {
					return new Date(datePart[0],datePart[1]-1,datePart[2]);
				}
			},
			/**
			 * Formats a Date() object instance into a date in SQL format  YYYY-MM-DD hh:mm:ss
			 * @property DataType.Converters.SQLDate.formatter
			 * @type function
			 * @static
			 */
			formatter:function(value) {
				return Y.DataType.Date.format(value,{format:'%Y-%m-%d %T'});
			}
		},
		/**
		 * Converters for dates used in DD/MM/YYYY format.
		 * Actually, this should use localized formatters and parsers, but DataType.Date.parse does not take locales.
		 * @property DataType.Converters.dmyDate
		 * @type object
		 * @static
		 */
		dmyDate: {
			/**
			 * Parses a date in DD/MM/YYYY format into a Date() object instance
			 * @property DataType.Converters.dmyDate.parser
			 * @type function
			 * @static
			 */
			parser: function(value) {
				var datePart = value.split('/');
				return new Date(datePart[0],datePart[1]-1,datePart[2]);
			},
				
			/**
			 * Formats a Date() object instance into a date in DD/MM/YYYY format
			 * @property DataType.Converters.dmyDate.formatter
			 * @type function
			 * @static
			 */
			formatter:function(value) {
				return Y.DataType.Date.format(value,{format:'%d/%m/%Y'});
			}
		}
	});
	
	/**
	 * Contains a list of converters (and eventually other info) for several types of data, keyed by a given name.
	 * The developer is expected to add custom application types to this list.
	 * @class DataType.Types
	 */
	Y.mix(Y.namespace('DataType.Types'), {
		/**
		 * Just a fake type for testing purposes.
		 * @property DataType.Types.padded
		 * @static
		 */
		padded: {
			server: {
				parser: function(value) {
					return '===[' + value + ']===';
				},
				formatter: function(value) {
					return  value.substr(4,value.length -8);
				}
			},
			ui: {
				parser: function(value) {
					return '===[' + value + ']===';
				},
				formatter: function(value) {
					return  value.substr(4,value.length -8);
				}
			}
		},
		/**
		 * Standard number parsers
		 * @property DataType.Types.number
		 * @type object
		 * @static
		 */
		number: {
			server: {
				parser:function(value) {
					return parseFloat(value);
				}
			},
			ui: {
				parser:function(value) {
					return parseFloat(value);
				}
			}
		},
		/**
		 * Another custom type for testing. 
		 * It references two DataType.Converters for server-side and ui-side conversions
		 * @property DataType.Types.myDate
		 * @type object
		 * @static
		 */
		myDate: {
			server: Y.DataType.Converters.SQLDate,
			ui: Y.DataType.Converters.dmyDate
		}
					

	});
},'0.9',{requires:['base','collection','record','datatype','widget','substitute'],optional:['json']});

