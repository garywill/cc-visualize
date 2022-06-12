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
];

var unicode_data = {
    blocks: [],
    unihan_variants_raw: {}, // 所有（原始）unihan的k____Variants原始数据转成json
    unihan_variants: {},  // 所有（原始）unihan的k____Variants原始数据转成json，然后hex变中文字符，且k____Variants内容为数组
    map: {}, //繁简双向JSON
    ST: {}, // 简->繁JSON
    TS: {}, // 繁->简JSON
};

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
    for ( block of Array.from(blockNodes)) {
        unicode_data.blocks.push( {
            name: block.getAttribute("name"),
            first_cp: block.getAttribute("first-cp"),
            last_cp: block.getAttribute("last-cp"),
        });
    }
    fs.writeFileSync("unicode-data-blocks.js",( "unicode_data.blocks =\n" + JSON.stringify( unicode_data.blocks) + "\n;")
        .replaceAll("},", "},\n")
    );
    
    
    var xmlDoc = domparser.parseFromString(ucd_data_raw_string, "text/xml");
    
    var repertoireNode = xmlDoc.getElementsByTagName("repertoire")[0];
    
    var charNodes = repertoireNode.getElementsByTagName("char");
    
    //所有k___Variants的raw内容转json
    for (charNode of Array.from(charNodes) )
    {
        const blk = charNode.getAttribute("blk");
        const cp =  charNode.getAttribute("cp");
        // grep -E "^ blk=" ucd.repertoire.xml |uniq|sort
//         if (  blk.includes("CJK") ||  blk.includes("Kangxi") )
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
    }
//     console.log(unicode_data.unihan_variants_raw);
    fs.writeFileSync("unicode-data-unihan-all-vars-raw.json", JSON.stringify(unicode_data.unihan_variants_raw, null, 2) );
    
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
    
    // TODO 做一个summary表，结合opencc的map2和ucd的map
    
    /* 
     * kCompatibilityVarian
kSemanticVarian
kSimplifiedVarian
kSpecializedSemanticVarian
kSpoofingVarian
kTraditionalVarian
kZVarian
*/
    // kSemanticVariant和kSpecialSemantic为异体字oo
    
    // TODO 添加手动的字
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
