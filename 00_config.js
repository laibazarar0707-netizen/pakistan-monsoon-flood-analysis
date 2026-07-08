exports.YEAR_START = 2015;
exports.YEAR_END = 2025;
exports.YEARS = ee.List.sequence(2015, 2025);

exports.MONSOON_START_MONTH = 6; // June 1
exports.MONSOON_END_MONTH = 10;  // exclusive -> Sep 30

exports.DRIVE_FOLDER = 'Pakistan_Monsoon_Project';

// Rainfall intensity classification cutoffs (mm, monsoon total)
exports.CLASS_CUTOFFS = {noRain: 50, low: 200, moderate: 500};

// Sentinel-1 flood detection
exports.FLOOD_DB_THRESHOLD = 3; // dB drop = flooded
exports.FLOOD_BEFORE_WINDOW = {startMonth: 4, endMonth: 6}; // Apr-May
exports.FLOOD_AFTER_WINDOW = {startMonth: 8, endDay: [9, 16]}; // Aug1-Sep16

// Rainy-day threshold for "number of rainy days" metric
exports.RAINY_DAY_MM = 1; // a day counts as "rainy" if >=1mm

// Prediction target years
exports.PREDICT_YEARS = [2026, 2027];
