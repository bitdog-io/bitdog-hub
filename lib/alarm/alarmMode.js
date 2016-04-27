
function AlarmMode() {
    this.__defineGetter__('ArmedAway', function () { return 1; });
    this.__defineGetter__('ArmedStay', function () { return 2; });
    this.__defineGetter__('Disarmed', function () { return 3; });
};

module.exports = new AlarmMode();