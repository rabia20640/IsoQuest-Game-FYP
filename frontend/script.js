// Path to my level file for the current level
const levelPath = '/static/graphs/level1.json';

// Fetch and load the level configuration
fetch(levelPath)
.then(response => response.json())
.then(levelData => {

// --- Target graph (left side) ---
    // This graph displays the completed version of the puzzle
    const targetCy = cytoscape({
        container: document.getElementById('target-graph'),
        elements: levelData.targetGraph.elements, // Nodes + edges from JSON
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': 'data(colour)', // Node colour from JSON
                    'label': 'data(id)' // Display node ID
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc'
                }
            }
        ],
        layout: {name: 'grid'}
    });

// -- Blank graph (right side) --
    // This graph is the player's workspace for constructing the isomorphic graph
    const blankCy = cytoscape({
        container: document.getElementById('blank-graph'),
        elements: levelData.blankGraph.elements,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#ffffff',
                    'border-width': 2,
                    'border-color': '#000',
                    'label': 'data(id)'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#ccc'
                }
            }
        ],
        layout: {name: 'grid'}
    });

})
    .catch(err => console.error('Error loading level:', err));



