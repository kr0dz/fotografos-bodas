import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const archive = Buffer.from(readFileSync('site.b64', 'utf8').trim(), 'base64');
writeFileSync('site.tar.gz', archive);
mkdirSync('dist', { recursive: true });
execFileSync('tar', ['-xzf', 'site.tar.gz', '-C', 'dist'], { stdio: 'inherit' });
