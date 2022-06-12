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
    unihan_variants: {},
};

async function start() 
{   
    var ucd_data_raw_string =  fs.readFileSync('ucd.repertoire.xml',  'utf8');
    
    const domparser = new DOMParser();
    var xmlDoc = domparser.parseFromString(ucd_data_raw_string, "text/xml");
    
    var repertoireNode = xmlDoc.getElementsByTagName("repertoire")[0];
    
    var charNodes = repertoireNode.getElementsByTagName("char");
    for (charNode of Array.from(charNodes) )
    {
        const blk = charNode.getAttribute("blk");
        const cp =  charNode.getAttribute("cp");
        // grep -E "^ blk=" ucd.repertoire.xml |uniq|sort
        if (  blk.includes("CJK") ||  blk.includes("Kangxi") )
        {
            for (kVarN of kVarNames) 
            {
                if ( charNode.getAttribute(kVarN) )
                {
                    if (  unicode_data.unihan_variants [cp] === undefined )
                         unicode_data.unihan_variants [cp] = {};
                    unicode_data.unihan_variants [cp] [kVarN] = charNode.getAttribute(kVarN);
                }
            }
        }
    }
    console.log(unicode_data.unihan_variants);
    

}
start();

// function createKey
