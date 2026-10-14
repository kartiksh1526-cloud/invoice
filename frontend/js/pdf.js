function getQuote(){
 const id=new URLSearchParams(location.search).get("id");
 return JSON.parse(localStorage.getItem("jk_quotations")||"[]").find(quote=>quote.id===id);
}
function money(value){return "₹"+Number(value||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
function esc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))}
function render(){
 const quote=getQuote();
 if(!quote){document.getElementById("paper").innerHTML="<h2>Quotation not found.</h2>";return}
 const invoiceDiscount=Math.min(100,Math.max(0,Number(quote.discount||0)));
 const rows=quote.items.map((item,index)=>{
  const itemDiscount=Math.min(100,Math.max(0,Number(item.itemDiscount||0)));
  const legacyGst=item.gstRate===undefined;
  const gstRate=item.gstRate===null?0:Number(item.gstRate??quote.gst??0);
  const taxable=Number(item.qty||0)*Number(item.rate||0)*(1-itemDiscount/100)*(1-invoiceDiscount/100);
  const amount=taxable*(1+gstRate/100);
  const name=item.productName||item.name||item.description;
  const code=item.hsnSacCode?`HSN/SAC: ${item.hsnSacCode}`:"";
  const gstLabel=legacyGst&&quote.gst?`${gstRate}%`:item.gstRate===null||item.gstRate===""?"—":`${gstRate}%`;
  return `<tr><td>${index+1}</td><td><b>${esc(name)}</b>${item.description&&item.description!==name?`<br>${esc(item.description)}`:""}${code?`<br><small>${esc(code)}</small>`:""}</td><td>${item.qty}</td><td>${esc(item.unit)}</td><td class="num">${money(item.rate)}</td><td>${itemDiscount?`${itemDiscount}%`:"—"}</td><td>${gstLabel}</td><td class="num">${money(amount)}</td></tr>`;
 }).join("");
 const discount=quote.discountAmount??(Number(quote.subtotal||0)-Number(quote.taxable||0));
 document.getElementById("paper").innerHTML=`<div class="qhead"><div class="qbrand"><h1>JK HYDRAULIC & ENGINEERING</h1><p>CSC Shop No. 7 & 8, F-Block, F-31, Phase-II, Mayapuri, New Delhi-110064</p><p>Phone: 9136661641 / 9643154611 | Email: jkhydraulicandengineering@gmail.com</p></div><div class="qmeta"><strong>QUOTATION</strong><br>${esc(quote.quoteNo)}<br>Date: ${esc(quote.quoteDate)}${quote.validUntil?"<br>Valid Until: "+esc(quote.validUntil):""}</div></div><div class="customer"><b>Bill To:</b><br>${esc(quote.customerName)}${quote.contactPerson?"<br>"+esc(quote.contactPerson):""}${quote.customerPhone?"<br>"+esc(quote.customerPhone):""}${quote.customerEmail?"<br>"+esc(quote.customerEmail):""}${quote.customerAddress?"<br>"+esc(quote.customerAddress):""}</div><table class="qtable"><thead><tr><th>#</th><th>Product / Description</th><th>Qty</th><th>Unit</th><th class="num">Rate</th><th>Disc.</th><th>GST</th><th class="num">Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="totals"><div><span>Subtotal</span><b>${money(quote.subtotal)}</b></div><div><span>Total Discount</span><b>${money(discount)}</b></div><div><span>Taxable Amount</span><b>${money(quote.taxable)}</b></div><div><span>GST</span><b>${money(quote.gstAmount)}</b></div><div class="grand"><span>Grand Total</span><b>${money(quote.grandTotal)}</b></div></div><div class="terms"><h3>Terms & Conditions</h3>${esc(quote.terms)}</div><div class="signature"><div>For JK Hydraulic & Engineering<br><br><b>Authorized Signatory</b></div></div>`;
}
document.addEventListener("DOMContentLoaded",()=>{
 render();
 document.getElementById("pdfBtn").onclick=()=>window.print();
});
