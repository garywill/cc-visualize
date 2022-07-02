const unusual_cond = {
    
    "blk_is_cjkext": {
        full_desc: "属于汉字扩展区（一般不是很常见的字）",
        short_desc: "扩",
        default_checked: true,
        skipBelow: false,
    },
    "is_simp": {
        full_desc: "是中文简体字",
        short_desc: "简",
        default_checked: false,
    },
    "is_trad": {
        full_desc: "是繁体字",
        short_desc: "繁",
        default_checked: false,
    },
    "is_simp_n_trad": {
        full_desc: "是繁简合字（即，同时作为繁体和简体出现过）",
        short_desc: "合",
        default_checked: false,
    },
//     "rel_multi": {
//         full_desc: "繁简关系有多个对应字的字",
//         short_desc: "多",
//         default_checked: false,
//     },
    "is_jp": {
        full_desc: "是仅日文使用的简化字",
        short_desc: "日",
        default_checked: true,
    },
    
    
    "is_rad": {
        full_desc: "属于笔划偏旁部首区汉字符 或 此笔划偏旁部首字符有对应的完整统一汉字符",
        short_desc: "划",
        default_checked: true,
    },
    "is_comp": {
        full_desc: "兼容汉字符，应用对应的统一汉字符替代",
        short_desc: "兼",
        default_checked: true,
    },
    
    

    
    

    
//     "irg_no_gsource": {
//         full_desc: "中国大陆/马来西亚研究组未提供字源的字",
//         short_desc: "外",
//         default_checked: true,
//     },
//     "irg_onlyone": {
//         full_desc: "仅一个地区或国家的研究组提供了字源的字",
//         short_desc: "独",
//         default_checked: true,
//     },


    "blk_others": {
        full_desc: "属于中文文献一般不会用到的区块",
        short_desc: "其",
        default_checked: true,
    },
    "blk_nobelong": {
        full_desc: "不属于任何合法区块",
        short_desc: "非",
        default_checked: true,
    },
    
};

onDCL(function() {
    const form = $$("#form_unusual_cond");
    
    for (name of Object.keys(unusual_cond))
    {
//         console.log(name);
        const condObj = unusual_cond[name];
//         console.log(condObj);
        
        if ( ! condObj.func )
            continue;
        
        var checkbox_span = htmlStr2dom(`
        <div>
            <input type="checkbox" class="unusual_cond_checkbox" name="${name}" >${escapeHtml(condObj['full_desc'])}</input>
        </div>
        `);
        checkbox_span.q$("input").checked = condObj.default_checked;
        form.appendChild(checkbox_span);
    }
});
function readUserCond() 
{
    const checkboxes = Array.from( $$$("#form_unusual_cond .unusual_cond_checkbox") );
    for (cb of checkboxes)
    {
        const name = cb.getAttribute("name");
        unusual_cond [name] . isCurrentlyEnabled = cb.checked;
    }
}


function getCharUnusuals(c, cInfo) 
{
    if ( !cInfo)
        cInfo = getCInfo(c);
    
    var result = {};
    
    var blk = cInfo.blk;
    
    if ( blk == "Basic Latin" )
        return result;
    
    const mapObj = summary_data.map2[c];
    
    for (name of Object.keys(unusual_cond))
    {
        const condObj = unusual_cond[name];
        
        if ( condObj['func'] )
        {
            var oneResult = condObj.func(c, mapObj, cInfo) ;
            if (oneResult)
            {
                result[ name ] =  oneResult;
                if ( condObj.skipBelow !== false )
                    return result;
            }

        }
    }

    
    return result;
}
function getIfShowCode(c, cInfo)
{
    const blks = [
        "General Punctuation",
        "Halfwidth and Fullwidth Forms",
        "Latin-1 Supplement",
        "Private Use Area",
        "Supplementary Private Use Area-A",
        "Supplementary Private Use Area-B",
    ];
    if ( blks.includes(cInfo.blk) )
        return true;
}

unusual_cond['is_jp'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isVari_JP'] 
        && !mapObj ['isChi'] 
        && !mapObj ['isEdu_CN_1c']
        && !mapObj ['isEdu_CN_2c']
        && !mapObj ['isEdu_CN_3c']
        && !mapObj ['isEdu_HK']
        && !mapObj ['isEdu_TW_1']
        && !mapObj ['isEdu_TW_2']
        && !mapObj ['isSimp']
        && !mapObj ['isTrad']
        && !mapObj ['isVari_TW']
        && !mapObj ['isVari_HK']
    );
};
unusual_cond['is_simp'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isSimp']
        && !mapObj ['isTrad']
    );
};
unusual_cond['is_trad'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isTrad']
        && !mapObj ['isSimp']
    );
};
unusual_cond['is_simp_n_trad'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isSimp']
        && mapObj ['isTrad']
    );
};



unusual_cond['is_comp'].func = function(c, mapObj, cInfo) { 
//     const blks = [
//         "CJK Compatibility Ideographs Supplement",
//         "CJK Compatibility",
//         "CJK Compatibility Forms",
//         "CJK Compatibility Ideographs",
//     ];
    var blk = cInfo.blk;
    
//     if ( blks.includes(blk) )
    if ( mapObj !== undefined  && mapObj ['isComp']  )
        return true;
        
    if ( blk && blk.includes("CJK Compatibility") )
    {
        if ( mapObj !== undefined  && mapObj['isUnif'] )
            return false;
            
        return true;
        
    }
};

unusual_cond['is_rad'].func = function(c, mapObj, cInfo) {
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
unusual_cond['blk_is_cjkext'].func = function(c, mapObj, cInfo) {
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
    
//     if ( blks.includes(blk) )
    if ( ! blk )
        return false;
    if (blk.includes("CJK Unified Ideographs Extension"))
        return true;
};

unusual_cond['blk_nobelong'].func = function(c, mapObj, cInfo) {
    var blk = cInfo.blk;
    
    const blks = [
        "High Surrogates",
        "High Private Use Surrogates",
        "Low Surrogates",
    ];
    
    if ( ! blk || blks.includes(blk) )
        return true;
};



unusual_cond['blk_others'].func = function(c, mapObj, cInfo) {
    const blks = [
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
//         "Latin-1 Supplement",
        "Basic Latin",
        "Enclosed Alphanumerics",
        
    ];
    
    var blk = cInfo.blk;
    
    if ( ! blk )
        return false;
    if ( ! blks.includes(blk) )
        return true;
};
