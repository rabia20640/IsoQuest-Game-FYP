"""
Flask backend for IsoQuest.
This section handles:
- Serving the main game interface
- Loading level data from JSON files
- Receiving the player's submitted graph
- Performing isomorphism checking via utils, graphs_match
- Returning correctness and node-mapping information to the frontend
 """
from flask import Flask, jsonify, request, render_template
from utils import graphs_match
import json
import os

# Flask Application Initial Set Up
# The template folder points to the frontend directory where index.html lives
app = Flask(__name__, template_folder="../frontend")


# Health Check Route
# Simple endpoint to confirm that the backend is running
@app.route("/")
def home():
    return jsonify({"message": "Backend is running!"})


# Game Route
# Serves the main HTML pagr containing the IsoQuest interface
@app.route("/game")
def game():
    return render_template("index.html")


"""
Answer Checking Route 
Receives the player's constructed graph and the current level number
Loads the corresponding target graph from JSON, compares the two using the isomorphism 
algorithm in utils.py and returns correctness + mapping. 
"""


@app.route('/check_answer', methods=["POST"])
def check_answer():
    data = request.get_json()
    user_graph = data.get('userGraph')
    level = data.get("level")

    # Load the target graph for the requested level
    level_path = os.path.join("static", "graphs", f"level{level}.json")
    with open(level_path) as f:
        level_data = json.load(f)
        # Extract only the elements (nodes + edges) for comparison
    target_graph = level_data["targetGraph"]["elements"]

    """
    Perform isomorphism checking
    graphs_match returns:
    - correct (bool): Whether the graphs are isomorphic
    - mapping (dict): Node to node correspondence if correct 
    """
    correct, mapping = graphs_match(target_graph, user_graph)

    # Return result to the frontend
    if correct:
        return jsonify({"correct": True, "mapping": mapping})
    else:
        return jsonify({"correct": False})
    # Application Entry Point


# Run the flask development server
if __name__ == '__main__':
    app.run(debug=True)
