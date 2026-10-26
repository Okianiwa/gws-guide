// Поиск по сайту Путеводителя GWS без сервера: индекс страниц — window.GWS_INDEX (search-index.js), путь к корню —
// data-root у <body>. Слова запроса ищутся как начала слов страницы («прыж» найдёт «прыжок»), без учёта регистра и ё.
(function () {
  const input = document.getElementById('q'), box = document.getElementById('results')
  if (!input || !window.GWS_INDEX) return
  const root = document.body.dataset.root || ''
  const norm = s => s.toLowerCase().replace(/ё/g, 'е')
  const pages = window.GWS_INDEX.map(p => ({ ...p, t: norm(p.title), x: norm(p.text) }))
  let active = -1

  function score(p, words) {
    let s = 0
    for (const w of words) {
      const re = new RegExp('(^|[^a-zа-я0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      if (re.test(p.t)) s += 10
      else if (re.test(p.x)) s += 1
      else return 0
    }
    return s
  }
  function snippet(p, w) {
    const i = p.x.indexOf(w)
    if (i < 0) return ''
    const from = Math.max(0, i - 40)
    return (from ? '…' : '') + p.text.slice(from, i + 80).replace(/\s+/g, ' ') + '…'
  }
  function render() {
    const words = norm(input.value).split(/\s+/).filter(w => w.length > 1)
    if (!words.length) { box.style.display = 'none'; return }
    const hits = pages.map(p => [score(p, words), p]).filter(h => h[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 30)
    box.innerHTML = hits.length ? '' : '<a>Ничего не нашлось</a>'
    for (const [, p] of hits) {
      const a = document.createElement('a')
      a.href = root + p.url
      a.textContent = p.title
      const sm = document.createElement('small')
      sm.textContent = snippet(p, words[0])
      a.appendChild(sm)
      box.appendChild(a)
    }
    active = -1
    box.style.display = 'block'
  }
  input.addEventListener('input', render)
  input.addEventListener('keydown', e => {
    const links = [...box.querySelectorAll('a[href]')]
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      active = Math.max(0, Math.min(links.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)))
      links.forEach((l, i) => l.classList.toggle('active', i === active))
    } else if (e.key === 'Enter' && links.length) {
      location.href = links[Math.max(0, active)].href
    } else if (e.key === 'Escape') {
      box.style.display = 'none'
    }
  })
  document.addEventListener('click', e => { if (!box.contains(e.target) && e.target !== input) box.style.display = 'none' })
})()
