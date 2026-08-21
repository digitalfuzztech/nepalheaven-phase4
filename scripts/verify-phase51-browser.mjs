const appUrl = (process.env.TEST_APP_URL || "http://127.0.0.1:8080").replace(
  /\/$/,
  "",
);
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminEmail || !adminPassword)
  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");

const pages = await fetch("http://127.0.0.1:9222/json/list").then((response) =>
  response.json(),
);
const page = pages.find((item) => item.type === "page");
if (!page?.webSocketDebuggerUrl)
  throw new Error("No Chrome page is available on port 9222.");

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let nextId = 0;
const pending = new Map();
const browserErrors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }
  if (message.method === "Runtime.exceptionThrown")
    browserErrors.push(
      message.params.exceptionDetails.exception?.description ||
        message.params.exceptionDetails.text,
    );
});

function send(method, params = {}) {
  const id = ++nextId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(
      result.exceptionDetails.exception?.description || "Evaluation failed.",
    );
  return result.result.value;
}

const delay = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function navigate(path) {
  await send("Page.navigate", { url: `${appUrl}${path}` });
  await delay(1_500);
}

async function waitFor(expression, label) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await evaluate(expression)) return;
    await delay(100);
  }
  const state = await evaluate(
    `({ url: location.href, body: document.body.innerText.slice(0, 1000) })`,
  );
  throw new Error(`Timed out waiting for ${label}: ${JSON.stringify(state)}`);
}

async function clickButton(label) {
  await evaluate(`(() => {
    const button = [...document.querySelectorAll("button")].find((item) => item.innerText.trim() === ${JSON.stringify(label)});
    if (!button) throw new Error(${JSON.stringify(`Button not found: ${label}`)});
    button.click();
  })()`);
}

async function clickDialogButton(label) {
  await evaluate(`(() => {
    const dialog = document.querySelector('[role="alertdialog"]');
    const button = [...(dialog?.querySelectorAll("button") || [])].find((item) => item.innerText.trim() === ${JSON.stringify(label)});
    if (!button) throw new Error(${JSON.stringify(`Dialog button not found: ${label}`)});
    button.click();
  })()`);
}

async function tableState() {
  return evaluate(`(() => ({
    url: location.pathname + location.search,
    title: document.querySelector("h1")?.innerText || null,
    headers: [...document.querySelectorAll("table thead th")].map((cell) => cell.innerText.trim()),
    rows: [...document.querySelectorAll("table tbody tr")].filter((row) => !row.querySelector("td[colspan]")).length,
    documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    tableText: document.querySelector("table")?.innerText || ""
  }))()`);
}

await send("Page.enable");
await send("Runtime.enable");

await navigate("/admin?redirect=/admin/crm/customers");
const needsLogin = await evaluate(
  `Boolean(document.querySelector('input[type="email"]'))`,
);
if (needsLogin) {
  // The inputs are server-rendered before React attaches the submit handler.
  await delay(2_500);
  await evaluate(`(() => {
  const set = (input, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const email = document.querySelector('input[type="email"]');
  const password = document.querySelector('input[type="password"]');
  if (!email || !password) throw new Error("Admin login fields were not found.");
  set(email, ${JSON.stringify(adminEmail)});
  set(password, ${JSON.stringify(adminPassword)});
  email.closest("form").requestSubmit();
})()`);
} else {
  await navigate("/admin/crm/customers?page=1&q=&country=");
}
await waitFor(
  `location.pathname === "/admin/crm/customers"`,
  "admin customer redirect",
);
await waitFor(
  `document.querySelector("h1")?.innerText.includes("Registered customers")`,
  "customer table",
);

const customers = await tableState();
customers.containsAdminEmail = customers.tableText
  .toLowerCase()
  .includes(adminEmail.toLowerCase());
delete customers.tableText;

const firstCustomer = await evaluate(`(() => {
  const cells = document.querySelector("table tbody tr")?.querySelectorAll("td");
  return cells?.length ? {
    name: cells[1].querySelector("span")?.innerText.trim() || cells[1].innerText.trim(),
    email: cells[2].innerText.trim(),
    country: cells[5].innerText.trim(),
    detailHref: cells[6].querySelector("a")?.getAttribute("href") || null
  } : null;
})()`);
let customerNameSearch = null;
let combinedCustomerFilter = null;
let customerDetail = null;
let customerBlockCycle = null;
let customerDeleteSafety = null;
if (firstCustomer) {
  await navigate(
    `/admin/crm/customers?page=1&q=${encodeURIComponent(firstCustomer.name)}&country=`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get("q") === ${JSON.stringify(firstCustomer.name)}`,
    "customer name search",
  );
  customerNameSearch = await tableState();
  delete customerNameSearch.tableText;
  await navigate(
    `/admin/crm/customers?page=1&q=${encodeURIComponent(firstCustomer.email)}&country=${encodeURIComponent(firstCustomer.country)}`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get("q") === ${JSON.stringify(firstCustomer.email)}`,
    "customer email search",
  );
  await waitFor(
    `new URLSearchParams(location.search).get("country") === ${JSON.stringify(firstCustomer.country)}`,
    "combined customer country filter",
  );
  combinedCustomerFilter = await tableState();
  delete combinedCustomerFilter.tableText;

  if (firstCustomer.detailHref) {
    await navigate(firstCustomer.detailHref);
    await waitFor(
      `[...document.querySelectorAll("h1")].some((item) => item.innerText.trim() === ${JSON.stringify(firstCustomer.name)})`,
      "customer detail",
    );
    customerDetail = await evaluate(`(() => ({
      url: location.pathname,
      headings: [...document.querySelectorAll("h2")].map((item) => item.innerText.trim()),
      emailReadOnly: Boolean(document.querySelector('input[type="email"][readonly]')),
      hasSave: [...document.querySelectorAll("button")].some((item) => item.innerText.includes("Save Changes")),
      hasDelete: [...document.querySelectorAll("button")].some((item) => item.innerText.includes("Delete Customer")),
      documentOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
    }))()`);
    const initiallyBlocked = await evaluate(`[
      ...document.querySelectorAll("button")
    ].some((item) => item.innerText.trim() === "Unblock Customer")`);
    await clickButton(initiallyBlocked ? "Unblock Customer" : "Block Customer");
    await waitFor(
      `Boolean(document.querySelector('[role="alertdialog"]'))`,
      "customer status confirmation",
    );
    await clickDialogButton(
      initiallyBlocked ? "Unblock Customer" : "Block Customer",
    );
    await waitFor(
      `[...document.querySelectorAll("button")].some((item) => item.innerText.trim() === ${JSON.stringify(initiallyBlocked ? "Block Customer" : "Unblock Customer")})`,
      "customer status update",
    );
    await clickButton(initiallyBlocked ? "Block Customer" : "Unblock Customer");
    await waitFor(
      `Boolean(document.querySelector('[role="alertdialog"]'))`,
      "customer status restore confirmation",
    );
    await clickDialogButton(
      initiallyBlocked ? "Block Customer" : "Unblock Customer",
    );
    await waitFor(
      `[...document.querySelectorAll("button")].some((item) => item.innerText.trim() === ${JSON.stringify(initiallyBlocked ? "Unblock Customer" : "Block Customer")})`,
      "customer status restored",
    );
    customerBlockCycle = { initiallyBlocked, restored: true };
    await clickButton("Delete Customer");
    await waitFor(
      `Boolean(document.querySelector('[role="alertdialog"]'))`,
      "customer delete confirmation",
    );
    await clickDialogButton("Delete Customer");
    await waitFor(
      `document.body.innerText.includes("must be retained")`,
      "customer retained-record deletion refusal",
    );
    customerDeleteSafety = {
      refused: true,
      remainedOnDetail: await evaluate(
        `location.pathname.startsWith("/admin/crm/customers/")`,
      ),
    };
  }
}

await navigate(
  "/admin/crm/leads?type=newsletter&newsletterStatus=subscribed&visibility=visible&page=1",
);
await waitFor(
  `document.querySelector("h1")?.innerText.includes("Acquired leads")`,
  "leads table",
);
const leadStates = { newsletterSubscribed: await tableState() };

for (const type of ["destination", "experience", "contact", "whatsapp"]) {
  await navigate(
    `/admin/crm/leads?type=${type}&newsletterStatus=subscribed&visibility=visible&page=1`,
  );
  await waitFor(
    `new URLSearchParams(location.search).get("type") === ${JSON.stringify(type)}`,
    `${type} tab`,
  );
  leadStates[type] = await tableState();
}

await navigate(
  "/admin/crm/leads?type=newsletter&newsletterStatus=unsubscribed&visibility=visible&page=1",
);
leadStates.newsletterUnsubscribed = await tableState();
for (const state of Object.values(leadStates)) delete state.tableText;

let leadModal = null;
let leadHideCycle = null;
await navigate(
  "/admin/crm/leads?type=destination&newsletterStatus=subscribed&visibility=visible&page=1",
);
const destinationRowsBefore = (await tableState()).rows;
if (destinationRowsBefore > 0) {
  await clickButton("View / Edit");
  await waitFor(
    `Boolean(document.querySelector('[role="dialog"]'))`,
    "lead detail modal",
  );
  leadModal = await evaluate(`(() => ({
    text: document.querySelector('[role="dialog"]')?.innerText || "",
    pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }))()`);
  leadModal.hasHide = leadModal.text.includes("Hide Lead");
  leadModal.hasDelete = leadModal.text.includes("Delete Lead");
  delete leadModal.text;
  await clickButton("Delete Lead");
  await waitFor(
    `Boolean(document.querySelector('[role="alertdialog"]'))`,
    "lead delete confirmation",
  );
  await clickDialogButton("Cancel");
  await waitFor(
    `!document.querySelector('[role="alertdialog"]')`,
    "lead delete cancellation",
  );
  leadModal.deleteConfirmationCancelled = true;
  await clickButton("Hide Lead");
  await waitFor(
    `!document.querySelector('[role="dialog"]')`,
    "lead modal close after hide",
  );
  await navigate(
    "/admin/crm/leads?type=destination&newsletterStatus=subscribed&visibility=hidden&page=1",
  );
  await waitFor(
    `[...document.querySelectorAll("button")].some((item) => item.innerText.trim() === "View / Edit")`,
    "hidden lead row",
  );
  await clickButton("View / Edit");
  await waitFor(
    `Boolean(document.querySelector('[role="dialog"]'))`,
    "hidden lead modal",
  );
  await clickButton("Unhide Lead");
  await waitFor(
    `!document.querySelector('[role="dialog"]')`,
    "lead modal close after unhide",
  );
  await navigate(
    "/admin/crm/leads?type=destination&newsletterStatus=subscribed&visibility=visible&page=1",
  );
  leadHideCycle = {
    before: destinationRowsBefore,
    afterRestore: (await tableState()).rows,
  };
}

await send("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await navigate("/admin/crm/customers?page=1&q=&country=");
const narrowCustomers = await tableState();
delete narrowCustomers.tableText;
await navigate(
  "/admin/crm/leads?type=contact&newsletterStatus=subscribed&visibility=visible&page=1",
);
const narrowLeads = await tableState();
delete narrowLeads.tableText;
await send("Emulation.clearDeviceMetricsOverride");

console.log(
  JSON.stringify(
    {
      customers,
      customerNameSearch,
      combinedCustomerFilter,
      customerDetail,
      customerBlockCycle,
      customerDeleteSafety,
      leadStates,
      leadModal,
      leadHideCycle,
      narrow: { customers: narrowCustomers, leads: narrowLeads },
      browserErrors,
    },
    null,
    2,
  ),
);
socket.close();
