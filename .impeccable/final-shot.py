"""Final clean captures: wait for all deck card images to finish loading."""
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


def wait_imgs(pg, cap_ms=30000):
    pg.wait_for_function(
        """() => {
            const imgs = [...document.querySelectorAll('#deckContainer .card-slot img')];
            if (!imgs.length) return false;
            return imgs.every(i => i.complete && i.naturalWidth > 0);
        }""",
        timeout=cap_ms,
    )


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    for name, w, h in [("desktop", 1440, 900), ("mobile", 390, 844)]:
        pg = b.new_page(viewport={"width": w, "height": h})
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
        pg.locator("#generateBtn").click()
        try:
            wait_imgs(pg)
            print(name, ": all card images loaded")
        except Exception:
            print(name, ": some images still pending (CDN slow)")
        pg.wait_for_timeout(800)  # let the reveal + meter settle
        pg.screenshot(path=OUT + "\\" + name + ".png", full_page=True)
        print("saved", name)
        pg.close()
    b.close()
