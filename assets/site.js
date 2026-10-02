// nav: scrolled state + active section (only for same-page hash links)
(function(){
  const hdr=document.querySelector('header');
  const links=[...document.querySelectorAll('nav ul a')];
  const pairs=links.map(a=>{
    const u=new URL(a.href,location.href);
    const same=u.pathname===location.pathname && u.hash;
    return [a, same ? document.querySelector(u.hash) : null];
  });
  function check(){
    hdr.classList.toggle('scrolled',scrollY>20);
    const y=innerHeight*.35;
    pairs.forEach(([a,s])=>{
      if(a.dataset.current) return;
      let on=false;
      if(s){const r=s.getBoundingClientRect();on=r.top<=y&&r.bottom>y;}
      a.classList.toggle('active',on);
    });
  }
  addEventListener('scroll',check,{passive:true});addEventListener('resize',check);check();
})();

// reveal on scroll
(function(){
  const els=document.querySelectorAll('.rv');
  if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('in'));return;}
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      const sib=[...e.target.parentElement.children].filter(x=>x.classList.contains('rv'));
      e.target.style.transitionDelay=(Math.min(Math.max(0,sib.indexOf(e.target)),8)*70)+'ms';
      e.target.classList.add('in');io.unobserve(e.target);
    }
  }),{threshold:.08,rootMargin:'0px 0px -40px 0px'});
  els.forEach(e=>io.observe(e));
})();

// mobile menu
(function(){
  const b=document.getElementById('burger'),m=document.getElementById('mnav');
  if(!b||!m)return;
  function set(o){m.classList.toggle('open',o);b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');}
  b.addEventListener('click',()=>set(!m.classList.contains('open')));
  m.addEventListener('click',e=>{if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')set(false);});
})();

// work experience: expand inline
(function(){
  const btn=document.getElementById('expBtn'),more=document.getElementById('expMore');
  if(!btn||!more)return;
  btn.addEventListener('click',()=>{
    const open=!more.classList.contains('open');
    more.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open);
    btn.querySelector('.lbl').textContent=open?'Show less':'Show earlier experience';
  });
})();

// filter chips (work samples page)
(function(){
  const wrap=document.getElementById('filters');if(!wrap)return;
  const filters=wrap.querySelectorAll('button');
  const cards=document.querySelectorAll('#allGrid .m-card');
  function apply(cat){
    filters.forEach(x=>x.classList.toggle('active',x.dataset.cat===cat));
    cards.forEach(c=>c.classList.toggle('hidden',!(cat==='all'||c.dataset.cat===cat)));
  }
  filters.forEach(f=>f.addEventListener('click',()=>{apply(f.dataset.cat);history.replaceState(null,'',f.dataset.cat==='all'?location.pathname:'#'+f.dataset.cat);}));
  const h=location.hash.slice(1);if(h&&wrap.querySelector('[data-cat="'+h+'"]'))apply(h);
})();

// lightbox: groups by data-lightbox value, skips hidden cards
(function(){
  const lb=document.getElementById('lb');if(!lb)return;
  const img=lb.querySelector('img'),cap=lb.querySelector('.lb-cap');
  let set=[],idx=0,last=null;
  function show(){
    const a=set[idx];
    img.src=a.getAttribute('href');
    const t=a.querySelector('h3'),p=a.querySelector('.proj');
    const label=a.dataset.caption||(t?t.textContent+(p?' — '+p.textContent:''):'');
    cap.textContent=label+(set.length>1?'  ·  '+(idx+1)+' / '+set.length:'');
    img.alt=label||'Project image';
  }
  function open(a){
    last=a;
    const g=a.dataset.lightbox;
    set=[...document.querySelectorAll('[data-lightbox="'+g+'"]')].filter(x=>!x.closest('.hidden'));
    idx=Math.max(0,set.indexOf(a));show();lb.classList.add('open');document.body.style.overflow='hidden';
    lb.querySelector('.lb-close').focus();
  }
  function close(){lb.classList.remove('open');document.body.style.overflow='';img.removeAttribute('src');if(last)last.focus();}
  function step(d){idx=(idx+d+set.length)%set.length;show();}
  document.addEventListener('click',e=>{const a=e.target.closest('[data-lightbox]');if(a){e.preventDefault();open(a);}});
  lb.querySelector('.lb-close').onclick=close;
  lb.querySelector('.lb-prev').onclick=()=>step(-1);
  lb.querySelector('.lb-next').onclick=()=>step(1);
  lb.addEventListener('click',e=>{if(e.target===lb)close();});
  document.addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowRight')step(1);
    if(e.key==='ArrowLeft')step(-1);
  });
})();

// cursor glow (eased follow)
(function(){
  const g=document.getElementById('cglow');
  if(!g||!matchMedia('(hover:hover) and (pointer:fine)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  let tx=innerWidth/2,ty=innerHeight/3,x=tx,y=ty,raf=0;
  function tick(){x+=(tx-x)*.12;y+=(ty-y)*.12;g.style.transform=`translate3d(${x}px,${y}px,0)`;
    raf=(Math.abs(tx-x)+Math.abs(ty-y)>.5)?requestAnimationFrame(tick):0;}
  addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;g.classList.add('on');if(!raf)raf=requestAnimationFrame(tick);},{passive:true});
  document.addEventListener('pointerleave',()=>g.classList.remove('on'));
})();

// copy email
(function(){
  document.querySelectorAll('[data-copy-email]').forEach(b=>{
    const l=b.querySelector('.lbl'),email=b.dataset.copyEmail,orig=l.textContent;let t;
    function done(ok){l.textContent=ok?'Copied!':email;b.classList.toggle('copied',ok);clearTimeout(t);t=setTimeout(()=>{l.textContent=orig;b.classList.remove('copied');},2200);}
    function fallback(){const ta=document.createElement('textarea');ta.value=email;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();
      let ok=false;try{ok=document.execCommand('copy');}catch(e){}ta.remove();done(ok);}
    b.addEventListener('click',()=>{
      if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(email).then(()=>done(true),fallback);}else fallback();
    });
  });
})();

// featured slider
(function(){
  document.querySelectorAll('[data-slider]').forEach(sl=>{
    const track=sl.querySelector('.sl-track'),slides=[...track.children];
    const prev=sl.querySelector('.prev'),next=sl.querySelector('.next'),count=sl.querySelector('.sl-count b');
    const thumbs=[...(sl.parentElement.querySelectorAll('.sl-thumb'))];
    if(slides.length<2)return;
    let i=0;
    const go=n=>{n=Math.max(0,Math.min(slides.length-1,n));track.scrollTo({left:n*track.clientWidth});};
    function update(){
      i=Math.round(track.scrollLeft/track.clientWidth);
      count.textContent=i+1;prev.disabled=i===0;next.disabled=i===slides.length-1;
      thumbs.forEach((t,k)=>t.classList.toggle('active',k===i));
      const a=thumbs[i];if(a){const s=a.parentElement;s.scrollTo({left:a.offsetLeft-s.clientWidth/2+a.clientWidth/2,behavior:'smooth'});}
    }
    prev.onclick=()=>go(i-1);next.onclick=()=>go(i+1);
    thumbs.forEach((t,k)=>t.onclick=()=>go(k));
    let raf;track.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(update);},{passive:true});
    sl.tabIndex=-1;
    sl.addEventListener('keydown',e=>{if(e.key==='ArrowRight')go(i+1);if(e.key==='ArrowLeft')go(i-1);});
    update();
  });
})();

// work samples: landscape images span both columns; preview = one full row; no lonely square
(function(){
  function layout(cat){
    const grid=cat.querySelector('.ws-grid'),btn=cat.querySelector('.see-more');
    let cards=[...grid.children];
    const isLand=c=>c.classList.contains('land');
    // preview: two full rows (a landscape fills a row; squares fill it in pairs)
    const ROWS=2;const picked=[];let rows=0,pending=null;
    for(const c of cards){
      if(rows>=ROWS)break;
      if(isLand(c)){if(!pending){picked.push(c);rows++;}}
      else if(pending){picked.push(pending,c);pending=null;rows++;}
      else pending=c;
    }
    if(pending&&picked.length===0)picked.push(pending);
    picked.slice().reverse().forEach(c=>grid.insertBefore(c,grid.firstChild));
    const show=picked;
    cards=[...grid.children];
    cards.forEach(c=>c.classList.toggle('ws-more',!show.includes(c)));
    if(btn){const left=cards.length-show.length;btn.querySelector('.n').textContent='+'+left;btn.hidden=left===0;}
  }
  document.querySelectorAll('.ws-cat').forEach(cat=>{
    const imgs=[...cat.querySelectorAll('.ws-card img')];
    imgs.forEach(img=>{
      const set=()=>{if(img.naturalWidth&&img.naturalWidth/img.naturalHeight>1.2)img.closest('.ws-card').classList.add('land');layout(cat);};
      if(img.complete)set();else img.addEventListener('load',set,{once:true});
    });
    layout(cat);
    const b=cat.querySelector('.see-more');if(!b)return;
    const lbl=b.querySelector('.lbl'),n=b.querySelector('.n');
    b.addEventListener('click',()=>{
      const open=!cat.classList.contains('open');
      cat.classList.toggle('open',open);b.setAttribute('aria-expanded',open);
      lbl.textContent=open?'See less':'See more';n.style.display=open?'none':'';
      cat.querySelectorAll('.ws-card img').forEach(i=>{i.loading='eager';});
      layout(cat);
      if(!open)cat.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();
