const QKEY="jk_quotations";
function getQuotes(){return JSON.parse(localStorage.getItem(QKEY)||"[]")}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function quoteRows(data){
 if(!data.length)return "<p style='color:#667085'>No quotations found.</p>";
 return `<table class="mini-table"><thead><tr><th>Quotation</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>`+
 data.map(q=>`<tr><td><b>${esc(q.quoteNo)}</b></td><td>${esc(q.customerName||"-")}</td><td>${esc(q.quoteDate||"-")}</td><td>${money(q.grandTotal)}</td><td><span class="badge ${q.status}">${esc(q.status)}</span></td><td><div class="row-actions"><a href="quotation.html?id=${encodeURIComponent(q.id)}">Edit</a><a href="preview.html?id=${encodeURIComponent(q.id)}">View</a><button onclick="duplicateQuote('${q.id}')">Copy</button><button onclick="deleteQuote('${q.id}')">Delete</button></div></td></tr>`).join("")+"</tbody></table>"
}
function duplicateQuote(id){const q=getQuotes().find(x=>x.id===id);if(!q)return;const copy=structuredClone(q);copy.id=crypto.randomUUID();copy.quoteNo=nextQuoteNo();copy.status="draft";copy.quoteDate=new Date().toISOString().slice(0,10);const arr=getQuotes();arr.unshift(copy);localStorage.setItem(QKEY,JSON.stringify(arr));location.href="quotation.html?id="+copy.id}
function deleteQuote(id){if(!confirm("Delete this quotation?"))return;localStorage.setItem(QKEY,JSON.stringify(getQuotes().filter(q=>q.id!==id)));renderHistory();renderDashboard()}
function nextQuoteNo(){const nums=getQuotes().map(q=>parseInt(String(q.quoteNo||"").replace(/\D/g,""),10)||0);return "JK-Q-"+String(Math.max(0,...nums)+1).padStart(4,"0")}
function renderDashboard(){const qs=getQuotes();const el=id=>document.getElementById(id);if(!el("totalCount"))return;el("totalCount").textContent=qs.length;el("draftCount").textContent=qs.filter(q=>q.status==="draft").length;el("completedCount").textContent=qs.filter(q=>q.status==="completed").length;el("totalValue").textContent=money(qs.reduce((s,q)=>s+Number(q.grandTotal||0),0));el("recentList").innerHTML=quoteRows(qs.slice(0,8))}
function renderHistory(){const box=document.getElementById("historyList");if(!box)return;let qs=getQuotes();const term=(document.getElementById("search")?.value||"").toLowerCase();const status=document.getElementById("statusFilter")?.value||"all";qs=qs.filter(q=>(status==="all"||q.status===status)&&JSON.stringify(q).toLowerCase().includes(term));box.innerHTML=quoteRows(qs)}
function initDashboard(){renderDashboard();renderHistory();document.getElementById("search")?.addEventListener("input",renderHistory);document.getElementById("statusFilter")?.addEventListener("change",renderHistory)}
document.addEventListener("DOMContentLoaded",initDashboard);