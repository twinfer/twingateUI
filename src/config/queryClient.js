var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { QueryClient } from '@tanstack/react-query';
// Create a query client with sensible defaults for IoT dashboard
export var queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time for IoT data - 30 seconds
            staleTime: 30 * 1000,
            // Cache time - 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests up to 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: function (attemptIndex) { return Math.min(1000 * Math.pow(2, attemptIndex), 30000); },
            // Refetch on window focus for real-time data
            refetchOnWindowFocus: true,
            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
            // Retry delay for mutations
            retryDelay: 1000,
        },
    },
});
// Query keys factory for consistent cache management
export var queryKeys = {
    // Authentication
    auth: {
        user: ['auth', 'user'],
        permissions: ['auth', 'permissions'],
    },
    // Things
    things: {
        all: ['things'],
        lists: function () { return __spreadArray(__spreadArray([], queryKeys.things.all, true), ['list'], false); },
        list: function (filters) { return __spreadArray(__spreadArray([], queryKeys.things.lists(), true), [filters], false); },
        details: function () { return __spreadArray(__spreadArray([], queryKeys.things.all, true), ['detail'], false); },
        detail: function (id) { return __spreadArray(__spreadArray([], queryKeys.things.details(), true), [id], false); },
        properties: function (id) { return __spreadArray(__spreadArray([], queryKeys.things.detail(id), true), ['properties'], false); },
        actions: function (id) { return __spreadArray(__spreadArray([], queryKeys.things.detail(id), true), ['actions'], false); },
        events: function (id) { return __spreadArray(__spreadArray([], queryKeys.things.detail(id), true), ['events'], false); },
    },
    // Discovery
    discovery: {
        all: ['discovery'],
        scan: function (url) { return __spreadArray(__spreadArray([], queryKeys.discovery.all, true), ['scan', url], false); },
        wellKnown: function (url) { return __spreadArray(__spreadArray([], queryKeys.discovery.all, true), ['well-known', url], false); },
    },
    // Streams
    streams: {
        all: ['streams'],
        pipelines: function () { return __spreadArray(__spreadArray([], queryKeys.streams.all, true), ['pipelines'], false); },
        pipeline: function (id) { return __spreadArray(__spreadArray([], queryKeys.streams.pipelines(), true), [id], false); },
    },
    // Configuration
    config: {
        all: ['config'],
        general: function () { return __spreadArray(__spreadArray([], queryKeys.config.all, true), ['general'], false); },
        users: function () { return __spreadArray(__spreadArray([], queryKeys.config.all, true), ['users'], false); },
    },
};
