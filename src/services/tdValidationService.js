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
import { simpleTDValidator } from './simpleTdValidation';
var TDValidationService = /** @class */ (function () {
    function TDValidationService() {
    }
    /**
     * Validate a Thing Description using browser-compatible validation
     */
    TDValidationService.prototype.validateTD = function (td) {
        return __awaiter(this, void 0, void 0, function () {
            var tdString;
            return __generator(this, function (_a) {
                try {
                    tdString = void 0;
                    // Parse JSON if string provided
                    if (typeof td === 'string') {
                        tdString = td;
                        try {
                            JSON.parse(td); // Validate JSON syntax
                        }
                        catch (parseError) {
                            return [2 /*return*/, this.createParseErrorResult(parseError, td)];
                        }
                    }
                    else {
                        tdString = JSON.stringify(td, null, 2);
                    }
                    // Use browser-compatible fallback validation
                    return [2 /*return*/, this.validateWithFallback(tdString)];
                }
                catch (error) {
                    return [2 /*return*/, {
                            isValid: false,
                            errors: [{
                                    message: "Validation failed: ".concat(error instanceof Error ? error.message : 'Unknown error'),
                                    severity: 'critical'
                                }],
                            warnings: [],
                            details: {
                                contextValid: false,
                                requiredFieldsPresent: false,
                                schemaValid: false,
                                assertionsValid: false,
                                securityValid: false,
                                linksValid: false,
                                formsValid: false
                            }
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Fallback validation using simple validator
     */
    TDValidationService.prototype.validateWithFallback = function (tdString) {
        var result = simpleTDValidator.validateTD(tdString);
        var errors = result.errors.map(function (error) { return ({
            message: error,
            severity: 'error'
        }); });
        var warnings = result.warnings.map(function (warning) { return ({
            message: warning,
            type: 'best-practice'
        }); });
        var details = {
            contextValid: result.details.hasContext,
            requiredFieldsPresent: result.details.hasTitle && result.details.hasContext,
            schemaValid: result.details.hasValidJSON,
            assertionsValid: result.isValid,
            securityValid: result.details.hasSecurity,
            linksValid: true, // Simple validator doesn't check links in detail
            formsValid: true // Simple validator has basic forms validation
        };
        return {
            isValid: result.isValid,
            errors: errors,
            warnings: warnings,
            details: details
        };
    };
    /**
     * Custom validations specific to our application
     */
    TDValidationService.prototype.performCustomValidations = function (td) {
        var errors = [];
        var warnings = [];
        // Check for missing title
        if (!td.title || typeof td.title !== 'string' || td.title.trim().length === 0) {
            errors.push({
                message: 'Thing Description must have a non-empty title',
                path: 'title',
                severity: 'error'
            });
        }
        // Check for very long titles
        if (td.title && td.title.length > 100) {
            warnings.push({
                message: 'Title is very long, consider keeping it under 100 characters',
                path: 'title',
                type: 'best-practice'
            });
        }
        // Check for missing description
        if (!td.description) {
            warnings.push({
                message: 'Consider adding a description for better documentation',
                path: 'description',
                type: 'best-practice'
            });
        }
        // Check for empty properties, actions, or events
        if (td.properties && Object.keys(td.properties).length === 0) {
            warnings.push({
                message: 'Thing has empty properties object, consider removing if unused',
                path: 'properties',
                type: 'best-practice'
            });
        }
        if (td.actions && Object.keys(td.actions).length === 0) {
            warnings.push({
                message: 'Thing has empty actions object, consider removing if unused',
                path: 'actions',
                type: 'best-practice'
            });
        }
        if (td.events && Object.keys(td.events).length === 0) {
            warnings.push({
                message: 'Thing has empty events object, consider removing if unused',
                path: 'events',
                type: 'best-practice'
            });
        }
        // Check for missing security
        if (!td.securityDefinitions || !td.security) {
            warnings.push({
                message: 'Consider defining security mechanisms for production use',
                path: 'security',
                type: 'best-practice'
            });
        }
        return { errors: errors, warnings: warnings };
    };
    TDValidationService.prototype.createParseErrorResult = function (error, jsonString) {
        var match = error.message.match(/at position (\d+)/);
        var line = 1;
        var column = 1;
        if (match) {
            var position = parseInt(match[1]);
            var beforeError = jsonString.substring(0, position);
            line = (beforeError.match(/\n/g) || []).length + 1;
            column = position - beforeError.lastIndexOf('\n');
        }
        return {
            isValid: false,
            errors: [{
                    message: "JSON Parse Error: ".concat(error.message),
                    line: line,
                    column: column,
                    severity: 'critical'
                }],
            warnings: [],
            details: {
                contextValid: false,
                requiredFieldsPresent: false,
                schemaValid: false,
                assertionsValid: false,
                securityValid: false,
                linksValid: false,
                formsValid: false
            }
        };
    };
    TDValidationService.prototype.checkContext = function (td) {
        return td['@context'] && (td['@context'] === 'https://www.w3.org/2019/wot/td/v1' ||
            (Array.isArray(td['@context']) &&
                td['@context'].includes('https://www.w3.org/2019/wot/td/v1')));
    };
    TDValidationService.prototype.checkRequiredFields = function (td) {
        return !!(td.title && td['@context']);
    };
    TDValidationService.prototype.checkSecurity = function (td) {
        if (!td.securityDefinitions)
            return false;
        if (!td.security)
            return false;
        // Check if security references are valid
        var securityKeys = Object.keys(td.securityDefinitions);
        var securityRefs = Array.isArray(td.security) ? td.security : [td.security];
        return securityRefs.every(function (ref) { return securityKeys.includes(ref); });
    };
    TDValidationService.prototype.checkLinks = function (td) {
        if (!td.links)
            return true; // Links are optional
        return Array.isArray(td.links) && td.links.every(function (link) {
            return link.href && typeof link.href === 'string';
        });
    };
    TDValidationService.prototype.checkForms = function (td) {
        // Check forms in properties, actions, and events
        var checkFormArray = function (forms) {
            if (!Array.isArray(forms))
                return false;
            return forms.every(function (form) { return form.href && typeof form.href === 'string'; });
        };
        // Check property forms
        if (td.properties) {
            for (var _i = 0, _a = Object.values(td.properties); _i < _a.length; _i++) {
                var prop = _a[_i];
                if (prop.forms && !checkFormArray(prop.forms)) {
                    return false;
                }
            }
        }
        // Check action forms
        if (td.actions) {
            for (var _b = 0, _c = Object.values(td.actions); _b < _c.length; _b++) {
                var action = _c[_b];
                if (action.forms && !checkFormArray(action.forms)) {
                    return false;
                }
            }
        }
        // Check event forms
        if (td.events) {
            for (var _d = 0, _e = Object.values(td.events); _d < _e.length; _d++) {
                var event_1 = _e[_d];
                if (event_1.forms && !checkFormArray(event_1.forms)) {
                    return false;
                }
            }
        }
        return true;
    };
    /**
     * Get suggestions for improving a Thing Description
     */
    TDValidationService.prototype.getSuggestions = function (td) {
        try {
            return simpleTDValidator.getSuggestions(td);
        }
        catch (error) {
            // Fallback suggestions
            var suggestions = [];
            if (!td.description) {
                suggestions.push('Add a description to help users understand what this Thing does');
            }
            if (!td.properties && !td.actions && !td.events) {
                suggestions.push('Add at least one property, action, or event to make this Thing functional');
            }
            if (td.securityDefinitions && Object.keys(td.securityDefinitions).includes('nosec_sc')) {
                suggestions.push('Consider using stronger security mechanisms than "nosec" for production');
            }
            if (!td.version) {
                suggestions.push('Add version information to track changes over time');
            }
            if (!td.support) {
                suggestions.push('Add support contact information for maintainability');
            }
            return suggestions;
        }
    };
    return TDValidationService;
}());
export { TDValidationService };
// Export singleton instance
export var tdValidationService = new TDValidationService();
