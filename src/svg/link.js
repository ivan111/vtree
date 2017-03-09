/* global d3 */

const diagonal = d3.svg.diagonal()
  .projection(function (d) {
    if (d._vtIsArrayItem) {
      return [d.x, d.y + d.h / 2];
    } else {
      return [d.x, d.y];
    }
  });


export function updateLinks(g, links, src, conf) {
  const link = g.selectAll('path.vtree-link')
    .data(links, function (d) { return d.target.id; });

  // create links
  link.enter().insert('path', 'g')
    .attr('class', 'vtree-link')
    .attr('d', function () {
      const o = { x: src.x0, y: src.y0 };

      return diagonal({ source: o, target: o });
    })
    .style('fill', 'none')
    .style('stroke', '#888')
    .style('stroke-width', '2px')
    .style('opacity', 0);

  // animation
  link.transition()
    .duration(conf.duration)
    .attr('d', diagonal)
    .style('opacity', 1);

  // remove links
  link.exit().transition()
    .duration(conf.duration)
    .attr('d', function () {
      const o = { x: src.x, y: src.y };

      return diagonal({ source: o, target: o });
    })
    .style('opacity', 0)
    .remove();
}
