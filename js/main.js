// TODO: 申込フォームのURLをここに1か所入れると、Entryの申込ボタンが有効になります
const ENTRY_URL = '';

// お知らせ一覧（0件のときは「お知らせは準備中です」と表示）
// 追加例：{ tag: 'お知らせ', color: '#157C8E', text: '特設ページを公開しました' }
//        タグ色の目安：お知らせ #157C8E ／ 講師 #C7364D ／ 申込 #3B7F48
const newsItems = [];

const newsList = document.getElementById('news-list');
if (newsList) {
  newsList.classList.toggle('is-empty', newsItems.length === 0);
  newsList.innerHTML = newsItems.length
    ? newsItems.map((item) => `
      <div class="news-row reveal">
        <span class="news-tag" style="background:${item.color};">${item.tag}</span>
        <span class="news-text">${item.text}</span>
        <svg class="news-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
      </div>
    `).join('')
    : '<p class="news-empty">お知らせは準備中です</p>';
}

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (header) {
  const updateHeaderState = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();
}

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    const isExpanded = mobileMenu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isExpanded));
    menuButton.setAttribute('aria-label', isExpanded ? 'メニューを閉じる' : 'メニューを開く');
  });

  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('is-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'メニューを開く');
    });
  });
}

// スクロールでふわっと表示：読み込み時に画面外の要素だけを対象にする
// （JSが動かない・遅い・印刷・3秒経過のときは、すべて表示される）
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const REVEAL_FALLBACK_MS = 3000;

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const isInView = (el) => {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  };
  const show = (el) => {
    el.classList.remove('reveal-wait');
    observer.unobserve(el);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) show(entry.target);
    });
  }, { threshold: 0.01 });

  document.querySelectorAll('.reveal').forEach((el) => {
    if (isInView(el)) return;
    el.classList.add('reveal-wait');
    observer.observe(el);
  });

  const waiting = () => document.querySelectorAll('.reveal.reveal-wait');
  const showAll = () => waiting().forEach(show);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      waiting().forEach((el) => { if (isInView(el)) show(el); });
    }, 150);
  });
  window.addEventListener('beforeprint', showAll);
  setTimeout(showAll, REVEAL_FALLBACK_MS);
}

const tabButtons = [...document.querySelectorAll('.tab-button')];
const programPanels = document.querySelectorAll('.program-panel');

const selectTab = (button) => {
  const target = button.dataset.tab;
  tabButtons.forEach((tab) => {
    const active = tab === button;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  programPanels.forEach((panel) => {
    panel.classList.toggle('is-active', panel.dataset.panel === target);
  });
};

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectTab(button));
  button.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabButtons[(index + step + tabButtons.length) % tabButtons.length];
    next.focus();
    selectTab(next);
  });
});

const entryButton = document.getElementById('entry-button');
if (ENTRY_URL && entryButton) {
  const link = document.createElement('a');
  link.href = ENTRY_URL;
  link.className = 'cta-button';
  link.target = '_blank';
  link.rel = 'noopener';
  link.textContent = '参加を申し込む';
  entryButton.replaceWith(link);
  const note = document.getElementById('entry-note');
  if (note) note.textContent = '申込フォーム（外部サイト）が開きます';
  document.querySelectorAll('.header-button').forEach((btn) => {
    btn.href = ENTRY_URL;
    btn.target = '_blank';
    btn.rel = 'noopener';
    btn.textContent = 'お申し込み';
  });
}

const pageTop = document.querySelector('.page-top');
if (pageTop) {
  pageTop.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

document.documentElement.classList.add('js-ready');