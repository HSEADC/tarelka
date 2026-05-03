(self["webpackChunkTarelka"] = self["webpackChunkTarelka"] || []).push([["index"],{

/***/ "./node_modules/airtable/lib/airtable.umd.js":
/*!***************************************************!*\
  !*** ./node_modules/airtable/lib/airtable.umd.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

(function(f){if(true){module.exports=f()}else // removed by dead control flow
{ var g; }})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c=undefined;if(!f&&c)return require(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u=undefined,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// istanbul ignore file
var AbortController;
var browserGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null; // self is the global in web workers
if (!browserGlobal) {
    AbortController = require('abort-controller');
}
else if ('signal' in new Request('https://airtable.com')) {
    AbortController = browserGlobal.AbortController;
}
else {
    /* eslint-disable @typescript-eslint/no-var-requires */
    var polyfill = require('abortcontroller-polyfill/dist/cjs-ponyfill');
    /* eslint-enable @typescript-eslint/no-var-requires */
    AbortController = polyfill.AbortController;
}
module.exports = AbortController;

},{"abort-controller":20,"abortcontroller-polyfill/dist/cjs-ponyfill":19}],2:[function(require,module,exports){
"use strict";
var AirtableError = /** @class */ (function () {
    function AirtableError(error, message, statusCode) {
        this.error = error;
        this.message = message;
        this.statusCode = statusCode;
    }
    AirtableError.prototype.toString = function () {
        return [
            this.message,
            '(',
            this.error,
            ')',
            this.statusCode ? "[Http code " + this.statusCode + "]" : '',
        ].join('');
    };
    return AirtableError;
}());
module.exports = AirtableError;

},{}],3:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var get_1 = __importDefault(require("lodash/get"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var keys_1 = __importDefault(require("lodash/keys"));
var fetch_1 = __importDefault(require("./fetch"));
var abort_controller_1 = __importDefault(require("./abort-controller"));
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var airtable_error_1 = __importDefault(require("./airtable_error"));
var table_1 = __importDefault(require("./table"));
var http_headers_1 = __importDefault(require("./http_headers"));
var run_action_1 = __importDefault(require("./run_action"));
var package_version_1 = __importDefault(require("./package_version"));
var exponential_backoff_with_jitter_1 = __importDefault(require("./exponential_backoff_with_jitter"));
var userAgent = "Airtable.js/" + package_version_1.default;
var Base = /** @class */ (function () {
    function Base(airtable, baseId) {
        this._airtable = airtable;
        this._id = baseId;
    }
    Base.prototype.table = function (tableName) {
        return new table_1.default(this, null, tableName);
    };
    Base.prototype.makeRequest = function (options) {
        var _this = this;
        var _a;
        if (options === void 0) { options = {}; }
        var method = get_1.default(options, 'method', 'GET').toUpperCase();
        var url = this._airtable._endpointUrl + "/v" + this._airtable._apiVersionMajor + "/" + this._id + get_1.default(options, 'path', '/') + "?" + object_to_query_param_string_1.default(get_1.default(options, 'qs', {}));
        var controller = new abort_controller_1.default();
        var headers = this._getRequestHeaders(Object.assign({}, this._airtable._customHeaders, (_a = options.headers) !== null && _a !== void 0 ? _a : {}));
        var requestOptions = {
            method: method,
            headers: headers,
            signal: controller.signal,
        };
        if ('body' in options && _canRequestMethodIncludeBody(method)) {
            requestOptions.body = JSON.stringify(options.body);
        }
        var timeout = setTimeout(function () {
            controller.abort();
        }, this._airtable._requestTimeout);
        return new Promise(function (resolve, reject) {
            fetch_1.default(url, requestOptions)
                .then(function (resp) {
                clearTimeout(timeout);
                if (resp.status === 429 && !_this._airtable._noRetryIfRateLimited) {
                    var numAttempts_1 = get_1.default(options, '_numAttempts', 0);
                    var backoffDelayMs = exponential_backoff_with_jitter_1.default(numAttempts_1);
                    setTimeout(function () {
                        var newOptions = __assign(__assign({}, options), { _numAttempts: numAttempts_1 + 1 });
                        _this.makeRequest(newOptions)
                            .then(resolve)
                            .catch(reject);
                    }, backoffDelayMs);
                }
                else {
                    resp.json()
                        .then(function (body) {
                        var err = _this._checkStatusForError(resp.status, body) ||
                            _getErrorForNonObjectBody(resp.status, body);
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve({
                                statusCode: resp.status,
                                headers: resp.headers,
                                body: body,
                            });
                        }
                    })
                        .catch(function () {
                        var err = _getErrorForNonObjectBody(resp.status);
                        reject(err);
                    });
                }
            })
                .catch(function (err) {
                clearTimeout(timeout);
                err = new airtable_error_1.default('CONNECTION_ERROR', err.message, null);
                reject(err);
            });
        });
    };
    /**
     * @deprecated This method is deprecated.
     */
    Base.prototype.runAction = function (method, path, queryParams, bodyData, callback) {
        run_action_1.default(this, method, path, queryParams, bodyData, callback, 0);
    };
    Base.prototype._getRequestHeaders = function (headers) {
        var result = new http_headers_1.default();
        result.set('Authorization', "Bearer " + this._airtable._apiKey);
        result.set('User-Agent', userAgent);
        result.set('Content-Type', 'application/json');
        for (var _i = 0, _a = keys_1.default(headers); _i < _a.length; _i++) {
            var headerKey = _a[_i];
            result.set(headerKey, headers[headerKey]);
        }
        return result.toJSON();
    };
    Base.prototype._checkStatusForError = function (statusCode, body) {
        var _a = (body !== null && body !== void 0 ? body : { error: {} }).error, error = _a === void 0 ? {} : _a;
        var type = error.type, message = error.message;
        if (statusCode === 401) {
            return new airtable_error_1.default('AUTHENTICATION_REQUIRED', 'You should provide valid api key to perform this operation', statusCode);
        }
        else if (statusCode === 403) {
            return new airtable_error_1.default('NOT_AUTHORIZED', 'You are not authorized to perform this operation', statusCode);
        }
        else if (statusCode === 404) {
            return new airtable_error_1.default('NOT_FOUND', message !== null && message !== void 0 ? message : 'Could not find what you are looking for', statusCode);
        }
        else if (statusCode === 413) {
            return new airtable_error_1.default('REQUEST_TOO_LARGE', 'Request body is too large', statusCode);
        }
        else if (statusCode === 422) {
            return new airtable_error_1.default(type !== null && type !== void 0 ? type : 'UNPROCESSABLE_ENTITY', message !== null && message !== void 0 ? message : 'The operation cannot be processed', statusCode);
        }
        else if (statusCode === 429) {
            return new airtable_error_1.default('TOO_MANY_REQUESTS', 'You have made too many requests in a short period of time. Please retry your request later', statusCode);
        }
        else if (statusCode === 500) {
            return new airtable_error_1.default('SERVER_ERROR', 'Try again. If the problem persists, contact support.', statusCode);
        }
        else if (statusCode === 503) {
            return new airtable_error_1.default('SERVICE_UNAVAILABLE', 'The service is temporarily unavailable. Please retry shortly.', statusCode);
        }
        else if (statusCode >= 400) {
            return new airtable_error_1.default(type !== null && type !== void 0 ? type : 'UNEXPECTED_ERROR', message !== null && message !== void 0 ? message : 'An unexpected error occurred', statusCode);
        }
        else {
            return null;
        }
    };
    Base.prototype.doCall = function (tableName) {
        return this.table(tableName);
    };
    Base.prototype.getId = function () {
        return this._id;
    };
    Base.createFunctor = function (airtable, baseId) {
        var base = new Base(airtable, baseId);
        var baseFn = function (tableName) {
            return base.doCall(tableName);
        };
        baseFn._base = base;
        baseFn.table = base.table.bind(base);
        baseFn.makeRequest = base.makeRequest.bind(base);
        baseFn.runAction = base.runAction.bind(base);
        baseFn.getId = base.getId.bind(base);
        return baseFn;
    };
    return Base;
}());
function _canRequestMethodIncludeBody(method) {
    return method !== 'GET' && method !== 'DELETE';
}
function _getErrorForNonObjectBody(statusCode, body) {
    if (isPlainObject_1.default(body)) {
        return null;
    }
    else {
        return new airtable_error_1.default('UNEXPECTED_ERROR', 'The response from Airtable was invalid JSON. Please try again soon.', statusCode);
    }
}
module.exports = Base;

},{"./abort-controller":1,"./airtable_error":2,"./exponential_backoff_with_jitter":6,"./fetch":7,"./http_headers":9,"./object_to_query_param_string":11,"./package_version":12,"./run_action":16,"./table":17,"lodash/get":77,"lodash/isPlainObject":89,"lodash/keys":93}],4:[function(require,module,exports){
"use strict";
/**
 * Given a function fn that takes a callback as its last argument, returns
 * a new version of the function that takes the callback optionally. If
 * the function is not called with a callback for the last argument, the
 * function will return a promise instead.
 */
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
function callbackToPromise(fn, context, callbackArgIndex) {
    if (callbackArgIndex === void 0) { callbackArgIndex = void 0; }
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types */
    return function () {
        var callArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            callArgs[_i] = arguments[_i];
        }
        var thisCallbackArgIndex;
        if (callbackArgIndex === void 0) {
            // istanbul ignore next
            thisCallbackArgIndex = callArgs.length > 0 ? callArgs.length - 1 : 0;
        }
        else {
            thisCallbackArgIndex = callbackArgIndex;
        }
        var callbackArg = callArgs[thisCallbackArgIndex];
        if (typeof callbackArg === 'function') {
            fn.apply(context, callArgs);
            return void 0;
        }
        else {
            var args_1 = [];
            // If an explicit callbackArgIndex is set, but the function is called
            // with too few arguments, we want to push undefined onto args so that
            // our constructed callback ends up at the right index.
            var argLen = Math.max(callArgs.length, thisCallbackArgIndex);
            for (var i = 0; i < argLen; i++) {
                args_1.push(callArgs[i]);
            }
            return new Promise(function (resolve, reject) {
                args_1.push(function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
                fn.apply(context, args_1);
            });
        }
    };
}
module.exports = callbackToPromise;

},{}],5:[function(require,module,exports){
"use strict";
var didWarnForDeprecation = {};
/**
 * Convenience function for marking a function as deprecated.
 *
 * Will emit a warning the first time that function is called.
 *
 * @param fn the function to mark as deprecated.
 * @param key a unique key identifying the function.
 * @param message the warning message.
 *
 * @return a wrapped function
 */
function deprecate(fn, key, message) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!didWarnForDeprecation[key]) {
            didWarnForDeprecation[key] = true;
            console.warn(message);
        }
        fn.apply(this, args);
    };
}
module.exports = deprecate;

},{}],6:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var internal_config_json_1 = __importDefault(require("./internal_config.json"));
// "Full Jitter" algorithm taken from https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
function exponentialBackoffWithJitter(numberOfRetries) {
    var rawBackoffTimeMs = internal_config_json_1.default.INITIAL_RETRY_DELAY_IF_RATE_LIMITED * Math.pow(2, numberOfRetries);
    var clippedBackoffTimeMs = Math.min(internal_config_json_1.default.MAX_RETRY_DELAY_IF_RATE_LIMITED, rawBackoffTimeMs);
    var jitteredBackoffTimeMs = Math.random() * clippedBackoffTimeMs;
    return jitteredBackoffTimeMs;
}
module.exports = exponentialBackoffWithJitter;

},{"./internal_config.json":10}],7:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
// istanbul ignore file
var node_fetch_1 = __importDefault(require("node-fetch"));
var browserGlobal = typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : null; // self is the global in web workers
module.exports = !browserGlobal ? node_fetch_1.default : browserGlobal.fetch.bind(browserGlobal);

},{"node-fetch":20}],8:[function(require,module,exports){
"use strict";
/* eslint-enable @typescript-eslint/no-explicit-any */
function has(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
}
module.exports = has;

},{}],9:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var keys_1 = __importDefault(require("lodash/keys"));
var isBrowser = typeof window !== 'undefined';
var HttpHeaders = /** @class */ (function () {
    function HttpHeaders() {
        this._headersByLowercasedKey = {};
    }
    HttpHeaders.prototype.set = function (headerKey, headerValue) {
        var lowercasedKey = headerKey.toLowerCase();
        if (lowercasedKey === 'x-airtable-user-agent') {
            lowercasedKey = 'user-agent';
            headerKey = 'User-Agent';
        }
        this._headersByLowercasedKey[lowercasedKey] = {
            headerKey: headerKey,
            headerValue: headerValue,
        };
    };
    HttpHeaders.prototype.toJSON = function () {
        var result = {};
        for (var _i = 0, _a = keys_1.default(this._headersByLowercasedKey); _i < _a.length; _i++) {
            var lowercasedKey = _a[_i];
            var headerDefinition = this._headersByLowercasedKey[lowercasedKey];
            var headerKey = void 0;
            /* istanbul ignore next */
            if (isBrowser && lowercasedKey === 'user-agent') {
                // Some browsers do not allow overriding the user agent.
                // https://github.com/Airtable/airtable.js/issues/52
                headerKey = 'X-Airtable-User-Agent';
            }
            else {
                headerKey = headerDefinition.headerKey;
            }
            result[headerKey] = headerDefinition.headerValue;
        }
        return result;
    };
    return HttpHeaders;
}());
module.exports = HttpHeaders;

},{"lodash/keys":93}],10:[function(require,module,exports){
module.exports={
    "INITIAL_RETRY_DELAY_IF_RATE_LIMITED": 5000,
    "MAX_RETRY_DELAY_IF_RATE_LIMITED": 600000
}

},{}],11:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isArray_1 = __importDefault(require("lodash/isArray"));
var isNil_1 = __importDefault(require("lodash/isNil"));
var keys_1 = __importDefault(require("lodash/keys"));
/* eslint-enable @typescript-eslint/no-explicit-any */
// Adapted from jQuery.param:
// https://github.com/jquery/jquery/blob/2.2-stable/src/serialize.js
function buildParams(prefix, obj, addFn) {
    if (isArray_1.default(obj)) {
        // Serialize array item.
        for (var index = 0; index < obj.length; index++) {
            var value = obj[index];
            if (/\[\]$/.test(prefix)) {
                // Treat each array item as a scalar.
                addFn(prefix, value);
            }
            else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams(prefix + "[" + (typeof value === 'object' && value !== null ? index : '') + "]", value, addFn);
            }
        }
    }
    else if (typeof obj === 'object') {
        // Serialize object item.
        for (var _i = 0, _a = keys_1.default(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = obj[key];
            buildParams(prefix + "[" + key + "]", value, addFn);
        }
    }
    else {
        // Serialize scalar item.
        addFn(prefix, obj);
    }
}
function objectToQueryParamString(obj) {
    var parts = [];
    var addFn = function (key, value) {
        value = isNil_1.default(value) ? '' : value;
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    };
    for (var _i = 0, _a = keys_1.default(obj); _i < _a.length; _i++) {
        var key = _a[_i];
        var value = obj[key];
        buildParams(key, value, addFn);
    }
    return parts.join('&').replace(/%20/g, '+');
}
module.exports = objectToQueryParamString;

},{"lodash/isArray":79,"lodash/isNil":85,"lodash/keys":93}],12:[function(require,module,exports){
"use strict";
module.exports = "0.12.2";

},{}],13:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isFunction_1 = __importDefault(require("lodash/isFunction"));
var keys_1 = __importDefault(require("lodash/keys"));
var record_1 = __importDefault(require("./record"));
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var has_1 = __importDefault(require("./has"));
var query_params_1 = require("./query_params");
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
/**
 * Builds a query object. Won't fetch until `firstPage` or
 * or `eachPage` is called.
 *
 * Params should be validated prior to being passed to Query
 * with `Query.validateParams`.
 */
var Query = /** @class */ (function () {
    function Query(table, params) {
        this._table = table;
        this._params = params;
        this.firstPage = callback_to_promise_1.default(firstPage, this);
        this.eachPage = callback_to_promise_1.default(eachPage, this, 1);
        this.all = callback_to_promise_1.default(all, this);
    }
    /**
     * Validates the parameters for passing to the Query constructor.
     *
     * @params {object} params parameters to validate
     *
     * @return an object with two keys:
     *  validParams: the object that should be passed to the constructor.
     *  ignoredKeys: a list of keys that will be ignored.
     *  errors: a list of error messages.
     */
    Query.validateParams = function (params) {
        var validParams = {};
        var ignoredKeys = [];
        var errors = [];
        for (var _i = 0, _a = keys_1.default(params); _i < _a.length; _i++) {
            var key = _a[_i];
            var value = params[key];
            if (has_1.default(Query.paramValidators, key)) {
                var validator = Query.paramValidators[key];
                var validationResult = validator(value);
                if (validationResult.pass) {
                    validParams[key] = value;
                }
                else {
                    errors.push(validationResult.error);
                }
            }
            else {
                ignoredKeys.push(key);
            }
        }
        return {
            validParams: validParams,
            ignoredKeys: ignoredKeys,
            errors: errors,
        };
    };
    Query.paramValidators = query_params_1.paramValidators;
    return Query;
}());
/**
 * Fetches the first page of results for the query asynchronously,
 * then calls `done(error, records)`.
 */
function firstPage(done) {
    if (!isFunction_1.default(done)) {
        throw new Error('The first parameter to `firstPage` must be a function');
    }
    this.eachPage(function (records) {
        done(null, records);
    }, function (error) {
        done(error, null);
    });
}
/**
 * Fetches each page of results for the query asynchronously.
 *
 * Calls `pageCallback(records, fetchNextPage)` for each
 * page. You must call `fetchNextPage()` to fetch the next page of
 * results.
 *
 * After fetching all pages, or if there's an error, calls
 * `done(error)`.
 */
function eachPage(pageCallback, done) {
    var _this = this;
    if (!isFunction_1.default(pageCallback)) {
        throw new Error('The first parameter to `eachPage` must be a function');
    }
    if (!isFunction_1.default(done) && done !== void 0) {
        throw new Error('The second parameter to `eachPage` must be a function or undefined');
    }
    var params = __assign({}, this._params);
    var pathAndParamsAsString = "/" + this._table._urlEncodedNameOrId() + "?" + object_to_query_param_string_1.default(params);
    var queryParams = {};
    var requestData = null;
    var method;
    var path;
    if (params.method === 'post' || pathAndParamsAsString.length > query_params_1.URL_CHARACTER_LENGTH_LIMIT) {
        // There is a 16kb limit on GET requests. Since the URL makes up nearly all of the request size, we check for any requests that
        // that come close to this limit and send it as a POST instead. Additionally, we'll send the request as a post if it is specified
        // with the request params
        requestData = params;
        method = 'post';
        path = "/" + this._table._urlEncodedNameOrId() + "/listRecords";
        var paramNames = Object.keys(params);
        for (var _i = 0, paramNames_1 = paramNames; _i < paramNames_1.length; _i++) {
            var paramName = paramNames_1[_i];
            if (query_params_1.shouldListRecordsParamBePassedAsParameter(paramName)) {
                // timeZone and userLocale is parsed from the GET request separately from the other params. This parsing
                // does not occurring within the body parser we use for POST requests, so this will still need to be passed
                // via query params
                queryParams[paramName] = params[paramName];
            }
            else {
                requestData[paramName] = params[paramName];
            }
        }
    }
    else {
        method = 'get';
        queryParams = params;
        path = "/" + this._table._urlEncodedNameOrId();
    }
    var inner = function () {
        _this._table._base.runAction(method, path, queryParams, requestData, function (err, response, result) {
            if (err) {
                done(err, null);
            }
            else {
                var next = void 0;
                if (result.offset) {
                    params.offset = result.offset;
                    next = inner;
                }
                else {
                    next = function () {
                        done(null);
                    };
                }
                var records = result.records.map(function (recordJson) {
                    return new record_1.default(_this._table, null, recordJson);
                });
                pageCallback(records, next);
            }
        });
    };
    inner();
}
/**
 * Fetches all pages of results asynchronously. May take a long time.
 */
function all(done) {
    if (!isFunction_1.default(done)) {
        throw new Error('The first parameter to `all` must be a function');
    }
    var allRecords = [];
    this.eachPage(function (pageRecords, fetchNextPage) {
        allRecords.push.apply(allRecords, pageRecords);
        fetchNextPage();
    }, function (err) {
        if (err) {
            done(err, null);
        }
        else {
            done(null, allRecords);
        }
    });
}
module.exports = Query;

},{"./callback_to_promise":4,"./has":8,"./object_to_query_param_string":11,"./query_params":14,"./record":15,"lodash/isFunction":83,"lodash/keys":93}],14:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldListRecordsParamBePassedAsParameter = exports.URL_CHARACTER_LENGTH_LIMIT = exports.paramValidators = void 0;
var typecheck_1 = __importDefault(require("./typecheck"));
var isString_1 = __importDefault(require("lodash/isString"));
var isNumber_1 = __importDefault(require("lodash/isNumber"));
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var isBoolean_1 = __importDefault(require("lodash/isBoolean"));
exports.paramValidators = {
    fields: typecheck_1.default(typecheck_1.default.isArrayOf(isString_1.default), 'the value for `fields` should be an array of strings'),
    filterByFormula: typecheck_1.default(isString_1.default, 'the value for `filterByFormula` should be a string'),
    maxRecords: typecheck_1.default(isNumber_1.default, 'the value for `maxRecords` should be a number'),
    pageSize: typecheck_1.default(isNumber_1.default, 'the value for `pageSize` should be a number'),
    offset: typecheck_1.default(isNumber_1.default, 'the value for `offset` should be a number'),
    sort: typecheck_1.default(typecheck_1.default.isArrayOf(function (obj) {
        return (isPlainObject_1.default(obj) &&
            isString_1.default(obj.field) &&
            (obj.direction === void 0 || ['asc', 'desc'].includes(obj.direction)));
    }), 'the value for `sort` should be an array of sort objects. ' +
        'Each sort object must have a string `field` value, and an optional ' +
        '`direction` value that is "asc" or "desc".'),
    view: typecheck_1.default(isString_1.default, 'the value for `view` should be a string'),
    cellFormat: typecheck_1.default(function (cellFormat) {
        return isString_1.default(cellFormat) && ['json', 'string'].includes(cellFormat);
    }, 'the value for `cellFormat` should be "json" or "string"'),
    timeZone: typecheck_1.default(isString_1.default, 'the value for `timeZone` should be a string'),
    userLocale: typecheck_1.default(isString_1.default, 'the value for `userLocale` should be a string'),
    method: typecheck_1.default(function (method) {
        return isString_1.default(method) && ['get', 'post'].includes(method);
    }, 'the value for `method` should be "get" or "post"'),
    returnFieldsByFieldId: typecheck_1.default(isBoolean_1.default, 'the value for `returnFieldsByFieldId` should be a boolean'),
    recordMetadata: typecheck_1.default(typecheck_1.default.isArrayOf(isString_1.default), 'the value for `recordMetadata` should be an array of strings'),
};
exports.URL_CHARACTER_LENGTH_LIMIT = 15000;
exports.shouldListRecordsParamBePassedAsParameter = function (paramName) {
    return paramName === 'timeZone' || paramName === 'userLocale';
};

},{"./typecheck":18,"lodash/isBoolean":81,"lodash/isNumber":86,"lodash/isPlainObject":89,"lodash/isString":90}],15:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var Record = /** @class */ (function () {
    function Record(table, recordId, recordJson) {
        this._table = table;
        this.id = recordId || recordJson.id;
        if (recordJson) {
            this.commentCount = recordJson.commentCount;
        }
        this.setRawJson(recordJson);
        this.save = callback_to_promise_1.default(save, this);
        this.patchUpdate = callback_to_promise_1.default(patchUpdate, this);
        this.putUpdate = callback_to_promise_1.default(putUpdate, this);
        this.destroy = callback_to_promise_1.default(destroy, this);
        this.fetch = callback_to_promise_1.default(fetch, this);
        this.updateFields = this.patchUpdate;
        this.replaceFields = this.putUpdate;
    }
    Record.prototype.getId = function () {
        return this.id;
    };
    Record.prototype.get = function (columnName) {
        return this.fields[columnName];
    };
    Record.prototype.set = function (columnName, columnValue) {
        this.fields[columnName] = columnValue;
    };
    Record.prototype.setRawJson = function (rawJson) {
        this._rawJson = rawJson;
        this.fields = (this._rawJson && this._rawJson.fields) || {};
    };
    return Record;
}());
function save(done) {
    this.putUpdate(this.fields, done);
}
function patchUpdate(cellValuesByName, opts, done) {
    var _this = this;
    if (!done) {
        done = opts;
        opts = {};
    }
    var updateBody = __assign({ fields: cellValuesByName }, opts);
    this._table._base.runAction('patch', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, updateBody, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
function putUpdate(cellValuesByName, opts, done) {
    var _this = this;
    if (!done) {
        done = opts;
        opts = {};
    }
    var updateBody = __assign({ fields: cellValuesByName }, opts);
    this._table._base.runAction('put', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, updateBody, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
function destroy(done) {
    var _this = this;
    this._table._base.runAction('delete', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, null, function (err) {
        if (err) {
            done(err);
            return;
        }
        done(null, _this);
    });
}
function fetch(done) {
    var _this = this;
    this._table._base.runAction('get', "/" + this._table._urlEncodedNameOrId() + "/" + this.id, {}, null, function (err, response, results) {
        if (err) {
            done(err);
            return;
        }
        _this.setRawJson(results);
        done(null, _this);
    });
}
module.exports = Record;

},{"./callback_to_promise":4}],16:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var exponential_backoff_with_jitter_1 = __importDefault(require("./exponential_backoff_with_jitter"));
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var package_version_1 = __importDefault(require("./package_version"));
var fetch_1 = __importDefault(require("./fetch"));
var abort_controller_1 = __importDefault(require("./abort-controller"));
var userAgent = "Airtable.js/" + package_version_1.default;
function runAction(base, method, path, queryParams, bodyData, callback, numAttempts) {
    var url = base._airtable._endpointUrl + "/v" + base._airtable._apiVersionMajor + "/" + base._id + path + "?" + object_to_query_param_string_1.default(queryParams);
    var headers = {
        authorization: "Bearer " + base._airtable._apiKey,
        'x-api-version': base._airtable._apiVersion,
        'x-airtable-application-id': base.getId(),
        'content-type': 'application/json',
    };
    var isBrowser = typeof window !== 'undefined';
    // Some browsers do not allow overriding the user agent.
    // https://github.com/Airtable/airtable.js/issues/52
    if (isBrowser) {
        headers['x-airtable-user-agent'] = userAgent;
    }
    else {
        headers['User-Agent'] = userAgent;
    }
    var controller = new abort_controller_1.default();
    var normalizedMethod = method.toUpperCase();
    var options = {
        method: normalizedMethod,
        headers: headers,
        signal: controller.signal,
    };
    if (bodyData !== null) {
        if (normalizedMethod === 'GET' || normalizedMethod === 'HEAD') {
            console.warn('body argument to runAction are ignored with GET or HEAD requests');
        }
        else {
            options.body = JSON.stringify(bodyData);
        }
    }
    var timeout = setTimeout(function () {
        controller.abort();
    }, base._airtable._requestTimeout);
    fetch_1.default(url, options)
        .then(function (resp) {
        clearTimeout(timeout);
        if (resp.status === 429 && !base._airtable._noRetryIfRateLimited) {
            var backoffDelayMs = exponential_backoff_with_jitter_1.default(numAttempts);
            setTimeout(function () {
                runAction(base, method, path, queryParams, bodyData, callback, numAttempts + 1);
            }, backoffDelayMs);
        }
        else {
            resp.json()
                .then(function (body) {
                var error = base._checkStatusForError(resp.status, body);
                // Ensure Response interface matches interface from
                // `request` Response object
                var r = {};
                Object.keys(resp).forEach(function (property) {
                    r[property] = resp[property];
                });
                r.body = body;
                r.statusCode = resp.status;
                callback(error, r, body);
            })
                .catch(function () {
                callback(base._checkStatusForError(resp.status));
            });
        }
    })
        .catch(function (error) {
        clearTimeout(timeout);
        callback(error);
    });
}
module.exports = runAction;

},{"./abort-controller":1,"./exponential_backoff_with_jitter":6,"./fetch":7,"./object_to_query_param_string":11,"./package_version":12}],17:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var isPlainObject_1 = __importDefault(require("lodash/isPlainObject"));
var deprecate_1 = __importDefault(require("./deprecate"));
var query_1 = __importDefault(require("./query"));
var query_params_1 = require("./query_params");
var object_to_query_param_string_1 = __importDefault(require("./object_to_query_param_string"));
var record_1 = __importDefault(require("./record"));
var callback_to_promise_1 = __importDefault(require("./callback_to_promise"));
var Table = /** @class */ (function () {
    function Table(base, tableId, tableName) {
        if (!tableId && !tableName) {
            throw new Error('Table name or table ID is required');
        }
        this._base = base;
        this.id = tableId;
        this.name = tableName;
        // Public API
        this.find = callback_to_promise_1.default(this._findRecordById, this);
        this.select = this._selectRecords.bind(this);
        this.create = callback_to_promise_1.default(this._createRecords, this);
        this.update = callback_to_promise_1.default(this._updateRecords.bind(this, false), this);
        this.replace = callback_to_promise_1.default(this._updateRecords.bind(this, true), this);
        this.destroy = callback_to_promise_1.default(this._destroyRecord, this);
        // Deprecated API
        this.list = deprecate_1.default(this._listRecords.bind(this), 'table.list', 'Airtable: `list()` is deprecated. Use `select()` instead.');
        this.forEach = deprecate_1.default(this._forEachRecord.bind(this), 'table.forEach', 'Airtable: `forEach()` is deprecated. Use `select()` instead.');
    }
    Table.prototype._findRecordById = function (recordId, done) {
        var record = new record_1.default(this, recordId);
        record.fetch(done);
    };
    Table.prototype._selectRecords = function (params) {
        if (params === void 0) {
            params = {};
        }
        if (arguments.length > 1) {
            console.warn("Airtable: `select` takes only one parameter, but it was given " + arguments.length + " parameters. Use `eachPage` or `firstPage` to fetch records.");
        }
        if (isPlainObject_1.default(params)) {
            var validationResults = query_1.default.validateParams(params);
            if (validationResults.errors.length) {
                var formattedErrors = validationResults.errors.map(function (error) {
                    return "  * " + error;
                });
                throw new Error("Airtable: invalid parameters for `select`:\n" + formattedErrors.join('\n'));
            }
            if (validationResults.ignoredKeys.length) {
                console.warn("Airtable: the following parameters to `select` will be ignored: " + validationResults.ignoredKeys.join(', '));
            }
            return new query_1.default(this, validationResults.validParams);
        }
        else {
            throw new Error('Airtable: the parameter for `select` should be a plain object or undefined.');
        }
    };
    Table.prototype._urlEncodedNameOrId = function () {
        return this.id || encodeURIComponent(this.name);
    };
    Table.prototype._createRecords = function (recordsData, optionalParameters, done) {
        var _this = this;
        var isCreatingMultipleRecords = Array.isArray(recordsData);
        if (!done) {
            done = optionalParameters;
            optionalParameters = {};
        }
        var requestData;
        if (isCreatingMultipleRecords) {
            requestData = __assign({ records: recordsData }, optionalParameters);
        }
        else {
            requestData = __assign({ fields: recordsData }, optionalParameters);
        }
        this._base.runAction('post', "/" + this._urlEncodedNameOrId() + "/", {}, requestData, function (err, resp, body) {
            if (err) {
                done(err);
                return;
            }
            var result;
            if (isCreatingMultipleRecords) {
                result = body.records.map(function (record) {
                    return new record_1.default(_this, record.id, record);
                });
            }
            else {
                result = new record_1.default(_this, body.id, body);
            }
            done(null, result);
        });
    };
    Table.prototype._updateRecords = function (isDestructiveUpdate, recordsDataOrRecordId, recordDataOrOptsOrDone, optsOrDone, done) {
        var _this = this;
        var opts;
        if (Array.isArray(recordsDataOrRecordId)) {
            var recordsData = recordsDataOrRecordId;
            opts = isPlainObject_1.default(recordDataOrOptsOrDone) ? recordDataOrOptsOrDone : {};
            done = (optsOrDone || recordDataOrOptsOrDone);
            var method = isDestructiveUpdate ? 'put' : 'patch';
            var requestData = __assign({ records: recordsData }, opts);
            this._base.runAction(method, "/" + this._urlEncodedNameOrId() + "/", {}, requestData, function (err, resp, body) {
                if (err) {
                    done(err);
                    return;
                }
                var result = body.records.map(function (record) {
                    return new record_1.default(_this, record.id, record);
                });
                done(null, result);
            });
        }
        else {
            var recordId = recordsDataOrRecordId;
            var recordData = recordDataOrOptsOrDone;
            opts = isPlainObject_1.default(optsOrDone) ? optsOrDone : {};
            done = (done || optsOrDone);
            var record = new record_1.default(this, recordId);
            if (isDestructiveUpdate) {
                record.putUpdate(recordData, opts, done);
            }
            else {
                record.patchUpdate(recordData, opts, done);
            }
        }
    };
    Table.prototype._destroyRecord = function (recordIdsOrId, done) {
        var _this = this;
        if (Array.isArray(recordIdsOrId)) {
            var queryParams = { records: recordIdsOrId };
            this._base.runAction('delete', "/" + this._urlEncodedNameOrId(), queryParams, null, function (err, response, results) {
                if (err) {
                    done(err);
                    return;
                }
                var records = results.records.map(function (_a) {
                    var id = _a.id;
                    return new record_1.default(_this, id, null);
                });
                done(null, records);
            });
        }
        else {
            var record = new record_1.default(this, recordIdsOrId);
            record.destroy(done);
        }
    };
    Table.prototype._listRecords = function (pageSize, offset, opts, done) {
        var _this = this;
        if (!done) {
            done = opts;
            opts = {};
        }
        var pathAndParamsAsString = "/" + this._urlEncodedNameOrId() + "?" + object_to_query_param_string_1.default(opts);
        var path;
        var listRecordsParameters = {};
        var listRecordsData = null;
        var method;
        if ((typeof opts !== 'function' && opts.method === 'post') ||
            pathAndParamsAsString.length > query_params_1.URL_CHARACTER_LENGTH_LIMIT) {
            // // There is a 16kb limit on GET requests. Since the URL makes up nearly all of the request size, we check for any requests that
            // that come close to this limit and send it as a POST instead. Additionally, we'll send the request as a post if it is specified
            // with the request params
            path = "/" + this._urlEncodedNameOrId() + "/listRecords";
            listRecordsData = __assign(__assign({}, (pageSize && { pageSize: pageSize })), (offset && { offset: offset }));
            method = 'post';
            var paramNames = Object.keys(opts);
            for (var _i = 0, paramNames_1 = paramNames; _i < paramNames_1.length; _i++) {
                var paramName = paramNames_1[_i];
                if (query_params_1.shouldListRecordsParamBePassedAsParameter(paramName)) {
                    listRecordsParameters[paramName] = opts[paramName];
                }
                else {
                    listRecordsData[paramName] = opts[paramName];
                }
            }
        }
        else {
            method = 'get';
            path = "/" + this._urlEncodedNameOrId() + "/";
            listRecordsParameters = __assign({ limit: pageSize, offset: offset }, opts);
        }
        this._base.runAction(method, path, listRecordsParameters, listRecordsData, function (err, response, results) {
            if (err) {
                done(err);
                return;
            }
            var records = results.records.map(function (recordJson) {
                return new record_1.default(_this, null, recordJson);
            });
            done(null, records, results.offset);
        });
    };
    Table.prototype._forEachRecord = function (opts, callback, done) {
        var _this = this;
        if (arguments.length === 2) {
            done = callback;
            callback = opts;
            opts = {};
        }
        var limit = Table.__recordsPerPageForIteration || 100;
        var offset = null;
        var nextPage = function () {
            _this._listRecords(limit, offset, opts, function (err, page, newOffset) {
                if (err) {
                    done(err);
                    return;
                }
                for (var index = 0; index < page.length; index++) {
                    callback(page[index]);
                }
                if (newOffset) {
                    offset = newOffset;
                    nextPage();
                }
                else {
                    done();
                }
            });
        };
        nextPage();
    };
    return Table;
}());
module.exports = Table;

},{"./callback_to_promise":4,"./deprecate":5,"./object_to_query_param_string":11,"./query":13,"./query_params":14,"./record":15,"lodash/isPlainObject":89}],18:[function(require,module,exports){
"use strict";
/* eslint-enable @typescript-eslint/no-explicit-any */
function check(fn, error) {
    return function (value) {
        if (fn(value)) {
            return { pass: true };
        }
        else {
            return { pass: false, error: error };
        }
    };
}
check.isOneOf = function isOneOf(options) {
    return options.includes.bind(options);
};
check.isArrayOf = function (itemValidator) {
    return function (value) {
        return Array.isArray(value) && value.every(itemValidator);
    };
};
module.exports = check;

},{}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

var Emitter =
/*#__PURE__*/
function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    Object.defineProperty(this, 'listeners', {
      value: {},
      writable: true,
      configurable: true
    });
  }

  _createClass(Emitter, [{
    key: "addEventListener",
    value: function addEventListener(type, callback) {
      if (!(type in this.listeners)) {
        this.listeners[type] = [];
      }

      this.listeners[type].push(callback);
    }
  }, {
    key: "removeEventListener",
    value: function removeEventListener(type, callback) {
      if (!(type in this.listeners)) {
        return;
      }

      var stack = this.listeners[type];

      for (var i = 0, l = stack.length; i < l; i++) {
        if (stack[i] === callback) {
          stack.splice(i, 1);
          return;
        }
      }
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      var _this = this;

      if (!(event.type in this.listeners)) {
        return;
      }

      var debounce = function debounce(callback) {
        setTimeout(function () {
          return callback.call(_this, event);
        });
      };

      var stack = this.listeners[event.type];

      for (var i = 0, l = stack.length; i < l; i++) {
        debounce(stack[i]);
      }

      return !event.defaultPrevented;
    }
  }]);

  return Emitter;
}();

var AbortSignal =
/*#__PURE__*/
function (_Emitter) {
  _inherits(AbortSignal, _Emitter);

  function AbortSignal() {
    var _this2;

    _classCallCheck(this, AbortSignal);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(AbortSignal).call(this)); // Some versions of babel does not transpile super() correctly for IE <= 10, if the parent
    // constructor has failed to run, then "this.listeners" will still be undefined and then we call
    // the parent constructor directly instead as a workaround. For general details, see babel bug:
    // https://github.com/babel/babel/issues/3041
    // This hack was added as a fix for the issue described here:
    // https://github.com/Financial-Times/polyfill-library/pull/59#issuecomment-477558042

    if (!_this2.listeners) {
      Emitter.call(_assertThisInitialized(_this2));
    } // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
    // we want Object.keys(new AbortController().signal) to be [] for compat with the native impl


    Object.defineProperty(_assertThisInitialized(_this2), 'aborted', {
      value: false,
      writable: true,
      configurable: true
    });
    Object.defineProperty(_assertThisInitialized(_this2), 'onabort', {
      value: null,
      writable: true,
      configurable: true
    });
    return _this2;
  }

  _createClass(AbortSignal, [{
    key: "toString",
    value: function toString() {
      return '[object AbortSignal]';
    }
  }, {
    key: "dispatchEvent",
    value: function dispatchEvent(event) {
      if (event.type === 'abort') {
        this.aborted = true;

        if (typeof this.onabort === 'function') {
          this.onabort.call(this, event);
        }
      }

      _get(_getPrototypeOf(AbortSignal.prototype), "dispatchEvent", this).call(this, event);
    }
  }]);

  return AbortSignal;
}(Emitter);
var AbortController =
/*#__PURE__*/
function () {
  function AbortController() {
    _classCallCheck(this, AbortController);

    // Compared to assignment, Object.defineProperty makes properties non-enumerable by default and
    // we want Object.keys(new AbortController()) to be [] for compat with the native impl
    Object.defineProperty(this, 'signal', {
      value: new AbortSignal(),
      writable: true,
      configurable: true
    });
  }

  _createClass(AbortController, [{
    key: "abort",
    value: function abort() {
      var event;

      try {
        event = new Event('abort');
      } catch (e) {
        if (typeof document !== 'undefined') {
          if (!document.createEvent) {
            // For Internet Explorer 8:
            event = document.createEventObject();
            event.type = 'abort';
          } else {
            // For Internet Explorer 11:
            event = document.createEvent('Event');
            event.initEvent('abort', false, false);
          }
        } else {
          // Fallback where document isn't available:
          event = {
            type: 'abort',
            bubbles: false,
            cancelable: false
          };
        }
      }

      this.signal.dispatchEvent(event);
    }
  }, {
    key: "toString",
    value: function toString() {
      return '[object AbortController]';
    }
  }]);

  return AbortController;
}();

if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
  // These are necessary to make sure that we get correct output for:
  // Object.prototype.toString.call(new AbortController())
  AbortController.prototype[Symbol.toStringTag] = 'AbortController';
  AbortSignal.prototype[Symbol.toStringTag] = 'AbortSignal';
}

function polyfillNeeded(self) {
  if (self.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
    console.log('__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill');
    return true;
  } // Note that the "unfetch" minimal fetch polyfill defines fetch() without
  // defining window.Request, and this polyfill need to work on top of unfetch
  // so the below feature detection needs the !self.AbortController part.
  // The Request.prototype check is also needed because Safari versions 11.1.2
  // up to and including 12.1.x has a window.AbortController present but still
  // does NOT correctly implement abortable fetch:
  // https://bugs.webkit.org/show_bug.cgi?id=174980#c2


  return typeof self.Request === 'function' && !self.Request.prototype.hasOwnProperty('signal') || !self.AbortController;
}

/**
 * Note: the "fetch.Request" default value is available for fetch imported from
 * the "node-fetch" package and not in browsers. This is OK since browsers
 * will be importing umd-polyfill.js from that path "self" is passed the
 * decorator so the default value will not be used (because browsers that define
 * fetch also has Request). One quirky setup where self.fetch exists but
 * self.Request does not is when the "unfetch" minimal fetch polyfill is used
 * on top of IE11; for this case the browser will try to use the fetch.Request
 * default value which in turn will be undefined but then then "if (Request)"
 * will ensure that you get a patched fetch but still no Request (as expected).
 * @param {fetch, Request = fetch.Request}
 * @returns {fetch: abortableFetch, Request: AbortableRequest}
 */

function abortableFetchDecorator(patchTargets) {
  if ('function' === typeof patchTargets) {
    patchTargets = {
      fetch: patchTargets
    };
  }

  var _patchTargets = patchTargets,
      fetch = _patchTargets.fetch,
      _patchTargets$Request = _patchTargets.Request,
      NativeRequest = _patchTargets$Request === void 0 ? fetch.Request : _patchTargets$Request,
      NativeAbortController = _patchTargets.AbortController,
      _patchTargets$__FORCE = _patchTargets.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL,
      __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL = _patchTargets$__FORCE === void 0 ? false : _patchTargets$__FORCE;

  if (!polyfillNeeded({
    fetch: fetch,
    Request: NativeRequest,
    AbortController: NativeAbortController,
    __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL: __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
  })) {
    return {
      fetch: fetch,
      Request: Request
    };
  }

  var Request = NativeRequest; // Note that the "unfetch" minimal fetch polyfill defines fetch() without
  // defining window.Request, and this polyfill need to work on top of unfetch
  // hence we only patch it if it's available. Also we don't patch it if signal
  // is already available on the Request prototype because in this case support
  // is present and the patching below can cause a crash since it assigns to
  // request.signal which is technically a read-only property. This latter error
  // happens when you run the main5.js node-fetch example in the repo
  // "abortcontroller-polyfill-examples". The exact error is:
  //   request.signal = init.signal;
  //   ^
  // TypeError: Cannot set property signal of #<Request> which has only a getter

  if (Request && !Request.prototype.hasOwnProperty('signal') || __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL) {
    Request = function Request(input, init) {
      var signal;

      if (init && init.signal) {
        signal = init.signal; // Never pass init.signal to the native Request implementation when the polyfill has
        // been installed because if we're running on top of a browser with a
        // working native AbortController (i.e. the polyfill was installed due to
        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
        // fake AbortSignal to the native fetch will trigger:
        // TypeError: Failed to construct 'Request': member signal is not of type AbortSignal.

        delete init.signal;
      }

      var request = new NativeRequest(input, init);

      if (signal) {
        Object.defineProperty(request, 'signal', {
          writable: false,
          enumerable: false,
          configurable: true,
          value: signal
        });
      }

      return request;
    };

    Request.prototype = NativeRequest.prototype;
  }

  var realFetch = fetch;

  var abortableFetch = function abortableFetch(input, init) {
    var signal = Request && Request.prototype.isPrototypeOf(input) ? input.signal : init ? init.signal : undefined;

    if (signal) {
      var abortError;

      try {
        abortError = new DOMException('Aborted', 'AbortError');
      } catch (err) {
        // IE 11 does not support calling the DOMException constructor, use a
        // regular error object on it instead.
        abortError = new Error('Aborted');
        abortError.name = 'AbortError';
      } // Return early if already aborted, thus avoiding making an HTTP request


      if (signal.aborted) {
        return Promise.reject(abortError);
      } // Turn an event into a promise, reject it once `abort` is dispatched


      var cancellation = new Promise(function (_, reject) {
        signal.addEventListener('abort', function () {
          return reject(abortError);
        }, {
          once: true
        });
      });

      if (init && init.signal) {
        // Never pass .signal to the native implementation when the polyfill has
        // been installed because if we're running on top of a browser with a
        // working native AbortController (i.e. the polyfill was installed due to
        // __FORCE_INSTALL_ABORTCONTROLLER_POLYFILL being set), then passing our
        // fake AbortSignal to the native fetch will trigger:
        // TypeError: Failed to execute 'fetch' on 'Window': member signal is not of type AbortSignal.
        delete init.signal;
      } // Return the fastest promise (don't need to wait for request to finish)


      return Promise.race([cancellation, realFetch(input, init)]);
    }

    return realFetch(input, init);
  };

  return {
    fetch: abortableFetch,
    Request: Request
  };
}

exports.AbortController = AbortController;
exports.AbortSignal = AbortSignal;
exports.abortableFetch = abortableFetchDecorator;

},{}],20:[function(require,module,exports){

},{}],21:[function(require,module,exports){
var hashClear = require('./_hashClear'),
    hashDelete = require('./_hashDelete'),
    hashGet = require('./_hashGet'),
    hashHas = require('./_hashHas'),
    hashSet = require('./_hashSet');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = hashClear;
Hash.prototype['delete'] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;

module.exports = Hash;

},{"./_hashClear":46,"./_hashDelete":47,"./_hashGet":48,"./_hashHas":49,"./_hashSet":50}],22:[function(require,module,exports){
var listCacheClear = require('./_listCacheClear'),
    listCacheDelete = require('./_listCacheDelete'),
    listCacheGet = require('./_listCacheGet'),
    listCacheHas = require('./_listCacheHas'),
    listCacheSet = require('./_listCacheSet');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = listCacheClear;
ListCache.prototype['delete'] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;

module.exports = ListCache;

},{"./_listCacheClear":56,"./_listCacheDelete":57,"./_listCacheGet":58,"./_listCacheHas":59,"./_listCacheSet":60}],23:[function(require,module,exports){
var getNative = require('./_getNative'),
    root = require('./_root');

/* Built-in method references that are verified to be native. */
var Map = getNative(root, 'Map');

module.exports = Map;

},{"./_getNative":42,"./_root":72}],24:[function(require,module,exports){
var mapCacheClear = require('./_mapCacheClear'),
    mapCacheDelete = require('./_mapCacheDelete'),
    mapCacheGet = require('./_mapCacheGet'),
    mapCacheHas = require('./_mapCacheHas'),
    mapCacheSet = require('./_mapCacheSet');

/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype['delete'] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;

module.exports = MapCache;

},{"./_mapCacheClear":61,"./_mapCacheDelete":62,"./_mapCacheGet":63,"./_mapCacheHas":64,"./_mapCacheSet":65}],25:[function(require,module,exports){
var root = require('./_root');

/** Built-in value references. */
var Symbol = root.Symbol;

module.exports = Symbol;

},{"./_root":72}],26:[function(require,module,exports){
var baseTimes = require('./_baseTimes'),
    isArguments = require('./isArguments'),
    isArray = require('./isArray'),
    isBuffer = require('./isBuffer'),
    isIndex = require('./_isIndex'),
    isTypedArray = require('./isTypedArray');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value),
      isArg = !isArr && isArguments(value),
      isBuff = !isArr && !isArg && isBuffer(value),
      isType = !isArr && !isArg && !isBuff && isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = arrayLikeKeys;

},{"./_baseTimes":35,"./_isIndex":51,"./isArguments":78,"./isArray":79,"./isBuffer":82,"./isTypedArray":92}],27:[function(require,module,exports){
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

module.exports = arrayMap;

},{}],28:[function(require,module,exports){
var eq = require('./eq');

/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

module.exports = assocIndexOf;

},{"./eq":76}],29:[function(require,module,exports){
var castPath = require('./_castPath'),
    toKey = require('./_toKey');

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;

},{"./_castPath":38,"./_toKey":74}],30:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    getRawTag = require('./_getRawTag'),
    objectToString = require('./_objectToString');

/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (symToStringTag && symToStringTag in Object(value))
    ? getRawTag(value)
    : objectToString(value);
}

module.exports = baseGetTag;

},{"./_Symbol":25,"./_getRawTag":44,"./_objectToString":70}],31:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag;
}

module.exports = baseIsArguments;

},{"./_baseGetTag":30,"./isObjectLike":88}],32:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isMasked = require('./_isMasked'),
    isObject = require('./isObject'),
    toSource = require('./_toSource');

/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!isObject(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}

module.exports = baseIsNative;

},{"./_isMasked":54,"./_toSource":75,"./isFunction":83,"./isObject":87}],33:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isLength = require('./isLength'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}

module.exports = baseIsTypedArray;

},{"./_baseGetTag":30,"./isLength":84,"./isObjectLike":88}],34:[function(require,module,exports){
var isPrototype = require('./_isPrototype'),
    nativeKeys = require('./_nativeKeys');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

module.exports = baseKeys;

},{"./_isPrototype":55,"./_nativeKeys":68}],35:[function(require,module,exports){
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

module.exports = baseTimes;

},{}],36:[function(require,module,exports){
var Symbol = require('./_Symbol'),
    arrayMap = require('./_arrayMap'),
    isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = Symbol ? Symbol.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return arrayMap(value, baseToString) + '';
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = baseToString;

},{"./_Symbol":25,"./_arrayMap":27,"./isArray":79,"./isSymbol":91}],37:[function(require,module,exports){
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

module.exports = baseUnary;

},{}],38:[function(require,module,exports){
var isArray = require('./isArray'),
    isKey = require('./_isKey'),
    stringToPath = require('./_stringToPath'),
    toString = require('./toString');

/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString(value));
}

module.exports = castPath;

},{"./_isKey":52,"./_stringToPath":73,"./isArray":79,"./toString":96}],39:[function(require,module,exports){
var root = require('./_root');

/** Used to detect overreaching core-js shims. */
var coreJsData = root['__core-js_shared__'];

module.exports = coreJsData;

},{"./_root":72}],40:[function(require,module,exports){
(function (global){
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

module.exports = freeGlobal;

}).call(this,typeof __webpack_require__.g !== "undefined" ? __webpack_require__.g : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],41:[function(require,module,exports){
var isKeyable = require('./_isKeyable');

/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

module.exports = getMapData;

},{"./_isKeyable":53}],42:[function(require,module,exports){
var baseIsNative = require('./_baseIsNative'),
    getValue = require('./_getValue');

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : undefined;
}

module.exports = getNative;

},{"./_baseIsNative":32,"./_getValue":45}],43:[function(require,module,exports){
var overArg = require('./_overArg');

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

module.exports = getPrototype;

},{"./_overArg":71}],44:[function(require,module,exports){
var Symbol = require('./_Symbol');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = Symbol ? Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

module.exports = getRawTag;

},{"./_Symbol":25}],45:[function(require,module,exports){
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

module.exports = getValue;

},{}],46:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}

module.exports = hashClear;

},{"./_nativeCreate":67}],47:[function(require,module,exports){
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = hashDelete;

},{}],48:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return hasOwnProperty.call(data, key) ? data[key] : undefined;
}

module.exports = hashGet;

},{"./_nativeCreate":67}],49:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
}

module.exports = hashHas;

},{"./_nativeCreate":67}],50:[function(require,module,exports){
var nativeCreate = require('./_nativeCreate');

/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
  return this;
}

module.exports = hashSet;

},{"./_nativeCreate":67}],51:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

module.exports = isIndex;

},{}],52:[function(require,module,exports){
var isArray = require('./isArray'),
    isSymbol = require('./isSymbol');

/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

module.exports = isKey;

},{"./isArray":79,"./isSymbol":91}],53:[function(require,module,exports){
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

module.exports = isKeyable;

},{}],54:[function(require,module,exports){
var coreJsData = require('./_coreJsData');

/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

module.exports = isMasked;

},{"./_coreJsData":39}],55:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

module.exports = isPrototype;

},{}],56:[function(require,module,exports){
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

module.exports = listCacheClear;

},{}],57:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

module.exports = listCacheDelete;

},{"./_assocIndexOf":28}],58:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

module.exports = listCacheGet;

},{"./_assocIndexOf":28}],59:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}

module.exports = listCacheHas;

},{"./_assocIndexOf":28}],60:[function(require,module,exports){
var assocIndexOf = require('./_assocIndexOf');

/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

module.exports = listCacheSet;

},{"./_assocIndexOf":28}],61:[function(require,module,exports){
var Hash = require('./_Hash'),
    ListCache = require('./_ListCache'),
    Map = require('./_Map');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new Hash,
    'map': new (Map || ListCache),
    'string': new Hash
  };
}

module.exports = mapCacheClear;

},{"./_Hash":21,"./_ListCache":22,"./_Map":23}],62:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

module.exports = mapCacheDelete;

},{"./_getMapData":41}],63:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}

module.exports = mapCacheGet;

},{"./_getMapData":41}],64:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}

module.exports = mapCacheHas;

},{"./_getMapData":41}],65:[function(require,module,exports){
var getMapData = require('./_getMapData');

/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

module.exports = mapCacheSet;

},{"./_getMapData":41}],66:[function(require,module,exports){
var memoize = require('./memoize');

/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

module.exports = memoizeCapped;

},{"./memoize":94}],67:[function(require,module,exports){
var getNative = require('./_getNative');

/* Built-in method references that are verified to be native. */
var nativeCreate = getNative(Object, 'create');

module.exports = nativeCreate;

},{"./_getNative":42}],68:[function(require,module,exports){
var overArg = require('./_overArg');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);

module.exports = nativeKeys;

},{"./_overArg":71}],69:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = moduleExports && freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = freeModule && freeModule.require && freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

module.exports = nodeUtil;

},{"./_freeGlobal":40}],70:[function(require,module,exports){
/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return nativeObjectToString.call(value);
}

module.exports = objectToString;

},{}],71:[function(require,module,exports){
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

module.exports = overArg;

},{}],72:[function(require,module,exports){
var freeGlobal = require('./_freeGlobal');

/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = freeGlobal || freeSelf || Function('return this')();

module.exports = root;

},{"./_freeGlobal":40}],73:[function(require,module,exports){
var memoizeCapped = require('./_memoizeCapped');

/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

module.exports = stringToPath;

},{"./_memoizeCapped":66}],74:[function(require,module,exports){
var isSymbol = require('./isSymbol');

/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

module.exports = toKey;

},{"./isSymbol":91}],75:[function(require,module,exports){
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

module.exports = toSource;

},{}],76:[function(require,module,exports){
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

module.exports = eq;

},{}],77:[function(require,module,exports){
var baseGet = require('./_baseGet');

/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : baseGet(object, path);
  return result === undefined ? defaultValue : result;
}

module.exports = get;

},{"./_baseGet":29}],78:[function(require,module,exports){
var baseIsArguments = require('./_baseIsArguments'),
    isObjectLike = require('./isObjectLike');

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

module.exports = isArguments;

},{"./_baseIsArguments":31,"./isObjectLike":88}],79:[function(require,module,exports){
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

module.exports = isArray;

},{}],80:[function(require,module,exports){
var isFunction = require('./isFunction'),
    isLength = require('./isLength');

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

module.exports = isArrayLike;

},{"./isFunction":83,"./isLength":84}],81:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var boolTag = '[object Boolean]';

/**
 * Checks if `value` is classified as a boolean primitive or object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
 * @example
 *
 * _.isBoolean(false);
 * // => true
 *
 * _.isBoolean(null);
 * // => false
 */
function isBoolean(value) {
  return value === true || value === false ||
    (isObjectLike(value) && baseGetTag(value) == boolTag);
}

module.exports = isBoolean;

},{"./_baseGetTag":30,"./isObjectLike":88}],82:[function(require,module,exports){
var root = require('./_root'),
    stubFalse = require('./stubFalse');

/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var Buffer = moduleExports ? root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || stubFalse;

module.exports = isBuffer;

},{"./_root":72,"./stubFalse":95}],83:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObject = require('./isObject');

/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

module.exports = isFunction;

},{"./_baseGetTag":30,"./isObject":87}],84:[function(require,module,exports){
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

module.exports = isLength;

},{}],85:[function(require,module,exports){
/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is nullish, else `false`.
 * @example
 *
 * _.isNil(null);
 * // => true
 *
 * _.isNil(void 0);
 * // => true
 *
 * _.isNil(NaN);
 * // => false
 */
function isNil(value) {
  return value == null;
}

module.exports = isNil;

},{}],86:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var numberTag = '[object Number]';

/**
 * Checks if `value` is classified as a `Number` primitive or object.
 *
 * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
 * classified as numbers, use the `_.isFinite` method.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a number, else `false`.
 * @example
 *
 * _.isNumber(3);
 * // => true
 *
 * _.isNumber(Number.MIN_VALUE);
 * // => true
 *
 * _.isNumber(Infinity);
 * // => true
 *
 * _.isNumber('3');
 * // => false
 */
function isNumber(value) {
  return typeof value == 'number' ||
    (isObjectLike(value) && baseGetTag(value) == numberTag);
}

module.exports = isNumber;

},{"./_baseGetTag":30,"./isObjectLike":88}],87:[function(require,module,exports){
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

module.exports = isObject;

},{}],88:[function(require,module,exports){
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

module.exports = isObjectLike;

},{}],89:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    getPrototype = require('./_getPrototype'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype,
    objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    funcToString.call(Ctor) == objectCtorString;
}

module.exports = isPlainObject;

},{"./_baseGetTag":30,"./_getPrototype":43,"./isObjectLike":88}],90:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isArray = require('./isArray'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
}

module.exports = isString;

},{"./_baseGetTag":30,"./isArray":79,"./isObjectLike":88}],91:[function(require,module,exports){
var baseGetTag = require('./_baseGetTag'),
    isObjectLike = require('./isObjectLike');

/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (isObjectLike(value) && baseGetTag(value) == symbolTag);
}

module.exports = isSymbol;

},{"./_baseGetTag":30,"./isObjectLike":88}],92:[function(require,module,exports){
var baseIsTypedArray = require('./_baseIsTypedArray'),
    baseUnary = require('./_baseUnary'),
    nodeUtil = require('./_nodeUtil');

/* Node.js helper references. */
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

module.exports = isTypedArray;

},{"./_baseIsTypedArray":33,"./_baseUnary":37,"./_nodeUtil":69}],93:[function(require,module,exports){
var arrayLikeKeys = require('./_arrayLikeKeys'),
    baseKeys = require('./_baseKeys'),
    isArrayLike = require('./isArrayLike');

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

module.exports = keys;

},{"./_arrayLikeKeys":26,"./_baseKeys":34,"./isArrayLike":80}],94:[function(require,module,exports){
var MapCache = require('./_MapCache');

/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = MapCache;

module.exports = memoize;

},{"./_MapCache":24}],95:[function(require,module,exports){
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

module.exports = stubFalse;

},{}],96:[function(require,module,exports){
var baseToString = require('./_baseToString');

/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString(value) {
  return value == null ? '' : baseToString(value);
}

module.exports = toString;

},{"./_baseToString":36}],"airtable":[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var base_1 = __importDefault(require("./base"));
var record_1 = __importDefault(require("./record"));
var table_1 = __importDefault(require("./table"));
var airtable_error_1 = __importDefault(require("./airtable_error"));
var Airtable = /** @class */ (function () {
    function Airtable(opts) {
        if (opts === void 0) { opts = {}; }
        var defaultConfig = Airtable.default_config();
        var apiVersion = opts.apiVersion || Airtable.apiVersion || defaultConfig.apiVersion;
        Object.defineProperties(this, {
            _apiKey: {
                value: opts.apiKey || Airtable.apiKey || defaultConfig.apiKey,
            },
            _apiVersion: {
                value: apiVersion,
            },
            _apiVersionMajor: {
                value: apiVersion.split('.')[0],
            },
            _customHeaders: {
                value: opts.customHeaders || {},
            },
            _endpointUrl: {
                value: opts.endpointUrl || Airtable.endpointUrl || defaultConfig.endpointUrl,
            },
            _noRetryIfRateLimited: {
                value: opts.noRetryIfRateLimited ||
                    Airtable.noRetryIfRateLimited ||
                    defaultConfig.noRetryIfRateLimited,
            },
            _requestTimeout: {
                value: opts.requestTimeout || Airtable.requestTimeout || defaultConfig.requestTimeout,
            },
        });
        if (!this._apiKey) {
            throw new Error('An API key is required to connect to Airtable');
        }
    }
    Airtable.prototype.base = function (baseId) {
        return base_1.default.createFunctor(this, baseId);
    };
    Airtable.default_config = function () {
        return {
            endpointUrl:  false || 'https://api.airtable.com',
            apiVersion: '0.1.0',
            apiKey: "",
            noRetryIfRateLimited: false,
            requestTimeout: 300 * 1000,
        };
    };
    Airtable.configure = function (_a) {
        var apiKey = _a.apiKey, endpointUrl = _a.endpointUrl, apiVersion = _a.apiVersion, noRetryIfRateLimited = _a.noRetryIfRateLimited, requestTimeout = _a.requestTimeout;
        Airtable.apiKey = apiKey;
        Airtable.endpointUrl = endpointUrl;
        Airtable.apiVersion = apiVersion;
        Airtable.noRetryIfRateLimited = noRetryIfRateLimited;
        Airtable.requestTimeout = requestTimeout;
    };
    Airtable.base = function (baseId) {
        return new Airtable().base(baseId);
    };
    Airtable.Base = base_1.default;
    Airtable.Record = record_1.default;
    Airtable.Table = table_1.default;
    Airtable.Error = airtable_error_1.default;
    return Airtable;
}());
module.exports = Airtable;

},{"./airtable_error":2,"./base":3,"./record":15,"./table":17}]},{},["airtable"])("airtable")
});


/***/ }),

/***/ "./src/javascripts/index.js":
/*!**********************************!*\
  !*** ./src/javascripts/index.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! airtable */ "./node_modules/airtable/lib/airtable.umd.js");
/* harmony import */ var airtable__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(airtable__WEBPACK_IMPORTED_MODULE_0__);

document.addEventListener('DOMContentLoaded', function () {
  var token = 'patjCRqLMMU67TADJ.39e7069afd25d1f546a9b5546af805a31d51e0f0406fb767cee60c586659656a';
  airtable__WEBPACK_IMPORTED_MODULE_0___default().configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: token
  });
  var base = airtable__WEBPACK_IMPORTED_MODULE_0___default().base('app11awHwinfj4ZoV');
  getCardTeasers().then(function (content) {
    createRecipesTeasersCards(content);
    createRecipesTeasersCardsM(content);
  });
  function getCardTeasers() {
    return new Promise(function (resolve, reject) {
      var content = [];
      base('Recepies').select({
        maxRecords: 20,
        sort: [{
          field: 'Direction',
          direction: 'asc'
        }]
      }).firstPage().then(function (result) {
        result.forEach(function (record) {
          content.push({
            id: record.id,
            title: record.fields['Title'],
            tags: record.fields['Tags'],
            link: record.fields['URL'],
            img: record.fields['IMG'],
            width: record.fields['Width']
          });
        });
        resolve(content);
      })["catch"](reject);
    });
  }
  function createRecipesTeasersCards(content) {
    var container = document.querySelector('.O_RecipesCards');
    if (!container) return;
    content.forEach(function (stroke) {
      var title = stroke.title,
        tags = stroke.tags,
        link = stroke.link,
        img = stroke.img,
        width = stroke.width;
      var RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;
      var RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');
      if (Array.isArray(tags)) {
        tags.forEach(function (tag) {
          var RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;
          RecipesTags.appendChild(RecipesTag);
        });
      }
      var RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');
      if (width) {
        RecipesCard.classList.add(width.toLowerCase());
      }
      RecipesCard.href = link;
      RecipesCard.style.backgroundImage = "url(".concat(img, ")");
      RecipesCard.appendChild(RecipesTags);
      RecipesCard.appendChild(RecipesTitle);
      container.appendChild(RecipesCard);
    });
  }
  function createRecipesTeasersCardsM(content) {
    var container = document.querySelector('.O_RecipesCardsM');
    if (!container) return;
    content.slice(0, 5).forEach(function (stroke) {
      var title = stroke.title,
        tags = stroke.tags,
        link = stroke.link,
        img = stroke.img,
        width = stroke.width;
      var RecipesTitle = document.createElement('h4');
      RecipesTitle.classList.add('A_TitleCard');
      RecipesTitle.innerText = title;
      var RecipesTags = document.createElement('div');
      RecipesTags.classList.add('C_ArticleTags');
      if (Array.isArray(tags)) {
        tags.forEach(function (tag) {
          var RecipesTag = document.createElement('span');
          RecipesTag.classList.add('A_TagRecipes');
          RecipesTag.innerText = tag;
          RecipesTags.appendChild(RecipesTag);
        });
      }
      var RecipesCard = document.createElement('a');
      RecipesCard.classList.add('M_RecipesCards');
      if (width) {
        RecipesCard.classList.add(width.toLowerCase());
      }
      RecipesCard.href = link;
      RecipesCard.style.backgroundImage = "url(".concat(img, ")");
      RecipesCard.appendChild(RecipesTags);
      RecipesCard.appendChild(RecipesTitle);
      container.appendChild(RecipesCard);
    });
  }
  function getArticlesCards() {
    return new Promise(function (resolve, reject) {
      var content = [];
      base('Articles_cards').select({
        maxRecords: 20,
        sort: [{
          field: 'Direction',
          direction: 'asc'
        }]
      }).firstPage().then(function (result) {
        result.forEach(function (record) {
          content.push({
            id: record.id,
            title: record.fields['Title'],
            description: record.fields['Description'],
            tag: record.fields['Tags'],
            link: record.fields['URL'],
            img: record.fields['Image'],
            size: record.fields['Size']
          });
        });
        resolve(content);
      })["catch"](reject);
    });
  }
  function createArticlesCards(content) {
    var container = document.querySelector('.O_ArticleCards');
    if (!container) return;
    content.forEach(function (item) {
      var title = item.title,
        description = item.description,
        tag = item.tag,
        link = item.link,
        img = item.img,
        size = item.size;
      var titleEl = document.createElement('h4');
      titleEl.classList.add('A_TitleCard');
      titleEl.innerText = title;
      var descEl = document.createElement('p');
      descEl.classList.add('A_DescriptionCard');
      descEl.innerText = description;
      var tagWrap = document.createElement('div');
      tagWrap.classList.add('C_ArticleTags');
      if (tag) {
        var tagEl = document.createElement('span');
        tagEl.classList.add('A_TagRecipes');
        tagEl.innerText = tag;
        tagWrap.appendChild(tagEl);
      }
      var card = document.createElement('a');
      card.classList.add('M_ArticleCard');

      //размер карточки
      if (size) {
        card.classList.add(size.toLowerCase());
        // например: s, m, l, xxl
      }
      card.href = link;
      card.style.backgroundImage = "url(".concat(img, ")");

      // тег + стрелка
      var topRow = document.createElement('div');
      topRow.classList.add('W_ArticleTop');

      // стрелка
      var arrow = document.createElement('div');
      arrow.classList.add('A_Arrow');
      topRow.appendChild(tagWrap);
      topRow.appendChild(arrow);

      // 🔹 текст: title + description
      var textWrap = document.createElement('div');
      textWrap.classList.add('W_ArticleText');
      textWrap.appendChild(titleEl);
      textWrap.appendChild(descEl);

      // 🔹 вставка в карточку
      card.appendChild(topRow);
      card.appendChild(textWrap);
      container.appendChild(card);
    });
  }
  getArticlesCards().then(function (content) {
    createArticlesCards(content);
  });
});

// универсальная функция
// function setImage(selector, src) {
//   const el = document.querySelector(selector)
//   if (el) el.src = src
// }

// // ===== logo animation (есть на всех страницах) =====
// import banana from '../img/logoanimation/Banana.png'
// import kiwi from '../img/logoanimation/Kiwi.png'
// import strawberry from '../img/logoanimation/Strawberry.png'
// import strawberry1 from '../img/logoanimation/Strawberry1.png'
// import tomato from '../img/logoanimation/Tomato.png'

// setImage('.Q_LogoMove_Banana', banana)
// setImage('.Q_LogoMove_Kiwi', kiwi)
// setImage('.Q_LogoMove_Strawberry', strawberry)
// setImage('.Q_LogoMove_Strawberry1', strawberry1)
// setImage('.Q_LogoMove_Tomato', tomato)

// // ===== main screen (есть НЕ везде) =====
// // import kiwiMain from '../img/cards/A_Fruits_MainScreen_Kiwi.svg'
// import peach from '../img/cards/A_Fruits_MainScreen_Peach.svg'
// import strawberryMain from '../img/cards/A_Fruits_MainScreen_Strawberry.svg'

// // setImage('.A_Fruits_MainScreen_Kiwi', kiwiMain);
// setImage('.A_Fruits_MainScreen_Peach', peach)
// setImage('.A_Fruits_MainScreen_Strawberry', strawberryMain)

// // ===== patterns =====
// import patternKiwi from '../img/M_Pattern_MainScreen_Kiwi.svg'
// import patternTomato from '../img/M_Pattern_MainScreen_Tomato.svg'

// setImage('.A_Fruits_MainScreen_PatternKiwi', patternKiwi)
// setImage('.A_Fruits_MainScreen_PatternTomato', patternTomato)

/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/javascripts/index.js"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxhQUFhLEdBQUcsSUFBc0QsRUFBRSxtQkFBbUIsS0FBSztBQUFBLFVBQWlPLENBQUMsYUFBYSwwQkFBMEIsbUJBQW1CLGtCQUFrQixnQkFBZ0IsVUFBVSxVQUFVLE1BQU0sU0FBbUMsQ0FBQyxnQkFBZ0IsT0FBQyxPQUFPLG9CQUFvQiw4Q0FBOEMsa0NBQWtDLFlBQVksWUFBWSxtQ0FBbUMsaUJBQWlCLGVBQWUsc0JBQXNCLG9CQUFvQixVQUFVLFNBQW1DLEtBQUssV0FBVyxZQUFZLFNBQVMsU0FBUyxLQUFLO0FBQzd6QjtBQUNBO0FBQ0E7QUFDQSx3R0FBd0c7QUFDeEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLHNFQUFzRTtBQUN6RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBLENBQUMsR0FBRztBQUNKO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxPQUFPO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQztBQUNBLDROQUE0TjtBQUM1TjtBQUNBLDhEQUE4RCwyRkFBMkY7QUFDeko7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZEQUE2RCxjQUFjLGlDQUFpQztBQUM1RztBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RCxnQkFBZ0I7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOERBQThELFdBQVcsb0NBQW9DO0FBQzdHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLHNRQUFzUTtBQUN6UTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUM7QUFDdkM7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHVCQUF1QjtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsWUFBWTtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLEdBQUc7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5Qix1QkFBdUI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQyxHQUFHO0FBQ0o7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLEVBQUUsNEJBQTRCO0FBQy9CO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0Esd0dBQXdHO0FBQ3hHOztBQUVBLENBQUMsRUFBRSxnQkFBZ0I7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMsR0FBRztBQUNKO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRFQUE0RSxnQkFBZ0I7QUFDNUY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQSxDQUFDLEVBQUUsaUJBQWlCO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBOztBQUVBLENBQUMsR0FBRztBQUNKO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0QkFBNEIsb0JBQW9CO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbURBQW1ELGdCQUFnQjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxnQkFBZ0I7QUFDL0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLHVEQUF1RDtBQUMxRDtBQUNBOztBQUVBLENBQUMsR0FBRztBQUNKO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxPQUFPO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFFBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsZ0JBQWdCO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCwwQkFBMEI7QUFDOUU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLGtKQUFrSjtBQUNySjtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0EsK0NBQStDLGFBQWE7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxDQUFDLEVBQUUsMkdBQTJHO0FBQzlHO0FBQ0E7QUFDQTtBQUNBLGlEQUFpRCxPQUFPO0FBQ3hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywwQkFBMEI7QUFDMUQsb0dBQW9HO0FBQ3BHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywwQkFBMEI7QUFDMUQsa0dBQWtHO0FBQ2xHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxxR0FBcUc7QUFDckc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxrR0FBa0c7QUFDbEc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLDBCQUEwQjtBQUM3QjtBQUNBO0FBQ0EsNkNBQTZDO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUEsQ0FBQyxFQUFFLG9JQUFvSTtBQUN2STtBQUNBO0FBQ0E7QUFDQSxpREFBaUQsT0FBTztBQUN4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkM7QUFDN0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFDQUFxQyxzQkFBc0I7QUFDM0Q7QUFDQTtBQUNBLHFDQUFxQyxxQkFBcUI7QUFDMUQ7QUFDQSwrRUFBK0U7QUFDL0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5QyxzQkFBc0I7QUFDL0QsbUZBQW1GO0FBQ25GO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELGlCQUFpQixvQkFBb0IsaUJBQWlCLGdCQUFnQjtBQUN4SDtBQUNBO0FBQ0Esd0RBQXdELDBCQUEwQjtBQUNsRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQ0FBK0MsaUNBQWlDO0FBQ2hGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MscUJBQXFCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDs7QUFFQSxDQUFDLEVBQUUsdUpBQXVKO0FBQzFKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQyxHQUFHO0FBQ0o7O0FBRUEsK0NBQStDLGFBQWE7O0FBRTVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBa0Isa0JBQWtCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLHdDQUF3QyxPQUFPO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTs7QUFFQSx3Q0FBd0MsT0FBTztBQUMvQztBQUNBOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBLHdGQUF3RjtBQUN4RjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxNQUFNO0FBQ047OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjtBQUNuQjtBQUNBO0FBQ0EsV0FBVztBQUNYLGFBQWE7QUFDYjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FB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U0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLENBQUMsRUFBRSxrQ0FBa0M7QUFDckM7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxHQUFHO0FBQ2QsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxDQUFDLEVBQUUsdUNBQXVDO0FBQzFDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxHQUFHO0FBQ2QsYUFBYSxTQUFTO0FBQ3RCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxDQUFDLEVBQUUsOEJBQThCO0FBQ2pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLENBQUMsRUFBRSxtQ0FBbUM7QUFDdEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsR0FBRztBQUNkLGFBQWEsU0FBUztBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vVGFyZWxrYS8uL25vZGVfbW9kdWxlcy9haXJ0YWJsZS9saWIvYWlydGFibGUudW1kLmpzIiwid2VicGFjazovL1RhcmVsa2EvLi9zcmMvamF2YXNjcmlwdHMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKGYpe2lmKHR5cGVvZiBleHBvcnRzPT09XCJvYmplY3RcIiYmdHlwZW9mIG1vZHVsZSE9PVwidW5kZWZpbmVkXCIpe21vZHVsZS5leHBvcnRzPWYoKX1lbHNlIGlmKHR5cGVvZiBkZWZpbmU9PT1cImZ1bmN0aW9uXCImJmRlZmluZS5hbWQpe2RlZmluZShbXSxmKX1lbHNle3ZhciBnO2lmKHR5cGVvZiB3aW5kb3chPT1cInVuZGVmaW5lZFwiKXtnPXdpbmRvd31lbHNlIGlmKHR5cGVvZiBnbG9iYWwhPT1cInVuZGVmaW5lZFwiKXtnPWdsb2JhbH1lbHNlIGlmKHR5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIil7Zz1zZWxmfWVsc2V7Zz10aGlzfWcuQWlydGFibGUgPSBmKCl9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpKHsxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xuLy8gaXN0YW5idWwgaWdub3JlIGZpbGVcbnZhciBBYm9ydENvbnRyb2xsZXI7XG52YXIgYnJvd3Nlckdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IG51bGw7IC8vIHNlbGYgaXMgdGhlIGdsb2JhbCBpbiB3ZWIgd29ya2Vyc1xuaWYgKCFicm93c2VyR2xvYmFsKSB7XG4gICAgQWJvcnRDb250cm9sbGVyID0gcmVxdWlyZSgnYWJvcnQtY29udHJvbGxlcicpO1xufVxuZWxzZSBpZiAoJ3NpZ25hbCcgaW4gbmV3IFJlcXVlc3QoJ2h0dHBzOi8vYWlydGFibGUuY29tJykpIHtcbiAgICBBYm9ydENvbnRyb2xsZXIgPSBicm93c2VyR2xvYmFsLkFib3J0Q29udHJvbGxlcjtcbn1cbmVsc2Uge1xuICAgIC8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXMgKi9cbiAgICB2YXIgcG9seWZpbGwgPSByZXF1aXJlKCdhYm9ydGNvbnRyb2xsZXItcG9seWZpbGwvZGlzdC9janMtcG9ueWZpbGwnKTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXMgKi9cbiAgICBBYm9ydENvbnRyb2xsZXIgPSBwb2x5ZmlsbC5BYm9ydENvbnRyb2xsZXI7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEFib3J0Q29udHJvbGxlcjtcblxufSx7XCJhYm9ydC1jb250cm9sbGVyXCI6MjAsXCJhYm9ydGNvbnRyb2xsZXItcG9seWZpbGwvZGlzdC9janMtcG9ueWZpbGxcIjoxOX1dLDI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgQWlydGFibGVFcnJvciA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBBaXJ0YWJsZUVycm9yKGVycm9yLCBtZXNzYWdlLCBzdGF0dXNDb2RlKSB7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBlcnJvcjtcbiAgICAgICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgdGhpcy5zdGF0dXNDb2RlID0gc3RhdHVzQ29kZTtcbiAgICB9XG4gICAgQWlydGFibGVFcnJvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2UsXG4gICAgICAgICAgICAnKCcsXG4gICAgICAgICAgICB0aGlzLmVycm9yLFxuICAgICAgICAgICAgJyknLFxuICAgICAgICAgICAgdGhpcy5zdGF0dXNDb2RlID8gXCJbSHR0cCBjb2RlIFwiICsgdGhpcy5zdGF0dXNDb2RlICsgXCJdXCIgOiAnJyxcbiAgICAgICAgXS5qb2luKCcnKTtcbiAgICB9O1xuICAgIHJldHVybiBBaXJ0YWJsZUVycm9yO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0gQWlydGFibGVFcnJvcjtcblxufSx7fV0sMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgZ2V0XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC9nZXRcIikpO1xudmFyIGlzUGxhaW5PYmplY3RfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibG9kYXNoL2lzUGxhaW5PYmplY3RcIikpO1xudmFyIGtleXNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibG9kYXNoL2tleXNcIikpO1xudmFyIGZldGNoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZmV0Y2hcIikpO1xudmFyIGFib3J0X2NvbnRyb2xsZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hYm9ydC1jb250cm9sbGVyXCIpKTtcbnZhciBvYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vb2JqZWN0X3RvX3F1ZXJ5X3BhcmFtX3N0cmluZ1wiKSk7XG52YXIgYWlydGFibGVfZXJyb3JfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9haXJ0YWJsZV9lcnJvclwiKSk7XG52YXIgdGFibGVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi90YWJsZVwiKSk7XG52YXIgaHR0cF9oZWFkZXJzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vaHR0cF9oZWFkZXJzXCIpKTtcbnZhciBydW5fYWN0aW9uXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcnVuX2FjdGlvblwiKSk7XG52YXIgcGFja2FnZV92ZXJzaW9uXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcGFja2FnZV92ZXJzaW9uXCIpKTtcbnZhciBleHBvbmVudGlhbF9iYWNrb2ZmX3dpdGhfaml0dGVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZXhwb25lbnRpYWxfYmFja29mZl93aXRoX2ppdHRlclwiKSk7XG52YXIgdXNlckFnZW50ID0gXCJBaXJ0YWJsZS5qcy9cIiArIHBhY2thZ2VfdmVyc2lvbl8xLmRlZmF1bHQ7XG52YXIgQmFzZSA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBCYXNlKGFpcnRhYmxlLCBiYXNlSWQpIHtcbiAgICAgICAgdGhpcy5fYWlydGFibGUgPSBhaXJ0YWJsZTtcbiAgICAgICAgdGhpcy5faWQgPSBiYXNlSWQ7XG4gICAgfVxuICAgIEJhc2UucHJvdG90eXBlLnRhYmxlID0gZnVuY3Rpb24gKHRhYmxlTmFtZSkge1xuICAgICAgICByZXR1cm4gbmV3IHRhYmxlXzEuZGVmYXVsdCh0aGlzLCBudWxsLCB0YWJsZU5hbWUpO1xuICAgIH07XG4gICAgQmFzZS5wcm90b3R5cGUubWFrZVJlcXVlc3QgPSBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmIChvcHRpb25zID09PSB2b2lkIDApIHsgb3B0aW9ucyA9IHt9OyB9XG4gICAgICAgIHZhciBtZXRob2QgPSBnZXRfMS5kZWZhdWx0KG9wdGlvbnMsICdtZXRob2QnLCAnR0VUJykudG9VcHBlckNhc2UoKTtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuX2FpcnRhYmxlLl9lbmRwb2ludFVybCArIFwiL3ZcIiArIHRoaXMuX2FpcnRhYmxlLl9hcGlWZXJzaW9uTWFqb3IgKyBcIi9cIiArIHRoaXMuX2lkICsgZ2V0XzEuZGVmYXVsdChvcHRpb25zLCAncGF0aCcsICcvJykgKyBcIj9cIiArIG9iamVjdF90b19xdWVyeV9wYXJhbV9zdHJpbmdfMS5kZWZhdWx0KGdldF8xLmRlZmF1bHQob3B0aW9ucywgJ3FzJywge30pKTtcbiAgICAgICAgdmFyIGNvbnRyb2xsZXIgPSBuZXcgYWJvcnRfY29udHJvbGxlcl8xLmRlZmF1bHQoKTtcbiAgICAgICAgdmFyIGhlYWRlcnMgPSB0aGlzLl9nZXRSZXF1ZXN0SGVhZGVycyhPYmplY3QuYXNzaWduKHt9LCB0aGlzLl9haXJ0YWJsZS5fY3VzdG9tSGVhZGVycywgKF9hID0gb3B0aW9ucy5oZWFkZXJzKSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiB7fSkpO1xuICAgICAgICB2YXIgcmVxdWVzdE9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IG1ldGhvZCxcbiAgICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMsXG4gICAgICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgICAgICB9O1xuICAgICAgICBpZiAoJ2JvZHknIGluIG9wdGlvbnMgJiYgX2NhblJlcXVlc3RNZXRob2RJbmNsdWRlQm9keShtZXRob2QpKSB7XG4gICAgICAgICAgICByZXF1ZXN0T3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5ib2R5KTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29udHJvbGxlci5hYm9ydCgpO1xuICAgICAgICB9LCB0aGlzLl9haXJ0YWJsZS5fcmVxdWVzdFRpbWVvdXQpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgZmV0Y2hfMS5kZWZhdWx0KHVybCwgcmVxdWVzdE9wdGlvbnMpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3ApIHtcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSA0MjkgJiYgIV90aGlzLl9haXJ0YWJsZS5fbm9SZXRyeUlmUmF0ZUxpbWl0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG51bUF0dGVtcHRzXzEgPSBnZXRfMS5kZWZhdWx0KG9wdGlvbnMsICdfbnVtQXR0ZW1wdHMnLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGJhY2tvZmZEZWxheU1zID0gZXhwb25lbnRpYWxfYmFja29mZl93aXRoX2ppdHRlcl8xLmRlZmF1bHQobnVtQXR0ZW1wdHNfMSk7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ld09wdGlvbnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgb3B0aW9ucyksIHsgX251bUF0dGVtcHRzOiBudW1BdHRlbXB0c18xICsgMSB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLm1ha2VSZXF1ZXN0KG5ld09wdGlvbnMpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgYmFja29mZkRlbGF5TXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzcC5qc29uKClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChib2R5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gX3RoaXMuX2NoZWNrU3RhdHVzRm9yRXJyb3IocmVzcC5zdGF0dXMsIGJvZHkpIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX2dldEVycm9yRm9yTm9uT2JqZWN0Qm9keShyZXNwLnN0YXR1cywgYm9keSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdHVzQ29kZTogcmVzcC5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhlYWRlcnM6IHJlc3AuaGVhZGVycyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogYm9keSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gX2dldEVycm9yRm9yTm9uT2JqZWN0Qm9keShyZXNwLnN0YXR1cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICAgICAgICBlcnIgPSBuZXcgYWlydGFibGVfZXJyb3JfMS5kZWZhdWx0KCdDT05ORUNUSU9OX0VSUk9SJywgZXJyLm1lc3NhZ2UsIG51bGwpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogQGRlcHJlY2F0ZWQgVGhpcyBtZXRob2QgaXMgZGVwcmVjYXRlZC5cbiAgICAgKi9cbiAgICBCYXNlLnByb3RvdHlwZS5ydW5BY3Rpb24gPSBmdW5jdGlvbiAobWV0aG9kLCBwYXRoLCBxdWVyeVBhcmFtcywgYm9keURhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJ1bl9hY3Rpb25fMS5kZWZhdWx0KHRoaXMsIG1ldGhvZCwgcGF0aCwgcXVlcnlQYXJhbXMsIGJvZHlEYXRhLCBjYWxsYmFjaywgMCk7XG4gICAgfTtcbiAgICBCYXNlLnByb3RvdHlwZS5fZ2V0UmVxdWVzdEhlYWRlcnMgPSBmdW5jdGlvbiAoaGVhZGVycykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gbmV3IGh0dHBfaGVhZGVyc18xLmRlZmF1bHQoKTtcbiAgICAgICAgcmVzdWx0LnNldCgnQXV0aG9yaXphdGlvbicsIFwiQmVhcmVyIFwiICsgdGhpcy5fYWlydGFibGUuX2FwaUtleSk7XG4gICAgICAgIHJlc3VsdC5zZXQoJ1VzZXItQWdlbnQnLCB1c2VyQWdlbnQpO1xuICAgICAgICByZXN1bHQuc2V0KCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0ga2V5c18xLmRlZmF1bHQoaGVhZGVycyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgaGVhZGVyS2V5ID0gX2FbX2ldO1xuICAgICAgICAgICAgcmVzdWx0LnNldChoZWFkZXJLZXksIGhlYWRlcnNbaGVhZGVyS2V5XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdC50b0pTT04oKTtcbiAgICB9O1xuICAgIEJhc2UucHJvdG90eXBlLl9jaGVja1N0YXR1c0ZvckVycm9yID0gZnVuY3Rpb24gKHN0YXR1c0NvZGUsIGJvZHkpIHtcbiAgICAgICAgdmFyIF9hID0gKGJvZHkgIT09IG51bGwgJiYgYm9keSAhPT0gdm9pZCAwID8gYm9keSA6IHsgZXJyb3I6IHt9IH0pLmVycm9yLCBlcnJvciA9IF9hID09PSB2b2lkIDAgPyB7fSA6IF9hO1xuICAgICAgICB2YXIgdHlwZSA9IGVycm9yLnR5cGUsIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICBpZiAoc3RhdHVzQ29kZSA9PT0gNDAxKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGFpcnRhYmxlX2Vycm9yXzEuZGVmYXVsdCgnQVVUSEVOVElDQVRJT05fUkVRVUlSRUQnLCAnWW91IHNob3VsZCBwcm92aWRlIHZhbGlkIGFwaSBrZXkgdG8gcGVyZm9ybSB0aGlzIG9wZXJhdGlvbicsIHN0YXR1c0NvZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXR1c0NvZGUgPT09IDQwMykge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBhaXJ0YWJsZV9lcnJvcl8xLmRlZmF1bHQoJ05PVF9BVVRIT1JJWkVEJywgJ1lvdSBhcmUgbm90IGF1dGhvcml6ZWQgdG8gcGVyZm9ybSB0aGlzIG9wZXJhdGlvbicsIHN0YXR1c0NvZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHN0YXR1c0NvZGUgPT09IDQwNCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBhaXJ0YWJsZV9lcnJvcl8xLmRlZmF1bHQoJ05PVF9GT1VORCcsIG1lc3NhZ2UgIT09IG51bGwgJiYgbWVzc2FnZSAhPT0gdm9pZCAwID8gbWVzc2FnZSA6ICdDb3VsZCBub3QgZmluZCB3aGF0IHlvdSBhcmUgbG9va2luZyBmb3InLCBzdGF0dXNDb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdGF0dXNDb2RlID09PSA0MTMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgYWlydGFibGVfZXJyb3JfMS5kZWZhdWx0KCdSRVFVRVNUX1RPT19MQVJHRScsICdSZXF1ZXN0IGJvZHkgaXMgdG9vIGxhcmdlJywgc3RhdHVzQ29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gNDIyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGFpcnRhYmxlX2Vycm9yXzEuZGVmYXVsdCh0eXBlICE9PSBudWxsICYmIHR5cGUgIT09IHZvaWQgMCA/IHR5cGUgOiAnVU5QUk9DRVNTQUJMRV9FTlRJVFknLCBtZXNzYWdlICE9PSBudWxsICYmIG1lc3NhZ2UgIT09IHZvaWQgMCA/IG1lc3NhZ2UgOiAnVGhlIG9wZXJhdGlvbiBjYW5ub3QgYmUgcHJvY2Vzc2VkJywgc3RhdHVzQ29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gNDI5KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGFpcnRhYmxlX2Vycm9yXzEuZGVmYXVsdCgnVE9PX01BTllfUkVRVUVTVFMnLCAnWW91IGhhdmUgbWFkZSB0b28gbWFueSByZXF1ZXN0cyBpbiBhIHNob3J0IHBlcmlvZCBvZiB0aW1lLiBQbGVhc2UgcmV0cnkgeW91ciByZXF1ZXN0IGxhdGVyJywgc3RhdHVzQ29kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gNTAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IGFpcnRhYmxlX2Vycm9yXzEuZGVmYXVsdCgnU0VSVkVSX0VSUk9SJywgJ1RyeSBhZ2Fpbi4gSWYgdGhlIHByb2JsZW0gcGVyc2lzdHMsIGNvbnRhY3Qgc3VwcG9ydC4nLCBzdGF0dXNDb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdGF0dXNDb2RlID09PSA1MDMpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgYWlydGFibGVfZXJyb3JfMS5kZWZhdWx0KCdTRVJWSUNFX1VOQVZBSUxBQkxFJywgJ1RoZSBzZXJ2aWNlIGlzIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlLiBQbGVhc2UgcmV0cnkgc2hvcnRseS4nLCBzdGF0dXNDb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzdGF0dXNDb2RlID49IDQwMCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBhaXJ0YWJsZV9lcnJvcl8xLmRlZmF1bHQodHlwZSAhPT0gbnVsbCAmJiB0eXBlICE9PSB2b2lkIDAgPyB0eXBlIDogJ1VORVhQRUNURURfRVJST1InLCBtZXNzYWdlICE9PSBudWxsICYmIG1lc3NhZ2UgIT09IHZvaWQgMCA/IG1lc3NhZ2UgOiAnQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZCcsIHN0YXR1c0NvZGUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIEJhc2UucHJvdG90eXBlLmRvQ2FsbCA9IGZ1bmN0aW9uICh0YWJsZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFibGUodGFibGVOYW1lKTtcbiAgICB9O1xuICAgIEJhc2UucHJvdG90eXBlLmdldElkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faWQ7XG4gICAgfTtcbiAgICBCYXNlLmNyZWF0ZUZ1bmN0b3IgPSBmdW5jdGlvbiAoYWlydGFibGUsIGJhc2VJZCkge1xuICAgICAgICB2YXIgYmFzZSA9IG5ldyBCYXNlKGFpcnRhYmxlLCBiYXNlSWQpO1xuICAgICAgICB2YXIgYmFzZUZuID0gZnVuY3Rpb24gKHRhYmxlTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIGJhc2UuZG9DYWxsKHRhYmxlTmFtZSk7XG4gICAgICAgIH07XG4gICAgICAgIGJhc2VGbi5fYmFzZSA9IGJhc2U7XG4gICAgICAgIGJhc2VGbi50YWJsZSA9IGJhc2UudGFibGUuYmluZChiYXNlKTtcbiAgICAgICAgYmFzZUZuLm1ha2VSZXF1ZXN0ID0gYmFzZS5tYWtlUmVxdWVzdC5iaW5kKGJhc2UpO1xuICAgICAgICBiYXNlRm4ucnVuQWN0aW9uID0gYmFzZS5ydW5BY3Rpb24uYmluZChiYXNlKTtcbiAgICAgICAgYmFzZUZuLmdldElkID0gYmFzZS5nZXRJZC5iaW5kKGJhc2UpO1xuICAgICAgICByZXR1cm4gYmFzZUZuO1xuICAgIH07XG4gICAgcmV0dXJuIEJhc2U7XG59KCkpO1xuZnVuY3Rpb24gX2NhblJlcXVlc3RNZXRob2RJbmNsdWRlQm9keShtZXRob2QpIHtcbiAgICByZXR1cm4gbWV0aG9kICE9PSAnR0VUJyAmJiBtZXRob2QgIT09ICdERUxFVEUnO1xufVxuZnVuY3Rpb24gX2dldEVycm9yRm9yTm9uT2JqZWN0Qm9keShzdGF0dXNDb2RlLCBib2R5KSB7XG4gICAgaWYgKGlzUGxhaW5PYmplY3RfMS5kZWZhdWx0KGJvZHkpKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBhaXJ0YWJsZV9lcnJvcl8xLmRlZmF1bHQoJ1VORVhQRUNURURfRVJST1InLCAnVGhlIHJlc3BvbnNlIGZyb20gQWlydGFibGUgd2FzIGludmFsaWQgSlNPTi4gUGxlYXNlIHRyeSBhZ2FpbiBzb29uLicsIHN0YXR1c0NvZGUpO1xuICAgIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gQmFzZTtcblxufSx7XCIuL2Fib3J0LWNvbnRyb2xsZXJcIjoxLFwiLi9haXJ0YWJsZV9lcnJvclwiOjIsXCIuL2V4cG9uZW50aWFsX2JhY2tvZmZfd2l0aF9qaXR0ZXJcIjo2LFwiLi9mZXRjaFwiOjcsXCIuL2h0dHBfaGVhZGVyc1wiOjksXCIuL29iamVjdF90b19xdWVyeV9wYXJhbV9zdHJpbmdcIjoxMSxcIi4vcGFja2FnZV92ZXJzaW9uXCI6MTIsXCIuL3J1bl9hY3Rpb25cIjoxNixcIi4vdGFibGVcIjoxNyxcImxvZGFzaC9nZXRcIjo3NyxcImxvZGFzaC9pc1BsYWluT2JqZWN0XCI6ODksXCJsb2Rhc2gva2V5c1wiOjkzfV0sNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbi8qKlxuICogR2l2ZW4gYSBmdW5jdGlvbiBmbiB0aGF0IHRha2VzIGEgY2FsbGJhY2sgYXMgaXRzIGxhc3QgYXJndW1lbnQsIHJldHVybnNcbiAqIGEgbmV3IHZlcnNpb24gb2YgdGhlIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGNhbGxiYWNrIG9wdGlvbmFsbHkuIElmXG4gKiB0aGUgZnVuY3Rpb24gaXMgbm90IGNhbGxlZCB3aXRoIGEgY2FsbGJhY2sgZm9yIHRoZSBsYXN0IGFyZ3VtZW50LCB0aGVcbiAqIGZ1bmN0aW9uIHdpbGwgcmV0dXJuIGEgcHJvbWlzZSBpbnN0ZWFkLlxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55LCBAdHlwZXNjcmlwdC1lc2xpbnQvZXhwbGljaXQtbW9kdWxlLWJvdW5kYXJ5LXR5cGVzICovXG5mdW5jdGlvbiBjYWxsYmFja1RvUHJvbWlzZShmbiwgY29udGV4dCwgY2FsbGJhY2tBcmdJbmRleCkge1xuICAgIGlmIChjYWxsYmFja0FyZ0luZGV4ID09PSB2b2lkIDApIHsgY2FsbGJhY2tBcmdJbmRleCA9IHZvaWQgMDsgfVxuICAgIC8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSwgQHR5cGVzY3JpcHQtZXNsaW50L2V4cGxpY2l0LW1vZHVsZS1ib3VuZGFyeS10eXBlcyAqL1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjYWxsQXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgY2FsbEFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGhpc0NhbGxiYWNrQXJnSW5kZXg7XG4gICAgICAgIGlmIChjYWxsYmFja0FyZ0luZGV4ID09PSB2b2lkIDApIHtcbiAgICAgICAgICAgIC8vIGlzdGFuYnVsIGlnbm9yZSBuZXh0XG4gICAgICAgICAgICB0aGlzQ2FsbGJhY2tBcmdJbmRleCA9IGNhbGxBcmdzLmxlbmd0aCA+IDAgPyBjYWxsQXJncy5sZW5ndGggLSAxIDogMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXNDYWxsYmFja0FyZ0luZGV4ID0gY2FsbGJhY2tBcmdJbmRleDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FsbGJhY2tBcmcgPSBjYWxsQXJnc1t0aGlzQ2FsbGJhY2tBcmdJbmRleF07XG4gICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2tBcmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KGNvbnRleHQsIGNhbGxBcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgYXJnc18xID0gW107XG4gICAgICAgICAgICAvLyBJZiBhbiBleHBsaWNpdCBjYWxsYmFja0FyZ0luZGV4IGlzIHNldCwgYnV0IHRoZSBmdW5jdGlvbiBpcyBjYWxsZWRcbiAgICAgICAgICAgIC8vIHdpdGggdG9vIGZldyBhcmd1bWVudHMsIHdlIHdhbnQgdG8gcHVzaCB1bmRlZmluZWQgb250byBhcmdzIHNvIHRoYXRcbiAgICAgICAgICAgIC8vIG91ciBjb25zdHJ1Y3RlZCBjYWxsYmFjayBlbmRzIHVwIGF0IHRoZSByaWdodCBpbmRleC5cbiAgICAgICAgICAgIHZhciBhcmdMZW4gPSBNYXRoLm1heChjYWxsQXJncy5sZW5ndGgsIHRoaXNDYWxsYmFja0FyZ0luZGV4KTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJnTGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzXzEucHVzaChjYWxsQXJnc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGFyZ3NfMS5wdXNoKGZ1bmN0aW9uIChlcnIsIHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3NfMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59XG5tb2R1bGUuZXhwb3J0cyA9IGNhbGxiYWNrVG9Qcm9taXNlO1xuXG59LHt9XSw1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIGRpZFdhcm5Gb3JEZXByZWNhdGlvbiA9IHt9O1xuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiBmb3IgbWFya2luZyBhIGZ1bmN0aW9uIGFzIGRlcHJlY2F0ZWQuXG4gKlxuICogV2lsbCBlbWl0IGEgd2FybmluZyB0aGUgZmlyc3QgdGltZSB0aGF0IGZ1bmN0aW9uIGlzIGNhbGxlZC5cbiAqXG4gKiBAcGFyYW0gZm4gdGhlIGZ1bmN0aW9uIHRvIG1hcmsgYXMgZGVwcmVjYXRlZC5cbiAqIEBwYXJhbSBrZXkgYSB1bmlxdWUga2V5IGlkZW50aWZ5aW5nIHRoZSBmdW5jdGlvbi5cbiAqIEBwYXJhbSBtZXNzYWdlIHRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKlxuICogQHJldHVybiBhIHdyYXBwZWQgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gZGVwcmVjYXRlKGZuLCBrZXksIG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZGlkV2FybkZvckRlcHJlY2F0aW9uW2tleV0pIHtcbiAgICAgICAgICAgIGRpZFdhcm5Gb3JEZXByZWNhdGlvbltrZXldID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihtZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9O1xufVxubW9kdWxlLmV4cG9ydHMgPSBkZXByZWNhdGU7XG5cbn0se31dLDY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgaW50ZXJuYWxfY29uZmlnX2pzb25fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9pbnRlcm5hbF9jb25maWcuanNvblwiKSk7XG4vLyBcIkZ1bGwgSml0dGVyXCIgYWxnb3JpdGhtIHRha2VuIGZyb20gaHR0cHM6Ly9hd3MuYW1hem9uLmNvbS9ibG9ncy9hcmNoaXRlY3R1cmUvZXhwb25lbnRpYWwtYmFja29mZi1hbmQtaml0dGVyL1xuZnVuY3Rpb24gZXhwb25lbnRpYWxCYWNrb2ZmV2l0aEppdHRlcihudW1iZXJPZlJldHJpZXMpIHtcbiAgICB2YXIgcmF3QmFja29mZlRpbWVNcyA9IGludGVybmFsX2NvbmZpZ19qc29uXzEuZGVmYXVsdC5JTklUSUFMX1JFVFJZX0RFTEFZX0lGX1JBVEVfTElNSVRFRCAqIE1hdGgucG93KDIsIG51bWJlck9mUmV0cmllcyk7XG4gICAgdmFyIGNsaXBwZWRCYWNrb2ZmVGltZU1zID0gTWF0aC5taW4oaW50ZXJuYWxfY29uZmlnX2pzb25fMS5kZWZhdWx0Lk1BWF9SRVRSWV9ERUxBWV9JRl9SQVRFX0xJTUlURUQsIHJhd0JhY2tvZmZUaW1lTXMpO1xuICAgIHZhciBqaXR0ZXJlZEJhY2tvZmZUaW1lTXMgPSBNYXRoLnJhbmRvbSgpICogY2xpcHBlZEJhY2tvZmZUaW1lTXM7XG4gICAgcmV0dXJuIGppdHRlcmVkQmFja29mZlRpbWVNcztcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb25lbnRpYWxCYWNrb2ZmV2l0aEppdHRlcjtcblxufSx7XCIuL2ludGVybmFsX2NvbmZpZy5qc29uXCI6MTB9XSw3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuLy8gaXN0YW5idWwgaWdub3JlIGZpbGVcbnZhciBub2RlX2ZldGNoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIm5vZGUtZmV0Y2hcIikpO1xudmFyIGJyb3dzZXJHbG9iYWwgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiBudWxsOyAvLyBzZWxmIGlzIHRoZSBnbG9iYWwgaW4gd2ViIHdvcmtlcnNcbm1vZHVsZS5leHBvcnRzID0gIWJyb3dzZXJHbG9iYWwgPyBub2RlX2ZldGNoXzEuZGVmYXVsdCA6IGJyb3dzZXJHbG9iYWwuZmV0Y2guYmluZChicm93c2VyR2xvYmFsKTtcblxufSx7XCJub2RlLWZldGNoXCI6MjB9XSw4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG5mdW5jdGlvbiBoYXMob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IGhhcztcblxufSx7fV0sOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbnZhciBrZXlzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC9rZXlzXCIpKTtcbnZhciBpc0Jyb3dzZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbnZhciBIdHRwSGVhZGVycyA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBIdHRwSGVhZGVycygpIHtcbiAgICAgICAgdGhpcy5faGVhZGVyc0J5TG93ZXJjYXNlZEtleSA9IHt9O1xuICAgIH1cbiAgICBIdHRwSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKGhlYWRlcktleSwgaGVhZGVyVmFsdWUpIHtcbiAgICAgICAgdmFyIGxvd2VyY2FzZWRLZXkgPSBoZWFkZXJLZXkudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKGxvd2VyY2FzZWRLZXkgPT09ICd4LWFpcnRhYmxlLXVzZXItYWdlbnQnKSB7XG4gICAgICAgICAgICBsb3dlcmNhc2VkS2V5ID0gJ3VzZXItYWdlbnQnO1xuICAgICAgICAgICAgaGVhZGVyS2V5ID0gJ1VzZXItQWdlbnQnO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2hlYWRlcnNCeUxvd2VyY2FzZWRLZXlbbG93ZXJjYXNlZEtleV0gPSB7XG4gICAgICAgICAgICBoZWFkZXJLZXk6IGhlYWRlcktleSxcbiAgICAgICAgICAgIGhlYWRlclZhbHVlOiBoZWFkZXJWYWx1ZSxcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIEh0dHBIZWFkZXJzLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IGtleXNfMS5kZWZhdWx0KHRoaXMuX2hlYWRlcnNCeUxvd2VyY2FzZWRLZXkpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGxvd2VyY2FzZWRLZXkgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgaGVhZGVyRGVmaW5pdGlvbiA9IHRoaXMuX2hlYWRlcnNCeUxvd2VyY2FzZWRLZXlbbG93ZXJjYXNlZEtleV07XG4gICAgICAgICAgICB2YXIgaGVhZGVyS2V5ID0gdm9pZCAwO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIGlmIChpc0Jyb3dzZXIgJiYgbG93ZXJjYXNlZEtleSA9PT0gJ3VzZXItYWdlbnQnKSB7XG4gICAgICAgICAgICAgICAgLy8gU29tZSBicm93c2VycyBkbyBub3QgYWxsb3cgb3ZlcnJpZGluZyB0aGUgdXNlciBhZ2VudC5cbiAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vQWlydGFibGUvYWlydGFibGUuanMvaXNzdWVzLzUyXG4gICAgICAgICAgICAgICAgaGVhZGVyS2V5ID0gJ1gtQWlydGFibGUtVXNlci1BZ2VudCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWFkZXJLZXkgPSBoZWFkZXJEZWZpbml0aW9uLmhlYWRlcktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3VsdFtoZWFkZXJLZXldID0gaGVhZGVyRGVmaW5pdGlvbi5oZWFkZXJWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgcmV0dXJuIEh0dHBIZWFkZXJzO1xufSgpKTtcbm1vZHVsZS5leHBvcnRzID0gSHR0cEhlYWRlcnM7XG5cbn0se1wibG9kYXNoL2tleXNcIjo5M31dLDEwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIklOSVRJQUxfUkVUUllfREVMQVlfSUZfUkFURV9MSU1JVEVEXCI6IDUwMDAsXG4gICAgXCJNQVhfUkVUUllfREVMQVlfSUZfUkFURV9MSU1JVEVEXCI6IDYwMDAwMFxufVxuXG59LHt9XSwxMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbnZhciBpc0FycmF5XzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC9pc0FycmF5XCIpKTtcbnZhciBpc05pbF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvaXNOaWxcIikpO1xudmFyIGtleXNfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwibG9kYXNoL2tleXNcIikpO1xuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55ICovXG4vLyBBZGFwdGVkIGZyb20galF1ZXJ5LnBhcmFtOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvYmxvYi8yLjItc3RhYmxlL3NyYy9zZXJpYWxpemUuanNcbmZ1bmN0aW9uIGJ1aWxkUGFyYW1zKHByZWZpeCwgb2JqLCBhZGRGbikge1xuICAgIGlmIChpc0FycmF5XzEuZGVmYXVsdChvYmopKSB7XG4gICAgICAgIC8vIFNlcmlhbGl6ZSBhcnJheSBpdGVtLlxuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgb2JqLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gb2JqW2luZGV4XTtcbiAgICAgICAgICAgIGlmICgvXFxbXFxdJC8udGVzdChwcmVmaXgpKSB7XG4gICAgICAgICAgICAgICAgLy8gVHJlYXQgZWFjaCBhcnJheSBpdGVtIGFzIGEgc2NhbGFyLlxuICAgICAgICAgICAgICAgIGFkZEZuKHByZWZpeCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSXRlbSBpcyBub24tc2NhbGFyIChhcnJheSBvciBvYmplY3QpLCBlbmNvZGUgaXRzIG51bWVyaWMgaW5kZXguXG4gICAgICAgICAgICAgICAgYnVpbGRQYXJhbXMocHJlZml4ICsgXCJbXCIgKyAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbCA/IGluZGV4IDogJycpICsgXCJdXCIsIHZhbHVlLCBhZGRGbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIG9iaiA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gU2VyaWFsaXplIG9iamVjdCBpdGVtLlxuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0ga2V5c18xLmRlZmF1bHQob2JqKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBfYVtfaV07XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgICAgIGJ1aWxkUGFyYW1zKHByZWZpeCArIFwiW1wiICsga2V5ICsgXCJdXCIsIHZhbHVlLCBhZGRGbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIC8vIFNlcmlhbGl6ZSBzY2FsYXIgaXRlbS5cbiAgICAgICAgYWRkRm4ocHJlZml4LCBvYmopO1xuICAgIH1cbn1cbmZ1bmN0aW9uIG9iamVjdFRvUXVlcnlQYXJhbVN0cmluZyhvYmopIHtcbiAgICB2YXIgcGFydHMgPSBbXTtcbiAgICB2YXIgYWRkRm4gPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICB2YWx1ZSA9IGlzTmlsXzEuZGVmYXVsdCh2YWx1ZSkgPyAnJyA6IHZhbHVlO1xuICAgICAgICBwYXJ0cy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpKTtcbiAgICB9O1xuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBrZXlzXzEuZGVmYXVsdChvYmopOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIga2V5ID0gX2FbX2ldO1xuICAgICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgICAgYnVpbGRQYXJhbXMoa2V5LCB2YWx1ZSwgYWRkRm4pO1xuICAgIH1cbiAgICByZXR1cm4gcGFydHMuam9pbignJicpLnJlcGxhY2UoLyUyMC9nLCAnKycpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBvYmplY3RUb1F1ZXJ5UGFyYW1TdHJpbmc7XG5cbn0se1wibG9kYXNoL2lzQXJyYXlcIjo3OSxcImxvZGFzaC9pc05pbFwiOjg1LFwibG9kYXNoL2tleXNcIjo5M31dLDEyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xubW9kdWxlLmV4cG9ydHMgPSBcIjAuMTIuMlwiO1xuXG59LHt9XSwxMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgaXNGdW5jdGlvbl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvaXNGdW5jdGlvblwiKSk7XG52YXIga2V5c18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gva2V5c1wiKSk7XG52YXIgcmVjb3JkXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcmVjb3JkXCIpKTtcbnZhciBjYWxsYmFja190b19wcm9taXNlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY2FsbGJhY2tfdG9fcHJvbWlzZVwiKSk7XG52YXIgaGFzXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vaGFzXCIpKTtcbnZhciBxdWVyeV9wYXJhbXNfMSA9IHJlcXVpcmUoXCIuL3F1ZXJ5X3BhcmFtc1wiKTtcbnZhciBvYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vb2JqZWN0X3RvX3F1ZXJ5X3BhcmFtX3N0cmluZ1wiKSk7XG4vKipcbiAqIEJ1aWxkcyBhIHF1ZXJ5IG9iamVjdC4gV29uJ3QgZmV0Y2ggdW50aWwgYGZpcnN0UGFnZWAgb3JcbiAqIG9yIGBlYWNoUGFnZWAgaXMgY2FsbGVkLlxuICpcbiAqIFBhcmFtcyBzaG91bGQgYmUgdmFsaWRhdGVkIHByaW9yIHRvIGJlaW5nIHBhc3NlZCB0byBRdWVyeVxuICogd2l0aCBgUXVlcnkudmFsaWRhdGVQYXJhbXNgLlxuICovXG52YXIgUXVlcnkgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gUXVlcnkodGFibGUsIHBhcmFtcykge1xuICAgICAgICB0aGlzLl90YWJsZSA9IHRhYmxlO1xuICAgICAgICB0aGlzLl9wYXJhbXMgPSBwYXJhbXM7XG4gICAgICAgIHRoaXMuZmlyc3RQYWdlID0gY2FsbGJhY2tfdG9fcHJvbWlzZV8xLmRlZmF1bHQoZmlyc3RQYWdlLCB0aGlzKTtcbiAgICAgICAgdGhpcy5lYWNoUGFnZSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KGVhY2hQYWdlLCB0aGlzLCAxKTtcbiAgICAgICAgdGhpcy5hbGwgPSBjYWxsYmFja190b19wcm9taXNlXzEuZGVmYXVsdChhbGwsIHRoaXMpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBWYWxpZGF0ZXMgdGhlIHBhcmFtZXRlcnMgZm9yIHBhc3NpbmcgdG8gdGhlIFF1ZXJ5IGNvbnN0cnVjdG9yLlxuICAgICAqXG4gICAgICogQHBhcmFtcyB7b2JqZWN0fSBwYXJhbXMgcGFyYW1ldGVycyB0byB2YWxpZGF0ZVxuICAgICAqXG4gICAgICogQHJldHVybiBhbiBvYmplY3Qgd2l0aCB0d28ga2V5czpcbiAgICAgKiAgdmFsaWRQYXJhbXM6IHRoZSBvYmplY3QgdGhhdCBzaG91bGQgYmUgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAgICAgKiAgaWdub3JlZEtleXM6IGEgbGlzdCBvZiBrZXlzIHRoYXQgd2lsbCBiZSBpZ25vcmVkLlxuICAgICAqICBlcnJvcnM6IGEgbGlzdCBvZiBlcnJvciBtZXNzYWdlcy5cbiAgICAgKi9cbiAgICBRdWVyeS52YWxpZGF0ZVBhcmFtcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgdmFyIHZhbGlkUGFyYW1zID0ge307XG4gICAgICAgIHZhciBpZ25vcmVkS2V5cyA9IFtdO1xuICAgICAgICB2YXIgZXJyb3JzID0gW107XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBrZXlzXzEuZGVmYXVsdChwYXJhbXMpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIGtleSA9IF9hW19pXTtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHBhcmFtc1trZXldO1xuICAgICAgICAgICAgaWYgKGhhc18xLmRlZmF1bHQoUXVlcnkucGFyYW1WYWxpZGF0b3JzLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbGlkYXRvciA9IFF1ZXJ5LnBhcmFtVmFsaWRhdG9yc1trZXldO1xuICAgICAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdG9yKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAodmFsaWRhdGlvblJlc3VsdC5wYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkUGFyYW1zW2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHZhbGlkYXRpb25SZXN1bHQuZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGlnbm9yZWRLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsaWRQYXJhbXM6IHZhbGlkUGFyYW1zLFxuICAgICAgICAgICAgaWdub3JlZEtleXM6IGlnbm9yZWRLZXlzLFxuICAgICAgICAgICAgZXJyb3JzOiBlcnJvcnMsXG4gICAgICAgIH07XG4gICAgfTtcbiAgICBRdWVyeS5wYXJhbVZhbGlkYXRvcnMgPSBxdWVyeV9wYXJhbXNfMS5wYXJhbVZhbGlkYXRvcnM7XG4gICAgcmV0dXJuIFF1ZXJ5O1xufSgpKTtcbi8qKlxuICogRmV0Y2hlcyB0aGUgZmlyc3QgcGFnZSBvZiByZXN1bHRzIGZvciB0aGUgcXVlcnkgYXN5bmNocm9ub3VzbHksXG4gKiB0aGVuIGNhbGxzIGBkb25lKGVycm9yLCByZWNvcmRzKWAuXG4gKi9cbmZ1bmN0aW9uIGZpcnN0UGFnZShkb25lKSB7XG4gICAgaWYgKCFpc0Z1bmN0aW9uXzEuZGVmYXVsdChkb25lKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmaXJzdCBwYXJhbWV0ZXIgdG8gYGZpcnN0UGFnZWAgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG4gICAgfVxuICAgIHRoaXMuZWFjaFBhZ2UoZnVuY3Rpb24gKHJlY29yZHMpIHtcbiAgICAgICAgZG9uZShudWxsLCByZWNvcmRzKTtcbiAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgZG9uZShlcnJvciwgbnVsbCk7XG4gICAgfSk7XG59XG4vKipcbiAqIEZldGNoZXMgZWFjaCBwYWdlIG9mIHJlc3VsdHMgZm9yIHRoZSBxdWVyeSBhc3luY2hyb25vdXNseS5cbiAqXG4gKiBDYWxscyBgcGFnZUNhbGxiYWNrKHJlY29yZHMsIGZldGNoTmV4dFBhZ2UpYCBmb3IgZWFjaFxuICogcGFnZS4gWW91IG11c3QgY2FsbCBgZmV0Y2hOZXh0UGFnZSgpYCB0byBmZXRjaCB0aGUgbmV4dCBwYWdlIG9mXG4gKiByZXN1bHRzLlxuICpcbiAqIEFmdGVyIGZldGNoaW5nIGFsbCBwYWdlcywgb3IgaWYgdGhlcmUncyBhbiBlcnJvciwgY2FsbHNcbiAqIGBkb25lKGVycm9yKWAuXG4gKi9cbmZ1bmN0aW9uIGVhY2hQYWdlKHBhZ2VDYWxsYmFjaywgZG9uZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgaWYgKCFpc0Z1bmN0aW9uXzEuZGVmYXVsdChwYWdlQ2FsbGJhY2spKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGZpcnN0IHBhcmFtZXRlciB0byBgZWFjaFBhZ2VgIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgIH1cbiAgICBpZiAoIWlzRnVuY3Rpb25fMS5kZWZhdWx0KGRvbmUpICYmIGRvbmUgIT09IHZvaWQgMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBzZWNvbmQgcGFyYW1ldGVyIHRvIGBlYWNoUGFnZWAgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIHVuZGVmaW5lZCcpO1xuICAgIH1cbiAgICB2YXIgcGFyYW1zID0gX19hc3NpZ24oe30sIHRoaXMuX3BhcmFtcyk7XG4gICAgdmFyIHBhdGhBbmRQYXJhbXNBc1N0cmluZyA9IFwiL1wiICsgdGhpcy5fdGFibGUuX3VybEVuY29kZWROYW1lT3JJZCgpICsgXCI/XCIgKyBvYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXzEuZGVmYXVsdChwYXJhbXMpO1xuICAgIHZhciBxdWVyeVBhcmFtcyA9IHt9O1xuICAgIHZhciByZXF1ZXN0RGF0YSA9IG51bGw7XG4gICAgdmFyIG1ldGhvZDtcbiAgICB2YXIgcGF0aDtcbiAgICBpZiAocGFyYW1zLm1ldGhvZCA9PT0gJ3Bvc3QnIHx8IHBhdGhBbmRQYXJhbXNBc1N0cmluZy5sZW5ndGggPiBxdWVyeV9wYXJhbXNfMS5VUkxfQ0hBUkFDVEVSX0xFTkdUSF9MSU1JVCkge1xuICAgICAgICAvLyBUaGVyZSBpcyBhIDE2a2IgbGltaXQgb24gR0VUIHJlcXVlc3RzLiBTaW5jZSB0aGUgVVJMIG1ha2VzIHVwIG5lYXJseSBhbGwgb2YgdGhlIHJlcXVlc3Qgc2l6ZSwgd2UgY2hlY2sgZm9yIGFueSByZXF1ZXN0cyB0aGF0XG4gICAgICAgIC8vIHRoYXQgY29tZSBjbG9zZSB0byB0aGlzIGxpbWl0IGFuZCBzZW5kIGl0IGFzIGEgUE9TVCBpbnN0ZWFkLiBBZGRpdGlvbmFsbHksIHdlJ2xsIHNlbmQgdGhlIHJlcXVlc3QgYXMgYSBwb3N0IGlmIGl0IGlzIHNwZWNpZmllZFxuICAgICAgICAvLyB3aXRoIHRoZSByZXF1ZXN0IHBhcmFtc1xuICAgICAgICByZXF1ZXN0RGF0YSA9IHBhcmFtcztcbiAgICAgICAgbWV0aG9kID0gJ3Bvc3QnO1xuICAgICAgICBwYXRoID0gXCIvXCIgKyB0aGlzLl90YWJsZS5fdXJsRW5jb2RlZE5hbWVPcklkKCkgKyBcIi9saXN0UmVjb3Jkc1wiO1xuICAgICAgICB2YXIgcGFyYW1OYW1lcyA9IE9iamVjdC5rZXlzKHBhcmFtcyk7XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgcGFyYW1OYW1lc18xID0gcGFyYW1OYW1lczsgX2kgPCBwYXJhbU5hbWVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1OYW1lID0gcGFyYW1OYW1lc18xW19pXTtcbiAgICAgICAgICAgIGlmIChxdWVyeV9wYXJhbXNfMS5zaG91bGRMaXN0UmVjb3Jkc1BhcmFtQmVQYXNzZWRBc1BhcmFtZXRlcihwYXJhbU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgLy8gdGltZVpvbmUgYW5kIHVzZXJMb2NhbGUgaXMgcGFyc2VkIGZyb20gdGhlIEdFVCByZXF1ZXN0IHNlcGFyYXRlbHkgZnJvbSB0aGUgb3RoZXIgcGFyYW1zLiBUaGlzIHBhcnNpbmdcbiAgICAgICAgICAgICAgICAvLyBkb2VzIG5vdCBvY2N1cnJpbmcgd2l0aGluIHRoZSBib2R5IHBhcnNlciB3ZSB1c2UgZm9yIFBPU1QgcmVxdWVzdHMsIHNvIHRoaXMgd2lsbCBzdGlsbCBuZWVkIHRvIGJlIHBhc3NlZFxuICAgICAgICAgICAgICAgIC8vIHZpYSBxdWVyeSBwYXJhbXNcbiAgICAgICAgICAgICAgICBxdWVyeVBhcmFtc1twYXJhbU5hbWVdID0gcGFyYW1zW3BhcmFtTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXF1ZXN0RGF0YVtwYXJhbU5hbWVdID0gcGFyYW1zW3BhcmFtTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG1ldGhvZCA9ICdnZXQnO1xuICAgICAgICBxdWVyeVBhcmFtcyA9IHBhcmFtcztcbiAgICAgICAgcGF0aCA9IFwiL1wiICsgdGhpcy5fdGFibGUuX3VybEVuY29kZWROYW1lT3JJZCgpO1xuICAgIH1cbiAgICB2YXIgaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIF90aGlzLl90YWJsZS5fYmFzZS5ydW5BY3Rpb24obWV0aG9kLCBwYXRoLCBxdWVyeVBhcmFtcywgcmVxdWVzdERhdGEsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlLCByZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkb25lKGVyciwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0Lm9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBwYXJhbXMub2Zmc2V0ID0gcmVzdWx0Lm9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGlubmVyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWNvcmRzID0gcmVzdWx0LnJlY29yZHMubWFwKGZ1bmN0aW9uIChyZWNvcmRKc29uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgcmVjb3JkXzEuZGVmYXVsdChfdGhpcy5fdGFibGUsIG51bGwsIHJlY29yZEpzb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBhZ2VDYWxsYmFjayhyZWNvcmRzLCBuZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBpbm5lcigpO1xufVxuLyoqXG4gKiBGZXRjaGVzIGFsbCBwYWdlcyBvZiByZXN1bHRzIGFzeW5jaHJvbm91c2x5LiBNYXkgdGFrZSBhIGxvbmcgdGltZS5cbiAqL1xuZnVuY3Rpb24gYWxsKGRvbmUpIHtcbiAgICBpZiAoIWlzRnVuY3Rpb25fMS5kZWZhdWx0KGRvbmUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGZpcnN0IHBhcmFtZXRlciB0byBgYWxsYCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICB9XG4gICAgdmFyIGFsbFJlY29yZHMgPSBbXTtcbiAgICB0aGlzLmVhY2hQYWdlKGZ1bmN0aW9uIChwYWdlUmVjb3JkcywgZmV0Y2hOZXh0UGFnZSkge1xuICAgICAgICBhbGxSZWNvcmRzLnB1c2guYXBwbHkoYWxsUmVjb3JkcywgcGFnZVJlY29yZHMpO1xuICAgICAgICBmZXRjaE5leHRQYWdlKCk7XG4gICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBkb25lKGVyciwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb25lKG51bGwsIGFsbFJlY29yZHMpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5O1xuXG59LHtcIi4vY2FsbGJhY2tfdG9fcHJvbWlzZVwiOjQsXCIuL2hhc1wiOjgsXCIuL29iamVjdF90b19xdWVyeV9wYXJhbV9zdHJpbmdcIjoxMSxcIi4vcXVlcnlfcGFyYW1zXCI6MTQsXCIuL3JlY29yZFwiOjE1LFwibG9kYXNoL2lzRnVuY3Rpb25cIjo4MyxcImxvZGFzaC9rZXlzXCI6OTN9XSwxNDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuc2hvdWxkTGlzdFJlY29yZHNQYXJhbUJlUGFzc2VkQXNQYXJhbWV0ZXIgPSBleHBvcnRzLlVSTF9DSEFSQUNURVJfTEVOR1RIX0xJTUlUID0gZXhwb3J0cy5wYXJhbVZhbGlkYXRvcnMgPSB2b2lkIDA7XG52YXIgdHlwZWNoZWNrXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdHlwZWNoZWNrXCIpKTtcbnZhciBpc1N0cmluZ18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvaXNTdHJpbmdcIikpO1xudmFyIGlzTnVtYmVyXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC9pc051bWJlclwiKSk7XG52YXIgaXNQbGFpbk9iamVjdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvaXNQbGFpbk9iamVjdFwiKSk7XG52YXIgaXNCb29sZWFuXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImxvZGFzaC9pc0Jvb2xlYW5cIikpO1xuZXhwb3J0cy5wYXJhbVZhbGlkYXRvcnMgPSB7XG4gICAgZmllbGRzOiB0eXBlY2hlY2tfMS5kZWZhdWx0KHR5cGVjaGVja18xLmRlZmF1bHQuaXNBcnJheU9mKGlzU3RyaW5nXzEuZGVmYXVsdCksICd0aGUgdmFsdWUgZm9yIGBmaWVsZHNgIHNob3VsZCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyksXG4gICAgZmlsdGVyQnlGb3JtdWxhOiB0eXBlY2hlY2tfMS5kZWZhdWx0KGlzU3RyaW5nXzEuZGVmYXVsdCwgJ3RoZSB2YWx1ZSBmb3IgYGZpbHRlckJ5Rm9ybXVsYWAgc2hvdWxkIGJlIGEgc3RyaW5nJyksXG4gICAgbWF4UmVjb3JkczogdHlwZWNoZWNrXzEuZGVmYXVsdChpc051bWJlcl8xLmRlZmF1bHQsICd0aGUgdmFsdWUgZm9yIGBtYXhSZWNvcmRzYCBzaG91bGQgYmUgYSBudW1iZXInKSxcbiAgICBwYWdlU2l6ZTogdHlwZWNoZWNrXzEuZGVmYXVsdChpc051bWJlcl8xLmRlZmF1bHQsICd0aGUgdmFsdWUgZm9yIGBwYWdlU2l6ZWAgc2hvdWxkIGJlIGEgbnVtYmVyJyksXG4gICAgb2Zmc2V0OiB0eXBlY2hlY2tfMS5kZWZhdWx0KGlzTnVtYmVyXzEuZGVmYXVsdCwgJ3RoZSB2YWx1ZSBmb3IgYG9mZnNldGAgc2hvdWxkIGJlIGEgbnVtYmVyJyksXG4gICAgc29ydDogdHlwZWNoZWNrXzEuZGVmYXVsdCh0eXBlY2hlY2tfMS5kZWZhdWx0LmlzQXJyYXlPZihmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHJldHVybiAoaXNQbGFpbk9iamVjdF8xLmRlZmF1bHQob2JqKSAmJlxuICAgICAgICAgICAgaXNTdHJpbmdfMS5kZWZhdWx0KG9iai5maWVsZCkgJiZcbiAgICAgICAgICAgIChvYmouZGlyZWN0aW9uID09PSB2b2lkIDAgfHwgWydhc2MnLCAnZGVzYyddLmluY2x1ZGVzKG9iai5kaXJlY3Rpb24pKSk7XG4gICAgfSksICd0aGUgdmFsdWUgZm9yIGBzb3J0YCBzaG91bGQgYmUgYW4gYXJyYXkgb2Ygc29ydCBvYmplY3RzLiAnICtcbiAgICAgICAgJ0VhY2ggc29ydCBvYmplY3QgbXVzdCBoYXZlIGEgc3RyaW5nIGBmaWVsZGAgdmFsdWUsIGFuZCBhbiBvcHRpb25hbCAnICtcbiAgICAgICAgJ2BkaXJlY3Rpb25gIHZhbHVlIHRoYXQgaXMgXCJhc2NcIiBvciBcImRlc2NcIi4nKSxcbiAgICB2aWV3OiB0eXBlY2hlY2tfMS5kZWZhdWx0KGlzU3RyaW5nXzEuZGVmYXVsdCwgJ3RoZSB2YWx1ZSBmb3IgYHZpZXdgIHNob3VsZCBiZSBhIHN0cmluZycpLFxuICAgIGNlbGxGb3JtYXQ6IHR5cGVjaGVja18xLmRlZmF1bHQoZnVuY3Rpb24gKGNlbGxGb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIGlzU3RyaW5nXzEuZGVmYXVsdChjZWxsRm9ybWF0KSAmJiBbJ2pzb24nLCAnc3RyaW5nJ10uaW5jbHVkZXMoY2VsbEZvcm1hdCk7XG4gICAgfSwgJ3RoZSB2YWx1ZSBmb3IgYGNlbGxGb3JtYXRgIHNob3VsZCBiZSBcImpzb25cIiBvciBcInN0cmluZ1wiJyksXG4gICAgdGltZVpvbmU6IHR5cGVjaGVja18xLmRlZmF1bHQoaXNTdHJpbmdfMS5kZWZhdWx0LCAndGhlIHZhbHVlIGZvciBgdGltZVpvbmVgIHNob3VsZCBiZSBhIHN0cmluZycpLFxuICAgIHVzZXJMb2NhbGU6IHR5cGVjaGVja18xLmRlZmF1bHQoaXNTdHJpbmdfMS5kZWZhdWx0LCAndGhlIHZhbHVlIGZvciBgdXNlckxvY2FsZWAgc2hvdWxkIGJlIGEgc3RyaW5nJyksXG4gICAgbWV0aG9kOiB0eXBlY2hlY2tfMS5kZWZhdWx0KGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGlzU3RyaW5nXzEuZGVmYXVsdChtZXRob2QpICYmIFsnZ2V0JywgJ3Bvc3QnXS5pbmNsdWRlcyhtZXRob2QpO1xuICAgIH0sICd0aGUgdmFsdWUgZm9yIGBtZXRob2RgIHNob3VsZCBiZSBcImdldFwiIG9yIFwicG9zdFwiJyksXG4gICAgcmV0dXJuRmllbGRzQnlGaWVsZElkOiB0eXBlY2hlY2tfMS5kZWZhdWx0KGlzQm9vbGVhbl8xLmRlZmF1bHQsICd0aGUgdmFsdWUgZm9yIGByZXR1cm5GaWVsZHNCeUZpZWxkSWRgIHNob3VsZCBiZSBhIGJvb2xlYW4nKSxcbiAgICByZWNvcmRNZXRhZGF0YTogdHlwZWNoZWNrXzEuZGVmYXVsdCh0eXBlY2hlY2tfMS5kZWZhdWx0LmlzQXJyYXlPZihpc1N0cmluZ18xLmRlZmF1bHQpLCAndGhlIHZhbHVlIGZvciBgcmVjb3JkTWV0YWRhdGFgIHNob3VsZCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyksXG59O1xuZXhwb3J0cy5VUkxfQ0hBUkFDVEVSX0xFTkdUSF9MSU1JVCA9IDE1MDAwO1xuZXhwb3J0cy5zaG91bGRMaXN0UmVjb3Jkc1BhcmFtQmVQYXNzZWRBc1BhcmFtZXRlciA9IGZ1bmN0aW9uIChwYXJhbU5hbWUpIHtcbiAgICByZXR1cm4gcGFyYW1OYW1lID09PSAndGltZVpvbmUnIHx8IHBhcmFtTmFtZSA9PT0gJ3VzZXJMb2NhbGUnO1xufTtcblxufSx7XCIuL3R5cGVjaGVja1wiOjE4LFwibG9kYXNoL2lzQm9vbGVhblwiOjgxLFwibG9kYXNoL2lzTnVtYmVyXCI6ODYsXCJsb2Rhc2gvaXNQbGFpbk9iamVjdFwiOjg5LFwibG9kYXNoL2lzU3RyaW5nXCI6OTB9XSwxNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgY2FsbGJhY2tfdG9fcHJvbWlzZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2NhbGxiYWNrX3RvX3Byb21pc2VcIikpO1xudmFyIFJlY29yZCA9IC8qKiBAY2xhc3MgKi8gKGZ1bmN0aW9uICgpIHtcbiAgICBmdW5jdGlvbiBSZWNvcmQodGFibGUsIHJlY29yZElkLCByZWNvcmRKc29uKSB7XG4gICAgICAgIHRoaXMuX3RhYmxlID0gdGFibGU7XG4gICAgICAgIHRoaXMuaWQgPSByZWNvcmRJZCB8fCByZWNvcmRKc29uLmlkO1xuICAgICAgICBpZiAocmVjb3JkSnNvbikge1xuICAgICAgICAgICAgdGhpcy5jb21tZW50Q291bnQgPSByZWNvcmRKc29uLmNvbW1lbnRDb3VudDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldFJhd0pzb24ocmVjb3JkSnNvbik7XG4gICAgICAgIHRoaXMuc2F2ZSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KHNhdmUsIHRoaXMpO1xuICAgICAgICB0aGlzLnBhdGNoVXBkYXRlID0gY2FsbGJhY2tfdG9fcHJvbWlzZV8xLmRlZmF1bHQocGF0Y2hVcGRhdGUsIHRoaXMpO1xuICAgICAgICB0aGlzLnB1dFVwZGF0ZSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KHB1dFVwZGF0ZSwgdGhpcyk7XG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KGRlc3Ryb3ksIHRoaXMpO1xuICAgICAgICB0aGlzLmZldGNoID0gY2FsbGJhY2tfdG9fcHJvbWlzZV8xLmRlZmF1bHQoZmV0Y2gsIHRoaXMpO1xuICAgICAgICB0aGlzLnVwZGF0ZUZpZWxkcyA9IHRoaXMucGF0Y2hVcGRhdGU7XG4gICAgICAgIHRoaXMucmVwbGFjZUZpZWxkcyA9IHRoaXMucHV0VXBkYXRlO1xuICAgIH1cbiAgICBSZWNvcmQucHJvdG90eXBlLmdldElkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pZDtcbiAgICB9O1xuICAgIFJlY29yZC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGNvbHVtbk5hbWUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmllbGRzW2NvbHVtbk5hbWVdO1xuICAgIH07XG4gICAgUmVjb3JkLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoY29sdW1uTmFtZSwgY29sdW1uVmFsdWUpIHtcbiAgICAgICAgdGhpcy5maWVsZHNbY29sdW1uTmFtZV0gPSBjb2x1bW5WYWx1ZTtcbiAgICB9O1xuICAgIFJlY29yZC5wcm90b3R5cGUuc2V0UmF3SnNvbiA9IGZ1bmN0aW9uIChyYXdKc29uKSB7XG4gICAgICAgIHRoaXMuX3Jhd0pzb24gPSByYXdKc29uO1xuICAgICAgICB0aGlzLmZpZWxkcyA9ICh0aGlzLl9yYXdKc29uICYmIHRoaXMuX3Jhd0pzb24uZmllbGRzKSB8fCB7fTtcbiAgICB9O1xuICAgIHJldHVybiBSZWNvcmQ7XG59KCkpO1xuZnVuY3Rpb24gc2F2ZShkb25lKSB7XG4gICAgdGhpcy5wdXRVcGRhdGUodGhpcy5maWVsZHMsIGRvbmUpO1xufVxuZnVuY3Rpb24gcGF0Y2hVcGRhdGUoY2VsbFZhbHVlc0J5TmFtZSwgb3B0cywgZG9uZSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgaWYgKCFkb25lKSB7XG4gICAgICAgIGRvbmUgPSBvcHRzO1xuICAgICAgICBvcHRzID0ge307XG4gICAgfVxuICAgIHZhciB1cGRhdGVCb2R5ID0gX19hc3NpZ24oeyBmaWVsZHM6IGNlbGxWYWx1ZXNCeU5hbWUgfSwgb3B0cyk7XG4gICAgdGhpcy5fdGFibGUuX2Jhc2UucnVuQWN0aW9uKCdwYXRjaCcsIFwiL1wiICsgdGhpcy5fdGFibGUuX3VybEVuY29kZWROYW1lT3JJZCgpICsgXCIvXCIgKyB0aGlzLmlkLCB7fSwgdXBkYXRlQm9keSwgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UsIHJlc3VsdHMpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgZG9uZShlcnIpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF90aGlzLnNldFJhd0pzb24ocmVzdWx0cyk7XG4gICAgICAgIGRvbmUobnVsbCwgX3RoaXMpO1xuICAgIH0pO1xufVxuZnVuY3Rpb24gcHV0VXBkYXRlKGNlbGxWYWx1ZXNCeU5hbWUsIG9wdHMsIGRvbmUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIGlmICghZG9uZSkge1xuICAgICAgICBkb25lID0gb3B0cztcbiAgICAgICAgb3B0cyA9IHt9O1xuICAgIH1cbiAgICB2YXIgdXBkYXRlQm9keSA9IF9fYXNzaWduKHsgZmllbGRzOiBjZWxsVmFsdWVzQnlOYW1lIH0sIG9wdHMpO1xuICAgIHRoaXMuX3RhYmxlLl9iYXNlLnJ1bkFjdGlvbigncHV0JywgXCIvXCIgKyB0aGlzLl90YWJsZS5fdXJsRW5jb2RlZE5hbWVPcklkKCkgKyBcIi9cIiArIHRoaXMuaWQsIHt9LCB1cGRhdGVCb2R5LCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSwgcmVzdWx0cykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBkb25lKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuc2V0UmF3SnNvbihyZXN1bHRzKTtcbiAgICAgICAgZG9uZShudWxsLCBfdGhpcyk7XG4gICAgfSk7XG59XG5mdW5jdGlvbiBkZXN0cm95KGRvbmUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuX3RhYmxlLl9iYXNlLnJ1bkFjdGlvbignZGVsZXRlJywgXCIvXCIgKyB0aGlzLl90YWJsZS5fdXJsRW5jb2RlZE5hbWVPcklkKCkgKyBcIi9cIiArIHRoaXMuaWQsIHt9LCBudWxsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkb25lKG51bGwsIF90aGlzKTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZldGNoKGRvbmUpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuX3RhYmxlLl9iYXNlLnJ1bkFjdGlvbignZ2V0JywgXCIvXCIgKyB0aGlzLl90YWJsZS5fdXJsRW5jb2RlZE5hbWVPcklkKCkgKyBcIi9cIiArIHRoaXMuaWQsIHt9LCBudWxsLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSwgcmVzdWx0cykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBkb25lKGVycik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgX3RoaXMuc2V0UmF3SnNvbihyZXN1bHRzKTtcbiAgICAgICAgZG9uZShudWxsLCBfdGhpcyk7XG4gICAgfSk7XG59XG5tb2R1bGUuZXhwb3J0cyA9IFJlY29yZDtcblxufSx7XCIuL2NhbGxiYWNrX3RvX3Byb21pc2VcIjo0fV0sMTY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgZXhwb25lbnRpYWxfYmFja29mZl93aXRoX2ppdHRlcl8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2V4cG9uZW50aWFsX2JhY2tvZmZfd2l0aF9qaXR0ZXJcIikpO1xudmFyIG9iamVjdF90b19xdWVyeV9wYXJhbV9zdHJpbmdfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9vYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXCIpKTtcbnZhciBwYWNrYWdlX3ZlcnNpb25fMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9wYWNrYWdlX3ZlcnNpb25cIikpO1xudmFyIGZldGNoXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZmV0Y2hcIikpO1xudmFyIGFib3J0X2NvbnRyb2xsZXJfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9hYm9ydC1jb250cm9sbGVyXCIpKTtcbnZhciB1c2VyQWdlbnQgPSBcIkFpcnRhYmxlLmpzL1wiICsgcGFja2FnZV92ZXJzaW9uXzEuZGVmYXVsdDtcbmZ1bmN0aW9uIHJ1bkFjdGlvbihiYXNlLCBtZXRob2QsIHBhdGgsIHF1ZXJ5UGFyYW1zLCBib2R5RGF0YSwgY2FsbGJhY2ssIG51bUF0dGVtcHRzKSB7XG4gICAgdmFyIHVybCA9IGJhc2UuX2FpcnRhYmxlLl9lbmRwb2ludFVybCArIFwiL3ZcIiArIGJhc2UuX2FpcnRhYmxlLl9hcGlWZXJzaW9uTWFqb3IgKyBcIi9cIiArIGJhc2UuX2lkICsgcGF0aCArIFwiP1wiICsgb2JqZWN0X3RvX3F1ZXJ5X3BhcmFtX3N0cmluZ18xLmRlZmF1bHQocXVlcnlQYXJhbXMpO1xuICAgIHZhciBoZWFkZXJzID0ge1xuICAgICAgICBhdXRob3JpemF0aW9uOiBcIkJlYXJlciBcIiArIGJhc2UuX2FpcnRhYmxlLl9hcGlLZXksXG4gICAgICAgICd4LWFwaS12ZXJzaW9uJzogYmFzZS5fYWlydGFibGUuX2FwaVZlcnNpb24sXG4gICAgICAgICd4LWFpcnRhYmxlLWFwcGxpY2F0aW9uLWlkJzogYmFzZS5nZXRJZCgpLFxuICAgICAgICAnY29udGVudC10eXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgIH07XG4gICAgdmFyIGlzQnJvd3NlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnO1xuICAgIC8vIFNvbWUgYnJvd3NlcnMgZG8gbm90IGFsbG93IG92ZXJyaWRpbmcgdGhlIHVzZXIgYWdlbnQuXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL0FpcnRhYmxlL2FpcnRhYmxlLmpzL2lzc3Vlcy81MlxuICAgIGlmIChpc0Jyb3dzZXIpIHtcbiAgICAgICAgaGVhZGVyc1sneC1haXJ0YWJsZS11c2VyLWFnZW50J10gPSB1c2VyQWdlbnQ7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBoZWFkZXJzWydVc2VyLUFnZW50J10gPSB1c2VyQWdlbnQ7XG4gICAgfVxuICAgIHZhciBjb250cm9sbGVyID0gbmV3IGFib3J0X2NvbnRyb2xsZXJfMS5kZWZhdWx0KCk7XG4gICAgdmFyIG5vcm1hbGl6ZWRNZXRob2QgPSBtZXRob2QudG9VcHBlckNhc2UoKTtcbiAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiBub3JtYWxpemVkTWV0aG9kLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBzaWduYWw6IGNvbnRyb2xsZXIuc2lnbmFsLFxuICAgIH07XG4gICAgaWYgKGJvZHlEYXRhICE9PSBudWxsKSB7XG4gICAgICAgIGlmIChub3JtYWxpemVkTWV0aG9kID09PSAnR0VUJyB8fCBub3JtYWxpemVkTWV0aG9kID09PSAnSEVBRCcpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignYm9keSBhcmd1bWVudCB0byBydW5BY3Rpb24gYXJlIGlnbm9yZWQgd2l0aCBHRVQgb3IgSEVBRCByZXF1ZXN0cycpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgb3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keURhdGEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnRyb2xsZXIuYWJvcnQoKTtcbiAgICB9LCBiYXNlLl9haXJ0YWJsZS5fcmVxdWVzdFRpbWVvdXQpO1xuICAgIGZldGNoXzEuZGVmYXVsdCh1cmwsIG9wdGlvbnMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgaWYgKHJlc3Auc3RhdHVzID09PSA0MjkgJiYgIWJhc2UuX2FpcnRhYmxlLl9ub1JldHJ5SWZSYXRlTGltaXRlZCkge1xuICAgICAgICAgICAgdmFyIGJhY2tvZmZEZWxheU1zID0gZXhwb25lbnRpYWxfYmFja29mZl93aXRoX2ppdHRlcl8xLmRlZmF1bHQobnVtQXR0ZW1wdHMpO1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcnVuQWN0aW9uKGJhc2UsIG1ldGhvZCwgcGF0aCwgcXVlcnlQYXJhbXMsIGJvZHlEYXRhLCBjYWxsYmFjaywgbnVtQXR0ZW1wdHMgKyAxKTtcbiAgICAgICAgICAgIH0sIGJhY2tvZmZEZWxheU1zKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJlc3AuanNvbigpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyb3IgPSBiYXNlLl9jaGVja1N0YXR1c0ZvckVycm9yKHJlc3Auc3RhdHVzLCBib2R5KTtcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgUmVzcG9uc2UgaW50ZXJmYWNlIG1hdGNoZXMgaW50ZXJmYWNlIGZyb21cbiAgICAgICAgICAgICAgICAvLyBgcmVxdWVzdGAgUmVzcG9uc2Ugb2JqZWN0XG4gICAgICAgICAgICAgICAgdmFyIHIgPSB7fTtcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhyZXNwKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgICAgICByW3Byb3BlcnR5XSA9IHJlc3BbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHIuYm9keSA9IGJvZHk7XG4gICAgICAgICAgICAgICAgci5zdGF0dXNDb2RlID0gcmVzcC5zdGF0dXM7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIHIsIGJvZHkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGJhc2UuX2NoZWNrU3RhdHVzRm9yRXJyb3IocmVzcC5zdGF0dXMpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIGNhbGxiYWNrKGVycm9yKTtcbiAgICB9KTtcbn1cbm1vZHVsZS5leHBvcnRzID0gcnVuQWN0aW9uO1xuXG59LHtcIi4vYWJvcnQtY29udHJvbGxlclwiOjEsXCIuL2V4cG9uZW50aWFsX2JhY2tvZmZfd2l0aF9qaXR0ZXJcIjo2LFwiLi9mZXRjaFwiOjcsXCIuL29iamVjdF90b19xdWVyeV9wYXJhbV9zdHJpbmdcIjoxMSxcIi4vcGFja2FnZV92ZXJzaW9uXCI6MTJ9XSwxNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbnZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG52YXIgaXNQbGFpbk9iamVjdF8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJsb2Rhc2gvaXNQbGFpbk9iamVjdFwiKSk7XG52YXIgZGVwcmVjYXRlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vZGVwcmVjYXRlXCIpKTtcbnZhciBxdWVyeV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL3F1ZXJ5XCIpKTtcbnZhciBxdWVyeV9wYXJhbXNfMSA9IHJlcXVpcmUoXCIuL3F1ZXJ5X3BhcmFtc1wiKTtcbnZhciBvYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vb2JqZWN0X3RvX3F1ZXJ5X3BhcmFtX3N0cmluZ1wiKSk7XG52YXIgcmVjb3JkXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vcmVjb3JkXCIpKTtcbnZhciBjYWxsYmFja190b19wcm9taXNlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vY2FsbGJhY2tfdG9fcHJvbWlzZVwiKSk7XG52YXIgVGFibGUgPSAvKiogQGNsYXNzICovIChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gVGFibGUoYmFzZSwgdGFibGVJZCwgdGFibGVOYW1lKSB7XG4gICAgICAgIGlmICghdGFibGVJZCAmJiAhdGFibGVOYW1lKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RhYmxlIG5hbWUgb3IgdGFibGUgSUQgaXMgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9iYXNlID0gYmFzZTtcbiAgICAgICAgdGhpcy5pZCA9IHRhYmxlSWQ7XG4gICAgICAgIHRoaXMubmFtZSA9IHRhYmxlTmFtZTtcbiAgICAgICAgLy8gUHVibGljIEFQSVxuICAgICAgICB0aGlzLmZpbmQgPSBjYWxsYmFja190b19wcm9taXNlXzEuZGVmYXVsdCh0aGlzLl9maW5kUmVjb3JkQnlJZCwgdGhpcyk7XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gdGhpcy5fc2VsZWN0UmVjb3Jkcy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmNyZWF0ZSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KHRoaXMuX2NyZWF0ZVJlY29yZHMsIHRoaXMpO1xuICAgICAgICB0aGlzLnVwZGF0ZSA9IGNhbGxiYWNrX3RvX3Byb21pc2VfMS5kZWZhdWx0KHRoaXMuX3VwZGF0ZVJlY29yZHMuYmluZCh0aGlzLCBmYWxzZSksIHRoaXMpO1xuICAgICAgICB0aGlzLnJlcGxhY2UgPSBjYWxsYmFja190b19wcm9taXNlXzEuZGVmYXVsdCh0aGlzLl91cGRhdGVSZWNvcmRzLmJpbmQodGhpcywgdHJ1ZSksIHRoaXMpO1xuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBjYWxsYmFja190b19wcm9taXNlXzEuZGVmYXVsdCh0aGlzLl9kZXN0cm95UmVjb3JkLCB0aGlzKTtcbiAgICAgICAgLy8gRGVwcmVjYXRlZCBBUElcbiAgICAgICAgdGhpcy5saXN0ID0gZGVwcmVjYXRlXzEuZGVmYXVsdCh0aGlzLl9saXN0UmVjb3Jkcy5iaW5kKHRoaXMpLCAndGFibGUubGlzdCcsICdBaXJ0YWJsZTogYGxpc3QoKWAgaXMgZGVwcmVjYXRlZC4gVXNlIGBzZWxlY3QoKWAgaW5zdGVhZC4nKTtcbiAgICAgICAgdGhpcy5mb3JFYWNoID0gZGVwcmVjYXRlXzEuZGVmYXVsdCh0aGlzLl9mb3JFYWNoUmVjb3JkLmJpbmQodGhpcyksICd0YWJsZS5mb3JFYWNoJywgJ0FpcnRhYmxlOiBgZm9yRWFjaCgpYCBpcyBkZXByZWNhdGVkLiBVc2UgYHNlbGVjdCgpYCBpbnN0ZWFkLicpO1xuICAgIH1cbiAgICBUYWJsZS5wcm90b3R5cGUuX2ZpbmRSZWNvcmRCeUlkID0gZnVuY3Rpb24gKHJlY29yZElkLCBkb25lKSB7XG4gICAgICAgIHZhciByZWNvcmQgPSBuZXcgcmVjb3JkXzEuZGVmYXVsdCh0aGlzLCByZWNvcmRJZCk7XG4gICAgICAgIHJlY29yZC5mZXRjaChkb25lKTtcbiAgICB9O1xuICAgIFRhYmxlLnByb3RvdHlwZS5fc2VsZWN0UmVjb3JkcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcbiAgICAgICAgaWYgKHBhcmFtcyA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkFpcnRhYmxlOiBgc2VsZWN0YCB0YWtlcyBvbmx5IG9uZSBwYXJhbWV0ZXIsIGJ1dCBpdCB3YXMgZ2l2ZW4gXCIgKyBhcmd1bWVudHMubGVuZ3RoICsgXCIgcGFyYW1ldGVycy4gVXNlIGBlYWNoUGFnZWAgb3IgYGZpcnN0UGFnZWAgdG8gZmV0Y2ggcmVjb3Jkcy5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzUGxhaW5PYmplY3RfMS5kZWZhdWx0KHBhcmFtcykpIHtcbiAgICAgICAgICAgIHZhciB2YWxpZGF0aW9uUmVzdWx0cyA9IHF1ZXJ5XzEuZGVmYXVsdC52YWxpZGF0ZVBhcmFtcyhwYXJhbXMpO1xuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25SZXN1bHRzLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZm9ybWF0dGVkRXJyb3JzID0gdmFsaWRhdGlvblJlc3VsdHMuZXJyb3JzLm1hcChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiICAqIFwiICsgZXJyb3I7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQWlydGFibGU6IGludmFsaWQgcGFyYW1ldGVycyBmb3IgYHNlbGVjdGA6XFxuXCIgKyBmb3JtYXR0ZWRFcnJvcnMuam9pbignXFxuJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZhbGlkYXRpb25SZXN1bHRzLmlnbm9yZWRLZXlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihcIkFpcnRhYmxlOiB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnMgdG8gYHNlbGVjdGAgd2lsbCBiZSBpZ25vcmVkOiBcIiArIHZhbGlkYXRpb25SZXN1bHRzLmlnbm9yZWRLZXlzLmpvaW4oJywgJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG5ldyBxdWVyeV8xLmRlZmF1bHQodGhpcywgdmFsaWRhdGlvblJlc3VsdHMudmFsaWRQYXJhbXMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBaXJ0YWJsZTogdGhlIHBhcmFtZXRlciBmb3IgYHNlbGVjdGAgc2hvdWxkIGJlIGEgcGxhaW4gb2JqZWN0IG9yIHVuZGVmaW5lZC4nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgVGFibGUucHJvdG90eXBlLl91cmxFbmNvZGVkTmFtZU9ySWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlkIHx8IGVuY29kZVVSSUNvbXBvbmVudCh0aGlzLm5hbWUpO1xuICAgIH07XG4gICAgVGFibGUucHJvdG90eXBlLl9jcmVhdGVSZWNvcmRzID0gZnVuY3Rpb24gKHJlY29yZHNEYXRhLCBvcHRpb25hbFBhcmFtZXRlcnMsIGRvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIGlzQ3JlYXRpbmdNdWx0aXBsZVJlY29yZHMgPSBBcnJheS5pc0FycmF5KHJlY29yZHNEYXRhKTtcbiAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgICBkb25lID0gb3B0aW9uYWxQYXJhbWV0ZXJzO1xuICAgICAgICAgICAgb3B0aW9uYWxQYXJhbWV0ZXJzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlcXVlc3REYXRhO1xuICAgICAgICBpZiAoaXNDcmVhdGluZ011bHRpcGxlUmVjb3Jkcykge1xuICAgICAgICAgICAgcmVxdWVzdERhdGEgPSBfX2Fzc2lnbih7IHJlY29yZHM6IHJlY29yZHNEYXRhIH0sIG9wdGlvbmFsUGFyYW1ldGVycyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXF1ZXN0RGF0YSA9IF9fYXNzaWduKHsgZmllbGRzOiByZWNvcmRzRGF0YSB9LCBvcHRpb25hbFBhcmFtZXRlcnMpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2Jhc2UucnVuQWN0aW9uKCdwb3N0JywgXCIvXCIgKyB0aGlzLl91cmxFbmNvZGVkTmFtZU9ySWQoKSArIFwiL1wiLCB7fSwgcmVxdWVzdERhdGEsIGZ1bmN0aW9uIChlcnIsIHJlc3AsIGJvZHkpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkb25lKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgIGlmIChpc0NyZWF0aW5nTXVsdGlwbGVSZWNvcmRzKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gYm9keS5yZWNvcmRzLm1hcChmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgcmVjb3JkXzEuZGVmYXVsdChfdGhpcywgcmVjb3JkLmlkLCByZWNvcmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gbmV3IHJlY29yZF8xLmRlZmF1bHQoX3RoaXMsIGJvZHkuaWQsIGJvZHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9uZShudWxsLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIFRhYmxlLnByb3RvdHlwZS5fdXBkYXRlUmVjb3JkcyA9IGZ1bmN0aW9uIChpc0Rlc3RydWN0aXZlVXBkYXRlLCByZWNvcmRzRGF0YU9yUmVjb3JkSWQsIHJlY29yZERhdGFPck9wdHNPckRvbmUsIG9wdHNPckRvbmUsIGRvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgdmFyIG9wdHM7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY29yZHNEYXRhT3JSZWNvcmRJZCkpIHtcbiAgICAgICAgICAgIHZhciByZWNvcmRzRGF0YSA9IHJlY29yZHNEYXRhT3JSZWNvcmRJZDtcbiAgICAgICAgICAgIG9wdHMgPSBpc1BsYWluT2JqZWN0XzEuZGVmYXVsdChyZWNvcmREYXRhT3JPcHRzT3JEb25lKSA/IHJlY29yZERhdGFPck9wdHNPckRvbmUgOiB7fTtcbiAgICAgICAgICAgIGRvbmUgPSAob3B0c09yRG9uZSB8fCByZWNvcmREYXRhT3JPcHRzT3JEb25lKTtcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSBpc0Rlc3RydWN0aXZlVXBkYXRlID8gJ3B1dCcgOiAncGF0Y2gnO1xuICAgICAgICAgICAgdmFyIHJlcXVlc3REYXRhID0gX19hc3NpZ24oeyByZWNvcmRzOiByZWNvcmRzRGF0YSB9LCBvcHRzKTtcbiAgICAgICAgICAgIHRoaXMuX2Jhc2UucnVuQWN0aW9uKG1ldGhvZCwgXCIvXCIgKyB0aGlzLl91cmxFbmNvZGVkTmFtZU9ySWQoKSArIFwiL1wiLCB7fSwgcmVxdWVzdERhdGEsIGZ1bmN0aW9uIChlcnIsIHJlc3AsIGJvZHkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gYm9keS5yZWNvcmRzLm1hcChmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgcmVjb3JkXzEuZGVmYXVsdChfdGhpcywgcmVjb3JkLmlkLCByZWNvcmQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHJlY29yZElkID0gcmVjb3Jkc0RhdGFPclJlY29yZElkO1xuICAgICAgICAgICAgdmFyIHJlY29yZERhdGEgPSByZWNvcmREYXRhT3JPcHRzT3JEb25lO1xuICAgICAgICAgICAgb3B0cyA9IGlzUGxhaW5PYmplY3RfMS5kZWZhdWx0KG9wdHNPckRvbmUpID8gb3B0c09yRG9uZSA6IHt9O1xuICAgICAgICAgICAgZG9uZSA9IChkb25lIHx8IG9wdHNPckRvbmUpO1xuICAgICAgICAgICAgdmFyIHJlY29yZCA9IG5ldyByZWNvcmRfMS5kZWZhdWx0KHRoaXMsIHJlY29yZElkKTtcbiAgICAgICAgICAgIGlmIChpc0Rlc3RydWN0aXZlVXBkYXRlKSB7XG4gICAgICAgICAgICAgICAgcmVjb3JkLnB1dFVwZGF0ZShyZWNvcmREYXRhLCBvcHRzLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlY29yZC5wYXRjaFVwZGF0ZShyZWNvcmREYXRhLCBvcHRzLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgVGFibGUucHJvdG90eXBlLl9kZXN0cm95UmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZElkc09ySWQsIGRvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVjb3JkSWRzT3JJZCkpIHtcbiAgICAgICAgICAgIHZhciBxdWVyeVBhcmFtcyA9IHsgcmVjb3JkczogcmVjb3JkSWRzT3JJZCB9O1xuICAgICAgICAgICAgdGhpcy5fYmFzZS5ydW5BY3Rpb24oJ2RlbGV0ZScsIFwiL1wiICsgdGhpcy5fdXJsRW5jb2RlZE5hbWVPcklkKCksIHF1ZXJ5UGFyYW1zLCBudWxsLCBmdW5jdGlvbiAoZXJyLCByZXNwb25zZSwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgZG9uZShlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciByZWNvcmRzID0gcmVzdWx0cy5yZWNvcmRzLm1hcChmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gX2EuaWQ7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgcmVjb3JkXzEuZGVmYXVsdChfdGhpcywgaWQsIG51bGwpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGRvbmUobnVsbCwgcmVjb3Jkcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBuZXcgcmVjb3JkXzEuZGVmYXVsdCh0aGlzLCByZWNvcmRJZHNPcklkKTtcbiAgICAgICAgICAgIHJlY29yZC5kZXN0cm95KGRvbmUpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBUYWJsZS5wcm90b3R5cGUuX2xpc3RSZWNvcmRzID0gZnVuY3Rpb24gKHBhZ2VTaXplLCBvZmZzZXQsIG9wdHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgaWYgKCFkb25lKSB7XG4gICAgICAgICAgICBkb25lID0gb3B0cztcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcGF0aEFuZFBhcmFtc0FzU3RyaW5nID0gXCIvXCIgKyB0aGlzLl91cmxFbmNvZGVkTmFtZU9ySWQoKSArIFwiP1wiICsgb2JqZWN0X3RvX3F1ZXJ5X3BhcmFtX3N0cmluZ18xLmRlZmF1bHQob3B0cyk7XG4gICAgICAgIHZhciBwYXRoO1xuICAgICAgICB2YXIgbGlzdFJlY29yZHNQYXJhbWV0ZXJzID0ge307XG4gICAgICAgIHZhciBsaXN0UmVjb3Jkc0RhdGEgPSBudWxsO1xuICAgICAgICB2YXIgbWV0aG9kO1xuICAgICAgICBpZiAoKHR5cGVvZiBvcHRzICE9PSAnZnVuY3Rpb24nICYmIG9wdHMubWV0aG9kID09PSAncG9zdCcpIHx8XG4gICAgICAgICAgICBwYXRoQW5kUGFyYW1zQXNTdHJpbmcubGVuZ3RoID4gcXVlcnlfcGFyYW1zXzEuVVJMX0NIQVJBQ1RFUl9MRU5HVEhfTElNSVQpIHtcbiAgICAgICAgICAgIC8vIC8vIFRoZXJlIGlzIGEgMTZrYiBsaW1pdCBvbiBHRVQgcmVxdWVzdHMuIFNpbmNlIHRoZSBVUkwgbWFrZXMgdXAgbmVhcmx5IGFsbCBvZiB0aGUgcmVxdWVzdCBzaXplLCB3ZSBjaGVjayBmb3IgYW55IHJlcXVlc3RzIHRoYXRcbiAgICAgICAgICAgIC8vIHRoYXQgY29tZSBjbG9zZSB0byB0aGlzIGxpbWl0IGFuZCBzZW5kIGl0IGFzIGEgUE9TVCBpbnN0ZWFkLiBBZGRpdGlvbmFsbHksIHdlJ2xsIHNlbmQgdGhlIHJlcXVlc3QgYXMgYSBwb3N0IGlmIGl0IGlzIHNwZWNpZmllZFxuICAgICAgICAgICAgLy8gd2l0aCB0aGUgcmVxdWVzdCBwYXJhbXNcbiAgICAgICAgICAgIHBhdGggPSBcIi9cIiArIHRoaXMuX3VybEVuY29kZWROYW1lT3JJZCgpICsgXCIvbGlzdFJlY29yZHNcIjtcbiAgICAgICAgICAgIGxpc3RSZWNvcmRzRGF0YSA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCAocGFnZVNpemUgJiYgeyBwYWdlU2l6ZTogcGFnZVNpemUgfSkpLCAob2Zmc2V0ICYmIHsgb2Zmc2V0OiBvZmZzZXQgfSkpO1xuICAgICAgICAgICAgbWV0aG9kID0gJ3Bvc3QnO1xuICAgICAgICAgICAgdmFyIHBhcmFtTmFtZXMgPSBPYmplY3Qua2V5cyhvcHRzKTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgcGFyYW1OYW1lc18xID0gcGFyYW1OYW1lczsgX2kgPCBwYXJhbU5hbWVzXzEubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmFtTmFtZSA9IHBhcmFtTmFtZXNfMVtfaV07XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXJ5X3BhcmFtc18xLnNob3VsZExpc3RSZWNvcmRzUGFyYW1CZVBhc3NlZEFzUGFyYW1ldGVyKHBhcmFtTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdFJlY29yZHNQYXJhbWV0ZXJzW3BhcmFtTmFtZV0gPSBvcHRzW3BhcmFtTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBsaXN0UmVjb3Jkc0RhdGFbcGFyYW1OYW1lXSA9IG9wdHNbcGFyYW1OYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBtZXRob2QgPSAnZ2V0JztcbiAgICAgICAgICAgIHBhdGggPSBcIi9cIiArIHRoaXMuX3VybEVuY29kZWROYW1lT3JJZCgpICsgXCIvXCI7XG4gICAgICAgICAgICBsaXN0UmVjb3Jkc1BhcmFtZXRlcnMgPSBfX2Fzc2lnbih7IGxpbWl0OiBwYWdlU2l6ZSwgb2Zmc2V0OiBvZmZzZXQgfSwgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fYmFzZS5ydW5BY3Rpb24obWV0aG9kLCBwYXRoLCBsaXN0UmVjb3Jkc1BhcmFtZXRlcnMsIGxpc3RSZWNvcmRzRGF0YSwgZnVuY3Rpb24gKGVyciwgcmVzcG9uc2UsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBkb25lKGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJlY29yZHMgPSByZXN1bHRzLnJlY29yZHMubWFwKGZ1bmN0aW9uIChyZWNvcmRKc29uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyByZWNvcmRfMS5kZWZhdWx0KF90aGlzLCBudWxsLCByZWNvcmRKc29uKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZG9uZShudWxsLCByZWNvcmRzLCByZXN1bHRzLm9mZnNldCk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgVGFibGUucHJvdG90eXBlLl9mb3JFYWNoUmVjb3JkID0gZnVuY3Rpb24gKG9wdHMsIGNhbGxiYWNrLCBkb25lKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgICBkb25lID0gY2FsbGJhY2s7XG4gICAgICAgICAgICBjYWxsYmFjayA9IG9wdHM7XG4gICAgICAgICAgICBvcHRzID0ge307XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGxpbWl0ID0gVGFibGUuX19yZWNvcmRzUGVyUGFnZUZvckl0ZXJhdGlvbiB8fCAxMDA7XG4gICAgICAgIHZhciBvZmZzZXQgPSBudWxsO1xuICAgICAgICB2YXIgbmV4dFBhZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfdGhpcy5fbGlzdFJlY29yZHMobGltaXQsIG9mZnNldCwgb3B0cywgZnVuY3Rpb24gKGVyciwgcGFnZSwgbmV3T2Zmc2V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBkb25lKGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHBhZ2UubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHBhZ2VbaW5kZXhdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5ld09mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSBuZXdPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgIG5leHRQYWdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIG5leHRQYWdlKCk7XG4gICAgfTtcbiAgICByZXR1cm4gVGFibGU7XG59KCkpO1xubW9kdWxlLmV4cG9ydHMgPSBUYWJsZTtcblxufSx7XCIuL2NhbGxiYWNrX3RvX3Byb21pc2VcIjo0LFwiLi9kZXByZWNhdGVcIjo1LFwiLi9vYmplY3RfdG9fcXVlcnlfcGFyYW1fc3RyaW5nXCI6MTEsXCIuL3F1ZXJ5XCI6MTMsXCIuL3F1ZXJ5X3BhcmFtc1wiOjE0LFwiLi9yZWNvcmRcIjoxNSxcImxvZGFzaC9pc1BsYWluT2JqZWN0XCI6ODl9XSwxODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cInVzZSBzdHJpY3RcIjtcbi8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueSAqL1xuZnVuY3Rpb24gY2hlY2soZm4sIGVycm9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAoZm4odmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzOiB0cnVlIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4geyBwYXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yIH07XG4gICAgICAgIH1cbiAgICB9O1xufVxuY2hlY2suaXNPbmVPZiA9IGZ1bmN0aW9uIGlzT25lT2Yob3B0aW9ucykge1xuICAgIHJldHVybiBvcHRpb25zLmluY2x1ZGVzLmJpbmQob3B0aW9ucyk7XG59O1xuY2hlY2suaXNBcnJheU9mID0gZnVuY3Rpb24gKGl0ZW1WYWxpZGF0b3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5ldmVyeShpdGVtVmFsaWRhdG9yKTtcbiAgICB9O1xufTtcbm1vZHVsZS5leHBvcnRzID0gY2hlY2s7XG5cbn0se31dLDE5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gX2RlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIF9jcmVhdGVDbGFzcyhDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgaWYgKHByb3RvUHJvcHMpIF9kZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gIGlmIChzdGF0aWNQcm9wcykgX2RlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgcmV0dXJuIENvbnN0cnVjdG9yO1xufVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvblwiKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpO1xufVxuXG5mdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICBfZ2V0UHJvdG90eXBlT2YgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3QuZ2V0UHJvdG90eXBlT2YgOiBmdW5jdGlvbiBfZ2V0UHJvdG90eXBlT2Yobykge1xuICAgIHJldHVybiBvLl9fcHJvdG9fXyB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobyk7XG4gIH07XG4gIHJldHVybiBfZ2V0UHJvdG90eXBlT2Yobyk7XG59XG5cbmZ1bmN0aW9uIF9zZXRQcm90b3R5cGVPZihvLCBwKSB7XG4gIF9zZXRQcm90b3R5cGVPZiA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbiBfc2V0UHJvdG90eXBlT2YobywgcCkge1xuICAgIG8uX19wcm90b19fID0gcDtcbiAgICByZXR1cm4gbztcbiAgfTtcblxuICByZXR1cm4gX3NldFByb3RvdHlwZU9mKG8sIHApO1xufVxuXG5mdW5jdGlvbiBfYXNzZXJ0VGhpc0luaXRpYWxpemVkKHNlbGYpIHtcbiAgaWYgKHNlbGYgPT09IHZvaWQgMCkge1xuICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcInRoaXMgaGFzbid0IGJlZW4gaW5pdGlhbGlzZWQgLSBzdXBlcigpIGhhc24ndCBiZWVuIGNhbGxlZFwiKTtcbiAgfVxuXG4gIHJldHVybiBzZWxmO1xufVxuXG5mdW5jdGlvbiBfcG9zc2libGVDb25zdHJ1Y3RvclJldHVybihzZWxmLCBjYWxsKSB7XG4gIGlmIChjYWxsICYmICh0eXBlb2YgY2FsbCA9PT0gXCJvYmplY3RcIiB8fCB0eXBlb2YgY2FsbCA9PT0gXCJmdW5jdGlvblwiKSkge1xuICAgIHJldHVybiBjYWxsO1xuICB9XG5cbiAgcmV0dXJuIF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoc2VsZik7XG59XG5cbmZ1bmN0aW9uIF9zdXBlclByb3BCYXNlKG9iamVjdCwgcHJvcGVydHkpIHtcbiAgd2hpbGUgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSkpIHtcbiAgICBvYmplY3QgPSBfZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcbiAgICBpZiAob2JqZWN0ID09PSBudWxsKSBicmVhaztcbiAgfVxuXG4gIHJldHVybiBvYmplY3Q7XG59XG5cbmZ1bmN0aW9uIF9nZXQodGFyZ2V0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKHR5cGVvZiBSZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiICYmIFJlZmxlY3QuZ2V0KSB7XG4gICAgX2dldCA9IFJlZmxlY3QuZ2V0O1xuICB9IGVsc2Uge1xuICAgIF9nZXQgPSBmdW5jdGlvbiBfZ2V0KHRhcmdldCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gICAgICB2YXIgYmFzZSA9IF9zdXBlclByb3BCYXNlKHRhcmdldCwgcHJvcGVydHkpO1xuXG4gICAgICBpZiAoIWJhc2UpIHJldHVybjtcbiAgICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihiYXNlLCBwcm9wZXJ0eSk7XG5cbiAgICAgIGlmIChkZXNjLmdldCkge1xuICAgICAgICByZXR1cm4gZGVzYy5nZXQuY2FsbChyZWNlaXZlcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX2dldCh0YXJnZXQsIHByb3BlcnR5LCByZWNlaXZlciB8fCB0YXJnZXQpO1xufVxuXG52YXIgRW1pdHRlciA9XG4vKiNfX1BVUkVfXyovXG5mdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIEVtaXR0ZXIoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEVtaXR0ZXIpO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsaXN0ZW5lcnMnLCB7XG4gICAgICB2YWx1ZToge30sXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEVtaXR0ZXIsIFt7XG4gICAga2V5OiBcImFkZEV2ZW50TGlzdGVuZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLmxpc3RlbmVycykpIHtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcInJlbW92ZUV2ZW50TGlzdGVuZXJcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKCEodHlwZSBpbiB0aGlzLmxpc3RlbmVycykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhY2sgPSB0aGlzLmxpc3RlbmVyc1t0eXBlXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzdGFjay5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgaWYgKHN0YWNrW2ldID09PSBjYWxsYmFjaykge1xuICAgICAgICAgIHN0YWNrLnNwbGljZShpLCAxKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0sIHtcbiAgICBrZXk6IFwiZGlzcGF0Y2hFdmVudFwiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KSB7XG4gICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgICBpZiAoIShldmVudC50eXBlIGluIHRoaXMubGlzdGVuZXJzKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBkZWJvdW5jZSA9IGZ1bmN0aW9uIGRlYm91bmNlKGNhbGxiYWNrKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBjYWxsYmFjay5jYWxsKF90aGlzLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN0YWNrID0gdGhpcy5saXN0ZW5lcnNbZXZlbnQudHlwZV07XG5cbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3RhY2subGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGRlYm91bmNlKHN0YWNrW2ldKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICFldmVudC5kZWZhdWx0UHJldmVudGVkO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFbWl0dGVyO1xufSgpO1xuXG52YXIgQWJvcnRTaWduYWwgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKF9FbWl0dGVyKSB7XG4gIF9pbmhlcml0cyhBYm9ydFNpZ25hbCwgX0VtaXR0ZXIpO1xuXG4gIGZ1bmN0aW9uIEFib3J0U2lnbmFsKCkge1xuICAgIHZhciBfdGhpczI7XG5cbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgQWJvcnRTaWduYWwpO1xuXG4gICAgX3RoaXMyID0gX3Bvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4odGhpcywgX2dldFByb3RvdHlwZU9mKEFib3J0U2lnbmFsKS5jYWxsKHRoaXMpKTsgLy8gU29tZSB2ZXJzaW9ucyBvZiBiYWJlbCBkb2VzIG5vdCB0cmFuc3BpbGUgc3VwZXIoKSBjb3JyZWN0bHkgZm9yIElFIDw9IDEwLCBpZiB0aGUgcGFyZW50XG4gICAgLy8gY29uc3RydWN0b3IgaGFzIGZhaWxlZCB0byBydW4sIHRoZW4gXCJ0aGlzLmxpc3RlbmVyc1wiIHdpbGwgc3RpbGwgYmUgdW5kZWZpbmVkIGFuZCB0aGVuIHdlIGNhbGxcbiAgICAvLyB0aGUgcGFyZW50IGNvbnN0cnVjdG9yIGRpcmVjdGx5IGluc3RlYWQgYXMgYSB3b3JrYXJvdW5kLiBGb3IgZ2VuZXJhbCBkZXRhaWxzLCBzZWUgYmFiZWwgYnVnOlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iYWJlbC9iYWJlbC9pc3N1ZXMvMzA0MVxuICAgIC8vIFRoaXMgaGFjayB3YXMgYWRkZWQgYXMgYSBmaXggZm9yIHRoZSBpc3N1ZSBkZXNjcmliZWQgaGVyZTpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vRmluYW5jaWFsLVRpbWVzL3BvbHlmaWxsLWxpYnJhcnkvcHVsbC81OSNpc3N1ZWNvbW1lbnQtNDc3NTU4MDQyXG5cbiAgICBpZiAoIV90aGlzMi5saXN0ZW5lcnMpIHtcbiAgICAgIEVtaXR0ZXIuY2FsbChfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMikpO1xuICAgIH0gLy8gQ29tcGFyZWQgdG8gYXNzaWdubWVudCwgT2JqZWN0LmRlZmluZVByb3BlcnR5IG1ha2VzIHByb3BlcnRpZXMgbm9uLWVudW1lcmFibGUgYnkgZGVmYXVsdCBhbmRcbiAgICAvLyB3ZSB3YW50IE9iamVjdC5rZXlzKG5ldyBBYm9ydENvbnRyb2xsZXIoKS5zaWduYWwpIHRvIGJlIFtdIGZvciBjb21wYXQgd2l0aCB0aGUgbmF0aXZlIGltcGxcblxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KF9hc3NlcnRUaGlzSW5pdGlhbGl6ZWQoX3RoaXMyKSwgJ2Fib3J0ZWQnLCB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShfYXNzZXJ0VGhpc0luaXRpYWxpemVkKF90aGlzMiksICdvbmFib3J0Jywge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIHJldHVybiBfdGhpczI7XG4gIH1cblxuICBfY3JlYXRlQ2xhc3MoQWJvcnRTaWduYWwsIFt7XG4gICAga2V5OiBcInRvU3RyaW5nXCIsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgcmV0dXJuICdbb2JqZWN0IEFib3J0U2lnbmFsXSc7XG4gICAgfVxuICB9LCB7XG4gICAga2V5OiBcImRpc3BhdGNoRXZlbnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gZGlzcGF0Y2hFdmVudChldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdhYm9ydCcpIHtcbiAgICAgICAgdGhpcy5hYm9ydGVkID0gdHJ1ZTtcblxuICAgICAgICBpZiAodHlwZW9mIHRoaXMub25hYm9ydCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMub25hYm9ydC5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfZ2V0KF9nZXRQcm90b3R5cGVPZihBYm9ydFNpZ25hbC5wcm90b3R5cGUpLCBcImRpc3BhdGNoRXZlbnRcIiwgdGhpcykuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEFib3J0U2lnbmFsO1xufShFbWl0dGVyKTtcbnZhciBBYm9ydENvbnRyb2xsZXIgPVxuLyojX19QVVJFX18qL1xuZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBBYm9ydENvbnRyb2xsZXIoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEFib3J0Q29udHJvbGxlcik7XG5cbiAgICAvLyBDb21wYXJlZCB0byBhc3NpZ25tZW50LCBPYmplY3QuZGVmaW5lUHJvcGVydHkgbWFrZXMgcHJvcGVydGllcyBub24tZW51bWVyYWJsZSBieSBkZWZhdWx0IGFuZFxuICAgIC8vIHdlIHdhbnQgT2JqZWN0LmtleXMobmV3IEFib3J0Q29udHJvbGxlcigpKSB0byBiZSBbXSBmb3IgY29tcGF0IHdpdGggdGhlIG5hdGl2ZSBpbXBsXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdzaWduYWwnLCB7XG4gICAgICB2YWx1ZTogbmV3IEFib3J0U2lnbmFsKCksXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgX2NyZWF0ZUNsYXNzKEFib3J0Q29udHJvbGxlciwgW3tcbiAgICBrZXk6IFwiYWJvcnRcIixcbiAgICB2YWx1ZTogZnVuY3Rpb24gYWJvcnQoKSB7XG4gICAgICB2YXIgZXZlbnQ7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGV2ZW50ID0gbmV3IEV2ZW50KCdhYm9ydCcpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGlmICghZG9jdW1lbnQuY3JlYXRlRXZlbnQpIHtcbiAgICAgICAgICAgIC8vIEZvciBJbnRlcm5ldCBFeHBsb3JlciA4OlxuICAgICAgICAgICAgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudE9iamVjdCgpO1xuICAgICAgICAgICAgZXZlbnQudHlwZSA9ICdhYm9ydCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEZvciBJbnRlcm5ldCBFeHBsb3JlciAxMTpcbiAgICAgICAgICAgIGV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgICAgICAgICBldmVudC5pbml0RXZlbnQoJ2Fib3J0JywgZmFsc2UsIGZhbHNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gRmFsbGJhY2sgd2hlcmUgZG9jdW1lbnQgaXNuJ3QgYXZhaWxhYmxlOlxuICAgICAgICAgIGV2ZW50ID0ge1xuICAgICAgICAgICAgdHlwZTogJ2Fib3J0JyxcbiAgICAgICAgICAgIGJ1YmJsZXM6IGZhbHNlLFxuICAgICAgICAgICAgY2FuY2VsYWJsZTogZmFsc2VcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc2lnbmFsLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgfSwge1xuICAgIGtleTogXCJ0b1N0cmluZ1wiLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgICAgIHJldHVybiAnW29iamVjdCBBYm9ydENvbnRyb2xsZXJdJztcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gQWJvcnRDb250cm9sbGVyO1xufSgpO1xuXG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gIC8vIFRoZXNlIGFyZSBuZWNlc3NhcnkgdG8gbWFrZSBzdXJlIHRoYXQgd2UgZ2V0IGNvcnJlY3Qgb3V0cHV0IGZvcjpcbiAgLy8gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG5ldyBBYm9ydENvbnRyb2xsZXIoKSlcbiAgQWJvcnRDb250cm9sbGVyLnByb3RvdHlwZVtTeW1ib2wudG9TdHJpbmdUYWddID0gJ0Fib3J0Q29udHJvbGxlcic7XG4gIEFib3J0U2lnbmFsLnByb3RvdHlwZVtTeW1ib2wudG9TdHJpbmdUYWddID0gJ0Fib3J0U2lnbmFsJztcbn1cblxuZnVuY3Rpb24gcG9seWZpbGxOZWVkZWQoc2VsZikge1xuICBpZiAoc2VsZi5fX0ZPUkNFX0lOU1RBTExfQUJPUlRDT05UUk9MTEVSX1BPTFlGSUxMKSB7XG4gICAgY29uc29sZS5sb2coJ19fRk9SQ0VfSU5TVEFMTF9BQk9SVENPTlRST0xMRVJfUE9MWUZJTEw9dHJ1ZSBpcyBzZXQsIHdpbGwgZm9yY2UgaW5zdGFsbCBwb2x5ZmlsbCcpO1xuICAgIHJldHVybiB0cnVlO1xuICB9IC8vIE5vdGUgdGhhdCB0aGUgXCJ1bmZldGNoXCIgbWluaW1hbCBmZXRjaCBwb2x5ZmlsbCBkZWZpbmVzIGZldGNoKCkgd2l0aG91dFxuICAvLyBkZWZpbmluZyB3aW5kb3cuUmVxdWVzdCwgYW5kIHRoaXMgcG9seWZpbGwgbmVlZCB0byB3b3JrIG9uIHRvcCBvZiB1bmZldGNoXG4gIC8vIHNvIHRoZSBiZWxvdyBmZWF0dXJlIGRldGVjdGlvbiBuZWVkcyB0aGUgIXNlbGYuQWJvcnRDb250cm9sbGVyIHBhcnQuXG4gIC8vIFRoZSBSZXF1ZXN0LnByb3RvdHlwZSBjaGVjayBpcyBhbHNvIG5lZWRlZCBiZWNhdXNlIFNhZmFyaSB2ZXJzaW9ucyAxMS4xLjJcbiAgLy8gdXAgdG8gYW5kIGluY2x1ZGluZyAxMi4xLnggaGFzIGEgd2luZG93LkFib3J0Q29udHJvbGxlciBwcmVzZW50IGJ1dCBzdGlsbFxuICAvLyBkb2VzIE5PVCBjb3JyZWN0bHkgaW1wbGVtZW50IGFib3J0YWJsZSBmZXRjaDpcbiAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTE3NDk4MCNjMlxuXG5cbiAgcmV0dXJuIHR5cGVvZiBzZWxmLlJlcXVlc3QgPT09ICdmdW5jdGlvbicgJiYgIXNlbGYuUmVxdWVzdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ3NpZ25hbCcpIHx8ICFzZWxmLkFib3J0Q29udHJvbGxlcjtcbn1cblxuLyoqXG4gKiBOb3RlOiB0aGUgXCJmZXRjaC5SZXF1ZXN0XCIgZGVmYXVsdCB2YWx1ZSBpcyBhdmFpbGFibGUgZm9yIGZldGNoIGltcG9ydGVkIGZyb21cbiAqIHRoZSBcIm5vZGUtZmV0Y2hcIiBwYWNrYWdlIGFuZCBub3QgaW4gYnJvd3NlcnMuIFRoaXMgaXMgT0sgc2luY2UgYnJvd3NlcnNcbiAqIHdpbGwgYmUgaW1wb3J0aW5nIHVtZC1wb2x5ZmlsbC5qcyBmcm9tIHRoYXQgcGF0aCBcInNlbGZcIiBpcyBwYXNzZWQgdGhlXG4gKiBkZWNvcmF0b3Igc28gdGhlIGRlZmF1bHQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZCAoYmVjYXVzZSBicm93c2VycyB0aGF0IGRlZmluZVxuICogZmV0Y2ggYWxzbyBoYXMgUmVxdWVzdCkuIE9uZSBxdWlya3kgc2V0dXAgd2hlcmUgc2VsZi5mZXRjaCBleGlzdHMgYnV0XG4gKiBzZWxmLlJlcXVlc3QgZG9lcyBub3QgaXMgd2hlbiB0aGUgXCJ1bmZldGNoXCIgbWluaW1hbCBmZXRjaCBwb2x5ZmlsbCBpcyB1c2VkXG4gKiBvbiB0b3Agb2YgSUUxMTsgZm9yIHRoaXMgY2FzZSB0aGUgYnJvd3NlciB3aWxsIHRyeSB0byB1c2UgdGhlIGZldGNoLlJlcXVlc3RcbiAqIGRlZmF1bHQgdmFsdWUgd2hpY2ggaW4gdHVybiB3aWxsIGJlIHVuZGVmaW5lZCBidXQgdGhlbiB0aGVuIFwiaWYgKFJlcXVlc3QpXCJcbiAqIHdpbGwgZW5zdXJlIHRoYXQgeW91IGdldCBhIHBhdGNoZWQgZmV0Y2ggYnV0IHN0aWxsIG5vIFJlcXVlc3QgKGFzIGV4cGVjdGVkKS5cbiAqIEBwYXJhbSB7ZmV0Y2gsIFJlcXVlc3QgPSBmZXRjaC5SZXF1ZXN0fVxuICogQHJldHVybnMge2ZldGNoOiBhYm9ydGFibGVGZXRjaCwgUmVxdWVzdDogQWJvcnRhYmxlUmVxdWVzdH1cbiAqL1xuXG5mdW5jdGlvbiBhYm9ydGFibGVGZXRjaERlY29yYXRvcihwYXRjaFRhcmdldHMpIHtcbiAgaWYgKCdmdW5jdGlvbicgPT09IHR5cGVvZiBwYXRjaFRhcmdldHMpIHtcbiAgICBwYXRjaFRhcmdldHMgPSB7XG4gICAgICBmZXRjaDogcGF0Y2hUYXJnZXRzXG4gICAgfTtcbiAgfVxuXG4gIHZhciBfcGF0Y2hUYXJnZXRzID0gcGF0Y2hUYXJnZXRzLFxuICAgICAgZmV0Y2ggPSBfcGF0Y2hUYXJnZXRzLmZldGNoLFxuICAgICAgX3BhdGNoVGFyZ2V0cyRSZXF1ZXN0ID0gX3BhdGNoVGFyZ2V0cy5SZXF1ZXN0LFxuICAgICAgTmF0aXZlUmVxdWVzdCA9IF9wYXRjaFRhcmdldHMkUmVxdWVzdCA9PT0gdm9pZCAwID8gZmV0Y2guUmVxdWVzdCA6IF9wYXRjaFRhcmdldHMkUmVxdWVzdCxcbiAgICAgIE5hdGl2ZUFib3J0Q29udHJvbGxlciA9IF9wYXRjaFRhcmdldHMuQWJvcnRDb250cm9sbGVyLFxuICAgICAgX3BhdGNoVGFyZ2V0cyRfX0ZPUkNFID0gX3BhdGNoVGFyZ2V0cy5fX0ZPUkNFX0lOU1RBTExfQUJPUlRDT05UUk9MTEVSX1BPTFlGSUxMLFxuICAgICAgX19GT1JDRV9JTlNUQUxMX0FCT1JUQ09OVFJPTExFUl9QT0xZRklMTCA9IF9wYXRjaFRhcmdldHMkX19GT1JDRSA9PT0gdm9pZCAwID8gZmFsc2UgOiBfcGF0Y2hUYXJnZXRzJF9fRk9SQ0U7XG5cbiAgaWYgKCFwb2x5ZmlsbE5lZWRlZCh7XG4gICAgZmV0Y2g6IGZldGNoLFxuICAgIFJlcXVlc3Q6IE5hdGl2ZVJlcXVlc3QsXG4gICAgQWJvcnRDb250cm9sbGVyOiBOYXRpdmVBYm9ydENvbnRyb2xsZXIsXG4gICAgX19GT1JDRV9JTlNUQUxMX0FCT1JUQ09OVFJPTExFUl9QT0xZRklMTDogX19GT1JDRV9JTlNUQUxMX0FCT1JUQ09OVFJPTExFUl9QT0xZRklMTFxuICB9KSkge1xuICAgIHJldHVybiB7XG4gICAgICBmZXRjaDogZmV0Y2gsXG4gICAgICBSZXF1ZXN0OiBSZXF1ZXN0XG4gICAgfTtcbiAgfVxuXG4gIHZhciBSZXF1ZXN0ID0gTmF0aXZlUmVxdWVzdDsgLy8gTm90ZSB0aGF0IHRoZSBcInVuZmV0Y2hcIiBtaW5pbWFsIGZldGNoIHBvbHlmaWxsIGRlZmluZXMgZmV0Y2goKSB3aXRob3V0XG4gIC8vIGRlZmluaW5nIHdpbmRvdy5SZXF1ZXN0LCBhbmQgdGhpcyBwb2x5ZmlsbCBuZWVkIHRvIHdvcmsgb24gdG9wIG9mIHVuZmV0Y2hcbiAgLy8gaGVuY2Ugd2Ugb25seSBwYXRjaCBpdCBpZiBpdCdzIGF2YWlsYWJsZS4gQWxzbyB3ZSBkb24ndCBwYXRjaCBpdCBpZiBzaWduYWxcbiAgLy8gaXMgYWxyZWFkeSBhdmFpbGFibGUgb24gdGhlIFJlcXVlc3QgcHJvdG90eXBlIGJlY2F1c2UgaW4gdGhpcyBjYXNlIHN1cHBvcnRcbiAgLy8gaXMgcHJlc2VudCBhbmQgdGhlIHBhdGNoaW5nIGJlbG93IGNhbiBjYXVzZSBhIGNyYXNoIHNpbmNlIGl0IGFzc2lnbnMgdG9cbiAgLy8gcmVxdWVzdC5zaWduYWwgd2hpY2ggaXMgdGVjaG5pY2FsbHkgYSByZWFkLW9ubHkgcHJvcGVydHkuIFRoaXMgbGF0dGVyIGVycm9yXG4gIC8vIGhhcHBlbnMgd2hlbiB5b3UgcnVuIHRoZSBtYWluNS5qcyBub2RlLWZldGNoIGV4YW1wbGUgaW4gdGhlIHJlcG9cbiAgLy8gXCJhYm9ydGNvbnRyb2xsZXItcG9seWZpbGwtZXhhbXBsZXNcIi4gVGhlIGV4YWN0IGVycm9yIGlzOlxuICAvLyAgIHJlcXVlc3Quc2lnbmFsID0gaW5pdC5zaWduYWw7XG4gIC8vICAgXlxuICAvLyBUeXBlRXJyb3I6IENhbm5vdCBzZXQgcHJvcGVydHkgc2lnbmFsIG9mICM8UmVxdWVzdD4gd2hpY2ggaGFzIG9ubHkgYSBnZXR0ZXJcblxuICBpZiAoUmVxdWVzdCAmJiAhUmVxdWVzdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkoJ3NpZ25hbCcpIHx8IF9fRk9SQ0VfSU5TVEFMTF9BQk9SVENPTlRST0xMRVJfUE9MWUZJTEwpIHtcbiAgICBSZXF1ZXN0ID0gZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgaW5pdCkge1xuICAgICAgdmFyIHNpZ25hbDtcblxuICAgICAgaWYgKGluaXQgJiYgaW5pdC5zaWduYWwpIHtcbiAgICAgICAgc2lnbmFsID0gaW5pdC5zaWduYWw7IC8vIE5ldmVyIHBhc3MgaW5pdC5zaWduYWwgdG8gdGhlIG5hdGl2ZSBSZXF1ZXN0IGltcGxlbWVudGF0aW9uIHdoZW4gdGhlIHBvbHlmaWxsIGhhc1xuICAgICAgICAvLyBiZWVuIGluc3RhbGxlZCBiZWNhdXNlIGlmIHdlJ3JlIHJ1bm5pbmcgb24gdG9wIG9mIGEgYnJvd3NlciB3aXRoIGFcbiAgICAgICAgLy8gd29ya2luZyBuYXRpdmUgQWJvcnRDb250cm9sbGVyIChpLmUuIHRoZSBwb2x5ZmlsbCB3YXMgaW5zdGFsbGVkIGR1ZSB0b1xuICAgICAgICAvLyBfX0ZPUkNFX0lOU1RBTExfQUJPUlRDT05UUk9MTEVSX1BPTFlGSUxMIGJlaW5nIHNldCksIHRoZW4gcGFzc2luZyBvdXJcbiAgICAgICAgLy8gZmFrZSBBYm9ydFNpZ25hbCB0byB0aGUgbmF0aXZlIGZldGNoIHdpbGwgdHJpZ2dlcjpcbiAgICAgICAgLy8gVHlwZUVycm9yOiBGYWlsZWQgdG8gY29uc3RydWN0ICdSZXF1ZXN0JzogbWVtYmVyIHNpZ25hbCBpcyBub3Qgb2YgdHlwZSBBYm9ydFNpZ25hbC5cblxuICAgICAgICBkZWxldGUgaW5pdC5zaWduYWw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZXF1ZXN0ID0gbmV3IE5hdGl2ZVJlcXVlc3QoaW5wdXQsIGluaXQpO1xuXG4gICAgICBpZiAoc2lnbmFsKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1ZXN0LCAnc2lnbmFsJywge1xuICAgICAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgdmFsdWU6IHNpZ25hbFxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfTtcblxuICAgIFJlcXVlc3QucHJvdG90eXBlID0gTmF0aXZlUmVxdWVzdC5wcm90b3R5cGU7XG4gIH1cblxuICB2YXIgcmVhbEZldGNoID0gZmV0Y2g7XG5cbiAgdmFyIGFib3J0YWJsZUZldGNoID0gZnVuY3Rpb24gYWJvcnRhYmxlRmV0Y2goaW5wdXQsIGluaXQpIHtcbiAgICB2YXIgc2lnbmFsID0gUmVxdWVzdCAmJiBSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSA/IGlucHV0LnNpZ25hbCA6IGluaXQgPyBpbml0LnNpZ25hbCA6IHVuZGVmaW5lZDtcblxuICAgIGlmIChzaWduYWwpIHtcbiAgICAgIHZhciBhYm9ydEVycm9yO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhYm9ydEVycm9yID0gbmV3IERPTUV4Y2VwdGlvbignQWJvcnRlZCcsICdBYm9ydEVycm9yJyk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgLy8gSUUgMTEgZG9lcyBub3Qgc3VwcG9ydCBjYWxsaW5nIHRoZSBET01FeGNlcHRpb24gY29uc3RydWN0b3IsIHVzZSBhXG4gICAgICAgIC8vIHJlZ3VsYXIgZXJyb3Igb2JqZWN0IG9uIGl0IGluc3RlYWQuXG4gICAgICAgIGFib3J0RXJyb3IgPSBuZXcgRXJyb3IoJ0Fib3J0ZWQnKTtcbiAgICAgICAgYWJvcnRFcnJvci5uYW1lID0gJ0Fib3J0RXJyb3InO1xuICAgICAgfSAvLyBSZXR1cm4gZWFybHkgaWYgYWxyZWFkeSBhYm9ydGVkLCB0aHVzIGF2b2lkaW5nIG1ha2luZyBhbiBIVFRQIHJlcXVlc3RcblxuXG4gICAgICBpZiAoc2lnbmFsLmFib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGFib3J0RXJyb3IpO1xuICAgICAgfSAvLyBUdXJuIGFuIGV2ZW50IGludG8gYSBwcm9taXNlLCByZWplY3QgaXQgb25jZSBgYWJvcnRgIGlzIGRpc3BhdGNoZWRcblxuXG4gICAgICB2YXIgY2FuY2VsbGF0aW9uID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKF8sIHJlamVjdCkge1xuICAgICAgICBzaWduYWwuYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChhYm9ydEVycm9yKTtcbiAgICAgICAgfSwge1xuICAgICAgICAgIG9uY2U6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgaWYgKGluaXQgJiYgaW5pdC5zaWduYWwpIHtcbiAgICAgICAgLy8gTmV2ZXIgcGFzcyAuc2lnbmFsIHRvIHRoZSBuYXRpdmUgaW1wbGVtZW50YXRpb24gd2hlbiB0aGUgcG9seWZpbGwgaGFzXG4gICAgICAgIC8vIGJlZW4gaW5zdGFsbGVkIGJlY2F1c2UgaWYgd2UncmUgcnVubmluZyBvbiB0b3Agb2YgYSBicm93c2VyIHdpdGggYVxuICAgICAgICAvLyB3b3JraW5nIG5hdGl2ZSBBYm9ydENvbnRyb2xsZXIgKGkuZS4gdGhlIHBvbHlmaWxsIHdhcyBpbnN0YWxsZWQgZHVlIHRvXG4gICAgICAgIC8vIF9fRk9SQ0VfSU5TVEFMTF9BQk9SVENPTlRST0xMRVJfUE9MWUZJTEwgYmVpbmcgc2V0KSwgdGhlbiBwYXNzaW5nIG91clxuICAgICAgICAvLyBmYWtlIEFib3J0U2lnbmFsIHRvIHRoZSBuYXRpdmUgZmV0Y2ggd2lsbCB0cmlnZ2VyOlxuICAgICAgICAvLyBUeXBlRXJyb3I6IEZhaWxlZCB0byBleGVjdXRlICdmZXRjaCcgb24gJ1dpbmRvdyc6IG1lbWJlciBzaWduYWwgaXMgbm90IG9mIHR5cGUgQWJvcnRTaWduYWwuXG4gICAgICAgIGRlbGV0ZSBpbml0LnNpZ25hbDtcbiAgICAgIH0gLy8gUmV0dXJuIHRoZSBmYXN0ZXN0IHByb21pc2UgKGRvbid0IG5lZWQgdG8gd2FpdCBmb3IgcmVxdWVzdCB0byBmaW5pc2gpXG5cblxuICAgICAgcmV0dXJuIFByb21pc2UucmFjZShbY2FuY2VsbGF0aW9uLCByZWFsRmV0Y2goaW5wdXQsIGluaXQpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlYWxGZXRjaChpbnB1dCwgaW5pdCk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBmZXRjaDogYWJvcnRhYmxlRmV0Y2gsXG4gICAgUmVxdWVzdDogUmVxdWVzdFxuICB9O1xufVxuXG5leHBvcnRzLkFib3J0Q29udHJvbGxlciA9IEFib3J0Q29udHJvbGxlcjtcbmV4cG9ydHMuQWJvcnRTaWduYWwgPSBBYm9ydFNpZ25hbDtcbmV4cG9ydHMuYWJvcnRhYmxlRmV0Y2ggPSBhYm9ydGFibGVGZXRjaERlY29yYXRvcjtcblxufSx7fV0sMjA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuXG59LHt9XSwyMTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaGFzaENsZWFyID0gcmVxdWlyZSgnLi9faGFzaENsZWFyJyksXG4gICAgaGFzaERlbGV0ZSA9IHJlcXVpcmUoJy4vX2hhc2hEZWxldGUnKSxcbiAgICBoYXNoR2V0ID0gcmVxdWlyZSgnLi9faGFzaEdldCcpLFxuICAgIGhhc2hIYXMgPSByZXF1aXJlKCcuL19oYXNoSGFzJyksXG4gICAgaGFzaFNldCA9IHJlcXVpcmUoJy4vX2hhc2hTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgaGFzaCBvYmplY3QuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIEhhc2goZW50cmllcykge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGVudHJpZXMgPT0gbnVsbCA/IDAgOiBlbnRyaWVzLmxlbmd0aDtcblxuICB0aGlzLmNsZWFyKCk7XG4gIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGVudHJ5ID0gZW50cmllc1tpbmRleF07XG4gICAgdGhpcy5zZXQoZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgfVxufVxuXG4vLyBBZGQgbWV0aG9kcyB0byBgSGFzaGAuXG5IYXNoLnByb3RvdHlwZS5jbGVhciA9IGhhc2hDbGVhcjtcbkhhc2gucHJvdG90eXBlWydkZWxldGUnXSA9IGhhc2hEZWxldGU7XG5IYXNoLnByb3RvdHlwZS5nZXQgPSBoYXNoR2V0O1xuSGFzaC5wcm90b3R5cGUuaGFzID0gaGFzaEhhcztcbkhhc2gucHJvdG90eXBlLnNldCA9IGhhc2hTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gSGFzaDtcblxufSx7XCIuL19oYXNoQ2xlYXJcIjo0NixcIi4vX2hhc2hEZWxldGVcIjo0NyxcIi4vX2hhc2hHZXRcIjo0OCxcIi4vX2hhc2hIYXNcIjo0OSxcIi4vX2hhc2hTZXRcIjo1MH1dLDIyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBsaXN0Q2FjaGVDbGVhciA9IHJlcXVpcmUoJy4vX2xpc3RDYWNoZUNsZWFyJyksXG4gICAgbGlzdENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlRGVsZXRlJyksXG4gICAgbGlzdENhY2hlR2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlR2V0JyksXG4gICAgbGlzdENhY2hlSGFzID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlSGFzJyksXG4gICAgbGlzdENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbGlzdENhY2hlU2V0Jyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBsaXN0IGNhY2hlIG9iamVjdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0FycmF5fSBbZW50cmllc10gVGhlIGtleS12YWx1ZSBwYWlycyB0byBjYWNoZS5cbiAqL1xuZnVuY3Rpb24gTGlzdENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYExpc3RDYWNoZWAuXG5MaXN0Q2FjaGUucHJvdG90eXBlLmNsZWFyID0gbGlzdENhY2hlQ2xlYXI7XG5MaXN0Q2FjaGUucHJvdG90eXBlWydkZWxldGUnXSA9IGxpc3RDYWNoZURlbGV0ZTtcbkxpc3RDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbGlzdENhY2hlR2V0O1xuTGlzdENhY2hlLnByb3RvdHlwZS5oYXMgPSBsaXN0Q2FjaGVIYXM7XG5MaXN0Q2FjaGUucHJvdG90eXBlLnNldCA9IGxpc3RDYWNoZVNldDtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0Q2FjaGU7XG5cbn0se1wiLi9fbGlzdENhY2hlQ2xlYXJcIjo1NixcIi4vX2xpc3RDYWNoZURlbGV0ZVwiOjU3LFwiLi9fbGlzdENhY2hlR2V0XCI6NTgsXCIuL19saXN0Q2FjaGVIYXNcIjo1OSxcIi4vX2xpc3RDYWNoZVNldFwiOjYwfV0sMjM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGdldE5hdGl2ZSA9IHJlcXVpcmUoJy4vX2dldE5hdGl2ZScpLFxuICAgIHJvb3QgPSByZXF1aXJlKCcuL19yb290Jyk7XG5cbi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIHRoYXQgYXJlIHZlcmlmaWVkIHRvIGJlIG5hdGl2ZS4gKi9cbnZhciBNYXAgPSBnZXROYXRpdmUocm9vdCwgJ01hcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hcDtcblxufSx7XCIuL19nZXROYXRpdmVcIjo0MixcIi4vX3Jvb3RcIjo3Mn1dLDI0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBtYXBDYWNoZUNsZWFyID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVDbGVhcicpLFxuICAgIG1hcENhY2hlRGVsZXRlID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVEZWxldGUnKSxcbiAgICBtYXBDYWNoZUdldCA9IHJlcXVpcmUoJy4vX21hcENhY2hlR2V0JyksXG4gICAgbWFwQ2FjaGVIYXMgPSByZXF1aXJlKCcuL19tYXBDYWNoZUhhcycpLFxuICAgIG1hcENhY2hlU2V0ID0gcmVxdWlyZSgnLi9fbWFwQ2FjaGVTZXQnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgbWFwIGNhY2hlIG9iamVjdCB0byBzdG9yZSBrZXktdmFsdWUgcGFpcnMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtBcnJheX0gW2VudHJpZXNdIFRoZSBrZXktdmFsdWUgcGFpcnMgdG8gY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIE1hcENhY2hlKGVudHJpZXMpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICBsZW5ndGggPSBlbnRyaWVzID09IG51bGwgPyAwIDogZW50cmllcy5sZW5ndGg7XG5cbiAgdGhpcy5jbGVhcigpO1xuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHZhciBlbnRyeSA9IGVudHJpZXNbaW5kZXhdO1xuICAgIHRoaXMuc2V0KGVudHJ5WzBdLCBlbnRyeVsxXSk7XG4gIH1cbn1cblxuLy8gQWRkIG1ldGhvZHMgdG8gYE1hcENhY2hlYC5cbk1hcENhY2hlLnByb3RvdHlwZS5jbGVhciA9IG1hcENhY2hlQ2xlYXI7XG5NYXBDYWNoZS5wcm90b3R5cGVbJ2RlbGV0ZSddID0gbWFwQ2FjaGVEZWxldGU7XG5NYXBDYWNoZS5wcm90b3R5cGUuZ2V0ID0gbWFwQ2FjaGVHZXQ7XG5NYXBDYWNoZS5wcm90b3R5cGUuaGFzID0gbWFwQ2FjaGVIYXM7XG5NYXBDYWNoZS5wcm90b3R5cGUuc2V0ID0gbWFwQ2FjaGVTZXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gTWFwQ2FjaGU7XG5cbn0se1wiLi9fbWFwQ2FjaGVDbGVhclwiOjYxLFwiLi9fbWFwQ2FjaGVEZWxldGVcIjo2MixcIi4vX21hcENhY2hlR2V0XCI6NjMsXCIuL19tYXBDYWNoZUhhc1wiOjY0LFwiLi9fbWFwQ2FjaGVTZXRcIjo2NX1dLDI1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBTeW1ib2wgPSByb290LlN5bWJvbDtcblxubW9kdWxlLmV4cG9ydHMgPSBTeW1ib2w7XG5cbn0se1wiLi9fcm9vdFwiOjcyfV0sMjY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGJhc2VUaW1lcyA9IHJlcXVpcmUoJy4vX2Jhc2VUaW1lcycpLFxuICAgIGlzQXJndW1lbnRzID0gcmVxdWlyZSgnLi9pc0FyZ3VtZW50cycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc0J1ZmZlciA9IHJlcXVpcmUoJy4vaXNCdWZmZXInKSxcbiAgICBpc0luZGV4ID0gcmVxdWlyZSgnLi9faXNJbmRleCcpLFxuICAgIGlzVHlwZWRBcnJheSA9IHJlcXVpcmUoJy4vaXNUeXBlZEFycmF5Jyk7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhcnJheSBvZiB0aGUgZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiB0aGUgYXJyYXktbGlrZSBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW5oZXJpdGVkIFNwZWNpZnkgcmV0dXJuaW5nIGluaGVyaXRlZCBwcm9wZXJ0eSBuYW1lcy5cbiAqIEByZXR1cm5zIHtBcnJheX0gUmV0dXJucyB0aGUgYXJyYXkgb2YgcHJvcGVydHkgbmFtZXMuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TGlrZUtleXModmFsdWUsIGluaGVyaXRlZCkge1xuICB2YXIgaXNBcnIgPSBpc0FycmF5KHZhbHVlKSxcbiAgICAgIGlzQXJnID0gIWlzQXJyICYmIGlzQXJndW1lbnRzKHZhbHVlKSxcbiAgICAgIGlzQnVmZiA9ICFpc0FyciAmJiAhaXNBcmcgJiYgaXNCdWZmZXIodmFsdWUpLFxuICAgICAgaXNUeXBlID0gIWlzQXJyICYmICFpc0FyZyAmJiAhaXNCdWZmICYmIGlzVHlwZWRBcnJheSh2YWx1ZSksXG4gICAgICBza2lwSW5kZXhlcyA9IGlzQXJyIHx8IGlzQXJnIHx8IGlzQnVmZiB8fCBpc1R5cGUsXG4gICAgICByZXN1bHQgPSBza2lwSW5kZXhlcyA/IGJhc2VUaW1lcyh2YWx1ZS5sZW5ndGgsIFN0cmluZykgOiBbXSxcbiAgICAgIGxlbmd0aCA9IHJlc3VsdC5sZW5ndGg7XG5cbiAgZm9yICh2YXIga2V5IGluIHZhbHVlKSB7XG4gICAgaWYgKChpbmhlcml0ZWQgfHwgaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwga2V5KSkgJiZcbiAgICAgICAgIShza2lwSW5kZXhlcyAmJiAoXG4gICAgICAgICAgIC8vIFNhZmFyaSA5IGhhcyBlbnVtZXJhYmxlIGBhcmd1bWVudHMubGVuZ3RoYCBpbiBzdHJpY3QgbW9kZS5cbiAgICAgICAgICAga2V5ID09ICdsZW5ndGgnIHx8XG4gICAgICAgICAgIC8vIE5vZGUuanMgMC4xMCBoYXMgZW51bWVyYWJsZSBub24taW5kZXggcHJvcGVydGllcyBvbiBidWZmZXJzLlxuICAgICAgICAgICAoaXNCdWZmICYmIChrZXkgPT0gJ29mZnNldCcgfHwga2V5ID09ICdwYXJlbnQnKSkgfHxcbiAgICAgICAgICAgLy8gUGhhbnRvbUpTIDIgaGFzIGVudW1lcmFibGUgbm9uLWluZGV4IHByb3BlcnRpZXMgb24gdHlwZWQgYXJyYXlzLlxuICAgICAgICAgICAoaXNUeXBlICYmIChrZXkgPT0gJ2J1ZmZlcicgfHwga2V5ID09ICdieXRlTGVuZ3RoJyB8fCBrZXkgPT0gJ2J5dGVPZmZzZXQnKSkgfHxcbiAgICAgICAgICAgLy8gU2tpcCBpbmRleCBwcm9wZXJ0aWVzLlxuICAgICAgICAgICBpc0luZGV4KGtleSwgbGVuZ3RoKVxuICAgICAgICApKSkge1xuICAgICAgcmVzdWx0LnB1c2goa2V5KTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheUxpa2VLZXlzO1xuXG59LHtcIi4vX2Jhc2VUaW1lc1wiOjM1LFwiLi9faXNJbmRleFwiOjUxLFwiLi9pc0FyZ3VtZW50c1wiOjc4LFwiLi9pc0FycmF5XCI6NzksXCIuL2lzQnVmZmVyXCI6ODIsXCIuL2lzVHlwZWRBcnJheVwiOjkyfV0sMjc6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWFwYCBmb3IgYXJyYXlzIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWVcbiAqIHNob3J0aGFuZHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7QXJyYXl9IFthcnJheV0gVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdGVlIFRoZSBmdW5jdGlvbiBpbnZva2VkIHBlciBpdGVyYXRpb24uXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIG5ldyBtYXBwZWQgYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGFycmF5TWFwKGFycmF5LCBpdGVyYXRlZSkge1xuICB2YXIgaW5kZXggPSAtMSxcbiAgICAgIGxlbmd0aCA9IGFycmF5ID09IG51bGwgPyAwIDogYXJyYXkubGVuZ3RoLFxuICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgIHJlc3VsdFtpbmRleF0gPSBpdGVyYXRlZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBhcnJheU1hcDtcblxufSx7fV0sMjg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGVxID0gcmVxdWlyZSgnLi9lcScpO1xuXG4vKipcbiAqIEdldHMgdGhlIGluZGV4IGF0IHdoaWNoIHRoZSBga2V5YCBpcyBmb3VuZCBpbiBgYXJyYXlgIG9mIGtleS12YWx1ZSBwYWlycy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGluc3BlY3QuXG4gKiBAcGFyYW0geyp9IGtleSBUaGUga2V5IHRvIHNlYXJjaCBmb3IuXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSZXR1cm5zIHRoZSBpbmRleCBvZiB0aGUgbWF0Y2hlZCB2YWx1ZSwgZWxzZSBgLTFgLlxuICovXG5mdW5jdGlvbiBhc3NvY0luZGV4T2YoYXJyYXksIGtleSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICBpZiAoZXEoYXJyYXlbbGVuZ3RoXVswXSwga2V5KSkge1xuICAgICAgcmV0dXJuIGxlbmd0aDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc29jSW5kZXhPZjtcblxufSx7XCIuL2VxXCI6NzZ9XSwyOTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgY2FzdFBhdGggPSByZXF1aXJlKCcuL19jYXN0UGF0aCcpLFxuICAgIHRvS2V5ID0gcmVxdWlyZSgnLi9fdG9LZXknKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5nZXRgIHdpdGhvdXQgc3VwcG9ydCBmb3IgZGVmYXVsdCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0byBxdWVyeS5cbiAqIEBwYXJhbSB7QXJyYXl8c3RyaW5nfSBwYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcmVzb2x2ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGJhc2VHZXQob2JqZWN0LCBwYXRoKSB7XG4gIHBhdGggPSBjYXN0UGF0aChwYXRoLCBvYmplY3QpO1xuXG4gIHZhciBpbmRleCA9IDAsXG4gICAgICBsZW5ndGggPSBwYXRoLmxlbmd0aDtcblxuICB3aGlsZSAob2JqZWN0ICE9IG51bGwgJiYgaW5kZXggPCBsZW5ndGgpIHtcbiAgICBvYmplY3QgPSBvYmplY3RbdG9LZXkocGF0aFtpbmRleCsrXSldO1xuICB9XG4gIHJldHVybiAoaW5kZXggJiYgaW5kZXggPT0gbGVuZ3RoKSA/IG9iamVjdCA6IHVuZGVmaW5lZDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlR2V0O1xuXG59LHtcIi4vX2Nhc3RQYXRoXCI6MzgsXCIuL190b0tleVwiOjc0fV0sMzA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIFN5bWJvbCA9IHJlcXVpcmUoJy4vX1N5bWJvbCcpLFxuICAgIGdldFJhd1RhZyA9IHJlcXVpcmUoJy4vX2dldFJhd1RhZycpLFxuICAgIG9iamVjdFRvU3RyaW5nID0gcmVxdWlyZSgnLi9fb2JqZWN0VG9TdHJpbmcnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG51bGxUYWcgPSAnW29iamVjdCBOdWxsXScsXG4gICAgdW5kZWZpbmVkVGFnID0gJ1tvYmplY3QgVW5kZWZpbmVkXSc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBnZXRUYWdgIHdpdGhvdXQgZmFsbGJhY2tzIGZvciBidWdneSBlbnZpcm9ubWVudHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgYHRvU3RyaW5nVGFnYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUdldFRhZyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkVGFnIDogbnVsbFRhZztcbiAgfVxuICByZXR1cm4gKHN5bVRvU3RyaW5nVGFnICYmIHN5bVRvU3RyaW5nVGFnIGluIE9iamVjdCh2YWx1ZSkpXG4gICAgPyBnZXRSYXdUYWcodmFsdWUpXG4gICAgOiBvYmplY3RUb1N0cmluZyh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUdldFRhZztcblxufSx7XCIuL19TeW1ib2xcIjoyNSxcIi4vX2dldFJhd1RhZ1wiOjQ0LFwiLi9fb2JqZWN0VG9TdHJpbmdcIjo3MH1dLDMxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBhcmdzVGFnID0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG5cbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8uaXNBcmd1bWVudHNgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGFuIGBhcmd1bWVudHNgIG9iamVjdCxcbiAqL1xuZnVuY3Rpb24gYmFzZUlzQXJndW1lbnRzKHZhbHVlKSB7XG4gIHJldHVybiBpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IGFyZ3NUYWc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzQXJndW1lbnRzO1xuXG59LHtcIi4vX2Jhc2VHZXRUYWdcIjozMCxcIi4vaXNPYmplY3RMaWtlXCI6ODh9XSwzMjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTWFza2VkID0gcmVxdWlyZSgnLi9faXNNYXNrZWQnKSxcbiAgICBpc09iamVjdCA9IHJlcXVpcmUoJy4vaXNPYmplY3QnKSxcbiAgICB0b1NvdXJjZSA9IHJlcXVpcmUoJy4vX3RvU291cmNlJyk7XG5cbi8qKlxuICogVXNlZCB0byBtYXRjaCBgUmVnRXhwYFxuICogW3N5bnRheCBjaGFyYWN0ZXJzXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wYXR0ZXJucykuXG4gKi9cbnZhciByZVJlZ0V4cENoYXIgPSAvW1xcXFxeJC4qKz8oKVtcXF17fXxdL2c7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBob3N0IGNvbnN0cnVjdG9ycyAoU2FmYXJpKS4gKi9cbnZhciByZUlzSG9zdEN0b3IgPSAvXlxcW29iamVjdCAuKz9Db25zdHJ1Y3RvclxcXSQvO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IGlmIGEgbWV0aG9kIGlzIG5hdGl2ZS4gKi9cbnZhciByZUlzTmF0aXZlID0gUmVnRXhwKCdeJyArXG4gIGZ1bmNUb1N0cmluZy5jYWxsKGhhc093blByb3BlcnR5KS5yZXBsYWNlKHJlUmVnRXhwQ2hhciwgJ1xcXFwkJicpXG4gIC5yZXBsYWNlKC9oYXNPd25Qcm9wZXJ0eXwoZnVuY3Rpb24pLio/KD89XFxcXFxcKCl8IGZvciAuKz8oPz1cXFxcXFxdKS9nLCAnJDEuKj8nKSArICckJ1xuKTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc05hdGl2ZWAgd2l0aG91dCBiYWQgc2hpbSBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBuYXRpdmUgZnVuY3Rpb24sXG4gKiAgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBiYXNlSXNOYXRpdmUodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdCh2YWx1ZSkgfHwgaXNNYXNrZWQodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwYXR0ZXJuID0gaXNGdW5jdGlvbih2YWx1ZSkgPyByZUlzTmF0aXZlIDogcmVJc0hvc3RDdG9yO1xuICByZXR1cm4gcGF0dGVybi50ZXN0KHRvU291cmNlKHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzTmF0aXZlO1xuXG59LHtcIi4vX2lzTWFza2VkXCI6NTQsXCIuL190b1NvdXJjZVwiOjc1LFwiLi9pc0Z1bmN0aW9uXCI6ODMsXCIuL2lzT2JqZWN0XCI6ODd9XSwzMzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc0xlbmd0aCA9IHJlcXVpcmUoJy4vaXNMZW5ndGgnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXJnc1RhZyA9ICdbb2JqZWN0IEFyZ3VtZW50c10nLFxuICAgIGFycmF5VGFnID0gJ1tvYmplY3QgQXJyYXldJyxcbiAgICBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nLFxuICAgIGRhdGVUYWcgPSAnW29iamVjdCBEYXRlXScsXG4gICAgZXJyb3JUYWcgPSAnW29iamVjdCBFcnJvcl0nLFxuICAgIGZ1bmNUYWcgPSAnW29iamVjdCBGdW5jdGlvbl0nLFxuICAgIG1hcFRhZyA9ICdbb2JqZWN0IE1hcF0nLFxuICAgIG51bWJlclRhZyA9ICdbb2JqZWN0IE51bWJlcl0nLFxuICAgIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nLFxuICAgIHJlZ2V4cFRhZyA9ICdbb2JqZWN0IFJlZ0V4cF0nLFxuICAgIHNldFRhZyA9ICdbb2JqZWN0IFNldF0nLFxuICAgIHN0cmluZ1RhZyA9ICdbb2JqZWN0IFN0cmluZ10nLFxuICAgIHdlYWtNYXBUYWcgPSAnW29iamVjdCBXZWFrTWFwXSc7XG5cbnZhciBhcnJheUJ1ZmZlclRhZyA9ICdbb2JqZWN0IEFycmF5QnVmZmVyXScsXG4gICAgZGF0YVZpZXdUYWcgPSAnW29iamVjdCBEYXRhVmlld10nLFxuICAgIGZsb2F0MzJUYWcgPSAnW29iamVjdCBGbG9hdDMyQXJyYXldJyxcbiAgICBmbG9hdDY0VGFnID0gJ1tvYmplY3QgRmxvYXQ2NEFycmF5XScsXG4gICAgaW50OFRhZyA9ICdbb2JqZWN0IEludDhBcnJheV0nLFxuICAgIGludDE2VGFnID0gJ1tvYmplY3QgSW50MTZBcnJheV0nLFxuICAgIGludDMyVGFnID0gJ1tvYmplY3QgSW50MzJBcnJheV0nLFxuICAgIHVpbnQ4VGFnID0gJ1tvYmplY3QgVWludDhBcnJheV0nLFxuICAgIHVpbnQ4Q2xhbXBlZFRhZyA9ICdbb2JqZWN0IFVpbnQ4Q2xhbXBlZEFycmF5XScsXG4gICAgdWludDE2VGFnID0gJ1tvYmplY3QgVWludDE2QXJyYXldJyxcbiAgICB1aW50MzJUYWcgPSAnW29iamVjdCBVaW50MzJBcnJheV0nO1xuXG4vKiogVXNlZCB0byBpZGVudGlmeSBgdG9TdHJpbmdUYWdgIHZhbHVlcyBvZiB0eXBlZCBhcnJheXMuICovXG52YXIgdHlwZWRBcnJheVRhZ3MgPSB7fTtcbnR5cGVkQXJyYXlUYWdzW2Zsb2F0MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbZmxvYXQ2NFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50OFRhZ10gPSB0eXBlZEFycmF5VGFnc1tpbnQxNlRhZ10gPVxudHlwZWRBcnJheVRhZ3NbaW50MzJUYWddID0gdHlwZWRBcnJheVRhZ3NbdWludDhUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQ4Q2xhbXBlZFRhZ10gPSB0eXBlZEFycmF5VGFnc1t1aW50MTZUYWddID1cbnR5cGVkQXJyYXlUYWdzW3VpbnQzMlRhZ10gPSB0cnVlO1xudHlwZWRBcnJheVRhZ3NbYXJnc1RhZ10gPSB0eXBlZEFycmF5VGFnc1thcnJheVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbYXJyYXlCdWZmZXJUYWddID0gdHlwZWRBcnJheVRhZ3NbYm9vbFRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZGF0YVZpZXdUYWddID0gdHlwZWRBcnJheVRhZ3NbZGF0ZVRhZ10gPVxudHlwZWRBcnJheVRhZ3NbZXJyb3JUYWddID0gdHlwZWRBcnJheVRhZ3NbZnVuY1RhZ10gPVxudHlwZWRBcnJheVRhZ3NbbWFwVGFnXSA9IHR5cGVkQXJyYXlUYWdzW251bWJlclRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbb2JqZWN0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3JlZ2V4cFRhZ10gPVxudHlwZWRBcnJheVRhZ3Nbc2V0VGFnXSA9IHR5cGVkQXJyYXlUYWdzW3N0cmluZ1RhZ10gPVxudHlwZWRBcnJheVRhZ3Nbd2Vha01hcFRhZ10gPSBmYWxzZTtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy5pc1R5cGVkQXJyYXlgIHdpdGhvdXQgTm9kZS5qcyBvcHRpbWl6YXRpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgdHlwZWQgYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gYmFzZUlzVHlwZWRBcnJheSh2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJlxuICAgIGlzTGVuZ3RoKHZhbHVlLmxlbmd0aCkgJiYgISF0eXBlZEFycmF5VGFnc1tiYXNlR2V0VGFnKHZhbHVlKV07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUlzVHlwZWRBcnJheTtcblxufSx7XCIuL19iYXNlR2V0VGFnXCI6MzAsXCIuL2lzTGVuZ3RoXCI6ODQsXCIuL2lzT2JqZWN0TGlrZVwiOjg4fV0sMzQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGlzUHJvdG90eXBlID0gcmVxdWlyZSgnLi9faXNQcm90b3R5cGUnKSxcbiAgICBuYXRpdmVLZXlzID0gcmVxdWlyZSgnLi9fbmF0aXZlS2V5cycpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLmtleXNgIHdoaWNoIGRvZXNuJ3QgdHJlYXQgc3BhcnNlIGFycmF5cyBhcyBkZW5zZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiBwcm9wZXJ0eSBuYW1lcy5cbiAqL1xuZnVuY3Rpb24gYmFzZUtleXMob2JqZWN0KSB7XG4gIGlmICghaXNQcm90b3R5cGUob2JqZWN0KSkge1xuICAgIHJldHVybiBuYXRpdmVLZXlzKG9iamVjdCk7XG4gIH1cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gT2JqZWN0KG9iamVjdCkpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSkgJiYga2V5ICE9ICdjb25zdHJ1Y3RvcicpIHtcbiAgICAgIHJlc3VsdC5wdXNoKGtleSk7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZUtleXM7XG5cbn0se1wiLi9faXNQcm90b3R5cGVcIjo1NSxcIi4vX25hdGl2ZUtleXNcIjo2OH1dLDM1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb2YgYF8udGltZXNgIHdpdGhvdXQgc3VwcG9ydCBmb3IgaXRlcmF0ZWUgc2hvcnRoYW5kc1xuICogb3IgbWF4IGFycmF5IGxlbmd0aCBjaGVja3MuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIGBpdGVyYXRlZWAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRlZSBUaGUgZnVuY3Rpb24gaW52b2tlZCBwZXIgaXRlcmF0aW9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBhcnJheSBvZiByZXN1bHRzLlxuICovXG5mdW5jdGlvbiBiYXNlVGltZXMobiwgaXRlcmF0ZWUpIHtcbiAgdmFyIGluZGV4ID0gLTEsXG4gICAgICByZXN1bHQgPSBBcnJheShuKTtcblxuICB3aGlsZSAoKytpbmRleCA8IG4pIHtcbiAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0ZWUoaW5kZXgpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVRpbWVzO1xuXG59LHt9XSwzNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgU3ltYm9sID0gcmVxdWlyZSgnLi9fU3ltYm9sJyksXG4gICAgYXJyYXlNYXAgPSByZXF1aXJlKCcuL19hcnJheU1hcCcpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgSU5GSU5JVFkgPSAxIC8gMDtcblxuLyoqIFVzZWQgdG8gY29udmVydCBzeW1ib2xzIHRvIHByaW1pdGl2ZXMgYW5kIHN0cmluZ3MuICovXG52YXIgc3ltYm9sUHJvdG8gPSBTeW1ib2wgPyBTeW1ib2wucHJvdG90eXBlIDogdW5kZWZpbmVkLFxuICAgIHN5bWJvbFRvU3RyaW5nID0gc3ltYm9sUHJvdG8gPyBzeW1ib2xQcm90by50b1N0cmluZyA6IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvZiBgXy50b1N0cmluZ2Agd2hpY2ggZG9lc24ndCBjb252ZXJ0IG51bGxpc2hcbiAqIHZhbHVlcyB0byBlbXB0eSBzdHJpbmdzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBwcm9jZXNzLlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBiYXNlVG9TdHJpbmcodmFsdWUpIHtcbiAgLy8gRXhpdCBlYXJseSBmb3Igc3RyaW5ncyB0byBhdm9pZCBhIHBlcmZvcm1hbmNlIGhpdCBpbiBzb21lIGVudmlyb25tZW50cy5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAvLyBSZWN1cnNpdmVseSBjb252ZXJ0IHZhbHVlcyAoc3VzY2VwdGlibGUgdG8gY2FsbCBzdGFjayBsaW1pdHMpLlxuICAgIHJldHVybiBhcnJheU1hcCh2YWx1ZSwgYmFzZVRvU3RyaW5nKSArICcnO1xuICB9XG4gIGlmIChpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gc3ltYm9sVG9TdHJpbmcgPyBzeW1ib2xUb1N0cmluZy5jYWxsKHZhbHVlKSA6ICcnO1xuICB9XG4gIHZhciByZXN1bHQgPSAodmFsdWUgKyAnJyk7XG4gIHJldHVybiAocmVzdWx0ID09ICcwJyAmJiAoMSAvIHZhbHVlKSA9PSAtSU5GSU5JVFkpID8gJy0wJyA6IHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYXNlVG9TdHJpbmc7XG5cbn0se1wiLi9fU3ltYm9sXCI6MjUsXCIuL19hcnJheU1hcFwiOjI3LFwiLi9pc0FycmF5XCI6NzksXCIuL2lzU3ltYm9sXCI6OTF9XSwzNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9mIGBfLnVuYXJ5YCB3aXRob3V0IHN1cHBvcnQgZm9yIHN0b3JpbmcgbWV0YWRhdGEuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIGNhcCBhcmd1bWVudHMgZm9yLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgY2FwcGVkIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiYXNlVW5hcnkoZnVuYykge1xuICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuYyh2YWx1ZSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYmFzZVVuYXJ5O1xuXG59LHt9XSwzODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4vaXNBcnJheScpLFxuICAgIGlzS2V5ID0gcmVxdWlyZSgnLi9faXNLZXknKSxcbiAgICBzdHJpbmdUb1BhdGggPSByZXF1aXJlKCcuL19zdHJpbmdUb1BhdGgnKSxcbiAgICB0b1N0cmluZyA9IHJlcXVpcmUoJy4vdG9TdHJpbmcnKTtcblxuLyoqXG4gKiBDYXN0cyBgdmFsdWVgIHRvIGEgcGF0aCBhcnJheSBpZiBpdCdzIG5vdCBvbmUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGluc3BlY3QuXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge0FycmF5fSBSZXR1cm5zIHRoZSBjYXN0IHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKi9cbmZ1bmN0aW9uIGNhc3RQYXRoKHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiBpc0tleSh2YWx1ZSwgb2JqZWN0KSA/IFt2YWx1ZV0gOiBzdHJpbmdUb1BhdGgodG9TdHJpbmcodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjYXN0UGF0aDtcblxufSx7XCIuL19pc0tleVwiOjUyLFwiLi9fc3RyaW5nVG9QYXRoXCI6NzMsXCIuL2lzQXJyYXlcIjo3OSxcIi4vdG9TdHJpbmdcIjo5Nn1dLDM5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciByb290ID0gcmVxdWlyZSgnLi9fcm9vdCcpO1xuXG4vKiogVXNlZCB0byBkZXRlY3Qgb3ZlcnJlYWNoaW5nIGNvcmUtanMgc2hpbXMuICovXG52YXIgY29yZUpzRGF0YSA9IHJvb3RbJ19fY29yZS1qc19zaGFyZWRfXyddO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvcmVKc0RhdGE7XG5cbn0se1wiLi9fcm9vdFwiOjcyfV0sNDA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgIGZyb20gTm9kZS5qcy4gKi9cbnZhciBmcmVlR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwgJiYgZ2xvYmFsLk9iamVjdCA9PT0gT2JqZWN0ICYmIGdsb2JhbDtcblxubW9kdWxlLmV4cG9ydHMgPSBmcmVlR2xvYmFsO1xuXG59KS5jYWxsKHRoaXMsdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbn0se31dLDQxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBpc0tleWFibGUgPSByZXF1aXJlKCcuL19pc0tleWFibGUnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBkYXRhIGZvciBgbWFwYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG1hcCBUaGUgbWFwIHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUgcmVmZXJlbmNlIGtleS5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBtYXAgZGF0YS5cbiAqL1xuZnVuY3Rpb24gZ2V0TWFwRGF0YShtYXAsIGtleSkge1xuICB2YXIgZGF0YSA9IG1hcC5fX2RhdGFfXztcbiAgcmV0dXJuIGlzS2V5YWJsZShrZXkpXG4gICAgPyBkYXRhW3R5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyAnc3RyaW5nJyA6ICdoYXNoJ11cbiAgICA6IGRhdGEubWFwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE1hcERhdGE7XG5cbn0se1wiLi9faXNLZXlhYmxlXCI6NTN9XSw0MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgYmFzZUlzTmF0aXZlID0gcmVxdWlyZSgnLi9fYmFzZUlzTmF0aXZlJyksXG4gICAgZ2V0VmFsdWUgPSByZXF1aXJlKCcuL19nZXRWYWx1ZScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG5hdGl2ZSBmdW5jdGlvbiBhdCBga2V5YCBvZiBgb2JqZWN0YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBtZXRob2QgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGZ1bmN0aW9uIGlmIGl0J3MgbmF0aXZlLCBlbHNlIGB1bmRlZmluZWRgLlxuICovXG5mdW5jdGlvbiBnZXROYXRpdmUob2JqZWN0LCBrZXkpIHtcbiAgdmFyIHZhbHVlID0gZ2V0VmFsdWUob2JqZWN0LCBrZXkpO1xuICByZXR1cm4gYmFzZUlzTmF0aXZlKHZhbHVlKSA/IHZhbHVlIDogdW5kZWZpbmVkO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE5hdGl2ZTtcblxufSx7XCIuL19iYXNlSXNOYXRpdmVcIjozMixcIi4vX2dldFZhbHVlXCI6NDV9XSw0MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuXG59LHtcIi4vX292ZXJBcmdcIjo3MX1dLDQ0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBTeW1ib2wgPSByZXF1aXJlKCcuL19TeW1ib2wnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHN5bVRvU3RyaW5nVGFnID0gU3ltYm9sID8gU3ltYm9sLnRvU3RyaW5nVGFnIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIEEgc3BlY2lhbGl6ZWQgdmVyc2lvbiBvZiBgYmFzZUdldFRhZ2Agd2hpY2ggaWdub3JlcyBgU3ltYm9sLnRvU3RyaW5nVGFnYCB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge3N0cmluZ30gUmV0dXJucyB0aGUgcmF3IGB0b1N0cmluZ1RhZ2AuXG4gKi9cbmZ1bmN0aW9uIGdldFJhd1RhZyh2YWx1ZSkge1xuICB2YXIgaXNPd24gPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBzeW1Ub1N0cmluZ1RhZyksXG4gICAgICB0YWcgPSB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ107XG5cbiAgdHJ5IHtcbiAgICB2YWx1ZVtzeW1Ub1N0cmluZ1RhZ10gPSB1bmRlZmluZWQ7XG4gICAgdmFyIHVubWFza2VkID0gdHJ1ZTtcbiAgfSBjYXRjaCAoZSkge31cblxuICB2YXIgcmVzdWx0ID0gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIGlmICh1bm1hc2tlZCkge1xuICAgIGlmIChpc093bikge1xuICAgICAgdmFsdWVbc3ltVG9TdHJpbmdUYWddID0gdGFnO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdmFsdWVbc3ltVG9TdHJpbmdUYWddO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFJhd1RhZztcblxufSx7XCIuL19TeW1ib2xcIjoyNX1dLDQ1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogR2V0cyB0aGUgdmFsdWUgYXQgYGtleWAgb2YgYG9iamVjdGAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb2JqZWN0XSBUaGUgb2JqZWN0IHRvIHF1ZXJ5LlxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSBwcm9wZXJ0eSB0byBnZXQuXG4gKiBAcmV0dXJucyB7Kn0gUmV0dXJucyB0aGUgcHJvcGVydHkgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIGdldFZhbHVlKG9iamVjdCwga2V5KSB7XG4gIHJldHVybiBvYmplY3QgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG9iamVjdFtrZXldO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFZhbHVlO1xuXG59LHt9XSw0NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBhbGwga2V5LXZhbHVlIGVudHJpZXMgZnJvbSB0aGUgaGFzaC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBIYXNoXG4gKi9cbmZ1bmN0aW9uIGhhc2hDbGVhcigpIHtcbiAgdGhpcy5fX2RhdGFfXyA9IG5hdGl2ZUNyZWF0ZSA/IG5hdGl2ZUNyZWF0ZShudWxsKSA6IHt9O1xuICB0aGlzLnNpemUgPSAwO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hDbGVhcjtcblxufSx7XCIuL19uYXRpdmVDcmVhdGVcIjo2N31dLDQ3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIGhhc2guXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGRlbGV0ZVxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoIFRoZSBoYXNoIHRvIG1vZGlmeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoRGVsZXRlKGtleSkge1xuICB2YXIgcmVzdWx0ID0gdGhpcy5oYXMoa2V5KSAmJiBkZWxldGUgdGhpcy5fX2RhdGFfX1trZXldO1xuICB0aGlzLnNpemUgLT0gcmVzdWx0ID8gMSA6IDA7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaERlbGV0ZTtcblxufSx7fV0sNDg6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIG5hdGl2ZUNyZWF0ZSA9IHJlcXVpcmUoJy4vX25hdGl2ZUNyZWF0ZScpO1xuXG4vKiogVXNlZCB0byBzdGFuZC1pbiBmb3IgYHVuZGVmaW5lZGAgaGFzaCB2YWx1ZXMuICovXG52YXIgSEFTSF9VTkRFRklORUQgPSAnX19sb2Rhc2hfaGFzaF91bmRlZmluZWRfXyc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKlxuICogR2V0cyB0aGUgaGFzaCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gZ2V0LlxuICogQHJldHVybnMgeyp9IFJldHVybnMgdGhlIGVudHJ5IHZhbHVlLlxuICovXG5mdW5jdGlvbiBoYXNoR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIGlmIChuYXRpdmVDcmVhdGUpIHtcbiAgICB2YXIgcmVzdWx0ID0gZGF0YVtrZXldO1xuICAgIHJldHVybiByZXN1bHQgPT09IEhBU0hfVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogcmVzdWx0O1xuICB9XG4gIHJldHVybiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGRhdGEsIGtleSkgPyBkYXRhW2tleV0gOiB1bmRlZmluZWQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaGFzaEdldDtcblxufSx7XCIuL19uYXRpdmVDcmVhdGVcIjo2N31dLDQ5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBuYXRpdmVDcmVhdGUgPSByZXF1aXJlKCcuL19uYXRpdmVDcmVhdGUnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYSBoYXNoIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBoYXNoSGFzKGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX187XG4gIHJldHVybiBuYXRpdmVDcmVhdGUgPyAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIDogaGFzT3duUHJvcGVydHkuY2FsbChkYXRhLCBrZXkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hIYXM7XG5cbn0se1wiLi9fbmF0aXZlQ3JlYXRlXCI6Njd9XSw1MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgbmF0aXZlQ3JlYXRlID0gcmVxdWlyZSgnLi9fbmF0aXZlQ3JlYXRlJyk7XG5cbi8qKiBVc2VkIHRvIHN0YW5kLWluIGZvciBgdW5kZWZpbmVkYCBoYXNoIHZhbHVlcy4gKi9cbnZhciBIQVNIX1VOREVGSU5FRCA9ICdfX2xvZGFzaF9oYXNoX3VuZGVmaW5lZF9fJztcblxuLyoqXG4gKiBTZXRzIHRoZSBoYXNoIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIEhhc2hcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gc2V0LlxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gc2V0LlxuICogQHJldHVybnMge09iamVjdH0gUmV0dXJucyB0aGUgaGFzaCBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gaGFzaFNldChrZXksIHZhbHVlKSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXztcbiAgdGhpcy5zaXplICs9IHRoaXMuaGFzKGtleSkgPyAwIDogMTtcbiAgZGF0YVtrZXldID0gKG5hdGl2ZUNyZWF0ZSAmJiB2YWx1ZSA9PT0gdW5kZWZpbmVkKSA/IEhBU0hfVU5ERUZJTkVEIDogdmFsdWU7XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGhhc2hTZXQ7XG5cbn0se1wiLi9fbmF0aXZlQ3JlYXRlXCI6Njd9XSw1MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKiogVXNlZCBhcyByZWZlcmVuY2VzIGZvciB2YXJpb3VzIGBOdW1iZXJgIGNvbnN0YW50cy4gKi9cbnZhciBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuLyoqIFVzZWQgdG8gZGV0ZWN0IHVuc2lnbmVkIGludGVnZXIgdmFsdWVzLiAqL1xudmFyIHJlSXNVaW50ID0gL14oPzowfFsxLTldXFxkKikkLztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGFycmF5LWxpa2UgaW5kZXguXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHBhcmFtIHtudW1iZXJ9IFtsZW5ndGg9TUFYX1NBRkVfSU5URUdFUl0gVGhlIHVwcGVyIGJvdW5kcyBvZiBhIHZhbGlkIGluZGV4LlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBpbmRleCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0luZGV4KHZhbHVlLCBsZW5ndGgpIHtcbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsdWU7XG4gIGxlbmd0aCA9IGxlbmd0aCA9PSBudWxsID8gTUFYX1NBRkVfSU5URUdFUiA6IGxlbmd0aDtcblxuICByZXR1cm4gISFsZW5ndGggJiZcbiAgICAodHlwZSA9PSAnbnVtYmVyJyB8fFxuICAgICAgKHR5cGUgIT0gJ3N5bWJvbCcgJiYgcmVJc1VpbnQudGVzdCh2YWx1ZSkpKSAmJlxuICAgICAgICAodmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8IGxlbmd0aCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNJbmRleDtcblxufSx7fV0sNTI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc1N5bWJvbCA9IHJlcXVpcmUoJy4vaXNTeW1ib2wnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlSXNEZWVwUHJvcCA9IC9cXC58XFxbKD86W15bXFxdXSp8KFtcIiddKSg/Oig/IVxcMSlbXlxcXFxdfFxcXFwuKSo/XFwxKVxcXS8sXG4gICAgcmVJc1BsYWluUHJvcCA9IC9eXFx3KiQvO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcHJvcGVydHkgbmFtZSBhbmQgbm90IGEgcHJvcGVydHkgcGF0aC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcGFyYW0ge09iamVjdH0gW29iamVjdF0gVGhlIG9iamVjdCB0byBxdWVyeSBrZXlzIG9uLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwcm9wZXJ0eSBuYW1lLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5KHZhbHVlLCBvYmplY3QpIHtcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICBpZiAodHlwZSA9PSAnbnVtYmVyJyB8fCB0eXBlID09ICdzeW1ib2wnIHx8IHR5cGUgPT0gJ2Jvb2xlYW4nIHx8XG4gICAgICB2YWx1ZSA9PSBudWxsIHx8IGlzU3ltYm9sKHZhbHVlKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHJldHVybiByZUlzUGxhaW5Qcm9wLnRlc3QodmFsdWUpIHx8ICFyZUlzRGVlcFByb3AudGVzdCh2YWx1ZSkgfHxcbiAgICAob2JqZWN0ICE9IG51bGwgJiYgdmFsdWUgaW4gT2JqZWN0KG9iamVjdCkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5O1xuXG59LHtcIi4vaXNBcnJheVwiOjc5LFwiLi9pc1N5bWJvbFwiOjkxfV0sNTM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBzdWl0YWJsZSBmb3IgdXNlIGFzIHVuaXF1ZSBvYmplY3Qga2V5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIHN1aXRhYmxlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzS2V5YWJsZSh2YWx1ZSkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiB2YWx1ZTtcbiAgcmV0dXJuICh0eXBlID09ICdzdHJpbmcnIHx8IHR5cGUgPT0gJ251bWJlcicgfHwgdHlwZSA9PSAnc3ltYm9sJyB8fCB0eXBlID09ICdib29sZWFuJylcbiAgICA/ICh2YWx1ZSAhPT0gJ19fcHJvdG9fXycpXG4gICAgOiAodmFsdWUgPT09IG51bGwpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzS2V5YWJsZTtcblxufSx7fV0sNTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGNvcmVKc0RhdGEgPSByZXF1aXJlKCcuL19jb3JlSnNEYXRhJyk7XG5cbi8qKiBVc2VkIHRvIGRldGVjdCBtZXRob2RzIG1hc3F1ZXJhZGluZyBhcyBuYXRpdmUuICovXG52YXIgbWFza1NyY0tleSA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHVpZCA9IC9bXi5dKyQvLmV4ZWMoY29yZUpzRGF0YSAmJiBjb3JlSnNEYXRhLmtleXMgJiYgY29yZUpzRGF0YS5rZXlzLklFX1BST1RPIHx8ICcnKTtcbiAgcmV0dXJuIHVpZCA/ICgnU3ltYm9sKHNyYylfMS4nICsgdWlkKSA6ICcnO1xufSgpKTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYGZ1bmNgIGhhcyBpdHMgc291cmNlIG1hc2tlZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYGZ1bmNgIGlzIG1hc2tlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc01hc2tlZChmdW5jKSB7XG4gIHJldHVybiAhIW1hc2tTcmNLZXkgJiYgKG1hc2tTcmNLZXkgaW4gZnVuYyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNNYXNrZWQ7XG5cbn0se1wiLi9fY29yZUpzRGF0YVwiOjM5fV0sNTU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBsaWtlbHkgYSBwcm90b3R5cGUgb2JqZWN0LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcHJvdG90eXBlLCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzUHJvdG90eXBlKHZhbHVlKSB7XG4gIHZhciBDdG9yID0gdmFsdWUgJiYgdmFsdWUuY29uc3RydWN0b3IsXG4gICAgICBwcm90byA9ICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IucHJvdG90eXBlKSB8fCBvYmplY3RQcm90bztcblxuICByZXR1cm4gdmFsdWUgPT09IHByb3RvO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUHJvdG90eXBlO1xuXG59LHt9XSw1NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIGxpc3QgY2FjaGUuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGNsZWFyXG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKi9cbmZ1bmN0aW9uIGxpc3RDYWNoZUNsZWFyKCkge1xuICB0aGlzLl9fZGF0YV9fID0gW107XG4gIHRoaXMuc2l6ZSA9IDA7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdENhY2hlQ2xlYXI7XG5cbn0se31dLDU3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIHNwbGljZSA9IGFycmF5UHJvdG8uc3BsaWNlO1xuXG4vKipcbiAqIFJlbW92ZXMgYGtleWAgYW5kIGl0cyB2YWx1ZSBmcm9tIHRoZSBsaXN0IGNhY2hlLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBkZWxldGVcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVEZWxldGUoa2V5KSB7XG4gIHZhciBkYXRhID0gdGhpcy5fX2RhdGFfXyxcbiAgICAgIGluZGV4ID0gYXNzb2NJbmRleE9mKGRhdGEsIGtleSk7XG5cbiAgaWYgKGluZGV4IDwgMCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gZGF0YS5sZW5ndGggLSAxO1xuICBpZiAoaW5kZXggPT0gbGFzdEluZGV4KSB7XG4gICAgZGF0YS5wb3AoKTtcbiAgfSBlbHNlIHtcbiAgICBzcGxpY2UuY2FsbChkYXRhLCBpbmRleCwgMSk7XG4gIH1cbiAgLS10aGlzLnNpemU7XG4gIHJldHVybiB0cnVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZURlbGV0ZTtcblxufSx7XCIuL19hc3NvY0luZGV4T2ZcIjoyOH1dLDU4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBHZXRzIHRoZSBsaXN0IGNhY2hlIHZhbHVlIGZvciBga2V5YC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZ2V0XG4gKiBAbWVtYmVyT2YgTGlzdENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbGlzdENhY2hlR2V0KGtleSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIHJldHVybiBpbmRleCA8IDAgPyB1bmRlZmluZWQgOiBkYXRhW2luZGV4XVsxXTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBsaXN0Q2FjaGVHZXQ7XG5cbn0se1wiLi9fYXNzb2NJbmRleE9mXCI6Mjh9XSw1OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgYXNzb2NJbmRleE9mID0gcmVxdWlyZSgnLi9fYXNzb2NJbmRleE9mJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbGlzdCBjYWNoZSB2YWx1ZSBmb3IgYGtleWAgZXhpc3RzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAbmFtZSBoYXNcbiAqIEBtZW1iZXJPZiBMaXN0Q2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgZW50cnkgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYW4gZW50cnkgZm9yIGBrZXlgIGV4aXN0cywgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBhc3NvY0luZGV4T2YodGhpcy5fX2RhdGFfXywga2V5KSA+IC0xO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZUhhcztcblxufSx7XCIuL19hc3NvY0luZGV4T2ZcIjoyOH1dLDYwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBhc3NvY0luZGV4T2YgPSByZXF1aXJlKCcuL19hc3NvY0luZGV4T2YnKTtcblxuLyoqXG4gKiBTZXRzIHRoZSBsaXN0IGNhY2hlIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIExpc3RDYWNoZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleSBUaGUga2V5IG9mIHRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBzZXQuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBSZXR1cm5zIHRoZSBsaXN0IGNhY2hlIGluc3RhbmNlLlxuICovXG5mdW5jdGlvbiBsaXN0Q2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IHRoaXMuX19kYXRhX18sXG4gICAgICBpbmRleCA9IGFzc29jSW5kZXhPZihkYXRhLCBrZXkpO1xuXG4gIGlmIChpbmRleCA8IDApIHtcbiAgICArK3RoaXMuc2l6ZTtcbiAgICBkYXRhLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfSBlbHNlIHtcbiAgICBkYXRhW2luZGV4XVsxXSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpc3RDYWNoZVNldDtcblxufSx7XCIuL19hc3NvY0luZGV4T2ZcIjoyOH1dLDYxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBIYXNoID0gcmVxdWlyZSgnLi9fSGFzaCcpLFxuICAgIExpc3RDYWNoZSA9IHJlcXVpcmUoJy4vX0xpc3RDYWNoZScpLFxuICAgIE1hcCA9IHJlcXVpcmUoJy4vX01hcCcpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGtleS12YWx1ZSBlbnRyaWVzIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgY2xlYXJcbiAqIEBtZW1iZXJPZiBNYXBDYWNoZVxuICovXG5mdW5jdGlvbiBtYXBDYWNoZUNsZWFyKCkge1xuICB0aGlzLnNpemUgPSAwO1xuICB0aGlzLl9fZGF0YV9fID0ge1xuICAgICdoYXNoJzogbmV3IEhhc2gsXG4gICAgJ21hcCc6IG5ldyAoTWFwIHx8IExpc3RDYWNoZSksXG4gICAgJ3N0cmluZyc6IG5ldyBIYXNoXG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVDbGVhcjtcblxufSx7XCIuL19IYXNoXCI6MjEsXCIuL19MaXN0Q2FjaGVcIjoyMixcIi4vX01hcFwiOjIzfV0sNjI6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogUmVtb3ZlcyBga2V5YCBhbmQgaXRzIHZhbHVlIGZyb20gdGhlIG1hcC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQG5hbWUgZGVsZXRlXG4gKiBAbWVtYmVyT2YgTWFwQ2FjaGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXkgVGhlIGtleSBvZiB0aGUgdmFsdWUgdG8gcmVtb3ZlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBlbnRyeSB3YXMgcmVtb3ZlZCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBtYXBDYWNoZURlbGV0ZShrZXkpIHtcbiAgdmFyIHJlc3VsdCA9IGdldE1hcERhdGEodGhpcywga2V5KVsnZGVsZXRlJ10oa2V5KTtcbiAgdGhpcy5zaXplIC09IHJlc3VsdCA/IDEgOiAwO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG1hcENhY2hlRGVsZXRlO1xuXG59LHtcIi4vX2dldE1hcERhdGFcIjo0MX1dLDYzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBnZXRNYXBEYXRhID0gcmVxdWlyZSgnLi9fZ2V0TWFwRGF0YScpO1xuXG4vKipcbiAqIEdldHMgdGhlIG1hcCB2YWx1ZSBmb3IgYGtleWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGdldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIGdldC5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSBlbnRyeSB2YWx1ZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVHZXQoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuZ2V0KGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVHZXQ7XG5cbn0se1wiLi9fZ2V0TWFwRGF0YVwiOjQxfV0sNjQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgbWFwIHZhbHVlIGZvciBga2V5YCBleGlzdHMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIGhhc1xuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIGVudHJ5IHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGFuIGVudHJ5IGZvciBga2V5YCBleGlzdHMsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVIYXMoa2V5KSB7XG4gIHJldHVybiBnZXRNYXBEYXRhKHRoaXMsIGtleSkuaGFzKGtleSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWFwQ2FjaGVIYXM7XG5cbn0se1wiLi9fZ2V0TWFwRGF0YVwiOjQxfV0sNjU6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGdldE1hcERhdGEgPSByZXF1aXJlKCcuL19nZXRNYXBEYXRhJyk7XG5cbi8qKlxuICogU2V0cyB0aGUgbWFwIGBrZXlgIHRvIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBuYW1lIHNldFxuICogQG1lbWJlck9mIE1hcENhY2hlXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5IFRoZSBrZXkgb2YgdGhlIHZhbHVlIHRvIHNldC5cbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHNldC5cbiAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIG1hcCBjYWNoZSBpbnN0YW5jZS5cbiAqL1xuZnVuY3Rpb24gbWFwQ2FjaGVTZXQoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGF0YSA9IGdldE1hcERhdGEodGhpcywga2V5KSxcbiAgICAgIHNpemUgPSBkYXRhLnNpemU7XG5cbiAgZGF0YS5zZXQoa2V5LCB2YWx1ZSk7XG4gIHRoaXMuc2l6ZSArPSBkYXRhLnNpemUgPT0gc2l6ZSA/IDAgOiAxO1xuICByZXR1cm4gdGhpcztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBtYXBDYWNoZVNldDtcblxufSx7XCIuL19nZXRNYXBEYXRhXCI6NDF9XSw2NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgbWVtb2l6ZSA9IHJlcXVpcmUoJy4vbWVtb2l6ZScpO1xuXG4vKiogVXNlZCBhcyB0aGUgbWF4aW11bSBtZW1vaXplIGNhY2hlIHNpemUuICovXG52YXIgTUFYX01FTU9JWkVfU0laRSA9IDUwMDtcblxuLyoqXG4gKiBBIHNwZWNpYWxpemVkIHZlcnNpb24gb2YgYF8ubWVtb2l6ZWAgd2hpY2ggY2xlYXJzIHRoZSBtZW1vaXplZCBmdW5jdGlvbidzXG4gKiBjYWNoZSB3aGVuIGl0IGV4Y2VlZHMgYE1BWF9NRU1PSVpFX1NJWkVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIFRoZSBmdW5jdGlvbiB0byBoYXZlIGl0cyBvdXRwdXQgbWVtb2l6ZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IFJldHVybnMgdGhlIG5ldyBtZW1vaXplZCBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbWVtb2l6ZUNhcHBlZChmdW5jKSB7XG4gIHZhciByZXN1bHQgPSBtZW1vaXplKGZ1bmMsIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmIChjYWNoZS5zaXplID09PSBNQVhfTUVNT0laRV9TSVpFKSB7XG4gICAgICBjYWNoZS5jbGVhcigpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5O1xuICB9KTtcblxuICB2YXIgY2FjaGUgPSByZXN1bHQuY2FjaGU7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbWVtb2l6ZUNhcHBlZDtcblxufSx7XCIuL21lbW9pemVcIjo5NH1dLDY3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBnZXROYXRpdmUgPSByZXF1aXJlKCcuL19nZXROYXRpdmUnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgdGhhdCBhcmUgdmVyaWZpZWQgdG8gYmUgbmF0aXZlLiAqL1xudmFyIG5hdGl2ZUNyZWF0ZSA9IGdldE5hdGl2ZShPYmplY3QsICdjcmVhdGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBuYXRpdmVDcmVhdGU7XG5cbn0se1wiLi9fZ2V0TmF0aXZlXCI6NDJ9XSw2ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgb3ZlckFyZyA9IHJlcXVpcmUoJy4vX292ZXJBcmcnKTtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUtleXMgPSBvdmVyQXJnKE9iamVjdC5rZXlzLCBPYmplY3QpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5hdGl2ZUtleXM7XG5cbn0se1wiLi9fb3ZlckFyZ1wiOjcxfV0sNjk6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIGZyZWVHbG9iYWwgPSByZXF1aXJlKCcuL19mcmVlR2xvYmFsJyk7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgZXhwb3J0c2AuICovXG52YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmICFleHBvcnRzLm5vZGVUeXBlICYmIGV4cG9ydHM7XG5cbi8qKiBEZXRlY3QgZnJlZSB2YXJpYWJsZSBgbW9kdWxlYC4gKi9cbnZhciBmcmVlTW9kdWxlID0gZnJlZUV4cG9ydHMgJiYgdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiBtb2R1bGU7XG5cbi8qKiBEZXRlY3QgdGhlIHBvcHVsYXIgQ29tbW9uSlMgZXh0ZW5zaW9uIGBtb2R1bGUuZXhwb3J0c2AuICovXG52YXIgbW9kdWxlRXhwb3J0cyA9IGZyZWVNb2R1bGUgJiYgZnJlZU1vZHVsZS5leHBvcnRzID09PSBmcmVlRXhwb3J0cztcblxuLyoqIERldGVjdCBmcmVlIHZhcmlhYmxlIGBwcm9jZXNzYCBmcm9tIE5vZGUuanMuICovXG52YXIgZnJlZVByb2Nlc3MgPSBtb2R1bGVFeHBvcnRzICYmIGZyZWVHbG9iYWwucHJvY2VzcztcblxuLyoqIFVzZWQgdG8gYWNjZXNzIGZhc3RlciBOb2RlLmpzIGhlbHBlcnMuICovXG52YXIgbm9kZVV0aWwgPSAoZnVuY3Rpb24oKSB7XG4gIHRyeSB7XG4gICAgLy8gVXNlIGB1dGlsLnR5cGVzYCBmb3IgTm9kZS5qcyAxMCsuXG4gICAgdmFyIHR5cGVzID0gZnJlZU1vZHVsZSAmJiBmcmVlTW9kdWxlLnJlcXVpcmUgJiYgZnJlZU1vZHVsZS5yZXF1aXJlKCd1dGlsJykudHlwZXM7XG5cbiAgICBpZiAodHlwZXMpIHtcbiAgICAgIHJldHVybiB0eXBlcztcbiAgICB9XG5cbiAgICAvLyBMZWdhY3kgYHByb2Nlc3MuYmluZGluZygndXRpbCcpYCBmb3IgTm9kZS5qcyA8IDEwLlxuICAgIHJldHVybiBmcmVlUHJvY2VzcyAmJiBmcmVlUHJvY2Vzcy5iaW5kaW5nICYmIGZyZWVQcm9jZXNzLmJpbmRpbmcoJ3V0aWwnKTtcbiAgfSBjYXRjaCAoZSkge31cbn0oKSk7XG5cbm1vZHVsZS5leHBvcnRzID0gbm9kZVV0aWw7XG5cbn0se1wiLi9fZnJlZUdsb2JhbFwiOjQwfV0sNzA6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNy4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG5hdGl2ZU9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyB1c2luZyBgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ2AuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlT2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gb2JqZWN0VG9TdHJpbmc7XG5cbn0se31dLDcxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogQ3JlYXRlcyBhIHVuYXJ5IGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBgZnVuY2Agd2l0aCBpdHMgYXJndW1lbnQgdHJhbnNmb3JtZWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmMgVGhlIGZ1bmN0aW9uIHRvIHdyYXAuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSB0cmFuc2Zvcm0gVGhlIGFyZ3VtZW50IHRyYW5zZm9ybS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gUmV0dXJucyB0aGUgbmV3IGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBvdmVyQXJnKGZ1bmMsIHRyYW5zZm9ybSkge1xuICByZXR1cm4gZnVuY3Rpb24oYXJnKSB7XG4gICAgcmV0dXJuIGZ1bmModHJhbnNmb3JtKGFyZykpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG92ZXJBcmc7XG5cbn0se31dLDcyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBmcmVlR2xvYmFsID0gcmVxdWlyZSgnLi9fZnJlZUdsb2JhbCcpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYHNlbGZgLiAqL1xudmFyIGZyZWVTZWxmID0gdHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZiAmJiBzZWxmLk9iamVjdCA9PT0gT2JqZWN0ICYmIHNlbGY7XG5cbi8qKiBVc2VkIGFzIGEgcmVmZXJlbmNlIHRvIHRoZSBnbG9iYWwgb2JqZWN0LiAqL1xudmFyIHJvb3QgPSBmcmVlR2xvYmFsIHx8IGZyZWVTZWxmIHx8IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gcm9vdDtcblxufSx7XCIuL19mcmVlR2xvYmFsXCI6NDB9XSw3MzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgbWVtb2l6ZUNhcHBlZCA9IHJlcXVpcmUoJy4vX21lbW9pemVDYXBwZWQnKTtcblxuLyoqIFVzZWQgdG8gbWF0Y2ggcHJvcGVydHkgbmFtZXMgd2l0aGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlUHJvcE5hbWUgPSAvW14uW1xcXV0rfFxcWyg/OigtP1xcZCsoPzpcXC5cXGQrKT8pfChbXCInXSkoKD86KD8hXFwyKVteXFxcXF18XFxcXC4pKj8pXFwyKVxcXXwoPz0oPzpcXC58XFxbXFxdKSg/OlxcLnxcXFtcXF18JCkpL2c7XG5cbi8qKiBVc2VkIHRvIG1hdGNoIGJhY2tzbGFzaGVzIGluIHByb3BlcnR5IHBhdGhzLiAqL1xudmFyIHJlRXNjYXBlQ2hhciA9IC9cXFxcKFxcXFwpPy9nO1xuXG4vKipcbiAqIENvbnZlcnRzIGBzdHJpbmdgIHRvIGEgcHJvcGVydHkgcGF0aCBhcnJheS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyBUaGUgc3RyaW5nIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIHByb3BlcnR5IHBhdGggYXJyYXkuXG4gKi9cbnZhciBzdHJpbmdUb1BhdGggPSBtZW1vaXplQ2FwcGVkKGZ1bmN0aW9uKHN0cmluZykge1xuICB2YXIgcmVzdWx0ID0gW107XG4gIGlmIChzdHJpbmcuY2hhckNvZGVBdCgwKSA9PT0gNDYgLyogLiAqLykge1xuICAgIHJlc3VsdC5wdXNoKCcnKTtcbiAgfVxuICBzdHJpbmcucmVwbGFjZShyZVByb3BOYW1lLCBmdW5jdGlvbihtYXRjaCwgbnVtYmVyLCBxdW90ZSwgc3ViU3RyaW5nKSB7XG4gICAgcmVzdWx0LnB1c2gocXVvdGUgPyBzdWJTdHJpbmcucmVwbGFjZShyZUVzY2FwZUNoYXIsICckMScpIDogKG51bWJlciB8fCBtYXRjaCkpO1xuICB9KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0cmluZ1RvUGF0aDtcblxufSx7XCIuL19tZW1vaXplQ2FwcGVkXCI6NjZ9XSw3NDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaXNTeW1ib2wgPSByZXF1aXJlKCcuL2lzU3ltYm9sJyk7XG5cbi8qKiBVc2VkIGFzIHJlZmVyZW5jZXMgZm9yIHZhcmlvdXMgYE51bWJlcmAgY29uc3RhbnRzLiAqL1xudmFyIElORklOSVRZID0gMSAvIDA7XG5cbi8qKlxuICogQ29udmVydHMgYHZhbHVlYCB0byBhIHN0cmluZyBrZXkgaWYgaXQncyBub3QgYSBzdHJpbmcgb3Igc3ltYm9sLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBpbnNwZWN0LlxuICogQHJldHVybnMge3N0cmluZ3xzeW1ib2x9IFJldHVybnMgdGhlIGtleS5cbiAqL1xuZnVuY3Rpb24gdG9LZXkodmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnc3RyaW5nJyB8fCBpc1N5bWJvbCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgdmFyIHJlc3VsdCA9ICh2YWx1ZSArICcnKTtcbiAgcmV0dXJuIChyZXN1bHQgPT0gJzAnICYmICgxIC8gdmFsdWUpID09IC1JTkZJTklUWSkgPyAnLTAnIDogcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvS2V5O1xuXG59LHtcIi4vaXNTeW1ib2xcIjo5MX1dLDc1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBmdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ29udmVydHMgYGZ1bmNgIHRvIGl0cyBzb3VyY2UgY29kZS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtzdHJpbmd9IFJldHVybnMgdGhlIHNvdXJjZSBjb2RlLlxuICovXG5mdW5jdGlvbiB0b1NvdXJjZShmdW5jKSB7XG4gIGlmIChmdW5jICE9IG51bGwpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIGZ1bmNUb1N0cmluZy5jYWxsKGZ1bmMpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiAoZnVuYyArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiAnJztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB0b1NvdXJjZTtcblxufSx7fV0sNzY6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBQZXJmb3JtcyBhXG4gKiBbYFNhbWVWYWx1ZVplcm9gXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1zYW1ldmFsdWV6ZXJvKVxuICogY29tcGFyaXNvbiBiZXR3ZWVuIHR3byB2YWx1ZXMgdG8gZGV0ZXJtaW5lIGlmIHRoZXkgYXJlIGVxdWl2YWxlbnQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0geyp9IG90aGVyIFRoZSBvdGhlciB2YWx1ZSB0byBjb21wYXJlLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiAxIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdhJzogMSB9O1xuICpcbiAqIF8uZXEob2JqZWN0LCBvYmplY3QpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEob2JqZWN0LCBvdGhlcik7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoJ2EnLCAnYScpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uZXEoJ2EnLCBPYmplY3QoJ2EnKSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uZXEoTmFOLCBOYU4pO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBlcSh2YWx1ZSwgb3RoZXIpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBvdGhlciB8fCAodmFsdWUgIT09IHZhbHVlICYmIG90aGVyICE9PSBvdGhlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZXE7XG5cbn0se31dLDc3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0ID0gcmVxdWlyZSgnLi9fYmFzZUdldCcpO1xuXG4vKipcbiAqIEdldHMgdGhlIHZhbHVlIGF0IGBwYXRoYCBvZiBgb2JqZWN0YC4gSWYgdGhlIHJlc29sdmVkIHZhbHVlIGlzXG4gKiBgdW5kZWZpbmVkYCwgdGhlIGBkZWZhdWx0VmFsdWVgIGlzIHJldHVybmVkIGluIGl0cyBwbGFjZS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuNy4wXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcGFyYW0ge0FycmF5fHN0cmluZ30gcGF0aCBUaGUgcGF0aCBvZiB0aGUgcHJvcGVydHkgdG8gZ2V0LlxuICogQHBhcmFtIHsqfSBbZGVmYXVsdFZhbHVlXSBUaGUgdmFsdWUgcmV0dXJuZWQgZm9yIGB1bmRlZmluZWRgIHJlc29sdmVkIHZhbHVlcy5cbiAqIEByZXR1cm5zIHsqfSBSZXR1cm5zIHRoZSByZXNvbHZlZCB2YWx1ZS5cbiAqIEBleGFtcGxlXG4gKlxuICogdmFyIG9iamVjdCA9IHsgJ2EnOiBbeyAnYic6IHsgJ2MnOiAzIH0gfV0gfTtcbiAqXG4gKiBfLmdldChvYmplY3QsICdhWzBdLmIuYycpO1xuICogLy8gPT4gM1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgWydhJywgJzAnLCAnYicsICdjJ10pO1xuICogLy8gPT4gM1xuICpcbiAqIF8uZ2V0KG9iamVjdCwgJ2EuYi5jJywgJ2RlZmF1bHQnKTtcbiAqIC8vID0+ICdkZWZhdWx0J1xuICovXG5mdW5jdGlvbiBnZXQob2JqZWN0LCBwYXRoLCBkZWZhdWx0VmFsdWUpIHtcbiAgdmFyIHJlc3VsdCA9IG9iamVjdCA9PSBudWxsID8gdW5kZWZpbmVkIDogYmFzZUdldChvYmplY3QsIHBhdGgpO1xuICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsdWUgOiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0O1xuXG59LHtcIi4vX2Jhc2VHZXRcIjoyOX1dLDc4OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlSXNBcmd1bWVudHMgPSByZXF1aXJlKCcuL19iYXNlSXNBcmd1bWVudHMnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogQnVpbHQtaW4gdmFsdWUgcmVmZXJlbmNlcy4gKi9cbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZSA9IG9iamVjdFByb3RvLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGxpa2VseSBhbiBgYXJndW1lbnRzYCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYGFyZ3VtZW50c2Agb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FyZ3VtZW50cyhmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3VtZW50czsgfSgpKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJndW1lbnRzKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNBcmd1bWVudHMgPSBiYXNlSXNBcmd1bWVudHMoZnVuY3Rpb24oKSB7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPyBiYXNlSXNBcmd1bWVudHMgOiBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gaXNPYmplY3RMaWtlKHZhbHVlKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCAnY2FsbGVlJykgJiZcbiAgICAhcHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh2YWx1ZSwgJ2NhbGxlZScpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FyZ3VtZW50cztcblxufSx7XCIuL19iYXNlSXNBcmd1bWVudHNcIjozMSxcIi4vaXNPYmplY3RMaWtlXCI6ODh9XSw3OTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYW4gYEFycmF5YCBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gYXJyYXksIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0FycmF5KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5KGRvY3VtZW50LmJvZHkuY2hpbGRyZW4pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzQXJyYXkoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5O1xuXG59LHt9XSw4MDpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgaXNGdW5jdGlvbiA9IHJlcXVpcmUoJy4vaXNGdW5jdGlvbicpLFxuICAgIGlzTGVuZ3RoID0gcmVxdWlyZSgnLi9pc0xlbmd0aCcpO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGFycmF5LWxpa2UuIEEgdmFsdWUgaXMgY29uc2lkZXJlZCBhcnJheS1saWtlIGlmIGl0J3NcbiAqIG5vdCBhIGZ1bmN0aW9uIGFuZCBoYXMgYSBgdmFsdWUubGVuZ3RoYCB0aGF0J3MgYW4gaW50ZWdlciBncmVhdGVyIHRoYW4gb3JcbiAqIGVxdWFsIHRvIGAwYCBhbmQgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYXJyYXktbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0FycmF5TGlrZShkb2N1bWVudC5ib2R5LmNoaWxkcmVuKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKCdhYmMnKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQXJyYXlMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0FycmF5TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiBpc0xlbmd0aCh2YWx1ZS5sZW5ndGgpICYmICFpc0Z1bmN0aW9uKHZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0FycmF5TGlrZTtcblxufSx7XCIuL2lzRnVuY3Rpb25cIjo4MyxcIi4vaXNMZW5ndGhcIjo4NH1dLDgxOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBib29sVGFnID0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSBib29sZWFuIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBib29sZWFuLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCb29sZWFuKGZhbHNlKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzQm9vbGVhbihudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzQm9vbGVhbih2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPT09IHRydWUgfHwgdmFsdWUgPT09IGZhbHNlIHx8XG4gICAgKGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gYm9vbFRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNCb29sZWFuO1xuXG59LHtcIi4vX2Jhc2VHZXRUYWdcIjozMCxcIi4vaXNPYmplY3RMaWtlXCI6ODh9XSw4MjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgcm9vdCA9IHJlcXVpcmUoJy4vX3Jvb3QnKSxcbiAgICBzdHViRmFsc2UgPSByZXF1aXJlKCcuL3N0dWJGYWxzZScpO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYGV4cG9ydHNgLiAqL1xudmFyIGZyZWVFeHBvcnRzID0gdHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcgJiYgZXhwb3J0cyAmJiAhZXhwb3J0cy5ub2RlVHlwZSAmJiBleHBvcnRzO1xuXG4vKiogRGV0ZWN0IGZyZWUgdmFyaWFibGUgYG1vZHVsZWAuICovXG52YXIgZnJlZU1vZHVsZSA9IGZyZWVFeHBvcnRzICYmIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlICYmICFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXG4vKiogRGV0ZWN0IHRoZSBwb3B1bGFyIENvbW1vbkpTIGV4dGVuc2lvbiBgbW9kdWxlLmV4cG9ydHNgLiAqL1xudmFyIG1vZHVsZUV4cG9ydHMgPSBmcmVlTW9kdWxlICYmIGZyZWVNb2R1bGUuZXhwb3J0cyA9PT0gZnJlZUV4cG9ydHM7XG5cbi8qKiBCdWlsdC1pbiB2YWx1ZSByZWZlcmVuY2VzLiAqL1xudmFyIEJ1ZmZlciA9IG1vZHVsZUV4cG9ydHMgPyByb290LkJ1ZmZlciA6IHVuZGVmaW5lZDtcblxuLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUlzQnVmZmVyID0gQnVmZmVyID8gQnVmZmVyLmlzQnVmZmVyIDogdW5kZWZpbmVkO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4zLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgYnVmZmVyLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNCdWZmZXIobmV3IEJ1ZmZlcigyKSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc0J1ZmZlcihuZXcgVWludDhBcnJheSgyKSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNCdWZmZXIgPSBuYXRpdmVJc0J1ZmZlciB8fCBzdHViRmFsc2U7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNCdWZmZXI7XG5cbn0se1wiLi9fcm9vdFwiOjcyLFwiLi9zdHViRmFsc2VcIjo5NX1dLDgzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9pc09iamVjdCcpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgYXN5bmNUYWcgPSAnW29iamVjdCBBc3luY0Z1bmN0aW9uXScsXG4gICAgZnVuY1RhZyA9ICdbb2JqZWN0IEZ1bmN0aW9uXScsXG4gICAgZ2VuVGFnID0gJ1tvYmplY3QgR2VuZXJhdG9yRnVuY3Rpb25dJyxcbiAgICBwcm94eVRhZyA9ICdbb2JqZWN0IFByb3h5XSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBGdW5jdGlvbmAgb2JqZWN0LlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgZnVuY3Rpb24sIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc0Z1bmN0aW9uKF8pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNGdW5jdGlvbigvYWJjLyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIFRoZSB1c2Ugb2YgYE9iamVjdCN0b1N0cmluZ2AgYXZvaWRzIGlzc3VlcyB3aXRoIHRoZSBgdHlwZW9mYCBvcGVyYXRvclxuICAvLyBpbiBTYWZhcmkgOSB3aGljaCByZXR1cm5zICdvYmplY3QnIGZvciB0eXBlZCBhcnJheXMgYW5kIG90aGVyIGNvbnN0cnVjdG9ycy5cbiAgdmFyIHRhZyA9IGJhc2VHZXRUYWcodmFsdWUpO1xuICByZXR1cm4gdGFnID09IGZ1bmNUYWcgfHwgdGFnID09IGdlblRhZyB8fCB0YWcgPT0gYXN5bmNUYWcgfHwgdGFnID09IHByb3h5VGFnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRnVuY3Rpb247XG5cbn0se1wiLi9fYmFzZUdldFRhZ1wiOjMwLFwiLi9pc09iamVjdFwiOjg3fV0sODQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqIFVzZWQgYXMgcmVmZXJlbmNlcyBmb3IgdmFyaW91cyBgTnVtYmVyYCBjb25zdGFudHMuICovXG52YXIgTUFYX1NBRkVfSU5URUdFUiA9IDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSB2YWxpZCBhcnJheS1saWtlIGxlbmd0aC5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBtZXRob2QgaXMgbG9vc2VseSBiYXNlZCBvblxuICogW2BUb0xlbmd0aGBdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLXRvbGVuZ3RoKS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHZhbGlkIGxlbmd0aCwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTGVuZ3RoKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNMZW5ndGgoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNMZW5ndGgoSW5maW5pdHkpO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzTGVuZ3RoKCczJyk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc0xlbmd0aCh2YWx1ZSkge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09ICdudW1iZXInICYmXG4gICAgdmFsdWUgPiAtMSAmJiB2YWx1ZSAlIDEgPT0gMCAmJiB2YWx1ZSA8PSBNQVhfU0FGRV9JTlRFR0VSO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTGVuZ3RoO1xuXG59LHt9XSw4NTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGBudWxsYCBvciBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBudWxsaXNoLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNOaWwobnVsbCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc05pbCh2b2lkIDApO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOaWwoTmFOKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzTmlsKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzTmlsO1xuXG59LHt9XSw4NjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgbnVtYmVyVGFnID0gJ1tvYmplY3QgTnVtYmVyXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBOdW1iZXJgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogKipOb3RlOioqIFRvIGV4Y2x1ZGUgYEluZmluaXR5YCwgYC1JbmZpbml0eWAsIGFuZCBgTmFOYCwgd2hpY2ggYXJlXG4gKiBjbGFzc2lmaWVkIGFzIG51bWJlcnMsIHVzZSB0aGUgYF8uaXNGaW5pdGVgIG1ldGhvZC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuMS4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIG51bWJlciwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzTnVtYmVyKDMpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNOdW1iZXIoTnVtYmVyLk1JTl9WQUxVRSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc051bWJlcihJbmZpbml0eSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc051bWJlcignMycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNOdW1iZXIodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnbnVtYmVyJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IG51bWJlclRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNOdW1iZXI7XG5cbn0se1wiLi9fYmFzZUdldFRhZ1wiOjMwLFwiLi9pc09iamVjdExpa2VcIjo4OH1dLDg3OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgdGhlXG4gKiBbbGFuZ3VhZ2UgdHlwZV0oaHR0cDovL3d3dy5lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMpXG4gKiBvZiBgT2JqZWN0YC4gKGUuZy4gYXJyYXlzLCBmdW5jdGlvbnMsIG9iamVjdHMsIHJlZ2V4ZXMsIGBuZXcgTnVtYmVyKDApYCwgYW5kIGBuZXcgU3RyaW5nKCcnKWApXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjEuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3Qoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0KF8ubm9vcCk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdChudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbHVlKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIHZhbHVlO1xuICByZXR1cm4gdmFsdWUgIT0gbnVsbCAmJiAodHlwZSA9PSAnb2JqZWN0JyB8fCB0eXBlID09ICdmdW5jdGlvbicpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0O1xuXG59LHt9XSw4ODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG5cbn0se31dLDg5OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIGZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZSxcbiAgICBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBmdW5jUHJvdG8udG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHwgYmFzZUdldFRhZyh2YWx1ZSkgIT0gb2JqZWN0VGFnKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiB0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmXG4gICAgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuXG59LHtcIi4vX2Jhc2VHZXRUYWdcIjozMCxcIi4vX2dldFByb3RvdHlwZVwiOjQzLFwiLi9pc09iamVjdExpa2VcIjo4OH1dLDkwOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlR2V0VGFnID0gcmVxdWlyZSgnLi9fYmFzZUdldFRhZycpLFxuICAgIGlzQXJyYXkgPSByZXF1aXJlKCcuL2lzQXJyYXknKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3RyaW5nVGFnID0gJ1tvYmplY3QgU3RyaW5nXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTdHJpbmdgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQHNpbmNlIDAuMS4wXG4gKiBAbWVtYmVyT2YgX1xuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzdHJpbmcsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N0cmluZygnYWJjJyk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1N0cmluZygxKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gJ3N0cmluZycgfHxcbiAgICAoIWlzQXJyYXkodmFsdWUpICYmIGlzT2JqZWN0TGlrZSh2YWx1ZSkgJiYgYmFzZUdldFRhZyh2YWx1ZSkgPT0gc3RyaW5nVGFnKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1N0cmluZztcblxufSx7XCIuL19iYXNlR2V0VGFnXCI6MzAsXCIuL2lzQXJyYXlcIjo3OSxcIi4vaXNPYmplY3RMaWtlXCI6ODh9XSw5MTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgYmFzZUdldFRhZyA9IHJlcXVpcmUoJy4vX2Jhc2VHZXRUYWcnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgc3ltYm9sVGFnID0gJ1tvYmplY3QgU3ltYm9sXSc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgY2xhc3NpZmllZCBhcyBhIGBTeW1ib2xgIHByaW1pdGl2ZSBvciBvYmplY3QuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBzeW1ib2wsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc1N5bWJvbChTeW1ib2wuaXRlcmF0b3IpO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNTeW1ib2woJ2FiYycpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNTeW1ib2wodmFsdWUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PSAnc3ltYm9sJyB8fFxuICAgIChpc09iamVjdExpa2UodmFsdWUpICYmIGJhc2VHZXRUYWcodmFsdWUpID09IHN5bWJvbFRhZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTeW1ib2w7XG5cbn0se1wiLi9fYmFzZUdldFRhZ1wiOjMwLFwiLi9pc09iamVjdExpa2VcIjo4OH1dLDkyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlSXNUeXBlZEFycmF5ID0gcmVxdWlyZSgnLi9fYmFzZUlzVHlwZWRBcnJheScpLFxuICAgIGJhc2VVbmFyeSA9IHJlcXVpcmUoJy4vX2Jhc2VVbmFyeScpLFxuICAgIG5vZGVVdGlsID0gcmVxdWlyZSgnLi9fbm9kZVV0aWwnKTtcblxuLyogTm9kZS5qcyBoZWxwZXIgcmVmZXJlbmNlcy4gKi9cbnZhciBub2RlSXNUeXBlZEFycmF5ID0gbm9kZVV0aWwgJiYgbm9kZVV0aWwuaXNUeXBlZEFycmF5O1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGNsYXNzaWZpZWQgYXMgYSB0eXBlZCBhcnJheS5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDMuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHR5cGVkIGFycmF5LCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNUeXBlZEFycmF5KG5ldyBVaW50OEFycmF5KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzVHlwZWRBcnJheShbXSk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG52YXIgaXNUeXBlZEFycmF5ID0gbm9kZUlzVHlwZWRBcnJheSA/IGJhc2VVbmFyeShub2RlSXNUeXBlZEFycmF5KSA6IGJhc2VJc1R5cGVkQXJyYXk7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNUeXBlZEFycmF5O1xuXG59LHtcIi4vX2Jhc2VJc1R5cGVkQXJyYXlcIjozMyxcIi4vX2Jhc2VVbmFyeVwiOjM3LFwiLi9fbm9kZVV0aWxcIjo2OX1dLDkzOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBhcnJheUxpa2VLZXlzID0gcmVxdWlyZSgnLi9fYXJyYXlMaWtlS2V5cycpLFxuICAgIGJhc2VLZXlzID0gcmVxdWlyZSgnLi9fYmFzZUtleXMnKSxcbiAgICBpc0FycmF5TGlrZSA9IHJlcXVpcmUoJy4vaXNBcnJheUxpa2UnKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIHRoZSBvd24gZW51bWVyYWJsZSBwcm9wZXJ0eSBuYW1lcyBvZiBgb2JqZWN0YC5cbiAqXG4gKiAqKk5vdGU6KiogTm9uLW9iamVjdCB2YWx1ZXMgYXJlIGNvZXJjZWQgdG8gb2JqZWN0cy4gU2VlIHRoZVxuICogW0VTIHNwZWNdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzcuMC8jc2VjLW9iamVjdC5rZXlzKVxuICogZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAc3RhdGljXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBtZW1iZXJPZiBfXG4gKiBAY2F0ZWdvcnkgT2JqZWN0XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7QXJyYXl9IFJldHVybnMgdGhlIGFycmF5IG9mIHByb3BlcnR5IG5hbWVzLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiAgIHRoaXMuYiA9IDI7XG4gKiB9XG4gKlxuICogRm9vLnByb3RvdHlwZS5jID0gMztcbiAqXG4gKiBfLmtleXMobmV3IEZvbyk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddIChpdGVyYXRpb24gb3JkZXIgaXMgbm90IGd1YXJhbnRlZWQpXG4gKlxuICogXy5rZXlzKCdoaScpO1xuICogLy8gPT4gWycwJywgJzEnXVxuICovXG5mdW5jdGlvbiBrZXlzKG9iamVjdCkge1xuICByZXR1cm4gaXNBcnJheUxpa2Uob2JqZWN0KSA/IGFycmF5TGlrZUtleXMob2JqZWN0KSA6IGJhc2VLZXlzKG9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ga2V5cztcblxufSx7XCIuL19hcnJheUxpa2VLZXlzXCI6MjYsXCIuL19iYXNlS2V5c1wiOjM0LFwiLi9pc0FycmF5TGlrZVwiOjgwfV0sOTQ6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xudmFyIE1hcENhY2hlID0gcmVxdWlyZSgnLi9fTWFwQ2FjaGUnKTtcblxuLyoqIEVycm9yIG1lc3NhZ2UgY29uc3RhbnRzLiAqL1xudmFyIEZVTkNfRVJST1JfVEVYVCA9ICdFeHBlY3RlZCBhIGZ1bmN0aW9uJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgZnVuY3Rpb24gdGhhdCBtZW1vaXplcyB0aGUgcmVzdWx0IG9mIGBmdW5jYC4gSWYgYHJlc29sdmVyYCBpc1xuICogcHJvdmlkZWQsIGl0IGRldGVybWluZXMgdGhlIGNhY2hlIGtleSBmb3Igc3RvcmluZyB0aGUgcmVzdWx0IGJhc2VkIG9uIHRoZVxuICogYXJndW1lbnRzIHByb3ZpZGVkIHRvIHRoZSBtZW1vaXplZCBmdW5jdGlvbi4gQnkgZGVmYXVsdCwgdGhlIGZpcnN0IGFyZ3VtZW50XG4gKiBwcm92aWRlZCB0byB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgbWFwIGNhY2hlIGtleS4gVGhlIGBmdW5jYFxuICogaXMgaW52b2tlZCB3aXRoIHRoZSBgdGhpc2AgYmluZGluZyBvZiB0aGUgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKlxuICogKipOb3RlOioqIFRoZSBjYWNoZSBpcyBleHBvc2VkIGFzIHRoZSBgY2FjaGVgIHByb3BlcnR5IG9uIHRoZSBtZW1vaXplZFxuICogZnVuY3Rpb24uIEl0cyBjcmVhdGlvbiBtYXkgYmUgY3VzdG9taXplZCBieSByZXBsYWNpbmcgdGhlIGBfLm1lbW9pemUuQ2FjaGVgXG4gKiBjb25zdHJ1Y3RvciB3aXRoIG9uZSB3aG9zZSBpbnN0YW5jZXMgaW1wbGVtZW50IHRoZVxuICogW2BNYXBgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1wcm9wZXJ0aWVzLW9mLXRoZS1tYXAtcHJvdG90eXBlLW9iamVjdClcbiAqIG1ldGhvZCBpbnRlcmZhY2Ugb2YgYGNsZWFyYCwgYGRlbGV0ZWAsIGBnZXRgLCBgaGFzYCwgYW5kIGBzZXRgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC4xLjBcbiAqIEBjYXRlZ29yeSBGdW5jdGlvblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gaGF2ZSBpdHMgb3V0cHV0IG1lbW9pemVkLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gW3Jlc29sdmVyXSBUaGUgZnVuY3Rpb24gdG8gcmVzb2x2ZSB0aGUgY2FjaGUga2V5LlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgbWVtb2l6ZWQgZnVuY3Rpb24uXG4gKiBAZXhhbXBsZVxuICpcbiAqIHZhciBvYmplY3QgPSB7ICdhJzogMSwgJ2InOiAyIH07XG4gKiB2YXIgb3RoZXIgPSB7ICdjJzogMywgJ2QnOiA0IH07XG4gKlxuICogdmFyIHZhbHVlcyA9IF8ubWVtb2l6ZShfLnZhbHVlcyk7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIHZhbHVlcyhvdGhlcik7XG4gKiAvLyA9PiBbMywgNF1cbiAqXG4gKiBvYmplY3QuYSA9IDI7XG4gKiB2YWx1ZXMob2JqZWN0KTtcbiAqIC8vID0+IFsxLCAyXVxuICpcbiAqIC8vIE1vZGlmeSB0aGUgcmVzdWx0IGNhY2hlLlxuICogdmFsdWVzLmNhY2hlLnNldChvYmplY3QsIFsnYScsICdiJ10pO1xuICogdmFsdWVzKG9iamVjdCk7XG4gKiAvLyA9PiBbJ2EnLCAnYiddXG4gKlxuICogLy8gUmVwbGFjZSBgXy5tZW1vaXplLkNhY2hlYC5cbiAqIF8ubWVtb2l6ZS5DYWNoZSA9IFdlYWtNYXA7XG4gKi9cbmZ1bmN0aW9uIG1lbW9pemUoZnVuYywgcmVzb2x2ZXIpIHtcbiAgaWYgKHR5cGVvZiBmdW5jICE9ICdmdW5jdGlvbicgfHwgKHJlc29sdmVyICE9IG51bGwgJiYgdHlwZW9mIHJlc29sdmVyICE9ICdmdW5jdGlvbicpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihGVU5DX0VSUk9SX1RFWFQpO1xuICB9XG4gIHZhciBtZW1vaXplZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzLFxuICAgICAgICBrZXkgPSByZXNvbHZlciA/IHJlc29sdmVyLmFwcGx5KHRoaXMsIGFyZ3MpIDogYXJnc1swXSxcbiAgICAgICAgY2FjaGUgPSBtZW1vaXplZC5jYWNoZTtcblxuICAgIGlmIChjYWNoZS5oYXMoa2V5KSkge1xuICAgICAgcmV0dXJuIGNhY2hlLmdldChrZXkpO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICBtZW1vaXplZC5jYWNoZSA9IGNhY2hlLnNldChrZXksIHJlc3VsdCkgfHwgY2FjaGU7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbiAgbWVtb2l6ZWQuY2FjaGUgPSBuZXcgKG1lbW9pemUuQ2FjaGUgfHwgTWFwQ2FjaGUpO1xuICByZXR1cm4gbWVtb2l6ZWQ7XG59XG5cbi8vIEV4cG9zZSBgTWFwQ2FjaGVgLlxubWVtb2l6ZS5DYWNoZSA9IE1hcENhY2hlO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lbW9pemU7XG5cbn0se1wiLi9fTWFwQ2FjaGVcIjoyNH1dLDk1OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qKlxuICogVGhpcyBtZXRob2QgcmV0dXJucyBgZmFsc2VgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4xMy4wXG4gKiBAY2F0ZWdvcnkgVXRpbFxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy50aW1lcygyLCBfLnN0dWJGYWxzZSk7XG4gKiAvLyA9PiBbZmFsc2UsIGZhbHNlXVxuICovXG5mdW5jdGlvbiBzdHViRmFsc2UoKSB7XG4gIHJldHVybiBmYWxzZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHViRmFsc2U7XG5cbn0se31dLDk2OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbnZhciBiYXNlVG9TdHJpbmcgPSByZXF1aXJlKCcuL19iYXNlVG9TdHJpbmcnKTtcblxuLyoqXG4gKiBDb252ZXJ0cyBgdmFsdWVgIHRvIGEgc3RyaW5nLiBBbiBlbXB0eSBzdHJpbmcgaXMgcmV0dXJuZWQgZm9yIGBudWxsYFxuICogYW5kIGB1bmRlZmluZWRgIHZhbHVlcy4gVGhlIHNpZ24gb2YgYC0wYCBpcyBwcmVzZXJ2ZWQuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBjb252ZXJ0ZWQgc3RyaW5nLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLnRvU3RyaW5nKG51bGwpO1xuICogLy8gPT4gJydcbiAqXG4gKiBfLnRvU3RyaW5nKC0wKTtcbiAqIC8vID0+ICctMCdcbiAqXG4gKiBfLnRvU3RyaW5nKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiAnMSwyLDMnXG4gKi9cbmZ1bmN0aW9uIHRvU3RyaW5nKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9PSBudWxsID8gJycgOiBiYXNlVG9TdHJpbmcodmFsdWUpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHRvU3RyaW5nO1xuXG59LHtcIi4vX2Jhc2VUb1N0cmluZ1wiOjM2fV0sXCJhaXJ0YWJsZVwiOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xudmFyIGJhc2VfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9iYXNlXCIpKTtcbnZhciByZWNvcmRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9yZWNvcmRcIikpO1xudmFyIHRhYmxlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vdGFibGVcIikpO1xudmFyIGFpcnRhYmxlX2Vycm9yXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIi4vYWlydGFibGVfZXJyb3JcIikpO1xudmFyIEFpcnRhYmxlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEFpcnRhYmxlKG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHMgPT09IHZvaWQgMCkgeyBvcHRzID0ge307IH1cbiAgICAgICAgdmFyIGRlZmF1bHRDb25maWcgPSBBaXJ0YWJsZS5kZWZhdWx0X2NvbmZpZygpO1xuICAgICAgICB2YXIgYXBpVmVyc2lvbiA9IG9wdHMuYXBpVmVyc2lvbiB8fCBBaXJ0YWJsZS5hcGlWZXJzaW9uIHx8IGRlZmF1bHRDb25maWcuYXBpVmVyc2lvbjtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge1xuICAgICAgICAgICAgX2FwaUtleToge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRzLmFwaUtleSB8fCBBaXJ0YWJsZS5hcGlLZXkgfHwgZGVmYXVsdENvbmZpZy5hcGlLZXksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX2FwaVZlcnNpb246IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogYXBpVmVyc2lvbixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfYXBpVmVyc2lvbk1ham9yOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IGFwaVZlcnNpb24uc3BsaXQoJy4nKVswXSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfY3VzdG9tSGVhZGVyczoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRzLmN1c3RvbUhlYWRlcnMgfHwge30sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgX2VuZHBvaW50VXJsOiB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IG9wdHMuZW5kcG9pbnRVcmwgfHwgQWlydGFibGUuZW5kcG9pbnRVcmwgfHwgZGVmYXVsdENvbmZpZy5lbmRwb2ludFVybCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBfbm9SZXRyeUlmUmF0ZUxpbWl0ZWQ6IHtcbiAgICAgICAgICAgICAgICB2YWx1ZTogb3B0cy5ub1JldHJ5SWZSYXRlTGltaXRlZCB8fFxuICAgICAgICAgICAgICAgICAgICBBaXJ0YWJsZS5ub1JldHJ5SWZSYXRlTGltaXRlZCB8fFxuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0Q29uZmlnLm5vUmV0cnlJZlJhdGVMaW1pdGVkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9yZXF1ZXN0VGltZW91dDoge1xuICAgICAgICAgICAgICAgIHZhbHVlOiBvcHRzLnJlcXVlc3RUaW1lb3V0IHx8IEFpcnRhYmxlLnJlcXVlc3RUaW1lb3V0IHx8IGRlZmF1bHRDb25maWcucmVxdWVzdFRpbWVvdXQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCF0aGlzLl9hcGlLZXkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQW4gQVBJIGtleSBpcyByZXF1aXJlZCB0byBjb25uZWN0IHRvIEFpcnRhYmxlJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgQWlydGFibGUucHJvdG90eXBlLmJhc2UgPSBmdW5jdGlvbiAoYmFzZUlkKSB7XG4gICAgICAgIHJldHVybiBiYXNlXzEuZGVmYXVsdC5jcmVhdGVGdW5jdG9yKHRoaXMsIGJhc2VJZCk7XG4gICAgfTtcbiAgICBBaXJ0YWJsZS5kZWZhdWx0X2NvbmZpZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGVuZHBvaW50VXJsOiBcIlwiIHx8ICdodHRwczovL2FwaS5haXJ0YWJsZS5jb20nLFxuICAgICAgICAgICAgYXBpVmVyc2lvbjogJzAuMS4wJyxcbiAgICAgICAgICAgIGFwaUtleTogXCJcIixcbiAgICAgICAgICAgIG5vUmV0cnlJZlJhdGVMaW1pdGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHJlcXVlc3RUaW1lb3V0OiAzMDAgKiAxMDAwLFxuICAgICAgICB9O1xuICAgIH07XG4gICAgQWlydGFibGUuY29uZmlndXJlID0gZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgIHZhciBhcGlLZXkgPSBfYS5hcGlLZXksIGVuZHBvaW50VXJsID0gX2EuZW5kcG9pbnRVcmwsIGFwaVZlcnNpb24gPSBfYS5hcGlWZXJzaW9uLCBub1JldHJ5SWZSYXRlTGltaXRlZCA9IF9hLm5vUmV0cnlJZlJhdGVMaW1pdGVkLCByZXF1ZXN0VGltZW91dCA9IF9hLnJlcXVlc3RUaW1lb3V0O1xuICAgICAgICBBaXJ0YWJsZS5hcGlLZXkgPSBhcGlLZXk7XG4gICAgICAgIEFpcnRhYmxlLmVuZHBvaW50VXJsID0gZW5kcG9pbnRVcmw7XG4gICAgICAgIEFpcnRhYmxlLmFwaVZlcnNpb24gPSBhcGlWZXJzaW9uO1xuICAgICAgICBBaXJ0YWJsZS5ub1JldHJ5SWZSYXRlTGltaXRlZCA9IG5vUmV0cnlJZlJhdGVMaW1pdGVkO1xuICAgICAgICBBaXJ0YWJsZS5yZXF1ZXN0VGltZW91dCA9IHJlcXVlc3RUaW1lb3V0O1xuICAgIH07XG4gICAgQWlydGFibGUuYmFzZSA9IGZ1bmN0aW9uIChiYXNlSWQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBBaXJ0YWJsZSgpLmJhc2UoYmFzZUlkKTtcbiAgICB9O1xuICAgIEFpcnRhYmxlLkJhc2UgPSBiYXNlXzEuZGVmYXVsdDtcbiAgICBBaXJ0YWJsZS5SZWNvcmQgPSByZWNvcmRfMS5kZWZhdWx0O1xuICAgIEFpcnRhYmxlLlRhYmxlID0gdGFibGVfMS5kZWZhdWx0O1xuICAgIEFpcnRhYmxlLkVycm9yID0gYWlydGFibGVfZXJyb3JfMS5kZWZhdWx0O1xuICAgIHJldHVybiBBaXJ0YWJsZTtcbn0oKSk7XG5tb2R1bGUuZXhwb3J0cyA9IEFpcnRhYmxlO1xuXG59LHtcIi4vYWlydGFibGVfZXJyb3JcIjoyLFwiLi9iYXNlXCI6MyxcIi4vcmVjb3JkXCI6MTUsXCIuL3RhYmxlXCI6MTd9XX0se30sW1wiYWlydGFibGVcIl0pKFwiYWlydGFibGVcIilcbn0pO1xuIiwiaW1wb3J0IEFpcnRhYmxlIGZyb20gJ2FpcnRhYmxlJ1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgKCkgPT4ge1xuICBjb25zdCB0b2tlbiA9XG4gICAgJ3BhdGpDUnFMTU1VNjdUQURKLjM5ZTcwNjlhZmQyNWQxZjU0NmE5YjU1NDZhZjgwNWEzMWQ1MWUwZjA0MDZmYjc2N2NlZTYwYzU4NjY1OTY1NmEnXG5cbiAgQWlydGFibGUuY29uZmlndXJlKHtcbiAgICBlbmRwb2ludFVybDogJ2h0dHBzOi8vYXBpLmFpcnRhYmxlLmNvbScsXG4gICAgYXBpS2V5OiB0b2tlblxuICB9KVxuXG4gIGNvbnN0IGJhc2UgPSBBaXJ0YWJsZS5iYXNlKCdhcHAxMWF3SHdpbmZqNFpvVicpXG5cbiAgZ2V0Q2FyZFRlYXNlcnMoKS50aGVuKChjb250ZW50KSA9PiB7XG4gICAgY3JlYXRlUmVjaXBlc1RlYXNlcnNDYXJkcyhjb250ZW50KVxuICAgIGNyZWF0ZVJlY2lwZXNUZWFzZXJzQ2FyZHNNKGNvbnRlbnQpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZ2V0Q2FyZFRlYXNlcnMoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBbXVxuXG4gICAgICBiYXNlKCdSZWNlcGllcycpXG4gICAgICAgIC5zZWxlY3Qoe1xuICAgICAgICAgIG1heFJlY29yZHM6IDIwLFxuICAgICAgICAgIHNvcnQ6IFt7IGZpZWxkOiAnRGlyZWN0aW9uJywgZGlyZWN0aW9uOiAnYXNjJyB9XVxuICAgICAgICB9KVxuICAgICAgICAuZmlyc3RQYWdlKClcbiAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgIHJlc3VsdC5mb3JFYWNoKChyZWNvcmQpID0+IHtcbiAgICAgICAgICAgIGNvbnRlbnQucHVzaCh7XG4gICAgICAgICAgICAgIGlkOiByZWNvcmQuaWQsXG4gICAgICAgICAgICAgIHRpdGxlOiByZWNvcmQuZmllbGRzWydUaXRsZSddLFxuICAgICAgICAgICAgICB0YWdzOiByZWNvcmQuZmllbGRzWydUYWdzJ10sXG4gICAgICAgICAgICAgIGxpbms6IHJlY29yZC5maWVsZHNbJ1VSTCddLFxuICAgICAgICAgICAgICBpbWc6IHJlY29yZC5maWVsZHNbJ0lNRyddLFxuICAgICAgICAgICAgICB3aWR0aDogcmVjb3JkLmZpZWxkc1snV2lkdGgnXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgcmVzb2x2ZShjb250ZW50KVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZWNpcGVzVGVhc2Vyc0NhcmRzKGNvbnRlbnQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuT19SZWNpcGVzQ2FyZHMnKVxuICAgIGlmICghY29udGFpbmVyKSByZXR1cm5cblxuICAgIGNvbnRlbnQuZm9yRWFjaCgoc3Ryb2tlKSA9PiB7XG4gICAgICBjb25zdCB7IHRpdGxlLCB0YWdzLCBsaW5rLCBpbWcsIHdpZHRoIH0gPSBzdHJva2VcblxuICAgICAgY29uc3QgUmVjaXBlc1RpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDQnKVxuICAgICAgUmVjaXBlc1RpdGxlLmNsYXNzTGlzdC5hZGQoJ0FfVGl0bGVDYXJkJylcbiAgICAgIFJlY2lwZXNUaXRsZS5pbm5lclRleHQgPSB0aXRsZVxuXG4gICAgICBjb25zdCBSZWNpcGVzVGFncyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBSZWNpcGVzVGFncy5jbGFzc0xpc3QuYWRkKCdDX0FydGljbGVUYWdzJylcblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGFncykpIHtcbiAgICAgICAgdGFncy5mb3JFYWNoKCh0YWcpID0+IHtcbiAgICAgICAgICBjb25zdCBSZWNpcGVzVGFnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgICAgUmVjaXBlc1RhZy5jbGFzc0xpc3QuYWRkKCdBX1RhZ1JlY2lwZXMnKVxuICAgICAgICAgIFJlY2lwZXNUYWcuaW5uZXJUZXh0ID0gdGFnXG5cbiAgICAgICAgICBSZWNpcGVzVGFncy5hcHBlbmRDaGlsZChSZWNpcGVzVGFnKVxuICAgICAgICB9KVxuICAgICAgfVxuXG4gICAgICBjb25zdCBSZWNpcGVzQ2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKVxuICAgICAgUmVjaXBlc0NhcmQuY2xhc3NMaXN0LmFkZCgnTV9SZWNpcGVzQ2FyZHMnKVxuXG4gICAgICBpZiAod2lkdGgpIHtcbiAgICAgICAgUmVjaXBlc0NhcmQuY2xhc3NMaXN0LmFkZCh3aWR0aC50b0xvd2VyQ2FzZSgpKVxuICAgICAgfVxuXG4gICAgICBSZWNpcGVzQ2FyZC5ocmVmID0gbGlua1xuICAgICAgUmVjaXBlc0NhcmQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybCgke2ltZ30pYFxuXG4gICAgICBSZWNpcGVzQ2FyZC5hcHBlbmRDaGlsZChSZWNpcGVzVGFncylcbiAgICAgIFJlY2lwZXNDYXJkLmFwcGVuZENoaWxkKFJlY2lwZXNUaXRsZSlcblxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKFJlY2lwZXNDYXJkKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVSZWNpcGVzVGVhc2Vyc0NhcmRzTShjb250ZW50KSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLk9fUmVjaXBlc0NhcmRzTScpXG4gICAgaWYgKCFjb250YWluZXIpIHJldHVyblxuXG4gICAgY29udGVudC5zbGljZSgwLCA1KS5mb3JFYWNoKChzdHJva2UpID0+IHtcbiAgICAgIGNvbnN0IHsgdGl0bGUsIHRhZ3MsIGxpbmssIGltZywgd2lkdGggfSA9IHN0cm9rZVxuXG4gICAgICBjb25zdCBSZWNpcGVzVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoNCcpXG4gICAgICBSZWNpcGVzVGl0bGUuY2xhc3NMaXN0LmFkZCgnQV9UaXRsZUNhcmQnKVxuICAgICAgUmVjaXBlc1RpdGxlLmlubmVyVGV4dCA9IHRpdGxlXG5cbiAgICAgIGNvbnN0IFJlY2lwZXNUYWdzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIFJlY2lwZXNUYWdzLmNsYXNzTGlzdC5hZGQoJ0NfQXJ0aWNsZVRhZ3MnKVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0YWdzKSkge1xuICAgICAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgICAgIGNvbnN0IFJlY2lwZXNUYWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICAgICAgICBSZWNpcGVzVGFnLmNsYXNzTGlzdC5hZGQoJ0FfVGFnUmVjaXBlcycpXG4gICAgICAgICAgUmVjaXBlc1RhZy5pbm5lclRleHQgPSB0YWdcblxuICAgICAgICAgIFJlY2lwZXNUYWdzLmFwcGVuZENoaWxkKFJlY2lwZXNUYWcpXG4gICAgICAgIH0pXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFJlY2lwZXNDYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpXG4gICAgICBSZWNpcGVzQ2FyZC5jbGFzc0xpc3QuYWRkKCdNX1JlY2lwZXNDYXJkcycpXG5cbiAgICAgIGlmICh3aWR0aCkge1xuICAgICAgICBSZWNpcGVzQ2FyZC5jbGFzc0xpc3QuYWRkKHdpZHRoLnRvTG93ZXJDYXNlKCkpXG4gICAgICB9XG5cbiAgICAgIFJlY2lwZXNDYXJkLmhyZWYgPSBsaW5rXG4gICAgICBSZWNpcGVzQ2FyZC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBgdXJsKCR7aW1nfSlgXG5cbiAgICAgIFJlY2lwZXNDYXJkLmFwcGVuZENoaWxkKFJlY2lwZXNUYWdzKVxuICAgICAgUmVjaXBlc0NhcmQuYXBwZW5kQ2hpbGQoUmVjaXBlc1RpdGxlKVxuXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoUmVjaXBlc0NhcmQpXG4gICAgfSlcbiAgfVxuICBmdW5jdGlvbiBnZXRBcnRpY2xlc0NhcmRzKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjb250ZW50ID0gW11cblxuICAgICAgYmFzZSgnQXJ0aWNsZXNfY2FyZHMnKVxuICAgICAgICAuc2VsZWN0KHtcbiAgICAgICAgICBtYXhSZWNvcmRzOiAyMCxcbiAgICAgICAgICBzb3J0OiBbeyBmaWVsZDogJ0RpcmVjdGlvbicsIGRpcmVjdGlvbjogJ2FzYycgfV1cbiAgICAgICAgfSlcbiAgICAgICAgLmZpcnN0UGFnZSgpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICByZXN1bHQuZm9yRWFjaCgocmVjb3JkKSA9PiB7XG4gICAgICAgICAgICBjb250ZW50LnB1c2goe1xuICAgICAgICAgICAgICBpZDogcmVjb3JkLmlkLFxuICAgICAgICAgICAgICB0aXRsZTogcmVjb3JkLmZpZWxkc1snVGl0bGUnXSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IHJlY29yZC5maWVsZHNbJ0Rlc2NyaXB0aW9uJ10sXG4gICAgICAgICAgICAgIHRhZzogcmVjb3JkLmZpZWxkc1snVGFncyddLFxuICAgICAgICAgICAgICBsaW5rOiByZWNvcmQuZmllbGRzWydVUkwnXSxcbiAgICAgICAgICAgICAgaW1nOiByZWNvcmQuZmllbGRzWydJbWFnZSddLFxuICAgICAgICAgICAgICBzaXplOiByZWNvcmQuZmllbGRzWydTaXplJ11cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHJlc29sdmUoY29udGVudClcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICB9KVxuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZUFydGljbGVzQ2FyZHMoY29udGVudCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5PX0FydGljbGVDYXJkcycpXG4gICAgaWYgKCFjb250YWluZXIpIHJldHVyblxuXG4gICAgY29udGVudC5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICBjb25zdCB7IHRpdGxlLCBkZXNjcmlwdGlvbiwgdGFnLCBsaW5rLCBpbWcsIHNpemUgfSA9IGl0ZW1cblxuICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2g0JylcbiAgICAgIHRpdGxlRWwuY2xhc3NMaXN0LmFkZCgnQV9UaXRsZUNhcmQnKVxuICAgICAgdGl0bGVFbC5pbm5lclRleHQgPSB0aXRsZVxuXG4gICAgICBjb25zdCBkZXNjRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJylcbiAgICAgIGRlc2NFbC5jbGFzc0xpc3QuYWRkKCdBX0Rlc2NyaXB0aW9uQ2FyZCcpXG4gICAgICBkZXNjRWwuaW5uZXJUZXh0ID0gZGVzY3JpcHRpb25cblxuICAgICAgY29uc3QgdGFnV3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICB0YWdXcmFwLmNsYXNzTGlzdC5hZGQoJ0NfQXJ0aWNsZVRhZ3MnKVxuXG4gICAgICBpZiAodGFnKSB7XG4gICAgICAgIGNvbnN0IHRhZ0VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIHRhZ0VsLmNsYXNzTGlzdC5hZGQoJ0FfVGFnUmVjaXBlcycpXG4gICAgICAgIHRhZ0VsLmlubmVyVGV4dCA9IHRhZ1xuXG4gICAgICAgIHRhZ1dyYXAuYXBwZW5kQ2hpbGQodGFnRWwpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJylcbiAgICAgIGNhcmQuY2xhc3NMaXN0LmFkZCgnTV9BcnRpY2xlQ2FyZCcpXG5cbiAgICAgIC8v0YDQsNC30LzQtdGAINC60LDRgNGC0L7Rh9C60LhcbiAgICAgIGlmIChzaXplKSB7XG4gICAgICAgIGNhcmQuY2xhc3NMaXN0LmFkZChzaXplLnRvTG93ZXJDYXNlKCkpXG4gICAgICAgIC8vINC90LDQv9GA0LjQvNC10YA6IHMsIG0sIGwsIHh4bFxuICAgICAgfVxuXG4gICAgICBjYXJkLmhyZWYgPSBsaW5rXG4gICAgICBjYXJkLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoJHtpbWd9KWBcblxuICAgICAgLy8g0YLQtdCzICsg0YHRgtGA0LXQu9C60LBcbiAgICAgIGNvbnN0IHRvcFJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICB0b3BSb3cuY2xhc3NMaXN0LmFkZCgnV19BcnRpY2xlVG9wJylcblxuICAgICAgLy8g0YHRgtGA0LXQu9C60LBcbiAgICAgIGNvbnN0IGFycm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgIGFycm93LmNsYXNzTGlzdC5hZGQoJ0FfQXJyb3cnKVxuXG4gICAgICB0b3BSb3cuYXBwZW5kQ2hpbGQodGFnV3JhcClcbiAgICAgIHRvcFJvdy5hcHBlbmRDaGlsZChhcnJvdylcblxuICAgICAgLy8g8J+UuSDRgtC10LrRgdGCOiB0aXRsZSArIGRlc2NyaXB0aW9uXG4gICAgICBjb25zdCB0ZXh0V3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICB0ZXh0V3JhcC5jbGFzc0xpc3QuYWRkKCdXX0FydGljbGVUZXh0JylcblxuICAgICAgdGV4dFdyYXAuYXBwZW5kQ2hpbGQodGl0bGVFbClcbiAgICAgIHRleHRXcmFwLmFwcGVuZENoaWxkKGRlc2NFbClcblxuICAgICAgLy8g8J+UuSDQstGB0YLQsNCy0LrQsCDQsiDQutCw0YDRgtC+0YfQutGDXG4gICAgICBjYXJkLmFwcGVuZENoaWxkKHRvcFJvdylcbiAgICAgIGNhcmQuYXBwZW5kQ2hpbGQodGV4dFdyYXApXG5cbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKVxuICAgIH0pXG4gIH1cbiAgZ2V0QXJ0aWNsZXNDYXJkcygpLnRoZW4oKGNvbnRlbnQpID0+IHtcbiAgICBjcmVhdGVBcnRpY2xlc0NhcmRzKGNvbnRlbnQpXG4gIH0pXG59KVxuXG4vLyDRg9C90LjQstC10YDRgdCw0LvRjNC90LDRjyDRhNGD0L3QutGG0LjRj1xuLy8gZnVuY3Rpb24gc2V0SW1hZ2Uoc2VsZWN0b3IsIHNyYykge1xuLy8gICBjb25zdCBlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXG4vLyAgIGlmIChlbCkgZWwuc3JjID0gc3JjXG4vLyB9XG5cbi8vIC8vID09PT09IGxvZ28gYW5pbWF0aW9uICjQtdGB0YLRjCDQvdCwINCy0YHQtdGFINGB0YLRgNCw0L3QuNGG0LDRhSkgPT09PT1cbi8vIGltcG9ydCBiYW5hbmEgZnJvbSAnLi4vaW1nL2xvZ29hbmltYXRpb24vQmFuYW5hLnBuZydcbi8vIGltcG9ydCBraXdpIGZyb20gJy4uL2ltZy9sb2dvYW5pbWF0aW9uL0tpd2kucG5nJ1xuLy8gaW1wb3J0IHN0cmF3YmVycnkgZnJvbSAnLi4vaW1nL2xvZ29hbmltYXRpb24vU3RyYXdiZXJyeS5wbmcnXG4vLyBpbXBvcnQgc3RyYXdiZXJyeTEgZnJvbSAnLi4vaW1nL2xvZ29hbmltYXRpb24vU3RyYXdiZXJyeTEucG5nJ1xuLy8gaW1wb3J0IHRvbWF0byBmcm9tICcuLi9pbWcvbG9nb2FuaW1hdGlvbi9Ub21hdG8ucG5nJ1xuXG4vLyBzZXRJbWFnZSgnLlFfTG9nb01vdmVfQmFuYW5hJywgYmFuYW5hKVxuLy8gc2V0SW1hZ2UoJy5RX0xvZ29Nb3ZlX0tpd2knLCBraXdpKVxuLy8gc2V0SW1hZ2UoJy5RX0xvZ29Nb3ZlX1N0cmF3YmVycnknLCBzdHJhd2JlcnJ5KVxuLy8gc2V0SW1hZ2UoJy5RX0xvZ29Nb3ZlX1N0cmF3YmVycnkxJywgc3RyYXdiZXJyeTEpXG4vLyBzZXRJbWFnZSgnLlFfTG9nb01vdmVfVG9tYXRvJywgdG9tYXRvKVxuXG4vLyAvLyA9PT09PSBtYWluIHNjcmVlbiAo0LXRgdGC0Ywg0J3QlSDQstC10LfQtNC1KSA9PT09PVxuLy8gLy8gaW1wb3J0IGtpd2lNYWluIGZyb20gJy4uL2ltZy9jYXJkcy9BX0ZydWl0c19NYWluU2NyZWVuX0tpd2kuc3ZnJ1xuLy8gaW1wb3J0IHBlYWNoIGZyb20gJy4uL2ltZy9jYXJkcy9BX0ZydWl0c19NYWluU2NyZWVuX1BlYWNoLnN2Zydcbi8vIGltcG9ydCBzdHJhd2JlcnJ5TWFpbiBmcm9tICcuLi9pbWcvY2FyZHMvQV9GcnVpdHNfTWFpblNjcmVlbl9TdHJhd2JlcnJ5LnN2ZydcblxuLy8gLy8gc2V0SW1hZ2UoJy5BX0ZydWl0c19NYWluU2NyZWVuX0tpd2knLCBraXdpTWFpbik7XG4vLyBzZXRJbWFnZSgnLkFfRnJ1aXRzX01haW5TY3JlZW5fUGVhY2gnLCBwZWFjaClcbi8vIHNldEltYWdlKCcuQV9GcnVpdHNfTWFpblNjcmVlbl9TdHJhd2JlcnJ5Jywgc3RyYXdiZXJyeU1haW4pXG5cbi8vIC8vID09PT09IHBhdHRlcm5zID09PT09XG4vLyBpbXBvcnQgcGF0dGVybktpd2kgZnJvbSAnLi4vaW1nL01fUGF0dGVybl9NYWluU2NyZWVuX0tpd2kuc3ZnJ1xuLy8gaW1wb3J0IHBhdHRlcm5Ub21hdG8gZnJvbSAnLi4vaW1nL01fUGF0dGVybl9NYWluU2NyZWVuX1RvbWF0by5zdmcnXG5cbi8vIHNldEltYWdlKCcuQV9GcnVpdHNfTWFpblNjcmVlbl9QYXR0ZXJuS2l3aScsIHBhdHRlcm5LaXdpKVxuLy8gc2V0SW1hZ2UoJy5BX0ZydWl0c19NYWluU2NyZWVuX1BhdHRlcm5Ub21hdG8nLCBwYXR0ZXJuVG9tYXRvKVxuIl0sIm5hbWVzIjpbIkFpcnRhYmxlIiwiZG9jdW1lbnQiLCJhZGRFdmVudExpc3RlbmVyIiwidG9rZW4iLCJjb25maWd1cmUiLCJlbmRwb2ludFVybCIsImFwaUtleSIsImJhc2UiLCJnZXRDYXJkVGVhc2VycyIsInRoZW4iLCJjb250ZW50IiwiY3JlYXRlUmVjaXBlc1RlYXNlcnNDYXJkcyIsImNyZWF0ZVJlY2lwZXNUZWFzZXJzQ2FyZHNNIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJzZWxlY3QiLCJtYXhSZWNvcmRzIiwic29ydCIsImZpZWxkIiwiZGlyZWN0aW9uIiwiZmlyc3RQYWdlIiwicmVzdWx0IiwiZm9yRWFjaCIsInJlY29yZCIsInB1c2giLCJpZCIsInRpdGxlIiwiZmllbGRzIiwidGFncyIsImxpbmsiLCJpbWciLCJ3aWR0aCIsImNvbnRhaW5lciIsInF1ZXJ5U2VsZWN0b3IiLCJzdHJva2UiLCJSZWNpcGVzVGl0bGUiLCJjcmVhdGVFbGVtZW50IiwiY2xhc3NMaXN0IiwiYWRkIiwiaW5uZXJUZXh0IiwiUmVjaXBlc1RhZ3MiLCJBcnJheSIsImlzQXJyYXkiLCJ0YWciLCJSZWNpcGVzVGFnIiwiYXBwZW5kQ2hpbGQiLCJSZWNpcGVzQ2FyZCIsInRvTG93ZXJDYXNlIiwiaHJlZiIsInN0eWxlIiwiYmFja2dyb3VuZEltYWdlIiwiY29uY2F0Iiwic2xpY2UiLCJnZXRBcnRpY2xlc0NhcmRzIiwiZGVzY3JpcHRpb24iLCJzaXplIiwiY3JlYXRlQXJ0aWNsZXNDYXJkcyIsIml0ZW0iLCJ0aXRsZUVsIiwiZGVzY0VsIiwidGFnV3JhcCIsInRhZ0VsIiwiY2FyZCIsInRvcFJvdyIsImFycm93IiwidGV4dFdyYXAiXSwic291cmNlUm9vdCI6IiJ9