import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB Client (Uses the SDK v3 included in Node.js 22.x Lambda runtime)
const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const TABLE_NAME = "PreparationHub";

/**
 * AWS Lambda Handler for PrepHub backend API.
 * Single entry point handling route dispatching, Cognito token decoding, and DynamoDB CRUD.
 */
export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event));

    // Normalize path and method for REST/HTTP API Gateway integrations
    let path = event.resource || event.path || (event.requestContext?.http?.path) || "";
    let method = event.httpMethod || (event.requestContext?.http?.method) || "";

    // Remove stage prefix if present (e.g., /prod/user or /dev/user becomes /user)
    path = path.replace(/^\/(prod|dev|stage)/i, "");

    // CORS preflight requests
    if (method === "OPTIONS") {
        return buildResponse(200, { message: "CORS Preflight OK" });
    }

    // Extract body and handle base64 encoding from API Gateway / Lambda proxy integrations
    let requestBody = event.body;
    if (event.isBase64Encoded && requestBody) {
        try {
            requestBody = Buffer.from(requestBody, "base64").toString("utf8");
            console.log("Decoded base64 request body:", requestBody);
        } catch (err) {
            console.error("Failed to decode base64 request body:", err);
        }
    }

    // Extract & validate Cognito JWT from Authorization Header
    let userId;
    let emailFromJwt = "";

    try {
        const authHeader = event.headers?.authorization || event.headers?.Authorization;
        if (!authHeader) {
            return buildResponse(401, { error: "Unauthorized: Missing Authorization header" });
        }

        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
            return buildResponse(401, { error: "Unauthorized: Invalid Authorization header format. Use 'Bearer <token>'" });
        }

        const token = parts[1];
        const tokenParts = token.split(".");
        if (tokenParts.length !== 3) {
            return buildResponse(401, { error: "Unauthorized: Invalid JWT format" });
        }

        // Decode JWT payload (middle segment) using base64url-to-base64 conversion
        const base64Url = tokenParts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payloadJson = Buffer.from(base64, "base64").toString("utf8");
        const payload = JSON.parse(payloadJson);

        if (!payload.sub) {
            return buildResponse(401, { error: "Unauthorized: JWT payload missing 'sub' claim" });
        }

        userId = payload.sub;
        emailFromJwt = payload.email || "";
    } catch (err) {
        console.error("JWT extraction failed:", err);
        return buildResponse(401, { error: "Unauthorized: Failed to parse user authentication" });
    }

    // Route Dispatcher
    try {
        if (path === "/user" && method === "GET") {
            return await getUserData(userId, emailFromJwt);
        } else if (path === "/bookmark" && method === "POST") {
            return await saveBookmarks(userId, requestBody);
        } else if (path === "/progress" && method === "POST") {
            return await saveProgress(userId, requestBody);
        } else if (path === "/profile" && method === "POST") {
            return await saveProfile(userId, requestBody, emailFromJwt);
        } else {
            return buildResponse(404, { error: `Route not found: ${method} ${path}` });
        }
    } catch (err) {
        console.error("Database operation failed:", err);
        return buildResponse(500, { error: "Internal Server Error", message: err.message });
    }
};

/**
 * GET /user - Retrieve all user-specific partitions (PROFILE, BOOKMARKS, PROGRESS)
 */
async function getUserData(userId, emailFromJwt) {
    console.log(`[getUserData] Querying database items for userId: ${userId}`);
    const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));
    console.log(`[getUserData] Database query returned ${result.Items?.length || 0} items.`);

    // Setup fallback structures for new users
    let profile = { name: "", email: emailFromJwt };
    let bookmarks = [];
    let progress = {};

    if (result.Items && result.Items.length > 0) {
        result.Items.forEach(item => {
            if (item.dataType === "PROFILE") {
                profile = {
                    name: item.name || "",
                    email: item.email || emailFromJwt
                };
            } else if (item.dataType === "BOOKMARKS") {
                bookmarks = item.bookmarks || [];
            } else if (item.dataType === "PROGRESS") {
                progress = item.courses || {};
            }
        });
    }

    console.log("[getUserData] Resolved profile:", JSON.stringify(profile));
    console.log("[getUserData] Resolved bookmarks count:", bookmarks.length);
    console.log("[getUserData] Resolved progress:", JSON.stringify(progress));

    return buildResponse(200, { profile, bookmarks, progress });
}

/**
 * POST /bookmark - Save user bookmarked questions array
 */
async function saveBookmarks(userId, requestBody) {
    console.log(`[saveBookmarks] Request body length: ${requestBody?.length || 0}`);
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        console.error("[saveBookmarks] JSON parse failure:", e);
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const bookmarks = body.bookmarks || [];
    console.log(`[saveBookmarks] Saving ${bookmarks.length} bookmarks for userId: ${userId}`);

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId: userId,
            dataType: "BOOKMARKS",
            bookmarks: bookmarks,
            updatedAt: new Date().toISOString()
        }
    }));
    console.log("[saveBookmarks] Bookmarks saved successfully to DynamoDB.");

    return buildResponse(200, { success: true, message: "Bookmarks synchronized successfully" });
}

/**
 * POST /progress - Update course and subject completion progress states
 */
async function saveProgress(userId, requestBody) {
    console.log(`[saveProgress] Request body length: ${requestBody?.length || 0}`);
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        console.error("[saveProgress] JSON parse failure:", e);
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const courses = body.courses || {};
    console.log(`[saveProgress] Saving progress map for userId: ${userId}. Courses:`, JSON.stringify(courses));

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId: userId,
            dataType: "PROGRESS",
            courses: courses,
            updatedAt: new Date().toISOString()
        }
    }));
    console.log("[saveProgress] Progress saved successfully to DynamoDB.");

    return buildResponse(200, { success: true, message: "Progress tracker synchronized successfully" });
}

/**
 * POST /profile - Save custom profile details (name, email)
 */
async function saveProfile(userId, requestBody, emailFromJwt) {
    console.log(`[saveProfile] Request body length: ${requestBody?.length || 0}`);
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        console.error("[saveProfile] JSON parse failure:", e);
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const name = body.name || "";
    const email = body.email || emailFromJwt;
    console.log(`[saveProfile] Saving profile details for userId: ${userId}. Name: ${name}, Email: ${email}`);

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId: userId,
            dataType: "PROFILE",
            name: name,
            email: email,
            updatedAt: new Date().toISOString()
        }
    }));

    return buildResponse(200, { success: true, message: "Profile details updated successfully" });
}

/**
 * Helper to build API Gateway compatible response with CORS headers
 */
function buildResponse(statusCode, data) {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}
