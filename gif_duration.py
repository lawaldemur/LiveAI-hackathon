import os
import json
from PIL import Image

def get_gif_durations(folder_path):
    durations = []
    for filename in os.listdir(folder_path):
        if filename.endswith('.gif'):
            file_path = os.path.join(folder_path, filename)
            with Image.open(file_path) as img:
                duration = sum(img.info['duration'] for _ in range(img.n_frames))
                durations.append({'file': filename, 'duration': duration})
    return json.dumps(durations)

folder_path = './react-app/public/loading'
print(get_gif_durations(folder_path))
