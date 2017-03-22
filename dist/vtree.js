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

        var dbbox = decorator.render(newG, prevG, _this.width, _this.height);

        if (dbbox.dw || dbbox.dh) {
          _this.width += dbbox.dw;
          _this.height += dbbox.dh;
        }

        if (dbbox.dx || dbbox.dy) {
          prevG.attr('transform', 'translate(' + dbbox.dx + ',' + dbbox.dy + ')');

          _this.linkX += dbbox.dx;
          _this.linkY += dbbox.dy;
        }

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

var DURATION = 1000;

var diagonal = d3.svg.diagonal();

var ArrayLayout = function () {
  function ArrayLayout() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, ArrayLayout);

    this.hideLinks = options.hideLinks;
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

  var x = -Math.round(node.childrenWidth / 2);
  var y = 0;

  node.children.forEach(function (child) {
    child.x = x + Math.round(child.totalWidth / 2) - Math.round(child.width / 2);
    child.y = y;

    child.g.transition().duration(DURATION).attr('transform', 'translate(' + child.x + ',' + child.y + ')');

    x += child.totalWidth + node.margin;
  });
}

function _renderLinks(node) {
  if (node.children.length === 0) {
    return;
  }

  var h = node.children[0].linkY;

  node.children.forEach(function (child) {
    h = Math.min(h, child.linkY);
  });

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
      y: prev.y + h
    };

    dst = {
      x: child.x + child.linkX,
      y: child.y + h
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

  w += (node.children.length - 1) * node.margin;

  node.childrenWidth = w;
}

function calcTotalSize(node) {
  if (node.children.length === 0) {
    node.totalWidth = node.width;
    node.totalHeight = node.height;

    return;
  }

  node.totalWidth = Math.max(node.width, node.childrenWidth);

  var maxChildH = 0;

  node.children.forEach(function (child) {
    maxChildH = Math.max(maxChildH, child.totalHeight);
  });

  node.totalHeight = maxChildH;
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

var MARGIN = 10;

var ArrayNode = function (_Node) {
  _inherits(ArrayNode, _Node);

  function ArrayNode(nodes, layout) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, ArrayNode);

    if (!layout) {
      layout = defaultLayout;
    }

    var _this = _possibleConstructorReturn(this, (ArrayNode.__proto__ || Object.getPrototypeOf(ArrayNode)).call(this, null, nodes, layout));

    _this.width = 0;
    _this.height = 0;

    _this.linkX = 0;
    _this.linkY = 0;

    _this.margin = options.margin || MARGIN;
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

  function StringNode(data) {
    _classCallCheck(this, StringNode);

    var _this = _possibleConstructorReturn(this, (StringNode.__proto__ || Object.getPrototypeOf(StringNode)).call(this, data, []));

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

var MAX_LEN = 32;

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
  if (typeof text === 'string' && text.length > MAX_LEN) {
    text = text.substr(0, MAX_LEN) + '...';
  }

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
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, TreeLayout);

    this.height = options.height || HEIGHT;
  }

  _createClass(TreeLayout, [{
    key: 'layout',
    value: function layout(node) {
      calcChildrenWidth(node);
      calcTotalSize(node, this.height);

      _layout(node, this.height);
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


function _layout(node, height) {
  if (node.children.length === 0) {
    return;
  }

  var x = Math.round(node.width / 2) - Math.round(node.childrenWidth / 2);
  var y = node.height + height;

  node.children.forEach(function (child) {
    child.x = x + Math.round(child.totalWidth / 2) - Math.round(child.width / 2);
    child.y = y;

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

    var link = node.g.insert('path', ':first-child').attr('class', 'vtree-link').attr('d', function () {
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

function calcTotalSize(node, height) {
  if (node.children.length === 0) {
    node.totalWidth = node.width;
    node.totalHeight = node.height;

    return;
  }

  node.totalWidth = Math.max(node.width, node.childrenWidth);

  var maxChildH = 0;

  node.children.forEach(function (child) {
    maxChildH = Math.max(maxChildH, child.totalHeight);
  });

  node.totalHeight = node.height + height + maxChildH;
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
    node = new _string2.default(obj);
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
    value: function render(g, oldG, width) {
      var t = g.append('text').text(this.linkName);

      var b = t.node().getBBox();
      var textW = Math.ceil(b.width);
      var textH = Math.ceil(b.height);

      var textTotalW = textW + pad * 2;

      var newW = width;

      if (textTotalW > width) {
        newW = textTotalW;
      }

      var textTotalH = textH + pad;

      var dw = newW - width;
      var dh = textTotalH;
      var dx = Math.round(dw / 2);
      var dy = textTotalH;

      t.attr('x', Math.round(newW / 2)).attr('y', textH).attr('text-anchor', 'middle');

      return { dx: dx, dy: dy, dw: dw, dh: dh };
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

var DEFAULT_TREE_LAYOUT_HEIGHT = 50;
var DEBUG_TREE_LAYOUT_HEIGHT = 100;

var VTree = function () {
  function VTree(container) {
    var _this = this;

    _classCallCheck(this, VTree);

    this.root = new _array2.default([], new _array4.default({ hideLinks: true }));
    this.defaultLayout = new _tree2.default({ height: DEFAULT_TREE_LAYOUT_HEIGHT });
    this.container = container;
    this._width = WIDTH;
    this._height = HEIGHT;
    this._debug = false;

    this.d3 = {};

    this.d3.container = d3.select(this.container);

    this.d3.zoomListener = d3.behavior.zoom().scaleExtent([0.1, 10]).on('zoom', function () {
      var e = d3.event;

      if (_this.d3.g) {
        _this.d3.g.attr('transform', 'translate(' + e.translate + ')scale(' + e.scale + ')');
      }
    });

    this.d3.svg = this.d3.container.append('svg').attr('class', 'vtree').attr('width', this._width).attr('height', this._height).call(this.d3.zoomListener);
  }

  _createClass(VTree, [{
    key: 'width',
    value: function width(_width) {
      if (arguments.length === 0) {
        return this._width;
      }

      this._width = _width;

      this.d3.container.select('svg').attr('width', _width);

      return this;
    }
  }, {
    key: 'height',
    value: function height(_height) {
      if (arguments.length === 0) {
        return this._height;
      }

      this._height = _height;

      this.d3.container.select('svg').attr('height', _height);

      return this;
    }
  }, {
    key: 'debug',
    value: function debug(_debug) {
      if (arguments.length === 0) {
        return this._debug;
      }

      if (_debug) {
        this.defaultLayout.height = DEBUG_TREE_LAYOUT_HEIGHT;
      } else {
        this.defaultLayout.height = DEFAULT_TREE_LAYOUT_HEIGHT;
      }

      this._debug = _debug;

      return this;
    }
  }, {
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

      this.d3.svg.selectAll('*').remove();

      this._debugDrawGrid();

      this.d3.g = this.d3.svg.selectAll('g.vtree-root').data([root]).enter().append('g').attr('class', 'vtree-root');

      this.createTreeGroups(this.d3.g, 0);

      (0, _util.visitAfter)(this.root, function (node) {
        node.render(node.g);

        var layout = node.layout || _this2.defaultLayout;

        layout.layout(node);

        if (layout.renderLinks) {
          layout.renderLinks(node);
        }
      });

      if (this._debug) {
        (0, _util.visitAfter)(this.root, function (node) {
          _this2._debugDrawNodeInfo(node);
        });
      }

      this.setRootPos();

      return this;
    }
  }, {
    key: 'setRootPos',
    value: function setRootPos() {
      this.root.x = Math.round((this._width - this.root.width) / 2);
      this.root.y = Math.round((this._height - this.root.totalHeight) / 2);

      if (this.root.y < MARGIN) {
        this.root.y = MARGIN;
      }

      this.root.g.attr('transform', 'translate(' + this.root.x + ',' + this.root.y + ')');
    }
  }, {
    key: '_debugGetG',
    value: function _debugGetG() {
      if (!this._debug) {
        return;
      }

      var g = this.d3.svg.select('g.debug-info');

      if (!g.empty()) {
        return g;
      }

      return this.d3.svg.append('g').attr('class', 'debug-info');
    }
  }, {
    key: '_debugDrawGrid',
    value: function _debugDrawGrid() {
      if (!this._debug) {
        return;
      }

      var g = this._debugGetG();

      g.append('line').style('stroke', 'red').attr('x1', this._width / 2).attr('y1', 0).attr('x2', this._width / 2).attr('y2', this._height);

      g.append('line').style('stroke', 'red').attr('x1', 0).attr('y1', this._height / 2).attr('x2', this._width).attr('y2', this._height / 2);
    }
  }, {
    key: '_debugDrawNodeInfo',
    value: function _debugDrawNodeInfo(node) {
      if (node.constructor.name === 'ArrayNode') {
        return;
      }

      // node rect
      node.g.append('rect').style('fill', 'none').style('stroke', 'tomato').attr('x', -1).attr('y', -1).attr('width', node.width + 2).attr('height', node.height + 2);

      // node total rect
      node.g.append('rect').style('fill', 'none').style('stroke', 'mediumpurple').attr('x', (node.width - node.totalWidth) / 2).attr('y', 0).attr('width', node.totalWidth).attr('height', node.totalHeight);

      // x, y
      var xy = node.g.append('text').text('x=' + node.x + ' y=' + node.y);

      var bbox = xy.node().getBBox();
      var x = node.width / 2;
      var y = node.height + bbox.height + 2;

      xy.attr('x', x).attr('y', y).attr('text-anchor', 'middle');

      y += bbox.height + 2;

      // width, height
      node.g.append('text').text('w=' + node.width + ' h=' + node.height).attr('x', x).attr('y', y).attr('text-anchor', 'middle');

      y += bbox.height + 2;

      // totalWidth, totalHeight
      node.g.append('text').text('tw=' + node.totalWidth + ' th=' + node.totalHeight).attr('x', x).attr('y', y).attr('text-anchor', 'middle');

      y += bbox.height + 2;

      // childrenWidth
      node.g.append('text').text('cw=' + node.childrenWidth).attr('x', x).attr('y', y).attr('text-anchor', 'middle');
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