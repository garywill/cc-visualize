var isOptim = isWeb ? true : false;  // 开启优化 或 完整判断 。 如果更改，需要启动本工具时就改
function optimOff() {
    isOptim = false;
    console.warn("已切换至完整检查模式");
    reset();
}
function optimOn() {
    isOptim = true;
    console.warn("已切换至优化（非完整）检查模式");
    reset();
}



var mapInUse = summary_data.map2;

var UnCond = {  // 优化模式时，默认（无skipBelowAll: false时）为，匹配中一个后，不再检查后面的
    
    "cjk_notedu_or_isext": {
        full_desc: "不是常见字（此字不在中华地区教育表中 或 属于扩展区）",
        short_desc: "少",
        default_checked: true,
        skipBelowAll: false,
    },
    "is_simp": {
        full_desc: "是简体字",
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
        full_desc: "是日本新字形（即，仅日文使用的简化字）",
        short_desc: "日",
        default_checked: true,
    },
    
    
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
    //  做完上面，如果优化模式，且map中有，可跳过下面全部
    "blk_others": {
        full_desc: "不属于中文文献（及编程）常用到的区块",
        short_desc: "其",
        default_checked: true,
    },
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
    var userCond = [];
    if (isWeb)
    {
        const checkboxes = Array.from( $$$("#form_UnCond .cb_UnCond") );
        for (cb of checkboxes)
        {
            const name = cb.getAttribute("name");
            if (cb.checked)
            userCond.push( name );
        }
    }
    else if (isNode)
    {
        for (name in UnCond)
        {
            userCond.push( name );
        }
    }
    return userCond;
}


function getCharUnusuals(c, cInfo) 
{
    if ( !cInfo)
        cInfo = getCInfo(c);
    
//     var result = {};
    
    var blk = cInfo.blk;
    
    if ( blk == "Basic Latin" )
        return ;
    
    const mapObj = mapInUse[c];
    
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
                if ( condObj.skipBelowAll !== false && isOptim)
                    break;
            }

        }
        if ( name == "is_comp" && isOptim && mapObj) // NOTE 注意name可能要随条件或条件顺序变化改变
            break;
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
//     if (isOptim && mapObj)
//         return false;
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
//     if ( isOptim && mapObj)
//         return false;
    
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
        
    ];
    
    var blk = cInfo.blk;
    
    if ( ! blk )
        return false;
    if ( ! blks.includes(blk) )
        return true;
};
