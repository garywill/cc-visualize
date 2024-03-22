// let opencc = {};

let unicode_data;
let summary_data;
let mapInUse;

async function fetchTxtContent(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
}

async function getFileData(fileurl) {
    if (isWeb) {
        var r = await fetchTxtContent(fileurl);
        return JSON.parse(r);
    }
    if (isNode) {
        return require(fileurl);
    }
}

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