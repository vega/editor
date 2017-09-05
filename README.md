# Vega Editor

The **Vega editor** is a web application for authoring and testing [Vega](http://github.com/vega/vega) visualizations. It includes a number of example specifications that showcase both the visual encodings and interaction techniques supported by Vega.

### Usage Instructions

To run the editor locally, you must first install the dependencies and then launch a local web server. We assume you have [yarn](https://yarnpkg.com/en/) installed.

1. Install the dependencies:

```
$ yarn install
```

2. Start the server:

```
$ yarn start
```

### Local Testing & Debugging

The editor is useful for testing if you are involved in Vega and Vega-Lite development. To use Vega, Vega-Lite, Vega Datasets, or Vega-Embed from another directory on your computer, link it into vendor. For this, run `yarn link` in the directory of the library that you want to link. Then, in this directory run `yarn link <name of library>`, e.g. `yarn link vega`.

For example, to link Vega, run

```bash
cd VEGA_DIR
yarn link

cd VEGA_EDITOR_DIR
yarn link vega
```

### Creating a release

* Install the latest versions of vega, vega-lite, and vega-datasets
* `yarn run vendor`
* `yarn run generate-example-images` (requires https://www.gnu.org/software/parallel/)
* `yarn run build`


