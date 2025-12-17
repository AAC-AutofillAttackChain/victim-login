/* thirdparty_sameorigin.js
   同域 third-party script：動態注入一組與 loginForm.html 相同的 20 種隱藏技術
   放在與 loginForm.html 同 origin，載入即 append 到 body 前端（或指定 target）。
*/
(function(){
  const TECHS = [
    { id: 'c1', tech: 'display:none', style: 'display:none' },
    { id: 'c2', tech: 'visibility:hidden', style: 'visibility:hidden' },
    { id: 'c3', tech: 'opacity:0', style: 'opacity:0' },
    { id: 'c4', tech: 'filter:opacity(0)', style: 'filter:opacity(0)' },
    { id: 'c5', tech: 'off-screen', cls: 'offscreen' },
    { id: 'c6', tech: 'tiny-size', cls: 'tiny' },
    { id: 'c7', tech: 'ancestor-overflow', wrapperStyle: 'height:0;overflow:hidden;border:1px dashed #ccc;' },
    { id: 'c8', tech: 'clip:rect', wrapperCls: 'zero-rect' },
    { id: 'c9', tech: 'clip-path', style: 'clip-path: inset(0 0 100% 0);' },
    { id: 'c10', tech: 'content-visibility', wrapperCls: 'container-content-visibility' },
    { id: 'c11', tech: 'transform:scale(0)', style: 'transform: scale(0); transform-origin: top left;' },
    { id: 'c12', tech: 'negative-z + overlay', wrapperHtml: '<div style="position:relative;"><form class="negative-z"></form><div class="coverer"></div></div>' },
    { id: 'c13', tech: 'hidden attribute', formAttr: 'hidden' },
    { id: 'c14', tech: 'details summary', kind: 'details' },
    { id: 'c15', tech: 'sr-only visually-hidden', wrapperCls: 'sr-only' },
    { id: 'c16', tech: 'ancestor visibility hidden', wrapperCls: 'container-hidden' },
    { id: 'c17', tech: 'mask-image', formStyle: '-webkit-mask-image:linear-gradient(transparent,transparent); mask-image:linear-gradient(transparent,transparent);' },
    { id: 'c18', tech: 'shadow-dom', shadowHost: true },
    { id: 'c19', tech: 'iframe 1x1/offscreen', iframeTiny: true },
    { id: 'c20', tech: 'text-indent/font-size/zero-height', style: "text-indent:-9999px; height:0; border:0; padding:0; margin:0;" }
  ];

  // create container
  const container = document.createElement('div');
  container.id = 'thirdparty-injected';
  container.setAttribute('data-injected-by','thirdparty-sameorigin');
  container.style.padding = '8px';
  container.style.marginTop = '12px';
  container.style.border = '2px dashed #cfc';

  // title for easy location in DOM
  const h = document.createElement('h3');
  h.textContent = '=== thirdparty: injected hidden-tech test set ===';
  container.appendChild(h);

  TECHS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.tech = t.tech;
    card.style.margin = '6px 0';
    const title = document.createElement('h4');
    title.textContent = `${t.tech}`;
    card.appendChild(title);

    // wrapper (for some techniques)
    let form, wrapper;
    if (t.wrapperHtml) {
      // special pre-built wrapper (for negative-z+overlay)
      wrapper = document.createElement('div');
      wrapper.innerHTML = t.wrapperHtml;
      // find the form inside
      form = wrapper.querySelector('form');
    } else if (t.wrapperCls) {
      wrapper = document.createElement('div');
      wrapper.className = t.wrapperCls;
      form = document.createElement('form');
      wrapper.appendChild(form);
      if (t.wrapperStyle) wrapper.style.cssText = t.wrapperStyle;
    } else if (t.kind === 'details') {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'thirdparty (detail) summary';
      details.appendChild(summary);
      form = document.createElement('form');
      details.appendChild(form);
      wrapper = details;
    } else {
      form = document.createElement('form');
    }

    // if formAttr like hidden
    if (t.formAttr && form) form.setAttribute(t.formAttr, '');

    // create inputs inside form (username/password)
    if (form) {
      const iu = document.createElement('input');
      iu.type = 'text';
      iu.name = 'username';
      iu.autocomplete = 'username';
      iu.placeholder = 'username';
      iu.id = `${t.id}-u`;
      // apply styles/classes if specified
      if (t.style && !t.shadowHost && !t.iframeTiny) iu.style.cssText = t.style;
      if (t.cls) iu.className = t.cls;
      form.appendChild(iu);

      const ip = document.createElement('input');
      ip.type = 'password';
      ip.name = 'password';
      ip.autocomplete = 'current-password';
      ip.placeholder = 'password';
      ip.id = `${t.id}-p`;
      if (t.style && !t.shadowHost && !t.iframeTiny) ip.style.cssText = t.style;
      if (t.cls) ip.className = t.cls;
      form.appendChild(ip);
    }

    // attach wrapper/form to card
    if (wrapper) card.appendChild(wrapper);
    else if (form) card.appendChild(form);

    // special: shadow DOM
    if (t.shadowHost) {
      // create a custom element as shadow host
      const host = document.createElement('x-shadow-host-thirdparty');
      host.id = `${t.id}-shadow`;
      // attach an open shadow root and populate
      const root = host.attachShadow ? host.attachShadow({mode:'open'}) : null;
      if (root) {
        const style = document.createElement('style');
        style.textContent = `.hidden { clip-path: inset(0 0 100% 0); }`;
        const wrap = document.createElement('div');
        wrap.className = 'hidden';
        wrap.innerHTML = `<form><input name="username" autocomplete="username"><input name="password" autocomplete="current-password" type="password"></form>`;
        root.appendChild(style);
        root.appendChild(wrap);
      }
      card.appendChild(host);
    }

    // special: tiny iframe
    if (t.iframeTiny) {
      const fr = document.createElement('iframe');
      fr.style.width = '1px';
      fr.style.height = '1px';
      fr.style.border = '0';
      fr.setAttribute('sandbox','allow-scripts');
      fr.srcdoc = `<!doctype html><html><body style="margin:0"><form style="width:1px;height:1px;overflow:hidden"><input name="username" autocomplete="username" placeholder="u"><input name="password" autocomplete="current-password" type="password" placeholder="p"></form></body></html>`;
      card.appendChild(fr);
    }

    // add a small reveal button to be able to visually unhide during debugging
    const revealBtn = document.createElement('button');
    revealBtn.type = 'button';
    revealBtn.textContent = 'reveal (thirdparty)';
    revealBtn.style.marginLeft = '8px';
    revealBtn.addEventListener('click', () => {
      // naive: remove inline style and css classes that hide
      card.querySelectorAll('[style]').forEach(e => e.removeAttribute('style'));
      card.querySelectorAll('.offscreen, .tiny, .zero-rect, .sr-only, .container-hidden, .container-content-visibility').forEach(e => {
        e.classList.remove('offscreen','tiny','zero-rect','sr-only','container-hidden','container-content-visibility');
      });
      // grow iframes
      const f = card.querySelector('iframe');
      if (f) { f.style.width='320px'; f.style.height='120px'; f.style.border='1px solid #ddd'; }
      // open details
      const d = card.querySelector('details');
      if (d) d.open = true;
      // if shadow host exists, try to remove hidden class inside shadow root (best-effort)
      const host = card.querySelector('x-shadow-host-thirdparty');
      if (host && host.shadowRoot) {
        const s = host.shadowRoot.querySelector('.hidden');
        if (s) s.classList.remove('hidden');
      }
    });
    card.appendChild(revealBtn);

    container.appendChild(card);
  });

  // append to body (or a specific selector)
  document.body.appendChild(container);
  console.log('[thirdparty_sameorigin] injected hidden-tech test set');
}

)();
