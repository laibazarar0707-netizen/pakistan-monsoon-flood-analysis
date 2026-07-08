var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');
var rain = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:02_rainfall_chirps.js');
var stats = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:03_district_stats.js');
var pred = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:04_predictive_analysis.js');
var flood = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:05_flood_sentinel1.js');
var corr = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:06_correlation_flood_rainfall.js');
var viz = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:07_visualization.js');

function stripGeometry(fc) {
  return fc.map(function(f) { return f.setGeometry(null); });
}

function stripGeometry(fc) {
  return fc.map(function(f) { return f.setGeometry(null); });
}

function runAllExports() {
  // ---- Tables (CSV) - 6 total ----
  Export.table.toDrive({
    collection: stripGeometry(stats.yearlyDistrictStatsTable), description: 'district_yearly_stats_deep',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });
  Export.table.toDrive({
    collection: stripGeometry(pred.anomalyTable), description: 'district_yearly_anomaly',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });
  Export.table.toDrive({
    collection: stripGeometry(pred.trendProjectionTable), description: 'district_trend_2026_2027_prediction',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });
  Export.table.toDrive({
    collection: stripGeometry(flood.floodAreaTable), description: 'district_flood_area_all_years',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });
  Export.table.toDrive({
    collection: stripGeometry(corr.rainFloodTable), description: 'district_rainfall_flood_combined',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });
  Export.table.toDrive({
    collection: stripGeometry(corr.rainFloodCorrelationTable), description: 'district_rainfall_flood_correlation',
    folder: cfg.DRIVE_FOLDER, fileFormat: 'CSV'
  });

  // ---- Images: 11yr average, stddev, classification - 3 total ----
  Export.image.toDrive({
    image: rain.meanRainfall11yr, description: 'rainfall_11yr_average',
    folder: cfg.DRIVE_FOLDER, region: bnd.pakistan.geometry(), scale: 5566, maxPixels: 1e10
  });
  Export.image.toDrive({
    image: rain.stdDevRainfall11yr, description: 'rainfall_11yr_stddev',
    folder: cfg.DRIVE_FOLDER, region: bnd.pakistan.geometry(), scale: 5566, maxPixels: 1e10
  });
  Export.image.toDrive({
    image: viz.classificationMap, description: 'monsoon_intensity_classification',
    folder: cfg.DRIVE_FOLDER, region: bnd.pakistan.geometry(), scale: 5566, maxPixels: 1e10
  });

  // ---- 11 individual yearly rainfall maps ----
  for (var y1 = cfg.YEAR_START; y1 <= cfg.YEAR_END; y1++) {
    Export.image.toDrive({
      image: rain.monsoonRainfall(y1), description: 'rainfall_' + y1,
      folder: cfg.DRIVE_FOLDER, region: bnd.pakistan.geometry(), scale: 5566, maxPixels: 1e10
    });
  }

  // ---- 11 flood extent images ----
  for (var y2 = cfg.YEAR_START; y2 <= cfg.YEAR_END; y2++) {
    Export.image.toDrive({
      image: flood.detectFlood(y2), description: 'flood_extent_' + y2,
      folder: cfg.DRIVE_FOLDER, region: bnd.pakistan.geometry(), scale: 100, maxPixels: 1e10
    });
  }
}

exports.runAllExports = runAllExports;
