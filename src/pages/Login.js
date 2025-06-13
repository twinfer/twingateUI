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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Cpu, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
var loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});
export function Login() {
    var _a = useState(false), showPassword = _a[0], setShowPassword = _a[1];
    var loginMutation = useLogin();
    var _b = useForm({
        resolver: zodResolver(loginSchema),
    }), register = _b.register, handleSubmit = _b.handleSubmit, _c = _b.formState, errors = _c.errors, isSubmitting = _c.isSubmitting;
    var onSubmit = function (data) {
        loginMutation.mutate(data);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { className: "text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: _jsx("div", { className: "p-3 bg-blue-600 rounded-full", children: _jsx(Cpu, { className: "h-8 w-8 text-white" }) }) }), _jsx(CardTitle, { className: "text-2xl font-bold", children: "TwinCore Gateway" }), _jsx(CardDescription, { children: "Sign in to your WoT Dashboard" })] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, __assign({ id: "email", type: "email", placeholder: "Enter your email" }, register('email'), { className: errors.email ? 'border-red-500' : '' })), errors.email && (_jsx("p", { className: "text-sm text-red-500", children: errors.email.message }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsxs("div", { className: "relative", children: [_jsx(Input, __assign({ id: "password", type: showPassword ? 'text' : 'password', placeholder: "Enter your password" }, register('password'), { className: errors.password ? 'border-red-500 pr-10' : 'pr-10' })), _jsx("button", { type: "button", onClick: function () { return setShowPassword(!showPassword); }, className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700", children: showPassword ? (_jsx(EyeOff, { className: "h-4 w-4" })) : (_jsx(Eye, { className: "h-4 w-4" })) })] }), errors.password && (_jsx("p", { className: "text-sm text-red-500", children: errors.password.message }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting || loginMutation.isPending, children: isSubmitting || loginMutation.isPending ? 'Signing in...' : 'Sign in' })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("p", { className: "text-sm text-gray-600", children: "Demo credentials: admin@example.com / password" }) })] })] }) }));
}
