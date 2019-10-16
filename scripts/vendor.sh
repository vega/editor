#!/usr/bin/env bash

set -e

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

# without v!
VEGA_VERSION=$(scripts/version.sh vega)
VEGA_LITE_VERSION=$(scripts/version.sh vega-lite)

pushd /tmp
wget https://github.com/vega/vega/archive/v$VEGA_VERSION.tar.gz -O vega.tar.gz
wget https://github.com/vega/vega-lite/archive/v$VEGA_LITE_VERSION.tar.gz -O vl.tar.gz
tar xzf vega.tar.gz vega-$VEGA_VERSION/docs
tar xzf vl.tar.gz vega-lite-$VEGA_LITE_VERSION/examples vega-lite-$VEGA_LITE_VERSION/site/_data
popd

eval rsync -r "/tmp/vega-$VEGA_VERSION/docs/examples/*.vg.json" "$SPEC/vega"
eval rsync -r "/tmp/vega-lite-$VEGA_LITE_VERSION/examples/specs/*.vl.json" "$SPEC/vega-lite/"

cp "/tmp/vega-lite-$VEGA_LITE_VERSION/site/_data/examples.json" "$SPEC/vega-lite/index.json"
cp "/tmp/vega-$VEGA_VERSION/docs/_data/examples.json" "$SPEC/vega/index.json"
