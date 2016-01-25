'use strict';

var constants = require('./constants.js');
var bitdog = require('bitdog-client');

function CommonMessageSchemas() {

    this.__defineGetter__('zwaveEventMessageSchema', function () {
        var messageSchema = bitdog.getMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT);
                                    
        if (messageSchema == null) {
            messageSchema = bitdog.createMessageSchema(constants.MESSAGE_SCHEMA_ZWAVE_EVENT)
            .addObjectProperty('value', null);
        }

        return messageSchema;

    });
    
}

module.exports = new CommonMessageSchemas();