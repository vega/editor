#!/bin/bash

DATA=public/data
SPEC=public/spec
SCHEMA=schema

CWD=$(pwd)

echo "Copying data to '$DATA'."

if [ ! -d "$DATA" ]; then
  mkdir $DATA
fi

eval rsync -r "$CWD/node_modules/vega-datasets/data/*" $DATA

echo "Copy examples to '$SPEC'."

if [ ! -d "$SPEC" ]; then
  mkdir $SPEC
fi

eval rsync -r "$CWD/node_modules/vega/docs/examples/*.vg.json" "$SPEC/vega"
eval rsync -r "$CWD/node_modules/vega-lite/examples/specs/*.vl.json" "$SPEC/vega-lite/"

cp "$CWD/node_modules/vega-lite/_data/examples.json" "$SPEC/vega-lite/index.json"
cp "$CWD/node_modules/vega/docs/_data/examples.json" "$SPEC/vega/index.json"
