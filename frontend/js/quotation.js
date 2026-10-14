const QKEY="jk_quotations";
const $=id=>document.getElementById(id);
let catalogProducts=[];
function qs(){return JSON.parse(localStorage.getItem(QKEY)||"[]")}
function money(n){return "₹"+Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
function nextNo(){const a=qs().map(q=>parseInt(String(q.quoteNo||"").replace(/\D/g,""),10)||0);return "JK-Q-"+String(Math.max(0,...a)+1).padStart(4,"0")}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function addItem(item={}){
 const tr=document.createElement("tr");
 const name=item.productName||item.name||"";
 tr.innerHTML=`<td class="item-no"></td><td><input class="item-product" list="productOptions" autocomplete="off" placeholder="Type product name" value="${esc(name)}"><input class="item-hsn" type="hidden" value="${esc(item.hsnSacCode||"")}"><input class="item-product-id" type="hidden" value="${esc(item.productId||"")}"></td><td><input class="item-desc" value="${esc(item.description||"")}"></td><td><input class="item-qty" type="number" min="0" step="0.01" value="${item.qty??1}"></td><td><input class="item-unit" value="${esc(item.unit??"")}" placeholder="Unit"></td><td><input class="item-rate" type="number" min="0" step="0.01" value="${item.rate??""}" placeholder="Enter rate"></td><td><input class="item-discount" type="number" min="0" max="100" step="0.01" value="${item.itemDiscount??0}"></td><td><input class="item-gst" type="number" min="0" max="100" step="0.01" value="${item.gstRate??""}" placeholder="Not set"></td><td class="amount num">₹0.00</td><td><button type="button" class="remove-item" aria-label="Remove item">×</button></td>`;
 $("itemsBody").appendChild(tr);
 tr.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>{
  if(input.classList.contains("item-product"))clearUnmatchedProduct(tr);
  calculate();
 }));
 const productInput=tr.querySelector(".item-product");
 productInput.addEventListener("change",()=>selectProduct(tr,productInput.value));
 productInput.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();selectProduct(tr,productInput.value)}});
 tr.querySelector(".remove-item").onclick=()=>{tr.remove();calculate()};
 calculate();
}
function findProduct(value){
 const term=String(value||"").trim().toLowerCase();
 return catalogProducts.find(product=>product.name.toLowerCase()===term);
}
function clearUnmatchedProduct(row){
 const input=row.querySelector(".item-product"),product=findProduct(input.value);
 if(!product){
  row.querySelector(".item-product-id").value="";
  row.querySelector(".item-hsn").value="";
 }
}
function selectProduct(row,value){
 const product=findProduct(value);
 if(!product)return;
 row.querySelector(".item-product").value=product.name;
 row.querySelector(".item-desc").value=product.description||"";
 row.querySelector(".item-unit").value=product.unit||"";
 row.querySelector(".item-rate").value=product.sellingPrice??"";
 row.querySelector(".item-discount").value=0;
 row.querySelector(".item-gst").value=product.gstRate??"";
 row.querySelector(".item-product-id").value=product.id;
 row.querySelector(".item-hsn").value=product.hsnSacCode||"";
 calculate();
}
function renderProductOptions(){
 $("productOptions").innerHTML=catalogProducts.map(product=>
  `<option value="${esc(product.name)}" label="${esc(product.category)}"></option>`
 ).join("");
}
function loadCatalog(){
 try{catalogProducts=getCatalogProducts();renderProductOptions()}
 catch(error){$("catalogError").textContent=`Browser catalog could not be loaded: ${error.message} You can still add custom items.`}
}
function calculate(){
 let subtotal=0,gstAmt=0;
 document.querySelectorAll("#itemsBody tr").forEach((tr,i)=>{
  tr.querySelector(".item-no").textContent=i+1;
  const qty=Math.max(0,+tr.querySelector(".item-qty").value||0);
  const rate=Math.max(0,+tr.querySelector(".item-rate").value||0);
  const itemDiscount=Math.min(100,Math.max(0,+tr.querySelector(".item-discount").value||0));
  const gstRate=Math.max(0,+tr.querySelector(".item-gst").value||0);
  const gross=qty*rate,afterItemDiscount=gross*(1-itemDiscount/100);
  subtotal+=gross;
  tr.dataset.taxable=String(afterItemDiscount);
  tr.dataset.gstRate=String(gstRate);
 });
 const discount=Math.min(100,Math.max(0,+$("discount").value||0));
 const invoiceFactor=1-discount/100;
 let taxable=0;
 document.querySelectorAll("#itemsBody tr").forEach(tr=>{
  const rowTaxable=Number(tr.dataset.taxable||0)*invoiceFactor;
  const rowGst=rowTaxable*Number(tr.dataset.gstRate||0)/100;
  taxable+=rowTaxable;gstAmt+=rowGst;
  tr.querySelector(".amount").textContent=money(rowTaxable);
 });
 const discountAmount=subtotal-taxable;
 $("subtotal").textContent=money(subtotal);
 $("itemDiscount").textContent=money(discountAmount);
 $("taxable").textContent=money(taxable);
 $("gstAmount").textContent=money(gstAmt);
 $("grandTotal").textContent=money(taxable+gstAmt);
 return {subtotal,discount,discountAmount,taxable,gst:taxable?gstAmt/taxable*100:0,gstAmount:gstAmt,grandTotal:taxable+gstAmt};
}
function collect(status="draft"){
 const calc=calculate();
 return {id:window.currentId||crypto.randomUUID(),quoteNo:$("quoteNo").value,quoteDate:$("quoteDate").value,validUntil:$("validUntil").value,reference:$("reference").value,customerName:$("customerName").value,contactPerson:$("contactPerson").value,customerEmail:$("customerEmail").value,customerPhone:$("customerPhone").value,customerAddress:$("customerAddress").value,terms:$("terms").value,items:[...document.querySelectorAll("#itemsBody tr")].map(tr=>({productId:tr.querySelector(".item-product-id").value||null,productName:tr.querySelector(".item-product").value,hsnSacCode:tr.querySelector(".item-hsn").value,description:tr.querySelector(".item-desc").value,qty:+tr.querySelector(".item-qty").value||0,unit:tr.querySelector(".item-unit").value,rate:+tr.querySelector(".item-rate").value||0,itemDiscount:+tr.querySelector(".item-discount").value||0,gstRate:tr.querySelector(".item-gst").value===""?null:+tr.querySelector(".item-gst").value})),...calc,status,updatedAt:new Date().toISOString()};
}
function save(status="draft"){
 if(!$("customerName").value.trim()){alert("Customer / Company Name is required.");return null}
 const q=collect(status),arr=qs(),i=arr.findIndex(x=>x.id===q.id);
 if(i>=0)arr[i]=q;else arr.unshift(q);
 localStorage.setItem(QKEY,JSON.stringify(arr));window.currentId=q.id;return q;
}
function load(){
 const p=new URLSearchParams(location.search),id=p.get("id");
 let q=id&&qs().find(x=>x.id===id);
 if(!q){q={id:crypto.randomUUID(),quoteNo:nextNo(),quoteDate:new Date().toISOString().slice(0,10),validUntil:"",items:[]};window.currentId=q.id}
 else window.currentId=q.id;
 $("quoteNo").value=q.quoteNo;$("quoteDate").value=q.quoteDate;$("validUntil").value=q.validUntil||"";
 $("reference").value=q.reference||"";$("customerName").value=q.customerName||"";
 $("contactPerson").value=q.contactPerson||"";$("customerEmail").value=q.customerEmail||"";
 $("customerPhone").value=q.customerPhone||"";$("customerAddress").value=q.customerAddress||"";
 $("terms").value=q.terms||$("terms").value;$("discount").value=q.discount??0;
 (q.items?.length?q.items:[{}]).forEach(item=>addItem({
  ...item,
  productName:item.productName||item.name||"",
  gstRate:item.gstRate??(item.gstRate===null?"":q.gst??"")
 }));
 calculate();$("editorTitle").textContent=id?"Edit Quotation":"New Quotation";
}
document.addEventListener("DOMContentLoaded",()=>{
 $("addItem").onclick=()=>addItem();$("discount").oninput=calculate;
 $("saveBtn").onclick=()=>{const q=save("draft");if(q){alert("Draft saved.");location.href="history.html"}};
 $("previewBtn").onclick=()=>{const q=save("completed");if(q)location.href="preview.html?id="+q.id};
 load();loadCatalog();
});
