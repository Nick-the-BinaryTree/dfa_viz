const CHAR_OFFSET = -3;
const LINE_OFFSET = 8;
const PREV_STATE = 'Backspace';
const RADIUS_SCALE_FACTOR = 5;
const WINDOW_PADDING = 30;
const WINDOW_VERTICAL_PERCENTAGE_USED = .9;

const colors = d3.scaleOrdinal(d3.schemeCategory20c);
let curNodeID = 0, edgeLabels, edgePaths, link, node, simulation, svg;

const graph = {
  nodes: [
    {
      "id": "0",
      "curState": false,
      "endState": false,
    },
  ],
  edges: [
    // {
    //   "source": 0,
    //   "target": 1,
    //   "input": "A",
    // },
    // {
    //   "source": 1,
    //   "target": 2,
    //   "input": "B",
    // },
    // {
    //   "source": 2,
    //   "target": 3,
    //   "input": "C",
    // },
    // {
    //   "source": 1,
    //   "target": 0,
    //   "input": PREV_STATE,
    // },
    // {
    //   "source": 2,
    //   "target": 1,
    //   "input": PREV_STATE,
    // },
    // {
    //   "source": 3,
    //   "target": 2,
    //   "input": PREV_STATE,
    // },
  ]
}

window.onload = () => {
  initNodeCountDropdown();
  initSim();
}

function initNodeCountDropdown() {
  const dropdown = document.getElementById('nodeCountDropdown');

  for (let i=1; i <= 100; i++) {
    const newOption = document.createElement("OPTION");
    const newOptionText = document.createTextNode(i);
    newOption.appendChild(newOptionText);

    dropdown.appendChild(newOption);
  }

  dropdown.onchange = changeNodeCount;
}

function changeNodeCount(newCount) {
  newNodes = [];

  for (let i=0; i<newCount.target.value; i++) {
    newNodes.push({
      "id": ""+i,
      "curState": false,
      "endState": false,
    });
  }

  graph.nodes = newNodes;
  updateNodes(graph.nodes, true);
}

function initSim() {
  svg = d3.select("svg"),

  svg.append('defs').append('marker')
    .attrs({
      'id':'arrowhead',
      'viewBox':'-0 -5 10 10',
      'refX':13,
      'refY':0,
      'orient':'auto',
      'markerWidth':15,
      'markerHeight':15,
      'xoverflow':'visible'
      })
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#93ff9c6c')
    .style('stroke','none');

  simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(window.innerWidth/2, window.innerHeight/2));

  updateNodes(graph.nodes);
}

function updateNodes(nodes, isInitialSet=false) {
  if (isInitialSet) {
    svg.selectAll(".node").remove();
  }

  node = svg.selectAll(".node")
    .data(nodes);

  node.selectAll('circle')
    .classed("highlight", d => d.curState)
    .classed("endState", d => d.endState);

  const nodeEnter = node.enter()
    .append("g")
    .attr("class", "node")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    );

  nodeEnter.append("circle")
    .attr("r", (d => _generateNodeSize(d.id)))
    .style("fill", (d, i) => colors(i));

  nodeEnter.append("text")
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
    .on("tick", ticked);
  simulation.alphaTarget(.03).restart();
}

function updateGraph(nodes, links) {
  updateNodes(nodes);
  edgePaths = svg.selectAll(".edgePath")
    .data(links)

  const edgePathsEnter = edgePaths.enter()
    .append('path')
    .attrs({
        'class': 'edgePath',
        'id': (d, i) => 'edgePath' + i,
        'fill-opacity': 0,
        'stroke-opacity': 0
    })
    .style("pointer-events", "none");

  edgeLabels = svg.selectAll(".edgeLabel")
    .data(links);

  const edgeLabelsEnter = edgeLabels.enter()
    .append('text')
    .style("pointer-events", "none")
    .attrs({
        'class': 'edgeLabel',
        'id': (d, i) => 'edgeLabel' + i,
        'font-size': 14,
        'fill': '#aaa'
    });

  edgeLabelsEnter.append('textPath')
    .attrs({
      'startOffset': "50%",
      'xlink:href': (d, i) => '#edgePath' + i
    })
    .style("pointer-events", "none")
    .style("text-anchor", "middle")
    .text(d => d.input);

  link = svg.selectAll(".link")
    .data(links);

  const linkEnter = link.enter()
    .append("line")
    .attrs({
      'class': 'link',
      'marker-end': 'url(#arrowhead)'
    })

  linkEnter.append("title")
    .text(d => d.input);

  link = linkEnter.merge(link);
  edgePaths = edgePathsEnter.merge(edgePaths);
  edgeLabels = edgeLabelsEnter.merge(edgeLabels);

  simulation.force("link")
    .links(links);
}

function ticked() {
  console.log("ticked");
  node
    .attr("transform", d => "translate("
      + Math.max(WINDOW_PADDING, Math.min(window.innerWidth-WINDOW_PADDING, d.x)) + ", "
      + Math.max(WINDOW_PADDING, Math.min(window.innerHeight*WINDOW_VERTICAL_PERCENTAGE_USED-WINDOW_PADDING,
        d.y)) + ")");

  // if (link && edgePaths) {
  //   const attrs = [['x1', 'source', 'x'], ['x2', 'source', 'x'], ['y1', 'target', 'y'], ['y2', 'target', 'y']];
  //
  //   for (const attr of attrs) {
  //     link.attr(attr[0], d => {
  //         const newPos = _offset(d.input, d[attr[1]][attr[2]])
  //
  //         if (newPos > (attr[2] === 'x' ? window.innerWidth : window.innerHeight)) {
  //             return attr[2] === 'x' ? window.innerWidth : window.innerHeight;
  //         } else if (newPos < 0) {
  //           return 0;
  //         } else {
  //           return newPos;
  //         }
  //     })
  //   }

    link
      .attr("x1", d => _offset(d.input, d.source.x))
      .attr("y1", d => _offset(d.input, d.source.y))
      .attr("x2", d => _offset(d.input, d.target.x))
      .attr("y2", d => _offset(d.input, d.target.y));

    edgePaths.attr('d', d => 'M ' + _offset(d.input, d.source.x) + ' ' + _offset(d.input, d.source.y)
      + ' L ' + _offset(d.input, d.target.x) + ' ' + _offset(d.input, d.target.y));
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
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}


function setCurState(newID) {
  graph.nodes[curNodeID].curState = false;
  curNodeID = newID;
  graph.nodes[curNodeID].curState = true;
  updateGraph(graph.nodes, graph.edges);
}

function setEndState() {
  graph.nodes[curNodeID].endState = true;
  setCurState(0);
}

function prevState() {
  if (curNodeID === 0) {
    return;
  }
  const curString = graph.nodes[curNodeID].data;
  const toSearch = curString.substring(0, curString.length-1);

  setCurState(toSearch ? _search(toSearch) : 0);
}

const _generateNodeSize = nodeText => {
  return (8+Math.random()*10) + RADIUS_SCALE_FACTOR*nodeText.length
}

const _offset = (input, x) => input === PREV_STATE ? x + LINE_OFFSET : x - LINE_OFFSET;

const _search = (s) => {
  for (let node of graph.nodes) {
    if (node.data === s) {
      return node.id;
    }
  }
  return null;
}

window.addEventListener('resize', () => {
  simulation.force('center')
    .x(window.innerWidth / 2)
    .y(window.innerHeight*WINDOW_VERTICAL_PERCENTAGE_USED / 2);

  simulation.alpha(0.3).restart();
});
