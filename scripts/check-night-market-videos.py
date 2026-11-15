from pathlib import Path
import struct

for name in ('night-market-avatar-reward', 'night-market-opening'):
    data = (Path(__file__).resolve().parents[1] / f'public/videos/{name}.mp4').read_bytes()
    position = 0
    atoms = []
    while position + 8 <= len(data):
        size, kind = struct.unpack('!I4s', data[position:position + 8])
        atoms.append(kind.decode('ascii'))
        if size == 1:
            size = struct.unpack('!Q', data[position + 8:position + 16])[0]
        if size == 0:
            break
        position += size
    assert b'avc1' in data, 'Expected browser-compatible H.264 video'
    assert 'moov' in atoms and 'mdat' in atoms
    print(name, atoms, 'H.264 verified', 'fast start:', atoms.index('moov') < atoms.index('mdat'))
