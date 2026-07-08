var districts = ee.FeatureCollection('projects/extended-hydra-415602/assets/pak_admbnda_adm2_wfp_20220909');

var pakistan = districts.union(1);

var DISTRICT_NAME_FIELD = 'ADM2_EN';
var PROVINCE_NAME_FIELD = 'ADM1_EN';

function listDistrictNames() {
  return districts.aggregate_array(DISTRICT_NAME_FIELD);
}

// print('Total districts loaded:', districts.size());
// print('All district names:', districts.aggregate_array('ADM2_EN'));

// // Temporary visual check - remove once confirmed
// Map.centerObject(pakistan, 5);
// Map.addLayer(districts.style({color: 'red', fillColor: '00000000'}), {}, 'District Boundaries');

exports.districts = districts;
exports.pakistan = pakistan;
exports.DISTRICT_NAME_FIELD = DISTRICT_NAME_FIELD;
exports.PROVINCE_NAME_FIELD = PROVINCE_NAME_FIELD;
exports.listDistrictNames = listDistrictNames;
