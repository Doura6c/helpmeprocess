/* ============================================================
   Bouton « Retour en haut » — Help'me Process
   Composant autonome partagé : à inclure sur toutes les pages via
       <script src="/back-to-top.js" defer></script>
   Apparaît en fondu après 300px de scroll, remonte en douceur.
   Se décale au-dessus du chatbot / bouton WhatsApp s'ils existent.
   ============================================================ */
(function () {
  "use strict";
  if (document.getElementById("hp-top")) return;

  var css =
    "#hp-top{position:fixed;right:24px;bottom:24px;z-index:9998;width:48px;height:48px;" +
    "border:none;border-radius:50%;background:#E85D20;color:#fff;font-size:1.45rem;line-height:1;" +
    "cursor:pointer;display:flex;align-items:center;justify-content:center;" +
    "box-shadow:0 6px 20px rgba(232,93,32,.45);opacity:0;visibility:hidden;transform:translateY(14px);" +
    "transition:opacity .3s ease,transform .3s ease,visibility .3s ease,background .2s ease;font-family:'Inter',system-ui,sans-serif}" +
    "#hp-top.show{opacity:1;visibility:visible;transform:none}" +
    "#hp-top:hover{background:#FF6D35;transform:translateY(-3px);box-shadow:0 10px 26px rgba(232,93,32,.5)}" +
    "#hp-top.raised{bottom:96px}" +
    "@media(max-width:600px){#hp-top{right:16px;bottom:16px;width:44px;height:44px;font-size:1.3rem}#hp-top.raised{bottom:86px}}" +
    "@media print{#hp-top{display:none!important}}";

  function init() {
    if (document.getElementById("hp-top")) return;
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var btn = document.createElement("button");
    btn.id = "hp-top";
    btn.type = "button";
    btn.setAttribute("aria-label", "Remonter en haut de la page");
    btn.innerHTML = "&#8593;"; // ↑
    document.body.appendChild(btn);

    // Évite le chevauchement avec le chatbot (#cb-wrap) ou le bouton WhatsApp (.wa-float)
    function checkRaise() {
      if (document.getElementById("cb-wrap") || document.querySelector(".wa-float")) {
        btn.classList.add("raised");
      }
    }
    checkRaise();
    setTimeout(checkRaise, 800); // le chatbot se monte parfois après

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 300) btn.classList.add("show");
      else btn.classList.remove("show");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
