(()=> {
const SUPABASE_URL="https://qimvmsiszdyytmdgcksl.supabase.co";
const SUPABASE_KEY="sb_publishable_QayJNYL0gQKnuP_rfgeKsg_9DOLi1K6";
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

const applyText=(key,value)=>{
 if(!value)return;
 const map={
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
 };
 map[key]?.();
};

function assetKey(raw){
 if(!raw||/^(data:|blob:|javascript:)/i.test(raw))return null;
 try{
  let path=raw;
  if(/^https?:\/\//i.test(path))path=new URL(path,location.href).pathname;
  path=decodeURIComponent(path.split(/[?#]/)[0]).replace(/^\/+/, '').replace(/^\.\//,'');
  return path;
 }catch(_){return null}
}
function applyMediaOverrides(rows){
 const overrides=new Map((rows||[]).filter(x=>x.asset_path&&x.public_url).map(x=>[assetKey(x.asset_path),x.public_url]));
 if(!overrides.size)return;
 const replace=(raw)=>{const key=assetKey(raw);return key&&overrides.get(key)||raw};
 const changedVideos=new Set();
 document.querySelectorAll('img[src],video[src],video[poster],source[src],a[href]').forEach(el=>{
  for(const attr of ['src','poster','href']){
   if(!el.hasAttribute(attr))continue;
   const before=el.getAttribute(attr),after=replace(before);
   if(after!==before){el.setAttribute(attr,after);const v=el.closest('video');if(v)changedVideos.add(v);if(el.tagName==='VIDEO')changedVideos.add(el)}
  }
  if(el.hasAttribute('srcset')){
   const before=el.getAttribute('srcset');
   const after=before.split(',').map(candidate=>{const parts=candidate.trim().split(/\s+/);parts[0]=replace(parts[0]);return parts.join(' ')}).join(', ');
   if(after!==before)el.setAttribute('srcset',after);
  }
 });
 const replaceCss=css=>css.replace(/url\((['"]?)(.*?)\1\)/g,(full,q,path)=>{const next=replace(path.trim());return next===path.trim()?full:'url('+q+next+q+')'});
 document.querySelectorAll('[style]').forEach(el=>{const before=el.getAttribute('style'),after=replaceCss(before);if(after!==before)el.setAttribute('style',after)});
 document.querySelectorAll('style').forEach(el=>{const before=el.textContent,after=replaceCss(before);if(after!==before)el.textContent=after});
 changedVideos.forEach(video=>{try{video.load()}catch(_){}});
}

async function refresh(){
 try{
  const [{data:content,error:contentError},{data:media,error:mediaError}]=await Promise.all([
   db.from('site_content').select('content_key,content_value'),
   db.from('site_media').select('asset_path,public_url,media_type').not('asset_path','is',null)
  ]);
  if(contentError)console.warn('Sharp CMS text could not be loaded',contentError.message);
  if(mediaError)console.warn('Sharp media overrides could not be loaded',mediaError.message);
  (content||[]).forEach(row=>applyText(row.content_key,row.content_value?.text));
  applyMediaOverrides(media||[]);
 }catch(e){console.warn('Sharp CMS content could not be loaded',e)}
}
refresh();
})();