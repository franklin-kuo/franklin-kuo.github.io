# Franklin Kuo — Engineering Portfolio

Static portfolio site. No build step, no dependencies to install — plain HTML, CSS, and JavaScript.

## Local preview

```bash
node serve.js
# → http://localhost:8099
```

`serve.js` is for local preview only and is not needed in production.

## Structure

```
index.html              markup + all copy
styles.css              design tokens, layout, scroll choreography
main.js                 hero grid, reveals, counters, STL viewer
assets/ocell.stl        source mesh (binary STL, 2,917 triangles)
assets/ocell-data.js    the same mesh, base64-embedded so the viewer
                        works from file:// without a server
assets/Franklin-Kuo-Resume.pdf
```

## Updating content

- **Copy and numbers** live directly in `index.html`.
- **Colors and type** are CSS custom properties at the top of `styles.css` (`:root`).
- **Résumé** — replace `assets/Franklin-Kuo-Resume.pdf`, keeping the filename.
- **The 3D model** — replace `assets/ocell.stl`, then regenerate the embedded copy:

  ```powershell
  $b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("assets\ocell.stl"))
  "window.OCELL_STL_B64 = `"$b64`";" | Out-File assets\ocell-data.js -Encoding utf8
  ```

## Deploying to GitHub Pages

Push to a repo named `<username>.github.io`, then enable Pages in
Settings → Pages → Source: `main`, folder `/ (root)`.

## Notes on content

Client and corridor names from the internship work are anonymized throughout
("Corridor A", "a civil engineering consultancy"). The accuracy figures are
taken from the project's own verification runs. The stated acceptance bar is
98% of points within 0.20 ft; the 100.00% and 99.52% figures are measured at
the tighter 0.05 ft tolerance on specific corridors.
