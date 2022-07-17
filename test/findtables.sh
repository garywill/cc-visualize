#!/bin/bash

find repos/ |grep -E "\.txt$" > all-files.txt

echo "" >tablefiles.txt
while read -r file 
do
    filesize=$(du -k $file | awk '{print $1}')
    filelines=$(wc $file | awk '{print $1}')
    
#     if [[ $filesize -gt 95 && $filelines -gt 2000 ]]; then
    if [[  $filelines -gt 2500 ]]; then
        echo $file >> tablefiles.txt
    else
        echo "忽略文件（不判断为码表） $file"
    fi
done < all-files.txt

# 看看码表文件用什么作注释语法 ( [ ; # )
# while read -r tablefile 
# do
#     head -n 30 $tablefile
# done < tablefiles.txt

