const CHAR_OFFSET = -3.5;
const LINE_OFFSET = 8;
const RADIUS_SCALE_FACTOR = 5;
const WINDOW_PADDING = 30;
const WINDOW_VERTICAL_PERCENTAGE_USED = .9;

const colors = d3.scaleOrdinal(d3.schemeCategory20c);
let edgeLabels, edgePaths, link, node, simulation, svg;

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
