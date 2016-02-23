
function Constants() {
    ////////////////// Message Classes /////////////////////
    this.MESSAGE_CLASS_ZWAVE_CONFIGURATION = 'zwaveConfiguration';

    ////////////////// Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ZWAVE_VALUE_CHANGED = 'bitdog-zwave-value-changed';
    this.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION = 'bitdog-zwave-configuration';
    this.MESSAGE_SCHEMA_ZWAVE_SET_VALUE = 'bitdog-zwave-set-value';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE = 'bitdog-zwave-set-node';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL = 'bitdog-zwave-set-node-level';

    this.LOG_PROCESS_BITDOG_SA = 'BitdogSA';
    this.LOG_PROCESS_ZWAVE = 'ZWave';
    this.LOG_PROCESS_BITDOG_CLIENT = 'Bitdog Client'
}

module.exports = new Constants();  