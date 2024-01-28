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
    sha1sum opencc-data/${opencc_file_list[i]}
    wget https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/${opencc_file_list[i]} -O opencc-data/${opencc_file_list[i]} || exit 1
    #curl https://raw.githubusercontent.com/BYVoid/OpenCC/master/data/dictionary/${opencc_file_list[i]} > opencc-data/${opencc_file_list[i]}


    git config user.name bot
    git config user.email bot@github.bot.none

    sha1sum opencc-data/${opencc_file_list[i]}
    git add opencc-data/${opencc_file_list[i]}
    git diff
    git commit -m "sync opencc  ${opencc_file_list[i]}"
    #git log

done

pushd .
cd opencc-data
node pre.js  || exit 1
git add -u opencc-data-*.js
git commit -m "run opencc pre.js"
popd

pushd .
cd summary-data
node pre.js   || exit 1
git add -u summary-data-*.js
git commit -m "run summary pre.js"
popd

git push 
