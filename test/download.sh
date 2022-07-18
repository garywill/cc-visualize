#!/bin/bash

TOKEN=$(cat github-token.txt)

mkdir -p repos/

while read -r repourl
do
    user="$(echo "$repourl"  |  cut -d/  -f4 )"
    repo="$(echo "$repourl"  |  cut -d/  -f5 )"

    default_branch=$( curl -u "$TOKEN" https://api.github.com/repos/$user/$repo | jq -r '.["default_branch"] ' )

    
    wget https://github.com/$user/$repo/zipball/$default_branch/ -O repos/$user_$repo.zip 
    
    unzip repos/$user_$repo.zip -d repos/
    
    
   
done < rime-repo-list.txt
    

