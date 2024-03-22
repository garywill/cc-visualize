var fs = require('fs');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

const cm = require('../pre_common/functions.js');

// 共有<char> 149254 个

const kVarNames = [
    "kCompatibilityVariant",
    "kSemanticVariant",
    "kSimplifiedVariant",
    "kSpecializedSemanticVariant",
    "kSpoofingVariant",
    "kTraditionalVariant",
    "kZVariant",
    "EqUIdeo",
];

var unicode_data = {
    blocks: [],
    blocks_dict: {}, // 能用块名索引到的
    unihan_variants_raw: {}, // 所有（原始）unihan的k____Variants原始数据转成json
    unihan_variants: {},  // 所有（原始）unihan的k____Variants原始数据转成json，然后hex变中文字符，且k____Variants内容为数组
    map: {}, //繁简双向JSON
    map2: {}, //繁简加一些其他k__variant 
    ST: {}, // 简->繁JSON
    TS: {}, // 繁->简JSON
    
    charsAreUnif: [],
    
    ages: [],
    
    Cc: [], 
    Mn: [], 
};

var edu_data = {
    HK_numed : {}, // 所有字，带编号
    HK: [], // 只有单字的数组
    HK_map: {}, 
    
    CN_1c: [], 
    CN_2c: [], 
    CN_3c: [], 
};
// 这些都算作控制字符
const gcs_Cc = [   'Cc', 'Cf',  'Zl', 'Zp', 'Zs'   ];


const blks_prio = [
    "CJK Radicals Supplement",
    "CJK Symbols and Punctuation",
    "CJK Strokes",
    "Enclosed CJK Letters and Months",
    "CJK Compatibility",
    "CJK Unified Ideographs Extension A",
    "CJK Unified Ideographs",
    "CJK Compatibility Ideographs",
    "CJK Compatibility Forms",
    "CJK Unified Ideographs Extension B",
    "CJK Unified Ideographs Extension C",
    "CJK Unified Ideographs Extension D",
    "CJK Unified Ideographs Extension E",
    "CJK Unified Ideographs Extension F",
    "CJK Compatibility Ideographs Supplement",
    "CJK Unified Ideographs Extension G",
    "CJK Unified Ideographs Extension H",
    "Kangxi Radicals",
    
    "Halfwidth and Fullwidth Forms",
    "General Punctuation",
    "Latin-1 Supplement",
    "Basic Latin",
    "Enclosed Alphanumerics",
    
    "Private Use Area",
    "Supplementary Private Use Area-A",
    "Supplementary Private Use Area-B",
];
async function start() 
{   
    // xml nore 部分 变js原始string
    var ucd_nore_data_raw_string  =  fs.readFileSync('ucd.no-repertoire.xml',  'utf8');
    
//     fs.writeFileSync("unicode-data-ucd.no-repertoire.xml.js", "unicode_data.xml_nore = `\n" + ucd_nore_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
    // xml re 部分 变js原始string
    var ucd_data_raw_string =  fs.readFileSync('ucd.repertoire.xml',  'utf8');
    
//     fs.writeFileSync("unicode-data-ucd.repertoire.xml.js", "unicode_data.xml_re = `\n" + ucd_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
    const domparser = new DOMParser();
    
    // 转换blocks范围数据成json
    var xmlDocNore = domparser.parseFromString(ucd_nore_data_raw_string, "text/xml");
    var blockNodes = xmlDocNore.getElementsByTagName("ucd")[0].getElementsByTagName("blocks")[0].getElementsByTagName("block");
    var blocksInfoTxt = "";
    for ( block of Array.from(blockNodes)) {
        const name = block.getAttribute("name");
        const first_cp = Number( "0x" + block.getAttribute("first-cp") );
        const last_cp = Number( "0x" + block.getAttribute("last-cp") );
        unicode_data.blocks.push( {
            name: name,
            first_cp: first_cp,
            last_cp: last_cp,
        });
        unicode_data.blocks_dict [name] = [first_cp, last_cp];
        unicode_data.blocks.sort(function(a, b) {
            if ( isPrioBlk(a.name) && !isPrioBlk(b.name) )
                return -1 ;
            else
                return 0 ;
            
            function isPrioBlk(blkname) {
                    if ( blks_prio.includes (blkname) )
                        return true;
            }
        });
        
        blocksInfoTxt += `${block.getAttribute("first-cp")}\t${block.getAttribute("last-cp")}\t${block.getAttribute("name")}\n`;
    }
    fs.writeFileSync("unicode-data-blocks.json",JSON.stringify( unicode_data.blocks) .replaceAll("},", "},\n") );
    fs.writeFileSync("blocksInfoTxt.txt", blocksInfoTxt);
    
    var xmlDoc = domparser.parseFromString(ucd_data_raw_string, "text/xml");
    
    var repertoireNode = xmlDoc.getElementsByTagName("repertoire")[0];
    
    var charNodes = repertoireNode.getElementsByTagName("char");
    
    //所有k___Variants的raw内容转json
    for (charNode of Array.from(charNodes) )
    {
        const blk = charNode.getAttribute("blk");
        const cp =  charNode.getAttribute("cp");
        const first_cp =  charNode.getAttribute("first-cp");
        const last_cp =  charNode.getAttribute("last-cp");
        const UIdeo =  charNode.getAttribute("UIdeo");
        // grep -E "^ blk=" ucd.repertoire.xml |uniq|sort
//         if (  blk.includes("CJK") ||  blk.includes("Kangxi") )
        
        if (!cp || first_cp || last_cp)
            continue;
        
        for (kVarN of kVarNames) 
        {
            const kVarContent =  charNode.getAttribute(kVarN) ;
            if (kVarContent)
            {
                if (  unicode_data.unihan_variants_raw [cp] === undefined )
                    unicode_data.unihan_variants_raw [cp] = {};
                
                unicode_data.unihan_variants_raw [cp] [kVarN] = kVarContent;
                
                //                     if ( /[^U\+A-F0-9]/ . test(kVarContent) )
                //                     if (kVarN == "kSimplifiedVariant" || kVarN ==  "kTraditionalVariant")
                //                     if (kVarN == "kCompatibilityVariant")
                //                         console.log(cp, blk, kVarN, kVarContent);
            }
        }
        if ( blk.includes("CJK_Compat") && UIdeo == "Y" )
            unicode_data.charsAreUnif.push( cm.utf16hex2char(cp) );
        
        if (charNode.getAttribute("kHKGlyph"))
        {
            const num = parseInt(charNode.getAttribute("kHKGlyph"));
            const c =  cm.utf16hex2char(cp) ;
            
            if ( ! edu_data.HK_numed [ num ] )
                edu_data.HK_numed [ num ] = [ c ];
            else
                edu_data.HK_numed [ num ] .push (c) ;
            
            edu_data.HK.push(c);
        }
        
        if (charNode.getAttribute("kTGH"))
        {
            const kTGH = charNode.getAttribute("kTGH");
            var ind = parseInt ( kTGH.split(":")[1] );
            if (1 <= ind && ind <= 3500)
                edu_data.CN_1c .push( cm.utf16hex2char(cp) );
            else if ( 3501 <= ind && ind <= 6500)
                edu_data.CN_2c .push( cm.utf16hex2char(cp) );
            else if (6501 <= ind && ind <= 8105)
                edu_data.CN_3c .push( cm.utf16hex2char(cp) );
        }
        
        const gc = charNode.getAttribute("gc");
        const cp_int = Number ( "0x" + cp );
        if ( gcs_Cc . includes(gc) )
        {
            unicode_data.Cc . push(cp_int);
        }
        if ( gc == "Mn" )
        {
            unicode_data.Mn . push(cp_int);
        }
    }
    

    
    fs.writeFileSync("unicode-data-Cc.json",JSON.stringify( unicode_data.Cc) .replaceAll(",", ",\n") );    
    fs.writeFileSync("unicode-data-Mn.json",JSON.stringify( unicode_data.Mn) .replaceAll(",", ",\n") );    
    
//     fs.writeFileSync("unicode-data-as-edu-data-HKnumed.json",  JSON.stringify(edu_data.HK_numed) 
//         .replaceAll("],", "],\n")
//     );    

    for ( i in edu_data.HK_numed )
    {
        const arr = edu_data.HK_numed [i];
        if ( arr.length > 1 ) 
        {
            cm.relTheseChars(edu_data.HK_map, arr);
        }
    }
    edu_data.HK_map = cm.sortMapObj(edu_data.HK_map);
    fs.writeFileSync("unicode-data-as-edu-data-HK-rel.json" , JSON.stringify(edu_data.HK_map) .replaceAll("},", "},\n") );
    fs.writeFileSync("unicode-data-as-edu-data-HK.json" ,  JSON.stringify(edu_data.HK) .replaceAll(",", ",\n") );
    
    fs.writeFileSync("unicode-data-as-edu-data-CN-1c.json" ,  JSON.stringify(edu_data.CN_1c) .replaceAll(",", ",\n") );
    fs.writeFileSync("unicode-data-as-edu-data-CN-2c.json" ,  JSON.stringify(edu_data.CN_2c) .replaceAll(",", ",\n") );
    fs.writeFileSync("unicode-data-as-edu-data-CN-3c.json" ,  JSON.stringify(edu_data.CN_3c) .replaceAll(",", ",\n") );
   
    var previous_age = undefined;
    var previous_cp = 0 ;
    var current_age_start_pos = undefined;
    function pushAgeRange(start, end, age)
    {
//         start = start.toString(16).toUpperCase();
//         if (start.length %2 == 1)
//             start = "0" + start;
//         
//         end = end.toString(16).toUpperCase();
//         if (end.length %2 == 1)
//             end = "0" + end;

        unicode_data.ages.push({
            start: start,
            end: end,
            age: age, 
        });
    }
    for (var i = 0; i<charNodes.length; i++)
    {
        const charNode = charNodes[i];
        
        var  cp =  charNode.getAttribute("cp");
        const first_cp =  charNode.getAttribute("first-cp");
        const last_cp =  charNode.getAttribute("last-cp");
        const age =  charNode.getAttribute("age");
        
        if (i == charNodes.length - 1) // 如果已是最后一个<char>
        {
            // 如果原本处在记录中的状态，将上一个range推进数组
            if (current_age_start_pos >= 0 && previous_age !== undefined)
                pushAgeRange(current_age_start_pos, previous_cp, previous_age);
            
            break;
        }
        
        if ( !cp || first_cp || last_cp ) // 本次不是有效的<char>
            continue;
        
        cp = Number("0x" + cp);
        
        // 判断与previous记录的cp是否为差1关系
        if (  previous_cp + 1 ===  cp ) // 是位置+1关系
        {
            if (age === previous_age) //位置连续，且age未变
            {
                if (current_age_start_pos < 0) 
                    current_age_start_pos = cp;
            }
            else // 位置连续，但age变了
            {
                // 如果原本处在记录中的状态，将上一个range推进数组
                if (current_age_start_pos >= 0 && previous_age !== undefined)
                    pushAgeRange(current_age_start_pos, previous_cp, previous_age); 
                
                // 新range开始记录
                current_age_start_pos = cp;
            }
        }
        else // 非+1关系，是有跳过
        {
            // 如果原本处在记录中的状态，将上一个range推进数组
            if (current_age_start_pos >= 0 && previous_age !== undefined)
                pushAgeRange(current_age_start_pos, previous_cp, previous_age); 
            
            // 新range开始记录
            current_age_start_pos = cp;
        }

        
        // 本次循环已处理过，将previous设为当前，供下一次循环用
        previous_age = age;
        previous_cp = cp;
    }
    unicode_data.ages.sort(function(a1, a2) {
        if ( isAgeObjPrio(a1) && !isAgeObjPrio(a2) )
            return -1;
        else
            return 0;
        function isAgeObjPrio(ageObj) {
            const age_start = ageObj.start;
            const age_end = ageObj.end;
            return isCpRangePrio (  age_start, age_end );
        }
        function isCpRangePrio(range_start, range_end) {
            for (prioBlkName of blks_prio)
            {
                const prioBlk_start = unicode_data.blocks_dict[prioBlkName] [0];
                const prioBlk_end = unicode_data.blocks_dict[prioBlkName] [1];
                if ( hasNumRangeOverlap ( prioBlk_start, prioBlk_end, range_start, range_end ) )
                    return true;
            }
        }
        function hasNumRangeOverlap(Amin, Amax, Bmin, Bmax) {
            if ( Bmax < Amin || Bmin > Amax )
                return false;
            else
                return true;
        }
    });
    fs.writeFileSync("unicode-data-ages.json", JSON.stringify( unicode_data.ages) .replaceAll("},", "},\n") );    
    

    
    // 所有k___Variants转json
    for ( objI in unicode_data.unihan_variants_raw) 
    {
        const left = cm.utf16hex2char(objI);
        
        const objVal = unicode_data.unihan_variants_raw [objI];
        for ( kVarN in objVal )
        {
            
            const right = objVal [kVarN];
            
            var right_arr_orig = right.split(' ');
            var right_arr = [];
            for (s of right_arr_orig) 
            {
                right_arr.push( cm.utf16hex2char(s) );
            }
            
            unicode_data.unihan_variants [left] = {};
            unicode_data.unihan_variants [left] [kVarN] = right_arr;
        }
    }
    fs.writeFileSync("unicode-data-unihan-all-vars.json", JSON.stringify( unicode_data.unihan_variants)
        .replaceAll("},", "},\n")
        .replaceAll("],", "],\n")
    );
    
    // 繁简互换数据转json
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["kSimplifiedVariant"] )
        {
            unicode_data.TS [c] = unicode_data.unihan_variants [c] ["kSimplifiedVariant"].sort();
        }
        if ( unicode_data.unihan_variants [c] ["kTraditionalVariant"] )
        {
            unicode_data.ST [c] = unicode_data.unihan_variants [c] ["kTraditionalVariant"].sort();
        }

    }
//     fs.writeFileSync("unicode-data-ST.js" , ( "unicode_data.ST = \n" + JSON.stringify(unicode_data.ST) + "\n;" )
//         .replaceAll("{", "{\n") 
//         .replaceAll("}", "\n}")
//         .replaceAll("],", "],\n")
//     );
//     fs.writeFileSync("unicode-data-TS.js" , ( "unicode_data.TS = \n" + JSON.stringify(unicode_data.TS) + "\n;" )
//         .replaceAll("{", "{\n") 
//         .replaceAll("}", "\n}")
//         .replaceAll("],", "],\n")
//     );
    
    
    // 生成一个繁简map。
    cm.mapTnS(unicode_data.map, unicode_data.ST, "ST");
    cm.mapTnS(unicode_data.map, unicode_data.TS, "TS");
    unicode_data.map = cm.sortMapObj(unicode_data.map);
//     fs.writeFileSync("unicode-data-map.js" , ( "unicode_data.map = \n" + JSON.stringify(unicode_data.map) + "\n;" )
//         .replaceAll("},", "},\n")
//     );
    
    
    
    // 把一些其他k___variant加进新map
    unicode_data.map2 = JSON.parse(JSON.stringify( unicode_data.map )) ;
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["kZVariant"] )
        {
            var oldRels1 = cm.getAllRel( unicode_data.map2, c );
            var oldRels2 = cm.getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["kZVariant"] );
            var oldRels = [ ... cm.unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
            
            var newRels = oldRels;
            newRels.push(c);
            for ( cN of newRels )
            {
                cm.createKey( cN,  unicode_data.map2);
                cm.updateCharRel(unicode_data.map2, cN , newRels);
            }
        }
    }
    
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["kCompatibilityVariant"] )
        {
            var oldRels1 = cm.getAllRel( unicode_data.map2, c );
            var oldRels2 = cm.getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["kCompatibilityVariant"] );
            var oldRels = [ ... cm.unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
             
            cm.createKey( c,  unicode_data.map2);
            unicode_data.map2[c] ['isComp'] = true;
            cm.updateCharRel(unicode_data.map2, c , oldRels);
        }
    }
    
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["EqUIdeo"] )
        {
            var oldRels1 = cm.getAllRel( unicode_data.map2, c );
            var oldRels2 = cm.getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["EqUIdeo"] );
            var oldRels = [ ... cm.unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
             
            cm.createKey( c,  unicode_data.map2);
            unicode_data.map2[c] ['isRad'] = true;
            cm.updateCharRel(unicode_data.map2, c , oldRels);
        }
        
    }
    for ( c of unicode_data.charsAreUnif )
    {
        cm.createKey(c, unicode_data.map2);
        unicode_data.map2[c] ['isUnif'] = true;
        
    }
    

    
    unicode_data.map2 = cm.sortMapObj(unicode_data.map2);
    fs.writeFileSync("unicode-data-map2.json" ,  JSON.stringify(unicode_data.map2) .replaceAll("},", "},\n") );
    
}
start();







