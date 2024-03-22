var fs = require('fs');

const cm = require('../pre_common/functions.js');

var edu_data = {
    map2: {}, 
};
edu_data.CN_1c = require('./edu-data-CN-1c.json');
edu_data.CN_2c = require('./edu-data-CN-2c.json');
edu_data.CN_3c = require('./edu-data-CN-3c.json');

edu_data.HK = require('./edu-data-HK.json');
edu_data.HK_rel = require('./edu-data-HK-rel.json');

edu_data.TW_A = require('./edu-data-TW-A.json');
edu_data.TW_B = require('./edu-data-TW-B.json');


for ( var c of edu_data.HK)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_HK'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for ( var c of edu_data.CN_1c)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_1c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for ( var c of edu_data.CN_2c)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_2c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for ( var c of edu_data.CN_3c)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_3c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

for ( var c of edu_data.TW_A)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_TW_A'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

for ( var c of edu_data.TW_B)
{
    cm.createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_TW_B'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

edu_data.map2 = cm.combineMap(edu_data.map2, edu_data.HK_rel)
edu_data.map2 = cm.sortMapObj(edu_data.map2);

fs.writeFileSync("edu-data-map2.json" ,  JSON.stringify(edu_data.map2) .replaceAll("},", "},\n") );

