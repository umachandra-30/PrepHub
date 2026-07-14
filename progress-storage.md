# Temporary Progress Storage System

This document outlines the design, implementation, and future replacement steps for the temporary, session-based progress tracking system implemented in the Placement Preparation Hub.

---

## 1. Files Modified

The changes are contained within the core shared utilities of the application:
* **[js/utils.js](file:///w:/AWS-2/js/utils.js)**: Added logic to detect page reloads and new tab/window sessions to clear progress data from Local Storage. Also bypassed Cognito backend database synchronization hooks for progress tracking to enforce session-only scope.

---

## 2. How the Temporary Local Storage Implementation Works

The system operates locally within the browser utilizing `localStorage` to save, fetch, and check progress:

1. **State Persistence**: When a user selects and checks a correct or incorrect option for a question, `markQuestionCompleted(subjectSlug, questionId, isCorrect)` in `js/utils.js` is triggered.
2. **Schema structure**: Progress is saved under the Local Storage key `hub-progress` with the following schema:
   ```json
   {
     "subjectSlug": {
       "completed": ["q1", "q2"],
       "correct": ["q1"],
       "wrong": ["q2"]
     }
   }
   ```
3. **UI Reactivity**: The updated progress state is instantly reflected in the active UI layout (updating subject lists, progress tracker bars, sidebar status icons, and correctness indicators) because all client-side rendering files call `getProgress()` dynamically on load, and listen to state transitions.
4. **Duplicate Prevention**: The array-push implementation validates if a question ID is already included prior to appending it, eliminating any chance of duplicate record accumulation or memory leaks.

---

## 3. How Progress is Cleared on Page Refresh and New Sessions

To prevent progress from persisting across browser sessions, reloads, or new tab entries, an Immediately Invoked Function Expression (IIFE) runs at the top of `js/utils.js`:

```javascript
(function() {
    try {
        const navigation = performance.getEntriesByType('navigation')[0];
        const isReload = (navigation && navigation.type === 'reload') || 
                         (window.performance && window.performance.navigation && window.performance.navigation.type === 1);
        
        const currentOrigin = window.location.origin;
        const isInternalReferrer = document.referrer && 
            (document.referrer.startsWith(currentOrigin) || 
             (currentOrigin === 'null' && document.referrer.startsWith('file://')));
        
        const isBackForward = (navigation && navigation.type === 'back_forward') ||
                              (window.performance && window.performance.navigation && window.performance.navigation.type === 2);
        
        const isNewSession = !isInternalReferrer && !isBackForward && !isReload;

        if (isReload || isNewSession) {
            localStorage.removeItem('hub-progress');
            console.log(`[Progress Tracker] Solved questions progress cleared from Local Storage (Reason: ${isReload ? 'Page Reload' : 'New Session/Tab Reopened'}).`);
        }
    } catch (e) {
        console.error("[Progress Tracker] Failed to evaluate reload/session state:", e);
    }
})();
```

### Cleared Conditions:
* **Page Refresh / Reload**: Pressing **F5**, **Ctrl+R**, or triggering a browser reload sets `isReload` to true using the Navigation Timing API, automatically purging the progress store.
* **New Tab / Tab Reopen**: Navigating directly from bookmarks, typing the URL directly, or launching the site in a fresh window means `document.referrer` is external or blank and navigation type is not back/forward. This identifies a new browsing session (`isNewSession = true`), clearing the Local Storage progress.
* **Preserved Condition**: If navigating between pages using internal links of the site (e.g. from `questions.html` to `progress.html`), the `document.referrer` matches `window.location.origin`. In this case, `isNewSession` evaluates to false, and the progress is safely preserved to enable smooth page transitions.

---

## 4. Steps Required to Replace with a Backend/Database Solution

To replace this temporary system with a persistent backend database in the future, follow these steps:

1. **Remove Reload/Session Detection IIFE**:
   Remove or comment out the IIFE block at the top of `js/utils.js` that listens for reloads and new session triggers to clear the progress store.
2. **Re-enable Progress Fetching on Authentication**:
   In `syncUserData` (`js/utils.js`), uncomment the line that loads persistent progress from the backend payload:
   ```diff
   - // Bypassed for temporary session-based progress tracking:
   - // if (data.progress) localStorage.setItem('hub-progress', JSON.stringify(data.progress));
   + if (data.progress) localStorage.setItem('hub-progress', JSON.stringify(data.progress));
   ```
3. **Re-enable Progress Syncing to Database**:
   In `syncProgressToBackend` (`js/utils.js`), remove the early return statement so that any local progress updates are sent to the Cognito API Gateway endpoint:
   ```diff
   async function syncProgressToBackend(courses) {
   -     // Bypassed: progress tracking is temporary and local session-only, so we do not sync it to the backend.
   -     return;
         if (!isLoggedIn()) return;
   ```
4. **Deploy Database Backend Models**:
   Create a database model/table (e.g., in DynamoDB, MySQL, or PostgreSQL) with fields linking `userId` to their solved questions list per subject.
5. **Implement Backend Endpoints**:
   Create API Gateway routes (e.g., `/progress` POST and GET) mapped to AWS Lambda functions or a backend server to retrieve and update user progress records in the database.
