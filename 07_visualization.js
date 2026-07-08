var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
var rain = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:02_rainfall_chirps.js');
var flood = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:05_flood_sentinel1.js');

var rainfallVis = {min: 0, max: 900, palette: ['f7fbff', 'c6dbef', '6baed6', '2171b5', '08306b']};
var classVis = {min: 0, max: 3, palette: ['ffffcc', 'a1dab4', '41b6c4', '225ea8']};
var floodVis = {min: 0, max: 1, palette: ['00000000', 'ff3333']};

function classifyIntensity(img) {
  var c = cfg.CLASS_CUTOFFS;
  var noRain = img.lt(c.noRain);
  var low = img.gte(c.noRain).and(img.lt(c.low));
  var moderate = img.gte(c.low).and(img.lt(c.moderate));
  var heavy = img.gte(c.moderate);
  return ee.Image(0)
    .where(noRain, 0).where(low, 1).where(moderate, 2).where(heavy, 3)
    .rename('intensity_class').clip(bnd.pakistan);
  // 0=No, 1=Low, 2=Moderate, 3=Heavy
}

var classificationMap = classifyIntensity(rain.meanRainfall11yr);

function addAllLayersToMap() {
  Map.centerObject(bnd.pakistan, 5);

  Map.addLayer(rain.meanRainfall11yr, rainfallVis, '11yr Avg Monsoon Rainfall');
  Map.addLayer(rain.stdDevRainfall11yr, {min: 0, max: 300, palette: ['ffffff', 'ff7f00', '7f0000']}, '11yr Rainfall StdDev', false);
  Map.addLayer(classificationMap, classVis, 'Monsoon Intensity Class');
  Map.addLayer(flood.detectFlood(2022), floodVis, 'Flood Extent 2022');
  Map.addLayer(bnd.districts.style({color: 'black', fillColor: '00000000', width: 1}), {}, 'District Boundaries');

  cfg.YEARS.evaluate(function (yearsList) {
    yearsList.forEach(function (y) {
      Map.addLayer(rain.monsoonRainfall(y), rainfallVis, 'Rainfall ' + y, false);
      Map.addLayer(flood.detectFlood(y), floodVis, 'Flood ' + y, false);
    });
  });
}

exports.rainfallVis = rainfallVis;
exports.classVis = classVis;
exports.floodVis = floodVis;
exports.classifyIntensity = classifyIntensity;
exports.classificationMap = classificationMap;
exports.addAllLayersToMap = addAllLayersToMap;

// Run once to visually confirm before moving on
//addAllLayersToMap();


// var rainfallVis = {min: 0, max: 900, palette: ['f7fbff', 'c6dbef', '6baed6', '2171b5', '08306b']};
// var classVis = {min: 0, max: 3, palette: ['ffffcc', 'a1dab4', '41b6c4', '225ea8']};
// var floodVis = {min: 0, max: 1, palette: ['00000000', 'ff3333']};

// function classifyIntensity(img) {
//   var c = cfg.CLASS_CUTOFFS;
//   var noRain = img.lt(c.noRain);
//   var low = img.gte(c.noRain).and(img.lt(c.low));
//   var moderate = img.gte(c.low).and(img.lt(c.moderate));
//   var heavy = img.gte(c.moderate);
//   return ee.Image(0)
//     .where(noRain, 0).where(low, 1).where(moderate, 2).where(heavy, 3)
//     .rename('intensity_class').clip(bnd.pakistan);
//   // 0=No, 1=Low, 2=Moderate, 3=Heavy
// }

// var classificationMap = classifyIntensity(rain.meanRainfall11yr);

// function addAllLayersToMap() {
//   Map.centerObject(bnd.pakistan, 6); // CHANGED: zoom 5 -> 6 for better flood visibility
//   Map.addLayer(rain.meanRainfall11yr, rainfallVis, '11yr Avg Monsoon Rainfall');
//   Map.addLayer(rain.stdDevRainfall11yr, {min: 0, max: 300, palette: ['ffffff', 'ff7f00', '7f0000']}, '11yr Rainfall StdDev', false);
//   Map.addLayer(classificationMap, classVis, 'Monsoon Intensity Class');
//   Map.addLayer(flood.detectFlood(2022), floodVis, 'Flood Extent 2022');
//   Map.addLayer(bnd.districts.style({color: 'black', fillColor: '00000000', width: 1}), {}, 'District Boundaries');
//   cfg.YEARS.evaluate(function (yearsList) {
//     yearsList.forEach(function (y) {
//       Map.addLayer(rain.monsoonRainfall(y), rainfallVis, 'Rainfall ' + y, false);
//       Map.addLayer(flood.detectFlood(y), floodVis, 'Flood ' + y, false);
//     });
//   });
// }

// // NEW: Zoomed-in view for a single district's flood extent (useful for report screenshots)
// function showDistrictFlood(districtName, year) {
//   var district = bnd.districts.filter(ee.Filter.eq(bnd.DISTRICT_NAME_FIELD, districtName));
//   Map.centerObject(district, 10);
//   Map.addLayer(flood.detectFlood(year).clip(district), floodVis, districtName + ' Flood ' + year);
//   Map.addLayer(district.style({color: 'black', fillColor: '00000000', width: 2}), {}, districtName + ' Boundary');
// }

// exports.rainfallVis = rainfallVis;
// exports.classVis = classVis;
// exports.floodVis = floodVis;
// exports.classifyIntensity = classifyIntensity;
// exports.classificationMap = classificationMap;
// exports.addAllLayersToMap = addAllLayersToMap;
// exports.showDistrictFlood = showDistrictFlood; // NEW export

// // Run once to visually confirm before moving on
// //addAllLayersToMap();
// //showDistrictFlood('Sujawal', 2022); // NEW: uncomment to test zoomed flood view
