var opencc = {}; 
var unicode_data = {};
var summary_data = {
    map: {}, // 仅繁简
    map2: {}, //繁简+兼 划 日  等 
    map3: {}, //把对map2来说不必要的关联也加进来
};

var fs = require('fs');
eval(fs.readFileSync('../pre_common/functions.js').toString());

// file is included here:
eval(fs.readFileSync('../opencc-data/opencc-data-map2.js').toString());
eval(fs.readFileSync('../unicode-data/unicode-data-map2.js').toString());



//     cat cn-1c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_一级.txt
//     cat cn-2c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_二级.txt
//     cat cn-3c.txt |awk '{print $2}'  | grep -E "^$" -v   | cut -c -1 > cn通用规范汉字表_三级.txt   

var edu_cn_1c = [];
var edu_cn_2c = [];
var edu_cn_3c = [];
var edu_hk = [];

//     cat hk.txt |awk '{print $2}'  | grep -E "^$" -v > hk常用字字形表.txt

// cat tw2-wiki.txt |column -t -s '|' | awk '{print $2}' | grep -E "^$" -v > tw次常用國字標準字體表.txt
var edu_tw_1 = fs.readFileSync("../edu-data/tw常用國字標準字體表.txt").toString();
var edu_tw_2 = fs.readFileSync("../edu-data/tw次常用國字標準字體表.txt").toString();
    

async function start()
{
    for (c in unicode_data.map2)
    {
        const mapObj = unicode_data.map2 [c];
        if (mapObj ['isEdu_CN_1c'] )
            edu_cn_1c.push(c);
        if (mapObj ['isEdu_CN_2c'] )
            edu_cn_2c.push(c);
        if (mapObj ['isEdu_CN_3c'] )
            edu_cn_3c.push(c);
        if (mapObj ['isEdu_HK'] )
            edu_hk.push(c);
    }


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



