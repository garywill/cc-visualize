

function getCpBlock(cp) //eg cp="4e00" // 输入可以是数字或字符串。字符串被认为是十六进制
{
    var cp_int ; 
    if ( typeof(cp) === "string" )
    { 
        cp_int =  Number("0x" + cp);
    } 
    else
    {
        cp_int = cp;
    }
    for ( b of unicode_data.blocks)
    {
        var start =  b["first_cp"] ;
        var end =  b["last_cp"] ;
        
        if ( start <= cp_int && cp_int <= end)
        {
            return b["name"];
        }
        
    }
    return null;
}







