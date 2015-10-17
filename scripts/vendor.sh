#!/bin/bash
ACE=node_modules/ace-builds/src-min
TARGET=vendor
DATA=app/data

# Copy dependencies by default. Link if a -l flag is specified.
CWD=$(pwd)
VEGA_OP="cp"
VEGA_DATASETS_OP="cp"
VEGA_EMBED_OP="cp"

while getopts :l: FLAG; do
  case $FLAG in
    l) 
      echo "Linking '$OPTARG'."
      npm link $OPTARG
      OPTARG=$( echo ${OPTARG}_OP | tr '-' '_' | tr '[:lower:]' '[:upper:]' )
      eval $OPTARG="\"ln -sf\""
      echo 
  esac
done

echo "Copying dependencies to '$TARGET'."

if [ ! -d "$TARGET" ]; then
  mkdir $TARGET
fi

cp node_modules/d3/d3.min.js $TARGET
cp node_modules/d3-cloud/build/d3.layout.cloud.js $TARGET
cp node_modules/d3-geo-projection/d3.geo.projection.min.js $TARGET
cp node_modules/topojson/topojson.js $TARGET
eval $VEGA_OP "$CWD/node_modules/vega/vega*" $TARGET
eval $VEGA_EMBED_OP "$CWD/node_modules/vega-embed/vega-embed*" $TARGET

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

eval $VEGA_DATASETS_OP "$CWD/node_modules/vega-datasets/data/*" $DATA