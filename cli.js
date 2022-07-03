var fs = require('fs');

eval(fs.readFileSync('common.js').toString());
eval(fs.readFileSync('init.js').toString());

eval(fs.readFileSync("unicode-data/unicode-data-blocks.js").toString());
eval(fs.readFileSync("unicode-data/unicode-data-ages.js").toString());
eval(fs.readFileSync("ucd.js").toString());

eval(fs.readFileSync("summary-data/summary-data-map2.js").toString());

eval(fs.readFileSync("unusual_conditions.js").toString());
eval(fs.readFileSync("checkessay.js").toString());

eval(fs.readFileSync("print_check.js").toString());


// 在定制修改用于判断文本文件中一行字符串是否应被忽略的条件
isLineCommented = function (line_string)
{ return false; }

function start() 
{
    optimOff();
    
    startNewCheck("这是一段测试文本。這是一段測試，就幾句話怎樣？\n简体与繁体都打几个字上来");
    print_stati();
    
//     checkTextFile("TextFileName.txt");
    
    //eval(fs.readFileSync("test/test.js").toString());
    
}
start();

function checkTextFile(fileName)
{
    startNewCheck ( fs.readFileSync(fileName).toString() );
    print_stati();
}
