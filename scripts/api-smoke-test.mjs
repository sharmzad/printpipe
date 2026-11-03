const baseUrl = (process.env.PRINTPIPE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const apiKey = process.env.PRINTPIPE_API_KEY;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkHealth() {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();
  assert(response.ok, `Health check failed (${response.status}): ${JSON.stringify(body)}`);
  assert(body.services?.database && body.services?.converter, "Health check did not confirm both dependencies.");
  console.log("✓ database and converter are ready");
}

async function checkApiRequiresAuthentication() {
  const form = new FormData();
  form.set("html", "<h1>Authentication test</h1>");
  const response = await fetch(`${baseUrl}/api/v1/html-to-pdf`, { method: "POST", body: form });
  assert(response.status === 401, `Expected an unauthenticated API request to return 401, got ${response.status}.`);
  assert(response.headers.get("x-request-id"), "Authentication error did not include x-request-id.");
  console.log("✓ API authentication is enforced");
}

async function checkHtmlConversion() {
  if (!apiKey) {
    console.log("- conversion skipped (set PRINTPIPE_API_KEY to run it)");
    return;
  }
  const form = new FormData();
  form.set("html", "<!doctype html><html><body><h1>PrintPipe API smoke test</h1></body></html>");
  form.set("paperSize", "8.27x11.7");
  const response = await fetch(`${baseUrl}/api/v1/html-to-pdf`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}` },
    body: form,
  });
  assert(response.ok, `HTML conversion failed (${response.status}): ${await response.text()}`);
  assert(response.headers.get("content-type")?.includes("application/pdf"), "Conversion did not return a PDF content type.");
  assert(response.headers.get("x-request-id"), "Conversion response did not include x-request-id.");
  const bytes = new Uint8Array(await response.arrayBuffer());
  assert(new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-", "Conversion response does not have a PDF signature.");
  console.log(`✓ HTML-to-PDF conversion returned ${bytes.length} bytes`);
}

await checkHealth();
await checkApiRequiresAuthentication();
await checkHtmlConversion();
console.log("PrintPipe API smoke test passed.");
