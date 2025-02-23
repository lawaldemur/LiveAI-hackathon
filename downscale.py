from PIL import Image
import os

DOWNSCALE_FACTOR = 4

def downscale_images(image_paths, output_folder):
    """
    Takes an array of image file paths and decreases the resolution of each by 50%.
    
    :param image_paths: List of paths to the image files to be downscaled.
    :param output_folder: Folder where the downscaled images will be saved.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for image_path in image_paths:
        try:
            with Image.open(image_path) as img:
                # Calculate new dimensions
                new_width = img.width // DOWNSCALE_FACTOR
                new_height = img.height // DOWNSCALE_FACTOR

                # Downscale the image
                downscaled_img = img.resize((new_width, new_height), Image.LANCZOS)

                # Save the downscaled image
                base_name = os.path.basename(image_path)
                downscaled_img.save(os.path.join(output_folder, base_name))
                print(f"Downscaled image saved as {os.path.join(output_folder, base_name)}")
        except Exception as e:
            print(f"Error processing {image_path}: {e}")


if __name__ == "__main__":
    styles = [
        "Surrealism",
        "Gothic",
        "Postmodernism",
        "Expressionism",
        "Futurism",
        "Conceptual Art",
    ]
    image_paths = ["./core_styles_images/" + style.lower() + ".png" for style in styles]
    downscale_images(image_paths, "images")
