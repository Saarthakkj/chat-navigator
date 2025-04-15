import random
from PIL import Image, ImageDraw
import os

def get_random_color():
    """Generates a random opaque RGB color tuple."""
    # Ensure full opacity with Alpha channel (255)
    return (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255), 255)

def generate_icon(size, filename):
    """Generates a random icon of a given size and saves it."""
    # Create a new image with RGBA mode (allows for transparency if needed,
    # though we fill the background completely).
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0)) # Start transparent
    draw = ImageDraw.Draw(img)

    # 1. Random Background Color
    bg_color = get_random_color()
    draw.rectangle([0, 0, size, size], fill=bg_color)

    # 2. Random Foreground Color
    #    Try to ensure it's not *exactly* the same as the background for minimum visibility.
    fg_color = get_random_color()
    while fg_color == bg_color:
         fg_color = get_random_color()

    # 3. Choose and Draw a Random Shape
    shape_type = random.choice(['rectangle', 'ellipse', 'triangle'])

    # Calculate shape bounds (make it slightly smaller than the canvas)
    margin = int(size * 0.15) # 15% margin around the shape
    x0 = margin
    y0 = margin
    x1 = size - margin
    y1 = size - margin
    bbox = [x0, y0, x1, y1]

    if shape_type == 'rectangle':
        draw.rectangle(bbox, fill=fg_color)
        print(f"Generated {filename} (rectangle)")
    elif shape_type == 'ellipse':
        draw.ellipse(bbox, fill=fg_color)
        print(f"Generated {filename} (ellipse)")
    elif shape_type == 'triangle':
        # Simple centered triangle points
        p1 = (size // 2, y0)       # Top center
        p2 = (x0, y1)              # Bottom left
        p3 = (x1, y1)              # Bottom right
        draw.polygon([p1, p2, p3], fill=fg_color)
        print(f"Generated {filename} (triangle)")


    # 4. Save the image as PNG
    img.save(filename, "PNG")


# --- Main Execution ---
if __name__ == "__main__":
    output_dir = "chrome_extension_icons"
    # Standard Chrome Extension Icon Sizes
    sizes = [16, 32, 128] # You can add 48 here too if needed

    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)

    print(f"Generating icons in directory: {output_dir}")

    for size in sizes:
        filename = os.path.join(output_dir, f"icon_{size}.png")
        generate_icon(size, filename)

    print("\nIcon generation complete.")
    print(f"You can find the icons in the '{output_dir}' folder.")
    print("\nRemember to declare these icons in your manifest.json:")
    print("""
    "icons": {
        "16": "chrome_extension_icons/icon_16.png",
        "32": "chrome_extension_icons/icon_32.png",
        "128": "chrome_extension_icons/icon_128.png"
    }
    """)
