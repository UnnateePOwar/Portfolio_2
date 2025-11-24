/* Advanced site JS: theme, tiny typing, reveal on scroll, filters, form handling, nav behavior */

/* -------------------------
   Helpers
   ------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* -------------------------
   DOM elements
   ------------------------- */
const body = document.body;
const themeToggle = $('#themeToggle');
const topBtn = $('#topBtn');
const yearSpan = $('#year');
const modal = $('#modal');
const modalContent = $('#modalContent');
const modalClose = $('.modal-close');
const projectGrid = $('#projectGrid');
const chips = $$('.filters .chip');
const projectSearch = $('#projectSearch');
const navLinks = $$('#navLinks a');
const menuToggle = $('#menuToggle');
const navLinksContainer = $('#navLinks');

/* -------------------------
   Theme toggle + persist
   ------------------------- */
const THEME_KEY = 'pref-theme';
function setTheme(t){
  body.classList.remove('light','dark');
  body.classList.add(t);
  localStorage.setItem(THEME_KEY, t);
  // update icon
  themeToggle.innerHTML = t === 'dark' ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
}
(function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  setTheme(saved);
})();
themeToggle.addEventListener('click', () => {
  setTheme(body.classList.contains('dark') ? 'light' : 'dark');
});

/* -------------------------
   Tiny typing effect
   ------------------------- */
(function typing(){
  const el = document.getElementById('typed');
  if(!el) return;
  const words = ['Developer.', 'Learner.', 'Problem-solver.'];
  let wI = 0, chI = 0, forward = true;
  function tick(){
    const word = words[wI];
    if(forward){
      chI++;
      if(chI > word.length){ forward = false; setTimeout(tick, 900); return; }
    } else {
      chI--;
      if(chI === 0){ forward = true; wI = (wI+1) % words.length; }
    }
    el.textContent = word.slice(0, chI);
    setTimeout(tick, forward ? 80 : 50);
  }
  tick();
})();

/* -------------------------
   Lazy load images (simple)
   ------------------------- */
function lazyLoadImages(){
  const imgs = $$('.lazy');
  imgs.forEach(img => {
    if(img.dataset.src){
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      img.classList.remove('lazy');
    }
  });
}
window.addEventListener('load', lazyLoadImages);

/* -------------------------
   IntersectionObserver reveal
   ------------------------- */
const reveals = $$('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('show');
      // once visible, unobserve to save cycles
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
reveals.forEach(el => io.observe(el));

/* -------------------------
   Project filtering + search
   ------------------------- */
function filterProjects(filter){
  const items = $$('.project');
  items.forEach(it => {
    const tech = it.dataset.tech || '';
    if(filter === 'all' || tech.toLowerCase().includes(filter.toLowerCase())){
      it.style.display = '';
      // small stagger show
      setTimeout(()=> it.classList.add('show'), 40);
    } else {
      it.style.display = 'none';
    }
  });
}
chips.forEach(chip => {
  chip.addEventListener('click', (e) => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterProjects(chip.dataset.filter);
  });
});
projectSearch.addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  $$('.project').forEach(p => {
    const title = (p.dataset.title || p.querySelector('h3').innerText).toLowerCase();
    p.style.display = title.includes(q) ? '' : 'none';
  });
});

/* -------------------------
   Contact form with client validation
   ------------------------- */
const contactForm = $('#contactForm');
if(contactForm){
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    const statusEl = $('#formStatus');

    if(!name || !email || !message){
      statusEl.textContent = 'Please fill all fields.';
      statusEl.style.color = 'var(--accent)';
      return;
    }
    // simple email check
    if(!/^\S+@\S+\.\S+$/.test(email)){
      statusEl.textContent = 'Please enter a valid email.';
      statusEl.style.color = 'crimson';
      return;
    }

    // Simulate sending — replace with real endpoint later
    statusEl.textContent = 'Sending…';
    setTimeout(() => {
      statusEl.textContent = `Thanks ${name}! Message received. I'll reply to ${email}.`;
      statusEl.style.color = 'green';
      contactForm.reset();
      showModal('Message sent', `Thanks <strong>${name}</strong> — your message was received. I'll reach out to <strong>${email}</strong> soon.`);
    }, 900);
  });
}

/* -------------------------
   Modal helpers
   ------------------------- */
function showModal(title, html){
  modalContent.innerHTML = `<h3>${title}</h3><div>${html}</div>`;
  modal.classList.remove('hidden');
}
modalClose && modalClose.addEventListener('click', () => modal.classList.add('hidden'));
modal.addEventListener('click', (e) => { if(e.target === modal) modal.classList.add('hidden'); });

/* -------------------------
   Nav & scrolling active link
   ------------------------- */
function handleActiveNav(){
  const fromTop = window.scrollY + 120;
  navLinks.forEach(link => {
    const id = link.getAttribute('href')?.replace('#','');
    if(!id) return;
    const section = document.getElementById(id);
    if(section){
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      link.classList.toggle('active', (fromTop >= top && fromTop < bottom));
    }
  });
}
window.addEventListener('scroll', handleActiveNav);
handleActiveNav();

/* Mobile menu toggle */
menuToggle && menuToggle.addEventListener('click', () => navLinksContainer.classList.toggle('open'));

/* Smooth in-page nav (delegated) */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-link]');
  if(a){
    e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  }
});

/* -------------------------
   Year + back to top
   ------------------------- */
yearSpan.textContent = new Date().getFullYear();
window.addEventListener('scroll', () => {
  if(window.scrollY > 420) topBtn.style.display = 'flex'; else topBtn.style.display = 'none';
});
topBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

/* -------------------------
   accessibility: focus outlines for keyboard users
   ------------------------- */
document.addEventListener('keyup', (e) => {
  if(e.key === 'Tab') document.body.classList.add('show-focus');
});
