#!/bin/bash
TARGET=vendor
STAGE=gh_pages_stage

set -e

# Check if all files are commited
if [ ! -z "$(git status --porcelain)" ]; then
  echo "There are uncommitted files. Please commit or stash first!"
  git status
  exit 1
fi

# Check if gh-pages files are commited
git checkout gh-pages
if [ -z "$(git status --porcelain)" ]; then
  echo "All tracked files are commited. Publishing files to github pages."
else
  echo "There are uncommitted gh-pages files. Please commit or stash first!"
  git status
  git checkout master
  exit 1
fi
git checkout master

# Fresh npm install to ensure no dev changes are included
# move node modules out of the way so npm link remains
mv node_modules temp
npm install

# Ensure vendor dependencies
npm run vendor
rc=$?; if [[ $rc != 0 ]]; then
  echo 'Error while ensuring vendor dependencies.'
  exit 1;
fi

# Populate staging directory
rm -rf $STAGE
mkdir $STAGE
cp -r index.html app images vendor $STAGE

# Copy staged files to gh-pages
git checkout gh-pages
cp -r $STAGE/* .
rm -rf $STAGE

# Add, commit and push files
git add -A
git add app/vl-specs.js -f
git commit -m "Update deployed files."
git push origin gh-pages

# Restore state
git checkout master
rm -rf node_modules
mv temp node_modules
