YUI.add("gallery-timeline",function(a){var b=a.Lang,o="region",s="start",d="end",l="left",g="url",p="container",c="loaded",k="Change",f="event",r="categories",n="top",v="center",j="right",i="px",t="strings",u="timeline",e=function(){return a.ClassNameManager.getClassName.apply(this,[u].concat(a.Array(arguments)));},w=a.Node.create('<div class="'+e("bar")+'" />'),q=a.Node.create('<div class="'+e("grid")+'"/>'),h=a.Node.create('<div class="'+e("pointer")+'" />'),m='<div class="'+e("cats")+'">{categories}<p class="'+e("noCat")+'">{noCategory}</p></div>';a.Timeline=a.Base.create(u,a.Base,[],{_events:null,_mode:0,initializer:function(x){this._events=[];this.set(t,a.Intl.get("gallery-"+u));this.after(g+k,this._load);this.after(p+k,this._render);this.after(c+k,this._render);if(x&&x[g]){this._load();}if(x&&x[p]){this._render();}},_readBoolean:function(y,x){var z=this._readValue(y,x);return z?z.toLowerCase()==="true":null;},_readDate:function(z,x){var y,A,B=this._readValue(z,x);if(B){B=B.split(" ");y=B[0].split("-");A=B[1].split(":");return new Date(y[0],y[1]-1,y[2],A[0],A[1],A[2]).getTime();}else{return null;}},_readColor:function(y,x){var A=this._readValue(y,x),z=function(B){return("00"+parseInt(B,10).toString(16)).substr(-2);};if(A){A=A.split(",");return"#"+z(A[0])+z(A[1])+z(A[2]);}else{return null;}},_readValue:function(y,x){var z=this._readEl(y,x);return z?z.textContent:null;},_readEl:function(y,x){var z=y.getElementsByTagName(x);return(z&&z.length)?z[0]:null;},_xmlReadCategories:function(x){var y={};a.each(x.children,function(z){y[this._readValue(z,"name")]={color:this._readColor(z,"color"),fontColor:this._readColor(z,"font_color")};},this);this.set(r,y);},_xmlReadView:function(x){var y=this._readEl(x,"displayed_period"),z=this.get(r),A=this._readEl(x,"hidden_categories").firstChild;if(y){this.set(s,this._readDate(y,s));this.set(d,this._readDate(y,d));}while(A){z[A.textContent].hidden=true;A=A.nextChild;}},_xmlReadEvents:function(x){this._events=[];a.each(x.children,function(y){this._events.push({start:this._readDate(y,s),end:this._readDate(y,d),text:this._readValue(y,"text"),fuzzy:this._readBoolean(y,"fuzzy"),locked:this._readBoolean(y,"locked"),endsToday:this._readBoolean(y,"ends_today"),category:this._readValue(y,"category"),description:this._readValue(y,"description"),icon:this._readValue(y,"icon")});},this);},load:function(x){this.set(g,x);return this;},_load:function(){var x=this;x.set(c,false);a.io(x.get(g),{on:{success:function(A,z){var y=z.responseXML;x._xmlReadCategories(x._readEl(y,r));x._xmlReadView(x._readEl(y,"view"));x._xmlReadEvents(x._readEl(y,"events"));x.set(c,true);}}});},_getRegion:function(y){var x=y.get(o);x.left-=this._left;x.top-=this._top;return x;},_resize:function(y){y=y||this.get(p);var A=this.get(s),D=this.get(d),J=this._width,L=this._height,C=J/(D-A),K=this.get(r),H,z,B,F=false,I,x,G=false,E=this.get(t).today,M=function(N){return a.DataType.Date.format(new Date(N),{format:"%x"});};a.each(this._events,function(N){H=N._bar||w.cloneNode();x=N._pointer;B=Math.round((N.start-A)*C);z=Math.round(((N.endsToday?Date.now():N.end)-N.start)*C);if(B+z<0||B>J){if(N._bar){N._bar.remove(true);N._bar=null;if(x){x.remove(true);N._pointer=x=null;}}F=true;return;}N._isPoint=z===0;H.setStyles({left:B+i,width:z?z+i:"auto"});if(!N._bar){N._bar=H;if(N.category){H.setStyles({backgroundColor:K[N.category].color,color:K[N.category].fontColor});}else{G=true;}H.setContent(N.text);H.set("title",N.text+": "+M(N.start)+" - "+(N.endsToday?E:M(N.end)));if(N.fuzzy){H.addClass(e("fuzzy"));}if(N.description||N.icon){H.addClass(e("hasDescr"));}H.setData(f,N);}if(!H.inDoc()){y.append(H);F=true;}if(N._isPoint){I=this._getRegion(H);H.setStyle(l,I.left-I.width/2+i);if(!x){N._pointer=x=h.cloneNode();x.setStyle(n,L/2+i);}}else{if(x){x.remove(true);N._pointer=x=null;F=true;}}if(x){x.setStyle(l,B+i);if(!x.inDoc()){y.append(x);}}},this);if(F){this._locate();}y.one("."+e("noCat")).setStyle("display",G?"block":"none");},_locate:function(){var y,A,E,I=this._height/2,G=[],x=[],H,F,D=this._mode,C=0,B=0,z=function(L,M,K,J){var N;switch(D){case 0:N=J?30*K+15:-30*(K+1)-15;break;case 1:N=J?15*K+10:-15*(K+1)-10;break;case 2:N=J?5*K+10:-5*(K+1)-10;break;}C=Math.min(C,N);B=Math.max(B,N);L.setStyle(n,I+N+i);if(!M[K]){M[K]=[];}M[K].push({left:A,width:y});var O=L.getData(f)._pointer;if(O){O.setStyle("height",30*K+15);}};this.get(p).all("div."+e("bar")).each(function(J){E=this._getRegion(J);y=E.width;A=E.left;F=J.getData(f)._isPoint;H=(F?G:x);if(!a.some(H,function(L,K){if(!a.some(L,function(M){return !(M.left>(A+y)||A>(M.left+M.width));})){z(J,H,K,F);return true;}return false;},this)){z(J,H,H.length,F);}},this);console.log(C,B,I,D);C=Math.max(-C,B);if(C>I){if(D<2){console.log("up");this._mode+=1;this._locate();this.get(p).addClass(e("compact"));}}else{if(C<I/3){if(D){console.log("down");this._mode-=1;if(this._mode===0){this.get(p).removeClass(e("compact"));}this._locate();}}}},_grid:function(){var z=this.get(s),D=this.get(d),x=this.get(p),A=this._width,K=this._height,G=D-z,I=[1000*60*60,24,30,12,10,10,10,10],H=1,E,F,y,B,J,C,L=function(O,M,N){O=new Date(O);switch(M){case 0:return new Date(O.getFullYear(),O.getMonth(),O.getDate(),O.getHours()+N,0,0).getTime();case 1:return new Date(O.getFullYear(),O.getMonth(),O.getDate()+N).getTime();case 2:return new Date(O.getFullYear(),O.getMonth()+N,1).getTime();default:M=Math.pow(10,M-3);return new Date(Math.floor(O.getFullYear()/M)*M+(N?M:0),0,1).getTime();}};x.all("div."+e("grid")).remove(true);for(E=0;E<I.length;E+=1){H*=I[E];if(A/G*H>20){break;}}B=L(z,E,0);while(B<D){F=L(B,E,1);C=new Date(B);y=q.cloneNode();J=[C.getHours()];if(J[0]===0){J[1]=C.getDate();if(J[1]===1){J[2]=C.getMonth();if(J[2]===0){J[3]=C.getFullYear();}J[2]=a.DataType.Date.format(C,{format:"%b"});}}y.setContent(J.slice(Math.min(3,E)).join(", "));y.setStyles({width:Math.round((F-B)/G*A)-1+i,left:Math.round((B-z)/G*A)+i,paddingTop:K/2+i,height:K/2+i});x.append(y);B=F;}},render:function(x){this.set(p,x);return this;},_render:function(){var x=this.get(p);
if(!(x&&this.get(c))){return;}x.addClass(e());x.setContent("");a.each(this._events,function(A){delete A._pointer;delete A._bar;delete A._isPoint;});var z=x.get(o);this._left=z.left;this._top=z.top;this._height=z.height;this._width=z.width;x.append(a.Node.create('<div class="'+e("divider")+'"/>'));var y=x.appendChild(a.Node.create(b.sub(m,this.get(t))));a.each(this.get(r),function(A,B){y.append(a.Node.create('<p style="color:'+A.fontColor+";background-color:"+A.color+'">'+B+"</p>"));});this._descr=x.appendChild(a.Node.create('<div class="'+e("descr")+'"/>'));this._grid();this._resize(x);x.delegate("click",this._showDescr,"div."+e("bar"),this);x.on("gesturemovestart",this._startMove,{},this);x.on("gesturemove",this._dragMove,{},this);x.on("gesturemoveend",this._dragMove,{},this);a.on("mousewheel",this._mouseWheel,this);return;},_hideDescr:function(){this._descr.setStyle("display","none");},_showDescr:function(C){var B=C.target,A=B.getData(f),z=this._getRegion(B),E=this._descr,x,D=z.left+z.width/2,y=this._width/3;if(A.description||A.icon){E.setContent((A.icon?'<img src="data:image/png;base64,'+A.icon+'">':"")+A.description);E.setStyles({display:"block",top:0});E.removeClass(e(l));E.removeClass(e(v));E.removeClass(e(j));x=this._getRegion(E);if(D<y){E.setStyle(l,Math.max(D,0)+i);E.addClass(e(l));}else{if(D<y*2){E.setStyle(l,D-x.width/2+i);E.addClass(e(v));}else{E.setStyle(l,Math.min(D,this._width-30)-x.width+i);E.addClass(e(j));}}E.setStyle(n,Math.round(z.top-x.height-20)+i);}},_startMove:function(x){x.halt();this._hideDescr();this._pageX=x.pageX;this._start=this.get(s);this._end=this.get(d);},_dragMove:function(A){var B=this._start,y=this._end,z=this._width,x=Math.round((A.pageX-this._pageX)/z*(y-B));if(x){this.set(s,B-x);if(A.ctrlKey){this.set(d,y+x);this._locate();}else{this.set(d,y-x);}this._resize();this._grid();}},_mouseWheel:function(z){if(z.target.ancestor("#"+this.get(p).get("id"),true)){z.halt();this._hideDescr();var A=this.get(s),y=this.get(d),x=(y-A)*0.1*(z.wheelDelta>0?-1:1);this.set(s,A-x);if(z.ctrlKey){this.set(d,y+x);this._locate();}else{this.set(d,y-x);}this._resize();this._grid();}}},{ATTRS:{categories:{validator:b.isObject,value:{}},start:{validator:b.isNumber,value:new Date(Date.now()-1000*60*60*24*30).getTime()},end:{validator:b.isNumber,value:new Date(Date.now()+1000*60*60*24*30).getTime()},container:{setter:function(x){return a.one(x);}},url:{validator:b.isString},loaded:{validator:b.isBoolean,value:false},strings:{value:{categories:"Categories",noCategory:"-no category-",today:"today"}}}});},"@VERSION@",{skinnable:true,optional:["intl"],lang:["en","es"],requires:["node","io-base","base","event-mousewheel","event-gestures","classnamemanager","datatype"]});