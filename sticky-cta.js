/* ============================================================
   Barre d'action mobile persistante — Help'me Process
   Composant autonome partagé : inclure sur chaque page via
       <script src="/sticky-cta.js" defer></script>
   Affiche en bas d'écran (mobile / tablette uniquement) deux CTA
   toujours visibles pendant le scroll : WhatsApp + Appeler.
   Objectif : capter le décideur en mobilité sans le forcer à
   remonter vers le formulaire. Se cale au-dessus du chatbot
   (#cb-wrap) et du bouton « retour en haut » (#hp-top).
   Sur desktop la barre est masquée (chatbot + Calendly + formulaire
   couvrent déjà le besoin).
   ============================================================ */
(function () {
  "use strict";
  if (document.getElementById("hp-sticky-cta")) return; // anti double-montage

  var WA = "224628935335";       // WhatsApp Business
  var TEL = "+224628935335";     // ligne directe
  var WA_MSG = "Bonjour Help'me Process, je souhaite des informations sur vos services BPO / relation client.";

  var css =
    "#hp-sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:9997;display:none;" +
      "grid-template-columns:1fr 1fr;gap:1px;background:rgba(0,44,110,.12);" +
      "box-shadow:0 -4px 18px rgba(0,0,0,.16);font-family:'Inter',system-ui,sans-serif;" +
      "padding-bottom:env(safe-area-inset-bottom,0)}" +
    "#hp-sticky-cta a{display:flex;align-items:center;justify-content:center;gap:8px;" +
      "padding:15px 8px;font-size:.95rem;font-weight:700;text-decoration:none;letter-spacing:-.01em}" +
    "#hp-sticky-cta .hpc-wa{background:#25D366;color:#fff}" +
    "#hp-sticky-cta .hpc-tel{background:#002C6E;color:#fff}" +
    "#hp-sticky-cta a:active{filter:brightness(.92)}" +
    "#hp-sticky-cta .hpc-ico{font-size:1.15rem;line-height:1}" +
    /* visible mobile/tablette seulement */
    "@media(max-width:768px){" +
      "#hp-sticky-cta{display:grid}" +
      "body{padding-bottom:62px}" +            /* réserve la hauteur de la barre */
      "#cb-wrap{bottom:74px!important}" +       /* chatbot remonte au-dessus */
      "#hp-top{bottom:74px!important}" +        /* retour-en-haut au-dessus */
      "#hp-top.raised{bottom:132px!important}" +/* au-dessus du chatbot si présent */
      ".fab{display:none!important}" +          /* évite le doublon avec le FAB « Appeler » de l'accueil */
    "}" +
    "@media print{#hp-sticky-cta{display:none!important}}";

  function init() {
    if (document.getElementById("hp-sticky-cta")) return;

    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var bar = document.createElement("div");
    bar.id = "hp-sticky-cta";
    bar.setAttribute("role", "navigation");
    bar.setAttribute("aria-label", "Contact rapide");
    bar.innerHTML =
      '<a class="hpc-wa" href="https://wa.me/' + WA + '?text=' + encodeURIComponent(WA_MSG) + '" ' +
        'target="_blank" rel="noopener" aria-label="Nous écrire sur WhatsApp">' +
        '<span class="hpc-ico">💬</span>WhatsApp</a>' +
      '<a class="hpc-tel" href="tel:' + TEL + '" aria-label="Appeler Help\'me Process">' +
        '<span class="hpc-ico">📞</span>Appeler</a>';
    document.body.appendChild(bar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
