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
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Radio, Play, Square, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
export function ThingEvents(_a) {
    var thing = _a.thing, events = _a.events;
    var _b = useState({}), subscriptions = _b[0], setSubscriptions = _b[1];
    var _c = useState([]), eventMessages = _c[0], setEventMessages = _c[1];
    var _d = useState(false), isConnected = _d[0], setIsConnected = _d[1];
    var _e = useState(100), maxMessages = _e[0], setMaxMessages = _e[1];
    var eventSourceRef = useRef(null);
    var wsRef = useRef(null);
    var mockIntervalRef = useRef({});
    // Initialize subscriptions
    useEffect(function () {
        var initialSubscriptions = {};
        events.forEach(function (_a) {
            var name = _a[0];
            initialSubscriptions[name] = {
                eventName: name,
                isActive: false,
                messageCount: 0
            };
        });
        setSubscriptions(initialSubscriptions);
    }, [events]);
    // Mock event generation for demo purposes
    var generateMockEvent = function (eventName, eventSchema) {
        var _a;
        var eventId = "event-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
        var mockData;
        if (((_a = eventSchema.data) === null || _a === void 0 ? void 0 : _a.type) === 'object' && eventSchema.data.properties) {
            mockData = {};
            Object.entries(eventSchema.data.properties).forEach(function (_a) {
                var prop = _a[0], schema = _a[1];
                switch (schema.type) {
                    case 'number':
                        mockData[prop] = Math.round((Math.random() * 100) * 100) / 100;
                        break;
                    case 'integer':
                        mockData[prop] = Math.floor(Math.random() * 100);
                        break;
                    case 'boolean':
                        mockData[prop] = Math.random() > 0.5;
                        break;
                    case 'string':
                        if (schema.enum) {
                            mockData[prop] = schema.enum[Math.floor(Math.random() * schema.enum.length)];
                        }
                        else {
                            mockData[prop] = "value-".concat(Math.floor(Math.random() * 1000));
                        }
                        break;
                    default:
                        mockData[prop] = "mock-".concat(Math.floor(Math.random() * 1000));
                }
            });
        }
        else {
            // Generate simple mock data based on event name
            if (eventName.toLowerCase().includes('temperature')) {
                mockData = { temperature: Math.round((Math.random() * 40 + 10) * 100) / 100, unit: 'celsius' };
            }
            else if (eventName.toLowerCase().includes('motion')) {
                mockData = { detected: Math.random() > 0.7, confidence: Math.round(Math.random() * 100) };
            }
            else if (eventName.toLowerCase().includes('error') || eventName.toLowerCase().includes('alert')) {
                mockData = {
                    level: ['info', 'warning', 'error'][Math.floor(Math.random() * 3)],
                    message: 'Mock event message'
                };
            }
            else {
                mockData = {
                    value: Math.floor(Math.random() * 100),
                    status: 'active',
                    timestamp: new Date().toISOString()
                };
            }
        }
        var message = {
            id: eventId,
            eventName: eventName,
            data: mockData,
            timestamp: new Date().toISOString(),
            source: 'mock'
        };
        setEventMessages(function (prev) { return __spreadArray([message], prev.slice(0, maxMessages - 1), true); });
        setSubscriptions(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[eventName] = __assign(__assign({}, prev[eventName]), { messageCount: prev[eventName].messageCount + 1, lastMessage: message }), _a)));
        });
    };
    var toggleSubscription = function (eventName) {
        var _a;
        var currentSub = subscriptions[eventName];
        var newState = !currentSub.isActive;
        setSubscriptions(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[eventName] = __assign(__assign({}, prev[eventName]), { isActive: newState }), _a)));
        });
        if (newState) {
            // Start mock event generation
            var eventSchema_1 = (_a = events.find(function (_a) {
                var name = _a[0];
                return name === eventName;
            })) === null || _a === void 0 ? void 0 : _a[1];
            var interval = setInterval(function () {
                // Generate events at random intervals (1-10 seconds)
                if (Math.random() > 0.3) { // 70% chance per interval
                    generateMockEvent(eventName, eventSchema_1);
                }
            }, Math.random() * 5000 + 2000); // 2-7 seconds
            mockIntervalRef.current[eventName] = interval;
            toast.success("Subscribed to ".concat(eventName, " events"));
        }
        else {
            // Stop mock event generation
            if (mockIntervalRef.current[eventName]) {
                clearInterval(mockIntervalRef.current[eventName]);
                delete mockIntervalRef.current[eventName];
            }
            toast.info("Unsubscribed from ".concat(eventName, " events"));
        }
    };
    var connectToEventStream = function () {
        // In a real implementation, this would connect to the actual Thing's event stream
        // For demo purposes, we'll simulate connection
        setIsConnected(true);
        toast.success('Connected to event stream');
    };
    var disconnectFromEventStream = function () {
        // Stop all subscriptions
        Object.keys(subscriptions).forEach(function (eventName) {
            if (subscriptions[eventName].isActive) {
                toggleSubscription(eventName);
            }
        });
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
        }
        if (wsRef.current) {
            wsRef.current.close();
        }
        setIsConnected(false);
        toast.info('Disconnected from event stream');
    };
    var clearMessages = function () {
        setEventMessages([]);
        setSubscriptions(function (prev) {
            var updated = __assign({}, prev);
            Object.keys(updated).forEach(function (key) {
                updated[key] = __assign(__assign({}, updated[key]), { messageCount: 0, lastMessage: undefined });
            });
            return updated;
        });
        toast.info('Event messages cleared');
    };
    var exportMessages = function () {
        var data = JSON.stringify(eventMessages, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = "".concat(thing.title, "-events-").concat(new Date().toISOString(), ".json");
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Events exported');
    };
    // Cleanup on unmount
    useEffect(function () {
        return function () {
            Object.values(mockIntervalRef.current).forEach(function (interval) { return clearInterval(interval); });
            if (eventSourceRef.current)
                eventSourceRef.current.close();
            if (wsRef.current)
                wsRef.current.close();
        };
    }, []);
    var getEventIcon = function (eventName) {
        var name = eventName.toLowerCase();
        if (name.includes('radio') || name.includes('broadcast')) {
            return _jsx(Radio, { className: "h-4 w-4" });
        }
        return _jsx(Radio, { className: "h-4 w-4" });
    };
    var formatEventData = function (data) {
        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2);
        }
        return String(data);
    };
    if (events.length === 0) {
        return (_jsx(Card, { children: _jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Radio, { className: "h-5 w-5" }), "Events"] }), _jsx(CardDescription, { children: "This Thing has no events defined." })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx(Card, { children: _jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Radio, { className: "h-5 w-5" }), "Event Stream"] }), _jsx(CardDescription, { children: "Real-time event monitoring and subscription management" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: "outline", className: isConnected ?
                                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', children: isConnected ? 'Connected' : 'Disconnected' }), isConnected ? (_jsxs(Button, { onClick: disconnectFromEventStream, variant: "outline", size: "sm", children: [_jsx(Square, { className: "h-3 w-3 mr-2" }), "Disconnect"] })) : (_jsxs(Button, { onClick: connectToEventStream, size: "sm", children: [_jsx(Play, { className: "h-3 w-3 mr-2" }), "Connect"] }))] })] }) }) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 dark:text-gray-100", children: ["Event Subscriptions (", events.length, ")"] }), _jsxs("div", { className: "text-sm text-gray-600 dark:text-gray-400", children: ["Total messages: ", eventMessages.length] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: events.map(function (_a) {
                            var _b;
                            var name = _a[0], event = _a[1];
                            var subscription = subscriptions[name];
                            return (_jsxs(Card, { children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getEventIcon(name), _jsx(CardTitle, { className: "text-sm font-medium", children: event.title || name })] }), _jsx(Switch, { checked: (subscription === null || subscription === void 0 ? void 0 : subscription.isActive) || false, onCheckedChange: function () { return toggleSubscription(name); }, disabled: !isConnected })] }), event.description && (_jsx(CardDescription, { className: "text-xs", children: event.description }))] }), _jsxs(CardContent, { className: "space-y-2", children: [_jsxs("div", { className: "space-y-1 text-xs text-gray-600 dark:text-gray-400", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Messages:" }), _jsx("span", { className: "font-mono", children: (subscription === null || subscription === void 0 ? void 0 : subscription.messageCount) || 0 })] }), (subscription === null || subscription === void 0 ? void 0 : subscription.lastMessage) && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Last Event:" }), _jsx("span", { className: "font-mono", children: new Date(subscription.lastMessage.timestamp).toLocaleTimeString() })] })), ((_b = event.data) === null || _b === void 0 ? void 0 : _b.type) && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Data Type:" }), _jsx("span", { className: "font-mono", children: event.data.type })] }))] }), (subscription === null || subscription === void 0 ? void 0 : subscription.isActive) && (_jsxs("div", { className: "flex items-center gap-1 text-xs text-green-600 dark:text-green-400", children: [_jsx(Radio, { className: "h-3 w-3 animate-pulse" }), _jsx("span", { children: "Listening" })] }))] })] }, name));
                        }) })] }), eventMessages.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Event Messages" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { onClick: exportMessages, variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-3 w-3 mr-2" }), "Export"] }), _jsxs(Button, { onClick: clearMessages, variant: "outline", size: "sm", children: [_jsx(Trash2, { className: "h-3 w-3 mr-2" }), "Clear"] })] })] }) }), _jsx(CardContent, { children: _jsx(ScrollArea, { className: "h-96", children: _jsx("div", { className: "space-y-2", children: eventMessages.map(function (message, index) { return (_jsxs("div", { children: [_jsx("div", { className: "flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded", children: _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx(Badge, { variant: "outline", className: "text-xs", children: message.eventName }), _jsx("span", { className: "text-xs text-gray-600 dark:text-gray-400", children: new Date(message.timestamp).toLocaleString() }), _jsx(Badge, { variant: "outline", className: "text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", children: message.source })] }), _jsx("pre", { className: "text-xs text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono bg-white dark:bg-gray-900 p-2 rounded border", children: formatEventData(message.data) })] }) }), index < eventMessages.length - 1 && _jsx(Separator, { className: "my-2" })] }, message.id)); }) }) }) })] }))] }));
}
