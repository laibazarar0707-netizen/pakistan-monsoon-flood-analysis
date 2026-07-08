var cfg = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:00_config.js');
var bnd = require('users/Noor_rr/Pak_Monsoon_2015_to_2025:01_boundaries.js');

var CHIRPS = ee.ImageCollection('UCSB-CHG/CHIRPS/DAILY').select('precipitation');

// Builds a 4-band image: June, July, August, September totals for one year
function monthlyRainfallImage(year) {
  var months = ee.List.sequence(6, 9); // Jun, Jul, Aug, Sep
  var bandsList = months.map(function (m) {
    m = ee.Number(m);
    var start = ee.Date.fromYMD(year, m, 1);
    var end = start.advance(1, 'month');
    return CHIRPS.filterDate(start, end).sum()
      .rename(ee.String('Month_').cat(m.format('%d')));
  });
  return ee.ImageCollection(bandsList).toBands().clip(bnd.pakistan);
}

var year = 2022; // change this to any year you want to inspect
var monthlyImg = monthlyRainfallImage(year);

// ONE reduceRegions-style call across all 160 districts x 4 months - efficient
var monthlyChart = ui.Chart.image.byRegion({
  image: monthlyImg,
  regions: bnd.districts,
  reducer: ee.Reducer.mean(),
  scale: 11132,
  xProperty: bnd.DISTRICT_NAME_FIELD
}).setOptions({
  title: 'Monthly Monsoon Rainfall by District - ' + year,
  vAxis: {title: 'Rainfall (mm)'},
  hAxis: {title: 'District'}
});

print(monthlyChart);
