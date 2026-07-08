var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');

var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').select('precipitation');

function monsoonDateRange(year) {
  year = ee.Number(year);
  return {
    start: ee.Date.fromYMD(year, cfg.MONSOON_START_MONTH, 1),
    end: ee.Date.fromYMD(year, cfg.MONSOON_END_MONTH, 1)
  };
}

function monsoonRainfall(year) {
  var d = monsoonDateRange(year);
  return CHIRPS.filterDate(d.start, d.end)
    .sum()
    .rename('precip_mm')
    .set('year', year)
    .set('system:time_start', d.start.millis())
    .clip(bnd.pakistan);
}

function rainyDayCount(year) {
  var d = monsoonDateRange(year);
  var rainyDays = CHIRPS.filterDate(d.start, d.end)
    .map(function (img) { return img.gte(cfg.RAINY_DAY_MM); });
  return ee.ImageCollection(rainyDays).sum()
    .rename('rainy_days')
    .set('year', year)
    .clip(bnd.pakistan);
}

var yearlyRainfallCollection = ee.ImageCollection(
  cfg.YEARS.map(function (y) { return monsoonRainfall(y); })
);
var meanRainfall11yr = yearlyRainfallCollection.mean().rename('mean_precip_mm');
var stdDevRainfall11yr = yearlyRainfallCollection.reduce(ee.Reducer.stdDev()).rename('stddev_precip_mm');


exports.monsoonDateRange = monsoonDateRange;
exports.monsoonRainfall = monsoonRainfall;
exports.rainyDayCount = rainyDayCount;
exports.yearlyRainfallCollection = yearlyRainfallCollection;
exports.meanRainfall11yr = meanRainfall11yr;
exports.stdDevRainfall11yr = stdDevRainfall11yr;
