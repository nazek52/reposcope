import {validateLogin,loadPortfolio,summarize} from './github.js';
const $=id=>document.getElementById(id);let portfolio,controller;const cache=new Map();
function el(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
function inScope(){return portfolio.repos.filter(r=>$('include-forks').checked||!r.fork);}
function render(){
 const all=inScope(),s=summarize(all);
 $('profile-name').textContent=portfolio.profile.name||portfolio.profile.login;
 $('bio').textContent=portfolio.profile.bio||'@'+portfolio.profile.login;
 $('profile-link').href='https://github.com/'+encodeURIComponent(portfolio.profile.login);
 $('freshness').textContent='Fetched '+new Date(portfolio.fetchedAt).toLocaleString()+' · '+(portfolio.remaining??'Unknown')+' API requests left on this network'+(portfolio.truncated?' · Limited to first 1,000 repositories':'');
 $('metrics').replaceChildren(...[[s.count,'Repositories in scope'],[s.stars,'Total stars'],[s.languages.length,'Primary languages'],[s.missingDescription,'Without a description']].map(([n,label])=>{const d=el('div',undefined,'metric');d.append(el('strong',n.toLocaleString()),el('span',label));return d;}));
 const langs=$('languages');langs.replaceChildren();if(!s.languages.length)langs.append(el('p','No primary language reported.','muted'));
 for(const [name,count]of s.languages.slice(0,8)){const row=el('div',undefined,'language'),title=el('div'),bar=el('div',undefined,'bar'),fill=el('span');title.append(el('span',name),el('span',count+' repos'));fill.style.width=count/Math.max(s.count,1)*100+'%';bar.append(fill);row.append(title,bar);langs.append(row);}
 $('recommendation').textContent=s.missingDescription?s.missingDescription+' repositories have no description. Add a short explanation of the problem, your approach and how to try it.':s.count?'Every repository in this scope has a description. Next, check that the README explains setup, examples and limitations.':'No original public repositories found. Include forks to see other public work.';
 const query=$('filter').value.toLowerCase().trim(),list=all.filter(r=>(r.name+' '+(r.description||'')+' '+(r.language||'')).toLowerCase().includes(query));
 list.sort($('sort').value==='name'?(a,b)=>a.name.localeCompare(b.name):$('sort').value==='updated'?(a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at):(a,b)=>(b.stargazers_count||0)-(a.stargazers_count||0)||a.name.localeCompare(b.name));
 $('list-title').textContent='Repositories ('+list.length+')';$('repos').replaceChildren();
 if(!list.length)$('repos').append(el('p','No repositories match this view.','muted'));
 for(const r of list){const card=el('article',undefined,'repo'),heading=el('h4'),link=el('a',r.name);link.href='https://github.com/'+encodeURIComponent(r.owner.login)+'/'+encodeURIComponent(r.name);link.target='_blank';link.rel='noopener noreferrer';heading.append(link);const tags=el('div',undefined,'tags');if(r.fork)tags.append(el('span','Fork','tag'));if(r.archived)tags.append(el('span','Archived','tag'));const meta=el('div',undefined,'repo-meta');meta.append(el('span',r.language||'No primary language'),el('span','☆ '+(r.stargazers_count||0).toLocaleString()),el('span','Updated '+new Date(r.updated_at).toLocaleDateString()));card.append(heading,tags,el('p',r.description||'No description yet.'),meta);$('repos').append(card);}
 $('results').hidden=false;
}
async function explore(value){
 let login;try{login=validateLogin(value);}catch(e){$('status').textContent=e.message;return;}
 controller?.abort();controller=new AbortController();const active=controller;
 $('status').className='';$('status').textContent='Connecting to GitHub…';$('explore').disabled=true;$('results').hidden=true;
 try{const saved=cache.get(login.toLowerCase());const result=saved&&Date.now()-Date.parse(saved.fetchedAt)<300000?saved:await loadPortfolio(login,{signal:active.signal,onProgress:n=>{$('status').textContent='Loading public repositories… '+n+' received';}});if(active!==controller)return;portfolio=result;cache.set(login.toLowerCase(),result);$('filter').value='';render();$('status').textContent=result.truncated?'Showing the first 1,000 public repositories; this overview may be incomplete.':'Loaded '+result.repos.length+' public repositories from GitHub.';}
 catch(e){if(active!==controller)return;$('status').className='error';$('status').textContent=e.name==='TimeoutError'?'GitHub took too long to respond. Please retry.':e.name==='AbortError'?'Request cancelled.':e instanceof TypeError?'Could not reach GitHub. Check your connection and retry.':e.message;}
 finally{if(active===controller)$('explore').disabled=false;}
}
$('search').addEventListener('submit',e=>{e.preventDefault();explore($('username').value);});
$('example').addEventListener('click',()=>{$('username').value='nazek52';explore('nazek52');});
for(const id of ['include-forks','sort'])$(id).addEventListener('change',()=>{if(portfolio)render();});
$('filter').addEventListener('input',()=>{if(portfolio)render();});
$('export').addEventListener('click',()=>{if(!portfolio)return;const data={...portfolio,repos:inScope(),summary:summarize(inScope()),scope:$('include-forks').checked?'all public repositories':'original public repositories'};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=el('a');a.href=url;a.download='reposcope-'+portfolio.profile.login+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
