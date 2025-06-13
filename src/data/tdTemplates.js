export var tdTemplates = [
    {
        id: 'basic-thing',
        name: 'Basic Thing',
        description: 'A minimal Thing Description with just the required fields',
        category: 'basic',
        tags: ['minimal', 'starter'],
        template: {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1",
                { "@language": "en" }
            ],
            "@type": "Thing",
            "title": "My Basic Thing",
            "description": "A simple Thing Description",
            "securityDefinitions": {
                "nosec_sc": { "scheme": "nosec" }
            },
            "security": ["nosec_sc"]
        }
    },
    {
        id: 'temperature-sensor',
        name: 'Temperature Sensor',
        description: 'A temperature sensor with readable temperature property',
        category: 'sensor',
        tags: ['sensor', 'temperature', 'iot'],
        template: {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1",
                { "@language": "en" }
            ],
            "@type": ["Thing", "Sensor"],
            "title": "Temperature Sensor",
            "description": "A smart temperature sensor",
            "properties": {
                "temperature": {
                    "type": "number",
                    "title": "Temperature",
                    "description": "Current temperature reading",
                    "unit": "celsius",
                    "minimum": -40,
                    "maximum": 85,
                    "readOnly": true,
                    "observable": true,
                    "forms": [{
                            "href": "properties/temperature",
                            "contentType": "application/json",
                            "op": ["readproperty", "observeproperty"]
                        }]
                },
                "lastUpdate": {
                    "type": "string",
                    "format": "date-time",
                    "title": "Last Update",
                    "description": "Timestamp of last measurement",
                    "readOnly": true,
                    "forms": [{
                            "href": "properties/lastUpdate",
                            "contentType": "application/json"
                        }]
                }
            },
            "events": {
                "temperatureAlert": {
                    "title": "Temperature Alert",
                    "description": "Triggered when temperature exceeds thresholds",
                    "data": {
                        "type": "object",
                        "properties": {
                            "temperature": { "type": "number" },
                            "threshold": { "type": "number" },
                            "alertType": { "type": "string", "enum": ["high", "low"] },
                            "timestamp": { "type": "string", "format": "date-time" }
                        }
                    },
                    "forms": [{
                            "href": "events/temperatureAlert",
                            "contentType": "application/json",
                            "subprotocol": "longpoll"
                        }]
                }
            },
            "securityDefinitions": {
                "basic_sc": {
                    "scheme": "basic",
                    "in": "header"
                }
            },
            "security": ["basic_sc"]
        }
    },
    {
        id: 'smart-light',
        name: 'Smart Light',
        description: 'A controllable smart light with dimming and color',
        category: 'actuator',
        tags: ['actuator', 'light', 'smart-home'],
        template: {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1",
                { "@language": "en" }
            ],
            "@type": ["Thing", "Light"],
            "title": "Smart LED Light",
            "description": "A smart LED light with dimming and color control",
            "properties": {
                "on": {
                    "type": "boolean",
                    "title": "On/Off",
                    "description": "Whether the light is on or off",
                    "observable": true,
                    "forms": [{
                            "href": "properties/on",
                            "contentType": "application/json"
                        }]
                },
                "brightness": {
                    "type": "integer",
                    "title": "Brightness",
                    "description": "Current brightness level",
                    "minimum": 0,
                    "maximum": 100,
                    "unit": "percent",
                    "observable": true,
                    "forms": [{
                            "href": "properties/brightness",
                            "contentType": "application/json"
                        }]
                },
                "color": {
                    "type": "object",
                    "title": "Color",
                    "description": "Current color in RGB format",
                    "properties": {
                        "r": { "type": "integer", "minimum": 0, "maximum": 255 },
                        "g": { "type": "integer", "minimum": 0, "maximum": 255 },
                        "b": { "type": "integer", "minimum": 0, "maximum": 255 }
                    },
                    "forms": [{
                            "href": "properties/color",
                            "contentType": "application/json"
                        }]
                }
            },
            "actions": {
                "toggle": {
                    "title": "Toggle",
                    "description": "Toggle the light on/off",
                    "safe": false,
                    "idempotent": false,
                    "forms": [{
                            "href": "actions/toggle",
                            "contentType": "application/json"
                        }]
                },
                "fade": {
                    "title": "Fade",
                    "description": "Fade to target brightness over time",
                    "input": {
                        "type": "object",
                        "properties": {
                            "brightness": { "type": "integer", "minimum": 0, "maximum": 100 },
                            "duration": { "type": "integer", "minimum": 0, "maximum": 10000, "unit": "milliseconds" }
                        },
                        "required": ["brightness", "duration"]
                    },
                    "output": {
                        "type": "object",
                        "properties": {
                            "success": { "type": "boolean" }
                        }
                    },
                    "forms": [{
                            "href": "actions/fade",
                            "contentType": "application/json"
                        }]
                }
            },
            "securityDefinitions": {
                "psk_sc": {
                    "scheme": "psk",
                    "identity": "light001"
                }
            },
            "security": ["psk_sc"]
        }
    },
    {
        id: 'thermostat',
        name: 'Smart Thermostat',
        description: 'A comprehensive smart thermostat with scheduling',
        category: 'complex',
        tags: ['hvac', 'thermostat', 'smart-home', 'complex'],
        template: {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1",
                { "@language": "en" }
            ],
            "@type": ["Thing", "Thermostat"],
            "title": "Smart Thermostat",
            "description": "A smart thermostat with temperature control and scheduling",
            "version": { "instance": "1.0.0" },
            "support": "https://example.com/support",
            "properties": {
                "currentTemperature": {
                    "type": "number",
                    "title": "Current Temperature",
                    "description": "Current room temperature",
                    "unit": "celsius",
                    "readOnly": true,
                    "observable": true,
                    "forms": [{
                            "href": "properties/currentTemperature",
                            "contentType": "application/json"
                        }]
                },
                "targetTemperature": {
                    "type": "number",
                    "title": "Target Temperature",
                    "description": "Desired room temperature",
                    "unit": "celsius",
                    "minimum": 10,
                    "maximum": 35,
                    "observable": true,
                    "forms": [{
                            "href": "properties/targetTemperature",
                            "contentType": "application/json"
                        }]
                },
                "mode": {
                    "type": "string",
                    "title": "Operating Mode",
                    "description": "Current operating mode",
                    "enum": ["off", "heat", "cool", "auto"],
                    "observable": true,
                    "forms": [{
                            "href": "properties/mode",
                            "contentType": "application/json"
                        }]
                },
                "humidity": {
                    "type": "number",
                    "title": "Humidity",
                    "description": "Current humidity level",
                    "unit": "percent",
                    "minimum": 0,
                    "maximum": 100,
                    "readOnly": true,
                    "observable": true,
                    "forms": [{
                            "href": "properties/humidity",
                            "contentType": "application/json"
                        }]
                }
            },
            "actions": {
                "setSchedule": {
                    "title": "Set Schedule",
                    "description": "Set a temperature schedule",
                    "input": {
                        "type": "object",
                        "properties": {
                            "schedule": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "time": { "type": "string", "pattern": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$" },
                                        "temperature": { "type": "number", "minimum": 10, "maximum": 35 },
                                        "days": { "type": "array", "items": { "type": "string", "enum": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] } }
                                    },
                                    "required": ["time", "temperature", "days"]
                                }
                            }
                        },
                        "required": ["schedule"]
                    },
                    "forms": [{
                            "href": "actions/setSchedule",
                            "contentType": "application/json"
                        }]
                },
                "boost": {
                    "title": "Boost Heating/Cooling",
                    "description": "Temporarily boost heating or cooling",
                    "input": {
                        "type": "object",
                        "properties": {
                            "duration": { "type": "integer", "minimum": 5, "maximum": 120, "unit": "minutes" },
                            "targetTemperature": { "type": "number", "minimum": 10, "maximum": 35 }
                        },
                        "required": ["duration"]
                    },
                    "forms": [{
                            "href": "actions/boost",
                            "contentType": "application/json"
                        }]
                }
            },
            "events": {
                "temperatureReached": {
                    "title": "Target Temperature Reached",
                    "description": "Triggered when target temperature is reached",
                    "data": {
                        "type": "object",
                        "properties": {
                            "targetTemperature": { "type": "number" },
                            "currentTemperature": { "type": "number" },
                            "timestamp": { "type": "string", "format": "date-time" }
                        }
                    },
                    "forms": [{
                            "href": "events/temperatureReached",
                            "contentType": "application/json"
                        }]
                },
                "maintenanceRequired": {
                    "title": "Maintenance Required",
                    "description": "System requires maintenance",
                    "data": {
                        "type": "object",
                        "properties": {
                            "component": { "type": "string" },
                            "severity": { "type": "string", "enum": ["low", "medium", "high"] },
                            "message": { "type": "string" },
                            "timestamp": { "type": "string", "format": "date-time" }
                        }
                    },
                    "forms": [{
                            "href": "events/maintenanceRequired",
                            "contentType": "application/json"
                        }]
                }
            },
            "securityDefinitions": {
                "oauth2_sc": {
                    "scheme": "oauth2",
                    "flow": "client_credentials",
                    "token": "https://auth.example.com/token",
                    "scopes": ["thermostat:read", "thermostat:write"]
                }
            },
            "security": ["oauth2_sc"]
        }
    },
    {
        id: 'secure-camera',
        name: 'Security Camera',
        description: 'A security camera with authentication and streaming',
        category: 'security',
        tags: ['security', 'camera', 'streaming', 'authentication'],
        template: {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1",
                { "@language": "en" }
            ],
            "@type": ["Thing", "Camera", "SecurityDevice"],
            "title": "Security Camera",
            "description": "A security camera with motion detection and streaming capabilities",
            "properties": {
                "recording": {
                    "type": "boolean",
                    "title": "Recording Status",
                    "description": "Whether the camera is currently recording",
                    "readOnly": true,
                    "observable": true,
                    "forms": [{
                            "href": "properties/recording",
                            "contentType": "application/json"
                        }]
                },
                "motionDetected": {
                    "type": "boolean",
                    "title": "Motion Detection",
                    "description": "Whether motion is currently detected",
                    "readOnly": true,
                    "observable": true,
                    "forms": [{
                            "href": "properties/motionDetected",
                            "contentType": "application/json"
                        }]
                },
                "resolution": {
                    "type": "string",
                    "title": "Video Resolution",
                    "description": "Current video resolution setting",
                    "enum": ["720p", "1080p", "4K"],
                    "forms": [{
                            "href": "properties/resolution",
                            "contentType": "application/json"
                        }]
                }
            },
            "actions": {
                "startRecording": {
                    "title": "Start Recording",
                    "description": "Start video recording",
                    "input": {
                        "type": "object",
                        "properties": {
                            "duration": { "type": "integer", "minimum": 1, "maximum": 3600, "unit": "seconds" },
                            "quality": { "type": "string", "enum": ["low", "medium", "high"] }
                        }
                    },
                    "forms": [{
                            "href": "actions/startRecording",
                            "contentType": "application/json"
                        }]
                },
                "stopRecording": {
                    "title": "Stop Recording",
                    "description": "Stop video recording",
                    "forms": [{
                            "href": "actions/stopRecording",
                            "contentType": "application/json"
                        }]
                },
                "captureSnapshot": {
                    "title": "Capture Snapshot",
                    "description": "Capture a still image",
                    "output": {
                        "type": "object",
                        "properties": {
                            "imageUrl": { "type": "string", "format": "uri" },
                            "timestamp": { "type": "string", "format": "date-time" },
                            "size": { "type": "integer", "unit": "bytes" }
                        }
                    },
                    "forms": [{
                            "href": "actions/captureSnapshot",
                            "contentType": "application/json"
                        }]
                }
            },
            "events": {
                "motionDetected": {
                    "title": "Motion Detected",
                    "description": "Motion detected in camera field of view",
                    "data": {
                        "type": "object",
                        "properties": {
                            "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
                            "zone": { "type": "string" },
                            "timestamp": { "type": "string", "format": "date-time" },
                            "snapshotUrl": { "type": "string", "format": "uri" }
                        }
                    },
                    "forms": [{
                            "href": "events/motionDetected",
                            "contentType": "application/json",
                            "subprotocol": "sse"
                        }]
                }
            },
            "securityDefinitions": {
                "bearer_sc": {
                    "scheme": "bearer",
                    "format": "jwt",
                    "alg": ["ES256"],
                    "authorization": "https://auth.example.com/authorize"
                },
                "api_key_sc": {
                    "scheme": "apikey",
                    "in": "header",
                    "name": "X-API-Key"
                }
            },
            "security": ["bearer_sc", "api_key_sc"]
        }
    }
];
export var tdSnippets = [
    {
        id: 'basic-property',
        name: 'Basic Property',
        description: 'A simple readable property',
        category: 'property',
        snippet: {
            "type": "string",
            "title": "Property Name",
            "description": "Property description",
            "readOnly": true,
            "forms": [{
                    "href": "properties/propertyName",
                    "contentType": "application/json"
                }]
        },
        insertText: "\"propertyName\": {\n  \"type\": \"string\",\n  \"title\": \"Property Name\",\n  \"description\": \"Property description\",\n  \"readOnly\": true,\n  \"forms\": [{\n    \"href\": \"properties/propertyName\",\n    \"contentType\": \"application/json\"\n  }]\n}"
    },
    {
        id: 'number-property',
        name: 'Number Property',
        description: 'A numeric property with range',
        category: 'property',
        snippet: {
            "type": "number",
            "title": "Sensor Value",
            "description": "Sensor reading",
            "minimum": 0,
            "maximum": 100,
            "unit": "celsius",
            "readOnly": true,
            "observable": true,
            "forms": [{
                    "href": "properties/sensorValue",
                    "contentType": "application/json"
                }]
        },
        insertText: "\"sensorValue\": {\n  \"type\": \"number\",\n  \"title\": \"Sensor Value\",\n  \"description\": \"Sensor reading\",\n  \"minimum\": 0,\n  \"maximum\": 100,\n  \"unit\": \"celsius\",\n  \"readOnly\": true,\n  \"observable\": true,\n  \"forms\": [{\n    \"href\": \"properties/sensorValue\",\n    \"contentType\": \"application/json\"\n  }]\n}"
    },
    {
        id: 'enum-property',
        name: 'Enum Property',
        description: 'Property with predefined values',
        category: 'property',
        snippet: {
            "type": "string",
            "title": "Status",
            "description": "Current status",
            "enum": ["active", "inactive", "error"],
            "observable": true,
            "forms": [{
                    "href": "properties/status",
                    "contentType": "application/json"
                }]
        },
        insertText: "\"status\": {\n  \"type\": \"string\",\n  \"title\": \"Status\",\n  \"description\": \"Current status\",\n  \"enum\": [\"active\", \"inactive\", \"error\"],\n  \"observable\": true,\n  \"forms\": [{\n    \"href\": \"properties/status\",\n    \"contentType\": \"application/json\"\n  }]\n}"
    },
    {
        id: 'simple-action',
        name: 'Simple Action',
        description: 'Action without input/output',
        category: 'action',
        snippet: {
            "title": "Action Name",
            "description": "Action description",
            "safe": false,
            "idempotent": false,
            "forms": [{
                    "href": "actions/actionName",
                    "contentType": "application/json"
                }]
        },
        insertText: "\"actionName\": {\n  \"title\": \"Action Name\",\n  \"description\": \"Action description\",\n  \"safe\": false,\n  \"idempotent\": false,\n  \"forms\": [{\n    \"href\": \"actions/actionName\",\n    \"contentType\": \"application/json\"\n  }]\n}"
    },
    {
        id: 'action-with-input',
        name: 'Action with Input',
        description: 'Action that accepts parameters',
        category: 'action',
        snippet: {
            "title": "Set Value",
            "description": "Set a value with parameters",
            "input": {
                "type": "object",
                "properties": {
                    "value": { "type": "number" },
                    "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
                },
                "required": ["value"]
            },
            "output": {
                "type": "object",
                "properties": {
                    "success": { "type": "boolean" }
                }
            },
            "forms": [{
                    "href": "actions/setValue",
                    "contentType": "application/json"
                }]
        },
        insertText: "\"setValue\": {\n  \"title\": \"Set Value\",\n  \"description\": \"Set a value with parameters\",\n  \"input\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"value\": {\"type\": \"number\"},\n      \"unit\": {\"type\": \"string\", \"enum\": [\"celsius\", \"fahrenheit\"]}\n    },\n    \"required\": [\"value\"]\n  },\n  \"output\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"success\": {\"type\": \"boolean\"}\n    }\n  },\n  \"forms\": [{\n    \"href\": \"actions/setValue\",\n    \"contentType\": \"application/json\"\n  }]\n}"
    },
    {
        id: 'basic-event',
        name: 'Basic Event',
        description: 'Simple event notification',
        category: 'event',
        snippet: {
            "title": "Event Name",
            "description": "Event description",
            "data": {
                "type": "object",
                "properties": {
                    "timestamp": { "type": "string", "format": "date-time" },
                    "value": { "type": "string" }
                }
            },
            "forms": [{
                    "href": "events/eventName",
                    "contentType": "application/json",
                    "subprotocol": "longpoll"
                }]
        },
        insertText: "\"eventName\": {\n  \"title\": \"Event Name\",\n  \"description\": \"Event description\",\n  \"data\": {\n    \"type\": \"object\",\n    \"properties\": {\n      \"timestamp\": {\"type\": \"string\", \"format\": \"date-time\"},\n      \"value\": {\"type\": \"string\"}\n    }\n  },\n  \"forms\": [{\n    \"href\": \"events/eventName\",\n    \"contentType\": \"application/json\",\n    \"subprotocol\": \"longpoll\"\n  }]\n}"
    }
];
// Helper function to get templates by category
export function getTemplatesByCategory(category) {
    if (!category)
        return tdTemplates;
    return tdTemplates.filter(function (template) { return template.category === category; });
}
// Helper function to get snippets by category
export function getSnippetsByCategory(category) {
    if (!category)
        return tdSnippets;
    return tdSnippets.filter(function (snippet) { return snippet.category === category; });
}
