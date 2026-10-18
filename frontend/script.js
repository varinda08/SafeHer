/* =========================================================
   SAFEHER FRONTEND — Connected Version
   Login + Signup + Profile + SOS + Multiple Road Routes
   + Turn-by-turn Directions + Leaflet Map
========================================================= */

const API_BASE_URL = "http://localhost:3000";

const quotes = [
    "Every journey begins with a little courage.",
    "Your safety is always worth choosing.",
    "Go confidently. Stay aware. Stay safe.",
    "A safer journey is a better journey.",
    "You deserve to feel safe wherever you go."
];

let detectedCoordinates = null;
let currentUser = null;

let map = null;
let routeLayers = [];
let startMarker = null;
let destinationMarker = null;

let availableRoutes = [];
let selectedRouteIndex = 0;
let currentRouteResult = null;
let currentSource = "";
let currentDestination = "";

const safeherLocations = {
    "graphic era university": [30.2734, 78.0406],
    "rajpur road": [30.2837, 78.0515],
    "clock tower": [30.3165, 78.0322],
    "paltan bazaar": [30.3180, 78.0290],
    "nehru colony": [30.2985, 78.0450],
    "patel nagar": [30.3080, 78.0170]
};

const popularLocations = Object.keys(safeherLocations)
    .map(key => key.replace(/\b\w/g, c => c.toUpperCase()));

/* ================= STARTUP ================= */

document.addEventListener("DOMContentLoaded", function () {
    showScreen("loginScreen");
    setRandomQuote();
    setTodayDate();
    setupForms();
    setupPasswordToggle();
    setupModalClosing();
    setupLocationSuggestions();
    setupSwapButton();
    addRouteInterfaceStyles();
});

/* ================= SCREENS ================= */

function showScreen(screenId) {
    document.querySelectorAll(".screen")
        .forEach(screen => screen.classList.remove("active"));

    const selected = document.getElementById(screenId);

    if (selected) {
        selected.classList.add("active");
    }

    const mainApp = document.getElementById("mainApp");

    if (mainApp) {
        if (screenId === "loginScreen") {
            mainApp.classList.add("hidden");
        } else {
            mainApp.classList.remove("hidden");
        }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (screenId === "resultsScreen") {
        setTimeout(() => {
            initializeMap();

            if (availableRoutes.length) {
                drawSelectedRoute();
            }
        }, 250);
    }
}

/* ================= QUOTE / DATE ================= */

function setRandomQuote() {
    const element = document.getElementById("quoteText");
    if (!element) return;

    element.textContent =
        `"${quotes[Math.floor(Math.random() * quotes.length)]}"`;
}

function setTodayDate() {
    const dateInput = document.getElementById("travelDate");
    if (!dateInput) return;

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    dateInput.value = `${year}-${month}-${day}`;
}

/* ================= FORMS ================= */

function setupForms() {
    document.getElementById("loginForm")
        ?.addEventListener("submit", event => {
            event.preventDefault();
            loginUser();
        });

    document.getElementById("signupForm")
        ?.addEventListener("submit", event => {
            event.preventDefault();
            createAccount();
        });

    document.getElementById("openSignup")
        ?.addEventListener("click", openSignup);

    document.getElementById("findRouteBtn")
        ?.addEventListener("click", findSafeRoute);

    document.getElementById("detectLocation")
        ?.addEventListener("click", detectLocation);

    document.getElementById("sosBtn")
        ?.addEventListener("click", activateSOS);
}

function setupPasswordToggle() {
    const button = document.getElementById("togglePassword");
    const input = document.getElementById("loginPassword");

    if (!button || !input) return;

    button.addEventListener("click", () => {
        if (input.type === "password") {
            input.type = "text";
            button.textContent = "Hide";
        } else {
            input.type = "password";
            button.textContent = "Show";
        }
    });
}

/* ================= LOGIN ================= */

async function loginUser() {
    const loginValue =
        document.getElementById("loginEmail").value.trim();

    const password =
        document.getElementById("loginPassword").value.trim();

    if (!loginValue || !password) {
        showToast("Please enter your login details.");
        return;
    }

    showToast("Logging in...");

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: loginValue,
                password
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                result.error ||
                "Invalid username or password."
            );
        }

        currentUser = result.user || {
            username: loginValue,
            email: loginValue
        };

        const pendingEmergency =
            sessionStorage.getItem("safeherPendingEmergency");

        if (pendingEmergency) {
            try {
                const emergency = JSON.parse(pendingEmergency);

                currentUser.emergencyName = emergency.emergencyName;
                currentUser.emergencyNumber = emergency.emergencyNumber;

                if (!currentUser.name) {
                    currentUser.name = emergency.name;
                }

                if (!currentUser.phone) {
                    currentUser.phone = emergency.phone;
                }

                if (!currentUser.email) {
                    currentUser.email = emergency.email;
                }

                sessionStorage.removeItem("safeherPendingEmergency");
            } catch (error) {
                console.log("Emergency information could not be restored.");
            }
        }

        loadProfileData();
        showToast("Welcome back!");

        setTimeout(() => showScreen("plannerScreen"), 500);

    } catch (error) {
        console.error("Login error:", error);

        showToast(
            error.message || "Unable to connect to SafeHer backend."
        );
    }
}

/* ================= SIGNUP ================= */

async function createAccount() {
    const name =
        document.getElementById("signupName").value.trim();

    const mobile =
        document.getElementById("signupMobile").value.trim();

    const email =
        document.getElementById("signupEmail").value.trim();

    const password =
        document.getElementById("signupPassword").value.trim();

    const emergencyName =
        document.getElementById("signupEmergencyName").value.trim();

    const emergencyNumber =
        document.getElementById("signupEmergencyNumber").value.trim();

    if (
        !name || !mobile || !email || !password ||
        !emergencyName || !emergencyNumber
    ) {
        showToast("Please fill all the details.");
        return;
    }

    const username = email;
    const userID = "SH" + Date.now();

    showToast("Creating your account...");

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userID,
                username,
                name,
                email,
                phone: mobile,
                password,
                emergencyName,
                emergencyNumber
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.message ||
                result.error ||
                "Account creation failed."
            );
        }

        sessionStorage.setItem(
            "safeherPendingEmergency",
            JSON.stringify({
                name,
                phone: mobile,
                email,
                emergencyName,
                emergencyNumber
            })
        );

        showToast("Account created successfully.");
        closeSignup();

        document.getElementById("loginEmail").value = username;
        document.getElementById("loginPassword").value = password;

        setTimeout(loginUser, 700);

    } catch (error) {
        console.error("Signup error:", error);

        showToast(error.message || "Unable to create account.");
    }
}

/* ================= MODALS ================= */

function openSignup() {
    document.getElementById("signupModal")
        ?.classList.add("active");
}

function closeSignup() {
    document.getElementById("signupModal")
        ?.classList.remove("active");
}

function openProfile() {
    loadProfileData();

    document.getElementById("profileModal")
        ?.classList.add("active");
}

function closeProfile() {
    document.getElementById("profileModal")
        ?.classList.remove("active");
}

function setupModalClosing() {
    window.addEventListener("click", event => {
        const signupModal = document.getElementById("signupModal");
        const profileModal = document.getElementById("profileModal");

        if (signupModal && event.target === signupModal) {
            closeSignup();
        }

        if (profileModal && event.target === profileModal) {
            closeProfile();
        }
    });
}

/* ================= PROFILE ================= */

function loadProfileData() {
    if (!currentUser) return;

    setText(
        "profileName",
        currentUser.name || currentUser.username || "SafeHer User"
    );

    setText("profileNameInfo", currentUser.name || "-");

    setText(
        "profileMobile",
        currentUser.phone || currentUser.mobile || "-"
    );

    setText("profileEmail", currentUser.email || "-");

    const emergency =
        currentUser.emergencyName && currentUser.emergencyNumber
            ? `${currentUser.emergencyName} • ${currentUser.emergencyNumber}`
            : "Not available";

    setText("profileEmergency", emergency);

    setText(
        "emergencyContactText",
        currentUser.emergencyName && currentUser.emergencyNumber
            ? emergency
            : "Emergency contact not available."
    );
}

function logout() {
    currentUser = null;

    sessionStorage.removeItem("safeherPendingEmergency");

    closeProfile();

    setValue("loginEmail", "");
    setValue("loginPassword", "");

    showScreen("loginScreen");
    showToast("You have been logged out.");
}

/* ================= LOCATION ================= */

function detectLocation() {
    const status = document.getElementById("locationStatus");
    if (!status) return;

    if (!navigator.geolocation) {
        status.textContent =
            "Location detection is not supported by this browser.";
        return;
    }

    status.textContent = "Detecting your location...";

    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            detectedCoordinates = { latitude, longitude };

            status.textContent =
                `Location detected: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            const sourceInput = document.getElementById("source");

            if (sourceInput) {
                sourceInput.value =
                    `${latitude}, ${longitude}`;
            }

            showToast("Current location detected.");
        },
        () => {
            status.textContent =
                "Location permission unavailable. Enter your location manually.";

            showToast("Could not detect location.");
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

/* ================= MAP INITIALIZATION ================= */

function initializeMap() {
    const mapElement = document.getElementById("map");

    if (!mapElement) {
        console.error("Map element with id='map' was not found.");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet has not been loaded.");
        showToast("Map library could not be loaded.");
        return;
    }

    if (!map) {
        map = L.map("map").setView([30.3165, 78.0322], 13);

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution: "&copy; OpenStreetMap contributors",
                maxZoom: 19
            }
        ).addTo(map);
    }

    setTimeout(() => {
        if (map) map.invalidateSize();
    }, 250);
}

/* ================= ROUTE HELPERS ================= */

function getLocationCoordinates(name) {
    if (!name) return null;

    return safeherLocations[name.toLowerCase().trim()] || null;
}

function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "";
    }
}

function setValue(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.value = value;
    }
}

function getRouteDistance(route) {
    const distance = route?.distance;

    if (distance === null || distance === undefined || distance === "") {
        return null;
    }

    if (typeof distance === "string") {
        return distance;
    }

    // OSRM raw distances are in metres.
    // The connected backend may already return kilometres.
    if (distance > 1000) {
        return `${(distance / 1000).toFixed(2)} km`;
    }

    return `${Number(distance).toFixed(2)} km`;
}

function getRouteDuration(route) {
    const duration = route?.duration;

    if (duration === null || duration === undefined || duration === "") {
        return "Not provided";
    }

    if (typeof duration === "string") {
        return duration;
    }

    // OSRM raw duration is in seconds.
    // A small number may already represent minutes.
    let minutes = duration > 3000
        ? Math.round(duration / 60)
        : Math.round(duration);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    minutes = minutes % 60;

    return minutes
        ? `${hours} hr ${minutes} min`
        : `${hours} hr`;
}

/*
  Prefer full route geometry from the routing API.
  GeoJSON coordinates use [longitude, latitude].
  Leaflet expects [latitude, longitude].
*/

function normalizeRoutePath(route) {
    // Prefer the routing API's full road geometry when available.
    let path =
        route?.geometry?.coordinates ||
        route?.geometry?.geometry?.coordinates;

    // If geometry is unavailable, use the backend's path field.
    if (!Array.isArray(path) || !path.length) {
        path = route?.path;
    }

    if (!Array.isArray(path)) return [];

    return path
        .map(point => {
            if (Array.isArray(point) && point.length >= 2) {
                const first = Number(point[0]);
                const second = Number(point[1]);

                if (
                    !Number.isFinite(first) ||
                    !Number.isFinite(second)
                ) {
                    return null;
                }

                // Dehradun latitude is around 30, longitude around 78.
                // Convert [longitude, latitude] to [latitude, longitude].
                if (Math.abs(first) > 50) {
                    return [second, first];
                }

                return [first, second];
            }

            if (point && typeof point === "object") {
                const lat = Number(point.lat ?? point.latitude);
                const lng = Number(
                    point.lng ?? point.lon ?? point.longitude
                );

                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    return [lat, lng];
                }
            }

            return null;
        })
        .filter(Boolean);
}

function getRouteDirections(route) {
    if (Array.isArray(route?.directions)) {
        return route.directions;
    }

    if (Array.isArray(route?.steps)) {
        return route.steps;
    }

    if (Array.isArray(route?.legs)) {
        return route.legs.flatMap(leg => leg.steps || []);
    }

    return [];
}

/* ================= SEARCH ROUTE ================= */

async function findSafeRoute() {
    const sourceInput = document.getElementById("source");
    const destinationInput = document.getElementById("destination");

    const source = sourceInput?.value.trim() || "";
    const destination = destinationInput?.value.trim() || "";

    const errorElement = document.getElementById("routeError");
    const button = document.getElementById("findRouteBtn");

    if (errorElement) errorElement.textContent = "";

    if (!source) {
        if (errorElement) {
            errorElement.textContent =
                "Please enter your starting point.";
        }

        return;
    }

    if (!destination) {
        if (errorElement) {
            errorElement.textContent =
                "Please enter your destination.";
        }

        return;
    }

    if (source.toLowerCase() === destination.toLowerCase()) {
        if (errorElement) {
            errorElement.textContent =
                "Starting point and destination cannot be the same.";
        }

        return;
    }

    if (button) {
        button.disabled = true;
        button.classList.add("loading");
        button.textContent = "Finding road routes...";
    }

    try {
        const url =
            `${API_BASE_URL}/route` +
            `?source=${encodeURIComponent(source)}` +
            `&destination=${encodeURIComponent(destination)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(
                result.message ||
                result.error ||
                "Route could not be found."
            );
        }

        currentRouteResult = result;
        currentSource = source;
        currentDestination = destination;

        /*
          The backend's routes array contains alternatives.
          If only the older single-route format is returned,
          use that one route as a fallback.
        */

        if (Array.isArray(result.routes) && result.routes.length) {
            availableRoutes = result.routes;
        } else {
            availableRoutes = [{
                id: "route-1",
                label: "Available road route",
                distance: result.distance,
                duration: result.duration,
                path: result.path,
                geometry: result.geometry,
                directions: result.directions || [],
                roadNames: result.roadNames || []
            }];
        }

        availableRoutes = availableRoutes.filter(route =>
            normalizeRoutePath(route).length >= 2
        );

        if (!availableRoutes.length) {
            throw new Error(
                "The backend returned no usable road geometry. " +
                "Please check the /route response in your backend."
            );
        }

        selectedRouteIndex = 0;

        displayRouteResult(result, source, destination);

        showScreen("resultsScreen");

        setTimeout(() => {
            initializeMap();
            drawSelectedRoute();
            renderRouteOptions();
            renderTurnByTurnDirections();
        }, 350);

    } catch (error) {
        console.error("Route error:", error);

        if (errorElement) {
            errorElement.textContent =
                error.message || "Backend connection failed.";
        }

        showToast(error.message || "Could not find route.");

    } finally {
        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
            button.innerHTML = `Search Safe Route <span>→</span>`;
        }
    }
}

/* ================= ROUTE RESULT SUMMARY ================= */

function displayRouteResult(result, source, destination) {
    const route = availableRoutes[selectedRouteIndex] || {};

    const distance =
        getRouteDistance(route) ||
        getRouteDistance(result) ||
        "Not provided";

    setText("routeDistance", distance);

    setText(
        "routePath",
        "Your selected road route is shown on the map. " +
        "Choose another available route below to compare it."
    );

    setText(
        "routeSummary",
        `${source} → ${destination} • ${distance} road distance`
    );

    setText(
        "routeCount",
        `${availableRoutes.length} road route${availableRoutes.length === 1 ? "" : "s"} found`
    );

    // Never show a made-up safety score.
    const score = result.safetyScore;

    if (score !== undefined && score !== null && score !== "") {
        setText("routeScore", score);
        setText("routeSafety", result.safetyLevel || "Not assessed");
    } else {
        setText("routeScore", "--");
        setText("routeSafety", "Not assessed");
    }

    setText(
        "safetyLevelText",
        String(result.safetyLevel || "NOT ASSESSED").toUpperCase()
    );
}

/* ================= DYNAMIC ROUTE UI ================= */

function addRouteInterfaceStyles() {
    if (document.getElementById("safeherRouteStyles")) return;

    const style = document.createElement("style");
    style.id = "safeherRouteStyles";

    style.textContent = `
        #safeherRouteChoices,
        #safeherDirections {
            margin: 22px 0;
            padding: 20px;
            border-radius: 16px;
            background: var(--card-bg, #ffffff);
            border: 1px solid rgba(100, 100, 100, 0.16);
            color: var(--text-color, #222222);
        }

        #safeherRouteChoices h3,
        #safeherDirections h3 {
            margin: 0 0 8px;
        }

        .safeher-section-note {
            margin: 0 0 16px;
            font-size: 13px;
            opacity: 0.72;
            line-height: 1.5;
        }

        .safeher-route-option {
            display: block;
            width: 100%;
            text-align: left;
            margin-top: 10px;
            padding: 15px;
            border: 1px solid #dedede;
            border-radius: 12px;
            background: transparent;
            cursor: pointer;
            color: inherit;
            transition: border-color 0.2s, background 0.2s;
        }

        .safeher-route-option:hover {
            border-color: #bd668a;
        }

        .safeher-route-option.selected {
            border: 2px solid #bd668a;
            background: rgba(189, 102, 138, 0.08);
        }

        .safeher-route-option-title {
            font-weight: 700;
            margin-bottom: 7px;
        }

        .safeher-route-option-details {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
            font-size: 13px;
            opacity: 0.85;
        }

        .safeher-route-option-status {
            margin-top: 8px;
            font-size: 12px;
            font-weight: 600;
            color: #a34d75;
        }

        .safeher-direction-step {
            display: flex;
            gap: 12px;
            padding: 13px 0;
            border-bottom: 1px solid rgba(120,120,120,0.18);
        }

        .safeher-direction-step:last-child {
            border-bottom: none;
        }

        .safeher-direction-number {
            flex: 0 0 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(189, 102, 138, 0.13);
            font-weight: 700;
            font-size: 13px;
        }

        .safeher-direction-text {
            min-width: 0;
            line-height: 1.5;
            font-size: 14px;
        }

        .safeher-direction-road {
            display: block;
            margin-top: 4px;
            font-size: 12px;
            opacity: 0.7;
        }

        .safeher-no-directions {
            padding: 12px 0;
            font-size: 14px;
            line-height: 1.6;
            opacity: 0.75;
        }
    `;

    document.head.appendChild(style);
}

function ensureRouteInterface() {
    addRouteInterfaceStyles();

    const resultsScreen = document.getElementById("resultsScreen");

    if (!resultsScreen) return;

    let choices = document.getElementById("safeherRouteChoices");
    let directions = document.getElementById("safeherDirections");

    if (!choices) {
        choices = document.createElement("section");
        choices.id = "safeherRouteChoices";

        choices.innerHTML = `
            <h3>Available road routes</h3>
            <p class="safeher-section-note">
                Select a route to display it on the map and view its directions.
            </p>
            <div id="safeherRouteOptions"></div>
        `;

        const mapElement = document.getElementById("map");

        if (mapElement) {
            mapElement.insertAdjacentElement("afterend", choices);
        } else {
            resultsScreen.appendChild(choices);
        }
    }

    if (!directions) {
        directions = document.createElement("section");
        directions.id = "safeherDirections";

        directions.innerHTML = `
            <h3>Turn-by-turn directions</h3>
            <p class="safeher-section-note" id="safeherDirectionsSummary">
                Directions for your selected route.
            </p>
            <div id="safeherDirectionsList"></div>
        `;

        choices.insertAdjacentElement("afterend", directions);
    }
}

/* ================= ROUTE OPTIONS ================= */

function renderRouteOptions() {
    ensureRouteInterface();

    const container = document.getElementById("safeherRouteOptions");
    if (!container) return;

    container.replaceChildren();

    availableRoutes.forEach((route, index) => {
        const button = document.createElement("button");

        button.type = "button";

        button.className =
            "safeher-route-option" +
            (index === selectedRouteIndex ? " selected" : "");

        const title = document.createElement("div");
        title.className = "safeher-route-option-title";

        title.textContent =
            route.label ||
            route.name ||
            `Road route ${index + 1}`;

        const details = document.createElement("div");
        details.className = "safeher-route-option-details";

        const distance = document.createElement("span");
        distance.textContent =
            `Distance: ${getRouteDistance(route) || "Not provided"}`;

        const duration = document.createElement("span");
        duration.textContent =
            `Estimated time: ${getRouteDuration(route)}`;

        details.append(distance, duration);

        const status = document.createElement("div");
        status.className = "safeher-route-option-status";

        status.textContent =
            index === selectedRouteIndex
                ? "✓ Currently selected"
                : "Select this route →";

        button.append(title, details, status);

        button.addEventListener("click", () => {
            selectedRouteIndex = index;

            renderRouteOptions();
            drawSelectedRoute();
            renderTurnByTurnDirections();
            updateSelectedRouteSummary();

            showToast(`Route ${index + 1} selected.`);
        });

        container.appendChild(button);
    });
}

function selectRoute(index) {
    if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= availableRoutes.length
    ) {
        return;
    }

    selectedRouteIndex = index;

    renderRouteOptions();
    drawSelectedRoute();
    renderTurnByTurnDirections();
    updateSelectedRouteSummary();
}

function updateSelectedRouteSummary() {
    const route = availableRoutes[selectedRouteIndex];
    if (!route) return;

    const distance = getRouteDistance(route) || "Not provided";

    setText("routeDistance", distance);

    setText(
        "routeSummary",
        `${currentSource} → ${currentDestination} • ${distance} road distance`
    );

    setText(
        "routePath",
        "Your selected road route is displayed on the map above."
    );
}

/* ================= DRAW SELECTED ROAD ROUTE ================= */

function drawSelectedRoute() {
    if (!map) {
        initializeMap();
    }

    if (!map) return;

    const route = availableRoutes[selectedRouteIndex];
    if (!route) return;

    const path = normalizeRoutePath(route);

    if (path.length < 2) {
        showToast("Road geometry is not available for this route.");
        return;
    }

    // Remove old route lines.
    routeLayers.forEach(layer => map.removeLayer(layer));
    routeLayers = [];

    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }

    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }

    // Draw the selected road route.
    const routeLine = L.polyline(path, {
        color: "#bd668a",
        weight: 6,
        opacity: 0.9,
        lineJoin: "round"
    }).addTo(map);

    routeLayers.push(routeLine);

    // Mark the route's actual first and last coordinates.
    startMarker = L.marker(path[0])
        .addTo(map)
        .bindPopup(`<b>Start</b><br>${escapeHTML(currentSource)}`);

    destinationMarker = L.marker(path[path.length - 1])
        .addTo(map)
        .bindPopup(`<b>Destination</b><br>${escapeHTML(currentDestination)}`);

    const bounds = routeLine.getBounds();

    if (bounds.isValid()) {
        map.fitBounds(bounds, {
            padding: [35, 35],
            maxZoom: 16
        });
    }

    setTimeout(() => map.invalidateSize(), 150);
}

/* ================= TURN-BY-TURN DIRECTIONS ================= */

function renderTurnByTurnDirections() {
    ensureRouteInterface();

    const container = document.getElementById("safeherDirectionsList");
    if (!container) return;

    container.replaceChildren();

    const route = availableRoutes[selectedRouteIndex];

    if (!route) {
        container.textContent = "No route is selected.";
        return;
    }

    const directions = getRouteDirections(route);

    setText(
        "safeherDirectionsSummary",
        `${currentSource} → ${currentDestination} • ` +
        `${getRouteDistance(route) || "Distance unavailable"} • ` +
        `${getRouteDuration(route)}`
    );

    if (!directions.length) {
        const message = document.createElement("div");
        message.className = "safeher-no-directions";

        message.textContent =
            "Turn-by-turn directions were not returned by the backend. " +
            "Check that the /route API requests OSRM steps=true and returns " +
            "each route's directions array.";

        container.appendChild(message);
        return;
    }

    directions.forEach((step, index) => {
        const row = document.createElement("div");
        row.className = "safeher-direction-step";

        const number = document.createElement("div");
        number.className = "safeher-direction-number";
        number.textContent = String(index + 1);

        const textBox = document.createElement("div");
        textBox.className = "safeher-direction-text";

        const instruction =
            step.instruction ||
            step.text ||
            step.description ||
            step.maneuver?.instruction ||
            "Continue along the road";

        const instructionText = document.createElement("div");
        instructionText.textContent = instruction;

        textBox.appendChild(instructionText);

        const roadName =
            step.roadName ||
            step.road ||
            step.name ||
            step.ref ||
            "";

        const distance = formatStepDistance(step.distance);
        const duration = formatStepDuration(step.duration);

        const metadata = [];

        if (roadName) {
            metadata.push(roadName);
        }

        if (distance) {
            metadata.push(distance);
        }

        if (duration) {
            metadata.push(duration);
        }

        if (metadata.length) {
            const road = document.createElement("span");
            road.className = "safeher-direction-road";
            road.textContent = metadata.join(" • ");

            textBox.appendChild(road);
        }

        row.append(number, textBox);
        container.appendChild(row);
    });
}

function formatStepDistance(distance) {
    if (distance === undefined || distance === null || distance === "") {
        return "";
    }

    if (typeof distance === "string") {
        return distance;
    }

    if (distance >= 1000) {
        return `${(distance / 1000).toFixed(2)} km`;
    }

    return `${Math.round(distance)} m`;
}

function formatStepDuration(duration) {
    if (duration === undefined || duration === null || duration === "") {
        return "";
    }

    if (typeof duration === "string") {
        return duration;
    }

    return `${Math.max(1, Math.round(duration / 60))} min`;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

/* ================= LOCATION SUGGESTIONS ================= */

function setupLocationSuggestions() {
    const sourceInput = document.getElementById("source");
    const destinationInput = document.getElementById("destination");

    const sourceBox = document.getElementById("sourceSuggestions");
    const destinationBox =
        document.getElementById("destinationSuggestions");

    if (!sourceInput || !destinationInput ||
        !sourceBox || !destinationBox) {
        return;
    }

    function showSuggestions(inputElement, boxElement) {
        const value = inputElement.value.trim().toLowerCase();

        const matches = popularLocations.filter(location =>
            location.toLowerCase().includes(value)
        );

        boxElement.innerHTML = "";

        if (matches.length === 0) {
            const empty = document.createElement("div");
            empty.className = "suggestion-empty";
            empty.textContent = "No matching suggested location";

            boxElement.appendChild(empty);
        } else {
            matches.forEach(location => {
                const item = document.createElement("div");
                item.className = "suggestion-item";

                const icon = document.createElement("span");
                icon.textContent = "⌖";

                item.append(icon, document.createTextNode(` ${location}`));

                item.addEventListener("click", () => {
                    inputElement.value = location;
                    boxElement.classList.add("hidden");
                });

                boxElement.appendChild(item);
            });
        }

        boxElement.classList.remove("hidden");
    }

    sourceInput.addEventListener("focus", () =>
        showSuggestions(sourceInput, sourceBox)
    );

    sourceInput.addEventListener("input", () =>
        showSuggestions(sourceInput, sourceBox)
    );

    destinationInput.addEventListener("focus", () =>
        showSuggestions(destinationInput, destinationBox)
    );

    destinationInput.addEventListener("input", () =>
        showSuggestions(destinationInput, destinationBox)
    );

    document.addEventListener("click", event => {
        if (!sourceBox.contains(event.target) &&
            event.target !== sourceInput) {
            sourceBox.classList.add("hidden");
        }

        if (!destinationBox.contains(event.target) &&
            event.target !== destinationInput) {
            destinationBox.classList.add("hidden");
        }
    });
}

/* ================= SWAP LOCATIONS ================= */

function setupSwapButton() {
    const swapButton = document.getElementById("swapLocations");
    const sourceInput = document.getElementById("source");
    const destinationInput = document.getElementById("destination");

    if (!swapButton || !sourceInput || !destinationInput) {
        return;
    }

    swapButton.addEventListener("click", () => {
        const temporary = sourceInput.value;

        sourceInput.value = destinationInput.value;
        destinationInput.value = temporary;

        showToast("Locations swapped.");
    });
}

function setQuickDestination(locationName) {
    const destinationInput = document.getElementById("destination");

    if (!destinationInput) return;

    destinationInput.value = locationName;

    showToast(`Destination set: ${locationName}`);
}

/* ================= SOS ================= */

function activateSOS() {
    if (!currentUser) {
        showToast("Please login before using SOS.");
        return;
    }

    const sosButton = document.getElementById("sosBtn");

    if (sosButton) {
        sosButton.disabled = true;
        sosButton.textContent = "SOS ACTIVATED";
    }

    showToast(
        "SOS activated. Please use your local emergency service if in danger."
    );

    setTimeout(() => {
        if (sosButton) {
            sosButton.disabled = false;
            sosButton.innerHTML = `<span>⚠</span> ACTIVATE SOS`;
        }
    }, 3000);
}

function detectEmergencyLocation() {
    const element = document.getElementById("emergencyLocation");
    if (!element) return;

    if (!navigator.geolocation) {
        element.textContent = "Location detection is not supported.";
        return;
    }

    element.textContent = "Detecting location...";

    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            detectedCoordinates = { latitude, longitude };

            element.textContent =
                `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

            showToast("Emergency location detected.");
        },
        () => {
            element.textContent =
                "Could not detect current location.";
        }
    );
}

function callTrustedContact() {
    if (!currentUser) {
        showToast("Please login first.");
        return;
    }

    const number = currentUser.emergencyNumber;

    if (!number) {
        showToast("Emergency contact number is not available.");
        return;
    }

    showToast("Opening your phone app...");

    setTimeout(() => {
        window.location.href = "tel:" + number;
    }, 500);
}

/* ================= TOAST ================= */

function showToast(message) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}