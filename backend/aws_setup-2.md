# AWS Setup Supplement: Deploying API & Fixing CORS Errors

This guide explains how to properly deploy your API Gateway, where to click in the AWS Console, and how to resolve the CORS error shown in your browser logs.

---

## 1. Where and How to Deploy the API

To make your API active (and apply any CORS changes), you must deploy it from the **Resources** panel:

1.  In the Amazon API Gateway Console, select your API (`PreparationHubAPI`).
2.  In the left sidebar, click **Resources**.
3.  In the **Resources tree** (the middle pane), click on the very top root folder **`/`**.
4.  Look at the top-right corner of the pane or click the **Deploy API** button (in some console versions, this is under the **Actions** dropdown menu -> **Deploy API**).
5.  In the popup window:
    *   **Stage**: Select `prod` (or create a new stage if you haven't yet).
    *   **Description**: Optional.
6.  Click **Deploy**.

> [!IMPORTANT]
> You must select the **root folder `/`** to deploy the entire API (all endpoints: `/user`, `/bookmark`, `/progress`, and `/profile`). Selecting a specific method (like `GET` or `POST`) or folder does not restrict deployment, but starting from the root ensures all resources are bundled.
>
> **Every time you make any change to CORS, resources, or methods, you MUST click "Deploy API" again for the changes to go live!**

---

## 2. Resolving the CORS Policy Block Error

If you see the error:
`Access to fetch at 'https://vrxdrefcdf.execute-api.us-east-1.amazonaws.com/prod/user' from origin 'http://127.0.0.1:5502' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`

Follow this 4-step checklist to resolve it:

### Step A: Verify Lambda is Returning CORS Headers
Make sure you copied and **deployed** the latest code in your Lambda function. The Lambda proxy integration requires the code to explicitly return the headers:
```javascript
"headers": {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
}
```
*(This is already built into the `buildResponse` function in your `backend/index.js` file.)*

### Step B: Enable CORS on All Resources
Ensure API Gateway is forwarding options:
1.  In the API Gateway Resources tree, click on `/user`.
2.  Click **Enable CORS** (or under Actions -> Enable CORS).
3.  Check all methods (`GET`, `OPTIONS`).
4.  Ensure **Access-Control-Allow-Origin** is set to `'*'` (with single quotes) and **Access-Control-Allow-Headers** contains `'Content-Type,Authorization'`.
5.  Click **Save / Enable**.
6.  **Repeat these steps** for `/bookmark`, `/progress`, and `/profile`.

### Step C: Configure Gateway Responses (For 4xx/5xx unauthorized errors)
If a user is unauthorized (invalid Cognito token) or the server returns an error, API Gateway rejects the request *before* calling Lambda. By default, API Gateway does not send CORS headers for these blocks, which triggers the CORS error in your browser.
To fix this:
1.  In the API Gateway left menu, click **Gateway Responses**.
2.  Click **Default 4XX** and click **Edit**.
3.  Under **Response headers**, click **Add header**:
    *   **Header name**: `Access-Control-Allow-Origin`
    *   **Value**: `'*'` (include the single quotes)
4.  Click **Save**.
5.  Click **Default 5XX** and click **Edit**.
6.  Under **Response headers**, click **Add header**:
    *   **Header name**: `Access-Control-Allow-Origin`
    *   **Value**: `'*'`
7.  Click **Save**.

### Step D: Re-Deploy the API
Go back to **Resources**, click on the root **`/`**, click **Deploy API**, select stage `prod`, and click **Deploy**.

Wait 10–20 seconds for the cloud CDN caches to clear, refresh your browser page at `http://127.0.0.1:5502`, and try again!
