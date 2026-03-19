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

    // --- Colour palette logic ---
    let selectedColour = null;

    // When a palette color is clicked
    document.querySelectorAll('.colour-option').forEach(option => {
        option.addEventListener('click', () => {

            // Remove highlight from all
            document.querySelectorAll('.colour-option').forEach(o => o.classList.remove('selected'));

            // Highlight selected
            option.classList.add('selected');

            // Store selected colour
            selectedColour = option.getAttribute('data-colour');
        });
    });

    // When a node is clicked, apply the selected color
    blankCy.on('tap', 'node', function (evt) {
        const node = evt.target;

        if (selectedColour) {
            node.style('background-color', selectedColour);
            node.data('colour', selectedColour);
        }
    });
    document.getElementById('check-answer-btn').addEventListener('click', () => {
        // Extract the user's graph from cytoscape
        const userGraph = blankCy.elements().map(el => el.json());

        // send to flask
        fetch('/check_answer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({userGraph: userGraph})
        })
            .then(response => response.json())
            .then(data => {
                const feedback = document.getElementById('feedback');

                if (data.correct) {
                    feedback.textContent = "Correct";
                    feedback.style.color = "green";
                } else {
                    feedback.textContent = "Incorrect - try again.";
                    feedback.style.color = "red";
                }
            })
            .catch(err => console.error('Error checking answer:', err));
    });
});







