"""Polish/harden verification: state restoration on failure, focus trap, focus return,
alt text, live region, theme-color, hit areas, deep-link fallback, load concurrency guard.
Batched: desktop + mobile + offline in one pass."""
import json
import time
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

def stub_cdn(page):
    """Hermetic: CDN responses don't block DOMContentLoaded (no network in CI)."""
    def handler(route):
        url = route.request.url
        if "qrcodejs" in url:
            route.fulfill(status=200, content_type="application/javascript", body="")
        elif "fonts.googleapis.com" in url or "fonts.gstatic.com" in url:
            route.fulfill(status=200, content_type="text/css", body="")
        else:
            route.continue_()
    page.route("**/*", handler)

def state(pg):
    return pg.evaluate("""() => ({
        dataLoaded: window.CR.dataLoaded,
        cardsInGrid: document.querySelectorAll('.deck-grid .card-slot').length,
        avg: document.getElementById('avgElixirDisplay').textContent,
        copyDisabled: document.getElementById('copyBtn').disabled,
        errVisible: document.getElementById('errorMsg').classList.contains('visible'),
        errText: document.getElementById('errorMsg').textContent,
        announce: document.getElementById('deckAnnounce').textContent,
        themeColor: (document.querySelector('meta[name="theme-color"]')||{}).content || null,
        altOk: [...document.querySelectorAll('.deck-grid .card-slot img')].filter(i => i.alt && i.alt !== '').length,
        closeBox: (() => {
            const b = document.getElementById('closePopoverBtn');
            const r = b.getBoundingClientRect();
            return { w: Math.round(r.width), h: Math.round(r.height) };
        })(),
        activeId: document.activeElement ? (document.activeElement.id || document.activeElement.className) : null,
        helpVisible: document.getElementById('siteHelpModal').classList.contains('visible'),
        helpText: document.getElementById('siteHelpText').textContent,
    })""")

results = {}
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)

    # ---------- Desktop ----------
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script(INIT_SEED)
    stub_cdn(pg)
    pg.goto(URL, wait_until="domcontentloaded")
    pg.wait_for_timeout(1500)

    # happy path
    pg.click("#generateBtn")
    pg.wait_for_timeout(3500)
    s = state(pg)
    results["desktop_revealed"] = s
    results["desktop_revealed_ok"] = (
        s["cardsInGrid"] == 8 and s["altOk"] == 8 and not s["copyDisabled"]
        and s["themeColor"] == "#14161c" and "إنشاء تشكيلة" in s["announce"]
        and s["closeBox"]["h"] >= 24 and s["closeBox"]["w"] >= 24
    )
    pg.screenshot(path=OUT + "\\polish-desktop.png")

    # focus trap in exclude modal: wrap at both ends
    pg.click("#excludeBtn")
    pg.wait_for_timeout(300)
    pg.evaluate("document.querySelector('#excludeCardsGrid .exclude-card:last-of-type').focus()")
    pg.keyboard.press("Tab")
    results["trap_forward_wrap"] = state(pg)["activeId"] == "closeExcludeModal"
    pg.evaluate("document.getElementById('closeExcludeModal').focus()")
    pg.keyboard.press("Shift+Tab")
    results["trap_backward_wrap"] = pg.evaluate("document.activeElement && document.activeElement.tagName === 'DIV'")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(200)

    # popover focus return on close
    pg.click("#copyBtn")
    pg.wait_for_timeout(250)
    pg.focus("#closePopoverBtn")
    pg.keyboard.press("Escape")
    pg.wait_for_timeout(150)
    results["popover_focus_return"] = state(pg)["activeId"] == "copyBtn"

    # desktop open-link: window.open path, no deep-link help
    pg.click("#copyBtn")
    pg.wait_for_timeout(250)
    pg.click("#openLinkBtn")
    pg.wait_for_timeout(300)
    s = state(pg)
    results["desktop_openlink_no_help"] = not s["helpVisible"]

    # generation failure: deck stays, copy button restored, specific error shown
    pg.evaluate("""() => {
        const orig = window.CR.pickEightCards;
        window.CR.pickEightCards = () => null;
        window.CR.generateDeck();
        window.CR.pickEightCards = orig;
    }""")
    pg.wait_for_timeout(200)
    s = state(pg)
    results["fail_state_restored"] = {
        "copyDisabled": s["copyDisabled"],
        "errVisible": s["errVisible"],
        "errText": s["errText"],
        "cardsKept": s["cardsInGrid"],
        "ok": (not s["copyDisabled"]) and s["errVisible"] and s["cardsInGrid"] == 8,
    }

    # ---------- Mobile (deep-link fallback) ----------
    ctx = b.new_context(viewport={"width": 390, "height": 844},
                        user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E146 Safari/604.1",
                        has_touch=True)
    mp = ctx.new_page()
    merrs = []
    mp.on("pageerror", lambda e: merrs.append(str(e)))
    mp.add_init_script(INIT_SEED)
    stub_cdn(mp)
    mp.goto(URL, wait_until="domcontentloaded")
    mp.wait_for_timeout(1500)
    mp.click("#generateBtn")
    mp.wait_for_timeout(3500)
    results["mobile_revealed"] = state(mp)
    mp.screenshot(path=OUT + "\\polish-mobile.png", full_page=True)

    results["mobile_no_hscroll_390"] = mp.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    mp2 = b.new_page(viewport={"width": 320, "height": 700})
    mp2.add_init_script(INIT_SEED)
    stub_cdn(mp2)
    mp2.goto(URL, wait_until="domcontentloaded")
    mp2.wait_for_timeout(1500)
    results["mobile_no_hscroll_320"] = mp2.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")

    # deep link with no app installed -> guided notice
    mp.click("#copyBtn")
    mp.wait_for_timeout(250)
    mp.click("#openLinkBtn")
    mp.wait_for_timeout(1100)
    s = state(mp)
    results["mobile_deeplink_fallback"] = {
        "helpVisible": s["helpVisible"],
        "helpText": s["helpText"],
        "ok": s["helpVisible"] and "لم يتم فتح اللعبة" in s["helpText"],
    }
    mp.screenshot(path=OUT + "\\polish-deepfallback-mobile.png")

    # ---------- Offline: concurrency guard on retry ----------
    octx = b.new_context(viewport={"width": 1440, "height": 900})  # context خالٍ: بلا localStorage زرع
    op = octx.new_page()
    oerrs = []
    op.on("pageerror", lambda e: oerrs.append(str(e)))
    stub_cdn(op)
    reqs = []
    op.on("request", lambda r: reqs.append(1) if "raw.githubusercontent.com" in r.url else None)

    def delayed_abort(route):
        time.sleep(0.6)          # keep the fetch in flight so the double-click lands inside the guard
        route.abort()
    op.route("https://raw.githubusercontent.com/**", delayed_abort)
    op.goto(URL, wait_until="domcontentloaded")
    op.wait_for_timeout(2500)
    results["offline_error_shown"] = op.evaluate("document.getElementById('loadingError').classList.contains('visible')")
    # concurrent loadData: second call inside the in-flight window must be blocked
    op.evaluate("window.CR.loadData(); window.CR.loadData();")
    op.wait_for_timeout(2000)
    results["loaddata_doublecall_requests"] = len(reqs)  # expect 2: initial + one guarded pair
    op.evaluate("window.CR.loadData();")
    op.wait_for_timeout(2000)
    results["loaddata_sequential_requests"] = len(reqs)  # expect 3

    results["pageerrors"] = {"desktop": errs, "mobile": merrs, "offline": oerrs}
    print(json.dumps(results, ensure_ascii=False, indent=1))
    b.close()
