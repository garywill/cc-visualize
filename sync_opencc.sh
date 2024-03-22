#!/bin/bash

#uname -a
#pwd
#ls -la
#git branch -a
#git config --list
#git fetch origin main
git checkout main
git checkout .
git branch -a
#ls -la
#git log


opencc_file_list=(
HKVariants.txt
JPVariants.txt
STCharacters.txt
TSCharacters.txt
TWVariants.txt
)

for ((i=0; i<${#opencc_file_list[@]}; i++ ))
do
    sha1sum data/opencc-data/${opencc_file_list[i]}
    wget https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/${opencc_file_list[i]} -O data/opencc-data/${opencc_file_list[i]} || exit 1
    #curl https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/${opencc_file_list[i]} > data/opencc-data/${opencc_file_list[i]}


    git config user.name bot
    git config user.email bot@github.bot.none

    sha1sum data/opencc-data/${opencc_file_list[i]}
    git add data/opencc-data/${opencc_file_list[i]}
    git diff
    git commit -m "sync opencc  ${opencc_file_list[i]}"
    #git log

done

pushd .
cd data/opencc-data
node pre.js  || exit 1
git add -u data/opencc-data-*.json
git commit -m "run opencc pre.js"
popd

pushd .
cd data/summary-data
node pre.js   || exit 1
git add -u data/summary-data-*.json
git commit -m "run summary pre.js"
popd

git push 
