function ZWaveValue(zwaveValueInfo) {
    this.id = zwaveValueInfo.value_id;
    this.isReadOnly = zwaveValueInfo.read_only;
    this.isWriteOnly = zwaveValueInfo.write_only;
    this.type = zwaveValueInfo.type;
    this.label = zwaveValueInfo.label;
    this.help = zwaveValueInfo.help;
    this.units = zwaveValueInfo.units;
    this.value = zwaveValueInfo.value;
    this.genre = zwaveValueInfo.genre;
    this.isPolled = zwaveValueInfo.is_polled;
}

module.exports = ZWaveValue;