const http = require("http");
const https = require("https");
const { execFile } = require("child_process");
const path = require("path");

const PORT = 3000;
const API_TIMEOUT = 20000;
const mainExe = path.join(__dirname, "main.exe");

// =========================================================
// JSON RESPONSE
// =========================================================

function sendJSON(res, statusCode, data) {
    if (res.writableEnded) return;

    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    });

    res.end(JSON.stringify(data));
}

// =========================================================
// READ REQUEST BODY
// =========================================================

function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = "";

        req.on("data", chunk => {
            body += chunk;

            if (body.length > 1000000) {
                reject(new Error("Request body is too large"));
                req.destroy();
            }
        });

        req.on("end", () => {
            try {
                resolve(JSON.parse(body || "{}"));
            } catch {
                reject(new Error("Invalid JSON request"));
            }
        });

        req.on("error", reject);
    });
}

// =========================================================
// RUN C++ BACKEND
// =========================================================

function runMain(args) {
    return new Promise(resolve => {
        execFile(
            mainExe,
            args,
            {
                windowsHide: true,
                maxBuffer: 1024 * 1024,
                timeout: API_TIMEOUT
            },
            (error, stdout, stderr) => {
                const output = String(stdout || "").trim();

                console.log("[C++]", output);

                let result;

                try {
                    result = JSON.parse(output);
                } catch {
                    const first = output.indexOf("{");
                    const last = output.lastIndexOf("}");

                    try {
                        result = first >= 0 && last > first
                            ? JSON.parse(output.slice(first, last + 1))
                            : {
                                success: false,
                                message: "Invalid C++ backend response",
                                rawResponse: output
                            };
                    } catch {
                        result = {
                            success: false,
                            message: "Invalid C++ backend response",
                            rawResponse: output
                        };
                    }
                }

                if (error) {
                    console.error("[C++ ERROR]", error.message);

                    resolve({
                        success: false,
                        message: "C++ backend execution failed",
                        error: error.message,
                        stderr: String(stderr || "").trim()
                    });

                    return;
                }

                resolve(result);
            }
        );
    });
}

// =========================================================
// HTTPS JSON REQUEST
// =========================================================

function httpsGetJSON(url, headers = {}, serviceName = "API") {
    return new Promise((resolve, reject) => {
        const request = https.get(
            url,
            {
                headers,
                timeout: API_TIMEOUT
            },
            response => {
                let body = "";

                response.setEncoding("utf8");
                response.on("data", chunk => body += chunk);

                response.on("end", () => {
                    const status = response.statusCode || 0;

                    if (status < 200 || status >= 300) {
                        reject(new Error(
                            `${serviceName}: HTTP ${status}`
                        ));
                        return;
                    }

                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        reject(new Error(
                            `${serviceName}: Invalid JSON response`
                        ));
                    }
                });
            }
        );

        request.setTimeout(API_TIMEOUT, () => {
            request.destroy(new Error("Request timed out"));
        });

        request.on("error", reject);
    });
}

// =========================================================
// GEOCODING
// =========================================================

async function geocodeLocation(locationName) {
    const url =
        "https://nominatim.openstreetmap.org/search" +
        "?format=json&limit=1&q=" +
        encodeURIComponent(locationName);

    const results = await httpsGetJSON(
        url,
        {
            "User-Agent": "SafeHer-PBL-Project/1.0",
            "Accept": "application/json"
        },
        "Nominatim"
    );

    if (!Array.isArray(results) || results.length === 0) {
        return null;
    }

    const latitude = Number(results[0].lat);
    const longitude = Number(results[0].lon);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        throw new Error("Invalid geocoding coordinates");
    }

    return {
        latitude,
        longitude,
        displayName: results[0].display_name
    };
}

// =========================================================
// FORMAT TURN-BY-TURN DIRECTIONS
// =========================================================

function describeManeuver(maneuver, roadName) {
    const type = maneuver?.type || "continue";
    const modifier = maneuver?.modifier || "";
    const road = roadName || "unnamed road";

    if (type === "depart") {
        return `Start on ${road}`;
    }

    if (type === "arrive") {
        return "You have reached your destination";
    }

    const actions = {
        "turn sharp right": "Turn sharp right",
        "turn right": "Turn right",
        "turn slight right": "Turn slightly right",
        "turn sharp left": "Turn sharp left",
        "turn left": "Turn left",
        "turn slight left": "Turn slightly left",
        "turn straight": "Continue straight",
        "uturn": "Make a U-turn",
        "new name": "Continue",
        "continue": "Continue",
        "merge": "Merge",
        "fork": "Take the fork",
        "on ramp": "Take the ramp",
        "off ramp": "Take the exit ramp",
        "roundabout": "Enter the roundabout",
        "rotary": "Enter the rotary",
        "end of road": "At the end of the road, turn",
        "notification": "Continue"
    };

    let action = actions[type] || "Continue";

    if (
        type === "turn" ||
        type === "end of road"
    ) {
        action += modifier ? ` ${modifier}` : "";
    } else if (type === "fork") {
        action += modifier ? ` ${modifier}` : "";
    }

    return `${action} onto ${road}`;
}

function formatDirections(route) {
    const directions = [];
    let stepNumber = 1;

    for (const leg of route.legs || []) {
        for (const step of leg.steps || []) {
            const maneuver = step.maneuver || {};
            const roadName = step.name || "";
            const instruction = describeManeuver(
                maneuver,
                roadName
            );

            directions.push({
                step: stepNumber++,
                instruction,
                road: roadName || "Unnamed road",
                distanceKm: Number(
                    ((step.distance || 0) / 1000).toFixed(2)
                ),
                durationMin: Math.round(
                    (step.duration || 0) / 60
                ),
                location: Array.isArray(maneuver.location)
                    ? [
                        maneuver.location[1],
                        maneuver.location[0]
                    ]
                    : null
            });
        }
    }

    return directions;
}

// =========================================================
// CONVERT OSRM ROUTE INTO SAFEHER FORMAT
// =========================================================

function formatRoute(route, index) {
    const coordinates = route.geometry.coordinates.map(point => [
        point[1],
        point[0]
    ]);

    return {
        id: `route-${index + 1}`,
        label: index === 0
            ? "Main route"
            : `Alternative ${index}`,
        distance: Number((route.distance / 1000).toFixed(2)),
        duration: Math.round(route.duration / 60),
        path: coordinates,
        directions: formatDirections(route),
        roadNames: [
            ...new Set(
                (route.legs || []).flatMap(leg =>
                    (leg.steps || [])
                        .map(step => step.name)
                        .filter(Boolean)
                )
            )
        ]
    };
}

// =========================================================
// OSRM: ALTERNATIVE ROAD ROUTES + DIRECTIONS
// =========================================================

async function getRoutesFromOSRM(start, end) {
    const url =
        "https://router.project-osrm.org/route/v1/driving/" +
        `${start.longitude},${start.latitude};` +
        `${end.longitude},${end.latitude}` +
        "?alternatives=3&steps=true&overview=full&geometries=geojson";

    const result = await httpsGetJSON(
        url,
        {
            "Accept": "application/json",
            "User-Agent": "SafeHer-PBL-Project/1.0 (student project)"
        },
        "OSRM routing"
    );

    if (
        result.code !== "Ok" ||
        !Array.isArray(result.routes) ||
        result.routes.length === 0
    ) {
        return [];
    }

    return result.routes.map((route, index) => {
        if (
            !Number.isFinite(route.distance) ||
            !Number.isFinite(route.duration) ||
            !route.geometry ||
            !Array.isArray(route.geometry.coordinates)
        ) {
            throw new Error("Incomplete route data from OSRM");
        }

        return formatRoute(route, index);
    });
}

// =========================================================
// HTTP SERVER
// =========================================================

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        sendJSON(res, 200, { success: true });
        return;
    }

    let requestURL;

    try {
        requestURL = new URL(req.url, `http://localhost:${PORT}`);
    } catch {
        sendJSON(res, 400, {
            success: false,
            message: "Invalid request URL"
        });
        return;
    }

    const endpoint = requestURL.pathname;

    // =====================================================
    // REGISTER
    // =====================================================

    if (req.method === "POST" && endpoint === "/register") {
        try {
            const data = await readRequestBody(req);

            const userID = String(data.userID || "").trim();
            const username = String(data.username || "").trim();
            const name = String(data.name || "").trim();
            const email = String(data.email || "").trim();
            const phone = String(data.phone || "").trim();
            const password = String(data.password || "");

            if (
                !userID || !username || !name ||
                !email || !phone || !password
            ) {
                sendJSON(res, 400, {
                    success: false,
                    message: "All required fields are missing"
                });
                return;
            }

            const result = await runMain([
                "register",
                userID,
                username,
                name,
                email,
                phone,
                password
            ]);

            sendJSON(
                res,
                result.success ? 200 : 400,
                result
            );
        } catch (error) {
            sendJSON(res, 400, {
                success: false,
                message: error.message
            });
        }

        return;
    }

    // =====================================================
    // LOGIN
    // =====================================================

    if (req.method === "POST" && endpoint === "/login") {
        try {
            const data = await readRequestBody(req);

            const username = String(data.username || "").trim();
            const password = String(data.password || "");

            if (!username || !password) {
                sendJSON(res, 400, {
                    success: false,
                    message: "Username and password are required"
                });
                return;
            }

            const result = await runMain([
                "login",
                username,
                password
            ]);

            sendJSON(
                res,
                result.success ? 200 : 401,
                result
            );
        } catch (error) {
            sendJSON(res, 400, {
                success: false,
                message: error.message
            });
        }

        return;
    }

    // =====================================================
    // ROUTE
    // GET /route?source=...&destination=...
    // =====================================================

    if (req.method === "GET" && endpoint === "/route") {
        const source = (
            requestURL.searchParams.get("source") || ""
        ).trim();

        const destination = (
            requestURL.searchParams.get("destination") || ""
        ).trim();

        if (!source || !destination) {
            sendJSON(res, 400, {
                success: false,
                message: "Source and destination are required"
            });
            return;
        }

        try {
            console.log("[ROUTE] Source:", source);
            console.log("[ROUTE] Destination:", destination);

            const startLocation = await geocodeLocation(source);

            if (!startLocation) {
                sendJSON(res, 404, {
                    success: false,
                    message: "Source location could not be found"
                });
                return;
            }

            const endLocation = await geocodeLocation(destination);

            if (!endLocation) {
                sendJSON(res, 404, {
                    success: false,
                    message: "Destination location could not be found"
                });
                return;
            }

            const routes = await getRoutesFromOSRM(
                startLocation,
                endLocation
            );

            if (routes.length === 0) {
                sendJSON(res, 404, {
                    success: false,
                    message: "No road route found"
                });
                return;
            }

            const selectedRoute = routes[0];

            console.log(
                `[ROUTE] ${routes.length} route option(s) returned`
            );

            sendJSON(res, 200, {
                success: true,
                source,
                destination,

                sourceResolved: startLocation.displayName,
                destinationResolved: endLocation.displayName,

                // All route options for frontend cards.
                routes,

                // First route retained for older frontend code.
                selectedRoute: selectedRoute.id,
                distance: selectedRoute.distance,
                duration: selectedRoute.duration,
                path: selectedRoute.path,
                directions: selectedRoute.directions,
                roadNames: selectedRoute.roadNames,

                // No fabricated safety score.
                safetyScore: null,
                safetyLevel: "Not assessed",
                safetyMessage:
                    "Safety ranking requires verified safety data."
            });
        } catch (error) {
            console.error("[ROUTE ERROR]", error.message);

            sendJSON(res, 502, {
                success: false,
                message: "Could not retrieve route information",
                error: error.message
            });
        }

        return;
    }

    sendJSON(res, 404, {
        success: false,
        message: "Endpoint not found"
    });
});

// =========================================================
// START SERVER
// =========================================================

server.listen(PORT, () => {
    console.log("========================================");
    console.log("       SAFEHER BACKEND SERVER");
    console.log("========================================");
    console.log(`Server running at http://localhost:${PORT}`);
    console.log("Authentication: C++ main.exe");
    console.log("Geocoding: OpenStreetMap Nominatim");
    console.log("Routing: OSRM alternatives + directions");
    console.log("========================================");
});

server.on("error", error => {
    console.error("[SERVER ERROR]", error.message);

    if (error.code === "EADDRINUSE") {
        console.error(
            `Port ${PORT} is already in use. Stop the old server first.`
        );
    }
});
