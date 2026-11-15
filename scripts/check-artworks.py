"""Verify every encoded tile preserves source width and complete image height."""
from pathlib import Path
import json
from PIL import Image

Image.MAX_IMAGE_PIXELS = 250_000_000
root = Path(__file__).resolve().parents[1]
text = (root / 'app/artworks.ts').read_text(encoding='utf-8')
works = json.loads(text.removeprefix('export const projects = ').strip().removesuffix(';'))
source = Path('C:/Users/Lenovo/Desktop/bilibili/IP')
for i, work in enumerate(works, 1):
    original = Image.open(source / (work['title'] + ('.jpg' if i == 3 else '.png')))
    cover = Image.open(root / 'public' / work['image'].lstrip('/'))
    assert cover.size == (work['width'], work['height'])
    height = 0
    for tile in work['tiles']:
        path = root / 'public' / tile['src'].lstrip('/')
        encoded = Image.open(path)
        assert encoded.size == (tile['width'], tile['height'])
        assert encoded.width == original.width
        assert path.stat().st_size < 25 * 1024 * 1024
        height += encoded.height
    assert height == original.height
    print(f'Work {i}: cover ratio and complete detail dimensions verified')
