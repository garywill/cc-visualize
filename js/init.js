// let opencc = {};

let unicode_data = {
    blocks: require("./data/unicode-data/unicode-data-blocks.json"), 
    ages: require("./data/unicode-data/unicode-data-ages.json"), 
    Cc: require("./data/unicode-data/unicode-data-Cc.json"), 
    Mn: require("./data/unicode-data/unicode-data-Mn.json"), 
};
let summary_data = {
    map2: require("./data/summary-data/summary-data-map2.json"),   
};
let mapInUse = summary_data.map2;

// @if buildtarget = 'webtool'
if (isWeb) {
    var event = new CustomEvent('data-init-finished', { detail: { message: '数据初始化已完成!' } });
    window.dispatchEvent(event);
    
}
// @endif

