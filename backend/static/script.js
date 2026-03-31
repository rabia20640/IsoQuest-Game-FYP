let currentLevel = 1;
let lastMapping = null;
// Next level button handler
document.getElementById('next-level-btn').addEventListener('click', () => {
    currentLevel++;
    loadLevel(currentLevel);
    // Disable button again for new level
    document.getElementById('next-level-btn').disabled = true;
    // Clear feedback
    document.getElementById('feedback').textContent = "";
});

// Show mapping button handler
document.getElementById('show-mapping-btn').addEventListener('click', () => {
    if (!lastMapping) return;
    let text = "Isomorphism Mapping:\n\n";
    for (const [target, user] of Object.entries(lastMapping)) {
        text += `${target} → ${user}\n`;
    }
    alert(text);
});

// Load level function
function loadLevel(level) {
    const levelPath = `/static/graphs/level${level}.json`;

    fetch(levelPath)
        .then(response => response.json())
        .then(levelData => {
            // Reset UI
            document.getElementById('feedback').textContent = "";
            document.getElementById('next-level-btn').disabled = true;

            // Reset mapping button + stored mapping
            document.getElementById('show-mapping-btn').style.display = "none";
            lastMapping = null;

            // Reset palette
            document.querySelectorAll('.colour-option').forEach(o => o.classList.remove('selected'));
            let selectedColour = null;

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
                layout: {name: 'preset'}
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
                layout: {name: 'preset'}
            });


            // When a palette color is clicked
            document.querySelectorAll('.colour-option').forEach(option => {
                option.addEventListener('click', () => {

                    // Remove highlight from all
                    document.querySelectorAll('.colour-option').forEach(o => o.classList.remove('selected'));

                    // Highlight selected
                    option.classList.add('selected');

                    // Store selected color
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

            document.getElementById('check-answer-btn').onclick = () => {

                // Extract the user's graph from cytoscape
                const userGraph = blankCy.elements().map(el => el.json());

                // send to flask
                fetch('/check_answer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userGraph: userGraph,
                        level: currentLevel
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        const feedback = document.getElementById('feedback');

                        if (data.correct) {
                            feedback.textContent = "Correct";
                            feedback.style.color = "green";

                            // Enable next level button
                            document.getElementById('next-level-btn').disabled = false;

                            // Store mapping
                            lastMapping = data.mapping;

                            // Show the Show Mapping button
                            document.getElementById('show-mapping-btn').style.display = "inline-block";

                        } else {
                            feedback.textContent = "Incorrect - try again.";
                            feedback.style.color = "red";

                            // Hide mapping button if previously shown
                            document.getElementById('show-mapping-btn').style.display = "none";
                        }
                    })
                    .catch(err => console.error('Error checking answer:', err));
            };
        });
}

// Load level 1 on page load
loadLevel(currentLevel);
