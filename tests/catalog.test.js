const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { randomUUID } = require("node:crypto");

const root = path.join(__dirname, "..");

function catalogContext(initial = []) {
  const storage = new Map();
  if (initial.length) storage.set("jk_products", JSON.stringify(initial));
  const context = vm.createContext({
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "frontend", "js", "catalog.js"), "utf8"), context);
  return { context, storage };
}

test("the browser catalog idempotently seeds all 36 products without item codes or invented business fields", () => {
  const expectedNames = [
    "Lubricating Oil",
    'Die – 4" x 4" x 24"', 'Die – 4" x 4" x 18"', 'Die – 4" x 4" x 12"', 'Die – 4" x 4" x 6"',
    'Punch – 90 Degree 24"', 'Punch – 90 Degree 18"', 'Punch – 90 Degree 12"', 'Punch – 90 Degree 6"',
    'Punch – 30 Degree 18"', 'Punch – 30 Degree 12"', 'Punch – 30 Degree 6"',
    'Round Punch 18"', 'Round Punch 12"', 'Round Punch 6"', 'Square Punch 18"', 'Punch Holder 12"',
    'Round Cutting Die 1"', 'Round Cutting Die 1.5"', 'Round Cutting Die 1/2"', 'Round Cutting Die 5/8"',
    "Sink Waste Solid Thappa", "Patasa Die With Hole", "L-Corner Cutting Die",
    "Table Top & Elf Corner Cutting Die", "Capsule Cutting Die 60mm x 8mm",
    'Mini Hydraulic Press 18" Center Motor 3 HP', 'Hand Press 8No. 15" x 12" Center Height',
    'Hand Press 10No. 16" x 13" Center Height', 'Hand Press 10No. 18" x 15" Center Height',
    'Hand Press 10No. 15" x 15" Center Height', "Hydraulic Lift 1000kg",
    'Sheet Hand Cutter 12" Length Blade', 'Sheet Hand Cutter 16" Length Blade',
    'Sheet Hand Cutter 18" Length Blade', "Sheet Rolling Machine Hand Operated 4ft"
  ];
  const { context, storage } = catalogContext();
  const products = vm.runInContext("getCatalogProducts()", context);
  assert.equal(products.length, 36);
  assert.deepEqual(Array.from(products, product => product.name), expectedNames);
  assert.deepEqual(new Set(products.map(product => product.category)), new Set(vm.runInContext("CATALOG_CATEGORIES", context)));
  assert.ok(products.every(product => product.sellingPrice === null && product.gstRate === null));
  assert.ok(products.every(product => product.hsnSacCode === "" && product.description === ""));
  assert.ok(products.every(product => !Object.hasOwn(product, "sku")));
  assert.ok(products.some(product => product.name === 'Mini Hydraulic Press 18" Center Motor 3 HP'));
  assert.ok(products.some(product => product.name === 'Die – 4" x 4" x 24"' && product.id === "product-002"));
  const reread = vm.runInContext("getCatalogProducts()", context);
  assert.equal(reread.length, 36);
  assert.equal(JSON.parse(storage.get("jk_products")).length, 36);
});

test("browser catalog seeding preserves saved product edits", () => {
  const existing = {
    id: "JK-DIE-001", name: "My custom name", sku: "JK-DIE-001",
    category: "Dies", unit: "Box", sellingPrice: 123, gstRate: 5,
    hsnSacCode: "saved", description: "saved description"
  };
  const { context } = catalogContext([existing]);
  const products = vm.runInContext("getCatalogProducts()", context);
  const die = products.find(product => product.id === "product-002");
  assert.equal(products.length, 36);
  assert.equal(die.name, "My custom name");
  assert.equal(die.sellingPrice, 123);
  assert.equal(die.id, "product-002");
  assert.equal(Object.hasOwn(die, "sku"), false);
});

test("catalog migration removes item codes from existing saved quotations", () => {
  const { context, storage } = catalogContext([{
    id: "JK-DIE-001", name: 'Die – 4" x 4" x 24"', sku: "JK-DIE-001",
    category: "Dies", unit: "Nos", sellingPrice: null, gstRate: null,
    hsnSacCode: "", description: ""
  }]);
  storage.set("jk_quotations", JSON.stringify([{
    id: "quote-1",
    items: [{ productId: "JK-DIE-001", sku: "JK-DIE-001", productName: 'Die – 4" x 4" x 24"' }]
  }]));
  vm.runInContext("getCatalogProducts()", context);
  const savedQuote = JSON.parse(storage.get("jk_quotations"))[0];
  assert.equal(savedQuote.items[0].productId, "product-002");
  assert.equal(Object.hasOwn(savedQuote.items[0], "sku"), false);
});

function field(value = "") {
  return {
    value: String(value),
    textContent: "",
    innerHTML: "",
    dataset: {},
    classList: { contains: () => false },
    addEventListener() {}
  };
}

function makeRow({ qty, rate, itemDiscount = 0, gstRate = "" }) {
  const fields = {
    ".item-no": field(),
    ".item-qty": field(qty),
    ".item-rate": field(rate),
    ".item-discount": field(itemDiscount),
    ".item-gst": field(gstRate),
    ".amount": field(),
    ".item-product": field(),
    ".item-desc": field(),
    ".item-unit": field(),
    ".item-hsn": field(),
    ".item-product-id": field(),
  };
  const row = {
    dataset: {},
    querySelector: selector => fields[selector],
    querySelectorAll: () => Object.values(fields)
  };
  return { row, fields };
}

function quotationContext(rows, initialValues = {}) {
  const elements = new Map();
  for (const id of [
    "subtotal", "itemDiscount", "taxable", "gstAmount", "grandTotal",
    "discount", "quoteNo", "quoteDate", "validUntil", "reference",
    "customerName", "contactPerson", "customerEmail", "customerPhone",
    "customerAddress", "terms", "itemsBody", "catalogError", "productOptions",
    "editorTitle", "addItem", "saveBtn", "previewBtn"
  ]) elements.set(id, field(initialValues[id] ?? ""));
  const storage = new Map();
  const document = {
    getElementById: id => elements.get(id),
    querySelectorAll: selector => selector === "#itemsBody tr" ? rows : [],
    addEventListener() {}
  };
  const context = vm.createContext({
    document,
    window: { currentId: null },
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value)
    },
    crypto: { randomUUID },
    URLSearchParams,
    console
  });
  vm.runInContext(fs.readFileSync(path.join(root, "frontend", "js", "quotation.js"), "utf8"), context);
  return { context, elements, storage };
}

test("invoice calculation supports multiple rates, item discounts and a blank GST rate", () => {
  const items = [
    makeRow({ qty: 2, rate: 100, itemDiscount: 10, gstRate: 18 }),
    makeRow({ qty: 1, rate: 200, gstRate: 5 }),
    makeRow({ qty: 1, rate: 50, gstRate: "" })
  ];
  const { context, elements } = quotationContext(items.map(item => item.row), { discount: 5 });
  const result = vm.runInContext("calculate()", context);
  assert.equal(result.subtotal, 450);
  assert.equal(result.discountAmount, 41.5);
  assert.equal(result.taxable, 408.5);
  assert.equal(result.gstAmount, 40.28);
  assert.equal(result.grandTotal, 448.78);
  assert.equal(elements.get("grandTotal").textContent, "₹448.78");
  assert.equal(items[2].fields[".amount"].textContent, "₹47.50");
});

test("product selection fills invoice defaults and saving keeps invoice prices separate", () => {
  const item = makeRow({ qty: 2, rate: "", gstRate: "" });
  const pricedItem = makeRow({ qty: 1, rate: "", gstRate: "" });
  const rows = [item.row, pricedItem.row];
  const { context, storage } = quotationContext(rows, {
    discount: 0,
    quoteNo: "JK-Q-0001",
    quoteDate: "2026-10-14",
    customerName: "Test customer",
    terms: ""
  });
  vm.runInContext(`catalogProducts = ${JSON.stringify([{
    id: "catalog-id", name: "Test Die", unit: "Nos",
    description: "Saved description", sellingPrice: null, gstRate: null,
    hsnSacCode: "1234"
  }, {
    id: "priced-id", name: "Priced Punch", unit: "Nos",
    description: "Priced description", sellingPrice: 450, gstRate: 18,
    hsnSacCode: "5678"
  }])}`, context);
  vm.runInContext('selectProduct(document.querySelectorAll("#itemsBody tr")[0], "Test Die")', context);
  assert.equal(item.fields[".item-product"].value, "Test Die");
  assert.equal(item.fields[".item-desc"].value, "Saved description");
  assert.equal(item.fields[".item-unit"].value, "Nos");
  assert.equal(item.fields[".item-rate"].value, "");
  assert.equal(item.fields[".item-gst"].value, "");
  vm.runInContext('selectProduct(document.querySelectorAll("#itemsBody tr")[1], "Priced Punch")', context);
  assert.equal(Number(pricedItem.fields[".item-rate"].value), 450);
  assert.equal(Number(pricedItem.fields[".item-gst"].value), 18);
  assert.equal(pricedItem.fields[".item-hsn"].value, "5678");
  rows.pop();
  item.fields[".item-rate"].value = "125";
  const quote = vm.runInContext('save("completed")', context);
  assert.equal(quote.items.length, 1);
  assert.equal(quote.items[0].rate, 125);
  assert.equal(quote.items[0].productId, "catalog-id");
  assert.equal(Object.hasOwn(quote.items[0], "sku"), false);
  assert.equal(quote.grandTotal, 250);
  assert.equal(JSON.parse(storage.get("jk_quotations"))[0].items[0].rate, 125);
  assert.equal(vm.runInContext("catalogProducts[0].sellingPrice", context), null);
  assert.equal(vm.runInContext("catalogProducts[1].sellingPrice", context), 450);
});

test("quotation preview keeps HSN details and totals without displaying item codes", () => {
  const quote = {
    id: "saved-quote",
    quoteNo: "JK-Q-0001",
    quoteDate: "2026-10-14",
    customerName: "Test customer",
    items: [{
      productName: "Test Die", description: "Saved description",
      hsnSacCode: "1234", qty: 2, unit: "Nos",
      rate: 100, itemDiscount: 10, gstRate: 18
    }],
    discount: 0,
    subtotal: 200,
    discountAmount: 20,
    taxable: 180,
    gstAmount: 32.4,
    grandTotal: 212.4,
    terms: ""
  };
  const paper = field();
  const printButton = field();
  let ready;
  let prints = 0;
  const context = vm.createContext({
    document: {
      getElementById: id => id === "paper" ? paper : printButton,
      addEventListener: (event, callback) => { if (event === "DOMContentLoaded") ready = callback; }
    },
    location: { search: "?id=saved-quote" },
    localStorage: { getItem: () => JSON.stringify([quote]) },
    URLSearchParams,
    window: { print: () => { prints++; } }
  });
  vm.runInContext(fs.readFileSync(path.join(root, "frontend", "js", "pdf.js"), "utf8"), context);
  vm.runInContext("render()", context);
  ready();
  printButton.onclick();
  assert.match(paper.innerHTML, /HSN\/SAC: 1234/);
  assert.doesNotMatch(paper.innerHTML, /SKU|JK-DIE/);
  assert.match(paper.innerHTML, /₹212\.40/);
  assert.equal(prints, 1);
});
