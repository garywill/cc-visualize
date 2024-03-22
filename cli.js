var fs = require('fs');



// 编译之后再运行这个文件
const vccrlib = require('./dist-vccrlib/vccrlib.js');
// 在这里定制修改用于判断文本文件中一行字符串是否应被忽略的条件
isLineCommented = function (line_string)
{ return false; }

function start() 
{
    
    vccrlib.startNewCheck("这是一段测试文本。這是一段測試，就幾句話怎樣？\n简体与繁体都打几个字上来");
    vccrlib.print_stati();
    
//     checkTextFile("TextFileName.txt");
    
//     eval(fs.readFileSync("test/test.js").toString());
    
}
start();

function checkTextFile(fileName)
{
    vccrlib.startNewCheck ( fs.readFileSync(fileName).toString() );
    console.log("```");
    console.log(`=== ${filename} =============`);
    vccrlib.print_stati();
    console.log("================================");
    console.log("```");
}
