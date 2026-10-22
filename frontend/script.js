/* =========================================================
   SAFEHER FRONTEND — Connected Version
   Login + Signup + Profile + SOS + Multiple Road Routes
   + Turn-by-turn Directions + Leaflet Map + Safety Overview
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
    "graphic era university": [30.2679, 77.9961],
    "clement town": [30.2580, 78.0000],
    "isbt": [30.2892, 78.0485],
    "patel nagar": [30.3080, 78.0170],
    "nehru colony": [30.2985, 78.0450],
    "railway station": [30.3255, 78.0322],
    "clock tower": [30.3165, 78.0322],
    "paltan bazaar": [30.3180, 78.0290],
    "parade ground": [30.3210, 78.0410],
    "fri": [30.3350, 78.0040],
    "sai mandir": [30.3798, 78.0875],
    "sahastradhara road": [30.3650, 78.0750],
    "pacific mall": [30.3663, 78.0705],
    "rajpur road": [30.3580, 78.0666]
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
    if (selected) selected.classList.add("active");

    const mainApp = document.getElementById("mainApp");
    if (mainApp) {
        mainApp.classList.toggle("hidden", screenId === "loginScreen");
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

    if (element) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        element.textContent = `"${randomQuote}"`;
    }
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
        ?.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("1. Login button clicked");
            loginUser()
                .then(() => console.log("3. loginUser finished"))
                .catch(error => console.error("Login function error:", error));
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

    //document.getElementById("sosBtn")
    // ?.addEventListener("click", activateSOS);
}

function setupPasswordToggle() {
    const button = document.getElementById("togglePassword");
    const input = document.getElementById("loginPassword");

    if (!button || !input) return;

    button.addEventListener("click", () => {
        const showing = input.type === "password";
        input.type = showing ? "text" : "password";
        button.textContent = showing ? "Hide" : "Show";
    });
}

/* ================= LOGIN ================= */
/* ================= LOGIN ================= */

async function loginUser() {
    const loginValue =
        document.getElementById("loginEmail")?.value.trim() || "";

    const password =
        document.getElementById("loginPassword")?.value.trim() || "";

    if (!loginValue || !password) {
        showToast("Please enter your login details.");
        return;
    }

    showToast("Logging in...");

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: loginValue,
                password: password
            })
        });

        const result = await response.json();

        if (!response.ok || result.success === false) {
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

        showToast("Login successful.");
        showScreen("plannerScreen");

    } catch (error) {
        console.error("Login error:", error);
        showToast(error.message || "Unable to log in.");
    }
}
/* ================= SIGNUP ================= */

async function createAccount() {
    const name =
        document.getElementById("signupName")?.value.trim() || "";
    const mobile =
        document.getElementById("signupMobile")?.value.trim() || "";
    const email =
        document.getElementById("signupEmail")?.value.trim() || "";
    const password =
        document.getElementById("signupPassword")?.value.trim() || "";
    const emergencyName =
        document.getElementById("signupEmergencyName")?.value.trim() || "";
    const emergencyNumber =
        document.getElementById("signupEmergencyNumber")?.value.trim() || "";

    if (!name || !mobile || !email || !password ||
        !emergencyName || !emergencyNumber) {
        showToast("Please fill all the details.");
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("Please enter a valid email address.");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        showToast("Please enter a valid 10-digit mobile number.");
        return;
    }

    if (password.length < 6) {
        showToast("Password must be at least 6 characters long.");
        return;
    }

    const username = email;
    const userID = "SH" + Date.now();

    showToast("Creating your account...");

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
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

        if (!response.ok || result.success === false) {
            throw new Error(
                result.message ||
                result.error ||
                "Account creation failed."
            );
        }

        sessionStorage.setItem("safeherPendingEmergency", JSON.stringify({
            name,
            phone: mobile,
            email,
            emergencyName,
            emergencyNumber
        }));

        showToast("Account created successfully.");
        closeSignup();

        const loginEmail = document.getElementById("loginEmail");
        const loginPassword = document.getElementById("loginPassword");

        if (loginEmail) loginEmail.value = username;
        if (loginPassword) loginPassword.value = password;

        setTimeout(loginUser, 700);
    } catch (error) {
        console.error("Signup error:", error);
        showToast(
            error.message ||
            "Unable to create account."
        );
    }
}

/* ================= MODALS ================= */

function openSignup() {
    document.getElementById("signupModal")?.classList.add("active");
}

function closeSignup() {
    document.getElementById("signupModal")?.classList.remove("active");
}

function openProfile() {
    loadProfileData();
    document.getElementById("profileModal")?.classList.add("active");
}

function closeProfile() {
    document.getElementById("profileModal")?.classList.remove("active");
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
    setText("profileMobile", currentUser.phone || currentUser.mobile || "-");
    setText("profileEmail", currentUser.email || "-");

    const hasEmergency =
        currentUser.emergencyName && currentUser.emergencyNumber;

    const emergency = hasEmergency
        ? `${currentUser.emergencyName} • ${currentUser.emergencyNumber}`
        : "Not available";

    setText("profileEmergency", emergency);

    setText(
        "emergencyContactText",
        hasEmergency
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
                sourceInput.value = `${latitude}, ${longitude}`;
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
        if (map) {
            map.invalidateSize();
        }
    }, 250);
}

function drawSelectedRoute() {
    if (!map || typeof L === "undefined") {
        console.error("Map is not initialized.");
        return;
    }

    const route = availableRoutes[selectedRouteIndex];

    if (!route) {
        console.error("No route is selected.");
        return;
    }

    const coordinates = normalizeRoutePath(route);

    if (coordinates.length < 2) {
        console.error("Route coordinates are missing.");
        return;
    }

    routeLayers.forEach(function (layer) {
        map.removeLayer(layer);
    });
    routeLayers = [];

    if (startMarker) {
        map.removeLayer(startMarker);
        startMarker = null;
    }

    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }

    const routeLine = L.polyline(coordinates, {
        color: "#e75480",
        weight: 6,
        opacity: 0.9
    }).addTo(map);

    routeLayers.push(routeLine);

    startMarker = L.marker(coordinates[0])
        .addTo(map)
        .bindPopup("Starting point: " + currentSource);

    destinationMarker = L.marker(coordinates[coordinates.length - 1])
        .addTo(map)
        .bindPopup("Destination: " + currentDestination);

    map.fitBounds(routeLine.getBounds(), {
        padding: [30, 30]
    });
}

/* ================= MULTIPLE ROUTE OPTIONS ================= */

function renderRouteOptions() {
    const panel = document.querySelector(".routes-panel");

    if (!panel || !availableRoutes.length) {
        console.warn("Route panel or route data is missing.");
        return;
    }

    // Remove the old single-route card.
    const oldCard = panel.querySelector(".route-result-card");
    if (oldCard) oldCard.remove();

    // Create the route list only once.
    let list = document.getElementById("routeOptionsList");

    if (!list) {
        list = document.createElement("div");
        list.id = "routeOptionsList";
        panel.appendChild(list);
    }

    list.replaceChildren();

    setText(
        "routeCount",
        `${availableRoutes.length} road route${availableRoutes.length === 1 ? "" : "s"} found`
    );

    availableRoutes.forEach((route, index) => {
        const isSelected = index === selectedRouteIndex;

        const card = document.createElement("article");
        card.className = "route-result-card" +
            (isSelected ? " recommended selected-route" : "");

        const heading = document.createElement("div");
        heading.className = "route-card-top";

        const titleBox = document.createElement("div");

        const label = document.createElement("span");
        label.className = "recommended-label";
        label.textContent = isSelected ? "SELECTED ROUTE" : `ROUTE ${index + 1}`;

        const title = document.createElement("h3");
        title.textContent = route.label || `Route ${index + 1}`;

        titleBox.append(label, title);

        const phaseLabel = document.createElement("span");
        phaseLabel.className = "route-phase-label";
        phaseLabel.textContent = "ROUTE OPTION";

        heading.append(titleBox, phaseLabel);

        const stats = document.createElement("div");
        stats.className = "route-stats";

        const distanceBox = document.createElement("div");
        const distanceLabel = document.createElement("span");
        distanceLabel.textContent = "Distance";

        const distanceValue = document.createElement("strong");
        distanceValue.textContent =
            route.distance != null
                ? `${Number(route.distance).toFixed(2)} km`
                : "Unavailable";

        distanceBox.append(distanceLabel, distanceValue);

        const timeBox = document.createElement("div");
        const timeLabel = document.createElement("span");
        timeLabel.textContent = "Estimated time";

        const timeValue = document.createElement("strong");
        timeValue.textContent =
            route.duration != null
                ? `${route.duration} min`
                : "Unavailable";

        timeBox.append(timeLabel, timeValue);
        stats.append(distanceBox, timeBox);

        const pathBox = document.createElement("div");
        pathBox.className = "path-box";

        const pathLabel = document.createElement("span");
        pathLabel.textContent = "Main roads";

        const pathText = document.createElement("p");
        pathText.textContent =
            Array.isArray(route.roadNames) && route.roadNames.length
                ? route.roadNames.join(" → ")
                : "Road names unavailable";

        pathBox.append(pathLabel, pathText);

        const safetyNote = document.createElement("p");
        safetyNote.className = "route-safety-note";
        safetyNote.textContent =
            "Route-wise safety analysis is planned for Phase 3.";

        const button = document.createElement("button");
        button.className = "select-route-btn";
        button.type = "button";
        button.textContent = isSelected
            ? "Selected ✓"
            : "View this route →";
        button.addEventListener("click", () => {
            selectedRouteIndex = index;

            // Highlight the selected route on the map.
            drawSelectedRoute();

            // Update the route cards and directions.
            renderRouteOptions();
            renderTurnByTurnDirections();
        });
        card.append(heading, stats, pathBox, safetyNote, button);
        list.appendChild(card);
    });
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

    let minutes =
        duration > 3000
            ? Math.round(duration / 60)
            : Math.round(duration);

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    minutes %= 60;

    return minutes
        ? `${hours} hr ${minutes} min`
        : `${hours} hr`;
}

function normalizeRoutePath(route) {
    let path =
        route?.geometry?.coordinates ||
        route?.geometry?.geometry?.coordinates;

    if (!Array.isArray(path) || !path.length) {
        path = route?.path;
    }

    if (!Array.isArray(path)) {
        return [];
    }

    return path
        .map(point => {
            if (Array.isArray(point) && point.length >= 2) {
                const first = Number(point[0]);
                const second = Number(point[1]);

                if (!Number.isFinite(first) || !Number.isFinite(second)) {
                    return null;
                }

                if (Math.abs(first) > 50) {
                    return [second, first];
                }

                return [first, second];
            }

            if (point && typeof point === "object") {
                const lat = Number(point.lat ?? point.latitude);
                const lng = Number(point.lng ?? point.lon ?? point.longitude);

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

    if (errorElement) {
        errorElement.textContent = "";
    }

    if (!source) {
        if (errorElement) {
            errorElement.textContent = "Please enter your starting point.";
        }
        return;
    }

    if (!destination) {
        if (errorElement) {
            errorElement.textContent = "Please enter your destination.";
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

        if (!response.ok || result.error || result.success === false) {
            throw new Error(
                result.message ||
                result.error ||
                "Route could not be found."
            );
        }

        currentRouteResult = result;
        currentSource = source;
        currentDestination = destination;

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
                "The backend returned no usable road geometry. Please check the /route response."
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

        showToast(
            error.message ||
            "Could not find route."
        );
    } finally {
        if (button) {
            button.disabled = false;
            button.classList.remove("loading");
            button.innerHTML = `Search Safe Route <span>→</span>`;
        }
    }
}

/* ================= ROUTE RESULT + SAFETY OVERVIEW ================= */

function displayRouteResult(result, source, destination) {
    const route = availableRoutes[selectedRouteIndex] || {};
    const distance =
        getRouteDistance(route) ||
        getRouteDistance(result) ||
        "Not provided";

    setText("routeDistance", distance);

    setText(
        "routePath",
        "Your selected road route is shown on the map. Choose another available route below to compare it."
    );

    setText(
        "routeSummary",
        `${source} → ${destination} • ${distance} road distance`
    );

    setText(
        "routeCount",
        `${availableRoutes.length} road route${availableRoutes.length === 1 ? "" : "s"} found`
    );

    const score = result.safetyScore;
    const hasScore =
        score !== undefined &&
        score !== null &&
        score !== "";

    setText("routeScore", hasScore ? `${score}/10` : "--");
    setText(
        "routeSafety",
        hasScore ? (result.safetyLevel || "Not assessed") : "Not assessed"
    );

    setText(
        "safetyLevelText",
        String(result.safetyLevel || "NOT ASSESSED").toUpperCase()
    );

    renderSafetyOverview(result);
    renderPublicTransport(result);
}

function renderSafetyOverview(result) {
    let panel = document.getElementById("safeherSafetyDetails");

    if (!panel) {
        panel = document.createElement("section");
        panel.id = "safeherSafetyDetails";
        panel.className = "safeher-safety-details";

        const mapElement = document.getElementById("map");

        if (mapElement) {
            mapElement.insertAdjacentElement("afterend", panel);
        } else {
            document.getElementById("resultsScreen")?.appendChild(panel);
        }
    }

    panel.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = "Safety Overview";
    panel.appendChild(heading);

    const hasScore =
        result.safetyScore !== undefined &&
        result.safetyScore !== null &&
        result.safetyScore !== "";

    const scoreLine = document.createElement("p");
    scoreLine.className = "safeher-safety-score";
    scoreLine.textContent = hasScore
        ? `Safety score: ${result.safetyScore}/10 — ${result.safetyLevel || "Not assessed"}`
        : "Safety score is not available.";

    panel.appendChild(scoreLine);

    const grid = document.createElement("div");
    grid.className = "safeher-safety-grid";

    const items = [
        ["Police stations", result.policeStationsCount, result.policeStationNames],
        ["Hospitals", result.hospitalsCount, result.hospitalNames],
        ["Public places", result.publicPlacesCount, result.publicPlaceNames],
        ["Recorded incidents", result.incidentsCount, []]
    ];

    items.forEach(([label, count, names]) => {
        const card = document.createElement("div");
        card.className = "safeher-safety-card";

        const title = document.createElement("strong");
        title.textContent = label;

        const number = document.createElement("div");
        number.className = "safeher-safety-count";
        number.textContent =
            count !== undefined && count !== null ? String(count) : "—";

        card.append(title, number);

        if (Array.isArray(names) && names.length) {
            const list = document.createElement("p");
            list.textContent = names.join(", ");
            card.appendChild(list);
        }

        grid.appendChild(card);
    });

    panel.appendChild(grid);

    const detailsHeading = document.createElement("h4");
    detailsHeading.textContent = "Assessment details";
    panel.appendChild(detailsHeading);

    const reasons = Array.isArray(result.safetyReasons)
        ? result.safetyReasons
        : [];

    if (reasons.length) {
        const list = document.createElement("ul");

        reasons.forEach(reason => {
            const item = document.createElement("li");
            item.textContent = reason;
            list.appendChild(item);
        });

        panel.appendChild(list);
    } else {
        const message = document.createElement("p");
        message.textContent =
            "No additional safety details were returned.";
        panel.appendChild(message);
    }


    const basis = document.createElement("p");
    basis.className = "safeher-safety-basis";
    basis.textContent = result.safetyAssessmentBasis
        ? `Assessment basis: ${result.safetyAssessmentBasis}`
        : "Assessment basis is not provided.";

    panel.appendChild(basis);

    const disclaimer = document.createElement("p");
    disclaimer.className = "safeher-safety-disclaimer";
    disclaimer.textContent =
        result.safetyMessage ||
        "This is a demo estimate, not a verified real-world safety rating.";

    panel.appendChild(disclaimer);
}

function showToast(message) {
    let toast = document.getElementById("safeherToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "safeherToast";
        toast.className = "safeher-toast";
        toast.setAttribute("role", "status");

        toast.style.position = "fixed";
        toast.style.bottom = "24px";
        toast.style.left = "50%";
        toast.style.transform = "translateX(-50%)";
        toast.style.zIndex = "99999";
        toast.style.padding = "12px 20px";
        toast.style.background = "#333";
        toast.style.color = "#fff";
        toast.style.borderRadius = "8px";
        toast.style.maxWidth = "90%";

        document.body.appendChild(toast);
    }

    toast.textContent = String(message);
    toast.style.display = "block";
}
function renderPublicTransport(result) {
    let panel = document.getElementById("safeherTransportDetails");

    if (!panel) {
        panel = document.createElement("section");
        panel.id = "safeherTransportDetails";
        panel.className = "safeher-safety-details";

        const safetyPanel =
            document.getElementById("safeherSafetyDetails");

        if (safetyPanel) {
            safetyPanel.insertAdjacentElement("afterend", panel);
        } else {
            document.getElementById("resultsScreen")?.appendChild(panel);
        }
    }

    panel.replaceChildren();

    const transport = result.publicTransport;

    if (!transport) {
        panel.remove();
        return;
    }

    const heading = document.createElement("h3");
    heading.textContent = transport.title || "Public transport option";
    panel.appendChild(heading);

    const message = document.createElement("p");
    message.textContent = transport.message;
    panel.appendChild(message);

    if (Array.isArray(transport.tips) && transport.tips.length) {
        const list = document.createElement("ul");

        transport.tips.forEach(tip => {
            const item = document.createElement("li");
            item.textContent = tip;
            list.appendChild(item);
        });

        panel.appendChild(list);
    }
}


