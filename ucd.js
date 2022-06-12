var ucd = {};
async function init_ucd() {
    var xmlStr_2;
    await fetch('unicode-data/ucd.repertoire.xml').then(response => response.text()).then(textString => {
        xmlStr_2 = textString;
    });
    var xmlStr_1;
    await fetch('unicode-data/ucd.no-repertoire.xml').then(response => response.text()).then(textString => {
        xmlStr_1 = textString;
    });

    const domparser = new DOMParser();
    ucd.ucd = domparser.parseFromString(xmlStr_1, "text/xml").activeElement;
    ucd.repertoire = domparser.parseFromString(xmlStr_2, "text/xml").activeElement;
    console.log("完成加载ucd");
//     xmlDoc_1.querySelector("ucd").appendChild(xmlDoc_2.querySelector("repertoire"));
//     var ucdNode = xmlDoc.querySelector("ucd");

}
init_ucd();

function getCPBlock(cp) //eg cp="4e00"
{
    var cp_int =  Number("0x" + cp);
    var blockData_arr = ucd.ucdNode.querySelector("blocks").querySelectorAll("block");
    for ( i in blockData_arr )
    {
        const b=blockData_arr[i];
        var start = Number( "0x" + b.getAttribute("first-cp") );
        
        if (  cp_int < start )
            return { 
                result:"between",
                before: b.getAttribute("name"),
                after: blockData_arr[i-1].getAttribute("name")
                
            };
        
        var end = Number( "0x" + b.getAttribute("last-cp") );
        
        if ( start <= cp_int && cp_int <= end)
        {
            return b.getAttribute("name");
        }
        
    }
    return false;
}







