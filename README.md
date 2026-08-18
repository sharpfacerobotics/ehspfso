# Emerald High School Robotics Website

This folder is a self-contained static website for the Emerald High School FTC program. It can be moved into its own repository and deployed directly with GitHub Pages; no build step is required.

## Structure

- `index.html` — page structure and content sections
- `assets/css/styles.css` — visual styles and responsive layout
- `assets/js/site.js` — navigation, animations, tilt, and contact interactions
- `assets/js/team-data.js` — Sharp Face and Dark Force roster data
- `assets/js/team-bios.js` — accessible team tabs and roster-card rendering
- `assets/js/admin.js` — Firebase CMS and admin editing behavior
- `assets/` — the copied, deployment-local image and sponsor assets

Update member names, roles, portraits, grades, or bios in `assets/js/team-data.js`. Members without a portrait automatically receive their team's `SF` or `DF` default icon.

## Local preview

Run a static server from this directory, then open the printed local URL:

```bash
python3 -m http.server 8000
```

The EHS CMS uses the separate Firestore document `siteContent/ehs-main` and the browser preference key `ehs-cms-load-enabled`, so it will not load the original Sharp Face website's saved markup.
