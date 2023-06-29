/*jslint nomen: true, white: true, browser: true, maxerr: 100 */
/*global YUI *//**
 * @module treenode
 */
YUI.add('field-set', function (Y, NAME) {
	'use strict';
	var Lang = Y.Lang,
	
		FS = Y.Base.create(
			NAME,
			Y.FlyweightNode,
			[],
			{

			},
			{
				TEMPLATE: '<fieldset id="{id}" class="{cname_node} {cname_children}"><legend>{label}</legend>{children}</fieldset>',
				ATTRS: {

				}

			}
		);
		
	Y.FieldSet = FS;


}, '@VERSION@' ,
{
	requires: ['flyweightnode','base-build']
});
