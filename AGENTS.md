# Website Editing Instructions

- Edit the existing static website in `public/index.html`. Preserve its embedded
  assets and current design unless the user's requested change requires otherwise.
- Do not rebuild the site in a framework or add dependencies for routine edits.
- Keep `.env` files, `.vercel` credentials, and local backups out of Git and public/.
- Use a feature branch and a pull request for review once Git deployment is active.
- Verify affected content, references, and interactions; describe any test limitations.
- Keep `git.deploymentEnabled: false` until the owner approves the baseline and
  authorizes setup activation. See README.md for the staged activation sequence.
- Do not push to or merge into `main`, change domains, or deploy production without
  the owner's explicit authorization for the proposed baseline or release.
