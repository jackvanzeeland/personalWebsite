/**
 * UiPath Queue Processor markup — ported from the retired standalone page
 * (pages/artifacts/uipath-queue-processor.html). Ids are the DOM contract
 * consumed by uipathCore.ts.
 */

export const UIPATH_MARKUP = `
  <h2 class="detail-demo-heading">Try it yourself</h2>
  <p class="detail-demo-desc">Upload an Orchestrator queue CSV export, flatten nested JSON properties, and download clean data. Everything runs in your browser — nothing is uploaded.</p>

  <div class="uip-steps">
    <div class="uip-step active" id="step1">
      <span class="uip-step-num">1</span>
      <span>Upload CSV</span>
    </div>
    <div class="uip-connector" id="connector1-2"><div class="uip-connector-fill"></div></div>
    <div class="uip-step" id="step2">
      <span class="uip-step-num">2</span>
      <span>Select Columns</span>
    </div>
    <div class="uip-connector" id="connector2-3"><div class="uip-connector-fill"></div></div>
    <div class="uip-step" id="step3">
      <span class="uip-step-num">3</span>
      <span>Download</span>
    </div>
  </div>

  <div class="uip-upload-zone" id="upload-zone">
    <div class="uip-upload-icon">⬆</div>
    <strong>Drop your CSV file here or click to browse</strong>
    <p>Supports UiPath Orchestrator queue export files</p>
    <input type="file" id="file-input" accept=".csv" style="display: none;" />
  </div>

  <div class="uip-file-info-row">
    <div class="uip-file-info" id="file-info">
      <span id="file-info-text"></span>
    </div>
  </div>

  <div class="uip-column-selector" id="column-selector">
    <h3>Select columns to include:</h3>
    <input type="text" class="uip-column-search" id="column-search" placeholder="Filter columns..." />
    <div class="uip-column-count" id="column-count"></div>
    <div class="uip-select-actions">
      <button id="select-all-btn">Select All</button>
      <button id="deselect-all-btn">Deselect All</button>
    </div>
    <div class="uip-columns-grid" id="columns-grid"></div>
    <button class="btn-glow uip-process-btn" id="process-btn">Process &amp; Preview</button>
  </div>

  <div class="uip-preview-section" id="preview-section">
    <h3>Preview (first 10 rows):</h3>
    <div class="uip-preview-wrapper">
      <table class="uip-preview-table" id="preview-table"></table>
    </div>
  </div>

  <div class="uip-download-section" id="download-section">
    <div class="uip-row-count" id="row-count"></div>
    <button class="btn-glow" id="download-btn">Download Processed CSV</button>
    <div class="uip-success-toast" id="success-toast">
      <span>✅ Download complete!</span>
    </div>
    <div>
      <button class="uip-start-over" id="start-over-btn">↺ Start Over</button>
    </div>
  </div>
`;
