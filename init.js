// let opencc = {};

let unicode_data = {
    blocks: "./data/unicode-data/unicode-data-blocks.json",
    ages: "./data/unicode-data/unicode-data-ages.json", 
    Cc: "./data/unicode-data/unicode-data-Cc.json", 
    Mn: "./data/unicode-data/unicode-data-Mn.json", 
};
let summary_data = {
    map2: "./data/summary-data/summary-data-map2.json",   
};
let mapInUse;

async function fetchTxtContent(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

async function getFileData(fileurl) {
    var r = await fetchTxtContent(fileurl);
    return JSON.parse(r);
}

if (isWeb) {
    (async function() {
        unicode_data = {
            blocks: await getFileData("./data/unicode-data/unicode-data-blocks.json"), 
     ages: await getFileData("./data/unicode-data/unicode-data-ages.json"), 
     Cc: await getFileData("./data/unicode-data/unicode-data-Cc.json"), 
     Mn: await getFileData("./data/unicode-data/unicode-data-Mn.json"), 
        };
        
        summary_data = {
            map2: await getFileData("./data/summary-data/summary-data-map2.json"), 
        };
        
        mapInUse = summary_data.map2;
        
        if (isWeb) {
            var event = new CustomEvent('data-init-finished', { detail: { message: '数据初始化已完成!' } });
            window.dispatchEvent(event);
            
        }
    }) () ;
}
else 
{
    function initDataByFilenameStr(obj) {
        for (let k of Object.keys(obj) ) {
            let v = obj[k];
            obj[k] = require(v);
        }
    }
    initDataByFilenameStr(unicode_data);
    initDataByFilenameStr(summary_data);
    mapInUse = summary_data.map2;
}


