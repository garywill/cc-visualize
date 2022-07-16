#!/bin/bash

if [[ ! -f "ucd.all.flat.xml" ]]; then
     echo "Can't find ucd.all.flat.xml . Download it from https://www.unicode.org/Public/15.0.0/ucdxml/" >&2
     exit 1
fi

cp ucd.all.flat.xml  /tmp/ucd.xml

sed -i 's/<ucd xmlns=.*>$/<ucd>/g  ; s/^ *//g' /tmp/ucd.xml     # 去掉namespace。 去掉所有行的开头空格

sed -n '/<repertoire>/,/<\/repertoire>/p' /tmp/ucd.xml > /tmp/ucd.repertoire.xml        # 字符
sed    '/<repertoire>/,/<\/repertoire>/d' /tmp/ucd.xml > /tmp/ucd.no-repertoire.xml     # 除了字符外的信息


sed -i '/^<char /   s/\/>$/\n\/>/g ' /tmp/ucd.repertoire.xml            #  />       ---->  [\n]/>
sed -i '/^<char /   s/[^\/]>$/\n>/g ' /tmp/ucd.repertoire.xml           #   >       ---->  [\n]>
sed -i '/^<char /   s/" /"\n /g' /tmp/ucd.repertoire.xml                #  "[空格]   --->   "[\n][空格]


     # 去掉所有""（空字符串）的属性
grep -v -E '^ .*=""'  /tmp/ucd.repertoire.xml | grep  -E "(^\S)|(^ (age)|(na)|(gc=)|(blk)|(UIdeo)|(EqUIdeo)=)|(^ k)"  > /tmp/ucd.repertoire.xml.2

sed -i "s/^ k/  k/g" /tmp/ucd.repertoire.xml.2  # 把所有k开头的属性由一个空格在前变为两个空格在前

grep  -E "(^\S)|(^ \S)|(^  ((k.*Variant=)|(kHKGlyph=)|(kTGH=)))"  /tmp/ucd.repertoire.xml.2 > /tmp/ucd.repertoire.xml.3

cp /tmp/ucd.repertoire.xml.3  /tmp/ucd.repertoire.xml

cp /tmp/ucd.repertoire.xml /tmp/ucd.no-repertoire.xml  .
