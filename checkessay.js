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
    
    const result_cont = document.getElementById("table_result")
    result_cont.innerHTML = "";
    
    const essay = document.getElementById("input_essay").value;
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
        
        if (only_unusual && ! lineObj.thisLineCurrentlyHasUnusual)
            continue;
            
        
        var faketable = htmlStr2dom(`
            <table>
            <tr class="tr_result">
                <td class="result_linenum">${lineObj.line_num}
                    <a name="L${lineObj.line_num}"></a>
                </td>
                <td class="p_result"></td>
            </tr>
            </table>
        `);
        var tr = faketable.q$("tr");
        var p = tr.q$(".p_result");
        
        for ( var iCharObj = 0; iCharObj < charsObjs.length; iCharObj ++)
        {
            const charObj = charsObjs[iCharObj];
            const essayChar = charObj.char;
            

            var div_essayChar = htmlStr2dom(`
                <ruby class="div_essayChar">
                    <div class="div_origChar_n_aboveText">
                        <a name="L${lineObj.line_num}C${charObj.col_num}" ></a>
                        <div class="div_commentsAboveChar">
                            <div class="div_aCommentAboveChar">
                                <span class="span_aCommentAboveChar span_unusualWarn"  style="display: none;" ></span>
                            </div>

                        </div>
                        <div class="div_origChar">${essayChar != ' ' ? escapeHtml(essayChar) : '&nbsp' }</div>
                    </div>
                    <rt></rt>
                </ruby>
            `);
            
            var div_commentsAboveChar = div_essayChar.q$(".div_commentsAboveChar");
            if ( charObj.cInfo.showCode == true )
            {
                var codeDiv = htmlStr2dom(`
                    <div class="div_aCommentAboveChar"  >                                                                                
                        <span class="span_aCommentAboveChar" id="code" ">${charObj.cInfo.hex}</span>              
                    </div>   
                `);
                div_commentsAboveChar.insertBefore(codeDiv, div_commentsAboveChar.firstChild);
            }
            if ( charObj.cInfo.unusuals['blk_others'] == true )
            {
                var blkDiv = htmlStr2dom(`
                    <div class="div_aCommentAboveChar"  >                                                                                
                        <span class="span_aCommentAboveChar span_blk" >${escapeHtml(charObj.cInfo.blk)}</span>
                    </div>   
                `);
                div_commentsAboveChar.insertBefore(blkDiv, div_commentsAboveChar.firstChild);
            }
            
            var div_origChar_n_aboveText = div_essayChar.q$(".div_origChar_n_aboveText");
            var div_origChar = div_essayChar.q$(".div_origChar");
            var ruby_rt = div_essayChar.q$("rt");
            var unusual_span = div_essayChar.q$(".span_unusualWarn");
            
            
            if (charObj.isCurrentlyUnusual)
            {
                div_essayChar.classList.add("div_essayChar_unusual");
                for ( name of Object.keys(charObj.cInfo.unusuals) )
                {
                    if ( charObj.cInfo.unusuals[name] == true && UnCond[name].isCurrentlyUserChecked )
                    {
                        unusual_span.style.display="";
                        unusual_span.textContent += '⚠' + UnCond[name].short_desc;
                    }
                }
            }
            
            var tips = [];
            tips.push(`Line ${charObj.line_num} Col ${charObj.col_num}`);
            
            for ( unusual_name  of Object.keys(charObj.cInfo.unusuals) )
            {
                if ( charObj.cInfo.unusuals [unusual_name])
                {
                    var warn = UnCond [unusual_name] .isCurrentlyUserChecked ? '⚠' : '';
                    var line = `${warn}${UnCond [unusual_name] .full_desc}` ;
                    
                    tips.push( line );
                }
            }
            
            tips.push( getCharWebComplTip(essayChar) );

            
            genClassNamesAccordingCInfo(essayChar, div_origChar);

            if (mapInUse[essayChar] && mapInUse[essayChar]['rel'].length > 0) //有关联字
            {
                
                mapInUse[essayChar]['rel'].forEach( function(relChar) {
                    
                    
                    var div_oneRelChar = document.createElement("div");
                    div_oneRelChar.classList.add ( "div_oneRelChar" );
                    div_oneRelChar.textContent = relChar;
                    
                    genClassNamesAccordingCInfo(relChar, div_oneRelChar) ;
                    
                    
                    ruby_rt.appendChild(div_oneRelChar);
                });
            }
            

            div_essayChar.title = tips.join('\n');
            
            p.appendChild(div_essayChar);
        }
        
        result_cont.appendChild(tr);
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
    const mapObj = mapInUse[c];
    
    if (  cInfo.tipLine === undefined )
    {
        var cProp = [] ;
        
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
        
        cInfo.tipLine = `${c}\t${cInfo.hex}\t（${cProp}）\t属于${cInfo.blk}\t${cInfo.age}` ;
    }
    return cInfo.tipLine;
}
function getCharWebComplTip(c) 
{
    var cInfo = getCInfo(c);
    const mapObj = mapInUse[c];
 
    if ( cInfo.webComplTip === undefined )
    {
        var lines = [];
        
        var origCharTipLine = getCharTipLine(c);
        lines.push(origCharTipLine);
        
        if (mapObj && mapObj['rel'].length > 0 )
        {
            lines.push ( '\n关联字：' );
            
            for (relChar of mapObj['rel'])
            {
                lines.push ( getCharTipLine(relChar) );
            }
        }
        cInfo.webComplTip =  lines.join('\n');
    }
    return cInfo.webComplTip;
}


function essay_to_arr(essay, only_unusual = false) 
{
    var result_arr = [];
    
    essay = essay.replaceAll("\r\n", "\n");
    essay = essay.replaceAll("\r", "\n");
    
    const lines_strs = essay.split("\n");
    for (var iLine = 0; iLine < lines_strs.length; iLine++)
    {
        const line_string = lines_strs[iLine];
        const line_chars = Array.from(line_string);
        
        var result_lineObj = {
            line_num: iLine+1,
            charsObjs: [],
            thisLineCurrentlyHasUnusual: false,
        };

        for (var iChar = 0; iChar < line_chars.length ; iChar++)
        {
            const originalChar = line_chars[iChar];
            
            var result_charObj = {
                line_num: iLine+1,
                col_num: iChar + 1,
                char:  originalChar,
                cInfo: getCInfo(originalChar),
                isCurrentlyUnusual: undefined,
            };
            
            result_charObj.isCurrentlyUnusual = isCurrentlyThisUnusual(result_charObj.cInfo.unusuals);
            
            if (result_charObj.isCurrentlyUnusual)
                result_lineObj.thisLineCurrentlyHasUnusual = true;
            result_lineObj.charsObjs.push( result_charObj ) ;
        }
        
        result_arr.push(result_lineObj);
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
            unusuals: { } ,
        }
        getCharUnusuals(c, cInfo);
        if (isWeb)
            cInfo.showCode = getIfShowCode(c, cInfo);
        
        charsCInfoCache [c] = cInfo;
    }
    return charsCInfoCache [c];
}

function isCurrentlyThisUnusual(unusualsObj)
{
    for (name of Object.keys(unusualsObj) )
    {
        if ( UnCond [name] . isCurrentlyUserChecked )
        {
            if (unusualsObj[name])
                return true;
        }
    }
    return false;
}
