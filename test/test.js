/*
 * 此文件被../cli.js调用，并非直接运行
 * 路径应由上级算
 */

// isLineCommented = function (line_string) {
//     if ( [ '#' , '[' , ';' , '.' , '-' , ' ' , '\t' ].includes( line_string[0] ) )
//         return true;
// }

var table_files_list = fs.readFileSync("test/tablefiles.txt").toString() .split("\n");

for ( var  filename of table_files_list )
{
    if ( ! filename )
        continue;
    
    checkTextFile("test/" + filename);
}
