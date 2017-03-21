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

    const ww = w + pad * 2;



    return { width: Math.max(ww, width), height: height };
  }
}
