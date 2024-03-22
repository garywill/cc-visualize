import './style.css';

document.addEventListener('DOMContentLoaded', async (event) => {
    document.getElementById("btn_checkessay").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
    
        var essay = document.getElementById("input_essay").value;
        startNewEssayCheck(essay);
        print_stati();
        show_check_results(1);
    };
    document.getElementById("btn_checkessay_normsmall").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
    
        var essay = document.getElementById("input_essay").value;
        startNewEssayCheck(essay);
        print_stati();
        show_check_results(2);
    };
    document.getElementById("btn_checkessay_unusualonly").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
        
        var essay = document.getElementById("input_essay").value;
        startNewEssayCheck(essay);
        print_stati();
        show_check_results(3);
    };
}); 






function show_check_results(display_mode = 1) 
{
    const result_cont = document.getElementById("table_result");
    
    const essay_arr = eCheckSt.essayArr;
    const lineIndexes = Object.keys(essay_arr);
    
    if ( lineIndexes.length > 2000 )  // TODO 太多时只显示前一部分 或翻页
    {
        var alert_text = `已完成字符状况检查。文本数量${lineIndexes.length}行，共${eCheckSt.essayCharsCount}字符，

${display_mode <= 2 ? "您点选了让所有文本都显示" : ''}
您勾选了${eCheckSt.userCond.length}个显示条件（勾选越多则显示负担越大）
要在web上显示结果可能会卡住浏览器

确定要继续显示吗？
（若取消，一样可以在F12中看字符检视统计结果）
        `;
        if ( ! confirm(alert_text) )
            return;
    }
    
    for ( var line_num of lineIndexes)
    {
        const lineObj = essay_arr[line_num]; 
        const charsObjs = lineObj.charsObjs;
        
        
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
        
        if (display_mode > 1 && eCheckSt.linesCrrtStatus [line_num] == "norm" || eCheckSt.linesCrrtStatus == "cmt")
        {
            if (display_mode == 2)
            {
                tr.classList.add("tr_norm");
                p.textContent = lineObj.line_origString;
            }
            else if (display_mode == 3)
                continue;
        }
        else
        {
        
            const charIndexes = Object.keys( charsObjs );
            for ( var col_num of charIndexes)
            {
                const charObj = charsObjs[col_num];
                const essayChar = charObj.char;
                
                const showChar = charObj.cInfo.showChar ? charObj.cInfo.showChar : essayChar ;
                
                var div_essayChar = htmlStr2dom(`
                    <ruby class="div_essayChar">
                        <div class="div_origChar_n_aboveText">
                            <a name="L${lineObj.line_num}C${charObj.col_num}" ></a>
                            <div class="div_commentsAboveChar">
                                <div class="div_aCommentAboveChar">
                                    <span class="span_aCommentAboveChar span_unusualWarn"  style="display: none;" ></span>
                                </div>

                            </div>
                            <div class="div_origChar serif">${essayChar != ' ' ? escapeHtml(showChar) : '&nbsp' }</div>
                        </div>
                        <rt class="serif"></rt>
                    </ruby>
                `);
                
                var div_commentsAboveChar = div_essayChar.q$(".div_commentsAboveChar");
                if ( charObj.cInfo.showCode || charObj.cInfo.showText )
                {
                    var codeDiv = htmlStr2dom(`
                        <div class="div_aCommentAboveChar"  >                                                                                
                            <span class="span_aCommentAboveChar" id="code" ">${charObj.cInfo.showText ? charObj.cInfo.showText :   charObj.cInfo.hex}</span>              
                        </div>   
                    `);
                    div_commentsAboveChar.insertBefore(codeDiv, div_commentsAboveChar.firstChild);
                }
                if ( charObj.cInfo.unusuals['is_other_chars'] == true )
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
                
                
                if (eCheckSt.charsCrrtUnusualStatusCache [essayChar] .isCrrtUnusual )
                {
                    div_essayChar.classList.add("div_essayChar_unusual");
                    unusual_span.style.display = "";
                    unusual_span.textContent = eCheckSt.charsCrrtUnusualStatusCache [essayChar].warnText;
                }
                
                var tips = [];
                tips.push(`Line ${charObj.line_num} Col ${charObj.col_num}`);
                
                for ( var  unusual_name  of Object.keys(charObj.cInfo.unusuals) )
                {
                    if ( charObj.cInfo.unusuals [unusual_name])
                    {
                        var warn = eCheckSt.userCond.includes(unusual_name) ? '⚠' : '';
                        var line = `${warn}${UnCond [unusual_name] .full_desc} [${UnCond [unusual_name] .short_desc}]` ;
                        
                        tips.push( line );
                    }
                }
                
                tips.push( getCharWebComplTip(essayChar) );

                
                genClassNamesAccordingCInfo(essayChar, div_origChar);

                if (mapInUse[essayChar] && mapInUse[essayChar]['r']?.length > 0) //有关联字
                {
                    
                    mapInUse[essayChar]['r']?.forEach( function(relChar) {
                        
                        
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
        }
        result_cont.appendChild(tr);
    }
    
    scrollToResult()
    
}
function genClassNamesAccordingCInfo(c, charHtmlNode)
{
    const cInfo = getCInfo(c);
    
    for ( var name of Object.keys(cInfo.unusuals) )
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
            if (mapObj ['EC1'])
                cProp .push( "陆表一" );
            if (mapObj ['EC2'])
                cProp .push( "陆表二" );
            if (mapObj ['EC3'])
                cProp .push( "陆表三" );
            if (mapObj ['EH'])
                cProp .push( "港表" );
            if (mapObj ['ETA'])
                cProp .push( "台表甲" );
            if (mapObj ['ETB'])
                cProp .push( "台表乙" );
            
            if (mapObj ['T'])
                cProp .push( '繁' );
            if (mapObj ['S'])
                cProp .push( '简' );
            
            if (mapObj ['isChi'])
                cProp .push( '汉' );
            if (mapObj ['isVari_HK'])
                cProp .push( "港变" );
            if (mapObj ['isVari_TW'])
                cProp .push( "台变" );
            if (mapObj ['isVari_JP'])
                cProp .push( "日" );    
            
            if (mapObj ['Cp'])
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
        
        if (mapObj && mapObj['r']?.length > 0 )
        {
            lines.push ( '\n关联字：' );
            
            if (mapObj['r'] !== undefined ) {
                for ( var relChar of mapObj['r'])
                {
                    lines.push ( getCharTipLine(relChar) );
                }
            } 
        }
        cInfo.webComplTip =  lines.join('\n');
    }
    return cInfo.webComplTip;
}





