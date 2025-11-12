# Lyric Animator V2 - Implementation Fix Plan

**Date:** 2025-11-11  
**Plan Author:** Claude Code  
**Status:** 🔧 READY FOR IMPLEMENTATION  

---

## Executive Summary

### Scope Overview

This implementation plan addresses **48 critical bugs and issues** identified in the Lyric Animator V2 forensic analysis. The fixes are organized into three priority phases targeting functionality, user experience, and code quality.

**Issue Breakdown:**
- **7 Critical Issues (P0)**: Breaks functionality, causes crashes, data loss
- **23 Major Issues (P1)**: Impacts user experience, performance, accessibility
- **18 Minor Issues (P2)**: Code quality, maintainability, polish

### Timeline Estimate

| Phase | Issues | Estimated Time | Cumulative |
|-------|--------|----------------|------------|
| **Phase 1: Critical** | 7 | 8-12 hours | 12 hours |
| **Phase 2: Major** | 23 | 20-30 hours | 42 hours |
| **Phase 3: Minor** | 18 | 10-15 hours | 57 hours |
| **Testing & Verification** | - | 8-10 hours | 67 hours |
| **TOTAL** | **48** | **46-67 hours** | **~67 hours** |

### Risk Assessment

| Status | Risk Level | Deployment Readiness |
|--------|-----------|---------------------|
| **Current (Pre-fixes)** | 🔴 **HIGH RISK** | ❌ Not production ready |
| **After Phase 1** | 🟡 **MEDIUM RISK** | ⚠️ Beta acceptable |
| **After Phase 2** | 🟢 **LOW RISK** | ✅ Production candidate |
| **After Phase 3** | 🟢 **MINIMAL RISK** | ✅ Production ready |

### Critical Dependencies

**Before starting ANY implementation:**
1. ✅ Create feature branch: `git checkout -b fix/lyric-animator-v2-bugs`
2. ✅ Backup current working version
3. ✅ Set up local testing environment
4. ✅ Verify all files can be edited without permission issues

---

## Implementation Strategy

### Why This Order?

**Phase 1 (Critical)**: Fix issues that cause crashes and data loss
- These break core functionality and must be fixed first
- Each fix is isolated and can be tested independently
- Establishes stable foundation for subsequent fixes

**Phase 2 (Major)**: Fix UX, performance, and accessibility issues
- Builds on stable foundation from Phase 1
- Groups related fixes by file/module for efficiency
- Many can be batched together in single commits

**Phase 3 (Minor)**: Polish, code quality, and maintainability
- Safe to implement after core functionality is solid
- Can be done incrementally over time
- Low risk of introducing regressions

### Dependency Chain

```
Phase 1.1 (Variable Redeclaration) 
    ↓
Phase 1.2 (Script Loading) ← BLOCKS all other fixes
    ↓
Phase 1.3-1.7 (Null checks, race conditions)
    ↓
Phase 2 (UX & Performance) ← Can batch multiple fixes
    ↓
Phase 3 (Polish) ← Low priority, can be async
```

### Testing Approach

**After Each Phase:**
1. Run manual smoke tests (upload file, play audio, change settings)
2. Test in multiple browsers (Chrome, Firefox, Safari)
3. Verify no console errors
4. Check mobile responsiveness
5. Test accessibility with screen reader

**After Each Critical Fix:**
- Verify the specific bug no longer occurs
- Test related functionality
- Check for new regressions

---

## Phase 1: Critical Issues (Priority P0)

**Goal:** Fix all bugs that cause crashes, data loss, or broken functionality.  
**Estimated Time:** 8-12 hours  
**Testing After Phase:** Full manual smoke test required

### Critical Issues Checklist

- [x] **Issue #1**: Variable Redeclaration - Memory Leak Risk
- [x] **Issue #2**: Uncaught TypeError - Missing Function Check
- [x] **Issue #3**: Null Container Reference - Particles Crash
- [x] **Issue #4**: Race Condition - Script Loading Order
- [x] **Issue #5**: Missing Null Check - Tooltip Crash
- [x] **Issue #6**: Array Index Out of Bounds (already fixed)
- [x] **Issue #7**: Infinite Loop Risk - Control Syncing

---

### Issue #1: Variable Redeclaration - Memory Leak Risk

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 37, 78  
**Impact:** Script may fail to load entirely in strict mode

**Problem:**
```javascript
// Line 37
const skeleton = document.getElementById('lyrics-skeleton');

// Line 78 - REDECLARATION ERROR!
const skeleton = document.getElementById('lyrics-skeleton');
```

**Root Cause:** Same variable name declared twice with `const` causes SyntaxError in strict mode.

**Fix:**
```javascript
// Line 37 - Keep original
const skeleton = document.getElementById('lyrics-skeleton');

// Line 78 - Rename to skeletonElement or reuse original
// Option 1: Rename
const skeletonElement = document.getElementById('lyrics-skeleton');
if (skeletonElement) {
    skeletonElement.style.display = 'none';
}

// Option 2: Reuse (if already in scope)
if (skeleton) {
    skeleton.style.display = 'none';
}
```

**Recommended Fix (Option 2):**
- Line 78: Remove `const` declaration, reuse `skeleton` from line 37
- Ensure `skeleton` is in scope (not inside if/else block at line 37)

**Verification Steps:**
1. Open browser console
2. Enable strict mode: `'use strict';`
3. Reload page
4. Verify no SyntaxError
5. Upload LRC file and verify skeleton shows/hides correctly

**Files to Change:**
- `static/js/lyrics-animator-v2.js`

---

### Issue #2: Uncaught TypeError - Missing Function Check

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyric-animator-ui-v2.js`  
**Line:** 134  
**Impact:** File uploads crash with ReferenceError

**Problem:**
```javascript
if (typeof parseAndAnimateLyrics === 'function') {
    parseAndAnimateLyrics(file);  // ❌ ReferenceError in strict mode
}
```

**Root Cause:** `parseAndAnimateLyrics` is defined as `window.parseAndAnimateLyrics` but check doesn't reference window object.

**Fix:**
```javascript
// Change line 134
if (typeof window.parseAndAnimateLyrics === 'function') {
    window.parseAndAnimateLyrics(file);
}
```

**Additional Check (Defensive Programming):**
```javascript
// Better: Add null check and error message
if (window.parseAndAnimateLyrics && typeof window.parseAndAnimateLyrics === 'function') {
    window.parseAndAnimateLyrics(file);
} else {
    console.error('parseAndAnimateLyrics function not loaded');
    if (window.NotificationManager) {
        window.NotificationManager.showError('scriptLoadError');
    }
}
```

**Verification Steps:**
1. Open browser console
2. Upload a valid LRC file
3. Verify no ReferenceError
4. Verify file parses and displays correctly
5. Test with invalid file to ensure error handling works

**Files to Change:**
- `static/js/lyric-animator-ui-v2.js`

---

### Issue #3: Null Container Reference - Particles Crash

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyric-animator-particles-v2.js`  
**Lines:** 44-50  
**Impact:** Particles.js crashes on customization, breaking entire background system

**Problem:**
```javascript
if (window.pJSDom.length > 0) {
    const container = document.getElementById('particles-js');
    if (container) {
        container.innerHTML = '';
    } else {
        console.error('Particles container (#particles-js) not found.');
        return;  // ⚠️ Returns but window.pJSDom already cleared
    }
    window.pJSDom = [];  // This line is AFTER the return
}
```

**Root Cause:** `window.pJSDom = []` is inside the if block but after the early return, so it never executes when container is null.

**Fix:**
```javascript
// Move window.pJSDom = [] BEFORE container check
if (window.pJSDom.length > 0) {
    window.pJSDom = [];  // Clear first
    
    const container = document.getElementById('particles-js');
    if (!container) {
        console.error('Particles container (#particles-js) not found.');
        return;
    }
    
    container.innerHTML = '';  // Safe to clear now
}
```

**Verification Steps:**
1. Open page and enable particles background
2. Change particle settings (count, size, speed)
3. Switch to different background and back to particles
4. Verify no crash in console
5. Verify particles reinitialize correctly

**Files to Change:**
- `static/js/lyric-animator-particles-v2.js`

---

### Issue #4: Race Condition - Script Loading Order

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `templates/lyricAnimator.html`  
**Lines:** 640-678  
**Impact:** Random failures on page load, especially on slow connections

**Problem:**
```javascript
const scripts = [
    '{{ url_for("static", filename="js/lyric-animator-state.js") }}?v=' + timestamp,
    '{{ url_for("static", filename="js/backgrounds/bg-manager.js") }}?v=' + timestamp,
    '{{ url_for("static", filename="js/lyrics-animator-v2-animations.js") }}?v=' + timestamp,
    '{{ url_for("static", filename="js/lyrics-animator-v2-layouts.js") }}?v=' + timestamp,
    '{{ url_for("static", filename="js/lyrics-animator-v2.js") }}?v=' + timestamp,
    '{{ url_for("static", filename="js/lyric-animator-ui-v2.js") }}?v=' + timestamp
];
scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    document.body.appendChild(script);  // ❌ Loads in parallel - race condition!
});
```

**Root Cause:** Scripts load asynchronously without waiting for dependencies. `lyrics-animator-v2.js` may execute before `LyricsAnimations` is defined.

**Fix (Sequential Loading):**
```javascript
// Replace entire script loading section with sequential loader
async function loadScriptsSequentially() {
    const timestamp = new Date().getTime();
    const scripts = [
        '{{ url_for("static", filename="js/lyric-animator-state.js") }}?v=' + timestamp,
        '{{ url_for("static", filename="js/backgrounds/bg-manager.js") }}?v=' + timestamp,
        '{{ url_for("static", filename="js/lyrics-animator-v2-animations.js") }}?v=' + timestamp,
        '{{ url_for("static", filename="js/lyrics-animator-v2-layouts.js") }}?v=' + timestamp,
        '{{ url_for("static", filename="js/lyrics-animator-v2.js") }}?v=' + timestamp,
        '{{ url_for("static", filename="js/lyric-animator-ui-v2.js") }}?v=' + timestamp
    ];

    for (const src of scripts) {
        await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${src}`));
            document.body.appendChild(script);
        });
    }
    
    console.log('All V2 scripts loaded successfully');
}

// Execute on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadScriptsSequentially);
} else {
    loadScriptsSequentially();
}
```

**Verification Steps:**
1. Clear browser cache completely
2. Reload page with Network throttling enabled (Slow 3G)
3. Verify all scripts load in correct order
4. Check console for "All V2 scripts loaded successfully"
5. Test upload and playback functionality
6. Repeat test 5 times to ensure consistency

**Files to Change:**
- `templates/lyricAnimator.html`

---

### Issue #5: Missing Null Check - Tooltip Crash

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 222-224  
**Impact:** Progress bar tooltip crashes entire application

**Problem:**
```javascript
const controlsDiv = document.getElementById('controls');
controlsDiv.style.position = 'relative';  // ❌ No null check!
controlsDiv.appendChild(progressTooltip);
```

**Root Cause:** If `controls` element doesn't exist, `controlsDiv` is null, causing TypeError.

**Fix:**
```javascript
const controlsDiv = document.getElementById('controls');
if (!controlsDiv) {
    console.error('Controls div not found - tooltip initialization skipped');
    return;  // Exit function early
}

controlsDiv.style.position = 'relative';
controlsDiv.appendChild(progressTooltip);
```

**Better Fix (Graceful Degradation):**
```javascript
const controlsDiv = document.getElementById('controls');
if (controlsDiv) {
    controlsDiv.style.position = 'relative';
    controlsDiv.appendChild(progressTooltip);
    
    // Add event listeners only if tooltip is attached
    progressBar.addEventListener('mousemove', handleTooltipMove);
    progressBar.addEventListener('mouseleave', handleTooltipHide);
} else {
    console.warn('Controls div not found - progress tooltip disabled');
    // Application continues without tooltip
}
```

**Verification Steps:**
1. Load page normally and verify tooltip works
2. Test hover over progress bar
3. Temporarily remove `#controls` div from HTML
4. Reload and verify no crash (graceful degradation)
5. Restore `#controls` div

**Files to Change:**
- `static/js/lyrics-animator-v2.js`

---

### Issue #6: Array Index Out of Bounds

- [x] **Fixed and verified** (return statement already present)

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyrics-animator-v2.js`  
**Line:** 72  
**Impact:** Application crashes when uploading invalid LRC files

**Problem:**
```javascript
// Line 59 - Check if empty
if (lyricData.length === 0) {
    console.error('No valid timestamps found in file');
    // ... show error ...
    // ⚠️ Execution continues!
}

// Line 72 - This crashes if lyricData is empty
window.totalTime = lyricData[lyricData.length - 1].time + 5;
```

**Root Cause:** Error check doesn't return early, so code continues to execute with empty array.

**Fix:**
```javascript
// Line 59 - Add return statement
if (lyricData.length === 0) {
    console.error('No valid timestamps found in file');
    if (window.NotificationManager) {
        window.NotificationManager.showError('noTimestamps');
    }
    document.getElementById('status').textContent = 'Upload a valid LRC file to continue';
    return;  // ✅ Stop execution here
}

// Now safe to access lyricData
window.totalTime = lyricData[lyricData.length - 1].time + 5;
```

**Even Better Fix (Defensive):**
```javascript
if (lyricData.length === 0) {
    console.error('No valid timestamps found in file');
    if (window.NotificationManager) {
        window.NotificationManager.showError('noTimestamps');
    }
    document.getElementById('status').textContent = 'Upload a valid LRC file to continue';
    
    // Reset state
    window.totalTime = 0;
    window.currentTime = 0;
    window.lyricData = [];
    
    return;  // Exit function
}

// Double check before accessing
if (lyricData.length > 0) {
    window.totalTime = lyricData[lyricData.length - 1].time + 5;
} else {
    window.totalTime = 0;
}
```

**Verification Steps:**
1. Create invalid LRC file with no timestamps (only plain text)
2. Upload invalid file
3. Verify error message displays
4. Verify no crash in console
5. Verify app remains functional
6. Upload valid file after to confirm recovery

**Test File (invalid.lrc):**
```
This is a test
No timestamps here
Just plain text
```

**Files to Change:**
- `static/js/lyrics-animator-v2.js`

---

### Issue #7: Infinite Loop Risk - Control Syncing

- [x] **Fixed and verified**

**Priority:** P0 - CRITICAL  
**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 538-548  
**Impact:** Browser freeze, maximum call stack exceeded error

**Problem:**
```javascript
// Sync from essentials to detail
essentialsControl.addEventListener('change', (e) => {
    detailControl.value = e.target.value;
    detailControl.dispatchEvent(new Event('change'));  // ❌ Triggers listener below
});

// Sync from detail to essentials
detailControl.addEventListener('change', (e) => {
    essentialsControl.value = e.target.value;
    essentialsControl.dispatchEvent(new Event('change'));  // ❌ Triggers listener above
});
```

**Root Cause:** Bidirectional event dispatching creates infinite recursion.

**Fix (Option 1: Flag to Prevent Recursion):**
```javascript
let isSyncing = false;  // Flag to prevent recursive triggers

// Sync from essentials to detail
essentialsControl.addEventListener('change', (e) => {
    if (isSyncing) return;  // Prevent recursion
    
    isSyncing = true;
    detailControl.value = e.target.value;
    detailControl.dispatchEvent(new Event('change'));
    isSyncing = false;
});

// Sync from detail to essentials
detailControl.addEventListener('change', (e) => {
    if (isSyncing) return;  // Prevent recursion
    
    isSyncing = true;
    essentialsControl.value = e.target.value;
    essentialsControl.dispatchEvent(new Event('change'));
    isSyncing = false;
});
```

**Fix (Option 2: Check Event Origin):**
```javascript
// Sync from essentials to detail
essentialsControl.addEventListener('change', (e) => {
    if (!e.isTrusted) return;  // Ignore programmatic events
    detailControl.value = e.target.value;
    // Don't dispatch event - just update value
    // If detailControl needs to trigger effects, call them directly
});

// Sync from detail to essentials  
detailControl.addEventListener('change', (e) => {
    if (!e.isTrusted) return;  // Ignore programmatic events
    essentialsControl.value = e.target.value;
    // Don't dispatch event - just update value
});
```

**Recommended Fix: Option 1** (more explicit and debuggable)

**Verification Steps:**
1. Find paired controls (essentials/detail tabs)
2. Change value in essentials tab
3. Verify detail tab updates
4. Change value in detail tab
5. Verify essentials tab updates
6. Monitor console for stack overflow errors
7. Rapidly toggle between tabs and change values
8. Verify no freeze or lag

**Files to Change:**
- `static/js/lyric-animator-ui-v2.js` (multiple locations - search for "Sync from")

---

## Phase 2: Major Issues (Priority P1)

**Goal:** Fix UX, performance, accessibility, and memory management issues.  
**Estimated Time:** 20-30 hours  
**Testing After Phase:** Browser compatibility test, accessibility audit

### Major Issues Checklist

**Memory & Performance:**
- [x] **Issue #8**: Memory Leak - Timeout Array Growth
- [x] **Issue #20**: Missing Cleanup on Page Unload
- [ ] **Issue #30**: Time Display Flicker During Rapid Updates

**Validation & Error Handling:**
- [ ] **Issue #9**: Missing Audio File Validation
- [x] **Issue #13**: Missing Error Boundary - Animation Failures
- [ ] **Issue #14**: Background Manager Container Null Risk
- [ ] **Issue #17**: Audio Sync Missing Error Handling

**Animation & Layout:**
- [x] **Issue #10**: Animation State Corruption
- [ ] **Issue #16**: Layout Switching Doesn't Reset Container Styles
- [x] **Issue #22**: Animation Preset Preview Doesn't Clear Previous State
- [ ] **Issue #23**: Multiline Layout Scroll Behavior Conflicts

**UI & UX:**
- [ ] **Issue #11**: YouTube Download Progress Simulation
- [ ] **Issue #18**: Progress Bar Tooltip Position Calculation Bug
- [ ] **Issue #19**: Drag Counter Race Condition
- [ ] **Issue #24**: Version Selector Confirmation Bypassed
- [ ] **Issue #25**: Background Style Selector ID Mismatch

**Accessibility:**
- [ ] **Issue #15**: ARIA Label Incomplete Implementation

**Particles & Background:**
- [ ] **Issue #12**: Particles.js Initialization Guard Failure
- [ ] **Issue #21**: Color Conversion Precision Loss
- [ ] **Issue #28**: Particles.js Configuration Mutation

**State Management:**
- [ ] **Issue #26**: State Manager Circular Dependency Risk

**CSS & Styling:**
- [ ] **Issue #27**: CSS Variable Fallback Missing

**Validation:**
- [ ] **Issue #29**: YouTube Video ID Validation Too Strict

---

### Grouping Strategy for Phase 2

**Group A: Memory Management (Issues #8, #20)**
- Single commit: "Fix memory leaks in timeout cleanup and page unload"
- Files: `lyrics-animator-v2.js`, `lyric-animator-ui-v2.js`

**Group B: Animation System (Issues #10, #13, #22)**
- Single commit: "Add error boundaries and state management to animations"
- Files: `lyrics-animator-v2.js`, `lyrics-animator-v2-animations.js`

**Group C: Particles System (Issues #3, #12, #21, #28)**
- Single commit: "Fix particles initialization, color conversion, and config mutation"
- Files: `lyric-animator-particles-v2.js`

**Group D: Validation (Issues #9, #17, #29)**
- Single commit: "Add comprehensive input validation"
- Files: `lyric-animator-ui-v2.js`

**Group E: Layout & UI (Issues #16, #18, #19, #23, #24, #25)**
- Single commit: "Fix layout switching, tooltips, and drag-and-drop"
- Files: `lyric-animator-ui-v2.js`, `lyrics-animator-v2.js`

**Group F: Accessibility (Issue #15)**
- Single commit: "Complete ARIA implementation for screen readers"
- Files: `lyric-animator-ui-v2.js`

**Group G: Performance (Issues #11, #30)**
- Single commit: "Optimize time display updates and progress indicators"
- Files: `lyrics-animator-v2.js`, `lyric-animator-ui-v2.js`

**Group H: CSS & Styling (Issue #27)**
- Single commit: "Add CSS variable fallbacks for older browsers"
- Files: `lyric-animator-v2.css`

**Group I: State Management (Issues #14, #26)**
- Single commit: "Fix background manager and prevent circular dependencies"
- Files: `bg-manager.js`, `lyric-animator-state.js`

---

### GROUP A: Memory Management

#### Issue #8: Memory Leak - Timeout Array Growth

- [x] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 21-24  

**Problem:**
```javascript
function clearTypewriterTimeouts() {
    window.typewriterTimeouts.forEach(timeout => clearTimeout(timeout));
    window.typewriterTimeouts.length = 0;
}
// ⚠️ Not called consistently in all exit paths
```

**Fix - Ensure cleanup in all paths:**

1. **Find all exit paths** (pause, reset, stop, error, new file):
```bash
# Search for functions that should call cleanup
rg "window.isPlaying = false" static/js/
rg "function.*pause|stop|reset" static/js/
```

2. **Add cleanup calls:**
```javascript
// In pause handler
function pauseLyrics() {
    window.isPlaying = false;
    clearTypewriterTimeouts();  // ✅ Add this
    // ... rest of pause logic
}

// In reset handler
function resetLyrics() {
    clearTypewriterTimeouts();  // ✅ Add this
    window.currentTime = 0;
    window.currentDisplayIndex = -1;
    // ... rest of reset logic
}

// In parseAndAnimateLyrics (before parsing new file)
window.parseAndAnimateLyrics = function(file) {
    clearTypewriterTimeouts();  // ✅ Clear old timeouts first
    // ... rest of parsing logic
}

// In error handlers
if (lyricData.length === 0) {
    clearTypewriterTimeouts();  // ✅ Add this
    return;
}
```

**Verification:**
1. Load lyrics and let animation play
2. Pause multiple times
3. Upload new file while playing
4. Open DevTools Memory Profiler
5. Take heap snapshot before and after
6. Verify `typewriterTimeouts` array doesn't grow unbounded

---

#### Issue #20: Missing Cleanup on Page Unload

- [x] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 818-830  

**Problem:**
```javascript
window.addEventListener('beforeunload', () => {
    if (window.tempAudioFilePath) {
        fetch('/api/cleanup-audio', {
            keepalive: true  // ⚠️ Not guaranteed to work
        });
    }
});
```

**Fix - Add navigator.sendBeacon:**
```javascript
// Better: Use sendBeacon (more reliable than fetch with keepalive)
window.addEventListener('beforeunload', () => {
    if (window.tempAudioFilePath) {
        const data = JSON.stringify({ file_path: window.tempAudioFilePath });
        
        // Try sendBeacon first (most reliable)
        if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon('/api/cleanup-audio', blob);
        } else {
            // Fallback to keepalive fetch
            fetch('/api/cleanup-audio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: data,
                keepalive: true
            }).catch(() => {
                console.warn('Cleanup request failed - server cleanup will handle it');
            });
        }
    }
});

// Also cleanup on visibility change (user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && window.tempAudioFilePath) {
        // Clear temp audio when user leaves page
        const data = JSON.stringify({ file_path: window.tempAudioFilePath });
        if (navigator.sendBeacon) {
            const blob = new Blob([data], { type: 'application/json' });
            navigator.sendBeacon('/api/cleanup-audio', blob);
        }
    }
});
```

**Verification:**
1. Download YouTube audio
2. Close tab immediately
3. Check server logs for cleanup request
4. Verify temp file is deleted
5. Test in different browsers (Chrome, Firefox, Safari)

---

### GROUP B: Animation System

#### Issue #10: Animation State Corruption

- [x] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2-animations.js`  
**Lines:** 24, 44, 64, 84, 104, 124  

**Problem:**
```javascript
slideIn: function(chars, isPlaying) {
    chars.forEach(char => char.classList.remove('visible', 'animated'));  // ❌ No state check
    
    if (isPlaying && window.typewriterTimeouts.length === 0) {
        // Start animation
    }
}
```

**Fix - Add state machine:**
```javascript
// Add at top of file
window.animationState = window.animationState || {
    isRunning: false,
    currentAnimation: null
};

// Update each animation function
slideIn: function(chars, isPlaying) {
    // Cancel running animation first
    if (window.animationState.isRunning) {
        clearTypewriterTimeouts();
        window.animationState.isRunning = false;
    }
    
    // Clean up previous state
    chars.forEach(char => {
        char.classList.remove('visible', 'animated');
        char.removeAttribute('style');  // Clear inline styles
    });
    
    if (isPlaying && !window.animationState.isRunning) {
        window.animationState.isRunning = true;
        window.animationState.currentAnimation = 'slideIn';
        
        // Run animation
        chars.forEach((char, index) => {
            const timeout = setTimeout(() => {
                char.classList.add('visible', 'animated');
                
                // Mark as complete when last char animates
                if (index === chars.length - 1) {
                    window.animationState.isRunning = false;
                }
            }, index * 50);
            window.typewriterTimeouts.push(timeout);
        });
    } else if (!isPlaying) {
        // Show all immediately
        chars.forEach(char => char.classList.add('visible'));
    }
}

// Apply same pattern to all 6 animation functions
```

**Verification:**
1. Start playing lyrics with typewriter animation
2. Quickly switch to slideIn
3. Switch back to typewriter
4. Verify no visual glitches
5. Verify smooth transition
6. Check console for state errors

---

#### Issue #13: Missing Error Boundary - Animation Failures

- [x] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 301-307  

**Problem:**
```javascript
const animationPreset = window.currentAnimation || 'typewriter';
if (window.LyricsAnimations && window.LyricsAnimations[animationPreset]) {
    window.LyricsAnimations[animationPreset](chars, window.isPlaying);  // ❌ No try-catch
}
```

**Fix - Add error boundary:**
```javascript
const animationPreset = window.currentAnimation || 'typewriter';
if (window.LyricsAnimations && window.LyricsAnimations[animationPreset]) {
    try {
        window.LyricsAnimations[animationPreset](chars, window.isPlaying);
    } catch (error) {
        console.error(`Animation '${animationPreset}' failed:`, error);
        
        // Fallback to simple display
        chars.forEach(char => char.classList.add('visible'));
        
        // Notify user
        if (window.NotificationManager) {
            window.NotificationManager.showError('animationError');
        }
        
        // Reset to typewriter (safe fallback)
        window.currentAnimation = 'typewriter';
        
        // Update UI if possible
        const animationSelect = document.getElementById('animation-preset') || 
                                document.getElementById('v2-animation-preset');
        if (animationSelect) {
            animationSelect.value = 'typewriter';
        }
    }
} else {
    // Fallback if animation doesn't exist
    console.warn(`Animation '${animationPreset}' not found, falling back to visible`);
    chars.forEach(char => char.classList.add('visible'));
}
```

**Verification:**
1. Temporarily break an animation function (add `throw new Error('test')`)
2. Select that animation
3. Verify error is caught
4. Verify fallback works
5. Verify app continues functioning
6. Remove test error

---

#### Issue #22: Animation Preset Preview Doesn't Clear Previous State

- [x] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 159-189, 556-601  

**Problem:**
```javascript
chars.forEach(char => {
    char.classList.remove('visible', 'animated');
    char.style.animation = 'none';  // ❌ Doesn't remove other inline styles
});
```

**Fix - Complete style reset:**
```javascript
animationPreset.addEventListener('change', (e) => {
    window.currentAnimation = e.target.value;
    
    if (window.currentDisplayIndex >= 0) {
        const chars = currentLine.querySelectorAll('.karaoke-char');
        
        // Complete reset of all animation artifacts
        chars.forEach(char => {
            // Remove classes
            char.classList.remove('visible', 'animated');
            
            // Remove ALL inline styles
            char.removeAttribute('style');
            
            // Or reset specific properties if removal isn't safe:
            // char.style.cssText = '';
            // char.style.opacity = '';
            // char.style.transform = '';
            // char.style.animation = '';
        });
        
        // Force reflow to ensure clean slate
        void currentLine.offsetWidth;
        
        // Re-run animation with new preset
        if (window.LyricsAnimations && window.LyricsAnimations[e.target.value]) {
            window.LyricsAnimations[e.target.value](chars, window.isPlaying);
        }
    }
    
    // Show notification
    if (window.NotificationManager) {
        window.NotificationManager.showInfo('settingChanged', {
            setting: 'Animation',
            value: e.target.options[e.target.selectedIndex].text
        });
    }
});
```

**Verification:**
1. Play lyrics with slideIn animation
2. Switch to typewriter mid-animation
3. Verify no leftover transforms/opacity
4. Switch to fade
5. Verify clean transition
6. Test all 6 animation combinations

---

### GROUP C: Particles System

#### Issue #12: Particles.js Initialization Guard Failure

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-particles-v2.js`  
**Lines:** 38-40  

**Problem:**
```javascript
if (window.pJSDom === null || window.pJSDom === undefined) {
    window.pJSDom = [];
}
// ❌ Doesn't check if pJSDom is corrupted (e.g., {} or "string")
```

**Fix - Robust type check:**
```javascript
// Check if pJSDom exists and is array
if (!Array.isArray(window.pJSDom)) {
    console.warn('pJSDom was corrupted or undefined, reinitializing');
    window.pJSDom = [];
}
```

**Verification:**
1. Open console
2. Test: `window.pJSDom = "corrupted"`
3. Reload particles
4. Verify it resets to array
5. Test: `window.pJSDom = {}`
6. Reload particles
7. Verify no crash

---

#### Issue #21: Color Conversion Precision Loss

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-particles-v2.js`  
**Lines:** 67-89  

**Problem:**
```javascript
function hslToHex(h, s, l) {
    // ... conversion logic ...
    return `#${Math.round(r * 255).toString(16).padStart(2, '0')}...`;
}
// ⚠️ Repeated conversions lose precision
```

**Fix - Store original values:**
```javascript
// Add storage for original color values
const colorStorage = {
    original: null,  // Store original hex
    current: null    // Store current hex
};

// Update color picker handler
themeColorPicker.addEventListener('input', (e) => {
    const hexColor = e.target.value;
    
    // Store original if first time
    if (!colorStorage.original) {
        colorStorage.original = hexColor;
    }
    colorStorage.current = hexColor;
    
    // Convert for display only (don't store converted value)
    const hsl = hexToHSL(hexColor);
    
    // Update sliders
    hSlider.value = hsl.h;
    sSlider.value = hsl.s;
    lSlider.value = hsl.l;
    
    // Apply theme
    applyThemeColor(hexColor);  // Use original hex, not converted
});

// HSL sliders should convert back carefully
hSlider.addEventListener('input', () => {
    const h = parseFloat(hSlider.value);
    const s = parseFloat(sSlider.value);
    const l = parseFloat(lSlider.value);
    
    const hex = hslToHex(h, s, l);
    colorStorage.current = hex;
    
    // Update color picker
    themeColorPicker.value = hex;
    
    // Apply theme
    applyThemeColor(hex);
});

// Add reset to original
function resetColorToOriginal() {
    if (colorStorage.original) {
        themeColorPicker.value = colorStorage.original;
        applyThemeColor(colorStorage.original);
    }
}
```

**Verification:**
1. Set theme color to `#ff8e53`
2. Adjust HSL sliders
3. Convert back to hex
4. Verify hex matches original (within 1-2 units)
5. Repeat 10 times
6. Verify no drift

---

#### Issue #28: Particles.js Configuration Mutation

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-particles-v2.js`  
**Lines:** 154-207  

**Problem:**
```javascript
particleCount.addEventListener('input', e => {
    particlesConfig.particles.number.value = Math.max(1, +e.target.value);
    reloadParticles();  // ⚠️ Mutates global config
});
```

**Fix - Clone config before mutation:**
```javascript
// Store default config
const DEFAULT_PARTICLES_CONFIG = {
    particles: {
        number: { value: 80 },
        size: { value: 3 },
        move: { speed: 1 }
        // ... full default config
    }
};

// Clone function
function cloneConfig(config) {
    return JSON.parse(JSON.stringify(config));
}

// Update event listeners to use cloned config
particleCount.addEventListener('input', e => {
    const count = Math.max(1, +e.target.value);
    
    // Clone default config
    const newConfig = cloneConfig(DEFAULT_PARTICLES_CONFIG);
    newConfig.particles.number.value = count;
    
    // Apply other current settings
    newConfig.particles.size.value = particleSize.value;
    newConfig.particles.move.speed = particleSpeed.value;
    
    // Reload with new config
    reloadParticles(newConfig);
});

// Update reloadParticles to accept config
function reloadParticles(config = null) {
    if (window.pJSDom && Array.isArray(window.pJSDom) && window.pJSDom.length > 0) {
        window.pJSDom = [];
    }
    
    const container = document.getElementById('particles-js');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Use provided config or default
    const finalConfig = config || cloneConfig(DEFAULT_PARTICLES_CONFIG);
    particlesJS('particles-js', finalConfig);
}
```

**Verification:**
1. Set particle count to 150
2. Switch to different background
3. Switch back to particles
4. Verify count resets to default (80)
5. If we want to persist: add localStorage save/load

---

### GROUP D: Validation

#### Issue #9: Missing Audio File Validation

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 282-294  

**Problem:**
```javascript
if (file) {  // ❌ No type validation!
    const audioElement = new Audio(URL.createObjectURL(file));
}
```

**Fix - Add MIME type validation:**
```javascript
const VALID_AUDIO_TYPES = [
    'audio/mpeg',      // .mp3
    'audio/mp4',       // .m4a
    'audio/wav',       // .wav
    'audio/ogg',       // .ogg
    'audio/webm',      // .webm
    'audio/aac',       // .aac
    'audio/flac'       // .flac
];

audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate MIME type
    if (!VALID_AUDIO_TYPES.includes(file.type)) {
        console.error(`Invalid file type: ${file.type}`);
        
        if (window.NotificationManager) {
            window.NotificationManager.showError('invalidAudioType', {
                type: file.type,
                validTypes: 'MP3, WAV, OGG, M4A, AAC, FLAC, WebM'
            });
        }
        
        // Clear input
        audioFileInput.value = '';
        return;
    }
    
    // Validate file size (e.g., max 50MB)
    const MAX_SIZE = 50 * 1024 * 1024;  // 50MB
    if (file.size > MAX_SIZE) {
        console.error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        
        if (window.NotificationManager) {
            window.NotificationManager.showError('audioTooLarge', {
                size: (file.size / 1024 / 1024).toFixed(2) + 'MB',
                maxSize: '50MB'
            });
        }
        
        audioFileInput.value = '';
        return;
    }
    
    // Valid file - proceed
    const audioElement = new Audio(URL.createObjectURL(file));
    // ... rest of logic
});
```

**Verification:**
1. Upload image file (.png)
2. Verify error message
3. Upload PDF file
4. Verify error message
5. Upload valid MP3
6. Verify it works
7. Test each valid audio format

---

#### Issue #17: Audio Sync Missing Error Handling

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 745-758  

**Problem:**
```javascript
audioElement.addEventListener('error', () => {
    youtubeStatus.textContent = 'Error loading audio file';
    // ❌ No retry, no cleanup, no user guidance
});
```

**Fix - Comprehensive error handling:**
```javascript
let audioRetryCount = 0;
const MAX_AUDIO_RETRIES = 3;

audioElement.addEventListener('error', (e) => {
    const error = e.target.error;
    let errorMessage = 'Unknown error loading audio';
    
    // Decode error type
    if (error) {
        switch (error.code) {
            case error.MEDIA_ERR_ABORTED:
                errorMessage = 'Audio loading was aborted';
                break;
            case error.MEDIA_ERR_NETWORK:
                errorMessage = 'Network error loading audio';
                break;
            case error.MEDIA_ERR_DECODE:
                errorMessage = 'Audio file is corrupted or unsupported format';
                break;
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                errorMessage = 'Audio format not supported by your browser';
                break;
        }
    }
    
    console.error('Audio load error:', errorMessage, error);
    
    // Try retry for network errors
    if (error && error.code === error.MEDIA_ERR_NETWORK && audioRetryCount < MAX_AUDIO_RETRIES) {
        audioRetryCount++;
        
        youtubeStatus.textContent = `Network error. Retrying (${audioRetryCount}/${MAX_AUDIO_RETRIES})...`;
        
        setTimeout(() => {
            audioElement.load();  // Retry loading
        }, 2000);
        
        return;
    }
    
    // Max retries reached or non-retryable error
    youtubeStatus.textContent = `❌ ${errorMessage}`;
    youtubeStatus.style.color = 'var(--error, #ff4444)';
    
    // Show notification with action
    if (window.NotificationManager) {
        window.NotificationManager.showError('audioLoadFailed', {
            error: errorMessage,
            action: 'Try a different video or upload audio manually'
        });
    }
    
    // Clean up UI
    youtubeProgressBar.style.display = 'none';
    clearInterval(progressInterval);  // Stop fake progress
    
    // Show retry button
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Try Again';
    retryBtn.className = 'btn btn-secondary';
    retryBtn.onclick = () => {
        audioRetryCount = 0;
        youtubeStatus.textContent = 'Retrying...';
        audioElement.src = result.file_url;  // Reload source
        audioElement.load();
        retryBtn.remove();
    };
    
    youtubeStatus.parentElement.appendChild(retryBtn);
    
    // Reset retry count after 30 seconds
    setTimeout(() => {
        audioRetryCount = 0;
    }, 30000);
});

audioElement.addEventListener('canplaythrough', () => {
    audioRetryCount = 0;  // Reset on success
    // ... success handling
});
```

**Verification:**
1. Test with invalid URL (404)
2. Verify error message and retry button
3. Test with corrupted audio file
4. Verify decode error handling
5. Simulate network error (DevTools offline)
6. Verify retry mechanism works

---

#### Issue #29: YouTube Video ID Validation Too Strict

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 689-696  

**Problem:**
```javascript
const youtubeIdPattern = /^[a-zA-Z0-9_-]{11}$/;  // ❌ Too strict
```

**Fix - Relaxed validation:**
```javascript
// Accept 10-13 character IDs (covers edge cases)
const youtubeIdPattern = /^[a-zA-Z0-9_-]{10,13}$/;

if (!youtubeIdPattern.test(videoId)) {
    if (window.NotificationManager) {
        window.NotificationManager.showError('invalidVideoId', {
            providedId: videoId,
            expectedFormat: '10-13 alphanumeric characters, hyphens, and underscores'
        });
    }
    return;
}
```

**Verification:**
1. Test with standard 11-char ID: `dQw4w9WgXcQ`
2. Test with 10-char ID (if you find one)
3. Test with 12-char ID (if you find one)
4. Test with invalid ID: `abc123!@#`
5. Verify appropriate error messages

---

### GROUP E: Layout & UI

#### Issue #16: Layout Switching Doesn't Reset Container Styles

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 221-236  

**Problem:**
```javascript
window.currentDisplayIndex = -1;
window.currentDisplayIndex = tempIndex;  // ❌ Hacky reset
// Container styles from previous layout persist
```

**Fix - Explicit style reset:**
```javascript
layoutMode.addEventListener('change', (e) => {
    const newLayout = e.target.value;
    const oldLayout = window.currentLayout;
    window.currentLayout = newLayout;
    
    const lyricsContainer = document.getElementById('lyrics-container');
    if (lyricsContainer) {
        // Reset ALL layout-specific styles
        lyricsContainer.style.cssText = '';
        
        // Also reset all line styles
        const allLines = lyricsContainer.querySelectorAll('.karaoke-line');
        allLines.forEach(line => {
            line.style.cssText = '';
            line.className = 'karaoke-line';  // Reset to base class
        });
    }
    
    // Show notification
    if (window.NotificationManager) {
        window.NotificationManager.showInfo('settingChanged', {
            setting: 'Layout',
            value: e.target.options[e.target.selectedIndex].text
        });
    }
    
    // Re-render current lyric with new layout
    if (window.currentDisplayIndex >= 0 && typeof updateLyricsDisplay === 'function') {
        updateLyricsDisplay();
    }
});
```

**Verification:**
1. Start with classic layout
2. Switch to bottom bar (verify fixed positioning)
3. Switch to multiline (verify scroll appears)
4. Switch back to classic
5. Verify no leftover fixed positioning or scroll
6. Test all layout combinations

---

#### Issue #18: Progress Bar Tooltip Position Calculation Bug

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 228-244  

**Problem:**
```javascript
const tooltipX = offsetX;  // ❌ No bounds checking
progressTooltip.style.left = `${tooltipX}px`;
```

**Fix - Add bounds checking:**
```javascript
progressBar.addEventListener('mousemove', (e) => {
    if (!progressTooltip) return;
    
    const rect = progressBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));
    const hoverTime = percentage * window.totalTime;
    
    progressTooltip.textContent = formatTime(hoverTime);
    progressTooltip.classList.add('visible');
    
    // Calculate tooltip position with bounds checking
    const tooltipWidth = progressTooltip.offsetWidth || 60;  // Approximate width
    let tooltipX = offsetX - (tooltipWidth / 2);  // Center on cursor
    
    // Keep tooltip within progress bar bounds
    const minX = 0;
    const maxX = rect.width - tooltipWidth;
    tooltipX = Math.max(minX, Math.min(maxX, tooltipX));
    
    progressTooltip.style.left = `${tooltipX}px`;
});
```

**Verification:**
1. Hover at start of progress bar (0%)
2. Verify tooltip doesn't overflow left
3. Hover at end of progress bar (100%)
4. Verify tooltip doesn't overflow right
5. Test on narrow screen (mobile)
6. Verify tooltip stays visible

---

#### Issue #19: Drag Counter Race Condition

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 38-87  

**Problem:**
```javascript
dragCounter--;
if (dragCounter === 0) {
    // ⚠️ dragCounter can become negative
}
```

**Fix - Prevent negative values:**
```javascript
let dragCounter = 0;

uploadArea.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    
    if (dragCounter === 1) {
        uploadArea.classList.add('drag-active');
    }
});

uploadArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter = Math.max(0, dragCounter - 1);  // ✅ Prevent negative
    
    if (dragCounter === 0) {
        uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');
    }
});

// Also reset on drop
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;  // ✅ Reset to 0
    uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');
    // ... handle drop
});

// Reset on drag end (safety net)
uploadArea.addEventListener('dragend', (e) => {
    dragCounter = 0;
    uploadArea.classList.remove('drag-active', 'drag-over', 'drag-invalid');
});
```

**Verification:**
1. Drag file over upload area
2. Move mouse quickly in and out
3. Verify counter doesn't go negative (check in debugger)
4. Verify UI doesn't get stuck in "drag-active" state
5. Try rapid drag in/out 20 times
6. Verify stable behavior

---

#### Issue #23: Multiline Layout Scroll Behavior Conflicts

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 291-298  

**Problem:**
```javascript
if (layoutMode === 'multiline' && window.isPlaying) {
    line.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}
// ⚠️ Called 60 times per second, fights user scrolling
```

**Fix - Debounce scroll:**
```javascript
// Add debounce function at top of file
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Track last scrolled line
let lastScrolledLineIndex = -1;

// Debounced scroll function
const scrollToCurrentLine = debounce((line, currentIndex) => {
    // Only scroll if line changed
    if (currentIndex !== lastScrolledLineIndex) {
        lastScrolledLineIndex = currentIndex;
        
        line.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        });
    }
}, 100);  // Scroll at most once per 100ms

// Update in updateLyricsDisplay()
const layoutMode = window.currentLayout || 'classic';
if (layoutMode === 'multiline' && window.isPlaying) {
    scrollToCurrentLine(line, currentDisplayIndex);
}

// Reset on pause/stop
function pauseLyrics() {
    window.isPlaying = false;
    lastScrolledLineIndex = -1;  // Reset scroll tracking
    // ...
}
```

**Verification:**
1. Enable multiline layout
2. Play lyrics
3. Try to manually scroll
4. Verify you can scroll (not fighting auto-scroll)
5. Verify auto-scroll still works when line changes
6. Monitor performance (should be smooth)

---

#### Issue #24: Version Selector Confirmation Bypassed

- [ ] **Fixed and verified**

**File:** `templates/lyricAnimator.html`  
**Lines:** 682-703  

**Problem:**
```javascript
const hasContent = window.lyricData && window.lyricData.length > 0;
// ⚠️ window.lyricData not always set
```

**Fix - Check DOM state:**
```javascript
versionSelector.addEventListener('change', (e) => {
    const newVersion = e.target.value;
    
    // Check if user has uploaded content (check DOM, not JS variables)
    const lyricsContainer = document.getElementById('lyrics-container');
    const hasContent = lyricsContainer && lyricsContainer.children.length > 0;
    
    // Also check if audio is playing
    const hasAudio = window.audioElement && !window.audioElement.paused;
    
    if ((hasContent || hasAudio) && currentVersion !== newVersion) {
        const confirmed = confirm(
            '⚠️ Switching versions will clear your current session.\n\n' +
            'Current lyrics and audio will be lost.\n\n' +
            'Continue?'
        );
        
        if (!confirmed) {
            e.target.value = currentVersion;  // Revert selection
            return;
        }
    }
    
    // Update version
    currentVersion = newVersion;
    
    // Clear session
    if (window.audioElement) {
        window.audioElement.pause();
        window.audioElement.src = '';
    }
    
    if (lyricsContainer) {
        lyricsContainer.innerHTML = '';
    }
    
    // Reset state
    window.lyricData = [];
    window.currentDisplayIndex = -1;
    window.currentTime = 0;
    
    // Reload page with new version
    location.reload();
});
```

**Verification:**
1. Upload lyrics in V1
2. Switch to V2 without content
3. Verify NO confirmation prompt
4. Upload lyrics
5. Switch versions
6. Verify confirmation prompt appears
7. Cancel and verify version doesn't change
8. Confirm and verify version switches

---

#### Issue #25: Background Style Selector ID Mismatch

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 240-271  

**Problem:**
```javascript
const bgControls = document.getElementById(`${selectedBg}-controls`);
if (bgControls) {
    bgControls.style.display = 'block';
}
// ⚠️ Silent failure if controls don't exist
```

**Fix - Show message when unavailable:**
```javascript
backgroundStyle.addEventListener('change', (e) => {
    const selectedBg = e.target.value;
    
    // Hide all background controls
    const allBgControls = document.querySelectorAll('[id$="-controls"]');
    allBgControls.forEach(ctrl => {
        if (ctrl.id.startsWith('bg') || ctrl.id === 'particles-controls') {
            ctrl.style.display = 'none';
        }
    });
    
    // Show controls for selected background
    const bgControls = document.getElementById(`${selectedBg}-controls`);
    if (bgControls) {
        bgControls.style.display = 'block';
    } else {
        console.warn(`No controls found for background: ${selectedBg}`);
        
        // Show message to user
        const controlsContainer = document.getElementById('background-controls-container');
        if (controlsContainer) {
            const noControlsMsg = document.createElement('div');
            noControlsMsg.className = 'info-message';
            noControlsMsg.textContent = `ℹ️ No customization options available for this background`;
            noControlsMsg.style.padding = '1rem';
            noControlsMsg.style.textAlign = 'center';
            noControlsMsg.style.color = 'var(--text-secondary)';
            
            controlsContainer.innerHTML = '';
            controlsContainer.appendChild(noControlsMsg);
        }
    }
    
    // Apply background
    if (window.BackgroundManager && window.BackgroundManager.setBackground) {
        window.BackgroundManager.setBackground(selectedBg);
    }
});
```

**Verification:**
1. Select background with controls (particles)
2. Verify controls appear
3. Select background without controls (if any)
4. Verify info message appears
5. Add new background to HTML without controls
6. Verify graceful degradation

---

### GROUP F: Accessibility

#### Issue #15: ARIA Label Incomplete Implementation

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 607-661  

**Problem:**
```javascript
if (slider && valueDisplay) {  // ❌ Only updates if BOTH exist
    slider.setAttribute('aria-valuenow', slider.value);
}
```

**Fix - Update ARIA even without value display:**
```javascript
function initializeSliderAriaUpdates() {
    const sliderIds = [
        'particle-count', 'particle-size', 'particle-speed',
        'particle-opacity', 'particle-line-opacity',
        'h-slider', 's-slider', 'l-slider',
        'v2-particle-count', 'v2-particle-size', 'v2-particle-speed'
    ];
    
    sliderIds.forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (!slider) return;  // Slider doesn't exist, skip
        
        const valueDisplay = document.getElementById(`${sliderId}-value`);
        
        // Update ARIA on input
        slider.addEventListener('input', (e) => {
            const value = e.target.value;
            
            // Always update ARIA attributes
            slider.setAttribute('aria-valuenow', value);
            
            // Format value text for screen readers
            let valueText = value;
            
            // Special formatting for specific sliders
            if (sliderId.includes('opacity')) {
                valueText = `${(parseFloat(value) * 100).toFixed(0)}%`;
            } else if (sliderId === 'h-slider') {
                valueText = `${value} degrees`;
            } else if (sliderId === 's-slider' || sliderId === 'l-slider') {
                valueText = `${value}%`;
            }
            
            slider.setAttribute('aria-valuetext', valueText);
            
            // Update value display if it exists
            if (valueDisplay) {
                valueDisplay.textContent = valueText;
            }
        });
        
        // Set initial ARIA values
        slider.setAttribute('aria-valuenow', slider.value);
        slider.setAttribute('aria-valuemin', slider.min || '0');
        slider.setAttribute('aria-valuemax', slider.max || '100');
        
        // Ensure slider has label
        if (!slider.getAttribute('aria-label') && !slider.getAttribute('aria-labelledby')) {
            const label = document.querySelector(`label[for="${sliderId}"]`);
            if (label) {
                slider.setAttribute('aria-labelledby', label.id || `${sliderId}-label`);
                if (!label.id) label.id = `${sliderId}-label`;
            } else {
                // Fallback: generate label from ID
                const labelText = sliderId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
                slider.setAttribute('aria-label', labelText);
            }
        }
    });
}
```

**Verification:**
1. Enable screen reader (VoiceOver on Mac, NVDA on Windows)
2. Tab to each slider
3. Verify slider announces name and current value
4. Adjust slider
5. Verify new value is announced
6. Test in V1 and V2 modes
7. Run axe DevTools accessibility scan

---

### GROUP G: Performance

#### Issue #30: Time Display Flicker During Rapid Updates

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`  
**Lines:** 319-322  

**Problem:**
```javascript
function updateTimeDisplay() {
    document.getElementById('time-display').textContent = ...;
    document.getElementById('progress-bar').value = window.currentTime;
}
// ⚠️ Called 60 times per second, causes flicker and performance issues
```

**Fix - Throttle to 1 update per second:**
```javascript
// Add at top of file
let lastTimeUpdate = 0;
let lastDisplayedTime = -1;

function updateTimeDisplay() {
    const now = Date.now();
    const currentTimeSeconds = Math.floor(window.currentTime);
    
    // Throttle: only update display once per second
    if (now - lastTimeUpdate < 1000 && currentTimeSeconds === lastDisplayedTime) {
        // Still update progress bar (smooth animation)
        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            progressBar.value = window.currentTime;
        }
        return;
    }
    
    lastTimeUpdate = now;
    lastDisplayedTime = currentTimeSeconds;
    
    // Update time display (only once per second)
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(window.currentTime)} / ${formatTime(window.totalTime)}`;
    }
    
    // Update progress bar
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.value = window.currentTime;
        
        // Update ARIA for accessibility
        progressBar.setAttribute('aria-valuenow', Math.floor(window.currentTime));
        progressBar.setAttribute('aria-valuetext', formatTime(window.currentTime));
    }
}
```

**Verification:**
1. Open DevTools Performance tab
2. Start recording
3. Play lyrics for 30 seconds
4. Stop recording
5. Check for excessive DOM updates (should be ~30 text updates, not ~1800)
6. Verify smooth progress bar animation
7. Verify time display updates every second

---

#### Issue #11: YouTube Download Progress Simulation

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`  
**Lines:** 707-713  

**Problem:**
```javascript
// Simulate progress (since backend doesn't support SSE yet)
let progress = 0;
const progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 15, 90);
    // ⚠️ Fake progress - misleading to users
}, 500);
```

**Fix - Use indeterminate progress:**
```javascript
// Replace fake progress with indeterminate indicator
youtubeProgressBar.style.display = 'block';
youtubeProgressFill.style.width = '100%';
youtubeProgressFill.classList.add('indeterminate');  // Add animation class

// Update status text to be honest
youtubeStatus.textContent = 'Downloading audio... (this may take 30-60 seconds)';

// Remove fake progress interval (don't create it)

// On completion
youtubeProgressFill.classList.remove('indeterminate');
youtubeProgressFill.style.width = '100%';
progressPercent.textContent = '100%';
```

**Add CSS for indeterminate animation:**
```css
/* Add to lyric-animator-v2.css */
.progress-fill.indeterminate {
    animation: indeterminate-progress 1.5s ease-in-out infinite;
    background: linear-gradient(
        90deg,
        var(--primary) 0%,
        var(--glow) 50%,
        var(--primary) 100%
    );
    background-size: 200% 100%;
}

@keyframes indeterminate-progress {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

**Verification:**
1. Start YouTube download
2. Verify indeterminate animation shows
3. Verify honest status message
4. Wait for completion
5. Verify progress completes to 100%
6. No fake incremental progress

**Alternative (if backend adds SSE):**
```javascript
// TODO: When backend supports SSE, implement real progress
const eventSource = new EventSource(`/api/youtube/download/${videoId}/progress`);

eventSource.addEventListener('progress', (e) => {
    const data = JSON.parse(e.data);
    youtubeProgressFill.style.width = `${data.percent}%`;
    progressPercent.textContent = `${data.percent}%`;
});

eventSource.addEventListener('complete', (e) => {
    eventSource.close();
    // ... handle completion
});
```

---

### GROUP H: CSS & Styling

#### Issue #27: CSS Variable Fallback Missing

- [ ] **Fixed and verified**

**File:** `static/css/lyric-animator-v2.css`  
**Lines:** 11-24  

**Problem:**
```css
:root {
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    /* No fallback for older browsers */
}
```

**Fix - Add static fallbacks:**
```css
:root {
    /* Fallback values for browsers without clamp() support */
    --text-xs: 0.75rem;
    --text-sm: 0.875rem;
    --text-base: 1rem;
    --text-lg: 1.125rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 2rem;
    --text-4xl: 2.5rem;
    
    /* Modern responsive values (override fallbacks in supporting browsers) */
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
    --text-sm: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
    --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
    --text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
    --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
    --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);
    --text-3xl: clamp(2rem, 1.8rem + 1vw, 2.5rem);
    --text-4xl: clamp(2.5rem, 2.2rem + 1.5vw, 3.5rem);
    
    /* Color variables with fallbacks */
    --glow: #ff8e53;
    --glow-rgb: 255, 142, 83;
    --primary: #ff8e53;
    --primary-rgb: 255, 142, 83;
    
    /* Background colors */
    --bg: #0a0a0a;
    --bg: oklch(0.1 0 0);  /* Modern color space (falls back to above) */
    
    --bg-secondary: #1a1a1a;
    --bg-secondary: oklch(0.15 0 0);
}

/* Use fallbacks in critical places */
.karaoke-char {
    font-size: 2rem;  /* Fallback */
    font-size: var(--text-2xl, 2rem);  /* With var() fallback */
}
```

**Verification:**
1. Test in modern browser (Chrome latest)
2. Test in older browser (IE 11 via BrowserStack)
3. Test in Safari 12 (doesn't support clamp)
4. Verify text is readable in all browsers
5. Use DevTools to disable CSS feature support
6. Verify fallbacks work

---

### GROUP I: State Management

#### Issue #14: Background Manager Container Null Risk

- [ ] **Fixed and verified**

**File:** `static/js/backgrounds/bg-manager.js`  
**Lines:** 142-149  

**Problem:**
```javascript
if (!container) {
    container = document.getElementById('particles-js');
}
if (!container) {
    throw new Error('Container element #particles-js not found in DOM');
    // ❌ Uncaught error crashes background system
}
```

**Fix - Catch and degrade gracefully:**
```javascript
// Wrap initialization in try-catch
try {
    if (!container) {
        container = document.getElementById('particles-js');
        console.warn('BackgroundManager: container was null, re-querying DOM');
    }
    
    if (!container) {
        console.error('Container element #particles-js not found in DOM');
        console.warn('Background effects will be disabled');
        
        // Set flag to disable background features
        this.backgroundsDisabled = true;
        
        // Return without throwing (graceful degradation)
        return;
    }
    
    // Continue initialization
    this.container = container;
    this.initializeBackgrounds();
    
} catch (error) {
    console.error('BackgroundManager initialization failed:', error);
    this.backgroundsDisabled = true;
    
    // Notify user
    if (window.NotificationManager) {
        window.NotificationManager.showWarning('backgroundsDisabled', {
            reason: 'Container element not found'
        });
    }
}

// Add check to all background methods
setBackground(bgName) {
    if (this.backgroundsDisabled) {
        console.warn('Backgrounds are disabled');
        return;
    }
    // ... rest of logic
}
```

**Verification:**
1. Test on page with `#particles-js` container
2. Verify backgrounds work
3. Test on page without container
4. Verify graceful degradation (no crash)
5. Verify user notification appears
6. Verify app remains functional

---

#### Issue #26: State Manager Circular Dependency Risk

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-state.js`  
**Lines:** 32-40  

**Problem:**
```javascript
checkVisualizerReady: function() {
    if (this.canRenderVisualizer() && this.currentBackgroundStyle === 'bg3') {
        if (window.BackgroundBG3 && window.BackgroundBG3.startRendering) {
            window.BackgroundBG3.startRendering();  // ❌ Could recurse
        }
    }
}
```

**Fix - Add re-entry guard:**
```javascript
// Add guard flag at top of state manager
const StateManager = {
    isAudioLoaded: false,
    isLyricsLoaded: false,
    currentBackgroundStyle: null,
    _isCheckingVisualizer: false,  // ✅ Re-entry guard
    
    checkVisualizerReady: function() {
        // Prevent re-entry
        if (this._isCheckingVisualizer) {
            console.warn('checkVisualizerReady called recursively, ignoring');
            return;
        }
        
        this._isCheckingVisualizer = true;
        
        try {
            if (this.canRenderVisualizer() && this.currentBackgroundStyle === 'bg3') {
                console.log('Both files ready! Starting audio visualizer...');
                
                if (window.BackgroundBG3 && window.BackgroundBG3.startRendering) {
                    window.BackgroundBG3.startRendering();
                }
            }
        } catch (error) {
            console.error('Error checking visualizer:', error);
        } finally {
            // Reset guard after execution
            this._isCheckingVisualizer = false;
        }
    },
    
    setAudioLoaded: function(loaded) {
        this.isAudioLoaded = loaded;
        if (loaded) {
            this.checkVisualizerReady();
        }
    },
    
    setLyricsLoaded: function(loaded) {
        this.isLyricsLoaded = loaded;
        if (loaded) {
            this.checkVisualizerReady();
        }
    }
};
```

**Verification:**
1. Load lyrics and audio simultaneously
2. Monitor console for recursive warnings
3. Verify visualizer starts only once
4. Test rapid state changes
5. Verify no stack overflow
6. Check background renders correctly

---

## Phase 3: Minor Issues (Priority P2)

**Goal:** Polish code quality, improve maintainability, and fix minor UX issues.  
**Estimated Time:** 10-15 hours  
**Testing After Phase:** Full regression test

### Minor Issues Checklist

**Code Quality:**
- [ ] **Issue #31**: Console Logging in Production
- [ ] **Issue #32**: Magic Numbers Throughout Code
- [ ] **Issue #33**: Inconsistent Error Messages
- [ ] **Issue #34**: Unused Parameters in Animation Functions

**CSS & Styling:**
- [ ] **Issue #35**: CSS Animation Names Collision Risk
- [ ] **Issue #42**: Tab Panel Fade Animation in Reduced Motion

**Accessibility:**
- [ ] **Issue #36**: Missing Alt Text for Loading States
- [ ] **Issue #37**: Emoji Usage Without Fallback
- [ ] **Issue #39**: Keyboard Shortcuts Not Documented
- [ ] **Issue #40**: Version Selector Missing Keyboard Navigation
- [ ] **Issue #41**: Progress Bar Aria-Valuetext Not Updated

**UI/UX Polish:**
- [ ] **Issue #38**: No HTTPS Enforcement for CDN Resources
- [ ] **Issue #43**: Reset Button Doesn't Clear Local Storage
- [ ] **Issue #44**: Audio File Input Doesn't Reset on Clear
- [ ] **Issue #45**: Notification Manager Not Null-Checked Consistently
- [ ] **Issue #46**: Bottom Bar Layout Z-Index Conflicts
- [ ] **Issue #47**: Layout Mode Doesn't Persist
- [ ] **Issue #48**: Color Picker Default Values Hardcoded

---

### Batch 1: Code Quality (Issues #31-34)

Can be done in single commit: "Improve code quality and remove debug noise"

#### Issue #31: Console Logging in Production

- [ ] **Fixed and verified**

**Files:** All JavaScript files

**Fix - Add DEBUG flag:**
```javascript
// Add at top of each JS file
const DEBUG = false;  // Set to true for development

// Replace all console.log with conditional logging
// Before:
console.log('lyrics-animator-v2.js loaded successfully!');

// After:
if (DEBUG) console.log('lyrics-animator-v2.js loaded successfully!');

// Keep console.error and console.warn (important for debugging)
```

**Better approach - Create logger utility:**
```javascript
// Create: static/js/utils/logger.js
window.Logger = {
    debug: (...args) => {
        if (window.DEBUG || localStorage.getItem('debug') === 'true') {
            console.log('[DEBUG]', ...args);
        }
    },
    info: (...args) => {
        if (window.DEBUG || localStorage.getItem('debug') === 'true') {
            console.info('[INFO]', ...args);
        }
    },
    warn: (...args) => {
        console.warn('[WARN]', ...args);  // Always show warnings
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);  // Always show errors
    }
};

// Usage:
Logger.debug('Parsed X valid lyric lines');
Logger.error('No valid timestamps found');
```

**Verification:**
1. Set `DEBUG = false`
2. Reload page
3. Check console - should be clean
4. Set `localStorage.setItem('debug', 'true')`
5. Reload page
6. Verify debug logs appear

---

#### Issue #32: Magic Numbers Throughout Code

- [ ] **Fixed and verified**

**Files:** Multiple

**Fix - Define constants:**
```javascript
// Add at top of lyrics-animator-v2.js
const CONFIG = {
    LYRIC_END_BUFFER_SECONDS: 5,      // Line 72: + 5
    ANIMATION_DELAY_MS: 50,            // Line in animations: * 50
    TIME_UPDATE_THROTTLE_MS: 1000,    // Time display update frequency
    MAX_DRAG_COUNTER: 100,             // Safety limit for drag counter
    TOOLTIP_WIDTH_PX: 60,              // Approximate tooltip width
};

// Usage:
// Before:
window.totalTime = lyricData[lyricData.length - 1].time + 5;

// After:
window.totalTime = lyricData[lyricData.length - 1].time + CONFIG.LYRIC_END_BUFFER_SECONDS;

// Before:
const timeout = setTimeout(() => { ... }, index * 50);

// After:
const timeout = setTimeout(() => { ... }, index * CONFIG.ANIMATION_DELAY_MS);
```

**Verification:**
1. Search for all magic numbers: `rg "\d+ \*|/ \d+|\+ \d+|- \d+" static/js/`
2. Replace with named constants
3. Test functionality unchanged
4. Verify code is more readable

---

#### Issue #33: Inconsistent Error Messages

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`

**Fix - Standardize on NotificationManager:**
```javascript
// Create error handler utility
function handleError(errorType, details = {}) {
    // Log to console
    console.error(`[${errorType}]`, details);
    
    // Show user-friendly notification
    if (window.NotificationManager) {
        window.NotificationManager.showError(errorType, details);
    } else {
        // Fallback to status text if NotificationManager not available
        const status = document.getElementById('status');
        if (status) {
            status.textContent = `Error: ${errorType}`;
            status.style.color = 'var(--error, #ff4444)';
        }
    }
}

// Usage:
// Before:
if (lyricData.length === 0) {
    console.error('No valid timestamps found in file');
    if (window.NotificationManager) {
        window.NotificationManager.showError('noTimestamps');
    }
    document.getElementById('status').textContent = 'Upload a valid LRC file to continue';
}

// After:
if (lyricData.length === 0) {
    handleError('noTimestamps', {
        file: file.name,
        reason: 'No valid timestamps found'
    });
    return;
}
```

**Verification:**
1. Trigger each error condition
2. Verify consistent error handling
3. Verify both console and UI messages appear
4. Test with NotificationManager disabled

---

#### Issue #34: Unused Parameters in Animation Functions

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2-animations.js`

**Fix - Clarify parameter naming:**
```javascript
// Before:
typewriter: function(chars, isPlaying) {

// After (clearer naming):
typewriter: function(chars, shouldAnimate) {
    /**
     * Animate characters with typewriter effect
     * @param {NodeList} chars - Character elements to animate
     * @param {boolean} shouldAnimate - If true, animate; if false, show immediately
     */
    
// Update all 6 animation functions
// Update all callers to use new parameter name
```

**Add JSDoc comments to all functions:**
```javascript
/**
 * Slide-in animation for lyric characters
 * @param {NodeList} chars - Character elements to animate
 * @param {boolean} shouldAnimate - Whether to animate or show immediately
 */
slideIn: function(chars, shouldAnimate) {
    // Implementation
}
```

**Verification:**
1. Update all animation functions
2. Update all call sites
3. Verify animations still work
4. Check JSDoc renders in IDE

---

### Batch 2: CSS Fixes (Issues #35, #42)

#### Issue #35: CSS Animation Names Collision Risk

- [ ] **Fixed and verified**

**File:** `static/css/lyric-animator-v2.css`

**Fix - Add prefixes:**
```css
/* Before */
@keyframes pulse { ... }
@keyframes slideDown { ... }
@keyframes fadeIn { ... }

/* After */
@keyframes lyricsV2-pulse { ... }
@keyframes lyricsV2-slideDown { ... }
@keyframes lyricsV2-fadeIn { ... }
@keyframes lyricsV2-slideUp { ... }
@keyframes lyricsV2-zoomIn { ... }
@keyframes lyricsV2-bounce { ... }

/* Update usage */
.karaoke-char.animated {
    animation: lyricsV2-pulse 0.5s ease;
}
```

**Verification:**
1. Search and replace all animation names
2. Update all CSS rules that reference animations
3. Test all animations still work
4. Check for console errors

---

#### Issue #42: Tab Panel Fade Animation in Reduced Motion

- [ ] **Fixed and verified**

**File:** `static/css/lyric-animator-v2.css`

**Fix - Proper reduced motion handling:**
```css
/* Before */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* After */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
    }
    
    .tab-panel,
    .karaoke-char,
    .notification {
        animation: none !important;
        transition: none !important;
    }
}
```

**Verification:**
1. Enable reduced motion in OS settings
2. Reload page
3. Switch tabs - verify instant (no animation)
4. Play lyrics - verify instant (no animation)
5. Disable reduced motion
6. Verify animations return

---

### Batch 3: Accessibility (Issues #36-41)

#### Issue #36: Missing Alt Text for Loading States

- [ ] **Fixed and verified**

**File:** `templates/lyricAnimator.html`

**Fix - Add ARIA live region:**
```html
<!-- Before -->
<div class="lyrics-skeleton" id="lyrics-skeleton" style="display: none;">
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
    <div class="skeleton-line"></div>
</div>

<!-- After -->
<div class="lyrics-skeleton" 
     id="lyrics-skeleton" 
     style="display: none;"
     role="status"
     aria-live="polite"
     aria-label="Loading lyrics content">
    <div class="skeleton-line" aria-hidden="true"></div>
    <div class="skeleton-line" aria-hidden="true"></div>
    <div class="skeleton-line" aria-hidden="true"></div>
    <span class="sr-only">Loading lyrics, please wait...</span>
</div>
```

**Add screen-reader-only CSS:**
```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
}
```

**Verification:**
1. Enable screen reader
2. Upload file
3. Verify "Loading lyrics" is announced
4. Wait for load to complete
5. Verify completion is announced

---

#### Issue #37: Emoji Usage Without Fallback

- [ ] **Fixed and verified**

**Files:** `templates/lyricAnimator.html`, CSS files

**Fix - Replace with SVG or text:**
```html
<!-- Before -->
<span>🎵 Animation</span>

<!-- After (text fallback) -->
<span><span class="emoji" aria-hidden="true">🎵</span><span class="emoji-fallback">♪</span> Animation</span>
```

**CSS:**
```css
.emoji-fallback {
    display: none;
}

/* Show fallback on systems without emoji support */
@supports not (font-variation-settings: normal) {
    .emoji { display: none; }
    .emoji-fallback { display: inline; }
}
```

**Better: Use SVG icons or icon font**
```html
<svg class="icon" width="16" height="16">
    <use href="#icon-music"></use>
</svg>
```

**Verification:**
1. Test on Windows 7 (limited emoji support)
2. Test on Linux without emoji fonts
3. Verify fallback appears
4. Test on modern system
5. Verify emoji appears

---

#### Issue #39: Keyboard Shortcuts Not Documented

- [ ] **Fixed and verified**

**File:** `templates/lyricAnimator.html`

**Fix - Add help overlay:**
```html
<!-- Add help button -->
<button id="keyboard-help-btn" 
        class="btn btn-icon" 
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts (?)">
    <span aria-hidden="true">?</span>
</button>

<!-- Help overlay (hidden by default) -->
<div id="keyboard-help-overlay" 
     class="overlay" 
     role="dialog" 
     aria-labelledby="help-title"
     aria-modal="true"
     hidden>
    <div class="overlay-content">
        <h2 id="help-title">Keyboard Shortcuts</h2>
        
        <dl class="shortcuts-list">
            <dt><kbd>Space</kbd></dt>
            <dd>Play / Pause</dd>
            
            <dt><kbd>←</kbd> <kbd>→</kbd></dt>
            <dd>Skip backward / forward</dd>
            
            <dt><kbd>R</kbd></dt>
            <dd>Reset playback</dd>
            
            <dt><kbd>?</kbd></dt>
            <dd>Show this help</dd>
            
            <dt><kbd>Esc</kbd></dt>
            <dd>Close dialogs</dd>
        </dl>
        
        <button id="close-help" class="btn btn-primary">
            Close
        </button>
    </div>
</div>
```

**Add JavaScript:**
```javascript
// Show help on ? key
document.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        showKeyboardHelp();
    }
});

function showKeyboardHelp() {
    const overlay = document.getElementById('keyboard-help-overlay');
    overlay.hidden = false;
    overlay.querySelector('button').focus();
}
```

**Verification:**
1. Press `?` key
2. Verify help overlay appears
3. Verify shortcuts are listed
4. Press `Esc`
5. Verify overlay closes

---

#### Issue #40: Version Selector Missing Keyboard Navigation

- [ ] **Fixed and verified**

**File:** `templates/lyricAnimator.html`

**Fix - Ensure proper tab order:**
```html
<!-- Before -->
<div class="version-selector">
    <select id="version-selector">...</select>
</div>

<!-- After (add tabindex and ARIA) -->
<div class="version-selector" role="navigation" aria-label="Version selection">
    <label for="version-selector" id="version-selector-label">
        Version:
    </label>
    <select id="version-selector"
            aria-labelledby="version-selector-label"
            tabindex="0">
        <option value="v1">V1 - Classic</option>
        <option value="v2" selected>V2 - Enhanced</option>
    </select>
</div>
```

**Verification:**
1. Tab through page
2. Verify version selector is reachable
3. Verify label is announced
4. Use arrow keys to change version
5. Press Enter to confirm

---

#### Issue #41: Progress Bar Aria-Valuetext Not Updated

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2.js`

**Fix - Update ARIA in updateTimeDisplay:**
```javascript
function updateTimeDisplay() {
    // ... existing code ...
    
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        progressBar.value = window.currentTime;
        
        // Update ARIA attributes
        progressBar.setAttribute('aria-valuenow', Math.floor(window.currentTime));
        progressBar.setAttribute('aria-valuetext', 
            `${formatTime(window.currentTime)} of ${formatTime(window.totalTime)}`
        );
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', Math.floor(window.totalTime));
    }
}
```

**Verification:**
1. Enable screen reader
2. Tab to progress bar
3. Verify time is announced (e.g., "2 minutes 30 seconds of 3 minutes")
4. Play lyrics
5. Verify time updates are announced

---

### Batch 4: UI Polish (Issues #43-48)

#### Issue #43: Reset Button Doesn't Clear Local Storage

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`

**Fix - Add settings reset:**
```javascript
resetBtn.addEventListener('click', () => {
    const confirmReset = confirm(
        'Reset all settings?\n\n' +
        'This will:\n' +
        '• Clear current lyrics and audio\n' +
        '• Reset all customization settings\n' +
        '• Reload the page\n\n' +
        'Continue?'
    );
    
    if (confirmReset) {
        // Clear V2 settings from localStorage
        const v2SettingKeys = [
            'lyricsV2-themeColor',
            'lyricsV2-particleCount',
            'lyricsV2-particleSize',
            'lyricsV2-particleSpeed',
            'lyricsV2-animation',
            'lyricsV2-layout',
            'lyricsV2-background'
        ];
        
        v2SettingKeys.forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Reload page
        location.reload();
    }
});
```

**Verification:**
1. Change theme color, particles, layout
2. Verify settings persist after reload
3. Click Reset
4. Confirm reset
5. Verify all settings back to defaults

---

#### Issue #44: Audio File Input Doesn't Reset on Clear

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`

**Fix - Add clear audio button:**
```javascript
// Add clear button after audio input
const clearAudioBtn = document.createElement('button');
clearAudioBtn.textContent = '× Clear Audio';
clearAudioBtn.className = 'btn btn-secondary btn-sm';
clearAudioBtn.style.display = 'none';
clearAudioBtn.id = 'clear-audio-btn';

audioFileInput.parentElement.appendChild(clearAudioBtn);

// Show clear button when audio is loaded
audioFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // ... existing validation ...
        
        // Show clear button
        clearAudioBtn.style.display = 'inline-block';
    }
});

// Clear audio handler
clearAudioBtn.addEventListener('click', () => {
    if (window.audioElement) {
        window.audioElement.pause();
        window.audioElement.src = '';
    }
    
    audioFileInput.value = '';
    clearAudioBtn.style.display = 'none';
    
    if (window.NotificationManager) {
        window.NotificationManager.showInfo('audioCleared');
    }
});
```

**Verification:**
1. Upload audio file
2. Verify "Clear Audio" button appears
3. Click button
4. Verify audio stops and input clears
5. Verify button hides

---

#### Issue #45: Notification Manager Not Null-Checked Consistently

- [ ] **Fixed and verified**

**Files:** All JavaScript files

**Fix - Add helper function:**
```javascript
// Add to top of each file or create utils/notifications.js
function showNotification(type, messageId, details = {}) {
    if (window.NotificationManager) {
        try {
            window.NotificationManager[`show${type}`](messageId, details);
        } catch (error) {
            console.error('Notification error:', error);
        }
    }
}

// Usage:
// Before:
if (window.NotificationManager) {
    window.NotificationManager.showError('noTimestamps');
}

// After:
showNotification('Error', 'noTimestamps');
```

**Verification:**
1. Search for all `window.NotificationManager` calls
2. Replace with helper function
3. Test with NotificationManager loaded
4. Temporarily disable NotificationManager
5. Verify no errors (graceful fallback)

---

#### Issue #46: Bottom Bar Layout Z-Index Conflicts

- [ ] **Fixed and verified**

**File:** `static/js/lyrics-animator-v2-layouts.js`

**Fix - Add z-index:**
```javascript
// In bottom bar layout function
line.style.position = 'fixed';
line.style.bottom = '80px';
line.style.left = '50%';
line.style.transform = 'translateX(-50%)';
line.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
line.style.padding = '1rem 2rem';
line.style.borderRadius = '0.5rem';
line.style.maxWidth = '90%';
line.style.textAlign = 'center';
line.style.zIndex = '100';  // ✅ Add z-index
```

**Verification:**
1. Select bottom bar layout
2. Verify lyrics appear above controls
3. Test with different backgrounds
4. Verify no z-index conflicts

---

#### Issue #47: Layout Mode Doesn't Persist

- [ ] **Fixed and verified**

**File:** `static/js/lyric-animator-ui-v2.js`

**Fix - Save to localStorage:**
```javascript
layoutMode.addEventListener('change', (e) => {
    const newLayout = e.target.value;
    window.currentLayout = newLayout;
    
    // Save to localStorage
    localStorage.setItem('lyricsV2-layout', newLayout);
    
    // ... rest of existing code ...
});

// On page load, restore saved layout
document.addEventListener('DOMContentLoaded', () => {
    const savedLayout = localStorage.getItem('lyricsV2-layout');
    if (savedLayout) {
        const layoutSelect = document.getElementById('v2-layout-mode');
        if (layoutSelect) {
            layoutSelect.value = savedLayout;
            window.currentLayout = savedLayout;
        }
    }
});
```

**Verification:**
1. Select multiline layout
2. Reload page
3. Verify multiline is still selected
4. Clear localStorage
5. Verify defaults to classic

---

#### Issue #48: Color Picker Default Values Hardcoded

- [ ] **Fixed and verified**

**File:** `templates/lyricAnimator.html`

**Fix - Read from CSS variable:**
```javascript
// On page load, set color picker from CSS variable
document.addEventListener('DOMContentLoaded', () => {
    const themeColorPicker = document.getElementById('v2-theme-color-picker');
    if (themeColorPicker) {
        // Get default from CSS variable
        const defaultColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--primary')
            .trim();
        
        // Check localStorage for saved color
        const savedColor = localStorage.getItem('lyricsV2-themeColor');
        
        // Use saved color or default
        themeColorPicker.value = savedColor || defaultColor || '#ff8e53';
        
        // Apply color
        if (savedColor) {
            applyThemeColor(savedColor);
        }
    }
});
```

**Verification:**
1. Check default color matches CSS
2. Change color
3. Verify it saves
4. Reload page
5. Verify saved color loads
6. Clear localStorage
7. Verify defaults to CSS variable value

---

## Testing Protocol

### Unit Testing Checklist

- [ ] **File Upload Tests**
  - [ ] Valid LRC file uploads correctly
  - [ ] Invalid file shows error
  - [ ] Empty file handled gracefully
  - [ ] Large file (>1MB) uploads
  - [ ] File with special characters in name

- [ ] **Audio Tests**
  - [ ] MP3 file loads and plays
  - [ ] Invalid audio type rejected
  - [ ] Audio too large rejected
  - [ ] Audio sync with lyrics works
  - [ ] YouTube download works

- [ ] **Animation Tests**
  - [ ] All 6 animations work
  - [ ] Switching animations mid-play works
  - [ ] No visual artifacts when switching
  - [ ] Pause/resume maintains state
  - [ ] Reset clears animations

- [ ] **Layout Tests**
  - [ ] Classic layout renders correctly
  - [ ] Multiline layout scrolls properly
  - [ ] Bottom bar layout positions correctly
  - [ ] Switching layouts resets styles
  - [ ] All layouts work on mobile

- [ ] **Background Tests**
  - [ ] Particles background loads
  - [ ] Particle customization works
  - [ ] Switching backgrounds works
  - [ ] Background without controls shows message
  - [ ] Backgrounds work on slow connections

### Integration Testing Steps

**Test Scenario 1: Complete User Flow**
1. [ ] Load page
2. [ ] Upload LRC file
3. [ ] Upload audio file
4. [ ] Play lyrics
5. [ ] Change animation mid-play
6. [ ] Change layout
7. [ ] Customize particles
8. [ ] Pause and resume
9. [ ] Reset
10. [ ] Reload page (verify settings persist)

**Test Scenario 2: Error Recovery**
1. [ ] Upload invalid LRC file
2. [ ] Verify error message
3. [ ] Upload valid file
4. [ ] Verify recovery
5. [ ] Upload invalid audio
6. [ ] Verify error
7. [ ] Upload valid audio
8. [ ] Verify works

**Test Scenario 3: Performance**
1. [ ] Upload large LRC file (500+ lines)
2. [ ] Verify no lag
3. [ ] Play and verify smooth animation
4. [ ] Monitor DevTools Performance
5. [ ] Check for memory leaks
6. [ ] Verify CPU usage reasonable

### Manual Testing Procedures

**Browser Compatibility Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

**Accessibility Test:**
- [ ] Tab navigation works
- [ ] All controls reachable
- [ ] Screen reader announces labels
- [ ] ARIA values update
- [ ] Keyboard shortcuts work
- [ ] Focus indicators visible
- [ ] Color contrast sufficient (WCAG AA)

**Responsive Design Test:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape
- [ ] Ultra-wide (2560x1080)

### Browser Compatibility Testing

**Chrome DevTools Testing:**
```bash
# Throttle network to Slow 3G
# Throttle CPU to 4x slowdown
# Test with DevTools Device Emulation
```

**Firefox Testing:**
- [ ] Enable strict tracking protection
- [ ] Test with Enhanced Tracking Protection
- [ ] Verify WebP/AVIF support

**Safari Testing:**
- [ ] Test on macOS
- [ ] Test on iOS (real device)
- [ ] Verify webkit-specific issues

**Edge Testing:**
- [ ] Test on Windows
- [ ] Verify Chromium compatibility
- [ ] Test with IE mode (if applicable)

---

## Rollback Plan

### Git Branching Strategy

**Branch Structure:**
```
main (production)
  ├── fix/lyric-animator-v2-bugs (feature branch)
      ├── fix/phase-1-critical
      ├── fix/phase-2-major
      └── fix/phase-3-minor
```

**Before Starting:**
```bash
# Create feature branch
git checkout -b fix/lyric-animator-v2-bugs

# Create phase branches
git checkout -b fix/phase-1-critical
```

**Commit Strategy:**
```bash
# Phase 1: One commit per critical issue
git commit -m "Fix #1: Variable redeclaration in lyrics-animator-v2.js"
git commit -m "Fix #4: Script loading race condition"

# Phase 2: Group related fixes
git commit -m "Fix memory leaks (Issues #8, #20)"
git commit -m "Fix animation system (Issues #10, #13, #22)"

# Phase 3: Batch minor fixes
git commit -m "Improve code quality (Issues #31-34)"
```

### How to Revert If Things Break

**Revert Last Commit:**
```bash
git revert HEAD
git push
```

**Revert Specific Commit:**
```bash
git log --oneline  # Find commit hash
git revert <commit-hash>
git push
```

**Revert Entire Phase:**
```bash
# Find first commit of phase
git log --oneline

# Revert range
git revert <first-commit>..<last-commit>
git push
```

**Nuclear Option (Reset to Main):**
```bash
# Create backup branch first!
git branch backup-before-reset

# Reset to main
git reset --hard origin/main
git push --force

# WARNING: This destroys all work on branch
```

### Backup/Restore Procedures

**Before Starting Implementation:**
```bash
# Backup current working state
mkdir -p backups/lyric-animator-v2-pre-fix
cp -r static/js/lyric* backups/lyric-animator-v2-pre-fix/
cp -r static/css/lyric* backups/lyric-animator-v2-pre-fix/
cp templates/lyricAnimator.html backups/lyric-animator-v2-pre-fix/

# Create git tag
git tag -a v2-before-bugfix -m "Lyric Animator V2 before bugfix implementation"
git push origin v2-before-bugfix
```

**Restore from Backup:**
```bash
# From file backup
cp -r backups/lyric-animator-v2-pre-fix/* <original-location>

# From git tag
git checkout v2-before-bugfix
```

**Create Restore Point After Each Phase:**
```bash
# After Phase 1
git tag -a v2-after-phase1 -m "Critical fixes complete"
git push origin v2-after-phase1

# After Phase 2
git tag -a v2-after-phase2 -m "Major fixes complete"
git push origin v2-after-phase2

# After Phase 3
git tag -a v2-after-phase3 -m "All fixes complete"
git push origin v2-after-phase3
```

---

## Master Checklist

### Pre-Implementation Setup

- [ ] Create feature branch: `git checkout -b fix/lyric-animator-v2-bugs`
- [ ] Create backup: `mkdir backups/lyric-animator-v2-pre-fix && cp -r static/js/lyric* static/css/lyric* templates/lyricAnimator.html backups/lyric-animator-v2-pre-fix/`
- [ ] Create git tag: `git tag -a v2-before-bugfix -m "Before bugfix implementation"`
- [ ] Set up local testing environment
- [ ] Verify file permissions allow editing
- [ ] Create testing checklist document
- [ ] Notify team of planned changes

### Phase 1: Critical Issues (P0)

- [ ] **All 7 critical issues fixed**
  - [ ] Issue #1: Variable Redeclaration
  - [ ] Issue #2: Missing Function Check
  - [ ] Issue #3: Null Container Reference
  - [ ] Issue #4: Script Loading Race Condition
  - [ ] Issue #5: Missing Null Check (Tooltip)
  - [ ] Issue #6: Array Index Out of Bounds
  - [ ] Issue #7: Infinite Loop Risk

- [ ] **Phase 1 Testing Complete**
  - [ ] All critical bugs verified fixed
  - [ ] No regressions introduced
  - [ ] Manual smoke test passed
  - [ ] Browser compatibility verified

- [ ] **Phase 1 Committed**
  - [ ] Code committed: `git commit -m "Phase 1: Fix all critical issues"`
  - [ ] Tag created: `git tag -a v2-after-phase1`
  - [ ] Pushed to remote: `git push origin fix/lyric-animator-v2-bugs --tags`

### Phase 2: Major Issues (P1)

- [ ] **All 23 major issues fixed**
  - [ ] Group A: Memory Management (Issues #8, #20)
  - [ ] Group B: Animation System (Issues #10, #13, #22)
  - [ ] Group C: Particles System (Issues #12, #21, #28)
  - [ ] Group D: Validation (Issues #9, #17, #29)
  - [ ] Group E: Layout & UI (Issues #16, #18, #19, #23, #24, #25)
  - [ ] Group F: Accessibility (Issue #15)
  - [ ] Group G: Performance (Issues #11, #30)
  - [ ] Group H: CSS & Styling (Issue #27)
  - [ ] Group I: State Management (Issues #14, #26)

- [ ] **Phase 2 Testing Complete**
  - [ ] All major issues verified fixed
  - [ ] Performance improvements verified
  - [ ] Accessibility audit passed
  - [ ] Cross-browser testing complete

- [ ] **Phase 2 Committed**
  - [ ] Code committed (multiple commits by group)
  - [ ] Tag created: `git tag -a v2-after-phase2`
  - [ ] Pushed to remote

### Phase 3: Minor Issues (P2)

- [ ] **All 18 minor issues fixed**
  - [ ] Batch 1: Code Quality (Issues #31-34)
  - [ ] Batch 2: CSS Fixes (Issues #35, #42)
  - [ ] Batch 3: Accessibility (Issues #36-41)
  - [ ] Batch 4: UI Polish (Issues #43-48)

- [ ] **Phase 3 Testing Complete**
  - [ ] All minor issues verified fixed
  - [ ] Code quality improved
  - [ ] Full regression test passed

- [ ] **Phase 3 Committed**
  - [ ] Code committed (batched by category)
  - [ ] Tag created: `git tag -a v2-after-phase3`
  - [ ] Pushed to remote

### Final Testing & Verification

- [ ] **Full Test Suite**
  - [ ] Unit tests passed (all 5 categories)
  - [ ] Integration tests passed (all 3 scenarios)
  - [ ] Manual testing complete
  - [ ] Browser compatibility verified (6 browsers)
  - [ ] Accessibility audit complete (WCAG AA)
  - [ ] Responsive design verified (6 breakpoints)

- [ ] **Performance Verification**
  - [ ] No memory leaks (DevTools Memory Profiler)
  - [ ] Smooth animations (60 FPS)
  - [ ] Fast load time (<3s on 3G)
  - [ ] Low CPU usage (<30% on playback)

- [ ] **Documentation Updated**
  - [ ] CHANGELOG.md updated
  - [ ] README.md updated (if needed)
  - [ ] API documentation updated (if needed)
  - [ ] Code comments added where needed

### Deployment Preparation

- [ ] **Pre-Deployment Checklist**
  - [ ] All issues verified fixed (48/48)
  - [ ] All tests passing
  - [ ] No console errors
  - [ ] No regressions
  - [ ] Performance acceptable
  - [ ] Accessibility compliant

- [ ] **Merge to Main**
  - [ ] Create pull request
  - [ ] Code review requested
  - [ ] PR approved
  - [ ] Merge to main: `git merge fix/lyric-animator-v2-bugs`
  - [ ] Tag production release: `git tag -a v2.0.1 -m "Lyric Animator V2 - All bugs fixed"`

- [ ] **Deployment**
  - [ ] Deploy to staging
  - [ ] Staging verification complete
  - [ ] Deploy to production
  - [ ] Production verification complete
  - [ ] Monitor for errors (24 hours)

### Post-Deployment

- [ ] **Monitoring**
  - [ ] Check error logs (no new errors)
  - [ ] Monitor user feedback
  - [ ] Verify analytics (no drop in usage)
  - [ ] Performance monitoring (no degradation)

- [ ] **Cleanup**
  - [ ] Delete feature branches (if desired)
  - [ ] Archive backup files
  - [ ] Update project status
  - [ ] Celebrate! 🎉

---

## Implementation Tips

### Best Practices

1. **Test After Each Fix**: Don't batch fixes without testing
2. **Commit Frequently**: Small commits are easier to revert
3. **Use Descriptive Commit Messages**: Reference issue numbers
4. **Run Full Test Suite After Each Phase**: Catch regressions early
5. **Take Breaks**: Don't rush, bugs happen when tired
6. **Use DevTools Profiler**: Verify performance improvements
7. **Test on Real Devices**: Emulators don't catch everything
8. **Keep Browser Console Open**: Watch for new errors

### Common Pitfalls to Avoid

- ❌ Fixing multiple issues in one commit (hard to revert)
- ❌ Not testing edge cases (empty arrays, null values)
- ❌ Assuming browser compatibility (test everything)
- ❌ Forgetting to update ARIA attributes
- ❌ Not checking for memory leaks
- ❌ Skipping accessibility testing
- ❌ Not documenting why a fix was made

### Debugging Commands

```bash
# Find all console.log statements
rg "console\.log" static/js/

# Find all TODOs
rg "TODO|FIXME|HACK" static/js/

# Find potential null reference errors
rg "\.style\.|\.classList\." static/js/ -A 2 -B 2

# Count lines of code
find static/js -name "*.js" -exec wc -l {} + | sort -n

# Check for large files
find static -type f -size +100k
```

---

## Success Criteria

**Implementation is complete when:**

✅ All 48 issues have checkboxes marked  
✅ All tests pass (unit, integration, manual)  
✅ All browsers supported (Chrome, Firefox, Safari, Edge)  
✅ Accessibility audit passes (WCAG AA)  
✅ Performance metrics meet targets (60 FPS, <30% CPU)  
✅ No console errors or warnings  
✅ Code review approved  
✅ Documentation updated  
✅ Production deployment successful  
✅ 24-hour monitoring shows no new errors  

**Quality Metrics:**
- Code coverage: >80% of critical functions tested
- Accessibility: WCAG AA compliant
- Performance: Lighthouse score >90
- Browser support: Last 2 versions of major browsers
- Mobile support: iOS Safari, Android Chrome
- Load time: <3 seconds on 3G
- Memory usage: No leaks, stable over 1 hour session

---

## Estimated Timeline

**Aggressive Schedule (1 developer, full-time):**
- Phase 1: 2 days (12 hours)
- Phase 2: 4 days (30 hours)
- Phase 3: 2 days (15 hours)
- Testing: 2 days (10 hours)
- **Total: 10 business days**

**Realistic Schedule (1 developer, part-time):**
- Phase 1: 1 week
- Phase 2: 2 weeks
- Phase 3: 1 week
- Testing: 1 week
- **Total: 5 weeks**

**Conservative Schedule (team of 2):**
- Phase 1: 3 days (parallel work on independent issues)
- Phase 2: 1 week (split by groups)
- Phase 3: 3 days (split batches)
- Testing: 3 days
- **Total: 2.5 weeks**

---

## Contact & Support

**Questions During Implementation:**
- Check research document: `research_lyricAnimatorV2.md`
- Review original code for context
- Use browser DevTools for debugging
- Test incrementally, don't batch too many changes

**Need Help?**
- Create issue in project tracker
- Reference this plan and specific issue number
- Include browser console logs
- Provide steps to reproduce

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-11  
**Next Review:** After Phase 1 completion  

**Status:** ✅ READY FOR IMPLEMENTATION

---

*This implementation plan was generated from forensic analysis of the Lyric Animator V2 codebase. All issue numbers, file paths, and line numbers are accurate as of 2025-11-11. Verify line numbers haven't shifted before applying fixes.*
