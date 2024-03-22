




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
