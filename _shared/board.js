/* =========================================================
   Design Board — Shared Interaction
   =========================================================

   Loaded by every brand-specific design board HTML. Wires up:
     • Click-to-copy on .color-card (swatch) and .prompt-card
     • Injected copy buttons on <pre> code blocks
     • Toast feedback (#boardToast)
     • TOC scroll-spy via IntersectionObserver
     • Smooth-scroll anchor nav (respects prefers-reduced-motion)
     • Accessible section naming (combines .section-num + h2 into
       aria-labelledby on each <section>)

   DOM assumptions:
     • Every section that should appear in scroll-spy is <section id="...">
     • TOC links are <a href="#...">, inside .toc
     • Toast element: <div class="board-toast" id="boardToast">
     • Copy buttons are injected, not authored. No innerHTML usage.

   This file is brand-agnostic. All visual styling comes from board.css
   and the brand's own :root tokens.
   ========================================================= */
(function() {
  'use strict';

  /* ===== Toast ===== */
  const toast = document.getElementById('boardToast');
  let toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  /* ===== Copy helper ===== */
  async function copyText(text, label) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('Copied ' + (label || (text.length > 40 ? text.slice(0, 40) + '…' : text)));
      return true;
    } catch (e) {
      showToast('Copy failed — select manually');
      return false;
    }
  }

  /* ===== Copy button builder (DOM-only, no innerHTML) ===== */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function buildCopyIcon() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '11');
    svg.setAttribute('height', '11');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '4');
    rect.setAttribute('y', '4');
    rect.setAttribute('width', '9');
    rect.setAttribute('height', '9');
    rect.setAttribute('rx', '1.5');
    rect.setAttribute('stroke', 'currentColor');
    rect.setAttribute('stroke-width', '1.4');
    svg.appendChild(rect);
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', 'M10 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '1.4');
    path.setAttribute('stroke-linecap', 'round');
    svg.appendChild(path);
    return svg;
  }

  function attachCopyBtn(container, getText, labelHint) {
    if (container.querySelector(':scope > .copy-btn')) return;
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.appendChild(buildCopyIcon());
    const label = document.createElement('span');
    label.textContent = 'Copy';
    btn.appendChild(label);
    btn.setAttribute('aria-label', 'Copy ' + (labelHint || 'snippet'));
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const ok = await copyText(getText(), labelHint || 'snippet');
      if (ok) {
        btn.classList.add('copied');
        label.textContent = 'Copied';
        setTimeout(() => {
          btn.classList.remove('copied');
          label.textContent = 'Copy';
        }, 1500);
      }
    });
    container.appendChild(btn);
  }

  /* ===== Color cards ===== */
  document.querySelectorAll('.color-card').forEach(card => {
    const hexEl = card.querySelector('.color-hex');
    const nameEl = card.querySelector('.color-name');
    if (!hexEl) return;
    const hex = hexEl.textContent.trim();
    const name = nameEl ? nameEl.textContent.trim() : hex;
    attachCopyBtn(card, () => hex, hex + ' (' + name + ')');
    card.addEventListener('click', (e) => {
      if (e.target.closest('.copy-btn')) return;
      copyText(hex, hex + ' (' + name + ')');
    });
  });

  /* ===== Prompt cards ===== */
  document.querySelectorAll('.prompt-card').forEach(card => {
    const tag = card.querySelector('.tag');
    const tagText = tag ? tag.textContent.trim() : 'prompt';
    attachCopyBtn(card, () => {
      const clone = card.cloneNode(true);
      clone.querySelectorAll('.tag, .copy-btn').forEach(el => el.remove());
      return clone.textContent.trim().replace(/\s+/g, ' ');
    }, tagText + ' prompt');
  });

  /* ===== <pre> code blocks ===== */
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.textContent.trim().length < 20) return;
    const section = pre.closest('section[id]');
    const sectionName = section?.querySelector('.section-num')?.textContent.trim().replace(/^[\d\W]+/, '') || 'code';
    attachCopyBtn(pre, () => pre.textContent.trimEnd(), sectionName + ' snippet');
  });

  /* ===== TOC scroll-spy ===== */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const tocLinks = Array.from(document.querySelectorAll('.toc a[href^="#"]'));
  if (sections.length && tocLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(tocLinks.map(a => [a.getAttribute('href').slice(1), a]));
    let activeId = null;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const nextId = visible[0].target.id;
      if (nextId === activeId) return;
      activeId = nextId;
      tocLinks.forEach(a => {
        a.classList.remove('active');
        a.removeAttribute('aria-current');
      });
      const link = byId.get(nextId);
      if (link) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'location');
      }
    }, {
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    });
    sections.forEach(s => observer.observe(s));
  }

  /* ===== Smooth-scroll anchor nav (respects prefers-reduced-motion) ===== */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function scrollBehavior() { return reducedMotion.matches ? 'auto' : 'smooth'; }

  document.querySelectorAll('.toc a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ===== Accessible section naming =====
     Each top-level section combines section-num eyebrow + h2 headline into
     an aria-labelledby so screen readers announce position + headline when
     navigating by landmarks/headings. */
  document.querySelectorAll('section[id]').forEach(section => {
    const num = section.querySelector(':scope > .section-num');
    const h2 = section.querySelector(':scope > h2');
    if (!num && !h2) return;
    const ids = [];
    if (num) {
      if (!num.id) num.id = section.id + '-eyebrow';
      ids.push(num.id);
    }
    if (h2) {
      if (!h2.id) h2.id = section.id + '-heading';
      if (!ids.includes(h2.id)) ids.push(h2.id);
    }
    if (ids.length) section.setAttribute('aria-labelledby', ids.join(' '));
  });
})();
