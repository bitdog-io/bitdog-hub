//-----------------------------------------------------------------------------
//
//	zwaveNode.js
//
//	Copyright (c) 2015-2017 Bitdog LLC.
//
//	SOFTWARE NOTICE AND LICENSE
//
//	This file is part of bitdog-hub.
//
//	bitdog-hub is free software: you can redistribute it and/or modify
//	it under the terms of the GNU General Public License as published
//	by the Free Software Foundation, either version 3 of the License,
//	or (at your option) any later version.
//
//	bitdog-hub is distributed in the hope that it will be useful,
//	but WITHOUT ANY WARRANTY; without even the implied warranty of
//	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//	GNU General Public License for more details.
//
//	You should have received a copy of the GNU General Public License
//	along with bitdog-hub.  If not, see <http://www.gnu.org/licenses/>.
//
//-----------------------------------------------------------------------------


var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var ZWaveClass = require('./zwaveClass.js');

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


        _typeGeneric = decimalToHex(zwave.getNodeGeneric(_id),2);
        _typeSpecific = decimalToHex(zwave.getNodeSpecific(_id),2);
        _typeBasic = decimalToHex(zwave.getNodeBasic(_id), 2);

    }

    this.getNodeInformation = function () {
        return {
            manufacturer: zwaveNodeInfo.manufacturer,
            manufacturerId: zwaveNodeInfo.manufacturerid,
            product: zwaveNodeInfo.product,
            productType: zwaveNodeInfo.producttype,
            productId: zwaveNodeInfo.productid,
            type: zwaveNodeInfo.type,
            name: zwaveNodeInfo.name,
            location: zwaveNodeInfo.loc,
            hash: _id + _manufacturerId + _productId,
            ready: ready === true && _productType != '',


            typeGeneric = decimalToHex(zwave.getNodeGeneric(_id), 2),
            typeSpecific = decimalToHex(zwave.getNodeSpecific(_id), 2),
            typeBasic = decimalToHex(zwave.getNodeBasic(_id), 2),
        };
    }

    function decimalToHex(d, padding) {
        var hex = Number(d).toString(16);
        padding = typeof padding ===  typeof undefined || padding === null ? padding = 2 : padding;

        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return ('0x' + hex).toUpperCase();
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