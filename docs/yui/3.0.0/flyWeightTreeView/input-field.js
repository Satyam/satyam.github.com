/*jslint nomen: true, white: true, browser: true, maxerr: 100 */
/*global YUI *//**
 * @module treenode
 */
YUI.add('input-field', function (Y, NAME) {
	'use strict';
	var Lang = Y.Lang,
	
		Input = Y.Base.create(
			NAME,
			Y.FlyweightNode,
			[],
			{

			},
			{
				TEMPLATE: '<div id="{id}" class="{cname_node}"><label>{label}</label><input name="{name}" value="{value}" /></div>',
				ATTRS: {
					name: {
						validator: Lang.isString,
						getter: function () {
							return this._node.name || '';						
						},
						setter: function (value) {
							this._node.name = value;
						}
					},
					value: {
						getter: function () {
							return this._node.value || '';						
						},
						setter: function (value) {
							this._node.value = String(value);
						}
					}

				}

			}
		);
		
	Y.InputField = Input;


}, '@VERSION@' ,
{
	requires: ['flyweightnode','base-build']
});
