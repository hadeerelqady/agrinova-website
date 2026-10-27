(function(){
  var P=AGRI.products, CATS=AGRI.cats, FULL=agriMonths, esc=agriEsc;
  var MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var now=new Date().getMonth();
  var state={m:now,cat:'all',peak:false,limit:20};
  var mEl=document.querySelector('.months'),cEl=document.querySelector('.chips'),more=document.getElementById('moreBtn');

  MONTHS.forEach(function(n,i){
    var b=document.createElement('button');b.type='button';b.textContent=n;b.setAttribute('aria-label',FULL[i]);
    if(i===now)b.className='now';
    b.addEventListener('click',function(){state.m=i;state.limit=20;render()});
    mEl.appendChild(b);
  });
  [{key:'all',name:'Everything'}].concat(CATS).forEach(function(c){
    var b=document.createElement('button');b.type='button';b.textContent=c.name;b.dataset.k=c.key;
    b.addEventListener('click',function(){state.cat=c.key;state.limit=20;render()});
    cEl.appendChild(b);
  });
  document.getElementById('peakOnly').addEventListener('change',function(e){state.peak=e.target.checked;state.limit=20;render()});
  more.addEventListener('click',function(){state.limit=999;render()});

  function render(){
    [].forEach.call(mEl.children,function(b,i){b.setAttribute('aria-pressed',i===state.m)});
    [].forEach.call(cEl.children,function(b){b.setAttribute('aria-pressed',b.dataset.k===state.cat)});
    var list=P.filter(function(p){var v=p.m[state.m];return v>=(state.peak?2:1)&&(state.cat==='all'||p.cat===state.cat)})
      .sort(function(a,b){return (b.m[state.m]-a.m[state.m])||((b.img?1:0)-(a.img?1:0))||a.en.localeCompare(b.en)});
    var peak=list.filter(function(p){return p.m[state.m]===2}).length;
    var catName=state.cat==='all'?'':' in '+CATS.filter(function(c){return c.key===state.cat})[0].name.toLowerCase();
    var s=document.querySelector('.summary'),g=document.querySelector('.grid');
    if(!list.length){s.textContent='';g.innerHTML='<div class="empty">Nothing'+esc(catName)+' is '+(state.peak?'at its peak':'in season')+' in '+FULL[state.m]+'. Try another month or category.</div>';more.hidden=true;return}
    s.innerHTML='In '+FULL[state.m]+' we supply <b>'+list.length+'</b> '+(list.length===1?'line':'lines')+esc(catName)+(state.peak?', all at their peak.':', '+peak+' of them at their peak.');
    g.innerHTML=list.slice(0,state.limit).map(function(p){return agriCard(p,state.m)}).join('');
    more.hidden=list.length<=state.limit;
    more.textContent='Show all '+list.length;
  }
  render();
})();
