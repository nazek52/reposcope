export function validateLogin(value) {
  const login=String(value).trim();
  if(!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login)||login.includes('--'))throw new Error('Enter a GitHub username, for example nazek52.');
  return login;
}
export function summarize(repos){
  const languages=new Map();
  for(const r of repos)if(r.language)languages.set(r.language,(languages.get(r.language)||0)+1);
  return {count:repos.length,stars:repos.reduce((n,r)=>n+(r.stargazers_count||0),0),missingDescription:repos.filter(r=>!r.description?.trim()).length,languages:[...languages].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))};
}
export async function loadPortfolio(value,{fetchImpl=fetch,signal,onProgress=()=>{}}={}){
  const login=validateLogin(value);let remaining=null;
  async function get(path){
    const timeout=AbortSignal.timeout(15000);
    const r=await fetchImpl('https://api.github.com'+path,{headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10'},signal:signal?AbortSignal.any([signal,timeout]):timeout});
    const budget=r.headers.get('x-ratelimit-remaining');if(budget!==null)remaining=Number(budget);
    if(!r.ok){
      if(r.status===404)throw new Error('GitHub account not found. Check the username.');
      if(r.status===403||r.status===429){
        const reset=Number(r.headers.get('x-ratelimit-reset'));
        throw new Error('GitHub has limited API requests from this network.'+(reset>0?' Try again after '+new Date(reset*1000).toLocaleTimeString()+'.':' Please try again later.'));
      }
      throw new Error('GitHub returned HTTP '+r.status+'. Please try again later.');
    }return r.json();
  }
  const profile=await get('/users/'+encodeURIComponent(login));const repos=[];let truncated=false;
  for(let page=1;page<=10;page++){
    const batch=await get('/users/'+encodeURIComponent(login)+'/repos?type=owner&sort=updated&per_page=100&page='+page);
    if(!Array.isArray(batch))throw new Error('Unexpected repository response.');
    repos.push(...batch);onProgress(repos.length);
    if(batch.length<100)break;if(page===10)truncated=true;
  }
  return {profile,repos,remaining,truncated,fetchedAt:new Date().toISOString()};
}
