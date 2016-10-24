
function AlarmMode() {
    this.__defineGetter__('away', function () { return 'Away'; });
    this.__defineGetter__('stay', function () { return 'Stay'; });
    this.__defineGetter__('disarmed', function () { return 'Disarmed'; });
};

module.exports = new AlarmMode();