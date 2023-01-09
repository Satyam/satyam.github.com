(function () {
	var loader = new YAHOO.util.YUILoader();
	loader.loadOptional = true;
	loader.require("dom","event");
	if (location.search.indexOf('logger') !== -1) {
		loader.require('logger');
	}
	loader.insert({ 
		//filter:'RAW',
		onFailure:function (msg,xhrobj) {
			alert('Loader: ' + msg);
		},
		onSuccess: function() {
		
			if (location.search.indexOf('logger') !== -1) {
				var myLogReader = new YAHOO.widget.LogReader();  
			}
			YAHOO.log('hello, I\'m the logger');
			var Dom = YAHOO.util.Dom;
			
			var toc = Dom.get('toc');
			toc.appendChild(document.createElement('a')).name='toc';
			toc.appendChild(document.createElement('h3')).innerHTML = 'Table of Contents';
			toc = toc.appendChild(document.createElement('ol'));
			
			var h2s = document.getElementsByTagName('h2');
			for (var i = 0; i < h2s.length; i++) {
				var h2 = h2s[i];
				var a = document.createElement('a');
				a.name = h2.innerHTML.replace(/[^\w]/g,'_');
				Dom.addClass(a,'ruler');
				if (i) {
					var btn = a.appendChild(document.createElement('a'));
					btn.href='#' + h2s[i-1].innerHTML.replace(/[^\w]/g,'_');
					btn.appendChild(document.createElement('img')).src = 'up.gif';
				}
				if (i < h2s.length -1) {
					btn = a.appendChild(document.createElement('a'));
					btn.href='#' + h2s[i+1].innerHTML.replace(/[^\w]/g,'_');
					btn.appendChild(document.createElement('img')).src = 'down.gif';
				}
				btn = a.appendChild(document.createElement('a'));
				btn.href = '#toc';
				btn.appendChild(document.createElement('img')).src = 'toc.gif';
				
				Dom.insertBefore(a,h2);
				
				var tocItem = toc.appendChild(document.createElement('li')).appendChild(document.createElement('a'));
				tocItem.href= '#' + h2.innerHTML.replace(/[^\w]/g,'_');
				tocItem.innerHTML = h2.innerHTML;
				/*var h3s = h2.getElementsByTagName('h3');
				if (h3s.length) {
					var tocH3 = toc.appendChild(document.createElement('ul'));
					for (var j = 0; j < h3s.length;j++) {
						var h3 = h3s[j];
						a = document.createElement('a');
						a.name = hd.innerHTML.replace(/[^\w]/g,'_');
						Dom.inserBefore(a,h3);
						tocItem = tocH3.appendChild(document.createElement('li')).appendChild(document.createElement('a'));
						tocItem.href= '#' + h3.innerHTML.replace(/[^\w]/g,'_');
						tocItem.innerHTML = h3.innerHTML;
					}
				}*/
					
			}
			if (location.hash.length) {
				location.hash = location.hash;
			}
		}
	});
})();