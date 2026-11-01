(function(){
  var KEY='580335fe-005e-438d-be5a-6bf715534af2';
  // Sends a form to Web3Forms. Resolves true when delivered, false when not configured or failed.
  window.agriSend=function(subject,fields,replyto,fromName,bot){
    if(!KEY||KEY.indexOf('__')===0) return Promise.resolve(false);
    if(bot) return Promise.resolve(true);
    var data={access_key:KEY,subject:subject,from_name:fromName||'Agrinova website'};
    if(replyto) data.replyto=replyto;
    Object.keys(fields).forEach(function(k){data[k]=fields[k]});
    return fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)})
      .then(function(r){return r.json()}).then(function(j){return !!(j&&j.success)}).catch(function(){return false});
  };
})();
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
      var f=e.target,err=document.getElementById('formErr'),btn=f.querySelector('button[type=submit]');
      var name=f.name.value.trim(),email=f.email.value.trim(),msg=f.message.value.trim(),company=f.company.value.trim();
      var missing=[];if(!name)missing.push('your name');if(!/^\S+@\S+\.\S+$/.test(email))missing.push('a valid email');if(!msg)missing.push('what you need');
      if(missing.length){err.hidden=false;err.textContent='Add '+missing.join(', ')+' to send your enquiry.';return}
      err.hidden=true;
      var subject='Website enquiry: '+(company||name);
      var bot=f.botcheck&&f.botcheck.checked;
      btn.disabled=true;var label=btn.textContent;btn.textContent='Sending…';
      agriSend(subject,{'Name':name,'Company':company,'Email':email,'They are a':f.type.value,'Message':msg},email,name,bot).then(function(ok){
        btn.disabled=false;btn.textContent=label;
        if(ok){f.innerHTML='<div class="full form-thanks" tabindex="-1"><h3>Thank you, '+name.replace(/[<>&"]/g,'')+'.</h3><p>Your enquiry has reached our trading desk. We\'ll reply to '+email.replace(/[<>&"]/g,'')+' shortly.</p></div>';f.querySelector('.form-thanks').focus();return}
        var body='Name: '+name+'\nCompany: '+company+'\nEmail: '+email+'\nType: '+f.type.value+'\n\n'+msg;
        location.href='mailto:info@agrinova.ae?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      });
    });
  }
})();
(function(){var v=document.querySelector('.gh-film video'),b=document.querySelector('.gh-toggle');if(!v||!b)return;
  function set(p){if(p){var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}else v.pause();b.textContent=p?'Pause':'Play';b.setAttribute('aria-pressed',String(!p))}
  if(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches){v.removeAttribute('autoplay');set(false)}
  b.addEventListener('click',function(){set(v.paused)});})();
