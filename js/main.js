// main.js
import TOWN_GUNS from './town_guns_with_categories.js';

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const contentArea = document.getElementById('page-content');
const hamburger = document.getElementById('hamburger');

let currentCategory = '';
let currentPage = 1;
const itemsPerPage = 6;

// map friendly nav values -> actual category strings found in TOWN_GUNS
const categoryAliases = {
  assault: 'assault_rifle',
  smg: 'smg',
  dmr: 'dmr',
  sniper: 'sniper',
  lmg: 'lmg',
  shotgun: 'shotgun',
  pistol: 'pistol',
  revolver: 'revolver',
  machinepistol: 'machinepistol',
  misc: 'misc'
};

// --- UI helpers ---
hamburger.addEventListener('click', () => {
  sidebar.classList.toggle('hidden');
  mainContent.classList.toggle('full');
});

function resolveCategoryKey(navValue) {
  if (!navValue) return navValue;
  const lc = navValue.toLowerCase();
  return categoryAliases[lc] ?? lc;
}

function safePair(arr) {
  if (!Array.isArray(arr)) return ['—','—'];
  const a = arr[0] ?? '—';
  const b = arr[1] ?? null;
  return [a, b];
}

function updateHash(category, page) {
  try {
    location.hash = `${encodeURIComponent(category)}:${page}`;
  } catch (e) { /* ignore */ }
}

function readHash() {
  const hash = decodeURIComponent(location.hash.slice(1) || '');
  if (!hash) return null;
  const [cat, page] = hash.split(':');
  return { cat, page: page ? parseInt(page, 10) : 1 };
}

// --- render function ---
function renderCategory(navValue, page = 1, pushHash = true) {
  const catKey = resolveCategoryKey(navValue);

  // collect guns with matching category (case-insensitive)
  const guns = Object.entries(TOWN_GUNS)
    .filter(([name, data]) => {
      if (!data || !data.category) return false;
      return String(data.category).toLowerCase() === String(catKey).toLowerCase();
    });

  if (!guns.length) {
    contentArea.innerHTML = `
      <h1 class="page-title">${navValue}</h1>
      <p class="page-description">No guns found in this category.</p>
    `;
    if (pushHash) updateHash(navValue, 1);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(guns.length / itemsPerPage));
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;
  currentPage = page;

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const gunsToShow = guns.slice(start, end);

  let html = `<h1 class="page-title">${navValue}</h1>`;
  html += `<ul class="feature-list">`;

  for (const [name, stats] of gunsToShow) {
    const [d0, d1] = safePair(stats.damage);
    const [r0, r1] = safePair(stats.range);

    const fireRate = stats.fire_rate ?? '—';
    const accuracy = (stats.accuracy !== undefined) ? stats.accuracy : '—';
    const capacity = (stats.capacity !== undefined) ? stats.capacity : '—';
    const vert = (stats.vert_recoil !== undefined) ? stats.vert_recoil : '—';
    const hor = (stats.hor_recoil !== undefined) ? stats.hor_recoil : '—';
    const head = (stats.head_mult !== undefined) ? stats.head_mult : '—';
    const torso = (stats.torso_mult !== undefined) ? stats.torso_mult : '—';
    const limb = (stats.limb_mult !== undefined) ? stats.limb_mult : '—';
    const reload = (stats.reload !== undefined) ? stats.reload : '—';
    const mode = stats.mode ?? '—';
    const spawn = stats.spawn ?? '';

    html += `
      <li class="feature-item">
        <span class="feature-icon">🔫</span>
        <div class="feature-content">
          <h3>${name} ${spawn ? `<small style="color:#888">(${spawn})</small>` : ''}</h3>
          <p>
            Damage: ${d0}${d1 ? ' - ' + d1 : ''}<br>
            Range: ${r0}${r1 ? ' - ' + r1 : ''}<br>
            Fire Rate: ${fireRate}<br>
            Accuracy: ${accuracy}<br>
            Capacity: ${capacity}<br>
            Recoil: V${vert} H${hor}<br>
            Head Mult: ${head}, Torso: ${torso}, Limb: ${limb}<br>
            Reload: ${reload}<br>
            Mode: ${mode}
          </p>
        </div>
      </li>
    `;
  }

  html += `</ul>`;

  html += `
    <div class="pagination-buttons">
      <button id="prevPage" ${page === 1 ? 'disabled' : ''}>&lt;&lt; previous page</button>
      <div style="align-self:center;color:#999">Page ${page} / ${totalPages}</div>
      <button id="nextPage" ${page === totalPages ? 'disabled' : ''}>next page &gt;&gt;</button>
    </div>
  `;

  contentArea.innerHTML = html;

  document.getElementById('prevPage')?.addEventListener('click', () => {
    renderCategory(navValue, currentPage - 1);
    // keep active nav item in sync
    setActiveNav(navValue);
  });
  document.getElementById('nextPage')?.addEventListener('click', () => {
    renderCategory(navValue, currentPage + 1);
    setActiveNav(navValue);
  });

  contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  if (pushHash) updateHash(navValue, page);
}

// --- helpers to sync nav active state ---
function setActiveNav(navValue) {
  document.querySelectorAll('.nav-item').forEach(nav => {
    nav.classList.toggle('active', nav.getAttribute('data-page') === navValue);
  });
}

// attach sidebar nav click handlers
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const navValue = item.getAttribute('data-page');
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    item.classList.add('active');

    currentCategory = navValue;
    renderCategory(currentCategory, 1);

    // close sidebar on small screens
    if (window.innerWidth < 900) {
      sidebar.classList.add('hidden');
      mainContent.classList.add('full');
    }
  });
});

// keyboard left/right for pagination
window.addEventListener('keydown', (e) => {
  if (!currentCategory) return;
  if (e.key === 'ArrowLeft') renderCategory(currentCategory, currentPage - 1);
  if (e.key === 'ArrowRight') renderCategory(currentCategory, currentPage + 1);
});

// handle back/forward via hash changes
window.addEventListener('hashchange', () => {
  const parsed = readHash();
  if (!parsed) return;
  const cat = parsed.cat || currentCategory;
  const page = parsed.page || 1;
  // try to find matching nav item; if none, render using hash string
  const navItem = Array.from(document.querySelectorAll('.nav-item'))
    .find(n => n.getAttribute('data-page') === cat || resolveCategoryKey(n.getAttribute('data-page')) === cat);
  if (navItem) {
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    navItem.classList.add('active');
    currentCategory = navItem.getAttribute('data-page');
    renderCategory(currentCategory, page, false);
  } else {
    // fallback:
    renderCategory(cat, page, false);
  }
});

// initial rendering: if hash present, use it; otherwise use first active nav item
(function init() {
  const parsed = readHash();
  if (parsed) {
    const cat = parsed.cat;
    const page = parsed.page || 1;
    // attempt to match nav item by nav data-page or alias resolution
    const navItem = Array.from(document.querySelectorAll('.nav-item'))
      .find(n => {
        const dp = n.getAttribute('data-page');
        return dp === cat || resolveCategoryKey(dp) === resolveCategoryKey(cat);
      });
    if (navItem) {
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      navItem.classList.add('active');
      currentCategory = navItem.getAttribute('data-page');
      renderCategory(currentCategory, page, false);
      return;
    } else {
      // render using raw hash category
      renderCategory(cat, page, false);
      return;
    }
  }

  const firstCategory = document.querySelector('.nav-item.active')?.getAttribute('data-page') || document.querySelector('.nav-item')?.getAttribute('data-page');
  currentCategory = firstCategory;
  renderCategory(currentCategory, 1);
})();
