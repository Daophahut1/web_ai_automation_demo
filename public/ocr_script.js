// Copied original ocr_script.js to public so Next can load it as-is
// เปลี่ยน URL นี้เป็น Webhook URL จริงจาก n8n Workflow ของคุณ
const OCR_WEBHOOK_URL =
  "https://primary-production-d04ee.up.railway.app/webhook/9d1807d4-d8f2-4a5b-83bc-aa374682e8b6";

const fileInput = document.getElementById("fileInput");
const processButton = document.getElementById("processButton");
const loadingIndicator = document.getElementById("loading");
const resultsDiv = document.getElementById("results");

let base64File = null;
let fileName = null;
let fileMimeType = null;

// 1. เปิดใช้งานปุ่มเมื่อมีไฟล์
if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      processButton.disabled = false;
      fileName = file.name;
      fileMimeType = file.type;
      readFileAsBase64(file);
    } else {
      processButton.disabled = true;
    }
  });
}

function readFileAsBase64(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const base64String = reader.result.split(",")[1];
    base64File = base64String;
    console.log("File successfully converted to Base64.");
  };
  reader.onerror = (error) => {
    console.error("Error reading file:", error);
    alert("Failed to read file.");
    processButton.disabled = true;
  };
  reader.readAsDataURL(file);
}

processButton && processButton.addEventListener("click", async () => {
  if (!base64File) return;

  processButton.disabled = true;
  loadingIndicator.classList.remove("hidden");
  resultsDiv.innerHTML = ""; // Clear previous results

  const payload = {
    fileData: base64File,
    fileName: fileName,
    fileMimeType: fileMimeType,
  };

  try {
    const response = await fetch(OCR_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    loadingIndicator.classList.add("hidden");

    if (response.ok) {
      let data;
      try {
        data = await response.json();
        if (window && typeof window.showJson === "function") {
          try {
            window.showJson(data);
          } catch (e) {
            console.warn("showJson threw:", e);
          }
        }

        if (Array.isArray(data) && data.length > 0) {
          displayResults(data);
        } else if (data && typeof data === 'object') {
          displayResults([data]);
        } else {
          console.error("Received empty or non-array JSON:", data);
          resultsDiv.innerHTML = '<p class="text-red-500">Validation Passed, but response data is empty or corrupted (check n8n logs for final output).</p>';
        }
      } catch (parseError) {
        const rawText = await response.text();
        console.error("JSON Parsing Failed. Raw Response:", rawText, parseError);
        if (window && typeof window.showJson === "function") {
          try {
            window.showJson(rawText);
          } catch (e) {
            console.warn("showJson (raw) threw:", e);
          }
        }
        if (rawText.length < 5) {
          alert("Connection Timed Out or Empty Response Body. Please try again.");
        } else {
          alert("Parsing error: Check console for raw data.");
        }
        resultsDiv.innerHTML = '<p class="text-red-500">Parsing Failed (Possible Timeout). Check Console (F12) for raw response details.</p>';
      }
    } else {
      alert(`Error: ${response.status} - ${response.statusText}. Check n8n logs for details.`);
    }
  } catch (error) {
    loadingIndicator.classList.add("hidden");
    console.error("Fetch error details (Possible CORS Block):", error);
    alert("An error occurred during API call. Please check the Browser Console (F12) > Network tab for CORS or Timeout details.");
  } finally {
    processButton.disabled = false;
  }
});

function displayResults(data) {
  if (!data || data.length === 0) {
    resultsDiv.innerHTML = '<p class="text-red-500">No data received from n8n workflow.</p>';
    return;
  }

  const tableHTML = `
        <table class="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pay Period</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Total</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tax/VAT</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand/Net Total</th>
                    <th class="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                ${data
                  .map((item) => {
                    const status = item.ValidationStatus;
                    const statusColor =
                      status === "PASSED"
                        ? "bg-green-100 text-green-700 font-bold"
                        : "bg-red-100 text-red-700 font-bold";
                    return `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${item.issue_date}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${item.sub_total.toFixed(
                              2
                            )}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${item.vat_amount.toFixed(
                              2
                            )}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">$${item.grand_total.toFixed(
                              2
                            )}</td>
                            <td class="px-6 py-4 whitespace-nowrap text-center">
                                <span class="px-3 py-1 inline-flex text-xs leading-5 rounded-full ${statusColor}">
                                    ${status}
                                </span>
                            </td>
                        </tr>
                    `;
                  })
                  .join("")}
            </tbody>
        </table>
        <p class="mt-4 mb-4 text-sm text-gray-600">${data.length} pay periods processed. <span class="text-red-700">${
    data.find((i) => i.ValidationStatus === "FAILED")?.ValidationMessage || ""
  }</span></p>

  <div id="json-tools" class="mb-4 flex items-center gap-3">
      <button id="copyJsonBtn" class="px-3 py-1 rounded-md bg-indigo-600 text-white font-semibold">Copy JSON</button>
      <button id="downloadJsonBtn" class="px-3 py-1 rounded-md bg-white border font-semibold">Download JSON</button>
      <span id="json-status" class="text-sm text-gray-500">No JSON yet</span>
  </div>

  <div id="json-panel" class="bg-gray-900 text-gray-100 rounded-lg overflow-auto p-4 max-h-json">
      <pre id="json-code" class="whitespace-pre-wrap font-mono text-sm">${JSON.stringify(
        data,
        null,
        2
      )}</pre>
  </div>


  `;

  resultsDiv.innerHTML = tableHTML;

  try {
    const toolsEl = resultsDiv.querySelector('#json-tools');
    if (toolsEl) {
      const copyBtn = toolsEl.querySelector('#copyJsonBtn');
      const downBtn = toolsEl.querySelector('#downloadJsonBtn');
      const statusEl = toolsEl.querySelector('#json-status');
      const codeEl = resultsDiv.querySelector('#json-code');

      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(codeEl.textContent);
            if (statusEl) statusEl.textContent = 'Copied to clipboard';
          } catch (e) {
            if (statusEl) statusEl.textContent = 'Copy failed';
          }
        });
      }

      if (downBtn) {
        downBtn.addEventListener('click', () => {
          const txt = codeEl.textContent;
          const blob = new Blob([txt], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'ocr_result.json';
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
          if (statusEl) statusEl.textContent = 'Downloaded';
        });
      }
    }
  } catch (e) {
    console.warn('Failed to bind json tools after render:', e);
  }
}
