import {scheme} from 'vega-scale';
import {colorKeys} from './graph';

// Use these color schemes for the nodes
// https://vega.github.io/vega/docs/schemes/#categorical
const colorScheme: string[] = [...scheme('tableau20'), ...scheme('category20b')];

const computedStyle = getComputedStyle(document.documentElement);
export const fontFamily = computedStyle.getPropertyValue('--base-font-family');
export const fontSize = computedStyle.getPropertyValue('font-size');
export const style: cytoscape.Stylesheet[] = [
  {
    selector: 'node, edge',
    style: {
      'font-family': fontFamily,
      'font-size': fontSize,
    },
  },
  {
    selector: 'node',
    style: {
      // Labels
      'text-wrap': 'wrap',
      'text-valign': 'center',
      'text-halign': 'center',

      'background-opacity': 0.6,
      shape: 'round-rectangle',
      width: 'data(width)',
      height: 'data(width)',
      label: 'data(label)',
      padding: '8px',
      color: 'black',
    } as any,
  },
  {
    selector: ':parent',
    style: {
      'text-valign': 'top',
      'background-opacity': 0.05,
    },
  },
  {
    selector: ':selected',
    style: {
      'overlay-opacity': 0.05,
    },
  },
  {
    selector: 'node.around-selected',
    style: {
      'overlay-opacity': 0.05,
    },
  },
  {
    selector: 'edge',
    css: {
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'text-background-padding': '5',
      'text-background-shape': 'round-rectangle' as any,
      'text-background-color': 'white',
      'text-background-opacity': 1,
      'text-rotation': 'autorotate',
      width: 1,
    },
  },
  {
    selector: 'edge[label]',
    css: {
      label: 'data(label)',
    },
  },
  {
    selector: 'edge[primary="true"]',
    css: {
      color: 'black',
      'line-color': 'black',
      'target-arrow-color': 'black',
    },
  },
  {
    selector: 'edge[primary="false"]',
    css: {
      color: '#ddd',
      'line-color': '#ddd',
      'target-arrow-color': '#ddd',
    },
  },
  // Add types for operator types as well as other types
  ...colorKeys.map((t, i) => ({
    selector: `node[colorKey=${JSON.stringify(t)}]`,
    style: {'background-color': colorScheme[i % colorScheme.length]},
  })),
];
