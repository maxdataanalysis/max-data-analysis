# MAX Data Analysis — website

Static marketing site for MAX Data Analysis (working name — see trademark flag in `go-live-plan.md` one level up). Plain HTML/CSS/JS, no build step, so it deploys as-is to GitHub Pages.

## Structure

```
index.html          Homepage
about.html           Team / positioning
how-it-works.html    Process explainer
examples.html        Example projects / use cases
book.html            Consultation booking form (front-end only — see TODO)
contact.html         Contact form (front-end only — see TODO)
faq.html
terms.html
privacy.html
cookies.html
license.html
assets/style.css
assets/app.js
404.html             GitHub Pages custom 404
.nojekyll             Tells GitHub Pages to skip Jekyll processing
.github/workflows/deploy.yml   Auto-deploy to GitHub Pages on push to main
```

## Deploy to GitHub Pages

1. Create a new **public** (or private, with GitHub Pages enabled on a paid plan) repo on GitHub — e.g. `max-data-analysis-website`. Do not initialize it with a README.
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MAX Data Analysis website"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages → Build and deployment → Source → GitHub Actions**. The included workflow (`.github/workflows/deploy.yml`) will build and publish automatically on every push to `main`.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.
5. Once you own a domain (see `go-live-plan.md`), add a `CNAME` file at the repo root containing just the domain name, and point the domain's DNS at GitHub Pages (`Settings → Pages → Custom domain` walks through the exact records).

## Known gaps before this is launch-ready

Carried over from `go-live-plan.md` in the parent project folder:

- **Forms don't submit anywhere yet.** `book.html` and `contact.html` currently have `onsubmit="return false;"` — they need a form backend (e.g. Formspree, a Cloudflare Worker, or a real mail-sending endpoint) before going live.
- **Placeholder email** — every page footer uses `hello@maxdataanalysis.com`, which isn't a real inbox yet. Find-and-replace once a domain and mailbox exist.
- **Domain name** — not purchased yet; possible trademark conflict with MAXQDA flagged for review.
- **Pricing shown on the site are still hypotheses**, not finalized/approved figures (see the project's operating instructions — pricing requires explicit approval before being treated as final).

## Content and positioning rules

This site was built and should continue to be edited according to the project's standing operating instructions (positioning, prohibited claims, omics-scope restriction, pricing-approval rules, etc.). Do not add claims like "no bioinformatics expertise required," guaranteed scientific outcomes, or omics-analysis consulting without checking those rules first.
