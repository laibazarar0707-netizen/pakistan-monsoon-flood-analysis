var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
var rain = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:02_rainfall_chirps.js');

// District area (km2) - computed once, carried into every year's row
var districtsWithArea = bnd.districts.map(function (f) {
  return f.set('district_area_km2', f.geometry().area(1).divide(1e6));
});

function statsForYear(year) {
  var rainImg = rain.monsoonRainfall(year);
  var rainyImg = rain.rainyDayCount(year);

  var combinedReducer = ee.Reducer.mean()
    .combine({reducer2: ee.Reducer.sum(), sharedInputs: true})
    .combine({reducer2: ee.Reducer.max(), sharedInputs: true})
    .combine({reducer2: ee.Reducer.min(), sharedInputs: true})
    .combine({reducer2: ee.Reducer.stdDev(), sharedInputs: true});

  var rainStats = rainImg.reduceRegions({
    collection: districtsWithArea,
    reducer: combinedReducer,
    scale: 11132
  });

  var rainyStats = rainyImg.reduceRegions({
    collection: districtsWithArea,
    reducer: ee.Reducer.mean(),
    scale: 11132
  });

  var joined = ee.Join.saveFirst('rainyMatch').apply({
    primary: rainStats,
    secondary: rainyStats,
    condition: ee.Filter.equals({
      leftField: bnd.DISTRICT_NAME_FIELD,
      rightField: bnd.DISTRICT_NAME_FIELD
    })
  });

  return joined.map(function (f) {
    var rainyMatch = ee.Feature(f.get('rainyMatch'));
    var meanVal = ee.Number(f.get('mean'));
    var stdVal = ee.Number(f.get('stdDev'));
    var cv = stdVal.divide(meanVal).multiply(100);

    return f.set({
      district: f.get(bnd.DISTRICT_NAME_FIELD),
      province: f.get(bnd.PROVINCE_NAME_FIELD),
      year: year,
      district_area_km2: f.get('district_area_km2'),
      mean_mm: meanVal,
      sum_mm: f.get('sum'),
      max_mm: f.get('max'),
      min_mm: f.get('min'),
      stddev_mm: stdVal,
      cv_percent: cv,
      avg_rainy_days: rainyMatch.get('mean')
    }).select([
      'district', 'province', 'year', 'district_area_km2', 'mean_mm', 'sum_mm',
      'max_mm', 'min_mm', 'stddev_mm', 'cv_percent', 'avg_rainy_days'
    ]);
  });
}

var yearlyDistrictStatsTable = ee.FeatureCollection(
  cfg.YEARS.map(function (y) { return statsForYear(y); })
).flatten();

// Visual check - only computes ONE year (159 rows), safe for interactive preview
//print('Sample check - 2022 only (159 rows expected):', statsForYear(2022).limit(5));

exports.districtsWithArea = districtsWithArea;
exports.statsForYear = statsForYear;
exports.yearlyDistrictStatsTable = yearlyDistrictStatsTable;
