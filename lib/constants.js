
function Constants() {
    ////////////////// Message Classes /////////////////////
    this.MESSAGE_CLASS_ZWAVE_CONFIGURATION = 'zwaveConfiguration';

    ////////////////// Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ZWAVE_EVENT = 'bitdog-zwave-event';
    this.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION = 'bitdog-zwave-configuration';   
    this.LOG_PROCESS_BITDOG_SA = 'BitdogSA';
    this.LOG_PROCESS_ZWAVE = 'ZWave';
    this.LOG_PROCESS_BITDOG_CLIENT = 'Bitdog Client'
}

module.exports = new Constants();  