
/* vccrlib v0.2.0 (Visualize Chinese Charactors and Their Relations Library) is a JavaScript library for nodejs and web. */ 

let isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
let isWeb = typeof window !== 'undefined' && typeof window.document !== 'undefined' ;
// let opencc = {};

let unicode_data;
let summary_data;
let mapInUse;

async function fetchTxtContent(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

async function getFileData(fileurl) {
    if (isWeb) {
        var r = await fetchTxtContent(fileurl);
        return JSON.parse(r);
    }
    if (isNode) {
        return require(fileurl);
    }
}

(async function() {
    unicode_data = {
        blocks: await getFileData("./data/unicode-data/unicode-data-blocks.json"), 
        ages: await getFileData("./data/unicode-data/unicode-data-ages.json"), 
        Cc: await getFileData("./data/unicode-data/unicode-data-Cc.json"), 
        Mn: await getFileData("./data/unicode-data/unicode-data-Mn.json"), 
    };

    summary_data = {
        map2: await getFileData("./data/summary-data/summary-data-map2.json"), 
    };
    
    mapInUse = summary_data.map2;
    
    if (isWeb) {
        var event = new CustomEvent('data-init-finished', { detail: { message: '数据初始化已完成!' } });
        window.dispatchEvent(event);
        
    }
}) () ;

function getCpBlock(cp) //eg cp="4e00" // 输入可以是数字或字符串。字符串被认为是十六进制
{
    var cp_int ; 
    if ( typeof(cp) === "string" )
    { 
        cp_int =  Number("0x" + cp);
    } 
    else
    {
        cp_int = cp;
    }
    for ( b of unicode_data.blocks)
    {
        var start =  b["first_cp"] ;
        var end =  b["last_cp"] ;
        
        if ( start <= cp_int && cp_int <= end)
        {
            return b["name"];
        }
        
    }
    return null;
}

function getCpAge(cp) //eg cp="4e00" // 输入可以是数字或字符串。字符串被认为是十六进制
{
    var cp_int ; 
    if ( typeof(cp) === "string" )
    { 
        cp_int =  Number("0x" + cp);
    } 
    else
    {
        cp_int = cp;
    }
    for ( b of unicode_data.ages)
    {
        var start =  b["start"] ;
        var end =  b["end"] ;
        
        if ( start <= cp_int && cp_int <= end)
        {
            return b["age"];
        }
        
    }
    return null;
}











let UnCond = {  
    "is_rad": {
        full_desc: "属于笔划偏旁部首区（若作为句中完整的字，应该用对应的统一字符）",
        short_desc: "划",
        default_checked: true,
    },
    "is_comp": {
        full_desc: "是兼容汉字符（可以时应当用对应的同形统一汉字符替代）",
        short_desc: "兼",
        default_checked: true,
    },
    "is_jp": {
        full_desc: "是日本新字体（即，仅日文使用的简化字）",
        short_desc: "日",
        default_checked: true,
    },
    "is_simp": {
        full_desc: "是简体字 （不保证百分百准确）",
        short_desc: "简",
        default_checked: false,
    },
    "is_trad": {
        full_desc: "是繁体字",
        short_desc: "繁",
        default_checked: false,
    },
    "is_simp_n_trad": {
        full_desc: "是繁简合字",
        short_desc: "合",
        default_checked: false,
    },
    "cjk_is_rare": {
        full_desc: "可能只在汉字库较全或新的设备才显示的汉字",
        short_desc: "少",
        default_checked: true,
    },
    // 上面以CJK Ideo为标志，其余启用下面 
    "is_Cc": {
        full_desc: "是控制字符（包括不常用空白、零宽、排版控制等）", 
        short_desc: "控", 
        default_checked: true, 
    }, 
    "is_Mn" : { 
        full_desc: "是组合字符（无宽度无间距，用于给前一字符加声调等）", 
        short_desc: "饰", 
        default_checked: true, 
    }, 
    "is_other_chars": {
        full_desc: "不属于中文文献（及编程）正常常用到的字符或区块",
        short_desc: "其",
        default_checked: false,
    },
    "noncjk_is_rare": {
        full_desc: "可能只在较新的设备才显示的非汉字字符",
        short_desc: "新",
        default_checked: true,
    },    
    // -------------------- 
    //  这是CJK Ideo与否都用。放在最先
    "blk_pua": {
        full_desc: "属于私用码段（正式收录前暂用码，已收录后应弃用）",
        short_desc: "私",
        default_checked: true, 
    },    
    "char_illegal": {
        full_desc: "不属于任何合法区块 或 是保留码位",
        short_desc: "非",
        default_checked: true,
    },
};





function getCharUnusuals(c, cInfo) 
{
    if ( !cInfo)
        cInfo = getCInfo(c);
    
//     var result = {};
    
    const dec = cInfo.dec;
    const blk = cInfo.blk;
    const age = cInfo.age;
    const unObj = cInfo.unusuals;
    
    const mapObj = mapInUse[c];
    
    if ( ! blk || surrBlks.includes(blk) )
        unObj ['char_illegal'] = true;
    else if ( privBlks.includes(blk) )
        unObj ['blk_pua'] = true;
    else if ( !age )
        unObj ['char_illegal'] = true;
    else
    {
        // 是汉字（CJK 表意文字） （ 未包括笔划）
        if ( blk.includes("CJK") && blk.includes("Ideographs") )
        {
            // 简 繁 合  日
            if (mapObj !== undefined)
            {
                if (mapObj ['isSimp'] && mapObj ['isTrad'])
                    unObj ['is_simp_n_trad'] = true;
                else if (mapObj ['isSimp'] )
                    unObj ['is_simp'] = true;
                else if (mapObj ['isTrad'] )
                    unObj ['is_trad'] = true;
                else if ( UnCond['is_jp'].func (c, mapObj, cInfo) )
                    unObj ['is_jp'] = true;
            }
            
            // 兼
            if ( UnCond['is_comp'].func (c, mapObj, cInfo) )
                unObj ['is_comp'] = true;
                
            // 汉字 少
            if ( UnCond['cjk_is_rare'].func (c, mapObj, cInfo) )
                unObj ['cjk_is_rare'] = true;
        }
        else if ( UnCond['is_rad'].func (c, mapObj, cInfo) ) // 笔划
        {
            unObj ['is_rad'] = true;
            
            // 汉字 少
            if ( UnCond['cjk_is_rare'].func (c, mapObj, cInfo) )
                unObj ['cjk_is_rare'] = true;
        }
        else // 非汉字 （CJK 表意文字）， 也非笔划
        {
            if (unicode_data.Cc . includes (dec) )
                unObj ['is_Cc'] = true;
            else if (unicode_data.Mn . includes (dec) )
                unObj ['is_Mn'] = true;
            else
            {
                if (UnCond['is_other_chars'].func (c, mapObj, cInfo))
                    unObj ['is_other_chars'] = true;;
                
                if (parseFloat(age) > 8.0 )
                    unObj ['noncjk_is_rare'] = true;
            }
        }
    }

//     return result;
}
function getIfShowCode(c, cInfo)  
{
    const blks = [
        "General Punctuation",
        "Halfwidth and Fullwidth Forms",
    ];
    const conds = [
        "noncjk_is_rare",
        "blk_pua",
        "is_Cc",
        "is_Mn",
        "char_illegal"
    ];
    if ( blks.includes(cInfo.blk) )
        return true;
    
    for (name of Object.keys ( (cInfo.unusuals ) ) )
    {
        if ( conds.includes (name) )
            return true;
    }   
    if (!cInfo.age || !cInfo.blk)
        return true;
}

UnCond['is_jp'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isVari_JP'] 
        && !mapObj ['isEdu']
        && !mapObj ['isSimp']
        && !mapObj ['isTrad']
        && !mapObj ['isChi'] 
        && !mapObj ['isVari_TW']
        && !mapObj ['isVari_HK']
    );
};



UnCond['is_comp'].func = function(c, mapObj, cInfo) { 
//     const blks = [
//         "CJK Compatibility", // 日文、汉字日期合并 等 
//         "CJK Compatibility Forms",  // 竖排用之类的一些标点
//         "CJK Compatibility Ideographs", // 汉字
//         "CJK Compatibility Ideographs Supplement", // 汉字
//     ];
    var blk = cInfo.blk;
    
//     if ( blks.includes(blk) )
    if ( mapObj !== undefined  && mapObj ['isComp']  )
        return true;
        
    if ( blk && blk.includes("CJK Compatibility Ideographs") )
    {
        if ( mapObj !== undefined  && mapObj['isUnif'] )
            return false;
            
        return true;
        
    }
};

UnCond['is_rad'].func = function(c, mapObj, cInfo) {
    const blks = [
        "CJK Radicals Supplement",
        "Kangxi Radicals",
        "CJK Strokes",
    ];
    var blk = cInfo.blk;
    if ( blks.includes(blk) 
        ||
        ( mapObj !== undefined 
            && mapObj ['isRad'] 
        )
    )
        return true;
};
UnCond['cjk_is_rare'].func = function(c, mapObj, cInfo) {
//     const blks = [
//         "CJK Unified Ideographs Extension A",
//         "CJK Unified Ideographs Extension B",
//         "CJK Unified Ideographs Extension C",
//         "CJK Unified Ideographs Extension D",
//         "CJK Unified Ideographs Extension E",
//         "CJK Unified Ideographs Extension F",
//         "CJK Unified Ideographs Extension G",
//         "CJK Unified Ideographs Extension H",
//     ];
    var blk = cInfo.blk;
    var age = cInfo.age;
    
//     if ( blks.includes(blk) )
    if (blk.includes("CJK Unified Ideographs Extension") && blk.split(' ')[4] != "A" )
        return true;
    
    if (  parseFloat(age) > 3.0 ) //前提已经排除了非汉。（CJK表意 和 笔划 都可能调用这里
        return true;

};
let surrBlks = [
    "High Surrogates",
    "High Private Use Surrogates",
    "Low Surrogates",
];
let privBlks = [
    "Private Use Area",
    "Supplementary Private Use Area-A",
    "Supplementary Private Use Area-B",
];


UnCond['is_other_chars'].func = function(c, mapObj, cInfo) {
//     if ( isOptim && mapObj)
//         return false;
    
    const blks = [
        "CJK Radicals Supplement",
        "CJK Symbols and Punctuation",
        "CJK Strokes",
        "Enclosed CJK Letters and Months",
//         "CJK Compatibility",
//         "CJK Compatibility Forms",
        "CJK Compatibility Ideographs",
        "CJK Compatibility Ideographs Supplement",
        "CJK Unified Ideographs",
        "CJK Unified Ideographs Extension A",
        "CJK Unified Ideographs Extension B",
        "CJK Unified Ideographs Extension C",
        "CJK Unified Ideographs Extension D",
        "CJK Unified Ideographs Extension E",
        "CJK Unified Ideographs Extension F",
        "CJK Unified Ideographs Extension G",
        "CJK Unified Ideographs Extension H",
        "Kangxi Radicals",
        
        "Halfwidth and Fullwidth Forms",
        "General Punctuation",
//         "Latin-1 Supplement",
        "Basic Latin",
        "Enclosed Alphanumerics",
        
        "Private Use Area",
        "Supplementary Private Use Area-A",
        "Supplementary Private Use Area-B",
        
        "High Surrogates",
        "High Private Use Surrogates",
        "Low Surrogates",
        
    ];
    
    var blk = cInfo.blk;

    if (  we_ve_accepted_symbols.includes(c) )
        return false;
 
    if ( ! blks.includes(blk) )
        return true;
};

let we_ve_accepted_symbols = ['©', '®', '°', '±', '·', '÷', '≠', '℃', '≈'];
 
function print_stati()
{
    console.log(`已检查${Check.essayLineCount}行，共${Check.essayCharsCount}字符。忽略${Check.essayCmtLineCount}行`);
    for ( name of Object.keys(Check.condCharsStati) )
    {
        const condObj = UnCond [name];
        const condStatiObj = Check.condCharsStati [name];
        if ( condStatiObj.condCount > 0)
        console.log(`${condObj.short_desc}\t${condStatiObj.charSet.size}字符 ${condStatiObj.condCount}处\t${condObj.full_desc}`);
    }
    print_one_cond_charset('is_comp');
    print_one_cond_charset('is_rad');
    print_one_cond_charset('blk_pua');
    print_one_cond_charset('is_jp');
    print_one_cond_charset('cjk_is_rare');
}

function print_one_cond_charset(name)
{
      const condObj = UnCond [name];
        const condStatiObj = Check.condCharsStati [name];
        
    if (condStatiObj .condCount == 0)
        return;
        
    var partText = "";
    
    const maxCharAmt = 100;
    if ( condStatiObj.charSet.size > maxCharAmt)
        partText = "(部分)";
    
    console.log(`
${condObj.short_desc}${partText}\t${condStatiObj.charSet.size}字符 ${condStatiObj.condCount}处\t${condObj.full_desc}
'${ [ ... condStatiObj.charSet ] .sort().slice(0,maxCharAmt).join('|') }'`
    );
}

let charsCInfoCache = {}; // 静态，不因userchecks改变

let Check = { // 每次开始check都变
    userCond: [], // 本次用户启用的条件。如果和上次一样，就不需要清除charsCrrtUnusualStatus
    charsCrrtUnusualStatusCache: {}, //本次条件下的每个字符（重复出现只存一次）的 isCrrtUnusual (bool) , warnText (eg. ⚠少⚠日), 
    
    
    
    essayArr: {}, //本次 essay文本+注释条件 下的
    // 每行、每字符转换成一个个object的数组（二维）。
    // 显示时根据其中的char为索引找charsCrrtUnusualStatus
    // 以line_num作下标
    
    essayLineCount: 0, //本次 essay文本+注释条件 下的
    essayCmtLineCount: 0, //本次 essay文本+注释条件 下的
    essayCharsCount: 0, //本次 essay文本+注释条件 下的
    
    linesCrrtStatus: {}, //本次 条件 + essay文本 + 注释条件 下的
    //每一行的非寻常标记  ( 1: "hUnus(有非寻常字符)|cmt(已注释)|norm(正常行)" ) 
    // 以line_num作下标
    
    
    
    condCharsStati: {}, // 本次 essay文本 （不管userCond, 只管所有条件）下，每个条件的字符集+count
    // 如果要统计准确，应该关优化，用完整模式
};
let freshCheckJSON = JSON.stringify(Check);

function reset() {
    charsCInfoCache = {};
    Check = JSON.parse(freshCheckJSON);
}
function startNewCheck(essay)
{
    Check.essayArr = {};
    Check.essayLineCount = 0;
    Check.essayCmtLineCount = 0 ;
    Check.essayCharsCount = 0;
    Check.linesCrrtStatus = {};
    for (name of Object.keys(UnCond))
    {
        Check.condCharsStati [name] = {
            charSet: new Set(),
            condCount: 0, 
        }; 
    } 
    //- -------
    
    var new_userCond = readUserCond();
    if (new_userCond != Check.userCond)
    {
        Check.charsCrrtUnusualStatusCache = {};
    }
    Check.userCond = new_userCond; // 覆盖旧的
    
    genEssayArr(essay); // Check.essayArr
    
    //---------- 
    genCrrtUnusualInfos();
    
}

function genCrrtUnusualInfos()
{
    for (line_num of Object.keys(Check.essayArr) )
    {
        const lineObj = Check.essayArr[line_num];
        Check.linesCrrtStatus [line_num] = "norm";
        for (col_num of Object.keys(lineObj.charsObjs) )
        {
            const charObj = lineObj.charsObjs[col_num];
            const c = charObj.char;
            const cInfo = charObj.cInfo;
            const allCInfoUnNames = Object.keys( cInfo.unusuals ); // cInfo里unusuals已加进去的条件名（若关优化不会完整）
            
            for ( name of allCInfoUnNames) 
            {
                Check.condCharsStati [name] .charSet.add(c);
                Check.condCharsStati [name] .condCount ++;
            } 
            
            if ( ! Check.charsCrrtUnusualStatusCache [c] )
            {
                var isCrrtUnusual = false;
                var warnTextS = [''];
                
                for ( name of allCInfoUnNames) 
                { 
                    if ( Check.userCond.includes(name) )  // 当前用户启用的这个条件
                    {
                        isCrrtUnusual = true;
                        
                        if (isWeb)
                        {
                            var wt;
                            if (name == "cjk_is_rare" && cInfo.blk.includes("CJK Unified Ideographs Extension") )
                                wt = cInfo.blk.split(' ')[4];
                            else
                                wt = UnCond [name] .short_desc;
                            warnTextS .push(wt);
                        } 
                    }
                } 
                Check.charsCrrtUnusualStatusCache [c] = {
                    isCrrtUnusual: isCrrtUnusual,      
                };
                if (isCrrtUnusual)
                    Check.charsCrrtUnusualStatusCache [c] .warnText = warnTextS.join('⚠');
            }
            if ( Check.charsCrrtUnusualStatusCache [c] .isCrrtUnusual )
                Check.linesCrrtStatus [line_num] = "hUnus";
            
        }
    }
} 

var isLineCommented = function (line_string) 
{ return false; }

function genEssayArr(essay) 
{
    essay = essay.replaceAll("\r\n", "\n");
    essay = essay.replaceAll("\r", "\n");
    
    const lines_strs = essay.split("\n");
    for (var iLine = 0; iLine < lines_strs.length; iLine++)
    {
        const line_num = iLine + 1;
        const line_string = lines_strs[iLine];
        if ( isLineCommented(line_string) )
        {
            Check.linesCrrtStatus [line_num] = "cmt";
            Check.essayCmtLineCount ++ ;
            continue;
        }
        
        Check.essayLineCount ++;
        
        var result_lineObj = {
            line_num: line_num,
            line_origString: line_string, 
            charsObjs: {},
        };
        const line_chars = Array.from(line_string);

        for (var iChar = 0; iChar < line_chars.length ; iChar++)
        {
            Check.essayCharsCount ++ ;
            
            const col_num = iChar + 1;
            const originalChar = line_chars[iChar];
            
            var result_charObj = {
                line_num: line_num,
                col_num: col_num,
                char:  originalChar,
                cInfo: getCInfo(originalChar),
            };
            
            
            result_lineObj.charsObjs [col_num] = result_charObj ;
        }
        Check.essayArr [line_num] = result_lineObj;
    }
}


function getCInfo(c)
{
    if ( ! charsCInfoCache [c] )
    {
        var dec; 
        var hex;
        var blk;
        var age;
        
        dec = c.codePointAt(0);
        hex = dec.toString(16).toUpperCase();
        if (hex.length %2 == 1)
            hex = "0" + hex;
        
        blk = getCpBlock(dec);
        age = getCpAge(dec); 
         
        var cInfo = {
            dec: dec, 
            hex: hex,
            blk: blk,
            age: age,
            unusuals: { } ,
        }
        
        charsCInfoCache [c] = cInfo;
        
        if (dec == 0x09) {
            cInfo.showText = "制表符";
        } else if (dec == 0x0A) {
            cInfo.showText = "\\n";
        } else if (dec == 0x0D) {
            cInfo.showText = "\\r";
        } else if (dec == 0x20) {
            cInfo.showText = "空";
        } else if ( 0x20 < dec && dec <= 0x7E ) {
            // nothing
        } else if ( dec == 0x3000 ) {
            cInfo.showText = "全角空"
        } else {
            getCharUnusuals(c, cInfo);
            if (isWeb)
                cInfo.showCode = getIfShowCode(c, cInfo);
            
            if (cInfo.unusuals ['is_Cc'] )
                cInfo.showChar = '▫';
            else if ( cInfo.unusuals ['is_Mn'] )
                cInfo.showChar = '◌';
        }  
        charsCInfoCache [c] = cInfo;
    }
    return charsCInfoCache [c];
}
if (isNode) {
    module.exports = {
        vccrlib: {
            reset, 
            startNewCheck, 
            getCInfo, 
            
        }
    };
}
