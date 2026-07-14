# Progress Sync Debug & Fix Report

## 1. Root Cause of the Issue

The progress synchronization with DynamoDB stopped working due to issues on both the frontend and backend:

### Frontend Blockers:
1. An Immediately Invoked Function Expression (IIFE) was added at the top of `js/utils.js` which intercepted all page reloads and new browser sessions to run `localStorage.removeItem('hub-progress')`, destroying the local cache.
2. In `syncUserData()` (`js/utils.js`), the code segment that restored the user's progress records from the Cognito backend payload (`data.progress`) was commented out.
3. In `syncProgressToBackend(courses)` (`js/utils.js`), an early `return;` statement was injected as the first line of the function. This bypassed any calls to the `/progress` API endpoint, preventing progress saving for authenticated users.

### Backend/API Blockers:
1. **Base64url JWT Parsing**: Standard Cognito JWTs are base64url-encoded and contain `-` and `_` characters. In `backend/index.js`, using `Buffer.from(token, "base64")` caused decoding corruption when encountering these characters, throwing JSON parsing exceptions during sub claim validation. This returned `401 Unauthorized` errors.
2. **Base64 Request Body**: API Gateway or Lambda proxy configurations can base64-encode incoming POST request bodies. The backend failed to check if `event.isBase64Encoded` was true and decode it, causing `JSON.parse(event.body)` to fail with a `400 Bad Request` error.

---

## 2. Files Modified & Changes Made

### Frontend:
1. **[js/utils.js](file:///w:/AWS-2/js/utils.js)**
   * **Removed the IIFE reload/session detection block** from the top of the file so that authenticated users do not have their progress cleared on F5/refresh.
   * **Restored Progress Sync in `syncUserData`**: Uncommented the line `if (data.progress) localStorage.setItem('hub-progress', JSON.stringify(data.progress))` and added detailed console logging for the GET request and JSON response.
   * **Restored & Enhanced `syncProgressToBackend`**: Removed the early `return;` bypass. Rewrote the method to accept both the updated progress state (`courses`) and the prior state (`originalProgress`).
   * **Implemented Reversal Rollback Action**: Added an error handling try-catch block inside `syncProgressToBackend`. If the fetch request fails (network error, CORS block, or non-200 HTTP code), the local storage cache `hub-progress` is immediately rolled back to `originalProgress`, the custom `progress-updated` event is fired, and a warning toast notification is shown to prevent out-of-sync states.
   * **Updated `markQuestionCompleted`**: Modified the function to deep clone the progress state as `originalProgress` before modifying it, then passed this state to `syncProgressToBackend`.
2. **[js/progress.js](file:///w:/AWS-2/js/progress.js)**
   * **Reset Sync**: Modified `resetAllProgress(registry)` to call `window.syncProgressToBackend({})` upon clicking the "Reset Progress Data" button, clearing the progress database partition in DynamoDB.

### Backend:
1. **[backend/index.js](file:///w:/AWS-2/backend/index.js)**
   * **Base64url JWT Decode**: Sanitized base64url characters (`-` and `_` replaced with `+` and `/`) prior to calling `Buffer.from(..., "base64")` to decode the Cognito JWT payload correctly.
   * **Base64 Request Body decoding**: Added check for `event.isBase64Encoded` and decoded `event.body` if base64-encoded:
     ```javascript
     let requestBody = event.body;
     if (event.isBase64Encoded && requestBody) {
         try {
             requestBody = Buffer.from(requestBody, "base64").toString("utf8");
             console.log("Decoded base64 request body:", requestBody);
         } catch (err) {
             console.error("Failed to decode base64 request body:", err);
         }
     }
     ```
   * **Passed decoded body**: Updated route dispatcher to pass `requestBody` instead of `event.body` to all POST handler functions (`saveBookmarks`, `saveProgress`, and `saveProfile`).
   * **Added Log Enhancements**: Printed query counts, parsed JSON items, and success states for all database interactions.

---

## 3. Backend Architecture Checked

* **API Endpoints Involved**:
  * `GET /user`: Retrieves profile data, bookmarks array, and progress map for the authenticated user.
  * `POST /progress`: Save payload containing `{ courses: progressMap }` to the DynamoDB database.
* **Lambda Function**:
  * `preparationHubAPI` (source in `backend/index.js`): Verified correct routing dispatcher, Authorization bearer JWT token extraction, Cognito `sub` claiming, and CORS responses.
* **DynamoDB Table**:
  * Table Name: `PreparationHub`
  * Partition Key: `userId` (String)
  * Sort Key: `dataType` (String)
  * Data Partitions: Reads/Writes are separated using the sort key value `dataType = "PROGRESS"`, preserving existing profile and bookmark information.

---

## 4. Steps to Reproduce the Issue (Before and After Fix)

### Before the Fix (Broken Behavior):
1. Log in with a valid user credentials via AWS Cognito.
2. Navigate to a subject (e.g., C++ Programming) and answer a question.
3. Observe that no API call is sent to `/progress` in the Network tab, and progress remains strictly local.
4. Reload the page. All progress tracker metrics and sidebar checkboxes reset to zero/unsolved because progress is not synced or loaded from DynamoDB.

### After the Fix (Correct Behavior):
1. Log in with user credentials.
2. Solve a question.
3. Observe in console logs or Network tab that a `POST /progress` request is sent with the correct payload and `Authorization: Bearer <JWT>` header. A toast displays "Progress successfully saved to database."
4. Reload the page (F5). Observe a `GET /user` request retrieving progress. The UI preserves the solved question checkmarks and accuracy charts.
5. In a logged-out guest state: solve a question. Observe that progress is kept only in local storage, no network request is sent, and progress is correctly cleared upon page refresh.

---

## 5. Sample Request & Response Payloads

### POST `/progress` Request Payload
* **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Ik...
  ```
* **Body**:
  ```json
  {
    "courses": {
      "cpp-programming": {
        "completed": [1],
        "correct": [1],
        "wrong": []
      }
    }
  }
  ```

### POST `/progress` Response Payload
* **Status**: `200 OK`
* **Body**:
  ```json
  {
    "success": true,
    "message": "Progress tracker synchronized successfully"
  }
  ```

### GET `/user` Response Payload (Progress Partition Segment)
* **Status**: `200 OK`
* **Body**:
  ```json
  {
    "profile": {
      "name": "User Name",
      "email": "user@example.com"
    },
    "bookmarks": [],
    "progress": {
      "cpp-programming": {
        "completed": [1],
        "correct": [1],
        "wrong": []
      }
    }
  }
  ```
