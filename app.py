from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import quote, unquote
import os
from werkzeug.utils import secure_filename

from generate import request_structure_edit, request_background_removal

app = Flask(__name__, static_folder='images')
CORS(app, origins=["http://localhost:3000"])

UPLOAD_FOLDER = "./images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route('/')
def hello_world():
    return 'Hello, LiveAI!'

@app.route('/edit_image', methods=['POST'])
def edit_image():
    data = request.get_json()
    style = data.get('style')
    image_name = data.get('image_name')

    if not style or not image_name:
        return jsonify({"error": "Missing 'style' or 'image_name'"}), 400
    
    image_name = secure_filename(image_name)
    image_path = os.path.join(app.config["UPLOAD_FOLDER"], image_name)

    try:
        new_edited_image_path = request_structure_edit(image_path, style)
        new_removed_background_image_path = request_background_removal(new_edited_image_path)
        filename = os.path.basename(new_removed_background_image_path)
        return jsonify({"new_image_path": filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001)
