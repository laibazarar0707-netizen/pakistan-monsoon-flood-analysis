var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');

// var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
//   .filter(ee.Filter.eq('instrumentMode', 'IW'))
//   .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
//   .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
//   .select('VV');

// var permanentWater = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
//   .select('seasonality').gte(10);

// function detectFlood(year) {
//   year = ee.Number(year);
//   var before = S1.filterDate(
//     ee.Date.fromYMD(year, cfg.FLOOD_BEFORE_WINDOW.startMonth, 1),
//     ee.Date.fromYMD(year, cfg.FLOOD_BEFORE_WINDOW.endMonth, 1)
//   ).median().clip(bnd.pakistan);

//   var after = S1.filterDate(
//     ee.Date.fromYMD(year, cfg.FLOOD_AFTER_WINDOW.startMonth, 1),
//     ee.Date.fromYMD(year, 9, 16)
//   ).median().clip(bnd.pakistan);

//   var diff = before.subtract(after).rename('db_drop');
//   var floodRaw = diff.gt(cfg.FLOOD_DB_THRESHOLD);
//   return floodRaw.updateMask(permanentWater.not()).rename('flood').set('year', year);
// }

// function floodAreaByDistrict(year) {
//   var flood = detectFlood(year);
//   var areaImg = flood.multiply(ee.Image.pixelArea()).divide(1e6); // km2

//   var stats = areaImg.reduceRegions({
//     collection: bnd.districts,
//     reducer: ee.Reducer.sum(),
//     scale: 30
//   });

//   return stats.map(function (f) {
//     return f.set({
//       district: f.get(bnd.DISTRICT_NAME_FIELD),
//       province: f.get(bnd.PROVINCE_NAME_FIELD),
//       year: year,
//       flood_area_km2: f.get('sum')
//     }).select(['district', 'province', 'year', 'flood_area_km2']);
//   });
// }

// var floodAreaTable = ee.FeatureCollection(
//   cfg.YEARS.map(function (y) { return floodAreaByDistrict(y); })
// ).flatten();

// // Lightweight test - ONE district, ONE year (2022, known flood year)
// // var testDistrict = bnd.districts.filter(ee.Filter.eq(bnd.DISTRICT_NAME_FIELD, 'Rajanpur'));
// // print('Test - Rajanpur flood area 2022 (heavily flooded district):',
// //   ee.Image(detectFlood(2022)).multiply(ee.Image.pixelArea()).divide(1e6)
// //     .reduceRegions({collection: testDistrict, reducer: ee.Reducer.sum(), scale: 30}));

// exports.detectFlood = detectFlood;
// exports.floodAreaByDistrict = floodAreaByDistrict;
// exports.floodAreaTable = floodAreaTable;

var S1 = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VV'))
  .filter(ee.Filter.eq('orbitProperties_pass', 'DESCENDING'))
  .select('VV');

var permanentWater = ee.Image('JRC/GSW1_4/GlobalSurfaceWater')
  .select('seasonality').gte(10);

var dem = ee.Image('USGS/SRTMGL1_003');
var slope = ee.Terrain.slope(dem);
var lowlandMask = dem.lt(1500).and(slope.lt(5));

function detectFlood(year) {
  year = ee.Number(year);
  var before = S1.filterDate(
    ee.Date.fromYMD(year, cfg.FLOOD_BEFORE_WINDOW.startMonth, 1),
    ee.Date.fromYMD(year, cfg.FLOOD_BEFORE_WINDOW.endMonth, 1)
  ).median().clip(bnd.pakistan);

  var after = S1.filterDate(
    ee.Date.fromYMD(year, cfg.FLOOD_AFTER_WINDOW.startMonth, 1),
    ee.Date.fromYMD(year, 9, 16)
  ).median().clip(bnd.pakistan);

  var beforeSmooth = before.focal_median({radius: 50, units: 'meters'});
  var afterSmooth = after.focal_median({radius: 50, units: 'meters'});

  var diff = beforeSmooth.subtract(afterSmooth).rename('db_drop');
  var floodRaw = diff.gt(cfg.FLOOD_DB_THRESHOLD);

  var floodConnected = floodRaw.selfMask().connectedPixelCount(8, true);
  var floodClean = floodRaw.updateMask(floodConnected.gte(8));

  return floodClean.updateMask(permanentWater.not()).updateMask(lowlandMask).rename('flood').set('year', year);
}

function floodAreaByDistrict(year) {
  var flood = detectFlood(year);
  var areaImg = flood.multiply(ee.Image.pixelArea()).divide(1e6);

  var stats = areaImg.reduceRegions({
    collection: bnd.districts,
    reducer: ee.Reducer.sum(),
    scale: 30
  });

  return stats.map(function (f) {
    return f.set({
      district: f.get(bnd.DISTRICT_NAME_FIELD),
      province: f.get(bnd.PROVINCE_NAME_FIELD),
      year: year,
      flood_area_km2: f.get('sum')
    }).select(['district', 'province', 'year', 'flood_area_km2']);
  });
}

var floodAreaTable = ee.FeatureCollection(
  cfg.YEARS.map(function (y) { return floodAreaByDistrict(y); })
).flatten();

exports.detectFlood = detectFlood;
exports.floodAreaByDistrict = floodAreaByDistrict;
exports.floodAreaTable = floodAreaTable;
