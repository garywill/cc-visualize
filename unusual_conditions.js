const unusual_cond = {
    "blk_is_rad": {
        full_desc: "属于笔划偏旁部首区汉字符",
        short_desc: "划",
        default_checked: true,
    },
    
    "has_rad_var": {
        full_desc: "此笔划偏旁部首字符有对应的完整统一汉字符",
        short_desc: "划",
        default_checked: true,
    },
    
    
    "blk_is_comp": {
        full_desc: "属于兼容区汉字符",
        short_desc: "兼",
        default_checked: true,
    },
    
    "has_comp_var": {
        full_desc: "此兼容汉字符有所应该用以替代的统一汉字符",
        short_desc: "兼",
        default_checked: true,
    },
    
    "blk_is_cjkext": {
        full_desc: "属于汉字扩展区（一般为少见字）",
        short_desc: "扩",
        default_checked: true,
    },
    
    
    
    "is_jp": {
        full_desc: "是仅日文使用的简化字",
        short_desc: "日",
        default_checked: true,
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
        full_desc: "是繁简合字",
        short_desc: "合",
        default_checked: false,
    },
    "rel_multi": {
        full_desc: "繁简关系有多个对应字的字",
        short_desc: "多",
        default_checked: false,
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

    
//     "is_en": {
//         full_desc: "属于基本西文ASCII字符",
//         short_desc: "西",
//         default_checked: false,
//     },
//     "is_cjk": {
//         full_desc: "属于汉字或汉字标点字符",
//         short_desc: "汉",
//         default_checked: false,
//     },
//     
//     "blk_others": {
//         full_desc: "既不属于基本西文ASCII也非汉字",
//         short_desc: "其",
//         default_checked: true,
//     },
    "blk_nobelong": {
        full_desc: "不属于任何区块",
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
        checkbox_span.q("input").checked = condObj.default_checked;
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
    var result = {};
    
    for (name of Object.keys(unusual_cond))
    {
        const condObj = unusual_cond[name];
        
        if ( condObj['func'] )
        {
            result[ name ] = condObj.func(c, summary_map[c], cInfo) ;

        }
    }

    
    return result;
}

unusual_cond['has_comp_var'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isComp'] 
    );
};
unusual_cond['has_rad_var'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isRad'] 
    );
};

unusual_cond['is_jp'].func = function(c, mapObj, cInfo) {
    return ( mapObj !== undefined 
        && mapObj ['isVari_JP'] 
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



unusual_cond['blk_is_comp'].func = function(c, mapObj, cInfo) {
//     const blks = [
//         "CJK Compatibility Ideographs Supplement",
//         "CJK Compatibility",
//         "CJK Compatibility Forms",
//         "CJK Compatibility Ideographs",
//     ];
    var blk ;
    if (cInfo)
        blk = cInfo.blk;
    else
        blk = getCpBlock( c2utf16(c).hex );
    
//     if ( blks.includes(blk) )
    if (blk.includes("CJK Compatibility"))
        return true;
};
unusual_cond['blk_is_rad'].func = function(c, mapObj, cInfo) {
    const blks = [
        "CJK Radicals Supplement",
        "Kangxi Radicals",
        "CJK Strokes",
    ];
    var blk ;
    if (cInfo)
        blk = cInfo.blk;
    else
        blk = getCpBlock( c2utf16(c).hex );
    
    if ( blks.includes(blk) )
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
    var blk ;
    if (cInfo)
        blk = cInfo.blk;
    else
        blk = getCpBlock( c2utf16(c).hex );
    
//     if ( blks.includes(blk) )
    if (blk.includes("CJK Unified Ideographs Extension"))
        return true;
};

unusual_cond['blk_nobelong'].func = function(c, mapObj, cInfo) {
    var blk ;
    if (cInfo)
        blk = cInfo.blk;
    else
        blk = getCpBlock( c2utf16(c).hex );
    
    if ( ! blk )
        return true;
};


// unusual_cond['is_en'].func = function(c) {
//     const blks = [
//         "Basic Latin",
//     ];
//     var blk = getCpBlock( c2utf16(c).hex );
//     
//     if ( blks.includes(blk) )
//         return true;
// };

// unusual_cond['is_cjk'].func = function(c) {
//     const blks = [
//         "CJK Radicals Supplement",
//         "CJK Symbols and Punctuation",
//         "CJK Strokes",
//         "Enclosed CJK Letters and Months",
//         "CJK Compatibility",
//         "CJK Unified Ideographs Extension A",
//         "CJK Unified Ideographs",
//         "CJK Compatibility Ideographs",
//         "CJK Compatibility Forms",
//         "CJK Unified Ideographs Extension B",
//         "CJK Unified Ideographs Extension C",
//         "CJK Unified Ideographs Extension D",
//         "CJK Unified Ideographs Extension E",
//         "CJK Unified Ideographs Extension F",
//         "CJK Compatibility Ideographs Supplement",
//         "CJK Unified Ideographs Extension G",
//         "CJK Unified Ideographs Extension H",
//         "Kangxi Radicals",
//         // TODO 其他区
//         
//         // TODO 中文标点特殊处理
//     ];
//     
//     var blk = getCpBlock( c2utf16(c).hex );
//     
//     if ( blks.includes(blk) )
//         return true;
// };
