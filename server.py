from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/get_data', methods=['GET'])
def get_data():
    # Replace this with logic to read data from the Arduino
    amperage = 10  # Example value
    coulombs = amperage * time_in_seconds  # Modify based on your calculation
    return jsonify({"amperage": amperage, "coulombs": coulombs})

if __name__ == '__main__':
    app.run(debug=True)
