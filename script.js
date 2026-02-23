// Thème (persisté dans localStorage)
(function themeSetup(){
  const root = document.documentElement;
  const saved = localStorage.getItem('theme');
  if(saved){ root.setAttribute('data-theme', saved); }
  const toggle = document.querySelector('.theme-toggle');
  toggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', current);
    localStorage.setItem('theme', current);
  });
})();

// Menu mobile
(function mobileMenu(){
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  if(!btn || !menu) return;
  btn.addEventListener('click', () => {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }));
})();

// Défilement doux
(function smoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if(!id || id === '#') return;
      const target = document.querySelector(id);
      if(target){ e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });
})();

// Scrollspy (met en surbrillance le lien actif)
(function scrollSpy(){
  const sections = document.querySelectorAll('main section[id]');
  const menuLinks = new Map();
  document.querySelectorAll('.menu a[href^="#"]').forEach(a => {
    const id = a.getAttribute('href');
    if(id) menuLinks.set(id, a);
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = `#${entry.target.id}`;
      const link = menuLinks.get(id);
      if(!link) return;
      if(entry.isIntersecting) {
        document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    })
  }, { threshold: 0.5 });
  sections.forEach(s => io.observe(s));
})();

// Année dynamique pied de page
document.getElementById('year').textContent = new Date().getFullYear();

// Formulaire contact: ouvre le client mail + toast
(function contactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const toast = document.getElementById('toast');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = fd.get('name');
    const email = fd.get('email');
    const message = fd.get('message');
    const subject = encodeURIComponent(`Nouveau message de ${name}`);
    const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`);
    const to = 'hello@votrenom.dev';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    if(toast){
      toast.textContent = 'Ouverture de votre client mail avec un brouillon prérempli.';
      toast.classList.add('show');
      setTimeout(()=>toast.classList.remove('show'), 3000);
    }
  });
})();

// Aperçus live des projets (lazy‑load iframes)
(function projectPreviews(){
  const items = document.querySelectorAll('.card-media.preview[data-src]');
  if(!items.length) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const el = e.target;
        if(el.dataset.loaded) return;
        const url = el.getAttribute('data-src');
        const iframe = document.createElement('iframe');
        iframe.className = 'preview-frame';
        iframe.src = url;
        iframe.setAttribute('title', 'Aperçu du projet');
        iframe.loading = 'lazy';
        el.appendChild(iframe);
        el.dataset.loaded = 'true';
        io.unobserve(el);
      }
    })
  }, { rootMargin: '100px' });
  items.forEach(el => io.observe(el));
})();