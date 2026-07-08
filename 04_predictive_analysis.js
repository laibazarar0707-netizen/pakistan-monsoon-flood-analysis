var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
var stats = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:03_district_stats.js');

function anomalyForYear(year) {
  var rows = stats.statsForYear(year);
  return rows.map(function (f) {
    var districtName = f.get('district');
    var allYearsForDistrict = stats.yearlyDistrictStatsTable
      .filter(ee.Filter.eq('district', districtName));
    var mean11yr = allYearsForDistrict.aggregate_mean('mean_mm');
    var anomaly = ee.Number(f.get('mean_mm')).subtract(mean11yr);
    return f.set({mean11yr_mm: mean11yr, anomaly_mm: anomaly});
  });
}

var anomalyTable = ee.FeatureCollection(
  cfg.YEARS.map(function (y) { return anomalyForYear(y); })
).flatten();

function trendForDistrict(name) {
  name = ee.String(name);
  var rows = stats.yearlyDistrictStatsTable.filter(ee.Filter.eq('district', name));
  var rowsWithYear2 = rows.map(function (f) {
    var y = ee.Number(f.get('year'));
    return f.set('year2', y.multiply(y));
  });

  var linFit = rowsWithYear2.reduceColumns({
    reducer: ee.Reducer.linearFit(),
    selectors: ['year', 'mean_mm']
  });
  var linSlope = ee.Number(linFit.get('scale'));
  var linIntercept = ee.Number(linFit.get('offset'));

  var corr = rowsWithYear2.reduceColumns({
    reducer: ee.Reducer.pearsonsCorrelation(),
    selectors: ['year', 'mean_mm']
  });
  var r = ee.Number(corr.get('correlation'));
  var r2Linear = r.multiply(r);

  var quadFit = rowsWithYear2.reduceColumns({
    reducer: ee.Reducer.linearRegression({numX: 2, numY: 1}),
    selectors: ['year', 'year2', 'mean_mm']
  });
  var coeffs = ee.Array(quadFit.get('coefficients'));
  var a = coeffs.get([0, 0]);
  var b = coeffs.get([1, 0]);

  function quadPredict(yearVal) {
    yearVal = ee.Number(yearVal);
    return ee.Number(a).multiply(yearVal)
      .add(ee.Number(b).multiply(yearVal.multiply(yearVal)));
  }

  function linPredict(yearVal) {
    return linSlope.multiply(yearVal).add(linIntercept);
  }

  return ee.Feature(null, {
    district: name,
    linear_slope_mm_per_yr: linSlope,
    linear_r2: r2Linear,
    linear_2026_mm: linPredict(2026),
    linear_2027_mm: linPredict(2027),
    quadratic_2026_mm: quadPredict(2026),
    quadratic_2027_mm: quadPredict(2027),
    note: 'Statistical trend only, not a meteorological forecast'
  });
}

function allDistrictTrends() {
  var names = bnd.districts.aggregate_array(bnd.DISTRICT_NAME_FIELD).distinct();
  return ee.FeatureCollection(names.map(trendForDistrict));
}

var trendProjectionTable = allDistrictTrends();

// Lightweight test - filters to ONE district BEFORE running reduceRegions, not after
// var testDistrict = bnd.districts.filter(ee.Filter.eq(bnd.DISTRICT_NAME_FIELD, 'Rawalpindi'));

// function lightweightStatsForYear(year) {
//   var rainImg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:02_rainfall_chirps.js').monsoonRainfall(year);
//   return rainImg.reduceRegions({
//     collection: testDistrict,
//     reducer: ee.Reducer.mean(),
//     scale: 11132
//   }).map(function (f) {
//     return f.set({year: year, mean_mm: f.get('mean')});
//   });
// }

// var testTable = ee.FeatureCollection(cfg.YEARS.map(lightweightStatsForYear)).flatten();

// var testFit = testTable.reduceColumns({
//   reducer: ee.Reducer.linearFit(),
//   selectors: ['year', 'mean_mm']
// });

// print('Lightweight test - Rawalpindi linear fit:', testFit);

// exports.anomalyTable = anomalyTable;
// exports.trendForDistrict = trendForDistrict;
// exports.trendProjectionTable = trendProjectionTable;

// /**
// * 04_predictive_analysis.js
// * Anomaly rewritten to use a single grouped reduction instead of
// * filtering the full table once per district (was the bottleneck).
// */

// var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
// var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
// var stats = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:03_district_stats.js');

// // ---------- FAST anomaly: one grouped pass, then a single join ----------
// function buildAnomalyTable() {
//   // Single pass: compute 11yr mean per district using grouped reduction
//   var grouped = stats.yearlyDistrictStatsTable.reduceColumns({
//     reducer: ee.Reducer.mean().group({groupField: 1, groupName: 'district'}),
//     selectors: ['mean_mm', 'district']
//   });

//   var groupList = ee.List(grouped.get('groups'));
//   var districtMeans = ee.FeatureCollection(groupList.map(function (g) {
//     g = ee.Dictionary(g);
//     return ee.Feature(null, {district: g.get('district'), mean11yr_mm: g.get('mean')});
//   }));

//   // One join instead of 1,760 filters
//   var joined = ee.Join.saveFirst('meanMatch').apply({
//     primary: stats.yearlyDistrictStatsTable,
//     secondary: districtMeans,
//     condition: ee.Filter.equals({leftField: 'district', rightField: 'district'})
//   });

//   return joined.map(function (f) {
//     var match = ee.Feature(f.get('meanMatch'));
//     var mean11yr = match.get('mean11yr_mm');
//     var anomaly = ee.Number(f.get('mean_mm')).subtract(ee.Number(mean11yr));
//     return f.set({mean11yr_mm: mean11yr, anomaly_mm: anomaly});
//   });
// }

// var anomalyTable = buildAnomalyTable();

// // ---------- Trend (unchanged, already fine) ----------
// function trendForDistrict(name) {
//   name = ee.String(name);
//   var rows = stats.yearlyDistrictStatsTable.filter(ee.Filter.eq('district', name));
//   var rowsWithYear2 = rows.map(function (f) {
//     var y = ee.Number(f.get('year'));
//     return f.set('year2', y.multiply(y));
//   });

//   var linFit = rowsWithYear2.reduceColumns({
//     reducer: ee.Reducer.linearFit(),
//     selectors: ['year', 'mean_mm']
//   });
//   var linSlope = ee.Number(linFit.get('scale'));
//   var linIntercept = ee.Number(linFit.get('offset'));

//   var corr = rowsWithYear2.reduceColumns({
//     reducer: ee.Reducer.pearsonsCorrelation(),
//     selectors: ['year', 'mean_mm']
//   });
//   var r = ee.Number(corr.get('correlation'));
//   var r2Linear = r.multiply(r);

//   var quadFit = rowsWithYear2.reduceColumns({
//     reducer: ee.Reducer.linearRegression({numX: 2, numY: 1}),
//     selectors: ['year', 'year2', 'mean_mm']
//   });
//   var coeffs = ee.Array(quadFit.get('coefficients'));
//   var a = coeffs.get([0, 0]);
//   var b = coeffs.get([1, 0]);

//   function quadPredict(yearVal) {
//     yearVal = ee.Number(yearVal);
//     return ee.Number(a).multiply(yearVal)
//       .add(ee.Number(b).multiply(yearVal.multiply(yearVal)));
//   }
//   function linPredict(yearVal) {
//     return linSlope.multiply(yearVal).add(linIntercept);
//   }

//   return ee.Feature(null, {
//     district: name,
//     linear_slope_mm_per_yr: linSlope,
//     linear_r2: r2Linear,
//     linear_2026_mm: linPredict(2026),
//     linear_2027_mm: linPredict(2027),
//     quadratic_2026_mm: quadPredict(2026),
//     quadratic_2027_mm: quadPredict(2027),
//     note: 'Statistical trend only, not a meteorological forecast'
//   });
// }

// function allDistrictTrends() {
//   var names = bnd.districts.aggregate_array(bnd.DISTRICT_NAME_FIELD).distinct();
//   return ee.FeatureCollection(names.map(trendForDistrict));
// }

// var trendProjectionTable = allDistrictTrends();

exports.anomalyTable = anomalyTable;
exports.trendForDistrict = trendForDistrict;
exports.trendProjectionTable = trendProjectionTable;
