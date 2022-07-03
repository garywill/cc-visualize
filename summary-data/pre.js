var opencc = {}; 
var unicode_data = {};
var summary_data = {
    map: {}, // 仅繁简
    map2: {}, //繁简+兼 划 日  等 
    map3: {}, //把对map2来说不必要的关联也加进来
};

var fs = require('fs');

// file is included here:
eval(fs.readFileSync('../opencc-data/opencc-data-map2.js').toString());
eval(fs.readFileSync('../unicode-data/unicode-data-map2.js').toString());



//     cat cn-1c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_一级.txt
//     cat cn-2c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_二级.txt
//     cat cn-3c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_三级.txt   
var edu_cn_1c = fs.readFileSync("../edu-data/cn通用规范汉字表_一级.txt").toString();
var edu_cn_2c = fs.readFileSync("../edu-data/cn通用规范汉字表_二级.txt").toString();
var edu_cn_3c = fs.readFileSync("../edu-data/cn通用规范汉字表_三级.txt").toString();

//     cat hk.txt |awk '{print $2}'  | grep -E "^$" -v > hk常用字字形表.txt
var edu_hk = fs.readFileSync("../edu-data/hk常用字字形表.txt").toString();

// cat tw2-wiki.txt |column -t -s '|' | awk '{print $2}' | grep -E "^$" -v > tw次常用國字標準字體表.txt
var edu_tw_1 = fs.readFileSync("../edu-data/tw常用國字標準字體表.txt").toString();
var edu_tw_2 = fs.readFileSync("../edu-data/tw次常用國字標準字體表.txt").toString();
    

async function start()
{
    
    edu_cn_1c = eduTxtToArr( edu_cn_1c);
    edu_cn_2c = eduTxtToArr( edu_cn_2c);
    edu_cn_3c = eduTxtToArr( edu_cn_3c);

    edu_hk = eduTxtToArr ( edu_hk );

    edu_tw_1 = eduTxtToArr ( edu_tw_1 );
    edu_tw_2 = eduTxtToArr ( edu_tw_2 );       

    for ( c of edu_cn_1c )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_CN_1c'] = true;
        mapObj ['isEdu'] = true;
    }
    for ( c of edu_cn_2c )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_CN_2c'] = true;
        mapObj ['isEdu'] = true;
    }
    for ( c of edu_cn_3c )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_CN_3c'] = true;
        mapObj ['isEdu'] = true;
    }
    
    for ( c of edu_hk )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_HK'] = true;
        mapObj ['isEdu'] = true;
    }

    for ( c of edu_tw_1 )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_TW_1'] = true;
        mapObj ['isEdu'] = true;
    }
    for ( c of edu_tw_2 )
    {
        createKey(c, summary_data.map2);
        const mapObj = summary_data.map2 [c];
        mapObj ['isEdu_TW_2'] = true;
        mapObj ['isEdu'] = true;
    }
    
//     console.log(summary_data.map2);
    
    for (c in unicode_data.map2)
    {
        const uObj = unicode_data.map2[c];
        const sObj = summary_data.map2[c];
        
        if ( !sObj)
            continue;
        
        if (uObj['isSimp'])
        {
            if (   (  sObj['isEdu_HK']    ||  sObj['isEdu_TW_1']  )
                && ( !sObj['isEdu_CN_1c'] && !sObj['isEdu_CN_2c'] )
            )
                delete uObj['isSimp'];
        }
    } 
    
    for (c in unicode_data.map2)
    {
        const uObj = unicode_data.map2[c];
        const sObj = summary_data.map2[c];
        
        if ( !sObj)
            continue;
        
        if (uObj['isTrad'])
        {
            if (   (  sObj['isEdu_CN_1c'] ||  sObj['isEdu_CN_2c'] )
                && ( !sObj['isEdu_HK']    && !sObj['isEdu_TW_1']  && !sObj['isEdu_TW_2'] )
            )
                delete uObj['isTrad'];  
        }
    } 
    
    for (c in summary_data.map2 )
    {
        summary_data.map2 [c] = combineCharObj(c, summary_data.map2, unicode_data.map2);
    }    
    for (c in unicode_data.map2 )
    {
        summary_data.map2 [c] = combineCharObj(c, summary_data.map2, unicode_data.map2);
    }    
    
    
    for (c in summary_data.map2 )
    {
        summary_data.map2 [c] = combineCharObj(c, summary_data.map2, opencc.map2);
    }
    
    for (c in opencc.map2 )
    {
        summary_data.map2 [c] = combineCharObj(c, summary_data.map2, opencc.map2);
    }
    

    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if ( cObj['isChi'] && ! cObj['isTrad'] && cObj['isSimp'] ) 
            cObj['isTrad'] = true;
    }
    
    // cat summary-data-map.js |grep -o 'is.*'|uniq|sort|uniq
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isComp'])
        {
            var rels = getAllRel( summary_data.map2, cObj['rel'] );
            updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isRad'])
        {
            var rels = getAllRel( summary_data.map2, cObj['rel'] );
            updateCharRel(summary_data.map2 , c , rels);
        }
    }

    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_TW'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = getAllRel( summary_data.map2, cObj['rel'] );
            updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_HK'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = getAllRel( summary_data.map2, cObj['rel'] );
            updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_JP'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = getAllRel( summary_data.map2, cObj['rel'] );
            updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    
    


    
    for ( c of edu_cn_1c )
    {
        const mapObj = summary_data.map2 [c];

        if (mapObj ['isTrad'] && !mapObj ['isSimp'] )
            mapObj ['isSimp'] = true;
    }
    
    for ( c of edu_cn_2c )
    {
        const mapObj = summary_data.map2 [c];

        if (mapObj ['isTrad'] && !mapObj ['isSimp'] )
            mapObj ['isSimp'] = true;
    }

    
    
    for ( c of edu_hk )
    {
        const mapObj = summary_data.map2 [c];
        
        if (mapObj ['isSimp'] && !mapObj ['isTrad'] )
            mapObj ['isTrad'] = true;
    }
    

    for ( c of edu_tw_1 )
    {
        const mapObj = summary_data.map2 [c];
        
        if (mapObj ['isSimp'] && !mapObj ['isTrad'] )
            mapObj ['isTrad'] = true;
    }

    
    
    
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if ( cObj['isChi']
            && ( 
                   !cObj['isVari_JP']
                || cObj['isTrad'] 
                || cObj['isSimp'] 
                || cObj['isEdu_CN_1c']
                || cObj['isEdu_CN_2c']
                || cObj['isEdu_CN_3c']
                || cObj['isEdu_HK']
                || cObj['isEdu_TW_1']
                || cObj['isEdu_TW_2']
            ) 
        )
            delete cObj['isChi'];
    }    
    

    
    
    
    summary_data.map2 = sortMapObj(summary_data.map2);
    fs.writeFileSync("summary-data-map2.js" , ( "summary_data.map2 = \n" + JSON.stringify(summary_data.map2) + "\n;" )
        .replaceAll("},", "},\n")
    );
}
start();


function eduTxtToArr(txt) {
    txt = new Set( Array.from(txt) ); 
    txt.delete('\n');
    txt.delete('\r');
    txt.delete(' ');
    txt.delete('\t');
    txt.delete('、');
    txt = [... txt ];
    return txt;
}

function updateCharRel(mapObj, char, updatedRelSet)
{
    var newSet = new Set(updatedRelSet);
    newSet.delete(char);

    mapObj[char]['rel'] = [...newSet].sort();
}

//参数char可以是字符串（单个字），也可以是数组（一个元素是一个字）
//参数mapObj指定要从哪一个表中读取
//把输入的一个或多个字的目前表中已知的关联字都找出来
function getAllRel( mapObj, chars)
{
    if ( typeof(chars) === "string" )
        chars = [chars];
    
    var set = new Set();
    
    chars.forEach( function(char) {
        set.add(char);
        
        if (mapObj[char] !== undefined)
        {
            mapObj[char]['rel'].forEach( function(relChar) {
                set.add(relChar);
            });
        }
    });
    
    return [...set];
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

function createKey( key , mapObj)
{
    if ( mapObj[key] === undefined)
    {
        mapObj[key] = { 
            "rel" : []
        };
    }
}


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
