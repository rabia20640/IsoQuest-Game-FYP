from flask import Flask, jsonify
from flask import request
from algorithm import run_all_rules
app = Flask(__name__)
@app.route("/")
def home():
    return jsonify ({"message": "Backend is running!"})

@app.route("/check_match", methods=["POST"])
def check_match():
    data = request.json
    result = run_all_rules(data["target"], data["user"])
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
