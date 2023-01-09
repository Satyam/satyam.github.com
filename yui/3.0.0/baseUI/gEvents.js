/*jslint devel: true,  undef: true, newcap: true, strict: true, maxerr: 50, browser: true,continue: true */
/*global YUI, google */

YUI.add('gMapsEvents',function(Y) {
	"use strict";
	var gMaps = google.maps,
		gEvents = gMaps.event,
		ATTACH = '_attach',
		DETACH = '_detach';
		
	var GMapsEvents = function () {
		this._gMapsListeners = {};
		this._gMapsEventsMonitor();
	};
	GMapsEvents.prototype = {
		_gMapsListeners: null,
	
		_gMapsEventAttach: function (ev, what) {
			var el = this._gEl,
				self = this;
			//el.setOptions({CLICKABLE: TRUE});
			this._gMapsListeners[what] = gEvents.addListener(el, what, function (latLng) {
				self.fire(what,{latLng: latLng});
			});
		},
		_gMapsEventDetach: function (ev, what) {
			var g = this._gMapsListeners;
			// if (Y.isEmpty(g)) {
				// this._gEl.setOptions({CLICKABLE: FALSE});
			// }
			var listener = g[what];
			if (listener) {
				gEvents.removeListener(listener);
				delete g[what];
			}
		},
		_gMapsEventsMonitor: function () {
		
			Y.each(this._GMAPS_EVENTS, function (what) {
				this.publish(what, {monitored: true});
				this.after(what + ATTACH, this._gMapsEventAttach, this, what);
				this.after(what + DETACH, this._gMapsEventDetach, this, what);
			},this);
		}
	};
	Y.GMapsEvents = GMapsEvents;
		
},0.9,{
	requires:[]
});