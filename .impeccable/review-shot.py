"""Batched review captures for the binder-world build."""
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "file:///C:/Users/pc/Desktop/M7%20projects/cr%20website/index.html"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\review"

JOBS = [
    # (name, width, height, generate)
    ("desktop", 1440, 900, True),
    ("mobile", 390, 844, True),
    ("mobile-empty", 390, 844, False),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=EXE)
    for name, w, h, gen in JOBS:
        pg = browser.new_page(viewport={"width": w, "height": h})
        pg.add_init_script("localStorage.removeItem('deckBuilderSavedDeck')")
        pg.goto(URL, wait_until="domcontentloaded")
        try:
            pg.wait_for_selector("#loadingScreen.hidden", timeout=45000)
            print(name, ": data loaded")
        except Exception:
            print(name, ": loading screen did not hide (data fetch blocked?)")
        pg.wait_for_timeout(1000)
        if gen:
            btn = pg.locator("#generateBtn")
            if btn.is_enabled():
                btn.click()
                pg.wait_for_timeout(2600)  # staggered reveal settles
            else:
                print(name, ": generate button disabled")
        pg.screenshot(path=OUT + "\\" + name + ".png", full_page=True)
        print("saved", name)
        pg.close()
    browser.close()
