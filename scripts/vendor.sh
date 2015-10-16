#!/bin/bash
ACE=node_modules/ace-builds/src-min
TARGET=vendor
DATA=app/data

echo "Copying dependencies to '$TARGET'."

if [ ! -d "$TARGET" ]; then
  mkdir $TARGET
fi

cp node_modules/d3/d3.min.js $TARGET
cp node_modules/d3-cloud/build/d3.layout.cloud.js $TARGET
cp node_modules/d3-geo-projection/d3.geo.projection.min.js $TARGET
cp node_modules/topojson/topojson.js $TARGET
cp node_modules/vega-lite/vega-lite.js $TARGET
cp node_modules/vega/vega* $TARGET
cp node_modules/vega-embed/vega-embed* $TARGET
cp lib/json3-compactstringify.js $TARGET

if [ ! -d "$TARGET/ace" ]; then
  mkdir $TARGET/ace
fi
cp $ACE/ace.js $TARGET/ace
cp $ACE/mode-json.js $TARGET/ace
cp $ACE/worker-json.js $TARGET/ace

echo "Copying data to '$DATA'."

if [ ! -d "$DATA" ]; then
  mkdir $DATA
fi

cp node_modules/vega-datasets/data/* $DATA