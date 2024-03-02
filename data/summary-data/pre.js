var unicode_data = {};
var edu_data = {};
var opencc = {}; 
var summary_data = {
    map: {}, // 仅繁简
    map2: {}, //繁简+兼 划 日  等 
    map3: {}, //把对map2来说不必要的关联也加进来
};

var fs = require('fs');
const cm = require('../pre_common/functions.js');

// file is included here:
eval(fs.readFileSync('../unicode-data/unicode-data-map2.js').toString());

eval(fs.readFileSync('../edu-data/edu-data-CN-1c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-CN-2c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-CN-3c.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-HK.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-TW-A.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-TW-B.js').toString());
eval(fs.readFileSync('../edu-data/edu-data-map2.js').toString());

eval(fs.readFileSync('../opencc-data/opencc-data-map2.js').toString());



    

async function start()
{

    // 用edu修正ucd的繁简标记
    for (c in unicode_data.map2)
    {
        const uObj = unicode_data.map2[c];
        const sObj = edu_data.map2[c];
        
        if ( !sObj)
            continue;
        
        if (uObj['isSimp'])
        {
            if (   (  sObj['isEdu_HK']    ||  sObj['isEdu_TW_A']  )
                && ( !sObj['isEdu_CN_1c'] && !sObj['isEdu_CN_2c'] )
            )
            {
                delete uObj['isSimp'];
                console.log(` ${c} 去掉isSimp`);
            }
        }
    } 
    
    for (c in unicode_data.map2)
    {
        const uObj = unicode_data.map2[c];
        const sObj = edu_data.map2[c];
        
        if ( !sObj)
            continue;
        
        if (uObj['isTrad'])
        {
            if (   (  sObj['isEdu_CN_1c'] ||  sObj['isEdu_CN_2c'] )
                && ( !sObj['isEdu_HK']    && !sObj['isEdu_TW_A']  && !sObj['isEdu_TW_B'] )
            )
            {
                delete uObj['isTrad'];  
                console.log(` ${c} 去掉isTrad`);
            }
        }
    } 
    
    
    
    for (c in summary_data.map2 )
    {
        summary_data.map2 [c] = cm.combineCharObj(c, summary_data.map2, unicode_data.map2);
    }    
    for (c in unicode_data.map2 )
    {
        summary_data.map2 [c] = cm.combineCharObj(c, summary_data.map2, unicode_data.map2);
    }    
    
    
    for (c in summary_data.map2 )
    {
        summary_data.map2 [c] = cm.combineCharObj(c, summary_data.map2, opencc.map2);
    }
    
    for (c in opencc.map2 )
    {
        summary_data.map2 [c] = cm.combineCharObj(c, summary_data.map2, opencc.map2);
    }
    
    
    for ( c in edu_data.map2)
    {
        edu_data.map2 [c] ['isEdu'] = true;
        
//         // TODO 临时
//         if ( edu_data.map2 [c] ['isEdu_TW_A'] )
//         {
//             delete  edu_data.map2 [c] ['isEdu_TW_A'] ;
//             edu_data.map2 [c] ['isEdu_TW_1'] = true;
//         }
//         if ( edu_data.map2 [c] ['isEdu_TW_B'] )
//         {
//             delete  edu_data.map2 [c] ['isEdu_TW_B'] ;
//             edu_data.map2 [c] ['isEdu_TW_2'] = true;
//         }

    }
    summary_data.map2 = cm.combineMap ( summary_data.map2, edu_data.map2 );

    
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
            var rels = cm.getAllRel( summary_data.map2, cObj['rel'] );
            cm.updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isRad'])
        {
            var rels = cm.getAllRel( summary_data.map2, cObj['rel'] );
            cm.updateCharRel(summary_data.map2 , c , rels);
        }
    }

    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_TW'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = cm.getAllRel( summary_data.map2, cObj['rel'] );
            cm.updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_HK'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = cm.getAllRel( summary_data.map2, cObj['rel'] );
            cm.updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    for (c in summary_data.map2)
    {
        const cObj = summary_data.map2[c];
        
        if (cObj['isVari_JP'] && ( !cObj['isSimp'] && !cObj['isTrad'] ) )
        {
            var rels = cm.getAllRel( summary_data.map2, cObj['rel'] );
            cm.updateCharRel(summary_data.map2 , c , rels);
        }
    }
    
    
    


    // 根据edu加繁简标记
    for ( c of edu_data.CN_1c )
    {
        const mapObj = summary_data.map2 [c];

        if (mapObj ['isTrad'] && !mapObj ['isSimp'] )
        {
            mapObj ['isSimp'] = true;
            console.log(` ${c} 加上isSimp，因陆表一`);
        }
    }
    
    for ( c of edu_data.CN_2c )
    {
        const mapObj = summary_data.map2 [c];

        if (mapObj ['isTrad'] && !mapObj ['isSimp'] )
        {
            mapObj ['isSimp'] = true;
            console.log(` ${c} 加上isSimp，因陆表二`);
        }
    }

    
    
    for ( c of edu_data.HK )
    {
        const mapObj = summary_data.map2 [c];
        
        if (mapObj ['isSimp'] && !mapObj ['isTrad'] )
        { 
            mapObj ['isTrad'] = true;
            console.log(` ${c} 加上isTrad，因港表`);
        }
    }
    

    for ( c of edu_data.TW_A )
    {
        const mapObj = summary_data.map2 [c];
        
        if (mapObj ['isSimp'] && !mapObj ['isTrad'] )
        { 
            mapObj ['isTrad'] = true;
            console.log(` ${c} 加上isTrad，因台表甲`);
        }
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
                || cObj['isEdu_TW_A']
                || cObj['isEdu_TW_B']
            ) 
        )
            delete cObj['isChi'];
    }    
    

    
    
    
    summary_data.map2 = cm.sortMapObj(summary_data.map2);
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



