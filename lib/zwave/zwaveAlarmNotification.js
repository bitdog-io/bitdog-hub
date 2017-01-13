//-----------------------------------------------------------------------------
//
//	zwaveAlarmNotification.js
//
//	Copyright (c) 2016 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------

// Status bit field

var status = {
    clear: 0,
    burglarAlarm: 1, // stateful, system should not arm if this is set
    warn: 2, // log the event in warnings
    notify: 4, // send notification to users
    safetyAlarm: 8, // sets off safetyalarm, doesn't need alarm to be set
    burglarEventAlarm // this event is considered a burglar event if system is armed

};


function ZWaveAlarmNotification() {
    var _alarmSensorEvents = [];

    // Init alarm sensor events
    _alarmSensorEvents[0x00] = {
        value: 'Event inactive',
        id: 0x00,
        status: status.clear
    };

    _alarmSensorEvents[0xFF] = {
        value: 'Alarm',
        id: 0xFF,
        status: status.safetyAlarm
    };

    for (var index = 1; index < 101; index++) {
        _alarmSensorEvents[index] = {
            value: 'Alarm - ' + index + ' percent' ,
            id: index,
            status: status.safetyAlarm
        };
    }
    ///////////////////////////

    var _notificationTypes = {
        113: { // Alarm Classs
            0x04: {
                name: 'Smoke  Alarm',
                id: 0x01,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear
                    },
                    0x01: {
                        value: 'Smoke detected',
                        id: 0x01,
                        status: status.safetyAlarm
                    },
                    0x02: {
                        value: 'Smoke detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm
                    },
                    0x03: {
                        value: 'Smoke Alarm Test',
                        id: 0x03,
                        status: status.safetyAlarm
                    },
                    0x04: {
                        value: 'Replacement Required, Unspecified reason',
                        id: 0x04,
                        status: status.warn

                    },
                    0x05: {
                        value: 'Replacement Required, End-of-life',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Alarm Silenced',
                        id: 0x06,
                        status: status.notify

                    },
                    0x07: {
                        value: 'Maintenance required, Planned periodic inspection',
                        id: 0x07,
                        status: status.warn

                    },
                    0x08: {
                        value: 'Maintenance required, Dust in device',
                        id: 0x08,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x05: {
                name: 'CO  Alarm',
                id: 0x02,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Carbon monoxide detected',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Carbon monoxide detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Carbon monoxide Test',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0x04: {
                        value: 'Replacement Required, Unspecified reason',
                        id: 0x04,
                        status: status.warn

                    },
                    0x05: {
                        value: 'Replacement Required, End-of-life',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Alarm Silenced',
                        id: 0x06,
                        status: status.notify

                    },
                    0x07: {
                        value: 'Maintenance required, Planned periodic inspection',
                        id: 0x07,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    },
                }
            },
            0x06: {
                name: 'CO2 Alarm',
                id: 0x03,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Carbon dioxide detected',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Carbon dioxide detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Carbon dioxide Test',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0x04: {
                        value: 'Replacement Required, Unspecified reason',
                        id: 0x04,
                        status: status.warn

                    },
                    0x05: {
                        value: 'Replacement Required, End-of-life',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Alarm Silenced',
                        id: 0x06,
                        status: status.notify

                    },
                    0x07: {
                        value: 'Maintenance required, Planned periodic inspection',
                        id: 0x07,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x07: {
                name: 'Heat Alarm',
                id: 0x04,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Overheat detected',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Overheat detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Rapid Temperature Rise',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0x04: {
                        value: 'Rapid Temperature Rise, Unknown Location',
                        id: 0x04,
                        status: status.safetyAlarm

                    },
                    0x05: {
                        value: 'Under heat detected',
                        id: 0x05,
                        status: status.safetyAlarm

                    },
                    0x06: {
                        value: 'Under heat detected, Unknown Location',
                        id: 0x06,
                        status: status.safetyAlarm

                    },
                    0x07: {
                        value: 'Heat Alarm Test',
                        id: 0x07,
                        status: status.notify

                    },
                    0x08: {
                        value: 'Replacement Required, End-of-life',
                        id: 0x08,
                        status: status.warn

                    },
                    0x09: {
                        value: 'Alarm Silenced',
                        id: 0x09,
                        status: status.notify

                    },
                    0x0A: {
                        value: 'Maintenance required, Dust in device',
                        id: 0x0A,
                        status: status.warn

                    },
                    0x0B: {
                        value: 'Maintenance required, Planned periodic inspection',
                        id: 0x0B,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x08: {
                name: 'Water Alarm',
                id: 0x05,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Water Leak detected',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Water Leak detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Water Level Dropped',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0x04: {
                        value: 'Water Level Dropped, Unknown Location',
                        id: 0x04,
                        status: status.safetyAlarm

                    },
                    0x05: {
                        value: 'Replace Water Filter',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Water Flow Alarm',
                        id: 0x06,
                        status: status.safetyAlarm

                    },
                    0x07: {
                        value: 'Water Pressure Alarm',
                        id: 0x07,
                        status: status.safetyAlarm

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x09: {
                name: 'Access Control',
                id: 0x06,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Manual Lock Operation',
                        id: 0x01,
                        status: status.burglarEventAlarm

                    },
                    0x02: {
                        value: 'Manual Unlock Operation',
                        id: 0x02,
                        status: status.burglarEventAlarm

                    },
                    0x03: {
                        value: 'RF Lock Operation',
                        id: 0x03,
                        status: status.burglarEventAlarm

                    },
                    0x04: {
                        value: 'RF Unlock Operation',
                        id: 0x04,
                        status: status.burglarEventAlarm

                    },
                    0x05: {
                        value: 'Keypad Lock Operation',
                        id: 0x05,
                        status: status.burglarEventAlarm

                    },
                    0x06: {
                        value: 'Keypad Unlock Operation',
                        id: 0x06,
                        status: status.burglarEventAlarm

                    },
                    0x07: {
                        value: 'Manual Not Fully Locked Operation',
                        id: 0x07,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x08: {
                        value: 'RF Not Fully Locked Operation',
                        id: 0x08,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x09: {
                        value: 'Auto Lock Locked Operation',
                        id: 0x09,
                        status: status.burglarEventAlarm

                    },
                    0x0A: {
                        value: 'Auto Lock Not Fully Operation',
                        id: 0x0A,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x0B: {
                        value: 'Lock Jammed',
                        id: 0x0B,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x0C: {
                        value: 'All user codes deleted',
                        id: 0x0C,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x0D: {
                        value: 'Single user code deleted',
                        id: 0x0D,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x0E: {
                        value: 'New user code added',
                        id: 0x0E,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x0F: {
                        value: 'New user code not added due to duplicate code',
                        id: 0x0F,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x10: {
                        value: 'Keypad temporary disabled',
                        id: 0x10,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x11: {
                        value: 'Keypad busy',
                        id: 0x11,
                        status: status.burglarEventAlarm

                    },
                    0x12: {
                        value: 'New Program code Entered - Unique code for lock configuration',
                        id: 0x12,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x13: {
                        value: 'Manually Enter user Access code exceeds code limit',
                        id: 0x13,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x14: {
                        value: 'Unlock By RF with invalid user code',
                        id: 0x14,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x15: {
                        value: 'Locked by RF with invalid user codes',
                        id: 0x15,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x16: {
                        value: 'Window/Door is open',
                        id: 0x16,
                        status: status.burglarAlarm

                    },
                    0x17: {
                        value: 'Window/Door is closed',
                        id: 0x17,
                        status: status.clear

                    },
                    0x40: {
                        value: 'Barrier performing Initialization process',
                        id: 0x40,
                        status: status.burglarEventAlarm

                    },
                    0x41: {
                        value: 'Barrier operation (Open / Close) force has been exceeded',
                        id: 0x41,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x42: {
                        value: 'Barrier motor has exceeded manufacturer’s operational time limit',
                        id: 0x42,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x43: {
                        value: 'Barrier operation has exceeded physical mechanical limits',
                        id: 0x43,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x44: {
                        value: 'Barrier unable to perform requested operation due to UL requirements',
                        id: 0x44,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x45: {
                        value: 'Barrier unattended operation has been disabled per UL requirements',
                        id: 0x45,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x46: {
                        value: 'Barrier failed to perform requested operation, device malfunction',
                        id: 0x46,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x47: {
                        value: 'Barrier Vacation Mode',
                        id: 0x47,
                        status: status.burglarEventAlarm

                    },
                    0x48: {
                        value: 'Barrier Safety Beam Obstacle',
                        id: 0x48,
                        status: status.burglarEventAlarm | status.notify

                    },
                    0x49: {
                        value: 'Barrier Sensor Not Detected / Supervisory Error',
                        id: 0x49,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x4A: {
                        value: 'Barrier Sensor Low Battery Warning',
                        id: 0x4A,
                        status: status.warn

                    },
                    0x4B: {
                        value: 'Barrier detected short in Wall Station wires',
                        id: 0x4B,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0x4C: {
                        value: 'Barrier associated with non-Z-wave remote control',
                        id: 0x4C,
                        status: status.burglarEventAlarm | status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0A: {
                name: 'Home Security',
                id: 0x07,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Intrusion',
                        id: 0x01,
                        status: status.burglarAlarm

                    },
                    0x02: {
                        value: 'Intrusion, Unknown Location',
                        id: 0x02,
                        status: status.burglarAlarm

                    },
                    0x03: {
                        value: 'Tampering, Product covering removed',
                        id: 0x03,
                        status: status.burglarAlarm | status.notify

                    },
                    0x04: {
                        value: 'Tampering, Invalid Code',
                        id: 0x04,
                        status: status.burglarAlarm | status.notify

                    },
                    0x05: {
                        value: 'Glass Breakage',
                        id: 0x05,
                        status: status.burglarAlarm

                    },
                    0x06: {
                        value: 'Glass Breakage, Unknown Location',
                        id: 0x06,
                        status: status.burglarAlarm

                    },
                    0x07: {
                        value: 'Motion Detection',
                        id: 0x07,
                        status: status.burglarAlarm

                    },
                    0x08: {
                        value: 'Motion Detection, Unknown Location',
                        id: 0x08,
                        status: status.burglarAlarm

                    },
                    0x09: {
                        value: 'Tampering, Product Moved',
                        id: 0x09,
                        status: status.burglarAlarm | status.notify

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0B: {
                name: 'Power Management',
                id: 0x08,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Power has been applied',
                        id: 0x01,
                        status: status.notify

                    },
                    0x02: {
                        value: 'AC mains disconnected',
                        id: 0x02,
                        status: status.notify

                    },
                    0x03: {
                        value: 'AC mains re-connected',
                        id: 0x03,
                        status: status.notify

                    },
                    0x04: {
                        value: 'Surge detected',
                        id: 0x04,
                        status: status.notify

                    },
                    0x05: {
                        value: 'Voltage Drop/Drift',
                        id: 0x05,
                        status: status.notify

                    },
                    0x06: {
                        value: 'Over-current detected',
                        id: 0x06,
                        status: status.notify

                    },
                    0x07: {
                        value: 'Over-voltage detected',
                        id: 0x07,
                        status: status.notify

                    },
                    0x08: {
                        value: 'Over-load detected',
                        id: 0x08,
                        status: status.notify

                    },
                    0x09: {
                        value: 'Load error',
                        id: 0x09,
                        status: status.warn

                    },
                    0x0A: {
                        value: 'Replace battery soon',
                        id: 0x0A,
                        status: status.warn

                    },
                    0x0B: {
                        value: 'Replace battery now',
                        id: 0x0B,
                        status: status.warn

                    },
                    0x0C: {
                        value: 'Battery is charging',
                        id: 0x0C,
                        status: status.clear

                    },
                    0x0D: {
                        value: 'Battery is fully charged',
                        id: 0x0D,
                        status: status.clear

                    },
                    0x0E: {
                        value: 'Charge battery soon',
                        id: 0x0E,
                        status: status.warn

                    },
                    0x0F: {
                        value: 'Charge battery now',
                        id: 0x0F,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0C: {
                name: 'System',
                id: 0x09,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'System hardware failure',
                        id: 0x01,
                        status: status.notify

                    },
                    0x02: {
                        value: 'System software failure',
                        id: 0x02,
                        status: status.notify

                    },
                    0x03: {
                        value: 'System hardware failure with manufacturer proprietary failure code',
                        id: 0x03,
                        status: status.notify

                    },
                    0x04: {
                        value: 'System software failure with manufacturer proprietary failure code',
                        id: 0x04,
                        status: status.notify

                    },
                    0x05: {
                        value: 'Heartbeat',
                        id: 0x05,
                        status: status.clear

                    },
                    0x06: {
                        value: 'Tampering, Product covering removed',
                        id: 0x06,
                        status: status.burglarAlarm | status.notify

                    },
                    0x07: {
                        value: 'Emergency Shutoff',
                        id: 0x07,
                        status: status.notify

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0D: {
                name: 'Emergency Alarm',
                id: 0x0A,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Contact Police',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Contact Fire Service',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Contact Medical Service',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0E: {
                name: 'Clock',
                id: 0x0B,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Wake Up Alert',
                        id: 0x01,
                        status: status.notify

                    },
                    0x02: {
                        value: 'Timer Ended',
                        id: 0x02,
                        status: status.notify

                    },
                    0x03: {
                        value: 'Time remaining',
                        id: 0x03,
                        status: status.clear

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x0F: {
                name: 'Appliance',
                id: 0x0C,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Program started',
                        id: 0x01,
                        status: status.clear

                    },
                    0x02: {
                        value: 'Program in progress',
                        id: 0x02,
                        status: status.clear

                    },
                    0x03: {
                        value: 'Program completed',
                        id: 0x03,
                        status: status.clear

                    },
                    0x04: {
                        value: 'Replace main filter',
                        id: 0x04,
                        status: status.warn

                    },
                    0x05: {
                        value: 'Failure to set target temperature',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Supplying water',
                        id: 0x06,
                        status: status.clear

                    },
                    0x07: {
                        value: 'Water supply failure',
                        id: 0x07,
                        status: status.warn

                    },
                    0x08: {
                        value: 'Boiling',
                        id: 0x08,
                        status: status.clear

                    },
                    0x09: {
                        value: 'Boiling failure',
                        id: 0x09,
                        status: status.warn

                    },
                    0x0A: {
                        value: 'Washing',
                        id: 0x0A,
                        status: status.clear

                    },
                    0x0B: {
                        value: 'Washing failure',
                        id: 0x0B,
                        status: status.warn

                    },
                    0x0C: {
                        value: 'Rinsing',
                        id: 0x0C,
                        status: status.clear

                    },
                    0x0D: {
                        value: 'Rinsing failure',
                        id: 0x0D,
                        status: status.warn

                    },
                    0x0E: {
                        value: 'Draining',
                        id: 0x0E,
                        status: status.clear

                    },
                    0x0F: {
                        value: 'Draining failure',
                        id: 0x0F,
                        status: status.warn

                    },
                    0x10: {
                        value: 'Spinning',
                        id: 0x10,
                        status: status.clear

                    },
                    0x11: {
                        value: 'Spinning failure',
                        id: 0x11,
                        status: status.warn

                    },
                    0x12: {
                        value: 'Drying',
                        id: 0x12,
                        status: status.clear

                    },
                    0x13: {
                        value: 'Drying failure',
                        id: 0x13,
                        status: status.warn

                    },
                    0x14: {
                        value: 'Fan failure',
                        id: 0x14,
                        status: status.warn

                    },
                    0x15: {
                        value: 'Compressor failure',
                        id: 0x15,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x10: {
                name: 'Home Health',
                id: 0x0D,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Leaving Bed',
                        id: 0x01,
                        status: status.clear

                    },
                    0x02: {
                        value: 'Sitting on bed',
                        id: 0x02,
                        status: status.clear

                    },
                    0x03: {
                        value: 'Lying on bed',
                        id: 0x03,
                        status: status.clear

                    },
                    0x04: {
                        value: 'Posture changed',
                        id: 0x04,
                        status: status.clear

                    },
                    0x05: {
                        value: 'Sitting on edge of bed',
                        id: 0x05,
                        status: status.clear

                    },
                    0x06: {
                        value: 'Volatile Organic Compound level',
                        id: 0x06,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x11: {
                name: 'Siren',
                id: 0x0E,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Siren Active',
                        id: 0x01,
                        status: status.notify

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x12: {
                name: 'Water Value',
                id: 0x0F,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Valve Operation',
                        id: 0x01,
                        status: status.clear

                    },
                    0x02: {
                        value: 'Master Valve Operation',
                        id: 0x02,
                        status: status.clear

                    },
                    0x03: {
                        value: 'Valve Short Circuit',
                        id: 0x03,
                        status: status.warn

                    },
                    0x04: {
                        value: 'Master Valve Short Circuit',
                        id: 0x04,
                        status: status.warn

                    },
                    0x05: {
                        value: 'Valve Current Alarm',
                        id: 0x05,
                        status: status.warn

                    },
                    0x06: {
                        value: 'Master Valve Current Alarm',
                        id: 0x06,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x13: {
                name: 'Weather  Alarm',
                id: 0x10,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00
                    },
                    0x01: {
                        value: 'Rain Alarm',
                        id: 0x01,
                        status: status.warn

                    },
                    0x02: {
                        value: 'Moisture Alarm',
                        id: 0x02,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x14: {
                name: 'Irrigation',
                id: 0x11,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.warn

                    },
                    0x01: {
                        value: 'Schedule Started',
                        id: 0x01,
                        status: status.clear

                    },
                    0x02: {
                        value: 'Schedule Finished',
                        id: 0x02,
                        status: status.clear

                    },
                    0x03: {
                        value: 'Valve Table Run Started',
                        id: 0x03,
                        status: status.clear

                    },
                    0x04: {
                        value: 'Valve Table Run Finished',
                        id: 0x04,
                        status: status.clear

                    },
                    0x05: {
                        value: 'Device is not Configured',
                        id: 0x05,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            },
            0x15: {
                name: 'Gas Alarm',
                id: 0x12,
                events: {
                    0x00: {
                        value: 'Event inactive',
                        id: 0x00,
                        status: status.clear

                    },
                    0x01: {
                        value: 'Combustible Gas detected',
                        id: 0x01,
                        status: status.safetyAlarm

                    },
                    0x02: {
                        value: 'Combustible Gas detected, Unknown Location',
                        id: 0x02,
                        status: status.safetyAlarm

                    },
                    0x03: {
                        value: 'Toxic Gas detected',
                        id: 0x03,
                        status: status.safetyAlarm

                    },
                    0x04: {
                        value: 'Toxic Gas detected, Unknown Location',
                        id: 0x04,
                        status: status.safetyAlarm

                    },
                    0x05: {
                        value: 'Gas Alarm Test',
                        id: 0x05,
                        status: status.notify

                    },
                    0x06: {
                        value: 'Replacement Required, Unspecified reason',
                        id: 0x06,
                        status: status.warn

                    },
                    0xFE: {
                        value: 'Unknown Event',
                        id: 0xFE,
                        status: status.warn

                    }
                }
            }
        },
        156: { // Alarm Sensor Class
            0x00: {
                name: 'General Purpose Alarm',
                id: 0x01,
                events: _alarmSensorEvents
                },
            0x01: {
                name: 'Smoke Alarm',
                id: 0x01,
                events: _alarmSensorEvents
            },
            0x02: {
                name: 'CO Alarm',
                id: 0x01,
                events: _alarmSensorEvents
            },
            0x03: {
                name: 'CO2 Alarm',
                id: 0x01,
                events: _alarmSensorEvents
            },
            0x04: {
                name: 'Heat Alarm',
                id: 0x01,
                events: _alarmSensorEvents
            },
            0x05: {
                name: 'Water Leak Alarm',
                id: 0x01,
                events: _alarmSensorEvents
            }
        },
        48: { // Sensor Binary
            0x00: {
                name: 'Sensor',
                id: 0x00,
                events: {
                    0: {
                        value: 'Event inactive',
                        id: false,
                        status: status.clear

                    },
                    1: {
                        value: 'Alarm',
                        id: true,
                        status: status.burglarAlarm

                    }
                }

            }
        }
    };

    this.getNotificationType = function (classId, valueIndex) {
        var result = _notificationTypes[classId];

        if (typeof result === typeof undefined) {
            return result;
        }

        result = result[valueIndex];

        return result;
            
    };
}



module.exports = new ZWaveAlarmNotification();