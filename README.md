# Vega Editor [![Build Status](https://travis-ci.org/vega/editor.svg?branch=master)](https://travis-ci.org/vega/editor)

The **Vega editor** is a web application for authoring and testing [Vega](https://github.com/vega/vega) and [Vega-Lite](https://vega.github.io/vega-lite) visualizations. It includes a number of example specifications that showcase both the visual encodings and interaction techniques. It is deployed at https://vega.github.io/editor/. 

### Usage Instructions

To run the editor locally, you must first install the dependencies and then launch a local web server. We assume you have [yarn](https://yarnpkg.com/en/) installed.

1. Install the dependencies:

```
$ yarn
```

2. Start the server:

```
$ yarn start
```

3. The local web server will be accessible from (http://localhost:8080)[http://localhost:8080].

#### Docker

If you'd like to use [Docker](https://docs.docker.com/engine/docker-overview/), there's a [Docker Compose](https://docs.docker.com/compose/overview/) setup that you can use:

1. Run the Docker Compose service:

```
$ docker-compose up
```

2. The local web server will be accessible from (http://localhost:8080)[http://localhost:8080].

### Local Testing & Debugging

The editor is useful for testing if you are involved in Vega and Vega-Lite development. To use Vega, Vega-Lite, Vega Datasets, or Vega-Embed from another directory on your computer, link it into vendor. For this, run `yarn link` in the directory of the library that you want to link. Then, in this directory run `yarn link <name of library>`, e.g. `yarn link vega`.

For example, to link Vega, run

```bash
cd VEGA_DIR
yarn link

cd VEGA_EDITOR_DIR
yarn link vega
```

The Vega editor supports [React Developer Tools](https://github.com/facebook/react-devtools) and [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension).

### Creating a release on gh-pages

* Tag a new version with `yarn version`. Pre 1.x, update the minor version if there is a new feature. 
* Push the tag. Travis will automatically deploy the editor. 
