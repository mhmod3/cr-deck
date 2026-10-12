"""Final review captures using the REAL Clash Royale dataset + CDN card art.
Seeds localStorage with the real data.json so the app skips the GitHub fetch
(icon preload still uses the CDN over the network).
"""
import json
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
DATA = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\data.json"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review"

with open(DATA, encoding="utf-8") as f:
    seed = f.read()  # already valid JSON

INIT = ("localStorage.removeItem('deckBuilderSavedDeck'); "
        f"localStorage.setItem('cardsData', {json.dumps(seed)});")

JOBS = [
    ("desktop", 1440, 900, True),
    ("mobile", 390, 844, True),
    ("mobile-empty", 390, 844, False),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=EXE)
    for name, w, h, gen in JOBS:
        pg = browser.new_page(viewport={"width": w, "height": h})
        pg.add_init_script(INIT)
        pg.goto(URL, wait_until="domcontentloaded")
        hidden = False
        try:
            pg.wait_for_selector("#loadingScreen.hidden", timeout=90000)
            hidden = True
            print(name, ": preloaded")
        except Exception:
            # fall back to skip so the app proceeds even if preload is slow
            try:
                pg.locator("#skipLoadBtn").click(timeout=3000)
                pg.wait_for_selector("#loadingScreen.hidden", timeout=15000)
                print(name, ": skipped preload")
            except Exception as e:
                print(name, ": still stuck:", str(e)[:80])
        pg.wait_for_timeout(500)
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
