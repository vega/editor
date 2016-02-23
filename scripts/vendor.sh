#!/bin/bash
ACE=node_modules/ace-builds/src-min
TARGET=vendor
DATA=app/data
SPEC=app/spec

# Copy dependencies by default. Link if a -l flag is specified.
CWD=$(pwd)
VEGA_OP="cp -R"
VEGA_DATASETS_OP="cp -R"
VEGA_EMBED_OP="cp -R"
VEGA_LITE_OP="cp -R"

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

# delete old vendor, data, and spec directories to start with a clean slate.
rm -rf $TARGET
rm -rf $DATA
rm -rf $SPEC

echo "Copying dependencies to '$TARGET'."

if [ ! -d "$TARGET" ]; then
  mkdir $TARGET
fi

cp node_modules/d3/d3.min.js $TARGET
cp node_modules/d3-cloud/build/d3.layout.cloud.js $TARGET
cp node_modules/d3-geo-projection/d3.geo.projection.min.js $TARGET
cp node_modules/topojson/build/topojson.js $TARGET
cp lib/json3-compactstringify.js $TARGET
eval $VEGA_OP "$CWD/node_modules/vega/vega*" $TARGET
eval $VEGA_EMBED_OP "$CWD/node_modules/vega-embed/vega-embed*" $TARGET
eval $VEGA_LITE_OP "$CWD/node_modules/vega-lite/vega-lite*" $TARGET

if [ ! -d "$TARGET/ace" ]; then
  mkdir $TARGET/ace
fi
cp $ACE/ace.js $TARGET/ace
cp $ACE/mode-json.js $TARGET/ace
cp $ACE/worker-json.js $TARGET/ace
cp $ACE/ext-searchbox.js $TARGET/ace

echo "Copying data to '$DATA'."

if [ ! -d "$DATA" ]; then
  mkdir $DATA
fi

eval $VEGA_DATASETS_OP "$CWD/node_modules/vega-datasets/data/*" $DATA

echo "Copy examples to '$SPEC'."

if [ ! -d "$SPEC" ]; then
  mkdir $SPEC
fi

eval $VEGA_OP "$CWD/node_modules/vega/examples" "$SPEC/vega"
eval $VEGA_LITE_OP "$CWD/node_modules/vega-lite/examples/specs" "$SPEC/vega-lite"
echo "var VL_SPECS = "`cat $CWD/node_modules/vega-lite/examples/vl-examples.json` > app/vl-specs.js
