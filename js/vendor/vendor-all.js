/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransitions-shiv-cssclasses-prefixed-testprop-testallprops-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function x(a){j.cssText=a}function y(a,b){return x(prefixes.join(a+";")+(b||""))}function z(a,b){return typeof a===b}function A(a,b){return!!~(""+a).indexOf(b)}function B(a,b){for(var d in a){var e=a[d];if(!A(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function C(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:z(f,"function")?f.bind(d||b):f}return!1}function D(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+n.join(d+" ")+d).split(" ");return z(b,"string")||z(b,"undefined")?B(e,b):(e=(a+" "+o.join(d+" ")+d).split(" "),C(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m="Webkit Moz O ms",n=m.split(" "),o=m.toLowerCase().split(" "),p={},q={},r={},s=[],t=s.slice,u,v={}.hasOwnProperty,w;!z(v,"undefined")&&!z(v.call,"undefined")?w=function(a,b){return v.call(a,b)}:w=function(a,b){return b in a&&z(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=t.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(t.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(t.call(arguments)))};return e}),p.csstransitions=function(){return D("transition")};for(var E in p)w(p,E)&&(u=E.toLowerCase(),e[u]=p[E](),s.push((e[u]?"":"no-")+u));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)w(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},x(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._domPrefixes=o,e._cssomPrefixes=n,e.testProp=function(a){return B([a])},e.testAllProps=D,e.prefixed=function(a,b,c){return b?D(a,b,c):D(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+s.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};/*
 * jQuery appear plugin
 *
 * Copyright (c) 2012 Andrey Sidorov
 * licensed under MIT license.
 *
 * https://github.com/morr/jquery.appear/
 *
 * Version: 0.3.3
 */
(function($) {
  var selectors = [];

  var check_binded = false;
  var check_lock = false;
  var defaults = {
    interval: 250,
    force_process: false
  }
  var $window = $(window);

  var $prior_appeared;

  function process() {
    check_lock = false;
    for (var index = 0; index < selectors.length; index++) {
      var $appeared = $(selectors[index]).filter(function() {
        return $(this).is(':appeared');
      });

      $appeared.trigger('appear', [$appeared]);

      if ($prior_appeared) {
        var $disappeared = $prior_appeared.not($appeared);
        $disappeared.trigger('disappear', [$disappeared]);
      }
      $prior_appeared = $appeared;
    }
  }

  // "appeared" custom filter
  $.expr[':']['appeared'] = function(element) {
    var $element = $(element);
    if (!$element.is(':visible')) {
      return false;
    }

    var window_left = $window.scrollLeft();
    var window_top = $window.scrollTop();
    var offset = $element.offset();
    var left = offset.left;
    var top = offset.top;

    if (top + $element.height() >= window_top &&
        top - ($element.data('appear-top-offset') || 0) <= window_top + $window.height() &&
        left + $element.width() >= window_left &&
        left - ($element.data('appear-left-offset') || 0) <= window_left + $window.width()) {
      return true;
    } else {
      return false;
    }
  }

  $.fn.extend({
    // watching for element's appearance in browser viewport
    appear: function(options) {
      var opts = $.extend({}, defaults, options || {});
      var selector = this.selector || this;
      if (!check_binded) {
        var on_check = function() {
          if (check_lock) {
            return;
          }
          check_lock = true;

          setTimeout(process, opts.interval);
        };

        $(window).scroll(on_check).resize(on_check);
        check_binded = true;
      }

      if (opts.force_process) {
        setTimeout(process, opts.interval);
      }
      selectors.push(selector);
      return $(selector);
    }
  });

  $.extend({
    // force elements's appearance check
    force_appear: function() {
      if (check_binded) {
        process();
        return true;
      };
      return false;
    }
  });
})(jQuery);
/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright 2015 jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a:a(jQuery)}(function(a){function b(b){var g=b||window.event,h=i.call(arguments,1),j=0,l=0,m=0,n=0,o=0,p=0;if(b=a.event.fix(g),b.type="mousewheel","detail"in g&&(m=-1*g.detail),"wheelDelta"in g&&(m=g.wheelDelta),"wheelDeltaY"in g&&(m=g.wheelDeltaY),"wheelDeltaX"in g&&(l=-1*g.wheelDeltaX),"axis"in g&&g.axis===g.HORIZONTAL_AXIS&&(l=-1*m,m=0),j=0===m?l:m,"deltaY"in g&&(m=-1*g.deltaY,j=m),"deltaX"in g&&(l=g.deltaX,0===m&&(j=-1*l)),0!==m||0!==l){if(1===g.deltaMode){var q=a.data(this,"mousewheel-line-height");j*=q,m*=q,l*=q}else if(2===g.deltaMode){var r=a.data(this,"mousewheel-page-height");j*=r,m*=r,l*=r}if(n=Math.max(Math.abs(m),Math.abs(l)),(!f||f>n)&&(f=n,d(g,n)&&(f/=40)),d(g,n)&&(j/=40,l/=40,m/=40),j=Math[j>=1?"floor":"ceil"](j/f),l=Math[l>=1?"floor":"ceil"](l/f),m=Math[m>=1?"floor":"ceil"](m/f),k.settings.normalizeOffset&&this.getBoundingClientRect){var s=this.getBoundingClientRect();o=b.clientX-s.left,p=b.clientY-s.top}return b.deltaX=l,b.deltaY=m,b.deltaFactor=f,b.offsetX=o,b.offsetY=p,b.deltaMode=0,h.unshift(b,j,l,m),e&&clearTimeout(e),e=setTimeout(c,200),(a.event.dispatch||a.event.handle).apply(this,h)}}function c(){f=null}function d(a,b){return k.settings.adjustOldDeltas&&"mousewheel"===a.type&&b%120===0}var e,f,g=["wheel","mousewheel","DOMMouseScroll","MozMousePixelScroll"],h="onwheel"in document||document.documentMode>=9?["wheel"]:["mousewheel","DomMouseScroll","MozMousePixelScroll"],i=Array.prototype.slice;if(a.event.fixHooks)for(var j=g.length;j;)a.event.fixHooks[g[--j]]=a.event.mouseHooks;var k=a.event.special.mousewheel={version:"3.1.12",setup:function(){if(this.addEventListener)for(var c=h.length;c;)this.addEventListener(h[--c],b,!1);else this.onmousewheel=b;a.data(this,"mousewheel-line-height",k.getLineHeight(this)),a.data(this,"mousewheel-page-height",k.getPageHeight(this))},teardown:function(){if(this.removeEventListener)for(var c=h.length;c;)this.removeEventListener(h[--c],b,!1);else this.onmousewheel=null;a.removeData(this,"mousewheel-line-height"),a.removeData(this,"mousewheel-page-height")},getLineHeight:function(b){var c=a(b),d=c["offsetParent"in a.fn?"offsetParent":"parent"]();return d.length||(d=a("body")),parseInt(d.css("fontSize"),10)||parseInt(c.css("fontSize"),10)||16},getPageHeight:function(b){return a(b).height()},settings:{adjustOldDeltas:!0,normalizeOffset:!0}};a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})});/*
* debouncedresize: special jQuery event that happens once after a window resize
*
* latest version and complete README available on Github:
* https://github.com/louisremi/jquery-smartresize/blob/master/jquery.debouncedresize.js
*
* Copyright 2011 @louis_remi
* Licensed under the MIT license.
*/
var $event = $.event,
$special,
resizeTimeout;


function clientRectIntersect(a, b) {
  var left = Math.max(a.left, b.left);
  var right = Math.min(a.right, b.right);
  var top = Math.max(a.top, b.top);
  var bottom = Math.min(a.bottom, b.bottom);
  return {
    left: left,
    right: Math.max(left, right),
    top: top,
    bottom: Math.max(bottom, top),
    width: Math.max(right - left, 0),
    height: Math.max(bottom - top, 0)
  };
}


// We check for visblity within:
// 1. The window
// 2. Containing scrollable elements
function isElementInViewport(el) {
  // special bonus for those using jQuery
  if (el instanceof jQuery) {
    el = el[0];
  }

  var elRect = el.getBoundingClientRect();
  var windowRect = {
    top: 0,
    left: 0,
    bottom: $(window).height(),
    right: $(window).width(),
    height: $(window).height(),
    width: $(window).width()
  };

  elRect = clientRectIntersect(elRect, windowRect);
  if (elRect.width * elRect.height == 0) return false;

  var $scrollParents = scrollableParents(el);
  for (var i = 0; i < $scrollParents.length; i++) {
    var scrollParent = $scrollParents.get(i);
    var scrollParentRect = scrollParent.getBoundingClientRect();
    elRect = clientRectIntersect(elRect, scrollParentRect);
    if (elRect.width * elRect.height == 0) return false;
  }

  return true;
}

function isElementScrollable(el) {
  return el.scrollHeight > el.clientHeight;
}

function scrollableParents(node) {
  var $parents = $(node).parents().filter(function(_, e) {
    return isElementScrollable(e);
  });
  return ($parents.length > 0 ? $parents : $('body'));
}

$special = $event.special.debouncedresize = {
  setup: function() {
    $( this ).on( "resize", $special.handler );
  },
  teardown: function() {
    $( this ).off( "resize", $special.handler );
  },
  handler: function( event, execAsap ) {
    // Save the context
    var context = this,
      args = arguments,
      dispatch = function() {
        // set correct event type
        event.type = "debouncedresize";
        $event.dispatch.apply( context, args );
      };

    if ( resizeTimeout ) {
      clearTimeout( resizeTimeout );
    }

    execAsap ?
      dispatch() :
      resizeTimeout = setTimeout( dispatch, $special.threshold );
  },
  threshold: 250
};

/*
 * throttledresize: special jQuery event that happens at a reduced rate compared to "resize"
 *
 * latest version and complete README available on Github:
 * https://github.com/louisremi/jquery-smartresize
 *
 * Copyright 2012 @louis_remi
 * Licensed under the MIT license.
 *
 * This saved you an hour of work? 
 * Send me music http://www.amazon.co.uk/wishlist/HNTU0468LQON
 */
(function($) {

var $event = $.event,
	$special,
	dummy = {_:0},
	frame = 0,
	wasResized, animRunning;

$special = $event.special.throttledresize = {
	setup: function() {
		$( this ).on( "resize", $special.handler );
	},
	teardown: function() {
		$( this ).off( "resize", $special.handler );
	},
	handler: function( event, execAsap ) {
		// Save the context
		var context = this,
			args = arguments;

		wasResized = true;

		if ( !animRunning ) {
			setInterval(function(){
				frame++;

				if ( frame > $special.threshold && wasResized || execAsap ) {
					// set correct event type
					event.type = "throttledresize";
					$event.dispatch.apply( context, args );
					wasResized = false;
					frame = 0;
				}
				if ( frame > 9 ) {
					$(dummy).stop();
					animRunning = false;
					frame = 0;
				}
			}, 30);
			animRunning = true;
		}
	},
	threshold: 0
};

})(jQuery);

var Grid = function() {

    // list of items
  var $grid = null,  // $grid is the <ul>
    // the items
    $items = null,  // these are the <li>s
    // current expanded item's index
    current = -1,
    // position (top) of the expanded item
    // used to know if the preview will expand in a different row
    previewPos = -1,
    // extra amount of pixels to scroll the window
    scrollExtra = 0,
    // extra margin when expanded (between preview overlay and the next items)
    marginExpanded = 10,
    $window = $(window), winsize,
    $body = null,
    // transitionend events
    transEndEventNames = {
      'WebkitTransition' : 'webkitTransitionEnd',
      'MozTransition' : 'transitionend',
      'OTransition' : 'oTransitionEnd',
      'msTransition' : 'MSTransitionEnd',
      'transition' : 'transitionend'
    },
    transEndEventName = transEndEventNames[Modernizr.prefixed('transition')],
    // support for csstransitions
    support = Modernizr.csstransitions,
    // default settings
    settings = {
      minHeight: 500,
      maxHeight: 750,
      speed: 350,
      easing: 'ease'
    };

  function init(grid, config) {
    $grid = $(grid);
    $items = $grid.children('li');
    $body = $('html, body');

    // the settings..
    settings = $.extend(true, {}, settings, config);

    // save item's size and offset
    saveItemInfo(true);
    // get window's size
    getWinSize();
    // initialize some events
    initEvents();
  }

  // add more items to the grid.
  // the new items need to appended to the grid.
  // after that call Grid.addItems(theItems);
  function addItems($newitems) {
    $items = $items.add( $newitems );

    $newitems.each(function() {
      var $item = $(this);
      $item.data({
        offsetTop: $item.offset().top,
        height: $item.height()
      });
    });

    initItemsEvents($newitems);
  }

  // saves the item´s offset top and height (if saveheight is true)
  function saveItemInfo(saveheight) {
    $items.each(function() {
      var $item = $(this);
      $item.data('offsetTop', $item.offset().top);
      if( saveheight ) {
        $item.data('height', $item.height());
      }
    });
  }

  function initEvents() {
    // when clicking an item, show the preview with the item´s info and large
    // image.
    // close the item if already expanded.
    // also close if clicking on the item´s cross
    initItemsEvents($items);
    
    // on window resize get the window´s size again
    // reset some values..
    $window.on('debouncedresize', function() {
      scrollExtra = 0;
      previewPos = -1;
      // save item´s offset
      saveItemInfo();
      getWinSize();
      var preview = $.data($grid, 'preview');
      if (typeof preview != 'undefined') {
        hidePreview();
      }
    });
  }

  function initItemsEvents($items) {
    $items.on('click', 'span.og-close', function() {
      hidePreview();
      $(this).trigger('og-deselect');
      return false;
    }).children('a').on('click', function(e) {
      var $li = $(this).parent();
      // check if item already opened
      if (current === $li.index()) {
        hidePreview()
        $li.trigger('og-deselect');
      } else {
        var previousSelection = current;
        showPreview($li);
        if (previousSelection == -1) {
          $grid.trigger('og-openpreview');
        }
        $li.trigger('og-select');
      }
      return false;
    });
  }

  function getWinSize() {
    winsize = { width : $window.width(), height : $window.height() };
  }

  function showPreview($item) {
    var preview = $.data($grid, 'preview'),
      // item´s offset top
      position = $item.data('offsetTop');

    scrollExtra = 0;

    // if a preview exists and previewPos is different (different row) from
    // item's top then close it
    if (typeof preview != 'undefined') {
      // not in the same row
      if (previewPos !== position) {
        // if position > previewPos then we need to take te current preview's
        // height in consideration when scrolling the window
        if (position > previewPos) {
          scrollExtra = preview.height;
        }
        hidePreview();
      } else {
        // same row 
        preview.update($item);
        return false;
      }
    }

    // update previewPos
    previewPos = position;
    // initialize new preview for the clicked item
    preview = $.data($grid, 'preview', new Preview($item));
    // expand preview overlay
    preview.open();
  }

  function hidePreview() {
    current = -1;
    var preview = $.data($grid, 'preview');
    preview.close();
    $.removeData($grid, 'preview');
  }

  // the preview obj / overlay
  function Preview($item) {
    this.$item = $item;
    this.expandedIdx = this.$item.index();
    this.create();
    this.update();
  }

  Preview.prototype = {
    create : function() {
      // create Preview structure:
      this.$details = $( '<div class="og-details" />' );
      this.$loading = $( '<div class="og-loading"></div>' );
      this.$fullimage = $( '<div class="og-fullimg"></div>' ).append( this.$loading ).append($('<div class="og-details-left" style="display:none">'));
      this.$closePreview = $( '<span class="og-close"></span>' );
      this.$previewInner = $( '<div class="og-expander-inner"></div>' ).append( this.$closePreview, this.$fullimage, this.$details );
      this.$previewLeft = $('<div class="og-previous"></div>');
      this.$previewRight = $('<div class="og-next"></div>');
      this.$previewEl = $( '<div class="og-expander"></div>' ).append( this.$previewInner, this.$previewLeft, this.$previewRight );
      // append preview element to the item
      this.$item.append(this.getEl());
      // set the transitions for the preview and the item
      if (support) {
        this.setTransition();
      }
    },

    update : function( $item ) {
      if( $item ) {
        this.$item = $item;
      }
      
      // if already expanded remove class "og-expanded" from current item and add it to new item
      // $('.og-grid li').removeClass('og-expanded');
      if( current !== -1 ) {
        var $currentItem = $items.eq(current);
        $currentItem.removeClass('og-expanded');
        this.$item.addClass('og-expanded');
        // position the preview correctly
        this.positionPreview();
      }

      // update current value
      current = this.$item.index();

      // update preview´s content
      var $itemEl = this.$item.children('a'),
        eldata = {
          largesrc: $itemEl.data('largesrc'),
        };

      this.$details.empty();
      this.$fullimage.find('.og-details-left').empty();
      $(this.$item).trigger('og-fill', this.$details);

      var self = this;
      
      // remove the current image in the preview
      if (typeof self.$largeImg != 'undefined') {
        self.$largeImg.remove();
      }

      // preload large image and add it to the preview
      // for smaller screens we don´t display the large image (the media query will hide the fullimage wrapper)
      if (self.$fullimage.is(':visible')) {
        this.$loading.show();
        $('<img/>').load(function() {
          var $img = $(this);
          if ($img.attr('src') === self.$item.children('a').data('largesrc')) {
            var $fullimage = self.$fullimage;
            self.$loading.hide();
            $fullimage.find('.og-loading img').remove();
            self.$largeImg = $img.fadeIn(settings.speed);
            $fullimage.append([
                self.$largeImg,
                self.$fullimage.find('.og-details-left').show()]);
          }
        }).attr('src', eldata.largesrc);
      }
    },

    // Open the preview pane
    open: function() {
      setTimeout($.proxy(function() {  
        // set the height for the preview and the item
        var self = this;
        this.setHeights().then(function() {
          // scroll to position the preview in the right place
          self.positionPreview();
        });
      }, this), 25);

      var self = this;
      var goLeft = function() {
        if (current > 0) {
          var $li = $items.eq(current - 1);
          showPreview($li);
          $li.trigger('og-select');
        }
      };
      var goRight = function() {
        if (current < $items.length) {
          var $li = $items.eq(current + 1);
          showPreview($li);
          $li.trigger('og-select');
        }
      };
      $('.og-previous, .og-next').on('click', function() {
        if ($(this).is('.og-previous')) {
          goLeft();
        } else {
          goRight();
        }
      });
      $(document).on('keyup.og', function(e) {
        if (e.keyCode == 37) {
          goLeft();
        } else if (e.keyCode == 39) {
          goRight();
        } else if (e.keyCode == 27) {  // escape
          self.close();
          $grid.trigger('og-deselect');
        }
      });
    },

    // Close the preview pane
    close : function() {
      $('.og-previous, .og-next').off('click');
      $(document).off('keyup.og');

      var self = this,
        onEndFn = function() {
          self.$item.removeClass( 'og-expanded' );
          self.$item.css('height', '');
          self.$previewEl.remove();
        };

      setTimeout($.proxy(function() {
        if (typeof this.$largeImg !== 'undefined') {
          this.$largeImg.fadeOut('fast');
        }
        this.$previewEl.css('height', 0);
        // the current expanded item (might be different from this.$item)
        var $expandedItem = $items.eq(this.expandedIdx);
        $expandedItem.css('height', $expandedItem.data('height')).one(transEndEventName, onEndFn);

        if (!support) {
          onEndFn.call();
        }
      }, this), 25);
      
      return false;
    },

    // TODO: document, rename all these horrible variables.
    // this.$previewEl is the gray area
    // this.$item is the <li>, so its height must include the thumbnail's height!
    calcHeight: function() {
      var maxMargin = 100;  // image height + margin == previewHeight
      var scrollParents = scrollableParents($grid),
          $scrollParent = $(scrollParents.get(0)),
          scrollParentHeight = Math.min($scrollParent.height(), $(window).height()),
          thumbnailHeight = this.$item.data('height'),
          previewHeight = scrollParentHeight - thumbnailHeight - 50;

      if (previewHeight > settings.maxHeight) {
        previewHeight = settings.maxHeight;
      }

      this.previewHeight = previewHeight;  // this.$item.data('eg-height');  // height of image

      this.itemHeight = previewHeight + thumbnailHeight + 10;
    },

    setHeights: function() {
      var deferred = $.Deferred();
      var self = this,
        onEndFn = function() {
          self.$item.addClass('og-expanded');
          deferred.resolve({});
        };

      this.calcHeight();
      this.$previewEl.css('height', this.previewHeight);
      this.$item
        .css('height', this.itemHeight)
        .one(transEndEventName, onEndFn);

      if (!support) {
        onEndFn.call();
      }
      return deferred;
    },

    positionPreview: function() {
      // Scroll the newly-selected item to the top of the page.
      var $item = this.$item;
      var scrollParents = scrollableParents($grid),
          $scrollParent = $(scrollParents.get(0)),
          parentTop = $item.parent().position().top;
      if ($scrollParent.get(0).tagName == 'BODY') {
        parentTop = 0;  // .position() already accounts for <body>
      }
      $scrollParent.animate(
          {scrollTop: $item.position().top - parentTop},
          settings.speed);
    },

    setTransition: function() {
      this.$previewEl.css('transition', 'height ' + settings.speed + 'ms ' + settings.easing);
      this.$item.css('transition', 'height ' + settings.speed + 'ms ' + settings.easing);
    },

    getEl : function() {
      return this.$previewEl;
    }
  }

  return { 
    init: init,
    addItems: addItems,
    showPreview: showPreview,
    hidePreview: hidePreview
  };
};

(function($) {

  var imageMargin = 12;  // TODO(danvk): measure this.

// Returns an array of { height: XXX, images: [] }
// Each entry in images should have a height/width data field.
// TODO(danvk): could just return {height, startIndex, limitIndex} objects.
function partitionIntoRows(images, containerWidth, maxRowHeight) {
  var rows = [];
  var currentRow = [];
  $.each(images, function(i, image) {
    currentRow.push(image);
    var denom = 0;
    $.each(currentRow, function(_, image) {
      denom += $(image).data('eg-width') / $(image).data('eg-height');
    });
    var height = (containerWidth - imageMargin * currentRow.length) / denom;
    if (height < maxRowHeight) {
      rows.push({ height: height, images: currentRow });
      currentRow = [];
    }
  });
  if (currentRow.length > 0) {
    rows.push({ height: maxRowHeight, images: currentRow });
  }
  return rows;
}


function reflow($container) {
  var options = $container.data('og-options');
  var $ul = $container.find('ul.og-grid');
  flowImages($ul.find('li'), $ul.width(), options.rowHeight);
}


function flowImages(lis, width, maxRowHeight) {
  var rows = partitionIntoRows(lis, width, maxRowHeight);
  $.each(rows, function(_, row) {
    var height = Math.round(row.height);
    $.each(row.images, function(_, li) {
      var imgW = $(li).data('eg-width'),
          imgH = $(li).data('eg-height');
      $(li).find('img').attr({
        'width': Math.floor(imgW * (height / imgH)),
        'height': height
      });
    });
    // line wrap happens naturally here.
  });
}


// The image thumbnails all start hidden (by setting data-src instead of src).
// This shows the ones which are above the fold by transferring attributes.
function loadVisibleImages($container) {
  $container.find('img[data-src]').each(function(i, imgEl) {
    var $img = $(imgEl);
    if (isElementInViewport($img)) {
      $img
        .attr('src', $img.attr('data-src'))
        .removeAttr('data-src');
    }
  });
}

/**
 * options = {
 *   rowHeight: NNN
 * }
 * images = [ { src: "", width: M, height: N, largesrc: "", id: "" }, ... ]
 */
$.fn.expandableGrid = function(arg1) {
  var meth = null;
  if ($.type(arg1) === 'object') {
    meth = createExpandableGrid;
  } else if ($.type(arg1) === 'string') {
    if (arg1 === 'select') {
      meth = selectImage;
    } else if (arg1 == 'deselect') {
      meth = deselect;
    } else if (arg1 == 'selectedId') {
      meth = selectedId;
    }
  }
  if (!meth) {
    throw "Invalid expandableGrid call";
  }
  return meth.apply(this, arguments);
};

var createExpandableGrid = function(options, images) {
  var lis = $.map(images, function(image) {
    var $li = $('<li><a><img /></a></li>');
    $li.find('img').attr({
      'data-src': image.src
    });
    $li.find('a').attr({
      'data-largesrc': image.largesrc,
      'href': '#'
    });
    if (image.hasOwnProperty('id')) {
      $li.data('image-id', image.id);
    }
    $li.data({
      'eg-width': image.width,
      'eg-height': image.height
    });
    return $li.get(0);
  });

  $(this).data('og-options', options);

  var $ul = $('<ul class=og-grid>').append($(lis).hide());
  $ul.appendTo(this.empty());
  reflow(this);
  $(lis).show();
  loadVisibleImages(this);
  var container = this;
  $([this.get(0), document]).on('scroll', function() {
    loadVisibleImages($(container));  // new images may have become visible.
  });
  this.on('og-deselect', function() {
    // hack to load new images through the transition.
    var interval = window.setInterval(function() {
      loadVisibleImages($(container));
    }, 100);
    window.setTimeout(function() {
      window.clearInterval(interval);
    }, 400);
  });

  // This should really be an object...
  g = Grid();
  g.init($ul.get(0), options);
  $(this).data('og-grid', g);

  // The initial display may have resulted in new scroll bars.
  // It would be nice to avoid this.
  reflow(this);

  return this;
};

var deselect = function(_) {
  $(this).data('og-grid').hidePreview();
};

var selectImage = function(_, id) {
  var $li = null;
  $(this).find('li').each(function(_, li) {
    if ($(li).data('image-id') == id) {
      $li = $(li);
      return false;
    }
  });
  if (!$li) {
    return false;
  }

  $(this).data('og-grid').showPreview($li);
  return true;
};

var selectedId = function() {
  return $(this).find('li.og-expanded').data('image-id');
};

$(window).on('resize', function( event ) {
  $('ul.og-grid').each(function(_, ul) {
    reflow($(ul).parent());
  });
});

})(jQuery);
