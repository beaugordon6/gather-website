// ---- Router ----
var routes = {
  '/': 'guest',
  '/host': 'host',
  '/pricing': 'payment'
};

function navigateTo(path) {
  var id = routes[path];
  if (!id) return;
  history.pushState(null, '', path);
  goPage(id, true);
}

function goPage(id, skipPush) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
  setTimeout(runReveal,60);
  updateNav();
}

window.addEventListener('popstate', function() {
  var id = routes[window.location.pathname] || 'guest';
  goPage(id, true);
});

// ---- Nav ----
function updateNav(){
  var nav=document.getElementById('main-nav');
  var heroWrap=document.querySelector('.page.active .hero-wrap');
  var isMobile=window.innerWidth<=768;
  if(heroWrap && isMobile){
    var heroBottom=heroWrap.offsetTop+heroWrap.offsetHeight-nav.offsetHeight;
    if(window.scrollY<heroBottom){nav.classList.add('nav-on-video')}
    else{nav.classList.remove('nav-on-video')}
  }else{nav.classList.remove('nav-on-video')}
}

// ---- Reveal animations ----
function runReveal(){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.1,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.page.active .rev:not(.in)').forEach(el=>io.observe(el));
}

window.addEventListener('scroll',()=>{
  document.getElementById('main-nav').classList.toggle('scrolled',window.scrollY>8);
  updateNav();
},{passive:true});

// ---- FAQ ----
function toggleFaq(btn){
  const item=btn.closest('.faq-item');
  const was=item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i=>i.classList.remove('open'));
  if(!was)item.classList.add('open');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded',()=>{
  // Route based on current URL
  var id = routes[window.location.pathname] || 'guest';
  goPage(id, true);

  setTimeout(runReveal,80);
  updateNav();

  // Duplicate testimonial cards for seamless marquee loop
  document.querySelectorAll('.testi-track').forEach(function(track){
    var cards=track.innerHTML;
    track.innerHTML=cards+cards;
  });

  // Force video autoplay + loop
  function forcePlay(){
    document.querySelectorAll('.hero-video').forEach(function(v){
      v.muted=true;
      v.defaultMuted=true;
      v.loop=true;
      v.setAttribute('muted','');
      v.setAttribute('playsinline','');
      v.setAttribute('autoplay','');
      v.setAttribute('loop','');
      var p=v.play();
      if(p&&p.catch)p.catch(function(){});
    });
  }
  forcePlay();
  setTimeout(forcePlay,500);
  setTimeout(forcePlay,2000);
  // Also restart on ended event as fallback
  document.querySelectorAll('.hero-video').forEach(function(v){
    v.addEventListener('ended',function(){v.currentTime=0;v.play().catch(function(){});});
  });
});

// Retry on any user interaction (Safari/iOS requires gesture)
['touchstart','click','scroll','mousemove'].forEach(function(evt){
  document.addEventListener(evt,function(){
    document.querySelectorAll('.hero-video').forEach(function(v){
      if(v.paused){v.muted=true;v.defaultMuted=true;v.play().catch(function(){});}
    });
  },{once:true,passive:true});
});

// ---- Download modal ----
function openDownloadModal(){
  var m=document.getElementById('dl-modal');
  m.style.display='flex';
  document.body.style.overflow='hidden';
}
function closeDownloadModal(){
  var m=document.getElementById('dl-modal');
  m.style.display='none';
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeDownloadModal()});
document.getElementById('dl-modal').addEventListener('click',function(e){if(e.target===this)closeDownloadModal()});
