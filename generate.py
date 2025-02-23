import os
import base64
import requests
from openai import OpenAI
from pydantic import BaseModel
from dotenv import load_dotenv

os.makedirs("images", exist_ok=True)

load_dotenv()
STABILITY_KEY = os.getenv("STABILITY_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PICSART_API_KEY = os.getenv("PICSART_API_KEY")

client = OpenAI()


def send_generation_request(
    host,
    params,
):
    headers = {
        "Accept": "image/*",
        "Authorization": f"Bearer {STABILITY_KEY}"
    }

    # Encode parameters
    files = {}
    image = params.pop("image", None)
    mask = params.pop("mask", None)
    if image is not None and image != '':
        files["image"] = open(image, 'rb')
    if mask is not None and mask != '':
        files["mask"] = open(mask, 'rb')
    if len(files)==0:
        files["none"] = ''

    # Send request
    print(f"Sending REST request to {host}...")
    response = requests.post(
        host,
        headers=headers,
        files=files,
        data=params
    )
    if not response.ok:
        print(f"Error: HTTP {response.status_code}: {response.text}")
        raise Exception(f"HTTP {response.status_code}: {response.text}")

    return response


def request_image_edit(image_path, edit_prompt, search_object):
    image = image_path
    prompt = edit_prompt #@param {type:"string"}
    search_prompt = search_object #@param {type:"string"}
    negative_prompt = "" #@param {type:"string"}
    seed = 0 #@param {type:"integer"}
    output_format = "png" #@param ["webp", "jpeg", "png"]

    host = f"https://api.stability.ai/v2beta/stable-image/edit/search-and-replace"

    params = {
        "image" : image,
        "seed" : seed,
        "mode": "search",
        "output_format": output_format,
        "prompt" : prompt,
        "negative_prompt" : negative_prompt,
        "search_prompt": search_prompt,
    }

    response = send_generation_request(
        host,
        params
    )

    # Decode response
    finish_reason = response.headers.get("finish-reason")
    seed = response.headers.get("seed")

    # Check for NSFW classification
    if finish_reason == 'CONTENT_FILTERED':
        raise Warning("Generation failed NSFW classifier")

    # Save and display result
    filename, _ = os.path.splitext(os.path.basename(image))
    edited = f"./images/r_edited_{filename}_{seed}.{output_format}"
    with open(edited, "wb") as f:
        f.write(response.content)  # Use response.content to get the image bytes
    print(f"Saved image {edited}")

    return edited


def request_structure_edit(image_path, edit_prompt):
    image = image_path
    prompt = edit_prompt #@param {type:"string"}
    negative_prompt = "" #@param {type:"string"}
    control_strength = 0.8  #@param {type:"slider", min:0, max:1, step:0.05}
    seed = 0 #@param {type:"integer"}
    output_format = "png" #@param ["webp", "jpeg", "png"]
    style_preset = "photographic"

    host = f"https://api.stability.ai/v2beta/stable-image/control/structure"

    params = {
        "control_strength" : control_strength,
        "image" : image,
        "seed" : seed,
        "output_format": output_format,
        "prompt" : prompt,
        "negative_prompt" : negative_prompt,
        # "style_preset": style_preset,
    }

    response = send_generation_request(
        host,
        params
    )

    # Decode response
    output_image = response.content
    finish_reason = response.headers.get("finish-reason")
    seed = response.headers.get("seed")

    # Check for NSFW classification
    if finish_reason == 'CONTENT_FILTERED':
        raise Warning("Generation failed NSFW classifier")

     # Save and display result
    filename, _ = os.path.splitext(os.path.basename(image))
    edited = f"./images/r_edited_{filename}_{seed}.{output_format}"
    with open(edited, "wb") as f:
        f.write(response.content)  # Use response.content to get the image bytes
    print(f"Saved image {edited}")

    return edited


def request_background_removal(image_path):
    host = "https://api.stability.ai/v2beta/stable-image/edit/remove-background"
    params = {
        "image": image_path,
        "output_format": "png"
    }

    response = send_generation_request(
        host,
        params
    )

    if response.ok:
        filename, _ = os.path.splitext(os.path.basename(image_path))
        output_image_path = f"./images/r_removed_bg_{filename}.png"
        with open(output_image_path, 'wb') as file:
            file.write(response.content)
        print(f"Saved image {output_image_path}")
        return output_image_path
    else:
        raise Exception(f"HTTP {response.status_code}: {response.text}")



def encode_image(image_path):
  with open(image_path, "rb") as image_file:
    return base64.b64encode(image_file.read()).decode('utf-8')


def get_difference_between_images(image1, image2):
    print(image1, image2)
    PROMPT = """
    Reference Image (the first image): This is the current outfit that I want to replace.

    Inspiration Image (the second image): This image serves as the thematic guide.

    Task: Using the inspiration image to inform your decision, propose replacements to the reference image that make it match the style of the inspiration image.
    
    Provide a single change to adopt the new design style for the reference image. Reply with a concrete style change in 1 sentence"""

    base64_image1 = encode_image(image1)
    base64_image2 = encode_image(image2)

    messages = [
        {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": PROMPT,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image1}",
                },
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image2}",
                },
            },
        ],
        }
    ]

    print("Two images difference analysis...")

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=messages,
    )
    edit_object = response.choices[0].message.content

    print(f"{edit_object}")
    return edit_object



def describe_image_style(image):
    PROMPT = """Briefly describe main fashion style features of the image and its colors in 1-2 sentences"""
    base64_image = encode_image(image)

    messages = [
        {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": PROMPT,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image}",
                },
            },
        ],
        }
    ]
    print("Single image style analysis...")

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=messages,
    )
    style_analysis = response.choices[0].message.content
    print(f"{style_analysis}")
    return style_analysis
    


def get_changes_explanation(image1, image2):
    PROMPT = """Please provide a guide what elements should be changed in the first image to make it look like the second image. Be as short as one sentence and sound as a human design expert."""
    
    base64_image1 = encode_image(image2)
    base64_image2 = encode_image(image1)

    messages = [
        {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": PROMPT,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image1}",
                },
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_image2}",
                },
            },
        ],
        }
    ]

    print("difference tips processing")

    response = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=messages,
    )
    result = response.choices[0].message.content

    print(f"{result}")
    return result


def transfer_style(image1, image2):
    url = "https://api.picsart.io/tools/1.0/color-transfer"

    # Use context managers to open files
    with open(image1, "rb") as img1, open(image2, "rb") as img2:
        files = {
            "image": (os.path.basename(image1), img1, f"image/{os.path.splitext(image1)[1][1:]}"),
            "reference_image": (os.path.basename(image2), img2, f"image/{os.path.splitext(image2)[1][1:]}")
        }
        
        payload = {
            "level": "l1",
            "format": "JPG"
        }
        
        headers = {
            "accept": "application/json",
            "X-Picsart-API-Key": PICSART_API_KEY
        }

        # Send the request
        response = requests.post(url, data=payload, files=files, headers=headers)
        print(response.text)


class StyleRecommendations(BaseModel):
    recommendation1: str
    recommendation2: str
    recommendation3: str
    recommendation4: str
    recommendation5: str
    recommendation6: str


def suggest_style_edits(style):
    completion = client.beta.chat.completions.parse(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You're a fashion design expert. Provide sophisticated single-word options to continue this logical sequence of design progress."},
            {"role": "user", "content": style}
        ],
        response_format=StyleRecommendations,
    )

    recommendations = [
        completion.choices[0].message.parsed.recommendation1,
        completion.choices[0].message.parsed.recommendation2,
        completion.choices[0].message.parsed.recommendation3,
        completion.choices[0].message.parsed.recommendation4,
        completion.choices[0].message.parsed.recommendation5,
        completion.choices[0].message.parsed.recommendation6,
    ]
    return recommendations
