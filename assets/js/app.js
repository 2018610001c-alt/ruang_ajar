(() => {
  'use strict';
  const DATA = window.RUANG_AJAR_DATA || {};
  const PREFIX = 'ruangAjarCanva_2026_';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      console.warn(`Tidak dapat membaca ${key}:`, error);
      return fallback;
    }
  }
  function save(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (error) {
      toast('Penyimpanan browser tidak tersedia atau penuh.');
      console.warn(`Tidak dapat menyimpan ${key}:`, error);
      return false;
    }
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }
  function safeUrl(value) {
    try {
      const parsed = new URL(value);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '#';
    } catch (_) { return '#'; }
  }
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
  }

  const pages = {
    home: 'Beranda', guide: 'Petunjuk', competency: 'Kompetensi', lkpd: 'LKPD Digital',
    presentation: 'Presentasi', video: 'Video', evaluation: 'Evaluasi', glossary: 'Glosarium',
    workflow: 'Alur Belajar', portfolio: 'Hasil Karya', references: 'Referensi'
  };
  const state = {
    page: 'home',
    portfolio: load('portfolio', []),
    completed: load('completedProjects', []),
    quizResult: load('quizResult', null)
  };

  // Navigation: a sliding drawer on small screens and a hide/show sidebar on desktop.
  const isMobile = () => window.matchMedia('(max-width: 880px)').matches;
  function closeSidebar() {
    document.body.classList.remove('sidebar-mobile-open');
    $('#menuToggle').setAttribute('aria-expanded', 'false');
  }
  function toggleSidebar() {
    if (isMobile()) {
      const opened = document.body.classList.toggle('sidebar-mobile-open');
      $('#menuToggle').setAttribute('aria-expanded', String(opened));
    } else {
      const hidden = document.body.classList.toggle('sidebar-collapsed');
      $('#menuToggle').setAttribute('aria-expanded', String(!hidden));
    }
  }
  function navigate(page) {
    if (!pages[page]) return;
    state.page = page;
    $$('.page').forEach(section => section.classList.toggle('active', section.id === `page-${page}`));
    $$('.nav-link').forEach(link => {
      const active = link.dataset.page === page;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    $('#breadcrumbLabel').textContent = pages[page];
    if (isMobile()) closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'portfolio') renderPortfolio();
    if (page === 'references') renderSubjects();
  }
  document.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) { navigate(go.dataset.go); return; }
    const nav = event.target.closest('[data-page]');
    if (nav) { navigate(nav.dataset.page); return; }
    const canva = event.target.closest('[data-open-canva]');
    if (canva) window.open('https://www.canva.com/', '_blank', 'noopener,noreferrer');
  });
  $('#menuToggle').addEventListener('click', toggleSidebar);
  $('#closeSidebar').addEventListener('click', closeSidebar);
  $('#sidebarScrim').addEventListener('click', closeSidebar);
  window.addEventListener('resize', () => {
    if (!isMobile()) closeSidebar();
    else {
      document.body.classList.remove('sidebar-collapsed');
      $('#menuToggle').setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSidebar();
  });


  // Portfolio storage and project forms.
  function addProjectFromForm(form) {
    const formData = new FormData(form);
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type: form.dataset.projectForm,
      title: String(formData.get('title') || '').trim(),
      grade: String(formData.get('grade') || '').trim(),
      subject: String(formData.get('subject') || '').trim(),
      url: safeUrl(String(formData.get('url') || '').trim()),
      createdAt: new Date().toISOString()
    };
    if (!item.title || !item.grade || !item.subject || item.url === '#') {
      toast('Periksa kembali judul, kelas, mata pelajaran, dan tautan.');
      return;
    }
    state.portfolio.unshift(item);
    save('portfolio', state.portfolio);
    const key = item.type.includes('LKPD') ? 'lkpd' : item.type.includes('Presentasi') ? 'presentation' : 'video';
    if (!state.completed.includes(key)) state.completed.push(key);
    save('completedProjects', state.completed);
    form.reset();
    renderPortfolio();
    toast('Karya berhasil disimpan ke Hasil Karya.');
  }
  $$('[data-project-form]').forEach(form => form.addEventListener('submit', event => {
    event.preventDefault();
    addProjectFromForm(form);
  }));


  function renderPortfolio() {
    const items = Array.isArray(state.portfolio) ? state.portfolio : [];
    $('#portfolioTotal').textContent = items.length;
    $('#portfolioLkpd').textContent = items.filter(item => item.type === 'LKPD Digital').length;
    $('#portfolioPresentation').textContent = items.filter(item => item.type === 'Presentasi').length;
    $('#portfolioVideo').textContent = items.filter(item => item.type === 'Video Pembelajaran').length;
    const list = $('#portfolioList');
    if (!items.length) {
      list.innerHTML = '<div class="portfolio-empty"><strong>Belum ada karya yang disimpan</strong><p>Setelah membuat proyek, masukkan tautan pada halaman LKPD, Presentasi, atau Video.</p></div>';
      return;
    }
    list.innerHTML = items.map(item => {
      const icon = item.type.includes('LKPD') ? '▤' : item.type.includes('Presentasi') ? '▧' : '▷';
      return `<article class="portfolio-item" data-portfolio-id="${esc(item.id)}">
        <span class="portfolio-item-icon">${icon}</span>
        <div class="portfolio-item-main"><strong>${esc(item.title)}</strong><p>${esc(item.type)} · Kelas ${esc(item.grade)} · ${esc(item.subject)}</p><a href="${esc(safeUrl(item.url))}" target="_blank" rel="noopener noreferrer">Buka karya ↗</a></div>
        <button type="button" class="portfolio-remove" data-remove-portfolio="${esc(item.id)}" aria-label="Hapus karya">×</button>
      </article>`;
    }).join('');
    $$('[data-remove-portfolio]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.removePortfolio;
      state.portfolio = state.portfolio.filter(item => String(item.id) !== id);
      save('portfolio', state.portfolio);
      const remainingTypes = new Set(state.portfolio.map(item => item.type));
      state.completed = state.completed.filter(key => {
        if (key === 'lkpd') return remainingTypes.has('LKPD Digital');
        if (key === 'presentation') return remainingTypes.has('Presentasi');
        if (key === 'video') return remainingTypes.has('Video Pembelajaran');
        return true;
      });
      save('completedProjects', state.completed);
      renderPortfolio();
      toast('Karya dihapus dari daftar lokal.');
    }));
  }


  // Glossary search.
  const glossary = [
    ['Aksesibilitas', 'Kemudahan suatu media untuk digunakan dan dipahami oleh pengguna dengan kebutuhan yang beragam.'],
    ['Animasi', 'Efek gerak pada teks, gambar, atau elemen desain untuk membantu penyajian informasi.'],
    ['Audio', 'Suara seperti narasi, musik, atau efek suara yang menjadi bagian dari media.'],
    ['Elemen', 'Objek desain di Canva, misalnya garis, bentuk, ikon, ilustrasi, dan grafik.'],
    ['Ekspor', 'Proses mengunduh atau menghasilkan file akhir dari desain, misalnya PDF, PNG, atau MP4.'],
    ['Font / Tipografi', 'Bentuk dan pengaturan huruf yang digunakan untuk menyampaikan informasi.'],
    ['Hyperlink', 'Tautan yang mengarahkan pengguna ke halaman, dokumen, situs, atau slide lain.'],
    ['Kanvas', 'Area kerja tempat pengguna menyusun dan mengatur elemen desain.'],
    ['Layout', 'Tata letak atau susunan elemen di dalam halaman atau slide.'],
    ['LKPD Digital', 'Lembar kerja peserta didik dalam format digital yang memuat petunjuk, materi, aktivitas, dan ruang respons.'],
    ['MP4', 'Format file video yang umum digunakan untuk menyimpan dan membagikan video.'],
    ['Presentasi 16:9', 'Format presentasi layar lebar yang umum digunakan pada layar komputer dan proyektor.'],
    ['Template', 'Desain siap pakai yang dapat disesuaikan dengan kebutuhan pengguna.'],
    ['Timeline', 'Garis waktu pada editor video untuk mengatur urutan dan durasi klip, teks, serta audio.'],
    ['Unggahan / Uploads', 'Area Canva untuk memasukkan file milik pengguna, seperti foto, video, dan audio.'],
    ['White space', 'Ruang kosong dalam desain yang membantu konten lebih teratur dan mudah dibaca.']
  ];
  function renderGlossary(query = '') {
    const normalized = query.trim().toLocaleLowerCase('id');
    const filtered = glossary.filter(([term, definition]) => `${term} ${definition}`.toLocaleLowerCase('id').includes(normalized));
    $('#glossaryList').innerHTML = filtered.length ? filtered.map(([term, definition]) => `<dl class="glossary-item"><dt>${esc(term)}</dt><dd>${esc(definition)}</dd></dl>`).join('') : '<div class="glossary-empty">Tidak ada istilah yang cocok dengan pencarian.</div>';
  }
  $('#glossarySearch').addEventListener('input', event => renderGlossary(event.target.value));

  // Reference catalogue by class and program/concentration from the uploaded KSP summary.
  function populatePrograms() {
    const grade = $('#refGrade').value;
    const programSelect = $('#refProgram');
    const programs = DATA.programs?.[grade] || [];
    programSelect.innerHTML = programs.map(program => `<option value="${esc(program)}">${esc(program)}</option>`).join('');
    renderSubjects();
  }
  function renderSubjects() {
    const grade = $('#refGrade').value;
    const program = $('#refProgram').value || (DATA.programs?.[grade] || [])[0] || '';
    const subjects = DATA.getSubjects ? DATA.getSubjects(grade, program) : [];
    $('#subjectList').innerHTML = subjects.map((subject, index) => `<div class="subject-item"><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(subject)}</strong></div>`).join('') || '<div class="portfolio-empty">Tidak ada daftar mata pelajaran untuk pilihan ini.</div>';
  }
  $('#refGrade').addEventListener('change', populatePrograms);
  $('#refProgram').addEventListener('change', renderSubjects);

  // Initialize static UI.
  populatePrograms();
  renderGlossary();
  renderPortfolio();

  // Ensure direct access to the landing page; no login gate or identity check exists.
  $('#menuToggle').setAttribute('aria-expanded', String(!isMobile()));
  navigate('home');
})();
