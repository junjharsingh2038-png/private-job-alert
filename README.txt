PRIVATE JOB ALERT RAJASTHAN — ONE-SHOT APPLY SYSTEM

ROOT FILES
index.html
style.css
app.js
robots.txt
sitemap.xml
404.html
favicon.svg
README.txt

APPLY FLOW
1. Job seeker clicks Apply Now.
2. Candidate details form opens immediately.
3. Candidate enters name, mobile, email, qualification and other details.
4. Candidate uploads PDF/DOC/DOCX resume (maximum 5 MB).
5. Submit sends the multipart form through FormSubmit to the HR email stored on that job.

HR FLOW
1. HR creates an account using the email address that should receive applications.
2. HR logs in.
3. HR posts a vacancy.
4. The job automatically stores the logged-in HR email.
5. Apply Now uses that exact stored HR email as the FormSubmit destination.

IMPORTANT
This is a static GitHub Pages implementation. HR accounts and posted jobs are stored in browser localStorage, so they are not shared between different devices/browsers. For a production multi-HR system, use a real backend/database (for example Supabase) and server-side email delivery. Do not put a Supabase service-role key in GitHub.

SEO
index.html includes title, description, keywords, robots, canonical, Open Graph and WebSite structured data. robots.txt and sitemap.xml point to the GitHub Pages URL.

DEPLOYMENT
Keep all 8 files in the repository root. GitHub Pages: main branch, /(root).
