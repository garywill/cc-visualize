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
                                <span class="span_a_comment_above_char" id="blk" style="display: none;">${escapeHtml(charObj.blk)}</span>
                            </div>
                            <div class="a_comment_above_char"  >
                                <span class="span_a_comment_above_char" id="code" style="display: none;">${charObj.hex}</span>
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
            
//             if (!only_unusual)
//                 code_span.style.display = "none";
            
            var unusual_span = div_essayChar.q("#unusual");
            if (charObj.isUnusual)
            {
                for ( name of Object.keys(charObj.unusuals) )
                {
                    if ( charObj.unusuals[name] == true && $$(`.unusual_cond_checkbox[name='${name}']`).checked )
                    {
                        unusual_span.style.display="";
                        unusual_span.textContent += unusual_cond[name].short_desc;
                    }
                }
            }
            


            if (summary_map [essayChar])
            {
                if (summary_map[essayChar]['isVari_TW'])
                    div_origChar.className += " tw";
                if (summary_map[essayChar]['isVari_HK'])
                    div_origChar.className += " hk";
                if (summary_map[essayChar]['isVari_JP'])
                    div_origChar.className += " jp";
                
                if (summary_map[essayChar]['isSimp'] && summary_map[essayChar]['isTrad'])
                    div_origChar.className += " simp-n-trad";
                else if (summary_map[essayChar]['isSimp'])
                    div_origChar.className += " simp";
                else if (summary_map[essayChar]['isTrad'])
                    div_origChar.className += " trad";

            }
            
            if ( 100 <= charObj.isUnusual && charObj.isUnusual < 200 )
                div_origChar.className += " unusual_1";
            else if (200 <= charObj.isUnusual )
                div_origChar.className += " unusual_2";
            
//             if (charObj.isUnusual)
//             {
//                 div_origChar_n_aboveText.querySelector(".span_a_comment_above_char").textContent = 
//                     getCpBlock( c2utf16(essayChar).hex );
//             }
            

            if (summary_map[essayChar] && summary_map[essayChar]['rel']) //有关联字
            {
                div_essayChar.className += " div_essay_char_haverel";
                
                summary_map[essayChar]['rel'].forEach( function(relChar) {
                    
                    var div_oneRelChar = document.createElement("div");
                    div_oneRelChar.className = "div_one_rel_char";
                    div_oneRelChar.textContent = relChar;
                    
                    if (summary_map[relChar] && summary_map[relChar]['isSimp'] && summary_map[relChar]['isTrad'])
                        div_oneRelChar.className += " simp-n-trad";
                    else if (summary_map[relChar] && summary_map[relChar]['isSimp'])
                        div_oneRelChar.className += " simp";
                    else if (summary_map[relChar] && summary_map[relChar]['isTrad'])
                        div_oneRelChar.className += " trad";
                    else if (summary_map[relChar] && summary_map[relChar]['isVari_JP'])
                        div_oneRelChar.className += " jp";
                    
                    ruby_rt.appendChild(div_oneRelChar);
                });
            }
            
            var tip = "";
            tip += essayChar + "（" + getCharPropStr(essayChar) + "）";
            
            if (summary_map[essayChar] && summary_map[essayChar]['rel']) //有关联字
            {
                tip += "\n\n关联字\n";
                summary_map[essayChar]['rel'].forEach( function(relChar) {
                    tip += relChar + "（" + getCharPropStr(relChar) + "）\n";
                });
            }
            
            div_essayChar.title = tip;
            
            p.appendChild(div_essayChar);
        }
        
        container.appendChild(p);
    }
    
}




function getCharPropStr(char) {
    var prop = "";
    if (summary_map[char])
    {
        
        if (summary_map[char]['isSimp'])
            prop += "简";
        if (summary_map[char]['isTrad'])
            prop += "繁";
        if (summary_map[char]['isVari_HK'])
            prop += "港";
        if (summary_map[char]['isVari_TW'])
            prop += "台";
        if (summary_map[char]['isVari_JP'])
            prop += "日";
    }
    return prop;
}


function c2utf16(c) { 
    var code;
//     var next;
    
    var dec; 

//     code = c.charCodeAt(0);
//     if (code <= 0xd7ff || code >= 0xe000) 
//         dec = code;
//     else
//     {
//         next = c.charCodeAt(1);
//         dec = (code << 10) + next - 0x35fdc00;
//     }
    dec = c.codePointAt(0);
    
    var hex = dec.toString(16);
    if (hex.length %2 == 1)
        hex = "0" + hex;
    return { dec: dec, hex: hex.toUpperCase() };
}

function c2utf8(c){       
    const en = new TextEncoder();
    var a8 = en.encode(c);
    var b = [];
    a8.forEach(function(n,i){
        b[i] = n.toString(16);
        if (b[i].length<2)
            b[i] = "0" + b[i];
    });
    var hex = b.join('');
    var dec = parseInt(hex, 16);
    return { dec: dec, hex: hex.toUpperCase() };
}
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
                hex: c2utf16(originalChar).hex,
                blk: undefined,
                unusuals: undefined,
                isUnusual: undefined,
            };
            
            result_char_obj.blk = getCpBlock(result_char_obj.hex);
            result_char_obj.unusuals = getCharUnusuals(originalChar, result_char_obj);
//             console.log(result_char_obj.unusuals);
            result_char_obj.isUnusual = isCurrentlyThisUnusual(result_char_obj.unusuals);
            if (result_char_obj.isUnusual)
            {
                result_line_obj.this_line_has_unusual = true;
            }
            
            result_line_obj.charsObjs.push( result_char_obj ) ;
            
//             console.log(originalChar, result_char_obj.isUnusual);
        }
        
        result_arr.push(result_line_obj);
    }

    return result_arr;
}
function isCurrentlyThisUnusual(unusualsObj)
{
    for (name of Object.keys(unusualsObj) )
    {
        if ( $$(`.unusual_cond_checkbox[name='${name}']`).checked )
        {
            if (unusualsObj[name])
                return true;
        }
    }
    return false;
}

console.log(Array.from(`\u4e00\u3400\u{20000}\u{2a700}\u{2b740}\u{2b820}\u{2ceb0}`));
console.log(Array.from(`一㐀𠀀𪜀𫝀𫠠𬺰`));

 
