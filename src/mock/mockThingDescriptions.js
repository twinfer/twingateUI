// Mock Thing Descriptions for testing discovery functionality
export var mockTDs = {
    temperatureSensor: {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            {
                "@language": "en"
            }
        ],
        "@type": "Thing",
        "id": "urn:dev:wot:com:example:servient:lamp",
        "title": "Temperature Sensor",
        "description": "A smart temperature sensor with monitoring capabilities",
        "version": {
            "instance": "1.2.1"
        },
        "created": "2021-05-01T10:20:30.000Z",
        "modified": "2021-05-01T10:20:30.000Z",
        "support": "https://example.com/contact",
        "base": "https://mylamp.example.com/",
        "properties": {
            "temperature": {
                "type": "number",
                "description": "Current temperature reading",
                "unit": "celsius",
                "minimum": -40,
                "maximum": 85,
                "readOnly": true,
                "observable": true,
                "forms": [
                    {
                        "href": "properties/temperature",
                        "contentType": "application/json"
                    }
                ]
            },
            "humidity": {
                "type": "number",
                "description": "Current humidity level",
                "unit": "percent",
                "minimum": 0,
                "maximum": 100,
                "readOnly": true,
                "observable": true,
                "forms": [
                    {
                        "href": "properties/humidity",
                        "contentType": "application/json"
                    }
                ]
            },
            "batteryLevel": {
                "type": "number",
                "description": "Battery level percentage",
                "unit": "percent",
                "minimum": 0,
                "maximum": 100,
                "readOnly": true,
                "forms": [
                    {
                        "href": "properties/batteryLevel",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "actions": {
            "calibrate": {
                "description": "Calibrate the sensor",
                "forms": [
                    {
                        "href": "actions/calibrate",
                        "contentType": "application/json"
                    }
                ]
            },
            "reset": {
                "description": "Reset the sensor to factory settings",
                "forms": [
                    {
                        "href": "actions/reset",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "events": {
            "overheating": {
                "description": "Temperature exceeds safe threshold",
                "data": {
                    "type": "object",
                    "properties": {
                        "temperature": {
                            "type": "number"
                        },
                        "timestamp": {
                            "type": "string",
                            "format": "date-time"
                        }
                    }
                },
                "forms": [
                    {
                        "href": "events/overheating",
                        "subprotocol": "longpoll",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "links": [
            {
                "rel": "alternate",
                "href": "https://mylamp.example.com/manual",
                "type": "text/html",
                "title": "User Manual"
            }
        ],
        "forms": [
            {
                "op": "readallproperties",
                "href": "properties",
                "contentType": "application/json"
            }
        ],
        "securityDefinitions": {
            "basic_sc": {
                "scheme": "basic",
                "in": "header"
            }
        },
        "security": "basic_sc"
    },
    smartLight: {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1"
        ],
        "@type": ["Thing", "Light"],
        "id": "urn:dev:wot:com:example:servient:light",
        "title": "Smart LED Light",
        "description": "A smart LED light with dimming and color control",
        "version": {
            "instance": "2.1.0"
        },
        "properties": {
            "brightness": {
                "type": "integer",
                "description": "Current brightness level",
                "minimum": 0,
                "maximum": 100,
                "unit": "percent",
                "observable": true,
                "forms": [
                    {
                        "href": "properties/brightness",
                        "contentType": "application/json"
                    }
                ]
            },
            "color": {
                "type": "object",
                "description": "Current color in RGB",
                "properties": {
                    "r": { "type": "integer", "minimum": 0, "maximum": 255 },
                    "g": { "type": "integer", "minimum": 0, "maximum": 255 },
                    "b": { "type": "integer", "minimum": 0, "maximum": 255 }
                },
                "forms": [
                    {
                        "href": "properties/color",
                        "contentType": "application/json"
                    }
                ]
            },
            "on": {
                "type": "boolean",
                "description": "Whether the light is on or off",
                "observable": true,
                "forms": [
                    {
                        "href": "properties/on",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "actions": {
            "toggle": {
                "description": "Toggle the light on/off",
                "forms": [
                    {
                        "href": "actions/toggle",
                        "contentType": "application/json"
                    }
                ]
            },
            "fade": {
                "description": "Fade to target brightness over time",
                "input": {
                    "type": "object",
                    "properties": {
                        "brightness": { "type": "integer", "minimum": 0, "maximum": 100 },
                        "duration": { "type": "integer", "minimum": 0, "maximum": 10000 }
                    },
                    "required": ["brightness", "duration"]
                },
                "forms": [
                    {
                        "href": "actions/fade",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "events": {
            "bulbFailure": {
                "description": "LED bulb has failed",
                "data": {
                    "type": "object",
                    "properties": {
                        "errorCode": { "type": "string" },
                        "timestamp": { "type": "string", "format": "date-time" }
                    }
                },
                "forms": [
                    {
                        "href": "events/bulbFailure",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "securityDefinitions": {
            "nosec_sc": {
                "scheme": "nosec"
            }
        },
        "security": "nosec_sc"
    },
    doorSensor: {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1"
        ],
        "@type": ["Thing", "Sensor"],
        "id": "urn:dev:wot:com:example:servient:door",
        "title": "Smart Door Sensor",
        "description": "Magnetic door/window sensor with tamper detection",
        "properties": {
            "open": {
                "type": "boolean",
                "description": "Whether the door/window is open",
                "readOnly": true,
                "observable": true,
                "forms": [
                    {
                        "href": "properties/open",
                        "contentType": "application/json"
                    }
                ]
            },
            "tamper": {
                "type": "boolean",
                "description": "Tamper detection status",
                "readOnly": true,
                "observable": true,
                "forms": [
                    {
                        "href": "properties/tamper",
                        "contentType": "application/json"
                    }
                ]
            },
            "batteryLow": {
                "type": "boolean",
                "description": "Low battery indicator",
                "readOnly": true,
                "forms": [
                    {
                        "href": "properties/batteryLow",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "events": {
            "opened": {
                "description": "Door/window was opened",
                "data": {
                    "type": "object",
                    "properties": {
                        "timestamp": { "type": "string", "format": "date-time" }
                    }
                },
                "forms": [
                    {
                        "href": "events/opened",
                        "contentType": "application/json"
                    }
                ]
            },
            "closed": {
                "description": "Door/window was closed",
                "data": {
                    "type": "object",
                    "properties": {
                        "timestamp": { "type": "string", "format": "date-time" }
                    }
                },
                "forms": [
                    {
                        "href": "events/closed",
                        "contentType": "application/json"
                    }
                ]
            },
            "tamperDetected": {
                "description": "Tamper was detected",
                "data": {
                    "type": "object",
                    "properties": {
                        "timestamp": { "type": "string", "format": "date-time" },
                        "severity": { "type": "string", "enum": ["low", "medium", "high"] }
                    }
                },
                "forms": [
                    {
                        "href": "events/tamperDetected",
                        "contentType": "application/json"
                    }
                ]
            }
        },
        "securityDefinitions": {
            "psk_sc": {
                "scheme": "psk",
                "identity": "device123"
            }
        },
        "security": "psk_sc"
    }
};
// Eclipse Thingweb test Things
var eclipseTestThings = {
    coffeeMachine: {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            "https://www.w3.org/2022/wot/td/v1.1",
            { "@language": "en" }
        ],
        "@type": "Thing",
        "id": "urn:dev:wot:eclipse:test:coffee-machine",
        "title": "Advanced Coffee Machine",
        "description": "A smart coffee machine with a range of capabilities. A complementary tutorial is available at http://www.thingweb.io/smart-coffee-machine.html.",
        "support": "https://github.com/eclipse-thingweb/node-wot/",
        "base": "http://plugfest.thingweb.io:8080/advanced-coffee-machine/",
        "securityDefinitions": {
            "nosec_sc": { "scheme": "nosec" }
        },
        "security": ["nosec_sc"],
        "properties": {
            "allAvailableResources": {
                "type": "object",
                "description": "Current level of all available resources given as an integer percentage for each particular resource.",
                "readOnly": true,
                "properties": {
                    "water": { "type": "integer", "minimum": 0, "maximum": 100 },
                    "milk": { "type": "integer", "minimum": 0, "maximum": 100 },
                    "chocolate": { "type": "integer", "minimum": 0, "maximum": 100 },
                    "coffeeBeans": { "type": "integer", "minimum": 0, "maximum": 100 }
                },
                "forms": [{ "href": "properties/allAvailableResources" }]
            },
            "availableResourceLevel": {
                "type": "integer",
                "description": "Current level of a particular resource given as an integer percentage.",
                "minimum": 0,
                "maximum": 100,
                "readOnly": true,
                "forms": [{ "href": "properties/availableResourceLevel{?id}" }]
            },
            "possibleDrinks": {
                "type": "array",
                "description": "The list of possible drinks in general.",
                "readOnly": true,
                "items": { "type": "string" },
                "forms": [{ "href": "properties/possibleDrinks" }]
            },
            "servedCounter": {
                "type": "integer",
                "description": "The total number of served beverages.",
                "minimum": 0,
                "readOnly": true,
                "forms": [{ "href": "properties/servedCounter" }]
            },
            "maintenanceNeeded": {
                "type": "boolean",
                "description": "Shows whether a maintenance is needed.",
                "readOnly": true,
                "forms": [{ "href": "properties/maintenanceNeeded" }]
            }
        },
        "actions": {
            "makeDrink": {
                "description": "Make a drink from available list of beverages.",
                "input": {
                    "type": "object",
                    "properties": {
                        "drinkId": { "type": "string", "description": "Defines what drink to make." },
                        "size": { "type": "string", "description": "Defines the size of a drink." },
                        "quantity": { "type": "integer", "minimum": 1, "maximum": 5, "description": "Defines how many drinks to make." }
                    },
                    "required": ["drinkId", "size", "quantity"]
                },
                "output": {
                    "type": "object",
                    "properties": {
                        "result": { "type": "boolean" }
                    }
                },
                "forms": [{ "href": "actions/makeDrink" }]
            },
            "setSchedule": {
                "description": "Set a schedule for automatic coffee making.",
                "input": {
                    "type": "object",
                    "properties": {
                        "drinkId": { "type": "string" },
                        "size": { "type": "string" },
                        "quantity": { "type": "integer", "minimum": 1, "maximum": 5 },
                        "time": { "type": "string", "description": "Time in 24h format, e.g. 10:00" },
                        "mode": { "type": "string", "enum": ["everyday", "weekdays", "weekend", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] }
                    },
                    "required": ["drinkId", "size", "quantity", "time", "mode"]
                },
                "forms": [{ "href": "actions/setSchedule" }]
            }
        },
        "events": {
            "outOfResource": {
                "description": "Out of resource event.",
                "data": {
                    "type": "string"
                },
                "forms": [{ "href": "events/outOfResource" }]
            },
            "maintenanceNeeded": {
                "description": "Maintenance needed event.",
                "forms": [{ "href": "events/maintenanceNeeded" }]
            }
        }
    },
    calculator: {
        "@context": [
            "https://www.w3.org/2019/wot/td/v1",
            "https://www.w3.org/2022/wot/td/v1.1",
            { "@language": "en" }
        ],
        "@type": "Thing",
        "id": "urn:dev:wot:eclipse:test:calculator",
        "title": "Calculator Thing",
        "description": "Calculator Thing for basic arithmetic operations",
        "base": "http://plugfest.thingweb.io:8080/calculator/",
        "securityDefinitions": {
            "nosec_sc": { "scheme": "nosec" }
        },
        "security": ["nosec_sc"],
        "properties": {
            "result": {
                "type": "number",
                "description": "Latest calculation result",
                "readOnly": true,
                "observable": true,
                "forms": [{ "href": "properties/result" }]
            },
            "lastChange": {
                "type": "string",
                "format": "date-time",
                "description": "Timestamp of last calculation",
                "readOnly": true,
                "observable": true,
                "forms": [{ "href": "properties/lastChange" }]
            }
        },
        "actions": {
            "add": {
                "description": "Add a number to the current result",
                "input": {
                    "type": "number",
                    "description": "Number to add"
                },
                "output": {
                    "type": "number",
                    "description": "New result after addition"
                },
                "forms": [{ "href": "actions/add" }]
            },
            "subtract": {
                "description": "Subtract a number from the current result",
                "input": {
                    "type": "number",
                    "description": "Number to subtract"
                },
                "output": {
                    "type": "number",
                    "description": "New result after subtraction"
                },
                "forms": [{ "href": "actions/subtract" }]
            },
            "multiply": {
                "description": "Multiply the current result by a number",
                "input": {
                    "type": "number",
                    "description": "Number to multiply by"
                },
                "output": {
                    "type": "number"
                },
                "forms": [{ "href": "actions/multiply" }]
            },
            "divide": {
                "description": "Divide the current result by a number",
                "input": {
                    "type": "number",
                    "description": "Number to divide by",
                    "minimum": 0.001
                },
                "output": {
                    "type": "number"
                },
                "forms": [{ "href": "actions/divide" }]
            },
            "clear": {
                "description": "Reset the calculator result to zero",
                "output": {
                    "type": "number"
                },
                "forms": [{ "href": "actions/clear" }]
            }
        },
        "events": {
            "update": {
                "description": "Calculation result updated",
                "data": {
                    "type": "object",
                    "properties": {
                        "result": { "type": "number" },
                        "operation": { "type": "string" },
                        "timestamp": { "type": "string", "format": "date-time" }
                    }
                },
                "forms": [{ "href": "events/update" }]
            }
        }
    }
};
// Mock .well-known/wot responses
export var mockWellKnownResponses = {
    'http://localhost:3001': [mockTDs.temperatureSensor, mockTDs.smartLight],
    'http://localhost:3002': [mockTDs.doorSensor],
    'https://example.com': mockTDs.temperatureSensor,
    'http://plugfest.thingweb.io:8080': [
        eclipseTestThings.coffeeMachine,
        eclipseTestThings.calculator
    ],
    'https://demo.thingweb.io': [
        {
            "@context": [
                "https://www.w3.org/2019/wot/td/v1"
            ],
            "@type": "Thing",
            "id": "urn:dev:wot:thingweb:counter",
            "title": "Counter Demo",
            "description": "A simple counter Thing for demonstration",
            "properties": {
                "count": {
                    "type": "integer",
                    "description": "Current counter value",
                    "minimum": 0,
                    "observable": true,
                    "forms": [
                        {
                            "href": "http://plugfest.thingweb.io:8083/counter/properties/count",
                            "contentType": "application/json"
                        }
                    ]
                }
            },
            "actions": {
                "increment": {
                    "description": "Increment the counter",
                    "forms": [
                        {
                            "href": "http://plugfest.thingweb.io:8083/counter/actions/increment",
                            "contentType": "application/json"
                        }
                    ]
                },
                "decrement": {
                    "description": "Decrement the counter",
                    "forms": [
                        {
                            "href": "http://plugfest.thingweb.io:8083/counter/actions/decrement",
                            "contentType": "application/json"
                        }
                    ]
                },
                "reset": {
                    "description": "Reset the counter to zero",
                    "forms": [
                        {
                            "href": "http://plugfest.thingweb.io:8083/counter/actions/reset",
                            "contentType": "application/json"
                        }
                    ]
                }
            },
            "securityDefinitions": {
                "nosec_sc": {
                    "scheme": "nosec"
                }
            },
            "security": "nosec_sc"
        }
    ]
};
