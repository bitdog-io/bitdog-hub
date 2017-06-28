//-----------------------------------------------------------------------------
//
//	weatherManager.js
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
var Forecast = require('./forecast.js');
var bitdogClient = require('bitdog-client');
var constants = require('../constants.js');
var coreMessageSchemas = require('../coreMessageSchemas.js');
var moment = require('moment');

function WeatherManager() {
    
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

    var _forecasts = [];
    this.__defineGetter__('forecasts', function () { return _forecasts; });

}

WeatherManager.prototype.processWeatherForecast = function (weatherForecast) {
    var self = this;
    
    weatherForecast.timedate = moment();
    
    this.forecasts.push(weatherForecast);
    
    while (this.forecasts.length > 24 * 30) { this.forecasts.shift(); }
    
    bitdogClient.sendData('bd-weatherForecast', coreMessageSchemas.weatherForecastMessageSchema, function (message) {
        message.currentTemperatureC = weatherForecast.current.temp_c;
        message.currentTemperatureF = weatherForecast.current.temp_f;
        message.currentPressureIn = weatherForecast.current.pressure_in;
        message.currentPressureMb = weatherForecast.current.pressure_mb;
        message.currentWindDegree = weatherForecast.current.wind_degree;
        message.currentWindDirection = weatherForecast.current.wind_dir;
        message.currentWindKph = weatherForecast.current.wind_kph;
        message.currentWindMph = weatherForecast.current.wind_mph;
        message.todayAvgTemperatureC = weatherForecast.forecast.forecastday[0].avgtemp_c;
        message.todayAvgTemperatureF = weatherForecast.forecast.forecastday[0].avgtemp_f;
        message.todayMaxTemperatureC = weatherForecast.forecast.forecastday[0].maxtemp_c;
        message.todayMaxTemperatureF = weatherForecast.forecast.forecastday[0].maxtemp_f;
        message.todayMaxWindKph = weatherForecast.forecast.forecastday[0].maxwind_kph;
        message.todayMaxWindMph = weatherForecast.forecast.forecastday[0].maxwind_mph;
        message.todayMinTemperatureC = weatherForecast.forecast.forecastday[0].mintemp_c;
        message.todayMinTemperatureF = weatherForecast.forecast.forecastday[0].mintemp_f;
        message.todayTotalPrecipitationIn = weatherForecast.forecast.forecastday[0].totalprecip_in;
        message.todayTotalPrecipitationMm =  weatherForecast.forecast.forecastday[0].totalprecip_mm;
    });
}
};

var weatherMan = new WeatherMan();
module.exports = weatherMan; // singleton 