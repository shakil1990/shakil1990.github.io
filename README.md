# Portfolio

Static portfolio site. Projects, skills and stats are loaded live from the GitHub API for `shakil1990`.

## Run locally

```
python -m http.server 8000
```

Open http://localhost:8000.

## Deploy (GitHub Pages)

1. Create a **public** repo named exactly `shakil1990.github.io`.
2. Push this folder to its `main` branch.
3. In the repo, Settings → Pages → Deploy from branch → `main` / root.
4. Site is live at https://shakil1990.github.io.

## Customise

- Tagline and About text: `index.html`
- GitHub username: `GITHUB_USER` in `script.js`
