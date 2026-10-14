let products=[];
const item$=id=>document.getElementById(id);
function itemEsc(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]))}
function itemMoney(value){return value===null||value===""?"Not set":"₹"+Number(value).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}
function loadProducts(){
 item$("catalogStatus").textContent="Loading items…";
 try{products=getCatalogProducts();renderProducts()}
 catch(error){item$("catalogStatus").textContent=error.message;item$("productList").innerHTML=""}
}
function renderProducts(){
 const term=item$("productSearch").value.trim().toLowerCase();
 const category=item$("categoryFilter").value;
 const rows=products.filter(product=>(!category||product.category===category)&&
  (!term||product.name.toLowerCase().includes(term)));
 item$("catalogStatus").textContent=`${rows.length} of ${products.length} items`;
 if(!rows.length){item$("productList").innerHTML='<div class="empty-catalog">No items match your search.</div>';return}
 item$("productList").innerHTML=`<table class="product-table"><thead><tr><th>Product</th><th>Category</th><th>Unit</th><th>Selling Price</th><th>GST</th><th>Actions</th></tr></thead><tbody>${
  rows.map(product=>`<tr><td><b>${itemEsc(product.name)}</b></td><td>${itemEsc(product.category)}</td><td>${itemEsc(product.unit||"—")}</td><td>${itemMoney(product.sellingPrice)} <button class="btn secondary price-btn" data-action="price" data-id="${itemEsc(product.id)}" type="button">Edit Price</button></td><td>${product.gstRate===null?"Not set":`${itemEsc(product.gstRate)}%`}</td><td class="actions"><button class="btn secondary" data-action="edit" data-id="${itemEsc(product.id)}" type="button">Edit</button><button class="btn secondary" data-action="delete" data-id="${itemEsc(product.id)}" type="button">Delete</button></td></tr>`).join("")
 }</tbody></table>`;
}
function fillCategories(){
 for(const id of ["productCategory","categoryFilter"]){
  const select=item$(id);
  if(id==="productCategory")select.innerHTML='<option value="">Choose category</option>';
  for(const category of CATALOG_CATEGORIES)select.insertAdjacentHTML("beforeend",`<option value="${itemEsc(category)}">${itemEsc(category)}</option>`);
 }
}
function clearForm(){
 item$("productForm").reset();item$("productId").value="";
 item$("formTitle").textContent="Add New Item";item$("formError").textContent="";
}
function openForm(product=null){
 clearForm();
 if(product){
  item$("productId").value=product.id;item$("productName").value=product.name;
  item$("productCategory").value=product.category;item$("productUnit").value=product.unit;
  item$("productPrice").value=product.sellingPrice??"";item$("productGst").value=product.gstRate??"";
  item$("productHsn").value=product.hsnSacCode;item$("productDescription").value=product.description;
  item$("formTitle").textContent="Edit Item";
 }
 item$("productFormPanel").hidden=false;item$("productName").focus();
}
function formProduct(){
 const value=id=>item$(id).value;
 return {name:value("productName"),category:value("productCategory"),unit:value("productUnit"),
  sellingPrice:value("productPrice")===""?null:Number(value("productPrice")),
  gstRate:value("productGst")===""?null:Number(value("productGst")),hsnSacCode:value("productHsn"),description:value("productDescription")};
}
function saveProduct(event){
 event.preventDefault();item$("formError").textContent="";
 const id=item$("productId").value;
 try{
  const product=formProduct();
  product.id=id||`custom-product-${crypto.randomUUID()}`;
  const index=products.findIndex(item=>item.id===product.id);
  if(index<0)products.push(product);else products[index]=product;
  saveCatalogProducts(products);
  item$("productFormPanel").hidden=true;renderProducts();
 }catch(error){item$("formError").textContent=error.message}
}
function changePrice(product){
 const entered=prompt(`Selling price for ${product.name} (leave blank to clear):`,product.sellingPrice??"");
 if(entered===null)return;
 const value=entered.trim()===""?null:Number(entered);
 if(value!==null&&(!Number.isFinite(value)||value<0)){alert("Enter a valid non-negative price, or leave it blank.");return}
 try{product.sellingPrice=value;saveCatalogProducts(products);renderProducts()}
 catch(error){alert(error.message)}
}
function deleteProduct(product){
 if(!confirm(`Delete "${product.name}" from My Items?`))return;
 try{products=products.filter(item=>item.id!==product.id);saveCatalogProducts(products);renderProducts()}
 catch(error){alert(error.message)}
}
document.addEventListener("DOMContentLoaded",()=>{
 fillCategories();item$("newItemBtn").onclick=()=>openForm();
 item$("cancelFormBtn").onclick=()=>{item$("productFormPanel").hidden=true;clearForm()};
 item$("productForm").addEventListener("submit",saveProduct);
 item$("productSearch").addEventListener("input",renderProducts);
 item$("categoryFilter").addEventListener("change",renderProducts);
 item$("productList").addEventListener("click",event=>{
  const button=event.target.closest("button[data-action]");if(!button)return;
  const product=products.find(item=>item.id===button.dataset.id);if(!product)return;
  if(button.dataset.action==="edit")openForm(product);
  if(button.dataset.action==="price")changePrice(product);
  if(button.dataset.action==="delete")deleteProduct(product);
 });
 loadProducts();
});
