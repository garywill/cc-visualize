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
    unihan_variants_raw: {}, // 所有（原始）unihan的k____Variants原始数据转成json
    unihan_variants: {},  // 所有（原始）unihan的k____Variants原始数据转成json，然后hex变中文字符，且k____Variants内容为数组
    map: {}, //繁简双向JSON
    ST: {}, // 简->繁JSON
    TS: {}, // 繁->简JSON
};

async function start() 
{   
    
    var ucd_nore_data_raw_string  =  fs.readFileSync('ucd.no-repertoire.xml',  'utf8');
    
    fs.writeFileSync("unicode-data-ucd.no-repertoire.xml.js", "unicode_data.xml_nore = `\n" + ucd_nore_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
    var ucd_data_raw_string =  fs.readFileSync('ucd.repertoire.xml',  'utf8');
    
    fs.writeFileSync("unicode-data-ucd.repertoire.xml.js", "unicode_data.xml_re = `\n" + ucd_data_raw_string.replaceAll("`", "\\`") + "\n`;" );
    
    const domparser = new DOMParser();
    var xmlDoc = domparser.parseFromString(ucd_data_raw_string, "text/xml");
    
    var repertoireNode = xmlDoc.getElementsByTagName("repertoire")[0];
    
    var charNodes = repertoireNode.getElementsByTagName("char");
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
    fs.writeFileSync("unicode-data-unihan-all-vars.js", "unicode_data.unihan_variants =\n" + JSON.stringify( unicode_data.unihan_variants, null, 2) + "\n;" );
    
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
}
start();

function utf16hex2char(hexStr) // 输入可以是 3F2F U+3AB2 1A7323<xxxx
{
    hexStr = hexStr.replaceAll("U+", "");
    hexStr = hexStr.split("<")[0];
//     console.log(hexStr);
    return String.fromCodePoint( parseInt(hexStr, 16) );
}
