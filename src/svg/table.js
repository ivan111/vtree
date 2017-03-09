/* global d3 */


export function updateTables(node, nodeEnter, nodeUpdate, conf) {
  nodeEnter.filter(function (d) { return !d._vtIsDummy; })
    .append('path')
    .attr('class', 'vtree-table')
    .style('fill', 'white');

  nodeUpdate.selectAll('.vtree-table')
    .attr('d', createTableBorderPathFunc(conf));

  node.selectAll('g.vtree-row').remove();

  updateTableTexts(nodeUpdate, conf);

  updateDummyArray(nodeEnter, conf);
}


function createTableBorderPathFunc(conf) {
  return function (d) {
    var tbl = d._vtNameTbl;

    if (!tbl || tbl.length === 0) {
      return '';
    }

    var w2 = d._vtWidth / 2;

    // an outline border
    // an origin point is (center, top)
    var a = [];
    a.push(['M', -w2, 0].join(' '));
    a.push(['L', w2, 0].join(' '));
    a.push(['L', w2, d.h].join(' '));
    a.push(['L', -w2, d.h].join(' '));
    a.push('Z');

    // a vertical separator
    var nameW = d._vtMaxNameW;
    var sepX = -w2 + nameW;  // x of the vertical separator

    if (conf.showColumn[0] && conf.showColumn[1]) {
      a.push(['M', sepX, 0].join(' '));
      a.push(['L', sepX, d.h].join(' '));
    }

    // horizontal borders
    var y = d.h / tbl.length;
    var stepH = d.h / tbl.length;

    for (var i = 0; i < tbl.length; i++) {
      a.push(['M', -w2, y].join(' '));
      a.push(['L', w2, y].join(' '));

      y += stepH;
    }

    return a.join('');
  };
}


function updateTableTexts(nodes, conf) {
  var pad = conf.tdPadding;

  nodes.each(function (d) {
    var tbl = d._vtNameTbl;

    if (!tbl || tbl.length === 0) {
      return;
    }

    var w2 = d._vtWidth / 2;
    var nameW = d._vtMaxNameW;
    var sepX = -w2;

    if (conf.showColumn[0]) {
      sepX += nameW;
    }

    var stepH = d.h / tbl.length;

    d3.select(this).selectAll('g')
      .data(tbl)
      .enter()
      .append('g')
      .attr('class', 'vtree-row')
      .each(function (row, rowNo) {
        var d3row = d3.select(this);

        var h = stepH * (rowNo + 1) - 2 - pad;

        // name columns
        if (conf.showColumn[0]) {
          updateTableText(d3row, row[0],  -w2 + pad, h, 'vtree-name-col', conf);
        }

        // value columns
        if (conf.showColumn[1]) {
          updateTableText(d3row, row[1],  sepX + pad, h, 'vtree-val-col', conf);
        }
      });
  });
}


function updateTableText(d3row, d, x, y, clsName, conf) {
  d._vtOriginalVal = d.val || '';

  var val = createTableStr(d.val, conf.maxLen);

  var d3text = d3row.selectAll('text.' + clsName)
    .data([d])
    .enter()
    .append('text')
    .attr('class', clsName)
    .text(val)
    .attr('x', x)
    .attr('y', y)
    .style('font-size', conf.fontSize);

  d3text.filter(function (d) { return d._vtOriginalVal.length > conf.maxLen; })
    ;
    /*
    .on('mouseover', vt.d3.onMouseOver)
    .on('mouseout', vt.d3.onMouseOut);
    */
}


function createTableStr(s, maxLen) {
  s = s || '';

  if (s.length > maxLen) {
    s = s.substring(0, maxLen) + '...';
  }

  return s;
}


function updateDummyArray(nodeEnter, conf) {
  const r = conf.fontSize * 2 / 3;

  nodeEnter.filter(function (d) { return d._vtIsDummy; })
    .append('circle')
    .attr('class', 'vtree-dummy')
    .attr('cy', r )
    .attr('r', r );
}


export function calcMaxColumnWidth(tbl, col, ruler, conf) {
  if (!tbl || tbl.length === 0) {
    return 0;
  }

  var maxW = conf.fontSize / 2;

  if (col === 0) {
    var maxLen = conf.maxNameLen;
  } else {
    maxLen = conf.maxValueLen;
  }

  for (var i = 0; i < tbl.length; i++) {
    var name = tbl[i][col].val;
    name = createTableStr(name, maxLen);

    ruler.text(name);
    var w = ruler[0][0].offsetWidth;

    if (w > maxW) {
      maxW = w;
    }
  }

  ruler.text('');

  return maxW + (conf.tdPadding * 2);
}
