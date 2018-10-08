function initUI() {
  const submitButton = document.getElementById('submitNodeCountAndLangSizeButton');
  submitButton.onclick = submitNodeCountAndLangSize;

  initLanguageSizeDropdown();
  initNodeCountDropdown();
}

function initLanguageSizeDropdown() {
  const languageSizeDropdown = document.getElementById('languageSizeDropdown');

  languageSizeDropdown.onchange = e => {
    languageSize = e.target.value

    setSelfLoops();
  };
}

function initLanguageValueDropdown() {
  const dropdown = document.getElementById('languageValueDropdown');

  for (let i=0; i < languageSize; i++) {
    const newOption = document.createElement('OPTION');
    const newOptionText = document.createTextNode(LANGUAGE[i]);

    newOption.appendChild(newOptionText);
    dropdown.appendChild(newOption);
  }
}

function initNodeCountDropdown() {
  const countDropdown = document.getElementById('nodeCountDropdown');

  for (let i=1; i <= 100; i++) {
    const newOption = document.createElement('OPTION');
    const newOptionText = document.createTextNode(i);

    newOption.appendChild(newOptionText);
    countDropdown.appendChild(newOption);
  }

  countDropdown.onchange = changeNodeCount;
}

function initEdgeSelectDropdowns() {
  const dropdowns = document.getElementsByClassName('nodeDropdown');

  for (let i=0; i < graph.nodes.length; i++) {
    const newOption = document.createElement('OPTION');
    const newOptionText = document.createTextNode(''+i);
    newOption.appendChild(newOptionText);

    for (const dropdown of dropdowns) {
      dropdown.appendChild(newOption.cloneNode(true));
    }
  }
}

function initEdgeUI() {
  const container = document.getElementById('addEdgesPromptContainer');
  const endStateDropdown = document.getElementById('nodeEndStateDropdown');
  const exportButton = document.getElementById('exportButton');
  const graphText = document.getElementById('graphTextInput');
  const submitButton = document.getElementById('submitEdgeChange');

  generateGraphFromText(graphText.value);

  initEdgeSelectDropdowns();
  initLanguageValueDropdown();

  container.style.display='block';

  endStateDropdown.onchange = updateEndState;
  endStateDropdown.onfocus = () => {
    endStateDropdown.selectedIndex = -1;
    endStateDropdown.blur();
  };

  exportButton.onclick = exportGraph;
  submitButton.onclick = submitEdge;
}

function addEdge(graphObj, source, input, target) {
  // Look for pre-existing edge between source and target
  if (!tryAddToCurEdge(graphObj, source, input, target)) {
    // If not push new
    graphObj.edges.push({source: source, target: target, input: [input]});
    graphObj.nodes[target].incomingNodes[source] = graphObj.nodes[source].incomingNodes[target] ? 2 : 1;
  };
}

function changeNodeCount(newCount) {
  const newNodes = [];
  const newEdges = [];

  for (let i=0; i<newCount.target.value; i++) {
    newNodes.push({
      'id': ''+i,
      incomingNodes: {},
      'endState': false,
    });
  }

  graph.nodes = newNodes;

  updateNodes(true);
  setSelfLoops();
}

function exportGraph() {
  const res = [];
  let langRow = [null];

  // first row
  for (let i=0; i<languageSize; i++) {
    langRow.push(LANGUAGE[i])
  }
  res.push(langRow);

  // init node rows
  for (let i=0; i<graph.nodes.length; i++) {
    const nodeEdges = Array(langRow.length).fill(-1);

    nodeEdges[0] = i;

    res.push(nodeEdges);
  }

  // add edges
  for (const edge of graph.edges) {
    const srcIndex = parseInt(edge.source.id) + 1;
    const target = parseInt(edge.target.id);
    const inputsToMark = edge.input.map(x => langRow.indexOf(x));

    for (const inputIndex of inputsToMark) {
      res[srcIndex][inputIndex] = target;
    }
  }

  // mark ending nodes (must be done after edge creation)
  for (let i=0; i<graph.nodes.length; i++) {
    if (graph.nodes[i].endState) {
      res[i+1][0] = res[i+1][0] + '*';
    }
  }

  _copyToClipboard(JSON.stringify(res));
}

function generateGraphFromText(text) {
  if (!text) {
    return;
  }
  const oldGraph = JSON.stringify(graph);
  const oldLanguageSize = languageSize;

  try {
    if ((text[0] === '"' && text[text.length-1] === '"')
      || (text[0] === "'" && text[text.length-1] === "'")) {
      text = text.substring(1, text.length-1);
    }

    const newGraphArr = JSON.parse(text);
    const langRow = newGraphArr[0];
    const res = {nodes: [], edges: []};

    // get language
    languageSize = langRow.length-1;

    // get nodes
    for (let i=1; i<newGraphArr.length; i++) {
      res.nodes.push({
        'id': ''+(i-1),
        incomingNodes: {},
        endState: (''+newGraphArr[i][0]).length === 2
      });
    }

    // get edges
    for (let row=1; row<newGraphArr.length; row++) {
      for (let col=1; col<langRow.length; col++) {
        addEdge(res, ''+(row-1), langRow[col], ''+(newGraphArr[row][col]));
      }
    }
    graph = res;

    updateGraph(true);
  } catch(e) {
    graph = JSON.parse(oldGraph);
    languageSize = oldLanguageSize;
    alert('Error with graph text input ' + text);
    return;
  }
}

function removeCurEdge(source, input) {
  let found = false;

  for (let i=0; i < graph.edges.length; i++) {
    if (graph.edges[i].source.id === source) {
      for (let j=0; j < graph.edges[i].input.length; j++) {

        if (graph.edges[i].input[j] === input) {
          graph.edges[i].input
          graph.edges[i].input.splice(j, 1);
          graph.nodes[graph.edges[i].target.id].incomingNodes[source] = 0;
          graph.nodes[source].incomingNodes[graph.edges[i].target.id] = graph.nodes[source].incomingNodes[graph.edges[i].target.id] ? 1 : 0;

          if (graph.edges[i].input.length === 0) {
            graph.edges.splice(i, 1);
          }
          found = true;
          break;
        }
      }
    }
    if (found) {
      break;
    }
  }
}

function setSelfLoops() {
  const alphabet = [];
  const newEdges = [];

  for (let i=0; i < languageSize; i++) {
    alphabet.push(LANGUAGE[i]);
  }

  for (let i=0; i<graph.nodes.length; i++) {
    newEdges.push({
      'source': i,
      'target': i,
      'input': alphabet.slice()
    });
  }
  graph.edges = newEdges;

  updateEdges(true);
}

function submitNodeCountAndLangSize() {
  document.getElementById('nodeCountPromptContainer')
    .style.display='none';
  initEdgeUI();
}

function submitEdge() {
  const input = document.getElementById('languageValueDropdown').value;
  const source = ''+document.getElementById('nodeSourceDropdown').value;
  const target = ''+document.getElementById('nodeTargetDropdown').value;

  // Find where input currently goes for source and remove
  removeCurEdge(source, input);
  // try to add to existing or just add new
  addEdge(graph, source, input, target);

  updateEdges(true);
}

function tryAddToCurEdge(graphObj, source, input, target) {
  for (let i=0; i < graphObj.edges.length; i++) {
    const edgeIndex= _searchSrcTar(graphObj, source, target);

    if (edgeIndex !== false) {
      graphObj.edges[edgeIndex].input.push(input);
      graphObj.nodes[target].incomingNodes[source] = graphObj.nodes[source].incomingNodes[target] ? 2 : 1;

      return true;
    }
  }
  return false;
}

function updateEndState(e) {
  const nodeToggledID = e.target.value;

  graph.nodes[nodeToggledID].endState = !graph.nodes[nodeToggledID].endState;

  updateNodes();
}

window.addEventListener('resize', () => {
  simulation.force('center')
    .x(window.innerWidth / 2)
    .y(window.innerHeight*WINDOW_VERTICAL_PERCENTAGE_USED / 2);

  simulation.alpha(0.3).restart();
});

// credits: https://hackernoon.com/copying-text-to-clipboard-with-javascript-df4d4988697f
const _copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

const _searchSrcTar = (graphObj, src, tar) => {
  for (let i=0; i < graphObj.edges.length; i++) {
    // source/target will be an object w/ id after graph inits but just string before
    if (graphObj.edges[i].source.id === src && graphObj.edges[i].target.id === tar
      || graphObj.edges[i].source === src && graphObj.edges[i].target === tar) {
      return i;
    }
  }
  return false;
}
