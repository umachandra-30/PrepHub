# AWS Backend Setup Guide: PrepHub

Follow these steps to deploy and configure the AWS resources required for the PrepHub college project.

---

## 1. DynamoDB Table Setup

You already have a DynamoDB table named `PreparationHub`. Confirm it matches these settings:
*   **Table Name**: `PreparationHub`
*   **Partition Key**: `userId` (String)
*   **Sort Key**: `dataType` (String)
*   **Region**: `us-east-1` (or your chosen region)

---

## 2. IAM Policy and Role for Lambda

Create an IAM execution role for your Lambda function:

1.  Open the **IAM Console** (Identity and Access Management).
2.  Click **Roles** in the left menu, then **Create Role**.
3.  Select **AWS Service** as the trusted entity type, and choose **Lambda** from the service dropdown. Click **Next**.
4.  Search for and attach the AWS managed policy **`AWSLambdaBasicExecutionRole`** (this allows the Lambda to log to CloudWatch). Click **Next**.
5.  Name the role `preparationHubLambdaRole` and click **Create Role**.
6.  Click on the newly created role, click **Add permissions** -> **Create inline policy**.
7.  Select the **JSON** tab and paste the following policy (grants access to the `PreparationHub` table):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:Query"
            ],
            "Resource": "arn:aws:dynamodb:us-east-1:652937923074:table/PreparationHub"
        }
    ]
}
```
8.  Click **Next**, name the policy `PreparationHubDynamoDBPolicy`, and click **Create policy**.

---

## 3. Create Lambda Function

Create the `preparationHubAPI` Lambda function:

1.  Open the **AWS Lambda Console**.
2.  Click **Create function**.
3.  Choose **Author from scratch**.
4.  Configure the settings:
    *   **Function name**: `preparationHubAPI`
    *   **Runtime**: `Node.js 22.x`
    *   **Architecture**: `x86_64`
    *   **Permissions**: Expand *Change default execution role*, select *Use an existing role*, and select the `preparationHubLambdaRole` created in Step 2.
5.  Click **Create function**.
6.  In the function editor, replace the code in `index.mjs` (or `index.js`) with the contents of the `backend/index.js` file.
7.  Click **Deploy** at the top.
8.  *(Optional)* If you want to run package.json locally, you can do it, but since `@aws-sdk/client-dynamodb` and `@aws-sdk/lib-dynamodb` are already bundled by AWS in Node.js runtimes, you do NOT need to zip/upload `node_modules`!

---

## 4. API Gateway Setup

Expose the Lambda function to the web using API Gateway:

1.  Open the **Amazon API Gateway Console**.
2.  Click **Create API**, select **REST API** (not Private), and click **Build**.
3.  Choose **New API**:
    *   **API name**: `PreparationHubAPI`
    *   **API endpoint type**: `Regional`
4.  Click **Create API**.
5.  Create the resources:
    *   Click on root `/` in the resource tree, click **Create Resource**.
    *   Resource Name: `user`, Resource Path: `user`. Click **Create Resource**.
    *   Repeat to create resources `bookmark`, `progress`, and `profile`.
6.  Create methods for each resource:
    *   Select `/user` in the tree. Click **Create Method**.
        *   Method Type: `GET`.
        *   Integration Type: `Lambda Function`.
        *   Enable **Lambda Proxy Integration** (MUST BE ON).
        *   Lambda Function: Choose region `us-east-1` and name `preparationHubAPI`.
        *   Click **Create**.
    *   Select `/bookmark`. Click **Create Method**:
        *   Method Type: `POST`.
        *   Enable **Lambda Proxy Integration** (MUST BE ON).
        *   Lambda Function: `preparationHubAPI`. Click **Create**.
    *   Select `/progress`. Click **Create Method**:
        *   Method Type: `POST`.
        *   Enable **Lambda Proxy Integration** (MUST BE ON).
        *   Lambda Function: `preparationHubAPI`. Click **Create**.
    *   Select `/profile`. Click **Create Method**:
        *   Method Type: `POST`.
        *   Enable **Lambda Proxy Integration** (MUST BE ON).
        *   Lambda Function: `preparationHubAPI`. Click **Create**.
7.  **Enable CORS**:
    *   Select the root or each resource (`/user`, `/bookmark`, `/progress`, `/profile`) and click **Enable CORS**.
    *   Select all methods (`GET`, `POST`, `OPTIONS`), check **Access-Control-Allow-Origin** as `'*'` (or custom domain), and check **Access-Control-Allow-Headers** to include `Content-Type,Authorization`.
    *   Click **Save**.
8.  **Deploy the API**:
    *   Click **Deploy API** (top right button).
    *   Stage: `*New Stage*`, Stage name: `prod`.
    *   Click **Deploy**.
9.  Copy the **Invoke URL** displayed at the top (e.g., `https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod`).
10. Update the `apiGatewayUrl` variable in `w:\AWS\js\utils.js` on the frontend with this Invoke URL.
