const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
// Arrays retain order; matching identified items can merge field by field.
export function mergeDrafts(base,local,remote){
 const conflicts=[];
 function merge(b,l,r,path){
  if(same(l,r)||same(b,r))return structuredClone(l);
  if(same(b,l))return structuredClone(r);
  if(object(b)&&object(l)&&object(r))return Object.fromEntries([...new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)])].map(k=>[k,merge(b[k],l[k],r[k],path?path+'.'+k:k)]).filter(([,v])=>v!==undefined));
  if([b,l,r].every(Array.isArray)&&b.length===l.length&&b.length===r.length&&b.every((v,i)=>object(v)&&v.id&&v.id===l[i]?.id&&v.id===r[i]?.id))return b.map((v,i)=>merge(v,l[i],r[i],path+'['+v.id+']'));
  conflicts.push(path||'draft');return structuredClone(l);
 }
 return {draft:merge(base,local,remote,''),conflicts};
}
