/*jslint devel: true,  undef: true, newcap: true, strict: true, maxerr: 50, browser: true,continue: true */
/*global YUI */

YUI.add('baseUI',function(Y) {
	"use strict";
	var BASEUI = 'BaseUI',
		VISIBLE = "visible",
		HIDDEN = "hidden",
		DISABLED = "disabled",
		ID = "id",
		RENDER = "render",
		RENDERED = "rendered",
		DESTROYED = "destroyed",
		STRINGS = "strings",
		CHANGE = "Change",
		_UISET = "_uiSet",
		TRUE = true,
		FALSE = false,

		EMPTY_FN = function() {},
		_toInitialCap = Y.cached(function(str) {
			return str.substring(0, 1).toUpperCase() + str.substring(1);
		});
		
	Y[BASEUI] = Y.Base.create(
		BASEUI,
		Y.Base,
		[],
		{
			UI_EVENTS: null,
			initializer: function (cfg) {
				cfg = cfg || {};
				if (cfg.render) {
					this.render(cfg.render === TRUE?undefined:cfg.render);
				}
				this.UI_EVENTS = [];
				var uiAttrs, i, classes = this._getClasses();
				for (i = classes.length -2;i>0;i--) {
					uiAttrs = classes[i].prototype._UI_ATTRS;
					if (uiAttrs) {
						this._UI_ATTRS = {
							BIND: this._UI_ATTRS.BIND.concat(uiAttrs.BIND),
							SYNC: this._UI_ATTRS.SYNC.concat(uiAttrs.SYNC)
						};
					}
				}
			},
			destructor: function() {
				while (this.UI_EVENTS.length) {
					this.UI_EVENTS.pop().detach();
				}
			},
			render: function (parentNode) {
				if (this.get(DESTROYED)) {
					return this;
				}
				if (!this.get(RENDERED)) {
					this.publish(RENDER, {
						queuable:FALSE,
						fireOnce:TRUE,
						defaultTargetOnly:TRUE,
						defaultFn: this._defRenderFn
					});

					this.fire(RENDER, {parentNode: parentNode || null});
					return this;
				}
			},
			_defRenderFn : function(ev) {
				this._parentNode = ev.parentNode;
				 
				this.renderer();
				this._set(RENDERED, TRUE);

			},
			renderer: function() {
				var widget = this;

				widget._renderUI();
				widget.renderUI();

				widget._bindUI();
				widget.bindUI();

				widget._syncUI();
				widget.syncUI();
			},

			bindUI: EMPTY_FN,
			renderUI: EMPTY_FN,
			syncUI: EMPTY_FN,

			hide: function() {
				return this.set(VISIBLE, FALSE);
			},

			show: function() {
				return this.set(VISIBLE, TRUE);
			},

			enable: function() {
				return this.set(DISABLED, FALSE);
			},
			disable: function() {
				return this.set(DISABLED, TRUE);
			},
			_renderUI: EMPTY_FN,
			
			_bindUI: function() {
				this._bindAttrUI(this._UI_ATTRS.BIND);
			},
			_syncUI: function() {
				this._syncAttrUI(this._UI_ATTRS.SYNC);
			},
			_guid : function() {
				return Y.guid();
			},
			_bindAttrUI : function(attrs) {
				var i, 
					l = attrs.length; 

				for (i = 0; i < l; i++) {
					this.after(attrs[i] + CHANGE, this._setAttrUI);
				}
			},

			_syncAttrUI : function(attrs) {
				var i, l = attrs.length, attr;
				for (i = 0; i < l; i++) {
					attr = attrs[i];
					this[_UISET + _toInitialCap(attr)](this.get(attr));
				}
			},

			_setAttrUI : function(e) {
				this[_UISET + _toInitialCap(e.attrName)](e.newVal, e.src);
			},
			_strSetter : function(strings) {
				return Y.merge(this.get(STRINGS), strings);
			},

			getString : function(key) {
				return this.get(STRINGS)[key];
			},

			getStrings : function() {
				return this.get(STRINGS);
			}		
		},
		{
			UI_SRC: 'ui',
			ATTRS: {
				id: {
					valueFn:'_guid',
					writeOnce:TRUE
				},
				rendered: {
					value:FALSE,
					readOnly:TRUE
				},
				disabled: {
					value: FALSE
				},
				visible: {
					value: TRUE
				},
				render: {
					value: FALSE,
					writeOnce: TRUE
				},
				strings: {
					value: {},
					setter: "_strSetter",
					getter: "_strGetter"
				}
			}
		}
	);
},0.9,{
	requires:['base']
});