import os
from PIL import Image, ImageDraw

source_icon_path = r"C:\Users\hp\.gemini\antigravity-ide\brain\3ce65aaf-757b-48d5-bc1a-bc57fb0cbdc5\campus_runner_app_icon_1790791840250.jpg"
base_dir = r"e:\campus runner"
res_dir = os.path.join(base_dir, "android", "app", "src", "main", "res")

# Load source icon
img = Image.open(source_icon_path).convert("RGBA")

# Densities and sizes
densities = {
    "mipmap-mdpi": {"icon": (48, 48), "foreground": (108, 108)},
    "mipmap-hdpi": {"icon": (72, 72), "foreground": (162, 162)},
    "mipmap-xhdpi": {"icon": (96, 96), "foreground": (216, 216)},
    "mipmap-xxhdpi": {"icon": (144, 144), "foreground": (324, 324)},
    "mipmap-xxxhdpi": {"icon": (192, 192), "foreground": (432, 432)},
}

def make_circle(image):
    size = image.size
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((0, 0) + size, fill=255)
    result = image.copy()
    result.putalpha(mask)
    return result

for folder, specs in densities.items():
    folder_path = os.path.join(res_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # 1. ic_launcher.png
    icon_size = specs["icon"]
    resized_icon = img.resize(icon_size, Image.Resampling.LANCZOS)
    resized_icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
    
    # 2. ic_launcher_round.png
    round_icon = make_circle(resized_icon)
    round_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
    
    # 3. ic_launcher_foreground.png (Adaptive icon foreground)
    fg_size = specs["foreground"]
    resized_fg = img.resize(fg_size, Image.Resampling.LANCZOS)
    resized_fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
    print(f"Generated icons for {folder}")

# Web / PWA icons
public_img_dir = os.path.join(base_dir, "public", "assets", "img")
os.makedirs(public_img_dir, exist_ok=True)

# 512x512 app icon
icon_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
icon_512.save(os.path.join(public_img_dir, "app-icon.png"), "PNG")
icon_512.save(os.path.join(public_img_dir, "icon-512.png"), "PNG")

# 192x192 app icon
icon_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
icon_192.save(os.path.join(public_img_dir, "icon-192.png"), "PNG")

# Favicon
favicon = img.resize((64, 64), Image.Resampling.LANCZOS)
favicon.save(os.path.join(base_dir, "public", "favicon.ico"), format="ICO", sizes=[(64, 64), (32, 32), (16, 16)])

print("Successfully generated all Android and Web icons!")
