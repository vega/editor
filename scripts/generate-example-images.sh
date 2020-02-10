#!/usr/bin/env bash
# requires https://www.gnu.org/software/parallel/

set -e

mkdir -p public/images/examples/vl
mkdir -p public/images/examples/vg

cd public;

echo "Generating PNGs for Vega-Lite..."
ls spec/vega-lite/*.vl.json | parallel --halt 1 "../node_modules/.bin/vl2vg {} | ../node_modules/.bin/vg2png > images/examples/vl/{/.}.png"

echo "Generating PNGs for Vega..."
ls spec/vega/*.vg.json | parallel --halt 1 "../node_modules/.bin/vg2png -b . {} > images/examples/vg/{/.}.png"

echo "Compressing images..."
yarn tinypng public/images -r
