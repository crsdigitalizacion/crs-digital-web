(function(){
  var d=document.documentElement; d.classList.add('js');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  try{if('scrollRestoration' in history)history.scrollRestoration='manual';}catch(e){}
  function goTop(hash){ if(hash){var t=document.getElementById(hash);if(t){t.scrollIntoView({behavior:'instant'});return;}} window.scrollTo({top:0,left:0,behavior:'instant'}); }
  var moved=false;['wheel','touchstart','keydown'].forEach(function(ev){addEventListener(ev,function(){moved=true;},{passive:true,once:true});});
  goTop(location.hash.slice(1)); addEventListener('load',function(){if(!moved)goTop(location.hash.slice(1));});

  var CONFIG={FORM_ENDPOINT:'https://script.google.com/macros/s/AKfycbxxAbSts9-PPwv3uQpsvSqFiBoMgD1HXjS_3GVioNIDkRAtGBrzfCb3-nlsU-_c_AEGcw/exec',GA_ID:'G-1EW6MSPN20',META_PIXEL_ID:''};
  /* ---------- Google Analytics y Píxel de Meta: solo con permiso ---------- */
  function loadAnalytics(){ if(!CONFIG.GA_ID||window._gaLoaded)return; window._gaLoaded=true;
    var sc=document.createElement('script');sc.async=true;sc.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(CONFIG.GA_ID);document.head.appendChild(sc);
    window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',CONFIG.GA_ID); }
  function loadMeta(){ if(!CONFIG.META_PIXEL_ID||window._fbLoaded)return; window._fbLoaded=true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init',CONFIG.META_PIXEL_ID);window.fbq('track','PageView'); }
  var CKEY='crs_consent_v1',cookieEl=document.getElementById('cookie'),prefsEl=document.getElementById('cprefs');
  function readConsent(){try{var v=JSON.parse(localStorage.getItem(CKEY)||'null');if(v&&(Date.now()-v.ts)<365*864e5)return v;}catch(e){}return null;}
  function saveConsent(an,mk){var v={necessary:true,analytics:!!an,marketing:!!mk,ts:Date.now()};try{localStorage.setItem(CKEY,JSON.stringify(v));}catch(e){}window.crsConsent=v;}
  function applyConsent(){var c=window.crsConsent||{};if(c.analytics)loadAnalytics();if(c.marketing)loadMeta();}
  var stored=readConsent(); window.crsConsent=stored||{necessary:true,analytics:false,marketing:false};
  if(!stored&&cookieEl)cookieEl.hidden=false; applyConsent();
  var lastFocus=null;
  function openPrefs(){var c=window.crsConsent||{};document.getElementById('c-an').checked=!!c.analytics;document.getElementById('c-mk').checked=!!c.marketing;lastFocus=document.activeElement;prefsEl.hidden=false;var x=prefsEl.querySelector('.x');if(x)x.focus();}
  function closePrefs(){prefsEl.hidden=true;if(lastFocus&&lastFocus.focus)lastFocus.focus();}
  document.addEventListener('click',function(e){
    var el=e.target.closest?e.target.closest('[data-c],[data-close],[data-prefs],[data-wipe]'):null; if(!el)return;
    if(el.hasAttribute('data-wipe')){e.preventDefault();
      try{localStorage.removeItem(CKEY);}catch(x){}
      try{document.cookie.split(';').forEach(function(c){var n=c.split('=')[0].trim();if(/^(_ga|_gid|_gat|_fbp|_fbc)/.test(n)){var parts=location.hostname.split('.');for(var i=0;i<parts.length;i++){var dm=parts.slice(i).join('.');document.cookie=n+'=; Max-Age=0; path=/; domain=.'+dm;document.cookie=n+'=; Max-Age=0; path=/; domain='+dm;}document.cookie=n+'=; Max-Age=0; path=/';}});}catch(x){}
      el.textContent='Hecho: tus datos de este navegador se han borrado';setTimeout(function(){location.reload();},1200);return;}
    if(el.hasAttribute('data-prefs')){e.preventDefault();openPrefs();return;}
    if(el.hasAttribute('data-close')){closePrefs();return;}
    var c=el.getAttribute('data-c'),prev=window.crsConsent||{};
    if(c==='accept')saveConsent(true,true);else if(c==='reject')saveConsent(false,false);else if(c==='save')saveConsent(document.getElementById('c-an').checked,document.getElementById('c-mk').checked);
    var cur=window.crsConsent; if(cookieEl)cookieEl.hidden=true; prefsEl.hidden=true;
    if((prev.analytics&&!cur.analytics)||(prev.marketing&&!cur.marketing)){location.reload();return;}
    applyConsent();
  });
  if(prefsEl)prefsEl.addEventListener('click',function(e){if(e.target===prefsEl)closePrefs();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&prefsEl&&!prefsEl.hidden)closePrefs();});

  /* ---------- menú (una sola vez) ---------- */
  var bur=document.getElementById('burger'),nav=document.getElementById('nav');
  function closeMenu(){if(nav&&nav.classList.contains('open')){nav.classList.remove('open');bur.setAttribute('aria-expanded','false');bur.setAttribute('aria-label','Abrir menú');}}
  if(bur&&nav){bur.addEventListener('click',function(){var o=nav.classList.toggle('open');bur.setAttribute('aria-expanded',o?'true':'false');bur.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();bur.focus();}});}

  /* ---------- estado de la página actual ---------- */
  var S={gen:0,obs:[],timers:[]};
  function teardown(){S.obs.forEach(function(o){o.disconnect();});S.timers.forEach(clearInterval);S={gen:S.gen+1,obs:[],timers:[]};}
  function IO(cb,opt){if(!('IntersectionObserver' in window))return null;var o=new IntersectionObserver(cb,opt);S.obs.push(o);return o;}

  function initPage(){
    var G=S.gen, root=document.querySelector('main');
    /* aparición ligada al scroll */
    var rv=[].slice.call(root.querySelectorAll('.rv'));
    if(!reduce&&rv.length){
      var items=[],mob=false,maxS=0;
      var measure=function(){
        mob=innerWidth<760;
        rv.forEach(function(el){el.style.transform='';el.style.opacity='';el.classList.remove('anim');});
        items=rv.map(function(el){return {el:el,top:el.getBoundingClientRect().top+scrollY,d:0,k:el.classList.contains('whole')?'w':el.classList.contains('tilt')?'t':el.classList.contains('from-l')?'l':el.classList.contains('from-r')?'r':'u'};});
        [].forEach.call(root.querySelectorAll('[data-cascade]'),function(g){var row=0,last=null;[].forEach.call(g.children,function(c){var its=items.filter(function(x){return x.el===c||c.contains(x.el);});if(!its.length)return;var t0=its[0].top;if(last!==null&&Math.abs(t0-last)<12)row++;else row=0;last=t0;its.forEach(function(it){it.d=Math.min(row*.14,.45);});});});
        apply();
      };
      var ease=function(x){return x*x*(3-2*x);};
      var apply=function(){
        var vh=innerHeight,y=scrollY;maxS=document.documentElement.scrollHeight-vh;
        items.forEach(function(it){
          var end=Math.max(it.k==='u'?vh*.6:(it.k==='w'?vh*.45:vh*.35),it.top-maxS), start=Math.max(vh*1.0,end+120);
          var raw=(start-(it.top-y))/(start-end), p=Math.max(0,Math.min(1,(raw-it.d)/(1-it.d))), el=it.el;
          if(p>=1){if(it.on){it.on=false;el.style.transform='';el.style.opacity='';el.classList.remove('anim');}return;}
          if(!it.on){it.on=true;el.classList.add('anim');}
          var e=ease(p),q=1-e,m=mob?.85:1,tr,img=it.k!=='u';
          if(it.k==='t')tr='perspective(1200px) rotateX('+(9*q*m).toFixed(2)+'deg) translateY('+(14*q).toFixed(1)+'px)';
          else if(it.k==='l')tr='perspective(1400px) translateX('+(-14*q*m).toFixed(1)+'px) rotateY('+(7*q*m).toFixed(2)+'deg)';
          else if(it.k==='r')tr='perspective(1400px) translateX('+(14*q*m).toFixed(1)+'px) rotateY('+(-7*q*m).toFixed(2)+'deg)';
          else if(it.k==='w')tr='translateY('+(36*q).toFixed(1)+'px) scale('+(.97+.03*e).toFixed(4)+')';
          else tr='translateY('+(14*q).toFixed(1)+'px)';
          el.style.transform=tr; el.style.opacity=(img?1:Math.min(1,.45+p*2.4)).toFixed(3);
        });
      };
      S.rvApply=apply; S.rvMeasure=measure; measure();
    }
    /* relieve */
    var lay=[].slice.call(root.querySelectorAll('[data-depth]')),L=[];
    if(!reduce&&lay.length){
      S.parMeasure=function(){var y=scrollY;L=lay.map(function(el){var h=el.closest('.comp,.shot,.pb-dev')||el.parentNode;var r=h.getBoundingClientRect();return {el:el,c:r.top+y+r.height/2,dp:+el.dataset.depth,v:null};});};
      S.par=function(){var vh=innerHeight,y=scrollY,k=innerWidth<760?.6:1;L.forEach(function(it){var c=it.c-y-vh/2;if(Math.abs(c)>vh*1.3)return;var v=Math.round(Math.max(-44,Math.min(44,-c*it.dp*k))*2)/2;if(v!==it.v){it.v=v;it.el.style.setProperty('--py',v+'px');}});};
      S.parMeasure();S.par();
    }
    /* portada */
    var rig=root.querySelector('#rig'),hero=root.querySelector('.hero2'),heroVis=true;
    if(rig&&hero){
      var scene=rig.parentNode; scene.classList.add('in');
      var small=innerWidth<760, BX=small?1.5:3, BY=small?-3:-6, loopRun=false;
      rig.style.setProperty('--rx',BX+'deg');rig.style.setProperty('--ry',BY+'deg');
      var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
      var loop=function(t){if(G!==S.gen||!heroVis){loopRun=false;return;}loopRun=true;var q=t/1000;rig.style.setProperty('--ry',(BY+Math.sin(q*.5)*3).toFixed(2)+'deg');rig.style.setProperty('--rx',(BX+Math.sin(q*.37)*1.2).toFixed(2)+'deg');requestAnimationFrame(loop);};
      var tilt=!rig.classList.contains('mock');
      var io=IO(function(e){heroVis=e[0].isIntersecting;if(tilt&&heroVis&&!fine&&!reduce&&!loopRun)requestAnimationFrame(loop);}); if(io)io.observe(hero);
      if(!reduce&&tilt){
        if(fine){
          rig.style.transition='transform .6s cubic-bezier(.2,.7,.2,1)';
          hero.addEventListener('mousemove',function(e){var r=scene.getBoundingClientRect();var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;rig.style.setProperty('--ry',(BY+x*8).toFixed(2)+'deg');rig.style.setProperty('--rx',(BX-y*5).toFixed(2)+'deg');});
          hero.addEventListener('mouseleave',function(){rig.style.setProperty('--ry',BY+'deg');rig.style.setProperty('--rx',BX+'deg');});
        } else { rig.style.transition='none'; requestAnimationFrame(loop); }
      }
      var HS=[].slice.call(root.querySelectorAll('#hs .sl')),HP=[].slice.call(root.querySelectorAll('#hp .sl')),DOTS=[].slice.call(root.querySelectorAll('.pick .dots button')),cur=0,manual=false,N=HS.length;
      /* deslizamiento: el proyecto que sale se va hacia un lado y el nuevo entra por el otro, sin mezclarse */
      var EZ='transform .75s cubic-bezier(.65,0,.35,1)',slideTok=0;
      var slide=function(list,from,to,dir,delay){var a=list[from],b=list[to];if(!a||!b)return;
        b.style.transition='none';b.style.transform='translateX('+(dir*101)+'%)';b.offsetWidth;
        var t=reduce?'none':EZ+(delay?' '+delay+'s':'');b.style.transition=t;a.style.transition=t;
        b.style.visibility='visible';b.style.transform='translateX(0)';a.style.transform='translateX('+(-dir*101)+'%)';
        var tk=++slideTok;setTimeout(function(){if(tk===slideTok||a!==list[cur])a.style.visibility=a===list[cur]?'visible':'hidden';},reduce?0:900);};
      var show=function(n,dir){if(n===cur)return;dir=dir||(n>cur?1:-1);slide(HS,cur,n,dir,0);slide(HP,cur,n,dir,.06);cur=n;
        DOTS.forEach(function(b,k){if(k===n)b.setAttribute('aria-current','true');else b.removeAttribute('aria-current');});};
      HS.concat(HP).forEach(function(e){var on=e.classList.contains('on');e.style.transform=on?'translateX(0)':'translateX(101%)';e.style.visibility=on?'visible':'hidden';});
      var hand=function(n,dir){manual=true;S.timers.forEach(clearInterval);show((n+N)%N,dir);};
      DOTS.forEach(function(b,k){b.addEventListener('click',function(){hand(k,k>cur?1:-1);});});
      var pv=root.querySelector('.pick .prev'),nx=root.querySelector('.pick .next');
      if(pv)pv.addEventListener('click',function(){hand(cur-1,-1);}); if(nx)nx.addEventListener('click',function(){hand(cur+1,1);});
      var sx=null,sy=0;
      scene.addEventListener('touchstart',function(e){sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
      scene.addEventListener('touchend',function(e){if(sx===null)return;var dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;sx=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.3)hand(cur+(dx<0?1:-1),dx<0?1:-1);},{passive:true});
      if(!reduce)S.timers.push(setInterval(function(){if(!manual&&heroVis&&!document.hidden)show((cur+1)%N,1);},5500));
    }
    /* del boceto a la web */
    var B=root.querySelector('.build');
    if(B){
      var BST=[].slice.call(B.querySelectorAll('.b-steps li')),stick=B.querySelector('.b-stick');
      var cl=function(x){return Math.max(0,Math.min(1,x));};
      S.b=function(){
        var r=B.getBoundingClientRect(),vh=innerHeight;if(r.bottom<-100||r.top>vh+100)return;
        var st=stick.offsetHeight,lead=vh*.45,p=reduce?1:cl((-r.top+(document.querySelector('.top')||{offsetHeight:68}).offsetHeight+lead)/(r.height-st+lead)),rr=cl((p-.4)/.3),ph=cl((p-.74)/.16);
        B.style.setProperty('--p',p.toFixed(4));B.style.setProperty('--r',rr.toFixed(4));B.style.setProperty('--ph',ph.toFixed(4));B.style.setProperty('--so',(rr>0.001&&rr<.999)?'1':'0');
        var idx=p<.4?0:(p<.74?1:2); BST.forEach(function(li,k){li.classList.toggle('on',k<=idx);li.classList.toggle('cur',k===idx);});
      };
      S.b();
    }
    /* escenas animadas */
    [].forEach.call(root.querySelectorAll('.sc'),function(sc){
      var els=[].slice.call(sc.querySelectorAll('[data-at]')),LP=+sc.getAttribute('data-loop')||7000;
      var fmt=function(n){return n.toLocaleString('es-ES');};
      if(reduce){els.forEach(function(e){if(!e.hasAttribute('data-until'))e.classList.add('on');if(e.hasAttribute('data-count'))e.textContent=fmt(+e.getAttribute('data-count'));});return;}
      var vis=false,run=false,t0=0,el0=0,last=-1;
      var frame=function(ts){
        if(G!==S.gen||!vis){run=false;el0=ts-t0;return;}
        var t=(ts-t0)%LP;
        if(t<last){els.forEach(function(e){e.classList.remove('on');if(e.hasAttribute('data-count'))e.textContent='0';});}
        last=t;
        els.forEach(function(e){var a=+e.getAttribute('data-at'),u=e.hasAttribute('data-until')?+e.getAttribute('data-until'):1e9,on=t>=a&&t<u&&t<LP-700;
          if(on!==e.classList.contains('on'))e.classList.toggle('on',on);
          if(on&&e.hasAttribute('data-count')){var k=Math.min(1,(t-a)/1300);k=1-Math.pow(1-k,3);var v=fmt(Math.round(+e.getAttribute('data-count')*k));if(e.textContent!==v)e.textContent=v;}});
        requestAnimationFrame(frame);};
      var o=IO(function(es){vis=es[0].isIntersecting;if(vis&&!run){run=true;requestAnimationFrame(function(ts){t0=ts-el0;frame(ts);});}},{threshold:.2}); if(o)o.observe(sc);
    });
    /* formulario de contacto */
    var f=root.querySelector('#form');
    if(f){
      var $=function(id){return root.querySelector('#'+id);},out=$('f-out'),btn=$('f-send'),okBox=$('f-ok'),startedAt=Date.now(),sending=false;
      var say=function(m,bad){out.textContent=m||'';out.hidden=!m;out.className='fmsg'+(bad?' bad':'');};
      var mark=function(el,bad){el.classList.toggle('bad-f',bad);el.setAttribute('aria-invalid',bad?'true':'false');};
      f.addEventListener('submit',function(e){
        e.preventDefault(); if(sending)return;
        var nm=$('f-name'),em=$('f-email'),ph=$('f-phone'),ck=$('f-consent');
        var d={name:nm.value.trim(),business:$('f-biz').value.trim(),email:em.value.trim(),phone:ph.value.trim(),
          needs:[].slice.call(f.querySelectorAll('input[name="needs"]:checked')).map(function(i){return i.value;}),message:$('f-msg').value.trim(),hp:$('f-web').value};
        [nm,em,ph].forEach(function(x){mark(x,false);});
        var phone=d.phone.replace(/[\s.\-()]/g,'');
        if(d.hp){f.hidden=true;okBox.hidden=false;return;}
        if(d.name.length<2){mark(nm,true);say('Escribe tu nombre para que sepamos a quién responder.',true);nm.focus();return;}
        if(!d.email&&!phone){mark(em,true);mark(ph,true);say('Déjanos un correo o un teléfono para poder contactarte.',true);em.focus();return;}
        if(d.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){mark(em,true);say('Revisa el correo electrónico.',true);em.focus();return;}
        if(phone&&!/^\+?\d{9,15}$/.test(phone)){mark(ph,true);say('Revisa el teléfono (solo números, con o sin +34).',true);ph.focus();return;}
        if(!ck.checked){say('Necesitamos que aceptes la política de privacidad para poder responderte.',true);ck.focus();return;}
        sending=true;btn.disabled=true;say('Enviando…');
        var payload={name:d.name,business:d.business,email:d.email,phone:d.phone,needs:d.needs,message:d.message,consent:true,policy:'2026-10',elapsed:Date.now()-startedAt,token:''};
        var req=CONFIG.FORM_ENDPOINT?fetch(CONFIG.FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(function(r){return r.json();})
                                    :new Promise(function(r){setTimeout(function(){r({ok:true,demo:true});},700);});
        req.then(function(res){
          if(!res||!res.ok)throw 0;
          say('');f.hidden=true;okBox.hidden=false;
          $('f-ok-txt').textContent=d.email?'Nos pondremos en contacto contigo lo antes posible.':'Te llamaremos o te escribiremos por WhatsApp lo antes posible.';
          $('f-ok-spam').hidden=!(d.email&&!res.demo);$('f-ok-demo').hidden=!res.demo;
          try{okBox.scrollIntoView({block:'center',behavior:'smooth'});}catch(x){}
          var c=window.crsConsent||{}; if(window.gtag&&c.analytics)window.gtag('event','generate_lead'); if(window.fbq&&c.marketing)window.fbq('track','Lead');
        }).catch(function(){say('No hemos podido enviarlo. Inténtalo de nuevo o escríbenos por WhatsApp o correo.',true);})
          .then(function(){sending=false;btn.disabled=false;});
      });
      $('f-again').addEventListener('click',function(){f.reset();f.hidden=false;okBox.hidden=true;say('');startedAt=Date.now();});
    }
  }

  /* ---------- bucle de scroll y medidas (una sola vez) ---------- */
  var rt=false;
  addEventListener('scroll',function(){if(rt)return;rt=true;requestAnimationFrame(function(){rt=false;if(S.rvApply)S.rvApply();if(S.b)S.b();if(S.par)S.par();});},{passive:true});
  var mt=null; function remeasure(){clearTimeout(mt);mt=setTimeout(function(){if(S.rvMeasure)S.rvMeasure();if(S.parMeasure){S.parMeasure();S.par();}if(S.b)S.b();},80);}
  addEventListener('resize',remeasure); addEventListener('load',remeasure);
  if('ResizeObserver' in window){var lastH=0;new ResizeObserver(function(){var h=document.documentElement.scrollHeight;if(Math.abs(h-lastH)>2){lastH=h;remeasure();}}).observe(document.body);}

  /* ---------- navegación sin recarga ---------- */
  var cache={};
  function file(u){var f=(u||'').split('#')[0].split('?')[0].split('/').pop();return f||'index.html';}
  function load(u){var k=file(u);if(!cache[k])cache[k]=fetch(k,{credentials:'same-origin'}).then(function(r){if(!r.ok)throw 0;return r.text();}).catch(function(e){delete cache[k];throw e;});return cache[k];}
  var imgDone={};
  function warm(html,limit){var doc=new DOMParser().parseFromString(html,'text/html');var srcs=[].slice.call(doc.querySelectorAll('main img')).map(function(i){return i.getAttribute('src');}).filter(Boolean);
    var ps=srcs.slice(0,limit||99).map(function(src){if(!imgDone[src]){var im=new Image();im.decoding='async';im.src=src;imgDone[src]=(im.decode?im.decode():Promise.resolve()).catch(function(){});}return imgDone[src];});return Promise.all(ps);}
  function setCurrent(f){[].forEach.call(document.querySelectorAll('#nav a'),function(a){if(file(a.getAttribute('href'))===f)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});}
  var busy=false;
  function go(href,push){
    if(busy)return; busy=true; closeMenu();
    var f=file(href),hash=(href.split('#')[1]||''),main=document.querySelector('main');
    var out=new Promise(function(res){ if(reduce){res();return;} main.style.transition='opacity .2s ease-in-out'; main.style.opacity='0'; setTimeout(res,200); });
    Promise.all([load(f).then(function(h){return Promise.race([warm(h,3),new Promise(function(r){setTimeout(r,700);})]).then(function(){return h;});}),out]).then(function(r){
      var doc=new DOMParser().parseFromString(r[0],'text/html'),nm=doc.querySelector('main');
      if(!nm)throw 0;
      teardown();
      main.style.transition='none'; main.style.opacity='0';
      main.innerHTML=nm.innerHTML;
      if(doc.title)document.title=doc.title;
      setCurrent(f);
      if(push){try{history.pushState({f:f},'',f+(hash?'#'+hash:''));}catch(e){}}
      if(window.fbq&&(window.crsConsent||{}).marketing)try{window.fbq('track','PageView');}catch(e){}
      goTop(hash);
      initPage();
      requestAnimationFrame(function(){requestAnimationFrame(function(){main.style.transition=reduce?'none':'opacity .25s ease-out';main.style.opacity='1';busy=false;});});
      remeasure();
    }).catch(function(){busy=false;location.href=href;});
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]'); if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var h=a.getAttribute('href'); if(!h||a.target==='_blank'||/^(https?:|mailto:|tel:)/.test(h))return;
    if(h.charAt(0)==='#'){var t=document.getElementById(h.slice(1));if(t){e.preventDefault();closeMenu();t.scrollIntoView({behavior:reduce?'auto':'smooth'});}return;}
    if(!/\.html(#.*)?$/.test(h))return;
    e.preventDefault();
    if(file(h)===file(location.pathname)){closeMenu();var hs=h.split('#')[1];if(hs){var t2=document.getElementById(hs);if(t2)t2.scrollIntoView({behavior:reduce?'auto':'smooth'});}else window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});return;}
    go(h,true);
  });
  window.addEventListener('popstate',function(){go(file(location.pathname)+location.hash,false);});
  /* precarga de las otras páginas para que el cambio sea inmediato */
  var pre=function(){['index.html','servicios.html','proyectos.html','nosotros.html','aviso-legal.html','privacidad.html','cookies.html','terminos.html','borrar-datos.html'].slice(0,4).forEach(function(p){if(p!==file(location.pathname))load(p).then(function(h){warm(h);}).catch(function(){});});};
  if('requestIdleCallback' in window)requestIdleCallback(pre,{timeout:2500});else setTimeout(pre,1500);

  initPage();
})();
