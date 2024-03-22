#!/bin/bash

echo "" > vccrlib.js

cat vccrlib_headtext.js >> vccrlib.js

cat common.js \
    init.js \
    ucd.js \
    unusual_conditions.js \
    print_check.js \
    checkessay.js \
    vccrlib_export.js \
        >> vccrlib.js



