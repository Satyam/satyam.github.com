/*jslint devel: true,  undef: true, newcap: true, strict: true, maxerr: 50, browser: true,continue: true */
/*global YUI, google */

YUI.add('gPolyline',function(Y) {
	"use strict";
	var G_POLYLINE = 'GPolyline',
		gMaps = google.maps,
		Geom = gMaps.geometry.spherical,
		Polyline = gMaps.Polyline,
		Lang = Y.Lang,
		
		GEODESIC = 'geodesic',
		MAP = 'map',
		COLOR = 'color',
		OPACITY = 'opacity',
		WEIGHT = 'weight',
		ZINDEX = 'zIndex',
		// CLICKABLE = 'clickable',
		
		TRUE = true,
		FALSE = false,
		
		CLICK = 'click',
		MOUSE = 'mouse',
		DOWN = 'down',
		MOVE = 'move',
		OUT = 'out',
		OVER = 'over',
		UP = 'up',
		DBL = 'dbl',
		RIGHT = 'right';
	
	Y[G_POLYLINE] = Y.Base.create(
		G_POLYLINE,
		Y.BaseUI,
		[Y.GMapsEvents],
		{
			_points: null,
			_gEl: null,
			initializer: function (cfg) {
				cfg = cfg || {};
				this._points = new gMaps.MVCArray(cfg.path);
				this._gEl = new Polyline();
			},
			add: function (point, index) {
				var points = this._points;

				if (!Lang.isArray(point)) {
					point = [point];
				}
				if (Y.Lang.isNumber(index)) {
					while (point.length) {
						points.insertAt(index, point.pop());
					}
				}
				else {
					while (point.length) {
						points.push(point.shift());
					}
				}

				return this;
			},
			renderUI: function () {
				this._gEl.setMap(this._parentNode);
			},
			syncUI: function () {
				this._gEl.setPath(this._points);
			},
			_GMAPS_EVENTS: [CLICK,RIGHT + CLICK,DBL + CLICK ,MOUSE + DOWN,MOUSE + MOVE,MOUSE + OUT,MOUSE + OVER,MOUSE + UP], 
			_UI_ATTRS: {
				SYNC:[GEODESIC,    COLOR,OPACITY,WEIGHT,ZINDEX],
				BIND:[GEODESIC,MAP,COLOR,OPACITY,WEIGHT,ZINDEX]
			},
			_uiSetGeodesic: function (value, source) {
				console.log('_uiSetGeodesic',value);
				this._gEl.setOptions({GEODESIC:value});
			},
			_uiSetMap: function (value, source) {
				console.log('_uiSetMap',value);
				this._gEl.setMap(value);
				this._parentNode = value;
			},
			_uiSetColor: function (value, source) {
				console.log('_uiSetColor',value);
				this._gEl.setOptions({strokeColor: value});
			},
			_uiSetOpacity: function (value, source) {
				console.log('_uiSetOpacity',value);
				this._gEl.setOptions({strokeOpacity: value});
			},
			_uiSetWeight: function (value, source) {
				console.log('_uiSetWeight',value);
				this._gEl.setOptions({strokeWeight: value});
			},
			_uiSetZIndex: function (value, source) {
				console.log('_uiSetZIndex',value);
				this._gEl.setOptions({ZINDEX: value});
			}
			
		},
		{
			ATTRS: {
				geodesic: {
					value: FALSE,
					validator: Lang.isBoolean
				},
				map:{
					value: null,
					validator: function (value) {
						return value instanceof gMaps.Map;
					}
				},
				color: {
					value: '#000000',
					validator: Lang.isString
				},
				opacity: {
					value: 1,
					validator: function (value) {
						return Lang.isNumber(value) && value >=0 && value <= 1;
					}
				},
				weight: {
					value: 1,
					validator: Lang.isNumber
				},
				zIndex: {
					value: 0,
					validator: Lang.isNumber
				}
			}
		}
	);
		
},0.9,{
	requires:['baseUI','collection','gMapsEvents']
});