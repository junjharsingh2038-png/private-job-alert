# Private Job Alert — Repository Audit & Backup Plan

Audit date: 2026-11-21  
Repository: `junjharsingh2038-png/private-job-alert`  
Default branch: `main`  
Baseline commit: `873eaee962f236239651c5a94b15a8ba21556cfe`

## Backup and change isolation
- Created `backup/pre-seo-design-20261121` from the exact baseline commit.
- Created `feature/india-seo-design` from the same baseline for isolated changes.
- The `main` branch is not modified by this implementation.
- Proposed changes should be reviewed through a Pull Request before merging.

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
2. Homepage job cards and job-share links used `jobs/view.html?id=...`, while the canonical static pages use `jobs/<slug>/`. This creates two competing job URL patterns and weakens internal linking to the canonical SEO pages.
3. The job-page generator's meta description was cut at a fixed character count, sometimes truncating the final word.
4. The JobPosting generator assigned a physical `jobLocation` even to explicitly remote/work-from-home vacancies.
5. The hourly SEO workflow's push trigger did not specify a branch, while its commit step explicitly pushed generated pages to `main`. A change to the generator on a non-main branch could therefore have caused an unintended main-branch update.
6. Homepage styles contain many historical overrides. This change adds a small final polish layer instead of deleting or rewriting legacy styles.
7. The current public HR, Employee, Supabase and Apply workflows are outside the scope of this patch and are intentionally untouched.

## Changes in this implementation branch
- Align homepage job-card and share URLs with the generated static job-page slug.
- Improve generated meta description truncation.
- Mark explicitly remote vacancies with the appropriate remote JobPosting properties; keep physical location data for other jobs.
- Add homepage Open Graph, Twitter, icon, theme-color and preconnect metadata.
- Add a small additive CSS layer for responsive card consistency, keyboard focus, mobile controls and reduced-motion accessibility.
- Restrict SEO generation and Google indexing push triggers to `main`, preventing feature-branch pushes from triggering workflows that operate on production.
  
## Validation required before merge
- Python syntax-check `scripts/generate_jobs.py`.
- Check generated HTML and parse each JSON-LD block as JSON.
- Verify all generated canonical URLs and sitemap locations.
- Verify homepage, HR portal, Employee portal and application routes remain present.
- Test the SEO generator in a non-production branch with a read-only fixture or controlled staging data before any production run.
- Confirm Google Rich Results Test and Search Console after deployment.
  
## Rollback
If a merged release causes a regression, revert the merge commit or restore the exact baseline using `backup/pre-seo-design-20261121`. Do not delete the backup branch.
