# Shuhong Liu — Personal Website

The `main` branch contains the static website served at https://shuhongll.github.io/.
The previous Jekyll site and its original workflows are preserved on the `legacy` branch.

## Preview

```sh
python3 -m http.server 2026 --bind 127.0.0.1
```

## Deployment

Push to `main` to publish the static files to `gh-pages` using `.github/workflows/deploy.yml`.
GitHub Pages serves that branch. `.nojekyll` disables Jekyll processing.
No Ruby, Jekyll, Docker, or formatter workflows run on the new site.

The project page remains at `/I2_NeRF/`, and the full publication archive at `/publications/`.
