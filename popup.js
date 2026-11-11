const A=globalThis.browser??globalThis.chrome,$=s=>document.querySelector(s);
const mobile=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&matchMedia('(hover:none)').matches);
document.documentElement.dataset.layout=mobile?'mobile':'desktop';
const p=d=>`<path d="${d}"/>`;
const I={in:p('M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3'),out:p('M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9'),paste:p('M8 2h8v4H8zM16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2'),copy:p('M10 8h10a2 2 0 012 2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V10a2 2 0 012-2zM4 16a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2'),save:p('M12 3v12M7 10l5 5 5-5M5 21h14'),x:p('M18 6L6 18M6 6l12 12'),info:p('M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 7.5v.01'),more:'<circle cx="12" cy="5" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="19" r="1.6" fill="currentColor"/>',trash:p('M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6'),lock:p('M6 11h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zM8 11V7a4 4 0 018 0v4'),json:p('M8 3H7a2 2 0 00-2 2v4a2 2 0 01-2 2 2 2 0 012 2v4a2 2 0 002 2h1M16 3h1a2 2 0 012 2v4a2 2 0 002 2 2 2 0 00-2 2v4a2 2 0 01-2 2h-1'),hash:p('M4 9h16M4 15h16M10 3L8 21M16 3l-2 18'),chev:p('M6 9l6 6 6-6')};
const svg=n=>`<svg viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;
document.querySelectorAll('i[data-i]').forEach(e=>e.innerHTML=svg(e.dataset.i));

const ta=$('#data'),dlg=$('#dlg'),te=new TextEncoder();
const ctr=()=>({name:'AES-CTR',counter:Uint8Array.from({length:16},(_,i)=>+(i===15)),length:128});
const key=async(pw,u)=>crypto.subtle.importKey('raw',await crypto.subtle.digest('SHA-256',te.encode(pw)),'AES-CTR',false,[u]);
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=s=>Uint8Array.from((s.match(/.{2}/g)??[]).map(h=>parseInt(h,16)));
const isHex=t=>/^[0-9a-fA-F]+$/.test(t)&&!(t.length%2);
const plain=t=>{try{return JSON.parse(t)}catch{try{return JSON.parse(atob(t))}catch{}}};
const fbCookies=()=>A.cookies.getAll({domain:'facebook.com'});
const reload=async()=>{for(const t of await A.tabs.query({})){if(!t.url||t.discarded)continue;try{if(new URL(t.url).hostname.endsWith('facebook.com'))A.tabs.update(t.id,{url:t.url})}catch{}}};

let T;
function toast(m,k='ok'){const t=$('#toast');t.textContent=m;t.dataset.k=k;t.classList.add('on');clearTimeout(T);T=setTimeout(()=>t.classList.remove('on'),k==='err'?4500:2600)}

function sheet(html,cls='',setup){return new Promise(res=>{
  dlg.className=cls;dlg.innerHTML=`<form method="dialog" class="box">${html}</form>`;
  const f=dlg.firstChild;let out=null;
  const close=()=>{dlg.classList.add('out');setTimeout(()=>{dlg.close();dlg.classList.remove('out')},140)};
  f.addEventListener('submit',e=>{e.preventDefault();out={v:e.submitter?.value??'',fd:new FormData(f)};close()});
  dlg.onclick=e=>{if(e.target===dlg)close()};
  dlg.onclose=()=>res(out);
  setup?.(f);dlg.showModal();
})}
const it=(v,i,t,d,c='')=>`<button class="it ${c}" value="${v}">${svg(i)}<span><b>${t}</b><small>${d}</small></span></button>`;

async function askPw(title,text,confirm){
  const r=await sheet(`<h2>${title}</h2><p>${text}</p><input type="password" name="a" placeholder="Password" required autofocus autocomplete="off">${confirm?'<input type="password" name="b" placeholder="Confirm password" required autocomplete="off">':''}<div class="acts"><button class="btn p" value="ok">Continue</button><button class="btn" value="" formnovalidate>Cancel</button></div>`,'',f=>{
    if(!confirm)return;const[a,b]=f.querySelectorAll('input');
    a.oninput=b.oninput=()=>b.setCustomValidity(a.value===b.value?'':'Passwords don’t match');
  });
  return r?.v==='ok'?r.fd.get('a'):null;
}

function detect(t){
  if(!t)return{k:'',l:'Empty',n:0};
  const a=plain(t);
  if(Array.isArray(a)){let j=1;try{JSON.parse(t)}catch{j=0}return{k:j?'json':'b64',l:j?'JSON':'Base64',n:a.length}}
  if(isHex(t))return{k:'enc',l:'Encrypted'};
  return{k:'bad',l:'Not recognized'};
}
function sync(){
  const t=ta.value.trim(),d=detect(t);
  $('#chip').dataset.k=d.k;$('#chip').innerHTML=(d.k==='enc'?svg('lock'):'')+d.l;
  $('#meta').textContent=!t?'':(d.n?`${d.n} cookies · `:'')+`${t.length.toLocaleString()} characters`;
}
ta.addEventListener('input',sync);sync();

async function doImport(){
  const t=ta.value.trim();
  if(!t)return toast('Paste your UFC data first.','err');
  let a=plain(t);
  if(!Array.isArray(a)&&isHex(t)){
    const pw=await askPw('Encrypted UFC data','Enter the password you chose when exporting.');
    if(pw==null)return;
    try{a=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt(ctr(),await key(pw,'decrypt'),unhex(t))))}catch{return toast('Wrong password.','err')}
  }
  if(!Array.isArray(a))return toast('This isn’t valid UFC data.','err');
  try{
    for(const c of await fbCookies())await A.cookies.remove({url:`https://facebook.com${c.path}`,name:c.name});
    let n=0;
    for(const c of a){
      if(!String(c.domain||'').endsWith('facebook.com'))continue;
      await A.cookies.set({url:'https://facebook.com'+(c.path||'/'),name:c.key,value:c.value,expirationDate:Date.now()/1e3+84600*365,domain:'.facebook.com'});n++;
    }
    await reload();toast(`Imported ${n} cookies. Facebook tabs reloaded.`);
  }catch(e){toast('Import failed: '+e.message,'err')}
}

async function doExport(kind){
  let pw;
  if(kind==='enc'){pw=await askPw('Protect your export','Choose a password. You’ll need it to import this data again.',true);if(pw==null)return}
  try{
    const now=new Date().toISOString();
    const cs=(await fbCookies()).map(c=>({key:c.name,value:c.value,domain:'facebook.com',path:c.path,hostOnly:c.hostOnly,creation:now,lastAccessed:now}));
    if(!cs.length)return toast('No Facebook cookies found. Log in to Facebook first.','err');
    let m=JSON.stringify(cs,null,'\t');
    if(kind==='enc')m=hex(await crypto.subtle.encrypt(ctr(),await key(pw,'encrypt'),te.encode(m)));
    else if(kind==='b64')m=btoa(m);
    ta.value=m;sync();toast(`Exported ${cs.length} cookies.`);
  }catch(e){toast('Export failed: '+e.message,'err')}
}

async function exportMenu(){
  const r=await sheet(`<h2 class="hd">Export Facebook session</h2>${it('json','json','JSON','Readable, unprotected')}${it('enc','lock','Encrypted','Locked with a password')}${it('b64','hash','Base64','Compact text, unprotected')}`,mobile?'':'menu');
  if(r?.v)doExport(r.v);
}

async function softLogout(){
  const r=await sheet(`<h2>Soft logout?</h2><p>Removes your Facebook session from this browser without logging out on Facebook’s servers.</p><div class="acts"><button class="btn dg" value="ok">Soft logout</button><button class="btn" value="">Cancel</button></div>`);
  if(r?.v!=='ok')return;
  try{
    for(const c of await fbCookies())if(c.name!=='sb'&&c.name!=='dbln')await A.cookies.remove({url:'https://facebook.com'+c.path,name:c.name});
    await reload();toast('Local Facebook session removed.');
  }catch(e){toast('Failed: '+e.message,'err')}
}

async function about(){
  await sheet(`<div class="ab"><img class="logo" src="assets/logo/128.png" alt=""><div><h2>C3C UFC Utility</h2><p>Version ${A.runtime.getManifest().version}</p></div></div><p>Created by <b>Allou Mohamed</b></p><p class="fine">Import and export Facebook session (UFC) data. Everything runs on this device; nothing is sent anywhere.</p><p class="fine">Based on C3C UFC Utility by BadAimWeeb, MIT License.</p><div class="acts"><button class="btn p" value="">Done</button></div>`);
}

async function moreMenu(){
  const r=await sheet(`${it('about','info','About & credits','Version and author')}${it('logout','trash','Soft logout','Delete local UFC data','dg')}`);
  if(r?.v==='about')about();if(r?.v==='logout')softLogout();
}

$('#imp').onclick=doImport;
$('#exp').onclick=exportMenu;
$('#about').onclick=about;
$('#more').onclick=moreMenu;
$('#lo').onclick=softLogout;
$('#clr').onclick=()=>{ta.value='';sync()};
$('#pst').onclick=async()=>{try{ta.value=await navigator.clipboard.readText();sync()}catch{toast('Clipboard access was blocked.','err')}};
$('#cpy').onclick=async()=>{if(!ta.value)return toast('Nothing to copy yet.','err');try{await navigator.clipboard.writeText(ta.value);toast('Copied to clipboard.')}catch{toast('Couldn’t copy.','err')}};
$('#sav').onclick=()=>{
  const t=ta.value;if(!t)return toast('Nothing to save yet.','err');
  const k=detect(t.trim()).k,ext={json:'json',b64:'b64',enc:'enc'}[k]||'txt';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:k==='json'?'application/json':'text/plain'}));
  a.download='ufc-facebook.'+ext;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);toast('Saved to file.');
};
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!dlg.open){e.preventDefault();doImport()}});
if(mobile)document.addEventListener('click',e=>{if(e.target.closest('button'))navigator.vibrate?.(8)});
