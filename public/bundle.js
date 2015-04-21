(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   2.1.0
 */

"use strict";

(function () {
  "use strict";
  function lib$es6$promise$utils$$objectOrFunction(x) {
    return typeof x === "function" || typeof x === "object" && x !== null;
  }

  function lib$es6$promise$utils$$isFunction(x) {
    return typeof x === "function";
  }

  function lib$es6$promise$utils$$isMaybeThenable(x) {
    return typeof x === "object" && x !== null;
  }

  var lib$es6$promise$utils$$_isArray;
  if (!Array.isArray) {
    lib$es6$promise$utils$$_isArray = function (x) {
      return Object.prototype.toString.call(x) === "[object Array]";
    };
  } else {
    lib$es6$promise$utils$$_isArray = Array.isArray;
  }

  var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
  var lib$es6$promise$asap$$len = 0;
  var lib$es6$promise$asap$$toString = ({}).toString;
  var lib$es6$promise$asap$$vertxNext;
  function lib$es6$promise$asap$$asap(callback, arg) {
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
    lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
    lib$es6$promise$asap$$len += 2;
    if (lib$es6$promise$asap$$len === 2) {
      // If len is 2, that means that we need to schedule an async flush.
      // If additional callbacks are queued before the queue is flushed, they
      // will be processed by this flush that we are scheduling.
      lib$es6$promise$asap$$scheduleFlush();
    }
  }

  var lib$es6$promise$asap$$default = lib$es6$promise$asap$$asap;

  var lib$es6$promise$asap$$browserWindow = typeof window !== "undefined" ? window : undefined;
  var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
  var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
  var lib$es6$promise$asap$$isNode = typeof process !== "undefined" && ({}).toString.call(process) === "[object process]";

  // test for web worker but not in IE10
  var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== "undefined" && typeof importScripts !== "undefined" && typeof MessageChannel !== "undefined";

  // node
  function lib$es6$promise$asap$$useNextTick() {
    var nextTick = process.nextTick;
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // setImmediate should be used instead instead
    var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
    if (Array.isArray(version) && version[1] === "0" && version[2] === "10") {
      nextTick = setImmediate;
    }
    return function () {
      nextTick(lib$es6$promise$asap$$flush);
    };
  }

  // vertx
  function lib$es6$promise$asap$$useVertxTimer() {
    return function () {
      lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
    };
  }

  function lib$es6$promise$asap$$useMutationObserver() {
    var iterations = 0;
    var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
    var node = document.createTextNode("");
    observer.observe(node, { characterData: true });

    return function () {
      node.data = iterations = ++iterations % 2;
    };
  }

  // web worker
  function lib$es6$promise$asap$$useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = lib$es6$promise$asap$$flush;
    return function () {
      channel.port2.postMessage(0);
    };
  }

  function lib$es6$promise$asap$$useSetTimeout() {
    return function () {
      setTimeout(lib$es6$promise$asap$$flush, 1);
    };
  }

  var lib$es6$promise$asap$$queue = new Array(1000);
  function lib$es6$promise$asap$$flush() {
    for (var i = 0; i < lib$es6$promise$asap$$len; i += 2) {
      var callback = lib$es6$promise$asap$$queue[i];
      var arg = lib$es6$promise$asap$$queue[i + 1];

      callback(arg);

      lib$es6$promise$asap$$queue[i] = undefined;
      lib$es6$promise$asap$$queue[i + 1] = undefined;
    }

    lib$es6$promise$asap$$len = 0;
  }

  function lib$es6$promise$asap$$attemptVertex() {
    try {
      var r = require;
      var vertx = r("vertx");
      lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
      return lib$es6$promise$asap$$useVertxTimer();
    } catch (e) {
      return lib$es6$promise$asap$$useSetTimeout();
    }
  }

  var lib$es6$promise$asap$$scheduleFlush;
  // Decide what async method to use to triggering processing of queued callbacks:
  if (lib$es6$promise$asap$$isNode) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
  } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
  } else if (lib$es6$promise$asap$$isWorker) {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
  } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === "function") {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertex();
  } else {
    lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
  }

  function lib$es6$promise$$internal$$noop() {}

  var lib$es6$promise$$internal$$PENDING = void 0;
  var lib$es6$promise$$internal$$FULFILLED = 1;
  var lib$es6$promise$$internal$$REJECTED = 2;

  var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$selfFullfillment() {
    return new TypeError("You cannot resolve a promise with itself");
  }

  function lib$es6$promise$$internal$$cannotReturnOwn() {
    return new TypeError("A promises callback cannot return that same promise.");
  }

  function lib$es6$promise$$internal$$getThen(promise) {
    try {
      return promise.then;
    } catch (error) {
      lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
      return lib$es6$promise$$internal$$GET_THEN_ERROR;
    }
  }

  function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
      then.call(value, fulfillmentHandler, rejectionHandler);
    } catch (e) {
      return e;
    }
  }

  function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
    lib$es6$promise$asap$$default(function (promise) {
      var sealed = false;
      var error = lib$es6$promise$$internal$$tryThen(then, thenable, function (value) {
        if (sealed) {
          return;
        }
        sealed = true;
        if (thenable !== value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, value);
        }
      }, function (reason) {
        if (sealed) {
          return;
        }
        sealed = true;

        lib$es6$promise$$internal$$reject(promise, reason);
      }, "Settle: " + (promise._label || " unknown promise"));

      if (!sealed && error) {
        sealed = true;
        lib$es6$promise$$internal$$reject(promise, error);
      }
    }, promise);
  }

  function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
    if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, thenable._result);
    } else if (promise._state === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, thenable._result);
    } else {
      lib$es6$promise$$internal$$subscribe(thenable, undefined, function (value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function (reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    }
  }

  function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
    if (maybeThenable.constructor === promise.constructor) {
      lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
    } else {
      var then = lib$es6$promise$$internal$$getThen(maybeThenable);

      if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
      } else if (then === undefined) {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      } else if (lib$es6$promise$utils$$isFunction(then)) {
        lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
      }
    }
  }

  function lib$es6$promise$$internal$$resolve(promise, value) {
    if (promise === value) {
      lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFullfillment());
    } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
      lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
    } else {
      lib$es6$promise$$internal$$fulfill(promise, value);
    }
  }

  function lib$es6$promise$$internal$$publishRejection(promise) {
    if (promise._onerror) {
      promise._onerror(promise._result);
    }

    lib$es6$promise$$internal$$publish(promise);
  }

  function lib$es6$promise$$internal$$fulfill(promise, value) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }

    promise._result = value;
    promise._state = lib$es6$promise$$internal$$FULFILLED;

    if (promise._subscribers.length !== 0) {
      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, promise);
    }
  }

  function lib$es6$promise$$internal$$reject(promise, reason) {
    if (promise._state !== lib$es6$promise$$internal$$PENDING) {
      return;
    }
    promise._state = lib$es6$promise$$internal$$REJECTED;
    promise._result = reason;

    lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publishRejection, promise);
  }

  function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
    var subscribers = parent._subscribers;
    var length = subscribers.length;

    parent._onerror = null;

    subscribers[length] = child;
    subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
    subscribers[length + lib$es6$promise$$internal$$REJECTED] = onRejection;

    if (length === 0 && parent._state) {
      lib$es6$promise$asap$$default(lib$es6$promise$$internal$$publish, parent);
    }
  }

  function lib$es6$promise$$internal$$publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;

    if (subscribers.length === 0) {
      return;
    }

    var child,
        callback,
        detail = promise._result;

    for (var i = 0; i < subscribers.length; i += 3) {
      child = subscribers[i];
      callback = subscribers[i + settled];

      if (child) {
        lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
      } else {
        callback(detail);
      }
    }

    promise._subscribers.length = 0;
  }

  function lib$es6$promise$$internal$$ErrorObject() {
    this.error = null;
  }

  var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

  function lib$es6$promise$$internal$$tryCatch(callback, detail) {
    try {
      return callback(detail);
    } catch (e) {
      lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
      return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
    }
  }

  function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
    var hasCallback = lib$es6$promise$utils$$isFunction(callback),
        value,
        error,
        succeeded,
        failed;

    if (hasCallback) {
      value = lib$es6$promise$$internal$$tryCatch(callback, detail);

      if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
        failed = true;
        error = value.error;
        value = null;
      } else {
        succeeded = true;
      }

      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
        return;
      }
    } else {
      value = detail;
      succeeded = true;
    }

    if (promise._state !== lib$es6$promise$$internal$$PENDING) {} else if (hasCallback && succeeded) {
      lib$es6$promise$$internal$$resolve(promise, value);
    } else if (failed) {
      lib$es6$promise$$internal$$reject(promise, error);
    } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
      lib$es6$promise$$internal$$fulfill(promise, value);
    } else if (settled === lib$es6$promise$$internal$$REJECTED) {
      lib$es6$promise$$internal$$reject(promise, value);
    }
  }

  function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
    try {
      resolver(function resolvePromise(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }, function rejectPromise(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      });
    } catch (e) {
      lib$es6$promise$$internal$$reject(promise, e);
    }
  }

  function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
    var enumerator = this;

    enumerator._instanceConstructor = Constructor;
    enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

    if (enumerator._validateInput(input)) {
      enumerator._input = input;
      enumerator.length = input.length;
      enumerator._remaining = input.length;

      enumerator._init();

      if (enumerator.length === 0) {
        lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
      } else {
        enumerator.length = enumerator.length || 0;
        enumerator._enumerate();
        if (enumerator._remaining === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        }
      }
    } else {
      lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
    }
  }

  lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function (input) {
    return lib$es6$promise$utils$$isArray(input);
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function () {
    return new Error("Array Methods must be provided an Array");
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._init = function () {
    this._result = new Array(this.length);
  };

  var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

  lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function () {
    var enumerator = this;

    var length = enumerator.length;
    var promise = enumerator.promise;
    var input = enumerator._input;

    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      enumerator._eachEntry(input[i], i);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function (entry, i) {
    var enumerator = this;
    var c = enumerator._instanceConstructor;

    if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
      if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
        entry._onerror = null;
        enumerator._settledAt(entry._state, i, entry._result);
      } else {
        enumerator._willSettleAt(c.resolve(entry), i);
      }
    } else {
      enumerator._remaining--;
      enumerator._result[i] = entry;
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function (state, i, value) {
    var enumerator = this;
    var promise = enumerator.promise;

    if (promise._state === lib$es6$promise$$internal$$PENDING) {
      enumerator._remaining--;

      if (state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      } else {
        enumerator._result[i] = value;
      }
    }

    if (enumerator._remaining === 0) {
      lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
    }
  };

  lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function (promise, i) {
    var enumerator = this;

    lib$es6$promise$$internal$$subscribe(promise, undefined, function (value) {
      enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
    }, function (reason) {
      enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
    });
  };
  function lib$es6$promise$promise$all$$all(entries) {
    return new lib$es6$promise$enumerator$$default(this, entries).promise;
  }
  var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
  function lib$es6$promise$promise$race$$race(entries) {
    /*jshint validthis:true */
    var Constructor = this;

    var promise = new Constructor(lib$es6$promise$$internal$$noop);

    if (!lib$es6$promise$utils$$isArray(entries)) {
      lib$es6$promise$$internal$$reject(promise, new TypeError("You must pass an array to race."));
      return promise;
    }

    var length = entries.length;

    function onFulfillment(value) {
      lib$es6$promise$$internal$$resolve(promise, value);
    }

    function onRejection(reason) {
      lib$es6$promise$$internal$$reject(promise, reason);
    }

    for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
      lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
    }

    return promise;
  }
  var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
  function lib$es6$promise$promise$resolve$$resolve(object) {
    /*jshint validthis:true */
    var Constructor = this;

    if (object && typeof object === "object" && object.constructor === Constructor) {
      return object;
    }

    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$resolve(promise, object);
    return promise;
  }
  var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
  function lib$es6$promise$promise$reject$$reject(reason) {
    /*jshint validthis:true */
    var Constructor = this;
    var promise = new Constructor(lib$es6$promise$$internal$$noop);
    lib$es6$promise$$internal$$reject(promise, reason);
    return promise;
  }
  var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

  var lib$es6$promise$promise$$counter = 0;

  function lib$es6$promise$promise$$needsResolver() {
    throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
  }

  function lib$es6$promise$promise$$needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
  /**
    Promise objects represent the eventual result of an asynchronous operation. The
    primary way of interacting with a promise is through its `then` method, which
    registers callbacks to receive either a promise’s eventual value or the reason
    why the promise cannot be fulfilled.
     Terminology
    -----------
     - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
    - `thenable` is an object or function that defines a `then` method.
    - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
    - `exception` is a value that is thrown using the throw statement.
    - `reason` is a value that indicates why a promise was rejected.
    - `settled` the final resting state of a promise, fulfilled or rejected.
     A promise can be in one of three states: pending, fulfilled, or rejected.
     Promises that are fulfilled have a fulfillment value and are in the fulfilled
    state.  Promises that are rejected have a rejection reason and are in the
    rejected state.  A fulfillment value is never a thenable.
     Promises can also be said to *resolve* a value.  If this value is also a
    promise, then the original promise's settled state will match the value's
    settled state.  So a promise that *resolves* a promise that rejects will
    itself reject, and a promise that *resolves* a promise that fulfills will
    itself fulfill.
      Basic Usage:
    ------------
     ```js
    var promise = new Promise(function(resolve, reject) {
      // on success
      resolve(value);
       // on failure
      reject(reason);
    });
     promise.then(function(value) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
     Advanced Usage:
    ---------------
     Promises shine when abstracting away asynchronous interactions such as
    `XMLHttpRequest`s.
     ```js
    function getJSON(url) {
      return new Promise(function(resolve, reject){
        var xhr = new XMLHttpRequest();
         xhr.open('GET', url);
        xhr.onreadystatechange = handler;
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
         function handler() {
          if (this.readyState === this.DONE) {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
            }
          }
        };
      });
    }
     getJSON('/posts.json').then(function(json) {
      // on fulfillment
    }, function(reason) {
      // on rejection
    });
    ```
     Unlike callbacks, promises are great composable primitives.
     ```js
    Promise.all([
      getJSON('/posts'),
      getJSON('/comments')
    ]).then(function(values){
      values[0] // => postsJSON
      values[1] // => commentsJSON
       return values;
    });
    ```
     @class Promise
    @param {function} resolver
    Useful for tooling.
    @constructor
  */
  function lib$es6$promise$promise$$Promise(resolver) {
    this._id = lib$es6$promise$promise$$counter++;
    this._state = undefined;
    this._result = undefined;
    this._subscribers = [];

    if (lib$es6$promise$$internal$$noop !== resolver) {
      if (!lib$es6$promise$utils$$isFunction(resolver)) {
        lib$es6$promise$promise$$needsResolver();
      }

      if (!(this instanceof lib$es6$promise$promise$$Promise)) {
        lib$es6$promise$promise$$needsNew();
      }

      lib$es6$promise$$internal$$initializePromise(this, resolver);
    }
  }

  lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
  lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
  lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
  lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;

  lib$es6$promise$promise$$Promise.prototype = {
    constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.
       ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```
       Chaining
      --------
       The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.
       ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });
       findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.
       ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```
       Assimilation
      ------------
       Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```
       If the assimliated promise rejects, then the downstream promise will also reject.
       ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```
       Simple Example
      --------------
       Synchronous Example
       ```javascript
      var result;
       try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```
       Advanced Example
      --------------
       Synchronous Example
       ```javascript
      var author, books;
       try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```
       Errback Example
       ```js
       function foundBooks(books) {
       }
       function failure(reason) {
       }
       findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```
       Promise Example;
       ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```
       @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
    then: function then(onFulfillment, onRejection) {
      var parent = this;
      var state = parent._state;

      if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
        return this;
      }

      var child = new this.constructor(lib$es6$promise$$internal$$noop);
      var result = parent._result;

      if (state) {
        var callback = arguments[state - 1];
        lib$es6$promise$asap$$default(function () {
          lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
       ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }
       // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
       // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
       @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
    "catch": function _catch(onRejection) {
      return this.then(null, onRejection);
    }
  };
  function lib$es6$promise$polyfill$$polyfill() {
    var local;

    if (typeof global !== "undefined") {
      local = global;
    } else if (typeof self !== "undefined") {
      local = self;
    } else {
      try {
        local = Function("return this")();
      } catch (e) {
        throw new Error("polyfill failed because global object is unavailable in this environment");
      }
    }

    var P = local.Promise;

    if (P && Object.prototype.toString.call(P.resolve()) === "[object Promise]" && !P.cast) {
      return;
    }

    local.Promise = lib$es6$promise$promise$$default;
  }
  var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

  var lib$es6$promise$umd$$ES6Promise = {
    Promise: lib$es6$promise$promise$$default,
    polyfill: lib$es6$promise$polyfill$$default
  };

  /* global define:true module:true window: true */
  if (typeof define === "function" && define.amd) {
    define(function () {
      return lib$es6$promise$umd$$ES6Promise;
    });
  } else if (typeof module !== "undefined" && module.exports) {
    module.exports = lib$es6$promise$umd$$ES6Promise;
  } else if (typeof this !== "undefined") {
    this.ES6Promise = lib$es6$promise$umd$$ES6Promise;
  }

  lib$es6$promise$polyfill$$default();
}).call(undefined);

// noop

}).call(this,require("/Users/alberto.elias/ft/hackday-data-viz/node_modules/origami-build-tools/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"/Users/alberto.elias/ft/hackday-data-viz/node_modules/origami-build-tools/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":22}],2:[function(require,module,exports){
"use strict";

(function () {
  "use strict";

  if (self.fetch) {
    return;
  }

  function normalizeName(name) {
    if (typeof name !== "string") {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError("Invalid character in header field name");
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== "string") {
      value = value.toString();
    }
    return value;
  }

  function Headers(headers) {
    this.map = {};

    var self = this;
    if (headers instanceof Headers) {
      headers.forEach(function (name, values) {
        values.forEach(function (value) {
          self.append(name, value);
        });
      });
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function (name) {
        self.append(name, headers[name]);
      });
    }
  }

  Headers.prototype.append = function (name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    var list = this.map[name];
    if (!list) {
      list = [];
      this.map[name] = list;
    }
    list.push(value);
  };

  Headers.prototype["delete"] = function (name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function (name) {
    var values = this.map[normalizeName(name)];
    return values ? values[0] : null;
  };

  Headers.prototype.getAll = function (name) {
    return this.map[normalizeName(name)] || [];
  };

  Headers.prototype.has = function (name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function (name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)];
  };

  // Instead of iterable for now.
  Headers.prototype.forEach = function (callback) {
    var self = this;
    Object.getOwnPropertyNames(this.map).forEach(function (name) {
      callback(name, self.map[name]);
    });
  };

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError("Already read"));
    }
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise(function (resolve, reject) {
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function () {
        reject(reader.error);
      };
    });
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    return fileReaderReady(reader);
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    reader.readAsText(blob);
    return fileReaderReady(reader);
  }

  var support = {
    blob: "FileReader" in self && "Blob" in self && (function () {
      try {
        new Blob();
        return true;
      } catch (e) {
        return false;
      }
    })(),
    formData: "FormData" in self,
    XDomainRequest: "XDomainRequest" in self
  };

  function Body() {
    this.bodyUsed = false;

    if (support.blob) {
      this._initBody = function (body) {
        this._bodyInit = body;
        if (typeof body === "string") {
          this._bodyText = body;
        } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
          this._bodyBlob = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body;
        } else if (!body) {
          this._bodyText = "";
        } else {
          throw new Error("unsupported BodyInit type");
        }
      };

      this.blob = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error("could not read FormData body as blob");
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function () {
        return this.blob().then(readBlobAsArrayBuffer);
      };

      this.text = function () {
        var rejected = consumed(this);
        if (rejected) {
          return rejected;
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob);
        } else if (this._bodyFormData) {
          throw new Error("could not read FormData body as text");
        } else {
          return Promise.resolve(this._bodyText);
        }
      };
    } else {
      this._initBody = function (body) {
        this._bodyInit = body;
        if (typeof body === "string") {
          this._bodyText = body;
        } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
          this._bodyFormData = body;
        } else if (!body) {
          this._bodyText = "";
        } else {
          throw new Error("unsupported BodyInit type");
        }
      };

      this.text = function () {
        var rejected = consumed(this);
        return rejected ? rejected : Promise.resolve(this._bodyText);
      };
    }

    if (support.formData) {
      this.formData = function () {
        return this.text().then(decode);
      };
    }

    this.json = function () {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(url, options) {
    options = options || {};
    this.url = url;

    this.credentials = options.credentials || "omit";
    this.headers = new Headers(options.headers);
    this.method = normalizeMethod(options.method || "GET");
    this.mode = options.mode || null;
    this.referrer = null;

    if ((this.method === "GET" || this.method === "HEAD") && options.body) {
      throw new TypeError("Body not allowed for GET or HEAD requests");
    }
    this._initBody(options.body);
  }

  function decode(body) {
    var form = new FormData();
    body.trim().split("&").forEach(function (bytes) {
      if (bytes) {
        var split = bytes.split("=");
        var name = split.shift().replace(/\+/g, " ");
        var value = split.join("=").replace(/\+/g, " ");
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function headers(xhr) {
    var head = new Headers();
    var pairs = xhr.getAllResponseHeaders().trim().split("\n");
    pairs.forEach(function (header) {
      var split = header.trim().split(":");
      var key = split.shift().trim();
      var value = split.join(":").trim();
      head.append(key, value);
    });
    return head;
  }

  Request.prototype.fetch = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
      var legacyCors = false;
      if (support.XDomainRequest) {
        var origin = location.protocol + "//" + location.host;
        if (!/^\/[^\/]/.test(self.url)) {
          // exclude relative urls
          legacyCors = (/^\/\//.test(self.url) ? location.protocol + self.url : self.url).substring(0, origin.length) !== origin;
        }
      }
      var xhr = legacyCors ? new XDomainRequest() : new XMLHttpRequest();

      if (legacyCors) {
        xhr.getAllResponseHeaders = function () {
          return "Content-Type: " + xhr.contentType;
        };
      } else if (self.credentials === "cors") {
        xhr.withCredentials = true;
      }

      function responseURL() {
        if ("responseURL" in xhr) {
          return xhr.responseURL;
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader("X-Request-URL");
        }

        return;
      }

      xhr.onload = function () {
        var status = xhr.status === 1223 ? 204 : xhr.status;

        // If XDomainRequest there is no status code so just hope for the best...
        if (legacyCors) {
          status = 200;
        }
        if (status < 100 || status > 599) {
          reject(new TypeError("Network request failed"));
          return;
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        };
        var body = "response" in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options));
      };

      xhr.onerror = function () {
        reject(new TypeError("Network request failed"));
      };

      xhr.open(self.method, self.url, true);

      if ("responseType" in xhr && support.blob) {
        xhr.responseType = "blob";
      }

      self.headers.forEach(function (name, values) {
        values.forEach(function (value) {
          xhr.setRequestHeader(name, value);
        });
      });

      xhr.send(typeof self._bodyInit === "undefined" ? null : self._bodyInit);
    });
  };

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!options) {
      options = {};
    }

    this._initBody(bodyInit);
    this.type = "default";
    this.url = null;
    this.status = options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText;
    this.headers = options.headers;
    this.url = options.url || "";
  }

  Body.call(Response.prototype);

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function (url, options) {
    return new Request(url, options).fetch();
  };
  self.fetch.polyfill = true;
})();

},{}],3:[function(require,module,exports){
/*jshint browser:true, node:true*/

"use strict";

module.exports = Delegate;

/**
 * DOM event delegator
 *
 * The delegator will listen
 * for events that bubble up
 * to the root node.
 *
 * @constructor
 * @param {Node|string} [root] The root node or a selector string matching the root node
 */
function Delegate(root) {

  /**
   * Maintain a map of listener
   * lists, keyed by event name.
   *
   * @type Object
   */
  this.listenerMap = [{}, {}];
  if (root) {
    this.root(root);
  }

  /** @type function() */
  this.handle = Delegate.prototype.handle.bind(this);
}

/**
 * Start listening for events
 * on the provided DOM element
 *
 * @param  {Node|string} [root] The root node or a selector string matching the root node
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.root = function (root) {
  var listenerMap = this.listenerMap;
  var eventType;

  // Remove master event listeners
  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }
    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  }

  // If no root or root is not
  // a dom node, then remove internal
  // root reference and exit here
  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }
    return this;
  }

  /**
   * The root node at which
   * listeners are attached.
   *
   * @type Node
   */
  this.rootElement = root;

  // Set up master event listeners
  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }
  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }

  return this;
};

/**
 * @param {string} eventType
 * @returns boolean
 */
Delegate.prototype.captureForType = function (eventType) {
  return ["blur", "error", "focus", "load", "resize", "scroll"].indexOf(eventType) !== -1;
};

/**
 * Attach a handler to one
 * event for all elements
 * that match the selector,
 * now or in the future
 *
 * The handler function receives
 * three arguments: the DOM event
 * object, the node that matched
 * the selector while the event
 * was bubbling and a reference
 * to itself. Within the handler,
 * 'this' is equal to the second
 * argument.
 *
 * The node that actually received
 * the event can be accessed via
 * 'event.target'.
 *
 * @param {string} eventType Listen for these events
 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
 * @param {function()} handler Handler function - event data passed here will be in event.data
 * @param {Object} [eventData] Data to pass in event.data
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.on = function (eventType, selector, handler, useCapture) {
  var root, listenerMap, matcher, matcherParam;

  if (!eventType) {
    throw new TypeError("Invalid event type: " + eventType);
  }

  // handler can be passed as
  // the second or third argument
  if (typeof selector === "function") {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // Fallback to sensible defaults
  // if useCapture not set
  if (useCapture === undefined) {
    useCapture = this.captureForType(eventType);
  }

  if (typeof handler !== "function") {
    throw new TypeError("Handler must be a type of Function");
  }

  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0];

  // Add master handler for type if not created yet
  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }
    listenerMap[eventType] = [];
  }

  if (!selector) {
    matcherParam = null;

    // COMPLEX - matchesRoot needs to have access to
    // this.rootElement, so bind the function to this.
    matcher = matchesRoot.bind(this);

    // Compile a matcher for the given selector
  } else if (/^[a-z]+$/i.test(selector)) {
    matcherParam = selector;
    matcher = matchesTag;
  } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
    matcherParam = selector.slice(1);
    matcher = matchesId;
  } else {
    matcherParam = selector;
    matcher = matches;
  }

  // Add to the list of listeners
  listenerMap[eventType].push({
    selector: selector,
    handler: handler,
    matcher: matcher,
    matcherParam: matcherParam
  });

  return this;
};

/**
 * Remove an event handler
 * for elements that match
 * the selector, forever
 *
 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
 * @returns {Delegate} This method is chainable
 */
Delegate.prototype.off = function (eventType, selector, handler, useCapture) {
  var i, listener, listenerMap, listenerList, singleEventType;

  // Handler can be passed as
  // the second or third argument
  if (typeof selector === "function") {
    useCapture = handler;
    handler = selector;
    selector = null;
  }

  // If useCapture not set, remove
  // all event listeners
  if (useCapture === undefined) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }

  listenerMap = this.listenerMap[useCapture ? 1 : 0];
  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }

    return this;
  }

  listenerList = listenerMap[eventType];
  if (!listenerList || !listenerList.length) {
    return this;
  }

  // Remove only parameter matches
  // if specified
  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];

    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      listenerList.splice(i, 1);
    }
  }

  // All listeners removed
  if (!listenerList.length) {
    delete listenerMap[eventType];

    // Remove the main handler
    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }

  return this;
};

/**
 * Handle an arbitrary event.
 *
 * @param {Event} event
 */
Delegate.prototype.handle = function (event) {
  var i,
      l,
      type = event.type,
      root,
      phase,
      listener,
      returned,
      listenerList = [],
      target,
      /** @const */EVENTIGNORE = "ftLabsDelegateIgnore";

  if (event[EVENTIGNORE] === true) {
    return;
  }

  target = event.target;

  // Hardcode value of Node.TEXT_NODE
  // as not defined in IE8
  if (target.nodeType === 3) {
    target = target.parentNode;
  }

  root = this.rootElement;

  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2);

  switch (phase) {
    case 1:
      //Event.CAPTURING_PHASE:
      listenerList = this.listenerMap[1][type];
      break;
    case 2:
      //Event.AT_TARGET:
      if (this.listenerMap[0] && this.listenerMap[0][type]) listenerList = listenerList.concat(this.listenerMap[0][type]);
      if (this.listenerMap[1] && this.listenerMap[1][type]) listenerList = listenerList.concat(this.listenerMap[1][type]);
      break;
    case 3:
      //Event.BUBBLING_PHASE:
      listenerList = this.listenerMap[0][type];
      break;
  }

  // Need to continuously check
  // that the specific list is
  // still populated in case one
  // of the callbacks actually
  // causes the list to be destroyed.
  l = listenerList.length;
  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i];

      // Bail from this loop if
      // the length changed and
      // no more listeners are
      // defined between i and l.
      if (!listener) {
        break;
      }

      // Check for match and fire
      // the event if there's one
      //
      // TODO:MCG:20120117: Need a way
      // to check if event#stopImmediatePropagation
      // was called. If so, break both loops.
      if (listener.matcher.call(target, listener.matcherParam, target)) {
        returned = this.fire(event, target, listener);
      }

      // Stop propagation to subsequent
      // callbacks if the callback returned
      // false
      if (returned === false) {
        event[EVENTIGNORE] = true;
        event.preventDefault();
        return;
      }
    }

    // TODO:MCG:20120117: Need a way to
    // check if event#stopPropagation
    // was called. If so, break looping
    // through the DOM. Stop if the
    // delegation root has been reached
    if (target === root) {
      break;
    }

    l = listenerList.length;
    target = target.parentElement;
  }
};

/**
 * Fire a listener on a target.
 *
 * @param {Event} event
 * @param {Node} target
 * @param {Object} listener
 * @returns {boolean}
 */
Delegate.prototype.fire = function (event, target, listener) {
  return listener.handler.call(target, event, target);
};

/**
 * Check whether an element
 * matches a generic selector.
 *
 * @type function()
 * @param {string} selector A CSS selector
 */
var matches = (function (el) {
  if (!el) return;
  var p = el.prototype;
  return p.matches || p.matchesSelector || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || p.oMatchesSelector;
})(Element);

/**
 * Check whether an element
 * matches a tag selector.
 *
 * Tags are NOT case-sensitive,
 * except in XML (and XML-based
 * languages such as XHTML).
 *
 * @param {string} tagName The tag name to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}

/**
 * Check whether an element
 * matches the root.
 *
 * @param {?String} selector In this case this is always passed through as null and not used
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesRoot(selector, element) {
  /*jshint validthis:true*/
  if (this.rootElement === window) {
    return element === document;
  }return this.rootElement === element;
}

/**
 * Check whether the ID of
 * the element in 'this'
 * matches the given ID.
 *
 * IDs are case-sensitive.
 *
 * @param {string} id The ID to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */
function matchesId(id, element) {
  return id === element.id;
}

/**
 * Short hand for off()
 * and root(), ie both
 * with no parameters
 *
 * @return void
 */
Delegate.prototype.destroy = function () {
  this.off();
  this.root();
};

},{}],4:[function(require,module,exports){
"use strict";

module.exports = require("./../fetch/fetch.js");

},{"./../fetch/fetch.js":2}],5:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
"use strict";

var isFunction = require("../objects/isFunction"),
    isObject = require("../objects/isObject"),
    now = require("../utilities/now");

/* Native method shortcuts for methods with the same name as other `lodash` methods */
var nativeMax = Math.max;

/**
 * Creates a function that will delay the execution of `func` until after
 * `wait` milliseconds have elapsed since the last time it was invoked.
 * Provide an options object to indicate that `func` should be invoked on
 * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
 * to the debounced function will return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the debounced function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to debounce.
 * @param {number} wait The number of milliseconds to delay.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
 * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new debounced function.
 * @example
 *
 * // avoid costly calculations while the window size is in flux
 * var lazyLayout = _.debounce(calculateLayout, 150);
 * jQuery(window).on('resize', lazyLayout);
 *
 * // execute `sendMail` when the click event is fired, debouncing subsequent calls
 * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
 *   'leading': true,
 *   'trailing': false
 * });
 *
 * // ensure `batchLog` is executed once after 1 second of debounced calls
 * var source = new EventSource('/stream');
 * source.addEventListener('message', _.debounce(batchLog, 250, {
 *   'maxWait': 1000
 * }, false);
 */
function debounce(func, wait, options) {
  var args,
      maxTimeoutId,
      result,
      stamp,
      thisArg,
      timeoutId,
      trailingCall,
      lastCalled = 0,
      maxWait = false,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError();
  }
  wait = nativeMax(0, wait) || 0;
  if (options === true) {
    var leading = true;
    trailing = false;
  } else if (isObject(options)) {
    leading = options.leading;
    maxWait = "maxWait" in options && (nativeMax(wait, options.maxWait) || 0);
    trailing = "trailing" in options ? options.trailing : trailing;
  }
  var delayed = (function (_delayed) {
    var _delayedWrapper = function delayed() {
      return _delayed.apply(this, arguments);
    };

    _delayedWrapper.toString = function () {
      return _delayed.toString();
    };

    return _delayedWrapper;
  })(function () {
    var remaining = wait - (now() - stamp);
    if (remaining <= 0) {
      if (maxTimeoutId) {
        clearTimeout(maxTimeoutId);
      }
      var isCalled = trailingCall;
      maxTimeoutId = timeoutId = trailingCall = undefined;
      if (isCalled) {
        lastCalled = now();
        result = func.apply(thisArg, args);
        if (!timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
      }
    } else {
      timeoutId = setTimeout(delayed, remaining);
    }
  });

  var maxDelayed = function maxDelayed() {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    maxTimeoutId = timeoutId = trailingCall = undefined;
    if (trailing || maxWait !== wait) {
      lastCalled = now();
      result = func.apply(thisArg, args);
      if (!timeoutId && !maxTimeoutId) {
        args = thisArg = null;
      }
    }
  };

  return function () {
    args = arguments;
    stamp = now();
    thisArg = this;
    trailingCall = trailing && (timeoutId || !leading);

    if (maxWait === false) {
      var leadingCall = leading && !timeoutId;
    } else {
      if (!maxTimeoutId && !leading) {
        lastCalled = stamp;
      }
      var remaining = maxWait - (stamp - lastCalled),
          isCalled = remaining <= 0;

      if (isCalled) {
        if (maxTimeoutId) {
          maxTimeoutId = clearTimeout(maxTimeoutId);
        }
        lastCalled = stamp;
        result = func.apply(thisArg, args);
      } else if (!maxTimeoutId) {
        maxTimeoutId = setTimeout(maxDelayed, remaining);
      }
    }
    if (isCalled && timeoutId) {
      timeoutId = clearTimeout(timeoutId);
    } else if (!timeoutId && wait !== maxWait) {
      timeoutId = setTimeout(delayed, wait);
    }
    if (leadingCall) {
      isCalled = true;
      result = func.apply(thisArg, args);
    }
    if (isCalled && !timeoutId && !maxTimeoutId) {
      args = thisArg = null;
    }
    return result;
  };
}

module.exports = debounce;

},{"../objects/isFunction":9,"../objects/isObject":10,"../utilities/now":11}],6:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
"use strict";

var debounce = require("./debounce"),
    isFunction = require("../objects/isFunction"),
    isObject = require("../objects/isObject");

/** Used as an internal `_.debounce` options object */
var debounceOptions = {
  leading: false,
  maxWait: 0,
  trailing: false
};

/**
 * Creates a function that, when executed, will only call the `func` function
 * at most once per every `wait` milliseconds. Provide an options object to
 * indicate that `func` should be invoked on the leading and/or trailing edge
 * of the `wait` timeout. Subsequent calls to the throttled function will
 * return the result of the last `func` call.
 *
 * Note: If `leading` and `trailing` options are `true` `func` will be called
 * on the trailing edge of the timeout only if the the throttled function is
 * invoked more than once during the `wait` timeout.
 *
 * @static
 * @memberOf _
 * @category Functions
 * @param {Function} func The function to throttle.
 * @param {number} wait The number of milliseconds to throttle executions to.
 * @param {Object} [options] The options object.
 * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
 * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
 * @returns {Function} Returns the new throttled function.
 * @example
 *
 * // avoid excessively updating the position while scrolling
 * var throttled = _.throttle(updatePosition, 100);
 * jQuery(window).on('scroll', throttled);
 *
 * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
 * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
 *   'trailing': false
 * }));
 */
function throttle(func, wait, options) {
  var leading = true,
      trailing = true;

  if (!isFunction(func)) {
    throw new TypeError();
  }
  if (options === false) {
    leading = false;
  } else if (isObject(options)) {
    leading = "leading" in options ? options.leading : leading;
    trailing = "trailing" in options ? options.trailing : trailing;
  }
  debounceOptions.leading = leading;
  debounceOptions.maxWait = wait;
  debounceOptions.trailing = trailing;

  return debounce(func, wait, debounceOptions);
}

module.exports = throttle;

},{"../objects/isFunction":9,"../objects/isObject":10,"./debounce":5}],7:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used for native method references */
"use strict";

var objectProto = Object.prototype;

/** Used to resolve the internal [[Class]] of values */
var toString = objectProto.toString;

/** Used to detect if a method is native */
var reNative = RegExp("^" + String(toString).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/toString| for [^\]]+/g, ".*?") + "$");

/**
 * Checks if `value` is a native function.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
 */
function isNative(value) {
  return typeof value == "function" && reNative.test(value);
}

module.exports = isNative;

},{}],8:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/** Used to determine if values are of the language type Object */
"use strict";

var objectTypes = {
  boolean: false,
  "function": true,
  object: true,
  number: false,
  string: false,
  undefined: false
};

module.exports = objectTypes;

},{}],9:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */

/**
 * Checks if `value` is a function.
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 */
"use strict";

function isFunction(value) {
  return typeof value == "function";
}

module.exports = isFunction;

},{}],10:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
"use strict";

var objectTypes = require("../internals/objectTypes");

/**
 * Checks if `value` is the language type of Object.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Objects
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // check if the value is the ECMAScript language type of Object
  // http://es5.github.io/#x8
  // and avoid a V8 bug
  // http://code.google.com/p/v8/issues/detail?id=2291
  return !!(value && objectTypes[typeof value]);
}

module.exports = isObject;

},{"../internals/objectTypes":8}],11:[function(require,module,exports){
/**
 * Lo-Dash 2.4.1 (Custom Build) <http://lodash.com/>
 * Build: `lodash modularize modern exports="node" -o ./modern/`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <http://lodash.com/license>
 */
"use strict";

var isNative = require("../internals/isNative");

/**
 * Gets the number of milliseconds that have elapsed since the Unix epoch
 * (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @category Utilities
 * @example
 *
 * var stamp = _.now();
 * _.defer(function() { console.log(_.now() - stamp); });
 * // => logs the number of milliseconds it took for the deferred function to be called
 */
var now = isNative(now = Date.now) && now || function () {
  return new Date().getTime();
};

module.exports = now;

},{"../internals/isNative":7}],12:[function(require,module,exports){
/*global exports*/
"use strict";

function getClosestMatch(el, selector) {
	while (el) {
		if (el.matches(selector)) {
			return el;
		} else {
			el = el.parentElement;
		}
	}
	return false;
}

function getIndex(el) {
	var i = 0;
	if (el && typeof el === "object" && el.nodeType === 1) {
		while (el.previousSibling) {
			el = el.previousSibling;
			if (el.nodeType === 1) {
				++i;
			}
		}
		return i;
	}
}

exports.getClosestMatch = getClosestMatch;
exports.getIndex = getIndex;

},{}],13:[function(require,module,exports){
/*global require,module*/
"use strict";

var oHeader = require("./src/js/Header");
var constructAll = (function (_constructAll) {
	var _constructAllWrapper = function constructAll() {
		return _constructAll.apply(this, arguments);
	};

	_constructAllWrapper.toString = function () {
		return _constructAll.toString();
	};

	return _constructAllWrapper;
})(function () {
	oHeader.init();
	document.removeEventListener("o.DOMContentLoaded", constructAll);
});

document.addEventListener("o.DOMContentLoaded", constructAll);

module.exports = oHeader;

},{"./src/js/Header":14}],14:[function(require,module,exports){
/*global require,module*/
"use strict";

var DomDelegate = require("./../../../ftdomdelegate/lib/delegate.js");
var oHierarchicalNav = require("./../../../o-hierarchical-nav/main.js");

function Header(rootEl) {

	var bodyDelegate;
	// Gets all nav elements in the header
	var hierarchicalNavEls = [rootEl.querySelector(".o-header__nav--primary-theme"), rootEl.querySelector(".o-header__nav--secondary-theme"), rootEl.querySelector(".o-header__nav--tools-theme")].filter(function (el) {
		/**
   * Overflow is hidden by default on the tools and primary theme for it to resize properly on core experience
   * where level 2 and 3 menus won't appear anyway, but in primary experience they do need to appear. We do this
   * here instead of the map function in init because this needs to be applied regardless of the nav having been
   * initialized previously, like when the o.DOMContententLoaded event is dispatched
   */
		if (el) {
			el.style.overflow = "visible";
		}
		return el && el.nodeType === 1 && !el.hasAttribute("data-o-hierarchical-nav--js");
	});
	var hierarchicalNavs = [];

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		rootEl.setAttribute("data-o-header--js", "");
		bodyDelegate = new DomDelegate(document.body);
		hierarchicalNavs = hierarchicalNavEls.map(function (el) {
			return new oHierarchicalNav(el);
		});
	}

	// Release header and all its navs from memory
	function destroy() {
		bodyDelegate.destroy();
		for (var c = 0, l = hierarchicalNavs.length; c < l; c++) {
			if (hierarchicalNavs[c]) {
				hierarchicalNavs[c].destroy();
			}
		}
		rootEl.removeAttribute("data-o-header--js");
	}

	init();

	this.destroy = destroy;
}

// Initializes all header elements in the page or whatever element is passed to it
Header.init = function (el) {
	if (!el) {
		el = document.body;
	} else if (!(el instanceof HTMLElement)) {
		el = document.querySelector(el);
	}
	var headerEls = el.querySelectorAll("[data-o-component=\"o-header\"]");
	var headers = [];
	for (var c = 0, l = headerEls.length; c < l; c++) {
		if (!headerEls[c].hasAttribute("data-o-header--js")) {
			headers.push(new Header(headerEls[c]));
		}
	}
	return headers;
};

module.exports = Header;

},{"./../../../ftdomdelegate/lib/delegate.js":3,"./../../../o-hierarchical-nav/main.js":15}],15:[function(require,module,exports){
/*global require,module*/
"use strict";
var oHierarchicalNav = require("./src/js/ResponsiveNav");
var constructAll = (function (_constructAll) {
	var _constructAllWrapper = function constructAll() {
		return _constructAll.apply(this, arguments);
	};

	_constructAllWrapper.toString = function () {
		return _constructAll.toString();
	};

	return _constructAllWrapper;
})(function () {
	oHierarchicalNav.init();
	document.removeEventListener("o.DOMContentLoaded", constructAll);
});
document.addEventListener("o.DOMContentLoaded", constructAll);

module.exports = oHierarchicalNav;

},{"./src/js/ResponsiveNav":17}],16:[function(require,module,exports){
/*global require, module*/
"use strict";

var DomDelegate = require("./../../../ftdomdelegate/lib/delegate.js");
var oDom = require("./../../../o-dom/main.js");
var utils = require("./utils");

function Nav(rootEl) {

	var bodyDelegate = new DomDelegate(document.body);
	var rootDelegate = new DomDelegate(rootEl);

	// Get sub-level element
	function getChildListEl(el) {
		return el.querySelector("ul");
	}

	// Check if element has sub-level nav
	function hasChildList(el) {
		return !!getChildListEl(el);
	}

	// Get controlled element
	function getMegaDropdownEl(itemEl) {
		if (itemEl.hasAttribute("aria-controls")) {
			return document.getElementById(itemEl.getAttribute("aria-controls"));
		}
	}

	// Check if element is a controller of another DOM element
	function isControlEl(el) {
		return !!(getChildListEl(el) || getMegaDropdownEl(el));
	}

	// Check if element has been expanded
	function isExpanded(el) {
		return el.getAttribute("aria-expanded") === "true";
	}

	// Check if a certain element is inside the root nav
	function isElementInsideNav(el) {
		var expandedLevel1El = rootEl.querySelector("[data-o-hierarchical-nav-level=\"1\"] > [aria-expanded=\"true\"]");
		var expandedMegaDropdownEl;
		var allLevel1Els;

		if (expandedLevel1El) {
			expandedMegaDropdownEl = getMegaDropdownEl(expandedLevel1El);
			if (expandedMegaDropdownEl && expandedMegaDropdownEl.contains(el)) {
				return true;
			}
		}

		allLevel1Els = rootEl.querySelectorAll("[data-o-hierarchical-nav-level=\"1\"] > li");

		for (var c = 0, l = allLevel1Els.length; c < l; c++) {
			if (allLevel1Els[c].contains(el)) {
				return true;
			}
		}
		return false;
	}

	// Get the level a nav is in
	function getLevel(el) {
		return parseInt(el.parentNode.getAttribute("data-o-hierarchical-nav-level"), 10);
	}

	// Check if a level 2 nav will fit in the window
	function level2ListFitsInWindow(l2El) {
		return l2El.getBoundingClientRect().right < window.innerWidth;
	}

	// Check if an element will have enough space to its right
	function elementFitsToRight(el1, el2) {
		return el1.getBoundingClientRect().right + el2.offsetWidth < window.innerWidth;
	}

	// Depending on if an element fits to its right or not, change its class to apply correct css
	function positionChildListEl(parentEl, childEl) {
		parentEl.classList.remove("o-hierarchical-nav--align-right");
		parentEl.classList.remove("o-hierarchical-nav__outside-right");
		parentEl.classList.remove("o-hierarchical-nav--left");

		if (!childEl) {
			return;
		}

		if (getLevel(parentEl) === 1) {
			if (!level2ListFitsInWindow(childEl)) {
				parentEl.classList.add("o-hierarchical-nav--align-right");
			}
		} else {
			if (elementFitsToRight(parentEl, childEl)) {
				parentEl.classList.add("o-hierarchical-nav__outside-right");
			}
		}
	}

	// Hide an element
	function hideEl(el) {
		if (el) {
			el.setAttribute("aria-hidden", "true");
		}
	}

	// Display an element
	function showEl(el) {
		if (el) {
			el.removeAttribute("aria-hidden");
		}
	}

	// Collapse all items from a certain node list
	function collapseAll(nodeList) {
		if (!nodeList) {
			nodeList = rootEl.querySelectorAll("[data-o-hierarchical-nav-level=\"1\"] > li[aria-expanded=true]");
		}

		utils.nodeListToArray(nodeList).forEach(function (childListItemEl) {
			if (isExpanded(childListItemEl)) {
				collapseItem(childListItemEl);
			}
		});
	}

	// Set an element as not expanded, and if it has children, do the same to them
	function collapseItem(itemEl) {
		itemEl.setAttribute("aria-expanded", "false");

		if (utils.isIE8) {
			itemEl.classList.add("forceIErepaint");
			itemEl.classList.remove("forceIErepaint");
		}

		if (hasChildList(itemEl)) {
			collapseAll(getChildListEl(itemEl).children);
		}

		hideEl(getMegaDropdownEl(itemEl));
		dispatchCloseEvent(itemEl);
	}

	// Get same level items and collapse them
	function collapseSiblingItems(itemEl) {
		var listLevel = oDom.getClosestMatch(itemEl, "ul").getAttribute("data-o-hierarchical-nav-level");
		var listItemEls = rootEl.querySelectorAll("[data-o-hierarchical-nav-level=\"" + listLevel + "\"] > li[aria-expanded=\"true\"]");

		for (var c = 0, l = listItemEls.length; c < l; c++) {
			collapseItem(listItemEls[c]);
		}
	}

	// Expand a nav item
	function expandItem(itemEl) {
		collapseSiblingItems(itemEl);
		itemEl.setAttribute("aria-expanded", "true");
		positionChildListEl(itemEl, getChildListEl(itemEl));
		showEl(getMegaDropdownEl(itemEl));
		dispatchExpandEvent(itemEl);
	}

	// Helper method to dispatch o-layers new event
	function dispatchExpandEvent(itemEl) {
		utils.dispatchCustomEvent(itemEl, "oLayers.new", { zIndex: 10, el: itemEl });
	}

	// Helper method to dispatch o-layers close event
	function dispatchCloseEvent(itemEl) {
		utils.dispatchCustomEvent(itemEl, "oLayers.close", { zIndex: 10, el: itemEl });
	}

	// Handle clicks ourselved by expanding or collapsing selected element
	function handleClick(ev) {
		var itemEl = oDom.getClosestMatch(ev.target, "li");

		if (itemEl && isControlEl(itemEl)) {
			ev.preventDefault();

			if (!isExpanded(itemEl)) {
				expandItem(itemEl);
			} else {
				collapseItem(itemEl);
			}
		}
	}

	// Position a level 3 nav
	function positionLevel3s() {
		var openLevel2El = rootEl.querySelector("[data-o-hierarchical-nav-level=\"2\"] > [aria-expanded=\"true\"]");
		var openLevel3El = rootEl.querySelector("[data-o-hierarchical-nav-level=\"2\"] > [aria-expanded=\"true\"] > ul");

		if (openLevel2El && openLevel3El) {
			positionChildListEl(openLevel2El, openLevel3El);
		}
	}

	// Position level 3s on resize
	function resize() {
		positionLevel3s();
	}

	// Set all tabIndexes of a tags to 0
	function setTabIndexes() {
		var aEls = rootEl.querySelectorAll("li > a");

		for (var c = 0, l = aEls.length; c < l; c++) {
			if (!aEls[c].hasAttribute("href")) {
				if (aEls[c].tabIndex === 0) {
					// Don't override tabIndex if something else has set it, but otherwise set it to zero to make it focusable.
					aEls[c].tabIndex = 0;
				}
			}
		}
	}

	function setLayersContext() {
		// We'll use the body as the default context
		bodyDelegate.on("oLayers.new", function (e) {
			if (!isElementInsideNav(e.detail.el)) {
				collapseAll();
			}
		});
	}

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		rootEl.setAttribute("data-o-hierarchical-nav--js", "");
		setTabIndexes();
		setLayersContext();
		rootDelegate.on("click", handleClick);
		rootDelegate.on("keyup", function (ev) {
			// Pressing enter key on anchors without @href won't trigger a click event
			if (!ev.target.hasAttribute("href") && ev.keyCode === 13 && isElementInsideNav(ev.target)) {
				handleClick(ev);
			}
		});

		// Collapse all elements if the user clicks outside the nav
		bodyDelegate.on("click", function (ev) {
			if (!isElementInsideNav(ev.target)) {
				collapseAll();
			}
		});
	}

	function destroy() {
		rootDelegate.destroy();
		bodyDelegate.destroy();
		rootEl.removeAttribute("data-o-hierarchical-nav--js");
	}

	init();

	this.resize = resize;
	this.collapseAll = collapseAll;
	this.destroy = destroy;
}

module.exports = Nav;

},{"./../../../ftdomdelegate/lib/delegate.js":3,"./../../../o-dom/main.js":12,"./utils":18}],17:[function(require,module,exports){
/*global require,module*/
"use strict";

var SquishyList = require("./../../../o-squishy-list/main.js");
var DomDelegate = require("./../../../ftdomdelegate/lib/delegate.js");
var oViewport = require("./../../../o-viewport/main.js");
var Nav = require("./Nav");

function ResponsiveNav(rootEl) {

	var rootDelegate;
	var nav;
	var contentFilterEl;
	var contentFilter;
	var moreEl;
	var moreListEl;

	// Check if element is a controller of another DOM element
	function isMegaDropdownControl(el) {
		return el.hasAttribute("aria-controls");
	}

	// On resize, apply o-squishy-list, and, if it has a sub-level dom, populate more list
	function resize() {
		nav.resize();

		if (contentFilter) {
			contentFilter.squish();
			if (!isMegaDropdownControl(moreEl)) {
				populateMoreList(contentFilter.getHiddenItems());
			}
		}
	}

	// Empty the more list
	function emptyMoreList() {
		moreListEl.innerHTML = "";
	}

	// Get the information from the element and create a new li tag with the element's text to append more list
	function addItemToMoreList(text, href) {
		var itemEl = document.createElement("li");
		var aEl = document.createElement("a");

		if (typeof aEl.textContent !== "undefined") {
			aEl.textContent = text;
		} else {
			aEl.innerText = text;
		}

		aEl.href = href;
		itemEl.appendChild(aEl);
		moreListEl.appendChild(itemEl);
	}

	// For every hidden item, add it to the more list
	function populateMoreList(hiddenEls) {
		emptyMoreList();

		for (var c = 0, l = hiddenEls.length; c < l; c++) {
			var aEl = hiddenEls[c].querySelector("a");
			var ulEl = hiddenEls[c].querySelector("ul");

			var aText = typeof aEl.textContent !== "undefined" ? aEl.textContent : aEl.innerText;
			addItemToMoreList(aText, aEl.href, ulEl);
		}
	}

	// If all elements are hidden, add the all modifier, if not, the some modifier
	function setMoreElClass(remainingItems) {
		if (!moreEl) {
			return;
		}

		if (remainingItems === 0) {
			moreEl.classList.add("o-hierarchical-nav__more--all");
			moreEl.classList.remove("o-hierarchical-nav__more--some");
		} else {
			moreEl.classList.add("o-hierarchical-nav__more--some");
			moreEl.classList.remove("o-hierarchical-nav__more--all");
		}
	}

	// When there's an o-squishy-list change, collapse all elements and run the setMoreElClass method with number of non-hidden elements
	function contentFilterChangeHandler(ev) {
		if (ev.target === contentFilterEl && ev.detail.hiddenItems.length > 0) {
			nav.collapseAll();
			setMoreElClass(ev.detail.remainingItems.length);
		}
	}

	// If more button is clicked, populate it
	function navExpandHandler(ev) {
		if (ev.target === moreEl) {
			populateMoreList(contentFilter.getHiddenItems());
		}
	}

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}

		nav = new Nav(rootEl);
		rootDelegate = new DomDelegate(rootEl);
		contentFilterEl = rootEl.querySelector("ul");
		moreEl = rootEl.querySelector("[data-more]");

		if (contentFilterEl) {
			contentFilter = new SquishyList(contentFilterEl, { filterOnResize: false });
		}

		// If there's a more element, add a ul tag where hidden elements will be appended
		if (moreEl) {
			moreEl.setAttribute("aria-hidden", "true");

			if (!isMegaDropdownControl(moreEl)) {
				moreListEl = document.createElement("ul");
				moreListEl.setAttribute("data-o-hierarchical-nav-level", "2");
				moreEl.appendChild(moreListEl);
				rootDelegate.on("oLayers.new", navExpandHandler);
			}
		}

		rootDelegate.on("oSquishyList.change", contentFilterChangeHandler);

		var bodyDelegate = new DomDelegate(document.body);

		// Force a resize when it loads, in case it loads on a smaller screen
		resize();

		oViewport.listenTo("resize");
		bodyDelegate.on("oViewport.resize", resize);
	}

	function destroy() {
		rootDelegate.destroy();
		rootEl.removeAttribute("data-o-hierarchical-nav--js");
	}

	init();

	this.resize = resize;
	this.destroy = destroy;
}

// Initializes all nav elements in the page or whatever element is passed to it
ResponsiveNav.init = function (el) {
	if (!el) {
		el = document.body;
	} else if (!(el instanceof HTMLElement)) {
		el = document.querySelector(el);
	}

	var navEls = el.querySelectorAll("[data-o-component=\"o-hierarchical-nav\"]");
	var responsiveNavs = [];

	for (var c = 0, l = navEls.length; c < l; c++) {
		if (!navEls[c].hasAttribute("data-o-hierarchical-nav--js")) {
			// If it's a vertical nav, we don't need all the responsive methods
			if (navEls[c].getAttribute("data-o-hierarchical-nav-orientiation") === "vertical") {
				responsiveNavs.push(new Nav(navEls[c]));
			} else {
				responsiveNavs.push(new ResponsiveNav(navEls[c]));
			}
		}
	}

	return responsiveNavs;
};

module.exports = ResponsiveNav;

},{"./../../../ftdomdelegate/lib/delegate.js":3,"./../../../o-squishy-list/main.js":19,"./../../../o-viewport/main.js":20,"./Nav":16}],18:[function(require,module,exports){
/*global exports*/

// Helper function that converts a list of elements into an array
"use strict";

function nodeListToArray(nl) {
	"use strict";
	return [].map.call(nl, function (element) {
		return element;
	});
}

// Helper function to dispatch events
function dispatchCustomEvent(el, name, data) {
	"use strict";
	if (document.createEvent && el.dispatchEvent) {
		var event = document.createEvent("Event");
		event.initEvent(name, true, true);

		if (data) {
			event.detail = data;
		}

		el.dispatchEvent(event);
	}
}

function isIE8() {
	"use strict";

	var b = document.createElement("B");
	var docElem = document.documentElement;
	var isIE;

	b.innerHTML = "<!--[if IE 8]><b id=\"ie8test\"></b><![endif]-->";
	docElem.appendChild(b);
	isIE = !!document.getElementById("ie8test");
	docElem.removeChild(b);
	return isIE;
}

exports.isIE8 = isIE8();
exports.nodeListToArray = nodeListToArray;
exports.dispatchCustomEvent = dispatchCustomEvent;

},{}],19:[function(require,module,exports){
/*global module*/

"use strict";

function SquishyList(rootEl, opts) {
	"use strict";

	var allItemEls;
	var prioritySortedItemEls;
	var hiddenItemEls;
	var moreEl;
	var moreWidth = 0;
	var debounceTimeout;
	var options = opts || { filterOnResize: true };

	function dispatchCustomEvent(name, data) {
		if (document.createEvent && rootEl.dispatchEvent) {
			var event = document.createEvent("Event");
			event.initEvent(name, true, true);
			if (data) {
				event.detail = data;
			}
			rootEl.dispatchEvent(event);
		}
	}

	function getItemEls() {
		var itemEls = [];
		var childNodeEl;

		for (var c = 0, l = rootEl.childNodes.length; c < l; c++) {
			childNodeEl = rootEl.childNodes[c];
			// Make it flexible so that other product and modules can manually hide elements and o-squishy-list won't add it to it's list
			if (childNodeEl.nodeType === 1 && !childNodeEl.hasAttribute("data-more") && !childNodeEl.hasAttribute("data-o-squishy-list--ignore")) {
				itemEls.push(childNodeEl);
			}
		}
		return itemEls;
	}

	function showEl(el) {
		if (el) {
			el.removeAttribute("aria-hidden");
		}
	}

	function hideEl(el) {
		if (el) {
			el.setAttribute("aria-hidden", "true");
		}
	}

	function getElPriority(el) {
		return parseInt(el.getAttribute("data-priority"), 10);
	}

	function getPrioritySortedChildNodeEls() {
		allItemEls = getItemEls();
		prioritySortedItemEls = [];
		var unprioritisedItemEls = [];
		for (var c = 0, l = allItemEls.length; c < l; c++) {
			var thisItemEl = allItemEls[c],
			    thisItemPriority = getElPriority(thisItemEl);
			if (isNaN(thisItemPriority)) {
				unprioritisedItemEls.push(thisItemEl);
			} else if (thisItemPriority >= 0) {
				if (!Array.isArray(prioritySortedItemEls[thisItemPriority])) {
					prioritySortedItemEls[thisItemPriority] = [];
				}
				prioritySortedItemEls[thisItemPriority].push(thisItemEl);
			}
		}
		if (unprioritisedItemEls.length > 0) {
			prioritySortedItemEls.push(unprioritisedItemEls);
		}
		prioritySortedItemEls = prioritySortedItemEls.filter(function (v) {
			return v !== undefined;
		});
	}

	function showAllItems() {
		hiddenItemEls = [];
		for (var c = 0, l = allItemEls.length; c < l; c++) {
			showEl(allItemEls[c]);
		}
	}

	function hideItems(els) {
		hiddenItemEls = hiddenItemEls.concat(els);
		for (var c = 0, l = els.length; c < l; c++) {
			hideEl(els[c]);
		}
	}

	function getVisibleContentWidth() {
		var visibleItemsWidth = 0;
		for (var c = 0, l = allItemEls.length; c < l; c++) {
			if (!allItemEls[c].hasAttribute("aria-hidden")) {
				visibleItemsWidth += allItemEls[c].offsetWidth; // Needs to take into account margins too
			}
		}
		return visibleItemsWidth;
	}

	function doesContentFit() {
		return getVisibleContentWidth() <= rootEl.clientWidth;
	}

	function getHiddenItems() {
		return hiddenItemEls;
	}

	function getRemainingItems() {
		return allItemEls.filter(function (el) {
			return hiddenItemEls.indexOf(el) === -1;
		});
	}

	function squish() {
		showAllItems();
		if (doesContentFit()) {
			hideEl(moreEl);
		} else {
			for (var p = prioritySortedItemEls.length - 1; p >= 0; p--) {
				hideItems(prioritySortedItemEls[p]);
				if (getVisibleContentWidth() + moreWidth <= rootEl.clientWidth) {
					showEl(moreEl);
					break;
				}
			}
		}
		dispatchCustomEvent("oSquishyList.change", {
			hiddenItems: getHiddenItems(),
			remainingItems: getRemainingItems()
		});
	}

	function resizeHandler() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(squish, 50);
	}

	function destroy() {
		for (var c = 0, l = allItemEls.length; c < l; c++) {
			allItemEls[c].removeAttribute("aria-hidden");
		}
		window.removeEventListener("resize", resizeHandler, false);
		rootEl.removeAttribute("data-o-squishy-list-js");
	}

	function init() {
		if (!rootEl) {
			rootEl = document.body;
		} else if (!(rootEl instanceof HTMLElement)) {
			rootEl = document.querySelector(rootEl);
		}
		rootEl.setAttribute("data-o-squishy-list-js", "");
		getPrioritySortedChildNodeEls();
		moreEl = rootEl.querySelector("[data-more]");
		if (moreEl) {
			showEl(moreEl);
			moreWidth = moreEl.offsetWidth;
			hideEl(moreEl);
		}
		squish();
		if (options.filterOnResize) {
			window.addEventListener("resize", resizeHandler, false);
		}
	}

	init();

	this.getHiddenItems = getHiddenItems;
	this.getRemainingItems = getRemainingItems;
	this.squish = squish;
	this.destroy = destroy;

	dispatchCustomEvent("oSquishyList.ready");
}

module.exports = SquishyList;

},{}],20:[function(require,module,exports){
/* globals console */
"use strict";

var throttle = require("./../lodash-node/modern/functions/throttle");
var debounce = require("./../lodash-node/modern/functions/debounce");
var debug;
var initFlags = {};
var intervals = {
	resize: 100,
	orientation: 100,
	scroll: 100
};

function broadcast(eventType, data) {
	if (debug) {
		console.log("o-viewport", eventType, data);
	}

	document.body.dispatchEvent(new CustomEvent("oViewport." + eventType, {
		detail: data,
		bubbles: true
	}));
}

function getOrientation() {
	var orientation = window.screen.orientation || window.screen.mozOrientation || window.screen.msOrientation || undefined;
	if (orientation) {
		return typeof orientation === "string" ? orientation.split("-")[0] : orientation.type.split("-")[0];
	} else if (window.matchMedia) {
		return window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
	} else {
		return window.innerHeight >= window.innerWidth ? "portrait" : "landscape";
	}
}

function getSize() {
	return {
		height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
		width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	};
}

function setThrottleInterval(eventType, interval) {
	if (typeof arguments[0] === "number") {
		setThrottleInterval("scroll", arguments[0]);
		setThrottleInterval("resize", arguments[1]);
		setThrottleInterval("orientation", arguments[2]);
	} else if (interval) {
		intervals[eventType] = interval;
	}
}

function init(eventType) {
	if (initFlags[eventType]) {
		return true;
	}

	initFlags[eventType] = true;
	return false;
}

function listenToResize() {

	if (init("resize")) {
		return;
	}

	window.addEventListener("resize", debounce(function (ev) {
		broadcast("resize", {
			viewport: getSize(),
			originalEvent: ev
		});
	}, intervals.resize));
}

function listenToOrientation() {

	if (init("orientation")) {
		return;
	}

	window.addEventListener("orientationchange", debounce(function (ev) {
		broadcast("orientation", {
			viewport: getSize(),
			orientation: getOrientation(),
			originalEvent: ev
		});
	}, intervals.orientation));
}

function listenToScroll() {

	if (init("scroll")) {
		return;
	}

	window.addEventListener("scroll", throttle(function (ev) {
		broadcast("scroll", {
			viewport: getSize(),
			scrollHeight: document.body.scrollHeight,
			scrollLeft: document.documentElement && document.documentElement.scrollLeft || document.body.scrollLeft,
			scrollTop: document.documentElement && document.documentElement.scrollTop || document.body.scrollTop,
			scrollWidth: document.body.scrollWidth,
			originalEvent: ev
		});
	}, intervals.scroll));
}

function listenTo(eventType) {
	if (eventType === "resize") {
		listenToResize();
	} else if (eventType === "scroll") {
		listenToScroll();
	} else if (eventType === "orientation") {
		listenToOrientation();
	}
}

module.exports = {
	debug: (function (_debug) {
		var _debugWrapper = function debug() {
			return _debug.apply(this, arguments);
		};

		_debugWrapper.toString = function () {
			return _debug.toString();
		};

		return _debugWrapper;
	})(function () {
		debug = true;
	}),
	listenTo: listenTo,
	setThrottleInterval: setThrottleInterval,
	getOrientation: getOrientation,
	getSize: getSize
};

},{"./../lodash-node/modern/functions/debounce":5,"./../lodash-node/modern/functions/throttle":6}],21:[function(require,module,exports){
"use strict";

require("./bower_components/es6-promise/promise.js").polyfill();
require("./bower_components/isomorphic-fetch/client.js");

var header = require("./bower_components/o-header/main.js");

var apiHandler = require("./src/js/api");
var chart = require("./src/js/charts");
var map = require("./src/js/maps");

function loadResults(results) {
	var container = document.querySelector(".results-container");
	container.innerHTML = "";

	Object.keys(results).forEach(function (facet) {
		var resultBox = document.createElement("div");
		resultBox.classList.add("result-box");

		var listTitle = document.createElement("h2");
		listTitle.classList.add("result-box__title");
		listTitle.textContent = facet;

		resultBox.appendChild(listTitle);

		var facetResults = results[facet].buckets;

		var data = {
			facet: facet,
			names: [],
			reads: []
		};

		for (var i = 0; i < facetResults.length; i++) {
			data.names[i] = facetResults[i].value;
			data.reads[i] = facetResults[i].count;
		}

		var resultElement;

		if (facet === "country") {
			resultElement = document.createElement("div");
			resultElement.classList.add("result-box__chart", "result-box__chart--" + facet);
		} else {
			resultElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			resultElement.classList.add("result-box__chart", "result-box__chart--" + facet);
		}

		resultBox.appendChild(resultElement);

		container.appendChild(resultBox);

		if (facet === "country") {
			map(data);
		} else {
			chart(data);
		}
	});
}

function init() {
	var industriesSelect = document.querySelector(".search-box__select--industries");
	var countriesSelect = document.querySelector(".search-box__select--countries");
	var positionsSelect = document.querySelector(".search-box__select--positions");
	var responsibilitiesSelect = document.querySelector(".search-box__select--responsibilities");
	var contentInput = document.querySelector(".search-box__input--content");
	var contentFacetList = document.querySelector(".search-box__facet--list");

	apiHandler.getIndustries().then(function (industries) {
		var option = document.createElement("option");
		option.value = undefined;
		option.text = "--------";
		industriesSelect.add(option);

		for (var i = 0; i < industries.length; i++) {
			var option = document.createElement("option");
			option.value = industries[i].name;
			option.text = industries[i].name;
			industriesSelect.add(option);
		}
	}, function (error) {
		throw error;
	});

	apiHandler.getCountries().then(function (countries) {
		var option = document.createElement("option");
		option.value = undefined;
		option.text = "--------";
		countriesSelect.add(option);

		for (var i = 0; i < countries.length; i++) {
			var option = document.createElement("option");
			option.value = countries[i].iso3;
			option.text = countries[i].country;
			countriesSelect.add(option);
		}
	}, function (error) {
		throw error;
	});

	apiHandler.getPositions().then(function (positions) {
		var option = document.createElement("option");
		option.value = undefined;
		option.text = "--------";
		positionsSelect.add(option);

		for (var i = 0; i < positions.length; i++) {
			var option = document.createElement("option");
			option.value = positions[i].name;
			option.text = positions[i].name;
			positionsSelect.add(option);
		}
	}, function (error) {
		throw error;
	});

	apiHandler.getResponsibilities().then(function (responsibilities) {
		var option = document.createElement("option");
		option.value = undefined;
		option.text = "--------";
		responsibilitiesSelect.add(option);

		for (var i = 0; i < responsibilities.length; i++) {
			var option = document.createElement("option");
			option.value = responsibilities[i].name;
			option.text = responsibilities[i].name;
			responsibilitiesSelect.add(option);
		}
	}, function (error) {
		throw error;
	});

	apiHandler.getContentFacets().then(function (facets) {
		facets.forEach(function (facet) {
			var checkboxWrapper = document.createElement("div");

			var checkboxElement = document.createElement("input");
			checkboxElement.type = "checkbox";
			checkboxElement.id = "checkbox-" + facet;
			checkboxElement.name = facet;
			checkboxElement.value = facet;
			checkboxElement.classList.add("o-forms-checkbox");

			var checkboxLabel = document.createElement("label");
			checkboxLabel.htmlFor = "checkbox-" + facet;
			checkboxLabel.textContent = facet;
			checkboxLabel.classList.add("o-forms-label");

			checkboxWrapper.appendChild(checkboxElement);
			checkboxWrapper.appendChild(checkboxLabel);

			contentFacetList.appendChild(checkboxWrapper);
		});
	});

	var searchSubmitHandler = function searchSubmitHandler(ev) {
		var queryParams = {};

		if (industriesSelect.value !== "undefined") {
			queryParams.industry = industriesSelect.value;
		}

		if (countriesSelect.value !== "undefined") {
			queryParams.country = countriesSelect.value;
		}

		if (positionsSelect.value !== "undefined") {
			queryParams.position = positionsSelect.value;
		}

		if (responsibilitiesSelect.value !== "undefined") {
			queryParams.responsibility = responsibilitiesSelect.value;
		}

		if (contentInput.value !== "") {
			queryParams.content = contentInput.value;
		}

		var facets = [];

		var facetCheckboxes = contentFacetList.querySelectorAll(".o-forms-checkbox");

		for (var i = 0; i < facetCheckboxes.length; i++) {
			if (facetCheckboxes[i].checked) {
				facets.push(facetCheckboxes[i].value);
			}
		}

		apiHandler.search(queryParams, facets).then(function (results) {
			loadResults(results);
		}, function (error) {
			throw error;
		});
	};

	var submitButton = document.querySelector(".search-box__submit");
	submitButton.addEventListener("click", searchSubmitHandler);
}

init();

document.addEventListener("DOMContentLoaded", function () {
	document.dispatchEvent(new CustomEvent("o.DOMContentLoaded"));
});

},{"./bower_components/es6-promise/promise.js":1,"./bower_components/isomorphic-fetch/client.js":4,"./bower_components/o-header/main.js":13,"./src/js/api":23,"./src/js/charts":24,"./src/js/maps":25}],22:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],23:[function(require,module,exports){
"use strict";

var baseUrl = "http://ft-development-int.apigee.net/";
var contentFacets = ["brand", "genre", "people", "primary_section", "primary_theme", "regions", "sections", "subjects", "topics"];
var userFacets = ["country", "industry", "position", "responsibility"];

var apiHandler = {};

apiHandler.getIndustries = function () {
	var industriesApi = "standard-data/industry-sectors/legacy";
	return new Promise(function (resolve, reject) {
		fetch(baseUrl + industriesApi).then(function (res) {
			if (res.status !== 200) {
				reject("fetch failed with status " + res.status);
			}

			return res.json();
		}).then(function (industries) {
			resolve(industries.industries);
		})["catch"](function (e) {
			reject(e);
		});
	});
};

apiHandler.getCountries = function () {
	var countriesApi = "standard-data/countries/v1.2";
	return new Promise(function (resolve, reject) {
		fetch(baseUrl + countriesApi).then(function (res) {
			if (res.status !== 200) {
				reject("fetch failed with status " + res.status);
			}

			return res.json();
		}).then(function (countries) {
			resolve(countries.countries);
		})["catch"](function (e) {
			reject(e);
		});
	});
};

apiHandler.getPositions = function () {
	var positionsApi = "standard-data/job-titles/legacy";
	return new Promise(function (resolve, reject) {
		fetch(baseUrl + positionsApi).then(function (res) {
			if (res.status !== 200) {
				reject("fetch failed with status " + res.status);
			}

			return res.json();
		}).then(function (positions) {
			resolve(positions.jobTitles);
		})["catch"](function (e) {
			reject(e);
		});
	});
};

apiHandler.getResponsibilities = function () {
	var responsibilitiesApi = "standard-data/job-responsibilities/legacy";
	return new Promise(function (resolve, reject) {
		fetch(baseUrl + responsibilitiesApi).then(function (res) {
			if (res.status !== 200) {
				reject("fetch failed with status " + res.status);
			}

			return res.json();
		}).then(function (responsibilities) {
			resolve(responsibilities.jobResponsibilities);
		})["catch"](function (e) {
			reject(e);
		});
	});
};

apiHandler.getContentFacets = function () {
	return new Promise(function (resolve, reject) {
		resolve(contentFacets.concat(userFacets));
	});
};

apiHandler.search = function (queryParams, facets) {
	var searchApi = "ft-reading-stats-cloud";
	var query = "?q.parser=structured&size=0";
	var facetConfig = encodeURIComponent("{sort:\"count\",size:10}");

	return new Promise(function (resolve, reject) {
		var params = Object.keys(queryParams);
		if (params.length === 0) {
			reject("At least one parameter needs to be selected to make a search.");
		} else {
			query += "&q=" + encodeURIComponent("(and ");

			params.forEach(function (queryKey) {
				if (queryKey === "content") {
					query += encodeURIComponent(queryParams[queryKey]);
				} else {
					query += encodeURIComponent(queryKey) + ":" + encodeURIComponent("'" + queryParams[queryKey] + "' ");
				}
			});

			query += ")";
		}

		if (facets.length === 0) {
			reject("At least one facet needs to be selected.");
		} else {
			facets.forEach(function (facet) {
				query += "&facet." + facet + "=" + (facet === "country" ? facetConfig.replace("10", "300") : facetConfig);
			});
		}

		fetch(baseUrl + searchApi + query).then(function (res) {
			if (res.status !== 200) {
				reject("fetch failed with status " + res.status);
			}
			return res.json();
		}).then(function (results) {
			resolve(results.facets);
		})["catch"](function (e) {
			reject(e);
		});
	});
};

module.exports = apiHandler;

},{}],24:[function(require,module,exports){
"use strict";

var margin = { top: 40, right: 10, bottom: 10, left: 10 };
var width = 560 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;

function generateChart(data) {
	var y = d3.scale.ordinal().domain(data.names).rangeRoundBands([height, 0], 0.1);

	var x = d3.scale.linear().domain([0, d3.max(data.reads)]).range([0, width]);

	var xAxis = d3.svg.axis().scale(x).orient("top");

	var chart = d3.select(".result-box__chart--" + data.facet).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	chart.append("g").attr("class", "result-box__chart__axis result-box__chart__axis--x").call(xAxis);

	var bar = chart.selectAll(".result-box__chart__bar-wrapper").data(data.reads).enter().append("g").attr("class", "result-box__chart__bar-wrapper").attr("transform", function (d, i) {
		return "translate(0," + i * y.rangeBand() + ")";
	});

	bar.append("rect").attr("class", "result-box__chart__bar").attr("width", x).attr("height", y.rangeBand() - 1).style("cursor", "pointer").on("click", function (d) {
		document.location.href = "http://www.google.com/";
	});

	bar.append("text").attr("x", margin.left).attr("y", y.rangeBand() / 2).attr("dy", ".35em").text(function (d, i) {
		return data.names[i];
	});
}

module.exports = generateChart;

},{}],25:[function(require,module,exports){
"use strict";

var margin = { top: 40, right: 10, bottom: 10, left: 10 };
var width = 560 - margin.left - margin.right;
var height = 400;

function generateMap(data) {
	var scale = d3.scale.linear().domain([0, d3.max(data.reads)]).range(["yellow", "red"]);

	var map = new Datamap({
		element: document.querySelector(".result-box__chart--" + data.facet),
		projection: "mercator",
		width: width,
		height: height,
		fills: {
			defaultFill: "#a1dbb2" }
	});

	var mapInfo = {};

	data.names.forEach(function (country, index) {
		mapInfo[country] = scale(data.reads[index]);
	});

	map.updateChoropleth(mapInfo);
}

module.exports = generateMap;

},{}]},{},[21])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovbm9kZV9tb2R1bGVzL29yaWdhbWktYnVpbGQtdG9vbHMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9lczYtcHJvbWlzZS9wcm9taXNlLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2ZldGNoL2ZldGNoLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2Z0ZG9tZGVsZWdhdGUvbGliL2RlbGVnYXRlLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2lzb21vcnBoaWMtZmV0Y2gvY2xpZW50LmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2xvZGFzaC1ub2RlL21vZGVybi9mdW5jdGlvbnMvZGVib3VuY2UuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L2Jvd2VyX2NvbXBvbmVudHMvbG9kYXNoLW5vZGUvbW9kZXJuL2Z1bmN0aW9ucy90aHJvdHRsZS5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9sb2Rhc2gtbm9kZS9tb2Rlcm4vaW50ZXJuYWxzL2lzTmF0aXZlLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2xvZGFzaC1ub2RlL21vZGVybi9pbnRlcm5hbHMvb2JqZWN0VHlwZXMuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L2Jvd2VyX2NvbXBvbmVudHMvbG9kYXNoLW5vZGUvbW9kZXJuL29iamVjdHMvaXNGdW5jdGlvbi5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9sb2Rhc2gtbm9kZS9tb2Rlcm4vb2JqZWN0cy9pc09iamVjdC5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9sb2Rhc2gtbm9kZS9tb2Rlcm4vdXRpbGl0aWVzL25vdy5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9vLWRvbS9tYWluLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL28taGVhZGVyL21haW4uanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L2Jvd2VyX2NvbXBvbmVudHMvby1oZWFkZXIvc3JjL2pzL0hlYWRlci5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9vLWhpZXJhcmNoaWNhbC1uYXYvbWFpbi5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9vLWhpZXJhcmNoaWNhbC1uYXYvc3JjL2pzL05hdi5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9vLWhpZXJhcmNoaWNhbC1uYXYvc3JjL2pzL1Jlc3BvbnNpdmVOYXYuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L2Jvd2VyX2NvbXBvbmVudHMvby1oaWVyYXJjaGljYWwtbmF2L3NyYy9qcy91dGlscy5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9vLXNxdWlzaHktbGlzdC9tYWluLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL28tdmlld3BvcnQvbWFpbi5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovbWFpbi5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovbm9kZV9tb2R1bGVzL29yaWdhbWktYnVpbGQtdG9vbHMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9zcmMvanMvYXBpLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9zcmMvanMvY2hhcnRzLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9zcmMvanMvbWFwcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNRQSxDQUFDLFlBQVc7QUFDUixjQUFZLENBQUM7QUFDYixXQUFTLHVDQUF1QyxDQUFDLENBQUMsRUFBRTtBQUNsRCxXQUFPLE9BQU8sQ0FBQyxLQUFLLFVBQVUsSUFBSyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLElBQUksQUFBQyxDQUFDO0dBQ3pFOztBQUVELFdBQVMsaUNBQWlDLENBQUMsQ0FBQyxFQUFFO0FBQzVDLFdBQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxDQUFDO0dBQ2hDOztBQUVELFdBQVMsc0NBQXNDLENBQUMsQ0FBQyxFQUFFO0FBQ2pELFdBQU8sT0FBTyxDQUFDLEtBQUssUUFB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QUFLLENBQUMsQ0FBQyxDQUFDOztBQUUxQixLQUFJLEdBQUcsR0FBRyxJQUFJLE9BQU8sQ0FBQztBQUNyQixTQUFPLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQ3BFLFlBQVUsRUFBRSxVQUFVO0FBQ3RCLE9BQUssRUFBRSxLQUFLO0FBQ1osUUFBTSxFQUFFLE1BQU07QUFDZCxPQUFLLEVBQUU7QUFDTixjQUFXLEVBQUUsU0FBUyxFQUN0QjtFQUNELENBQUMsQ0FBQzs7QUFFSCxLQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0FBRWpCLEtBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMzQyxTQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztFQUM1QyxDQUFDLENBQUM7O0FBRUgsSUFBRyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQy9COztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDIuMS4wXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdmdW5jdGlvbicgfHwgKHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNNYXliZVRoZW5hYmxlKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJGVzNiRwcm9taXNlJHV0aWxzJCRfaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheSA9IGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPSAwO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkdG9TdHJpbmcgPSB7fS50b1N0cmluZztcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dDtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcChjYWxsYmFjaywgYXJnKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbl0gPSBjYWxsYmFjaztcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuICs9IDI7XG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9PT0gMikge1xuICAgICAgICAvLyBJZiBsZW4gaXMgMiwgdGhhdCBtZWFucyB0aGF0IHdlIG5lZWQgdG8gc2NoZWR1bGUgYW4gYXN5bmMgZmx1c2guXG4gICAgICAgIC8vIElmIGFkZGl0aW9uYWwgY2FsbGJhY2tzIGFyZSBxdWV1ZWQgYmVmb3JlIHRoZSBxdWV1ZSBpcyBmbHVzaGVkLCB0aGV5XG4gICAgICAgIC8vIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoaXMgZmx1c2ggdGhhdCB3ZSBhcmUgc2NoZWR1bGluZy5cbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2goKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXNhcDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyR2xvYmFsID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgfHwge307XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyR2xvYmFsLk11dGF0aW9uT2JzZXJ2ZXIgfHwgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJHbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGlzTm9kZSA9IHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiB7fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpID09PSAnW29iamVjdCBwcm9jZXNzXSc7XG5cbiAgICAvLyB0ZXN0IGZvciB3ZWIgd29ya2VyIGJ1dCBub3QgaW4gSUUxMFxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIgPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICAgIHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCc7XG5cbiAgICAvLyBub2RlXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgdmFyIG5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICAgIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAgICAgLy8gc2V0SW1tZWRpYXRlIHNob3VsZCBiZSB1c2VkIGluc3RlYWQgaW5zdGVhZFxuICAgICAgdmFyIHZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUubWF0Y2goL14oPzooXFxkKylcXC4pPyg/OihcXGQrKVxcLik/KFxcKnxcXGQrKSQvKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZlcnNpb24pICYmIHZlcnNpb25bMV0gPT09ICcwJyAmJiB2ZXJzaW9uWzJdID09PSAnMTAnKSB7XG4gICAgICAgIG5leHRUaWNrID0gc2V0SW1tZWRpYXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXh0VGljayhsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB2ZXJ0eFxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VWZXJ0eFRpbWVyKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkdmVydHhOZXh0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCkge1xuICAgICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgICAgdmFyIG9ic2VydmVyID0gbmV3IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcihsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgdmFyIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gICAgICBvYnNlcnZlci5vYnNlcnZlKG5vZGUsIHsgY2hhcmFjdGVyRGF0YTogdHJ1ZSB9KTtcblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBub2RlLmRhdGEgPSAoaXRlcmF0aW9ucyA9ICsraXRlcmF0aW9ucyAlIDIpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyB3ZWIgd29ya2VyXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCkge1xuICAgICAgdmFyIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIGNoYW5uZWwucG9ydDEub25tZXNzYWdlID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHNldFRpbWVvdXQobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoLCAxKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2goKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW47IGkrPTIpIHtcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2krMV07XG5cbiAgICAgICAgY2FsbGJhY2soYXJnKTtcblxuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaV0gPSB1bmRlZmluZWQ7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnRleCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciByID0gcmVxdWlyZTtcbiAgICAgICAgdmFyIHZlcnR4ID0gcigndmVydHgnKTtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlU2V0VGltZW91dCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaDtcbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNOb2RlKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJEJyb3dzZXJNdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkaXNXb3JrZXIpIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3NlcldpbmRvdyA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRhdHRlbXB0VmVydGV4KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HICAgPSB2b2lkIDA7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCA9IDE7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxsZmlsbG1lbnQoKSB7XG4gICAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkY2Fubm90UmV0dXJuT3duKCkge1xuICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS4nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRnZXRUaGVuKHByb21pc2UpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW47XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yID0gZXJyb3I7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUsIHRoZW4pIHtcbiAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkZGVmYXVsdChmdW5jdGlvbihwcm9taXNlKSB7XG4gICAgICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVycm9yID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB0aGVuYWJsZSwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRoZW5hYmxlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuXG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0sICdTZXR0bGU6ICcgKyAocHJvbWlzZS5fbGFiZWwgfHwgJyB1bmtub3duIHByb21pc2UnKSk7XG5cbiAgICAgICAgaWYgKCFzZWFsZWQgJiYgZXJyb3IpIHtcbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU93blRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlKSB7XG4gICAgICBpZiAodGhlbmFibGUuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAocHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3Rvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB0aGVuID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihtYXliZVRoZW5hYmxlKTtcblxuICAgICAgICBpZiAodGhlbiA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1IuZXJyb3IpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIG1heWJlVGhlbmFibGUsIHRoZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHNlbGZGdWxsZmlsbG1lbnQoKSk7XG4gICAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSR1dGlscyQkb2JqZWN0T3JGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uKHByb21pc2UpIHtcbiAgICAgIGlmIChwcm9taXNlLl9vbmVycm9yKSB7XG4gICAgICAgIHByb21pc2UuX29uZXJyb3IocHJvbWlzZS5fcmVzdWx0KTtcbiAgICAgIH1cblxuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fc3RhdGUgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQ7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGRlZmF1bHQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaCwgcHJvbWlzZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbikge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuICAgICAgcHJvbWlzZS5fc3RhdGUgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRDtcbiAgICAgIHByb21pc2UuX3Jlc3VsdCA9IHJlYXNvbjtcblxuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGRlZmF1bHQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbiwgcHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHBhcmVudCwgY2hpbGQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKSB7XG4gICAgICB2YXIgc3Vic2NyaWJlcnMgPSBwYXJlbnQuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIGxlbmd0aCA9IHN1YnNjcmliZXJzLmxlbmd0aDtcblxuICAgICAgcGFyZW50Ll9vbmVycm9yID0gbnVsbDtcblxuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoXSA9IGNoaWxkO1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRF0gID0gb25SZWplY3Rpb247XG5cbiAgICAgIGlmIChsZW5ndGggPT09IDAgJiYgcGFyZW50Ll9zdGF0ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkZGVmYXVsdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoLCBwYXJlbnQpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSkge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gICAgICBpZiAoc3Vic2NyaWJlcnMubGVuZ3RoID09PSAwKSB7IHJldHVybjsgfVxuXG4gICAgICB2YXIgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwgPSBwcm9taXNlLl9yZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3Vic2NyaWJlcnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgY2hpbGQgPSBzdWJzY3JpYmVyc1tpXTtcbiAgICAgICAgY2FsbGJhY2sgPSBzdWJzY3JpYmVyc1tpICsgc2V0dGxlZF07XG5cbiAgICAgICAgaWYgKGNoaWxkKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRFcnJvck9iamVjdCgpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IgPSBuZXcgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeUNhdGNoKGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUi5lcnJvciA9IGU7XG4gICAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgcHJvbWlzZSwgY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdmFyIGhhc0NhbGxiYWNrID0gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKGNhbGxiYWNrKSxcbiAgICAgICAgICB2YWx1ZSwgZXJyb3IsIHN1Y2NlZWRlZCwgZmFpbGVkO1xuXG4gICAgICBpZiAoaGFzQ2FsbGJhY2spIHtcbiAgICAgICAgdmFsdWUgPSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFRSWV9DQVRDSF9FUlJPUikge1xuICAgICAgICAgIGZhaWxlZCA9IHRydWU7XG4gICAgICAgICAgZXJyb3IgPSB2YWx1ZS5lcnJvcjtcbiAgICAgICAgICB2YWx1ZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwcm9taXNlID09PSB2YWx1ZSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRjYW5ub3RSZXR1cm5Pd24oKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlID0gZGV0YWlsO1xuICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAocHJvbWlzZS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgLy8gbm9vcFxuICAgICAgfSBlbHNlIGlmIChoYXNDYWxsYmFjayAmJiBzdWNjZWVkZWQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc29sdmVyKGZ1bmN0aW9uIHJlc29sdmVQcm9taXNlKHZhbHVlKXtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICBlbnVtZXJhdG9yLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgICBlbnVtZXJhdG9yLnByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmIChlbnVtZXJhdG9yLl92YWxpZGF0ZUlucHV0KGlucHV0KSkge1xuICAgICAgICBlbnVtZXJhdG9yLl9pbnB1dCAgICAgPSBpbnB1dDtcbiAgICAgICAgZW51bWVyYXRvci5sZW5ndGggICAgID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICBlbnVtZXJhdG9yLl9yZW1haW5pbmcgPSBpbnB1dC5sZW5ndGg7XG5cbiAgICAgICAgZW51bWVyYXRvci5faW5pdCgpO1xuXG4gICAgICAgIGlmIChlbnVtZXJhdG9yLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudW1lcmF0b3IubGVuZ3RoID0gZW51bWVyYXRvci5sZW5ndGggfHwgMDtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAoZW51bWVyYXRvci5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fcmVzdWx0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3ZhbGlkYXRpb25FcnJvcigpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheShpbnB1dCk7XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXknKTtcbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvcjtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIHZhciBsZW5ndGggID0gZW51bWVyYXRvci5sZW5ndGg7XG4gICAgICB2YXIgcHJvbWlzZSA9IGVudW1lcmF0b3IucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgID0gZW51bWVyYXRvci5faW5wdXQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZW51bWVyYXRvci5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbihlbnRyeSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuICAgICAgdmFyIGMgPSBlbnVtZXJhdG9yLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc01heWJlVGhlbmFibGUoZW50cnkpKSB7XG4gICAgICAgIGlmIChlbnRyeS5jb25zdHJ1Y3RvciA9PT0gYyAmJiBlbnRyeS5fc3RhdGUgIT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcpIHtcbiAgICAgICAgICBlbnRyeS5fb25lcnJvciA9IG51bGw7XG4gICAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGVudHJ5Ll9zdGF0ZSwgaSwgZW50cnkuX3Jlc3VsdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZW51bWVyYXRvci5fd2lsbFNldHRsZUF0KGMucmVzb2x2ZShlbnRyeSksIGkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlbnVtZXJhdG9yLl9yZW1haW5pbmctLTtcbiAgICAgICAgZW51bWVyYXRvci5fcmVzdWx0W2ldID0gZW50cnk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24oc3RhdGUsIGksIHZhbHVlKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSA9IGVudW1lcmF0b3IucHJvbWlzZTtcblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZy0tO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudW1lcmF0b3IuX3Jlc3VsdFtpXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChlbnVtZXJhdG9yLl9yZW1haW5pbmcgPT09IDApIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCBlbnVtZXJhdG9yLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uKHByb21pc2UsIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKHByb21pc2UsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgZW51bWVyYXRvci5fc2V0dGxlZEF0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCwgaSwgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRhbGwoZW50cmllcykge1xuICAgICAgcmV0dXJuIG5ldyBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkZGVmYXVsdCh0aGlzLCBlbnRyaWVzKS5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRhbGw7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZShlbnRyaWVzKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG5cbiAgICAgIGlmICghbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuJykpO1xuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxlbmd0aCA9IGVudHJpZXMubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxtZW50KHZhbHVlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGlvbihyZWFzb24pIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkc3Vic2NyaWJlKENvbnN0cnVjdG9yLnJlc29sdmUoZW50cmllc1tpXSksIHVuZGVmaW5lZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRyYWNlO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmUob2JqZWN0KSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcblxuICAgICAgaWYgKG9iamVjdCAmJiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QuY29uc3RydWN0b3IgPT09IENvbnN0cnVjdG9yKSB7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkcmVzb2x2ZTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZWplY3QkJHJlamVjdChyZWFzb24pIHtcbiAgICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgICB2YXIgQ29uc3RydWN0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgQ29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRyZWplY3Q7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGNvdW50ZXIgPSAwO1xuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzTmV3KCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZTtcbiAgICAvKipcbiAgICAgIFByb21pc2Ugb2JqZWN0cyByZXByZXNlbnQgdGhlIGV2ZW50dWFsIHJlc3VsdCBvZiBhbiBhc3luY2hyb25vdXMgb3BlcmF0aW9uLiBUaGVcbiAgICAgIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsIHdoaWNoXG4gICAgICByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZeKAmXMgZXZlbnR1YWwgdmFsdWUgb3IgdGhlIHJlYXNvblxuICAgICAgd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIFRlcm1pbm9sb2d5XG4gICAgICAtLS0tLS0tLS0tLVxuXG4gICAgICAtIGBwcm9taXNlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gd2l0aCBhIGB0aGVuYCBtZXRob2Qgd2hvc2UgYmVoYXZpb3IgY29uZm9ybXMgdG8gdGhpcyBzcGVjaWZpY2F0aW9uLlxuICAgICAgLSBgdGhlbmFibGVgIGlzIGFuIG9iamVjdCBvciBmdW5jdGlvbiB0aGF0IGRlZmluZXMgYSBgdGhlbmAgbWV0aG9kLlxuICAgICAgLSBgdmFsdWVgIGlzIGFueSBsZWdhbCBKYXZhU2NyaXB0IHZhbHVlIChpbmNsdWRpbmcgdW5kZWZpbmVkLCBhIHRoZW5hYmxlLCBvciBhIHByb21pc2UpLlxuICAgICAgLSBgZXhjZXB0aW9uYCBpcyBhIHZhbHVlIHRoYXQgaXMgdGhyb3duIHVzaW5nIHRoZSB0aHJvdyBzdGF0ZW1lbnQuXG4gICAgICAtIGByZWFzb25gIGlzIGEgdmFsdWUgdGhhdCBpbmRpY2F0ZXMgd2h5IGEgcHJvbWlzZSB3YXMgcmVqZWN0ZWQuXG4gICAgICAtIGBzZXR0bGVkYCB0aGUgZmluYWwgcmVzdGluZyBzdGF0ZSBvZiBhIHByb21pc2UsIGZ1bGZpbGxlZCBvciByZWplY3RlZC5cblxuICAgICAgQSBwcm9taXNlIGNhbiBiZSBpbiBvbmUgb2YgdGhyZWUgc3RhdGVzOiBwZW5kaW5nLCBmdWxmaWxsZWQsIG9yIHJlamVjdGVkLlxuXG4gICAgICBQcm9taXNlcyB0aGF0IGFyZSBmdWxmaWxsZWQgaGF2ZSBhIGZ1bGZpbGxtZW50IHZhbHVlIGFuZCBhcmUgaW4gdGhlIGZ1bGZpbGxlZFxuICAgICAgc3RhdGUuICBQcm9taXNlcyB0aGF0IGFyZSByZWplY3RlZCBoYXZlIGEgcmVqZWN0aW9uIHJlYXNvbiBhbmQgYXJlIGluIHRoZVxuICAgICAgcmVqZWN0ZWQgc3RhdGUuICBBIGZ1bGZpbGxtZW50IHZhbHVlIGlzIG5ldmVyIGEgdGhlbmFibGUuXG5cbiAgICAgIFByb21pc2VzIGNhbiBhbHNvIGJlIHNhaWQgdG8gKnJlc29sdmUqIGEgdmFsdWUuICBJZiB0aGlzIHZhbHVlIGlzIGFsc28gYVxuICAgICAgcHJvbWlzZSwgdGhlbiB0aGUgb3JpZ2luYWwgcHJvbWlzZSdzIHNldHRsZWQgc3RhdGUgd2lsbCBtYXRjaCB0aGUgdmFsdWUnc1xuICAgICAgc2V0dGxlZCBzdGF0ZS4gIFNvIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgcmVqZWN0cyB3aWxsXG4gICAgICBpdHNlbGYgcmVqZWN0LCBhbmQgYSBwcm9taXNlIHRoYXQgKnJlc29sdmVzKiBhIHByb21pc2UgdGhhdCBmdWxmaWxscyB3aWxsXG4gICAgICBpdHNlbGYgZnVsZmlsbC5cblxuXG4gICAgICBCYXNpYyBVc2FnZTpcbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBgYGBqc1xuICAgICAgdmFyIHByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgLy8gb24gc3VjY2Vzc1xuICAgICAgICByZXNvbHZlKHZhbHVlKTtcblxuICAgICAgICAvLyBvbiBmYWlsdXJlXG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfSk7XG5cbiAgICAgIHByb21pc2UudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS0tLS1cblxuICAgICAgUHJvbWlzZXMgc2hpbmUgd2hlbiBhYnN0cmFjdGluZyBhd2F5IGFzeW5jaHJvbm91cyBpbnRlcmFjdGlvbnMgc3VjaCBhc1xuICAgICAgYFhNTEh0dHBSZXF1ZXN0YHMuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICAgICAgICB4aHIub3BlbignR0VUJywgdXJsKTtcbiAgICAgICAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gaGFuZGxlcjtcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2pzb24nO1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgIHhoci5zZW5kKCk7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSA9PT0gdGhpcy5ET05FKSB7XG4gICAgICAgICAgICAgIGlmICh0aGlzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0aGlzLnJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdnZXRKU09OOiBgJyArIHVybCArICdgIGZhaWxlZCB3aXRoIHN0YXR1czogWycgKyB0aGlzLnN0YXR1cyArICddJykpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGdldEpTT04oJy9wb3N0cy5qc29uJykudGhlbihmdW5jdGlvbihqc29uKSB7XG4gICAgICAgIC8vIG9uIGZ1bGZpbGxtZW50XG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgLy8gb24gcmVqZWN0aW9uXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBVbmxpa2UgY2FsbGJhY2tzLCBwcm9taXNlcyBhcmUgZ3JlYXQgY29tcG9zYWJsZSBwcmltaXRpdmVzLlxuXG4gICAgICBgYGBqc1xuICAgICAgUHJvbWlzZS5hbGwoW1xuICAgICAgICBnZXRKU09OKCcvcG9zdHMnKSxcbiAgICAgICAgZ2V0SlNPTignL2NvbW1lbnRzJylcbiAgICAgIF0pLnRoZW4oZnVuY3Rpb24odmFsdWVzKXtcbiAgICAgICAgdmFsdWVzWzBdIC8vID0+IHBvc3RzSlNPTlxuICAgICAgICB2YWx1ZXNbMV0gLy8gPT4gY29tbWVudHNKU09OXG5cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBjbGFzcyBQcm9taXNlXG4gICAgICBAcGFyYW0ge2Z1bmN0aW9ufSByZXNvbHZlclxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQGNvbnN0cnVjdG9yXG4gICAgKi9cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZShyZXNvbHZlcikge1xuICAgICAgdGhpcy5faWQgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkY291bnRlcisrO1xuICAgICAgdGhpcy5fc3RhdGUgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9zdWJzY3JpYmVycyA9IFtdO1xuXG4gICAgICBpZiAobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCAhPT0gcmVzb2x2ZXIpIHtcbiAgICAgICAgaWYgKCFsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzRnVuY3Rpb24ocmVzb2x2ZXIpKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSkpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHRoaXMsIHJlc29sdmVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZS5hbGwgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmFjZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQ7XG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucmVqZWN0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UucHJvdG90eXBlID0ge1xuICAgICAgY29uc3RydWN0b3I6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLFxuXG4gICAgLyoqXG4gICAgICBUaGUgcHJpbWFyeSB3YXkgb2YgaW50ZXJhY3Rpbmcgd2l0aCBhIHByb21pc2UgaXMgdGhyb3VnaCBpdHMgYHRoZW5gIG1ldGhvZCxcbiAgICAgIHdoaWNoIHJlZ2lzdGVycyBjYWxsYmFja3MgdG8gcmVjZWl2ZSBlaXRoZXIgYSBwcm9taXNlJ3MgZXZlbnR1YWwgdmFsdWUgb3IgdGhlXG4gICAgICByZWFzb24gd2h5IHRoZSBwcm9taXNlIGNhbm5vdCBiZSBmdWxmaWxsZWQuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgIC8vIHVzZXIgaXMgYXZhaWxhYmxlXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyB1c2VyIGlzIHVuYXZhaWxhYmxlLCBhbmQgeW91IGFyZSBnaXZlbiB0aGUgcmVhc29uIHdoeVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQ2hhaW5pbmdcbiAgICAgIC0tLS0tLS0tXG5cbiAgICAgIFRoZSByZXR1cm4gdmFsdWUgb2YgYHRoZW5gIGlzIGl0c2VsZiBhIHByb21pc2UuICBUaGlzIHNlY29uZCwgJ2Rvd25zdHJlYW0nXG4gICAgICBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZmlyc3QgcHJvbWlzZSdzIGZ1bGZpbGxtZW50XG4gICAgICBvciByZWplY3Rpb24gaGFuZGxlciwgb3IgcmVqZWN0ZWQgaWYgdGhlIGhhbmRsZXIgdGhyb3dzIGFuIGV4Y2VwdGlvbi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gdXNlci5uYW1lO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICByZXR1cm4gJ2RlZmF1bHQgbmFtZSc7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh1c2VyTmFtZSkge1xuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHVzZXJOYW1lYCB3aWxsIGJlIHRoZSB1c2VyJ3MgbmFtZSwgb3RoZXJ3aXNlIGl0XG4gICAgICAgIC8vIHdpbGwgYmUgYCdkZWZhdWx0IG5hbWUnYFxuICAgICAgfSk7XG5cbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jyk7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBpZiBgZmluZFVzZXJgIGZ1bGZpbGxlZCwgYHJlYXNvbmAgd2lsbCBiZSAnRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknLlxuICAgICAgICAvLyBJZiBgZmluZFVzZXJgIHJlamVjdGVkLCBgcmVhc29uYCB3aWxsIGJlICdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jy5cbiAgICAgIH0pO1xuICAgICAgYGBgXG4gICAgICBJZiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIGRvZXMgbm90IHNwZWNpZnkgYSByZWplY3Rpb24gaGFuZGxlciwgcmVqZWN0aW9uIHJlYXNvbnMgd2lsbCBiZSBwcm9wYWdhdGVkIGZ1cnRoZXIgZG93bnN0cmVhbS5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICB0aHJvdyBuZXcgUGVkYWdvZ2ljYWxFeGNlcHRpb24oJ1Vwc3RyZWFtIGVycm9yJyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIFRoZSBgUGVkZ2Fnb2NpYWxFeGNlcHRpb25gIGlzIHByb3BhZ2F0ZWQgYWxsIHRoZSB3YXkgZG93biB0byBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBc3NpbWlsYXRpb25cbiAgICAgIC0tLS0tLS0tLS0tLVxuXG4gICAgICBTb21ldGltZXMgdGhlIHZhbHVlIHlvdSB3YW50IHRvIHByb3BhZ2F0ZSB0byBhIGRvd25zdHJlYW0gcHJvbWlzZSBjYW4gb25seSBiZVxuICAgICAgcmV0cmlldmVkIGFzeW5jaHJvbm91c2x5LiBUaGlzIGNhbiBiZSBhY2hpZXZlZCBieSByZXR1cm5pbmcgYSBwcm9taXNlIGluIHRoZVxuICAgICAgZnVsZmlsbG1lbnQgb3IgcmVqZWN0aW9uIGhhbmRsZXIuIFRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCB0aGVuIGJlIHBlbmRpbmdcbiAgICAgIHVudGlsIHRoZSByZXR1cm5lZCBwcm9taXNlIGlzIHNldHRsZWQuIFRoaXMgaXMgY2FsbGVkICphc3NpbWlsYXRpb24qLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIFRoZSB1c2VyJ3MgY29tbWVudHMgYXJlIG5vdyBhdmFpbGFibGVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIElmIHRoZSBhc3NpbWxpYXRlZCBwcm9taXNlIHJlamVjdHMsIHRoZW4gdGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIGFsc28gcmVqZWN0LlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiBmaW5kQ29tbWVudHNCeUF1dGhvcih1c2VyKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGNvbW1lbnRzKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgZnVsZmlsbHMsIHdlJ2xsIGhhdmUgdGhlIHZhbHVlIGhlcmVcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCByZWplY3RzLCB3ZSdsbCBoYXZlIHRoZSByZWFzb24gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgU2ltcGxlIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gZmluZFJlc3VsdCgpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kUmVzdWx0KGZ1bmN0aW9uKHJlc3VsdCwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZFJlc3VsdCgpLnRoZW4oZnVuY3Rpb24ocmVzdWx0KXtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQWR2YW5jZWQgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgYXV0aG9yLCBib29rcztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYXV0aG9yID0gZmluZEF1dGhvcigpO1xuICAgICAgICBib29rcyAgPSBmaW5kQm9va3NCeUF1dGhvcihhdXRob3IpO1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9XG4gICAgICBgYGBcblxuICAgICAgRXJyYmFjayBFeGFtcGxlXG5cbiAgICAgIGBgYGpzXG5cbiAgICAgIGZ1bmN0aW9uIGZvdW5kQm9va3MoYm9va3MpIHtcblxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBmYWlsdXJlKHJlYXNvbikge1xuXG4gICAgICB9XG5cbiAgICAgIGZpbmRBdXRob3IoZnVuY3Rpb24oYXV0aG9yLCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIC8vIGZhaWx1cmVcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgZmluZEJvb29rc0J5QXV0aG9yKGF1dGhvciwgZnVuY3Rpb24oYm9va3MsIGVycikge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICBmb3VuZEJvb2tzKGJvb2tzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgZmFpbHVyZShyZWFzb24pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICAgICAgZmFpbHVyZShlcnIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBzdWNjZXNzXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFByb21pc2UgRXhhbXBsZTtcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgZmluZEF1dGhvcigpLlxuICAgICAgICB0aGVuKGZpbmRCb29rc0J5QXV0aG9yKS5cbiAgICAgICAgdGhlbihmdW5jdGlvbihib29rcyl7XG4gICAgICAgICAgLy8gZm91bmQgYm9va3NcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAbWV0aG9kIHRoZW5cbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uRnVsZmlsbGVkXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvblJlamVjdGVkXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICB0aGVuOiBmdW5jdGlvbihvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICAgICAgdmFyIHN0YXRlID0gcGFyZW50Ll9zdGF0ZTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRCAmJiAhb25GdWxmaWxsbWVudCB8fCBzdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQgJiYgIW9uUmVqZWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2hpbGQgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgICAgdmFyIHJlc3VsdCA9IHBhcmVudC5fcmVzdWx0O1xuXG4gICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1tzdGF0ZSAtIDFdO1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRkZWZhdWx0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzdGF0ZSwgY2hpbGQsIGNhbGxiYWNrLCByZXN1bHQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICB9LFxuXG4gICAgLyoqXG4gICAgICBgY2F0Y2hgIGlzIHNpbXBseSBzdWdhciBmb3IgYHRoZW4odW5kZWZpbmVkLCBvblJlamVjdGlvbilgIHdoaWNoIG1ha2VzIGl0IHRoZSBzYW1lXG4gICAgICBhcyB0aGUgY2F0Y2ggYmxvY2sgb2YgYSB0cnkvY2F0Y2ggc3RhdGVtZW50LlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZmluZEF1dGhvcigpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkbid0IGZpbmQgdGhhdCBhdXRob3InKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3luY2hyb25vdXNcbiAgICAgIHRyeSB7XG4gICAgICAgIGZpbmRBdXRob3IoKTtcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nXG4gICAgICB9XG5cbiAgICAgIC8vIGFzeW5jIHdpdGggcHJvbWlzZXNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCBjYXRjaFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbCgpIHtcbiAgICAgIHZhciBsb2NhbDtcblxuICAgICAgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbG9jYWwgPSBnbG9iYWw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgbG9jYWwgPSBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnQnKTtcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBQID0gbG9jYWwuUHJvbWlzZTtcblxuICAgICAgaWYgKFAgJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKFAucmVzb2x2ZSgpKSA9PT0gJ1tvYmplY3QgUHJvbWlzZV0nICYmICFQLmNhc3QpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsb2NhbC5Qcm9taXNlID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGRlZmF1bHQ7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJGRlZmF1bHQgPSBsaWIkZXM2JHByb21pc2UkcG9seWZpbGwkJHBvbHlmaWxsO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2UgPSB7XG4gICAgICAnUHJvbWlzZSc6IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ3BvbHlmaWxsJzogbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0XG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkZWZpbmU6dHJ1ZSBtb2R1bGU6dHJ1ZSB3aW5kb3c6IHRydWUgKi9cbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmVbJ2FtZCddKSB7XG4gICAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlOyB9KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZVsnZXhwb3J0cyddKSB7XG4gICAgICBtb2R1bGVbJ2V4cG9ydHMnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRoaXNbJ0VTNlByb21pc2UnXSA9IGxpYiRlczYkcHJvbWlzZSR1bWQkJEVTNlByb21pc2U7XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0KCk7XG59KS5jYWxsKHRoaXMpO1xuXG4iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IG5hbWUudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBzZWxmLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBzZWxmLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgLy8gSW5zdGVhZCBvZiBpdGVyYWJsZSBmb3Igbm93LlxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICBjYWxsYmFjayhuYW1lLCBzZWxmLm1hcFtuYW1lXSlcbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgWERvbWFpblJlcXVlc3Q6ICdYRG9tYWluUmVxdWVzdCcgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KHVybCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdGhpcy51cmwgPSB1cmxcblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBvcHRpb25zLmJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkob3B0aW9ucy5ib2R5KVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgbGVnYWN5Q29ycyA9IGZhbHNlO1xuICAgICAgaWYgKHN1cHBvcnQuWERvbWFpblJlcXVlc3QpIHtcbiAgICAgICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3Q7XG4gICAgICAgIGlmICghL15cXC9bXlxcL10vLnRlc3Qoc2VsZi51cmwpKSB7IC8vIGV4Y2x1ZGUgcmVsYXRpdmUgdXJsc1xuICAgICAgICAgIGxlZ2FjeUNvcnMgPSAoL15cXC9cXC8vLnRlc3Qoc2VsZi51cmwpID8gbG9jYXRpb24ucHJvdG9jb2wgKyBzZWxmLnVybCA6IHNlbGYudXJsKS5zdWJzdHJpbmcoMCwgb3JpZ2luLmxlbmd0aCkgIT09IG9yaWdpbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdmFyIHhociA9IGxlZ2FjeUNvcnMgPyBuZXcgWERvbWFpblJlcXVlc3QoKSA6IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGlmIChsZWdhY3lDb3JzKSB7XG4gICAgICAgIHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJ0NvbnRlbnQtVHlwZTogJyt4aHIuY29udGVudFR5cGU7XG4gICAgICAgIH07XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuY3JlZGVudGlhbHMgPT09ICdjb3JzJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG5cbiAgICAgICAgLy8gSWYgWERvbWFpblJlcXVlc3QgdGhlcmUgaXMgbm8gc3RhdHVzIGNvZGUgc28ganVzdCBob3BlIGZvciB0aGUgYmVzdC4uLlxuICAgICAgICBpZiAobGVnYWN5Q29ycykge1xuICAgICAgICAgIHN0YXR1cyA9IDIwMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhdHVzIDwgMTAwIHx8IHN0YXR1cyA+IDU5OSkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4oc2VsZi5tZXRob2QsIHNlbGYudXJsLCB0cnVlKVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHNlbGYuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUsIHZhbHVlcykge1xuICAgICAgICB2YWx1ZXMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgICB9KVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHNlbGYuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBzZWxmLl9ib2R5SW5pdClcbiAgICB9KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnVybCA9IG51bGxcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVyc1xuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbiAodXJsLCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHVybCwgb3B0aW9ucykuZmV0Y2goKVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSgpO1xuIiwiLypqc2hpbnQgYnJvd3Nlcjp0cnVlLCBub2RlOnRydWUqL1xuXG4ndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gRGVsZWdhdGU7XG5cbi8qKlxuICogRE9NIGV2ZW50IGRlbGVnYXRvclxuICpcbiAqIFRoZSBkZWxlZ2F0b3Igd2lsbCBsaXN0ZW5cbiAqIGZvciBldmVudHMgdGhhdCBidWJibGUgdXBcbiAqIHRvIHRoZSByb290IG5vZGUuXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge05vZGV8c3RyaW5nfSBbcm9vdF0gVGhlIHJvb3Qgbm9kZSBvciBhIHNlbGVjdG9yIHN0cmluZyBtYXRjaGluZyB0aGUgcm9vdCBub2RlXG4gKi9cbmZ1bmN0aW9uIERlbGVnYXRlKHJvb3QpIHtcblxuICAvKipcbiAgICogTWFpbnRhaW4gYSBtYXAgb2YgbGlzdGVuZXJcbiAgICogbGlzdHMsIGtleWVkIGJ5IGV2ZW50IG5hbWUuXG4gICAqXG4gICAqIEB0eXBlIE9iamVjdFxuICAgKi9cbiAgdGhpcy5saXN0ZW5lck1hcCA9IFt7fSwge31dO1xuICBpZiAocm9vdCkge1xuICAgIHRoaXMucm9vdChyb290KTtcbiAgfVxuXG4gIC8qKiBAdHlwZSBmdW5jdGlvbigpICovXG4gIHRoaXMuaGFuZGxlID0gRGVsZWdhdGUucHJvdG90eXBlLmhhbmRsZS5iaW5kKHRoaXMpO1xufVxuXG4vKipcbiAqIFN0YXJ0IGxpc3RlbmluZyBmb3IgZXZlbnRzXG4gKiBvbiB0aGUgcHJvdmlkZWQgRE9NIGVsZW1lbnRcbiAqXG4gKiBAcGFyYW0gIHtOb2RlfHN0cmluZ30gW3Jvb3RdIFRoZSByb290IG5vZGUgb3IgYSBzZWxlY3RvciBzdHJpbmcgbWF0Y2hpbmcgdGhlIHJvb3Qgbm9kZVxuICogQHJldHVybnMge0RlbGVnYXRlfSBUaGlzIG1ldGhvZCBpcyBjaGFpbmFibGVcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLnJvb3QgPSBmdW5jdGlvbihyb290KSB7XG4gIHZhciBsaXN0ZW5lck1hcCA9IHRoaXMubGlzdGVuZXJNYXA7XG4gIHZhciBldmVudFR5cGU7XG5cbiAgLy8gUmVtb3ZlIG1hc3RlciBldmVudCBsaXN0ZW5lcnNcbiAgaWYgKHRoaXMucm9vdEVsZW1lbnQpIHtcbiAgICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFsxXSkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwWzFdLmhhc093blByb3BlcnR5KGV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFswXSkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwWzBdLmhhc093blByb3BlcnR5KGV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBJZiBubyByb290IG9yIHJvb3QgaXMgbm90XG4gIC8vIGEgZG9tIG5vZGUsIHRoZW4gcmVtb3ZlIGludGVybmFsXG4gIC8vIHJvb3QgcmVmZXJlbmNlIGFuZCBleGl0IGhlcmVcbiAgaWYgKCFyb290IHx8ICFyb290LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICBpZiAodGhpcy5yb290RWxlbWVudCkge1xuICAgICAgZGVsZXRlIHRoaXMucm9vdEVsZW1lbnQ7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoZSByb290IG5vZGUgYXQgd2hpY2hcbiAgICogbGlzdGVuZXJzIGFyZSBhdHRhY2hlZC5cbiAgICpcbiAgICogQHR5cGUgTm9kZVxuICAgKi9cbiAgdGhpcy5yb290RWxlbWVudCA9IHJvb3Q7XG5cbiAgLy8gU2V0IHVwIG1hc3RlciBldmVudCBsaXN0ZW5lcnNcbiAgZm9yIChldmVudFR5cGUgaW4gbGlzdGVuZXJNYXBbMV0pIHtcbiAgICBpZiAobGlzdGVuZXJNYXBbMV0uaGFzT3duUHJvcGVydHkoZXZlbnRUeXBlKSkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHRydWUpO1xuICAgIH1cbiAgfVxuICBmb3IgKGV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcFswXSkge1xuICAgIGlmIChsaXN0ZW5lck1hcFswXS5oYXNPd25Qcm9wZXJ0eShldmVudFR5cGUpKSB7XG4gICAgICB0aGlzLnJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCB0aGlzLmhhbmRsZSwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5jYXB0dXJlRm9yVHlwZSA9IGZ1bmN0aW9uKGV2ZW50VHlwZSkge1xuICByZXR1cm4gWydibHVyJywgJ2Vycm9yJywgJ2ZvY3VzJywgJ2xvYWQnLCAncmVzaXplJywgJ3Njcm9sbCddLmluZGV4T2YoZXZlbnRUeXBlKSAhPT0gLTE7XG59O1xuXG4vKipcbiAqIEF0dGFjaCBhIGhhbmRsZXIgdG8gb25lXG4gKiBldmVudCBmb3IgYWxsIGVsZW1lbnRzXG4gKiB0aGF0IG1hdGNoIHRoZSBzZWxlY3RvcixcbiAqIG5vdyBvciBpbiB0aGUgZnV0dXJlXG4gKlxuICogVGhlIGhhbmRsZXIgZnVuY3Rpb24gcmVjZWl2ZXNcbiAqIHRocmVlIGFyZ3VtZW50czogdGhlIERPTSBldmVudFxuICogb2JqZWN0LCB0aGUgbm9kZSB0aGF0IG1hdGNoZWRcbiAqIHRoZSBzZWxlY3RvciB3aGlsZSB0aGUgZXZlbnRcbiAqIHdhcyBidWJibGluZyBhbmQgYSByZWZlcmVuY2VcbiAqIHRvIGl0c2VsZi4gV2l0aGluIHRoZSBoYW5kbGVyLFxuICogJ3RoaXMnIGlzIGVxdWFsIHRvIHRoZSBzZWNvbmRcbiAqIGFyZ3VtZW50LlxuICpcbiAqIFRoZSBub2RlIHRoYXQgYWN0dWFsbHkgcmVjZWl2ZWRcbiAqIHRoZSBldmVudCBjYW4gYmUgYWNjZXNzZWQgdmlhXG4gKiAnZXZlbnQudGFyZ2V0Jy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRUeXBlIExpc3RlbiBmb3IgdGhlc2UgZXZlbnRzXG4gKiBAcGFyYW0ge3N0cmluZ3x1bmRlZmluZWR9IHNlbGVjdG9yIE9ubHkgaGFuZGxlIGV2ZW50cyBvbiBlbGVtZW50cyBtYXRjaGluZyB0aGlzIHNlbGVjdG9yLCBpZiB1bmRlZmluZWQgbWF0Y2ggcm9vdCBlbGVtZW50XG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCl9IGhhbmRsZXIgSGFuZGxlciBmdW5jdGlvbiAtIGV2ZW50IGRhdGEgcGFzc2VkIGhlcmUgd2lsbCBiZSBpbiBldmVudC5kYXRhXG4gKiBAcGFyYW0ge09iamVjdH0gW2V2ZW50RGF0YV0gRGF0YSB0byBwYXNzIGluIGV2ZW50LmRhdGFcbiAqIEByZXR1cm5zIHtEZWxlZ2F0ZX0gVGhpcyBtZXRob2QgaXMgY2hhaW5hYmxlXG4gKi9cbkRlbGVnYXRlLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgdmFyIHJvb3QsIGxpc3RlbmVyTWFwLCBtYXRjaGVyLCBtYXRjaGVyUGFyYW07XG5cbiAgaWYgKCFldmVudFR5cGUpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICB9XG5cbiAgLy8gaGFuZGxlciBjYW4gYmUgcGFzc2VkIGFzXG4gIC8vIHRoZSBzZWNvbmQgb3IgdGhpcmQgYXJndW1lbnRcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHVzZUNhcHR1cmUgPSBoYW5kbGVyO1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICAvLyBGYWxsYmFjayB0byBzZW5zaWJsZSBkZWZhdWx0c1xuICAvLyBpZiB1c2VDYXB0dXJlIG5vdCBzZXRcbiAgaWYgKHVzZUNhcHR1cmUgPT09IHVuZGVmaW5lZCkge1xuICAgIHVzZUNhcHR1cmUgPSB0aGlzLmNhcHR1cmVGb3JUeXBlKGV2ZW50VHlwZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIYW5kbGVyIG11c3QgYmUgYSB0eXBlIG9mIEZ1bmN0aW9uJyk7XG4gIH1cblxuICByb290ID0gdGhpcy5yb290RWxlbWVudDtcbiAgbGlzdGVuZXJNYXAgPSB0aGlzLmxpc3RlbmVyTWFwW3VzZUNhcHR1cmUgPyAxIDogMF07XG5cbiAgLy8gQWRkIG1hc3RlciBoYW5kbGVyIGZvciB0eXBlIGlmIG5vdCBjcmVhdGVkIHlldFxuICBpZiAoIWxpc3RlbmVyTWFwW2V2ZW50VHlwZV0pIHtcbiAgICBpZiAocm9vdCkge1xuICAgICAgcm9vdC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHVzZUNhcHR1cmUpO1xuICAgIH1cbiAgICBsaXN0ZW5lck1hcFtldmVudFR5cGVdID0gW107XG4gIH1cblxuICBpZiAoIXNlbGVjdG9yKSB7XG4gICAgbWF0Y2hlclBhcmFtID0gbnVsbDtcblxuICAgIC8vIENPTVBMRVggLSBtYXRjaGVzUm9vdCBuZWVkcyB0byBoYXZlIGFjY2VzcyB0b1xuICAgIC8vIHRoaXMucm9vdEVsZW1lbnQsIHNvIGJpbmQgdGhlIGZ1bmN0aW9uIHRvIHRoaXMuXG4gICAgbWF0Y2hlciA9IG1hdGNoZXNSb290LmJpbmQodGhpcyk7XG5cbiAgLy8gQ29tcGlsZSBhIG1hdGNoZXIgZm9yIHRoZSBnaXZlbiBzZWxlY3RvclxuICB9IGVsc2UgaWYgKC9eW2Etel0rJC9pLnRlc3Qoc2VsZWN0b3IpKSB7XG4gICAgbWF0Y2hlclBhcmFtID0gc2VsZWN0b3I7XG4gICAgbWF0Y2hlciA9IG1hdGNoZXNUYWc7XG4gIH0gZWxzZSBpZiAoL14jW2EtejAtOVxcLV9dKyQvaS50ZXN0KHNlbGVjdG9yKSkge1xuICAgIG1hdGNoZXJQYXJhbSA9IHNlbGVjdG9yLnNsaWNlKDEpO1xuICAgIG1hdGNoZXIgPSBtYXRjaGVzSWQ7XG4gIH0gZWxzZSB7XG4gICAgbWF0Y2hlclBhcmFtID0gc2VsZWN0b3I7XG4gICAgbWF0Y2hlciA9IG1hdGNoZXM7XG4gIH1cblxuICAvLyBBZGQgdG8gdGhlIGxpc3Qgb2YgbGlzdGVuZXJzXG4gIGxpc3RlbmVyTWFwW2V2ZW50VHlwZV0ucHVzaCh7XG4gICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgIGhhbmRsZXI6IGhhbmRsZXIsXG4gICAgbWF0Y2hlcjogbWF0Y2hlcixcbiAgICBtYXRjaGVyUGFyYW06IG1hdGNoZXJQYXJhbVxuICB9KTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV2ZW50IGhhbmRsZXJcbiAqIGZvciBlbGVtZW50cyB0aGF0IG1hdGNoXG4gKiB0aGUgc2VsZWN0b3IsIGZvcmV2ZXJcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gW2V2ZW50VHlwZV0gUmVtb3ZlIGhhbmRsZXJzIGZvciBldmVudHMgbWF0Y2hpbmcgdGhpcyB0eXBlLCBjb25zaWRlcmluZyB0aGUgb3RoZXIgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtzdHJpbmd9IFtzZWxlY3Rvcl0gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgb25seSBoYW5kbGVycyB3aGljaCBtYXRjaCB0aGUgb3RoZXIgdHdvIHdpbGwgYmUgcmVtb3ZlZFxuICogQHBhcmFtIHtmdW5jdGlvbigpfSBbaGFuZGxlcl0gSWYgdGhpcyBwYXJhbWV0ZXIgaXMgb21pdHRlZCwgb25seSBoYW5kbGVycyB3aGljaCBtYXRjaCB0aGUgcHJldmlvdXMgdHdvIHdpbGwgYmUgcmVtb3ZlZFxuICogQHJldHVybnMge0RlbGVnYXRlfSBUaGlzIG1ldGhvZCBpcyBjaGFpbmFibGVcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKGV2ZW50VHlwZSwgc2VsZWN0b3IsIGhhbmRsZXIsIHVzZUNhcHR1cmUpIHtcbiAgdmFyIGksIGxpc3RlbmVyLCBsaXN0ZW5lck1hcCwgbGlzdGVuZXJMaXN0LCBzaW5nbGVFdmVudFR5cGU7XG5cbiAgLy8gSGFuZGxlciBjYW4gYmUgcGFzc2VkIGFzXG4gIC8vIHRoZSBzZWNvbmQgb3IgdGhpcmQgYXJndW1lbnRcbiAgaWYgKHR5cGVvZiBzZWxlY3RvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHVzZUNhcHR1cmUgPSBoYW5kbGVyO1xuICAgIGhhbmRsZXIgPSBzZWxlY3RvcjtcbiAgICBzZWxlY3RvciA9IG51bGw7XG4gIH1cblxuICAvLyBJZiB1c2VDYXB0dXJlIG5vdCBzZXQsIHJlbW92ZVxuICAvLyBhbGwgZXZlbnQgbGlzdGVuZXJzXG4gIGlmICh1c2VDYXB0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzLm9mZihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCB0cnVlKTtcbiAgICB0aGlzLm9mZihldmVudFR5cGUsIHNlbGVjdG9yLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lck1hcCA9IHRoaXMubGlzdGVuZXJNYXBbdXNlQ2FwdHVyZSA/IDEgOiAwXTtcbiAgaWYgKCFldmVudFR5cGUpIHtcbiAgICBmb3IgKHNpbmdsZUV2ZW50VHlwZSBpbiBsaXN0ZW5lck1hcCkge1xuICAgICAgaWYgKGxpc3RlbmVyTWFwLmhhc093blByb3BlcnR5KHNpbmdsZUV2ZW50VHlwZSkpIHtcbiAgICAgICAgdGhpcy5vZmYoc2luZ2xlRXZlbnRUeXBlLCBzZWxlY3RvciwgaGFuZGxlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lckxpc3QgPSBsaXN0ZW5lck1hcFtldmVudFR5cGVdO1xuICBpZiAoIWxpc3RlbmVyTGlzdCB8fCAhbGlzdGVuZXJMaXN0Lmxlbmd0aCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gUmVtb3ZlIG9ubHkgcGFyYW1ldGVyIG1hdGNoZXNcbiAgLy8gaWYgc3BlY2lmaWVkXG4gIGZvciAoaSA9IGxpc3RlbmVyTGlzdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGxpc3RlbmVyID0gbGlzdGVuZXJMaXN0W2ldO1xuXG4gICAgaWYgKCghc2VsZWN0b3IgfHwgc2VsZWN0b3IgPT09IGxpc3RlbmVyLnNlbGVjdG9yKSAmJiAoIWhhbmRsZXIgfHwgaGFuZGxlciA9PT0gbGlzdGVuZXIuaGFuZGxlcikpIHtcbiAgICAgIGxpc3RlbmVyTGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWxsIGxpc3RlbmVycyByZW1vdmVkXG4gIGlmICghbGlzdGVuZXJMaXN0Lmxlbmd0aCkge1xuICAgIGRlbGV0ZSBsaXN0ZW5lck1hcFtldmVudFR5cGVdO1xuXG4gICAgLy8gUmVtb3ZlIHRoZSBtYWluIGhhbmRsZXJcbiAgICBpZiAodGhpcy5yb290RWxlbWVudCkge1xuICAgICAgdGhpcy5yb290RWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgdGhpcy5oYW5kbGUsIHVzZUNhcHR1cmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuXG4vKipcbiAqIEhhbmRsZSBhbiBhcmJpdHJhcnkgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLmhhbmRsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gIHZhciBpLCBsLCB0eXBlID0gZXZlbnQudHlwZSwgcm9vdCwgcGhhc2UsIGxpc3RlbmVyLCByZXR1cm5lZCwgbGlzdGVuZXJMaXN0ID0gW10sIHRhcmdldCwgLyoqIEBjb25zdCAqLyBFVkVOVElHTk9SRSA9ICdmdExhYnNEZWxlZ2F0ZUlnbm9yZSc7XG5cbiAgaWYgKGV2ZW50W0VWRU5USUdOT1JFXSA9PT0gdHJ1ZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcblxuICAvLyBIYXJkY29kZSB2YWx1ZSBvZiBOb2RlLlRFWFRfTk9ERVxuICAvLyBhcyBub3QgZGVmaW5lZCBpbiBJRThcbiAgaWYgKHRhcmdldC5ub2RlVHlwZSA9PT0gMykge1xuICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICB9XG5cbiAgcm9vdCA9IHRoaXMucm9vdEVsZW1lbnQ7XG5cbiAgcGhhc2UgPSBldmVudC5ldmVudFBoYXNlIHx8ICggZXZlbnQudGFyZ2V0ICE9PSBldmVudC5jdXJyZW50VGFyZ2V0ID8gMyA6IDIgKTtcbiAgXG4gIHN3aXRjaCAocGhhc2UpIHtcbiAgICBjYXNlIDE6IC8vRXZlbnQuQ0FQVFVSSU5HX1BIQVNFOlxuICAgICAgbGlzdGVuZXJMaXN0ID0gdGhpcy5saXN0ZW5lck1hcFsxXVt0eXBlXTtcbiAgICBicmVhaztcbiAgICBjYXNlIDI6IC8vRXZlbnQuQVRfVEFSR0VUOlxuICAgICAgaWYgKHRoaXMubGlzdGVuZXJNYXBbMF0gJiYgdGhpcy5saXN0ZW5lck1hcFswXVt0eXBlXSkgbGlzdGVuZXJMaXN0ID0gbGlzdGVuZXJMaXN0LmNvbmNhdCh0aGlzLmxpc3RlbmVyTWFwWzBdW3R5cGVdKTtcbiAgICAgIGlmICh0aGlzLmxpc3RlbmVyTWFwWzFdICYmIHRoaXMubGlzdGVuZXJNYXBbMV1bdHlwZV0pIGxpc3RlbmVyTGlzdCA9IGxpc3RlbmVyTGlzdC5jb25jYXQodGhpcy5saXN0ZW5lck1hcFsxXVt0eXBlXSk7XG4gICAgYnJlYWs7XG4gICAgY2FzZSAzOiAvL0V2ZW50LkJVQkJMSU5HX1BIQVNFOlxuICAgICAgbGlzdGVuZXJMaXN0ID0gdGhpcy5saXN0ZW5lck1hcFswXVt0eXBlXTtcbiAgICBicmVhaztcbiAgfVxuXG4gIC8vIE5lZWQgdG8gY29udGludW91c2x5IGNoZWNrXG4gIC8vIHRoYXQgdGhlIHNwZWNpZmljIGxpc3QgaXNcbiAgLy8gc3RpbGwgcG9wdWxhdGVkIGluIGNhc2Ugb25lXG4gIC8vIG9mIHRoZSBjYWxsYmFja3MgYWN0dWFsbHlcbiAgLy8gY2F1c2VzIHRoZSBsaXN0IHRvIGJlIGRlc3Ryb3llZC5cbiAgbCA9IGxpc3RlbmVyTGlzdC5sZW5ndGg7XG4gIHdoaWxlICh0YXJnZXQgJiYgbCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXJMaXN0W2ldO1xuXG4gICAgICAvLyBCYWlsIGZyb20gdGhpcyBsb29wIGlmXG4gICAgICAvLyB0aGUgbGVuZ3RoIGNoYW5nZWQgYW5kXG4gICAgICAvLyBubyBtb3JlIGxpc3RlbmVycyBhcmVcbiAgICAgIC8vIGRlZmluZWQgYmV0d2VlbiBpIGFuZCBsLlxuICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgLy8gQ2hlY2sgZm9yIG1hdGNoIGFuZCBmaXJlXG4gICAgICAvLyB0aGUgZXZlbnQgaWYgdGhlcmUncyBvbmVcbiAgICAgIC8vXG4gICAgICAvLyBUT0RPOk1DRzoyMDEyMDExNzogTmVlZCBhIHdheVxuICAgICAgLy8gdG8gY2hlY2sgaWYgZXZlbnQjc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uXG4gICAgICAvLyB3YXMgY2FsbGVkLiBJZiBzbywgYnJlYWsgYm90aCBsb29wcy5cbiAgICAgIGlmIChsaXN0ZW5lci5tYXRjaGVyLmNhbGwodGFyZ2V0LCBsaXN0ZW5lci5tYXRjaGVyUGFyYW0sIHRhcmdldCkpIHtcbiAgICAgICAgcmV0dXJuZWQgPSB0aGlzLmZpcmUoZXZlbnQsIHRhcmdldCwgbGlzdGVuZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyBTdG9wIHByb3BhZ2F0aW9uIHRvIHN1YnNlcXVlbnRcbiAgICAgIC8vIGNhbGxiYWNrcyBpZiB0aGUgY2FsbGJhY2sgcmV0dXJuZWRcbiAgICAgIC8vIGZhbHNlXG4gICAgICBpZiAocmV0dXJuZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIGV2ZW50W0VWRU5USUdOT1JFXSA9IHRydWU7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUT0RPOk1DRzoyMDEyMDExNzogTmVlZCBhIHdheSB0b1xuICAgIC8vIGNoZWNrIGlmIGV2ZW50I3N0b3BQcm9wYWdhdGlvblxuICAgIC8vIHdhcyBjYWxsZWQuIElmIHNvLCBicmVhayBsb29waW5nXG4gICAgLy8gdGhyb3VnaCB0aGUgRE9NLiBTdG9wIGlmIHRoZVxuICAgIC8vIGRlbGVnYXRpb24gcm9vdCBoYXMgYmVlbiByZWFjaGVkXG4gICAgaWYgKHRhcmdldCA9PT0gcm9vdCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgbCA9IGxpc3RlbmVyTGlzdC5sZW5ndGg7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudEVsZW1lbnQ7XG4gIH1cbn07XG5cbi8qKlxuICogRmlyZSBhIGxpc3RlbmVyIG9uIGEgdGFyZ2V0LlxuICpcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtPYmplY3R9IGxpc3RlbmVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuRGVsZWdhdGUucHJvdG90eXBlLmZpcmUgPSBmdW5jdGlvbihldmVudCwgdGFyZ2V0LCBsaXN0ZW5lcikge1xuICByZXR1cm4gbGlzdGVuZXIuaGFuZGxlci5jYWxsKHRhcmdldCwgZXZlbnQsIHRhcmdldCk7XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gZWxlbWVudFxuICogbWF0Y2hlcyBhIGdlbmVyaWMgc2VsZWN0b3IuXG4gKlxuICogQHR5cGUgZnVuY3Rpb24oKVxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIEEgQ1NTIHNlbGVjdG9yXG4gKi9cbnZhciBtYXRjaGVzID0gKGZ1bmN0aW9uKGVsKSB7XG4gIGlmICghZWwpIHJldHVybjtcbiAgdmFyIHAgPSBlbC5wcm90b3R5cGU7XG4gIHJldHVybiAocC5tYXRjaGVzIHx8IHAubWF0Y2hlc1NlbGVjdG9yIHx8IHAud2Via2l0TWF0Y2hlc1NlbGVjdG9yIHx8IHAubW96TWF0Y2hlc1NlbGVjdG9yIHx8IHAubXNNYXRjaGVzU2VsZWN0b3IgfHwgcC5vTWF0Y2hlc1NlbGVjdG9yKTtcbn0oRWxlbWVudCkpO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgYW4gZWxlbWVudFxuICogbWF0Y2hlcyBhIHRhZyBzZWxlY3Rvci5cbiAqXG4gKiBUYWdzIGFyZSBOT1QgY2FzZS1zZW5zaXRpdmUsXG4gKiBleGNlcHQgaW4gWE1MIChhbmQgWE1MLWJhc2VkXG4gKiBsYW5ndWFnZXMgc3VjaCBhcyBYSFRNTCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHRhZ05hbWUgVGhlIHRhZyBuYW1lIHRvIHRlc3QgYWdhaW5zdFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtZW50IFRoZSBlbGVtZW50IHRvIHRlc3Qgd2l0aFxuICogQHJldHVybnMgYm9vbGVhblxuICovXG5mdW5jdGlvbiBtYXRjaGVzVGFnKHRhZ05hbWUsIGVsZW1lbnQpIHtcbiAgcmV0dXJuIHRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBlbGVtZW50XG4gKiBtYXRjaGVzIHRoZSByb290LlxuICpcbiAqIEBwYXJhbSB7P1N0cmluZ30gc2VsZWN0b3IgSW4gdGhpcyBjYXNlIHRoaXMgaXMgYWx3YXlzIHBhc3NlZCB0aHJvdWdoIGFzIG51bGwgYW5kIG5vdCB1c2VkXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gdGVzdCB3aXRoXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNSb290KHNlbGVjdG9yLCBlbGVtZW50KSB7XG4gIC8qanNoaW50IHZhbGlkdGhpczp0cnVlKi9cbiAgaWYgKHRoaXMucm9vdEVsZW1lbnQgPT09IHdpbmRvdykgcmV0dXJuIGVsZW1lbnQgPT09IGRvY3VtZW50O1xuICByZXR1cm4gdGhpcy5yb290RWxlbWVudCA9PT0gZWxlbWVudDtcbn1cblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBJRCBvZlxuICogdGhlIGVsZW1lbnQgaW4gJ3RoaXMnXG4gKiBtYXRjaGVzIHRoZSBnaXZlbiBJRC5cbiAqXG4gKiBJRHMgYXJlIGNhc2Utc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpZCBUaGUgSUQgdG8gdGVzdCBhZ2FpbnN0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1lbnQgVGhlIGVsZW1lbnQgdG8gdGVzdCB3aXRoXG4gKiBAcmV0dXJucyBib29sZWFuXG4gKi9cbmZ1bmN0aW9uIG1hdGNoZXNJZChpZCwgZWxlbWVudCkge1xuICByZXR1cm4gaWQgPT09IGVsZW1lbnQuaWQ7XG59XG5cbi8qKlxuICogU2hvcnQgaGFuZCBmb3Igb2ZmKClcbiAqIGFuZCByb290KCksIGllIGJvdGhcbiAqIHdpdGggbm8gcGFyYW1ldGVyc1xuICpcbiAqIEByZXR1cm4gdm9pZFxuICovXG5EZWxlZ2F0ZS5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9mZigpO1xuICB0aGlzLnJvb3QoKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJ2ZldGNoJyk7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9tb2Rlcm4vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc0Z1bmN0aW9uID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc0Z1bmN0aW9uJyksXG4gICAgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9vYmplY3RzL2lzT2JqZWN0JyksXG4gICAgbm93ID0gcmVxdWlyZSgnLi4vdXRpbGl0aWVzL25vdycpO1xuXG4vKiBOYXRpdmUgbWV0aG9kIHNob3J0Y3V0cyBmb3IgbWV0aG9kcyB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcyAqL1xudmFyIG5hdGl2ZU1heCA9IE1hdGgubWF4O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgZGVsYXkgdGhlIGV4ZWN1dGlvbiBvZiBgZnVuY2AgdW50aWwgYWZ0ZXJcbiAqIGB3YWl0YCBtaWxsaXNlY29uZHMgaGF2ZSBlbGFwc2VkIHNpbmNlIHRoZSBsYXN0IHRpbWUgaXQgd2FzIGludm9rZWQuXG4gKiBQcm92aWRlIGFuIG9wdGlvbnMgb2JqZWN0IHRvIGluZGljYXRlIHRoYXQgYGZ1bmNgIHNob3VsZCBiZSBpbnZva2VkIG9uXG4gKiB0aGUgbGVhZGluZyBhbmQvb3IgdHJhaWxpbmcgZWRnZSBvZiB0aGUgYHdhaXRgIHRpbWVvdXQuIFN1YnNlcXVlbnQgY2FsbHNcbiAqIHRvIHRoZSBkZWJvdW5jZWQgZnVuY3Rpb24gd2lsbCByZXR1cm4gdGhlIHJlc3VsdCBvZiB0aGUgbGFzdCBgZnVuY2AgY2FsbC5cbiAqXG4gKiBOb3RlOiBJZiBgbGVhZGluZ2AgYW5kIGB0cmFpbGluZ2Agb3B0aW9ucyBhcmUgYHRydWVgIGBmdW5jYCB3aWxsIGJlIGNhbGxlZFxuICogb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQgb25seSBpZiB0aGUgdGhlIGRlYm91bmNlZCBmdW5jdGlvbiBpc1xuICogaW52b2tlZCBtb3JlIHRoYW4gb25jZSBkdXJpbmcgdGhlIGB3YWl0YCB0aW1lb3V0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgRnVuY3Rpb25zXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBkZWJvdW5jZS5cbiAqIEBwYXJhbSB7bnVtYmVyfSB3YWl0IFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5LlxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBUaGUgb3B0aW9ucyBvYmplY3QuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmxlYWRpbmc9ZmFsc2VdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMubWF4V2FpdF0gVGhlIG1heGltdW0gdGltZSBgZnVuY2AgaXMgYWxsb3dlZCB0byBiZSBkZWxheWVkIGJlZm9yZSBpdCdzIGNhbGxlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMudHJhaWxpbmc9dHJ1ZV0gU3BlY2lmeSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBkZWJvdW5jZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIC8vIGF2b2lkIGNvc3RseSBjYWxjdWxhdGlvbnMgd2hpbGUgdGhlIHdpbmRvdyBzaXplIGlzIGluIGZsdXhcbiAqIHZhciBsYXp5TGF5b3V0ID0gXy5kZWJvdW5jZShjYWxjdWxhdGVMYXlvdXQsIDE1MCk7XG4gKiBqUXVlcnkod2luZG93KS5vbigncmVzaXplJywgbGF6eUxheW91dCk7XG4gKlxuICogLy8gZXhlY3V0ZSBgc2VuZE1haWxgIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBkZWJvdW5jaW5nIHN1YnNlcXVlbnQgY2FsbHNcbiAqIGpRdWVyeSgnI3Bvc3Rib3gnKS5vbignY2xpY2snLCBfLmRlYm91bmNlKHNlbmRNYWlsLCAzMDAsIHtcbiAqICAgJ2xlYWRpbmcnOiB0cnVlLFxuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSk7XG4gKlxuICogLy8gZW5zdXJlIGBiYXRjaExvZ2AgaXMgZXhlY3V0ZWQgb25jZSBhZnRlciAxIHNlY29uZCBvZiBkZWJvdW5jZWQgY2FsbHNcbiAqIHZhciBzb3VyY2UgPSBuZXcgRXZlbnRTb3VyY2UoJy9zdHJlYW0nKTtcbiAqIHNvdXJjZS5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgXy5kZWJvdW5jZShiYXRjaExvZywgMjUwLCB7XG4gKiAgICdtYXhXYWl0JzogMTAwMFxuICogfSwgZmFsc2UpO1xuICovXG5mdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBhcmdzLFxuICAgICAgbWF4VGltZW91dElkLFxuICAgICAgcmVzdWx0LFxuICAgICAgc3RhbXAsXG4gICAgICB0aGlzQXJnLFxuICAgICAgdGltZW91dElkLFxuICAgICAgdHJhaWxpbmdDYWxsLFxuICAgICAgbGFzdENhbGxlZCA9IDAsXG4gICAgICBtYXhXYWl0ID0gZmFsc2UsXG4gICAgICB0cmFpbGluZyA9IHRydWU7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgfVxuICB3YWl0ID0gbmF0aXZlTWF4KDAsIHdhaXQpIHx8IDA7XG4gIGlmIChvcHRpb25zID09PSB0cnVlKSB7XG4gICAgdmFyIGxlYWRpbmcgPSB0cnVlO1xuICAgIHRyYWlsaW5nID0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoaXNPYmplY3Qob3B0aW9ucykpIHtcbiAgICBsZWFkaW5nID0gb3B0aW9ucy5sZWFkaW5nO1xuICAgIG1heFdhaXQgPSAnbWF4V2FpdCcgaW4gb3B0aW9ucyAmJiAobmF0aXZlTWF4KHdhaXQsIG9wdGlvbnMubWF4V2FpdCkgfHwgMCk7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgdmFyIGRlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3coKSAtIHN0YW1wKTtcbiAgICBpZiAocmVtYWluaW5nIDw9IDApIHtcbiAgICAgIGlmIChtYXhUaW1lb3V0SWQpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG1heFRpbWVvdXRJZCk7XG4gICAgICB9XG4gICAgICB2YXIgaXNDYWxsZWQgPSB0cmFpbGluZ0NhbGw7XG4gICAgICBtYXhUaW1lb3V0SWQgPSB0aW1lb3V0SWQgPSB0cmFpbGluZ0NhbGwgPSB1bmRlZmluZWQ7XG4gICAgICBpZiAoaXNDYWxsZWQpIHtcbiAgICAgICAgbGFzdENhbGxlZCA9IG5vdygpO1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgcmVtYWluaW5nKTtcbiAgICB9XG4gIH07XG5cbiAgdmFyIG1heERlbGF5ZWQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGltZW91dElkKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dElkKTtcbiAgICB9XG4gICAgbWF4VGltZW91dElkID0gdGltZW91dElkID0gdHJhaWxpbmdDYWxsID0gdW5kZWZpbmVkO1xuICAgIGlmICh0cmFpbGluZyB8fCAobWF4V2FpdCAhPT0gd2FpdCkpIHtcbiAgICAgIGxhc3RDYWxsZWQgPSBub3coKTtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpc0FyZywgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXRJZCAmJiAhbWF4VGltZW91dElkKSB7XG4gICAgICAgIGFyZ3MgPSB0aGlzQXJnID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgc3RhbXAgPSBub3coKTtcbiAgICB0aGlzQXJnID0gdGhpcztcbiAgICB0cmFpbGluZ0NhbGwgPSB0cmFpbGluZyAmJiAodGltZW91dElkIHx8ICFsZWFkaW5nKTtcblxuICAgIGlmIChtYXhXYWl0ID09PSBmYWxzZSkge1xuICAgICAgdmFyIGxlYWRpbmdDYWxsID0gbGVhZGluZyAmJiAhdGltZW91dElkO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIW1heFRpbWVvdXRJZCAmJiAhbGVhZGluZykge1xuICAgICAgICBsYXN0Q2FsbGVkID0gc3RhbXA7XG4gICAgICB9XG4gICAgICB2YXIgcmVtYWluaW5nID0gbWF4V2FpdCAtIChzdGFtcCAtIGxhc3RDYWxsZWQpLFxuICAgICAgICAgIGlzQ2FsbGVkID0gcmVtYWluaW5nIDw9IDA7XG5cbiAgICAgIGlmIChpc0NhbGxlZCkge1xuICAgICAgICBpZiAobWF4VGltZW91dElkKSB7XG4gICAgICAgICAgbWF4VGltZW91dElkID0gY2xlYXJUaW1lb3V0KG1heFRpbWVvdXRJZCk7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdENhbGxlZCA9IHN0YW1wO1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoIW1heFRpbWVvdXRJZCkge1xuICAgICAgICBtYXhUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KG1heERlbGF5ZWQsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChpc0NhbGxlZCAmJiB0aW1lb3V0SWQpIHtcbiAgICAgIHRpbWVvdXRJZCA9IGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuICAgIH1cbiAgICBlbHNlIGlmICghdGltZW91dElkICYmIHdhaXQgIT09IG1heFdhaXQpIHtcbiAgICAgIHRpbWVvdXRJZCA9IHNldFRpbWVvdXQoZGVsYXllZCwgd2FpdCk7XG4gICAgfVxuICAgIGlmIChsZWFkaW5nQ2FsbCkge1xuICAgICAgaXNDYWxsZWQgPSB0cnVlO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzQXJnLCBhcmdzKTtcbiAgICB9XG4gICAgaWYgKGlzQ2FsbGVkICYmICF0aW1lb3V0SWQgJiYgIW1heFRpbWVvdXRJZCkge1xuICAgICAgYXJncyA9IHRoaXNBcmcgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlYm91bmNlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibm9kZVwiIC1vIC4vbW9kZXJuL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG52YXIgZGVib3VuY2UgPSByZXF1aXJlKCcuL2RlYm91bmNlJyksXG4gICAgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4uL29iamVjdHMvaXNGdW5jdGlvbicpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vb2JqZWN0cy9pc09iamVjdCcpO1xuXG4vKiogVXNlZCBhcyBhbiBpbnRlcm5hbCBgXy5kZWJvdW5jZWAgb3B0aW9ucyBvYmplY3QgKi9cbnZhciBkZWJvdW5jZU9wdGlvbnMgPSB7XG4gICdsZWFkaW5nJzogZmFsc2UsXG4gICdtYXhXYWl0JzogMCxcbiAgJ3RyYWlsaW5nJzogZmFsc2Vcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQsIHdoZW4gZXhlY3V0ZWQsIHdpbGwgb25seSBjYWxsIHRoZSBgZnVuY2AgZnVuY3Rpb25cbiAqIGF0IG1vc3Qgb25jZSBwZXIgZXZlcnkgYHdhaXRgIG1pbGxpc2Vjb25kcy4gUHJvdmlkZSBhbiBvcHRpb25zIG9iamVjdCB0b1xuICogaW5kaWNhdGUgdGhhdCBgZnVuY2Agc2hvdWxkIGJlIGludm9rZWQgb24gdGhlIGxlYWRpbmcgYW5kL29yIHRyYWlsaW5nIGVkZ2VcbiAqIG9mIHRoZSBgd2FpdGAgdGltZW91dC4gU3Vic2VxdWVudCBjYWxscyB0byB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGxcbiAqIHJldHVybiB0aGUgcmVzdWx0IG9mIHRoZSBsYXN0IGBmdW5jYCBjYWxsLlxuICpcbiAqIE5vdGU6IElmIGBsZWFkaW5nYCBhbmQgYHRyYWlsaW5nYCBvcHRpb25zIGFyZSBgdHJ1ZWAgYGZ1bmNgIHdpbGwgYmUgY2FsbGVkXG4gKiBvbiB0aGUgdHJhaWxpbmcgZWRnZSBvZiB0aGUgdGltZW91dCBvbmx5IGlmIHRoZSB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIGlzXG4gKiBpbnZva2VkIG1vcmUgdGhhbiBvbmNlIGR1cmluZyB0aGUgYHdhaXRgIHRpbWVvdXQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBjYXRlZ29yeSBGdW5jdGlvbnNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHRocm90dGxlLlxuICogQHBhcmFtIHtudW1iZXJ9IHdhaXQgVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdG8gdGhyb3R0bGUgZXhlY3V0aW9ucyB0by5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gVGhlIG9wdGlvbnMgb2JqZWN0LlxuICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5sZWFkaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2Ugb2YgdGhlIHRpbWVvdXQuXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLnRyYWlsaW5nPXRydWVdIFNwZWNpZnkgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlIG9mIHRoZSB0aW1lb3V0LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgdGhyb3R0bGVkIGZ1bmN0aW9uLlxuICogQGV4YW1wbGVcbiAqXG4gKiAvLyBhdm9pZCBleGNlc3NpdmVseSB1cGRhdGluZyB0aGUgcG9zaXRpb24gd2hpbGUgc2Nyb2xsaW5nXG4gKiB2YXIgdGhyb3R0bGVkID0gXy50aHJvdHRsZSh1cGRhdGVQb3NpdGlvbiwgMTAwKTtcbiAqIGpRdWVyeSh3aW5kb3cpLm9uKCdzY3JvbGwnLCB0aHJvdHRsZWQpO1xuICpcbiAqIC8vIGV4ZWN1dGUgYHJlbmV3VG9rZW5gIHdoZW4gdGhlIGNsaWNrIGV2ZW50IGlzIGZpcmVkLCBidXQgbm90IG1vcmUgdGhhbiBvbmNlIGV2ZXJ5IDUgbWludXRlc1xuICogalF1ZXJ5KCcuaW50ZXJhY3RpdmUnKS5vbignY2xpY2snLCBfLnRocm90dGxlKHJlbmV3VG9rZW4sIDMwMDAwMCwge1xuICogICAndHJhaWxpbmcnOiBmYWxzZVxuICogfSkpO1xuICovXG5mdW5jdGlvbiB0aHJvdHRsZShmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gIHZhciBsZWFkaW5nID0gdHJ1ZSxcbiAgICAgIHRyYWlsaW5nID0gdHJ1ZTtcblxuICBpZiAoIWlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yO1xuICB9XG4gIGlmIChvcHRpb25zID09PSBmYWxzZSkge1xuICAgIGxlYWRpbmcgPSBmYWxzZTtcbiAgfSBlbHNlIGlmIChpc09iamVjdChvcHRpb25zKSkge1xuICAgIGxlYWRpbmcgPSAnbGVhZGluZycgaW4gb3B0aW9ucyA/IG9wdGlvbnMubGVhZGluZyA6IGxlYWRpbmc7XG4gICAgdHJhaWxpbmcgPSAndHJhaWxpbmcnIGluIG9wdGlvbnMgPyBvcHRpb25zLnRyYWlsaW5nIDogdHJhaWxpbmc7XG4gIH1cbiAgZGVib3VuY2VPcHRpb25zLmxlYWRpbmcgPSBsZWFkaW5nO1xuICBkZWJvdW5jZU9wdGlvbnMubWF4V2FpdCA9IHdhaXQ7XG4gIGRlYm91bmNlT3B0aW9ucy50cmFpbGluZyA9IHRyYWlsaW5nO1xuXG4gIHJldHVybiBkZWJvdW5jZShmdW5jLCB3YWl0LCBkZWJvdW5jZU9wdGlvbnMpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRocm90dGxlO1xuIiwiLyoqXG4gKiBMby1EYXNoIDIuNC4xIChDdXN0b20gQnVpbGQpIDxodHRwOi8vbG9kYXNoLmNvbS8+XG4gKiBCdWlsZDogYGxvZGFzaCBtb2R1bGFyaXplIG1vZGVybiBleHBvcnRzPVwibm9kZVwiIC1vIC4vbW9kZXJuL2BcbiAqIENvcHlyaWdodCAyMDEyLTIwMTMgVGhlIERvam8gRm91bmRhdGlvbiA8aHR0cDovL2Rvam9mb3VuZGF0aW9uLm9yZy8+XG4gKiBCYXNlZCBvbiBVbmRlcnNjb3JlLmpzIDEuNS4yIDxodHRwOi8vdW5kZXJzY29yZWpzLm9yZy9MSUNFTlNFPlxuICogQ29weXJpZ2h0IDIwMDktMjAxMyBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuICogQXZhaWxhYmxlIHVuZGVyIE1JVCBsaWNlbnNlIDxodHRwOi8vbG9kYXNoLmNvbS9saWNlbnNlPlxuICovXG5cbi8qKiBVc2VkIGZvciBuYXRpdmUgbWV0aG9kIHJlZmVyZW5jZXMgKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGludGVybmFsIFtbQ2xhc3NdXSBvZiB2YWx1ZXMgKi9cbnZhciB0b1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBkZXRlY3QgaWYgYSBtZXRob2QgaXMgbmF0aXZlICovXG52YXIgcmVOYXRpdmUgPSBSZWdFeHAoJ14nICtcbiAgU3RyaW5nKHRvU3RyaW5nKVxuICAgIC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpXG4gICAgLnJlcGxhY2UoL3RvU3RyaW5nfCBmb3IgW15cXF1dKy9nLCAnLio/JykgKyAnJCdcbik7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24uXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBgdmFsdWVgIGlzIGEgbmF0aXZlIGZ1bmN0aW9uLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzTmF0aXZlKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJyAmJiByZU5hdGl2ZS50ZXN0KHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc05hdGl2ZTtcbiIsIi8qKlxuICogTG8tRGFzaCAyLjQuMSAoQ3VzdG9tIEJ1aWxkKSA8aHR0cDovL2xvZGFzaC5jb20vPlxuICogQnVpbGQ6IGBsb2Rhc2ggbW9kdWxhcml6ZSBtb2Rlcm4gZXhwb3J0cz1cIm5vZGVcIiAtbyAuL21vZGVybi9gXG4gKiBDb3B5cmlnaHQgMjAxMi0yMDEzIFRoZSBEb2pvIEZvdW5kYXRpb24gPGh0dHA6Ly9kb2pvZm91bmRhdGlvbi5vcmcvPlxuICogQmFzZWQgb24gVW5kZXJzY29yZS5qcyAxLjUuMiA8aHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvTElDRU5TRT5cbiAqIENvcHlyaWdodCAyMDA5LTIwMTMgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbiAqIEF2YWlsYWJsZSB1bmRlciBNSVQgbGljZW5zZSA8aHR0cDovL2xvZGFzaC5jb20vbGljZW5zZT5cbiAqL1xuXG4vKiogVXNlZCB0byBkZXRlcm1pbmUgaWYgdmFsdWVzIGFyZSBvZiB0aGUgbGFuZ3VhZ2UgdHlwZSBPYmplY3QgKi9cbnZhciBvYmplY3RUeXBlcyA9IHtcbiAgJ2Jvb2xlYW4nOiBmYWxzZSxcbiAgJ2Z1bmN0aW9uJzogdHJ1ZSxcbiAgJ29iamVjdCc6IHRydWUsXG4gICdudW1iZXInOiBmYWxzZSxcbiAgJ3N0cmluZyc6IGZhbHNlLFxuICAndW5kZWZpbmVkJzogZmFsc2Vcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VHlwZXM7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9tb2Rlcm4vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYSBmdW5jdGlvbiwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzRnVuY3Rpb24oXyk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzRnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9tb2Rlcm4vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBvYmplY3RUeXBlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3RUeXBlcycpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIHRoZSBsYW5ndWFnZSB0eXBlIG9mIE9iamVjdC5cbiAqIChlLmcuIGFycmF5cywgZnVuY3Rpb25zLCBvYmplY3RzLCByZWdleGVzLCBgbmV3IE51bWJlcigwKWAsIGFuZCBgbmV3IFN0cmluZygnJylgKVxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0c1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KDEpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3QodmFsdWUpIHtcbiAgLy8gY2hlY2sgaWYgdGhlIHZhbHVlIGlzIHRoZSBFQ01BU2NyaXB0IGxhbmd1YWdlIHR5cGUgb2YgT2JqZWN0XG4gIC8vIGh0dHA6Ly9lczUuZ2l0aHViLmlvLyN4OFxuICAvLyBhbmQgYXZvaWQgYSBWOCBidWdcbiAgLy8gaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MjI5MVxuICByZXR1cm4gISEodmFsdWUgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIHZhbHVlXSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3Q7XG4iLCIvKipcbiAqIExvLURhc2ggMi40LjEgKEN1c3RvbSBCdWlsZCkgPGh0dHA6Ly9sb2Rhc2guY29tLz5cbiAqIEJ1aWxkOiBgbG9kYXNoIG1vZHVsYXJpemUgbW9kZXJuIGV4cG9ydHM9XCJub2RlXCIgLW8gLi9tb2Rlcm4vYFxuICogQ29weXJpZ2h0IDIwMTItMjAxMyBUaGUgRG9qbyBGb3VuZGF0aW9uIDxodHRwOi8vZG9qb2ZvdW5kYXRpb24ub3JnLz5cbiAqIEJhc2VkIG9uIFVuZGVyc2NvcmUuanMgMS41LjIgPGh0dHA6Ly91bmRlcnNjb3JlanMub3JnL0xJQ0VOU0U+XG4gKiBDb3B5cmlnaHQgMjAwOS0yMDEzIEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4gKiBBdmFpbGFibGUgdW5kZXIgTUlUIGxpY2Vuc2UgPGh0dHA6Ly9sb2Rhc2guY29tL2xpY2Vuc2U+XG4gKi9cbnZhciBpc05hdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pc05hdGl2ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhhdCBoYXZlIGVsYXBzZWQgc2luY2UgdGhlIFVuaXggZXBvY2hcbiAqICgxIEphbnVhcnkgMTk3MCAwMDowMDowMCBVVEMpLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgVXRpbGl0aWVzXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBzdGFtcCA9IF8ubm93KCk7XG4gKiBfLmRlZmVyKGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZyhfLm5vdygpIC0gc3RhbXApOyB9KTtcbiAqIC8vID0+IGxvZ3MgdGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgaXQgdG9vayBmb3IgdGhlIGRlZmVycmVkIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuICovXG52YXIgbm93ID0gaXNOYXRpdmUobm93ID0gRGF0ZS5ub3cpICYmIG5vdyB8fCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBub3c7XG4iLCIvKmdsb2JhbCBleHBvcnRzKi9cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gZ2V0Q2xvc2VzdE1hdGNoKGVsLCBzZWxlY3Rvcikge1xuXHR3aGlsZSAoZWwpIHtcblx0XHRpZiAoZWwubWF0Y2hlcyhzZWxlY3RvcikpIHtcblx0XHRcdHJldHVybiBlbDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZWwgPSBlbC5wYXJlbnRFbGVtZW50O1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldEluZGV4KGVsKSB7XG5cdHZhciBpID0gMDtcblx0aWYgKGVsICYmIHR5cGVvZiBlbCA9PT0gJ29iamVjdCcgJiYgZWwubm9kZVR5cGUgPT09IDEpIHtcblx0XHR3aGlsZSAoZWwucHJldmlvdXNTaWJsaW5nKSB7XG5cdFx0XHRlbCA9IGVsLnByZXZpb3VzU2libGluZztcblx0XHRcdGlmIChlbC5ub2RlVHlwZSA9PT0gMSkge1xuXHRcdFx0XHQrK2k7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBpO1xuXHR9XG59XG5cbmV4cG9ydHMuZ2V0Q2xvc2VzdE1hdGNoID0gZ2V0Q2xvc2VzdE1hdGNoO1xuZXhwb3J0cy5nZXRJbmRleCA9IGdldEluZGV4O1xuIiwiLypnbG9iYWwgcmVxdWlyZSxtb2R1bGUqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgb0hlYWRlciA9IHJlcXVpcmUoJy4vc3JjL2pzL0hlYWRlcicpO1xudmFyXHRjb25zdHJ1Y3RBbGwgPSBmdW5jdGlvbigpIHtcblx0b0hlYWRlci5pbml0KCk7XG5cdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ28uRE9NQ29udGVudExvYWRlZCcsIGNvbnN0cnVjdEFsbCk7XG59O1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdvLkRPTUNvbnRlbnRMb2FkZWQnLCBjb25zdHJ1Y3RBbGwpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9IZWFkZXI7XG4iLCIvKmdsb2JhbCByZXF1aXJlLG1vZHVsZSovXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIERvbURlbGVnYXRlID0gcmVxdWlyZSgnZnRkb21kZWxlZ2F0ZScpO1xudmFyIG9IaWVyYXJjaGljYWxOYXYgPSByZXF1aXJlKCdvLWhpZXJhcmNoaWNhbC1uYXYnKTtcblxuZnVuY3Rpb24gSGVhZGVyKHJvb3RFbCkge1xuXG5cdHZhciBib2R5RGVsZWdhdGU7XG5cdC8vIEdldHMgYWxsIG5hdiBlbGVtZW50cyBpbiB0aGUgaGVhZGVyXG5cdHZhciBoaWVyYXJjaGljYWxOYXZFbHMgPSBbXG5cdFx0XHRyb290RWwucXVlcnlTZWxlY3RvcignLm8taGVhZGVyX19uYXYtLXByaW1hcnktdGhlbWUnKSxcblx0XHRcdHJvb3RFbC5xdWVyeVNlbGVjdG9yKCcuby1oZWFkZXJfX25hdi0tc2Vjb25kYXJ5LXRoZW1lJyksXG5cdFx0XHRyb290RWwucXVlcnlTZWxlY3RvcignLm8taGVhZGVyX19uYXYtLXRvb2xzLXRoZW1lJylcblx0XHRdLmZpbHRlcihmdW5jdGlvbihlbCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBPdmVyZmxvdyBpcyBoaWRkZW4gYnkgZGVmYXVsdCBvbiB0aGUgdG9vbHMgYW5kIHByaW1hcnkgdGhlbWUgZm9yIGl0IHRvIHJlc2l6ZSBwcm9wZXJseSBvbiBjb3JlIGV4cGVyaWVuY2Vcblx0XHRcdCAqIHdoZXJlIGxldmVsIDIgYW5kIDMgbWVudXMgd29uJ3QgYXBwZWFyIGFueXdheSwgYnV0IGluIHByaW1hcnkgZXhwZXJpZW5jZSB0aGV5IGRvIG5lZWQgdG8gYXBwZWFyLiBXZSBkbyB0aGlzXG5cdFx0XHQgKiBoZXJlIGluc3RlYWQgb2YgdGhlIG1hcCBmdW5jdGlvbiBpbiBpbml0IGJlY2F1c2UgdGhpcyBuZWVkcyB0byBiZSBhcHBsaWVkIHJlZ2FyZGxlc3Mgb2YgdGhlIG5hdiBoYXZpbmcgYmVlblxuXHRcdFx0ICogaW5pdGlhbGl6ZWQgcHJldmlvdXNseSwgbGlrZSB3aGVuIHRoZSBvLkRPTUNvbnRlbnRlbnRMb2FkZWQgZXZlbnQgaXMgZGlzcGF0Y2hlZFxuXHRcdFx0ICovXG5cdFx0XHRpZiAoZWwpIHtcblx0XHRcdFx0ZWwuc3R5bGUub3ZlcmZsb3cgPSAndmlzaWJsZSc7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZWwgJiYgZWwubm9kZVR5cGUgPT09IDEgJiYgIWVsLmhhc0F0dHJpYnV0ZSgnZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtLWpzJyk7XG5cdFx0fSk7XG5cdHZhciBoaWVyYXJjaGljYWxOYXZzID0gW107XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRpZiAoIXJvb3RFbCkge1xuXHRcdFx0cm9vdEVsID0gZG9jdW1lbnQuYm9keTtcblx0XHR9IGVsc2UgaWYgKCEocm9vdEVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG5cdFx0XHRyb290RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJvb3RFbCk7XG5cdFx0fVxuXHRcdHJvb3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtby1oZWFkZXItLWpzJywgJycpO1xuXHRcdGJvZHlEZWxlZ2F0ZSA9IG5ldyBEb21EZWxlZ2F0ZShkb2N1bWVudC5ib2R5KTtcblx0XHRoaWVyYXJjaGljYWxOYXZzID0gaGllcmFyY2hpY2FsTmF2RWxzLm1hcChmdW5jdGlvbihlbCkge1xuXHRcdFx0cmV0dXJuIG5ldyBvSGllcmFyY2hpY2FsTmF2KGVsKTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIFJlbGVhc2UgaGVhZGVyIGFuZCBhbGwgaXRzIG5hdnMgZnJvbSBtZW1vcnlcblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcblx0XHRib2R5RGVsZWdhdGUuZGVzdHJveSgpO1xuXHRcdGZvciAodmFyIGMgPSAwLCBsID0gaGllcmFyY2hpY2FsTmF2cy5sZW5ndGg7IGMgPCBsOyBjKyspIHtcblx0XHRcdGlmIChoaWVyYXJjaGljYWxOYXZzW2NdKSB7XG5cdFx0XHRcdGhpZXJhcmNoaWNhbE5hdnNbY10uZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyb290RWwucmVtb3ZlQXR0cmlidXRlKCdkYXRhLW8taGVhZGVyLS1qcycpO1xuXHR9XG5cblx0aW5pdCgpO1xuXG5cdHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG5cbn1cblxuLy8gSW5pdGlhbGl6ZXMgYWxsIGhlYWRlciBlbGVtZW50cyBpbiB0aGUgcGFnZSBvciB3aGF0ZXZlciBlbGVtZW50IGlzIHBhc3NlZCB0byBpdFxuSGVhZGVyLmluaXQgPSBmdW5jdGlvbihlbCkge1xuXHRpZiAoIWVsKSB7XG5cdFx0ZWwgPSBkb2N1bWVudC5ib2R5O1xuXHR9IGVsc2UgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcblx0XHRlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpO1xuXHR9XG5cdHZhciBoZWFkZXJFbHMgPSBlbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1vLWNvbXBvbmVudD1cIm8taGVhZGVyXCJdJyk7XG5cdHZhciBoZWFkZXJzID0gW107XG5cdGZvciAodmFyIGMgPSAwLCBsID0gaGVhZGVyRWxzLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuXHRcdGlmICghaGVhZGVyRWxzW2NdLmhhc0F0dHJpYnV0ZSgnZGF0YS1vLWhlYWRlci0tanMnKSkge1xuXHRcdFx0aGVhZGVycy5wdXNoKG5ldyBIZWFkZXIoaGVhZGVyRWxzW2NdKSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBoZWFkZXJzO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBIZWFkZXI7XG4iLCIvKmdsb2JhbCByZXF1aXJlLG1vZHVsZSovXG4ndXNlIHN0cmljdCc7XG52YXIgb0hpZXJhcmNoaWNhbE5hdiA9IHJlcXVpcmUoJy4vc3JjL2pzL1Jlc3BvbnNpdmVOYXYnKTtcbnZhciBjb25zdHJ1Y3RBbGwgPSBmdW5jdGlvbigpIHtcblx0b0hpZXJhcmNoaWNhbE5hdi5pbml0KCk7XG5cdGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ28uRE9NQ29udGVudExvYWRlZCcsIGNvbnN0cnVjdEFsbCk7XG59O1xuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignby5ET01Db250ZW50TG9hZGVkJywgY29uc3RydWN0QWxsKTtcblxubW9kdWxlLmV4cG9ydHMgPSBvSGllcmFyY2hpY2FsTmF2O1xuIiwiLypnbG9iYWwgcmVxdWlyZSwgbW9kdWxlKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIERvbURlbGVnYXRlID0gcmVxdWlyZSgnZnRkb21kZWxlZ2F0ZScpO1xudmFyIG9Eb20gPSByZXF1aXJlKCdvLWRvbScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi91dGlscycpO1xuXG5mdW5jdGlvbiBOYXYocm9vdEVsKSB7XG5cblx0dmFyIGJvZHlEZWxlZ2F0ZSA9IG5ldyBEb21EZWxlZ2F0ZShkb2N1bWVudC5ib2R5KTtcblx0dmFyIHJvb3REZWxlZ2F0ZSA9IG5ldyBEb21EZWxlZ2F0ZShyb290RWwpO1xuXG5cdC8vIEdldCBzdWItbGV2ZWwgZWxlbWVudFxuXHRmdW5jdGlvbiBnZXRDaGlsZExpc3RFbChlbCkge1xuXHRcdHJldHVybiBlbC5xdWVyeVNlbGVjdG9yKCd1bCcpO1xuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgZWxlbWVudCBoYXMgc3ViLWxldmVsIG5hdlxuXHRmdW5jdGlvbiBoYXNDaGlsZExpc3QoZWwpIHtcblx0XHRyZXR1cm4gISFnZXRDaGlsZExpc3RFbChlbCk7XG5cdH1cblxuXHQvLyBHZXQgY29udHJvbGxlZCBlbGVtZW50XG5cdGZ1bmN0aW9uIGdldE1lZ2FEcm9wZG93bkVsKGl0ZW1FbCkge1xuXHRcdGlmIChpdGVtRWwuaGFzQXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpIHtcblx0XHRcdHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpdGVtRWwuZ2V0QXR0cmlidXRlKCdhcmlhLWNvbnRyb2xzJykpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIGVsZW1lbnQgaXMgYSBjb250cm9sbGVyIG9mIGFub3RoZXIgRE9NIGVsZW1lbnRcblx0ZnVuY3Rpb24gaXNDb250cm9sRWwoZWwpIHtcblx0XHRyZXR1cm4gISEoZ2V0Q2hpbGRMaXN0RWwoZWwpIHx8IGdldE1lZ2FEcm9wZG93bkVsKGVsKSk7XG5cdH1cblxuXHQvLyBDaGVjayBpZiBlbGVtZW50IGhhcyBiZWVuIGV4cGFuZGVkXG5cdGZ1bmN0aW9uIGlzRXhwYW5kZWQoZWwpIHtcblx0XHRyZXR1cm4gZWwuZ2V0QXR0cmlidXRlKCdhcmlhLWV4cGFuZGVkJykgPT09ICd0cnVlJztcblx0fVxuXG5cdC8vIENoZWNrIGlmIGEgY2VydGFpbiBlbGVtZW50IGlzIGluc2lkZSB0aGUgcm9vdCBuYXZcblx0ZnVuY3Rpb24gaXNFbGVtZW50SW5zaWRlTmF2KGVsKSB7XG5cdFx0dmFyIGV4cGFuZGVkTGV2ZWwxRWwgPSByb290RWwucXVlcnlTZWxlY3RvcignW2RhdGEtby1oaWVyYXJjaGljYWwtbmF2LWxldmVsPVwiMVwiXSA+IFthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXScpO1xuXHRcdHZhciBleHBhbmRlZE1lZ2FEcm9wZG93bkVsO1xuXHRcdHZhciBhbGxMZXZlbDFFbHM7XG5cblx0XHRpZiAoZXhwYW5kZWRMZXZlbDFFbCkge1xuXHRcdFx0ZXhwYW5kZWRNZWdhRHJvcGRvd25FbCA9IGdldE1lZ2FEcm9wZG93bkVsKGV4cGFuZGVkTGV2ZWwxRWwpO1xuXHRcdFx0aWYgKGV4cGFuZGVkTWVnYURyb3Bkb3duRWwgJiYgZXhwYW5kZWRNZWdhRHJvcGRvd25FbC5jb250YWlucyhlbCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YWxsTGV2ZWwxRWxzID0gcm9vdEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW8taGllcmFyY2hpY2FsLW5hdi1sZXZlbD1cIjFcIl0gPiBsaScpO1xuXG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBhbGxMZXZlbDFFbHMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHRpZiAoYWxsTGV2ZWwxRWxzW2NdLmNvbnRhaW5zKGVsKSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gR2V0IHRoZSBsZXZlbCBhIG5hdiBpcyBpblxuXHRmdW5jdGlvbiBnZXRMZXZlbChlbCkge1xuXHRcdHJldHVybiBwYXJzZUludChlbC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtbGV2ZWwnKSwgMTApO1xuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgYSBsZXZlbCAyIG5hdiB3aWxsIGZpdCBpbiB0aGUgd2luZG93XG5cdGZ1bmN0aW9uIGxldmVsMkxpc3RGaXRzSW5XaW5kb3cobDJFbCkge1xuXHRcdHJldHVybiBsMkVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IDwgd2luZG93LmlubmVyV2lkdGg7XG5cdH1cblxuXHQvLyBDaGVjayBpZiBhbiBlbGVtZW50IHdpbGwgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gaXRzIHJpZ2h0XG5cdGZ1bmN0aW9uIGVsZW1lbnRGaXRzVG9SaWdodChlbDEsIGVsMikge1xuXHRcdHJldHVybiBlbDEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkucmlnaHQgKyBlbDIub2Zmc2V0V2lkdGggPCB3aW5kb3cuaW5uZXJXaWR0aDtcblx0fVxuXG5cdC8vIERlcGVuZGluZyBvbiBpZiBhbiBlbGVtZW50IGZpdHMgdG8gaXRzIHJpZ2h0IG9yIG5vdCwgY2hhbmdlIGl0cyBjbGFzcyB0byBhcHBseSBjb3JyZWN0IGNzc1xuXHRmdW5jdGlvbiBwb3NpdGlvbkNoaWxkTGlzdEVsKHBhcmVudEVsLCBjaGlsZEVsKSB7XG5cdFx0cGFyZW50RWwuY2xhc3NMaXN0LnJlbW92ZSgnby1oaWVyYXJjaGljYWwtbmF2LS1hbGlnbi1yaWdodCcpO1xuXHRcdHBhcmVudEVsLmNsYXNzTGlzdC5yZW1vdmUoJ28taGllcmFyY2hpY2FsLW5hdl9fb3V0c2lkZS1yaWdodCcpO1xuXHRcdHBhcmVudEVsLmNsYXNzTGlzdC5yZW1vdmUoJ28taGllcmFyY2hpY2FsLW5hdi0tbGVmdCcpO1xuXG5cdFx0aWYgKCFjaGlsZEVsKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGdldExldmVsKHBhcmVudEVsKSA9PT0gMSkge1xuXHRcdFx0aWYgKCFsZXZlbDJMaXN0Rml0c0luV2luZG93KGNoaWxkRWwpKSB7XG5cdFx0XHRcdHBhcmVudEVsLmNsYXNzTGlzdC5hZGQoJ28taGllcmFyY2hpY2FsLW5hdi0tYWxpZ24tcmlnaHQnKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKGVsZW1lbnRGaXRzVG9SaWdodChwYXJlbnRFbCwgY2hpbGRFbCkpIHtcblx0XHRcdFx0cGFyZW50RWwuY2xhc3NMaXN0LmFkZCgnby1oaWVyYXJjaGljYWwtbmF2X19vdXRzaWRlLXJpZ2h0Jyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gSGlkZSBhbiBlbGVtZW50XG5cdGZ1bmN0aW9uIGhpZGVFbChlbCkge1xuXHRcdGlmIChlbCkge1xuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gRGlzcGxheSBhbiBlbGVtZW50XG5cdGZ1bmN0aW9uIHNob3dFbChlbCkge1xuXHRcdGlmIChlbCkge1xuXHRcdFx0ZWwucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpO1xuXHRcdH1cblx0fVxuXG5cdC8vIENvbGxhcHNlIGFsbCBpdGVtcyBmcm9tIGEgY2VydGFpbiBub2RlIGxpc3Rcblx0ZnVuY3Rpb24gY29sbGFwc2VBbGwobm9kZUxpc3QpIHtcblx0XHRpZiAoIW5vZGVMaXN0KSB7XG5cdFx0XHRub2RlTGlzdCA9IHJvb3RFbC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtbGV2ZWw9XCIxXCJdID4gbGlbYXJpYS1leHBhbmRlZD10cnVlXScpO1xuXHRcdH1cblxuXHRcdHV0aWxzLm5vZGVMaXN0VG9BcnJheShub2RlTGlzdCkuZm9yRWFjaChmdW5jdGlvbihjaGlsZExpc3RJdGVtRWwpIHtcblx0XHRcdGlmIChpc0V4cGFuZGVkKGNoaWxkTGlzdEl0ZW1FbCkpIHtcblx0XHRcdFx0Y29sbGFwc2VJdGVtKGNoaWxkTGlzdEl0ZW1FbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBTZXQgYW4gZWxlbWVudCBhcyBub3QgZXhwYW5kZWQsIGFuZCBpZiBpdCBoYXMgY2hpbGRyZW4sIGRvIHRoZSBzYW1lIHRvIHRoZW1cblx0ZnVuY3Rpb24gY29sbGFwc2VJdGVtKGl0ZW1FbCkge1xuXHRcdGl0ZW1FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAnZmFsc2UnKTtcblxuXHRcdGlmICh1dGlscy5pc0lFOCkge1xuXHRcdFx0aXRlbUVsLmNsYXNzTGlzdC5hZGQoJ2ZvcmNlSUVyZXBhaW50Jyk7XG5cdFx0XHRpdGVtRWwuY2xhc3NMaXN0LnJlbW92ZSgnZm9yY2VJRXJlcGFpbnQnKTtcblx0XHR9XG5cblx0XHRpZiAoaGFzQ2hpbGRMaXN0KGl0ZW1FbCkpIHtcblx0XHRcdGNvbGxhcHNlQWxsKGdldENoaWxkTGlzdEVsKGl0ZW1FbCkuY2hpbGRyZW4pO1xuXHRcdH1cblxuXHRcdGhpZGVFbChnZXRNZWdhRHJvcGRvd25FbChpdGVtRWwpKTtcblx0XHRkaXNwYXRjaENsb3NlRXZlbnQoaXRlbUVsKTtcblx0fVxuXG5cdC8vIEdldCBzYW1lIGxldmVsIGl0ZW1zIGFuZCBjb2xsYXBzZSB0aGVtXG5cdGZ1bmN0aW9uIGNvbGxhcHNlU2libGluZ0l0ZW1zKGl0ZW1FbCkge1xuXHRcdHZhciBsaXN0TGV2ZWwgPSBvRG9tLmdldENsb3Nlc3RNYXRjaChpdGVtRWwsICd1bCcpLmdldEF0dHJpYnV0ZSgnZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtbGV2ZWwnKTtcblx0XHR2YXIgbGlzdEl0ZW1FbHMgPSByb290RWwucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtby1oaWVyYXJjaGljYWwtbmF2LWxldmVsPVwiJyArIGxpc3RMZXZlbCArICdcIl0gPiBsaVthcmlhLWV4cGFuZGVkPVwidHJ1ZVwiXScpO1xuXG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBsaXN0SXRlbUVscy5sZW5ndGg7IGMgPCBsOyBjKyspIHtcblx0XHRcdGNvbGxhcHNlSXRlbShsaXN0SXRlbUVsc1tjXSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gRXhwYW5kIGEgbmF2IGl0ZW1cblx0ZnVuY3Rpb24gZXhwYW5kSXRlbShpdGVtRWwpIHtcblx0XHRjb2xsYXBzZVNpYmxpbmdJdGVtcyhpdGVtRWwpO1xuXHRcdGl0ZW1FbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtZXhwYW5kZWQnLCAndHJ1ZScpO1xuXHRcdHBvc2l0aW9uQ2hpbGRMaXN0RWwoaXRlbUVsLCBnZXRDaGlsZExpc3RFbChpdGVtRWwpKTtcblx0XHRzaG93RWwoZ2V0TWVnYURyb3Bkb3duRWwoaXRlbUVsKSk7XG5cdFx0ZGlzcGF0Y2hFeHBhbmRFdmVudChpdGVtRWwpO1xuXHR9XG5cblx0Ly8gSGVscGVyIG1ldGhvZCB0byBkaXNwYXRjaCBvLWxheWVycyBuZXcgZXZlbnRcblx0ZnVuY3Rpb24gZGlzcGF0Y2hFeHBhbmRFdmVudChpdGVtRWwpIHtcblx0XHR1dGlscy5kaXNwYXRjaEN1c3RvbUV2ZW50KGl0ZW1FbCwgJ29MYXllcnMubmV3Jywgeyd6SW5kZXgnOiAxMCwgJ2VsJzogaXRlbUVsfSk7XG5cdH1cblxuXHQvLyBIZWxwZXIgbWV0aG9kIHRvIGRpc3BhdGNoIG8tbGF5ZXJzIGNsb3NlIGV2ZW50XG5cdGZ1bmN0aW9uIGRpc3BhdGNoQ2xvc2VFdmVudChpdGVtRWwpIHtcblx0XHR1dGlscy5kaXNwYXRjaEN1c3RvbUV2ZW50KGl0ZW1FbCwgJ29MYXllcnMuY2xvc2UnLCB7J3pJbmRleCc6IDEwLCAnZWwnOiBpdGVtRWx9KTtcblx0fVxuXG5cdC8vIEhhbmRsZSBjbGlja3Mgb3Vyc2VsdmVkIGJ5IGV4cGFuZGluZyBvciBjb2xsYXBzaW5nIHNlbGVjdGVkIGVsZW1lbnRcblx0ZnVuY3Rpb24gaGFuZGxlQ2xpY2soZXYpIHtcblx0XHR2YXIgaXRlbUVsID0gb0RvbS5nZXRDbG9zZXN0TWF0Y2goZXYudGFyZ2V0LCAnbGknKTtcblxuXHRcdGlmIChpdGVtRWwgJiYgaXNDb250cm9sRWwoaXRlbUVsKSkge1xuXHRcdFx0ZXYucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0aWYgKCFpc0V4cGFuZGVkKGl0ZW1FbCkpIHtcblx0XHRcdFx0ZXhwYW5kSXRlbShpdGVtRWwpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29sbGFwc2VJdGVtKGl0ZW1FbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUG9zaXRpb24gYSBsZXZlbCAzIG5hdlxuXHRmdW5jdGlvbiBwb3NpdGlvbkxldmVsM3MoKSB7XG5cdFx0dmFyIG9wZW5MZXZlbDJFbCA9IHJvb3RFbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtbGV2ZWw9XCIyXCJdID4gW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdJyk7XG5cdFx0dmFyIG9wZW5MZXZlbDNFbCA9IHJvb3RFbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtbGV2ZWw9XCIyXCJdID4gW2FyaWEtZXhwYW5kZWQ9XCJ0cnVlXCJdID4gdWwnKTtcblxuXHRcdGlmIChvcGVuTGV2ZWwyRWwgJiYgb3BlbkxldmVsM0VsKSB7XG5cdFx0XHRwb3NpdGlvbkNoaWxkTGlzdEVsKG9wZW5MZXZlbDJFbCwgb3BlbkxldmVsM0VsKTtcblx0XHR9XG5cdH1cblxuXHQvLyBQb3NpdGlvbiBsZXZlbCAzcyBvbiByZXNpemVcblx0ZnVuY3Rpb24gcmVzaXplKCkge1xuXHRcdHBvc2l0aW9uTGV2ZWwzcygpO1xuXHR9XG5cblx0Ly8gU2V0IGFsbCB0YWJJbmRleGVzIG9mIGEgdGFncyB0byAwXG5cdGZ1bmN0aW9uIHNldFRhYkluZGV4ZXMoKSB7XG5cdFx0dmFyIGFFbHMgPSByb290RWwucXVlcnlTZWxlY3RvckFsbCgnbGkgPiBhJyk7XG5cblx0XHRmb3IgKHZhciBjID0gMCwgbCA9IGFFbHMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHRpZiAoIWFFbHNbY10uaGFzQXR0cmlidXRlKCdocmVmJykpIHtcblx0XHRcdFx0aWYgKGFFbHNbY10udGFiSW5kZXggPT09IDApIHsgLy8gRG9uJ3Qgb3ZlcnJpZGUgdGFiSW5kZXggaWYgc29tZXRoaW5nIGVsc2UgaGFzIHNldCBpdCwgYnV0IG90aGVyd2lzZSBzZXQgaXQgdG8gemVybyB0byBtYWtlIGl0IGZvY3VzYWJsZS5cblx0XHRcdFx0XHRhRWxzW2NdLnRhYkluZGV4ID0gMDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIHNldExheWVyc0NvbnRleHQoKSB7XG5cdFx0Ly8gV2UnbGwgdXNlIHRoZSBib2R5IGFzIHRoZSBkZWZhdWx0IGNvbnRleHRcblx0XHRib2R5RGVsZWdhdGUub24oJ29MYXllcnMubmV3JywgZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYgKCFpc0VsZW1lbnRJbnNpZGVOYXYoZS5kZXRhaWwuZWwpKSB7XG5cdFx0XHRcdGNvbGxhcHNlQWxsKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0KCkge1xuXHRcdGlmICghcm9vdEVsKSB7XG5cdFx0XHRyb290RWwgPSBkb2N1bWVudC5ib2R5O1xuXHRcdH0gZWxzZSBpZiAoIShyb290RWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcblx0XHRcdHJvb3RFbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocm9vdEVsKTtcblx0XHR9XG5cblx0XHRyb290RWwuc2V0QXR0cmlidXRlKCdkYXRhLW8taGllcmFyY2hpY2FsLW5hdi0tanMnLCAnJyk7XG5cdFx0c2V0VGFiSW5kZXhlcygpO1xuXHRcdHNldExheWVyc0NvbnRleHQoKTtcblx0XHRyb290RGVsZWdhdGUub24oJ2NsaWNrJywgaGFuZGxlQ2xpY2spO1xuXHRcdHJvb3REZWxlZ2F0ZS5vbigna2V5dXAnLCBmdW5jdGlvbihldikgeyAvLyBQcmVzc2luZyBlbnRlciBrZXkgb24gYW5jaG9ycyB3aXRob3V0IEBocmVmIHdvbid0IHRyaWdnZXIgYSBjbGljayBldmVudFxuXHRcdFx0aWYgKCFldi50YXJnZXQuaGFzQXR0cmlidXRlKCdocmVmJykgJiYgZXYua2V5Q29kZSA9PT0gMTMgJiYgaXNFbGVtZW50SW5zaWRlTmF2KGV2LnRhcmdldCkpIHtcblx0XHRcdFx0aGFuZGxlQ2xpY2soZXYpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQ29sbGFwc2UgYWxsIGVsZW1lbnRzIGlmIHRoZSB1c2VyIGNsaWNrcyBvdXRzaWRlIHRoZSBuYXZcblx0XHRib2R5RGVsZWdhdGUub24oJ2NsaWNrJywgZnVuY3Rpb24oZXYpIHtcblx0XHRcdGlmICghaXNFbGVtZW50SW5zaWRlTmF2KGV2LnRhcmdldCkpIHtcblx0XHRcdFx0Y29sbGFwc2VBbGwoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG5cdFx0cm9vdERlbGVnYXRlLmRlc3Ryb3koKTtcblx0XHRib2R5RGVsZWdhdGUuZGVzdHJveSgpO1xuXHRcdHJvb3RFbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtby1oaWVyYXJjaGljYWwtbmF2LS1qcycpO1xuXHR9XG5cblx0aW5pdCgpO1xuXG5cdHRoaXMucmVzaXplID0gcmVzaXplO1xuXHR0aGlzLmNvbGxhcHNlQWxsID0gY29sbGFwc2VBbGw7XG5cdHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTmF2O1xuIiwiLypnbG9iYWwgcmVxdWlyZSxtb2R1bGUqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgU3F1aXNoeUxpc3QgPSByZXF1aXJlKCdvLXNxdWlzaHktbGlzdCcpO1xudmFyIERvbURlbGVnYXRlID0gcmVxdWlyZSgnZnRkb21kZWxlZ2F0ZScpO1xudmFyIG9WaWV3cG9ydCA9IHJlcXVpcmUoJ28tdmlld3BvcnQnKTtcbnZhciBOYXYgPSByZXF1aXJlKCcuL05hdicpO1xuXG5mdW5jdGlvbiBSZXNwb25zaXZlTmF2KHJvb3RFbCkge1xuXG5cdHZhciByb290RGVsZWdhdGU7XG5cdHZhciBuYXY7XG5cdHZhciBjb250ZW50RmlsdGVyRWw7XG5cdHZhciBjb250ZW50RmlsdGVyO1xuXHR2YXIgbW9yZUVsO1xuXHR2YXIgbW9yZUxpc3RFbDtcblxuXHQvLyBDaGVjayBpZiBlbGVtZW50IGlzIGEgY29udHJvbGxlciBvZiBhbm90aGVyIERPTSBlbGVtZW50XG5cdGZ1bmN0aW9uIGlzTWVnYURyb3Bkb3duQ29udHJvbChlbCkge1xuXHRcdHJldHVybiBlbC5oYXNBdHRyaWJ1dGUoJ2FyaWEtY29udHJvbHMnKTtcblx0fVxuXG5cdC8vIE9uIHJlc2l6ZSwgYXBwbHkgby1zcXVpc2h5LWxpc3QsIGFuZCwgaWYgaXQgaGFzIGEgc3ViLWxldmVsIGRvbSwgcG9wdWxhdGUgbW9yZSBsaXN0XG5cdGZ1bmN0aW9uIHJlc2l6ZSgpIHtcblx0XHRuYXYucmVzaXplKCk7XG5cblx0XHRpZiAoY29udGVudEZpbHRlcikge1xuXHRcdFx0Y29udGVudEZpbHRlci5zcXVpc2goKTtcblx0XHRcdGlmICghaXNNZWdhRHJvcGRvd25Db250cm9sKG1vcmVFbCkpIHtcblx0XHRcdFx0cG9wdWxhdGVNb3JlTGlzdChjb250ZW50RmlsdGVyLmdldEhpZGRlbkl0ZW1zKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEVtcHR5IHRoZSBtb3JlIGxpc3Rcblx0ZnVuY3Rpb24gZW1wdHlNb3JlTGlzdCgpIHtcblx0XHRtb3JlTGlzdEVsLmlubmVySFRNTCA9ICcnO1xuXHR9XG5cblx0Ly8gR2V0IHRoZSBpbmZvcm1hdGlvbiBmcm9tIHRoZSBlbGVtZW50IGFuZCBjcmVhdGUgYSBuZXcgbGkgdGFnIHdpdGggdGhlIGVsZW1lbnQncyB0ZXh0IHRvIGFwcGVuZCBtb3JlIGxpc3Rcblx0ZnVuY3Rpb24gYWRkSXRlbVRvTW9yZUxpc3QodGV4dCwgaHJlZikge1xuXHRcdHZhciBpdGVtRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuXHRcdHZhciBhRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG5cblx0XHRpZiAodHlwZW9mIGFFbC50ZXh0Q29udGVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdGFFbC50ZXh0Q29udGVudCA9IHRleHQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFFbC5pbm5lclRleHQgPSB0ZXh0O1xuXHRcdH1cblxuXHRcdGFFbC5ocmVmID0gaHJlZjtcblx0XHRpdGVtRWwuYXBwZW5kQ2hpbGQoYUVsKTtcblx0XHRtb3JlTGlzdEVsLmFwcGVuZENoaWxkKGl0ZW1FbCk7XG5cdH1cblxuXHQvLyBGb3IgZXZlcnkgaGlkZGVuIGl0ZW0sIGFkZCBpdCB0byB0aGUgbW9yZSBsaXN0XG5cdGZ1bmN0aW9uIHBvcHVsYXRlTW9yZUxpc3QoaGlkZGVuRWxzKSB7XG5cdFx0ZW1wdHlNb3JlTGlzdCgpO1xuXG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBoaWRkZW5FbHMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHR2YXIgYUVsID0gaGlkZGVuRWxzW2NdLnF1ZXJ5U2VsZWN0b3IoJ2EnKTtcblx0XHRcdHZhciB1bEVsID0gaGlkZGVuRWxzW2NdLnF1ZXJ5U2VsZWN0b3IoJ3VsJyk7XG5cblx0XHRcdHZhciBhVGV4dCA9ICh0eXBlb2YgYUVsLnRleHRDb250ZW50ICE9PSAndW5kZWZpbmVkJykgPyBhRWwudGV4dENvbnRlbnQgOiBhRWwuaW5uZXJUZXh0O1xuXHRcdFx0YWRkSXRlbVRvTW9yZUxpc3QoYVRleHQsIGFFbC5ocmVmLCB1bEVsKTtcblx0XHR9XG5cdH1cblxuXHQvLyBJZiBhbGwgZWxlbWVudHMgYXJlIGhpZGRlbiwgYWRkIHRoZSBhbGwgbW9kaWZpZXIsIGlmIG5vdCwgdGhlIHNvbWUgbW9kaWZpZXJcblx0ZnVuY3Rpb24gc2V0TW9yZUVsQ2xhc3MocmVtYWluaW5nSXRlbXMpIHtcblx0XHRpZiAoIW1vcmVFbCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmIChyZW1haW5pbmdJdGVtcyA9PT0gMCkge1xuXHRcdFx0bW9yZUVsLmNsYXNzTGlzdC5hZGQoJ28taGllcmFyY2hpY2FsLW5hdl9fbW9yZS0tYWxsJyk7XG5cdFx0XHRtb3JlRWwuY2xhc3NMaXN0LnJlbW92ZSgnby1oaWVyYXJjaGljYWwtbmF2X19tb3JlLS1zb21lJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1vcmVFbC5jbGFzc0xpc3QuYWRkKCdvLWhpZXJhcmNoaWNhbC1uYXZfX21vcmUtLXNvbWUnKTtcblx0XHRcdG1vcmVFbC5jbGFzc0xpc3QucmVtb3ZlKCdvLWhpZXJhcmNoaWNhbC1uYXZfX21vcmUtLWFsbCcpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFdoZW4gdGhlcmUncyBhbiBvLXNxdWlzaHktbGlzdCBjaGFuZ2UsIGNvbGxhcHNlIGFsbCBlbGVtZW50cyBhbmQgcnVuIHRoZSBzZXRNb3JlRWxDbGFzcyBtZXRob2Qgd2l0aCBudW1iZXIgb2Ygbm9uLWhpZGRlbiBlbGVtZW50c1xuXHRmdW5jdGlvbiBjb250ZW50RmlsdGVyQ2hhbmdlSGFuZGxlcihldikge1xuXHRcdGlmIChldi50YXJnZXQgPT09IGNvbnRlbnRGaWx0ZXJFbCAmJiBldi5kZXRhaWwuaGlkZGVuSXRlbXMubGVuZ3RoID4gMCkge1xuXHRcdFx0bmF2LmNvbGxhcHNlQWxsKCk7XG5cdFx0XHRzZXRNb3JlRWxDbGFzcyhldi5kZXRhaWwucmVtYWluaW5nSXRlbXMubGVuZ3RoKTtcblx0XHR9XG5cdH1cblxuXHQvLyBJZiBtb3JlIGJ1dHRvbiBpcyBjbGlja2VkLCBwb3B1bGF0ZSBpdFxuXHRmdW5jdGlvbiBuYXZFeHBhbmRIYW5kbGVyKGV2KSB7XG5cdFx0aWYgKGV2LnRhcmdldCA9PT0gbW9yZUVsKSB7XG5cdFx0XHRwb3B1bGF0ZU1vcmVMaXN0KGNvbnRlbnRGaWx0ZXIuZ2V0SGlkZGVuSXRlbXMoKSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRpZiAoIXJvb3RFbCkge1xuXHRcdFx0cm9vdEVsID0gZG9jdW1lbnQuYm9keTtcblx0XHR9IGVsc2UgaWYgKCEocm9vdEVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG5cdFx0XHRyb290RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJvb3RFbCk7XG5cdFx0fVxuXG5cdFx0bmF2ID0gbmV3IE5hdihyb290RWwpO1xuXHRcdHJvb3REZWxlZ2F0ZSA9IG5ldyBEb21EZWxlZ2F0ZShyb290RWwpO1xuXHRcdGNvbnRlbnRGaWx0ZXJFbCA9IHJvb3RFbC5xdWVyeVNlbGVjdG9yKCd1bCcpO1xuXHRcdG1vcmVFbCA9IHJvb3RFbC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb3JlXScpO1xuXG5cdFx0aWYgKGNvbnRlbnRGaWx0ZXJFbCkge1xuXHRcdFx0Y29udGVudEZpbHRlciA9IG5ldyBTcXVpc2h5TGlzdChjb250ZW50RmlsdGVyRWwsIHsgZmlsdGVyT25SZXNpemU6IGZhbHNlIH0pO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZXJlJ3MgYSBtb3JlIGVsZW1lbnQsIGFkZCBhIHVsIHRhZyB3aGVyZSBoaWRkZW4gZWxlbWVudHMgd2lsbCBiZSBhcHBlbmRlZFxuXHRcdGlmIChtb3JlRWwpIHtcblx0XHRcdG1vcmVFbC5zZXRBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcblxuXHRcdFx0aWYgKCFpc01lZ2FEcm9wZG93bkNvbnRyb2wobW9yZUVsKSkge1xuXHRcdFx0XHRtb3JlTGlzdEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblx0XHRcdFx0bW9yZUxpc3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtby1oaWVyYXJjaGljYWwtbmF2LWxldmVsJywgJzInKTtcblx0XHRcdFx0bW9yZUVsLmFwcGVuZENoaWxkKG1vcmVMaXN0RWwpO1xuXHRcdFx0XHRyb290RGVsZWdhdGUub24oJ29MYXllcnMubmV3JywgbmF2RXhwYW5kSGFuZGxlcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cm9vdERlbGVnYXRlLm9uKCdvU3F1aXNoeUxpc3QuY2hhbmdlJywgY29udGVudEZpbHRlckNoYW5nZUhhbmRsZXIpO1xuXG5cdFx0dmFyIGJvZHlEZWxlZ2F0ZSA9IG5ldyBEb21EZWxlZ2F0ZShkb2N1bWVudC5ib2R5KTtcblxuXHRcdC8vIEZvcmNlIGEgcmVzaXplIHdoZW4gaXQgbG9hZHMsIGluIGNhc2UgaXQgbG9hZHMgb24gYSBzbWFsbGVyIHNjcmVlblxuXHRcdHJlc2l6ZSgpO1xuXG5cdFx0b1ZpZXdwb3J0Lmxpc3RlblRvKCdyZXNpemUnKTtcblx0XHRib2R5RGVsZWdhdGUub24oJ29WaWV3cG9ydC5yZXNpemUnLCByZXNpemUpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcblx0XHRyb290RGVsZWdhdGUuZGVzdHJveSgpO1xuXHRcdHJvb3RFbC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtby1oaWVyYXJjaGljYWwtbmF2LS1qcycpO1xuXHR9XG5cblx0aW5pdCgpO1xuXG5cdHRoaXMucmVzaXplID0gcmVzaXplO1xuXHR0aGlzLmRlc3Ryb3kgPSBkZXN0cm95O1xufVxuXG4vLyBJbml0aWFsaXplcyBhbGwgbmF2IGVsZW1lbnRzIGluIHRoZSBwYWdlIG9yIHdoYXRldmVyIGVsZW1lbnQgaXMgcGFzc2VkIHRvIGl0XG5SZXNwb25zaXZlTmF2LmluaXQgPSBmdW5jdGlvbihlbCkge1xuXHRpZiAoIWVsKSB7XG5cdFx0ZWwgPSBkb2N1bWVudC5ib2R5O1xuXHR9IGVsc2UgaWYgKCEoZWwgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpIHtcblx0XHRlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpO1xuXHR9XG5cblx0dmFyIG5hdkVscyA9IGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW8tY29tcG9uZW50PVwiby1oaWVyYXJjaGljYWwtbmF2XCJdJyk7XG5cdHZhciByZXNwb25zaXZlTmF2cyA9IFtdO1xuXG5cdGZvciAodmFyIGMgPSAwLCBsID0gbmF2RWxzLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuXHRcdGlmICghbmF2RWxzW2NdLmhhc0F0dHJpYnV0ZSgnZGF0YS1vLWhpZXJhcmNoaWNhbC1uYXYtLWpzJykpIHtcblx0XHRcdC8vIElmIGl0J3MgYSB2ZXJ0aWNhbCBuYXYsIHdlIGRvbid0IG5lZWQgYWxsIHRoZSByZXNwb25zaXZlIG1ldGhvZHNcblx0XHRcdGlmIChuYXZFbHNbY10uZ2V0QXR0cmlidXRlKCdkYXRhLW8taGllcmFyY2hpY2FsLW5hdi1vcmllbnRpYXRpb24nKSA9PT0gJ3ZlcnRpY2FsJykge1xuXHRcdFx0XHRyZXNwb25zaXZlTmF2cy5wdXNoKG5ldyBOYXYobmF2RWxzW2NdKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXNwb25zaXZlTmF2cy5wdXNoKG5ldyBSZXNwb25zaXZlTmF2KG5hdkVsc1tjXSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXNwb25zaXZlTmF2cztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVzcG9uc2l2ZU5hdjtcbiIsIi8qZ2xvYmFsIGV4cG9ydHMqL1xuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjb252ZXJ0cyBhIGxpc3Qgb2YgZWxlbWVudHMgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbm9kZUxpc3RUb0FycmF5KG5sKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0cmV0dXJuIFtdLm1hcC5jYWxsKG5sLCBmdW5jdGlvbihlbGVtZW50KSB7XG5cdFx0cmV0dXJuIGVsZW1lbnQ7XG5cdH0pO1xufVxuXG4vLyBIZWxwZXIgZnVuY3Rpb24gdG8gZGlzcGF0Y2ggZXZlbnRzXG5mdW5jdGlvbiBkaXNwYXRjaEN1c3RvbUV2ZW50KGVsLCBuYW1lLCBkYXRhKSB7XG5cdCd1c2Ugc3RyaWN0Jztcblx0aWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICYmIGVsLmRpc3BhdGNoRXZlbnQpIHtcblx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblx0XHRldmVudC5pbml0RXZlbnQobmFtZSwgdHJ1ZSwgdHJ1ZSk7XG5cblx0XHRpZiAoZGF0YSkge1xuXHRcdFx0ZXZlbnQuZGV0YWlsID0gZGF0YTtcblx0XHR9XG5cblx0XHRlbC5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcblx0fVxufVxuXG5mdW5jdGlvbiBpc0lFOCgpIHtcblx0J3VzZSBzdHJpY3QnO1xuXG5cdHZhciBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnQicpO1xuXHR2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblx0dmFyIGlzSUU7XG5cblx0Yi5pbm5lckhUTUwgPSAnPCEtLVtpZiBJRSA4XT48YiBpZD1cImllOHRlc3RcIj48L2I+PCFbZW5kaWZdLS0+Jztcblx0ZG9jRWxlbS5hcHBlbmRDaGlsZChiKTtcblx0aXNJRSA9ICEhZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2llOHRlc3QnKTtcblx0ZG9jRWxlbS5yZW1vdmVDaGlsZChiKTtcblx0cmV0dXJuIGlzSUU7XG59XG5cbmV4cG9ydHMuaXNJRTggPSBpc0lFOCgpO1xuZXhwb3J0cy5ub2RlTGlzdFRvQXJyYXkgPSBub2RlTGlzdFRvQXJyYXk7XG5leHBvcnRzLmRpc3BhdGNoQ3VzdG9tRXZlbnQgPSBkaXNwYXRjaEN1c3RvbUV2ZW50O1xuIiwiLypnbG9iYWwgbW9kdWxlKi9cblxuZnVuY3Rpb24gU3F1aXNoeUxpc3Qocm9vdEVsLCBvcHRzKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXG5cdHZhciBhbGxJdGVtRWxzO1xuXHR2YXIgcHJpb3JpdHlTb3J0ZWRJdGVtRWxzO1xuXHR2YXIgaGlkZGVuSXRlbUVscztcblx0dmFyIG1vcmVFbDtcblx0dmFyIG1vcmVXaWR0aCA9IDA7XG5cdHZhciBkZWJvdW5jZVRpbWVvdXQ7XG5cdHZhciBvcHRpb25zID0gb3B0cyB8fCB7IGZpbHRlck9uUmVzaXplOiB0cnVlIH07XG5cblx0ZnVuY3Rpb24gZGlzcGF0Y2hDdXN0b21FdmVudChuYW1lLCBkYXRhKSB7XG5cdFx0aWYgKGRvY3VtZW50LmNyZWF0ZUV2ZW50ICYmIHJvb3RFbC5kaXNwYXRjaEV2ZW50KSB7XG5cdFx0XHR2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnRXZlbnQnKTtcblx0XHRcdGV2ZW50LmluaXRFdmVudChuYW1lLCB0cnVlLCB0cnVlKTtcblx0XHRcdGlmIChkYXRhKSB7XG5cdFx0XHRcdGV2ZW50LmRldGFpbCA9IGRhdGE7XG5cdFx0XHR9XG5cdFx0XHRyb290RWwuZGlzcGF0Y2hFdmVudChldmVudCk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SXRlbUVscygpIHtcblx0XHR2YXIgaXRlbUVscyA9IFtdO1xuXHRcdHZhciBjaGlsZE5vZGVFbDtcblxuXHRcdGZvciAodmFyIGMgPSAwLCBsID0gcm9vdEVsLmNoaWxkTm9kZXMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHRjaGlsZE5vZGVFbCA9IHJvb3RFbC5jaGlsZE5vZGVzW2NdO1xuXHRcdFx0Ly8gTWFrZSBpdCBmbGV4aWJsZSBzbyB0aGF0IG90aGVyIHByb2R1Y3QgYW5kIG1vZHVsZXMgY2FuIG1hbnVhbGx5IGhpZGUgZWxlbWVudHMgYW5kIG8tc3F1aXNoeS1saXN0IHdvbid0IGFkZCBpdCB0byBpdCdzIGxpc3Rcblx0XHRcdGlmIChjaGlsZE5vZGVFbC5ub2RlVHlwZSA9PT0gMSAmJiAhY2hpbGROb2RlRWwuaGFzQXR0cmlidXRlKCdkYXRhLW1vcmUnKSAmJiAhY2hpbGROb2RlRWwuaGFzQXR0cmlidXRlKCdkYXRhLW8tc3F1aXNoeS1saXN0LS1pZ25vcmUnKSkge1xuXHRcdFx0XHRpdGVtRWxzLnB1c2goY2hpbGROb2RlRWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaXRlbUVscztcblx0fVxuXG5cdGZ1bmN0aW9uIHNob3dFbChlbCkge1xuXHRcdGlmIChlbCkge1xuXHRcdFx0ZWwucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGhpZGVFbChlbCkge1xuXHRcdGlmIChlbCkge1xuXHRcdFx0ZWwuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RWxQcmlvcml0eShlbCkge1xuXHRcdHJldHVybiBwYXJzZUludChlbC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcHJpb3JpdHknKSwgMTApO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0UHJpb3JpdHlTb3J0ZWRDaGlsZE5vZGVFbHMoKSB7XG5cdFx0YWxsSXRlbUVscyA9IGdldEl0ZW1FbHMoKTtcblx0XHRwcmlvcml0eVNvcnRlZEl0ZW1FbHMgPSBbXTtcblx0XHR2YXIgdW5wcmlvcml0aXNlZEl0ZW1FbHMgPSBbXTtcblx0XHRmb3IgKHZhciBjID0gMCwgbCA9IGFsbEl0ZW1FbHMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHR2YXIgdGhpc0l0ZW1FbCA9IGFsbEl0ZW1FbHNbY10sXG5cdFx0XHRcdHRoaXNJdGVtUHJpb3JpdHkgPSBnZXRFbFByaW9yaXR5KHRoaXNJdGVtRWwpO1xuXHRcdFx0aWYgKGlzTmFOKHRoaXNJdGVtUHJpb3JpdHkpKSB7XG5cdFx0XHRcdHVucHJpb3JpdGlzZWRJdGVtRWxzLnB1c2godGhpc0l0ZW1FbCk7XG5cdFx0XHR9IGVsc2UgaWYgKHRoaXNJdGVtUHJpb3JpdHkgPj0gMCkge1xuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocHJpb3JpdHlTb3J0ZWRJdGVtRWxzW3RoaXNJdGVtUHJpb3JpdHldKSkge1xuXHRcdFx0XHRcdHByaW9yaXR5U29ydGVkSXRlbUVsc1t0aGlzSXRlbVByaW9yaXR5XSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHByaW9yaXR5U29ydGVkSXRlbUVsc1t0aGlzSXRlbVByaW9yaXR5XS5wdXNoKHRoaXNJdGVtRWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodW5wcmlvcml0aXNlZEl0ZW1FbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0cHJpb3JpdHlTb3J0ZWRJdGVtRWxzLnB1c2godW5wcmlvcml0aXNlZEl0ZW1FbHMpO1xuXHRcdH1cblx0XHRwcmlvcml0eVNvcnRlZEl0ZW1FbHMgPSBwcmlvcml0eVNvcnRlZEl0ZW1FbHMuZmlsdGVyKGZ1bmN0aW9uKHYpIHtcblx0XHRcdHJldHVybiB2ICE9PSB1bmRlZmluZWQ7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzaG93QWxsSXRlbXMoKSB7XG5cdFx0aGlkZGVuSXRlbUVscyA9IFtdO1xuXHRcdGZvciAodmFyIGMgPSAwLCBsID0gYWxsSXRlbUVscy5sZW5ndGg7IGMgPCBsOyBjKyspIHtcblx0XHRcdHNob3dFbChhbGxJdGVtRWxzW2NdKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBoaWRlSXRlbXMoZWxzKSB7XG5cdFx0aGlkZGVuSXRlbUVscyA9IGhpZGRlbkl0ZW1FbHMuY29uY2F0KGVscyk7XG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBlbHMubGVuZ3RoOyBjIDwgbDsgYysrKSB7XG5cdFx0XHRoaWRlRWwoZWxzW2NdKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRWaXNpYmxlQ29udGVudFdpZHRoKCkge1xuXHRcdHZhciB2aXNpYmxlSXRlbXNXaWR0aCA9IDA7XG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBhbGxJdGVtRWxzLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuXHRcdFx0aWYgKCFhbGxJdGVtRWxzW2NdLmhhc0F0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKSkge1xuXHRcdFx0XHR2aXNpYmxlSXRlbXNXaWR0aCArPSBhbGxJdGVtRWxzW2NdLm9mZnNldFdpZHRoOyAvLyBOZWVkcyB0byB0YWtlIGludG8gYWNjb3VudCBtYXJnaW5zIHRvb1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmlzaWJsZUl0ZW1zV2lkdGg7XG5cdH1cblxuXHRmdW5jdGlvbiBkb2VzQ29udGVudEZpdCgpIHtcblx0XHRyZXR1cm4gZ2V0VmlzaWJsZUNvbnRlbnRXaWR0aCgpIDw9IHJvb3RFbC5jbGllbnRXaWR0aDtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldEhpZGRlbkl0ZW1zKCkge1xuXHRcdHJldHVybiBoaWRkZW5JdGVtRWxzO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0UmVtYWluaW5nSXRlbXMoKSB7XG5cdFx0cmV0dXJuIGFsbEl0ZW1FbHMuZmlsdGVyKGZ1bmN0aW9uKGVsKSB7XG5cdFx0XHRyZXR1cm4gaGlkZGVuSXRlbUVscy5pbmRleE9mKGVsKSA9PT0gLTE7XG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzcXVpc2goKSB7XG5cdFx0c2hvd0FsbEl0ZW1zKCk7XG5cdFx0aWYgKGRvZXNDb250ZW50Rml0KCkpIHtcblx0XHRcdGhpZGVFbChtb3JlRWwpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRmb3IgKHZhciBwID0gcHJpb3JpdHlTb3J0ZWRJdGVtRWxzLmxlbmd0aCAtIDE7IHAgPj0gMDsgcC0tKSB7XG5cdFx0XHRcdGhpZGVJdGVtcyhwcmlvcml0eVNvcnRlZEl0ZW1FbHNbcF0pO1xuXHRcdFx0XHRpZiAoKGdldFZpc2libGVDb250ZW50V2lkdGgoKSArIG1vcmVXaWR0aCkgPD0gcm9vdEVsLmNsaWVudFdpZHRoKSB7XG5cdFx0XHRcdFx0c2hvd0VsKG1vcmVFbCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0ZGlzcGF0Y2hDdXN0b21FdmVudCgnb1NxdWlzaHlMaXN0LmNoYW5nZScsIHtcblx0XHRcdGhpZGRlbkl0ZW1zOiBnZXRIaWRkZW5JdGVtcygpLFxuXHRcdFx0cmVtYWluaW5nSXRlbXM6IGdldFJlbWFpbmluZ0l0ZW1zKClcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHJlc2l6ZUhhbmRsZXIoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KGRlYm91bmNlVGltZW91dCk7XG5cdFx0ZGVib3VuY2VUaW1lb3V0ID0gc2V0VGltZW91dChzcXVpc2gsIDUwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG5cdFx0Zm9yICh2YXIgYyA9IDAsIGwgPSBhbGxJdGVtRWxzLmxlbmd0aDsgYyA8IGw7IGMrKykge1xuXHRcdFx0YWxsSXRlbUVsc1tjXS5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG5cdFx0fVxuXHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVIYW5kbGVyLCBmYWxzZSk7XG5cdFx0cm9vdEVsLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1vLXNxdWlzaHktbGlzdC1qcycpO1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCgpIHtcblx0XHRpZiAoIXJvb3RFbCkge1xuXHRcdFx0cm9vdEVsID0gZG9jdW1lbnQuYm9keTtcblx0XHR9IGVsc2UgaWYgKCEocm9vdEVsIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKSB7XG5cdFx0XHRyb290RWwgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHJvb3RFbCk7XG5cdFx0fVxuXHRcdHJvb3RFbC5zZXRBdHRyaWJ1dGUoJ2RhdGEtby1zcXVpc2h5LWxpc3QtanMnLCAnJyk7XG5cdFx0Z2V0UHJpb3JpdHlTb3J0ZWRDaGlsZE5vZGVFbHMoKTtcblx0XHRtb3JlRWwgPSByb290RWwucXVlcnlTZWxlY3RvcignW2RhdGEtbW9yZV0nKTtcblx0XHRpZiAobW9yZUVsKSB7XG5cdFx0XHRzaG93RWwobW9yZUVsKTtcblx0XHRcdG1vcmVXaWR0aCA9IG1vcmVFbC5vZmZzZXRXaWR0aDtcblx0XHRcdGhpZGVFbChtb3JlRWwpO1xuXHRcdH1cblx0XHRzcXVpc2goKTtcblx0XHRpZiAob3B0aW9ucy5maWx0ZXJPblJlc2l6ZSkge1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIHJlc2l6ZUhhbmRsZXIsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRpbml0KCk7XG5cblx0dGhpcy5nZXRIaWRkZW5JdGVtcyA9IGdldEhpZGRlbkl0ZW1zO1xuXHR0aGlzLmdldFJlbWFpbmluZ0l0ZW1zID0gZ2V0UmVtYWluaW5nSXRlbXM7XG5cdHRoaXMuc3F1aXNoID0gc3F1aXNoO1xuXHR0aGlzLmRlc3Ryb3kgPSBkZXN0cm95O1xuXG5cdGRpc3BhdGNoQ3VzdG9tRXZlbnQoJ29TcXVpc2h5TGlzdC5yZWFkeScpO1xuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3F1aXNoeUxpc3Q7XG4iLCIvKiBnbG9iYWxzIGNvbnNvbGUgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIHRocm90dGxlID0gcmVxdWlyZSgnbG9kYXNoLW5vZGUvbW9kZXJuL2Z1bmN0aW9ucy90aHJvdHRsZScpO1xudmFyIGRlYm91bmNlID0gcmVxdWlyZSgnbG9kYXNoLW5vZGUvbW9kZXJuL2Z1bmN0aW9ucy9kZWJvdW5jZScpO1xudmFyIGRlYnVnO1xudmFyIGluaXRGbGFncyA9IHt9O1xudmFyIGludGVydmFscyA9IHtcblx0cmVzaXplOiAxMDAsXG5cdG9yaWVudGF0aW9uOiAxMDAsXG5cdHNjcm9sbDogMTAwXG59O1xuXG5mdW5jdGlvbiBicm9hZGNhc3QoZXZlbnRUeXBlLCBkYXRhKSB7XG5cdGlmIChkZWJ1Zykge1xuXHRcdGNvbnNvbGUubG9nKCdvLXZpZXdwb3J0JywgZXZlbnRUeXBlLCBkYXRhKTtcblx0fVxuXG5cdGRvY3VtZW50LmJvZHkuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ29WaWV3cG9ydC4nICsgZXZlbnRUeXBlLCB7XG5cdFx0ZGV0YWlsOiBkYXRhLFxuXHRcdGJ1YmJsZXM6IHRydWVcblx0fSkpO1xufVxuXG5mdW5jdGlvbiBnZXRPcmllbnRhdGlvbigpIHtcblx0dmFyIG9yaWVudGF0aW9uID0gd2luZG93LnNjcmVlbi5vcmllbnRhdGlvbiB8fCB3aW5kb3cuc2NyZWVuLm1vek9yaWVudGF0aW9uIHx8IHdpbmRvdy5zY3JlZW4ubXNPcmllbnRhdGlvbiB8fCB1bmRlZmluZWQ7XG5cdGlmIChvcmllbnRhdGlvbikge1xuXHRcdHJldHVybiB0eXBlb2Ygb3JpZW50YXRpb24gPT09ICdzdHJpbmcnID9cblx0XHRcdG9yaWVudGF0aW9uLnNwbGl0KCctJylbMF0gOlxuXHRcdFx0b3JpZW50YXRpb24udHlwZS5zcGxpdCgnLScpWzBdO1xuXHR9IGVsc2UgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKSB7XG5cdFx0cmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKCcob3JpZW50YXRpb246IHBvcnRyYWl0KScpLm1hdGNoZXMgPyAncG9ydHJhaXQnIDogJ2xhbmRzY2FwZSc7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodCA+PSB3aW5kb3cuaW5uZXJXaWR0aCA/ICdwb3J0cmFpdCcgOiAnbGFuZHNjYXBlJztcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTaXplKCkge1xuXHRyZXR1cm4ge1xuXHRcdGhlaWdodDogTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodCwgd2luZG93LmlubmVySGVpZ2h0IHx8IDApLFxuXHRcdHdpZHRoOiBNYXRoLm1heChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgsIHdpbmRvdy5pbm5lcldpZHRoIHx8IDApXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldFRocm90dGxlSW50ZXJ2YWwoZXZlbnRUeXBlLCBpbnRlcnZhbCkge1xuXHRpZiAodHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ251bWJlcicpIHtcblx0XHRzZXRUaHJvdHRsZUludGVydmFsKCdzY3JvbGwnLCBhcmd1bWVudHNbMF0pO1xuXHRcdHNldFRocm90dGxlSW50ZXJ2YWwoJ3Jlc2l6ZScsIGFyZ3VtZW50c1sxXSk7XG5cdFx0c2V0VGhyb3R0bGVJbnRlcnZhbCgnb3JpZW50YXRpb24nLCBhcmd1bWVudHNbMl0pO1xuXHR9IGVsc2UgaWYgKGludGVydmFsKSB7XG5cdFx0aW50ZXJ2YWxzW2V2ZW50VHlwZV0gPSBpbnRlcnZhbDtcblx0fVxufVxuXG5mdW5jdGlvbiBpbml0KGV2ZW50VHlwZSkge1xuXHRpZiAoaW5pdEZsYWdzW2V2ZW50VHlwZV0pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGluaXRGbGFnc1tldmVudFR5cGVdID0gdHJ1ZTtcblx0cmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5Ub1Jlc2l6ZSgpIHtcblxuXHRpZiAoaW5pdCgncmVzaXplJykpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZGVib3VuY2UoZnVuY3Rpb24oZXYpIHtcblx0XHRicm9hZGNhc3QoJ3Jlc2l6ZScsIHtcblx0XHRcdHZpZXdwb3J0OiBnZXRTaXplKCksXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBldlxuXHRcdH0pO1xuXHR9LCBpbnRlcnZhbHMucmVzaXplKSk7XG59XG5cbmZ1bmN0aW9uIGxpc3RlblRvT3JpZW50YXRpb24oKSB7XG5cblx0aWYgKGluaXQoJ29yaWVudGF0aW9uJykpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCBkZWJvdW5jZShmdW5jdGlvbihldikge1xuXHRcdGJyb2FkY2FzdCgnb3JpZW50YXRpb24nLCB7XG5cdFx0XHR2aWV3cG9ydDogZ2V0U2l6ZSgpLFxuXHRcdFx0b3JpZW50YXRpb246IGdldE9yaWVudGF0aW9uKCksXG5cdFx0XHRvcmlnaW5hbEV2ZW50OiBldlxuXHRcdH0pO1xuXHR9LCBpbnRlcnZhbHMub3JpZW50YXRpb24pKTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuVG9TY3JvbGwoKSB7XG5cblx0aWYgKGluaXQoJ3Njcm9sbCcpKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHRocm90dGxlKGZ1bmN0aW9uKGV2KSB7XG5cdFx0YnJvYWRjYXN0KCdzY3JvbGwnLCB7XG5cdFx0XHR2aWV3cG9ydDogZ2V0U2l6ZSgpLFxuXHRcdFx0c2Nyb2xsSGVpZ2h0OiBkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCxcblx0XHRcdHNjcm9sbExlZnQ6IChkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbExlZnQpIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsTGVmdCxcblx0XHRcdHNjcm9sbFRvcDogKGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wKSB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCxcblx0XHRcdHNjcm9sbFdpZHRoOiBkb2N1bWVudC5ib2R5LnNjcm9sbFdpZHRoLFxuXHRcdFx0b3JpZ2luYWxFdmVudDogZXZcblx0XHR9KTtcblx0fSwgaW50ZXJ2YWxzLnNjcm9sbCkpO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5UbyhldmVudFR5cGUpIHtcblx0aWYgKGV2ZW50VHlwZSA9PT0gJ3Jlc2l6ZScpIHtcblx0XHRsaXN0ZW5Ub1Jlc2l6ZSgpO1xuXHR9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gJ3Njcm9sbCcpIHtcblx0XHRsaXN0ZW5Ub1Njcm9sbCgpO1xuXHR9IGVsc2UgaWYgKGV2ZW50VHlwZSA9PT0gJ29yaWVudGF0aW9uJykge1xuXHRcdGxpc3RlblRvT3JpZW50YXRpb24oKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0ZGVidWc6IGZ1bmN0aW9uKCkge1xuXHRcdGRlYnVnID0gdHJ1ZTtcblx0fSxcblx0bGlzdGVuVG86IGxpc3RlblRvLFxuXHRzZXRUaHJvdHRsZUludGVydmFsOiBzZXRUaHJvdHRsZUludGVydmFsLFxuXHRnZXRPcmllbnRhdGlvbjogZ2V0T3JpZW50YXRpb24sXG5cdGdldFNpemU6IGdldFNpemVcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnJlcXVpcmUoJ2VzNi1wcm9taXNlJykucG9seWZpbGwoKTtcbnJlcXVpcmUoJ2lzb21vcnBoaWMtZmV0Y2gnKTtcblxudmFyIGhlYWRlciA9IHJlcXVpcmUoJ28taGVhZGVyJyk7XG5cbnZhciBhcGlIYW5kbGVyID0gcmVxdWlyZSgnLi9zcmMvanMvYXBpJyk7XG52YXIgY2hhcnQgPSByZXF1aXJlKCcuL3NyYy9qcy9jaGFydHMnKTtcbnZhciBtYXAgPSByZXF1aXJlKCcuL3NyYy9qcy9tYXBzJyk7XG5cbmZ1bmN0aW9uIGxvYWRSZXN1bHRzKHJlc3VsdHMpIHtcblx0dmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHRzLWNvbnRhaW5lcicpO1xuXHRjb250YWluZXIuaW5uZXJIVE1MID0gJyc7XG5cblx0T2JqZWN0LmtleXMocmVzdWx0cykuZm9yRWFjaChmdW5jdGlvbihmYWNldCkge1xuXHRcdHZhciByZXN1bHRCb3ggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRyZXN1bHRCb3guY2xhc3NMaXN0LmFkZCgncmVzdWx0LWJveCcpO1xuXG5cdFx0dmFyIGxpc3RUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG5cdFx0bGlzdFRpdGxlLmNsYXNzTGlzdC5hZGQoJ3Jlc3VsdC1ib3hfX3RpdGxlJyk7XG5cdFx0bGlzdFRpdGxlLnRleHRDb250ZW50ID0gZmFjZXQ7XG5cblx0XHRyZXN1bHRCb3guYXBwZW5kQ2hpbGQobGlzdFRpdGxlKTtcblxuXHRcdHZhciBmYWNldFJlc3VsdHMgPSByZXN1bHRzW2ZhY2V0XS5idWNrZXRzO1xuXG5cdFx0dmFyIGRhdGEgPSB7XG5cdFx0XHRmYWNldDogZmFjZXQsXG5cdFx0XHRuYW1lczogW10sXG5cdFx0XHRyZWFkczogW11cblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZhY2V0UmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZGF0YS5uYW1lc1tpXSA9IGZhY2V0UmVzdWx0c1tpXS52YWx1ZTtcblx0XHRcdGRhdGEucmVhZHNbaV0gPSBmYWNldFJlc3VsdHNbaV0uY291bnQ7XG5cdFx0fVxuXG5cdFx0dmFyIHJlc3VsdEVsZW1lbnQ7XG5cblx0XHRpZiAoZmFjZXQgPT09ICdjb3VudHJ5Jykge1xuXHRcdFx0cmVzdWx0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXHRcdFx0cmVzdWx0RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdyZXN1bHQtYm94X19jaGFydCcsICdyZXN1bHQtYm94X19jaGFydC0tJyArIGZhY2V0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCAnc3ZnJyk7XG5cdFx0XHRyZXN1bHRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Jlc3VsdC1ib3hfX2NoYXJ0JywgJ3Jlc3VsdC1ib3hfX2NoYXJ0LS0nICsgZmFjZXQpO1xuXHRcdH1cblxuXHRcdHJlc3VsdEJveC5hcHBlbmRDaGlsZChyZXN1bHRFbGVtZW50KTtcblxuXHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZXN1bHRCb3gpO1xuXG5cdFx0aWYgKGZhY2V0ID09PSAnY291bnRyeScpIHtcblx0XHRcdG1hcChkYXRhKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y2hhcnQoZGF0YSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaW5pdCgpIHtcblx0dmFyIGluZHVzdHJpZXNTZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWJveF9fc2VsZWN0LS1pbmR1c3RyaWVzJyk7XG5cdHZhciBjb3VudHJpZXNTZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWJveF9fc2VsZWN0LS1jb3VudHJpZXMnKTtcblx0dmFyIHBvc2l0aW9uc1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19zZWxlY3QtLXBvc2l0aW9ucycpO1xuXHR2YXIgcmVzcG9uc2liaWxpdGllc1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19zZWxlY3QtLXJlc3BvbnNpYmlsaXRpZXMnKTtcblx0dmFyIGNvbnRlbnRJbnB1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19pbnB1dC0tY29udGVudCcpO1xuXHR2YXIgY29udGVudEZhY2V0TGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19mYWNldC0tbGlzdCcpO1xuXG5cdGFwaUhhbmRsZXIuZ2V0SW5kdXN0cmllcygpXG5cdFx0LnRoZW4oZnVuY3Rpb24oaW5kdXN0cmllcykge1xuXHRcdFx0dmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXHRcdFx0b3B0aW9uLnZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0b3B0aW9uLnRleHQgPSAnLS0tLS0tLS0nO1xuXHRcdFx0aW5kdXN0cmllc1NlbGVjdC5hZGQob3B0aW9uKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpbmR1c3RyaWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdFx0b3B0aW9uLnZhbHVlID0gaW5kdXN0cmllc1tpXS5uYW1lO1xuXHRcdFx0XHRvcHRpb24udGV4dCA9IGluZHVzdHJpZXNbaV0ubmFtZTtcblx0XHRcdFx0aW5kdXN0cmllc1NlbGVjdC5hZGQob3B0aW9uKTtcblx0XHRcdH1cblx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0fSk7XG5cblx0YXBpSGFuZGxlci5nZXRDb3VudHJpZXMoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKGNvdW50cmllcykge1xuXHRcdFx0dmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXHRcdFx0b3B0aW9uLnZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0b3B0aW9uLnRleHQgPSAnLS0tLS0tLS0nO1xuXHRcdFx0Y291bnRyaWVzU2VsZWN0LmFkZChvcHRpb24pO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50cmllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IGNvdW50cmllc1tpXVsnaXNvMyddO1xuXHRcdFx0XHRvcHRpb24udGV4dCA9IGNvdW50cmllc1tpXVsnY291bnRyeSddO1xuXHRcdFx0XHRjb3VudHJpZXNTZWxlY3QuYWRkKG9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0pO1xuXG5cdGFwaUhhbmRsZXIuZ2V0UG9zaXRpb25zKClcblx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0XHRcdHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdG9wdGlvbi52YWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdG9wdGlvbi50ZXh0ID0gJy0tLS0tLS0tJztcblx0XHRcdHBvc2l0aW9uc1NlbGVjdC5hZGQob3B0aW9uKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb3NpdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXHRcdFx0XHRvcHRpb24udmFsdWUgPSBwb3NpdGlvbnNbaV0ubmFtZTtcblx0XHRcdFx0b3B0aW9uLnRleHQgPSBwb3NpdGlvbnNbaV0ubmFtZTtcblx0XHRcdFx0cG9zaXRpb25zU2VsZWN0LmFkZChvcHRpb24pO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9KTtcblxuXHRhcGlIYW5kbGVyLmdldFJlc3BvbnNpYmlsaXRpZXMoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNpYmlsaXRpZXMpIHtcblx0XHRcdHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdG9wdGlvbi52YWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdG9wdGlvbi50ZXh0ID0gJy0tLS0tLS0tJztcblx0XHRcdHJlc3BvbnNpYmlsaXRpZXNTZWxlY3QuYWRkKG9wdGlvbik7XG5cblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcmVzcG9uc2liaWxpdGllcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IHJlc3BvbnNpYmlsaXRpZXNbaV0ubmFtZTtcblx0XHRcdFx0b3B0aW9uLnRleHQgPSByZXNwb25zaWJpbGl0aWVzW2ldLm5hbWU7XG5cdFx0XHRcdHJlc3BvbnNpYmlsaXRpZXNTZWxlY3QuYWRkKG9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0pO1xuXG5cdGFwaUhhbmRsZXIuZ2V0Q29udGVudEZhY2V0cygpXG5cdFx0LnRoZW4oZnVuY3Rpb24oZmFjZXRzKSB7XG5cdFx0XHRmYWNldHMuZm9yRWFjaChmdW5jdGlvbihmYWNldCkge1xuXHRcdFx0XHR2YXIgY2hlY2tib3hXcmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cblx0XHRcdFx0dmFyIGNoZWNrYm94RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG5cdFx0XHRcdGNoZWNrYm94RWxlbWVudC50eXBlID0gJ2NoZWNrYm94Jztcblx0XHRcdFx0Y2hlY2tib3hFbGVtZW50LmlkID0gJ2NoZWNrYm94LScgKyBmYWNldDtcblx0XHRcdFx0Y2hlY2tib3hFbGVtZW50Lm5hbWUgPSBmYWNldDtcblx0XHRcdFx0Y2hlY2tib3hFbGVtZW50LnZhbHVlID0gZmFjZXQ7XG5cdFx0XHRcdGNoZWNrYm94RWxlbWVudC5jbGFzc0xpc3QuYWRkKCdvLWZvcm1zLWNoZWNrYm94Jyk7XG5cblx0XHRcdFx0dmFyIGNoZWNrYm94TGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuXHRcdFx0XHRjaGVja2JveExhYmVsLmh0bWxGb3IgPSAnY2hlY2tib3gtJyArIGZhY2V0O1xuXHRcdFx0XHRjaGVja2JveExhYmVsLnRleHRDb250ZW50ID0gZmFjZXQ7XG5cdFx0XHRcdGNoZWNrYm94TGFiZWwuY2xhc3NMaXN0LmFkZCgnby1mb3Jtcy1sYWJlbCcpO1xuXG5cdFx0XHRcdGNoZWNrYm94V3JhcHBlci5hcHBlbmRDaGlsZChjaGVja2JveEVsZW1lbnQpO1xuXHRcdFx0XHRjaGVja2JveFdyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3hMYWJlbCk7XG5cblx0XHRcdFx0Y29udGVudEZhY2V0TGlzdC5hcHBlbmRDaGlsZChjaGVja2JveFdyYXBwZXIpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cblx0dmFyIHNlYXJjaFN1Ym1pdEhhbmRsZXIgPSBmdW5jdGlvbihldikge1xuXHRcdHZhciBxdWVyeVBhcmFtcyA9IHt9O1xuXG5cdFx0aWYgKGluZHVzdHJpZXNTZWxlY3QudmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRxdWVyeVBhcmFtcy5pbmR1c3RyeSA9IGluZHVzdHJpZXNTZWxlY3QudmFsdWU7XG5cdFx0fVxuXG5cdFx0aWYgKGNvdW50cmllc1NlbGVjdC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHF1ZXJ5UGFyYW1zLmNvdW50cnkgPSBjb3VudHJpZXNTZWxlY3QudmFsdWU7XG5cdFx0fVxuXG5cdFx0aWYgKHBvc2l0aW9uc1NlbGVjdC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHF1ZXJ5UGFyYW1zLnBvc2l0aW9uID0gcG9zaXRpb25zU2VsZWN0LnZhbHVlO1xuXHRcdH1cblxuXHRcdGlmIChyZXNwb25zaWJpbGl0aWVzU2VsZWN0LnZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cXVlcnlQYXJhbXMucmVzcG9uc2liaWxpdHkgPSByZXNwb25zaWJpbGl0aWVzU2VsZWN0LnZhbHVlO1xuXHRcdH1cblxuXHRcdGlmIChjb250ZW50SW5wdXQudmFsdWUgIT09ICcnKSB7XG5cdFx0XHRxdWVyeVBhcmFtcy5jb250ZW50ID0gY29udGVudElucHV0LnZhbHVlO1xuXHRcdH1cblxuXHRcdHZhciBmYWNldHMgPSBbXTtcblxuXHRcdHZhciBmYWNldENoZWNrYm94ZXMgPSBjb250ZW50RmFjZXRMaXN0LnF1ZXJ5U2VsZWN0b3JBbGwoJy5vLWZvcm1zLWNoZWNrYm94Jyk7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGZhY2V0Q2hlY2tib3hlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKGZhY2V0Q2hlY2tib3hlc1tpXS5jaGVja2VkKSB7XG5cdFx0XHRcdGZhY2V0cy5wdXNoKGZhY2V0Q2hlY2tib3hlc1tpXS52YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0YXBpSGFuZGxlci5zZWFyY2gocXVlcnlQYXJhbXMsIGZhY2V0cylcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcblx0XHRcdFx0bG9hZFJlc3VsdHMocmVzdWx0cyk7XG5cdFx0XHR9LCBmdW5jdGlvbihlcnJvcikge1xuXHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdHZhciBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2VhcmNoLWJveF9fc3VibWl0Jyk7XG5cdHN1Ym1pdEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHNlYXJjaFN1Ym1pdEhhbmRsZXIpO1xufVxuXG5cbmluaXQoKTtcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCkge1xuXHRkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgnby5ET01Db250ZW50TG9hZGVkJykpO1xufSk7IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGJhc2VVcmwgPSAnaHR0cDovL2Z0LWRldmVsb3BtZW50LWludC5hcGlnZWUubmV0Lyc7XG52YXIgY29udGVudEZhY2V0cyA9IFsnYnJhbmQnLCAnZ2VucmUnLCAncGVvcGxlJywgJ3ByaW1hcnlfc2VjdGlvbicsICdwcmltYXJ5X3RoZW1lJywgJ3JlZ2lvbnMnLCAnc2VjdGlvbnMnLCAnc3ViamVjdHMnLCAndG9waWNzJ11cbnZhciB1c2VyRmFjZXRzID0gWydjb3VudHJ5JywgJ2luZHVzdHJ5JywgJ3Bvc2l0aW9uJywgJ3Jlc3BvbnNpYmlsaXR5J107XG5cbnZhciBhcGlIYW5kbGVyID0ge307XG5cbmFwaUhhbmRsZXIuZ2V0SW5kdXN0cmllcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgaW5kdXN0cmllc0FwaSA9ICdzdGFuZGFyZC1kYXRhL2luZHVzdHJ5LXNlY3RvcnMvbGVnYWN5Jztcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZldGNoKGJhc2VVcmwgKyBpbmR1c3RyaWVzQXBpKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGlmIChyZXMuc3RhdHVzICE9PSAyMDApIHtcblx0XHRcdFx0XHRyZWplY3QoJ2ZldGNoIGZhaWxlZCB3aXRoIHN0YXR1cyAnICsgcmVzLnN0YXR1cyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbihpbmR1c3RyaWVzKSB7XG5cdFx0XHRcdHJlc29sdmUoaW5kdXN0cmllcy5pbmR1c3RyaWVzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9KTtcblx0fSk7XG59O1xuXG5hcGlIYW5kbGVyLmdldENvdW50cmllcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgY291bnRyaWVzQXBpID0gJ3N0YW5kYXJkLWRhdGEvY291bnRyaWVzL3YxLjInO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0ZmV0Y2goYmFzZVVybCArIGNvdW50cmllc0FwaSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRpZiAocmVzLnN0YXR1cyAhPT0gMjAwKSB7XG5cdFx0XHRcdFx0cmVqZWN0KCdmZXRjaCBmYWlsZWQgd2l0aCBzdGF0dXMgJyArIHJlcy5zdGF0dXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlcy5qc29uKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oY291bnRyaWVzKSB7XG5cdFx0XHRcdHJlc29sdmUoY291bnRyaWVzLmNvdW50cmllcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0cmVqZWN0KGUpO1xuXHRcdFx0fSk7XG5cdH0pO1xufTtcblxuYXBpSGFuZGxlci5nZXRQb3NpdGlvbnMgPSBmdW5jdGlvbigpIHtcblx0dmFyIHBvc2l0aW9uc0FwaSA9ICdzdGFuZGFyZC1kYXRhL2pvYi10aXRsZXMvbGVnYWN5Jztcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZldGNoKGJhc2VVcmwgKyBwb3NpdGlvbnNBcGkpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0aWYgKHJlcy5zdGF0dXMgIT09IDIwMCkge1xuXHRcdFx0XHRcdHJlamVjdCgnZmV0Y2ggZmFpbGVkIHdpdGggc3RhdHVzICcgKyByZXMuc3RhdHVzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXMuanNvbigpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHBvc2l0aW9ucykge1xuXHRcdFx0XHRyZXNvbHZlKHBvc2l0aW9ucy5qb2JUaXRsZXMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHJlamVjdChlKTtcblx0XHRcdH0pO1xuXHR9KTtcbn07XG5cbmFwaUhhbmRsZXIuZ2V0UmVzcG9uc2liaWxpdGllcyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcmVzcG9uc2liaWxpdGllc0FwaSA9ICdzdGFuZGFyZC1kYXRhL2pvYi1yZXNwb25zaWJpbGl0aWVzL2xlZ2FjeSc7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRmZXRjaChiYXNlVXJsICsgcmVzcG9uc2liaWxpdGllc0FwaSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRpZiAocmVzLnN0YXR1cyAhPT0gMjAwKSB7XG5cdFx0XHRcdFx0cmVqZWN0KCdmZXRjaCBmYWlsZWQgd2l0aCBzdGF0dXMgJyArIHJlcy5zdGF0dXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlcy5qc29uKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2liaWxpdGllcykge1xuXHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNpYmlsaXRpZXMuam9iUmVzcG9uc2liaWxpdGllcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0cmVqZWN0KGUpO1xuXHRcdFx0fSk7XG5cdH0pO1xufTtcblxuYXBpSGFuZGxlci5nZXRDb250ZW50RmFjZXRzID0gZnVuY3Rpb24oKSB7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRyZXNvbHZlKGNvbnRlbnRGYWNldHMuY29uY2F0KHVzZXJGYWNldHMpKTtcblx0fSk7XG59O1xuXG5hcGlIYW5kbGVyLnNlYXJjaCA9IGZ1bmN0aW9uKHF1ZXJ5UGFyYW1zLCBmYWNldHMpIHtcblx0dmFyIHNlYXJjaEFwaSA9ICdmdC1yZWFkaW5nLXN0YXRzLWNsb3VkJztcblx0dmFyIHF1ZXJ5ID0gJz9xLnBhcnNlcj1zdHJ1Y3R1cmVkJnNpemU9MCc7XG5cdHZhciBmYWNldENvbmZpZyA9IGVuY29kZVVSSUNvbXBvbmVudCgne3NvcnQ6XCJjb3VudFwiLHNpemU6MTB9Jyk7XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdHZhciBwYXJhbXMgPSBPYmplY3Qua2V5cyhxdWVyeVBhcmFtcyk7XG5cdFx0aWYgKHBhcmFtcy5sZW5ndGggPT09IDApIHtcblx0XHRcdHJlamVjdCgnQXQgbGVhc3Qgb25lIHBhcmFtZXRlciBuZWVkcyB0byBiZSBzZWxlY3RlZCB0byBtYWtlIGEgc2VhcmNoLicpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRxdWVyeSArPScmcT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KCcoYW5kICcpO1xuXG5cdFx0XHRwYXJhbXMuZm9yRWFjaChmdW5jdGlvbihxdWVyeUtleSkge1xuXHRcdFx0XHRpZiAocXVlcnlLZXkgPT09ICdjb250ZW50Jykge1xuXHRcdFx0XHRcdHF1ZXJ5ICs9IGVuY29kZVVSSUNvbXBvbmVudChxdWVyeVBhcmFtc1txdWVyeUtleV0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHF1ZXJ5ICs9IFxuXHRcdFx0XHRcdFx0ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5S2V5KSArXG5cdFx0XHRcdFx0XHQnOicgK1xuXHRcdFx0XHRcdFx0ZW5jb2RlVVJJQ29tcG9uZW50KFwiJ1wiICsgcXVlcnlQYXJhbXNbcXVlcnlLZXldICsgXCInIFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdHF1ZXJ5ICs9ICcpJztcblx0XHR9XG5cblx0XHRpZiAoZmFjZXRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmVqZWN0KCdBdCBsZWFzdCBvbmUgZmFjZXQgbmVlZHMgdG8gYmUgc2VsZWN0ZWQuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZhY2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGZhY2V0KSB7XG5cdFx0XHRcdHF1ZXJ5ICs9IFxuXHRcdFx0XHRcdCcmZmFjZXQuJyArXG5cdFx0XHRcdFx0ZmFjZXQgK1xuXHRcdFx0XHRcdCc9JyArXG5cdFx0XHRcdFx0KChmYWNldCA9PT0gJ2NvdW50cnknKSA/IGZhY2V0Q29uZmlnLnJlcGxhY2UoJzEwJywgJzMwMCcpIDogZmFjZXRDb25maWcpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZmV0Y2goYmFzZVVybCArIHNlYXJjaEFwaSArIHF1ZXJ5KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGlmIChyZXMuc3RhdHVzICE9PSAyMDApIHtcblx0XHRcdFx0XHRyZWplY3QoJ2ZldGNoIGZhaWxlZCB3aXRoIHN0YXR1cyAnICsgcmVzLnN0YXR1cyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHJlcy5qc29uKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzdWx0cykge1xuXHRcdFx0XHRyZXNvbHZlKHJlc3VsdHMuZmFjZXRzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9KTtcblx0fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaUhhbmRsZXI7IiwidmFyIG1hcmdpbiA9IHt0b3A6IDQwLCByaWdodDogMTAsIGJvdHRvbTogMTAsIGxlZnQ6IDEwfTtcbnZhciB3aWR0aCA9IDU2MCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xudmFyIGhlaWdodCA9IDU0MCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZUNoYXJ0KGRhdGEpIHtcblx0dmFyIHkgPSBkMy5zY2FsZS5vcmRpbmFsKClcblx0XHQuZG9tYWluKGRhdGEubmFtZXMpXG5cdFx0LnJhbmdlUm91bmRCYW5kcyhbaGVpZ2h0LCAwXSwgLjEpO1xuXG5cdHZhciB4ID0gZDMuc2NhbGUubGluZWFyKClcblx0XHQuZG9tYWluKFswLCBkMy5tYXgoZGF0YS5yZWFkcyldKVxuXHRcdC5yYW5nZShbMCwgd2lkdGhdKTtcblxuXHR2YXIgeEF4aXMgPSBkMy5zdmcuYXhpcygpXG5cdFx0LnNjYWxlKHgpXG5cdFx0Lm9yaWVudCgndG9wJyk7XG5cblx0dmFyIGNoYXJ0ID0gZDMuc2VsZWN0KCcucmVzdWx0LWJveF9fY2hhcnQtLScgKyBkYXRhLmZhY2V0KVxuXHRcdFx0LmF0dHIoJ3dpZHRoJywgd2lkdGggKyBtYXJnaW4ubGVmdCArIG1hcmdpbi5yaWdodClcblx0XHRcdC5hdHRyKCdoZWlnaHQnLCBoZWlnaHQgKyBtYXJnaW4udG9wICsgbWFyZ2luLmJvdHRvbSlcblx0XHQuYXBwZW5kKCdnJylcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBtYXJnaW4ubGVmdCArICcsJyArIG1hcmdpbi50b3AgKyAnKScpO1xuXG5cdGNoYXJ0LmFwcGVuZCgnZycpXG5cdFx0LmF0dHIoJ2NsYXNzJywgJ3Jlc3VsdC1ib3hfX2NoYXJ0X19heGlzIHJlc3VsdC1ib3hfX2NoYXJ0X19heGlzLS14Jylcblx0XHQuY2FsbCh4QXhpcyk7XG5cblx0dmFyIGJhciA9IGNoYXJ0LnNlbGVjdEFsbCgnLnJlc3VsdC1ib3hfX2NoYXJ0X19iYXItd3JhcHBlcicpXG5cdFx0XHQuZGF0YShkYXRhLnJlYWRzKVxuXHRcdC5lbnRlcigpLmFwcGVuZCgnZycpXG5cdFx0XHQuYXR0cignY2xhc3MnLCAncmVzdWx0LWJveF9fY2hhcnRfX2Jhci13cmFwcGVyJylcblx0XHRcdC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkLCBpKSB7IHJldHVybiAndHJhbnNsYXRlKDAsJyArIGkgKiB5LnJhbmdlQmFuZCgpICsgJyknOyB9KTtcblxuXHRiYXIuYXBwZW5kKCdyZWN0Jylcblx0XHQuYXR0cignY2xhc3MnLCAncmVzdWx0LWJveF9fY2hhcnRfX2JhcicpXG5cdFx0LmF0dHIoJ3dpZHRoJywgeClcblx0XHQuYXR0cignaGVpZ2h0JywgeS5yYW5nZUJhbmQoKSAtIDEpXG5cdFx0LnN0eWxlKCdjdXJzb3InLCAncG9pbnRlcicpXG5cdFx0Lm9uKCdjbGljaycsIGZ1bmN0aW9uKGQpIHtcblx0XHRcdGRvY3VtZW50LmxvY2F0aW9uLmhyZWYgPSAnaHR0cDovL3d3dy5nb29nbGUuY29tLyc7XG5cdFx0fSk7XG5cblx0YmFyLmFwcGVuZCgndGV4dCcpXG5cdFx0LmF0dHIoJ3gnLCBtYXJnaW4ubGVmdClcblx0XHQuYXR0cigneScsIHkucmFuZ2VCYW5kKCkgLyAyKVxuXHRcdC5hdHRyKCdkeScsICcuMzVlbScpXG5cdFx0LnRleHQoZnVuY3Rpb24oZCwgaSkgeyByZXR1cm4gZGF0YS5uYW1lc1tpXTsgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuZXJhdGVDaGFydDsiLCJ2YXIgbWFyZ2luID0ge3RvcDogNDAsIHJpZ2h0OiAxMCwgYm90dG9tOiAxMCwgbGVmdDogMTB9O1xudmFyIHdpZHRoID0gNTYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG52YXIgaGVpZ2h0ID0gNDAwO1xuXG5mdW5jdGlvbiBnZW5lcmF0ZU1hcChkYXRhKSB7XG5cdHZhciBzY2FsZSA9IGQzLnNjYWxlLmxpbmVhcigpXG5cdFx0LmRvbWFpbihbMCwgZDMubWF4KGRhdGEucmVhZHMpXSlcblx0XHQucmFuZ2UoWyd5ZWxsb3cnLCAncmVkJ10pO1xuXG5cdFx0dmFyIG1hcCA9IG5ldyBEYXRhbWFwKHtcblx0XHRcdGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5yZXN1bHQtYm94X19jaGFydC0tJyArIGRhdGEuZmFjZXQpLFxuXHRcdFx0cHJvamVjdGlvbjogJ21lcmNhdG9yJyxcblx0XHRcdHdpZHRoOiB3aWR0aCxcblx0XHRcdGhlaWdodDogaGVpZ2h0LFxuXHRcdFx0ZmlsbHM6IHtcblx0XHRcdFx0ZGVmYXVsdEZpbGw6ICcjYTFkYmIyJyxcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHZhciBtYXBJbmZvID0ge307XG5cblx0XHRkYXRhLm5hbWVzLmZvckVhY2goZnVuY3Rpb24oY291bnRyeSwgaW5kZXgpIHtcblx0XHRcdG1hcEluZm9bY291bnRyeV0gPSBzY2FsZShkYXRhLnJlYWRzW2luZGV4XSk7XG5cdFx0fSk7XG5cblx0XHRtYXAudXBkYXRlQ2hvcm9wbGV0aChtYXBJbmZvKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5lcmF0ZU1hcDsiXX0=
