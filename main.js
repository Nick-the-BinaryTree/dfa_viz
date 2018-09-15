const CHAR_OFFSET = -3.5;
const LANGUAGE = ["A", "B", "C", "D", "E"];
const LINE_OFFSET = 8;
const RADIUS_SCALE_FACTOR = 5;
const SELF_CURVE_OFFSET = 7;
const WINDOW_PADDING = 30;
const WINDOW_VERTICAL_PERCENTAGE_USED = .9;

const colors = d3.scaleOrdinal(d3.schemeCategory20c);

let languageSize = 1
let edgeLabels, edgePaths, link, node, simulation, svg;

let graph = {
  nodes: [
    {
      "id": "0",
      "incomingNodes": {},
      "endState": false,
    },
  ],
  edges: [
    {
      "source": 0,
      "target": 0,
      "input": ['A'],
    },
    // {
    //   "source": 1,
    //   "target": 2,
    //   "input": [A, B],
    // }
  ]
}

window.onload = () => {
  initUI();
  initSim();
}
