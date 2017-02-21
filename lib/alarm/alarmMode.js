//-----------------------------------------------------------------------------
//
//	alarmMode.js
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

function AlarmMode() {
    this.__defineGetter__('away', function () { return 'Away'; });
    this.__defineGetter__('stay', function () { return 'Stay'; });
    this.__defineGetter__('disarmed', function () { return 'Disarmed'; });
    this.__defineGetter__('alarmed', function () { return 'Alarmed'; });

    this.__defineGetter__('securityAlarm', function () { return 'Security Alarm'; });
    this.__defineGetter__('safetyAlarm', function () { return 'Safety Alarm'; });
    this.__defineGetter__('alarmClear', function () { return 'Alarm Cleared'; });

    this.__defineGetter__('modes', function () { return [this.disarmed, this.stay, this.away, this.alarmed]; });

    this.__defineGetter__('status', function () { return [this.safetyAlarm, this.securityAlarm, this.alarmClear]; });
};

module.exports = new AlarmMode();