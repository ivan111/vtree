var VTree =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

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

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Node
 *
 * A tree consists of nodes and links.
 * A node consists of the following fields:
 *
 * - id : auto increment ID.
 * - data : data which may be displayed.
 *          The data format is determined by the renderer.
 * - children : children of the node
 */

var curMaxId = 0;

var Node = function () {
  function Node(data, children, layout) {
    _classCallCheck(this, Node);

    this.id = ++curMaxId;
    this.data = data;
    this.children = children;

    if (layout) {
      this.layout = layout;
    }

    this.width = 0;
    this.height = 0;

    this.decorators = [];
  }

  _createClass(Node, [{
    key: 'render',
    value: function render(g) {
      var _this = this;

      if (this.decorators.length === 0) {
        this._render(g);
        return;
      }

      var prevG = g.append('g');
      this._render(prevG);

      this.decorators.forEach(function (decorator) {
        var newG = g.append('g');

        var size = decorator.render(newG, prevG, _this.width, _this.height);
        _this.width = size.width;
        _this.height = size.height;

        prevG = newG;
      });
    }
  }, {
    key: '_render',
    value: function _render() {
      throw new Error('[no overwride errror] _render is not implemented.');
    }
  }]);

  return Node;
}();

exports.default = Node;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global d3 */

var MARGIN = 10;
var DURATION = 1000;

var diagonal = d3.svg.diagonal();

var ArrayLayout = function () {
  function ArrayLayout(options) {
    _classCallCheck(this, ArrayLayout);

    if (options) {
      if (options.hideLinks) {
        this.hideLinks = true;
      }
    }
  }

  _createClass(ArrayLayout, [{
    key: 'layout',
    value: function layout(node) {
      calcChildrenWidth(node);
      calcTotalSize(node);

      _layout(node);
    }
  }, {
    key: 'renderLinks',
    value: function renderLinks(node) {
      if (!this.hideLinks) {
        _renderLinks(node);
      }
    }
  }]);

  return ArrayLayout;
}();

exports.default = ArrayLayout;


function _layout(node) {
  if (node.children.length === 0) {
    return;
  }

  var x = -Math.floor(node.childrenWidth / 2) + Math.floor(node.width / 2);

  node.children.forEach(function (child) {
    child.x = x + Math.round((child.totalWidth - child.width) / 2);
    child.y = 0;

    child.g.transition().duration(DURATION).attr('transform', 'translate(' + child.x + ',' + child.y + ')');

    x += child.totalWidth + MARGIN;
  });
}

function _renderLinks(node) {
  if (node.children.length === 0) {
    return;
  }

  /*
  var minH = node.children[0].height;
   node.children.forEach((child) => {
    minH = Math.min(minH, child.height);
  });
   const h = Math.round(minH / 2);
  */

  var orig = { x: 0, y: 0 };

  var i, src, dst;

  for (i = 0; i < node.children.length; i++) {
    if (i === 0) {
      continue;
    }

    var prev = node.children[i - 1];
    var child = node.children[i];

    src = {
      x: prev.x + prev.linkX,
      y: prev.y + prev.linkY
    };

    dst = {
      x: child.x + child.linkX,
      y: child.y + child.linkY
    };

    var link = node.g.insert('path', ':first-child').attr('class', 'vtree-link').attr('d', function () {
      return diagonal({ source: orig, target: orig });
    });

    link.transition().duration(DURATION).attr('d', function () {
      return diagonal({ source: src, target: dst });
    });
  }
}

function calcChildrenWidth(node) {
  if (node.children.length === 0) {
    node.childrenWidth = 0;

    return;
  }

  var w = 0;

  node.children.forEach(function (child) {
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

  node.children.forEach(function (child) {
    h = Math.max(h, child.totalHeight);
  });

  node.totalHeight = h;
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _node = __webpack_require__(0);

var _node2 = _interopRequireDefault(_node);

var _array = __webpack_require__(1);

var _array2 = _interopRequireDefault(_array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultLayout = new _array2.default();

var ArrayNode = function (_Node) {
  _inherits(ArrayNode, _Node);

  function ArrayNode(nodes, layout) {
    _classCallCheck(this, ArrayNode);

    if (!layout) {
      layout = defaultLayout;
    }

    var _this = _possibleConstructorReturn(this, (ArrayNode.__proto__ || Object.getPrototypeOf(ArrayNode)).call(this, null, nodes, layout));

    _this.width = 0;
    _this.height = 0;

    _this.linkX = 0;
    _this.linkY = 0;
    return _this;
  }

  _createClass(ArrayNode, [{
    key: '_render',
    value: function _render() {}
  }]);

  return ArrayNode;
}(_node2.default);

exports.default = ArrayNode;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _node = __webpack_require__(0);

var _node2 = _interopRequireDefault(_node);

var _util = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StringNode = function (_Node) {
  _inherits(StringNode, _Node);

  function StringNode(data, children) {
    _classCallCheck(this, StringNode);

    var _this = _possibleConstructorReturn(this, (StringNode.__proto__ || Object.getPrototypeOf(StringNode)).call(this, data, children));

    _this.textPad = 4;
    return _this;
  }

  _createClass(StringNode, [{
    key: '_render',
    value: function _render(g) {
      var bbox = (0, _util.appendRectText)(g, 0, 0, this.data, this.textPad);

      this.width = bbox.width;
      this.height = bbox.height;

      this.linkX = Math.round(this.width / 2);
      this.linkY = Math.round(this.height / 2);
    }
  }]);

  return StringNode;
}(_node2.default);

exports.default = StringNode;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _node = __webpack_require__(0);

var _node2 = _interopRequireDefault(_node);

var _util = __webpack_require__(5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TableNode = function (_Node) {
  _inherits(TableNode, _Node);

  function TableNode(data, children) {
    _classCallCheck(this, TableNode);

    var _this = _possibleConstructorReturn(this, (TableNode.__proto__ || Object.getPrototypeOf(TableNode)).call(this, data, children));

    _this.textPad = 4;
    return _this;
  }

  _createClass(TableNode, [{
    key: '_render',
    value: function _render(g) {
      if (this.data.length === 0 || this.data[0].length === 0) {
        return;
      }

      var tbl = this.renderCells(g);
      var size = this.layoutCells(tbl);

      this.width = size.width;
      this.height = size.height;

      this.linkX = Math.round(this.width / 2);
      this.linkY = Math.round(this.height / 2);
    }
  }, {
    key: 'renderCells',
    value: function renderCells(g) {
      var _this2 = this;

      var tbl = [];

      this.data.forEach(function (row) {
        var tblRow = [];

        row.forEach(function (col) {
          var colG = g.append('g');
          var bbox = (0, _util.appendRectText)(colG, 0, 0, col, _this2.textPad);

          tblRow.push({
            g: colG,
            bbox: bbox
          });
        });

        tbl.push(tblRow);
      });

      return tbl;
    }
  }, {
    key: 'layoutCells',
    value: function layoutCells(tbl) {
      var maxW = this.calcMaxWidths(tbl);
      var maxH = this.calcMaxHeights(tbl);

      var x = 0;
      var y = 0;

      tbl.forEach(function (row, rowI) {
        x = 0;

        row.forEach(function (col, colI) {
          col.g.attr('transform', 'translate(' + x + ',' + y + ')');
          col.g.select('rect').attr('width', maxW[colI]).attr('height', maxH[rowI]);

          x += maxW[colI];
        });

        y += maxH[rowI];
      });

      return { width: x, height: y };
    }
  }, {
    key: 'calcMaxWidths',
    value: function calcMaxWidths(tbl) {
      var maxW = [];
      var colI, rowI;

      for (colI = 0; colI < tbl[0].length; colI++) {
        var w = 0;

        for (rowI = 0; rowI < tbl.length; rowI++) {
          w = Math.max(w, tbl[rowI][colI].bbox.width);
        }

        maxW.push(w);
      }

      return maxW;
    }
  }, {
    key: 'calcMaxHeights',
    value: function calcMaxHeights(tbl) {
      var maxH = [];

      tbl.forEach(function (row) {
        var h = 0;

        row.forEach(function (col) {
          h = Math.max(h, col.bbox.height);
        });

        maxH.push(h);
      });

      return maxH;
    }
  }]);

  return TableNode;
}(_node2.default);

exports.default = TableNode;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.appendRectText = appendRectText;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BBox = exports.BBox = function BBox() {
  var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var width = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var height = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  _classCallCheck(this, BBox);

  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
};

function appendRectText(g, x, y, text, pad) {
  var rect = g.append('rect').attr('class', getClassName(text));

  var t = g.append('text').text(text);

  var b = t.node().getBBox();
  var w = Math.ceil(b.width);
  var h = Math.ceil(b.height);

  t.attr('x', x + pad).attr('y', y + pad + h);

  var bbox = new BBox(x, y, w + pad * 2, h + pad * 2);

  rect.attr('x', bbox.x).attr('y', bbox.y).attr('width', bbox.width).attr('height', bbox.height);

  return bbox;
}

function getClassName(d) {
  var name = '';
  var type = typeof d === 'undefined' ? 'undefined' : _typeof(d);

  if (d === null) {
    return 'null-text';
  } else if (type === 'string') {
    name = 'string-text';
  } else if (type === 'number') {
    name = 'number-text';
  } else if (type === 'boolean') {
    name = 'boolean-text';
  } else {
    name = 'unknown-text';
  }

  return name;
}

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global d3 */

var MARGIN = 10;
var HEIGHT = 50;
var DURATION = 1000;

var diagonal = d3.svg.diagonal();

var TreeLayout = function () {
  function TreeLayout() {
    _classCallCheck(this, TreeLayout);
  }

  _createClass(TreeLayout, [{
    key: 'layout',
    value: function layout(node) {
      calcChildrenWidth(node);
      calcTotalSize(node);

      _layout(node);
    }
  }, {
    key: 'renderLinks',
    value: function renderLinks(node) {
      _renderLinks(node);
    }
  }]);

  return TreeLayout;
}();

exports.default = TreeLayout;


function _layout(node) {
  if (node.children.length === 0) {
    return;
  }

  var x = -Math.floor(node.childrenWidth / 2) + Math.floor(node.width / 2);

  node.children.forEach(function (child) {
    child.x = x + Math.round((child.totalWidth - child.width) / 2);
    child.y = node.height + HEIGHT;

    child.g.transition().duration(DURATION).attr('transform', 'translate(' + child.x + ',' + child.y + ')');

    x += child.totalWidth + MARGIN;
  });
}

function _renderLinks(node) {
  var src = {
    x: node.linkX,
    y: node.linkY
  };

  node.children.forEach(function (child) {
    var dst = {
      x: child.x + child.linkX,
      y: child.y + child.linkY
    };

    if (child.constructor.name === 'ArrayNode') {
      if (child.children.length !== 0) {
        var gc = child.children[0];
        dst.x += gc.x + gc.linkX;
        dst.y += gc.y + gc.linkY;
      }
    }

    var link = node.g.insert('path', ':first-child').attr('class', 'vtree-link').attr('fill', 'none').attr('stroke', '#888').attr('stroke-width', 2).attr('d', function () {
      return diagonal({ source: src, target: src });
    });

    link.transition().duration(DURATION).attr('d', function () {
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

  node.children.forEach(function (child) {
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

  node.children.forEach(function (child) {
    h = Math.max(h, child.totalHeight);
  });

  node.totalHeight = node.height + HEIGHT + h;
}

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _string = __webpack_require__(3);

var _string2 = _interopRequireDefault(_string);

var _array = __webpack_require__(2);

var _array2 = _interopRequireDefault(_array);

var _table = __webpack_require__(4);

var _table2 = _interopRequireDefault(_table);

var _dummy = __webpack_require__(10);

var _dummy2 = _interopRequireDefault(_dummy);

var _linkName = __webpack_require__(9);

var _linkName2 = _interopRequireDefault(_linkName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ObjectReader = function () {
  function ObjectReader() {
    _classCallCheck(this, ObjectReader);
  }

  _createClass(ObjectReader, [{
    key: 'read',
    value: function read(obj) {
      return obj2node(obj, '');
    }
  }]);

  return ObjectReader;
}();

exports.default = ObjectReader;


function obj2node(obj, linkName) {
  var node;

  if (isPrimitive(obj)) {
    node = new _string2.default(obj, []);
  } else if (Array.isArray(obj)) {
    var nodes = [];

    obj.forEach(function (item, i) {
      if (Array.isArray(item)) {
        nodes.push(new _dummy2.default(obj2node(item, '')));
      } else {
        node = obj2node(item, linkName + '[' + i + ']');
        nodes.push(node);
      }
    });

    node = new _array2.default(nodes);
  } else {
    var name;
    var tbl = [];
    var children = [];

    for (name in obj) {
      if (!obj.hasOwnProperty(name)) {
        continue;
      }

      var data = obj[name];

      if (isPrimitive(data)) {
        tbl.push([name, data]);
      } else {
        children.push(obj2node(data, name));
      }
    }

    if (tbl.length === 0) {
      node = new _table2.default([[' ', ' ']], children);
    } else {
      node = new _table2.default(tbl, children);
    }
  }

  if (linkName !== '' && node.constructor.name !== 'ArrayNode') {
    node.decorators.push(new _linkName2.default(linkName));
  }

  return node;
}

function isPrimitive(d) {
  var type = typeof d === 'undefined' ? 'undefined' : _typeof(d);

  if (d === null || type === 'string' || type === 'number' || type === 'boolean') {
    return true;
  }

  return false;
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.visitBefore = visitBefore;
exports.visitAfter = visitAfter;
function visitBefore(node, callback) {
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

function visitAfter(node, callback) {
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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var pad = 4;

var LinkNameDecorator = function () {
  function LinkNameDecorator(linkName) {
    _classCallCheck(this, LinkNameDecorator);

    this.linkName = linkName;
  }

  _createClass(LinkNameDecorator, [{
    key: 'render',
    value: function render(g, oldG, width, height) {
      var t = g.append('text').attr('x', Math.round(width / 2)).attr('y', -pad).attr('text-anchor', 'middle').text(this.linkName);

      var b = t.node().getBBox();
      var w = Math.ceil(b.width);
      // const h = Math.ceil(b.height);

      var ww = w + pad * 2;

      /*
      const hh = h + pad * 2;
       newG
        .attr('transform', `translate(0,${-hh})`);
      */

      return { width: Math.max(ww, width), height: height };
    }
  }]);

  return LinkNameDecorator;
}();

exports.default = LinkNameDecorator;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _node = __webpack_require__(0);

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DummyNode = function (_Node) {
  _inherits(DummyNode, _Node);

  function DummyNode(child) {
    _classCallCheck(this, DummyNode);

    var _this = _possibleConstructorReturn(this, (DummyNode.__proto__ || Object.getPrototypeOf(DummyNode)).call(this, null, [child]));

    _this.r = 4;
    return _this;
  }

  _createClass(DummyNode, [{
    key: '_render',
    value: function _render(g) {
      g.append('circle').attr('cx', this.r).attr('cy', this.r).attr('r', this.r);

      this.width = this.r * 2;
      this.height = this.r * 2;

      this.linkX = this.r;
      this.linkY = this.r;
    }
  }]);

  return DummyNode;
}(_node2.default);

exports.default = DummyNode;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global d3 */

var _node = __webpack_require__(0);

var _node2 = _interopRequireDefault(_node);

var _string = __webpack_require__(3);

var _string2 = _interopRequireDefault(_string);

var _table = __webpack_require__(4);

var _table2 = _interopRequireDefault(_table);

var _array = __webpack_require__(2);

var _array2 = _interopRequireDefault(_array);

var _tree = __webpack_require__(6);

var _tree2 = _interopRequireDefault(_tree);

var _array3 = __webpack_require__(1);

var _array4 = _interopRequireDefault(_array3);

var _object = __webpack_require__(7);

var _object2 = _interopRequireDefault(_object);

var _util = __webpack_require__(8);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WIDTH = 960;
var HEIGHT = 800;
var MARGIN = 20;

var VTree = function () {
  function VTree(container) {
    var _this = this;

    _classCallCheck(this, VTree);

    this.root = new _array2.default([], new _array4.default({ hideLinks: true }));

    this.defaultLayout = new _tree2.default();

    this.container = container;

    this.d3 = {};

    this.d3.container = d3.select(this.container).style('position', 'relative');

    this.d3.zoomListener = d3.behavior.zoom().scaleExtent([1, 10]).on('zoom', function () {
      var e = d3.event;

      if (_this.d3.g) {
        _this.d3.g.attr('transform', 'translate(' + e.translate + ')scale(' + e.scale + ')');
      }
    });

    this.d3.svg = this.d3.container.append('svg').attr('class', 'vtree').attr('width', WIDTH).attr('height', HEIGHT).call(this.d3.zoomListener);
  }

  _createClass(VTree, [{
    key: 'data',
    value: function data(_data) {
      if (Array.isArray(_data)) {
        this.root.children = _data;
      } else {
        this.root.children = [_data];
      }

      return this;
    }
  }, {
    key: 'createTreeGroups',
    value: function createTreeGroups(parentG, depth) {
      var hasChildren = false;

      var g = parentG.selectAll('g.vtree-node').data(function (d) {
        if (d.children.length !== 0) {
          hasChildren = true;
        }

        return d.children;
      }).enter().append('g').attr('class', 'vtree-node').each(function (d) {
        d.g = d3.select(this);
      });

      if (hasChildren) {
        this.createTreeGroups(g, depth + 1);
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      var root = {
        id: 1,
        children: [this.root]
      };

      var g = this.d3.svg.selectAll('g.vtree-root').data([root]).enter().append('g').attr('class', 'vtree-root');

      this.d3.g = g;

      this.createTreeGroups(g, 0);

      (0, _util.visitAfter)(this.root, function (node) {
        node.render(node.g);

        var layout = node.layout || _this2.defaultLayout;

        layout.layout(node);

        if (layout.renderLinks) {
          layout.renderLinks(node);
        }
      });

      var x = Math.round((WIDTH - this.root.width) / 2);
      var y = Math.round((HEIGHT - this.root.totalHeight) / 2);

      if (y < MARGIN) {
        y = MARGIN;
      }

      this.root.g.attr('transform', 'translate(' + x + ',' + y + ')');

      return this;
    }
  }]);

  return VTree;
}();

VTree.node = {};
VTree.node.Node = _node2.default;
VTree.node.String = _string2.default;
VTree.node.Table = _table2.default;
VTree.node.Array = _array2.default;

VTree.layout = {};
VTree.layout.Tree = _tree2.default;
VTree.layout.Array = _array4.default;

VTree.reader = {};
VTree.reader.Object = _object2.default;

module.exports = VTree;

/***/ })
/******/ ]);