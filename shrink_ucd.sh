#!/bin/bash

cp unicode-data/ucd.all.flat.xml  /tmp/ucd.xml

sed -i 's/<ucd xmlns=.*>$/<ucd>/g  ; s/^ *//g' /tmp/ucd.xml 

sed -n '/<repertoire>/,/<\/repertoire>/p' /tmp/ucd.xml > /tmp/ucd.repertoire.xml
sed    '/<repertoire>/,/<\/repertoire>/d' /tmp/ucd.xml > /tmp/ucd.no-repertoire.xml


sed -i '/^<char /   s/\/>$/\n\/>/g ' /tmp/ucd.repertoire.xml 
sed -i '/^<char /   s/[^\/]>$/\n>/g ' /tmp/ucd.repertoire.xml 
sed -i '/^<char /   s/" /"\n /g' /tmp/ucd.repertoire.xml 

#grep -v -E '^ .*=""'  /tmp/ucd.repertoire.xml | grep  -E "(^\S)|(^ (age)|(na)=)|(^ kIRG_)|(^ kCompatibilityVariant)|(^ kBigFive)|(^ kCCCII)|(^ kDefinition)|(^ kGB)|(^ kJis)|(^ kKPS)|(^ kHKSCS)|(^ kMainlandTelegraph)|(^ k.*Variant)"  > /tmp/ucd.repertoire.xml.2
grep -v -E '^ .*=""'  /tmp/ucd.repertoire.xml | grep  -E "(^\S)|(^ (age)|(na)|(blk)=)|(^ k)"  > /tmp/ucd.repertoire.xml.2
grep  -E "(^\S)|(^ (age)|(na)|(blk)=)|(^ k.*Variant)|(^ kIICore)|(^ kIRG_)|(^ kFrequency)|(^ kStrange)"  /tmp/ucd.repertoire.xml.2 > /tmp/ucd.repertoire.xml.3
cp /tmp/ucd.repertoire.xml.3  /tmp/ucd.repertoire.xml
