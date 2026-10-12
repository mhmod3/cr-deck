"""Offline review captures: seed card data as local SVG art so the binder
world renders without network access, then screenshot desktop + mobile.
"""
import json
import urllib.parse
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review"

RARITY_COLOR = {
    "common": "#b7c1cc",
    "rare": "#ff9d2e",
    "epic": "#b455e0",
    "legendary": "#ffd54a",
    "champion": "#ffb300",
}

def svg_art(name, rarity, elixir):
    color = RARITY_COLOR.get(rarity, "#b7c1cc")
    # A card-like tile: rarity-tinted ground, dark inner frame, big elixir + short name.
    short = name[:8]
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200" viewBox="0 0 180 200">'
        f'<rect width="180" height="200" rx="10" fill="{color}"/>'
        '<rect x="8" y="8" width="164" height="184" rx="7" fill="#0f1116"/>'
        f'<rect x="8" y="8" width="164" height="184" rx="7" fill="{color}" opacity="0.14"/>'
        f'<circle cx="90" cy="86" r="46" fill="{color}" opacity="0.9"/>'
        f'<circle cx="90" cy="86" r="46" fill="none" stroke="#0f1116" stroke-width="4"/>'
        f'<text x="90" y="104" font-family="Arial" font-size="44" font-weight="800" '
        f'fill="#0f1116" text-anchor="middle">{elixir}</text>'
        f'<text x="90" y="170" font-family="Arial" font-size="20" font-weight="700" '
        f'fill="{color}" text-anchor="middle">{urllib.parse.quote(short)}</text>'
        '</svg>'
    )
    return "data:image/svg+xml;charset=utf-8," + urllib.parse.quote(svg)

def card(cid, name, rarity, elixir, hero=False, evo=False):
    icon = svg_art(name, rarity, elixir)
    urls = {"medium": icon, "heroMedium": icon, "evolutionMedium": icon}
    return {"id": cid, "name": name, "rarity": rarity, "elixirCost": elixir, "iconUrls": urls}

items = [
    card(1, "جنت", "common", 5),
    card(2, "رايدر الهوغ", "rare", 5, hero=True),
    card(3, "زوبين", "common", 2),
    card(4, "قناصة", "common", 3),
    card(5, "غولم", "legendary", 13),
    card(6, "فيلكي", "rare", 4, evo=True),
    card(7, "خنزير", "rare", 2),
    card(8, "مسدس", "epic", 5, hero=True),
    card(9, "كاستل", "epic", 4),
    card(10, "برجليز", "champion", 5),
    card(11, "جنود", "common", 1),
    card(12, "غول صغير", "rare", 4),
]
support_items = [
    card(90, "برج الحارس", "common", 3),
    card(91, "برج النار", "rare", 4),
    card(92, "برج الجليد", "epic", 5),
]

seed = json.dumps({"items": items, "supportItems": support_items}, ensure_ascii=False)

JOBS = [
    ("desktop", 1440, 900, True),
    ("mobile", 390, 844, True),
    ("mobile-empty", 390, 844, False),
]

INIT = (
    "localStorage.removeItem('deckBuilderSavedDeck');"
    f"localStorage.setItem('cardsData', {json.dumps(seed)});"
)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=EXE)
    for name, w, h, gen in JOBS:
        pg = browser.new_page(viewport={"width": w, "height": h})
        pg.add_init_script(INIT)
        pg.goto(URL, wait_until="domcontentloaded")
        try:
            pg.wait_for_selector("#loadingScreen.hidden", timeout=8000)
            print(name, ": loaded")
        except Exception:
            print(name, ": loading screen still visible")
        pg.wait_for_timeout(400)
        if gen:
            btn = pg.locator("#generateBtn")
            if btn.is_enabled():
                btn.click()
                pg.wait_for_timeout(2600)  # staggered reveal settles
                print(name, ": generated")
            else:
                print(name, ": generate disabled")
        pg.screenshot(path=OUT + "\\" + name + ".png", full_page=True)
        print("saved", name)
        pg.close()
    browser.close()
