"""Diagnose the row-1 art issue in the mobile settled state."""
import json
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
DATA = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\data.json"

with open(DATA, encoding="utf-8") as f:
    seed = f.read()
INIT = ("localStorage.removeItem('deckBuilderSavedDeck'); "
        f"localStorage.setItem('cardsData', {json.dumps(seed)});")

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    pg = b.new_page(viewport={"width": 390, "height": 844})
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
    pg.wait_for_timeout(4000)
    info = pg.evaluate("""() => {
        const slots = [...document.querySelectorAll('#deckContainer .card-slot')];
        return slots.map((s, i) => {
            const img = s.querySelector('img');
            const art = s.querySelector('.card-art');
            const cs = getComputedStyle(s);
            return {
                i,
                classes: s.className,
                slotW: s.offsetWidth, slotH: s.offsetHeight,
                aspect: cs.aspectRatio,
                artH: art ? art.offsetHeight : -1,
                imgExists: !!img,
                imgDisplay: img ? getComputedStyle(img).display : null,
                imgW: img ? img.offsetWidth : -1,
                imgH: img ? img.offsetHeight : -1,
                imgComplete: img ? img.complete : null,
                imgNatW: img ? img.naturalWidth : null,
                imgSrcHead: img && img.src ? img.src.slice(0, 60) : null,
            };
        });
    }""")
    print(json.dumps(info, indent=1, ensure_ascii=False))
    pg.screenshot(path=r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review\mobile2.png", full_page=True)
    print("saved mobile2")
    b.close()
