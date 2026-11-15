"""Encode supplied artwork without resizing; tile long images for lazy decoding."""
from pathlib import Path
import json
import sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = 250_000_000
source = Path('C:/Users/Lenovo/Desktop/bilibili/IP')
root = Path(__file__).resolve().parents[1]
out = root / 'public/assets/works-202611'
out.mkdir(parents=True, exist_ok=True)
names = [
    '「认养一头牛&盒马鲜生」联名视觉KV',
    '「哔哩哔哩」脑洞放映节 活动全案设计',
    '「快手」夜市寻味记 玩法活动设计',
    '「MOMO PET」PupPy Day节日KV',
    '「山西非遗黎侯虎」文创设计',
    '「拾光」临期食品APP',
]
works = []
for i, name in enumerate(names, 1):
    if '--append' in sys.argv and i < len(names):
        if not works:
            existing = (root / 'app/artworks.ts').read_text(encoding='utf-8')
            works = json.loads(existing.removeprefix('export const projects = ').strip().removesuffix(';'))[:len(names) - 1]
        continue
    folder = source.parent if i == 6 else source
    suffix = '(封面).png' if i == 6 else '（封面）.png'
    cover = Image.open(folder / (name + suffix)).convert('RGB')
    cover_path = out / f'{i:02}-cover.webp'
    cover.save(cover_path, 'WEBP', quality=90, method=6)
    full = Image.open(folder / (name + ('.jpg' if i == 3 else '.png'))).convert('RGB')
    tiles = []
    for n, y in enumerate(range(0, full.height, 2200), 1):
        tile = full.crop((0, y, full.width, min(y + 2200, full.height)))
        path = out / f'{i:02}-detail-{n:02}.webp'
        tile.save(path, 'WEBP', quality=92, method=4)
        tiles.append(dict(src='/assets/works-202611/' + path.name, width=tile.width, height=tile.height))
    works.append(dict(index=f'{i:02}', title=name, image='/assets/works-202611/' + cover_path.name,
                      width=cover.width, height=cover.height, tiles=tiles, accent='#d7ff59'))
    print(name, cover.size, full.size, flush=True)
manifest = 'export const projects = ' + json.dumps(works, ensure_ascii=False, indent=2) + ';\n'
# Generated metadata is coupled to the image conversion, not hand-edited source.
(root / 'app/artworks.ts').write_text(manifest, encoding='utf-8')
