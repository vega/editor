#!/usr/bin/env bash
# requires https://www.gnu.org/software/parallel/

set -e

mkdir -p public/images/examples/vl
mkdir -p public/images/examples/vg

echo "Generating SVGs..."
cd public;

ls spec/vega-lite/*.vl.json | parallel --eta --halt 1 "../node_modules/.bin/vl2png {} images/examples/vl/{/.}.png"
ls spec/vega/*.vg.json | parallel --eta --halt 1 "../node_modules/.bin/vg2png {} images/examples/vg/{/.}.png"
