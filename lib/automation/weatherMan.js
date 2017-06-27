//-----------------------------------------------------------------------------
//
//	weather.js
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
var coreMessageSchemas = require('../coreMessageSchemas.js');
var moment = require('moment');

function WeatherMan() {
    
    /*    
    Has it or will it rain / snow within X hour
    Current Temperature is over / under
    Today's max temperature is over / under
    Today's min temperature is over / under
    Today's avg temperature is over / under
    Today's cloud cover is over / under
    Today's precip is over / under
    Current humidity is over / under
    Current wind is over / under
    Today's max wind is over / under
    Today's min wind is over / under
    Current atmospheric pressure is over / under
*/
    var _currentTemperatureF = 0;
    var _currentTemperatureC = 0;
    
    var _todayMinTemperatureF = 0;
    var _todayMinTemperatureC = 0;
    
    var _todayMaxTemperatureF = 0;
    var _todayMaxTemperatureC = 0;
    
    var _todayAvgTemperatureF = 0;
    var _todayAvgTemperatureC = 0;
    
    this.__defineGetter__('currentTemperatureF', function () { return _currentTemperatureF; });
    this.__defineSetter__('currentTemperatureF', function (value) { _currentTemperatureF = value; });
    this.__defineGetter__('currentTemperatureC', function () { return _currentTemperatureC; });
    this.__defineSetter__('currentTemperatureC', function (value) { _currentTemperatureC = value; });
    
    this.__defineGetter__('todayMinTemperatureF', function () { return _todayMinTemperatureF; });
    this.__defineSetter__('todayMinTemperatureF', function (value) { _todayMinTemperatureF = value; });
    this.__defineGetter__('todayMinTemperatureC', function () { return _todayMinTemperatureC; });
    this.__defineSetter__('todayMinTemperatureC', function (value) { _todayMinTemperatureC = value; });
    
    this.__defineGetter__('todayMaxTemperatureF', function () { return _todayMaxTemperatureF; });
    this.__defineSetter__('todayMaxTemperatureF', function (value) { _todayMaxTemperatureF = value; });
    this.__defineGetter__('todayMaxTemperatureC', function () { return _todayMaxTemperatureC; });
    this.__defineSetter__('todayMaxTemperatureC', function (value) { _todayMaxTemperatureC = value; });
    
    this.__defineGetter__('todayAvgTemperatureF', function () { return _todayAvgTemperatureF; });
    this.__defineSetter__('todayAvgTemperatureF', function (value) { _todayAvgTemperatureF = value; });
    this.__defineGetter__('todayAvgTemperatureC', function () { return _todayAvgTemperatureC; });
    this.__defineSetter__('todayAvgTemperatureC', function (value) { _todayAvgTemperatureC = value; });
    
    var _todayTotalPrecipitationIn = 0;
    var _todayTotalPrecipitationMm = 0;
    
    this.__defineGetter__('todayTotalPrecipitationIn', function () { return _todayTotalPrecipitationIn; });
    this.__defineSetter__('todayTotalPrecipitationIn', function (value) { _todayTotalPrecipitationIn = value; });
    this.__defineGetter__('todayTotalPrecipitationMm', function () { return _todayTotalPrecipitationMm; });
    this.__defineSetter__('todayTotalPrecipitationMm', function (value) { _todayTotalPrecipitationMm = value; });
    
    var _todayMaxWindMph = 0;
    var _todayMaxWindKph = 0;
    
    this.__defineGetter__('todayMaxWindMph', function () { return _todayMaxWindMph; });
    this.__defineSetter__('todayMaxWindMph', function (value) { _todayMaxWindMph = value; });
    this.__defineGetter__('todayMaxWindKph', function () { return _todayMaxWindKph; });
    this.__defineSetter__('todayMaxWindKph', function (value) { _todayMaxWindKph = value; });
}

WeatherMan.prototype.processWeatherForecast = function (weatherForecast) {
    var self = this;

    if (weatherForecast.forecast.forecastday.length > 0) {
        var current = weatherForecast.current;
        var day = weatherForecast.forecast.forecastday[0].day;
        
        this.currentTemperatureC = current.temp_c;
        this.currentTemperatureF = current.temp_f;

        this.todayAvgTemperatureC = day.avgtemp_c;
        this.todayAvgTemperatureF = day.avgtemp_f;
        this.todayMaxTemperatureC = day.maxtemp_c;
        this.todayMaxTemperatureF = day.maxtemp_f;
        this.todayMaxWindKph = day.maxwind_kph;
        this.todayMaxWindMph = day.maxwind_mph;
        this.todayMinTemperatureC = day.mintemp_c;
        this.todayMinTemperatureF = day.mintemp_f;
        this.todayTotalPrecipitationIn = day.totalprecip_in;
        this.todayTotalPrecipitationMm =  day.totalprecip_mm;

        bitdogClient.sendData('bd-weatherForecast', coreMessageSchemas.weatherForecastMessageSchema, function (message) {
            var propertyName = null;

            for (propertyName in self) {
                message[propertyName] = self[propertyName];
            }

        });
    }
};

var weatherMan = new WeatherMan();
module.exports = weatherMan; // singleton 