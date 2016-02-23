'use strict';

var constants = require('./constants.js');
var bitdogClient = require('bitdog-client');

function CoreMessageSchemas() {
    var _zwaveNodeStatusMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_NODE_STATUS)
    .addStringProperty('homeId', '')
    .addNumberProperty('nodeId', 0)
    .addStringProperty('status', '');

    var _zwaveValueMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_VALUE)
    .addStringProperty('homeId', '')
    .addStringProperty('valueId', '')
    .addObjectProperty('value', null);
    
    var _zwaveConfigurationMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION)
    .addObjectProperty('c', null);
        
    var _zwaveSetNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE)
    .addStringProperty('homeId', '')
    .addNumberProperty('nodeId', 0);
    
    var _zwaveSetNodeLevelMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL)
    .addStringProperty('homeId', '')
    .addNumberProperty('nodeId', 0)
    .addNumberProperty('value',100);
    
    this.__defineGetter__('zwaveNodeStatusMessageSchema', function () {
        return _zwaveNodeStatusMessageSchema;
    });
        
    this.__defineGetter__('zwaveValueMessageSchema', function () {
        return _zwaveValueMessageSchema;
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
}

module.exports = new CoreMessageSchemas();