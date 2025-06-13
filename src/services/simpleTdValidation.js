var SimpleTDValidator = /** @class */ (function () {
    function SimpleTDValidator() {
    }
    SimpleTDValidator.prototype.validateTD = function (tdString) {
        var errors = [];
        var warnings = [];
        var td = null;
        // 1. JSON validation
        try {
            td = JSON.parse(tdString);
        }
        catch (error) {
            return {
                isValid: false,
                errors: ["Invalid JSON: ".concat(error instanceof Error ? error.message : 'Parse error')],
                warnings: [],
                details: {
                    hasContext: false,
                    hasTitle: false,
                    hasValidJSON: false,
                    hasProperties: false,
                    hasActions: false,
                    hasEvents: false,
                    hasSecurity: false
                }
            };
        }
        // 2. Required fields validation
        if (!td['@context']) {
            errors.push('Missing required field: @context');
        }
        else {
            var context = Array.isArray(td['@context']) ? td['@context'] : [td['@context']];
            if (!context.includes('https://www.w3.org/2019/wot/td/v1')) {
                errors.push('@context must include "https://www.w3.org/2019/wot/td/v1"');
            }
        }
        if (!td.title) {
            errors.push('Missing required field: title');
        }
        else if (typeof td.title !== 'string') {
            errors.push('title must be a string');
        }
        // 3. Security validation
        if (!td.securityDefinitions) {
            warnings.push('No security definitions provided');
        }
        if (!td.security) {
            warnings.push('No security configuration provided');
        }
        // 4. Capabilities validation
        var hasProperties = td.properties && Object.keys(td.properties).length > 0;
        var hasActions = td.actions && Object.keys(td.actions).length > 0;
        var hasEvents = td.events && Object.keys(td.events).length > 0;
        if (!hasProperties && !hasActions && !hasEvents) {
            warnings.push('Thing has no properties, actions, or events');
        }
        // 5. Forms validation
        this.validateForms(td, errors, warnings);
        // 6. Data schema validation
        this.validateDataSchemas(td, errors, warnings);
        var details = {
            hasContext: !!td['@context'],
            hasTitle: !!td.title,
            hasValidJSON: true,
            hasProperties: hasProperties,
            hasActions: hasActions,
            hasEvents: hasEvents,
            hasSecurity: !!(td.securityDefinitions && td.security)
        };
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            details: details
        };
    };
    SimpleTDValidator.prototype.validateForms = function (td, errors, warnings) {
        // Validate forms in properties
        if (td.properties) {
            Object.entries(td.properties).forEach(function (_a) {
                var key = _a[0], property = _a[1];
                if (property.forms && Array.isArray(property.forms)) {
                    property.forms.forEach(function (form, index) {
                        if (!form.href) {
                            errors.push("Property \"".concat(key, "\" form ").concat(index, " missing href"));
                        }
                    });
                }
                else if (!property.forms) {
                    warnings.push("Property \"".concat(key, "\" has no forms"));
                }
            });
        }
        // Validate forms in actions
        if (td.actions) {
            Object.entries(td.actions).forEach(function (_a) {
                var key = _a[0], action = _a[1];
                if (action.forms && Array.isArray(action.forms)) {
                    action.forms.forEach(function (form, index) {
                        if (!form.href) {
                            errors.push("Action \"".concat(key, "\" form ").concat(index, " missing href"));
                        }
                    });
                }
                else if (!action.forms) {
                    warnings.push("Action \"".concat(key, "\" has no forms"));
                }
            });
        }
        // Validate forms in events
        if (td.events) {
            Object.entries(td.events).forEach(function (_a) {
                var key = _a[0], event = _a[1];
                if (event.forms && Array.isArray(event.forms)) {
                    event.forms.forEach(function (form, index) {
                        if (!form.href) {
                            errors.push("Event \"".concat(key, "\" form ").concat(index, " missing href"));
                        }
                    });
                }
                else if (!event.forms) {
                    warnings.push("Event \"".concat(key, "\" has no forms"));
                }
            });
        }
    };
    SimpleTDValidator.prototype.validateDataSchemas = function (td, errors, warnings) {
        // Validate property data schemas
        if (td.properties) {
            Object.entries(td.properties).forEach(function (_a) {
                var key = _a[0], property = _a[1];
                if (!property.type) {
                    warnings.push("Property \"".concat(key, "\" has no type specified"));
                }
                if (property.type === 'number' || property.type === 'integer') {
                    if (property.minimum !== undefined && property.maximum !== undefined) {
                        if (property.minimum > property.maximum) {
                            errors.push("Property \"".concat(key, "\" minimum value is greater than maximum"));
                        }
                    }
                }
            });
        }
        // Validate action input/output schemas
        if (td.actions) {
            Object.entries(td.actions).forEach(function (_a) {
                var key = _a[0], action = _a[1];
                if (action.input && action.input.type === 'object' && action.input.properties) {
                    if (action.input.required && Array.isArray(action.input.required)) {
                        action.input.required.forEach(function (requiredField) {
                            if (!action.input.properties[requiredField]) {
                                errors.push("Action \"".concat(key, "\" input requires field \"").concat(requiredField, "\" but it's not defined"));
                            }
                        });
                    }
                }
            });
        }
    };
    SimpleTDValidator.prototype.getSuggestions = function (td) {
        var suggestions = [];
        if (!td.description) {
            suggestions.push('Add a description to help users understand this Thing');
        }
        if (!td.version) {
            suggestions.push('Consider adding version information');
        }
        if (!td.support) {
            suggestions.push('Add support contact information');
        }
        if (td.securityDefinitions && Object.keys(td.securityDefinitions).includes('nosec_sc')) {
            suggestions.push('Consider using stronger security than "nosec" for production');
        }
        // Check for observable properties
        if (td.properties) {
            var observableCount = Object.values(td.properties).filter(function (prop) { return prop.observable; }).length;
            if (observableCount === 0) {
                suggestions.push('Consider making some properties observable for real-time updates');
            }
        }
        return suggestions;
    };
    return SimpleTDValidator;
}());
export { SimpleTDValidator };
export var simpleTDValidator = new SimpleTDValidator();
