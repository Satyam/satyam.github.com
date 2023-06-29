/*jslint nomen: true, white: true, browser: true, maxerr: 100 */
/*global YUI */
/**
 * @module treeview
 */
YUI.add('treeview', function (Y, NAME) {
	'use strict';
	var CBX = 'contentBox',

		/**
		 * Creates a Treeview using the FlyweightManager extension to handle its nodes.
		 * It creates the tree based on an object passed as the `tree` attribute in the constructor.
		 * @example
		 *
	var tv = new Y.TreeView({tree: [
		{
			label:'label 0',
			children: [
				{
					label: 'label 0-0',
					children: [
						{label: 'label 0-0-0'},
						{label: 'label 0-0-1'}
					]
				},
				{label: 'label 0-1'}
			]
		},
		{label: 'label 1'}

	]});
	tv.render('#container');
		 * @class TreeView
		 * @constructor
		 * @param config {Object} Configuration attributes
		 */
		TV = Y.Base.create(
			NAME,
			Y.Widget,
			[Y.FlyweightManager],
			{
				/**
				 * Widget lifecycle method
				 * @method initializer
				 * @param config {object} configuration object of which 
				 * `tree` contains the tree configuration.
				 */
				initializer: function (config) {
					this._domEvents = ['click'];
					this._loadConfig(config.tree);
				},
				/**
				 * Widget lifecyle method
				 * I opted for not including this method in FlyweightManager so that
				 * it can be used to extend Base, not just Widget
				 * @method renderUI
				 * @protected
				 */
				renderUI: function () {
					this.get(CBX).setContent(this._getHTML());
				},
				/**
				 * Overrides the default CONTENT_TEMPLATE to make it an unordered list instead of a div
				 * @property CONTENT\_TEMPLATE
				 * @type String
				 */
				CONTENT_TEMPLATE: '<ul></ul>'

			},
			{
				ATTRS: {
					/**
					 * Override for the `defaultType` value of FlyweightManger
					 * so it creates TreeNode instances instead of the default.
					 * @attribute defaultType
					 * @type String
					 * @default 'TreeNode'
					 */
					defaultType: {
						value: 'TreeNode'
					}

				}

			}
		);
		
	Y.TreeView = TV;
	
}, '@VERSION@' ,
{
	requires: ['flyweightmanager', 'widget','base-build', 'treenode']
});
