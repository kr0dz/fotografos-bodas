import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join} from 'node:path';

// Hide WhatsApp CTAs until a verified destination replaces the retired number.
const files=dir=>readdirSync(dir).flatMap(name=>{const p=join(dir,name);return statSync(p).isDirectory()?files(p):[p]});
const css='<style id="retired-whatsapp-contact">a[href*="wa.me/"],a[href*="api.whatsapp.com/send"],[data-wa-general],[data-quote-form]{display:none!important}</style>';
const js='<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("a,button").forEach(el=>{if(/whatsapp/i.test(el.textContent||"")||/whatsapp/i.test(el.getAttribute("aria-label")||""))el.style.display="none";});});</script>';

const noticeStyles = '<style id="contact-service-notice-style">.contact-service-notice{background:#f3f1ec;color:#35332e;border-bottom:1px solid #d8d4cb;padding:12px 18px;text-align:center;font:13px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}.contact-service-notice strong{font-weight:700}.contact-service-notice a{font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}</style>';
const email='sanmigueldeallendetech@gmail.com';
function notice(en){
  const message=en
    ? 'We no longer have access to our previous WhatsApp number. We apologize for the inconvenience. Please email us at'
    : 'Ya no tenemos acceso a nuestro número anterior de WhatsApp. Lamentamos las molestias. Puedes escribirnos por correo a';
  const heading=en?'Important notice.':'Aviso importante.';
  return '<aside class="contact-service-notice" role="status"><strong>'+heading+'</strong> '+message+' <a href="mailto:'+email+'">'+email+'</a>.</aside>';
}
function injectNotice(value){
  const en=/<html\b[^>]*lang=["']en(?:-|["'])/i.test(value);
  return value.replace(/(<body\b[^>]*>)/i,(_,open)=>open+notice(en));
}


const relatedStyle='<style id="wedding-related-services-css">.wedding-related-services{margin:0;padding:35px 22px;background:#f5f1ed;color:#332c2a;text-align:center;border-top:1px solid #e3dcd4}.wedding-related-services-inner{max-width:790px;margin:auto}.wedding-related-services h2{font-size:clamp(20px,2.6vw,29px);line-height:1.25;margin:0 0 12px;font-family:Georgia,serif}.wedding-related-services p{font:15px/1.75 system-ui,sans-serif;margin:0}.wedding-related-services a{color:#73513f;text-decoration:underline;text-underline-offset:3px;font-weight:700}</style>';
function addRelatedServices(s,path){
 const rel=path.replaceAll('\\','/');
 if(!['dist/index.html','dist/en/index.html'].includes(rel))return s;
 const en=rel==='dist/en/index.html';
 const block=en
 ? '<section class="wedding-related-services" aria-label="Other local event resources"><div class="wedding-related-services-inner"><h2>More for your San Miguel celebration</h2><p>Looking for other local services? Explore <a href="https://escribeme.com.mx/en/events-san-miguel-de-allende">Escríbeme\'s event services guide</a>. If your venue needs commissioned murals or hand-painted details, see <a href="https://sanmigueldeallende.art/en/">SMArt\'s custom art projects</a>.</p></div></section>'
 : '<section class="wedding-related-services" aria-label="Otros servicios para eventos"><div class="wedding-related-services-inner"><h2>Más ideas para tu celebración en San Miguel</h2><p>¿Buscas otros proveedores locales? Explora <a href="https://escribeme.com.mx/eventos-san-miguel-de-allende">la guía de servicios para eventos de Escríbeme</a>. Si el lugar necesita murales o detalles pintados a mano, conoce <a href="https://sanmigueldeallende.art/">los proyectos de arte por encargo de SMArt</a>.</p></div></section>';
 return s.replace('</head>',relatedStyle+'</head>').replace('</main>',block+'</main>');
}

for(const path of files('dist')){
 if(!/\.(html|js|json|css)$/i.test(path))continue;
 let s=readFileSync(path,'utf8').replaceAll('447915374776','');
 if(path.endsWith('.html')&&!s.includes('id="retired-whatsapp-contact"'))s=injectNotice(s.replace('</head>',css+noticeStyles+'</head>').replace('</body>',js+'</body>'));
 if(path.endsWith('.html'))s=addRelatedServices(s,path);
 writeFileSync(path,s);
}
