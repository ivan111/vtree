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
    var WIDTH = 960,
        HEIGHT = 800,
        MARGIN = 20,

        RE_NULL = /^\s*null\s*$/,
        RE_URL = /^\s*https?:\/\/[^\s<>]+\s*$/;



    function isArray( obj )
    {
        if ( Object.prototype.toString.call( obj ) === '[object Array]' ) {
            return true;
        }

        return false;
    }



    function addName ( d, name, val )
    {
        if ( ! d._vtNameTbl ) {
            d._vtNameTbl = [];
        }

        d._vtNameTbl.push( [{ val: name }, { val: val } ] );
    }



    function setLinkName ( d, name, index )
    {
        if ( index || index === 0 ) {
            name = ['[', index, ']'].join( '' );
        }

        d._vtLinkName = name;
    }



    function addChildNode ( d, name, child, index )
    {
        if ( ! d._vtChildren ) {
            d._vtChildren = [];
        }

        setLinkName( child, name, index );

        d._vtChildren.push( child );
    }



    function setVtreeInfo ( d )
    {
        var i, name, data, item, type, dummy;

        for ( name in d ) {
            if ( ! d.hasOwnProperty( name ) ) {
                continue;
            }

            if ( name.length >= 3 && name[0] === '_' && name[1] === 'v' && name[2] === 't' ) {
                continue;
            }

            if ( name === '_PyType' ) {
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

                        item._vtIsArrayItem = true;
                        item._vtArrayName = name;
                        item._vtArrayIndex = i;

                        addChildNode( d, name, item, i );
                        setVtreeInfo( item );
                    }
                } else {
                    dummy = {};
                    dummy._vtIsDummy = true;
                    dummy[name] = data;

                    addChildNode( d, [name, '[', data.length, ']'].join( '' ), dummy, null );
                    setVtreeInfo( dummy );
                }
            } else if ( data !== null && typeof data === 'object' ) {
                addChildNode( d, name, data, null );
                setVtreeInfo( data );
            } else {
                addName( d, name, data );
            }
        }
    }



    function str2json ( text )
    {
        var data;

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

        return data;
    }



    function createZoomFunc ( vt )
    {
        return function ()
        {
            var transform = ['translate(', d3.event.translate, ')scale(', d3.event.scale, ')'].join ( '' );

            vt.d3.g.attr( 'transform', transform );
        };
    }



    function createChildrenFunc ( vt )
    {
        return function ( d )
        {
            var i, children = null, args;

            if ( d._vtChildren && d._vtChildren.len !== 0 )
            {
                if ( vt._conf.showArrayNode ) {
                    children = d._vtChildren;
                } else {
                    children = d._vtChildren.slice( 0 );  // copy

                    for ( i = children.length - 1; i >= 0; i-- )
                    {
                        if ( children[i]._vtIsDummy )
                        {
                            args = [i, 1];

                            if ( children[i]._vtChildren ) {
                                args = args.concat( children[i]._vtChildren );
                            } else if ( children[i]._vtHiddenChildren) {
                                args = args.concat( children[i]._vtHiddenChildren );
                            }

                            children.splice.apply( children, args );
                        }
                    }

                    if ( children.length === 0 ) {
                        children = null;
                    }
                }
            }

            return children;
        };
    }



    function createSeparationFunc ( vt )
    {
        return function ( a, b )
        {
            if ( a.parent !== b.parent ) {
                return vt._conf.nodeMargin << 2;
            }

            return vt._conf.nodeMargin;
        };
    }



    function createHSeparationFunc ( vt )
    {
        return function ( depth )
        {
            return depth * (vt._conf.fontSize * 5);
        };
    }



    function createLinkNameStr ( vt, d )
    {
        var s;

        if ( ! vt._conf.showArrayNode && d._vtIsArrayItem ) {
            s = [d._vtArrayName, '[', d._vtArrayIndex, ']'].join( '' );
        } else {
            s = d._vtLinkName || '';
        }

        if ( s.length > vt._conf.maxNameLen ) {
            s = s.substring( 0, vt._conf.maxNameLen );

            if ( vt._conf.showEllipsis ) {
                s += '...';
            }
        }

        return s;
    }



    function createTableStr ( s, maxLen, showEllipsis )
    {
        s = s || '';

        if ( s.length > maxLen ) {
            s = s.substring( 0, maxLen );

            if ( showEllipsis ) {
                s += '...';
            }
        }

        return s;
    }



    function calcLinkNameWidth ( vt, d )
    {
        var s, w;

        s = createLinkNameStr( vt, d );

        vt.d3.ruler.text( s );
        w = vt.d3.ruler[0][0].offsetWidth;
        vt.d3.ruler.text( '' );

        return w;
    }



    function calcMaxColumnWidth ( vt, tbl, col )
    {
        var i, w, maxW, name, maxLen;

        if ( ! tbl || tbl.length === 0 ) {
            return 0;
        }

        maxW = vt._conf.fontSize / 2;

        if ( col === 0 ) {
            maxLen = vt._conf.maxNameLen;
        } else {
            maxLen = vt._conf.maxValueLen;
        }

        for ( i = 0; i < tbl.length; i++ )
        {
            name = tbl[i][col].val;
            name = createTableStr( name, maxLen, vt._conf.showEllipsis );

            vt.d3.ruler.text( name );
            w = vt.d3.ruler[0][0].offsetWidth;

            if ( w > maxW ) {
                maxW = w;
            }
        }

        vt.d3.ruler.text( '' );

        return maxW + (vt._conf.td_padding * 2);
    }



    function createNodeSizeFunc ( vt )
    {
        return function ( d )
        {
            var maxW, sumH, fontSize,
                maxNameW = 0, maxValW = 0, pad, linkNameW = 0, tbl;

            fontSize = vt._conf.fontSize;
            pad = vt._conf.td_padding;

            if ( d._vtLinkName && vt._conf.showLinkName ) {
                linkNameW = calcLinkNameWidth( vt, d );
            }

            tbl = d._vtNameTbl;

            if ( ! tbl || tbl.length === 0 )
            {
                maxW = fontSize + pad * 2;
                sumH = fontSize + pad * 2;
            }
            else
            {
                if ( vt._conf.showColumn[0] ) {
                    maxNameW = calcMaxColumnWidth( vt, tbl, 0 );
                }

                if ( vt._conf.showColumn[1] ) {
                    maxValW = calcMaxColumnWidth( vt, tbl, 1 );
                }

                maxW = maxNameW + maxValW;
                sumH = (fontSize + pad * 2) * tbl.length;
            }

            if ( vt._mode === vt.MODE_PYTHON_AST && d._PyType )
            {
                vt.d3.ruler.style( 'font-weight', 'bold' );
                vt.d3.ruler.text( d._PyType );
                w = vt.d3.ruler[0][0].offsetWidth;
                w += pad * 2;
                vt.d3.ruler.text( '' );
                vt.d3.ruler.style( 'font-weight', 'normal' );

                if ( w > maxW ) {
                    maxW = w;
                }

                if ( tbl && tbl.length !== 0 ) {
                    sumH += fontSize + pad * 2;
                }
            }

            d._vtWidth = maxW;

            if ( linkNameW > maxW ) {
                maxW = linkNameW;
            }

            return [maxW, sumH];
        };
    }


    function createTooltipOnMouseOverFunc ( vt )
    {
        return function ( d )
        {
            vt.d3.tooltip.transition()
                .duration( 200 )
                .style( 'opacity', 0.9 );

            vt.d3.tooltip.text( d._vtOriginal )
                .style( 'left', (d3.event.pageX - vt.containerLeft) + 'px')
                .style( 'top',  (d3.event.pageY - vt.containerTop - vt._conf.fontSize) + 'px');
        };
    }



    function createTooltipOnMouseOutFunc ( vt )
    {
        return function onMouseOut ()
        {
            vt.d3.tooltip.transition()
                .duration( 500 )
                .style( 'opacity', 0 );

            vt.d3.tooltip.text( '' );
        };
    }



    function createCollapseFunc ( vt )
    {
        return function ( d )
        {
            if ( d._vtChildren === undefined && d._vtHiddenChildren === undefined ) {
                return;
            }

            if ( d._vtChildren ) {
                d._vtHiddenChildren = d._vtChildren;
                d._vtChildren = null;
            } else {
                d._vtChildren = d._vtHiddenChildren;
                d._vtHiddenChildren = null;
            }

            vt.update ( d );
        };
    }



    function VTree ( container, data )
    {
        this.d3 = {};
        this.d3.container = d3.select( container )
            .text( '' )
            .style( 'position', 'relative' );

        this.curMaxId = 0;

        this._conf = {};
        this._conf.fontSize = 14;
        this._conf.nodeMargin = 8;
        this._conf.td_padding = 4;
        this._conf.duration = 768;
        this._conf.showArrayNode = true;
        this._conf.showColumn = [];
        this._conf.showColumn[0] = true;
        this._conf.showColumn[1] = true;
        this._conf.showLinkName = true;
        this._conf.maxNameLen = 32;
        this._conf.maxValueLen = 32;
        this._conf.showEllipsis = true;

        this.width = WIDTH - MARGIN * 2;
        this.height= HEIGHT - MARGIN * 2;


        this.d3.zoomListener = d3.behavior.zoom()
            .scaleExtent( [1, 2] )
            .on( 'zoom', createZoomFunc( this ) );

        this.d3.msg = this.d3.container.append( 'div' )
            .attr( 'class', 'vtree-message' );

        this.d3.svg = this.d3.container.append( 'svg' )
            .attr( 'width', this.width )
            .attr( 'height', this.height )
            .call( this.d3.zoomListener );


        this.d3.g = this.d3.svg.append( 'g' )
            .attr( 'transform', ['translate(', MARGIN, ',', MARGIN, ')'].join( '' ) );


        this.d3.ruler = this.d3.container.append( 'span' )
            .text( '' )
            .style( 'visibility', 'hidden' )
            .style( 'white-space', 'nowrap' )
            .style( 'font', this._conf.fontSize + 'px sans-serif' );


        this.d3.tooltip = this.d3.container.append( 'div' )
            .attr( 'class', 'vtree-tooltip' )
            .style( 'opacity', 0 );


        this.d3.tree = d3.layout.vtree()
            .children( createChildrenFunc( this ) )
            .separation( createSeparationFunc( this ) )
            .hSeparation( createHSeparationFunc( this ) )
            .nodeSize( createNodeSizeFunc( this ) );


        this.d3.diagonal = d3.svg.diagonal()
            .projection( function ( d ) { return [d.x, d.y]; } );


        this.containerLeft = container.getBoundingClientRect().left;
        this.containerTop  = container.getBoundingClientRect().top;

        this.mode( this.MODE_NORMAL );

        this.data( data );
    }



    function vtree ( data, container )
    {
        return new VTree( data, container );
    }



    VTree.prototype.createLinkName = function ( nodeEnter, nodeUpdate )
    {
        var vt = this, showLinkName;

        showLinkName = this._conf.showLinkName;

        nodeEnter.filter( function ( d ) { return d._vtLinkName; } )
            .append( 'text' )
            .attr( 'class', 'vtree-link-name' );


        nodeUpdate.selectAll( '.vtree-link-name' )
            .text( function ( d ) {
                if ( ! showLinkName ) {
                    return '';
                }

                return createLinkNameStr( vt, d );
            } )
            .attr( 'y', -this._conf.fontSize / 3 )
            .attr( 'text-anchor', 'middle' )
            .style( 'font-size', this._conf.fontSize );
    };



    VTree.prototype.createDummyArray = function ( nodeEnter, nodeUpdate )
    {
        var r;

        r = this._conf.fontSize * 2 / 3;

        nodeEnter.filter( function ( d ) { return d._vtIsDummy; } )
            .append( 'circle' )
            .attr( 'class', 'vtree-dummy' )
            .attr( 'cy', r )
            .attr( 'r', r );


        nodeUpdate.selectAll( 'circle' )
            .style( 'fill', function ( d ) {
                if ( d._vtHiddenChildren ) {
                    return 'lightsteelblue';
                }

                return 'white';
            } );
    };



    VTree.prototype.createTables = function ( node, nodeEnter, nodeUpdate )
    {
        var vt = this, onMouseOver, onMouseOut, pad;

        // create table border
        nodeEnter.filter( function ( d ) { return ! d._vtIsDummy; } )
            .append( 'path' )
            .attr( 'class', 'vtree-table' );


        nodeUpdate.selectAll( '.vtree-table' )
            .attr( 'd', function ( d ) {
                var i, a = [], sepX, w2, y, stepH, nameW, tbl, numRows, rowStartY;

                tbl = d._vtNameTbl;

                if ( tbl && tbl.length !== 0 ) {
                    nameW = calcMaxColumnWidth( vt, tbl, 0 );
                } else {
                    nameW = 0;
                }

                w2 = d._vtWidth / 2;

                if ( vt._conf.showColumn[0] === false ) {
                    sepX = -w2;
                } else {
                    sepX = -w2 + nameW;
                }

                // rect
                a.push( ['M', -w2, 0 ].join( ' ' ) );
                a.push( ['L', w2, 0 ].join( ' ' ) );
                a.push( ['L', w2, d.h ].join( ' ' ) );
                a.push( ['L', -w2, d.h ].join( ' ' ) );
                a.push( 'Z' );

                if ( tbl && tbl.length !== 0)
                {
                    numRows = tbl.length;

                    if ( vt._mode === vt.MODE_PYTHON_AST && d._PyType ) {
                        numRows++;
                        rowStartY = d.h / numRows;
                        y = rowStartY;
                    } else {
                        rowStartY = 0;
                        y = d.h / tbl.length;
                    }

                    stepH = (d.h - rowStartY) / tbl.length;


                    if ( vt._conf.showColumn[0] && vt._conf.showColumn[1] )
                    {
                        a.push( ['M', sepX, rowStartY ].join( ' ' ) );
                        a.push( ['L', sepX, d.h ].join( ' ' ) );
                    }

                    for ( i = 0; i < numRows; i++ )
                    {
                        a.push( ['M', -w2, y ].join( ' ' ) );
                        a.push( ['L', w2, y ].join( ' ' ) );

                        y += stepH;
                    }
                }

                return a.join( ' ' );
            } )
            .style( 'fill', function ( d ) {
                if ( d._vtHiddenChildren ) {
                    return 'lightsteelblue';
                }

                return 'white';
            } );


        onMouseOver = createTooltipOnMouseOverFunc( this );
        onMouseOut = createTooltipOnMouseOutFunc( this );


        node.selectAll( 'g.vtree-row' ).remove();

        pad = vt._conf.td_padding;


        if ( vt._mode === vt.MODE_PYTHON_AST )
        {
            nodeEnter.filter( function ( d ) { return d._PyType; } )
                .append( 'text' )
                .attr( 'class', 'vtree-py-type' );


            nodeUpdate.selectAll( '.vtree-py-type' )
                .text( function ( d ) { return d._PyType; } )
                .attr( 'x', function ( d ) { return -d._vtWidth / 2 + pad; } )
                .attr( 'y', function ( d ) {
                    var len = 0;

                    if ( d._vtNameTbl ) {
                        len = d._vtNameTbl.length;
                    }

                    return d.h / (len + 1) - 2 - pad;
                } )
                .style( 'fill', 'darkslateblue' )
                .style( 'font-weight', 'bold' )
                .style( 'font-size', vt._conf.fontSize );
        }


        // create table text
        nodeUpdate.each( function ( d ) {
            var tbl, w2, nameW, stepH, sepX, name, val,
                maxNameLen, maxValueLen, showEllipsis;

            if ( ! d._vtNameTbl || d._vtNameTbl.length === 0 ) {
                return;
            }

            tbl = d._vtNameTbl;

            if ( tbl && tbl.length !== 0 ) {
                nameW = calcMaxColumnWidth( vt, tbl, 0 );
            } else {
                nameW = 0;
            }

            w2 = d._vtWidth / 2;

            if ( vt._conf.showColumn[0] === false ) {
                sepX = -w2;
            } else {
                sepX = -w2 + nameW;
            }

            maxNameLen = vt._conf.maxNameLen;
            maxValueLen = vt._conf.maxValueLen;
            showEllipsis = vt._conf.showEllipsis;

            d3.select( this ).selectAll( 'g' )
                .data( tbl )
                .enter()
                .append( 'g' )
                .attr( 'class', 'vtree-row' )
                .each( function ( row, rowNo ) {
                    var d3_this, d3_name, d3_val, h, dVal, linked;

                    d3_this = d3.select( this );

                    if ( vt._mode === vt.MODE_PYTHON_AST && d._PyType ) {
                        stepH = d.h / (tbl.length + 1);
                        h = stepH * (rowNo + 2) - 2 - pad;
                    } else {
                        stepH = d.h / tbl.length;
                        h = stepH * (rowNo + 1) - 2 - pad;
                    }

                    if ( vt._conf.showColumn[0] )
                    {
                        row[0]._vtOriginal = row[0].val || '';

                        name = createTableStr( row[0].val, maxNameLen, showEllipsis );

                        d3_name = d3_this.selectAll( 'text.vtree-name-col' )
                            .data( [row[0]] )
                            .enter()
                            .append( 'text' )
                            .attr( 'class', 'vtree-name-col' )
                            .text( name )
                            .attr( 'x', -w2 + pad )
                            .attr( 'y', h )
                            .style( 'font-size', vt._conf.fontSize );

                        d3_name.filter( function ( d ) { return d._vtOriginal.length > maxNameLen; } )
                            .on( 'mouseover', onMouseOver )
                            .on( 'mouseout', onMouseOut );
                    }


                    if ( vt._conf.showColumn[1] )
                    {
                        row[1]._vtOriginal = row[1].val || '';
                        val = createTableStr( row[1].val, maxValueLen, showEllipsis );

                        if ( RE_URL.test( row[1].val ) ) {
                            dVal = d3_this.append( 'a' )
                                .attr( 'xlink:href', row[1].val );
                            linked = true;
                        } else {
                            dVal = d3_this;
                            linked = false;
                        }

                        d3_val = dVal.selectAll( 'text.vtree-val-col' )
                            .data( [row[1]] )
                            .enter()
                            .append( 'text' )
                            .attr( 'class', 'vtree-val-col' )
                            .text( val )
                            .attr( 'x', sepX + pad )
                            .attr( 'y', h )
                            .style( 'font-size', vt._conf.fontSize );


                        d3_val.filter( function ( d ) { return d._vtOriginal.length > maxValueLen; } )
                            .on( 'mouseover', onMouseOver )
                            .on( 'mouseout', onMouseOut );

                        if ( linked ) {
                            dVal.attr( 'fill', '#00F' );
                        }
                    }
                } );
        } );


        this.createDummyArray( nodeEnter, nodeUpdate );
    };



    VTree.prototype.createNodes = function ( src, nodes )
    {
        var vt, node, nodeEnter, nodeUpdate;

        vt = this;

        node = this.d3.g.selectAll( 'g.vtree-node' )
            .data( nodes, function ( d ) {
                if ( ! d.id ) {
                    d.id = ++vt.curMaxId;
                }

                return d.id;
            } );


        nodeEnter = node.enter().append( 'g' )
            .attr( 'class', 'vtree-node' )
            .attr( 'transform', function () {
                return ['translate(', src.x0, ',', src.y0, ')'].join( '' );
            } )
            .style( 'opacity', 0 )
            .on( 'click', createCollapseFunc( this ) );


        nodeUpdate = node.transition()
            .duration( this._conf.duration )
            .attr( 'transform', function ( d ) {
                return ['translate(', d.x, ',', d.y, ')'].join( '' );
            } )
            .style( 'opacity', 1 );


        node.exit().transition()
            .duration( this._conf.duration )
            .attr( 'transform', function () {
                return ['translate(', src.x, ',', src.y, ')'].join( '' );
            } )
            .style( 'opacity', 0 )
            .remove();



        this.createLinkName( nodeEnter, nodeUpdate );

        this.createTables( node, nodeEnter, nodeUpdate );
    };



    VTree.prototype.createLinks = function ( src, links )
    {
        var link, diagonal;

        diagonal = this.d3.diagonal;

        link = this.d3.g.selectAll( 'path.vtree-link' )
            .data( links, function ( d ) { return d.target.id; } );


        link.enter().insert( 'path', 'g' )
            .attr( 'class', 'vtree-link' )
            .attr( 'd', function () {
                var o = { x: src.x0, y: src.y0 };

                return diagonal( { source: o, target: o } );
            } )
            .style( 'opacity', 0 );


        link.transition()
            .duration( this._conf.duration )
            .attr( 'd', diagonal )
            .style( 'opacity', 1 );


        link.exit().transition()
            .duration( this._conf.duration )
            .attr( 'd', function () {
                var o = { x: src.x, y: src.y };

                return diagonal( { source: o, target: o } );
            } )
            .style( 'opacity', 0 )
            .remove();
    };



    VTree.prototype.update = function ( src )
    {
        var i, d, nodes, links, size = {}, x, y;

        if ( ! src ) {
            src = this.root;
        }

        nodes = this.d3.tree( this.root, undefined, size );
        links = this.d3.tree.links( nodes );


        this.createNodes( src, nodes );
        this.createLinks( src, links );

        if ( size.width < this.width && size.height < this.height )
        {
            x = this.width / 2 - this.root.x;
            y = (this.height - size.height) / 2;
        }
        else if ( src === this.root )
        {
            x = this.width / 2 - this.root.x;

            if ( size.height < this.height ) {
                y = (this.height - size.height) / 2;
            } else {
                y = MARGIN;
            }
        }
        else
        {
            x = this.width / 2 - src.x;

            if ( size.height < this.height ) {
                y = (this.height - size.height) / 2;
            } else {
                y = this.height / 2 - src.y;
            }
        }

        this.d3.zoomListener.translate( [x, y] );
        this.d3.zoomListener.event( this.d3.g.transition().duration( this._conf.duration ) );


        // Stash the old positions for transition.
        for ( i = 0; i < nodes.length; i++ ) {
            d = nodes[i];

            d.x0 = d.x;
            d.y0 = d.y;
        }

        return this;
    };



    VTree.prototype.data = function ( data )
    {
        var json, type;

        if ( data === undefined || data === null ) {
            this.root = null;
            this.d3.msg.text( '' );

            return this;
        }

        type = typeof data;

        if ( type === 'string' ) {
            json = str2json( data );

            type = typeof json;
        } else {
            json = data;
        }


        if ( (json === null && RE_NULL.test( data ) ) || type === 'string' || type === 'number' || type === 'boolean' ) {
            json = { name: json };
        } else if ( isArray( json ) ) {
            json = { name: '/', children: json };
        }


        this.root = json;

        if ( this.root )
        {
            this.d3.msg.text( '' );

            setVtreeInfo ( this.root );

            this.root.x0 = 0;
            this.root.y0 = 0;
        }
        else
        {
            this.d3.msg.text( 'Parse Error' );
        }

        return this;
    };



    VTree.prototype.MODE_NORMAL = 1;
    VTree.prototype.MODE_PYTHON_AST = 2;
    VTree.prototype.MAX_MODE = 3;


    VTree.prototype.mode = function ( mode )
    {
        if ( typeof mode !== 'number' ) {
            return this;
        }

        if ( mode < 1 || mode >= this.MAX_MODE ) {
            return this;
        }

        this._mode = mode;

        return this;
    };



    function getNumberConf ( val, start, end )
    {
        if ( typeof val !== 'number' ) {
            return null;
        }

        if ( start && val < start ) {
            return start;
        }

        if ( end && val > end ) {
            return end;
        }

        return val;
    }



    function setNumberConf ( conf, name, val, start, end )
    {
        var v = getNumberConf( val, start, end );

        if ( v !== null ) {
            conf[name] = v;
            return true;
        }

        return false;
    }



    VTree.prototype.size = function ( width, height )
    {
        var w, h;

        w = getNumberConf( width, 32, 8096 );
        h = getNumberConf( height, 32, 8096 );

        if ( w === null || h === null ) {
            return this;
        }

        this.width = width;
        this.height = height;

        this.d3.svg
            .attr( 'width', width )
            .attr( 'height', height );

        return this;
    };



    VTree.prototype.conf = function ( name, val )
    {
        var cf;

        cf = this._conf;

        switch ( name )
        {
        case 'showEllipsis':
            cf.showEllipsis = !! val;
            break;


        case 'showArrayNode':
            cf.showArrayNode= !! val;
            break;


        case 'showLinkName':
            cf.showLinkName = !! val;
            break;


        case 'showColumn0':
            cf.showColumn[0] = !! val;

            if ( cf.showColumn[0] === false ) {
                cf.showColumn[1] = true;
            }
            break;


        case 'showColumn1':
            cf.showColumn[1] = !! val;

            if ( cf.showColumn[1] === false ) {
                cf.showColumn[0] = true;
            }
            break;


        case 'fontSize':
            setNumberConf( cf, name, val, 9, 32 );

            this.d3.ruler.style( 'font-size', cf.fontSize + 'px' );

            break;


        case 'nodeMargin':
            setNumberConf( cf, name, val, 1, 100 );
            break;


        case 'animeDuration':
            setNumberConf( cf, 'duration', val, 10, 10000 );
            break;


        case 'maxNameLen':
            setNumberConf( cf, name, val, 1, 1024 );
            break;


        case 'maxValueLen':
            setNumberConf( cf, name, val, 1, 1024 );
            break;


        default:
            break;
        }

        return this;
    };



    return vtree;
}());

