export function updateLinkNames(nodeEnter, nodeUpdate, conf) {
  nodeEnter.filter(function (d) { return d._vtLinkName; })
    .append('text')
    .attr('class', 'vtree-link-name');

  nodeUpdate.selectAll('.vtree-link-name')
    .text(function (d) {
      if (!conf.showLinkName) {
        return '';
      }

      return createLinkNameStr(d, conf);
    })
    .attr('y', -conf.fontSize / 3)
      .attr('text-anchor', 'middle')
      .style('font-size', conf.fontSize);
}


function createLinkNameStr(d, conf) {
  var s;

  if (d._vtIsArrayItem) {
    s = [d._vtArrayName, '[', d._vtArrayIndex, ']'].join('');
  } else {
    s = d._vtLinkName || '';
  }

  if (s.length > conf.maxNameLen) {
    s = s.substring(0, conf.maxNameLen) + '...';
  }

  return s;
}


export function calcLinkNameWidth(d, ruler, conf) {
  const s = createLinkNameStr(d, conf);

  ruler.text(s);
  const w = ruler[0][0].offsetWidth;
  ruler.text('');

  return w;
}
