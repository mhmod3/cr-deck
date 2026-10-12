"""Test chromium network access and save the real card data."""
import json
from playwright.sync_api import sync_playwright

EXE = r"C:\Users\pc\AppData\Local\ms-playwright\chromium-1234\chrome-win64\chrome.exe"
URL = "https://raw.githubusercontent.com/mhmod3/cr-deck/refs/heads/main/data.json"
OUT = r"C:\Users\pc\Desktop\M7 projects\cr website\.impeccable\data.json"

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=EXE)
    pg = b.new_page()
    try:
        resp = pg.request.get(URL, timeout=30000)
        if resp.ok:
            data = json.loads(resp.text())
            with open(OUT, "w", encoding="utf-8") as f:
                json.dump(data, f)
            print("saved data.json:", len(data.get("items", [])), "items,",
                  len(data.get("supportItems", [])), "support")
        else:
            print("fetch failed:", resp.status)
    except Exception as e:
        print("network blocked:", type(e).__name__, str(e)[:200])
    b.close()
