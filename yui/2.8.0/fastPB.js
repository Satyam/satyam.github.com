(function () {
	var Dom = YAHOO.util.Dom , Lang = YAHOO.lang,
		DIRECTION_LTR = 'ltr',ACC = 'accelerator';
	var fpb = function () {
		fpb.superclass.constructor.apply(this,arguments);
	};
	YAHOO.widget.FastProgressBar = fpb;
	
	Lang.extend(fpb, YAHOO.widget.ProgressBar, {
	
		initAttributes: function () {
			fpb.superclass.initAttributes.apply(this, arguments);
			this.setAttributeConfig(ACC, {
				value:null,
				validator: function(value) {
					return Lang.isNumber(value) || Lang.isNull(value);
				}
			});
		}
	});

	fpb.prototype._barSizeFunctions[1][DIRECTION_LTR] = function(value, pixelValue, barEl, anim) {
		Dom.addClass(barEl,'yui-pb-anim');
		this._tweenFactor = (value - this._previousValue) / anim.totalFrames  / anim.duration;
		var att = {width:{ to: pixelValue }},
			acc = this.get(ACC);
		if (acc) {
			att['background-position'] = { 
				from:0,
				to: - pixelValue * acc,
				unit:'px'
			};
		}
		anim.attributes = att; 
		anim.animate();
	};
})();