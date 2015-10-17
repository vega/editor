#!/bin/bash

echo "Linking Vega-Lite"
npm link vega-lite
rm -f vendor/vega-lite.js
ln -s ../node_modules/vega-lite/vega-lite.js vendor/vega-lite.js

echo "Linking Vega"
npm link vega
rm -f vendor/vega.js vendor/vega.min.js vendor/vega.js.map vendor/vega-schema.json
ln -s ../node_modules/vega/vega.js vendor/vega.js
ln -s ../node_modules/vega/vega.min.js vendor/vega.min.js
ln -s ../node_modules/vega/vega.js.map vendor/vega.js.map
ln -s ../node_modules/vega/vega-schema.json vendor/vega-schema.json
