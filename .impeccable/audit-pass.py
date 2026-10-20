"""Audit batched pass: contrast, a11y structure, overflow, touch targets, focus behavior.
Measurement only — no fixes."""
import json
import urllib.parse
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"

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

def lum(hexcolor):
    h = hexcolor.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    def ch(v):
        return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = ch(r), ch(g), ch(b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast(fg, bg):
    l1, l2 = lum(fg), lum(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return round((hi + 0.05) / (lo + 0.05), 2)

results = {"contrast_pairs": {}, "pageerrors": []}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)

    # --- Desktop: structure + contrast + focus behavior
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: results["pageerrors"].append(str(e)))
    pg.add_init_script(INIT_SEED)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(4000)
    pg.click("#generateBtn")
    pg.wait_for_timeout(4000)

    results["contrast_pairs"] = {
        "text_on_bg": contrast("#cfd2d8", "#14161c"),
        "text_on_panel": contrast("#cfd2d8", "#191c22"),
        "text_strong_on_panel": contrast("#f5f1e6", "#191c22"),
        "text_faint_on_bg": contrast("#8f98a5", "#14161c"),
        "text_faint_on_panel": contrast("#8f98a5", "#191c22"),
        "text_muted_on_bg": contrast("#98a0ab", "#14161c"),
        "text_muted_on_panel": contrast("#98a0ab", "#191c22"),
        "placeholder_on_panel2": contrast("#8f98a5", "#101216"),
        "error_ink_on_red_bed": contrast("#ffb4a8", "#2a1a17"),
        "white_on_accent": contrast("#ffffff", "#d32f8f"),
        "accent_on_panel": contrast("#d32f8f", "#191c22"),
        "crown_on_panel2": contrast("#333845", "#101216"),
    }

    # card art images: alt present?
    results["card_img_alt"] = pg.evaluate("""(() => {
        const imgs = Array.from(document.querySelectorAll('.deck-grid .card-slot img'));
        return {
            total: imgs.length,
            missingAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
            sample: imgs.slice(0, 2).map(i => i.getAttribute('alt')),
        };
    })()""")

    # overflow at desktop
    results["overflow_desktop"] = pg.evaluate("""(() => ({
        scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth
    }))()""")

    # focus trap: open exclude modal, press Tab, record where focus lands
    pg.click("#excludeBtn")
    pg.wait_for_timeout(400)
    focusPath = []
    for i in range(12):
        pg.keyboard.press("Tab")
        focusPath.append(pg.evaluate("document.activeElement ? document.activeElement.tagName + '.' + (document.activeElement.className || '').toString().slice(0, 20) + '#' + (document.activeElement.id || '') : 'none'"))
    results["focus_path_from_modal"] = focusPath

    # does Escape close + focus restore?
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)
    results["focus_after_close"] = pg.evaluate("document.activeElement ? document.activeElement.id || document.activeElement.tagName : 'none'")
    ctx.close()

    # --- Mobile 360: overflow + touch targets
    mctx = b.new_context(viewport={"width": 360, "height": 780}, is_mobile=True, has_touch=True)
    mp = mctx.new_page()
    mp.on("pageerror", lambda e: results["pageerrors"].append("mobile: " + str(e)))
    mp.add_init_script(INIT_SEED)
    mp.goto(URL, wait_until="domcontentloaded")
    mp.wait_for_timeout(4000)
    results["overflow_360"] = mp.evaluate("""(() => ({
        scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth
    }))()""")
    mp.click("#generateBtn")
    mp.wait_for_timeout(4000)

    results["touch_targets_360"] = mp.evaluate("""(() => {
        const sel = {
            roundCopy: '#copyBtn',
            closePopover: '#closePopoverBtn',
            skipLoad: '#skipLoadBtn',
            generate: '#generateBtn',
            chip: '.options-panel .checkbox-group',
            excludeBtn: '#excludeBtn',
            helpIcon: '.help-icon',
            closeModal: '#closeExcludeModal',
            modalBtns: '.site-modal-btn',
        };
        const out = {};
        for (const [name, s] of Object.entries(sel)) {
            const el = document.querySelector(s);
            if (!el) { out[name] = 'not found'; continue; }
            const r = el.getBoundingClientRect();
            out[name] = { w: Math.round(r.width), h: Math.round(r.height) };
        }
        return out;
    })""")

    # 320px narrow
    mp.set_viewport_size({"width": 320, "height": 700})
    mp.wait_for_timeout(300)
    results["overflow_320"] = mp.evaluate("""(() => ({
        scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth
    }))()""")

    # preloaded image count (seeded: 38 cards; real-data scale noted separately)
    results["preloaded_images_seed"] = mp.evaluate("window.CR.preloadedImages ? window.CR.preloadedImages.size : null")
    mctx.close()
    b.close()

print(json.dumps(results, ensure_ascii=False, indent=1))
