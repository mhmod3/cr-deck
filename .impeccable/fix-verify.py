"""Focused verification: search padding (RTL), smoothed crown, tower settle animation."""
import json
import urllib.parse
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review"

def art(color, label):
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="150" height="180">'
          f'<rect width="150" height="180" fill="{color}"/>'
          f'<text x="75" y="100" font-size="28" fill="#14161c" text-anchor="middle" font-family="sans-serif">{label}</text></svg>')
    return "data:image/svg+xml," + urllib.parse.quote(svg)

items = []
rars = ["common", "rare", "epic", "legendary"]
for i in range(1, 31):
    d = {"id": i, "name": f"Test Card {i}", "rarity": rars[i % 4], "elixirCost": 2 + (i % 6),
         "iconUrls": {"medium": art("#b7c1cc", str(i))}}
    if i % 7 == 0:
        d["rarity"] = "champion"; d["iconUrls"]["heroMedium"] = art("#ffb300", "H" + str(i))
    if i % 5 == 0:
        d["iconUrls"]["evolutionMedium"] = art("#b455e0", "E" + str(i))
    items.append(d)
for i in range(31, 40):
    items.append({"id": 28000000 + (i - 31), "name": f"Spell {i}", "rarity": "rare", "elixirCost": 3,
                  "iconUrls": {"medium": art("#ff9d2e", "S" + str(i))}})
support = [{"id": 900, "name": "Barbarian Barrel", "rarity": "common", "elixirCost": 2,
            "iconUrls": {"medium": art("#7a8089", "SUP")}}]
seed = json.dumps({"items": items, "supportItems": support}, ensure_ascii=False)
INIT_SEED = (f"localStorage.setItem('cardsData', {json.dumps(seed)});"
             "localStorage.removeItem('deckBuilderSavedDeck');")

results = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(INIT_SEED)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(4000)  # انتظار اكتمال التحميل ورسام الجيوب الفارغة

    # --- Crown: empty slot uses CROWN_SVG; capture its rendered path + a crop
    results["crown"] = pg.evaluate("""() => ({
        svgPaths: document.querySelectorAll('.card-slot.empty-slot .crown-icon path').length,
        d: document.querySelector('.card-slot.empty-slot .crown-icon path')
            ? document.querySelector('.card-slot.empty-slot .crown-icon path').getAttribute('d') : null,
    })""")
    pg.screenshot(path=OUT + "\\crown-placeholder.png")

    # --- Tower settle: during cascade the tower is held hidden, then lands at settle
    pg.click("#generateBtn")
    pg.wait_for_timeout(500)
    results["tower_mid_cascade"] = pg.evaluate("""() => {
        const el = document.getElementById('supportStatsImg');
        return { opacity: el.style.opacity, vis: el.style.visibility, hasTowerIn: el.classList.contains('tower-in') };
    }""")
    pg.wait_for_timeout(3600)
    results["tower_at_settle"] = pg.evaluate("""() => {
        const el = document.getElementById('supportStatsImg');
        return { opacity: el.style.opacity, vis: el.style.visibility, hasTowerIn: el.classList.contains('tower-in'),
                 anim: getComputedStyle(el).animationName };
    }""")

    # --- Search input RTL padding: the reserved space must sit on the right (start in RTL)
    pg.click("#excludeBtn")
    pg.wait_for_timeout(400)
    pg.fill("#excludeSearchInput", "بطاقة")
    pg.wait_for_timeout(400)
    results["search_pad"] = pg.evaluate("""(() => {
        const inp = document.getElementById('excludeSearchInput');
        const cs = getComputedStyle(inp);
        return { paddingRight: cs.paddingRight, paddingLeft: cs.paddingLeft,
                 textAlign: cs.textAlign, dir: cs.direction };
    })()""")
    # empty the input so the placeholder shows against the stamp
    pg.fill("#excludeSearchInput", "")
    pg.wait_for_timeout(400)
    pg.screenshot(path=OUT + "\\search-placeholder.png")
    # crop just the search area for clarity
    pg.locator(".search-wrapper").screenshot(path=OUT + "\\search-crop.png")
    pg.keyboard.press("Escape")

    results["pageerrors"] = errs
    print(json.dumps(results, ensure_ascii=False, indent=1))
    b.close()
