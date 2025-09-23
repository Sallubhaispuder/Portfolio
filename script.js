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

  // Click sound (WebAudio) - generated short blip; respects reduced motion/media
  let audioCtx, clickBuffer;
  function initClickSound(){
    if(prefersReduced) return;
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const sampleRate = audioCtx.sampleRate;
      const length = Math.floor(sampleRate * 0.02); // 20ms
      clickBuffer = audioCtx.createBuffer(1, length, sampleRate);
      const data = clickBuffer.getChannelData(0);
      for(let i=0;i<length;i++){
        // quick percussive envelope
        data[i] = (Math.random()*2-1) * Math.exp(-30 * i/length) * 0.25;
      }
    }catch(e){audioCtx = null}
  }
  function playClick(){
    if(!audioCtx) return;
    const s = audioCtx.createBufferSource();
    s.buffer = clickBuffer;
    const g = audioCtx.createGain();
    g.gain.value = 0.8;
    s.connect(g); g.connect(audioCtx.destination);
    s.start();
    setTimeout(()=>{ try{ s.stop() }catch(e){} }, 100);
  }
  // initialize on first user gesture to satisfy autoplay policies
  function resumeAudioOnGesture(){
    if(!audioCtx){ initClickSound(); }
    if(audioCtx && audioCtx.state === 'suspended'){
      audioCtx.resume();
    }
    window.removeEventListener('pointerdown', resumeAudioOnGesture);
  }
  window.addEventListener('pointerdown', resumeAudioOnGesture);

  // attach play to interactive elements
  function attachClickSound(){
    if(prefersReduced) return;
    const interactives = document.querySelectorAll('button, a, .chip');
    interactives.forEach(el=> el.addEventListener('click', ()=>{ try{ if(!audioCtx) initClickSound(); playClick(); }catch(e){} }));
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
