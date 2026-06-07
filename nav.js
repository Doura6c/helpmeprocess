/* ============================================================
   Navbar partagée Help'me Process
   Injecte une navbar identique (desktop + menu mobile) sur toutes
   les pages marketing. Source unique de vérité : éditer ce fichier
   met à jour la navigation de toutes les pages d'un coup.
   ============================================================ */
(function () {
  "use strict";

  // Page courante (ex : "recrutement.html", "" sur la racine)
  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  var onHome = page === "" || page === "index.html" || page === "index";
  var home = onHome ? "" : "index.html"; // préfixe pour les ancres de l'accueil

  // Liens de navigation (source unique)
  var links = [
    { href: home + "#about",      label: "Qui sommes-nous ?" },
    { href: home + "#services",   label: "Nos solutions" },
    { href: home + "#pourquoi",   label: "Nos différences" },
    { href: home + "#fondateur",  label: "Co-fondateur" },
    { href: "actualites.html",                label: "Actualités",   match: "actualites.html" },
    { href: "recrutement.html",               label: "Recrutement",  match: "recrutement.html" },
    { href: "presentation-entreprises.html",  label: "Entreprises",  match: "presentation-entreprises.html" },
    { href: "entreprises-guinee.html",         label: "🇬🇳 Offre Guinée", match: "entreprises-guinee.html" }
  ];

  function isActive(l) { return l.match && page === l.match; }
  function esc(s) { return String(s).replace(/"/g, "&quot;"); }

  var desktopLinks = links.map(function (l) {
    return '<li><a href="' + esc(l.href) + '"' + (isActive(l) ? ' class="active"' : "") + ">" + l.label + "</a></li>";
  }).join("");

  var mobileLinks = links.map(function (l) {
    return '<a href="' + esc(l.href) + '"' + (isActive(l) ? ' class="active"' : "") + ">" + l.label + "</a>";
  }).join("");

  var navHTML =
    '<nav id="hp-nav">' +
      '<div class="hpnav-inner">' +
        '<a href="index.html" class="hpnav-logo">' +
          '<picture><source srcset="logo.webp" type="image/webp">' +
          '<img src="logo.jpeg" alt="Help\'me Process" width="46" height="46"></picture>' +
          '<div class="hpnav-logo-text"><strong>Help\'me Process</strong><span>Call Center · Conakry</span></div>' +
        "</a>" +
        '<ul class="hpnav-links">' + desktopLinks +
          '<li><a href="' + esc(home + "#contact") + '" class="hpnav-cta">Nous contacter</a></li>' +
        "</ul>" +
        '<div class="hpnav-burger" id="hp-burger" aria-label="Menu" role="button" tabindex="0">' +
          "<span></span><span></span><span></span></div>" +
      "</div>" +
    "</nav>";

  var mobHTML =
    '<div id="hp-mobnav">' + mobileLinks +
      '<a href="' + esc(home + "#contact") + '">Nous contacter →</a>' +
    "</div>";

  function init() {
    if (document.getElementById("hp-nav")) return; // évite un double montage
    document.body.insertAdjacentHTML("afterbegin", navHTML + mobHTML);

    var nav = document.getElementById("hp-nav");
    var burger = document.getElementById("hp-burger");
    var mob = document.getElementById("hp-mobnav");

    function toggle() { if (mob) mob.classList.toggle("open"); }
    function close() { if (mob) mob.classList.remove("open"); }

    if (burger) {
      burger.addEventListener("click", toggle);
      burger.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    }
    if (mob) {
      mob.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    }
    window.addEventListener("scroll", function () {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
