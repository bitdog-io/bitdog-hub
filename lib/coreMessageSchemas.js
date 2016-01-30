'use strict';

var constants = require('./constants.js');
var bitdogClient = require('bitdog-client');

function CoreMessageSchemas() {

    this.__defineGetter__('zwaveEventMessageSchema', function () {
        var messageSchema = bitdogClient.getMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT);
                                    
        if (messageSchema == null) {
            messageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT)
            .addObjectProperty('value', null);
        }

        return messageSchema;

    });

    this.__defineGetter__('zwaveConfigurationMessageSchema', function () {
        var messageSchema = bitdogClient.getMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION);
        
        if (messageSchema == null) {
            messageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION)
            .addObjectProperty('node', null);
        }
        
        return messageSchema;

    });
    
}

module.exports = new CoreMessageSchemas();