//-----------------------------------------------------------------------------
//
//	systemEvents.js
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

function EventInfo() {

}

function SystemEvents(bitdogHub, configuration, logger) {

    function publish(eventInfo) {
        bitdogHub.emit('system event', eventInfo, configuration, logger);
    }

    this.publishSystemStart = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'system start';
        eventInfo.text = 'Bitdog Hub is starting';

        publish(eventInfo);
    };

    this.publishSystemStop = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'system stop';
        eventInfo.text = 'Bitdog Hub is stopping, good bye';

        publish(eventInfo);
    };

    this.publishZWaveScanBegin = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'zwave scan begin';
        eventInfo.text = 'Scanning ZWave network, please wait';
        publish(eventInfo);
    };

    this.publishZWaveScanEnd = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'zwave scan end';
        eventInfo.text = 'Finished scanning ZWave network';
        publish(eventInfo);
    };

    this.publishSystemReady = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'system ready';
        eventInfo.text = 'Bitdog Hub is now ready';
        publish(eventInfo);
    };

    this.publishSecurityArmAway = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'security arm away';
        eventInfo.text = 'Bitdog security armed, set for away mode';
        publish(eventInfo);
    };

    this.publishSecurityArmStay = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'security arm stay';
        eventInfo.text = 'Bitdog security armed, set for stay mode';
        publish(eventInfo);
    };

    this.publishSecurityDisarmed = function () {
        var eventInfo = new EventInfo();
        eventInfo.name = 'security disarmed';
        eventInfo.text = 'Bitdog security has been disarmed';
        publish(eventInfo);
    };

    this.publishZWaveAddNode = function (zwaveNode) {
        var eventInfo = new EventInfo();
        eventInfo.name = 'zwave add node';
        eventInfo.text = 'Added ZWave device, ' + zwaveNode.displayName;
        eventInfo.zwaveNode = zwaveNode;
        publish(eventInfo);
    };

    this.publishZWaveRemoveNode = function (zwaveNode) {
        var eventInfo = new EventInfo();
        eventInfo.name = 'zwave remove node';
        eventInfo.text = 'Removed ZWave device, ' + zwaveNode.displayName;
        eventInfo.zwaveNode = zwaveNode;
        publish(eventInfo);
    };
}

module.exports = SystemEvents;  