/* global d3 */

import Node from './node/node.js';
import StringNode from './node/string.js';
import TableNode from './node/table.js';
import ArrayNode from './node/array.js';

import TreeLayout from './layout/tree.js';
import ArrayLayout from './layout/array.js';

import ObjectReader from './reader/object.js';

import { visitAfter } from './util.js';


const WIDTH = 960;
const HEIGHT = 800;
const MARGIN = 20;


class VTree {
  constructor(container) {
    this.root = new ArrayNode([], new ArrayLayout({ hideLinks: true }));

    this.defaultLayout = new TreeLayout();

    this.container = container;

    this.d3 = {};

    this.d3.container = d3.select(this.container)
      .style('position', 'relative');

    this.d3.zoomListener = d3.behavior.zoom()
      .scaleExtent([1, 10])
      .on('zoom', () => {
        const e = d3.event;

        if (this.d3.g) {
          this.d3.g.attr('transform', `translate(${e.translate})scale(${e.scale})`);
        }
      });

    this.d3.svg = this.d3.container.append('svg')
      .attr('class', 'vtree')
      .attr('width', WIDTH)
      .attr('height', HEIGHT)
      .call(this.d3.zoomListener);
  }

  data(data) {
    if (Array.isArray(data)) {
      this.root.children = data;
    } else {
      this.root.children = [data];
    }

    return this;
  }

  createTreeGroups(parentG, depth) {
    var hasChildren = false;

    const g = parentG
      .selectAll('g.vtree-node')
      .data(function (d) {
        if (d.children.length !== 0) {
          hasChildren = true;
        }

        return d.children;
      })
      .enter()
      .append('g')
      .attr('class', 'vtree-node')
      .each(function (d) {
        d.g = d3.select(this);
      });

    if (hasChildren) {
      this.createTreeGroups(g, depth + 1);
    }
  }

  update() {
    const root = {
      id: 1,
      children: [this.root]
    };

    this.d3.svg.selectAll('*').remove();

    const g = this.d3.svg.selectAll('g.vtree-root')
      .data([root])
      .enter()
      .append('g')
      .attr('class', 'vtree-root');

    this.d3.g = g;

    this.createTreeGroups(g, 0);

    visitAfter(this.root, (node) => {
      node.render(node.g);

      const layout = node.layout || this.defaultLayout;

      layout.layout(node);

      if (layout.renderLinks) {
        layout.renderLinks(node);
      }
    });

    const x = Math.round((WIDTH - this.root.totalWidth) / 2);
    var y = Math.round((HEIGHT - this.root.totalHeight) / 2);

    if (y < MARGIN) {
      y = MARGIN;
    }

    this.root.g.attr('transform', `translate(${x},${y})`);

    return this;
  }
}


VTree.node = {};
VTree.node.Node = Node;
VTree.node.String = StringNode;
VTree.node.Table = TableNode;
VTree.node.Array = ArrayNode;

VTree.layout = {};
VTree.layout.Tree = TreeLayout;
VTree.layout.Array = ArrayLayout;

VTree.reader = {};
VTree.reader.Object = ObjectReader;

module.exports = VTree;
