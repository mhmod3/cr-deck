"""Animate verification: batched desktop+mobile round, reduced-motion pass, state checks."""
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
        d["rarity"] = "champion"
        d["iconUrls"]["heroMedium"] = art("#ffb300", "H" + str(i))
    if i % 5 == 0:
        d["iconUrls"]["evolutionMedium"] = art("#b455e0", "E" + str(i))
    items.append(d)
for i in range(31, 40):
    items.append({"id": 28000000 + (i - 31), "name": f"Spell {i}", "rarity": "rare", "elixirCost": 3,
                  "iconUrls": {"medium": art("#ff9d2e", "S" + str(i))}})
support = [{"id": 900, "name": "Barbarian Barrel", "rarity": "common", "elixirCost": 2,
            "iconUrls": {"medium": art("#7a8089", "SUP")}}]
seed = json.dumps({"items": items, "supportItems": support}, ensure_ascii=False)

INIT_SEED = (
    f"localStorage.setItem('cardsData', {json.dumps(seed)});"
    "localStorage.removeItem('deckBuilderSavedDeck');"
)

def state(pg):
    return pg.evaluate("""() => ({
        loadingHidden: document.getElementById('loadingScreen').classList.contains('hidden'),
        dataLoaded: window.CR.dataLoaded,
        containerReady: document.querySelector('.container').classList.contains('ready'),
        cardsInGrid: document.querySelectorAll('.deck-grid .card-slot').length,
        avg: document.getElementById('avgElixirDisplay').textContent,
        avgSettle: document.getElementById('avgElixirDisplay').classList.contains('settle-in'),
        copyDisabled: document.getElementById('copyBtn').disabled,
        towerIn: document.getElementById('supportStatsImg').classList.contains('tower-in'),
        supportVisible: document.getElementById('supportStatsImg').style.visibility,
        meterWidth: getComputedStyle(document.querySelector('.battle_stats .meter i')).width,
        excludeModalVisible: document.getElementById('excludeModal').classList.contains('visible'),
        popoverVisible: document.getElementById('copyPopover').classList.contains('visible'),
        helpVisible: document.getElementById('siteHelpModal').classList.contains('visible'),
        errVisible: document.getElementById('errorMsg').classList.contains('visible'),
    })""")

results = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)

    # --- Desktop: happy path + modal + popover
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(INIT_SEED)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    results["desktop_loaded"] = state(pg)

    pg.click("#generateBtn")
    pg.wait_for_timeout(400)
    results["desktop_mid_cascade"] = {
        "animating": pg.evaluate("document.querySelectorAll('.card-slot.animating').length"),
    }
    pg.wait_for_timeout(3500)  # cascade + settle complete
    results["desktop_revealed"] = state(pg)
    pg.screenshot(path=OUT + "\\animate-desktop.png")

    # exclusion modal open (riseIn settled by 300ms)
    pg.click("#excludeBtn")
    pg.wait_for_timeout(400)
    results["desktop_exclude_modal"] = state(pg)
    pg.screenshot(path=OUT + "\\animate-exclude-desktop.png")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)

    # popover open
    pg.click("#copyBtn")
    pg.wait_for_timeout(400)
    results["desktop_popover"] = state(pg)
    pg.screenshot(path=OUT + "\\animate-popover-desktop.png")
    pg.keyboard.press("Escape")
    ctx.close()

    # --- Mobile: happy path full page
    mctx = b.new_context(viewport={"width": 390, "height": 844})
    mp = mctx.new_page()
    merrs = []
    mp.on("pageerror", lambda e: merrs.append(str(e)))
    mp.add_init_script(INIT_SEED)
    mp.goto(URL, wait_until="domcontentloaded")
    mp.wait_for_timeout(1500)
    mp.click("#generateBtn")
    mp.wait_for_timeout(4000)
    results["mobile_revealed"] = state(mp)
    mp.screenshot(path=OUT + "\\animate-mobile.png", full_page=True)
    mctx.close()

    # --- Reduced motion: everything still works, animations suppressed
    rctx = b.new_context(viewport={"width": 1440, "height": 900}, reduced_motion="reduce")
    rp = rctx.new_page()
    rerrs = []
    rp.on("pageerror", lambda e: rerrs.append(str(e)))
    rp.add_init_script(INIT_SEED)
    rp.goto(URL, wait_until="domcontentloaded")
    rp.wait_for_timeout(1500)
    rp.click("#generateBtn")
    rp.wait_for_timeout(4000)
    results["reduced_revealed"] = state(rp)
    results["reduced_motions"] = rp.evaluate("""() => ({
        modalBoxAnim: getComputedStyle(document.querySelector('.site-modal-box')).animationName,
        meterTransition: getComputedStyle(document.querySelector('.battle_stats .meter i')).transitionProperty,
        slotAnim: getComputedStyle(document.querySelector('.deck-grid .card-slot')).animationName,
    })""")
    rctx.close()

    results["pageerrors"] = {"desktop": errs, "mobile": merrs, "reduced": rerrs}
    print(json.dumps(results, ensure_ascii=False, indent=1))
    b.close()
