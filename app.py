from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import quote, unquote
import os
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='images')
CORS(app, origins=["http://localhost:3000"])

@app.route('/')
def hello_world():
    return 'Hello, LiveAI!'


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
