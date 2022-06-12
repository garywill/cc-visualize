document.addEventListener('DOMContentLoaded', async (event) => {
    document.getElementById("btn_checkessay").onclick = function() {
        show_check_results(false);
    };
    document.getElementById("btn_checkessay_unusualonly").onclick = function() {
        show_check_results(true);
    };
}); 

function show_check_results(only_unusual = false)
{
    readUserCond();
    
    const container = document.getElementById("div_result")
    container.innerHTML = "";
    
    const essay = document.getElementById("essay").value;
    var essay_arr = essay_to_arr(essay);
    
    if (! only_unusual &&   essay_arr.length > 2000 )
    {
        if ( ! confirm(`一共有${essay_arr.length}行文本要显示，可能会卡住浏览器。\n确定要继续吗？`) )
            return;
    }
    
    for (var iLine = 0; iLine < essay_arr.length; iLine++)
    {
        const lineObj = essay_arr[iLine]; 
        const charsObjs = lineObj.charsObjs;
        
        if (only_unusual && ! lineObj.this_line_has_unusual)
            continue;
            
        
        var p = htmlStr2dom(`
            <div class="p_results">
                <div class="result_filename"></div>
                <div class="result_linenum">${lineObj.line_num}</div>
            </div>
        `);
        
        for ( var iCharObj = 0; iCharObj < charsObjs.length; iCharObj ++)
        {
            const charObj = charsObjs[iCharObj];
            const essayChar = charObj.char;
            

            var div_essayChar = htmlStr2dom(`
                <ruby class="div_essay_char">
                    <div class="div_origChar_n_aboveText">
                        <div class="div_comments_above_char">
                            <div class="a_comment_above_char">
                                <span class="span_a_comment_above_char" id="unusual"  style="display: none;" >⚠</span>
                            </div>
                            
                            <div class="a_comment_above_char"  >
                                <span class="span_a_comment_above_char" id="blk" style="display: none;">${escapeHtml(charObj.cInfo.blk)}</span>
                            </div>
                            <div class="a_comment_above_char"  >
                                <span class="span_a_comment_above_char" id="code" style="display: none;">${charObj.cInfo.hex}</span>
                            </div>
                        </div>
                        <div class="div_orig_char">${escapeHtml(essayChar)}</div>
                    </div>
                    <rt></rt>
                </ruby>
            `);
            var div_origChar_n_aboveText = div_essayChar.q(".div_origChar_n_aboveText");
            var div_origChar = div_essayChar.q(".div_orig_char");
            var ruby_rt = div_essayChar.q("rt");
            var code_span = div_essayChar.q("#code");
            var unusual_span = div_essayChar.q("#unusual");
            
            
            if (charObj.isUnusual)
            {
                for ( name of Object.keys(charObj.cInfo.unusuals) )
                {
                    if ( charObj.cInfo.unusuals[name] == true && unusual_cond[name].isCurrentlyEnabled )
                    {
                        unusual_span.style.display="";
                        unusual_span.textContent += unusual_cond[name].short_desc;
                    }
                }
            }
            
            var tips = `Line ${charObj.line_num} Col ${charObj.col_num}\n\n`;
            tips += genCharTipLine(essayChar, charObj);
            
            for ( unusual_name  of Object.keys(charObj.cInfo.unusuals) )
            {
                if ( charObj.cInfo.unusuals [unusual_name])
                {
                    var warn = unusual_cond [unusual_name] .isCurrentlyEnabled ? '⚠' : '';
                    var line = `${warn}${unusual_cond [unusual_name] .full_desc}\n` ;
                    
                    tips += line;
                }
            }
            tips += '\n';

            
            div_origChar.className += genClassNamesAccordingCInfo(essayChar);

            if (summary_map[essayChar] && summary_map[essayChar]['rel'].length > 0) //有关联字
            {
                tips += "关联字：\n";
                
                div_essayChar.className += " div_essay_char_haverel";
                
                summary_map[essayChar]['rel'].forEach( function(relChar) {
                    
                    tips += genCharTipLine(relChar);
                    
                    var div_oneRelChar = document.createElement("div");
                    div_oneRelChar.className = "div_one_rel_char";
                    div_oneRelChar.textContent = relChar;
                    
                    div_oneRelChar.className += genClassNamesAccordingCInfo(relChar);
                    
                    
                    ruby_rt.appendChild(div_oneRelChar);
                });
            }
            

            div_essayChar.title = tips;
            
            p.appendChild(div_essayChar);
        }
        
        container.appendChild(p);
    }
    
}
function genClassNamesAccordingCInfo(c)
{
    var classNames = " "; 
//     const mapObj = summary_map [c];
    const cInfo = getCInfo(c);
    
    for (name of Object.keys(cInfo.unusuals) )
    {
        if ( cInfo.unusuals [name] == true )
            classNames += ` UCcss_${name}`;
    }
    return classNames;
}

function genCharTipLine(c, charObj)
{
    var result = "";
    
    var hex = charObj ? charObj.cInfo.hex : c2utf16(c).hex ;
    var blk = charObj ? charObj.cInfo.blk : getCpBlock(hex);
    
    var cProp = "";
    const mapObj = summary_map[c];
    
    if (mapObj)
    {
        if (mapObj ['isTrad'])
            cProp += '繁';
        if (mapObj ['isSimp'])
            cProp += '简';
        if (mapObj ['isVari_HK'])
            cProp += "港";
        if (mapObj ['isVari_TW'])
            cProp += "台";
        if (mapObj ['isVari_JP'])
            cProp += "日";    
        if (mapObj ['isComp'])
            cProp += "兼";
        if (mapObj ['isRad'])
            cProp += "划";
    }
    
    result += `${c} ${hex} （${cProp}） 属于${blk}\n`;
    return result;
}


// function getCharPropStr(char) {
//     var prop = "";
//     if (summary_map[char])
//     {
//         
//         if (summary_map[char]['isSimp'])
//             prop += "简";
//         if (summary_map[char]['isTrad'])
//             prop += "繁";
//         if (summary_map[char]['isVari_HK'])
//             prop += "港";
//         if (summary_map[char]['isVari_TW'])
//             prop += "台";
//         if (summary_map[char]['isVari_JP'])
//             prop += "日";
//     }
//     return prop;
// }


function c2utf16(c) { 
    var code;
    
    var dec; 

    dec = c.codePointAt(0);
    
    var hex = dec.toString(16);
    if (hex.length %2 == 1)
        hex = "0" + hex;
    return { dec: dec, hex: hex.toUpperCase() };
}

// function c2utf8(c){       
//     const en = new TextEncoder();
//     var a8 = en.encode(c);
//     var b = [];
//     a8.forEach(function(n,i){
//         b[i] = n.toString(16);
//         if (b[i].length<2)
//             b[i] = "0" + b[i];
//     });
//     var hex = b.join('');
//     var dec = parseInt(hex, 16);
//     return { dec: dec, hex: hex.toUpperCase() };
// }
var charsCInfoCache = {};
function essay_to_arr(essay, only_unusual = false) 
{
    var result_arr = [];
    
    essay = essay.replaceAll("\r\n", "\n");
    essay = essay.replaceAll("\r", "\n");
    
    const lines_strs = essay.split("\n");
    for (var line_index = 0; line_index < lines_strs.length; line_index++)
    {
        const line_string = lines_strs[line_index];
        const line_chars = Array.from(line_string);
        
        var result_line_obj = {
            line_num: line_index+1,
            charsObjs: [],
            this_line_has_unusual: false,
        };

        for (var char_index = 0; char_index < line_chars.length ; char_index++)
        {
            const originalChar = line_chars[char_index];
            
            var result_char_obj = {
                line_num: line_index+1,
                col_num: char_index + 1,
                char:  originalChar,
                cInfo: getCInfo(originalChar),
                isUnusual: undefined,
            };
            
            result_char_obj.isUnusual = isCurrentlyThisUnusual(result_char_obj.cInfo.unusuals);
            if (result_char_obj.isUnusual)
            {
                result_line_obj.this_line_has_unusual = true;
            }
            
            result_line_obj.charsObjs.push( result_char_obj ) ;
        }
        
        result_arr.push(result_line_obj);
    }

    return result_arr;
}
function getCInfo(c)
{
    if ( ! charsCInfoCache [c] )
    {
        var cInfo = {
            hex: c2utf16(c).hex,
            blk: undefined,
            unusuals: undefined,
        }
        cInfo.blk = getCpBlock(cInfo.hex); 
        cInfo.unusuals = getCharUnusuals(c, cInfo);

        charsCInfoCache [c] = cInfo;
    }
    return charsCInfoCache [c];
}

function isCurrentlyThisUnusual(unusualsObj)
{
    for (name of Object.keys(unusualsObj) )
    {
        if ( unusual_cond [name] . isCurrentlyEnabled )
        {
            if (unusualsObj[name])
                return true;
        }
    }
    return false;
}



console.log(Array.from(`\u4e00\u3400\u{20000}\u{2a700}\u{2b740}\u{2b820}\u{2ceb0}`));
console.log(Array.from(`一㐀𠀀𪜀𫝀𫠠𬺰`));
