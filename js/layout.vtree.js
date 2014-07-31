/*
 * layout.vtree.js
 * Variable Node Size Tree Layout module for d3
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 4,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true,  bitwise  : true
*/
/*global d3 */


function d3_layout_vtreeSeparation ( a, b )
{
    if ( a.parent === b.parent ) {
        return 1;
    }

    return 2;
}



function d3_layout_vtreeHSeparation ( depth )
{
    return depth * 50;
}



function d3_layout_hierarchyVisitBefore ( node, callback )
{
    var nodes = [ node ], n, children;


    while ( nodes.length !== 0 )
    {
        node = nodes.pop();

        callback( node );

        children = node.children;

        if ( children )
        {
            n = children.length;

            while ( --n >= 0 ) {
                nodes.push( children[n] );
            }
        }
    }
}



function d3_layout_hierarchyVisitAfter( node, callback )
{
    var nodes = [ node ], nodes2 = [], i, n, children;

    while ( nodes.length !== 0 )
    {
        node = nodes.pop();

        nodes2.push( node );

        children = node.children;

        if ( children )
        {
            i = -1;
            n = children.length;

            while ( ++i < n ) {
                nodes.push( children[i] );
            }
        }
    }


    while ( nodes2.length !== 0 )
    {
        node = nodes2.pop();

        callback( node );
    }
}



function d3_layout_hierarchyLinks( nodes )
{
    return d3.merge( nodes.map( function ( parent ) {
        return ( parent.children || [] ).map( function ( child ) {
            return {
                source: parent,
                target: child
            };
        } );
    } ) );
}



function d3_layout_hierarchyRebind ( object, hierarchy )
{
    d3.rebind( object, hierarchy, 'sort', 'children', 'value' );
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;

    return object;
}



d3.layout.vtree = function ()
{
    var hierarchy = d3.layout.hierarchy().sort( null ).value( null ),
        separation = d3_layout_vtreeSeparation,
        hSep = d3_layout_vtreeHSeparation,
        nodeSize = null;



    function calcNodeSize ( root )
    {
        if ( ! nodeSize ) {
            return;
        }

        d3_layout_hierarchyVisitAfter( root, function ( d ) {
            var size = nodeSize( d );

            d.w = size[0];
            d.h = size[1];
        } );
    }



    function updateArea( areas, depth, left, leftNode, right, rightNode )
    {
        if ( areas[depth] === undefined ) {
            areas[depth] = { left: left, leftNode: leftNode, right: right, rightNode: rightNode };
        }

        if ( left < areas[depth].left ) {
            areas[depth].left = left;
            areas[depth].leftNode = leftNode;
        }

        if ( right > areas[depth].right ) {
            areas[depth].right = right;
            areas[depth].rightNode = rightNode;
        }
    }



    function calcOverlap ( children )
    {
        var i, j, k, w, overlap = [], a1, a2, relX1, relX2, len, ol, maxOverlapWidth, sep;

        for ( i = 0; i < children.length - 1; i++ ) {
            overlap[i] = 0;
        }

        for ( i = 0; i < children.length; i++ ) {
            for ( j = i + 1; j < children.length; j++ ) {
                a1 = children[i]._vtAreas;
                a2 = children[j]._vtAreas;

                relX1 = children[i]._vtRelX;
                relX2 = children[j]._vtRelX;

                len = Math.min( a1.length, a2.length );

                maxOverlapWidth = 0;

                for ( k = 0; k < len; k++ ) {
                    if ( a1[k] === undefined || a2[k] === undefined ) {
                        break;
                    }

                    sep = separation( a1[k].rightNode, a2[k].leftNode );

                    ol = sep + (relX1 + a1[k].right) - (relX2 + a2[k].left);

                    if ( ol > 0 && ol > maxOverlapWidth ) {
                        maxOverlapWidth = ol;
                    }
                }

                for ( k = i; k < j; k++ ) {
                    maxOverlapWidth -= overlap[k];
                }

                if ( maxOverlapWidth <= 0 ) {
                    continue;
                }

                w = maxOverlapWidth / (j-i);

                for ( k = i; k < j; k++ ) {
                    overlap[k] += w;
                }
            }
        }

        return overlap;
    }



    function mergeAreas( children )
    {
        var areas = [], i, k, sum = 0, w2, overlap = [], sumOverlap, ol, a1, relX1, sep;

        // calc width sum
        for ( i = 0; i < children.length; i++ ) {
            children[i]._vtRelX = sum + children[i].w / 2;

            if ( i === children.length - 1 ) {
                sep = 0;
            } else {
                sep = separation( children[i], children[i+1] );
            }

            sum += sep + children[i].w;
        }

        overlap = calcOverlap( children );
        if ( overlap.length === 0 ) {
            sumOverlap = 0;
        } else {
            sumOverlap = d3.sum( overlap );
        }

        // update relX
        if ( sumOverlap !== 0 )
        {
            sum = 0;

            for ( i = 0; i < children.length; i++ ) {
                children[i]._vtRelX = sum + children[i].w / 2;

                if ( i === children.length - 1 ) {
                    ol = 0;
                    sep = 0;
                } else {
                    ol = overlap[i];
                    sep = separation( children[i], children[i+1] );
                }

                sum += sep + children[i].w + ol;
            }
        }

        w2 = sum / 2;

        for ( i = 0; i < children.length; i++ ) {
            children[i]._vtRelX -= w2;
        }


        // create areas
        for ( i = 0; i < children.length; i++ ) {
            a1 = children[i]._vtAreas;
            relX1 = children[i]._vtRelX;

            for ( k = 0; k < a1.length; k++ ) {
                updateArea( areas, k + 1, relX1 + a1[k].left, a1[k].leftNode, relX1 + a1[k].right, a1[k].rightNode );
            }
        }

        areas[0] = { left: -w2, leftNode: children[0], right: w2, rightNode: children[children.length-1] };

        return areas;
    }



    function calcRange ( root )
    {
        var minLeft = 0, maxRight = 0, left, right, w2;

        if ( ! root.children ) {
            w2 = root.w / 2;

            return [-w2, w2];
        }

        d3_layout_hierarchyVisitBefore( root, function ( d ) {
            if ( d.parent ) {
                d.x = d.parent.x + d._vtRelX;
            } else {
                d.x = 0;
            }

            w2 = d.w / 2;
            left = d.x - w2;
            right = d.x + w2;

            if ( left < minLeft ) {
                minLeft = left;
            }

            if ( right > maxRight ) {
                maxRight = right;
            }
        } );

        return [minLeft, maxRight];
    }



    function calcX ( root )
    {
        var rng, width;

        d3_layout_hierarchyVisitAfter( root, function ( d ) {
            var areas;

            if ( ! d.children || d.children.length === 0 ) {
                areas = [];
            } else {
                areas = mergeAreas( d.children );
            }

            d._vtAreas = areas;
        } );


        rng = calcRange( root );
        width = rng[1] - rng[0];

        d3_layout_hierarchyVisitBefore( root, function ( d ) {
            if ( d.parent ) {
                d.x = d.parent.x + d._vtRelX;
            } else {
                d.x = -rng[0];
            }
        } );


        return width;
    }



    function calcY ( root )
    {
        var i, depthMaxHeight = [], height;

        // calc depthMaxHeight
        d3_layout_hierarchyVisitBefore( root, function ( d ) {
            if ( depthMaxHeight[d.depth] === undefined ) {
                depthMaxHeight[d.depth] = 0;
            }

            if ( d.h > depthMaxHeight[d.depth] ) {
                depthMaxHeight[d.depth] = d.h;
            }
        } );


        d3_layout_hierarchyVisitAfter( root, function ( d ) {
            var i, extY;

            extY = 0;

            for ( i = 0; i < d.depth; i++ ) {
                extY += depthMaxHeight[i];
            }

            d.y = extY + hSep( d.depth );
        } );



        // calc height
        height = 0;

        for ( i = 0; i < depthMaxHeight.length; i++ ) {
            height += depthMaxHeight[i];
        }

        height += hSep( depthMaxHeight.length - 1 );

        return height;
    }



    function vtree ( d, i, size )
    {
        var nodes = hierarchy.call( this, d, i ),
            root = nodes[0], w, h;

        calcNodeSize( root );

        w = calcX( root );
        h = calcY( root );

        if ( typeof size === 'object' ) {
            size.width = w;
            size.height = h;
        }

        return nodes;
    }



    vtree.separation = function ( f )
    {
        if ( ! arguments.length ) {
            return separation;
        }

        separation = f;

        return vtree;
    };



    vtree.hSeparation = function ( f )
    {
        if ( ! arguments.length ) {
            return hSep;
        }

        hSep = f;

        return vtree;
    };



    vtree.nodeSize = function ( f )
    {
        if ( ! arguments.length ) {
            return nodeSize;
        }

        nodeSize = f;

        return vtree;
    };



    return d3_layout_hierarchyRebind(vtree, hierarchy);
};

