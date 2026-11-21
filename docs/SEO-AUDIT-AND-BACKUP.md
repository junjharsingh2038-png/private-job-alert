# Private Job Alert — Repository Audit & Backup Plan

Audit date: 2026-11-21  
Repository: `junjharsingh2038-png/private-job-alert`  
Default branch: `main`  
Baseline commit: `4f9354061d9bf75a8876dd5233dfc7ecdc913c72`

## Backup and change isolation
- Created `backup/seo-baseline-2026-11-21` from the exact `main` head above.
- Created `seo/all-india-improvements` from the same baseline for isolated changes.
- `main` is not modified by the proposed SEO changes.
- Changes are reviewed through a Pull Request before merging.

## Repository inventory
The default branch contains 98 tracked files, including:
- Public site: `index.html`, `style.css`, `homepage-overrides.css`, image and brand assets.
- Job search and application: `app.js`, `apply.html`, `jobs/view.html`, `job-details.js`, `job-share.js`.
- HR portal: `hr.html`, HR dashboard, company profile and login scripts.
- Employee portal: `seeker.html`, profile, registration, resume and application scripts.
- SEO: `scripts/generate_jobs.py`, `jobs/*/index.html`, `cities/*`, `categories/*`, `sitemap.xml`, `robots.txt`.
- Automation: GitHub Pages deployment, hourly SEO generation and Google Indexing workflows.
- Supabase schema and Edge Function source.

## Findings
1. SEO generation already creates static job pages, JobPosting JSON-LD, BreadcrumbList, city landing pages and a sitemap. These capabilities must be retained.
2. Homepage job cards and job-share links used `jobs/view.html?id=...`, while the canonical static pages use `jobs/<slug>/`. This created two competing job URL patterns and weakened internal linking to canonical SEO pages. Existing generated pages already contain JobPosting and BreadcrumbList JSON-LD; those were retained.
3. The job-page generator's meta description was cut at a fixed character count, sometimes truncating the final word.
4. The JobPosting generator assigned a physical `jobLocation` even to explicitly remote/work-from-home vacancies. Existing JobPosting and BreadcrumbList schema was confirmed in generated job pages.
5. The hourly SEO workflow's push trigger did not specify a branch, while its commit step explicitly pushed generated pages to `main`. The workflow could also be manually dispatched from another branch. Both production workflows are now restricted to `main` at the trigger and job level.
6. Homepage styles contain many historical overrides. This change adds a small final polish layer instead of deleting or rewriting legacy styles.
7. The current public HR, Employee, Supabase and Apply workflows are outside the scope of this patch and are intentionally untouched.

## Existing SEO features confirmed on `main`
- Static job pages with JobPosting and BreadcrumbList JSON-LD.
- Homepage metadata, canonical URL, Open Graph and Twitter metadata.
- Remote-job schema handling, expired-vacancy exclusion, and generated city pages.
- Automated sitemap and hourly static-page generation.

## Changes proposed on this implementation branch
- Exclude the private HR redirect route from the public sitemap.
- Publish city landing pages only when at least three active vacancies exist.
- Add validator checks for sitemap privacy, complete job-page sitemap coverage, and city-page minimum content.
- Mark the HR login and employer portal as `noindex,follow`; the employee portal already uses `noindex,follow`.
- Reduce Google Indexing API submissions to a daily batch capped at 150 job URLs, rather than submitting the entire set hourly.

## Validation required before merge
- Python syntax-check `scripts/generate_jobs.py`.
- Check generated HTML and parse each JSON-LD block as JSON.
- Verify all generated canonical URLs and sitemap locations.
- Verify homepage, HR portal, Employee portal and application routes remain present.
- Test the SEO generator in a non-production branch with a read-only fixture or controlled staging data before any production run.
- Confirm Google Rich Results Test and Search Console after deployment.
  
## Rollback
If a merged release causes a regression, revert the merge commit or restore the exact baseline using `backup/pre-seo-design-20261121`. Do not delete the backup branch.


## Portal regression follow-up — 2026-11-21
- Added a regression workflow for all repository JavaScript syntax and local script references from the homepage, HR, Employee and Apply pages.
- The first audit run exposed two existing syntax defects: raw CSS embedded in `employee-full-profile.js`, and a missing statement separator in `hr-company-profile.js`.
- Fixed both defects; moved the shared modal styling to `profile-modal.css` and linked it from `hr.html` and `seeker.html`.
- Latest portal regression run passed all JavaScript syntax checks and portal linked-script checks.
- Live OTP email delivery, HR/Employee authentication, profile persistence, resume upload and candidate application submission still need manual verification with authorized test accounts.
