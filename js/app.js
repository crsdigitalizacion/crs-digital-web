
(function(){
  /* ===== AJUSTES QUE SE RELLENAN AL CONFIGURAR EL ENVÍO Y LAS HERRAMIENTAS ===== */
  var CONFIG={
    FORM_ENDPOINT:'https://script.google.com/macros/s/AKfycbxxAbSts9-PPwv3uQpsvSqFiBoMgD1HXjS_3GVioNIDkRAtGBrzfCb3-nlsU-_c_AEGcw/exec',        // URL de la aplicación de Google Apps Script que recibe el formulario
    TURNSTILE_SITEKEY:'',    // clave pública de Cloudflare Turnstile (antispam)
    GA_ID:'G-1EW6MSPN20',                // Google Analytics 4, por ejemplo 'G-XXXXXXXXXX'
    META_PIXEL_ID:''         // Píxel de Meta, por ejemplo '123456789012345'
  };
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(pointer:fine)').matches;
  var isMobile=Math.min(innerWidth,innerHeight)<700||!fine;
  var tx=0,ty=0,px=0,py=0,sy=0,lastY=0,lastPtr=-1e9;
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  /* ---------- cabecera, barra de progreso y línea del proceso ---------- */
  var header=document.getElementById('top'),bar=document.getElementById('bar'),steps=document.getElementById('steps');
  var darks=[].slice.call(document.querySelectorAll('[data-tone="dark"]'));
  var hero=document.getElementById('hero'),hfade=document.getElementById('hfade');
  var pars=[].slice.call(document.querySelectorAll('.par')),stepEls=[].slice.call(document.querySelectorAll('.st')),heroCopy=document.getElementById('heroCopy');
  function onScroll(){
    sy=window.pageYOffset||0;
    var hh=hero?hero.offsetHeight:600;
    var probe=36, onDark=false;
    for(var di=0;di<darks.length;di++){
      var dr=darks[di].getBoundingClientRect(), pad=darks[di].getAttribute('data-pad')|0;
      var bot=darks[di]===hero?dr.top+dr.height*.5:dr.bottom-pad;
      if(dr.top+pad<=probe && bot>probe){ onDark=true; break; }
    }
    header.classList.toggle('light',!onDark);
    header.classList.toggle('gdark',onDark && sy>20);
    var h=document.documentElement.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(h>0?clamp(sy/h,0,1):0)+')';
    if(steps){
      var r=steps.getBoundingClientRect();
      var sp=clamp((innerHeight*0.7-r.top)/r.height,0,1);
      steps.style.setProperty('--p',sp.toFixed(3));
      for(var si=0;si<stepEls.length;si++) stepEls[si].classList.toggle('on',sp>=si/(stepEls.length-1)-.02);
    }
    if(!reduce){
      for(var i=0;i<pars.length;i++){
        var pr=pars[i].getBoundingClientRect();
        if(pr.bottom<-100||pr.top>innerHeight+100) continue;
        var rel=(pr.top+pr.height/2-innerHeight/2), off=rel*parseFloat(pars[i].getAttribute('data-speed'));
        var rx=clamp(rel/innerHeight,-1,1)*-9;
        pars[i].style.transform='translate3d(0,'+off.toFixed(1)+'px,0) rotateX('+rx.toFixed(2)+'deg)';
      }
      if(heroCopy && sy<hh) heroCopy.style.transform='translate3d(0,'+(sy*.22).toFixed(1)+'px,0)';
    }
  }
  addEventListener('scroll',onScroll,{passive:true}); addEventListener('resize',onScroll); onScroll();

  /* ---------- menú en móvil ---------- */
  var menuBtn=document.getElementById('menuBtn');
  function setMenu(open){ header.classList.toggle('open',open); menuBtn.setAttribute('aria-expanded',open?'true':'false'); menuBtn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú'); }
  if(menuBtn){
    menuBtn.addEventListener('click',function(){ setMenu(!header.classList.contains('open')); });
    [].slice.call(document.querySelectorAll('#mnav a')).forEach(function(a){ a.addEventListener('click',function(){ setMenu(false); }); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape' && header.classList.contains('open')){ setMenu(false); menuBtn.focus(); } });
    document.addEventListener('click',function(e){ if(header.classList.contains('open') && !header.contains(e.target)) setMenu(false); });
    addEventListener('resize',function(){ if(innerWidth>1000) setMenu(false); });
  }

  /* ---------- puntero ---------- */
  addEventListener('pointermove',function(e){
    tx=(e.clientX/innerWidth)*2-1; ty=(e.clientY/innerHeight)*2-1; lastPtr=performance.now();
    if(hero){ var r=hero.getBoundingClientRect(); hero.style.setProperty('--mx',(e.clientX-r.left)+'px'); hero.style.setProperty('--my',(e.clientY-r.top)+'px'); }
  },{passive:true});

  /* ---------- títulos que entran palabra a palabra ---------- */
  [].slice.call(document.querySelectorAll('.split')).forEach(function(el){
    var n=0;
    (function walk(node){
      [].slice.call(node.childNodes).forEach(function(k){
        if(k.nodeType===3){
          var frag=document.createDocumentFragment();
          k.nodeValue.split(/(\s+)/).forEach(function(p){
            if(!p) return;
            if(/^\s+$/.test(p)){ frag.appendChild(document.createTextNode(' ')); return; }
            var w=document.createElement('span'); w.className='w';
            var s=document.createElement('span'); s.textContent=p; s.style.setProperty('--i',n++);
            w.appendChild(s); frag.appendChild(w);
          });
          k.parentNode.replaceChild(frag,k);
        } else if(k.nodeType===1) walk(k);
      });
    })(el);
  });

  /* ---------- aparición al hacer scroll ---------- */
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window && !reduce){
    var io=new IntersectionObserver(function(es){
      es.forEach(function(en){ en.target.classList.toggle('in',en.isIntersecting); });
    },{threshold:0,rootMargin:'-6% 0px -6% 0px'});
    rv.forEach(function(el){io.observe(el)});
    setTimeout(function(){ rv.forEach(function(el){ var r=el.getBoundingClientRect(); if(r.top<innerHeight && r.bottom>0) el.classList.add('in'); }); },1500);
  } else { rv.forEach(function(el){el.classList.add('in')}); }

  /* ---------- tarjetas y móviles: inclinación 3D y foco de luz que siguen al puntero ---------- */
  function bindTilt(el,max,spot){
    var raf=0;
    el.addEventListener('pointermove',function(e){
      var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
      if(spot){ el.style.setProperty('--sx',(x*100)+'%'); el.style.setProperty('--sy',(y*100)+'%'); }
      if(fine && !reduce){
        cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){ el.style.transform='perspective(1000px) rotateX('+((0.5-y)*max)+'deg) rotateY('+((x-0.5)*max*1.3)+'deg)'; });
      }
    });
    el.addEventListener('pointerleave',function(){ cancelAnimationFrame(raf); el.style.transition='transform .5s cubic-bezier(.2,.7,.2,1),border-color .25s,box-shadow .25s'; el.style.transform=''; setTimeout(function(){ el.style.transition=''; },500); });
  }
  [].slice.call(document.querySelectorAll('.card')).forEach(function(c){bindTilt(c,3.5,true)});
  [].slice.call(document.querySelectorAll('.tiltable')).forEach(function(c){bindTilt(c,9,false)});

  /* ---------- preguntas automáticas (sin servidor: respuestas escritas por nosotros) ---------- */
  (function(){
    var fab=document.getElementById('qaFab'),box=document.getElementById('qa'),log=document.getElementById('qaLog'),sug=document.getElementById('qaSug'),f=document.getElementById('qaF'),inp=document.getElementById('qaIn');
    if(!fab) return;
    (function(){var b=document.getElementById('wa-btn'),m=document.getElementById('wa-menu');if(!b||!m)return;
      function set(o){m.hidden=!o;b.setAttribute('aria-expanded',o?'true':'false');}
      b.addEventListener('click',function(e){e.stopPropagation();set(m.hidden);});
      document.addEventListener('click',function(e){if(!m.hidden&&!m.contains(e.target))set(false);});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});
      [].forEach.call(m.querySelectorAll('a'),function(a){a.addEventListener('click',function(){set(false);});});})();
    var WA={t:'WhatsApp 642 64 31 34',h:'https://wa.me/34642643134'},WA2={t:'WhatsApp 657 71 96 47',h:'https://wa.me/34657719647'},FORM={t:'Ir al formulario',h:'#formulario'},WORK={t:'Ver trabajos',h:'#proyectos'},SVC={t:'Ver servicios',h:'#servicios'};
    var K=[
      {k:['hola','buenas','buenos dias','buenas tardes','hey'],a:'Hola. Pregúntame lo que quieras sobre webs, redes sociales, automatización o mantenimiento, o elige una de las preguntas de abajo.'},
      {k:['precio','precios','cuesta','cuanto vale','cuanto cobr','presupuesto','tarifa','caro','barato','pagar','coste','dinero'],a:'Cada negocio necesita algo distinto, así que preparamos un presupuesto a medida y sin compromiso. Cuéntanos qué necesitas en el formulario o por WhatsApp y te respondemos.',x:[FORM,WA]},
      {k:['web','pagina','diseno','diseñ','tienda online','tiendas','landing','paginas'],a:'Diseñamos webs rápidas y modernas que se ven bien en móvil, tablet y ordenador, con tus servicios, tu carta o tus horarios y el contacto siempre a mano. Antes de decidir, te enseñamos una propuesta.',x:[WORK,FORM]},
      {k:['servicio','ofreceis','haceis','que hac','a que os dedic','que ofrec'],a:'Hacemos cuatro cosas: diseño web, gestión de redes sociales, automatización de tareas y mantenimiento. Puedes contratar una o todas.',x:[SVC]},
      {k:['redes','instagram','tiktok','facebook','publicacion','contenido','video','reels','seguidores','community'],a:'Nos ocupamos de tus redes: publicaciones, vídeos y estrategia para que tu negocio se vea cada semana y te encuentren en tu ciudad.',x:[FORM]},
      {k:['automatiz','automatic','chatbot','bot','respuestas','avisos','contactos','repetitiv'],a:'Automatizamos tareas repetitivas como respuestas, avisos y gestión de contactos, para que ganes tiempo y no se te escape ningún cliente. Esta misma burbuja es un ejemplo sencillo.',x:[FORM]},
      {k:['mantenimiento','cambios','actualiz','soporte','despues','arreglar','modificar','publicada','ya esta','una vez hecha','una vez publicada','que pasa despues'],a:'Después de publicar seguimos contigo: hacemos cambios, actualizaciones y damos soporte para que tu web esté siempre al día sin que tengas que tocar nada técnico.'},
      {k:['tarda','tiempo','plazo','cuando','rapido','dias','semanas','urgente'],a:'Depende de lo que necesites. Cuando hablemos te damos un plazo claro antes de empezar.',x:[WA,WA2]},
      {k:['donde','logrono','rioja','espana','ciudad','online','zona','presencial','fuera','madrid','barcelona','oficina'],a:'Estamos en Logroño y trabajamos online con negocios de toda España.'},
      {k:['como funciona','proceso','pasos','empezar','como trabaj','como se hace'],a:'Son cuatro pasos: hablamos de lo que necesitas, te preparamos una propuesta para que la veas, publicamos tu web y arrancamos tus redes, y después te acompañamos con el mantenimiento.'},
      {k:['ver antes','verla','antes de decidir','antes de pagar','antes de empezar','ver como','quedara','como queda','ver el diseno','decidir','propuesta','boceto','muestra','prueba','gustar','no me gusta','no me convence'],a:'Sí, siempre. Antes de empezar te preparamos una propuesta con el diseño y el estilo de tu negocio para que la veas con calma. Si quieres cambiar algo, lo ajustamos contigo, y solo seguimos adelante cuando te convenza.'},
      {k:['ejemplo','trabajos','portfolio','portafolio','demos','proyectos','clientes','habeis hecho'],a:'En la sección de trabajos tienes cuatro ejemplos en sectores distintos: una pizzería, un kebab, una barbería y un newsletter.',x:[WORK]},
      {k:['compromiso','comprometo','compromet','obliga','gratis','sin coste','permanencia'],a:'Escribirnos no te compromete a nada. Primero hablamos y luego decides con calma.',x:[FORM]},
      {k:['no se','tecnolog','tecnic','dificil','entiendo','informatic','mayor'],a:'No hace falta que sepas de tecnología. Te lo explicamos todo claro y nos ocupamos nosotros de la parte técnica.'},
      {k:['dominio','hosting','alojamiento','publicar','servidor','correo corporativo'],a:'Nos ocupamos de dejar tu web publicada y funcionando. Los detalles de dominio y alojamiento los vemos contigo cuando hablemos.',x:[FORM]},
      {k:['contacto','telefono','llamar','whatsapp','correo','email','mail','hablar','escribir','numero'],a:'Puedes llamarnos o escribirnos por WhatsApp al +34 642 64 31 34 o al +34 657 71 96 47, o por correo a crsdigitalizacion@gmail.com.',x:[WA,WA2,FORM]},
      {k:['quien','quienes','equipo','sois','empresa'],a:'Somos CRS Digital, un equipo de Logroño. Llevamos tu web y tus redes con la misma imagen y siempre hablas con quien conoce tu negocio.'},
      {k:['gracias','genial','perfecto','vale','ok'],a:'A ti. Si quieres que lo veamos para tu negocio, escríbenos cuando quieras.',x:[WA,WA2,FORM]}
    ];
    var S=['¿Cuánto cuesta una web?','¿Qué servicios ofrecéis?','¿Cuánto se tarda?','¿Trabajáis fuera de Logroño?','¿Puedo verla antes de decidir?','¿Puedo ver ejemplos?'];
    function norm(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[¿?¡!.,;:]/g,' ').replace(/\s+/g,' ').trim(); }
    function answer(q){
      var n=' '+norm(q)+' ',best=null,score=0;
      K.forEach(function(it){ var s=0; it.k.forEach(function(w){ var nw=norm(w); if(n.indexOf(nw)>-1) s+=nw.length; }); if(s>score){ score=s; best=it; } });
      return best||{a:'Esa no la tengo preparada, pero te la contestamos nosotros. Escríbenos por WhatsApp o déjanos tu pregunta en el formulario.',x:[WA,WA2,FORM]};
    }
    function add(text,who,acts){
      var m=document.createElement('div'); m.className='qm '+who; m.textContent=text;
      if(acts&&acts.length){ var d=document.createElement('div'); d.className='acts'; acts.forEach(function(x){ var a=document.createElement('a'); a.textContent=x.t; a.href=x.h; if(x.h.charAt(0)!=='#'){ a.target='_blank'; a.rel='noopener'; } else a.addEventListener('click',close); d.appendChild(a); }); m.appendChild(d); }
      log.appendChild(m); log.scrollTop=log.scrollHeight;
    }
    function ask(q){ q=q.trim(); if(!q) return; add(q,'me'); var r=answer(q); setTimeout(function(){ add(r.a,'bot',r.x); },380); }
    S.forEach(function(s){ var b=document.createElement('button'); b.type='button'; b.textContent=s; b.addEventListener('click',function(){ ask(s); }); sug.appendChild(b); });
    var started=false;
    function open(){ box.hidden=false; fab.setAttribute('aria-expanded','true'); if(!started){ started=true; add('Hola, soy el asistente automático de CRS Digital. Resuelvo las dudas más habituales al momento. Elige una pregunta o escribe la tuya.','bot'); } if(fine) inp.focus(); }
    function close(){ box.hidden=true; fab.setAttribute('aria-expanded','false'); }
    fab.addEventListener('click',function(){ box.hidden?open():close(); });
    document.getElementById('qaX').addEventListener('click',function(){ close(); fab.focus(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!box.hidden) close(); });
    f.addEventListener('submit',function(e){ e.preventDefault(); var v=inp.value; inp.value=''; ask(v); });
  })();

  /* ---------- en móvil, mientras se ve el aviso de cookies, las burbujas esperan ---------- */
  (function(){ var ck=document.getElementById('cookie'); if(!ck||!('MutationObserver' in window)) return;
    function sync(){ document.documentElement.classList.toggle('ck',!ck.hidden); }
    new MutationObserver(sync).observe(ck,{attributes:true,attributeFilter:['hidden']}); sync(); })();

  /* ---------- copiar teléfono o correo ---------- */
  document.addEventListener('click',function(e){
    var bt=e.target.closest?e.target.closest('[data-copy]'):null; if(!bt) return;
    var v=bt.getAttribute('data-copy');
    function done(){ bt.textContent='Copiado'; bt.classList.add('done'); setTimeout(function(){ bt.textContent='Copiar'; bt.classList.remove('done'); },1800); }
    function fallback(){ var s=bt.closest('.ph').querySelector('span'); var r=document.createRange(); r.selectNodeContents(s); var sel=getSelection(); sel.removeAllRanges(); sel.addRange(r); try{ if(document.execCommand('copy')) done(); }catch(err){} }
    try{ navigator.clipboard.writeText(v).then(done,fallback); }catch(err){ fallback(); }
  });

  /* ---------- llamar / escribir: si el dispositivo no abre la llamada o el correo, se copia y se avisa ---------- */
  var toast=document.getElementById('toast'),toastT=0;
  function showToast(msg){ toast.textContent=msg; toast.hidden=false; requestAnimationFrame(function(){ toast.classList.add('on'); }); clearTimeout(toastT); toastT=setTimeout(function(){ toast.classList.remove('on'); setTimeout(function(){ toast.hidden=true; },300); },5200); }
  document.addEventListener('click',function(e){
    var a=e.target.closest?e.target.closest('a[href^="tel:"],a[href^="mailto:"]'):null; if(!a) return;
    var isTel=a.getAttribute('href').indexOf('tel:')===0, v=decodeURIComponent(a.getAttribute('href').replace(/^(tel:|mailto:)/,''));
    var shown=v; if(isTel) shown=v.replace(/^\+34/,'+34 ').replace(/(\d{3})(\d{2})(\d{2})(\d{2})$/,'$1 $2 $3 $4');
    var left=false; function gone(){ left=true; } window.addEventListener('blur',gone,{once:true}); document.addEventListener('visibilitychange',gone,{once:true});
    try{ navigator.clipboard.writeText(shown).catch(function(){}); }catch(err){}
    setTimeout(function(){
      window.removeEventListener('blur',gone); document.removeEventListener('visibilitychange',gone);
      if(!left) showToast(isTel?('Si no se abre la llamada, el número es '+shown+'. Lo hemos copiado para que lo pegues.'):('Si no se abre tu correo, escríbenos a '+shown+'. Lo hemos copiado para que lo pegues.'));
    },1200);
  });

  /* ---------- Google Analytics y Píxel de Meta: solo con tu permiso ---------- */
  function loadAnalytics(){
    if(!CONFIG.GA_ID || window._gaLoaded) return; window._gaLoaded=true;
    var s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(CONFIG.GA_ID); document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){ window.dataLayer.push(arguments); };
    window.gtag('js',new Date()); window.gtag('config',CONFIG.GA_ID);
  }
  function loadMeta(){
    if(!CONFIG.META_PIXEL_ID || window._fbLoaded) return; window._fbLoaded=true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init',CONFIG.META_PIXEL_ID); window.fbq('track','PageView');
  }
  function applyConsent(){ var c=window.crsConsent||{}; if(c.analytics) loadAnalytics(); if(c.marketing) loadMeta(); }

  /* ---------- formulario de contacto ---------- */
  (function(){
    var form=document.getElementById('cform'); if(!form) return;
    var $=function(id){ return document.getElementById(id); };
    var startedAt=Date.now(), sending=false, tsToken='', tsLoaded=false, tsWidget=null;
    var btn=$('f-send'), live=$('f-live'), okBox=$('f-ok');
    if(!CONFIG.FORM_ENDPOINT) $('f-demo').hidden=false;

    function setErr(name,msg){
      var f=form.querySelector('[data-f="'+name+'"]'); if(!f) return;
      f.classList.toggle('err',!!msg); var e=f.querySelector('.ferr'); if(e) e.textContent=msg||'';
    }
    function say(msg,bad){ live.textContent=msg||''; live.className='fmsg'+(bad?' bad':''); }
    function collect(){
      return {
        name:$('f-name').value.trim(), business:$('f-biz').value.trim(),
        email:$('f-email').value.trim(), phone:$('f-phone').value.trim(),
        needs:[].slice.call(form.querySelectorAll('input[name="needs"]:checked')).map(function(i){return i.value;}),
        message:$('f-msg').value.trim(), consent:$('f-consent').checked, hp:$('f-web').value
      };
    }
    function validate(d){
      ['name','email','phone','message','consent'].forEach(function(k){ setErr(k,''); });
      var ok=true, phone=d.phone.replace(/[\s.\-()]/g,'');
      if(d.name.length<2){ setErr('name','Escribe tu nombre.'); ok=false; }
      if(!d.email && !phone){ setErr('email','Déjanos un correo o un teléfono.'); setErr('phone','Déjanos un correo o un teléfono.'); ok=false; }
      else{
        if(d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)){ setErr('email','Revisa el correo electrónico.'); ok=false; }
        if(phone && !/^\+?\d{9,15}$/.test(phone)){ setErr('phone','Revisa el teléfono (solo números, con o sin +34).'); ok=false; }
      }
      if(!d.consent){ setErr('consent','Necesitamos que aceptes la política de privacidad.'); ok=false; }
      return ok;
    }
    /* antispam invisible (Cloudflare Turnstile): se carga al empezar a rellenar */
    function loadTurnstile(){
      if(!CONFIG.TURNSTILE_SITEKEY || tsLoaded) return; tsLoaded=true;
      window.__tsReady=function(){
        tsWidget=window.turnstile.render('#ts-box',{sitekey:CONFIG.TURNSTILE_SITEKEY,appearance:'interaction-only',
          callback:function(t){tsToken=t;},'expired-callback':function(){tsToken='';},'error-callback':function(){tsToken='';}});
      };
      var s=document.createElement('script'); s.async=true; s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__tsReady'; document.head.appendChild(s);
    }
    form.addEventListener('focusin',loadTurnstile);
    function getToken(){
      if(!CONFIG.TURNSTILE_SITEKEY) return Promise.resolve('');
      loadTurnstile();
      return new Promise(function(res,rej){ var n=0; (function w(){ if(tsToken) return res(tsToken); if(++n>75) return rej(new Error('ts')); setTimeout(w,200); })(); });
    }
    function resetTurnstile(){ tsToken=''; try{ if(window.turnstile && tsWidget!==null) window.turnstile.reset(tsWidget); }catch(e){} }
    function showOk(demo,hasEmail){
      form.hidden=true; okBox.hidden=false;
      $('f-ok-demo').hidden=!demo;
      $('f-ok-txt').textContent=hasEmail?'Nos pondremos en contacto contigo lo antes posible.':'Te llamaremos o te escribiremos por WhatsApp lo antes posible.';
      $('f-ok-spam').hidden=!(hasEmail && !demo);
      try{ okBox.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
    }
    $('f-again').addEventListener('click',function(){
      form.reset(); form.hidden=false; okBox.hidden=true; say(''); startedAt=Date.now();
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(sending) return;
      var d=collect();
      if(d.hp){ showOk(false,false); return; }                        // robots: no les damos pistas
      if(!validate(d)){ var bad=form.querySelector('.fld.err input,.fld.err textarea'); if(bad) bad.focus(); return; }
      sending=true; btn.disabled=true; say('Enviando…');
      getToken().then(function(tok){
        if(!CONFIG.FORM_ENDPOINT){ return new Promise(function(r){ setTimeout(function(){ r({ok:true,demo:true}); },900); }); }
        var payload={name:d.name,business:d.business,email:d.email,phone:d.phone,needs:d.needs,message:d.message,consent:true,policy:'2026-09',elapsed:Date.now()-startedAt,token:tok};
        return fetch(CONFIG.FORM_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)}).then(function(r){ return r.json(); });
      }).then(function(res){
        if(!res || !res.ok) throw new Error('bad');
        showOk(!!res.demo,!!d.email);
        var c=window.crsConsent||{};
        if(window.gtag && c.analytics) window.gtag('event','generate_lead');
        if(window.fbq && c.marketing) window.fbq('track','Lead');
      }).catch(function(){
        say('No hemos podido enviarlo. Inténtalo de nuevo o escríbenos por WhatsApp o correo.',true);
      }).then(function(){ sending=false; btn.disabled=false; resetTurnstile(); });
    });
  })();

  /* ---------- cookies y textos legales ---------- */
  var CKEY='crs_consent_v1', cookieEl=document.getElementById('cookie'), prefsEl=document.getElementById('cprefs'), legalEl=document.getElementById('legal');
  function readConsent(){ try{ var v=JSON.parse(localStorage.getItem(CKEY)||'null'); if(v && (Date.now()-v.ts)<365*864e5) return v; }catch(e){} return null; }
  function saveConsent(an,mk){
    var v={necessary:true,analytics:!!an,marketing:!!mk,ts:Date.now()};
    try{ localStorage.setItem(CKEY,JSON.stringify(v)); }catch(e){}
    window.crsConsent=v;
    try{ window.dispatchEvent(new CustomEvent('crs:consent',{detail:v})); }catch(e){}
  }
  window.crsConsent=readConsent()||{necessary:true,analytics:false,marketing:false};
  function lockScroll(on){ document.documentElement.style.overflow=on?'hidden':''; }
  function openPrefs(){
    var c=window.crsConsent||{};
    document.getElementById('c-an').checked=!!c.analytics; document.getElementById('c-mk').checked=!!c.marketing;
    legalEl.hidden=true; prefsEl.hidden=false; lockScroll(true);
    var x=prefsEl.querySelector('.x'); if(x) x.focus();
  }
  function openLegal(doc){
    prefsEl.hidden=true;
    [].slice.call(legalEl.querySelectorAll('.lg')).forEach(function(s){ s.hidden=(s.getAttribute('data-doc')!==doc); });
    legalEl.hidden=false; lockScroll(true);
    var p=legalEl.querySelector('.panel'); if(p) p.scrollTop=0;
    var x=legalEl.querySelector('.x'); if(x) x.focus();
  }
  function closeAll(){ prefsEl.hidden=true; legalEl.hidden=true; lockScroll(false); }
  document.addEventListener('click',function(e){
    var el=e.target.closest?e.target.closest('[data-legal],[data-c],[data-close],[data-prefs]'):null;
    if(!el) return;
    if(el.hasAttribute('data-legal')){ e.preventDefault(); openLegal(el.getAttribute('data-legal')); return; }
    if(el.hasAttribute('data-prefs')){ e.preventDefault(); openPrefs(); return; }
    if(el.hasAttribute('data-close')){ closeAll(); return; }
    var c=el.getAttribute('data-c'), prev=window.crsConsent||{};
    if(c==='accept') saveConsent(true,true);
    else if(c==='reject') saveConsent(false,false);
    else if(c==='save') saveConsent(document.getElementById('c-an').checked,document.getElementById('c-mk').checked);
    var cur=window.crsConsent||{};
    cookieEl.hidden=true; closeAll();
    if((prev.analytics&&!cur.analytics)||(prev.marketing&&!cur.marketing)){ location.reload(); return; }
    applyConsent();
  });
  [prefsEl,legalEl].forEach(function(m){ m.addEventListener('click',function(e){ if(e.target===m) closeAll(); }); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeAll(); });
  if(!readConsent()){ setTimeout(function(){ cookieEl.hidden=false; },1200); }
  applyConsent();

  /* ---------- muelles: el movimiento que sigue al puntero tiene inercia y un ligero rebote ---------- */
  function Spring(k,c){ this.k=k; this.c=c; this.x=0; this.v=0; }
  Spring.prototype.step=function(target,dt){ var f=-this.k*(this.x-target)-this.c*this.v; this.v+=f*dt; this.x+=this.v*dt; return this.x; };
  var spX=new Spring(70,13),spY=new Spring(70,13),spS=new Spring(110,20);

  /* ---------- fondo 3D de la portada ---------- */
  var canvas=document.getElementById('bg'),heroOn=true,gl3=null,ctx=null;
  // 1) Three.js: malla de partículas calculada en la tarjeta gráfica, con polvo flotante y cámara que vuela con el scroll
  function setupGL(){
    if(typeof THREE==='undefined'||!canvas) return false;
    try{
      var r=new THREE.WebGLRenderer({canvas:canvas,antialias:false,alpha:true,powerPreference:'high-performance'});
      r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
      r.setClearColor(0x000000,0);
      var scene=new THREE.Scene();
      var cam=new THREE.PerspectiveCamera(50,1,0.1,100); cam.position.set(0,2.6,8);
      var SX=isMobile?120:230,SZ=isMobile?60:96;
      var geo=new THREE.PlaneGeometry(46,22,SX-1,SZ-1); geo.rotateX(-Math.PI/2);
      var gp=geo.attributes.position.array; for(var gi=0;gi<gp.length;gi+=3){ gp[gi]+=(Math.random()-.5)*.22; gp[gi+2]+=(Math.random()-.5)*.22; }   // rompe la cuadrícula para que no se vean rayas
      var U={uTime:{value:0},uMouse:{value:new THREE.Vector2(0,0)},uScroll:{value:0},uSize:{value:(isMobile?2.8:2.3)*r.getPixelRatio()},
             uColA:{value:new THREE.Color(0x2a63ff)},uColB:{value:new THREE.Color(0xa8d6ff)}};
      var mat=new THREE.ShaderMaterial({uniforms:U,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
        vertexShader:[
          'uniform float uTime;uniform vec2 uMouse;uniform float uScroll;uniform float uSize;',
          'varying float vH;varying float vD;',
          'void main(){',
          '  vec3 p=position;',
          '  float w=sin(p.x*.36+uTime*.7)*.32+sin(p.z*.55+uTime*.5)*.26+sin((p.x+p.z)*.21-uTime*.35)*.2;',
          '  float d=distance(p.xz,vec2(uMouse.x*11.,-2.-uMouse.y*4.));',
          '  w+=exp(-d*d*.05)*sin(d*1.5-uTime*3.)*.42;',
          '  w*=1.+uScroll*.5;',
          '  p.y+=w; vH=w;',
          '  vec4 mv=modelViewMatrix*vec4(p,1.);',
          '  vD=-mv.z;',
          '  gl_PointSize=uSize*(9./vD);',
          '  gl_Position=projectionMatrix*mv;',
          '}'].join('\n'),
        fragmentShader:[
          'uniform vec3 uColA;uniform vec3 uColB;varying float vH;varying float vD;',
          'void main(){',
          '  vec2 c=gl_PointCoord-.5; float r=length(c); if(r>.5) discard;',
          '  float a=smoothstep(.5,.08,r);',
          '  float fog=clamp(1.-(vD-4.)/24.,0.,1.);',
          '  vec3 col=mix(uColA,uColB,clamp(vH*1.1+.45,0.,1.));',
          '  gl_FragColor=vec4(col,a*fog*.9);',
          '}'].join('\n')});
      var wave=new THREE.Points(geo,mat); wave.position.y=-1.7; scene.add(wave);
      var N=isMobile?170:420,pos=new Float32Array(N*3);
      for(var i=0;i<N;i++){ pos[i*3]=(Math.random()-.5)*30; pos[i*3+1]=Math.random()*9-1.2; pos[i*3+2]=(Math.random()-.5)*16-3; }
      var dg=new THREE.BufferGeometry(); dg.setAttribute('position',new THREE.BufferAttribute(pos,3));
      var dust=new THREE.Points(dg,new THREE.PointsMaterial({color:0x8cc4ff,size:isMobile?.06:.045,transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));
      scene.add(dust);
      gl3={r:r,s:scene,c:cam,u:U,dust:dust};
      return true;
    }catch(err){ gl3=null; return false; }
  }
  // 2) Respaldo sin WebGL: la misma malla dibujada en 2D con perspectiva
  var COLS,ROWS,base,dpr=1,foc=1,camX=0,camY=2.4,CAMZ=7.5,PITCH=0.36,cosP=Math.cos(PITCH),sinP=Math.sin(PITCH);
  function setup2D(){
    try{ ctx=canvas.getContext('2d'); }catch(e){ ctx=null; }
    if(!ctx){ canvas.style.display='none'; return; }
    COLS=isMobile?60:118; ROWS=isMobile?28:44;
    base=new Float32Array(COLS*ROWS*2);
    for(var j=0;j<ROWS;j++) for(var i=0;i<COLS;i++){ var k=j*COLS+i; base[k*2]=(i/(COLS-1)-.5)*40; base[k*2+1]=(j/(ROWS-1)-.5)*17-3.5; }
  }
  function draw2D(t,mx,my){
    var cw=canvas.width,ch=canvas.height,cx=mx*9;
    camX+=(mx*.9-camX)*.05; camY+=(2.4-my*.5-camY)*.05;
    ctx.clearRect(0,0,cw,ch); ctx.fillStyle='#5aa8ff';
    for(var j=0;j<ROWS;j++){
      var z=base[j*COLS*2+1], zz=z-CAMZ, a=clamp((j+2)/ROWS,0,1); ctx.globalAlpha=.22+.7*a*a;
      for(var i=0;i<COLS;i++){
        var x=base[(j*COLS+i)*2],dx=x-cx;
        var y=Math.sin(x*.42+t*.7)*.3+Math.sin(z*.6+t*.5)*.24+Math.exp(-dx*dx*.05)*Math.sin(z*1.2-t*2)*.22-1.5;
        var Y=y-camY, Yp=Y*cosP-zz*sinP, d=-(Y*sinP+zz*cosP);
        if(d<.6) continue;
        var sx=cw/2+foc*(x-camX)/d, sy2=ch/2-foc*Yp/d;
        if(sx<-4||sx>cw+4||sy2<-4||sy2>ch+4) continue;
        var s=Math.max(1.2*dpr,dpr*19/d); ctx.fillRect(sx-s/2,sy2-s/2,s,s);
      }
    }
    ctx.globalAlpha=1;
  }
  function resize(){
    if(!hero||!canvas) return;
    var W=hero.clientWidth,H=hero.clientHeight;
    if(gl3){ gl3.r.setSize(W,H,false); gl3.c.aspect=W/H; gl3.c.fov=W<700?62:50; gl3.c.updateProjectionMatrix(); }
    else if(ctx){ dpr=Math.min(window.devicePixelRatio||1,isMobile?1.5:2); canvas.width=Math.round(W*dpr); canvas.height=Math.round(H*dpr); foc=(canvas.height/2)/Math.tan(52*Math.PI/360); }
  }
  addEventListener('resize',resize);
  function render3D(t,mx,my){
    var hh=hero.offsetHeight, s=clamp(sy/hh,0,1);
    if(gl3){
      var U=gl3.u,c=gl3.c;
      U.uTime.value=t; U.uMouse.value.set(mx,my); U.uScroll.value=s;
      var mob=hero.clientWidth<700;
      c.position.x=mx*1.3; c.position.y=(mob?3.6:2.6)-my*.45+s*1.3; c.position.z=8-s*2.2;
      c.lookAt(0,(mob?-1.6:-.6)-s*.7,0);
      gl3.dust.rotation.y=t*.02+mx*.12; gl3.dust.position.y=s*1.8;
      gl3.r.render(gl3.s,c);
    } else if(ctx) draw2D(t,mx,my);
  }
  if('IntersectionObserver' in window && hero){
    new IntersectionObserver(function(es){ heroOn=es[0].isIntersecting; },{threshold:0}).observe(hero);
  }

  /* ---------- mascota: se inclina con inercia, se encoge al bajar; la portada se funde con el blanco ---------- */
  var tilt=document.getElementById('tilt'),stage=document.getElementById('stage');
  var chips=[].slice.call(document.querySelectorAll('.chip'));
  function smooth(x){ x=clamp(x,0,1); return x*x*(3-2*x); }
  function mascot(mx,my,sc){
    if(tilt) tilt.style.transform='rotateY('+(mx*13).toFixed(2)+'deg) rotateX('+(-my*7).toFixed(2)+'deg)';
    for(var i=0;i<chips.length;i++){
      var d=parseFloat(chips[i].getAttribute('data-depth'));
      chips[i].style.transform='translate3d('+(-mx*d*24).toFixed(1)+'px,'+(-my*d*18).toFixed(1)+'px,0)';
    }
    if(stage) stage.style.transform='scale('+sc.toFixed(3)+')';
  }
  function heroFade(){
    if(!hfade||!hero) return;
    var h=hero.offsetHeight;
    hfade.style.opacity=(smooth((sy-h*.2)/(h*.7))*.92).toFixed(3);
  }
  addEventListener('scroll',heroFade,{passive:true}); heroFade();

  var t0=performance.now(),last=t0;
  function frame(now){
    var t=(now-t0)/1000, dt=Math.min(.033,Math.max(.001,(now-last)/1000)); last=now;
    if(now-lastPtr>2500){ tx=Math.sin(t*.45)*.55; ty=Math.cos(t*.37)*.35; }   // movimiento suave si no hay cursor o dedo
    var mx=spX.step(tx,dt), my=spY.step(ty,dt);
    var sc=spS.step(1-.45*smooth(sy/(innerHeight*.8)),dt); if(spS.x===0) spS.x=1;
    if(heroOn){ render3D(t,mx,my); mascot(mx,my,sc); }
    requestAnimationFrame(frame);
  }
  if(!setupGL()) setup2D();
  spS.x=1; resize();
  if(reduce){ render3D(0,0,0); mascot(0,0,1); }
  else { requestAnimationFrame(frame); }
})();
