"""Subset the installed Noto Sans SC (Source Han Sans companion) for web use."""
from pathlib import Path
from fontTools import subset

root = Path(__file__).resolve().parents[1]
out = root / 'public/assets/fonts'
out.mkdir(parents=True, exist_ok=True)
text = ''.join(path.read_text(encoding='utf-8') for path in (root / 'app').rglob('*')
               if path.suffix in ('.tsx', '.ts', '.css'))
options = subset.Options()
options.flavor = 'woff2'
options.name_IDs = ['*']
font = subset.load_font('C:/Windows/Fonts/NotoSansSC-VF.ttf', options)
subsetter = subset.Subsetter(options=options)
subsetter.populate(unicodes=set(range(32, 127)) | {ord(char) for char in text})
subsetter.subset(font)
subset.save_font(font, str(out / 'noto-sans-sc-subset-v2.woff2'), options)
print('Web font bytes:', (out / 'noto-sans-sc-subset-v2.woff2').stat().st_size)
