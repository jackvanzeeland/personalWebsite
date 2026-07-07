/**
 * QR Code Generator markup — ported from the retired standalone page
 * (pages/artifacts/qr-code-generator.html). Ids are the DOM contract
 * consumed by qrCore.ts; data-i18n keys map into its EN/ES translations.
 */

export const QR_MARKUP = `
  <h2 class="detail-demo-heading">Try it yourself</h2>
  <p class="detail-demo-desc" data-i18n="subtitle">Generate QR codes for URLs, text, or contact cards.</p>

  <div class="qr-lang-toggle">
    <button class="qr-lang-btn active" data-lang="en">EN</button>
    <button class="qr-lang-btn" data-lang="es">ES</button>
  </div>

  <div class="qr-tabs">
    <button class="qr-tab-btn active" data-tab="url"><span data-i18n="tabUrl">URL</span></button>
    <button class="qr-tab-btn" data-tab="text"><span data-i18n="tabText">Text</span></button>
    <button class="qr-tab-btn" data-tab="contact"><span data-i18n="tabContact">Contact</span></button>
  </div>

  <div class="qr-panel-tab active" id="tab-url">
    <div class="qr-field">
      <label for="url-input" data-i18n="urlLabel">Website URL</label>
      <input type="url" id="url-input" placeholder="https://example.com" />
    </div>
  </div>

  <div class="qr-panel-tab" id="tab-text">
    <div class="qr-field">
      <label for="text-input" data-i18n="textLabel">Text Content</label>
      <textarea id="text-input" rows="4" placeholder="Enter any text..."></textarea>
    </div>
  </div>

  <div class="qr-panel-tab" id="tab-contact">
    <div class="qr-contact-fields">
      <div class="qr-section-label" data-i18n="sectionPersonal">Personal</div>
      <div class="qr-field">
        <label for="contact-first" data-i18n="firstName">First Name</label>
        <input type="text" id="contact-first" />
      </div>
      <div class="qr-field">
        <label for="contact-last" data-i18n="lastName">Last Name</label>
        <input type="text" id="contact-last" />
      </div>

      <div class="qr-section-label" data-i18n="sectionContact">Contact</div>
      <div class="qr-field">
        <label for="contact-phone" data-i18n="phone">Phone Number</label>
        <input type="tel" id="contact-phone" />
      </div>
      <div class="qr-field">
        <label for="contact-email" data-i18n="personalEmail">Personal Email</label>
        <input type="email" id="contact-email" />
      </div>
      <div class="qr-field qr-full-width">
        <label for="contact-work-email" data-i18n="workEmail">Work Email</label>
        <input type="email" id="contact-work-email" />
      </div>

      <div class="qr-section-label" data-i18n="sectionProfessional">Professional</div>
      <div class="qr-field">
        <label for="contact-title" data-i18n="jobTitle">Job Title</label>
        <input type="text" id="contact-title" />
      </div>
      <div class="qr-field">
        <label for="contact-org" data-i18n="organization">Organization</label>
        <input type="text" id="contact-org" />
      </div>

      <div class="qr-section-label" data-i18n="sectionLocation">Location</div>
      <div class="qr-field">
        <label for="contact-city" data-i18n="city">City</label>
        <input type="text" id="contact-city" />
      </div>
      <div class="qr-field">
        <label for="contact-state" data-i18n="state">State</label>
        <input type="text" id="contact-state" />
      </div>

      <div class="qr-section-label" data-i18n="sectionSocial">Social &amp; Web</div>
      <div class="qr-field">
        <label for="contact-instagram" data-i18n="instagram">Instagram @</label>
        <input type="text" id="contact-instagram" placeholder="@username" />
      </div>
      <div class="qr-field">
        <label for="contact-linkedin" data-i18n="linkedin">LinkedIn URL</label>
        <input type="url" id="contact-linkedin" placeholder="https://linkedin.com/in/..." />
      </div>
      <div class="qr-field qr-full-width">
        <label for="contact-website" data-i18n="website">Website</label>
        <input type="url" id="contact-website" placeholder="https://..." />
      </div>

      <div class="qr-section-label" data-i18n="sectionOther">Other</div>
      <div class="qr-field">
        <label for="contact-birthday" data-i18n="birthday">Birthday</label>
        <input type="date" id="contact-birthday" />
      </div>
      <div class="qr-field qr-full-width">
        <label for="contact-notes" data-i18n="notes">Notes / Bio</label>
        <textarea id="contact-notes" rows="2"></textarea>
      </div>
    </div>
  </div>

  <div class="qr-btn-row">
    <button class="btn-glow" id="generate-btn"><span data-i18n="generate">Generate QR Code</span></button>
    <button class="qr-btn-clear" id="clear-btn" style="display: none;"><span data-i18n="clear">Clear</span></button>
  </div>

  <div class="qr-output" id="qr-output" style="display: none;">
    <canvas id="qr-canvas"></canvas>
    <div class="qr-actions">
      <button id="download-btn"><span data-i18n="download">Download PNG</span></button>
      <button id="copy-btn"><span data-i18n="copy">Copy to Clipboard</span></button>
    </div>
    <div class="qr-status" id="status-msg"></div>
  </div>
`;
