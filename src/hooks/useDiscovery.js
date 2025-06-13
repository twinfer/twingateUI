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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { discoveryService } from '@/services/discoveryService';
import { queryKeys } from '@/config/queryClient';
import { useToast } from '@/stores/uiStore';
import { useThingsStore } from '@/stores/thingsStore';
import { useState, useCallback } from 'react';
export function useDiscoverThings() {
    var _this = this;
    var showToast = useToast().showToast;
    var _a = useState(null), progress = _a[0], setProgress = _a[1];
    var mutation = useMutation({
        mutationFn: function (baseUrls) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                setProgress({
                    total: baseUrls.length,
                    completed: 0,
                    current: '',
                    status: 'scanning'
                });
                return [2 /*return*/, discoveryService.discoverThings(baseUrls, setProgress)];
            });
        }); },
        onSuccess: function (result) {
            var discovered = result.discovered, errors = result.errors;
            showToast({
                title: 'Discovery completed',
                description: "Found ".concat(discovered.length, " Things").concat(errors.length > 0 ? " (".concat(errors.length, " errors)") : ''),
                type: discovered.length > 0 ? 'success' : 'warning',
            });
            // Update discovered things in store
            var setDiscoveredThings = useThingsStore.getState().setDiscoveredThings;
            setDiscoveredThings(discovered.map(transformDiscoveredThing));
        },
        onError: function (error) {
            showToast({
                title: 'Discovery failed',
                description: error.message,
                type: 'error',
            });
            setProgress(null);
        },
        onSettled: function () {
            setProgress(null);
        }
    });
    var cancelDiscovery = useCallback(function () {
        discoveryService.cancelDiscovery();
        mutation.reset();
        setProgress(null);
    }, [mutation]);
    return {
        discoverThings: mutation.mutate,
        isDiscovering: mutation.isPending,
        progress: progress,
        result: mutation.data,
        error: mutation.error,
        cancelDiscovery: cancelDiscovery,
    };
}
export function useDiscoverSingleThing() {
    var showToast = useToast().showToast;
    var addDiscoveredThing = useThingsStore().addDiscoveredThing;
    return useMutation({
        mutationFn: function (url) { return discoveryService.discoverSingleThing(url); },
        onSuccess: function (discovered) {
            showToast({
                title: 'Thing discovered',
                description: "Found \"".concat(discovered.title, "\""),
                type: 'success',
            });
            // Add to discovered things
            addDiscoveredThing(transformDiscoveredThing(discovered));
        },
        onError: function (error) {
            showToast({
                title: 'Discovery failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useValidateTD() {
    var showToast = useToast().showToast;
    return useMutation({
        mutationFn: function (td) { return discoveryService.validateTD(td); },
        onSuccess: function (result) {
            var isValid = result.isValid, errors = result.errors, warnings = result.warnings;
            if (isValid) {
                showToast({
                    title: 'Thing Description is valid',
                    description: warnings.length > 0 ? "".concat(warnings.length, " warnings found") : undefined,
                    type: 'success',
                });
            }
            else {
                showToast({
                    title: 'Thing Description is invalid',
                    description: "".concat(errors.length, " errors found"),
                    type: 'error',
                });
            }
        },
        onError: function (error) {
            showToast({
                title: 'Validation failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useImportThing() {
    var _this = this;
    var queryClient = useQueryClient();
    var showToast = useToast().showToast;
    var importDiscoveredThing = useThingsStore().importDiscoveredThing;
    return useMutation({
        mutationFn: function (discoveredThing) { return __awaiter(_this, void 0, void 0, function () {
            var thing;
            return __generator(this, function (_a) {
                thing = transformDiscoveredThing(discoveredThing);
                // In a real app, you might want to save to backend here
                // For now, we'll just add to local store
                return [2 /*return*/, thing];
            });
        }); },
        onSuccess: function (thing) {
            importDiscoveredThing(thing);
            // Invalidate things queries to refetch
            queryClient.invalidateQueries({ queryKey: queryKeys.things.all });
            showToast({
                title: 'Thing imported',
                description: "\"".concat(thing.title, "\" has been added to your Things"),
                type: 'success',
            });
        },
        onError: function (error) {
            showToast({
                title: 'Import failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
export function useImportMultipleThings() {
    var _this = this;
    var showToast = useToast().showToast;
    var setDiscoveredThings = useThingsStore().setDiscoveredThings;
    var queryClient = useQueryClient();
    return useMutation({
        mutationFn: function (discoveredThings) { return __awaiter(_this, void 0, void 0, function () {
            var things, importDiscoveredThing, _i, things_1, thing;
            return __generator(this, function (_a) {
                things = discoveredThings.map(transformDiscoveredThing);
                importDiscoveredThing = useThingsStore.getState().importDiscoveredThing;
                for (_i = 0, things_1 = things; _i < things_1.length; _i++) {
                    thing = things_1[_i];
                    importDiscoveredThing(thing);
                }
                return [2 /*return*/, things];
            });
        }); },
        onSuccess: function (things) {
            // Clear discovered things after import
            setDiscoveredThings([]);
            // Invalidate things queries
            queryClient.invalidateQueries({ queryKey: queryKeys.things.all });
            showToast({
                title: 'Things imported',
                description: "".concat(things.length, " Things have been imported successfully"),
                type: 'success',
            });
        },
        onError: function (error) {
            showToast({
                title: 'Batch import failed',
                description: error.message,
                type: 'error',
            });
        },
    });
}
// Utility function to transform DiscoveredThing to Thing
function transformDiscoveredThing(discovered) {
    return {
        id: discovered.id,
        title: discovered.title,
        description: discovered.description,
        thingDescription: discovered.thingDescription,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        online: discovered.online,
        status: discovered.online ? 'online' : 'unknown',
        url: discovered.url,
        lastSeen: new Date().toISOString(),
        discoveryMethod: discovered.discoveryMethod,
        properties: extractProperties(discovered.thingDescription),
        actions: extractActions(discovered.thingDescription),
        events: extractEvents(discovered.thingDescription),
        tags: extractTags(discovered.thingDescription),
        category: extractCategory(discovered.thingDescription),
    };
}
// Utility functions to extract TD components
function extractProperties(td) {
    if (!td.properties)
        return [];
    return Object.entries(td.properties).map(function (_a) {
        var key = _a[0], prop = _a[1];
        return ({
            id: key,
            name: prop.title || key,
            type: prop.type || 'unknown',
            value: null, // Will be populated when reading
            lastUpdated: new Date().toISOString(),
            writable: prop.writeOnly !== true,
            observable: prop.observable === true,
        });
    });
}
function extractActions(td) {
    if (!td.actions)
        return [];
    return Object.entries(td.actions).map(function (_a) {
        var key = _a[0], action = _a[1];
        return ({
            id: key,
            name: action.title || key,
            input: action.input,
            output: action.output,
            description: action.description,
        });
    });
}
function extractEvents(td) {
    if (!td.events)
        return [];
    return Object.entries(td.events).map(function (_a) {
        var key = _a[0], event = _a[1];
        return ({
            id: key,
            name: event.title || key,
            data: event.data,
            description: event.description,
        });
    });
}
function extractTags(td) {
    var tags = [];
    // Extract from @type
    if (td['@type']) {
        var types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']];
        tags.push.apply(tags, types.filter(function (type) { return typeof type === 'string'; }));
    }
    // Extract from security schemes
    if (td.securityDefinitions) {
        Object.keys(td.securityDefinitions).forEach(function (scheme) {
            tags.push("security:".concat(scheme));
        });
    }
    return tags;
}
function extractCategory(td) {
    // Try to determine category from @type or other metadata
    if (td['@type']) {
        var types = Array.isArray(td['@type']) ? td['@type'] : [td['@type']];
        // Common IoT device categories
        for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
            var type = types_1[_i];
            if (typeof type === 'string') {
                if (type.includes('Sensor'))
                    return 'sensor';
                if (type.includes('Actuator'))
                    return 'actuator';
                if (type.includes('Light'))
                    return 'lighting';
                if (type.includes('Thermostat') || type.includes('Temperature'))
                    return 'climate';
                if (type.includes('Camera') || type.includes('Video'))
                    return 'security';
                if (type.includes('Motor') || type.includes('Pump'))
                    return 'actuator';
            }
        }
    }
    return 'other';
}
