



( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
        return factory( window, jQuery );
      });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('jquery')
      );
    } else {
      // browser global
      window.jQueryBridget = factory(
        window,
        window.jQuery
      );
    }
  
  }( window, function factory( window, jQuery ) {
  'use strict';
  
  // ----- utils ----- //
  
  var arraySlice = Array.prototype.slice;
  
  // helper function for logging errors
  // $.error breaks jQuery chaining
  var console = window.console;
  var logError = typeof console == 'undefined' ? function() {} :
    function( message ) {
      console.error( message );
    };
  
  // ----- jQueryBridget ----- //
  
  function jQueryBridget( namespace, PluginClass, $ ) {
    $ = $ || jQuery || window.jQuery;
    if ( !$ ) {
      return;
    }
  
    // add option method -> $().plugin('option', {...})
    if ( !PluginClass.prototype.option ) {
      // option setter
      PluginClass.prototype.option = function( opts ) {
        // bail out if not an object
        if ( !$.isPlainObject( opts ) ){
          return;
        }
        this.options = $.extend( true, this.options, opts );
      };
    }
  
    // make jQuery plugin
    $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
      if ( typeof arg0 == 'string' ) {
        // method call $().plugin( 'methodName', { options } )
        // shift arguments by 1
        var args = arraySlice.call( arguments, 1 );
        return methodCall( this, arg0, args );
      }
      // just $().plugin({ options })
      plainCall( this, arg0 );
      return this;
    };
  
    // $().plugin('methodName')
    function methodCall( $elems, methodName, args ) {
      var returnValue;
      var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';
  
      $elems.each( function( i, elem ) {
        // get instance
        var instance = $.data( elem, namespace );
        if ( !instance ) {
          logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
            pluginMethodStr );
          return;
        }
  
        var method = instance[ methodName ];
        if ( !method || methodName.charAt(0) == '_' ) {
          logError( pluginMethodStr + ' is not a valid method' );
          return;
        }
  
        // apply method, get return value
        var value = method.apply( instance, args );
        // set return value if value is returned, use only first value
        returnValue = returnValue === undefined ? value : returnValue;
      });
  
      return returnValue !== undefined ? returnValue : $elems;
    }
  
    function plainCall( $elems, options ) {
      $elems.each( function( i, elem ) {
        var instance = $.data( elem, namespace );
        if ( instance ) {
          // set options & init
          instance.option( options );
          instance._init();
        } else {
          // initialize new instance
          instance = new PluginClass( elem, options );
          $.data( elem, namespace, instance );
        }
      });
    }
  
    updateJQuery( $ );
  
  }
  
  // ----- updateJQuery ----- //
  
  // set $.bridget for v1 backwards compatibility
  function updateJQuery( $ ) {
    if ( !$ || ( $ && $.bridget ) ) {
      return;
    }
    $.bridget = jQueryBridget;
  }
  
  updateJQuery( jQuery || window.jQuery );
  
  // -----  ----- //
  
  return jQueryBridget;
  
  }));
  
  
  ( function( global, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, window */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'ev-emitter/ev-emitter',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory();
    } else {
      // Browser globals
      global.EvEmitter = factory();
    }
  
  }( typeof window != 'undefined' ? window : this, function() {
  
  
  
  function EvEmitter() {}
  
  var proto = EvEmitter.prototype;
  
  proto.on = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // set events hash
    var events = this._events = this._events || {};
    // set listeners array
    var listeners = events[ eventName ] = events[ eventName ] || [];
    // only add once
    if ( listeners.indexOf( listener ) == -1 ) {
      listeners.push( listener );
    }
  
    return this;
  };
  
  proto.once = function( eventName, listener ) {
    if ( !eventName || !listener ) {
      return;
    }
    // add event
    this.on( eventName, listener );
    // set once flag
    // set onceEvents hash
    var onceEvents = this._onceEvents = this._onceEvents || {};
    // set onceListeners object
    var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
    // set flag
    onceListeners[ listener ] = true;
  
    return this;
  };
  
  proto.off = function( eventName, listener ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    var index = listeners.indexOf( listener );
    if ( index != -1 ) {
      listeners.splice( index, 1 );
    }
  
    return this;
  };
  
  proto.emitEvent = function( eventName, args ) {
    var listeners = this._events && this._events[ eventName ];
    if ( !listeners || !listeners.length ) {
      return;
    }
    // copy over to avoid interference if .off() in listener
    listeners = listeners.slice(0);
    args = args || [];
    // once stuff
    var onceListeners = this._onceEvents && this._onceEvents[ eventName ];
  
    for ( var i=0; i < listeners.length; i++ ) {
      var listener = listeners[i]
      var isOnce = onceListeners && onceListeners[ listener ];
      if ( isOnce ) {
        // remove listener
        // remove before trigger to prevent recursion
        this.off( eventName, listener );
        // unset once flag
        delete onceListeners[ listener ];
      }
      // trigger listener
      listener.apply( this, args );
    }
  
    return this;
  };
  
  proto.allOff = function() {
    delete this._events;
    delete this._onceEvents;
  };
  
  return EvEmitter;
  
  }));
  
  
  ( function( window, factory ) {
    /* jshint strict: false */ /* globals define, module */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'get-size/get-size',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory();
    } else {
      // browser global
      window.getSize = factory();
    }
  
  })( window, function factory() {
  'use strict';
  
  // -------------------------- helpers -------------------------- //
  
  // get a number from a string, not a percentage
  function getStyleSize( value ) {
    var num = parseFloat( value );
    // not a percent like '100%', and a number
    var isValid = value.indexOf('%') == -1 && !isNaN( num );
    return isValid && num;
  }
  
  function noop() {}
  
  var logError = typeof console == 'undefined' ? noop :
    function( message ) {
      console.error( message );
    };
  
  // -------------------------- measurements -------------------------- //
  
  var measurements = [
    'paddingLeft',
    'paddingRight',
    'paddingTop',
    'paddingBottom',
    'marginLeft',
    'marginRight',
    'marginTop',
    'marginBottom',
    'borderLeftWidth',
    'borderRightWidth',
    'borderTopWidth',
    'borderBottomWidth'
  ];
  
  var measurementsLength = measurements.length;
  
  function getZeroSize() {
    var size = {
      width: 0,
      height: 0,
      innerWidth: 0,
      innerHeight: 0,
      outerWidth: 0,
      outerHeight: 0
    };
    for ( var i=0; i < measurementsLength; i++ ) {
      var measurement = measurements[i];
      size[ measurement ] = 0;
    }
    return size;
  }
  
  // -------------------------- getStyle -------------------------- //
  

  function getStyle( elem ) {
    var style = getComputedStyle( elem );
    if ( !style ) {
      logError( 'Style returned ' + style +
        '. Are you running this code in a hidden iframe on Firefox? ' +
        'See https://bit.ly/getsizebug1' );
    }
    return style;
  }
  
  // -------------------------- setup -------------------------- //
  
  var isSetup = false;
  
  var isBoxSizeOuter;
  

  function setup() {
    // setup once
    if ( isSetup ) {
      return;
    }
    isSetup = true;
  
    // -------------------------- box sizing -------------------------- //
  
   
    var div = document.createElement('div');
    div.style.width = '200px';
    div.style.padding = '1px 2px 3px 4px';
    div.style.borderStyle = 'solid';
    div.style.borderWidth = '1px 2px 3px 4px';
    div.style.boxSizing = 'border-box';
  
    var body = document.body || document.documentElement;
    body.appendChild( div );
    var style = getStyle( div );
    // round value for browser zoom. desandro/masonry#928
    isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
    getSize.isBoxSizeOuter = isBoxSizeOuter;
  
    body.removeChild( div );
  }
  
  // -------------------------- getSize -------------------------- //
  
  function getSize( elem ) {
    setup();
  
    // use querySeletor if elem is string
    if ( typeof elem == 'string' ) {
      elem = document.querySelector( elem );
    }
  
    // do not proceed on non-objects
    if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
      return;
    }
  
    var style = getStyle( elem );
  
    // if hidden, everything is 0
    if ( style.display == 'none' ) {
      return getZeroSize();
    }
  
    var size = {};
    size.width = elem.offsetWidth;
    size.height = elem.offsetHeight;
  
    var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';
  
    // get all measurements
    for ( var i=0; i < measurementsLength; i++ ) {
      var measurement = measurements[i];
      var value = style[ measurement ];
      var num = parseFloat( value );
      // any 'auto', 'medium' value will be 0
      size[ measurement ] = !isNaN( num ) ? num : 0;
    }
  
    var paddingWidth = size.paddingLeft + size.paddingRight;
    var paddingHeight = size.paddingTop + size.paddingBottom;
    var marginWidth = size.marginLeft + size.marginRight;
    var marginHeight = size.marginTop + size.marginBottom;
    var borderWidth = size.borderLeftWidth + size.borderRightWidth;
    var borderHeight = size.borderTopWidth + size.borderBottomWidth;
  
    var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;
  
    // overwrite width and height if we can get it from style
    var styleWidth = getStyleSize( style.width );
    if ( styleWidth !== false ) {
      size.width = styleWidth +
        // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
    }
  
    var styleHeight = getStyleSize( style.height );
    if ( styleHeight !== false ) {
      size.height = styleHeight +
        // add padding and border unless it's already including it
        ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
    }
  
    size.innerWidth = size.width - ( paddingWidth + borderWidth );
    size.innerHeight = size.height - ( paddingHeight + borderHeight );
  
    size.outerWidth = size.width + marginWidth;
    size.outerHeight = size.height + marginHeight;
  
    return size;
  }
  
  return getSize;
  
  });
  
  /**
   * matchesSelector v2.0.2
   * matchesSelector( element, '.selector' )
   * MIT license
   */
  
  /*jshint browser: true, strict: true, undef: true, unused: true */
  
  ( function( window, factory ) {
    /*global define: false, module: false */
    'use strict';
    // universal module definition
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'desandro-matches-selector/matches-selector',factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory();
    } else {
      // browser global
      window.matchesSelector = factory();
    }
  
  }( window, function factory() {
    'use strict';
  
    var matchesMethod = ( function() {
      var ElemProto = window.Element.prototype;
      // check for the standard method name first
      if ( ElemProto.matches ) {
        return 'matches';
      }
      // check un-prefixed
      if ( ElemProto.matchesSelector ) {
        return 'matchesSelector';
      }
      // check vendor prefixes
      var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];
  
      for ( var i=0; i < prefixes.length; i++ ) {
        var prefix = prefixes[i];
        var method = prefix + 'MatchesSelector';
        if ( ElemProto[ method ] ) {
          return method;
        }
      }
    })();
  
    return function matchesSelector( elem, selector ) {
      return elem[ matchesMethod ]( selector );
    };
  
  }));
  
  /**
   * Fizzy UI utils v2.0.7
   * MIT license
   */
  
  /*jshint browser: true, undef: true, unused: true, strict: true */
  
  ( function( window, factory ) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */
  
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'fizzy-ui-utils/utils',[
        'desandro-matches-selector/matches-selector'
      ], function( matchesSelector ) {
        return factory( window, matchesSelector );
      });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('desandro-matches-selector')
      );
    } else {
      // browser global
      window.fizzyUIUtils = factory(
        window,
        window.matchesSelector
      );
    }
  
  }( window, function factory( window, matchesSelector ) {
  
  
  
  var utils = {};
  
  // ----- extend ----- //
  
  // extends objects
  utils.extend = function( a, b ) {
    for ( var prop in b ) {
      a[ prop ] = b[ prop ];
    }
    return a;
  };
  
  // ----- modulo ----- //
  
  utils.modulo = function( num, div ) {
    return ( ( num % div ) + div ) % div;
  };
  
  // ----- makeArray ----- //
  
  var arraySlice = Array.prototype.slice;
  
  // turn element or nodeList into an array
  utils.makeArray = function( obj ) {
    if ( Array.isArray( obj ) ) {
      // use object if already an array
      return obj;
    }
    // return empty array if undefined or null. #6
    if ( obj === null || obj === undefined ) {
      return [];
    }
  
    var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
    if ( isArrayLike ) {
      // convert nodeList to array
      return arraySlice.call( obj );
    }
  
    // array of single index
    return [ obj ];
  };
  
  // ----- removeFrom ----- //
  
  utils.removeFrom = function( ary, obj ) {
    var index = ary.indexOf( obj );
    if ( index != -1 ) {
      ary.splice( index, 1 );
    }
  };
  
  // ----- getParent ----- //
  
  utils.getParent = function( elem, selector ) {
    while ( elem.parentNode && elem != document.body ) {
      elem = elem.parentNode;
      if ( matchesSelector( elem, selector ) ) {
        return elem;
      }
    }
  };
  
  // ----- getQueryElement ----- //
  
  // use element as selector string
  utils.getQueryElement = function( elem ) {
    if ( typeof elem == 'string' ) {
      return document.querySelector( elem );
    }
    return elem;
  };
  
  // ----- handleEvent ----- //
  
  // enable .ontype to trigger from .addEventListener( elem, 'type' )
  utils.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };
  
  // ----- filterFindElements ----- //
  
  utils.filterFindElements = function( elems, selector ) {
    // make array of elems
    elems = utils.makeArray( elems );
    var ffElems = [];
  
    elems.forEach( function( elem ) {
      // check that elem is an actual element
      if ( !( elem instanceof HTMLElement ) ) {
        return;
      }
      // add elem if no selector
      if ( !selector ) {
        ffElems.push( elem );
        return;
      }
      // filter & find items if we have a selector
      // filter
      if ( matchesSelector( elem, selector ) ) {
        ffElems.push( elem );
      }
      // find children
      var childElems = elem.querySelectorAll( selector );
      // concat childElems to filterFound array
      for ( var i=0; i < childElems.length; i++ ) {
        ffElems.push( childElems[i] );
      }
    });
  
    return ffElems;
  };
  
  // ----- debounceMethod ----- //
  
  utils.debounceMethod = function( _class, methodName, threshold ) {
    threshold = threshold || 100;
    // original method
    var method = _class.prototype[ methodName ];
    var timeoutName = methodName + 'Timeout';
  
    _class.prototype[ methodName ] = function() {
      var timeout = this[ timeoutName ];
      clearTimeout( timeout );
  
      var args = arguments;
      var _this = this;
      this[ timeoutName ] = setTimeout( function() {
        method.apply( _this, args );
        delete _this[ timeoutName ];
      }, threshold );
    };
  };
  
  // ----- docReady ----- //
  
  utils.docReady = function( callback ) {
    var readyState = document.readyState;
    if ( readyState == 'complete' || readyState == 'interactive' ) {
      // do async to allow for other scripts to run. metafizzy/flickity#441
      setTimeout( callback );
    } else {
      document.addEventListener( 'DOMContentLoaded', callback );
    }
  };
  
  // ----- htmlInit ----- //
  
  // http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
  utils.toDashed = function( str ) {
    return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
      return $1 + '-' + $2;
    }).toLowerCase();
  };
  
  var console = window.console;
  /**
   * allow user to initialize classes via [data-namespace] or .js-namespace class
   * htmlInit( Widget, 'widgetName' )
   * options are parsed from data-namespace-options
   */
  utils.htmlInit = function( WidgetClass, namespace ) {
    utils.docReady( function() {
      var dashedNamespace = utils.toDashed( namespace );
      var dataAttr = 'data-' + dashedNamespace;
      var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
      var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
      var elems = utils.makeArray( dataAttrElems )
        .concat( utils.makeArray( jsDashElems ) );
      var dataOptionsAttr = dataAttr + '-options';
      var jQuery = window.jQuery;
  
      elems.forEach( function( elem ) {
        var attr = elem.getAttribute( dataAttr ) ||
          elem.getAttribute( dataOptionsAttr );
        var options;
        try {
          options = attr && JSON.parse( attr );
        } catch ( error ) {
          // log error, do not initialize
          if ( console ) {
            console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
            ': ' + error );
          }
          return;
        }
        // initialize
        var instance = new WidgetClass( elem, options );
        // make available via $().data('namespace')
        if ( jQuery ) {
          jQuery.data( elem, namespace, instance );
        }
      });
  
    });
  };
  
  // -----  ----- //
  
  return utils;
  
  }));
  
  /**
   * Outlayer Item
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'outlayer/item',[
          'ev-emitter/ev-emitter',
          'get-size/get-size'
        ],
        factory
      );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory(
        require('ev-emitter'),
        require('get-size')
      );
    } else {
      // browser global
      window.Outlayer = {};
      window.Outlayer.Item = factory(
        window.EvEmitter,
        window.getSize
      );
    }
  
  }( window, function factory( EvEmitter, getSize ) {
  'use strict';
  
  // ----- helpers ----- //
  
  function isEmptyObj( obj ) {
    for ( var prop in obj ) {
      return false;
    }
    prop = null;
    return true;
  }
  
  // -------------------------- CSS3 support -------------------------- //
  
  
  var docElemStyle = document.documentElement.style;
  
  var transitionProperty = typeof docElemStyle.transition == 'string' ?
    'transition' : 'WebkitTransition';
  var transformProperty = typeof docElemStyle.transform == 'string' ?
    'transform' : 'WebkitTransform';
  
  var transitionEndEvent = {
    WebkitTransition: 'webkitTransitionEnd',
    transition: 'transitionend'
  }[ transitionProperty ];
  
  // cache all vendor properties that could have vendor prefix
  var vendorProperties = {
    transform: transformProperty,
    transition: transitionProperty,
    transitionDuration: transitionProperty + 'Duration',
    transitionProperty: transitionProperty + 'Property',
    transitionDelay: transitionProperty + 'Delay'
  };
  
  // -------------------------- Item -------------------------- //
  
  function Item( element, layout ) {
    if ( !element ) {
      return;
    }
  
    this.element = element;
    // parent layout class, i.e. Masonry, Isotope, or Packery
    this.layout = layout;
    this.position = {
      x: 0,
      y: 0
    };
  
    this._create();
  }
  
  // inherit EvEmitter
  var proto = Item.prototype = Object.create( EvEmitter.prototype );
  proto.constructor = Item;
  
  proto._create = function() {
    // transition objects
    this._transn = {
      ingProperties: {},
      clean: {},
      onEnd: {}
    };
  
    this.css({
      position: 'absolute'
    });
  };
  
  // trigger specified handler for event type
  proto.handleEvent = function( event ) {
    var method = 'on' + event.type;
    if ( this[ method ] ) {
      this[ method ]( event );
    }
  };
  
  proto.getSize = function() {
    this.size = getSize( this.element );
  };
  
  /**
   * apply CSS styles to element
   * @param {Object} style
   */
  proto.css = function( style ) {
    var elemStyle = this.element.style;
  
    for ( var prop in style ) {
      // use vendor property if available
      var supportedProp = vendorProperties[ prop ] || prop;
      elemStyle[ supportedProp ] = style[ prop ];
    }
  };
  
   // measure position, and sets it
  proto.getPosition = function() {
    var style = getComputedStyle( this.element );
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');
    var xValue = style[ isOriginLeft ? 'left' : 'right' ];
    var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
    var x = parseFloat( xValue );
    var y = parseFloat( yValue );
    // convert percent to pixels
    var layoutSize = this.layout.size;
    if ( xValue.indexOf('%') != -1 ) {
      x = ( x / 100 ) * layoutSize.width;
    }
    if ( yValue.indexOf('%') != -1 ) {
      y = ( y / 100 ) * layoutSize.height;
    }
    // clean up 'auto' or other non-integer values
    x = isNaN( x ) ? 0 : x;
    y = isNaN( y ) ? 0 : y;
    // remove padding from measurement
    x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
    y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;
  
    this.position.x = x;
    this.position.y = y;
  };
  
  // set settled position, apply padding
  proto.layoutPosition = function() {
    var layoutSize = this.layout.size;
    var style = {};
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');
  
    // x
    var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
    var xProperty = isOriginLeft ? 'left' : 'right';
    var xResetProperty = isOriginLeft ? 'right' : 'left';
  
    var x = this.position.x + layoutSize[ xPadding ];
    // set in percentage or pixels
    style[ xProperty ] = this.getXValue( x );
    // reset other property
    style[ xResetProperty ] = '';
  
    // y
    var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
    var yProperty = isOriginTop ? 'top' : 'bottom';
    var yResetProperty = isOriginTop ? 'bottom' : 'top';
  
    var y = this.position.y + layoutSize[ yPadding ];
    // set in percentage or pixels
    style[ yProperty ] = this.getYValue( y );
    // reset other property
    style[ yResetProperty ] = '';
  
    this.css( style );
    this.emitEvent( 'layout', [ this ] );
  };
  
  proto.getXValue = function( x ) {
    var isHorizontal = this.layout._getOption('horizontal');
    return this.layout.options.percentPosition && !isHorizontal ?
      ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
  };
  
  proto.getYValue = function( y ) {
    var isHorizontal = this.layout._getOption('horizontal');
    return this.layout.options.percentPosition && isHorizontal ?
      ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
  };
  
  proto._transitionTo = function( x, y ) {
    this.getPosition();
    // get current x & y from top/left
    var curX = this.position.x;
    var curY = this.position.y;
  
    var didNotMove = x == this.position.x && y == this.position.y;
  
    // save end position
    this.setPosition( x, y );
  
    // if did not move and not transitioning, just go to layout
    if ( didNotMove && !this.isTransitioning ) {
      this.layoutPosition();
      return;
    }
  
    var transX = x - curX;
    var transY = y - curY;
    var transitionStyle = {};
    transitionStyle.transform = this.getTranslate( transX, transY );
  
    this.transition({
      to: transitionStyle,
      onTransitionEnd: {
        transform: this.layoutPosition
      },
      isCleaning: true
    });
  };
  
  proto.getTranslate = function( x, y ) {
    // flip cooridinates if origin on right or bottom
    var isOriginLeft = this.layout._getOption('originLeft');
    var isOriginTop = this.layout._getOption('originTop');
    x = isOriginLeft ? x : -x;
    y = isOriginTop ? y : -y;
    return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
  };
  
  // non transition + transform support
  proto.goTo = function( x, y ) {
    this.setPosition( x, y );
    this.layoutPosition();
  };
  
  proto.moveTo = proto._transitionTo;
  
  proto.setPosition = function( x, y ) {
    this.position.x = parseFloat( x );
    this.position.y = parseFloat( y );
  };
  
  // ----- transition ----- //
  
  /**
   * @param {Object} style - CSS
   * @param {Function} onTransitionEnd
   */
  
  // non transition, just trigger callback
  proto._nonTransition = function( args ) {
    this.css( args.to );
    if ( args.isCleaning ) {
      this._removeStyles( args.to );
    }
    for ( var prop in args.onTransitionEnd ) {
      args.onTransitionEnd[ prop ].call( this );
    }
  };
  
  /**
   * proper transition
   * @param {Object} args - arguments
   *   @param {Object} to - style to transition to
   *   @param {Object} from - style to start transition from
   *   @param {Boolean} isCleaning - removes transition styles after transition
   *   @param {Function} onTransitionEnd - callback
   */
  proto.transition = function( args ) {
    // redirect to nonTransition if no transition duration
    if ( !parseFloat( this.layout.options.transitionDuration ) ) {
      this._nonTransition( args );
      return;
    }
  
    var _transition = this._transn;
    // keep track of onTransitionEnd callback by css property
    for ( var prop in args.onTransitionEnd ) {
      _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
    }
    // keep track of properties that are transitioning
    for ( prop in args.to ) {
      _transition.ingProperties[ prop ] = true;
      // keep track of properties to clean up when transition is done
      if ( args.isCleaning ) {
        _transition.clean[ prop ] = true;
      }
    }
  
    // set from styles
    if ( args.from ) {
      this.css( args.from );
      // force redraw. http://blog.alexmaccaw.com/css-transitions
      var h = this.element.offsetHeight;
      // hack for JSHint to hush about unused var
      h = null;
    }
    // enable transition
    this.enableTransition( args.to );
    // set styles that are transitioning
    this.css( args.to );
  
    this.isTransitioning = true;
  
  };
  
  // dash before all cap letters, including first for
  // WebkitTransform => -webkit-transform
  function toDashedAll( str ) {
    return str.replace( /([A-Z])/g, function( $1 ) {
      return '-' + $1.toLowerCase();
    });
  }
  
  var transitionProps = 'opacity,' + toDashedAll( transformProperty );
  
  proto.enableTransition = function(/* style */) {
    // HACK changing transitionProperty during a transition
    // will cause transition to jump
    if ( this.isTransitioning ) {
      return;
    }
  
    // make `transition: foo, bar, baz` from style object
    // HACK un-comment this when enableTransition can work
    // while a transition is happening
    // var transitionValues = [];
    // for ( var prop in style ) {
    //   // dash-ify camelCased properties like WebkitTransition
    //   prop = vendorProperties[ prop ] || prop;
    //   transitionValues.push( toDashedAll( prop ) );
    // }
    // munge number to millisecond, to match stagger
    var duration = this.layout.options.transitionDuration;
    duration = typeof duration == 'number' ? duration + 'ms' : duration;
    // enable transition styles
    this.css({
      transitionProperty: transitionProps,
      transitionDuration: duration,
      transitionDelay: this.staggerDelay || 0
    });
    // listen for transition end event
    this.element.addEventListener( transitionEndEvent, this, false );
  };
  
  // ----- events ----- //
  
  proto.onwebkitTransitionEnd = function( event ) {
    this.ontransitionend( event );
  };
  
  proto.onotransitionend = function( event ) {
    this.ontransitionend( event );
  };
  
  // properties that I munge to make my life easier
  var dashedVendorProperties = {
    '-webkit-transform': 'transform'
  };
  
  proto.ontransitionend = function( event ) {
    // disregard bubbled events from children
    if ( event.target !== this.element ) {
      return;
    }
    var _transition = this._transn;
    // get property name of transitioned property, convert to prefix-free
    var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;
  
    // remove property that has completed transitioning
    delete _transition.ingProperties[ propertyName ];
    // check if any properties are still transitioning
    if ( isEmptyObj( _transition.ingProperties ) ) {
      // all properties have completed transitioning
      this.disableTransition();
    }
    // clean style
    if ( propertyName in _transition.clean ) {
      // clean up style
      this.element.style[ event.propertyName ] = '';
      delete _transition.clean[ propertyName ];
    }
    // trigger onTransitionEnd callback
    if ( propertyName in _transition.onEnd ) {
      var onTransitionEnd = _transition.onEnd[ propertyName ];
      onTransitionEnd.call( this );
      delete _transition.onEnd[ propertyName ];
    }
  
    this.emitEvent( 'transitionEnd', [ this ] );
  };
  
  proto.disableTransition = function() {
    this.removeTransitionStyles();
    this.element.removeEventListener( transitionEndEvent, this, false );
    this.isTransitioning = false;
  };
  
  /**
   * removes style property from element
   * @param {Object} style
  **/
  proto._removeStyles = function( style ) {
    // clean up transition styles
    var cleanStyle = {};
    for ( var prop in style ) {
      cleanStyle[ prop ] = '';
    }
    this.css( cleanStyle );
  };
  
  var cleanTransitionStyle = {
    transitionProperty: '',
    transitionDuration: '',
    transitionDelay: ''
  };
  
  proto.removeTransitionStyles = function() {
    // remove transition
    this.css( cleanTransitionStyle );
  };
  
  // ----- stagger ----- //
  
  proto.stagger = function( delay ) {
    delay = isNaN( delay ) ? 0 : delay;
    this.staggerDelay = delay + 'ms';
  };
  
  // ----- show/hide/remove ----- //
  
  // remove element from DOM
  proto.removeElem = function() {
    this.element.parentNode.removeChild( this.element );
    // remove display: none
    this.css({ display: '' });
    this.emitEvent( 'remove', [ this ] );
  };
  
  proto.remove = function() {
    // just remove element if no transition support or no transition
    if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
      this.removeElem();
      return;
    }
  
    // start transition
    this.once( 'transitionEnd', function() {
      this.removeElem();
    });
    this.hide();
  };
  
  proto.reveal = function() {
    delete this.isHidden;
    // remove display: none
    this.css({ display: '' });
  
    var options = this.layout.options;
  
    var onTransitionEnd = {};
    var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
    onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;
  
    this.transition({
      from: options.hiddenStyle,
      to: options.visibleStyle,
      isCleaning: true,
      onTransitionEnd: onTransitionEnd
    });
  };
  
  proto.onRevealTransitionEnd = function() {
    // check if still visible
    // during transition, item may have been hidden
    if ( !this.isHidden ) {
      this.emitEvent('reveal');
    }
  };
  
  /**
   * get style property use for hide/reveal transition end
   * @param {String} styleProperty - hiddenStyle/visibleStyle
   * @returns {String}
   */
  proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
    var optionStyle = this.layout.options[ styleProperty ];
    // use opacity
    if ( optionStyle.opacity ) {
      return 'opacity';
    }
    // get first property
    for ( var prop in optionStyle ) {
      return prop;
    }
  };
  
  proto.hide = function() {
    // set flag
    this.isHidden = true;
    // remove display: none
    this.css({ display: '' });
  
    var options = this.layout.options;
  
    var onTransitionEnd = {};
    var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
    onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;
  
    this.transition({
      from: options.visibleStyle,
      to: options.hiddenStyle,
      // keep hidden stuff hidden
      isCleaning: true,
      onTransitionEnd: onTransitionEnd
    });
  };
  
  proto.onHideTransitionEnd = function() {
    // check if still hidden
    // during transition, item may have been un-hidden
    if ( this.isHidden ) {
      this.css({ display: 'none' });
      this.emitEvent('hide');
    }
  };
  
  proto.destroy = function() {
    this.css({
      position: '',
      left: '',
      right: '',
      top: '',
      bottom: '',
      transition: '',
      transform: ''
    });
  };
  
  return Item;
  
  }));
  
  /*!
   * Outlayer v2.1.1
   * the brains and guts of a layout library
   * MIT license
   */
  
  ( function( window, factory ) {
    'use strict';
    // universal module definition
    /* jshint strict: false */ /* globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD - RequireJS
      define( 'outlayer/outlayer',[
          'ev-emitter/ev-emitter',
          'get-size/get-size',
          'fizzy-ui-utils/utils',
          './item'
        ],
        function( EvEmitter, getSize, utils, Item ) {
          return factory( window, EvEmitter, getSize, utils, Item);
        }
      );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS - Browserify, Webpack
      module.exports = factory(
        window,
        require('ev-emitter'),
        require('get-size'),
        require('fizzy-ui-utils'),
        require('./item')
      );
    } else {
      // browser global
      window.Outlayer = factory(
        window,
        window.EvEmitter,
        window.getSize,
        window.fizzyUIUtils,
        window.Outlayer.Item
      );
    }
  
  }( window, function factory( window, EvEmitter, getSize, utils, Item ) {
  'use strict';
  
  // ----- vars ----- //
  
  var console = window.console;
  var jQuery = window.jQuery;
  var noop = function() {};
  
  // -------------------------- Outlayer -------------------------- //
  
  // globally unique identifiers
  var GUID = 0;
  // internal store of all Outlayer intances
  var instances = {};
  
  
  /**
   * @param {Element, String} element
   * @param {Object} options
   * @constructor
   */
  function Outlayer( element, options ) {
    var queryElement = utils.getQueryElement( element );
    if ( !queryElement ) {
      if ( console ) {
        console.error( 'Bad element for ' + this.constructor.namespace +
          ': ' + ( queryElement || element ) );
      }
      return;
    }
    this.element = queryElement;
    // add jQuery
    if ( jQuery ) {
      this.$element = jQuery( this.element );
    }
  
    // options
    this.options = utils.extend( {}, this.constructor.defaults );
    this.option( options );
  
    // add id for Outlayer.getFromElement
    var id = ++GUID;
    this.element.outlayerGUID = id; // expando
    instances[ id ] = this; // associate via id
  
    // kick it off
    this._create();
  
    var isInitLayout = this._getOption('initLayout');
    if ( isInitLayout ) {
      this.layout();
    }
  }
  
  // settings are for internal use only
  Outlayer.namespace = 'outlayer';
  Outlayer.Item = Item;
  
  // default options
  Outlayer.defaults = {
    containerStyle: {
      position: 'relative'
    },
    initLayout: true,
    originLeft: true,
    originTop: true,
    resize: true,
    resizeContainer: true,
    // item options
    transitionDuration: '0.4s',
    hiddenStyle: {
      opacity: 0,
      transform: 'scale(0.001)'
    },
    visibleStyle: {
      opacity: 1,
      transform: 'scale(1)'
    }
  };
  
  var proto = Outlayer.prototype;
  // inherit EvEmitter
  utils.extend( proto, EvEmitter.prototype );
  
  /**
   * set options
   * @param {Object} opts
   */
  proto.option = function( opts ) {
    utils.extend( this.options, opts );
  };
  
  /**
   * get backwards compatible option value, check old name
   */
  proto._getOption = function( option ) {
    var oldOption = this.constructor.compatOptions[ option ];
    return oldOption && this.options[ oldOption ] !== undefined ?
      this.options[ oldOption ] : this.options[ option ];
  };
  
  Outlayer.compatOptions = {
    // currentName: oldName
    initLayout: 'isInitLayout',
    horizontal: 'isHorizontal',
    layoutInstant: 'isLayoutInstant',
    originLeft: 'isOriginLeft',
    originTop: 'isOriginTop',
    resize: 'isResizeBound',
    resizeContainer: 'isResizingContainer'
  };
  
  proto._create = function() {
    // get items from children
    this.reloadItems();
    // elements that affect layout, but are not laid out
    this.stamps = [];
    this.stamp( this.options.stamp );
    // set container style
    utils.extend( this.element.style, this.options.containerStyle );
  
    // bind resize method
    var canBindResize = this._getOption('resize');
    if ( canBindResize ) {
      this.bindResize();
    }
  };
  
  // goes through all children again and gets bricks in proper order
  proto.reloadItems = function() {
    // collection of item elements
    this.items = this._itemize( this.element.children );
  };
  
  
  /**
   * turn elements into Outlayer.Items to be used in layout
   * @param {Array or NodeList or HTMLElement} elems
   * @returns {Array} items - collection of new Outlayer Items
   */
  proto._itemize = function( elems ) {
  
    var itemElems = this._filterFindItemElements( elems );
    var Item = this.constructor.Item;
  
    // create new Outlayer Items for collection
    var items = [];
    for ( var i=0; i < itemElems.length; i++ ) {
      var elem = itemElems[i];
      var item = new Item( elem, this );
      items.push( item );
    }
  
    return items;
  };
  
  /**
   * get item elements to be used in layout
   * @param {Array or NodeList or HTMLElement} elems
   * @returns {Array} items - item elements
   */
  proto._filterFindItemElements = function( elems ) {
    return utils.filterFindElements( elems, this.options.itemSelector );
  };
  
  /**
   * getter method for getting item elements
   * @returns {Array} elems - collection of item elements
   */
  proto.getItemElements = function() {
    return this.items.map( function( item ) {
      return item.element;
    });
  };
  
  // ----- init & layout ----- //
  
  /**
   * lays out all items
   */
  proto.layout = function() {
    this._resetLayout();
    this._manageStamps();
  
    // don't animate first layout
    var layoutInstant = this._getOption('layoutInstant');
    var isInstant = layoutInstant !== undefined ?
      layoutInstant : !this._isLayoutInited;
    this.layoutItems( this.items, isInstant );
  
    // flag for initalized
    this._isLayoutInited = true;
  };
  
  // _init is alias for layout
  proto._init = proto.layout;
  
  /**
   * logic before any new layout
   */
  proto._resetLayout = function() {
    this.getSize();
  };
  
  
  proto.getSize = function() {
    this.size = getSize( this.element );
  };
  
  /**
   * get measurement from option, for columnWidth, rowHeight, gutter
   * if option is String -> get element from selector string, & get size of element
   * if option is Element -> get size of element
   * else use option as a number
   *
   * @param {String} measurement
   * @param {String} size - width or height
   * @private
   */
  proto._getMeasurement = function( measurement, size ) {
    var option = this.options[ measurement ];
    var elem;
    if ( !option ) {
      // default to 0
      this[ measurement ] = 0;
    } else {
      // use option as an element
      if ( typeof option == 'string' ) {
        elem = this.element.querySelector( option );
      } else if ( option instanceof HTMLElement ) {
        elem = option;
      }
      // use size of element, if element
      this[ measurement ] = elem ? getSize( elem )[ size ] : option;
    }
  };
  
  /**
   * layout a collection of item elements
   * @api public
   */
  proto.layoutItems = function( items, isInstant ) {
    items = this._getItemsForLayout( items );
  
    this._layoutItems( items, isInstant );
  
    this._postLayout();
  };
  
  /**
   * get the items to be laid out
   * you may want to skip over some items
   * @param {Array} items
   * @returns {Array} items
   */
  proto._getItemsForLayout = function( items ) {
    return items.filter( function( item ) {
      return !item.isIgnored;
    });
  };
  
  /**
   * layout items
   * @param {Array} items
   * @param {Boolean} isInstant
   */
  proto._layoutItems = function( items, isInstant ) {
    this._emitCompleteOnItems( 'layout', items );
  
    if ( !items || !items.length ) {
      // no items, emit event with empty array
      return;
    }
  
    var queue = [];
  
    items.forEach( function( item ) {
      // get x/y object from method
      var position = this._getItemLayoutPosition( item );
      // enqueue
      position.item = item;
      position.isInstant = isInstant || item.isLayoutInstant;
      queue.push( position );
    }, this );
  
    this._processLayoutQueue( queue );
  };
  
  /**
   * get item layout position
   * @param {Outlayer.Item} item
   * @returns {Object} x and y position
   */
  proto._getItemLayoutPosition = function( /* item */ ) {
    return {
      x: 0,
      y: 0
    };
  };
  
  /**
   * iterate over array and position each item
   * Reason being - separating this logic prevents 'layout invalidation'
   * thx @paul_irish
   * @param {Array} queue
   */
  proto._processLayoutQueue = function( queue ) {
    this.updateStagger();
    queue.forEach( function( obj, i ) {
      this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
    }, this );
  };
  
  // set stagger from option in milliseconds number
  proto.updateStagger = function() {
    var stagger = this.options.stagger;
    if ( stagger === null || stagger === undefined ) {
      this.stagger = 0;
      return;
    }
    this.stagger = getMilliseconds( stagger );
    return this.stagger;
  };
  
  /**
   * Sets position of item in DOM
   * @param {Outlayer.Item} item
   * @param {Number} x - horizontal position
   * @param {Number} y - vertical position
   * @param {Boolean} isInstant - disables transitions
   */
  proto._positionItem = function( item, x, y, isInstant, i ) {
    if ( isInstant ) {
      // if not transition, just set CSS
      item.goTo( x, y );
    } else {
      item.stagger( i * this.stagger );
      item.moveTo( x, y );
    }
  };
  
  /**
   * Any logic you want to do after each layout,
   * i.e. size the container
   */
  proto._postLayout = function() {
    this.resizeContainer();
  };
  
  proto.resizeContainer = function() {
    var isResizingContainer = this._getOption('resizeContainer');
    if ( !isResizingContainer ) {
      return;
    }
    var size = this._getContainerSize();
    if ( size ) {
      this._setContainerMeasure( size.width, true );
      this._setContainerMeasure( size.height, false );
    }
  };
  
  /**
   * Sets width or height of container if returned
   * @returns {Object} size
   *   @param {Number} width
   *   @param {Number} height
   */
  proto._getContainerSize = noop;
  
  /**
   * @param {Number} measure - size of width or height
   * @param {Boolean} isWidth
   */
  proto._setContainerMeasure = function( measure, isWidth ) {
    if ( measure === undefined ) {
      return;
    }
  
    var elemSize = this.size;
    // add padding and border width if border box
    if ( elemSize.isBorderBox ) {
      measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
        elemSize.borderLeftWidth + elemSize.borderRightWidth :
        elemSize.paddingBottom + elemSize.paddingTop +
        elemSize.borderTopWidth + elemSize.borderBottomWidth;
    }
  
    measure = Math.max( measure, 0 );
    this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
  };
  
  /**
   * emit eventComplete on a collection of items events
   * @param {String} eventName
   * @param {Array} items - Outlayer.Items
   */
  proto._emitCompleteOnItems = function( eventName, items ) {
    var _this = this;
    function onComplete() {
      _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
    }
  
    var count = items.length;
    if ( !items || !count ) {
      onComplete();
      return;
    }
  
    var doneCount = 0;
    function tick() {
      doneCount++;
      if ( doneCount == count ) {
        onComplete();
      }
    }
  
    // bind callback
    items.forEach( function( item ) {
      item.once( eventName, tick );
    });
  };
  
  /**
   * emits events via EvEmitter and jQuery events
   * @param {String} type - name of event
   * @param {Event} event - original event
   * @param {Array} args - extra arguments
   */
  proto.dispatchEvent = function( type, event, args ) {
    // add original event to arguments
    var emitArgs = event ? [ event ].concat( args ) : args;
    this.emitEvent( type, emitArgs );
  
    if ( jQuery ) {
      // set this.$element
      this.$element = this.$element || jQuery( this.element );
      if ( event ) {
        // create jQuery event
        var $event = jQuery.Event( event );
        $event.type = type;
        this.$element.trigger( $event, args );
      } else {
        // just trigger with type if no event available
        this.$element.trigger( type, args );
      }
    }
  };
  
  // -------------------------- ignore & stamps -------------------------- //
  
  
  /**
   * keep item in collection, but do not lay it out
   * ignored items do not get skipped in layout
   * @param {Element} elem
   */
  proto.ignore = function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      item.isIgnored = true;
    }
  };
  
  /**
   * return item to layout collection
   * @param {Element} elem
   */
  proto.unignore = function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      delete item.isIgnored;
    }
  };
  
  /**
   * adds elements to stamps
   * @param {NodeList, Array, Element, or String} elems
   */
  proto.stamp = function( elems ) {
    elems = this._find( elems );
    if ( !elems ) {
      return;
    }
  
    this.stamps = this.stamps.concat( elems );
    // ignore
    elems.forEach( this.ignore, this );
  };
  
  /**
   * removes elements to stamps
   * @param {NodeList, Array, or Element} elems
   */
  proto.unstamp = function( elems ) {
    elems = this._find( elems );
    if ( !elems ){
      return;
    }
  
    elems.forEach( function( elem ) {
      // filter out removed stamp elements
      utils.removeFrom( this.stamps, elem );
      this.unignore( elem );
    }, this );
  };
  
  /**
   * finds child elements
   * @param {NodeList, Array, Element, or String} elems
   * @returns {Array} elems
   */
  proto._find = function( elems ) {
    if ( !elems ) {
      return;
    }
    // if string, use argument as selector string
    if ( typeof elems == 'string' ) {
      elems = this.element.querySelectorAll( elems );
    }
    elems = utils.makeArray( elems );
    return elems;
  };
  
  proto._manageStamps = function() {
    if ( !this.stamps || !this.stamps.length ) {
      return;
    }
  
    this._getBoundingRect();
  
    this.stamps.forEach( this._manageStamp, this );
  };
  
  // update boundingLeft / Top
  proto._getBoundingRect = function() {
    // get bounding rect for container element
    var boundingRect = this.element.getBoundingClientRect();
    var size = this.size;
    this._boundingRect = {
      left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
      top: boundingRect.top + size.paddingTop + size.borderTopWidth,
      right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
      bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
    };
  };
  
  /**
   * @param {Element} stamp
  **/
  proto._manageStamp = noop;
  
  /**
   * get x/y position of element relative to container element
   * @param {Element} elem
   * @returns {Object} offset - has left, top, right, bottom
   */
  proto._getElementOffset = function( elem ) {
    var boundingRect = elem.getBoundingClientRect();
    var thisRect = this._boundingRect;
    var size = getSize( elem );
    var offset = {
      left: boundingRect.left - thisRect.left - size.marginLeft,
      top: boundingRect.top - thisRect.top - size.marginTop,
      right: thisRect.right - boundingRect.right - size.marginRight,
      bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
    };
    return offset;
  };
  
  // -------------------------- resize -------------------------- //
  
  // enable event handlers for listeners
  // i.e. resize -> onresize
  proto.handleEvent = utils.handleEvent;
  
  /**
   * Bind layout to window resizing
   */
  proto.bindResize = function() {
    window.addEventListener( 'resize', this );
    this.isResizeBound = true;
  };
  
  /**
   * Unbind layout to window resizing
   */
  proto.unbindResize = function() {
    window.removeEventListener( 'resize', this );
    this.isResizeBound = false;
  };
  
  proto.onresize = function() {
    this.resize();
  };
  
  utils.debounceMethod( Outlayer, 'onresize', 100 );
  
  proto.resize = function() {
    // don't trigger if size did not change
    // or if resize was unbound. See #9
    if ( !this.isResizeBound || !this.needsResizeLayout() ) {
      return;
    }
  
    this.layout();
  };
  
  /**
   * check if layout is needed post layout
   * @returns Boolean
   */
  proto.needsResizeLayout = function() {
    var size = getSize( this.element );
    // check that this.size and size are there
    // IE8 triggers resize on body size change, so they might not be
    var hasSizes = this.size && size;
    return hasSizes && size.innerWidth !== this.size.innerWidth;
  };
  
  // -------------------------- methods -------------------------- //
  
  /**
   * add items to Outlayer instance
   * @param {Array or NodeList or Element} elems
   * @returns {Array} items - Outlayer.Items
  **/
  proto.addItems = function( elems ) {
    var items = this._itemize( elems );
    // add items to collection
    if ( items.length ) {
      this.items = this.items.concat( items );
    }
    return items;
  };
  
  /**
   * Layout newly-appended item elements
   * @param {Array or NodeList or Element} elems
   */
  proto.appended = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    // layout and reveal just the new items
    this.layoutItems( items, true );
    this.reveal( items );
  };
  
  /**
   * Layout prepended elements
   * @param {Array or NodeList or Element} elems
   */
  proto.prepended = function( elems ) {
    var items = this._itemize( elems );
    if ( !items.length ) {
      return;
    }
    // add items to beginning of collection
    var previousItems = this.items.slice(0);
    this.items = items.concat( previousItems );
    // start new layout
    this._resetLayout();
    this._manageStamps();
    // layout new stuff without transition
    this.layoutItems( items, true );
    this.reveal( items );
    // layout previous items
    this.layoutItems( previousItems );
  };
  
  /**
   * reveal a collection of items
   * @param {Array of Outlayer.Items} items
   */
  proto.reveal = function( items ) {
    this._emitCompleteOnItems( 'reveal', items );
    if ( !items || !items.length ) {
      return;
    }
    var stagger = this.updateStagger();
    items.forEach( function( item, i ) {
      item.stagger( i * stagger );
      item.reveal();
    });
  };
  
  /**
   * hide a collection of items
   * @param {Array of Outlayer.Items} items
   */
  proto.hide = function( items ) {
    this._emitCompleteOnItems( 'hide', items );
    if ( !items || !items.length ) {
      return;
    }
    var stagger = this.updateStagger();
    items.forEach( function( item, i ) {
      item.stagger( i * stagger );
      item.hide();
    });
  };
  
  /**
   * reveal item elements
   * @param {Array}, {Element}, {NodeList} items
   */
  proto.revealItemElements = function( elems ) {
    var items = this.getItems( elems );
    this.reveal( items );
  };
  
  /**
   * hide item elements
   * @param {Array}, {Element}, {NodeList} items
   */
  proto.hideItemElements = function( elems ) {
    var items = this.getItems( elems );
    this.hide( items );
  };
  
  /**
   * get Outlayer.Item, given an Element
   * @param {Element} elem
   * @param {Function} callback
   * @returns {Outlayer.Item} item
   */
  proto.getItem = function( elem ) {
    // loop through items to get the one that matches
    for ( var i=0; i < this.items.length; i++ ) {
      var item = this.items[i];
      if ( item.element == elem ) {
        // return item
        return item;
      }
    }
  };
  
  /**
   * get collection of Outlayer.Items, given Elements
   * @param {Array} elems
   * @returns {Array} items - Outlayer.Items
   */
  proto.getItems = function( elems ) {
    elems = utils.makeArray( elems );
    var items = [];
    elems.forEach( function( elem ) {
      var item = this.getItem( elem );
      if ( item ) {
        items.push( item );
      }
    }, this );
  
    return items;
  };
  
  /**
   * remove element(s) from instance and DOM
   * @param {Array or NodeList or Element} elems
   */
  proto.remove = function( elems ) {
    var removeItems = this.getItems( elems );
  
    this._emitCompleteOnItems( 'remove', removeItems );
  
    // bail if no items to remove
    if ( !removeItems || !removeItems.length ) {
      return;
    }
  
    removeItems.forEach( function( item ) {
      item.remove();
      // remove item from collection
      utils.removeFrom( this.items, item );
    }, this );
  };
  
  // ----- destroy ----- //
  
  // remove and disable Outlayer instance
  proto.destroy = function() {
    // clean up dynamic styles
    var style = this.element.style;
    style.height = '';
    style.position = '';
    style.width = '';
    // destroy items
    this.items.forEach( function( item ) {
      item.destroy();
    });
  
    this.unbindResize();
  
    var id = this.element.outlayerGUID;
    delete instances[ id ]; // remove reference to instance by id
    delete this.element.outlayerGUID;
    // remove data for jQuery
    if ( jQuery ) {
      jQuery.removeData( this.element, this.constructor.namespace );
    }
  
  };
  
  // -------------------------- data -------------------------- //
  
  /**
   * get Outlayer instance from element
   * @param {Element} elem
   * @returns {Outlayer}
   */
  Outlayer.data = function( elem ) {
    elem = utils.getQueryElement( elem );
    var id = elem && elem.outlayerGUID;
    return id && instances[ id ];
  };
  
  
  // -------------------------- create Outlayer class -------------------------- //
  
  /**
   * create a layout class
   * @param {String} namespace
   */
  Outlayer.create = function( namespace, options ) {
    // sub-class Outlayer
    var Layout = subclass( Outlayer );
    // apply new options and compatOptions
    Layout.defaults = utils.extend( {}, Outlayer.defaults );
    utils.extend( Layout.defaults, options );
    Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );
  
    Layout.namespace = namespace;
  
    Layout.data = Outlayer.data;
  
    // sub-class Item
    Layout.Item = subclass( Item );
  
    // -------------------------- declarative -------------------------- //
  
    utils.htmlInit( Layout, namespace );
  
    // -------------------------- jQuery bridge -------------------------- //
  
    // make into jQuery plugin
    if ( jQuery && jQuery.bridget ) {
      jQuery.bridget( namespace, Layout );
    }
  
    return Layout;
  };
  
  function subclass( Parent ) {
    function SubClass() {
      Parent.apply( this, arguments );
    }
  
    SubClass.prototype = Object.create( Parent.prototype );
    SubClass.prototype.constructor = SubClass;
  
    return SubClass;
  }
  
  // ----- helpers ----- //
  
  // how many milliseconds are in each unit
  var msUnits = {
    ms: 1,
    s: 1000
  };
  
  // munge time-like parameter into millisecond number
  // '0.4s' -> 40
  function getMilliseconds( time ) {
    if ( typeof time == 'number' ) {
      return time;
    }
    var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
    var num = matches && matches[1];
    var unit = matches && matches[2];
    if ( !num.length ) {
      return 0;
    }
    num = parseFloat( num );
    var mult = msUnits[ unit ] || 1;
    return num * mult;
  }
  
  // ----- fin ----- //
  
  // back in global
  Outlayer.Item = Item;
  
  return Outlayer;
  
  }));
  
  /**
   * Isotope Item
  **/
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/item',[
          'outlayer/outlayer'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('outlayer')
      );
    } else {
      // browser global
      window.Isotope = window.Isotope || {};
      window.Isotope.Item = factory(
        window.Outlayer
      );
    }
  
  }( window, function factory( Outlayer ) {
  'use strict';
  
  // -------------------------- Item -------------------------- //
  
  // sub-class Outlayer Item
  function Item() {
    Outlayer.Item.apply( this, arguments );
  }
  
  var proto = Item.prototype = Object.create( Outlayer.Item.prototype );
  
  var _create = proto._create;
  proto._create = function() {
    // assign id, used for original-order sorting
    this.id = this.layout.itemGUID++;
    _create.call( this );
    this.sortData = {};
  };
  
  proto.updateSortData = function() {
    if ( this.isIgnored ) {
      return;
    }
    // default sorters
    this.sortData.id = this.id;
    // for backward compatibility
    this.sortData['original-order'] = this.id;
    this.sortData.random = Math.random();
    // go thru getSortData obj and apply the sorters
    var getSortData = this.layout.options.getSortData;
    var sorters = this.layout._sorters;
    for ( var key in getSortData ) {
      var sorter = sorters[ key ];
      this.sortData[ key ] = sorter( this.element, this );
    }
  };
  
  var _destroy = proto.destroy;
  proto.destroy = function() {
    // call super
    _destroy.apply( this, arguments );
    // reset display, #741
    this.css({
      display: ''
    });
  };
  
  return Item;
  
  }));
  
  /**
   * Isotope LayoutMode
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-mode',[
          'get-size/get-size',
          'outlayer/outlayer'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('get-size'),
        require('outlayer')
      );
    } else {
      // browser global
      window.Isotope = window.Isotope || {};
      window.Isotope.LayoutMode = factory(
        window.getSize,
        window.Outlayer
      );
    }
  
  }( window, function factory( getSize, Outlayer ) {
    'use strict';
  
    // layout mode class
    function LayoutMode( isotope ) {
      this.isotope = isotope;
      // link properties
      if ( isotope ) {
        this.options = isotope.options[ this.namespace ];
        this.element = isotope.element;
        this.items = isotope.filteredItems;
        this.size = isotope.size;
      }
    }
  
    var proto = LayoutMode.prototype;
  
    /**
     * some methods should just defer to default Outlayer method
     * and reference the Isotope instance as `this`
    **/
    var facadeMethods = [
      '_resetLayout',
      '_getItemLayoutPosition',
      '_manageStamp',
      '_getContainerSize',
      '_getElementOffset',
      'needsResizeLayout',
      '_getOption'
    ];
  
    facadeMethods.forEach( function( methodName ) {
      proto[ methodName ] = function() {
        return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
      };
    });
  
    // -----  ----- //
  
    // for horizontal layout modes, check vertical size
    proto.needsVerticalResizeLayout = function() {
      // don't trigger if size did not change
      var size = getSize( this.isotope.element );
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var hasSizes = this.isotope.size && size;
      return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
    };
  
    // ----- measurements ----- //
  
    proto._getMeasurement = function() {
      this.isotope._getMeasurement.apply( this, arguments );
    };
  
    proto.getColumnWidth = function() {
      this.getSegmentSize( 'column', 'Width' );
    };
  
    proto.getRowHeight = function() {
      this.getSegmentSize( 'row', 'Height' );
    };
  
    /**
     * get columnWidth or rowHeight
     * segment: 'column' or 'row'
     * size 'Width' or 'Height'
    **/
    proto.getSegmentSize = function( segment, size ) {
      var segmentName = segment + size;
      var outerSize = 'outer' + size;
      // columnWidth / outerWidth // rowHeight / outerHeight
      this._getMeasurement( segmentName, outerSize );
      // got rowHeight or columnWidth, we can chill
      if ( this[ segmentName ] ) {
        return;
      }
      // fall back to item of first element
      var firstItemSize = this.getFirstItemSize();
      this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
        // or size of container
        this.isotope.size[ 'inner' + size ];
    };
  
    proto.getFirstItemSize = function() {
      var firstItem = this.isotope.filteredItems[0];
      return firstItem && firstItem.element && getSize( firstItem.element );
    };
  
    // ----- methods that should reference isotope ----- //
  
    proto.layout = function() {
      this.isotope.layout.apply( this.isotope, arguments );
    };
  
    proto.getSize = function() {
      this.isotope.getSize();
      this.size = this.isotope.size;
    };
  
    // -------------------------- create -------------------------- //
  
    LayoutMode.modes = {};
  
    LayoutMode.create = function( namespace, options ) {
  
      function Mode() {
        LayoutMode.apply( this, arguments );
      }
  
      Mode.prototype = Object.create( proto );
      Mode.prototype.constructor = Mode;
  
      // default options
      if ( options ) {
        Mode.options = options;
      }
  
      Mode.prototype.namespace = namespace;
      // register in Isotope
      LayoutMode.modes[ namespace ] = Mode;
  
      return Mode;
    };
  
    return LayoutMode;
  
  }));
  
  /*!
   * Masonry v4.2.1
   * Cascading grid layout library
   * https://masonry.desandro.com
   * MIT License
   * by David DeSandro
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'masonry-layout/masonry',[
          'outlayer/outlayer',
          'get-size/get-size'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('outlayer'),
        require('get-size')
      );
    } else {
      // browser global
      window.Masonry = factory(
        window.Outlayer,
        window.getSize
      );
    }
  
  }( window, function factory( Outlayer, getSize ) {
  
  
  
  // -------------------------- masonryDefinition -------------------------- //
  
    // create an Outlayer layout class
    var Masonry = Outlayer.create('masonry');
    // isFitWidth -> fitWidth
    Masonry.compatOptions.fitWidth = 'isFitWidth';
  
    var proto = Masonry.prototype;
  
    proto._resetLayout = function() {
      this.getSize();
      this._getMeasurement( 'columnWidth', 'outerWidth' );
      this._getMeasurement( 'gutter', 'outerWidth' );
      this.measureColumns();
  
      // reset column Y
      this.colYs = [];
      for ( var i=0; i < this.cols; i++ ) {
        this.colYs.push( 0 );
      }
  
      this.maxY = 0;
      this.horizontalColIndex = 0;
    };
  
    proto.measureColumns = function() {
      this.getContainerWidth();
      // if columnWidth is 0, default to outerWidth of first item
      if ( !this.columnWidth ) {
        var firstItem = this.items[0];
        var firstItemElem = firstItem && firstItem.element;
        // columnWidth fall back to item of first element
        this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
          // if first elem has no width, default to size of container
          this.containerWidth;
      }
  
      var columnWidth = this.columnWidth += this.gutter;
  
      // calculate columns
      var containerWidth = this.containerWidth + this.gutter;
      var cols = containerWidth / columnWidth;
      // fix rounding errors, typically with gutters
      var excess = columnWidth - containerWidth % columnWidth;
      // if overshoot is less than a pixel, round up, otherwise floor it
      var mathMethod = excess && excess < 1 ? 'round' : 'floor';
      cols = Math[ mathMethod ]( cols );
      this.cols = Math.max( cols, 1 );
    };
  
    proto.getContainerWidth = function() {
      // container is parent if fit width
      var isFitWidth = this._getOption('fitWidth');
      var container = isFitWidth ? this.element.parentNode : this.element;
      // check that this.size and size are there
      // IE8 triggers resize on body size change, so they might not be
      var size = getSize( container );
      this.containerWidth = size && size.innerWidth;
    };
  
    proto._getItemLayoutPosition = function( item ) {
      item.getSize();
      // how many columns does this brick span
      var remainder = item.size.outerWidth % this.columnWidth;
      var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
      // round if off by 1 pixel, otherwise use ceil
      var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
      colSpan = Math.min( colSpan, this.cols );
      // use horizontal or top column position
      var colPosMethod = this.options.horizontalOrder ?
        '_getHorizontalColPosition' : '_getTopColPosition';
      var colPosition = this[ colPosMethod ]( colSpan, item );
      // position the brick
      var position = {
        x: this.columnWidth * colPosition.col,
        y: colPosition.y
      };
      // apply setHeight to necessary columns
      var setHeight = colPosition.y + item.size.outerHeight;
      var setMax = colSpan + colPosition.col;
      for ( var i = colPosition.col; i < setMax; i++ ) {
        this.colYs[i] = setHeight;
      }
  
      return position;
    };
  
    proto._getTopColPosition = function( colSpan ) {
      var colGroup = this._getTopColGroup( colSpan );
      // get the minimum Y value from the columns
      var minimumY = Math.min.apply( Math, colGroup );
  
      return {
        col: colGroup.indexOf( minimumY ),
        y: minimumY,
      };
    };
  
    /**
     * @param {Number} colSpan - number of columns the element spans
     * @returns {Array} colGroup
     */
    proto._getTopColGroup = function( colSpan ) {
      if ( colSpan < 2 ) {
        // if brick spans only one column, use all the column Ys
        return this.colYs;
      }
  
      var colGroup = [];
      // how many different places could this brick fit horizontally
      var groupCount = this.cols + 1 - colSpan;
      // for each group potential horizontal position
      for ( var i = 0; i < groupCount; i++ ) {
        colGroup[i] = this._getColGroupY( i, colSpan );
      }
      return colGroup;
    };
  
    proto._getColGroupY = function( col, colSpan ) {
      if ( colSpan < 2 ) {
        return this.colYs[ col ];
      }
      // make an array of colY values for that one group
      var groupColYs = this.colYs.slice( col, col + colSpan );
      // and get the max value of the array
      return Math.max.apply( Math, groupColYs );
    };
  
    // get column position based on horizontal index. #873
    proto._getHorizontalColPosition = function( colSpan, item ) {
      var col = this.horizontalColIndex % this.cols;
      var isOver = colSpan > 1 && col + colSpan > this.cols;
      // shift to next row if item can't fit on current row
      col = isOver ? 0 : col;
      // don't let zero-size items take up space
      var hasSize = item.size.outerWidth && item.size.outerHeight;
      this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;
  
      return {
        col: col,
        y: this._getColGroupY( col, colSpan ),
      };
    };
  
    proto._manageStamp = function( stamp ) {
      var stampSize = getSize( stamp );
      var offset = this._getElementOffset( stamp );
      // get the columns that this stamp affects
      var isOriginLeft = this._getOption('originLeft');
      var firstX = isOriginLeft ? offset.left : offset.right;
      var lastX = firstX + stampSize.outerWidth;
      var firstCol = Math.floor( firstX / this.columnWidth );
      firstCol = Math.max( 0, firstCol );
      var lastCol = Math.floor( lastX / this.columnWidth );
      // lastCol should not go over if multiple of columnWidth #425
      lastCol -= lastX % this.columnWidth ? 0 : 1;
      lastCol = Math.min( this.cols - 1, lastCol );
      // set colYs to bottom of the stamp
  
      var isOriginTop = this._getOption('originTop');
      var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
        stampSize.outerHeight;
      for ( var i = firstCol; i <= lastCol; i++ ) {
        this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
      }
    };
  
    proto._getContainerSize = function() {
      this.maxY = Math.max.apply( Math, this.colYs );
      var size = {
        height: this.maxY
      };
  
      if ( this._getOption('fitWidth') ) {
        size.width = this._getContainerFitWidth();
      }
  
      return size;
    };
  
    proto._getContainerFitWidth = function() {
      var unusedCols = 0;
      // count unused columns
      var i = this.cols;
      while ( --i ) {
        if ( this.colYs[i] !== 0 ) {
          break;
        }
        unusedCols++;
      }
      // fit container to columns that have been used
      return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
    };
  
    proto.needsResizeLayout = function() {
      var previousWidth = this.containerWidth;
      this.getContainerWidth();
      return previousWidth != this.containerWidth;
    };
  
    return Masonry;
  
  }));
  
  /*!
   * Masonry layout mode
   * sub-classes Masonry
   * https://masonry.desandro.com
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/masonry',[
          '../layout-mode',
          'masonry-layout/masonry'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode'),
        require('masonry-layout')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode,
        window.Masonry
      );
    }
  
  }( window, function factory( LayoutMode, Masonry ) {
  'use strict';
  
  // -------------------------- masonryDefinition -------------------------- //
  
    // create an Outlayer layout class
    var MasonryMode = LayoutMode.create('masonry');
  
    var proto = MasonryMode.prototype;
  
    var keepModeMethods = {
      _getElementOffset: true,
      layout: true,
      _getMeasurement: true
    };
  
    // inherit Masonry prototype
    for ( var method in Masonry.prototype ) {
      // do not inherit mode methods
      if ( !keepModeMethods[ method ] ) {
        proto[ method ] = Masonry.prototype[ method ];
      }
    }
  
    var measureColumns = proto.measureColumns;
    proto.measureColumns = function() {
      // set items, used if measuring first item
      this.items = this.isotope.filteredItems;
      measureColumns.call( this );
    };
  
    // point to mode options for fitWidth
    var _getOption = proto._getOption;
    proto._getOption = function( option ) {
      if ( option == 'fitWidth' ) {
        return this.options.isFitWidth !== undefined ?
          this.options.isFitWidth : this.options.fitWidth;
      }
      return _getOption.apply( this.isotope, arguments );
    };
  
    return MasonryMode;
  
  }));
  
  /**
   * fitRows layout mode
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/fit-rows',[
          '../layout-mode'
        ],
        factory );
    } else if ( typeof exports == 'object' ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode
      );
    }
  
  }( window, function factory( LayoutMode ) {
  'use strict';
  
  var FitRows = LayoutMode.create('fitRows');
  
  var proto = FitRows.prototype;
  
  proto._resetLayout = function() {
    this.x = 0;
    this.y = 0;
    this.maxY = 0;
    this._getMeasurement( 'gutter', 'outerWidth' );
  };
  
  proto._getItemLayoutPosition = function( item ) {
    item.getSize();
  
    var itemWidth = item.size.outerWidth + this.gutter;
    // if this element cannot fit in the current row
    var containerWidth = this.isotope.size.innerWidth + this.gutter;
    if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
      this.x = 0;
      this.y = this.maxY;
    }
  
    var position = {
      x: this.x,
      y: this.y
    };
  
    this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
    this.x += itemWidth;
  
    return position;
  };
  
  proto._getContainerSize = function() {
    return { height: this.maxY };
  };
  
  return FitRows;
  
  }));
  
  /**
   * vertical layout mode
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( 'isotope-layout/js/layout-modes/vertical',[
          '../layout-mode'
        ],
        factory );
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        require('../layout-mode')
      );
    } else {
      // browser global
      factory(
        window.Isotope.LayoutMode
      );
    }
  
  }( window, function factory( LayoutMode ) {
  'use strict';
  
  var Vertical = LayoutMode.create( 'vertical', {
    horizontalAlignment: 0
  });
  
  var proto = Vertical.prototype;
  
  proto._resetLayout = function() {
    this.y = 0;
  };
  
  proto._getItemLayoutPosition = function( item ) {
    item.getSize();
    var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
      this.options.horizontalAlignment;
    var y = this.y;
    this.y += item.size.outerHeight;
    return { x: x, y: y };
  };
  
  proto._getContainerSize = function() {
    return { height: this.y };
  };
  
  return Vertical;
  
  }));
  
  /*!
   * Isotope v3.0.6
   *
   * Licensed GPLv3 for open source use
   * or Isotope Commercial License for commercial use
   *
   * https://isotope.metafizzy.co
   * Copyright 2010-2018 Metafizzy
   */
  
  ( function( window, factory ) {
    // universal module definition
    /* jshint strict: false */ /*globals define, module, require */
    if ( typeof define == 'function' && define.amd ) {
      // AMD
      define( [
          'outlayer/outlayer',
          'get-size/get-size',
          'desandro-matches-selector/matches-selector',
          'fizzy-ui-utils/utils',
          'isotope-layout/js/item',
          'isotope-layout/js/layout-mode',
          // include default layout modes
          'isotope-layout/js/layout-modes/masonry',
          'isotope-layout/js/layout-modes/fit-rows',
          'isotope-layout/js/layout-modes/vertical'
        ],
        function( Outlayer, getSize, matchesSelector, utils, Item, LayoutMode ) {
          return factory( window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode );
        });
    } else if ( typeof module == 'object' && module.exports ) {
      // CommonJS
      module.exports = factory(
        window,
        require('outlayer'),
        require('get-size'),
        require('desandro-matches-selector'),
        require('fizzy-ui-utils'),
        require('isotope-layout/js/item'),
        require('isotope-layout/js/layout-mode'),
        // include default layout modes
        require('isotope-layout/js/layout-modes/masonry'),
        require('isotope-layout/js/layout-modes/fit-rows'),
        require('isotope-layout/js/layout-modes/vertical')
      );
    } else {
      // browser global
      window.Isotope = factory(
        window,
        window.Outlayer,
        window.getSize,
        window.matchesSelector,
        window.fizzyUIUtils,
        window.Isotope.Item,
        window.Isotope.LayoutMode
      );
    }
  
  }( window, function factory( window, Outlayer, getSize, matchesSelector, utils,
    Item, LayoutMode ) {
  
  
  
  // -------------------------- vars -------------------------- //
  
  var jQuery = window.jQuery;
  
  // -------------------------- helpers -------------------------- //
  
  var trim = String.prototype.trim ?
    function( str ) {
      return str.trim();
    } :
    function( str ) {
      return str.replace( /^\s+|\s+$/g, '' );
    };
  
  // -------------------------- isotopeDefinition -------------------------- //
  
    // create an Outlayer layout class
    var Isotope = Outlayer.create( 'isotope', {
      layoutMode: 'masonry',
      isJQueryFiltering: true,
      sortAscending: true
    });
  
    Isotope.Item = Item;
    Isotope.LayoutMode = LayoutMode;
  
    var proto = Isotope.prototype;
  
    proto._create = function() {
      this.itemGUID = 0;
      // functions that sort items
      this._sorters = {};
      this._getSorters();
      // call super
      Outlayer.prototype._create.call( this );
  
      // create layout modes
      this.modes = {};
      // start filteredItems with all items
      this.filteredItems = this.items;
      // keep of track of sortBys
      this.sortHistory = [ 'original-order' ];
      // create from registered layout modes
      for ( var name in LayoutMode.modes ) {
        this._initLayoutMode( name );
      }
    };
  
    proto.reloadItems = function() {
      // reset item ID counter
      this.itemGUID = 0;
      // call super
      Outlayer.prototype.reloadItems.call( this );
    };
  
    proto._itemize = function() {
      var items = Outlayer.prototype._itemize.apply( this, arguments );
      // assign ID for original-order
      for ( var i=0; i < items.length; i++ ) {
        var item = items[i];
        item.id = this.itemGUID++;
      }
      this._updateItemsSortData( items );
      return items;
    };
  
  
    // -------------------------- layout -------------------------- //
  
    proto._initLayoutMode = function( name ) {
      var Mode = LayoutMode.modes[ name ];
      // set mode options
      // HACK extend initial options, back-fill in default options
      var initialOpts = this.options[ name ] || {};
      this.options[ name ] = Mode.options ?
        utils.extend( Mode.options, initialOpts ) : initialOpts;
      // init layout mode instance
      this.modes[ name ] = new Mode( this );
    };
  
  
    proto.layout = function() {
      // if first time doing layout, do all magic
      if ( !this._isLayoutInited && this._getOption('initLayout') ) {
        this.arrange();
        return;
      }
      this._layout();
    };
  
    // private method to be used in layout() & magic()
    proto._layout = function() {
      // don't animate first layout
      var isInstant = this._getIsInstant();
      // layout flow
      this._resetLayout();
      this._manageStamps();
      this.layoutItems( this.filteredItems, isInstant );
  
      // flag for initalized
      this._isLayoutInited = true;
    };
  
    // filter + sort + layout
    proto.arrange = function( opts ) {
      // set any options pass
      this.option( opts );
      this._getIsInstant();
      // filter, sort, and layout
  
      // filter
      var filtered = this._filter( this.items );
      this.filteredItems = filtered.matches;
  
      this._bindArrangeComplete();
  
      if ( this._isInstant ) {
        this._noTransition( this._hideReveal, [ filtered ] );
      } else {
        this._hideReveal( filtered );
      }
  
      this._sort();
      this._layout();
    };
    // alias to _init for main plugin method
    proto._init = proto.arrange;
  
    proto._hideReveal = function( filtered ) {
      this.reveal( filtered.needReveal );
      this.hide( filtered.needHide );
    };
  
    // HACK
    // Don't animate/transition first layout
    // Or don't animate/transition other layouts
    proto._getIsInstant = function() {
      var isLayoutInstant = this._getOption('layoutInstant');
      var isInstant = isLayoutInstant !== undefined ? isLayoutInstant :
        !this._isLayoutInited;
      this._isInstant = isInstant;
      return isInstant;
    };
  
    // listen for layoutComplete, hideComplete and revealComplete
    // to trigger arrangeComplete
    proto._bindArrangeComplete = function() {
      // listen for 3 events to trigger arrangeComplete
      var isLayoutComplete, isHideComplete, isRevealComplete;
      var _this = this;
      function arrangeParallelCallback() {
        if ( isLayoutComplete && isHideComplete && isRevealComplete ) {
          _this.dispatchEvent( 'arrangeComplete', null, [ _this.filteredItems ] );
        }
      }
      this.once( 'layoutComplete', function() {
        isLayoutComplete = true;
        arrangeParallelCallback();
      });
      this.once( 'hideComplete', function() {
        isHideComplete = true;
        arrangeParallelCallback();
      });
      this.once( 'revealComplete', function() {
        isRevealComplete = true;
        arrangeParallelCallback();
      });
    };
  
    // -------------------------- filter -------------------------- //
  
    proto._filter = function( items ) {
      var filter = this.options.filter;
      filter = filter || '*';
      var matches = [];
      var hiddenMatched = [];
      var visibleUnmatched = [];
  
      var test = this._getFilterTest( filter );
  
      // test each item
      for ( var i=0; i < items.length; i++ ) {
        var item = items[i];
        if ( item.isIgnored ) {
          continue;
        }
        // add item to either matched or unmatched group
        var isMatched = test( item );
        // item.isFilterMatched = isMatched;
        // add to matches if its a match
        if ( isMatched ) {
          matches.push( item );
        }
        // add to additional group if item needs to be hidden or revealed
        if ( isMatched && item.isHidden ) {
          hiddenMatched.push( item );
        } else if ( !isMatched && !item.isHidden ) {
          visibleUnmatched.push( item );
        }
      }
  
      // return collections of items to be manipulated
      return {
        matches: matches,
        needReveal: hiddenMatched,
        needHide: visibleUnmatched
      };
    };
  
    // get a jQuery, function, or a matchesSelector test given the filter
    proto._getFilterTest = function( filter ) {
      if ( jQuery && this.options.isJQueryFiltering ) {
        // use jQuery
        return function( item ) {
          return jQuery( item.element ).is( filter );
        };
      }
      if ( typeof filter == 'function' ) {
        // use filter as function
        return function( item ) {
          return filter( item.element );
        };
      }
      // default, use filter as selector string
      return function( item ) {
        return matchesSelector( item.element, filter );
      };
    };
  
    // -------------------------- sorting -------------------------- //
  
    /**
     * @params {Array} elems
     * @public
     */
    proto.updateSortData = function( elems ) {
      // get items
      var items;
      if ( elems ) {
        elems = utils.makeArray( elems );
        items = this.getItems( elems );
      } else {
        // update all items if no elems provided
        items = this.items;
      }
  
      this._getSorters();
      this._updateItemsSortData( items );
    };
  
    proto._getSorters = function() {
      var getSortData = this.options.getSortData;
      for ( var key in getSortData ) {
        var sorter = getSortData[ key ];
        this._sorters[ key ] = mungeSorter( sorter );
      }
    };
  
    /**
     * @params {Array} items - of Isotope.Items
     * @private
     */
    proto._updateItemsSortData = function( items ) {
      // do not update if no items
      var len = items && items.length;
  
      for ( var i=0; len && i < len; i++ ) {
        var item = items[i];
        item.updateSortData();
      }
    };
  
    // ----- munge sorter ----- //
  
    // encapsulate this, as we just need mungeSorter
    // other functions in here are just for munging
    var mungeSorter = ( function() {
      // add a magic layer to sorters for convienent shorthands
      // `.foo-bar` will use the text of .foo-bar querySelector
      // `[foo-bar]` will use attribute
      // you can also add parser
      // `.foo-bar parseInt` will parse that as a number
      function mungeSorter( sorter ) {
        // if not a string, return function or whatever it is
        if ( typeof sorter != 'string' ) {
          return sorter;
        }
        // parse the sorter string
        var args = trim( sorter ).split(' ');
        var query = args[0];
        // check if query looks like [an-attribute]
        var attrMatch = query.match( /^\[(.+)\]$/ );
        var attr = attrMatch && attrMatch[1];
        var getValue = getValueGetter( attr, query );
        // use second argument as a parser
        var parser = Isotope.sortDataParsers[ args[1] ];
        // parse the value, if there was a parser
        sorter = parser ? function( elem ) {
          return elem && parser( getValue( elem ) );
        } :
        // otherwise just return value
        function( elem ) {
          return elem && getValue( elem );
        };
  
        return sorter;
      }
  
      // get an attribute getter, or get text of the querySelector
      function getValueGetter( attr, query ) {
        // if query looks like [foo-bar], get attribute
        if ( attr ) {
          return function getAttribute( elem ) {
            return elem.getAttribute( attr );
          };
        }
  
        // otherwise, assume its a querySelector, and get its text
        return function getChildText( elem ) {
          var child = elem.querySelector( query );
          return child && child.textContent;
        };
      }
  
      return mungeSorter;
    })();
  
    // parsers used in getSortData shortcut strings
    Isotope.sortDataParsers = {
      'parseInt': function( val ) {
        return parseInt( val, 10 );
      },
      'parseFloat': function( val ) {
        return parseFloat( val );
      }
    };
  
    // ----- sort method ----- //
  
    // sort filteredItem order
    proto._sort = function() {
      if ( !this.options.sortBy ) {
        return;
      }
      // keep track of sortBy History
      var sortBys = utils.makeArray( this.options.sortBy );
      if ( !this._getIsSameSortBy( sortBys ) ) {
        // concat all sortBy and sortHistory, add to front, oldest goes in last
        this.sortHistory = sortBys.concat( this.sortHistory );
      }
      // sort magic
      var itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
      this.filteredItems.sort( itemSorter );
    };
  
    // check if sortBys is same as start of sortHistory
    proto._getIsSameSortBy = function( sortBys ) {
      for ( var i=0; i < sortBys.length; i++ ) {
        if ( sortBys[i] != this.sortHistory[i] ) {
          return false;
        }
      }
      return true;
    };
  
    // returns a function used for sorting
    function getItemSorter( sortBys, sortAsc ) {
      return function sorter( itemA, itemB ) {
        // cycle through all sortKeys
        for ( var i = 0; i < sortBys.length; i++ ) {
          var sortBy = sortBys[i];
          var a = itemA.sortData[ sortBy ];
          var b = itemB.sortData[ sortBy ];
          if ( a > b || a < b ) {
            // if sortAsc is an object, use the value given the sortBy key
            var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
            var direction = isAscending ? 1 : -1;
            return ( a > b ? 1 : -1 ) * direction;
          }
        }
        return 0;
      };
    }
  
    // -------------------------- methods -------------------------- //
  
    // get layout mode
    proto._mode = function() {
      var layoutMode = this.options.layoutMode;
      var mode = this.modes[ layoutMode ];
      if ( !mode ) {
        // TODO console.error
        throw new Error( 'No layout mode: ' + layoutMode );
      }
      // HACK sync mode's options
      // any options set after init for layout mode need to be synced
      mode.options = this.options[ layoutMode ];
      return mode;
    };
  
    proto._resetLayout = function() {
      // trigger original reset layout
      Outlayer.prototype._resetLayout.call( this );
      this._mode()._resetLayout();
    };
  
    proto._getItemLayoutPosition = function( item  ) {
      return this._mode()._getItemLayoutPosition( item );
    };
  
    proto._manageStamp = function( stamp ) {
      this._mode()._manageStamp( stamp );
    };
  
    proto._getContainerSize = function() {
      return this._mode()._getContainerSize();
    };
  
    proto.needsResizeLayout = function() {
      return this._mode().needsResizeLayout();
    };
  
    // -------------------------- adding & removing -------------------------- //
  
    // HEADS UP overwrites default Outlayer appended
    proto.appended = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // filter, layout, reveal new items
      var filteredItems = this._filterRevealAdded( items );
      // add to filteredItems
      this.filteredItems = this.filteredItems.concat( filteredItems );
    };
  
    // HEADS UP overwrites default Outlayer prepended
    proto.prepended = function( elems ) {
      var items = this._itemize( elems );
      if ( !items.length ) {
        return;
      }
      // start new layout
      this._resetLayout();
      this._manageStamps();
      // filter, layout, reveal new items
      var filteredItems = this._filterRevealAdded( items );
      // layout previous items
      this.layoutItems( this.filteredItems );
      // add to items and filteredItems
      this.filteredItems = filteredItems.concat( this.filteredItems );
      this.items = items.concat( this.items );
    };
  
    proto._filterRevealAdded = function( items ) {
      var filtered = this._filter( items );
      this.hide( filtered.needHide );
      // reveal all new items
      this.reveal( filtered.matches );
      // layout new items, no transition
      this.layoutItems( filtered.matches, true );
      return filtered.matches;
    };
  
    /**
     * Filter, sort, and layout newly-appended item elements
     * @param {Array or NodeList or Element} elems
     */
    proto.insert = function( elems ) {
      var items = this.addItems( elems );
      if ( !items.length ) {
        return;
      }
      // append item elements
      var i, item;
      var len = items.length;
      for ( i=0; i < len; i++ ) {
        item = items[i];
        this.element.appendChild( item.element );
      }
      // filter new stuff
      var filteredInsertItems = this._filter( items ).matches;
      // set flag
      for ( i=0; i < len; i++ ) {
        items[i].isLayoutInstant = true;
      }
      this.arrange();
      // reset flag
      for ( i=0; i < len; i++ ) {
        delete items[i].isLayoutInstant;
      }
      this.reveal( filteredInsertItems );
    };
  
    var _remove = proto.remove;
    proto.remove = function( elems ) {
      elems = utils.makeArray( elems );
      var removeItems = this.getItems( elems );
      // do regular thing
      _remove.call( this, elems );
      // bail if no items to remove
      var len = removeItems && removeItems.length;
      // remove elems from filteredItems
      for ( var i=0; len && i < len; i++ ) {
        var item = removeItems[i];
        // remove item from collection
        utils.removeFrom( this.filteredItems, item );
      }
    };
  
    proto.shuffle = function() {
      // update random sortData
      for ( var i=0; i < this.items.length; i++ ) {
        var item = this.items[i];
        item.sortData.random = Math.random();
      }
      this.options.sortBy = 'random';
      this._sort();
      this._layout();
    };
  
    /**
     * trigger fn without transition
     * kind of hacky to have this in the first place
     * @param {Function} fn
     * @param {Array} args
     * @returns ret
     * @private
     */
    proto._noTransition = function( fn, args ) {
      // save transitionDuration before disabling
      var transitionDuration = this.options.transitionDuration;
      // disable transition
      this.options.transitionDuration = 0;
      // do it
      var returnValue = fn.apply( this, args );
      // re-enable transition for reveal
      this.options.transitionDuration = transitionDuration;
      return returnValue;
    };
  
    // ----- helper methods ----- //
  
    /**
     * getter method for getting filtered item elements
     * @returns {Array} elems - collection of item elements
     */
    proto.getFilteredItemElements = function() {
      return this.filteredItems.map( function( item ) {
        return item.element;
      });
    };
  
    // -----  ----- //
  
    return Isotope;
  
  }));
  
  




!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.AOS=t():e.AOS=t()}(this,function(){return function(e){function t(o){if(n[o])return n[o].exports;var i=n[o]={exports:{},id:o,loaded:!1};return e[o].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var n={};return t.m=e,t.c=n,t.p="dist/",t(0)}([function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}var i=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var o in n)Object.prototype.hasOwnProperty.call(n,o)&&(e[o]=n[o])}return e},r=n(1),a=(o(r),n(6)),u=o(a),c=n(7),s=o(c),f=n(8),d=o(f),l=n(9),p=o(l),m=n(10),b=o(m),v=n(11),y=o(v),g=n(14),h=o(g),w=[],k=!1,x={offset:120,delay:0,easing:"ease",duration:400,disable:!1,once:!1,startEvent:"DOMContentLoaded",throttleDelay:99,debounceDelay:50,disableMutationObserver:!1},j=function(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(e&&(k=!0),k)return w=(0,y.default)(w,x),(0,b.default)(w,x.once),w},O=function(){w=(0,h.default)(),j()},M=function(){w.forEach(function(e,t){e.node.removeAttribute("data-aos"),e.node.removeAttribute("data-aos-easing"),e.node.removeAttribute("data-aos-duration"),e.node.removeAttribute("data-aos-delay")})},S=function(e){return e===!0||"mobile"===e&&p.default.mobile()||"phone"===e&&p.default.phone()||"tablet"===e&&p.default.tablet()||"function"==typeof e&&e()===!0},_=function(e){x=i(x,e),w=(0,h.default)();var t=document.all&&!window.atob;return S(x.disable)||t?M():(x.disableMutationObserver||d.default.isSupported()||(console.info('\n      aos: MutationObserver is not supported on this browser,\n      code mutations observing has been disabled.\n      You may have to call "refreshHard()" by yourself.\n    '),x.disableMutationObserver=!0),document.querySelector("body").setAttribute("data-aos-easing",x.easing),document.querySelector("body").setAttribute("data-aos-duration",x.duration),document.querySelector("body").setAttribute("data-aos-delay",x.delay),"DOMContentLoaded"===x.startEvent&&["complete","interactive"].indexOf(document.readyState)>-1?j(!0):"load"===x.startEvent?window.addEventListener(x.startEvent,function(){j(!0)}):document.addEventListener(x.startEvent,function(){j(!0)}),window.addEventListener("resize",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("orientationchange",(0,s.default)(j,x.debounceDelay,!0)),window.addEventListener("scroll",(0,u.default)(function(){(0,b.default)(w,x.once)},x.throttleDelay)),x.disableMutationObserver||d.default.ready("[data-aos]",O),w)};e.exports={init:_,refresh:j,refreshHard:O}},function(e,t){},,,,,function(e,t){(function(t){"use strict";function n(e,t,n){function o(t){var n=b,o=v;return b=v=void 0,k=t,g=e.apply(o,n)}function r(e){return k=e,h=setTimeout(f,t),M?o(e):g}function a(e){var n=e-w,o=e-k,i=t-n;return S?j(i,y-o):i}function c(e){var n=e-w,o=e-k;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=O();return c(e)?d(e):void(h=setTimeout(f,a(e)))}function d(e){return h=void 0,_&&b?o(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),k=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(O())}function m(){var e=O(),n=c(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),o(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,k=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(s);return t=u(t)||0,i(n)&&(M=!!n.leading,S="maxWait"in n,y=S?x(u(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e,t,o){var r=!0,a=!0;if("function"!=typeof e)throw new TypeError(s);return i(o)&&(r="leading"in o?!!o.leading:r,a="trailing"in o?!!o.trailing:a),n(e,t,{leading:r,maxWait:t,trailing:a})}function i(e){var t="undefined"==typeof e?"undefined":c(e);return!!e&&("object"==t||"function"==t)}function r(e){return!!e&&"object"==("undefined"==typeof e?"undefined":c(e))}function a(e){return"symbol"==("undefined"==typeof e?"undefined":c(e))||r(e)&&k.call(e)==d}function u(e){if("number"==typeof e)return e;if(a(e))return f;if(i(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=i(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(l,"");var n=m.test(e);return n||b.test(e)?v(e.slice(2),n?2:8):p.test(e)?f:+e}var c="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},s="Expected a function",f=NaN,d="[object Symbol]",l=/^\s+|\s+$/g,p=/^[-+]0x[0-9a-f]+$/i,m=/^0b[01]+$/i,b=/^0o[0-7]+$/i,v=parseInt,y="object"==("undefined"==typeof t?"undefined":c(t))&&t&&t.Object===Object&&t,g="object"==("undefined"==typeof self?"undefined":c(self))&&self&&self.Object===Object&&self,h=y||g||Function("return this")(),w=Object.prototype,k=w.toString,x=Math.max,j=Math.min,O=function(){return h.Date.now()};e.exports=o}).call(t,function(){return this}())},function(e,t){(function(t){"use strict";function n(e,t,n){function i(t){var n=b,o=v;return b=v=void 0,O=t,g=e.apply(o,n)}function r(e){return O=e,h=setTimeout(f,t),M?i(e):g}function u(e){var n=e-w,o=e-O,i=t-n;return S?x(i,y-o):i}function s(e){var n=e-w,o=e-O;return void 0===w||n>=t||n<0||S&&o>=y}function f(){var e=j();return s(e)?d(e):void(h=setTimeout(f,u(e)))}function d(e){return h=void 0,_&&b?i(e):(b=v=void 0,g)}function l(){void 0!==h&&clearTimeout(h),O=0,b=w=v=h=void 0}function p(){return void 0===h?g:d(j())}function m(){var e=j(),n=s(e);if(b=arguments,v=this,w=e,n){if(void 0===h)return r(w);if(S)return h=setTimeout(f,t),i(w)}return void 0===h&&(h=setTimeout(f,t)),g}var b,v,y,g,h,w,O=0,M=!1,S=!1,_=!0;if("function"!=typeof e)throw new TypeError(c);return t=a(t)||0,o(n)&&(M=!!n.leading,S="maxWait"in n,y=S?k(a(n.maxWait)||0,t):y,_="trailing"in n?!!n.trailing:_),m.cancel=l,m.flush=p,m}function o(e){var t="undefined"==typeof e?"undefined":u(e);return!!e&&("object"==t||"function"==t)}function i(e){return!!e&&"object"==("undefined"==typeof e?"undefined":u(e))}function r(e){return"symbol"==("undefined"==typeof e?"undefined":u(e))||i(e)&&w.call(e)==f}function a(e){if("number"==typeof e)return e;if(r(e))return s;if(o(e)){var t="function"==typeof e.valueOf?e.valueOf():e;e=o(t)?t+"":t}if("string"!=typeof e)return 0===e?e:+e;e=e.replace(d,"");var n=p.test(e);return n||m.test(e)?b(e.slice(2),n?2:8):l.test(e)?s:+e}var u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},c="Expected a function",s=NaN,f="[object Symbol]",d=/^\s+|\s+$/g,l=/^[-+]0x[0-9a-f]+$/i,p=/^0b[01]+$/i,m=/^0o[0-7]+$/i,b=parseInt,v="object"==("undefined"==typeof t?"undefined":u(t))&&t&&t.Object===Object&&t,y="object"==("undefined"==typeof self?"undefined":u(self))&&self&&self.Object===Object&&self,g=v||y||Function("return this")(),h=Object.prototype,w=h.toString,k=Math.max,x=Math.min,j=function(){return g.Date.now()};e.exports=n}).call(t,function(){return this}())},function(e,t){"use strict";function n(e){var t=void 0,o=void 0,i=void 0;for(t=0;t<e.length;t+=1){if(o=e[t],o.dataset&&o.dataset.aos)return!0;if(i=o.children&&n(o.children))return!0}return!1}function o(){return window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver}function i(){return!!o()}function r(e,t){var n=window.document,i=o(),r=new i(a);u=t,r.observe(n.documentElement,{childList:!0,subtree:!0,removedNodes:!0})}function a(e){e&&e.forEach(function(e){var t=Array.prototype.slice.call(e.addedNodes),o=Array.prototype.slice.call(e.removedNodes),i=t.concat(o);if(n(i))return u()})}Object.defineProperty(t,"__esModule",{value:!0});var u=function(){};t.default={isSupported:i,ready:r}},function(e,t){"use strict";function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(){return navigator.userAgent||navigator.vendor||window.opera||""}Object.defineProperty(t,"__esModule",{value:!0});var i=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),r=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i,a=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,u=/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i,c=/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i,s=function(){function e(){n(this,e)}return i(e,[{key:"phone",value:function(){var e=o();return!(!r.test(e)&&!a.test(e.substr(0,4)))}},{key:"mobile",value:function(){var e=o();return!(!u.test(e)&&!c.test(e.substr(0,4)))}},{key:"tablet",value:function(){return this.mobile()&&!this.phone()}}]),e}();t.default=new s},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e,t,n){var o=e.node.getAttribute("data-aos-once");t>e.position?e.node.classList.add("aos-animate"):"undefined"!=typeof o&&("false"===o||!n&&"true"!==o)&&e.node.classList.remove("aos-animate")},o=function(e,t){var o=window.pageYOffset,i=window.innerHeight;e.forEach(function(e,r){n(e,i+o,t)})};t.default=o},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(12),r=o(i),a=function(e,t){return e.forEach(function(e,n){e.node.classList.add("aos-init"),e.position=(0,r.default)(e.node,t.offset)}),e};t.default=a},function(e,t,n){"use strict";function o(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(t,"__esModule",{value:!0});var i=n(13),r=o(i),a=function(e,t){var n=0,o=0,i=window.innerHeight,a={offset:e.getAttribute("data-aos-offset"),anchor:e.getAttribute("data-aos-anchor"),anchorPlacement:e.getAttribute("data-aos-anchor-placement")};switch(a.offset&&!isNaN(a.offset)&&(o=parseInt(a.offset)),a.anchor&&document.querySelectorAll(a.anchor)&&(e=document.querySelectorAll(a.anchor)[0]),n=(0,r.default)(e).top,a.anchorPlacement){case"top-bottom":break;case"center-bottom":n+=e.offsetHeight/2;break;case"bottom-bottom":n+=e.offsetHeight;break;case"top-center":n+=i/2;break;case"bottom-center":n+=i/2+e.offsetHeight;break;case"center-center":n+=i/2+e.offsetHeight/2;break;case"top-top":n+=i;break;case"bottom-top":n+=e.offsetHeight+i;break;case"center-top":n+=e.offsetHeight/2+i}return a.anchorPlacement||a.offset||isNaN(t)||(o=t),n+o};t.default=a},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){for(var t=0,n=0;e&&!isNaN(e.offsetLeft)&&!isNaN(e.offsetTop);)t+=e.offsetLeft-("BODY"!=e.tagName?e.scrollLeft:0),n+=e.offsetTop-("BODY"!=e.tagName?e.scrollTop:0),e=e.offsetParent;return{top:n,left:t}};t.default=n},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var n=function(e){return e=e||document.querySelectorAll("[data-aos]"),Array.prototype.map.call(e,function(e){return{node:e}})};t.default=n}])});

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).Swiper=t()}(this,(function(){"use strict";function e(e){return null!==e&&"object"==typeof e&&"constructor"in e&&e.constructor===Object}function t(s,a){void 0===s&&(s={}),void 0===a&&(a={}),Object.keys(a).forEach((i=>{void 0===s[i]?s[i]=a[i]:e(a[i])&&e(s[i])&&Object.keys(a[i]).length>0&&t(s[i],a[i])}))}const s={body:{},addEventListener(){},removeEventListener(){},activeElement:{blur(){},nodeName:""},querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,createEvent:()=>({initEvent(){}}),createElement:()=>({children:[],childNodes:[],style:{},setAttribute(){},getElementsByTagName:()=>[]}),createElementNS:()=>({}),importNode:()=>null,location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""}};function a(){const e="undefined"!=typeof document?document:{};return t(e,s),e}const i={document:s,navigator:{userAgent:""},location:{hash:"",host:"",hostname:"",href:"",origin:"",pathname:"",protocol:"",search:""},history:{replaceState(){},pushState(){},go(){},back(){}},CustomEvent:function(){return this},addEventListener(){},removeEventListener(){},getComputedStyle:()=>({getPropertyValue:()=>""}),Image(){},Date(){},screen:{},setTimeout(){},clearTimeout(){},matchMedia:()=>({}),requestAnimationFrame:e=>"undefined"==typeof setTimeout?(e(),null):setTimeout(e,0),cancelAnimationFrame(e){"undefined"!=typeof setTimeout&&clearTimeout(e)}};function r(){const e="undefined"!=typeof window?window:{};return t(e,i),e}class n extends Array{constructor(e){"number"==typeof e?super(e):(super(...e||[]),function(e){const t=e.__proto__;Object.defineProperty(e,"__proto__",{get:()=>t,set(e){t.__proto__=e}})}(this))}}function l(e){void 0===e&&(e=[]);const t=[];return e.forEach((e=>{Array.isArray(e)?t.push(...l(e)):t.push(e)})),t}function o(e,t){return Array.prototype.filter.call(e,t)}function d(e,t){const s=r(),i=a();let l=[];if(!t&&e instanceof n)return e;if(!e)return new n(l);if("string"==typeof e){const s=e.trim();if(s.indexOf("<")>=0&&s.indexOf(">")>=0){let e="div";0===s.indexOf("<li")&&(e="ul"),0===s.indexOf("<tr")&&(e="tbody"),0!==s.indexOf("<td")&&0!==s.indexOf("<th")||(e="tr"),0===s.indexOf("<tbody")&&(e="table"),0===s.indexOf("<option")&&(e="select");const t=i.createElement(e);t.innerHTML=s;for(let e=0;e<t.childNodes.length;e+=1)l.push(t.childNodes[e])}else l=function(e,t){if("string"!=typeof e)return[e];const s=[],a=t.querySelectorAll(e);for(let e=0;e<a.length;e+=1)s.push(a[e]);return s}(e.trim(),t||i)}else if(e.nodeType||e===s||e===i)l.push(e);else if(Array.isArray(e)){if(e instanceof n)return e;l=e}return new n(function(e){const t=[];for(let s=0;s<e.length;s+=1)-1===t.indexOf(e[s])&&t.push(e[s]);return t}(l))}d.fn=n.prototype;const c={addClass:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];const a=l(t.map((e=>e.split(" "))));return this.forEach((e=>{e.classList.add(...a)})),this},removeClass:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];const a=l(t.map((e=>e.split(" "))));return this.forEach((e=>{e.classList.remove(...a)})),this},hasClass:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];const a=l(t.map((e=>e.split(" "))));return o(this,(e=>a.filter((t=>e.classList.contains(t))).length>0)).length>0},toggleClass:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];const a=l(t.map((e=>e.split(" "))));this.forEach((e=>{a.forEach((t=>{e.classList.toggle(t)}))}))},attr:function(e,t){if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(let s=0;s<this.length;s+=1)if(2===arguments.length)this[s].setAttribute(e,t);else for(const t in e)this[s][t]=e[t],this[s].setAttribute(t,e[t]);return this},removeAttr:function(e){for(let t=0;t<this.length;t+=1)this[t].removeAttribute(e);return this},transform:function(e){for(let t=0;t<this.length;t+=1)this[t].style.transform=e;return this},transition:function(e){for(let t=0;t<this.length;t+=1)this[t].style.transitionDuration="string"!=typeof e?`${e}ms`:e;return this},on:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];let[a,i,r,n]=t;function l(e){const t=e.target;if(!t)return;const s=e.target.dom7EventData||[];if(s.indexOf(e)<0&&s.unshift(e),d(t).is(i))r.apply(t,s);else{const e=d(t).parents();for(let t=0;t<e.length;t+=1)d(e[t]).is(i)&&r.apply(e[t],s)}}function o(e){const t=e&&e.target&&e.target.dom7EventData||[];t.indexOf(e)<0&&t.unshift(e),r.apply(this,t)}"function"==typeof t[1]&&([a,r,n]=t,i=void 0),n||(n=!1);const c=a.split(" ");let p;for(let e=0;e<this.length;e+=1){const t=this[e];if(i)for(p=0;p<c.length;p+=1){const e=c[p];t.dom7LiveListeners||(t.dom7LiveListeners={}),t.dom7LiveListeners[e]||(t.dom7LiveListeners[e]=[]),t.dom7LiveListeners[e].push({listener:r,proxyListener:l}),t.addEventListener(e,l,n)}else for(p=0;p<c.length;p+=1){const e=c[p];t.dom7Listeners||(t.dom7Listeners={}),t.dom7Listeners[e]||(t.dom7Listeners[e]=[]),t.dom7Listeners[e].push({listener:r,proxyListener:o}),t.addEventListener(e,o,n)}}return this},off:function(){for(var e=arguments.length,t=new Array(e),s=0;s<e;s++)t[s]=arguments[s];let[a,i,r,n]=t;"function"==typeof t[1]&&([a,r,n]=t,i=void 0),n||(n=!1);const l=a.split(" ");for(let e=0;e<l.length;e+=1){const t=l[e];for(let e=0;e<this.length;e+=1){const s=this[e];let a;if(!i&&s.dom7Listeners?a=s.dom7Listeners[t]:i&&s.dom7LiveListeners&&(a=s.dom7LiveListeners[t]),a&&a.length)for(let e=a.length-1;e>=0;e-=1){const i=a[e];r&&i.listener===r||r&&i.listener&&i.listener.dom7proxy&&i.listener.dom7proxy===r?(s.removeEventListener(t,i.proxyListener,n),a.splice(e,1)):r||(s.removeEventListener(t,i.proxyListener,n),a.splice(e,1))}}}return this},trigger:function(){const e=r();for(var t=arguments.length,s=new Array(t),a=0;a<t;a++)s[a]=arguments[a];const i=s[0].split(" "),n=s[1];for(let t=0;t<i.length;t+=1){const a=i[t];for(let t=0;t<this.length;t+=1){const i=this[t];if(e.CustomEvent){const t=new e.CustomEvent(a,{detail:n,bubbles:!0,cancelable:!0});i.dom7EventData=s.filter(((e,t)=>t>0)),i.dispatchEvent(t),i.dom7EventData=[],delete i.dom7EventData}}}return this},transitionEnd:function(e){const t=this;return e&&t.on("transitionend",(function s(a){a.target===this&&(e.call(this,a),t.off("transitionend",s))})),this},outerWidth:function(e){if(this.length>0){if(e){const e=this.styles();return this[0].offsetWidth+parseFloat(e.getPropertyValue("margin-right"))+parseFloat(e.getPropertyValue("margin-left"))}return this[0].offsetWidth}return null},outerHeight:function(e){if(this.length>0){if(e){const e=this.styles();return this[0].offsetHeight+parseFloat(e.getPropertyValue("margin-top"))+parseFloat(e.getPropertyValue("margin-bottom"))}return this[0].offsetHeight}return null},styles:function(){const e=r();return this[0]?e.getComputedStyle(this[0],null):{}},offset:function(){if(this.length>0){const e=r(),t=a(),s=this[0],i=s.getBoundingClientRect(),n=t.body,l=s.clientTop||n.clientTop||0,o=s.clientLeft||n.clientLeft||0,d=s===e?e.scrollY:s.scrollTop,c=s===e?e.scrollX:s.scrollLeft;return{top:i.top+d-l,left:i.left+c-o}}return null},css:function(e,t){const s=r();let a;if(1===arguments.length){if("string"!=typeof e){for(a=0;a<this.length;a+=1)for(const t in e)this[a].style[t]=e[t];return this}if(this[0])return s.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(a=0;a<this.length;a+=1)this[a].style[e]=t;return this}return this},each:function(e){return e?(this.forEach(((t,s)=>{e.apply(t,[t,s])})),this):this},html:function(e){if(void 0===e)return this[0]?this[0].innerHTML:null;for(let t=0;t<this.length;t+=1)this[t].innerHTML=e;return this},text:function(e){if(void 0===e)return this[0]?this[0].textContent.trim():null;for(let t=0;t<this.length;t+=1)this[t].textContent=e;return this},is:function(e){const t=r(),s=a(),i=this[0];let l,o;if(!i||void 0===e)return!1;if("string"==typeof e){if(i.matches)return i.matches(e);if(i.webkitMatchesSelector)return i.webkitMatchesSelector(e);if(i.msMatchesSelector)return i.msMatchesSelector(e);for(l=d(e),o=0;o<l.length;o+=1)if(l[o]===i)return!0;return!1}if(e===s)return i===s;if(e===t)return i===t;if(e.nodeType||e instanceof n){for(l=e.nodeType?[e]:e,o=0;o<l.length;o+=1)if(l[o]===i)return!0;return!1}return!1},index:function(){let e,t=this[0];if(t){for(e=0;null!==(t=t.previousSibling);)1===t.nodeType&&(e+=1);return e}},eq:function(e){if(void 0===e)return this;const t=this.length;if(e>t-1)return d([]);if(e<0){const s=t+e;return d(s<0?[]:[this[s]])}return d([this[e]])},append:function(){let e;const t=a();for(let s=0;s<arguments.length;s+=1){e=s<0||arguments.length<=s?void 0:arguments[s];for(let s=0;s<this.length;s+=1)if("string"==typeof e){const a=t.createElement("div");for(a.innerHTML=e;a.firstChild;)this[s].appendChild(a.firstChild)}else if(e instanceof n)for(let t=0;t<e.length;t+=1)this[s].appendChild(e[t]);else this[s].appendChild(e)}return this},prepend:function(e){const t=a();let s,i;for(s=0;s<this.length;s+=1)if("string"==typeof e){const a=t.createElement("div");for(a.innerHTML=e,i=a.childNodes.length-1;i>=0;i-=1)this[s].insertBefore(a.childNodes[i],this[s].childNodes[0])}else if(e instanceof n)for(i=0;i<e.length;i+=1)this[s].insertBefore(e[i],this[s].childNodes[0]);else this[s].insertBefore(e,this[s].childNodes[0]);return this},next:function(e){return this.length>0?e?this[0].nextElementSibling&&d(this[0].nextElementSibling).is(e)?d([this[0].nextElementSibling]):d([]):this[0].nextElementSibling?d([this[0].nextElementSibling]):d([]):d([])},nextAll:function(e){const t=[];let s=this[0];if(!s)return d([]);for(;s.nextElementSibling;){const a=s.nextElementSibling;e?d(a).is(e)&&t.push(a):t.push(a),s=a}return d(t)},prev:function(e){if(this.length>0){const t=this[0];return e?t.previousElementSibling&&d(t.previousElementSibling).is(e)?d([t.previousElementSibling]):d([]):t.previousElementSibling?d([t.previousElementSibling]):d([])}return d([])},prevAll:function(e){const t=[];let s=this[0];if(!s)return d([]);for(;s.previousElementSibling;){const a=s.previousElementSibling;e?d(a).is(e)&&t.push(a):t.push(a),s=a}return d(t)},parent:function(e){const t=[];for(let s=0;s<this.length;s+=1)null!==this[s].parentNode&&(e?d(this[s].parentNode).is(e)&&t.push(this[s].parentNode):t.push(this[s].parentNode));return d(t)},parents:function(e){const t=[];for(let s=0;s<this.length;s+=1){let a=this[s].parentNode;for(;a;)e?d(a).is(e)&&t.push(a):t.push(a),a=a.parentNode}return d(t)},closest:function(e){let t=this;return void 0===e?d([]):(t.is(e)||(t=t.parents(e).eq(0)),t)},find:function(e){const t=[];for(let s=0;s<this.length;s+=1){const a=this[s].querySelectorAll(e);for(let e=0;e<a.length;e+=1)t.push(a[e])}return d(t)},children:function(e){const t=[];for(let s=0;s<this.length;s+=1){const a=this[s].children;for(let s=0;s<a.length;s+=1)e&&!d(a[s]).is(e)||t.push(a[s])}return d(t)},filter:function(e){return d(o(this,e))},remove:function(){for(let e=0;e<this.length;e+=1)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this}};function p(e,t){return void 0===t&&(t=0),setTimeout(e,t)}function u(){return Date.now()}function h(e,t){void 0===t&&(t="x");const s=r();let a,i,n;const l=function(e){const t=r();let s;return t.getComputedStyle&&(s=t.getComputedStyle(e,null)),!s&&e.currentStyle&&(s=e.currentStyle),s||(s=e.style),s}(e);return s.WebKitCSSMatrix?(i=l.transform||l.webkitTransform,i.split(",").length>6&&(i=i.split(", ").map((e=>e.replace(",","."))).join(", ")),n=new s.WebKitCSSMatrix("none"===i?"":i)):(n=l.MozTransform||l.OTransform||l.MsTransform||l.msTransform||l.transform||l.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,"),a=n.toString().split(",")),"x"===t&&(i=s.WebKitCSSMatrix?n.m41:16===a.length?parseFloat(a[12]):parseFloat(a[4])),"y"===t&&(i=s.WebKitCSSMatrix?n.m42:16===a.length?parseFloat(a[13]):parseFloat(a[5])),i||0}function m(e){return"object"==typeof e&&null!==e&&e.constructor&&"Object"===Object.prototype.toString.call(e).slice(8,-1)}function f(e){return"undefined"!=typeof window&&void 0!==window.HTMLElement?e instanceof HTMLElement:e&&(1===e.nodeType||11===e.nodeType)}function g(){const e=Object(arguments.length<=0?void 0:arguments[0]),t=["__proto__","constructor","prototype"];for(let s=1;s<arguments.length;s+=1){const a=s<0||arguments.length<=s?void 0:arguments[s];if(null!=a&&!f(a)){const s=Object.keys(Object(a)).filter((e=>t.indexOf(e)<0));for(let t=0,i=s.length;t<i;t+=1){const i=s[t],r=Object.getOwnPropertyDescriptor(a,i);void 0!==r&&r.enumerable&&(m(e[i])&&m(a[i])?a[i].__swiper__?e[i]=a[i]:g(e[i],a[i]):!m(e[i])&&m(a[i])?(e[i]={},a[i].__swiper__?e[i]=a[i]:g(e[i],a[i])):e[i]=a[i])}}}return e}function v(e,t,s){e.style.setProperty(t,s)}function w(e){let{swiper:t,targetPosition:s,side:a}=e;const i=r(),n=-t.translate;let l,o=null;const d=t.params.speed;t.wrapperEl.style.scrollSnapType="none",i.cancelAnimationFrame(t.cssModeFrameID);const c=s>n?"next":"prev",p=(e,t)=>"next"===c&&e>=t||"prev"===c&&e<=t,u=()=>{l=(new Date).getTime(),null===o&&(o=l);const e=Math.max(Math.min((l-o)/d,1),0),r=.5-Math.cos(e*Math.PI)/2;let c=n+r*(s-n);if(p(c,s)&&(c=s),t.wrapperEl.scrollTo({[a]:c}),p(c,s))return t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.scrollSnapType="",setTimeout((()=>{t.wrapperEl.style.overflow="",t.wrapperEl.scrollTo({[a]:c})})),void i.cancelAnimationFrame(t.cssModeFrameID);t.cssModeFrameID=i.requestAnimationFrame(u)};u()}let b,x,y;function E(){return b||(b=function(){const e=r(),t=a();return{smoothScroll:t.documentElement&&"scrollBehavior"in t.documentElement.style,touch:!!("ontouchstart"in e||e.DocumentTouch&&t instanceof e.DocumentTouch),passiveListener:function(){let t=!1;try{const s=Object.defineProperty({},"passive",{get(){t=!0}});e.addEventListener("testPassiveListener",null,s)}catch(e){}return t}(),gestures:"ongesturestart"in e}}()),b}function C(e){return void 0===e&&(e={}),x||(x=function(e){let{userAgent:t}=void 0===e?{}:e;const s=E(),a=r(),i=a.navigator.platform,n=t||a.navigator.userAgent,l={ios:!1,android:!1},o=a.screen.width,d=a.screen.height,c=n.match(/(Android);?[\s\/]+([\d.]+)?/);let p=n.match(/(iPad).*OS\s([\d_]+)/);const u=n.match(/(iPod)(.*OS\s([\d_]+))?/),h=!p&&n.match(/(iPhone\sOS|iOS)\s([\d_]+)/),m="Win32"===i;let f="MacIntel"===i;return!p&&f&&s.touch&&["1024x1366","1366x1024","834x1194","1194x834","834x1112","1112x834","768x1024","1024x768","820x1180","1180x820","810x1080","1080x810"].indexOf(`${o}x${d}`)>=0&&(p=n.match(/(Version)\/([\d.]+)/),p||(p=[0,1,"13_0_0"]),f=!1),c&&!m&&(l.os="android",l.android=!0),(p||h||u)&&(l.os="ios",l.ios=!0),l}(e)),x}function T(){return y||(y=function(){const e=r();return{isSafari:function(){const t=e.navigator.userAgent.toLowerCase();return t.indexOf("safari")>=0&&t.indexOf("chrome")<0&&t.indexOf("android")<0}(),isWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(e.navigator.userAgent)}}()),y}Object.keys(c).forEach((e=>{Object.defineProperty(d.fn,e,{value:c[e],writable:!0})}));var $={on(e,t,s){const a=this;if(!a.eventsListeners||a.destroyed)return a;if("function"!=typeof t)return a;const i=s?"unshift":"push";return e.split(" ").forEach((e=>{a.eventsListeners[e]||(a.eventsListeners[e]=[]),a.eventsListeners[e][i](t)})),a},once(e,t,s){const a=this;if(!a.eventsListeners||a.destroyed)return a;if("function"!=typeof t)return a;function i(){a.off(e,i),i.__emitterProxy&&delete i.__emitterProxy;for(var s=arguments.length,r=new Array(s),n=0;n<s;n++)r[n]=arguments[n];t.apply(a,r)}return i.__emitterProxy=t,a.on(e,i,s)},onAny(e,t){const s=this;if(!s.eventsListeners||s.destroyed)return s;if("function"!=typeof e)return s;const a=t?"unshift":"push";return s.eventsAnyListeners.indexOf(e)<0&&s.eventsAnyListeners[a](e),s},offAny(e){const t=this;if(!t.eventsListeners||t.destroyed)return t;if(!t.eventsAnyListeners)return t;const s=t.eventsAnyListeners.indexOf(e);return s>=0&&t.eventsAnyListeners.splice(s,1),t},off(e,t){const s=this;return!s.eventsListeners||s.destroyed?s:s.eventsListeners?(e.split(" ").forEach((e=>{void 0===t?s.eventsListeners[e]=[]:s.eventsListeners[e]&&s.eventsListeners[e].forEach(((a,i)=>{(a===t||a.__emitterProxy&&a.__emitterProxy===t)&&s.eventsListeners[e].splice(i,1)}))})),s):s},emit(){const e=this;if(!e.eventsListeners||e.destroyed)return e;if(!e.eventsListeners)return e;let t,s,a;for(var i=arguments.length,r=new Array(i),n=0;n<i;n++)r[n]=arguments[n];"string"==typeof r[0]||Array.isArray(r[0])?(t=r[0],s=r.slice(1,r.length),a=e):(t=r[0].events,s=r[0].data,a=r[0].context||e),s.unshift(a);return(Array.isArray(t)?t:t.split(" ")).forEach((t=>{e.eventsAnyListeners&&e.eventsAnyListeners.length&&e.eventsAnyListeners.forEach((e=>{e.apply(a,[t,...s])})),e.eventsListeners&&e.eventsListeners[t]&&e.eventsListeners[t].forEach((e=>{e.apply(a,s)}))})),e}};var S={updateSize:function(){const e=this;let t,s;const a=e.$el;t=void 0!==e.params.width&&null!==e.params.width?e.params.width:a[0].clientWidth,s=void 0!==e.params.height&&null!==e.params.height?e.params.height:a[0].clientHeight,0===t&&e.isHorizontal()||0===s&&e.isVertical()||(t=t-parseInt(a.css("padding-left")||0,10)-parseInt(a.css("padding-right")||0,10),s=s-parseInt(a.css("padding-top")||0,10)-parseInt(a.css("padding-bottom")||0,10),Number.isNaN(t)&&(t=0),Number.isNaN(s)&&(s=0),Object.assign(e,{width:t,height:s,size:e.isHorizontal()?t:s}))},updateSlides:function(){const e=this;function t(t){return e.isHorizontal()?t:{width:"height","margin-top":"margin-left","margin-bottom ":"margin-right","margin-left":"margin-top","margin-right":"margin-bottom","padding-left":"padding-top","padding-right":"padding-bottom",marginRight:"marginBottom"}[t]}function s(e,s){return parseFloat(e.getPropertyValue(t(s))||0)}const a=e.params,{$wrapperEl:i,size:r,rtlTranslate:n,wrongRTL:l}=e,o=e.virtual&&a.virtual.enabled,d=o?e.virtual.slides.length:e.slides.length,c=i.children(`.${e.params.slideClass}`),p=o?e.virtual.slides.length:c.length;let u=[];const h=[],m=[];let f=a.slidesOffsetBefore;"function"==typeof f&&(f=a.slidesOffsetBefore.call(e));let g=a.slidesOffsetAfter;"function"==typeof g&&(g=a.slidesOffsetAfter.call(e));const w=e.snapGrid.length,b=e.slidesGrid.length;let x=a.spaceBetween,y=-f,E=0,C=0;if(void 0===r)return;"string"==typeof x&&x.indexOf("%")>=0&&(x=parseFloat(x.replace("%",""))/100*r),e.virtualSize=-x,n?c.css({marginLeft:"",marginBottom:"",marginTop:""}):c.css({marginRight:"",marginBottom:"",marginTop:""}),a.centeredSlides&&a.cssMode&&(v(e.wrapperEl,"--swiper-centered-offset-before",""),v(e.wrapperEl,"--swiper-centered-offset-after",""));const T=a.grid&&a.grid.rows>1&&e.grid;let $;T&&e.grid.initSlides(p);const S="auto"===a.slidesPerView&&a.breakpoints&&Object.keys(a.breakpoints).filter((e=>void 0!==a.breakpoints[e].slidesPerView)).length>0;for(let i=0;i<p;i+=1){$=0;const n=c.eq(i);if(T&&e.grid.updateSlide(i,n,p,t),"none"!==n.css("display")){if("auto"===a.slidesPerView){S&&(c[i].style[t("width")]="");const r=getComputedStyle(n[0]),l=n[0].style.transform,o=n[0].style.webkitTransform;if(l&&(n[0].style.transform="none"),o&&(n[0].style.webkitTransform="none"),a.roundLengths)$=e.isHorizontal()?n.outerWidth(!0):n.outerHeight(!0);else{const e=s(r,"width"),t=s(r,"padding-left"),a=s(r,"padding-right"),i=s(r,"margin-left"),l=s(r,"margin-right"),o=r.getPropertyValue("box-sizing");if(o&&"border-box"===o)$=e+i+l;else{const{clientWidth:s,offsetWidth:r}=n[0];$=e+t+a+i+l+(r-s)}}l&&(n[0].style.transform=l),o&&(n[0].style.webkitTransform=o),a.roundLengths&&($=Math.floor($))}else $=(r-(a.slidesPerView-1)*x)/a.slidesPerView,a.roundLengths&&($=Math.floor($)),c[i]&&(c[i].style[t("width")]=`${$}px`);c[i]&&(c[i].swiperSlideSize=$),m.push($),a.centeredSlides?(y=y+$/2+E/2+x,0===E&&0!==i&&(y=y-r/2-x),0===i&&(y=y-r/2-x),Math.abs(y)<.001&&(y=0),a.roundLengths&&(y=Math.floor(y)),C%a.slidesPerGroup==0&&u.push(y),h.push(y)):(a.roundLengths&&(y=Math.floor(y)),(C-Math.min(e.params.slidesPerGroupSkip,C))%e.params.slidesPerGroup==0&&u.push(y),h.push(y),y=y+$+x),e.virtualSize+=$+x,E=$,C+=1}}if(e.virtualSize=Math.max(e.virtualSize,r)+g,n&&l&&("slide"===a.effect||"coverflow"===a.effect)&&i.css({width:`${e.virtualSize+a.spaceBetween}px`}),a.setWrapperSize&&i.css({[t("width")]:`${e.virtualSize+a.spaceBetween}px`}),T&&e.grid.updateWrapperSize($,u,t),!a.centeredSlides){const t=[];for(let s=0;s<u.length;s+=1){let i=u[s];a.roundLengths&&(i=Math.floor(i)),u[s]<=e.virtualSize-r&&t.push(i)}u=t,Math.floor(e.virtualSize-r)-Math.floor(u[u.length-1])>1&&u.push(e.virtualSize-r)}if(0===u.length&&(u=[0]),0!==a.spaceBetween){const s=e.isHorizontal()&&n?"marginLeft":t("marginRight");c.filter(((e,t)=>!a.cssMode||t!==c.length-1)).css({[s]:`${x}px`})}if(a.centeredSlides&&a.centeredSlidesBounds){let e=0;m.forEach((t=>{e+=t+(a.spaceBetween?a.spaceBetween:0)})),e-=a.spaceBetween;const t=e-r;u=u.map((e=>e<0?-f:e>t?t+g:e))}if(a.centerInsufficientSlides){let e=0;if(m.forEach((t=>{e+=t+(a.spaceBetween?a.spaceBetween:0)})),e-=a.spaceBetween,e<r){const t=(r-e)/2;u.forEach(((e,s)=>{u[s]=e-t})),h.forEach(((e,s)=>{h[s]=e+t}))}}if(Object.assign(e,{slides:c,snapGrid:u,slidesGrid:h,slidesSizesGrid:m}),a.centeredSlides&&a.cssMode&&!a.centeredSlidesBounds){v(e.wrapperEl,"--swiper-centered-offset-before",-u[0]+"px"),v(e.wrapperEl,"--swiper-centered-offset-after",e.size/2-m[m.length-1]/2+"px");const t=-e.snapGrid[0],s=-e.slidesGrid[0];e.snapGrid=e.snapGrid.map((e=>e+t)),e.slidesGrid=e.slidesGrid.map((e=>e+s))}if(p!==d&&e.emit("slidesLengthChange"),u.length!==w&&(e.params.watchOverflow&&e.checkOverflow(),e.emit("snapGridLengthChange")),h.length!==b&&e.emit("slidesGridLengthChange"),a.watchSlidesProgress&&e.updateSlidesOffset(),!(o||a.cssMode||"slide"!==a.effect&&"fade"!==a.effect)){const t=`${a.containerModifierClass}backface-hidden`,s=e.$el.hasClass(t);p<=a.maxBackfaceHiddenSlides?s||e.$el.addClass(t):s&&e.$el.removeClass(t)}},updateAutoHeight:function(e){const t=this,s=[],a=t.virtual&&t.params.virtual.enabled;let i,r=0;"number"==typeof e?t.setTransition(e):!0===e&&t.setTransition(t.params.speed);const n=e=>a?t.slides.filter((t=>parseInt(t.getAttribute("data-swiper-slide-index"),10)===e))[0]:t.slides.eq(e)[0];if("auto"!==t.params.slidesPerView&&t.params.slidesPerView>1)if(t.params.centeredSlides)(t.visibleSlides||d([])).each((e=>{s.push(e)}));else for(i=0;i<Math.ceil(t.params.slidesPerView);i+=1){const e=t.activeIndex+i;if(e>t.slides.length&&!a)break;s.push(n(e))}else s.push(n(t.activeIndex));for(i=0;i<s.length;i+=1)if(void 0!==s[i]){const e=s[i].offsetHeight;r=e>r?e:r}(r||0===r)&&t.$wrapperEl.css("height",`${r}px`)},updateSlidesOffset:function(){const e=this,t=e.slides;for(let s=0;s<t.length;s+=1)t[s].swiperSlideOffset=e.isHorizontal()?t[s].offsetLeft:t[s].offsetTop},updateSlidesProgress:function(e){void 0===e&&(e=this&&this.translate||0);const t=this,s=t.params,{slides:a,rtlTranslate:i,snapGrid:r}=t;if(0===a.length)return;void 0===a[0].swiperSlideOffset&&t.updateSlidesOffset();let n=-e;i&&(n=e),a.removeClass(s.slideVisibleClass),t.visibleSlidesIndexes=[],t.visibleSlides=[];for(let e=0;e<a.length;e+=1){const l=a[e];let o=l.swiperSlideOffset;s.cssMode&&s.centeredSlides&&(o-=a[0].swiperSlideOffset);const d=(n+(s.centeredSlides?t.minTranslate():0)-o)/(l.swiperSlideSize+s.spaceBetween),c=(n-r[0]+(s.centeredSlides?t.minTranslate():0)-o)/(l.swiperSlideSize+s.spaceBetween),p=-(n-o),u=p+t.slidesSizesGrid[e];(p>=0&&p<t.size-1||u>1&&u<=t.size||p<=0&&u>=t.size)&&(t.visibleSlides.push(l),t.visibleSlidesIndexes.push(e),a.eq(e).addClass(s.slideVisibleClass)),l.progress=i?-d:d,l.originalProgress=i?-c:c}t.visibleSlides=d(t.visibleSlides)},updateProgress:function(e){const t=this;if(void 0===e){const s=t.rtlTranslate?-1:1;e=t&&t.translate&&t.translate*s||0}const s=t.params,a=t.maxTranslate()-t.minTranslate();let{progress:i,isBeginning:r,isEnd:n}=t;const l=r,o=n;0===a?(i=0,r=!0,n=!0):(i=(e-t.minTranslate())/a,r=i<=0,n=i>=1),Object.assign(t,{progress:i,isBeginning:r,isEnd:n}),(s.watchSlidesProgress||s.centeredSlides&&s.autoHeight)&&t.updateSlidesProgress(e),r&&!l&&t.emit("reachBeginning toEdge"),n&&!o&&t.emit("reachEnd toEdge"),(l&&!r||o&&!n)&&t.emit("fromEdge"),t.emit("progress",i)},updateSlidesClasses:function(){const e=this,{slides:t,params:s,$wrapperEl:a,activeIndex:i,realIndex:r}=e,n=e.virtual&&s.virtual.enabled;let l;t.removeClass(`${s.slideActiveClass} ${s.slideNextClass} ${s.slidePrevClass} ${s.slideDuplicateActiveClass} ${s.slideDuplicateNextClass} ${s.slideDuplicatePrevClass}`),l=n?e.$wrapperEl.find(`.${s.slideClass}[data-swiper-slide-index="${i}"]`):t.eq(i),l.addClass(s.slideActiveClass),s.loop&&(l.hasClass(s.slideDuplicateClass)?a.children(`.${s.slideClass}:not(.${s.slideDuplicateClass})[data-swiper-slide-index="${r}"]`).addClass(s.slideDuplicateActiveClass):a.children(`.${s.slideClass}.${s.slideDuplicateClass}[data-swiper-slide-index="${r}"]`).addClass(s.slideDuplicateActiveClass));let o=l.nextAll(`.${s.slideClass}`).eq(0).addClass(s.slideNextClass);s.loop&&0===o.length&&(o=t.eq(0),o.addClass(s.slideNextClass));let d=l.prevAll(`.${s.slideClass}`).eq(0).addClass(s.slidePrevClass);s.loop&&0===d.length&&(d=t.eq(-1),d.addClass(s.slidePrevClass)),s.loop&&(o.hasClass(s.slideDuplicateClass)?a.children(`.${s.slideClass}:not(.${s.slideDuplicateClass})[data-swiper-slide-index="${o.attr("data-swiper-slide-index")}"]`).addClass(s.slideDuplicateNextClass):a.children(`.${s.slideClass}.${s.slideDuplicateClass}[data-swiper-slide-index="${o.attr("data-swiper-slide-index")}"]`).addClass(s.slideDuplicateNextClass),d.hasClass(s.slideDuplicateClass)?a.children(`.${s.slideClass}:not(.${s.slideDuplicateClass})[data-swiper-slide-index="${d.attr("data-swiper-slide-index")}"]`).addClass(s.slideDuplicatePrevClass):a.children(`.${s.slideClass}.${s.slideDuplicateClass}[data-swiper-slide-index="${d.attr("data-swiper-slide-index")}"]`).addClass(s.slideDuplicatePrevClass)),e.emitSlidesClasses()},updateActiveIndex:function(e){const t=this,s=t.rtlTranslate?t.translate:-t.translate,{slidesGrid:a,snapGrid:i,params:r,activeIndex:n,realIndex:l,snapIndex:o}=t;let d,c=e;if(void 0===c){for(let e=0;e<a.length;e+=1)void 0!==a[e+1]?s>=a[e]&&s<a[e+1]-(a[e+1]-a[e])/2?c=e:s>=a[e]&&s<a[e+1]&&(c=e+1):s>=a[e]&&(c=e);r.normalizeSlideIndex&&(c<0||void 0===c)&&(c=0)}if(i.indexOf(s)>=0)d=i.indexOf(s);else{const e=Math.min(r.slidesPerGroupSkip,c);d=e+Math.floor((c-e)/r.slidesPerGroup)}if(d>=i.length&&(d=i.length-1),c===n)return void(d!==o&&(t.snapIndex=d,t.emit("snapIndexChange")));const p=parseInt(t.slides.eq(c).attr("data-swiper-slide-index")||c,10);Object.assign(t,{snapIndex:d,realIndex:p,previousIndex:n,activeIndex:c}),t.emit("activeIndexChange"),t.emit("snapIndexChange"),l!==p&&t.emit("realIndexChange"),(t.initialized||t.params.runCallbacksOnInit)&&t.emit("slideChange")},updateClickedSlide:function(e){const t=this,s=t.params,a=d(e).closest(`.${s.slideClass}`)[0];let i,r=!1;if(a)for(let e=0;e<t.slides.length;e+=1)if(t.slides[e]===a){r=!0,i=e;break}if(!a||!r)return t.clickedSlide=void 0,void(t.clickedIndex=void 0);t.clickedSlide=a,t.virtual&&t.params.virtual.enabled?t.clickedIndex=parseInt(d(a).attr("data-swiper-slide-index"),10):t.clickedIndex=i,s.slideToClickedSlide&&void 0!==t.clickedIndex&&t.clickedIndex!==t.activeIndex&&t.slideToClickedSlide()}};var M={getTranslate:function(e){void 0===e&&(e=this.isHorizontal()?"x":"y");const{params:t,rtlTranslate:s,translate:a,$wrapperEl:i}=this;if(t.virtualTranslate)return s?-a:a;if(t.cssMode)return a;let r=h(i[0],e);return s&&(r=-r),r||0},setTranslate:function(e,t){const s=this,{rtlTranslate:a,params:i,$wrapperEl:r,wrapperEl:n,progress:l}=s;let o,d=0,c=0;s.isHorizontal()?d=a?-e:e:c=e,i.roundLengths&&(d=Math.floor(d),c=Math.floor(c)),i.cssMode?n[s.isHorizontal()?"scrollLeft":"scrollTop"]=s.isHorizontal()?-d:-c:i.virtualTranslate||r.transform(`translate3d(${d}px, ${c}px, 0px)`),s.previousTranslate=s.translate,s.translate=s.isHorizontal()?d:c;const p=s.maxTranslate()-s.minTranslate();o=0===p?0:(e-s.minTranslate())/p,o!==l&&s.updateProgress(e),s.emit("setTranslate",s.translate,t)},minTranslate:function(){return-this.snapGrid[0]},maxTranslate:function(){return-this.snapGrid[this.snapGrid.length-1]},translateTo:function(e,t,s,a,i){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===s&&(s=!0),void 0===a&&(a=!0);const r=this,{params:n,wrapperEl:l}=r;if(r.animating&&n.preventInteractionOnTransition)return!1;const o=r.minTranslate(),d=r.maxTranslate();let c;if(c=a&&e>o?o:a&&e<d?d:e,r.updateProgress(c),n.cssMode){const e=r.isHorizontal();if(0===t)l[e?"scrollLeft":"scrollTop"]=-c;else{if(!r.support.smoothScroll)return w({swiper:r,targetPosition:-c,side:e?"left":"top"}),!0;l.scrollTo({[e?"left":"top"]:-c,behavior:"smooth"})}return!0}return 0===t?(r.setTransition(0),r.setTranslate(c),s&&(r.emit("beforeTransitionStart",t,i),r.emit("transitionEnd"))):(r.setTransition(t),r.setTranslate(c),s&&(r.emit("beforeTransitionStart",t,i),r.emit("transitionStart")),r.animating||(r.animating=!0,r.onTranslateToWrapperTransitionEnd||(r.onTranslateToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.$wrapperEl[0].removeEventListener("transitionend",r.onTranslateToWrapperTransitionEnd),r.$wrapperEl[0].removeEventListener("webkitTransitionEnd",r.onTranslateToWrapperTransitionEnd),r.onTranslateToWrapperTransitionEnd=null,delete r.onTranslateToWrapperTransitionEnd,s&&r.emit("transitionEnd"))}),r.$wrapperEl[0].addEventListener("transitionend",r.onTranslateToWrapperTransitionEnd),r.$wrapperEl[0].addEventListener("webkitTransitionEnd",r.onTranslateToWrapperTransitionEnd))),!0}};function P(e){let{swiper:t,runCallbacks:s,direction:a,step:i}=e;const{activeIndex:r,previousIndex:n}=t;let l=a;if(l||(l=r>n?"next":r<n?"prev":"reset"),t.emit(`transition${i}`),s&&r!==n){if("reset"===l)return void t.emit(`slideResetTransition${i}`);t.emit(`slideChangeTransition${i}`),"next"===l?t.emit(`slideNextTransition${i}`):t.emit(`slidePrevTransition${i}`)}}var k={slideTo:function(e,t,s,a,i){if(void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===s&&(s=!0),"number"!=typeof e&&"string"!=typeof e)throw new Error(`The 'index' argument cannot have type other than 'number' or 'string'. [${typeof e}] given.`);if("string"==typeof e){const t=parseInt(e,10);if(!isFinite(t))throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${e}] given.`);e=t}const r=this;let n=e;n<0&&(n=0);const{params:l,snapGrid:o,slidesGrid:d,previousIndex:c,activeIndex:p,rtlTranslate:u,wrapperEl:h,enabled:m}=r;if(r.animating&&l.preventInteractionOnTransition||!m&&!a&&!i)return!1;const f=Math.min(r.params.slidesPerGroupSkip,n);let g=f+Math.floor((n-f)/r.params.slidesPerGroup);g>=o.length&&(g=o.length-1),(p||l.initialSlide||0)===(c||0)&&s&&r.emit("beforeSlideChangeStart");const v=-o[g];if(r.updateProgress(v),l.normalizeSlideIndex)for(let e=0;e<d.length;e+=1){const t=-Math.floor(100*v),s=Math.floor(100*d[e]),a=Math.floor(100*d[e+1]);void 0!==d[e+1]?t>=s&&t<a-(a-s)/2?n=e:t>=s&&t<a&&(n=e+1):t>=s&&(n=e)}if(r.initialized&&n!==p){if(!r.allowSlideNext&&v<r.translate&&v<r.minTranslate())return!1;if(!r.allowSlidePrev&&v>r.translate&&v>r.maxTranslate()&&(p||0)!==n)return!1}let b;if(b=n>p?"next":n<p?"prev":"reset",u&&-v===r.translate||!u&&v===r.translate)return r.updateActiveIndex(n),l.autoHeight&&r.updateAutoHeight(),r.updateSlidesClasses(),"slide"!==l.effect&&r.setTranslate(v),"reset"!==b&&(r.transitionStart(s,b),r.transitionEnd(s,b)),!1;if(l.cssMode){const e=r.isHorizontal(),s=u?v:-v;if(0===t){const t=r.virtual&&r.params.virtual.enabled;t&&(r.wrapperEl.style.scrollSnapType="none",r._immediateVirtual=!0),h[e?"scrollLeft":"scrollTop"]=s,t&&requestAnimationFrame((()=>{r.wrapperEl.style.scrollSnapType="",r._swiperImmediateVirtual=!1}))}else{if(!r.support.smoothScroll)return w({swiper:r,targetPosition:s,side:e?"left":"top"}),!0;h.scrollTo({[e?"left":"top"]:s,behavior:"smooth"})}return!0}return r.setTransition(t),r.setTranslate(v),r.updateActiveIndex(n),r.updateSlidesClasses(),r.emit("beforeTransitionStart",t,a),r.transitionStart(s,b),0===t?r.transitionEnd(s,b):r.animating||(r.animating=!0,r.onSlideToWrapperTransitionEnd||(r.onSlideToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.$wrapperEl[0].removeEventListener("transitionend",r.onSlideToWrapperTransitionEnd),r.$wrapperEl[0].removeEventListener("webkitTransitionEnd",r.onSlideToWrapperTransitionEnd),r.onSlideToWrapperTransitionEnd=null,delete r.onSlideToWrapperTransitionEnd,r.transitionEnd(s,b))}),r.$wrapperEl[0].addEventListener("transitionend",r.onSlideToWrapperTransitionEnd),r.$wrapperEl[0].addEventListener("webkitTransitionEnd",r.onSlideToWrapperTransitionEnd)),!0},slideToLoop:function(e,t,s,a){if(void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===s&&(s=!0),"string"==typeof e){const t=parseInt(e,10);if(!isFinite(t))throw new Error(`The passed-in 'index' (string) couldn't be converted to 'number'. [${e}] given.`);e=t}const i=this;let r=e;return i.params.loop&&(r+=i.loopedSlides),i.slideTo(r,t,s,a)},slideNext:function(e,t,s){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);const a=this,{animating:i,enabled:r,params:n}=a;if(!r)return a;let l=n.slidesPerGroup;"auto"===n.slidesPerView&&1===n.slidesPerGroup&&n.slidesPerGroupAuto&&(l=Math.max(a.slidesPerViewDynamic("current",!0),1));const o=a.activeIndex<n.slidesPerGroupSkip?1:l;if(n.loop){if(i&&n.loopPreventsSlide)return!1;a.loopFix(),a._clientLeft=a.$wrapperEl[0].clientLeft}return n.rewind&&a.isEnd?a.slideTo(0,e,t,s):a.slideTo(a.activeIndex+o,e,t,s)},slidePrev:function(e,t,s){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);const a=this,{params:i,animating:r,snapGrid:n,slidesGrid:l,rtlTranslate:o,enabled:d}=a;if(!d)return a;if(i.loop){if(r&&i.loopPreventsSlide)return!1;a.loopFix(),a._clientLeft=a.$wrapperEl[0].clientLeft}function c(e){return e<0?-Math.floor(Math.abs(e)):Math.floor(e)}const p=c(o?a.translate:-a.translate),u=n.map((e=>c(e)));let h=n[u.indexOf(p)-1];if(void 0===h&&i.cssMode){let e;n.forEach(((t,s)=>{p>=t&&(e=s)})),void 0!==e&&(h=n[e>0?e-1:e])}let m=0;if(void 0!==h&&(m=l.indexOf(h),m<0&&(m=a.activeIndex-1),"auto"===i.slidesPerView&&1===i.slidesPerGroup&&i.slidesPerGroupAuto&&(m=m-a.slidesPerViewDynamic("previous",!0)+1,m=Math.max(m,0))),i.rewind&&a.isBeginning){const i=a.params.virtual&&a.params.virtual.enabled&&a.virtual?a.virtual.slides.length-1:a.slides.length-1;return a.slideTo(i,e,t,s)}return a.slideTo(m,e,t,s)},slideReset:function(e,t,s){return void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),this.slideTo(this.activeIndex,e,t,s)},slideToClosest:function(e,t,s,a){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),void 0===a&&(a=.5);const i=this;let r=i.activeIndex;const n=Math.min(i.params.slidesPerGroupSkip,r),l=n+Math.floor((r-n)/i.params.slidesPerGroup),o=i.rtlTranslate?i.translate:-i.translate;if(o>=i.snapGrid[l]){const e=i.snapGrid[l];o-e>(i.snapGrid[l+1]-e)*a&&(r+=i.params.slidesPerGroup)}else{const e=i.snapGrid[l-1];o-e<=(i.snapGrid[l]-e)*a&&(r-=i.params.slidesPerGroup)}return r=Math.max(r,0),r=Math.min(r,i.slidesGrid.length-1),i.slideTo(r,e,t,s)},slideToClickedSlide:function(){const e=this,{params:t,$wrapperEl:s}=e,a="auto"===t.slidesPerView?e.slidesPerViewDynamic():t.slidesPerView;let i,r=e.clickedIndex;if(t.loop){if(e.animating)return;i=parseInt(d(e.clickedSlide).attr("data-swiper-slide-index"),10),t.centeredSlides?r<e.loopedSlides-a/2||r>e.slides.length-e.loopedSlides+a/2?(e.loopFix(),r=s.children(`.${t.slideClass}[data-swiper-slide-index="${i}"]:not(.${t.slideDuplicateClass})`).eq(0).index(),p((()=>{e.slideTo(r)}))):e.slideTo(r):r>e.slides.length-a?(e.loopFix(),r=s.children(`.${t.slideClass}[data-swiper-slide-index="${i}"]:not(.${t.slideDuplicateClass})`).eq(0).index(),p((()=>{e.slideTo(r)}))):e.slideTo(r)}else e.slideTo(r)}};var z={loopCreate:function(){const e=this,t=a(),{params:s,$wrapperEl:i}=e,r=i.children().length>0?d(i.children()[0].parentNode):i;r.children(`.${s.slideClass}.${s.slideDuplicateClass}`).remove();let n=r.children(`.${s.slideClass}`);if(s.loopFillGroupWithBlank){const e=s.slidesPerGroup-n.length%s.slidesPerGroup;if(e!==s.slidesPerGroup){for(let a=0;a<e;a+=1){const e=d(t.createElement("div")).addClass(`${s.slideClass} ${s.slideBlankClass}`);r.append(e)}n=r.children(`.${s.slideClass}`)}}"auto"!==s.slidesPerView||s.loopedSlides||(s.loopedSlides=n.length),e.loopedSlides=Math.ceil(parseFloat(s.loopedSlides||s.slidesPerView,10)),e.loopedSlides+=s.loopAdditionalSlides,e.loopedSlides>n.length&&(e.loopedSlides=n.length);const l=[],o=[];n.each(((t,s)=>{const a=d(t);s<e.loopedSlides&&o.push(t),s<n.length&&s>=n.length-e.loopedSlides&&l.push(t),a.attr("data-swiper-slide-index",s)}));for(let e=0;e<o.length;e+=1)r.append(d(o[e].cloneNode(!0)).addClass(s.slideDuplicateClass));for(let e=l.length-1;e>=0;e-=1)r.prepend(d(l[e].cloneNode(!0)).addClass(s.slideDuplicateClass))},loopFix:function(){const e=this;e.emit("beforeLoopFix");const{activeIndex:t,slides:s,loopedSlides:a,allowSlidePrev:i,allowSlideNext:r,snapGrid:n,rtlTranslate:l}=e;let o;e.allowSlidePrev=!0,e.allowSlideNext=!0;const d=-n[t]-e.getTranslate();if(t<a){o=s.length-3*a+t,o+=a;e.slideTo(o,0,!1,!0)&&0!==d&&e.setTranslate((l?-e.translate:e.translate)-d)}else if(t>=s.length-a){o=-s.length+t+a,o+=a;e.slideTo(o,0,!1,!0)&&0!==d&&e.setTranslate((l?-e.translate:e.translate)-d)}e.allowSlidePrev=i,e.allowSlideNext=r,e.emit("loopFix")},loopDestroy:function(){const{$wrapperEl:e,params:t,slides:s}=this;e.children(`.${t.slideClass}.${t.slideDuplicateClass},.${t.slideClass}.${t.slideBlankClass}`).remove(),s.removeAttr("data-swiper-slide-index")}};function L(e){const t=this,s=a(),i=r(),n=t.touchEventsData,{params:l,touches:o,enabled:c}=t;if(!c)return;if(t.animating&&l.preventInteractionOnTransition)return;!t.animating&&l.cssMode&&l.loop&&t.loopFix();let p=e;p.originalEvent&&(p=p.originalEvent);let h=d(p.target);if("wrapper"===l.touchEventsTarget&&!h.closest(t.wrapperEl).length)return;if(n.isTouchEvent="touchstart"===p.type,!n.isTouchEvent&&"which"in p&&3===p.which)return;if(!n.isTouchEvent&&"button"in p&&p.button>0)return;if(n.isTouched&&n.isMoved)return;!!l.noSwipingClass&&""!==l.noSwipingClass&&p.target&&p.target.shadowRoot&&e.path&&e.path[0]&&(h=d(e.path[0]));const m=l.noSwipingSelector?l.noSwipingSelector:`.${l.noSwipingClass}`,f=!(!p.target||!p.target.shadowRoot);if(l.noSwiping&&(f?function(e,t){return void 0===t&&(t=this),function t(s){if(!s||s===a()||s===r())return null;s.assignedSlot&&(s=s.assignedSlot);const i=s.closest(e);return i||s.getRootNode?i||t(s.getRootNode().host):null}(t)}(m,h[0]):h.closest(m)[0]))return void(t.allowClick=!0);if(l.swipeHandler&&!h.closest(l.swipeHandler)[0])return;o.currentX="touchstart"===p.type?p.targetTouches[0].pageX:p.pageX,o.currentY="touchstart"===p.type?p.targetTouches[0].pageY:p.pageY;const g=o.currentX,v=o.currentY,w=l.edgeSwipeDetection||l.iOSEdgeSwipeDetection,b=l.edgeSwipeThreshold||l.iOSEdgeSwipeThreshold;if(w&&(g<=b||g>=i.innerWidth-b)){if("prevent"!==w)return;e.preventDefault()}if(Object.assign(n,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),o.startX=g,o.startY=v,n.touchStartTime=u(),t.allowClick=!0,t.updateSize(),t.swipeDirection=void 0,l.threshold>0&&(n.allowThresholdMove=!1),"touchstart"!==p.type){let e=!0;h.is(n.focusableElements)&&(e=!1,"SELECT"===h[0].nodeName&&(n.isTouched=!1)),s.activeElement&&d(s.activeElement).is(n.focusableElements)&&s.activeElement!==h[0]&&s.activeElement.blur();const a=e&&t.allowTouchMove&&l.touchStartPreventDefault;!l.touchStartForcePreventDefault&&!a||h[0].isContentEditable||p.preventDefault()}t.params.freeMode&&t.params.freeMode.enabled&&t.freeMode&&t.animating&&!l.cssMode&&t.freeMode.onTouchStart(),t.emit("touchStart",p)}function O(e){const t=a(),s=this,i=s.touchEventsData,{params:r,touches:n,rtlTranslate:l,enabled:o}=s;if(!o)return;let c=e;if(c.originalEvent&&(c=c.originalEvent),!i.isTouched)return void(i.startMoving&&i.isScrolling&&s.emit("touchMoveOpposite",c));if(i.isTouchEvent&&"touchmove"!==c.type)return;const p="touchmove"===c.type&&c.targetTouches&&(c.targetTouches[0]||c.changedTouches[0]),h="touchmove"===c.type?p.pageX:c.pageX,m="touchmove"===c.type?p.pageY:c.pageY;if(c.preventedByNestedSwiper)return n.startX=h,void(n.startY=m);if(!s.allowTouchMove)return d(c.target).is(i.focusableElements)||(s.allowClick=!1),void(i.isTouched&&(Object.assign(n,{startX:h,startY:m,currentX:h,currentY:m}),i.touchStartTime=u()));if(i.isTouchEvent&&r.touchReleaseOnEdges&&!r.loop)if(s.isVertical()){if(m<n.startY&&s.translate<=s.maxTranslate()||m>n.startY&&s.translate>=s.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(h<n.startX&&s.translate<=s.maxTranslate()||h>n.startX&&s.translate>=s.minTranslate())return;if(i.isTouchEvent&&t.activeElement&&c.target===t.activeElement&&d(c.target).is(i.focusableElements))return i.isMoved=!0,void(s.allowClick=!1);if(i.allowTouchCallbacks&&s.emit("touchMove",c),c.targetTouches&&c.targetTouches.length>1)return;n.currentX=h,n.currentY=m;const f=n.currentX-n.startX,g=n.currentY-n.startY;if(s.params.threshold&&Math.sqrt(f**2+g**2)<s.params.threshold)return;if(void 0===i.isScrolling){let e;s.isHorizontal()&&n.currentY===n.startY||s.isVertical()&&n.currentX===n.startX?i.isScrolling=!1:f*f+g*g>=25&&(e=180*Math.atan2(Math.abs(g),Math.abs(f))/Math.PI,i.isScrolling=s.isHorizontal()?e>r.touchAngle:90-e>r.touchAngle)}if(i.isScrolling&&s.emit("touchMoveOpposite",c),void 0===i.startMoving&&(n.currentX===n.startX&&n.currentY===n.startY||(i.startMoving=!0)),i.isScrolling)return void(i.isTouched=!1);if(!i.startMoving)return;s.allowClick=!1,!r.cssMode&&c.cancelable&&c.preventDefault(),r.touchMoveStopPropagation&&!r.nested&&c.stopPropagation(),i.isMoved||(r.loop&&!r.cssMode&&s.loopFix(),i.startTranslate=s.getTranslate(),s.setTransition(0),s.animating&&s.$wrapperEl.trigger("webkitTransitionEnd transitionend"),i.allowMomentumBounce=!1,!r.grabCursor||!0!==s.allowSlideNext&&!0!==s.allowSlidePrev||s.setGrabCursor(!0),s.emit("sliderFirstMove",c)),s.emit("sliderMove",c),i.isMoved=!0;let v=s.isHorizontal()?f:g;n.diff=v,v*=r.touchRatio,l&&(v=-v),s.swipeDirection=v>0?"prev":"next",i.currentTranslate=v+i.startTranslate;let w=!0,b=r.resistanceRatio;if(r.touchReleaseOnEdges&&(b=0),v>0&&i.currentTranslate>s.minTranslate()?(w=!1,r.resistance&&(i.currentTranslate=s.minTranslate()-1+(-s.minTranslate()+i.startTranslate+v)**b)):v<0&&i.currentTranslate<s.maxTranslate()&&(w=!1,r.resistance&&(i.currentTranslate=s.maxTranslate()+1-(s.maxTranslate()-i.startTranslate-v)**b)),w&&(c.preventedByNestedSwiper=!0),!s.allowSlideNext&&"next"===s.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!s.allowSlidePrev&&"prev"===s.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),s.allowSlidePrev||s.allowSlideNext||(i.currentTranslate=i.startTranslate),r.threshold>0){if(!(Math.abs(v)>r.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,n.startX=n.currentX,n.startY=n.currentY,i.currentTranslate=i.startTranslate,void(n.diff=s.isHorizontal()?n.currentX-n.startX:n.currentY-n.startY)}r.followFinger&&!r.cssMode&&((r.freeMode&&r.freeMode.enabled&&s.freeMode||r.watchSlidesProgress)&&(s.updateActiveIndex(),s.updateSlidesClasses()),s.params.freeMode&&r.freeMode.enabled&&s.freeMode&&s.freeMode.onTouchMove(),s.updateProgress(i.currentTranslate),s.setTranslate(i.currentTranslate))}function I(e){const t=this,s=t.touchEventsData,{params:a,touches:i,rtlTranslate:r,slidesGrid:n,enabled:l}=t;if(!l)return;let o=e;if(o.originalEvent&&(o=o.originalEvent),s.allowTouchCallbacks&&t.emit("touchEnd",o),s.allowTouchCallbacks=!1,!s.isTouched)return s.isMoved&&a.grabCursor&&t.setGrabCursor(!1),s.isMoved=!1,void(s.startMoving=!1);a.grabCursor&&s.isMoved&&s.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);const d=u(),c=d-s.touchStartTime;if(t.allowClick){const e=o.path||o.composedPath&&o.composedPath();t.updateClickedSlide(e&&e[0]||o.target),t.emit("tap click",o),c<300&&d-s.lastClickTime<300&&t.emit("doubleTap doubleClick",o)}if(s.lastClickTime=u(),p((()=>{t.destroyed||(t.allowClick=!0)})),!s.isTouched||!s.isMoved||!t.swipeDirection||0===i.diff||s.currentTranslate===s.startTranslate)return s.isTouched=!1,s.isMoved=!1,void(s.startMoving=!1);let h;if(s.isTouched=!1,s.isMoved=!1,s.startMoving=!1,h=a.followFinger?r?t.translate:-t.translate:-s.currentTranslate,a.cssMode)return;if(t.params.freeMode&&a.freeMode.enabled)return void t.freeMode.onTouchEnd({currentPos:h});let m=0,f=t.slidesSizesGrid[0];for(let e=0;e<n.length;e+=e<a.slidesPerGroupSkip?1:a.slidesPerGroup){const t=e<a.slidesPerGroupSkip-1?1:a.slidesPerGroup;void 0!==n[e+t]?h>=n[e]&&h<n[e+t]&&(m=e,f=n[e+t]-n[e]):h>=n[e]&&(m=e,f=n[n.length-1]-n[n.length-2])}let g=null,v=null;a.rewind&&(t.isBeginning?v=t.params.virtual&&t.params.virtual.enabled&&t.virtual?t.virtual.slides.length-1:t.slides.length-1:t.isEnd&&(g=0));const w=(h-n[m])/f,b=m<a.slidesPerGroupSkip-1?1:a.slidesPerGroup;if(c>a.longSwipesMs){if(!a.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(w>=a.longSwipesRatio?t.slideTo(a.rewind&&t.isEnd?g:m+b):t.slideTo(m)),"prev"===t.swipeDirection&&(w>1-a.longSwipesRatio?t.slideTo(m+b):null!==v&&w<0&&Math.abs(w)>a.longSwipesRatio?t.slideTo(v):t.slideTo(m))}else{if(!a.shortSwipes)return void t.slideTo(t.activeIndex);t.navigation&&(o.target===t.navigation.nextEl||o.target===t.navigation.prevEl)?o.target===t.navigation.nextEl?t.slideTo(m+b):t.slideTo(m):("next"===t.swipeDirection&&t.slideTo(null!==g?g:m+b),"prev"===t.swipeDirection&&t.slideTo(null!==v?v:m))}}function A(){const e=this,{params:t,el:s}=e;if(s&&0===s.offsetWidth)return;t.breakpoints&&e.setBreakpoint();const{allowSlideNext:a,allowSlidePrev:i,snapGrid:r}=e;e.allowSlideNext=!0,e.allowSlidePrev=!0,e.updateSize(),e.updateSlides(),e.updateSlidesClasses(),("auto"===t.slidesPerView||t.slidesPerView>1)&&e.isEnd&&!e.isBeginning&&!e.params.centeredSlides?e.slideTo(e.slides.length-1,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0),e.autoplay&&e.autoplay.running&&e.autoplay.paused&&e.autoplay.run(),e.allowSlidePrev=i,e.allowSlideNext=a,e.params.watchOverflow&&r!==e.snapGrid&&e.checkOverflow()}function D(e){const t=this;t.enabled&&(t.allowClick||(t.params.preventClicks&&e.preventDefault(),t.params.preventClicksPropagation&&t.animating&&(e.stopPropagation(),e.stopImmediatePropagation())))}function G(){const e=this,{wrapperEl:t,rtlTranslate:s,enabled:a}=e;if(!a)return;let i;e.previousTranslate=e.translate,e.isHorizontal()?e.translate=-t.scrollLeft:e.translate=-t.scrollTop,0===e.translate&&(e.translate=0),e.updateActiveIndex(),e.updateSlidesClasses();const r=e.maxTranslate()-e.minTranslate();i=0===r?0:(e.translate-e.minTranslate())/r,i!==e.progress&&e.updateProgress(s?-e.translate:e.translate),e.emit("setTranslate",e.translate,!1)}let N=!1;function B(){}const H=(e,t)=>{const s=a(),{params:i,touchEvents:r,el:n,wrapperEl:l,device:o,support:d}=e,c=!!i.nested,p="on"===t?"addEventListener":"removeEventListener",u=t;if(d.touch){const t=!("touchstart"!==r.start||!d.passiveListener||!i.passiveListeners)&&{passive:!0,capture:!1};n[p](r.start,e.onTouchStart,t),n[p](r.move,e.onTouchMove,d.passiveListener?{passive:!1,capture:c}:c),n[p](r.end,e.onTouchEnd,t),r.cancel&&n[p](r.cancel,e.onTouchEnd,t)}else n[p](r.start,e.onTouchStart,!1),s[p](r.move,e.onTouchMove,c),s[p](r.end,e.onTouchEnd,!1);(i.preventClicks||i.preventClicksPropagation)&&n[p]("click",e.onClick,!0),i.cssMode&&l[p]("scroll",e.onScroll),i.updateOnWindowResize?e[u](o.ios||o.android?"resize orientationchange observerUpdate":"resize observerUpdate",A,!0):e[u]("observerUpdate",A,!0)};var X={attachEvents:function(){const e=this,t=a(),{params:s,support:i}=e;e.onTouchStart=L.bind(e),e.onTouchMove=O.bind(e),e.onTouchEnd=I.bind(e),s.cssMode&&(e.onScroll=G.bind(e)),e.onClick=D.bind(e),i.touch&&!N&&(t.addEventListener("touchstart",B),N=!0),H(e,"on")},detachEvents:function(){H(this,"off")}};const Y=(e,t)=>e.grid&&t.grid&&t.grid.rows>1;var R={addClasses:function(){const e=this,{classNames:t,params:s,rtl:a,$el:i,device:r,support:n}=e,l=function(e,t){const s=[];return e.forEach((e=>{"object"==typeof e?Object.keys(e).forEach((a=>{e[a]&&s.push(t+a)})):"string"==typeof e&&s.push(t+e)})),s}(["initialized",s.direction,{"pointer-events":!n.touch},{"free-mode":e.params.freeMode&&s.freeMode.enabled},{autoheight:s.autoHeight},{rtl:a},{grid:s.grid&&s.grid.rows>1},{"grid-column":s.grid&&s.grid.rows>1&&"column"===s.grid.fill},{android:r.android},{ios:r.ios},{"css-mode":s.cssMode},{centered:s.cssMode&&s.centeredSlides},{"watch-progress":s.watchSlidesProgress}],s.containerModifierClass);t.push(...l),i.addClass([...t].join(" ")),e.emitContainerClasses()},removeClasses:function(){const{$el:e,classNames:t}=this;e.removeClass(t.join(" ")),this.emitContainerClasses()}};var W={init:!0,direction:"horizontal",touchEventsTarget:"wrapper",initialSlide:0,speed:300,cssMode:!1,updateOnWindowResize:!0,resizeObserver:!0,nested:!1,createElements:!1,enabled:!0,focusableElements:"input, select, option, textarea, button, video, label",width:null,height:null,preventInteractionOnTransition:!1,userAgent:null,url:null,edgeSwipeDetection:!1,edgeSwipeThreshold:20,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,breakpointsBase:"window",spaceBetween:0,slidesPerView:1,slidesPerGroup:1,slidesPerGroupSkip:0,slidesPerGroupAuto:!1,centeredSlides:!1,centeredSlidesBounds:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,centerInsufficientSlides:!1,watchOverflow:!0,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:0,touchMoveStopPropagation:!1,touchStartPreventDefault:!0,touchStartForcePreventDefault:!1,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,loopFillGroupWithBlank:!1,loopPreventsSlide:!0,rewind:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,maxBackfaceHiddenSlides:10,containerModifierClass:"swiper-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-invisible-blank",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",runCallbacksOnInit:!0,_emitClasses:!1};function j(e,t){return function(s){void 0===s&&(s={});const a=Object.keys(s)[0],i=s[a];"object"==typeof i&&null!==i?(["navigation","pagination","scrollbar"].indexOf(a)>=0&&!0===e[a]&&(e[a]={auto:!0}),a in e&&"enabled"in i?(!0===e[a]&&(e[a]={enabled:!0}),"object"!=typeof e[a]||"enabled"in e[a]||(e[a].enabled=!0),e[a]||(e[a]={enabled:!1}),g(t,s)):g(t,s)):g(t,s)}}const _={eventsEmitter:$,update:S,translate:M,transition:{setTransition:function(e,t){const s=this;s.params.cssMode||s.$wrapperEl.transition(e),s.emit("setTransition",e,t)},transitionStart:function(e,t){void 0===e&&(e=!0);const s=this,{params:a}=s;a.cssMode||(a.autoHeight&&s.updateAutoHeight(),P({swiper:s,runCallbacks:e,direction:t,step:"Start"}))},transitionEnd:function(e,t){void 0===e&&(e=!0);const s=this,{params:a}=s;s.animating=!1,a.cssMode||(s.setTransition(0),P({swiper:s,runCallbacks:e,direction:t,step:"End"}))}},slide:k,loop:z,grabCursor:{setGrabCursor:function(e){const t=this;if(t.support.touch||!t.params.simulateTouch||t.params.watchOverflow&&t.isLocked||t.params.cssMode)return;const s="container"===t.params.touchEventsTarget?t.el:t.wrapperEl;s.style.cursor="move",s.style.cursor=e?"grabbing":"grab"},unsetGrabCursor:function(){const e=this;e.support.touch||e.params.watchOverflow&&e.isLocked||e.params.cssMode||(e["container"===e.params.touchEventsTarget?"el":"wrapperEl"].style.cursor="")}},events:X,breakpoints:{setBreakpoint:function(){const e=this,{activeIndex:t,initialized:s,loopedSlides:a=0,params:i,$el:r}=e,n=i.breakpoints;if(!n||n&&0===Object.keys(n).length)return;const l=e.getBreakpoint(n,e.params.breakpointsBase,e.el);if(!l||e.currentBreakpoint===l)return;const o=(l in n?n[l]:void 0)||e.originalParams,d=Y(e,i),c=Y(e,o),p=i.enabled;d&&!c?(r.removeClass(`${i.containerModifierClass}grid ${i.containerModifierClass}grid-column`),e.emitContainerClasses()):!d&&c&&(r.addClass(`${i.containerModifierClass}grid`),(o.grid.fill&&"column"===o.grid.fill||!o.grid.fill&&"column"===i.grid.fill)&&r.addClass(`${i.containerModifierClass}grid-column`),e.emitContainerClasses()),["navigation","pagination","scrollbar"].forEach((t=>{const s=i[t]&&i[t].enabled,a=o[t]&&o[t].enabled;s&&!a&&e[t].disable(),!s&&a&&e[t].enable()}));const u=o.direction&&o.direction!==i.direction,h=i.loop&&(o.slidesPerView!==i.slidesPerView||u);u&&s&&e.changeDirection(),g(e.params,o);const m=e.params.enabled;Object.assign(e,{allowTouchMove:e.params.allowTouchMove,allowSlideNext:e.params.allowSlideNext,allowSlidePrev:e.params.allowSlidePrev}),p&&!m?e.disable():!p&&m&&e.enable(),e.currentBreakpoint=l,e.emit("_beforeBreakpoint",o),h&&s&&(e.loopDestroy(),e.loopCreate(),e.updateSlides(),e.slideTo(t-a+e.loopedSlides,0,!1)),e.emit("breakpoint",o)},getBreakpoint:function(e,t,s){if(void 0===t&&(t="window"),!e||"container"===t&&!s)return;let a=!1;const i=r(),n="window"===t?i.innerHeight:s.clientHeight,l=Object.keys(e).map((e=>{if("string"==typeof e&&0===e.indexOf("@")){const t=parseFloat(e.substr(1));return{value:n*t,point:e}}return{value:e,point:e}}));l.sort(((e,t)=>parseInt(e.value,10)-parseInt(t.value,10)));for(let e=0;e<l.length;e+=1){const{point:r,value:n}=l[e];"window"===t?i.matchMedia(`(min-width: ${n}px)`).matches&&(a=r):n<=s.clientWidth&&(a=r)}return a||"max"}},checkOverflow:{checkOverflow:function(){const e=this,{isLocked:t,params:s}=e,{slidesOffsetBefore:a}=s;if(a){const t=e.slides.length-1,s=e.slidesGrid[t]+e.slidesSizesGrid[t]+2*a;e.isLocked=e.size>s}else e.isLocked=1===e.snapGrid.length;!0===s.allowSlideNext&&(e.allowSlideNext=!e.isLocked),!0===s.allowSlidePrev&&(e.allowSlidePrev=!e.isLocked),t&&t!==e.isLocked&&(e.isEnd=!1),t!==e.isLocked&&e.emit(e.isLocked?"lock":"unlock")}},classes:R,images:{loadImage:function(e,t,s,a,i,n){const l=r();let o;function c(){n&&n()}d(e).parent("picture")[0]||e.complete&&i?c():t?(o=new l.Image,o.onload=c,o.onerror=c,a&&(o.sizes=a),s&&(o.srcset=s),t&&(o.src=t)):c()},preloadImages:function(){const e=this;function t(){null!=e&&e&&!e.destroyed&&(void 0!==e.imagesLoaded&&(e.imagesLoaded+=1),e.imagesLoaded===e.imagesToLoad.length&&(e.params.updateOnImagesReady&&e.update(),e.emit("imagesReady")))}e.imagesToLoad=e.$el.find("img");for(let s=0;s<e.imagesToLoad.length;s+=1){const a=e.imagesToLoad[s];e.loadImage(a,a.currentSrc||a.getAttribute("src"),a.srcset||a.getAttribute("srcset"),a.sizes||a.getAttribute("sizes"),!0,t)}}}},q={};class V{constructor(){let e,t;for(var s=arguments.length,a=new Array(s),i=0;i<s;i++)a[i]=arguments[i];if(1===a.length&&a[0].constructor&&"Object"===Object.prototype.toString.call(a[0]).slice(8,-1)?t=a[0]:[e,t]=a,t||(t={}),t=g({},t),e&&!t.el&&(t.el=e),t.el&&d(t.el).length>1){const e=[];return d(t.el).each((s=>{const a=g({},t,{el:s});e.push(new V(a))})),e}const r=this;r.__swiper__=!0,r.support=E(),r.device=C({userAgent:t.userAgent}),r.browser=T(),r.eventsListeners={},r.eventsAnyListeners=[],r.modules=[...r.__modules__],t.modules&&Array.isArray(t.modules)&&r.modules.push(...t.modules);const n={};r.modules.forEach((e=>{e({swiper:r,extendParams:j(t,n),on:r.on.bind(r),once:r.once.bind(r),off:r.off.bind(r),emit:r.emit.bind(r)})}));const l=g({},W,n);return r.params=g({},l,q,t),r.originalParams=g({},r.params),r.passedParams=g({},t),r.params&&r.params.on&&Object.keys(r.params.on).forEach((e=>{r.on(e,r.params.on[e])})),r.params&&r.params.onAny&&r.onAny(r.params.onAny),r.$=d,Object.assign(r,{enabled:r.params.enabled,el:e,classNames:[],slides:d(),slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:()=>"horizontal"===r.params.direction,isVertical:()=>"vertical"===r.params.direction,activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,previousTranslate:0,progress:0,velocity:0,animating:!1,allowSlideNext:r.params.allowSlideNext,allowSlidePrev:r.params.allowSlidePrev,touchEvents:function(){const e=["touchstart","touchmove","touchend","touchcancel"],t=["pointerdown","pointermove","pointerup"];return r.touchEventsTouch={start:e[0],move:e[1],end:e[2],cancel:e[3]},r.touchEventsDesktop={start:t[0],move:t[1],end:t[2]},r.support.touch||!r.params.simulateTouch?r.touchEventsTouch:r.touchEventsDesktop}(),touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,focusableElements:r.params.focusableElements,lastClickTime:u(),clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,isTouchEvent:void 0,startMoving:void 0},allowClick:!0,allowTouchMove:r.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),r.emit("_swiper"),r.params.init&&r.init(),r}enable(){const e=this;e.enabled||(e.enabled=!0,e.params.grabCursor&&e.setGrabCursor(),e.emit("enable"))}disable(){const e=this;e.enabled&&(e.enabled=!1,e.params.grabCursor&&e.unsetGrabCursor(),e.emit("disable"))}setProgress(e,t){const s=this;e=Math.min(Math.max(e,0),1);const a=s.minTranslate(),i=(s.maxTranslate()-a)*e+a;s.translateTo(i,void 0===t?0:t),s.updateActiveIndex(),s.updateSlidesClasses()}emitContainerClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=e.el.className.split(" ").filter((t=>0===t.indexOf("swiper")||0===t.indexOf(e.params.containerModifierClass)));e.emit("_containerClasses",t.join(" "))}getSlideClasses(e){const t=this;return t.destroyed?"":e.className.split(" ").filter((e=>0===e.indexOf("swiper-slide")||0===e.indexOf(t.params.slideClass))).join(" ")}emitSlidesClasses(){const e=this;if(!e.params._emitClasses||!e.el)return;const t=[];e.slides.each((s=>{const a=e.getSlideClasses(s);t.push({slideEl:s,classNames:a}),e.emit("_slideClass",s,a)})),e.emit("_slideClasses",t)}slidesPerViewDynamic(e,t){void 0===e&&(e="current"),void 0===t&&(t=!1);const{params:s,slides:a,slidesGrid:i,slidesSizesGrid:r,size:n,activeIndex:l}=this;let o=1;if(s.centeredSlides){let e,t=a[l].swiperSlideSize;for(let s=l+1;s<a.length;s+=1)a[s]&&!e&&(t+=a[s].swiperSlideSize,o+=1,t>n&&(e=!0));for(let s=l-1;s>=0;s-=1)a[s]&&!e&&(t+=a[s].swiperSlideSize,o+=1,t>n&&(e=!0))}else if("current"===e)for(let e=l+1;e<a.length;e+=1){(t?i[e]+r[e]-i[l]<n:i[e]-i[l]<n)&&(o+=1)}else for(let e=l-1;e>=0;e-=1){i[l]-i[e]<n&&(o+=1)}return o}update(){const e=this;if(!e||e.destroyed)return;const{snapGrid:t,params:s}=e;function a(){const t=e.rtlTranslate?-1*e.translate:e.translate,s=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(s),e.updateActiveIndex(),e.updateSlidesClasses()}let i;s.breakpoints&&e.setBreakpoint(),e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),e.params.freeMode&&e.params.freeMode.enabled?(a(),e.params.autoHeight&&e.updateAutoHeight()):(i=("auto"===e.params.slidesPerView||e.params.slidesPerView>1)&&e.isEnd&&!e.params.centeredSlides?e.slideTo(e.slides.length-1,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0),i||a()),s.watchOverflow&&t!==e.snapGrid&&e.checkOverflow(),e.emit("update")}changeDirection(e,t){void 0===t&&(t=!0);const s=this,a=s.params.direction;return e||(e="horizontal"===a?"vertical":"horizontal"),e===a||"horizontal"!==e&&"vertical"!==e||(s.$el.removeClass(`${s.params.containerModifierClass}${a}`).addClass(`${s.params.containerModifierClass}${e}`),s.emitContainerClasses(),s.params.direction=e,s.slides.each((t=>{"vertical"===e?t.style.width="":t.style.height=""})),s.emit("changeDirection"),t&&s.update()),s}changeLanguageDirection(e){const t=this;t.rtl&&"rtl"===e||!t.rtl&&"ltr"===e||(t.rtl="rtl"===e,t.rtlTranslate="horizontal"===t.params.direction&&t.rtl,t.rtl?(t.$el.addClass(`${t.params.containerModifierClass}rtl`),t.el.dir="rtl"):(t.$el.removeClass(`${t.params.containerModifierClass}rtl`),t.el.dir="ltr"),t.update())}mount(e){const t=this;if(t.mounted)return!0;const s=d(e||t.params.el);if(!(e=s[0]))return!1;e.swiper=t;const i=()=>`.${(t.params.wrapperClass||"").trim().split(" ").join(".")}`;let r=(()=>{if(e&&e.shadowRoot&&e.shadowRoot.querySelector){const t=d(e.shadowRoot.querySelector(i()));return t.children=e=>s.children(e),t}return s.children?s.children(i()):d(s).children(i())})();if(0===r.length&&t.params.createElements){const e=a().createElement("div");r=d(e),e.className=t.params.wrapperClass,s.append(e),s.children(`.${t.params.slideClass}`).each((e=>{r.append(e)}))}return Object.assign(t,{$el:s,el:e,$wrapperEl:r,wrapperEl:r[0],mounted:!0,rtl:"rtl"===e.dir.toLowerCase()||"rtl"===s.css("direction"),rtlTranslate:"horizontal"===t.params.direction&&("rtl"===e.dir.toLowerCase()||"rtl"===s.css("direction")),wrongRTL:"-webkit-box"===r.css("display")}),!0}init(e){const t=this;if(t.initialized)return t;return!1===t.mount(e)||(t.emit("beforeInit"),t.params.breakpoints&&t.setBreakpoint(),t.addClasses(),t.params.loop&&t.loopCreate(),t.updateSize(),t.updateSlides(),t.params.watchOverflow&&t.checkOverflow(),t.params.grabCursor&&t.enabled&&t.setGrabCursor(),t.params.preloadImages&&t.preloadImages(),t.params.loop?t.slideTo(t.params.initialSlide+t.loopedSlides,0,t.params.runCallbacksOnInit,!1,!0):t.slideTo(t.params.initialSlide,0,t.params.runCallbacksOnInit,!1,!0),t.attachEvents(),t.initialized=!0,t.emit("init"),t.emit("afterInit")),t}destroy(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);const s=this,{params:a,$el:i,$wrapperEl:r,slides:n}=s;return void 0===s.params||s.destroyed||(s.emit("beforeDestroy"),s.initialized=!1,s.detachEvents(),a.loop&&s.loopDestroy(),t&&(s.removeClasses(),i.removeAttr("style"),r.removeAttr("style"),n&&n.length&&n.removeClass([a.slideVisibleClass,a.slideActiveClass,a.slideNextClass,a.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index")),s.emit("destroy"),Object.keys(s.eventsListeners).forEach((e=>{s.off(e)})),!1!==e&&(s.$el[0].swiper=null,function(e){const t=e;Object.keys(t).forEach((e=>{try{t[e]=null}catch(e){}try{delete t[e]}catch(e){}}))}(s)),s.destroyed=!0),null}static extendDefaults(e){g(q,e)}static get extendedDefaults(){return q}static get defaults(){return W}static installModule(e){V.prototype.__modules__||(V.prototype.__modules__=[]);const t=V.prototype.__modules__;"function"==typeof e&&t.indexOf(e)<0&&t.push(e)}static use(e){return Array.isArray(e)?(e.forEach((e=>V.installModule(e))),V):(V.installModule(e),V)}}function F(e,t,s,i){const r=a();return e.params.createElements&&Object.keys(i).forEach((a=>{if(!s[a]&&!0===s.auto){let n=e.$el.children(`.${i[a]}`)[0];n||(n=r.createElement("div"),n.className=i[a],e.$el.append(n)),s[a]=n,t[a]=n}})),s}function U(e){return void 0===e&&(e=""),`.${e.trim().replace(/([\.:!\/])/g,"\\$1").replace(/ /g,".")}`}function K(e){const t=this,{$wrapperEl:s,params:a}=t;if(a.loop&&t.loopDestroy(),"object"==typeof e&&"length"in e)for(let t=0;t<e.length;t+=1)e[t]&&s.append(e[t]);else s.append(e);a.loop&&t.loopCreate(),a.observer||t.update()}function Z(e){const t=this,{params:s,$wrapperEl:a,activeIndex:i}=t;s.loop&&t.loopDestroy();let r=i+1;if("object"==typeof e&&"length"in e){for(let t=0;t<e.length;t+=1)e[t]&&a.prepend(e[t]);r=i+e.length}else a.prepend(e);s.loop&&t.loopCreate(),s.observer||t.update(),t.slideTo(r,0,!1)}function Q(e,t){const s=this,{$wrapperEl:a,params:i,activeIndex:r}=s;let n=r;i.loop&&(n-=s.loopedSlides,s.loopDestroy(),s.slides=a.children(`.${i.slideClass}`));const l=s.slides.length;if(e<=0)return void s.prependSlide(t);if(e>=l)return void s.appendSlide(t);let o=n>e?n+1:n;const d=[];for(let t=l-1;t>=e;t-=1){const e=s.slides.eq(t);e.remove(),d.unshift(e)}if("object"==typeof t&&"length"in t){for(let e=0;e<t.length;e+=1)t[e]&&a.append(t[e]);o=n>e?n+t.length:n}else a.append(t);for(let e=0;e<d.length;e+=1)a.append(d[e]);i.loop&&s.loopCreate(),i.observer||s.update(),i.loop?s.slideTo(o+s.loopedSlides,0,!1):s.slideTo(o,0,!1)}function J(e){const t=this,{params:s,$wrapperEl:a,activeIndex:i}=t;let r=i;s.loop&&(r-=t.loopedSlides,t.loopDestroy(),t.slides=a.children(`.${s.slideClass}`));let n,l=r;if("object"==typeof e&&"length"in e){for(let s=0;s<e.length;s+=1)n=e[s],t.slides[n]&&t.slides.eq(n).remove(),n<l&&(l-=1);l=Math.max(l,0)}else n=e,t.slides[n]&&t.slides.eq(n).remove(),n<l&&(l-=1),l=Math.max(l,0);s.loop&&t.loopCreate(),s.observer||t.update(),s.loop?t.slideTo(l+t.loopedSlides,0,!1):t.slideTo(l,0,!1)}function ee(){const e=this,t=[];for(let s=0;s<e.slides.length;s+=1)t.push(s);e.removeSlide(t)}function te(e){const{effect:t,swiper:s,on:a,setTranslate:i,setTransition:r,overwriteParams:n,perspective:l,recreateShadows:o,getEffectParams:d}=e;let c;a("beforeInit",(()=>{if(s.params.effect!==t)return;s.classNames.push(`${s.params.containerModifierClass}${t}`),l&&l()&&s.classNames.push(`${s.params.containerModifierClass}3d`);const e=n?n():{};Object.assign(s.params,e),Object.assign(s.originalParams,e)})),a("setTranslate",(()=>{s.params.effect===t&&i()})),a("setTransition",((e,a)=>{s.params.effect===t&&r(a)})),a("transitionEnd",(()=>{if(s.params.effect===t&&o){if(!d||!d().slideShadows)return;s.slides.each((e=>{s.$(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").remove()})),o()}})),a("virtualUpdate",(()=>{s.params.effect===t&&(s.slides.length||(c=!0),requestAnimationFrame((()=>{c&&s.slides&&s.slides.length&&(i(),c=!1)})))}))}function se(e,t){return e.transformEl?t.find(e.transformEl).css({"backface-visibility":"hidden","-webkit-backface-visibility":"hidden"}):t}function ae(e){let{swiper:t,duration:s,transformEl:a,allSlides:i}=e;const{slides:r,activeIndex:n,$wrapperEl:l}=t;if(t.params.virtualTranslate&&0!==s){let e,s=!1;e=i?a?r.find(a):r:a?r.eq(n).find(a):r.eq(n),e.transitionEnd((()=>{if(s)return;if(!t||t.destroyed)return;s=!0,t.animating=!1;const e=["webkitTransitionEnd","transitionend"];for(let t=0;t<e.length;t+=1)l.trigger(e[t])}))}}function ie(e,t,s){const a="swiper-slide-shadow"+(s?`-${s}`:""),i=e.transformEl?t.find(e.transformEl):t;let r=i.children(`.${a}`);return r.length||(r=d(`<div class="swiper-slide-shadow${s?`-${s}`:""}"></div>`),i.append(r)),r}Object.keys(_).forEach((e=>{Object.keys(_[e]).forEach((t=>{V.prototype[t]=_[e][t]}))})),V.use([function(e){let{swiper:t,on:s,emit:a}=e;const i=r();let n=null,l=null;const o=()=>{t&&!t.destroyed&&t.initialized&&(a("beforeResize"),a("resize"))},d=()=>{t&&!t.destroyed&&t.initialized&&a("orientationchange")};s("init",(()=>{t.params.resizeObserver&&void 0!==i.ResizeObserver?t&&!t.destroyed&&t.initialized&&(n=new ResizeObserver((e=>{l=i.requestAnimationFrame((()=>{const{width:s,height:a}=t;let i=s,r=a;e.forEach((e=>{let{contentBoxSize:s,contentRect:a,target:n}=e;n&&n!==t.el||(i=a?a.width:(s[0]||s).inlineSize,r=a?a.height:(s[0]||s).blockSize)})),i===s&&r===a||o()}))})),n.observe(t.el)):(i.addEventListener("resize",o),i.addEventListener("orientationchange",d))})),s("destroy",(()=>{l&&i.cancelAnimationFrame(l),n&&n.unobserve&&t.el&&(n.unobserve(t.el),n=null),i.removeEventListener("resize",o),i.removeEventListener("orientationchange",d)}))},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=[],l=r(),o=function(e,t){void 0===t&&(t={});const s=new(l.MutationObserver||l.WebkitMutationObserver)((e=>{if(1===e.length)return void i("observerUpdate",e[0]);const t=function(){i("observerUpdate",e[0])};l.requestAnimationFrame?l.requestAnimationFrame(t):l.setTimeout(t,0)}));s.observe(e,{attributes:void 0===t.attributes||t.attributes,childList:void 0===t.childList||t.childList,characterData:void 0===t.characterData||t.characterData}),n.push(s)};s({observer:!1,observeParents:!1,observeSlideChildren:!1}),a("init",(()=>{if(t.params.observer){if(t.params.observeParents){const e=t.$el.parents();for(let t=0;t<e.length;t+=1)o(e[t])}o(t.$el[0],{childList:t.params.observeSlideChildren}),o(t.$wrapperEl[0],{attributes:!1})}})),a("destroy",(()=>{n.forEach((e=>{e.disconnect()})),n.splice(0,n.length)}))}]);const re=[function(e){let t,{swiper:s,extendParams:a,on:i,emit:r}=e;function n(e,t){const a=s.params.virtual;if(a.cache&&s.virtual.cache[t])return s.virtual.cache[t];const i=a.renderSlide?d(a.renderSlide.call(s,e,t)):d(`<div class="${s.params.slideClass}" data-swiper-slide-index="${t}">${e}</div>`);return i.attr("data-swiper-slide-index")||i.attr("data-swiper-slide-index",t),a.cache&&(s.virtual.cache[t]=i),i}function l(e){const{slidesPerView:t,slidesPerGroup:a,centeredSlides:i}=s.params,{addSlidesBefore:l,addSlidesAfter:o}=s.params.virtual,{from:d,to:c,slides:p,slidesGrid:u,offset:h}=s.virtual;s.params.cssMode||s.updateActiveIndex();const m=s.activeIndex||0;let f,g,v;f=s.rtlTranslate?"right":s.isHorizontal()?"left":"top",i?(g=Math.floor(t/2)+a+o,v=Math.floor(t/2)+a+l):(g=t+(a-1)+o,v=a+l);const w=Math.max((m||0)-v,0),b=Math.min((m||0)+g,p.length-1),x=(s.slidesGrid[w]||0)-(s.slidesGrid[0]||0);function y(){s.updateSlides(),s.updateProgress(),s.updateSlidesClasses(),s.lazy&&s.params.lazy.enabled&&s.lazy.load(),r("virtualUpdate")}if(Object.assign(s.virtual,{from:w,to:b,offset:x,slidesGrid:s.slidesGrid}),d===w&&c===b&&!e)return s.slidesGrid!==u&&x!==h&&s.slides.css(f,`${x}px`),s.updateProgress(),void r("virtualUpdate");if(s.params.virtual.renderExternal)return s.params.virtual.renderExternal.call(s,{offset:x,from:w,to:b,slides:function(){const e=[];for(let t=w;t<=b;t+=1)e.push(p[t]);return e}()}),void(s.params.virtual.renderExternalUpdate?y():r("virtualUpdate"));const E=[],C=[];if(e)s.$wrapperEl.find(`.${s.params.slideClass}`).remove();else for(let e=d;e<=c;e+=1)(e<w||e>b)&&s.$wrapperEl.find(`.${s.params.slideClass}[data-swiper-slide-index="${e}"]`).remove();for(let t=0;t<p.length;t+=1)t>=w&&t<=b&&(void 0===c||e?C.push(t):(t>c&&C.push(t),t<d&&E.push(t)));C.forEach((e=>{s.$wrapperEl.append(n(p[e],e))})),E.sort(((e,t)=>t-e)).forEach((e=>{s.$wrapperEl.prepend(n(p[e],e))})),s.$wrapperEl.children(".swiper-slide").css(f,`${x}px`),y()}a({virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null,renderExternalUpdate:!0,addSlidesBefore:0,addSlidesAfter:0}}),s.virtual={cache:{},from:void 0,to:void 0,slides:[],offset:0,slidesGrid:[]},i("beforeInit",(()=>{s.params.virtual.enabled&&(s.virtual.slides=s.params.virtual.slides,s.classNames.push(`${s.params.containerModifierClass}virtual`),s.params.watchSlidesProgress=!0,s.originalParams.watchSlidesProgress=!0,s.params.initialSlide||l())})),i("setTranslate",(()=>{s.params.virtual.enabled&&(s.params.cssMode&&!s._immediateVirtual?(clearTimeout(t),t=setTimeout((()=>{l()}),100)):l())})),i("init update resize",(()=>{s.params.virtual.enabled&&s.params.cssMode&&v(s.wrapperEl,"--swiper-virtual-size",`${s.virtualSize}px`)})),Object.assign(s.virtual,{appendSlide:function(e){if("object"==typeof e&&"length"in e)for(let t=0;t<e.length;t+=1)e[t]&&s.virtual.slides.push(e[t]);else s.virtual.slides.push(e);l(!0)},prependSlide:function(e){const t=s.activeIndex;let a=t+1,i=1;if(Array.isArray(e)){for(let t=0;t<e.length;t+=1)e[t]&&s.virtual.slides.unshift(e[t]);a=t+e.length,i=e.length}else s.virtual.slides.unshift(e);if(s.params.virtual.cache){const e=s.virtual.cache,t={};Object.keys(e).forEach((s=>{const a=e[s],r=a.attr("data-swiper-slide-index");r&&a.attr("data-swiper-slide-index",parseInt(r,10)+i),t[parseInt(s,10)+i]=a})),s.virtual.cache=t}l(!0),s.slideTo(a,0)},removeSlide:function(e){if(null==e)return;let t=s.activeIndex;if(Array.isArray(e))for(let a=e.length-1;a>=0;a-=1)s.virtual.slides.splice(e[a],1),s.params.virtual.cache&&delete s.virtual.cache[e[a]],e[a]<t&&(t-=1),t=Math.max(t,0);else s.virtual.slides.splice(e,1),s.params.virtual.cache&&delete s.virtual.cache[e],e<t&&(t-=1),t=Math.max(t,0);l(!0),s.slideTo(t,0)},removeAllSlides:function(){s.virtual.slides=[],s.params.virtual.cache&&(s.virtual.cache={}),l(!0),s.slideTo(0,0)},update:l})},function(e){let{swiper:t,extendParams:s,on:i,emit:n}=e;const l=a(),o=r();function c(e){if(!t.enabled)return;const{rtlTranslate:s}=t;let a=e;a.originalEvent&&(a=a.originalEvent);const i=a.keyCode||a.charCode,r=t.params.keyboard.pageUpDown,d=r&&33===i,c=r&&34===i,p=37===i,u=39===i,h=38===i,m=40===i;if(!t.allowSlideNext&&(t.isHorizontal()&&u||t.isVertical()&&m||c))return!1;if(!t.allowSlidePrev&&(t.isHorizontal()&&p||t.isVertical()&&h||d))return!1;if(!(a.shiftKey||a.altKey||a.ctrlKey||a.metaKey||l.activeElement&&l.activeElement.nodeName&&("input"===l.activeElement.nodeName.toLowerCase()||"textarea"===l.activeElement.nodeName.toLowerCase()))){if(t.params.keyboard.onlyInViewport&&(d||c||p||u||h||m)){let e=!1;if(t.$el.parents(`.${t.params.slideClass}`).length>0&&0===t.$el.parents(`.${t.params.slideActiveClass}`).length)return;const a=t.$el,i=a[0].clientWidth,r=a[0].clientHeight,n=o.innerWidth,l=o.innerHeight,d=t.$el.offset();s&&(d.left-=t.$el[0].scrollLeft);const c=[[d.left,d.top],[d.left+i,d.top],[d.left,d.top+r],[d.left+i,d.top+r]];for(let t=0;t<c.length;t+=1){const s=c[t];if(s[0]>=0&&s[0]<=n&&s[1]>=0&&s[1]<=l){if(0===s[0]&&0===s[1])continue;e=!0}}if(!e)return}t.isHorizontal()?((d||c||p||u)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),((c||u)&&!s||(d||p)&&s)&&t.slideNext(),((d||p)&&!s||(c||u)&&s)&&t.slidePrev()):((d||c||h||m)&&(a.preventDefault?a.preventDefault():a.returnValue=!1),(c||m)&&t.slideNext(),(d||h)&&t.slidePrev()),n("keyPress",i)}}function p(){t.keyboard.enabled||(d(l).on("keydown",c),t.keyboard.enabled=!0)}function u(){t.keyboard.enabled&&(d(l).off("keydown",c),t.keyboard.enabled=!1)}t.keyboard={enabled:!1},s({keyboard:{enabled:!1,onlyInViewport:!0,pageUpDown:!0}}),i("init",(()=>{t.params.keyboard.enabled&&p()})),i("destroy",(()=>{t.keyboard.enabled&&u()})),Object.assign(t.keyboard,{enable:p,disable:u})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=r();let l;s({mousewheel:{enabled:!1,releaseOnEdges:!1,invert:!1,forceToAxis:!1,sensitivity:1,eventsTarget:"container",thresholdDelta:null,thresholdTime:null}}),t.mousewheel={enabled:!1};let o,c=u();const h=[];function m(){t.enabled&&(t.mouseEntered=!0)}function f(){t.enabled&&(t.mouseEntered=!1)}function g(e){return!(t.params.mousewheel.thresholdDelta&&e.delta<t.params.mousewheel.thresholdDelta)&&(!(t.params.mousewheel.thresholdTime&&u()-c<t.params.mousewheel.thresholdTime)&&(e.delta>=6&&u()-c<60||(e.direction<0?t.isEnd&&!t.params.loop||t.animating||(t.slideNext(),i("scroll",e.raw)):t.isBeginning&&!t.params.loop||t.animating||(t.slidePrev(),i("scroll",e.raw)),c=(new n.Date).getTime(),!1)))}function v(e){let s=e,a=!0;if(!t.enabled)return;const r=t.params.mousewheel;t.params.cssMode&&s.preventDefault();let n=t.$el;if("container"!==t.params.mousewheel.eventsTarget&&(n=d(t.params.mousewheel.eventsTarget)),!t.mouseEntered&&!n[0].contains(s.target)&&!r.releaseOnEdges)return!0;s.originalEvent&&(s=s.originalEvent);let c=0;const m=t.rtlTranslate?-1:1,f=function(e){let t=0,s=0,a=0,i=0;return"detail"in e&&(s=e.detail),"wheelDelta"in e&&(s=-e.wheelDelta/120),"wheelDeltaY"in e&&(s=-e.wheelDeltaY/120),"wheelDeltaX"in e&&(t=-e.wheelDeltaX/120),"axis"in e&&e.axis===e.HORIZONTAL_AXIS&&(t=s,s=0),a=10*t,i=10*s,"deltaY"in e&&(i=e.deltaY),"deltaX"in e&&(a=e.deltaX),e.shiftKey&&!a&&(a=i,i=0),(a||i)&&e.deltaMode&&(1===e.deltaMode?(a*=40,i*=40):(a*=800,i*=800)),a&&!t&&(t=a<1?-1:1),i&&!s&&(s=i<1?-1:1),{spinX:t,spinY:s,pixelX:a,pixelY:i}}(s);if(r.forceToAxis)if(t.isHorizontal()){if(!(Math.abs(f.pixelX)>Math.abs(f.pixelY)))return!0;c=-f.pixelX*m}else{if(!(Math.abs(f.pixelY)>Math.abs(f.pixelX)))return!0;c=-f.pixelY}else c=Math.abs(f.pixelX)>Math.abs(f.pixelY)?-f.pixelX*m:-f.pixelY;if(0===c)return!0;r.invert&&(c=-c);let v=t.getTranslate()+c*r.sensitivity;if(v>=t.minTranslate()&&(v=t.minTranslate()),v<=t.maxTranslate()&&(v=t.maxTranslate()),a=!!t.params.loop||!(v===t.minTranslate()||v===t.maxTranslate()),a&&t.params.nested&&s.stopPropagation(),t.params.freeMode&&t.params.freeMode.enabled){const e={time:u(),delta:Math.abs(c),direction:Math.sign(c)},a=o&&e.time<o.time+500&&e.delta<=o.delta&&e.direction===o.direction;if(!a){o=void 0,t.params.loop&&t.loopFix();let n=t.getTranslate()+c*r.sensitivity;const d=t.isBeginning,u=t.isEnd;if(n>=t.minTranslate()&&(n=t.minTranslate()),n<=t.maxTranslate()&&(n=t.maxTranslate()),t.setTransition(0),t.setTranslate(n),t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses(),(!d&&t.isBeginning||!u&&t.isEnd)&&t.updateSlidesClasses(),t.params.freeMode.sticky){clearTimeout(l),l=void 0,h.length>=15&&h.shift();const s=h.length?h[h.length-1]:void 0,a=h[0];if(h.push(e),s&&(e.delta>s.delta||e.direction!==s.direction))h.splice(0);else if(h.length>=15&&e.time-a.time<500&&a.delta-e.delta>=1&&e.delta<=6){const s=c>0?.8:.2;o=e,h.splice(0),l=p((()=>{t.slideToClosest(t.params.speed,!0,void 0,s)}),0)}l||(l=p((()=>{o=e,h.splice(0),t.slideToClosest(t.params.speed,!0,void 0,.5)}),500))}if(a||i("scroll",s),t.params.autoplay&&t.params.autoplayDisableOnInteraction&&t.autoplay.stop(),n===t.minTranslate()||n===t.maxTranslate())return!0}}else{const s={time:u(),delta:Math.abs(c),direction:Math.sign(c),raw:e};h.length>=2&&h.shift();const a=h.length?h[h.length-1]:void 0;if(h.push(s),a?(s.direction!==a.direction||s.delta>a.delta||s.time>a.time+150)&&g(s):g(s),function(e){const s=t.params.mousewheel;if(e.direction<0){if(t.isEnd&&!t.params.loop&&s.releaseOnEdges)return!0}else if(t.isBeginning&&!t.params.loop&&s.releaseOnEdges)return!0;return!1}(s))return!0}return s.preventDefault?s.preventDefault():s.returnValue=!1,!1}function w(e){let s=t.$el;"container"!==t.params.mousewheel.eventsTarget&&(s=d(t.params.mousewheel.eventsTarget)),s[e]("mouseenter",m),s[e]("mouseleave",f),s[e]("wheel",v)}function b(){return t.params.cssMode?(t.wrapperEl.removeEventListener("wheel",v),!0):!t.mousewheel.enabled&&(w("on"),t.mousewheel.enabled=!0,!0)}function x(){return t.params.cssMode?(t.wrapperEl.addEventListener(event,v),!0):!!t.mousewheel.enabled&&(w("off"),t.mousewheel.enabled=!1,!0)}a("init",(()=>{!t.params.mousewheel.enabled&&t.params.cssMode&&x(),t.params.mousewheel.enabled&&b()})),a("destroy",(()=>{t.params.cssMode&&b(),t.mousewheel.enabled&&x()})),Object.assign(t.mousewheel,{enable:b,disable:x})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;function r(e){let s;return e&&(s=d(e),t.params.uniqueNavElements&&"string"==typeof e&&s.length>1&&1===t.$el.find(e).length&&(s=t.$el.find(e))),s}function n(e,s){const a=t.params.navigation;e&&e.length>0&&(e[s?"addClass":"removeClass"](a.disabledClass),e[0]&&"BUTTON"===e[0].tagName&&(e[0].disabled=s),t.params.watchOverflow&&t.enabled&&e[t.isLocked?"addClass":"removeClass"](a.lockClass))}function l(){if(t.params.loop)return;const{$nextEl:e,$prevEl:s}=t.navigation;n(s,t.isBeginning&&!t.params.rewind),n(e,t.isEnd&&!t.params.rewind)}function o(e){e.preventDefault(),(!t.isBeginning||t.params.loop||t.params.rewind)&&(t.slidePrev(),i("navigationPrev"))}function c(e){e.preventDefault(),(!t.isEnd||t.params.loop||t.params.rewind)&&(t.slideNext(),i("navigationNext"))}function p(){const e=t.params.navigation;if(t.params.navigation=F(t,t.originalParams.navigation,t.params.navigation,{nextEl:"swiper-button-next",prevEl:"swiper-button-prev"}),!e.nextEl&&!e.prevEl)return;const s=r(e.nextEl),a=r(e.prevEl);s&&s.length>0&&s.on("click",c),a&&a.length>0&&a.on("click",o),Object.assign(t.navigation,{$nextEl:s,nextEl:s&&s[0],$prevEl:a,prevEl:a&&a[0]}),t.enabled||(s&&s.addClass(e.lockClass),a&&a.addClass(e.lockClass))}function u(){const{$nextEl:e,$prevEl:s}=t.navigation;e&&e.length&&(e.off("click",c),e.removeClass(t.params.navigation.disabledClass)),s&&s.length&&(s.off("click",o),s.removeClass(t.params.navigation.disabledClass))}s({navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock",navigationDisabledClass:"swiper-navigation-disabled"}}),t.navigation={nextEl:null,$nextEl:null,prevEl:null,$prevEl:null},a("init",(()=>{!1===t.params.navigation.enabled?h():(p(),l())})),a("toEdge fromEdge lock unlock",(()=>{l()})),a("destroy",(()=>{u()})),a("enable disable",(()=>{const{$nextEl:e,$prevEl:s}=t.navigation;e&&e[t.enabled?"removeClass":"addClass"](t.params.navigation.lockClass),s&&s[t.enabled?"removeClass":"addClass"](t.params.navigation.lockClass)})),a("click",((e,s)=>{const{$nextEl:a,$prevEl:r}=t.navigation,n=s.target;if(t.params.navigation.hideOnClick&&!d(n).is(r)&&!d(n).is(a)){if(t.pagination&&t.params.pagination&&t.params.pagination.clickable&&(t.pagination.el===n||t.pagination.el.contains(n)))return;let e;a?e=a.hasClass(t.params.navigation.hiddenClass):r&&(e=r.hasClass(t.params.navigation.hiddenClass)),i(!0===e?"navigationShow":"navigationHide"),a&&a.toggleClass(t.params.navigation.hiddenClass),r&&r.toggleClass(t.params.navigation.hiddenClass)}}));const h=()=>{t.$el.addClass(t.params.navigation.navigationDisabledClass),u()};Object.assign(t.navigation,{enable:()=>{t.$el.removeClass(t.params.navigation.navigationDisabledClass),p(),l()},disable:h,update:l,init:p,destroy:u})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const r="swiper-pagination";let n;s({pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,progressbarOpposite:!1,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,formatFractionCurrent:e=>e,formatFractionTotal:e=>e,bulletClass:`${r}-bullet`,bulletActiveClass:`${r}-bullet-active`,modifierClass:`${r}-`,currentClass:`${r}-current`,totalClass:`${r}-total`,hiddenClass:`${r}-hidden`,progressbarFillClass:`${r}-progressbar-fill`,progressbarOppositeClass:`${r}-progressbar-opposite`,clickableClass:`${r}-clickable`,lockClass:`${r}-lock`,horizontalClass:`${r}-horizontal`,verticalClass:`${r}-vertical`,paginationDisabledClass:`${r}-disabled`}}),t.pagination={el:null,$el:null,bullets:[]};let l=0;function o(){return!t.params.pagination.el||!t.pagination.el||!t.pagination.$el||0===t.pagination.$el.length}function c(e,s){const{bulletActiveClass:a}=t.params.pagination;e[s]().addClass(`${a}-${s}`)[s]().addClass(`${a}-${s}-${s}`)}function p(){const e=t.rtl,s=t.params.pagination;if(o())return;const a=t.virtual&&t.params.virtual.enabled?t.virtual.slides.length:t.slides.length,r=t.pagination.$el;let p;const u=t.params.loop?Math.ceil((a-2*t.loopedSlides)/t.params.slidesPerGroup):t.snapGrid.length;if(t.params.loop?(p=Math.ceil((t.activeIndex-t.loopedSlides)/t.params.slidesPerGroup),p>a-1-2*t.loopedSlides&&(p-=a-2*t.loopedSlides),p>u-1&&(p-=u),p<0&&"bullets"!==t.params.paginationType&&(p=u+p)):p=void 0!==t.snapIndex?t.snapIndex:t.activeIndex||0,"bullets"===s.type&&t.pagination.bullets&&t.pagination.bullets.length>0){const a=t.pagination.bullets;let i,o,u;if(s.dynamicBullets&&(n=a.eq(0)[t.isHorizontal()?"outerWidth":"outerHeight"](!0),r.css(t.isHorizontal()?"width":"height",n*(s.dynamicMainBullets+4)+"px"),s.dynamicMainBullets>1&&void 0!==t.previousIndex&&(l+=p-(t.previousIndex-t.loopedSlides||0),l>s.dynamicMainBullets-1?l=s.dynamicMainBullets-1:l<0&&(l=0)),i=Math.max(p-l,0),o=i+(Math.min(a.length,s.dynamicMainBullets)-1),u=(o+i)/2),a.removeClass(["","-next","-next-next","-prev","-prev-prev","-main"].map((e=>`${s.bulletActiveClass}${e}`)).join(" ")),r.length>1)a.each((e=>{const t=d(e),a=t.index();a===p&&t.addClass(s.bulletActiveClass),s.dynamicBullets&&(a>=i&&a<=o&&t.addClass(`${s.bulletActiveClass}-main`),a===i&&c(t,"prev"),a===o&&c(t,"next"))}));else{const e=a.eq(p),r=e.index();if(e.addClass(s.bulletActiveClass),s.dynamicBullets){const e=a.eq(i),n=a.eq(o);for(let e=i;e<=o;e+=1)a.eq(e).addClass(`${s.bulletActiveClass}-main`);if(t.params.loop)if(r>=a.length){for(let e=s.dynamicMainBullets;e>=0;e-=1)a.eq(a.length-e).addClass(`${s.bulletActiveClass}-main`);a.eq(a.length-s.dynamicMainBullets-1).addClass(`${s.bulletActiveClass}-prev`)}else c(e,"prev"),c(n,"next");else c(e,"prev"),c(n,"next")}}if(s.dynamicBullets){const i=Math.min(a.length,s.dynamicMainBullets+4),r=(n*i-n)/2-u*n,l=e?"right":"left";a.css(t.isHorizontal()?l:"top",`${r}px`)}}if("fraction"===s.type&&(r.find(U(s.currentClass)).text(s.formatFractionCurrent(p+1)),r.find(U(s.totalClass)).text(s.formatFractionTotal(u))),"progressbar"===s.type){let e;e=s.progressbarOpposite?t.isHorizontal()?"vertical":"horizontal":t.isHorizontal()?"horizontal":"vertical";const a=(p+1)/u;let i=1,n=1;"horizontal"===e?i=a:n=a,r.find(U(s.progressbarFillClass)).transform(`translate3d(0,0,0) scaleX(${i}) scaleY(${n})`).transition(t.params.speed)}"custom"===s.type&&s.renderCustom?(r.html(s.renderCustom(t,p+1,u)),i("paginationRender",r[0])):i("paginationUpdate",r[0]),t.params.watchOverflow&&t.enabled&&r[t.isLocked?"addClass":"removeClass"](s.lockClass)}function u(){const e=t.params.pagination;if(o())return;const s=t.virtual&&t.params.virtual.enabled?t.virtual.slides.length:t.slides.length,a=t.pagination.$el;let r="";if("bullets"===e.type){let i=t.params.loop?Math.ceil((s-2*t.loopedSlides)/t.params.slidesPerGroup):t.snapGrid.length;t.params.freeMode&&t.params.freeMode.enabled&&!t.params.loop&&i>s&&(i=s);for(let s=0;s<i;s+=1)e.renderBullet?r+=e.renderBullet.call(t,s,e.bulletClass):r+=`<${e.bulletElement} class="${e.bulletClass}"></${e.bulletElement}>`;a.html(r),t.pagination.bullets=a.find(U(e.bulletClass))}"fraction"===e.type&&(r=e.renderFraction?e.renderFraction.call(t,e.currentClass,e.totalClass):`<span class="${e.currentClass}"></span> / <span class="${e.totalClass}"></span>`,a.html(r)),"progressbar"===e.type&&(r=e.renderProgressbar?e.renderProgressbar.call(t,e.progressbarFillClass):`<span class="${e.progressbarFillClass}"></span>`,a.html(r)),"custom"!==e.type&&i("paginationRender",t.pagination.$el[0])}function h(){t.params.pagination=F(t,t.originalParams.pagination,t.params.pagination,{el:"swiper-pagination"});const e=t.params.pagination;if(!e.el)return;let s=d(e.el);0!==s.length&&(t.params.uniqueNavElements&&"string"==typeof e.el&&s.length>1&&(s=t.$el.find(e.el),s.length>1&&(s=s.filter((e=>d(e).parents(".swiper")[0]===t.el)))),"bullets"===e.type&&e.clickable&&s.addClass(e.clickableClass),s.addClass(e.modifierClass+e.type),s.addClass(t.isHorizontal()?e.horizontalClass:e.verticalClass),"bullets"===e.type&&e.dynamicBullets&&(s.addClass(`${e.modifierClass}${e.type}-dynamic`),l=0,e.dynamicMainBullets<1&&(e.dynamicMainBullets=1)),"progressbar"===e.type&&e.progressbarOpposite&&s.addClass(e.progressbarOppositeClass),e.clickable&&s.on("click",U(e.bulletClass),(function(e){e.preventDefault();let s=d(this).index()*t.params.slidesPerGroup;t.params.loop&&(s+=t.loopedSlides),t.slideTo(s)})),Object.assign(t.pagination,{$el:s,el:s[0]}),t.enabled||s.addClass(e.lockClass))}function m(){const e=t.params.pagination;if(o())return;const s=t.pagination.$el;s.removeClass(e.hiddenClass),s.removeClass(e.modifierClass+e.type),s.removeClass(t.isHorizontal()?e.horizontalClass:e.verticalClass),t.pagination.bullets&&t.pagination.bullets.removeClass&&t.pagination.bullets.removeClass(e.bulletActiveClass),e.clickable&&s.off("click",U(e.bulletClass))}a("init",(()=>{!1===t.params.pagination.enabled?f():(h(),u(),p())})),a("activeIndexChange",(()=>{(t.params.loop||void 0===t.snapIndex)&&p()})),a("snapIndexChange",(()=>{t.params.loop||p()})),a("slidesLengthChange",(()=>{t.params.loop&&(u(),p())})),a("snapGridLengthChange",(()=>{t.params.loop||(u(),p())})),a("destroy",(()=>{m()})),a("enable disable",(()=>{const{$el:e}=t.pagination;e&&e[t.enabled?"removeClass":"addClass"](t.params.pagination.lockClass)})),a("lock unlock",(()=>{p()})),a("click",((e,s)=>{const a=s.target,{$el:r}=t.pagination;if(t.params.pagination.el&&t.params.pagination.hideOnClick&&r&&r.length>0&&!d(a).hasClass(t.params.pagination.bulletClass)){if(t.navigation&&(t.navigation.nextEl&&a===t.navigation.nextEl||t.navigation.prevEl&&a===t.navigation.prevEl))return;const e=r.hasClass(t.params.pagination.hiddenClass);i(!0===e?"paginationShow":"paginationHide"),r.toggleClass(t.params.pagination.hiddenClass)}}));const f=()=>{t.$el.addClass(t.params.pagination.paginationDisabledClass),t.pagination.$el&&t.pagination.$el.addClass(t.params.pagination.paginationDisabledClass),m()};Object.assign(t.pagination,{enable:()=>{t.$el.removeClass(t.params.pagination.paginationDisabledClass),t.pagination.$el&&t.pagination.$el.removeClass(t.params.pagination.paginationDisabledClass),h(),u(),p()},disable:f,render:u,update:p,init:h,destroy:m})},function(e){let{swiper:t,extendParams:s,on:i,emit:r}=e;const n=a();let l,o,c,u,h=!1,m=null,f=null;function g(){if(!t.params.scrollbar.el||!t.scrollbar.el)return;const{scrollbar:e,rtlTranslate:s,progress:a}=t,{$dragEl:i,$el:r}=e,n=t.params.scrollbar;let l=o,d=(c-o)*a;s?(d=-d,d>0?(l=o-d,d=0):-d+o>c&&(l=c+d)):d<0?(l=o+d,d=0):d+o>c&&(l=c-d),t.isHorizontal()?(i.transform(`translate3d(${d}px, 0, 0)`),i[0].style.width=`${l}px`):(i.transform(`translate3d(0px, ${d}px, 0)`),i[0].style.height=`${l}px`),n.hide&&(clearTimeout(m),r[0].style.opacity=1,m=setTimeout((()=>{r[0].style.opacity=0,r.transition(400)}),1e3))}function v(){if(!t.params.scrollbar.el||!t.scrollbar.el)return;const{scrollbar:e}=t,{$dragEl:s,$el:a}=e;s[0].style.width="",s[0].style.height="",c=t.isHorizontal()?a[0].offsetWidth:a[0].offsetHeight,u=t.size/(t.virtualSize+t.params.slidesOffsetBefore-(t.params.centeredSlides?t.snapGrid[0]:0)),o="auto"===t.params.scrollbar.dragSize?c*u:parseInt(t.params.scrollbar.dragSize,10),t.isHorizontal()?s[0].style.width=`${o}px`:s[0].style.height=`${o}px`,a[0].style.display=u>=1?"none":"",t.params.scrollbar.hide&&(a[0].style.opacity=0),t.params.watchOverflow&&t.enabled&&e.$el[t.isLocked?"addClass":"removeClass"](t.params.scrollbar.lockClass)}function w(e){return t.isHorizontal()?"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].clientX:e.clientX:"touchstart"===e.type||"touchmove"===e.type?e.targetTouches[0].clientY:e.clientY}function b(e){const{scrollbar:s,rtlTranslate:a}=t,{$el:i}=s;let r;r=(w(e)-i.offset()[t.isHorizontal()?"left":"top"]-(null!==l?l:o/2))/(c-o),r=Math.max(Math.min(r,1),0),a&&(r=1-r);const n=t.minTranslate()+(t.maxTranslate()-t.minTranslate())*r;t.updateProgress(n),t.setTranslate(n),t.updateActiveIndex(),t.updateSlidesClasses()}function x(e){const s=t.params.scrollbar,{scrollbar:a,$wrapperEl:i}=t,{$el:n,$dragEl:o}=a;h=!0,l=e.target===o[0]||e.target===o?w(e)-e.target.getBoundingClientRect()[t.isHorizontal()?"left":"top"]:null,e.preventDefault(),e.stopPropagation(),i.transition(100),o.transition(100),b(e),clearTimeout(f),n.transition(0),s.hide&&n.css("opacity",1),t.params.cssMode&&t.$wrapperEl.css("scroll-snap-type","none"),r("scrollbarDragStart",e)}function y(e){const{scrollbar:s,$wrapperEl:a}=t,{$el:i,$dragEl:n}=s;h&&(e.preventDefault?e.preventDefault():e.returnValue=!1,b(e),a.transition(0),i.transition(0),n.transition(0),r("scrollbarDragMove",e))}function E(e){const s=t.params.scrollbar,{scrollbar:a,$wrapperEl:i}=t,{$el:n}=a;h&&(h=!1,t.params.cssMode&&(t.$wrapperEl.css("scroll-snap-type",""),i.transition("")),s.hide&&(clearTimeout(f),f=p((()=>{n.css("opacity",0),n.transition(400)}),1e3)),r("scrollbarDragEnd",e),s.snapOnRelease&&t.slideToClosest())}function C(e){const{scrollbar:s,touchEventsTouch:a,touchEventsDesktop:i,params:r,support:l}=t,o=s.$el;if(!o)return;const d=o[0],c=!(!l.passiveListener||!r.passiveListeners)&&{passive:!1,capture:!1},p=!(!l.passiveListener||!r.passiveListeners)&&{passive:!0,capture:!1};if(!d)return;const u="on"===e?"addEventListener":"removeEventListener";l.touch?(d[u](a.start,x,c),d[u](a.move,y,c),d[u](a.end,E,p)):(d[u](i.start,x,c),n[u](i.move,y,c),n[u](i.end,E,p))}function T(){const{scrollbar:e,$el:s}=t;t.params.scrollbar=F(t,t.originalParams.scrollbar,t.params.scrollbar,{el:"swiper-scrollbar"});const a=t.params.scrollbar;if(!a.el)return;let i=d(a.el);t.params.uniqueNavElements&&"string"==typeof a.el&&i.length>1&&1===s.find(a.el).length&&(i=s.find(a.el)),i.addClass(t.isHorizontal()?a.horizontalClass:a.verticalClass);let r=i.find(`.${t.params.scrollbar.dragClass}`);0===r.length&&(r=d(`<div class="${t.params.scrollbar.dragClass}"></div>`),i.append(r)),Object.assign(e,{$el:i,el:i[0],$dragEl:r,dragEl:r[0]}),a.draggable&&t.params.scrollbar.el&&t.scrollbar.el&&C("on"),i&&i[t.enabled?"removeClass":"addClass"](t.params.scrollbar.lockClass)}function $(){const e=t.params.scrollbar,s=t.scrollbar.$el;s&&s.removeClass(t.isHorizontal()?e.horizontalClass:e.verticalClass),t.params.scrollbar.el&&t.scrollbar.el&&C("off")}s({scrollbar:{el:null,dragSize:"auto",hide:!1,draggable:!1,snapOnRelease:!0,lockClass:"swiper-scrollbar-lock",dragClass:"swiper-scrollbar-drag",scrollbarDisabledClass:"swiper-scrollbar-disabled",horizontalClass:"swiper-scrollbar-horizontal",verticalClass:"swiper-scrollbar-vertical"}}),t.scrollbar={el:null,dragEl:null,$el:null,$dragEl:null},i("init",(()=>{!1===t.params.scrollbar.enabled?S():(T(),v(),g())})),i("update resize observerUpdate lock unlock",(()=>{v()})),i("setTranslate",(()=>{g()})),i("setTransition",((e,s)=>{!function(e){t.params.scrollbar.el&&t.scrollbar.el&&t.scrollbar.$dragEl.transition(e)}(s)})),i("enable disable",(()=>{const{$el:e}=t.scrollbar;e&&e[t.enabled?"removeClass":"addClass"](t.params.scrollbar.lockClass)})),i("destroy",(()=>{$()}));const S=()=>{t.$el.addClass(t.params.scrollbar.scrollbarDisabledClass),t.scrollbar.$el&&t.scrollbar.$el.addClass(t.params.scrollbar.scrollbarDisabledClass),$()};Object.assign(t.scrollbar,{enable:()=>{t.$el.removeClass(t.params.scrollbar.scrollbarDisabledClass),t.scrollbar.$el&&t.scrollbar.$el.removeClass(t.params.scrollbar.scrollbarDisabledClass),T(),v(),g()},disable:S,updateSize:v,setTranslate:g,init:T,destroy:$})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({parallax:{enabled:!1}});const i=(e,s)=>{const{rtl:a}=t,i=d(e),r=a?-1:1,n=i.attr("data-swiper-parallax")||"0";let l=i.attr("data-swiper-parallax-x"),o=i.attr("data-swiper-parallax-y");const c=i.attr("data-swiper-parallax-scale"),p=i.attr("data-swiper-parallax-opacity");if(l||o?(l=l||"0",o=o||"0"):t.isHorizontal()?(l=n,o="0"):(o=n,l="0"),l=l.indexOf("%")>=0?parseInt(l,10)*s*r+"%":l*s*r+"px",o=o.indexOf("%")>=0?parseInt(o,10)*s+"%":o*s+"px",null!=p){const e=p-(p-1)*(1-Math.abs(s));i[0].style.opacity=e}if(null==c)i.transform(`translate3d(${l}, ${o}, 0px)`);else{const e=c-(c-1)*(1-Math.abs(s));i.transform(`translate3d(${l}, ${o}, 0px) scale(${e})`)}},r=()=>{const{$el:e,slides:s,progress:a,snapGrid:r}=t;e.children("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((e=>{i(e,a)})),s.each(((e,s)=>{let n=e.progress;t.params.slidesPerGroup>1&&"auto"!==t.params.slidesPerView&&(n+=Math.ceil(s/2)-a*(r.length-1)),n=Math.min(Math.max(n,-1),1),d(e).find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((e=>{i(e,n)}))}))};a("beforeInit",(()=>{t.params.parallax.enabled&&(t.params.watchSlidesProgress=!0,t.originalParams.watchSlidesProgress=!0)})),a("init",(()=>{t.params.parallax.enabled&&r()})),a("setTranslate",(()=>{t.params.parallax.enabled&&r()})),a("setTransition",((e,s)=>{t.params.parallax.enabled&&function(e){void 0===e&&(e=t.params.speed);const{$el:s}=t;s.find("[data-swiper-parallax], [data-swiper-parallax-x], [data-swiper-parallax-y], [data-swiper-parallax-opacity], [data-swiper-parallax-scale]").each((t=>{const s=d(t);let a=parseInt(s.attr("data-swiper-parallax-duration"),10)||e;0===e&&(a=0),s.transition(a)}))}(s)}))},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;const n=r();s({zoom:{enabled:!1,maxRatio:3,minRatio:1,toggle:!0,containerClass:"swiper-zoom-container",zoomedSlideClass:"swiper-slide-zoomed"}}),t.zoom={enabled:!1};let l,o,c,p=1,u=!1;const m={$slideEl:void 0,slideWidth:void 0,slideHeight:void 0,$imageEl:void 0,$imageWrapEl:void 0,maxRatio:3},f={isTouched:void 0,isMoved:void 0,currentX:void 0,currentY:void 0,minX:void 0,minY:void 0,maxX:void 0,maxY:void 0,width:void 0,height:void 0,startX:void 0,startY:void 0,touchesStart:{},touchesCurrent:{}},g={x:void 0,y:void 0,prevPositionX:void 0,prevPositionY:void 0,prevTime:void 0};let v=1;function w(e){if(e.targetTouches.length<2)return 1;const t=e.targetTouches[0].pageX,s=e.targetTouches[0].pageY,a=e.targetTouches[1].pageX,i=e.targetTouches[1].pageY;return Math.sqrt((a-t)**2+(i-s)**2)}function b(e){const s=t.support,a=t.params.zoom;if(o=!1,c=!1,!s.gestures){if("touchstart"!==e.type||"touchstart"===e.type&&e.targetTouches.length<2)return;o=!0,m.scaleStart=w(e)}m.$slideEl&&m.$slideEl.length||(m.$slideEl=d(e.target).closest(`.${t.params.slideClass}`),0===m.$slideEl.length&&(m.$slideEl=t.slides.eq(t.activeIndex)),m.$imageEl=m.$slideEl.find(`.${a.containerClass}`).eq(0).find("picture, img, svg, canvas, .swiper-zoom-target").eq(0),m.$imageWrapEl=m.$imageEl.parent(`.${a.containerClass}`),m.maxRatio=m.$imageWrapEl.attr("data-swiper-zoom")||a.maxRatio,0!==m.$imageWrapEl.length)?(m.$imageEl&&m.$imageEl.transition(0),u=!0):m.$imageEl=void 0}function x(e){const s=t.support,a=t.params.zoom,i=t.zoom;if(!s.gestures){if("touchmove"!==e.type||"touchmove"===e.type&&e.targetTouches.length<2)return;c=!0,m.scaleMove=w(e)}m.$imageEl&&0!==m.$imageEl.length?(s.gestures?i.scale=e.scale*p:i.scale=m.scaleMove/m.scaleStart*p,i.scale>m.maxRatio&&(i.scale=m.maxRatio-1+(i.scale-m.maxRatio+1)**.5),i.scale<a.minRatio&&(i.scale=a.minRatio+1-(a.minRatio-i.scale+1)**.5),m.$imageEl.transform(`translate3d(0,0,0) scale(${i.scale})`)):"gesturechange"===e.type&&b(e)}function y(e){const s=t.device,a=t.support,i=t.params.zoom,r=t.zoom;if(!a.gestures){if(!o||!c)return;if("touchend"!==e.type||"touchend"===e.type&&e.changedTouches.length<2&&!s.android)return;o=!1,c=!1}m.$imageEl&&0!==m.$imageEl.length&&(r.scale=Math.max(Math.min(r.scale,m.maxRatio),i.minRatio),m.$imageEl.transition(t.params.speed).transform(`translate3d(0,0,0) scale(${r.scale})`),p=r.scale,u=!1,1===r.scale&&(m.$slideEl=void 0))}function E(e){const s=t.zoom;if(!m.$imageEl||0===m.$imageEl.length)return;if(t.allowClick=!1,!f.isTouched||!m.$slideEl)return;f.isMoved||(f.width=m.$imageEl[0].offsetWidth,f.height=m.$imageEl[0].offsetHeight,f.startX=h(m.$imageWrapEl[0],"x")||0,f.startY=h(m.$imageWrapEl[0],"y")||0,m.slideWidth=m.$slideEl[0].offsetWidth,m.slideHeight=m.$slideEl[0].offsetHeight,m.$imageWrapEl.transition(0));const a=f.width*s.scale,i=f.height*s.scale;if(!(a<m.slideWidth&&i<m.slideHeight)){if(f.minX=Math.min(m.slideWidth/2-a/2,0),f.maxX=-f.minX,f.minY=Math.min(m.slideHeight/2-i/2,0),f.maxY=-f.minY,f.touchesCurrent.x="touchmove"===e.type?e.targetTouches[0].pageX:e.pageX,f.touchesCurrent.y="touchmove"===e.type?e.targetTouches[0].pageY:e.pageY,!f.isMoved&&!u){if(t.isHorizontal()&&(Math.floor(f.minX)===Math.floor(f.startX)&&f.touchesCurrent.x<f.touchesStart.x||Math.floor(f.maxX)===Math.floor(f.startX)&&f.touchesCurrent.x>f.touchesStart.x))return void(f.isTouched=!1);if(!t.isHorizontal()&&(Math.floor(f.minY)===Math.floor(f.startY)&&f.touchesCurrent.y<f.touchesStart.y||Math.floor(f.maxY)===Math.floor(f.startY)&&f.touchesCurrent.y>f.touchesStart.y))return void(f.isTouched=!1)}e.cancelable&&e.preventDefault(),e.stopPropagation(),f.isMoved=!0,f.currentX=f.touchesCurrent.x-f.touchesStart.x+f.startX,f.currentY=f.touchesCurrent.y-f.touchesStart.y+f.startY,f.currentX<f.minX&&(f.currentX=f.minX+1-(f.minX-f.currentX+1)**.8),f.currentX>f.maxX&&(f.currentX=f.maxX-1+(f.currentX-f.maxX+1)**.8),f.currentY<f.minY&&(f.currentY=f.minY+1-(f.minY-f.currentY+1)**.8),f.currentY>f.maxY&&(f.currentY=f.maxY-1+(f.currentY-f.maxY+1)**.8),g.prevPositionX||(g.prevPositionX=f.touchesCurrent.x),g.prevPositionY||(g.prevPositionY=f.touchesCurrent.y),g.prevTime||(g.prevTime=Date.now()),g.x=(f.touchesCurrent.x-g.prevPositionX)/(Date.now()-g.prevTime)/2,g.y=(f.touchesCurrent.y-g.prevPositionY)/(Date.now()-g.prevTime)/2,Math.abs(f.touchesCurrent.x-g.prevPositionX)<2&&(g.x=0),Math.abs(f.touchesCurrent.y-g.prevPositionY)<2&&(g.y=0),g.prevPositionX=f.touchesCurrent.x,g.prevPositionY=f.touchesCurrent.y,g.prevTime=Date.now(),m.$imageWrapEl.transform(`translate3d(${f.currentX}px, ${f.currentY}px,0)`)}}function C(){const e=t.zoom;m.$slideEl&&t.previousIndex!==t.activeIndex&&(m.$imageEl&&m.$imageEl.transform("translate3d(0,0,0) scale(1)"),m.$imageWrapEl&&m.$imageWrapEl.transform("translate3d(0,0,0)"),e.scale=1,p=1,m.$slideEl=void 0,m.$imageEl=void 0,m.$imageWrapEl=void 0)}function T(e){const s=t.zoom,a=t.params.zoom;if(m.$slideEl||(e&&e.target&&(m.$slideEl=d(e.target).closest(`.${t.params.slideClass}`)),m.$slideEl||(t.params.virtual&&t.params.virtual.enabled&&t.virtual?m.$slideEl=t.$wrapperEl.children(`.${t.params.slideActiveClass}`):m.$slideEl=t.slides.eq(t.activeIndex)),m.$imageEl=m.$slideEl.find(`.${a.containerClass}`).eq(0).find("picture, img, svg, canvas, .swiper-zoom-target").eq(0),m.$imageWrapEl=m.$imageEl.parent(`.${a.containerClass}`)),!m.$imageEl||0===m.$imageEl.length||!m.$imageWrapEl||0===m.$imageWrapEl.length)return;let i,r,l,o,c,u,h,g,v,w,b,x,y,E,C,T,$,S;t.params.cssMode&&(t.wrapperEl.style.overflow="hidden",t.wrapperEl.style.touchAction="none"),m.$slideEl.addClass(`${a.zoomedSlideClass}`),void 0===f.touchesStart.x&&e?(i="touchend"===e.type?e.changedTouches[0].pageX:e.pageX,r="touchend"===e.type?e.changedTouches[0].pageY:e.pageY):(i=f.touchesStart.x,r=f.touchesStart.y),s.scale=m.$imageWrapEl.attr("data-swiper-zoom")||a.maxRatio,p=m.$imageWrapEl.attr("data-swiper-zoom")||a.maxRatio,e?($=m.$slideEl[0].offsetWidth,S=m.$slideEl[0].offsetHeight,l=m.$slideEl.offset().left+n.scrollX,o=m.$slideEl.offset().top+n.scrollY,c=l+$/2-i,u=o+S/2-r,v=m.$imageEl[0].offsetWidth,w=m.$imageEl[0].offsetHeight,b=v*s.scale,x=w*s.scale,y=Math.min($/2-b/2,0),E=Math.min(S/2-x/2,0),C=-y,T=-E,h=c*s.scale,g=u*s.scale,h<y&&(h=y),h>C&&(h=C),g<E&&(g=E),g>T&&(g=T)):(h=0,g=0),m.$imageWrapEl.transition(300).transform(`translate3d(${h}px, ${g}px,0)`),m.$imageEl.transition(300).transform(`translate3d(0,0,0) scale(${s.scale})`)}function $(){const e=t.zoom,s=t.params.zoom;m.$slideEl||(t.params.virtual&&t.params.virtual.enabled&&t.virtual?m.$slideEl=t.$wrapperEl.children(`.${t.params.slideActiveClass}`):m.$slideEl=t.slides.eq(t.activeIndex),m.$imageEl=m.$slideEl.find(`.${s.containerClass}`).eq(0).find("picture, img, svg, canvas, .swiper-zoom-target").eq(0),m.$imageWrapEl=m.$imageEl.parent(`.${s.containerClass}`)),m.$imageEl&&0!==m.$imageEl.length&&m.$imageWrapEl&&0!==m.$imageWrapEl.length&&(t.params.cssMode&&(t.wrapperEl.style.overflow="",t.wrapperEl.style.touchAction=""),e.scale=1,p=1,m.$imageWrapEl.transition(300).transform("translate3d(0,0,0)"),m.$imageEl.transition(300).transform("translate3d(0,0,0) scale(1)"),m.$slideEl.removeClass(`${s.zoomedSlideClass}`),m.$slideEl=void 0)}function S(e){const s=t.zoom;s.scale&&1!==s.scale?$():T(e)}function M(){const e=t.support;return{passiveListener:!("touchstart"!==t.touchEvents.start||!e.passiveListener||!t.params.passiveListeners)&&{passive:!0,capture:!1},activeListenerWithCapture:!e.passiveListener||{passive:!1,capture:!0}}}function P(){return`.${t.params.slideClass}`}function k(e){const{passiveListener:s}=M(),a=P();t.$wrapperEl[e]("gesturestart",a,b,s),t.$wrapperEl[e]("gesturechange",a,x,s),t.$wrapperEl[e]("gestureend",a,y,s)}function z(){l||(l=!0,k("on"))}function L(){l&&(l=!1,k("off"))}function O(){const e=t.zoom;if(e.enabled)return;e.enabled=!0;const s=t.support,{passiveListener:a,activeListenerWithCapture:i}=M(),r=P();s.gestures?(t.$wrapperEl.on(t.touchEvents.start,z,a),t.$wrapperEl.on(t.touchEvents.end,L,a)):"touchstart"===t.touchEvents.start&&(t.$wrapperEl.on(t.touchEvents.start,r,b,a),t.$wrapperEl.on(t.touchEvents.move,r,x,i),t.$wrapperEl.on(t.touchEvents.end,r,y,a),t.touchEvents.cancel&&t.$wrapperEl.on(t.touchEvents.cancel,r,y,a)),t.$wrapperEl.on(t.touchEvents.move,`.${t.params.zoom.containerClass}`,E,i)}function I(){const e=t.zoom;if(!e.enabled)return;const s=t.support;e.enabled=!1;const{passiveListener:a,activeListenerWithCapture:i}=M(),r=P();s.gestures?(t.$wrapperEl.off(t.touchEvents.start,z,a),t.$wrapperEl.off(t.touchEvents.end,L,a)):"touchstart"===t.touchEvents.start&&(t.$wrapperEl.off(t.touchEvents.start,r,b,a),t.$wrapperEl.off(t.touchEvents.move,r,x,i),t.$wrapperEl.off(t.touchEvents.end,r,y,a),t.touchEvents.cancel&&t.$wrapperEl.off(t.touchEvents.cancel,r,y,a)),t.$wrapperEl.off(t.touchEvents.move,`.${t.params.zoom.containerClass}`,E,i)}Object.defineProperty(t.zoom,"scale",{get:()=>v,set(e){if(v!==e){const t=m.$imageEl?m.$imageEl[0]:void 0,s=m.$slideEl?m.$slideEl[0]:void 0;i("zoomChange",e,t,s)}v=e}}),a("init",(()=>{t.params.zoom.enabled&&O()})),a("destroy",(()=>{I()})),a("touchStart",((e,s)=>{t.zoom.enabled&&function(e){const s=t.device;m.$imageEl&&0!==m.$imageEl.length&&(f.isTouched||(s.android&&e.cancelable&&e.preventDefault(),f.isTouched=!0,f.touchesStart.x="touchstart"===e.type?e.targetTouches[0].pageX:e.pageX,f.touchesStart.y="touchstart"===e.type?e.targetTouches[0].pageY:e.pageY))}(s)})),a("touchEnd",((e,s)=>{t.zoom.enabled&&function(){const e=t.zoom;if(!m.$imageEl||0===m.$imageEl.length)return;if(!f.isTouched||!f.isMoved)return f.isTouched=!1,void(f.isMoved=!1);f.isTouched=!1,f.isMoved=!1;let s=300,a=300;const i=g.x*s,r=f.currentX+i,n=g.y*a,l=f.currentY+n;0!==g.x&&(s=Math.abs((r-f.currentX)/g.x)),0!==g.y&&(a=Math.abs((l-f.currentY)/g.y));const o=Math.max(s,a);f.currentX=r,f.currentY=l;const d=f.width*e.scale,c=f.height*e.scale;f.minX=Math.min(m.slideWidth/2-d/2,0),f.maxX=-f.minX,f.minY=Math.min(m.slideHeight/2-c/2,0),f.maxY=-f.minY,f.currentX=Math.max(Math.min(f.currentX,f.maxX),f.minX),f.currentY=Math.max(Math.min(f.currentY,f.maxY),f.minY),m.$imageWrapEl.transition(o).transform(`translate3d(${f.currentX}px, ${f.currentY}px,0)`)}()})),a("doubleTap",((e,s)=>{!t.animating&&t.params.zoom.enabled&&t.zoom.enabled&&t.params.zoom.toggle&&S(s)})),a("transitionEnd",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&C()})),a("slideChange",(()=>{t.zoom.enabled&&t.params.zoom.enabled&&t.params.cssMode&&C()})),Object.assign(t.zoom,{enable:O,disable:I,in:T,out:$,toggle:S})},function(e){let{swiper:t,extendParams:s,on:a,emit:i}=e;s({lazy:{checkInView:!1,enabled:!1,loadPrevNext:!1,loadPrevNextAmount:1,loadOnTransitionStart:!1,scrollingElement:"",elementClass:"swiper-lazy",loadingClass:"swiper-lazy-loading",loadedClass:"swiper-lazy-loaded",preloaderClass:"swiper-lazy-preloader"}}),t.lazy={};let n=!1,l=!1;function o(e,s){void 0===s&&(s=!0);const a=t.params.lazy;if(void 0===e)return;if(0===t.slides.length)return;const r=t.virtual&&t.params.virtual.enabled?t.$wrapperEl.children(`.${t.params.slideClass}[data-swiper-slide-index="${e}"]`):t.slides.eq(e),n=r.find(`.${a.elementClass}:not(.${a.loadedClass}):not(.${a.loadingClass})`);!r.hasClass(a.elementClass)||r.hasClass(a.loadedClass)||r.hasClass(a.loadingClass)||n.push(r[0]),0!==n.length&&n.each((e=>{const n=d(e);n.addClass(a.loadingClass);const l=n.attr("data-background"),c=n.attr("data-src"),p=n.attr("data-srcset"),u=n.attr("data-sizes"),h=n.parent("picture");t.loadImage(n[0],c||l,p,u,!1,(()=>{if(null!=t&&t&&(!t||t.params)&&!t.destroyed){if(l?(n.css("background-image",`url("${l}")`),n.removeAttr("data-background")):(p&&(n.attr("srcset",p),n.removeAttr("data-srcset")),u&&(n.attr("sizes",u),n.removeAttr("data-sizes")),h.length&&h.children("source").each((e=>{const t=d(e);t.attr("data-srcset")&&(t.attr("srcset",t.attr("data-srcset")),t.removeAttr("data-srcset"))})),c&&(n.attr("src",c),n.removeAttr("data-src"))),n.addClass(a.loadedClass).removeClass(a.loadingClass),r.find(`.${a.preloaderClass}`).remove(),t.params.loop&&s){const e=r.attr("data-swiper-slide-index");if(r.hasClass(t.params.slideDuplicateClass)){o(t.$wrapperEl.children(`[data-swiper-slide-index="${e}"]:not(.${t.params.slideDuplicateClass})`).index(),!1)}else{o(t.$wrapperEl.children(`.${t.params.slideDuplicateClass}[data-swiper-slide-index="${e}"]`).index(),!1)}}i("lazyImageReady",r[0],n[0]),t.params.autoHeight&&t.updateAutoHeight()}})),i("lazyImageLoad",r[0],n[0])}))}function c(){const{$wrapperEl:e,params:s,slides:a,activeIndex:i}=t,r=t.virtual&&s.virtual.enabled,n=s.lazy;let c=s.slidesPerView;function p(t){if(r){if(e.children(`.${s.slideClass}[data-swiper-slide-index="${t}"]`).length)return!0}else if(a[t])return!0;return!1}function u(e){return r?d(e).attr("data-swiper-slide-index"):d(e).index()}if("auto"===c&&(c=0),l||(l=!0),t.params.watchSlidesProgress)e.children(`.${s.slideVisibleClass}`).each((e=>{o(r?d(e).attr("data-swiper-slide-index"):d(e).index())}));else if(c>1)for(let e=i;e<i+c;e+=1)p(e)&&o(e);else o(i);if(n.loadPrevNext)if(c>1||n.loadPrevNextAmount&&n.loadPrevNextAmount>1){const e=n.loadPrevNextAmount,t=Math.ceil(c),s=Math.min(i+t+Math.max(e,t),a.length),r=Math.max(i-Math.max(t,e),0);for(let e=i+t;e<s;e+=1)p(e)&&o(e);for(let e=r;e<i;e+=1)p(e)&&o(e)}else{const t=e.children(`.${s.slideNextClass}`);t.length>0&&o(u(t));const a=e.children(`.${s.slidePrevClass}`);a.length>0&&o(u(a))}}function p(){const e=r();if(!t||t.destroyed)return;const s=t.params.lazy.scrollingElement?d(t.params.lazy.scrollingElement):d(e),a=s[0]===e,i=a?e.innerWidth:s[0].offsetWidth,l=a?e.innerHeight:s[0].offsetHeight,o=t.$el.offset(),{rtlTranslate:u}=t;let h=!1;u&&(o.left-=t.$el[0].scrollLeft);const m=[[o.left,o.top],[o.left+t.width,o.top],[o.left,o.top+t.height],[o.left+t.width,o.top+t.height]];for(let e=0;e<m.length;e+=1){const t=m[e];if(t[0]>=0&&t[0]<=i&&t[1]>=0&&t[1]<=l){if(0===t[0]&&0===t[1])continue;h=!0}}const f=!("touchstart"!==t.touchEvents.start||!t.support.passiveListener||!t.params.passiveListeners)&&{passive:!0,capture:!1};h?(c(),s.off("scroll",p,f)):n||(n=!0,s.on("scroll",p,f))}a("beforeInit",(()=>{t.params.lazy.enabled&&t.params.preloadImages&&(t.params.preloadImages=!1)})),a("init",(()=>{t.params.lazy.enabled&&(t.params.lazy.checkInView?p():c())})),a("scroll",(()=>{t.params.freeMode&&t.params.freeMode.enabled&&!t.params.freeMode.sticky&&c()})),a("scrollbarDragMove resize _freeModeNoMomentumRelease",(()=>{t.params.lazy.enabled&&(t.params.lazy.checkInView?p():c())})),a("transitionStart",(()=>{t.params.lazy.enabled&&(t.params.lazy.loadOnTransitionStart||!t.params.lazy.loadOnTransitionStart&&!l)&&(t.params.lazy.checkInView?p():c())})),a("transitionEnd",(()=>{t.params.lazy.enabled&&!t.params.lazy.loadOnTransitionStart&&(t.params.lazy.checkInView?p():c())})),a("slideChange",(()=>{const{lazy:e,cssMode:s,watchSlidesProgress:a,touchReleaseOnEdges:i,resistanceRatio:r}=t.params;e.enabled&&(s||a&&(i||0===r))&&c()})),a("destroy",(()=>{t.$el&&t.$el.find(`.${t.params.lazy.loadingClass}`).removeClass(t.params.lazy.loadingClass)})),Object.assign(t.lazy,{load:c,loadInSlide:o})},function(e){let{swiper:t,extendParams:s,on:a}=e;function i(e,t){const s=function(){let e,t,s;return(a,i)=>{for(t=-1,e=a.length;e-t>1;)s=e+t>>1,a[s]<=i?t=s:e=s;return e}}();let a,i;return this.x=e,this.y=t,this.lastIndex=e.length-1,this.interpolate=function(e){return e?(i=s(this.x,e),a=i-1,(e-this.x[a])*(this.y[i]-this.y[a])/(this.x[i]-this.x[a])+this.y[a]):0},this}function r(){t.controller.control&&t.controller.spline&&(t.controller.spline=void 0,delete t.controller.spline)}s({controller:{control:void 0,inverse:!1,by:"slide"}}),t.controller={control:void 0},a("beforeInit",(()=>{t.controller.control=t.params.controller.control})),a("update",(()=>{r()})),a("resize",(()=>{r()})),a("observerUpdate",(()=>{r()})),a("setTranslate",((e,s,a)=>{t.controller.control&&t.controller.setTranslate(s,a)})),a("setTransition",((e,s,a)=>{t.controller.control&&t.controller.setTransition(s,a)})),Object.assign(t.controller,{setTranslate:function(e,s){const a=t.controller.control;let r,n;const l=t.constructor;function o(e){const s=t.rtlTranslate?-t.translate:t.translate;"slide"===t.params.controller.by&&(!function(e){t.controller.spline||(t.controller.spline=t.params.loop?new i(t.slidesGrid,e.slidesGrid):new i(t.snapGrid,e.snapGrid))}(e),n=-t.controller.spline.interpolate(-s)),n&&"container"!==t.params.controller.by||(r=(e.maxTranslate()-e.minTranslate())/(t.maxTranslate()-t.minTranslate()),n=(s-t.minTranslate())*r+e.minTranslate()),t.params.controller.inverse&&(n=e.maxTranslate()-n),e.updateProgress(n),e.setTranslate(n,t),e.updateActiveIndex(),e.updateSlidesClasses()}if(Array.isArray(a))for(let e=0;e<a.length;e+=1)a[e]!==s&&a[e]instanceof l&&o(a[e]);else a instanceof l&&s!==a&&o(a)},setTransition:function(e,s){const a=t.constructor,i=t.controller.control;let r;function n(s){s.setTransition(e,t),0!==e&&(s.transitionStart(),s.params.autoHeight&&p((()=>{s.updateAutoHeight()})),s.$wrapperEl.transitionEnd((()=>{i&&(s.params.loop&&"slide"===t.params.controller.by&&s.loopFix(),s.transitionEnd())})))}if(Array.isArray(i))for(r=0;r<i.length;r+=1)i[r]!==s&&i[r]instanceof a&&n(i[r]);else i instanceof a&&s!==i&&n(i)}})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({a11y:{enabled:!0,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}",slideLabelMessage:"{{index}} / {{slidesLength}}",containerMessage:null,containerRoleDescriptionMessage:null,itemRoleDescriptionMessage:null,slideRole:"group",id:null}});let i=null;function r(e){const t=i;0!==t.length&&(t.html(""),t.html(e))}function n(e){e.attr("tabIndex","0")}function l(e){e.attr("tabIndex","-1")}function o(e,t){e.attr("role",t)}function c(e,t){e.attr("aria-roledescription",t)}function p(e,t){e.attr("aria-label",t)}function u(e){e.attr("aria-disabled",!0)}function h(e){e.attr("aria-disabled",!1)}function m(e){if(13!==e.keyCode&&32!==e.keyCode)return;const s=t.params.a11y,a=d(e.target);t.navigation&&t.navigation.$nextEl&&a.is(t.navigation.$nextEl)&&(t.isEnd&&!t.params.loop||t.slideNext(),t.isEnd?r(s.lastSlideMessage):r(s.nextSlideMessage)),t.navigation&&t.navigation.$prevEl&&a.is(t.navigation.$prevEl)&&(t.isBeginning&&!t.params.loop||t.slidePrev(),t.isBeginning?r(s.firstSlideMessage):r(s.prevSlideMessage)),t.pagination&&a.is(U(t.params.pagination.bulletClass))&&a[0].click()}function f(){return t.pagination&&t.pagination.bullets&&t.pagination.bullets.length}function g(){return f()&&t.params.pagination.clickable}const v=(e,t,s)=>{n(e),"BUTTON"!==e[0].tagName&&(o(e,"button"),e.on("keydown",m)),p(e,s),function(e,t){e.attr("aria-controls",t)}(e,t)},w=e=>{const s=e.target.closest(`.${t.params.slideClass}`);if(!s||!t.slides.includes(s))return;const a=t.slides.indexOf(s)===t.activeIndex,i=t.params.watchSlidesProgress&&t.visibleSlides&&t.visibleSlides.includes(s);a||i||t.slideTo(t.slides.indexOf(s),0)},b=()=>{const e=t.params.a11y;e.itemRoleDescriptionMessage&&c(d(t.slides),e.itemRoleDescriptionMessage),e.slideRole&&o(d(t.slides),e.slideRole);const s=t.params.loop?t.slides.filter((e=>!e.classList.contains(t.params.slideDuplicateClass))).length:t.slides.length;e.slideLabelMessage&&t.slides.each(((a,i)=>{const r=d(a),n=t.params.loop?parseInt(r.attr("data-swiper-slide-index"),10):i;p(r,e.slideLabelMessage.replace(/\{\{index\}\}/,n+1).replace(/\{\{slidesLength\}\}/,s))}))},x=()=>{const e=t.params.a11y;t.$el.append(i);const s=t.$el;e.containerRoleDescriptionMessage&&c(s,e.containerRoleDescriptionMessage),e.containerMessage&&p(s,e.containerMessage);const a=t.$wrapperEl,r=e.id||a.attr("id")||`swiper-wrapper-${n=16,void 0===n&&(n=16),"x".repeat(n).replace(/x/g,(()=>Math.round(16*Math.random()).toString(16)))}`;var n;const l=t.params.autoplay&&t.params.autoplay.enabled?"off":"polite";var o;let d,u;o=r,a.attr("id",o),function(e,t){e.attr("aria-live",t)}(a,l),b(),t.navigation&&t.navigation.$nextEl&&(d=t.navigation.$nextEl),t.navigation&&t.navigation.$prevEl&&(u=t.navigation.$prevEl),d&&d.length&&v(d,r,e.nextSlideMessage),u&&u.length&&v(u,r,e.prevSlideMessage),g()&&t.pagination.$el.on("keydown",U(t.params.pagination.bulletClass),m),t.$el.on("focus",w,!0)};a("beforeInit",(()=>{i=d(`<span class="${t.params.a11y.notificationClass}" aria-live="assertive" aria-atomic="true"></span>`)})),a("afterInit",(()=>{t.params.a11y.enabled&&x()})),a("slidesLengthChange snapGridLengthChange slidesGridLengthChange",(()=>{t.params.a11y.enabled&&b()})),a("fromEdge toEdge afterInit lock unlock",(()=>{t.params.a11y.enabled&&function(){if(t.params.loop||t.params.rewind||!t.navigation)return;const{$nextEl:e,$prevEl:s}=t.navigation;s&&s.length>0&&(t.isBeginning?(u(s),l(s)):(h(s),n(s))),e&&e.length>0&&(t.isEnd?(u(e),l(e)):(h(e),n(e)))}()})),a("paginationUpdate",(()=>{t.params.a11y.enabled&&function(){const e=t.params.a11y;f()&&t.pagination.bullets.each((s=>{const a=d(s);t.params.pagination.clickable&&(n(a),t.params.pagination.renderBullet||(o(a,"button"),p(a,e.paginationBulletMessage.replace(/\{\{index\}\}/,a.index()+1)))),a.is(`.${t.params.pagination.bulletActiveClass}`)?a.attr("aria-current","true"):a.removeAttr("aria-current")}))}()})),a("destroy",(()=>{t.params.a11y.enabled&&function(){let e,s;i&&i.length>0&&i.remove(),t.navigation&&t.navigation.$nextEl&&(e=t.navigation.$nextEl),t.navigation&&t.navigation.$prevEl&&(s=t.navigation.$prevEl),e&&e.off("keydown",m),s&&s.off("keydown",m),g()&&t.pagination.$el.off("keydown",U(t.params.pagination.bulletClass),m),t.$el.off("focus",w,!0)}()}))},function(e){let{swiper:t,extendParams:s,on:a}=e;s({history:{enabled:!1,root:"",replaceState:!1,key:"slides",keepQuery:!1}});let i=!1,n={};const l=e=>e.toString().replace(/\s+/g,"-").replace(/[^\w-]+/g,"").replace(/--+/g,"-").replace(/^-+/,"").replace(/-+$/,""),o=e=>{const t=r();let s;s=e?new URL(e):t.location;const a=s.pathname.slice(1).split("/").filter((e=>""!==e)),i=a.length;return{key:a[i-2],value:a[i-1]}},d=(e,s)=>{const a=r();if(!i||!t.params.history.enabled)return;let n;n=t.params.url?new URL(t.params.url):a.location;const o=t.slides.eq(s);let d=l(o.attr("data-history"));if(t.params.history.root.length>0){let s=t.params.history.root;"/"===s[s.length-1]&&(s=s.slice(0,s.length-1)),d=`${s}/${e}/${d}`}else n.pathname.includes(e)||(d=`${e}/${d}`);t.params.history.keepQuery&&(d+=n.search);const c=a.history.state;c&&c.value===d||(t.params.history.replaceState?a.history.replaceState({value:d},null,d):a.history.pushState({value:d},null,d))},c=(e,s,a)=>{if(s)for(let i=0,r=t.slides.length;i<r;i+=1){const r=t.slides.eq(i);if(l(r.attr("data-history"))===s&&!r.hasClass(t.params.slideDuplicateClass)){const s=r.index();t.slideTo(s,e,a)}}else t.slideTo(0,e,a)},p=()=>{n=o(t.params.url),c(t.params.speed,n.value,!1)};a("init",(()=>{t.params.history.enabled&&(()=>{const e=r();if(t.params.history){if(!e.history||!e.history.pushState)return t.params.history.enabled=!1,void(t.params.hashNavigation.enabled=!0);i=!0,n=o(t.params.url),(n.key||n.value)&&(c(0,n.value,t.params.runCallbacksOnInit),t.params.history.replaceState||e.addEventListener("popstate",p))}})()})),a("destroy",(()=>{t.params.history.enabled&&(()=>{const e=r();t.params.history.replaceState||e.removeEventListener("popstate",p)})()})),a("transitionEnd _freeModeNoMomentumRelease",(()=>{i&&d(t.params.history.key,t.activeIndex)})),a("slideChange",(()=>{i&&t.params.cssMode&&d(t.params.history.key,t.activeIndex)}))},function(e){let{swiper:t,extendParams:s,emit:i,on:n}=e,l=!1;const o=a(),c=r();s({hashNavigation:{enabled:!1,replaceState:!1,watchState:!1}});const p=()=>{i("hashChange");const e=o.location.hash.replace("#","");if(e!==t.slides.eq(t.activeIndex).attr("data-hash")){const s=t.$wrapperEl.children(`.${t.params.slideClass}[data-hash="${e}"]`).index();if(void 0===s)return;t.slideTo(s)}},u=()=>{if(l&&t.params.hashNavigation.enabled)if(t.params.hashNavigation.replaceState&&c.history&&c.history.replaceState)c.history.replaceState(null,null,`#${t.slides.eq(t.activeIndex).attr("data-hash")}`||""),i("hashSet");else{const e=t.slides.eq(t.activeIndex),s=e.attr("data-hash")||e.attr("data-history");o.location.hash=s||"",i("hashSet")}};n("init",(()=>{t.params.hashNavigation.enabled&&(()=>{if(!t.params.hashNavigation.enabled||t.params.history&&t.params.history.enabled)return;l=!0;const e=o.location.hash.replace("#","");if(e){const s=0;for(let a=0,i=t.slides.length;a<i;a+=1){const i=t.slides.eq(a);if((i.attr("data-hash")||i.attr("data-history"))===e&&!i.hasClass(t.params.slideDuplicateClass)){const e=i.index();t.slideTo(e,s,t.params.runCallbacksOnInit,!0)}}}t.params.hashNavigation.watchState&&d(c).on("hashchange",p)})()})),n("destroy",(()=>{t.params.hashNavigation.enabled&&t.params.hashNavigation.watchState&&d(c).off("hashchange",p)})),n("transitionEnd _freeModeNoMomentumRelease",(()=>{l&&u()})),n("slideChange",(()=>{l&&t.params.cssMode&&u()}))},function(e){let t,{swiper:s,extendParams:i,on:r,emit:n}=e;function l(){const e=s.slides.eq(s.activeIndex);let a=s.params.autoplay.delay;e.attr("data-swiper-autoplay")&&(a=e.attr("data-swiper-autoplay")||s.params.autoplay.delay),clearTimeout(t),t=p((()=>{let e;s.params.autoplay.reverseDirection?s.params.loop?(s.loopFix(),e=s.slidePrev(s.params.speed,!0,!0),n("autoplay")):s.isBeginning?s.params.autoplay.stopOnLastSlide?d():(e=s.slideTo(s.slides.length-1,s.params.speed,!0,!0),n("autoplay")):(e=s.slidePrev(s.params.speed,!0,!0),n("autoplay")):s.params.loop?(s.loopFix(),e=s.slideNext(s.params.speed,!0,!0),n("autoplay")):s.isEnd?s.params.autoplay.stopOnLastSlide?d():(e=s.slideTo(0,s.params.speed,!0,!0),n("autoplay")):(e=s.slideNext(s.params.speed,!0,!0),n("autoplay")),(s.params.cssMode&&s.autoplay.running||!1===e)&&l()}),a)}function o(){return void 0===t&&(!s.autoplay.running&&(s.autoplay.running=!0,n("autoplayStart"),l(),!0))}function d(){return!!s.autoplay.running&&(void 0!==t&&(t&&(clearTimeout(t),t=void 0),s.autoplay.running=!1,n("autoplayStop"),!0))}function c(e){s.autoplay.running&&(s.autoplay.paused||(t&&clearTimeout(t),s.autoplay.paused=!0,0!==e&&s.params.autoplay.waitForTransition?["transitionend","webkitTransitionEnd"].forEach((e=>{s.$wrapperEl[0].addEventListener(e,h)})):(s.autoplay.paused=!1,l())))}function u(){const e=a();"hidden"===e.visibilityState&&s.autoplay.running&&c(),"visible"===e.visibilityState&&s.autoplay.paused&&(l(),s.autoplay.paused=!1)}function h(e){s&&!s.destroyed&&s.$wrapperEl&&e.target===s.$wrapperEl[0]&&(["transitionend","webkitTransitionEnd"].forEach((e=>{s.$wrapperEl[0].removeEventListener(e,h)})),s.autoplay.paused=!1,s.autoplay.running?l():d())}function m(){s.params.autoplay.disableOnInteraction?d():(n("autoplayPause"),c()),["transitionend","webkitTransitionEnd"].forEach((e=>{s.$wrapperEl[0].removeEventListener(e,h)}))}function f(){s.params.autoplay.disableOnInteraction||(s.autoplay.paused=!1,n("autoplayResume"),l())}s.autoplay={running:!1,paused:!1},i({autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDirection:!1,pauseOnMouseEnter:!1}}),r("init",(()=>{if(s.params.autoplay.enabled){o();a().addEventListener("visibilitychange",u),s.params.autoplay.pauseOnMouseEnter&&(s.$el.on("mouseenter",m),s.$el.on("mouseleave",f))}})),r("beforeTransitionStart",((e,t,a)=>{s.autoplay.running&&(a||!s.params.autoplay.disableOnInteraction?s.autoplay.pause(t):d())})),r("sliderFirstMove",(()=>{s.autoplay.running&&(s.params.autoplay.disableOnInteraction?d():c())})),r("touchEnd",(()=>{s.params.cssMode&&s.autoplay.paused&&!s.params.autoplay.disableOnInteraction&&l()})),r("destroy",(()=>{s.$el.off("mouseenter",m),s.$el.off("mouseleave",f),s.autoplay.running&&d();a().removeEventListener("visibilitychange",u)})),Object.assign(s.autoplay,{pause:c,run:l,start:o,stop:d})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({thumbs:{swiper:null,multipleActiveThumbs:!0,autoScrollOffset:0,slideThumbActiveClass:"swiper-slide-thumb-active",thumbsContainerClass:"swiper-thumbs"}});let i=!1,r=!1;function n(){const e=t.thumbs.swiper;if(!e||e.destroyed)return;const s=e.clickedIndex,a=e.clickedSlide;if(a&&d(a).hasClass(t.params.thumbs.slideThumbActiveClass))return;if(null==s)return;let i;if(i=e.params.loop?parseInt(d(e.clickedSlide).attr("data-swiper-slide-index"),10):s,t.params.loop){let e=t.activeIndex;t.slides.eq(e).hasClass(t.params.slideDuplicateClass)&&(t.loopFix(),t._clientLeft=t.$wrapperEl[0].clientLeft,e=t.activeIndex);const s=t.slides.eq(e).prevAll(`[data-swiper-slide-index="${i}"]`).eq(0).index(),a=t.slides.eq(e).nextAll(`[data-swiper-slide-index="${i}"]`).eq(0).index();i=void 0===s?a:void 0===a?s:a-e<e-s?a:s}t.slideTo(i)}function l(){const{thumbs:e}=t.params;if(i)return!1;i=!0;const s=t.constructor;if(e.swiper instanceof s)t.thumbs.swiper=e.swiper,Object.assign(t.thumbs.swiper.originalParams,{watchSlidesProgress:!0,slideToClickedSlide:!1}),Object.assign(t.thumbs.swiper.params,{watchSlidesProgress:!0,slideToClickedSlide:!1});else if(m(e.swiper)){const a=Object.assign({},e.swiper);Object.assign(a,{watchSlidesProgress:!0,slideToClickedSlide:!1}),t.thumbs.swiper=new s(a),r=!0}return t.thumbs.swiper.$el.addClass(t.params.thumbs.thumbsContainerClass),t.thumbs.swiper.on("tap",n),!0}function o(e){const s=t.thumbs.swiper;if(!s||s.destroyed)return;const a="auto"===s.params.slidesPerView?s.slidesPerViewDynamic():s.params.slidesPerView;let i=1;const r=t.params.thumbs.slideThumbActiveClass;if(t.params.slidesPerView>1&&!t.params.centeredSlides&&(i=t.params.slidesPerView),t.params.thumbs.multipleActiveThumbs||(i=1),i=Math.floor(i),s.slides.removeClass(r),s.params.loop||s.params.virtual&&s.params.virtual.enabled)for(let e=0;e<i;e+=1)s.$wrapperEl.children(`[data-swiper-slide-index="${t.realIndex+e}"]`).addClass(r);else for(let e=0;e<i;e+=1)s.slides.eq(t.realIndex+e).addClass(r);const n=t.params.thumbs.autoScrollOffset,l=n&&!s.params.loop;if(t.realIndex!==s.realIndex||l){let i,r,o=s.activeIndex;if(s.params.loop){s.slides.eq(o).hasClass(s.params.slideDuplicateClass)&&(s.loopFix(),s._clientLeft=s.$wrapperEl[0].clientLeft,o=s.activeIndex);const e=s.slides.eq(o).prevAll(`[data-swiper-slide-index="${t.realIndex}"]`).eq(0).index(),a=s.slides.eq(o).nextAll(`[data-swiper-slide-index="${t.realIndex}"]`).eq(0).index();i=void 0===e?a:void 0===a?e:a-o==o-e?s.params.slidesPerGroup>1?a:o:a-o<o-e?a:e,r=t.activeIndex>t.previousIndex?"next":"prev"}else i=t.realIndex,r=i>t.previousIndex?"next":"prev";l&&(i+="next"===r?n:-1*n),s.visibleSlidesIndexes&&s.visibleSlidesIndexes.indexOf(i)<0&&(s.params.centeredSlides?i=i>o?i-Math.floor(a/2)+1:i+Math.floor(a/2)-1:i>o&&s.params.slidesPerGroup,s.slideTo(i,e?0:void 0))}}t.thumbs={swiper:null},a("beforeInit",(()=>{const{thumbs:e}=t.params;e&&e.swiper&&(l(),o(!0))})),a("slideChange update resize observerUpdate",(()=>{o()})),a("setTransition",((e,s)=>{const a=t.thumbs.swiper;a&&!a.destroyed&&a.setTransition(s)})),a("beforeDestroy",(()=>{const e=t.thumbs.swiper;e&&!e.destroyed&&r&&e.destroy()})),Object.assign(t.thumbs,{init:l,update:o})},function(e){let{swiper:t,extendParams:s,emit:a,once:i}=e;s({freeMode:{enabled:!1,momentum:!0,momentumRatio:1,momentumBounce:!0,momentumBounceRatio:1,momentumVelocityRatio:1,sticky:!1,minimumVelocity:.02}}),Object.assign(t,{freeMode:{onTouchStart:function(){const e=t.getTranslate();t.setTranslate(e),t.setTransition(0),t.touchEventsData.velocities.length=0,t.freeMode.onTouchEnd({currentPos:t.rtl?t.translate:-t.translate})},onTouchMove:function(){const{touchEventsData:e,touches:s}=t;0===e.velocities.length&&e.velocities.push({position:s[t.isHorizontal()?"startX":"startY"],time:e.touchStartTime}),e.velocities.push({position:s[t.isHorizontal()?"currentX":"currentY"],time:u()})},onTouchEnd:function(e){let{currentPos:s}=e;const{params:r,$wrapperEl:n,rtlTranslate:l,snapGrid:o,touchEventsData:d}=t,c=u()-d.touchStartTime;if(s<-t.minTranslate())t.slideTo(t.activeIndex);else if(s>-t.maxTranslate())t.slides.length<o.length?t.slideTo(o.length-1):t.slideTo(t.slides.length-1);else{if(r.freeMode.momentum){if(d.velocities.length>1){const e=d.velocities.pop(),s=d.velocities.pop(),a=e.position-s.position,i=e.time-s.time;t.velocity=a/i,t.velocity/=2,Math.abs(t.velocity)<r.freeMode.minimumVelocity&&(t.velocity=0),(i>150||u()-e.time>300)&&(t.velocity=0)}else t.velocity=0;t.velocity*=r.freeMode.momentumVelocityRatio,d.velocities.length=0;let e=1e3*r.freeMode.momentumRatio;const s=t.velocity*e;let c=t.translate+s;l&&(c=-c);let p,h=!1;const m=20*Math.abs(t.velocity)*r.freeMode.momentumBounceRatio;let f;if(c<t.maxTranslate())r.freeMode.momentumBounce?(c+t.maxTranslate()<-m&&(c=t.maxTranslate()-m),p=t.maxTranslate(),h=!0,d.allowMomentumBounce=!0):c=t.maxTranslate(),r.loop&&r.centeredSlides&&(f=!0);else if(c>t.minTranslate())r.freeMode.momentumBounce?(c-t.minTranslate()>m&&(c=t.minTranslate()+m),p=t.minTranslate(),h=!0,d.allowMomentumBounce=!0):c=t.minTranslate(),r.loop&&r.centeredSlides&&(f=!0);else if(r.freeMode.sticky){let e;for(let t=0;t<o.length;t+=1)if(o[t]>-c){e=t;break}c=Math.abs(o[e]-c)<Math.abs(o[e-1]-c)||"next"===t.swipeDirection?o[e]:o[e-1],c=-c}if(f&&i("transitionEnd",(()=>{t.loopFix()})),0!==t.velocity){if(e=l?Math.abs((-c-t.translate)/t.velocity):Math.abs((c-t.translate)/t.velocity),r.freeMode.sticky){const s=Math.abs((l?-c:c)-t.translate),a=t.slidesSizesGrid[t.activeIndex];e=s<a?r.speed:s<2*a?1.5*r.speed:2.5*r.speed}}else if(r.freeMode.sticky)return void t.slideToClosest();r.freeMode.momentumBounce&&h?(t.updateProgress(p),t.setTransition(e),t.setTranslate(c),t.transitionStart(!0,t.swipeDirection),t.animating=!0,n.transitionEnd((()=>{t&&!t.destroyed&&d.allowMomentumBounce&&(a("momentumBounce"),t.setTransition(r.speed),setTimeout((()=>{t.setTranslate(p),n.transitionEnd((()=>{t&&!t.destroyed&&t.transitionEnd()}))}),0))}))):t.velocity?(a("_freeModeNoMomentumRelease"),t.updateProgress(c),t.setTransition(e),t.setTranslate(c),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,n.transitionEnd((()=>{t&&!t.destroyed&&t.transitionEnd()})))):t.updateProgress(c),t.updateActiveIndex(),t.updateSlidesClasses()}else{if(r.freeMode.sticky)return void t.slideToClosest();r.freeMode&&a("_freeModeNoMomentumRelease")}(!r.freeMode.momentum||c>=r.longSwipesMs)&&(t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses())}}}})},function(e){let t,s,a,{swiper:i,extendParams:r}=e;r({grid:{rows:1,fill:"column"}}),i.grid={initSlides:e=>{const{slidesPerView:r}=i.params,{rows:n,fill:l}=i.params.grid;s=t/n,a=Math.floor(e/n),t=Math.floor(e/n)===e/n?e:Math.ceil(e/n)*n,"auto"!==r&&"row"===l&&(t=Math.max(t,r*n))},updateSlide:(e,r,n,l)=>{const{slidesPerGroup:o,spaceBetween:d}=i.params,{rows:c,fill:p}=i.params.grid;let u,h,m;if("row"===p&&o>1){const s=Math.floor(e/(o*c)),a=e-c*o*s,i=0===s?o:Math.min(Math.ceil((n-s*c*o)/c),o);m=Math.floor(a/i),h=a-m*i+s*o,u=h+m*t/c,r.css({"-webkit-order":u,order:u})}else"column"===p?(h=Math.floor(e/c),m=e-h*c,(h>a||h===a&&m===c-1)&&(m+=1,m>=c&&(m=0,h+=1))):(m=Math.floor(e/s),h=e-m*s);r.css(l("margin-top"),0!==m?d&&`${d}px`:"")},updateWrapperSize:(e,s,a)=>{const{spaceBetween:r,centeredSlides:n,roundLengths:l}=i.params,{rows:o}=i.params.grid;if(i.virtualSize=(e+r)*t,i.virtualSize=Math.ceil(i.virtualSize/o)-r,i.$wrapperEl.css({[a("width")]:`${i.virtualSize+r}px`}),n){s.splice(0,s.length);const e=[];for(let t=0;t<s.length;t+=1){let a=s[t];l&&(a=Math.floor(a)),s[t]<i.virtualSize+s[0]&&e.push(a)}s.push(...e)}}}},function(e){let{swiper:t}=e;Object.assign(t,{appendSlide:K.bind(t),prependSlide:Z.bind(t),addSlide:Q.bind(t),removeSlide:J.bind(t),removeAllSlides:ee.bind(t)})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({fadeEffect:{crossFade:!1,transformEl:null}}),te({effect:"fade",swiper:t,on:a,setTranslate:()=>{const{slides:e}=t,s=t.params.fadeEffect;for(let a=0;a<e.length;a+=1){const e=t.slides.eq(a);let i=-e[0].swiperSlideOffset;t.params.virtualTranslate||(i-=t.translate);let r=0;t.isHorizontal()||(r=i,i=0);const n=t.params.fadeEffect.crossFade?Math.max(1-Math.abs(e[0].progress),0):1+Math.min(Math.max(e[0].progress,-1),0);se(s,e).css({opacity:n}).transform(`translate3d(${i}px, ${r}px, 0px)`)}},setTransition:e=>{const{transformEl:s}=t.params.fadeEffect;(s?t.slides.find(s):t.slides).transition(e),ae({swiper:t,duration:e,transformEl:s,allSlides:!0})},overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({cubeEffect:{slideShadows:!0,shadow:!0,shadowOffset:20,shadowScale:.94}});const i=(e,t,s)=>{let a=s?e.find(".swiper-slide-shadow-left"):e.find(".swiper-slide-shadow-top"),i=s?e.find(".swiper-slide-shadow-right"):e.find(".swiper-slide-shadow-bottom");0===a.length&&(a=d(`<div class="swiper-slide-shadow-${s?"left":"top"}"></div>`),e.append(a)),0===i.length&&(i=d(`<div class="swiper-slide-shadow-${s?"right":"bottom"}"></div>`),e.append(i)),a.length&&(a[0].style.opacity=Math.max(-t,0)),i.length&&(i[0].style.opacity=Math.max(t,0))};te({effect:"cube",swiper:t,on:a,setTranslate:()=>{const{$el:e,$wrapperEl:s,slides:a,width:r,height:n,rtlTranslate:l,size:o,browser:c}=t,p=t.params.cubeEffect,u=t.isHorizontal(),h=t.virtual&&t.params.virtual.enabled;let m,f=0;p.shadow&&(u?(m=s.find(".swiper-cube-shadow"),0===m.length&&(m=d('<div class="swiper-cube-shadow"></div>'),s.append(m)),m.css({height:`${r}px`})):(m=e.find(".swiper-cube-shadow"),0===m.length&&(m=d('<div class="swiper-cube-shadow"></div>'),e.append(m))));for(let e=0;e<a.length;e+=1){const t=a.eq(e);let s=e;h&&(s=parseInt(t.attr("data-swiper-slide-index"),10));let r=90*s,n=Math.floor(r/360);l&&(r=-r,n=Math.floor(-r/360));const d=Math.max(Math.min(t[0].progress,1),-1);let c=0,m=0,g=0;s%4==0?(c=4*-n*o,g=0):(s-1)%4==0?(c=0,g=4*-n*o):(s-2)%4==0?(c=o+4*n*o,g=o):(s-3)%4==0&&(c=-o,g=3*o+4*o*n),l&&(c=-c),u||(m=c,c=0);const v=`rotateX(${u?0:-r}deg) rotateY(${u?r:0}deg) translate3d(${c}px, ${m}px, ${g}px)`;d<=1&&d>-1&&(f=90*s+90*d,l&&(f=90*-s-90*d)),t.transform(v),p.slideShadows&&i(t,d,u)}if(s.css({"-webkit-transform-origin":`50% 50% -${o/2}px`,"transform-origin":`50% 50% -${o/2}px`}),p.shadow)if(u)m.transform(`translate3d(0px, ${r/2+p.shadowOffset}px, ${-r/2}px) rotateX(90deg) rotateZ(0deg) scale(${p.shadowScale})`);else{const e=Math.abs(f)-90*Math.floor(Math.abs(f)/90),t=1.5-(Math.sin(2*e*Math.PI/360)/2+Math.cos(2*e*Math.PI/360)/2),s=p.shadowScale,a=p.shadowScale/t,i=p.shadowOffset;m.transform(`scale3d(${s}, 1, ${a}) translate3d(0px, ${n/2+i}px, ${-n/2/a}px) rotateX(-90deg)`)}const g=c.isSafari||c.isWebView?-o/2:0;s.transform(`translate3d(0px,0,${g}px) rotateX(${t.isHorizontal()?0:f}deg) rotateY(${t.isHorizontal()?-f:0}deg)`),s[0].style.setProperty("--swiper-cube-translate-z",`${g}px`)},setTransition:e=>{const{$el:s,slides:a}=t;a.transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),t.params.cubeEffect.shadow&&!t.isHorizontal()&&s.find(".swiper-cube-shadow").transition(e)},recreateShadows:()=>{const e=t.isHorizontal();t.slides.each((t=>{const s=Math.max(Math.min(t.progress,1),-1);i(d(t),s,e)}))},getEffectParams:()=>t.params.cubeEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,resistanceRatio:0,spaceBetween:0,centeredSlides:!1,virtualTranslate:!0})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({flipEffect:{slideShadows:!0,limitRotation:!0,transformEl:null}});const i=(e,s,a)=>{let i=t.isHorizontal()?e.find(".swiper-slide-shadow-left"):e.find(".swiper-slide-shadow-top"),r=t.isHorizontal()?e.find(".swiper-slide-shadow-right"):e.find(".swiper-slide-shadow-bottom");0===i.length&&(i=ie(a,e,t.isHorizontal()?"left":"top")),0===r.length&&(r=ie(a,e,t.isHorizontal()?"right":"bottom")),i.length&&(i[0].style.opacity=Math.max(-s,0)),r.length&&(r[0].style.opacity=Math.max(s,0))};te({effect:"flip",swiper:t,on:a,setTranslate:()=>{const{slides:e,rtlTranslate:s}=t,a=t.params.flipEffect;for(let r=0;r<e.length;r+=1){const n=e.eq(r);let l=n[0].progress;t.params.flipEffect.limitRotation&&(l=Math.max(Math.min(n[0].progress,1),-1));const o=n[0].swiperSlideOffset;let d=-180*l,c=0,p=t.params.cssMode?-o-t.translate:-o,u=0;t.isHorizontal()?s&&(d=-d):(u=p,p=0,c=-d,d=0),n[0].style.zIndex=-Math.abs(Math.round(l))+e.length,a.slideShadows&&i(n,l,a);const h=`translate3d(${p}px, ${u}px, 0px) rotateX(${c}deg) rotateY(${d}deg)`;se(a,n).transform(h)}},setTransition:e=>{const{transformEl:s}=t.params.flipEffect;(s?t.slides.find(s):t.slides).transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e),ae({swiper:t,duration:e,transformEl:s})},recreateShadows:()=>{const e=t.params.flipEffect;t.slides.each((s=>{const a=d(s);let r=a[0].progress;t.params.flipEffect.limitRotation&&(r=Math.max(Math.min(s.progress,1),-1)),i(a,r,e)}))},getEffectParams:()=>t.params.flipEffect,perspective:()=>!0,overwriteParams:()=>({slidesPerView:1,slidesPerGroup:1,watchSlidesProgress:!0,spaceBetween:0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({coverflowEffect:{rotate:50,stretch:0,depth:100,scale:1,modifier:1,slideShadows:!0,transformEl:null}}),te({effect:"coverflow",swiper:t,on:a,setTranslate:()=>{const{width:e,height:s,slides:a,slidesSizesGrid:i}=t,r=t.params.coverflowEffect,n=t.isHorizontal(),l=t.translate,o=n?e/2-l:s/2-l,d=n?r.rotate:-r.rotate,c=r.depth;for(let e=0,t=a.length;e<t;e+=1){const t=a.eq(e),s=i[e],l=(o-t[0].swiperSlideOffset-s/2)/s,p="function"==typeof r.modifier?r.modifier(l):l*r.modifier;let u=n?d*p:0,h=n?0:d*p,m=-c*Math.abs(p),f=r.stretch;"string"==typeof f&&-1!==f.indexOf("%")&&(f=parseFloat(r.stretch)/100*s);let g=n?0:f*p,v=n?f*p:0,w=1-(1-r.scale)*Math.abs(p);Math.abs(v)<.001&&(v=0),Math.abs(g)<.001&&(g=0),Math.abs(m)<.001&&(m=0),Math.abs(u)<.001&&(u=0),Math.abs(h)<.001&&(h=0),Math.abs(w)<.001&&(w=0);const b=`translate3d(${v}px,${g}px,${m}px)  rotateX(${h}deg) rotateY(${u}deg) scale(${w})`;if(se(r,t).transform(b),t[0].style.zIndex=1-Math.abs(Math.round(p)),r.slideShadows){let e=n?t.find(".swiper-slide-shadow-left"):t.find(".swiper-slide-shadow-top"),s=n?t.find(".swiper-slide-shadow-right"):t.find(".swiper-slide-shadow-bottom");0===e.length&&(e=ie(r,t,n?"left":"top")),0===s.length&&(s=ie(r,t,n?"right":"bottom")),e.length&&(e[0].style.opacity=p>0?p:0),s.length&&(s[0].style.opacity=-p>0?-p:0)}}},setTransition:e=>{const{transformEl:s}=t.params.coverflowEffect;(s?t.slides.find(s):t.slides).transition(e).find(".swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left").transition(e)},perspective:()=>!0,overwriteParams:()=>({watchSlidesProgress:!0})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({creativeEffect:{transformEl:null,limitProgress:1,shadowPerProgress:!1,progressMultiplier:1,perspective:!0,prev:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1},next:{translate:[0,0,0],rotate:[0,0,0],opacity:1,scale:1}}});const i=e=>"string"==typeof e?e:`${e}px`;te({effect:"creative",swiper:t,on:a,setTranslate:()=>{const{slides:e,$wrapperEl:s,slidesSizesGrid:a}=t,r=t.params.creativeEffect,{progressMultiplier:n}=r,l=t.params.centeredSlides;if(l){const e=a[0]/2-t.params.slidesOffsetBefore||0;s.transform(`translateX(calc(50% - ${e}px))`)}for(let s=0;s<e.length;s+=1){const a=e.eq(s),o=a[0].progress,d=Math.min(Math.max(a[0].progress,-r.limitProgress),r.limitProgress);let c=d;l||(c=Math.min(Math.max(a[0].originalProgress,-r.limitProgress),r.limitProgress));const p=a[0].swiperSlideOffset,u=[t.params.cssMode?-p-t.translate:-p,0,0],h=[0,0,0];let m=!1;t.isHorizontal()||(u[1]=u[0],u[0]=0);let f={translate:[0,0,0],rotate:[0,0,0],scale:1,opacity:1};d<0?(f=r.next,m=!0):d>0&&(f=r.prev,m=!0),u.forEach(((e,t)=>{u[t]=`calc(${e}px + (${i(f.translate[t])} * ${Math.abs(d*n)}))`})),h.forEach(((e,t)=>{h[t]=f.rotate[t]*Math.abs(d*n)})),a[0].style.zIndex=-Math.abs(Math.round(o))+e.length;const g=u.join(", "),v=`rotateX(${h[0]}deg) rotateY(${h[1]}deg) rotateZ(${h[2]}deg)`,w=c<0?`scale(${1+(1-f.scale)*c*n})`:`scale(${1-(1-f.scale)*c*n})`,b=c<0?1+(1-f.opacity)*c*n:1-(1-f.opacity)*c*n,x=`translate3d(${g}) ${v} ${w}`;if(m&&f.shadow||!m){let e=a.children(".swiper-slide-shadow");if(0===e.length&&f.shadow&&(e=ie(r,a)),e.length){const t=r.shadowPerProgress?d*(1/r.limitProgress):d;e[0].style.opacity=Math.min(Math.max(Math.abs(t),0),1)}}const y=se(r,a);y.transform(x).css({opacity:b}),f.origin&&y.css("transform-origin",f.origin)}},setTransition:e=>{const{transformEl:s}=t.params.creativeEffect;(s?t.slides.find(s):t.slides).transition(e).find(".swiper-slide-shadow").transition(e),ae({swiper:t,duration:e,transformEl:s,allSlides:!0})},perspective:()=>t.params.creativeEffect.perspective,overwriteParams:()=>({watchSlidesProgress:!0,virtualTranslate:!t.params.cssMode})})},function(e){let{swiper:t,extendParams:s,on:a}=e;s({cardsEffect:{slideShadows:!0,transformEl:null,rotate:!0}}),te({effect:"cards",swiper:t,on:a,setTranslate:()=>{const{slides:e,activeIndex:s}=t,a=t.params.cardsEffect,{startTranslate:i,isTouched:r}=t.touchEventsData,n=t.translate;for(let l=0;l<e.length;l+=1){const o=e.eq(l),d=o[0].progress,c=Math.min(Math.max(d,-4),4);let p=o[0].swiperSlideOffset;t.params.centeredSlides&&!t.params.cssMode&&t.$wrapperEl.transform(`translateX(${t.minTranslate()}px)`),t.params.centeredSlides&&t.params.cssMode&&(p-=e[0].swiperSlideOffset);let u=t.params.cssMode?-p-t.translate:-p,h=0;const m=-100*Math.abs(c);let f=1,g=-2*c,v=8-.75*Math.abs(c);const w=t.virtual&&t.params.virtual.enabled?t.virtual.from+l:l,b=(w===s||w===s-1)&&c>0&&c<1&&(r||t.params.cssMode)&&n<i,x=(w===s||w===s+1)&&c<0&&c>-1&&(r||t.params.cssMode)&&n>i;if(b||x){const e=(1-Math.abs((Math.abs(c)-.5)/.5))**.5;g+=-28*c*e,f+=-.5*e,v+=96*e,h=-25*e*Math.abs(c)+"%"}if(u=c<0?`calc(${u}px + (${v*Math.abs(c)}%))`:c>0?`calc(${u}px + (-${v*Math.abs(c)}%))`:`${u}px`,!t.isHorizontal()){const e=h;h=u,u=e}const y=c<0?""+(1+(1-f)*c):""+(1-(1-f)*c),E=`\n        translate3d(${u}, ${h}, ${m}px)\n        rotateZ(${a.rotate?g:0}deg)\n        scale(${y})\n      `;if(a.slideShadows){let e=o.find(".swiper-slide-shadow");0===e.length&&(e=ie(a,o)),e.length&&(e[0].style.opacity=Math.min(Math.max((Math.abs(c)-.5)/.5,0),1))}o[0].style.zIndex=-Math.abs(Math.round(d))+e.length;se(a,o).transform(E)}},setTransition:e=>{const{transformEl:s}=t.params.cardsEffect;(s?t.slides.find(s):t.slides).transition(e).find(".swiper-slide-shadow").transition(e),ae({swiper:t,duration:e,transformEl:s})},perspective:()=>!0,overwriteParams:()=>({watchSlidesProgress:!0,virtualTranslate:!t.params.cssMode})})}];return V.use(re),V}));


!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.PureCounter=t():e.PureCounter=t()}(self,(function(){return e={638:function(e){function t(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function r(e){return function(e){if(Array.isArray(e))return n(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function n(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n}function o(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r={};for(var n in e)if(t=={}||t.hasOwnProperty(n)){var o=c(e[n]);r[n]=o,n.match(/duration|pulse/)&&(r[n]="boolean"!=typeof o?1e3*o:o)}return Object.assign({},t,r)}function i(e,t){var r=(t.end-t.start)/(t.duration/t.delay),n="inc";t.start>t.end&&(n="dec",r*=-1);var o=c(t.start);e.innerHTML=u(o,t),!0===t.once&&e.setAttribute("data-purecounter-duration",0);var i=setInterval((function(){var a=function(e,t){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"inc";return e=c(e),t=c(t),parseFloat("inc"===r?e+t:e-t)}(o,r,n);e.innerHTML=u(a,t),((o=a)>=t.end&&"inc"==n||o<=t.end&&"dec"==n)&&(e.innerHTML=u(t.end,t),t.pulse&&(e.setAttribute("data-purecounter-duration",0),setTimeout((function(){e.setAttribute("data-purecounter-duration",t.duration/1e3)}),t.pulse)),clearInterval(i))}),t.delay)}function a(e,t){return Math.pow(e,t)}function u(e,t){var r={minimumFractionDigits:t.decimals,maximumFractionDigits:t.decimals},n="string"==typeof t.formater?t.formater:void 0;return e=function(e,t){if(t.filesizing||t.currency){e=Math.abs(Number(e));var r=1e3,n=t.currency&&"string"==typeof t.currency?t.currency:"",o=t.decimals||1,i=["","K","M","B","T"],u="";t.filesizing&&(r=1024,i=["bytes","KB","MB","GB","TB"]);for(var c=4;c>=0;c--)if(0===c&&(u="".concat(e.toFixed(o)," ").concat(i[c])),e>=a(r,c)){u="".concat((e/a(r,c)).toFixed(o)," ").concat(i[c]);break}return n+u}return parseFloat(e)}(e,t),function(e,t){if(t.formater){var r=t.separator?"string"==typeof t.separator?t.separator:",":"";return"en-US"!==t.formater&&!0===t.separator?e:(n=r,e.replace(/^(?:(\d{1,3},(?:\d{1,3},?)*)|(\d{1,3}\.(?:\d{1,3}\.?)*)|(\d{1,3}(?:\s\d{1,3})*))([\.,]?\d{0,2}?)$/gi,(function(e,t,r,o,i){var a="",u="";if(void 0!==t?(a=t.replace(new RegExp(/,/gi,"gi"),n),u=","):void 0!==r?a=r.replace(new RegExp(/\./gi,"gi"),n):void 0!==o&&(a=o.replace(new RegExp(/ /gi,"gi"),n)),void 0!==i){var c=","!==u&&","!==n?",":".";a+=void 0!==i?i.replace(new RegExp(/\.|,/gi,"gi"),c):""}return a})))}var n;return e}(e=t.formater?e.toLocaleString(n,r):parseInt(e).toString(),t)}function c(e){return/^[0-9]+\.[0-9]+$/.test(e)?parseFloat(e):/^[0-9]+$/.test(e)?parseInt(e):/^true|false/i.test(e)?/^true/i.test(e):e}function f(e){for(var t=e.offsetTop,r=e.offsetLeft,n=e.offsetWidth,o=e.offsetHeight;e.offsetParent;)t+=(e=e.offsetParent).offsetTop,r+=e.offsetLeft;return t>=window.pageYOffset&&r>=window.pageXOffset&&t+o<=window.pageYOffset+window.innerHeight&&r+n<=window.pageXOffset+window.innerWidth}function s(){return"IntersectionObserver"in window&&"IntersectionObserverEntry"in window&&"intersectionRatio"in window.IntersectionObserverEntry.prototype}e.exports=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n={start:0,end:100,duration:2e3,delay:10,once:!0,pulse:!1,decimals:0,legacy:!0,filesizing:!1,currency:!1,separator:!1,formater:"us-US",selector:".purecounter"},a=o(e,n);function d(){var e=document.querySelectorAll(a.selector);if(0!==e.length)if(s()){var t=new IntersectionObserver(p.bind(this),{root:null,rootMargin:"20px",threshold:.5});e.forEach((function(e){t.observe(e)}))}else window.addEventListener&&(l(e),window.addEventListener("scroll",(function(t){l(e)}),{passive:!0}))}function l(e){e.forEach((function(e){!0===v(e).legacy&&f(e)&&p([e])}))}function p(e,t){e.forEach((function(e){var r=e.target||e,n=v(r);if(n.duration<=0)return r.innerHTML=u(n.end,n);if(!t&&!f(e)||t&&e.intersectionRatio<.5){var o=n.start>n.end?n.end:n.start;return r.innerHTML=u(o,n)}setTimeout((function(){return i(r,n)}),n.delay)}))}function v(e){var n=a,i=[].filter.call(e.attributes,(function(e){return/^data-purecounter-/.test(e.name)}));return o(0!=i.length?Object.assign.apply(Object,[{}].concat(r(i.map((function(e){var r=e.name,n=e.value;return t({},r.replace("data-purecounter-","").toLowerCase(),c(n))}))))):{},n)}d()}}},t={},r=function r(n){var o=t[n];if(void 0!==o)return o.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,r),i.exports}(638),r;var e,t,r}));

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.GLightbox = factory());
  }(this, (function () { 'use strict';
  
    function _typeof(obj) {
      "@babel/helpers - typeof";
  
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function (obj) {
          return typeof obj;
        };
      } else {
        _typeof = function (obj) {
          return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
      }
  
      return _typeof(obj);
    }
  
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
  
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }
  
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
    }
  
    var uid = Date.now();
    function extend() {
      var extended = {};
      var deep = true;
      var i = 0;
      var length = arguments.length;
  
      if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
        deep = arguments[0];
        i++;
      }
  
      var merge = function merge(obj) {
        for (var prop in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, prop)) {
            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
              extended[prop] = extend(true, extended[prop], obj[prop]);
            } else {
              extended[prop] = obj[prop];
            }
          }
        }
      };
  
      for (; i < length; i++) {
        var obj = arguments[i];
        merge(obj);
      }
  
      return extended;
    }
    function each(collection, callback) {
      if (isNode(collection) || collection === window || collection === document) {
        collection = [collection];
      }
  
      if (!isArrayLike(collection) && !isObject(collection)) {
        collection = [collection];
      }
  
      if (size(collection) == 0) {
        return;
      }
  
      if (isArrayLike(collection) && !isObject(collection)) {
        var l = collection.length,
            i = 0;
  
        for (; i < l; i++) {
          if (callback.call(collection[i], collection[i], i, collection) === false) {
            break;
          }
        }
      } else if (isObject(collection)) {
        for (var key in collection) {
          if (has(collection, key)) {
            if (callback.call(collection[key], collection[key], key, collection) === false) {
              break;
            }
          }
        }
      }
    }
    function getNodeEvents(node) {
      var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var fn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
      var cache = node[uid] = node[uid] || [];
      var data = {
        all: cache,
        evt: null,
        found: null
      };
  
      if (name && fn && size(cache) > 0) {
        each(cache, function (cl, i) {
          if (cl.eventName == name && cl.fn.toString() == fn.toString()) {
            data.found = true;
            data.evt = i;
            return false;
          }
        });
      }
  
      return data;
    }
    function addEvent(eventName) {
      var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          onElement = _ref.onElement,
          withCallback = _ref.withCallback,
          _ref$avoidDuplicate = _ref.avoidDuplicate,
          avoidDuplicate = _ref$avoidDuplicate === void 0 ? true : _ref$avoidDuplicate,
          _ref$once = _ref.once,
          once = _ref$once === void 0 ? false : _ref$once,
          _ref$useCapture = _ref.useCapture,
          useCapture = _ref$useCapture === void 0 ? false : _ref$useCapture;
  
      var thisArg = arguments.length > 2 ? arguments[2] : undefined;
      var element = onElement || [];
  
      if (isString(element)) {
        element = document.querySelectorAll(element);
      }
  
      function handler(event) {
        if (isFunction(withCallback)) {
          withCallback.call(thisArg, event, this);
        }
  
        if (once) {
          handler.destroy();
        }
      }
  
      handler.destroy = function () {
        each(element, function (el) {
          var events = getNodeEvents(el, eventName, handler);
  
          if (events.found) {
            events.all.splice(events.evt, 1);
          }
  
          if (el.removeEventListener) {
            el.removeEventListener(eventName, handler, useCapture);
          }
        });
      };
  
      each(element, function (el) {
        var events = getNodeEvents(el, eventName, handler);
  
        if (el.addEventListener && avoidDuplicate && !events.found || !avoidDuplicate) {
          el.addEventListener(eventName, handler, useCapture);
          events.all.push({
            eventName: eventName,
            fn: handler
          });
        }
      });
      return handler;
    }
    function addClass(node, name) {
      each(name.split(' '), function (cl) {
        return node.classList.add(cl);
      });
    }
    function removeClass(node, name) {
      each(name.split(' '), function (cl) {
        return node.classList.remove(cl);
      });
    }
    function hasClass(node, name) {
      return node.classList.contains(name);
    }
    function closest(elem, selector) {
      while (elem !== document.body) {
        elem = elem.parentElement;
  
        if (!elem) {
          return false;
        }
  
        var matches = typeof elem.matches == 'function' ? elem.matches(selector) : elem.msMatchesSelector(selector);
  
        if (matches) {
          return elem;
        }
      }
    }
    function animateElement(element) {
      var animation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
      var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  
      if (!element || animation === '') {
        return false;
      }
  
      if (animation === 'none') {
        if (isFunction(callback)) {
          callback();
        }
  
        return false;
      }
  
      var animationEnd = whichAnimationEvent();
      var animationNames = animation.split(' ');
      each(animationNames, function (name) {
        addClass(element, 'g' + name);
      });
      addEvent(animationEnd, {
        onElement: element,
        avoidDuplicate: false,
        once: true,
        withCallback: function withCallback(event, target) {
          each(animationNames, function (name) {
            removeClass(target, 'g' + name);
          });
  
          if (isFunction(callback)) {
            callback();
          }
        }
      });
    }
    function cssTransform(node) {
      var translate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
  
      if (translate === '') {
        node.style.webkitTransform = '';
        node.style.MozTransform = '';
        node.style.msTransform = '';
        node.style.OTransform = '';
        node.style.transform = '';
        return false;
      }
  
      node.style.webkitTransform = translate;
      node.style.MozTransform = translate;
      node.style.msTransform = translate;
      node.style.OTransform = translate;
      node.style.transform = translate;
    }
    function show(element) {
      element.style.display = 'block';
    }
    function hide(element) {
      element.style.display = 'none';
    }
    function createHTML(htmlStr) {
      var frag = document.createDocumentFragment(),
          temp = document.createElement('div');
      temp.innerHTML = htmlStr;
  
      while (temp.firstChild) {
        frag.appendChild(temp.firstChild);
      }
  
      return frag;
    }
    function windowSize() {
      return {
        width: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      };
    }
    function whichAnimationEvent() {
      var t,
          el = document.createElement('fakeelement');
      var animations = {
        animation: 'animationend',
        OAnimation: 'oAnimationEnd',
        MozAnimation: 'animationend',
        WebkitAnimation: 'webkitAnimationEnd'
      };
  
      for (t in animations) {
        if (el.style[t] !== undefined) {
          return animations[t];
        }
      }
    }
    function whichTransitionEvent() {
      var t,
          el = document.createElement('fakeelement');
      var transitions = {
        transition: 'transitionend',
        OTransition: 'oTransitionEnd',
        MozTransition: 'transitionend',
        WebkitTransition: 'webkitTransitionEnd'
      };
  
      for (t in transitions) {
        if (el.style[t] !== undefined) {
          return transitions[t];
        }
      }
    }
    function createIframe(config) {
      var url = config.url,
          allow = config.allow,
          callback = config.callback,
          appendTo = config.appendTo;
      var iframe = document.createElement('iframe');
      iframe.className = 'vimeo-video gvideo';
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
  
      if (allow) {
        iframe.setAttribute('allow', allow);
      }
  
      iframe.onload = function () {
        iframe.onload = null;
        addClass(iframe, 'node-ready');
  
        if (isFunction(callback)) {
          callback();
        }
      };
  
      if (appendTo) {
        appendTo.appendChild(iframe);
      }
  
      return iframe;
    }
    function waitUntil(check, onComplete, delay, timeout) {
      if (check()) {
        onComplete();
        return;
      }
  
      if (!delay) {
        delay = 100;
      }
  
      var timeoutPointer;
      var intervalPointer = setInterval(function () {
        if (!check()) {
          return;
        }
  
        clearInterval(intervalPointer);
  
        if (timeoutPointer) {
          clearTimeout(timeoutPointer);
        }
  
        onComplete();
      }, delay);
  
      if (timeout) {
        timeoutPointer = setTimeout(function () {
          clearInterval(intervalPointer);
        }, timeout);
      }
    }
    function injectAssets(url, waitFor, callback) {
      if (isNil(url)) {
        console.error('Inject assets error');
        return;
      }
  
      if (isFunction(waitFor)) {
        callback = waitFor;
        waitFor = false;
      }
  
      if (isString(waitFor) && waitFor in window) {
        if (isFunction(callback)) {
          callback();
        }
  
        return;
      }
  
      var found;
  
      if (url.indexOf('.css') !== -1) {
        found = document.querySelectorAll('link[href="' + url + '"]');
  
        if (found && found.length > 0) {
          if (isFunction(callback)) {
            callback();
          }
  
          return;
        }
  
        var head = document.getElementsByTagName('head')[0];
        var headStyles = head.querySelectorAll('link[rel="stylesheet"]');
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        link.media = 'all';
  
        if (headStyles) {
          head.insertBefore(link, headStyles[0]);
        } else {
          head.appendChild(link);
        }
  
        if (isFunction(callback)) {
          callback();
        }
  
        return;
      }
  
      found = document.querySelectorAll('script[src="' + url + '"]');
  
      if (found && found.length > 0) {
        if (isFunction(callback)) {
          if (isString(waitFor)) {
            waitUntil(function () {
              return typeof window[waitFor] !== 'undefined';
            }, function () {
              callback();
            });
            return false;
          }
  
          callback();
        }
  
        return;
      }
  
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
  
      script.onload = function () {
        if (isFunction(callback)) {
          if (isString(waitFor)) {
            waitUntil(function () {
              return typeof window[waitFor] !== 'undefined';
            }, function () {
              callback();
            });
            return false;
          }
  
          callback();
        }
      };
  
      document.body.appendChild(script);
    }
    function isMobile() {
      return 'navigator' in window && window.navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(Android)|(PlayBook)|(BB10)|(BlackBerry)|(Opera Mini)|(IEMobile)|(webOS)|(MeeGo)/i);
    }
    function isTouch() {
      return isMobile() !== null || document.createTouch !== undefined || 'ontouchstart' in window || 'onmsgesturechange' in window || navigator.msMaxTouchPoints;
    }
    function isFunction(f) {
      return typeof f === 'function';
    }
    function isString(s) {
      return typeof s === 'string';
    }
    function isNode(el) {
      return !!(el && el.nodeType && el.nodeType == 1);
    }
    function isArray(ar) {
      return Array.isArray(ar);
    }
    function isArrayLike(ar) {
      return ar && ar.length && isFinite(ar.length);
    }
    function isObject(o) {
      var type = _typeof(o);
  
      return type === 'object' && o != null && !isFunction(o) && !isArray(o);
    }
    function isNil(o) {
      return o == null;
    }
    function has(obj, key) {
      return obj !== null && hasOwnProperty.call(obj, key);
    }
    function size(o) {
      if (isObject(o)) {
        if (o.keys) {
          return o.keys().length;
        }
  
        var l = 0;
  
        for (var k in o) {
          if (has(o, k)) {
            l++;
          }
        }
  
        return l;
      } else {
        return o.length;
      }
    }
    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }
  
    function getNextFocusElement() {
      var current = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
      var btns = document.querySelectorAll('.gbtn[data-taborder]:not(.disabled)');
  
      if (!btns.length) {
        return false;
      }
  
      if (btns.length == 1) {
        return btns[0];
      }
  
      if (typeof current == 'string') {
        current = parseInt(current);
      }
  
      var orders = [];
      each(btns, function (btn) {
        orders.push(btn.getAttribute('data-taborder'));
      });
      var highestOrder = Math.max.apply(Math, orders.map(function (order) {
        return parseInt(order);
      }));
      var newIndex = current < 0 ? 1 : current + 1;
  
      if (newIndex > highestOrder) {
        newIndex = '1';
      }
  
      var nextOrders = orders.filter(function (el) {
        return el >= parseInt(newIndex);
      });
      var nextFocus = nextOrders.sort()[0];
      return document.querySelector(".gbtn[data-taborder=\"".concat(nextFocus, "\"]"));
    }
  
    function keyboardNavigation(instance) {
      if (instance.events.hasOwnProperty('keyboard')) {
        return false;
      }
  
      instance.events['keyboard'] = addEvent('keydown', {
        onElement: window,
        withCallback: function withCallback(event, target) {
          event = event || window.event;
          var key = event.keyCode;
  
          if (key == 9) {
            var focusedButton = document.querySelector('.gbtn.focused');
  
            if (!focusedButton) {
              var activeElement = document.activeElement && document.activeElement.nodeName ? document.activeElement.nodeName.toLocaleLowerCase() : false;
  
              if (activeElement == 'input' || activeElement == 'textarea' || activeElement == 'button') {
                return;
              }
            }
  
            event.preventDefault();
            var btns = document.querySelectorAll('.gbtn[data-taborder]');
  
            if (!btns || btns.length <= 0) {
              return;
            }
  
            if (!focusedButton) {
              var first = getNextFocusElement();
  
              if (first) {
                first.focus();
                addClass(first, 'focused');
              }
  
              return;
            }
  
            var currentFocusOrder = focusedButton.getAttribute('data-taborder');
            var nextFocus = getNextFocusElement(currentFocusOrder);
            removeClass(focusedButton, 'focused');
  
            if (nextFocus) {
              nextFocus.focus();
              addClass(nextFocus, 'focused');
            }
          }
  
          if (key == 39) {
            instance.nextSlide();
          }
  
          if (key == 37) {
            instance.prevSlide();
          }
  
          if (key == 27) {
            instance.close();
          }
        }
      });
    }
  
    function getLen(v) {
      return Math.sqrt(v.x * v.x + v.y * v.y);
    }
  
    function dot(v1, v2) {
      return v1.x * v2.x + v1.y * v2.y;
    }
  
    function getAngle(v1, v2) {
      var mr = getLen(v1) * getLen(v2);
  
      if (mr === 0) {
        return 0;
      }
  
      var r = dot(v1, v2) / mr;
  
      if (r > 1) {
        r = 1;
      }
  
      return Math.acos(r);
    }
  
    function cross(v1, v2) {
      return v1.x * v2.y - v2.x * v1.y;
    }
  
    function getRotateAngle(v1, v2) {
      var angle = getAngle(v1, v2);
  
      if (cross(v1, v2) > 0) {
        angle *= -1;
      }
  
      return angle * 180 / Math.PI;
    }
  
    var EventsHandlerAdmin = function () {
      function EventsHandlerAdmin(el) {
        _classCallCheck(this, EventsHandlerAdmin);
  
        this.handlers = [];
        this.el = el;
      }
  
      _createClass(EventsHandlerAdmin, [{
        key: "add",
        value: function add(handler) {
          this.handlers.push(handler);
        }
      }, {
        key: "del",
        value: function del(handler) {
          if (!handler) {
            this.handlers = [];
          }
  
          for (var i = this.handlers.length; i >= 0; i--) {
            if (this.handlers[i] === handler) {
              this.handlers.splice(i, 1);
            }
          }
        }
      }, {
        key: "dispatch",
        value: function dispatch() {
          for (var i = 0, len = this.handlers.length; i < len; i++) {
            var handler = this.handlers[i];
  
            if (typeof handler === 'function') {
              handler.apply(this.el, arguments);
            }
          }
        }
      }]);
  
      return EventsHandlerAdmin;
    }();
  
    function wrapFunc(el, handler) {
      var EventshandlerAdmin = new EventsHandlerAdmin(el);
      EventshandlerAdmin.add(handler);
      return EventshandlerAdmin;
    }
  
    var TouchEvents = function () {
      function TouchEvents(el, option) {
        _classCallCheck(this, TouchEvents);
  
        this.element = typeof el == 'string' ? document.querySelector(el) : el;
        this.start = this.start.bind(this);
        this.move = this.move.bind(this);
        this.end = this.end.bind(this);
        this.cancel = this.cancel.bind(this);
        this.element.addEventListener('touchstart', this.start, false);
        this.element.addEventListener('touchmove', this.move, false);
        this.element.addEventListener('touchend', this.end, false);
        this.element.addEventListener('touchcancel', this.cancel, false);
        this.preV = {
          x: null,
          y: null
        };
        this.pinchStartLen = null;
        this.zoom = 1;
        this.isDoubleTap = false;
  
        var noop = function noop() {};
  
        this.rotate = wrapFunc(this.element, option.rotate || noop);
        this.touchStart = wrapFunc(this.element, option.touchStart || noop);
        this.multipointStart = wrapFunc(this.element, option.multipointStart || noop);
        this.multipointEnd = wrapFunc(this.element, option.multipointEnd || noop);
        this.pinch = wrapFunc(this.element, option.pinch || noop);
        this.swipe = wrapFunc(this.element, option.swipe || noop);
        this.tap = wrapFunc(this.element, option.tap || noop);
        this.doubleTap = wrapFunc(this.element, option.doubleTap || noop);
        this.longTap = wrapFunc(this.element, option.longTap || noop);
        this.singleTap = wrapFunc(this.element, option.singleTap || noop);
        this.pressMove = wrapFunc(this.element, option.pressMove || noop);
        this.twoFingerPressMove = wrapFunc(this.element, option.twoFingerPressMove || noop);
        this.touchMove = wrapFunc(this.element, option.touchMove || noop);
        this.touchEnd = wrapFunc(this.element, option.touchEnd || noop);
        this.touchCancel = wrapFunc(this.element, option.touchCancel || noop);
        this.translateContainer = this.element;
        this._cancelAllHandler = this.cancelAll.bind(this);
        window.addEventListener('scroll', this._cancelAllHandler);
        this.delta = null;
        this.last = null;
        this.now = null;
        this.tapTimeout = null;
        this.singleTapTimeout = null;
        this.longTapTimeout = null;
        this.swipeTimeout = null;
        this.x1 = this.x2 = this.y1 = this.y2 = null;
        this.preTapPosition = {
          x: null,
          y: null
        };
      }
  
      _createClass(TouchEvents, [{
        key: "start",
        value: function start(evt) {
          if (!evt.touches) {
            return;
          }
  
          var ignoreDragFor = ['a', 'button', 'input'];
  
          if (evt.target && evt.target.nodeName && ignoreDragFor.indexOf(evt.target.nodeName.toLowerCase()) >= 0) {
            console.log('ignore drag for this touched element', evt.target.nodeName.toLowerCase());
            return;
          }
  
          this.now = Date.now();
          this.x1 = evt.touches[0].pageX;
          this.y1 = evt.touches[0].pageY;
          this.delta = this.now - (this.last || this.now);
          this.touchStart.dispatch(evt, this.element);
  
          if (this.preTapPosition.x !== null) {
            this.isDoubleTap = this.delta > 0 && this.delta <= 250 && Math.abs(this.preTapPosition.x - this.x1) < 30 && Math.abs(this.preTapPosition.y - this.y1) < 30;
  
            if (this.isDoubleTap) {
              clearTimeout(this.singleTapTimeout);
            }
          }
  
          this.preTapPosition.x = this.x1;
          this.preTapPosition.y = this.y1;
          this.last = this.now;
          var preV = this.preV,
              len = evt.touches.length;
  
          if (len > 1) {
            this._cancelLongTap();
  
            this._cancelSingleTap();
  
            var v = {
              x: evt.touches[1].pageX - this.x1,
              y: evt.touches[1].pageY - this.y1
            };
            preV.x = v.x;
            preV.y = v.y;
            this.pinchStartLen = getLen(preV);
            this.multipointStart.dispatch(evt, this.element);
          }
  
          this._preventTap = false;
          this.longTapTimeout = setTimeout(function () {
            this.longTap.dispatch(evt, this.element);
            this._preventTap = true;
          }.bind(this), 750);
        }
      }, {
        key: "move",
        value: function move(evt) {
          if (!evt.touches) {
            return;
          }
  
          var preV = this.preV,
              len = evt.touches.length,
              currentX = evt.touches[0].pageX,
              currentY = evt.touches[0].pageY;
          this.isDoubleTap = false;
  
          if (len > 1) {
            var sCurrentX = evt.touches[1].pageX,
                sCurrentY = evt.touches[1].pageY;
            var v = {
              x: evt.touches[1].pageX - currentX,
              y: evt.touches[1].pageY - currentY
            };
  
            if (preV.x !== null) {
              if (this.pinchStartLen > 0) {
                evt.zoom = getLen(v) / this.pinchStartLen;
                this.pinch.dispatch(evt, this.element);
              }
  
              evt.angle = getRotateAngle(v, preV);
              this.rotate.dispatch(evt, this.element);
            }
  
            preV.x = v.x;
            preV.y = v.y;
  
            if (this.x2 !== null && this.sx2 !== null) {
              evt.deltaX = (currentX - this.x2 + sCurrentX - this.sx2) / 2;
              evt.deltaY = (currentY - this.y2 + sCurrentY - this.sy2) / 2;
            } else {
              evt.deltaX = 0;
              evt.deltaY = 0;
            }
  
            this.twoFingerPressMove.dispatch(evt, this.element);
            this.sx2 = sCurrentX;
            this.sy2 = sCurrentY;
          } else {
            if (this.x2 !== null) {
              evt.deltaX = currentX - this.x2;
              evt.deltaY = currentY - this.y2;
              var movedX = Math.abs(this.x1 - this.x2),
                  movedY = Math.abs(this.y1 - this.y2);
  
              if (movedX > 10 || movedY > 10) {
                this._preventTap = true;
              }
            } else {
              evt.deltaX = 0;
              evt.deltaY = 0;
            }
  
            this.pressMove.dispatch(evt, this.element);
          }
  
          this.touchMove.dispatch(evt, this.element);
  
          this._cancelLongTap();
  
          this.x2 = currentX;
          this.y2 = currentY;
  
          if (len > 1) {
            evt.preventDefault();
          }
        }
      }, {
        key: "end",
        value: function end(evt) {
          if (!evt.changedTouches) {
            return;
          }
  
          this._cancelLongTap();
  
          var self = this;
  
          if (evt.touches.length < 2) {
            this.multipointEnd.dispatch(evt, this.element);
            this.sx2 = this.sy2 = null;
          }
  
          if (this.x2 && Math.abs(this.x1 - this.x2) > 30 || this.y2 && Math.abs(this.y1 - this.y2) > 30) {
            evt.direction = this._swipeDirection(this.x1, this.x2, this.y1, this.y2);
            this.swipeTimeout = setTimeout(function () {
              self.swipe.dispatch(evt, self.element);
            }, 0);
          } else {
            this.tapTimeout = setTimeout(function () {
              if (!self._preventTap) {
                self.tap.dispatch(evt, self.element);
              }
  
              if (self.isDoubleTap) {
                self.doubleTap.dispatch(evt, self.element);
                self.isDoubleTap = false;
              }
            }, 0);
  
            if (!self.isDoubleTap) {
              self.singleTapTimeout = setTimeout(function () {
                self.singleTap.dispatch(evt, self.element);
              }, 250);
            }
          }
  
          this.touchEnd.dispatch(evt, this.element);
          this.preV.x = 0;
          this.preV.y = 0;
          this.zoom = 1;
          this.pinchStartLen = null;
          this.x1 = this.x2 = this.y1 = this.y2 = null;
        }
      }, {
        key: "cancelAll",
        value: function cancelAll() {
          this._preventTap = true;
          clearTimeout(this.singleTapTimeout);
          clearTimeout(this.tapTimeout);
          clearTimeout(this.longTapTimeout);
          clearTimeout(this.swipeTimeout);
        }
      }, {
        key: "cancel",
        value: function cancel(evt) {
          this.cancelAll();
          this.touchCancel.dispatch(evt, this.element);
        }
      }, {
        key: "_cancelLongTap",
        value: function _cancelLongTap() {
          clearTimeout(this.longTapTimeout);
        }
      }, {
        key: "_cancelSingleTap",
        value: function _cancelSingleTap() {
          clearTimeout(this.singleTapTimeout);
        }
      }, {
        key: "_swipeDirection",
        value: function _swipeDirection(x1, x2, y1, y2) {
          return Math.abs(x1 - x2) >= Math.abs(y1 - y2) ? x1 - x2 > 0 ? 'Left' : 'Right' : y1 - y2 > 0 ? 'Up' : 'Down';
        }
      }, {
        key: "on",
        value: function on(evt, handler) {
          if (this[evt]) {
            this[evt].add(handler);
          }
        }
      }, {
        key: "off",
        value: function off(evt, handler) {
          if (this[evt]) {
            this[evt].del(handler);
          }
        }
      }, {
        key: "destroy",
        value: function destroy() {
          if (this.singleTapTimeout) {
            clearTimeout(this.singleTapTimeout);
          }
  
          if (this.tapTimeout) {
            clearTimeout(this.tapTimeout);
          }
  
          if (this.longTapTimeout) {
            clearTimeout(this.longTapTimeout);
          }
  
          if (this.swipeTimeout) {
            clearTimeout(this.swipeTimeout);
          }
  
          this.element.removeEventListener('touchstart', this.start);
          this.element.removeEventListener('touchmove', this.move);
          this.element.removeEventListener('touchend', this.end);
          this.element.removeEventListener('touchcancel', this.cancel);
          this.rotate.del();
          this.touchStart.del();
          this.multipointStart.del();
          this.multipointEnd.del();
          this.pinch.del();
          this.swipe.del();
          this.tap.del();
          this.doubleTap.del();
          this.longTap.del();
          this.singleTap.del();
          this.pressMove.del();
          this.twoFingerPressMove.del();
          this.touchMove.del();
          this.touchEnd.del();
          this.touchCancel.del();
          this.preV = this.pinchStartLen = this.zoom = this.isDoubleTap = this.delta = this.last = this.now = this.tapTimeout = this.singleTapTimeout = this.longTapTimeout = this.swipeTimeout = this.x1 = this.x2 = this.y1 = this.y2 = this.preTapPosition = this.rotate = this.touchStart = this.multipointStart = this.multipointEnd = this.pinch = this.swipe = this.tap = this.doubleTap = this.longTap = this.singleTap = this.pressMove = this.touchMove = this.touchEnd = this.touchCancel = this.twoFingerPressMove = null;
          window.removeEventListener('scroll', this._cancelAllHandler);
          return null;
        }
      }]);
  
      return TouchEvents;
    }();
  
    function resetSlideMove(slide) {
      var transitionEnd = whichTransitionEvent();
      var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      var media = hasClass(slide, 'gslide-media') ? slide : slide.querySelector('.gslide-media');
      var container = closest(media, '.ginner-container');
      var desc = slide.querySelector('.gslide-description');
  
      if (windowWidth > 769) {
        media = container;
      }
  
      addClass(media, 'greset');
      cssTransform(media, 'translate3d(0, 0, 0)');
      addEvent(transitionEnd, {
        onElement: media,
        once: true,
        withCallback: function withCallback(event, target) {
          removeClass(media, 'greset');
        }
      });
      media.style.opacity = '';
  
      if (desc) {
        desc.style.opacity = '';
      }
    }
  
    function touchNavigation(instance) {
      if (instance.events.hasOwnProperty('touch')) {
        return false;
      }
  
      var winSize = windowSize();
      var winWidth = winSize.width;
      var winHeight = winSize.height;
      var process = false;
      var currentSlide = null;
      var media = null;
      var mediaImage = null;
      var doingMove = false;
      var initScale = 1;
      var maxScale = 4.5;
      var currentScale = 1;
      var doingZoom = false;
      var imageZoomed = false;
      var zoomedPosX = null;
      var zoomedPosY = null;
      var lastZoomedPosX = null;
      var lastZoomedPosY = null;
      var hDistance;
      var vDistance;
      var hDistancePercent = 0;
      var vDistancePercent = 0;
      var vSwipe = false;
      var hSwipe = false;
      var startCoords = {};
      var endCoords = {};
      var xDown = 0;
      var yDown = 0;
      var isInlined;
      var sliderWrapper = document.getElementById('glightbox-slider');
      var overlay = document.querySelector('.goverlay');
      var touchInstance = new TouchEvents(sliderWrapper, {
        touchStart: function touchStart(e) {
          process = true;
  
          if (hasClass(e.targetTouches[0].target, 'ginner-container') || closest(e.targetTouches[0].target, '.gslide-desc') || e.targetTouches[0].target.nodeName.toLowerCase() == 'a') {
            process = false;
          }
  
          if (closest(e.targetTouches[0].target, '.gslide-inline') && !hasClass(e.targetTouches[0].target.parentNode, 'gslide-inline')) {
            process = false;
          }
  
          if (process) {
            endCoords = e.targetTouches[0];
            startCoords.pageX = e.targetTouches[0].pageX;
            startCoords.pageY = e.targetTouches[0].pageY;
            xDown = e.targetTouches[0].clientX;
            yDown = e.targetTouches[0].clientY;
            currentSlide = instance.activeSlide;
            media = currentSlide.querySelector('.gslide-media');
            isInlined = currentSlide.querySelector('.gslide-inline');
            mediaImage = null;
  
            if (hasClass(media, 'gslide-image')) {
              mediaImage = media.querySelector('img');
            }
  
            var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  
            if (windowWidth > 769) {
              media = currentSlide.querySelector('.ginner-container');
            }
  
            removeClass(overlay, 'greset');
  
            if (e.pageX > 20 && e.pageX < window.innerWidth - 20) {
              return;
            }
  
            e.preventDefault();
          }
        },
        touchMove: function touchMove(e) {
          if (!process) {
            return;
          }
  
          endCoords = e.targetTouches[0];
  
          if (doingZoom || imageZoomed) {
            return;
          }
  
          if (isInlined && isInlined.offsetHeight > winHeight) {
            var moved = startCoords.pageX - endCoords.pageX;
  
            if (Math.abs(moved) <= 13) {
              return false;
            }
          }
  
          doingMove = true;
          var xUp = e.targetTouches[0].clientX;
          var yUp = e.targetTouches[0].clientY;
          var xDiff = xDown - xUp;
          var yDiff = yDown - yUp;
  
          if (Math.abs(xDiff) > Math.abs(yDiff)) {
            vSwipe = false;
            hSwipe = true;
          } else {
            hSwipe = false;
            vSwipe = true;
          }
  
          hDistance = endCoords.pageX - startCoords.pageX;
          hDistancePercent = hDistance * 100 / winWidth;
          vDistance = endCoords.pageY - startCoords.pageY;
          vDistancePercent = vDistance * 100 / winHeight;
          var opacity;
  
          if (vSwipe && mediaImage) {
            opacity = 1 - Math.abs(vDistance) / winHeight;
            overlay.style.opacity = opacity;
  
            if (instance.settings.touchFollowAxis) {
              hDistancePercent = 0;
            }
          }
  
          if (hSwipe) {
            opacity = 1 - Math.abs(hDistance) / winWidth;
            media.style.opacity = opacity;
  
            if (instance.settings.touchFollowAxis) {
              vDistancePercent = 0;
            }
          }
  
          if (!mediaImage) {
            return cssTransform(media, "translate3d(".concat(hDistancePercent, "%, 0, 0)"));
          }
  
          cssTransform(media, "translate3d(".concat(hDistancePercent, "%, ").concat(vDistancePercent, "%, 0)"));
        },
        touchEnd: function touchEnd() {
          if (!process) {
            return;
          }
  
          doingMove = false;
  
          if (imageZoomed || doingZoom) {
            lastZoomedPosX = zoomedPosX;
            lastZoomedPosY = zoomedPosY;
            return;
          }
  
          var v = Math.abs(parseInt(vDistancePercent));
          var h = Math.abs(parseInt(hDistancePercent));
  
          if (v > 29 && mediaImage) {
            instance.close();
            return;
          }
  
          if (v < 29 && h < 25) {
            addClass(overlay, 'greset');
            overlay.style.opacity = 1;
            return resetSlideMove(media);
          }
        },
        multipointEnd: function multipointEnd() {
          setTimeout(function () {
            doingZoom = false;
          }, 50);
        },
        multipointStart: function multipointStart() {
          doingZoom = true;
          initScale = currentScale ? currentScale : 1;
        },
        pinch: function pinch(evt) {
          if (!mediaImage || doingMove) {
            return false;
          }
  
          doingZoom = true;
          mediaImage.scaleX = mediaImage.scaleY = initScale * evt.zoom;
          var scale = initScale * evt.zoom;
          imageZoomed = true;
  
          if (scale <= 1) {
            imageZoomed = false;
            scale = 1;
            lastZoomedPosY = null;
            lastZoomedPosX = null;
            zoomedPosX = null;
            zoomedPosY = null;
            mediaImage.setAttribute('style', '');
            return;
          }
  
          if (scale > maxScale) {
            scale = maxScale;
          }
  
          mediaImage.style.transform = "scale3d(".concat(scale, ", ").concat(scale, ", 1)");
          currentScale = scale;
        },
        pressMove: function pressMove(e) {
          if (imageZoomed && !doingZoom) {
            var mhDistance = endCoords.pageX - startCoords.pageX;
            var mvDistance = endCoords.pageY - startCoords.pageY;
  
            if (lastZoomedPosX) {
              mhDistance = mhDistance + lastZoomedPosX;
            }
  
            if (lastZoomedPosY) {
              mvDistance = mvDistance + lastZoomedPosY;
            }
  
            zoomedPosX = mhDistance;
            zoomedPosY = mvDistance;
            var style = "translate3d(".concat(mhDistance, "px, ").concat(mvDistance, "px, 0)");
  
            if (currentScale) {
              style += " scale3d(".concat(currentScale, ", ").concat(currentScale, ", 1)");
            }
  
            cssTransform(mediaImage, style);
          }
        },
        swipe: function swipe(evt) {
          if (imageZoomed) {
            return;
          }
  
          if (doingZoom) {
            doingZoom = false;
            return;
          }
  
          if (evt.direction == 'Left') {
            if (instance.index == instance.elements.length - 1) {
              return resetSlideMove(media);
            }
  
            instance.nextSlide();
          }
  
          if (evt.direction == 'Right') {
            if (instance.index == 0) {
              return resetSlideMove(media);
            }
  
            instance.prevSlide();
          }
        }
      });
      instance.events['touch'] = touchInstance;
    }
  
    var ZoomImages = function () {
      function ZoomImages(el, slide) {
        var _this = this;
  
        var onclose = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  
        _classCallCheck(this, ZoomImages);
  
        this.img = el;
        this.slide = slide;
        this.onclose = onclose;
  
        if (this.img.setZoomEvents) {
          return false;
        }
  
        this.active = false;
        this.zoomedIn = false;
        this.dragging = false;
        this.currentX = null;
        this.currentY = null;
        this.initialX = null;
        this.initialY = null;
        this.xOffset = 0;
        this.yOffset = 0;
        this.img.addEventListener('mousedown', function (e) {
          return _this.dragStart(e);
        }, false);
        this.img.addEventListener('mouseup', function (e) {
          return _this.dragEnd(e);
        }, false);
        this.img.addEventListener('mousemove', function (e) {
          return _this.drag(e);
        }, false);
        this.img.addEventListener('click', function (e) {
          if (_this.slide.classList.contains('dragging-nav')) {
            _this.zoomOut();
  
            return false;
          }
  
          if (!_this.zoomedIn) {
            return _this.zoomIn();
          }
  
          if (_this.zoomedIn && !_this.dragging) {
            _this.zoomOut();
          }
        }, false);
        this.img.setZoomEvents = true;
      }
  
      _createClass(ZoomImages, [{
        key: "zoomIn",
        value: function zoomIn() {
          var winWidth = this.widowWidth();
  
          if (this.zoomedIn || winWidth <= 768) {
            return;
          }
  
          var img = this.img;
          img.setAttribute('data-style', img.getAttribute('style'));
          img.style.maxWidth = img.naturalWidth + 'px';
          img.style.maxHeight = img.naturalHeight + 'px';
  
          if (img.naturalWidth > winWidth) {
            var centerX = winWidth / 2 - img.naturalWidth / 2;
            this.setTranslate(this.img.parentNode, centerX, 0);
          }
  
          this.slide.classList.add('zoomed');
          this.zoomedIn = true;
        }
      }, {
        key: "zoomOut",
        value: function zoomOut() {
          this.img.parentNode.setAttribute('style', '');
          this.img.setAttribute('style', this.img.getAttribute('data-style'));
          this.slide.classList.remove('zoomed');
          this.zoomedIn = false;
          this.currentX = null;
          this.currentY = null;
          this.initialX = null;
          this.initialY = null;
          this.xOffset = 0;
          this.yOffset = 0;
  
          if (this.onclose && typeof this.onclose == 'function') {
            this.onclose();
          }
        }
      }, {
        key: "dragStart",
        value: function dragStart(e) {
          e.preventDefault();
  
          if (!this.zoomedIn) {
            this.active = false;
            return;
          }
  
          if (e.type === 'touchstart') {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
          } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
          }
  
          if (e.target === this.img) {
            this.active = true;
            this.img.classList.add('dragging');
          }
        }
      }, {
        key: "dragEnd",
        value: function dragEnd(e) {
          var _this2 = this;
  
          e.preventDefault();
          this.initialX = this.currentX;
          this.initialY = this.currentY;
          this.active = false;
          setTimeout(function () {
            _this2.dragging = false;
            _this2.img.isDragging = false;
  
            _this2.img.classList.remove('dragging');
          }, 100);
        }
      }, {
        key: "drag",
        value: function drag(e) {
          if (this.active) {
            e.preventDefault();
  
            if (e.type === 'touchmove') {
              this.currentX = e.touches[0].clientX - this.initialX;
              this.currentY = e.touches[0].clientY - this.initialY;
            } else {
              this.currentX = e.clientX - this.initialX;
              this.currentY = e.clientY - this.initialY;
            }
  
            this.xOffset = this.currentX;
            this.yOffset = this.currentY;
            this.img.isDragging = true;
            this.dragging = true;
            this.setTranslate(this.img, this.currentX, this.currentY);
          }
        }
      }, {
        key: "onMove",
        value: function onMove(e) {
          if (!this.zoomedIn) {
            return;
          }
  
          var xOffset = e.clientX - this.img.naturalWidth / 2;
          var yOffset = e.clientY - this.img.naturalHeight / 2;
          this.setTranslate(this.img, xOffset, yOffset);
        }
      }, {
        key: "setTranslate",
        value: function setTranslate(node, xPos, yPos) {
          node.style.transform = 'translate3d(' + xPos + 'px, ' + yPos + 'px, 0)';
        }
      }, {
        key: "widowWidth",
        value: function widowWidth() {
          return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        }
      }]);
  
      return ZoomImages;
    }();
  
    var DragSlides = function () {
      function DragSlides() {
        var _this = this;
  
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  
        _classCallCheck(this, DragSlides);
  
        var dragEl = config.dragEl,
            _config$toleranceX = config.toleranceX,
            toleranceX = _config$toleranceX === void 0 ? 40 : _config$toleranceX,
            _config$toleranceY = config.toleranceY,
            toleranceY = _config$toleranceY === void 0 ? 65 : _config$toleranceY,
            _config$slide = config.slide,
            slide = _config$slide === void 0 ? null : _config$slide,
            _config$instance = config.instance,
            instance = _config$instance === void 0 ? null : _config$instance;
        this.el = dragEl;
        this.active = false;
        this.dragging = false;
        this.currentX = null;
        this.currentY = null;
        this.initialX = null;
        this.initialY = null;
        this.xOffset = 0;
        this.yOffset = 0;
        this.direction = null;
        this.lastDirection = null;
        this.toleranceX = toleranceX;
        this.toleranceY = toleranceY;
        this.toleranceReached = false;
        this.dragContainer = this.el;
        this.slide = slide;
        this.instance = instance;
        this.el.addEventListener('mousedown', function (e) {
          return _this.dragStart(e);
        }, false);
        this.el.addEventListener('mouseup', function (e) {
          return _this.dragEnd(e);
        }, false);
        this.el.addEventListener('mousemove', function (e) {
          return _this.drag(e);
        }, false);
      }
  
      _createClass(DragSlides, [{
        key: "dragStart",
        value: function dragStart(e) {
          if (this.slide.classList.contains('zoomed')) {
            this.active = false;
            return;
          }
  
          if (e.type === 'touchstart') {
            this.initialX = e.touches[0].clientX - this.xOffset;
            this.initialY = e.touches[0].clientY - this.yOffset;
          } else {
            this.initialX = e.clientX - this.xOffset;
            this.initialY = e.clientY - this.yOffset;
          }
  
          var clicked = e.target.nodeName.toLowerCase();
          var exludeClicks = ['input', 'select', 'textarea', 'button', 'a'];
  
          if (e.target.classList.contains('nodrag') || closest(e.target, '.nodrag') || exludeClicks.indexOf(clicked) !== -1) {
            this.active = false;
            return;
          }
  
          e.preventDefault();
  
          if (e.target === this.el || clicked !== 'img' && closest(e.target, '.gslide-inline')) {
            this.active = true;
            this.el.classList.add('dragging');
            this.dragContainer = closest(e.target, '.ginner-container');
          }
        }
      }, {
        key: "dragEnd",
        value: function dragEnd(e) {
          var _this2 = this;
  
          e && e.preventDefault();
          this.initialX = 0;
          this.initialY = 0;
          this.currentX = null;
          this.currentY = null;
          this.initialX = null;
          this.initialY = null;
          this.xOffset = 0;
          this.yOffset = 0;
          this.active = false;
  
          if (this.doSlideChange) {
            this.instance.preventOutsideClick = true;
            this.doSlideChange == 'right' && this.instance.prevSlide();
            this.doSlideChange == 'left' && this.instance.nextSlide();
          }
  
          if (this.doSlideClose) {
            this.instance.close();
          }
  
          if (!this.toleranceReached) {
            this.setTranslate(this.dragContainer, 0, 0, true);
          }
  
          setTimeout(function () {
            _this2.instance.preventOutsideClick = false;
            _this2.toleranceReached = false;
            _this2.lastDirection = null;
            _this2.dragging = false;
            _this2.el.isDragging = false;
  
            _this2.el.classList.remove('dragging');
  
            _this2.slide.classList.remove('dragging-nav');
  
            _this2.dragContainer.style.transform = '';
            _this2.dragContainer.style.transition = '';
          }, 100);
        }
      }, {
        key: "drag",
        value: function drag(e) {
          if (this.active) {
            e.preventDefault();
            this.slide.classList.add('dragging-nav');
  
            if (e.type === 'touchmove') {
              this.currentX = e.touches[0].clientX - this.initialX;
              this.currentY = e.touches[0].clientY - this.initialY;
            } else {
              this.currentX = e.clientX - this.initialX;
              this.currentY = e.clientY - this.initialY;
            }
  
            this.xOffset = this.currentX;
            this.yOffset = this.currentY;
            this.el.isDragging = true;
            this.dragging = true;
            this.doSlideChange = false;
            this.doSlideClose = false;
            var currentXInt = Math.abs(this.currentX);
            var currentYInt = Math.abs(this.currentY);
  
            if (currentXInt > 0 && currentXInt >= Math.abs(this.currentY) && (!this.lastDirection || this.lastDirection == 'x')) {
              this.yOffset = 0;
              this.lastDirection = 'x';
              this.setTranslate(this.dragContainer, this.currentX, 0);
              var doChange = this.shouldChange();
  
              if (!this.instance.settings.dragAutoSnap && doChange) {
                this.doSlideChange = doChange;
              }
  
              if (this.instance.settings.dragAutoSnap && doChange) {
                this.instance.preventOutsideClick = true;
                this.toleranceReached = true;
                this.active = false;
                this.instance.preventOutsideClick = true;
                this.dragEnd(null);
                doChange == 'right' && this.instance.prevSlide();
                doChange == 'left' && this.instance.nextSlide();
                return;
              }
            }
  
            if (this.toleranceY > 0 && currentYInt > 0 && currentYInt >= currentXInt && (!this.lastDirection || this.lastDirection == 'y')) {
              this.xOffset = 0;
              this.lastDirection = 'y';
              this.setTranslate(this.dragContainer, 0, this.currentY);
              var doClose = this.shouldClose();
  
              if (!this.instance.settings.dragAutoSnap && doClose) {
                this.doSlideClose = true;
              }
  
              if (this.instance.settings.dragAutoSnap && doClose) {
                this.instance.close();
              }
  
              return;
            }
          }
        }
      }, {
        key: "shouldChange",
        value: function shouldChange() {
          var doChange = false;
          var currentXInt = Math.abs(this.currentX);
  
          if (currentXInt >= this.toleranceX) {
            var dragDir = this.currentX > 0 ? 'right' : 'left';
  
            if (dragDir == 'left' && this.slide !== this.slide.parentNode.lastChild || dragDir == 'right' && this.slide !== this.slide.parentNode.firstChild) {
              doChange = dragDir;
            }
          }
  
          return doChange;
        }
      }, {
        key: "shouldClose",
        value: function shouldClose() {
          var doClose = false;
          var currentYInt = Math.abs(this.currentY);
  
          if (currentYInt >= this.toleranceY) {
            doClose = true;
          }
  
          return doClose;
        }
      }, {
        key: "setTranslate",
        value: function setTranslate(node, xPos, yPos) {
          var animated = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  
          if (animated) {
            node.style.transition = 'all .2s ease';
          } else {
            node.style.transition = '';
          }
  
          node.style.transform = "translate3d(".concat(xPos, "px, ").concat(yPos, "px, 0)");
        }
      }]);
  
      return DragSlides;
    }();
  
    function slideImage(slide, data, index, callback) {
      var slideMedia = slide.querySelector('.gslide-media');
      var img = new Image();
      var titleID = 'gSlideTitle_' + index;
      var textID = 'gSlideDesc_' + index;
      img.addEventListener('load', function () {
        if (isFunction(callback)) {
          callback();
        }
      }, false);
      img.src = data.href;
  
      if (data.sizes != '' && data.srcset != '') {
        img.sizes = data.sizes;
        img.srcset = data.srcset;
      }
  
      img.alt = '';
  
      if (!isNil(data.alt) && data.alt !== '') {
        img.alt = data.alt;
      }
  
      if (data.title !== '') {
        img.setAttribute('aria-labelledby', titleID);
      }
  
      if (data.description !== '') {
        img.setAttribute('aria-describedby', textID);
      }
  
      if (data.hasOwnProperty('_hasCustomWidth') && data._hasCustomWidth) {
        img.style.width = data.width;
      }
  
      if (data.hasOwnProperty('_hasCustomHeight') && data._hasCustomHeight) {
        img.style.height = data.height;
      }
  
      slideMedia.insertBefore(img, slideMedia.firstChild);
      return;
    }
  
    function slideVideo(slide, data, index, callback) {
      var _this = this;
  
      var slideContainer = slide.querySelector('.ginner-container');
      var videoID = 'gvideo' + index;
      var slideMedia = slide.querySelector('.gslide-media');
      var videoPlayers = this.getAllPlayers();
      addClass(slideContainer, 'gvideo-container');
      slideMedia.insertBefore(createHTML('<div class="gvideo-wrapper"></div>'), slideMedia.firstChild);
      var videoWrapper = slide.querySelector('.gvideo-wrapper');
      injectAssets(this.settings.plyr.css, 'Plyr');
      var url = data.href;
      var provider = data === null || data === void 0 ? void 0 : data.videoProvider;
      var customPlaceholder = false;
      slideMedia.style.maxWidth = data.width;
      injectAssets(this.settings.plyr.js, 'Plyr', function () {
        if (!provider && url.match(/vimeo\.com\/([0-9]*)/)) {
          provider = 'vimeo';
        }
  
        if (!provider && (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/) || url.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/))) {
          provider = 'youtube';
        }
  
        if (provider === 'local' || !provider) {
          provider = 'local';
          var html = '<video id="' + videoID + '" ';
          html += "style=\"background:#000; max-width: ".concat(data.width, ";\" ");
          html += 'preload="metadata" ';
          html += 'x-webkit-airplay="allow" ';
          html += 'playsinline ';
          html += 'controls ';
          html += 'class="gvideo-local">';
          html += "<source src=\"".concat(url, "\">");
          html += '</video>';
          customPlaceholder = createHTML(html);
        }
  
        var placeholder = customPlaceholder ? customPlaceholder : createHTML("<div id=\"".concat(videoID, "\" data-plyr-provider=\"").concat(provider, "\" data-plyr-embed-id=\"").concat(url, "\"></div>"));
        addClass(videoWrapper, "".concat(provider, "-video gvideo"));
        videoWrapper.appendChild(placeholder);
        videoWrapper.setAttribute('data-id', videoID);
        videoWrapper.setAttribute('data-index', index);
        var playerConfig = has(_this.settings.plyr, 'config') ? _this.settings.plyr.config : {};
        var player = new Plyr('#' + videoID, playerConfig);
        player.on('ready', function (event) {
          videoPlayers[videoID] = event.detail.plyr;
  
          if (isFunction(callback)) {
            callback();
          }
        });
        waitUntil(function () {
          return slide.querySelector('iframe') && slide.querySelector('iframe').dataset.ready == 'true';
        }, function () {
          _this.resize(slide);
        });
        player.on('enterfullscreen', handleMediaFullScreen);
        player.on('exitfullscreen', handleMediaFullScreen);
      });
    }
  
    function handleMediaFullScreen(event) {
      var media = closest(event.target, '.gslide-media');
  
      if (event.type === 'enterfullscreen') {
        addClass(media, 'fullscreen');
      }
  
      if (event.type === 'exitfullscreen') {
        removeClass(media, 'fullscreen');
      }
    }
  
    function slideInline(slide, data, index, callback) {
      var _this = this;
  
      var slideMedia = slide.querySelector('.gslide-media');
      var hash = has(data, 'href') && data.href ? data.href.split('#').pop().trim() : false;
      var content = has(data, 'content') && data.content ? data.content : false;
      var innerContent;
  
      if (content) {
        if (isString(content)) {
          innerContent = createHTML("<div class=\"ginlined-content\">".concat(content, "</div>"));
        }
  
        if (isNode(content)) {
          if (content.style.display == 'none') {
            content.style.display = 'block';
          }
  
          var container = document.createElement('div');
          container.className = 'ginlined-content';
          container.appendChild(content);
          innerContent = container;
        }
      }
  
      if (hash) {
        var div = document.getElementById(hash);
  
        if (!div) {
          return false;
        }
  
        var cloned = div.cloneNode(true);
        cloned.style.height = data.height;
        cloned.style.maxWidth = data.width;
        addClass(cloned, 'ginlined-content');
        innerContent = cloned;
      }
  
      if (!innerContent) {
        console.error('Unable to append inline slide content', data);
        return false;
      }
  
      slideMedia.style.height = data.height;
      slideMedia.style.width = data.width;
      slideMedia.appendChild(innerContent);
      this.events['inlineclose' + hash] = addEvent('click', {
        onElement: slideMedia.querySelectorAll('.gtrigger-close'),
        withCallback: function withCallback(e) {
          e.preventDefault();
  
          _this.close();
        }
      });
  
      if (isFunction(callback)) {
        callback();
      }
  
      return;
    }
  
    function slideIframe(slide, data, index, callback) {
      var slideMedia = slide.querySelector('.gslide-media');
      var iframe = createIframe({
        url: data.href,
        callback: callback
      });
      slideMedia.parentNode.style.maxWidth = data.width;
      slideMedia.parentNode.style.height = data.height;
      slideMedia.appendChild(iframe);
      return;
    }
  
    var SlideConfigParser = function () {
      function SlideConfigParser() {
        var slideParamas = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  
        _classCallCheck(this, SlideConfigParser);
  
        this.defaults = {
          href: '',
          sizes: '',
          srcset: '',
          title: '',
          type: '',
          videoProvider: '',
          description: '',
          alt: '',
          descPosition: 'bottom',
          effect: '',
          width: '',
          height: '',
          content: false,
          zoomable: true,
          draggable: true
        };
  
        if (isObject(slideParamas)) {
          this.defaults = extend(this.defaults, slideParamas);
        }
      }
  
      _createClass(SlideConfigParser, [{
        key: "sourceType",
        value: function sourceType(url) {
          var origin = url;
          url = url.toLowerCase();
  
          if (url.match(/\.(jpeg|jpg|jpe|gif|png|apn|webp|avif|svg)/) !== null) {
            return 'image';
          }
  
          if (url.match(/(youtube\.com|youtube-nocookie\.com)\/watch\?v=([a-zA-Z0-9\-_]+)/) || url.match(/youtu\.be\/([a-zA-Z0-9\-_]+)/) || url.match(/(youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9\-_]+)/)) {
            return 'video';
          }
  
          if (url.match(/vimeo\.com\/([0-9]*)/)) {
            return 'video';
          }
  
          if (url.match(/\.(mp4|ogg|webm|mov)/) !== null) {
            return 'video';
          }
  
          if (url.match(/\.(mp3|wav|wma|aac|ogg)/) !== null) {
            return 'audio';
          }
  
          if (url.indexOf('#') > -1) {
            var hash = origin.split('#').pop();
  
            if (hash.trim() !== '') {
              return 'inline';
            }
          }
  
          if (url.indexOf('goajax=true') > -1) {
            return 'ajax';
          }
  
          return 'external';
        }
      }, {
        key: "parseConfig",
        value: function parseConfig(element, settings) {
          var _this = this;
  
          var data = extend({
            descPosition: settings.descPosition
          }, this.defaults);
  
          if (isObject(element) && !isNode(element)) {
            if (!has(element, 'type')) {
              if (has(element, 'content') && element.content) {
                element.type = 'inline';
              } else if (has(element, 'href')) {
                element.type = this.sourceType(element.href);
              }
            }
  
            var objectData = extend(data, element);
            this.setSize(objectData, settings);
            return objectData;
          }
  
          var url = '';
          var config = element.getAttribute('data-glightbox');
          var nodeType = element.nodeName.toLowerCase();
  
          if (nodeType === 'a') {
            url = element.href;
          }
  
          if (nodeType === 'img') {
            url = element.src;
            data.alt = element.alt;
          }
  
          data.href = url;
          each(data, function (val, key) {
            if (has(settings, key) && key !== 'width') {
              data[key] = settings[key];
            }
  
            var nodeData = element.dataset[key];
  
            if (!isNil(nodeData)) {
              data[key] = _this.sanitizeValue(nodeData);
            }
          });
  
          if (data.content) {
            data.type = 'inline';
          }
  
          if (!data.type && url) {
            data.type = this.sourceType(url);
          }
  
          if (!isNil(config)) {
            var cleanKeys = [];
            each(data, function (v, k) {
              cleanKeys.push(';\\s?' + k);
            });
            cleanKeys = cleanKeys.join('\\s?:|');
  
            if (config.trim() !== '') {
              each(data, function (val, key) {
                var str = config;
                var match = 's?' + key + 's?:s?(.*?)(' + cleanKeys + 's?:|$)';
                var regex = new RegExp(match);
                var matches = str.match(regex);
  
                if (matches && matches.length && matches[1]) {
                  var value = matches[1].trim().replace(/;\s*$/, '');
                  data[key] = _this.sanitizeValue(value);
                }
              });
            }
          } else {
            if (!data.title && nodeType == 'a') {
              var title = element.title;
  
              if (!isNil(title) && title !== '') {
                data.title = title;
              }
            }
  
            if (!data.title && nodeType == 'img') {
              var alt = element.alt;
  
              if (!isNil(alt) && alt !== '') {
                data.title = alt;
              }
            }
          }
  
          if (data.description && data.description.substring(0, 1) === '.') {
            var description;
  
            try {
              description = document.querySelector(data.description).innerHTML;
            } catch (error) {
              if (!(error instanceof DOMException)) {
                throw error;
              }
            }
  
            if (description) {
              data.description = description;
            }
          }
  
          if (!data.description) {
            var nodeDesc = element.querySelector('.glightbox-desc');
  
            if (nodeDesc) {
              data.description = nodeDesc.innerHTML;
            }
          }
  
          this.setSize(data, settings, element);
          this.slideConfig = data;
          return data;
        }
      }, {
        key: "setSize",
        value: function setSize(data, settings) {
          var element = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
          var defaultWith = data.type == 'video' ? this.checkSize(settings.videosWidth) : this.checkSize(settings.width);
          var defaultHeight = this.checkSize(settings.height);
          data.width = has(data, 'width') && data.width !== '' ? this.checkSize(data.width) : defaultWith;
          data.height = has(data, 'height') && data.height !== '' ? this.checkSize(data.height) : defaultHeight;
  
          if (element && data.type == 'image') {
            data._hasCustomWidth = element.dataset.width ? true : false;
            data._hasCustomHeight = element.dataset.height ? true : false;
          }
  
          return data;
        }
      }, {
        key: "checkSize",
        value: function checkSize(size) {
          return isNumber(size) ? "".concat(size, "px") : size;
        }
      }, {
        key: "sanitizeValue",
        value: function sanitizeValue(val) {
          if (val !== 'true' && val !== 'false') {
            return val;
          }
  
          return val === 'true';
        }
      }]);
  
      return SlideConfigParser;
    }();
  
    var Slide = function () {
      function Slide(el, instance, index) {
        _classCallCheck(this, Slide);
  
        this.element = el;
        this.instance = instance;
        this.index = index;
      }
  
      _createClass(Slide, [{
        key: "setContent",
        value: function setContent() {
          var _this = this;
  
          var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
          var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  
          if (hasClass(slide, 'loaded')) {
            return false;
          }
  
          var settings = this.instance.settings;
          var slideConfig = this.slideConfig;
          var isMobileDevice = isMobile();
  
          if (isFunction(settings.beforeSlideLoad)) {
            settings.beforeSlideLoad({
              index: this.index,
              slide: slide,
              player: false
            });
          }
  
          var type = slideConfig.type;
          var position = slideConfig.descPosition;
          var slideMedia = slide.querySelector('.gslide-media');
          var slideTitle = slide.querySelector('.gslide-title');
          var slideText = slide.querySelector('.gslide-desc');
          var slideDesc = slide.querySelector('.gdesc-inner');
          var finalCallback = callback;
          var titleID = 'gSlideTitle_' + this.index;
          var textID = 'gSlideDesc_' + this.index;
  
          if (isFunction(settings.afterSlideLoad)) {
            finalCallback = function finalCallback() {
              if (isFunction(callback)) {
                callback();
              }
  
              settings.afterSlideLoad({
                index: _this.index,
                slide: slide,
                player: _this.instance.getSlidePlayerInstance(_this.index)
              });
            };
          }
  
          if (slideConfig.title == '' && slideConfig.description == '') {
            if (slideDesc) {
              slideDesc.parentNode.parentNode.removeChild(slideDesc.parentNode);
            }
          } else {
            if (slideTitle && slideConfig.title !== '') {
              slideTitle.id = titleID;
              slideTitle.innerHTML = slideConfig.title;
            } else {
              slideTitle.parentNode.removeChild(slideTitle);
            }
  
            if (slideText && slideConfig.description !== '') {
              slideText.id = textID;
  
              if (isMobileDevice && settings.moreLength > 0) {
                slideConfig.smallDescription = this.slideShortDesc(slideConfig.description, settings.moreLength, settings.moreText);
                slideText.innerHTML = slideConfig.smallDescription;
                this.descriptionEvents(slideText, slideConfig);
              } else {
                slideText.innerHTML = slideConfig.description;
              }
            } else {
              slideText.parentNode.removeChild(slideText);
            }
  
            addClass(slideMedia.parentNode, "desc-".concat(position));
            addClass(slideDesc.parentNode, "description-".concat(position));
          }
  
          addClass(slideMedia, "gslide-".concat(type));
          addClass(slide, 'loaded');
  
          if (type === 'video') {
            slideVideo.apply(this.instance, [slide, slideConfig, this.index, finalCallback]);
            return;
          }
  
          if (type === 'external') {
            slideIframe.apply(this, [slide, slideConfig, this.index, finalCallback]);
            return;
          }
  
          if (type === 'inline') {
            slideInline.apply(this.instance, [slide, slideConfig, this.index, finalCallback]);
  
            if (slideConfig.draggable) {
              new DragSlides({
                dragEl: slide.querySelector('.gslide-inline'),
                toleranceX: settings.dragToleranceX,
                toleranceY: settings.dragToleranceY,
                slide: slide,
                instance: this.instance
              });
            }
  
            return;
          }
  
          if (type === 'image') {
            slideImage(slide, slideConfig, this.index, function () {
              var img = slide.querySelector('img');
  
              if (slideConfig.draggable) {
                new DragSlides({
                  dragEl: img,
                  toleranceX: settings.dragToleranceX,
                  toleranceY: settings.dragToleranceY,
                  slide: slide,
                  instance: _this.instance
                });
              }
  
              if (slideConfig.zoomable && img.naturalWidth > img.offsetWidth) {
                addClass(img, 'zoomable');
                new ZoomImages(img, slide, function () {
                  _this.instance.resize();
                });
              }
  
              if (isFunction(finalCallback)) {
                finalCallback();
              }
            });
            return;
          }
  
          if (isFunction(finalCallback)) {
            finalCallback();
          }
        }
      }, {
        key: "slideShortDesc",
        value: function slideShortDesc(string) {
          var n = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
          var wordBoundary = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
          var div = document.createElement('div');
          div.innerHTML = string;
          var cleanedString = div.innerText;
          var useWordBoundary = wordBoundary;
          string = cleanedString.trim();
  
          if (string.length <= n) {
            return string;
          }
  
          var subString = string.substr(0, n - 1);
  
          if (!useWordBoundary) {
            return subString;
          }
  
          div = null;
          return subString + '... <a href="#" class="desc-more">' + wordBoundary + '</a>';
        }
      }, {
        key: "descriptionEvents",
        value: function descriptionEvents(desc, data) {
          var _this2 = this;
  
          var moreLink = desc.querySelector('.desc-more');
  
          if (!moreLink) {
            return false;
          }
  
          addEvent('click', {
            onElement: moreLink,
            withCallback: function withCallback(event, target) {
              event.preventDefault();
              var body = document.body;
              var desc = closest(target, '.gslide-desc');
  
              if (!desc) {
                return false;
              }
  
              desc.innerHTML = data.description;
              addClass(body, 'gdesc-open');
              var shortEvent = addEvent('click', {
                onElement: [body, closest(desc, '.gslide-description')],
                withCallback: function withCallback(event, target) {
                  if (event.target.nodeName.toLowerCase() !== 'a') {
                    removeClass(body, 'gdesc-open');
                    addClass(body, 'gdesc-closed');
                    desc.innerHTML = data.smallDescription;
  
                    _this2.descriptionEvents(desc, data);
  
                    setTimeout(function () {
                      removeClass(body, 'gdesc-closed');
                    }, 400);
                    shortEvent.destroy();
                  }
                }
              });
            }
          });
        }
      }, {
        key: "create",
        value: function create() {
          return createHTML(this.instance.settings.slideHTML);
        }
      }, {
        key: "getConfig",
        value: function getConfig() {
          if (!isNode(this.element) && !this.element.hasOwnProperty('draggable')) {
            this.element.draggable = this.instance.settings.draggable;
          }
  
          var parser = new SlideConfigParser(this.instance.settings.slideExtraAttributes);
          this.slideConfig = parser.parseConfig(this.element, this.instance.settings);
          return this.slideConfig;
        }
      }]);
  
      return Slide;
    }();
  
    var _version = '3.1.0';
  
    var isMobile$1 = isMobile();
  
    var isTouch$1 = isTouch();
  
    var html = document.getElementsByTagName('html')[0];
    var defaults = {
      selector: '.glightbox',
      elements: null,
      skin: 'clean',
      theme: 'clean',
      closeButton: true,
      startAt: null,
      autoplayVideos: true,
      autofocusVideos: true,
      descPosition: 'bottom',
      width: '900px',
      height: '506px',
      videosWidth: '960px',
      beforeSlideChange: null,
      afterSlideChange: null,
      beforeSlideLoad: null,
      afterSlideLoad: null,
      slideInserted: null,
      slideRemoved: null,
      slideExtraAttributes: null,
      onOpen: null,
      onClose: null,
      loop: false,
      zoomable: true,
      draggable: true,
      dragAutoSnap: false,
      dragToleranceX: 40,
      dragToleranceY: 65,
      preload: true,
      oneSlidePerOpen: false,
      touchNavigation: true,
      touchFollowAxis: true,
      keyboardNavigation: true,
      closeOnOutsideClick: true,
      plugins: false,
      plyr: {
        css: 'https://cdn.plyr.io/3.6.12/plyr.css',
        js: 'https://cdn.plyr.io/3.6.12/plyr.js',
        config: {
          ratio: '16:9',
          fullscreen: {
            enabled: true,
            iosNative: true
          },
          youtube: {
            noCookie: true,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3
          },
          vimeo: {
            byline: false,
            portrait: false,
            title: false,
            transparent: false
          }
        }
      },
      openEffect: 'zoom',
      closeEffect: 'zoom',
      slideEffect: 'slide',
      moreText: 'See more',
      moreLength: 60,
      cssEfects: {
        fade: {
          "in": 'fadeIn',
          out: 'fadeOut'
        },
        zoom: {
          "in": 'zoomIn',
          out: 'zoomOut'
        },
        slide: {
          "in": 'slideInRight',
          out: 'slideOutLeft'
        },
        slideBack: {
          "in": 'slideInLeft',
          out: 'slideOutRight'
        },
        none: {
          "in": 'none',
          out: 'none'
        }
      },
      svg: {
        close: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve"><g><g><path d="M505.943,6.058c-8.077-8.077-21.172-8.077-29.249,0L6.058,476.693c-8.077,8.077-8.077,21.172,0,29.249C10.096,509.982,15.39,512,20.683,512c5.293,0,10.586-2.019,14.625-6.059L505.943,35.306C514.019,27.23,514.019,14.135,505.943,6.058z"/></g></g><g><g><path d="M505.942,476.694L35.306,6.059c-8.076-8.077-21.172-8.077-29.248,0c-8.077,8.076-8.077,21.171,0,29.248l470.636,470.636c4.038,4.039,9.332,6.058,14.625,6.058c5.293,0,10.587-2.019,14.624-6.057C514.018,497.866,514.018,484.771,505.942,476.694z"/></g></g></svg>',
        next: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"> <g><path d="M360.731,229.075l-225.1-225.1c-5.3-5.3-13.8-5.3-19.1,0s-5.3,13.8,0,19.1l215.5,215.5l-215.5,215.5c-5.3,5.3-5.3,13.8,0,19.1c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-4l225.1-225.1C365.931,242.875,365.931,234.275,360.731,229.075z"/></g></svg>',
        prev: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 477.175 477.175" xml:space="preserve"><g><path d="M145.188,238.575l215.5-215.5c5.3-5.3,5.3-13.8,0-19.1s-13.8-5.3-19.1,0l-225.1,225.1c-5.3,5.3-5.3,13.8,0,19.1l225.1,225c2.6,2.6,6.1,4,9.5,4s6.9-1.3,9.5-4c5.3-5.3,5.3-13.8,0-19.1L145.188,238.575z"/></g></svg>'
      }
    };
    defaults.slideHTML = "<div class=\"gslide\">\n    <div class=\"gslide-inner-content\">\n        <div class=\"ginner-container\">\n            <div class=\"gslide-media\">\n            </div>\n            <div class=\"gslide-description\">\n                <div class=\"gdesc-inner\">\n                    <h4 class=\"gslide-title\"></h4>\n                    <div class=\"gslide-desc\"></div>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>";
    defaults.lightboxHTML = "<div id=\"glightbox-body\" class=\"glightbox-container\" tabindex=\"-1\" role=\"dialog\" aria-hidden=\"false\">\n    <div class=\"gloader visible\"></div>\n    <div class=\"goverlay\"></div>\n    <div class=\"gcontainer\">\n    <div id=\"glightbox-slider\" class=\"gslider\"></div>\n    <button class=\"gclose gbtn\" aria-label=\"Close\" data-taborder=\"3\">{closeSVG}</button>\n    <button class=\"gprev gbtn\" aria-label=\"Previous\" data-taborder=\"2\">{prevSVG}</button>\n    <button class=\"gnext gbtn\" aria-label=\"Next\" data-taborder=\"1\">{nextSVG}</button>\n</div>\n</div>";
  
    var GlightboxInit = function () {
      function GlightboxInit() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  
        _classCallCheck(this, GlightboxInit);
  
        this.customOptions = options;
        this.settings = extend(defaults, options);
        this.effectsClasses = this.getAnimationClasses();
        this.videoPlayers = {};
        this.apiEvents = [];
        this.fullElementsList = false;
      }
  
      _createClass(GlightboxInit, [{
        key: "init",
        value: function init() {
          var _this = this;
  
          var selector = this.getSelector();
  
          if (selector) {
            this.baseEvents = addEvent('click', {
              onElement: selector,
              withCallback: function withCallback(e, target) {
                e.preventDefault();
  
                _this.open(target);
              }
            });
          }
  
          this.elements = this.getElements();
        }
      }, {
        key: "open",
        value: function open() {
          var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
          var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  
          if (this.elements.length === 0) {
            return false;
          }
  
          this.activeSlide = null;
          this.prevActiveSlideIndex = null;
          this.prevActiveSlide = null;
          var index = isNumber(startAt) ? startAt : this.settings.startAt;
  
          if (isNode(element)) {
            var gallery = element.getAttribute('data-gallery');
  
            if (gallery) {
              this.fullElementsList = this.elements;
              this.elements = this.getGalleryElements(this.elements, gallery);
            }
  
            if (isNil(index)) {
              index = this.getElementIndex(element);
  
              if (index < 0) {
                index = 0;
              }
            }
          }
  
          if (!isNumber(index)) {
            index = 0;
          }
  
          this.build();
  
          animateElement(this.overlay, this.settings.openEffect === 'none' ? 'none' : this.settings.cssEfects.fade["in"]);
  
          var body = document.body;
          var scrollBar = window.innerWidth - document.documentElement.clientWidth;
  
          if (scrollBar > 0) {
            var styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.className = 'gcss-styles';
            styleSheet.innerText = ".gscrollbar-fixer {margin-right: ".concat(scrollBar, "px}");
            document.head.appendChild(styleSheet);
  
            addClass(body, 'gscrollbar-fixer');
          }
  
          addClass(body, 'glightbox-open');
  
          addClass(html, 'glightbox-open');
  
          if (isMobile$1) {
            addClass(document.body, 'glightbox-mobile');
  
            this.settings.slideEffect = 'slide';
          }
  
          this.showSlide(index, true);
  
          if (this.elements.length === 1) {
            addClass(this.prevButton, 'glightbox-button-hidden');
  
            addClass(this.nextButton, 'glightbox-button-hidden');
          } else {
            removeClass(this.prevButton, 'glightbox-button-hidden');
  
            removeClass(this.nextButton, 'glightbox-button-hidden');
          }
  
          this.lightboxOpen = true;
          this.trigger('open');
  
          if (isFunction(this.settings.onOpen)) {
            this.settings.onOpen();
          }
  
          if (isTouch$1 && this.settings.touchNavigation) {
            touchNavigation(this);
          }
  
          if (this.settings.keyboardNavigation) {
            keyboardNavigation(this);
          }
        }
      }, {
        key: "openAt",
        value: function openAt() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          this.open(null, index);
        }
      }, {
        key: "showSlide",
        value: function showSlide() {
          var _this2 = this;
  
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var first = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  
          show(this.loader);
  
          this.index = parseInt(index);
          var current = this.slidesContainer.querySelector('.current');
  
          if (current) {
            removeClass(current, 'current');
          }
  
          this.slideAnimateOut();
          var slideNode = this.slidesContainer.querySelectorAll('.gslide')[index];
  
          if (hasClass(slideNode, 'loaded')) {
            this.slideAnimateIn(slideNode, first);
  
            hide(this.loader);
          } else {
            show(this.loader);
  
            var slide = this.elements[index];
            var slideData = {
              index: this.index,
              slide: slideNode,
              slideNode: slideNode,
              slideConfig: slide.slideConfig,
              slideIndex: this.index,
              trigger: slide.node,
              player: null
            };
            this.trigger('slide_before_load', slideData);
            slide.instance.setContent(slideNode, function () {
              hide(_this2.loader);
  
              _this2.resize();
  
              _this2.slideAnimateIn(slideNode, first);
  
              _this2.trigger('slide_after_load', slideData);
            });
          }
  
          this.slideDescription = slideNode.querySelector('.gslide-description');
          this.slideDescriptionContained = this.slideDescription && hasClass(this.slideDescription.parentNode, 'gslide-media');
  
          if (this.settings.preload) {
            this.preloadSlide(index + 1);
            this.preloadSlide(index - 1);
          }
  
          this.updateNavigationClasses();
          this.activeSlide = slideNode;
        }
      }, {
        key: "preloadSlide",
        value: function preloadSlide(index) {
          var _this3 = this;
  
          if (index < 0 || index > this.elements.length - 1) {
            return false;
          }
  
          if (isNil(this.elements[index])) {
            return false;
          }
  
          var slideNode = this.slidesContainer.querySelectorAll('.gslide')[index];
  
          if (hasClass(slideNode, 'loaded')) {
            return false;
          }
  
          var slide = this.elements[index];
          var type = slide.type;
          var slideData = {
            index: index,
            slide: slideNode,
            slideNode: slideNode,
            slideConfig: slide.slideConfig,
            slideIndex: index,
            trigger: slide.node,
            player: null
          };
          this.trigger('slide_before_load', slideData);
  
          if (type === 'video' || type === 'external') {
            setTimeout(function () {
              slide.instance.setContent(slideNode, function () {
                _this3.trigger('slide_after_load', slideData);
              });
            }, 200);
          } else {
            slide.instance.setContent(slideNode, function () {
              _this3.trigger('slide_after_load', slideData);
            });
          }
        }
      }, {
        key: "prevSlide",
        value: function prevSlide() {
          this.goToSlide(this.index - 1);
        }
      }, {
        key: "nextSlide",
        value: function nextSlide() {
          this.goToSlide(this.index + 1);
        }
      }, {
        key: "goToSlide",
        value: function goToSlide() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
          this.prevActiveSlide = this.activeSlide;
          this.prevActiveSlideIndex = this.index;
  
          if (!this.loop() && (index < 0 || index > this.elements.length - 1)) {
            return false;
          }
  
          if (index < 0) {
            index = this.elements.length - 1;
          } else if (index >= this.elements.length) {
            index = 0;
          }
  
          this.showSlide(index);
        }
      }, {
        key: "insertSlide",
        value: function insertSlide() {
          var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  
          if (index < 0) {
            index = this.elements.length;
          }
  
          var slide = new Slide(config, this, index);
          var data = slide.getConfig();
  
          var slideInfo = extend({}, data);
  
          var newSlide = slide.create();
          var totalSlides = this.elements.length - 1;
          slideInfo.index = index;
          slideInfo.node = false;
          slideInfo.instance = slide;
          slideInfo.slideConfig = data;
          this.elements.splice(index, 0, slideInfo);
          var addedSlideNode = null;
          var addedSlidePlayer = null;
  
          if (this.slidesContainer) {
            if (index > totalSlides) {
              this.slidesContainer.appendChild(newSlide);
            } else {
              var existingSlide = this.slidesContainer.querySelectorAll('.gslide')[index];
              this.slidesContainer.insertBefore(newSlide, existingSlide);
            }
  
            if (this.settings.preload && this.index == 0 && index == 0 || this.index - 1 == index || this.index + 1 == index) {
              this.preloadSlide(index);
            }
  
            if (this.index === 0 && index === 0) {
              this.index = 1;
            }
  
            this.updateNavigationClasses();
            addedSlideNode = this.slidesContainer.querySelectorAll('.gslide')[index];
            addedSlidePlayer = this.getSlidePlayerInstance(index);
            slideInfo.slideNode = addedSlideNode;
          }
  
          this.trigger('slide_inserted', {
            index: index,
            slide: addedSlideNode,
            slideNode: addedSlideNode,
            slideConfig: data,
            slideIndex: index,
            trigger: null,
            player: addedSlidePlayer
          });
  
          if (isFunction(this.settings.slideInserted)) {
            this.settings.slideInserted({
              index: index,
              slide: addedSlideNode,
              player: addedSlidePlayer
            });
          }
        }
      }, {
        key: "removeSlide",
        value: function removeSlide() {
          var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : -1;
  
          if (index < 0 || index > this.elements.length - 1) {
            return false;
          }
  
          var slide = this.slidesContainer && this.slidesContainer.querySelectorAll('.gslide')[index];
  
          if (slide) {
            if (this.getActiveSlideIndex() == index) {
              if (index == this.elements.length - 1) {
                this.prevSlide();
              } else {
                this.nextSlide();
              }
            }
  
            slide.parentNode.removeChild(slide);
          }
  
          this.elements.splice(index, 1);
          this.trigger('slide_removed', index);
  
          if (isFunction(this.settings.slideRemoved)) {
            this.settings.slideRemoved(index);
          }
        }
      }, {
        key: "slideAnimateIn",
        value: function slideAnimateIn(slide, first) {
          var _this4 = this;
  
          var slideMedia = slide.querySelector('.gslide-media');
          var slideDesc = slide.querySelector('.gslide-description');
          var prevData = {
            index: this.prevActiveSlideIndex,
            slide: this.prevActiveSlide,
            slideNode: this.prevActiveSlide,
            slideIndex: this.prevActiveSlide,
            slideConfig: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].slideConfig,
            trigger: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].node,
            player: this.getSlidePlayerInstance(this.prevActiveSlideIndex)
          };
          var nextData = {
            index: this.index,
            slide: this.activeSlide,
            slideNode: this.activeSlide,
            slideConfig: this.elements[this.index].slideConfig,
            slideIndex: this.index,
            trigger: this.elements[this.index].node,
            player: this.getSlidePlayerInstance(this.index)
          };
  
          if (slideMedia.offsetWidth > 0 && slideDesc) {
            hide(slideDesc);
  
            slideDesc.style.display = '';
          }
  
          removeClass(slide, this.effectsClasses);
  
          if (first) {
            animateElement(slide, this.settings.cssEfects[this.settings.openEffect]["in"], function () {
              if (_this4.settings.autoplayVideos) {
                _this4.slidePlayerPlay(slide);
              }
  
              _this4.trigger('slide_changed', {
                prev: prevData,
                current: nextData
              });
  
              if (isFunction(_this4.settings.afterSlideChange)) {
                _this4.settings.afterSlideChange.apply(_this4, [prevData, nextData]);
              }
            });
          } else {
            var effectName = this.settings.slideEffect;
            var animIn = effectName !== 'none' ? this.settings.cssEfects[effectName]["in"] : effectName;
  
            if (this.prevActiveSlideIndex > this.index) {
              if (this.settings.slideEffect == 'slide') {
                animIn = this.settings.cssEfects.slideBack["in"];
              }
            }
  
            animateElement(slide, animIn, function () {
              if (_this4.settings.autoplayVideos) {
                _this4.slidePlayerPlay(slide);
              }
  
              _this4.trigger('slide_changed', {
                prev: prevData,
                current: nextData
              });
  
              if (isFunction(_this4.settings.afterSlideChange)) {
                _this4.settings.afterSlideChange.apply(_this4, [prevData, nextData]);
              }
            });
          }
  
          setTimeout(function () {
            _this4.resize(slide);
          }, 100);
  
          addClass(slide, 'current');
        }
      }, {
        key: "slideAnimateOut",
        value: function slideAnimateOut() {
          if (!this.prevActiveSlide) {
            return false;
          }
  
          var prevSlide = this.prevActiveSlide;
  
          removeClass(prevSlide, this.effectsClasses);
  
          addClass(prevSlide, 'prev');
  
          var animation = this.settings.slideEffect;
          var animOut = animation !== 'none' ? this.settings.cssEfects[animation].out : animation;
          this.slidePlayerPause(prevSlide);
          this.trigger('slide_before_change', {
            prev: {
              index: this.prevActiveSlideIndex,
              slide: this.prevActiveSlide,
              slideNode: this.prevActiveSlide,
              slideIndex: this.prevActiveSlideIndex,
              slideConfig: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].slideConfig,
              trigger: isNil(this.prevActiveSlideIndex) ? null : this.elements[this.prevActiveSlideIndex].node,
              player: this.getSlidePlayerInstance(this.prevActiveSlideIndex)
            },
            current: {
              index: this.index,
              slide: this.activeSlide,
              slideNode: this.activeSlide,
              slideIndex: this.index,
              slideConfig: this.elements[this.index].slideConfig,
              trigger: this.elements[this.index].node,
              player: this.getSlidePlayerInstance(this.index)
            }
          });
  
          if (isFunction(this.settings.beforeSlideChange)) {
            this.settings.beforeSlideChange.apply(this, [{
              index: this.prevActiveSlideIndex,
              slide: this.prevActiveSlide,
              player: this.getSlidePlayerInstance(this.prevActiveSlideIndex)
            }, {
              index: this.index,
              slide: this.activeSlide,
              player: this.getSlidePlayerInstance(this.index)
            }]);
          }
  
          if (this.prevActiveSlideIndex > this.index && this.settings.slideEffect == 'slide') {
            animOut = this.settings.cssEfects.slideBack.out;
          }
  
          animateElement(prevSlide, animOut, function () {
            var container = prevSlide.querySelector('.ginner-container');
            var media = prevSlide.querySelector('.gslide-media');
            var desc = prevSlide.querySelector('.gslide-description');
            container.style.transform = '';
            media.style.transform = '';
  
            removeClass(media, 'greset');
  
            media.style.opacity = '';
  
            if (desc) {
              desc.style.opacity = '';
            }
  
            removeClass(prevSlide, 'prev');
          });
        }
      }, {
        key: "getAllPlayers",
        value: function getAllPlayers() {
          return this.videoPlayers;
        }
      }, {
        key: "getSlidePlayerInstance",
        value: function getSlidePlayerInstance(index) {
          var id = 'gvideo' + index;
          var videoPlayers = this.getAllPlayers();
  
          if (has(videoPlayers, id) && videoPlayers[id]) {
            return videoPlayers[id];
          }
  
          return false;
        }
      }, {
        key: "stopSlideVideo",
        value: function stopSlideVideo(slide) {
          if (isNode(slide)) {
            var node = slide.querySelector('.gvideo-wrapper');
  
            if (node) {
              slide = node.getAttribute('data-index');
            }
          }
  
          console.log('stopSlideVideo is deprecated, use slidePlayerPause');
          var player = this.getSlidePlayerInstance(slide);
  
          if (player && player.playing) {
            player.pause();
          }
        }
      }, {
        key: "slidePlayerPause",
        value: function slidePlayerPause(slide) {
          if (isNode(slide)) {
            var node = slide.querySelector('.gvideo-wrapper');
  
            if (node) {
              slide = node.getAttribute('data-index');
            }
          }
  
          var player = this.getSlidePlayerInstance(slide);
  
          if (player && player.playing) {
            player.pause();
          }
        }
      }, {
        key: "playSlideVideo",
        value: function playSlideVideo(slide) {
          if (isNode(slide)) {
            var node = slide.querySelector('.gvideo-wrapper');
  
            if (node) {
              slide = node.getAttribute('data-index');
            }
          }
  
          console.log('playSlideVideo is deprecated, use slidePlayerPlay');
          var player = this.getSlidePlayerInstance(slide);
  
          if (player && !player.playing) {
            player.play();
          }
        }
      }, {
        key: "slidePlayerPlay",
        value: function slidePlayerPlay(slide) {
          var _this$settings$plyr$c;
  
          if (isMobile$1 && !((_this$settings$plyr$c = this.settings.plyr.config) !== null && _this$settings$plyr$c !== void 0 && _this$settings$plyr$c.muted)) {
            return;
          }
  
          if (isNode(slide)) {
            var node = slide.querySelector('.gvideo-wrapper');
  
            if (node) {
              slide = node.getAttribute('data-index');
            }
          }
  
          var player = this.getSlidePlayerInstance(slide);
  
          if (player && !player.playing) {
            player.play();
  
            if (this.settings.autofocusVideos) {
              player.elements.container.focus();
            }
          }
        }
      }, {
        key: "setElements",
        value: function setElements(elements) {
          var _this5 = this;
  
          this.settings.elements = false;
          var newElements = [];
  
          if (elements && elements.length) {
            each(elements, function (el, i) {
              var slide = new Slide(el, _this5, i);
              var data = slide.getConfig();
  
              var slideInfo = extend({}, data);
  
              slideInfo.slideConfig = data;
              slideInfo.instance = slide;
              slideInfo.index = i;
              newElements.push(slideInfo);
            });
          }
  
          this.elements = newElements;
  
          if (this.lightboxOpen) {
            this.slidesContainer.innerHTML = '';
  
            if (this.elements.length) {
              each(this.elements, function () {
                var slide = createHTML(_this5.settings.slideHTML);
  
                _this5.slidesContainer.appendChild(slide);
              });
  
              this.showSlide(0, true);
            }
          }
        }
      }, {
        key: "getElementIndex",
        value: function getElementIndex(node) {
          var index = false;
  
          each(this.elements, function (el, i) {
            if (has(el, 'node') && el.node == node) {
              index = i;
              return true;
            }
          });
  
          return index;
        }
      }, {
        key: "getElements",
        value: function getElements() {
          var _this6 = this;
  
          var list = [];
          this.elements = this.elements ? this.elements : [];
  
          if (!isNil(this.settings.elements) && isArray(this.settings.elements) && this.settings.elements.length) {
            each(this.settings.elements, function (el, i) {
              var slide = new Slide(el, _this6, i);
              var elData = slide.getConfig();
  
              var slideInfo = extend({}, elData);
  
              slideInfo.node = false;
              slideInfo.index = i;
              slideInfo.instance = slide;
              slideInfo.slideConfig = elData;
              list.push(slideInfo);
            });
          }
  
          var nodes = false;
          var selector = this.getSelector();
  
          if (selector) {
            nodes = document.querySelectorAll(this.getSelector());
          }
  
          if (!nodes) {
            return list;
          }
  
          each(nodes, function (el, i) {
            var slide = new Slide(el, _this6, i);
            var elData = slide.getConfig();
  
            var slideInfo = extend({}, elData);
  
            slideInfo.node = el;
            slideInfo.index = i;
            slideInfo.instance = slide;
            slideInfo.slideConfig = elData;
            slideInfo.gallery = el.getAttribute('data-gallery');
            list.push(slideInfo);
          });
  
          return list;
        }
      }, {
        key: "getGalleryElements",
        value: function getGalleryElements(list, gallery) {
          return list.filter(function (el) {
            return el.gallery == gallery;
          });
        }
      }, {
        key: "getSelector",
        value: function getSelector() {
          if (this.settings.elements) {
            return false;
          }
  
          if (this.settings.selector && this.settings.selector.substring(0, 5) == 'data-') {
            return "*[".concat(this.settings.selector, "]");
          }
  
          return this.settings.selector;
        }
      }, {
        key: "getActiveSlide",
        value: function getActiveSlide() {
          return this.slidesContainer.querySelectorAll('.gslide')[this.index];
        }
      }, {
        key: "getActiveSlideIndex",
        value: function getActiveSlideIndex() {
          return this.index;
        }
      }, {
        key: "getAnimationClasses",
        value: function getAnimationClasses() {
          var effects = [];
  
          for (var key in this.settings.cssEfects) {
            if (this.settings.cssEfects.hasOwnProperty(key)) {
              var effect = this.settings.cssEfects[key];
              effects.push("g".concat(effect["in"]));
              effects.push("g".concat(effect.out));
            }
          }
  
          return effects.join(' ');
        }
      }, {
        key: "build",
        value: function build() {
          var _this7 = this;
  
          if (this.built) {
            return false;
          }
  
          var children = document.body.childNodes;
          var bodyChildElms = [];
  
          each(children, function (el) {
            if (el.parentNode == document.body && el.nodeName.charAt(0) !== '#' && el.hasAttribute && !el.hasAttribute('aria-hidden')) {
              bodyChildElms.push(el);
              el.setAttribute('aria-hidden', 'true');
            }
          });
  
          var nextSVG = has(this.settings.svg, 'next') ? this.settings.svg.next : '';
          var prevSVG = has(this.settings.svg, 'prev') ? this.settings.svg.prev : '';
          var closeSVG = has(this.settings.svg, 'close') ? this.settings.svg.close : '';
          var lightboxHTML = this.settings.lightboxHTML;
          lightboxHTML = lightboxHTML.replace(/{nextSVG}/g, nextSVG);
          lightboxHTML = lightboxHTML.replace(/{prevSVG}/g, prevSVG);
          lightboxHTML = lightboxHTML.replace(/{closeSVG}/g, closeSVG);
          lightboxHTML = createHTML(lightboxHTML);
          document.body.appendChild(lightboxHTML);
          var modal = document.getElementById('glightbox-body');
          this.modal = modal;
          var closeButton = modal.querySelector('.gclose');
          this.prevButton = modal.querySelector('.gprev');
          this.nextButton = modal.querySelector('.gnext');
          this.overlay = modal.querySelector('.goverlay');
          this.loader = modal.querySelector('.gloader');
          this.slidesContainer = document.getElementById('glightbox-slider');
          this.bodyHiddenChildElms = bodyChildElms;
          this.events = {};
  
          addClass(this.modal, 'glightbox-' + this.settings.skin);
  
          if (this.settings.closeButton && closeButton) {
            this.events['close'] = addEvent('click', {
              onElement: closeButton,
              withCallback: function withCallback(e, target) {
                e.preventDefault();
  
                _this7.close();
              }
            });
          }
  
          if (closeButton && !this.settings.closeButton) {
            closeButton.parentNode.removeChild(closeButton);
          }
  
          if (this.nextButton) {
            this.events['next'] = addEvent('click', {
              onElement: this.nextButton,
              withCallback: function withCallback(e, target) {
                e.preventDefault();
  
                _this7.nextSlide();
              }
            });
          }
  
          if (this.prevButton) {
            this.events['prev'] = addEvent('click', {
              onElement: this.prevButton,
              withCallback: function withCallback(e, target) {
                e.preventDefault();
  
                _this7.prevSlide();
              }
            });
          }
  
          if (this.settings.closeOnOutsideClick) {
            this.events['outClose'] = addEvent('click', {
              onElement: modal,
              withCallback: function withCallback(e, target) {
                if (!_this7.preventOutsideClick && !hasClass(document.body, 'glightbox-mobile') && !closest(e.target, '.ginner-container')) {
                  if (!closest(e.target, '.gbtn') && !hasClass(e.target, 'gnext') && !hasClass(e.target, 'gprev')) {
                    _this7.close();
                  }
                }
              }
            });
          }
  
          each(this.elements, function (slide, i) {
            _this7.slidesContainer.appendChild(slide.instance.create());
  
            slide.slideNode = _this7.slidesContainer.querySelectorAll('.gslide')[i];
          });
  
          if (isTouch$1) {
            addClass(document.body, 'glightbox-touch');
          }
  
          this.events['resize'] = addEvent('resize', {
            onElement: window,
            withCallback: function withCallback() {
              _this7.resize();
            }
          });
          this.built = true;
        }
      }, {
        key: "resize",
        value: function resize() {
          var slide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
          slide = !slide ? this.activeSlide : slide;
  
          if (!slide || hasClass(slide, 'zoomed')) {
            return;
          }
  
          var winSize = windowSize();
  
          var video = slide.querySelector('.gvideo-wrapper');
          var image = slide.querySelector('.gslide-image');
          var description = this.slideDescription;
          var winWidth = winSize.width;
          var winHeight = winSize.height;
  
          if (winWidth <= 768) {
            addClass(document.body, 'glightbox-mobile');
          } else {
            removeClass(document.body, 'glightbox-mobile');
          }
  
          if (!video && !image) {
            return;
          }
  
          var descriptionResize = false;
  
          if (description && (hasClass(description, 'description-bottom') || hasClass(description, 'description-top')) && !hasClass(description, 'gabsolute')) {
            descriptionResize = true;
          }
  
          if (image) {
            if (winWidth <= 768) {
              var imgNode = image.querySelector('img');
            } else if (descriptionResize) {
              var descHeight = description.offsetHeight;
  
              var _imgNode = image.querySelector('img');
  
              _imgNode.setAttribute('style', "max-height: calc(100vh - ".concat(descHeight, "px)"));
  
              description.setAttribute('style', "max-width: ".concat(_imgNode.offsetWidth, "px;"));
            }
          }
  
          if (video) {
            var ratio = has(this.settings.plyr.config, 'ratio') ? this.settings.plyr.config.ratio : '';
  
            if (!ratio) {
              var containerWidth = video.clientWidth;
              var containerHeight = video.clientHeight;
              var divisor = containerWidth / containerHeight;
              ratio = "".concat(containerWidth / divisor, ":").concat(containerHeight / divisor);
            }
  
            var videoRatio = ratio.split(':');
            var videoWidth = this.settings.videosWidth;
            var maxWidth = this.settings.videosWidth;
  
            if (isNumber(videoWidth) || videoWidth.indexOf('px') !== -1) {
              maxWidth = parseInt(videoWidth);
            } else {
              if (videoWidth.indexOf('vw') !== -1) {
                maxWidth = winWidth * parseInt(videoWidth) / 100;
              } else if (videoWidth.indexOf('vh') !== -1) {
                maxWidth = winHeight * parseInt(videoWidth) / 100;
              } else if (videoWidth.indexOf('%') !== -1) {
                maxWidth = winWidth * parseInt(videoWidth) / 100;
              } else {
                maxWidth = parseInt(video.clientWidth);
              }
            }
  
            var maxHeight = maxWidth / (parseInt(videoRatio[0]) / parseInt(videoRatio[1]));
            maxHeight = Math.floor(maxHeight);
  
            if (descriptionResize) {
              winHeight = winHeight - description.offsetHeight;
            }
  
            if (maxWidth > winWidth || maxHeight > winHeight || winHeight < maxHeight && winWidth > maxWidth) {
              var vwidth = video.offsetWidth;
              var vheight = video.offsetHeight;
  
              var _ratio = winHeight / vheight;
  
              var vsize = {
                width: vwidth * _ratio,
                height: vheight * _ratio
              };
              video.parentNode.setAttribute('style', "max-width: ".concat(vsize.width, "px"));
  
              if (descriptionResize) {
                description.setAttribute('style', "max-width: ".concat(vsize.width, "px;"));
              }
            } else {
              video.parentNode.style.maxWidth = "".concat(videoWidth);
  
              if (descriptionResize) {
                description.setAttribute('style', "max-width: ".concat(videoWidth, ";"));
              }
            }
          }
        }
      }, {
        key: "reload",
        value: function reload() {
          this.init();
        }
      }, {
        key: "updateNavigationClasses",
        value: function updateNavigationClasses() {
          var loop = this.loop();
  
          removeClass(this.nextButton, 'disabled');
  
          removeClass(this.prevButton, 'disabled');
  
          if (this.index == 0 && this.elements.length - 1 == 0) {
            addClass(this.prevButton, 'disabled');
  
            addClass(this.nextButton, 'disabled');
          } else if (this.index === 0 && !loop) {
            addClass(this.prevButton, 'disabled');
          } else if (this.index === this.elements.length - 1 && !loop) {
            addClass(this.nextButton, 'disabled');
          }
        }
      }, {
        key: "loop",
        value: function loop() {
          var loop = has(this.settings, 'loopAtEnd') ? this.settings.loopAtEnd : null;
          loop = has(this.settings, 'loop') ? this.settings.loop : loop;
          return loop;
        }
      }, {
        key: "close",
        value: function close() {
          var _this8 = this;
  
          if (!this.lightboxOpen) {
            if (this.events) {
              for (var key in this.events) {
                if (this.events.hasOwnProperty(key)) {
                  this.events[key].destroy();
                }
              }
  
              this.events = null;
            }
  
            return false;
          }
  
          if (this.closing) {
            return false;
          }
  
          this.closing = true;
          this.slidePlayerPause(this.activeSlide);
  
          if (this.fullElementsList) {
            this.elements = this.fullElementsList;
          }
  
          if (this.bodyHiddenChildElms.length) {
            each(this.bodyHiddenChildElms, function (el) {
              el.removeAttribute('aria-hidden');
            });
          }
  
          addClass(this.modal, 'glightbox-closing');
  
          animateElement(this.overlay, this.settings.openEffect == 'none' ? 'none' : this.settings.cssEfects.fade.out);
  
          animateElement(this.activeSlide, this.settings.cssEfects[this.settings.closeEffect].out, function () {
            _this8.activeSlide = null;
            _this8.prevActiveSlideIndex = null;
            _this8.prevActiveSlide = null;
            _this8.built = false;
  
            if (_this8.events) {
              for (var _key in _this8.events) {
                if (_this8.events.hasOwnProperty(_key)) {
                  _this8.events[_key].destroy();
                }
              }
  
              _this8.events = null;
            }
  
            var body = document.body;
  
            removeClass(html, 'glightbox-open');
  
            removeClass(body, 'glightbox-open touching gdesc-open glightbox-touch glightbox-mobile gscrollbar-fixer');
  
            _this8.modal.parentNode.removeChild(_this8.modal);
  
            _this8.trigger('close');
  
            if (isFunction(_this8.settings.onClose)) {
              _this8.settings.onClose();
            }
  
            var styles = document.querySelector('.gcss-styles');
  
            if (styles) {
              styles.parentNode.removeChild(styles);
            }
  
            _this8.lightboxOpen = false;
            _this8.closing = null;
          });
        }
      }, {
        key: "destroy",
        value: function destroy() {
          this.close();
          this.clearAllEvents();
  
          if (this.baseEvents) {
            this.baseEvents.destroy();
          }
        }
      }, {
        key: "on",
        value: function on(evt, callback) {
          var once = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  
          if (!evt || !isFunction(callback)) {
            throw new TypeError('Event name and callback must be defined');
          }
  
          this.apiEvents.push({
            evt: evt,
            once: once,
            callback: callback
          });
        }
      }, {
        key: "once",
        value: function once(evt, callback) {
          this.on(evt, callback, true);
        }
      }, {
        key: "trigger",
        value: function trigger(eventName) {
          var _this9 = this;
  
          var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var onceTriggered = [];
  
          each(this.apiEvents, function (event, i) {
            var evt = event.evt,
                once = event.once,
                callback = event.callback;
  
            if (evt == eventName) {
              callback(data);
  
              if (once) {
                onceTriggered.push(i);
              }
            }
          });
  
          if (onceTriggered.length) {
            each(onceTriggered, function (i) {
              return _this9.apiEvents.splice(i, 1);
            });
          }
        }
      }, {
        key: "clearAllEvents",
        value: function clearAllEvents() {
          this.apiEvents.splice(0, this.apiEvents.length);
        }
      }, {
        key: "version",
        value: function version() {
          return _version;
        }
      }]);
  
      return GlightboxInit;
    }();
  
    function glightbox () {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var instance = new GlightboxInit(options);
      instance.init();
      return instance;
    }
  
    return glightbox;
  
  })));
  
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bootstrap = factory());
  })(this, (function () { 'use strict';
  
    
    const MAX_UID = 1000000;
    const MILLISECONDS_MULTIPLIER = 1000;
    const TRANSITION_END = 'transitionend'; 
  
    const toType = object => {
      if (object === null || object === undefined) {
        return `${object}`;
      }
  
      return Object.prototype.toString.call(object).match(/\s([a-z]+)/i)[1].toLowerCase();
    };
    /**
     * Public Util API
     */
  
  
    const getUID = prefix => {
      do {
        prefix += Math.floor(Math.random() * MAX_UID);
      } while (document.getElementById(prefix));
  
      return prefix;
    };
  
    const getSelector = element => {
      let selector = element.getAttribute('data-bs-target');
  
      if (!selector || selector === '#') {
        let hrefAttribute = element.getAttribute('href'); 
        if (!hrefAttribute || !hrefAttribute.includes('#') && !hrefAttribute.startsWith('.')) {
          return null;
        } // Just in case some CMS puts out a full URL with the anchor appended
  
  
        if (hrefAttribute.includes('#') && !hrefAttribute.startsWith('#')) {
          hrefAttribute = `#${hrefAttribute.split('#')[1]}`;
        }
  
        selector = hrefAttribute && hrefAttribute !== '#' ? hrefAttribute.trim() : null;
      }
  
      return selector;
    };
  
    const getSelectorFromElement = element => {
      const selector = getSelector(element);
  
      if (selector) {
        return document.querySelector(selector) ? selector : null;
      }
  
      return null;
    };
  
    const getElementFromSelector = element => {
      const selector = getSelector(element);
      return selector ? document.querySelector(selector) : null;
    };
  
    const getTransitionDurationFromElement = element => {
      if (!element) {
        return 0;
      } // Get transition-duration of the element
  
  
      let {
        transitionDuration,
        transitionDelay
      } = window.getComputedStyle(element);
      const floatTransitionDuration = Number.parseFloat(transitionDuration);
      const floatTransitionDelay = Number.parseFloat(transitionDelay); // Return 0 if element or transition duration is not found
  
      if (!floatTransitionDuration && !floatTransitionDelay) {
        return 0;
      } // If multiple durations are defined, take the first
  
  
      transitionDuration = transitionDuration.split(',')[0];
      transitionDelay = transitionDelay.split(',')[0];
      return (Number.parseFloat(transitionDuration) + Number.parseFloat(transitionDelay)) * MILLISECONDS_MULTIPLIER;
    };
  
    const triggerTransitionEnd = element => {
      element.dispatchEvent(new Event(TRANSITION_END));
    };
  
    const isElement$1 = object => {
      if (!object || typeof object !== 'object') {
        return false;
      }
  
      if (typeof object.jquery !== 'undefined') {
        object = object[0];
      }
  
      return typeof object.nodeType !== 'undefined';
    };
  
    const getElement = object => {
      // it's a jQuery object or a node element
      if (isElement$1(object)) {
        return object.jquery ? object[0] : object;
      }
  
      if (typeof object === 'string' && object.length > 0) {
        return document.querySelector(object);
      }
  
      return null;
    };
  
    const isVisible = element => {
      if (!isElement$1(element) || element.getClientRects().length === 0) {
        return false;
      }
  
      const elementIsVisible = getComputedStyle(element).getPropertyValue('visibility') === 'visible'; // Handle `details` element as its content may falsie appear visible when it is closed
  
      const closedDetails = element.closest('details:not([open])');
  
      if (!closedDetails) {
        return elementIsVisible;
      }
  
      if (closedDetails !== element) {
        const summary = element.closest('summary');
  
        if (summary && summary.parentNode !== closedDetails) {
          return false;
        }
  
        if (summary === null) {
          return false;
        }
      }
  
      return elementIsVisible;
    };
  
    const isDisabled = element => {
      if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        return true;
      }
  
      if (element.classList.contains('disabled')) {
        return true;
      }
  
      if (typeof element.disabled !== 'undefined') {
        return element.disabled;
      }
  
      return element.hasAttribute('disabled') && element.getAttribute('disabled') !== 'false';
    };
  
    const findShadowRoot = element => {
      if (!document.documentElement.attachShadow) {
        return null;
      } // Can find the shadow root otherwise it'll return the document
  
  
      if (typeof element.getRootNode === 'function') {
        const root = element.getRootNode();
        return root instanceof ShadowRoot ? root : null;
      }
  
      if (element instanceof ShadowRoot) {
        return element;
      } // when we don't find a shadow root
  
  
      if (!element.parentNode) {
        return null;
      }
  
      return findShadowRoot(element.parentNode);
    };
  
    const noop = () => {};
    /**
     * Trick to restart an element's animation
     *
     * @param {HTMLElement} element
     * @return void
     *
     * @see https://www.charistheo.io/blog/2021/02/restart-a-css-animation-with-javascript/#restarting-a-css-animation
     */
  
  
    const reflow = element => {
      element.offsetHeight; // eslint-disable-line no-unused-expressions
    };
  
    const getjQuery = () => {
      if (window.jQuery && !document.body.hasAttribute('data-bs-no-jquery')) {
        return window.jQuery;
      }
  
      return null;
    };
  
    const DOMContentLoadedCallbacks = [];
  
    const onDOMContentLoaded = callback => {
      if (document.readyState === 'loading') {
        // add listener on the first call when the document is in loading state
        if (!DOMContentLoadedCallbacks.length) {
          document.addEventListener('DOMContentLoaded', () => {
            for (const callback of DOMContentLoadedCallbacks) {
              callback();
            }
          });
        }
  
        DOMContentLoadedCallbacks.push(callback);
      } else {
        callback();
      }
    };
  
    const isRTL = () => document.documentElement.dir === 'rtl';
  
    const defineJQueryPlugin = plugin => {
      onDOMContentLoaded(() => {
        const $ = getjQuery();
        /* istanbul ignore if */
  
        if ($) {
          const name = plugin.NAME;
          const JQUERY_NO_CONFLICT = $.fn[name];
          $.fn[name] = plugin.jQueryInterface;
          $.fn[name].Constructor = plugin;
  
          $.fn[name].noConflict = () => {
            $.fn[name] = JQUERY_NO_CONFLICT;
            return plugin.jQueryInterface;
          };
        }
      });
    };
  
    const execute = callback => {
      if (typeof callback === 'function') {
        callback();
      }
    };
  
    const executeAfterTransition = (callback, transitionElement, waitForTransition = true) => {
      if (!waitForTransition) {
        execute(callback);
        return;
      }
  
      const durationPadding = 5;
      const emulatedDuration = getTransitionDurationFromElement(transitionElement) + durationPadding;
      let called = false;
  
      const handler = ({
        target
      }) => {
        if (target !== transitionElement) {
          return;
        }
  
        called = true;
        transitionElement.removeEventListener(TRANSITION_END, handler);
        execute(callback);
      };
  
      transitionElement.addEventListener(TRANSITION_END, handler);
      setTimeout(() => {
        if (!called) {
          triggerTransitionEnd(transitionElement);
        }
      }, emulatedDuration);
    };
    /**
     * Return the previous/next element of a list.
     *
     * @param {array} list    The list of elements
     * @param activeElement   The active element
     * @param shouldGetNext   Choose to get next or previous element
     * @param isCycleAllowed
     * @return {Element|elem} The proper element
     */
  
  
    const getNextActiveElement = (list, activeElement, shouldGetNext, isCycleAllowed) => {
      const listLength = list.length;
      let index = list.indexOf(activeElement); // if the element does not exist in the list return an element
      // depending on the direction and if cycle is allowed
  
      if (index === -1) {
        return !shouldGetNext && isCycleAllowed ? list[listLength - 1] : list[0];
      }
  
      index += shouldGetNext ? 1 : -1;
  
      if (isCycleAllowed) {
        index = (index + listLength) % listLength;
      }
  
      return list[Math.max(0, Math.min(index, listLength - 1))];
    };
  
  
  
    const namespaceRegex = /[^.]*(?=\..*)\.|.*/;
    const stripNameRegex = /\..*/;
    const stripUidRegex = /::\d+$/;
    const eventRegistry = {}; // Events storage
  
    let uidEvent = 1;
    const customEvents = {
      mouseenter: 'mouseover',
      mouseleave: 'mouseout'
    };
    const nativeEvents = new Set(['click', 'dblclick', 'mouseup', 'mousedown', 'contextmenu', 'mousewheel', 'DOMMouseScroll', 'mouseover', 'mouseout', 'mousemove', 'selectstart', 'selectend', 'keydown', 'keypress', 'keyup', 'orientationchange', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'pointerdown', 'pointermove', 'pointerup', 'pointerleave', 'pointercancel', 'gesturestart', 'gesturechange', 'gestureend', 'focus', 'blur', 'change', 'reset', 'select', 'submit', 'focusin', 'focusout', 'load', 'unload', 'beforeunload', 'resize', 'move', 'DOMContentLoaded', 'readystatechange', 'error', 'abort', 'scroll']);
    /**
     * Private methods
     */
  
    function makeEventUid(element, uid) {
      return uid && `${uid}::${uidEvent++}` || element.uidEvent || uidEvent++;
    }
  
    function getElementEvents(element) {
      const uid = makeEventUid(element);
      element.uidEvent = uid;
      eventRegistry[uid] = eventRegistry[uid] || {};
      return eventRegistry[uid];
    }
  
    function bootstrapHandler(element, fn) {
      return function handler(event) {
        hydrateObj(event, {
          delegateTarget: element
        });
  
        if (handler.oneOff) {
          EventHandler.off(element, event.type, fn);
        }
  
        return fn.apply(element, [event]);
      };
    }
  
    function bootstrapDelegationHandler(element, selector, fn) {
      return function handler(event) {
        const domElements = element.querySelectorAll(selector);
  
        for (let {
          target
        } = event; target && target !== this; target = target.parentNode) {
          for (const domElement of domElements) {
            if (domElement !== target) {
              continue;
            }
  
            hydrateObj(event, {
              delegateTarget: target
            });
  
            if (handler.oneOff) {
              EventHandler.off(element, event.type, selector, fn);
            }
  
            return fn.apply(target, [event]);
          }
        }
      };
    }
  
    function findHandler(events, callable, delegationSelector = null) {
      return Object.values(events).find(event => event.callable === callable && event.delegationSelector === delegationSelector);
    }
  
    function normalizeParameters(originalTypeEvent, handler, delegationFunction) {
      const isDelegated = typeof handler === 'string'; // todo: tooltip passes `false` instead of selector, so we need to check
  
      const callable = isDelegated ? delegationFunction : handler || delegationFunction;
      let typeEvent = getTypeEvent(originalTypeEvent);
  
      if (!nativeEvents.has(typeEvent)) {
        typeEvent = originalTypeEvent;
      }
  
      return [isDelegated, callable, typeEvent];
    }
  
    function addHandler(element, originalTypeEvent, handler, delegationFunction, oneOff) {
      if (typeof originalTypeEvent !== 'string' || !element) {
        return;
      }
  
      let [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction); // in case of mouseenter or mouseleave wrap the handler within a function that checks for its DOM position
      // this prevents the handler from being dispatched the same way as mouseover or mouseout does
  
      if (originalTypeEvent in customEvents) {
        const wrapFunction = fn => {
          return function (event) {
            if (!event.relatedTarget || event.relatedTarget !== event.delegateTarget && !event.delegateTarget.contains(event.relatedTarget)) {
              return fn.call(this, event);
            }
          };
        };
  
        callable = wrapFunction(callable);
      }
  
      const events = getElementEvents(element);
      const handlers = events[typeEvent] || (events[typeEvent] = {});
      const previousFunction = findHandler(handlers, callable, isDelegated ? handler : null);
  
      if (previousFunction) {
        previousFunction.oneOff = previousFunction.oneOff && oneOff;
        return;
      }
  
      const uid = makeEventUid(callable, originalTypeEvent.replace(namespaceRegex, ''));
      const fn = isDelegated ? bootstrapDelegationHandler(element, handler, callable) : bootstrapHandler(element, callable);
      fn.delegationSelector = isDelegated ? handler : null;
      fn.callable = callable;
      fn.oneOff = oneOff;
      fn.uidEvent = uid;
      handlers[uid] = fn;
      element.addEventListener(typeEvent, fn, isDelegated);
    }
  
    function removeHandler(element, events, typeEvent, handler, delegationSelector) {
      const fn = findHandler(events[typeEvent], handler, delegationSelector);
  
      if (!fn) {
        return;
      }
  
      element.removeEventListener(typeEvent, fn, Boolean(delegationSelector));
      delete events[typeEvent][fn.uidEvent];
    }
  
    function removeNamespacedHandlers(element, events, typeEvent, namespace) {
      const storeElementEvent = events[typeEvent] || {};
  
      for (const handlerKey of Object.keys(storeElementEvent)) {
        if (handlerKey.includes(namespace)) {
          const event = storeElementEvent[handlerKey];
          removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
        }
      }
    }
  
    function getTypeEvent(event) {
      // allow to get the native events from namespaced events ('click.bs.button' --> 'click')
      event = event.replace(stripNameRegex, '');
      return customEvents[event] || event;
    }
  
    const EventHandler = {
      on(element, event, handler, delegationFunction) {
        addHandler(element, event, handler, delegationFunction, false);
      },
  
      one(element, event, handler, delegationFunction) {
        addHandler(element, event, handler, delegationFunction, true);
      },
  
      off(element, originalTypeEvent, handler, delegationFunction) {
        if (typeof originalTypeEvent !== 'string' || !element) {
          return;
        }
  
        const [isDelegated, callable, typeEvent] = normalizeParameters(originalTypeEvent, handler, delegationFunction);
        const inNamespace = typeEvent !== originalTypeEvent;
        const events = getElementEvents(element);
        const storeElementEvent = events[typeEvent] || {};
        const isNamespace = originalTypeEvent.startsWith('.');
  
        if (typeof callable !== 'undefined') {
          // Simplest case: handler is passed, remove that listener ONLY.
          if (!Object.keys(storeElementEvent).length) {
            return;
          }
  
          removeHandler(element, events, typeEvent, callable, isDelegated ? handler : null);
          return;
        }
  
        if (isNamespace) {
          for (const elementEvent of Object.keys(events)) {
            removeNamespacedHandlers(element, events, elementEvent, originalTypeEvent.slice(1));
          }
        }
  
        for (const keyHandlers of Object.keys(storeElementEvent)) {
          const handlerKey = keyHandlers.replace(stripUidRegex, '');
  
          if (!inNamespace || originalTypeEvent.includes(handlerKey)) {
            const event = storeElementEvent[keyHandlers];
            removeHandler(element, events, typeEvent, event.callable, event.delegationSelector);
          }
        }
      },
  
      trigger(element, event, args) {
        if (typeof event !== 'string' || !element) {
          return null;
        }
  
        const $ = getjQuery();
        const typeEvent = getTypeEvent(event);
        const inNamespace = event !== typeEvent;
        let jQueryEvent = null;
        let bubbles = true;
        let nativeDispatch = true;
        let defaultPrevented = false;
  
        if (inNamespace && $) {
          jQueryEvent = $.Event(event, args);
          $(element).trigger(jQueryEvent);
          bubbles = !jQueryEvent.isPropagationStopped();
          nativeDispatch = !jQueryEvent.isImmediatePropagationStopped();
          defaultPrevented = jQueryEvent.isDefaultPrevented();
        }
  
        let evt = new Event(event, {
          bubbles,
          cancelable: true
        });
        evt = hydrateObj(evt, args);
  
        if (defaultPrevented) {
          evt.preventDefault();
        }
  
        if (nativeDispatch) {
          element.dispatchEvent(evt);
        }
  
        if (evt.defaultPrevented && jQueryEvent) {
          jQueryEvent.preventDefault();
        }
  
        return evt;
      }
  
    };
  
    function hydrateObj(obj, meta) {
      for (const [key, value] of Object.entries(meta || {})) {
        try {
          obj[key] = value;
        } catch (_unused) {
          Object.defineProperty(obj, key, {
            configurable: true,
  
            get() {
              return value;
            }
  
          });
        }
      }
  
      return obj;
    }
  
    const elementMap = new Map();
    const Data = {
      set(element, key, instance) {
        if (!elementMap.has(element)) {
          elementMap.set(element, new Map());
        }
  
        const instanceMap = elementMap.get(element); // make it clear we only want one instance per element
        // can be removed later when multiple key/instances are fine to be used
  
        if (!instanceMap.has(key) && instanceMap.size !== 0) {
          // eslint-disable-next-line no-console
          console.error(` doesn't allow more than one instance per element. Bound instance: ${Array.from(instanceMap.keys())[0]}.`);
          return;
        }
  
        instanceMap.set(key, instance);
      },
  
      get(element, key) {
        if (elementMap.has(element)) {
          return elementMap.get(element).get(key) || null;
        }
  
        return null;
      },
  
      remove(element, key) {
        if (!elementMap.has(element)) {
          return;
        }
  
        const instanceMap = elementMap.get(element);
        instanceMap.delete(key); // free up element references if there are no instances left for an element
  
        if (instanceMap.size === 0) {
          elementMap.delete(element);
        }
      }
  
    };
  
    
    function normalizeData(value) {
      if (value === 'true') {
        return true;
      }
  
      if (value === 'false') {
        return false;
      }
  
      if (value === Number(value).toString()) {
        return Number(value);
      }
  
      if (value === '' || value === 'null') {
        return null;
      }
  
      if (typeof value !== 'string') {
        return value;
      }
  
      try {
        return JSON.parse(decodeURIComponent(value));
      } catch (_unused) {
        return value;
      }
    }
  
    function normalizeDataKey(key) {
      return key.replace(/[A-Z]/g, chr => `-${chr.toLowerCase()}`);
    }
  
    const Manipulator = {
      setDataAttribute(element, key, value) {
        element.setAttribute(`data-bs-${normalizeDataKey(key)}`, value);
      },
  
      removeDataAttribute(element, key) {
        element.removeAttribute(`data-bs-${normalizeDataKey(key)}`);
      },
  
      getDataAttributes(element) {
        if (!element) {
          return {};
        }
  
        const attributes = {};
        const bsKeys = Object.keys(element.dataset).filter(key => key.startsWith('bs') && !key.startsWith('bsConfig'));
  
        for (const key of bsKeys) {
          let pureKey = key.replace(/^bs/, '');
          pureKey = pureKey.charAt(0).toLowerCase() + pureKey.slice(1, pureKey.length);
          attributes[pureKey] = normalizeData(element.dataset[key]);
        }
  
        return attributes;
      },
  
      getDataAttribute(element, key) {
        return normalizeData(element.getAttribute(`data-bs-${normalizeDataKey(key)}`));
      }
  
    };
  
  
  
    class Config {
      // Getters
      static get Default() {
        return {};
      }
  
      static get DefaultType() {
        return {};
      }
  
      static get NAME() {
        throw new Error('You have to implement the static method "NAME", for each component!');
      }
  
      _getConfig(config) {
        config = this._mergeConfigObj(config);
        config = this._configAfterMerge(config);
  
        this._typeCheckConfig(config);
  
        return config;
      }
  
      _configAfterMerge(config) {
        return config;
      }
  
      _mergeConfigObj(config, element) {
        const jsonConfig = isElement$1(element) ? Manipulator.getDataAttribute(element, 'config') : {}; // try to parse
  
        return { ...this.constructor.Default,
          ...(typeof jsonConfig === 'object' ? jsonConfig : {}),
          ...(isElement$1(element) ? Manipulator.getDataAttributes(element) : {}),
          ...(typeof config === 'object' ? config : {})
        };
      }
  
      _typeCheckConfig(config, configTypes = this.constructor.DefaultType) {
        for (const property of Object.keys(configTypes)) {
          const expectedTypes = configTypes[property];
          const value = config[property];
          const valueType = isElement$1(value) ? 'element' : toType(value);
  
          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new TypeError(`${this.constructor.NAME.toUpperCase()}: Option "${property}" provided type "${valueType}" but expected type "${expectedTypes}".`);
          }
        }
      }
  
    }
  
   
  
    const VERSION = '5.2.0';
    /**
     * Class definition
     */
  
    class BaseComponent extends Config {
      constructor(element, config) {
        super();
        element = getElement(element);
  
        if (!element) {
          return;
        }
  
        this._element = element;
        this._config = this._getConfig(config);
        Data.set(this._element, this.constructor.DATA_KEY, this);
      } // Public
  
  
      dispose() {
        Data.remove(this._element, this.constructor.DATA_KEY);
        EventHandler.off(this._element, this.constructor.EVENT_KEY);
  
        for (const propertyName of Object.getOwnPropertyNames(this)) {
          this[propertyName] = null;
        }
      }
  
      _queueCallback(callback, element, isAnimated = true) {
        executeAfterTransition(callback, element, isAnimated);
      }
  
      _getConfig(config) {
        config = this._mergeConfigObj(config, this._element);
        config = this._configAfterMerge(config);
  
        this._typeCheckConfig(config);
  
        return config;
      } // Static
  
  
      static getInstance(element) {
        return Data.get(getElement(element), this.DATA_KEY);
      }
  
      static getOrCreateInstance(element, config = {}) {
        return this.getInstance(element) || new this(element, typeof config === 'object' ? config : null);
      }
  
      static get VERSION() {
        return VERSION;
      }
  
      static get DATA_KEY() {
        return `bs.${this.NAME}`;
      }
  
      static get EVENT_KEY() {
        return `.${this.DATA_KEY}`;
      }
  
      static eventName(name) {
        return `${name}${this.EVENT_KEY}`;
      }
  
    }
  
  
    const enableDismissTrigger = (component, method = 'hide') => {
      const clickEvent = `click.dismiss${component.EVENT_KEY}`;
      const name = component.NAME;
      EventHandler.on(document, clickEvent, `[data-bs-dismiss="${name}"]`, function (event) {
        if (['A', 'AREA'].includes(this.tagName)) {
          event.preventDefault();
        }
  
        if (isDisabled(this)) {
          return;
        }
  
        const target = getElementFromSelector(this) || this.closest(`.${name}`);
        const instance = component.getOrCreateInstance(target); // Method argument is left, for Alert and only, as it doesn't implement the 'hide' method
  
        instance[method]();
      });
    };
  
  
    const NAME$f = 'alert';
    const DATA_KEY$a = 'bs.alert';
    const EVENT_KEY$b = `.${DATA_KEY$a}`;
    const EVENT_CLOSE = `close${EVENT_KEY$b}`;
    const EVENT_CLOSED = `closed${EVENT_KEY$b}`;
    const CLASS_NAME_FADE$5 = 'fade';
    const CLASS_NAME_SHOW$8 = 'show';
    /**
     * Class definition
     */
  
    class Alert extends BaseComponent {
      // Getters
      static get NAME() {
        return NAME$f;
      } // Public
  
  
      close() {
        const closeEvent = EventHandler.trigger(this._element, EVENT_CLOSE);
  
        if (closeEvent.defaultPrevented) {
          return;
        }
  
        this._element.classList.remove(CLASS_NAME_SHOW$8);
  
        const isAnimated = this._element.classList.contains(CLASS_NAME_FADE$5);
  
        this._queueCallback(() => this._destroyElement(), this._element, isAnimated);
      } // Private
  
  
      _destroyElement() {
        this._element.remove();
  
        EventHandler.trigger(this._element, EVENT_CLOSED);
        this.dispose();
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Alert.getOrCreateInstance(this);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config](this);
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    enableDismissTrigger(Alert, 'close');
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Alert);
  
  
    const NAME$e = 'button';
    const DATA_KEY$9 = 'bs.button';
    const EVENT_KEY$a = `.${DATA_KEY$9}`;
    const DATA_API_KEY$6 = '.data-api';
    const CLASS_NAME_ACTIVE$3 = 'active';
    const SELECTOR_DATA_TOGGLE$5 = '[data-bs-toggle="button"]';
    const EVENT_CLICK_DATA_API$6 = `click${EVENT_KEY$a}${DATA_API_KEY$6}`;
    /**
     * Class definition
     */
  
    class Button extends BaseComponent {
      // Getters
      static get NAME() {
        return NAME$e;
      } // Public
  
  
      toggle() {
        // Toggle class and sync the `aria-pressed` attribute with the return value of the `.toggle()` method
        this._element.setAttribute('aria-pressed', this._element.classList.toggle(CLASS_NAME_ACTIVE$3));
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Button.getOrCreateInstance(this);
  
          if (config === 'toggle') {
            data[config]();
          }
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API$6, SELECTOR_DATA_TOGGLE$5, event => {
      event.preventDefault();
      const button = event.target.closest(SELECTOR_DATA_TOGGLE$5);
      const data = Button.getOrCreateInstance(button);
      data.toggle();
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Button);
  
    
    const SelectorEngine = {
      find(selector, element = document.documentElement) {
        return [].concat(...Element.prototype.querySelectorAll.call(element, selector));
      },
  
      findOne(selector, element = document.documentElement) {
        return Element.prototype.querySelector.call(element, selector);
      },
  
      children(element, selector) {
        return [].concat(...element.children).filter(child => child.matches(selector));
      },
  
      parents(element, selector) {
        const parents = [];
        let ancestor = element.parentNode.closest(selector);
  
        while (ancestor) {
          parents.push(ancestor);
          ancestor = ancestor.parentNode.closest(selector);
        }
  
        return parents;
      },
  
      prev(element, selector) {
        let previous = element.previousElementSibling;
  
        while (previous) {
          if (previous.matches(selector)) {
            return [previous];
          }
  
          previous = previous.previousElementSibling;
        }
  
        return [];
      },
  
      // TODO: this is now unused; remove later along with prev()
      next(element, selector) {
        let next = element.nextElementSibling;
  
        while (next) {
          if (next.matches(selector)) {
            return [next];
          }
  
          next = next.nextElementSibling;
        }
  
        return [];
      },
  
      focusableChildren(element) {
        const focusables = ['a', 'button', 'input', 'textarea', 'select', 'details', '[tabindex]', '[contenteditable="true"]'].map(selector => `${selector}:not([tabindex^="-"])`).join(',');
        return this.find(focusables, element).filter(el => !isDisabled(el) && isVisible(el));
      }
  
    };
  
   
  
    const NAME$d = 'swipe';
    const EVENT_KEY$9 = '.bs.swipe';
    const EVENT_TOUCHSTART = `touchstart${EVENT_KEY$9}`;
    const EVENT_TOUCHMOVE = `touchmove${EVENT_KEY$9}`;
    const EVENT_TOUCHEND = `touchend${EVENT_KEY$9}`;
    const EVENT_POINTERDOWN = `pointerdown${EVENT_KEY$9}`;
    const EVENT_POINTERUP = `pointerup${EVENT_KEY$9}`;
    const POINTER_TYPE_TOUCH = 'touch';
    const POINTER_TYPE_PEN = 'pen';
    const CLASS_NAME_POINTER_EVENT = 'pointer-event';
    const SWIPE_THRESHOLD = 40;
    const Default$c = {
      endCallback: null,
      leftCallback: null,
      rightCallback: null
    };
    const DefaultType$c = {
      endCallback: '(function|null)',
      leftCallback: '(function|null)',
      rightCallback: '(function|null)'
    };
    /**
     * Class definition
     */
  
    class Swipe extends Config {
      constructor(element, config) {
        super();
        this._element = element;
  
        if (!element || !Swipe.isSupported()) {
          return;
        }
  
        this._config = this._getConfig(config);
        this._deltaX = 0;
        this._supportPointerEvents = Boolean(window.PointerEvent);
  
        this._initEvents();
      } // Getters
  
  
      static get Default() {
        return Default$c;
      }
  
      static get DefaultType() {
        return DefaultType$c;
      }
  
      static get NAME() {
        return NAME$d;
      } // Public
  
  
      dispose() {
        EventHandler.off(this._element, EVENT_KEY$9);
      } // Private
  
  
      _start(event) {
        if (!this._supportPointerEvents) {
          this._deltaX = event.touches[0].clientX;
          return;
        }
  
        if (this._eventIsPointerPenTouch(event)) {
          this._deltaX = event.clientX;
        }
      }
  
      _end(event) {
        if (this._eventIsPointerPenTouch(event)) {
          this._deltaX = event.clientX - this._deltaX;
        }
  
        this._handleSwipe();
  
        execute(this._config.endCallback);
      }
  
      _move(event) {
        this._deltaX = event.touches && event.touches.length > 1 ? 0 : event.touches[0].clientX - this._deltaX;
      }
  
      _handleSwipe() {
        const absDeltaX = Math.abs(this._deltaX);
  
        if (absDeltaX <= SWIPE_THRESHOLD) {
          return;
        }
  
        const direction = absDeltaX / this._deltaX;
        this._deltaX = 0;
  
        if (!direction) {
          return;
        }
  
        execute(direction > 0 ? this._config.rightCallback : this._config.leftCallback);
      }
  
      _initEvents() {
        if (this._supportPointerEvents) {
          EventHandler.on(this._element, EVENT_POINTERDOWN, event => this._start(event));
          EventHandler.on(this._element, EVENT_POINTERUP, event => this._end(event));
  
          this._element.classList.add(CLASS_NAME_POINTER_EVENT);
        } else {
          EventHandler.on(this._element, EVENT_TOUCHSTART, event => this._start(event));
          EventHandler.on(this._element, EVENT_TOUCHMOVE, event => this._move(event));
          EventHandler.on(this._element, EVENT_TOUCHEND, event => this._end(event));
        }
      }
  
      _eventIsPointerPenTouch(event) {
        return this._supportPointerEvents && (event.pointerType === POINTER_TYPE_PEN || event.pointerType === POINTER_TYPE_TOUCH);
      } // Static
  
  
      static isSupported() {
        return 'ontouchstart' in document.documentElement || navigator.maxTouchPoints > 0;
      }
  
    }
  
  
    const NAME$c = 'carousel';
    const DATA_KEY$8 = 'bs.carousel';
    const EVENT_KEY$8 = `.${DATA_KEY$8}`;
    const DATA_API_KEY$5 = '.data-api';
    const ARROW_LEFT_KEY$1 = 'ArrowLeft';
    const ARROW_RIGHT_KEY$1 = 'ArrowRight';
    const TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch
  
    const ORDER_NEXT = 'next';
    const ORDER_PREV = 'prev';
    const DIRECTION_LEFT = 'left';
    const DIRECTION_RIGHT = 'right';
    const EVENT_SLIDE = `slide${EVENT_KEY$8}`;
    const EVENT_SLID = `slid${EVENT_KEY$8}`;
    const EVENT_KEYDOWN$1 = `keydown${EVENT_KEY$8}`;
    const EVENT_MOUSEENTER$1 = `mouseenter${EVENT_KEY$8}`;
    const EVENT_MOUSELEAVE$1 = `mouseleave${EVENT_KEY$8}`;
    const EVENT_DRAG_START = `dragstart${EVENT_KEY$8}`;
    const EVENT_LOAD_DATA_API$3 = `load${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const EVENT_CLICK_DATA_API$5 = `click${EVENT_KEY$8}${DATA_API_KEY$5}`;
    const CLASS_NAME_CAROUSEL = 'carousel';
    const CLASS_NAME_ACTIVE$2 = 'active';
    const CLASS_NAME_SLIDE = 'slide';
    const CLASS_NAME_END = 'carousel-item-end';
    const CLASS_NAME_START = 'carousel-item-start';
    const CLASS_NAME_NEXT = 'carousel-item-next';
    const CLASS_NAME_PREV = 'carousel-item-prev';
    const SELECTOR_ACTIVE = '.active';
    const SELECTOR_ITEM = '.carousel-item';
    const SELECTOR_ACTIVE_ITEM = SELECTOR_ACTIVE + SELECTOR_ITEM;
    const SELECTOR_ITEM_IMG = '.carousel-item img';
    const SELECTOR_INDICATORS = '.carousel-indicators';
    const SELECTOR_DATA_SLIDE = '[data-bs-slide], [data-bs-slide-to]';
    const SELECTOR_DATA_RIDE = '[data-bs-ride="carousel"]';
    const KEY_TO_DIRECTION = {
      [ARROW_LEFT_KEY$1]: DIRECTION_RIGHT,
      [ARROW_RIGHT_KEY$1]: DIRECTION_LEFT
    };
    const Default$b = {
      interval: 5000,
      keyboard: true,
      pause: 'hover',
      ride: false,
      touch: true,
      wrap: true
    };
    const DefaultType$b = {
      interval: '(number|boolean)',
      // TODO:v6 remove boolean support
      keyboard: 'boolean',
      pause: '(string|boolean)',
      ride: '(boolean|string)',
      touch: 'boolean',
      wrap: 'boolean'
    };
    /**
     * Class definition
     */
  
    class Carousel extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._interval = null;
        this._activeElement = null;
        this._isSliding = false;
        this.touchTimeout = null;
        this._swipeHelper = null;
        this._indicatorsElement = SelectorEngine.findOne(SELECTOR_INDICATORS, this._element);
  
        this._addEventListeners();
  
        if (this._config.ride === CLASS_NAME_CAROUSEL) {
          this.cycle();
        }
      } // Getters
  
  
      static get Default() {
        return Default$b;
      }
  
      static get DefaultType() {
        return DefaultType$b;
      }
  
      static get NAME() {
        return NAME$c;
      } // Public
  
  
      next() {
        this._slide(ORDER_NEXT);
      }
  
      nextWhenVisible() {
        // FIXME TODO use `document.visibilityState`
        // Don't call next when the page isn't visible
        // or the carousel or its parent isn't visible
        if (!document.hidden && isVisible(this._element)) {
          this.next();
        }
      }
  
      prev() {
        this._slide(ORDER_PREV);
      }
  
      pause() {
        if (this._isSliding) {
          triggerTransitionEnd(this._element);
        }
  
        this._clearInterval();
      }
  
      cycle() {
        this._clearInterval();
  
        this._updateInterval();
  
        this._interval = setInterval(() => this.nextWhenVisible(), this._config.interval);
      }
  
      _maybeEnableCycle() {
        if (!this._config.ride) {
          return;
        }
  
        if (this._isSliding) {
          EventHandler.one(this._element, EVENT_SLID, () => this.cycle());
          return;
        }
  
        this.cycle();
      }
  
      to(index) {
        const items = this._getItems();
  
        if (index > items.length - 1 || index < 0) {
          return;
        }
  
        if (this._isSliding) {
          EventHandler.one(this._element, EVENT_SLID, () => this.to(index));
          return;
        }
  
        const activeIndex = this._getItemIndex(this._getActive());
  
        if (activeIndex === index) {
          return;
        }
  
        const order = index > activeIndex ? ORDER_NEXT : ORDER_PREV;
  
        this._slide(order, items[index]);
      }
  
      dispose() {
        if (this._swipeHelper) {
          this._swipeHelper.dispose();
        }
  
        super.dispose();
      } // Private
  
  
      _configAfterMerge(config) {
        config.defaultInterval = config.interval;
        return config;
      }
  
      _addEventListeners() {
        if (this._config.keyboard) {
          EventHandler.on(this._element, EVENT_KEYDOWN$1, event => this._keydown(event));
        }
  
        if (this._config.pause === 'hover') {
          EventHandler.on(this._element, EVENT_MOUSEENTER$1, () => this.pause());
          EventHandler.on(this._element, EVENT_MOUSELEAVE$1, () => this._maybeEnableCycle());
        }
  
        if (this._config.touch && Swipe.isSupported()) {
          this._addTouchEventListeners();
        }
      }
  
      _addTouchEventListeners() {
        for (const img of SelectorEngine.find(SELECTOR_ITEM_IMG, this._element)) {
          EventHandler.on(img, EVENT_DRAG_START, event => event.preventDefault());
        }
  
        const endCallBack = () => {
          if (this._config.pause !== 'hover') {
            return;
          } // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
  
  
          this.pause();
  
          if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
          }
  
          this.touchTimeout = setTimeout(() => this._maybeEnableCycle(), TOUCHEVENT_COMPAT_WAIT + this._config.interval);
        };
  
        const swipeConfig = {
          leftCallback: () => this._slide(this._directionToOrder(DIRECTION_LEFT)),
          rightCallback: () => this._slide(this._directionToOrder(DIRECTION_RIGHT)),
          endCallback: endCallBack
        };
        this._swipeHelper = new Swipe(this._element, swipeConfig);
      }
  
      _keydown(event) {
        if (/input|textarea/i.test(event.target.tagName)) {
          return;
        }
  
        const direction = KEY_TO_DIRECTION[event.key];
  
        if (direction) {
          event.preventDefault();
  
          this._slide(this._directionToOrder(direction));
        }
      }
  
      _getItemIndex(element) {
        return this._getItems().indexOf(element);
      }
  
      _setActiveIndicatorElement(index) {
        if (!this._indicatorsElement) {
          return;
        }
  
        const activeIndicator = SelectorEngine.findOne(SELECTOR_ACTIVE, this._indicatorsElement);
        activeIndicator.classList.remove(CLASS_NAME_ACTIVE$2);
        activeIndicator.removeAttribute('aria-current');
        const newActiveIndicator = SelectorEngine.findOne(`[data-bs-slide-to="${index}"]`, this._indicatorsElement);
  
        if (newActiveIndicator) {
          newActiveIndicator.classList.add(CLASS_NAME_ACTIVE$2);
          newActiveIndicator.setAttribute('aria-current', 'true');
        }
      }
  
      _updateInterval() {
        const element = this._activeElement || this._getActive();
  
        if (!element) {
          return;
        }
  
        const elementInterval = Number.parseInt(element.getAttribute('data-bs-interval'), 10);
        this._config.interval = elementInterval || this._config.defaultInterval;
      }
  
      _slide(order, element = null) {
        if (this._isSliding) {
          return;
        }
  
        const activeElement = this._getActive();
  
        const isNext = order === ORDER_NEXT;
        const nextElement = element || getNextActiveElement(this._getItems(), activeElement, isNext, this._config.wrap);
  
        if (nextElement === activeElement) {
          return;
        }
  
        const nextElementIndex = this._getItemIndex(nextElement);
  
        const triggerEvent = eventName => {
          return EventHandler.trigger(this._element, eventName, {
            relatedTarget: nextElement,
            direction: this._orderToDirection(order),
            from: this._getItemIndex(activeElement),
            to: nextElementIndex
          });
        };
  
        const slideEvent = triggerEvent(EVENT_SLIDE);
  
        if (slideEvent.defaultPrevented) {
          return;
        }
  
        if (!activeElement || !nextElement) {
          // Some weirdness is happening, so we bail
          // todo: change tests that use empty divs to avoid this check
          return;
        }
  
        const isCycling = Boolean(this._interval);
        this.pause();
        this._isSliding = true;
  
        this._setActiveIndicatorElement(nextElementIndex);
  
        this._activeElement = nextElement;
        const directionalClassName = isNext ? CLASS_NAME_START : CLASS_NAME_END;
        const orderClassName = isNext ? CLASS_NAME_NEXT : CLASS_NAME_PREV;
        nextElement.classList.add(orderClassName);
        reflow(nextElement);
        activeElement.classList.add(directionalClassName);
        nextElement.classList.add(directionalClassName);
  
        const completeCallBack = () => {
          nextElement.classList.remove(directionalClassName, orderClassName);
          nextElement.classList.add(CLASS_NAME_ACTIVE$2);
          activeElement.classList.remove(CLASS_NAME_ACTIVE$2, orderClassName, directionalClassName);
          this._isSliding = false;
          triggerEvent(EVENT_SLID);
        };
  
        this._queueCallback(completeCallBack, activeElement, this._isAnimated());
  
        if (isCycling) {
          this.cycle();
        }
      }
  
      _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_SLIDE);
      }
  
      _getActive() {
        return SelectorEngine.findOne(SELECTOR_ACTIVE_ITEM, this._element);
      }
  
      _getItems() {
        return SelectorEngine.find(SELECTOR_ITEM, this._element);
      }
  
      _clearInterval() {
        if (this._interval) {
          clearInterval(this._interval);
          this._interval = null;
        }
      }
  
      _directionToOrder(direction) {
        if (isRTL()) {
          return direction === DIRECTION_LEFT ? ORDER_PREV : ORDER_NEXT;
        }
  
        return direction === DIRECTION_LEFT ? ORDER_NEXT : ORDER_PREV;
      }
  
      _orderToDirection(order) {
        if (isRTL()) {
          return order === ORDER_PREV ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
  
        return order === ORDER_PREV ? DIRECTION_RIGHT : DIRECTION_LEFT;
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Carousel.getOrCreateInstance(this, config);
  
          if (typeof config === 'number') {
            data.to(config);
            return;
          }
  
          if (typeof config === 'string') {
            if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
              throw new TypeError(`No method named "${config}"`);
            }
  
            data[config]();
          }
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API$5, SELECTOR_DATA_SLIDE, function (event) {
      const target = getElementFromSelector(this);
  
      if (!target || !target.classList.contains(CLASS_NAME_CAROUSEL)) {
        return;
      }
  
      event.preventDefault();
      const carousel = Carousel.getOrCreateInstance(target);
      const slideIndex = this.getAttribute('data-bs-slide-to');
  
      if (slideIndex) {
        carousel.to(slideIndex);
  
        carousel._maybeEnableCycle();
  
        return;
      }
  
      if (Manipulator.getDataAttribute(this, 'slide') === 'next') {
        carousel.next();
  
        carousel._maybeEnableCycle();
  
        return;
      }
  
      carousel.prev();
  
      carousel._maybeEnableCycle();
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$3, () => {
      const carousels = SelectorEngine.find(SELECTOR_DATA_RIDE);
  
      for (const carousel of carousels) {
        Carousel.getOrCreateInstance(carousel);
      }
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Carousel);
  
  
  
    const NAME$b = 'collapse';
    const DATA_KEY$7 = 'bs.collapse';
    const EVENT_KEY$7 = `.${DATA_KEY$7}`;
    const DATA_API_KEY$4 = '.data-api';
    const EVENT_SHOW$6 = `show${EVENT_KEY$7}`;
    const EVENT_SHOWN$6 = `shown${EVENT_KEY$7}`;
    const EVENT_HIDE$6 = `hide${EVENT_KEY$7}`;
    const EVENT_HIDDEN$6 = `hidden${EVENT_KEY$7}`;
    const EVENT_CLICK_DATA_API$4 = `click${EVENT_KEY$7}${DATA_API_KEY$4}`;
    const CLASS_NAME_SHOW$7 = 'show';
    const CLASS_NAME_COLLAPSE = 'collapse';
    const CLASS_NAME_COLLAPSING = 'collapsing';
    const CLASS_NAME_COLLAPSED = 'collapsed';
    const CLASS_NAME_DEEPER_CHILDREN = `:scope .${CLASS_NAME_COLLAPSE} .${CLASS_NAME_COLLAPSE}`;
    const CLASS_NAME_HORIZONTAL = 'collapse-horizontal';
    const WIDTH = 'width';
    const HEIGHT = 'height';
    const SELECTOR_ACTIVES = '.collapse.show, .collapse.collapsing';
    const SELECTOR_DATA_TOGGLE$4 = '[data-bs-toggle="collapse"]';
    const Default$a = {
      parent: null,
      toggle: true
    };
    const DefaultType$a = {
      parent: '(null|element)',
      toggle: 'boolean'
    };
    /**
     * Class definition
     */
  
    class Collapse extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._isTransitioning = false;
        this._triggerArray = [];
        const toggleList = SelectorEngine.find(SELECTOR_DATA_TOGGLE$4);
  
        for (const elem of toggleList) {
          const selector = getSelectorFromElement(elem);
          const filterElement = SelectorEngine.find(selector).filter(foundElement => foundElement === this._element);
  
          if (selector !== null && filterElement.length) {
            this._triggerArray.push(elem);
          }
        }
  
        this._initializeChildren();
  
        if (!this._config.parent) {
          this._addAriaAndCollapsedClass(this._triggerArray, this._isShown());
        }
  
        if (this._config.toggle) {
          this.toggle();
        }
      } // Getters
  
  
      static get Default() {
        return Default$a;
      }
  
      static get DefaultType() {
        return DefaultType$a;
      }
  
      static get NAME() {
        return NAME$b;
      } // Public
  
  
      toggle() {
        if (this._isShown()) {
          this.hide();
        } else {
          this.show();
        }
      }
  
      show() {
        if (this._isTransitioning || this._isShown()) {
          return;
        }
  
        let activeChildren = []; // find active children
  
        if (this._config.parent) {
          activeChildren = this._getFirstLevelChildren(SELECTOR_ACTIVES).filter(element => element !== this._element).map(element => Collapse.getOrCreateInstance(element, {
            toggle: false
          }));
        }
  
        if (activeChildren.length && activeChildren[0]._isTransitioning) {
          return;
        }
  
        const startEvent = EventHandler.trigger(this._element, EVENT_SHOW$6);
  
        if (startEvent.defaultPrevented) {
          return;
        }
  
        for (const activeInstance of activeChildren) {
          activeInstance.hide();
        }
  
        const dimension = this._getDimension();
  
        this._element.classList.remove(CLASS_NAME_COLLAPSE);
  
        this._element.classList.add(CLASS_NAME_COLLAPSING);
  
        this._element.style[dimension] = 0;
  
        this._addAriaAndCollapsedClass(this._triggerArray, true);
  
        this._isTransitioning = true;
  
        const complete = () => {
          this._isTransitioning = false;
  
          this._element.classList.remove(CLASS_NAME_COLLAPSING);
  
          this._element.classList.add(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
  
          this._element.style[dimension] = '';
          EventHandler.trigger(this._element, EVENT_SHOWN$6);
        };
  
        const capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
        const scrollSize = `scroll${capitalizedDimension}`;
  
        this._queueCallback(complete, this._element, true);
  
        this._element.style[dimension] = `${this._element[scrollSize]}px`;
      }
  
      hide() {
        if (this._isTransitioning || !this._isShown()) {
          return;
        }
  
        const startEvent = EventHandler.trigger(this._element, EVENT_HIDE$6);
  
        if (startEvent.defaultPrevented) {
          return;
        }
  
        const dimension = this._getDimension();
  
        this._element.style[dimension] = `${this._element.getBoundingClientRect()[dimension]}px`;
        reflow(this._element);
  
        this._element.classList.add(CLASS_NAME_COLLAPSING);
  
        this._element.classList.remove(CLASS_NAME_COLLAPSE, CLASS_NAME_SHOW$7);
  
        for (const trigger of this._triggerArray) {
          const element = getElementFromSelector(trigger);
  
          if (element && !this._isShown(element)) {
            this._addAriaAndCollapsedClass([trigger], false);
          }
        }
  
        this._isTransitioning = true;
  
        const complete = () => {
          this._isTransitioning = false;
  
          this._element.classList.remove(CLASS_NAME_COLLAPSING);
  
          this._element.classList.add(CLASS_NAME_COLLAPSE);
  
          EventHandler.trigger(this._element, EVENT_HIDDEN$6);
        };
  
        this._element.style[dimension] = '';
  
        this._queueCallback(complete, this._element, true);
      }
  
      _isShown(element = this._element) {
        return element.classList.contains(CLASS_NAME_SHOW$7);
      } // Private
  
  
      _configAfterMerge(config) {
        config.toggle = Boolean(config.toggle); // Coerce string values
  
        config.parent = getElement(config.parent);
        return config;
      }
  
      _getDimension() {
        return this._element.classList.contains(CLASS_NAME_HORIZONTAL) ? WIDTH : HEIGHT;
      }
  
      _initializeChildren() {
        if (!this._config.parent) {
          return;
        }
  
        const children = this._getFirstLevelChildren(SELECTOR_DATA_TOGGLE$4);
  
        for (const element of children) {
          const selected = getElementFromSelector(element);
  
          if (selected) {
            this._addAriaAndCollapsedClass([element], this._isShown(selected));
          }
        }
      }
  
      _getFirstLevelChildren(selector) {
        const children = SelectorEngine.find(CLASS_NAME_DEEPER_CHILDREN, this._config.parent); // remove children if greater depth
  
        return SelectorEngine.find(selector, this._config.parent).filter(element => !children.includes(element));
      }
  
      _addAriaAndCollapsedClass(triggerArray, isOpen) {
        if (!triggerArray.length) {
          return;
        }
  
        for (const element of triggerArray) {
          element.classList.toggle(CLASS_NAME_COLLAPSED, !isOpen);
          element.setAttribute('aria-expanded', isOpen);
        }
      } // Static
  
  
      static jQueryInterface(config) {
        const _config = {};
  
        if (typeof config === 'string' && /show|hide/.test(config)) {
          _config.toggle = false;
        }
  
        return this.each(function () {
          const data = Collapse.getOrCreateInstance(this, _config);
  
          if (typeof config === 'string') {
            if (typeof data[config] === 'undefined') {
              throw new TypeError(`No method named "${config}"`);
            }
  
            data[config]();
          }
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API$4, SELECTOR_DATA_TOGGLE$4, function (event) {
      // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
      if (event.target.tagName === 'A' || event.delegateTarget && event.delegateTarget.tagName === 'A') {
        event.preventDefault();
      }
  
      const selector = getSelectorFromElement(this);
      const selectorElements = SelectorEngine.find(selector);
  
      for (const element of selectorElements) {
        Collapse.getOrCreateInstance(element, {
          toggle: false
        }).toggle();
      }
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Collapse);
  
    var top = 'top';
    var bottom = 'bottom';
    var right = 'right';
    var left = 'left';
    var auto = 'auto';
    var basePlacements = [top, bottom, right, left];
    var start = 'start';
    var end = 'end';
    var clippingParents = 'clippingParents';
    var viewport = 'viewport';
    var popper = 'popper';
    var reference = 'reference';
    var variationPlacements = /*#__PURE__*/basePlacements.reduce(function (acc, placement) {
      return acc.concat([placement + "-" + start, placement + "-" + end]);
    }, []);
    var placements = /*#__PURE__*/[].concat(basePlacements, [auto]).reduce(function (acc, placement) {
      return acc.concat([placement, placement + "-" + start, placement + "-" + end]);
    }, []); // modifiers that need to read the DOM
  
    var beforeRead = 'beforeRead';
    var read = 'read';
    var afterRead = 'afterRead'; // pure-logic modifiers
  
    var beforeMain = 'beforeMain';
    var main = 'main';
    var afterMain = 'afterMain'; // modifier with the purpose to write to the DOM (or write into a framework state)
  
    var beforeWrite = 'beforeWrite';
    var write = 'write';
    var afterWrite = 'afterWrite';
    var modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];
  
    function getNodeName(element) {
      return element ? (element.nodeName || '').toLowerCase() : null;
    }
  
    function getWindow(node) {
      if (node == null) {
        return window;
      }
  
      if (node.toString() !== '[object Window]') {
        var ownerDocument = node.ownerDocument;
        return ownerDocument ? ownerDocument.defaultView || window : window;
      }
  
      return node;
    }
  
    function isElement(node) {
      var OwnElement = getWindow(node).Element;
      return node instanceof OwnElement || node instanceof Element;
    }
  
    function isHTMLElement(node) {
      var OwnElement = getWindow(node).HTMLElement;
      return node instanceof OwnElement || node instanceof HTMLElement;
    }
  
    function isShadowRoot(node) {
      // IE 11 has no ShadowRoot
      if (typeof ShadowRoot === 'undefined') {
        return false;
      }
  
      var OwnElement = getWindow(node).ShadowRoot;
      return node instanceof OwnElement || node instanceof ShadowRoot;
    }
  
    // and applies them to the HTMLElements such as popper and arrow
  
    function applyStyles(_ref) {
      var state = _ref.state;
      Object.keys(state.elements).forEach(function (name) {
        var style = state.styles[name] || {};
        var attributes = state.attributes[name] || {};
        var element = state.elements[name]; // arrow is optional + virtual elements
  
        if (!isHTMLElement(element) || !getNodeName(element)) {
          return;
        } // Flow doesn't support to extend this property, but it's the most
        // effective way to apply styles to an HTMLElement
        // $FlowFixMe[cannot-write]
  
  
        Object.assign(element.style, style);
        Object.keys(attributes).forEach(function (name) {
          var value = attributes[name];
  
          if (value === false) {
            element.removeAttribute(name);
          } else {
            element.setAttribute(name, value === true ? '' : value);
          }
        });
      });
    }
  
    function effect$2(_ref2) {
      var state = _ref2.state;
      var initialStyles = {
        popper: {
          position: state.options.strategy,
          left: '0',
          top: '0',
          margin: '0'
        },
        arrow: {
          position: 'absolute'
        },
        reference: {}
      };
      Object.assign(state.elements.popper.style, initialStyles.popper);
      state.styles = initialStyles;
  
      if (state.elements.arrow) {
        Object.assign(state.elements.arrow.style, initialStyles.arrow);
      }
  
      return function () {
        Object.keys(state.elements).forEach(function (name) {
          var element = state.elements[name];
          var attributes = state.attributes[name] || {};
          var styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]); // Set all values to an empty string to unset them
  
          var style = styleProperties.reduce(function (style, property) {
            style[property] = '';
            return style;
          }, {}); // arrow is optional + virtual elements
  
          if (!isHTMLElement(element) || !getNodeName(element)) {
            return;
          }
  
          Object.assign(element.style, style);
          Object.keys(attributes).forEach(function (attribute) {
            element.removeAttribute(attribute);
          });
        });
      };
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const applyStyles$1 = {
      name: 'applyStyles',
      enabled: true,
      phase: 'write',
      fn: applyStyles,
      effect: effect$2,
      requires: ['computeStyles']
    };
  
    function getBasePlacement(placement) {
      return placement.split('-')[0];
    }
  
    var max = Math.max;
    var min = Math.min;
    var round = Math.round;
  
    function getBoundingClientRect(element, includeScale) {
      if (includeScale === void 0) {
        includeScale = false;
      }
  
      var rect = element.getBoundingClientRect();
      var scaleX = 1;
      var scaleY = 1;
  
      if (isHTMLElement(element) && includeScale) {
        var offsetHeight = element.offsetHeight;
        var offsetWidth = element.offsetWidth; // Do not attempt to divide by 0, otherwise we get `Infinity` as scale
        // Fallback to 1 in case both values are `0`
  
        if (offsetWidth > 0) {
          scaleX = round(rect.width) / offsetWidth || 1;
        }
  
        if (offsetHeight > 0) {
          scaleY = round(rect.height) / offsetHeight || 1;
        }
      }
  
      return {
        width: rect.width / scaleX,
        height: rect.height / scaleY,
        top: rect.top / scaleY,
        right: rect.right / scaleX,
        bottom: rect.bottom / scaleY,
        left: rect.left / scaleX,
        x: rect.left / scaleX,
        y: rect.top / scaleY
      };
    }
  
    // means it doesn't take into account transforms.
  
    function getLayoutRect(element) {
      var clientRect = getBoundingClientRect(element); // Use the clientRect sizes if it's not been transformed.
      // Fixes https://github.com/popperjs/popper-core/issues/1223
  
      var width = element.offsetWidth;
      var height = element.offsetHeight;
  
      if (Math.abs(clientRect.width - width) <= 1) {
        width = clientRect.width;
      }
  
      if (Math.abs(clientRect.height - height) <= 1) {
        height = clientRect.height;
      }
  
      return {
        x: element.offsetLeft,
        y: element.offsetTop,
        width: width,
        height: height
      };
    }
  
    function contains(parent, child) {
      var rootNode = child.getRootNode && child.getRootNode(); // First, attempt with faster native method
  
      if (parent.contains(child)) {
        return true;
      } // then fallback to custom implementation with Shadow DOM support
      else if (rootNode && isShadowRoot(rootNode)) {
          var next = child;
  
          do {
            if (next && parent.isSameNode(next)) {
              return true;
            } // $FlowFixMe[prop-missing]: need a better way to handle this...
  
  
            next = next.parentNode || next.host;
          } while (next);
        } // Give up, the result is false
  
  
      return false;
    }
  
    function getComputedStyle$1(element) {
      return getWindow(element).getComputedStyle(element);
    }
  
    function isTableElement(element) {
      return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
    }
  
    function getDocumentElement(element) {
      // $FlowFixMe[incompatible-return]: assume body is always available
      return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
      element.document) || window.document).documentElement;
    }
  
    function getParentNode(element) {
      if (getNodeName(element) === 'html') {
        return element;
      }
  
      return (// this is a quicker (but less type safe) way to save quite some bytes from the bundle
        // $FlowFixMe[incompatible-return]
        // $FlowFixMe[prop-missing]
        element.assignedSlot || // step into the shadow DOM of the parent of a slotted node
        element.parentNode || ( // DOM Element detected
        isShadowRoot(element) ? element.host : null) || // ShadowRoot detected
        // $FlowFixMe[incompatible-call]: HTMLElement is a Node
        getDocumentElement(element) // fallback
  
      );
    }
  
    function getTrueOffsetParent(element) {
      if (!isHTMLElement(element) || // https://github.com/popperjs/popper-core/issues/837
      getComputedStyle$1(element).position === 'fixed') {
        return null;
      }
  
      return element.offsetParent;
    } // `.offsetParent` reports `null` for fixed elements, while absolute elements
    // return the containing block
  
  
    function getContainingBlock(element) {
      var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') !== -1;
      var isIE = navigator.userAgent.indexOf('Trident') !== -1;
  
      if (isIE && isHTMLElement(element)) {
        // In IE 9, 10 and 11 fixed elements containing block is always established by the viewport
        var elementCss = getComputedStyle$1(element);
  
        if (elementCss.position === 'fixed') {
          return null;
        }
      }
  
      var currentNode = getParentNode(element);
  
      if (isShadowRoot(currentNode)) {
        currentNode = currentNode.host;
      }
  
      while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
        var css = getComputedStyle$1(currentNode); // This is non-exhaustive but covers the most common CSS properties that
        // create a containing block.
        // https://developer.mozilla.org/en-US/docs/Web/CSS/Containing_block#identifying_the_containing_block
  
        if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].indexOf(css.willChange) !== -1 || isFirefox && css.willChange === 'filter' || isFirefox && css.filter && css.filter !== 'none') {
          return currentNode;
        } else {
          currentNode = currentNode.parentNode;
        }
      }
  
      return null;
    } // Gets the closest ancestor positioned element. Handles some edge cases,
    // such as table ancestors and cross browser bugs.
  
  
    function getOffsetParent(element) {
      var window = getWindow(element);
      var offsetParent = getTrueOffsetParent(element);
  
      while (offsetParent && isTableElement(offsetParent) && getComputedStyle$1(offsetParent).position === 'static') {
        offsetParent = getTrueOffsetParent(offsetParent);
      }
  
      if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle$1(offsetParent).position === 'static')) {
        return window;
      }
  
      return offsetParent || getContainingBlock(element) || window;
    }
  
    function getMainAxisFromPlacement(placement) {
      return ['top', 'bottom'].indexOf(placement) >= 0 ? 'x' : 'y';
    }
  
    function within(min$1, value, max$1) {
      return max(min$1, min(value, max$1));
    }
    function withinMaxClamp(min, value, max) {
      var v = within(min, value, max);
      return v > max ? max : v;
    }
  
    function getFreshSideObject() {
      return {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      };
    }
  
    function mergePaddingObject(paddingObject) {
      return Object.assign({}, getFreshSideObject(), paddingObject);
    }
  
    function expandToHashMap(value, keys) {
      return keys.reduce(function (hashMap, key) {
        hashMap[key] = value;
        return hashMap;
      }, {});
    }
  
    var toPaddingObject = function toPaddingObject(padding, state) {
      padding = typeof padding === 'function' ? padding(Object.assign({}, state.rects, {
        placement: state.placement
      })) : padding;
      return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
    };
  
    function arrow(_ref) {
      var _state$modifiersData$;
  
      var state = _ref.state,
          name = _ref.name,
          options = _ref.options;
      var arrowElement = state.elements.arrow;
      var popperOffsets = state.modifiersData.popperOffsets;
      var basePlacement = getBasePlacement(state.placement);
      var axis = getMainAxisFromPlacement(basePlacement);
      var isVertical = [left, right].indexOf(basePlacement) >= 0;
      var len = isVertical ? 'height' : 'width';
  
      if (!arrowElement || !popperOffsets) {
        return;
      }
  
      var paddingObject = toPaddingObject(options.padding, state);
      var arrowRect = getLayoutRect(arrowElement);
      var minProp = axis === 'y' ? top : left;
      var maxProp = axis === 'y' ? bottom : right;
      var endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
      var startDiff = popperOffsets[axis] - state.rects.reference[axis];
      var arrowOffsetParent = getOffsetParent(arrowElement);
      var clientSize = arrowOffsetParent ? axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0 : 0;
      var centerToReference = endDiff / 2 - startDiff / 2; // Make sure the arrow doesn't overflow the popper if the center point is
      // outside of the popper bounds
  
      var min = paddingObject[minProp];
      var max = clientSize - arrowRect[len] - paddingObject[maxProp];
      var center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
      var offset = within(min, center, max); // Prevents breaking syntax highlighting...
  
      var axisProp = axis;
      state.modifiersData[name] = (_state$modifiersData$ = {}, _state$modifiersData$[axisProp] = offset, _state$modifiersData$.centerOffset = offset - center, _state$modifiersData$);
    }
  
    function effect$1(_ref2) {
      var state = _ref2.state,
          options = _ref2.options;
      var _options$element = options.element,
          arrowElement = _options$element === void 0 ? '[data-popper-arrow]' : _options$element;
  
      if (arrowElement == null) {
        return;
      } // CSS selector
  
  
      if (typeof arrowElement === 'string') {
        arrowElement = state.elements.popper.querySelector(arrowElement);
  
        if (!arrowElement) {
          return;
        }
      }
  
      if (!contains(state.elements.popper, arrowElement)) {
  
        return;
      }
  
      state.elements.arrow = arrowElement;
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const arrow$1 = {
      name: 'arrow',
      enabled: true,
      phase: 'main',
      fn: arrow,
      effect: effect$1,
      requires: ['popperOffsets'],
      requiresIfExists: ['preventOverflow']
    };
  
    function getVariation(placement) {
      return placement.split('-')[1];
    }
  
    var unsetSides = {
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto'
    }; // Round the offsets to the nearest suitable subpixel based on the DPR.
    // Zooming can change the DPR, but it seems to report a value that will
    // cleanly divide the values into the appropriate subpixels.
  
    function roundOffsetsByDPR(_ref) {
      var x = _ref.x,
          y = _ref.y;
      var win = window;
      var dpr = win.devicePixelRatio || 1;
      return {
        x: round(x * dpr) / dpr || 0,
        y: round(y * dpr) / dpr || 0
      };
    }
  
    function mapToStyles(_ref2) {
      var _Object$assign2;
  
      var popper = _ref2.popper,
          popperRect = _ref2.popperRect,
          placement = _ref2.placement,
          variation = _ref2.variation,
          offsets = _ref2.offsets,
          position = _ref2.position,
          gpuAcceleration = _ref2.gpuAcceleration,
          adaptive = _ref2.adaptive,
          roundOffsets = _ref2.roundOffsets,
          isFixed = _ref2.isFixed;
      var _offsets$x = offsets.x,
          x = _offsets$x === void 0 ? 0 : _offsets$x,
          _offsets$y = offsets.y,
          y = _offsets$y === void 0 ? 0 : _offsets$y;
  
      var _ref3 = typeof roundOffsets === 'function' ? roundOffsets({
        x: x,
        y: y
      }) : {
        x: x,
        y: y
      };
  
      x = _ref3.x;
      y = _ref3.y;
      var hasX = offsets.hasOwnProperty('x');
      var hasY = offsets.hasOwnProperty('y');
      var sideX = left;
      var sideY = top;
      var win = window;
  
      if (adaptive) {
        var offsetParent = getOffsetParent(popper);
        var heightProp = 'clientHeight';
        var widthProp = 'clientWidth';
  
        if (offsetParent === getWindow(popper)) {
          offsetParent = getDocumentElement(popper);
  
          if (getComputedStyle$1(offsetParent).position !== 'static' && position === 'absolute') {
            heightProp = 'scrollHeight';
            widthProp = 'scrollWidth';
          }
        } // $FlowFixMe[incompatible-cast]: force type refinement, we compare offsetParent with window above, but Flow doesn't detect it
  
  
        offsetParent = offsetParent;
  
        if (placement === top || (placement === left || placement === right) && variation === end) {
          sideY = bottom;
          var offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : // $FlowFixMe[prop-missing]
          offsetParent[heightProp];
          y -= offsetY - popperRect.height;
          y *= gpuAcceleration ? 1 : -1;
        }
  
        if (placement === left || (placement === top || placement === bottom) && variation === end) {
          sideX = right;
          var offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : // $FlowFixMe[prop-missing]
          offsetParent[widthProp];
          x -= offsetX - popperRect.width;
          x *= gpuAcceleration ? 1 : -1;
        }
      }
  
      var commonStyles = Object.assign({
        position: position
      }, adaptive && unsetSides);
  
      var _ref4 = roundOffsets === true ? roundOffsetsByDPR({
        x: x,
        y: y
      }) : {
        x: x,
        y: y
      };
  
      x = _ref4.x;
      y = _ref4.y;
  
      if (gpuAcceleration) {
        var _Object$assign;
  
        return Object.assign({}, commonStyles, (_Object$assign = {}, _Object$assign[sideY] = hasY ? '0' : '', _Object$assign[sideX] = hasX ? '0' : '', _Object$assign.transform = (win.devicePixelRatio || 1) <= 1 ? "translate(" + x + "px, " + y + "px)" : "translate3d(" + x + "px, " + y + "px, 0)", _Object$assign));
      }
  
      return Object.assign({}, commonStyles, (_Object$assign2 = {}, _Object$assign2[sideY] = hasY ? y + "px" : '', _Object$assign2[sideX] = hasX ? x + "px" : '', _Object$assign2.transform = '', _Object$assign2));
    }
  
    function computeStyles(_ref5) {
      var state = _ref5.state,
          options = _ref5.options;
      var _options$gpuAccelerat = options.gpuAcceleration,
          gpuAcceleration = _options$gpuAccelerat === void 0 ? true : _options$gpuAccelerat,
          _options$adaptive = options.adaptive,
          adaptive = _options$adaptive === void 0 ? true : _options$adaptive,
          _options$roundOffsets = options.roundOffsets,
          roundOffsets = _options$roundOffsets === void 0 ? true : _options$roundOffsets;
  
      var commonStyles = {
        placement: getBasePlacement(state.placement),
        variation: getVariation(state.placement),
        popper: state.elements.popper,
        popperRect: state.rects.popper,
        gpuAcceleration: gpuAcceleration,
        isFixed: state.options.strategy === 'fixed'
      };
  
      if (state.modifiersData.popperOffsets != null) {
        state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.popperOffsets,
          position: state.options.strategy,
          adaptive: adaptive,
          roundOffsets: roundOffsets
        })));
      }
  
      if (state.modifiersData.arrow != null) {
        state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
          offsets: state.modifiersData.arrow,
          position: 'absolute',
          adaptive: false,
          roundOffsets: roundOffsets
        })));
      }
  
      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-placement': state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const computeStyles$1 = {
      name: 'computeStyles',
      enabled: true,
      phase: 'beforeWrite',
      fn: computeStyles,
      data: {}
    };
  
    var passive = {
      passive: true
    };
  
    function effect(_ref) {
      var state = _ref.state,
          instance = _ref.instance,
          options = _ref.options;
      var _options$scroll = options.scroll,
          scroll = _options$scroll === void 0 ? true : _options$scroll,
          _options$resize = options.resize,
          resize = _options$resize === void 0 ? true : _options$resize;
      var window = getWindow(state.elements.popper);
      var scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);
  
      if (scroll) {
        scrollParents.forEach(function (scrollParent) {
          scrollParent.addEventListener('scroll', instance.update, passive);
        });
      }
  
      if (resize) {
        window.addEventListener('resize', instance.update, passive);
      }
  
      return function () {
        if (scroll) {
          scrollParents.forEach(function (scrollParent) {
            scrollParent.removeEventListener('scroll', instance.update, passive);
          });
        }
  
        if (resize) {
          window.removeEventListener('resize', instance.update, passive);
        }
      };
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const eventListeners = {
      name: 'eventListeners',
      enabled: true,
      phase: 'write',
      fn: function fn() {},
      effect: effect,
      data: {}
    };
  
    var hash$1 = {
      left: 'right',
      right: 'left',
      bottom: 'top',
      top: 'bottom'
    };
    function getOppositePlacement(placement) {
      return placement.replace(/left|right|bottom|top/g, function (matched) {
        return hash$1[matched];
      });
    }
  
    var hash = {
      start: 'end',
      end: 'start'
    };
    function getOppositeVariationPlacement(placement) {
      return placement.replace(/start|end/g, function (matched) {
        return hash[matched];
      });
    }
  
    function getWindowScroll(node) {
      var win = getWindow(node);
      var scrollLeft = win.pageXOffset;
      var scrollTop = win.pageYOffset;
      return {
        scrollLeft: scrollLeft,
        scrollTop: scrollTop
      };
    }
  
    function getWindowScrollBarX(element) {
      // If <html> has a CSS width greater than the viewport, then this will be
      // incorrect for RTL.
      // Popper 1 is broken in this case and never had a bug report so let's assume
      // it's not an issue. I don't think anyone ever specifies width on <html>
      // anyway.
      // Browsers where the left scrollbar doesn't cause an issue report `0` for
      // this (e.g. Edge 2019, IE11, Safari)
      return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
    }
  
    function getViewportRect(element) {
      var win = getWindow(element);
      var html = getDocumentElement(element);
      var visualViewport = win.visualViewport;
      var width = html.clientWidth;
      var height = html.clientHeight;
      var x = 0;
      var y = 0; // NB: This isn't supported on iOS <= 12. If the keyboard is open, the popper
      // can be obscured underneath it.
      // Also, `html.clientHeight` adds the bottom bar height in Safari iOS, even
      // if it isn't open, so if this isn't available, the popper will be detected
      // to overflow the bottom of the screen too early.
  
      if (visualViewport) {
        width = visualViewport.width;
        height = visualViewport.height; // Uses Layout Viewport (like Chrome; Safari does not currently)
        // In Chrome, it returns a value very close to 0 (+/-) but contains rounding
        // errors due to floating point numbers, so we need to check precision.
        // Safari returns a number <= 0, usually < -1 when pinch-zoomed
        // Feature detection fails in mobile emulation mode in Chrome.
        // Math.abs(win.innerWidth / visualViewport.scale - visualViewport.width) <
        // 0.001
        // Fallback here: "Not Safari" userAgent
  
        if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
          x = visualViewport.offsetLeft;
          y = visualViewport.offsetTop;
        }
      }
  
      return {
        width: width,
        height: height,
        x: x + getWindowScrollBarX(element),
        y: y
      };
    }
  
    // of the `<html>` and `<body>` rect bounds if horizontally scrollable
  
    function getDocumentRect(element) {
      var _element$ownerDocumen;
  
      var html = getDocumentElement(element);
      var winScroll = getWindowScroll(element);
      var body = (_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body;
      var width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
      var height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
      var x = -winScroll.scrollLeft + getWindowScrollBarX(element);
      var y = -winScroll.scrollTop;
  
      if (getComputedStyle$1(body || html).direction === 'rtl') {
        x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
      }
  
      return {
        width: width,
        height: height,
        x: x,
        y: y
      };
    }
  
    function isScrollParent(element) {
      // Firefox wants us to check `-x` and `-y` variations as well
      var _getComputedStyle = getComputedStyle$1(element),
          overflow = _getComputedStyle.overflow,
          overflowX = _getComputedStyle.overflowX,
          overflowY = _getComputedStyle.overflowY;
  
      return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
    }
  
    function getScrollParent(node) {
      if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
        // $FlowFixMe[incompatible-return]: assume body is always available
        return node.ownerDocument.body;
      }
  
      if (isHTMLElement(node) && isScrollParent(node)) {
        return node;
      }
  
      return getScrollParent(getParentNode(node));
    }
  
    /*
    given a DOM element, return the list of all scroll parents, up the list of ancesors
    until we get to the top window object. This list is what we attach scroll listeners
    to, because if any of these parent elements scroll, we'll need to re-calculate the
    reference element's position.
    */
  
    function listScrollParents(element, list) {
      var _element$ownerDocumen;
  
      if (list === void 0) {
        list = [];
      }
  
      var scrollParent = getScrollParent(element);
      var isBody = scrollParent === ((_element$ownerDocumen = element.ownerDocument) == null ? void 0 : _element$ownerDocumen.body);
      var win = getWindow(scrollParent);
      var target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
      var updatedList = list.concat(target);
      return isBody ? updatedList : // $FlowFixMe[incompatible-call]: isBody tells us target will be an HTMLElement here
      updatedList.concat(listScrollParents(getParentNode(target)));
    }
  
    function rectToClientRect(rect) {
      return Object.assign({}, rect, {
        left: rect.x,
        top: rect.y,
        right: rect.x + rect.width,
        bottom: rect.y + rect.height
      });
    }
  
    function getInnerBoundingClientRect(element) {
      var rect = getBoundingClientRect(element);
      rect.top = rect.top + element.clientTop;
      rect.left = rect.left + element.clientLeft;
      rect.bottom = rect.top + element.clientHeight;
      rect.right = rect.left + element.clientWidth;
      rect.width = element.clientWidth;
      rect.height = element.clientHeight;
      rect.x = rect.left;
      rect.y = rect.top;
      return rect;
    }
  
    function getClientRectFromMixedType(element, clippingParent) {
      return clippingParent === viewport ? rectToClientRect(getViewportRect(element)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
    } // A "clipping parent" is an overflowable container with the characteristic of
    // clipping (or hiding) overflowing elements with a position different from
    // `initial`
  
  
    function getClippingParents(element) {
      var clippingParents = listScrollParents(getParentNode(element));
      var canEscapeClipping = ['absolute', 'fixed'].indexOf(getComputedStyle$1(element).position) >= 0;
      var clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  
      if (!isElement(clipperElement)) {
        return [];
      } // $FlowFixMe[incompatible-return]: https://github.com/facebook/flow/issues/1414
  
  
      return clippingParents.filter(function (clippingParent) {
        return isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body';
      });
    } // Gets the maximum area that the element is visible in due to any number of
    // clipping parents
  
  
    function getClippingRect(element, boundary, rootBoundary) {
      var mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
      var clippingParents = [].concat(mainClippingParents, [rootBoundary]);
      var firstClippingParent = clippingParents[0];
      var clippingRect = clippingParents.reduce(function (accRect, clippingParent) {
        var rect = getClientRectFromMixedType(element, clippingParent);
        accRect.top = max(rect.top, accRect.top);
        accRect.right = min(rect.right, accRect.right);
        accRect.bottom = min(rect.bottom, accRect.bottom);
        accRect.left = max(rect.left, accRect.left);
        return accRect;
      }, getClientRectFromMixedType(element, firstClippingParent));
      clippingRect.width = clippingRect.right - clippingRect.left;
      clippingRect.height = clippingRect.bottom - clippingRect.top;
      clippingRect.x = clippingRect.left;
      clippingRect.y = clippingRect.top;
      return clippingRect;
    }
  
    function computeOffsets(_ref) {
      var reference = _ref.reference,
          element = _ref.element,
          placement = _ref.placement;
      var basePlacement = placement ? getBasePlacement(placement) : null;
      var variation = placement ? getVariation(placement) : null;
      var commonX = reference.x + reference.width / 2 - element.width / 2;
      var commonY = reference.y + reference.height / 2 - element.height / 2;
      var offsets;
  
      switch (basePlacement) {
        case top:
          offsets = {
            x: commonX,
            y: reference.y - element.height
          };
          break;
  
        case bottom:
          offsets = {
            x: commonX,
            y: reference.y + reference.height
          };
          break;
  
        case right:
          offsets = {
            x: reference.x + reference.width,
            y: commonY
          };
          break;
  
        case left:
          offsets = {
            x: reference.x - element.width,
            y: commonY
          };
          break;
  
        default:
          offsets = {
            x: reference.x,
            y: reference.y
          };
      }
  
      var mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  
      if (mainAxis != null) {
        var len = mainAxis === 'y' ? 'height' : 'width';
  
        switch (variation) {
          case start:
            offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
            break;
  
          case end:
            offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
            break;
        }
      }
  
      return offsets;
    }
  
    function detectOverflow(state, options) {
      if (options === void 0) {
        options = {};
      }
  
      var _options = options,
          _options$placement = _options.placement,
          placement = _options$placement === void 0 ? state.placement : _options$placement,
          _options$boundary = _options.boundary,
          boundary = _options$boundary === void 0 ? clippingParents : _options$boundary,
          _options$rootBoundary = _options.rootBoundary,
          rootBoundary = _options$rootBoundary === void 0 ? viewport : _options$rootBoundary,
          _options$elementConte = _options.elementContext,
          elementContext = _options$elementConte === void 0 ? popper : _options$elementConte,
          _options$altBoundary = _options.altBoundary,
          altBoundary = _options$altBoundary === void 0 ? false : _options$altBoundary,
          _options$padding = _options.padding,
          padding = _options$padding === void 0 ? 0 : _options$padding;
      var paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
      var altContext = elementContext === popper ? reference : popper;
      var popperRect = state.rects.popper;
      var element = state.elements[altBoundary ? altContext : elementContext];
      var clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
      var referenceClientRect = getBoundingClientRect(state.elements.reference);
      var popperOffsets = computeOffsets({
        reference: referenceClientRect,
        element: popperRect,
        strategy: 'absolute',
        placement: placement
      });
      var popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
      var elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect; // positive = overflowing the clipping rect
      // 0 or negative = within the clipping rect
  
      var overflowOffsets = {
        top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
        bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
        left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
        right: elementClientRect.right - clippingClientRect.right + paddingObject.right
      };
      var offsetData = state.modifiersData.offset; // Offsets can be applied only to the popper element
  
      if (elementContext === popper && offsetData) {
        var offset = offsetData[placement];
        Object.keys(overflowOffsets).forEach(function (key) {
          var multiply = [right, bottom].indexOf(key) >= 0 ? 1 : -1;
          var axis = [top, bottom].indexOf(key) >= 0 ? 'y' : 'x';
          overflowOffsets[key] += offset[axis] * multiply;
        });
      }
  
      return overflowOffsets;
    }
  
    function computeAutoPlacement(state, options) {
      if (options === void 0) {
        options = {};
      }
  
      var _options = options,
          placement = _options.placement,
          boundary = _options.boundary,
          rootBoundary = _options.rootBoundary,
          padding = _options.padding,
          flipVariations = _options.flipVariations,
          _options$allowedAutoP = _options.allowedAutoPlacements,
          allowedAutoPlacements = _options$allowedAutoP === void 0 ? placements : _options$allowedAutoP;
      var variation = getVariation(placement);
      var placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(function (placement) {
        return getVariation(placement) === variation;
      }) : basePlacements;
      var allowedPlacements = placements$1.filter(function (placement) {
        return allowedAutoPlacements.indexOf(placement) >= 0;
      });
  
      if (allowedPlacements.length === 0) {
        allowedPlacements = placements$1;
      } // $FlowFixMe[incompatible-type]: Flow seems to have problems with two array unions...
  
  
      var overflows = allowedPlacements.reduce(function (acc, placement) {
        acc[placement] = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding
        })[getBasePlacement(placement)];
        return acc;
      }, {});
      return Object.keys(overflows).sort(function (a, b) {
        return overflows[a] - overflows[b];
      });
    }
  
    function getExpandedFallbackPlacements(placement) {
      if (getBasePlacement(placement) === auto) {
        return [];
      }
  
      var oppositePlacement = getOppositePlacement(placement);
      return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
    }
  
    function flip(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;
  
      if (state.modifiersData[name]._skip) {
        return;
      }
  
      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? true : _options$altAxis,
          specifiedFallbackPlacements = options.fallbackPlacements,
          padding = options.padding,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          _options$flipVariatio = options.flipVariations,
          flipVariations = _options$flipVariatio === void 0 ? true : _options$flipVariatio,
          allowedAutoPlacements = options.allowedAutoPlacements;
      var preferredPlacement = state.options.placement;
      var basePlacement = getBasePlacement(preferredPlacement);
      var isBasePlacement = basePlacement === preferredPlacement;
      var fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
      var placements = [preferredPlacement].concat(fallbackPlacements).reduce(function (acc, placement) {
        return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          padding: padding,
          flipVariations: flipVariations,
          allowedAutoPlacements: allowedAutoPlacements
        }) : placement);
      }, []);
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var checksMap = new Map();
      var makeFallbackChecks = true;
      var firstFittingPlacement = placements[0];
  
      for (var i = 0; i < placements.length; i++) {
        var placement = placements[i];
  
        var _basePlacement = getBasePlacement(placement);
  
        var isStartVariation = getVariation(placement) === start;
        var isVertical = [top, bottom].indexOf(_basePlacement) >= 0;
        var len = isVertical ? 'width' : 'height';
        var overflow = detectOverflow(state, {
          placement: placement,
          boundary: boundary,
          rootBoundary: rootBoundary,
          altBoundary: altBoundary,
          padding: padding
        });
        var mainVariationSide = isVertical ? isStartVariation ? right : left : isStartVariation ? bottom : top;
  
        if (referenceRect[len] > popperRect[len]) {
          mainVariationSide = getOppositePlacement(mainVariationSide);
        }
  
        var altVariationSide = getOppositePlacement(mainVariationSide);
        var checks = [];
  
        if (checkMainAxis) {
          checks.push(overflow[_basePlacement] <= 0);
        }
  
        if (checkAltAxis) {
          checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
        }
  
        if (checks.every(function (check) {
          return check;
        })) {
          firstFittingPlacement = placement;
          makeFallbackChecks = false;
          break;
        }
  
        checksMap.set(placement, checks);
      }
  
      if (makeFallbackChecks) {
        // `2` may be desired in some cases – research later
        var numberOfChecks = flipVariations ? 3 : 1;
  
        var _loop = function _loop(_i) {
          var fittingPlacement = placements.find(function (placement) {
            var checks = checksMap.get(placement);
  
            if (checks) {
              return checks.slice(0, _i).every(function (check) {
                return check;
              });
            }
          });
  
          if (fittingPlacement) {
            firstFittingPlacement = fittingPlacement;
            return "break";
          }
        };
  
        for (var _i = numberOfChecks; _i > 0; _i--) {
          var _ret = _loop(_i);
  
          if (_ret === "break") break;
        }
      }
  
      if (state.placement !== firstFittingPlacement) {
        state.modifiersData[name]._skip = true;
        state.placement = firstFittingPlacement;
        state.reset = true;
      }
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const flip$1 = {
      name: 'flip',
      enabled: true,
      phase: 'main',
      fn: flip,
      requiresIfExists: ['offset'],
      data: {
        _skip: false
      }
    };
  
    function getSideOffsets(overflow, rect, preventedOffsets) {
      if (preventedOffsets === void 0) {
        preventedOffsets = {
          x: 0,
          y: 0
        };
      }
  
      return {
        top: overflow.top - rect.height - preventedOffsets.y,
        right: overflow.right - rect.width + preventedOffsets.x,
        bottom: overflow.bottom - rect.height + preventedOffsets.y,
        left: overflow.left - rect.width - preventedOffsets.x
      };
    }
  
    function isAnySideFullyClipped(overflow) {
      return [top, right, bottom, left].some(function (side) {
        return overflow[side] >= 0;
      });
    }
  
    function hide(_ref) {
      var state = _ref.state,
          name = _ref.name;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var preventedOffsets = state.modifiersData.preventOverflow;
      var referenceOverflow = detectOverflow(state, {
        elementContext: 'reference'
      });
      var popperAltOverflow = detectOverflow(state, {
        altBoundary: true
      });
      var referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
      var popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
      var isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
      var hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
      state.modifiersData[name] = {
        referenceClippingOffsets: referenceClippingOffsets,
        popperEscapeOffsets: popperEscapeOffsets,
        isReferenceHidden: isReferenceHidden,
        hasPopperEscaped: hasPopperEscaped
      };
      state.attributes.popper = Object.assign({}, state.attributes.popper, {
        'data-popper-reference-hidden': isReferenceHidden,
        'data-popper-escaped': hasPopperEscaped
      });
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const hide$1 = {
      name: 'hide',
      enabled: true,
      phase: 'main',
      requiresIfExists: ['preventOverflow'],
      fn: hide
    };
  
    function distanceAndSkiddingToXY(placement, rects, offset) {
      var basePlacement = getBasePlacement(placement);
      var invertDistance = [left, top].indexOf(basePlacement) >= 0 ? -1 : 1;
  
      var _ref = typeof offset === 'function' ? offset(Object.assign({}, rects, {
        placement: placement
      })) : offset,
          skidding = _ref[0],
          distance = _ref[1];
  
      skidding = skidding || 0;
      distance = (distance || 0) * invertDistance;
      return [left, right].indexOf(basePlacement) >= 0 ? {
        x: distance,
        y: skidding
      } : {
        x: skidding,
        y: distance
      };
    }
  
    function offset(_ref2) {
      var state = _ref2.state,
          options = _ref2.options,
          name = _ref2.name;
      var _options$offset = options.offset,
          offset = _options$offset === void 0 ? [0, 0] : _options$offset;
      var data = placements.reduce(function (acc, placement) {
        acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
        return acc;
      }, {});
      var _data$state$placement = data[state.placement],
          x = _data$state$placement.x,
          y = _data$state$placement.y;
  
      if (state.modifiersData.popperOffsets != null) {
        state.modifiersData.popperOffsets.x += x;
        state.modifiersData.popperOffsets.y += y;
      }
  
      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const offset$1 = {
      name: 'offset',
      enabled: true,
      phase: 'main',
      requires: ['popperOffsets'],
      fn: offset
    };
  
    function popperOffsets(_ref) {
      var state = _ref.state,
          name = _ref.name;
      // Offsets are the actual position the popper needs to have to be
      // properly positioned near its reference element
      // This is the most basic placement, and will be adjusted by
      // the modifiers in the next step
      state.modifiersData[name] = computeOffsets({
        reference: state.rects.reference,
        element: state.rects.popper,
        strategy: 'absolute',
        placement: state.placement
      });
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const popperOffsets$1 = {
      name: 'popperOffsets',
      enabled: true,
      phase: 'read',
      fn: popperOffsets,
      data: {}
    };
  
    function getAltAxis(axis) {
      return axis === 'x' ? 'y' : 'x';
    }
  
    function preventOverflow(_ref) {
      var state = _ref.state,
          options = _ref.options,
          name = _ref.name;
      var _options$mainAxis = options.mainAxis,
          checkMainAxis = _options$mainAxis === void 0 ? true : _options$mainAxis,
          _options$altAxis = options.altAxis,
          checkAltAxis = _options$altAxis === void 0 ? false : _options$altAxis,
          boundary = options.boundary,
          rootBoundary = options.rootBoundary,
          altBoundary = options.altBoundary,
          padding = options.padding,
          _options$tether = options.tether,
          tether = _options$tether === void 0 ? true : _options$tether,
          _options$tetherOffset = options.tetherOffset,
          tetherOffset = _options$tetherOffset === void 0 ? 0 : _options$tetherOffset;
      var overflow = detectOverflow(state, {
        boundary: boundary,
        rootBoundary: rootBoundary,
        padding: padding,
        altBoundary: altBoundary
      });
      var basePlacement = getBasePlacement(state.placement);
      var variation = getVariation(state.placement);
      var isBasePlacement = !variation;
      var mainAxis = getMainAxisFromPlacement(basePlacement);
      var altAxis = getAltAxis(mainAxis);
      var popperOffsets = state.modifiersData.popperOffsets;
      var referenceRect = state.rects.reference;
      var popperRect = state.rects.popper;
      var tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset(Object.assign({}, state.rects, {
        placement: state.placement
      })) : tetherOffset;
      var normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? {
        mainAxis: tetherOffsetValue,
        altAxis: tetherOffsetValue
      } : Object.assign({
        mainAxis: 0,
        altAxis: 0
      }, tetherOffsetValue);
      var offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
      var data = {
        x: 0,
        y: 0
      };
  
      if (!popperOffsets) {
        return;
      }
  
      if (checkMainAxis) {
        var _offsetModifierState$;
  
        var mainSide = mainAxis === 'y' ? top : left;
        var altSide = mainAxis === 'y' ? bottom : right;
        var len = mainAxis === 'y' ? 'height' : 'width';
        var offset = popperOffsets[mainAxis];
        var min$1 = offset + overflow[mainSide];
        var max$1 = offset - overflow[altSide];
        var additive = tether ? -popperRect[len] / 2 : 0;
        var minLen = variation === start ? referenceRect[len] : popperRect[len];
        var maxLen = variation === start ? -popperRect[len] : -referenceRect[len]; // We need to include the arrow in the calculation so the arrow doesn't go
       
        var arrowElement = state.elements.arrow;
        var arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : {
          width: 0,
          height: 0
        };
        var arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
        var arrowPaddingMin = arrowPaddingObject[mainSide];
        var arrowPaddingMax = arrowPaddingObject[altSide]; 
        var arrowLen = within(0, referenceRect[len], arrowRect[len]);
        var minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
        var maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
        var arrowOffsetParent = state.elements.arrow && getOffsetParent(state.elements.arrow);
        var clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
        var offsetModifierValue = (_offsetModifierState$ = offsetModifierState == null ? void 0 : offsetModifierState[mainAxis]) != null ? _offsetModifierState$ : 0;
        var tetherMin = offset + minOffset - offsetModifierValue - clientOffset;
        var tetherMax = offset + maxOffset - offsetModifierValue;
        var preventedOffset = within(tether ? min(min$1, tetherMin) : min$1, offset, tether ? max(max$1, tetherMax) : max$1);
        popperOffsets[mainAxis] = preventedOffset;
        data[mainAxis] = preventedOffset - offset;
      }
  
      if (checkAltAxis) {
        var _offsetModifierState$2;
  
        var _mainSide = mainAxis === 'x' ? top : left;
  
        var _altSide = mainAxis === 'x' ? bottom : right;
  
        var _offset = popperOffsets[altAxis];
  
        var _len = altAxis === 'y' ? 'height' : 'width';
  
        var _min = _offset + overflow[_mainSide];
  
        var _max = _offset - overflow[_altSide];
  
        var isOriginSide = [top, left].indexOf(basePlacement) !== -1;
  
        var _offsetModifierValue = (_offsetModifierState$2 = offsetModifierState == null ? void 0 : offsetModifierState[altAxis]) != null ? _offsetModifierState$2 : 0;
  
        var _tetherMin = isOriginSide ? _min : _offset - referenceRect[_len] - popperRect[_len] - _offsetModifierValue + normalizedTetherOffsetValue.altAxis;
  
        var _tetherMax = isOriginSide ? _offset + referenceRect[_len] + popperRect[_len] - _offsetModifierValue - normalizedTetherOffsetValue.altAxis : _max;
  
        var _preventedOffset = tether && isOriginSide ? withinMaxClamp(_tetherMin, _offset, _tetherMax) : within(tether ? _tetherMin : _min, _offset, tether ? _tetherMax : _max);
  
        popperOffsets[altAxis] = _preventedOffset;
        data[altAxis] = _preventedOffset - _offset;
      }
  
      state.modifiersData[name] = data;
    } // eslint-disable-next-line import/no-unused-modules
  
  
    const preventOverflow$1 = {
      name: 'preventOverflow',
      enabled: true,
      phase: 'main',
      fn: preventOverflow,
      requiresIfExists: ['offset']
    };
  
    function getHTMLElementScroll(element) {
      return {
        scrollLeft: element.scrollLeft,
        scrollTop: element.scrollTop
      };
    }
  
    function getNodeScroll(node) {
      if (node === getWindow(node) || !isHTMLElement(node)) {
        return getWindowScroll(node);
      } else {
        return getHTMLElementScroll(node);
      }
    }
  
    function isElementScaled(element) {
      var rect = element.getBoundingClientRect();
      var scaleX = round(rect.width) / element.offsetWidth || 1;
      var scaleY = round(rect.height) / element.offsetHeight || 1;
      return scaleX !== 1 || scaleY !== 1;
    } // Returns the composite rect of an element relative to its offsetParent.
    // Composite means it takes into account transforms as well as layout.
  
  
    function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
      if (isFixed === void 0) {
        isFixed = false;
      }
  
      var isOffsetParentAnElement = isHTMLElement(offsetParent);
      var offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
      var documentElement = getDocumentElement(offsetParent);
      var rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled);
      var scroll = {
        scrollLeft: 0,
        scrollTop: 0
      };
      var offsets = {
        x: 0,
        y: 0
      };
  
      if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
        if (getNodeName(offsetParent) !== 'body' || // https://github.com/popperjs/popper-core/issues/1078
        isScrollParent(documentElement)) {
          scroll = getNodeScroll(offsetParent);
        }
  
        if (isHTMLElement(offsetParent)) {
          offsets = getBoundingClientRect(offsetParent, true);
          offsets.x += offsetParent.clientLeft;
          offsets.y += offsetParent.clientTop;
        } else if (documentElement) {
          offsets.x = getWindowScrollBarX(documentElement);
        }
      }
  
      return {
        x: rect.left + scroll.scrollLeft - offsets.x,
        y: rect.top + scroll.scrollTop - offsets.y,
        width: rect.width,
        height: rect.height
      };
    }
  
    function order(modifiers) {
      var map = new Map();
      var visited = new Set();
      var result = [];
      modifiers.forEach(function (modifier) {
        map.set(modifier.name, modifier);
      }); // On visiting object, check for its dependencies and visit them recursively
  
      function sort(modifier) {
        visited.add(modifier.name);
        var requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
        requires.forEach(function (dep) {
          if (!visited.has(dep)) {
            var depModifier = map.get(dep);
  
            if (depModifier) {
              sort(depModifier);
            }
          }
        });
        result.push(modifier);
      }
  
      modifiers.forEach(function (modifier) {
        if (!visited.has(modifier.name)) {
          // check for visited object
          sort(modifier);
        }
      });
      return result;
    }
  
    function orderModifiers(modifiers) {
      // order based on dependencies
      var orderedModifiers = order(modifiers); // order based on phase
  
      return modifierPhases.reduce(function (acc, phase) {
        return acc.concat(orderedModifiers.filter(function (modifier) {
          return modifier.phase === phase;
        }));
      }, []);
    }
  
    function debounce(fn) {
      var pending;
      return function () {
        if (!pending) {
          pending = new Promise(function (resolve) {
            Promise.resolve().then(function () {
              pending = undefined;
              resolve(fn());
            });
          });
        }
  
        return pending;
      };
    }
  
    function mergeByName(modifiers) {
      var merged = modifiers.reduce(function (merged, current) {
        var existing = merged[current.name];
        merged[current.name] = existing ? Object.assign({}, existing, current, {
          options: Object.assign({}, existing.options, current.options),
          data: Object.assign({}, existing.data, current.data)
        }) : current;
        return merged;
      }, {}); // IE11 does not support Object.values
  
      return Object.keys(merged).map(function (key) {
        return merged[key];
      });
    }
  
    var DEFAULT_OPTIONS = {
      placement: 'bottom',
      modifiers: [],
      strategy: 'absolute'
    };
  
    function areValidElements() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
  
      return !args.some(function (element) {
        return !(element && typeof element.getBoundingClientRect === 'function');
      });
    }
  
    function popperGenerator(generatorOptions) {
      if (generatorOptions === void 0) {
        generatorOptions = {};
      }
  
      var _generatorOptions = generatorOptions,
          _generatorOptions$def = _generatorOptions.defaultModifiers,
          defaultModifiers = _generatorOptions$def === void 0 ? [] : _generatorOptions$def,
          _generatorOptions$def2 = _generatorOptions.defaultOptions,
          defaultOptions = _generatorOptions$def2 === void 0 ? DEFAULT_OPTIONS : _generatorOptions$def2;
      return function createPopper(reference, popper, options) {
        if (options === void 0) {
          options = defaultOptions;
        }
  
        var state = {
          placement: 'bottom',
          orderedModifiers: [],
          options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
          modifiersData: {},
          elements: {
            reference: reference,
            popper: popper
          },
          attributes: {},
          styles: {}
        };
        var effectCleanupFns = [];
        var isDestroyed = false;
        var instance = {
          state: state,
          setOptions: function setOptions(setOptionsAction) {
            var options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
            cleanupModifierEffects();
            state.options = Object.assign({}, defaultOptions, state.options, options);
            state.scrollParents = {
              reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
              popper: listScrollParents(popper)
            }; // Orders the modifiers based on their dependencies and `phase`
            // properties
  
            var orderedModifiers = orderModifiers(mergeByName([].concat(defaultModifiers, state.options.modifiers))); // Strip out disabled modifiers
  
            state.orderedModifiers = orderedModifiers.filter(function (m) {
              return m.enabled;
            }); // Validate the provided modifiers so that the consumer will get warned
  
            runModifierEffects();
            return instance.update();
          },
          // Sync update – it will always be executed, even if not necessary. This
          // is useful for low frequency updates where sync behavior simplifies the
          // logic.
          // For high frequency updates (e.g. `resize` and `scroll` events), always
          // prefer the async Popper#update method
          forceUpdate: function forceUpdate() {
            if (isDestroyed) {
              return;
            }
  
            var _state$elements = state.elements,
                reference = _state$elements.reference,
                popper = _state$elements.popper; // Don't proceed if `reference` or `popper` are not valid elements
            // anymore
  
            if (!areValidElements(reference, popper)) {
  
              return;
            } // Store the reference and popper rects to be read by modifiers
  
  
            state.rects = {
              reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
              popper: getLayoutRect(popper)
            }; 
            state.reset = false;
            state.placement = state.options.placement; // On each update cycle, the `modifiersData` property for each modifier
         
            state.orderedModifiers.forEach(function (modifier) {
              return state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
            });
  
            for (var index = 0; index < state.orderedModifiers.length; index++) {
  
              if (state.reset === true) {
                state.reset = false;
                index = -1;
                continue;
              }
  
              var _state$orderedModifie = state.orderedModifiers[index],
                  fn = _state$orderedModifie.fn,
                  _state$orderedModifie2 = _state$orderedModifie.options,
                  _options = _state$orderedModifie2 === void 0 ? {} : _state$orderedModifie2,
                  name = _state$orderedModifie.name;
  
              if (typeof fn === 'function') {
                state = fn({
                  state: state,
                  options: _options,
                  name: name,
                  instance: instance
                }) || state;
              }
            }
          },
          // Async and optimistically optimized update – it will not be executed if
          // not necessary (debounced to run at most once-per-tick)
          update: debounce(function () {
            return new Promise(function (resolve) {
              instance.forceUpdate();
              resolve(state);
            });
          }),
          destroy: function destroy() {
            cleanupModifierEffects();
            isDestroyed = true;
          }
        };
  
        if (!areValidElements(reference, popper)) {
  
          return instance;
        }
  
        instance.setOptions(options).then(function (state) {
          if (!isDestroyed && options.onFirstUpdate) {
            options.onFirstUpdate(state);
          }
        }); // Modifiers have the ability to execute arbitrary code before the first
        // update cycle runs. They will be executed in the same order as the update
        // cycle. This is useful when a modifier adds some persistent data that
        // other modifiers need to use, but the modifier is run after the dependent
        // one.
  
        function runModifierEffects() {
          state.orderedModifiers.forEach(function (_ref3) {
            var name = _ref3.name,
                _ref3$options = _ref3.options,
                options = _ref3$options === void 0 ? {} : _ref3$options,
                effect = _ref3.effect;
  
            if (typeof effect === 'function') {
              var cleanupFn = effect({
                state: state,
                name: name,
                instance: instance,
                options: options
              });
  
              var noopFn = function noopFn() {};
  
              effectCleanupFns.push(cleanupFn || noopFn);
            }
          });
        }
  
        function cleanupModifierEffects() {
          effectCleanupFns.forEach(function (fn) {
            return fn();
          });
          effectCleanupFns = [];
        }
  
        return instance;
      };
    }
    var createPopper$2 = /*#__PURE__*/popperGenerator(); // eslint-disable-next-line import/no-unused-modules
  
    var defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
    var createPopper$1 = /*#__PURE__*/popperGenerator({
      defaultModifiers: defaultModifiers$1
    }); // eslint-disable-next-line import/no-unused-modules
  
    var defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
    var createPopper = /*#__PURE__*/popperGenerator({
      defaultModifiers: defaultModifiers
    }); // eslint-disable-next-line import/no-unused-modules
  
    const Popper = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
      __proto__: null,
      popperGenerator,
      detectOverflow,
      createPopperBase: createPopper$2,
      createPopper,
      createPopperLite: createPopper$1,
      top,
      bottom,
      right,
      left,
      auto,
      basePlacements,
      start,
      end,
      clippingParents,
      viewport,
      popper,
      reference,
      variationPlacements,
      placements,
      beforeRead,
      read,
      afterRead,
      beforeMain,
      main,
      afterMain,
      beforeWrite,
      write,
      afterWrite,
      modifierPhases,
      applyStyles: applyStyles$1,
      arrow: arrow$1,
      computeStyles: computeStyles$1,
      eventListeners,
      flip: flip$1,
      hide: hide$1,
      offset: offset$1,
      popperOffsets: popperOffsets$1,
      preventOverflow: preventOverflow$1
    }, Symbol.toStringTag, { value: 'Module' }));
  
   
  
    const NAME$a = 'dropdown';
    const DATA_KEY$6 = 'bs.dropdown';
    const EVENT_KEY$6 = `.${DATA_KEY$6}`;
    const DATA_API_KEY$3 = '.data-api';
    const ESCAPE_KEY$2 = 'Escape';
    const TAB_KEY$1 = 'Tab';
    const ARROW_UP_KEY$1 = 'ArrowUp';
    const ARROW_DOWN_KEY$1 = 'ArrowDown';
    const RIGHT_MOUSE_BUTTON = 2; // MouseEvent.button value for the secondary button, usually the right button
  
    const EVENT_HIDE$5 = `hide${EVENT_KEY$6}`;
    const EVENT_HIDDEN$5 = `hidden${EVENT_KEY$6}`;
    const EVENT_SHOW$5 = `show${EVENT_KEY$6}`;
    const EVENT_SHOWN$5 = `shown${EVENT_KEY$6}`;
    const EVENT_CLICK_DATA_API$3 = `click${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYDOWN_DATA_API = `keydown${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const EVENT_KEYUP_DATA_API = `keyup${EVENT_KEY$6}${DATA_API_KEY$3}`;
    const CLASS_NAME_SHOW$6 = 'show';
    const CLASS_NAME_DROPUP = 'dropup';
    const CLASS_NAME_DROPEND = 'dropend';
    const CLASS_NAME_DROPSTART = 'dropstart';
    const CLASS_NAME_DROPUP_CENTER = 'dropup-center';
    const CLASS_NAME_DROPDOWN_CENTER = 'dropdown-center';
    const SELECTOR_DATA_TOGGLE$3 = '[data-bs-toggle="dropdown"]:not(.disabled):not(:disabled)';
    const SELECTOR_DATA_TOGGLE_SHOWN = `${SELECTOR_DATA_TOGGLE$3}.${CLASS_NAME_SHOW$6}`;
    const SELECTOR_MENU = '.dropdown-menu';
    const SELECTOR_NAVBAR = '.navbar';
    const SELECTOR_NAVBAR_NAV = '.navbar-nav';
    const SELECTOR_VISIBLE_ITEMS = '.dropdown-menu .dropdown-item:not(.disabled):not(:disabled)';
    const PLACEMENT_TOP = isRTL() ? 'top-end' : 'top-start';
    const PLACEMENT_TOPEND = isRTL() ? 'top-start' : 'top-end';
    const PLACEMENT_BOTTOM = isRTL() ? 'bottom-end' : 'bottom-start';
    const PLACEMENT_BOTTOMEND = isRTL() ? 'bottom-start' : 'bottom-end';
    const PLACEMENT_RIGHT = isRTL() ? 'left-start' : 'right-start';
    const PLACEMENT_LEFT = isRTL() ? 'right-start' : 'left-start';
    const PLACEMENT_TOPCENTER = 'top';
    const PLACEMENT_BOTTOMCENTER = 'bottom';
    const Default$9 = {
      autoClose: true,
      boundary: 'clippingParents',
      display: 'dynamic',
      offset: [0, 2],
      popperConfig: null,
      reference: 'toggle'
    };
    const DefaultType$9 = {
      autoClose: '(boolean|string)',
      boundary: '(string|element)',
      display: 'string',
      offset: '(array|string|function)',
      popperConfig: '(null|object|function)',
      reference: '(string|element|object)'
    };
    /**
     * Class definition
     */
  
    class Dropdown extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._popper = null;
        this._parent = this._element.parentNode; // dropdown wrapper
  
        this._menu = SelectorEngine.findOne(SELECTOR_MENU, this._parent);
        this._inNavbar = this._detectNavbar();
      } // Getters
  
  
      static get Default() {
        return Default$9;
      }
  
      static get DefaultType() {
        return DefaultType$9;
      }
  
      static get NAME() {
        return NAME$a;
      } // Public
  
  
      toggle() {
        return this._isShown() ? this.hide() : this.show();
      }
  
      show() {
        if (isDisabled(this._element) || this._isShown()) {
          return;
        }
  
        const relatedTarget = {
          relatedTarget: this._element
        };
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$5, relatedTarget);
  
        if (showEvent.defaultPrevented) {
          return;
        }
  
        this._createPopper(); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
  
  
        if ('ontouchstart' in document.documentElement && !this._parent.closest(SELECTOR_NAVBAR_NAV)) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.on(element, 'mouseover', noop);
          }
        }
  
        this._element.focus();
  
        this._element.setAttribute('aria-expanded', true);
  
        this._menu.classList.add(CLASS_NAME_SHOW$6);
  
        this._element.classList.add(CLASS_NAME_SHOW$6);
  
        EventHandler.trigger(this._element, EVENT_SHOWN$5, relatedTarget);
      }
  
      hide() {
        if (isDisabled(this._element) || !this._isShown()) {
          return;
        }
  
        const relatedTarget = {
          relatedTarget: this._element
        };
  
        this._completeHide(relatedTarget);
      }
  
      dispose() {
        if (this._popper) {
          this._popper.destroy();
        }
  
        super.dispose();
      }
  
      update() {
        this._inNavbar = this._detectNavbar();
  
        if (this._popper) {
          this._popper.update();
        }
      } // Private
  
  
      _completeHide(relatedTarget) {
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$5, relatedTarget);
  
        if (hideEvent.defaultPrevented) {
          return;
        } // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
  
  
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.off(element, 'mouseover', noop);
          }
        }
  
        if (this._popper) {
          this._popper.destroy();
        }
  
        this._menu.classList.remove(CLASS_NAME_SHOW$6);
  
        this._element.classList.remove(CLASS_NAME_SHOW$6);
  
        this._element.setAttribute('aria-expanded', 'false');
  
        Manipulator.removeDataAttribute(this._menu, 'popper');
        EventHandler.trigger(this._element, EVENT_HIDDEN$5, relatedTarget);
      }
  
      _getConfig(config) {
        config = super._getConfig(config);
  
        if (typeof config.reference === 'object' && !isElement$1(config.reference) && typeof config.reference.getBoundingClientRect !== 'function') {
          // Popper virtual elements require a getBoundingClientRect method
          throw new TypeError(`${NAME$a.toUpperCase()}: Option "reference" provided type "object" without a required "getBoundingClientRect" method.`);
        }
  
        return config;
      }
  
      _createPopper() {
        if (typeof Popper === 'undefined') {
          throw new TypeError('Nope');
        }
  
        let referenceElement = this._element;
  
        if (this._config.reference === 'parent') {
          referenceElement = this._parent;
        } else if (isElement$1(this._config.reference)) {
          referenceElement = getElement(this._config.reference);
        } else if (typeof this._config.reference === 'object') {
          referenceElement = this._config.reference;
        }
  
        const popperConfig = this._getPopperConfig();
  
        this._popper = createPopper(referenceElement, this._menu, popperConfig);
      }
  
      _isShown() {
        return this._menu.classList.contains(CLASS_NAME_SHOW$6);
      }
  
      _getPlacement() {
        const parentDropdown = this._parent;
  
        if (parentDropdown.classList.contains(CLASS_NAME_DROPEND)) {
          return PLACEMENT_RIGHT;
        }
  
        if (parentDropdown.classList.contains(CLASS_NAME_DROPSTART)) {
          return PLACEMENT_LEFT;
        }
  
        if (parentDropdown.classList.contains(CLASS_NAME_DROPUP_CENTER)) {
          return PLACEMENT_TOPCENTER;
        }
  
        if (parentDropdown.classList.contains(CLASS_NAME_DROPDOWN_CENTER)) {
          return PLACEMENT_BOTTOMCENTER;
        } // We need to trim the value because custom properties can also include spaces
  
  
        const isEnd = getComputedStyle(this._menu).getPropertyValue('--bs-position').trim() === 'end';
  
        if (parentDropdown.classList.contains(CLASS_NAME_DROPUP)) {
          return isEnd ? PLACEMENT_TOPEND : PLACEMENT_TOP;
        }
  
        return isEnd ? PLACEMENT_BOTTOMEND : PLACEMENT_BOTTOM;
      }
  
      _detectNavbar() {
        return this._element.closest(SELECTOR_NAVBAR) !== null;
      }
  
      _getOffset() {
        const {
          offset
        } = this._config;
  
        if (typeof offset === 'string') {
          return offset.split(',').map(value => Number.parseInt(value, 10));
        }
  
        if (typeof offset === 'function') {
          return popperData => offset(popperData, this._element);
        }
  
        return offset;
      }
  
      _getPopperConfig() {
        const defaultBsPopperConfig = {
          placement: this._getPlacement(),
          modifiers: [{
            name: 'preventOverflow',
            options: {
              boundary: this._config.boundary
            }
          }, {
            name: 'offset',
            options: {
              offset: this._getOffset()
            }
          }]
        }; // Disable Popper if we have a static display or Dropdown is in Navbar
  
        if (this._inNavbar || this._config.display === 'static') {
          Manipulator.setDataAttribute(this._menu, 'popper', 'static'); // todo:v6 remove
  
          defaultBsPopperConfig.modifiers = [{
            name: 'applyStyles',
            enabled: false
          }];
        }
  
        return { ...defaultBsPopperConfig,
          ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
        };
      }
  
      _selectMenuItem({
        key,
        target
      }) {
        const items = SelectorEngine.find(SELECTOR_VISIBLE_ITEMS, this._menu).filter(element => isVisible(element));
  
        if (!items.length) {
          return;
        } // if target isn't included in items (e.g. when expanding the dropdown)
        // allow cycling to get the last item in case key equals ARROW_UP_KEY
  
  
        getNextActiveElement(items, target, key === ARROW_DOWN_KEY$1, !items.includes(target)).focus();
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Dropdown.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config]();
        });
      }
  
      static clearMenus(event) {
        if (event.button === RIGHT_MOUSE_BUTTON || event.type === 'keyup' && event.key !== TAB_KEY$1) {
          return;
        }
  
        const openToggles = SelectorEngine.find(SELECTOR_DATA_TOGGLE_SHOWN);
  
        for (const toggle of openToggles) {
          const context = Dropdown.getInstance(toggle);
  
          if (!context || context._config.autoClose === false) {
            continue;
          }
  
          const composedPath = event.composedPath();
          const isMenuTarget = composedPath.includes(context._menu);
  
          if (composedPath.includes(context._element) || context._config.autoClose === 'inside' && !isMenuTarget || context._config.autoClose === 'outside' && isMenuTarget) {
            continue;
          } // Tab navigation through the dropdown menu or events from contained inputs shouldn't close the menu
  
  
          if (context._menu.contains(event.target) && (event.type === 'keyup' && event.key === TAB_KEY$1 || /input|select|option|textarea|form/i.test(event.target.tagName))) {
            continue;
          }
  
          const relatedTarget = {
            relatedTarget: context._element
          };
  
          if (event.type === 'click') {
            relatedTarget.clickEvent = event;
          }
  
          context._completeHide(relatedTarget);
        }
      }
  
      static dataApiKeydownHandler(event) {
        // If not an UP | DOWN | ESCAPE key => not a dropdown command
        // If input/textarea && if key is other than ESCAPE => not a dropdown command
        const isInput = /input|textarea/i.test(event.target.tagName);
        const isEscapeEvent = event.key === ESCAPE_KEY$2;
        const isUpOrDownEvent = [ARROW_UP_KEY$1, ARROW_DOWN_KEY$1].includes(event.key);
  
        if (!isUpOrDownEvent && !isEscapeEvent) {
          return;
        }
  
        if (isInput && !isEscapeEvent) {
          return;
        }
  
        event.preventDefault();
        const getToggleButton = SelectorEngine.findOne(SELECTOR_DATA_TOGGLE$3, event.delegateTarget.parentNode);
        const instance = Dropdown.getOrCreateInstance(getToggleButton);
  
        if (isUpOrDownEvent) {
          event.stopPropagation();
          instance.show();
  
          instance._selectMenuItem(event);
  
          return;
        }
  
        if (instance._isShown()) {
          // else is escape and we check if it is shown
          event.stopPropagation();
          instance.hide();
          getToggleButton.focus();
        }
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_DATA_TOGGLE$3, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_KEYDOWN_DATA_API, SELECTOR_MENU, Dropdown.dataApiKeydownHandler);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_KEYUP_DATA_API, Dropdown.clearMenus);
    EventHandler.on(document, EVENT_CLICK_DATA_API$3, SELECTOR_DATA_TOGGLE$3, function (event) {
      event.preventDefault();
      Dropdown.getOrCreateInstance(this).toggle();
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Dropdown);
  
   
  
    const SELECTOR_FIXED_CONTENT = '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top';
    const SELECTOR_STICKY_CONTENT = '.sticky-top';
    const PROPERTY_PADDING = 'padding-right';
    const PROPERTY_MARGIN = 'margin-right';
    /**
     * Class definition
     */
  
    class ScrollBarHelper {
      constructor() {
        this._element = document.body;
      } // Public
  
  
      getWidth() {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/innerWidth#usage_notes
        const documentWidth = document.documentElement.clientWidth;
        return Math.abs(window.innerWidth - documentWidth);
      }
  
      hide() {
        const width = this.getWidth();
  
        this._disableOverFlow(); // give padding to element to balance the hidden scrollbar width
  
  
        this._setElementAttributes(this._element, PROPERTY_PADDING, calculatedValue => calculatedValue + width); // trick: We adjust positive paddingRight and negative marginRight to sticky-top elements to keep showing fullwidth
  
  
        this._setElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING, calculatedValue => calculatedValue + width);
  
        this._setElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN, calculatedValue => calculatedValue - width);
      }
  
      reset() {
        this._resetElementAttributes(this._element, 'overflow');
  
        this._resetElementAttributes(this._element, PROPERTY_PADDING);
  
        this._resetElementAttributes(SELECTOR_FIXED_CONTENT, PROPERTY_PADDING);
  
        this._resetElementAttributes(SELECTOR_STICKY_CONTENT, PROPERTY_MARGIN);
      }
  
      isOverflowing() {
        return this.getWidth() > 0;
      } // Private
  
  
      _disableOverFlow() {
        this._saveInitialAttribute(this._element, 'overflow');
  
        this._element.style.overflow = 'hidden';
      }
  
      _setElementAttributes(selector, styleProperty, callback) {
        const scrollbarWidth = this.getWidth();
  
        const manipulationCallBack = element => {
          if (element !== this._element && window.innerWidth > element.clientWidth + scrollbarWidth) {
            return;
          }
  
          this._saveInitialAttribute(element, styleProperty);
  
          const calculatedValue = window.getComputedStyle(element).getPropertyValue(styleProperty);
          element.style.setProperty(styleProperty, `${callback(Number.parseFloat(calculatedValue))}px`);
        };
  
        this._applyManipulationCallback(selector, manipulationCallBack);
      }
  
      _saveInitialAttribute(element, styleProperty) {
        const actualValue = element.style.getPropertyValue(styleProperty);
  
        if (actualValue) {
          Manipulator.setDataAttribute(element, styleProperty, actualValue);
        }
      }
  
      _resetElementAttributes(selector, styleProperty) {
        const manipulationCallBack = element => {
          const value = Manipulator.getDataAttribute(element, styleProperty); // We only want to remove the property if the value is `null`; the value can also be zero
  
          if (value === null) {
            element.style.removeProperty(styleProperty);
            return;
          }
  
          Manipulator.removeDataAttribute(element, styleProperty);
          element.style.setProperty(styleProperty, value);
        };
  
        this._applyManipulationCallback(selector, manipulationCallBack);
      }
  
      _applyManipulationCallback(selector, callBack) {
        if (isElement$1(selector)) {
          callBack(selector);
          return;
        }
  
        for (const sel of SelectorEngine.find(selector, this._element)) {
          callBack(sel);
        }
      }
  
    }
  
  
    const NAME$9 = 'backdrop';
    const CLASS_NAME_FADE$4 = 'fade';
    const CLASS_NAME_SHOW$5 = 'show';
    const EVENT_MOUSEDOWN = `mousedown.bs.${NAME$9}`;
    const Default$8 = {
      className: 'modal-backdrop',
      clickCallback: null,
      isAnimated: false,
      isVisible: true,
      // if false, we use the backdrop helper without adding any element to the dom
      rootElement: 'body' // give the choice to place backdrop under different elements
  
    };
    const DefaultType$8 = {
      className: 'string',
      clickCallback: '(function|null)',
      isAnimated: 'boolean',
      isVisible: 'boolean',
      rootElement: '(element|string)'
    };
    /**
     * Class definition
     */
  
    class Backdrop extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
        this._isAppended = false;
        this._element = null;
      } // Getters
  
  
      static get Default() {
        return Default$8;
      }
  
      static get DefaultType() {
        return DefaultType$8;
      }
  
      static get NAME() {
        return NAME$9;
      } // Public
  
  
      show(callback) {
        if (!this._config.isVisible) {
          execute(callback);
          return;
        }
  
        this._append();
  
        const element = this._getElement();
  
        if (this._config.isAnimated) {
          reflow(element);
        }
  
        element.classList.add(CLASS_NAME_SHOW$5);
  
        this._emulateAnimation(() => {
          execute(callback);
        });
      }
  
      hide(callback) {
        if (!this._config.isVisible) {
          execute(callback);
          return;
        }
  
        this._getElement().classList.remove(CLASS_NAME_SHOW$5);
  
        this._emulateAnimation(() => {
          this.dispose();
          execute(callback);
        });
      }
  
      dispose() {
        if (!this._isAppended) {
          return;
        }
  
        EventHandler.off(this._element, EVENT_MOUSEDOWN);
  
        this._element.remove();
  
        this._isAppended = false;
      } // Private
  
  
      _getElement() {
        if (!this._element) {
          const backdrop = document.createElement('div');
          backdrop.className = this._config.className;
  
          if (this._config.isAnimated) {
            backdrop.classList.add(CLASS_NAME_FADE$4);
          }
  
          this._element = backdrop;
        }
  
        return this._element;
      }
  
      _configAfterMerge(config) {
        // use getElement() with the default "body" to get a fresh Element on each instantiation
        config.rootElement = getElement(config.rootElement);
        return config;
      }
  
      _append() {
        if (this._isAppended) {
          return;
        }
  
        const element = this._getElement();
  
        this._config.rootElement.append(element);
  
        EventHandler.on(element, EVENT_MOUSEDOWN, () => {
          execute(this._config.clickCallback);
        });
        this._isAppended = true;
      }
  
      _emulateAnimation(callback) {
        executeAfterTransition(callback, this._getElement(), this._config.isAnimated);
      }
  
    }
  
  
    const NAME$8 = 'focustrap';
    const DATA_KEY$5 = 'bs.focustrap';
    const EVENT_KEY$5 = `.${DATA_KEY$5}`;
    const EVENT_FOCUSIN$2 = `focusin${EVENT_KEY$5}`;
    const EVENT_KEYDOWN_TAB = `keydown.tab${EVENT_KEY$5}`;
    const TAB_KEY = 'Tab';
    const TAB_NAV_FORWARD = 'forward';
    const TAB_NAV_BACKWARD = 'backward';
    const Default$7 = {
      autofocus: true,
      trapElement: null // The element to trap focus inside of
  
    };
    const DefaultType$7 = {
      autofocus: 'boolean',
      trapElement: 'element'
    };
    /**
     * Class definition
     */
  
    class FocusTrap extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
        this._isActive = false;
        this._lastTabNavDirection = null;
      } // Getters
  
  
      static get Default() {
        return Default$7;
      }
  
      static get DefaultType() {
        return DefaultType$7;
      }
  
      static get NAME() {
        return NAME$8;
      } // Public
  
  
      activate() {
        if (this._isActive) {
          return;
        }
  
        if (this._config.autofocus) {
          this._config.trapElement.focus();
        }
  
        EventHandler.off(document, EVENT_KEY$5); // guard against infinite focus loop
  
        EventHandler.on(document, EVENT_FOCUSIN$2, event => this._handleFocusin(event));
        EventHandler.on(document, EVENT_KEYDOWN_TAB, event => this._handleKeydown(event));
        this._isActive = true;
      }
  
      deactivate() {
        if (!this._isActive) {
          return;
        }
  
        this._isActive = false;
        EventHandler.off(document, EVENT_KEY$5);
      } // Private
  
  
      _handleFocusin(event) {
        const {
          trapElement
        } = this._config;
  
        if (event.target === document || event.target === trapElement || trapElement.contains(event.target)) {
          return;
        }
  
        const elements = SelectorEngine.focusableChildren(trapElement);
  
        if (elements.length === 0) {
          trapElement.focus();
        } else if (this._lastTabNavDirection === TAB_NAV_BACKWARD) {
          elements[elements.length - 1].focus();
        } else {
          elements[0].focus();
        }
      }
  
      _handleKeydown(event) {
        if (event.key !== TAB_KEY) {
          return;
        }
  
        this._lastTabNavDirection = event.shiftKey ? TAB_NAV_BACKWARD : TAB_NAV_FORWARD;
      }
  
    }
  
  
    const NAME$7 = 'modal';
    const DATA_KEY$4 = 'bs.modal';
    const EVENT_KEY$4 = `.${DATA_KEY$4}`;
    const DATA_API_KEY$2 = '.data-api';
    const ESCAPE_KEY$1 = 'Escape';
    const EVENT_HIDE$4 = `hide${EVENT_KEY$4}`;
    const EVENT_HIDE_PREVENTED$1 = `hidePrevented${EVENT_KEY$4}`;
    const EVENT_HIDDEN$4 = `hidden${EVENT_KEY$4}`;
    const EVENT_SHOW$4 = `show${EVENT_KEY$4}`;
    const EVENT_SHOWN$4 = `shown${EVENT_KEY$4}`;
    const EVENT_RESIZE$1 = `resize${EVENT_KEY$4}`;
    const EVENT_MOUSEDOWN_DISMISS = `mousedown.dismiss${EVENT_KEY$4}`;
    const EVENT_KEYDOWN_DISMISS$1 = `keydown.dismiss${EVENT_KEY$4}`;
    const EVENT_CLICK_DATA_API$2 = `click${EVENT_KEY$4}${DATA_API_KEY$2}`;
    const CLASS_NAME_OPEN = 'modal-open';
    const CLASS_NAME_FADE$3 = 'fade';
    const CLASS_NAME_SHOW$4 = 'show';
    const CLASS_NAME_STATIC = 'modal-static';
    const OPEN_SELECTOR$1 = '.modal.show';
    const SELECTOR_DIALOG = '.modal-dialog';
    const SELECTOR_MODAL_BODY = '.modal-body';
    const SELECTOR_DATA_TOGGLE$2 = '[data-bs-toggle="modal"]';
    const Default$6 = {
      backdrop: true,
      focus: true,
      keyboard: true
    };
    const DefaultType$6 = {
      backdrop: '(boolean|string)',
      focus: 'boolean',
      keyboard: 'boolean'
    };
    /**
     * Class definition
     */
  
    class Modal extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._dialog = SelectorEngine.findOne(SELECTOR_DIALOG, this._element);
        this._backdrop = this._initializeBackDrop();
        this._focustrap = this._initializeFocusTrap();
        this._isShown = false;
        this._isTransitioning = false;
        this._scrollBar = new ScrollBarHelper();
  
        this._addEventListeners();
      } // Getters
  
  
      static get Default() {
        return Default$6;
      }
  
      static get DefaultType() {
        return DefaultType$6;
      }
  
      static get NAME() {
        return NAME$7;
      } // Public
  
  
      toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
      }
  
      show(relatedTarget) {
        if (this._isShown || this._isTransitioning) {
          return;
        }
  
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$4, {
          relatedTarget
        });
  
        if (showEvent.defaultPrevented) {
          return;
        }
  
        this._isShown = true;
        this._isTransitioning = true;
  
        this._scrollBar.hide();
  
        document.body.classList.add(CLASS_NAME_OPEN);
  
        this._adjustDialog();
  
        this._backdrop.show(() => this._showElement(relatedTarget));
      }
  
      hide() {
        if (!this._isShown || this._isTransitioning) {
          return;
        }
  
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$4);
  
        if (hideEvent.defaultPrevented) {
          return;
        }
  
        this._isShown = false;
        this._isTransitioning = true;
  
        this._focustrap.deactivate();
  
        this._element.classList.remove(CLASS_NAME_SHOW$4);
  
        this._queueCallback(() => this._hideModal(), this._element, this._isAnimated());
      }
  
      dispose() {
        for (const htmlElement of [window, this._dialog]) {
          EventHandler.off(htmlElement, EVENT_KEY$4);
        }
  
        this._backdrop.dispose();
  
        this._focustrap.deactivate();
  
        super.dispose();
      }
  
      handleUpdate() {
        this._adjustDialog();
      } // Private
  
  
      _initializeBackDrop() {
        return new Backdrop({
          isVisible: Boolean(this._config.backdrop),
          // 'static' option will be translated to true, and booleans will keep their value,
          isAnimated: this._isAnimated()
        });
      }
  
      _initializeFocusTrap() {
        return new FocusTrap({
          trapElement: this._element
        });
      }
  
      _showElement(relatedTarget) {
        // try to append dynamic modal
        if (!document.body.contains(this._element)) {
          document.body.append(this._element);
        }
  
        this._element.style.display = 'block';
  
        this._element.removeAttribute('aria-hidden');
  
        this._element.setAttribute('aria-modal', true);
  
        this._element.setAttribute('role', 'dialog');
  
        this._element.scrollTop = 0;
        const modalBody = SelectorEngine.findOne(SELECTOR_MODAL_BODY, this._dialog);
  
        if (modalBody) {
          modalBody.scrollTop = 0;
        }
  
        reflow(this._element);
  
        this._element.classList.add(CLASS_NAME_SHOW$4);
  
        const transitionComplete = () => {
          if (this._config.focus) {
            this._focustrap.activate();
          }
  
          this._isTransitioning = false;
          EventHandler.trigger(this._element, EVENT_SHOWN$4, {
            relatedTarget
          });
        };
  
        this._queueCallback(transitionComplete, this._dialog, this._isAnimated());
      }
  
      _addEventListeners() {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS$1, event => {
          if (event.key !== ESCAPE_KEY$1) {
            return;
          }
  
          if (this._config.keyboard) {
            event.preventDefault();
            this.hide();
            return;
          }
  
          this._triggerBackdropTransition();
        });
        EventHandler.on(window, EVENT_RESIZE$1, () => {
          if (this._isShown && !this._isTransitioning) {
            this._adjustDialog();
          }
        });
        EventHandler.on(this._element, EVENT_MOUSEDOWN_DISMISS, event => {
          if (event.target !== event.currentTarget) {
            // click is inside modal-dialog
            return;
          }
  
          if (this._config.backdrop === 'static') {
            this._triggerBackdropTransition();
  
            return;
          }
  
          if (this._config.backdrop) {
            this.hide();
          }
        });
      }
  
      _hideModal() {
        this._element.style.display = 'none';
  
        this._element.setAttribute('aria-hidden', true);
  
        this._element.removeAttribute('aria-modal');
  
        this._element.removeAttribute('role');
  
        this._isTransitioning = false;
  
        this._backdrop.hide(() => {
          document.body.classList.remove(CLASS_NAME_OPEN);
  
          this._resetAdjustments();
  
          this._scrollBar.reset();
  
          EventHandler.trigger(this._element, EVENT_HIDDEN$4);
        });
      }
  
      _isAnimated() {
        return this._element.classList.contains(CLASS_NAME_FADE$3);
      }
  
      _triggerBackdropTransition() {
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED$1);
  
        if (hideEvent.defaultPrevented) {
          return;
        }
  
        const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
        const initialOverflowY = this._element.style.overflowY; // return if the following background transition hasn't yet completed
  
        if (initialOverflowY === 'hidden' || this._element.classList.contains(CLASS_NAME_STATIC)) {
          return;
        }
  
        if (!isModalOverflowing) {
          this._element.style.overflowY = 'hidden';
        }
  
        this._element.classList.add(CLASS_NAME_STATIC);
  
        this._queueCallback(() => {
          this._element.classList.remove(CLASS_NAME_STATIC);
  
          this._queueCallback(() => {
            this._element.style.overflowY = initialOverflowY;
          }, this._dialog);
        }, this._dialog);
  
        this._element.focus();
      }
      /**
       * The following methods are used to handle overflowing modals
       */
  
  
      _adjustDialog() {
        const isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;
  
        const scrollbarWidth = this._scrollBar.getWidth();
  
        const isBodyOverflowing = scrollbarWidth > 0;
  
        if (isBodyOverflowing && !isModalOverflowing) {
          const property = isRTL() ? 'paddingLeft' : 'paddingRight';
          this._element.style[property] = `${scrollbarWidth}px`;
        }
  
        if (!isBodyOverflowing && isModalOverflowing) {
          const property = isRTL() ? 'paddingRight' : 'paddingLeft';
          this._element.style[property] = `${scrollbarWidth}px`;
        }
      }
  
      _resetAdjustments() {
        this._element.style.paddingLeft = '';
        this._element.style.paddingRight = '';
      } // Static
  
  
      static jQueryInterface(config, relatedTarget) {
        return this.each(function () {
          const data = Modal.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config](relatedTarget);
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API$2, SELECTOR_DATA_TOGGLE$2, function (event) {
      const target = getElementFromSelector(this);
  
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
  
      EventHandler.one(target, EVENT_SHOW$4, showEvent => {
        if (showEvent.defaultPrevented) {
          // only register focus restorer if modal will actually get shown
          return;
        }
  
        EventHandler.one(target, EVENT_HIDDEN$4, () => {
          if (isVisible(this)) {
            this.focus();
          }
        });
      }); // avoid conflict when clicking modal toggler while another one is open
  
      const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR$1);
  
      if (alreadyOpen) {
        Modal.getInstance(alreadyOpen).hide();
      }
  
      const data = Modal.getOrCreateInstance(target);
      data.toggle(this);
    });
    enableDismissTrigger(Modal);
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Modal);
  
    
  
    const NAME$6 = 'offcanvas';
    const DATA_KEY$3 = 'bs.offcanvas';
    const EVENT_KEY$3 = `.${DATA_KEY$3}`;
    const DATA_API_KEY$1 = '.data-api';
    const EVENT_LOAD_DATA_API$2 = `load${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const ESCAPE_KEY = 'Escape';
    const CLASS_NAME_SHOW$3 = 'show';
    const CLASS_NAME_SHOWING$1 = 'showing';
    const CLASS_NAME_HIDING = 'hiding';
    const CLASS_NAME_BACKDROP = 'offcanvas-backdrop';
    const OPEN_SELECTOR = '.offcanvas.show';
    const EVENT_SHOW$3 = `show${EVENT_KEY$3}`;
    const EVENT_SHOWN$3 = `shown${EVENT_KEY$3}`;
    const EVENT_HIDE$3 = `hide${EVENT_KEY$3}`;
    const EVENT_HIDE_PREVENTED = `hidePrevented${EVENT_KEY$3}`;
    const EVENT_HIDDEN$3 = `hidden${EVENT_KEY$3}`;
    const EVENT_RESIZE = `resize${EVENT_KEY$3}`;
    const EVENT_CLICK_DATA_API$1 = `click${EVENT_KEY$3}${DATA_API_KEY$1}`;
    const EVENT_KEYDOWN_DISMISS = `keydown.dismiss${EVENT_KEY$3}`;
    const SELECTOR_DATA_TOGGLE$1 = '[data-bs-toggle="offcanvas"]';
    const Default$5 = {
      backdrop: true,
      keyboard: true,
      scroll: false
    };
    const DefaultType$5 = {
      backdrop: '(boolean|string)',
      keyboard: 'boolean',
      scroll: 'boolean'
    };
    /**
     * Class definition
     */
  
    class Offcanvas extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._isShown = false;
        this._backdrop = this._initializeBackDrop();
        this._focustrap = this._initializeFocusTrap();
  
        this._addEventListeners();
      } // Getters
  
  
      static get Default() {
        return Default$5;
      }
  
      static get DefaultType() {
        return DefaultType$5;
      }
  
      static get NAME() {
        return NAME$6;
      } // Public
  
  
      toggle(relatedTarget) {
        return this._isShown ? this.hide() : this.show(relatedTarget);
      }
  
      show(relatedTarget) {
        if (this._isShown) {
          return;
        }
  
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW$3, {
          relatedTarget
        });
  
        if (showEvent.defaultPrevented) {
          return;
        }
  
        this._isShown = true;
  
        this._backdrop.show();
  
        if (!this._config.scroll) {
          new ScrollBarHelper().hide();
        }
  
        this._element.setAttribute('aria-modal', true);
  
        this._element.setAttribute('role', 'dialog');
  
        this._element.classList.add(CLASS_NAME_SHOWING$1);
  
        const completeCallBack = () => {
          if (!this._config.scroll || this._config.backdrop) {
            this._focustrap.activate();
          }
  
          this._element.classList.add(CLASS_NAME_SHOW$3);
  
          this._element.classList.remove(CLASS_NAME_SHOWING$1);
  
          EventHandler.trigger(this._element, EVENT_SHOWN$3, {
            relatedTarget
          });
        };
  
        this._queueCallback(completeCallBack, this._element, true);
      }
  
      hide() {
        if (!this._isShown) {
          return;
        }
  
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE$3);
  
        if (hideEvent.defaultPrevented) {
          return;
        }
  
        this._focustrap.deactivate();
  
        this._element.blur();
  
        this._isShown = false;
  
        this._element.classList.add(CLASS_NAME_HIDING);
  
        this._backdrop.hide();
  
        const completeCallback = () => {
          this._element.classList.remove(CLASS_NAME_SHOW$3, CLASS_NAME_HIDING);
  
          this._element.removeAttribute('aria-modal');
  
          this._element.removeAttribute('role');
  
          if (!this._config.scroll) {
            new ScrollBarHelper().reset();
          }
  
          EventHandler.trigger(this._element, EVENT_HIDDEN$3);
        };
  
        this._queueCallback(completeCallback, this._element, true);
      }
  
      dispose() {
        this._backdrop.dispose();
  
        this._focustrap.deactivate();
  
        super.dispose();
      } // Private
  
  
      _initializeBackDrop() {
        const clickCallback = () => {
          if (this._config.backdrop === 'static') {
            EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
            return;
          }
  
          this.hide();
        }; // 'static' option will be translated to true, and booleans will keep their value
  
  
        const isVisible = Boolean(this._config.backdrop);
        return new Backdrop({
          className: CLASS_NAME_BACKDROP,
          isVisible,
          isAnimated: true,
          rootElement: this._element.parentNode,
          clickCallback: isVisible ? clickCallback : null
        });
      }
  
      _initializeFocusTrap() {
        return new FocusTrap({
          trapElement: this._element
        });
      }
  
      _addEventListeners() {
        EventHandler.on(this._element, EVENT_KEYDOWN_DISMISS, event => {
          if (event.key !== ESCAPE_KEY) {
            return;
          }
  
          if (!this._config.keyboard) {
            EventHandler.trigger(this._element, EVENT_HIDE_PREVENTED);
            return;
          }
  
          this.hide();
        });
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Offcanvas.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config](this);
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API$1, SELECTOR_DATA_TOGGLE$1, function (event) {
      const target = getElementFromSelector(this);
  
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
  
      if (isDisabled(this)) {
        return;
      }
  
      EventHandler.one(target, EVENT_HIDDEN$3, () => {
        // focus on trigger when it is closed
        if (isVisible(this)) {
          this.focus();
        }
      }); // avoid conflict when clicking a toggler of an offcanvas, while another is open
  
      const alreadyOpen = SelectorEngine.findOne(OPEN_SELECTOR);
  
      if (alreadyOpen && alreadyOpen !== target) {
        Offcanvas.getInstance(alreadyOpen).hide();
      }
  
      const data = Offcanvas.getOrCreateInstance(target);
      data.toggle(this);
    });
    EventHandler.on(window, EVENT_LOAD_DATA_API$2, () => {
      for (const selector of SelectorEngine.find(OPEN_SELECTOR)) {
        Offcanvas.getOrCreateInstance(selector).show();
      }
    });
    EventHandler.on(window, EVENT_RESIZE, () => {
      for (const element of SelectorEngine.find('[aria-modal][class*=show][class*=offcanvas-]')) {
        if (getComputedStyle(element).position !== 'fixed') {
          Offcanvas.getOrCreateInstance(element).hide();
        }
      }
    });
    enableDismissTrigger(Offcanvas);
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Offcanvas);
  
    const uriAttributes = new Set(['background', 'cite', 'href', 'itemtype', 'longdesc', 'poster', 'src', 'xlink:href']);
    const ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
   
    const SAFE_URL_PATTERN = /^(?:(?:https?|mailto|ftp|tel|file|sms):|[^#&/:?]*(?:[#/?]|$))/i;
  
    const DATA_URL_PATTERN = /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[\d+/a-z]+=*$/i;
  
    const allowedAttribute = (attribute, allowedAttributeList) => {
      const attributeName = attribute.nodeName.toLowerCase();
  
      if (allowedAttributeList.includes(attributeName)) {
        if (uriAttributes.has(attributeName)) {
          return Boolean(SAFE_URL_PATTERN.test(attribute.nodeValue) || DATA_URL_PATTERN.test(attribute.nodeValue));
        }
  
        return true;
      } // Check if a regular expression validates the attribute.
  
  
      return allowedAttributeList.filter(attributeRegex => attributeRegex instanceof RegExp).some(regex => regex.test(attributeName));
    };
  
    const DefaultAllowlist = {
      // Global attributes allowed on any supplied element below.
      '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
      a: ['target', 'href', 'title', 'rel'],
      area: [],
      b: [],
      br: [],
      col: [],
      code: [],
      div: [],
      em: [],
      hr: [],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      i: [],
      img: ['src', 'srcset', 'alt', 'title', 'width', 'height'],
      li: [],
      ol: [],
      p: [],
      pre: [],
      s: [],
      small: [],
      span: [],
      sub: [],
      sup: [],
      strong: [],
      u: [],
      ul: []
    };
    function sanitizeHtml(unsafeHtml, allowList, sanitizeFunction) {
      if (!unsafeHtml.length) {
        return unsafeHtml;
      }
  
      if (sanitizeFunction && typeof sanitizeFunction === 'function') {
        return sanitizeFunction(unsafeHtml);
      }
  
      const domParser = new window.DOMParser();
      const createdDocument = domParser.parseFromString(unsafeHtml, 'text/html');
      const elements = [].concat(...createdDocument.body.querySelectorAll('*'));
  
      for (const element of elements) {
        const elementName = element.nodeName.toLowerCase();
  
        if (!Object.keys(allowList).includes(elementName)) {
          element.remove();
          continue;
        }
  
        const attributeList = [].concat(...element.attributes);
        const allowedAttributes = [].concat(allowList['*'] || [], allowList[elementName] || []);
  
        for (const attribute of attributeList) {
          if (!allowedAttribute(attribute, allowedAttributes)) {
            element.removeAttribute(attribute.nodeName);
          }
        }
      }
  
      return createdDocument.body.innerHTML;
    }
  
   
    const NAME$5 = 'TemplateFactory';
    const Default$4 = {
      allowList: DefaultAllowlist,
      content: {},
      // { selector : text ,  selector2 : text2 , }
      extraClass: '',
      html: false,
      sanitize: true,
      sanitizeFn: null,
      template: '<div></div>'
    };
    const DefaultType$4 = {
      allowList: 'object',
      content: 'object',
      extraClass: '(string|function)',
      html: 'boolean',
      sanitize: 'boolean',
      sanitizeFn: '(null|function)',
      template: 'string'
    };
    const DefaultContentType = {
      entry: '(string|element|function|null)',
      selector: '(string|element)'
    };
    /**
     * Class definition
     */
  
    class TemplateFactory extends Config {
      constructor(config) {
        super();
        this._config = this._getConfig(config);
      } // Getters
  
  
      static get Default() {
        return Default$4;
      }
  
      static get DefaultType() {
        return DefaultType$4;
      }
  
      static get NAME() {
        return NAME$5;
      } // Public
  
  
      getContent() {
        return Object.values(this._config.content).map(config => this._resolvePossibleFunction(config)).filter(Boolean);
      }
  
      hasContent() {
        return this.getContent().length > 0;
      }
  
      changeContent(content) {
        this._checkContent(content);
  
        this._config.content = { ...this._config.content,
          ...content
        };
        return this;
      }
  
      toHtml() {
        const templateWrapper = document.createElement('div');
        templateWrapper.innerHTML = this._maybeSanitize(this._config.template);
  
        for (const [selector, text] of Object.entries(this._config.content)) {
          this._setContent(templateWrapper, text, selector);
        }
  
        const template = templateWrapper.children[0];
  
        const extraClass = this._resolvePossibleFunction(this._config.extraClass);
  
        if (extraClass) {
          template.classList.add(...extraClass.split(' '));
        }
  
        return template;
      } // Private
  
  
      _typeCheckConfig(config) {
        super._typeCheckConfig(config);
  
        this._checkContent(config.content);
      }
  
      _checkContent(arg) {
        for (const [selector, content] of Object.entries(arg)) {
          super._typeCheckConfig({
            selector,
            entry: content
          }, DefaultContentType);
        }
      }
  
      _setContent(template, content, selector) {
        const templateElement = SelectorEngine.findOne(selector, template);
  
        if (!templateElement) {
          return;
        }
  
        content = this._resolvePossibleFunction(content);
  
        if (!content) {
          templateElement.remove();
          return;
        }
  
        if (isElement$1(content)) {
          this._putElementInTemplate(getElement(content), templateElement);
  
          return;
        }
  
        if (this._config.html) {
          templateElement.innerHTML = this._maybeSanitize(content);
          return;
        }
  
        templateElement.textContent = content;
      }
  
      _maybeSanitize(arg) {
        return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg;
      }
  
      _resolvePossibleFunction(arg) {
        return typeof arg === 'function' ? arg(this) : arg;
      }
  
      _putElementInTemplate(element, templateElement) {
        if (this._config.html) {
          templateElement.innerHTML = '';
          templateElement.append(element);
          return;
        }
  
        templateElement.textContent = element.textContent;
      }
  
    }
  
    const NAME$4 = 'tooltip';
    const DISALLOWED_ATTRIBUTES = new Set(['sanitize', 'allowList', 'sanitizeFn']);
    const CLASS_NAME_FADE$2 = 'fade';
    const CLASS_NAME_MODAL = 'modal';
    const CLASS_NAME_SHOW$2 = 'show';
    const SELECTOR_TOOLTIP_INNER = '.tooltip-inner';
    const SELECTOR_MODAL = `.${CLASS_NAME_MODAL}`;
    const EVENT_MODAL_HIDE = 'hide.bs.modal';
    const TRIGGER_HOVER = 'hover';
    const TRIGGER_FOCUS = 'focus';
    const TRIGGER_CLICK = 'click';
    const TRIGGER_MANUAL = 'manual';
    const EVENT_HIDE$2 = 'hide';
    const EVENT_HIDDEN$2 = 'hidden';
    const EVENT_SHOW$2 = 'show';
    const EVENT_SHOWN$2 = 'shown';
    const EVENT_INSERTED = 'inserted';
    const EVENT_CLICK$1 = 'click';
    const EVENT_FOCUSIN$1 = 'focusin';
    const EVENT_FOCUSOUT$1 = 'focusout';
    const EVENT_MOUSEENTER = 'mouseenter';
    const EVENT_MOUSELEAVE = 'mouseleave';
    const AttachmentMap = {
      AUTO: 'auto',
      TOP: 'top',
      RIGHT: isRTL() ? 'left' : 'right',
      BOTTOM: 'bottom',
      LEFT: isRTL() ? 'right' : 'left'
    };
    const Default$3 = {
      allowList: DefaultAllowlist,
      animation: true,
      boundary: 'clippingParents',
      container: false,
      customClass: '',
      delay: 0,
      fallbackPlacements: ['top', 'right', 'bottom', 'left'],
      html: false,
      offset: [0, 0],
      placement: 'top',
      popperConfig: null,
      sanitize: true,
      sanitizeFn: null,
      selector: false,
      template: '<div class="tooltip" role="tooltip">' + '<div class="tooltip-arrow"></div>' + '<div class="tooltip-inner"></div>' + '</div>',
      title: '',
      trigger: 'hover focus'
    };
    const DefaultType$3 = {
      allowList: 'object',
      animation: 'boolean',
      boundary: '(string|element)',
      container: '(string|element|boolean)',
      customClass: '(string|function)',
      delay: '(number|object)',
      fallbackPlacements: 'array',
      html: 'boolean',
      offset: '(array|string|function)',
      placement: '(string|function)',
      popperConfig: '(null|object|function)',
      sanitize: 'boolean',
      sanitizeFn: '(null|function)',
      selector: '(string|boolean)',
      template: 'string',
      title: '(string|element|function)',
      trigger: 'string'
    };
    /**
     * Class definition
     */
  
    class Tooltip extends BaseComponent {
      constructor(element, config) {
        if (typeof Popper === 'undefined') {
          throw new TypeError('Nope');
        }
  
        super(element, config); // Private
  
        this._isEnabled = true;
        this._timeout = 0;
        this._isHovered = false;
        this._activeTrigger = {};
        this._popper = null;
        this._templateFactory = null;
        this._newContent = null; // Protected
  
        this.tip = null;
  
        this._setListeners();
      } // Getters
  
  
      static get Default() {
        return Default$3;
      }
  
      static get DefaultType() {
        return DefaultType$3;
      }
  
      static get NAME() {
        return NAME$4;
      } // Public
  
  
      enable() {
        this._isEnabled = true;
      }
  
      disable() {
        this._isEnabled = false;
      }
  
      toggleEnabled() {
        this._isEnabled = !this._isEnabled;
      }
  
      toggle(event) {
        if (!this._isEnabled) {
          return;
        }
  
        if (event) {
          const context = this._initializeOnDelegatedTarget(event);
  
          context._activeTrigger.click = !context._activeTrigger.click;
  
          if (context._isWithActiveTrigger()) {
            context._enter();
          } else {
            context._leave();
          }
  
          return;
        }
  
        if (this._isShown()) {
          this._leave();
  
          return;
        }
  
        this._enter();
      }
  
      dispose() {
        clearTimeout(this._timeout);
        EventHandler.off(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
  
        if (this.tip) {
          this.tip.remove();
        }
  
        this._disposePopper();
  
        super.dispose();
      }
  
      show() {
        if (this._element.style.display === 'none') {
          throw new Error('Please use show on visible elements');
        }
  
        if (!(this._isWithContent() && this._isEnabled)) {
          return;
        }
  
        const showEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOW$2));
        const shadowRoot = findShadowRoot(this._element);
  
        const isInTheDom = (shadowRoot || this._element.ownerDocument.documentElement).contains(this._element);
  
        if (showEvent.defaultPrevented || !isInTheDom) {
          return;
        } // todo v6 remove this OR make it optional
  
  
        if (this.tip) {
          this.tip.remove();
          this.tip = null;
        }
  
        const tip = this._getTipElement();
  
        this._element.setAttribute('aria-describedby', tip.getAttribute('id'));
  
        const {
          container
        } = this._config;
  
        if (!this._element.ownerDocument.documentElement.contains(this.tip)) {
          container.append(tip);
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_INSERTED));
        }
  
        if (this._popper) {
          this._popper.update();
        } else {
          this._popper = this._createPopper(tip);
        }
  
        tip.classList.add(CLASS_NAME_SHOW$2); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html
  
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.on(element, 'mouseover', noop);
          }
        }
  
        const complete = () => {
          const previousHoverState = this._isHovered;
          this._isHovered = false;
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_SHOWN$2));
  
          if (previousHoverState) {
            this._leave();
          }
        };
  
        this._queueCallback(complete, this.tip, this._isAnimated());
      }
  
      hide() {
        if (!this._isShown()) {
          return;
        }
  
        const hideEvent = EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDE$2));
  
        if (hideEvent.defaultPrevented) {
          return;
        }
  
        const tip = this._getTipElement();
  
        tip.classList.remove(CLASS_NAME_SHOW$2); // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support
  
        if ('ontouchstart' in document.documentElement) {
          for (const element of [].concat(...document.body.children)) {
            EventHandler.off(element, 'mouseover', noop);
          }
        }
  
        this._activeTrigger[TRIGGER_CLICK] = false;
        this._activeTrigger[TRIGGER_FOCUS] = false;
        this._activeTrigger[TRIGGER_HOVER] = false;
        this._isHovered = false;
  
        const complete = () => {
          if (this._isWithActiveTrigger()) {
            return;
          }
  
          if (!this._isHovered) {
            tip.remove();
          }
  
          this._element.removeAttribute('aria-describedby');
  
          EventHandler.trigger(this._element, this.constructor.eventName(EVENT_HIDDEN$2));
  
          this._disposePopper();
        };
  
        this._queueCallback(complete, this.tip, this._isAnimated());
      }
  
      update() {
        if (this._popper) {
          this._popper.update();
        }
      } // Protected
  
  
      _isWithContent() {
        return Boolean(this._getTitle());
      }
  
      _getTipElement() {
        if (!this.tip) {
          this.tip = this._createTipElement(this._newContent || this._getContentForTemplate());
        }
  
        return this.tip;
      }
  
      _createTipElement(content) {
        const tip = this._getTemplateFactory(content).toHtml(); // todo: remove this check on v6
  
  
        if (!tip) {
          return null;
        }
  
        tip.classList.remove(CLASS_NAME_FADE$2, CLASS_NAME_SHOW$2); // todo: on v6 the following can be achieved with CSS only
  
        tip.classList.add(`bs-${this.constructor.NAME}-auto`);
        const tipId = getUID(this.constructor.NAME).toString();
        tip.setAttribute('id', tipId);
  
        if (this._isAnimated()) {
          tip.classList.add(CLASS_NAME_FADE$2);
        }
  
        return tip;
      }
  
      setContent(content) {
        this._newContent = content;
  
        if (this._isShown()) {
          this._disposePopper();
  
          this.show();
        }
      }
  
      _getTemplateFactory(content) {
        if (this._templateFactory) {
          this._templateFactory.changeContent(content);
        } else {
          this._templateFactory = new TemplateFactory({ ...this._config,
            // the `content` var has to be after `this._config`
            // to override config.content in case of popover
            content,
            extraClass: this._resolvePossibleFunction(this._config.customClass)
          });
        }
  
        return this._templateFactory;
      }
  
      _getContentForTemplate() {
        return {
          [SELECTOR_TOOLTIP_INNER]: this._getTitle()
        };
      }
  
      _getTitle() {
        return this._resolvePossibleFunction(this._config.title) || this._config.originalTitle;
      } // Private
  
  
      _initializeOnDelegatedTarget(event) {
        return this.constructor.getOrCreateInstance(event.delegateTarget, this._getDelegateConfig());
      }
  
      _isAnimated() {
        return this._config.animation || this.tip && this.tip.classList.contains(CLASS_NAME_FADE$2);
      }
  
      _isShown() {
        return this.tip && this.tip.classList.contains(CLASS_NAME_SHOW$2);
      }
  
      _createPopper(tip) {
        const placement = typeof this._config.placement === 'function' ? this._config.placement.call(this, tip, this._element) : this._config.placement;
        const attachment = AttachmentMap[placement.toUpperCase()];
        return createPopper(this._element, tip, this._getPopperConfig(attachment));
      }
  
      _getOffset() {
        const {
          offset
        } = this._config;
  
        if (typeof offset === 'string') {
          return offset.split(',').map(value => Number.parseInt(value, 10));
        }
  
        if (typeof offset === 'function') {
          return popperData => offset(popperData, this._element);
        }
  
        return offset;
      }
  
      _resolvePossibleFunction(arg) {
        return typeof arg === 'function' ? arg.call(this._element) : arg;
      }
  
      _getPopperConfig(attachment) {
        const defaultBsPopperConfig = {
          placement: attachment,
          modifiers: [{
            name: 'flip',
            options: {
              fallbackPlacements: this._config.fallbackPlacements
            }
          }, {
            name: 'offset',
            options: {
              offset: this._getOffset()
            }
          }, {
            name: 'preventOverflow',
            options: {
              boundary: this._config.boundary
            }
          }, {
            name: 'arrow',
            options: {
              element: `.${this.constructor.NAME}-arrow`
            }
          }, {
            name: 'preSetPlacement',
            enabled: true,
            phase: 'beforeMain',
            fn: data => {
              // Pre-set Popper's placement attribute in order to read the arrow sizes properly.
              // Otherwise, Popper mixes up the width and height dimensions since the initial arrow style is for top placement
              this._getTipElement().setAttribute('data-popper-placement', data.state.placement);
            }
          }]
        };
        return { ...defaultBsPopperConfig,
          ...(typeof this._config.popperConfig === 'function' ? this._config.popperConfig(defaultBsPopperConfig) : this._config.popperConfig)
        };
      }
  
      _setListeners() {
        const triggers = this._config.trigger.split(' ');
  
        for (const trigger of triggers) {
          if (trigger === 'click') {
            EventHandler.on(this._element, this.constructor.eventName(EVENT_CLICK$1), this._config.selector, event => this.toggle(event));
          } else if (trigger !== TRIGGER_MANUAL) {
            const eventIn = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSEENTER) : this.constructor.eventName(EVENT_FOCUSIN$1);
            const eventOut = trigger === TRIGGER_HOVER ? this.constructor.eventName(EVENT_MOUSELEAVE) : this.constructor.eventName(EVENT_FOCUSOUT$1);
            EventHandler.on(this._element, eventIn, this._config.selector, event => {
              const context = this._initializeOnDelegatedTarget(event);
  
              context._activeTrigger[event.type === 'focusin' ? TRIGGER_FOCUS : TRIGGER_HOVER] = true;
  
              context._enter();
            });
            EventHandler.on(this._element, eventOut, this._config.selector, event => {
              const context = this._initializeOnDelegatedTarget(event);
  
              context._activeTrigger[event.type === 'focusout' ? TRIGGER_FOCUS : TRIGGER_HOVER] = context._element.contains(event.relatedTarget);
  
              context._leave();
            });
          }
        }
  
        this._hideModalHandler = () => {
          if (this._element) {
            this.hide();
          }
        };
  
        EventHandler.on(this._element.closest(SELECTOR_MODAL), EVENT_MODAL_HIDE, this._hideModalHandler);
  
        if (this._config.selector) {
          this._config = { ...this._config,
            trigger: 'manual',
            selector: ''
          };
        } else {
          this._fixTitle();
        }
      }
  
      _fixTitle() {
        const title = this._config.originalTitle;
  
        if (!title) {
          return;
        }
  
        if (!this._element.getAttribute('aria-label') && !this._element.textContent.trim()) {
          this._element.setAttribute('aria-label', title);
        }
  
        this._element.removeAttribute('title');
      }
  
      _enter() {
        if (this._isShown() || this._isHovered) {
          this._isHovered = true;
          return;
        }
  
        this._isHovered = true;
  
        this._setTimeout(() => {
          if (this._isHovered) {
            this.show();
          }
        }, this._config.delay.show);
      }
  
      _leave() {
        if (this._isWithActiveTrigger()) {
          return;
        }
  
        this._isHovered = false;
  
        this._setTimeout(() => {
          if (!this._isHovered) {
            this.hide();
          }
        }, this._config.delay.hide);
      }
  
      _setTimeout(handler, timeout) {
        clearTimeout(this._timeout);
        this._timeout = setTimeout(handler, timeout);
      }
  
      _isWithActiveTrigger() {
        return Object.values(this._activeTrigger).includes(true);
      }
  
      _getConfig(config) {
        const dataAttributes = Manipulator.getDataAttributes(this._element);
  
        for (const dataAttribute of Object.keys(dataAttributes)) {
          if (DISALLOWED_ATTRIBUTES.has(dataAttribute)) {
            delete dataAttributes[dataAttribute];
          }
        }
  
        config = { ...dataAttributes,
          ...(typeof config === 'object' && config ? config : {})
        };
        config = this._mergeConfigObj(config);
        config = this._configAfterMerge(config);
  
        this._typeCheckConfig(config);
  
        return config;
      }
  
      _configAfterMerge(config) {
        config.container = config.container === false ? document.body : getElement(config.container);
  
        if (typeof config.delay === 'number') {
          config.delay = {
            show: config.delay,
            hide: config.delay
          };
        }
  
        config.originalTitle = this._element.getAttribute('title') || '';
  
        if (typeof config.title === 'number') {
          config.title = config.title.toString();
        }
  
        if (typeof config.content === 'number') {
          config.content = config.content.toString();
        }
  
        return config;
      }
  
      _getDelegateConfig() {
        const config = {};
  
        for (const key in this._config) {
          if (this.constructor.Default[key] !== this._config[key]) {
            config[key] = this._config[key];
          }
        } // In the future can be replaced with:
        // const keysWithDifferentValues = Object.entries(this._config).filter(entry => this.constructor.Default[entry[0]] !== this._config[entry[0]])
        // `Object.fromEntries(keysWithDifferentValues)`
  
  
        return config;
      }
  
      _disposePopper() {
        if (this._popper) {
          this._popper.destroy();
  
          this._popper = null;
        }
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Tooltip.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config]();
        });
      }
  
    }
    /**
     * jQuery
     */
  
  
    defineJQueryPlugin(Tooltip);
  
  
    const NAME$3 = 'popover';
    const SELECTOR_TITLE = '.popover-header';
    const SELECTOR_CONTENT = '.popover-body';
    const Default$2 = { ...Tooltip.Default,
      content: '',
      offset: [0, 8],
      placement: 'right',
      template: '<div class="popover" role="tooltip">' + '<div class="popover-arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div>' + '</div>',
      trigger: 'click'
    };
    const DefaultType$2 = { ...Tooltip.DefaultType,
      content: '(null|string|element|function)'
    };
    /**
     * Class definition
     */
  
    class Popover extends Tooltip {
      // Getters
      static get Default() {
        return Default$2;
      }
  
      static get DefaultType() {
        return DefaultType$2;
      }
  
      static get NAME() {
        return NAME$3;
      } // Overrides
  
  
      _isWithContent() {
        return this._getTitle() || this._getContent();
      } // Private
  
  
      _getContentForTemplate() {
        return {
          [SELECTOR_TITLE]: this._getTitle(),
          [SELECTOR_CONTENT]: this._getContent()
        };
      }
  
      _getContent() {
        return this._resolvePossibleFunction(this._config.content);
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Popover.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (typeof data[config] === 'undefined') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config]();
        });
      }
  
    }
    /**
     * jQuery
     */
  
  
    defineJQueryPlugin(Popover);
  
  
    const NAME$2 = 'scrollspy';
    const DATA_KEY$2 = 'bs.scrollspy';
    const EVENT_KEY$2 = `.${DATA_KEY$2}`;
    const DATA_API_KEY = '.data-api';
    const EVENT_ACTIVATE = `activate${EVENT_KEY$2}`;
    const EVENT_CLICK = `click${EVENT_KEY$2}`;
    const EVENT_LOAD_DATA_API$1 = `load${EVENT_KEY$2}${DATA_API_KEY}`;
    const CLASS_NAME_DROPDOWN_ITEM = 'dropdown-item';
    const CLASS_NAME_ACTIVE$1 = 'active';
    const SELECTOR_DATA_SPY = '[data-bs-spy="scroll"]';
    const SELECTOR_TARGET_LINKS = '[href]';
    const SELECTOR_NAV_LIST_GROUP = '.nav, .list-group';
    const SELECTOR_NAV_LINKS = '.nav-link';
    const SELECTOR_NAV_ITEMS = '.nav-item';
    const SELECTOR_LIST_ITEMS = '.list-group-item';
    const SELECTOR_LINK_ITEMS = `${SELECTOR_NAV_LINKS}, ${SELECTOR_NAV_ITEMS} > ${SELECTOR_NAV_LINKS}, ${SELECTOR_LIST_ITEMS}`;
    const SELECTOR_DROPDOWN = '.dropdown';
    const SELECTOR_DROPDOWN_TOGGLE$1 = '.dropdown-toggle';
    const Default$1 = {
      offset: null,
      // TODO: v6 @deprecated, keep it for backwards compatibility reasons
      rootMargin: '0px 0px -25%',
      smoothScroll: false,
      target: null
    };
    const DefaultType$1 = {
      offset: '(number|null)',
      // TODO v6 @deprecated, keep it for backwards compatibility reasons
      rootMargin: 'string',
      smoothScroll: 'boolean',
      target: 'element'
    };
    /**
     * Class definition
     */
  
    class ScrollSpy extends BaseComponent {
      constructor(element, config) {
        super(element, config); // this._element is the observablesContainer and config.target the menu links wrapper
  
        this._targetLinks = new Map();
        this._observableSections = new Map();
        this._rootElement = getComputedStyle(this._element).overflowY === 'visible' ? null : this._element;
        this._activeTarget = null;
        this._observer = null;
        this._previousScrollData = {
          visibleEntryTop: 0,
          parentScrollTop: 0
        };
        this.refresh(); // initialize
      } // Getters
  
  
      static get Default() {
        return Default$1;
      }
  
      static get DefaultType() {
        return DefaultType$1;
      }
  
      static get NAME() {
        return NAME$2;
      } // Public
  
  
      refresh() {
        this._initializeTargetsAndObservables();
  
        this._maybeEnableSmoothScroll();
  
        if (this._observer) {
          this._observer.disconnect();
        } else {
          this._observer = this._getNewObserver();
        }
  
        for (const section of this._observableSections.values()) {
          this._observer.observe(section);
        }
      }
  
      dispose() {
        this._observer.disconnect();
  
        super.dispose();
      } // Private
  
  
      _configAfterMerge(config) {
        // TODO: on v6 target should be given explicitly & remove the {target: 'ss-target'} case
        config.target = getElement(config.target) || document.body;
        return config;
      }
  
      _maybeEnableSmoothScroll() {
        if (!this._config.smoothScroll) {
          return;
        } // unregister any previous listeners
  
  
        EventHandler.off(this._config.target, EVENT_CLICK);
        EventHandler.on(this._config.target, EVENT_CLICK, SELECTOR_TARGET_LINKS, event => {
          const observableSection = this._observableSections.get(event.target.hash);
  
          if (observableSection) {
            event.preventDefault();
            const root = this._rootElement || window;
            const height = observableSection.offsetTop - this._element.offsetTop;
  
            if (root.scrollTo) {
              root.scrollTo({
                top: height,
                behavior: 'smooth'
              });
              return;
            } 
  
  
            root.scrollTop = height;
          }
        });
      }
  
      _getNewObserver() {
        const options = {
          root: this._rootElement,
          threshold: [0.1, 0.5, 1],
          rootMargin: this._getRootMargin()
        };
        return new IntersectionObserver(entries => this._observerCallback(entries), options);
      } // The logic of selection
  
  
      _observerCallback(entries) {
        const targetElement = entry => this._targetLinks.get(`#${entry.target.id}`);
  
        const activate = entry => {
          this._previousScrollData.visibleEntryTop = entry.target.offsetTop;
  
          this._process(targetElement(entry));
        };
  
        const parentScrollTop = (this._rootElement || document.documentElement).scrollTop;
        const userScrollsDown = parentScrollTop >= this._previousScrollData.parentScrollTop;
        this._previousScrollData.parentScrollTop = parentScrollTop;
  
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            this._activeTarget = null;
  
            this._clearActiveClass(targetElement(entry));
  
            continue;
          }
  
          const entryIsLowerThanPrevious = entry.target.offsetTop >= this._previousScrollData.visibleEntryTop; // if we are scrolling down, pick the bigger offsetTop
  
          if (userScrollsDown && entryIsLowerThanPrevious) {
            activate(entry); // if parent isn't scrolled, let's keep the first visible item, breaking the iteration
  
            if (!parentScrollTop) {
              return;
            }
  
            continue;
          } // if we are scrolling up, pick the smallest offsetTop
  
  
          if (!userScrollsDown && !entryIsLowerThanPrevious) {
            activate(entry);
          }
        }
      } // TODO: v6 Only for backwards compatibility reasons. Use rootMargin only
  
  
      _getRootMargin() {
        return this._config.offset ? `${this._config.offset}px 0px -30%` : this._config.rootMargin;
      }
  
      _initializeTargetsAndObservables() {
        this._targetLinks = new Map();
        this._observableSections = new Map();
        const targetLinks = SelectorEngine.find(SELECTOR_TARGET_LINKS, this._config.target);
  
        for (const anchor of targetLinks) {
          // ensure that the anchor has an id and is not disabled
          if (!anchor.hash || isDisabled(anchor)) {
            continue;
          }
  
          const observableSection = SelectorEngine.findOne(anchor.hash, this._element); // ensure that the observableSection exists & is visible
  
          if (isVisible(observableSection)) {
            this._targetLinks.set(anchor.hash, anchor);
  
            this._observableSections.set(anchor.hash, observableSection);
          }
        }
      }
  
      _process(target) {
        if (this._activeTarget === target) {
          return;
        }
  
        this._clearActiveClass(this._config.target);
  
        this._activeTarget = target;
        target.classList.add(CLASS_NAME_ACTIVE$1);
  
        this._activateParents(target);
  
        EventHandler.trigger(this._element, EVENT_ACTIVATE, {
          relatedTarget: target
        });
      }
  
      _activateParents(target) {
        // Activate dropdown parents
        if (target.classList.contains(CLASS_NAME_DROPDOWN_ITEM)) {
          SelectorEngine.findOne(SELECTOR_DROPDOWN_TOGGLE$1, target.closest(SELECTOR_DROPDOWN)).classList.add(CLASS_NAME_ACTIVE$1);
          return;
        }
  
        for (const listGroup of SelectorEngine.parents(target, SELECTOR_NAV_LIST_GROUP)) {
          // Set triggered links parents as active
          // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor
          for (const item of SelectorEngine.prev(listGroup, SELECTOR_LINK_ITEMS)) {
            item.classList.add(CLASS_NAME_ACTIVE$1);
          }
        }
      }
  
      _clearActiveClass(parent) {
        parent.classList.remove(CLASS_NAME_ACTIVE$1);
        const activeNodes = SelectorEngine.find(`${SELECTOR_TARGET_LINKS}.${CLASS_NAME_ACTIVE$1}`, parent);
  
        for (const node of activeNodes) {
          node.classList.remove(CLASS_NAME_ACTIVE$1);
        }
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = ScrollSpy.getOrCreateInstance(this, config);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config]();
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(window, EVENT_LOAD_DATA_API$1, () => {
      for (const spy of SelectorEngine.find(SELECTOR_DATA_SPY)) {
        ScrollSpy.getOrCreateInstance(spy);
      }
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(ScrollSpy);
  
  
    const NAME$1 = 'tab';
    const DATA_KEY$1 = 'bs.tab';
    const EVENT_KEY$1 = `.${DATA_KEY$1}`;
    const EVENT_HIDE$1 = `hide${EVENT_KEY$1}`;
    const EVENT_HIDDEN$1 = `hidden${EVENT_KEY$1}`;
    const EVENT_SHOW$1 = `show${EVENT_KEY$1}`;
    const EVENT_SHOWN$1 = `shown${EVENT_KEY$1}`;
    const EVENT_CLICK_DATA_API = `click${EVENT_KEY$1}`;
    const EVENT_KEYDOWN = `keydown${EVENT_KEY$1}`;
    const EVENT_LOAD_DATA_API = `load${EVENT_KEY$1}`;
    const ARROW_LEFT_KEY = 'ArrowLeft';
    const ARROW_RIGHT_KEY = 'ArrowRight';
    const ARROW_UP_KEY = 'ArrowUp';
    const ARROW_DOWN_KEY = 'ArrowDown';
    const CLASS_NAME_ACTIVE = 'active';
    const CLASS_NAME_FADE$1 = 'fade';
    const CLASS_NAME_SHOW$1 = 'show';
    const CLASS_DROPDOWN = 'dropdown';
    const SELECTOR_DROPDOWN_TOGGLE = '.dropdown-toggle';
    const SELECTOR_DROPDOWN_MENU = '.dropdown-menu';
    const SELECTOR_DROPDOWN_ITEM = '.dropdown-item';
    const NOT_SELECTOR_DROPDOWN_TOGGLE = ':not(.dropdown-toggle)';
    const SELECTOR_TAB_PANEL = '.list-group, .nav, [role="tablist"]';
    const SELECTOR_OUTER = '.nav-item, .list-group-item';
    const SELECTOR_INNER = `.nav-link${NOT_SELECTOR_DROPDOWN_TOGGLE}, .list-group-item${NOT_SELECTOR_DROPDOWN_TOGGLE}, [role="tab"]${NOT_SELECTOR_DROPDOWN_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE = '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-toggle="list"]'; // todo:v6: could be only `tab`
  
    const SELECTOR_INNER_ELEM = `${SELECTOR_INNER}, ${SELECTOR_DATA_TOGGLE}`;
    const SELECTOR_DATA_TOGGLE_ACTIVE = `.${CLASS_NAME_ACTIVE}[data-bs-toggle="tab"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="pill"], .${CLASS_NAME_ACTIVE}[data-bs-toggle="list"]`;
    /**
     * Class definition
     */
  
    class Tab extends BaseComponent {
      constructor(element) {
        super(element);
        this._parent = this._element.closest(SELECTOR_TAB_PANEL);
  
        if (!this._parent) {
          return; // todo: should Throw exception on v6
          // throw new TypeError(`${element.outerHTML} has not a valid parent ${SELECTOR_INNER_ELEM}`)
        } // Set up initial aria attributes
  
  
        this._setInitialAttributes(this._parent, this._getChildren());
  
        EventHandler.on(this._element, EVENT_KEYDOWN, event => this._keydown(event));
      } // Getters
  
  
      static get NAME() {
        return NAME$1;
      } // Public
  
  
      show() {
        // Shows this elem and deactivate the active sibling if exists
        const innerElem = this._element;
  
        if (this._elemIsActive(innerElem)) {
          return;
        } // Search for active tab on same parent to deactivate it
  
  
        const active = this._getActiveElem();
  
        const hideEvent = active ? EventHandler.trigger(active, EVENT_HIDE$1, {
          relatedTarget: innerElem
        }) : null;
        const showEvent = EventHandler.trigger(innerElem, EVENT_SHOW$1, {
          relatedTarget: active
        });
  
        if (showEvent.defaultPrevented || hideEvent && hideEvent.defaultPrevented) {
          return;
        }
  
        this._deactivate(active, innerElem);
  
        this._activate(innerElem, active);
      } // Private
  
  
      _activate(element, relatedElem) {
        if (!element) {
          return;
        }
  
        element.classList.add(CLASS_NAME_ACTIVE);
  
        this._activate(getElementFromSelector(element)); // Search and activate/show the proper section
  
  
        const complete = () => {
          if (element.getAttribute('role') !== 'tab') {
            element.classList.add(CLASS_NAME_SHOW$1);
            return;
          }
  
          element.focus();
          element.removeAttribute('tabindex');
          element.setAttribute('aria-selected', true);
  
          this._toggleDropDown(element, true);
  
          EventHandler.trigger(element, EVENT_SHOWN$1, {
            relatedTarget: relatedElem
          });
        };
  
        this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
      }
  
      _deactivate(element, relatedElem) {
        if (!element) {
          return;
        }
  
        element.classList.remove(CLASS_NAME_ACTIVE);
        element.blur();
  
        this._deactivate(getElementFromSelector(element)); // Search and deactivate the shown section too
  
  
        const complete = () => {
          if (element.getAttribute('role') !== 'tab') {
            element.classList.remove(CLASS_NAME_SHOW$1);
            return;
          }
  
          element.setAttribute('aria-selected', false);
          element.setAttribute('tabindex', '-1');
  
          this._toggleDropDown(element, false);
  
          EventHandler.trigger(element, EVENT_HIDDEN$1, {
            relatedTarget: relatedElem
          });
        };
  
        this._queueCallback(complete, element, element.classList.contains(CLASS_NAME_FADE$1));
      }
  
      _keydown(event) {
        if (![ARROW_LEFT_KEY, ARROW_RIGHT_KEY, ARROW_UP_KEY, ARROW_DOWN_KEY].includes(event.key)) {
          return;
        }
  
        event.stopPropagation(); // stopPropagation/preventDefault both added to support up/down keys without scrolling the page
  
        event.preventDefault();
        const isNext = [ARROW_RIGHT_KEY, ARROW_DOWN_KEY].includes(event.key);
        const nextActiveElement = getNextActiveElement(this._getChildren().filter(element => !isDisabled(element)), event.target, isNext, true);
  
        if (nextActiveElement) {
          Tab.getOrCreateInstance(nextActiveElement).show();
        }
      }
  
      _getChildren() {
        // collection of inner elements
        return SelectorEngine.find(SELECTOR_INNER_ELEM, this._parent);
      }
  
      _getActiveElem() {
        return this._getChildren().find(child => this._elemIsActive(child)) || null;
      }
  
      _setInitialAttributes(parent, children) {
        this._setAttributeIfNotExists(parent, 'role', 'tablist');
  
        for (const child of children) {
          this._setInitialAttributesOnChild(child);
        }
      }
  
      _setInitialAttributesOnChild(child) {
        child = this._getInnerElement(child);
  
        const isActive = this._elemIsActive(child);
  
        const outerElem = this._getOuterElement(child);
  
        child.setAttribute('aria-selected', isActive);
  
        if (outerElem !== child) {
          this._setAttributeIfNotExists(outerElem, 'role', 'presentation');
        }
  
        if (!isActive) {
          child.setAttribute('tabindex', '-1');
        }
  
        this._setAttributeIfNotExists(child, 'role', 'tab'); // set attributes to the related panel too
  
  
        this._setInitialAttributesOnTargetPanel(child);
      }
  
      _setInitialAttributesOnTargetPanel(child) {
        const target = getElementFromSelector(child);
  
        if (!target) {
          return;
        }
  
        this._setAttributeIfNotExists(target, 'role', 'tabpanel');
  
        if (child.id) {
          this._setAttributeIfNotExists(target, 'aria-labelledby', `#${child.id}`);
        }
      }
  
      _toggleDropDown(element, open) {
        const outerElem = this._getOuterElement(element);
  
        if (!outerElem.classList.contains(CLASS_DROPDOWN)) {
          return;
        }
  
        const toggle = (selector, className) => {
          const element = SelectorEngine.findOne(selector, outerElem);
  
          if (element) {
            element.classList.toggle(className, open);
          }
        };
  
        toggle(SELECTOR_DROPDOWN_TOGGLE, CLASS_NAME_ACTIVE);
        toggle(SELECTOR_DROPDOWN_MENU, CLASS_NAME_SHOW$1);
        toggle(SELECTOR_DROPDOWN_ITEM, CLASS_NAME_ACTIVE);
        outerElem.setAttribute('aria-expanded', open);
      }
  
      _setAttributeIfNotExists(element, attribute, value) {
        if (!element.hasAttribute(attribute)) {
          element.setAttribute(attribute, value);
        }
      }
  
      _elemIsActive(elem) {
        return elem.classList.contains(CLASS_NAME_ACTIVE);
      } // Try to get the inner element (usually the .nav-link)
  
  
      _getInnerElement(elem) {
        return elem.matches(SELECTOR_INNER_ELEM) ? elem : SelectorEngine.findOne(SELECTOR_INNER_ELEM, elem);
      } // Try to get the outer element (usually the .nav-item)
  
  
      _getOuterElement(elem) {
        return elem.closest(SELECTOR_OUTER) || elem;
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Tab.getOrCreateInstance(this);
  
          if (typeof config !== 'string') {
            return;
          }
  
          if (data[config] === undefined || config.startsWith('_') || config === 'constructor') {
            throw new TypeError(`No method named "${config}"`);
          }
  
          data[config]();
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    EventHandler.on(document, EVENT_CLICK_DATA_API, SELECTOR_DATA_TOGGLE, function (event) {
      if (['A', 'AREA'].includes(this.tagName)) {
        event.preventDefault();
      }
  
      if (isDisabled(this)) {
        return;
      }
  
      Tab.getOrCreateInstance(this).show();
    });
    /**
     * Initialize on focus
     */
  
    EventHandler.on(window, EVENT_LOAD_DATA_API, () => {
      for (const element of SelectorEngine.find(SELECTOR_DATA_TOGGLE_ACTIVE)) {
        Tab.getOrCreateInstance(element);
      }
    });
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Tab);
  
  
  
    const NAME = 'toast';
    const DATA_KEY = 'bs.toast';
    const EVENT_KEY = `.${DATA_KEY}`;
    const EVENT_MOUSEOVER = `mouseover${EVENT_KEY}`;
    const EVENT_MOUSEOUT = `mouseout${EVENT_KEY}`;
    const EVENT_FOCUSIN = `focusin${EVENT_KEY}`;
    const EVENT_FOCUSOUT = `focusout${EVENT_KEY}`;
    const EVENT_HIDE = `hide${EVENT_KEY}`;
    const EVENT_HIDDEN = `hidden${EVENT_KEY}`;
    const EVENT_SHOW = `show${EVENT_KEY}`;
    const EVENT_SHOWN = `shown${EVENT_KEY}`;
    const CLASS_NAME_FADE = 'fade';
    const CLASS_NAME_HIDE = 'hide'; // @deprecated - kept here only for backwards compatibility
  
    const CLASS_NAME_SHOW = 'show';
    const CLASS_NAME_SHOWING = 'showing';
    const DefaultType = {
      animation: 'boolean',
      autohide: 'boolean',
      delay: 'number'
    };
    const Default = {
      animation: true,
      autohide: true,
      delay: 5000
    };
    /**
     * Class definition
     */
  
    class Toast extends BaseComponent {
      constructor(element, config) {
        super(element, config);
        this._timeout = null;
        this._hasMouseInteraction = false;
        this._hasKeyboardInteraction = false;
  
        this._setListeners();
      } // Getters
  
  
      static get Default() {
        return Default;
      }
  
      static get DefaultType() {
        return DefaultType;
      }
  
      static get NAME() {
        return NAME;
      } // Public
  
  
      show() {
        const showEvent = EventHandler.trigger(this._element, EVENT_SHOW);
  
        if (showEvent.defaultPrevented) {
          return;
        }
  
        this._clearTimeout();
  
        if (this._config.animation) {
          this._element.classList.add(CLASS_NAME_FADE);
        }
  
        const complete = () => {
          this._element.classList.remove(CLASS_NAME_SHOWING);
  
          EventHandler.trigger(this._element, EVENT_SHOWN);
  
          this._maybeScheduleHide();
        };
  
        this._element.classList.remove(CLASS_NAME_HIDE); // @deprecated
  
  
        reflow(this._element);
  
        this._element.classList.add(CLASS_NAME_SHOW, CLASS_NAME_SHOWING);
  
        this._queueCallback(complete, this._element, this._config.animation);
      }
  
      hide() {
        if (!this.isShown()) {
          return;
        }
  
        const hideEvent = EventHandler.trigger(this._element, EVENT_HIDE);
  
        if (hideEvent.defaultPrevented) {
          return;
        }
  
        const complete = () => {
          this._element.classList.add(CLASS_NAME_HIDE); // @deprecated
  
  
          this._element.classList.remove(CLASS_NAME_SHOWING, CLASS_NAME_SHOW);
  
          EventHandler.trigger(this._element, EVENT_HIDDEN);
        };
  
        this._element.classList.add(CLASS_NAME_SHOWING);
  
        this._queueCallback(complete, this._element, this._config.animation);
      }
  
      dispose() {
        this._clearTimeout();
  
        if (this.isShown()) {
          this._element.classList.remove(CLASS_NAME_SHOW);
        }
  
        super.dispose();
      }
  
      isShown() {
        return this._element.classList.contains(CLASS_NAME_SHOW);
      } // Private
  
  
      _maybeScheduleHide() {
        if (!this._config.autohide) {
          return;
        }
  
        if (this._hasMouseInteraction || this._hasKeyboardInteraction) {
          return;
        }
  
        this._timeout = setTimeout(() => {
          this.hide();
        }, this._config.delay);
      }
  
      _onInteraction(event, isInteracting) {
        switch (event.type) {
          case 'mouseover':
          case 'mouseout':
            this._hasMouseInteraction = isInteracting;
            break;
  
          case 'focusin':
          case 'focusout':
            this._hasKeyboardInteraction = isInteracting;
            break;
        }
  
        if (isInteracting) {
          this._clearTimeout();
  
          return;
        }
  
        const nextElement = event.relatedTarget;
  
        if (this._element === nextElement || this._element.contains(nextElement)) {
          return;
        }
  
        this._maybeScheduleHide();
      }
  
      _setListeners() {
        EventHandler.on(this._element, EVENT_MOUSEOVER, event => this._onInteraction(event, true));
        EventHandler.on(this._element, EVENT_MOUSEOUT, event => this._onInteraction(event, false));
        EventHandler.on(this._element, EVENT_FOCUSIN, event => this._onInteraction(event, true));
        EventHandler.on(this._element, EVENT_FOCUSOUT, event => this._onInteraction(event, false));
      }
  
      _clearTimeout() {
        clearTimeout(this._timeout);
        this._timeout = null;
      } // Static
  
  
      static jQueryInterface(config) {
        return this.each(function () {
          const data = Toast.getOrCreateInstance(this, config);
  
          if (typeof config === 'string') {
            if (typeof data[config] === 'undefined') {
              throw new TypeError(`No method named "${config}"`);
            }
  
            data[config](this);
          }
        });
      }
  
    }
    /**
     * Data API implementation
     */
  
  
    enableDismissTrigger(Toast);
    /**
     * jQuery
     */
  
    defineJQueryPlugin(Toast);
  
   
    const index_umd = {
      Alert,
      Button,
      Carousel,
      Collapse,
      Dropdown,
      Modal,
      Offcanvas,
      Popover,
      ScrollSpy,
      Tab,
      Toast,
      Tooltip
    };
  
    return index_umd;
  
  }));
  