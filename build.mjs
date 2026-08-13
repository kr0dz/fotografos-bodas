import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const names=['site.part00','site.part01a','site.part01b','site.part02','site.part03','site.part04'];
const data=names.map((name)=>readFileSync(name,'utf8').trim()).join('');
writeFileSync('site.tar.gz',Buffer.from(data,'base64'));
mkdirSync('dist',{recursive:true});
execFileSync('tar',['-xzf','site.tar.gz','-C','dist'],{stdio:'inherit'});
await import('./patch-menu.mjs');
