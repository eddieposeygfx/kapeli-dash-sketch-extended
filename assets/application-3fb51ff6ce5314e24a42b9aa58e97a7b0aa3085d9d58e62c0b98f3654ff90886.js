// Array.from polyfill for IE from MDN
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError('Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method 
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
};
(function($, undefined) {

/**
 * Unobtrusive scripting adapter for jQuery
 * https://github.com/rails/jquery-ujs
 *
 * Requires jQuery 1.8.0 or later.
 *
 * Released under the MIT license
 *
 */

  // Cut down on the number of issues from people inadvertently including jquery_ujs twice
  // by detecting and raising an error when it happens.
  'use strict';

  if ( $.rails !== undefined ) {
    $.error('jquery-ujs has already been loaded!');
  }

  // Shorthand to make it a little easier to call public rails functions from within rails.js
  var rails;
  var $document = $(document);

  $.rails = rails = {
    // Link elements bound by jquery-ujs
    linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',

    // Button elements bound by jquery-ujs
    buttonClickSelector: 'button[data-remote]:not([form]):not(form button), button[data-confirm]:not([form]):not(form button)',

    // Select elements bound by jquery-ujs
    inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',

    // Form elements bound by jquery-ujs
    formSubmitSelector: 'form',

    // Form input elements bound by jquery-ujs
    formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',

    // Form input elements disabled during form submission
    disableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',

    // Form input elements re-enabled after form submission
    enableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',

    // Form required input elements
    requiredInputSelector: 'input[name][required]:not([disabled]), textarea[name][required]:not([disabled])',

    // Form file input elements
    fileInputSelector: 'input[name][type=file]:not([disabled])',

    // Link onClick disable selector with possible reenable after remote submission
    linkDisableSelector: 'a[data-disable-with], a[data-disable]',

    // Button onClick disable selector with possible reenable after remote submission
    buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]',

    // Up-to-date Cross-Site Request Forgery token
    csrfToken: function() {
     return $('meta[name=csrf-token]').attr('content');
    },

    // URL param that must contain the CSRF token
    csrfParam: function() {
     return $('meta[name=csrf-param]').attr('content');
    },

    // Make sure that every Ajax request sends the CSRF token
    CSRFProtection: function(xhr) {
      var token = rails.csrfToken();
      if (token) xhr.setRequestHeader('X-CSRF-Token', token);
    },

    // Make sure that all forms have actual up-to-date tokens (cached forms contain old ones)
    refreshCSRFTokens: function(){
      $('form input[name="' + rails.csrfParam() + '"]').val(rails.csrfToken());
    },

    // Triggers an event on an element and returns false if the event result is false
    fire: function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    },

    // Default confirm dialog, may be overridden with custom confirm dialog in $.rails.confirm
    confirm: function(message) {
      return confirm(message);
    },

    // Default ajax function, may be overridden with custom function in $.rails.ajax
    ajax: function(options) {
      return $.ajax(options);
    },

    // Default way to get an element's href. May be overridden at $.rails.href.
    href: function(element) {
      return element[0].href;
    },

    // Checks "data-remote" if true to handle the request through a XHR request.
    isRemote: function(element) {
      return element.data('remote') !== undefined && element.data('remote') !== false;
    },

    // Submits "remote" forms and links with ajax
    handleRemote: function(element) {
      var method, url, data, withCredentials, dataType, options;

      if (rails.fire(element, 'ajax:before')) {
        withCredentials = element.data('with-credentials') || null;
        dataType = element.data('type') || ($.ajaxSettings && $.ajaxSettings.dataType);

        if (element.is('form')) {
          method = element.data('ujs:submit-button-formmethod') || element.attr('method');
          url = element.data('ujs:submit-button-formaction') || element.attr('action');
          data = $(element[0]).serializeArray();
          // memoized value from clicked submit button
          var button = element.data('ujs:submit-button');
          if (button) {
            data.push(button);
            element.data('ujs:submit-button', null);
          }
          element.data('ujs:submit-button-formmethod', null);
          element.data('ujs:submit-button-formaction', null);
        } else if (element.is(rails.inputChangeSelector)) {
          method = element.data('method');
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else if (element.is(rails.buttonClickSelector)) {
          method = element.data('method') || 'get';
          url = element.data('url');
          data = element.serialize();
          if (element.data('params')) data = data + '&' + element.data('params');
        } else {
          method = element.data('method');
          url = rails.href(element);
          data = element.data('params') || null;
        }

        options = {
          type: method || 'GET', data: data, dataType: dataType,
          // stopping the "ajax:beforeSend" event will cancel the ajax request
          beforeSend: function(xhr, settings) {
            if (settings.dataType === undefined) {
              xhr.setRequestHeader('accept', '*/*;q=0.5, ' + settings.accepts.script);
            }
            if (rails.fire(element, 'ajax:beforeSend', [xhr, settings])) {
              element.trigger('ajax:send', xhr);
            } else {
              return false;
            }
          },
          success: function(data, status, xhr) {
            element.trigger('ajax:success', [data, status, xhr]);
          },
          complete: function(xhr, status) {
            element.trigger('ajax:complete', [xhr, status]);
          },
          error: function(xhr, status, error) {
            element.trigger('ajax:error', [xhr, status, error]);
          },
          crossDomain: rails.isCrossDomain(url)
        };

        // There is no withCredentials for IE6-8 when
        // "Enable native XMLHTTP support" is disabled
        if (withCredentials) {
          options.xhrFields = {
            withCredentials: withCredentials
          };
        }

        // Only pass url to `ajax` options if not blank
        if (url) { options.url = url; }

        return rails.ajax(options);
      } else {
        return false;
      }
    },

    // Determines if the request is a cross domain request.
    isCrossDomain: function(url) {
      var originAnchor = document.createElement('a');
      originAnchor.href = location.href;
      var urlAnchor = document.createElement('a');

      try {
        urlAnchor.href = url;
        // This is a workaround to a IE bug.
        urlAnchor.href = urlAnchor.href;

        // If URL protocol is false or is a string containing a single colon
        // *and* host are false, assume it is not a cross-domain request
        // (should only be the case for IE7 and IE compatibility mode).
        // Otherwise, evaluate protocol and host of the URL against the origin
        // protocol and host.
        return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) ||
          (originAnchor.protocol + '//' + originAnchor.host ===
            urlAnchor.protocol + '//' + urlAnchor.host));
      } catch (e) {
        // If there is an error parsing the URL, assume it is crossDomain.
        return true;
      }
    },

    // Handles "data-method" on links such as:
    // <a href="/users/5" data-method="delete" rel="nofollow" data-confirm="Are you sure?">Delete</a>
    handleMethod: function(link) {
      var href = rails.href(link),
        method = link.data('method'),
        target = link.attr('target'),
        csrfToken = rails.csrfToken(),
        csrfParam = rails.csrfParam(),
        form = $('<form method="post" action="' + href + '"></form>'),
        metadataInput = '<input name="_method" value="' + method + '" type="hidden" />';

      if (csrfParam !== undefined && csrfToken !== undefined && !rails.isCrossDomain(href)) {
        metadataInput += '<input name="' + csrfParam + '" value="' + csrfToken + '" type="hidden" />';
      }

      if (target) { form.attr('target', target); }

      form.hide().append(metadataInput).appendTo('body');
      form.submit();
    },

    // Helper function that returns form elements that match the specified CSS selector
    // If form is actually a "form" element this will return associated elements outside the from that have
    // the html form attribute set
    formElements: function(form, selector) {
      return form.is('form') ? $(form[0].elements).filter(selector) : form.find(selector);
    },

    /* Disables form elements:
      - Caches element value in 'ujs:enable-with' data store
      - Replaces element text with value of 'data-disable-with' attribute
      - Sets disabled property to true
    */
    disableFormElements: function(form) {
      rails.formElements(form, rails.disableSelector).each(function() {
        rails.disableFormElement($(this));
      });
    },

    disableFormElement: function(element) {
      var method, replacement;

      method = element.is('button') ? 'html' : 'val';
      replacement = element.data('disable-with');

      if (replacement !== undefined) {
        element.data('ujs:enable-with', element[method]());
        element[method](replacement);
      }

      element.prop('disabled', true);
      element.data('ujs:disabled', true);
    },

    /* Re-enables disabled form elements:
      - Replaces element text with cached value from 'ujs:enable-with' data store (created in `disableFormElements`)
      - Sets disabled property to false
    */
    enableFormElements: function(form) {
      rails.formElements(form, rails.enableSelector).each(function() {
        rails.enableFormElement($(this));
      });
    },

    enableFormElement: function(element) {
      var method = element.is('button') ? 'html' : 'val';
      if (element.data('ujs:enable-with') !== undefined) {
        element[method](element.data('ujs:enable-with'));
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.prop('disabled', false);
      element.removeData('ujs:disabled');
    },

   /* For 'data-confirm' attribute:
      - Fires `confirm` event
      - Shows the confirmation dialog
      - Fires the `confirm:complete` event

      Returns `true` if no function stops the chain and user chose yes; `false` otherwise.
      Attaching a handler to the element's `confirm` event that returns a `falsy` value cancels the confirmation dialog.
      Attaching a handler to the element's `confirm:complete` event that returns a `falsy` value makes this function
      return false. The `confirm:complete` event is fired whether or not the user answered true or false to the dialog.
   */
    allowAction: function(element) {
      var message = element.data('confirm'),
          answer = false, callback;
      if (!message) { return true; }

      if (rails.fire(element, 'confirm')) {
        try {
          answer = rails.confirm(message);
        } catch (e) {
          (console.error || console.log).call(console, e.stack || e);
        }
        callback = rails.fire(element, 'confirm:complete', [answer]);
      }
      return answer && callback;
    },

    // Helper function which checks for blank inputs in a form that match the specified CSS selector
    blankInputs: function(form, specifiedSelector, nonBlank) {
      var foundInputs = $(),
        input,
        valueToCheck,
        radiosForNameWithNoneSelected,
        radioName,
        selector = specifiedSelector || 'input,textarea',
        requiredInputs = form.find(selector),
        checkedRadioButtonNames = {};

      requiredInputs.each(function() {
        input = $(this);
        if (input.is('input[type=radio]')) {

          // Don't count unchecked required radio as blank if other radio with same name is checked,
          // regardless of whether same-name radio input has required attribute or not. The spec
          // states https://www.w3.org/TR/html5/forms.html#the-required-attribute
          radioName = input.attr('name');

          // Skip if we've already seen the radio with this name.
          if (!checkedRadioButtonNames[radioName]) {

            // If none checked
            if (form.find('input[type=radio]:checked[name="' + radioName + '"]').length === 0) {
              radiosForNameWithNoneSelected = form.find(
                'input[type=radio][name="' + radioName + '"]');
              foundInputs = foundInputs.add(radiosForNameWithNoneSelected);
            }

            // We only need to check each name once.
            checkedRadioButtonNames[radioName] = radioName;
          }
        } else {
          valueToCheck = input.is('input[type=checkbox],input[type=radio]') ? input.is(':checked') : !!input.val();
          if (valueToCheck === nonBlank) {
            foundInputs = foundInputs.add(input);
          }
        }
      });
      return foundInputs.length ? foundInputs : false;
    },

    // Helper function which checks for non-blank inputs in a form that match the specified CSS selector
    nonBlankInputs: function(form, specifiedSelector) {
      return rails.blankInputs(form, specifiedSelector, true); // true specifies nonBlank
    },

    // Helper function, needed to provide consistent behavior in IE
    stopEverything: function(e) {
      $(e.target).trigger('ujs:everythingStopped');
      e.stopImmediatePropagation();
      return false;
    },

    //  Replace element's html with the 'data-disable-with' after storing original html
    //  and prevent clicking on it
    disableElement: function(element) {
      var replacement = element.data('disable-with');

      if (replacement !== undefined) {
        element.data('ujs:enable-with', element.html()); // store enabled state
        element.html(replacement);
      }

      element.bind('click.railsDisable', function(e) { // prevent further clicking
        return rails.stopEverything(e);
      });
      element.data('ujs:disabled', true);
    },

    // Restore element to its original state which was disabled by 'disableElement' above
    enableElement: function(element) {
      if (element.data('ujs:enable-with') !== undefined) {
        element.html(element.data('ujs:enable-with')); // set to old enabled state
        element.removeData('ujs:enable-with'); // clean up cache
      }
      element.unbind('click.railsDisable'); // enable element
      element.removeData('ujs:disabled');
    }
  };

  if (rails.fire($document, 'rails:attachBindings')) {

    $.ajaxPrefilter(function(options, originalOptions, xhr){ if ( !options.crossDomain ) { rails.CSRFProtection(xhr); }});

    // This event works the same as the load event, except that it fires every
    // time the page is loaded.
    //
    // See https://github.com/rails/jquery-ujs/issues/357
    // See https://developer.mozilla.org/en-US/docs/Using_Firefox_1.5_caching
    $(window).on('pageshow.rails', function () {
      $($.rails.enableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:disabled')) {
          $.rails.enableFormElement(element);
        }
      });

      $($.rails.linkDisableSelector).each(function () {
        var element = $(this);

        if (element.data('ujs:disabled')) {
          $.rails.enableElement(element);
        }
      });
    });

    $document.on('ajax:complete', rails.linkDisableSelector, function() {
        rails.enableElement($(this));
    });

    $document.on('ajax:complete', rails.buttonDisableSelector, function() {
        rails.enableFormElement($(this));
    });

    $document.on('click.rails', rails.linkClickSelector, function(e) {
      var link = $(this), method = link.data('method'), data = link.data('params'), metaClick = e.metaKey || e.ctrlKey;
      if (!rails.allowAction(link)) return rails.stopEverything(e);

      if (!metaClick && link.is(rails.linkDisableSelector)) rails.disableElement(link);

      if (rails.isRemote(link)) {
        if (metaClick && (!method || method === 'GET') && !data) { return true; }

        var handleRemote = rails.handleRemote(link);
        // Response from rails.handleRemote() will either be false or a deferred object promise.
        if (handleRemote === false) {
          rails.enableElement(link);
        } else {
          handleRemote.fail( function() { rails.enableElement(link); } );
        }
        return false;

      } else if (method) {
        rails.handleMethod(link);
        return false;
      }
    });

    $document.on('click.rails', rails.buttonClickSelector, function(e) {
      var button = $(this);

      if (!rails.allowAction(button) || !rails.isRemote(button)) return rails.stopEverything(e);

      if (button.is(rails.buttonDisableSelector)) rails.disableFormElement(button);

      var handleRemote = rails.handleRemote(button);
      // Response from rails.handleRemote() will either be false or a deferred object promise.
      if (handleRemote === false) {
        rails.enableFormElement(button);
      } else {
        handleRemote.fail( function() { rails.enableFormElement(button); } );
      }
      return false;
    });

    $document.on('change.rails', rails.inputChangeSelector, function(e) {
      var link = $(this);
      if (!rails.allowAction(link) || !rails.isRemote(link)) return rails.stopEverything(e);

      rails.handleRemote(link);
      return false;
    });

    $document.on('submit.rails', rails.formSubmitSelector, function(e) {
      var form = $(this),
        remote = rails.isRemote(form),
        blankRequiredInputs,
        nonBlankFileInputs;

      if (!rails.allowAction(form)) return rails.stopEverything(e);

      // Skip other logic when required values are missing or file upload is present
      if (form.attr('novalidate') === undefined) {
        if (form.data('ujs:formnovalidate-button') === undefined) {
          blankRequiredInputs = rails.blankInputs(form, rails.requiredInputSelector, false);
          if (blankRequiredInputs && rails.fire(form, 'ajax:aborted:required', [blankRequiredInputs])) {
            return rails.stopEverything(e);
          }
        } else {
          // Clear the formnovalidate in case the next button click is not on a formnovalidate button
          // Not strictly necessary to do here, since it is also reset on each button click, but just to be certain
          form.data('ujs:formnovalidate-button', undefined);
        }
      }

      if (remote) {
        nonBlankFileInputs = rails.nonBlankInputs(form, rails.fileInputSelector);
        if (nonBlankFileInputs) {
          // Slight timeout so that the submit button gets properly serialized
          // (make it easy for event handler to serialize form without disabled values)
          setTimeout(function(){ rails.disableFormElements(form); }, 13);
          var aborted = rails.fire(form, 'ajax:aborted:file', [nonBlankFileInputs]);

          // Re-enable form elements if event bindings return false (canceling normal form submission)
          if (!aborted) { setTimeout(function(){ rails.enableFormElements(form); }, 13); }

          return aborted;
        }

        rails.handleRemote(form);
        return false;

      } else {
        // Slight timeout so that the submit button gets properly serialized
        setTimeout(function(){ rails.disableFormElements(form); }, 13);
      }
    });

    $document.on('click.rails', rails.formInputClickSelector, function(event) {
      var button = $(this);

      if (!rails.allowAction(button)) return rails.stopEverything(event);

      // Register the pressed submit button
      var name = button.attr('name'),
        data = name ? {name:name, value:button.val()} : null;

      var form = button.closest('form');
      if (form.length === 0) {
        form = $('#' + button.attr('form'));
      }
      form.data('ujs:submit-button', data);

      // Save attributes from button
      form.data('ujs:formnovalidate-button', button.attr('formnovalidate'));
      form.data('ujs:submit-button-formaction', button.attr('formaction'));
      form.data('ujs:submit-button-formmethod', button.attr('formmethod'));
    });

    $document.on('ajax:send.rails', rails.formSubmitSelector, function(event) {
      if (this === event.target) rails.disableFormElements($(this));
    });

    $document.on('ajax:complete.rails', rails.formSubmitSelector, function(event) {
      if (this === event.target) rails.enableFormElements($(this));
    });

    $(function(){
      rails.refreshCSRFTokens();
    });
  }

})( jQuery );
( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

$.ui = $.ui || {};

return $.ui.version = "1.12.1";

} ) );


/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Keycode
//>>group: Core
//>>description: Provide keycodes as keynames
//>>docs: http://api.jqueryui.com/jQuery.ui.keyCode/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.keyCode = {
	BACKSPACE: 8,
	COMMA: 188,
	DELETE: 46,
	DOWN: 40,
	END: 35,
	ENTER: 13,
	ESCAPE: 27,
	HOME: 36,
	LEFT: 37,
	PAGE_DOWN: 34,
	PAGE_UP: 33,
	PERIOD: 190,
	RIGHT: 39,
	SPACE: 32,
	TAB: 9,
	UP: 38
};

} ) );


/*!
 * jQuery UI Unique ID 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: uniqueId
//>>group: Core
//>>description: Functions to generate and remove uniqueId's
//>>docs: http://api.jqueryui.com/uniqueId/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {

return $.fn.extend( {
	uniqueId: ( function() {
		var uuid = 0;

		return function() {
			return this.each( function() {
				if ( !this.id ) {
					this.id = "ui-id-" + ( ++uuid );
				}
			} );
		};
	} )(),

	removeUniqueId: function() {
		return this.each( function() {
			if ( /^ui-id-\d+$/.test( this.id ) ) {
				$( this ).removeAttr( "id" );
			}
		} );
	}
} );

} ) );


/*!
 * jQuery UI Widget 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Widget
//>>group: Core
//>>description: Provides a factory for creating stateful widgets with a common API.
//>>docs: http://api.jqueryui.com/jQuery.widget/
//>>demos: http://jqueryui.com/widget/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

var widgetUuid = 0;
var widgetSlice = Array.prototype.slice;

$.cleanData = ( function( orig ) {
	return function( elems ) {
		var events, elem, i;
		for ( i = 0; ( elem = elems[ i ] ) != null; i++ ) {
			try {

				// Only trigger remove when necessary to save time
				events = $._data( elem, "events" );
				if ( events && events.remove ) {
					$( elem ).triggerHandler( "remove" );
				}

			// Http://bugs.jquery.com/ticket/8235
			} catch ( e ) {}
		}
		orig( elems );
	};
} )( $.cleanData );

$.widget = function( name, base, prototype ) {
	var existingConstructor, constructor, basePrototype;

	// ProxiedPrototype allows the provided prototype to remain unmodified
	// so that it can be used as a mixin for multiple widgets (#8876)
	var proxiedPrototype = {};

	var namespace = name.split( "." )[ 0 ];
	name = name.split( "." )[ 1 ];
	var fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	if ( $.isArray( prototype ) ) {
		prototype = $.extend.apply( null, [ {} ].concat( prototype ) );
	}

	// Create selector for plugin
	$.expr[ ":" ][ fullName.toLowerCase() ] = function( elem ) {
		return !!$.data( elem, fullName );
	};

	$[ namespace ] = $[ namespace ] || {};
	existingConstructor = $[ namespace ][ name ];
	constructor = $[ namespace ][ name ] = function( options, element ) {

		// Allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new constructor( options, element );
		}

		// Allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	};

	// Extend with the existing constructor to carry over any static properties
	$.extend( constructor, existingConstructor, {
		version: prototype.version,

		// Copy the object used to create the prototype in case we need to
		// redefine the widget later
		_proto: $.extend( {}, prototype ),

		// Track widgets that inherit from this widget in case this widget is
		// redefined after a widget inherits from it
		_childConstructors: []
	} );

	basePrototype = new base();

	// We need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.widget.extend( {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( !$.isFunction( value ) ) {
			proxiedPrototype[ prop ] = value;
			return;
		}
		proxiedPrototype[ prop ] = ( function() {
			function _super() {
				return base.prototype[ prop ].apply( this, arguments );
			}

			function _superApply( args ) {
				return base.prototype[ prop ].apply( this, args );
			}

			return function() {
				var __super = this._super;
				var __superApply = this._superApply;
				var returnValue;

				this._super = _super;
				this._superApply = _superApply;

				returnValue = value.apply( this, arguments );

				this._super = __super;
				this._superApply = __superApply;

				return returnValue;
			};
		} )();
	} );
	constructor.prototype = $.widget.extend( basePrototype, {

		// TODO: remove support for widgetEventPrefix
		// always use the name + a colon as the prefix, e.g., draggable:start
		// don't prefix for widgets that aren't DOM-based
		widgetEventPrefix: existingConstructor ? ( basePrototype.widgetEventPrefix || name ) : name
	}, proxiedPrototype, {
		constructor: constructor,
		namespace: namespace,
		widgetName: name,
		widgetFullName: fullName
	} );

	// If this widget is being redefined then we need to find all widgets that
	// are inheriting from it and redefine all of them so that they inherit from
	// the new version of this widget. We're essentially trying to replace one
	// level in the prototype chain.
	if ( existingConstructor ) {
		$.each( existingConstructor._childConstructors, function( i, child ) {
			var childPrototype = child.prototype;

			// Redefine the child widget using the same prototype that was
			// originally used, but inherit from the new version of the base
			$.widget( childPrototype.namespace + "." + childPrototype.widgetName, constructor,
				child._proto );
		} );

		// Remove the list of existing child constructors from the old constructor
		// so the old child constructors can be garbage collected
		delete existingConstructor._childConstructors;
	} else {
		base._childConstructors.push( constructor );
	}

	$.widget.bridge( name, constructor );

	return constructor;
};

$.widget.extend = function( target ) {
	var input = widgetSlice.call( arguments, 1 );
	var inputIndex = 0;
	var inputLength = input.length;
	var key;
	var value;

	for ( ; inputIndex < inputLength; inputIndex++ ) {
		for ( key in input[ inputIndex ] ) {
			value = input[ inputIndex ][ key ];
			if ( input[ inputIndex ].hasOwnProperty( key ) && value !== undefined ) {

				// Clone objects
				if ( $.isPlainObject( value ) ) {
					target[ key ] = $.isPlainObject( target[ key ] ) ?
						$.widget.extend( {}, target[ key ], value ) :

						// Don't extend strings, arrays, etc. with objects
						$.widget.extend( {}, value );

				// Copy everything else by reference
				} else {
					target[ key ] = value;
				}
			}
		}
	}
	return target;
};

$.widget.bridge = function( name, object ) {
	var fullName = object.prototype.widgetFullName || name;
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string";
		var args = widgetSlice.call( arguments, 1 );
		var returnValue = this;

		if ( isMethodCall ) {

			// If this is an empty collection, we need to have the instance method
			// return undefined instead of the jQuery instance
			if ( !this.length && options === "instance" ) {
				returnValue = undefined;
			} else {
				this.each( function() {
					var methodValue;
					var instance = $.data( this, fullName );

					if ( options === "instance" ) {
						returnValue = instance;
						return false;
					}

					if ( !instance ) {
						return $.error( "cannot call methods on " + name +
							" prior to initialization; " +
							"attempted to call method '" + options + "'" );
					}

					if ( !$.isFunction( instance[ options ] ) || options.charAt( 0 ) === "_" ) {
						return $.error( "no such method '" + options + "' for " + name +
							" widget instance" );
					}

					methodValue = instance[ options ].apply( instance, args );

					if ( methodValue !== instance && methodValue !== undefined ) {
						returnValue = methodValue && methodValue.jquery ?
							returnValue.pushStack( methodValue.get() ) :
							methodValue;
						return false;
					}
				} );
			}
		} else {

			// Allow multiple hashes to be passed on init
			if ( args.length ) {
				options = $.widget.extend.apply( null, [ options ].concat( args ) );
			}

			this.each( function() {
				var instance = $.data( this, fullName );
				if ( instance ) {
					instance.option( options || {} );
					if ( instance._init ) {
						instance._init();
					}
				} else {
					$.data( this, fullName, new object( options, this ) );
				}
			} );
		}

		return returnValue;
	};
};

$.Widget = function( /* options, element */ ) {};
$.Widget._childConstructors = [];

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",

	options: {
		classes: {},
		disabled: false,

		// Callbacks
		create: null
	},

	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.uuid = widgetUuid++;
		this.eventNamespace = "." + this.widgetName + this.uuid;

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();
		this.classesElementLookup = {};

		if ( element !== this ) {
			$.data( element, this.widgetFullName, this );
			this._on( true, this.element, {
				remove: function( event ) {
					if ( event.target === element ) {
						this.destroy();
					}
				}
			} );
			this.document = $( element.style ?

				// Element within the document
				element.ownerDocument :

				// Element is window or document
				element.document || element );
			this.window = $( this.document[ 0 ].defaultView || this.document[ 0 ].parentWindow );
		}

		this.options = $.widget.extend( {},
			this.options,
			this._getCreateOptions(),
			options );

		this._create();

		if ( this.options.disabled ) {
			this._setOptionDisabled( this.options.disabled );
		}

		this._trigger( "create", null, this._getCreateEventData() );
		this._init();
	},

	_getCreateOptions: function() {
		return {};
	},

	_getCreateEventData: $.noop,

	_create: $.noop,

	_init: $.noop,

	destroy: function() {
		var that = this;

		this._destroy();
		$.each( this.classesElementLookup, function( key, value ) {
			that._removeClass( value, key );
		} );

		// We can probably remove the unbind calls in 2.0
		// all event bindings should go through this._on()
		this.element
			.off( this.eventNamespace )
			.removeData( this.widgetFullName );
		this.widget()
			.off( this.eventNamespace )
			.removeAttr( "aria-disabled" );

		// Clean up events and states
		this.bindings.off( this.eventNamespace );
	},

	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;
		var parts;
		var curOption;
		var i;

		if ( arguments.length === 0 ) {

			// Don't return a reference to the internal hash
			return $.widget.extend( {}, this.options );
		}

		if ( typeof key === "string" ) {

			// Handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
			options = {};
			parts = key.split( "." );
			key = parts.shift();
			if ( parts.length ) {
				curOption = options[ key ] = $.widget.extend( {}, this.options[ key ] );
				for ( i = 0; i < parts.length - 1; i++ ) {
					curOption[ parts[ i ] ] = curOption[ parts[ i ] ] || {};
					curOption = curOption[ parts[ i ] ];
				}
				key = parts.pop();
				if ( arguments.length === 1 ) {
					return curOption[ key ] === undefined ? null : curOption[ key ];
				}
				curOption[ key ] = value;
			} else {
				if ( arguments.length === 1 ) {
					return this.options[ key ] === undefined ? null : this.options[ key ];
				}
				options[ key ] = value;
			}
		}

		this._setOptions( options );

		return this;
	},

	_setOptions: function( options ) {
		var key;

		for ( key in options ) {
			this._setOption( key, options[ key ] );
		}

		return this;
	},

	_setOption: function( key, value ) {
		if ( key === "classes" ) {
			this._setOptionClasses( value );
		}

		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this._setOptionDisabled( value );
		}

		return this;
	},

	_setOptionClasses: function( value ) {
		var classKey, elements, currentElements;

		for ( classKey in value ) {
			currentElements = this.classesElementLookup[ classKey ];
			if ( value[ classKey ] === this.options.classes[ classKey ] ||
					!currentElements ||
					!currentElements.length ) {
				continue;
			}

			// We are doing this to create a new jQuery object because the _removeClass() call
			// on the next line is going to destroy the reference to the current elements being
			// tracked. We need to save a copy of this collection so that we can add the new classes
			// below.
			elements = $( currentElements.get() );
			this._removeClass( currentElements, classKey );

			// We don't use _addClass() here, because that uses this.options.classes
			// for generating the string of classes. We want to use the value passed in from
			// _setOption(), this is the new value of the classes option which was passed to
			// _setOption(). We pass this value directly to _classes().
			elements.addClass( this._classes( {
				element: elements,
				keys: classKey,
				classes: value,
				add: true
			} ) );
		}
	},

	_setOptionDisabled: function( value ) {
		this._toggleClass( this.widget(), this.widgetFullName + "-disabled", null, !!value );

		// If the widget is becoming disabled, then nothing is interactive
		if ( value ) {
			this._removeClass( this.hoverable, null, "ui-state-hover" );
			this._removeClass( this.focusable, null, "ui-state-focus" );
		}
	},

	enable: function() {
		return this._setOptions( { disabled: false } );
	},

	disable: function() {
		return this._setOptions( { disabled: true } );
	},

	_classes: function( options ) {
		var full = [];
		var that = this;

		options = $.extend( {
			element: this.element,
			classes: this.options.classes || {}
		}, options );

		function processClassString( classes, checkOption ) {
			var current, i;
			for ( i = 0; i < classes.length; i++ ) {
				current = that.classesElementLookup[ classes[ i ] ] || $();
				if ( options.add ) {
					current = $( $.unique( current.get().concat( options.element.get() ) ) );
				} else {
					current = $( current.not( options.element ).get() );
				}
				that.classesElementLookup[ classes[ i ] ] = current;
				full.push( classes[ i ] );
				if ( checkOption && options.classes[ classes[ i ] ] ) {
					full.push( options.classes[ classes[ i ] ] );
				}
			}
		}

		this._on( options.element, {
			"remove": "_untrackClassesElement"
		} );

		if ( options.keys ) {
			processClassString( options.keys.match( /\S+/g ) || [], true );
		}
		if ( options.extra ) {
			processClassString( options.extra.match( /\S+/g ) || [] );
		}

		return full.join( " " );
	},

	_untrackClassesElement: function( event ) {
		var that = this;
		$.each( that.classesElementLookup, function( key, value ) {
			if ( $.inArray( event.target, value ) !== -1 ) {
				that.classesElementLookup[ key ] = $( value.not( event.target ).get() );
			}
		} );
	},

	_removeClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, false );
	},

	_addClass: function( element, keys, extra ) {
		return this._toggleClass( element, keys, extra, true );
	},

	_toggleClass: function( element, keys, extra, add ) {
		add = ( typeof add === "boolean" ) ? add : extra;
		var shift = ( typeof element === "string" || element === null ),
			options = {
				extra: shift ? keys : extra,
				keys: shift ? element : keys,
				element: shift ? this.element : element,
				add: add
			};
		options.element.toggleClass( this._classes( options ), add );
		return this;
	},

	_on: function( suppressDisabledCheck, element, handlers ) {
		var delegateElement;
		var instance = this;

		// No suppressDisabledCheck flag, shuffle arguments
		if ( typeof suppressDisabledCheck !== "boolean" ) {
			handlers = element;
			element = suppressDisabledCheck;
			suppressDisabledCheck = false;
		}

		// No element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
			delegateElement = this.widget();
		} else {
			element = delegateElement = $( element );
			this.bindings = this.bindings.add( element );
		}

		$.each( handlers, function( event, handler ) {
			function handlerProxy() {

				// Allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( !suppressDisabledCheck &&
						( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			}

			// Copy the guid so direct unbinding works
			if ( typeof handler !== "string" ) {
				handlerProxy.guid = handler.guid =
					handler.guid || handlerProxy.guid || $.guid++;
			}

			var match = event.match( /^([\w:-]*)\s*(.*)$/ );
			var eventName = match[ 1 ] + instance.eventNamespace;
			var selector = match[ 2 ];

			if ( selector ) {
				delegateElement.on( eventName, selector, handlerProxy );
			} else {
				element.on( eventName, handlerProxy );
			}
		} );
	},

	_off: function( element, eventName ) {
		eventName = ( eventName || "" ).split( " " ).join( this.eventNamespace + " " ) +
			this.eventNamespace;
		element.off( eventName ).off( eventName );

		// Clear the stack to avoid memory leaks (#10056)
		this.bindings = $( this.bindings.not( element ).get() );
		this.focusable = $( this.focusable.not( element ).get() );
		this.hoverable = $( this.hoverable.not( element ).get() );
	},

	_delay: function( handler, delay ) {
		function handlerProxy() {
			return ( typeof handler === "string" ? instance[ handler ] : handler )
				.apply( instance, arguments );
		}
		var instance = this;
		return setTimeout( handlerProxy, delay || 0 );
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._on( element, {
			mouseenter: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-hover" );
			},
			mouseleave: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-hover" );
			}
		} );
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._on( element, {
			focusin: function( event ) {
				this._addClass( $( event.currentTarget ), null, "ui-state-focus" );
			},
			focusout: function( event ) {
				this._removeClass( $( event.currentTarget ), null, "ui-state-focus" );
			}
		} );
	},

	_trigger: function( type, event, data ) {
		var prop, orig;
		var callback = this.options[ type ];

		data = data || {};
		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();

		// The original event may come from any element
		// so we need to reset the target on the new event
		event.target = this.element[ 0 ];

		// Copy original event properties over to the new event
		orig = event.originalEvent;
		if ( orig ) {
			for ( prop in orig ) {
				if ( !( prop in event ) ) {
					event[ prop ] = orig[ prop ];
				}
			}
		}

		this.element.trigger( event, data );
		return !( $.isFunction( callback ) &&
			callback.apply( this.element[ 0 ], [ event ].concat( data ) ) === false ||
			event.isDefaultPrevented() );
	}
};

$.each( { show: "fadeIn", hide: "fadeOut" }, function( method, defaultEffect ) {
	$.Widget.prototype[ "_" + method ] = function( element, options, callback ) {
		if ( typeof options === "string" ) {
			options = { effect: options };
		}

		var hasOptions;
		var effectName = !options ?
			method :
			options === true || typeof options === "number" ?
				defaultEffect :
				options.effect || defaultEffect;

		options = options || {};
		if ( typeof options === "number" ) {
			options = { duration: options };
		}

		hasOptions = !$.isEmptyObject( options );
		options.complete = callback;

		if ( options.delay ) {
			element.delay( options.delay );
		}

		if ( hasOptions && $.effects && $.effects.effect[ effectName ] ) {
			element[ method ]( options );
		} else if ( effectName !== method && element[ effectName ] ) {
			element[ effectName ]( options.duration, options.easing, callback );
		} else {
			element.queue( function( next ) {
				$( this )[ method ]();
				if ( callback ) {
					callback.call( element[ 0 ] );
				}
				next();
			} );
		}
	};
} );

return $.widget;

} ) );





/*!
 * jQuery UI Accordion 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Accordion
//>>group: Widgets
// jscs:disable maximumLineLength
//>>description: Displays collapsible content panels for presenting information in a limited amount of space.
// jscs:enable maximumLineLength
//>>docs: http://api.jqueryui.com/accordion/
//>>demos: http://jqueryui.com/accordion/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/accordion.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../version",
			"../keycode",
			"../unique-id",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.widget( "ui.accordion", {
	version: "1.12.1",
	options: {
		active: 0,
		animate: {},
		classes: {
			"ui-accordion-header": "ui-corner-top",
			"ui-accordion-header-collapsed": "ui-corner-all",
			"ui-accordion-content": "ui-corner-bottom"
		},
		collapsible: false,
		event: "click",
		header: "> li > :first-child, > :not(li):even",
		heightStyle: "auto",
		icons: {
			activeHeader: "ui-icon-triangle-1-s",
			header: "ui-icon-triangle-1-e"
		},

		// Callbacks
		activate: null,
		beforeActivate: null
	},

	hideProps: {
		borderTopWidth: "hide",
		borderBottomWidth: "hide",
		paddingTop: "hide",
		paddingBottom: "hide",
		height: "hide"
	},

	showProps: {
		borderTopWidth: "show",
		borderBottomWidth: "show",
		paddingTop: "show",
		paddingBottom: "show",
		height: "show"
	},

	_create: function() {
		var options = this.options;

		this.prevShow = this.prevHide = $();
		this._addClass( "ui-accordion", "ui-widget ui-helper-reset" );
		this.element.attr( "role", "tablist" );

		// Don't allow collapsible: false and active: false / null
		if ( !options.collapsible && ( options.active === false || options.active == null ) ) {
			options.active = 0;
		}

		this._processPanels();

		// handle negative values
		if ( options.active < 0 ) {
			options.active += this.headers.length;
		}
		this._refresh();
	},

	_getCreateEventData: function() {
		return {
			header: this.active,
			panel: !this.active.length ? $() : this.active.next()
		};
	},

	_createIcons: function() {
		var icon, children,
			icons = this.options.icons;

		if ( icons ) {
			icon = $( "<span>" );
			this._addClass( icon, "ui-accordion-header-icon", "ui-icon " + icons.header );
			icon.prependTo( this.headers );
			children = this.active.children( ".ui-accordion-header-icon" );
			this._removeClass( children, icons.header )
				._addClass( children, null, icons.activeHeader )
				._addClass( this.headers, "ui-accordion-icons" );
		}
	},

	_destroyIcons: function() {
		this._removeClass( this.headers, "ui-accordion-icons" );
		this.headers.children( ".ui-accordion-header-icon" ).remove();
	},

	_destroy: function() {
		var contents;

		// Clean up main element
		this.element.removeAttr( "role" );

		// Clean up headers
		this.headers
			.removeAttr( "role aria-expanded aria-selected aria-controls tabIndex" )
			.removeUniqueId();

		this._destroyIcons();

		// Clean up content panels
		contents = this.headers.next()
			.css( "display", "" )
			.removeAttr( "role aria-hidden aria-labelledby" )
			.removeUniqueId();

		if ( this.options.heightStyle !== "content" ) {
			contents.css( "height", "" );
		}
	},

	_setOption: function( key, value ) {
		if ( key === "active" ) {

			// _activate() will handle invalid values and update this.options
			this._activate( value );
			return;
		}

		if ( key === "event" ) {
			if ( this.options.event ) {
				this._off( this.headers, this.options.event );
			}
			this._setupEvents( value );
		}

		this._super( key, value );

		// Setting collapsible: false while collapsed; open first panel
		if ( key === "collapsible" && !value && this.options.active === false ) {
			this._activate( 0 );
		}

		if ( key === "icons" ) {
			this._destroyIcons();
			if ( value ) {
				this._createIcons();
			}
		}
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.element.attr( "aria-disabled", value );

		// Support: IE8 Only
		// #5332 / #6059 - opacity doesn't cascade to positioned elements in IE
		// so we need to add the disabled class to the headers and panels
		this._toggleClass( null, "ui-state-disabled", !!value );
		this._toggleClass( this.headers.add( this.headers.next() ), null, "ui-state-disabled",
			!!value );
	},

	_keydown: function( event ) {
		if ( event.altKey || event.ctrlKey ) {
			return;
		}

		var keyCode = $.ui.keyCode,
			length = this.headers.length,
			currentIndex = this.headers.index( event.target ),
			toFocus = false;

		switch ( event.keyCode ) {
		case keyCode.RIGHT:
		case keyCode.DOWN:
			toFocus = this.headers[ ( currentIndex + 1 ) % length ];
			break;
		case keyCode.LEFT:
		case keyCode.UP:
			toFocus = this.headers[ ( currentIndex - 1 + length ) % length ];
			break;
		case keyCode.SPACE:
		case keyCode.ENTER:
			this._eventHandler( event );
			break;
		case keyCode.HOME:
			toFocus = this.headers[ 0 ];
			break;
		case keyCode.END:
			toFocus = this.headers[ length - 1 ];
			break;
		}

		if ( toFocus ) {
			$( event.target ).attr( "tabIndex", -1 );
			$( toFocus ).attr( "tabIndex", 0 );
			$( toFocus ).trigger( "focus" );
			event.preventDefault();
		}
	},

	_panelKeyDown: function( event ) {
		if ( event.keyCode === $.ui.keyCode.UP && event.ctrlKey ) {
			$( event.currentTarget ).prev().trigger( "focus" );
		}
	},

	refresh: function() {
		var options = this.options;
		this._processPanels();

		// Was collapsed or no panel
		if ( ( options.active === false && options.collapsible === true ) ||
				!this.headers.length ) {
			options.active = false;
			this.active = $();

		// active false only when collapsible is true
		} else if ( options.active === false ) {
			this._activate( 0 );

		// was active, but active panel is gone
		} else if ( this.active.length && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {

			// all remaining panel are disabled
			if ( this.headers.length === this.headers.find( ".ui-state-disabled" ).length ) {
				options.active = false;
				this.active = $();

			// activate previous panel
			} else {
				this._activate( Math.max( 0, options.active - 1 ) );
			}

		// was active, active panel still exists
		} else {

			// make sure active index is correct
			options.active = this.headers.index( this.active );
		}

		this._destroyIcons();

		this._refresh();
	},

	_processPanels: function() {
		var prevHeaders = this.headers,
			prevPanels = this.panels;

		this.headers = this.element.find( this.options.header );
		this._addClass( this.headers, "ui-accordion-header ui-accordion-header-collapsed",
			"ui-state-default" );

		this.panels = this.headers.next().filter( ":not(.ui-accordion-content-active)" ).hide();
		this._addClass( this.panels, "ui-accordion-content", "ui-helper-reset ui-widget-content" );

		// Avoid memory leaks (#10056)
		if ( prevPanels ) {
			this._off( prevHeaders.not( this.headers ) );
			this._off( prevPanels.not( this.panels ) );
		}
	},

	_refresh: function() {
		var maxHeight,
			options = this.options,
			heightStyle = options.heightStyle,
			parent = this.element.parent();

		this.active = this._findActive( options.active );
		this._addClass( this.active, "ui-accordion-header-active", "ui-state-active" )
			._removeClass( this.active, "ui-accordion-header-collapsed" );
		this._addClass( this.active.next(), "ui-accordion-content-active" );
		this.active.next().show();

		this.headers
			.attr( "role", "tab" )
			.each( function() {
				var header = $( this ),
					headerId = header.uniqueId().attr( "id" ),
					panel = header.next(),
					panelId = panel.uniqueId().attr( "id" );
				header.attr( "aria-controls", panelId );
				panel.attr( "aria-labelledby", headerId );
			} )
			.next()
				.attr( "role", "tabpanel" );

		this.headers
			.not( this.active )
				.attr( {
					"aria-selected": "false",
					"aria-expanded": "false",
					tabIndex: -1
				} )
				.next()
					.attr( {
						"aria-hidden": "true"
					} )
					.hide();

		// Make sure at least one header is in the tab order
		if ( !this.active.length ) {
			this.headers.eq( 0 ).attr( "tabIndex", 0 );
		} else {
			this.active.attr( {
				"aria-selected": "true",
				"aria-expanded": "true",
				tabIndex: 0
			} )
				.next()
					.attr( {
						"aria-hidden": "false"
					} );
		}

		this._createIcons();

		this._setupEvents( options.event );

		if ( heightStyle === "fill" ) {
			maxHeight = parent.height();
			this.element.siblings( ":visible" ).each( function() {
				var elem = $( this ),
					position = elem.css( "position" );

				if ( position === "absolute" || position === "fixed" ) {
					return;
				}
				maxHeight -= elem.outerHeight( true );
			} );

			this.headers.each( function() {
				maxHeight -= $( this ).outerHeight( true );
			} );

			this.headers.next()
				.each( function() {
					$( this ).height( Math.max( 0, maxHeight -
						$( this ).innerHeight() + $( this ).height() ) );
				} )
				.css( "overflow", "auto" );
		} else if ( heightStyle === "auto" ) {
			maxHeight = 0;
			this.headers.next()
				.each( function() {
					var isVisible = $( this ).is( ":visible" );
					if ( !isVisible ) {
						$( this ).show();
					}
					maxHeight = Math.max( maxHeight, $( this ).css( "height", "" ).height() );
					if ( !isVisible ) {
						$( this ).hide();
					}
				} )
				.height( maxHeight );
		}
	},

	_activate: function( index ) {
		var active = this._findActive( index )[ 0 ];

		// Trying to activate the already active panel
		if ( active === this.active[ 0 ] ) {
			return;
		}

		// Trying to collapse, simulate a click on the currently active header
		active = active || this.active[ 0 ];

		this._eventHandler( {
			target: active,
			currentTarget: active,
			preventDefault: $.noop
		} );
	},

	_findActive: function( selector ) {
		return typeof selector === "number" ? this.headers.eq( selector ) : $();
	},

	_setupEvents: function( event ) {
		var events = {
			keydown: "_keydown"
		};
		if ( event ) {
			$.each( event.split( " " ), function( index, eventName ) {
				events[ eventName ] = "_eventHandler";
			} );
		}

		this._off( this.headers.add( this.headers.next() ) );
		this._on( this.headers, events );
		this._on( this.headers.next(), { keydown: "_panelKeyDown" } );
		this._hoverable( this.headers );
		this._focusable( this.headers );
	},

	_eventHandler: function( event ) {
		var activeChildren, clickedChildren,
			options = this.options,
			active = this.active,
			clicked = $( event.currentTarget ),
			clickedIsActive = clicked[ 0 ] === active[ 0 ],
			collapsing = clickedIsActive && options.collapsible,
			toShow = collapsing ? $() : clicked.next(),
			toHide = active.next(),
			eventData = {
				oldHeader: active,
				oldPanel: toHide,
				newHeader: collapsing ? $() : clicked,
				newPanel: toShow
			};

		event.preventDefault();

		if (

				// click on active header, but not collapsible
				( clickedIsActive && !options.collapsible ) ||

				// allow canceling activation
				( this._trigger( "beforeActivate", event, eventData ) === false ) ) {
			return;
		}

		options.active = collapsing ? false : this.headers.index( clicked );

		// When the call to ._toggle() comes after the class changes
		// it causes a very odd bug in IE 8 (see #6720)
		this.active = clickedIsActive ? $() : clicked;
		this._toggle( eventData );

		// Switch classes
		// corner classes on the previously active header stay after the animation
		this._removeClass( active, "ui-accordion-header-active", "ui-state-active" );
		if ( options.icons ) {
			activeChildren = active.children( ".ui-accordion-header-icon" );
			this._removeClass( activeChildren, null, options.icons.activeHeader )
				._addClass( activeChildren, null, options.icons.header );
		}

		if ( !clickedIsActive ) {
			this._removeClass( clicked, "ui-accordion-header-collapsed" )
				._addClass( clicked, "ui-accordion-header-active", "ui-state-active" );
			if ( options.icons ) {
				clickedChildren = clicked.children( ".ui-accordion-header-icon" );
				this._removeClass( clickedChildren, null, options.icons.header )
					._addClass( clickedChildren, null, options.icons.activeHeader );
			}

			this._addClass( clicked.next(), "ui-accordion-content-active" );
		}
	},

	_toggle: function( data ) {
		var toShow = data.newPanel,
			toHide = this.prevShow.length ? this.prevShow : data.oldPanel;

		// Handle activating a panel during the animation for another activation
		this.prevShow.add( this.prevHide ).stop( true, true );
		this.prevShow = toShow;
		this.prevHide = toHide;

		if ( this.options.animate ) {
			this._animate( toShow, toHide, data );
		} else {
			toHide.hide();
			toShow.show();
			this._toggleComplete( data );
		}

		toHide.attr( {
			"aria-hidden": "true"
		} );
		toHide.prev().attr( {
			"aria-selected": "false",
			"aria-expanded": "false"
		} );

		// if we're switching panels, remove the old header from the tab order
		// if we're opening from collapsed state, remove the previous header from the tab order
		// if we're collapsing, then keep the collapsing header in the tab order
		if ( toShow.length && toHide.length ) {
			toHide.prev().attr( {
				"tabIndex": -1,
				"aria-expanded": "false"
			} );
		} else if ( toShow.length ) {
			this.headers.filter( function() {
				return parseInt( $( this ).attr( "tabIndex" ), 10 ) === 0;
			} )
				.attr( "tabIndex", -1 );
		}

		toShow
			.attr( "aria-hidden", "false" )
			.prev()
				.attr( {
					"aria-selected": "true",
					"aria-expanded": "true",
					tabIndex: 0
				} );
	},

	_animate: function( toShow, toHide, data ) {
		var total, easing, duration,
			that = this,
			adjust = 0,
			boxSizing = toShow.css( "box-sizing" ),
			down = toShow.length &&
				( !toHide.length || ( toShow.index() < toHide.index() ) ),
			animate = this.options.animate || {},
			options = down && animate.down || animate,
			complete = function() {
				that._toggleComplete( data );
			};

		if ( typeof options === "number" ) {
			duration = options;
		}
		if ( typeof options === "string" ) {
			easing = options;
		}

		// fall back from options to animation in case of partial down settings
		easing = easing || options.easing || animate.easing;
		duration = duration || options.duration || animate.duration;

		if ( !toHide.length ) {
			return toShow.animate( this.showProps, duration, easing, complete );
		}
		if ( !toShow.length ) {
			return toHide.animate( this.hideProps, duration, easing, complete );
		}

		total = toShow.show().outerHeight();
		toHide.animate( this.hideProps, {
			duration: duration,
			easing: easing,
			step: function( now, fx ) {
				fx.now = Math.round( now );
			}
		} );
		toShow
			.hide()
			.animate( this.showProps, {
				duration: duration,
				easing: easing,
				complete: complete,
				step: function( now, fx ) {
					fx.now = Math.round( now );
					if ( fx.prop !== "height" ) {
						if ( boxSizing === "content-box" ) {
							adjust += fx.now;
						}
					} else if ( that.options.heightStyle !== "content" ) {
						fx.now = Math.round( total - toHide.outerHeight() - adjust );
						adjust = 0;
					}
				}
			} );
	},

	_toggleComplete: function( data ) {
		var toHide = data.oldPanel,
			prev = toHide.prev();

		this._removeClass( toHide, "ui-accordion-content-active" );
		this._removeClass( prev, "ui-accordion-header-active" )
			._addClass( prev, "ui-accordion-header-collapsed" );

		// Work around for rendering bug in IE (#5421)
		if ( toHide.length ) {
			toHide.parent()[ 0 ].className = toHide.parent()[ 0 ].className;
		}
		this._trigger( "activate", null, data );
	}
} );

} ) );


/*!
 * jQuery UI Position 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 *
 * http://api.jqueryui.com/position/
 */

//>>label: Position
//>>group: Core
//>>description: Positions elements relative to other elements.
//>>docs: http://api.jqueryui.com/position/
//>>demos: http://jqueryui.com/position/

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {
( function() {
var cachedScrollbarWidth,
	max = Math.max,
	abs = Math.abs,
	rhorizontal = /left|center|right/,
	rvertical = /top|center|bottom/,
	roffset = /[\+\-]\d+(\.[\d]+)?%?/,
	rposition = /^\w+/,
	rpercent = /%$/,
	_position = $.fn.position;

function getOffsets( offsets, width, height ) {
	return [
		parseFloat( offsets[ 0 ] ) * ( rpercent.test( offsets[ 0 ] ) ? width / 100 : 1 ),
		parseFloat( offsets[ 1 ] ) * ( rpercent.test( offsets[ 1 ] ) ? height / 100 : 1 )
	];
}

function parseCss( element, property ) {
	return parseInt( $.css( element, property ), 10 ) || 0;
}

function getDimensions( elem ) {
	var raw = elem[ 0 ];
	if ( raw.nodeType === 9 ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: 0, left: 0 }
		};
	}
	if ( $.isWindow( raw ) ) {
		return {
			width: elem.width(),
			height: elem.height(),
			offset: { top: elem.scrollTop(), left: elem.scrollLeft() }
		};
	}
	if ( raw.preventDefault ) {
		return {
			width: 0,
			height: 0,
			offset: { top: raw.pageY, left: raw.pageX }
		};
	}
	return {
		width: elem.outerWidth(),
		height: elem.outerHeight(),
		offset: elem.offset()
	};
}

$.position = {
	scrollbarWidth: function() {
		if ( cachedScrollbarWidth !== undefined ) {
			return cachedScrollbarWidth;
		}
		var w1, w2,
			div = $( "<div " +
				"style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'>" +
				"<div style='height:100px;width:auto;'></div></div>" ),
			innerDiv = div.children()[ 0 ];

		$( "body" ).append( div );
		w1 = innerDiv.offsetWidth;
		div.css( "overflow", "scroll" );

		w2 = innerDiv.offsetWidth;

		if ( w1 === w2 ) {
			w2 = div[ 0 ].clientWidth;
		}

		div.remove();

		return ( cachedScrollbarWidth = w1 - w2 );
	},
	getScrollInfo: function( within ) {
		var overflowX = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-x" ),
			overflowY = within.isWindow || within.isDocument ? "" :
				within.element.css( "overflow-y" ),
			hasOverflowX = overflowX === "scroll" ||
				( overflowX === "auto" && within.width < within.element[ 0 ].scrollWidth ),
			hasOverflowY = overflowY === "scroll" ||
				( overflowY === "auto" && within.height < within.element[ 0 ].scrollHeight );
		return {
			width: hasOverflowY ? $.position.scrollbarWidth() : 0,
			height: hasOverflowX ? $.position.scrollbarWidth() : 0
		};
	},
	getWithinInfo: function( element ) {
		var withinElement = $( element || window ),
			isWindow = $.isWindow( withinElement[ 0 ] ),
			isDocument = !!withinElement[ 0 ] && withinElement[ 0 ].nodeType === 9,
			hasOffset = !isWindow && !isDocument;
		return {
			element: withinElement,
			isWindow: isWindow,
			isDocument: isDocument,
			offset: hasOffset ? $( element ).offset() : { left: 0, top: 0 },
			scrollLeft: withinElement.scrollLeft(),
			scrollTop: withinElement.scrollTop(),
			width: withinElement.outerWidth(),
			height: withinElement.outerHeight()
		};
	}
};

$.fn.position = function( options ) {
	if ( !options || !options.of ) {
		return _position.apply( this, arguments );
	}

	// Make a copy, we don't want to modify arguments
	options = $.extend( {}, options );

	var atOffset, targetWidth, targetHeight, targetOffset, basePosition, dimensions,
		target = $( options.of ),
		within = $.position.getWithinInfo( options.within ),
		scrollInfo = $.position.getScrollInfo( within ),
		collision = ( options.collision || "flip" ).split( " " ),
		offsets = {};

	dimensions = getDimensions( target );
	if ( target[ 0 ].preventDefault ) {

		// Force left top to allow flipping
		options.at = "left top";
	}
	targetWidth = dimensions.width;
	targetHeight = dimensions.height;
	targetOffset = dimensions.offset;

	// Clone to reuse original targetOffset later
	basePosition = $.extend( {}, targetOffset );

	// Force my and at to have valid horizontal and vertical positions
	// if a value is missing or invalid, it will be converted to center
	$.each( [ "my", "at" ], function() {
		var pos = ( options[ this ] || "" ).split( " " ),
			horizontalOffset,
			verticalOffset;

		if ( pos.length === 1 ) {
			pos = rhorizontal.test( pos[ 0 ] ) ?
				pos.concat( [ "center" ] ) :
				rvertical.test( pos[ 0 ] ) ?
					[ "center" ].concat( pos ) :
					[ "center", "center" ];
		}
		pos[ 0 ] = rhorizontal.test( pos[ 0 ] ) ? pos[ 0 ] : "center";
		pos[ 1 ] = rvertical.test( pos[ 1 ] ) ? pos[ 1 ] : "center";

		// Calculate offsets
		horizontalOffset = roffset.exec( pos[ 0 ] );
		verticalOffset = roffset.exec( pos[ 1 ] );
		offsets[ this ] = [
			horizontalOffset ? horizontalOffset[ 0 ] : 0,
			verticalOffset ? verticalOffset[ 0 ] : 0
		];

		// Reduce to just the positions without the offsets
		options[ this ] = [
			rposition.exec( pos[ 0 ] )[ 0 ],
			rposition.exec( pos[ 1 ] )[ 0 ]
		];
	} );

	// Normalize collision option
	if ( collision.length === 1 ) {
		collision[ 1 ] = collision[ 0 ];
	}

	if ( options.at[ 0 ] === "right" ) {
		basePosition.left += targetWidth;
	} else if ( options.at[ 0 ] === "center" ) {
		basePosition.left += targetWidth / 2;
	}

	if ( options.at[ 1 ] === "bottom" ) {
		basePosition.top += targetHeight;
	} else if ( options.at[ 1 ] === "center" ) {
		basePosition.top += targetHeight / 2;
	}

	atOffset = getOffsets( offsets.at, targetWidth, targetHeight );
	basePosition.left += atOffset[ 0 ];
	basePosition.top += atOffset[ 1 ];

	return this.each( function() {
		var collisionPosition, using,
			elem = $( this ),
			elemWidth = elem.outerWidth(),
			elemHeight = elem.outerHeight(),
			marginLeft = parseCss( this, "marginLeft" ),
			marginTop = parseCss( this, "marginTop" ),
			collisionWidth = elemWidth + marginLeft + parseCss( this, "marginRight" ) +
				scrollInfo.width,
			collisionHeight = elemHeight + marginTop + parseCss( this, "marginBottom" ) +
				scrollInfo.height,
			position = $.extend( {}, basePosition ),
			myOffset = getOffsets( offsets.my, elem.outerWidth(), elem.outerHeight() );

		if ( options.my[ 0 ] === "right" ) {
			position.left -= elemWidth;
		} else if ( options.my[ 0 ] === "center" ) {
			position.left -= elemWidth / 2;
		}

		if ( options.my[ 1 ] === "bottom" ) {
			position.top -= elemHeight;
		} else if ( options.my[ 1 ] === "center" ) {
			position.top -= elemHeight / 2;
		}

		position.left += myOffset[ 0 ];
		position.top += myOffset[ 1 ];

		collisionPosition = {
			marginLeft: marginLeft,
			marginTop: marginTop
		};

		$.each( [ "left", "top" ], function( i, dir ) {
			if ( $.ui.position[ collision[ i ] ] ) {
				$.ui.position[ collision[ i ] ][ dir ]( position, {
					targetWidth: targetWidth,
					targetHeight: targetHeight,
					elemWidth: elemWidth,
					elemHeight: elemHeight,
					collisionPosition: collisionPosition,
					collisionWidth: collisionWidth,
					collisionHeight: collisionHeight,
					offset: [ atOffset[ 0 ] + myOffset[ 0 ], atOffset [ 1 ] + myOffset[ 1 ] ],
					my: options.my,
					at: options.at,
					within: within,
					elem: elem
				} );
			}
		} );

		if ( options.using ) {

			// Adds feedback as second argument to using callback, if present
			using = function( props ) {
				var left = targetOffset.left - position.left,
					right = left + targetWidth - elemWidth,
					top = targetOffset.top - position.top,
					bottom = top + targetHeight - elemHeight,
					feedback = {
						target: {
							element: target,
							left: targetOffset.left,
							top: targetOffset.top,
							width: targetWidth,
							height: targetHeight
						},
						element: {
							element: elem,
							left: position.left,
							top: position.top,
							width: elemWidth,
							height: elemHeight
						},
						horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
						vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
					};
				if ( targetWidth < elemWidth && abs( left + right ) < targetWidth ) {
					feedback.horizontal = "center";
				}
				if ( targetHeight < elemHeight && abs( top + bottom ) < targetHeight ) {
					feedback.vertical = "middle";
				}
				if ( max( abs( left ), abs( right ) ) > max( abs( top ), abs( bottom ) ) ) {
					feedback.important = "horizontal";
				} else {
					feedback.important = "vertical";
				}
				options.using.call( this, props, feedback );
			};
		}

		elem.offset( $.extend( position, { using: using } ) );
	} );
};

$.ui.position = {
	fit: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
				outerWidth = within.width,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = withinOffset - collisionPosLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
				newOverRight;

			// Element is wider than within
			if ( data.collisionWidth > outerWidth ) {

				// Element is initially over the left side of within
				if ( overLeft > 0 && overRight <= 0 ) {
					newOverRight = position.left + overLeft + data.collisionWidth - outerWidth -
						withinOffset;
					position.left += overLeft - newOverRight;

				// Element is initially over right side of within
				} else if ( overRight > 0 && overLeft <= 0 ) {
					position.left = withinOffset;

				// Element is initially over both left and right sides of within
				} else {
					if ( overLeft > overRight ) {
						position.left = withinOffset + outerWidth - data.collisionWidth;
					} else {
						position.left = withinOffset;
					}
				}

			// Too far left -> align with left edge
			} else if ( overLeft > 0 ) {
				position.left += overLeft;

			// Too far right -> align with right edge
			} else if ( overRight > 0 ) {
				position.left -= overRight;

			// Adjust based on position and margin
			} else {
				position.left = max( position.left - collisionPosLeft, position.left );
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
				outerHeight = data.within.height,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = withinOffset - collisionPosTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
				newOverBottom;

			// Element is taller than within
			if ( data.collisionHeight > outerHeight ) {

				// Element is initially over the top of within
				if ( overTop > 0 && overBottom <= 0 ) {
					newOverBottom = position.top + overTop + data.collisionHeight - outerHeight -
						withinOffset;
					position.top += overTop - newOverBottom;

				// Element is initially over bottom of within
				} else if ( overBottom > 0 && overTop <= 0 ) {
					position.top = withinOffset;

				// Element is initially over both top and bottom of within
				} else {
					if ( overTop > overBottom ) {
						position.top = withinOffset + outerHeight - data.collisionHeight;
					} else {
						position.top = withinOffset;
					}
				}

			// Too far up -> align with top
			} else if ( overTop > 0 ) {
				position.top += overTop;

			// Too far down -> align with bottom edge
			} else if ( overBottom > 0 ) {
				position.top -= overBottom;

			// Adjust based on position and margin
			} else {
				position.top = max( position.top - collisionPosTop, position.top );
			}
		}
	},
	flip: {
		left: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.left + within.scrollLeft,
				outerWidth = within.width,
				offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
				collisionPosLeft = position.left - data.collisionPosition.marginLeft,
				overLeft = collisionPosLeft - offsetLeft,
				overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
				myOffset = data.my[ 0 ] === "left" ?
					-data.elemWidth :
					data.my[ 0 ] === "right" ?
						data.elemWidth :
						0,
				atOffset = data.at[ 0 ] === "left" ?
					data.targetWidth :
					data.at[ 0 ] === "right" ?
						-data.targetWidth :
						0,
				offset = -2 * data.offset[ 0 ],
				newOverRight,
				newOverLeft;

			if ( overLeft < 0 ) {
				newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth -
					outerWidth - withinOffset;
				if ( newOverRight < 0 || newOverRight < abs( overLeft ) ) {
					position.left += myOffset + atOffset + offset;
				}
			} else if ( overRight > 0 ) {
				newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset +
					atOffset + offset - offsetLeft;
				if ( newOverLeft > 0 || abs( newOverLeft ) < overRight ) {
					position.left += myOffset + atOffset + offset;
				}
			}
		},
		top: function( position, data ) {
			var within = data.within,
				withinOffset = within.offset.top + within.scrollTop,
				outerHeight = within.height,
				offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
				collisionPosTop = position.top - data.collisionPosition.marginTop,
				overTop = collisionPosTop - offsetTop,
				overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
				top = data.my[ 1 ] === "top",
				myOffset = top ?
					-data.elemHeight :
					data.my[ 1 ] === "bottom" ?
						data.elemHeight :
						0,
				atOffset = data.at[ 1 ] === "top" ?
					data.targetHeight :
					data.at[ 1 ] === "bottom" ?
						-data.targetHeight :
						0,
				offset = -2 * data.offset[ 1 ],
				newOverTop,
				newOverBottom;
			if ( overTop < 0 ) {
				newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight -
					outerHeight - withinOffset;
				if ( newOverBottom < 0 || newOverBottom < abs( overTop ) ) {
					position.top += myOffset + atOffset + offset;
				}
			} else if ( overBottom > 0 ) {
				newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset +
					offset - offsetTop;
				if ( newOverTop > 0 || abs( newOverTop ) < overBottom ) {
					position.top += myOffset + atOffset + offset;
				}
			}
		}
	},
	flipfit: {
		left: function() {
			$.ui.position.flip.left.apply( this, arguments );
			$.ui.position.fit.left.apply( this, arguments );
		},
		top: function() {
			$.ui.position.flip.top.apply( this, arguments );
			$.ui.position.fit.top.apply( this, arguments );
		}
	}
};

} )();

return $.ui.position;

} ) );

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [ "jquery", "./version" ], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
} ( function( $ ) {
return $.ui.safeActiveElement = function( document ) {
	var activeElement;

	// Support: IE 9 only
	// IE9 throws an "Unspecified error" accessing document.activeElement from an <iframe>
	try {
		activeElement = document.activeElement;
	} catch ( error ) {
		activeElement = document.body;
	}

	// Support: IE 9 - 11 only
	// IE may return null instead of an element
	// Interestingly, this only seems to occur when NOT in an iframe
	if ( !activeElement ) {
		activeElement = document.body;
	}

	// Support: IE 11 only
	// IE11 returns a seemingly empty object in some cases when accessing
	// document.activeElement from an <iframe>
	if ( !activeElement.nodeName ) {
		activeElement = document.body;
	}

	return activeElement;
};

} ) );







/*!
 * jQuery UI Menu 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Menu
//>>group: Widgets
//>>description: Creates nestable menus.
//>>docs: http://api.jqueryui.com/menu/
//>>demos: http://jqueryui.com/menu/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/menu.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../unique-id",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

return $.widget( "ui.menu", {
	version: "1.12.1",
	defaultElement: "<ul>",
	delay: 300,
	options: {
		icons: {
			submenu: "ui-icon-caret-1-e"
		},
		items: "> *",
		menus: "ul",
		position: {
			my: "left top",
			at: "right top"
		},
		role: "menu",

		// Callbacks
		blur: null,
		focus: null,
		select: null
	},

	_create: function() {
		this.activeMenu = this.element;

		// Flag used to prevent firing of the click handler
		// as the event bubbles up through nested menus
		this.mouseHandled = false;
		this.element
			.uniqueId()
			.attr( {
				role: this.options.role,
				tabIndex: 0
			} );

		this._addClass( "ui-menu", "ui-widget ui-widget-content" );
		this._on( {

			// Prevent focus from sticking to links inside menu after clicking
			// them (focus should always stay on UL during navigation).
			"mousedown .ui-menu-item": function( event ) {
				event.preventDefault();
			},
			"click .ui-menu-item": function( event ) {
				var target = $( event.target );
				var active = $( $.ui.safeActiveElement( this.document[ 0 ] ) );
				if ( !this.mouseHandled && target.not( ".ui-state-disabled" ).length ) {
					this.select( event );

					// Only set the mouseHandled flag if the event will bubble, see #9469.
					if ( !event.isPropagationStopped() ) {
						this.mouseHandled = true;
					}

					// Open submenu on click
					if ( target.has( ".ui-menu" ).length ) {
						this.expand( event );
					} else if ( !this.element.is( ":focus" ) &&
							active.closest( ".ui-menu" ).length ) {

						// Redirect focus to the menu
						this.element.trigger( "focus", [ true ] );

						// If the active item is on the top level, let it stay active.
						// Otherwise, blur the active item since it is no longer visible.
						if ( this.active && this.active.parents( ".ui-menu" ).length === 1 ) {
							clearTimeout( this.timer );
						}
					}
				}
			},
			"mouseenter .ui-menu-item": function( event ) {

				// Ignore mouse events while typeahead is active, see #10458.
				// Prevents focusing the wrong item when typeahead causes a scroll while the mouse
				// is over an item in the menu
				if ( this.previousFilter ) {
					return;
				}

				var actualTarget = $( event.target ).closest( ".ui-menu-item" ),
					target = $( event.currentTarget );

				// Ignore bubbled events on parent items, see #11641
				if ( actualTarget[ 0 ] !== target[ 0 ] ) {
					return;
				}

				// Remove ui-state-active class from siblings of the newly focused menu item
				// to avoid a jump caused by adjacent elements both having a class with a border
				this._removeClass( target.siblings().children( ".ui-state-active" ),
					null, "ui-state-active" );
				this.focus( event, target );
			},
			mouseleave: "collapseAll",
			"mouseleave .ui-menu": "collapseAll",
			focus: function( event, keepActiveItem ) {

				// If there's already an active item, keep it active
				// If not, activate the first item
				var item = this.active || this.element.find( this.options.items ).eq( 0 );

				if ( !keepActiveItem ) {
					this.focus( event, item );
				}
			},
			blur: function( event ) {
				this._delay( function() {
					var notContained = !$.contains(
						this.element[ 0 ],
						$.ui.safeActiveElement( this.document[ 0 ] )
					);
					if ( notContained ) {
						this.collapseAll( event );
					}
				} );
			},
			keydown: "_keydown"
		} );

		this.refresh();

		// Clicks outside of a menu collapse any open menus
		this._on( this.document, {
			click: function( event ) {
				if ( this._closeOnDocumentClick( event ) ) {
					this.collapseAll( event );
				}

				// Reset the mouseHandled flag
				this.mouseHandled = false;
			}
		} );
	},

	_destroy: function() {
		var items = this.element.find( ".ui-menu-item" )
				.removeAttr( "role aria-disabled" ),
			submenus = items.children( ".ui-menu-item-wrapper" )
				.removeUniqueId()
				.removeAttr( "tabIndex role aria-haspopup" );

		// Destroy (sub)menus
		this.element
			.removeAttr( "aria-activedescendant" )
			.find( ".ui-menu" ).addBack()
				.removeAttr( "role aria-labelledby aria-expanded aria-hidden aria-disabled " +
					"tabIndex" )
				.removeUniqueId()
				.show();

		submenus.children().each( function() {
			var elem = $( this );
			if ( elem.data( "ui-menu-submenu-caret" ) ) {
				elem.remove();
			}
		} );
	},

	_keydown: function( event ) {
		var match, prev, character, skip,
			preventDefault = true;

		switch ( event.keyCode ) {
		case $.ui.keyCode.PAGE_UP:
			this.previousPage( event );
			break;
		case $.ui.keyCode.PAGE_DOWN:
			this.nextPage( event );
			break;
		case $.ui.keyCode.HOME:
			this._move( "first", "first", event );
			break;
		case $.ui.keyCode.END:
			this._move( "last", "last", event );
			break;
		case $.ui.keyCode.UP:
			this.previous( event );
			break;
		case $.ui.keyCode.DOWN:
			this.next( event );
			break;
		case $.ui.keyCode.LEFT:
			this.collapse( event );
			break;
		case $.ui.keyCode.RIGHT:
			if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
				this.expand( event );
			}
			break;
		case $.ui.keyCode.ENTER:
		case $.ui.keyCode.SPACE:
			this._activate( event );
			break;
		case $.ui.keyCode.ESCAPE:
			this.collapse( event );
			break;
		default:
			preventDefault = false;
			prev = this.previousFilter || "";
			skip = false;

			// Support number pad values
			character = event.keyCode >= 96 && event.keyCode <= 105 ?
				( event.keyCode - 96 ).toString() : String.fromCharCode( event.keyCode );

			clearTimeout( this.filterTimer );

			if ( character === prev ) {
				skip = true;
			} else {
				character = prev + character;
			}

			match = this._filterMenuItems( character );
			match = skip && match.index( this.active.next() ) !== -1 ?
				this.active.nextAll( ".ui-menu-item" ) :
				match;

			// If no matches on the current filter, reset to the last character pressed
			// to move down the menu to the first item that starts with that character
			if ( !match.length ) {
				character = String.fromCharCode( event.keyCode );
				match = this._filterMenuItems( character );
			}

			if ( match.length ) {
				this.focus( event, match );
				this.previousFilter = character;
				this.filterTimer = this._delay( function() {
					delete this.previousFilter;
				}, 1000 );
			} else {
				delete this.previousFilter;
			}
		}

		if ( preventDefault ) {
			event.preventDefault();
		}
	},

	_activate: function( event ) {
		if ( this.active && !this.active.is( ".ui-state-disabled" ) ) {
			if ( this.active.children( "[aria-haspopup='true']" ).length ) {
				this.expand( event );
			} else {
				this.select( event );
			}
		}
	},

	refresh: function() {
		var menus, items, newSubmenus, newItems, newWrappers,
			that = this,
			icon = this.options.icons.submenu,
			submenus = this.element.find( this.options.menus );

		this._toggleClass( "ui-menu-icons", null, !!this.element.find( ".ui-icon" ).length );

		// Initialize nested menus
		newSubmenus = submenus.filter( ":not(.ui-menu)" )
			.hide()
			.attr( {
				role: this.options.role,
				"aria-hidden": "true",
				"aria-expanded": "false"
			} )
			.each( function() {
				var menu = $( this ),
					item = menu.prev(),
					submenuCaret = $( "<span>" ).data( "ui-menu-submenu-caret", true );

				that._addClass( submenuCaret, "ui-menu-icon", "ui-icon " + icon );
				item
					.attr( "aria-haspopup", "true" )
					.prepend( submenuCaret );
				menu.attr( "aria-labelledby", item.attr( "id" ) );
			} );

		this._addClass( newSubmenus, "ui-menu", "ui-widget ui-widget-content ui-front" );

		menus = submenus.add( this.element );
		items = menus.find( this.options.items );

		// Initialize menu-items containing spaces and/or dashes only as dividers
		items.not( ".ui-menu-item" ).each( function() {
			var item = $( this );
			if ( that._isDivider( item ) ) {
				that._addClass( item, "ui-menu-divider", "ui-widget-content" );
			}
		} );

		// Don't refresh list items that are already adapted
		newItems = items.not( ".ui-menu-item, .ui-menu-divider" );
		newWrappers = newItems.children()
			.not( ".ui-menu" )
				.uniqueId()
				.attr( {
					tabIndex: -1,
					role: this._itemRole()
				} );
		this._addClass( newItems, "ui-menu-item" )
			._addClass( newWrappers, "ui-menu-item-wrapper" );

		// Add aria-disabled attribute to any disabled menu item
		items.filter( ".ui-state-disabled" ).attr( "aria-disabled", "true" );

		// If the active item has been removed, blur the menu
		if ( this.active && !$.contains( this.element[ 0 ], this.active[ 0 ] ) ) {
			this.blur();
		}
	},

	_itemRole: function() {
		return {
			menu: "menuitem",
			listbox: "option"
		}[ this.options.role ];
	},

	_setOption: function( key, value ) {
		if ( key === "icons" ) {
			var icons = this.element.find( ".ui-menu-icon" );
			this._removeClass( icons, null, this.options.icons.submenu )
				._addClass( icons, null, value.submenu );
		}
		this._super( key, value );
	},

	_setOptionDisabled: function( value ) {
		this._super( value );

		this.element.attr( "aria-disabled", String( value ) );
		this._toggleClass( null, "ui-state-disabled", !!value );
	},

	focus: function( event, item ) {
		var nested, focused, activeParent;
		this.blur( event, event && event.type === "focus" );

		this._scrollIntoView( item );

		this.active = item.first();

		focused = this.active.children( ".ui-menu-item-wrapper" );
		this._addClass( focused, null, "ui-state-active" );

		// Only update aria-activedescendant if there's a role
		// otherwise we assume focus is managed elsewhere
		if ( this.options.role ) {
			this.element.attr( "aria-activedescendant", focused.attr( "id" ) );
		}

		// Highlight active parent menu item, if any
		activeParent = this.active
			.parent()
				.closest( ".ui-menu-item" )
					.children( ".ui-menu-item-wrapper" );
		this._addClass( activeParent, null, "ui-state-active" );

		if ( event && event.type === "keydown" ) {
			this._close();
		} else {
			this.timer = this._delay( function() {
				this._close();
			}, this.delay );
		}

		nested = item.children( ".ui-menu" );
		if ( nested.length && event && ( /^mouse/.test( event.type ) ) ) {
			this._startOpening( nested );
		}
		this.activeMenu = item.parent();

		this._trigger( "focus", event, { item: item } );
	},

	_scrollIntoView: function( item ) {
		var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
		if ( this._hasScroll() ) {
			borderTop = parseFloat( $.css( this.activeMenu[ 0 ], "borderTopWidth" ) ) || 0;
			paddingTop = parseFloat( $.css( this.activeMenu[ 0 ], "paddingTop" ) ) || 0;
			offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
			scroll = this.activeMenu.scrollTop();
			elementHeight = this.activeMenu.height();
			itemHeight = item.outerHeight();

			if ( offset < 0 ) {
				this.activeMenu.scrollTop( scroll + offset );
			} else if ( offset + itemHeight > elementHeight ) {
				this.activeMenu.scrollTop( scroll + offset - elementHeight + itemHeight );
			}
		}
	},

	blur: function( event, fromFocus ) {
		if ( !fromFocus ) {
			clearTimeout( this.timer );
		}

		if ( !this.active ) {
			return;
		}

		this._removeClass( this.active.children( ".ui-menu-item-wrapper" ),
			null, "ui-state-active" );

		this._trigger( "blur", event, { item: this.active } );
		this.active = null;
	},

	_startOpening: function( submenu ) {
		clearTimeout( this.timer );

		// Don't open if already open fixes a Firefox bug that caused a .5 pixel
		// shift in the submenu position when mousing over the caret icon
		if ( submenu.attr( "aria-hidden" ) !== "true" ) {
			return;
		}

		this.timer = this._delay( function() {
			this._close();
			this._open( submenu );
		}, this.delay );
	},

	_open: function( submenu ) {
		var position = $.extend( {
			of: this.active
		}, this.options.position );

		clearTimeout( this.timer );
		this.element.find( ".ui-menu" ).not( submenu.parents( ".ui-menu" ) )
			.hide()
			.attr( "aria-hidden", "true" );

		submenu
			.show()
			.removeAttr( "aria-hidden" )
			.attr( "aria-expanded", "true" )
			.position( position );
	},

	collapseAll: function( event, all ) {
		clearTimeout( this.timer );
		this.timer = this._delay( function() {

			// If we were passed an event, look for the submenu that contains the event
			var currentMenu = all ? this.element :
				$( event && event.target ).closest( this.element.find( ".ui-menu" ) );

			// If we found no valid submenu ancestor, use the main menu to close all
			// sub menus anyway
			if ( !currentMenu.length ) {
				currentMenu = this.element;
			}

			this._close( currentMenu );

			this.blur( event );

			// Work around active item staying active after menu is blurred
			this._removeClass( currentMenu.find( ".ui-state-active" ), null, "ui-state-active" );

			this.activeMenu = currentMenu;
		}, this.delay );
	},

	// With no arguments, closes the currently active menu - if nothing is active
	// it closes all menus.  If passed an argument, it will search for menus BELOW
	_close: function( startMenu ) {
		if ( !startMenu ) {
			startMenu = this.active ? this.active.parent() : this.element;
		}

		startMenu.find( ".ui-menu" )
			.hide()
			.attr( "aria-hidden", "true" )
			.attr( "aria-expanded", "false" );
	},

	_closeOnDocumentClick: function( event ) {
		return !$( event.target ).closest( ".ui-menu" ).length;
	},

	_isDivider: function( item ) {

		// Match hyphen, em dash, en dash
		return !/[^\-\u2014\u2013\s]/.test( item.text() );
	},

	collapse: function( event ) {
		var newItem = this.active &&
			this.active.parent().closest( ".ui-menu-item", this.element );
		if ( newItem && newItem.length ) {
			this._close();
			this.focus( event, newItem );
		}
	},

	expand: function( event ) {
		var newItem = this.active &&
			this.active
				.children( ".ui-menu " )
					.find( this.options.items )
						.first();

		if ( newItem && newItem.length ) {
			this._open( newItem.parent() );

			// Delay so Firefox will not hide activedescendant change in expanding submenu from AT
			this._delay( function() {
				this.focus( event, newItem );
			} );
		}
	},

	next: function( event ) {
		this._move( "next", "first", event );
	},

	previous: function( event ) {
		this._move( "prev", "last", event );
	},

	isFirstItem: function() {
		return this.active && !this.active.prevAll( ".ui-menu-item" ).length;
	},

	isLastItem: function() {
		return this.active && !this.active.nextAll( ".ui-menu-item" ).length;
	},

	_move: function( direction, filter, event ) {
		var next;
		if ( this.active ) {
			if ( direction === "first" || direction === "last" ) {
				next = this.active
					[ direction === "first" ? "prevAll" : "nextAll" ]( ".ui-menu-item" )
					.eq( -1 );
			} else {
				next = this.active
					[ direction + "All" ]( ".ui-menu-item" )
					.eq( 0 );
			}
		}
		if ( !next || !next.length || !this.active ) {
			next = this.activeMenu.find( this.options.items )[ filter ]();
		}

		this.focus( event, next );
	},

	nextPage: function( event ) {
		var item, base, height;

		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isLastItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.nextAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base - height < 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items )
				[ !this.active ? "first" : "last" ]() );
		}
	},

	previousPage: function( event ) {
		var item, base, height;
		if ( !this.active ) {
			this.next( event );
			return;
		}
		if ( this.isFirstItem() ) {
			return;
		}
		if ( this._hasScroll() ) {
			base = this.active.offset().top;
			height = this.element.height();
			this.active.prevAll( ".ui-menu-item" ).each( function() {
				item = $( this );
				return item.offset().top - base + height > 0;
			} );

			this.focus( event, item );
		} else {
			this.focus( event, this.activeMenu.find( this.options.items ).first() );
		}
	},

	_hasScroll: function() {
		return this.element.outerHeight() < this.element.prop( "scrollHeight" );
	},

	select: function( event ) {

		// TODO: It should never be possible to not have an active item at this
		// point, but the tests don't trigger mouseenter before click.
		this.active = this.active || $( event.target ).closest( ".ui-menu-item" );
		var ui = { item: this.active };
		if ( !this.active.has( ".ui-menu" ).length ) {
			this.collapseAll( event, true );
		}
		this._trigger( "select", event, ui );
	},

	_filterMenuItems: function( character ) {
		var escapedCharacter = character.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" ),
			regex = new RegExp( "^" + escapedCharacter, "i" );

		return this.activeMenu
			.find( this.options.items )

				// Only match on items, not dividers or other content (#10571)
				.filter( ".ui-menu-item" )
					.filter( function() {
						return regex.test(
							$.trim( $( this ).children( ".ui-menu-item-wrapper" ).text() ) );
					} );
	}
} );

} ) );







/*!
 * jQuery UI Autocomplete 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */

//>>label: Autocomplete
//>>group: Widgets
//>>description: Lists suggested words as the user is typing.
//>>docs: http://api.jqueryui.com/autocomplete/
//>>demos: http://jqueryui.com/autocomplete/
//>>css.structure: ../../themes/base/core.css
//>>css.structure: ../../themes/base/autocomplete.css
//>>css.theme: ../../themes/base/theme.css

( function( factory ) {
	if ( typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define( [
			"jquery",
			"./menu",
			"../keycode",
			"../position",
			"../safe-active-element",
			"../version",
			"../widget"
		], factory );
	} else {

		// Browser globals
		factory( jQuery );
	}
}( function( $ ) {

$.widget( "ui.autocomplete", {
	version: "1.12.1",
	defaultElement: "<input>",
	options: {
		appendTo: null,
		autoFocus: false,
		delay: 300,
		minLength: 1,
		position: {
			my: "left top",
			at: "left bottom",
			collision: "none"
		},
		source: null,

		// Callbacks
		change: null,
		close: null,
		focus: null,
		open: null,
		response: null,
		search: null,
		select: null
	},

	requestIndex: 0,
	pending: 0,

	_create: function() {

		// Some browsers only repeat keydown events, not keypress events,
		// so we use the suppressKeyPress flag to determine if we've already
		// handled the keydown event. #7269
		// Unfortunately the code for & in keypress is the same as the up arrow,
		// so we use the suppressKeyPressRepeat flag to avoid handling keypress
		// events when we know the keydown event was used to modify the
		// search term. #7799
		var suppressKeyPress, suppressKeyPressRepeat, suppressInput,
			nodeName = this.element[ 0 ].nodeName.toLowerCase(),
			isTextarea = nodeName === "textarea",
			isInput = nodeName === "input";

		// Textareas are always multi-line
		// Inputs are always single-line, even if inside a contentEditable element
		// IE also treats inputs as contentEditable
		// All other element types are determined by whether or not they're contentEditable
		this.isMultiLine = isTextarea || !isInput && this._isContentEditable( this.element );

		this.valueMethod = this.element[ isTextarea || isInput ? "val" : "text" ];
		this.isNewMenu = true;

		this._addClass( "ui-autocomplete-input" );
		this.element.attr( "autocomplete", "off" );

		this._on( this.element, {
			keydown: function( event ) {
				if ( this.element.prop( "readOnly" ) ) {
					suppressKeyPress = true;
					suppressInput = true;
					suppressKeyPressRepeat = true;
					return;
				}

				suppressKeyPress = false;
				suppressInput = false;
				suppressKeyPressRepeat = false;
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					suppressKeyPress = true;
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					suppressKeyPress = true;
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					suppressKeyPress = true;
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					suppressKeyPress = true;
					this._keyEvent( "next", event );
					break;
				case keyCode.ENTER:

					// when menu is open and has focus
					if ( this.menu.active ) {

						// #6055 - Opera still allows the keypress to occur
						// which causes forms to submit
						suppressKeyPress = true;
						event.preventDefault();
						this.menu.select( event );
					}
					break;
				case keyCode.TAB:
					if ( this.menu.active ) {
						this.menu.select( event );
					}
					break;
				case keyCode.ESCAPE:
					if ( this.menu.element.is( ":visible" ) ) {
						if ( !this.isMultiLine ) {
							this._value( this.term );
						}
						this.close( event );

						// Different browsers have different default behavior for escape
						// Single press can mean undo or clear
						// Double press in IE means clear the whole form
						event.preventDefault();
					}
					break;
				default:
					suppressKeyPressRepeat = true;

					// search timeout should be triggered before the input value is changed
					this._searchTimeout( event );
					break;
				}
			},
			keypress: function( event ) {
				if ( suppressKeyPress ) {
					suppressKeyPress = false;
					if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
						event.preventDefault();
					}
					return;
				}
				if ( suppressKeyPressRepeat ) {
					return;
				}

				// Replicate some key handlers to allow them to repeat in Firefox and Opera
				var keyCode = $.ui.keyCode;
				switch ( event.keyCode ) {
				case keyCode.PAGE_UP:
					this._move( "previousPage", event );
					break;
				case keyCode.PAGE_DOWN:
					this._move( "nextPage", event );
					break;
				case keyCode.UP:
					this._keyEvent( "previous", event );
					break;
				case keyCode.DOWN:
					this._keyEvent( "next", event );
					break;
				}
			},
			input: function( event ) {
				if ( suppressInput ) {
					suppressInput = false;
					event.preventDefault();
					return;
				}
				this._searchTimeout( event );
			},
			focus: function() {
				this.selectedItem = null;
				this.previous = this._value();
			},
			blur: function( event ) {
				if ( this.cancelBlur ) {
					delete this.cancelBlur;
					return;
				}

				clearTimeout( this.searching );
				this.close( event );
				this._change( event );
			}
		} );

		this._initSource();
		this.menu = $( "<ul>" )
			.appendTo( this._appendTo() )
			.menu( {

				// disable ARIA support, the live region takes care of that
				role: null
			} )
			.hide()
			.menu( "instance" );

		this._addClass( this.menu.element, "ui-autocomplete", "ui-front" );
		this._on( this.menu.element, {
			mousedown: function( event ) {

				// prevent moving focus out of the text field
				event.preventDefault();

				// IE doesn't prevent moving focus even with event.preventDefault()
				// so we set a flag to know when we should ignore the blur event
				this.cancelBlur = true;
				this._delay( function() {
					delete this.cancelBlur;

					// Support: IE 8 only
					// Right clicking a menu item or selecting text from the menu items will
					// result in focus moving out of the input. However, we've already received
					// and ignored the blur event because of the cancelBlur flag set above. So
					// we restore focus to ensure that the menu closes properly based on the user's
					// next actions.
					if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
						this.element.trigger( "focus" );
					}
				} );
			},
			menufocus: function( event, ui ) {
				var label, item;

				// support: Firefox
				// Prevent accidental activation of menu items in Firefox (#7024 #9118)
				if ( this.isNewMenu ) {
					this.isNewMenu = false;
					if ( event.originalEvent && /^mouse/.test( event.originalEvent.type ) ) {
						this.menu.blur();

						this.document.one( "mousemove", function() {
							$( event.target ).trigger( event.originalEvent );
						} );

						return;
					}
				}

				item = ui.item.data( "ui-autocomplete-item" );
				if ( false !== this._trigger( "focus", event, { item: item } ) ) {

					// use value to match what will end up in the input, if it was a key event
					if ( event.originalEvent && /^key/.test( event.originalEvent.type ) ) {
						this._value( item.value );
					}
				}

				// Announce the value in the liveRegion
				label = ui.item.attr( "aria-label" ) || item.value;
				if ( label && $.trim( label ).length ) {
					this.liveRegion.children().hide();
					$( "<div>" ).text( label ).appendTo( this.liveRegion );
				}
			},
			menuselect: function( event, ui ) {
				var item = ui.item.data( "ui-autocomplete-item" ),
					previous = this.previous;

				// Only trigger when focus was lost (click on menu)
				if ( this.element[ 0 ] !== $.ui.safeActiveElement( this.document[ 0 ] ) ) {
					this.element.trigger( "focus" );
					this.previous = previous;

					// #6109 - IE triggers two focus events and the second
					// is asynchronous, so we need to reset the previous
					// term synchronously and asynchronously :-(
					this._delay( function() {
						this.previous = previous;
						this.selectedItem = item;
					} );
				}

				if ( false !== this._trigger( "select", event, { item: item } ) ) {
					this._value( item.value );
				}

				// reset the term after the select event
				// this allows custom select handling to work properly
				this.term = this._value();

				this.close( event );
				this.selectedItem = item;
			}
		} );

		this.liveRegion = $( "<div>", {
			role: "status",
			"aria-live": "assertive",
			"aria-relevant": "additions"
		} )
			.appendTo( this.document[ 0 ].body );

		this._addClass( this.liveRegion, null, "ui-helper-hidden-accessible" );

		// Turning off autocomplete prevents the browser from remembering the
		// value when navigating through history, so we re-enable autocomplete
		// if the page is unloaded before the widget is destroyed. #7790
		this._on( this.window, {
			beforeunload: function() {
				this.element.removeAttr( "autocomplete" );
			}
		} );
	},

	_destroy: function() {
		clearTimeout( this.searching );
		this.element.removeAttr( "autocomplete" );
		this.menu.element.remove();
		this.liveRegion.remove();
	},

	_setOption: function( key, value ) {
		this._super( key, value );
		if ( key === "source" ) {
			this._initSource();
		}
		if ( key === "appendTo" ) {
			this.menu.element.appendTo( this._appendTo() );
		}
		if ( key === "disabled" && value && this.xhr ) {
			this.xhr.abort();
		}
	},

	_isEventTargetInWidget: function( event ) {
		var menuElement = this.menu.element[ 0 ];

		return event.target === this.element[ 0 ] ||
			event.target === menuElement ||
			$.contains( menuElement, event.target );
	},

	_closeOnClickOutside: function( event ) {
		if ( !this._isEventTargetInWidget( event ) ) {
			this.close();
		}
	},

	_appendTo: function() {
		var element = this.options.appendTo;

		if ( element ) {
			element = element.jquery || element.nodeType ?
				$( element ) :
				this.document.find( element ).eq( 0 );
		}

		if ( !element || !element[ 0 ] ) {
			element = this.element.closest( ".ui-front, dialog" );
		}

		if ( !element.length ) {
			element = this.document[ 0 ].body;
		}

		return element;
	},

	_initSource: function() {
		var array, url,
			that = this;
		if ( $.isArray( this.options.source ) ) {
			array = this.options.source;
			this.source = function( request, response ) {
				response( $.ui.autocomplete.filter( array, request.term ) );
			};
		} else if ( typeof this.options.source === "string" ) {
			url = this.options.source;
			this.source = function( request, response ) {
				if ( that.xhr ) {
					that.xhr.abort();
				}
				that.xhr = $.ajax( {
					url: url,
					data: request,
					dataType: "json",
					success: function( data ) {
						response( data );
					},
					error: function() {
						response( [] );
					}
				} );
			};
		} else {
			this.source = this.options.source;
		}
	},

	_searchTimeout: function( event ) {
		clearTimeout( this.searching );
		this.searching = this._delay( function() {

			// Search if the value has changed, or if the user retypes the same value (see #7434)
			var equalValues = this.term === this._value(),
				menuVisible = this.menu.element.is( ":visible" ),
				modifierKey = event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

			if ( !equalValues || ( equalValues && !menuVisible && !modifierKey ) ) {
				this.selectedItem = null;
				this.search( null, event );
			}
		}, this.options.delay );
	},

	search: function( value, event ) {
		value = value != null ? value : this._value();

		// Always save the actual value, not the one passed as an argument
		this.term = this._value();

		if ( value.length < this.options.minLength ) {
			return this.close( event );
		}

		if ( this._trigger( "search", event ) === false ) {
			return;
		}

		return this._search( value );
	},

	_search: function( value ) {
		this.pending++;
		this._addClass( "ui-autocomplete-loading" );
		this.cancelSearch = false;

		this.source( { term: value }, this._response() );
	},

	_response: function() {
		var index = ++this.requestIndex;

		return $.proxy( function( content ) {
			if ( index === this.requestIndex ) {
				this.__response( content );
			}

			this.pending--;
			if ( !this.pending ) {
				this._removeClass( "ui-autocomplete-loading" );
			}
		}, this );
	},

	__response: function( content ) {
		if ( content ) {
			content = this._normalize( content );
		}
		this._trigger( "response", null, { content: content } );
		if ( !this.options.disabled && content && content.length && !this.cancelSearch ) {
			this._suggest( content );
			this._trigger( "open" );
		} else {

			// use ._close() instead of .close() so we don't cancel future searches
			this._close();
		}
	},

	close: function( event ) {
		this.cancelSearch = true;
		this._close( event );
	},

	_close: function( event ) {

		// Remove the handler that closes the menu on outside clicks
		this._off( this.document, "mousedown" );

		if ( this.menu.element.is( ":visible" ) ) {
			this.menu.element.hide();
			this.menu.blur();
			this.isNewMenu = true;
			this._trigger( "close", event );
		}
	},

	_change: function( event ) {
		if ( this.previous !== this._value() ) {
			this._trigger( "change", event, { item: this.selectedItem } );
		}
	},

	_normalize: function( items ) {

		// assume all items have the right format when the first item is complete
		if ( items.length && items[ 0 ].label && items[ 0 ].value ) {
			return items;
		}
		return $.map( items, function( item ) {
			if ( typeof item === "string" ) {
				return {
					label: item,
					value: item
				};
			}
			return $.extend( {}, item, {
				label: item.label || item.value,
				value: item.value || item.label
			} );
		} );
	},

	_suggest: function( items ) {
		var ul = this.menu.element.empty();
		this._renderMenu( ul, items );
		this.isNewMenu = true;
		this.menu.refresh();

		// Size and position menu
		ul.show();
		this._resizeMenu();
		ul.position( $.extend( {
			of: this.element
		}, this.options.position ) );

		if ( this.options.autoFocus ) {
			this.menu.next();
		}

		// Listen for interactions outside of the widget (#6642)
		this._on( this.document, {
			mousedown: "_closeOnClickOutside"
		} );
	},

	_resizeMenu: function() {
		var ul = this.menu.element;
		ul.outerWidth( Math.max(

			// Firefox wraps long text (possibly a rounding bug)
			// so we add 1px to avoid the wrapping (#7513)
			ul.width( "" ).outerWidth() + 1,
			this.element.outerWidth()
		) );
	},

	_renderMenu: function( ul, items ) {
		var that = this;
		$.each( items, function( index, item ) {
			that._renderItemData( ul, item );
		} );
	},

	_renderItemData: function( ul, item ) {
		return this._renderItem( ul, item ).data( "ui-autocomplete-item", item );
	},

	_renderItem: function( ul, item ) {
		return $( "<li>" )
			.append( $( "<div>" ).text( item.label ) )
			.appendTo( ul );
	},

	_move: function( direction, event ) {
		if ( !this.menu.element.is( ":visible" ) ) {
			this.search( null, event );
			return;
		}
		if ( this.menu.isFirstItem() && /^previous/.test( direction ) ||
				this.menu.isLastItem() && /^next/.test( direction ) ) {

			if ( !this.isMultiLine ) {
				this._value( this.term );
			}

			this.menu.blur();
			return;
		}
		this.menu[ direction ]( event );
	},

	widget: function() {
		return this.menu.element;
	},

	_value: function() {
		return this.valueMethod.apply( this.element, arguments );
	},

	_keyEvent: function( keyEvent, event ) {
		if ( !this.isMultiLine || this.menu.element.is( ":visible" ) ) {
			this._move( keyEvent, event );

			// Prevents moving cursor to beginning/end of the text field in some browsers
			event.preventDefault();
		}
	},

	// Support: Chrome <=50
	// We should be able to just use this.element.prop( "isContentEditable" )
	// but hidden elements always report false in Chrome.
	// https://code.google.com/p/chromium/issues/detail?id=313082
	_isContentEditable: function( element ) {
		if ( !element.length ) {
			return false;
		}

		var editable = element.prop( "contentEditable" );

		if ( editable === "inherit" ) {
		  return this._isContentEditable( element.parent() );
		}

		return editable === "true";
	}
} );

$.extend( $.ui.autocomplete, {
	escapeRegex: function( value ) {
		return value.replace( /[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&" );
	},
	filter: function( array, term ) {
		var matcher = new RegExp( $.ui.autocomplete.escapeRegex( term ), "i" );
		return $.grep( array, function( value ) {
			return matcher.test( value.label || value.value || value );
		} );
	}
} );

// Live region extension, adding a `messages` option
// NOTE: This is an experimental API. We are still investigating
// a full solution for string manipulation and internationalization.
$.widget( "ui.autocomplete", $.ui.autocomplete, {
	options: {
		messages: {
			noResults: "No search results.",
			results: function( amount ) {
				return amount + ( amount > 1 ? " results are" : " result is" ) +
					" available, use up and down arrow keys to navigate.";
			}
		}
	},

	__response: function( content ) {
		var message;
		this._superApply( arguments );
		if ( this.options.disabled || this.cancelSearch ) {
			return;
		}
		if ( content && content.length ) {
			message = this.options.messages.results( content.length );
		} else {
			message = this.options.messages.noResults;
		}
		this.liveRegion.children().hide();
		$( "<div>" ).text( message ).appendTo( this.liveRegion );
	}
} );

return $.ui.autocomplete;

} ) );
/*!
 * JavaScript Cookie v2.2.0
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!this.json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
(function menusInit() {
	function positionDropdowns(i, e) {
		if (typeof e === "undefined") {
			var $menu = $(this)
		} else {
			var $menu = $(e)
		}
	
		var $dropdown = $menu.children('.dropdown');
		var $pointer = $dropdown.children('.pointer')
	
		$dropdown.position({
			my: 'center',
			at: 'center',
			of: $menu,
			collision: 'fit',
			within: 'body',
			using: function(position) {
				$dropdown.css('left', position.left - 10)
			}
		})
	
		$pointer.position({
			my: 'center',
			at: 'center-6',
			of: $menu,
			collision: 'fit',
			within: $dropdown,
			using: function(position) {
				$pointer.css('left', position.left)
			}
		})
	}
	function closeMenus() {
		closeAllDropdowns();
		animateSideMenuOut($sideMenu)
	}
	function closeAllDropdowns() {
		$('.dropdown').each(function(i, dropdown) {
			animateDropdownOut($(dropdown))
		})
	}
	function animateDropdownIn(dropdown) {
		if (!dropdown.hasClass('open')) dropdown.addClass('open');
	}
	function animateDropdownOut(dropdown) {
		if (dropdown.hasClass('open')) dropdown.removeClass('open');
	}
	function animateSideMenuIn(sideMenu) {
		$('body').addClass('side-menu-open');
		TweenMax.to($sideMenuWrapper, .15, {
			css:{transform:"translateX(0)"},
			ease: Power2.easeIn,
			onComplete: function() {
				$sideMenu.addClass('open');
			}
		});
	}
	function animateSideMenuOut(sideMenu) {
		$('body').removeClass('side-menu-open');
		TweenMax.to($sideMenuWrapper, .15, {
			css:{transform:"translateX(100%)"},
			ease: Power2.easeOut,
			onComplete: function() {
				$sideMenu.removeClass('open');
			}
		});
	}
	function hoverDropdowns(e) {
		var currentDropdown = $(this).children('.dropdown');
		var currentlyHovering;

		// continuously set `currentlyHovering` to true when the mouse is moving over the dropdown
		currentDropdown.mousemove(function(e) {
			currentlyHovering = true;
		});

		if (e.type === 'mouseenter') {
			closeMenus();
			animateDropdownIn(currentDropdown);
		} else if (e.type === 'mouseleave') {
			currentlyHovering = false;

			// set a timer for 250ms
			setTimeout(function() {
				// if currentlyHovering hasn't been set to true in that time, animate the dropdown out
				if (!currentlyHovering) animateDropdownOut(currentDropdown);
			}, 250);
		}
	}
	function enterKeyDropdowns(e) {
		var currentDropdown = $(this).children('.dropdown');
		
		if (e.keyCode === 13 && currentDropdown.hasClass('open')) {
			animateDropdownOut(currentDropdown)
		} else if (e.keyCode === 13) {
			closeMenus()
			animateDropdownIn(currentDropdown)
		}
	}
	function clickSideMenu(e) {
		e.stopPropagation();
		
		if ($sideMenu.hasClass('open')) {
			animateSideMenuOut($sideMenu)
		} else {
			closeMenus();
			animateSideMenuIn($sideMenu)
		}
	}
	function clickOffMenus(e) {
		if ( $(e.target).parents('.side-menu').length === 0
			&& $(e.target).parents('.has-dropdown').length === 0 )
			{ closeMenus() }
	}
	function escapeKeyOffMenus(e) {
		if (e.keyCode === 27) { closeMenus() }
	}
	// use this function if you need to do something on window resize
	// runs once after the timeout
	function windowResizeTimeout(callback, timeout) {
		var timeoutID = false;
	
		window.addEventListener('resize', function() {
			clearTimeout(timeoutID);
			timeoutID = setTimeout(callback, timeout);
		});
	}
	// use this function if you need to do something on scrolling events
	function scrollInterval(callback, interval) {
		var userScrolling = false;
	
		window.addEventListener('scroll', function () { userScrolling = true })
		setInterval(function () {
			if (userScrolling) { callback() }
			userScrolling = false;
		}, interval);
	}
	
	var $menusWithDropdowns = $('.has-dropdown');
	var $sideMenu = $('.side-menu');
	var $sideMenuWrapper = $('.side-menu-wrapper');
	var $sideMenuButton = $('.side-menu-button');
	
	// open/close dropdown menus with hover and Enter/Return key (if focused)
	$menusWithDropdowns.hover(hoverDropdowns)
	$menusWithDropdowns.keyup(enterKeyDropdowns);
	
	// open/close side menu with click
	$sideMenuButton.click(clickSideMenu);
	
	// close side menu if user scrolls down more than 350 px
	scrollInterval(function() {
		if (window.pageYOffset > 350) { animateSideMenuOut($sideMenu) }
	}, 250);
	
	// close menus if there's a click anywhere outside the menus
	$(document).click(clickOffMenus);
	
	// close menus with escape
	$(document).keyup(escapeKeyOffMenus);
	
	// position dropdowns
	$menusWithDropdowns.each(positionDropdowns); // on page load
	$menusWithDropdowns.hover(positionDropdowns, null) // on hover
	windowResizeTimeout(function() { // on window resize, after 250 ms
		return $menusWithDropdowns.each(positionDropdowns);
	}, 100);
	
	// scroll to the accordion that was clicked
	var $sideNavHeader = $('.side-menu-heading');
	$sideNavHeader.click(function(e) {
	
		// on small screens, scroll to the term clicked
		if( $(window).width() < 800 ){
			$heightOfContent = $('.ui-accordion-content-active').height();
	
			$('html, body').animate({
				scrollTop: ( $(e.target).offset().top - $heightOfContent - 30 )
			}, 200);
		}
		
	});
	
	// remove preload class from elements that have it
	// .preload class on dropdowns just adds `transition: none !important;` to dropdowns to prevent flicker
	var preloads = Array.from(document.querySelectorAll('.dropdown.preload'));
	preloads.forEach(function(el){ el.classList.remove('preload') });	

	var cartCount = Cookies.get('cart_count');
	var cartButton = document.querySelector('.cart-button');

	if (typeof(cartCount) != 'undefined' && cartCount > 0) {
		cartButton.setAttribute('data-cart-count', cartCount);
	}

	if (window.location.pathname.indexOf('nextgen') !== -1) {
		$('#user-menu').load('/user-menu?nextgen=true', {}, function() {
			$(this).removeClass('content-loading');
		});
	}
	else {
		$('#user-menu').load('/user-menu', {}, function() {
			$(this).removeClass('content-loading');
		});
	}
})();
//=================================================================================
//COOKIES
//  This routine sets a cookie on the visitor's machine.
// 
//  * name is the name of the cookie
//  * value is the information contained by name
//  * expires sets the number of days of when you want the cookie to expire. 
//    Leave blank to have cookie expire when browser is closed
//  * path specifies which folder on your Web site can access this cookie
//  * domain specifies which servers on your domain can access this cookie
//  * secure specifies whether a secure connection is needed to access this cookie
function setCookie(name,value,expires,path,domain,secure)
{	if (expires)
	{	var exp = new Date()
		exp.setTime(exp.getTime() + (expires * 60 * 60 * 24 * 1000))
		expires = exp.toGMTString()
	}
	
	document.cookie = name + "=" + escape(value) + 
	((expires) ? "; expires=" + expires : "") +
	((path) ? "; path=" + path : "") +
	((domain) ? "; domain=" + domain : "") +
	((secure) ? "; secure" : "")
}

//  This routine retrieves a cookie's value
//
//  * if the returned value is "null", then the cookie has not been set or has been cleared
function getCookie(name)
{	var cookie = " " + document.cookie
	var search = " " + name + "="
	var setStr = null
	var offset = 0
	var end = 0
	
	if (cookie.length > 0)
	{	offset = cookie.indexOf(search)
		if (offset != -1)
		{	offset += search.length;
			end = cookie.indexOf(";", offset)
			if (end == -1)
			{	end = cookie.length;
			}
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	
	//if the first try is null, try again, but this time with UPPERCASE for coldfusion
	if (setStr == null) {
		var cookie = " " + document.cookie
		var search = " " + name.toUpperCase() + "="
		var setStr = null
		var offset = 0
		var end = 0
		
		if (cookie.length > 0)
		{	offset = cookie.indexOf(search)
			if (offset != -1)
			{	offset += search.length;
				end = cookie.indexOf(";", offset)
				if (end == -1)
				{	end = cookie.length;
				}
				setStr = unescape(cookie.substring(offset, end));
			}
		}
	}
	
	return(setStr);
}


// This routine clears the value of a cookie
function clearCookie(variable)
{	setCookie(variable,"","Thu, 01-Jan-1970 00:00:00 GMT")
};
/*!
 * fancyBox - jQuery Plugin
 * version: 2.1.5 (Fri, 14 Jun 2013)
 * @requires jQuery v1.6 or later
 *
 * Examples at http://fancyapps.com/fancybox/
 * License: www.fancyapps.com/fancybox/#license
 *
 * Copyright 2012 Janis Skarnelis - janis@fancyapps.com
 *
 */

(function (window, document, $, undefined) {
	"use strict";

	var H = $("html"),
		W = $(window),
		D = $(document),
		F = $.fancybox = function () {
			F.open.apply( this, arguments );
		},
		IE =  navigator.userAgent.match(/msie/i),
		didUpdate	= null,
		isTouch		= document.createTouch !== undefined,

		isQuery	= function(obj) {
			return obj && obj.hasOwnProperty && obj instanceof $;
		},
		isString = function(str) {
			return str && $.type(str) === "string";
		},
		isPercentage = function(str) {
			return isString(str) && str.indexOf('%') > 0;
		},
		isScrollable = function(el) {
			return (el && !(el.style.overflow && el.style.overflow === 'hidden') && ((el.clientWidth && el.scrollWidth > el.clientWidth) || (el.clientHeight && el.scrollHeight > el.clientHeight)));
		},
		getScalar = function(orig, dim) {
			var value = parseInt(orig, 10) || 0;

			if (dim && isPercentage(orig)) {
				value = F.getViewport()[ dim ] / 100 * value;
			}

			return Math.ceil(value);
		},
		getValue = function(value, dim) {
			return getScalar(value, dim) + 'px';
		};

	$.extend(F, {
		// The current version of fancyBox
		version: '2.1.5',

		defaults: {
			padding : 15,
			margin  : 20,

			width     : 800,
			height    : 600,
			minWidth  : 100,
			minHeight : 100,
			maxWidth  : 9999,
			maxHeight : 9999,
			pixelRatio: 1, // Set to 2 for retina display support

			autoSize   : true,
			autoHeight : false,
			autoWidth  : false,

			autoResize  : true,
			autoCenter  : !isTouch,
			fitToView   : true,
			aspectRatio : false,
			topRatio    : 0.5,
			leftRatio   : 0.5,

			scrolling : 'auto', // 'auto', 'yes' or 'no'
			wrapCSS   : '',

			arrows     : true,
			closeBtn   : true,
			closeClick : false,
			nextClick  : false,
			mouseWheel : true,
			autoPlay   : false,
			playSpeed  : 3000,
			preload    : 3,
			modal      : false,
			loop       : true,

			ajax  : {
				dataType : 'html',
				headers  : { 'X-fancyBox': true }
			},
			iframe : {
				scrolling : 'auto',
				preload   : true
			},
			swf : {
				wmode: 'transparent',
				allowfullscreen   : 'true',
				allowscriptaccess : 'always'
			},

			keys  : {
				next : {
					13 : 'left', // enter
					34 : 'up',   // page down
					39 : 'left', // right arrow
					40 : 'up'    // down arrow
				},
				prev : {
					8  : 'right',  // backspace
					33 : 'down',   // page up
					37 : 'right',  // left arrow
					38 : 'down'    // up arrow
				},
				close  : [27], // escape key
				play   : [32], // space - start/stop slideshow
				toggle : [70]  // letter "f" - toggle fullscreen
			},

			direction : {
				next : 'left',
				prev : 'right'
			},

			scrollOutside  : true,

			// Override some properties
			index   : 0,
			type    : null,
			href    : null,
			content : null,
			title   : null,

			// HTML templates
			tpl: {
				wrap     : '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
				image    : '<img class="fancybox-image" src="{href}" alt="" />',
				iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IE ? ' allowtransparency="true"' : '') + '></iframe>',
				error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
				closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
				next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
				prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
			},

			// Properties for each animation type
			// Opening fancyBox
			openEffect  : 'fade', // 'elastic', 'fade' or 'none'
			openSpeed   : 250,
			openEasing  : 'swing',
			openOpacity : true,
			openMethod  : 'zoomIn',

			// Closing fancyBox
			closeEffect  : 'fade', // 'elastic', 'fade' or 'none'
			closeSpeed   : 250,
			closeEasing  : 'swing',
			closeOpacity : true,
			closeMethod  : 'zoomOut',

			// Changing next gallery item
			nextEffect : 'elastic', // 'elastic', 'fade' or 'none'
			nextSpeed  : 250,
			nextEasing : 'swing',
			nextMethod : 'changeIn',

			// Changing previous gallery item
			prevEffect : 'elastic', // 'elastic', 'fade' or 'none'
			prevSpeed  : 250,
			prevEasing : 'swing',
			prevMethod : 'changeOut',

			// Enable default helpers
			helpers : {
				overlay : true,
				title   : true
			},

			// Callbacks
			onCancel     : $.noop, // If canceling
			beforeLoad   : $.noop, // Before loading
			afterLoad    : $.noop, // After loading
			beforeShow   : $.noop, // Before changing in current item
			afterShow    : $.noop, // After opening
			beforeChange : $.noop, // Before changing gallery item
			beforeClose  : $.noop, // Before closing
			afterClose   : $.noop  // After closing
		},

		//Current state
		group    : {}, // Selected group
		opts     : {}, // Group options
		previous : null,  // Previous element
		coming   : null,  // Element being loaded
		current  : null,  // Currently loaded element
		isActive : false, // Is activated
		isOpen   : false, // Is currently open
		isOpened : false, // Have been fully opened at least once

		wrap  : null,
		skin  : null,
		outer : null,
		inner : null,

		player : {
			timer    : null,
			isActive : false
		},

		// Loaders
		ajaxLoad   : null,
		imgPreload : null,

		// Some collections
		transitions : {},
		helpers     : {},

		/*
		 *	Static methods
		 */

		open: function (group, opts) {
			if (!group) {
				return;
			}

			if (!$.isPlainObject(opts)) {
				opts = {};
			}

			// Close if already active
			if (false === F.close(true)) {
				return;
			}

			// Normalize group
			if (!$.isArray(group)) {
				group = isQuery(group) ? $(group).get() : [group];
			}

			// Recheck if the type of each element is `object` and set content type (image, ajax, etc)
			$.each(group, function(i, element) {
				var obj = {},
					href,
					title,
					content,
					type,
					rez,
					hrefParts,
					selector;

				if ($.type(element) === "object") {
					// Check if is DOM element
					if (element.nodeType) {
						element = $(element);
					}

					if (isQuery(element)) {
						obj = {
							href    : element.data('fancybox-href') || element.attr('href'),
							title   : element.data('fancybox-title') || element.attr('title'),
							isDom   : true,
							element : element
						};

						if ($.metadata) {
							$.extend(true, obj, element.metadata());
						}

					} else {
						obj = element;
					}
				}

				href  = opts.href  || obj.href || (isString(element) ? element : null);
				title = opts.title !== undefined ? opts.title : obj.title || '';

				content = opts.content || obj.content;
				type    = content ? 'html' : (opts.type  || obj.type);

				if (!type && obj.isDom) {
					type = element.data('fancybox-type');

					if (!type) {
						rez  = element.prop('class').match(/fancybox\.(\w+)/);
						type = rez ? rez[1] : null;
					}
				}

				if (isString(href)) {
					// Try to guess the content type
					if (!type) {
						if (F.isImage(href)) {
							type = 'image';

						} else if (F.isSWF(href)) {
							type = 'swf';

						} else if (href.charAt(0) === '#') {
							type = 'inline';

						} else if (isString(element)) {
							type    = 'html';
							content = element;
						}
					}

					// Split url into two pieces with source url and content selector, e.g,
					// "/mypage.html #my_id" will load "/mypage.html" and display element having id "my_id"
					if (type === 'ajax') {
						hrefParts = href.split(/\s+/, 2);
						href      = hrefParts.shift();
						selector  = hrefParts.shift();
					}
				}

				if (!content) {
					if (type === 'inline') {
						if (href) {
							content = $( isString(href) ? href.replace(/.*(?=#[^\s]+$)/, '') : href ); //strip for ie7

						} else if (obj.isDom) {
							content = element;
						}

					} else if (type === 'html') {
						content = href;

					} else if (!type && !href && obj.isDom) {
						type    = 'inline';
						content = element;
					}
				}

				$.extend(obj, {
					href     : href,
					type     : type,
					content  : content,
					title    : title,
					selector : selector
				});

				group[ i ] = obj;
			});

			// Extend the defaults
			F.opts = $.extend(true, {}, F.defaults, opts);

			// All options are merged recursive except keys
			if (opts.keys !== undefined) {
				F.opts.keys = opts.keys ? $.extend({}, F.defaults.keys, opts.keys) : false;
			}

			F.group = group;

			return F._start(F.opts.index);
		},

		// Cancel image loading or abort ajax request
		cancel: function () {
			var coming = F.coming;

			if (!coming || false === F.trigger('onCancel')) {
				return;
			}

			F.hideLoading();

			if (F.ajaxLoad) {
				F.ajaxLoad.abort();
			}

			F.ajaxLoad = null;

			if (F.imgPreload) {
				F.imgPreload.onload = F.imgPreload.onerror = null;
			}

			if (coming.wrap) {
				coming.wrap.stop(true, true).trigger('onReset').remove();
			}

			F.coming = null;

			// If the first item has been canceled, then clear everything
			if (!F.current) {
				F._afterZoomOut( coming );
			}
		},

		// Start closing animation if is open; remove immediately if opening/closing
		close: function (event) {
			F.cancel();

			if (false === F.trigger('beforeClose')) {
				return;
			}

			F.unbindEvents();

			if (!F.isActive) {
				return;
			}

			if (!F.isOpen || event === true) {
				$('.fancybox-wrap').stop(true).trigger('onReset').remove();

				F._afterZoomOut();

			} else {
				F.isOpen = F.isOpened = false;
				F.isClosing = true;

				$('.fancybox-item, .fancybox-nav').remove();

				F.wrap.stop(true, true).removeClass('fancybox-opened');

				F.transitions[ F.current.closeMethod ]();
			}
		},

		// Manage slideshow:
		//   $.fancybox.play(); - toggle slideshow
		//   $.fancybox.play( true ); - start
		//   $.fancybox.play( false ); - stop
		play: function ( action ) {
			var clear = function () {
					clearTimeout(F.player.timer);
				},
				set = function () {
					clear();

					if (F.current && F.player.isActive) {
						F.player.timer = setTimeout(F.next, F.current.playSpeed);
					}
				},
				stop = function () {
					clear();

					D.unbind('.player');

					F.player.isActive = false;

					F.trigger('onPlayEnd');
				},
				start = function () {
					if (F.current && (F.current.loop || F.current.index < F.group.length - 1)) {
						F.player.isActive = true;

						D.bind({
							'onCancel.player beforeClose.player' : stop,
							'onUpdate.player'   : set,
							'beforeLoad.player' : clear
						});

						set();

						F.trigger('onPlayStart');
					}
				};

			if (action === true || (!F.player.isActive && action !== false)) {
				start();
			} else {
				stop();
			}
		},

		// Navigate to next gallery item
		next: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.next;
				}

				F.jumpto(current.index + 1, direction, 'next');
			}
		},

		// Navigate to previous gallery item
		prev: function ( direction ) {
			var current = F.current;

			if (current) {
				if (!isString(direction)) {
					direction = current.direction.prev;
				}

				F.jumpto(current.index - 1, direction, 'prev');
			}
		},

		// Navigate to gallery item by index
		jumpto: function ( index, direction, router ) {
			var current = F.current;

			if (!current) {
				return;
			}

			index = getScalar(index);

			F.direction = direction || current.direction[ (index >= current.index ? 'next' : 'prev') ];
			F.router    = router || 'jumpto';

			if (current.loop) {
				if (index < 0) {
					index = current.group.length + (index % current.group.length);
				}

				index = index % current.group.length;
			}

			if (current.group[ index ] !== undefined) {
				F.cancel();

				F._start(index);
			}
		},

		// Center inside viewport and toggle position type to fixed or absolute if needed
		reposition: function (e, onlyAbsolute) {
			var current = F.current,
				wrap    = current ? current.wrap : null,
				pos;

			if (wrap) {
				pos = F._getPosition(onlyAbsolute);

				if (e && e.type === 'scroll') {
					delete pos.position;

					wrap.stop(true, true).animate(pos, 200);

				} else {
					wrap.css(pos);

					current.pos = $.extend({}, current.dim, pos);
				}
			}
		},

		update: function (e) {
			var type = (e && e.type),
				anyway = !type || type === 'orientationchange';

			if (anyway) {
				clearTimeout(didUpdate);

				didUpdate = null;
			}

			if (!F.isOpen || didUpdate) {
				return;
			}

			didUpdate = setTimeout(function() {
				var current = F.current;

				if (!current || F.isClosing) {
					return;
				}

				F.wrap.removeClass('fancybox-tmp');

				if (anyway || type === 'load' || (type === 'resize' && current.autoResize)) {
					F._setDimension();
				}

				if (!(type === 'scroll' && current.canShrink)) {
					F.reposition(e);
				}

				F.trigger('onUpdate');

				didUpdate = null;

			}, (anyway && !isTouch ? 0 : 300));
		},

		// Shrink content to fit inside viewport or restore if resized
		toggle: function ( action ) {
			if (F.isOpen) {
				F.current.fitToView = $.type(action) === "boolean" ? action : !F.current.fitToView;

				// Help browser to restore document dimensions
				if (isTouch) {
					F.wrap.removeAttr('style').addClass('fancybox-tmp');

					F.trigger('onUpdate');
				}

				F.update();
			}
		},

		hideLoading: function () {
			D.unbind('.loading');

			$('#fancybox-loading').remove();
		},

		showLoading: function () {
			var el, viewport;

			F.hideLoading();

			el = $('<div id="fancybox-loading"><div></div></div>').click(F.cancel).appendTo('body');

			// If user will press the escape-button, the request will be canceled
			D.bind('keydown.loading', function(e) {
				if ((e.which || e.keyCode) === 27) {
					e.preventDefault();

					F.cancel();
				}
			});

			if (!F.defaults.fixed) {
				viewport = F.getViewport();

				el.css({
					position : 'absolute',
					top  : (viewport.h * 0.5) + viewport.y,
					left : (viewport.w * 0.5) + viewport.x
				});
			}
		},

		getViewport: function () {
			var locked = (F.current && F.current.locked) || false,
				rez    = {
					x: W.scrollLeft(),
					y: W.scrollTop()
				};

			if (locked) {
				rez.w = locked[0].clientWidth;
				rez.h = locked[0].clientHeight;

			} else {
				// See http://bugs.jquery.com/ticket/6724
				rez.w = isTouch && window.innerWidth  ? window.innerWidth  : W.width();
				rez.h = isTouch && window.innerHeight ? window.innerHeight : W.height();
			}

			return rez;
		},

		// Unbind the keyboard / clicking actions
		unbindEvents: function () {
			if (F.wrap && isQuery(F.wrap)) {
				F.wrap.unbind('.fb');
			}

			D.unbind('.fb');
			W.unbind('.fb');
		},

		bindEvents: function () {
			var current = F.current,
				keys;

			if (!current) {
				return;
			}

			// Changing document height on iOS devices triggers a 'resize' event,
			// that can change document height... repeating infinitely
			W.bind('orientationchange.fb' + (isTouch ? '' : ' resize.fb') + (current.autoCenter && !current.locked ? ' scroll.fb' : ''), F.update);

			keys = current.keys;

			if (keys) {
				D.bind('keydown.fb', function (e) {
					var code   = e.which || e.keyCode,
						target = e.target || e.srcElement;

					// Skip esc key if loading, because showLoading will cancel preloading
					if (code === 27 && F.coming) {
						return false;
					}

					// Ignore key combinations and key events within form elements
					if (!e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey && !(target && (target.type || $(target).is('[contenteditable]')))) {
						$.each(keys, function(i, val) {
							if (current.group.length > 1 && val[ code ] !== undefined) {
								F[ i ]( val[ code ] );

								e.preventDefault();
								return false;
							}

							if ($.inArray(code, val) > -1) {
								F[ i ] ();

								e.preventDefault();
								return false;
							}
						});
					}
				});
			}

			if ($.fn.mousewheel && current.mouseWheel) {
				F.wrap.bind('mousewheel.fb', function (e, delta, deltaX, deltaY) {
					var target = e.target || null,
						parent = $(target),
						canScroll = false;

					while (parent.length) {
						if (canScroll || parent.is('.fancybox-skin') || parent.is('.fancybox-wrap')) {
							break;
						}

						canScroll = isScrollable( parent[0] );
						parent    = $(parent).parent();
					}

					if (delta !== 0 && !canScroll) {
						if (F.group.length > 1 && !current.canShrink) {
							if (deltaY > 0 || deltaX > 0) {
								F.prev( deltaY > 0 ? 'down' : 'left' );

							} else if (deltaY < 0 || deltaX < 0) {
								F.next( deltaY < 0 ? 'up' : 'right' );
							}

							e.preventDefault();
						}
					}
				});
			}
		},

		trigger: function (event, o) {
			var ret, obj = o || F.coming || F.current;

			if (!obj) {
				return;
			}

			if ($.isFunction( obj[event] )) {
				ret = obj[event].apply(obj, Array.prototype.slice.call(arguments, 1));
			}

			if (ret === false) {
				return false;
			}

			if (obj.helpers) {
				$.each(obj.helpers, function (helper, opts) {
					if (opts && F.helpers[helper] && $.isFunction(F.helpers[helper][event])) {
						F.helpers[helper][event]($.extend(true, {}, F.helpers[helper].defaults, opts), obj);
					}
				});
			}

			D.trigger(event);
		},

		isImage: function (str) {
			return isString(str) && str.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i);
		},

		isSWF: function (str) {
			return isString(str) && str.match(/\.(swf)((\?|#).*)?$/i);
		},

		_start: function (index) {
			var coming = {},
				obj,
				href,
				type,
				margin,
				padding;

			index = getScalar( index );
			obj   = F.group[ index ] || null;

			if (!obj) {
				return false;
			}

			coming = $.extend(true, {}, F.opts, obj);

			// Convert margin and padding properties to array - top, right, bottom, left
			margin  = coming.margin;
			padding = coming.padding;

			if ($.type(margin) === 'number') {
				coming.margin = [margin, margin, margin, margin];
			}

			if ($.type(padding) === 'number') {
				coming.padding = [padding, padding, padding, padding];
			}

			// 'modal' propery is just a shortcut
			if (coming.modal) {
				$.extend(true, coming, {
					closeBtn   : false,
					closeClick : false,
					nextClick  : false,
					arrows     : false,
					mouseWheel : false,
					keys       : null,
					helpers: {
						overlay : {
							closeClick : false
						}
					}
				});
			}

			// 'autoSize' property is a shortcut, too
			if (coming.autoSize) {
				coming.autoWidth = coming.autoHeight = true;
			}

			if (coming.width === 'auto') {
				coming.autoWidth = true;
			}

			if (coming.height === 'auto') {
				coming.autoHeight = true;
			}

			/*
			 * Add reference to the group, so it`s possible to access from callbacks, example:
			 * afterLoad : function() {
			 *     this.title = 'Image ' + (this.index + 1) + ' of ' + this.group.length + (this.title ? ' - ' + this.title : '');
			 * }
			 */

			coming.group  = F.group;
			coming.index  = index;

			// Give a chance for callback or helpers to update coming item (type, title, etc)
			F.coming = coming;

			if (false === F.trigger('beforeLoad')) {
				F.coming = null;

				return;
			}

			type = coming.type;
			href = coming.href;

			if (!type) {
				F.coming = null;

				//If we can not determine content type then drop silently or display next/prev item if looping through gallery
				if (F.current && F.router && F.router !== 'jumpto') {
					F.current.index = index;

					return F[ F.router ]( F.direction );
				}

				return false;
			}

			F.isActive = true;

			if (type === 'image' || type === 'swf') {
				coming.autoHeight = coming.autoWidth = false;
				coming.scrolling  = 'visible';
			}

			if (type === 'image') {
				coming.aspectRatio = true;
			}

			if (type === 'iframe' && isTouch) {
				coming.scrolling = 'scroll';
			}

			// Build the neccessary markup
			coming.wrap = $(coming.tpl.wrap).addClass('fancybox-' + (isTouch ? 'mobile' : 'desktop') + ' fancybox-type-' + type + ' fancybox-tmp ' + coming.wrapCSS).appendTo( coming.parent || 'body' );

			$.extend(coming, {
				skin  : $('.fancybox-skin',  coming.wrap),
				outer : $('.fancybox-outer', coming.wrap),
				inner : $('.fancybox-inner', coming.wrap)
			});

			$.each(["Top", "Right", "Bottom", "Left"], function(i, v) {
				coming.skin.css('padding' + v, getValue(coming.padding[ i ]));
			});

			F.trigger('onReady');

			// Check before try to load; 'inline' and 'html' types need content, others - href
			if (type === 'inline' || type === 'html') {
				if (!coming.content || !coming.content.length) {
					return F._error( 'content' );
				}

			} else if (!href) {
				return F._error( 'href' );
			}

			if (type === 'image') {
				F._loadImage();

			} else if (type === 'ajax') {
				F._loadAjax();

			} else if (type === 'iframe') {
				F._loadIframe();

			} else {
				F._afterLoad();
			}
		},

		_error: function ( type ) {
			$.extend(F.coming, {
				type       : 'html',
				autoWidth  : true,
				autoHeight : true,
				minWidth   : 0,
				minHeight  : 0,
				scrolling  : 'no',
				hasError   : type,
				content    : F.coming.tpl.error
			});

			F._afterLoad();
		},

		_loadImage: function () {
			// Reset preload image so it is later possible to check "complete" property
			var img = F.imgPreload = new Image();

			img.onload = function () {
				this.onload = this.onerror = null;

				F.coming.width  = this.width / F.opts.pixelRatio;
				F.coming.height = this.height / F.opts.pixelRatio;

				F._afterLoad();
			};

			img.onerror = function () {
				this.onload = this.onerror = null;

				F._error( 'image' );
			};

			img.src = F.coming.href;

			if (img.complete !== true) {
				F.showLoading();
			}
		},

		_loadAjax: function () {
			var coming = F.coming;

			F.showLoading();

			F.ajaxLoad = $.ajax($.extend({}, coming.ajax, {
				url: coming.href,
				error: function (jqXHR, textStatus) {
					if (F.coming && textStatus !== 'abort') {
						F._error( 'ajax', jqXHR );

					} else {
						F.hideLoading();
					}
				},
				success: function (data, textStatus) {
					if (textStatus === 'success') {
						coming.content = data;

						F._afterLoad();
					}
				}
			}));
		},

		_loadIframe: function() {
			var coming = F.coming,
				iframe = $(coming.tpl.iframe.replace(/\{rnd\}/g, new Date().getTime()))
					.attr('scrolling', isTouch ? 'auto' : coming.iframe.scrolling)
					.attr('src', coming.href);

			// This helps IE
			$(coming.wrap).bind('onReset', function () {
				try {
					$(this).find('iframe').hide().attr('src', '//about:blank').end().empty();
				} catch (e) {}
			});

			if (coming.iframe.preload) {
				F.showLoading();

				iframe.one('load', function() {
					$(this).data('ready', 1);

					// iOS will lose scrolling if we resize
					if (!isTouch) {
						$(this).bind('load.fb', F.update);
					}

					// Without this trick:
					//   - iframe won't scroll on iOS devices
					//   - IE7 sometimes displays empty iframe
					$(this).parents('.fancybox-wrap').width('100%').removeClass('fancybox-tmp').show();

					F._afterLoad();
				});
			}

			coming.content = iframe.appendTo( coming.inner );

			if (!coming.iframe.preload) {
				F._afterLoad();
			}
		},

		_preloadImages: function() {
			var group   = F.group,
				current = F.current,
				len     = group.length,
				cnt     = current.preload ? Math.min(current.preload, len - 1) : 0,
				item,
				i;

			for (i = 1; i <= cnt; i += 1) {
				item = group[ (current.index + i ) % len ];

				if (item.type === 'image' && item.href) {
					new Image().src = item.href;
				}
			}
		},

		_afterLoad: function () {
			var coming   = F.coming,
				previous = F.current,
				placeholder = 'fancybox-placeholder',
				current,
				content,
				type,
				scrolling,
				href,
				embed;

			F.hideLoading();

			if (!coming || F.isActive === false) {
				return;
			}

			if (false === F.trigger('afterLoad', coming, previous)) {
				coming.wrap.stop(true).trigger('onReset').remove();

				F.coming = null;

				return;
			}

			if (previous) {
				F.trigger('beforeChange', previous);

				previous.wrap.stop(true).removeClass('fancybox-opened')
					.find('.fancybox-item, .fancybox-nav')
					.remove();
			}

			F.unbindEvents();

			current   = coming;
			content   = coming.content;
			type      = coming.type;
			scrolling = coming.scrolling;

			$.extend(F, {
				wrap  : current.wrap,
				skin  : current.skin,
				outer : current.outer,
				inner : current.inner,
				current  : current,
				previous : previous
			});

			href = current.href;

			switch (type) {
				case 'inline':
				case 'ajax':
				case 'html':
					if (current.selector) {
						content = $('<div>').html(content).find(current.selector);

					} else if (isQuery(content)) {
						if (!content.data(placeholder)) {
							content.data(placeholder, $('<div class="' + placeholder + '"></div>').insertAfter( content ).hide() );
						}

						content = content.show().detach();

						current.wrap.bind('onReset', function () {
							if ($(this).find(content).length) {
								content.hide().replaceAll( content.data(placeholder) ).data(placeholder, false);
							}
						});
					}
				break;

				case 'image':
					content = current.tpl.image.replace('{href}', href);
				break;

				case 'swf':
					content = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + href + '"></param>';
					embed   = '';

					$.each(current.swf, function(name, val) {
						content += '<param name="' + name + '" value="' + val + '"></param>';
						embed   += ' ' + name + '="' + val + '"';
					});

					content += '<embed src="' + href + '" type="application/x-shockwave-flash" width="100%" height="100%"' + embed + '></embed></object>';
				break;
			}

			if (!(isQuery(content) && content.parent().is(current.inner))) {
				current.inner.append( content );
			}

			// Give a chance for helpers or callbacks to update elements
			F.trigger('beforeShow');

			// Set scrolling before calculating dimensions
			current.inner.css('overflow', scrolling === 'yes' ? 'scroll' : (scrolling === 'no' ? 'hidden' : scrolling));

			// Set initial dimensions and start position
			F._setDimension();

			F.reposition();

			F.isOpen = false;
			F.coming = null;

			F.bindEvents();

			if (!F.isOpened) {
				$('.fancybox-wrap').not( current.wrap ).stop(true).trigger('onReset').remove();

			} else if (previous.prevMethod) {
				F.transitions[ previous.prevMethod ]();
			}

			F.transitions[ F.isOpened ? current.nextMethod : current.openMethod ]();

			F._preloadImages();
		},

		_setDimension: function () {
			var viewport   = F.getViewport(),
				steps      = 0,
				canShrink  = false,
				canExpand  = false,
				wrap       = F.wrap,
				skin       = F.skin,
				inner      = F.inner,
				current    = F.current,
				width      = current.width,
				height     = current.height,
				minWidth   = current.minWidth,
				minHeight  = current.minHeight,
				maxWidth   = current.maxWidth,
				maxHeight  = current.maxHeight,
				scrolling  = current.scrolling,
				scrollOut  = current.scrollOutside ? current.scrollbarWidth : 0,
				margin     = current.margin,
				wMargin    = getScalar(margin[1] + margin[3]),
				hMargin    = getScalar(margin[0] + margin[2]),
				wPadding,
				hPadding,
				wSpace,
				hSpace,
				origWidth,
				origHeight,
				origMaxWidth,
				origMaxHeight,
				ratio,
				width_,
				height_,
				maxWidth_,
				maxHeight_,
				iframe,
				body;

			// Reset dimensions so we could re-check actual size
			wrap.add(skin).add(inner).width('auto').height('auto').removeClass('fancybox-tmp');

			wPadding = getScalar(skin.outerWidth(true)  - skin.width());
			hPadding = getScalar(skin.outerHeight(true) - skin.height());

			// Any space between content and viewport (margin, padding, border, title)
			wSpace = wMargin + wPadding;
			hSpace = hMargin + hPadding;

			origWidth  = isPercentage(width)  ? (viewport.w - wSpace) * getScalar(width)  / 100 : width;
			origHeight = isPercentage(height) ? (viewport.h - hSpace) * getScalar(height) / 100 : height;

			if (current.type === 'iframe') {
				iframe = current.content;

				if (current.autoHeight && iframe.data('ready') === 1) {
					try {
						if (iframe[0].contentWindow.document.location) {
							inner.width( origWidth ).height(9999);

							body = iframe.contents().find('body');

							if (scrollOut) {
								body.css('overflow-x', 'hidden');
							}

							origHeight = body.outerHeight(true);
						}

					} catch (e) {}
				}

			} else if (current.autoWidth || current.autoHeight) {
				inner.addClass( 'fancybox-tmp' );

				// Set width or height in case we need to calculate only one dimension
				if (!current.autoWidth) {
					inner.width( origWidth );
				}

				if (!current.autoHeight) {
					inner.height( origHeight );
				}

				if (current.autoWidth) {
					origWidth = inner.width();
				}

				if (current.autoHeight) {
					origHeight = inner.height();
				}

				inner.removeClass( 'fancybox-tmp' );
			}

			width  = getScalar( origWidth );
			height = getScalar( origHeight );

			ratio  = origWidth / origHeight;

			// Calculations for the content
			minWidth  = getScalar(isPercentage(minWidth) ? getScalar(minWidth, 'w') - wSpace : minWidth);
			maxWidth  = getScalar(isPercentage(maxWidth) ? getScalar(maxWidth, 'w') - wSpace : maxWidth);

			minHeight = getScalar(isPercentage(minHeight) ? getScalar(minHeight, 'h') - hSpace : minHeight);
			maxHeight = getScalar(isPercentage(maxHeight) ? getScalar(maxHeight, 'h') - hSpace : maxHeight);

			// These will be used to determine if wrap can fit in the viewport
			origMaxWidth  = maxWidth;
			origMaxHeight = maxHeight;

			if (current.fitToView) {
				maxWidth  = Math.min(viewport.w - wSpace, maxWidth);
				maxHeight = Math.min(viewport.h - hSpace, maxHeight);
			}

			maxWidth_  = viewport.w - wMargin;
			maxHeight_ = viewport.h - hMargin;

			if (current.aspectRatio) {
				if (width > maxWidth) {
					width  = maxWidth;
					height = getScalar(width / ratio);
				}

				if (height > maxHeight) {
					height = maxHeight;
					width  = getScalar(height * ratio);
				}

				if (width < minWidth) {
					width  = minWidth;
					height = getScalar(width / ratio);
				}

				if (height < minHeight) {
					height = minHeight;
					width  = getScalar(height * ratio);
				}

			} else {
				width = Math.max(minWidth, Math.min(width, maxWidth));

				if (current.autoHeight && current.type !== 'iframe') {
					inner.width( width );

					height = inner.height();
				}

				height = Math.max(minHeight, Math.min(height, maxHeight));
			}

			// Try to fit inside viewport (including the title)
			if (current.fitToView) {
				inner.width( width ).height( height );

				wrap.width( width + wPadding );

				// Real wrap dimensions
				width_  = wrap.width();
				height_ = wrap.height();

				if (current.aspectRatio) {
					while ((width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight) {
						if (steps++ > 19) {
							break;
						}

						height = Math.max(minHeight, Math.min(maxHeight, height - 10));
						width  = getScalar(height * ratio);

						if (width < minWidth) {
							width  = minWidth;
							height = getScalar(width / ratio);
						}

						if (width > maxWidth) {
							width  = maxWidth;
							height = getScalar(width / ratio);
						}

						inner.width( width ).height( height );

						wrap.width( width + wPadding );

						width_  = wrap.width();
						height_ = wrap.height();
					}

				} else {
					width  = Math.max(minWidth,  Math.min(width,  width  - (width_  - maxWidth_)));
					height = Math.max(minHeight, Math.min(height, height - (height_ - maxHeight_)));
				}
			}

			if (scrollOut && scrolling === 'auto' && height < origHeight && (width + wPadding + scrollOut) < maxWidth_) {
				width += scrollOut;
			}

			inner.width( width ).height( height );

			wrap.width( width + wPadding );

			width_  = wrap.width();
			height_ = wrap.height();

			canShrink = (width_ > maxWidth_ || height_ > maxHeight_) && width > minWidth && height > minHeight;
			canExpand = current.aspectRatio ? (width < origMaxWidth && height < origMaxHeight && width < origWidth && height < origHeight) : ((width < origMaxWidth || height < origMaxHeight) && (width < origWidth || height < origHeight));

			$.extend(current, {
				dim : {
					width	: getValue( width_ ),
					height	: getValue( height_ )
				},
				origWidth  : origWidth,
				origHeight : origHeight,
				canShrink  : canShrink,
				canExpand  : canExpand,
				wPadding   : wPadding,
				hPadding   : hPadding,
				wrapSpace  : height_ - skin.outerHeight(true),
				skinSpace  : skin.height() - height
			});

			if (!iframe && current.autoHeight && height > minHeight && height < maxHeight && !canExpand) {
				inner.height('auto');
			}
		},

		_getPosition: function (onlyAbsolute) {
			var current  = F.current,
				viewport = F.getViewport(),
				margin   = current.margin,
				width    = F.wrap.width()  + margin[1] + margin[3],
				height   = F.wrap.height() + margin[0] + margin[2],
				rez      = {
					position: 'absolute',
					top  : margin[0],
					left : margin[3]
				};

			if (current.autoCenter && current.fixed && !onlyAbsolute && height <= viewport.h && width <= viewport.w) {
				rez.position = 'fixed';

			} else if (!current.locked) {
				rez.top  += viewport.y;
				rez.left += viewport.x;
			}

			rez.top  = getValue(Math.max(rez.top,  rez.top  + ((viewport.h - height) * current.topRatio)));
			rez.left = getValue(Math.max(rez.left, rez.left + ((viewport.w - width)  * current.leftRatio)));

			return rez;
		},

		_afterZoomIn: function () {
			var current = F.current;

			if (!current) {
				return;
			}

			F.isOpen = F.isOpened = true;

			F.wrap.css('overflow', 'visible').addClass('fancybox-opened');

			F.update();

			// Assign a click event
			if ( current.closeClick || (current.nextClick && F.group.length > 1) ) {
				F.inner.css('cursor', 'pointer').bind('click.fb', function(e) {
					if (!$(e.target).is('a') && !$(e.target).parent().is('a')) {
						e.preventDefault();

						F[ current.closeClick ? 'close' : 'next' ]();
					}
				});
			}

			// Create a close button
			if (current.closeBtn) {
				$(current.tpl.closeBtn).appendTo(F.skin).bind('click.fb', function(e) {
					e.preventDefault();

					F.close();
				});
			}

			// Create navigation arrows
			if (current.arrows && F.group.length > 1) {
				if (current.loop || current.index > 0) {
					$(current.tpl.prev).appendTo(F.outer).bind('click.fb', F.prev);
				}

				if (current.loop || current.index < F.group.length - 1) {
					$(current.tpl.next).appendTo(F.outer).bind('click.fb', F.next);
				}
			}

			F.trigger('afterShow');

			// Stop the slideshow if this is the last item
			if (!current.loop && current.index === current.group.length - 1) {
				F.play( false );

			} else if (F.opts.autoPlay && !F.player.isActive) {
				F.opts.autoPlay = false;

				F.play();
			}
		},

		_afterZoomOut: function ( obj ) {
			obj = obj || F.current;

			$('.fancybox-wrap').trigger('onReset').remove();

			$.extend(F, {
				group  : {},
				opts   : {},
				router : false,
				current   : null,
				isActive  : false,
				isOpened  : false,
				isOpen    : false,
				isClosing : false,
				wrap   : null,
				skin   : null,
				outer  : null,
				inner  : null
			});

			F.trigger('afterClose', obj);
		}
	});

	/*
	 *	Default transitions
	 */

	F.transitions = {
		getOrigPosition: function () {
			var current  = F.current,
				element  = current.element,
				orig     = current.orig,
				pos      = {},
				width    = 50,
				height   = 50,
				hPadding = current.hPadding,
				wPadding = current.wPadding,
				viewport = F.getViewport();

			if (!orig && current.isDom && element.is(':visible')) {
				orig = element.find('img:first');

				if (!orig.length) {
					orig = element;
				}
			}

			if (isQuery(orig)) {
				pos = orig.offset();

				if (orig.is('img')) {
					width  = orig.outerWidth();
					height = orig.outerHeight();
				}

			} else {
				pos.top  = viewport.y + (viewport.h - height) * current.topRatio;
				pos.left = viewport.x + (viewport.w - width)  * current.leftRatio;
			}

			if (F.wrap.css('position') === 'fixed' || current.locked) {
				pos.top  -= viewport.y;
				pos.left -= viewport.x;
			}

			pos = {
				top     : getValue(pos.top  - hPadding * current.topRatio),
				left    : getValue(pos.left - wPadding * current.leftRatio),
				width   : getValue(width  + wPadding),
				height  : getValue(height + hPadding)
			};

			return pos;
		},

		step: function (now, fx) {
			var ratio,
				padding,
				value,
				prop       = fx.prop,
				current    = F.current,
				wrapSpace  = current.wrapSpace,
				skinSpace  = current.skinSpace;

			if (prop === 'width' || prop === 'height') {
				ratio = fx.end === fx.start ? 1 : (now - fx.start) / (fx.end - fx.start);

				if (F.isClosing) {
					ratio = 1 - ratio;
				}

				padding = prop === 'width' ? current.wPadding : current.hPadding;
				value   = now - padding;

				F.skin[ prop ](  getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) ) );
				F.inner[ prop ]( getScalar( prop === 'width' ?  value : value - (wrapSpace * ratio) - (skinSpace * ratio) ) );
			}
		},

		zoomIn: function () {
			var current  = F.current,
				startPos = current.pos,
				effect   = current.openEffect,
				elastic  = effect === 'elastic',
				endPos   = $.extend({opacity : 1}, startPos);

			// Remove "position" property that breaks older IE
			delete endPos.position;

			if (elastic) {
				startPos = this.getOrigPosition();

				if (current.openOpacity) {
					startPos.opacity = 0.1;
				}

			} else if (effect === 'fade') {
				startPos.opacity = 0.1;
			}

			F.wrap.css(startPos).animate(endPos, {
				duration : effect === 'none' ? 0 : current.openSpeed,
				easing   : current.openEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomIn
			});
		},

		zoomOut: function () {
			var current  = F.current,
				effect   = current.closeEffect,
				elastic  = effect === 'elastic',
				endPos   = {opacity : 0.1};

			if (elastic) {
				endPos = this.getOrigPosition();

				if (current.closeOpacity) {
					endPos.opacity = 0.1;
				}
			}

			F.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : current.closeSpeed,
				easing   : current.closeEasing,
				step     : elastic ? this.step : null,
				complete : F._afterZoomOut
			});
		},

		changeIn: function () {
			var current   = F.current,
				effect    = current.nextEffect,
				startPos  = current.pos,
				endPos    = { opacity : 1 },
				direction = F.direction,
				distance  = 200,
				field;

			startPos.opacity = 0.1;

			if (effect === 'elastic') {
				field = direction === 'down' || direction === 'up' ? 'top' : 'left';

				if (direction === 'down' || direction === 'right') {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) - distance);
					endPos[ field ]   = '+=' + distance + 'px';

				} else {
					startPos[ field ] = getValue(getScalar(startPos[ field ]) + distance);
					endPos[ field ]   = '-=' + distance + 'px';
				}
			}

			// Workaround for http://bugs.jquery.com/ticket/12273
			if (effect === 'none') {
				F._afterZoomIn();

			} else {
				F.wrap.css(startPos).animate(endPos, {
					duration : current.nextSpeed,
					easing   : current.nextEasing,
					complete : F._afterZoomIn
				});
			}
		},

		changeOut: function () {
			var previous  = F.previous,
				effect    = previous.prevEffect,
				endPos    = { opacity : 0.1 },
				direction = F.direction,
				distance  = 200;

			if (effect === 'elastic') {
				endPos[ direction === 'down' || direction === 'up' ? 'top' : 'left' ] = ( direction === 'up' || direction === 'left' ? '-' : '+' ) + '=' + distance + 'px';
			}

			previous.wrap.animate(endPos, {
				duration : effect === 'none' ? 0 : previous.prevSpeed,
				easing   : previous.prevEasing,
				complete : function () {
					$(this).trigger('onReset').remove();
				}
			});
		}
	};

	/*
	 *	Overlay helper
	 */

	F.helpers.overlay = {
		defaults : {
			closeClick : true,      // if true, fancyBox will be closed when user clicks on the overlay
			speedOut   : 200,       // duration of fadeOut animation
			showEarly  : true,      // indicates if should be opened immediately or wait until the content is ready
			css        : {},        // custom CSS properties
			locked     : !isTouch,  // if true, the content will be locked into overlay
			fixed      : true       // if false, the overlay CSS position property will not be set to "fixed"
		},

		overlay : null,      // current handle
		fixed   : false,     // indicates if the overlay has position "fixed"
		el      : $('html'), // element that contains "the lock"

		// Public methods
		create : function(opts) {
			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.close();
			}

			this.overlay = $('<div class="fancybox-overlay"></div>').appendTo( F.coming ? F.coming.parent : opts.parent );
			this.fixed   = false;

			if (opts.fixed && F.defaults.fixed) {
				this.overlay.addClass('fancybox-overlay-fixed');

				this.fixed = true;
			}
		},

		open : function(opts) {
			var that = this;

			opts = $.extend({}, this.defaults, opts);

			if (this.overlay) {
				this.overlay.unbind('.overlay').width('auto').height('auto');

			} else {
				this.create(opts);
			}

			if (!this.fixed) {
				W.bind('resize.overlay', $.proxy( this.update, this) );

				this.update();
			}

			if (opts.closeClick) {
				this.overlay.bind('click.overlay', function(e) {
					if ($(e.target).hasClass('fancybox-overlay')) {
						if (F.isActive) {
							F.close();
						} else {
							that.close();
						}

						return false;
					}
				});
			}

			this.overlay.css( opts.css ).show();
		},

		close : function() {
			var scrollV, scrollH;

			W.unbind('resize.overlay');

			if (this.el.hasClass('fancybox-lock')) {
				$('.fancybox-margin').removeClass('fancybox-margin');

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.removeClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			$('.fancybox-overlay').remove().hide();

			$.extend(this, {
				overlay : null,
				fixed   : false
			});
		},

		// Private, callbacks

		update : function () {
			var width = '100%', offsetWidth;

			// Reset width/height so it will not mess
			this.overlay.width(width).height('100%');

			// jQuery does not return reliable result for IE
			if (IE) {
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);

				if (D.width() > offsetWidth) {
					width = D.width();
				}

			} else if (D.width() > W.width()) {
				width = D.width();
			}

			this.overlay.width(width).height(D.height());
		},

		// This is where we can manipulate DOM, because later it would cause iframes to reload
		onReady : function (opts, obj) {
			var overlay = this.overlay;

			$('.fancybox-overlay').stop(true, true);

			if (!overlay) {
				this.create(opts);
			}

			if (opts.locked && this.fixed && obj.fixed) {
				if (!overlay) {
					this.margin = D.height() > W.height() ? $('html').css('margin-right').replace("px", "") : false;
				}

				obj.locked = this.overlay.append( obj.wrap );
				obj.fixed  = false;
			}

			if (opts.showEarly === true) {
				this.beforeShow.apply(this, arguments);
			}
		},

		beforeShow : function(opts, obj) {
			var scrollV, scrollH;

			if (obj.locked) {
				if (this.margin !== false) {
					$('*').filter(function(){
						return ($(this).css('position') === 'fixed' && !$(this).hasClass("fancybox-overlay") && !$(this).hasClass("fancybox-wrap") );
					}).addClass('fancybox-margin');

					this.el.addClass('fancybox-margin');
				}

				scrollV = W.scrollTop();
				scrollH = W.scrollLeft();

				this.el.addClass('fancybox-lock');

				W.scrollTop( scrollV ).scrollLeft( scrollH );
			}

			this.open(opts);
		},

		onUpdate : function() {
			if (!this.fixed) {
				this.update();
			}
		},

		afterClose: function (opts) {
			// Remove overlay if exists and fancyBox is not opening
			// (e.g., it is not being open using afterClose callback)
			//if (this.overlay && !F.isActive) {
			if (this.overlay && !F.coming) {
				this.overlay.fadeOut(opts.speedOut, $.proxy( this.close, this ));
			}
		}
	};

	/*
	 *	Title helper
	 */

	F.helpers.title = {
		defaults : {
			type     : 'float', // 'float', 'inside', 'outside' or 'over',
			position : 'bottom' // 'top' or 'bottom'
		},

		beforeShow: function (opts) {
			var current = F.current,
				text    = current.title,
				type    = opts.type,
				title,
				target;

			if ($.isFunction(text)) {
				text = text.call(current.element, current);
			}

			if (!isString(text) || $.trim(text) === '') {
				return;
			}

			title = $('<div class="fancybox-title fancybox-title-' + type + '-wrap">' + text + '</div>');

			switch (type) {
				case 'inside':
					target = F.skin;
				break;

				case 'outside':
					target = F.wrap;
				break;

				case 'over':
					target = F.inner;
				break;

				default: // 'float'
					target = F.skin;

					title.appendTo('body');

					if (IE) {
						title.width( title.width() );
					}

					title.wrapInner('<span class="child"></span>');

					//Increase bottom margin so this title will also fit into viewport
					F.current.margin[2] += Math.abs( getScalar(title.css('margin-bottom')) );
				break;
			}

			title[ (opts.position === 'top' ? 'prependTo'  : 'appendTo') ](target);
		}
	};

	// jQuery plugin initialization
	$.fn.fancybox = function (options) {
		var index,
			that     = $(this),
			selector = this.selector || '',
			run      = function(e) {
				var what = $(this).blur(), idx = index, relType, relVal;

				if (!(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) && !what.is('.fancybox-wrap')) {
					relType = options.groupAttr || 'data-fancybox-group';
					relVal  = what.attr(relType);

					if (!relVal) {
						relType = 'rel';
						relVal  = what.get(0)[ relType ];
					}

					if (relVal && relVal !== '' && relVal !== 'nofollow') {
						what = selector.length ? $(selector) : that;
						what = what.filter('[' + relType + '="' + relVal + '"]');
						idx  = what.index(this);
					}

					options.index = idx;

					// Stop an event from bubbling if everything is fine
					if (F.open(what, options) !== false) {
						e.preventDefault();
					}
				}
			};

		options = options || {};
		index   = options.index || 0;

		if (!selector || options.live === false) {
			that.unbind('click.fb-start').bind('click.fb-start', run);

		} else {
			D.undelegate(selector, 'click.fb-start').delegate(selector + ":not('.fancybox-item, .fancybox-nav')", 'click.fb-start', run);
		}

		this.filter('[data-fancybox-start=1]').trigger('click');

		return this;
	};

	// Tests that need a body at doc ready
	D.ready(function() {
		var w1, w2;

		if ( $.scrollbarWidth === undefined ) {
			// http://benalman.com/projects/jquery-misc-plugins/#scrollbarwidth
			$.scrollbarWidth = function() {
				var parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body'),
					child  = parent.children(),
					width  = child.innerWidth() - child.height( 99 ).innerWidth();

				parent.remove();

				return width;
			};
		}

		if ( $.support.fixedPosition === undefined ) {
			$.support.fixedPosition = (function() {
				var elem  = $('<div style="position:fixed;top:20px;"></div>').appendTo('body'),
					fixed = ( elem[0].offsetTop === 20 || elem[0].offsetTop === 15 );

				elem.remove();

				return fixed;
			}());
		}

		$.extend(F.defaults, {
			scrollbarWidth : $.scrollbarWidth(),
			fixed  : $.support.fixedPosition,
			parent : $('body')
		});

		//Get real width of page scroll-bar
		w1 = $(window).width();

		H.addClass('fancybox-lock-test');

		w2 = $(window).width();

		H.removeClass('fancybox-lock-test');

		$("<style type='text/css'>.fancybox-margin{margin-right:" + (w2 - w1) + "px;}</style>").appendTo("head");
	});

}(window, document, jQuery));
 /*!
 * Buttons helper for fancyBox
 * version: 1.0.5 (Mon, 15 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             buttons: {
 *                 position : 'top'
 *             }
 *         }
 *     });
 *
 */
(function ($) {
	//Shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.buttons = {
		defaults : {
			skipSingle : false, // disables if gallery contains single image
			position   : 'top', // 'top' or 'bottom'
			tpl        : '<div id="fancybox-buttons"><ul><li><a class="btnPrev" title="Previous" href="javascript:;"></a></li><li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li><li><a class="btnNext" title="Next" href="javascript:;"></a></li><li><a class="btnToggle" title="Toggle size" href="javascript:;"></a></li><li><a class="btnClose" title="Close" href="javascript:;"></a></li></ul></div>'
		},

		list : null,
		buttons: null,

		beforeLoad: function (opts, obj) {
			//Remove self if gallery do not have at least two items

			if (opts.skipSingle && obj.group.length < 2) {
				obj.helpers.buttons = false;
				obj.closeBtn = true;

				return;
			}

			//Increase top margin to give space for buttons
			obj.margin[ opts.position === 'bottom' ? 2 : 0 ] += 30;
		},

		onPlayStart: function () {
			if (this.buttons) {
				this.buttons.play.attr('title', 'Pause slideshow').addClass('btnPlayOn');
			}
		},

		onPlayEnd: function () {
			if (this.buttons) {
				this.buttons.play.attr('title', 'Start slideshow').removeClass('btnPlayOn');
			}
		},

		afterShow: function (opts, obj) {
			var buttons = this.buttons;

			if (!buttons) {
				this.list = $(opts.tpl).addClass(opts.position).appendTo('body');

				buttons = {
					prev   : this.list.find('.btnPrev').click( F.prev ),
					next   : this.list.find('.btnNext').click( F.next ),
					play   : this.list.find('.btnPlay').click( F.play ),
					toggle : this.list.find('.btnToggle').click( F.toggle ),
					close  : this.list.find('.btnClose').click( F.close )
				}
			}

			//Prev
			if (obj.index > 0 || obj.loop) {
				buttons.prev.removeClass('btnDisabled');
			} else {
				buttons.prev.addClass('btnDisabled');
			}

			//Next / Play
			if (obj.loop || obj.index < obj.group.length - 1) {
				buttons.next.removeClass('btnDisabled');
				buttons.play.removeClass('btnDisabled');

			} else {
				buttons.next.addClass('btnDisabled');
				buttons.play.addClass('btnDisabled');
			}

			this.buttons = buttons;

			this.onUpdate(opts, obj);
		},

		onUpdate: function (opts, obj) {
			var toggle;

			if (!this.buttons) {
				return;
			}

			toggle = this.buttons.toggle.removeClass('btnDisabled btnToggleOn');

			//Size toggle button
			if (obj.canShrink) {
				toggle.addClass('btnToggleOn');

			} else if (!obj.canExpand) {
				toggle.addClass('btnDisabled');
			}
		},

		beforeClose: function () {
			if (this.list) {
				this.list.remove();
			}

			this.list    = null;
			this.buttons = null;
		}
	};

}(jQuery));
 /*!
 * Thumbnail helper for fancyBox
 * version: 1.0.7 (Mon, 01 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             thumbs: {
 *                 width  : 50,
 *                 height : 50
 *             }
 *         }
 *     });
 *
 */
(function ($) {
	//Shortcut for fancyBox object
	var F = $.fancybox;

	//Add helper object
	F.helpers.thumbs = {
		defaults : {
			width    : 50,       // thumbnail width
			height   : 50,       // thumbnail height
			position : 'bottom', // 'top' or 'bottom'
			source   : function ( item ) {  // function to obtain the URL of the thumbnail image
				var href;

				if (item.element) {
					href = $(item.element).find('img').attr('src');
				}

				if (!href && item.type === 'image' && item.href) {
					href = item.href;
				}

				return href;
			}
		},

		wrap  : null,
		list  : null,
		width : 0,

		init: function (opts, obj) {
			var that = this,
				list,
				thumbWidth  = opts.width,
				thumbHeight = opts.height,
				thumbSource = opts.source;

			//Build list structure
			list = '';

			for (var n = 0; n < obj.group.length; n++) {
				list += '<li><a style="width:' + thumbWidth + 'px;height:' + thumbHeight + 'px;" href="javascript:jQuery.fancybox.jumpto(' + n + ');"></a></li>';
			}

			this.wrap = $('<div id="fancybox-thumbs"></div>').addClass(opts.position).appendTo('body');
			this.list = $('<ul>' + list + '</ul>').appendTo(this.wrap);

			//Load each thumbnail
			$.each(obj.group, function (i) {
				var href = thumbSource( obj.group[ i ] );

				if (!href) {
					return;
				}

				$("<img />").load(function () {
					var width  = this.width,
						height = this.height,
						widthRatio, heightRatio, parent;

					if (!that.list || !width || !height) {
						return;
					}

					//Calculate thumbnail width/height and center it
					widthRatio  = width / thumbWidth;
					heightRatio = height / thumbHeight;

					parent = that.list.children().eq(i).find('a');

					if (widthRatio >= 1 && heightRatio >= 1) {
						if (widthRatio > heightRatio) {
							width  = Math.floor(width / heightRatio);
							height = thumbHeight;

						} else {
							width  = thumbWidth;
							height = Math.floor(height / widthRatio);
						}
					}

					$(this).css({
						width  : width,
						height : height,
						top    : Math.floor(thumbHeight / 2 - height / 2),
						left   : Math.floor(thumbWidth / 2 - width / 2)
					});

					parent.width(thumbWidth).height(thumbHeight);

					$(this).hide().appendTo(parent).fadeIn(300);

				}).attr('src', href);
			});

			//Set initial width
			this.width = this.list.children().eq(0).outerWidth(true);

			this.list.width(this.width * (obj.group.length + 1)).css('left', Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5)));
		},

		beforeLoad: function (opts, obj) {
			//Remove self if gallery do not have at least two items
			if (obj.group.length < 2) {
				obj.helpers.thumbs = false;

				return;
			}

			//Increase bottom margin to give space for thumbs
			obj.margin[ opts.position === 'top' ? 0 : 2 ] += ((opts.height) + 15);
		},

		afterShow: function (opts, obj) {
			//Check if exists and create or update list
			if (this.list) {
				this.onUpdate(opts, obj);

			} else {
				this.init(opts, obj);
			}

			//Set active element
			this.list.children().removeClass('active').eq(obj.index).addClass('active');
		},

		//Center list
		onUpdate: function (opts, obj) {
			if (this.list) {
				this.list.stop(true).animate({
					'left': Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5))
				}, 150);
			}
		},

		beforeClose: function () {
			if (this.wrap) {
				this.wrap.remove();
			}

			this.wrap  = null;
			this.list  = null;
			this.width = 0;
		}
	}

}(jQuery));
/*!
 * Media helper for fancyBox
 * version: 1.0.6 (Fri, 14 Jun 2013)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: true
 *         }
 *     });
 *
 * Set custom URL parameters:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: {
 *                 youtube : {
 *                     params : {
 *                         autoplay : 0
 *                     }
 *                 }
 *             }
 *         }
 *     });
 *
 * Or:
 *     $(".fancybox").fancybox({,
 *         helpers : {
 *             media: true
 *         },
 *         youtube : {
 *             autoplay: 0
 *         }
 *     });
 *
 *  Supports:
 *
 *      Youtube
 *          http://www.youtube.com/watch?v=opj24KnzrWo
 *          http://www.youtube.com/embed/opj24KnzrWo
 *          http://youtu.be/opj24KnzrWo
 *			http://www.youtube-nocookie.com/embed/opj24KnzrWo
 *      Vimeo
 *          http://vimeo.com/40648169
 *          http://vimeo.com/channels/staffpicks/38843628
 *          http://vimeo.com/groups/surrealism/videos/36516384
 *          http://player.vimeo.com/video/45074303
 *      Metacafe
 *          http://www.metacafe.com/watch/7635964/dr_seuss_the_lorax_movie_trailer/
 *          http://www.metacafe.com/watch/7635964/
 *      Dailymotion
 *          http://www.dailymotion.com/video/xoytqh_dr-seuss-the-lorax-premiere_people
 *      Twitvid
 *          http://twitvid.com/QY7MD
 *      Twitpic
 *          http://twitpic.com/7p93st
 *      Instagram
 *          http://instagr.am/p/IejkuUGxQn/
 *          http://instagram.com/p/IejkuUGxQn/
 *      Google maps
 *          http://maps.google.com/maps?q=Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France&t=h&z=17
 *          http://maps.google.com/?ll=48.857995,2.294297&spn=0.007666,0.021136&t=m&z=16
 *          http://maps.google.com/?ll=48.859463,2.292626&spn=0.000965,0.002642&t=m&z=19&layer=c&cbll=48.859524,2.292532&panoid=YJ0lq28OOy3VT2IqIuVY0g&cbp=12,151.58,,0,-15.56
 */
(function ($) {
	"use strict";

	//Shortcut for fancyBox object
	var F = $.fancybox,
		format = function( url, rez, params ) {
			params = params || '';

			if ( $.type( params ) === "object" ) {
				params = $.param(params, true);
			}

			$.each(rez, function(key, value) {
				url = url.replace( '$' + key, value || '' );
			});

			if (params.length) {
				url += ( url.indexOf('?') > 0 ? '&' : '?' ) + params;
			}

			return url;
		};

	//Add helper object
	F.helpers.media = {
		defaults : {
			youtube : {
				matcher : /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
				params  : {
					autoplay    : 1,
					autohide    : 1,
					fs          : 1,
					rel         : 0,
					hd          : 1,
					wmode       : 'opaque',
					enablejsapi : 1
				},
				type : 'iframe',
				url  : '//www.youtube.com/embed/$3'
			},
			vimeo : {
				matcher : /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
				params  : {
					autoplay      : 1,
					hd            : 1,
					show_title    : 1,
					show_byline   : 1,
					show_portrait : 0,
					fullscreen    : 1
				},
				type : 'iframe',
				url  : '//player.vimeo.com/video/$1'
			},
			metacafe : {
				matcher : /metacafe.com\/(?:watch|fplayer)\/([\w\-]{1,10})/,
				params  : {
					autoPlay : 'yes'
				},
				type : 'swf',
				url  : function( rez, params, obj ) {
					obj.swf.flashVars = 'playerVars=' + $.param( params, true );

					return '//www.metacafe.com/fplayer/' + rez[1] + '/.swf';
				}
			},
			dailymotion : {
				matcher : /dailymotion.com\/video\/(.*)\/?(.*)/,
				params  : {
					additionalInfos : 0,
					autoStart : 1
				},
				type : 'swf',
				url  : '//www.dailymotion.com/swf/video/$1'
			},
			twitvid : {
				matcher : /twitvid\.com\/([a-zA-Z0-9_\-\?\=]+)/i,
				params  : {
					autoplay : 0
				},
				type : 'iframe',
				url  : '//www.twitvid.com/embed.php?guid=$1'
			},
			twitpic : {
				matcher : /twitpic\.com\/(?!(?:place|photos|events)\/)([a-zA-Z0-9\?\=\-]+)/i,
				type : 'image',
				url  : '//twitpic.com/show/full/$1/'
			},
			instagram : {
				matcher : /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
				type : 'image',
				url  : '//$1/p/$2/media/?size=l'
			},
			google_maps : {
				matcher : /maps\.google\.([a-z]{2,3}(\.[a-z]{2})?)\/(\?ll=|maps\?)(.*)/i,
				type : 'iframe',
				url  : function( rez ) {
					return '//maps.google.' + rez[1] + '/' + rez[3] + '' + rez[4] + '&output=' + (rez[4].indexOf('layer=c') > 0 ? 'svembed' : 'embed');
				}
			}
		},

		beforeLoad : function(opts, obj) {
			var url   = obj.href || '',
				type  = false,
				what,
				item,
				rez,
				params;

			for (what in opts) {
				if (opts.hasOwnProperty(what)) {
					item = opts[ what ];
					rez  = url.match( item.matcher );

					if (rez) {
						type   = item.type;
						params = $.extend(true, {}, item.params, obj[ what ] || ($.isPlainObject(opts[ what ]) ? opts[ what ].params : null));

						url = $.type( item.url ) === "function" ? item.url.call( this, rez, params, obj ) : format( item.url, rez, params );

						break;
					}
				}
			}

			if (type) {
				obj.href = url;
				obj.type = type;

				obj.autoHeight = false;
			}
		}
	};

}(jQuery));



/*! jQuery Validation Plugin - v1.17.0 - 7/29/2017
 * https://jqueryvalidation.org/
 * Copyright (c) 2017 Jörn Zaefferer; Licensed MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){a.extend(a.fn,{validate:function(b){if(!this.length)return void(b&&b.debug&&window.console&&console.warn("Nothing selected, can't validate, returning nothing."));var c=a.data(this[0],"validator");return c?c:(this.attr("novalidate","novalidate"),c=new a.validator(b,this[0]),a.data(this[0],"validator",c),c.settings.onsubmit&&(this.on("click.validate",":submit",function(b){c.submitButton=b.currentTarget,a(this).hasClass("cancel")&&(c.cancelSubmit=!0),void 0!==a(this).attr("formnovalidate")&&(c.cancelSubmit=!0)}),this.on("submit.validate",function(b){function d(){var d,e;return c.submitButton&&(c.settings.submitHandler||c.formSubmitted)&&(d=a("<input type='hidden'/>").attr("name",c.submitButton.name).val(a(c.submitButton).val()).appendTo(c.currentForm)),!c.settings.submitHandler||(e=c.settings.submitHandler.call(c,c.currentForm,b),d&&d.remove(),void 0!==e&&e)}return c.settings.debug&&b.preventDefault(),c.cancelSubmit?(c.cancelSubmit=!1,d()):c.form()?c.pendingRequest?(c.formSubmitted=!0,!1):d():(c.focusInvalid(),!1)})),c)},valid:function(){var b,c,d;return a(this[0]).is("form")?b=this.validate().form():(d=[],b=!0,c=a(this[0].form).validate(),this.each(function(){b=c.element(this)&&b,b||(d=d.concat(c.errorList))}),c.errorList=d),b},rules:function(b,c){var d,e,f,g,h,i,j=this[0];if(null!=j&&(!j.form&&j.hasAttribute("contenteditable")&&(j.form=this.closest("form")[0],j.name=this.attr("name")),null!=j.form)){if(b)switch(d=a.data(j.form,"validator").settings,e=d.rules,f=a.validator.staticRules(j),b){case"add":a.extend(f,a.validator.normalizeRule(c)),delete f.messages,e[j.name]=f,c.messages&&(d.messages[j.name]=a.extend(d.messages[j.name],c.messages));break;case"remove":return c?(i={},a.each(c.split(/\s/),function(a,b){i[b]=f[b],delete f[b]}),i):(delete e[j.name],f)}return g=a.validator.normalizeRules(a.extend({},a.validator.classRules(j),a.validator.attributeRules(j),a.validator.dataRules(j),a.validator.staticRules(j)),j),g.required&&(h=g.required,delete g.required,g=a.extend({required:h},g)),g.remote&&(h=g.remote,delete g.remote,g=a.extend(g,{remote:h})),g}}}),a.extend(a.expr.pseudos||a.expr[":"],{blank:function(b){return!a.trim(""+a(b).val())},filled:function(b){var c=a(b).val();return null!==c&&!!a.trim(""+c)},unchecked:function(b){return!a(b).prop("checked")}}),a.validator=function(b,c){this.settings=a.extend(!0,{},a.validator.defaults,b),this.currentForm=c,this.init()},a.validator.format=function(b,c){return 1===arguments.length?function(){var c=a.makeArray(arguments);return c.unshift(b),a.validator.format.apply(this,c)}:void 0===c?b:(arguments.length>2&&c.constructor!==Array&&(c=a.makeArray(arguments).slice(1)),c.constructor!==Array&&(c=[c]),a.each(c,function(a,c){b=b.replace(new RegExp("\\{"+a+"\\}","g"),function(){return c})}),b)},a.extend(a.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",pendingClass:"pending",validClass:"valid",errorElement:"label",focusCleanup:!1,focusInvalid:!0,errorContainer:a([]),errorLabelContainer:a([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(a){this.lastActive=a,this.settings.focusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,a,this.settings.errorClass,this.settings.validClass),this.hideThese(this.errorsFor(a)))},onfocusout:function(a){this.checkable(a)||!(a.name in this.submitted)&&this.optional(a)||this.element(a)},onkeyup:function(b,c){var d=[16,17,18,20,35,36,37,38,39,40,45,144,225];9===c.which&&""===this.elementValue(b)||a.inArray(c.keyCode,d)!==-1||(b.name in this.submitted||b.name in this.invalid)&&this.element(b)},onclick:function(a){a.name in this.submitted?this.element(a):a.parentNode.name in this.submitted&&this.element(a.parentNode)},highlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).addClass(c).removeClass(d):a(b).addClass(c).removeClass(d)},unhighlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).removeClass(c).addClass(d):a(b).removeClass(c).addClass(d)}},setDefaults:function(b){a.extend(a.validator.defaults,b)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",equalTo:"Please enter the same value again.",maxlength:a.validator.format("Please enter no more than {0} characters."),minlength:a.validator.format("Please enter at least {0} characters."),rangelength:a.validator.format("Please enter a value between {0} and {1} characters long."),range:a.validator.format("Please enter a value between {0} and {1}."),max:a.validator.format("Please enter a value less than or equal to {0}."),min:a.validator.format("Please enter a value greater than or equal to {0}."),step:a.validator.format("Please enter a multiple of {0}.")},autoCreateRanges:!1,prototype:{init:function(){function b(b){!this.form&&this.hasAttribute("contenteditable")&&(this.form=a(this).closest("form")[0],this.name=a(this).attr("name"));var c=a.data(this.form,"validator"),d="on"+b.type.replace(/^validate/,""),e=c.settings;e[d]&&!a(this).is(e.ignore)&&e[d].call(c,this,b)}this.labelContainer=a(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||a(this.currentForm),this.containers=a(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var c,d=this.groups={};a.each(this.settings.groups,function(b,c){"string"==typeof c&&(c=c.split(/\s/)),a.each(c,function(a,c){d[c]=b})}),c=this.settings.rules,a.each(c,function(b,d){c[b]=a.validator.normalizeRule(d)}),a(this.currentForm).on("focusin.validate focusout.validate keyup.validate",":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], [type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox'], [contenteditable], [type='button']",b).on("click.validate","select, option, [type='radio'], [type='checkbox']",b),this.settings.invalidHandler&&a(this.currentForm).on("invalid-form.validate",this.settings.invalidHandler)},form:function(){return this.checkForm(),a.extend(this.submitted,this.errorMap),this.invalid=a.extend({},this.errorMap),this.valid()||a(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var a=0,b=this.currentElements=this.elements();b[a];a++)this.check(b[a]);return this.valid()},element:function(b){var c,d,e=this.clean(b),f=this.validationTargetFor(e),g=this,h=!0;return void 0===f?delete this.invalid[e.name]:(this.prepareElement(f),this.currentElements=a(f),d=this.groups[f.name],d&&a.each(this.groups,function(a,b){b===d&&a!==f.name&&(e=g.validationTargetFor(g.clean(g.findByName(a))),e&&e.name in g.invalid&&(g.currentElements.push(e),h=g.check(e)&&h))}),c=this.check(f)!==!1,h=h&&c,c?this.invalid[f.name]=!1:this.invalid[f.name]=!0,this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),a(b).attr("aria-invalid",!c)),h},showErrors:function(b){if(b){var c=this;a.extend(this.errorMap,b),this.errorList=a.map(this.errorMap,function(a,b){return{message:a,element:c.findByName(b)[0]}}),this.successList=a.grep(this.successList,function(a){return!(a.name in b)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){a.fn.resetForm&&a(this.currentForm).resetForm(),this.invalid={},this.submitted={},this.prepareForm(),this.hideErrors();var b=this.elements().removeData("previousValue").removeAttr("aria-invalid");this.resetElements(b)},resetElements:function(a){var b;if(this.settings.unhighlight)for(b=0;a[b];b++)this.settings.unhighlight.call(this,a[b],this.settings.errorClass,""),this.findByName(a[b].name).removeClass(this.settings.validClass);else a.removeClass(this.settings.errorClass).removeClass(this.settings.validClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(a){var b,c=0;for(b in a)void 0!==a[b]&&null!==a[b]&&a[b]!==!1&&c++;return c},hideErrors:function(){this.hideThese(this.toHide)},hideThese:function(a){a.not(this.containers).text(""),this.addWrapper(a).hide()},valid:function(){return 0===this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{a(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(b){}},findLastActive:function(){var b=this.lastActive;return b&&1===a.grep(this.errorList,function(a){return a.element.name===b.name}).length&&b},elements:function(){var b=this,c={};return a(this.currentForm).find("input, select, textarea, [contenteditable]").not(":submit, :reset, :image, :disabled").not(this.settings.ignore).filter(function(){var d=this.name||a(this).attr("name");return!d&&b.settings.debug&&window.console&&console.error("%o has no name assigned",this),this.hasAttribute("contenteditable")&&(this.form=a(this).closest("form")[0],this.name=d),!(d in c||!b.objectLength(a(this).rules()))&&(c[d]=!0,!0)})},clean:function(b){return a(b)[0]},errors:function(){var b=this.settings.errorClass.split(" ").join(".");return a(this.settings.errorElement+"."+b,this.errorContext)},resetInternals:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=a([]),this.toHide=a([])},reset:function(){this.resetInternals(),this.currentElements=a([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(a){this.reset(),this.toHide=this.errorsFor(a)},elementValue:function(b){var c,d,e=a(b),f=b.type;return"radio"===f||"checkbox"===f?this.findByName(b.name).filter(":checked").val():"number"===f&&"undefined"!=typeof b.validity?b.validity.badInput?"NaN":e.val():(c=b.hasAttribute("contenteditable")?e.text():e.val(),"file"===f?"C:\\fakepath\\"===c.substr(0,12)?c.substr(12):(d=c.lastIndexOf("/"),d>=0?c.substr(d+1):(d=c.lastIndexOf("\\"),d>=0?c.substr(d+1):c)):"string"==typeof c?c.replace(/\r/g,""):c)},check:function(b){b=this.validationTargetFor(this.clean(b));var c,d,e,f,g=a(b).rules(),h=a.map(g,function(a,b){return b}).length,i=!1,j=this.elementValue(b);if("function"==typeof g.normalizer?f=g.normalizer:"function"==typeof this.settings.normalizer&&(f=this.settings.normalizer),f){if(j=f.call(b,j),"string"!=typeof j)throw new TypeError("The normalizer should return a string value.");delete g.normalizer}for(d in g){e={method:d,parameters:g[d]};try{if(c=a.validator.methods[d].call(this,j,b,e.parameters),"dependency-mismatch"===c&&1===h){i=!0;continue}if(i=!1,"pending"===c)return void(this.toHide=this.toHide.not(this.errorsFor(b)));if(!c)return this.formatAndAdd(b,e),!1}catch(k){throw this.settings.debug&&window.console&&console.log("Exception occurred when checking element "+b.id+", check the '"+e.method+"' method.",k),k instanceof TypeError&&(k.message+=".  Exception occurred when checking element "+b.id+", check the '"+e.method+"' method."),k}}if(!i)return this.objectLength(g)&&this.successList.push(b),!0},customDataMessage:function(b,c){return a(b).data("msg"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase())||a(b).data("msg")},customMessage:function(a,b){var c=this.settings.messages[a];return c&&(c.constructor===String?c:c[b])},findDefined:function(){for(var a=0;a<arguments.length;a++)if(void 0!==arguments[a])return arguments[a]},defaultMessage:function(b,c){"string"==typeof c&&(c={method:c});var d=this.findDefined(this.customMessage(b.name,c.method),this.customDataMessage(b,c.method),!this.settings.ignoreTitle&&b.title||void 0,a.validator.messages[c.method],"<strong>Warning: No message defined for "+b.name+"</strong>"),e=/\$?\{(\d+)\}/g;return"function"==typeof d?d=d.call(this,c.parameters,b):e.test(d)&&(d=a.validator.format(d.replace(e,"{$1}"),c.parameters)),d},formatAndAdd:function(a,b){var c=this.defaultMessage(a,b);this.errorList.push({message:c,element:a,method:b.method}),this.errorMap[a.name]=c,this.submitted[a.name]=c},addWrapper:function(a){return this.settings.wrapper&&(a=a.add(a.parent(this.settings.wrapper))),a},defaultShowErrors:function(){var a,b,c;for(a=0;this.errorList[a];a++)c=this.errorList[a],this.settings.highlight&&this.settings.highlight.call(this,c.element,this.settings.errorClass,this.settings.validClass),this.showLabel(c.element,c.message);if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(a=0;this.successList[a];a++)this.showLabel(this.successList[a]);if(this.settings.unhighlight)for(a=0,b=this.validElements();b[a];a++)this.settings.unhighlight.call(this,b[a],this.settings.errorClass,this.settings.validClass);this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return a(this.errorList).map(function(){return this.element})},showLabel:function(b,c){var d,e,f,g,h=this.errorsFor(b),i=this.idOrName(b),j=a(b).attr("aria-describedby");h.length?(h.removeClass(this.settings.validClass).addClass(this.settings.errorClass),h.html(c)):(h=a("<"+this.settings.errorElement+">").attr("id",i+"-error").addClass(this.settings.errorClass).html(c||""),d=h,this.settings.wrapper&&(d=h.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.length?this.labelContainer.append(d):this.settings.errorPlacement?this.settings.errorPlacement.call(this,d,a(b)):d.insertAfter(b),h.is("label")?h.attr("for",i):0===h.parents("label[for='"+this.escapeCssMeta(i)+"']").length&&(f=h.attr("id"),j?j.match(new RegExp("\\b"+this.escapeCssMeta(f)+"\\b"))||(j+=" "+f):j=f,a(b).attr("aria-describedby",j),e=this.groups[b.name],e&&(g=this,a.each(g.groups,function(b,c){c===e&&a("[name='"+g.escapeCssMeta(b)+"']",g.currentForm).attr("aria-describedby",h.attr("id"))})))),!c&&this.settings.success&&(h.text(""),"string"==typeof this.settings.success?h.addClass(this.settings.success):this.settings.success(h,b)),this.toShow=this.toShow.add(h)},errorsFor:function(b){var c=this.escapeCssMeta(this.idOrName(b)),d=a(b).attr("aria-describedby"),e="label[for='"+c+"'], label[for='"+c+"'] *";return d&&(e=e+", #"+this.escapeCssMeta(d).replace(/\s+/g,", #")),this.errors().filter(e)},escapeCssMeta:function(a){return a.replace(/([\\!"#$%&'()*+,.\/:;<=>?@\[\]^`{|}~])/g,"\\$1")},idOrName:function(a){return this.groups[a.name]||(this.checkable(a)?a.name:a.id||a.name)},validationTargetFor:function(b){return this.checkable(b)&&(b=this.findByName(b.name)),a(b).not(this.settings.ignore)[0]},checkable:function(a){return/radio|checkbox/i.test(a.type)},findByName:function(b){return a(this.currentForm).find("[name='"+this.escapeCssMeta(b)+"']")},getLength:function(b,c){switch(c.nodeName.toLowerCase()){case"select":return a("option:selected",c).length;case"input":if(this.checkable(c))return this.findByName(c.name).filter(":checked").length}return b.length},depend:function(a,b){return!this.dependTypes[typeof a]||this.dependTypes[typeof a](a,b)},dependTypes:{"boolean":function(a){return a},string:function(b,c){return!!a(b,c.form).length},"function":function(a,b){return a(b)}},optional:function(b){var c=this.elementValue(b);return!a.validator.methods.required.call(this,c,b)&&"dependency-mismatch"},startRequest:function(b){this.pending[b.name]||(this.pendingRequest++,a(b).addClass(this.settings.pendingClass),this.pending[b.name]=!0)},stopRequest:function(b,c){this.pendingRequest--,this.pendingRequest<0&&(this.pendingRequest=0),delete this.pending[b.name],a(b).removeClass(this.settings.pendingClass),c&&0===this.pendingRequest&&this.formSubmitted&&this.form()?(a(this.currentForm).submit(),this.submitButton&&a("input:hidden[name='"+this.submitButton.name+"']",this.currentForm).remove(),this.formSubmitted=!1):!c&&0===this.pendingRequest&&this.formSubmitted&&(a(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(b,c){return c="string"==typeof c&&c||"remote",a.data(b,"previousValue")||a.data(b,"previousValue",{old:null,valid:!0,message:this.defaultMessage(b,{method:c})})},destroy:function(){this.resetForm(),a(this.currentForm).off(".validate").removeData("validator").find(".validate-equalTo-blur").off(".validate-equalTo").removeClass("validate-equalTo-blur")}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},number:{number:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(b,c){b.constructor===String?this.classRuleSettings[b]=c:a.extend(this.classRuleSettings,b)},classRules:function(b){var c={},d=a(b).attr("class");return d&&a.each(d.split(" "),function(){this in a.validator.classRuleSettings&&a.extend(c,a.validator.classRuleSettings[this])}),c},normalizeAttributeRule:function(a,b,c,d){/min|max|step/.test(c)&&(null===b||/number|range|text/.test(b))&&(d=Number(d),isNaN(d)&&(d=void 0)),d||0===d?a[c]=d:b===c&&"range"!==b&&(a[c]=!0)},attributeRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)"required"===c?(d=b.getAttribute(c),""===d&&(d=!0),d=!!d):d=f.attr(c),this.normalizeAttributeRule(e,g,c,d);return e.maxlength&&/-1|2147483647|524288/.test(e.maxlength)&&delete e.maxlength,e},dataRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)d=f.data("rule"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase()),this.normalizeAttributeRule(e,g,c,d);return e},staticRules:function(b){var c={},d=a.data(b.form,"validator");return d.settings.rules&&(c=a.validator.normalizeRule(d.settings.rules[b.name])||{}),c},normalizeRules:function(b,c){return a.each(b,function(d,e){if(e===!1)return void delete b[d];if(e.param||e.depends){var f=!0;switch(typeof e.depends){case"string":f=!!a(e.depends,c.form).length;break;case"function":f=e.depends.call(c,c)}f?b[d]=void 0===e.param||e.param:(a.data(c.form,"validator").resetElements(a(c)),delete b[d])}}),a.each(b,function(d,e){b[d]=a.isFunction(e)&&"normalizer"!==d?e(c):e}),a.each(["minlength","maxlength"],function(){b[this]&&(b[this]=Number(b[this]))}),a.each(["rangelength","range"],function(){var c;b[this]&&(a.isArray(b[this])?b[this]=[Number(b[this][0]),Number(b[this][1])]:"string"==typeof b[this]&&(c=b[this].replace(/[\[\]]/g,"").split(/[\s,]+/),b[this]=[Number(c[0]),Number(c[1])]))}),a.validator.autoCreateRanges&&(null!=b.min&&null!=b.max&&(b.range=[b.min,b.max],delete b.min,delete b.max),null!=b.minlength&&null!=b.maxlength&&(b.rangelength=[b.minlength,b.maxlength],delete b.minlength,delete b.maxlength)),b},normalizeRule:function(b){if("string"==typeof b){var c={};a.each(b.split(/\s/),function(){c[this]=!0}),b=c}return b},addMethod:function(b,c,d){a.validator.methods[b]=c,a.validator.messages[b]=void 0!==d?d:a.validator.messages[b],c.length<3&&a.validator.addClassRules(b,a.validator.normalizeRule(b))},methods:{required:function(b,c,d){if(!this.depend(d,c))return"dependency-mismatch";if("select"===c.nodeName.toLowerCase()){var e=a(c).val();return e&&e.length>0}return this.checkable(c)?this.getLength(b,c)>0:b.length>0},email:function(a,b){return this.optional(b)||/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)},url:function(a,b){return this.optional(b)||/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i.test(a)},date:function(a,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(a).toString())},dateISO:function(a,b){return this.optional(b)||/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(a)},number:function(a,b){return this.optional(b)||/^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(a)},digits:function(a,b){return this.optional(b)||/^\d+$/.test(a)},minlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d},maxlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e<=d},rangelength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d[0]&&e<=d[1]},min:function(a,b,c){return this.optional(b)||a>=c},max:function(a,b,c){return this.optional(b)||a<=c},range:function(a,b,c){return this.optional(b)||a>=c[0]&&a<=c[1]},step:function(b,c,d){var e,f=a(c).attr("type"),g="Step attribute on input type "+f+" is not supported.",h=["text","number","range"],i=new RegExp("\\b"+f+"\\b"),j=f&&!i.test(h.join()),k=function(a){var b=(""+a).match(/(?:\.(\d+))?$/);return b&&b[1]?b[1].length:0},l=function(a){return Math.round(a*Math.pow(10,e))},m=!0;if(j)throw new Error(g);return e=k(d),(k(b)>e||l(b)%l(d)!==0)&&(m=!1),this.optional(c)||m},equalTo:function(b,c,d){var e=a(d);return this.settings.onfocusout&&e.not(".validate-equalTo-blur").length&&e.addClass("validate-equalTo-blur").on("blur.validate-equalTo",function(){a(c).valid()}),b===e.val()},remote:function(b,c,d,e){if(this.optional(c))return"dependency-mismatch";e="string"==typeof e&&e||"remote";var f,g,h,i=this.previousValue(c,e);return this.settings.messages[c.name]||(this.settings.messages[c.name]={}),i.originalMessage=i.originalMessage||this.settings.messages[c.name][e],this.settings.messages[c.name][e]=i.message,d="string"==typeof d&&{url:d}||d,h=a.param(a.extend({data:b},d.data)),i.old===h?i.valid:(i.old=h,f=this,this.startRequest(c),g={},g[c.name]=b,a.ajax(a.extend(!0,{mode:"abort",port:"validate"+c.name,dataType:"json",data:g,context:f.currentForm,success:function(a){var d,g,h,j=a===!0||"true"===a;f.settings.messages[c.name][e]=i.originalMessage,j?(h=f.formSubmitted,f.resetInternals(),f.toHide=f.errorsFor(c),f.formSubmitted=h,f.successList.push(c),f.invalid[c.name]=!1,f.showErrors()):(d={},g=a||f.defaultMessage(c,{method:e,parameters:b}),d[c.name]=i.message=g,f.invalid[c.name]=!0,f.showErrors(d)),i.valid=j,f.stopRequest(c,j)}},d)),"pending")}}});var b,c={};return a.ajaxPrefilter?a.ajaxPrefilter(function(a,b,d){var e=a.port;"abort"===a.mode&&(c[e]&&c[e].abort(),c[e]=d)}):(b=a.ajax,a.ajax=function(d){var e=("mode"in d?d:a.ajaxSettings).mode,f=("port"in d?d:a.ajaxSettings).port;return"abort"===e?(c[f]&&c[f].abort(),c[f]=b.apply(this,arguments),c[f]):b.apply(this,arguments)}),a});
// jQuery RoyalSlider plugin. (c) Dmitry Semenov http://dimsemenov.com
// jquery.royalslider v9.5.9
(function(l){function v(b,e){var d,a=this,c=window.navigator,g=c.userAgent.toLowerCase();a.uid=l.rsModules.uid++;a.ns=".rs"+a.uid;var f=document.createElement("div").style,h=["webkit","Moz","ms","O"],k="",m=0;for(d=0;d<h.length;d++){var p=h[d];!k&&p+"Transform"in f&&(k=p);p=p.toLowerCase();window.requestAnimationFrame||(window.requestAnimationFrame=window[p+"RequestAnimationFrame"],window.cancelAnimationFrame=window[p+"CancelAnimationFrame"]||window[p+"CancelRequestAnimationFrame"])}window.requestAnimationFrame||
(window.requestAnimationFrame=function(a,b){var c=(new Date).getTime(),d=Math.max(0,16-(c-m)),f=window.setTimeout(function(){a(c+d)},d);m=c+d;return f});window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)});a.isIPAD=g.match(/(ipad)/);a.isIOS=a.isIPAD||g.match(/(iphone|ipod)/);d=function(a){a=/(chrome)[ \/]([\w.]+)/.exec(a)||/(webkit)[ \/]([\w.]+)/.exec(a)||/(opera)(?:.*version|)[ \/]([\w.]+)/.exec(a)||/(msie) ([\w.]+)/.exec(a)||0>a.indexOf("compatible")&&/(mozilla)(?:.*? rv:([\w.]+)|)/.exec(a)||
[];return{browser:a[1]||"",version:a[2]||"0"}}(g);h={};d.browser&&(h[d.browser]=!0,h.version=d.version);h.chrome&&(h.webkit=!0);a._browser=h;a.isAndroid=-1<g.indexOf("android");a.slider=l(b);a.ev=l(a);a._doc=l(document);a.st=l.extend({},l.fn.royalSlider.defaults,e);a._currAnimSpeed=a.st.transitionSpeed;a._minPosOffset=0;!a.st.allowCSS3||h.webkit&&!a.st.allowCSS3OnWebkit||(d=k+(k?"T":"t"),a._useCSS3Transitions=d+"ransform"in f&&d+"ransition"in f,a._useCSS3Transitions&&(a._use3dTransform=k+(k?"P":"p")+
"erspective"in f));k=k.toLowerCase();a._vendorPref="-"+k+"-";a._slidesHorizontal="vertical"===a.st.slidesOrientation?!1:!0;a._reorderProp=a._slidesHorizontal?"left":"top";a._sizeProp=a._slidesHorizontal?"width":"height";a._prevNavItemId=-1;a._isMove="fade"===a.st.transitionType?!1:!0;a._isMove||(a.st.sliderDrag=!1,a._fadeZIndex=10);a._opacityCSS="z-index:0; display:none; opacity:0;";a._newSlideId=0;a._sPosition=0;a._nextSlidePos=0;l.each(l.rsModules,function(b,c){"uid"!==b&&c.call(a)});a.slides=[];
a._idCount=0;(a.st.slides?l(a.st.slides):a.slider.children().detach()).each(function(){a._parseNode(this,!0)});a.st.randomizeSlides&&a.slides.sort(function(){return.5-Math.random()});a.numSlides=a.slides.length;a._refreshNumPreloadImages();a.st.startSlideId?a.st.startSlideId>a.numSlides-1&&(a.st.startSlideId=a.numSlides-1):a.st.startSlideId=0;a._newSlideId=a.staticSlideId=a.currSlideId=a._realId=a.st.startSlideId;a.currSlide=a.slides[a.currSlideId];a._accelerationPos=0;a.pointerMultitouch=!1;a.slider.addClass((a._slidesHorizontal?
"rsHor":"rsVer")+(a._isMove?"":" rsFade"));f='<div class="rsOverflow"><div class="rsContainer">';a.slidesSpacing=a.st.slidesSpacing;a._slideSize=(a._slidesHorizontal?a.slider.width():a.slider.height())+a.st.slidesSpacing;a._preload=0<a._numPreloadImages;1>=a.numSlides&&(a._loop=!1);a._loopHelpers=a._loop&&a._isMove?2===a.numSlides?1:2:0;a._maxImages=6>a.numSlides?a.numSlides:6;a._currBlockIndex=0;a._idOffset=0;a.slidesJQ=[];for(d=0;d<a.numSlides;d++)a.slidesJQ.push(l('<div style="'+(a._isMove?"":
d!==a.currSlideId?a._opacityCSS:"z-index:0;")+'" class="rsSlide "></div>'));a._sliderOverflow=f=l(f+"</div></div>");k=function(b,c,d,f,e){a._downEvent=b+c;a._moveEvent=b+d;a._upEvent=b+f;e&&(a._cancelEvent=b+e)};d=c.pointerEnabled;a.pointerEnabled=d||c.msPointerEnabled;a.pointerEnabled?(a.hasTouch=!1,a._lastItemFriction=.2,a.pointerMultitouch=1<c[(d?"m":"msM")+"axTouchPoints"],d?k("pointer","down","move","up","cancel"):k("MSPointer","Down","Move","Up","Cancel")):(a.isIOS?a._downEvent=a._moveEvent=
a._upEvent=a._cancelEvent="":k("mouse","down","move","up"),"ontouchstart"in window||"createTouch"in document?(a.hasTouch=!0,a._downEvent+=" touchstart",a._moveEvent+=" touchmove",a._upEvent+=" touchend",a._cancelEvent+=" touchcancel",a._lastItemFriction=.5,a.st.sliderTouch&&(a._hasDrag=!0)):(a.hasTouch=!1,a._lastItemFriction=.2));a.st.sliderDrag&&(a._hasDrag=!0,h.msie||h.opera?a._grabCursor=a._grabbingCursor="move":h.mozilla?(a._grabCursor="-moz-grab",a._grabbingCursor="-moz-grabbing"):h.webkit&&
-1!=c.platform.indexOf("Mac")&&(a._grabCursor="-webkit-grab",a._grabbingCursor="-webkit-grabbing"),a._setGrabCursor());a.slider.html(f);a._controlsContainer=a.st.controlsInside?a._sliderOverflow:a.slider;a._slidesContainer=a._sliderOverflow.children(".rsContainer");a.pointerEnabled&&a._slidesContainer.css((d?"":"-ms-")+"touch-action",a._slidesHorizontal?"pan-y":"pan-x");a._preloader=l('<div class="rsPreloader"></div>');c=a._slidesContainer.children(".rsSlide");a._currHolder=a.slidesJQ[a.currSlideId];
a._selectedSlideHolder=0;a._eventCallbacks={dragStart:function(b){a._onDragStart(b)},dragStartThumb:function(b){a._onDragStart(b,!0)},touchmoveFix:function(){}};a._useCSS3Transitions?(a._TP="transition-property",a._TD="transition-duration",a._TTF="transition-timing-function",a._yProp=a._xProp=a._vendorPref+"transform",a._use3dTransform?(h.webkit&&!h.chrome&&a.slider.addClass("rsWebkit3d"),a._tPref1="translate3d(",a._tPref2="px, ",a._tPref3="px, 0px)"):(a._tPref1="translate(",a._tPref2="px, ",a._tPref3=
"px)"),a._isMove?a._slidesContainer[a._vendorPref+a._TP]=a._vendorPref+"transform":(h={},h[a._vendorPref+a._TP]="opacity",h[a._vendorPref+a._TD]=a.st.transitionSpeed+"ms",h[a._vendorPref+a._TTF]=a.st.css3easeInOut,c.css(h))):(a._xProp="left",a._yProp="top");a._slidesHorizontal&&a.slider.css("touch-action","pan-y");var n;l(window).on("resize"+a.ns,function(){n&&clearTimeout(n);n=setTimeout(function(){a.updateSliderSize()},50)});a.ev.trigger("rsAfterPropsSetup");a.updateSliderSize();a.st.keyboardNavEnabled&&
a._bindKeyboardNav();a.st.arrowsNavHideOnTouch&&(a.hasTouch||a.pointerMultitouch)&&(a.st.arrowsNav=!1);a.st.arrowsNav&&(c=a._controlsContainer,l('<div class="rsArrow rsArrowLeft"><div class="rsArrowIcn"></div></div><div class="rsArrow rsArrowRight"><div class="rsArrowIcn"></div></div>').appendTo(c),a._arrowLeft=c.children(".rsArrowLeft").click(function(b){b.preventDefault();a.prev()}),a._arrowRight=c.children(".rsArrowRight").click(function(b){b.preventDefault();a.next()}),a.st.arrowsNavAutoHide&&
!a.hasTouch&&(a._arrowLeft.addClass("rsHidden"),a._arrowRight.addClass("rsHidden"),c.one("mousemove.arrowshover",function(){a._arrowLeft.removeClass("rsHidden");a._arrowRight.removeClass("rsHidden")}),c.hover(function(){a._arrowsAutoHideLocked||(a._arrowLeft.removeClass("rsHidden"),a._arrowRight.removeClass("rsHidden"))},function(){a._arrowsAutoHideLocked||(a._arrowLeft.addClass("rsHidden"),a._arrowRight.addClass("rsHidden"))})),a.ev.on("rsOnUpdateNav",function(){a._updateArrowsNav()}),a._updateArrowsNav());
a.hasTouch&&a.st.sliderTouch||!a.hasTouch&&a.st.sliderDrag?(a._bindPassiveEvent(a._slidesContainer[0],a._downEvent,a._eventCallbacks.dragStart,!1),a._bindPassiveEvent(a.slider[0],a._moveEvent,a._eventCallbacks.touchmoveFix,!1)):a.dragSuccess=!1;var r=["rsPlayBtnIcon","rsPlayBtn","rsCloseVideoBtn","rsCloseVideoIcn"];a._slidesContainer.click(function(b){if(!a.dragSuccess){var c=l(b.target).attr("class");if(-1!==l.inArray(c,r)&&a.toggleVideo())return!1;if(a.st.navigateByClick&&!a._blockActions){if(l(b.target).closest(".rsNoDrag",
a._currHolder).length)return!0;a._mouseNext(b)}a.ev.trigger("rsSlideClick",b)}}).on("click.rs","a",function(b){if(a.dragSuccess)return!1;a._blockActions=!0;setTimeout(function(){a._blockActions=!1},3)});a.ev.trigger("rsAfterInit")}l.rsModules||(l.rsModules={uid:0});v.prototype={constructor:v,_mouseNext:function(b){b=b[this._slidesHorizontal?"pageX":"pageY"]-this._sliderOffset;b>=this._nextSlidePos?this.next():0>b&&this.prev()},_refreshNumPreloadImages:function(){var b=this.st.numImagesToPreload;if(this._loop=
this.st.loop)2===this.numSlides?(this._loop=!1,this.st.loopRewind=!0):2>this.numSlides&&(this.st.loopRewind=this._loop=!1);this._loop&&0<b&&(4>=this.numSlides?b=1:this.st.numImagesToPreload>(this.numSlides-1)/2&&(b=Math.floor((this.numSlides-1)/2)));this._numPreloadImages=b},_parseNode:function(b,e){function d(b,d){d?c.images.push(b.attr(d)):c.images.push(b.text());if(g){g=!1;c.caption="src"===d?b.attr("alt"):b.contents();c.image=c.images[0];c.videoURL=b.attr("data-rsVideo");var f=b.attr("data-rsw"),
e=b.attr("data-rsh");"undefined"!==typeof f&&!1!==f&&"undefined"!==typeof e&&!1!==e?(c.iW=parseInt(f,10),c.iH=parseInt(e,10)):a.st.imgWidth&&a.st.imgHeight&&(c.iW=a.st.imgWidth,c.iH=a.st.imgHeight)}}var a=this,c={},g=!0;b=l(b);a._currContent=b;a.ev.trigger("rsBeforeParseNode",[b,c]);if(!c.stopParsing){b=a._currContent;c.id=a._idCount;c.contentAdded=!1;a._idCount++;c.images=[];c.isBig=!1;if(!c.hasCover){if(b.hasClass("rsImg")){var f=b;var h=!0}else f=b.find(".rsImg"),f.length&&(h=!0);h?(c.bigImage=
f.eq(0).attr("data-rsBigImg"),f.each(function(){var a=l(this);a.is("a")?d(a,"href"):a.is("img")?d(a,"src"):d(a)})):b.is("img")&&(b.addClass("rsImg rsMainSlideImage"),d(b,"src"))}f=b.find(".rsCaption");f.length&&(c.caption=f.remove());c.content=b;a.ev.trigger("rsAfterParseNode",[b,c]);e&&a.slides.push(c);0===c.images.length&&(c.isLoaded=!0,c.isRendered=!1,c.isLoading=!1,c.images=null);return c}},_bindKeyboardNav:function(){var b=this,e,d,a=function(a){37===a?b.prev():39===a&&b.next()};b._doc.on("keydown"+
b.ns,function(c){if(!b.st.keyboardNavEnabled)return!0;if(!(b._isDragging||(d=c.keyCode,37!==d&&39!==d||e))){if(document.activeElement&&/(INPUT|SELECT|TEXTAREA)/i.test(document.activeElement.tagName))return!0;b.isFullscreen&&c.preventDefault();a(d);e=setInterval(function(){a(d)},700)}}).on("keyup"+b.ns,function(a){e&&(clearInterval(e),e=null)})},goTo:function(b,e){b!==this.currSlideId&&this._moveTo(b,this.st.transitionSpeed,!0,!e)},destroy:function(b){this.ev.trigger("rsBeforeDestroy");this._doc.off("keydown"+
this.ns+" keyup"+this.ns);this._eventCallbacks.dragMove&&(this._unbindPassiveEvent(document,this._moveEvent,this._eventCallbacks.dragMove,!0),this._unbindPassiveEvent(document,this._upEvent,this._eventCallbacks.dragRelease,!0));this._eventCallbacks.downEvent&&(this._unbindPassiveEvent(this._slidesContainer[0],this._downEvent,this._eventCallbacks.dragStart,!1),this._unbindPassiveEvent(this.slider[0],this._moveEvent,this._eventCallbacks.touchmoveFix,!1));this._slidesContainer.off(this._downEvent+" click");
this.slider.data("royalSlider",null);l.removeData(this.slider,"royalSlider");l(window).off("resize"+this.ns);this.loadingTimeout&&clearTimeout(this.loadingTimeout);b&&this.slider.remove();this.ev=this.slider=this.slides=null},_updateBlocksContent:function(b,e){function d(d,e,g){d.isAdded?(a(e,d),c(e,d)):(g||(g=f.slidesJQ[e]),d.holder?g=d.holder:(g=f.slidesJQ[e]=l(g),d.holder=g),d.appendOnLoaded=!1,c(e,d,g),a(e,d),f._addBlockToContainer(d,g,b),d.isAdded=!0)}function a(a,c){c.contentAdded||(f.setItemHtml(c,
b),b||(c.contentAdded=!0))}function c(a,b,c){f._isMove&&(c||(c=f.slidesJQ[a]),c.css(f._reorderProp,(a+f._idOffset+x)*f._slideSize))}function g(a){if(m){if(a>p-1)return g(a-p);if(0>a)return g(p+a)}return a}var f=this,h,k,m=f._loop,p=f.numSlides;if(!isNaN(e))return g(e);var n=f.currSlideId,r=b?Math.abs(f._prevSlideId-f.currSlideId)>=f.numSlides-1?0:1:f._numPreloadImages,t=Math.min(2,r),w=!1,u=!1;for(k=n;k<n+1+t;k++){var q=g(k);if((h=f.slides[q])&&(!h.isAdded||!h.positionSet)){w=!0;break}}for(k=n-1;k>
n-1-t;k--)if(q=g(k),(h=f.slides[q])&&(!h.isAdded||!h.positionSet)){u=!0;break}if(w)for(k=n;k<n+r+1;k++){q=g(k);var x=Math.floor((f._realId-(n-k))/f.numSlides)*f.numSlides;(h=f.slides[q])&&d(h,q)}if(u)for(k=n-1;k>n-1-r;k--)q=g(k),x=Math.floor((f._realId-(n-k))/p)*p,(h=f.slides[q])&&d(h,q);if(!b)for(t=g(n-r),n=g(n+r),r=t>n?0:t,k=0;k<p;k++)t>n&&k>t-1||!(k<r||k>n)||(h=f.slides[k])&&h.holder&&(h.holder.detach(),h.isAdded=!1)},setItemHtml:function(b,e){var d=this,a=function(){if(!b.images)b.isRendered=
!0,b.isLoaded=!0,b.isLoading=!1,f(!0);else if(!b.isLoading){if(b.content.hasClass("rsImg")){var a=b.content;var e=!0}else a=b.content.find(".rsImg:not(img)");a&&!a.is("img")&&a.each(function(){var a=l(this),c='<img class="rsImg" src="'+(a.is("a")?a.attr("href"):a.text())+'" />';e?b.content=l(c):a.replaceWith(c)});a=e?b.content:b.content.find("img.rsImg");k();a.eq(0).addClass("rsMainSlideImage");b.iW&&b.iH&&(b.isLoaded||d._resizeImage(b),f());b.isLoading=!0;if(b.isBig)l("<img />").on("load.rs error.rs",
function(a){l(this).off("load.rs error.rs");c([this],!0)}).attr("src",b.image);else{b.loaded=[];b.numStartedLoad=0;a=function(a){l(this).off("load.rs error.rs");b.loaded.push(this);b.loaded.length===b.numStartedLoad&&c(b.loaded,!1)};for(var g=0;g<b.images.length;g++){var h=l("<img />");b.numStartedLoad++;h.on("load.rs error.rs",a).attr("src",b.images[g])}}}},c=function(a,c){if(a.length){var d=a[0];if(c!==b.isBig)(d=b.holder.children())&&1<d.length&&m();else if(b.iW&&b.iH)g();else if(b.iW=d.width,
b.iH=d.height,b.iW&&b.iH)g();else{var e=new Image;e.onload=function(){e.width?(b.iW=e.width,b.iH=e.height,g()):setTimeout(function(){e.width&&(b.iW=e.width,b.iH=e.height);g()},1E3)};e.src=d.src}}else g()},g=function(){b.isLoaded=!0;b.isLoading=!1;f();m();h()},f=function(){if(!b.isAppended&&d.ev){var a=d.st.visibleNearby,c=b.id-d._newSlideId;e||b.appendOnLoaded||!d.st.fadeinLoadedSlide||0!==c&&(!(a||d._isAnimating||d._isDragging)||-1!==c&&1!==c)||(a={visibility:"visible",opacity:0},a[d._vendorPref+
"transition"]="opacity 400ms ease-in-out",b.content.css(a),setTimeout(function(){b.content.css("opacity",1)},16));b.holder.find(".rsPreloader").length?b.holder.append(b.content):b.holder.html(b.content);b.isAppended=!0;b.isLoaded&&(d._resizeImage(b),h());b.sizeReady||(b.sizeReady=!0,setTimeout(function(){d.ev.trigger("rsMaybeSizeReady",b)},100))}},h=function(){!b.loadedTriggered&&d.ev&&(b.isLoaded=b.loadedTriggered=!0,b.holder.trigger("rsAfterContentSet"),d.ev.trigger("rsAfterContentSet",b))},k=function(){d.st.usePreloader&&
b.holder.html(d._preloader.clone())},m=function(a){d.st.usePreloader&&(a=b.holder.find(".rsPreloader"),a.length&&a.remove())};b.isLoaded?f():e?!d._isMove&&b.images&&b.iW&&b.iH?a():(b.holder.isWaiting=!0,k(),b.holder.slideId=-99):a()},_addBlockToContainer:function(b,e,d){this._slidesContainer.append(b.holder);b.appendOnLoaded=!1},_onDragStart:function(b,e){var d=this,a="touchstart"===b.type;d._isTouchGesture=a;d.ev.trigger("rsDragStart");if(l(b.target).closest(".rsNoDrag",d._currHolder).length)return d.dragSuccess=
!1,!0;!e&&d._isAnimating&&(d._wasAnimating=!0,d._stopAnimation());d.dragSuccess=!1;if(d._isDragging)a&&(d._multipleTouches=!0);else{a&&(d._multipleTouches=!1);d._setGrabbingCursor();if(a){var c=b.touches;if(c&&0<c.length){var g=c[0];1<c.length&&(d._multipleTouches=!0)}else return}else b.preventDefault(),g=b;d._isDragging=!0;d._eventCallbacks.dragMove&&(d._unbindPassiveEvent(document,d._moveEvent,d._eventCallbacks.dragMove,!0),d._unbindPassiveEvent(document,d._upEvent,d._eventCallbacks.dragRelease,
!0));d._eventCallbacks.dragMove=function(a){d._onDragMove(a,e)};d._eventCallbacks.dragRelease=function(a){d._onDragRelease(a,e)};d._bindPassiveEvent(document,d._moveEvent,d._eventCallbacks.dragMove,!0);d._bindPassiveEvent(document,d._upEvent,d._eventCallbacks.dragRelease,!0);d._currMoveAxis="";d._hasMoved=!1;d._pageX=g.pageX;d._pageY=g.pageY;d._startPagePos=d._accelerationPos=(e?d._thumbsHorizontal:d._slidesHorizontal)?g.pageX:g.pageY;d._horDir=0;d._verDir=0;d._currRenderPosition=e?d._thumbsPosition:
d._sPosition;d._startTime=(new Date).getTime();if(a)d._sliderOverflow.on(d._cancelEvent,function(a){d._onDragRelease(a,e)})}},_renderMovement:function(b,e){if(this._checkedAxis){var d=this._renderMoveTime,a=b.pageX-this._pageX,c=b.pageY-this._pageY,g=this._currRenderPosition+a,f=this._currRenderPosition+c,h=e?this._thumbsHorizontal:this._slidesHorizontal;g=h?g:f;f=this._currMoveAxis;this._hasMoved=!0;this._pageX=b.pageX;this._pageY=b.pageY;"x"===f&&0!==a?this._horDir=0<a?1:-1:"y"===f&&0!==c&&(this._verDir=
0<c?1:-1);f=h?this._pageX:this._pageY;a=h?a:c;e?g>this._thumbsMinPosition?g=this._currRenderPosition+a*this._lastItemFriction:g<this._thumbsMaxPosition&&(g=this._currRenderPosition+a*this._lastItemFriction):this._loop||(0>=this.currSlideId&&0<f-this._startPagePos&&(g=this._currRenderPosition+a*this._lastItemFriction),this.currSlideId>=this.numSlides-1&&0>f-this._startPagePos&&(g=this._currRenderPosition+a*this._lastItemFriction));this._currRenderPosition=g;200<d-this._startTime&&(this._startTime=
d,this._accelerationPos=f);e?this._setThumbsPosition(this._currRenderPosition):this._isMove&&this._setPosition(this._currRenderPosition)}},_onDragMove:function(b,e){var d=this,a="touchmove"===b.type;if(!d._isTouchGesture||a){if(a){if(d._lockAxis)return;var c=b.touches;if(c){if(1<c.length)return;var g=c[0]}else return}else g=b;d._hasMoved||(d._useCSS3Transitions&&(e?d._thumbsContainer:d._slidesContainer).css(d._vendorPref+d._TD,"0s"),function h(){d._isDragging&&(d._animFrame=requestAnimationFrame(h),
d._renderMoveEvent&&d._renderMovement(d._renderMoveEvent,e))}());if(d._checkedAxis)b.preventDefault(),d._renderMoveTime=(new Date).getTime(),d._renderMoveEvent=g;else if(c=e?d._thumbsHorizontal:d._slidesHorizontal,g=Math.abs(g.pageX-d._pageX)-Math.abs(g.pageY-d._pageY)-(c?-7:7),7<g){if(c)b.preventDefault(),d._currMoveAxis="x";else if(a){d._completeGesture(b);return}d._checkedAxis=!0}else if(-7>g){if(!c)b.preventDefault(),d._currMoveAxis="y";else if(a){d._completeGesture(b);return}d._checkedAxis=!0}}},
_completeGesture:function(b,e){this._lockAxis=!0;this._hasMoved=this._isDragging=!1;this._onDragRelease(b)},_onDragRelease:function(b,e){function d(a){return 100>a?100:500<a?500:a}function a(a,b){if(c._isMove||e)u=(-c._realId-c._idOffset)*c._slideSize,g=Math.abs(c._sPosition-u),c._currAnimSpeed=g/b,a&&(c._currAnimSpeed+=250),c._currAnimSpeed=d(c._currAnimSpeed),c._animateTo(u,!1)}var c=this,g;var f=-1<b.type.indexOf("touch");if(!c._isTouchGesture||f)if(c._isTouchGesture=!1,c.ev.trigger("rsDragRelease"),
c._renderMoveEvent=null,c._isDragging=!1,c._lockAxis=!1,c._checkedAxis=!1,c._renderMoveTime=0,cancelAnimationFrame(c._animFrame),c._hasMoved&&(e?c._setThumbsPosition(c._currRenderPosition):c._isMove&&c._setPosition(c._currRenderPosition)),c._eventCallbacks.dragMove&&(c._unbindPassiveEvent(document,c._moveEvent,c._eventCallbacks.dragMove,!0),c._unbindPassiveEvent(document,c._upEvent,c._eventCallbacks.dragRelease,!0)),f&&c._sliderOverflow.off(c._cancelEvent),c._setGrabCursor(),!c._hasMoved&&!c._multipleTouches&&
e&&c._thumbsEnabled){var h=l(b.target).closest(".rsNavItem");h.length&&c.goTo(h.index())}else{h=e?c._thumbsHorizontal:c._slidesHorizontal;if(!c._hasMoved||"y"===c._currMoveAxis&&h||"x"===c._currMoveAxis&&!h)if(!e&&c._wasAnimating){c._wasAnimating=!1;if(c.st.navigateByClick){c._mouseNext(b);c.dragSuccess=!0;return}c.dragSuccess=!0}else{c._wasAnimating=!1;c.dragSuccess=!1;return}else c.dragSuccess=!0;c._wasAnimating=!1;c._currMoveAxis="";var k=c.st.minSlideOffset;f=f?b.changedTouches[0]:b;var m=h?f.pageX:
f.pageY,p=c._startPagePos,n=c.currSlideId,r=c.numSlides,t=h?c._horDir:c._verDir,v=c._loop;f=m-c._accelerationPos;h=(new Date).getTime()-c._startTime;h=Math.abs(f)/h;if(0===t||1>=r)a(!0,h);else{if(!v&&!e)if(0>=n){if(0<t){a(!0,h);return}}else if(n>=r-1&&0>t){a(!0,h);return}if(e){var u=c._thumbsPosition;if(u>c._thumbsMinPosition)u=c._thumbsMinPosition;else if(u<c._thumbsMaxPosition)u=c._thumbsMaxPosition;else{m=h*h/.006;var q=-c._thumbsPosition;p=c._thumbsContainerSize-c._thumbsViewportSize+c._thumbsPosition;
0<f&&m>q?(q+=c._thumbsViewportSize/(15/(m/h*.003)),h=h*q/m,m=q):0>f&&m>p&&(p+=c._thumbsViewportSize/(15/(m/h*.003)),h=h*p/m,m=p);q=Math.max(Math.round(h/.003),50);u+=m*(0>f?-1:1);if(u>c._thumbsMinPosition){c._animateThumbsTo(u,q,!0,c._thumbsMinPosition,200);return}if(u<c._thumbsMaxPosition){c._animateThumbsTo(u,q,!0,c._thumbsMaxPosition,200);return}}c._animateThumbsTo(u,q,!0)}else q=function(a){var b=Math.floor(a/c._slideSize);a-b*c._slideSize>k&&b++;return b},p+k<m?0>t?a(!1,h):(q=q(m-p),c._moveTo(c.currSlideId-
q,d(Math.abs(c._sPosition-(-c._realId-c._idOffset+q)*c._slideSize)/h),!1,!0,!0)):p-k>m?0<t?a(!1,h):(q=q(p-m),c._moveTo(c.currSlideId+q,d(Math.abs(c._sPosition-(-c._realId-c._idOffset-q)*c._slideSize)/h),!1,!0,!0)):a(!1,h)}}},_setPosition:function(b){b=this._sPosition=b;this._useCSS3Transitions?this._slidesContainer.css(this._xProp,this._tPref1+(this._slidesHorizontal?b+this._tPref2+0:0+this._tPref2+b)+this._tPref3):this._slidesContainer.css(this._slidesHorizontal?this._xProp:this._yProp,b)},updateSliderSize:function(b){if(this.slider){if(this.st.autoScaleSlider){var e=
this.st.autoScaleSliderWidth,d=this.st.autoScaleSliderHeight;if(this.st.autoScaleHeight){var a=this.slider.width();a!=this.width&&(this.slider.css("height",d/e*a),a=this.slider.width());var c=this.slider.height()}else c=this.slider.height(),c!=this.height&&(this.slider.css("width",e/d*c),c=this.slider.height()),a=this.slider.width()}else a=this.slider.width(),c=this.slider.height();if(b||a!=this.width||c!=this.height){this.width=a;this.height=c;this._wrapWidth=a;this._wrapHeight=c;this.ev.trigger("rsBeforeSizeSet");
this.ev.trigger("rsAfterSizePropSet");this._sliderOverflow.css({width:this._wrapWidth,height:this._wrapHeight});this._slideSize=(this._slidesHorizontal?this._wrapWidth:this._wrapHeight)+this.st.slidesSpacing;this._imagePadding=this.st.imageScalePadding;for(a=0;a<this.slides.length;a++)b=this.slides[a],b.positionSet=!1,b&&b.images&&b.isLoaded&&(b.isRendered=!1,this._resizeImage(b));if(this._cloneHolders)for(a=0;a<this._cloneHolders.length;a++)b=this._cloneHolders[a],b.holder.css(this._reorderProp,
(b.id+this._idOffset)*this._slideSize);this._updateBlocksContent();this._isMove&&(this._useCSS3Transitions&&this._slidesContainer.css(this._vendorPref+"transition-duration","0s"),this._setPosition((-this._realId-this._idOffset)*this._slideSize));this.ev.trigger("rsOnUpdateNav")}this._sliderOffset=this._sliderOverflow.offset();this._sliderOffset=this._sliderOffset[this._reorderProp]}},appendSlide:function(b,e){var d=this._parseNode(b);if(isNaN(e)||e>this.numSlides)e=this.numSlides;this.slides.splice(e,
0,d);this.slidesJQ.splice(e,0,l('<div style="'+(this._isMove?"position:absolute;":this._opacityCSS)+'" class="rsSlide"></div>'));e<=this.currSlideId&&this.currSlideId++;this.ev.trigger("rsOnAppendSlide",[d,e]);this._refreshSlides(e);e===this.currSlideId&&this.ev.trigger("rsAfterSlideChange")},removeSlide:function(b){var e=this.slides[b];e&&(e.holder&&e.holder.remove(),b<this.currSlideId&&this.currSlideId--,this.slides.splice(b,1),this.slidesJQ.splice(b,1),this.ev.trigger("rsOnRemoveSlide",[b]),this._refreshSlides(b),
b===this.currSlideId&&this.ev.trigger("rsAfterSlideChange"))},_refreshSlides:function(b){var e=this;b=e.numSlides;b=0>=e._realId?0:Math.floor(e._realId/b);e.numSlides=e.slides.length;0===e.numSlides?(e.currSlideId=e._idOffset=e._realId=0,e.currSlide=e._oldHolder=null):e._realId=b*e.numSlides+e.currSlideId;for(b=0;b<e.numSlides;b++)e.slides[b].id=b;e.currSlide=e.slides[e.currSlideId];e._currHolder=e.slidesJQ[e.currSlideId];e.currSlideId>=e.numSlides?e.goTo(e.numSlides-1):0>e.currSlideId&&e.goTo(0);
e._refreshNumPreloadImages();e._isMove&&e._slidesContainer.css(e._vendorPref+e._TD,"0ms");e._refreshSlidesTimeout&&clearTimeout(e._refreshSlidesTimeout);e._refreshSlidesTimeout=setTimeout(function(){e._isMove&&e._setPosition((-e._realId-e._idOffset)*e._slideSize);e._updateBlocksContent();e._isMove||e._currHolder.css({display:"block",opacity:1})},14);e.ev.trigger("rsOnUpdateNav")},_setGrabCursor:function(){this._hasDrag&&this._isMove&&(this._grabCursor?this._sliderOverflow.css("cursor",this._grabCursor):
(this._sliderOverflow.removeClass("grabbing-cursor"),this._sliderOverflow.addClass("grab-cursor")))},_setGrabbingCursor:function(){this._hasDrag&&this._isMove&&(this._grabbingCursor?this._sliderOverflow.css("cursor",this._grabbingCursor):(this._sliderOverflow.removeClass("grab-cursor"),this._sliderOverflow.addClass("grabbing-cursor")))},next:function(b){this._moveTo("next",this.st.transitionSpeed,!0,!b)},prev:function(b){this._moveTo("prev",this.st.transitionSpeed,!0,!b)},_moveTo:function(b,e,d,a,
c){var g=this;g.ev.trigger("rsBeforeMove",[b,a]);var f="next"===b?g.currSlideId+1:"prev"===b?g.currSlideId-1:b=parseInt(b,10);if(!g._loop){if(0>f){g._doBackAndForthAnim("left",!a);return}if(f>=g.numSlides){g._doBackAndForthAnim("right",!a);return}}g._isAnimating&&(g._stopAnimation(!0),d=!1);var h=f-g.currSlideId;f=g._prevSlideId=g.currSlideId;var k=g.currSlideId+h;a=g._realId;var m;g._loop?(k=g._updateBlocksContent(!1,k),a+=h):a=k;g._newSlideId=k;g._oldHolder=g.slidesJQ[g.currSlideId];g._realId=a;
g.currSlideId=g._newSlideId;g.currSlide=g.slides[g.currSlideId];g._currHolder=g.slidesJQ[g.currSlideId];k=g.st.slidesDiff;var l=0<h;h=Math.abs(h);var n=Math.floor(f/g._numPreloadImages),r=Math.floor((f+(l?k:-k))/g._numPreloadImages);n=(l?Math.max(n,r):Math.min(n,r))*g._numPreloadImages+(l?g._numPreloadImages-1:0);n>g.numSlides-1?n=g.numSlides-1:0>n&&(n=0);f=l?n-f:f-n;f>g._numPreloadImages&&(f=g._numPreloadImages);if(h>f+k)for(g._idOffset+=(h-(f+k))*(l?-1:1),e*=1.4,f=0;f<g.numSlides;f++)g.slides[f].positionSet=
!1;g._currAnimSpeed=e;g._updateBlocksContent(!0);c||(m=!0);var t=(-a-g._idOffset)*g._slideSize;m?setTimeout(function(){g._isWorking=!1;g._animateTo(t,b,!1,d);g.ev.trigger("rsOnUpdateNav")},0):(g._animateTo(t,b,!1,d),g.ev.trigger("rsOnUpdateNav"))},_updateArrowsNav:function(){this.st.arrowsNav&&(1>=this.numSlides?(this._arrowLeft.css("display","none"),this._arrowRight.css("display","none")):(this._arrowLeft.css("display","block"),this._arrowRight.css("display","block"),this._loop||this.st.loopRewind||
(0===this.currSlideId?this._arrowLeft.addClass("rsArrowDisabled"):this._arrowLeft.removeClass("rsArrowDisabled"),this.currSlideId===this.numSlides-1?this._arrowRight.addClass("rsArrowDisabled"):this._arrowRight.removeClass("rsArrowDisabled"))))},_animateTo:function(b,e,d,a,c){function g(){var a;k&&(a=k.data("rsTimeout"))&&(k!==m&&k.css({opacity:0,display:"none",zIndex:0}),clearTimeout(a),k.data("rsTimeout",""));if(a=m.data("rsTimeout"))clearTimeout(a),m.data("rsTimeout","")}var f=this,h={};isNaN(f._currAnimSpeed)&&
(f._currAnimSpeed=400);f._sPosition=f._currRenderPosition=b;f.ev.trigger("rsBeforeAnimStart");if(f._useCSS3Transitions)if(f._isMove)f._currAnimSpeed=parseInt(f._currAnimSpeed,10),d=f._vendorPref+f._TTF,h[f._vendorPref+f._TD]=f._currAnimSpeed+"ms",h[d]=a?l.rsCSS3Easing[f.st.easeInOut]:l.rsCSS3Easing[f.st.easeOut],f._slidesContainer.css(h),a||!f.hasTouch?setTimeout(function(){f._setPosition(b)},5):f._setPosition(b);else{f._currAnimSpeed=f.st.transitionSpeed;var k=f._oldHolder;var m=f._currHolder;m.data("rsTimeout")&&
m.css("opacity",0);g();k&&k.data("rsTimeout",setTimeout(function(){h[f._vendorPref+f._TD]="0ms";h.zIndex=0;h.display="none";k.data("rsTimeout","");k.css(h);setTimeout(function(){k.css("opacity",0)},16)},f._currAnimSpeed+60));h.display="block";h.zIndex=f._fadeZIndex;h.opacity=0;h[f._vendorPref+f._TD]="0ms";h[f._vendorPref+f._TTF]=l.rsCSS3Easing[f.st.easeInOut];m.css(h);m.data("rsTimeout",setTimeout(function(){m.css(f._vendorPref+f._TD,f._currAnimSpeed+"ms");m.data("rsTimeout",setTimeout(function(){m.css("opacity",
1);m.data("rsTimeout","")},20))},20))}else f._isMove?(h[f._slidesHorizontal?f._xProp:f._yProp]=b+"px",f._slidesContainer.animate(h,f._currAnimSpeed,a?f.st.easeInOut:f.st.easeOut)):(k=f._oldHolder,m=f._currHolder,m.stop(!0,!0).css({opacity:0,display:"block",zIndex:f._fadeZIndex}),f._currAnimSpeed=f.st.transitionSpeed,m.animate({opacity:1},f._currAnimSpeed,f.st.easeInOut),g(),k&&k.data("rsTimeout",setTimeout(function(){k.stop(!0,!0).css({opacity:0,display:"none",zIndex:0})},f._currAnimSpeed+60)));f._isAnimating=
!0;f.loadingTimeout&&clearTimeout(f.loadingTimeout);f.loadingTimeout=c?setTimeout(function(){f.loadingTimeout=null;c.call()},f._currAnimSpeed+60):setTimeout(function(){f.loadingTimeout=null;f._animationComplete(e)},f._currAnimSpeed+60)},_stopAnimation:function(b){this._isAnimating=!1;clearTimeout(this.loadingTimeout);if(this._isMove)if(!this._useCSS3Transitions)this._slidesContainer.stop(!0),this._sPosition=parseInt(this._slidesContainer.css(this._slidesHorizontal?this._xProp:this._yProp),10);else{if(!b){b=
this._sPosition;var e=this._currRenderPosition=this._getTransformProp();this._slidesContainer.css(this._vendorPref+this._TD,"0ms");b!==e&&this._setPosition(e)}}else 20<this._fadeZIndex?this._fadeZIndex=10:this._fadeZIndex++},_getTransformProp:function(){var b=window.getComputedStyle(this._slidesContainer.get(0),null).getPropertyValue(this._vendorPref+"transform").replace(/^matrix\(/i,"").split(/, |\)$/g),e=0===b[0].indexOf("matrix3d");return parseInt(b[this._slidesHorizontal?e?12:4:e?13:5],10)},_getCSS3Prop:function(b,
e){return this._useCSS3Transitions?this._tPref1+(e?b+this._tPref2+0:0+this._tPref2+b)+this._tPref3:b},_animationComplete:function(b){this._isMove||(this._currHolder.css("z-index",0),this._fadeZIndex=10);this._isAnimating=!1;this.staticSlideId=this.currSlideId;this._updateBlocksContent();this._slidesMoved=!1;this.ev.trigger("rsAfterSlideChange")},_doBackAndForthAnim:function(b,e){var d=this,a=(-d._realId-d._idOffset)*d._slideSize;if(0!==d.numSlides&&!d._isAnimating)if(d.st.loopRewind)d.goTo("left"===
b?d.numSlides-1:0,e);else if(d._isMove){d._currAnimSpeed=200;var c=function(){d._isAnimating=!1};d._animateTo(a+("left"===b?30:-30),"",!1,!0,function(){d._isAnimating=!1;d._animateTo(a,"",!1,!0,c)})}},_detectPassiveSupport:function(){var b=this;if(!b._passiveChecked){b._passiveChecked=!0;b._passiveParam=!1;try{var e=Object.defineProperty({},"passive",{get:function(){b._passiveParam={passive:!1}}});window.addEventListener("testPassive",null,e);window.removeEventListener("testPassive",null,e)}catch(d){}}},
_bindPassiveEvent:function(b,e,d,a){this._detectPassiveSupport();e=e.split(" ");for(var c=0;c<e.length;c++)e[c]&&2<e[c].length&&b.addEventListener(e[c],d,a?this._passiveParam:!1)},_unbindPassiveEvent:function(b,e,d,a){this._detectPassiveSupport();e=e.split(" ");for(var c=0;c<e.length;c++)e[c]&&2<e[c].length&&b.removeEventListener(e[c],d,a?this._passiveParam:!1)},_resizeImage:function(b,e){if(!b.isRendered){var d=b.content,a="rsMainSlideImage",c=l.isFunction(this.st.imageAlignCenter)?this.st.imageAlignCenter(b):
this.st.imageAlignCenter,g=l.isFunction(this.st.imageScaleMode)?this.st.imageScaleMode(b):this.st.imageScaleMode;if(b.videoURL)if(a="rsVideoContainer","fill"!==g)var f=!0;else{var h=d;h.hasClass(a)||(h=h.find("."+a));h.css({width:"100%",height:"100%"});a="rsMainSlideImage"}d.hasClass(a)||(d=d.find("."+a));if(d){var k=b.iW,m=b.iH;b.isRendered=!0;if("none"!==g||c){a="fill"!==g?this._imagePadding:0;h=this._wrapWidth-2*a;var p=this._wrapHeight-2*a,n={};"fit-if-smaller"===g&&(k>h||m>p)&&(g="fit");if("fill"===
g||"fit"===g){var r=h/k;var t=p/m;r="fill"==g?r>t?r:t:"fit"==g?r<t?r:t:1;k=Math.ceil(k*r,10);m=Math.ceil(m*r,10)}"none"!==g&&(n.width=k,n.height=m,f&&d.find(".rsImg").css({width:"100%",height:"100%"}));c&&(n.marginLeft=Math.floor((h-k)/2)+a,n.marginTop=Math.floor((p-m)/2)+a);d.css(n)}}}}};l.rsProto=v.prototype;l.fn.royalSlider=function(b){var e=arguments;return this.each(function(){var d=l(this);if("object"!==typeof b&&b){if((d=d.data("royalSlider"))&&d[b])return d[b].apply(d,Array.prototype.slice.call(e,
1))}else d.data("royalSlider")||d.data("royalSlider",new v(d,b))})};l.fn.royalSlider.defaults={slidesSpacing:8,startSlideId:0,loop:!1,loopRewind:!1,numImagesToPreload:4,fadeinLoadedSlide:!0,slidesOrientation:"horizontal",transitionType:"move",transitionSpeed:600,controlNavigation:"bullets",controlsInside:!0,arrowsNav:!0,arrowsNavAutoHide:!0,navigateByClick:!0,randomizeSlides:!1,sliderDrag:!0,sliderTouch:!0,keyboardNavEnabled:!1,fadeInAfterLoaded:!0,allowCSS3:!0,allowCSS3OnWebkit:!0,addActiveClass:!1,
autoHeight:!1,easeOut:"easeOutSine",easeInOut:"easeInOutSine",minSlideOffset:10,imageScaleMode:"fit-if-smaller",imageAlignCenter:!0,imageScalePadding:4,usePreloader:!0,autoScaleSlider:!1,autoScaleSliderWidth:800,autoScaleSliderHeight:400,autoScaleHeight:!0,arrowsNavHideOnTouch:!1,globalCaption:!1,slidesDiff:2};l.rsCSS3Easing={easeOutSine:"cubic-bezier(0.390, 0.575, 0.565, 1.000)",easeInOutSine:"cubic-bezier(0.445, 0.050, 0.550, 0.950)"};l.extend(jQuery.easing,{easeInOutSine:function(b,e,d,a,c){return-a/
2*(Math.cos(Math.PI*e/c)-1)+d},easeOutSine:function(b,e,d,a,c){return a*Math.sin(e/c*(Math.PI/2))+d},easeOutCubic:function(b,e,d,a,c){return a*((e=e/c-1)*e*e+1)+d}})})(jQuery,window);
// jquery.rs.bullets v1.0.1
(function(c){c.extend(c.rsProto,{_initBullets:function(){var a=this;"bullets"===a.st.controlNavigation&&(a.ev.one("rsAfterPropsSetup",function(){a._controlNavEnabled=!0;a.slider.addClass("rsWithBullets");for(var b='<div class="rsNav rsBullets">',e=0;e<a.numSlides;e++)b+='<div class="rsNavItem rsBullet"><span></span></div>';a._controlNav=b=c(b+"</div>");a._controlNavItems=b.appendTo(a.slider).children();a._controlNav.on("click.rs",".rsNavItem",function(b){a._thumbsDrag||a.goTo(c(this).index())})}),
a.ev.on("rsOnAppendSlide",function(b,c,d){d>=a.numSlides?a._controlNav.append('<div class="rsNavItem rsBullet"><span></span></div>'):a._controlNavItems.eq(d).before('<div class="rsNavItem rsBullet"><span></span></div>');a._controlNavItems=a._controlNav.children()}),a.ev.on("rsOnRemoveSlide",function(b,c){var d=a._controlNavItems.eq(c);d&&d.length&&(d.remove(),a._controlNavItems=a._controlNav.children())}),a.ev.on("rsOnUpdateNav",function(){var b=a.currSlideId;a._prevNavItem&&a._prevNavItem.removeClass("rsNavSelected");
b=a._controlNavItems.eq(b);b.addClass("rsNavSelected");a._prevNavItem=b}))}});c.rsModules.bullets=c.rsProto._initBullets})(jQuery);// jquery.rs.thumbnails v1.0.9
(function(g){g.extend(g.rsProto,{_initThumbs:function(){var a=this;"thumbnails"===a.st.controlNavigation&&(a._thumbsDefaults={drag:!0,touch:!0,orientation:"horizontal",navigation:!0,arrows:!0,arrowLeft:null,arrowRight:null,spacing:4,arrowsAutoHide:!1,appendSpan:!1,transitionSpeed:600,autoCenter:!0,fitInViewport:!0,firstMargin:!0,paddingTop:0,paddingBottom:0},a.st.thumbs=g.extend({},a._thumbsDefaults,a.st.thumbs),a._firstThumbMoved=!0,!1===a.st.thumbs.firstMargin?a.st.thumbs.firstMargin=0:!0===a.st.thumbs.firstMargin&&
(a.st.thumbs.firstMargin=a.st.thumbs.spacing),a.ev.on("rsBeforeParseNode",function(a,b,c){b=g(b);c.thumbnail=b.find(".rsTmb").remove();c.thumbnail.length?c.thumbnail=g(document.createElement("div")).append(c.thumbnail).html():(c.thumbnail=b.attr("data-rsTmb"),c.thumbnail||(c.thumbnail=b.find(".rsImg").attr("data-rsTmb")),c.thumbnail=c.thumbnail?'<img src="'+c.thumbnail+'"/>':"")}),a.ev.one("rsAfterPropsSetup",function(){a._createThumbs()}),a._prevNavItem=null,a.ev.on("rsOnUpdateNav",function(){var d=
g(a._controlNavItems[a.currSlideId]);d!==a._prevNavItem&&(a._prevNavItem&&(a._prevNavItem.removeClass("rsNavSelected"),a._prevNavItem=null),a._thumbsNavigation&&a._setCurrentThumb(a.currSlideId),a._prevNavItem=d.addClass("rsNavSelected"))}),a.ev.on("rsOnAppendSlide",function(d,b,c){d="<div"+a._thumbsMargin+' class="rsNavItem rsThumb">'+a._addThumbHTML+b.thumbnail+"</div>";a._useCSS3Transitions&&a._thumbsContainer.css(a._vendorPref+"transition-duration","0ms");c>=a.numSlides?a._thumbsContainer.append(d):
a._controlNavItems.eq(c).before(d);a._controlNavItems=a._thumbsContainer.children();a.updateThumbsSize(!0)}),a.ev.on("rsOnRemoveSlide",function(d,b){var c=a._controlNavItems.eq(b);c&&(a._useCSS3Transitions&&a._thumbsContainer.css(a._vendorPref+"transition-duration","0ms"),c.remove(),a._controlNavItems=a._thumbsContainer.children(),a.updateThumbsSize(!0))}))},_createThumbs:function(){var a=this,d="rsThumbs",b=a.st.thumbs,c="",f,e=b.spacing;a._controlNavEnabled=!0;a._thumbsHorizontal="vertical"===b.orientation?
!1:!0;a._thumbsMargin=f=e?' style="margin-'+(a._thumbsHorizontal?"right":"bottom")+":"+e+'px;"':"";a._thumbsPosition=0;a._isThumbsAnimating=!1;a._thumbsDrag=!1;a._thumbsNavigation=!1;a._thumbsArrows=b.arrows&&b.navigation;var h=a._thumbsHorizontal?"Hor":"Ver";a.slider.addClass("rsWithThumbs rsWithThumbs"+h);c+='<div class="rsNav rsThumbs rsThumbs'+h+'"><div class="'+d+'Container">';a._addThumbHTML=b.appendSpan?'<span class="thumbIco"></span>':"";for(var k=0;k<a.numSlides;k++)h=a.slides[k],c+="<div"+
f+' class="rsNavItem rsThumb">'+h.thumbnail+a._addThumbHTML+"</div>";c=g(c+"</div></div>");f={};b.paddingTop&&(f[a._thumbsHorizontal?"paddingTop":"paddingLeft"]=b.paddingTop);b.paddingBottom&&(f[a._thumbsHorizontal?"paddingBottom":"paddingRight"]=b.paddingBottom);c.css(f);a._thumbsContainer=g(c).find("."+d+"Container");a._thumbsArrows&&(d+="Arrow",b.arrowLeft?a._thumbsArrowLeft=b.arrowLeft:(a._thumbsArrowLeft=g('<div class="'+d+" "+d+'Left"><div class="'+d+'Icn"></div></div>'),c.append(a._thumbsArrowLeft)),
b.arrowRight?a._thumbsArrowRight=b.arrowRight:(a._thumbsArrowRight=g('<div class="'+d+" "+d+'Right"><div class="'+d+'Icn"></div></div>'),c.append(a._thumbsArrowRight)),a._thumbsArrowLeft.click(function(){var b=(Math.floor(a._thumbsPosition/a._thumbSize)+a._visibleThumbsPerView)*a._thumbSize+a.st.thumbs.firstMargin;a._animateThumbsTo(b>a._thumbsMinPosition?a._thumbsMinPosition:b)}),a._thumbsArrowRight.click(function(){var b=(Math.floor(a._thumbsPosition/a._thumbSize)-a._visibleThumbsPerView)*a._thumbSize+
a.st.thumbs.firstMargin;a._animateThumbsTo(b<a._thumbsMaxPosition?a._thumbsMaxPosition:b)}),b.arrowsAutoHide&&!a.hasTouch&&(a._thumbsArrowLeft.css("opacity",0),a._thumbsArrowRight.css("opacity",0),c.one("mousemove.rsarrowshover",function(){a._thumbsNavigation&&(a._thumbsArrowLeft.css("opacity",1),a._thumbsArrowRight.css("opacity",1))}),c.hover(function(){a._thumbsNavigation&&(a._thumbsArrowLeft.css("opacity",1),a._thumbsArrowRight.css("opacity",1))},function(){a._thumbsNavigation&&(a._thumbsArrowLeft.css("opacity",
0),a._thumbsArrowRight.css("opacity",0))})));a._controlNav=c;a._controlNavItems=a._thumbsContainer.children();a.msEnabled&&a.st.thumbs.navigation&&a._thumbsContainer.css("-ms-touch-action",a._thumbsHorizontal?"pan-y":"pan-x");a.slider.append(c);a._thumbsEnabled=!0;a._thumbsSpacing=e;b.navigation&&a._useCSS3Transitions&&a._thumbsContainer.css(a._vendorPref+"transition-property",a._vendorPref+"transform");a._controlNav.on("click.rs",".rsNavItem",function(b){a._thumbsDrag||a.goTo(g(this).index())});
a.ev.off("rsBeforeSizeSet.thumbs").on("rsBeforeSizeSet.thumbs",function(){a._realWrapSize=a._thumbsHorizontal?a._wrapHeight:a._wrapWidth;a.updateThumbsSize(!0)});a.ev.off("rsAutoHeightChange.thumbs").on("rsAutoHeightChange.thumbs",function(b,c){a.updateThumbsSize(!0,c)})},updateThumbsSize:function(a,d){var b=this._controlNavItems.first(),c={},f=this._controlNavItems.length;this._thumbSize=(this._thumbsHorizontal?b.outerWidth():b.outerHeight())+this._thumbsSpacing;this._thumbsContainerSize=f*this._thumbSize-
this._thumbsSpacing;c[this._thumbsHorizontal?"width":"height"]=this._thumbsContainerSize+this._thumbsSpacing;this._thumbsViewportSize=this._thumbsHorizontal?this._controlNav.width():void 0!==d?d:this._controlNav.height();this._thumbsEnabled&&(this.isFullscreen||this.st.thumbs.fitInViewport)&&(this._thumbsHorizontal?this._wrapHeight=this._realWrapSize-this._controlNav.outerHeight():this._wrapWidth=this._realWrapSize-this._controlNav.outerWidth());this._thumbsViewportSize&&(this._thumbsMaxPosition=
-(this._thumbsContainerSize-this._thumbsViewportSize)-this.st.thumbs.firstMargin,this._thumbsMinPosition=this.st.thumbs.firstMargin,this._visibleThumbsPerView=Math.floor(this._thumbsViewportSize/this._thumbSize),this._thumbsContainerSize<this._thumbsViewportSize?(this.st.thumbs.autoCenter?this._setThumbsPosition((this._thumbsViewportSize-this._thumbsContainerSize)/2):this._setThumbsPosition(this._thumbsMinPosition),this.st.thumbs.arrows&&this._thumbsArrowLeft&&(this._thumbsArrowLeft.addClass("rsThumbsArrowDisabled"),
this._thumbsArrowRight.addClass("rsThumbsArrowDisabled")),this._thumbsDrag=this._thumbsNavigation=!1,this._unbindPassiveEvent(this._controlNav[0],this._downEvent,this._eventCallbacks.dragStartThumb,!1)):this.st.thumbs.navigation&&!this._thumbsNavigation&&(this._thumbsNavigation=!0,!this.hasTouch&&this.st.thumbs.drag||this.hasTouch&&this.st.thumbs.touch)&&(this._thumbsDrag=!0,this._bindPassiveEvent(this._controlNav[0],this._downEvent,this._eventCallbacks.dragStartThumb,!1)),this._thumbsContainer.css(c),
a&&d&&this._setCurrentThumb(this.currSlideId,!0))},setThumbsOrientation:function(a,d){this._thumbsEnabled&&(this.st.thumbs.orientation=a,this._controlNav.remove(),this.slider.removeClass("rsWithThumbsHor rsWithThumbsVer"),this._createThumbs(),this._unbindPassiveEvent(this._controlNav[0],this._downEvent,this._eventCallbacks.dragStartThumb,!1),d||this.updateSliderSize(!0))},_setThumbsPosition:function(a){this._thumbsPosition=a;this._useCSS3Transitions?this._thumbsContainer.css(this._xProp,this._tPref1+
(this._thumbsHorizontal?a+this._tPref2+0:0+this._tPref2+a)+this._tPref3):this._thumbsContainer.css(this._thumbsHorizontal?this._xProp:this._yProp,a)},_animateThumbsTo:function(a,d,b,c,f){var e=this;if(e._thumbsNavigation){d||(d=e.st.thumbs.transitionSpeed);e._thumbsPosition=a;e._thumbsAnimTimeout&&clearTimeout(e._thumbsAnimTimeout);e._isThumbsAnimating&&(e._useCSS3Transitions||e._thumbsContainer.stop(),b=!0);var h={};e._isThumbsAnimating=!0;e._useCSS3Transitions?(h[e._vendorPref+"transition-duration"]=
d+"ms",h[e._vendorPref+"transition-timing-function"]=b?g.rsCSS3Easing[e.st.easeOut]:g.rsCSS3Easing[e.st.easeInOut],e._thumbsContainer.css(h),e._setThumbsPosition(a)):(h[e._thumbsHorizontal?e._xProp:e._yProp]=a+"px",e._thumbsContainer.animate(h,d,b?"easeOutCubic":e.st.easeInOut));c&&(e._thumbsPosition=c);e._updateThumbsArrows();e._thumbsAnimTimeout=setTimeout(function(){e._isThumbsAnimating=!1;f&&(e._animateThumbsTo(c,f,!0),f=null)},d)}},_updateThumbsArrows:function(){this._thumbsArrows&&(this._thumbsPosition===
this._thumbsMinPosition?this._thumbsArrowLeft.addClass("rsThumbsArrowDisabled"):this._thumbsArrowLeft.removeClass("rsThumbsArrowDisabled"),this._thumbsPosition===this._thumbsMaxPosition?this._thumbsArrowRight.addClass("rsThumbsArrowDisabled"):this._thumbsArrowRight.removeClass("rsThumbsArrowDisabled"))},_setCurrentThumb:function(a,d){var b=0,c=a*this._thumbSize+2*this._thumbSize-this._thumbsSpacing+this._thumbsMinPosition;if(this._thumbsNavigation){this._firstThumbMoved&&(d=!0,this._firstThumbMoved=
!1);if(c+this._thumbsPosition>this._thumbsViewportSize){a===this.numSlides-1&&(b=1);var f=-a+this._visibleThumbsPerView-2+b;f=f*this._thumbSize+this._thumbsViewportSize%this._thumbSize+this._thumbsSpacing-this._thumbsMinPosition}else 0!==a?(a-1)*this._thumbSize<=-this._thumbsPosition+this._thumbsMinPosition&&a-1<=this.numSlides-this._visibleThumbsPerView&&(f=(-a+1)*this._thumbSize+this._thumbsMinPosition):f=this._thumbsMinPosition;f!==this._thumbsPosition&&(b=void 0===f?this._thumbsPosition:f,b>this._thumbsMinPosition?
this._setThumbsPosition(this._thumbsMinPosition):b<this._thumbsMaxPosition?this._setThumbsPosition(this._thumbsMaxPosition):void 0!==f&&(d?this._setThumbsPosition(f):this._animateThumbsTo(f)));this._updateThumbsArrows()}}});g.rsModules.thumbnails=g.rsProto._initThumbs})(jQuery);// jquery.rs.tabs v1.0.2
(function(e){e.extend(e.rsProto,{_initTabs:function(){var a=this;"tabs"===a.st.controlNavigation&&(a.ev.on("rsBeforeParseNode",function(a,d,b){d=e(d);b.thumbnail=d.find(".rsTmb").remove();b.thumbnail.length?b.thumbnail=e(document.createElement("div")).append(b.thumbnail).html():(b.thumbnail=d.attr("data-rsTmb"),b.thumbnail||(b.thumbnail=d.find(".rsImg").attr("data-rsTmb")),b.thumbnail=b.thumbnail?'<img src="'+b.thumbnail+'"/>':"")}),a.ev.one("rsAfterPropsSetup",function(){a._createTabs()}),a.ev.on("rsOnAppendSlide",
function(c,d,b){b>=a.numSlides?a._controlNav.append('<div class="rsNavItem rsTab">'+d.thumbnail+"</div>"):a._controlNavItems.eq(b).before('<div class="rsNavItem rsTab">'+item.thumbnail+"</div>");a._controlNavItems=a._controlNav.children()}),a.ev.on("rsOnRemoveSlide",function(c,d){var b=a._controlNavItems.eq(d);b&&(b.remove(),a._controlNavItems=a._controlNav.children())}),a.ev.on("rsOnUpdateNav",function(){var c=a.currSlideId;a._prevNavItem&&a._prevNavItem.removeClass("rsNavSelected");c=a._controlNavItems.eq(c);
c.addClass("rsNavSelected");a._prevNavItem=c}))},_createTabs:function(){var a=this;a._controlNavEnabled=!0;var c='<div class="rsNav rsTabs">';for(var d=0;d<a.numSlides;d++)c+='<div class="rsNavItem rsTab">'+a.slides[d].thumbnail+"</div>";c=e(c+"</div>");a._controlNav=c;a._controlNavItems=c.children(".rsNavItem");a.slider.append(c);a._controlNav.click(function(b){b=e(b.target).closest(".rsNavItem");b.length&&a.goTo(b.index())})}});e.rsModules.tabs=e.rsProto._initTabs})(jQuery);// jquery.rs.fullscreen v1.0.6
(function(c){c.extend(c.rsProto,{_initFullscreen:function(){var a=this;a._fullscreenDefaults={enabled:!1,keyboardNav:!0,buttonFS:!0,nativeFS:!1,doubleTap:!0};a.st.fullscreen=c.extend({},a._fullscreenDefaults,a.st.fullscreen);if(a.st.fullscreen.enabled)a.ev.one("rsBeforeSizeSet",function(){a._setupFullscreen()})},_setupFullscreen:function(){var a=this;a._fsKeyboard=!a.st.keyboardNavEnabled&&a.st.fullscreen.keyboardNav;if(a.st.fullscreen.nativeFS){var b={supportsFullScreen:!1,isFullScreen:function(){return!1},
requestFullScreen:function(){},cancelFullScreen:function(){},fullScreenEventName:"",prefix:""},d=["webkit","moz","o","ms","khtml"];if("undefined"!=typeof document.cancelFullScreen)b.supportsFullScreen=!0;else for(var e=0,f=d.length;e<f;e++)if(b.prefix=d[e],"undefined"!=typeof document[b.prefix+"CancelFullScreen"]){b.supportsFullScreen=!0;break}b.supportsFullScreen?(a.nativeFS=!0,b.fullScreenEventName=b.prefix+"fullscreenchange"+a.ns,b.isFullScreen=function(){switch(this.prefix){case "":return document.fullScreen;
case "webkit":return document.webkitIsFullScreen;default:return document[this.prefix+"FullScreen"]}},b.requestFullScreen=function(a){return""===this.prefix?a.requestFullScreen():a[this.prefix+"RequestFullScreen"]()},b.cancelFullScreen=function(a){return""===this.prefix?document.cancelFullScreen():document[this.prefix+"CancelFullScreen"]()},a._fullScreenApi=b):a._fullScreenApi=!1}a.st.fullscreen.buttonFS&&(a._fsBtn=c('<div class="rsFullscreenBtn"><div class="rsFullscreenIcn"></div></div>').appendTo(a._controlsContainer).on("click.rs",
function(){a.isFullscreen?a.exitFullscreen():a.enterFullscreen()}))},enterFullscreen:function(a){var b=this;if(b._fullScreenApi)if(a)b._fullScreenApi.requestFullScreen(c("html")[0]);else{b._doc.on(b._fullScreenApi.fullScreenEventName,function(a){b._fullScreenApi.isFullScreen()?b.enterFullscreen(!0):b.exitFullscreen(!0)});b._fullScreenApi.requestFullScreen(c("html")[0]);return}if(!b._isFullscreenUpdating){b._isFullscreenUpdating=!0;b._doc.on("keyup"+b.ns+"fullscreen",function(a){27===a.keyCode&&b.exitFullscreen()});
b._fsKeyboard&&b._bindKeyboardNav();a=c(window);b._fsScrollTopOnEnter=a.scrollTop();b._fsScrollLeftOnEnter=a.scrollLeft();b._htmlStyle=c("html").attr("style");b._bodyStyle=c("body").attr("style");b._sliderStyle=b.slider.attr("style");c("body, html").css({overflow:"hidden",height:"100%",width:"100%",margin:"0",padding:"0"});b.slider.addClass("rsFullscreen");var d;for(d=0;d<b.numSlides;d++)a=b.slides[d],a.isRendered=!1,a.bigImage&&(a.isBig=!0,a.isMedLoaded=a.isLoaded,a.isMedLoading=a.isLoading,a.medImage=
a.image,a.medIW=a.iW,a.medIH=a.iH,a.slideId=-99,a.bigImage!==a.medImage&&(a.sizeType="big"),a.isLoaded=a.isBigLoaded,a.isLoading=!1,a.image=a.bigImage,a.images[0]=a.bigImage,a.iW=a.bigIW,a.iH=a.bigIH,a.isAppended=a.contentAdded=!1,b._updateItemSrc(a));b.isFullscreen=!0;b._isFullscreenUpdating=!1;b.updateSliderSize();b.ev.trigger("rsEnterFullscreen")}},exitFullscreen:function(a){var b=this;if(b._fullScreenApi){if(!a){b._fullScreenApi.cancelFullScreen(c("html")[0]);return}b._doc.off(b._fullScreenApi.fullScreenEventName)}if(!b._isFullscreenUpdating){b._isFullscreenUpdating=
!0;b._doc.off("keyup"+b.ns+"fullscreen");b._fsKeyboard&&b._doc.off("keydown"+b.ns);c("html").attr("style",b._htmlStyle||"");c("body").attr("style",b._bodyStyle||"");var d;for(d=0;d<b.numSlides;d++)a=b.slides[d],a.isRendered=!1,a.bigImage&&(a.isBig=!1,a.slideId=-99,a.isBigLoaded=a.isLoaded,a.isBigLoading=a.isLoading,a.bigImage=a.image,a.bigIW=a.iW,a.bigIH=a.iH,a.isLoaded=a.isMedLoaded,a.isLoading=!1,a.image=a.medImage,a.images[0]=a.medImage,a.iW=a.medIW,a.iH=a.medIH,a.isAppended=a.contentAdded=!1,
b._updateItemSrc(a,!0),a.bigImage!==a.medImage&&(a.sizeType="med"));b.isFullscreen=!1;a=c(window);a.scrollTop(b._fsScrollTopOnEnter);a.scrollLeft(b._fsScrollLeftOnEnter);b._isFullscreenUpdating=!1;b.slider.removeClass("rsFullscreen");b.updateSliderSize();setTimeout(function(){b.updateSliderSize()},1);b.ev.trigger("rsExitFullscreen")}},_updateItemSrc:function(a,b){var d=a.isLoaded||a.isLoading?'<img class="rsImg rsMainSlideImage" src="'+a.image+'"/>':'<a class="rsImg rsMainSlideImage" href="'+a.image+
'"></a>';a.content.hasClass("rsImg")?a.content=c(d):a.content.find(".rsImg").eq(0).replaceWith(d);a.isLoaded||a.isLoading||!a.holder||a.holder.html(a.content)}});c.rsModules.fullscreen=c.rsProto._initFullscreen})(jQuery);// jquery.rs.autoplay v1.0.5
(function(b){b.extend(b.rsProto,{_initAutoplay:function(){var a=this,d;a._autoPlayDefaults={enabled:!1,stopAtAction:!0,pauseOnHover:!0,delay:2E3};!a.st.autoPlay&&a.st.autoplay&&(a.st.autoPlay=a.st.autoplay);a.st.autoPlay=b.extend({},a._autoPlayDefaults,a.st.autoPlay);a.st.autoPlay.enabled&&(a.ev.on("rsBeforeParseNode",function(a,c,f){c=b(c);if(d=c.attr("data-rsDelay"))f.customDelay=parseInt(d,10)}),a.ev.one("rsAfterInit",function(){a._setupAutoPlay()}),a.ev.on("rsBeforeDestroy",function(){a.stopAutoPlay();
a.slider.off("mouseenter mouseleave");b(window).off("blur"+a.ns+" focus"+a.ns)}))},_setupAutoPlay:function(){var a=this;a.startAutoPlay();a.ev.on("rsAfterContentSet",function(b,e){a._isDragging||a._isAnimating||!a._autoPlayEnabled||e!==a.currSlide||a._play()});a.ev.on("rsDragRelease",function(){a._autoPlayEnabled&&a._autoPlayPaused&&(a._autoPlayPaused=!1,a._play())});a.ev.on("rsAfterSlideChange",function(){a._autoPlayEnabled&&a._autoPlayPaused&&(a._autoPlayPaused=!1,a.currSlide.isLoaded&&a._play())});
a.ev.on("rsDragStart",function(){a._autoPlayEnabled&&(a.st.autoPlay.stopAtAction?a.stopAutoPlay():(a._autoPlayPaused=!0,a._pause()))});a.ev.on("rsBeforeMove",function(b,e,c){a._autoPlayEnabled&&(c&&a.st.autoPlay.stopAtAction?a.stopAutoPlay():(a._autoPlayPaused=!0,a._pause()))});a._pausedByVideo=!1;a.ev.on("rsVideoStop",function(){a._autoPlayEnabled&&(a._pausedByVideo=!1,a._play())});a.ev.on("rsVideoPlay",function(){a._autoPlayEnabled&&(a._autoPlayPaused=!1,a._pause(),a._pausedByVideo=!0)});b(window).on("blur"+
a.ns,function(){a._autoPlayEnabled&&(a._autoPlayPaused=!0,a._pause())}).on("focus"+a.ns,function(){a._autoPlayEnabled&&a._autoPlayPaused&&(a._autoPlayPaused=!1,a._play())});a.st.autoPlay.pauseOnHover&&(a._pausedByHover=!1,a.slider.hover(function(){a._autoPlayEnabled&&(a._autoPlayPaused=!1,a._pause(),a._pausedByHover=!0)},function(){a._autoPlayEnabled&&(a._pausedByHover=!1,a._play())}))},toggleAutoPlay:function(){this._autoPlayEnabled?this.stopAutoPlay():this.startAutoPlay()},startAutoPlay:function(){this._autoPlayEnabled=
!0;this.currSlide.isLoaded&&this._play()},stopAutoPlay:function(){this._pausedByVideo=this._pausedByHover=this._autoPlayPaused=this._autoPlayEnabled=!1;this._pause()},_play:function(){var a=this;a._pausedByHover||a._pausedByVideo||(a._autoPlayRunning=!0,a._autoPlayTimeout&&clearTimeout(a._autoPlayTimeout),a._autoPlayTimeout=setTimeout(function(){if(!a._loop&&!a.st.loopRewind){var b=!0;a.st.loopRewind=!0}a.next(!0);b&&(a.st.loopRewind=!1)},a.currSlide.customDelay?a.currSlide.customDelay:a.st.autoPlay.delay))},
_pause:function(){this._pausedByHover||this._pausedByVideo||(this._autoPlayRunning=!1,this._autoPlayTimeout&&(clearTimeout(this._autoPlayTimeout),this._autoPlayTimeout=null))}});b.rsModules.autoplay=b.rsProto._initAutoplay})(jQuery);// jquery.rs.video v1.1.3
(function(f){f.extend(f.rsProto,{_initVideo:function(){var a=this;a._videoDefaults={autoHideArrows:!0,autoHideControlNav:!1,autoHideBlocks:!1,autoHideCaption:!1,disableCSS3inFF:!0,youTubeCode:'<iframe src="https://www.youtube.com/embed/%id%?rel=1&showinfo=0&autoplay=1&wmode=transparent" frameborder="no"></iframe>',vimeoCode:'<iframe src="https://player.vimeo.com/video/%id%?byline=0&portrait=0&autoplay=1" frameborder="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>'};a.st.video=
f.extend({},a._videoDefaults,a.st.video);a.ev.on("rsBeforeSizeSet",function(){a._isVideoPlaying&&setTimeout(function(){var b=a._currHolder;b=b.hasClass("rsVideoContainer")?b:b.find(".rsVideoContainer");a._videoFrameHolder&&a._videoFrameHolder.css({width:b.width(),height:b.height()})},32)});var d=a._browser.mozilla;a.ev.on("rsAfterParseNode",function(b,c,e){b=f(c);if(e.videoURL){a.st.video.disableCSS3inFF&&d&&(a._useCSS3Transitions=a._use3dTransform=!1);c=f('<div class="rsVideoContainer"></div>');
var g=f('<div class="rsBtnCenterer"><div class="rsPlayBtn"><div class="rsPlayBtnIcon"></div></div></div>');b.hasClass("rsImg")?e.content=c.append(b).append(g):e.content.find(".rsImg").wrap(c).after(g)}});a.ev.on("rsAfterSlideChange",function(){a.stopVideo()})},toggleVideo:function(){return this._isVideoPlaying?this.stopVideo():this.playVideo()},playVideo:function(){var a=this;if(!a._isVideoPlaying){var d=a.currSlide;if(!d.videoURL)return!1;a._playingVideoSlide=d;var b=a._currVideoContent=d.content;
d=d.videoURL;var c;if(d.match(/youtu\.be/i)||d.match(/youtube\.com/i)){var e=/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&\?]*).*/;(e=d.match(e))&&11==e[2].length&&(c=e[2]);void 0!==c&&(a._videoFrameHolder=a.st.video.youTubeCode.replace("%id%",c))}else d.match(/vimeo\.com/i)&&(e=/(www\.)?vimeo.com\/(\d+)($|\/)/,(e=d.match(e))&&(c=e[2]),void 0!==c&&(a._videoFrameHolder=a.st.video.vimeoCode.replace("%id%",c)));a.videoObj=f(a._videoFrameHolder);a.ev.trigger("rsOnCreateVideoElement",[d]);a.videoObj.length&&
(a._videoFrameHolder=f('<div class="rsVideoFrameHolder"><div class="rsPreloader"></div><div class="rsCloseVideoBtn"><div class="rsCloseVideoIcn"></div></div></div>'),a._videoFrameHolder.find(".rsPreloader").after(a.videoObj),b=b.hasClass("rsVideoContainer")?b:b.find(".rsVideoContainer"),a._videoFrameHolder.css({width:b.width(),height:b.height()}).find(".rsCloseVideoBtn").off("click.rsv").on("click.rsv",function(b){a.stopVideo();b.preventDefault();b.stopPropagation();return!1}),b.append(a._videoFrameHolder),
a.isIPAD&&b.addClass("rsIOSVideo"),a._toggleHiddenClass(!1),setTimeout(function(){a._videoFrameHolder.addClass("rsVideoActive")},10),a.ev.trigger("rsVideoPlay"),a._isVideoPlaying=!0);return!0}return!1},stopVideo:function(){var a=this;return a._isVideoPlaying?(a.isIPAD&&a.slider.find(".rsCloseVideoBtn").remove(),a._toggleHiddenClass(!0),setTimeout(function(){a.ev.trigger("rsOnDestroyVideoElement",[a.videoObj]);var d=a._videoFrameHolder.find("iframe");if(d.length)try{d.attr("src","")}catch(b){}a._videoFrameHolder.remove();
a._videoFrameHolder=null},16),a.ev.trigger("rsVideoStop"),a._isVideoPlaying=!1,!0):!1},_toggleHiddenClass:function(a,d){var b=[],c=this.st.video;c.autoHideArrows&&(this._arrowLeft&&(b.push(this._arrowLeft,this._arrowRight),this._arrowsAutoHideLocked=!a),this._fsBtn&&b.push(this._fsBtn));c.autoHideControlNav&&this._controlNav&&b.push(this._controlNav);c.autoHideBlocks&&this._playingVideoSlide.animBlocks&&b.push(this._playingVideoSlide.animBlocks);c.autoHideCaption&&this.globalCaption&&b.push(this.globalCaption);
this.slider[a?"removeClass":"addClass"]("rsVideoPlaying");if(b.length)for(c=0;c<b.length;c++)a?b[c].removeClass("rsHidden"):b[c].addClass("rsHidden")}});f.rsModules.video=f.rsProto._initVideo})(jQuery);// jquery.rs.animated-blocks v1.0.7
(function(k){k.extend(k.rsProto,{_initAnimatedBlocks:function(){function m(){var f=a.currSlide;if(a.currSlide&&a.currSlide.isLoaded&&a._slideWithBlocks!==f){if(0<a._animatedBlockTimeouts.length){for(b=0;b<a._animatedBlockTimeouts.length;b++)clearTimeout(a._animatedBlockTimeouts[b]);a._animatedBlockTimeouts=[]}if(0<a._blockAnimProps.length){var g;for(b=0;b<a._blockAnimProps.length;b++)if(g=a._blockAnimProps[b])a._useCSS3Transitions?(g.block.css(a._vendorPref+a._TD,"0s"),g.block.css(g.css)):g.block.stop(!0).css(g.css),
a._slideWithBlocks=null,f.animBlocksDisplayed=!1;a._blockAnimProps=[]}f.animBlocks&&(f.animBlocksDisplayed=!0,a._slideWithBlocks=f,a._animateBlocks(f.animBlocks))}}var a=this,b;a._blockDefaults={fadeEffect:!0,moveEffect:"top",moveOffset:20,speed:400,easing:"easeOutSine",delay:200};a.st.block=k.extend({},a._blockDefaults,a.st.block);a._blockAnimProps=[];a._animatedBlockTimeouts=[];a.ev.on("rsAfterInit",function(){m()});a.ev.on("rsBeforeParseNode",function(a,b,d){b=k(b);d.animBlocks=b.find(".rsABlock").css("display",
"none");d.animBlocks.length||(b.hasClass("rsABlock")?d.animBlocks=b.css("display","none"):d.animBlocks=!1)});a.ev.on("rsAfterContentSet",function(b,g){g.id===a.slides[a.currSlideId].id&&setTimeout(function(){m()},a.st.fadeinLoadedSlide?300:0)});a.ev.on("rsAfterSlideChange",function(){m()})},_updateAnimBlockProps:function(k,a){setTimeout(function(){k.css(a)},6)},_animateBlocks:function(m){var a=this,b,f,g,d,h,e,n;a._animatedBlockTimeouts=[];m.each(function(m){b=k(this);f={};g={};d=null;var c=b.attr("data-move-offset");
c=c?parseInt(c,10):a.st.block.moveOffset;if(0<c&&((e=b.data("move-effect"))?(e=e.toLowerCase(),"none"===e?e=!1:"left"!==e&&"top"!==e&&"bottom"!==e&&"right"!==e&&(e=a.st.block.moveEffect,"none"===e&&(e=!1))):e=a.st.block.moveEffect,e&&"none"!==e)){var p="right"===e||"left"===e?!0:!1;n=!1;if(a._useCSS3Transitions){var l=0;h=a._xProp}else p?isNaN(parseInt(b.css("right"),10))?h="left":(h="right",n=!0):isNaN(parseInt(b.css("bottom"),10))?h="top":(h="bottom",n=!0),h="margin-"+h,n&&(c=-c),a._useCSS3Transitions?
l=parseInt(b.css(h),10):(l=b.data("rs-start-move-prop"),void 0===l&&(l=parseInt(b.css(h),10),isNaN(l)&&(l=0),b.data("rs-start-move-prop",l)));g[h]=a._getCSS3Prop("top"===e||"left"===e?l-c:l+c,p);f[h]=a._getCSS3Prop(l,p)}c=b.attr("data-fade-effect");if(!c)c=a.st.block.fadeEffect;else if("none"===c.toLowerCase()||"false"===c.toLowerCase())c=!1;c&&(g.opacity=0,f.opacity=1);if(c||e)d={},d.hasFade=!!c,e&&(d.moveProp=h,d.hasMove=!0),d.speed=b.data("speed"),isNaN(d.speed)&&(d.speed=a.st.block.speed),d.easing=
b.data("easing"),d.easing||(d.easing=a.st.block.easing),d.css3Easing=k.rsCSS3Easing[d.easing],d.delay=b.data("delay"),isNaN(d.delay)&&(d.delay=a.st.block.delay*m);c={};a._useCSS3Transitions&&(c[a._vendorPref+a._TD]="0ms");c.moveProp=f.moveProp;c.opacity=f.opacity;c.display="none";a._blockAnimProps.push({block:b,css:c});a._updateAnimBlockProps(b,g);a._animatedBlockTimeouts.push(setTimeout(function(b,d,c,e){return function(){b.css("display","block");if(c){var f={};if(a._useCSS3Transitions){var g="";
c.hasMove&&(g+=c.moveProp);c.hasFade&&(c.hasMove&&(g+=", "),g+="opacity");f[a._vendorPref+a._TP]=g;f[a._vendorPref+a._TD]=c.speed+"ms";f[a._vendorPref+a._TTF]=c.css3Easing;b.css(f);setTimeout(function(){b.css(d)},24)}else setTimeout(function(){b.animate(d,c.speed,c.easing)},16)}delete a._animatedBlockTimeouts[e]}}(b,f,d,m),6>=d.delay?12:d.delay))})}});k.rsModules.animatedBlocks=k.rsProto._initAnimatedBlocks})(jQuery);// jquery.rs.auto-height v1.0.3
(function(b){b.extend(b.rsProto,{_initAutoHeight:function(){var a=this;if(a.st.autoHeight){var b,c,e,f=!0,d=function(d){e=a.slides[a.currSlideId];(b=e.holder)&&(c=b.height())&&void 0!==c&&c>(a.st.minAutoHeight||30)&&(a._wrapHeight=c,a._useCSS3Transitions||!d?a._sliderOverflow.css("height",c):a._sliderOverflow.stop(!0,!0).animate({height:c},a.st.transitionSpeed),a.ev.trigger("rsAutoHeightChange",c),f&&(a._useCSS3Transitions&&setTimeout(function(){a._sliderOverflow.css(a._vendorPref+"transition","height "+
a.st.transitionSpeed+"ms ease-in-out")},16),f=!1))};a.ev.on("rsMaybeSizeReady.rsAutoHeight",function(a,b){e===b&&d()});a.ev.on("rsAfterContentSet.rsAutoHeight",function(a,b){e===b&&d()});a.slider.addClass("rsAutoHeight");a.ev.one("rsAfterInit",function(){setTimeout(function(){d(!1);setTimeout(function(){a.slider.append('<div style="clear:both; float: none;"></div>')},16)},16)});a.ev.on("rsBeforeAnimStart",function(){d(!0)});a.ev.on("rsBeforeSizeSet",function(){setTimeout(function(){d(!1)},16)})}}});
b.rsModules.autoHeight=b.rsProto._initAutoHeight})(jQuery);// jquery.rs.global-caption v1.0.1
(function(b){b.extend(b.rsProto,{_initGlobalCaption:function(){var a=this;a.st.globalCaption&&(a.ev.on("rsAfterInit",function(){a.globalCaption=b('<div class="rsGCaption"></div>').appendTo(a.st.globalCaptionInside?a._sliderOverflow:a.slider);a.globalCaption.html(a.currSlide.caption||"")}),a.ev.on("rsBeforeAnimStart",function(){a.globalCaption.html(a.currSlide.caption||"")}))}});b.rsModules.globalCaption=b.rsProto._initGlobalCaption})(jQuery);// jquery.rs.active-class v1.0.1
(function(c){c.rsProto._initActiveClass=function(){var b,a=this;if(a.st.addActiveClass)a.ev.on("rsOnUpdateNav",function(){b&&clearTimeout(b);b=setTimeout(function(){a._oldHolder&&a._oldHolder.removeClass("rsActiveSlide");a._currHolder&&a._currHolder.addClass("rsActiveSlide");b=null},50)})};c.rsModules.activeClass=c.rsProto._initActiveClass})(jQuery);
// jquery.rs.deeplinking v1.0.6 + jQuery hashchange plugin v1.3 Copyright (c) 2010 Ben Alman
(function(b){b.extend(b.rsProto,{_initDeeplinking:function(){var a=this,h,d,f;a._hashDefaults={enabled:!1,change:!1,prefix:""};a.st.deeplinking=b.extend({},a._hashDefaults,a.st.deeplinking);if(a.st.deeplinking.enabled){var e=a.st.deeplinking.change,c=a.st.deeplinking.prefix,k="#"+c,g=function(){var a=window.location.hash;return a&&0<a.indexOf(c)&&(a=parseInt(a.substring(k.length),10),0<=a)?a-1:-1},l=g();-1!==l&&(a.st.startSlideId=l);e&&(b(window).on("hashchange"+a.ns,function(b){h||(b=g(),0>b||(b>
a.numSlides-1&&(b=a.numSlides-1),a.goTo(b)))}),a.ev.on("rsBeforeAnimStart",function(){d&&clearTimeout(d);f&&clearTimeout(f)}),a.ev.on("rsAfterSlideChange",function(){d&&clearTimeout(d);f&&clearTimeout(f);f=setTimeout(function(){h=!0;window.location.replace((""+window.location).split("#")[0]+k+(a.currSlideId+1));d=setTimeout(function(){h=!1;d=null},60)},400)}));a.ev.on("rsBeforeDestroy",function(){d=f=null;e&&b(window).off("hashchange"+a.ns)})}}});b.rsModules.deeplinking=b.rsProto._initDeeplinking})(jQuery);
(function(b,a,h){function d(a){a=a||location.href;return"#"+a.replace(/^[^#]*#?(.*)$/,"$1")}"$:nomunge";var f=document,e=b.event.special,c=f.documentMode,k="onhashchange"in a&&(c===h||7<c);b.fn.hashchange=function(a){return a?this.bind("hashchange",a):this.trigger("hashchange")};b.fn.hashchange.delay=50;e.hashchange=b.extend(e.hashchange,{setup:function(){if(k)return!1;b(g.start)},teardown:function(){if(k)return!1;b(g.stop)}});var g=function(){function l(){var f=d(),e=p(g);f!==g?(m(g=f,e),b(a).trigger("hashchange")):
e!==g&&(location.href=location.href.replace(/#.*/,"")+e);c=setTimeout(l,b.fn.hashchange.delay)}var e={},c,g=d(),n=function(a){return a},m=n,p=n;e.start=function(){c||l()};e.stop=function(){c&&clearTimeout(c);c=h};a.attachEvent&&!a.addEventListener&&!k&&function(){var a,c;e.start=function(){a||(c=(c=b.fn.hashchange.src)&&c+d(),a=b('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){c||m(d());l()}).attr("src",c||"javascript:0").insertAfter("body")[0].contentWindow,f.onpropertychange=
function(){try{"title"===event.propertyName&&(a.document.title=f.title)}catch(q){}})};e.stop=n;p=function(){return d(a.location.href)};m=function(c,e){var d=a.document,g=b.fn.hashchange.domain;c!==e&&(d.title=f.title,d.open(),g&&d.write('<script>document.domain="'+g+'"\x3c/script>'),d.close(),a.location.hash=c)}}();return e}()})(jQuery,this);// jquery.rs.visible-nearby v1.0.2
(function(d){d.rsProto._initVisibleNearby=function(){var a=this;a.st.visibleNearby&&a.st.visibleNearby.enabled&&(a._vnDefaults={enabled:!0,centerArea:.6,center:!0,breakpoint:0,breakpointCenterArea:.8,hiddenOverflow:!0,navigateByCenterClick:!1},a.st.visibleNearby=d.extend({},a._vnDefaults,a.st.visibleNearby),a.ev.one("rsAfterPropsSetup",function(){a._sliderVisibleNearbyWrap=a._sliderOverflow.css("overflow","visible").wrap('<div class="rsVisibleNearbyWrap"></div>').parent();a.st.visibleNearby.hiddenOverflow||
a._sliderVisibleNearbyWrap.css("overflow","visible");a._controlsContainer=a.st.controlsInside?a._sliderVisibleNearbyWrap:a.slider}),a.ev.on("rsAfterSizePropSet",function(){var c=a.st.visibleNearby;var b=c.breakpoint&&a.width<c.breakpoint?c.breakpointCenterArea:c.centerArea;a._slidesHorizontal?(a._wrapWidth*=b,a._sliderVisibleNearbyWrap.css({height:a._wrapHeight,width:a._wrapWidth/b}),a._minPosOffset=a._wrapWidth*(1-b)/2/b):(a._wrapHeight*=b,a._sliderVisibleNearbyWrap.css({height:a._wrapHeight/b,width:a._wrapWidth}),
a._minPosOffset=a._wrapHeight*(1-b)/2/b);c.navigateByCenterClick||(a._nextSlidePos=a._slidesHorizontal?a._wrapWidth:a._wrapHeight);c.center&&a._sliderOverflow.css("margin-"+(a._slidesHorizontal?"left":"top"),a._minPosOffset)}))};d.rsModules.visibleNearby=d.rsProto._initVisibleNearby})(jQuery);
/**
 * Swiper 5.3.0
 * Most modern mobile touch slider and framework with hardware accelerated transitions
 * http://swiperjs.com
 *
 * Copyright 2014-2020 Vladimir Kharlampidi
 *
 * Released under the MIT License
 *
 * Released on: January 30, 2020
 */

!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e=e||self).Swiper=t()}(this,(function(){"use strict";var e="undefined"==typeof document?{body:{},addEventListener:function(){},removeEventListener:function(){},activeElement:{blur:function(){},nodeName:""},querySelector:function(){return null},querySelectorAll:function(){return[]},getElementById:function(){return null},createEvent:function(){return{initEvent:function(){}}},createElement:function(){return{children:[],childNodes:[],style:{},setAttribute:function(){},getElementsByTagName:function(){return[]}}},location:{hash:""}}:document,t="undefined"==typeof window?{document:e,navigator:{userAgent:""},location:{},history:{},CustomEvent:function(){return this},addEventListener:function(){},removeEventListener:function(){},getComputedStyle:function(){return{getPropertyValue:function(){return""}}},Image:function(){},Date:function(){},screen:{},setTimeout:function(){},clearTimeout:function(){}}:window,i=function(e){for(var t=0;t<e.length;t+=1)this[t]=e[t];return this.length=e.length,this};function s(s,a){var n=[],r=0;if(s&&!a&&s instanceof i)return s;if(s)if("string"==typeof s){var l,o,d=s.trim();if(d.indexOf("<")>=0&&d.indexOf(">")>=0){var h="div";for(0===d.indexOf("<li")&&(h="ul"),0===d.indexOf("<tr")&&(h="tbody"),0!==d.indexOf("<td")&&0!==d.indexOf("<th")||(h="tr"),0===d.indexOf("<tbody")&&(h="table"),0===d.indexOf("<option")&&(h="select"),(o=e.createElement(h)).innerHTML=d,r=0;r<o.childNodes.length;r+=1)n.push(o.childNodes[r])}else for(l=a||"#"!==s[0]||s.match(/[ .<>:~]/)?(a||e).querySelectorAll(s.trim()):[e.getElementById(s.trim().split("#")[1])],r=0;r<l.length;r+=1)l[r]&&n.push(l[r])}else if(s.nodeType||s===t||s===e)n.push(s);else if(s.length>0&&s[0].nodeType)for(r=0;r<s.length;r+=1)n.push(s[r]);return new i(n)}function a(e){for(var t=[],i=0;i<e.length;i+=1)-1===t.indexOf(e[i])&&t.push(e[i]);return t}s.fn=i.prototype,s.Class=i,s.Dom7=i;var n={addClass:function(e){if(void 0===e)return this;for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.add(t[i]);return this},removeClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.remove(t[i]);return this},hasClass:function(e){return!!this[0]&&this[0].classList.contains(e)},toggleClass:function(e){for(var t=e.split(" "),i=0;i<t.length;i+=1)for(var s=0;s<this.length;s+=1)void 0!==this[s]&&void 0!==this[s].classList&&this[s].classList.toggle(t[i]);return this},attr:function(e,t){var i=arguments;if(1===arguments.length&&"string"==typeof e)return this[0]?this[0].getAttribute(e):void 0;for(var s=0;s<this.length;s+=1)if(2===i.length)this[s].setAttribute(e,t);else for(var a in e)this[s][a]=e[a],this[s].setAttribute(a,e[a]);return this},removeAttr:function(e){for(var t=0;t<this.length;t+=1)this[t].removeAttribute(e);return this},data:function(e,t){var i;if(void 0!==t){for(var s=0;s<this.length;s+=1)(i=this[s]).dom7ElementDataStorage||(i.dom7ElementDataStorage={}),i.dom7ElementDataStorage[e]=t;return this}if(i=this[0]){if(i.dom7ElementDataStorage&&e in i.dom7ElementDataStorage)return i.dom7ElementDataStorage[e];var a=i.getAttribute("data-"+e);return a||void 0}},transform:function(e){for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransform=e,i.transform=e}return this},transition:function(e){"string"!=typeof e&&(e+="ms");for(var t=0;t<this.length;t+=1){var i=this[t].style;i.webkitTransitionDuration=e,i.transitionDuration=e}return this},on:function(){for(var e,t=[],i=arguments.length;i--;)t[i]=arguments[i];var a=t[0],n=t[1],r=t[2],l=t[3];function o(e){var t=e.target;if(t){var i=e.target.dom7EventData||[];if(i.indexOf(e)<0&&i.unshift(e),s(t).is(n))r.apply(t,i);else for(var a=s(t).parents(),l=0;l<a.length;l+=1)s(a[l]).is(n)&&r.apply(a[l],i)}}function d(e){var t=e&&e.target&&e.target.dom7EventData||[];t.indexOf(e)<0&&t.unshift(e),r.apply(this,t)}"function"==typeof t[1]&&(a=(e=t)[0],r=e[1],l=e[2],n=void 0),l||(l=!1);for(var h,p=a.split(" "),u=0;u<this.length;u+=1){var c=this[u];if(n)for(h=0;h<p.length;h+=1){var v=p[h];c.dom7LiveListeners||(c.dom7LiveListeners={}),c.dom7LiveListeners[v]||(c.dom7LiveListeners[v]=[]),c.dom7LiveListeners[v].push({listener:r,proxyListener:o}),c.addEventListener(v,o,l)}else for(h=0;h<p.length;h+=1){var f=p[h];c.dom7Listeners||(c.dom7Listeners={}),c.dom7Listeners[f]||(c.dom7Listeners[f]=[]),c.dom7Listeners[f].push({listener:r,proxyListener:d}),c.addEventListener(f,d,l)}}return this},off:function(){for(var e,t=[],i=arguments.length;i--;)t[i]=arguments[i];var s=t[0],a=t[1],n=t[2],r=t[3];"function"==typeof t[1]&&(s=(e=t)[0],n=e[1],r=e[2],a=void 0),r||(r=!1);for(var l=s.split(" "),o=0;o<l.length;o+=1)for(var d=l[o],h=0;h<this.length;h+=1){var p=this[h],u=void 0;if(!a&&p.dom7Listeners?u=p.dom7Listeners[d]:a&&p.dom7LiveListeners&&(u=p.dom7LiveListeners[d]),u&&u.length)for(var c=u.length-1;c>=0;c-=1){var v=u[c];n&&v.listener===n?(p.removeEventListener(d,v.proxyListener,r),u.splice(c,1)):n&&v.listener&&v.listener.dom7proxy&&v.listener.dom7proxy===n?(p.removeEventListener(d,v.proxyListener,r),u.splice(c,1)):n||(p.removeEventListener(d,v.proxyListener,r),u.splice(c,1))}}return this},trigger:function(){for(var i=[],s=arguments.length;s--;)i[s]=arguments[s];for(var a=i[0].split(" "),n=i[1],r=0;r<a.length;r+=1)for(var l=a[r],o=0;o<this.length;o+=1){var d=this[o],h=void 0;try{h=new t.CustomEvent(l,{detail:n,bubbles:!0,cancelable:!0})}catch(t){(h=e.createEvent("Event")).initEvent(l,!0,!0),h.detail=n}d.dom7EventData=i.filter((function(e,t){return t>0})),d.dispatchEvent(h),d.dom7EventData=[],delete d.dom7EventData}return this},transitionEnd:function(e){var t,i=["webkitTransitionEnd","transitionend"],s=this;function a(n){if(n.target===this)for(e.call(this,n),t=0;t<i.length;t+=1)s.off(i[t],a)}if(e)for(t=0;t<i.length;t+=1)s.on(i[t],a);return this},outerWidth:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetWidth+parseFloat(t.getPropertyValue("margin-right"))+parseFloat(t.getPropertyValue("margin-left"))}return this[0].offsetWidth}return null},outerHeight:function(e){if(this.length>0){if(e){var t=this.styles();return this[0].offsetHeight+parseFloat(t.getPropertyValue("margin-top"))+parseFloat(t.getPropertyValue("margin-bottom"))}return this[0].offsetHeight}return null},offset:function(){if(this.length>0){var i=this[0],s=i.getBoundingClientRect(),a=e.body,n=i.clientTop||a.clientTop||0,r=i.clientLeft||a.clientLeft||0,l=i===t?t.scrollY:i.scrollTop,o=i===t?t.scrollX:i.scrollLeft;return{top:s.top+l-n,left:s.left+o-r}}return null},css:function(e,i){var s;if(1===arguments.length){if("string"!=typeof e){for(s=0;s<this.length;s+=1)for(var a in e)this[s].style[a]=e[a];return this}if(this[0])return t.getComputedStyle(this[0],null).getPropertyValue(e)}if(2===arguments.length&&"string"==typeof e){for(s=0;s<this.length;s+=1)this[s].style[e]=i;return this}return this},each:function(e){if(!e)return this;for(var t=0;t<this.length;t+=1)if(!1===e.call(this[t],t,this[t]))return this;return this},html:function(e){if(void 0===e)return this[0]?this[0].innerHTML:void 0;for(var t=0;t<this.length;t+=1)this[t].innerHTML=e;return this},text:function(e){if(void 0===e)return this[0]?this[0].textContent.trim():null;for(var t=0;t<this.length;t+=1)this[t].textContent=e;return this},is:function(a){var n,r,l=this[0];if(!l||void 0===a)return!1;if("string"==typeof a){if(l.matches)return l.matches(a);if(l.webkitMatchesSelector)return l.webkitMatchesSelector(a);if(l.msMatchesSelector)return l.msMatchesSelector(a);for(n=s(a),r=0;r<n.length;r+=1)if(n[r]===l)return!0;return!1}if(a===e)return l===e;if(a===t)return l===t;if(a.nodeType||a instanceof i){for(n=a.nodeType?[a]:a,r=0;r<n.length;r+=1)if(n[r]===l)return!0;return!1}return!1},index:function(){var e,t=this[0];if(t){for(e=0;null!==(t=t.previousSibling);)1===t.nodeType&&(e+=1);return e}},eq:function(e){if(void 0===e)return this;var t,s=this.length;return new i(e>s-1?[]:e<0?(t=s+e)<0?[]:[this[t]]:[this[e]])},append:function(){for(var t,s=[],a=arguments.length;a--;)s[a]=arguments[a];for(var n=0;n<s.length;n+=1){t=s[n];for(var r=0;r<this.length;r+=1)if("string"==typeof t){var l=e.createElement("div");for(l.innerHTML=t;l.firstChild;)this[r].appendChild(l.firstChild)}else if(t instanceof i)for(var o=0;o<t.length;o+=1)this[r].appendChild(t[o]);else this[r].appendChild(t)}return this},prepend:function(t){var s,a;for(s=0;s<this.length;s+=1)if("string"==typeof t){var n=e.createElement("div");for(n.innerHTML=t,a=n.childNodes.length-1;a>=0;a-=1)this[s].insertBefore(n.childNodes[a],this[s].childNodes[0])}else if(t instanceof i)for(a=0;a<t.length;a+=1)this[s].insertBefore(t[a],this[s].childNodes[0]);else this[s].insertBefore(t,this[s].childNodes[0]);return this},next:function(e){return this.length>0?e?this[0].nextElementSibling&&s(this[0].nextElementSibling).is(e)?new i([this[0].nextElementSibling]):new i([]):this[0].nextElementSibling?new i([this[0].nextElementSibling]):new i([]):new i([])},nextAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.nextElementSibling;){var n=a.nextElementSibling;e?s(n).is(e)&&t.push(n):t.push(n),a=n}return new i(t)},prev:function(e){if(this.length>0){var t=this[0];return e?t.previousElementSibling&&s(t.previousElementSibling).is(e)?new i([t.previousElementSibling]):new i([]):t.previousElementSibling?new i([t.previousElementSibling]):new i([])}return new i([])},prevAll:function(e){var t=[],a=this[0];if(!a)return new i([]);for(;a.previousElementSibling;){var n=a.previousElementSibling;e?s(n).is(e)&&t.push(n):t.push(n),a=n}return new i(t)},parent:function(e){for(var t=[],i=0;i<this.length;i+=1)null!==this[i].parentNode&&(e?s(this[i].parentNode).is(e)&&t.push(this[i].parentNode):t.push(this[i].parentNode));return s(a(t))},parents:function(e){for(var t=[],i=0;i<this.length;i+=1)for(var n=this[i].parentNode;n;)e?s(n).is(e)&&t.push(n):t.push(n),n=n.parentNode;return s(a(t))},closest:function(e){var t=this;return void 0===e?new i([]):(t.is(e)||(t=t.parents(e).eq(0)),t)},find:function(e){for(var t=[],s=0;s<this.length;s+=1)for(var a=this[s].querySelectorAll(e),n=0;n<a.length;n+=1)t.push(a[n]);return new i(t)},children:function(e){for(var t=[],n=0;n<this.length;n+=1)for(var r=this[n].childNodes,l=0;l<r.length;l+=1)e?1===r[l].nodeType&&s(r[l]).is(e)&&t.push(r[l]):1===r[l].nodeType&&t.push(r[l]);return new i(a(t))},filter:function(e){for(var t=[],s=0;s<this.length;s+=1)e.call(this[s],s,this[s])&&t.push(this[s]);return new i(t)},remove:function(){for(var e=0;e<this.length;e+=1)this[e].parentNode&&this[e].parentNode.removeChild(this[e]);return this},add:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,a;for(i=0;i<e.length;i+=1){var n=s(e[i]);for(a=0;a<n.length;a+=1)this[this.length]=n[a],this.length+=1}return this},styles:function(){return this[0]?t.getComputedStyle(this[0],null):{}}};Object.keys(n).forEach((function(e){s.fn[e]=s.fn[e]||n[e]}));var r={deleteProps:function(e){var t=e;Object.keys(t).forEach((function(e){try{t[e]=null}catch(e){}try{delete t[e]}catch(e){}}))},nextTick:function(e,t){return void 0===t&&(t=0),setTimeout(e,t)},now:function(){return Date.now()},getTranslate:function(e,i){var s,a,n;void 0===i&&(i="x");var r=t.getComputedStyle(e,null);return t.WebKitCSSMatrix?((a=r.transform||r.webkitTransform).split(",").length>6&&(a=a.split(", ").map((function(e){return e.replace(",",".")})).join(", ")),n=new t.WebKitCSSMatrix("none"===a?"":a)):s=(n=r.MozTransform||r.OTransform||r.MsTransform||r.msTransform||r.transform||r.getPropertyValue("transform").replace("translate(","matrix(1, 0, 0, 1,")).toString().split(","),"x"===i&&(a=t.WebKitCSSMatrix?n.m41:16===s.length?parseFloat(s[12]):parseFloat(s[4])),"y"===i&&(a=t.WebKitCSSMatrix?n.m42:16===s.length?parseFloat(s[13]):parseFloat(s[5])),a||0},parseUrlQuery:function(e){var i,s,a,n,r={},l=e||t.location.href;if("string"==typeof l&&l.length)for(n=(s=(l=l.indexOf("?")>-1?l.replace(/\S*\?/,""):"").split("&").filter((function(e){return""!==e}))).length,i=0;i<n;i+=1)a=s[i].replace(/#\S+/g,"").split("="),r[decodeURIComponent(a[0])]=void 0===a[1]?void 0:decodeURIComponent(a[1])||"";return r},isObject:function(e){return"object"==typeof e&&null!==e&&e.constructor&&e.constructor===Object},extend:function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];for(var i=Object(e[0]),s=1;s<e.length;s+=1){var a=e[s];if(null!=a)for(var n=Object.keys(Object(a)),l=0,o=n.length;l<o;l+=1){var d=n[l],h=Object.getOwnPropertyDescriptor(a,d);void 0!==h&&h.enumerable&&(r.isObject(i[d])&&r.isObject(a[d])?r.extend(i[d],a[d]):!r.isObject(i[d])&&r.isObject(a[d])?(i[d]={},r.extend(i[d],a[d])):i[d]=a[d])}}return i}},l={touch:t.Modernizr&&!0===t.Modernizr.touch||!!(t.navigator.maxTouchPoints>0||"ontouchstart"in t||t.DocumentTouch&&e instanceof t.DocumentTouch),pointerEvents:!!t.PointerEvent&&"maxTouchPoints"in t.navigator&&t.navigator.maxTouchPoints>0,observer:"MutationObserver"in t||"WebkitMutationObserver"in t,passiveListener:function(){var e=!1;try{var i=Object.defineProperty({},"passive",{get:function(){e=!0}});t.addEventListener("testPassiveListener",null,i)}catch(e){}return e}(),gestures:"ongesturestart"in t},o=function(e){void 0===e&&(e={});var t=this;t.params=e,t.eventsListeners={},t.params&&t.params.on&&Object.keys(t.params.on).forEach((function(e){t.on(e,t.params.on[e])}))},d={components:{configurable:!0}};o.prototype.on=function(e,t,i){var s=this;if("function"!=typeof t)return s;var a=i?"unshift":"push";return e.split(" ").forEach((function(e){s.eventsListeners[e]||(s.eventsListeners[e]=[]),s.eventsListeners[e][a](t)})),s},o.prototype.once=function(e,t,i){var s=this;if("function"!=typeof t)return s;function a(){for(var i=[],n=arguments.length;n--;)i[n]=arguments[n];s.off(e,a),a.f7proxy&&delete a.f7proxy,t.apply(s,i)}return a.f7proxy=t,s.on(e,a,i)},o.prototype.off=function(e,t){var i=this;return i.eventsListeners?(e.split(" ").forEach((function(e){void 0===t?i.eventsListeners[e]=[]:i.eventsListeners[e]&&i.eventsListeners[e].length&&i.eventsListeners[e].forEach((function(s,a){(s===t||s.f7proxy&&s.f7proxy===t)&&i.eventsListeners[e].splice(a,1)}))})),i):i},o.prototype.emit=function(){for(var e=[],t=arguments.length;t--;)e[t]=arguments[t];var i,s,a,n=this;if(!n.eventsListeners)return n;"string"==typeof e[0]||Array.isArray(e[0])?(i=e[0],s=e.slice(1,e.length),a=n):(i=e[0].events,s=e[0].data,a=e[0].context||n);var r=Array.isArray(i)?i:i.split(" ");return r.forEach((function(e){if(n.eventsListeners&&n.eventsListeners[e]){var t=[];n.eventsListeners[e].forEach((function(e){t.push(e)})),t.forEach((function(e){e.apply(a,s)}))}})),n},o.prototype.useModulesParams=function(e){var t=this;t.modules&&Object.keys(t.modules).forEach((function(i){var s=t.modules[i];s.params&&r.extend(e,s.params)}))},o.prototype.useModules=function(e){void 0===e&&(e={});var t=this;t.modules&&Object.keys(t.modules).forEach((function(i){var s=t.modules[i],a=e[i]||{};s.instance&&Object.keys(s.instance).forEach((function(e){var i=s.instance[e];t[e]="function"==typeof i?i.bind(t):i})),s.on&&t.on&&Object.keys(s.on).forEach((function(e){t.on(e,s.on[e])})),s.create&&s.create.bind(t)(a)}))},d.components.set=function(e){this.use&&this.use(e)},o.installModule=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;s.prototype.modules||(s.prototype.modules={});var a=e.name||Object.keys(s.prototype.modules).length+"_"+r.now();return s.prototype.modules[a]=e,e.proto&&Object.keys(e.proto).forEach((function(t){s.prototype[t]=e.proto[t]})),e.static&&Object.keys(e.static).forEach((function(t){s[t]=e.static[t]})),e.install&&e.install.apply(s,t),s},o.use=function(e){for(var t=[],i=arguments.length-1;i-- >0;)t[i]=arguments[i+1];var s=this;return Array.isArray(e)?(e.forEach((function(e){return s.installModule(e)})),s):s.installModule.apply(s,[e].concat(t))},Object.defineProperties(o,d);var h={updateSize:function(){var e,t,i=this.$el;e=void 0!==this.params.width?this.params.width:i[0].clientWidth,t=void 0!==this.params.height?this.params.height:i[0].clientHeight,0===e&&this.isHorizontal()||0===t&&this.isVertical()||(e=e-parseInt(i.css("padding-left"),10)-parseInt(i.css("padding-right"),10),t=t-parseInt(i.css("padding-top"),10)-parseInt(i.css("padding-bottom"),10),r.extend(this,{width:e,height:t,size:this.isHorizontal()?e:t}))},updateSlides:function(){var e=this.params,i=this.$wrapperEl,s=this.size,a=this.rtlTranslate,n=this.wrongRTL,l=this.virtual&&e.virtual.enabled,o=l?this.virtual.slides.length:this.slides.length,d=i.children("."+this.params.slideClass),h=l?this.virtual.slides.length:d.length,p=[],u=[],c=[];function v(t){return!e.cssMode||t!==d.length-1}var f=e.slidesOffsetBefore;"function"==typeof f&&(f=e.slidesOffsetBefore.call(this));var m=e.slidesOffsetAfter;"function"==typeof m&&(m=e.slidesOffsetAfter.call(this));var g=this.snapGrid.length,y=this.snapGrid.length,b=e.spaceBetween,w=-f,C=0,x=0;if(void 0!==s){var S,T;"string"==typeof b&&b.indexOf("%")>=0&&(b=parseFloat(b.replace("%",""))/100*s),this.virtualSize=-b,a?d.css({marginLeft:"",marginTop:""}):d.css({marginRight:"",marginBottom:""}),e.slidesPerColumn>1&&(S=Math.floor(h/e.slidesPerColumn)===h/this.params.slidesPerColumn?h:Math.ceil(h/e.slidesPerColumn)*e.slidesPerColumn,"auto"!==e.slidesPerView&&"row"===e.slidesPerColumnFill&&(S=Math.max(S,e.slidesPerView*e.slidesPerColumn)));for(var E,M=e.slidesPerColumn,k=S/M,P=Math.floor(h/e.slidesPerColumn),L=0;L<h;L+=1){T=0;var z=d.eq(L);if(e.slidesPerColumn>1){var I=void 0,O=void 0,A=void 0;if("row"===e.slidesPerColumnFill&&e.slidesPerGroup>1){var B=Math.floor(L/(e.slidesPerGroup*e.slidesPerColumn)),D=L-e.slidesPerColumn*e.slidesPerGroup*B,$=0===B?e.slidesPerGroup:Math.min(Math.ceil((h-B*M*e.slidesPerGroup)/M),e.slidesPerGroup);I=(O=D-(A=Math.floor(D/$))*$+B*e.slidesPerGroup)+A*S/M,z.css({"-webkit-box-ordinal-group":I,"-moz-box-ordinal-group":I,"-ms-flex-order":I,"-webkit-order":I,order:I})}else"column"===e.slidesPerColumnFill?(A=L-(O=Math.floor(L/M))*M,(O>P||O===P&&A===M-1)&&(A+=1)>=M&&(A=0,O+=1)):O=L-(A=Math.floor(L/k))*k;z.css("margin-"+(this.isHorizontal()?"top":"left"),0!==A&&e.spaceBetween&&e.spaceBetween+"px")}if("none"!==z.css("display")){if("auto"===e.slidesPerView){var G=t.getComputedStyle(z[0],null),N=z[0].style.transform,V=z[0].style.webkitTransform;if(N&&(z[0].style.transform="none"),V&&(z[0].style.webkitTransform="none"),e.roundLengths)T=this.isHorizontal()?z.outerWidth(!0):z.outerHeight(!0);else if(this.isHorizontal()){var F=parseFloat(G.getPropertyValue("width")),H=parseFloat(G.getPropertyValue("padding-left")),R=parseFloat(G.getPropertyValue("padding-right")),j=parseFloat(G.getPropertyValue("margin-left")),W=parseFloat(G.getPropertyValue("margin-right")),q=G.getPropertyValue("box-sizing");T=q&&"border-box"===q?F+j+W:F+H+R+j+W}else{var X=parseFloat(G.getPropertyValue("height")),Y=parseFloat(G.getPropertyValue("padding-top")),U=parseFloat(G.getPropertyValue("padding-bottom")),K=parseFloat(G.getPropertyValue("margin-top")),_=parseFloat(G.getPropertyValue("margin-bottom")),Q=G.getPropertyValue("box-sizing");T=Q&&"border-box"===Q?X+K+_:X+Y+U+K+_}N&&(z[0].style.transform=N),V&&(z[0].style.webkitTransform=V),e.roundLengths&&(T=Math.floor(T))}else T=(s-(e.slidesPerView-1)*b)/e.slidesPerView,e.roundLengths&&(T=Math.floor(T)),d[L]&&(this.isHorizontal()?d[L].style.width=T+"px":d[L].style.height=T+"px");d[L]&&(d[L].swiperSlideSize=T),c.push(T),e.centeredSlides?(w=w+T/2+C/2+b,0===C&&0!==L&&(w=w-s/2-b),0===L&&(w=w-s/2-b),Math.abs(w)<.001&&(w=0),e.roundLengths&&(w=Math.floor(w)),x%e.slidesPerGroup==0&&p.push(w),u.push(w)):(e.roundLengths&&(w=Math.floor(w)),(x-Math.min(this.params.slidesPerGroupSkip,x))%this.params.slidesPerGroup==0&&p.push(w),u.push(w),w=w+T+b),this.virtualSize+=T+b,C=T,x+=1}}if(this.virtualSize=Math.max(this.virtualSize,s)+m,a&&n&&("slide"===e.effect||"coverflow"===e.effect)&&i.css({width:this.virtualSize+e.spaceBetween+"px"}),e.setWrapperSize&&(this.isHorizontal()?i.css({width:this.virtualSize+e.spaceBetween+"px"}):i.css({height:this.virtualSize+e.spaceBetween+"px"})),e.slidesPerColumn>1&&(this.virtualSize=(T+e.spaceBetween)*S,this.virtualSize=Math.ceil(this.virtualSize/e.slidesPerColumn)-e.spaceBetween,this.isHorizontal()?i.css({width:this.virtualSize+e.spaceBetween+"px"}):i.css({height:this.virtualSize+e.spaceBetween+"px"}),e.centeredSlides)){E=[];for(var J=0;J<p.length;J+=1){var Z=p[J];e.roundLengths&&(Z=Math.floor(Z)),p[J]<this.virtualSize+p[0]&&E.push(Z)}p=E}if(!e.centeredSlides){E=[];for(var ee=0;ee<p.length;ee+=1){var te=p[ee];e.roundLengths&&(te=Math.floor(te)),p[ee]<=this.virtualSize-s&&E.push(te)}p=E,Math.floor(this.virtualSize-s)-Math.floor(p[p.length-1])>1&&p.push(this.virtualSize-s)}if(0===p.length&&(p=[0]),0!==e.spaceBetween&&(this.isHorizontal()?a?d.filter(v).css({marginLeft:b+"px"}):d.filter(v).css({marginRight:b+"px"}):d.filter(v).css({marginBottom:b+"px"})),e.centeredSlides&&e.centeredSlidesBounds){var ie=0;c.forEach((function(t){ie+=t+(e.spaceBetween?e.spaceBetween:0)}));var se=(ie-=e.spaceBetween)-s;p=p.map((function(e){return e<0?-f:e>se?se+m:e}))}if(e.centerInsufficientSlides){var ae=0;if(c.forEach((function(t){ae+=t+(e.spaceBetween?e.spaceBetween:0)})),(ae-=e.spaceBetween)<s){var ne=(s-ae)/2;p.forEach((function(e,t){p[t]=e-ne})),u.forEach((function(e,t){u[t]=e+ne}))}}r.extend(this,{slides:d,snapGrid:p,slidesGrid:u,slidesSizesGrid:c}),h!==o&&this.emit("slidesLengthChange"),p.length!==g&&(this.params.watchOverflow&&this.checkOverflow(),this.emit("snapGridLengthChange")),u.length!==y&&this.emit("slidesGridLengthChange"),(e.watchSlidesProgress||e.watchSlidesVisibility)&&this.updateSlidesOffset()}},updateAutoHeight:function(e){var t,i=[],s=0;if("number"==typeof e?this.setTransition(e):!0===e&&this.setTransition(this.params.speed),"auto"!==this.params.slidesPerView&&this.params.slidesPerView>1)for(t=0;t<Math.ceil(this.params.slidesPerView);t+=1){var a=this.activeIndex+t;if(a>this.slides.length)break;i.push(this.slides.eq(a)[0])}else i.push(this.slides.eq(this.activeIndex)[0]);for(t=0;t<i.length;t+=1)if(void 0!==i[t]){var n=i[t].offsetHeight;s=n>s?n:s}s&&this.$wrapperEl.css("height",s+"px")},updateSlidesOffset:function(){for(var e=this.slides,t=0;t<e.length;t+=1)e[t].swiperSlideOffset=this.isHorizontal()?e[t].offsetLeft:e[t].offsetTop},updateSlidesProgress:function(e){void 0===e&&(e=this&&this.translate||0);var t=this.params,i=this.slides,a=this.rtlTranslate;if(0!==i.length){void 0===i[0].swiperSlideOffset&&this.updateSlidesOffset();var n=-e;a&&(n=e),i.removeClass(t.slideVisibleClass),this.visibleSlidesIndexes=[],this.visibleSlides=[];for(var r=0;r<i.length;r+=1){var l=i[r],o=(n+(t.centeredSlides?this.minTranslate():0)-l.swiperSlideOffset)/(l.swiperSlideSize+t.spaceBetween);if(t.watchSlidesVisibility){var d=-(n-l.swiperSlideOffset),h=d+this.slidesSizesGrid[r];(d>=0&&d<this.size-1||h>1&&h<=this.size||d<=0&&h>=this.size)&&(this.visibleSlides.push(l),this.visibleSlidesIndexes.push(r),i.eq(r).addClass(t.slideVisibleClass))}l.progress=a?-o:o}this.visibleSlides=s(this.visibleSlides)}},updateProgress:function(e){if(void 0===e){var t=this.rtlTranslate?-1:1;e=this&&this.translate&&this.translate*t||0}var i=this.params,s=this.maxTranslate()-this.minTranslate(),a=this.progress,n=this.isBeginning,l=this.isEnd,o=n,d=l;0===s?(a=0,n=!0,l=!0):(n=(a=(e-this.minTranslate())/s)<=0,l=a>=1),r.extend(this,{progress:a,isBeginning:n,isEnd:l}),(i.watchSlidesProgress||i.watchSlidesVisibility)&&this.updateSlidesProgress(e),n&&!o&&this.emit("reachBeginning toEdge"),l&&!d&&this.emit("reachEnd toEdge"),(o&&!n||d&&!l)&&this.emit("fromEdge"),this.emit("progress",a)},updateSlidesClasses:function(){var e,t=this.slides,i=this.params,s=this.$wrapperEl,a=this.activeIndex,n=this.realIndex,r=this.virtual&&i.virtual.enabled;t.removeClass(i.slideActiveClass+" "+i.slideNextClass+" "+i.slidePrevClass+" "+i.slideDuplicateActiveClass+" "+i.slideDuplicateNextClass+" "+i.slideDuplicatePrevClass),(e=r?this.$wrapperEl.find("."+i.slideClass+'[data-swiper-slide-index="'+a+'"]'):t.eq(a)).addClass(i.slideActiveClass),i.loop&&(e.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+n+'"]').addClass(i.slideDuplicateActiveClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+n+'"]').addClass(i.slideDuplicateActiveClass));var l=e.nextAll("."+i.slideClass).eq(0).addClass(i.slideNextClass);i.loop&&0===l.length&&(l=t.eq(0)).addClass(i.slideNextClass);var o=e.prevAll("."+i.slideClass).eq(0).addClass(i.slidePrevClass);i.loop&&0===o.length&&(o=t.eq(-1)).addClass(i.slidePrevClass),i.loop&&(l.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+l.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicateNextClass),o.hasClass(i.slideDuplicateClass)?s.children("."+i.slideClass+":not(."+i.slideDuplicateClass+')[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass):s.children("."+i.slideClass+"."+i.slideDuplicateClass+'[data-swiper-slide-index="'+o.attr("data-swiper-slide-index")+'"]').addClass(i.slideDuplicatePrevClass))},updateActiveIndex:function(e){var t,i=this.rtlTranslate?this.translate:-this.translate,s=this.slidesGrid,a=this.snapGrid,n=this.params,l=this.activeIndex,o=this.realIndex,d=this.snapIndex,h=e;if(void 0===h){for(var p=0;p<s.length;p+=1)void 0!==s[p+1]?i>=s[p]&&i<s[p+1]-(s[p+1]-s[p])/2?h=p:i>=s[p]&&i<s[p+1]&&(h=p+1):i>=s[p]&&(h=p);n.normalizeSlideIndex&&(h<0||void 0===h)&&(h=0)}if(a.indexOf(i)>=0)t=a.indexOf(i);else{var u=Math.min(n.slidesPerGroupSkip,h);t=u+Math.floor((h-u)/n.slidesPerGroup)}if(t>=a.length&&(t=a.length-1),h!==l){var c=parseInt(this.slides.eq(h).attr("data-swiper-slide-index")||h,10);r.extend(this,{snapIndex:t,realIndex:c,previousIndex:l,activeIndex:h}),this.emit("activeIndexChange"),this.emit("snapIndexChange"),o!==c&&this.emit("realIndexChange"),(this.initialized||this.runCallbacksOnInit)&&this.emit("slideChange")}else t!==d&&(this.snapIndex=t,this.emit("snapIndexChange"))},updateClickedSlide:function(e){var t=this.params,i=s(e.target).closest("."+t.slideClass)[0],a=!1;if(i)for(var n=0;n<this.slides.length;n+=1)this.slides[n]===i&&(a=!0);if(!i||!a)return this.clickedSlide=void 0,void(this.clickedIndex=void 0);this.clickedSlide=i,this.virtual&&this.params.virtual.enabled?this.clickedIndex=parseInt(s(i).attr("data-swiper-slide-index"),10):this.clickedIndex=s(i).index(),t.slideToClickedSlide&&void 0!==this.clickedIndex&&this.clickedIndex!==this.activeIndex&&this.slideToClickedSlide()}};var p={getTranslate:function(e){void 0===e&&(e=this.isHorizontal()?"x":"y");var t=this.params,i=this.rtlTranslate,s=this.translate,a=this.$wrapperEl;if(t.virtualTranslate)return i?-s:s;if(t.cssMode)return s;var n=r.getTranslate(a[0],e);return i&&(n=-n),n||0},setTranslate:function(e,t){var i=this.rtlTranslate,s=this.params,a=this.$wrapperEl,n=this.wrapperEl,r=this.progress,l=0,o=0;this.isHorizontal()?l=i?-e:e:o=e,s.roundLengths&&(l=Math.floor(l),o=Math.floor(o)),s.cssMode?n[this.isHorizontal()?"scrollLeft":"scrollTop"]=this.isHorizontal()?-l:-o:s.virtualTranslate||a.transform("translate3d("+l+"px, "+o+"px, 0px)"),this.previousTranslate=this.translate,this.translate=this.isHorizontal()?l:o;var d=this.maxTranslate()-this.minTranslate();(0===d?0:(e-this.minTranslate())/d)!==r&&this.updateProgress(e),this.emit("setTranslate",this.translate,t)},minTranslate:function(){return-this.snapGrid[0]},maxTranslate:function(){return-this.snapGrid[this.snapGrid.length-1]},translateTo:function(e,t,i,s,a){var n;void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0),void 0===s&&(s=!0);var r=this,l=r.params,o=r.wrapperEl;if(r.animating&&l.preventInteractionOnTransition)return!1;var d,h=r.minTranslate(),p=r.maxTranslate();if(d=s&&e>h?h:s&&e<p?p:e,r.updateProgress(d),l.cssMode){var u=r.isHorizontal();return 0===t?o[u?"scrollLeft":"scrollTop"]=-d:o.scrollTo?o.scrollTo(((n={})[u?"left":"top"]=-d,n.behavior="smooth",n)):o[u?"scrollLeft":"scrollTop"]=-d,!0}return 0===t?(r.setTransition(0),r.setTranslate(d),i&&(r.emit("beforeTransitionStart",t,a),r.emit("transitionEnd"))):(r.setTransition(t),r.setTranslate(d),i&&(r.emit("beforeTransitionStart",t,a),r.emit("transitionStart")),r.animating||(r.animating=!0,r.onTranslateToWrapperTransitionEnd||(r.onTranslateToWrapperTransitionEnd=function(e){r&&!r.destroyed&&e.target===this&&(r.$wrapperEl[0].removeEventListener("transitionend",r.onTranslateToWrapperTransitionEnd),r.$wrapperEl[0].removeEventListener("webkitTransitionEnd",r.onTranslateToWrapperTransitionEnd),r.onTranslateToWrapperTransitionEnd=null,delete r.onTranslateToWrapperTransitionEnd,i&&r.emit("transitionEnd"))}),r.$wrapperEl[0].addEventListener("transitionend",r.onTranslateToWrapperTransitionEnd),r.$wrapperEl[0].addEventListener("webkitTransitionEnd",r.onTranslateToWrapperTransitionEnd))),!0}};var u={setTransition:function(e,t){this.params.cssMode||this.$wrapperEl.transition(e),this.emit("setTransition",e,t)},transitionStart:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.params,a=this.previousIndex;if(!s.cssMode){s.autoHeight&&this.updateAutoHeight();var n=t;if(n||(n=i>a?"next":i<a?"prev":"reset"),this.emit("transitionStart"),e&&i!==a){if("reset"===n)return void this.emit("slideResetTransitionStart");this.emit("slideChangeTransitionStart"),"next"===n?this.emit("slideNextTransitionStart"):this.emit("slidePrevTransitionStart")}}},transitionEnd:function(e,t){void 0===e&&(e=!0);var i=this.activeIndex,s=this.previousIndex,a=this.params;if(this.animating=!1,!a.cssMode){this.setTransition(0);var n=t;if(n||(n=i>s?"next":i<s?"prev":"reset"),this.emit("transitionEnd"),e&&i!==s){if("reset"===n)return void this.emit("slideResetTransitionEnd");this.emit("slideChangeTransitionEnd"),"next"===n?this.emit("slideNextTransitionEnd"):this.emit("slidePrevTransitionEnd")}}}};var c={slideTo:function(e,t,i,s){var a;void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var n=this,r=e;r<0&&(r=0);var l=n.params,o=n.snapGrid,d=n.slidesGrid,h=n.previousIndex,p=n.activeIndex,u=n.rtlTranslate,c=n.wrapperEl;if(n.animating&&l.preventInteractionOnTransition)return!1;var v=Math.min(n.params.slidesPerGroupSkip,r),f=v+Math.floor((r-v)/n.params.slidesPerGroup);f>=d.length&&(f=d.length-1),(p||l.initialSlide||0)===(h||0)&&i&&n.emit("beforeSlideChangeStart");var m,g=-o[f];if(n.updateProgress(g),l.normalizeSlideIndex)for(var y=0;y<d.length;y+=1)-Math.floor(100*g)>=Math.floor(100*d[y])&&(r=y);if(n.initialized&&r!==p){if(!n.allowSlideNext&&g<n.translate&&g<n.minTranslate())return!1;if(!n.allowSlidePrev&&g>n.translate&&g>n.maxTranslate()&&(p||0)!==r)return!1}if(m=r>p?"next":r<p?"prev":"reset",u&&-g===n.translate||!u&&g===n.translate)return n.updateActiveIndex(r),l.autoHeight&&n.updateAutoHeight(),n.updateSlidesClasses(),"slide"!==l.effect&&n.setTranslate(g),"reset"!==m&&(n.transitionStart(i,m),n.transitionEnd(i,m)),!1;if(l.cssMode){var b=n.isHorizontal();return 0===t?c[b?"scrollLeft":"scrollTop"]=-g:c.scrollTo?c.scrollTo(((a={})[b?"left":"top"]=-g,a.behavior="smooth",a)):c[b?"scrollLeft":"scrollTop"]=-g,!0}return 0===t?(n.setTransition(0),n.setTranslate(g),n.updateActiveIndex(r),n.updateSlidesClasses(),n.emit("beforeTransitionStart",t,s),n.transitionStart(i,m),n.transitionEnd(i,m)):(n.setTransition(t),n.setTranslate(g),n.updateActiveIndex(r),n.updateSlidesClasses(),n.emit("beforeTransitionStart",t,s),n.transitionStart(i,m),n.animating||(n.animating=!0,n.onSlideToWrapperTransitionEnd||(n.onSlideToWrapperTransitionEnd=function(e){n&&!n.destroyed&&e.target===this&&(n.$wrapperEl[0].removeEventListener("transitionend",n.onSlideToWrapperTransitionEnd),n.$wrapperEl[0].removeEventListener("webkitTransitionEnd",n.onSlideToWrapperTransitionEnd),n.onSlideToWrapperTransitionEnd=null,delete n.onSlideToWrapperTransitionEnd,n.transitionEnd(i,m))}),n.$wrapperEl[0].addEventListener("transitionend",n.onSlideToWrapperTransitionEnd),n.$wrapperEl[0].addEventListener("webkitTransitionEnd",n.onSlideToWrapperTransitionEnd))),!0},slideToLoop:function(e,t,i,s){void 0===e&&(e=0),void 0===t&&(t=this.params.speed),void 0===i&&(i=!0);var a=e;return this.params.loop&&(a+=this.loopedSlides),this.slideTo(a,t,i,s)},slideNext:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating,n=this.activeIndex<s.slidesPerGroupSkip?1:s.slidesPerGroup;if(s.loop){if(a)return!1;this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft}return this.slideTo(this.activeIndex+n,e,t,i)},slidePrev:function(e,t,i){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0);var s=this.params,a=this.animating,n=this.snapGrid,r=this.slidesGrid,l=this.rtlTranslate;if(s.loop){if(a)return!1;this.loopFix(),this._clientLeft=this.$wrapperEl[0].clientLeft}function o(e){return e<0?-Math.floor(Math.abs(e)):Math.floor(e)}var d,h=o(l?this.translate:-this.translate),p=n.map((function(e){return o(e)})),u=(r.map((function(e){return o(e)})),n[p.indexOf(h)],n[p.indexOf(h)-1]);return void 0===u&&s.cssMode&&n.forEach((function(e){!u&&h>=e&&(u=e)})),void 0!==u&&(d=r.indexOf(u))<0&&(d=this.activeIndex-1),this.slideTo(d,e,t,i)},slideReset:function(e,t,i){return void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),this.slideTo(this.activeIndex,e,t,i)},slideToClosest:function(e,t,i,s){void 0===e&&(e=this.params.speed),void 0===t&&(t=!0),void 0===s&&(s=.5);var a=this.activeIndex,n=Math.min(this.params.slidesPerGroupSkip,a),r=n+Math.floor((a-n)/this.params.slidesPerGroup),l=this.rtlTranslate?this.translate:-this.translate;if(l>=this.snapGrid[r]){var o=this.snapGrid[r];l-o>(this.snapGrid[r+1]-o)*s&&(a+=this.params.slidesPerGroup)}else{var d=this.snapGrid[r-1];l-d<=(this.snapGrid[r]-d)*s&&(a-=this.params.slidesPerGroup)}return a=Math.max(a,0),a=Math.min(a,this.slidesGrid.length-1),this.slideTo(a,e,t,i)},slideToClickedSlide:function(){var e,t=this,i=t.params,a=t.$wrapperEl,n="auto"===i.slidesPerView?t.slidesPerViewDynamic():i.slidesPerView,l=t.clickedIndex;if(i.loop){if(t.animating)return;e=parseInt(s(t.clickedSlide).attr("data-swiper-slide-index"),10),i.centeredSlides?l<t.loopedSlides-n/2||l>t.slides.length-t.loopedSlides+n/2?(t.loopFix(),l=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),r.nextTick((function(){t.slideTo(l)}))):t.slideTo(l):l>t.slides.length-n?(t.loopFix(),l=a.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]:not(.'+i.slideDuplicateClass+")").eq(0).index(),r.nextTick((function(){t.slideTo(l)}))):t.slideTo(l)}else t.slideTo(l)}};var v={loopCreate:function(){var t=this,i=t.params,a=t.$wrapperEl;a.children("."+i.slideClass+"."+i.slideDuplicateClass).remove();var n=a.children("."+i.slideClass);if(i.loopFillGroupWithBlank){var r=i.slidesPerGroup-n.length%i.slidesPerGroup;if(r!==i.slidesPerGroup){for(var l=0;l<r;l+=1){var o=s(e.createElement("div")).addClass(i.slideClass+" "+i.slideBlankClass);a.append(o)}n=a.children("."+i.slideClass)}}"auto"!==i.slidesPerView||i.loopedSlides||(i.loopedSlides=n.length),t.loopedSlides=Math.ceil(parseFloat(i.loopedSlides||i.slidesPerView,10)),t.loopedSlides+=i.loopAdditionalSlides,t.loopedSlides>n.length&&(t.loopedSlides=n.length);var d=[],h=[];n.each((function(e,i){var a=s(i);e<t.loopedSlides&&h.push(i),e<n.length&&e>=n.length-t.loopedSlides&&d.push(i),a.attr("data-swiper-slide-index",e)}));for(var p=0;p<h.length;p+=1)a.append(s(h[p].cloneNode(!0)).addClass(i.slideDuplicateClass));for(var u=d.length-1;u>=0;u-=1)a.prepend(s(d[u].cloneNode(!0)).addClass(i.slideDuplicateClass))},loopFix:function(){this.emit("beforeLoopFix");var e,t=this.activeIndex,i=this.slides,s=this.loopedSlides,a=this.allowSlidePrev,n=this.allowSlideNext,r=this.snapGrid,l=this.rtlTranslate;this.allowSlidePrev=!0,this.allowSlideNext=!0;var o=-r[t]-this.getTranslate();if(t<s)e=i.length-3*s+t,e+=s,this.slideTo(e,0,!1,!0)&&0!==o&&this.setTranslate((l?-this.translate:this.translate)-o);else if(t>=i.length-s){e=-i.length+t+s,e+=s,this.slideTo(e,0,!1,!0)&&0!==o&&this.setTranslate((l?-this.translate:this.translate)-o)}this.allowSlidePrev=a,this.allowSlideNext=n,this.emit("loopFix")},loopDestroy:function(){var e=this.$wrapperEl,t=this.params,i=this.slides;e.children("."+t.slideClass+"."+t.slideDuplicateClass+",."+t.slideClass+"."+t.slideBlankClass).remove(),i.removeAttr("data-swiper-slide-index")}};var f={setGrabCursor:function(e){if(!(l.touch||!this.params.simulateTouch||this.params.watchOverflow&&this.isLocked||this.params.cssMode)){var t=this.el;t.style.cursor="move",t.style.cursor=e?"-webkit-grabbing":"-webkit-grab",t.style.cursor=e?"-moz-grabbin":"-moz-grab",t.style.cursor=e?"grabbing":"grab"}},unsetGrabCursor:function(){l.touch||this.params.watchOverflow&&this.isLocked||this.params.cssMode||(this.el.style.cursor="")}};var m,g,y,b,w,C,x,S,T,E,M,k,P,L,z,I={appendSlide:function(e){var t=this.$wrapperEl,i=this.params;if(i.loop&&this.loopDestroy(),"object"==typeof e&&"length"in e)for(var s=0;s<e.length;s+=1)e[s]&&t.append(e[s]);else t.append(e);i.loop&&this.loopCreate(),i.observer&&l.observer||this.update()},prependSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&this.loopDestroy();var a=s+1;if("object"==typeof e&&"length"in e){for(var n=0;n<e.length;n+=1)e[n]&&i.prepend(e[n]);a=s+e.length}else i.prepend(e);t.loop&&this.loopCreate(),t.observer&&l.observer||this.update(),this.slideTo(a,0,!1)},addSlide:function(e,t){var i=this.$wrapperEl,s=this.params,a=this.activeIndex;s.loop&&(a-=this.loopedSlides,this.loopDestroy(),this.slides=i.children("."+s.slideClass));var n=this.slides.length;if(e<=0)this.prependSlide(t);else if(e>=n)this.appendSlide(t);else{for(var r=a>e?a+1:a,o=[],d=n-1;d>=e;d-=1){var h=this.slides.eq(d);h.remove(),o.unshift(h)}if("object"==typeof t&&"length"in t){for(var p=0;p<t.length;p+=1)t[p]&&i.append(t[p]);r=a>e?a+t.length:a}else i.append(t);for(var u=0;u<o.length;u+=1)i.append(o[u]);s.loop&&this.loopCreate(),s.observer&&l.observer||this.update(),s.loop?this.slideTo(r+this.loopedSlides,0,!1):this.slideTo(r,0,!1)}},removeSlide:function(e){var t=this.params,i=this.$wrapperEl,s=this.activeIndex;t.loop&&(s-=this.loopedSlides,this.loopDestroy(),this.slides=i.children("."+t.slideClass));var a,n=s;if("object"==typeof e&&"length"in e){for(var r=0;r<e.length;r+=1)a=e[r],this.slides[a]&&this.slides.eq(a).remove(),a<n&&(n-=1);n=Math.max(n,0)}else a=e,this.slides[a]&&this.slides.eq(a).remove(),a<n&&(n-=1),n=Math.max(n,0);t.loop&&this.loopCreate(),t.observer&&l.observer||this.update(),t.loop?this.slideTo(n+this.loopedSlides,0,!1):this.slideTo(n,0,!1)},removeAllSlides:function(){for(var e=[],t=0;t<this.slides.length;t+=1)e.push(t);this.removeSlide(e)}},O=(m=t.navigator.platform,g=t.navigator.userAgent,y={ios:!1,android:!1,androidChrome:!1,desktop:!1,iphone:!1,ipod:!1,ipad:!1,edge:!1,ie:!1,firefox:!1,macos:!1,windows:!1,cordova:!(!t.cordova&&!t.phonegap),phonegap:!(!t.cordova&&!t.phonegap),electron:!1},b=t.screen.width,w=t.screen.height,C=g.match(/(Android);?[\s\/]+([\d.]+)?/),x=g.match(/(iPad).*OS\s([\d_]+)/),S=g.match(/(iPod)(.*OS\s([\d_]+))?/),T=!x&&g.match(/(iPhone\sOS|iOS)\s([\d_]+)/),E=g.indexOf("MSIE ")>=0||g.indexOf("Trident/")>=0,M=g.indexOf("Edge/")>=0,k=g.indexOf("Gecko/")>=0&&g.indexOf("Firefox/")>=0,P="Win32"===m,L=g.toLowerCase().indexOf("electron")>=0,z="MacIntel"===m,!x&&z&&l.touch&&(1024===b&&1366===w||834===b&&1194===w||834===b&&1112===w||768===b&&1024===w)&&(x=g.match(/(Version)\/([\d.]+)/),z=!1),y.ie=E,y.edge=M,y.firefox=k,C&&!P&&(y.os="android",y.osVersion=C[2],y.android=!0,y.androidChrome=g.toLowerCase().indexOf("chrome")>=0),(x||T||S)&&(y.os="ios",y.ios=!0),T&&!S&&(y.osVersion=T[2].replace(/_/g,"."),y.iphone=!0),x&&(y.osVersion=x[2].replace(/_/g,"."),y.ipad=!0),S&&(y.osVersion=S[3]?S[3].replace(/_/g,"."):null,y.ipod=!0),y.ios&&y.osVersion&&g.indexOf("Version/")>=0&&"10"===y.osVersion.split(".")[0]&&(y.osVersion=g.toLowerCase().split("version/")[1].split(" ")[0]),y.webView=!(!(T||x||S)||!g.match(/.*AppleWebKit(?!.*Safari)/i)&&!t.navigator.standalone)||t.matchMedia&&t.matchMedia("(display-mode: standalone)").matches,y.webview=y.webView,y.standalone=y.webView,y.desktop=!(y.ios||y.android)||L,y.desktop&&(y.electron=L,y.macos=z,y.windows=P,y.macos&&(y.os="macos"),y.windows&&(y.os="windows")),y.pixelRatio=t.devicePixelRatio||1,y);function A(i){var a=this.touchEventsData,n=this.params,l=this.touches;if(!this.animating||!n.preventInteractionOnTransition){var o=i;o.originalEvent&&(o=o.originalEvent);var d=s(o.target);if(("wrapper"!==n.touchEventsTarget||d.closest(this.wrapperEl).length)&&(a.isTouchEvent="touchstart"===o.type,(a.isTouchEvent||!("which"in o)||3!==o.which)&&!(!a.isTouchEvent&&"button"in o&&o.button>0||a.isTouched&&a.isMoved)))if(n.noSwiping&&d.closest(n.noSwipingSelector?n.noSwipingSelector:"."+n.noSwipingClass)[0])this.allowClick=!0;else if(!n.swipeHandler||d.closest(n.swipeHandler)[0]){l.currentX="touchstart"===o.type?o.targetTouches[0].pageX:o.pageX,l.currentY="touchstart"===o.type?o.targetTouches[0].pageY:o.pageY;var h=l.currentX,p=l.currentY,u=n.edgeSwipeDetection||n.iOSEdgeSwipeDetection,c=n.edgeSwipeThreshold||n.iOSEdgeSwipeThreshold;if(!u||!(h<=c||h>=t.screen.width-c)){if(r.extend(a,{isTouched:!0,isMoved:!1,allowTouchCallbacks:!0,isScrolling:void 0,startMoving:void 0}),l.startX=h,l.startY=p,a.touchStartTime=r.now(),this.allowClick=!0,this.updateSize(),this.swipeDirection=void 0,n.threshold>0&&(a.allowThresholdMove=!1),"touchstart"!==o.type){var v=!0;d.is(a.formElements)&&(v=!1),e.activeElement&&s(e.activeElement).is(a.formElements)&&e.activeElement!==d[0]&&e.activeElement.blur();var f=v&&this.allowTouchMove&&n.touchStartPreventDefault;(n.touchStartForcePreventDefault||f)&&o.preventDefault()}this.emit("touchStart",o)}}}}function B(t){var i=this.touchEventsData,a=this.params,n=this.touches,l=this.rtlTranslate,o=t;if(o.originalEvent&&(o=o.originalEvent),i.isTouched){if(!i.isTouchEvent||"mousemove"!==o.type){var d="touchmove"===o.type&&o.targetTouches&&(o.targetTouches[0]||o.changedTouches[0]),h="touchmove"===o.type?d.pageX:o.pageX,p="touchmove"===o.type?d.pageY:o.pageY;if(o.preventedByNestedSwiper)return n.startX=h,void(n.startY=p);if(!this.allowTouchMove)return this.allowClick=!1,void(i.isTouched&&(r.extend(n,{startX:h,startY:p,currentX:h,currentY:p}),i.touchStartTime=r.now()));if(i.isTouchEvent&&a.touchReleaseOnEdges&&!a.loop)if(this.isVertical()){if(p<n.startY&&this.translate<=this.maxTranslate()||p>n.startY&&this.translate>=this.minTranslate())return i.isTouched=!1,void(i.isMoved=!1)}else if(h<n.startX&&this.translate<=this.maxTranslate()||h>n.startX&&this.translate>=this.minTranslate())return;if(i.isTouchEvent&&e.activeElement&&o.target===e.activeElement&&s(o.target).is(i.formElements))return i.isMoved=!0,void(this.allowClick=!1);if(i.allowTouchCallbacks&&this.emit("touchMove",o),!(o.targetTouches&&o.targetTouches.length>1)){n.currentX=h,n.currentY=p;var u=n.currentX-n.startX,c=n.currentY-n.startY;if(!(this.params.threshold&&Math.sqrt(Math.pow(u,2)+Math.pow(c,2))<this.params.threshold)){var v;if(void 0===i.isScrolling)this.isHorizontal()&&n.currentY===n.startY||this.isVertical()&&n.currentX===n.startX?i.isScrolling=!1:u*u+c*c>=25&&(v=180*Math.atan2(Math.abs(c),Math.abs(u))/Math.PI,i.isScrolling=this.isHorizontal()?v>a.touchAngle:90-v>a.touchAngle);if(i.isScrolling&&this.emit("touchMoveOpposite",o),void 0===i.startMoving&&(n.currentX===n.startX&&n.currentY===n.startY||(i.startMoving=!0)),i.isScrolling)i.isTouched=!1;else if(i.startMoving){this.allowClick=!1,a.cssMode||o.preventDefault(),a.touchMoveStopPropagation&&!a.nested&&o.stopPropagation(),i.isMoved||(a.loop&&this.loopFix(),i.startTranslate=this.getTranslate(),this.setTransition(0),this.animating&&this.$wrapperEl.trigger("webkitTransitionEnd transitionend"),i.allowMomentumBounce=!1,!a.grabCursor||!0!==this.allowSlideNext&&!0!==this.allowSlidePrev||this.setGrabCursor(!0),this.emit("sliderFirstMove",o)),this.emit("sliderMove",o),i.isMoved=!0;var f=this.isHorizontal()?u:c;n.diff=f,f*=a.touchRatio,l&&(f=-f),this.swipeDirection=f>0?"prev":"next",i.currentTranslate=f+i.startTranslate;var m=!0,g=a.resistanceRatio;if(a.touchReleaseOnEdges&&(g=0),f>0&&i.currentTranslate>this.minTranslate()?(m=!1,a.resistance&&(i.currentTranslate=this.minTranslate()-1+Math.pow(-this.minTranslate()+i.startTranslate+f,g))):f<0&&i.currentTranslate<this.maxTranslate()&&(m=!1,a.resistance&&(i.currentTranslate=this.maxTranslate()+1-Math.pow(this.maxTranslate()-i.startTranslate-f,g))),m&&(o.preventedByNestedSwiper=!0),!this.allowSlideNext&&"next"===this.swipeDirection&&i.currentTranslate<i.startTranslate&&(i.currentTranslate=i.startTranslate),!this.allowSlidePrev&&"prev"===this.swipeDirection&&i.currentTranslate>i.startTranslate&&(i.currentTranslate=i.startTranslate),a.threshold>0){if(!(Math.abs(f)>a.threshold||i.allowThresholdMove))return void(i.currentTranslate=i.startTranslate);if(!i.allowThresholdMove)return i.allowThresholdMove=!0,n.startX=n.currentX,n.startY=n.currentY,i.currentTranslate=i.startTranslate,void(n.diff=this.isHorizontal()?n.currentX-n.startX:n.currentY-n.startY)}a.followFinger&&!a.cssMode&&((a.freeMode||a.watchSlidesProgress||a.watchSlidesVisibility)&&(this.updateActiveIndex(),this.updateSlidesClasses()),a.freeMode&&(0===i.velocities.length&&i.velocities.push({position:n[this.isHorizontal()?"startX":"startY"],time:i.touchStartTime}),i.velocities.push({position:n[this.isHorizontal()?"currentX":"currentY"],time:r.now()})),this.updateProgress(i.currentTranslate),this.setTranslate(i.currentTranslate))}}}}}else i.startMoving&&i.isScrolling&&this.emit("touchMoveOpposite",o)}function D(e){var t=this,i=t.touchEventsData,s=t.params,a=t.touches,n=t.rtlTranslate,l=t.$wrapperEl,o=t.slidesGrid,d=t.snapGrid,h=e;if(h.originalEvent&&(h=h.originalEvent),i.allowTouchCallbacks&&t.emit("touchEnd",h),i.allowTouchCallbacks=!1,!i.isTouched)return i.isMoved&&s.grabCursor&&t.setGrabCursor(!1),i.isMoved=!1,void(i.startMoving=!1);s.grabCursor&&i.isMoved&&i.isTouched&&(!0===t.allowSlideNext||!0===t.allowSlidePrev)&&t.setGrabCursor(!1);var p,u=r.now(),c=u-i.touchStartTime;if(t.allowClick&&(t.updateClickedSlide(h),t.emit("tap click",h),c<300&&u-i.lastClickTime<300&&t.emit("doubleTap doubleClick",h)),i.lastClickTime=r.now(),r.nextTick((function(){t.destroyed||(t.allowClick=!0)})),!i.isTouched||!i.isMoved||!t.swipeDirection||0===a.diff||i.currentTranslate===i.startTranslate)return i.isTouched=!1,i.isMoved=!1,void(i.startMoving=!1);if(i.isTouched=!1,i.isMoved=!1,i.startMoving=!1,p=s.followFinger?n?t.translate:-t.translate:-i.currentTranslate,!s.cssMode)if(s.freeMode){if(p<-t.minTranslate())return void t.slideTo(t.activeIndex);if(p>-t.maxTranslate())return void(t.slides.length<d.length?t.slideTo(d.length-1):t.slideTo(t.slides.length-1));if(s.freeModeMomentum){if(i.velocities.length>1){var v=i.velocities.pop(),f=i.velocities.pop(),m=v.position-f.position,g=v.time-f.time;t.velocity=m/g,t.velocity/=2,Math.abs(t.velocity)<s.freeModeMinimumVelocity&&(t.velocity=0),(g>150||r.now()-v.time>300)&&(t.velocity=0)}else t.velocity=0;t.velocity*=s.freeModeMomentumVelocityRatio,i.velocities.length=0;var y=1e3*s.freeModeMomentumRatio,b=t.velocity*y,w=t.translate+b;n&&(w=-w);var C,x,S=!1,T=20*Math.abs(t.velocity)*s.freeModeMomentumBounceRatio;if(w<t.maxTranslate())s.freeModeMomentumBounce?(w+t.maxTranslate()<-T&&(w=t.maxTranslate()-T),C=t.maxTranslate(),S=!0,i.allowMomentumBounce=!0):w=t.maxTranslate(),s.loop&&s.centeredSlides&&(x=!0);else if(w>t.minTranslate())s.freeModeMomentumBounce?(w-t.minTranslate()>T&&(w=t.minTranslate()+T),C=t.minTranslate(),S=!0,i.allowMomentumBounce=!0):w=t.minTranslate(),s.loop&&s.centeredSlides&&(x=!0);else if(s.freeModeSticky){for(var E,M=0;M<d.length;M+=1)if(d[M]>-w){E=M;break}w=-(w=Math.abs(d[E]-w)<Math.abs(d[E-1]-w)||"next"===t.swipeDirection?d[E]:d[E-1])}if(x&&t.once("transitionEnd",(function(){t.loopFix()})),0!==t.velocity){if(y=n?Math.abs((-w-t.translate)/t.velocity):Math.abs((w-t.translate)/t.velocity),s.freeModeSticky){var k=Math.abs((n?-w:w)-t.translate),P=t.slidesSizesGrid[t.activeIndex];y=k<P?s.speed:k<2*P?1.5*s.speed:2.5*s.speed}}else if(s.freeModeSticky)return void t.slideToClosest();s.freeModeMomentumBounce&&S?(t.updateProgress(C),t.setTransition(y),t.setTranslate(w),t.transitionStart(!0,t.swipeDirection),t.animating=!0,l.transitionEnd((function(){t&&!t.destroyed&&i.allowMomentumBounce&&(t.emit("momentumBounce"),t.setTransition(s.speed),t.setTranslate(C),l.transitionEnd((function(){t&&!t.destroyed&&t.transitionEnd()})))}))):t.velocity?(t.updateProgress(w),t.setTransition(y),t.setTranslate(w),t.transitionStart(!0,t.swipeDirection),t.animating||(t.animating=!0,l.transitionEnd((function(){t&&!t.destroyed&&t.transitionEnd()})))):t.updateProgress(w),t.updateActiveIndex(),t.updateSlidesClasses()}else if(s.freeModeSticky)return void t.slideToClosest();(!s.freeModeMomentum||c>=s.longSwipesMs)&&(t.updateProgress(),t.updateActiveIndex(),t.updateSlidesClasses())}else{for(var L=0,z=t.slidesSizesGrid[0],I=0;I<o.length;I+=I<s.slidesPerGroupSkip?1:s.slidesPerGroup){var O=I<s.slidesPerGroupSkip-1?1:s.slidesPerGroup;void 0!==o[I+O]?p>=o[I]&&p<o[I+O]&&(L=I,z=o[I+O]-o[I]):p>=o[I]&&(L=I,z=o[o.length-1]-o[o.length-2])}var A=(p-o[L])/z,B=L<s.slidesPerGroupSkip-1?1:s.slidesPerGroup;if(c>s.longSwipesMs){if(!s.longSwipes)return void t.slideTo(t.activeIndex);"next"===t.swipeDirection&&(A>=s.longSwipesRatio?t.slideTo(L+B):t.slideTo(L)),"prev"===t.swipeDirection&&(A>1-s.longSwipesRatio?t.slideTo(L+B):t.slideTo(L))}else{if(!s.shortSwipes)return void t.slideTo(t.activeIndex);t.navigation&&(h.target===t.navigation.nextEl||h.target===t.navigation.prevEl)?h.target===t.navigation.nextEl?t.slideTo(L+B):t.slideTo(L):("next"===t.swipeDirection&&t.slideTo(L+B),"prev"===t.swipeDirection&&t.slideTo(L))}}}function $(){var e=this.params,t=this.el;if(!t||0!==t.offsetWidth){e.breakpoints&&this.setBreakpoint();var i=this.allowSlideNext,s=this.allowSlidePrev,a=this.snapGrid;this.allowSlideNext=!0,this.allowSlidePrev=!0,this.updateSize(),this.updateSlides(),this.updateSlidesClasses(),("auto"===e.slidesPerView||e.slidesPerView>1)&&this.isEnd&&!this.params.centeredSlides?this.slideTo(this.slides.length-1,0,!1,!0):this.slideTo(this.activeIndex,0,!1,!0),this.autoplay&&this.autoplay.running&&this.autoplay.paused&&this.autoplay.run(),this.allowSlidePrev=s,this.allowSlideNext=i,this.params.watchOverflow&&a!==this.snapGrid&&this.checkOverflow()}}function G(e){this.allowClick||(this.params.preventClicks&&e.preventDefault(),this.params.preventClicksPropagation&&this.animating&&(e.stopPropagation(),e.stopImmediatePropagation()))}function N(){var e=this.wrapperEl;this.previousTranslate=this.translate,this.translate=this.isHorizontal()?-e.scrollLeft:-e.scrollTop,-0===this.translate&&(this.translate=0),this.updateActiveIndex(),this.updateSlidesClasses();var t=this.maxTranslate()-this.minTranslate();(0===t?0:(this.translate-this.minTranslate())/t)!==this.progress&&this.updateProgress(this.translate),this.emit("setTranslate",this.translate,!1)}var V=!1;function F(){}var H={init:!0,direction:"horizontal",touchEventsTarget:"container",initialSlide:0,speed:300,cssMode:!1,updateOnWindowResize:!0,preventInteractionOnTransition:!1,edgeSwipeDetection:!1,edgeSwipeThreshold:20,freeMode:!1,freeModeMomentum:!0,freeModeMomentumRatio:1,freeModeMomentumBounce:!0,freeModeMomentumBounceRatio:1,freeModeMomentumVelocityRatio:1,freeModeSticky:!1,freeModeMinimumVelocity:.02,autoHeight:!1,setWrapperSize:!1,virtualTranslate:!1,effect:"slide",breakpoints:void 0,spaceBetween:0,slidesPerView:1,slidesPerColumn:1,slidesPerColumnFill:"column",slidesPerGroup:1,slidesPerGroupSkip:0,centeredSlides:!1,centeredSlidesBounds:!1,slidesOffsetBefore:0,slidesOffsetAfter:0,normalizeSlideIndex:!0,centerInsufficientSlides:!1,watchOverflow:!1,roundLengths:!1,touchRatio:1,touchAngle:45,simulateTouch:!0,shortSwipes:!0,longSwipes:!0,longSwipesRatio:.5,longSwipesMs:300,followFinger:!0,allowTouchMove:!0,threshold:0,touchMoveStopPropagation:!1,touchStartPreventDefault:!0,touchStartForcePreventDefault:!1,touchReleaseOnEdges:!1,uniqueNavElements:!0,resistance:!0,resistanceRatio:.85,watchSlidesProgress:!1,watchSlidesVisibility:!1,grabCursor:!1,preventClicks:!0,preventClicksPropagation:!0,slideToClickedSlide:!1,preloadImages:!0,updateOnImagesReady:!0,loop:!1,loopAdditionalSlides:0,loopedSlides:null,loopFillGroupWithBlank:!1,allowSlidePrev:!0,allowSlideNext:!0,swipeHandler:null,noSwiping:!0,noSwipingClass:"swiper-no-swiping",noSwipingSelector:null,passiveListeners:!0,containerModifierClass:"swiper-container-",slideClass:"swiper-slide",slideBlankClass:"swiper-slide-invisible-blank",slideActiveClass:"swiper-slide-active",slideDuplicateActiveClass:"swiper-slide-duplicate-active",slideVisibleClass:"swiper-slide-visible",slideDuplicateClass:"swiper-slide-duplicate",slideNextClass:"swiper-slide-next",slideDuplicateNextClass:"swiper-slide-duplicate-next",slidePrevClass:"swiper-slide-prev",slideDuplicatePrevClass:"swiper-slide-duplicate-prev",wrapperClass:"swiper-wrapper",runCallbacksOnInit:!0},R={update:h,translate:p,transition:u,slide:c,loop:v,grabCursor:f,manipulation:I,events:{attachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl;this.onTouchStart=A.bind(this),this.onTouchMove=B.bind(this),this.onTouchEnd=D.bind(this),t.cssMode&&(this.onScroll=N.bind(this)),this.onClick=G.bind(this);var n=!!t.nested;if(!l.touch&&l.pointerEvents)s.addEventListener(i.start,this.onTouchStart,!1),e.addEventListener(i.move,this.onTouchMove,n),e.addEventListener(i.end,this.onTouchEnd,!1);else{if(l.touch){var r=!("touchstart"!==i.start||!l.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};s.addEventListener(i.start,this.onTouchStart,r),s.addEventListener(i.move,this.onTouchMove,l.passiveListener?{passive:!1,capture:n}:n),s.addEventListener(i.end,this.onTouchEnd,r),i.cancel&&s.addEventListener(i.cancel,this.onTouchEnd,r),V||(e.addEventListener("touchstart",F),V=!0)}(t.simulateTouch&&!O.ios&&!O.android||t.simulateTouch&&!l.touch&&O.ios)&&(s.addEventListener("mousedown",this.onTouchStart,!1),e.addEventListener("mousemove",this.onTouchMove,n),e.addEventListener("mouseup",this.onTouchEnd,!1))}(t.preventClicks||t.preventClicksPropagation)&&s.addEventListener("click",this.onClick,!0),t.cssMode&&a.addEventListener("scroll",this.onScroll),t.updateOnWindowResize?this.on(O.ios||O.android?"resize orientationchange observerUpdate":"resize observerUpdate",$,!0):this.on("observerUpdate",$,!0)},detachEvents:function(){var t=this.params,i=this.touchEvents,s=this.el,a=this.wrapperEl,n=!!t.nested;if(!l.touch&&l.pointerEvents)s.removeEventListener(i.start,this.onTouchStart,!1),e.removeEventListener(i.move,this.onTouchMove,n),e.removeEventListener(i.end,this.onTouchEnd,!1);else{if(l.touch){var r=!("onTouchStart"!==i.start||!l.passiveListener||!t.passiveListeners)&&{passive:!0,capture:!1};s.removeEventListener(i.start,this.onTouchStart,r),s.removeEventListener(i.move,this.onTouchMove,n),s.removeEventListener(i.end,this.onTouchEnd,r),i.cancel&&s.removeEventListener(i.cancel,this.onTouchEnd,r)}(t.simulateTouch&&!O.ios&&!O.android||t.simulateTouch&&!l.touch&&O.ios)&&(s.removeEventListener("mousedown",this.onTouchStart,!1),e.removeEventListener("mousemove",this.onTouchMove,n),e.removeEventListener("mouseup",this.onTouchEnd,!1))}(t.preventClicks||t.preventClicksPropagation)&&s.removeEventListener("click",this.onClick,!0),t.cssMode&&a.removeEventListener("scroll",this.onScroll),this.off(O.ios||O.android?"resize orientationchange observerUpdate":"resize observerUpdate",$)}},breakpoints:{setBreakpoint:function(){var e=this.activeIndex,t=this.initialized,i=this.loopedSlides;void 0===i&&(i=0);var s=this.params,a=this.$el,n=s.breakpoints;if(n&&(!n||0!==Object.keys(n).length)){var l=this.getBreakpoint(n);if(l&&this.currentBreakpoint!==l){var o=l in n?n[l]:void 0;o&&["slidesPerView","spaceBetween","slidesPerGroup","slidesPerGroupSkip","slidesPerColumn"].forEach((function(e){var t=o[e];void 0!==t&&(o[e]="slidesPerView"!==e||"AUTO"!==t&&"auto"!==t?"slidesPerView"===e?parseFloat(t):parseInt(t,10):"auto")}));var d=o||this.originalParams,h=s.slidesPerColumn>1,p=d.slidesPerColumn>1;h&&!p?a.removeClass(s.containerModifierClass+"multirow "+s.containerModifierClass+"multirow-column"):!h&&p&&(a.addClass(s.containerModifierClass+"multirow"),"column"===d.slidesPerColumnFill&&a.addClass(s.containerModifierClass+"multirow-column"));var u=d.direction&&d.direction!==s.direction,c=s.loop&&(d.slidesPerView!==s.slidesPerView||u);u&&t&&this.changeDirection(),r.extend(this.params,d),r.extend(this,{allowTouchMove:this.params.allowTouchMove,allowSlideNext:this.params.allowSlideNext,allowSlidePrev:this.params.allowSlidePrev}),this.currentBreakpoint=l,c&&t&&(this.loopDestroy(),this.loopCreate(),this.updateSlides(),this.slideTo(e-i+this.loopedSlides,0,!1)),this.emit("breakpoint",d)}}},getBreakpoint:function(e){if(e){var i=!1,s=Object.keys(e).map((function(e){if("string"==typeof e&&e.startsWith("@")){var i=parseFloat(e.substr(1));return{value:t.innerHeight*i,point:e}}return{value:e,point:e}}));s.sort((function(e,t){return parseInt(e.value,10)-parseInt(t.value,10)}));for(var a=0;a<s.length;a+=1){var n=s[a],r=n.point;n.value<=t.innerWidth&&(i=r)}return i||"max"}}},checkOverflow:{checkOverflow:function(){var e=this.params,t=this.isLocked,i=this.slides.length>0&&e.slidesOffsetBefore+e.spaceBetween*(this.slides.length-1)+this.slides[0].offsetWidth*this.slides.length;e.slidesOffsetBefore&&e.slidesOffsetAfter&&i?this.isLocked=i<=this.size:this.isLocked=1===this.snapGrid.length,this.allowSlideNext=!this.isLocked,this.allowSlidePrev=!this.isLocked,t!==this.isLocked&&this.emit(this.isLocked?"lock":"unlock"),t&&t!==this.isLocked&&(this.isEnd=!1,this.navigation.update())}},classes:{addClasses:function(){var e=this.classNames,t=this.params,i=this.rtl,s=this.$el,a=[];a.push("initialized"),a.push(t.direction),t.freeMode&&a.push("free-mode"),t.autoHeight&&a.push("autoheight"),i&&a.push("rtl"),t.slidesPerColumn>1&&(a.push("multirow"),"column"===t.slidesPerColumnFill&&a.push("multirow-column")),O.android&&a.push("android"),O.ios&&a.push("ios"),t.cssMode&&a.push("css-mode"),a.forEach((function(i){e.push(t.containerModifierClass+i)})),s.addClass(e.join(" "))},removeClasses:function(){var e=this.$el,t=this.classNames;e.removeClass(t.join(" "))}},images:{loadImage:function(e,i,s,a,n,r){var l;function o(){r&&r()}e.complete&&n?o():i?((l=new t.Image).onload=o,l.onerror=o,a&&(l.sizes=a),s&&(l.srcset=s),i&&(l.src=i)):o()},preloadImages:function(){var e=this;function t(){null!=e&&e&&!e.destroyed&&(void 0!==e.imagesLoaded&&(e.imagesLoaded+=1),e.imagesLoaded===e.imagesToLoad.length&&(e.params.updateOnImagesReady&&e.update(),e.emit("imagesReady")))}e.imagesToLoad=e.$el.find("img");for(var i=0;i<e.imagesToLoad.length;i+=1){var s=e.imagesToLoad[i];e.loadImage(s,s.currentSrc||s.getAttribute("src"),s.srcset||s.getAttribute("srcset"),s.sizes||s.getAttribute("sizes"),!0,t)}}}},j={},W=function(e){function t(){for(var i,a,n,o=[],d=arguments.length;d--;)o[d]=arguments[d];1===o.length&&o[0].constructor&&o[0].constructor===Object?n=o[0]:(a=(i=o)[0],n=i[1]),n||(n={}),n=r.extend({},n),a&&!n.el&&(n.el=a),e.call(this,n),Object.keys(R).forEach((function(e){Object.keys(R[e]).forEach((function(i){t.prototype[i]||(t.prototype[i]=R[e][i])}))}));var h=this;void 0===h.modules&&(h.modules={}),Object.keys(h.modules).forEach((function(e){var t=h.modules[e];if(t.params){var i=Object.keys(t.params)[0],s=t.params[i];if("object"!=typeof s||null===s)return;if(!(i in n&&"enabled"in s))return;!0===n[i]&&(n[i]={enabled:!0}),"object"!=typeof n[i]||"enabled"in n[i]||(n[i].enabled=!0),n[i]||(n[i]={enabled:!1})}}));var p=r.extend({},H);h.useModulesParams(p),h.params=r.extend({},p,j,n),h.originalParams=r.extend({},h.params),h.passedParams=r.extend({},n),h.$=s;var u=s(h.params.el);if(a=u[0]){if(u.length>1){var c=[];return u.each((function(e,i){var s=r.extend({},n,{el:i});c.push(new t(s))})),c}var v,f,m;return a.swiper=h,u.data("swiper",h),a&&a.shadowRoot&&a.shadowRoot.querySelector?(v=s(a.shadowRoot.querySelector("."+h.params.wrapperClass))).children=function(e){return u.children(e)}:v=u.children("."+h.params.wrapperClass),r.extend(h,{$el:u,el:a,$wrapperEl:v,wrapperEl:v[0],classNames:[],slides:s(),slidesGrid:[],snapGrid:[],slidesSizesGrid:[],isHorizontal:function(){return"horizontal"===h.params.direction},isVertical:function(){return"vertical"===h.params.direction},rtl:"rtl"===a.dir.toLowerCase()||"rtl"===u.css("direction"),rtlTranslate:"horizontal"===h.params.direction&&("rtl"===a.dir.toLowerCase()||"rtl"===u.css("direction")),wrongRTL:"-webkit-box"===v.css("display"),activeIndex:0,realIndex:0,isBeginning:!0,isEnd:!1,translate:0,previousTranslate:0,progress:0,velocity:0,animating:!1,allowSlideNext:h.params.allowSlideNext,allowSlidePrev:h.params.allowSlidePrev,touchEvents:(f=["touchstart","touchmove","touchend","touchcancel"],m=["mousedown","mousemove","mouseup"],l.pointerEvents&&(m=["pointerdown","pointermove","pointerup"]),h.touchEventsTouch={start:f[0],move:f[1],end:f[2],cancel:f[3]},h.touchEventsDesktop={start:m[0],move:m[1],end:m[2]},l.touch||!h.params.simulateTouch?h.touchEventsTouch:h.touchEventsDesktop),touchEventsData:{isTouched:void 0,isMoved:void 0,allowTouchCallbacks:void 0,touchStartTime:void 0,isScrolling:void 0,currentTranslate:void 0,startTranslate:void 0,allowThresholdMove:void 0,formElements:"input, select, option, textarea, button, video",lastClickTime:r.now(),clickTimeout:void 0,velocities:[],allowMomentumBounce:void 0,isTouchEvent:void 0,startMoving:void 0},allowClick:!0,allowTouchMove:h.params.allowTouchMove,touches:{startX:0,startY:0,currentX:0,currentY:0,diff:0},imagesToLoad:[],imagesLoaded:0}),h.useModules(),h.params.init&&h.init(),h}}e&&(t.__proto__=e),t.prototype=Object.create(e&&e.prototype),t.prototype.constructor=t;var i={extendedDefaults:{configurable:!0},defaults:{configurable:!0},Class:{configurable:!0},$:{configurable:!0}};return t.prototype.slidesPerViewDynamic=function(){var e=this.params,t=this.slides,i=this.slidesGrid,s=this.size,a=this.activeIndex,n=1;if(e.centeredSlides){for(var r,l=t[a].swiperSlideSize,o=a+1;o<t.length;o+=1)t[o]&&!r&&(n+=1,(l+=t[o].swiperSlideSize)>s&&(r=!0));for(var d=a-1;d>=0;d-=1)t[d]&&!r&&(n+=1,(l+=t[d].swiperSlideSize)>s&&(r=!0))}else for(var h=a+1;h<t.length;h+=1)i[h]-i[a]<s&&(n+=1);return n},t.prototype.update=function(){var e=this;if(e&&!e.destroyed){var t=e.snapGrid,i=e.params;i.breakpoints&&e.setBreakpoint(),e.updateSize(),e.updateSlides(),e.updateProgress(),e.updateSlidesClasses(),e.params.freeMode?(s(),e.params.autoHeight&&e.updateAutoHeight()):(("auto"===e.params.slidesPerView||e.params.slidesPerView>1)&&e.isEnd&&!e.params.centeredSlides?e.slideTo(e.slides.length-1,0,!1,!0):e.slideTo(e.activeIndex,0,!1,!0))||s(),i.watchOverflow&&t!==e.snapGrid&&e.checkOverflow(),e.emit("update")}function s(){var t=e.rtlTranslate?-1*e.translate:e.translate,i=Math.min(Math.max(t,e.maxTranslate()),e.minTranslate());e.setTranslate(i),e.updateActiveIndex(),e.updateSlidesClasses()}},t.prototype.changeDirection=function(e,t){void 0===t&&(t=!0);var i=this.params.direction;return e||(e="horizontal"===i?"vertical":"horizontal"),e===i||"horizontal"!==e&&"vertical"!==e?this:(this.$el.removeClass(""+this.params.containerModifierClass+i).addClass(""+this.params.containerModifierClass+e),this.params.direction=e,this.slides.each((function(t,i){"vertical"===e?i.style.width="":i.style.height=""})),this.emit("changeDirection"),t&&this.update(),this)},t.prototype.init=function(){this.initialized||(this.emit("beforeInit"),this.params.breakpoints&&this.setBreakpoint(),this.addClasses(),this.params.loop&&this.loopCreate(),this.updateSize(),this.updateSlides(),this.params.watchOverflow&&this.checkOverflow(),this.params.grabCursor&&this.setGrabCursor(),this.params.preloadImages&&this.preloadImages(),this.params.loop?this.slideTo(this.params.initialSlide+this.loopedSlides,0,this.params.runCallbacksOnInit):this.slideTo(this.params.initialSlide,0,this.params.runCallbacksOnInit),this.attachEvents(),this.initialized=!0,this.emit("init"))},t.prototype.destroy=function(e,t){void 0===e&&(e=!0),void 0===t&&(t=!0);var i=this,s=i.params,a=i.$el,n=i.$wrapperEl,l=i.slides;return void 0===i.params||i.destroyed?null:(i.emit("beforeDestroy"),i.initialized=!1,i.detachEvents(),s.loop&&i.loopDestroy(),t&&(i.removeClasses(),a.removeAttr("style"),n.removeAttr("style"),l&&l.length&&l.removeClass([s.slideVisibleClass,s.slideActiveClass,s.slideNextClass,s.slidePrevClass].join(" ")).removeAttr("style").removeAttr("data-swiper-slide-index")),i.emit("destroy"),Object.keys(i.eventsListeners).forEach((function(e){i.off(e)})),!1!==e&&(i.$el[0].swiper=null,i.$el.data("swiper",null),r.deleteProps(i)),i.destroyed=!0,null)},t.extendDefaults=function(e){r.extend(j,e)},i.extendedDefaults.get=function(){return j},i.defaults.get=function(){return H},i.Class.get=function(){return e},i.$.get=function(){return s},Object.defineProperties(t,i),t}(o),q={name:"device",proto:{device:O},static:{device:O}},X={name:"support",proto:{support:l},static:{support:l}},Y={isEdge:!!t.navigator.userAgent.match(/Edge/g),isSafari:function(){var e=t.navigator.userAgent.toLowerCase();return e.indexOf("safari")>=0&&e.indexOf("chrome")<0&&e.indexOf("android")<0}(),isUiWebView:/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(t.navigator.userAgent)},U={name:"browser",proto:{browser:Y},static:{browser:Y}},K={name:"resize",create:function(){var e=this;r.extend(e,{resize:{resizeHandler:function(){e&&!e.destroyed&&e.initialized&&(e.emit("beforeResize"),e.emit("resize"))},orientationChangeHandler:function(){e&&!e.destroyed&&e.initialized&&e.emit("orientationchange")}}})},on:{init:function(){t.addEventListener("resize",this.resize.resizeHandler),t.addEventListener("orientationchange",this.resize.orientationChangeHandler)},destroy:function(){t.removeEventListener("resize",this.resize.resizeHandler),t.removeEventListener("orientationchange",this.resize.orientationChangeHandler)}}},_={func:t.MutationObserver||t.WebkitMutationObserver,attach:function(e,i){void 0===i&&(i={});var s=this,a=new(0,_.func)((function(e){if(1!==e.length){var i=function(){s.emit("observerUpdate",e[0])};t.requestAnimationFrame?t.requestAnimationFrame(i):t.setTimeout(i,0)}else s.emit("observerUpdate",e[0])}));a.observe(e,{attributes:void 0===i.attributes||i.attributes,childList:void 0===i.childList||i.childList,characterData:void 0===i.characterData||i.characterData}),s.observer.observers.push(a)},init:function(){if(l.observer&&this.params.observer){if(this.params.observeParents)for(var e=this.$el.parents(),t=0;t<e.length;t+=1)this.observer.attach(e[t]);this.observer.attach(this.$el[0],{childList:this.params.observeSlideChildren}),this.observer.attach(this.$wrapperEl[0],{attributes:!1})}},destroy:function(){this.observer.observers.forEach((function(e){e.disconnect()})),this.observer.observers=[]}},Q={update:function(e){var t=this,i=t.params,s=i.slidesPerView,a=i.slidesPerGroup,n=i.centeredSlides,l=t.params.virtual,o=l.addSlidesBefore,d=l.addSlidesAfter,h=t.virtual,p=h.from,u=h.to,c=h.slides,v=h.slidesGrid,f=h.renderSlide,m=h.offset;t.updateActiveIndex();var g,y,b,w=t.activeIndex||0;g=t.rtlTranslate?"right":t.isHorizontal()?"left":"top",n?(y=Math.floor(s/2)+a+o,b=Math.floor(s/2)+a+d):(y=s+(a-1)+o,b=a+d);var C=Math.max((w||0)-b,0),x=Math.min((w||0)+y,c.length-1),S=(t.slidesGrid[C]||0)-(t.slidesGrid[0]||0);function T(){t.updateSlides(),t.updateProgress(),t.updateSlidesClasses(),t.lazy&&t.params.lazy.enabled&&t.lazy.load()}if(r.extend(t.virtual,{from:C,to:x,offset:S,slidesGrid:t.slidesGrid}),p===C&&u===x&&!e)return t.slidesGrid!==v&&S!==m&&t.slides.css(g,S+"px"),void t.updateProgress();if(t.params.virtual.renderExternal)return t.params.virtual.renderExternal.call(t,{offset:S,from:C,to:x,slides:function(){for(var e=[],t=C;t<=x;t+=1)e.push(c[t]);return e}()}),void T();var E=[],M=[];if(e)t.$wrapperEl.find("."+t.params.slideClass).remove();else for(var k=p;k<=u;k+=1)(k<C||k>x)&&t.$wrapperEl.find("."+t.params.slideClass+'[data-swiper-slide-index="'+k+'"]').remove();for(var P=0;P<c.length;P+=1)P>=C&&P<=x&&(void 0===u||e?M.push(P):(P>u&&M.push(P),P<p&&E.push(P)));M.forEach((function(e){t.$wrapperEl.append(f(c[e],e))})),E.sort((function(e,t){return t-e})).forEach((function(e){t.$wrapperEl.prepend(f(c[e],e))})),t.$wrapperEl.children(".swiper-slide").css(g,S+"px"),T()},renderSlide:function(e,t){var i=this.params.virtual;if(i.cache&&this.virtual.cache[t])return this.virtual.cache[t];var a=i.renderSlide?s(i.renderSlide.call(this,e,t)):s('<div class="'+this.params.slideClass+'" data-swiper-slide-index="'+t+'">'+e+"</div>");return a.attr("data-swiper-slide-index")||a.attr("data-swiper-slide-index",t),i.cache&&(this.virtual.cache[t]=a),a},appendSlide:function(e){if("object"==typeof e&&"length"in e)for(var t=0;t<e.length;t+=1)e[t]&&this.virtual.slides.push(e[t]);else this.virtual.slides.push(e);this.virtual.update(!0)},prependSlide:function(e){var t=this.activeIndex,i=t+1,s=1;if(Array.isArray(e)){for(var a=0;a<e.length;a+=1)e[a]&&this.virtual.slides.unshift(e[a]);i=t+e.length,s=e.length}else this.virtual.slides.unshift(e);if(this.params.virtual.cache){var n=this.virtual.cache,r={};Object.keys(n).forEach((function(e){var t=n[e],i=t.attr("data-swiper-slide-index");i&&t.attr("data-swiper-slide-index",parseInt(i,10)+1),r[parseInt(e,10)+s]=t})),this.virtual.cache=r}this.virtual.update(!0),this.slideTo(i,0)},removeSlide:function(e){if(null!=e){var t=this.activeIndex;if(Array.isArray(e))for(var i=e.length-1;i>=0;i-=1)this.virtual.slides.splice(e[i],1),this.params.virtual.cache&&delete this.virtual.cache[e[i]],e[i]<t&&(t-=1),t=Math.max(t,0);else this.virtual.slides.splice(e,1),this.params.virtual.cache&&delete this.virtual.cache[e],e<t&&(t-=1),t=Math.max(t,0);this.virtual.update(!0),this.slideTo(t,0)}},removeAllSlides:function(){this.virtual.slides=[],this.params.virtual.cache&&(this.virtual.cache={}),this.virtual.update(!0),this.slideTo(0,0)}},J={update:function(){var e=this.params.navigation;if(!this.params.loop){var t=this.navigation,i=t.$nextEl,s=t.$prevEl;s&&s.length>0&&(this.isBeginning?s.addClass(e.disabledClass):s.removeClass(e.disabledClass),s[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass)),i&&i.length>0&&(this.isEnd?i.addClass(e.disabledClass):i.removeClass(e.disabledClass),i[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](e.lockClass))}},onPrevClick:function(e){e.preventDefault(),this.isBeginning&&!this.params.loop||this.slidePrev()},onNextClick:function(e){e.preventDefault(),this.isEnd&&!this.params.loop||this.slideNext()},init:function(){var e,t,i=this.params.navigation;(i.nextEl||i.prevEl)&&(i.nextEl&&(e=s(i.nextEl),this.params.uniqueNavElements&&"string"==typeof i.nextEl&&e.length>1&&1===this.$el.find(i.nextEl).length&&(e=this.$el.find(i.nextEl))),i.prevEl&&(t=s(i.prevEl),this.params.uniqueNavElements&&"string"==typeof i.prevEl&&t.length>1&&1===this.$el.find(i.prevEl).length&&(t=this.$el.find(i.prevEl))),e&&e.length>0&&e.on("click",this.navigation.onNextClick),t&&t.length>0&&t.on("click",this.navigation.onPrevClick),r.extend(this.navigation,{$nextEl:e,nextEl:e&&e[0],$prevEl:t,prevEl:t&&t[0]}))},destroy:function(){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;t&&t.length&&(t.off("click",this.navigation.onNextClick),t.removeClass(this.params.navigation.disabledClass)),i&&i.length&&(i.off("click",this.navigation.onPrevClick),i.removeClass(this.params.navigation.disabledClass))}},Z={update:function(){var e=this.rtl,t=this.params.pagination;if(t.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var i,a=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,n=this.pagination.$el,r=this.params.loop?Math.ceil((a-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length;if(this.params.loop?((i=Math.ceil((this.activeIndex-this.loopedSlides)/this.params.slidesPerGroup))>a-1-2*this.loopedSlides&&(i-=a-2*this.loopedSlides),i>r-1&&(i-=r),i<0&&"bullets"!==this.params.paginationType&&(i=r+i)):i=void 0!==this.snapIndex?this.snapIndex:this.activeIndex||0,"bullets"===t.type&&this.pagination.bullets&&this.pagination.bullets.length>0){var l,o,d,h=this.pagination.bullets;if(t.dynamicBullets&&(this.pagination.bulletSize=h.eq(0)[this.isHorizontal()?"outerWidth":"outerHeight"](!0),n.css(this.isHorizontal()?"width":"height",this.pagination.bulletSize*(t.dynamicMainBullets+4)+"px"),t.dynamicMainBullets>1&&void 0!==this.previousIndex&&(this.pagination.dynamicBulletIndex+=i-this.previousIndex,this.pagination.dynamicBulletIndex>t.dynamicMainBullets-1?this.pagination.dynamicBulletIndex=t.dynamicMainBullets-1:this.pagination.dynamicBulletIndex<0&&(this.pagination.dynamicBulletIndex=0)),l=i-this.pagination.dynamicBulletIndex,d=((o=l+(Math.min(h.length,t.dynamicMainBullets)-1))+l)/2),h.removeClass(t.bulletActiveClass+" "+t.bulletActiveClass+"-next "+t.bulletActiveClass+"-next-next "+t.bulletActiveClass+"-prev "+t.bulletActiveClass+"-prev-prev "+t.bulletActiveClass+"-main"),n.length>1)h.each((function(e,a){var n=s(a),r=n.index();r===i&&n.addClass(t.bulletActiveClass),t.dynamicBullets&&(r>=l&&r<=o&&n.addClass(t.bulletActiveClass+"-main"),r===l&&n.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),r===o&&n.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next"))}));else{var p=h.eq(i),u=p.index();if(p.addClass(t.bulletActiveClass),t.dynamicBullets){for(var c=h.eq(l),v=h.eq(o),f=l;f<=o;f+=1)h.eq(f).addClass(t.bulletActiveClass+"-main");if(this.params.loop)if(u>=h.length-t.dynamicMainBullets){for(var m=t.dynamicMainBullets;m>=0;m-=1)h.eq(h.length-m).addClass(t.bulletActiveClass+"-main");h.eq(h.length-t.dynamicMainBullets-1).addClass(t.bulletActiveClass+"-prev")}else c.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),v.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next");else c.prev().addClass(t.bulletActiveClass+"-prev").prev().addClass(t.bulletActiveClass+"-prev-prev"),v.next().addClass(t.bulletActiveClass+"-next").next().addClass(t.bulletActiveClass+"-next-next")}}if(t.dynamicBullets){var g=Math.min(h.length,t.dynamicMainBullets+4),y=(this.pagination.bulletSize*g-this.pagination.bulletSize)/2-d*this.pagination.bulletSize,b=e?"right":"left";h.css(this.isHorizontal()?b:"top",y+"px")}}if("fraction"===t.type&&(n.find("."+t.currentClass).text(t.formatFractionCurrent(i+1)),n.find("."+t.totalClass).text(t.formatFractionTotal(r))),"progressbar"===t.type){var w;w=t.progressbarOpposite?this.isHorizontal()?"vertical":"horizontal":this.isHorizontal()?"horizontal":"vertical";var C=(i+1)/r,x=1,S=1;"horizontal"===w?x=C:S=C,n.find("."+t.progressbarFillClass).transform("translate3d(0,0,0) scaleX("+x+") scaleY("+S+")").transition(this.params.speed)}"custom"===t.type&&t.renderCustom?(n.html(t.renderCustom(this,i+1,r)),this.emit("paginationRender",this,n[0])):this.emit("paginationUpdate",this,n[0]),n[this.params.watchOverflow&&this.isLocked?"addClass":"removeClass"](t.lockClass)}},render:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.virtual&&this.params.virtual.enabled?this.virtual.slides.length:this.slides.length,i=this.pagination.$el,s="";if("bullets"===e.type){for(var a=this.params.loop?Math.ceil((t-2*this.loopedSlides)/this.params.slidesPerGroup):this.snapGrid.length,n=0;n<a;n+=1)e.renderBullet?s+=e.renderBullet.call(this,n,e.bulletClass):s+="<"+e.bulletElement+' class="'+e.bulletClass+'"></'+e.bulletElement+">";i.html(s),this.pagination.bullets=i.find("."+e.bulletClass)}"fraction"===e.type&&(s=e.renderFraction?e.renderFraction.call(this,e.currentClass,e.totalClass):'<span class="'+e.currentClass+'"></span> / <span class="'+e.totalClass+'"></span>',i.html(s)),"progressbar"===e.type&&(s=e.renderProgressbar?e.renderProgressbar.call(this,e.progressbarFillClass):'<span class="'+e.progressbarFillClass+'"></span>',i.html(s)),"custom"!==e.type&&this.emit("paginationRender",this.pagination.$el[0])}},init:function(){var e=this,t=e.params.pagination;if(t.el){var i=s(t.el);0!==i.length&&(e.params.uniqueNavElements&&"string"==typeof t.el&&i.length>1&&1===e.$el.find(t.el).length&&(i=e.$el.find(t.el)),"bullets"===t.type&&t.clickable&&i.addClass(t.clickableClass),i.addClass(t.modifierClass+t.type),"bullets"===t.type&&t.dynamicBullets&&(i.addClass(""+t.modifierClass+t.type+"-dynamic"),e.pagination.dynamicBulletIndex=0,t.dynamicMainBullets<1&&(t.dynamicMainBullets=1)),"progressbar"===t.type&&t.progressbarOpposite&&i.addClass(t.progressbarOppositeClass),t.clickable&&i.on("click","."+t.bulletClass,(function(t){t.preventDefault();var i=s(this).index()*e.params.slidesPerGroup;e.params.loop&&(i+=e.loopedSlides),e.slideTo(i)})),r.extend(e.pagination,{$el:i,el:i[0]}))}},destroy:function(){var e=this.params.pagination;if(e.el&&this.pagination.el&&this.pagination.$el&&0!==this.pagination.$el.length){var t=this.pagination.$el;t.removeClass(e.hiddenClass),t.removeClass(e.modifierClass+e.type),this.pagination.bullets&&this.pagination.bullets.removeClass(e.bulletActiveClass),e.clickable&&t.off("click","."+e.bulletClass)}}},ee={loadInSlide:function(e,t){void 0===t&&(t=!0);var i=this,a=i.params.lazy;if(void 0!==e&&0!==i.slides.length){var n=i.virtual&&i.params.virtual.enabled?i.$wrapperEl.children("."+i.params.slideClass+'[data-swiper-slide-index="'+e+'"]'):i.slides.eq(e),r=n.find("."+a.elementClass+":not(."+a.loadedClass+"):not(."+a.loadingClass+")");!n.hasClass(a.elementClass)||n.hasClass(a.loadedClass)||n.hasClass(a.loadingClass)||(r=r.add(n[0])),0!==r.length&&r.each((function(e,r){var l=s(r);l.addClass(a.loadingClass);var o=l.attr("data-background"),d=l.attr("data-src"),h=l.attr("data-srcset"),p=l.attr("data-sizes");i.loadImage(l[0],d||o,h,p,!1,(function(){if(null!=i&&i&&(!i||i.params)&&!i.destroyed){if(o?(l.css("background-image",'url("'+o+'")'),l.removeAttr("data-background")):(h&&(l.attr("srcset",h),l.removeAttr("data-srcset")),p&&(l.attr("sizes",p),l.removeAttr("data-sizes")),d&&(l.attr("src",d),l.removeAttr("data-src"))),l.addClass(a.loadedClass).removeClass(a.loadingClass),n.find("."+a.preloaderClass).remove(),i.params.loop&&t){var e=n.attr("data-swiper-slide-index");if(n.hasClass(i.params.slideDuplicateClass)){var s=i.$wrapperEl.children('[data-swiper-slide-index="'+e+'"]:not(.'+i.params.slideDuplicateClass+")");i.lazy.loadInSlide(s.index(),!1)}else{var r=i.$wrapperEl.children("."+i.params.slideDuplicateClass+'[data-swiper-slide-index="'+e+'"]');i.lazy.loadInSlide(r.index(),!1)}}i.emit("lazyImageReady",n[0],l[0])}})),i.emit("lazyImageLoad",n[0],l[0])}))}},load:function(){var e=this,t=e.$wrapperEl,i=e.params,a=e.slides,n=e.activeIndex,r=e.virtual&&i.virtual.enabled,l=i.lazy,o=i.slidesPerView;function d(e){if(r){if(t.children("."+i.slideClass+'[data-swiper-slide-index="'+e+'"]').length)return!0}else if(a[e])return!0;return!1}function h(e){return r?s(e).attr("data-swiper-slide-index"):s(e).index()}if("auto"===o&&(o=0),e.lazy.initialImageLoaded||(e.lazy.initialImageLoaded=!0),e.params.watchSlidesVisibility)t.children("."+i.slideVisibleClass).each((function(t,i){var a=r?s(i).attr("data-swiper-slide-index"):s(i).index();e.lazy.loadInSlide(a)}));else if(o>1)for(var p=n;p<n+o;p+=1)d(p)&&e.lazy.loadInSlide(p);else e.lazy.loadInSlide(n);if(l.loadPrevNext)if(o>1||l.loadPrevNextAmount&&l.loadPrevNextAmount>1){for(var u=l.loadPrevNextAmount,c=o,v=Math.min(n+c+Math.max(u,c),a.length),f=Math.max(n-Math.max(c,u),0),m=n+o;m<v;m+=1)d(m)&&e.lazy.loadInSlide(m);for(var g=f;g<n;g+=1)d(g)&&e.lazy.loadInSlide(g)}else{var y=t.children("."+i.slideNextClass);y.length>0&&e.lazy.loadInSlide(h(y));var b=t.children("."+i.slidePrevClass);b.length>0&&e.lazy.loadInSlide(h(b))}}},te={makeElFocusable:function(e){return e.attr("tabIndex","0"),e},addElRole:function(e,t){return e.attr("role",t),e},addElLabel:function(e,t){return e.attr("aria-label",t),e},disableEl:function(e){return e.attr("aria-disabled",!0),e},enableEl:function(e){return e.attr("aria-disabled",!1),e},onEnterKey:function(e){var t=this.params.a11y;if(13===e.keyCode){var i=s(e.target);this.navigation&&this.navigation.$nextEl&&i.is(this.navigation.$nextEl)&&(this.isEnd&&!this.params.loop||this.slideNext(),this.isEnd?this.a11y.notify(t.lastSlideMessage):this.a11y.notify(t.nextSlideMessage)),this.navigation&&this.navigation.$prevEl&&i.is(this.navigation.$prevEl)&&(this.isBeginning&&!this.params.loop||this.slidePrev(),this.isBeginning?this.a11y.notify(t.firstSlideMessage):this.a11y.notify(t.prevSlideMessage)),this.pagination&&i.is("."+this.params.pagination.bulletClass)&&i[0].click()}},notify:function(e){var t=this.a11y.liveRegion;0!==t.length&&(t.html(""),t.html(e))},updateNavigation:function(){if(!this.params.loop&&this.navigation){var e=this.navigation,t=e.$nextEl,i=e.$prevEl;i&&i.length>0&&(this.isBeginning?this.a11y.disableEl(i):this.a11y.enableEl(i)),t&&t.length>0&&(this.isEnd?this.a11y.disableEl(t):this.a11y.enableEl(t))}},updatePagination:function(){var e=this,t=e.params.a11y;e.pagination&&e.params.pagination.clickable&&e.pagination.bullets&&e.pagination.bullets.length&&e.pagination.bullets.each((function(i,a){var n=s(a);e.a11y.makeElFocusable(n),e.a11y.addElRole(n,"button"),e.a11y.addElLabel(n,t.paginationBulletMessage.replace(/{{index}}/,n.index()+1))}))},init:function(){this.$el.append(this.a11y.liveRegion);var e,t,i=this.params.a11y;this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&(this.a11y.makeElFocusable(e),this.a11y.addElRole(e,"button"),this.a11y.addElLabel(e,i.nextSlideMessage),e.on("keydown",this.a11y.onEnterKey)),t&&(this.a11y.makeElFocusable(t),this.a11y.addElRole(t,"button"),this.a11y.addElLabel(t,i.prevSlideMessage),t.on("keydown",this.a11y.onEnterKey)),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.on("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)},destroy:function(){var e,t;this.a11y.liveRegion&&this.a11y.liveRegion.length>0&&this.a11y.liveRegion.remove(),this.navigation&&this.navigation.$nextEl&&(e=this.navigation.$nextEl),this.navigation&&this.navigation.$prevEl&&(t=this.navigation.$prevEl),e&&e.off("keydown",this.a11y.onEnterKey),t&&t.off("keydown",this.a11y.onEnterKey),this.pagination&&this.params.pagination.clickable&&this.pagination.bullets&&this.pagination.bullets.length&&this.pagination.$el.off("keydown","."+this.params.pagination.bulletClass,this.a11y.onEnterKey)}},ie={run:function(){var e=this,t=e.slides.eq(e.activeIndex),i=e.params.autoplay.delay;t.attr("data-swiper-autoplay")&&(i=t.attr("data-swiper-autoplay")||e.params.autoplay.delay),clearTimeout(e.autoplay.timeout),e.autoplay.timeout=r.nextTick((function(){e.params.autoplay.reverseDirection?e.params.loop?(e.loopFix(),e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.isBeginning?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(e.slides.length-1,e.params.speed,!0,!0),e.emit("autoplay")):(e.slidePrev(e.params.speed,!0,!0),e.emit("autoplay")):e.params.loop?(e.loopFix(),e.slideNext(e.params.speed,!0,!0),e.emit("autoplay")):e.isEnd?e.params.autoplay.stopOnLastSlide?e.autoplay.stop():(e.slideTo(0,e.params.speed,!0,!0),e.emit("autoplay")):(e.slideNext(e.params.speed,!0,!0),e.emit("autoplay")),e.params.cssMode&&e.autoplay.running&&e.autoplay.run()}),i)},start:function(){return void 0===this.autoplay.timeout&&(!this.autoplay.running&&(this.autoplay.running=!0,this.emit("autoplayStart"),this.autoplay.run(),!0))},stop:function(){return!!this.autoplay.running&&(void 0!==this.autoplay.timeout&&(this.autoplay.timeout&&(clearTimeout(this.autoplay.timeout),this.autoplay.timeout=void 0),this.autoplay.running=!1,this.emit("autoplayStop"),!0))},pause:function(e){this.autoplay.running&&(this.autoplay.paused||(this.autoplay.timeout&&clearTimeout(this.autoplay.timeout),this.autoplay.paused=!0,0!==e&&this.params.autoplay.waitForTransition?(this.$wrapperEl[0].addEventListener("transitionend",this.autoplay.onTransitionEnd),this.$wrapperEl[0].addEventListener("webkitTransitionEnd",this.autoplay.onTransitionEnd)):(this.autoplay.paused=!1,this.autoplay.run())))}},se=[q,X,U,K,{name:"observer",params:{observer:!1,observeParents:!1,observeSlideChildren:!1},create:function(){r.extend(this,{observer:{init:_.init.bind(this),attach:_.attach.bind(this),destroy:_.destroy.bind(this),observers:[]}})},on:{init:function(){this.observer.init()},destroy:function(){this.observer.destroy()}}},{name:"virtual",params:{virtual:{enabled:!1,slides:[],cache:!0,renderSlide:null,renderExternal:null,addSlidesBefore:0,addSlidesAfter:0}},create:function(){r.extend(this,{virtual:{update:Q.update.bind(this),appendSlide:Q.appendSlide.bind(this),prependSlide:Q.prependSlide.bind(this),removeSlide:Q.removeSlide.bind(this),removeAllSlides:Q.removeAllSlides.bind(this),renderSlide:Q.renderSlide.bind(this),slides:this.params.virtual.slides,cache:{}}})},on:{beforeInit:function(){if(this.params.virtual.enabled){this.classNames.push(this.params.containerModifierClass+"virtual");var e={watchSlidesProgress:!0};r.extend(this.params,e),r.extend(this.originalParams,e),this.params.initialSlide||this.virtual.update()}},setTranslate:function(){this.params.virtual.enabled&&this.virtual.update()}}},{name:"navigation",params:{navigation:{nextEl:null,prevEl:null,hideOnClick:!1,disabledClass:"swiper-button-disabled",hiddenClass:"swiper-button-hidden",lockClass:"swiper-button-lock"}},create:function(){r.extend(this,{navigation:{init:J.init.bind(this),update:J.update.bind(this),destroy:J.destroy.bind(this),onNextClick:J.onNextClick.bind(this),onPrevClick:J.onPrevClick.bind(this)}})},on:{init:function(){this.navigation.init(),this.navigation.update()},toEdge:function(){this.navigation.update()},fromEdge:function(){this.navigation.update()},destroy:function(){this.navigation.destroy()},click:function(e){var t,i=this.navigation,a=i.$nextEl,n=i.$prevEl;!this.params.navigation.hideOnClick||s(e.target).is(n)||s(e.target).is(a)||(a?t=a.hasClass(this.params.navigation.hiddenClass):n&&(t=n.hasClass(this.params.navigation.hiddenClass)),!0===t?this.emit("navigationShow",this):this.emit("navigationHide",this),a&&a.toggleClass(this.params.navigation.hiddenClass),n&&n.toggleClass(this.params.navigation.hiddenClass))}}},{name:"pagination",params:{pagination:{el:null,bulletElement:"span",clickable:!1,hideOnClick:!1,renderBullet:null,renderProgressbar:null,renderFraction:null,renderCustom:null,progressbarOpposite:!1,type:"bullets",dynamicBullets:!1,dynamicMainBullets:1,formatFractionCurrent:function(e){return e},formatFractionTotal:function(e){return e},bulletClass:"swiper-pagination-bullet",bulletActiveClass:"swiper-pagination-bullet-active",modifierClass:"swiper-pagination-",currentClass:"swiper-pagination-current",totalClass:"swiper-pagination-total",hiddenClass:"swiper-pagination-hidden",progressbarFillClass:"swiper-pagination-progressbar-fill",progressbarOppositeClass:"swiper-pagination-progressbar-opposite",clickableClass:"swiper-pagination-clickable",lockClass:"swiper-pagination-lock"}},create:function(){r.extend(this,{pagination:{init:Z.init.bind(this),render:Z.render.bind(this),update:Z.update.bind(this),destroy:Z.destroy.bind(this),dynamicBulletIndex:0}})},on:{init:function(){this.pagination.init(),this.pagination.render(),this.pagination.update()},activeIndexChange:function(){this.params.loop?this.pagination.update():void 0===this.snapIndex&&this.pagination.update()},snapIndexChange:function(){this.params.loop||this.pagination.update()},slidesLengthChange:function(){this.params.loop&&(this.pagination.render(),this.pagination.update())},snapGridLengthChange:function(){this.params.loop||(this.pagination.render(),this.pagination.update())},destroy:function(){this.pagination.destroy()},click:function(e){this.params.pagination.el&&this.params.pagination.hideOnClick&&this.pagination.$el.length>0&&!s(e.target).hasClass(this.params.pagination.bulletClass)&&(!0===this.pagination.$el.hasClass(this.params.pagination.hiddenClass)?this.emit("paginationShow",this):this.emit("paginationHide",this),this.pagination.$el.toggleClass(this.params.pagination.hiddenClass))}}},{name:"lazy",params:{lazy:{enabled:!1,loadPrevNext:!1,loadPrevNextAmount:1,loadOnTransitionStart:!1,elementClass:"swiper-lazy",loadingClass:"swiper-lazy-loading",loadedClass:"swiper-lazy-loaded",preloaderClass:"swiper-lazy-preloader"}},create:function(){r.extend(this,{lazy:{initialImageLoaded:!1,load:ee.load.bind(this),loadInSlide:ee.loadInSlide.bind(this)}})},on:{beforeInit:function(){this.params.lazy.enabled&&this.params.preloadImages&&(this.params.preloadImages=!1)},init:function(){this.params.lazy.enabled&&!this.params.loop&&0===this.params.initialSlide&&this.lazy.load()},scroll:function(){this.params.freeMode&&!this.params.freeModeSticky&&this.lazy.load()},resize:function(){this.params.lazy.enabled&&this.lazy.load()},scrollbarDragMove:function(){this.params.lazy.enabled&&this.lazy.load()},transitionStart:function(){this.params.lazy.enabled&&(this.params.lazy.loadOnTransitionStart||!this.params.lazy.loadOnTransitionStart&&!this.lazy.initialImageLoaded)&&this.lazy.load()},transitionEnd:function(){this.params.lazy.enabled&&!this.params.lazy.loadOnTransitionStart&&this.lazy.load()},slideChange:function(){this.params.lazy.enabled&&this.params.cssMode&&this.lazy.load()}}},{name:"a11y",params:{a11y:{enabled:!0,notificationClass:"swiper-notification",prevSlideMessage:"Previous slide",nextSlideMessage:"Next slide",firstSlideMessage:"This is the first slide",lastSlideMessage:"This is the last slide",paginationBulletMessage:"Go to slide {{index}}"}},create:function(){var e=this;r.extend(e,{a11y:{liveRegion:s('<span class="'+e.params.a11y.notificationClass+'" aria-live="assertive" aria-atomic="true"></span>')}}),Object.keys(te).forEach((function(t){e.a11y[t]=te[t].bind(e)}))},on:{init:function(){this.params.a11y.enabled&&(this.a11y.init(),this.a11y.updateNavigation())},toEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},fromEdge:function(){this.params.a11y.enabled&&this.a11y.updateNavigation()},paginationUpdate:function(){this.params.a11y.enabled&&this.a11y.updatePagination()},destroy:function(){this.params.a11y.enabled&&this.a11y.destroy()}}},{name:"autoplay",params:{autoplay:{enabled:!1,delay:3e3,waitForTransition:!0,disableOnInteraction:!0,stopOnLastSlide:!1,reverseDirection:!1}},create:function(){var e=this;r.extend(e,{autoplay:{running:!1,paused:!1,run:ie.run.bind(e),start:ie.start.bind(e),stop:ie.stop.bind(e),pause:ie.pause.bind(e),onVisibilityChange:function(){"hidden"===document.visibilityState&&e.autoplay.running&&e.autoplay.pause(),"visible"===document.visibilityState&&e.autoplay.paused&&(e.autoplay.run(),e.autoplay.paused=!1)},onTransitionEnd:function(t){e&&!e.destroyed&&e.$wrapperEl&&t.target===this&&(e.$wrapperEl[0].removeEventListener("transitionend",e.autoplay.onTransitionEnd),e.$wrapperEl[0].removeEventListener("webkitTransitionEnd",e.autoplay.onTransitionEnd),e.autoplay.paused=!1,e.autoplay.running?e.autoplay.run():e.autoplay.stop())}}})},on:{init:function(){this.params.autoplay.enabled&&(this.autoplay.start(),document.addEventListener("visibilitychange",this.autoplay.onVisibilityChange))},beforeTransitionStart:function(e,t){this.autoplay.running&&(t||!this.params.autoplay.disableOnInteraction?this.autoplay.pause(e):this.autoplay.stop())},sliderFirstMove:function(){this.autoplay.running&&(this.params.autoplay.disableOnInteraction?this.autoplay.stop():this.autoplay.pause())},touchEnd:function(){this.params.cssMode&&this.autoplay.paused&&!this.params.autoplay.disableOnInteraction&&this.autoplay.run()},destroy:function(){this.autoplay.running&&this.autoplay.stop(),document.removeEventListener("visibilitychange",this.autoplay.onVisibilityChange)}}}];return void 0===W.use&&(W.use=W.Class.use,W.installModule=W.Class.installModule),W.use(se),W}));
//# sourceMappingURL=swiper.min.js.map;
/*!
 * Particleground
 *
 * @author Jonathan Nicol - @mrjnicol
 * @version 1.1.0
 * @description Creates a canvas based particle system background
 *
 * Inspired by http://requestlab.fr/ and http://disruptivebydesign.com/
 */
!function (a, b) { "use strict"; function c(a) { a = a || {}; for (var b = 1; b < arguments.length; b++) { var c = arguments[b]; if (c) for (var d in c) c.hasOwnProperty(d) && ("object" == typeof c[d] ? deepExtend(a[d], c[d]) : a[d] = c[d]) } return a } function d(d, g) { function h() { if (y) { r = b.createElement("canvas"), r.className = "pg-canvas", r.style.display = "block", d.insertBefore(r, d.firstChild), s = r.getContext("2d"), i(); for (var c = Math.round(r.width * r.height / g.density), e = 0; c > e; e++) { var f = new n; f.setStackPos(e), z.push(f) } a.addEventListener("resize", function () { k() }, !1), b.addEventListener("mousemove", function (a) { A = a.pageX, B = a.pageY }, !1), D && !C && a.addEventListener("deviceorientation", function () { F = Math.min(Math.max(-event.beta, -30), 30), E = Math.min(Math.max(-event.gamma, -30), 30) }, !0), j(), q("onInit") } } function i() { r.width = d.offsetWidth, r.height = d.offsetHeight, s.fillStyle = g.dotColor, s.strokeStyle = g.lineColor, s.lineWidth = g.lineWidth } function j() { if (y) { u = a.innerWidth, v = a.innerHeight, s.clearRect(0, 0, r.width, r.height); for (var b = 0; b < z.length; b++)z[b].updatePosition(); for (var b = 0; b < z.length; b++)z[b].draw(); G || (t = requestAnimationFrame(j)) } } function k() { i(); for (var a = d.offsetWidth, b = d.offsetHeight, c = z.length - 1; c >= 0; c--)(z[c].position.x > a || z[c].position.y > b) && z.splice(c, 1); var e = Math.round(r.width * r.height / g.density); if (e > z.length) for (; e > z.length;) { var f = new n; z.push(f) } else e < z.length && z.splice(e); for (c = z.length - 1; c >= 0; c--)z[c].setStackPos(c) } function l() { G = !0 } function m() { G = !1, j() } function n() { switch (this.stackPos, this.active = !0, this.layer = Math.ceil(3 * Math.random()), this.parallaxOffsetX = 0, this.parallaxOffsetY = 0, this.position = { x: Math.ceil(Math.random() * r.width), y: Math.ceil(Math.random() * r.height) }, this.speed = {}, g.directionX) { case "left": this.speed.x = +(-g.maxSpeedX + Math.random() * g.maxSpeedX - g.minSpeedX).toFixed(2); break; case "right": this.speed.x = +(Math.random() * g.maxSpeedX + g.minSpeedX).toFixed(2); break; default: this.speed.x = +(-g.maxSpeedX / 2 + Math.random() * g.maxSpeedX).toFixed(2), this.speed.x += this.speed.x > 0 ? g.minSpeedX : -g.minSpeedX }switch (g.directionY) { case "up": this.speed.y = +(-g.maxSpeedY + Math.random() * g.maxSpeedY - g.minSpeedY).toFixed(2); break; case "down": this.speed.y = +(Math.random() * g.maxSpeedY + g.minSpeedY).toFixed(2); break; default: this.speed.y = +(-g.maxSpeedY / 2 + Math.random() * g.maxSpeedY).toFixed(2), this.speed.x += this.speed.y > 0 ? g.minSpeedY : -g.minSpeedY } } function o(a, b) { return b ? void (g[a] = b) : g[a] } function p() { console.log("destroy"), r.parentNode.removeChild(r), q("onDestroy"), f && f(d).removeData("plugin_" + e) } function q(a) { void 0 !== g[a] && g[a].call(d) } var r, s, t, u, v, w, x, y = !!b.createElement("canvas").getContext, z = [], A = 0, B = 0, C = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i), D = !!a.DeviceOrientationEvent, E = 0, F = 0, G = !1; return g = c({}, a[e].defaults, g), n.prototype.draw = function () { s.beginPath(), s.arc(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY, g.particleRadius / 2, 0, 2 * Math.PI, !0), s.closePath(), s.fill(), s.beginPath(); for (var a = z.length - 1; a > this.stackPos; a--) { var b = z[a], c = this.position.x - b.position.x, d = this.position.y - b.position.y, e = Math.sqrt(c * c + d * d).toFixed(2); e < g.proximity && (s.moveTo(this.position.x + this.parallaxOffsetX, this.position.y + this.parallaxOffsetY), g.curvedLines ? s.quadraticCurveTo(Math.max(b.position.x, b.position.x), Math.min(b.position.y, b.position.y), b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY) : s.lineTo(b.position.x + b.parallaxOffsetX, b.position.y + b.parallaxOffsetY)) } s.stroke(), s.closePath() }, n.prototype.updatePosition = function () { if (g.parallax) { if (D && !C) { var a = (u - 0) / 60; w = (E - -30) * a + 0; var b = (v - 0) / 60; x = (F - -30) * b + 0 } else w = A, x = B; this.parallaxTargX = (w - u / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetX += (this.parallaxTargX - this.parallaxOffsetX) / 10, this.parallaxTargY = (x - v / 2) / (g.parallaxMultiplier * this.layer), this.parallaxOffsetY += (this.parallaxTargY - this.parallaxOffsetY) / 10 } var c = d.offsetWidth, e = d.offsetHeight; switch (g.directionX) { case "left": this.position.x + this.speed.x + this.parallaxOffsetX < 0 && (this.position.x = c - this.parallaxOffsetX); break; case "right": this.position.x + this.speed.x + this.parallaxOffsetX > c && (this.position.x = 0 - this.parallaxOffsetX); break; default: (this.position.x + this.speed.x + this.parallaxOffsetX > c || this.position.x + this.speed.x + this.parallaxOffsetX < 0) && (this.speed.x = -this.speed.x) }switch (g.directionY) { case "up": this.position.y + this.speed.y + this.parallaxOffsetY < 0 && (this.position.y = e - this.parallaxOffsetY); break; case "down": this.position.y + this.speed.y + this.parallaxOffsetY > e && (this.position.y = 0 - this.parallaxOffsetY); break; default: (this.position.y + this.speed.y + this.parallaxOffsetY > e || this.position.y + this.speed.y + this.parallaxOffsetY < 0) && (this.speed.y = -this.speed.y) }this.position.x += this.speed.x, this.position.y += this.speed.y }, n.prototype.setStackPos = function (a) { this.stackPos = a }, h(), { option: o, destroy: p, start: m, pause: l } } var e = "particleground", f = a.jQuery; a[e] = function (a, b) { return new d(a, b) }, a[e].defaults = { minSpeedX: .1, maxSpeedX: .7, minSpeedY: .1, maxSpeedY: .7, directionX: "center", directionY: "center", density: 1e4, dotColor: "#666666", lineColor: "#666666", particleRadius: 7, lineWidth: 1, curvedLines: !1, proximity: 100, parallax: !0, parallaxMultiplier: 5, onInit: function () { }, onDestroy: function () { } }, f && (f.fn[e] = function (a) { if ("string" == typeof arguments[0]) { var b, c = arguments[0], g = Array.prototype.slice.call(arguments, 1); return this.each(function () { f.data(this, "plugin_" + e) && "function" == typeof f.data(this, "plugin_" + e)[c] && (b = f.data(this, "plugin_" + e)[c].apply(this, g)) }), void 0 !== b ? b : this } return "object" != typeof a && a ? void 0 : this.each(function () { f.data(this, "plugin_" + e) || f.data(this, "plugin_" + e, new d(this, a)) }) }) }(window, document),/**
 * requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 * @see: http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * @see: http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 * @license: MIT license
 */
  function () { for (var a = 0, b = ["ms", "moz", "webkit", "o"], c = 0; c < b.length && !window.requestAnimationFrame; ++c)window.requestAnimationFrame = window[b[c] + "RequestAnimationFrame"], window.cancelAnimationFrame = window[b[c] + "CancelAnimationFrame"] || window[b[c] + "CancelRequestAnimationFrame"]; window.requestAnimationFrame || (window.requestAnimationFrame = function (b) { var c = (new Date).getTime(), d = Math.max(0, 16 - (c - a)), e = window.setTimeout(function () { b(c + d) }, d); return a = c + d, e }), window.cancelAnimationFrame || (window.cancelAnimationFrame = function (a) { clearTimeout(a) }) }();
!function(t){t.fn.recliner=function(n){function i(i){var a=t(i),e=a.attr(n.attrib),r=a.prop("tagName");e?(a.addClass("lazy-loading"),/^(IMG|IFRAME|AUDIO|EMBED|SOURCE|TRACK|VIDEO)$/.test(r)?(a.attr("src",e),a[0].onload=function(t){o(a)}):!0===n.getScript?t.getScript(e,function(t){o(a)}):a.load(e,function(t){o(a)})):o(a)}function o(t){t.removeClass("lazy-loading"),t.addClass("lazy-loaded"),t.trigger("lazyshow")}function a(){var i=c.filter(function(){var i=t(this);if("none"!=i.css("display")){var o=void 0!==window.innerHeight?window.innerHeight:d.height(),a=d.scrollTop(),e=a+o,r=i.offset().top;return r+i.height()>=a-n.threshold&&r<=e+n.threshold}});r=i.trigger("lazyload"),c=c.not(r)}function e(t){t.one("lazyload",function(){i(this)}),a()}var r,l,d=t(window),c=this,s=this.selector,n=t.extend({attrib:"data-src",throttle:300,threshold:100,printable:!0,live:!0,getScript:!1},n);return d.on("scroll.lazy resize.lazy lookup.lazy",function(t){l&&clearTimeout(l),l=setTimeout(function(){d.trigger("lazyupdate")},n.throttle)}),d.on("lazyupdate",function(t){a()}),n.live&&t(document).ajaxSuccess(function(n,i,o){var a=t(s).not(".lazy-loaded").not(".lazy-loading");c=c.add(a),e(a)}),n.printable&&window.matchMedia&&window.matchMedia("print").addListener(function(n){n.matches&&t(s).trigger("lazyload")}),e(this),this}}(jQuery);
/*! npm.im/object-fit-images 3.2.3 */
var objectFitImages = (function () {
'use strict';

var OFI = 'bfred-it:object-fit-images';
var propRegex = /(object-fit|object-position)\s*:\s*([-\w\s%]+)/g;
var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
var supportsObjectFit = 'object-fit' in testImg.style;
var supportsObjectPosition = 'object-position' in testImg.style;
var supportsOFI = 'background-size' in testImg.style;
var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
var nativeGetAttribute = testImg.getAttribute;
var nativeSetAttribute = testImg.setAttribute;
var autoModeEnabled = false;

function createPlaceholder(w, h) {
	return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
}

function polyfillCurrentSrc(el) {
	if (el.srcset && !supportsCurrentSrc && window.picturefill) {
		var pf = window.picturefill._;
		// parse srcset with picturefill where currentSrc isn't available
		if (!el[pf.ns] || !el[pf.ns].evaled) {
			// force synchronous srcset parsing
			pf.fillImg(el, {reselect: true});
		}

		if (!el[pf.ns].curSrc) {
			// force picturefill to parse srcset
			el[pf.ns].supported = false;
			pf.fillImg(el, {reselect: true});
		}

		// retrieve parsed currentSrc, if any
		el.currentSrc = el[pf.ns].curSrc || el.src;
	}
}

function getStyle(el) {
	var style = getComputedStyle(el).fontFamily;
	var parsed;
	var props = {};
	while ((parsed = propRegex.exec(style)) !== null) {
		props[parsed[1]] = parsed[2];
	}
	return props;
}

function setPlaceholder(img, width, height) {
	// Default: fill width, no height
	var placeholder = createPlaceholder(width || 1, height || 0);

	// Only set placeholder if it's different
	if (nativeGetAttribute.call(img, 'src') !== placeholder) {
		nativeSetAttribute.call(img, 'src', placeholder);
	}
}

function onImageReady(img, callback) {
	// naturalWidth is only available when the image headers are loaded,
	// this loop will poll it every 100ms.
	if (img.naturalWidth) {
		callback(img);
	} else {
		setTimeout(onImageReady, 100, img, callback);
	}
}

function fixOne(el) {
	var style = getStyle(el);
	var ofi = el[OFI];
	style['object-fit'] = style['object-fit'] || 'fill'; // default value

	// Avoid running where unnecessary, unless OFI had already done its deed
	if (!ofi.img) {
		// fill is the default behavior so no action is necessary
		if (style['object-fit'] === 'fill') {
			return;
		}

		// Where object-fit is supported and object-position isn't (Safari < 10)
		if (
			!ofi.skipTest && // unless user wants to apply regardless of browser support
			supportsObjectFit && // if browser already supports object-fit
			!style['object-position'] // unless object-position is used
		) {
			return;
		}
	}

	// keep a clone in memory while resetting the original to a blank
	if (!ofi.img) {
		ofi.img = new Image(el.width, el.height);
		ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
		ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

		// preserve for any future cloneNode calls
		// https://github.com/bfred-it/object-fit-images/issues/53
		nativeSetAttribute.call(el, "data-ofi-src", el.src);
		if (el.srcset) {
			nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
		}

		setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

		// remove srcset because it overrides src
		if (el.srcset) {
			el.srcset = '';
		}
		try {
			keepSrcUsable(el);
		} catch (err) {
			if (window.console) {
				console.warn('https://bit.ly/ofi-old-browser');
			}
		}
	}

	polyfillCurrentSrc(ofi.img);

	el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
	el.style.backgroundPosition = style['object-position'] || 'center';
	el.style.backgroundRepeat = 'no-repeat';
	el.style.backgroundOrigin = 'content-box';

	if (/scale-down/.test(style['object-fit'])) {
		onImageReady(ofi.img, function () {
			if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
				el.style.backgroundSize = 'contain';
			} else {
				el.style.backgroundSize = 'auto';
			}
		});
	} else {
		el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
	}

	onImageReady(ofi.img, function (img) {
		setPlaceholder(el, img.naturalWidth, img.naturalHeight);
	});
}

function keepSrcUsable(el) {
	var descriptors = {
		get: function get(prop) {
			return el[OFI].img[prop ? prop : 'src'];
		},
		set: function set(value, prop) {
			el[OFI].img[prop ? prop : 'src'] = value;
			nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
			fixOne(el);
			return value;
		}
	};
	Object.defineProperty(el, 'src', descriptors);
	Object.defineProperty(el, 'currentSrc', {
		get: function () { return descriptors.get('currentSrc'); }
	});
	Object.defineProperty(el, 'srcset', {
		get: function () { return descriptors.get('srcset'); },
		set: function (ss) { return descriptors.set(ss, 'srcset'); }
	});
}

function hijackAttributes() {
	function getOfiImageMaybe(el, name) {
		return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
	}
	if (!supportsObjectPosition) {
		HTMLImageElement.prototype.getAttribute = function (name) {
			return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
		};

		HTMLImageElement.prototype.setAttribute = function (name, value) {
			return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
		};
	}
}

function fix(imgs, opts) {
	var startAutoMode = !autoModeEnabled && !imgs;
	opts = opts || {};
	imgs = imgs || 'img';

	if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI) {
		return false;
	}

	// use imgs as a selector or just select all images
	if (imgs === 'img') {
		imgs = document.getElementsByTagName('img');
	} else if (typeof imgs === 'string') {
		imgs = document.querySelectorAll(imgs);
	} else if (!('length' in imgs)) {
		imgs = [imgs];
	}

	// apply fix to all
	for (var i = 0; i < imgs.length; i++) {
		imgs[i][OFI] = imgs[i][OFI] || {
			skipTest: opts.skipTest
		};
		fixOne(imgs[i]);
	}

	if (startAutoMode) {
		document.body.addEventListener('load', function (e) {
			if (e.target.tagName === 'IMG') {
				fix(e.target, {
					skipTest: opts.skipTest
				});
			}
		}, true);
		autoModeEnabled = true;
		imgs = 'img'; // reset to a generic selector for watchMQ
	}

	// if requested, watch media queries for object-fit change
	if (opts.watchMQ) {
		window.addEventListener('resize', fix.bind(null, imgs, {
			skipTest: opts.skipTest
		}));
	}
}

fix.supportsObjectFit = supportsObjectFit;
fix.supportsObjectPosition = supportsObjectPosition;

hijackAttributes();

return fix;

}());
/*! a11y-dialog 5.3.1 — © Edenspiekermann */
!function(t){"use strict";function i(t,i){this._show=this.show.bind(this),this._hide=this.hide.bind(this),this._maintainFocus=this._maintainFocus.bind(this),this._bindKeypress=this._bindKeypress.bind(this),this.container=t,this.dialog=t.querySelector('dialog, [role="dialog"], [role="alertdialog"]'),this.role=this.dialog.getAttribute("role")||"dialog",this.useDialog="show"in document.createElement("dialog")&&"DIALOG"===this.dialog.nodeName,this._listeners={},this.create(i)}function e(t){return Array.prototype.slice.call(t)}function n(t,i){return e((i||document).querySelectorAll(t))}function o(t){return NodeList.prototype.isPrototypeOf(t)?e(t):Element.prototype.isPrototypeOf(t)?[t]:"string"==typeof t?n(t):void 0}function s(t){var i=r(t),e=t.querySelector("[autofocus]")||i[0];e&&e.focus()}function r(t){return n(c.join(","),t).filter(function(t){return!!(t.offsetWidth||t.offsetHeight||t.getClientRects().length)})}function h(t,i){var e=r(t),n=e.indexOf(document.activeElement);i.shiftKey&&0===n?(e[e.length-1].focus(),i.preventDefault()):i.shiftKey||n!==e.length-1||(e[0].focus(),i.preventDefault())}function a(t){var i=e(t.parentNode.childNodes),n=i.filter(function(t){return 1===t.nodeType});return n.splice(n.indexOf(t),1),n}var d,c=['a[href]:not([tabindex^="-"]):not([inert])','area[href]:not([tabindex^="-"]):not([inert])',"input:not([disabled]):not([inert])","select:not([disabled]):not([inert])","textarea:not([disabled]):not([inert])","button:not([disabled]):not([inert])",'iframe:not([tabindex^="-"]):not([inert])','audio:not([tabindex^="-"]):not([inert])','video:not([tabindex^="-"]):not([inert])','[contenteditable]:not([tabindex^="-"]):not([inert])','[tabindex]:not([tabindex^="-"]):not([inert])'];i.prototype.create=function(t){return this._targets=this._targets||o(t)||a(this.container),this.shown=this.dialog.hasAttribute("open"),this.dialog.setAttribute("role",this.role),this.useDialog?this.container.setAttribute("data-a11y-dialog-native",""):this.shown?this.container.removeAttribute("aria-hidden"):this.container.setAttribute("aria-hidden",!0),this._openers=n('[data-a11y-dialog-show="'+this.container.id+'"]'),this._openers.forEach(function(t){t.addEventListener("click",this._show)}.bind(this)),this._closers=n("[data-a11y-dialog-hide]",this.container).concat(n('[data-a11y-dialog-hide="'+this.container.id+'"]')),this._closers.forEach(function(t){t.addEventListener("click",this._hide)}.bind(this)),this._fire("create"),this},i.prototype.show=function(t){return this.shown?this:(this.shown=!0,d=document.activeElement,this.useDialog?this.dialog.showModal(t instanceof Event?void 0:t):(this.dialog.setAttribute("open",""),this.container.removeAttribute("aria-hidden"),this._targets.forEach(function(t){t.setAttribute("aria-hidden","true")})),s(this.dialog),document.body.addEventListener("focus",this._maintainFocus,!0),document.addEventListener("keydown",this._bindKeypress),this._fire("show",t),this)},i.prototype.hide=function(t){return this.shown?(this.shown=!1,this.useDialog?this.dialog.close(t instanceof Event?void 0:t):(this.dialog.removeAttribute("open"),this.container.setAttribute("aria-hidden","true"),this._targets.forEach(function(t){t.removeAttribute("aria-hidden")})),d&&d.focus&&d.focus(),document.body.removeEventListener("focus",this._maintainFocus,!0),document.removeEventListener("keydown",this._bindKeypress),this._fire("hide",t),this):this},i.prototype.destroy=function(){return this.hide(),this._openers.forEach(function(t){t.removeEventListener("click",this._show)}.bind(this)),this._closers.forEach(function(t){t.removeEventListener("click",this._hide)}.bind(this)),this._fire("destroy"),this._listeners={},this},i.prototype.on=function(t,i){return void 0===this._listeners[t]&&(this._listeners[t]=[]),this._listeners[t].push(i),this},i.prototype.off=function(t,i){var e=this._listeners[t].indexOf(i);return e>-1&&this._listeners[t].splice(e,1),this},i.prototype._fire=function(t,i){(this._listeners[t]||[]).forEach(function(t){t(this.container,i)}.bind(this))},i.prototype._bindKeypress=function(t){this.shown&&27===t.which&&"alertdialog"!==this.role&&(t.preventDefault(),this.hide(t)),this.shown&&9===t.which&&h(this.dialog,t)},i.prototype._maintainFocus=function(t){this.shown&&!this.container.contains(t.target)&&s(this.dialog)},"undefined"!=typeof module&&void 0!==module.exports?module.exports=i:"function"==typeof define&&define.amd?define("A11yDialog",[],function(){return i}):"object"==typeof t&&(t.A11yDialog=i)}("undefined"!=typeof global?global:window);
/*
 FlexSearch v0.6.22
 Copyright 2019 Nextapps GmbH
 Author: Thomas Wilkerling
 Released under the Apache 2.0 Licence
 https://github.com/nextapps-de/flexsearch
*/
'use strict';(function(v,L,N){let H;(H=N.define)&&H.amd?H([],function(){return L}):(H=N.modules)?H[v.toLowerCase()]=L:"object"===typeof exports?module.exports=L:N[v]=L})("FlexSearch",function(){function v(a,b){const c=b?b.id:a&&a.id;this.id=c||0===c?c:ja++;this.init(a,b);ca(this,"index",function(){return this.a?Object.keys(this.a.index[this.a.keys[0]].f):Object.keys(this.f)});ca(this,"length",function(){return this.index.length})}function L(a){const b=D();for(const c in a)if(a.hasOwnProperty(c)){const d=
a[c];b[c]=F(d)?d.slice(0):J(d)?L(d):d}return b}function N(a,b){const c=a.length,d=O(b),e=[];for(let k=0,f=0;k<c;k++){const g=a[k];if(d&&b(g)||!d&&!b[g])e[f++]=g}return e}function H(a,b,c,d,e,k,f,g,m,l){c=da(c,f?0:e,!1,!1,b,m,l);let q;g&&(g=c.page,q=c.next,c=c.result);if(f)a=this.where(f,null,e,c);else{a=c;b=this.g;c=a.length;e=Array(c);for(k=0;k<c;k++)e[k]=b[a[k]];a=e}c=a;d&&(O(d)||(I=d.split(":"),1<I.length?d=ka:(I=I[0],d=la)),c.sort(d));return c=P(g,q,c)}function ca(a,b,c){Object.defineProperty(a,
b,{get:c})}function p(a){return new RegExp(a,"g")}function M(a,b){for(let c=0;c<b.length;c+=2)a=a.replace(b[c],b[c+1]);return a}function S(a,b,c,d,e,k,f,g){if(b[c])return b[c];e=e?(g-(f||g/1.5))*k+(f||g/1.5)*e:k;b[c]=e;e>=f&&(a=a[g-(e+.5>>0)],a=a[c]||(a[c]=[]),a[a.length]=d);return e}function W(a,b){if(a){const c=Object.keys(a);for(let d=0,e=c.length;d<e;d++){const k=c[d],f=a[k];if(f)for(let g=0,m=f.length;g<m;g++)if(f[g]===b){1===m?delete a[k]:f.splice(g,1);break}else J(f[g])&&W(f[g],b)}}}function X(a){let b=
"",c="";var d="";for(let e=0;e<a.length;e++){const k=a[e];if(k!==c)if(e&&"h"===k){if(d="a"===d||"e"===d||"i"===d||"o"===d||"u"===d||"y"===d,("a"===c||"e"===c||"i"===c||"o"===c||"u"===c||"y"===c)&&d||" "===c)b+=k}else b+=k;d=e===a.length-1?"":a[e+1];c=k}return b}function ma(a,b){a=a.length-b.length;return 0>a?1:a?-1:0}function la(a,b){a=a[I];b=b[I];return a<b?-1:a>b?1:0}function ka(a,b){const c=I.length;for(let d=0;d<c;d++)a=a[I[d]],b=b[I[d]];return a<b?-1:a>b?1:0}function P(a,b,c){return a?{page:a,
next:b?""+b:null,result:c}:c}function da(a,b,c,d,e,k,f){let g,m=[];if(!0===c){c="0";var l=""}else l=c&&c.split(":");const q=a.length;if(1<q){const w=D(),r=[];let x,z;var n=0,h;let E;var u=!0;let B,C=0,Y,Z,T,aa;l&&(2===l.length?(T=l,l=!1):l=aa=parseInt(l[0],10));if(f){for(x=D();n<q;n++)if("not"===e[n])for(z=a[n],E=z.length,h=0;h<E;h++)x["@"+z[h]]=1;else Z=n+1;if(Q(Z))return P(c,g,m);n=0}else Y=K(e)&&e;let U;for(;n<q;n++){const na=n===(Z||q)-1;if(!Y||!n)if((h=Y||e&&e[n])&&"and"!==h)if("or"===h)U=!1;
else continue;else U=k=!0;z=a[n];if(E=z.length){if(u)if(B){var t=B.length;for(h=0;h<t;h++){u=B[h];var y="@"+u;f&&x[y]||(w[y]=1,k||(m[C++]=u))}B=null;u=!1}else{B=z;continue}y=!1;for(h=0;h<E;h++){t=z[h];var A="@"+t;const V=k?w[A]||0:n;if(!(!V&&!d||f&&x[A]||!k&&w[A]))if(V===n){if(na){if(!aa||--aa<C)if(m[C++]=t,b&&C===b)return P(c,C+(l||0),m)}else w[A]=n+1;y=!0}else d&&(A=r[V]||(r[V]=[]),A[A.length]=t)}if(U&&!y&&!d)break}else if(U&&!d)return P(c,g,z)}if(B)if(n=B.length,f)for(h=l?parseInt(l,10):0;h<n;h++)a=
B[h],x["@"+a]||(m[C++]=a);else m=B;if(d)for(C=m.length,T?(n=parseInt(T[0],10)+1,h=parseInt(T[1],10)+1):(n=r.length,h=0);n--;)if(t=r[n]){for(E=t.length;h<E;h++)if(d=t[h],!f||!x["@"+d])if(m[C++]=d,b&&C===b)return P(c,n+":"+h,m);h=0}}else!q||e&&"not"===e[0]||(m=a[0],l&&(l=parseInt(l[0],10)));b&&(f=m.length,l&&l>f&&(l=0),l=l||0,g=l+b,g<f?m=m.slice(l,g):(g=0,l&&(m=m.slice(l))));return P(c,g,m)}function K(a){return"string"===typeof a}function F(a){return a.constructor===Array}function O(a){return"function"===
typeof a}function J(a){return"object"===typeof a}function Q(a){return"undefined"===typeof a}function ea(a){const b=Array(a);for(let c=0;c<a;c++)b[c]=D();return b}function D(){return Object.create(null)}const G={encode:"icase",c:"forward",split:/\W+/,cache:!1,async:!1,u:!1,m:!1,a:!1,b:9,threshold:0,depth:0},fa={memory:{encode:"extra",c:"strict",threshold:0,b:1},speed:{encode:"icase",c:"strict",threshold:1,b:3,depth:2},match:{encode:"extra",c:"full",threshold:1,b:3},score:{encode:"extra",c:"strict",
threshold:1,b:9,depth:4},balance:{encode:"balance",c:"strict",threshold:0,b:3,depth:3},fast:{encode:"icase",c:"strict",threshold:8,b:9,depth:1}},ba=[];let ja=0;const ha={},ia={};v.create=function(a,b){return new v(a,b)};v.registerMatcher=function(a){for(const b in a)a.hasOwnProperty(b)&&ba.push(p(b),a[b]);return this};v.registerEncoder=function(a,b){R[a]=b.bind(R);return this};v.registerLanguage=function(a,b){ha[a]=b.filter;ia[a]=b.stemmer;return this};v.encode=function(a,b){return R[a](b)};v.prototype.init=
function(a,b){this.o=[];if(b){var c=b.preset;a=b}else a||(a=G),c=a.preset;b={};K(a)?(b=fa[a],a={}):c&&(b=fa[c]);this.c=a.tokenize||b.c||this.c||G.c;this.split=a.split||this.split||G.split;this.m=a.rtl||this.m||G.m;this.async="undefined"===typeof Promise||Q(c=a.async)?this.async||G.async:c;this.threshold=Q(c=a.threshold)?b.threshold||this.threshold||G.threshold:c;this.b=Q(c=a.resolution)?c=b.b||this.b||G.b:c;c<=this.threshold&&(this.b=this.threshold+1);this.depth="strict"!==this.c||Q(c=a.depth)?b.depth||
this.depth||G.depth:c;this.i=(c=Q(c=a.encode)?b.encode||G.encode:c)&&R[c]&&R[c].bind(R)||(O(c)?c:this.i||!1);(c=a.matcher)&&this.addMatcher(c);if(c=(b=a.lang)||a.filter){K(c)&&(c=ha[c]);if(F(c)){var d=this.i,e=D();for(var k=0;k<c.length;k++){const g=d?d(c[k]):c[k];e[g]=1}c=e}this.filter=c}if(c=b||a.stemmer){var f;b=K(c)?ia[c]:c;d=this.i;e=[];for(f in b)b.hasOwnProperty(f)&&(k=d?d(f):f,e.push(p(k+"($|\\W)"),d?d(b[f]):b[f]));this.stemmer=f=e}this.a=d=(c=a.doc)?L(c):this.a||G.a;this.l=ea(this.b-(this.threshold||
0));this.h=D();this.f=D();if(d&&(this.g=D(),a.doc=null,f=d.index={},c=d.keys=[],b=d.field,F(d.id)||(d.id=d.id.split(":")),b)){let g;F(b)||(J(b)?(g=b,d.field=b=Object.keys(b)):d.field=b=[b]);for(d=0;d<b.length;d++)e=b[d],F(e)||(g&&(a=g[e]),c[d]=e,b[d]=e.split(":")),f[e]=new v(a),f[e].g=this.g}return this};v.prototype.encode=function(a){a&&ba.length&&(a=M(a,ba));a&&this.o.length&&(a=M(a,this.o));a&&this.i&&(a=this.i(a));a&&this.stemmer&&(a=M(a,this.stemmer));return a};v.prototype.addMatcher=function(a){const b=
this.o;for(const c in a)a.hasOwnProperty(c)&&b.push(p(c),a[c]);return this};v.prototype.add=function(a,b,c,d,e){if(this.a&&J(a))return this.j("add",a,b);if(b&&K(b)&&(a||0===a)){var k="@"+a;if(this.f[k]&&!d)return this.update(a,b);if(!e){if(this.async){let r=this;k=new Promise(function(x){setTimeout(function(){r.add(a,b,null,d,!0);r=null;x()})});if(c)k.then(c);else return k;return this}if(c)return this.add(a,b,null,d,!0),c(),this}b=this.encode(b);if(!b.length)return this;c=this.c;e=O(c)?c(b):b.split(this.split);
this.filter&&(e=N(e,this.filter));const n=D();n._ctx=D();const h=e.length,u=this.threshold,t=this.depth,y=this.b,A=this.l,w=this.m;for(let r=0;r<h;r++){var f=e[r];if(f){var g=f.length,m=(w?r+1:h-r)/h,l="";switch(c){case "reverse":case "both":for(var q=g;--q;)l=f[q]+l,S(A,n,l,a,w?1:(g-q)/g,m,u,y-1);l="";case "forward":for(q=0;q<g;q++)l+=f[q],S(A,n,l,a,w?(q+1)/g:1,m,u,y-1);break;case "full":for(q=0;q<g;q++){const x=(w?q+1:g-q)/g;for(let z=g;z>q;z--)l=f.substring(q,z),S(A,n,l,a,x,m,u,y-1)}break;default:if(g=
S(A,n,f,a,1,m,u,y-1),t&&1<h&&g>=u)for(g=n._ctx[f]||(n._ctx[f]=D()),f=this.h[f]||(this.h[f]=ea(y-(u||0))),m=r-t,l=r+t+1,0>m&&(m=0),l>h&&(l=h);m<l;m++)m!==r&&S(f,g,e[m],a,0,y-(m<r?r-m:m-r),u,y-1)}}}this.f[k]=1}return this};v.prototype.j=function(a,b,c){if(F(b))for(let m=0,l=b.length;m<l;m++){if(m===l-1)return this.j(a,b[m],c);this.j(a,b[m])}else{const m=this.a.index,l=this.a.keys;var d=this.a.tag,e=this.a.id;let q;let n;for(var k=0;k<e.length;k++)q=(q||b)[e[k]];if(d){for(e=0;e<d.length;e++){var f=d[e];
var g=f.split(":");for(k=0;k<g.length;k++)n=(n||b)[g[k]];n="@"+n}g=this.s[f];g=g[n]||(g[n]=[])}if("remove"===a){delete this.g[q];for(let h=0,u=l.length;h<u;h++){if(h===u-1)return m[l[h]].remove(q,c),this;m[l[h]].remove(q)}}e=this.a.field;g&&(g[g.length]=b);this.g[q]=b;for(let h=0,u=e.length;h<u;h++){d=e[h];let t;for(f=0;f<d.length;f++)t=(t||b)[d[f]];d=m[l[h]];f="add"===a?d.add:d.update;h===u-1?f.call(d,q,t,c):f.call(d,q,t)}}return this};v.prototype.update=function(a,b,c){if(this.a&&J(a))return this.j("update",
a,b);this.f["@"+a]&&K(b)&&(this.remove(a),this.add(a,b,c,!0));return this};v.prototype.remove=function(a,b,c){if(this.a&&J(a))return this.j("remove",a,b);var d="@"+a;if(this.f[d]){if(!c){if(this.async&&"function"!==typeof importScripts){let e=this;d=new Promise(function(k){setTimeout(function(){e.remove(a,null,!0);e=null;k()})});if(b)d.then(b);else return d;return this}if(b)return this.remove(a,null,!0),b(),this}for(b=0;b<this.b-(this.threshold||0);b++)W(this.l[b],a);this.depth&&W(this.h,a);delete this.f[d]}return this};
let I;v.prototype.search=function(a,b,c,d){if(J(b)){if(F(b))for(var e=0;e<b.length;e++)b[e].query=a;else b.query=a;a=b;b=1E3}else b&&O(b)?(c=b,b=1E3):b||0===b||(b=1E3);let k=[],f=a;let g,m,l;if(J(a)&&!F(a)){c||(c=a.callback)&&(f.callback=null);m=a.sort;g=!1;b=a.limit;var q=a.threshold;l=!1;a=a.query}if(this.a){q=this.a.index;var n=f.bool||"or",h=f.field;let w=n;let r,x;if(h)F(h)||(h=[h]);else if(F(f)){var u=f;h=[];w=[];for(var t=0;t<f.length;t++)d=f[t],e=d.bool||n,h[t]=d.field,w[t]=e,"not"===e?r=
!0:"and"===e&&(x=!0)}else h=this.a.keys;n=h.length;for(t=0;t<n;t++)u&&(f=u[t]),g&&!K(f)&&(f.page=null,f.limit=0),k[t]=q[h[t]].search(f,0);if(c)return c(H.call(this,a,w,k,m,b,l,!1,g,x,r));if(this.async){const z=this;return new Promise(function(E){Promise.all(k).then(function(B){E(H.call(z,a,w,B,m,b,l,!1,g,x,r))})})}return H.call(this,a,w,k,m,b,l,!1,g,x,r)}q||(q=this.threshold||0);if(!d){if(this.async&&"function"!==typeof importScripts){let w=this;q=new Promise(function(r){setTimeout(function(){r(w.search(f,
b,null,!0));w=null})});if(c)q.then(c);else return q;return this}if(c)return c(this.search(f,b,null,!0)),this}if(!a||!K(a))return k;f=a;f=this.encode(f);if(!f.length)return k;c=this.c;c=O(c)?c(f):f.split(this.split);this.filter&&(c=N(c,this.filter));u=c.length;d=!0;e=[];const y=D();let A=0;1<u&&(this.depth&&"strict"===this.c?h=!0:c.sort(ma));if(!h||(n=this.h)){const w=this.b;for(;A<u;A++){let r=c[A];if(r){if(h){if(!t)if(n[r])t=r,y[r]=1;else if(!l)return k;if(l&&A===u-1&&!e.length)h=!1,r=t||r,y[r]=
0;else if(!t)continue}if(!y[r]){const x=[];let z=!1,E=0;if(t=h?n[t]:this.l){let B;for(let C=0;C<w-q;C++)if(B=t[C]&&t[C][r])x[E++]=B,z=!0}if(z)t=r,e[e.length]=1<E?x.concat.apply([],x):x[0];else{d=!1;break}y[r]=1}}}}else d=!1;d&&(k=da(e,b,g,!1));return k};v.prototype.clear=function(){return this.destroy().init()};v.prototype.destroy=function(){this.l=this.h=this.f=null;if(this.a){const a=this.a.keys;for(let b=0;b<a.length;b++)this.a.index[a[b]].destroy();this.a=this.g=null}return this};const R={icase:function(a){return a.toLowerCase()},
simple:function(){const a=[p("[\u00e0\u00e1\u00e2\u00e3\u00e4\u00e5]"),"a",p("[\u00e8\u00e9\u00ea\u00eb]"),"e",p("[\u00ec\u00ed\u00ee\u00ef]"),"i",p("[\u00f2\u00f3\u00f4\u00f5\u00f6\u0151]"),"o",p("[\u00f9\u00fa\u00fb\u00fc\u0171]"),"u",p("[\u00fd\u0177\u00ff]"),"y",p("\u00f1"),"n",p("[\u00e7c]"),"k",p("\u00df"),"s",p(" & ")," and ",p("[-/]")," ",p("[^a-z0-9 ]"),"",p("\\s+")," "];return function(b){b=M(b.toLowerCase(),a);return" "===b?"":b}}(),advanced:function(){const a=[p("ae"),"a",p("ai"),"ei",
p("ay"),"ei",p("ey"),"ei",p("oe"),"o",p("ue"),"u",p("ie"),"i",p("sz"),"s",p("zs"),"s",p("sh"),"s",p("ck"),"k",p("cc"),"k",p("th"),"t",p("dt"),"t",p("ph"),"f",p("pf"),"f",p("ou"),"o",p("uo"),"u"];return function(b,c){if(!b)return b;b=this.simple(b);2<b.length&&(b=M(b,a));c||1<b.length&&(b=X(b));return b}}(),extra:function(){const a=[p("p"),"b",p("z"),"s",p("[cgq]"),"k",p("n"),"m",p("d"),"t",p("[vw]"),"f",p("[aeiouy]"),""];return function(b){if(!b)return b;b=this.advanced(b,!0);if(1<b.length){b=b.split(" ");
for(let c=0;c<b.length;c++){const d=b[c];1<d.length&&(b[c]=d[0]+M(d.substring(1),a))}b=b.join(" ");b=X(b)}return b}}(),balance:function(){const a=[p("[-/]")," ",p("[^a-z0-9 ]"),"",p("\\s+")," "];return function(b){return X(M(b.toLowerCase(),a))}}()};return v}(!1),this);
function classExamplesSlider() {
	
	// "legacy" Class Examples slider
	if ($('#slideShow .royalSlidesContainer').length > 0) {
		
		// add .rsImg classes to images and .rsCaption classes to captions
		// must be done before slider initialization
		// done in JS because markup is locked in CMS
		$('#slideShow .royalSlidesContainer').find('img:not(video>img)').addClass('rsImg');
		$('#slideShow .royalSlidesContainer').find('.panel-content > p:last-child').addClass('rsCaption');
		
		// initialize slider
		var legacyClassExamplesSlider = $('#slideShow .royalSlidesContainer').royalSlider({
			imageScaleMode: 'fit',
			imageAlignCenter: false,
			autoHeight: true,
			loop: false,
			loopRewind: true,
			imageAlignCenter: false,
			slidesSpacing: 40,
			globalCaption: true,
			arrowsNavAutoHide: false,
			controlsInside: false,
			navigateByClick: false,
			addActiveClass: true
		}).data('royalSlider');

		legacyClassExamplesSlider.updateSliderSize();
		
		$('.class-examples-slider-wrapper > .royalSlider').css({
			'max-height' : 'unset',
			'overflow': 'unset'
		});

		clickNav(legacyClassExamplesSlider);
		controlVideos(legacyClassExamplesSlider);
	}
	
	// Updated Class Examples Slider - supports flattened markup
	if ($('.class-examples.royalSlider').length > 0) {
		
		// initialize slider
		var classExamplesSlider = $('.class-examples.royalSlider').royalSlider({
			imageScaleMode: 'fit',
			imageScalePadding: 10,
			autoHeight: true,
			loop: false,
			loopRewind: true,
			numImagesToPreload: 8,
			imageAlignCenter: false,
			slidesSpacing: 40,
			globalCaption: true,
			arrowsNavAutoHide: false,
			controlsInside: false,
			navigateByClick: false
		}).data('royalSlider');

		classExamplesSlider.updateSliderSize();
		
		$('.class-examples-slider-wrapper > .royalSlider').css({
			'max-height' : 'unset',
			'overflow': 'unset'
		});

		clickNav(classExamplesSlider);
		controlVideos(classExamplesSlider);
	}
	
	function clickNav(slider) {
		// only use click to navigate if the current slide is not a video
		slider.ev.on('rsSlideClick', function(event, originalEvent) {
			if (this.currSlide.content.find('video').length > 0) { return }
			else { this.next() }
		});
	}
	function controlVideos(slider) {
		playFirstVideo(slider);
		slider.ev.on('rsAfterSlideChange', function(event) {
				var currentSlide = this.slides[this.currSlideId];
				var previousSlide = this.slides[event.target._prevSlideId];

				if (slideHasVideo(previousSlide)) {
					videojs(getVideo(previousSlide)).pause();
				}
				if (slideHasVideo(currentSlide)) {
					videojs(getVideo(currentSlide)).play();
				}
		});
		function slideHasVideo(slide) {
			if (slide.content.find('video').length > 0) { return true } 
			else { return false; }
		}
		function getVideo(slide) {
			return slide.content.find('video')[0]
		}
		function playFirstVideo(slider) {
			var firstSlide = slider.slides[0];

			if (slideHasVideo(firstSlide)) {
				videojs(getVideo(firstSlide)).play();
			}
		}
	}
}
function testimonialSlider() {
	if ($('.testimonial-slider.royalSlider').length > 0) {
		var testimonialSlider = $('.testimonial-slider.royalSlider').royalSlider({
			loop: false,
			loopRewind: true,
			slideSpacing: 40,
			arrowsNavAutoHide: false,
			controlsInside: false,
			// controlNavigation: 'none',
			autoHeight: true
		}).data('royalSlider');
		
		// hide arrows if less than 2 slides
		if (testimonialSlider.numSlides < 2) {
			testimonialSlider._arrowLeft.css('display', 'none');
			testimonialSlider._arrowRight.css('display', 'none');
		}
	}
}
function testimonialSwiper() {
	var testimonialSwiperRoot = document.querySelector('.testimonial-swiper');

	if (!testimonialSwiperRoot) return;

	var swiperContainer = testimonialSwiperRoot.querySelector('.testimonial-swiper__container');
	var swiperNavigation = testimonialSwiperRoot.querySelector('.testimonial-swiper__nav');
	var swiperPagination = testimonialSwiperRoot.querySelector('.testimonial-swiper__pagination');

	var swiper = new Swiper(swiperContainer, {
		init: false,
		spaceBetween: 72,
		grabCursor: true,
		autoHeight: true,
		centeredSlides: true,
		loop: true,
		navigation: {
			nextEl: swiperNavigation.querySelector('.swiper-button-next'),
			prevEl: swiperNavigation.querySelector('.swiper-button-prev'),
		},
		pagination: {
			el: swiperPagination,
			type: 'progressbar'
		}
	});

	swiper.init();
}
function instructorSlider() {
	if ($('.instructor-slider.royalSlider').length > 0) {
		var instructorSlider = $('.instructor-slider.royalSlider').royalSlider({
			loop: false,
			loopRewind: true,
			slideSpacing: 40,
			arrowsNavAutoHide: false,
			controlsInside: false,
			autoHeight: true,
			controlNavigation: 'thumbnails',
			thumbs: {
				spacing: 10
			}
		}).data('royalSlider')
		
		 // reposition nav, you can use this trick to reposition any RoyalSlider controls and anywhere you wish
		var slider = $('.royalSlider');
		slider.prepend(slider.find('.rsNav'));
	}
}
function facilitiesSlider() {
	if ($('.facilities-slider.royalSlider').length > 0) {
		var instructorSlider = $('.facilities-slider.royalSlider').royalSlider({
			autoScaleSlider: true,
			autoScaleSliderWidth: 864,
			// autoScaleSliderHeight: 400,
			imageScaleMode: 'fill',
			imageScalePadding: 10,
			loop: false,
			loopRewind: true,
			numImagesToPreload: 4,
			imageAlignCenter: false,
			slidesSpacing: 40,
			globalCaption: true,
			arrowsNavAutoHide: false,
			controlsInside: false,
			navigateByClick: false
		}).data('royalSlider')
		
		 // reposition nav, you can use this trick to reposition any RoyalSlider controls and anywhere you wish
		var slider = $('.royalSlider');
		slider.prepend(slider.find('.rsNav'));
	}
}

function setupSliders() {
	classExamplesSlider();
	testimonialSlider();
	instructorSlider();
	facilitiesSlider();
	testimonialSwiper();
}

setupSliders();
$(document).ready(function() {
	
	//COOKIES CODE
	function arrivalDate() {	//only runs the first time a visiter comes
		visitDate = new Date()

		myDate  = visitDate.getDate()
		myMonth = visitDate.getMonth()
		myYear  = visitDate.getFullYear()
		months = new Array()
		months[0]  = "Jan."
		months[1]  = "Feb."
		months[2]  = "Mar."
		months[3]  = "Apr."
		months[4]  = "May"
		months[5]  = "June"
		months[6]  = "July"
		months[7]  = "Aug."
		months[8]  = "Sep."
		months[9]  = "Oct."
		months[10] = "Nov."
		months[11] = "Dec."
		todaysDate = (months[myMonth] + " " + myDate + ", " + myYear)
	}

	//Check for 1st visit. If so: set visit counter to 1, record entry page, referrer, date, and set  currently here flag to true
	v = getCookie("visits")
	c = getCookie("currentlyhere")
	if (v == null) {
		arrivalDate()
		setCookie("visits",1,9000,"/")
		setCookie("entrypage",document.location.href,9000,"/")
		setCookie("entrydate",todaysDate,9000,"/")
		setCookie("camefrom",document.referrer,9000,"/")
		setCookie("currentlyhere","true","","/")
		//setCookie(name,value,expires,path,domain,secure)
	}
	else if (c == null)	{ //otherwise check if they're already here -- if not, increase the visit counter by 1 and turn on currently here flag
		y = getCookie("visits")
		y = eval(y)
		y = y + 1
		setCookie("visits",y,9000,"/")
		setCookie("currentlyhere","true","","/")
	}

	// HIDE RAILS FLASH NOTICES AFTER 8 SECONDS
	setTimeout(function(){
		$('.rails-flash').fadeOut(300);
	},8000);
	$('.rails-flash svg').click( function(event) {
		$('.rails-flash').fadeOut(300);
	});

	// SETTINGS FOR FACEBOOK & TWITTER SHARE WINDOWS
	function sharePopUpWindowOptions() {
		var width  = 575;
		var height = 400;
		var left   = (screen.width  - width)  / 2;
		var top    = (screen.height - height) / 2;
		opts   = 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
	}

	// FACEBOOK SHARE BUTTON
	$('.js-facebook.js-share-button').click( function(event) {
		event.preventDefault();
		var url = this.href
		sharePopUpWindowOptions()
		window.open(url, 'facebookShare', opts);
	});

	// TWITTER SHARE BUTTON
	$('.js-twitter.js-share-button').click( function(event) {
		event.preventDefault();
		var url = this.href
		sharePopUpWindowOptions()
		window.open(url, 'twitterShare', opts);
	});

	// TOOLTIPS Mobile JS
	(function setupMobileTooltips() {
		var tooltips = Array.from(document.querySelectorAll('[data-tooltip=true]'));
		
		tooltips.forEach(function(tooltip) {
			// add a touch event listener to each tooltip activator
			tooltip.addEventListener('touchstart', function(e) {
				// add .touch-device class to prevent conflict between `touchstart` and mobile devices reading touch as hover
				this.classList.add('touch-device');
				// toggle 
				this.classList.toggle('mobile-tooltip-active');
			});
		});
	}());

	(function certificateComparisonTable(params) {
		var buttonList = document.querySelector('.cert-comparison-mobile-tabs');
		if (!buttonList) return;

		var table = document.querySelector('#comparison-table'),
				buttons = buttonList.querySelectorAll('button');


		for (i = 0; i < buttons.length; ++i) {
			// Bind listener to each button
			buttons[i].addEventListener('click', clickEventListener);

			
			// add index property to each button
			buttons[i].index = i;
		};

		// attach click listener to each button
		function clickEventListener(event) {
			var button = this;
			activateColumn(button, false);
		}

		// activate column associated with clicked button
		function activateColumn(button, setFocus) {
			setFocus = setFocus || true;

			// Deactivate all other buttons
			deactivateButtons();

			// Set the button as pressed
			button.setAttribute('aria-pressed', 'true');

			// activate selected column
			table.setAttribute('data-selected-col', button.index + 1)
		}

		// deactivate all buttons
		function deactivateButtons() {
			for (i = 0; i < buttons.length; i++) {
				buttons[i].setAttribute('aria-pressed', 'false');
			};
		}
	}());

  	// GOODIES SLIDE
	$('#goodiesLink').toggle(
		function(){
			$('#goodies').slideDown(600, 'easeOutCubic');
		}, function() {
			$('#goodies').slideUp(350, 'easeOutCubic');
		}
	);

	// CLASSES MENU CLOSE BOX
	$('.touch .dropDownMenu .close').click(
		function() {
			$(this).closest('.dropDownMenu').addClass('hideDropDownMenu')
		}
	);
	$('.touch #mainNav .classes a, .touch #subNav a').click(
		function() {
			$('.dropDownMenu').removeClass('hideDropDownMenu')
		}
	);	

	// LINK ENTIRE TABLE ROW on UPCOMING CLASS TABLE
	$(".training-table tbody tr").click(function(){
	  window.location = $(this).find("a").attr("href");
	  return false;
	});

	// BOOK DETAIL PAGE - TAB UI
	$(function() {
		var $links=$('.js-tabs-wrapper > ul a'),
			$tabContent=$('.js-tabs-wrapper > div');
		$links.click(function(e) {
			// active style for links
			$links.parent().removeClass('active');
			$(this).parent().addClass('active');
			// active state for tab content
			$tabContent.removeClass('active');
			$(this.rel).addClass('active');
			e.preventDefault();
		});
	 });

	// ACCORDION: Certificate Schedule Chooser
	$('.js-cert-register-buttons').accordion({
		header: '.expandable .cert-schedule-heading',
		heightStyle: 'content',
		collapsible: true,
		active: false,
		animate: 10,
		activate: function (event, ui) {
			var sidebar = ui.newHeader.closest('.sidebar');

			if (sidebar.outerHeight() > $(window).height()) {
				sidebar.addClass('unstuck');
				TweenMax.to(window, .3, { scrollTo: { y: ui.newHeader, offsetY: 10 } });
			} else {
				ui.oldHeader.closest('.sidebar').removeClass('unstuck');
			}
		}
	});
	$('.js-cert-register-buttons a').click(function (e) {
		e.stopPropagation(); // prevent accordion from activating if the anchor is clicked
	});
	
	// ACCORDIONS: eBooks & Vouchers in User Account (and more)
	$('.js-accordion').accordion({
		header: '.js-accordion-header',
		collapsible: true,
		heightStyle: 'content',
		active: false,
		animate: {
			duration: 200
	 	}
	});

	// ACCORDION: Upgrade Options in User Account
	$('.js-account-page .js-options-accordion').accordion({
		header: '.js-options-header',
		collapsible: true,
		heightStyle: 'content',
		active: false,
		animate: {
			duration: 200
		}
	});

	// ACCORDION: WHY TRAIN WITH NOBLE
	$('.whyNoble .reasonsList').accordion({
		header: 'h3',
		collapsible: true,
		heightStyle: 'content',
		active: false,
		// alwaysOpen: false,
		animate: {
			duration: 200
	 	}
	});

	// ACCORDION: Terms List
	$('.js-terms-list').accordion({
		header: 'dt',
		collapsible: true,
		heightStyle: 'content',
		active: false,
		animate: {
			duration: 200
		}
	});


	// ACCORDION: Cart Discount questions and Promo Code
	$('.js-cart-accordion').accordion({
		header: 'h3',
		collapsible: true,
		heightStyle: 'content',
		active: (function() {
			if ($(window).width() > 768) return 0;
			else return false;
		})(),
		alwaysOpen: true,
		animate: {
			duration: 200
		}
	});

	// ACCORDION: Explore and More sections in Mobile Menu
	$('.js-menu-accordion').accordion({
		header: 'h3',
		collapsible: true,
		heightStyle: 'content',
		// show more menu on desktop and collapse all on mobile
		active: false,
		alwaysOpen: true,
		animate: {
			duration: 200
		}
	});

	function clearFormPlaceholderText(element) {
		var initialText = $(element).val();

		$(element).focus(function() {
			$(this).val('');
		}).blur(function() {
			if ($(this).val() == '') {
				$(this).val(initialText);
			}
		});
	}

	clearFormPlaceholderText('.email-signup .email');

	//OBFUSCATED CONTACT LINK
	function educatorEmail() {
		var mLink1 = '<a href="mai'
		var mLink2 = 'lto'
		var mLink3 = ':&#101;&#100;&#117;&#99;&#97;&#116;&#111;&#114;&#45;&#105;&#110;&#45;&#99;&#104;&#105;&#101;&#102;'
		var mLink4 = '@'
		var mLink5 = '&#110;&#111;&#98;&#108;&#101;&#100;&#101;&#115;&#107;&#116;&#111;&#112;&#46;&#99;&#111;&#109;">'
		var mLink6 = '&#101;&#100;&#117;&#99;&#97;&#116;&#111;&#114;&#45;&#105;&#110;&#45;&#99;&#104;&#105;&#101;&#102;'
		var mLink7 = '@'
		var mLink8 = '&#110;&#111;&#98;&#108;&#101;&#100;&#101;&#115;&#107;&#116;&#111;&#112;&#46;&#99;&#111;&#109;<\/a>'
		$('.mLink').html(mLink1 + mLink2 + mLink3 + mLink4 + mLink5 + mLink6 + mLink7 + mLink8)
	}
	educatorEmail() // call the function

	//ADD COOKIE TO FORM
	function addCookiesToForm() {
		//find any form elements on page
		$('form').each(function(index, element) {
			if ($(this).attr('id') != 'blogSearch') {
				//put formfield names into an array
				var arrFormNames = [ "entrypage", "entrydate", "numberofvisits", "referrerpage" ];
				//loop over array
				$.each(arrFormNames,function(i,obj) {
					//check if inputs exist
					if ($(element).children('input[name='+ obj + ']').length == 0){
						// create form field
						$(element).append('<input name="' + obj + '" type="hidden" value="">')
					}
				})
			}
		});
		//set values in form
		$('input[name=entrypage]').val(getCookie("entrypage"));
		$('input[name=entrydate]').val(getCookie("entrydate"));
		$('input[name=numberofvisits]').val(getCookie("visits"));
		$('input[name=referrerpage]').val(getCookie("camefrom"));
	}

	addCookiesToForm()

	// CERTIFICATES: REVEAL CLASS INFO
	$('#certificateClassList .learnMoreLink').click( function(){
		$(this).next('.classDescrip').slideToggle(400,'easeOutQuad')
	})

	//FANCYBOX for Full Syllabus

	$('.js-show-cert-high-level').fancybox({
		autoSize: false,
		type: 'inline',
		maxWidth: 750,
		autoHeight: true,
		padding: 0,

		openSpeed: 250,
		closeSpeed: 100,

		openEffect: 'elastic',
		closeEffect: 'elastic'
	});
	
	//FANCYBOX for Corporate Training page dialogs

	$('.js-show-corporate-dialog').fancybox({
		autoSize: false,
		type: 'inline',
		width: 'auto',
		autoHeight: true,
		padding: 0,

		openSpeed: 250,
		closeSpeed: 100,

		openEffect: 'elastic',
		closeEffect: 'elastic'
	});

	//FANCYBOX for PROMO MODAL

	$("#hidden_link").fancybox({
		helpers : {
	        overlay : {
	            css : {
	                'background' : 'rgba(0, 0, 0, 0.5)'
	            }
	        }
	    }
	}).trigger('click');

	$("a#promo-deal-modal").fancybox({
		'hideOnContentClick': true
	});

	$('.promo-ok').click(function() {
		$.fancybox.close();
	});

	// FANCYBOX FOR CLASS DISCOUNTS on class pages and schedule page
	$(".js-discounts-policies-popup").fancybox({  //DON'T FORGET TO  ADD THE fancybox.ajax CLASS TO THE LINK!
	   			   		  //.class .discounts is on the schedule page

		autoSize: false,
		maxWidth: 700,
		autoHeight: true,
		padding: 0,

		openSpeed: 250,
		closeSpeed: 100,

		openEffect: 'elastic',
		closeEffect: 'elastic',
		ajax:{
			dataFilter: function(data) {
				return $(data).find('#discounts-policies-popup'); // can use filter or find - if one doesn't work, try the other
			}
		}
	});

	// FANCYBOX FOR BOOK DISCOUNTS
	$(".js-book-discount-link").fancybox({  //DON'T FORGET TO  ADD THE fancybox.ajax CLASS TO THE LINK!
		padding: 20,
		maxWidth: 710,
		autoHeight: true,
		autoSize: false,

		openSpeed: 250,
		closeSpeed: 100,

		openEffect: 'elastic',
		closeEffect: 'elastic',
		ajax:{
			dataFilter: function(data) {
				return $(data).find('#discounts'); // can use filter or find - if one doesn't work, try the other
			}
		}
	});

	// FANCY BOX FOR POP-OUT VIDEO (requires videoJS)
	// Pop out videos must have uniq IDs!
	(function popoutVideo() {
		var popoutVideoButtons = [].slice.call(document.querySelectorAll('.js-play-popout-video'));

		if (typeof videojs === 'undefined' || popoutVideoButtons.length === 0) return;

		var PopoutVideo = function(videoButton) {
			var videoPlayer = videoButton.parentElement.querySelector('video');
			
			if (!videoPlayer) { return; }
			
			var videoProgressAmount = 0;
			videojs(videoPlayer).on('pause', function() {
				currentProgressPercent = Math.ceil( ( videojs(videoPlayer).currentTime() / videojs(videoPlayer).duration() ) * 100);
				if (currentProgressPercent > videoProgressAmount ) {
					videoProgressAmount = currentProgressPercent;
					console.log(videoProgressAmount);
				}
			});
	
			$(videoButton).fancybox({
				autoSize: false,
				width: 1280,
				autoHeight: true,
				padding: 0,
				openSpeed: 250,
				closeSpeed: 100,
				openEffect: 'elastic',
				closeEffect: 'elastic',
				wrapCSS: 'fancybox-wrap-popout-video',
				afterLoad: function () { 
					videojs(videoPlayer).play();
					dataLayer.push({ 'event': 'video_play_start' });
				},
				beforeClose: function () { 
					videojs(videoPlayer).pause()
				}
			});
	
			$(window).on('beforeunload', function() {
				// when they close the window...
				videojs(videoPlayer).pause()
	
				// send progress to Google Analytics
				if ( videoProgressAmount > 0 ) {
					dataLayer.push({
						'event': 'video_play_end',
						'video_progress_amount': videoProgressAmount,
					});
				}
			});
		}

		// create a new class instance for each pop out video on the page
		popoutVideoButtons.forEach(function(videoButton) { new PopoutVideo(videoButton) });

	}());

	(function navbarSearchDialog() {
		var searchDialogElement = document.getElementById('search-dialog');
		
		if (!searchDialogElement) { return false; }

		var searchDialog = new A11yDialog(searchDialogElement);

		// click outside dialog to hide it
		document.addEventListener('click', function(event) {
			if (event.target.tagName === 'DIALOG') { searchDialog.hide() }
		});

		document.addEventListener('keyup', function(event) {
			if (event.key === '/' && event.ctrlKey) { searchDialog.show() }
		});

		// Unhide dialog to prevent flash of unstyled content
		searchDialogElement.classList.remove('hide');

		searchDialog.on('show', function (dialogEl, event) { stopBodyScrolling(true) });
		searchDialog.on('hide', function (dialogEl, event) { stopBodyScrolling(false) });
	}());

	(function navbarSearchAutocomplete() {

		var searchInput = $('.js-nav-search-input');

		if (searchInput.length < 1) { return false; }

		var messageContainer = $('.js-nav-search-message');
		var resultsContainer = $('.js-nav-search-results');

		var arrowIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" preserveAspectRatio="xMidYMid meet" class="clarity-icon"><path d="M18,2A16,16,0,1,0,34,18,16,16,0,0,0,18,2Zm8,15.57a1.43,1.43,0,0,1-2,0L19.4,13V27.14a1.4,1.4,0,0,1-2.8,0v-14l-4.43,4.43a1.4,1.4,0,0,1-2-2L18.08,7.7,26,15.59A1.4,1.4,0,0,1,26,17.57Z" class="clr-i-solid clr-i-solid-path-1" /><rect x="0" y="0" width="36" height="36" fill-opacity="0" /></svg>';

		var searchData = searchInput.data('autocomplete-source');

		var index = new FlexSearch({
			encode: "icase",
			tokenize: "forward",
			threshold: 8,
			resolution: 9,
			depth: 1,
			doc: {
				id: "id",
				field: "label"
			}
		});

		index.add(searchData);

		searchInput.autocomplete({
			source: function(request, response) { response(index.search(request.term)) },
			appendTo: resultsContainer,
			autoFocus: true,
			delay: 0,
			position: { at: 'left bottom+9' },

			select: function (event, ui) { 
				event.preventDefault();

				// don't select on TAB
				if (event.keyCode === 9) return false; 

				// set the search field value to the data label
				$(this).val(ui.item.label);

				// navigate the page represented by this id (value)
				window.location.href = ui.item.path
			},

			// prevent showing `value` in the search field
			focus: function (event, ui) { 
				event.preventDefault();
			},

			// show no results message if no response
			response: function (event, ui) {
				if (ui.content.length === 0) {
					messageContainer.html('<div class="message">No results found</div>');
				} else {
					messageContainer.empty();
				}
			}
		}).data('ui-autocomplete')._renderItem = function (ul, item) {
			return $('<li></li>')
				.data('item.autocomplete', item)
				.append('<div><span>' + item.label + '</span>' + arrowIconSVG + '</div>')
				.appendTo(ul);
		};
	}());

	function stopBodyScrolling(bool) {
		if (bool === true) {
			document.body.classList.add('noscroll');
			document.body.addEventListener('touchmove', freezeVp, false);
		} else {
			document.body.classList.remove('noscroll');
			document.body.removeEventListener('touchmove', freezeVp, false);
		}

		var freezeVp = function (e) {
			e.preventDefault();
		};
	}


	//VALIDATE FREE CLASS SIGNUP

	//add a method to check if it is not equal to a value
	$.validator.addMethod("notEqual", function(value, element, param) {
		return this.optional(element) || value !== param;
	}, "Not Valid");

	//set default msg
	$.validator.messages.required = 'Required';

	//run validation
	$('#freeClassSignupForm').validate({
		rules: {
			firstName: {
				required: true,
        		notEqual: "First Name"
			},
			lastName: {
				required: true,
        		notEqual: "Last Name"
			},
			email: {
				required: true,
				email: true
			}
		},
		messages: {
			email: 'Not Valid'
		}
	});

	//run validation
	$('#teacherCentralSignupForm').validate({
		rules: {
			firstName: {
				required: true,
				notEqual: "First Name"
			},
			lastName: {
				required: true,
				notEqual: "Last Name"
			},
			email: 'required email'
		},
		messages: {
			email: 'Not Valid'
		}
	});

	//VALIDATE ENEWS SIGNUP IN FOOTER
	$('.email-signup').validate({
		errorLabelContainer: ".error-container",
		rules: {
			email: {
				required: true,
				notEqual: "Enter your email",
				email: true
			}
		},
		messages: {
			email: 'Please enter a valid email address.'
		}
	});

	
	(function readMoreOverlay() {
		var DOMStrings = {
			container: '.js-read-more-container',
			overlay: '.js-read-more-overlay',
			button: '.js-read-more-button',
			collapsedHeightAttr: 'data-collapsed-height'
		}

		var containers = [].slice.call(document.querySelectorAll(DOMStrings.container));

		if (!containers.length === 0) return;

		var ReadMoreContainer = function(container, settings) {
			settings.collapsedHeight = parseInt(settings.collapsedHeight)

			container.state = { expanded: false }
			container.collapsedHeight = getCollapsedHeight(container);
			container.contentsHeight = getContentsHeight(container);
			container.expandedHeight = getExpandedHeight(container);

			var overlay = container.querySelector(DOMStrings.overlay),
					button = container.querySelector(DOMStrings.button),
					buttonIcon = button.querySelector('svg'),
					buttonTextWrapper = button.querySelector('span'),
					buttonInitialText = buttonTextWrapper.innerText

			// use -1 to disable read more container
			// OR
			// disable read more container if the contents are nearly as short as the configured collapsed height
			if (settings.collapsedHeight === -1 || container.collapsedHeight >= container.contentsHeight - 126) {
				disableReadMore(container);
				return false;
			}

			// set container max height
			container.style.maxHeight = container.collapsedHeight + 'px';

			button.addEventListener('click', function(e) {
				e.preventDefault();

				// toggle expanded state
				container.state.expanded = !container.state.expanded;

				// toggle button
				if (container.state.expanded) {
					container.classList.add('expanded');
					container.style.maxHeight = container.expandedHeight + 'px';
					buttonIcon.style = 'transform: rotate(0deg)';
					buttonTextWrapper.innerText = settings.expandedText;
				}
				else if (!container.state.expanded) {
					container.classList.remove('expanded');
					container.style.maxHeight = container.collapsedHeight + 'px';
					buttonIcon.style = 'transform: rotate(180deg)';
					buttonTextWrapper.innerText = buttonInitialText;
				}
			}.bind(this));

			function getContentsHeight(el) {
				return [].slice.call(el.childNodes)
					.filter(function(child) { 
						if (child instanceof HTMLElement) {
							return !child.classList.contains(DOMStrings.overlay.slice(0))
						} else return false;
					})
					.reduce(function(totalHeight, child) {
						var style = getComputedStyle(child);
						return totalHeight
							+ child.offsetHeight
							+ parseInt(style.marginTop)
							+ parseInt(style.marginBottom);
					}, 0)
			}
			function getCollapsedHeight(el) {
				var style = getComputedStyle(el);
				return parseInt(settings.collapsedHeight) + parseInt(style.paddingTop) + parseInt(style.paddingTop);
			}
			function getExpandedHeight(el) {
				var style = getComputedStyle(el);
				return parseInt(el.contentsHeight) + parseInt(style.paddingTop) + parseInt(style.paddingTop) + 36;
			}
			function disableReadMore(el) {
				container.setAttribute(DOMStrings.collapsedHeightAttr, -1);
				overlay.style.display = 'none';
			}
		}

		// create a new class instance for each read more container on the page
		containers.forEach(function(container) {
			new ReadMoreContainer(container, {
				collapsedHeight: container.dataset.collapsedHeight,
				expandedText: 'Show less'
			})
		});
	})();

	(function showMoreItems() {
		var ShowMore = function (options, callback) {
			this.buttonSelector = options.buttonSelector || '[data-toggle-button]',
			this.itemSelector = options.itemSelector || '[data-toggle-item]',
			this.buttonExpandedText = options.buttonExpandedText || 'Show Less'

			var button = document.querySelector(this.buttonSelector);
			if (!button) return;

			var hiddenItems = Array.from(document.querySelectorAll(this.itemSelector + '[hidden]'));
			var buttonIcon = button.querySelector('svg');
			var buttonTextWrapper = button.querySelector('span');
			var buttonInitialText = buttonTextWrapper.innerText;

			var state = { expanded: false }

			var that = this;

			button.addEventListener('click', function (e) {
				e.preventDefault();

				state.expanded = !state.expanded // toggle expanded state

				// toggle items
				hiddenItems.forEach(function (item) {
					if (!state.expanded) { item.setAttribute('hidden', 'hidden') }
					else if (state.expanded) { item.removeAttribute('hidden') }
				});

				// toggle button
				if (state.expanded) {
					buttonIcon.style = 'transform: rotate(0deg)';
					buttonTextWrapper.innerText = that.buttonExpandedText;
				}
				else if (!state.expanded) {
					buttonIcon.style = 'transform: rotate(180deg)';
					buttonTextWrapper.innerText = buttonInitialText;
				}

				// add-on functionality callback
				if (typeof callback == 'function') { callback() }
			});
		}

		var toggleResourceListings = new ShowMore({
			buttonSelector: '[data-resource-listings-toggle-button]',
			itemSelector: '[data-resource-listing]',
			buttonExpandedText: 'Show less'
		});

		var toggleCourseGroupCourses = new ShowMore({
			buttonSelector: '[data-toggle-class-group-classes]',
			itemSelector: '[data-class-group-class-card]',
			buttonExpandedText: 'Show fewer courses'
		});

		var toggleClassSessionsAll = new ShowMore({
			buttonSelector: '[data-toggle-class-sessions=all]',
			itemSelector: '[data-class-session-card]',
			buttonExpandedText: 'Show fewer sessions'
		});
		var toggleClassSessionsWeekday = new ShowMore({
			buttonSelector: '[data-toggle-class-sessions=weekday]',
			itemSelector: '[data-class-session-card]',
			buttonExpandedText: 'Show fewer sessions'
		});
		var toggleClassSessionsWeeknight = new ShowMore({
			buttonSelector: '[data-toggle-class-sessions=weeknight]',
			itemSelector: '[data-class-session-card]',
			buttonExpandedText: 'Show fewer sessions'
		});
		var toggleClassSessionsWeekend = new ShowMore({
			buttonSelector: '[data-toggle-class-sessions=weekend]',
			itemSelector: '[data-class-session-card]',
			buttonExpandedText: 'Show fewer sessions'
		});

		var toggleArchivedSeminars = new ShowMore({
			buttonSelector: '[data-toggle-archived-seminars]',
			itemSelector: '[data-archived-seminar]',
			buttonExpandedText: 'Show fewer seminars'
		});
	})();

	function benefitsSwiper() {
		var swiperContainer = document.querySelector('.benefits-swiper');
		var swiperNavigation = document.querySelector('.benefits-swiper__nav');
		var swiperPagination = document.querySelector('.benefits-swiper__pagination');

		// exit this function if there's not swiper on the page
		if (!swiperContainer) { return false; }

		var swiper = new Swiper(swiperContainer, {
			spaceBetween: 36,
			loop: true,
			grabCursor: true,
			autoHeight: true,
			breakpoints: {
				768: { autoHeight: false }
			},
			navigation: {
				nextEl: swiperNavigation.querySelector('.swiper-button-next'),
				prevEl: swiperNavigation.querySelector('.swiper-button-prev'),
			},
			pagination: {
				el: swiperPagination,
				type: 'progressbar'
			}
		});
	}
	benefitsSwiper();
	
	// use this function if you need to do something on scrolling events
	function scrollInterval(callback, interval) {
		var userScrolling = false;

		window.addEventListener('scroll', function() { userScrolling = true })
		setInterval(function() {
			if (userScrolling) { callback() }
			userScrolling = false;
		}, interval);
	}


	// scrolls to a section that has an ID that matches the href
	function smoothScrollToID(elementsArr) {
		function animateScroll(event) {
			var hash = this.getAttribute('href');
			var correspondingSection = document.getElementById(hash.split('').slice(1).join(''));

			if (correspondingSection === null) {
				return // don't break if the element with matching ID doesn't work
			} else {
				event.preventDefault(); // prevent browser from changing hash in the address bar
				event.stopPropagation(); // prevent touch devices from thinking this is touchmove 
				TweenMax.to(window, .5, { scrollTo: { y: hash, autoKill: false }, onComplete: function() {
					history.replaceState(null, null, (hash || ''));
				} });
			}
		}

		Array.from(elementsArr).forEach(function(el) {
			el.addEventListener('click', animateScroll);
		});
	}
	
	(function sidebarNav() {
		// exit the function if there's no sidebar nav on the page
		if (!document.querySelector('.js-sidebar nav')) { return }

		var data = {
			navItems: [].slice.call(document.querySelectorAll('.js-sidebar-nav-item')),
			navSections: [].slice.call(document.querySelectorAll('.js-sidebar-nav-section')),
			currentSection: null
		}

		// highlights the nav item in the sidebar the corresponds to the active section
		function updateSidebarNav() {
			// get the section that is most visible according to our rules
			var visibleSection = getVisibleSection();

			// Only do stuff if the current section has changed
			if (visibleSection !== data.currentSection) {
				data.currentSection = visibleSection;
			} else return;

			// remove `active` class from each nav item
			data.navItems.forEach(function(navItem) { navItem.classList.remove('active') });

			// get the nav item that corresponds to the visible section
			var activeNavItem = getActiveNavItem(visibleSection);

			// add `active` class to the active nav Item
			if (activeNavItem) { activeNavItem.classList.add('active') }

			// hide enroll button if it's redundant
			enrollButtonVisibility(activeNavItem);

			// update hash to match active nav item
			updateHash(activeNavItem);
		}

		function getVisibleSection() {
			return data.navSections
				.filter(function(section) {
					var rect = section.getBoundingClientRect();

					// Section is considered visible if:
					// 1) top of section is in or above the top 20% of the window AND
					// 2) bottom of section is below the top 20% of the window
					return rect.top < window.innerHeight * .2 && rect.bottom > window.innerHeight * .2;
				})[0] || false; // choose the first visible section or return false
		}

		function getActiveNavItem(visibleSection) {
			if (visibleSection) {
				return data.navItems.filter(function (navItem) {
					return navItem.hash === '#' + visibleSection.id;
				})[0];
			}
			return false;
		}

		function updateHash(navItem) {
			if (!!navItem) {
				var hash = navItem.href.slice(navItem.href.indexOf('#'));
				window.history.replaceState(null, null, hash);
			} else {
				window.history.replaceState(null, null, ' ');
			}
		}


		function enrollButtonVisibility(activeNavItem) {
			var enrollButton = document.querySelector('.js-enroll-button');

			if (!enrollButton || !activeNavItem) { return }

			if (activeNavItem.hash.slice(1) === enrollButton.hash.slice(1)) {
				TweenLite.to(enrollButton.parentElement, .1, { autoAlpha: 0, ease: Power1.easeOut, display: 'none' })
			} else {
				TweenLite.to(enrollButton.parentElement, .1, { autoAlpha: 1, ease: Power1.easeIn, display: 'block' })
			}
		}

		// set the active nav item once on load and every 100ms when scrolling
		updateSidebarNav();
		scrollInterval(updateSidebarNav, 300);
	}());

	function backToTop() {
		var backToTop = document.querySelector('.js-back-to-top');
		// exit the function if there's no back to top button on the page
		if (backToTop == null) {
			return
		}
		var scroller = document.scrollingElement || document.documentElement;
		
		backToTop.querySelector('a').addEventListener('click', function(e) {
			e.preventDefault();
			// scroll to the top
			TweenMax.to(scroller, .5, { scrollTop: 0 });
		})
		
		function controlBackToTop() {
			if (scroller.scrollTop < window.innerHeight / 4) {
				backToTop.classList.add('hidden');
			} else {
				backToTop.classList.remove('hidden');
			}
		}
		
		scrollInterval(controlBackToTop, 200);
		
	}
	backToTop();

	function lazyLoad() {
		$('.lazy').recliner({
			attrib: "data-src",
			throttle: 20,
			threshold: 300,
			printable: true
		});
	}
	lazyLoad();
	
	// object-fit polyfill
	// use data-object-fit attribute on image
	objectFitImages('img[data-object-fit]');


	// Creates a CSS custom property to sets a new VH that takes browser UI into account
	// Use in CSS like this: 
	// element-selector {
	//  `height: 100vh;` // fallback
	//  `height: calc(var(--vh, 1vh) * 100);`
	// }
	//
	// What's the purpose of this?
	// To allow elements to be full height without going under mobile browser extra tool bars and things
	//
	// more info: https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
	//
	// this is only run on page load for now because that's all I need it for,
	// but it could be run on page resize if necessary (with caution)
	//
	function fixMobileVHUnits() {
		// First we get the viewport height and we multiple it by 1% to get a value for a vh unit
		let vh = window.innerHeight * 0.01 + 'px';
		// Then we set the value in the --vh custom property to the root of the document
		document.documentElement.style.setProperty('--vh', vh);
	}
	fixMobileVHUnits();

	// smooth scroll any anchors with 'data-smooth-scroll' attribute
	smoothScrollToID(document.querySelectorAll('a[data-smooth-scroll][href^="#"]'));
});


resizeIframes();

// used on GreenSock pages
function resizeIframes() {
	var iframeNativeWidth,
			iframeWrapperWidth,
			scalingFactor;
			
	var $iframes = $('iframe');
	var timeout = false;
		
	window.addEventListener('resize', function() {
		// clear the timeout
		clearTimeout(timeout);
		// start timing for event "completion"
		timeout = setTimeout(resizeIframes, 250);
	})
	
	$iframes.each(function(i, iframe) {
		iframeNativeWidth = iframe.width;
		iframeWrapperWidth = parseInt($(iframe).parents('.iframe-wrapper').css('width'), 10);
		scalingFactor = iframeWrapperWidth / iframeNativeWidth;
		
		$(iframe).css('transform', 'scale(' + scalingFactor + ')')

	})
};
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//


















;
