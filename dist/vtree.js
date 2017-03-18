var vtree =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 5);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLinkNames = updateLinkNames;
exports.calcLinkNameWidth = calcLinkNameWidth;
function updateLinkNames(nodeEnter, nodeUpdate, conf) {
  nodeEnter.filter(function (d) {
    return d._vtLinkName;
  }).append('text').attr('class', 'vtree-link-name');

  nodeUpdate.selectAll('.vtree-link-name').text(function (d) {
    if (!conf.showLinkName) {
      return '';
    }

    return createLinkNameStr(d, conf);
  }).attr('y', -conf.fontSize / 3).attr('text-anchor', 'middle').style('font-size', conf.fontSize);
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

function calcLinkNameWidth(d, ruler, conf) {
  var s = createLinkNameStr(d, conf);

  ruler.text(s);
  var w = ruler[0][0].offsetWidth;
  ruler.text('');

  return w;
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateTables = updateTables;
exports.calcMaxColumnWidth = calcMaxColumnWidth;
/* global d3 */

function updateTables(node, nodeEnter, nodeUpdate, conf) {
  nodeEnter.append('path').attr('class', 'vtree-table');

  nodeUpdate.selectAll('.vtree-table').attr('d', createTableBorderPathFunc(conf));

  node.selectAll('g.vtree-row').remove();

  updateTableTexts(nodeUpdate, conf);
}

function createTableBorderPathFunc(conf) {
  return function (d) {
    var tbl = d._vtNameTbl;

    if (!tbl || tbl.length === 0) {
      return '';
    }

    var w2 = d._vtTableWidth / 2;

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
    var sepX = -w2 + nameW; // x of the vertical separator

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

    var w2 = d._vtTableWidth / 2;
    var nameW = d._vtMaxNameW;
    var sepX = -w2;

    if (conf.showColumn[0]) {
      sepX += nameW;
    }

    var stepH = d.h / tbl.length;

    d3.select(this).selectAll('g').data(tbl).enter().append('g').attr('class', 'vtree-row').each(function (row, rowNo) {
      var d3row = d3.select(this);

      var h = stepH * (rowNo + 1) - 2 - pad;

      // name columns
      if (conf.showColumn[0]) {
        updateTableText(d3row, row[0], -w2 + pad, h, 'vtree-name-col', conf);
      }

      // value columns
      if (conf.showColumn[1]) {
        updateTableText(d3row, row[1], sepX + pad, h, 'vtree-val-col', conf);
      }
    });
  });
}

function updateTableText(d3row, d, x, y, clsName, conf) {
  d._vtOriginalVal = d.val || '';

  var val = createTableStr(d.val, conf.maxLen);

  var d3text = d3row.selectAll('text.' + clsName).data([d]).enter().append('text').attr('class', clsName).text(val).attr('x', x).attr('y', y).style('font-size', conf.fontSize);

  d3text.filter(function (d) {
    return d._vtOriginalVal.length > conf.maxLen;
  });
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

function calcMaxColumnWidth(tbl, col, ruler, conf) {
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

  return maxW + conf.tdPadding * 2;
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* global d3 */

exports.default = function () {
  var hierarchy = d3.layout.hierarchy().sort(null).value(null);
  var separation = d3_layout_vtreeSeparation;
  var hSep = d3_layout_vtreeHSeparation;
  var nodeSize = null;

  function calcNodeSize(root) {
    if (!nodeSize) {
      return;
    }

    d3_layout_hierarchyVisitAfter(root, function (d) {
      var size = nodeSize(d);

      d.w = size[0];
      d.h = size[1];
    });
  }

  function updateArea(areas, depth, left, leftNode, right, rightNode) {
    if (areas[depth] === undefined) {
      areas[depth] = { left: left, leftNode: leftNode, right: right, rightNode: rightNode };
    }

    if (left < areas[depth].left) {
      areas[depth].left = left;
      areas[depth].leftNode = leftNode;
    }

    if (right > areas[depth].right) {
      areas[depth].right = right;
      areas[depth].rightNode = rightNode;
    }
  }

  function calcOverlap(children) {
    var overlap = [];

    for (var i = 0; i < children.length - 1; i++) {
      overlap[i] = 0;
    }

    for (i = 0; i < children.length; i++) {
      for (var j = i + 1; j < children.length; j++) {
        var a1 = children[i]._vtAreas;
        var a2 = children[j]._vtAreas;

        var relX1 = children[i]._vtRelX;
        var relX2 = children[j]._vtRelX;

        var len = Math.min(a1.length, a2.length);

        var maxOverlapWidth = 0;

        for (var k = 0; k < len; k++) {
          if (a1[k] === undefined || a2[k] === undefined) {
            break;
          }

          var sep = separation(a1[k].rightNode, a2[k].leftNode);

          var ol = sep + (relX1 + a1[k].right) - (relX2 + a2[k].left);

          if (ol > 0 && ol > maxOverlapWidth) {
            maxOverlapWidth = ol;
          }
        }

        for (k = i; k < j; k++) {
          maxOverlapWidth -= overlap[k];
        }

        if (maxOverlapWidth <= 0) {
          continue;
        }

        var w = maxOverlapWidth / (j - i);

        for (k = i; k < j; k++) {
          overlap[k] += w;
        }
      }
    }

    return overlap;
  }

  function mergeAreas(children) {
    var areas = [];
    var sum = 0;
    var overlap = [];
    var sumOverlap;

    // calc width sum
    for (var i = 0; i < children.length; i++) {
      children[i]._vtRelX = sum + children[i].w / 2;

      if (i === children.length - 1) {
        sep = 0;
      } else {
        sep = separation(children[i], children[i + 1]);
      }

      sum += sep + children[i].w;
    }

    overlap = calcOverlap(children);
    if (overlap.length === 0) {
      sumOverlap = 0;
    } else {
      sumOverlap = d3.sum(overlap);
    }

    // update relX
    if (sumOverlap !== 0) {
      sum = 0;

      for (i = 0; i < children.length; i++) {
        children[i]._vtRelX = sum + children[i].w / 2;

        if (i === children.length - 1) {
          var ol = 0;
          var sep = 0;
        } else {
          ol = overlap[i];
          sep = separation(children[i], children[i + 1]);
        }

        sum += sep + children[i].w + ol;
      }
    }

    var w2 = sum / 2;

    for (i = 0; i < children.length; i++) {
      children[i]._vtRelX -= w2;
    }

    // create areas
    for (i = 0; i < children.length; i++) {
      var a1 = children[i]._vtAreas;
      var relX1 = children[i]._vtRelX;

      for (var k = 0; k < a1.length; k++) {
        updateArea(areas, k + 1, relX1 + a1[k].left, a1[k].leftNode, relX1 + a1[k].right, a1[k].rightNode);
      }
    }

    areas[0] = { left: -w2, leftNode: children[0], right: w2, rightNode: children[children.length - 1] };

    return areas;
  }

  function calcRange(root) {
    if (!root.children) {
      var w2 = root.w / 2;

      return [-w2, w2];
    }

    var minLeft = 0;
    var maxRight = 0;

    d3_layout_hierarchyVisitBefore(root, function (d) {
      if (d.parent) {
        d.x = d.parent.x + d._vtRelX;
      } else {
        d.x = 0;
      }

      w2 = d.w / 2;
      var left = d.x - w2;
      var right = d.x + w2;

      if (left < minLeft) {
        minLeft = left;
      }

      if (right > maxRight) {
        maxRight = right;
      }
    });

    return [minLeft, maxRight];
  }

  function calcX(root) {
    d3_layout_hierarchyVisitAfter(root, function (d) {
      var areas;

      if (!d.children || d.children.length === 0) {
        areas = [];
      } else {
        areas = mergeAreas(d.children);
      }

      d._vtAreas = areas;
    });

    var rng = calcRange(root);
    var width = rng[1] - rng[0];

    d3_layout_hierarchyVisitBefore(root, function (d) {
      if (d.parent) {
        d.x = d.parent.x + d._vtRelX;
      } else {
        d.x = -rng[0];
      }
    });

    return width;
  }

  function calcY(root) {
    var depthMaxHeight = [];

    // calc depthMaxHeight
    d3_layout_hierarchyVisitBefore(root, function (d) {
      if (depthMaxHeight[d.depth] === undefined) {
        depthMaxHeight[d.depth] = 0;
      }

      if (d.h > depthMaxHeight[d.depth]) {
        depthMaxHeight[d.depth] = d.h;
      }
    });

    d3_layout_hierarchyVisitAfter(root, function (d) {
      var extY = 0;

      for (var i = 0; i < d.depth; i++) {
        extY += depthMaxHeight[i];
      }

      d.y = extY + hSep(d.depth);
    });

    // calc height
    var height = 0;

    for (var i = 0; i < depthMaxHeight.length; i++) {
      height += depthMaxHeight[i];
    }

    height += hSep(depthMaxHeight.length - 1);

    return height;
  }

  function vtree(d, i, size) {
    var nodes = hierarchy.call(this, d, i);
    var root = nodes[0];

    calcNodeSize(root);

    var w = calcX(root);
    var h = calcY(root);

    if ((typeof size === 'undefined' ? 'undefined' : _typeof(size)) === 'object') {
      size.width = w;
      size.height = h;
    }

    return nodes;
  }

  vtree.separation = function (f) {
    if (!arguments.length) {
      return separation;
    }

    separation = f;

    return vtree;
  };

  vtree.hSeparation = function (f) {
    if (!arguments.length) {
      return hSep;
    }

    hSep = f;

    return vtree;
  };

  vtree.nodeSize = function (f) {
    if (!arguments.length) {
      return nodeSize;
    }

    nodeSize = f;

    return vtree;
  };

  return d3_layout_hierarchyRebind(vtree, hierarchy);
};

function d3_layout_vtreeSeparation(a, b) {
  if (a.parent === b.parent) {
    return 1;
  }

  return 2;
}

function d3_layout_vtreeHSeparation(depth) {
  return depth * 50;
}

function d3_layout_hierarchyVisitBefore(node, callback) {
  var nodes = [node];

  while (nodes.length !== 0) {
    node = nodes.pop();

    callback(node);

    var children = node.children;

    if (children) {
      var n = children.length;

      while (--n >= 0) {
        nodes.push(children[n]);
      }
    }
  }
}

function d3_layout_hierarchyVisitAfter(node, callback) {
  var nodes = [node];
  var nodes2 = [];

  while (nodes.length !== 0) {
    node = nodes.pop();

    nodes2.push(node);

    var children = node.children;

    if (children) {
      var i = -1;
      var n = children.length;

      while (++i < n) {
        nodes.push(children[i]);
      }
    }
  }

  while (nodes2.length !== 0) {
    node = nodes2.pop();

    callback(node);
  }
}

function d3_layout_hierarchyLinks(nodes) {
  return d3.merge(nodes.map(function (parent) {
    var result = [];
    var children = parent.children || [];
    var i;

    for (i = 0; i < children.length; i++) {
      var child = children[i];

      if (child._vtIsArrayItem) {
        if (child._vtArrayIndex === 0) {
          if (!parent._vtIsDummyRoot) {
            result.push({ source: parent, target: child });
          }
        } else {
          result.push({ source: children[i - 1], target: child });
        }
      } else {
        result.push({ source: parent, target: child });
      }
    }

    return result;
  }));
}

function d3_layout_hierarchyRebind(object, hierarchy) {
  d3.rebind(object, hierarchy, 'sort', 'children', 'value');
  object.nodes = object;
  object.links = d3_layout_hierarchyLinks;

  return object;
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLinks = updateLinks;
/* global d3 */

var diagonal = d3.svg.diagonal().projection(function (d) {
  if (d._vtIsArrayItem) {
    return [d.x, d.y + d.h / 2];
  } else {
    return [d.x, d.y];
  }
});

function updateLinks(g, links, src, conf) {
  var link = g.selectAll('path.vtree-link').data(links, function (d) {
    return d.target.id;
  });

  // create links
  link.enter().insert('path', 'g').attr('class', 'vtree-link').attr('d', function () {
    var o = { x: src.x0, y: src.y0 };

    return diagonal({ source: o, target: o });
  }).style('opacity', 0);

  // animation
  link.transition().duration(conf.duration).attr('d', function (d) {
    if (d.target._vtArrayIndex) {
      var srcX = d.source.x;
      var srcY = d.source.y + d.source.h / 2;

      var dstX = d.target.x;
      var dstY = d.target.y + d.target.h / 2;

      return 'M' + srcX + ',' + srcY + 'L' + dstX + ',' + dstY;
    }

    return diagonal(d);
  }).style('opacity', 1);

  // remove links
  link.exit().transition().duration(conf.duration).attr('d', function () {
    var o = { x: src.x, y: src.y };

    return diagonal({ source: o, target: o });
  }).style('opacity', 0).remove();
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateNodes = updateNodes;

var _linkName = __webpack_require__(0);

var _table = __webpack_require__(1);

/* A 'node' consists of a link name text and a table which contains object fields. */

var curMaxId = 0;

function updateNodes(g, nodes, src, onClick, conf) {
  var node = g.selectAll('g.vtree-node').data(nodes, function (d) {
    if (!d.id) {
      d.id = ++curMaxId;
    }

    return d.id;
  });

  // create nodes
  var nodeEnter = node.enter().append('g').attr('class', 'vtree-node').attr('transform', function () {
    return tranStr(src.x0, src.y0);
  }).style('opacity', 0).on('click', onClick);

  // animation
  var nodeUpdate = node.transition().duration(conf.duration).attr('class', 'vtree-node').attr('transform', function (d) {
    return tranStr(d.x, d.y);
  }).style('opacity', 1);

  // remove nodes
  node.exit().transition().duration(conf.duration).attr('transform', function () {
    return tranStr(src.x, src.y);
  }).style('opacity', 0).remove();

  (0, _linkName.updateLinkNames)(nodeEnter, nodeUpdate, conf);
  (0, _table.updateTables)(node, nodeEnter, nodeUpdate, conf);
}

function tranStr(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global d3 */

/**
 * hidden node variables prefix '_vt'.
 *
 * - _vtChildren : node's children
 *
 * - _vtNameTbl : array. each item is [{ val: name }, { val: val }]
 * - _vtLinkName : link name displayed above the node table.
 * - _vtOriginalVal : this keeps the original field value even if the displayed value is ellipted.
 * - _vtIsDummyRoot : true if the original root is array.
 *
 * - _vtMaxNameW : max name fields widths
 * - _vtMaxValW : max value fields widths
 * - _vtTableWidth : _vtMaxNameW + _vtMaxValW
 *
 * - _vtIsArrayItem : true if the node is an array item
 * - _vtArrayIndex : an array index
 * - _vtArrayName : for setting link names of arrays
 */

var _layoutVtree = __webpack_require__(2);

var _layoutVtree2 = _interopRequireDefault(_layoutVtree);

var _link = __webpack_require__(3);

var _node = __webpack_require__(4);

var _linkName = __webpack_require__(0);

var _table = __webpack_require__(1);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WIDTH = 960;
var HEIGHT = 800;
var MARGIN = 20;

module.exports = function (container) {
  var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return new VTree(container, config);
};

var VTree = function () {
  function VTree(container) {
    _classCallCheck(this, VTree);

    this.container = container;

    this.initConf();
    this.initD3Objects();
  }

  _createClass(VTree, [{
    key: 'initConf',
    value: function initConf() {
      this._conf = {
        fontSize: 14,
        heightFactor: 5,
        nodeMargin: 20,
        tdPadding: 4,
        duration: 768,
        showColumn: [true, true],
        showLinkName: true,
        maxNameLen: 32,
        maxValueLen: 32
      };

      this.width = WIDTH - MARGIN * 2;
      this.height = HEIGHT - MARGIN * 2;

      this.containerLeft = this.container.getBoundingClientRect().left;
      this.containerTop = this.container.getBoundingClientRect().top;
    }
  }, {
    key: 'initD3Objects',
    value: function initD3Objects() {
      this.d3 = {};

      this.d3.container = d3.select(this.container).text('').style('position', 'relative');

      this.d3.zoomListener = d3.behavior.zoom().scaleExtent([1, 10]).on('zoom', createZoomFunc(this));

      this.d3.svg = this.d3.container.append('svg').attr('xmlns', 'http://www.w3.org/2000/svg').attr('class', 'vtree').attr('width', this.width).attr('height', this.height).call(this.d3.zoomListener);

      this.d3.g = this.d3.svg.append('g').attr('transform', tranStr(MARGIN, MARGIN));

      // the ruler for the width of the string contained by an SVG element
      this.d3.ruler = this.d3.container.append('span').text('').style('visibility', 'hidden').style('white-space', 'nowrap').style('font', this._conf.fontSize + 'px sans-serif');

      this.d3.tooltip = this.d3.container.append('div').attr('class', 'vtree-tooltip').style('opacity', 0);

      this.d3.tree = (0, _layoutVtree2.default)().children(createChildrenFunc(this)).separation(createSeparationFunc(this)).hSeparation(createHSeparationFunc(this)).nodeSize(createNodeSizeFunc(this));

      this.d3.onMouseOver = createTooltipOnMouseOverFunc(this);
      this.d3.onMouseOut = createTooltipOnMouseOutFunc(this);
    }
  }, {
    key: 'onError',
    value: function onError(listener) {
      this.onErrorListener = listener;

      return this;
    }
  }, {
    key: 'data',
    value: function data(_data) {
      if (!_data) {
        this.root = null;

        return this;
      }

      var type = typeof _data === 'undefined' ? 'undefined' : _typeof(_data);

      if (type === 'string') {
        var json = str2json(_data);

        type = typeof json === 'undefined' ? 'undefined' : _typeof(json);
      } else {
        json = _data;
      }

      if (isPrimitive(json)) {
        json = { name: json };
      } else if (Array.isArray(json)) {
        json = { children: json, _vtIsDummyRoot: true };
      }

      this.root = json;

      if (this.root) {
        setVtreeInfo(this.root);

        // an start pos of transition
        this.root.x0 = this.width / 2;
        this.root.y0 = this.height / 2;
      } else {
        if (this.onErrorListener) {
          this.onErrorListener('Parse Error');
        }
      }

      return this;
    }
  }, {
    key: 'update',
    value: function update(src) {
      if (!src) {
        if (!this.root) {
          return this;
        }

        src = this.root;
      }

      var treeSize = {};

      var nodes = this.d3.tree(this.root, undefined, treeSize);
      var links = this.d3.tree.links(nodes);

      (0, _node.updateNodes)(this.d3.g, nodes, src, this.onClickNode, this._conf);
      (0, _link.updateLinks)(this.d3.g, links, src, this._conf);

      var y = 0;
      var w = treeSize.width + MARGIN * 2;
      var h = treeSize.height + MARGIN * 2;

      if (this.root._vtIsDummyRoot) {
        y = 50; // TODO: should be literal. see function d3_layout_vtreeHSeparation in layout.vtree.js
      }

      this.d3.svg.attr('viewBox', '0 ' + y + ' ' + w + ' ' + h);

      // store an old position for transition
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });

      return this;
    }
  }, {
    key: 'onClickNode',
    value: function onClickNode() {
      // TODO: create event listner mechanism
    }
  }, {
    key: 'size',
    value: function size(width, height) {
      var w = getNumberConf(width, 32, 8096);
      var h = getNumberConf(height, 32, 8096);

      if (w === null || h === null) {
        return this;
      }

      this.width = width;
      this.height = height;

      this.d3.svg.attr('width', width).attr('height', height);

      return this;
    }
  }, {
    key: 'conf',
    value: function conf(name, val) {
      var cf = this._conf;

      switch (name) {
        case 'showLinkName':
          cf.showLinkName = !!val;
          break;

        case 'showColumn0':
          cf.showColumn[0] = !!val;

          if (cf.showColumn[0] === false) {
            cf.showColumn[1] = true;
          }
          break;

        case 'showColumn1':
          cf.showColumn[1] = !!val;

          if (cf.showColumn[1] === false) {
            cf.showColumn[0] = true;
          }
          break;

        case 'fontSize':
          setNumberConf(cf, name, val, 9, 32);

          this.d3.ruler.style('font-size', cf.fontSize + 'px');

          break;

        case 'heightFactor':
          setNumberConf(cf, name, val, 1, 10);
          break;

        case 'nodeMargin':
          setNumberConf(cf, name, val, 1, 100);
          break;

        case 'animeDuration':
          setNumberConf(cf, 'duration', val, 10, 10000);
          break;

        case 'maxNameLen':
          setNumberConf(cf, name, val, 1, 1024);
          break;

        case 'maxValueLen':
          setNumberConf(cf, name, val, 1, 1024);
          break;

        default:
          break;
      }

      return this;
    }
  }]);

  return VTree;
}();

function getNumberConf(val, start, end) {
  if (typeof val !== 'number') {
    return null;
  }

  if (start && val < start) {
    return start;
  }

  if (end && val > end) {
    return end;
  }

  return val;
}

function setNumberConf(conf, name, val, start, end) {
  var v = getNumberConf(val, start, end);

  if (v !== null) {
    conf[name] = v;
    return true;
  }

  return false;
}

function addField(d, name, val) {
  if (!d._vtNameTbl) {
    d._vtNameTbl = [];
  }

  d._vtNameTbl.push([{ val: name }, { val: val }]);
}

function setLinkName(d, name, index) {
  if (index || index === 0) {
    name = ['[', index, ']'].join('');
  }

  d._vtLinkName = name;
}

function addChildNode(d, name, child, index) {
  if (!d._vtChildren) {
    d._vtChildren = [];
  }

  setLinkName(child, name, index);

  d._vtChildren.push(child);
}

function setVtreeInfo(d) {
  for (var name in d) {
    if (!d.hasOwnProperty(name)) {
      continue;
    }

    if (name.startsWith('_vt')) {
      continue;
    }

    var data = d[name];
    delete d[name];

    if (Array.isArray(data)) {
      if (data.length === 0 || data.every(isPrimitive)) {
        addField(d, name, arr2str(data));
      } else {
        for (var i = 0; i < data.length; i++) {
          var item = data[i];

          setVtreeInfoForArrayItem(d, name, item, i);
        }
      }
    } else if (data !== null && (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
      addChildNode(d, name, data, null);
      setVtreeInfo(data);
    } else {
      addField(d, name, data);
    }
  }
}

function arr2str(arr) {
  var tmp = [];

  arr.forEach(function (d) {
    tmp.push('' + d);
  });

  return '[' + tmp.join(', ') + ']';
}

function setVtreeInfoForArrayItem(d, name, item, i) {
  if (isPrimitive(item)) {
    item = { name: item };
  }

  item._vtIsArrayItem = true;
  item._vtArrayName = name;
  item._vtArrayIndex = i;

  addChildNode(d, name, item, i);
  setVtreeInfo(item);
}

function isPrimitive(d) {
  var type = typeof d === 'undefined' ? 'undefined' : _typeof(d);

  if (d === null || type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  return false;
}

function str2json(text) {
  try {
    var data = JSON.parse(text);
  } catch (e) {
    text = text.replace(/([{,])\s*([^':\[\]{},\s]+)\s*:/g, function (match, sep, s) {
      return [sep, ' \'', s, '\':'].join('');
    });

    text = text.replace(/:\s*([^',\[\]{}\s]+)\s*([,}])/g, function (match, s, sep) {
      return [': \'', s, '\'', sep].join('');
    });

    try {
      data = JSON.parse(text);
    } catch (err) {
      return null;
    }
  }

  return data;
}

function createZoomFunc(vt) {
  return function () {
    var transform = ['translate(', d3.event.translate, ')scale(', d3.event.scale, ')'].join('');

    vt.d3.g.attr('transform', transform);
  };
}

function createChildrenFunc() {
  return function (d) {
    var children = null;

    if (d._vtChildren && d._vtChildren.len !== 0) {
      children = d._vtChildren.slice(0); // copy

      if (children.length === 0) {
        children = null;
      }
    }

    return children;
  };
}

function createSeparationFunc(vt) {
  return function (a, b) {
    if (a.parent !== b.parent) {
      return vt._conf.nodeMargin * 2;
    }

    return vt._conf.nodeMargin;
  };
}

function createHSeparationFunc(vt) {
  return function (depth) {
    return depth * (vt._conf.fontSize * vt._conf.heightFactor);
  };
}

function createNodeSizeFunc(vt) {
  return function (d) {
    var fontSize = vt._conf.fontSize;
    var pad = vt._conf.tdPadding;
    var linkNameW = 0;

    if (d._vtLinkName && vt._conf.showLinkName) {
      linkNameW = (0, _linkName.calcLinkNameWidth)(d, vt.d3.ruler, vt._conf);
    }

    var tbl = d._vtNameTbl;

    var maxNameW = 0;
    var maxValW = 0;

    if (!tbl || tbl.length === 0) {
      var maxW = fontSize + pad * 2;
      var sumH = fontSize + pad * 2;
    } else {
      if (vt._conf.showColumn[0]) {
        maxNameW = (0, _table.calcMaxColumnWidth)(tbl, 0, vt.d3.ruler, vt._conf);
      }

      if (vt._conf.showColumn[1]) {
        maxValW = (0, _table.calcMaxColumnWidth)(tbl, 1, vt.d3.ruler, vt._conf);
      }

      maxW = maxNameW + maxValW;
      sumH = (fontSize + pad * 2) * tbl.length;
    }

    d._vtTableWidth = maxW;
    d._vtMaxNameW = maxNameW;
    d._vtMaxValW = maxValW;

    if (linkNameW > maxW) {
      maxW = linkNameW;
    }

    return [maxW, sumH];
  };
}

function createTooltipOnMouseOverFunc(vt) {
  return function (d) {
    vt.d3.tooltip.transition().duration(200).style('opacity', 0.9);

    vt.d3.tooltip.text(d._vtOriginalVal).style('left', d3.event.pageX - vt.containerLeft + 'px').style('top', d3.event.pageY - vt.containerTop - vt._conf.fontSize + 'px');
  };
}

function createTooltipOnMouseOutFunc(vt) {
  return function onMouseOut() {
    vt.d3.tooltip.transition().duration(500).style('opacity', 0);

    vt.d3.tooltip.text('');
  };
}

function tranStr(x, y) {
  return 'translate(' + x + ',' + y + ')';
}

/***/ })
/******/ ]);