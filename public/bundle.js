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
},{"/Users/alberto.elias/ft/hackday-data-viz/node_modules/origami-build-tools/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":5}],2:[function(require,module,exports){
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
"use strict";

module.exports = require("./../fetch/fetch.js");

},{"./../fetch/fetch.js":2}],4:[function(require,module,exports){
"use strict";

require("./bower_components/es6-promise/promise.js").polyfill();
require("./bower_components/isomorphic-fetch/client.js");

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
			option = document.createElement("option");
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
			option = document.createElement("option");
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
			option = document.createElement("option");
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
			option = document.createElement("option");
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

},{"./bower_components/es6-promise/promise.js":1,"./bower_components/isomorphic-fetch/client.js":3,"./src/js/api":6,"./src/js/charts":7,"./src/js/maps":8}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovbm9kZV9tb2R1bGVzL29yaWdhbWktYnVpbGQtdG9vbHMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9hbGJlcnRvLmVsaWFzL2Z0L2hhY2tkYXktZGF0YS12aXovYm93ZXJfY29tcG9uZW50cy9lczYtcHJvbWlzZS9wcm9taXNlLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2ZldGNoL2ZldGNoLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ib3dlcl9jb21wb25lbnRzL2lzb21vcnBoaWMtZmV0Y2gvY2xpZW50LmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9tYWluLmpzIiwiL1VzZXJzL2FsYmVydG8uZWxpYXMvZnQvaGFja2RheS1kYXRhLXZpei9ub2RlX21vZHVsZXMvb3JpZ2FtaS1idWlsZC10b29scy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L3NyYy9qcy9hcGkuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L3NyYy9qcy9jaGFydHMuanMiLCIvVXNlcnMvYWxiZXJ0by5lbGlhcy9mdC9oYWNrZGF5LWRhdGEtdml6L3NyYy9qcy9tYXBzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7OztBQ1FBLENBQUMsWUFBVztBQUNSLGNBQVksQ0FBQztBQUNiLFdBQVMsdUNBQXVDLENBQUMsQ0FBQyxFQUFFO0FBQ2xELFdBQU8sT0FBTyxDQUFDLEtBQUssVUFBVSxJQUFLLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssSUFBSSxBQUFDLENBQUM7R0FDekU7O0FBRUQsV0FBUyxpQ0FBaUMsQ0FBQyxDQUFDLEVBQUU7QUFDNUMsV0FBTyxPQUFPLENBQUMsS0FBSyxVQUFVLENBQUM7R0FDaEM7O0FBRUQsV0FBUyxzQ0FBc0MsQ0FBQyxDQUFDLEVBQUU7QUFDakQsV0FBTyxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQztHQUM1Qzs7QUFFRCxNQUFJLCtCQUErQixDQUFDO0FBQ3BDLE1BQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFO0FBQ2xCLG1DQUErQixHQUFHLFVBQVUsQ0FBQyxFQUFFO0FBQzdDLGFBQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLGdCQUFnQixDQUFDO0tBQy9ELENBQUM7R0FDSCxNQUFNO0FBQ0wsbUNBQStCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztHQUNqRDs7QUFFRCxNQUFJLDhCQUE4QixHQUFHLCtCQUErQixDQUFDO0FBQ3JFLE1BQUkseUJBQXlCLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLE1BQUksOEJBQThCLEdBQUcsQ0FBQSxHQUFFLENBQUMsUUFBUSxDQUFDO0FBQ2pELE1BQUksK0JBQStCLENBQUM7QUFDcEMsV0FBUywwQkFBMEIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFO0FBQ2pELCtCQUEyQixDQUFDLHlCQUF5QixDQUFDLEdBQUcsUUFBUSxDQUFDO0FBQ2xFLCtCQUEyQixDQUFDLHlCQUF5QixHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztBQUNqRSw2QkFBeUIsSUFBSSxDQUFDLENBQUM7QUFDL0IsUUFBSSx5QkFBeUIsS0FBSyxDQUFDLEVBQUU7Ozs7QUFJbkMseUNBQW1DLEVBQUUsQ0FBQztLQUN2QztHQUNGOztBQUVELE1BQUksNkJBQTZCLEdBQUcsMEJBQTBCLENBQUM7O0FBRS9ELE1BQUksbUNBQW1DLEdBQUcsQUFBQyxPQUFPLE1BQU0sS0FBSyxXQUFXLEdBQUksTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUMvRixNQUFJLG1DQUFtQyxHQUFHLG1DQUFtQyxJQUFJLEVBQUUsQ0FBQztBQUNwRixNQUFJLDZDQUE2QyxHQUFHLG1DQUFtQyxDQUFDLGdCQUFnQixJQUFJLG1DQUFtQyxDQUFDLHNCQUFzQixDQUFDO0FBQ3ZLLE1BQUksNEJBQTRCLEdBQUcsT0FBTyxPQUFPLEtBQUssV0FBVyxJQUFJLENBQUEsR0FBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssa0JBQWtCLENBQUM7OztBQUd0SCxNQUFJLDhCQUE4QixHQUFHLE9BQU8saUJBQWlCLEtBQUssV0FBVyxJQUMzRSxPQUFPLGFBQWEsS0FBSyxXQUFXLElBQ3BDLE9BQU8sY0FBYyxLQUFLLFdBQVcsQ0FBQzs7O0FBR3hDLFdBQVMsaUNBQWlDLEdBQUc7QUFDM0MsUUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQzs7O0FBR2hDLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO0FBQ2hGLFFBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLEVBQUU7QUFDdkUsY0FBUSxHQUFHLFlBQVksQ0FBQztLQUN6QjtBQUNELFdBQU8sWUFBVztBQUNoQixjQUFRLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUN2QyxDQUFDO0dBQ0g7OztBQUdELFdBQVMsbUNBQW1DLEdBQUc7QUFDN0MsV0FBTyxZQUFXO0FBQ2hCLHFDQUErQixDQUFDLDJCQUEyQixDQUFDLENBQUM7S0FDOUQsQ0FBQztHQUNIOztBQUVELFdBQVMseUNBQXlDLEdBQUc7QUFDbkQsUUFBSSxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQUksUUFBUSxHQUFHLElBQUksNkNBQTZDLENBQUMsMkJBQTJCLENBQUMsQ0FBQztBQUM5RixRQUFJLElBQUksR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZDLFlBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7O0FBRWhELFdBQU8sWUFBVztBQUNoQixVQUFJLENBQUMsSUFBSSxHQUFJLFVBQVUsR0FBRyxFQUFFLFVBQVUsR0FBRyxDQUFDLEFBQUMsQ0FBQztLQUM3QyxDQUFDO0dBQ0g7OztBQUdELFdBQVMsdUNBQXVDLEdBQUc7QUFDakQsUUFBSSxPQUFPLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNuQyxXQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBRywyQkFBMkIsQ0FBQztBQUN0RCxXQUFPLFlBQVk7QUFDakIsYUFBTyxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDOUIsQ0FBQztHQUNIOztBQUVELFdBQVMsbUNBQW1DLEdBQUc7QUFDN0MsV0FBTyxZQUFXO0FBQ2hCLGdCQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUMsQ0FBQztHQUNIOztBQUVELE1BQUksMkJBQTJCLEdBQUcsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbEQsV0FBUywyQkFBMkIsR0FBRztBQUNyQyxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcseUJBQXlCLEVBQUUsQ0FBQyxJQUFFLENBQUMsRUFBRTtBQUNuRCxVQUFJLFFBQVEsR0FBRywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QyxVQUFJLEdBQUcsR0FBRywyQkFBMkIsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRTNDLGNBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7QUFFZCxpQ0FBMkIsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7QUFDM0MsaUNBQTJCLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQztLQUM5Qzs7QUFFRCw2QkFBeUIsR0FBRyxDQUFDLENBQUM7R0FDL0I7O0FBRUQsV0FBUyxtQ0FBbUMsR0FBRztBQUM3QyxRQUFJO0FBQ0YsVUFBSSxDQUFDLEdBQUcsT0FBTyxDQUFDO0FBQ2hCLFVBQUksS0FBSyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN2QixxQ0FBK0IsR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUM7QUFDeEUsYUFBTyxtQ0FBbUMsRUFBRSxDQUFDO0tBQzlDLENBQUMsT0FBTSxDQUFDLEVBQUU7QUFDVCxhQUFPLG1DQUFtQyxFQUFFLENBQUM7S0FDOUM7R0FDRjs7QUFFRCxNQUFJLG1DQUFtQyxDQUFDOztBQUV4QyxNQUFJLDRCQUE0QixFQUFFO0FBQ2hDLHVDQUFtQyxHQUFHLGlDQUFpQyxFQUFFLENBQUM7R0FDM0UsTUFBTSxJQUFJLDZDQUE2QyxFQUFFO0FBQ3hELHVDQUFtQyxHQUFHLHlDQUF5QyxFQUFFLENBQUM7R0FDbkYsTUFBTSxJQUFJLDhCQUE4QixFQUFFO0FBQ3pDLHVDQUFtQyxHQUFHLHVDQUF1QyxFQUFFLENBQUM7R0FDakYsTUFBTSxJQUFJLG1DQUFtQyxLQUFLLFNBQVMsSUFBSSxPQUFPLE9BQU8sS0FBSyxVQUFVLEVBQUU7QUFDN0YsdUNBQW1DLEdBQUcsbUNBQW1DLEVBQUUsQ0FBQztHQUM3RSxNQUFNO0FBQ0wsdUNBQW1DLEdBQUcsbUNBQW1DLEVBQUUsQ0FBQztHQUM3RTs7QUFFRCxXQUFTLCtCQUErQixHQUFHLEVBQUU7O0FBRTdDLE1BQUksa0NBQWtDLEdBQUssS0FBSyxDQUFDLENBQUM7QUFDbEQsTUFBSSxvQ0FBb0MsR0FBRyxDQUFDLENBQUM7QUFDN0MsTUFBSSxtQ0FBbUMsR0FBSSxDQUFDLENBQUM7O0FBRTdDLE1BQUkseUNBQXlDLEdBQUcsSUFBSSxzQ0FBc0MsRUFBRSxDQUFDOztBQUU3RixXQUFTLDJDQUEyQyxHQUFHO0FBQ3JELFdBQU8sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQztHQUNsRTs7QUFFRCxXQUFTLDBDQUEwQyxHQUFHO0FBQ3BELFdBQU8sSUFBSSxTQUFTLENBQUMsc0RBQXNELENBQUMsQ0FBQztHQUM5RTs7QUFFRCxXQUFTLGtDQUFrQyxDQUFDLE9BQU8sRUFBRTtBQUNuRCxRQUFJO0FBQ0YsYUFBTyxPQUFPLENBQUMsSUFBSSxDQUFDO0tBQ3JCLENBQUMsT0FBTSxLQUFLLEVBQUU7QUFDYiwrQ0FBeUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3hELGFBQU8seUNBQXlDLENBQUM7S0FDbEQ7R0FDRjs7QUFFRCxXQUFTLGtDQUFrQyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsZ0JBQWdCLEVBQUU7QUFDN0YsUUFBSTtBQUNGLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7S0FDeEQsQ0FBQyxPQUFNLENBQUMsRUFBRTtBQUNULGFBQU8sQ0FBQyxDQUFDO0tBQ1Y7R0FDRjs7QUFFRCxXQUFTLGdEQUFnRCxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ2hGLGlDQUE2QixDQUFDLFVBQVMsT0FBTyxFQUFFO0FBQy9DLFVBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNuQixVQUFJLEtBQUssR0FBRyxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQzdFLFlBQUksTUFBTSxFQUFFO0FBQUUsaUJBQU87U0FBRTtBQUN2QixjQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2QsWUFBSSxRQUFRLEtBQUssS0FBSyxFQUFFO0FBQ3RCLDRDQUFrQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztTQUNwRCxNQUFNO0FBQ0wsNENBQWtDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3BEO09BQ0YsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUNsQixZQUFJLE1BQU0sRUFBRTtBQUFFLGlCQUFPO1NBQUU7QUFDdkIsY0FBTSxHQUFHLElBQUksQ0FBQzs7QUFFZCx5Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDcEQsRUFBRSxVQUFVLElBQUksT0FBTyxDQUFDLE1BQU0sSUFBSSxrQkFBa0IsQ0FBQSxBQUFDLENBQUMsQ0FBQzs7QUFFeEQsVUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDcEIsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLHlDQUFpQyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztPQUNuRDtLQUNGLEVBQUUsT0FBTyxDQUFDLENBQUM7R0FDYjs7QUFFRCxXQUFTLDRDQUE0QyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDdkUsUUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLG9DQUFvQyxFQUFFO0FBQzVELHdDQUFrQyxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDL0QsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssbUNBQW1DLEVBQUU7QUFDakUsdUNBQWlDLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUM5RCxNQUFNO0FBQ0wsMENBQW9DLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxVQUFTLEtBQUssRUFBRTtBQUN4RSwwQ0FBa0MsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDcEQsRUFBRSxVQUFTLE1BQU0sRUFBRTtBQUNsQix5Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7T0FDcEQsQ0FBQyxDQUFDO0tBQ0o7R0FDRjs7QUFFRCxXQUFTLDhDQUE4QyxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUU7QUFDOUUsUUFBSSxhQUFhLENBQUMsV0FBVyxLQUFLLE9BQU8sQ0FBQyxXQUFXLEVBQUU7QUFDckQsa0RBQTRDLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0tBQ3RFLE1BQU07QUFDTCxVQUFJLElBQUksR0FBRyxrQ0FBa0MsQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFN0QsVUFBSSxJQUFJLEtBQUsseUNBQXlDLEVBQUU7QUFDdEQseUNBQWlDLENBQUMsT0FBTyxFQUFFLHlDQUF5QyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzdGLE1BQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQzdCLDBDQUFrQyxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztPQUM1RCxNQUFNLElBQUksaUNBQWlDLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbEQsd0RBQWdELENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztPQUNoRixNQUFNO0FBQ0wsMENBQWtDLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO09BQzVEO0tBQ0Y7R0FDRjs7QUFFRCxXQUFTLGtDQUFrQyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDMUQsUUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO0FBQ3JCLHVDQUFpQyxDQUFDLE9BQU8sRUFBRSwyQ0FBMkMsRUFBRSxDQUFDLENBQUM7S0FDM0YsTUFBTSxJQUFJLHVDQUF1QyxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQ3pELG9EQUE4QyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNoRSxNQUFNO0FBQ0wsd0NBQWtDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ3BEO0dBQ0Y7O0FBRUQsV0FBUywyQ0FBMkMsQ0FBQyxPQUFPLEVBQUU7QUFDNUQsUUFBSSxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3BCLGFBQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ25DOztBQUVELHNDQUFrQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQzdDOztBQUVELFdBQVMsa0NBQWtDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtBQUMxRCxRQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssa0NBQWtDLEVBQUU7QUFBRSxhQUFPO0tBQUU7O0FBRXRFLFdBQU8sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3hCLFdBQU8sQ0FBQyxNQUFNLEdBQUcsb0NBQW9DLENBQUM7O0FBRXRELFFBQUksT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3JDLG1DQUE2QixDQUFDLGtDQUFrQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzVFO0dBQ0Y7O0FBRUQsV0FBUyxpQ0FBaUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzFELFFBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxrQ0FBa0MsRUFBRTtBQUFFLGFBQU87S0FBRTtBQUN0RSxXQUFPLENBQUMsTUFBTSxHQUFHLG1DQUFtQyxDQUFDO0FBQ3JELFdBQU8sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOztBQUV6QixpQ0FBNkIsQ0FBQywyQ0FBMkMsRUFBRSxPQUFPLENBQUMsQ0FBQztHQUNyRjs7QUFFRCxXQUFTLG9DQUFvQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRTtBQUN2RixRQUFJLFdBQVcsR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO0FBQ3RDLFFBQUksTUFBTSxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUM7O0FBRWhDLFVBQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUV2QixlQUFXLENBQUMsTUFBTSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQzVCLGVBQVcsQ0FBQyxNQUFNLEdBQUcsb0NBQW9DLENBQUMsR0FBRyxhQUFhLENBQUM7QUFDM0UsZUFBVyxDQUFDLE1BQU0sR0FBRyxtQ0FBbUMsQ0FBQyxHQUFJLFdBQVcsQ0FBQzs7QUFFekUsUUFBSSxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEVBQUU7QUFDakMsbUNBQTZCLENBQUMsa0NBQWtDLEVBQUUsTUFBTSxDQUFDLENBQUM7S0FDM0U7R0FDRjs7QUFFRCxXQUFTLGtDQUFrQyxDQUFDLE9BQU8sRUFBRTtBQUNuRCxRQUFJLFdBQVcsR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDO0FBQ3ZDLFFBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0FBRTdCLFFBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFBRSxhQUFPO0tBQUU7O0FBRXpDLFFBQUksS0FBSztRQUFFLFFBQVE7UUFBRSxNQUFNLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQzs7QUFFOUMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUM5QyxXQUFLLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZCLGNBQVEsR0FBRyxXQUFXLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDOztBQUVwQyxVQUFJLEtBQUssRUFBRTtBQUNULGlEQUF5QyxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQzdFLE1BQU07QUFDTCxnQkFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO09BQ2xCO0tBQ0Y7O0FBRUQsV0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0dBQ2pDOztBQUVELFdBQVMsc0NBQXNDLEdBQUc7QUFDaEQsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7R0FDbkI7O0FBRUQsTUFBSSwwQ0FBMEMsR0FBRyxJQUFJLHNDQUFzQyxFQUFFLENBQUM7O0FBRTlGLFdBQVMsbUNBQW1DLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRTtBQUM3RCxRQUFJO0FBQ0YsYUFBTyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDekIsQ0FBQyxPQUFNLENBQUMsRUFBRTtBQUNULGdEQUEwQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDckQsYUFBTywwQ0FBMEMsQ0FBQztLQUNuRDtHQUNGOztBQUVELFdBQVMseUNBQXlDLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO0FBQ3JGLFFBQUksV0FBVyxHQUFHLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQztRQUN6RCxLQUFLO1FBQUUsS0FBSztRQUFFLFNBQVM7UUFBRSxNQUFNLENBQUM7O0FBRXBDLFFBQUksV0FBVyxFQUFFO0FBQ2YsV0FBSyxHQUFHLG1DQUFtQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFOUQsVUFBSSxLQUFLLEtBQUssMENBQTBDLEVBQUU7QUFDeEQsY0FBTSxHQUFHLElBQUksQ0FBQztBQUNkLGFBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO0FBQ3BCLGFBQUssR0FBRyxJQUFJLENBQUM7T0FDZCxNQUFNO0FBQ0wsaUJBQVMsR0FBRyxJQUFJLENBQUM7T0FDbEI7O0FBRUQsVUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO0FBQ3JCLHlDQUFpQyxDQUFDLE9BQU8sRUFBRSwwQ0FBMEMsRUFBRSxDQUFDLENBQUM7QUFDekYsZUFBTztPQUNSO0tBRUYsTUFBTTtBQUNMLFdBQUssR0FBRyxNQUFNLENBQUM7QUFDZixlQUFTLEdBQUcsSUFBSSxDQUFDO0tBQ2xCOztBQUVELFFBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxrQ0FBa0MsRUFBRSxFQUUxRCxNQUFNLElBQUksV0FBVyxJQUFJLFNBQVMsRUFBRTtBQUNuQyx3Q0FBa0MsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDcEQsTUFBTSxJQUFJLE1BQU0sRUFBRTtBQUNqQix1Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbkQsTUFBTSxJQUFJLE9BQU8sS0FBSyxvQ0FBb0MsRUFBRTtBQUMzRCx3Q0FBa0MsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDcEQsTUFBTSxJQUFJLE9BQU8sS0FBSyxtQ0FBbUMsRUFBRTtBQUMxRCx1Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDbkQ7R0FDRjs7QUFFRCxXQUFTLDRDQUE0QyxDQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUU7QUFDdkUsUUFBSTtBQUNGLGNBQVEsQ0FBQyxTQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUM7QUFDckMsMENBQWtDLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3BELEVBQUUsU0FBUyxhQUFhLENBQUMsTUFBTSxFQUFFO0FBQ2hDLHlDQUFpQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztPQUNwRCxDQUFDLENBQUM7S0FDSixDQUFDLE9BQU0sQ0FBQyxFQUFFO0FBQ1QsdUNBQWlDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQy9DO0dBQ0Y7O0FBRUQsV0FBUyxzQ0FBc0MsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFO0FBQ2xFLFFBQUksVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFFdEIsY0FBVSxDQUFDLG9CQUFvQixHQUFHLFdBQVcsQ0FBQztBQUM5QyxjQUFVLENBQUMsT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLCtCQUErQixDQUFDLENBQUM7O0FBRXRFLFFBQUksVUFBVSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNwQyxnQkFBVSxDQUFDLE1BQU0sR0FBTyxLQUFLLENBQUM7QUFDOUIsZ0JBQVUsQ0FBQyxNQUFNLEdBQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQztBQUNyQyxnQkFBVSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDOztBQUVyQyxnQkFBVSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUVuQixVQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzNCLDBDQUFrQyxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQzVFLE1BQU07QUFDTCxrQkFBVSxDQUFDLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQztBQUMzQyxrQkFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3hCLFlBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7QUFDL0IsNENBQWtDLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDNUU7T0FDRjtLQUNGLE1BQU07QUFDTCx1Q0FBaUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7S0FDdEY7R0FDRjs7QUFFRCx3Q0FBc0MsQ0FBQyxTQUFTLENBQUMsY0FBYyxHQUFHLFVBQVMsS0FBSyxFQUFFO0FBQ2hGLFdBQU8sOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDOUMsQ0FBQzs7QUFFRix3Q0FBc0MsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLEdBQUcsWUFBVztBQUM3RSxXQUFPLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7R0FDN0QsQ0FBQzs7QUFFRix3Q0FBc0MsQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFlBQVc7QUFDbEUsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDdkMsQ0FBQzs7QUFFRixNQUFJLG1DQUFtQyxHQUFHLHNDQUFzQyxDQUFDOztBQUVqRix3Q0FBc0MsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFlBQVc7QUFDdkUsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV0QixRQUFJLE1BQU0sR0FBSSxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ2hDLFFBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7QUFDakMsUUFBSSxLQUFLLEdBQUssVUFBVSxDQUFDLE1BQU0sQ0FBQzs7QUFFaEMsU0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLE1BQU0sS0FBSyxrQ0FBa0MsSUFBSSxDQUFDLEdBQUcsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hGLGdCQUFVLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUNwQztHQUNGLENBQUM7O0FBRUYsd0NBQXNDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxVQUFTLEtBQUssRUFBRSxDQUFDLEVBQUU7QUFDL0UsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQzs7QUFFeEMsUUFBSSxzQ0FBc0MsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUNqRCxVQUFJLEtBQUssQ0FBQyxXQUFXLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLEtBQUssa0NBQWtDLEVBQUU7QUFDbEYsYUFBSyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDdEIsa0JBQVUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3ZELE1BQU07QUFDTCxrQkFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQy9DO0tBQ0YsTUFBTTtBQUNMLGdCQUFVLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDeEIsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0tBQy9CO0dBQ0YsQ0FBQzs7QUFFRix3Q0FBc0MsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUU7QUFDdEYsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3RCLFFBQUksT0FBTyxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUM7O0FBRWpDLFFBQUksT0FBTyxDQUFDLE1BQU0sS0FBSyxrQ0FBa0MsRUFBRTtBQUN6RCxnQkFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDOztBQUV4QixVQUFJLEtBQUssS0FBSyxtQ0FBbUMsRUFBRTtBQUNqRCx5Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7T0FDbkQsTUFBTTtBQUNMLGtCQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztPQUMvQjtLQUNGOztBQUVELFFBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxDQUFDLEVBQUU7QUFDL0Isd0NBQWtDLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztLQUNqRTtHQUNGLENBQUM7O0FBRUYsd0NBQXNDLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxVQUFTLE9BQU8sRUFBRSxDQUFDLEVBQUU7QUFDcEYsUUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV0Qix3Q0FBb0MsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ3ZFLGdCQUFVLENBQUMsVUFBVSxDQUFDLG9DQUFvQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUN2RSxFQUFFLFVBQVMsTUFBTSxFQUFFO0FBQ2xCLGdCQUFVLENBQUMsVUFBVSxDQUFDLG1DQUFtQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztLQUN2RSxDQUFDLENBQUM7R0FDSixDQUFDO0FBQ0YsV0FBUyxnQ0FBZ0MsQ0FBQyxPQUFPLEVBQUU7QUFDakQsV0FBTyxJQUFJLG1DQUFtQyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUM7R0FDdkU7QUFDRCxNQUFJLG9DQUFvQyxHQUFHLGdDQUFnQyxDQUFDO0FBQzVFLFdBQVMsa0NBQWtDLENBQUMsT0FBTyxFQUFFOztBQUVuRCxRQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7O0FBRXZCLFFBQUksT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLCtCQUErQixDQUFDLENBQUM7O0FBRS9ELFFBQUksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsRUFBRTtBQUM1Qyx1Q0FBaUMsQ0FBQyxPQUFPLEVBQUUsSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFDO0FBQzdGLGFBQU8sT0FBTyxDQUFDO0tBQ2hCOztBQUVELFFBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0FBRTVCLGFBQVMsYUFBYSxDQUFDLEtBQUssRUFBRTtBQUM1Qix3Q0FBa0MsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDcEQ7O0FBRUQsYUFBUyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQzNCLHVDQUFpQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztLQUNwRDs7QUFFRCxTQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsTUFBTSxLQUFLLGtDQUFrQyxJQUFJLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEYsMENBQW9DLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO0tBQzlHOztBQUVELFdBQU8sT0FBTyxDQUFDO0dBQ2hCO0FBQ0QsTUFBSSxxQ0FBcUMsR0FBRyxrQ0FBa0MsQ0FBQztBQUMvRSxXQUFTLHdDQUF3QyxDQUFDLE1BQU0sRUFBRTs7QUFFeEQsUUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDOztBQUV2QixRQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFdBQVcsS0FBSyxXQUFXLEVBQUU7QUFDOUUsYUFBTyxNQUFNLENBQUM7S0FDZjs7QUFFRCxRQUFJLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQy9ELHNDQUFrQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNwRCxXQUFPLE9BQU8sQ0FBQztHQUNoQjtBQUNELE1BQUksd0NBQXdDLEdBQUcsd0NBQXdDLENBQUM7QUFDeEYsV0FBUyxzQ0FBc0MsQ0FBQyxNQUFNLEVBQUU7O0FBRXRELFFBQUksV0FBVyxHQUFHLElBQUksQ0FBQztBQUN2QixRQUFJLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQy9ELHFDQUFpQyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNuRCxXQUFPLE9BQU8sQ0FBQztHQUNoQjtBQUNELE1BQUksdUNBQXVDLEdBQUcsc0NBQXNDLENBQUM7O0FBRXJGLE1BQUksZ0NBQWdDLEdBQUcsQ0FBQyxDQUFDOztBQUV6QyxXQUFTLHNDQUFzQyxHQUFHO0FBQ2hELFVBQU0sSUFBSSxTQUFTLENBQUMsb0ZBQW9GLENBQUMsQ0FBQztHQUMzRzs7QUFFRCxXQUFTLGlDQUFpQyxHQUFHO0FBQzNDLFVBQU0sSUFBSSxTQUFTLENBQUMsdUhBQXVILENBQUMsQ0FBQztHQUM5STs7QUFFRCxNQUFJLGdDQUFnQyxHQUFHLGdDQUFnQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF3R3hFLFdBQVMsZ0NBQWdDLENBQUMsUUFBUSxFQUFFO0FBQ2xELFFBQUksQ0FBQyxHQUFHLEdBQUcsZ0NBQWdDLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUN6QixRQUFJLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQzs7QUFFdkIsUUFBSSwrQkFBK0IsS0FBSyxRQUFRLEVBQUU7QUFDaEQsVUFBSSxDQUFDLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQ2hELDhDQUFzQyxFQUFFLENBQUM7T0FDMUM7O0FBRUQsVUFBSSxFQUFFLElBQUksWUFBWSxnQ0FBZ0MsQ0FBQSxBQUFDLEVBQUU7QUFDdkQseUNBQWlDLEVBQUUsQ0FBQztPQUNyQzs7QUFFRCxrREFBNEMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDOUQ7R0FDRjs7QUFFRCxrQ0FBZ0MsQ0FBQyxHQUFHLEdBQUcsb0NBQW9DLENBQUM7QUFDNUUsa0NBQWdDLENBQUMsSUFBSSxHQUFHLHFDQUFxQyxDQUFDO0FBQzlFLGtDQUFnQyxDQUFDLE9BQU8sR0FBRyx3Q0FBd0MsQ0FBQztBQUNwRixrQ0FBZ0MsQ0FBQyxNQUFNLEdBQUcsdUNBQXVDLENBQUM7O0FBRWxGLGtDQUFnQyxDQUFDLFNBQVMsR0FBRztBQUMzQyxlQUFXLEVBQUUsZ0NBQWdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFtTTdDLFFBQUksRUFBRSxjQUFTLGFBQWEsRUFBRSxXQUFXLEVBQUU7QUFDekMsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTFCLFVBQUksS0FBSyxLQUFLLG9DQUFvQyxJQUFJLENBQUMsYUFBYSxJQUFJLEtBQUssS0FBSyxtQ0FBbUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNySSxlQUFPLElBQUksQ0FBQztPQUNiOztBQUVELFVBQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0FBQ2xFLFVBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7O0FBRTVCLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxRQUFRLEdBQUcsU0FBUyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztBQUNwQyxxQ0FBNkIsQ0FBQyxZQUFVO0FBQ3RDLG1EQUF5QyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1NBQzNFLENBQUMsQ0FBQztPQUNKLE1BQU07QUFDTCw0Q0FBb0MsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztPQUNqRjs7QUFFRCxhQUFPLEtBQUssQ0FBQztLQUNkOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkJELFdBQU8sRUFBRSxnQkFBUyxXQUFXLEVBQUU7QUFDN0IsYUFBTyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztLQUNyQztHQUNGLENBQUM7QUFDRixXQUFTLGtDQUFrQyxHQUFHO0FBQzVDLFFBQUksS0FBSyxDQUFDOztBQUVWLFFBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFO0FBQy9CLFdBQUssR0FBRyxNQUFNLENBQUM7S0FDbEIsTUFBTSxJQUFJLE9BQU8sSUFBSSxLQUFLLFdBQVcsRUFBRTtBQUNwQyxXQUFLLEdBQUcsSUFBSSxDQUFDO0tBQ2hCLE1BQU07QUFDSCxVQUFJO0FBQ0EsYUFBSyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO09BQ3JDLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDUixjQUFNLElBQUksS0FBSyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7T0FDL0Y7S0FDSjs7QUFFRCxRQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDOztBQUV0QixRQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssa0JBQWtCLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFO0FBQ3RGLGFBQU87S0FDUjs7QUFFRCxTQUFLLENBQUMsT0FBTyxHQUFHLGdDQUFnQyxDQUFDO0dBQ2xEO0FBQ0QsTUFBSSxpQ0FBaUMsR0FBRyxrQ0FBa0MsQ0FBQzs7QUFFM0UsTUFBSSwrQkFBK0IsR0FBRztBQUNwQyxhQUFXLGdDQUFnQztBQUMzQyxjQUFZLGlDQUFpQztHQUM5QyxDQUFDOzs7QUFHRixNQUFJLE9BQU8sTUFBTSxLQUFLLFVBQVUsSUFBSSxNQUFNLElBQU8sRUFBRTtBQUNqRCxVQUFNLENBQUMsWUFBVztBQUFFLGFBQU8sK0JBQStCLENBQUM7S0FBRSxDQUFDLENBQUM7R0FDaEUsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsSUFBSSxNQUFNLFFBQVcsRUFBRTtBQUM3RCxVQUFNLFFBQVcsR0FBRywrQkFBK0IsQ0FBQztHQUNyRCxNQUFNLElBQUksT0FBTyxJQUFJLEtBQUssV0FBVyxFQUFFO0FBQ3RDLFFBQUksV0FBYyxHQUFHLCtCQUErQixDQUFDO0dBQ3REOztBQUVELG1DQUFpQyxFQUFFLENBQUM7Q0FDdkMsQ0FBQSxDQUFFLElBQUksV0FBTSxDQUFDOzs7Ozs7Ozs7QUMzN0JkLENBQUMsWUFBVztBQUNWLGNBQVksQ0FBQzs7QUFFYixNQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7QUFDZCxXQUFNO0dBQ1A7O0FBRUQsV0FBUyxhQUFhLENBQUMsSUFBSSxFQUFFO0FBQzNCLFFBQUksT0FBTyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQzVCLFVBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDeEI7QUFDRCxRQUFJLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUMzQyxZQUFNLElBQUksU0FBUyxDQUFDLHdDQUF3QyxDQUFDLENBQUE7S0FDOUQ7QUFDRCxXQUFPLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtHQUMxQjs7QUFFRCxXQUFTLGNBQWMsQ0FBQyxLQUFLLEVBQUU7QUFDN0IsUUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7QUFDN0IsV0FBSyxHQUFHLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztLQUMxQjtBQUNELFdBQU8sS0FBSyxDQUFBO0dBQ2I7O0FBRUQsV0FBUyxPQUFPLENBQUMsT0FBTyxFQUFFO0FBQ3hCLFFBQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFBOztBQUViLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNmLFFBQUksT0FBTyxZQUFZLE9BQU8sRUFBRTtBQUM5QixhQUFPLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRTtBQUNyQyxjQUFNLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzdCLGNBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO1NBQ3pCLENBQUMsQ0FBQTtPQUNILENBQUMsQ0FBQTtLQUVILE1BQU0sSUFBSSxPQUFPLEVBQUU7QUFDbEIsWUFBTSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFTLElBQUksRUFBRTtBQUN6RCxZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtPQUNqQyxDQUFDLENBQUE7S0FDSDtHQUNGOztBQUVELFNBQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLFVBQVMsSUFBSSxFQUFFLEtBQUssRUFBRTtBQUMvQyxRQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzFCLFNBQUssR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUE7QUFDN0IsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUN6QixRQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsVUFBSSxHQUFHLEVBQUUsQ0FBQTtBQUNULFVBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFBO0tBQ3RCO0FBQ0QsUUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQTtHQUNqQixDQUFBOztBQUVELFNBQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDM0MsV0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0dBQ3JDLENBQUE7O0FBRUQsU0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDckMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQTtBQUMxQyxXQUFPLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFBO0dBQ2pDLENBQUE7O0FBRUQsU0FBTyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDeEMsV0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtHQUMzQyxDQUFBOztBQUVELFNBQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLFVBQVMsSUFBSSxFQUFFO0FBQ3JDLFdBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUE7R0FDcEQsQ0FBQTs7QUFFRCxTQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxVQUFTLElBQUksRUFBRSxLQUFLLEVBQUU7QUFDNUMsUUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO0dBQ3hELENBQUE7OztBQUdELFNBQU8sQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsUUFBUSxFQUFFO0FBQzdDLFFBQUksSUFBSSxHQUFHLElBQUksQ0FBQTtBQUNmLFVBQU0sQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsSUFBSSxFQUFFO0FBQzFELGNBQVEsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0tBQy9CLENBQUMsQ0FBQTtHQUNILENBQUE7O0FBRUQsV0FBUyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ3RCLFFBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixhQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQTtLQUNyRDtBQUNELFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0dBQ3JCOztBQUVELFdBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRTtBQUMvQixXQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxZQUFNLENBQUMsTUFBTSxHQUFHLFlBQVc7QUFDekIsZUFBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUN2QixDQUFBO0FBQ0QsWUFBTSxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQzFCLGNBQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUE7T0FDckIsQ0FBQTtLQUNGLENBQUMsQ0FBQTtHQUNIOztBQUVELFdBQVMscUJBQXFCLENBQUMsSUFBSSxFQUFFO0FBQ25DLFFBQUksTUFBTSxHQUFHLElBQUksVUFBVSxFQUFFLENBQUE7QUFDN0IsVUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzlCLFdBQU8sZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0dBQy9COztBQUVELFdBQVMsY0FBYyxDQUFDLElBQUksRUFBRTtBQUM1QixRQUFJLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFBO0FBQzdCLFVBQU0sQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdkIsV0FBTyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDL0I7O0FBRUQsTUFBSSxPQUFPLEdBQUc7QUFDWixRQUFJLEVBQUUsWUFBWSxJQUFJLElBQUksSUFBSSxNQUFNLElBQUksSUFBSSxJQUFJLENBQUMsWUFBVztBQUMxRCxVQUFJO0FBQ0YsWUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNYLGVBQU8sSUFBSSxDQUFBO09BQ1osQ0FBQyxPQUFNLENBQUMsRUFBRTtBQUNULGVBQU8sS0FBSyxDQUFBO09BQ2I7S0FDRixDQUFBLEVBQUc7QUFDSixZQUFRLEVBQUUsVUFBVSxJQUFJLElBQUk7QUFDNUIsa0JBQWMsRUFBRSxnQkFBZ0IsSUFBSSxJQUFJO0dBQ3pDLENBQUE7O0FBRUQsV0FBUyxJQUFJLEdBQUc7QUFDZCxRQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQTs7QUFFckIsUUFBSSxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ2hCLFVBQUksQ0FBQyxTQUFTLEdBQUcsVUFBUyxJQUFJLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7QUFDckIsWUFBSSxPQUFPLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDNUIsY0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7U0FDdEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDN0QsY0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUE7U0FDdEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckUsY0FBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUE7U0FDMUIsTUFBTSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ2hCLGNBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFBO1NBQ3BCLE1BQU07QUFDTCxnQkFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO1NBQzdDO09BQ0YsQ0FBQTs7QUFFRCxVQUFJLENBQUMsSUFBSSxHQUFHLFlBQVc7QUFDckIsWUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFBO0FBQzdCLFlBQUksUUFBUSxFQUFFO0FBQ1osaUJBQU8sUUFBUSxDQUFBO1NBQ2hCOztBQUVELFlBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixpQkFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN2QyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM3QixnQkFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO1NBQ3hELE1BQU07QUFDTCxpQkFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtTQUNuRDtPQUNGLENBQUE7O0FBRUQsVUFBSSxDQUFDLFdBQVcsR0FBRyxZQUFXO0FBQzVCLGVBQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO09BQy9DLENBQUE7O0FBRUQsVUFBSSxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ3JCLFlBQUksUUFBUSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQTtBQUM3QixZQUFJLFFBQVEsRUFBRTtBQUNaLGlCQUFPLFFBQVEsQ0FBQTtTQUNoQjs7QUFFRCxZQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsaUJBQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN0QyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUM3QixnQkFBTSxJQUFJLEtBQUssQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFBO1NBQ3hELE1BQU07QUFDTCxpQkFBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQTtTQUN2QztPQUNGLENBQUE7S0FDRixNQUFNO0FBQ0wsVUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFTLElBQUksRUFBRTtBQUM5QixZQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtBQUNyQixZQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRTtBQUM1QixjQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQTtTQUN0QixNQUFNLElBQUksT0FBTyxDQUFDLFFBQVEsSUFBSSxRQUFRLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNyRSxjQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQTtTQUMxQixNQUFNLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDaEIsY0FBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUE7U0FDcEIsTUFBTTtBQUNMLGdCQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUE7U0FDN0M7T0FDRixDQUFBOztBQUVELFVBQUksQ0FBQyxJQUFJLEdBQUcsWUFBVztBQUNyQixZQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDN0IsZUFBTyxRQUFRLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFBO09BQzdELENBQUE7S0FDRjs7QUFFRCxRQUFJLE9BQU8sQ0FBQyxRQUFRLEVBQUU7QUFDcEIsVUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFXO0FBQ3pCLGVBQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQTtPQUNoQyxDQUFBO0tBQ0Y7O0FBRUQsUUFBSSxDQUFDLElBQUksR0FBRyxZQUFXO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7S0FDcEMsQ0FBQTs7QUFFRCxXQUFPLElBQUksQ0FBQTtHQUNaOzs7QUFHRCxNQUFJLE9BQU8sR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUE7O0FBRWpFLFdBQVMsZUFBZSxDQUFDLE1BQU0sRUFBRTtBQUMvQixRQUFJLE9BQU8sR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDbEMsV0FBTyxBQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksT0FBTyxHQUFHLE1BQU0sQ0FBQTtHQUMxRDs7QUFFRCxXQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFO0FBQzdCLFdBQU8sR0FBRyxPQUFPLElBQUksRUFBRSxDQUFBO0FBQ3ZCLFFBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFBOztBQUVkLFFBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsSUFBSSxNQUFNLENBQUE7QUFDaEQsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUE7QUFDM0MsUUFBSSxDQUFDLE1BQU0sR0FBRyxlQUFlLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQTtBQUN0RCxRQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFBO0FBQ2hDLFFBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBOztBQUVwQixRQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUEsSUFBSyxPQUFPLENBQUMsSUFBSSxFQUFFO0FBQ3JFLFlBQU0sSUFBSSxTQUFTLENBQUMsMkNBQTJDLENBQUMsQ0FBQTtLQUNqRTtBQUNELFFBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0dBQzdCOztBQUVELFdBQVMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUNwQixRQUFJLElBQUksR0FBRyxJQUFJLFFBQVEsRUFBRSxDQUFBO0FBQ3pCLFFBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzdDLFVBQUksS0FBSyxFQUFFO0FBQ1QsWUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUM1QixZQUFJLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUM1QyxZQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUE7QUFDL0MsWUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBO09BQ2pFO0tBQ0YsQ0FBQyxDQUFBO0FBQ0YsV0FBTyxJQUFJLENBQUE7R0FDWjs7QUFFRCxXQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUU7QUFDcEIsUUFBSSxJQUFJLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQTtBQUN4QixRQUFJLEtBQUssR0FBRyxHQUFHLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDMUQsU0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUM3QixVQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3BDLFVBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQTtBQUM5QixVQUFJLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFBO0FBQ2xDLFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFBO0tBQ3hCLENBQUMsQ0FBQTtBQUNGLFdBQU8sSUFBSSxDQUFBO0dBQ1o7O0FBRUQsU0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEdBQUcsWUFBVztBQUNuQyxRQUFJLElBQUksR0FBRyxJQUFJLENBQUE7O0FBRWYsV0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDM0MsVUFBSSxVQUFVLEdBQUcsS0FBSyxDQUFDO0FBQ3ZCLFVBQUksT0FBTyxDQUFDLGNBQWMsRUFBRTtBQUMxQixZQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO0FBQ3RELFlBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTs7QUFDOUIsb0JBQVUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFBLENBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssTUFBTSxDQUFDO1NBQ3hIO09BQ0Y7QUFDRCxVQUFJLEdBQUcsR0FBRyxVQUFVLEdBQUcsSUFBSSxjQUFjLEVBQUUsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFBOztBQUVsRSxVQUFJLFVBQVUsRUFBRTtBQUNkLFdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxZQUFXO0FBQ3JDLGlCQUFPLGdCQUFnQixHQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUM7U0FDekMsQ0FBQztPQUNILE1BQU0sSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtBQUN0QyxXQUFHLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQztPQUM1Qjs7QUFFRCxlQUFTLFdBQVcsR0FBRztBQUNyQixZQUFJLGFBQWEsSUFBSSxHQUFHLEVBQUU7QUFDeEIsaUJBQU8sR0FBRyxDQUFDLFdBQVcsQ0FBQTtTQUN2Qjs7O0FBR0QsWUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtBQUN4RCxpQkFBTyxHQUFHLENBQUMsaUJBQWlCLENBQUMsZUFBZSxDQUFDLENBQUE7U0FDOUM7O0FBRUQsZUFBTztPQUNSOztBQUVELFNBQUcsQ0FBQyxNQUFNLEdBQUcsWUFBVztBQUN0QixZQUFJLE1BQU0sR0FBRyxBQUFDLEdBQUcsQ0FBQyxNQUFNLEtBQUssSUFBSSxHQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFBOzs7QUFHckQsWUFBSSxVQUFVLEVBQUU7QUFDZCxnQkFBTSxHQUFHLEdBQUcsQ0FBQztTQUNkO0FBQ0QsWUFBSSxNQUFNLEdBQUcsR0FBRyxJQUFJLE1BQU0sR0FBRyxHQUFHLEVBQUU7QUFDaEMsZ0JBQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7QUFDL0MsaUJBQU07U0FDUDtBQUNELFlBQUksT0FBTyxHQUFHO0FBQ1osZ0JBQU0sRUFBRSxNQUFNO0FBQ2Qsb0JBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTtBQUMxQixpQkFBTyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDckIsYUFBRyxFQUFFLFdBQVcsRUFBRTtTQUNuQixDQUFBO0FBQ0QsWUFBSSxJQUFJLEdBQUcsVUFBVSxJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7QUFDL0QsZUFBTyxDQUFDLElBQUksUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFBO09BQ3JDLENBQUE7O0FBRUQsU0FBRyxDQUFDLE9BQU8sR0FBRyxZQUFXO0FBQ3ZCLGNBQU0sQ0FBQyxJQUFJLFNBQVMsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUE7T0FDaEQsQ0FBQTs7QUFFRCxTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQTs7QUFFckMsVUFBSSxjQUFjLElBQUksR0FBRyxJQUFJLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDekMsV0FBRyxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUE7T0FDMUI7O0FBRUQsVUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUUsTUFBTSxFQUFFO0FBQzFDLGNBQU0sQ0FBQyxPQUFPLENBQUMsVUFBUyxLQUFLLEVBQUU7QUFDN0IsYUFBRyxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtTQUNsQyxDQUFDLENBQUE7T0FDSCxDQUFDLENBQUE7O0FBRUYsU0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFTLEtBQUssV0FBVyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUE7S0FDeEUsQ0FBQyxDQUFBO0dBQ0gsQ0FBQTs7QUFFRCxNQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQTs7QUFFNUIsV0FBUyxRQUFRLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRTtBQUNuQyxRQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osYUFBTyxHQUFHLEVBQUUsQ0FBQTtLQUNiOztBQUVELFFBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDeEIsUUFBSSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUE7QUFDckIsUUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUE7QUFDZixRQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUE7QUFDNUIsUUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQTtBQUNqRCxRQUFJLENBQUMsVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUE7QUFDcEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFBO0FBQzlCLFFBQUksQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUE7R0FDN0I7O0FBRUQsTUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUE7O0FBRTdCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUV6QixNQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxFQUFFLE9BQU8sRUFBRTtBQUNuQyxXQUFPLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQTtHQUN6QyxDQUFBO0FBQ0QsTUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFBO0NBQzNCLENBQUEsRUFBRyxDQUFDOzs7OztBQ3pXTCxNQUFNLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7O0FDQWxDLFlBQVksQ0FBQzs7QUFFYixPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDbEMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7O0FBRTVCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN6QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN2QyxJQUFJLEdBQUcsR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRW5DLFNBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRTtBQUM3QixLQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDN0QsVUFBUyxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7O0FBRXpCLE9BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzVDLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsV0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXRDLE1BQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDN0MsV0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM3QyxXQUFTLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQzs7QUFFOUIsV0FBUyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7QUFFakMsTUFBSSxZQUFZLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQzs7QUFFMUMsTUFBSSxJQUFJLEdBQUc7QUFDVixRQUFLLEVBQUUsS0FBSztBQUNaLFFBQUssRUFBRSxFQUFFO0FBQ1QsUUFBSyxFQUFFLEVBQUU7R0FDVCxDQUFDOztBQUVGLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdDLE9BQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN0QyxPQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7R0FDdEM7O0FBRUQsTUFBSSxhQUFhLENBQUM7O0FBRWxCLE1BQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtBQUN4QixnQkFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsZ0JBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxDQUFDO0dBQ2hGLE1BQU07QUFDTixnQkFBYSxHQUFHLFFBQVEsQ0FBQyxlQUFlLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDOUUsZ0JBQWEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxDQUFDO0dBQ2hGOztBQUVELFdBQVMsQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7O0FBRXJDLFdBQVMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7O0FBRWpDLE1BQUksS0FBSyxLQUFLLFNBQVMsRUFBRTtBQUN4QixNQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDVixNQUFNO0FBQ04sUUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQ1o7RUFDRCxDQUFDLENBQUM7Q0FDSDs7QUFFRCxTQUFTLElBQUksR0FBRztBQUNmLEtBQUksZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO0FBQ2pGLEtBQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZ0NBQWdDLENBQUMsQ0FBQztBQUMvRSxLQUFJLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7QUFDL0UsS0FBSSxzQkFBc0IsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHVDQUF1QyxDQUFDLENBQUM7QUFDN0YsS0FBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDO0FBQ3pFLEtBQUksZ0JBQWdCLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDOztBQUUxRSxXQUFVLENBQUMsYUFBYSxFQUFFLENBQ3hCLElBQUksQ0FBQyxVQUFTLFVBQVUsRUFBRTtBQUMxQixNQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLFFBQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ3pCLFFBQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0FBQ3pCLGtCQUFnQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFN0IsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0MsU0FBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsU0FBTSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2xDLFNBQU0sQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNqQyxtQkFBZ0IsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDN0I7RUFDRCxFQUFFLFVBQVMsS0FBSyxFQUFFO0FBQ2xCLFFBQU0sS0FBSyxDQUFDO0VBQ1osQ0FBQyxDQUFDOztBQUVKLFdBQVUsQ0FBQyxZQUFZLEVBQUUsQ0FDdkIsSUFBSSxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ3pCLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsUUFBTSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7QUFDekIsUUFBTSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7QUFDekIsaUJBQWUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRTVCLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFNBQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLFNBQU0sQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFRLENBQUM7QUFDcEMsU0FBTSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVcsQ0FBQztBQUN0QyxrQkFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1QjtFQUNELEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEIsUUFBTSxLQUFLLENBQUM7RUFDWixDQUFDLENBQUM7O0FBRUosV0FBVSxDQUFDLFlBQVksRUFBRSxDQUN2QixJQUFJLENBQUMsVUFBUyxTQUFTLEVBQUU7QUFDekIsTUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUM5QyxRQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztBQUN6QixRQUFNLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztBQUN6QixpQkFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7QUFFNUIsT0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsU0FBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDMUMsU0FBTSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ2pDLFNBQU0sQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNoQyxrQkFBZSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUM1QjtFQUNELEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEIsUUFBTSxLQUFLLENBQUM7RUFDWixDQUFDLENBQUM7O0FBRUosV0FBVSxDQUFDLG1CQUFtQixFQUFFLENBQzlCLElBQUksQ0FBQyxVQUFTLGdCQUFnQixFQUFFO0FBQ2hDLE1BQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsUUFBTSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7QUFDekIsUUFBTSxDQUFDLElBQUksR0FBRyxVQUFVLENBQUM7QUFDekIsd0JBQXNCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVuQyxPQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2pELFNBQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFDLFNBQU0sQ0FBQyxLQUFLLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3hDLFNBQU0sQ0FBQyxJQUFJLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLHlCQUFzQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNuQztFQUNELEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEIsUUFBTSxLQUFLLENBQUM7RUFDWixDQUFDLENBQUM7O0FBRUosV0FBVSxDQUFDLGdCQUFnQixFQUFFLENBQzNCLElBQUksQ0FBQyxVQUFTLE1BQU0sRUFBRTtBQUN0QixRQUFNLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzlCLE9BQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRXBELE9BQUksZUFBZSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdEQsa0JBQWUsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0FBQ2xDLGtCQUFlLENBQUMsRUFBRSxHQUFHLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDekMsa0JBQWUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQzdCLGtCQUFlLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUM5QixrQkFBZSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQzs7QUFFbEQsT0FBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRCxnQkFBYSxDQUFDLE9BQU8sR0FBRyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQzVDLGdCQUFhLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUNsQyxnQkFBYSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTdDLGtCQUFlLENBQUMsV0FBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzdDLGtCQUFlLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztBQUUzQyxtQkFBZ0IsQ0FBQyxXQUFXLENBQUMsZUFBZSxDQUFDLENBQUM7R0FDOUMsQ0FBQyxDQUFDO0VBQ0gsQ0FBQyxDQUFDOztBQUVKLEtBQUksbUJBQW1CLEdBQUcsNkJBQVMsRUFBRSxFQUFFO0FBQ3RDLE1BQUksV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFckIsTUFBSSxnQkFBZ0IsQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO0FBQzNDLGNBQVcsQ0FBQyxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsS0FBSyxDQUFDO0dBQzlDOztBQUVELE1BQUksZUFBZSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7QUFDMUMsY0FBVyxDQUFDLE9BQU8sR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO0dBQzVDOztBQUVELE1BQUksZUFBZSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7QUFDMUMsY0FBVyxDQUFDLFFBQVEsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFDO0dBQzdDOztBQUVELE1BQUksc0JBQXNCLENBQUMsS0FBSyxLQUFLLFdBQVcsRUFBRTtBQUNqRCxjQUFXLENBQUMsY0FBYyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQztHQUMxRDs7QUFFRCxNQUFJLFlBQVksQ0FBQyxLQUFLLEtBQUssRUFBRSxFQUFFO0FBQzlCLGNBQVcsQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztHQUN6Qzs7QUFFRCxNQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWhCLE1BQUksZUFBZSxHQUFHLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLG1CQUFtQixDQUFDLENBQUM7O0FBRTdFLE9BQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ2hELE9BQUksZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRTtBQUMvQixVQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN0QztHQUNEOztBQUVELFlBQVUsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUNwQyxJQUFJLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDdkIsY0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ3JCLEVBQUUsVUFBUyxLQUFLLEVBQUU7QUFDbEIsU0FBTSxLQUFLLENBQUM7R0FDWixDQUFDLENBQUM7RUFDSixDQUFDOztBQUVGLEtBQUksWUFBWSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNqRSxhQUFZLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLG1CQUFtQixDQUFDLENBQUM7Q0FDNUQ7O0FBR0QsSUFBSSxFQUFFLENBQUM7O0FBRVAsUUFBUSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLFlBQVc7QUFDeEQsU0FBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUM7Q0FDOUQsQ0FBQyxDQUFDOzs7QUNoTkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBLFlBQVksQ0FBQzs7QUFFYixJQUFJLE9BQU8sR0FBRyx1Q0FBdUMsQ0FBQztBQUN0RCxJQUFJLGFBQWEsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLGlCQUFpQixFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUNsSSxJQUFJLFVBQVUsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7O0FBRXZFLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQzs7QUFFcEIsVUFBVSxDQUFDLGFBQWEsR0FBRyxZQUFXO0FBQ3JDLEtBQUksYUFBYSxHQUFHLHVDQUF1QyxDQUFDO0FBQzVELFFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLE9BQUssQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDLENBQzVCLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixPQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLFVBQU0sQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQ7O0FBRUQsVUFBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDbEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFTLFVBQVUsRUFBRTtBQUMxQixVQUFPLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0dBQy9CLENBQUMsU0FDSSxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ2xCLFNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQztFQUNKLENBQUMsQ0FBQztDQUNILENBQUM7O0FBRUYsVUFBVSxDQUFDLFlBQVksR0FBRyxZQUFXO0FBQ3BDLEtBQUksWUFBWSxHQUFHLDhCQUE4QixDQUFDO0FBQ2xELFFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLE9BQUssQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQzNCLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixPQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLFVBQU0sQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQ7O0FBRUQsVUFBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDbEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6QixVQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzdCLENBQUMsU0FDSSxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ2xCLFNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQztFQUNKLENBQUMsQ0FBQztDQUNILENBQUM7O0FBRUYsVUFBVSxDQUFDLFlBQVksR0FBRyxZQUFXO0FBQ3BDLEtBQUksWUFBWSxHQUFHLGlDQUFpQyxDQUFDO0FBQ3JELFFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLE9BQUssQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFDLENBQzNCLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixPQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLFVBQU0sQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQ7O0FBRUQsVUFBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDbEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFTLFNBQVMsRUFBRTtBQUN6QixVQUFPLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0dBQzdCLENBQUMsU0FDSSxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ2xCLFNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQztFQUNKLENBQUMsQ0FBQztDQUNILENBQUM7O0FBRUYsVUFBVSxDQUFDLG1CQUFtQixHQUFHLFlBQVc7QUFDM0MsS0FBSSxtQkFBbUIsR0FBRywyQ0FBMkMsQ0FBQztBQUN0RSxRQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxPQUFLLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDLENBQ2xDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNuQixPQUFJLEdBQUcsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFO0FBQ3ZCLFVBQU0sQ0FBQywyQkFBMkIsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQ7O0FBRUQsVUFBTyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDbEIsQ0FBQyxDQUNELElBQUksQ0FBQyxVQUFTLGdCQUFnQixFQUFFO0FBQ2hDLFVBQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0dBQzlDLENBQUMsU0FDSSxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ2xCLFNBQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztHQUNWLENBQUMsQ0FBQztFQUNKLENBQUMsQ0FBQztDQUNILENBQUM7O0FBRUYsVUFBVSxDQUFDLGdCQUFnQixHQUFHLFlBQVc7QUFDeEMsUUFBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDNUMsU0FBTyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztFQUMxQyxDQUFDLENBQUM7Q0FDSCxDQUFDOztBQUVGLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBUyxXQUFXLEVBQUUsTUFBTSxFQUFFO0FBQ2pELEtBQUksU0FBUyxHQUFHLHdCQUF3QixDQUFDO0FBQ3pDLEtBQUksS0FBSyxHQUFHLDZCQUE2QixDQUFDO0FBQzFDLEtBQUksV0FBVyxHQUFHLGtCQUFrQixDQUFDLDBCQUF3QixDQUFDLENBQUM7O0FBRS9ELFFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLE1BQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEMsTUFBSSxNQUFNLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN4QixTQUFNLENBQUMsK0RBQStELENBQUMsQ0FBQztHQUN4RSxNQUFNO0FBQ04sUUFBSyxJQUFHLEtBQUssR0FBRyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFNUMsU0FBTSxDQUFDLE9BQU8sQ0FBQyxVQUFTLFFBQVEsRUFBRTtBQUNqQyxRQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7QUFDM0IsVUFBSyxJQUFJLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0tBQ25ELE1BQU07QUFDTixVQUFLLElBQ0osa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQzVCLEdBQUcsR0FDSCxrQkFBa0IsQ0FBQyxHQUFHLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ3hEO0lBQ0QsQ0FBQyxDQUFDOztBQUVILFFBQUssSUFBSSxHQUFHLENBQUM7R0FDYjs7QUFFRCxNQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLFNBQU0sQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO0dBQ25ELE1BQU07QUFDTixTQUFNLENBQUMsT0FBTyxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQzlCLFNBQUssSUFDSixTQUFTLEdBQ1QsS0FBSyxHQUNMLEdBQUcsSUFDRixBQUFDLEtBQUssS0FBSyxTQUFTLEdBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEdBQUcsV0FBVyxDQUFBLEFBQUMsQ0FBQztJQUMxRSxDQUFDLENBQUM7R0FDSDs7QUFFRCxPQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsR0FBRyxLQUFLLENBQUMsQ0FDaEMsSUFBSSxDQUFDLFVBQVMsR0FBRyxFQUFFO0FBQ25CLE9BQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUU7QUFDdkIsVUFBTSxDQUFDLDJCQUEyQixHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqRDtBQUNELFVBQU8sR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ2xCLENBQUMsQ0FDRCxJQUFJLENBQUMsVUFBUyxPQUFPLEVBQUU7QUFDdkIsVUFBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUN4QixDQUFDLFNBQ0ksQ0FBQyxVQUFTLENBQUMsRUFBRTtBQUNsQixTQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDVixDQUFDLENBQUM7RUFDSixDQUFDLENBQUM7Q0FDSCxDQUFDOztBQUVGLE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDOzs7OztBQ3BKNUIsSUFBSSxNQUFNLEdBQUcsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDeEQsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QyxJQUFJLE1BQU0sR0FBRyxHQUFHLEdBQUcsTUFBTSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUU5QyxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUU7QUFDNUIsS0FBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FDbEIsZUFBZSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUUsQ0FBQyxDQUFDOztBQUVuQyxLQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUN2QixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUMvQixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFcEIsS0FBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FDdkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUNSLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7QUFFaEIsS0FBSSxLQUFLLEdBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQ3ZELElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUNqRCxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDcEQsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUNWLElBQUksQ0FBQyxXQUFXLEVBQUUsWUFBWSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7O0FBRTFFLE1BQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ2YsSUFBSSxDQUFDLE9BQU8sRUFBRSxvREFBb0QsQ0FBQyxDQUNuRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRWQsS0FBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUN6RCxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUNqQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQ2xCLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0NBQWdDLENBQUMsQ0FDL0MsSUFBSSxDQUFDLFdBQVcsRUFBRSxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFBRSxTQUFPLGNBQWMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLEdBQUcsQ0FBQztFQUFFLENBQUMsQ0FBQzs7QUFFMUYsSUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDaEIsSUFBSSxDQUFDLE9BQU8sRUFBRSx3QkFBd0IsQ0FBQyxDQUN2QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUNoQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FDakMsS0FBSyxDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FDMUIsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFTLENBQUMsRUFBRTtBQUN4QixVQUFRLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyx3QkFBd0IsQ0FBQztFQUNsRCxDQUFDLENBQUM7O0FBRUosSUFBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FDaEIsSUFBSSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQ3RCLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUM1QixJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUNuQixJQUFJLENBQUMsVUFBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQUUsU0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQUUsQ0FBQyxDQUFDO0NBQ2pEOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDOzs7OztBQ2pEL0IsSUFBSSxNQUFNLEdBQUcsRUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDeEQsSUFBSSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUM3QyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7O0FBRWpCLFNBQVMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUMxQixLQUFJLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUMzQixNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUMvQixLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQzs7QUFFMUIsS0FBSSxHQUFHLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDckIsU0FBTyxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztBQUNwRSxZQUFVLEVBQUUsVUFBVTtBQUN0QixPQUFLLEVBQUUsS0FBSztBQUNaLFFBQU0sRUFBRSxNQUFNO0FBQ2QsT0FBSyxFQUFFO0FBQ04sY0FBVyxFQUFFLFNBQVMsRUFDdEI7RUFDRCxDQUFDLENBQUM7O0FBRUgsS0FBSSxPQUFPLEdBQUcsRUFBRSxDQUFDOztBQUVqQixLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxLQUFLLEVBQUU7QUFDM0MsU0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7RUFDNUMsQ0FBQyxDQUFDOztBQUVILElBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztDQUMvQjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAyLjEuMFxuICovXG5cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgeCA9PT0gJ2Z1bmN0aW9uJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzTWF5YmVUaGVuYWJsZSh4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIHggPT09ICdvYmplY3QnICYmIHggIT09IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5ID0gZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSR1dGlscyQkX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkgPSBsaWIkZXM2JHByb21pc2UkdXRpbHMkJF9pc0FycmF5O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQ7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2xpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW5dID0gY2FsbGJhY2s7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArIDFdID0gYXJnO1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiArPSAyO1xuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDIsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRzY2hlZHVsZUZsdXNoKCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJGFzYXAkJGFzYXA7XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpID8gd2luZG93IDogdW5kZWZpbmVkO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyV2luZG93IHx8IHt9O1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIgPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYnJvd3Nlckdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRpc05vZGUgPSB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYge30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nO1xuXG4gICAgLy8gdGVzdCBmb3Igd2ViIHdvcmtlciBidXQgbm90IGluIElFMTBcbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VOZXh0VGljaygpIHtcbiAgICAgIHZhciBuZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgICAvLyBub2RlIHZlcnNpb24gMC4xMC54IGRpc3BsYXlzIGEgZGVwcmVjYXRpb24gd2FybmluZyB3aGVuIG5leHRUaWNrIGlzIHVzZWQgcmVjdXJzaXZlbHlcbiAgICAgIC8vIHNldEltbWVkaWF0ZSBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkIGluc3RlYWRcbiAgICAgIHZhciB2ZXJzaW9uID0gcHJvY2Vzcy52ZXJzaW9ucy5ub2RlLm1hdGNoKC9eKD86KFxcZCspXFwuKT8oPzooXFxkKylcXC4pPyhcXCp8XFxkKykkLyk7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh2ZXJzaW9uKSAmJiB2ZXJzaW9uWzFdID09PSAnMCcgJiYgdmVyc2lvblsyXSA9PT0gJzEwJykge1xuICAgICAgICBuZXh0VGljayA9IHNldEltbWVkaWF0ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbmV4dFRpY2sobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gdmVydHhcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlVmVydHhUaW1lcigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHZlcnR4TmV4dChsaWIkZXM2JHByb21pc2UkYXNhcCQkZmx1c2gpO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBsaWIkZXM2JHByb21pc2UkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIobGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKTtcbiAgICAgIHZhciBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShub2RlLCB7IGNoYXJhY3RlckRhdGE6IHRydWUgfSk7XG5cbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbm9kZS5kYXRhID0gKGl0ZXJhdGlvbnMgPSArK2l0ZXJhdGlvbnMgJSAyKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgLy8gd2ViIHdvcmtlclxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaDtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGxpYiRlczYkcHJvbWlzZSRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWUgPSBuZXcgQXJyYXkoMTAwMCk7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGZsdXNoKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaWIkZXM2JHByb21pc2UkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpXTtcbiAgICAgICAgdmFyIGFyZyA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCRxdWV1ZVtpKzFdO1xuXG4gICAgICAgIGNhbGxiYWNrKGFyZyk7XG5cbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkcXVldWVbaSsxXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGxlbiA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJGFzYXAkJGF0dGVtcHRWZXJ0ZXgoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgciA9IHJlcXVpcmU7XG4gICAgICAgIHZhciB2ZXJ0eCA9IHIoJ3ZlcnR4Jyk7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCR2ZXJ0eE5leHQgPSB2ZXJ0eC5ydW5Pbkxvb3AgfHwgdmVydHgucnVuT25Db250ZXh0O1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVZlcnR4VGltZXIoKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2g7XG4gICAgLy8gRGVjaWRlIHdoYXQgYXN5bmMgbWV0aG9kIHRvIHVzZSB0byB0cmlnZ2VyaW5nIHByb2Nlc3Npbmcgb2YgcXVldWVkIGNhbGxiYWNrczpcbiAgICBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzTm9kZSkge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTmV4dFRpY2soKTtcbiAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGlzV29ya2VyKSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpO1xuICAgIH0gZWxzZSBpZiAobGliJGVzNiRwcm9taXNlJGFzYXAkJGJyb3dzZXJXaW5kb3cgPT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkZXM2JHByb21pc2UkYXNhcCQkYXR0ZW1wdFZlcnRleCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRlczYkcHJvbWlzZSRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCgpIHt9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORyAgID0gdm9pZCAwO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQgPSAxO1xuICAgIHZhciBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCAgPSAyO1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SID0gbmV3IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzZWxmRnVsbGZpbGxtZW50KCkge1xuICAgICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGNhbm5vdFJldHVybk93bigpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZ2V0VGhlbihwcm9taXNlKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gcHJvbWlzZS50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkR0VUX1RIRU5fRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5VGhlbih0aGVuLCB2YWx1ZSwgZnVsZmlsbG1lbnRIYW5kbGVyLCByZWplY3Rpb25IYW5kbGVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcik7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGRlZmF1bHQoZnVuY3Rpb24ocHJvbWlzZSkge1xuICAgICAgICB2YXIgc2VhbGVkID0gZmFsc2U7XG4gICAgICAgIHZhciBlcnJvciA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdGhlbmFibGUsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgaWYgKHNlYWxlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICBzZWFsZWQgPSB0cnVlO1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcblxuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9LCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCB0aGVuYWJsZSkge1xuICAgICAgaWYgKHRoZW5hYmxlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2UgaWYgKHByb21pc2UuX3N0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUodGhlbmFibGUsIHVuZGVmaW5lZCwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSkge1xuICAgICAgaWYgKG1heWJlVGhlbmFibGUuY29uc3RydWN0b3IgPT09IHByb21pc2UuY29uc3RydWN0b3IpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgdGhlbiA9IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGdldFRoZW4obWF5YmVUaGVuYWJsZSk7XG5cbiAgICAgICAgaWYgKHRoZW4gPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SLmVycm9yKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGVuID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbih0aGVuKSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZUZvcmVpZ25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzZWxmRnVsbGZpbGxtZW50KCkpO1xuICAgICAgfSBlbHNlIGlmIChsaWIkZXM2JHByb21pc2UkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGhhbmRsZU1heWJlVGhlbmFibGUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25lcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbmVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSkge1xuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEO1xuXG4gICAgICBpZiAocHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoICE9PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRkZWZhdWx0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2gsIHByb21pc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykgeyByZXR1cm47IH1cbiAgICAgIHByb21pc2UuX3N0YXRlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQ7XG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSByZWFzb247XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSRhc2FwJCRkZWZhdWx0KGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHB1Ymxpc2hSZWplY3Rpb24sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25lcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEZVTEZJTExFRF0gPSBvbkZ1bGZpbGxtZW50O1xuICAgICAgc3Vic2NyaWJlcnNbbGVuZ3RoICsgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURURdICA9IG9uUmVqZWN0aW9uO1xuXG4gICAgICBpZiAobGVuZ3RoID09PSAwICYmIHBhcmVudC5fc3RhdGUpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJGFzYXAkJGRlZmF1bHQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcHVibGlzaCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRwdWJsaXNoKHByb21pc2UpIHtcbiAgICAgIHZhciBzdWJzY3JpYmVycyA9IHByb21pc2UuX3N1YnNjcmliZXJzO1xuICAgICAgdmFyIHNldHRsZWQgPSBwcm9taXNlLl9zdGF0ZTtcblxuICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFjayhkZXRhaWwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHByb21pc2UuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKSB7XG4gICAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SID0gbmV3IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gY2FsbGJhY2soZGV0YWlsKTtcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgICAgICByZXR1cm4gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHNldHRsZWQsIHByb21pc2UsIGNhbGxiYWNrLCBkZXRhaWwpIHtcbiAgICAgIHZhciBoYXNDYWxsYmFjayA9IGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgIHZhbHVlID0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCk7XG5cbiAgICAgICAgaWYgKHZhbHVlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IpIHtcbiAgICAgICAgICBmYWlsZWQgPSB0cnVlO1xuICAgICAgICAgIGVycm9yID0gdmFsdWUuZXJyb3I7XG4gICAgICAgICAgdmFsdWUgPSBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkY2Fubm90UmV0dXJuT3duKCkpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IGRldGFpbDtcbiAgICAgICAgc3VjY2VlZGVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByb21pc2UuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIC8vIG5vb3BcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChmYWlsZWQpIHtcbiAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGVycm9yKTtcbiAgICAgIH0gZWxzZSBpZiAoc2V0dGxlZCA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChzZXR0bGVkID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRSRUpFQ1RFRCkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGluaXRpYWxpemVQcm9taXNlKHByb21pc2UsIHJlc29sdmVyKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlcihmdW5jdGlvbiByZXNvbHZlUHJvbWlzZSh2YWx1ZSl7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIHJlamVjdFByb21pc2UocmVhc29uKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvcihDb25zdHJ1Y3RvciwgaW5wdXQpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcblxuICAgICAgZW51bWVyYXRvci5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IENvbnN0cnVjdG9yO1xuICAgICAgZW51bWVyYXRvci5wcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICBpZiAoZW51bWVyYXRvci5fdmFsaWRhdGVJbnB1dChpbnB1dCkpIHtcbiAgICAgICAgZW51bWVyYXRvci5faW5wdXQgICAgID0gaW5wdXQ7XG4gICAgICAgIGVudW1lcmF0b3IubGVuZ3RoICAgICA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIGVudW1lcmF0b3IuX2luaXQoKTtcblxuICAgICAgICBpZiAoZW51bWVyYXRvci5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRmdWxmaWxsKGVudW1lcmF0b3IucHJvbWlzZSwgZW51bWVyYXRvci5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLmxlbmd0aCA9IGVudW1lcmF0b3IubGVuZ3RoIHx8IDA7XG4gICAgICAgICAgZW51bWVyYXRvci5fZW51bWVyYXRlKCk7XG4gICAgICAgICAgaWYgKGVudW1lcmF0b3IuX3JlbWFpbmluZyA9PT0gMCkge1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkZnVsZmlsbChlbnVtZXJhdG9yLnByb21pc2UsIGVudW1lcmF0b3IuX3Jlc3VsdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QoZW51bWVyYXRvci5wcm9taXNlLCBlbnVtZXJhdG9yLl92YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl92YWxpZGF0ZUlucHV0ID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgIHJldHVybiBsaWIkZXM2JHByb21pc2UkdXRpbHMkJGlzQXJyYXkoaW5wdXQpO1xuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgICB9O1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3I7XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICB2YXIgbGVuZ3RoICA9IGVudW1lcmF0b3IubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgPSBlbnVtZXJhdG9yLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICA9IGVudW1lcmF0b3IuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX2VhY2hFbnRyeShpbnB1dFtpXSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24oZW50cnksIGkpIHtcbiAgICAgIHZhciBlbnVtZXJhdG9yID0gdGhpcztcbiAgICAgIHZhciBjID0gZW51bWVyYXRvci5faW5zdGFuY2VDb25zdHJ1Y3RvcjtcblxuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNNYXliZVRoZW5hYmxlKGVudHJ5KSkge1xuICAgICAgICBpZiAoZW50cnkuY29uc3RydWN0b3IgPT09IGMgJiYgZW50cnkuX3N0YXRlICE9PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgICAgZW50cnkuX29uZXJyb3IgPSBudWxsO1xuICAgICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChlbnRyeS5fc3RhdGUsIGksIGVudHJ5Ll9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVudW1lcmF0b3IuX3dpbGxTZXR0bGVBdChjLnJlc29sdmUoZW50cnkpLCBpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZW51bWVyYXRvci5fcmVtYWluaW5nLS07XG4gICAgICAgIGVudW1lcmF0b3IuX3Jlc3VsdFtpXSA9IGVudHJ5O1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkZXM2JHByb21pc2UkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuICAgICAgdmFyIHByb21pc2UgPSBlbnVtZXJhdG9yLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICBlbnVtZXJhdG9yLl9yZW1haW5pbmctLTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlbnVtZXJhdG9yLl9yZXN1bHRbaV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZW51bWVyYXRvci5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgZW51bWVyYXRvci5fcmVzdWx0KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbihwcm9taXNlLCBpKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG5cbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIHZhbHVlKTtcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICBlbnVtZXJhdG9yLl9zZXR0bGVkQXQobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkUkVKRUNURUQsIGksIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkYWxsKGVudHJpZXMpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJGVzNiRwcm9taXNlJGVudW1lcmF0b3IkJGRlZmF1bHQodGhpcywgZW50cmllcykucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJGFsbCQkYWxsO1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJhY2UkJHJhY2UoZW50cmllcykge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICBpZiAoIWxpYiRlczYkcHJvbWlzZSR1dGlscyQkaXNBcnJheShlbnRyaWVzKSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLicpKTtcbiAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSBlbnRyaWVzLmxlbmd0aDtcblxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsbWVudCh2YWx1ZSkge1xuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmFjZSQkcmFjZTtcbiAgICBmdW5jdGlvbiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRyZXNvbHZlKG9iamVjdCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRub29wKTtcbiAgICAgIGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgb2JqZWN0KTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlc29sdmUkJHJlc29sdmU7XG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkcmVqZWN0JCRyZWplY3QocmVhc29uKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkZGVmYXVsdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkcmVqZWN0O1xuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRjb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc05ldygpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2U7XG4gICAgLyoqXG4gICAgICBQcm9taXNlIG9iamVjdHMgcmVwcmVzZW50IHRoZSBldmVudHVhbCByZXN1bHQgb2YgYW4gYXN5bmNocm9ub3VzIG9wZXJhdGlvbi4gVGhlXG4gICAgICBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLCB3aGljaFxuICAgICAgcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2XigJlzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZSByZWFzb25cbiAgICAgIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBUZXJtaW5vbG9neVxuICAgICAgLS0tLS0tLS0tLS1cblxuICAgICAgLSBgcHJvbWlzZWAgaXMgYW4gb2JqZWN0IG9yIGZ1bmN0aW9uIHdpdGggYSBgdGhlbmAgbWV0aG9kIHdob3NlIGJlaGF2aW9yIGNvbmZvcm1zIHRvIHRoaXMgc3BlY2lmaWNhdGlvbi5cbiAgICAgIC0gYHRoZW5hYmxlYCBpcyBhbiBvYmplY3Qgb3IgZnVuY3Rpb24gdGhhdCBkZWZpbmVzIGEgYHRoZW5gIG1ldGhvZC5cbiAgICAgIC0gYHZhbHVlYCBpcyBhbnkgbGVnYWwgSmF2YVNjcmlwdCB2YWx1ZSAoaW5jbHVkaW5nIHVuZGVmaW5lZCwgYSB0aGVuYWJsZSwgb3IgYSBwcm9taXNlKS5cbiAgICAgIC0gYGV4Y2VwdGlvbmAgaXMgYSB2YWx1ZSB0aGF0IGlzIHRocm93biB1c2luZyB0aGUgdGhyb3cgc3RhdGVtZW50LlxuICAgICAgLSBgcmVhc29uYCBpcyBhIHZhbHVlIHRoYXQgaW5kaWNhdGVzIHdoeSBhIHByb21pc2Ugd2FzIHJlamVjdGVkLlxuICAgICAgLSBgc2V0dGxlZGAgdGhlIGZpbmFsIHJlc3Rpbmcgc3RhdGUgb2YgYSBwcm9taXNlLCBmdWxmaWxsZWQgb3IgcmVqZWN0ZWQuXG5cbiAgICAgIEEgcHJvbWlzZSBjYW4gYmUgaW4gb25lIG9mIHRocmVlIHN0YXRlczogcGVuZGluZywgZnVsZmlsbGVkLCBvciByZWplY3RlZC5cblxuICAgICAgUHJvbWlzZXMgdGhhdCBhcmUgZnVsZmlsbGVkIGhhdmUgYSBmdWxmaWxsbWVudCB2YWx1ZSBhbmQgYXJlIGluIHRoZSBmdWxmaWxsZWRcbiAgICAgIHN0YXRlLiAgUHJvbWlzZXMgdGhhdCBhcmUgcmVqZWN0ZWQgaGF2ZSBhIHJlamVjdGlvbiByZWFzb24gYW5kIGFyZSBpbiB0aGVcbiAgICAgIHJlamVjdGVkIHN0YXRlLiAgQSBmdWxmaWxsbWVudCB2YWx1ZSBpcyBuZXZlciBhIHRoZW5hYmxlLlxuXG4gICAgICBQcm9taXNlcyBjYW4gYWxzbyBiZSBzYWlkIHRvICpyZXNvbHZlKiBhIHZhbHVlLiAgSWYgdGhpcyB2YWx1ZSBpcyBhbHNvIGFcbiAgICAgIHByb21pc2UsIHRoZW4gdGhlIG9yaWdpbmFsIHByb21pc2UncyBzZXR0bGVkIHN0YXRlIHdpbGwgbWF0Y2ggdGhlIHZhbHVlJ3NcbiAgICAgIHNldHRsZWQgc3RhdGUuICBTbyBhIHByb21pc2UgdGhhdCAqcmVzb2x2ZXMqIGEgcHJvbWlzZSB0aGF0IHJlamVjdHMgd2lsbFxuICAgICAgaXRzZWxmIHJlamVjdCwgYW5kIGEgcHJvbWlzZSB0aGF0ICpyZXNvbHZlcyogYSBwcm9taXNlIHRoYXQgZnVsZmlsbHMgd2lsbFxuICAgICAgaXRzZWxmIGZ1bGZpbGwuXG5cblxuICAgICAgQmFzaWMgVXNhZ2U6XG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgYGBganNcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIC8vIG9uIHN1Y2Nlc3NcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG5cbiAgICAgICAgLy8gb24gZmFpbHVyZVxuICAgICAgICByZWplY3QocmVhc29uKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgLy8gb24gZnVsZmlsbG1lbnRcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAvLyBvbiByZWplY3Rpb25cbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIFVzYWdlOlxuICAgICAgLS0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFByb21pc2VzIHNoaW5lIHdoZW4gYWJzdHJhY3RpbmcgYXdheSBhc3luY2hyb25vdXMgaW50ZXJhY3Rpb25zIHN1Y2ggYXNcbiAgICAgIGBYTUxIdHRwUmVxdWVzdGBzLlxuXG4gICAgICBgYGBqc1xuICAgICAgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCk7XG4gICAgICAgICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGhhbmRsZXI7XG4gICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdqc29uJztcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICB4aHIuc2VuZCgpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IHRoaXMuRE9ORSkge1xuICAgICAgICAgICAgICBpZiAodGhpcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUodGhpcy5yZXNwb25zZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignZ2V0SlNPTjogYCcgKyB1cmwgKyAnYCBmYWlsZWQgd2l0aCBzdGF0dXM6IFsnICsgdGhpcy5zdGF0dXMgKyAnXScpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBnZXRKU09OKCcvcG9zdHMuanNvbicpLnRoZW4oZnVuY3Rpb24oanNvbikge1xuICAgICAgICAvLyBvbiBmdWxmaWxsbWVudFxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIC8vIG9uIHJlamVjdGlvblxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgVW5saWtlIGNhbGxiYWNrcywgcHJvbWlzZXMgYXJlIGdyZWF0IGNvbXBvc2FibGUgcHJpbWl0aXZlcy5cblxuICAgICAgYGBganNcbiAgICAgIFByb21pc2UuYWxsKFtcbiAgICAgICAgZ2V0SlNPTignL3Bvc3RzJyksXG4gICAgICAgIGdldEpTT04oJy9jb21tZW50cycpXG4gICAgICBdKS50aGVuKGZ1bmN0aW9uKHZhbHVlcyl7XG4gICAgICAgIHZhbHVlc1swXSAvLyA9PiBwb3N0c0pTT05cbiAgICAgICAgdmFsdWVzWzFdIC8vID0+IGNvbW1lbnRzSlNPTlxuXG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBAY2xhc3MgUHJvbWlzZVxuICAgICAgQHBhcmFtIHtmdW5jdGlvbn0gcmVzb2x2ZXJcbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEBjb25zdHJ1Y3RvclxuICAgICovXG4gICAgZnVuY3Rpb24gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UocmVzb2x2ZXIpIHtcbiAgICAgIHRoaXMuX2lkID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkJGNvdW50ZXIrKztcbiAgICAgIHRoaXMuX3N0YXRlID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fcmVzdWx0ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXTtcblxuICAgICAgaWYgKGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJG5vb3AgIT09IHJlc29sdmVyKSB7XG4gICAgICAgIGlmICghbGliJGVzNiRwcm9taXNlJHV0aWxzJCRpc0Z1bmN0aW9uKHJlc29sdmVyKSkge1xuICAgICAgICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRuZWVkc1Jlc29sdmVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UpKSB7XG4gICAgICAgICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJG5lZWRzTmV3KCk7XG4gICAgICAgIH1cblxuICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRpbml0aWFsaXplUHJvbWlzZSh0aGlzLCByZXNvbHZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGliJGVzNiRwcm9taXNlJHByb21pc2UkJFByb21pc2UuYWxsID0gbGliJGVzNiRwcm9taXNlJHByb21pc2UkYWxsJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJhY2UgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlc29sdmUgPSBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJHJlamVjdCQkZGVmYXVsdDtcblxuICAgIGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRQcm9taXNlLnByb3RvdHlwZSA9IHtcbiAgICAgIGNvbnN0cnVjdG9yOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgIC8qKlxuICAgICAgVGhlIHByaW1hcnkgd2F5IG9mIGludGVyYWN0aW5nIHdpdGggYSBwcm9taXNlIGlzIHRocm91Z2ggaXRzIGB0aGVuYCBtZXRob2QsXG4gICAgICB3aGljaCByZWdpc3RlcnMgY2FsbGJhY2tzIHRvIHJlY2VpdmUgZWl0aGVyIGEgcHJvbWlzZSdzIGV2ZW50dWFsIHZhbHVlIG9yIHRoZVxuICAgICAgcmVhc29uIHdoeSB0aGUgcHJvbWlzZSBjYW5ub3QgYmUgZnVsZmlsbGVkLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uKHVzZXIpe1xuICAgICAgICAvLyB1c2VyIGlzIGF2YWlsYWJsZVxuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gdXNlciBpcyB1bmF2YWlsYWJsZSwgYW5kIHlvdSBhcmUgZ2l2ZW4gdGhlIHJlYXNvbiB3aHlcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIENoYWluaW5nXG4gICAgICAtLS0tLS0tLVxuXG4gICAgICBUaGUgcmV0dXJuIHZhbHVlIG9mIGB0aGVuYCBpcyBpdHNlbGYgYSBwcm9taXNlLiAgVGhpcyBzZWNvbmQsICdkb3duc3RyZWFtJ1xuICAgICAgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZpcnN0IHByb21pc2UncyBmdWxmaWxsbWVudFxuICAgICAgb3IgcmVqZWN0aW9uIGhhbmRsZXIsIG9yIHJlamVjdGVkIGlmIHRoZSBoYW5kbGVyIHRocm93cyBhbiBleGNlcHRpb24uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIHVzZXIubmFtZTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgcmV0dXJuICdkZWZhdWx0IG5hbWUnO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodXNlck5hbWUpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGB1c2VyTmFtZWAgd2lsbCBiZSB0aGUgdXNlcidzIG5hbWUsIG90aGVyd2lzZSBpdFxuICAgICAgICAvLyB3aWxsIGJlIGAnZGVmYXVsdCBuYW1lJ2BcbiAgICAgIH0pO1xuXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gaWYgYGZpbmRVc2VyYCBmdWxmaWxsZWQsIGByZWFzb25gIHdpbGwgYmUgJ0ZvdW5kIHVzZXIsIGJ1dCBzdGlsbCB1bmhhcHB5Jy5cbiAgICAgICAgLy8gSWYgYGZpbmRVc2VyYCByZWplY3RlZCwgYHJlYXNvbmAgd2lsbCBiZSAnYGZpbmRVc2VyYCByZWplY3RlZCBhbmQgd2UncmUgdW5oYXBweScuXG4gICAgICB9KTtcbiAgICAgIGBgYFxuICAgICAgSWYgdGhlIGRvd25zdHJlYW0gcHJvbWlzZSBkb2VzIG5vdCBzcGVjaWZ5IGEgcmVqZWN0aW9uIGhhbmRsZXIsIHJlamVjdGlvbiByZWFzb25zIHdpbGwgYmUgcHJvcGFnYXRlZCBmdXJ0aGVyIGRvd25zdHJlYW0uXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgdGhyb3cgbmV3IFBlZGFnb2dpY2FsRXhjZXB0aW9uKCdVcHN0cmVhbSBlcnJvcicpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgLy8gbmV2ZXIgcmVhY2hlZFxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBUaGUgYFBlZGdhZ29jaWFsRXhjZXB0aW9uYCBpcyBwcm9wYWdhdGVkIGFsbCB0aGUgd2F5IGRvd24gdG8gaGVyZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQXNzaW1pbGF0aW9uXG4gICAgICAtLS0tLS0tLS0tLS1cblxuICAgICAgU29tZXRpbWVzIHRoZSB2YWx1ZSB5b3Ugd2FudCB0byBwcm9wYWdhdGUgdG8gYSBkb3duc3RyZWFtIHByb21pc2UgY2FuIG9ubHkgYmVcbiAgICAgIHJldHJpZXZlZCBhc3luY2hyb25vdXNseS4gVGhpcyBjYW4gYmUgYWNoaWV2ZWQgYnkgcmV0dXJuaW5nIGEgcHJvbWlzZSBpbiB0aGVcbiAgICAgIGZ1bGZpbGxtZW50IG9yIHJlamVjdGlvbiBoYW5kbGVyLiBUaGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgdGhlbiBiZSBwZW5kaW5nXG4gICAgICB1bnRpbCB0aGUgcmV0dXJuZWQgcHJvbWlzZSBpcyBzZXR0bGVkLiBUaGlzIGlzIGNhbGxlZCAqYXNzaW1pbGF0aW9uKi5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBUaGUgdXNlcidzIGNvbW1lbnRzIGFyZSBub3cgYXZhaWxhYmxlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBJZiB0aGUgYXNzaW1saWF0ZWQgcHJvbWlzZSByZWplY3RzLCB0aGVuIHRoZSBkb3duc3RyZWFtIHByb21pc2Ugd2lsbCBhbHNvIHJlamVjdC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICByZXR1cm4gZmluZENvbW1lbnRzQnlBdXRob3IodXNlcik7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uIChjb21tZW50cykge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIGZ1bGZpbGxzLCB3ZSdsbCBoYXZlIHRoZSB2YWx1ZSBoZXJlXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIElmIGBmaW5kQ29tbWVudHNCeUF1dGhvcmAgcmVqZWN0cywgd2UnbGwgaGF2ZSB0aGUgcmVhc29uIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIFNpbXBsZSBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIHJlc3VsdCA9IGZpbmRSZXN1bHQoKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFJlc3VsdChmdW5jdGlvbihyZXN1bHQsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRSZXN1bHQoKS50aGVuKGZ1bmN0aW9uKHJlc3VsdCl7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFkdmFuY2VkIEV4YW1wbGVcbiAgICAgIC0tLS0tLS0tLS0tLS0tXG5cbiAgICAgIFN5bmNocm9ub3VzIEV4YW1wbGVcblxuICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgdmFyIGF1dGhvciwgYm9va3M7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1dGhvciA9IGZpbmRBdXRob3IoKTtcbiAgICAgICAgYm9va3MgID0gZmluZEJvb2tzQnlBdXRob3IoYXV0aG9yKTtcbiAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgfVxuICAgICAgYGBgXG5cbiAgICAgIEVycmJhY2sgRXhhbXBsZVxuXG4gICAgICBgYGBqc1xuXG4gICAgICBmdW5jdGlvbiBmb3VuZEJvb2tzKGJvb2tzKSB7XG5cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZmFpbHVyZShyZWFzb24pIHtcblxuICAgICAgfVxuXG4gICAgICBmaW5kQXV0aG9yKGZ1bmN0aW9uKGF1dGhvciwgZXJyKXtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAvLyBmYWlsdXJlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZpbmRCb29va3NCeUF1dGhvcihhdXRob3IsIGZ1bmN0aW9uKGJvb2tzLCBlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgZm91bmRCb29rcyhib29rcyk7XG4gICAgICAgICAgICAgICAgfSBjYXRjaChyZWFzb24pIHtcbiAgICAgICAgICAgICAgICAgIGZhaWx1cmUocmVhc29uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgICAgIGZhaWx1cmUoZXJyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gc3VjY2Vzc1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBQcm9taXNlIEV4YW1wbGU7XG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIGZpbmRBdXRob3IoKS5cbiAgICAgICAgdGhlbihmaW5kQm9va3NCeUF1dGhvcikuXG4gICAgICAgIHRoZW4oZnVuY3Rpb24oYm9va3Mpe1xuICAgICAgICAgIC8vIGZvdW5kIGJvb2tzXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgQG1ldGhvZCB0aGVuXG4gICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBvbkZ1bGZpbGxlZFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3RlZFxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09IGxpYiRlczYkcHJvbWlzZSQkaW50ZXJuYWwkJFJFSkVDVEVEICYmICFvblJlamVjdGlvbikge1xuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkID0gbmV3IHRoaXMuY29uc3RydWN0b3IobGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkbm9vcCk7XG4gICAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkYXNhcCQkZGVmYXVsdChmdW5jdGlvbigpe1xuICAgICAgICAgICAgbGliJGVzNiRwcm9taXNlJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc3RhdGUsIGNoaWxkLCBjYWxsYmFjaywgcmVzdWx0KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaWIkZXM2JHByb21pc2UkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgICAgfSxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBVc2VmdWwgZm9yIHRvb2xpbmcuXG4gICAgICBAcmV0dXJuIHtQcm9taXNlfVxuICAgICovXG4gICAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkcG9seWZpbGwoKSB7XG4gICAgICB2YXIgbG9jYWw7XG5cbiAgICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGxvY2FsID0gZ2xvYmFsO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBsb2NhbCA9IHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIGxvY2FsID0gRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50Jyk7XG4gICAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgUCA9IGxvY2FsLlByb21pc2U7XG5cbiAgICAgIGlmIChQICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChQLnJlc29sdmUoKSkgPT09ICdbb2JqZWN0IFByb21pc2VdJyAmJiAhUC5jYXN0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbG9jYWwuUHJvbWlzZSA9IGxpYiRlczYkcHJvbWlzZSRwcm9taXNlJCRkZWZhdWx0O1xuICAgIH1cbiAgICB2YXIgbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRkZWZhdWx0ID0gbGliJGVzNiRwcm9taXNlJHBvbHlmaWxsJCRwb2x5ZmlsbDtcblxuICAgIHZhciBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlID0ge1xuICAgICAgJ1Byb21pc2UnOiBsaWIkZXM2JHByb21pc2UkcHJvbWlzZSQkZGVmYXVsdCxcbiAgICAgICdwb2x5ZmlsbCc6IGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZGVmaW5lOnRydWUgbW9kdWxlOnRydWUgd2luZG93OiB0cnVlICovXG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lWydhbWQnXSkge1xuICAgICAgZGVmaW5lKGZ1bmN0aW9uKCkgeyByZXR1cm4gbGliJGVzNiRwcm9taXNlJHVtZCQkRVM2UHJvbWlzZTsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHRoaXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzWydFUzZQcm9taXNlJ10gPSBsaWIkZXM2JHByb21pc2UkdW1kJCRFUzZQcm9taXNlO1xuICAgIH1cblxuICAgIGxpYiRlczYkcHJvbWlzZSRwb2x5ZmlsbCQkZGVmYXVsdCgpO1xufSkuY2FsbCh0aGlzKTtcblxuIiwiKGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBuYW1lLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24obmFtZSwgdmFsdWVzKSB7XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICAgIH0pXG4gICAgICB9KVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgc2VsZi5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgaXRlcmFibGUgZm9yIG5vdy5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgY2FsbGJhY2sobmFtZSwgc2VsZi5tYXBbbmFtZV0pXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIFhEb21haW5SZXF1ZXN0OiAnWERvbWFpblJlcXVlc3QnIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdCh1cmwsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHRoaXMudXJsID0gdXJsXG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgb3B0aW9ucy5ib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KG9wdGlvbnMuYm9keSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIGxlZ2FjeUNvcnMgPSBmYWxzZTtcbiAgICAgIGlmIChzdXBwb3J0LlhEb21haW5SZXF1ZXN0KSB7XG4gICAgICAgIHZhciBvcmlnaW4gPSBsb2NhdGlvbi5wcm90b2NvbCArICcvLycgKyBsb2NhdGlvbi5ob3N0O1xuICAgICAgICBpZiAoIS9eXFwvW15cXC9dLy50ZXN0KHNlbGYudXJsKSkgeyAvLyBleGNsdWRlIHJlbGF0aXZlIHVybHNcbiAgICAgICAgICBsZWdhY3lDb3JzID0gKC9eXFwvXFwvLy50ZXN0KHNlbGYudXJsKSA/IGxvY2F0aW9uLnByb3RvY29sICsgc2VsZi51cmwgOiBzZWxmLnVybCkuc3Vic3RyaW5nKDAsIG9yaWdpbi5sZW5ndGgpICE9PSBvcmlnaW47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciB4aHIgPSBsZWdhY3lDb3JzID8gbmV3IFhEb21haW5SZXF1ZXN0KCkgOiBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBpZiAobGVnYWN5Q29ycykge1xuICAgICAgICB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICdDb250ZW50LVR5cGU6ICcreGhyLmNvbnRlbnRUeXBlO1xuICAgICAgICB9O1xuICAgICAgfSBlbHNlIGlmIChzZWxmLmNyZWRlbnRpYWxzID09PSAnY29ycycpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMpID8gMjA0IDogeGhyLnN0YXR1c1xuXG4gICAgICAgIC8vIElmIFhEb21haW5SZXF1ZXN0IHRoZXJlIGlzIG5vIHN0YXR1cyBjb2RlIHNvIGp1c3QgaG9wZSBmb3IgdGhlIGJlc3QuLi5cbiAgICAgICAgaWYgKGxlZ2FjeUNvcnMpIHtcbiAgICAgICAgICBzdGF0dXMgPSAyMDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXR1cyA8IDEwMCB8fCBzdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHNlbGYubWV0aG9kLCBzZWxmLnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICBzZWxmLmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbihuYW1lLCB2YWx1ZXMpIHtcbiAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiBzZWxmLl9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogc2VsZi5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy51cmwgPSBudWxsXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnNcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24gKHVybCwgb3B0aW9ucykge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh1cmwsIG9wdGlvbnMpLmZldGNoKClcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnZmV0Y2gnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxucmVxdWlyZSgnZXM2LXByb21pc2UnKS5wb2x5ZmlsbCgpO1xucmVxdWlyZSgnaXNvbW9ycGhpYy1mZXRjaCcpO1xuXG52YXIgYXBpSGFuZGxlciA9IHJlcXVpcmUoJy4vc3JjL2pzL2FwaScpO1xudmFyIGNoYXJ0ID0gcmVxdWlyZSgnLi9zcmMvanMvY2hhcnRzJyk7XG52YXIgbWFwID0gcmVxdWlyZSgnLi9zcmMvanMvbWFwcycpO1xuXG5mdW5jdGlvbiBsb2FkUmVzdWx0cyhyZXN1bHRzKSB7XG5cdHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcucmVzdWx0cy1jb250YWluZXInKTtcblx0Y29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuXG5cdE9iamVjdC5rZXlzKHJlc3VsdHMpLmZvckVhY2goZnVuY3Rpb24oZmFjZXQpIHtcblx0XHR2YXIgcmVzdWx0Qm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0cmVzdWx0Qm94LmNsYXNzTGlzdC5hZGQoJ3Jlc3VsdC1ib3gnKTtcblxuXHRcdHZhciBsaXN0VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuXHRcdGxpc3RUaXRsZS5jbGFzc0xpc3QuYWRkKCdyZXN1bHQtYm94X190aXRsZScpO1xuXHRcdGxpc3RUaXRsZS50ZXh0Q29udGVudCA9IGZhY2V0O1xuXG5cdFx0cmVzdWx0Qm94LmFwcGVuZENoaWxkKGxpc3RUaXRsZSk7XG5cblx0XHR2YXIgZmFjZXRSZXN1bHRzID0gcmVzdWx0c1tmYWNldF0uYnVja2V0cztcblxuXHRcdHZhciBkYXRhID0ge1xuXHRcdFx0ZmFjZXQ6IGZhY2V0LFxuXHRcdFx0bmFtZXM6IFtdLFxuXHRcdFx0cmVhZHM6IFtdXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZmFjZXRSZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRkYXRhLm5hbWVzW2ldID0gZmFjZXRSZXN1bHRzW2ldLnZhbHVlO1xuXHRcdFx0ZGF0YS5yZWFkc1tpXSA9IGZhY2V0UmVzdWx0c1tpXS5jb3VudDtcblx0XHR9XG5cblx0XHR2YXIgcmVzdWx0RWxlbWVudDtcblxuXHRcdGlmIChmYWNldCA9PT0gJ2NvdW50cnknKSB7XG5cdFx0XHRyZXN1bHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0XHRyZXN1bHRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ3Jlc3VsdC1ib3hfX2NoYXJ0JywgJ3Jlc3VsdC1ib3hfX2NoYXJ0LS0nICsgZmFjZXQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHRFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZycsICdzdmcnKTtcblx0XHRcdHJlc3VsdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmVzdWx0LWJveF9fY2hhcnQnLCAncmVzdWx0LWJveF9fY2hhcnQtLScgKyBmYWNldCk7XG5cdFx0fVxuXG5cdFx0cmVzdWx0Qm94LmFwcGVuZENoaWxkKHJlc3VsdEVsZW1lbnQpO1xuXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKHJlc3VsdEJveCk7XG5cblx0XHRpZiAoZmFjZXQgPT09ICdjb3VudHJ5Jykge1xuXHRcdFx0bWFwKGRhdGEpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjaGFydChkYXRhKTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuXHR2YXIgaW5kdXN0cmllc1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19zZWxlY3QtLWluZHVzdHJpZXMnKTtcblx0dmFyIGNvdW50cmllc1NlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zZWFyY2gtYm94X19zZWxlY3QtLWNvdW50cmllcycpO1xuXHR2YXIgcG9zaXRpb25zU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1ib3hfX3NlbGVjdC0tcG9zaXRpb25zJyk7XG5cdHZhciByZXNwb25zaWJpbGl0aWVzU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1ib3hfX3NlbGVjdC0tcmVzcG9uc2liaWxpdGllcycpO1xuXHR2YXIgY29udGVudElucHV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1ib3hfX2lucHV0LS1jb250ZW50Jyk7XG5cdHZhciBjb250ZW50RmFjZXRMaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1ib3hfX2ZhY2V0LS1saXN0Jyk7XG5cblx0YXBpSGFuZGxlci5nZXRJbmR1c3RyaWVzKClcblx0XHQudGhlbihmdW5jdGlvbihpbmR1c3RyaWVzKSB7XG5cdFx0XHR2YXIgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRvcHRpb24udmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRvcHRpb24udGV4dCA9ICctLS0tLS0tLSc7XG5cdFx0XHRpbmR1c3RyaWVzU2VsZWN0LmFkZChvcHRpb24pO1xuXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGluZHVzdHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IGluZHVzdHJpZXNbaV0ubmFtZTtcblx0XHRcdFx0b3B0aW9uLnRleHQgPSBpbmR1c3RyaWVzW2ldLm5hbWU7XG5cdFx0XHRcdGluZHVzdHJpZXNTZWxlY3QuYWRkKG9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0pO1xuXG5cdGFwaUhhbmRsZXIuZ2V0Q291bnRyaWVzKClcblx0XHQudGhlbihmdW5jdGlvbihjb3VudHJpZXMpIHtcblx0XHRcdHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdG9wdGlvbi52YWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdG9wdGlvbi50ZXh0ID0gJy0tLS0tLS0tJztcblx0XHRcdGNvdW50cmllc1NlbGVjdC5hZGQob3B0aW9uKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb3VudHJpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IGNvdW50cmllc1tpXVsnaXNvMyddO1xuXHRcdFx0XHRvcHRpb24udGV4dCA9IGNvdW50cmllc1tpXVsnY291bnRyeSddO1xuXHRcdFx0XHRjb3VudHJpZXNTZWxlY3QuYWRkKG9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0pO1xuXG5cdGFwaUhhbmRsZXIuZ2V0UG9zaXRpb25zKClcblx0XHQudGhlbihmdW5jdGlvbihwb3NpdGlvbnMpIHtcblx0XHRcdHZhciBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcblx0XHRcdG9wdGlvbi52YWx1ZSA9IHVuZGVmaW5lZDtcblx0XHRcdG9wdGlvbi50ZXh0ID0gJy0tLS0tLS0tJztcblx0XHRcdHBvc2l0aW9uc1NlbGVjdC5hZGQob3B0aW9uKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwb3NpdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb3B0aW9uJyk7XG5cdFx0XHRcdG9wdGlvbi52YWx1ZSA9IHBvc2l0aW9uc1tpXS5uYW1lO1xuXHRcdFx0XHRvcHRpb24udGV4dCA9IHBvc2l0aW9uc1tpXS5uYW1lO1xuXHRcdFx0XHRwb3NpdGlvbnNTZWxlY3QuYWRkKG9wdGlvbik7XG5cdFx0XHR9XG5cdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdHRocm93IGVycm9yO1xuXHRcdH0pO1xuXG5cdGFwaUhhbmRsZXIuZ2V0UmVzcG9uc2liaWxpdGllcygpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2liaWxpdGllcykge1xuXHRcdFx0dmFyIG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXHRcdFx0b3B0aW9uLnZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdFx0b3B0aW9uLnRleHQgPSAnLS0tLS0tLS0nO1xuXHRcdFx0cmVzcG9uc2liaWxpdGllc1NlbGVjdC5hZGQob3B0aW9uKTtcblxuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByZXNwb25zaWJpbGl0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuXHRcdFx0XHRvcHRpb24udmFsdWUgPSByZXNwb25zaWJpbGl0aWVzW2ldLm5hbWU7XG5cdFx0XHRcdG9wdGlvbi50ZXh0ID0gcmVzcG9uc2liaWxpdGllc1tpXS5uYW1lO1xuXHRcdFx0XHRyZXNwb25zaWJpbGl0aWVzU2VsZWN0LmFkZChvcHRpb24pO1xuXHRcdFx0fVxuXHRcdH0sIGZ1bmN0aW9uKGVycm9yKSB7XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9KTtcblxuXHRhcGlIYW5kbGVyLmdldENvbnRlbnRGYWNldHMoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKGZhY2V0cykge1xuXHRcdFx0ZmFjZXRzLmZvckVhY2goZnVuY3Rpb24oZmFjZXQpIHtcblx0XHRcdFx0dmFyIGNoZWNrYm94V3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0XHRcdHZhciBjaGVja2JveEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuXHRcdFx0XHRjaGVja2JveEVsZW1lbnQudHlwZSA9ICdjaGVja2JveCc7XG5cdFx0XHRcdGNoZWNrYm94RWxlbWVudC5pZCA9ICdjaGVja2JveC0nICsgZmFjZXQ7XG5cdFx0XHRcdGNoZWNrYm94RWxlbWVudC5uYW1lID0gZmFjZXQ7XG5cdFx0XHRcdGNoZWNrYm94RWxlbWVudC52YWx1ZSA9IGZhY2V0O1xuXHRcdFx0XHRjaGVja2JveEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnby1mb3Jtcy1jaGVja2JveCcpO1xuXG5cdFx0XHRcdHZhciBjaGVja2JveExhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcblx0XHRcdFx0Y2hlY2tib3hMYWJlbC5odG1sRm9yID0gJ2NoZWNrYm94LScgKyBmYWNldDtcblx0XHRcdFx0Y2hlY2tib3hMYWJlbC50ZXh0Q29udGVudCA9IGZhY2V0O1xuXHRcdFx0XHRjaGVja2JveExhYmVsLmNsYXNzTGlzdC5hZGQoJ28tZm9ybXMtbGFiZWwnKTtcblxuXHRcdFx0XHRjaGVja2JveFdyYXBwZXIuYXBwZW5kQ2hpbGQoY2hlY2tib3hFbGVtZW50KTtcblx0XHRcdFx0Y2hlY2tib3hXcmFwcGVyLmFwcGVuZENoaWxkKGNoZWNrYm94TGFiZWwpO1xuXG5cdFx0XHRcdGNvbnRlbnRGYWNldExpc3QuYXBwZW5kQ2hpbGQoY2hlY2tib3hXcmFwcGVyKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXG5cdHZhciBzZWFyY2hTdWJtaXRIYW5kbGVyID0gZnVuY3Rpb24oZXYpIHtcblx0XHR2YXIgcXVlcnlQYXJhbXMgPSB7fTtcblxuXHRcdGlmIChpbmR1c3RyaWVzU2VsZWN0LnZhbHVlICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0cXVlcnlQYXJhbXMuaW5kdXN0cnkgPSBpbmR1c3RyaWVzU2VsZWN0LnZhbHVlO1xuXHRcdH1cblxuXHRcdGlmIChjb3VudHJpZXNTZWxlY3QudmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRxdWVyeVBhcmFtcy5jb3VudHJ5ID0gY291bnRyaWVzU2VsZWN0LnZhbHVlO1xuXHRcdH1cblxuXHRcdGlmIChwb3NpdGlvbnNTZWxlY3QudmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRxdWVyeVBhcmFtcy5wb3NpdGlvbiA9IHBvc2l0aW9uc1NlbGVjdC52YWx1ZTtcblx0XHR9XG5cblx0XHRpZiAocmVzcG9uc2liaWxpdGllc1NlbGVjdC52YWx1ZSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdHF1ZXJ5UGFyYW1zLnJlc3BvbnNpYmlsaXR5ID0gcmVzcG9uc2liaWxpdGllc1NlbGVjdC52YWx1ZTtcblx0XHR9XG5cblx0XHRpZiAoY29udGVudElucHV0LnZhbHVlICE9PSAnJykge1xuXHRcdFx0cXVlcnlQYXJhbXMuY29udGVudCA9IGNvbnRlbnRJbnB1dC52YWx1ZTtcblx0XHR9XG5cblx0XHR2YXIgZmFjZXRzID0gW107XG5cblx0XHR2YXIgZmFjZXRDaGVja2JveGVzID0gY29udGVudEZhY2V0TGlzdC5xdWVyeVNlbGVjdG9yQWxsKCcuby1mb3Jtcy1jaGVja2JveCcpO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBmYWNldENoZWNrYm94ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChmYWNldENoZWNrYm94ZXNbaV0uY2hlY2tlZCkge1xuXHRcdFx0XHRmYWNldHMucHVzaChmYWNldENoZWNrYm94ZXNbaV0udmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGFwaUhhbmRsZXIuc2VhcmNoKHF1ZXJ5UGFyYW1zLCBmYWNldHMpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG5cdFx0XHRcdGxvYWRSZXN1bHRzKHJlc3VsdHMpO1xuXHRcdFx0fSwgZnVuY3Rpb24oZXJyb3IpIHtcblx0XHRcdFx0dGhyb3cgZXJyb3I7XG5cdFx0XHR9KTtcblx0fTtcblxuXHR2YXIgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNlYXJjaC1ib3hfX3N1Ym1pdCcpO1xuXHRzdWJtaXRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWFyY2hTdWJtaXRIYW5kbGVyKTtcbn1cblxuXG5pbml0KCk7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpIHtcblx0ZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChuZXcgQ3VzdG9tRXZlbnQoJ28uRE9NQ29udGVudExvYWRlZCcpKTtcbn0pOyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBiYXNlVXJsID0gJ2h0dHA6Ly9mdC1kZXZlbG9wbWVudC1pbnQuYXBpZ2VlLm5ldC8nO1xudmFyIGNvbnRlbnRGYWNldHMgPSBbJ2JyYW5kJywgJ2dlbnJlJywgJ3Blb3BsZScsICdwcmltYXJ5X3NlY3Rpb24nLCAncHJpbWFyeV90aGVtZScsICdyZWdpb25zJywgJ3NlY3Rpb25zJywgJ3N1YmplY3RzJywgJ3RvcGljcyddO1xudmFyIHVzZXJGYWNldHMgPSBbJ2NvdW50cnknLCAnaW5kdXN0cnknLCAncG9zaXRpb24nLCAncmVzcG9uc2liaWxpdHknXTtcblxudmFyIGFwaUhhbmRsZXIgPSB7fTtcblxuYXBpSGFuZGxlci5nZXRJbmR1c3RyaWVzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBpbmR1c3RyaWVzQXBpID0gJ3N0YW5kYXJkLWRhdGEvaW5kdXN0cnktc2VjdG9ycy9sZWdhY3knO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0ZmV0Y2goYmFzZVVybCArIGluZHVzdHJpZXNBcGkpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0aWYgKHJlcy5zdGF0dXMgIT09IDIwMCkge1xuXHRcdFx0XHRcdHJlamVjdCgnZmV0Y2ggZmFpbGVkIHdpdGggc3RhdHVzICcgKyByZXMuc3RhdHVzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiByZXMuanNvbigpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKGluZHVzdHJpZXMpIHtcblx0XHRcdFx0cmVzb2x2ZShpbmR1c3RyaWVzLmluZHVzdHJpZXMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHJlamVjdChlKTtcblx0XHRcdH0pO1xuXHR9KTtcbn07XG5cbmFwaUhhbmRsZXIuZ2V0Q291bnRyaWVzID0gZnVuY3Rpb24oKSB7XG5cdHZhciBjb3VudHJpZXNBcGkgPSAnc3RhbmRhcmQtZGF0YS9jb3VudHJpZXMvdjEuMic7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcblx0XHRmZXRjaChiYXNlVXJsICsgY291bnRyaWVzQXBpKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGlmIChyZXMuc3RhdHVzICE9PSAyMDApIHtcblx0XHRcdFx0XHRyZWplY3QoJ2ZldGNoIGZhaWxlZCB3aXRoIHN0YXR1cyAnICsgcmVzLnN0YXR1cyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbihjb3VudHJpZXMpIHtcblx0XHRcdFx0cmVzb2x2ZShjb3VudHJpZXMuY291bnRyaWVzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9KTtcblx0fSk7XG59O1xuXG5hcGlIYW5kbGVyLmdldFBvc2l0aW9ucyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgcG9zaXRpb25zQXBpID0gJ3N0YW5kYXJkLWRhdGEvam9iLXRpdGxlcy9sZWdhY3knO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0ZmV0Y2goYmFzZVVybCArIHBvc2l0aW9uc0FwaSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRpZiAocmVzLnN0YXR1cyAhPT0gMjAwKSB7XG5cdFx0XHRcdFx0cmVqZWN0KCdmZXRjaCBmYWlsZWQgd2l0aCBzdGF0dXMgJyArIHJlcy5zdGF0dXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlcy5qc29uKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocG9zaXRpb25zKSB7XG5cdFx0XHRcdHJlc29sdmUocG9zaXRpb25zLmpvYlRpdGxlcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0cmVqZWN0KGUpO1xuXHRcdFx0fSk7XG5cdH0pO1xufTtcblxuYXBpSGFuZGxlci5nZXRSZXNwb25zaWJpbGl0aWVzID0gZnVuY3Rpb24oKSB7XG5cdHZhciByZXNwb25zaWJpbGl0aWVzQXBpID0gJ3N0YW5kYXJkLWRhdGEvam9iLXJlc3BvbnNpYmlsaXRpZXMvbGVnYWN5Jztcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdGZldGNoKGJhc2VVcmwgKyByZXNwb25zaWJpbGl0aWVzQXBpKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdGlmIChyZXMuc3RhdHVzICE9PSAyMDApIHtcblx0XHRcdFx0XHRyZWplY3QoJ2ZldGNoIGZhaWxlZCB3aXRoIHN0YXR1cyAnICsgcmVzLnN0YXR1cyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zaWJpbGl0aWVzKSB7XG5cdFx0XHRcdHJlc29sdmUocmVzcG9uc2liaWxpdGllcy5qb2JSZXNwb25zaWJpbGl0aWVzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24oZSkge1xuXHRcdFx0XHRyZWplY3QoZSk7XG5cdFx0XHR9KTtcblx0fSk7XG59O1xuXG5hcGlIYW5kbGVyLmdldENvbnRlbnRGYWNldHMgPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdHJlc29sdmUoY29udGVudEZhY2V0cy5jb25jYXQodXNlckZhY2V0cykpO1xuXHR9KTtcbn07XG5cbmFwaUhhbmRsZXIuc2VhcmNoID0gZnVuY3Rpb24ocXVlcnlQYXJhbXMsIGZhY2V0cykge1xuXHR2YXIgc2VhcmNoQXBpID0gJ2Z0LXJlYWRpbmctc3RhdHMtY2xvdWQnO1xuXHR2YXIgcXVlcnkgPSAnP3EucGFyc2VyPXN0cnVjdHVyZWQmc2l6ZT0wJztcblx0dmFyIGZhY2V0Q29uZmlnID0gZW5jb2RlVVJJQ29tcG9uZW50KCd7c29ydDpcImNvdW50XCIsc2l6ZToxMH0nKTtcblxuXHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0dmFyIHBhcmFtcyA9IE9iamVjdC5rZXlzKHF1ZXJ5UGFyYW1zKTtcblx0XHRpZiAocGFyYW1zLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmVqZWN0KCdBdCBsZWFzdCBvbmUgcGFyYW1ldGVyIG5lZWRzIHRvIGJlIHNlbGVjdGVkIHRvIG1ha2UgYSBzZWFyY2guJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHF1ZXJ5ICs9JyZxPScgKyBlbmNvZGVVUklDb21wb25lbnQoJyhhbmQgJyk7XG5cblx0XHRcdHBhcmFtcy5mb3JFYWNoKGZ1bmN0aW9uKHF1ZXJ5S2V5KSB7XG5cdFx0XHRcdGlmIChxdWVyeUtleSA9PT0gJ2NvbnRlbnQnKSB7XG5cdFx0XHRcdFx0cXVlcnkgKz0gZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5UGFyYW1zW3F1ZXJ5S2V5XSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cXVlcnkgKz0gXG5cdFx0XHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQocXVlcnlLZXkpICtcblx0XHRcdFx0XHRcdCc6JyArXG5cdFx0XHRcdFx0XHRlbmNvZGVVUklDb21wb25lbnQoXCInXCIgKyBxdWVyeVBhcmFtc1txdWVyeUtleV0gKyBcIicgXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cXVlcnkgKz0gJyknO1xuXHRcdH1cblxuXHRcdGlmIChmYWNldHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRyZWplY3QoJ0F0IGxlYXN0IG9uZSBmYWNldCBuZWVkcyB0byBiZSBzZWxlY3RlZC4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZmFjZXRzLmZvckVhY2goZnVuY3Rpb24oZmFjZXQpIHtcblx0XHRcdFx0cXVlcnkgKz0gXG5cdFx0XHRcdFx0JyZmYWNldC4nICtcblx0XHRcdFx0XHRmYWNldCArXG5cdFx0XHRcdFx0Jz0nICtcblx0XHRcdFx0XHQoKGZhY2V0ID09PSAnY291bnRyeScpID8gZmFjZXRDb25maWcucmVwbGFjZSgnMTAnLCAnMzAwJykgOiBmYWNldENvbmZpZyk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRmZXRjaChiYXNlVXJsICsgc2VhcmNoQXBpICsgcXVlcnkpXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXMpIHtcblx0XHRcdFx0aWYgKHJlcy5zdGF0dXMgIT09IDIwMCkge1xuXHRcdFx0XHRcdHJlamVjdCgnZmV0Y2ggZmFpbGVkIHdpdGggc3RhdHVzICcgKyByZXMuc3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXN1bHRzKSB7XG5cdFx0XHRcdHJlc29sdmUocmVzdWx0cy5mYWNldHMpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdHJlamVjdChlKTtcblx0XHRcdH0pO1xuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpSGFuZGxlcjsiLCJ2YXIgbWFyZ2luID0ge3RvcDogNDAsIHJpZ2h0OiAxMCwgYm90dG9tOiAxMCwgbGVmdDogMTB9O1xudmFyIHdpZHRoID0gNTYwIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG52YXIgaGVpZ2h0ID0gNTQwIC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbmZ1bmN0aW9uIGdlbmVyYXRlQ2hhcnQoZGF0YSkge1xuXHR2YXIgeSA9IGQzLnNjYWxlLm9yZGluYWwoKVxuXHRcdC5kb21haW4oZGF0YS5uYW1lcylcblx0XHQucmFuZ2VSb3VuZEJhbmRzKFtoZWlnaHQsIDBdLCAuMSk7XG5cblx0dmFyIHggPSBkMy5zY2FsZS5saW5lYXIoKVxuXHRcdC5kb21haW4oWzAsIGQzLm1heChkYXRhLnJlYWRzKV0pXG5cdFx0LnJhbmdlKFswLCB3aWR0aF0pO1xuXG5cdHZhciB4QXhpcyA9IGQzLnN2Zy5heGlzKClcblx0XHQuc2NhbGUoeClcblx0XHQub3JpZW50KCd0b3AnKTtcblxuXHR2YXIgY2hhcnQgPSBkMy5zZWxlY3QoJy5yZXN1bHQtYm94X19jaGFydC0tJyArIGRhdGEuZmFjZXQpXG5cdFx0XHQuYXR0cignd2lkdGgnLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuXHRcdFx0LmF0dHIoJ2hlaWdodCcsIGhlaWdodCArIG1hcmdpbi50b3AgKyBtYXJnaW4uYm90dG9tKVxuXHRcdC5hcHBlbmQoJ2cnKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIG1hcmdpbi5sZWZ0ICsgJywnICsgbWFyZ2luLnRvcCArICcpJyk7XG5cblx0Y2hhcnQuYXBwZW5kKCdnJylcblx0XHQuYXR0cignY2xhc3MnLCAncmVzdWx0LWJveF9fY2hhcnRfX2F4aXMgcmVzdWx0LWJveF9fY2hhcnRfX2F4aXMtLXgnKVxuXHRcdC5jYWxsKHhBeGlzKTtcblxuXHR2YXIgYmFyID0gY2hhcnQuc2VsZWN0QWxsKCcucmVzdWx0LWJveF9fY2hhcnRfX2Jhci13cmFwcGVyJylcblx0XHRcdC5kYXRhKGRhdGEucmVhZHMpXG5cdFx0LmVudGVyKCkuYXBwZW5kKCdnJylcblx0XHRcdC5hdHRyKCdjbGFzcycsICdyZXN1bHQtYm94X19jaGFydF9fYmFyLXdyYXBwZXInKVxuXHRcdFx0LmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQsIGkpIHsgcmV0dXJuICd0cmFuc2xhdGUoMCwnICsgaSAqIHkucmFuZ2VCYW5kKCkgKyAnKSc7IH0pO1xuXG5cdGJhci5hcHBlbmQoJ3JlY3QnKVxuXHRcdC5hdHRyKCdjbGFzcycsICdyZXN1bHQtYm94X19jaGFydF9fYmFyJylcblx0XHQuYXR0cignd2lkdGgnLCB4KVxuXHRcdC5hdHRyKCdoZWlnaHQnLCB5LnJhbmdlQmFuZCgpIC0gMSlcblx0XHQuc3R5bGUoJ2N1cnNvcicsICdwb2ludGVyJylcblx0XHQub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuXHRcdFx0ZG9jdW1lbnQubG9jYXRpb24uaHJlZiA9ICdodHRwOi8vd3d3Lmdvb2dsZS5jb20vJztcblx0XHR9KTtcblxuXHRiYXIuYXBwZW5kKCd0ZXh0Jylcblx0XHQuYXR0cigneCcsIG1hcmdpbi5sZWZ0KVxuXHRcdC5hdHRyKCd5JywgeS5yYW5nZUJhbmQoKSAvIDIpXG5cdFx0LmF0dHIoJ2R5JywgJy4zNWVtJylcblx0XHQudGV4dChmdW5jdGlvbihkLCBpKSB7IHJldHVybiBkYXRhLm5hbWVzW2ldOyB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5lcmF0ZUNoYXJ0OyIsInZhciBtYXJnaW4gPSB7dG9wOiA0MCwgcmlnaHQ6IDEwLCBib3R0b206IDEwLCBsZWZ0OiAxMH07XG52YXIgd2lkdGggPSA1NjAgLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcbnZhciBoZWlnaHQgPSA0MDA7XG5cbmZ1bmN0aW9uIGdlbmVyYXRlTWFwKGRhdGEpIHtcblx0dmFyIHNjYWxlID0gZDMuc2NhbGUubGluZWFyKClcblx0XHQuZG9tYWluKFswLCBkMy5tYXgoZGF0YS5yZWFkcyldKVxuXHRcdC5yYW5nZShbJ3llbGxvdycsICdyZWQnXSk7XG5cblx0XHR2YXIgbWFwID0gbmV3IERhdGFtYXAoe1xuXHRcdFx0ZWxlbWVudDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnJlc3VsdC1ib3hfX2NoYXJ0LS0nICsgZGF0YS5mYWNldCksXG5cdFx0XHRwcm9qZWN0aW9uOiAnbWVyY2F0b3InLFxuXHRcdFx0d2lkdGg6IHdpZHRoLFxuXHRcdFx0aGVpZ2h0OiBoZWlnaHQsXG5cdFx0XHRmaWxsczoge1xuXHRcdFx0XHRkZWZhdWx0RmlsbDogJyNhMWRiYjInLFxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dmFyIG1hcEluZm8gPSB7fTtcblxuXHRcdGRhdGEubmFtZXMuZm9yRWFjaChmdW5jdGlvbihjb3VudHJ5LCBpbmRleCkge1xuXHRcdFx0bWFwSW5mb1tjb3VudHJ5XSA9IHNjYWxlKGRhdGEucmVhZHNbaW5kZXhdKTtcblx0XHR9KTtcblxuXHRcdG1hcC51cGRhdGVDaG9yb3BsZXRoKG1hcEluZm8pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlbmVyYXRlTWFwOyJdfQ==
