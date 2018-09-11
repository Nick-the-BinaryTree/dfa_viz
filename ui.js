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
const endStateDropdown = document.getElementById('nodeEndStateDropdown');
const submitButton = document.getElementById('submitEdgeChange');

  initEdgeSelectDropdowns();
  initLanguageValueDropdown();

  document.getElementById('addEdgesPromptContainer')
    .style.display='block';

  endStateDropdown.onchange = updateEndState;
  endStateDropdown.onfocus = () => {
    endStateDropdown.selectedIndex = -1;
    endStateDropdown.blur();
  };
  submitButton.onclick = submitEdge;
}

function changeNodeCount(newCount) {
  newNodes = [];

  for (let i=0; i<newCount.target.value; i++) {
    newNodes.push({
      'id': ''+i,
      incomingNodes: {},
      'endState': false,
    });
  }

  graph.nodes = newNodes;
  updateNodes(true);
}

function removeCurEdge(source, input) {
  let found = false;

  for (let i=0; i < graph.edges.length; i++) {
    if (graph.edges[i].source.id === source) {
      for (let j=0; j < graph.edges[i].input.length; j++) {

        if (graph.edges[i].input[j] === input) {
          graph.edges[i].input
          graph.edges[i].input.splice(j, 1);
          graph.nodes[graph.edges[i].target.id].incomingNodes[source] = false;

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

  // Look for pre-existing edge between source and target
  if (!tryAddToCurEdge(source, input, target)) {
    // If not push new
    graph.edges.push({source: source, target: target, input: [input]});
    graph.nodes[target].incomingNodes[source] = graph.nodes[source].incomingNodes[target] ? 2 : 1;
  };

  updateEdges(true);
}

function tryAddToCurEdge(source, input, target) {
  for (let i=0; i < graph.edges.length; i++) {
    const edgeIndex= _searchSrcTar(source, target);

    if (edgeIndex !== false) {
      graph.edges[edgeIndex].input.push(input);
      graph.nodes[target].incomingNodes[source] = graph.nodes[source].incomingNodes[target] ? 2 : 1;
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
