var fs = require('fs');

eval(fs.readFileSync('../pre_common/functions.js').toString());

var edu_data = {
    map2: {}, 
};
eval(fs.readFileSync('edu-data-CN-1c.js').toString());
eval(fs.readFileSync('edu-data-CN-2c.js').toString());
eval(fs.readFileSync('edu-data-CN-3c.js').toString());
eval(fs.readFileSync('edu-data-HK.js').toString());
eval(fs.readFileSync('edu-data-HK-rel.js').toString());
eval(fs.readFileSync('edu-data-TW-A.js').toString());
eval(fs.readFileSync('edu-data-TW-B.js').toString());

for (c of edu_data.HK)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_HK'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for (c of edu_data.CN_1c)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_1c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for (c of edu_data.CN_2c)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_2c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
}

for (c of edu_data.CN_3c)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_CN_3c'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

for (c of edu_data.TW_A)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_TW_A'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

for (c of edu_data.TW_B)
{
    createKey(c, edu_data.map2);
    edu_data.map2[c] ['isEdu_TW_B'] = true;
//     edu_data.map2[c] ['isEdu'] = true;
} 

edu_data.map2 = combineMap(edu_data.map2, edu_data.HK_rel)
edu_data.map2 = sortMapObj(edu_data.map2);

fs.writeFileSync("edu-data-map2.js" , ( "edu_data.map2 = \n" + JSON.stringify(edu_data.map2) + "\n;" )
    .replaceAll("},", "},\n")
);

