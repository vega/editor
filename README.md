# Vega Editor

The **Vega editor** is a web application for authoring and testing [Vega](http://github.com/vega/vega) visualizations. It includes a number of example specifications that showcase both the visual encodings and interaction techniques supported by Vega.

### Usage Instructions

To run the editor locally, you must first install the dependencies and then launch a local web server. We assume you have [npm](https://www.npmjs.com/) installed.

1. Run `npm run vendor` to install 3rd party vendor libraries. This command will first run `npm install` to download the dependencies, and then copy the needed files into the `vendor` folder.

2. Launch a local web server to run the editor. For example, if you have Python installed on your system, run `python -m SimpleHTTPServer 8000` in the top-level directory of this project and then point your browser to [http://localhost:8000/](http://localhost:8000/).

### Local Testing & Debugging

The editor is useful for testing if you are involved in Vega development. To use vega from another directory on your computer, use npm link. For this, run `npm link` in the vega directory and then `npm link vega` in the vega-editor directory. You can do the same for Vega-Lite (run `npm link` in Vega-Lite directory and `npm link vega-lite` here). Then link vega-lite and vega into `vendor` with `npm run link`.
