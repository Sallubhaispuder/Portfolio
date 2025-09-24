// Minimal progressive JS: theme toggle, mobile menu focus trap, copy-to-clipboard, form validation, project filters, scroll reveals
(function(){
  const doc = document.documentElement;
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-menu-close');
  const copyBtns = document.querySelectorAll('#copy-email, #copy-email-2');
  const copyDiscordBtn = document.getElementById('copy-discord');
  const mailLink = document.getElementById('mail-link');
  const yearEl = document.getElementById('year');
  const filters = document.querySelectorAll('.filters .chip');
  const projectCards = document.querySelectorAll('.project-card');
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // set year
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle removed — force light theme only
  doc.setAttribute('data-theme','light');

  // Background music: load and control playback via header toggle
  const musicToggle = document.getElementById('music-toggle');
  let bgMusic;
  function initBackgroundMusic(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    try{
  bgMusic = new Audio('assets/bg-music.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.18; // low background volume
      bgMusic.preload = 'auto';
    }catch(e){ bgMusic = null }
  }

  function playBackground(){ if(bgMusic) bgMusic.play().catch(()=>{}); }
  function pauseBackground(){ if(bgMusic) bgMusic.pause(); }

  // persist user preference
  function setMusicState(enabled){
    try{ localStorage.setItem('bg-music', enabled? '1' : '0'); }catch(e){}
    if(musicToggle) musicToggle.setAttribute('aria-pressed', enabled? 'true' : 'false');
  }

  // initialize on first gesture to satisfy autoplay policies
  function resumeMediaOnGesture(){
    if(!bgMusic) initBackgroundMusic();
    const pref = (()=>{ try{ return localStorage.getItem('bg-music'); }catch(e){} })();
    const enabled = pref === null || pref === '1'; // default: enabled
    if(enabled && bgMusic){ playBackground(); }
    // ensure the toggle UI reflects stored preference
    try{ setMusicState(!!enabled); }catch(e){}
    window.removeEventListener('pointerdown', resumeMediaOnGesture);
  }
  window.addEventListener('pointerdown', resumeMediaOnGesture);

  // On load, reflect persisted music preference in the toggle UI (don't autoplay here)
  try{
    const stored = localStorage.getItem('bg-music');
    if(musicToggle){
      if(stored === '0') musicToggle.setAttribute('aria-pressed','false');
      else musicToggle.setAttribute('aria-pressed','true');
    }
  }catch(e){}

  if(musicToggle){
    musicToggle.addEventListener('click', ()=>{
      if(!bgMusic) initBackgroundMusic();
      if(!bgMusic) return;
      if(bgMusic.paused){ playBackground(); setMusicState(true); }
      else { pauseBackground(); setMusicState(false); }
    });
  }

  // Mobile menu: simple focus trap
  function openMobile(){
    mobileMenu.setAttribute('aria-hidden','false');
    mobileToggle.setAttribute('aria-expanded','true');
    const focusables = mobileMenu.querySelectorAll('a,button');
    const first = focusables[0];
    first && first.focus();
    document.body.style.overflow = 'hidden';
    trapFocus(mobileMenu);
  }
  function closeMobile(){
    mobileMenu.setAttribute('aria-hidden','true');
    mobileToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
    mobileToggle && mobileToggle.focus();
  }
  mobileToggle && mobileToggle.addEventListener('click', openMobile);
  mobileClose && mobileClose.addEventListener('click', closeMobile);
  mobileMenu && mobileMenu.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeMobile(); });

  function trapFocus(container){
    const focusables = Array.from(container.querySelectorAll('a,button,input,textarea,[tabindex]:not([tabindex="-1"])'))
      .filter(n=>!n.hasAttribute('disabled'));
    if(!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length-1];
    container.addEventListener('keydown', function(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    });
  }

  // copy to clipboard
  async function copyText(text, el){
    try{
      await navigator.clipboard.writeText(text);
      announce(`${text} copied to clipboard`, el);
    }catch(e){
      announce('Unable to copy to clipboard');
    }
  }
  function announce(msg, el){
    const s = document.createElement('div');
    s.className = 'visually-hidden';
    s.setAttribute('role','status');
    s.textContent = msg;
    document.body.appendChild(s);
    setTimeout(()=>document.body.removeChild(s),2000);
  }
  copyBtns && copyBtns.forEach && copyBtns.forEach(btn=> btn.addEventListener('click', ()=> copyText('jharshit189@gmail.com', btn)));
  mailLink && mailLink.addEventListener('click', (e)=>{ e.preventDefault(); copyText('jharshit189@gmail.com', mailLink);} );
  copyDiscordBtn && copyDiscordBtn.addEventListener('click', ()=> copyText('1105512233166962900', copyDiscordBtn));

  // Click sound: use provided MP3 and play for interactive elements
  let clickAudio;
  function initClickAudio(){
    if(prefersReduced) return;
    try{
      clickAudio = new Audio('assets/ui-mouse-click-366460.mp3');
      clickAudio.preload = 'auto';
      // ensure small volume
      clickAudio.volume = 0.7;
    }catch(e){ clickAudio = null }
  }
  // initialize on first user gesture for autoplay policies
  function resumeAudioOnGesture(){
    if(prefersReduced) return;
    if(!clickAudio) initClickAudio();
    // HTMLAudioElement doesn't require resume, but keep handler for consistency
    window.removeEventListener('pointerdown', resumeAudioOnGesture);
  }
  window.addEventListener('pointerdown', resumeAudioOnGesture);

  function playClick(){
    try{
      if(!clickAudio) initClickAudio();
      if(!clickAudio) return;
      // clone to allow overlapping clicks
      const a = clickAudio.cloneNode();
      a.volume = clickAudio.volume;
      a.play().catch(()=>{});
    }catch(e){}
  }
  // attach play to interactive elements
  function attachClickSound(){
    if(prefersReduced) return;
    const interactives = document.querySelectorAll('button, a, .chip');
    interactives.forEach(el=> el.addEventListener('click', ()=>{ try{ playClick(); }catch(e){} }));
  }
  attachClickSound();

  // Project filters
  filters.forEach(f => {
    f.addEventListener('click', () => {
      filters.forEach(x=>{ x.classList.remove('active'); x.setAttribute('aria-pressed','false');});
      f.classList.add('active'); f.setAttribute('aria-pressed','true');
      const filter = f.getAttribute('data-filter');
      projectCards.forEach(card=>{
        const status = card.getAttribute('data-status') || 'active';
        if(filter === 'all' || status === filter) card.style.display = '';
        else card.style.display = 'none';
      });
    });
  });

  // Scroll-spy: highlight nav links when sections enter view
  (function scrollSpy(){
    const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
    const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if(!sections.length) return;
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(ent => {
        const id = ent.target.id;
        const link = document.querySelector('.site-nav a[href="#'+id+'"]');
        if(!link) return;
        if(ent.isIntersecting && ent.intersectionRatio > 0.45){
          navLinks.forEach(n=>n.classList.remove('active'));
          link.classList.add('active');
        }
      });
    },{root:null,threshold:[0.45]});
    sections.forEach(s=>obs.observe(s));
  })();

  // Form validation (client-only placeholder for serverless POST)
  form && form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!form.checkValidity()){
      formStatus.textContent = 'Please complete required fields and provide a valid email.';
      formStatus.classList.add('error');
      return;
    }
    // simulate submission
    formStatus.textContent = 'Sending…';
    setTimeout(()=>{
      formStatus.textContent = 'Thanks — I will get back to you within a few days.';
      form.reset();
    }, 900);
  });

  // Scroll reveals
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){ e.target.classList.add('reveal'); obs.unobserve(e.target); }
      });
    }, {threshold: 0.12});
    document.querySelectorAll('.card, .project-card, .role-card').forEach(el=>{ el.classList.add('will-reveal'); obs.observe(el); });
  }

})();
