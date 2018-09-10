function initNodeCountDropdown() {
  const countDropdown = document.getElementById('nodeCountDropdown');
  const countSubmit = document.getElementById('setNodeCountButton');

  for (let i=1; i <= 100; i++) {
    const newOption = document.createElement('OPTION');
    const newOptionText = document.createTextNode(i);
    newOption.appendChild(newOptionText);

    countDropdown.appendChild(newOption);
  }

  countDropdown.onchange = changeNodeCount;
  countSubmit.onclick = submitNodeCount;
}

function initEdgeSelectDropdowns() {
  const nodeSource = document.getElementById('nodeSourceDropdown');
  const nodeTarget = document.getElementById('nodeTargetDropdown');

  for (let i=1; i <= graph.nodes.length; i++) {
    const newOption = document.createElement('OPTION');
    const newOptionText = document.createTextNode(i);
    newOption.appendChild(newOptionText);

    nodeSource.appendChild(newOption);
    nodeTarget.appendChild(newOption.cloneNode(true));
  }
}

function changeNodeCount(newCount) {
  newNodes = [];

  for (let i=0; i<newCount.target.value; i++) {
    newNodes.push({
      'id': ''+i,
      'curState': false,
      'endState': false,
    });
  }

  graph.nodes = newNodes;
  updateNodes(graph.nodes, true);
}

function submitNodeCount() {
  initEdgeSelectDropdowns();
  document.getElementById('nodeCountPromptContainer').style.display='none';
  document.getElementById('addEdgesPromptContainer').style.display='block';
}

window.addEventListener('resize', () => {
  simulation.force('center')
    .x(window.innerWidth / 2)
    .y(window.innerHeight*WINDOW_VERTICAL_PERCENTAGE_USED / 2);

  simulation.alpha(0.3).restart();
});
