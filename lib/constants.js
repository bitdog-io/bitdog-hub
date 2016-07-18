
function Constants() {
    ////////////////// Message Classes /////////////////////
    this.MESSAGE_CLASS_ZWAVE_CONFIGURATION = 'zwaveConfiguration';

    ////////////////// Zwave Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ZWAVE_NODE_STATUS = 'bitdog-zwave-node-status';
    this.MESSAGE_SCHEMA_ZWAVE_VALUE = 'bitdog-zwave-value';
    this.MESSAGE_SCHEMA_ZWAVE_CONFIGURATION = 'bitdog-zwave-configuration';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE = 'bitdog-zwave-set-node';
    this.MESSAGE_SCHEMA_ZWAVE_SET_NODE_LEVEL = 'bitdog-zwave-set-node-level';
    this.MESSAGE_SCHEMA_ZWAVE_ACTIVATE = 'bitdog-zwave-activate';
    this.MESSAGE_SCHEMA_ZWAVE_ADD_NODE = 'bitdog-zwave-add-node';
    this.MESSAGE_SCHEMA_ZWAVE_NODE = 'bitdog-zwave-node';
    this.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_COMMAND = 'bitdog-zwave-controller-command';
    this.MESSAGE_SCHEMA_ZWAVE_HEAL_NETWORK_NODE = 'bitdog-zwave-heal-network-node';
    this.MESSAGE_SCHEMA_ZWAVE_RENAME = 'bitdog-zwave-rename';
    this.MESSAGE_SCHEMA_ZWAVE_CONTROLLER_MODE = 'bitdog-zwave-controller-mode';
    
    this.MESSAGE_SCHEMA_ZWAVE_SET_PERCENTAGE = 'bitdog-zwave-set-percentage';
    //this.MESSAGE_SCHEMA_ZWAVE_INCREMENT_PERCENTAGE = 'bitdog-zwave-increment-percentage';
    //this.MESSAGE_SCHEMA_ZWAVE_DECREMENT_PERCENTAGE = 'bitdog-zwave-decrement-percentage';
    this.MESSAGE_SCHEMA_ZWAVE_SET_TEMPERTURE = 'bitdog-zwave-set-temperture';
    this.MESSAGE_SCHEMA_ZWAVE_INCREMENT_DECREMENT_TEMPERTURE = 'bitdog-zwave-increment-decrement-temperture';


    ////////////////// Alarm Message Schema //////////////////////
    this.MESSAGE_SCHEMA_ALARM_ARM_AWAY = 'bitdog-alarm-arm-away';
    this.MESSAGE_SCHEMA_ALARM_ARM_STAY = 'bitdog-alarm-arm-stay';
    this.MESSAGE_SCHEMA_ALARM_DISARM = 'bitdog-alarm-disarm';
    
    ////////////////// Configuration ////////////////////////////
    this.ZWAVE_CONNECTIONS_CONFIG = 'zwave:connections';
    this.ALARM_ZONES_CONFIG = 'alarm:zones';
    this.AUTOMATIONS_CONFIG = 'automation:automations';
    this.ZWAVE_NETWORKKEY_CONFIG = 'zwave:networkKey';
    this.ZWAVE_NODE_INFORMATION = 'zwave:nodeInformation';
    
    
    ////////////////// LOGGING //////////////////////////////////
    this.LOG_PROCESS_BITDOG_SA = 'BitdogHub';
    this.LOG_PROCESS_ZWAVE = 'ZWave';
    this.LOG_PROCESS_BITDOG_CLIENT = 'Bitdog Client'
    this.LOG_PROCESS_ALARM = 'Alarm';
    this.LOG_PROCESS_BRAIN = 'Brain'
}

module.exports = new Constants();  