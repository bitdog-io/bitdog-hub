'use strict';

var constants = require('./constants.js');
var bitdogClient = require('bitdog-client');

function CoreMessageSchemas() {
    var _zwaveRenameMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_RENAME)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addStringProperty('name', '');

    var _zwaveAddNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_ADD_NODE)
        .addStringProperty('homeId', '')
        .addBooleanProperty('withSecurity', true);

    var _zwaveNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_NODE)
        .addStringProperty('homeId', '')
        .addObjectProperty('node', null);

    var _zwaveControllerCommandMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_COMMAND)
        .addStringProperty('homeId', '');

    var _zwaveHealNetworkNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_HEAL_NETWORK_NODE)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addBooleanProperty('doReturnRoutes', true);

    var _zwaveNodeStatusMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_NODE_STATUS)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addStringProperty('status', '');

    var _zwaveValueMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_VALUE)
        .addStringProperty('homeId', '')
        .addStringProperty('valueId', '')
        .addObjectProperty('value', null);

    var _zwaveActivateMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_ACTIVATE)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addNumberProperty('classId', 0)
        .addNumberProperty('instanceId', 0)
        .addNumberProperty('index', 0);

    var _zwaveConfigurationMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION)
        .addStringProperty('homeId', '')
        .addNumberProperty('transactionId',0)
        .addNumberProperty('nodeId', 0)
        .addObjectProperty('node', null);

    var _zwaveSetNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0);

    var _zwaveControllerModeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_MODE)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addStringProperty('mode', 0);

    var _zwaveSetNodeLevelMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL)
        .addStringProperty('homeId', '')
        .addNumberProperty('nodeId', 0)
        .addNumberProperty('value', 100);

    var _zwaveSetPercentageMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_PERCENTAGE)
        .addStringProperty('homeId', '')
        .addStringProperty('valueId', '')
        .addNumberProperty('percentage', 100);

    var _zwaveSetTempertureMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_TEMPERTURE)
        .addStringProperty('homeId', '')
        .addStringProperty('nodeId', '')
        .addNumberProperty('celsius', 21.1);

    var _zwaveIncrementDecrementTempertureMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_INCREMENT_DECREMENT_TEMPERTURE)
        .addStringProperty('homeId', '')
        .addStringProperty('nodeId', '')
        .addNumberProperty('celsius', 1);

    var _alarmArmAwayMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ALARM_ARM_AWAY)
        .addStringProperty('user', '');

    var _alarmArmStayMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ALARM_ARM_STAY)
        .addStringProperty('user', '');

    var _alarmDisarmMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ALARM_DISARM)
        .addStringProperty('user', '');

    this.__defineGetter__('zwaveRenameMessageSchema', function () {
        return _zwaveRenameMessageSchema;
    });

    this.__defineGetter__('zwaveAddNodeMessageSchema', function () {
        return _zwaveAddNodeMessageSchema;
    });

    this.__defineGetter__('zwaveNodeMessageSchema', function () {
        return _zwaveNodeMessageSchema;
    });

    this.__defineGetter__('zwaveControllerCommandMessageSchema', function () {
        return _zwaveControllerCommandMessageSchema;
    });

    this.__defineGetter__('zwaveNodeStatusMessageSchema', function () {
        return _zwaveNodeStatusMessageSchema;
    });

    this.__defineGetter__('zwaveValueMessageSchema', function () {
        return _zwaveValueMessageSchema;
    });

    this.__defineGetter__('zwaveSetPercentageMessageSchema', function () {
        return _zwaveSetPercentageMessageSchema;
    });

    this.__defineGetter__('zwaveSetTempertureMessageSchema', function () {
        return _zwaveSetTempertureMessageSchema;
    });

    this.__defineGetter__('zwaveIncrementDecrementTempertureMessageSchema', function () {
        return _zwaveIncrementDecrementTempertureMessageSchema;
    });

    this.__defineGetter__('zwaveActivateMessageSchema', function () {
        return _zwaveActivateMessageSchema;
    });

    this.__defineGetter__('zwaveConfigurationMessageSchema', function () {
        return _zwaveConfigurationMessageSchema;
    });

    this.__defineGetter__('zwaveSetNodeMessageSchema', function () {
        return _zwaveSetNodeMessageSchema;
    });

    this.__defineGetter__('zwaveSetNodeLevelMessageSchema', function () {
        return _zwaveSetNodeLevelMessageSchema;
    });

    this.__defineGetter__('zwaveHealNetworkNodeMessageSchema', function () {
        return _zwaveHealNetworkNodeMessageSchema;
    });
  
    this.__defineGetter__('zwaveControllerModeMessageSchema', function () {
        return _zwaveControllerModeMessageSchema;
    });

    this.__defineGetter__('alarmArmAwayMessageSchema', function () {
        return _alarmArmAwayMessageSchema;
    });

    this.__defineGetter__('alarmArmStayMessageSchema', function () {
        return _alarmArmStayMessageSchema;
    });

    this.__defineGetter__('alarmDisarmMessageSchema', function () {
        return _alarmDisarmMessageSchema;
    });


}

module.exports = new CoreMessageSchemas();