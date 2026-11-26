/* Private Job Alert - Google Analytics 4 */
(function () {
  "use strict";
  var measurementId = "G-8T5PNNFR89";
  if (window.__PJA_GA4_INITIALIZED) return;
  window.__PJA_GA4_INITIALIZED = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
  document.head.appendChild(tag);

  // Track Apply Now interactions without collecting form values or personal information.
  document.addEventListener("click", function (event) {
    var el = event.target && event.target.closest ? event.target.closest("a,button,[role='button']") : null;
    if (!el || typeof window.gtag !== "function") return;
    var label = (el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80);
    var href = el.getAttribute("href") || "";
    if (/apply\s*now|apply\s*for\s*(this\s*)?job/i.test(label) || /apply\.html/i.test(href)) {
      window.gtag("event", "apply_now_click", {
        page_location: window.location.href,
        button_text: label || "Apply Now"
      });
    }
  }, true);
})();