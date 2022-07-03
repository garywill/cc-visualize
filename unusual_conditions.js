const UnCond = {  // 默认（无skipBelowAll: false时）为，匹配中一个后，不再检查后面的
    
    "cjk_notedu_or_isext": {
        full_desc: "不是常见字（此字不在中华地区教育表中 或 属于扩展区）",
        short_desc: "少",
        default_checked: true,
        skipBelowAll: false,
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
        full_desc: "兼容汉字符（应当用对应的统一汉字符替代）",
        short_desc: "兼",
        default_checked: true,
    },
    
    "blk_others": {
        full_desc: "属于中文文献一般不会用到的区块",
        short_desc: "其",
        default_checked: true,
    },
    "blk_pua": {
        full_desc: "属于私用区块（正式收录前暂用的私码字）",
        short_desc: "私",
        default_checked: true, 
    },
    "char_illegal": {
        full_desc: "不属于任何合法区块，或保留字符",
        short_desc: "非",
        default_checked: true,
    },
    
};

if (isWeb)
onDCL(function() {
    const form = $$("#form_UnCond");
    
    for (name of Object.keys(UnCond))
    {
        const condObj = UnCond[name];
        
        if ( ! condObj.func )
            continue;
        
        var span_cb = htmlStr2dom(`
        <li title="${escapeHtml(name)}">
            <input type="checkbox" class="cb_UnCond" name="${name}"  >${escapeHtml(condObj['full_desc'])}</input>
        </li>
        `);
        span_cb.q$("input").checked = condObj.default_checked;
       
        form.appendChild(span_cb);
    }
});
function readUserCond() 
{
    const checkboxes = Array.from( $$$("#form_UnCond .cb_UnCond") );
    for (cb of checkboxes)
    {
        const name = cb.getAttribute("name");
        UnCond [name] . isCurrentlyUserChecked = cb.checked;
    }
}


function getCharUnusuals(c, cInfo) 
{
    if ( !cInfo)
        cInfo = getCInfo(c);
    
//     var result = {};
    
    var blk = cInfo.blk;
    
    if ( blk == "Basic Latin" )
        return ;
    
    const mapObj = summary_data.map2[c];
    
    for (name of Object.keys(UnCond))
    {
        const condObj = UnCond[name];
        
        if ( condObj['func'] )
        {
            var oneResult = condObj.func(c, mapObj, cInfo) ;
            if (oneResult)
            {
//                 result[ name ] =  oneResult;
                cInfo.unusuals [name] = oneResult;
                if ( condObj.skipBelowAll !== false )
                    break;
            }

        }
    }

    
//     return result;
}
function getIfShowCode(c, cInfo) // webui only
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
UnCond['is_simp'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isSimp']
        && !mapObj ['isTrad']
    );
};
UnCond['is_trad'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isTrad']
        && !mapObj ['isSimp']
    );
};
UnCond['is_simp_n_trad'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isSimp']
        && mapObj ['isTrad']
    );
};



UnCond['is_comp'].func = function(c, mapObj, cInfo) { 
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
UnCond['cjk_notedu_or_isext'].func = function(c, mapObj, cInfo) {
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
    if (blk && blk.includes("CJK Unified Ideographs Extension"))
        return true;
    
    if (     ( blk && blk.includes("CJK Unified Ideographs") ) 
          || ( mapObj !== undefined && mapObj ['isUnif'] )
    )
    {
        if ( !mapObj || !mapObj['isEdu'] )
            return true;
    }
};

UnCond['char_illegal'].func = function(c, mapObj, cInfo) {
    var blk = cInfo.blk;
    var age = cInfo.age;
    const blks = [
        "High Surrogates",
        "High Private Use Surrogates",
        "Low Surrogates",
    ];
    
    if ( ! blk || blks.includes(blk) )
        return true;
    
    if ( !age && !cInfo.unusuals['blk_pua'] )
        return true;
};

UnCond['blk_pua'].func = function(c, mapObj, cInfo) {
    var blk = cInfo.blk;
    
    const blks = [
        "Private Use Area",
        "Supplementary Private Use Area-A",
        "Supplementary Private Use Area-B",
    ];
    
    if ( blks.includes(blk) )
        return true;
};

UnCond['blk_others'].func = function(c, mapObj, cInfo) {
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
        
        "Private Use Area",
        "Supplementary Private Use Area-A",
        "Supplementary Private Use Area-B",
        
    ];
    
    var blk = cInfo.blk;
    
    if ( ! blk )
        return false;
    if ( ! blks.includes(blk) )
        return true;
};
