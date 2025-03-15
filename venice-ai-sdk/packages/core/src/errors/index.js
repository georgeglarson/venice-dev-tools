"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VeniceStreamError = exports.VeniceValidationError = exports.VeniceTimeoutError = exports.VeniceNetworkError = exports.VeniceCapacityError = exports.VeniceRateLimitError = exports.VenicePaymentRequiredError = exports.VeniceAuthError = exports.VeniceApiError = exports.VeniceError = void 0;
exports.isVeniceError = isVeniceError;
exports.handleError = handleError;
/**
 * Base error class for Venice AI SDK errors.
 */
var VeniceError = /** @class */ (function (_super) {
    __extends(VeniceError, _super);
    /**
     * Create a new Venice SDK error.
     * @param message - The error message.
     * @param options - Additional error options.
     */
    function VeniceError(message, options) {
        var _this = _super.call(this, message, options) || this;
        _this.name = 'VeniceError';
        return _this;
    }
    return VeniceError;
}(Error));
exports.VeniceError = VeniceError;
/**
 * Error for API-related issues.
 */
var VeniceApiError = /** @class */ (function (_super) {
    __extends(VeniceApiError, _super);
    /**
     * Create a new API error.
     * @param message - The error message.
     * @param status - The HTTP status code.
     * @param details - Additional error details.
     */
    function VeniceApiError(message, status, details) {
        var _this = _super.call(this, message) || this;
        _this.name = 'VeniceApiError';
        _this.status = status;
        _this.details = details;
        return _this;
    }
    return VeniceApiError;
}(VeniceError));
exports.VeniceApiError = VeniceApiError;
/**
 * Error for authentication issues.
 */
var VeniceAuthError = /** @class */ (function (_super) {
    __extends(VeniceAuthError, _super);
    /**
     * Create a new authentication error.
     * @param message - The error message.
     */
    function VeniceAuthError(message) {
        if (message === void 0) { message = 'Authentication failed'; }
        var _this = _super.call(this, message, 401) || this;
        _this.name = 'VeniceAuthError';
        return _this;
    }
    return VeniceAuthError;
}(VeniceApiError));
exports.VeniceAuthError = VeniceAuthError;
/**
 * Error for payment required issues.
 */
var VenicePaymentRequiredError = /** @class */ (function (_super) {
    __extends(VenicePaymentRequiredError, _super);
    /**
     * Create a new payment required error.
     * @param message - The error message.
     */
    function VenicePaymentRequiredError(message) {
        if (message === void 0) { message = 'Insufficient USD or VCU balance to complete request'; }
        var _this = _super.call(this, message, 402) || this;
        _this.name = 'VenicePaymentRequiredError';
        return _this;
    }
    return VenicePaymentRequiredError;
}(VeniceApiError));
exports.VenicePaymentRequiredError = VenicePaymentRequiredError;
/**
 * Error for rate limit issues.
 */
var VeniceRateLimitError = /** @class */ (function (_super) {
    __extends(VeniceRateLimitError, _super);
    /**
     * Create a new rate limit error.
     * @param message - The error message.
     */
    function VeniceRateLimitError(message) {
        if (message === void 0) { message = 'Rate limit exceeded'; }
        var _this = _super.call(this, message, 429) || this;
        _this.name = 'VeniceRateLimitError';
        return _this;
    }
    return VeniceRateLimitError;
}(VeniceApiError));
exports.VeniceRateLimitError = VeniceRateLimitError;
/**
 * Error for model capacity issues.
 */
var VeniceCapacityError = /** @class */ (function (_super) {
    __extends(VeniceCapacityError, _super);
    /**
     * Create a new model capacity error.
     * @param message - The error message.
     */
    function VeniceCapacityError(message) {
        if (message === void 0) { message = 'The model is at capacity. Please try again later.'; }
        var _this = _super.call(this, message, 503) || this;
        _this.name = 'VeniceCapacityError';
        return _this;
    }
    return VeniceCapacityError;
}(VeniceApiError));
exports.VeniceCapacityError = VeniceCapacityError;
/**
 * Error for network issues.
 */
var VeniceNetworkError = /** @class */ (function (_super) {
    __extends(VeniceNetworkError, _super);
    /**
     * Create a new network error.
     * @param message - The error message.
     * @param options - Additional error options.
     */
    function VeniceNetworkError(message, options) {
        if (message === void 0) { message = 'Network error occurred'; }
        var _this = _super.call(this, message, options) || this;
        _this.name = 'VeniceNetworkError';
        return _this;
    }
    return VeniceNetworkError;
}(VeniceError));
exports.VeniceNetworkError = VeniceNetworkError;
/**
 * Error for timeout issues.
 */
var VeniceTimeoutError = /** @class */ (function (_super) {
    __extends(VeniceTimeoutError, _super);
    /**
     * Create a new timeout error.
     * @param message - The error message.
     */
    function VeniceTimeoutError(message) {
        if (message === void 0) { message = 'Request timed out'; }
        var _this = _super.call(this, message) || this;
        _this.name = 'VeniceTimeoutError';
        return _this;
    }
    return VeniceTimeoutError;
}(VeniceError));
exports.VeniceTimeoutError = VeniceTimeoutError;
/**
 * Error for validation issues.
 */
var VeniceValidationError = /** @class */ (function (_super) {
    __extends(VeniceValidationError, _super);
    /**
     * Create a new validation error.
     * @param message - The error message.
     * @param details - Additional validation details.
     */
    function VeniceValidationError(message, details) {
        var _this = _super.call(this, message) || this;
        _this.name = 'VeniceValidationError';
        _this.details = details;
        return _this;
    }
    return VeniceValidationError;
}(VeniceError));
exports.VeniceValidationError = VeniceValidationError;
/**
 * Error for streaming issues.
 */
var VeniceStreamError = /** @class */ (function (_super) {
    __extends(VeniceStreamError, _super);
    /**
     * Create a new stream error.
     * @param message - The error message.
     * @param options - Additional error options.
     */
    function VeniceStreamError(message, options) {
        if (message === void 0) { message = 'Stream processing error'; }
        var _this = _super.call(this, message, options) || this;
        _this.name = 'VeniceStreamError';
        return _this;
    }
    return VeniceStreamError;
}(VeniceError));
exports.VeniceStreamError = VeniceStreamError;
/**
 * Check if an error is a Venice SDK error.
 * @param error - The error to check.
 * @returns Whether the error is a Venice SDK error.
 */
function isVeniceError(error) {
    return error instanceof VeniceError;
}
/**
 * Handle an error and convert it to a Venice SDK error if it's not already one.
 * @param error - The error to handle.
 * @returns A Venice SDK error.
 */
function handleError(error) {
    if (isVeniceError(error)) {
        return error;
    }
    if (error instanceof Error) {
        return new VeniceError(error.message, { cause: error });
    }
    return new VeniceError(String(error));
}
