(function(){
  const getPath=(obj,path)=>path.split('.').reduce((v,k)=>v?.[k],obj);
  const esc=(v='')=>String(v).replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[m]));
  async function loadContent(){
    try{
      let res=await fetch('/.netlify/functions/content-get?v='+Date.now());
      if(!res.ok) res=await fetch('/content/site.json?v='+Date.now());
      if(!res.ok) return;
      const data=await res.json();
      document.querySelectorAll('[data-cms-text]').forEach(el=>{
        const value=getPath(data,el.dataset.cmsText);
        if(typeof value==='string') el.dataset.cmsMultiline==='true'?el.innerHTML=esc(value).replace(/\n/g,'<br>'):el.textContent=value;
      });
      document.querySelectorAll('[data-cms-href]').forEach(el=>{const value=getPath(data,el.dataset.cmsHref);if(value)el.href=value});
      const caseRoot=document.querySelector('[data-cms-cases]');
      if(caseRoot&&Array.isArray(data.cases))caseRoot.innerHTML=data.cases.map(c=>`<article class="case-card"><img src="${esc(c.image)}" alt="${esc(c.title)}"><div class="case-head">${esc(c.label)}</div><div class="case-body"><div class="case-type">${esc(c.category)}</div><h3>${esc(c.title)}</h3><p><strong>상황</strong> ${esc(c.situation)}</p><p><strong>검토</strong> ${esc(c.review)}</p><p><strong>제안</strong> ${esc(c.proposal)}</p><p class="case-note">실제 특정 기업의 승인이나 성과를 의미하지 않습니다.</p></div></article>`).join('');
      const teamRoot=document.querySelector('[data-cms-team]');
      if(teamRoot&&Array.isArray(data.team))teamRoot.innerHTML=data.team.filter(m=>m.is_public).map(m=>`<article class="member"><img src="${esc(m.image)}" alt="${esc(m.name)}"><div class="body"><div class="role">${esc(m.role)}</div><h3>${esc(m.name)}</h3><p><strong>${esc(m.specialty)}</strong></p><p>${esc(m.bio)}</p></div></article>`).join('');
      const faqRoot=document.querySelector('[data-cms-faq]');
      if(faqRoot&&Array.isArray(data.faq))faqRoot.innerHTML=data.faq.map(f=>`<details><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join('');
    }catch(e){console.warn('CMS content load failed',e)}
  }
  document.addEventListener('DOMContentLoaded',loadContent);
})();
