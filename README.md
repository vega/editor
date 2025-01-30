# Vega Editor [![Build Status](https://github.com/vega/editor/workflows/Test/badge.svg)](https://github.com/vega/editor/actions) [![Deploy to Pages](https://github.com/vega/editor/actions/workflows/publish.yml/badge.svg)](https://github.com/vega/editor/actions/workflows/publish.yml)

The **Vega editor** is a web application for authoring and testing [Vega](https://github.com/vega/vega) and [Vega-Lite](https://vega.github.io/vega-lite) visualizations. It includes a number of example specifications that showcase both the visual encodings and interaction techniques. It is deployed at https://vega.github.io/editor/.

We integrated a back-end service at https://vega-editor-backend.vercel.app/ which lets a user log in through GitHub so that they can access his/her personal gists. The code for the backend is at https://github.com/vega/editor-backend.

## Editor is stuck

You can reset the Vega Editor by going to https://vega.github.io/editor/#/reset and clicking the reset button. This will reset the saved editor state.

## Usage Instructions

### Run Vega-Editor With Docker
```bash
sudo docker run -it --rm -p 1234:1234 node:21 bash -xc 'mkdir -p vega/editor && git clone --depth=1 https://github.com/vega/editor.git vega/editor && cd vega/editor && yarn && yarn start'
```

### Development Setup
We assume you have [yarn](https://yarnpkg.com/), `bash`, `curl`, and `tar` installed.

Your working copy of this git repository must be located at least two levels below the system root `/`.
E.g. `/home/user/editor` or `/vega/editor`, but not `/editor`. 

Inside your working copy ...

1. Install the dependencies:  
   `$ yarn`

2. Launch the local web server:  
   `$ yarn start`

3. The local web server will be accessible via [http://localhost:1234](http://localhost:1234).

## Local Testing & Debugging

The editor is useful for testing if you are involved in Vega and Vega-Lite development. To use Vega, Vega-Lite, or Vega Datasets from another directory on your computer, you need to link it. For this, run `yarn link` in the directory of the library that you want to link. Then, in this directory run `yarn link <name of library>`, e.g. `yarn link vega` or `yarn link vega-lite`.

For example, to link Vega, run

```bash
cd VEGA_DIR
yarn link

cd VEGA_LITE_DIR
yarn link

cd VEGA_EDITOR_DIR
yarn link vega
yarn link vega-lite
```

The Vega editor supports [React Developer Tools](https://github.com/facebook/react-devtools) and [Redux DevTools](https://github.com/zalmoxisus/redux-devtools-extension).

## Building preview images

Build images with `yarn generate-example-images`.

## Contributing guidelines

We welcome contributions and promptly review pull requests. For instructions about how to contribute, please follow the [Vega-Lite contributing guidelines](https://github.com/vega/vega-lite/blob/master/CONTRIBUTING.md).

## Creating a release on gh-pages

Run the publish action at https://github.com/vega/editor/actions/workflows/publish.yml.

## State of Changes from Original Repository

This fork of the Vega editor includes the following modifications:

- Added support for vega-label bitmap history visualization:
   - New visualization components for displaying bitmap history
   - Enhanced rendering capabilities for bitmap-based visualizations