/**
 * HTML Gems cards — the 18 feature showcases, ported from the retired
 * standalone page (pages/artifacts/html-gems.html). Injected into the
 * layout's .html-gems-content slot. Changes from the original:
 * - The dialog and inert demos lost their inline onclick/<script>
 *   (scripts don't execute via innerHTML); htmlGemsCore.ts wires
 *   #dialog-open-btn, #dialog-close-btn, and #inert-toggle-btn instead.
 * - The inert demo toggles its own #inert-demo-box, not <main> —
 *   freezing <main> would lock the entire SPA.
 * - Prism syntax highlighting dropped; plain <pre><code> blocks.
 */

export const GEMS_CARDS = `
  <!-- INTERACTIVE ELEMENTS -->

  <section class="html-gem-card" id="details-summary" data-category="interactive">
    <div class="html-gem-category category-interactive"><span>&#x2728;</span> Interactive</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4C2;</span>
      <code>&lt;details&gt;</code> &amp; <code>&lt;summary&gt;</code>
    </h2>

    <div class="html-gem-example">
      <details>
        <summary>Click to reveal more goodies</summary>
        <p>Native disclosure widget with accessibility baked in&mdash;no JS needed.</p>
        <ul>
          <li>Works with keyboard and screen readers</li>
          <li>Style the open state via <code>details[open]</code></li>
        </ul>
      </details>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;details&gt;
  &lt;summary&gt;Click to reveal more goodies&lt;/summary&gt;
  &lt;p&gt;Native disclosure widget with accessibility baked in.&lt;/p&gt;
&lt;/details&gt;</code></pre>
    </div>

    <p class="desc">Create expandable sections (FAQ, code blocks, etc.) with a11y-friendly behavior out of the box. Perfect for accordions without JavaScript!</p>
  </section>

  <section class="html-gem-card" id="dialog" data-category="interactive">
    <div class="html-gem-category category-interactive"><span>&#x2728;</span> Interactive</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4AC;</span>
      <code>&lt;dialog&gt;</code>
    </h2>

    <div class="html-gem-example">
      <dialog id="dlg" class="html-gem-dialog">
        <form method="dialog">
          <h3>Hi there &#x1F44B;</h3>
          <p>This is a native modal with focus trapping and ESC to close.</p>
          <menu class="html-gem-dialog-menu">
            <button value="cancel">Cancel</button>
            <button value="ok">OK</button>
          </menu>
        </form>
      </dialog>
      <button id="dialog-open-btn">Open Dialog</button>
      <button id="dialog-close-btn">Close Dialog</button>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;dialog id="dlg"&gt;
  &lt;form method="dialog"&gt;
    &lt;h3&gt;Modal Title&lt;/h3&gt;
    &lt;p&gt;Modal content here&lt;/p&gt;
    &lt;button value="ok"&gt;OK&lt;/button&gt;
  &lt;/form&gt;
&lt;/dialog&gt;

&lt;button onclick="document.getElementById('dlg').showModal()"&gt;Open&lt;/button&gt;</code></pre>
    </div>

    <p class="desc">Accessible modal dialogs without heavy libraries. Native focus trapping, backdrop clicks, and ESC key support. Just one line to open/close!</p>
  </section>

  <section class="html-gem-card" id="contenteditable" data-category="interactive">
    <div class="html-gem-category category-interactive"><span>&#x2728;</span> Interactive</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x270F;&#xFE0F;</span>
      <code>contenteditable</code> + <code>spellcheck</code>
    </h2>

    <div class="html-gem-example" contenteditable="true" spellcheck="true" aria-label="Editable note">
      Click here and type. This region is editable and will underline misspellings. Try it out!
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;div contenteditable="true" spellcheck="true" aria-label="Editable note"&gt;
  Click here and type...
&lt;/div&gt;</code></pre>
    </div>

    <p class="desc">Turn any element into a lightweight editor without JavaScript. Perfect for note-taking interfaces, comment boxes, or simple WYSIWYG editors.</p>
  </section>

  <!-- FORMS & INPUTS -->

  <section class="html-gem-card" id="datalist" data-category="forms">
    <div class="html-gem-category category-forms"><span>&#x1F4DD;</span> Forms &amp; Inputs</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4CB;</span>
      <code>&lt;datalist&gt;</code>
    </h2>

    <div class="html-gem-example">
      <label for="flavor">Favorite flavor</label>
      <input id="flavor" name="flavor" list="flavors" placeholder="Start typing&hellip;" />
      <datalist id="flavors">
        <option>Ube</option>
        <option>Pistachio</option>
        <option>Salted Caramel</option>
        <option>Yuzu</option>
        <option>Taro</option>
      </datalist>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;input list="flavors" placeholder="Start typing&hellip;" /&gt;
&lt;datalist id="flavors"&gt;
  &lt;option&gt;Chocolate&lt;/option&gt;
  &lt;option&gt;Vanilla&lt;/option&gt;
  &lt;option&gt;Strawberry&lt;/option&gt;
&lt;/datalist&gt;</code></pre>
    </div>

    <p class="desc">Attach a suggestion list to text inputs&mdash;no custom dropdown code necessary. Users can still type freely or select from suggestions.</p>
  </section>

  <section class="html-gem-card" id="input-types" data-category="forms">
    <div class="html-gem-category category-forms"><span>&#x1F4DD;</span> Forms &amp; Inputs</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F39B;&#xFE0F;</span>
      Underused <code>&lt;input&gt;</code> Types + Validation
    </h2>

    <div class="html-gem-example html-gem-grid-2">
      <label>Email <input type="email" placeholder="you@example.com" required></label>
      <label>Color <input type="color" value="#46c8ff"></label>
      <label>Range <input type="range" min="0" max="100" value="42" oninput="this.nextElementSibling.value=this.value"><output>42</output></label>
      <label>Search <input type="search" placeholder="Find things&hellip;"></label>
      <label>Regex (US ZIP) <input type="text" inputmode="numeric" placeholder="12345-6789" pattern="^\\d{5}(-\\d{4})?$" title="Use 12345 or 12345-6789"></label>
      <label>Datetime Local <input type="datetime-local"></label>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;input type="email" required /&gt;
&lt;input type="color" value="#46c8ff" /&gt;
&lt;input type="range" min="0" max="100" /&gt;
&lt;input type="search" /&gt;
&lt;input type="text" pattern="^\\d{5}(-\\d{4})?$" title="ZIP code" /&gt;
&lt;input type="datetime-local" /&gt;</code></pre>
    </div>

    <p class="desc">Native inputs with built-in validation reduce JavaScript bloat and improve accessibility. Browsers provide native pickers and validation UI.</p>
  </section>

  <section class="html-gem-card" id="optgroup" data-category="forms">
    <div class="html-gem-category category-forms"><span>&#x1F4DD;</span> Forms &amp; Inputs</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F5C2;&#xFE0F;</span>
      <code>&lt;select&gt;</code> + <code>&lt;optgroup&gt;</code>
    </h2>

    <div class="html-gem-example">
      <label for="city">City</label>
      <select id="city">
        <optgroup label="USA">
          <option>Chicago</option>
          <option>Seattle</option>
          <option>Austin</option>
        </optgroup>
        <optgroup label="International">
          <option>Tokyo</option>
          <option>Lisbon</option>
          <option>Seoul</option>
        </optgroup>
      </select>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;select&gt;
  &lt;optgroup label="USA"&gt;
    &lt;option&gt;New York&lt;/option&gt;
    &lt;option&gt;Los Angeles&lt;/option&gt;
  &lt;/optgroup&gt;
  &lt;optgroup label="International"&gt;
    &lt;option&gt;Tokyo&lt;/option&gt;
    &lt;option&gt;London&lt;/option&gt;
  &lt;/optgroup&gt;
&lt;/select&gt;</code></pre>
    </div>

    <p class="desc">Group related options for better navigation in long lists. Screen readers announce group labels for improved accessibility.</p>
  </section>

  <!-- INDICATORS -->

  <section class="html-gem-card" id="meter" data-category="indicators">
    <div class="html-gem-category category-indicators"><span>&#x1F4CA;</span> Indicators</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4CA;</span>
      <code>&lt;meter&gt;</code>
    </h2>

    <div class="html-gem-example html-gem-grid-2">
      <div>
        <label for="score">Accessibility Score</label>
        <meter id="score" min="0" max="100" low="50" high="90" optimum="100" value="92">92</meter>
      </div>
      <div>
        <label for="temp">CPU Temperature</label>
        <meter id="temp" min="0" max="100" low="60" high="85" optimum="40" value="78">78&deg;C</meter>
      </div>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;meter min="0" max="100" low="50" high="90" optimum="100" value="92"&gt;
  92 out of 100
&lt;/meter&gt;</code></pre>
    </div>

    <p class="desc">Represent bounded scalar values like ratings, disk usage, or scores. Browser automatically styles based on thresholds (low/high/optimum).</p>
  </section>

  <section class="html-gem-card" id="progress" data-category="indicators">
    <div class="html-gem-category category-indicators"><span>&#x1F4CA;</span> Indicators</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x23F3;</span>
      <code>&lt;progress&gt;</code>
    </h2>

    <div class="html-gem-example">
      <label for="dl">Download Progress</label>
      <progress id="dl" value="66" max="100">66%</progress>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;progress value="66" max="100"&gt;66%&lt;/progress&gt;</code></pre>
    </div>

    <p class="desc">A semantic way to show task completion. Screen readers announce progress automatically. Omit value for indeterminate state.</p>
  </section>

  <section class="html-gem-card" id="output" data-category="indicators">
    <div class="html-gem-category category-indicators"><span>&#x1F4CA;</span> Indicators</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F9EE;</span>
      <code>&lt;output&gt;</code> + Form Calculations
    </h2>

    <div class="html-gem-example">
      <form oninput="total.value = (+price.value||0) * (+qty.value||0)">
        <label>Price $ <input id="price" type="number" step="0.01" value="3.50"></label>
        <label>Qty <input id="qty" type="number" value="2"></label>
        <p>Total: $<output name="total" for="price qty">7.00</output></p>
      </form>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;form oninput="total.value = (+price.value) * (+qty.value)"&gt;
  &lt;input id="price" type="number" value="10"&gt;
  &lt;input id="qty" type="number" value="2"&gt;
  &lt;output name="total" for="price qty"&gt;20&lt;/output&gt;
&lt;/form&gt;</code></pre>
    </div>

    <p class="desc">Semantic element for displaying calculation results. The 'for' attribute links it to input fields for better accessibility.</p>
  </section>

  <!-- SEMANTIC MARKUP -->

  <section class="html-gem-card" id="code-kbd-samp" data-category="semantic">
    <div class="html-gem-category category-semantic"><span>&#x1F4D6;</span> Semantic</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x2328;&#xFE0F;</span>
      <code>&lt;code&gt;</code>, <code>&lt;kbd&gt;</code>, <code>&lt;samp&gt;</code>
    </h2>

    <div class="html-gem-example">
      <p>Press <kbd>&#x2318;</kbd> + <kbd>K</kbd> to open search.</p>
      <p><code>fetch('/api')</code> returns <samp>{"ok":true}</samp></p>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;p&gt;Press &lt;kbd&gt;Ctrl&lt;/kbd&gt; + &lt;kbd&gt;C&lt;/kbd&gt; to copy.&lt;/p&gt;
&lt;p&gt;&lt;code&gt;console.log()&lt;/code&gt; outputs &lt;samp&gt;Hello&lt;/samp&gt;&lt;/p&gt;</code></pre>
    </div>

    <p class="desc">Communicate code, keyboard shortcuts, and sample output with semantic tags. Screen readers can differentiate between them.</p>
  </section>

  <section class="html-gem-card" id="abbr-mark" data-category="semantic">
    <div class="html-gem-category category-semantic"><span>&#x1F4D6;</span> Semantic</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F524;</span>
      <code>&lt;abbr&gt;</code> + <code>&lt;mark&gt;</code>
    </h2>

    <div class="html-gem-example">
      <p>
        <abbr title="Accessible Rich Internet Applications">ARIA</abbr> improves a11y, and
        <mark>highlighting</mark> draws attention to key bits.
      </p>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;abbr title="HyperText Markup Language"&gt;HTML&lt;/abbr&gt;
&lt;mark&gt;highlighted text&lt;/mark&gt;</code></pre>
    </div>

    <p class="desc">Native tooltips for abbreviations and built-in highlight styling. &lt;abbr&gt; shows dotted underline, &lt;mark&gt; provides semantic emphasis.</p>
  </section>

  <section class="html-gem-card" id="native-copy" data-category="semantic">
    <div class="html-gem-category category-semantic"><span>&#x1F4D6;</span> Semantic</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4DD;</span>
      Native Copy Snippet (No JS)
    </h2>

    <div class="html-gem-example">
      <details>
        <summary>Show code snippet</summary>
        <pre><code>&lt;a href="report.csv" download&gt;Download Report&lt;/a&gt;</code></pre>
      </details>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;details&gt;
  &lt;summary&gt;Show snippet&lt;/summary&gt;
  &lt;pre&gt;&lt;code&gt;const x = 42;&lt;/code&gt;&lt;/pre&gt;
&lt;/details&gt;</code></pre>
    </div>

    <p class="desc">Use &lt;details&gt; as a lightweight disclosure for docs &amp; examples. Perfect for code snippets in documentation.</p>
  </section>

  <!-- MEDIA & CONTENT -->

  <section class="html-gem-card" id="figure" data-category="media">
    <div class="html-gem-category category-media"><span>&#x1F3AC;</span> Media</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F5BC;&#xFE0F;</span>
      <code>&lt;figure&gt;</code> / <code>&lt;figcaption&gt;</code>
    </h2>

    <div class="html-gem-example">
      <figure>
        <img src="https://picsum.photos/600/300" alt="Abstract placeholder art" class="html-gem-figure-img" loading="lazy">
        <figcaption class="html-gem-figcaption">Random art, captioned semantically.</figcaption>
      </figure>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;figure&gt;
  &lt;img src="photo.jpg" alt="Description"&gt;
  &lt;figcaption&gt;Photo caption here&lt;/figcaption&gt;
&lt;/figure&gt;</code></pre>
    </div>

    <p class="desc">Captions that are programmatically tied to the media, not just visually nearby. Works with images, diagrams, code blocks, and more.</p>
  </section>

  <section class="html-gem-card" id="video-track" data-category="media">
    <div class="html-gem-category category-media"><span>&#x1F3AC;</span> Media</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F3A5;</span>
      <code>&lt;video&gt;</code> + <code>&lt;track&gt;</code>
    </h2>

    <div class="html-gem-example">
      <video controls preload="none" class="html-gem-video" poster="https://picsum.photos/800/450?blur=1">
        <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
        <track kind="captions" srclang="en" label="English" default>
        Sorry, your browser doesn't support embedded videos.
      </video>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;video controls&gt;
  &lt;source src="video.mp4" type="video/mp4"&gt;
  &lt;track kind="captions" srclang="en" src="captions.vtt" default&gt;
&lt;/video&gt;</code></pre>
    </div>

    <p class="desc">Native captions improve accessibility and searchability of media. Supports subtitles, captions, descriptions, and chapters via WebVTT files.</p>
  </section>

  <section class="html-gem-card" id="picture" data-category="media">
    <div class="html-gem-category category-media"><span>&#x1F3AC;</span> Media</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F305;</span>
      <code>&lt;picture&gt;</code>
    </h2>

    <div class="html-gem-example">
      <picture>
        <source media="(min-width: 900px)" srcset="https://picsum.photos/1200/300">
        <source media="(min-width: 600px)" srcset="https://picsum.photos/900/300">
        <img src="https://picsum.photos/600/300" alt="Responsive art" class="html-gem-figure-img" loading="lazy">
      </picture>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;picture&gt;
  &lt;source media="(min-width: 900px)" srcset="large.jpg"&gt;
  &lt;source media="(min-width: 600px)" srcset="medium.jpg"&gt;
  &lt;img src="small.jpg" alt="Responsive image"&gt;
&lt;/picture&gt;</code></pre>
    </div>

    <p class="desc">Serve the right image asset for the right viewport without JavaScript. Great for art direction and performance optimization.</p>
  </section>

  <!-- ATTRIBUTES -->

  <section class="html-gem-card" id="download" data-category="attributes">
    <div class="html-gem-category category-attributes"><span>&#x2699;&#xFE0F;</span> Attributes</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F4BE;</span>
      <code>download</code> Attribute
    </h2>

    <div class="html-gem-example">
      <a href="data:text/plain,Hello%20from%20HTML%20gems!" download="hello.txt">Download a tiny text file</a>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;a href="report.pdf" download="Q4-Report.pdf"&gt;
  Download Report
&lt;/a&gt;</code></pre>
    </div>

    <p class="desc">Suggests a filename and prompts download instead of navigation. Works with data URIs for client-side file generation!</p>
  </section>

  <section class="html-gem-card" id="inert" data-category="attributes">
    <div class="html-gem-category category-attributes"><span>&#x2699;&#xFE0F;</span> Attributes</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x1F6AB;</span>
      <code>inert</code> Attribute
    </h2>

    <div class="html-gem-example">
      <p>When a modal opens, you can set the rest of the page to <code>inert</code> to prevent focus/interaction.</p>
      <div class="html-gem-inert-box" id="inert-demo-box">
        <label>Try this input: <input type="text" placeholder="Type here..."></label>
        <button>And this button</button>
      </div>
      <button id="inert-toggle-btn">Toggle inert on the box above</button>
      <span class="html-gem-inert-status" id="inert-status" role="status"></span>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;main inert&gt;
  &lt;!-- This content cannot be focused or interacted with --&gt;
&lt;/main&gt;</code></pre>
    </div>

    <p class="desc">Helps enforce focus trapping patterns cleanly with native support. Perfect for modal overlays and disabled sections.</p>
  </section>

  <section class="html-gem-card" id="accesskey" data-category="attributes">
    <div class="html-gem-category category-attributes"><span>&#x2699;&#xFE0F;</span> Attributes</div>
    <h2 class="html-gem-title">
      <span class="gem-icon">&#x2328;&#xFE0F;</span>
      <code>accesskey</code>
    </h2>

    <div class="html-gem-example">
      <a href="#top" accesskey="h">Press Alt/&#x2325; + H to jump to top</a>
    </div>

    <div class="html-gem-code-wrapper">
      <div class="html-gem-code-header">
        <span class="html-gem-code-label">HTML</span>
        <button class="html-gem-copy-btn" aria-label="Copy code to clipboard">&#x1F4CB; Copy</button>
      </div>
      <pre><code>&lt;button accesskey="s"&gt;Save (Alt+S)&lt;/button&gt;</code></pre>
    </div>

    <p class="desc">Provide quick keyboard access&mdash;use sparingly and document your keys. Can conflict with browser/OS shortcuts, so test thoroughly.</p>
  </section>
`;
