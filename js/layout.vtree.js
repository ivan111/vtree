(function () {
    "use strict";


    d3.layout.vtree = function () {
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
                    sep = separation(children[i], children[i+1]);
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

            areas[0] = { left: -w2, leftNode: children[0], right: w2, rightNode: children[children.length-1] };

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

                if (! d.children || d.children.length === 0) {
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

            if (typeof size === 'object') {
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
            return (parent.children || []).map(function (child) {
                return { source: parent, target: child };
            });
        }));
    }


    function d3_layout_hierarchyRebind(object, hierarchy) {
        d3.rebind(object, hierarchy, 'sort', 'children', 'value');
        object.nodes = object;
        object.links = d3_layout_hierarchyLinks;

        return object;
    }
})();
