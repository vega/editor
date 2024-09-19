#!/usr/bin/env bash

set -e

DATA=public/data
SPEC=public/spec

echo "Copying data to '$DATA'."
rm -rf "$DATA"
cp -R node_modules/vega-datasets/data/ "$DATA"

echo "Copy examples to '$SPEC'."

# without v!
VEGA_VERSION=$(scripts/version.sh vega)
VEGA_LITE_VERSION=$(scripts/version.sh vega-lite)

pushd /tmp
curl "https://github.com/vega/vega/archive/refs/tags/v$VEGA_VERSION.tar.gz" -L -o vega.tar.gz
curl "https://github.com/vega/vega-lite/archive/refs/tags/v$VEGA_LITE_VERSION.tar.gz" -L -o vl.tar.gz
tar xzf vega.tar.gz "vega-$VEGA_VERSION/docs"
tar xzf vl.tar.gz "vega-lite-$VEGA_LITE_VERSION/examples" "vega-lite-$VEGA_LITE_VERSION/site/_data"
popd

rm -rf "$SPEC"
mkdir -p "$SPEC/vega" "$SPEC/vega-lite"
cp "/tmp/vega-$VEGA_VERSION/docs/examples/"*.vg.json "$SPEC/vega"
cp "/tmp/vega-lite-$VEGA_LITE_VERSION/examples/specs/"*.vl.json "$SPEC/vega-lite/"

cp "/tmp/vega-lite-$VEGA_LITE_VERSION/site/_data/examples.json" "$SPEC/vega-lite/index.json"
cp "/tmp/vega-$VEGA_VERSION/docs/_data/examples.json" "$SPEC/vega/index.json"
