import Node from './node.js';
import ArrayLayout from '../layout/array.js';

const defaultLayout = new ArrayLayout();

export default class ArrayNode extends Node {
  constructor(nodes, layout) {
    if (!layout) {
      layout = defaultLayout;
    }

    super(null, nodes, layout);

    this.width = 0;
    this.height = 0;

    this.linkX = 0;
    this.linkY = 0;
  }

  _render() {
  }
}
