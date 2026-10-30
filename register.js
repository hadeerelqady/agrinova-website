(function(){
  var tabs=[].slice.call(document.querySelectorAll('.reg-tab')),panels={supplier:document.getElementById('panel-supplier'),customer:document.getElementById('panel-customer')};
  if(!tabs.length) return;
  function show(k,focus){
    tabs.forEach(function(t){var on=t.dataset.k===k;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;if(on&&focus)t.focus()});
    Object.keys(panels).forEach(function(p){panels[p].hidden=p!==k});
    if(history.replaceState) history.replaceState(null,'','#'+k);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t.dataset.k)});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];show(n.dataset.k,true)}});
  });
  show(location.hash==='#customer'?'customer':'supplier');
  window.addEventListener('hashchange',function(){if(location.hash==='#customer'||location.hash==='#supplier')show(location.hash.slice(1))});

  function val(f,n){var el=f.elements[n];if(!el)return'';if(el.length&&!el.tagName){return [].filter.call(el,function(x){return x.checked}).map(function(x){return x.value}).join(', ')}return (el.type==='checkbox'?(el.checked?'Yes':'No'):el.value||'').trim()}

  [].forEach.call(document.querySelectorAll('form.reg'),function(f){
    var kind=f.dataset.kind, err=f.querySelector('.reg-err'), done=f.parentNode.querySelector('.reg-done');
    f.addEventListener('input',function(e){var t=e.target;if(t.getAttribute('aria-invalid')==='true')t.setAttribute('aria-invalid','false');var g=t.closest('[data-required-group]');if(g&&g.querySelector('input:checked'))g.classList.remove('invalid')});
    f.addEventListener('change',function(e){var t=e.target;if(t.getAttribute('aria-invalid')==='true')t.setAttribute('aria-invalid','false');var g=t.closest('[data-required-group]');if(g&&g.querySelector('input:checked'))g.classList.remove('invalid')});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var missing=[];
      [].forEach.call(f.querySelectorAll('[required]'),function(el){
        var ok=el.type==='checkbox'?el.checked:el.type==='email'?/^\S+@\S+\.\S+$/.test(el.value.trim()):!!el.value.trim();
        el.setAttribute('aria-invalid',ok?'false':'true');
        if(!ok) missing.push(el.dataset.label||el.name);
      });
      var groups=f.querySelectorAll('[data-required-group]');
      [].forEach.call(groups,function(g){var any=g.querySelector('input:checked');g.classList.toggle('invalid',!any);if(!any)missing.push(g.dataset.requiredGroup)});
      if(missing.length){err.hidden=false;err.textContent='Please complete: '+missing.join(', ')+'.';var first=f.querySelector('[aria-invalid="true"], .invalid input');if(first)first.focus();return}
      err.hidden=true;
      var lines=[],seen={};
      [].forEach.call(f.querySelectorAll('[data-label]'),function(el){
        var n=el.name||el.dataset.name;if(seen[n])return;seen[n]=1;
        var v=el.dataset.name?val(f,n):val(f,el.name);
        if(v) lines.push((el.dataset.label)+': '+v);
      });
      var company=val(f,'company')||val(f,'name');
      var subject=(kind==='supplier'?'Supplier registration: ':'Customer registration: ')+company;
      var body=subject+'\n\n'+lines.join('\n')+'\n\nSent from the registration page on the Agrinova website.';
      f.hidden=true; done.hidden=false;
      done.querySelector('.reg-copy-text').value=body;
      done.querySelector('.reg-mail').href='mailto:info@agrinova.ae?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
      done.querySelector('h3').focus();
      location.href='mailto:info@agrinova.ae?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
    });
  });

  [].forEach.call(document.querySelectorAll('.reg-copy'),function(b){
    b.addEventListener('click',function(){
      var t=b.closest('.reg-done').querySelector('.reg-copy-text');
      var ok=function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy details'},2000)};
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t.value).then(ok,function(){t.hidden=false;t.select()})}else{t.hidden=false;t.select()}
    });
  });
  [].forEach.call(document.querySelectorAll('.reg-again'),function(b){
    b.addEventListener('click',function(){var d=b.closest('.reg-done');d.hidden=true;d.parentNode.querySelector('form.reg').hidden=false});
  });
})();
