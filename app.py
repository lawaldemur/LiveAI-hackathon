from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import quote, unquote
import os
from werkzeug.utils import secure_filename
from generate import request_structure_edit, request_background_removal, describe_image_style


app = Flask(__name__, static_folder='images')
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

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
    
@app.route('/try_on', methods=['POST'])
def try_on():
    if "upload_image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["upload_image"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)
    
    style_image = request.form["style_image"]
    style_description = describe_image_style("./images/" + style_image)

    style = request.form["style"]

    # get text description of difference
    # difference = get_difference_between_images(file_path, "./images/" + style_image)
    
    # edit image according to the analysed difference
    # new_edited_image_path = request_structure_edit(file_path, difference)

    new_edited_image_path = request_structure_edit(file_path, f"MAIN STYLE: {style}. FEATURES: {style_description}")
    new_removed_background_image_path = request_background_removal(new_edited_image_path)
    filename = os.path.basename(new_removed_background_image_path)
    
    return jsonify({"new_image_path": filename}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
