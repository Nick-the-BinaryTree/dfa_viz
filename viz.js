function initSim() {
  const arrowheadAttrs1A = {
    'id':'arrowheadA',
    'markerWidth':15,
    'markerHeight':15,
    'refX': 0,
    'refY': 0,
    'orient':'auto',
    'viewBox':'-0 -5 10 10',
    'xoverflow':'visible'
  };
  const arrowheadAttrs1B = Object.assign({}, arrowheadAttrs1A,
    {'id': 'arrowheadB', refX: -25});
  const arrowheadAttrs2 = {
    'd': 'M 0,-5 L 10 ,0 L 0,5',
    'fill': '#0000004C'
  };

  svg = d3.select('svg');

  svg.append('defs').append('marker')
    .attrs(arrowheadAttrs1A)
    .append('svg:path')
    .attrs(arrowheadAttrs2);
    svg.append('defs').append('marker')
      .attrs(arrowheadAttrs1B)
      .append('svg:path')
      .attrs(arrowheadAttrs2);

  simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id).distance(200))
    .force('charge', d3.forceManyBody().strength(-50).distanceMax(100))
    .force('collisionForce', d3.forceCollide(20).strength(5))
    .force('center', d3.forceCenter(window.innerWidth/2, window.innerHeight/2));

  updateGraph();
}

function updateNodes(clearPrev=false) {
  if (clearPrev) {
    svg.selectAll('.node').remove();
  }

  nodes = graph.nodes;
  node = svg.selectAll('.node')
    .data(nodes);

  node.selectAll('circle')
    .classed('endState', d => d.endState);

  const nodeEnter = node.enter()
    .append('g')
    .attr('class', 'node')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    );

  nodeEnter.append('circle')
    .attr('r', (d => _generateNodeSize(d.id)))
    .style('fill', (d, i) => colors(i));

  nodeEnter.append('text')
    .attrs({
      'dx': d => d.id.length*CHAR_OFFSET,
      'dy': -CHAR_OFFSET,
      'fill': '#000',
      'font-size': 14,
      'stroke': 'none'
    })
    .text(d => d.id);

  node = nodeEnter.merge(node);

  simulation
    .nodes(nodes)
    .on('tick', ticked);
  simulation.alphaTarget(.03).restart();
}

function updateEdges(clearPrev=false) {
  if (clearPrev) {
    svg.selectAll('.edgeLabel,.edgePath,.link').remove();
  }

  links = graph.edges;

  edgePaths = svg.selectAll('.edgePath')
    .data(links)

  const edgePathsEnter = edgePaths.enter()
    .append('path')
    .attrs({
        'class': 'edgePath lineStyle',
        'id': (d, i) => 'edgePath' + i,
        'fill-opacity': 0
    })
    .style('pointer-events', 'none');

  edgeLabels = svg.selectAll('.edgeLabel')
    .data(links);

  const edgeLabelsEnter = edgeLabels.enter()
    .append('text')
    .style('pointer-events', 'none')
    .attrs({
        'class': 'edgeLabel',
        'id': (d, i) => 'edgeLabel' + i,
        'font-size': 14,
        'fill': '#aaa'
    });

  edgeLabelsEnter.append('textPath')
    .attrs({
      'startOffset': '50%',
      'xlink:href': (d, i) => '#edgePath' + i
    })
    .style('pointer-events', 'none')
    .style('text-anchor', 'middle')
    .text(d => _arrToStr(d.input));

  link = svg.selectAll('.link')
    .data(links);

  const linkEnter = link.enter()
    .append('polyline')
    .attrs({
      'class': 'link lineStyle',
    })

  linkEnter.append('title')
    .text(d => _arrToStr(d.input));

  link = linkEnter.merge(link);
  edgePaths = edgePathsEnter.merge(edgePaths);
  edgeLabels = edgeLabelsEnter.merge(edgeLabels);

  simulation.force('link')
    .links(links);
  simulation.alphaTarget(.03).restart();
}

function updateGraph(clearPrev=false) {
  updateNodes(clearPrev);
  updateEdges(clearPrev);
}

function ticked() {
  node
    .attr('transform', d => 'translate(' + _borderX(d.x) + ', ' + _borderY(d.y) + ')');
  // node
  //   .attr("cx", d => _borderX(d.x) })
  //   .attr("cy", d => _borderX(d.x) });

  if (link != null && edgePaths != null) {
    link.attrs(d => {
        if (d.source.id === d.target.id) {
            return {};
        }
        // const offsetVals = [['x1', 'source', 'x'], ['y1', 'source', 'y'], ['x2', 'target', 'x'], ['y2', 'target', 'y']];
        // return offsetVals.reduce((acc, cur) => {
        //   acc[cur[0]] = _offset(d.source.id, d.target.id, d[cur[1]][cur[2]]);
        //   return acc;
        // }, {});
        return {
          'points': d.source.x + "," + d.source.y + " " +
               (d.source.x + d.target.x)/2 + "," + (d.source.y + d.target.y)/2 + " " +
               d.target.x + "," + d.target.y,
          'marker-mid': 'url(#arrowheadB)'
        };
    });

    edgePaths.attrs(d => {
      if (d.source.id === d.target.id) {
        const drx = 30,
          dry = 25;
          largeArc = 1,
          sweep = 1,
          xRotation = -45,
          x1 = d.source.x-SELF_CURVE_OFFSET,
          x2 = d.target.x+SELF_CURVE_OFFSET*2,
          y1 = d.source.y-SELF_CURVE_OFFSET,
          y2 = d.target.y+SELF_CURVE_OFFSET*2;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dr = Math.sqrt(dx * dx + dy * dy);
        const curve = ('M' + _borderX(x1) + ',' + _borderY(y1) + 'A' + drx + ',' + dry + ' '
          + xRotation + ',' + largeArc + ',' + sweep + ' ' + _borderX(x2) + ',' + _borderY(y2));

        return {
          'd': curve,
          'marker-end': 'url(#arrowheadA)',
          'stroke-opacity': 1,
          'stroke': '#000'
        }
      }
      return {
        d: 'M ' + _offset(d.source.id, d.target.id, d.source.x) + ' ' + _offset(d.source.id, d.target.id, d.source.y)
          + ' L ' + _offset(d.source.id, d.target.id, d.target.x) + ' ' + _offset(d.source.id, d.target.id, d.target.y),
        'stroke-opacity': 0,
      }
    });
  }
}

function dragstarted(d) {
  if (!d3.event.active) {
    simulation.alphaTarget(0.3).restart();
  }
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) {
    simulation.alphaTarget(0).restart();
  }
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

function setEndState() {
  graph.nodes[0].endState = true;
}

const _arrToStr = arr => {
  let res = arr[0];

  for (let i=1; i < arr.length; i++) {
    res += ', ' + arr[i];
  }
  return res;
}

const _borderX = x => {
  return Math.max(WINDOW_PADDING, Math.min(window.innerWidth-WINDOW_PADDING, x));
}

const _borderY = y => {
  return Math.max(WINDOW_PADDING,
    Math.min(window.innerHeight*WINDOW_VERTICAL_PERCENTAGE_USED-WINDOW_PADDING, y));
}

const _generateNodeSize = nodeText => {
  return (8+Math.random()*10) + RADIUS_SCALE_FACTOR*nodeText.length
}

const _offset = (src, tar, x) => {
  if (graph.nodes[src].incomingNodes[tar] === 2) {
    return x + LINE_OFFSET;
  } else if (graph.nodes[src].incomingNodes[tar] === 1) {
    return x - LINE_OFFSET;
  }
  return x;
}
