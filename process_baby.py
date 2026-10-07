import numpy as np
from PIL import Image
from scipy.ndimage import binary_fill_holes, gaussian_filter, label

img = Image.open('images/crawling_baby_hero.jpg').convert('RGB')
arr = np.array(img, dtype=np.float32)

# Distance from white
diff = np.sqrt(np.sum((255 - arr) ** 2, axis=2))

# Top & sides background is pure white
# Label background regions
is_bg_candidate = diff < 20.0
lbl, num_features = label(is_bg_candidate)

# Labels touching top, left, right borders
h, w, _ = arr.shape
border_labels = set()
border_labels.update(lbl[0, :])       # top
border_labels.update(lbl[:, 0])       # left
border_labels.update(lbl[:, -1])      # right
border_labels.discard(0)

# True background from top/left/right
is_bg = np.isin(lbl, list(border_labels))

# Foreground is everything else
is_fg = ~is_bg
is_fg = binary_fill_holes(is_fg)

# Smooth alpha
alpha = is_fg.astype(np.float32) * 255.0

# Also soften any floor area below y=800 with a gentle vertical mask
for y in range(780, h):
    factor = 1.0 - ((y - 780) / (h - 780)) ** 1.5
    # only fade if it's faint floor shadow (diff < 40)
    floor_mask = (diff[y, :] < 40.0)
    alpha[y, floor_mask] *= factor

alpha = gaussian_filter(alpha, sigma=1.0)
alpha = np.clip(alpha, 0, 255).astype(np.uint8)

# Make sure white pixels where alpha is low are pure white
rgba = np.dstack([arr.astype(np.uint8), alpha])
out = Image.fromarray(rgba, 'RGBA')

# Crop to content
bbox = out.getbbox()
if bbox:
    cropped = out.crop((max(0, bbox[0]-5), max(0, bbox[1]-5), min(w, bbox[2]+5), min(h, bbox[3]+5)))
    cropped.save('images/crawling_baby_hero.png', 'PNG')
    print('Saved cropped baby:', cropped.size)
else:
    out.save('images/crawling_baby_hero.png', 'PNG')
    print('Saved baby:', out.size)
