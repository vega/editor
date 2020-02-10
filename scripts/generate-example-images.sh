#!/usr/bin/env bash
# requires https://www.gnu.org/software/parallel/

set -e

mkdir -p public/images/examples/vl
mkdir -p public/images/examples/vg

pushd public

echo "Generating PNGs for Vega-Lite..."
ls spec/vega-lite/*.vl.json | parallel --halt 1 "../node_modules/.bin/vl2vg {} | ../node_modules/.bin/vg2png > images/examples/vl/{/.}.png"

echo "Generating PNGs for Vega..."
ls spec/vega/*.vg.json | parallel --halt 1 "../node_modules/.bin/vg2png -b . {} > images/examples/vg/{/.}.png"

if hash image_optim 2>/dev/null; then
    echo "Compressing images..."
    image_optim -r images --allow-lossy --skip-missing-workers
else
    echo "Need image_optim to compress images."
fi

popd
