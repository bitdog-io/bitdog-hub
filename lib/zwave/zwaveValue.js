function ZWaveValue() {
    this.commandClass = 0;
    this.instance = 0;
    this.index = 0;
    this.isReadOnly = false;
    this.isWriteOnly = false;
    this.type = '';
    this.label = '';
    this.help = '';
    this.units = '';
    this.value = null;
}

module.exports = ZWaveValue;