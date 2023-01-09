/*jslint nomen: true, white: true, browser: true, maxerr: 100 */
/*global YUI */
/**
 * @module form
 */
YUI.add('form', function (Y, NAME) {
	'use strict';
	var CBX = 'contentBox',

		Form = Y.Base.create(
			NAME,
			Y.Widget,
			[Y.FlyweightManager],
			{
				initializer: function (config) {
					this._loadConfig(config.fields);
				},
				renderUI: function () {
					this.get(CBX).setContent(this._getHTML());
				},
				CONTENT_TEMPLATE: '<form></form>'

			},
			{
				ATTRS: {
					defaultType: {
						value: 'InputField'
					}

				}

			}
		);

	Y.Form = Form;
	
}, '@VERSION@' ,
{
	requires: ['flyweightmanager', 'widget','base-build','input-field']
});
