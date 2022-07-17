isLineCommented = function (line_string) {
    if ( ['#' , '[' , ';' ].includes( line_string[0] ) )
        return true;
}

var table_files_list = fs.readFileSync("test/tablefiles.txt").toString() .split("\n");

for ( filename of table_files_list )
{
    if ( ! filename )
        continue;
    
    checkTextFile("test/" + filename);
}
