const CATALOG_STORAGE_KEY="jk_products";
const CATALOG_VERSION_KEY="jk_products_seed_version";
const CATALOG_SEED_VERSION="jk-products-v2";
const CATALOG_CATEGORIES=[
 "Consumables","Dies","Punches","Cutting Dies & Special Dies",
 "Hydraulic & Hand Press Machines","Other Machines & Equipment"
];
const CATALOG_SEED=[
 ["Lubricating Oil","Consumables","Litre"],
 ['Die – 4" x 4" x 24"',"Dies","Nos"],
 ['Die – 4" x 4" x 18"',"Dies","Nos"],
 ['Die – 4" x 4" x 12"',"Dies","Nos"],
 ['Die – 4" x 4" x 6"',"Dies","Nos"],
 ['Punch – 90 Degree 24"',"Punches","Nos"],
 ['Punch – 90 Degree 18"',"Punches","Nos"],
 ['Punch – 90 Degree 12"',"Punches","Nos"],
 ['Punch – 90 Degree 6"',"Punches","Nos"],
 ['Punch – 30 Degree 18"',"Punches","Nos"],
 ['Punch – 30 Degree 12"',"Punches","Nos"],
 ['Punch – 30 Degree 6"',"Punches","Nos"],
 ['Round Punch 18"',"Punches","Nos"],
 ['Round Punch 12"',"Punches","Nos"],
 ['Round Punch 6"',"Punches","Nos"],
 ['Square Punch 18"',"Punches","Nos"],
 ['Punch Holder 12"',"Punches","Nos"],
 ['Round Cutting Die 1"',"Cutting Dies & Special Dies","Nos"],
 ['Round Cutting Die 1.5"',"Cutting Dies & Special Dies","Nos"],
 ['Round Cutting Die 1/2"',"Cutting Dies & Special Dies","Nos"],
 ['Round Cutting Die 5/8"',"Cutting Dies & Special Dies","Nos"],
 ["Sink Waste Solid Thappa","Cutting Dies & Special Dies","Nos"],
 ["Patasa Die With Hole","Cutting Dies & Special Dies","Nos"],
 ["L-Corner Cutting Die","Cutting Dies & Special Dies","Nos"],
 ["Table Top & Elf Corner Cutting Die","Cutting Dies & Special Dies","Nos"],
 ["Capsule Cutting Die 60mm x 8mm","Cutting Dies & Special Dies","Nos"],
 ['Mini Hydraulic Press 18" Center Motor 3 HP',"Hydraulic & Hand Press Machines","Nos"],
 ['Hand Press 8No. 15" x 12" Center Height',"Hydraulic & Hand Press Machines","Nos"],
 ['Hand Press 10No. 16" x 13" Center Height',"Hydraulic & Hand Press Machines","Nos"],
 ['Hand Press 10No. 18" x 15" Center Height',"Hydraulic & Hand Press Machines","Nos"],
 ['Hand Press 10No. 15" x 15" Center Height',"Hydraulic & Hand Press Machines","Nos"],
 ["Hydraulic Lift 1000kg","Other Machines & Equipment","Nos"],
 ['Sheet Hand Cutter 12" Length Blade',"Other Machines & Equipment","Nos"],
 ['Sheet Hand Cutter 16" Length Blade',"Other Machines & Equipment","Nos"],
 ['Sheet Hand Cutter 18" Length Blade',"Other Machines & Equipment","Nos"],
 ["Sheet Rolling Machine Hand Operated 4ft","Other Machines & Equipment","Nos"]
];
const LEGACY_PREFIX={
 "Consumables":"CONSUMABLE","Dies":"DIE","Punches":"PUNCH",
 "Cutting Dies & Special Dies":"CUT",
 "Hydraulic & Hand Press Machines":"PRESS",
 "Other Machines & Equipment":"EQUIP"
};

function migrateSavedQuotes(idMap){
 const quoteKey="jk_quotations";
 const saved=localStorage.getItem(quoteKey);
 if(!saved)return;
 const quotes=JSON.parse(saved);
 if(!Array.isArray(quotes))throw new Error("Saved quotations have an invalid format.");
 let changed=false;
 for(const quote of quotes){
  for(const item of quote.items||[]){
   const oldId=item.productId||item.sku;
   if(oldId&&idMap.has(oldId)){item.productId=idMap.get(oldId);changed=true}
   if(Object.hasOwn(item,"sku")){delete item.sku;changed=true}
  }
 }
 if(changed)localStorage.setItem(quoteKey,JSON.stringify(quotes));
}

function getCatalogProducts(){
 const saved=localStorage.getItem(CATALOG_STORAGE_KEY);
 let products=saved?JSON.parse(saved):[];
 if(!Array.isArray(products))throw new Error("Saved product catalog has an invalid format.");
 let changed=localStorage.getItem(CATALOG_VERSION_KEY)!==CATALOG_SEED_VERSION;
 const idMap=new Map();
 const seenIds=new Set();
 const categoryCounts=new Map();
 for(let index=0;index<CATALOG_SEED.length;index++){
  const [name,category,unit]=CATALOG_SEED[index];
  const categoryNumber=(categoryCounts.get(category)||0)+1;
  categoryCounts.set(category,categoryNumber);
  const legacyId=`JK-${LEGACY_PREFIX[category]}-${String(categoryNumber).padStart(3,"0")}`;
  let product=products.find(item=>item.sku===legacyId||item.id===legacyId);
  if(!product)product=products.find(item=>item.name===name);
  if(product){
   const oldId=product.id;
   const newId=`product-${String(index+1).padStart(3,"0")}`;
   if(product.sku)idMap.set(product.sku,`product-${String(index+1).padStart(3,"0")}`);
   if(oldId)idMap.set(oldId,newId);
   if(oldId!==newId){product.id=newId;changed=true}
   if(Object.hasOwn(product,"sku")){delete product.sku;changed=true}
  }else{
   product={id:`product-${String(index+1).padStart(3,"0")}`,name,category,unit,sellingPrice:null,gstRate:null,hsnSacCode:"",description:""};
   products.push(product);
   changed=true;
  }
  if(product.category!==category||!product.unit){product.category=category;product.unit=product.unit||unit;changed=true}
  seenIds.add(product.id);
 }
 let customIndex=1;
 for(const product of products){
  if(product.sku&&product.id)idMap.set(product.sku,product.id);
  if(Object.hasOwn(product,"sku")){delete product.sku;changed=true}
  if(!seenIds.has(product.id)){
   const oldId=product.id;
   let newId=`custom-product-${String(customIndex++).padStart(3,"0")}`;
   while(seenIds.has(newId))newId=`custom-product-${String(customIndex++).padStart(3,"0")}`;
   if(oldId)idMap.set(oldId,newId);
   product.id=newId;
   seenIds.add(newId);
   changed=true;
  }
 }
 migrateSavedQuotes(idMap);
 if(changed){
  localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(products));
  localStorage.setItem(CATALOG_VERSION_KEY,CATALOG_SEED_VERSION);
 }
 return products;
}

function saveCatalogProducts(products){
 if(!Array.isArray(products))throw new Error("Product catalog must be a list.");
 localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(products));
 return products;
}
