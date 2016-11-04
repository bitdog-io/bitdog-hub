var bitdogClient = require('bitdog-client');

function ZwaveDeviceClasses() {
    var deviceBasicClass = {
        0x01: 'BASIC_TYPE_CONTROLLER', /*Node is a portable controller */
        0x04: 'BASIC_TYPE_ROUTING_SLAVE',
        0x03: 'BASIC_TYPE_SLAVE',
        0x02: 'BASIC_TYPE_STATIC_CONTROLLER'
     };

    var deviceGenericClass = {
        0x03: {
            id: 'GENERIC_TYPE_AV_CONTROL_POINT',  /*AV Control Point*/
            specific: {
                0x00: {
                    id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                },
                0x12: {
                    id: 'SPECIFIC_TYPE_DOORBELL'
                },
                0x04: {
                    id: 'SPECIFIC_TYPE_SATELLITE_RECEIVER' /*Satellite Receiver*/
                },
                0x11: {
                    id: 'SPECIFIC_TYPE_SATELLITE_RECEIVER_V2' /*Satellite Receiver V2*/
                }

            }
        },
        0x04: {
            id: 'GENERIC_TYPE_DISPLAY',
            specific: {
                0x00: {
                    id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                },
                0x01: {
                    id: 'SPECIFIC_TYPE_SIMPLE_DISPLAY' /*Display (simple) Device Type*/
                }
            }
        },
        0x40: {
            id: 'GENERIC_TYPE_ENTRY_CONTROL', /*Entry Control*/
            specific: {
                0x00: {
                    id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                },
                0x01: {
                    id: 'SPECIFIC_TYPE_DOOR_LOCK' /*Door Lock*/
                },
                0x02: {
                    id: 'SPECIFIC_TYPE_ADVANCED_DOOR_LOCK' /*Advanced Door Lock*/
                },
                0x03: {
                    id: 'SPECIFIC_TYPE_SECURE_KEYPAD_DOOR_LOCK' /*Door Lock (keypad –lever) Device Type*/
                },
                0x04: {
                    id: 'SPECIFIC_TYPE_SECURE_KEYPAD_DOOR_LOCK_DEADBOLT' /*Door Lock (keypad – deadbolt) Device Type*/
                },
                0x05: {
                    id: 'SPECIFIC_TYPE_SECURE_DOOR' /*Barrier Operator Specific Device Class*/
                },
                0x06: {
                    id: 'SPECIFIC_TYPE_SECURE_GATE'  /*Barrier Operator Specific Device Class*/
                },
                0x07: {
                    id: 'SPECIFIC_TYPE_SECURE_BARRIER_ADDON'  /*Barrier Operator Specific Device Class*/
                },
                0x08: {
                    id: 'SPECIFIC_TYPE_SECURE_BARRIER_OPEN_ONLY' /*Barrier Operator Specific Device Class*/
                },
                0x09: {
                    id: 'SPECIFIC_TYPE_SECURE_BARRIER_CLOSE_ONLY' /*Barrier Operator Specific Device Class*/
                },
                0x0A: {
                    id: 'SPECIFIC_TYPE_SECURE_LOCKBOX'
                },
                0x0B: {
                    id: 'SPECIFIC_TYPE_SECURE_KEYPAD'
                }
            },
            0x01: {
                id: 'GENERIC_TYPE_GENERIC_CONTROLLER' /*Remote Controller*/,
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_PORTABLE_REMOTE_CONTROLLER' /*Remote Control (Multi Purpose) Device Type*/
                    },
                    0x02: {
                        id: 'SPECIFIC_TYPE_PORTABLE_SCENE_CONTROLLER'/*Portable Scene Controller*/
                    },
                    0x03: {
                        id: 'SPECIFIC_TYPE_PORTABLE_INSTALLER_TOOL'
                    },
                    0x04: {
                        id: 'SPECIFIC_TYPE_REMOTE_CONTROL_AV' /*Remote Control (AV) Device Type*/
                    },
                    0x06: {
                        id: 'SPECIFIC_TYPE_REMOTE_CONTROL_SIMPLE' /*Remote Control (Simple) Device Type*/
                    }
                },
                0x31: {
                    id: 'GENERIC_TYPE_METER', /*Meter*/
                    specific: {
                        0x00: {
                            id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                        },
                        0x01: {
                            id: 'SPECIFIC_TYPE_SIMPLE_METER' /*Sub Energy Meter Device Type*/
                        },
                        0x02: {
                            id: 'SPECIFIC_TYPE_ADV_ENERGY_CONTROL'  /*Whole Home Energy Meter (Advanced) Device Type*/
                        },
                        0x03: {
                            id: 'SPECIFIC_TYPE_WHOLE_HOME_METER_SIMPLE'  /*Whole Home Meter (Simple) Device Type*/
                        }
                    }
                }
            },
            0x30: {
                id: 'GENERIC_TYPE_METER_PULSE', /*Pulse Meter*/
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED'/*Specific Device Class Not Used*/
                    }
                }
            },
            0xFF: {
                id: 'GENERIC_TYPE_NON_INTEROPERABLE', /*Non interoperable*/
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                    }
                }
            },
            0x0F: {
                id: 'GENERIC_TYPE_REPEATER_SLAVE', /*Repeater Slave*/
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_REPEATER_SLAVE' /*Basic Repeater Slave*/
                    },
                    0x02: {
                        id: 'SPECIFIC_TYPE_VIRTUAL_NODE'
                    }
                }
            },
            0x17: {
                id: 'GENERIC_TYPE_SECURITY_PANEL',
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED'/*Specific Device Class Not Used*/
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_ZONED_SECURITY_PANEL'
                    }

                }
            },
            0x50: {
                id: 'GENERIC_TYPE_SEMI_INTEROPERABLE',
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_ENERGY_PRODUCTION' /*Energy Production*/
                    }
                }
            },
            0xA1: {
                id: 'GENERIC_TYPE_SENSOR_ALARM',
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED'  /*Specific Device Class Not Used*/
                    },
                    0x05: {
                        id: 'SPECIFIC_TYPE_ADV_ZENSOR_NET_ALARM_SENSOR'
                    },
                    0x0A: {
                        id: 'SPECIFIC_TYPE_ADV_ZENSOR_NET_SMOKE_SENSOR'
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_BASIC_ROUTING_ALARM_SENSOR'
                    },
                    0x06: {
                        id: 'SPECIFIC_TYPE_BASIC_ROUTING_SMOKE_SENSOR'
                    },
                    0x03: {
                        id: 'SPECIFIC_TYPE_BASIC_ZENSOR_NET_ALARM_SENSOR'
                    },
                    0x08: {
                        id: 'SPECIFIC_TYPE_BASIC_ZENSOR_NET_SMOKE_SENSOR'
                    },
                    0x02: {
                        id: 'SPECIFIC_TYPE_ROUTING_ALARM_SENSOR'
                    },
                    0x07: {
                        id: 'SPECIFIC_TYPE_ROUTING_SMOKE_SENSOR'
                    },
                    0x04: {
                        id: 'SPECIFIC_TYPE_ZENSOR_NET_ALARM_SENSOR'
                    },
                    0x09: {
                        id: 'SPECIFIC_TYPE_ZENSOR_NET_SMOKE_SENSOR'
                    },
                    0x0B: {
                        id: 'SPECIFIC_TYPE_ALARM_SENSOR'  /*Sensor (Alarm) Device Type*/
                    }

                }
            },
            0x20: {
                id: 'GENERIC_TYPE_SENSOR_BINARY',
                specific: {
                    0x00: {
                        id: 'SPECIFIC_TYPE_NOT_USED' /*Specific Device Class Not Used*/
                    },
                    0x01: {
                        id: 'SPECIFIC_TYPE_ROUTING_SENSOR_BINARY' /*Routing Binary Sensor*/
                    }
                }
            },
            0x21: {
                id: 'GENERIC_TYPE_SENSOR_MULTILEVEL',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED',  /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_ROUTING_SENSOR_MULTILEVEL', /*Sensor (Multilevel) Device Type*/
                    0x02: 'SPECIFIC_TYPE_CHIMNEY_FAN'
                }
            },
            0x02: {
                id: 'GENERIC_TYPE_STATIC_CONTROLLER',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED',  /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_PC_CONTROLLER',  /*Central Controller Device Type*/
                    0x02: 'SPECIFIC_TYPE_SCENE_CONTROLLER', /*Scene Controller*/
                    0x03: 'SPECIFIC_TYPE_STATIC_INSTALLER_TOOL',
                    0x04: 'SPECIFIC_TYPE_SET_TOP_BOX', /*Set Top Box Device Type*/
                    0x05: 'SPECIFIC_TYPE_SUB_SYSTEM_CONTROLLER', /*Sub System Controller Device Type*/
                    0x06: 'SPECIFIC_TYPE_TV',   /*TV Device Type*/
                    0x07: 'SPECIFIC_TYPE_GATEWAY', /*Gateway Device Type*/
                }
            },
            0x10: {
                id: 'GENERIC_TYPE_SWITCH_BINARY', /*Binary Switch*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_POWER_SWITCH_BINARY', /*On/Off Power Switch Device Type*/
                    0x03: 'SPECIFIC_TYPE_SCENE_SWITCH_BINARY', /*Binary Scene Switch*/
                    0x04: 'SPECIFIC_TYPE_POWER_STRIP', /*Power Strip Device Type*/
                    0x05: 'SPECIFIC_TYPE_SIREN',  /*Siren Device Type*/
                    0x06: 'SPECIFIC_TYPE_VALVE_OPEN_CLOSE',   /*Valve (open/close) Device Type*/
                    0x02: 'SPECIFIC_TYPE_COLOR_TUNABLE_BINARY',
                    0x07: 'SPECIFIC_TYPE_IRRIGATION_CONTROLLER'
                }
            },
            0x11: {
                id: 'GENERIC_TYPE_SWITCH_MULTILEVEL', /*Multilevel Switch*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x05: 'SPECIFIC_TYPE_CLASS_A_MOTOR_CONTROL',  /*Window Covering No Position/Endpoint Device Type*/
                    0x06: 'SPECIFIC_TYPE_CLASS_B_MOTOR_CONTROL', /*Window Covering Endpoint Aware Device Type*/
                    0x07: 'SPECIFIC_TYPE_CLASS_C_MOTOR_CONTROL', /*Window Covering Position/Endpoint Aware Device Type*/
                    0x03: 'SPECIFIC_TYPE_MOTOR_MULTIPOSITION',  /*Multiposition Motor*/
                    0x01: 'SPECIFIC_TYPE_POWER_SWITCH_MULTILEVEL',/*Light Dimmer Switch Device Type*/
                    0x04: 'SPECIFIC_TYPE_SCENE_SWITCH_MULTILEVEL', /*Multilevel Scene Switch*/
                    0x08: 'SPECIFIC_TYPE_FAN_SWITCH',  /*Fan Switch Device Type*/
                    0x02: 'SPECIFIC_TYPE_COLOR_TUNABLE_MULTILEVEL'
                }
            },
            0x12: {
                id: 'GENERIC_TYPE_SWITCH_REMOTE',/*Remote Switch*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED',/*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_SWITCH_REMOTE_BINARY',   /*Binary Remote Switch*/
                    0x02: 'SPECIFIC_TYPE_SWITCH_REMOTE_MULTILEVEL',/*Multilevel Remote Switch*/
                    0x03: 'SPECIFIC_TYPE_SWITCH_REMOTE_TOGGLE_BINARY',  /*Binary Toggle Remote Switch*/
                    0x04: 'SPECIFIC_TYPE_SWITCH_REMOTE_TOGGLE_MULTILEVEL'  /*Multilevel Toggle Remote Switch*/
                }
            },
            0x13: {
                id: 'GENERIC_TYPE_SWITCH_TOGGLE', /*Toggle Switch*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED',/*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_SWITCH_TOGGLE_BINARY',  /*Binary Toggle Switch*/
                    0x02: 'SPECIFIC_TYPE_SWITCH_TOGGLE_MULTILEVEL'  /*Multilevel Toggle Switch*/
                }
            },
            0x08: {
                id: 'GENERIC_TYPE_THERMOSTAT',/*Thermostat*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x03: 'SPECIFIC_TYPE_SETBACK_SCHEDULE_THERMOSTAT',/*Setback Schedule Thermostat*/
                    0x05: 'SPECIFIC_TYPE_SETBACK_THERMOSTAT', /*Thermostat (Setback) Device Type*/
                    0x04: 'SPECIFIC_TYPE_SETPOINT_THERMOSTAT',
                    0x02: 'SPECIFIC_TYPE_THERMOSTAT_GENERAL',/*Thermostat General*/
                    0x06: 'SPECIFIC_TYPE_THERMOSTAT_GENERAL_V2', /*Thermostat (HVAC) Device Type*/
                    0x01: 'SPECIFIC_TYPE_THERMOSTAT_HEATING' /*Thermostat Heating*/
                }
            },
            0x16: {
                id: 'GENERIC_TYPE_VENTILATION',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED',/*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_RESIDENTIAL_HRV'
                }
            },
            0x09: {
                id: 'GENERIC_TYPE_WINDOW_COVERING',/*Window Covering*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_SIMPLE_WINDOW_COVERING'/*Simple Window Covering Control*/

                }
            },
            0x15: {
                id: 'GENERIC_TYPE_ZIP_NODE',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x02: 'SPECIFIC_TYPE_ZIP_ADV_NODE',
                    0x01: 'SPECIFIC_TYPE_ZIP_TUN_NODE'
                }
            },
            0x18: {
                id: 'GENERIC_TYPE_WALL_CONTROLLER',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_BASIC_WALL_CONTROLLER' /*Wall Controller Device Type*/
                }
            },
            0x05: {
                id: 'GENERIC_TYPE_NETWORK_EXTENDER', /*Network Extender Generic Device Class*/
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_SECURE_EXTENDER' /*Specific Device Secure Extender*/
                }
            },
            0x06: {
                id: 'GENERIC_TYPE_APPLIANCE',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class Not Used*/
                    0x01: 'SPECIFIC_TYPE_GENERAL_APPLIANCE',
                    0x02: 'SPECIFIC_TYPE_KITCHEN_APPLIANCE',
                    0x03: 'SPECIFIC_TYPE_LAUNDRY_APPLIANCE'
                }
            },
            0x07: {
                id: 'GENERIC_TYPE_SENSOR_NOTIFICATION',
                specific: {
                    0x00: 'SPECIFIC_TYPE_NOT_USED', /*Specific Device Class not used*/
                    0x01: 'SPECIFIC_TYPE_NOTIFICATION_SENSOR'
                }
            }

        }

    };

    this.getClasses = function (basicId, generalId, specificId) {
        var basic = deviceBasicClass[basicId];
        var generic = deviceGenericClass[generalId];
        var specific = general.specific[specificId];

        for (var name in deviceBasicClass) {
            console.log(name);
            console.log(deviceBasicClass[name]);
        }
            

        return {
            basic: basic,
            generic: generic.id,
            specific: specific
        };
    };
}


module.exports = new ZwaveDeviceClasses();

