//-----------------------------------------------------------------------------
//
//	zwaveCommandClasses.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
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

function ZWaveCommandClasses() {
    var commandClasses = {
        'No Operation': 0,
        'Basic': 32,
        'Controller Replication': 33,
        'Application Status': 34,
        'ZIP Services': 35,
        'ZIP Server': 36,
        'Switch Binary': 37,
        'Switch Multilevel': 38,
        'Switch All': 39,
        'Switch Toggle Binary': 40,
        'Switch Toggle Multilevel': 41,
        'Chimney Fan': 42,
        'Scene Activation': 43,
        'Scene Actuator Configuration': 44,
        'Scene Controller Configuration': 45,
        'ZIP Client': 46,
        'ZIP Advanced Services': 47,
        'Sensor Binary': 48,
        'Sensor Multilevel': 49,
        'Meter': 50,
        'Switch Color': 51,
        'Network Management Inclusion': 52,
        'Meter Pulse': 53,
        'Meter Tbl Config': 60,
        'Meter Tbl Monitor': 61,
        'Meter Tbl Push': 62,
        'Thermostat Heating': 56,
        'Thermostat Mode': 64,
        'Thermostat Operating State': 66,
        'Thermostat Setpoint': 67,
        'Thermostat Fan Mode': 68,
        'Thermostat Fan State': 69,
        'Climate Control Schedule': 70,
        'Thermostat Setback': 71,
        'Door Lock Logging': 76,
        'Schedule Entry Lock': 78,
        'Basic Window Covering': 80,
        'MTP Window Covering': 81,
        'Association Grp Info': 89,
        'Device Reset Locally': 90,
        'Central Scene': 91,
        'IP Association': 92,
        'Antitheft': 93,
        'ZwavePlus Info': 94,
        'Multi Instance': 96,
        'Door Lock': 98,
        'User Code': 99,
        'Barrier Operator': 102,
        'Configuration': 112,
        'Alarm': 113,
        'Manufacturer Specific': 114,
        'Powerlevel': 115,
        'Protection': 117,
        'Lock': 118,
        'Node Naming': 119,
        'Firmware Update MD': 122,
        'Grouping Name': 123,
        'Remote Association Activate': 124,
        'Remote Association': 125,
        'Battery': 128,
        'CLock': 129,
        'Hail': 130,
        'Wake Up': 132,
        'Association': 133,
        'Version': 134,
        'Indicator': 135,
        'Proprietary': 136,
        'Language': 137,
        'Time': 138,
        'Time ParaMeters': 139,
        'Geographic Location': 140,
        'Composite': 141,
        'Multi Instance Association': 142,
        'Multi CMD': 143,
        'Energy Production': 144,
        'Manufacturer Proprietary': 145,
        'Screen MD': 146,
        'Screen Attributes': 147,
        'Simple AV Control': 148,
        'AV Content Directory MD': 149,
        'AV Renderer Status': 150,
        'AV Content Search MD': 151,
        'Security': 152,
        'AV Tagging MD': 153,
        'IP Configuration': 154,
        'Association Command Configuration': 155,
        'Alarm Sensor': 156,
        'Alarm Silence': 157,
        'Sensor Configuration': 158,
        'Mark': 239,
        'Non Interoperable': 240
    };

    this.getCommand = function (number) {
        for (var propertyName in commandClasses) {
            if (commandClasses[propertyName] == number)
                return propertyName;
        }

        return number.toString();
    };
}

module.exports = new ZWaveCommandClasses();