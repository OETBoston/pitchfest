// Set SHEET_CSV_URL to the Google Sheet's "Published to web" CSV link:
// Google Sheets → File → Share → Publish to web → select the sheet tab → CSV.
// The URL looks like https://docs.google.com/spreadsheets/d/e/<id>/pub?output=csv
// While empty (or if the fetch fails), the site falls back to the local CSV.
window.PITCHFEST_CONFIG = {
  SHEET_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWUuBHilMAkCraMGIxtFrR-xZyhpkDx9xGcgm_x25gyl22qguz6ulEs06HfstEIBwQ-IGzW9cLqj6N/pub?gid=1663094447&single=true&output=csv",
  FALLBACK_CSV: "pfest-2026.csv",
  // Google Form links for the two hero buttons; a button stays hidden while its URL is empty.
  SUBMIT_IDEA_URL: "https://docs.google.com/forms/d/e/1FAIpQLSdTI1lcDQDhpCrW2Lp5PrW1U4dFG7-ydO7TPvXjuVTJZkt2qg/viewform?usp=publish-editor",
  EXPRESS_INTEREST_URL: "https://docs.google.com/forms/d/e/1FAIpQLSfX-NNvQWqL1zYL0W8kH-XcyGNCh9pJtZR5IaHhaOcZVsnBLA/viewform?usp=publish-editor",
};
