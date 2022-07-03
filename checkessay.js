if (isWeb)
document.addEventListener('DOMContentLoaded', async (event) => {
    document.getElementById("btn_checkessay").onclick = function() {
        show_check_results(false);
    };
    document.getElementById("btn_checkessay_unusualonly").onclick = function() {
        show_check_results(true);
    };
}); 

var charsCInfoCache = {};

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

                        </div>
                        <div class="div_orig_char">${essayChar != ' ' ? escapeHtml(essayChar) : '&nbsp' }</div>
                    </div>
                    <rt></rt>
                </ruby>
            `);
            
            var div_comments_above_char = div_essayChar.q$(".div_comments_above_char");
            if ( charObj.cInfo.showCode == true )
            {
                var codeDiv = htmlStr2dom(`
                    <div class="a_comment_above_char"  >                                                                                
                        <span class="span_a_comment_above_char" id="code" ">${charObj.cInfo.hex}</span>              
                    </div>   
                `);
                div_comments_above_char.insertBefore(codeDiv, div_comments_above_char.firstChild);
            }
            if ( charObj.cInfo.unusuals['blk_others'] == true )
            {
                var blkDiv = htmlStr2dom(`
                    <div class="a_comment_above_char"  >                                                                                
                        <span class="span_a_comment_above_char" id="blk" >${escapeHtml(charObj.cInfo.blk)}</span>
                    </div>   
                `);
                div_comments_above_char.insertBefore(blkDiv, div_comments_above_char.firstChild);
            }
            
            var div_origChar_n_aboveText = div_essayChar.q$(".div_origChar_n_aboveText");
            var div_origChar = div_essayChar.q$(".div_orig_char");
            var ruby_rt = div_essayChar.q$("rt");
            var unusual_span = div_essayChar.q$("#unusual");
            
            
            if (charObj.isUnusual)
            {
                div_essayChar.classList.add("div_essayChar_unusual");
                for ( name of Object.keys(charObj.cInfo.unusuals) )
                {
                    if ( charObj.cInfo.unusuals[name] == true && unusual_cond[name].isCurrentlyEnabled )
                    {
                        unusual_span.style.display="";
                        unusual_span.textContent += unusual_cond[name].short_desc;
                        if (name == "blk_is_cjkext")
                            unusual_span.textContent += charObj.cInfo.blk.split(' ')[4];
                    }
                }
            }
            
            var tips = `Line ${charObj.line_num} Col ${charObj.col_num}\n\n`;
            tips += getCharTipLine(essayChar);
            
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

            
            genClassNamesAccordingCInfo(essayChar, div_origChar);

            if (summary_data.map2[essayChar] && summary_data.map2[essayChar]['rel'].length > 0) //有关联字
            {
                tips += "关联字：\n";
                
                div_essayChar.classList.add ( "div_essay_char_haverel" );
                
                summary_data.map2[essayChar]['rel'].forEach( function(relChar) {
                    
                    tips += getCharTipLine(relChar);
                    
                    var div_oneRelChar = document.createElement("div");
                    div_oneRelChar.classList.add ( "div_one_rel_char" );
                    div_oneRelChar.textContent = relChar;
                    
                    genClassNamesAccordingCInfo(relChar, div_oneRelChar) ;
                    
                    
                    ruby_rt.appendChild(div_oneRelChar);
                });
            }
            

            div_essayChar.title = tips;
            
            p.appendChild(div_essayChar);
        }
        
        container.appendChild(p);
    }
    
}
function genClassNamesAccordingCInfo(c, charHtmlNode)
{
    const cInfo = getCInfo(c);
    
    for (name of Object.keys(cInfo.unusuals) )
    {
        if ( cInfo.unusuals [name] == true )
            charHtmlNode.classList.add(  `UCcss_${name}` );
    }
}

function getCharTipLine(c)
{
    var cInfo = getCInfo(c);
    if (  cInfo.tipLine === undefined )
    {
        var cProp = [] ;
        const mapObj = summary_data.map2[c];
        
        if (mapObj)
        {
            if (mapObj ['isEdu_CN_1c'])
                cProp .push( "陆表一" );
            if (mapObj ['isEdu_CN_2c'])
                cProp .push( "陆表二" );
            if (mapObj ['isEdu_CN_3c'])
                cProp .push( "陆表三" );
            if (mapObj ['isEdu_HK'])
                cProp .push( "港表" );
            if (mapObj ['isEdu_TW_1'])
                cProp .push( "台表甲" );
            if (mapObj ['isEdu_TW_2'])
                cProp .push( "台表乙" );
            
            if (mapObj ['isTrad'])
                cProp .push( '繁' );
            if (mapObj ['isSimp'])
                cProp .push( '简' );
            
            if (mapObj ['isChi'])
                cProp .push( '汉' );
            if (mapObj ['isVari_HK'])
                cProp .push( "港变" );
            if (mapObj ['isVari_TW'])
                cProp .push( "台变" );
            if (mapObj ['isVari_JP'])
                cProp .push( "日" );    
            
            if (mapObj ['isComp'])
                cProp .push( "兼" );
            if (mapObj ['isRad'])
                cProp .push( "划" );
        }
        
        cProp = cProp.join(' ')
        
        cInfo.tipLine = `${c}\t${cInfo.hex}\t（${cProp}）\t属于${cInfo.blk}\t${cInfo.age}\n` ;
    }
    return cInfo.tipLine;
}


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
            hex: hex,
            blk: blk,
            age: age,
            unusuals: undefined,
            showCode: undefined,
        }
        cInfo.unusuals = getCharUnusuals(c, cInfo);
        cInfo.showCode = getIfShowCode(c, cInfo);
        
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
