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

for(const path of files('dist')){
 if(!/\.(html|js|json|css)$/i.test(path))continue;
 let s=readFileSync(path,'utf8').replaceAll('447915374776','');
 if(path.endsWith('.html')&&!s.includes('id="retired-whatsapp-contact"'))s=injectNotice(s.replace('</head>',css+noticeStyles+'</head>').replace('</body>',js+'</body>'));
 writeFileSync(path,s);
}
