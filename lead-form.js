/* ============================================================
   Formulaire unique adaptatif Help'me Process
   Source unique de vérité pour la capture de leads + livre blanc.

   Utilisation : poser un conteneur dans la page
       <div data-hp-leadform></div>
   puis charger ce script (et lead-form.css).

   Étape 1 : « Vous êtes… » (Guinée/Afrique ou Europe/International)
   Étape 2 : champs adaptés à la cible choisie
   À l'envoi : POST vers /api/lead-magnet (Brevo) + téléchargement
   immédiat du bon livre blanc.

   Préremplir la cible depuis un lien : <a href="#devis" data-hpf-seg="local">
   ============================================================ */
(function () {
  "use strict";

  var DATA = {
    local: {
      pays: ["Guinée", "Côte d'Ivoire", "Sénégal", "Mali", "Burkina Faso", "Bénin", "Togo", "Cameroun", "Gabon", "RD Congo", "Autre"],
      secteur: ["Télécom", "Banque & Microfinance", "Assurance", "E-commerce COD", "Mining & Industrie", "Administration publique", "Autre"],
      besoin: ["Service client / SAV", "Confirmation de commandes COD", "Téléprospection & prise de RDV", "Permanence téléphonique", "Fidélisation & enquêtes", "Back office", "Autre"],
      indicatif: "+224",
      pdf: "/livre-blanc-guinee.pdf",
      showVolume: false
    },
    international: {
      pays: ["France", "Belgique", "Suisse", "Luxembourg", "Canada", "Autre"],
      secteur: ["E-commerce", "SaaS & Tech", "Retail", "Finance & Assurance", "Santé", "Services", "Autre"],
      besoin: ["Externalisation service client francophone", "SAV", "Téléprospection & RDV qualifiés", "Back office", "Étude de faisabilité", "Autre"],
      indicatif: "+33",
      pdf: "/livre-blanc.pdf",
      showVolume: true
    }
  };
  var VOLUME = ["Moins de 10 agents", "10 à 30 agents", "30 à 80 agents", "Plus de 80 agents", "Je ne sais pas encore"];
  var INDICATIFS = [["+224", "🇬🇳 +224"], ["+33", "🇫🇷 +33"], ["+32", "🇧🇪 +32"], ["+41", "🇨🇭 +41"], ["+221", "🇸🇳 +221"], ["+225", "🇨🇮 +225"], ["+1", "🇨🇦 +1"], ["", "Autre"]];
  var WA_NUMBER = "224628935335";

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function opts(list, ph) {
    var h = '<option value="">' + esc(ph) + "</option>";
    for (var i = 0; i < list.length; i++) h += "<option>" + esc(list[i]) + "</option>";
    return h;
  }
  function indicatifOpts() {
    return INDICATIFS.map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[1]) + "</option>"; }).join("");
  }

  function template(title, note) {
    return '' +
      '<div class="hpf">' +
        '<div class="hpf-head"><h3>' + esc(title) + '</h3><p class="hpf-note">' + esc(note) + '</p></div>' +

        '<form class="hpf-form" novalidate>' +
          '<div class="hpf-progress" data-progress>' +
            '<span class="hpf-dot on"></span><span class="hpf-dot"></span>' +
            '<small data-steplbl>Étape 1 / 2 — Votre profil</small>' +
          '</div>' +

          // Étape 1
          '<div class="hpf-step1">' +
            '<p class="hpf-q">Vous êtes… *</p>' +
            '<div class="hpf-choices">' +
              '<label class="hpf-choice" data-choice="local"><input type="radio" name="segment" value="local"><span class="hpf-choice-flag">🇬🇳</span><span class="hpf-choice-txt">Une entreprise en Guinée ou en Afrique</span></label>' +
              '<label class="hpf-choice" data-choice="international"><input type="radio" name="segment" value="international"><span class="hpf-choice-flag">🌍</span><span class="hpf-choice-txt">Une entreprise en Europe ou à l\'international</span></label>' +
            '</div>' +
          '</div>' +

          // Étape 2
          '<div class="hpf-step2" hidden>' +
            '<div class="hpf-fg"><label>Nom de l\'entreprise *</label><input type="text" name="company" autocomplete="organization" placeholder="Nom de votre entreprise"></div>' +
            '<div class="hpf-row">' +
              '<div class="hpf-fg"><label>Pays *</label><select name="pays" data-pays></select></div>' +
              '<div class="hpf-fg"><label>Secteur d\'activité *</label><select name="secteur" data-secteur></select></div>' +
            '</div>' +
            '<div class="hpf-fg"><label>Besoin principal *</label><select name="besoin" data-besoin></select></div>' +
            '<div class="hpf-fg" data-volwrap hidden><label>Volume estimé</label><select name="volume" data-volume>' + opts(VOLUME, "Sélectionnez (optionnel)") + '</select></div>' +
            '<div class="hpf-row">' +
              '<div class="hpf-fg"><label>Prénom *</label><input type="text" name="prenom" autocomplete="given-name" placeholder="Votre prénom"></div>' +
              '<div class="hpf-fg"><label>Nom *</label><input type="text" name="nom" autocomplete="family-name" placeholder="Votre nom"></div>' +
            '</div>' +
            '<div class="hpf-fg"><label>Email professionnel *</label><input type="email" name="email" autocomplete="email" placeholder="vous@entreprise.com"></div>' +
            '<div class="hpf-fg"><label>Téléphone / WhatsApp</label><div class="hpf-tel"><select name="indicatif" data-indicatif>' + indicatifOpts() + '</select><input type="tel" name="telephone" autocomplete="tel" placeholder="6XX XX XX XX"></div></div>' +
            '<div class="hpf-fg"><label>Votre besoin (précisions)</label><textarea name="message" placeholder="Volume d\'appels, horaires, langues, deadline…"></textarea></div>' +
            '<input type="text" name="_hp" class="hpf-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
            '<button type="submit" class="hpf-submit">Envoyer ma demande →</button>' +
            '<p class="hpf-rgpd">🔒 RGPD · Réponse sous 24h · Pas de spam · Désinscription à tout moment.</p>' +
            '<div class="hpf-msg err" data-error hidden></div>' +
          '</div>' +

          // Succès + livre blanc
          '<div class="hpf-success" data-success hidden>' +
            '<div class="hpf-success-ico">✅</div>' +
            '<h4>Demande envoyée !</h4>' +
            '<p>Merci, notre équipe vous recontacte sous 24h ouvrées.</p>' +
            '<div class="hpf-wp">' +
              '<p>📕 En attendant, téléchargez votre livre blanc :</p>' +
              '<a class="hpf-wp-btn" data-wp href="#" target="_blank" rel="noopener">📥 Télécharger le livre blanc (PDF)</a>' +
            '</div>' +
            '<p class="hpf-alt">Une question urgente ? <a data-wa href="#" target="_blank" rel="noopener">💬 Écrivez-nous sur WhatsApp</a></p>' +
          '</div>' +
        '</form>' +

        '<div class="hpf-secondary">' +
          '<span>Ou contactez-nous directement :</span>' +
          '<a class="hpf-wa" data-wa href="#" target="_blank" rel="noopener">💬 WhatsApp</a>' +
          '<a href="tel:+224628935335">📞 +224 628 93 53 35</a>' +
        '</div>' +
      '</div>';
  }

  function waLink(seg) {
    var msg = seg === "international"
      ? "Bonjour Help'me Process, je représente une entreprise en Europe / à l'international et je souhaite externaliser ma relation client."
      : "Bonjour Help'me Process, je dirige une entreprise en Guinée ou en Afrique et je souhaite discuter d'un projet de relation client.";
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
  }

  function build(container) {
    var title = container.getAttribute("data-title") || "Parlons de votre projet";
    var note = container.getAttribute("data-note") || "Un seul formulaire : indiquez votre profil, on s'occupe du reste. Réponse sous 24h.";
    container.innerHTML = template(title, note);

    var root = container.querySelector(".hpf");
    var form = root.querySelector(".hpf-form");
    var step2 = root.querySelector(".hpf-step2");
    var choices = root.querySelectorAll(".hpf-choice");
    var selPays = root.querySelector("[data-pays]");
    var selSecteur = root.querySelector("[data-secteur]");
    var selBesoin = root.querySelector("[data-besoin]");
    var volWrap = root.querySelector("[data-volwrap]");
    var selIndic = root.querySelector("[data-indicatif]");
    var errBox = root.querySelector("[data-error]");
    var successBox = root.querySelector("[data-success]");
    var stepLbl = root.querySelector("[data-steplbl]");
    var dots = root.querySelectorAll(".hpf-dot");
    var current = null;

    // liens WhatsApp (mis à jour selon le segment)
    function refreshWa() {
      root.querySelectorAll("[data-wa]").forEach(function (a) { a.href = waLink(current); });
    }
    refreshWa();

    function selectSegment(seg) {
      if (!DATA[seg]) return;
      current = seg;
      var d = DATA[seg];
      choices.forEach(function (c) {
        var on = c.getAttribute("data-choice") === seg;
        c.classList.toggle("sel", on);
        var input = c.querySelector("input");
        if (input) input.checked = on;
      });
      selPays.innerHTML = opts(d.pays, "Sélectionnez votre pays");
      selSecteur.innerHTML = opts(d.secteur, "Sélectionnez un secteur");
      selBesoin.innerHTML = opts(d.besoin, "Sélectionnez votre besoin");
      if (d.pays.length === 1) selPays.value = d.pays[0];
      volWrap.hidden = !d.showVolume;
      selIndic.value = d.indicatif;
      step2.hidden = false;
      dots.forEach(function (dot) { dot.classList.add("on"); });
      stepLbl.textContent = "Étape 2 / 2 — Votre besoin";
      refreshWa();
    }

    choices.forEach(function (c) {
      c.addEventListener("click", function () { selectSegment(c.getAttribute("data-choice")); });
    });

    function fieldErr(name, on) {
      var el = form.querySelector('[name="' + name + '"]');
      if (el) el.classList.toggle("hpf-err-field", !!on);
      return el;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      errBox.hidden = true;
      ["company", "pays", "secteur", "besoin", "prenom", "nom", "email"].forEach(function (n) { fieldErr(n, false); });

      if (form._hp && form._hp.value) { return; } // honeypot : bot silencieux

      if (!current) { showError("Merci de choisir votre profil ci-dessus."); return; }

      var v = function (n) { var el = form.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ""; };
      var required = [["company", "le nom de votre entreprise"], ["pays", "votre pays"], ["secteur", "votre secteur"], ["besoin", "votre besoin principal"], ["prenom", "votre prénom"], ["nom", "votre nom"]];
      var missing = null;
      for (var i = 0; i < required.length; i++) { if (!v(required[i][0])) { missing = required[i]; fieldErr(required[i][0], true); break; } }
      if (missing) { showError("Merci de renseigner " + missing[1] + "."); fieldErr(missing[0]).focus(); return; }

      var email = v("email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fieldErr("email", true); showError("Merci d'indiquer un email valide."); fieldErr("email").focus(); return; }

      var indic = v("indicatif"), tel = v("telephone");
      var payload = {
        segment: current,
        prenom: v("prenom"),
        nom: v("nom"),
        email: email,
        company: v("company"),
        telephone: tel ? (indic ? indic + " " + tel : tel) : "",
        pays: v("pays"),
        secteur: v("secteur"),
        besoin: v("besoin"),
        volume: v("volume"),
        message: v("message")
      };

      var btn = form.querySelector(".hpf-submit");
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "⏳ Envoi…";

      fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r;
      }).then(function () {
        var wp = root.querySelector("[data-wp]");
        if (wp) wp.href = DATA[current].pdf;
        form.querySelector(".hpf-step1").hidden = true;
        root.querySelector(".hpf-progress").hidden = true;
        step2.hidden = true;
        successBox.hidden = false;
        try { root.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
        try {
          if (window.gtag) window.gtag("event", "generate_lead", { segment: current });
        } catch (e) {}
      }).catch(function (err) {
        if (window.console) console.error("lead-form", err);
        btn.disabled = false; btn.textContent = label;
        showError('Une erreur est survenue. Réessayez ou écrivez-nous sur <a href="' + waLink(current) + '" target="_blank" rel="noopener">WhatsApp</a>.');
      });
    });

    function showError(html) { errBox.innerHTML = html; errBox.hidden = false; }

    return { selectSegment: selectSegment, root: root };
  }

  function init() {
    var containers = document.querySelectorAll("[data-hp-leadform]");
    if (!containers.length) return;
    var instances = [];
    containers.forEach(function (c) {
      if (c.getAttribute("data-hpf-mounted")) return;
      c.setAttribute("data-hpf-mounted", "1");
      instances.push(build(c));
    });

    // Liens de préremplissage : <a href="#devis" data-hpf-seg="local|international">
    function applySeg(seg) {
      if (!DATA[seg] || !instances.length) return;
      instances.forEach(function (inst) { inst.selectSegment(seg); });
    }
    document.querySelectorAll("[data-hpf-seg]").forEach(function (a) {
      a.addEventListener("click", function () {
        var seg = a.getAttribute("data-hpf-seg");
        // laisse l'ancre faire le scroll, on présélectionne juste
        setTimeout(function () { applySeg(seg); }, 60);
      });
    });
    // Présélection via hash (utile pour les liens entre pages) :
    // index.html#devis-local / index.html#devis-international
    var h = (location.hash || "").toLowerCase();
    var seg = h.indexOf("international") !== -1 ? "international"
            : (h.indexOf("local") !== -1 || h.indexOf("guinee") !== -1) ? "local" : null;
    if (seg) {
      applySeg(seg);
      // l'ancre #devis-xxx ne correspond à aucun id natif : on scrolle nous-mêmes
      setTimeout(function () {
        try { instances[0].root.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
      }, 120);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
