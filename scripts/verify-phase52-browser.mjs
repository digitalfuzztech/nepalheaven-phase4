const appUrl = (process.env.TEST_APP_URL || "http://127.0.0.1:8082").replace(
  /\/$/,
  "",
);
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
  throw new Error("Admin credentials are required.");
const pages = await fetch("http://127.0.0.1:9222/json/list").then((r) =>
  r.json(),
);
const page = pages.find((x) => x.type === "page");
if (!page?.webSocketDebuggerUrl)
  throw new Error("No Chrome page on port 9222.");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((ok, bad) => {
  socket.addEventListener("open", ok, { once: true });
  socket.addEventListener("error", bad, { once: true });
});
let id = 0;
const pending = new Map(),
  errors = [];
socket.addEventListener("message", (event) => {
  const m = JSON.parse(event.data);
  if (m.id) {
    const p = pending.get(m.id);
    if (!p) return;
    pending.delete(m.id);
    m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
  } else if (m.method === "Runtime.exceptionThrown")
    errors.push(
      m.params.exceptionDetails.exception?.description ||
        m.params.exceptionDetails.text,
    );
});
const send = (method, params = {}) => {
  const call = ++id;
  socket.send(JSON.stringify({ id: call, method, params }));
  return new Promise((resolve, reject) =>
    pending.set(call, { resolve, reject }),
  );
};
const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.exceptionDetails)
    throw new Error(
      r.exceptionDetails.exception?.description || "Evaluation failed",
    );
  return r.result.value;
};
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
async function go(path) {
  await send("Page.navigate", { url: `${appUrl}${path}` });
  await delay(1200);
}
async function wait(expression, label) {
  for (let n = 0; n < 80; n++) {
    if (await evalJs(expression)) return;
    await delay(100);
  }
  const state = await evalJs(
    `({url: location.href, text: document.body.innerText.slice(0, 800)})`,
  );
  throw new Error(`Timed out: ${label} ${JSON.stringify(state)}`);
}
await send("Page.enable");
await send("Runtime.enable");
await go("/admin?redirect=/admin/crm/bookings");
if (await evalJs("Boolean(document.querySelector('input[type=email]'))")) {
  await delay(2500);
  await evalJs(
    `(()=>{const set=(el,v)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};const e=document.querySelector('input[type=email]'),p=document.querySelector('input[type=password]');set(e,${JSON.stringify(process.env.ADMIN_EMAIL)});set(p,${JSON.stringify(process.env.ADMIN_PASSWORD)});e.closest('form').requestSubmit()})()`,
  );
}
await wait("!document.querySelector('input[type=password]')", "admin login");
await go("/admin/crm/bookings?tab=cancelled&page=1&q=");
await wait(
  "document.querySelector('h1')?.innerText==='Bookings'",
  "bookings CRM",
);
const bookings = await evalJs(
  `(()=>({headers:[...document.querySelectorAll('thead th')].map(x=>x.innerText.trim()),rows:document.querySelectorAll('tbody tr').length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,detail:[...document.querySelectorAll('a')].find(x=>x.innerText.includes('View Booking'))?.getAttribute('href')}))()`,
);
let detail = null,
  customer = null;
if (bookings.detail) {
  await go(bookings.detail);
  await wait(
    "document.body.innerText.toLowerCase().includes('read-only financial record')",
    "booking detail",
  );
  detail = await evalJs(
    `(()=>({headings:[...document.querySelectorAll('h2')].map(x=>x.innerText.trim()),invoice:[...document.querySelectorAll('button')].some(x=>x.innerText.includes('Invoice')),customer:[...document.querySelectorAll('a')].find(x=>x.innerText.includes('Open Customer'))?.getAttribute('href'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`,
  );
  if (detail.customer) {
    await go(detail.customer);
    await wait(
      "document.body.innerText.includes('Booking Invoices')",
      "customer financial documents",
    );
    customer = await evalJs(
      `(()=>({hasInputs:Boolean(document.querySelector('main input, main select, main textarea')),hasSave:[...document.querySelectorAll('button')].some(x=>x.innerText.includes('Save Changes')),hasPhoto:Boolean(document.querySelector('img[alt$=" profile"], [aria-label="No customer photo"]')),headings:[...document.querySelectorAll('h2')].map(x=>x.innerText.trim()),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`,
    );
  }
}
await go("/admin/crm/payments?page=1&q=&status=&purpose=&provider=");
await wait(
  "document.querySelector('h1')?.innerText==='Payments'",
  "payments CRM",
);
const payments = await evalJs(
  `(()=>({headers:[...document.querySelectorAll('thead th')].map(x=>x.innerText.trim()),rows:document.querySelectorAll('tbody tr').length,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth}))()`,
);
if (payments.rows) {
  await evalJs(
    `([...document.querySelectorAll('button')].find(x=>x.innerText.includes('View / Review'))).click()`,
  );
  await wait(
    "document.body.innerText.includes('Payment Review')",
    "payment review modal",
  );
  payments.reviewModal = await evalJs(
    `({gatewayStatus:document.body.innerText.toLowerCase().includes('gateway status'),crmReview:document.body.innerText.toLowerCase().includes('crm review'),hasAmountInput:Boolean([...document.querySelectorAll('input')].find(x=>x.value&&/^\\d/.test(x.value)))})`,
  );
  await evalJs(`(()=>{const select=document.querySelector('select[value]')||[...document.querySelectorAll('select')].at(-1);const setter=Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set;setter.call(select,'reviewed');select.dispatchEvent(new Event('change',{bubbles:true}));[...document.querySelectorAll('button')].find(x=>x.innerText.includes('Save Review')).click()})()`);
  await wait("!document.body.innerText.includes('Payment Review')", "payment review save");
  payments.reviewSaved = true;
}
console.log(
  JSON.stringify(
    { bookings, detail, customer, payments, browserErrors: errors },
    null,
    2,
  ),
);
socket.close();
