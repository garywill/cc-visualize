 
function print_stati()
{
    console.log(`已检查${Check.essayLineCount}行，共${Check.essayCharsCount}字符。忽略${Check.essayCmtLineCount}行`);
    for ( name of Object.keys(Check.condCharsStati) )
    {
        const condObj = UnCond [name];
        const condStatiObj = Check.condCharsStati [name];
        console.log(`${condObj.short_desc}\t${condStatiObj.charSet.size}字符 ${condStatiObj.condCount}处\t${condObj.full_desc}`);
    }
    
    print_one_cond_charset('is_jp');
    print_one_cond_charset('is_comp');
    print_one_cond_charset('is_rad');
    print_one_cond_charset('blk_pua');
}

function print_one_cond_charset(condName)
{
    if (Check.condCharsStati [condName] .condCount == 0)
        return;
        
    console.log(`
${UnCond[condName].short_desc}：  ${UnCond[condName].full_desc}
'${ [ ... Check.condCharsStati[condName].charSet ] .sort().join('|') }'
    `);
}
