'use strict';

var constants = require('./constants.js');
var bitdogClient = require('bitdog-client');

function CoreMessageSchemas() {
    
    var _zwaveEventMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT)
    .addObjectProperty('value', null);
    
    var _zwaveConfigurationMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION)
    .addNumberProperty('tid', 0)
    .addObjectProperty('node', null);
    
    
    var _zwaveSetValueMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_VALUE)
    .addStringProperty('value', '')
    .addStringProperty('homeId', 0)
    .addNumberProperty('nodeId', 0)
    .addNumberProperty('classId', 0)
    .addNumberProperty('instanceId', 0)
    .addNumberProperty('indexId', 0);
    
    var _zwaveSetNodeMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE)
    .addStringProperty('homeId', 0)
    .addNumberProperty('nodeId', 0);
    
    var _zwaveSetNodeLevelMessageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL)
    .addStringProperty('homeId', 0)
    .addNumberProperty('nodeId', 0)
    .addNumberProperty('value',100);
        
    this.__defineGetter__('zwaveEventMessageSchema', function () {
        return _zwaveEventMessageSchema;
    });
    
    this.__defineGetter__('zwaveConfigurationMessageSchema', function () {
        return _zwaveConfigurationMessageSchema;
    });

    this.__defineGetter__('zwaveSetValueMessageSchema', function () {
        return _zwaveSetValueMessageSchema;
    });

    this.__defineGetter__('zwaveSetNodeMessageSchema', function () {
        return _zwaveSetNodeMessageSchema;
    });
 
    this.__defineGetter__('zwaveSetNodeLevelMessageSchema', function () {
        return _zwaveSetNodeLevelMessageSchema;
    });   
}

module.exports = new CoreMessageSchemas();