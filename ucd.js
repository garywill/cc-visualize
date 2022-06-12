

function getCpBlock(cp) //eg cp="4e00"
{
    var cp_int =  Number("0x" + cp);
    for ( b of unicode_data.blocks)
    {
        var start = Number( "0x" + b["first_cp"] );
        
        if (  cp_int < start )
            return null;
        
        var end = Number( "0x" + b["last_cp"] );
        
        if ( start <= cp_int && cp_int <= end)
        {
            return b["name"];
        }
        
    }
    return null;
}







