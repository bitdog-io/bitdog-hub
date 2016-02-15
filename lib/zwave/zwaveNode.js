var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var ZWaveClass = require('./ZWaveClass.js');

function ZWaveNode(nodeId, homeId) {
    var _homeId = homeId;
    var _nodeId = nodeId;
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

    this.setNodeInformation = function (zwaveNodeInfo) {
        _manufacturer = zwaveNodeInfo.manufacturer;
        _manufacturerId = zwaveNodeInfo.manufacturerid;
        _product = zwaveNodeInfo.product;
        _productType = zwaveNodeInfo.producttype;
        _productId = zwaveNodeInfo.productid;
        _type = zwaveNodeInfo.type;
        _name = zwaveNodeInfo.name;
        _location = zwaveNodeInfo.loc;
        _ready = true;
    }

    this.updateValue = function (zwaveValueInfo)
    {
        var zwaveClass = getClass(zwaveValueInfo);
        return zwaveClass.updateValue(zwaveValueInfo);
    }

    this.removeValue = function (commandClassId, instanceId, index) {
        for (var index = 0; index < this.classes.length; index++) {
            if (this.classes[index].id == commandClassId) {
                var zwaveClass = this.classes[index];
                zwaveClass.removeValue(commandClassId, instanceId, index);

                if (zwaveClass.instances.length < 1) {
                    zwaveClass.splice(index, 1);
                }

                return;
            }
        }
    }

    function getClass(zwaveValueInfo) {
        for (var index = 0; index < this.classes.length; index++) {
            if (this.classes[index].id == zwaveValueInfo.class_id)
                return this.classes[index];
        }
        
        var zwaveClass = new ZWaveClass(zwaveValueInfo.class_id)
        this.classes.push(zwaveClass);
        return zwaveClass;
    }
    
    this.__defineGetter__("homeId", function () { return _homeId; });
    this.__defineGetter__("nodeId", function () { return _nodeId; });
    this.__defineGetter__("manufacturer", function () { return _manufacturer; });
    this.__defineGetter__("manufacturerId", function () { return _manufacturerId; });
    this.__defineGetter__("product", function () { return _product; });
    this.__defineGetter__("productType", function () { return _productType; });
    this.__defineGetter__("productId", function () { return _productId; });
    this.__defineGetter__("type", function () { return _type; });
    this.__defineGetter__("name", function () { return _name; });
    this.__defineGetter__("location", function () { return _location; });
    this.__defineGetter__("classes", function () { return _classes; });
    this.__defineGetter__("ready", function () { return _ready; });
}

module.exports = ZWaveNode