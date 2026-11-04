// SQLite adapter exercises the actual migration and SQL used by the D1 handler.
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../backend/migrations/0001_initial.sql',import.meta.url),'utf8'));
 const prepare=(sql,values=[])=>({
  bind(...next){return prepare(sql,next);},
  async first(){return db.prepare(sql).get(...values)||null;},
  async all(){return {results:db.prepare(sql).all(...values),success:true};},
  async run(){const out=db.prepare(sql).run(...values);return {results:[],success:true,meta:{changes:Number(out.changes)}};}
 });
 return {prepare,async batch(statements){db.exec('BEGIN');try{const rows=[];for(const s of statements)rows.push(await s.all());db.exec('COMMIT');return rows;}catch(error){db.exec('ROLLBACK');throw error;}},close(){db.close();},raw:db};
}
