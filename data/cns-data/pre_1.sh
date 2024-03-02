#!/bin/bash

# cat cns11643/Properties/CNS_source.txt | awk '{$1=""; print $0}'  | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' |uniq|sort|uniq

cat cns11643/Properties/CNS_source.txt | grep '常用國字標準字體表' | awk '{print $1}' > 常用國字標準字體表.cns.txt
cat cns11643/Properties/CNS_source.txt | grep '次常用字國字標準字體表' | awk '{print $1}' > 次常用字國字標準字體表.cns.txt
cat cns11643/Properties/CNS_source.txt | grep '國中小教科書常用字' | awk '{print $1}' > 國中小教科書常用字.cns.txt
