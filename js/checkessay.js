


let eCheckSt = { // 储存文章检查工作的状态。每次开始check都变。初始化它为以下描述的默认状态
    userCond: [], // 本次用户启用的条件。如果和上次一样，就不需要清除 charsCrrtUnusualStatus
    charsCrrtUnusualStatusCache: {}, //本次条件下的每个字符（重复出现只存一次）的 isCrrtUnusual (bool) , warnText (eg. ⚠少⚠日), 
    
    
    
    essayArr: {}, //本次 essay文本+注释条件 下的
    // 每行、每字符转换成一个个object的数组（二维）。
    // 显示时根据其中的char为索引找charsCrrtUnusualStatus
    // 以line_num作下标
    
    essayLineCount: 0, //本次 essay文本+注释条件 下的
    essayCharsCount: 0, //本次 essay文本+注释条件 下的
    
    linesCrrtStatus: {}, //本次 条件 + essay文本 + 注释条件 下的
    //每一行的非寻常标记  ( 1: "hUnus(有非寻常字符)|cmt(已注释)|norm(正常行)" ) 
    // 以line_num作下标
    
    
    
    condCharsStati: {}, // 本次 essay文本 （不管userCond, 只管所有条件）下，每个条件的字符集+count
    // 如果要统计准确，应该关优化，用完整模式
};
let eCheckStDefault = JSON.stringify(eCheckSt);  // 把Check的默认状态储存下来。 这是个常量
function resetEssayCheckSt() {
    eCheckSt = JSON.parse(eCheckStDefault);
}


function reset() {
    clearCharsInfoCache();
    resetEssayCheckSt();
}


function startNewEssayCheck(essay)
{
    eCheckSt.essayArr = {};
    eCheckSt.essayLineCount = 0;
    eCheckSt.essayCharsCount = 0;
    eCheckSt.linesCrrtStatus = {};
    for (var name of Object.keys(UnCond))
    {
        eCheckSt.condCharsStati [name] = {
            charSet: new Set(),
            condCount: 0, 
        }; 
    } 
    //- -------
    
    var new_userCond = readUserCond();
    if (new_userCond != eCheckSt.userCond)
    {
        eCheckSt.charsCrrtUnusualStatusCache = {};
    }
    eCheckSt.userCond = new_userCond; // 覆盖旧的
    
    genEssayArr(essay); // eCheckSt.essayArr
    
    //---------- 
    genCrrtUnusualInfos();
    
}
function readUserCond() 
{
    var userCond = [];
    if (isWeb)
    {
        
        const checkboxes = Array.from( $$$("#form_UnCond .cb_UnCond") );
        for (var cb of checkboxes)
        {
            const name = cb.getAttribute("name");
            if (cb.checked)
            userCond.push( name );
        }
    }
    else if (isNode)
    {
        for (var name in UnCond)
        {
            userCond.push( name );
        }
    }
    return userCond;
}
function genCrrtUnusualInfos()
{
    for (var line_num of Object.keys(eCheckSt.essayArr) )
    {
        const lineObj = eCheckSt.essayArr[line_num];
        eCheckSt.linesCrrtStatus [line_num] = "norm";
        for (var col_num of Object.keys(lineObj.charsObjs) )
        {
            const charObj = lineObj.charsObjs[col_num];
            const c = charObj.char;
            const cInfo = charObj.cInfo;
            const allCInfoUnNames = Object.keys( cInfo.unusuals ); // cInfo里unusuals已加进去的条件名（若关优化不会完整）
            
            for (var name of allCInfoUnNames) 
            {
                eCheckSt.condCharsStati [name] .charSet.add(c);
                eCheckSt.condCharsStati [name] .condCount ++;
            } 
            
            if ( ! eCheckSt.charsCrrtUnusualStatusCache [c] )
            {
                var isCrrtUnusual = false;
                var warnTextS = [''];
                
                for (var name of allCInfoUnNames) 
                { 
                    if ( eCheckSt.userCond.includes(name) )  // 当前用户启用的这个条件
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
                eCheckSt.charsCrrtUnusualStatusCache [c] = {
                    isCrrtUnusual: isCrrtUnusual,      
                };
                if (isCrrtUnusual)
                    eCheckSt.charsCrrtUnusualStatusCache [c] .warnText = warnTextS.join('⚠');
            }
            if ( eCheckSt.charsCrrtUnusualStatusCache [c] .isCrrtUnusual )
                eCheckSt.linesCrrtStatus [line_num] = "hUnus";
            
        }
    }
} 


function genEssayArr(essay) 
{
    essay = essay.replaceAll("\r\n", "\n");
    essay = essay.replaceAll("\r", "\n");
    
    const lines_strs = essay.split("\n");
    for (var iLine = 0; iLine < lines_strs.length; iLine++)
    {
        const line_num = iLine + 1;
        const line_string = lines_strs[iLine];
        
        eCheckSt.essayLineCount ++;
        
        var result_lineObj = {
            line_num: line_num,
            line_origString: line_string, 
            charsObjs: {},
        };
        const line_chars = Array.from(line_string);

        for (var iChar = 0; iChar < line_chars.length ; iChar++)
        {
            eCheckSt.essayCharsCount ++ ;
            
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
        eCheckSt.essayArr [line_num] = result_lineObj;
    }
}


