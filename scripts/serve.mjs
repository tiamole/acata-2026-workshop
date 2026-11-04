import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../public/',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document','.zip':'application/zip'};
export function createServer(){return http.createServer(async(req,res)=>{
 try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const relative=pathname==='/'?'index.html':pathname.replace(/^\/+/, '');const target=path.resolve(root,relative);if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}if(!(await stat(target)).isFile()){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(await readFile(target));}catch{res.writeHead(404).end('Not found');}
});}
if(process.argv[1]===fileURLToPath(import.meta.url)){const port=Number(process.env.PORT)||4173;createServer().listen(port,'127.0.0.1',()=>process.stdout.write(`Workshop preview: http://127.0.0.1:${port}\n`));}
