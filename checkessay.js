if (isWeb)
document.addEventListener('DOMContentLoaded', async (event) => {
    document.getElementById("btn_checkessay").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
    
        var essay = document.getElementById("input_essay").value;
        startNewCheck(essay);
        print_stati();
        show_check_results(1);
    };
    document.getElementById("btn_checkessay_normsmall").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
    
        var essay = document.getElementById("input_essay").value;
        startNewCheck(essay);
        print_stati();
        show_check_results(2);
    };
    document.getElementById("btn_checkessay_unusualonly").onclick = function() {
        const result_cont = document.getElementById("table_result");
        result_cont.innerHTML = ""; 
        
        var essay = document.getElementById("input_essay").value;
        startNewCheck(essay);
        print_stati();
        show_check_results(3);
    };
}); 

var charsCInfoCache = {}; // 静态，不因userchecks改变

var Check = { // 每次开始check都变
    userCond: [], // 本次用户启用的条件。如果和上次一样，就不需要清除charsCrrtUnusualStatus
    charsCrrtUnusualStatusCache: {}, //本次条件下的每个字符（重复出现只存一次）的 isCrrtUnusual (bool) , warnText (eg. ⚠少⚠日), 
    
    
    
    essayArr: {}, //本次 essay文本+注释条件 下的
                    // 每行、每字符转换成一个个object的数组（二维）。
                    // 显示时根据其中的char为索引找charsCrrtUnusualStatus
                    // 以line_num作下标
                    
    essayLineCount: 0, //本次 essay文本+注释条件 下的
    essayCmtLineCount: 0, //本次 essay文本+注释条件 下的
    essayCharsCount: 0, //本次 essay文本+注释条件 下的
    
    linesCrrtStatus: {}, //本次 条件 + essay文本 + 注释条件 下的
                        //每一行的非寻常标记  ( 1: "hUnus(有非寻常字符)|cmt(已注释)|norm(正常行)" ) 
                        // 以line_num作下标
    
    
    
    condCharsStati: {}, // 本次 essay文本 （不管userCond, 只管所有条件）下，每个条件的字符集+count
                        // 如果要统计准确，应该关优化，用完整模式
};
var freshCheckJSON = JSON.stringify(Check);

function reset() {
    charsCInfoCache = {};
    Check = JSON.parse(freshCheckJSON);
}
function startNewCheck(essay)
{
    Check.essayArr = {};
    Check.essayLineCount = 0;
    Check.essayCmtLineCount = 0 ;
    Check.essayCharsCount = 0;
    Check.linesCrrtStatus = {};
    for (name of Object.keys(UnCond))
    {
        Check.condCharsStati [name] = {
            charSet: new Set(),
            condCount: 0, 
        }; 
    } 
    //- -------
    
    var new_userCond = readUserCond();
    if (new_userCond != Check.userCond)
    {
        Check.charsCrrtUnusualStatusCache = {};
    }
    Check.userCond = new_userCond; // 覆盖旧的
    
    genEssayArr(essay); // Check.essayArr
    
    //---------- 
    genCrrtUnusualInfos();
    
}

function genCrrtUnusualInfos()
{
    for (line_num of Object.keys(Check.essayArr) )
    {
        const lineObj = Check.essayArr[line_num];
        Check.linesCrrtStatus [line_num] = "norm";
        for (col_num of Object.keys(lineObj.charsObjs) )
        {
            const charObj = lineObj.charsObjs[col_num];
            const c = charObj.char;
            const cInfo = charObj.cInfo;
            const allCInfoUnNames = Object.keys( cInfo.unusuals ); // cInfo里unusuals已加进去的条件名（若关优化不会完整）
            
            for ( name of allCInfoUnNames) 
            {
                Check.condCharsStati [name] .charSet.add(c);
                Check.condCharsStati [name] .condCount ++;
            } 
            
            if ( ! Check.charsCrrtUnusualStatusCache [c] )
            {
                var isCrrtUnusual = false;
                var warnTextS = [''];
                
                for ( name of allCInfoUnNames) 
                { 
                    if ( Check.userCond.includes(name) )  // 当前用户启用的这个条件
                    {
                        isCrrtUnusual = true;
                        
                        if (isWeb)
                        {
                            var wt;
                            if (name == "cjk_is_rare" && cInfo.blk.includes("CJK Unified Ideographs Extension") )
                                wt = cInfo.blk.split(' ')[4];
                            else
                                wt = UnCond [name] .short_desc;
                            warnTextS .push(wt);
                        } 
                    }
                } 
                Check.charsCrrtUnusualStatusCache [c] = {
                    isCrrtUnusual: isCrrtUnusual,      
                };
                if (isCrrtUnusual)
                    Check.charsCrrtUnusualStatusCache [c] .warnText = warnTextS.join('⚠');
            }
            if ( Check.charsCrrtUnusualStatusCache [c] .isCrrtUnusual )
                 Check.linesCrrtStatus [line_num] = "hUnus";
            
        }
    }
}

var isLineCommented = function (line_string) 
{ return false; }

function genEssayArr(essay) 
{
    essay = essay.replaceAll("\r\n", "\n");
    essay = essay.replaceAll("\r", "\n");
    
    const lines_strs = essay.split("\n");
    for (var iLine = 0; iLine < lines_strs.length; iLine++)
    {
        const line_num = iLine + 1;
        const line_string = lines_strs[iLine];
        if ( isLineCommented(line_string) )
        {
            Check.linesCrrtStatus [line_num] = "cmt";
            Check.essayCmtLineCount ++ ;
            continue;
        }
        
        Check.essayLineCount ++;
        
        var result_lineObj = {
            line_num: line_num,
            line_origString: line_string, 
            charsObjs: {},
        };
        const line_chars = Array.from(line_string);

        for (var iChar = 0; iChar < line_chars.length ; iChar++)
        {
            Check.essayCharsCount ++ ;
            
            const col_num = iChar + 1;
            const originalChar = line_chars[iChar];
            
            var result_charObj = {
                line_num: line_num,
                col_num: col_num,
                char:  originalChar,
                cInfo: getCInfo(originalChar),
            };
            
            
            result_lineObj.charsObjs [col_num] = result_charObj ;
        }
        Check.essayArr [line_num] = result_lineObj;
    }
}

function show_check_results(display_mode = 1) 
{
    const result_cont = document.getElementById("table_result");
    
    const essay_arr = Check.essayArr;
    const lineIndexes = Object.keys(essay_arr);
    
    if ( lineIndexes.length > 2000 )  // TODO 太多时只显示前一部分 或翻页
    {
        var alert_text = `已完成字符状况检查。文本数量${lineIndexes.length}行，共${Check.essayCharsCount}字符，

${display_mode <= 2 ? "您点选了让所有文本都显示" : ''}
您勾选了${Check.userCond.length}个显示条件（勾选越多则显示负担越大）
要在web上显示结果可能会卡住浏览器

确定要继续显示吗？
（若取消，一样可以在F12中看字符检视统计结果）
        `;
        if ( ! confirm(alert_text) )
            return;
    }
    
    for (line_num of lineIndexes)
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
        
        if (display_mode > 1 && Check.linesCrrtStatus [line_num] == "norm" || Check.linesCrrtStatus == "cmt")
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
            for (col_num of charIndexes)
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
                
                
                if (Check.charsCrrtUnusualStatusCache [essayChar] .isCrrtUnusual )
                {
                    div_essayChar.classList.add("div_essayChar_unusual");
                    unusual_span.style.display = "";
                    unusual_span.textContent = Check.charsCrrtUnusualStatusCache [essayChar].warnText;
                }
                
                var tips = [];
                tips.push(`Line ${charObj.line_num} Col ${charObj.col_num}`);
                
                for ( unusual_name  of Object.keys(charObj.cInfo.unusuals) )
                {
                    if ( charObj.cInfo.unusuals [unusual_name])
                    {
                        var warn = Check.userCond.includes(unusual_name) ? '⚠' : '';
                        var line = `${warn}${UnCond [unusual_name] .full_desc} [${UnCond [unusual_name] .short_desc}]` ;
                        
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
        }
        result_cont.appendChild(tr);
    }
    
    scrollToResult()
    
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
            if (mapObj ['isEdu_TW_A'])
                cProp .push( "台表甲" );
            if (mapObj ['isEdu_TW_B'])
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
            dec: dec, 
            hex: hex,
            blk: blk,
            age: age,
            unusuals: { } ,
        }
        
        charsCInfoCache [c] = cInfo;
        
        if (dec == 0x09) {
            cInfo.showText = "制表符";
        } else if (dec == 0x0A) {
            cInfo.showText = "\\n";
        } else if (dec == 0x0D) {
            cInfo.showText = "\\r";
        } else if (dec == 0x20) {
            cInfo.showText = "空";
        } else if ( 0x20 < dec && dec <= 0x7E ) {
            // nothing
        } else if ( dec == 0x3000 ) {
            cInfo.showText = "全角空"
        } else {
            getCharUnusuals(c, cInfo);
            if (isWeb)
                cInfo.showCode = getIfShowCode(c, cInfo);
            
            if (cInfo.unusuals ['is_Cc'] )
                cInfo.showChar = '▫';
            else if ( cInfo.unusuals ['is_Mn'] )
                cInfo.showChar = '◌';
        }  
        charsCInfoCache [c] = cInfo;
    }
    return charsCInfoCache [c];
}


