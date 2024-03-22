#!/bin/bash

mkdir -p dist-vccrlib
rm -rf dist-vccrlib/* 
( echo -e "\n\nGoing to build 'vccrlib'...\n\n" ; env buildtarget='vccrlib' npx webpack  )  || exit 1

mkdir -p dist-webtool
rm -rf dist-webtool/*  
( echo -e "\n\nGoing to build 'webtool'...\n\n" ; env buildtarget='webtool' npx webpack  )  || exit 1

