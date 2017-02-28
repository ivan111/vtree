(function () {
    "use strict";

    window.vtree = vtree;


    var WIDTH = 960;
    var HEIGHT = 800;
    var MARGIN = 20;

    var RE_NULL = /^\s*null\s*$/;
    var RE_URL = /^\s*https?:\/\/[^\s<>]+\s*$/;


    function vtree(container) {
        return new VTree(container);
    }


    function VTree(container) {
        this.container = container;

        this.initId();
        this.initConf();
        this.initD3Objects();
    }


    VTree.prototype.initConf = function () {
        this._conf = {};

        this._conf.fontSize = 14;
        this._conf.heightFactor = 5;
        this._conf.nodeMargin = 20;
        this._conf.tdPadding = 4;
        this._conf.duration = 768;
        this._conf.showColumn = [true, true];
        this._conf.showLinkName = true;
        this._conf.maxNameLen = 32;
        this._conf.maxValueLen = 32;

        this.width = WIDTH - MARGIN * 2;
        this.height= HEIGHT - MARGIN * 2;

        this.containerLeft = this.container.getBoundingClientRect().left;
        this.containerTop = this.container.getBoundingClientRect().top;
    };


    VTree.prototype.initD3Objects = function () {
        this.d3 = {};

        this.d3.container = d3.select(this.container)
            .text("")
            .style("position", "relative");

        this.d3.zoomListener = d3.behavior.zoom()
            .scaleExtent([1, 2])
            .on("zoom", createZoomFunc(this));

        this.d3.svg = this.d3.container.append("svg")
            .attr("class", "vtree")
            .attr("width", this.width)
            .attr("height", this.height)
            .call(this.d3.zoomListener);

        this.d3.g = this.d3.svg.append("g")
            .attr("transform", tranStr(MARGIN, MARGIN));

        // 文字のサイズを測るための定規
        this.d3.ruler = this.d3.container.append("span")
            .text("")
            .style("visibility", "hidden")
            .style("white-space", "nowrap")
            .style("font", this._conf.fontSize + "px sans-serif");

        this.d3.tooltip = this.d3.container.append("div")
            .attr("class", "vtree-tooltip")
            .style("opacity", 0 );

        this.d3.tree = d3.layout.vtree()
            .children(createChildrenFunc(this))
            .separation(createSeparationFunc(this))
            .hSeparation(createHSeparationFunc(this))
            .nodeSize(createNodeSizeFunc(this));

        this.d3.diagonal = d3.svg.diagonal()
            .projection(function (d) {
                if (d._vtIsArrayItem) {
                    return [d.x, d.y + d.h / 2];
                } else {
                    return [d.x, d.y];
                }
            });


        this.d3.onMouseOver = createTooltipOnMouseOverFunc(this);
        this.d3.onMouseOut = createTooltipOnMouseOutFunc(this);

    };


    VTree.prototype.initId = function () {
        this.curMaxId = 0;
    };


    VTree.prototype.newId = function () {
        return ++this.curMaxId;
    };


    VTree.prototype.onError = function (listener) {
        this.onErrorListener = listener;

        return this;
    };


    VTree.prototype.data = function (data) {
        if (!data) {
            this.root = null;

            return this;
        }

        var type = typeof data;

        if (type === "string") {
            var json = str2json(data);

            type = typeof json;
        } else {
            json = data;
        }

        if ((json === null && RE_NULL.test(data)) || type === "string" || type === "number" || type === "boolean") {
            json = { name: json };
        } else if (isArray(json)) {
            json = { name: "/", children: json };
        }

        this.root = json;

        if (this.root) {
            setVtreeInfo(this.root);

            // transitionの開始位置
            this.root.x0 = this.width / 2;
            this.root.y0 = this.height / 2;
        } else {
            if (this.onErrorListener) {
                this.onErrorListener("Parse Error");
            }
        }

        return this;
    };


    VTree.prototype.update = function (src) {
        if (!src) {
            if (!this.root) {
                return this;
            }

            src = this.root;
        }

        var treeSize = {};

        var nodes = this.d3.tree(this.root, undefined, treeSize);
        var links = this.d3.tree.links(nodes);

        this.createNodes(src, nodes);
        this.createLinks(src, links);

        var containerSize = { width: this.width, height: this.height };
        var treePos = getTreePos(this.root, src, containerSize, treeSize);

        this.d3.zoomListener.translate(treePos);
        this.d3.zoomListener.event(this.d3.g.transition().duration(this._conf.duration));

        // transitionのために古い位置を隠しておく
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        return this;
    };


    VTree.prototype.createLinkName = function (nodeEnter, nodeUpdate) {
        var vt = this, showLinkName;

        showLinkName = this._conf.showLinkName;

        nodeEnter.filter(function (d) { return d._vtLinkName; })
            .append("text")
            .attr("class", "vtree-link-name");

        nodeUpdate.selectAll(".vtree-link-name")
            .text(function (d) {
                if (!showLinkName) {
                    return "";
                }

                return createLinkNameStr(vt, d);
            })
            .attr("y", -this._conf.fontSize / 3)
            .attr("text-anchor", "middle")
            .style("font-size", this._conf.fontSize);
    };


    VTree.prototype.createDummyArray = function (nodeEnter, nodeUpdate) {
        var r = this._conf.fontSize * 2 / 3;

        nodeEnter.filter(function (d) { return d._vtIsDummy; })
            .append("circle")
            .attr("class", "vtree-dummy")
            .attr("cy", r )
            .attr("r", r );
    };


    VTree.prototype.createTables = function (node, nodeEnter, nodeUpdate) {
        nodeEnter.filter(function (d) { return !d._vtIsDummy; })
            .append("path")
            .attr("class", "vtree-table");

        nodeUpdate.selectAll(".vtree-table")
            .attr("d", createTableBorderPathFunc(this));

        node.selectAll("g.vtree-row").remove();

        createTableTexts(this, nodeUpdate);

        this.createDummyArray(nodeEnter, nodeUpdate);
    };


    VTree.prototype.createNodes = function (src, nodes) {
        var vt = this;

        var node = this.d3.g.selectAll("g.vtree-node")
            .data(nodes, function (d) {
                if (!d.id) {
                    d.id = vt.newId();
                }

                return d.id;
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", setTreeNodeClass)
            .attr("transform", function () { return tranStr(src.x0, src.y0); })
            .style("opacity", 0)
            .on("click", createCollapseFunc(this));

        var nodeUpdate = node.transition()
            .duration(this._conf.duration)
            .attr("class", setTreeNodeClass)
            .attr("transform", function (d) { return tranStr(d.x, d.y); })
            .style("opacity", 1);

        node.exit().transition()
            .duration(this._conf.duration)
            .attr("transform", function () { return tranStr(src.x, src.y); })
            .style("opacity", 0)
            .remove();

        this.createLinkName(nodeEnter, nodeUpdate);

        this.createTables(node, nodeEnter, nodeUpdate);
    };


    function setTreeNodeClass(d) {
        var a = ["vtree-node"];

        if (d._vtClassName) {
            a.push(d._vtClassName);
        }

        if (d._vtHiddenChildren) {
            a.push("collapsed");
        }

        return a.join(" ");
    }


    VTree.prototype.createLinks = function (src, links) {
        var diagonal = this.d3.diagonal;

        var link = this.d3.g.selectAll("path.vtree-link")
            .data(links, function (d) { return d.target.id; });

        link.enter().insert("path", "g")
            .attr("class", "vtree-link")
            .attr("d", function () {
                var o = { x: src.x0, y: src.y0 };

                return diagonal({ source: o, target: o });
            })
            .style("opacity", 0);

        link.transition()
            .duration(this._conf.duration)
            .attr("d", diagonal)
            .style("opacity", 1);

        link.exit().transition()
            .duration(this._conf.duration)
            .attr("d", function () {
                var o = { x: src.x, y: src.y };

                return diagonal({ source: o, target: o });
            })
            .style("opacity", 0)
            .remove();
    };


    function getNumberConf (val, start, end) {
        if (typeof val !== "number") {
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


    VTree.prototype.size = function (width, height) {
        var w = getNumberConf(width, 32, 8096);
        var h = getNumberConf(height, 32, 8096);

        if (w === null || h === null) {
            return this;
        }

        this.width = width;
        this.height = height;

        this.d3.svg
            .attr("width", width)
            .attr("height", height);

        return this;
    };


    VTree.prototype.conf = function (name, val) {
        var cf = this._conf;

        switch (name) {
        case "showLinkName":
            cf.showLinkName = !!val;
            break;

        case "showColumn0":
            cf.showColumn[0] = !!val;

            if (cf.showColumn[0] === false) {
                cf.showColumn[1] = true;
            }
            break;

        case "showColumn1":
            cf.showColumn[1] = !!val;

            if (cf.showColumn[1] === false) {
                cf.showColumn[0] = true;
            }
            break;

        case "fontSize":
            setNumberConf(cf, name, val, 9, 32);

            this.d3.ruler.style("font-size", cf.fontSize + "px");

            break;

        case "heightFactor":
            setNumberConf(cf, name, val, 1, 10);
            break;

        case "nodeMargin":
            setNumberConf(cf, name, val, 1, 100);
            break;

        case "animeDuration":
            setNumberConf(cf, "duration", val, 10, 10000);
            break;

        case "maxNameLen":
            setNumberConf(cf, name, val, 1, 1024);
            break;

        case "maxValueLen":
            setNumberConf(cf, name, val, 1, 1024);
            break;

        default:
            break;
        }

        return this;
    };


    function isArray(obj) {
        if (Object.prototype.toString.call(obj) === "[object Array]") {
            return true;
        }

        return false;
    }


    function addName(d, name, val) {
        if (!d._vtNameTbl) {
            d._vtNameTbl = [];
        }

        d._vtNameTbl.push([{ val: name }, { val: val }]);
    }


    function addNames(d, tbl) {
        d._vtNameTbl = [];

        tbl.forEach(function (row) {
            d._vtNameTbl.push([{ val: row[0] }, { val: row[1] }]);
        });
    }


    function setLinkName(d, name, index) {
        if (index || index === 0) {
            name = ["[", index, "]"].join("");
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


    function addChildren(d, children) {
        d._vtChildren = children;
    }


    VTree.prototype.setVtreeInfo = function (d) {
        setVtreeInfoVTree(d);
    };


    function setVtreeInfo(d) {
        // ---- VTree 形式
        if (d.getVTreeTable) {
            setVtreeInfoVTree(d);

            if (d.getVTreeChildren) {
                var children = d.getVTreeChildren();

                children.forEach(function (child) {
                    setVtreeInfo(child);
                });
            }

            return;
        }

        // ---- JSON 形式
        setVtreeInfoJSON(d);
    }


    function setVtreeInfoVTree(d) {
        addNames(d, d.getVTreeTable());

        d._vtClassName = d.vtreeClassName;

        if (d.getVTreeChildren) {
            var children = d.getVTreeChildren();
            addChildren(d, children);

            children.forEach(function (child) {
                setVtreeInfo(child);
            });
        }
    }


    function setVtreeInfoJSON(d) {
        for (var name in d) {
            if (!d.hasOwnProperty(name)) {
                continue;
            }

            if (startsWith(name, "_vt")) {
                continue;
            }

            var data = d[name];
            delete d[name];

            if (isArray(data)) {
                if (d._vtIsDummy) {

                    for (var i = 0; i < data.length; i++) {
                        var item = data[i];
                        var type = typeof item;

                        if (item === null || type === "string" || type === "number" || type === "boolean") {
                            item = { name: item };
                        }

                        item._vtIsArrayItem = true;
                        item._vtArrayName = name;
                        item._vtArrayIndex = i;

                        addChildNode(d, name, item, i);
                        setVtreeInfo(item);
                    }
                } else {
                    var dummy = {};
                    dummy._vtIsDummy = true;
                    dummy[name] = data;

                    addChildNode(d, [name, "[", data.length, "]"].join(""), dummy, null);
                    setVtreeInfo(dummy);
                }
            } else if (data !== null && typeof data === "object") {
                addChildNode(d, name, data, null);
                setVtreeInfo(data);
            } else {
                addName(d, name, data);
            }
        }
    }


    function str2json(text) {
        try {
            var data = JSON.parse(text);
        } catch (e) {
            text = text.replace(
                /([{,])\s*([^":\[\]{},\s]+)\s*:/g,
                function ( match, sep, s ) {
                    return [sep, " \"", s, "\":"].join("");
                }
            );

            text = text.replace(
                /:\s*([^",\[\]{}\s]+)\s*([,}])/g,
                function (match, s, sep) {
                    return [": \"", s, "\"", sep].join("");
                }
            );

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
            var transform = ["translate(", d3.event.translate, ")scale(", d3.event.scale, ")"].join("");

            vt.d3.g.attr("transform", transform);
        };
    }


    function createChildrenFunc(vt) {
        return function (d) {
            var children = null;

            if (d._vtChildren && d._vtChildren.len !== 0) {
                children = d._vtChildren.slice(0);  // copy

                for (var i = children.length - 1; i >= 0; i--) {
                    if (children[i]._vtIsDummy) {
                        var args = [i, 1];

                        if (children[i]._vtChildren) {
                            args = args.concat(children[i]._vtChildren);
                        } else if (children[i]._vtHiddenChildren) {
                            args = args.concat(children[i]._vtHiddenChildren);
                        }

                        children.splice.apply(children, args);
                    }
                }

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
                return vt._conf.nodeMargin << 2;
            }

            return vt._conf.nodeMargin;
        };
    }


    function createHSeparationFunc(vt) {
        return function (depth) {
            return depth * (vt._conf.fontSize * vt._conf.heightFactor);
        };
    }


    function createLinkNameStr(vt, d) {
        if (d._vtIsArrayItem) {
            var s = [d._vtArrayName, "[", d._vtArrayIndex, "]"].join("");
        } else {
            s = d._vtLinkName || "";
        }

        if (s.length > vt._conf.maxNameLen) {
            s = s.substring(0, vt._conf.maxNameLen) + "...";
        }

        return s;
    }


    function createTableStr(s, maxLen) {
        s = s || "";

        if (s.length > maxLen) {
            s = s.substring(0, maxLen) + "...";
        }

        return s;
    }


    function calcLinkNameWidth(vt, d) {
        var s = createLinkNameStr(vt, d);

        vt.d3.ruler.text(s);
        var w = vt.d3.ruler[0][0].offsetWidth;
        vt.d3.ruler.text("");

        return w;
    }


    function calcMaxColumnWidth(vt, tbl, col) {
        if (!tbl || tbl.length === 0) {
            return 0;
        }

        var maxW = vt._conf.fontSize / 2;

        if (col === 0) {
            var maxLen = vt._conf.maxNameLen;
        } else {
            maxLen = vt._conf.maxValueLen;
        }

        for (var i = 0; i < tbl.length; i++) {
            var name = tbl[i][col].val;
            name = createTableStr(name, maxLen);

            vt.d3.ruler.text(name);
            var w = vt.d3.ruler[0][0].offsetWidth;

            if (w > maxW) {
                maxW = w;
            }
        }

        vt.d3.ruler.text("");

        return maxW + (vt._conf.tdPadding * 2);
    }


    function createNodeSizeFunc(vt) {
        return function (d) {
            var fontSize = vt._conf.fontSize;
            var pad = vt._conf.tdPadding;

            if (d._vtLinkName && vt._conf.showLinkName) {
                linkNameW = calcLinkNameWidth(vt, d);
            }

            var tbl = d._vtNameTbl;

            var maxNameW = 0;
            var maxValW = 0;
            var linkNameW = 0;

            if (!tbl || tbl.length === 0) {
                var maxW = fontSize + pad * 2;
                var sumH = fontSize + pad * 2;
            } else {
                if (vt._conf.showColumn[0]) {
                    maxNameW = calcMaxColumnWidth(vt, tbl, 0);
                }

                if (vt._conf.showColumn[1]) {
                    maxValW = calcMaxColumnWidth(vt, tbl, 1);
                }

                maxW = maxNameW + maxValW;
                sumH = (fontSize + pad * 2) * tbl.length;
            }

            d._vtWidth = maxW;

            if (linkNameW > maxW) {
                maxW = linkNameW;
            }

            return [maxW, sumH];
        };
    }


    function createTooltipOnMouseOverFunc(vt) {
        return function (d) {
            vt.d3.tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);

            vt.d3.tooltip.text(d._vtOriginal)
                .style("left", (d3.event.pageX - vt.containerLeft) + "px")
                .style("top",  (d3.event.pageY - vt.containerTop - vt._conf.fontSize) + "px");
        };
    }


    function createTooltipOnMouseOutFunc(vt) {
        return function onMouseOut() {
            vt.d3.tooltip.transition()
                .duration(500)
                .style("opacity", 0);

            vt.d3.tooltip.text("");
        };
    }


    function createCollapseFunc(vt) {
        return function (d) {
            if (!d._vtChildren && !d._vtHiddenChildren) {
                return;
            }

            if (d._vtChildren) {
                d._vtHiddenChildren = d._vtChildren;
                d._vtChildren = null;
            } else {
                d._vtChildren = d._vtHiddenChildren;
                d._vtHiddenChildren = null;
            }

            vt.update(d);
        };
    }


    // 木が中央に表示されるような、木の左上位置を取得する
    function getTreePos(root, src, containerSize, treeSize) {
        var cW = containerSize.width;
        var cH = containerSize.height;
        var tW = treeSize.width;
        var tH = treeSize.height;

        if (tW < cW && tH < cH) {
            var x = cW / 2 - root.x;
            var y = (cH - tH) / 2;
        } else if (src === root) {
            x = cW / 2 - root.x;

            if (tH < cH) {
                y = (cH - tH) / 2;
            } else {  // 木がコンテナに収まらない
                y = MARGIN;
            }
        } else {
            x = cW / 2 - src.x;

            if (tH < cH) {
                y = (cH - tH) / 2;
            } else {
                y = cH / 2 - src.y;
            }
        }

        return [x, y];
    }


    function createTableBorderPathFunc(vt) {
        return function (d) {
            var tbl = d._vtNameTbl;

            if (!tbl || tbl.length === 0) {
                return "";
            }

            var w2 = d._vtWidth / 2;

            // ---- 外枠
            // 原点は、x方向は表の真ん中、y方向は表の一番上
            var a = [];
            a.push(["M", -w2, 0].join(" "));
            a.push(["L", w2, 0].join(" "));
            a.push(["L", w2, d.h].join(" "));
            a.push(["L", -w2, d.h].join(" "));
            a.push("Z");

            // ---- 縦線
            var nameW = calcMaxColumnWidth(vt, tbl, 0);  // 名前列の最大幅
            var sepX = -w2 + nameW;  // 縦の区切り線のx位置

            if (vt._conf.showColumn[0] && vt._conf.showColumn[1]) {
                a.push(["M", sepX, 0].join(" "));
                a.push(["L", sepX, d.h].join(" "));
            }

            // ---- 横線
            var y = d.h / tbl.length;
            var stepH = d.h / tbl.length;

            for (var i = 0; i < tbl.length; i++) {
                a.push(["M", -w2, y].join(" "));
                a.push(["L", w2, y].join(" "));

                y += stepH;
            }

            return a.join("");
        };
    }


    function createTableTexts(vt, nodes) {
        var pad = vt._conf.tdPadding;

        nodes.each(function (d) {
            var tbl = d._vtNameTbl;

            if (!tbl || tbl.length === 0) {
                return;
            }

            var w2 = d._vtWidth / 2;
            var nameW = calcMaxColumnWidth(vt, tbl, 0);
            var sepX = -w2;

            if (vt._conf.showColumn[0]) {
                sepX += nameW;
            }

            var stepH = d.h / tbl.length;

            d3.select(this).selectAll("g")
                .data(tbl)
                .enter()
                .append("g")
                .attr("class", "vtree-row")
                .each(function (row, rowNo) {
                    var d3row = d3.select(this);

                    var h = stepH * (rowNo + 1) - 2 - pad;

                    // 名前列
                    if (vt._conf.showColumn[0]) {
                        createTableText(vt, d3row, row[0],  -w2 + pad, h, "vtree-name-col", vt._conf.maxNameLen);
                    }

                    // 値列
                    if (vt._conf.showColumn[1]) {
                        createTableText(vt, d3row, row[1],  sepX + pad, h, "vtree-val-col", vt._conf.maxValueLen);
                    }
                });
        });
    }


    // 名前列または値列のテキストを１つ作る
    function createTableText(vt, d3row, d, x, y, clsName, maxLen) {
        d._vtOriginal = d.val || "";

        var val = createTableStr(d.val, maxLen);

        var d3text = d3row.selectAll("text." + clsName)
            .data([d])
            .enter()
            .append("text")
            .attr("class", clsName)
            .text(val)
            .attr("x", x)
            .attr("y", y)
            .style("font-size", vt._conf.fontSize);

        d3text.filter(function (d) { return d._vtOriginal.length > maxLen; })
            .on("mouseover", vt.d3.onMouseOver)
            .on("mouseout", vt.d3.onMouseOut);
    }


    function tranStr(x, y) {
         return ["translate(", x, ",", y, ")"].join("");
    }


    function startsWith(str, pattern) {
        if (!str) {
            return false;
        }

        return str.indexOf(pattern) === 0;
    }
})();
