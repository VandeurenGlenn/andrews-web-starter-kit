#!/bin/bash

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"
REF=$(git rev-parse --verify HEAD)
MSG="Deployed to Github pages: ${REF}"

mkdir -p .gh-pages-tmp
cp www/** .gh-pages-tmp -r

cd .gh-pages-tmp
git init
git add .
git commit -m "${MSG}"

git push -f "https://github.com/vandeurenglenn/andrews-web-starter-kit" $SOURCE_BRANCH:$TARGET_BRANCH > /dev/null 2>&1
cd ../
rm -rf .gh-pages-tmp
