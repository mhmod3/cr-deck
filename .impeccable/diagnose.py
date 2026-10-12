"""Diagnose why the loading screen never hides with seeded data."""
import json
import urllib.parse
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"

# minimal seed (same shape)
def art():
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="180" height="200">'
           '<rect width="180" height="200" fill="#b7c1cc"/></svg>')
    return "data:image/svg+xml," + urllib.parse.quote(svg)

items = [{"id": i, "name": f"بطاقة {i}", "rarity": "common", "elixirCost": 3,
          "iconUrls": {"medium": art()}} for i in range(1, 13)]
support = [{"id": 90, "name": "دعم", "rarity": "common", "elixirCost": 3,
            "iconUrls": {"medium": art()}}]
seed = json.dumps({"items": items, "supportItems": support}, ensure_ascii=False)
INIT = ("localStorage.removeItem('deckBuilderSavedDeck'); "
        f"localStorage.setItem('cardsData', {json.dumps(seed)});")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    logs, errs = [], []
    pg.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(INIT)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(5000)
    state = pg.evaluate("""() => ({
        loadingHidden: document.getElementById('loadingScreen').classList.contains('hidden'),
        dataLoaded: window.CR ? window.CR.dataLoaded : 'CR undefined',
        allCards: window.CR ? window.CR.allCards.length : -1,
        progress: document.getElementById('loadingProgress').textContent,
        bar: document.getElementById('loadingBarFill').style.width,
        errVisible: document.getElementById('loadingError').classList.contains('visible'),
        errText: document.getElementById('loadingErrorText').textContent,
        lsHas: !!localStorage.getItem('cardsData'),
    })""")
    print("STATE:", json.dumps(state, ensure_ascii=False, indent=2))
    print("ERRORS:", errs)
    print("CONSOLE (last 10):")
    for l in logs[-10:]:
        print("  ", l)
    b.close()
