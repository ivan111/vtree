/*
 * vtree.js
 * Visualize Tree Data module for JSON
*/

/*jslint           browser : true,   continue : true,
  devel  : true,    indent : 4,       maxerr  : 50,
  newcap : true,     nomen : true,   plusplus : true,
  regexp : true,    sloppy : true,       vars : false,
  white  : true,  bitwise  : true
*/
/*global d3, vtree */

var vtree = (function ()
{
    var DEFAULT_WIDTH = 100,
        DEFAULT_HEIGHT = 100,
        MARGIN = 20,
        NODE_MARGIN = 6,
        RECT_MARGIN = 4,
        TEXT_TOP = 10,
        STR_PX = 14,

        DEFAULT_MAX_STRING_LEN = 32,

        CONF_MAX_STRING_LEN = 'max_string_len',
        CONF_SHOW_ELLIPSIS = 'show_ellipsis',

        indexOf,

        conf = {};



    function isArray( obj )
    {
        if ( Object.prototype.toString.call( obj ) === '[object Array]' ) {
            return true;
        }

        return false;
    }



    indexOf = function ( needle )
    {
        var indexOf;

        if ( typeof Array.prototype.indexOf === 'function' ) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function ( needle )
            {
                var i = -1, index = -1;

                for ( i = 0; i < this.length; i++ ) {
                    if ( this[i] === needle ) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call( this, needle );
    };



    // depth-first traversal
    function traverse ( d, f )
    {
        var i;

        if ( d._vtChildren ) {
            for ( i = 0; i < d._vtChildren.length; i++ ) {
                traverse( d._vtChildren[i], f );
            }
        }

        f( d );
    }



    function breadthFirstTraverse ( d, f )
    {
        var i, q = [ d ], data;

        while ( q.length )
        {
            data = q.shift();

            f( data );

            if ( data._vtChildren ) {
                for ( i = 0; i < data._vtChildren.length; i++ ) {
                    q.push( data._vtChildren[i] );
                }
            }
        }
    }



    function updateArea( areas, depth, left, right )
    {
        if ( areas[depth] === undefined ) {
            areas[depth] = { left: 0, right: 0 };
        }

        if ( left < areas[depth].left ) {
            areas[depth].left = left;
        }

        if ( right > areas[depth].right ) {
            areas[depth].right = right;
        }
    }



    function calcOverlap ( children )
    {
        var i, j, k, w, overlap = [], a1, a2, relX1, relX2, len, ol, maxOverlapWidth;

        for ( i = 0; i < children.length - 1; i++ ) {
            overlap[i] = 0;
        }

        for ( i = 0; i < children.length; i++ ) {
            for ( j = i + 1; j < children.length; j++ ) {
                a1 = children[i]._vtAreas;
                a2 = children[j]._vtAreas;

                relX1 = children[i].relX;
                relX2 = children[j].relX;

                len = Math.min( a1.length, a2.length );

                maxOverlapWidth = 0;

                for ( k = 0; k < len; k++ ) {
                    if ( a1[k] === undefined || a2[k] === undefined ) {
                        break;
                    }

                    ol = (relX1 + a1[k].right) - (relX2 + a2[k].left);

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



    function calcRange ( root )
    {
        var minLeft = 0, maxRight = 0, left, right, w2;

        if ( ! root._vtChildren ) {
            w2 = root._vtWidthSum / 2;
            return [-w2, w2];
        }

        breadthFirstTraverse( root, function ( d ) {
            if ( d.parent ) {
                d.x = d.parent.x + d.relX;

                w2 = d._vtWidth / 2;
                left = d.x - w2;
                right = d.x + w2;

                if ( left < minLeft ) {
                    minLeft = left;
                }

                if ( right > maxRight ) {
                    maxRight = right;
                }
            } else {
                d.x = 0;
            }
        } );

        return [minLeft, maxRight];
    }



    function mergeAreas( children )
    {
        var areas = [], i, k, sum = 0, w2, overlap = [], sumOverlap, ol, a1, relX1;

        // calc width sum
        for ( i = 0; i < children.length; i++ ) {
            children[i].relX = NODE_MARGIN + sum + children[i]._vtWidth / 2;
            sum += children[i]._vtWidth + NODE_MARGIN * 2;
        }

        overlap = calcOverlap( children );
        if ( overlap.length === 0 ) {
            sumOverlap = 0;
        } else {
            sumOverlap = overlap.reduce( function ( prev, cur ) {
                return prev+ cur;
            } );
        }

        // update relX
        if ( sumOverlap !== 0 )
        {
            sum = 0;

            for ( i = 0; i < children.length; i++ ) {
                children[i].relX = NODE_MARGIN + sum + children[i]._vtWidth / 2;

                if ( i < children.length - 1 ) {
                    ol = overlap[i];
                } else {
                    ol = 0;
                }

                sum += children[i]._vtWidth + ol + NODE_MARGIN * 2;
            }
        }

        w2 = sum / 2;

        for ( i = 0; i < children.length; i++ ) {
            children[i].relX -= w2;
        }


        // create areas
        for ( i = 0; i < children.length; i++ ) {
            a1 = children[i]._vtAreas;
            relX1 = children[i].relX;

            for ( k = 0; k < a1.length; k++ ) {
                updateArea( areas, k + 1, relX1 + a1[k].left, relX1 + a1[k].right );
            }
        }

        areas[0] = { left: -w2, right: w2 };

        return areas;
    }



    function calcNodePos ( d )
    {
        var rng, width;

        traverse( d, function ( d ) {
            var i, sum = 0, areas;

            if ( d._vtChildren && d._vtChildren.length !== 0 ) {
                for ( i = 0; i < d._vtChildren.length; i++) {
                    sum += d._vtChildren[i]._vtWidthSum;
                }

                areas = mergeAreas( d._vtChildren );
            } else {
                sum = d._vtWidth + NODE_MARGIN * 2;
                areas = [];
            }

            d._vtWidthSum = sum;
            d._vtAreas = areas;
        } );


        rng = calcRange( d );
        width = rng[1] - rng[0];

        breadthFirstTraverse( d, function ( d ) {
            if ( d.parent ) {
                d.x = d.parent.x + d.relX;
            } else {
                d.x = -rng[0];
            }
        } );

        return width;
    }



    function createNameStr ( nameSet, d ) {
        var s;

        if ( nameSet.length <= 1 ) {
            s = String() + d.val;

        } else {
            s = [String(), d.name, ' : ', d.val].join( '' );
        }

        d._vtName = s;

        if ( s.length > conf[CONF_MAX_STRING_LEN] ) {
            d._vtIsAbbreviated = true;

            if ( conf[CONF_SHOW_ELLIPSIS] ) {
                s = s.substring( 0, conf[CONF_MAX_STRING_LEN] ) + '...';
            } else {
                s = s.substring( 0, conf[CONF_MAX_STRING_LEN] );
            }
        }

        return s;
    }



    function addName ( d, name, val, nameSet ) {
        var i;

        i = indexOf.call( nameSet, name );

        if ( i === -1 ) {
            nameSet.push( name );
        }

        if ( ! d._vtNameTbl ) {
            d._vtNameTbl = [];
        }

        d._vtNameTbl.push( {name: name, val: val} );
    }



    function setLinkName ( d, name, index, set ) {
        var i;

        i = indexOf.call( set, name );

        if ( i === -1 ) {
            set.push( name );
        }

        if ( index !== undefined && index !== null ) {
            name = ['[', index, ']'].join( '' );
        }

        d._vtLinkName = name;
    }



    function addChildNode ( d, name, child, index, linkNameSet )
    {
        if ( ! d._vtChildren ) {
            d._vtChildren = [];
        }

        setLinkName( child, name, index, linkNameSet );

        d._vtChildren.push( child );
    }



    function setVtreeInfo ( d, nameSet, linkNameSet )
    {
        var i, name, data, item, type, dummy;

        for ( name in d ) {
            if ( ! d.hasOwnProperty( name ) ) {
                continue;
            }

            if ( name.length >= 3 && name[0] === '_' && name[1] === 'v' && name[2] === 't' ) {
                continue;
            }

            data = d[name];
            delete d[name];

            if ( isArray( data ) ) {
                if ( d._vtIsDummy ) {
                    for ( i = 0; i < data.length; i++ ) {
                        item = data[i];
                        type = typeof item;

                        if ( item === null || type === 'string' || type === 'number' || type === 'boolean' ) {
                            item = { name: item };
                        }

                        addChildNode( d, name, item, i, linkNameSet );
                        setVtreeInfo( item, nameSet, linkNameSet );
                    }
                } else {
                    dummy = {};
                    dummy._vtIsDummy = true;
                    dummy[name] = data;

                    addChildNode( d, name, dummy, null, linkNameSet );
                    setVtreeInfo( dummy, nameSet, linkNameSet );
                }
            } else if ( data !== null && typeof data === 'object' ) {
                addChildNode( d, name, data, null, linkNameSet );
                setVtreeInfo( data, nameSet, linkNameSet );
            } else {
                addName( d, name, data, nameSet );
            }
        }
    }



    function removeDummyArray ( root )
    {
        traverse( root, function ( d ) {
            var i, dummy, args;

            d._vtLinkName = '';

            if ( d._vtChildren ) {
                for ( i = d._vtChildren.length - 1; i >= 0; i-- ) {
                    if ( d._vtChildren[i]._vtIsDummy ) {
                        dummy = d._vtChildren[i];

                        if ( dummy._vtChildren ) {
                            args = [i, 1];
                            args = args.concat( dummy._vtChildren );

                            Array.prototype.splice.apply( d._vtChildren, args );
                        }
                    }
                }
            }
        } );
    }



    function parseText ( text, nameSet, linkNameSet )
    {
        var data, type;

        try {
            data = JSON.parse( text );
        } catch ( e ) {
            text = text.replace(
                /([{,])\s*([^":\[\]{},\s]+)\s*:/g,
                function ( match, sep, s ) {
                    return [ sep, ' "', s, '":'].join( '' );
                }
            );

            text = text.replace(
                /:\s*([^",\[\]{}\s]+)\s*([,}])/g,
                function ( match, s, sep ) {
                    return [': "', s, '"', sep].join( '' );
                }
            );

            try {
                data = JSON.parse( text );
            } catch ( err ) {
                return null;
            }
        }

        type = typeof data;

        if ( data === null || type === 'string' || type === 'number' || type === 'boolean' ) {
            data = { name: data };
        } else if ( isArray( data ) ) {
            if ( data.length === 1 ) {
                data = data[0];
            } else {
                data = { name: '/', children: data };
            }
        }

        setVtreeInfo ( data, nameSet, linkNameSet );

        if ( linkNameSet.length <= 1 ) {
            removeDummyArray( data );
        }

        return data;
    }



    function configVtree ( newConf )
    {
        var v;

        newConf = newConf || {};


        v = newConf[CONF_MAX_STRING_LEN];

        if ( v && typeof v === 'number' && v >= 1 ) {
            conf[CONF_MAX_STRING_LEN] = v;
        } else {
            conf[CONF_MAX_STRING_LEN] = DEFAULT_MAX_STRING_LEN;
        }


        if ( newConf[CONF_SHOW_ELLIPSIS] ) {
            conf[CONF_SHOW_ELLIPSIS] = true;
        } else {
            conf[CONF_SHOW_ELLIPSIS] = false;
        }
    }



    function vtreeConverts ( text, container, userConf )
    {
        var treeData, width, height, nameSet, linkNameSet,
            svg, svgGroup, tooltip, tree, diagonal;


        configVtree( userConf );


        function onMouseOver ( d )
        {
            if ( ! d._vtIsAbbreviated ) {
                return;
            }

            tooltip.transition()
                .duration( 200 )
                .style( 'opacity', 0.9 );

            tooltip.text( d._vtName )
                .style( 'left', (d3.event.pageX) + 'px')
                .style( 'top',  (d3.event.pageY - 14) + 'px');
        }



        function onMouseOut ( d )
        {
            if ( ! d._vtIsAbbreviated ) {
                return;
            }

            tooltip.transition()
                .duration( 500 )
                .style( 'opacity', 0 );

            tooltip.text( '' );
        }



        function update ( root )
        {
            var i, nodes, links, node, nodeEnter, nodeName, link, depthMaxRow = [], curMaxId = 0, lastWidth, lastHeight;

            nodes = tree.nodes( root ).reverse();
            links = tree.links( nodes );


            // calc depthMaxRow
            breadthFirstTraverse( root, function ( d ) {
                if ( depthMaxRow[d.depth] === undefined ) {
                    depthMaxRow[d.depth] = 1;
                }

                if ( d._vtNameTbl && d._vtNameTbl.length > depthMaxRow[d.depth] ) {
                    depthMaxRow[d.depth] = d._vtNameTbl.length;
                }
            } );


            nodes.forEach( function ( d ) {
                var i, extY = 0;

                if ( d.depth > 0 ) {
                    for ( i = 0; i < d.depth; i++ ) {
                        extY += depthMaxRow[i] * STR_PX;
                    }
                }

                d.y = extY + (d.depth * 50);
            } );


            // calc lastHeight
            lastHeight = 0;

            for ( i = 0; i < depthMaxRow.length; i++ ) {
                lastHeight += depthMaxRow[i] * STR_PX;
            }

            lastHeight +=  (depthMaxRow.length - 1) * 50 + MARGIN * 2 + 10;


            node = svgGroup.selectAll( 'g.vtree-node' )
                .data( nodes, function ( d ) {
                    if ( ! d.id ) {
                        d.id = ++curMaxId;
                    }

                    return d.id;
                } );


            nodeEnter = node.enter().append( 'g' )
                .attr( 'class', 'vtree-node' );


            // link name
            nodeEnter.append( 'text' )
                .text( function ( d ) { return d._vtLinkName || ''; } )
                .style( 'fill-opacity', 1 )
                .attr( 'y', -4 )
                .attr( 'text-anchor', 'middle' )
                .each( function ( d ) {
                    d._vtCaptionWidth = this.getBBox().width + RECT_MARGIN * 2;
                } );


            nodeEnter.append( 'rect' );


            // name
            nodeName = nodeEnter.append( 'text' )
                .attr( 'y', TEXT_TOP )
                .attr( 'dy', '.35em' )
                .attr( 'class', 'vtree-name' )
                .style( 'fill-opacity', 1 );


            // name list
            nodeName.selectAll( 'tspan' )
                .data( function ( d ) { return d._vtNameTbl || []; } )
                .enter()
                .append( 'tspan' )
                .text( function ( d ) {
                    return createNameStr( nameSet, d );
                } )
                .attr( 'x', 0 )
                .attr( 'dy', function ( d, i ) { if ( i !== 0 ) { return '1em'; } } )
                .on( 'mouseover', onMouseOver )
                .on( 'mouseout', onMouseOut );


            nodeName
                .each( function ( d ) {
                    var bbox = this.getBBox();

                    d._vtNameWidth = bbox.width + RECT_MARGIN * 2;

                    if ( d._vtCaptionWidth ) {
                        d._vtWidth = Math.max( d._vtCaptionWidth, d._vtNameWidth );
                    } else {
                        d._vtWidth = d._vtNameWidth;
                    }

                    d._vtHeight = bbox.height + RECT_MARGIN * 2;
                } )
                .attr( 'x', function ( d ) { return -d._vtNameWidth / 2 + 4; } );


            nodeName.selectAll( 'tspan' )
                .attr( 'x', function () {
                    var parent = this.parentNode.__data__;

                    return -parent._vtNameWidth / 2 + 4;
                } );


            lastWidth = calcNodePos( treeData );
            lastWidth += MARGIN * 2;


            nodeEnter.attr( 'transform', function ( d ) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                } );


            nodeEnter.select( 'rect' )
                .attr( 'x', function ( d ) { return -d._vtNameWidth / 2; } )
                .attr( 'width', function ( d ) { return d._vtNameWidth; } )
                .attr( 'height', function ( d ) { return d._vtHeight; } )
                .style( 'fill', function ( d ) { return d._vtColor; } )
                .filter( function ( d ) { return d._vtIsDummy; } )
                    .attr( 'class', 'vtree-dummy-array' )
                    .attr( 'rx', 10 )
                    .attr( 'ry', 10 );


            link = svgGroup.selectAll( 'path.vtree-link' )
                .data( links, function ( d ) { return d.target.id; } );


            link.enter().insert( 'path', 'g' )
                .attr( 'class', 'vtree-link' )
                .attr( 'd', diagonal );


            svg.attr( 'width', lastWidth ).attr( 'height', lastHeight );
        }


        container.innerHTML = '';

        nameSet = [];
        linkNameSet = [];

        treeData = parseText( text, nameSet, linkNameSet );

        if ( ! treeData ) {
            container.innerHTML = '<p>Parse Error</p>';
            return;
        }

        width = DEFAULT_WIDTH - MARGIN * 2;
        height = DEFAULT_HEIGHT - MARGIN * 2;

        tree = d3.layout.tree().size( [height, width] )
            .children( function ( d ) {
                return ( ! d._vtChildren || d._vtChildren.length === 0 ) ? null : d._vtChildren;
            } );

        diagonal = d3.svg.diagonal()
            .projection( function(d) { return [d.x, d.y]; } );

        svg = d3.select( container ).append( 'svg' )
            .attr( 'width', width + MARGIN * 2 )
            .attr( 'height', height + MARGIN * 2 );

        svgGroup = svg.append( 'g' )
            .attr( 'transform', ['translate(' + MARGIN + ',' + MARGIN + ')'].join( '' ) );

        tooltip = d3.select( container ).append( 'div' )
            .attr( 'class', 'vtree-tooltip' )
            .style( 'opacity', 0 );

        update( treeData );


    }


    return {
        converts: vtreeConverts,

        CONF_MAX_STRING_LEN: CONF_MAX_STRING_LEN,
        CONF_SHOW_ELLIPSIS: CONF_SHOW_ELLIPSIS
    };
}());

