"""Verify the reveal fix: flicker state (pockets hold size, neutral sleeves) + settled deck."""
import json
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
DATA = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\data.json"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review"

with open(DATA, encoding="utf-8") as f:
    seed = f.read()
INIT = ("localStorage.removeItem('deckBuilderSavedDeck'); "
        f"localStorage.setItem('cardsData', {json.dumps(seed)});")


def boot(pg):
    pg.add_init_script(INIT)
    pg.goto(URL, wait_until="domcontentloaded")
    try:
        pg.wait_for_selector("#loadingScreen.hidden", timeout=60000)
    except Exception:
        try:
            pg.locator("#skipLoadBtn").click(timeout=3000)
            pg.wait_for_selector("#loadingScreen.hidden", timeout=15000)
        except Exception:
            pass
    pg.wait_for_timeout(300)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=EXE)

    # 1) desktop flicker state
    pg = browser.new_page(viewport={"width": 1440, "height": 900})
    boot(pg)
    pg.locator("#generateBtn").click()
    pg.wait_for_timeout(300)  # mid flicker: early pockets show pulsing ?, rest still queued
    pg.screenshot(path=OUT + "\\desktop-flicker.png")
    print("saved desktop-flicker")
    pg.wait_for_timeout(2500)
    pg.screenshot(path=OUT + "\\desktop.png", full_page=True)
    print("saved desktop")
    pg.close()

    # 2) mobile settled
    pg = browser.new_page(viewport={"width": 390, "height": 844})
    boot(pg)
    pg.locator("#generateBtn").click()
    pg.wait_for_timeout(2800)
    pg.screenshot(path=OUT + "\\mobile.png", full_page=True)
    print("saved mobile")
    pg.close()

    browser.close()
