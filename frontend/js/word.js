function downloadWord(){
 const quote=getQuote();if(!quote)return;
 const invoiceDiscount=Math.min(100,Math.max(0,Number(quote.discount||0)));
 const rows=quote.items.map((item,index)=>{
  const itemDiscount=Math.min(100,Math.max(0,Number(item.itemDiscount||0)));
  const unknownGst=item.gstRate===null||item.gstRate==="";
  const gstRate=unknownGst?0:Number(item.gstRate??quote.gst??0);
  const taxable=Number(item.qty||0)*Number(item.rate||0)*(1-itemDiscount/100)*(1-invoiceDiscount/100);
  const amount=taxable*(1+gstRate/100);
  const name=item.productName||item.name||item.description;
  const code=item.hsnSacCode?`HSN/SAC: ${item.hsnSacCode}`:"";
  const gstLabel=unknownGst?"—":`${gstRate}%`;
  return `<tr><td>${index+1}</td><td><b>${esc(name)}</b>${item.description&&item.description!==name?`<br>${esc(item.description)}`:""}${code?`<br><small>${esc(code)}</small>`:""}</td><td>${item.qty}</td><td>${esc(item.unit)}</td><td>${money(item.rate)}</td><td>${itemDiscount?`${itemDiscount}%`:"—"}</td><td>${gstLabel}</td><td>${money(amount)}</td></tr>`;
 }).join("");
 const discount=quote.discountAmount??(Number(quote.subtotal||0)-Number(quote.taxable||0));
 const html=`<html><head><meta charset="utf-8"><style>body{font-family:Arial}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:8px}h1{color:#0b3d91}</style></head><body><h1>JK HYDRAULIC & ENGINEERING</h1><p>CSC Shop No. 7 & 8, F-Block, F-31, Phase-II, Mayapuri, New Delhi-110064<br>Phone: 9136661641 / 9643154611 | Email: jkhydraulicandengineering@gmail.com</p><hr><h2>QUOTATION - ${esc(quote.quoteNo)}</h2><p><b>Customer:</b> ${esc(quote.customerName)}<br>${esc(quote.customerAddress||"")}</p><table><tr><th>#</th><th>Product / Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>Discount</th><th>GST</th><th>Amount</th></tr>${rows}</table><p><b>Subtotal:</b> ${money(quote.subtotal)}<br><b>Total discount:</b> ${money(discount)}<br><b>Taxable amount:</b> ${money(quote.taxable)}<br><b>GST:</b> ${money(quote.gstAmount)}<br><b>Grand Total:</b> ${money(quote.grandTotal)}</p><h3>Terms & Conditions</h3><p>${esc(quote.terms).replace(/\n/g,"<br>")}</p></body></html>`;
 const blob=new Blob(["\ufeff",html],{type:"application/msword"}),anchor=document.createElement("a");
 anchor.href=URL.createObjectURL(blob);anchor.download=quote.quoteNo+".doc";anchor.click();URL.revokeObjectURL(anchor.href);
}
document.addEventListener("DOMContentLoaded",()=>document.getElementById("wordBtn")?.addEventListener("click",downloadWord));
