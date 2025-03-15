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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
var axios_1 = require("axios");
var errors_1 = require("../errors");
/**
 * HTTP client for making requests to the Venice AI API.
 */
var HttpClient = /** @class */ (function () {
    /**
     * Create a new HTTP client.
     * @param baseUrl - The base URL for the API.
     * @param headers - Additional headers to include in requests.
     * @param timeout - Request timeout in milliseconds.
     */
    function HttpClient(baseUrl, headers, timeout) {
        if (baseUrl === void 0) { baseUrl = 'https://api.venice.ai/api/v1'; }
        if (headers === void 0) { headers = {}; }
        if (timeout === void 0) { timeout = 30000; }
        this.baseUrl = baseUrl;
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            timeout: timeout,
            headers: __assign({ 'Content-Type': 'application/json' }, headers),
        });
    }
    /**
     * Set an authorization header with a bearer token.
     * @param token - The API key or token.
     */
    HttpClient.prototype.setAuthToken = function (token) {
        this.client.defaults.headers.common['Authorization'] = "Bearer ".concat(token);
    };
    /**
     * Set a custom header for future requests.
     * @param name - The header name.
     * @param value - The header value.
     */
    HttpClient.prototype.setHeader = function (name, value) {
        this.client.defaults.headers.common[name] = value;
    };
    /**
     * Make an HTTP request.
     * @param path - The API path (will be appended to the base URL).
     * @param options - Request options.
     * @returns The response data.
     */
    HttpClient.prototype.request = function (path_1) {
        return __awaiter(this, arguments, void 0, function (path, options) {
            var _a, method, _b, headers, body, query, timeout, _c, responseType, signal, config, response, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = options.method, method = _a === void 0 ? 'GET' : _a, _b = options.headers, headers = _b === void 0 ? {} : _b, body = options.body, query = options.query, timeout = options.timeout, _c = options.responseType, responseType = _c === void 0 ? 'json' : _c, signal = options.signal;
                        config = {
                            method: method,
                            url: path,
                            headers: headers,
                            params: query,
                            data: body,
                            responseType: responseType,
                            signal: signal,
                        };
                        if (timeout) {
                            config.timeout = timeout;
                        }
                        return [4 /*yield*/, this.client.request(config)];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, {
                                data: response.data,
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers,
                            }];
                    case 2:
                        error_1 = _d.sent();
                        this.handleRequestError(error_1);
                        return [3 /*break*/, 3];
                    case 3: 
                    // This should never be reached, but required for TypeScript
                    throw new Error('Unknown error occurred');
                }
            });
        });
    };
    /**
     * Handle API request errors and transform them into appropriate SDK errors.
     * @param error - The Axios error.
     */
    HttpClient.prototype.handleRequestError = function (error) {
        if (error.response) {
            // The request was made and the server responded with a status code outside the range of 2xx
            var responseData = error.response.data || {};
            var errorMessage = responseData.error || 'API request failed';
            var details = responseData.details;
            throw new errors_1.VeniceApiError(errorMessage, error.response.status, details);
        }
        else if (error.request) {
            // The request was made but no response was received
            if (error.code === 'ECONNABORTED') {
                throw new errors_1.VeniceTimeoutError('Request timed out');
            }
            throw new errors_1.VeniceNetworkError('Network error', { cause: error });
        }
        else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(error.message || 'Request setup error');
        }
    };
    /**
     * Make a GET request.
     * @param path - The API path.
     * @param options - Request options.
     * @returns The response data.
     */
    HttpClient.prototype.get = function (path_1) {
        return __awaiter(this, arguments, void 0, function (path, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: 'GET' }))];
            });
        });
    };
    /**
     * Make a POST request.
     * @param path - The API path.
     * @param body - The request body.
     * @param options - Additional request options.
     * @returns The response data.
     */
    HttpClient.prototype.post = function (path_1, body_1) {
        return __awaiter(this, arguments, void 0, function (path, body, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: 'POST', body: body }))];
            });
        });
    };
    /**
     * Make a DELETE request.
     * @param path - The API path.
     * @param options - Request options.
     * @returns The response data.
     */
    HttpClient.prototype.delete = function (path_1) {
        return __awaiter(this, arguments, void 0, function (path, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.request(path, __assign(__assign({}, options), { method: 'DELETE' }))];
            });
        });
    };
    /**
     * Create a new stream request.
     * @param path - The API path.
     * @param body - The request body.
     * @param options - Additional request options.
     * @returns A fetch response for streaming.
     */
    HttpClient.prototype.stream = function (path_1, body_1) {
        return __awaiter(this, arguments, void 0, function (path, body, options) {
            var url, authHeader, headers, response_1, errorData, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "".concat(this.baseUrl).concat(path);
                        authHeader = this.client.defaults.headers.common['Authorization'];
                        headers = __assign(__assign({ 'Content-Type': 'application/json' }, (authHeader ? { 'Authorization': authHeader } : {})), options.headers);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify(body),
                                signal: options.signal,
                            })];
                    case 2:
                        response_1 = _a.sent();
                        if (!!response_1.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response_1.json().catch(function () { return ({ error: "HTTP error ".concat(response_1.status) }); })];
                    case 3:
                        errorData = _a.sent();
                        throw new errors_1.VeniceApiError(errorData.error || 'Stream request failed', response_1.status, errorData.details);
                    case 4: return [2 /*return*/, response_1];
                    case 5:
                        error_2 = _a.sent();
                        if (error_2 instanceof errors_1.VeniceApiError) {
                            throw error_2;
                        }
                        if (error_2.name === 'AbortError') {
                            throw new Error('Request was aborted');
                        }
                        throw new errors_1.VeniceNetworkError('Stream request failed', { cause: error_2 });
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return HttpClient;
}());
exports.HttpClient = HttpClient;
