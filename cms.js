(()=>{const URL="https://qimvmsiszdyytmdgcksl.supabase.co";const KEY="sb_publishable_QayJNYL0gQKnuP_rfgeKsg_9DOLi1K6";const db=window.supabase.createClient(URL,KEY);
const applyText=(key,value)=>{if(!value)return;const map={
'hero.eyebrow':()=>{const el=document.querySelector('.hero-content .eyebrow');if(el)el.textContent=value},
'hero.title':()=>{const el=document.querySelector('.hero-content h1');if(el)el.textContent=value},
'hero.subtitle':()=>{const el=document.querySelector('.hero-content p');if(el)el.textContent=value},
'founder.name':()=>{const el=document.querySelector('.owner-copy h3');if(el)el.textContent=value},
'founder.role':()=>{const el=document.querySelector('.owner-role');if(el)el.textContent=value},
'founder.bio':()=>{const el=document.querySelector('.owner-copy p');if(el)el.textContent=value},
'studio.address':()=>{document.querySelectorAll('.address').forEach(el=>el.textContent=value)},
'studio.phone':()=>{document.querySelectorAll('a[href^="tel:"]').forEach(el=>{el.href='tel:'+value.replace(/[^0-9+]/g,'');if(el.textContent.match(/[0-9]{5}/))el.textContent=value})},
'studio.instagram':()=>{document.querySelectorAll('a[href*="instagram.com"]').forEach(el=>el.href=value)},
'studio.whatsapp':()=>{document.querySelectorAll('a[href*="wa.me/"]').forEach(el=>el.href='https://wa.me/'+value.replace(/[^0-9]/g,''))}
};map[key]?.()};
async function refresh(){try{const [{data:content},{data:media}]=await Promise.all([db.from('site_content').select('content_key,content_value'),db.from('site_media').select('section,public_url,media_type,title,created_at').order('created_at',{ascending:true})]);(content||[]).forEach(row=>applyText(row.content_key,row.content_value?.text));const groups={};(media||[]).forEach(item=>(groups[item.section]??=[]).push(item));
const replaceImages=(section,selector)=>{const items=(groups[section]||[]).filter(x=>x.media_type==='image');document.querySelectorAll(selector).forEach((el,i)=>{if(items[i]){el.src=items[i].public_url;el.alt=items[i].title||el.alt}})};
replaceImages('hero','.hero-slide');replaceImages('portfolio','#portfolio .portfolio-category-grid img');replaceImages('about','.owner-photo img, .about-img img');replaceImages('location','.location-banner');
const videos=(groups.films||[]).filter(x=>x.media_type==='video');document.querySelectorAll('.film-card video').forEach((el,i)=>{if(videos[i]){el.src=videos[i].public_url;el.querySelectorAll('source').forEach(s=>s.remove());el.load()}});
}catch(e){console.warn('Sharp CMS content could not be loaded',e)}}
refresh();
})();