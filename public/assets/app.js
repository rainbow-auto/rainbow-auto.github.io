(() => {
  const base = document.body.dataset.base || '';
  function arrangeNotes() {
    const notes = [...document.querySelectorAll('.sidenote')];
    for (const note of notes) note.style.transform = '';
    if (matchMedia('(max-width:760px)').matches) return;
    let bottom = document.querySelector('.article-margin')?.getBoundingClientRect().bottom || 0;
    for (const note of notes) {
      const rect = note.getBoundingClientRect();
      const shift = Math.max(0, bottom + 14 - rect.top);
      if (shift) note.style.transform = `translateY(${shift}px)`;
      bottom = rect.bottom + shift;
    }
  }
  addEventListener('resize', arrangeNotes);
  addEventListener('load', arrangeNotes);
  document.fonts?.ready.then(arrangeNotes);
  document.querySelector('.toc')?.addEventListener('toggle', arrangeNotes);
  const toggle = document.querySelector('#theme-toggle');
  const updateThemeLabel = () => toggle?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式');
  updateThemeLabel();
  toggle?.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem('blog-theme', theme); } catch {}
    updateThemeLabel();
  });
  document.addEventListener('click', async event => {
    const copy = event.target.closest('.copy-code');
    if (copy) {
      const code = copy.closest('.code-block').querySelector('code').textContent;
      try { await navigator.clipboard.writeText(code); copy.textContent = '已复制'; }
      catch { copy.textContent = '请选中复制'; }
      setTimeout(() => { copy.textContent = '复制'; }, 1800);
    }
    const ref = event.target.closest('.footnote-ref a');
    if (ref && matchMedia('(max-width:760px)').matches) {
      event.preventDefault();
      const note = document.getElementById(ref.getAttribute('aria-controls'));
      if (note) { note.classList.toggle('open'); ref.setAttribute('aria-expanded', String(note.classList.contains('open'))); }
    }
  });
  const top = document.querySelector('.back-top');
  const updateTop = () => top?.classList.toggle('visible', scrollY > 500);
  addEventListener('scroll', updateTop, { passive: true });
  updateTop();
  const unlock = document.querySelector('#unlock-form');
  unlock?.addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.querySelector('#unlock-status');
    const submit = unlock.querySelector('button');
    const password = document.querySelector('#post-password');
    submit.disabled = true;
    status.textContent = '正在解锁…';
    try {
      const bundle = JSON.parse(document.querySelector('#encrypted-post').textContent);
      const bytes = str => Uint8Array.from(atob(str), c => c.charCodeAt(0));
      const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password.value), 'PBKDF2', false, ['deriveKey']);
      const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: bytes(bundle.salt), iterations: bundle.iterations }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(bundle.iv) }, key, bytes(bundle.ciphertext));
      const payload = JSON.parse(new TextDecoder().decode(plain));
      const article = document.querySelector('#unlocked-post');
      article.innerHTML = payload.html;
      // 加密导出来自本地构建，发布时可能采用不同的子目录。
      for (const element of article.querySelectorAll('[src],[href]')) {
        for (const attribute of ['src', 'href']) {
          const value = element.getAttribute(attribute);
          if (!value?.startsWith('/') || value.startsWith('//')) continue;
          const route = payload.base && value.startsWith(payload.base + '/') ? value.slice(payload.base.length) : value;
          element.setAttribute(attribute, base + route);
        }
      }
      article.hidden = false;
      document.querySelector('.locked-shell').hidden = true;
      password.value = '';
      arrangeNotes();
      article.querySelector('.toc')?.addEventListener('toggle', arrangeNotes);
    } catch {
      status.textContent = window.isSecureContext ? '密码不正确，请再试一次。' : '请使用 HTTPS 或 localhost 打开此页面。';
    } finally { submit.disabled = false; }
  });
  const input = document.querySelector('#search-input');
  if (input) {
    let index, timer, requestNumber = 0;
    const form = document.querySelector('#search-form');
    const status = document.querySelector('#search-status');
    const results = document.querySelector('#search-results');
    async function search() {
      const request = ++requestNumber;
      const query = input.value.trim();
      const url = new URL(location.href);
      if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
      results.replaceChildren();
      if (!query) { status.textContent = '输入关键词开始搜索。'; return; }
      status.textContent = '正在搜索…';
      try {
        if (!index) {
          const response = await fetch(`${base}/search-index.json`);
          if (!response.ok) throw new Error('search unavailable');
          index = await response.json();
        }
        if (request !== requestNumber) return;
        const words = query.toLowerCase().split(/\s+/);
        const matched = index.map(post => {
          const title = post.title.toLowerCase(), tags = post.tags.join(' ').toLowerCase();
          const haystack = `${title} ${tags} ${post.categories.join(' ')} ${post.text}`.toLowerCase();
          return { post, score: words.every(w => haystack.includes(w)) ? words.reduce((n, w) => n + (title.includes(w) ? 5 : 0) + (tags.includes(w) ? 2 : 0) + 1, 0) : 0 };
        }).filter(x => x.score).sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date));
        status.textContent = `找到 ${matched.length} 篇记录${matched.some(x => x.post.protected) ? '；加密文章只检索标题与标签。' : '。'}`;
        if (!matched.length) { status.textContent = '没有找到记录。试试更短的关键词，或前往归档浏览。'; return; }
        for (const { post } of matched) {
          const item = document.createElement('article'); item.className = 'search-result';
          const heading = document.createElement('h2'), anchor = document.createElement('a');
          anchor.href = post.url; anchor.textContent = post.title + (post.protected ? ' · 加密' : ''); heading.append(anchor);
          const meta = document.createElement('small'); meta.textContent = `${post.date.replaceAll('-', '.')} ${post.tags.length ? ' / ' + post.tags.join(' · ') : ''}`;
          const excerpt = document.createElement('p');
          const first = post.text.toLowerCase().indexOf(words[0]);
          excerpt.textContent = first >= 0 ? `${first > 30 ? '…' : ''}${post.text.slice(Math.max(0, first - 30), first + 120)}…` : post.excerpt;
          item.append(heading, meta, excerpt); results.append(item);
        }
      } catch { if (request === requestNumber) status.textContent = '搜索索引加载失败，请刷新重试。'; }
    }
    form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); search(); });
    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(search, 180); });
    input.value = new URLSearchParams(location.search).get('q') || '';
    if (input.value) search();
  }
})();
