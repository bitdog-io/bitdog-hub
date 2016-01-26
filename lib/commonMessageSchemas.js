'use strict';

var constants = require('./constants.js');
var bitdogClient = require('bitdog-client');

function CommonMessageSchemas() {

    this.__defineGetter__('zwaveEventMessageSchema', function () {
        var messageSchema = bitdogClient.getMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT);
                                    
        if (messageSchema == null) {
            messageSchema = bitdogClient.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT)
            .addObjectProperty('value', null);
        }

        return messageSchema;

    });
    
}

module.exports = new CommonMessageSchemas();