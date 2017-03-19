const pad = 4;

export default class LinkNameDecorator {
  constructor(linkName) {
    this.linkName = linkName;
  }

  render(g, oldG, width, height) {
    const t = g.append('text')
      .attr('x', Math.round(width / 2))
      .attr('y', -pad)
      .attr('text-anchor', 'middle')
      .text(this.linkName);

    const b = t.node().getBBox();
    const w = Math.ceil(b.width);
    // const h = Math.ceil(b.height);

    const ww = w + pad * 2;

    /*
    const hh = h + pad * 2;

    newG
      .attr('transform', `translate(0,${-hh})`);
    */

    return { width: Math.max(ww, width), height: height };
  }
}
