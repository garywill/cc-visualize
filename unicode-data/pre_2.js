var fs = require('fs');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom')

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
};

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
    
    fs.writeFileSync("unicode-data-ucd.no-repertoire.xml.js", "unicode_data.xml_nore = `\n" + ucd_nore_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
    // xml re 部分 变js原始string
    var ucd_data_raw_string =  fs.readFileSync('ucd.repertoire.xml',  'utf8');
    
    fs.writeFileSync("unicode-data-ucd.repertoire.xml.js", "unicode_data.xml_re = `\n" + ucd_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
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
    fs.writeFileSync("unicode-data-blocks.js",( "unicode_data.blocks =\n" + JSON.stringify( unicode_data.blocks) + "\n;")
        .replaceAll("},", "},\n")
    );
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
            unicode_data.charsAreUnif.push( utf16hex2char(cp) );
    }

    
//     console.log(unicode_data.unihan_variants_raw);
    fs.writeFileSync("unicode-data-unihan-all-vars-raw.json", JSON.stringify(unicode_data.unihan_variants_raw, null, 2) );
    
    
    
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
    fs.writeFileSync("unicode-data-ages.js",( "unicode_data.ages =\n" + JSON.stringify( unicode_data.ages) + "\n;")
        .replaceAll("},", "},\n")
    );    
    

    
    // 所有k___Variants转json
    for ( objI in unicode_data.unihan_variants_raw) 
    {
        const left = utf16hex2char(objI);
        
        const objVal = unicode_data.unihan_variants_raw [objI];
        for ( kVarN in objVal )
        {
            
            const right = objVal [kVarN];
            
            var right_arr_orig = right.split(' ');
            var right_arr = [];
            for (s of right_arr_orig) 
            {
                right_arr.push( utf16hex2char(s) );
            }
            
            unicode_data.unihan_variants [left] = {};
            unicode_data.unihan_variants [left] [kVarN] = right_arr;
        }
    }
    fs.writeFileSync("unicode-data-unihan-all-vars.js",( "unicode_data.unihan_variants =\n" + JSON.stringify( unicode_data.unihan_variants) + "\n;")
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
    fs.writeFileSync("unicode-data-ST.js" , ( "unicode_data.ST = \n" + JSON.stringify(unicode_data.ST) + "\n;" )
        .replaceAll("{", "{\n") 
        .replaceAll("}", "\n}")
        .replaceAll("],", "],\n")
    );
    fs.writeFileSync("unicode-data-TS.js" , ( "unicode_data.TS = \n" + JSON.stringify(unicode_data.TS) + "\n;" )
        .replaceAll("{", "{\n") 
        .replaceAll("}", "\n}")
        .replaceAll("],", "],\n")
    );
    
    
    // 生成一个繁简map。
    mapTnS(unicode_data.map, unicode_data.ST, "ST");
    mapTnS(unicode_data.map, unicode_data.TS, "TS");
    unicode_data.map = sortMapObj(unicode_data.map);
    fs.writeFileSync("unicode-data-map.js" , ( "unicode_data.map = \n" + JSON.stringify(unicode_data.map) + "\n;" )
        .replaceAll("},", "},\n")
    );
    
    
    
    // 把一些其他k___variant加进新map
    unicode_data.map2 = JSON.parse(JSON.stringify( unicode_data.map )) ;
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["kZVariant"] )
        {
            var oldRels1 = getAllRel( unicode_data.map2, c );
            var oldRels2 = getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["kZVariant"] );
            var oldRels = [ ... unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
            
            var newRels = oldRels;
            newRels.push(c);
            for ( cN of newRels )
            {
                createKey( cN,  unicode_data.map2);
                updateCharRel(unicode_data.map2, cN , newRels);
            }
        }
    }
    
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["kCompatibilityVariant"] )
        {
            var oldRels1 = getAllRel( unicode_data.map2, c );
            var oldRels2 = getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["kCompatibilityVariant"] );
            var oldRels = [ ... unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
             
            createKey( c,  unicode_data.map2);
            unicode_data.map2[c] ['isComp'] = true;
            updateCharRel(unicode_data.map2, c , oldRels);
        }
    }
    
    for ( c in unicode_data.unihan_variants )
    {
        if ( unicode_data.unihan_variants [c] ["EqUIdeo"] )
        {
            var oldRels1 = getAllRel( unicode_data.map2, c );
            var oldRels2 = getAllRel( unicode_data.map2,  unicode_data.unihan_variants [c] ["EqUIdeo"] );
            var oldRels = [ ... unionSet( (new Set(oldRels1)) , (new Set(oldRels2)) ) ] ;
             
            createKey( c,  unicode_data.map2);
            unicode_data.map2[c] ['isRad'] = true;
            updateCharRel(unicode_data.map2, c , oldRels);
        }
        
    }
    for ( c of unicode_data.charsAreUnif )
    {
        createKey(c, unicode_data.map2);
        unicode_data.map2[c] ['isUnif'] = true;
        
    }

    unicode_data.map2 = sortMapObj(unicode_data.map2);
    fs.writeFileSync("unicode-data-map2.js" , ( "unicode_data.map2 = \n" + JSON.stringify(unicode_data.map2) + "\n;" )
        .replaceAll("},", "},\n")
    );
    
}
start();




function utf16hex2char(hexStr) // 输入可以是 3F2F U+3AB2 1A7323<xxxx
{
    hexStr = hexStr.replaceAll("U+", "");
    hexStr = hexStr.split("<")[0];
//     console.log(hexStr);
    return String.fromCodePoint( parseInt(hexStr, 16) );
}


// =====================================
//  ================== map 函数===========

//参数：
//     ToS:         是[繁-简]还是[简-繁]
//仅作用于map表
function mapTnS(mapObj, rawrelObj , ToS)
{
    
    for ( left in rawrelObj ) {
        var right_arr = rawrelObj[left];
        
        
        
        if (ToS == "TS")
            addTSRelation(mapObj, right_arr, left )
            else if (ToS == "ST")
                addTSRelation(mapObj, left, right_arr )
                
    };   
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

//参数可以是字符串（单个字），也可以是数组（一个元素是一个字）
//仅作用于map表
function addTSRelation(mapObj, simpChars, tradChars)
{
    // 单个字的输入转为数组
    if ( typeof(simpChars) === "string")
        simpChars=[simpChars]
        
        if ( typeof(tradChars) === "string")
            tradChars=[tradChars]
            
            var set = new Set();
        
        // 分别设置繁、简标志
        simpChars.forEach( function(simpChar) {
            createKey(simpChar, mapObj);
            mapObj[simpChar]['isSimp'] = true;
            //set.add(simpChar);
            //mapObj[simpChar]['rel'].forEach( function(char) {
            //    set.add(char);
            //});
        });
        
        tradChars.forEach( function(tradChar) {
            createKey(tradChar, mapObj);
            mapObj[tradChar]['isTrad'] = true;
            //set.add(tradChar);
            //mapObj[tradChar]['rel'].forEach( function(char) {
            //    set.add(char);
            //});
        });
        
        var set1 = getAllRel(mapObj, simpChars);
        var set2 = getAllRel(mapObj, tradChars);
        set = unionSet(set1, set2);
        
        // 写入（更新）rel
        for (char of set) 
        {
            updateCharRel(mapObj, char, set)
        }
        
}

//并集
function unionSet(setA, setB) {
    let _union = new Set(setA);
    for (let elem of setB) {
        _union.add(elem);
    }
    return _union;
}

function updateCharRel(mapObj, char, updatedRelSet)
{
    var newSet = new Set(updatedRelSet);
    newSet.delete(char);
    
    //     if ( mapObj[char]['rel'].length)
    //     {
    //         var oldr = mapObj[char]['rel'].sort().toString();
    //         var newr = [...newSet].sort().toString();
    //         if (oldr != newr)
    //             console.log(`${char} 字已设置过关联关系{${oldr}}，现又更新关联成为{${newr}}`);
    //     }
    
    mapObj[char]['rel'] = [...newSet].sort();
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

//=============================================


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
