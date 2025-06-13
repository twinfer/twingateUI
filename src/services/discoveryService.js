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
import { env } from '@/config/env';
import { useDiscoveryEndpointsStore } from '@/stores/discoveryEndpointsStore';
var DiscoveryService = /** @class */ (function () {
    function DiscoveryService() {
    }
    /**
     * Discover Things from a list of base URLs using .well-known/wot
     */
    DiscoveryService.prototype.discoverThings = function (baseUrls, onProgress) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _i, baseUrls_1, baseUrl, discovered, error_1, _a, _b, thing, validation, error_2, _loop_1, _c, baseUrls_2, baseUrl;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        this.abortController = new AbortController();
                        result = {
                            discovered: [],
                            errors: [],
                            progress: {
                                total: baseUrls.length,
                                completed: 0,
                                current: '',
                                status: 'scanning'
                            }
                        };
                        _i = 0, baseUrls_1 = baseUrls;
                        _e.label = 1;
                    case 1:
                        if (!(_i < baseUrls_1.length)) return [3 /*break*/, 7];
                        baseUrl = baseUrls_1[_i];
                        if (this.abortController.signal.aborted)
                            return [3 /*break*/, 7];
                        result.progress.current = baseUrl;
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(result.progress);
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.scanWellKnown(baseUrl)];
                    case 3:
                        discovered = _e.sent();
                        (_d = result.discovered).push.apply(_d, discovered);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _e.sent();
                        result.errors.push({
                            url: baseUrl,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        result.progress.completed++;
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(result.progress);
                        _e.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7:
                        // Validation phase
                        result.progress.status = 'validating';
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(result.progress);
                        _a = 0, _b = result.discovered;
                        _e.label = 8;
                    case 8:
                        if (!(_a < _b.length)) return [3 /*break*/, 13];
                        thing = _b[_a];
                        if (this.abortController.signal.aborted)
                            return [3 /*break*/, 13];
                        _e.label = 9;
                    case 9:
                        _e.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.validateTD(thing.thingDescription)];
                    case 10:
                        validation = _e.sent();
                        thing.validationStatus = validation.isValid ? 'valid' : 'invalid';
                        thing.validationErrors = validation.errors;
                        return [3 /*break*/, 12];
                    case 11:
                        error_2 = _e.sent();
                        thing.validationStatus = 'warning';
                        thing.validationErrors = ['Validation failed: ' + (error_2 instanceof Error ? error_2.message : 'Unknown error')];
                        return [3 /*break*/, 12];
                    case 12:
                        _a++;
                        return [3 /*break*/, 8];
                    case 13:
                        result.progress.status = 'completed';
                        onProgress === null || onProgress === void 0 ? void 0 : onProgress(result.progress);
                        _loop_1 = function (baseUrl) {
                            var discovered = result.discovered.filter(function (thing) {
                                return thing.url && thing.url.startsWith(baseUrl);
                            }).length;
                            if (discovered > 0) {
                                // Add endpoint to the store
                                var endpointsStore = useDiscoveryEndpointsStore.getState();
                                endpointsStore.addEndpoint(baseUrl, discovered);
                            }
                        };
                        // Add successful endpoints to the discovery endpoints store
                        for (_c = 0, baseUrls_2 = baseUrls; _c < baseUrls_2.length; _c++) {
                            baseUrl = baseUrls_2[_c];
                            _loop_1(baseUrl);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Scan a base URL for Thing Descriptions using .well-known/wot
     */
    DiscoveryService.prototype.scanWellKnown = function (baseUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var wellKnownUrl, response, contentType, data, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        wellKnownUrl = this.buildWellKnownUrl(baseUrl);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(wellKnownUrl, {
                                signal: (_a = this.abortController) === null || _a === void 0 ? void 0 : _a.signal,
                                headers: {
                                    'Accept': 'application/json, application/ld+json',
                                },
                                timeout: env.DISCOVERY_TIMEOUT,
                            })];
                    case 2:
                        response = _b.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        contentType = response.headers.get('content-type') || '';
                        if (!contentType.includes('application/json') && !contentType.includes('application/ld+json')) {
                            throw new Error('Invalid content type. Expected JSON or JSON-LD.');
                        }
                        return [4 /*yield*/, response.json()
                            // Handle different .well-known/wot response formats
                        ];
                    case 3:
                        data = _b.sent();
                        // Handle different .well-known/wot response formats
                        return [2 /*return*/, this.parseWellKnownResponse(data, baseUrl)];
                    case 4:
                        error_3 = _b.sent();
                        if (error_3 instanceof Error && error_3.name === 'AbortError') {
                            throw new Error('Discovery cancelled');
                        }
                        throw new Error("Failed to discover from ".concat(wellKnownUrl, ": ").concat(error_3 instanceof Error ? error_3.message : 'Unknown error'));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Discover a single Thing from a direct TD URL
     */
    DiscoveryService.prototype.discoverSingleThing = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var response, td, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch(url, {
                                headers: {
                                    'Accept': 'application/json, application/ld+json',
                                },
                                timeout: env.DISCOVERY_TIMEOUT,
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        td = _a.sent();
                        return [2 /*return*/, {
                                id: this.generateThingId(td),
                                url: url,
                                thingDescription: td,
                                title: td.title || 'Untitled Thing',
                                description: td.description,
                                discoveryMethod: 'direct-url',
                                lastSeen: new Date().toISOString(),
                                online: true,
                                validationStatus: 'pending',
                            }];
                    case 3:
                        error_4 = _a.sent();
                        throw new Error("Failed to discover Thing from ".concat(url, ": ").concat(error_4 instanceof Error ? error_4.message : 'Unknown error'));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate a Thing Description using browser-compatible validation
     */
    DiscoveryService.prototype.validateTD = function (td) {
        return __awaiter(this, void 0, void 0, function () {
            var simpleTDValidator, validation, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, import('./simpleTdValidation')];
                    case 1:
                        simpleTDValidator = (_a.sent()).simpleTDValidator;
                        validation = simpleTDValidator.validateTD(JSON.stringify(td));
                        return [2 /*return*/, {
                                isValid: validation.isValid,
                                errors: validation.errors,
                                warnings: validation.warnings
                            }];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, {
                                isValid: false,
                                errors: ["Validation error: ".concat(error_5 instanceof Error ? error_5.message : 'Unknown error')],
                                warnings: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel ongoing discovery
     */
    DiscoveryService.prototype.cancelDiscovery = function () {
        if (this.abortController) {
            this.abortController.abort();
        }
    };
    /**
     * Build .well-known/wot URL from base URL
     */
    DiscoveryService.prototype.buildWellKnownUrl = function (baseUrl) {
        var url = new URL(baseUrl);
        url.pathname = env.WELL_KNOWN_PATH;
        return url.toString();
    };
    /**
     * Parse different formats of .well-known/wot responses
     */
    DiscoveryService.prototype.parseWellKnownResponse = function (data, baseUrl) {
        var discovered = [];
        try {
            // Case 1: Direct Thing Description
            if (data['@type'] || data.title) {
                discovered.push({
                    id: this.generateThingId(data),
                    url: baseUrl,
                    thingDescription: data,
                    title: data.title || 'Untitled Thing',
                    description: data.description,
                    discoveryMethod: 'well-known',
                    lastSeen: new Date().toISOString(),
                    online: true,
                    validationStatus: 'pending',
                });
            }
            // Case 2: Array of Thing Descriptions
            else if (Array.isArray(data)) {
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var td = data_1[_i];
                    if (td && typeof td === 'object') {
                        discovered.push({
                            id: this.generateThingId(td),
                            url: baseUrl,
                            thingDescription: td,
                            title: td.title || 'Untitled Thing',
                            description: td.description,
                            discoveryMethod: 'well-known',
                            lastSeen: new Date().toISOString(),
                            online: true,
                            validationStatus: 'pending',
                        });
                    }
                }
            }
            // Case 3: Directory format with links
            else if (data.things || data.links) {
                var things = data.things || data.links || [];
                for (var _a = 0, things_1 = things; _a < things_1.length; _a++) {
                    var link = things_1[_a];
                    if (link.href) {
                        // Fetch TD from link
                        // Note: In a real implementation, you'd want to fetch these TDs
                        // For now, we'll create placeholder entries
                        discovered.push({
                            id: this.generateThingId({ title: link.title || 'Linked Thing' }),
                            url: link.href,
                            thingDescription: { title: link.title || 'Linked Thing', href: link.href },
                            title: link.title || 'Linked Thing',
                            description: link.description,
                            discoveryMethod: 'well-known',
                            lastSeen: new Date().toISOString(),
                            online: true,
                            validationStatus: 'pending',
                        });
                    }
                }
            }
        }
        catch (error) {
            throw new Error("Failed to parse .well-known/wot response: ".concat(error instanceof Error ? error.message : 'Unknown error'));
        }
        return discovered;
    };
    /**
     * Generate a unique ID for a Thing from its TD
     */
    DiscoveryService.prototype.generateThingId = function (td) {
        // Try to use ID from TD, fallback to title-based ID
        if (td.id)
            return td.id;
        if (td['@id'])
            return td['@id'];
        var title = td.title || 'thing';
        var timestamp = Date.now();
        return "".concat(title.toLowerCase().replace(/[^a-z0-9]/g, '-'), "-").concat(timestamp);
    };
    return DiscoveryService;
}());
export var discoveryService = new DiscoveryService();
