// --- IsoQuest: Main client-side Logic ---
// Handles level loading, color selection, graph interaction,
// answer checking, mapping display and game completion flow

// Track current level and last completed isomorphism mapping
let currentLevel = 1;
let lastMapping = null;

// Restart button: reloads the entire game state
document.getElementById('restart-btn').addEventListener('click', () => {
    window.location.reload();
});

// --- Next Level Button ---
// Advances the game to the next level and resets UI state
document.getElementById('next-level-btn').addEventListener('click', () => {
    currentLevel++;
    loadLevel(currentLevel);

    // Disable until the new level is solved
    document.getElementById('next-level-btn').disabled = true;

    // Clear previous feedback
    document.getElementById('feedback').textContent = "";
});

// --- Show Mapping Button ---
// Displays the isomorphism mapping returned by the backend
document.getElementById('show-mapping-btn').addEventListener('click', () => {
    if (!lastMapping) return;

    let text = "Isomorphism Mapping:\n\n";
    for (const [target, user] of Object.entries(lastMapping)) {
        text += `${target} → ${user}\n`;
    }

    document.getElementById('mapping-text').textContent = text;
    document.getElementById('mapping-modal').style.display = "block";
});

// --- Modal Close Handlers ---
// Allows closing via x button or by clicking outside the modal
document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('mapping-modal').style.display = "none";
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('mapping-modal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

//--- Load level ---
// Fetches the JSON file for the given level and initializes:
// - Target graph (reference)
// - Blank graph (player workspace)
// - Color palette interactions
// - Node coloring behaviour

function loadLevel(level) {
    const levelPath = `/static/graphs/level${level}.json`;

    fetch(levelPath)
        .then(response => response.json())
        .then(levelData => {

            // Reset UI state for the new level
            document.getElementById('feedback').textContent = "";
            document.getElementById('next-level-btn').disabled = true;

            // Reset mapping button and stored mapping
            document.getElementById('show-mapping-btn').style.display = "none";
            lastMapping = null;

            // Reset palette selection
            document.querySelectorAll('.colour-option').forEach(o => o.classList.remove('selected'));
            let selectedColour = null;

            // --- Target graph (left side) ---
            // Displays the fully colored reference graph for the level
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

            // -- Color palette interaction ---
            // Allows the player to select a color to apply to nodes
            document.querySelectorAll('.colour-option').forEach(option => {
                option.addEventListener('click', () => {

                    // Remove highlight from all options
                    document.querySelectorAll('.colour-option').forEach(o => o.classList.remove('selected'));

                    // Highlight selected option
                    option.classList.add('selected');

                    // Store selected color
                    selectedColour = option.getAttribute('data-colour');
                });
            });

            // --- Node Colouring ---
            // Applies the selected color to the clicked node
            blankCy.on('tap', 'node', function (evt) {
                const node = evt.target;

                if (selectedColour) {
                    node.style('background-color', selectedColour);
                    node.data('colour', selectedColour);
                }
            });

            // ---- Check Answer Button ---
            // Sends the player's graph to flask for isomorphism checking
            document.getElementById('check-answer-btn').onclick = () => {

                // Extract the user's graph from cytoscape
                const userGraph = blankCy.elements().map(el => el.json());

                // send to backend for validation
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

                            // --- Final level completed - show Game Over screen ---
                            // If this was the final level, show Game Over screen
                            if (currentLevel === 3) {

                                // Hide the game UI
                                document.getElementById('target-graph').style.display = "none";
                                document.getElementById('blank-graph').style.display = "none";
                                document.getElementById('colour-palette').style.display = "none"
                                document.querySelector('.button-row').style.display = "none";
                                document.getElementById('feedback').style.display = "none";

                                // Show Game Over screen
                                document.getElementById('game-over').style.display = "block";

                                // Stop here so it doesn't show next level button
                                return
                            }

                            // Enable next level button
                            document.getElementById('next-level-btn').disabled = false;

                            // Store mapping for modal display
                            lastMapping = data.mapping;

                            // Reveal mapping button
                            document.getElementById('show-mapping-btn').style.display = "inline-block";

                        } else {
                            // Incorrect attempt
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

// --- Initialise Game ---
// Load level 1 when the page first loads
loadLevel(currentLevel);
