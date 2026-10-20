"""Harden verification: seeded happy path on desktop+mobile, empty search, offline error UI."""
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
        cardsInGrid: document.querySelectorAll('.deck-grid .card-slot').length,
        avg: document.getElementById('avgElixirDisplay').textContent,
        avgEmpty: document.getElementById('avgElixirDisplay').classList.contains('empty-value'),
        copyDisabled: document.getElementById('copyBtn').disabled,
        supportVisible: document.getElementById('supportStatsImg').style.visibility,
        errVisible: document.getElementById('errorMsg').classList.contains('visible'),
        errText: document.getElementById('errorMsg').textContent,
        skipVisible: document.getElementById('skipLoadBtn').style.display !== 'none',
        loadErrVisible: document.getElementById('loadingError').classList.contains('visible'),
        loadErrText: document.getElementById('loadingErrorText').textContent,
        gridEmpty: !!document.querySelector('.grid-empty'),
        gridEmptyText: (document.querySelector('.grid-empty')||{}).textContent || '',
        helpVisible: document.getElementById('siteHelpModal').classList.contains('visible'),
        helpText: document.getElementById('siteHelpText').textContent,
        excludeCards: document.querySelectorAll('#excludeCardsGrid .exclude-card').length,
        ariaPressed: document.querySelector('#excludeCardsGrid .exclude-card') ? document.querySelector('#excludeCardsGrid .exclude-card').getAttribute('aria-pressed') : null,
    })""")

results = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)

    # --- Desktop: happy path + empty search + help icon keyboard
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(INIT_SEED)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)
    results["desktop_start"] = state(pg)

    pg.click("#generateBtn")
    pg.wait_for_timeout(3500)  # cascade complete
    results["desktop_revealed"] = state(pg)
    pg.screenshot(path=OUT + "\\harden-desktop.png")

    # empty search state
    pg.click("#excludeBtn")
    pg.wait_for_timeout(300)
    pg.fill("#excludeSearchInput", "zzz-nomatch")
    pg.wait_for_timeout(600)
    results["desktop_emptysearch"] = state(pg)
    pg.screenshot(path=OUT + "\\harden-emptysearch-desktop.png")
    pg.fill("#excludeSearchInput", "Spell")
    pg.wait_for_timeout(600)
    results["desktop_search_spell"] = {"cards": state(pg)["excludeCards"], "gridEmpty": state(pg)["gridEmpty"]}
    # toggle a card from keyboard
    pg.focus("#excludeCardsGrid .exclude-card")
    pg.keyboard.press("Enter")
    pg.wait_for_timeout(300)
    results["desktop_kbd_toggle"] = {
        "excluded": pg.evaluate("document.querySelectorAll('#excludeCardsGrid .exclude-card.excluded').length"),
    }
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)
    results["desktop_modal_closed"] = {"excludeVisible": pg.evaluate("document.getElementById('excludeModal').classList.contains('visible')")}

    # help icon keyboard
    pg.focus(".help-icon")
    pg.press(".help-icon", "Enter")
    pg.wait_for_timeout(200)
    results["desktop_help_kbd"] = state(pg)
    pg.keyboard.press("Escape")

    # last-spell exclusion is blocked with the site modal (forceSpells on)
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(150)
    pg.click("#excludeBtn")
    pg.fill("#excludeSearchInput", "Spell")
    pg.wait_for_timeout(400)
    pg.evaluate("document.getElementById('forceSpellsCheck').checked = true")
    for _ in range(12):
        if pg.evaluate("document.getElementById('siteHelpModal').classList.contains('visible')"):
            break
        cards = pg.evaluate("document.querySelectorAll('#excludeCardsGrid .exclude-card:not(.excluded)').length")
        if cards == 0:
            break
        pg.click("#excludeCardsGrid .exclude-card:not(.excluded)")
        pg.wait_for_timeout(150)
    pg.wait_for_timeout(300)
    s = state(pg)
    results["desktop_last_spell_blocked"] = {
        "helpVisible": s["helpVisible"],
        "helpText": s["helpText"],
        "forceSpellsChecked": pg.evaluate("document.getElementById('forceSpellsCheck').checked"),
    }
    pg.screenshot(path=OUT + "\\harden-helpmodal-desktop.png")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(150)

    # aggregated notice path: storage says ALL spells excluded + forceSpells checked -> boot notice
    pg.evaluate("""() => {
        const spellIds = ['Spell 31','Spell 32','Spell 33','Spell 34','Spell 35','Spell 36','Spell 37','Spell 38','Spell 39']
            .map((_, i) => 28000000 + i);
        localStorage.setItem('deckBuilderExcluded', JSON.stringify(spellIds));
        localStorage.setItem('deckBuilderChecks', JSON.stringify({forceSpells: true}));
        localStorage.removeItem('deckBuilderSavedDeck');
    }""")
    pg.reload()
    pg.wait_for_timeout(2500)
    s = state(pg)
    results["desktop_boot_notice"] = {
        "helpVisible": s["helpVisible"],
        "helpText": s["helpText"],
        "forceSpellsChecked": pg.evaluate("document.getElementById('forceSpellsCheck').checked"),
        "forceSpellsDisabled": pg.evaluate("document.getElementById('forceSpellsCheck').disabled"),
        "placeholder": s["avgEmpty"],
    }
    pg.screenshot(path=OUT + "\\harden-bootnotice-desktop.png")

    # --- Mobile: same flow + layout capture
    mp = b.new_page(viewport={"width": 390, "height": 844})
    merrs = []
    mp.on("pageerror", lambda e: merrs.append(str(e)))
    mp.add_init_script(INIT_SEED)
    mp.goto(URL, wait_until="domcontentloaded")
    mp.wait_for_timeout(1500)
    results["mobile_start"] = state(mp)
    mp.click("#generateBtn")
    mp.wait_for_timeout(3500)
    results["mobile_revealed"] = state(mp)
    mp.screenshot(path=OUT + "\\harden-mobile.png", full_page=True)

    # --- Offline: no seed, blocked route -> error UI, skip hidden
    op = b.new_page(viewport={"width": 1440, "height": 900})
    oerrs = []
    op.on("pageerror", lambda e: oerrs.append(str(e)))
    op.route("https://raw.githubusercontent.com/**", lambda r: r.abort())
    op.goto(URL, wait_until="domcontentloaded")
    op.wait_for_timeout(2000)
    s = state(op)
    results["offline_error"] = {"loadErrVisible": s["loadErrVisible"], "text": s["loadErrText"],
                                "skipVisible": s["skipVisible"], "loadingHidden": s["loadingHidden"]}
    op.screenshot(path=OUT + "\\harden-offline.png")

    results["pageerrors"] = {"desktop": errs, "mobile": merrs, "offline": oerrs}
    print(json.dumps(results, ensure_ascii=False, indent=1))
    b.close()
