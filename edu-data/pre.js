var fs = require('fs');

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


function sortMapObj(mapObj) {
    
    var newMapObj = {};
    const origI = Object.keys(mapObj).sort();
    for ( c of origI )
    {
        if ( Array.isArray(mapObj[c]) )
            newMapObj[c] = JSON.parse( JSON.stringify( mapObj[c] ) );
        else
        {
            newMapObj [c] = {};
            
            if ( Array.isArray(mapObj [c] ['rel'] ) )
            {
                newMapObj [c] ['rel']  = JSON.parse( JSON.stringify( mapObj [c] ['rel'] .sort() ) );
            }
            
            var otherIsAttrs = new Set ( Object.keys(mapObj [c]) ) ;
            otherIsAttrs.delete ('rel');
            otherIsAttrs = [...otherIsAttrs].sort();
            for (attr of otherIsAttrs)
            {
                newMapObj [c] [attr] = JSON.parse( JSON.stringify( mapObj [c] [attr] ) );
            }
        }
    }
    return newMapObj;
}



function combineMap(map_1, map_2)
{
    var rmap = {};
    
    for (c in map_1 )
    {
        rmap [c] = combineCharObj(c, map_1, map_2);
    }    
    for (c in map_2 )
    {
        rmap [c] = combineCharObj(c, map_1, map_2);
    }    
    return rmap;
}

function combineCharObj(c , fromMap1, fromMap2) 
{
    var map1obj = fromMap1[c] ? JSON.parse(JSON.stringify( fromMap1 [c] )) : { rel: [] };
    var map2obj = fromMap2[c] ? JSON.parse(JSON.stringify( fromMap2 [c] )) : { rel: [] } ;
    
    var coRel = [ ... unionSet( (new Set(map1obj['rel'])) , (new Set(map2obj['rel'])) ) ] ;
    
    var newCObj = {
        rel : coRel,
    };
    
    delete map1obj['rel'];
    delete map2obj['rel'];
    
    for (kn in map1obj) 
    {
        newCObj[kn] = map1obj[kn];
    }
    for (kn in map2obj) 
    {
        newCObj[kn] = map2obj[kn];
    }
    
    return newCObj;
}

function unionSet(setA, setB) {
    let _union = new Set(setA);
    for (let elem of setB) {
        _union.add(elem);
    }
    return _union;
}

//如果某表中还没有这个字的索引，为它创建一个新的（空内容但有基本结构的）
function createKey( key , mapObj)
{
    if ( mapObj[key] === undefined)
    {
        mapObj[key] = { 
            "rel" : []
        };
        
    }
}
