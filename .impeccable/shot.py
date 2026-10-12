"""Screenshot helper for the impeccable review rounds."""
import sys
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"

def shot(url, out, viewport=(1280, 900), wait_ms=12000, full=False):
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=EXE)
        pg = b.new_page(viewport={"width": viewport[0], "height": viewport[1]})
        pg.goto(url, wait_until="domcontentloaded")
        pg.wait_for_timeout(wait_ms)
        pg.screenshot(path=out, full_page=full)
        b.close()
        print("saved", out)

if __name__ == "__main__":
    shot(sys.argv[1], sys.argv[2])
