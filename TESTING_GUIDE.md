# Quick Testing Guide - December 13, 2025

All fixes have been committed. Here's what to test before deploying:

---

## 🚀 Quick Start

```bash
# Start the Flask server
python app.py

# Open browser to http://localhost:5000
```

---

## ✅ Priority 1: Must Test (5-10 minutes)

### **1. Lyric Animator - CSS Version Switching**
**URL:** `http://localhost:5000/project/lyricAnimator`

- [ ] Page loads (should default to V2)
- [ ] Open DevTools → Network tab
- [ ] Refresh page
- [ ] **Verify:** Only `lyric-animator-v2.css` loads (NOT both V1 and V2)
- [ ] Try URL: `http://localhost:5000/project/lyricAnimator?version=v1`
- [ ] **Verify:** Now only `lyric-animator.css` loads
- [ ] Check body class: Should be `v1-active` or `v2-active`

**✅ Expected:** Only ONE CSS file loads at a time

---

### **2. Wordle - Error Handling**
**URL:** `http://localhost:5000/project/wordle`

**Test A: Empty Input**
- [ ] Click "Get Guesses" without entering a word
- [ ] **Verify:** Shows error message (not crash/500)
- [ ] Message should say "Please enter a word"

**Test B: Valid Word**
- [ ] Enter "slate" (or any 5-letter word)
- [ ] Click "Get Guesses"
- [ ] **Verify:** Shows guesses if word exists

**✅ Expected:** User-friendly errors, no crashes

---

### **3. Analytics - Division by Zero**
**URL:** `http://localhost:5000/analyticsViewer`

- [ ] Load page
- [ ] **Verify:** No "NaN" in average calculations
- [ ] If no data: Should show "0" not "NaN"

**✅ Expected:** Clean numbers, no NaN values

---

## ⚡ Priority 2: Good to Test (10-15 minutes)

### **4. LocalStorage Quota Handling**

**Open DevTools Console:**
```javascript
// Fill localStorage to quota
for(let i = 0; i < 1000; i++) {
    localStorage.setItem('test_' + i, 'x'.repeat(1000));
}

// Try to store analytics
AnalyticsLogger.logEvent('test_event', {data: 'test'});

// Check console for warnings about cleanup
```

**✅ Expected:** Should see cleanup message, no crash

---

### **5. Portfolio AI - Error Handling**

**Open DevTools → Network tab → Enable "Offline"**
- [ ] Click AI chat icon
- [ ] Send a message
- [ ] **Verify:** Shows network error message (not generic error)

**Re-enable network:**
- [ ] Send another message
- [ ] **Verify:** Works normally

**✅ Expected:** Specific error messages

---

### **6. Scroll Depth Tracking**

**Open DevTools Console:**
- [ ] Load home page
- [ ] Scroll slowly to 26% of page (skip exactly 25%)
- [ ] Check console logs
- [ ] **Verify:** 25% milestone still logged

**✅ Expected:** Milestones logged even if exact percentage skipped

---

### **7. Promo Analytics - Chart Performance**
**URL:** `http://localhost:5000/promoManagerAnalytics` (if available)

- [ ] Load page with charts
- [ ] Apply filters 5 times rapidly
- [ ] **Verify:** Charts update smoothly (no flicker/delay)
- [ ] Open DevTools Performance tab
- [ ] Record while applying filter
- [ ] **Verify:** No "destroy Chart" calls (should see "update" instead)

**✅ Expected:** Fast, smooth updates

---

## 🔍 Priority 3: Optional Tests (5 minutes)

### **8. Analytics Concurrent Writes**

**Only if you want to test file locking:**
```bash
# Open 3 terminal windows, run simultaneously:
curl -X POST http://localhost:5000/api/analytics/events \
  -H "Content-Type: application/json" \
  -d '{"events":[{"event_type":"test","timestamp":"2025-12-13T12:00:00Z"}]}'
```

- [ ] Check `data/analytics/analytics_2025-12-13.json`
- [ ] **Verify:** All events saved, valid JSON

**✅ Expected:** No data loss, valid JSON file

---

### **9. Hex Color Validation**

**Open DevTools Console:**
```javascript
// Test on any page with backgrounds
window.BG5?.updateTheme?.('INVALID');  // Invalid hex
```

- [ ] Check console for warning
- [ ] **Verify:** Background uses default color (orange)

**✅ Expected:** Graceful fallback to default

---

## 🐛 What to Look For

### **Good Signs:**
- ✅ No browser console errors
- ✅ Error messages are user-friendly
- ✅ Page loads feel faster
- ✅ Charts update smoothly
- ✅ Only one CSS file loads

### **Bad Signs (Report These):**
- ❌ Console errors or warnings
- ❌ "NaN" or "undefined" displayed to user
- ❌ Crashes or 500 errors
- ❌ Both CSS files loading
- ❌ Infinite loops in DevTools

---

## 📊 Files Changed Summary

**Backend (3):**
- `app.py` - Input validation, version switching
- `utils/analytics_storage.py` - File locking, atomic writes
- `templates/lyricAnimator.html` - Conditional CSS

**Frontend (7):**
- `analytics-viewer.js` - Division by zero, caching
- `analytics-logger.js` - Scroll tracking, retry limits
- `utils/storage.js` - Quota handling
- `portfolio-ai.js` - Error handling
- `promo-analytics.js` - Chart optimization
- `backgrounds/bg5-hybrid.js` - Color validation
- `project-interaction-tracker.js` - Event cleanup

---

## 🎯 Success Criteria

**All tests pass if:**
1. No JavaScript errors in console
2. User-friendly error messages (no crashes)
3. Only one CSS file loads for Lyric Animator
4. Charts update smoothly without flicker
5. No "NaN" displayed anywhere
6. Storage quota handled gracefully

---

## 💡 Quick Smoke Test (2 minutes)

If you're short on time, just do this:

1. **Load home page** - No errors
2. **Click Lyric Animator** - Check CSS loading (only one file)
3. **Try Wordle** - Submit empty form (should show error, not crash)
4. **Check console** - No red errors

If these 4 pass, the fixes are working! ✅

---

## 📝 Report Issues

If you find any problems:

1. **Which test failed?**
2. **Error message (if any)?**
3. **Browser console errors?**
4. **Expected vs actual behavior?**

Share these and I'll fix immediately!

---

**Ready to test?** Start with Priority 1 (5-10 min) and go from there! 🚀
