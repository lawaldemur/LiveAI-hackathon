from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
from functools import lru_cache
from dotenv import load_dotenv
import os

from generate import (
    request_structure_edit,
    request_background_removal,
    describe_image_style,
    suggest_style_edits,
    research_companies_by_style,
)


app = Flask(__name__, static_folder='images')

load_dotenv()
CORS(app, origins=[os.getenv("FRONTEND_URL"), os.getenv("SERVER_URL")])

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
        filename = get_cached_image_path(image_path, style)
        return jsonify({"new_image_path": filename}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@lru_cache(maxsize=128)
def get_cached_image_path(image_path, style):
    new_edited_image_path = request_structure_edit(image_path, style)
    new_removed_background_image_path = request_background_removal(new_edited_image_path)
    filename = os.path.basename(new_removed_background_image_path)
    return filename
    
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

@app.route('/style_suggestions', methods=['POST'])
def style_suggestions():
    data = request.get_json()
    style = data.get('style')

    if not style:
        return jsonify({"error": "Missing 'style'"}), 400

    try:
        suggestions = get_cached_style_suggestions(style)
        return jsonify({"suggestions": suggestions}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@lru_cache(maxsize=128)
def get_cached_style_suggestions(style):
    return suggest_style_edits(style)

@app.route('/research_style', methods=['POST'])
def research_style():
    data = request.get_json()
    style = data.get('style')

    if not style:
        return jsonify({"error": "Missing 'style'"}), 400

    try:
        results = get_cached_research_results(style)
        return jsonify({"results": results}), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@lru_cache(maxsize=128)
def get_cached_research_results(style):
    return research_companies_by_style(style)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3001, debug=True)
