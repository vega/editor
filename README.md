# Vega Editor

The **Vega editor** is a web application for authoring and testing [Vega](http://github.com/vega/vega) visualizations. It includes a number of example specifications that showcase both the visual encodings and interaction techniques supported by Vega.

### Usage Instructions

To run the editor locally, you must first install the dependencies and then launch a local web server. We assume you have [npm](https://www.npmjs.com/) installed.

1. Install the dependencies:

```
$ npm install
```

2. Start the server:

```
$ npm start
```

### Local Testing & Debugging

The editor is useful for testing if you are involved in Vega and Vega-Lite development. To use Vega, Vega-Lite, Vega Datasets, or Vega-Embed from another directory on your computer, link it into vendor. For this, run `npm link` in the directory of the library that you want to link. Then, in this directory run `npm link <name of library>`, e.g. `npm link vega`.

For example, to link Vega, run

```bash
cd VEGA_DIR
npm link

cd VEGA_EDITOR_DIR
npm link vega
```
