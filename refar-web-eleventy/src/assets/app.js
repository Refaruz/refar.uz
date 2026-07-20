// ============================================================
// REFAR — асосий скрипт: Supabase, auth ҳолати, тил алмаштиргич
// ============================================================
(function(){
  var cfg = window.REFAR_CONFIG || {};
  window.sb = null;
  try {
    if (window.supabase && cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
        cfg.SUPABASE_URL.indexOf('supabase.co') > -1) {
      window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
    }
  } catch(e){ console.warn('Supabase init:', e); }

  // ---------- ТИЛ ----------
  function getLang(){ return window.REFAR_getLang(); }
  function setLang(l){
    localStorage.setItem('refar_lang', l);
    document.documentElement.lang = l;
    applyI18n();
    renderLangSwitch();
  }
  window.REFAR_setLang = setLang;

  function applyI18n(){
    var lang = getLang();
    // 1) data-i18n калитлари (янги саҳифалар)
    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var k = el.getAttribute('data-i18n');
      var v = window.REFAR_t(k);
      if (v && v !== k) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
      var k = el.getAttribute('data-i18n-ph');
      var v = window.REFAR_t(k);
      if (v && v !== k) el.setAttribute('placeholder', v);
    });
    // 2) Мавжуд саҳifalar чромаси: русча матн → тил (nav/footer/tugma)
    if (lang !== 'ru') {
      var map = window.REFAR_RU2KEY || {};
      document.querySelectorAll('.nav a, .ft-col a, .ft-col .t, .hbtn, .hlink, .lang').forEach(function(el){
        if (el.querySelector('*')) return; // фақат оддий матнли
        var txt = (el.getAttribute('data-ru') || el.textContent).trim();
        if (!el.getAttribute('data-ru')) el.setAttribute('data-ru', txt);
        var key = map[txt];
        if (key){
          var t = window.REFAR_I18N[key][lang];
          if (t) el.textContent = t;
        }
      });
    } else {
      // русчага қайтариш
      document.querySelectorAll('[data-ru]').forEach(function(el){
        if (el.classList.contains('lang')) return;
        el.textContent = el.getAttribute('data-ru');
      });
    }
  }
  window.REFAR_applyI18n = applyI18n;

  function renderLangSwitch(){
    var box = document.getElementById('refar-lang');
    if (!box) return;
    var cur = getLang();
    var langs = [['uz','UZ'],['ru','RU'],['en','EN']];
    box.innerHTML = langs.map(function(l){
      return '<span class="rl'+(l[0]===cur?' on':'')+'" data-l="'+l[0]+'">'+l[1]+'</span>';
    }).join('');
    box.querySelectorAll('.rl').forEach(function(s){
      s.addEventListener('click', function(){ setLang(s.getAttribute('data-l')); });
    });
  }

  // ---------- HEADER ENHANCE (тил + auth ҳолати) ----------
  async function enhanceHeader(){
    var right = document.querySelector('.hdr-right');
    if (!right){
      var hin = document.querySelector('.hdr-in');
      if (!hin) return;
      right = document.createElement('div');
      right.className = 'hdr-right';
      right.style.cssText = 'display:flex;gap:14px;align-items:center;margin-left:auto;';
      var btns = hin.querySelectorAll(':scope > .hbtn, :scope > .hlink, :scope > .lang');
      hin.appendChild(right);
      btns.forEach(function(b){ right.appendChild(b); });
    }
    // тил алмаштиргич қўшиш (агар йўқ бўлса)
    if (!document.getElementById('refar-lang')){
      var lang = document.createElement('div');
      lang.id = 'refar-lang'; lang.className = 'refar-lang';
      // мавжуд .lang (RU) элементини алмаштирамиз ёки бошига қўямиз
      var oldLang = right.querySelector('.lang');
      if (oldLang) right.replaceChild(lang, oldLang);
      else right.insertBefore(lang, right.firstChild);
    }
    renderLangSwitch();

    if (!window.sb) return;
    try {
      var { data:{ user } } = await window.sb.auth.getUser();
      var loginBtn = right.querySelector('.hbtn.ghost, .hlink.ghost');
      if (user){
        // профил (роль)
        var prof = null;
        try { var r = await window.sb.from('web_profiles').select('role,full_name').eq('id',user.id).single(); prof = r.data; } catch(e){}
        if (loginBtn){
          loginBtn.textContent = window.REFAR_t('btn.cabinet');
          loginBtn.setAttribute('href','cabinet.html');
          if (loginBtn.tagName==='SPAN'){ var a=document.createElement('a'); a.className=loginBtn.className; a.href='cabinet.html'; a.textContent=loginBtn.textContent; loginBtn.replaceWith(a); loginBtn=a; }
        }
        // админ линки
        if (prof && prof.role==='admin' && !document.getElementById('refar-admin-link')){
          var al = document.createElement('a'); al.id='refar-admin-link'; al.className='hbtn ghost';
          al.href='admin.html'; al.textContent=window.REFAR_t('btn.admin');
          al.style.background='#1B2A4A'; al.style.color='#fff'; al.style.borderColor='#1B2A4A';
          right.insertBefore(al, loginBtn);
        }
      } else {
        if (loginBtn){ loginBtn.setAttribute('href','login.html'); if(loginBtn.tagName==='SPAN'){var a=document.createElement('a'); a.className=loginBtn.className; a.href='login.html'; a.textContent=loginBtn.textContent; loginBtn.replaceWith(a);} }
      }
    } catch(e){ console.warn('auth header', e); }
  }

  // ---------- HELPERS (бошқа саҳифалар учун) ----------
  window.REFAR = {
    sb: function(){ return window.sb; },
    async user(){ if(!window.sb) return null; try{ var {data}=await window.sb.auth.getUser(); return data.user; }catch(e){ return null; } },
    async profile(){ var u=await this.user(); if(!u||!window.sb) return null; try{ var {data}=await window.sb.from('web_profiles').select('*').eq('id',u.id).single(); return data; }catch(e){ return null; } },
    async logout(){ if(window.sb) await window.sb.auth.signOut(); location.href='index.html'; },
    t: window.REFAR_t, setLang: setLang, getLang: getLang, applyI18n: applyI18n
  };

  document.addEventListener('DOMContentLoaded', function(){
    document.documentElement.lang = getLang();
    enhanceHeader();
    applyI18n();
  });
})();
