/* ════════════════════════════════════════
   Help'me Process — Chatbot Widget
   ════════════════════════════════════════ */
(function(){
  const BOT_NAME = "Assistante Help'me";
  const BOT_AVATAR = "🎧";

  const FAQ = [
    {
      keys:["bonjour","salut","bonsoir","hello","bj","slt"],
      answer:"Bonjour ! Je suis l'assistante virtuelle de <strong>Help'me Process</strong>. Comment puis-je vous aider aujourd'hui ? 😊"
    },
    {
      keys:["service","offre","solution","proposez","faites"],
      answer:"Nous proposons 3 pôles de services :<br>🔵 <strong>Inbound</strong> — accueil client, SAV, assistance<br>🟠 <strong>Outbound</strong> — prospection, télévente, enquêtes<br>🟢 <strong>Back Office</strong> — traitement de données, gestion administrative<br><br>Pour un devis gratuit, contactez-nous !"
    },
    {
      keys:["prix","tarif","devis","coût","combien"],
      answer:"Nos tarifs sont personnalisés selon votre volume et vos besoins. Contactez-nous pour un <strong>devis gratuit sous 24h</strong> :<br>📧 contact@helpmeprocess.com<br>📱 +224 620 00 00 00"
    },
    {
      keys:["localisation","adresse","où","conakry","guinee","guinée","situé"],
      answer:"Nous sommes basés à <strong>Conakry, Guinée</strong>. Notre centre d'appels opère 6 jours sur 7 pour les marchés national et international. 📍"
    },
    {
      keys:["contact","appeler","joindre","email","mail","téléphone","telephone"],
      answer:"Voici nos contacts :<br>📧 <strong>contact@helpmeprocess.com</strong><br>📱 <strong>+224 620 00 00 00</strong><br>🕐 Lun–Sam, 8h–20h<br><br>Ou remplissez notre <a href='index.html#contact' style='color:var(--orange)'>formulaire de contact</a>."
    },
    {
      keys:["emploi","job","recrutement","recrute","postuler","travail","poste"],
      answer:"Nous recrutons actuellement ! 🚀<br>Consultez nos offres d'emploi :<br><a href='recrutement.html' style='color:var(--orange)'>→ Voir les postes ouverts</a><br><br>Postes disponibles : Téléconseiller, Agent Outbound, Superviseur, Back Office."
    },
    {
      keys:["actualité","actualite","news","article","blog","info"],
      answer:"Retrouvez nos dernières actualités, distinctions et articles du secteur :<br><a href='actualites.html' style='color:var(--orange)'>→ Voir toutes les actualités</a>"
    },
    {
      keys:["award","prix","récompense","recompense","distinction","meilleur","élu"],
      answer:"🏆 Help'me Process a été <strong>élu Meilleur Service Client de l'Année 2023</strong> ! Une fierté pour notre équipe et une reconnaissance de notre engagement qualité."
    },
    {
      keys:["fondateur","directeur","ceo","cissé","cisse","abdourahamane"],
      answer:"Help'me Process a été co-fondé par <strong>Abdourahamane Cissé</strong>, expert en externalisation et gestion de la relation client, avec plus de 10 ans d'expérience dans le secteur BPO en Afrique et en Europe."
    },
    {
      keys:["client","espace","connexion","connecter","compte","dashboard"],
      answer:"Vous êtes client Help'me Process ? Accédez à votre espace personnel :<br><a href='espace-client.html' style='color:var(--orange)'>→ Se connecter à mon espace</a>"
    },
    {
      keys:["merci","super","parfait","excellent","bravo","bonne","top"],
      answer:"Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions. Notre équipe reste disponible au <strong>+224 620 00 00 00</strong>."
    },
    {
      keys:["langue","francais","anglais","arabe","multilangue"],
      answer:"Nos agents opèrent principalement en <strong>français</strong>. Nous développons actuellement des capacités en anglais et en langues locales guinéennes (pular, malinké, soussou)."
    },
    {
      keys:["chômage","chomage","emploi","jeune","afrique","impact","social"],
      answer:"Le secteur BPO est un levier majeur contre le chômage en Afrique. Lisez notre article sur ce sujet :<br><a href='actualites.html' style='color:var(--orange)'>→ Comment les call centers transforment l'emploi en Afrique</a>"
    }
  ];

  const FALLBACK = [
    "Je n'ai pas bien compris votre question. Pouvez-vous reformuler ? Vous pouvez aussi nous contacter directement au <strong>+224 620 00 00 00</strong>.",
    "Cette question dépasse mes capacités 😅 Notre équipe humaine sera plus précise ! Contactez-nous : <strong>contact@helpmeprocess.com</strong>",
    "Je ne suis pas sûre de pouvoir répondre à cela. Essayez avec des mots comme : <em>services, prix, contact, emploi, localisation...</em>"
  ];

  function getAnswer(msg){
    const m = msg.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
    for(const f of FAQ){
      if(f.keys.some(k=>m.includes(k))) return f.answer;
    }
    return FALLBACK[Math.floor(Math.random()*FALLBACK.length)];
  }

  // ── Build HTML ──
  const css = `
    :root{--cb-navy:#002C6E;--cb-orange:#E85D20;--cb-light:#F5F7FA}
    #cb-wrap{position:fixed;bottom:28px;right:28px;z-index:9999;font-family:'Inter',sans-serif}
    #cb-bubble{
      width:60px;height:60px;border-radius:50%;
      background:linear-gradient(135deg,var(--cb-navy),#003A8C);
      display:flex;align-items:center;justify-content:center;
      cursor:pointer;box-shadow:0 4px 20px rgba(0,44,110,.4);
      font-size:1.5rem;transition:transform .2s,box-shadow .2s;
      position:relative;
    }
    #cb-bubble:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,44,110,.5)}
    #cb-notif{
      position:absolute;top:-4px;right:-4px;
      width:18px;height:18px;background:var(--cb-orange);
      border-radius:50%;border:2px solid #fff;
      font-size:.62rem;font-weight:700;color:#fff;
      display:flex;align-items:center;justify-content:center;
    }
    #cb-box{
      position:absolute;bottom:72px;right:0;
      width:340px;background:#fff;
      border-radius:20px;box-shadow:0 12px 48px rgba(0,0,0,.18);
      overflow:hidden;display:none;flex-direction:column;
      max-height:520px;
    }
    #cb-box.open{display:flex}
    #cb-head{
      background:linear-gradient(135deg,var(--cb-navy),#003A8C);
      padding:16px 20px;display:flex;align-items:center;gap:12px;
    }
    #cb-head-ava{
      width:40px;height:40px;border-radius:50%;
      background:rgba(255,255,255,.15);
      display:flex;align-items:center;justify-content:center;font-size:1.2rem;
    }
    #cb-head-info strong{display:block;color:#fff;font-size:.95rem}
    #cb-head-info span{color:rgba(255,255,255,.7);font-size:.78rem;display:flex;align-items:center;gap:5px}
    .cb-dot{width:7px;height:7px;background:#4ade80;border-radius:50%;animation:cbpulse 2s infinite}
    @keyframes cbpulse{0%,100%{opacity:1}50%{opacity:.4}}
    #cb-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.7);font-size:1.2rem;cursor:pointer;padding:4px}
    #cb-msgs{
      flex:1;overflow-y:auto;padding:16px;
      display:flex;flex-direction:column;gap:12px;
      scroll-behavior:smooth;
    }
    #cb-msgs::-webkit-scrollbar{width:4px}
    #cb-msgs::-webkit-scrollbar-thumb{background:var(--cb-light);border-radius:2px}
    .cb-msg{display:flex;gap:8px;max-width:90%}
    .cb-msg.user{align-self:flex-end;flex-direction:row-reverse}
    .cb-msg-ava{
      width:30px;height:30px;border-radius:50%;flex-shrink:0;
      background:linear-gradient(135deg,var(--cb-navy),#003A8C);
      display:flex;align-items:center;justify-content:center;font-size:.85rem;
      align-self:flex-end;
    }
    .cb-msg-txt{
      padding:10px 14px;border-radius:14px;font-size:.85rem;line-height:1.6;
    }
    .cb-msg.bot .cb-msg-txt{background:var(--cb-light);color:#1F2937;border-bottom-left-radius:4px}
    .cb-msg.user .cb-msg-txt{background:var(--cb-navy);color:#fff;border-bottom-right-radius:4px}
    .cb-msg.user .cb-msg-ava{background:var(--cb-orange)}
    .cb-typing{display:flex;gap:5px;padding:10px 14px;background:var(--cb-light);border-radius:14px;border-bottom-left-radius:4px;width:fit-content}
    .cb-typing span{width:7px;height:7px;background:#9CA3AF;border-radius:50%;animation:cbtype .9s infinite}
    .cb-typing span:nth-child(2){animation-delay:.15s}
    .cb-typing span:nth-child(3){animation-delay:.3s}
    @keyframes cbtype{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
    #cb-suggestions{padding:0 16px 12px;display:flex;flex-wrap:wrap;gap:6px}
    .cb-sug{
      font-size:.75rem;padding:5px 12px;border-radius:50px;
      background:var(--cb-light);border:1px solid #E5E7EB;
      cursor:pointer;color:#374151;font-family:'Inter',sans-serif;
      transition:all .2s;
    }
    .cb-sug:hover{background:var(--cb-navy);color:#fff;border-color:var(--cb-navy)}
    #cb-form{
      padding:12px 16px;border-top:1px solid #E5E7EB;
      display:flex;gap:8px;align-items:center;
    }
    #cb-input{
      flex:1;padding:10px 14px;border-radius:50px;
      border:1.5px solid #E5E7EB;font-family:'Inter',sans-serif;
      font-size:.85rem;outline:none;transition:border-color .2s;
    }
    #cb-input:focus{border-color:var(--cb-navy)}
    #cb-send{
      width:38px;height:38px;border-radius:50%;
      background:var(--cb-orange);border:none;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
      font-size:.9rem;transition:all .2s;flex-shrink:0;
    }
    #cb-send:hover{background:#FF6D35;transform:scale(1.05)}
    @media(max-width:480px){
      #cb-box{width:calc(100vw - 40px);right:-8px}
      #cb-wrap{bottom:20px;right:20px}
    }
  `;

  const suggestions = ["Vos services","Tarifs & devis","Nous rejoindre","Nous contacter","Espace client"];

  const html = `
    <style>${css}</style>
    <div id="cb-wrap">
      <div id="cb-box">
        <div id="cb-head">
          <div id="cb-head-ava">${BOT_AVATAR}</div>
          <div id="cb-head-info">
            <strong>${BOT_NAME}</strong>
            <span><span class="cb-dot"></span> En ligne</span>
          </div>
          <button id="cb-close">✕</button>
        </div>
        <div id="cb-msgs"></div>
        <div id="cb-suggestions"></div>
        <div id="cb-form">
          <input id="cb-input" type="text" placeholder="Posez votre question…" autocomplete="off"/>
          <button id="cb-send">➤</button>
        </div>
      </div>
      <div id="cb-bubble">
        ${BOT_AVATAR}
        <div id="cb-notif">1</div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);

  const box = document.getElementById('cb-box');
  const bubble = document.getElementById('cb-bubble');
  const msgs = document.getElementById('cb-msgs');
  const input = document.getElementById('cb-input');
  const notif = document.getElementById('cb-notif');
  const sugBox = document.getElementById('cb-suggestions');

  // Suggestions
  suggestions.forEach(s=>{
    const b = document.createElement('button');
    b.className='cb-sug'; b.textContent=s;
    b.onclick=()=>send(s);
    sugBox.appendChild(b);
  });

  function addMsg(txt, who){
    const d = document.createElement('div');
    d.className='cb-msg '+who;
    const ava = document.createElement('div');
    ava.className='cb-msg-ava';
    ava.textContent = who==='bot' ? BOT_AVATAR : '👤';
    const t = document.createElement('div');
    t.className='cb-msg-txt';
    t.innerHTML=txt;
    d.appendChild(ava); d.appendChild(t);
    msgs.appendChild(d);
    msgs.scrollTop=msgs.scrollHeight;
  }

  function showTyping(){
    const d=document.createElement('div');
    d.className='cb-msg bot'; d.id='cb-typing-wrap';
    const ava=document.createElement('div'); ava.className='cb-msg-ava'; ava.textContent=BOT_AVATAR;
    const t=document.createElement('div'); t.className='cb-typing';
    t.innerHTML='<span></span><span></span><span></span>';
    d.appendChild(ava); d.appendChild(t);
    msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
  }

  function removeTyping(){
    const t=document.getElementById('cb-typing-wrap');
    if(t)t.remove();
  }

  function send(txt){
    const m=(txt||input.value).trim();
    if(!m)return;
    input.value='';
    addMsg(m,'user');
    sugBox.style.display='none';
    showTyping();
    setTimeout(()=>{
      removeTyping();
      addMsg(getAnswer(m),'bot');
    }, 800 + Math.random()*400);
  }

  // Open/close
  bubble.addEventListener('click',()=>{
    box.classList.toggle('open');
    notif.style.display='none';
    if(box.classList.contains('open') && msgs.children.length===0){
      setTimeout(()=>{
        addMsg("Bonjour ! 👋 Je suis <strong>"+BOT_NAME+"</strong>, votre assistante virtuelle.<br>Comment puis-je vous aider ?","bot");
      },300);
    }
  });
  document.getElementById('cb-close').addEventListener('click',e=>{
    e.stopPropagation(); box.classList.remove('open');
  });

  document.getElementById('cb-send').addEventListener('click',()=>send());
  input.addEventListener('keypress',e=>{if(e.key==='Enter')send()});

  // Auto-open after 8s on first visit
  if(!sessionStorage.getItem('cb_opened')){
    setTimeout(()=>{
      box.classList.add('open');
      notif.style.display='none';
      sessionStorage.setItem('cb_opened','1');
      setTimeout(()=>{
        addMsg("Bonjour ! 👋 Je suis <strong>"+BOT_NAME+"</strong>, votre assistante virtuelle.<br>Comment puis-je vous aider ?","bot");
      },300);
    },8000);
  }
})();
