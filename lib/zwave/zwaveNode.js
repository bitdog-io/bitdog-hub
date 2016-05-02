var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var ZWaveClass = require('./ZWaveClass.js');

function ZWaveNode(nodeId) {
    var _id = nodeId;
    var _manufacturer = '';
    var _manufacturerId = '';
    var _product = '';
    var _productType = '';
    var _productId = '';
    var _type = '';
    var _name = '';
    var _location = '';
    var _classes = [];
    var _ready = false;
    var _hash = '';
    var _status = 'Unknown';

    this.setNodeInformation = function (zwaveNodeInfo) {
        _manufacturer = zwaveNodeInfo.manufacturer;
        _manufacturerId = zwaveNodeInfo.manufacturerid;
        _product = zwaveNodeInfo.product;
        _productType = zwaveNodeInfo.producttype;
        _productId = zwaveNodeInfo.productid;
        _type = zwaveNodeInfo.type;
        _name = zwaveNodeInfo.name;
        _location = zwaveNodeInfo.loc;
        _hash = _id + _manufacturerId + _productId;
        _ready = true;
        
        if (_name !== '' || _location !== '')
            setNodeConfiguration();
        else
            getNodeConfiguration();
    }

    this.updateValue = function (zwaveValueInfo)
    {
        var zwaveClass = getZWaveClass(zwaveValueInfo);
        return zwaveClass.updateValue(zwaveValueInfo);
    }

    this.removeValue = function (commandClassId, instanceId, index) {
        for (var index = 0; index < _classes.length; index++) {
            if (_classes[index].id == commandClassId) {
                var zwaveClass = _classes[index];
                zwaveClass.removeValue(commandClassId, instanceId, index);

                if (zwaveClass.instances.length < 1) {
                    zwaveClass.splice(index, 1);
                }

                return;
            }
        }
    }
    
    this.getValue = function (commandClassId, instanceId, indexId) {
        var zwaveClass = null;
        for (var index = 0; index < _classes.length; index++) {
            if (_classes[index].id == commandClassId) {
                zwaveClass = _classes[index];
                break;
            }
        }
        
        if (zwaveClass != null)
            return zwaveClass.getValue(instanceId, indexId);
        else
            return null;
    }

    function getZWaveClass(zwaveValueInfo) {
        for (var index = 0; index < _classes.length; index++) {
            if (_classes[index].id == zwaveValueInfo.class_id)
                return _classes[index];
        }
        
        var zwaveClass = new ZWaveClass(zwaveValueInfo.class_id)
        _classes.push(zwaveClass);
        return zwaveClass;
    }
    
    function setNodeConfiguration() {
        var nodeInformation = bitdogClient.configuration.get(constants.ZWAVE_NODE_INFORMATION);
        
        if (typeof nodeInformation === typeof undefined || nodeInformation === null)
            nodeInformation = {};

        nodeInformation[_hash] = { name: _name, location: _location };

        bitdogClient.configuration.set(constants.ZWAVE_NODE_INFORMATION, nodeInformation);

    }
    
    function getNodeConfiguration() {
        var nodeInformation = bitdogClient.configuration.get(constants.ZWAVE_NODE_INFORMATION);

        if (typeof nodeInformation !== typeof undefined && nodeInformation !== null) {
            var nodeSettings = nodeInformation[_hash];
            if (typeof nodeSettings !== typeof undefined && nodeSettings !== null) {
                if (typeof nodeSettings.name !== typeof undefined && nodeSettings.name !== null)
                    _name = nodeSettings.name;
                if (typeof nodeSettings.location !== typeof undefined && nodeSettings.location !== null)
                    _location = nodeSettings.location;
            }
        }

    }
    
    this.__defineGetter__('id', function () { return _id; });
    this.__defineGetter__('manufacturer', function () { return _manufacturer; });
    this.__defineGetter__('manufacturerId', function () { return _manufacturerId; });
    this.__defineGetter__('product', function () { return _product; });
    this.__defineGetter__('productType', function () { return _productType; });
    this.__defineGetter__('productId', function () { return _productId; });
    this.__defineGetter__('type', function () { return _type; });
    this.__defineGetter__('name', function () { return _name; });
    this.__defineSetter__('name', function (value) {  _name = value; setNodeConfiguration(); });
    this.__defineGetter__('location', function () { return _location; });
    this.__defineSetter__('location', function (value) { _location = value; setNodeConfiguration(); });
    this.__defineGetter__('classes', function () { return _classes; });
    this.__defineGetter__('hash', function () { return _hash; });
    this.__defineGetter__('ready', function () { return _ready; });
    this.__defineGetter__('status', function () { return __status; });
    this.__defineSetter__('status', function (value) { _status = value; });
}

module.exports = ZWaveNode