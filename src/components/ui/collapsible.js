"use client";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx } from "react/jsx-runtime";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
function Collapsible(_a) {
    var props = __rest(_a, []);
    return _jsx(CollapsiblePrimitive.Root, __assign({ "data-slot": "collapsible" }, props));
}
function CollapsibleTrigger(_a) {
    var props = __rest(_a, []);
    return (_jsx(CollapsiblePrimitive.CollapsibleTrigger, __assign({ "data-slot": "collapsible-trigger" }, props)));
}
function CollapsibleContent(_a) {
    var props = __rest(_a, []);
    return (_jsx(CollapsiblePrimitive.CollapsibleContent, __assign({ "data-slot": "collapsible-content" }, props)));
}
export { Collapsible, CollapsibleTrigger, CollapsibleContent };
