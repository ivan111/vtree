/* A 'node' consists of a link name text and a table which contains object fields. */

var curMaxId = 0;

import { updateLinkNames } from './linkName.js';
import { updateTables } from './table.js';


export function updateNodes(g, nodes, src, onClick, conf) {
  const node = g.selectAll('g.vtree-node')
    .data(nodes, function (d) {
      if (!d.id) {
        d.id = ++curMaxId;
      }

      return d.id;
    });

  // create nodes
  const nodeEnter = node.enter().append('g')
    .attr('class', 'vtree-node')
    .attr('transform', function () { return tranStr(src.x0, src.y0); })
    .style('opacity', 0)
    .on('click', onClick);

  // animation
  const nodeUpdate = node.transition()
    .duration(conf.duration)
    .attr('class', 'vtree-node')
    .attr('transform', function (d) { return tranStr(d.x, d.y); })
    .style('opacity', 1);

  // remove nodes
  node.exit().transition()
    .duration(conf.duration)
    .attr('transform', function () { return tranStr(src.x, src.y); })
    .style('opacity', 0)
    .remove();

  updateLinkNames(nodeEnter, nodeUpdate, conf);
  updateTables(node, nodeEnter, nodeUpdate, conf);
}


function tranStr(x, y) {
  return `translate(${x},${y})`;
}
