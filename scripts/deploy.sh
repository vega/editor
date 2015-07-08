#!/bin/bash
TARGET=vendor
STAGE=gh_pages_stage

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

# Ensure vendor dependencies
if [ ! -z "$(npm run vendor)" ]; then
  echo 'Error while ensuring vendor dependencies.'
  exit 1
fi

# Populate staging directory
rm -rf $STAGE
mkdir $STAGE
cp -r index.html app vendor $STAGE

# Copy staged files to gh-pages
git checkout gh-pages
cp -r $STAGE/* .
rm -rf $STAGE

# Add, commit and push files
git add -A
git commit -m "Update deployed files."
git push origin gh-pages

# Restore state
git checkout master
