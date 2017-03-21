/* global d3 */

const MARGIN = 10;
const HEIGHT = 50;
const DURATION = 1000;

const diagonal = d3.svg.diagonal();


export default class TreeLayout {
  constructor() {
  }

  layout(node) {
    calcChildrenWidth(node);
    calcTotalSize(node);

    layout(node);
  }

  renderLinks(node) {
    renderLinks(node);
  }
}


function layout(node) {
  if (node.children.length === 0) {
    return;
  }

  var x = -Math.floor(node.childrenWidth / 2) + Math.floor(node.width / 2);

  node.children.forEach((child) => {
    child.x = x + Math.round((child.totalWidth - child.width) / 2);
    child.y = node.height + HEIGHT;

    child.g
      .transition()
      .duration(DURATION)
      .attr('transform', `translate(${child.x},${child.y})`);

    x += child.totalWidth + MARGIN;
  });
}


function renderLinks(node) {
  const src = {
    x: node.linkX,
    y: node.linkY
  };

  node.children.forEach((child) => {
    const dst = {
      x: child.x + child.linkX,
      y: child.y + child.linkY
    };

    if (child.constructor.name === 'ArrayNode') {
      if (child.children.length !== 0) {
        const gc = child.children[0]
        dst.x += gc.x + gc.linkX;
        dst.y += gc.y + gc.linkY;
      }
    }

    const link = node.g.insert('path', ':first-child')
      .attr('class', 'vtree-link')
      .attr('d', function () {
        return diagonal({ source: src, target: src });
      });

    link
      .transition()
      .duration(DURATION)
      .attr('d', function () {
        return diagonal({ source: src, target: dst });
      });
  });
}


function calcChildrenWidth(node) {
  if (node.children.length === 0) {
    node.childrenWidth = 0;

    return;
  }

  var w = 0;

  node.children.forEach((child) => {
    w += child.totalWidth;
  });

  w += (node.children.length - 1) * MARGIN;

  node.childrenWidth = w;
}


function calcTotalSize(node) {
  if (node.children.length === 0) {
    node.totalWidth = node.width;
    node.totalHeight = node.height;

    return;
  }

  node.totalWidth = Math.max(node.width, node.childrenWidth);

  var h = 0;

  node.children.forEach((child) => {
    h = Math.max(h, child.totalHeight);
  });

  node.totalHeight = node.height + HEIGHT + h;
}
