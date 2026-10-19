import {readdirSync,readFileSync,writeFileSync,statSync} from 'node:fs';
import {join} from 'node:path';

// Hide WhatsApp CTAs until a verified destination replaces the retired number.
const files=dir=>readdirSync(dir).flatMap(name=>{const p=join(dir,name);return statSync(p).isDirectory()?files(p):[p]});
const css='<style id="retired-whatsapp-contact">a[href*="wa.me/"],a[href*="api.whatsapp.com/send"],[data-wa-general],[data-quote-form]{display:none!important}</style>';
const js='<script>document.addEventListener("DOMContentLoaded",()=>{document.querySelectorAll("a,button").forEach(el=>{if(/whatsapp/i.test(el.textContent||"")||/whatsapp/i.test(el.getAttribute("aria-label")||""))el.style.display="none";});});</script>';
for(const path of files('dist')){
 if(!/\.(html|js|json|css)$/i.test(path))continue;
 let s=readFileSync(path,'utf8').replaceAll('447915374776','');
 if(path.endsWith('.html')&&!s.includes('id="retired-whatsapp-contact"'))s=s.replace('</head>',css+'</head>').replace('</body>',js+'</body>');
 writeFileSync(path,s);
}
