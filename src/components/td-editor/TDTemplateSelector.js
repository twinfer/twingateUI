import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, FileText, Thermometer, Lightbulb, Settings, Shield, Code2 } from 'lucide-react';
import { tdTemplates, tdSnippets, getTemplatesByCategory, getSnippetsByCategory } from '@/data/tdTemplates';
export function TDTemplateSelector(_a) {
    var open = _a.open, onOpenChange = _a.onOpenChange, onSelect = _a.onSelect, onSnippetSelect = _a.onSnippetSelect;
    var _b = useState(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState('all'), selectedCategory = _c[0], setSelectedCategory = _c[1];
    var getCategoryIcon = function (category) {
        switch (category) {
            case 'basic': return _jsx(FileText, { className: "h-4 w-4" });
            case 'sensor': return _jsx(Thermometer, { className: "h-4 w-4" });
            case 'actuator': return _jsx(Lightbulb, { className: "h-4 w-4" });
            case 'complex': return _jsx(Settings, { className: "h-4 w-4" });
            case 'security': return _jsx(Shield, { className: "h-4 w-4" });
            default: return _jsx(FileText, { className: "h-4 w-4" });
        }
    };
    var getSnippetIcon = function (category) {
        switch (category) {
            case 'property': return _jsx(FileText, { className: "h-4 w-4" });
            case 'action': return _jsx(Settings, { className: "h-4 w-4" });
            case 'event': return _jsx(Lightbulb, { className: "h-4 w-4" });
            case 'security': return _jsx(Shield, { className: "h-4 w-4" });
            case 'form': return _jsx(Code2, { className: "h-4 w-4" });
            default: return _jsx(FileText, { className: "h-4 w-4" });
        }
    };
    var filteredTemplates = tdTemplates.filter(function (template) {
        var matchesSearch = searchQuery === '' ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some(function (tag) { return tag.toLowerCase().includes(searchQuery.toLowerCase()); });
        var matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    var filteredSnippets = tdSnippets.filter(function (snippet) {
        var matchesSearch = searchQuery === '' ||
            snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });
    var templateCategories = [
        { id: 'all', name: 'All Templates', count: tdTemplates.length },
        { id: 'basic', name: 'Basic', count: getTemplatesByCategory('basic').length },
        { id: 'sensor', name: 'Sensors', count: getTemplatesByCategory('sensor').length },
        { id: 'actuator', name: 'Actuators', count: getTemplatesByCategory('actuator').length },
        { id: 'complex', name: 'Complex', count: getTemplatesByCategory('complex').length },
        { id: 'security', name: 'Security', count: getTemplatesByCategory('security').length },
    ];
    var snippetCategories = [
        { id: 'property', name: 'Properties', count: getSnippetsByCategory('property').length },
        { id: 'action', name: 'Actions', count: getSnippetsByCategory('action').length },
        { id: 'event', name: 'Events', count: getSnippetsByCategory('event').length },
        { id: 'security', name: 'Security', count: getSnippetsByCategory('security').length },
        { id: 'form', name: 'Forms', count: getSnippetsByCategory('form').length },
    ];
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-hidden", children: [_jsxs(DialogHeader, { children: [_jsx(DialogTitle, { children: "Thing Description Templates & Snippets" }), _jsx(DialogDescription, { children: "Choose a template to start with or browse snippets to add specific components" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }), _jsx(Input, { placeholder: "Search templates and snippets...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-10" })] }), _jsxs(Tabs, { defaultValue: "templates", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsx(TabsTrigger, { value: "templates", children: "Templates" }), _jsx(TabsTrigger, { value: "snippets", children: "Snippets" })] }), _jsxs(TabsContent, { value: "templates", className: "space-y-4", children: [_jsx("div", { className: "flex flex-wrap gap-2", children: templateCategories.map(function (category) { return (_jsxs(Button, { variant: selectedCategory === category.id ? 'default' : 'outline', size: "sm", onClick: function () { return setSelectedCategory(category.id); }, children: [category.name, " (", category.count, ")"] }, category.id)); }) }), _jsx(ScrollArea, { className: "h-[400px]", children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 pr-4", children: filteredTemplates.map(function (template) { return (_jsxs(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", onClick: function () { return onSelect(template); }, children: [_jsxs(CardHeader, { className: "pb-3", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getCategoryIcon(template.category), _jsx(CardTitle, { className: "text-sm", children: template.name })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: template.category })] }), _jsx(CardDescription, { className: "text-xs", children: template.description })] }), _jsx(CardContent, { className: "pt-0", children: _jsx("div", { className: "flex flex-wrap gap-1", children: template.tags.map(function (tag) { return (_jsx(Badge, { variant: "secondary", className: "text-xs", children: tag }, tag)); }) }) })] }, template.id)); }) }) })] }), _jsxs(TabsContent, { value: "snippets", className: "space-y-4", children: [_jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2", children: snippetCategories.map(function (category) { return (_jsx(Card, { className: "text-center", children: _jsx(CardContent, { className: "p-3", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [getSnippetIcon(category.id), _jsx("div", { className: "text-sm font-medium", children: category.name }), _jsx(Badge, { variant: "outline", className: "text-xs", children: category.count })] }) }) }, category.id)); }) }), _jsx(ScrollArea, { className: "h-[300px]", children: _jsx("div", { className: "space-y-2 pr-4", children: filteredSnippets.map(function (snippet) { return (_jsx(Card, { className: "cursor-pointer hover:shadow-md transition-shadow", onClick: function () { return onSnippetSelect === null || onSnippetSelect === void 0 ? void 0 : onSnippetSelect(snippet); }, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [getSnippetIcon(snippet.category), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: snippet.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: snippet.description })] })] }), _jsx(Badge, { variant: "outline", className: "text-xs", children: snippet.category })] }), _jsx("div", { className: "mt-2", children: _jsxs("pre", { className: "text-xs bg-muted p-2 rounded overflow-x-auto", children: [snippet.insertText.split('\n').slice(0, 3).join('\n'), snippet.insertText.split('\n').length > 3 && '\n...'] }) })] }) }, snippet.id)); }) }) })] })] }), filteredTemplates.length === 0 && filteredSnippets.length === 0 && (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No templates or snippets found matching your search." }))] })] }) }));
}
