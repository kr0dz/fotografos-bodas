import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync,rmSync} from 'node:fs';
import {join,dirname,relative} from 'node:path';

const root='dist';
const base='https://www.fotografosbodas.com.mx';
const translations=JSON.parse(readFileSync('translations-en.json','utf8'));

const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
const spanishFiles=walk(root).filter(f=>f.endsWith('index.html')&&!relative(root,f).replaceAll('\\','/').startsWith('en/'));

const esUrl=rel=>rel==='index.html'?'/':'/'+dirname(rel).replaceAll('\\','/')+'/';
const enUrl=rel=>{const es=esUrl(rel);return es==='/'?'/en/':'/en'+es};
const hreflang=(es,en)=>`<link rel="alternate" hreflang="es-MX" href="${base}${es}"><link rel="alternate" hreflang="en" href="${base}${en}"><link rel="alternate" hreflang="x-default" href="${base}${es}">`;

const contextualMessages={
  'servicios/fotografia-bodas-san-miguel-de-allende/index.html':`Hello! 👋 I’d like to inquire about PHOTOGRAPHY ONLY coverage for my wedding in San Miguel de Allende. I’d love to know about availability and options. 📸

[BODAS · PHOTOGRAPHY]`,
  'servicios/foto-video-bodas-san-miguel-de-allende/index.html':`Hello! 👋 I’d like to inquire about PHOTO + VIDEO coverage for my wedding in San Miguel de Allende. I’d love to know about availability and options. 💍📸🎬

[BODAS · PHOTO + VIDEO]`,
  'servicios/video-bodas-san-miguel-de-allende/index.html':`Hello! 👋 I’d like to inquire about VIDEO ONLY / WEDDING FILM coverage for my wedding in San Miguel de Allende. I’d love to know about availability and options. 🎬

[BODAS · VIDEO]`,
  'servicios/wedding-weekend-fotografia-video-san-miguel-de-allende/index.html':`Hello! 👋 I’d like to inquire about WEDDING WEEKEND coverage in San Miguel de Allende, including the welcome party, wedding and/or brunch. I’d love to know about availability and options. 💍📸🎬

[BODAS · WEDDING WEEKEND]`,
  'portafolio/santi-clau/index.html':`Hello! 👋 I loved the Santi & Clau editorial story and I’d like to inquire about a similar visual direction for my wedding in San Miguel de Allende.

[BODAS · PORTFOLIO]`
};
const wa=m=>`https://wa.me/447915374776?text=${encodeURIComponent(m).replace(/'/g,'%27')}`;

function replaceAllTranslations(s){
  for(const [from,to] of Object.entries(translations).sort((a,b)=>b[0].length-a[0].length)) s=s.split(from).join(to);
  return s;
}

function patchSpanishSelector(s,es,en){
  s=s.replace(/<a class="language" href="[^"]*"[^>]*>EN<\/a>/,`<a class="language" href="${en}" aria-label="Cambiar idioma a inglés">EN</a>`);
  s=s.replace(/<div class="mobile-language"[^>]*>[\s\S]*?<\/div><\/div><\/div><\/div><\/header>/,
    `<div class="mobile-language" aria-label="Selector de idioma"><span>Idioma</span><div><a class="active" href="${es}" aria-current="page">ES</a><span>/</span><a href="${en}">EN</a></div></div></div></div></header>`);
  return s;
}

function prefixEnglishLinks(s){
  const targets=['/portafolio/','/servicios/','/guia/','/#'];
  for(const t of targets) s=s.split(`href="${t}`).join(`href="/en${t}`);
  s=s.replace(/class="brand" href="\/"/g,'class="brand" href="/en/"');
  return s;
}

function patchEnglishSelector(s,es,en){
  s=s.replace(/<a class="language" href="[^"]*"[^>]*>EN<\/a>/,`<a class="language" href="${es}" aria-label="Switch language to Spanish">ES</a>`);
  s=s.replace(/<a class="language" href="[^"]*"[^>]*>ES<\/a>/,`<a class="language" href="${es}" aria-label="Switch language to Spanish">ES</a>`);
  s=s.replace(/<div class="mobile-language"[^>]*>[\s\S]*?<\/div><\/div><\/div><\/div><\/header>/,
    `<div class="mobile-language" aria-label="Language selector"><span>Language</span><div><a href="${es}">ES</a><span>/</span><a class="active" href="${en}" aria-current="page">EN</a></div></div></div></div></header>`);
  return s;
}

for(const file of spanishFiles){
  const rel=relative(root,file).replaceAll('\\','/');
  const es=esUrl(rel), en=enUrl(rel);
  let esHtml=readFileSync(file,'utf8');
  esHtml=esHtml.replace(/<link rel="alternate" hreflang="[^>]+>/g,'');
  esHtml=esHtml.replace('</head>',hreflang(es,en)+'</head>');
  esHtml=patchSpanishSelector(esHtml,es,en);
  writeFileSync(file,esHtml);

  let enHtml=esHtml;
  enHtml=enHtml.replace('<html lang="es">','<html lang="en">');
  enHtml=replaceAllTranslations(enHtml);
  enHtml=prefixEnglishLinks(enHtml);
  enHtml=enHtml.replace(/<link rel="canonical" href="[^"]+">/,`<link rel="canonical" href="${base}${en}">`);
  enHtml=enHtml.replace(new RegExp(`"url":"${base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}${es.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`,'g'),`"url":"${base}${en}"`);
  enHtml=enHtml.replace(new RegExp(`"mainEntityOfPage":"${base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}${es.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}"`,'g'),`"mainEntityOfPage":"${base}${en}"`);
  enHtml=enHtml.replace(/<link rel="alternate" hreflang="[^>]+>/g,'');
  enHtml=enHtml.replace('</head>',hreflang(es,en)+'</head>');
  enHtml=patchEnglishSelector(enHtml,es,en);

  if(contextualMessages[rel]){
    enHtml=enHtml.replace(/href="https:\/\/wa\.me\/447915374776\?text=[^"]+"/g,`href="${wa(contextualMessages[rel])}"`);
  }

  const out=join(root,'en',rel);
  mkdirSync(dirname(out),{recursive:true});
  writeFileSync(out,enHtml);
}

// Make the shared JS language-aware without changing Spanish behavior.
let js=readFileSync(join(root,'script.js'),'utf8');
const waEs='https://wa.me/447915374776?text=%C2%A1Hola%21%20%F0%9F%91%8B%20Estoy%20buscando%20informaci%C3%B3n%20sobre%20fotograf%C3%ADa%20para%20mi%20boda%20en%20San%20Miguel%20de%20Allende.%20Me%20gustar%C3%ADa%20conocer%20las%20opciones%20disponibles.%20%F0%9F%92%8D%F0%9F%93%B8%0A%0A%5BBODAS%5D';
const waEn=wa(`Hello! 👋 I'm looking for information about wedding photography for my wedding in San Miguel de Allende. I'd like to learn about the available options. 💍📸

[BODAS]`);
js=js.replace(/const WA_GENERAL='[^']+';/,`const WA_GENERAL_ES=${JSON.stringify(waEs)},WA_GENERAL_EN=${JSON.stringify(waEn)},IS_EN=document.documentElement.lang==='en',WA_GENERAL=IS_EN?WA_GENERAL_EN:WA_GENERAL_ES;`);
const formHandler=`const f=document.querySelector('[data-quote-form]'); if(f) f.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(f);const msg=IS_EN?\`Hello! 👋 I'd like to inquire about wedding photography in San Miguel de Allende.\\n\\nName: \${d.get('name')||'-'}\\nDate: \${d.get('date')||'-'}\\nVenue: \${d.get('venue')||'-'}\\nCoverage: \${d.get('coverage')||'-'}\\nDetails: \${d.get('details')||'-'}\\n\\n[BODAS · FORM]\`:\`¡Hola! 👋 Quiero cotizar fotografía para mi boda en San Miguel de Allende.\\n\\nNombre: \${d.get('name')||'-'}\\nFecha: \${d.get('date')||'-'}\\nVenue: \${d.get('venue')||'-'}\\nCobertura: \${d.get('coverage')||'-'}\\nDetalles: \${d.get('details')||'-'}\\n\\n[BODAS · FORMULARIO]\`;window.open('https://wa.me/447915374776?text='+encodeURIComponent(msg),'_blank','noopener')});`;
js=js.replace(/const f=document\.querySelector\('\[data-quote-form\]'\);[\s\S]*$/,formHandler);
writeFileSync(join(root,'script.js'),js);

// Rebuild sitemap with exact ES/EN mirrors; demo story remains noindex and excluded.
const indexable=[
  '/',
  '/portafolio/',
  '/servicios/fotografia-bodas-san-miguel-de-allende/',
  '/servicios/foto-video-bodas-san-miguel-de-allende/',
  '/servicios/video-bodas-san-miguel-de-allende/',
  '/servicios/wedding-weekend-fotografia-video-san-miguel-de-allende/',
  '/guia/como-elegir-fotografo-bodas-san-miguel-de-allende/',
  '/guia/foto-video-boda-san-miguel-de-allende/',
  '/guia/cuantos-fotografos-necesita-boda-san-miguel-de-allende/'
];
const urls=[...indexable,...indexable.map(u=>u==='/'?'/en/':'/en'+u)];
const sitemap=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u=>`<url><loc>${base}${u}</loc></url>`).join('\n')}\n</urlset>\n`;
writeFileSync(join(root,'sitemap.xml'),sitemap);
