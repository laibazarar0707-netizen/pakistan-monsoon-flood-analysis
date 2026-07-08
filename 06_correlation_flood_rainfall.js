var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
var rain = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:02_rainfall_chirps.js');
var stats = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:03_district_stats.js');
var flood = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:05_flood_sentinel1.js');

// ---------- Full table (used only at export time, NEVER print this in console) ----------
function combinedRainFloodTable() {
  var districtFilter = ee.Filter.equals({leftField: 'district', rightField: 'district'});
  var yearFilter = ee.Filter.equals({leftField: 'year', rightField: 'year'});
  var combinedFilter = ee.Filter.and(districtFilter, yearFilter);

  var joined = ee.Join.saveFirst('floodMatch').apply({
    primary: stats.yearlyDistrictStatsTable,
    secondary: flood.floodAreaTable,
    condition: combinedFilter
  });

  return joined.map(function (f) {
    var match = ee.Feature(f.get('floodMatch'));
    var floodArea = ee.Number(match.get('flood_area_km2'));
    var districtArea = ee.Number(f.get('district_area_km2'));
    var floodPercent = floodArea.divide(districtArea).multiply(100);
    return f.set({
      flood_area_km2: floodArea,
      flood_percent_of_district: floodPercent
    });
  });
}

var rainFloodTable = combinedRainFloodTable();

// ---------- Per-district correlation (used at export time) ----------
function correlationForDistrict(name) {
  name = ee.String(name);

  var rainRows = stats.yearlyDistrictStatsTable.filter(ee.Filter.eq('district', name));
  var floodRows = flood.floodAreaTable.filter(ee.Filter.eq('district', name));

  var joined = ee.Join.saveFirst('floodMatch').apply({
    primary: rainRows,
    secondary: floodRows,
    condition: ee.Filter.equals({leftField: 'year', rightField: 'year'})
  });

  var withPercent = joined.map(function (f) {
    var match = ee.Feature(f.get('floodMatch'));
    var floodArea = ee.Number(match.get('flood_area_km2'));
    var districtArea = ee.Number(f.get('district_area_km2'));
    return f.set({
      flood_area_km2: floodArea,
      flood_percent_of_district: floodArea.divide(districtArea).multiply(100)
    });
  });

  var corr = withPercent.reduceColumns({
    reducer: ee.Reducer.pearsonsCorrelation(),
    selectors: ['mean_mm', 'flood_area_km2']
  });

  return ee.Feature(null, {
    district: name,
    rainfall_flood_correlation: corr.get('correlation')
  });
}

function allDistrictCorrelations() {
  var names = bnd.districts.aggregate_array(bnd.DISTRICT_NAME_FIELD).distinct();
  return ee.FeatureCollection(names.map(correlationForDistrict));
}

var rainFloodCorrelationTable = allDistrictCorrelations();

// ---------- Lightweight test - EVERYTHING computed only on Rajanpur's own geometry ----------
//var testDistrict = bnd.districts.filter(ee.Filter.eq(bnd.DISTRICT_NAME_FIELD, 'Rajanpur'));

//function lightweightRainForYear(year) {
//  var rainImg = rain.monsoonRainfall(year);
//  return rainImg.reduceRegions({
//    collection: testDistrict,
//    reducer: ee.Reducer.mean(),
//    scale: 11132
//  }).map(function (feat) {
//    return feat.set({year: year, mean_mm: feat.get('mean')});
//  });
//}

// function lightweightFloodForYear(year) {
//   var f = flood.detectFlood(year);
//   var areaImg = f.multiply(ee.Image.pixelArea()).divide(1e6);
//   return areaImg.reduceRegions({
//     collection: testDistrict,
//     reducer: ee.Reducer.sum(),
//     scale: 30
//   }).map(function (feat) {
//     return feat.set({year: year, flood_area_km2: feat.get('sum')});
//   });
// }

// var lightweightRainTable = ee.FeatureCollection(cfg.YEARS.map(lightweightRainForYear)).flatten();
// var lightweightFloodTable = ee.FeatureCollection(cfg.YEARS.map(lightweightFloodForYear)).flatten();

// var joinedTest = ee.Join.saveFirst('floodMatch').apply({
//   primary: lightweightRainTable,
//   secondary: lightweightFloodTable,
//   condition: ee.Filter.equals({leftField: 'year', rightField: 'year'})
// });

// var testCorr = joinedTest.map(function (feat) {
//   var match = ee.Feature(feat.get('floodMatch'));
//   return feat.set('flood_area_km2', match.get('flood_area_km2'));
// }).reduceColumns({
//   reducer: ee.Reducer.pearsonsCorrelation(),
//   selectors: ['mean_mm', 'flood_area_km2']
// });

//print('Lightweight test - Rajanpur correlation:', testCorr);

exports.rainFloodTable = rainFloodTable;
exports.rainFloodCorrelationTable = rainFloodCorrelationTable;
