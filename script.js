const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('visible'));
}, { threshold: 0.12 });
reveals.forEach((el) => observer.observe(el));

const steps = [...document.querySelectorAll('.step')];
const content = [
  ['01', 'CHOISIS\\nTA BASE.', 'Tacos, roulé, bowl ou burger.'],
  ['02', 'AJOUTE TES\\nVIANDES.', 'Tenders, steak, kebab, cordon bleu et plus.'],
  ['03', 'CHOISIS\\nTA SAUCE.', 'Fromagère, algérienne, barbecue, curry…'],
  ['04', 'FAIS-LE\\nGRATINER.', 'Mozzarella, raclette, chèvre ou Boursin.']
];
steps.forEach((step, index) => step.addEventListener('click', () => {
  steps.forEach((s) => s.classList.remove('active'));
  step.classList.add('active');
  document.querySelector('#step-number').textContent = content[index][0];
  document.querySelector('#step-title').innerHTML = content[index][1].replace('\\n', '<br>');
  document.querySelector('#step-text').textContent = content[index][2];
  const food = document.querySelector('#stack-food');
  food.animate([{ transform: 'scale(.88) rotate(-4deg)', opacity: .45 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 420 });
}));

const franchiseForm = document.querySelector('#franchise-form');
if (franchiseForm) {
  franchiseForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = document.querySelector('#form-status');
    const button = franchiseForm.querySelector('button[type="submit"]');
    const form = new FormData(franchiseForm);
    const data = Object.fromEntries(form.entries());
    status.classList.remove('success');
    status.textContent = 'Envoi de votre candidature en cours…';
    button.disabled = true;

    try {
      const response = await fetch('/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Impossible d’envoyer votre candidature pour le moment.');
      }
      status.textContent = 'Votre candidature a bien été envoyée. Merci !';
      status.classList.add('success');
      franchiseForm.reset();
    } catch (error) {
      status.textContent = error.message || 'Une erreur est survenue. Réessayez plus tard.';
    } finally {
      button.disabled = false;
    }
  });
}

const menuAnchors = [...document.querySelectorAll('.menu-anchor-clean a[href^="#"]')];
const menuSections = menuAnchors
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (menuAnchors.length && menuSections.length) {
  const setActiveMenuAnchor = (id) => {
    menuAnchors.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
    });
  };

  const menuObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) setActiveMenuAnchor(visible.target.id);
  }, { rootMargin: '-25% 0px -60% 0px', threshold: [0.05, 0.2, 0.5] });

  menuSections.forEach((section) => menuObserver.observe(section));
  setActiveMenuAnchor(menuSections[0].id);
}


const siteHeader = document.querySelector('.site-header');
if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 24);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}
