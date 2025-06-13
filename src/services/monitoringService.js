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
import { env } from '@/config/env';
var MonitoringService = /** @class */ (function () {
    function MonitoringService() {
        this.subscriptions = new Map();
        this.propertyListeners = new Map();
        this.eventListeners = new Map();
        this.alertListeners = new Set();
        // Mock data generators for development
        this.mockIntervals = new Map();
        this.mockEventGenerators = new Map();
    }
    /**
     * Start monitoring a Thing's properties and/or events
     */
    MonitoringService.prototype.subscribe = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var id, fullSubscription;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        id = "sub_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        fullSubscription = __assign(__assign({}, subscription), { id: id, created: new Date().toISOString() });
                        this.subscriptions.set(id, fullSubscription);
                        if (!(env.NODE_ENV === 'development')) return [3 /*break*/, 1];
                        this.startMockDataGeneration(fullSubscription);
                        return [3 /*break*/, 3];
                    case 1: 
                    // In production, establish real SSE/WebSocket connections
                    return [4 /*yield*/, this.establishConnection(fullSubscription)];
                    case 2:
                        // In production, establish real SSE/WebSocket connections
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, id];
                }
            });
        });
    };
    /**
     * Stop monitoring a subscription
     */
    MonitoringService.prototype.unsubscribe = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, mockInterval, mockEventGen;
            return __generator(this, function (_a) {
                subscription = this.subscriptions.get(subscriptionId);
                if (!subscription)
                    return [2 /*return*/];
                this.subscriptions.delete(subscriptionId);
                mockInterval = this.mockIntervals.get(subscriptionId);
                if (mockInterval) {
                    clearInterval(mockInterval);
                    this.mockIntervals.delete(subscriptionId);
                }
                mockEventGen = this.mockEventGenerators.get(subscriptionId);
                if (mockEventGen) {
                    clearInterval(mockEventGen);
                    this.mockEventGenerators.delete(subscriptionId);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Listen for property value updates
     */
    MonitoringService.prototype.onPropertyUpdate = function (thingId, propertyName, callback) {
        var _this = this;
        var key = "".concat(thingId, ":").concat(propertyName);
        if (!this.propertyListeners.has(key)) {
            this.propertyListeners.set(key, new Set());
        }
        this.propertyListeners.get(key).add(callback);
        return function () {
            var _a;
            (_a = _this.propertyListeners.get(key)) === null || _a === void 0 ? void 0 : _a.delete(callback);
        };
    };
    /**
     * Listen for WoT events
     */
    MonitoringService.prototype.onEvent = function (thingId, eventName, callback) {
        var _this = this;
        var key = "".concat(thingId, ":").concat(eventName);
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, new Set());
        }
        this.eventListeners.get(key).add(callback);
        return function () {
            var _a;
            (_a = _this.eventListeners.get(key)) === null || _a === void 0 ? void 0 : _a.delete(callback);
        };
    };
    /**
     * Listen for alerts
     */
    MonitoringService.prototype.onAlert = function (callback) {
        var _this = this;
        this.alertListeners.add(callback);
        return function () {
            _this.alertListeners.delete(callback);
        };
    };
    /**
     * Get active subscriptions
     */
    MonitoringService.prototype.getSubscriptions = function () {
        return Array.from(this.subscriptions.values());
    };
    /**
     * Acknowledge an alert
     */
    MonitoringService.prototype.acknowledgeAlert = function (alertId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // In development, just simulate acknowledgment
                console.log("Alert ".concat(alertId, " acknowledged by ").concat(userId));
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get property history (mock implementation)
     */
    MonitoringService.prototype.getPropertyHistory = function (thingId, propertyName, startTime, endTime) {
        return __awaiter(this, void 0, void 0, function () {
            var history, start, end, interval, time;
            return __generator(this, function (_a) {
                history = [];
                start = new Date(startTime);
                end = new Date(endTime);
                interval = Math.max(60000, (end.getTime() - start.getTime()) / 100) // Max 100 points
                ;
                for (time = start.getTime(); time <= end.getTime(); time += interval) {
                    history.push({
                        thingId: thingId,
                        thingTitle: "Thing ".concat(thingId),
                        propertyName: propertyName,
                        value: this.generateMockValue(propertyName),
                        timestamp: new Date(time).toISOString(),
                        quality: 'good',
                        dataType: this.getDataType(propertyName),
                    });
                }
                return [2 /*return*/, history];
            });
        });
    };
    /**
     * Start mock data generation for development
     */
    MonitoringService.prototype.startMockDataGeneration = function (subscription) {
        var _this = this;
        if (subscription.type === 'property' || subscription.type === 'all') {
            var interval = setInterval(function () {
                var propertyValue = {
                    thingId: subscription.thingId,
                    thingTitle: "Mock Thing ".concat(subscription.thingId),
                    propertyName: subscription.target || 'temperature',
                    value: _this.generateMockValue(subscription.target || 'temperature'),
                    timestamp: new Date().toISOString(),
                    quality: Math.random() > 0.1 ? 'good' : 'uncertain',
                    dataType: _this.getDataType(subscription.target || 'temperature'),
                };
                _this.notifyPropertyListeners(propertyValue);
            }, 2000 + Math.random() * 3000); // 2-5 second intervals
            this.mockIntervals.set(subscription.id, interval);
        }
        if (subscription.type === 'event' || subscription.type === 'all') {
            var eventInterval = setInterval(function () {
                if (Math.random() > 0.7) { // 30% chance of event
                    var event_1 = {
                        id: "evt_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
                        thingId: subscription.thingId,
                        thingTitle: "Mock Thing ".concat(subscription.thingId),
                        eventName: subscription.target || 'statusChange',
                        data: { reason: 'periodic update', source: 'mock' },
                        timestamp: new Date().toISOString(),
                        severity: _this.getRandomSeverity(),
                        acknowledged: false,
                        description: "Mock event from ".concat(subscription.thingId),
                    };
                    _this.notifyEventListeners(event_1);
                }
            }, 5000 + Math.random() * 10000); // 5-15 second intervals
            this.mockEventGenerators.set(subscription.id, eventInterval);
        }
    };
    /**
     * Establish real SSE/WebSocket connection (production)
     */
    MonitoringService.prototype.establishConnection = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO: Implement real SSE/WebSocket connections to TwinCore Gateway
                console.log('TODO: Establish real connection for subscription:', subscription);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Notify property listeners
     */
    MonitoringService.prototype.notifyPropertyListeners = function (value) {
        var key = "".concat(value.thingId, ":").concat(value.propertyName);
        var listeners = this.propertyListeners.get(key);
        if (listeners) {
            listeners.forEach(function (callback) { return callback(value); });
        }
        // Also notify wildcard listeners
        var wildcardKey = "".concat(value.thingId, ":*");
        var wildcardListeners = this.propertyListeners.get(wildcardKey);
        if (wildcardListeners) {
            wildcardListeners.forEach(function (callback) { return callback(value); });
        }
    };
    /**
     * Notify event listeners
     */
    MonitoringService.prototype.notifyEventListeners = function (event) {
        var key = "".concat(event.thingId, ":").concat(event.eventName);
        var listeners = this.eventListeners.get(key);
        if (listeners) {
            listeners.forEach(function (callback) { return callback(event); });
        }
        // Also notify wildcard listeners
        var wildcardKey = "".concat(event.thingId, ":*");
        var wildcardListeners = this.eventListeners.get(wildcardKey);
        if (wildcardListeners) {
            wildcardListeners.forEach(function (callback) { return callback(event); });
        }
    };
    /**
     * Generate mock values based on property name
     */
    MonitoringService.prototype.generateMockValue = function (propertyName) {
        var name = propertyName.toLowerCase();
        if (name.includes('temperature')) {
            return Math.round((18 + Math.random() * 15) * 10) / 10; // 18-33°C
        }
        if (name.includes('humidity')) {
            return Math.round((30 + Math.random() * 40) * 10) / 10; // 30-70%
        }
        if (name.includes('pressure')) {
            return Math.round((980 + Math.random() * 40) * 10) / 10; // 980-1020 hPa
        }
        if (name.includes('brightness') || name.includes('light')) {
            return Math.round(Math.random() * 1000); // 0-1000 lux
        }
        if (name.includes('power') || name.includes('energy')) {
            return Math.round((10 + Math.random() * 90) * 100) / 100; // 10-100W
        }
        if (name.includes('status') || name.includes('state')) {
            return Math.random() > 0.8 ? 'off' : 'on';
        }
        if (name.includes('level') || name.includes('volume')) {
            return Math.round(Math.random() * 100); // 0-100%
        }
        // Default: random number
        return Math.round(Math.random() * 100 * 100) / 100;
    };
    /**
     * Get data type based on property name
     */
    MonitoringService.prototype.getDataType = function (propertyName) {
        var name = propertyName.toLowerCase();
        if (name.includes('status') || name.includes('state')) {
            return 'string';
        }
        if (name.includes('enabled') || name.includes('active')) {
            return 'boolean';
        }
        return 'number';
    };
    /**
     * Get random severity for mock events
     */
    MonitoringService.prototype.getRandomSeverity = function () {
        var severities = ['info', 'warning', 'error', 'critical'];
        var weights = [0.6, 0.25, 0.1, 0.05]; // Most events are info
        var random = Math.random();
        var cumulative = 0;
        for (var i = 0; i < severities.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return severities[i];
            }
        }
        return 'info';
    };
    /**
     * Cleanup all connections and intervals
     */
    MonitoringService.prototype.dispose = function () {
        // Clear all mock intervals
        this.mockIntervals.forEach(function (interval) { return clearInterval(interval); });
        this.mockIntervals.clear();
        this.mockEventGenerators.forEach(function (interval) { return clearInterval(interval); });
        this.mockEventGenerators.clear();
        // Close connections
        if (this.eventSource) {
            this.eventSource.close();
        }
        if (this.websocket) {
            this.websocket.close();
        }
        // Clear listeners
        this.propertyListeners.clear();
        this.eventListeners.clear();
        this.alertListeners.clear();
    };
    return MonitoringService;
}());
export var monitoringService = new MonitoringService();
