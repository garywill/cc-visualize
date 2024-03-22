#!/bin/bash


rm -rf dist-*/*  || exit 1
npx webpack    || exit 1


