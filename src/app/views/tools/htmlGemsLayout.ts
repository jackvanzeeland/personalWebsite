/**
 * HTML Gems layout shell — search/filter controls, quick-reference chips,
 * TOC sidebar, and the content grid. The 18 gem cards (htmlGemsCards.ts)
 * are injected into .html-gems-content by the detail view. Ported from
 * the retired standalone page (pages/artifacts/html-gems.html).
 */

export const GEMS_LAYOUT = `
  <div class="html-gems-controls">
    <div class="html-gems-search-wrapper">
      <span class="html-gems-search-icon" aria-hidden="true">&#x1F50D;</span>
      <input
        type="search"
        class="html-gems-search"
        placeholder="Search features by name or tag... (Ctrl+K)"
        aria-label="Search HTML features"
        autocomplete="off"
      >
      <button class="html-gems-clear-search" aria-label="Clear search" title="Clear search">&times;</button>
    </div>

    <div class="html-gems-results-count" role="status" aria-live="polite" style="display: none;"></div>

    <div class="html-gems-filters" role="group" aria-label="Category filters">
      <button class="html-gems-filter-btn active" data-category="all">&#x1F310; All Features</button>
      <button class="html-gems-filter-btn" data-category="forms">&#x1F4DD; Forms &amp; Inputs</button>
      <button class="html-gems-filter-btn" data-category="media">&#x1F3AC; Media &amp; Content</button>
      <button class="html-gems-filter-btn" data-category="interactive">&#x2728; Interactive</button>
      <button class="html-gems-filter-btn" data-category="semantic">&#x1F4D6; Semantic Markup</button>
      <button class="html-gems-filter-btn" data-category="indicators">&#x1F4CA; Indicators</button>
      <button class="html-gems-filter-btn" data-category="attributes">&#x2699;&#xFE0F; Attributes</button>
    </div>
  </div>

  <section class="html-gems-quick-ref">
    <div class="html-gems-quick-ref-title">
      <span>&#x1F516;</span> Quick Reference - Jump to Feature
    </div>
    <div class="html-gems-quick-ref-chips">
      <a href="#details-summary" class="html-gems-quick-chip">&lt;details&gt;</a>
      <a href="#datalist" class="html-gems-quick-chip">&lt;datalist&gt;</a>
      <a href="#meter" class="html-gems-quick-chip">&lt;meter&gt;</a>
      <a href="#progress" class="html-gems-quick-chip">&lt;progress&gt;</a>
      <a href="#contenteditable" class="html-gems-quick-chip">contenteditable</a>
      <a href="#code-kbd-samp" class="html-gems-quick-chip">&lt;code&gt;/&lt;kbd&gt;</a>
      <a href="#abbr-mark" class="html-gems-quick-chip">&lt;abbr&gt;/&lt;mark&gt;</a>
      <a href="#figure" class="html-gems-quick-chip">&lt;figure&gt;</a>
      <a href="#download" class="html-gems-quick-chip">download</a>
      <a href="#input-types" class="html-gems-quick-chip">Input Types</a>
      <a href="#dialog" class="html-gems-quick-chip">&lt;dialog&gt;</a>
      <a href="#inert" class="html-gems-quick-chip">inert</a>
      <a href="#output" class="html-gems-quick-chip">&lt;output&gt;</a>
      <a href="#accesskey" class="html-gems-quick-chip">accesskey</a>
      <a href="#video-track" class="html-gems-quick-chip">&lt;video&gt;/&lt;track&gt;</a>
      <a href="#picture" class="html-gems-quick-chip">&lt;picture&gt;</a>
      <a href="#optgroup" class="html-gems-quick-chip">&lt;optgroup&gt;</a>
      <a href="#native-copy" class="html-gems-quick-chip">Copy Snippet</a>
    </div>
  </section>

  <button class="html-gems-toc-toggle" aria-expanded="false" aria-controls="html-gems-toc">
    <span>&#x1F4D1; Table of Contents</span>
    <span class="toggle-icon">&#x25BC;</span>
  </button>

  <div class="html-gems-layout">
    <aside class="html-gems-toc" id="html-gems-toc" role="navigation" aria-label="Table of contents">
      <div class="html-gems-toc-title">Table of Contents</div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x2728; Interactive</div>
        <ul class="html-gems-toc-list">
          <li><a href="#details-summary" class="html-gems-toc-link">&lt;details&gt; &amp; &lt;summary&gt;</a></li>
          <li><a href="#dialog" class="html-gems-toc-link">&lt;dialog&gt;</a></li>
          <li><a href="#contenteditable" class="html-gems-toc-link">contenteditable</a></li>
        </ul>
      </div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x1F4DD; Forms &amp; Inputs</div>
        <ul class="html-gems-toc-list">
          <li><a href="#datalist" class="html-gems-toc-link">&lt;datalist&gt;</a></li>
          <li><a href="#input-types" class="html-gems-toc-link">Input Types &amp; Validation</a></li>
          <li><a href="#optgroup" class="html-gems-toc-link">&lt;optgroup&gt;</a></li>
        </ul>
      </div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x1F4CA; Indicators</div>
        <ul class="html-gems-toc-list">
          <li><a href="#meter" class="html-gems-toc-link">&lt;meter&gt;</a></li>
          <li><a href="#progress" class="html-gems-toc-link">&lt;progress&gt;</a></li>
          <li><a href="#output" class="html-gems-toc-link">&lt;output&gt;</a></li>
        </ul>
      </div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x1F4D6; Semantic</div>
        <ul class="html-gems-toc-list">
          <li><a href="#code-kbd-samp" class="html-gems-toc-link">&lt;code&gt;/&lt;kbd&gt;/&lt;samp&gt;</a></li>
          <li><a href="#abbr-mark" class="html-gems-toc-link">&lt;abbr&gt; &amp; &lt;mark&gt;</a></li>
          <li><a href="#native-copy" class="html-gems-toc-link">Native Copy Snippet</a></li>
        </ul>
      </div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x1F3AC; Media</div>
        <ul class="html-gems-toc-list">
          <li><a href="#figure" class="html-gems-toc-link">&lt;figure&gt; &amp; &lt;figcaption&gt;</a></li>
          <li><a href="#video-track" class="html-gems-toc-link">&lt;video&gt; &amp; &lt;track&gt;</a></li>
          <li><a href="#picture" class="html-gems-toc-link">&lt;picture&gt;</a></li>
        </ul>
      </div>

      <div class="html-gems-toc-category">
        <div class="html-gems-toc-category-title">&#x2699;&#xFE0F; Attributes</div>
        <ul class="html-gems-toc-list">
          <li><a href="#download" class="html-gems-toc-link">download</a></li>
          <li><a href="#inert" class="html-gems-toc-link">inert</a></li>
          <li><a href="#accesskey" class="html-gems-toc-link">accesskey</a></li>
        </ul>
      </div>
    </aside>

    <div class="html-gems-content"></div>
  </div>

  <button class="html-gems-back-to-top" aria-label="Back to top" title="Back to top">&#x2191;</button>
`;
