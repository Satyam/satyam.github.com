/*jslint nomen: true, white: true, browser: true, maxerr: 100 */
/*global YUI */
/**
 * Instance of Y.FlyweightNode to represent each node in a TreeView
 * 
 * @module treeview
 * @submodule treenode
 */
YUI.add('treenode', function (Y, NAME) {
	'use strict';
	var Lang = Y.Lang,
		// DOT = '.',
		getCName = Y.ClassNameManager.getClassName,
		cName = function (name) {
			return getCName(NAME, name);
		},
		CNAMES = {
			toggle: cName('toggle'),
			icon: cName('icon'),
			selection: cName('selection'),
			content: cName('content')
		},
		
		/**
		 * Represents a node in a TreeView.
		 * It should not be created independently. They will be created by Y.TreeView based on the configuration provided.
		 * @class TreeNode
		 * @constructor
		 * 
		 */
		
		TN = Y.Base.create(
			NAME,
			Y.FlyweightNode,
			[],
			{
				initializer: function() {
					this.after('click', this._afterClick, this);
				},
				/**
				 * Responds to the click event by toggling the node
				 * @method _afterClick
				 * @param ev {EventFacade}
				 * @private
				 */
				_afterClick: function (ev) {
					var target = ev.domEvent.target;
					if (target.hasClass(CNAMES.toggle)) {
						this.toggle();
					} else if ((target.hasClass(CNAMES.content) || target.hasClass(CNAMES.icon)) && this.get('root').get('toggleOnLabelClick')) {
						this.toggle();
					} else if (target.hasClass(CNAMES.selection)) {
						this.toggleSelection();
					}
				}


			},
			{
				/**
				 * Template to produce the markup for a node in the tree.
				 * @property TEMPLATE
				 * @type String
				 * @static
				 */
				TEMPLATE: Lang.sub('<li id="{id}" class="{cname_node}"><div class="{toggle}"></div><div class="{icon}"></div><div class="{selection}"></div><div class="{content}">{label}</div><ul class="{cname_children}">{children}</ul></li>', CNAMES),
				ATTRS: {

				}

			}
		);
		
	Y.TreeNode = TN;


}, '@VERSION@' ,
{
	requires: ['flyweightnode','base-build']
});
