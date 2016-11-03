var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var ZWaveClass = require('./ZWaveClass.js');

function ZWaveNode(nodeId, zwave) {
    var _id = nodeId;
    var _manufacturer = '';
    var _manufacturerId = '';
    var _product = '';
    var _productType = '';
    var _productId = '';
    var _type = '';
    var _typeGeneric = '';
    var _typeSpecific = '';
    var _typeBasic = '';
    var _name = '';
    var _location = '';
    var _classes = [];
    var _ready = false;
    var _hash = '';
    var _status = 'Unknown';
    var _neighbors = [];
    var _zwave = zwave;

    this.setNodeInformation = function (zwaveNodeInfo, ready) {
        _manufacturer = zwaveNodeInfo.manufacturer;
        _manufacturerId = zwaveNodeInfo.manufacturerid;
        _product = zwaveNodeInfo.product;
        _productType = zwaveNodeInfo.producttype;
        _productId = zwaveNodeInfo.productid;
        _type = zwaveNodeInfo.type;
        _name = zwaveNodeInfo.name;
        _location = zwaveNodeInfo.loc;
        _hash = _id + _manufacturerId + _productId;
        _ready = ready === true && _productType != '';


        _typeGeneric = zwave.getNodeGeneric(_id).toString(16);
        _typeBasic = zwave.getNodeSpecific(_id).toString(16);
        _typeSpecific = zwave.getNodeBasic(_id).toString(16);


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
                    _classes.splice(index, 1);
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

    this.getClass = function (commandClassId) {
        for (var index = 0; index < _classes.length; index++) {
            if (_classes[index].id == commandClassId)
                return _classes[index];
        }

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
    
    
    this.__defineGetter__('id', function () { return _id; });
    this.__defineGetter__('manufacturer', function () { return _manufacturer; });
    this.__defineGetter__('manufacturerId', function () { return _manufacturerId; });
    this.__defineGetter__('product', function () { return _product; });
    this.__defineGetter__('productType', function () { return _productType; });
    this.__defineGetter__('productId', function () { return _productId; });
    this.__defineGetter__('type', function () { return _type; });
    this.__defineGetter__('typeGeneric', function () { return _typeGeneric; });
    this.__defineGetter__('typeBasic', function () { return _typeBasic; });
    this.__defineGetter__('typeSpecific', function () { return _typeSpecific; });
    this.__defineGetter__('name', function () { return _name; });
    this.__defineSetter__('name', function (value) {  _name = value; });
    this.__defineGetter__('location', function () { return _location; });
    this.__defineSetter__('location', function (value) { _location = value; });
    this.__defineGetter__('classes', function () { return _classes; });
    this.__defineGetter__('hash', function () { return _hash; });
    this.__defineGetter__('ready', function () { return _ready; });
    this.__defineGetter__('neighbors', function () { return _neighbors; });
    this.__defineGetter__('status', function () { return _status; });
    this.__defineSetter__('status', function (value) { _status = value; });
    this.__defineGetter__('displayName', function () {
        if (_name !== '')
            return _name;
        else if (_product !== '')
            return _product;
        else if (_type !== '')
            return _type;
        else
            return 'Unknown';
    });
}

module.exports = ZWaveNode