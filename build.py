#!/usr/bin/env python3
"""Bouwt Mijn Voeding uit src/:
- docs/                     de installeerbare webapp (GitHub Pages serveert deze map)
- dist/artifact/index.html  testversie zonder documentskelet (niet in git)
- dist/mijn-voeding-x.zip   pakket om elders te hosten (niet in git)
Gebruik: python3 build.py
"""
import json, re, shutil, zipfile
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).parent
SRC = ROOT / 'src'
DIST = ROOT / 'dist'
DOCS = ROOT / 'docs'
VERSION = re.search(r"APP_VERSION = '([^']+)'", (SRC / 'core.js').read_text()).group(1)

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Figtree:wght@400..700&display=swap">')

css = (SRC / 'style.css').read_text()
body = (SRC / 'body.html').read_text()
js = '\n'.join((SRC / f).read_text() for f in ['seed.js', 'core.js', 'ui.js'])
script = f"'use strict';\n{js}"


def page(build):
    return (f'{body}\n<script>window.APP_BUILD = "{build}";</script>\n'
            f'<script>\n{script}\n</script>\n')


for d in (DIST, DOCS):
    if d.exists():
        shutil.rmtree(d)
(DIST / 'artifact').mkdir(parents=True)
DOCS.mkdir(parents=True)

# Testversie (artifact): geen doctype/html/head/body, wel title en style bovenaan.
(DIST / 'artifact' / 'index.html').write_text(
    f'<title>Mijn Voeding</title>\n{FONTS}\n<style>\n{css}\n</style>\n{page("artifact")}')

# Installeerbare versie
head = f'''<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Mijn Voeding</title>
<meta name="description" content="Persoonlijke voedingsapp met eigen puntensysteem.">
<meta name="theme-color" content="#F3F5F0" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#111713" media="(prefers-color-scheme: dark)">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Voeding">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-180.png">
<link rel="icon" type="image/png" href="icon-192.png">
{FONTS}
<style>:root{{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}[hidden]{{display:none!important}}img{{max-width:100%}}</style>
<style>
{css}
</style>
</head>
<body>
'''
(DOCS / 'index.html').write_text(head + page('pwa') + '</body>\n</html>\n')

manifest = {
    "name": "Mijn Voeding", "short_name": "Voeding", "lang": "nl",
    "description": "Persoonlijke voedingsapp met eigen puntensysteem.",
    "start_url": "./", "scope": "./", "display": "standalone",
    "background_color": "#F3F5F0", "theme_color": "#F3F5F0",
    "icons": [
        {"src": "icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}
(DOCS / 'manifest.webmanifest').write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
(DOCS / 'sw.js').write_text((SRC / 'sw.js').read_text().replace('__VERSION__', VERSION))


# App-icoon: een bord met een vijgenblad, op vijgpaars.
def icon(size, maskable=False):
    S = 1024
    img = Image.new('RGBA', (S, S), (122, 61, 108, 255))
    d = ImageDraw.Draw(img)
    r = 300 if not maskable else 250
    c = S // 2
    d.ellipse([c - r, c - r, c + r, c + r], fill=(243, 245, 240, 255))
    ri = int(r * 0.62)
    d.ellipse([c - ri, c - ri, c + ri, c + ri], fill=(234, 238, 230, 255), outline=(220, 226, 214, 255), width=8)
    # blad
    leaf = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaf)
    lw, lh = int(r * 0.36), int(r * 0.78)
    ld.ellipse([c - lw, c - lh, c + lw, c + lh], fill=(53, 112, 64, 255))
    ld.line([c, c - lh + 30, c, c + lh - 20], fill=(224, 238, 221, 255), width=14)
    leaf = leaf.rotate(-38, resample=Image.BICUBIC, center=(c, c))
    off = int(r * 0.18)
    img.alpha_composite(leaf, (off, -off))
    return img.resize((size, size), Image.LANCZOS).convert('RGB')


icon(180).save(DOCS / 'icon-180.png')
icon(192).save(DOCS / 'icon-192.png')
icon(512).save(DOCS / 'icon-512.png')
icon(512, maskable=True).save(DOCS / 'icon-512-maskable.png')

(DOCS / '.nojekyll').write_text('')

LEESMIJ = (f'''Mijn Voeding {VERSION}

Zet alle bestanden uit deze map samen op een webadres met https
(bijvoorbeeld GitHub Pages of Cloudflare Pages, beide gratis).

Op je iPhone:
1. Open het adres in Safari.
2. Tik op de deelknop en kies "Zet op beginscherm".
3. Open de app voortaan via het icoon op je beginscherm.

Je gegevens staan alleen op je telefoon. Maak geregeld een back-up via
Instellingen > Gegevens en back-up, en bewaar het bestand bv. in iCloud Drive.

Bij een nieuwe versie vervang je de bestanden op hetzelfde adres.
Je gegevens blijven staan, zolang het adres hetzelfde blijft.
''')

with zipfile.ZipFile(DIST / f'mijn-voeding-{VERSION}.zip', 'w', zipfile.ZIP_DEFLATED) as z:
    for f in sorted(DOCS.iterdir()):
        if f.name != '.nojekyll':
            z.write(f, f'mijn-voeding/{f.name}')
    z.writestr('mijn-voeding/LEESMIJ.txt', LEESMIJ)

print('Gebouwd:', VERSION)
for f in sorted([*DOCS.rglob('*'), *DIST.rglob('*')]):
    if f.is_file():
        print(f'  {f.relative_to(ROOT)}  {f.stat().st_size // 1024} KB')
