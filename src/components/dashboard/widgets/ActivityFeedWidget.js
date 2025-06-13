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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Activity, Zap, Radio, Settings, Wifi, Eye, Plus, Edit, Trash2, Clock, User, RefreshCw } from 'lucide-react';
import { useThingsStore } from '@/stores/thingsStore';
import { Link } from 'react-router-dom';
export function ActivityFeedWidget() {
    var _this = this;
    var things = useThingsStore().things;
    var _a = useState([]), activities = _a[0], setActivities = _a[1];
    var _b = useState(false), isRefreshing = _b[0], setIsRefreshing = _b[1];
    // Initialize with some mock activities and add real-time simulation
    useEffect(function () {
        var initialActivities = [
            {
                id: 'act-1',
                type: 'user_login',
                title: 'User logged in',
                description: 'Admin user successfully authenticated',
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
                userId: 'admin-user-123',
                userName: 'Admin User'
            },
            {
                id: 'act-2',
                type: 'device_connected',
                title: 'Device came online',
                description: 'Coffee Machine is now connected and responding',
                timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                deviceId: 'coffee-machine-1',
                deviceName: 'Advanced Coffee Machine'
            },
            {
                id: 'act-3',
                type: 'action_executed',
                title: 'Action executed',
                description: 'makeDrink action completed successfully',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                deviceId: 'coffee-machine-1',
                deviceName: 'Advanced Coffee Machine'
            },
            {
                id: 'act-4',
                type: 'property_updated',
                title: 'Property updated',
                description: 'Temperature reading changed to 23.5°C',
                timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                deviceId: 'temp-sensor-1',
                deviceName: 'Temperature Sensor'
            },
            {
                id: 'act-5',
                type: 'device_discovered',
                title: 'New device discovered',
                description: 'Smart Light bulb found via .well-known/wot',
                timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
                deviceId: 'smart-light-1',
                deviceName: 'Smart Light Bulb'
            }
        ];
        setActivities(initialActivities);
        // Simulate real-time activities
        var interval = setInterval(function () {
            if (Math.random() > 0.3) { // 70% chance to add activity
                var newActivity_1 = generateRandomActivity();
                setActivities(function (prev) { return __spreadArray([newActivity_1], prev.slice(0, 49), true); }); // Keep last 50 activities
            }
        }, 10000); // Every 10 seconds
        return function () { return clearInterval(interval); };
    }, [things]);
    var generateRandomActivity = function () {
        var _a, _b, _c, _d;
        var activityTypes = [
            'property_updated',
            'action_executed',
            'event_received',
            'device_connected',
            'device_disconnected'
        ];
        var randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        var randomThing = things[Math.floor(Math.random() * things.length)];
        var id = "act-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
        switch (randomType) {
            case 'property_updated':
                var properties = (_a = randomThing === null || randomThing === void 0 ? void 0 : randomThing.thingDescription) === null || _a === void 0 ? void 0 : _a.properties;
                var propNames = properties ? Object.keys(properties) : ['temperature', 'humidity', 'status'];
                var randomProp = propNames[Math.floor(Math.random() * propNames.length)];
                var randomValue = Math.round(Math.random() * 100);
                return {
                    id: id,
                    type: randomType,
                    title: 'Property updated',
                    description: "".concat(randomProp, " changed to ").concat(randomValue).concat(((_b = properties === null || properties === void 0 ? void 0 : properties[randomProp]) === null || _b === void 0 ? void 0 : _b.unit) || ''),
                    timestamp: new Date().toISOString(),
                    deviceId: randomThing === null || randomThing === void 0 ? void 0 : randomThing.id,
                    deviceName: randomThing === null || randomThing === void 0 ? void 0 : randomThing.title
                };
            case 'action_executed':
                var actions = (_c = randomThing === null || randomThing === void 0 ? void 0 : randomThing.thingDescription) === null || _c === void 0 ? void 0 : _c.actions;
                var actionNames = actions ? Object.keys(actions) : ['toggle', 'refresh', 'reset'];
                var randomAction = actionNames[Math.floor(Math.random() * actionNames.length)];
                return {
                    id: id,
                    type: randomType,
                    title: 'Action executed',
                    description: "".concat(randomAction, " action completed successfully"),
                    timestamp: new Date().toISOString(),
                    deviceId: randomThing === null || randomThing === void 0 ? void 0 : randomThing.id,
                    deviceName: randomThing === null || randomThing === void 0 ? void 0 : randomThing.title
                };
            case 'event_received':
                var events = (_d = randomThing === null || randomThing === void 0 ? void 0 : randomThing.thingDescription) === null || _d === void 0 ? void 0 : _d.events;
                var eventNames = events ? Object.keys(events) : ['alert', 'notification', 'warning'];
                var randomEvent = eventNames[Math.floor(Math.random() * eventNames.length)];
                return {
                    id: id,
                    type: randomType,
                    title: 'Event received',
                    description: "".concat(randomEvent, " event triggered"),
                    timestamp: new Date().toISOString(),
                    deviceId: randomThing === null || randomThing === void 0 ? void 0 : randomThing.id,
                    deviceName: randomThing === null || randomThing === void 0 ? void 0 : randomThing.title
                };
            case 'device_connected':
                return {
                    id: id,
                    type: randomType,
                    title: 'Device connected',
                    description: "".concat((randomThing === null || randomThing === void 0 ? void 0 : randomThing.title) || 'Device', " came online"),
                    timestamp: new Date().toISOString(),
                    deviceId: randomThing === null || randomThing === void 0 ? void 0 : randomThing.id,
                    deviceName: randomThing === null || randomThing === void 0 ? void 0 : randomThing.title
                };
            case 'device_disconnected':
                return {
                    id: id,
                    type: randomType,
                    title: 'Device disconnected',
                    description: "".concat((randomThing === null || randomThing === void 0 ? void 0 : randomThing.title) || 'Device', " went offline"),
                    timestamp: new Date().toISOString(),
                    deviceId: randomThing === null || randomThing === void 0 ? void 0 : randomThing.id,
                    deviceName: randomThing === null || randomThing === void 0 ? void 0 : randomThing.title
                };
            default:
                return {
                    id: id,
                    type: 'property_updated',
                    title: 'System activity',
                    description: 'General system activity occurred',
                    timestamp: new Date().toISOString()
                };
        }
    };
    var getActivityIcon = function (type) {
        switch (type) {
            case 'device_discovered':
            case 'device_connected':
                return _jsx(Wifi, { className: "h-4 w-4 text-green-500" });
            case 'device_disconnected':
                return _jsx(Wifi, { className: "h-4 w-4 text-red-500" });
            case 'action_executed':
                return _jsx(Zap, { className: "h-4 w-4 text-blue-500" });
            case 'property_updated':
                return _jsx(Activity, { className: "h-4 w-4 text-orange-500" });
            case 'event_received':
                return _jsx(Radio, { className: "h-4 w-4 text-purple-500" });
            case 'thing_created':
                return _jsx(Plus, { className: "h-4 w-4 text-green-500" });
            case 'thing_updated':
                return _jsx(Edit, { className: "h-4 w-4 text-blue-500" });
            case 'thing_deleted':
                return _jsx(Trash2, { className: "h-4 w-4 text-red-500" });
            case 'user_login':
                return _jsx(User, { className: "h-4 w-4 text-indigo-500" });
            default:
                return _jsx(Settings, { className: "h-4 w-4 text-gray-500" });
        }
    };
    var getActivityColor = function (type) {
        switch (type) {
            case 'device_discovered':
            case 'device_connected':
            case 'thing_created':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'device_disconnected':
            case 'thing_deleted':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'action_executed':
            case 'thing_updated':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'property_updated':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'event_received':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'user_login':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };
    var formatTimeAgo = function (timestamp) {
        var now = new Date();
        var time = new Date(timestamp);
        var diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);
        if (diffInSeconds < 60)
            return "".concat(diffInSeconds, "s ago");
        if (diffInSeconds < 3600)
            return "".concat(Math.floor(diffInSeconds / 60), "m ago");
        if (diffInSeconds < 86400)
            return "".concat(Math.floor(diffInSeconds / 3600), "h ago");
        return "".concat(Math.floor(diffInSeconds / 86400), "d ago");
    };
    var refreshActivities = function () { return __awaiter(_this, void 0, void 0, function () {
        var newActivities;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsRefreshing(true);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })
                        // Add a few new mock activities
                    ];
                case 1:
                    // Simulate API call
                    _a.sent();
                    newActivities = Array.from({ length: 3 }, function () { return generateRandomActivity(); });
                    setActivities(function (prev) { return __spreadArray(__spreadArray([], newActivities, true), prev.slice(0, 47), true); });
                    setIsRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    return (_jsxs(Card, { className: "h-[500px]", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5" }), "Activity Feed"] }), _jsx(CardDescription, { children: "Real-time system activities and device events" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: refreshActivities, disabled: isRefreshing, children: [_jsx(RefreshCw, { className: "h-3 w-3 mr-2 ".concat(isRefreshing ? 'animate-spin' : '') }), "Refresh"] })] }) }), _jsx(CardContent, { className: "p-0", children: _jsx(ScrollArea, { className: "h-[400px] px-6", children: _jsx("div", { className: "space-y-3", children: activities.map(function (activity, index) { return (_jsxs("div", { children: [_jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "flex-shrink-0 mt-1", children: getActivityIcon(activity.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 dark:text-gray-100", children: activity.title }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: "text-xs ".concat(getActivityColor(activity.type)), children: activity.type.replace('_', ' ') }), _jsxs("span", { className: "text-xs text-gray-500 flex items-center", children: [_jsx(Clock, { className: "h-3 w-3 mr-1" }), formatTimeAgo(activity.timestamp)] })] })] }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mt-1", children: activity.description }), activity.deviceId && activity.deviceName && (_jsx("div", { className: "mt-2", children: _jsx(Button, { variant: "ghost", size: "sm", asChild: true, children: _jsxs(Link, { to: "/things/".concat(activity.deviceId), className: "text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center", children: [_jsx(Eye, { className: "h-3 w-3 mr-1" }), "View ", activity.deviceName] }) }) }))] })] }), index < activities.length - 1 && _jsx(Separator, { className: "my-3" })] }, activity.id)); }) }) }) })] }));
}
