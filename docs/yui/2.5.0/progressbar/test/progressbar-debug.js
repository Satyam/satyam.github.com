/*
People working in large organizations need this sort of statement to be able to include it in their applications, so here it goes:

Copyright (c) 2008, Daniel Barreiro (a.k.a. Satyam). All rights reserved.
satyam at satyam dot com dot ar  (yes, it ends with ar)
It is the intention of the author to make this component freely available for use along the YAHOO User Interface Library
so it is licensed with a BSD License: http://developer.yahoo.net/yui/license.txt
developped along version: 2.5.2 of YUI
*/

(function () {
	var Dom = YAHOO.util.Dom,
		Event = YAHOO.util.Event,
		Lang = YAHOO.lang;
	
        
	var Prog = function(oConfigs) {
        
		Prog.superclass.constructor.call(this, document.createElement('div') , oConfigs);
		this.createEvent('startEvent');
		// If animation is loaded, this one will trigger for each frame of the animation providing partial values
		this.createEvent('changingEvent');
		// This will fire at the end of the animation or immediately upon changing values if animation is not loaded
		this.createEvent('completeEvent');

		var anim = this.get('anim');
		// If there is an instance of Animator available, I fire the events
		if (anim) {
			anim.onTween.subscribe(function (ev) {
				this.fireEvent('changingEvent',Math.floor(this._tweenFactor * anim.currentFrame + this._previousValue));
			},this,true);
			anim.onComplete.subscribe(function(ev) {
				this.fireEvent('completeEvent',this._previousValue = this.get('value'));
				Dom.removeClass(this.get('barEl'),'yui-pb-anim');
			},this,true);
		}
		
		// I'm listening to AttributeProvider's own attribute change events to adjust the bar according to the new sizes
		this.on('minValueChange',this.redraw);
		this.on('maxValueChange',this.redraw);
		this.on('widthChange',	this.redraw);
	};
	
	YAHOO.widget.ProgressBar = Prog;
	
	Lang.extend(Prog, YAHOO.util.Element, {
		initAttributes: function (oConfigs) {

		    Prog.superclass.initAttributes.call(this, oConfigs);

			var el = this.get('element');
			el.innerHTML = 	'<div class="yui-pb-bar"></div><table class="yui-pb-mask"><tr><td class="yui-pb-tl"></td><td class="yui-pb-tr"></td></tr><tr><td class="yui-pb-bl"></td><td class="yui-pb-br"></td></tr></table>';
			var barEl  = el.firstChild;
			var maskEl = barEl.nextSibling;
			
		    this.setAttributeConfig('barEl', {
		        readOnly: true,
		        value: barEl
		    });
		    this.setAttributeConfig('maskEl', {
		        readOnly: true,
		        value: maskEl
		    });
			
			this.setAttributeConfig('direction', {
				writeOnce: true,
				value:'lr',
				validator:function(value) {
					switch (value) {
						case 'lr':
						case 'rl':
						case 'tb':
						case 'bt':
							return true;
						default:
							return false;
					}
				}
			});
		    
		    this.setAttributeConfig('maxValue', {
		        value: 100,
				validator: Lang.isNumber,
				method: function (value) {
					this.get('element').setAttribute('aria-valuemax',value);
					this._recalculateConstants();
				}
		    });

		    this.setAttributeConfig('minValue', {
		        value: 0,
				validator: Lang.isNumber,
				method: function (value) {
					this.get('element').setAttribute('aria-valuemin',value);
					this._recalculateConstants();
				}
		    });

		    this.setAttributeConfig('width', {
		        value: '200px',
				method: function(value) {
					if (Lang.isNumber(value)) {
						value += 'px';
					}
					YAHOO.log('Setting width: ' + value,'info','ProgressBar');
					this.setStyle('width',value);
					Dom.setStyle(maskEl,'width', value);
				}
		    });

		    this.setAttributeConfig('height', {
		        value: '20px',
				method: function(value) {
					if (Lang.isNumber(value)) {
						value += 'px';
					}
					YAHOO.log('Setting height: ' + value,'info','ProgressBar');
					this.setStyle('height',value);
					//Dom.setStyle(maskEl,'height', value);
				}
		    });
			
			this.setAttributeConfig('barColor', {
				value:'blue',
				method: function (value) {
					YAHOO.log('Setting bar color: ' + value,'info','ProgressBar');
					Dom.setStyle(barEl,'background-color', value);
					Dom.setStyle(barEl,'background-image', 'none');
				}
			});

			this.setAttributeConfig('backColor', {
				value:'white',
				method: function (value) {
					YAHOO.log('Setting background color: ' + value,'info','ProgressBar');
					this.setStyle('background-color', value);
					this.setStyle('background-image', 'none');
				}
			});
			
			this.setAttributeConfig('border', {
				value:'none',
				method: function (value) {
					YAHOO.log('Setting border: ' + value,'info','ProgressBar');
					this.setStyle('border', value);
				}
			});
			
			this.setAttributeConfig('ariaText', {
				value:'|'
			});
	
			this.setAttributeConfig('value', {
				value: 50,
				validator: function(value) {
					return Lang.isNumber(value) && value >= this.get('minValue') && value <= this.get('maxValue');
				},
				method:function (value) {
					YAHOO.log('set value: ' + value,'info','ProgressBar');
					var anim = this.get('anim'),
						pixelValue = (value - this._mn) * this._barFactor,
						container = this.get('element'),
						barEl = this.get('barEl');
						
					container.setAttribute('aria-valuenow',value);
					container.setAttribute('aria-valuetext',this.get('ariaText').replace('|',value));
					this.fireEvent('startEvent',this._previousValue);
					if (anim) {
						Dom.addClass(this.get('barEl'),'yui-pb-anim');
						this._tweenFactor = (value - this._previousValue) / anim.totalFrames;
						switch (this.get('direction')) {
							case 'lr':
								anim.attributes = {width:{ to: pixelValue }}; 
								break;
							case 'rl':
								anim.attributes = {
									width:{ to: pixelValue },
									left:{to: this._barSpace - pixelValue}
								}; 
								break;
							case 'tb':
								anim.attributes = {height:{to: pixelValue}};
								break;
							case 'bt':
								anim.attributes = {
									height:{to: pixelValue},
									top:{to: this._barSpace - pixelValue}
								};
								break;
						}
						anim.animate();
					} else {
						switch (this.get('direction')) {
							case 'lr':
								Dom.setStyle(barEl,'width',  pixelValue + 'px');
								break;
							case 'rl':
								Dom.setStyle(barEl,'width',  pixelValue + 'px');
								Dom.setStyle(barEl,'left',(this._barSpace - pixelValue) + 'px');
								break;
							case 'tb':
								Dom.setStyle(barEl,'height',  pixelValue + 'px');
								break;
							case 'bt':
								Dom.setStyle(barEl,'height',  pixelValue + 'px');
								Dom.setStyle(barEl,'top',  (this._barSpace - pixelValue) + 'px');
								break;
						}
						// If the animation utility has not been loaded then changing the value will always complete immediately.
						this.fireEvent('completeEvent',value);
					}
				}
		    });
			
			this.setAttributeConfig('anim', {
				readOnly:true,
				value: YAHOO.util.Anim?new YAHOO.util.Anim(barEl):null
			});
		},

		render: function(el,before) {
			YAHOO.log('start render','info','ProgressBar');

			this.addClass('yui-pb');
			var container = this.get('element');
			container.tabIndex = 1;
			container.setAttribute('role','progressbar');
			container.setAttribute('aria-valuemin',this.get('minValue'));
			container.setAttribute('aria-valuemax',this.get('maxValue'));
			container.setAttribute('aria-valuenow',this.get('value'));
			container.setAttribute('aria-valuetext',this.get('ariaText').replace('|',this.get('value')));

			this.appendTo(el,before);
			
			this.redraw();
			return this;
		},

		redraw: function () {
			this._recalculateConstants();
			this.refresh('value',true);
		},
			
		destroy: function() {
			YAHOO.log('destroy','info','ProgressBar');
			var anim = this.get('anim');
			if (anim) {
				anim.onTween.unsubscribeAll();
				anim.onComplete.unsubscribeAll();
			}
			this.unsubscribeAll();
			var el = this.get('element');
			el.parentNode.removeChild(el);
		},
		_previousValue:100,
		_recalculateConstants: function() {
			var barEl = this.get('barEl');
			var margin;
			this._mn = this.get('minValue') || 0;

			YAHOO.log(Dom.getStyle(barEl,'marginTop') + ' ' + Dom.getStyle(barEl,'marginRight') + 
				' ' +Dom.getStyle(barEl,'marginBottom') + ' ' +Dom.getStyle(barEl,'marginLeft'),
				this.get('direction'),'satyam');
if (window.getComputedStyle) {				
	var cStyle = getComputedStyle(barEl,null);
			YAHOO.log(cStyle['marginTop'] + ' ' + cStyle['marginRight'] + 
				' ' +cStyle['marginBottom'] + ' ' +cStyle['marginLeft'],
				this.get('direction') + ' computed','satyam');
}
				switch (this.get('direction')) {
				case 'lr':
				case 'rl':
					this._barSpace = parseInt(this.getStyle('width'),10) - 
						parseInt(Dom.getStyle(barEl,'marginLeft'),10)  -
						parseInt(Dom.getStyle(barEl,'marginRight'),10);
					break;
				case 'tb':
				case 'bt':
					this._barSpace = parseInt(this.getStyle('height'),10) -
						parseInt(Dom.getStyle(barEl,'marginTop'),10) -
						parseInt(Dom.getStyle(barEl,'marginBottom'),10); 
					break;
			}
			this._barFactor = this._barSpace / (this.get('maxValue') - this._mn)  || 1;
		}
	});
    
})();
YAHOO.register('progressbar',YAHOO.widget.ProgressBar,{version: "2.5.2", build: "0"});