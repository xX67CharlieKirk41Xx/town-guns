import TOWN_GUNS from './town_guns_with_categories.js';

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const contentArea = document.getElementById('page-content');
const hamburger = document.getElementById('hamburger');

let currentCategory = '';
let currentPage = 1;
const itemsPerPage = 6;

hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    mainContent.classList.toggle('full');
});

function renderCategory(category, page = 1) {
    const guns = Object.entries(TOWN_GUNS)
        .filter(([name, data]) => data.category.toLowerCase() === category.toLowerCase());

    if (!guns.length) {
        contentArea.innerHTML = `<h1 class="page-title">${category}</h1><p>No guns found in this category.</p>`;
        return;
    }

    const totalPages = Math.ceil(guns.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const gunsToShow = guns.slice(start, end);

    let html = `<h1 class="page-title">${category}</h1><ul class="feature-list">`;
    for (const [name, stats] of gunsToShow) {
        html += `
        <li class="feature-item">
            <span class="feature-icon">🔫</span>
            <div class="feature-content">
                <h3>${name}</h3>
                <p>
                    Damage: ${stats.damage[0]}-${stats.damage[1]}<br>
                    Range: ${stats.range[0]}-${stats.range[1]}<br>
                    Fire Rate: ${stats.fire_rate}<br>
                    Accuracy: ${stats.accuracy}<br>
                    Capacity: ${stats.capacity}<br>
                    Recoil: V${stats.vert_recoil} H${stats.hor_recoil}<br>
                    Head Mult: ${stats.head_mult}, Torso: ${stats.torso_mult}, Limb: ${stats.limb_mult}<br>
                    Reload: ${stats.reload}
                </p>
            </div>
        </li>`;
    }
    html += `</ul>
    <div class="pagination-buttons">
        <button id="prevPage" ${page===1?'disabled':''}>&lt;&lt; previous page</button>
        <button id="nextPage" ${page===totalPages?'disabled':''}>next page &gt;&gt;</button>
    </div>`;

    contentArea.innerHTML = html;

    document.getElementById('prevPage')?.addEventListener('click', () => renderCategory(category, currentPage - 1));
    document.getElementById('nextPage')?.addEventListener('click', () => renderCategory(category, currentPage + 1));

    contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        currentCategory = item.getAttribute('data-page');
        renderCategory(currentCategory, 1);
    });
});

// render first category on load
const firstCategory = document.querySelector('.nav-item.active').getAttribute('data-page');
currentCategory = firstCategory;
renderCategory(currentCategory, 1);

// search box width expand
const searchBox = document.querySelector('.search-box');
searchBox.addEventListener('focus', () => searchBox.style.width = '280px');
searchBox.addEventListener('blur', () => { if(!searchBox.value) searchBox.style.width = '240px'; });
