from flask import Flask, jsonify, request, render_template
from algorithm import run_all_rules

app = Flask(__name__, template_folder="../frontend")
@app.route("/")
def home():
    return jsonify ({"message": "Backend is running!"})

@app.route("/game")
def game():
    return render_template("index.html")

@app.route("/check_match", methods=["POST"])
def check_match():
    data = request.json
    result = run_all_rules(data["target"], data["user"])
    return jsonify(result)

@app.route('/check_answer', methods=["POST"])
def check_answer():
    data = request.get_json()
    user_graph = data.get('userGraph')
    result = {
        "correct": False
    }
    return jsonify(result)
if __name__ == '__main__':
    app.run(debug=True)
