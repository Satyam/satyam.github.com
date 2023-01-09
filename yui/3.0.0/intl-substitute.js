YUI.add('intl-substitute', function(Y) {

/**
 * String variable substitution and string formatting.
 * If included, the substitute method is added to the YUI instance.
 *
 * @module intl-substitute
 */

    var LBRACE='{', RBRACE='}',
		ACTIVE_LANG = "yuiActiveLang",ROOT_LANG = "yuiRootLang",
		_defModule = '';
	
	Y.mix(Y.namespace("Intl"), {
		setModule: function (module) {
			_defModule = module;
		},
		
		// the only change here is to use _defModule if no specific module has been given	
		get : function(module, key, lang) {
			var mod = this._mod(module || _defModule),
				strs;

			lang = lang || mod[ACTIVE_LANG];
			strs = mod[lang] || {};

			return (key) ? strs[key] : Y.merge(strs);
		},
		
	    add : function(module, lang, strings) {
			lang = lang || ROOT_LANG;
			var explode = function(prefix, strs) {
				Y.each(strs, function (v, k) {
					if (Y.Lang.isObject(v)) {
						delete strs[k];
						explode(prefix + k + '.',v);
					} else {
						if (prefix) {
							strings[prefix + k] = v;
						}
					}
				});
			};
			explode('', strings);
			this._mod(module)[lang] = strings;
			this.setLang(module, lang);
		},



		substitute: function (s, module,lang) {
			var i, j, key, v, lidx = s.length, strs =  this.get(module,undefined,lang);

			for (;;) {
				i = s.lastIndexOf(LBRACE, lidx);
				if (i < 0) {
					break;
				}
				j = s.indexOf(RBRACE, i);
				if (i + 1 >= j) {
					break;
				}

				key = s.substring(i + 1, j);
				v = strs[key];

				if (v) {
					s = s.substring(0, i) + v + s.substring(j + 1);
				}

				lidx = i-1;
			}

			return s;

		},
		
		translateNode: function (node, prefix, module, lang) {
		
			prefix +='.';
			Y.each([
				['label','htmlFor','innerHTML'],
				['input[type=submit],input[type=reset]','value','value'],
				['button,legend,.translate','innerHTML','innerHTML']
			],function (item) {
				var key = item[1],set = item[2],str;
				node.all(item[0]).each(function(el) {
					str = this.get(module,prefix + el.get(key),lang);
					if (str) {
						el.set(set,str);
					}
				},this);
			},this);
		}
			
	},true);


}, '@VERSION@' ,{requires:['intl']});
