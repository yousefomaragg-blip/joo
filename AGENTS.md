# Website Editing Instructions

- Edit content in `public/index.html`, presentation in `public/styles.css`, and
  interactions in `public/script.js`. Fonts and logos are local to `public/`.
  Preserve embedded campaign evidence and verified claims unless requested.
- Do not rebuild the site in a framework or add dependencies for routine edits.
- Keep `.env` files, `.vercel` credentials, and local backups out of Git and public/.
- Use a feature branch and a pull request for review once Git deployment is active.
- Verify affected content, references, and interactions; describe any test limitations.
- Keep `git.deploymentEnabled: false` unless the owner explicitly authorizes
  automatic Git deployments. A manual release approval does not enable automation.
- Do not push to or merge into `main`, change domains, or deploy production without
  the owner's explicit authorization for the proposed baseline or release.
