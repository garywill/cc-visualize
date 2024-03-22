 
function print_stati()
{
    console.log(`已检查${eCheckSt.essayLineCount}行，共${eCheckSt.essayCharsCount}字符。忽略${eCheckSt.essayCmtLineCount}行`);
    for ( var  name of Object.keys(eCheckSt.condCharsStati) )
    {
        const condObj = UnCond [name];
        const condStatiObj = eCheckSt.condCharsStati [name];
        if ( condStatiObj.condCount > 0)
        console.log(`${condObj.short_desc}\t${condStatiObj.charSet.size}字符 ${condStatiObj.condCount}处\t${condObj.full_desc}`);
    }
    print_one_cond_charset('is_comp');
    print_one_cond_charset('is_rad');
    print_one_cond_charset('blk_pua');
    print_one_cond_charset('is_jp');
    print_one_cond_charset('cjk_is_rare');
}

function print_one_cond_charset(name)
{
      const condObj = UnCond [name];
        const condStatiObj = eCheckSt.condCharsStati [name];
        
    if (condStatiObj .condCount == 0)
        return;
        
    var partText = "";
    
    const maxCharAmt = 100;
    if ( condStatiObj.charSet.size > maxCharAmt)
        partText = "(部分)";
    
    console.log(`
${condObj.short_desc}${partText}\t${condStatiObj.charSet.size}字符 ${condStatiObj.condCount}处\t${condObj.full_desc}
'${ [ ... condStatiObj.charSet ] .sort().slice(0,maxCharAmt).join('|') }'`
    );
}
