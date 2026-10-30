(function(){
  var FULL=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var ORG={EG:['eg','Egypt'],AE:['ae','UAE'],RG:['rg','Regional']};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

  // shared product card (also used by the produce page)
  window.agriCard=function(p,m){
    var plate=p.img?'<img src="img/'+p.id+'.webp" alt="" loading="lazy" width="480" height="480">':'<span class="mono" aria-hidden="true">'+esc(p.ar.charAt(0))+'</span>';
    var tags=p.org.map(function(o){var x=ORG[o];return x?'<span class="tag '+x[0]+'">'+x[1]+'</span>':''}).join('');
    var bar=p.m.map(function(v,i){return '<i class="'+(v===2?'p':v===1?'a':'')+(i===m?' sel':'')+'"></i>'}).join('');
    var label=FULL.filter(function(_,i){return p.m[i]===2}).join(', ');
    return '<article class="item"><div class="plate">'+plate+'</div><h3>'+esc(p.en)+'</h3><div class="ar" lang="ar">'+esc(p.ar)+'</div>'+
      (p.note?'<p class="desc">'+esc(p.note)+'</p>':'')+
      '<div class="meta"><div class="tags">'+tags+'</div><div class="season" role="img" aria-label="Peak months: '+esc(label||'none listed')+'">'+bar+'</div></div></article>';
  };
  window.agriEsc=esc; window.agriMonths=FULL;

  var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();

  // menu
  var mb=document.querySelector('.menu-btn'),nav=document.getElementById('nav');
  if(mb&&nav){
    mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o);mb.textContent=o?'Close':'Menu'});
    nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');mb.textContent='Menu'}});
  }

  // hero video
  var vid=document.querySelector('.hero-video'),vt=document.querySelector('.vid-toggle');
  if(vid&&vt){
    var setPlaying=function(p){if(p){var pr=vid.play();if(pr&&pr.catch)pr.catch(function(){})}else{vid.pause()}vt.textContent=p?'Pause video':'Play video';vt.setAttribute('aria-pressed',String(!p))};
    if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){vid.removeAttribute('autoplay');setPlaying(false)}
    vt.addEventListener('click',function(){setPlaying(vid.paused)});
  }

  // home: in season now
  var tz=document.getElementById('teaserGrid');
  if(tz&&window.AGRI){
    var m=new Date().getMonth();
    var list=AGRI.products.filter(function(p){return p.m[m]===2&&p.img}).sort(function(a,b){return a.en.localeCompare(b.en)});
    var n=AGRI.products.filter(function(p){return p.m[m]>=1}).length;
    document.getElementById('teaserMonth').textContent=FULL[m];
    document.getElementById('teaserCount').textContent=n;
    tz.innerHTML=list.slice(0,8).map(function(p){return agriCard(p,m)}).join('');
  }

  // enquiry form
  var form=document.getElementById('enquiry');
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var f=e.target,err=document.getElementById('formErr');
      var name=f.name.value.trim(),email=f.email.value.trim(),msg=f.message.value.trim();
      var missing=[];if(!name)missing.push('your name');if(!/^\S+@\S+\.\S+$/.test(email))missing.push('a valid email');if(!msg)missing.push('what you need');
      if(missing.length){err.hidden=false;err.textContent='Add '+missing.join(', ')+' to send your enquiry.';return}
      err.hidden=true;
      var body='Name: '+name+'\nCompany: '+f.company.value.trim()+'\nEmail: '+email+'\nType: '+f.type.value+'\n\n'+msg;
      location.href='mailto:info@agrinova.ae?subject='+encodeURIComponent('Enquiry from '+(f.company.value.trim()||name))+'&body='+encodeURIComponent(body);
    });
  }
})();
(function(){var v=document.querySelector('.gh-film video'),b=document.querySelector('.gh-toggle');if(!v||!b)return;
  function set(p){if(p){var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}else v.pause();b.textContent=p?'Pause':'Play';b.setAttribute('aria-pressed',String(!p))}
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');set(false)}
  b.addEventListener('click',function(){set(v.paused)});})();
