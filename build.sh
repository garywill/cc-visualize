#!/bin/bash


rm -rf dist-vccrlib/*  || exit 1
( echo -e "\n\nGoing to build 'vccrlib'...\n\n" ; env buildtarget='vccrlib' npx webpack  )  || exit 1

rm -rf dist-webtool/*  || exit 1
( echo -e "\n\nGoing to build 'webtool'...\n\n" ; env buildtarget='webtool' npx webpack  )  || exit 1

