#!/bin/bash

if [ -z "$(git status --porcelain)" ]; then 
  git subtree pull --prefix app/data git@github.com:vega/vega-datasets.git gh-pages
else
  echo -e "\033[43;30mWARN\033[0m There are uncommited files, so vega-datasets has not been pulled."
fi