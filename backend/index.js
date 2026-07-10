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

        // Decode JWT payload (middle segment)
        const payloadJson = Buffer.from(tokenParts[1], "base64").toString("utf8");
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
            return await saveBookmarks(userId, event.body);
        } else if (path === "/progress" && method === "POST") {
            return await saveProgress(userId, event.body);
        } else if (path === "/profile" && method === "POST") {
            return await saveProfile(userId, event.body, emailFromJwt);
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
    const result = await docClient.send(new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": userId
        }
    }));

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

    return buildResponse(200, { profile, bookmarks, progress });
}

/**
 * POST /bookmark - Save user bookmarked questions array
 */
async function saveBookmarks(userId, requestBody) {
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const bookmarks = body.bookmarks || [];

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId: userId,
            dataType: "BOOKMARKS",
            bookmarks: bookmarks,
            updatedAt: new Date().toISOString()
        }
    }));

    return buildResponse(200, { success: true, message: "Bookmarks synchronized successfully" });
}

/**
 * POST /progress - Update course and subject completion progress states
 */
async function saveProgress(userId, requestBody) {
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const courses = body.courses || {};

    await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
            userId: userId,
            dataType: "PROGRESS",
            courses: courses,
            updatedAt: new Date().toISOString()
        }
    }));

    return buildResponse(200, { success: true, message: "Progress tracker synchronized successfully" });
}

/**
 * POST /profile - Save custom profile details (name, email)
 */
async function saveProfile(userId, requestBody, emailFromJwt) {
    let body;
    try {
        body = JSON.parse(requestBody || "{}");
    } catch (e) {
        return buildResponse(400, { error: "Invalid JSON request body" });
    }

    const name = body.name || "";
    const email = body.email || emailFromJwt;

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
