from flask import Flask, jsonify, request, render_template
from utils import graphs_match
import json
import os

app = Flask(__name__, template_folder="../frontend")

@app.route("/")
def home():
    return jsonify({"message": "Backend is running!"})

@app.route("/game")
def game():
    return render_template("index.html")

@app.route('/check_answer', methods=["POST"])
def check_answer():
    data = request.get_json()
    user_graph = data.get('userGraph')
    level = data.get("level")

    # Load target graph from JSON
    level_path = os.path.join("static", "graphs", f"level{level}.json")
    with open(level_path) as f:
        level_data = json.load(f)
    target_graph = level_data["targetGraph"]["elements"]

    # Compare and get mapping
    correct, mapping = graphs_match(target_graph, user_graph)
    if correct:
        return jsonify({"correct": True, "mapping": mapping})
    else:
        return jsonify({"correct": False})


if __name__ == '__main__':
    app.run(debug=True)
