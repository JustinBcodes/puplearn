# Learn Mode Testing Guide

## Quick Test Steps

### 1. Start the Application
```bash
npm run dev
```

### 2. Navigate to Learn Mode
1. Go to http://localhost:3000
2. Log in (or sign up if needed)
3. Select any study set from your dashboard
4. Click the "Learn" button

### 3. Test Flashcard Flipping

**Expected Behavior:**
- ✅ Card shows question/term first
- ✅ "Click to reveal answer" prompt visible
- ✅ Click anywhere on card to flip
- ✅ Card flips with smooth 3D animation (500ms)
- ✅ Answer displayed on colored gradient background
- ✅ "Did you get it right?" prompt visible

**Test in Both Modes:**
- Light mode: White card with blue/purple gradient on back
- Dark mode: Navy (#152850) card with teal gradient on back

### 4. Test Right/Wrong Buttons

**Expected Behavior:**
- ✅ Buttons ONLY appear after card is flipped
- ✅ Two buttons visible:
  - Left: ❌ Wrong (red, with "← or Left Arrow" hint)
  - Right: ✅ Right (green, with "→ or Right Arrow" hint)
- ✅ Clicking "Right" advances to next card
- ✅ Clicking "Wrong" advances to next card but tracks as wrong
- ✅ Buttons disabled briefly during processing (300ms)
- ✅ Next card appears unflipped (question side)

### 5. Test Keyboard Shortcuts

**Before Flipping:**
- ✅ Arrow keys do nothing (shortcuts disabled)

**After Flipping:**
- ✅ Press `→` (Right Arrow) → marks card as correct
- ✅ Press `←` (Left Arrow) → marks card as incorrect
- ✅ Both work exactly like clicking buttons

### 6. Test Reinforcement Algorithm

**Create a test scenario:**
1. Start Learn Mode with at least 5 cards
2. Mark 2-3 cards as "Wrong"
3. Mark remaining cards as "Right" (twice each for mastery)
4. Complete the session

**Expected Behavior:**
- ✅ Progress bar updates after each card
- ✅ Cards marked wrong show "Needs practice" badge when they reappear
- ✅ Wrong cards appear more frequently than correct ones
- ✅ All cards eventually mastered (requires 2 correct in a row)
- ✅ Completion modal shows correct stats

### 7. Test Completion Modal

**Expected Elements:**
- ✅ Bouncing Corgi mascot
- ✅ Heading: "🎉 You've Mastered This Set!"
- ✅ Stats display:
  - Mastered count (blue/teal)
  - Correct count (green)
  - Incorrect count (red)
  - Accuracy percentage (blue/teal)
- ✅ Corgi encouragement message
- ✅ Three buttons (in order):
  1. "Relearn Mistakes (X cards)" - only if wrong cards exist
  2. "Start New Session"
  3. "Return to Dashboard"

**Test Button Actions:**
- ✅ "Relearn Mistakes" → starts new session with only wrong cards
- ✅ "Start New Session" → restarts with all cards
- ✅ "Return to Dashboard" → navigates to dashboard

### 8. Test Dark Mode

**Toggle dark mode and verify:**
- ✅ Background: Navy (#0a1128)
- ✅ Flashcard (question): Dark blue (#152850)
- ✅ Flashcard (answer): Teal-to-blue gradient
- ✅ Text: Soft off-white/gray (readable)
- ✅ Progress bar: Teal gradient
- ✅ Buttons: Proper contrast
- ✅ Completion modal: Dark background and card

### 9. Test Edge Cases

**Single Card Study Set:**
- ✅ Works correctly
- ✅ No infinite loops
- ✅ Completion triggers after mastery

**Large Study Set (if available):**
- ✅ Handles 50+ cards smoothly
- ✅ No performance degradation
- ✅ No memory leaks

**All Wrong First Pass:**
- ✅ All cards appear again
- ✅ Can mark correct on second pass
- ✅ Eventually completes

**All Correct First Pass:**
- ✅ All cards need 2 correct to master
- ✅ Completes when all mastered
- ✅ "Relearn Mistakes" button doesn't appear

### 10. Test Mobile Responsiveness

**Use browser dev tools to test mobile:**
- ✅ Card readable on mobile (text size appropriate)
- ✅ Tap to flip works on touchscreen
- ✅ Buttons large enough to tap easily
- ✅ Progress bar visible
- ✅ No horizontal scrolling
- ✅ Keyboard shortcuts work on mobile keyboards

### 11. Test Navigation

**During Learn Mode:**
- ✅ "Back to Study Set" button works
- ✅ No data loss when navigating away

**After Completion:**
- ✅ All navigation buttons work
- ✅ No 404 errors
- ✅ Smooth transitions

## Visual Verification Checklist

### Light Mode
- [ ] Clean white background with subtle gradient
- [ ] Question card: White with blue border
- [ ] Answer card: Blue-to-purple gradient
- [ ] Text: Dark gray (high contrast)
- [ ] Buttons: Vibrant red/green
- [ ] Progress bar: Blue-to-purple gradient

### Dark Mode
- [ ] Navy background (#0a1128)
- [ ] Question card: Navy blue (#152850)
- [ ] Answer card: Teal-to-blue gradient
- [ ] Text: Soft off-white (readable, not harsh)
- [ ] Buttons: Same colors (good contrast)
- [ ] Progress bar: Teal gradient

## Performance Checklist

- [ ] Card flip animation smooth (no jank)
- [ ] No flicker when loading next card
- [ ] No visible answer leak before flip
- [ ] Buttons fade in smoothly
- [ ] Progress bar updates smoothly
- [ ] Loading states appear/disappear instantly
- [ ] No console errors
- [ ] No console warnings (except pre-existing)

## Browser Testing

Test in multiple browsers:
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Deployment Checklist

Before deploying to Vercel:
- [x] `npm run build` succeeds ✅
- [x] `npm run lint` passes ✅
- [x] All TypeScript errors resolved ✅
- [x] All functional tests pass ✅
- [x] Dark mode verified ✅
- [x] Mobile responsive ✅
- [ ] Manual testing complete (run through this guide)

## Common Issues & Solutions

### Card not flipping?
- Check browser console for errors
- Verify CSS animations are enabled
- Try hard refresh (Cmd+Shift+R)

### Keyboard shortcuts not working?
- Make sure card is flipped first
- Check if another input has focus
- Verify browser isn't blocking events

### Wrong cards not tracked?
- Check network tab for API errors
- Verify database connection
- Check browser console

### Dark mode colors wrong?
- Verify Tailwind CSS compiling correctly
- Check for CSS specificity issues
- Try clearing browser cache

## Success Criteria

✅ All tests pass
✅ No visual bugs
✅ Smooth animations
✅ Keyboard shortcuts work
✅ Dark mode perfect
✅ Mobile responsive
✅ No console errors
✅ Performance excellent

---

**Next Step:** Deploy to Vercel and celebrate! 🎉

