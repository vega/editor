import {ElkNode} from 'elkjs';
import {Size} from './measureText';

export type Positions = Record<string, {x: number; y: number}>;
export function ELKToPositions(node: ElkNode): Positions {
  const result: Positions = {};
  traverseELKNodes(node, (id, position, size) => {
    result[id] = {x: position.x + size.width / 2, y: position.y + size.height / 2};
  });
  return result;
}

/**
 * Traverses all nodes, besides the root, and calls the callback with its absolute position, size, and ID.
 */
function traverseELKNodes(
  rootNode: ElkNode,
  callback: (id: string, position: {x: number; y: number}, size: Size) => void
) {
  const toProcess = (rootNode?.children || []).map((n) => [n, {x: 0 as number, y: 0 as number}] as const);
  while (toProcess.length) {
    const [node, origin] = toProcess.pop();
    const position = {x: node.x + origin.x, y: node.y + origin.y};
    callback(node.id, position, {width: node.width, height: node.height});
    node.children.forEach((n) => toProcess.push([n, position]));
  }
}
