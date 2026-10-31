# Yousef Emara Website

This repository preserves the existing website at https://yousefemara.com/.
The owner approved the production HTML captured on October 31, 2026 as the initial
GitHub baseline. Website content matches that snapshot byte for byte. Automatic
production deployment remains disabled pending configuration and preview verification
and a separate release approval.

## Source

- `public/index.html` contains the complete static website, including embedded CSS,
  JavaScript, images, logos, and fonts. No npm dependencies or build are required.
- `vercel.json` serves only `public/`. Repository documentation is outside the
  served directory. Git-triggered deployments are deliberately disabled for setup.
- `AGENTS.md` records the editing and release workflow for future Codex work.

The HTML is preserved byte for byte from the production response. The original
local version contains newer wording and is kept separately outside this repository
for review as a subsequent change. Backups, comparison reports, `.env` files, and
local Vercel credentials are not included in this repository.

Open `public/index.html` in a browser for a local review. Keep embedded assets intact.

## Intended Connections

| Setting | Intended value |
| --- | --- |
| GitHub repository | `yousefomaragg-blip/joo` |
| Existing Vercel team | `joon`, slug `joondasf` |
| Existing Vercel project | `yousef-emara` |
| Vercel project ID | `prj_Ee0trXYCdYVEfhO24jbCHcHixnnm` |
| Future production branch | `main` |
| Root directory | Repository root |
| Framework | Other (`null` in `vercel.json`) |
| Build command | Empty |
| Output directory | `public` |

Use the existing project. Do not create a replacement project or move the domain.
The separate projects `yousefomara` and `yousef-emara-email-marketing` are not targets.

## Setup After Baseline Approval

1. Recheck the live version and repository before any push. If production or GitHub
   has changed, reconcile it before proceeding.
2. Commit and push the approved production baseline to `main` while the Vercel
   project is still disconnected and `git.deploymentEnabled` remains `false`.
3. Connect only the verified existing project to `yousefomaragg-blip/joo`; select
   `main` as the production branch. Git deployments remain disabled by the config.
4. On a separate setup branch, remove the `git.deploymentEnabled: false` guard
   (or the entire `git` object) and push a pull request. This permits a preview
   for that setup branch while `main` still contains the disabled setting.
5. Verify the actual preview, source commit, domain routing, and screenshots on
   desktop and mobile. Do not merge until the owner approves the production release.
6. Merge the approved setup PR. This enables native Git deployment on `main` and
   publishes the verified baseline through the existing project. Check the live
   site afterward. Review the pending local wording changes in a separate PR.

Connecting a repository can trigger deployment activity. The disabled config is an
additional guard, not authorization to connect or deploy before baseline approval.
Confirm the Git setting's behavior in the existing project during the setup.

## Future Changes

1. Codex edits a feature branch and opens a pull request.
2. Once Git deployments are enabled, Vercel automatically builds a preview for
   branch pushes and attaches the preview to the PR.
3. Review the preview and approve the exact proposed change.
4. Codex merges only after your explicit approval; `main` then triggers production.
5. Verify the production URL and retain the previous deployment for rollback.

Vercel does not automatically wait for a chat approval before publishing `main`.
Approval is enforced by withholding the merge; direct pushes to `main` must be avoided.
GitHub branch rules can reinforce PR-only changes. Required review rules must suit
the account: GitHub does not let a PR author approve their own PR, so a solo owner
cannot use their own review as the only required approval. The exact available rules
and checks still need inspection and configuration after baseline approval.

No separate GitHub Actions deployment workflow or Vercel API token is needed for
native Git integration. Codex needs GitHub repository access, and Vercel's GitHub
installation needs access to this repository.

## References

- https://vercel.com/docs/git/vercel-for-github
- https://vercel.com/docs/builds/configure-a-build
- https://vercel.com/docs/project-configuration/git-configuration
