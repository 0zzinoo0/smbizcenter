(function(){
  const getPath=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  const youtubeId=(url='')=>{const m=String(url).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/);return m?m[1]:''};
  function mediaMarkup(item,alt='',className='media-frame'){
    const type=item?.media_type||'image';
    if(type==='video'&&item.video)return `<div class="${className}"><video src="${esc(item.video)}" controls playsinline preload="metadata"></video></div>`;
    if(type==='youtube'&&youtubeId(item.youtube))return `<div class="${className}"><iframe src="https://www.youtube.com/embed/${esc(youtubeId(item.youtube))}" title="${esc(alt)}" allowfullscreen loading="lazy"></iframe></div>`;
    return `<div class="${className}"><img src="${esc(item?.image||'')}" alt="${esc(alt)}" loading="lazy"></div>`;
  }
  function applyHomeMedia(data){
    const h=data.home||{};const hero=document.querySelector('[data-cms-hero]');const root=document.querySelector('[data-cms-hero-media]');
    if(hero&&root){const type=h.hero_media_type||'image';root.innerHTML='';hero.style.backgroundImage='';
      if(type==='video'&&h.hero_video){const v=document.createElement('video');v.src=h.hero_video;v.autoplay=h.hero_autoplay!==false;v.muted=h.hero_muted!==false;v.loop=h.hero_loop!==false;v.playsInline=true;v.preload='metadata';if(v.autoplay)v.play().catch(()=>{});root.appendChild(v)}
      else if(type==='youtube'&&youtubeId(h.hero_youtube)){const id=youtubeId(h.hero_youtube),q=new URLSearchParams({autoplay:h.hero_autoplay!==false?'1':'0',mute:h.hero_muted!==false?'1':'0',controls:'0',loop:h.hero_loop!==false?'1':'0',playlist:id,modestbranding:'1',playsinline:'1'});root.innerHTML=`<iframe src="https://www.youtube.com/embed/${esc(id)}?${q}" allow="autoplay; encrypted-media" tabindex="-1"></iframe>`}
      else hero.style.backgroundImage=`url("${String(h.hero_image||'/assets/hero.png').replace(/"/g,'%22')}")`;
    }
    const about=document.querySelector('[data-cms-about-media]');if(about){const type=h.about_media_type||'image';if(type==='video'&&h.about_video)about.innerHTML=`<video src="${esc(h.about_video)}" controls playsinline preload="metadata"></video>`;else if(type==='youtube'&&youtubeId(h.about_youtube))about.innerHTML=`<iframe src="https://www.youtube.com/embed/${esc(youtubeId(h.about_youtube))}" allowfullscreen loading="lazy"></iframe>`;else about.innerHTML=`<img src="${esc(h.about_image||'/assets/consulting.png')}" alt="기업 상담 장면">`}
  }
  async function loadContent(){
    try{
      let res=await fetch('/.netlify/functions/content-get?v='+Date.now());if(!res.ok)res=await fetch('/content/site.json?v='+Date.now());if(!res.ok)return;const data=await res.json();
      document.querySelectorAll('[data-cms-text]').forEach(el=>{const value=getPath(data,el.dataset.cmsText);if(typeof value==='string')el.dataset.cmsMultiline==='true'?el.innerHTML=esc(value).replace(/\n/g,'<br>'):el.textContent=value});
      document.querySelectorAll('[data-cms-href]').forEach(el=>{const value=getPath(data,el.dataset.cmsHref);if(value)el.href=value});
      applyHomeMedia(data);
      const caseRoot=document.querySelector('[data-cms-cases]');if(caseRoot&&Array.isArray(data.cases))caseRoot.innerHTML=data.cases.map(c=>`<article class="case-card">${mediaMarkup(c,c.title)}<div class="case-head">${esc(c.label)}</div><div class="case-body"><div class="case-type">${esc(c.category)}</div><h3>${esc(c.title)}</h3><p><strong>상황</strong> ${esc(c.situation)}</p><p><strong>검토</strong> ${esc(c.review)}</p><p><strong>제안</strong> ${esc(c.proposal)}</p><p class="case-note">실제 특정 기업의 승인이나 성과를 의미하지 않습니다.</p></div></article>`).join('');
      const teamRoot=document.querySelector('[data-cms-team]');if(teamRoot&&Array.isArray(data.team))teamRoot.innerHTML=data.team.filter(m=>m.is_public).map(m=>`<article class="member">${mediaMarkup(m,m.name)}<div class="body"><div class="role">${esc(m.role)}</div><h3>${esc(m.name)}</h3><p><strong>${esc(m.specialty)}</strong></p><p>${esc(m.bio)}</p></div></article>`).join('');
      const faqRoot=document.querySelector('[data-cms-faq]');if(faqRoot&&Array.isArray(data.faq))faqRoot.innerHTML=data.faq.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');
    }catch(e){console.warn('CMS content load failed',e)}
  }
  document.addEventListener('DOMContentLoaded',loadContent);
})();
