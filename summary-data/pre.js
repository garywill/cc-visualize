var opencc = {}; 
var unicode_data = {};
var summary_map = {};

var fs = require('fs');

// file is included here:
eval(fs.readFileSync('../opencc-data/opencc-data-map2.js').toString());
eval(fs.readFileSync('../unicode-data/unicode-data-map2.js').toString());

async function start()
{
    for (c in unicode_data.map2 )
    {
        summary_map [c] = combineCharObj(c, unicode_data.map2, opencc.map2);
    }
    for (c in opencc.map2 )
    {
        summary_map [c] = combineCharObj(c, unicode_data.map2, opencc.map2);
    }
    for (c in summary_map)
    {
        const cObj = summary_map[c];
        
        if ( cObj['isChi'] && ! cObj['isTrad'] && cObj['isSimp'] ) 
            cObj['isTrad'] = true;
        
        if ( cObj['isChi'] && ( cObj['isTrad'] || cObj['isSimp'] ) )
            delete cObj['isChi'];
    }
    summary_map = sortMapObj(summary_map);
    fs.writeFileSync("summary-data-map.js" , ( "summary_map = \n" + JSON.stringify(summary_map) + "\n;" )
        .replaceAll("},", "},\n")
    );
}
start();

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
function sortMapObj(mapObj) {
    var newMapObj = {};
    const origI = Object.keys(mapObj).sort();
//     console.log(origI);
    for ( c of origI )
    {
//         console.log(c);
        newMapObj[c] = JSON.parse( JSON.stringify( mapObj[c] ) );
        if ( Array.isArray(newMapObj [c] ['rel'] ) )
        {
            newMapObj [c] ['rel']  = newMapObj [c] ['rel'] .sort();
        }
    }
    return newMapObj;
//     Object.assign( mapObj , JSON.parse( JSON.stringify( newMapObj ) ) );
//     console.log(mapObj);
    
}
