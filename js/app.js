/* Rupesh & Rachna — Shubh Vivah
 * Plain JavaScript, no dependencies. All content is real HTML in index.html;
 * this file only adds behaviour: intro, language, music, countdown, vows,
 * scroll reveals, sharing. The page stays fully readable if this file fails.
 */
(function () {
  'use strict';

  /* ── Config ─────────────────────────────────────────── */
  var COUNTDOWN_TARGET_MS = Date.parse('2026-11-21T00:00:00+05:30'); // start of wedding day, IST
  var SHARE_URL = ''; // set to the final public link; empty = use the current page address
  var SHARE_TEXT = 'शुभ विवाह · Rupesh Ranjan & Rachna Bharti · 21 November 2026. You are warmly invited.';
  var STORAGE_KEY = 'rr-shaadi-lang';

  var VOWS = [
    { hi:'प्रथम पद', en:'The first step', l1:'प्रथम पद में ईश्वर को करते हैं नमस्कार।', l2:'रूपेश - रचना का मिलन हर जन्म में हो बारम्बार॥', mean:'May their union be blessed by God and renewed through every lifetime.' },
    { hi:'दूसरा पद', en:'The second step', l1:'दूसरे पद में ऊर्जा व शक्ति की कामना,', l2:'करें दोनों मिलकर सभी चुनौतियों का सामना॥', mean:'May they find the energy and strength to face every challenge together.' },
    { hi:'तीसरा पद', en:'The third step', l1:'तीसरे पद में धन ज्ञान सुबुद्धि की आराधना,', l2:'पद मुक्ति के लिए ईश्वर की प्रार्थना॥', mean:'May they receive prosperity, knowledge, wisdom and divine guidance.' },
    { hi:'चौथा पद', en:'The fourth step', l1:'चौथे पद में राधा-कृष्ण जैसे रहे स्नेह,', l2:'रूपेश-रचना के जीवन में बना रहे प्रेम॥', mean:'May their love and affection remain as enduring as the love of Radha and Krishna.' },
    { hi:'पाँचवाँ पद', en:'The fifth step', l1:'पाँचवें पद में ईश्वर से की गई सुसंतान की प्रार्थना,', l2:'श्रवण कुमार जैसा पुत्र हो यही करते हैं कामना॥', mean:'A prayer for a blessed family and virtuous children.' },
    { hi:'छठा पद', en:'The sixth step', l1:'छठे पद में ऋतु अनुकूल व्यवहार की कामना,', l2:'ध्येय रहे इनका सदा ईश्वर की उपासना॥', mean:'May they live in harmony through every season and remain devoted to the divine.' },
    { hi:'सातवाँ पद', en:'The seventh step', l1:'सातवें पद में रहे मित्रवत सदा,', l2:'परस्पर सामंजस्य, समर्पण, आत्मिक, प्रसन्नता सर्वदा॥', mean:'May their marriage be filled with friendship, harmony, dedication, spiritual connection and lasting happiness.' }
  ];
  var DEV_NUM = ['१','२','३','४','५','६','७'];
  var CHAPTERS = [ {id:'cover', hi:'आरम्भ', en:'Cover'}, {id:'programme', hi:'कार्यक्रम', en:'Programme'}, {id:'family', hi:'परिवार', en:'Family'}, {id:'vows', hi:'सप्तपदी', en:'Seven Vows'} ];

  /* ── DOM ────────────────────────────────────────────── */
  var root = document.getElementById('app');
  if (!root) return;
  var $ = function (sel, ctx) { return (ctx || root).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); };
  var secs = { cover: $('#cover'), programme: $('#programme'), family: $('#family'), vows: $('#vows') };
  var tl = $('.tl');
  var audio = $('audio');
  var closing = $('.closing');
  var chapBtns = $$('.chap');
  var markers = $$('.marker');
  var vowPanel = $('#vow-panel');
  var vowWrap = vowPanel ? vowPanel.querySelector('.ecard-in > div') : null;

  /* ── State ──────────────────────────────────────────── */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var savedLang = null;
  try { savedLang = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var S = {
    lang: savedLang === 'en' || savedLang === 'both' ? savedLang : 'hi',
    intro: 'idle', instant: false, reduce: !!(mq && mq.matches),
    vow: 0, seen: [0], flip: false, music: false, chapter: 0
  };
  if (S.reduce) { S.intro = 'open'; S.instant = true; }
  var wantMusic = true;
  var timers = {};

  function set(patch) { for (var k in patch) S[k] = patch[k]; render(); }
  function showIf(key, on) { $$('[data-if="' + key + '"]').forEach(function (el) { el.hidden = !on; }); }
  function motionOff() { return S.reduce; }

  /* ── Render: only the parts that depend on state ────── */
  function render() {
    var revealed = S.intro !== 'idle';
    var c = root.classList;
    ['L-hi', 'L-en', 'L-both'].forEach(function (x) { c.remove(x); });
    c.add('L-' + S.lang, 'js');
    c.toggle('revealed', revealed);
    c.toggle('is-idle', S.intro === 'idle');
    c.toggle('rm-intro', S.reduce || S.instant);
    c.toggle('rm', S.reduce);
    document.documentElement.lang = S.lang === 'en' ? 'en' : 'hi';

    $$('.seg button').forEach(function (b, i) { b.setAttribute('aria-pressed', String(['hi', 'both', 'en'][i] === S.lang)); });
    chapBtns.forEach(function (b, i) {
      b.setAttribute('aria-current', String(S.chapter === i));
      var sp = b.querySelector('span'); if (sp) sp.textContent = S.lang === 'hi' ? CHAPTERS[i].hi : CHAPTERS[i].en;
    });

    var mb = $('[data-act="toggleMusic"]');
    if (mb) {
      var lbl = S.music ? 'Mute music' : 'Play music';
      mb.setAttribute('aria-pressed', String(S.music)); mb.setAttribute('aria-label', lbl); mb.title = lbl;
    }
    showIf('musicOn', S.music); showIf('musicOff', !S.music);
    var mo = $('[data-act="toggleMotion"]'); if (mo) mo.setAttribute('aria-pressed', String(S.reduce));

    showIf('showSkip', !revealed);
    showIf('showDoors', S.intro !== 'open');
    showIf('showPetals', revealed && !S.reduce);
    showIf('showCue', revealed);
    showIf('showFab', S.intro === 'open');

    renderVow();
    if (closing) closing.classList.toggle('lit', S.seen.indexOf(VOWS.length - 1) >= 0);
  }

  function renderVow() {
    if (!vowPanel) return;
    var v = VOWS[S.vow];
    markers.forEach(function (m, i) {
      var sel = i === S.vow;
      m.setAttribute('aria-selected', String(sel));
      m.tabIndex = sel ? 0 : -1;
      m.classList.toggle('seen', !sel && S.seen.indexOf(i) >= 0);
    });
    vowPanel.setAttribute('aria-labelledby', 'vow-tab-' + S.vow);
    var stepHi = $('.vow-step .hi', vowPanel), stepEn = $('.vow-step .en', vowPanel);
    if (stepHi) stepHi.textContent = 'पद ' + DEV_NUM[S.vow] + ' / ७';
    if (stepEn) stepEn.textContent = 'Step ' + (S.vow + 1) + ' of 7';
    var nm = $$('.vow-name span', vowPanel); if (nm[0]) nm[0].textContent = v.hi; if (nm[1]) nm[1].textContent = v.en;
    var ls = $$('.vow-verse span', vowPanel); if (ls[0]) ls[0].textContent = v.l1; if (ls[1]) ls[1].textContent = v.l2;
    var mean = $('.vow-mean', vowPanel); if (mean) mean.textContent = v.mean;
    if (vowWrap) vowWrap.className = S.flip ? 'anim-a' : 'anim-b';
    var cnt = $('.vow-count', vowPanel); if (cnt) cnt.textContent = (S.vow + 1) + ' / 7';
    var prev = $('[data-act="prevVow"]'), next = $('[data-act="nextVow"]');
    if (prev) prev.disabled = S.vow === 0;
    if (next) next.disabled = S.vow === VOWS.length - 1;
    var prog = $('.ring-prog'); if (prog) prog.style.strokeDashoffset = (1 - (S.vow + 1) / VOWS.length).toFixed(4);
  }

  /* ── Countdown (1 s, paused while the tab is hidden) ── */
  var nums = $$('.count .num');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    var diff = COUNTDOWN_TARGET_MS - Date.now();
    if (diff <= 0) { showIf('cd.running', false); showIf('cd.done', true); clearInterval(timers.cd); return; }
    var s = Math.floor(diff / 1000);
    var parts = [String(Math.floor(s / 86400)), pad(Math.floor(s % 86400 / 3600)), pad(Math.floor(s % 3600 / 60)), pad(s % 60)];
    nums.forEach(function (el, i) { if (el.textContent !== parts[i]) el.textContent = parts[i]; });
  }
  tick();
  timers.cd = setInterval(function () { if (!document.hidden) tick(); }, 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); });

  /* ── Navigation ─────────────────────────────────────── */
  function scrollToSec(id) {
    var el = secs[id]; if (!el) return;
    el.scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth', block: 'start' });
    var h = el.querySelector('h1, h2');
    if (h) { h.setAttribute('tabindex', '-1'); setTimeout(function () { h.focus({ preventScroll: true }); }, motionOff() ? 0 : 600); }
  }

  /* ── Intro / close ──────────────────────────────────── */
  function openInvite() {
    if (S.intro !== 'idle') return;
    if (motionOff()) { set({ intro: 'open', instant: true }); return; }
    set({ intro: 'opening', instant: false });
    clearTimeout(timers.intro);
    timers.intro = setTimeout(function () { set({ intro: 'open' }); }, 1000);
  }
  function skipIntro() { set({ intro: 'open', instant: true }); scrollToSec('programme'); }
  function closeCard() {
    clearTimeout(timers.intro); clearTimeout(timers.close);
    var cover = secs.cover;
    if (cover) cover.scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth', block: 'start' });
    if (motionOff()) { set({ intro: 'idle', instant: false }); return; }
    var wait = cover && Math.abs(cover.getBoundingClientRect().top) < 40 ? 0 : 650;
    timers.close = setTimeout(function () {
      set({ intro: 'closing', instant: false });
      requestAnimationFrame(function () { requestAnimationFrame(function () {
        set({ intro: 'idle' });
        setTimeout(function () { var b = $('[data-act="openInvite"]'); if (b) b.focus({ preventScroll: true }); }, 950);
      }); });
    }, wait);
  }

  /* ── Seven vows ─────────────────────────────────────── */
  function selectVow(i, focus) {
    i = Math.max(0, Math.min(VOWS.length - 1, i));
    var seen = S.seen.indexOf(i) >= 0 ? S.seen : S.seen.concat([i]);
    set({ vow: i, seen: seen, flip: i === S.vow ? S.flip : !S.flip });
    if (focus && markers[i]) markers[i].focus();
  }
  function vowKey(e) {
    var k = e.key, i = S.vow;
    if (k === 'ArrowRight' || k === 'ArrowDown') i++;
    else if (k === 'ArrowLeft' || k === 'ArrowUp') i--;
    else if (k === 'Home') i = 0;
    else if (k === 'End') i = VOWS.length - 1;
    else return;
    e.preventDefault();
    selectVow((i + VOWS.length) % VOWS.length, true);
  }

  /* ── Music: plays muted from page load (browser-required), unmutes on the first tap ── */
  function fadeAudio(to, ms, done) {
    if (!audio) return;
    clearInterval(timers.fade);
    var from = audio.volume, steps = Math.max(1, Math.round(ms / 50)), n = 0;
    timers.fade = setInterval(function () {
      n++; audio.volume = Math.min(1, Math.max(0, from + (to - from) * n / steps));
      if (n >= steps) { clearInterval(timers.fade); if (done) done(); }
    }, 50);
  }
  function startMusic(quiet) {
    if (!audio) return;
    audio.volume = 0;
    audio.muted = false;
    if (!audio.paused) { set({ music: true }); fadeAudio(0.8, 1500); dropGesture(); return; }
    var p = audio.play();
    var ok = function () { set({ music: true }); fadeAudio(0.8, 1500); dropGesture(); };
    if (p && p.then) p.then(ok).catch(function () { if (!quiet) flash('Tap the music button to play'); });
    else ok();
  }
  function stopMusic() {
    if (audio && !audio.paused) fadeAudio(0, 600, function () { audio.pause(); });
    set({ music: false });
  }
  var GESTURES = ['pointerdown', 'keydown', 'touchend'];
  function firstGesture(e) {
    if (e && e.target && e.target.closest && e.target.closest('[data-music]')) return;
    if (wantMusic && !S.music) startMusic(true);
    dropGesture();
  }
  function dropGesture() { GESTURES.forEach(function (t) { document.removeEventListener(t, firstGesture, true); }); }
  GESTURES.forEach(function (t) { document.addEventListener(t, firstGesture, true); });
  setTimeout(function () { if (wantMusic && !S.music) startMusic(true); }, 400);

  /* ── Sharing ────────────────────────────────────────── */
  function shareUrl() {
    if (SHARE_URL) return SHARE_URL;
    var h = location.href; return /^https?:/.test(h) ? h.split('#')[0] : '';
  }
  function flash(msg) {
    var box = $('[data-if="hasToast"]'); if (!box) return;
    var t = box.querySelector('.toast'); if (t) t.textContent = msg;
    box.hidden = false;
    clearTimeout(timers.toast);
    timers.toast = setTimeout(function () { box.hidden = true; }, 2800);
  }
  function doCopy() {
    var url = shareUrl();
    if (!url) { flash('Open the invitation from its web link to copy it'); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () { flash('Invitation link copied'); }, function () { flash('Could not copy — please copy the address from your browser'); });
    } else flash('Could not copy — please copy the address from your browser');
  }
  function doShare() {
    var url = shareUrl();
    if (navigator.share) {
      navigator.share({ title: 'Rupesh & Rachna — Shubh Vivah', text: SHARE_TEXT, url: url || undefined })
        .then(function () { flash('Thank you for sharing'); }, function (e) { if (e && e.name !== 'AbortError') doCopy(); });
      return;
    }
    doCopy();
  }
  var wa = $('a[href^="https://wa.me/"]');
  if (wa) { var u = shareUrl(); wa.href = 'https://wa.me/?text=' + encodeURIComponent(SHARE_TEXT + (u ? ' ' + u : '')); }

  /* ── Actions (event delegation) ─────────────────────── */
  var ACTIONS = {
    goCover: function () { scrollToSec('cover'); },
    goProgramme: function () { scrollToSec('programme'); },
    'c.go': function (i) { scrollToSec(CHAPTERS[i].id); },
    setHi: function () { setLang('hi'); }, setBoth: function () { setLang('both'); }, setEn: function () { setLang('en'); },
    toggleMusic: function () { dropGesture(); if (S.music) { wantMusic = false; stopMusic(); } else { wantMusic = true; startMusic(false); } },
    toggleMotion: function () { set({ reduce: !S.reduce, intro: S.intro === 'idle' ? 'open' : S.intro, instant: true }); },
    share: doShare, copyLink: doCopy,
    openInvite: openInvite, skipIntro: skipIntro, closeCard: closeCard,
    coverTap: function () { if (S.intro === 'idle') openInvite(); },
    'mk.pick': function (i) { selectVow(i); },
    prevVow: function () { selectVow(S.vow - 1); }, nextVow: function () { selectVow(S.vow + 1); }
  };
  function setLang(l) { try { localStorage.setItem(STORAGE_KEY, l); } catch (e) {} set({ lang: l }); }
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    while (el && root.contains(el)) {
      var fn = ACTIONS[el.getAttribute('data-act')];
      if (fn) fn(Number(el.getAttribute('data-i')));
      // inner controls (Open, Skip, music) must not also trigger the cover's tap-anywhere
      if (el.getAttribute('data-act') !== 'coverTap') break;
      el = el.parentElement && el.parentElement.closest('[data-act]');
    }
  });
  var tablist = $('[data-keyact="vowKey"]'); if (tablist) tablist.addEventListener('keydown', vowKey);
  if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { set({ reduce: e.matches }); });

  /* ── Scroll: reveals, chapter tracking, pausing off-screen loops ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.setAttribute('data-in', ''); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    $$('[data-reveal]').forEach(function (el) { io.observe(el); });
    var chapIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var idx = CHAPTERS.findIndex(function (c) { return secs[c.id] === en.target; });
        if (idx >= 0 && idx !== S.chapter) set({ chapter: idx });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    var liveIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) en.target.setAttribute('data-live', ''); else en.target.removeAttribute('data-live'); });
    }, { threshold: 0 });
    CHAPTERS.forEach(function (c) { if (secs[c.id]) chapIo.observe(secs[c.id]); });
    if (secs.cover) liveIo.observe(secs.cover);
    if (secs.family) liveIo.observe(secs.family);
  } else {
    $$('[data-reveal]').forEach(function (el) { el.setAttribute('data-in', ''); });
  }

  var raf = 0;
  function updateScroll() {
    raf = 0;
    var vh = window.innerHeight || 800;
    var cover = secs.cover;
    if (cover && !motionOff()) {
      var r = cover.getBoundingClientRect();
      if (r.bottom > 0) cover.style.setProperty('--par', Math.min(1, Math.max(0, -r.top / Math.max(1, r.height))).toFixed(3));
    }
    if (tl) {
      var t = tl.getBoundingClientRect();
      tl.style.setProperty('--tl', Math.min(1, Math.max(0, (vh * 0.62 - t.top) / Math.max(1, t.height))).toFixed(3));
    }
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(updateScroll); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateScroll();

  render();
})();
