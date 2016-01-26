function ZWaveNode() {
    this.manufacturer = '';
    this.manufacturerId = '';
    this.product = '';
    this.productType = '';
    this.productId = '';
    this.type = '';
    this.name = '';
    this.loc = '';
    this.commandClasses = { };
    this.ready = false;

    this.setNodeInformation = function (nodeInfo) {
        this.manufacturer = nodeInfo.manufacturer;
        this.manufacturerId = nodeInfo.manufacturerid;
        this.product = nodeInfo.product;
        this.productType = nodeInfo.producttype;
        this.productId = nodeInfo.productid;
        this.type = nodeInfo.type;
        this.name = nodeInfo.name;
        this.loc = nodeInfo.loc;
        this.ready = true;
    }

    this.updateValue = function (zwaveValue)
    {

    }
}

module.exports = ZWaveNode