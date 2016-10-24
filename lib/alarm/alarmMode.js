
function AlarmMode() {
    this.__defineGetter__('Away', function () { return 'Away'; });
    this.__defineGetter__('Stay', function () { return 'Stay'; });
    this.__defineGetter__('Disarmed', function () { return 'Disarmed'; });
};

module.exports = new AlarmMode();