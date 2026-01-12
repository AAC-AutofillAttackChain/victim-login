/* thirdparty_sameorigin.js
   Same-origin third-party script:
   - Injects the same "Hidden-field test grid" layout as loginForm.html
   - Populates #grid with 20 cards (same headings + descriptions + DOM structure)
   - Ensures each technique's hiding behavior matches loginForm.html
*/
(function () {
  // Locate target grid (preferred) or create one
  function ensureGrid() {
    let grid = document.getElementById('grid');
    if (grid) return grid;

    const section = document.createElement('section');
    const h2 = document.createElement('h2');
    h2.textContent = 'Hidden-field test grid';
    const p = document.createElement('p');
    p.className = 'note';
    p.textContent = 'After saving an autofill entry, reload and observe which hidden inputs were autofilled.';
    grid = document.createElement('div');
    grid.className = 'grid';
    grid.id = 'grid';
    section.appendChild(h2);
    section.appendChild(p);
    section.appendChild(grid);

    // Insert near top (after first <hr> if exists)
    const hrs = document.querySelectorAll('hr');
    if (hrs && hrs.length) hrs[hrs.length - 1].insertAdjacentElement('afterend', section);
    else document.body.appendChild(section);
    return grid;
  }

  const grid = ensureGrid();

  const CARDS = [
    {
      n: 1, tech: 'display:none', title: '1) display:none', desc: 'display:none fully removes element from layout/paint.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c1-u', 'username', 'username', 'username', 'display:none'));
        form.appendChild(input('c1-p', 'password', 'current-password', 'password', 'display:none', 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 2, tech: 'visibility:hidden', title: '2) visibility:hidden', desc: 'Invisible but still occupies space.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c2-u', 'username', 'username', 'username', 'visibility:hidden'));
        form.appendChild(input('c2-p', 'password', 'current-password', 'password', 'visibility:hidden', 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 3, tech: 'opacity:0', title: '3) opacity:0', desc: 'Fully transparent; still interactive and occupies space.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c3-u', 'username', 'username', 'username', 'opacity:0'));
        form.appendChild(input('c3-p', 'password', 'current-password', 'password', 'opacity:0', 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 4, tech: 'filter:opacity(0)', title: '4) filter: opacity(0)', desc: 'Hidden via CSS filter; still in layout.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c4-u', 'username', 'username', 'username', 'filter:opacity(0)'));
        form.appendChild(input('c4-p', 'password', 'current-password', 'password', 'filter:opacity(0)', 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 5, tech: 'off-screen', title: '5) Off-screen', desc: 'Absolutely positioned far outside the viewport.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c5-u', 'username', 'username', 'username', null, 'text', 'offscreen'));
        form.appendChild(input('c5-p', 'password', 'current-password', 'password', null, 'password', 'offscreen'));
        card.appendChild(form);
      }
    },
    {
      n: 6, tech: 'tiny-size', title: '6) Tiny size (1×1)', desc: 'Minuscule form area to hide in plain sight.', build: (card) => {
        const form = document.createElement('form');
        form.className = 'tiny';
        form.appendChild(input('c6-u', 'username', 'username', 'u'));
        form.appendChild(input('c6-p', 'password', 'current-password', 'p', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 7, tech: 'ancestor-overflow', title: '7) Ancestor clip (height: 0)', desc: 'Parent container has height:0 and overflow:hidden.', build: (card) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'height:0; overflow:hidden;';
        const form = document.createElement('form');
        form.appendChild(input('c7-u', 'username', 'username', 'username'));
        form.appendChild(input('c7-p', 'password', 'current-password', 'password', null, 'password'));
        wrap.appendChild(form);
        card.appendChild(wrap);
      }
    },
    {
      n: 8, tech: 'clip:rect', title: '8) clip: rect(0,0,0,0)', desc: 'Legacy clipping with absolute positioning.', build: (card) => {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'position:relative;';
        const form = document.createElement('form');
        form.className = 'zero-rect';
        form.appendChild(input('c8-u', 'username', 'username', 'username'));
        form.appendChild(input('c8-p', 'password', 'current-password', 'password', null, 'password'));
        wrap.appendChild(form);
        card.appendChild(wrap);
      }
    },
    {
      n: 9, tech: 'clip-path', title: '9) clip-path (fully clipped)', desc: 'For example: clip-path: inset(0 0 100% 0).', build: (card) => {
        const form = document.createElement('form');
        form.style.cssText = 'clip-path: inset(0 0 100% 0);';
        form.appendChild(input('c9-u', 'username', 'username', 'username'));
        form.appendChild(input('c9-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 10, tech: 'content-visibility', title: '10) content-visibility:hidden', desc: 'Content is skipped from rendering while retaining layout participation.', build: (card) => {
        const form = document.createElement('form');
        form.className = 'container-content-visibility';
        form.appendChild(input('c10-u', 'username', 'username', 'username'));
        form.appendChild(input('c10-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 11, tech: 'transform:scale(0)', title: '11) transform: scale(0)', desc: 'Geometric scaling to zero; element visually disappears.', build: (card) => {
        const form = document.createElement('form');
        form.style.cssText = 'transform: scale(0); transform-origin: top left;';
        form.appendChild(input('c11-u', 'username', 'username', 'username'));
        form.appendChild(input('c11-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 12, tech: 'negative-z + overlay', title: '12) Negative z-index + overlay', desc: 'Lowered under an overlay element to block interaction/visibility.', build: (card) => {
        const wrap = document.createElement('div');
        wrap.className = 'covered-wrap';
        wrap.style.minHeight = '48px';
        const form = document.createElement('form');
        form.className = 'negative-z';
        form.appendChild(input('c12-u', 'username', 'username', 'username'));
        form.appendChild(input('c12-p', 'password', 'current-password', 'password', null, 'password'));
        const cover = document.createElement('div');
        cover.className = 'coverer';
        wrap.appendChild(form);
        wrap.appendChild(cover);
        card.appendChild(wrap);
      }
    },
    {
      n: 13, tech: 'hidden attribute', title: '13) HTML hidden attribute', desc: 'Semantic hiding using hidden.', build: (card) => {
        const form = document.createElement('form');
        form.setAttribute('hidden', '');
        form.appendChild(input('c13-u', 'username', 'username', 'username'));
        form.appendChild(input('c13-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 14, tech: 'details summary', title: '14) <details> collapsed', desc: 'Hidden by default inside a collapsed details element.', build: (card) => {
        const details = document.createElement('details');
        details.id = 'd14-thirdparty';
        const summary = document.createElement('summary');
        summary.textContent = '(Click to expand for comparison)';
        const form = document.createElement('form');
        form.appendChild(input('c14-u', 'username', 'username', 'username'));
        form.appendChild(input('c14-p', 'password', 'current-password', 'password', null, 'password'));
        details.appendChild(summary);
        details.appendChild(form);
        card.appendChild(details);
      }
    },
    {
      n: 15, tech: 'sr-only visually-hidden', title: '15) Screen-reader-only (sr-only)', desc: 'Visually hidden, available to assistive technologies.', build: (card) => {
        const form = document.createElement('form');
        form.className = 'sr-only';
        form.appendChild(input('c15-u', 'username', 'username', 'username'));
        form.appendChild(input('c15-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 16, tech: 'ancestor visibility hidden', title: '16) Ancestor visibility:hidden', desc: 'Hidden via an invisible ancestor; children inherit invisibility.', build: (card) => {
        const wrap = document.createElement('div');
        wrap.className = 'container-hidden';
        const form = document.createElement('form');
        form.appendChild(input('c16-u', 'username', 'username', 'username'));
        form.appendChild(input('c16-p', 'password', 'current-password', 'password', null, 'password'));
        wrap.appendChild(form);
        card.appendChild(wrap);
      }
    },
    {
      n: 17, tech: 'mask-image', title: '17) CSS mask-image (fully masked)', desc: 'Masked with a fully transparent mask so content is not painted.', build: (card) => {
        const form = document.createElement('form');
        form.setAttribute('style', '-webkit-mask-image:linear-gradient(transparent,transparent); mask-image:linear-gradient(transparent,transparent);');
        form.appendChild(input('c17-u', 'username', 'username', 'username'));
        form.appendChild(input('c17-p', 'password', 'current-password', 'password', null, 'password'));
        card.appendChild(form);
      }
    },
    {
      n: 18, tech: 'shadow-dom', title: '18) Shadow DOM', desc: 'Inputs placed inside an open ShadowRoot of a custom element.', build: (card) => {
        const host = document.createElement('x-shadow-host'); // IMPORTANT: compatible with PoC collector script
        host.id = 'shadowHost-thirdparty';
        card.appendChild(host);

        // Populate shadow root similarly to loginForm.html expectations
        const root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : null;
        if (root) {
          const style = document.createElement('style');
          style.textContent = `.hidden { clip-path: inset(0 0 100% 0); opacity: 0; }`;
          const wrap = document.createElement('div');
          wrap.className = 'hidden';
          wrap.innerHTML = `<form>
          <input id="c18-u" name="username" autocomplete="username" placeholder="username">
          <input id="c18-p" name="password" autocomplete="current-password" type="password" placeholder="password">
        </form>`;
          root.appendChild(style);
          root.appendChild(wrap);
        }
      }
    },
    {
      n: 19, tech: 'iframe 1x1/offscreen', title: '19) iframe (1×1 / off-screen)', desc: 'Form hosted inside a tiny iframe; initially too small to notice.', build: (card) => {
        const fr = document.createElement('iframe');
        fr.id = 'tinyFrame-thirdparty';
        fr.setAttribute('sandbox', 'allow-scripts');
        fr.setAttribute('srcdoc', [
          '<!DOCTYPE html><html><body style="margin:0">',
          '<form style="width:1px;height:1px; overflow:hidden">',
          '<input name="username" autocomplete="username" placeholder="u">',
          '<input name="password" autocomplete="current-password" type="password" placeholder="p">',
          '</form>',
          '</body></html>'
        ].join(''));
        fr.setAttribute('style', 'width:1px;height:1px;border:0; overflow:hidden; opacity:0;');
        card.appendChild(fr);
      }
    },
    {
      n: 20, tech: 'text-indent/font-size/zero-height', title: '20) Combined tricks', desc: 'Uses negative text-indent, zero height, no border/padding/margin.', build: (card) => {
        const form = document.createElement('form');
        form.appendChild(input('c20-u', 'username', 'username', 'username', 'text-indent:-9999px; height:0; border:0; padding:0; margin:0;'));
        form.appendChild(input('c20-p', 'password', 'current-password', 'password', 'text-indent:-9999px; height:0; border:0; padding:0; margin:0;', 'password'));
        card.appendChild(form);
      }
    },
  ];

  function input(id, name, ac, ph, style, type, cls) {
    const el = document.createElement('input');
    el.id = id;
    el.name = name;
    el.autocomplete = ac;
    el.placeholder = ph;
    el.type = type || 'text';
    if (cls) el.className = cls;
    if (style) el.style.cssText = style;
    return el;
  }

  // Render cards
  CARDS.forEach(c => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.tech = c.tech;

    const h3 = document.createElement('h3');
    h3.textContent = c.title;
    const p = document.createElement('p');
    p.textContent = c.desc;

    card.appendChild(h3);
    card.appendChild(p);
    c.build(card);

    grid.appendChild(card);
  });

  // Mark injector for debugging / attribution
  grid.setAttribute('data-injected-by', 'thirdparty-sameorigin');
  console.log('[thirdparty_sameorigin] injected grid cards into #grid');
})();