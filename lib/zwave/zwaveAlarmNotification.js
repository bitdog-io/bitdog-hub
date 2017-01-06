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

function ZWaveAlarmNotification() {
    var notificationTypes = {
        0x01: {
            name: 'Smoke  Alarm',
            id: 0x01,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Smoke detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Smoke detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Smoke Alarm Test',
                    id: 0x03
                },
                0x04: {
                    name: 'Replacement Required, Unspecified reason',
                    id: 0x04
                },
                0x05: {
                    name: 'Replacement Required, End-of-life',
                    id: 0x05
                },
                0x06: {
                    name: 'Alarm Silenced',
                    id: 0x06
                },
                0x07: {
                    name: 'Maintenance required, Planned periodic inspection',
                    id: 0x07
                },
                0x08: {
                    name: 'Maintenance required, Dust in device',
                    id: 0x08
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x02: {
            name: 'CO  Alarm',
            id: 0x02,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Carbon monoxide detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Carbon monoxide detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Carbon monoxide Test',
                    id: 0x03
                },
                0x04: {
                    name: 'Replacement Required, Unspecified reason',
                    id: 0x04
                },
                0x05: {
                    name: 'Replacement Required, End-of-life',
                    id: 0x05
                },
                0x06: {
                    name: 'Alarm Silenced',
                    id: 0x06
                },
                0x07: {
                    name: 'Maintenance required, Planned periodic inspection',
                    id: 0x07
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                },
            }
        },
        0x03: {
            name: 'CO2 Alarm',
            id: 0x03,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Carbon dioxide detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Carbon dioxide detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Carbon dioxide Test',
                    id: 0x03
                },
                0x04: {
                    name: 'Replacement Required, Unspecified reason',
                    id: 0x04
                },
                0x05: {
                    name: 'Replacement Required, End-of-life',
                    id: 0x05
                },
                0x06: {
                    name: 'Alarm Silenced',
                    id: 0x06
                },
                0x07: {
                    name: 'Maintenance required, Planned periodic inspection',
                    id: 0x07
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x04: {
            name: 'Heat Alarm',
            id: 0x04,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Overheat detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Overheat detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Rapid Temperature Rise',
                    id: 0x03
                },
                0x04: {
                    name: 'Rapid Temperature Rise, Unknown Location',
                    id: 0x04
                },
                0x05: {
                    name: 'Under heat detected',
                    id: 0x05
                },
                0x06: {
                    name: 'Under heat detected, Unknown Location',
                    id: 0x06
                },
                0x07: {
                    name: 'Heat Alarm Test',
                    id: 0x07
                },
                0x08: {
                    name: 'Replacement Required, End-of-life',
                    id: 0x08
                },
                0x09: {
                    name: 'Alarm Silenced',
                    id: 0x09
                },
                0x0A: {
                    name: 'Maintenance required, Dust in device',
                    id: 0x0A
                },
                0x0B: {
                    name: 'Maintenance required, Planned periodic inspection',
                    id: 0x0B
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x05: {
            name: 'Water Alarm',
            id: 0x05,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Water Leak detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Water Leak detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Water Level Dropped',
                    id: 0x03
                },
                0x04: {
                    name: 'Water Level Dropped, Unknown Location',
                    id: 0x04
                },
                0x05: {
                    name: 'Replace Water Filter',
                    id: 0x05
                },
                0x06: {
                    name: 'Water Flow Alarm',
                    id: 0x06
                },
                0x07: {
                    name: 'Water Pressure Alarm',
                    id: 0x07
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x06: {
            name: 'Access Control',
            id: 0x06,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Manual Lock Operation',
                    id: 0x01
                },
                0x02: {
                    name: 'Manual Unlock Operation',
                    id: 0x02
                },
                0x03: {
                    name: 'RF Lock Operation',
                    id: 0x03
                },
                0x04: {
                    name: 'RF Unlock Operation',
                    id: 0x04
                },
                0x05: {
                    name: 'Keypad Lock Operation',
                    id: 0x05
                },
                0x06: {
                    name: 'Keypad Unlock Operation',
                    id: 0x06
                },
                0x07: {
                    name: 'Manual Not Fully Locked Operation',
                    id: 0x07
                },
                0x08: {
                    name: 'RF Not Fully Locked Operation',
                    id: 0x08
                },
                0x09: {
                    name: 'Auto Lock Locked Operation',
                    id: 0x09
                },
                0x0A: {
                    name: 'Auto Lock Not Fully Operation',
                    id: 0x0A
                },
                0x0B: {
                    name: 'Lock Jammed',
                    id: 0x0B
                },
                0x0C: {
                    name: 'All user codes deleted',
                    id: 0x0C
                },
                0x0D: {
                    name: 'Single user code deleted',
                    id: 0x0D
                },
                0x0E: {
                    name: 'New user code added',
                    id: 0x0E
                },
                0x0F: {
                    name: 'New user code not added due to duplicate code',
                    id: 0x0F
                },
                0x10: {
                    name: 'Keypad temporary disabled',
                    id: 0x10
                },
                0x11: {
                    name: 'Keypad busy',
                    id: 0x11
                },
                0x12: {
                    name: 'New Program code Entered - Unique code for lock configuration',
                    id: 0x12
                },
                0x13: {
                    name: 'Manually Enter user Access code exceeds code limit',
                    id: 0x13
                },
                0x14: {
                    name: 'Unlock By RF with invalid user code',
                    id: 0x14
                },
                0x15: {
                    name: 'Locked by RF with invalid user codes',
                    id: 0x15
                },
                0x16: {
                    name: 'Window/Door is open',
                    id: 0x16
                },
                0x17: {
                    name: 'Window/Door is closed',
                    id: 0x17
                },
                0x40: {
                    name: 'Barrier performing Initialization process',
                    id: 0x40
                },
                0x41: {
                    name: 'Barrier operation (Open / Close) force has been exceeded',
                    id: 0x41
                },
                0x42: {
                    name: 'Barrier motor has exceeded manufacturer’s operational time limit',
                    id: 0x42
                },
                0x43: {
                    name: 'Barrier operation has exceeded physical mechanical limits',
                    id: 0x43
                },
                0x44: {
                    name: 'Barrier unable to perform requested operation due to UL requirements',
                    id: 0x44
                },
                0x45: {
                    name: 'Barrier unattended operation has been disabled per UL requirements',
                    id: 0x45
                },
                0x46: {
                    name: 'Barrier failed to perform requested operation, device malfunction',
                    id: 0x46
                },
                0x47: {
                    name: 'Barrier Vacation Mode',
                    id: 0x47
                },
                0x48: {
                    name: 'Barrier Safety Beam Obstacle',
                    id: 0x48
                },
                0x49: {
                    name: 'Barrier Sensor Not Detected / Supervisory Error',
                    id: 0x49
                },
                0x4A: {
                    name: 'Barrier Sensor Low Battery Warning',
                    id: 0x4A
                },
                0x4B: {
                    name: 'Barrier detected short in Wall Station wires',
                    id: 0x4B
                },
                0x4C: {
                    name: 'Barrier associated with non-Z-wave remote control',
                    id: 0x4C
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x07: {
            name: 'Home Security',
            id: 0x07,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Intrusion',
                    id: 0x01
                },
                0x02: {
                    name: 'Intrusion, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Tampering, Product covering removed',
                    id: 0x03
                },
                0x04: {
                    name: 'Tampering, Invalid Code',
                    id: 0x04
                },
                0x05: {
                    name: 'Glass Breakage',
                    id: 0x05
                },
                0x06: {
                    name: 'Glass Breakage, Unknown Location',
                    id: 0x06
                },
                0x07: {
                    name: 'Motion Detection',
                    id: 0x07
                },
                0x08: {
                    name: 'Motion Detection, Unknown Location',
                    id: 0x08
                },
                0x09: {
                    name: 'Tampering, Product Moved',
                    id: 0x09
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x08: {
            name: 'Power Management',
            id: 0x08,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Power has been applied',
                    id: 0x01
                },
                0x02: {
                    name: 'AC mains disconnected',
                    id: 0x02
                },
                0x03: {
                    name: 'AC mains re-connected',
                    id: 0x03
                },
                0x04: {
                    name: 'Surge detected',
                    id: 0x04
                },
                0x05: {
                    name: 'Voltage Drop/Drift',
                    id: 0x05
                },
                0x06: {
                    name: 'Over-current detected',
                    id: 0x06
                },
                0x07: {
                    name: 'Over-voltage detected',
                    id: 0x07
                },
                0x08: {
                    name: 'Over-load detected',
                    id: 0x08
                },
                0x09: {
                    name: 'Load error',
                    id: 0x09
                },
                0x0A: {
                    name: 'Replace battery soon',
                    id: 0x0A
                },
                0x0B: {
                    name: 'Replace battery now',
                    id: 0x0B
                },
                0x0C: {
                    name: 'Battery is charging',
                    id: 0x0C
                },
                0x0D: {
                    name: 'Battery is fully charged',
                    id: 0x0D
                },
                0x0E: {
                    name: 'Charge battery soon',
                    id: 0x0E
                },
                0x0F: {
                    name: 'Charge battery now',
                    id: 0x0F
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x09: {
            name: 'System',
            id: 0x09,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'System hardware failure',
                    id: 0x01
                },
                0x02: {
                    name: 'System software failure',
                    id: 0x02
                },
                0x03: {
                    name: 'System hardware failure with manufacturer proprietary failure code',
                    id: 0x03
                },
                0x04: {
                    name: 'System software failure with manufacturer proprietary failure code',
                    id: 0x04
                },
                0x05: {
                    name: 'Heartbeat',
                    id: 0x05
                },
                0x06: {
                    name: 'Tampering, Product covering removed',
                    id: 0x06
                },
                0x07: {
                    name: 'Emergency Shutoff',
                    id: 0x07
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0A: {
            name: 'Emergency Alarm',
            id: 0x0A,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Contact Police',
                    id: 0x01
                },
                0x02: {
                    name: 'Contact Fire Service',
                    id: 0x02
                },
                0x03: {
                    name: 'Contact Medical Service',
                    id: 0x03
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0B: {
            name: 'Clock',
            id: 0x0B,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Wake Up Alert',
                    id: 0x01
                },
                0x02: {
                    name: 'Timer Ended',
                    id: 0x02
                },
                0x03: {
                    name: 'Time remaining',
                    id: 0x03
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0C: {
            name: 'Appliance',
            id: 0x0C,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Program started',
                    id: 0x01
                },
                0x02: {
                    name: 'Program in progress',
                    id: 0x02
                },
                0x03: {
                    name: 'Program completed',
                    id: 0x03
                },
                0x04: {
                    name: 'Replace main filter',
                    id: 0x04
                },
                0x05: {
                    name: 'Failure to set target temperature',
                    id: 0x05
                },
                0x06: {
                    name: 'Supplying water',
                    id: 0x06
                },
                0x07: {
                    name: 'Water supply failure',
                    id: 0x07
                },
                0x08: {
                    name: 'Boiling',
                    id: 0x08
                },
                0x09: {
                    name: 'Boiling failure',
                    id: 0x09
                },
                0x0A: {
                    name: 'Washing',
                    id: 0x0A
                },
                0x0B: {
                    name: 'Washing failure',
                    id: 0x0B
                },
                0x0C: {
                    name: 'Rinsing',
                    id: 0x0C
                },
                0x0D: {
                    name: 'Rinsing failure',
                    id: 0x0D
                },
                0x0E: {
                    name: 'Draining',
                    id: 0x0E
                },
                0x0F: {
                    name: 'Draining failure',
                    id: 0x0F
                },
                0x10: {
                    name: 'Spinning',
                    id: 0x10
                },
                0x11: {
                    name: 'Spinning failure',
                    id: 0x11
                },
                0x12: {
                    name: 'Drying',
                    id: 0x12
                },
                0x13: {
                    name: 'Drying failure',
                    id: 0x13
                },
                0x14: {
                    name: 'Fan failure',
                    id: 0x14
                },
                0x15: {
                    name: 'Compressor failure',
                    id: 0x15
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0D: {
            name: 'Home Health',
            id: 0x0D,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Leaving Bed',
                    id: 0x01
                },
                0x02: {
                    name: 'Sitting on bed',
                    id: 0x02
                },
                0x03: {
                    name: 'Lying on bed',
                    id: 0x03
                },
                0x04: {
                    name: 'Posture changed',
                    id: 0x04
                },
                0x05: {
                    name: 'Sitting on edge of bed',
                    id: 0x05
                },
                0x06: {
                    name: 'Volatile Organic Compound level',
                    id: 0x06
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0E: {
            name: 'Siren',
            id: 0x0E,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Siren Active',
                    id: 0x01
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x0F: {
            name: 'Water Value',
            id: 0x0F,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Valve Operation',
                    id: 0x01
                },
                0x02: {
                    name: 'Master Valve Operation',
                    id: 0x02
                },
                0x03: {
                    name: 'Valve Short Circuit',
                    id: 0x03
                },
                0x04: {
                    name: 'Master Valve Short Circuit',
                    id: 0x04
                },
                0x05: {
                    name: 'Valve Current Alarm',
                    id: 0x05
                },
                0x06: {
                    name: 'Master Valve Current Alarm',
                    id: 0x06
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x10: {
            name: 'Weather  Alarm',
            id: 0x10,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Rain Alarm',
                    id: 0x01
                },
                0x02: {
                    name: 'Moisture Alarm',
                    id: 0x02
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x11: {
            name: 'Irrigation',
            id: 0x11,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Schedule Started',
                    id: 0x01
                },
                0x02: {
                    name: 'Schedule Finished',
                    id: 0x02
                },
                0x03: {
                    name: 'Valve Table Run Started',
                    id: 0x03
                },
                0x04: {
                    name: 'Valve Table Run Finished',
                    id: 0x04
                },
                0x05: {
                    name: 'Device is not Configured',
                    id: 0x05
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        },
        0x12: {
            name: 'Gas Alarm',
            id: 0x12,
            events: {
                0x00: {
                    name: 'Event inactive',
                    id: 0x00
                },
                0x01: {
                    name: 'Combustible Gas detected',
                    id: 0x01
                },
                0x02: {
                    name: 'Combustible Gas detected, Unknown Location',
                    id: 0x02
                },
                0x03: {
                    name: 'Toxic Gas detected',
                    id: 0x03
                },
                0x04: {
                    name: 'Toxic Gas detected, Unknown Location',
                    id: 0x04
                },
                0x05: {
                    name: 'Gas Alarm Test',
                    id: 0x05
                },
                0x06: {
                    name: 'Replacement Required, Unspecified reason',
                    id: 0x06
                },
                0xFE: {
                    name: 'Unknown Event',
                    id: 0xFE
                }
            }
        }


    };

    this.getNotificationType = function (valueIndex) {
        return notificationTypes[valueIdex - 3];
    };
}

module.exports = new ZWaveAlarmNotification();