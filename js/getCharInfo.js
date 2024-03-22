let charsCInfoCache = {}; // 静态，不因userchecks改变 

function getCInfo(c)
{
    if (Array.from(c).length > 1) {
        console.warn("警告：输入的长度超过1。超出部都会被忽略");
        c = Array.from(c)[0];
    }
    
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
                cInfo.showCode = getIfShowCodeWeb(c, cInfo);
            
            if (cInfo.unusuals ['is_Cc'] )
                cInfo.showChar = '▫';
            else if ( cInfo.unusuals ['is_Mn'] )
                cInfo.showChar = '◌';
        }  
        charsCInfoCache [c] = cInfo;
    }
    return charsCInfoCache [c];
}