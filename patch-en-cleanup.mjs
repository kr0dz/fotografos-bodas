import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
const root='dist/en';
const walk=d=>readdirSync(d).flatMap(n=>{const p=join(d,n);return statSync(p).isDirectory()?walk(p):[p]});
const fixes={
  'Fotografía editorial, documental y video para bodas en San Miguel de Allende.':'Editorial and documentary wedding photography and film in San Miguel de Allende.',
  'Editorial + documental':'Editorial + documentary',
  'Santi & Clau — Historia editorial de inspiración':'Santi & Clau — Editorial inspiration story',
  'Fotografía de bodas en San Miguel de Allende':'Wedding photography in San Miguel de Allende',
  '<span>Fotógrafos Bodas</span>':'<span>Wedding Photographers</span>'
};
for(const file of walk(root).filter(f=>f.endsWith('.html'))){let s=readFileSync(file,'utf8');for(const [a,b] of Object.entries(fixes))s=s.split(a).join(b);writeFileSync(file,s)}
