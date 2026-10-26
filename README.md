# Pitchfest: Boston Projects

Static site listing the projects pitched at [Pitchfest: Boston](https://www.pilot.city/boston).

## Run locally

    python3 -m http.server   # then open http://localhost:8000

## Connect the Google Sheet

1. In the sheet: File → Share → Publish to web → choose the tab → CSV → Publish.
2. Paste the link into `SHEET_CSV_URL` in `config.js`.
3. Keep the header row identical to `pfest-2026.csv`.

Edits to the sheet appear on the site on the next page load (Google may cache published sheets for a few minutes).

## Deploy

Settings → Pages → Deploy from branch → `main` / root.
