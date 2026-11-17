
// ==========================================
// SCHOOLMAP - DONA CARMEN NATIONAL HIGH SCHOOL
// ==========================================


// 1. GET WEBSITE ELEMENTS

const welcomeScreen = document.getElementById("welcomeScreen");
const mainApp = document.getElementById("mainApp");

const startButton = document.getElementById("startButton");
const homeButton = document.getElementById("homeButton");

const schoolMap = document.getElementById("schoolMap");
const routeLayer = document.getElementById("routeLayer");

const setLocationButton = document.getElementById("setLocationButton");
const statusMessage = document.getElementById("statusMessage");

const destinationSelect = document.getElementById("destinationSelect");
const buildingInfo = document.getElementById("buildingInfo");

const searchInput = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");


// 2. CHECK THAT IMPORTANT ELEMENTS EXIST

if (
    !welcomeScreen ||
    !mainApp ||
    !startButton ||
    !homeButton ||
    !schoolMap ||
    !routeLayer
) {
    console.error("SchoolMap could not find one or more HTML elements.");
}


// 3. BUILDING INFORMATION

const buildings = {
    A: {
        name: "Administration Building",
        description: "School administration and office area."
    },
    B: {
        name: "School Entrance",
        description: "Main entrance of the school."
    },
    C: {
        name: "Gymnasium",
        description: "Sports and school events."
    },
    D: {
        name: "Grade 7 Building",
        description: "Classrooms for Grade 7 students.",
        floors: {
            "Floor 1": ["Dahlia"]
        }
    },
    E: {
        name: "Grade 9 Building",
        description: "Classrooms for Grade 9 students.",
        floors: {
            "Floor 3": ["Sagimsim"]
        }
    },
    F: {
        name: "Grade 10 Building",
        description: "Classrooms for Grade 10 students.",
        floors: {
            "Floor 4": ["Mabini"]
        }
    },
    G: {
        name: "Grade 8 Building",
        description: "Classrooms for Grade 8 students.",
        floors: {
            "Floor 2": ["Bluebird"]
        }
    },
    H: {
        name: "Administration Building",
        description: "Additional administration area."
    },
    I: {
        name: "Canteen",
        description: "School food and refreshment area."
    },
    J: {
        name: "Canteen",
        description: "School food and refreshment area."
    },
    K: {
        name: "Music, Arts and SSG Building",
        description: "Music, arts, and student government."
    },
    L: {
        name: "Canteen",
        description: "School food and refreshment area."
    },
    M: {
        name: "SMAW and Cookery Building",
        description: "Technical-vocational learning area."
    },
    O: {
        name: "Grade 11 Building",
        description: "Classrooms for Grade 11 students.",
        floors: {
            "Floor 1": ["Sibulan", "Baracatan"],
            "Floor 2": ["Sirawan", "Bangkas Heights"],
            "Floor 3": ["Mulig", "Daliao"],
            "Floor 4": ["Marapangi", "Lizada"]
        }
    },
    P: {
        name: "Grade 12 Building",
        description: "Classrooms for Grade 12 students.",
        floors: {
            "Floor 3": ["Tagurano", "Tibuloy"],
            "Floor 4": ["Tausug", "Yakan"]
        }
    },
    Q: {
        name: "Grade 12 / Grade 11 Building",
        description: "Senior high school area."
    },
    R: {
        name: "Grade 11 Building",
        description: "Classrooms for Grade 11 students."
    }
};

// 4. BUILDING CENTER COORDINATES

const buildingCenters = {
    A: [255, 170],
    B: [385, 83],
    C: [435, 155],
    D: [551, 225],
    E: [292, 292],
    F: [336, 258],
    G: [370, 222],
    H: [172, 310],
    I: [235, 374],
    J: [300, 415],
    K: [527, 320],
    L: [433, 357],
    M: [503, 408],
    O: [643, 424],
    P: [467, 468],
    Q: [625, 537],
    R: [711, 466]
};


// 5. USER LOCATION AND DESTINATION VARIABLES

let userLocation = null;
let isSettingLocation = false;
let selectedDestination = null;

let selectedFloor = null;
let selectedClassroom = null;


// 6. PUT THE ROUTE LAYER ABOVE THE BUILDINGS

schoolMap.appendChild(routeLayer);


// 7. OPEN THE SCHOOL MAP

startButton.addEventListener("click", function () {
    welcomeScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
});


// 8. RETURN TO THE WELCOME SCREEN

homeButton.addEventListener("click", function () {
    mainApp.classList.add("hidden");
    welcomeScreen.classList.remove("hidden");
});


// 9. ADD BUILDINGS TO THE DESTINATION DROPDOWN

Object.keys(buildings).forEach(function (buildingID) {
    const option = document.createElement("option");

    option.value = buildingID;
    option.textContent =
        buildingID + " - " + buildings[buildingID].name;

    destinationSelect.appendChild(option);
});


// 10. SET USER LOCATION BUTTON

setLocationButton.addEventListener("click", function () {
    isSettingLocation = true;

    statusMessage.textContent =
        "Location mode active! Click an EMPTY space on the map.";

    setLocationButton.textContent =
        "Click an Empty Map Space...";

});


// 11. MAP CLICK SYSTEM

schoolMap.addEventListener("click", function (event) {

    // Check whether a building was clicked.
    const clickedBuilding = event.target.closest("[data-building]");

    if (clickedBuilding) {

        if (isSettingLocation) {
            statusMessage.textContent =
                "Please click an empty space, not a building.";
            return;
        }

        const buildingID =
            clickedBuilding.getAttribute("data-building");

        selectDestination(buildingID);
        return;
    }

    // If location mode is not active, do nothing.
    if (!isSettingLocation) {
        return;
    }

    // Convert mouse position into map coordinates.
    const point = schoolMap.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const screenMatrix = schoolMap.getScreenCTM();

    if (!screenMatrix) {
        statusMessage.textContent =
            "Unable to read map position. Please try again.";
        return;
    }

    const coordinates = point.matrixTransform(
        screenMatrix.inverse()
    );

    userLocation = {
        x: coordinates.x,
        y: coordinates.y
    };

    isSettingLocation = false;

    setLocationButton.textContent =
        "📍 Change My Location";

    statusMessage.textContent =
        "Your location is set! Now choose a destination building.";

    drawNavigation();
});


// 12. SELECT A DESTINATION

function selectDestination(buildingID) {

    if (!buildings[buildingID]) {
        return;
    }

    selectedDestination = buildingID;
    selectedFloor = null;
    selectedClassroom = null;

    destinationSelect.value = buildingID;

    // Remove old highlights.
    document.querySelectorAll(".building").forEach(function (polygon) {
        polygon.classList.remove("selected");
    });

    // Highlight selected building.
    const selectedPolygon = schoolMap.querySelector(
        '[data-building="' + buildingID + '"]'
    );

    if (selectedPolygon) {
        selectedPolygon.classList.add("selected");
    }

    const building = buildings[buildingID];

    // Display building information.
    buildingInfo.innerHTML = `
        <h3>${buildingID} - ${building.name}</h3>
        <p>${building.description}</p>
    `;

    // Display available floors.
    if (building.floors) {

        buildingInfo.innerHTML += `
            <h4>Select a Floor</h4>
            <div id="floorOptions"></div>
        `;

        const floorOptions = buildingInfo.querySelector("#floorOptions");

        Object.keys(building.floors).forEach(function (floor) {

            const button = document.createElement("button");

            button.textContent = floor;
            button.setAttribute("data-floor", floor);

            button.style.display = "block";
            button.style.width = "100%";
            button.style.padding = "12px";
            button.style.marginBottom = "8px";
            button.style.cursor = "pointer";
            button.style.borderRadius = "8px";
            button.style.border = "1px solid #cccccc";

            floorOptions.appendChild(button);

        });

    }

    if (userLocation) {
        statusMessage.textContent =
            "Building selected! Choose a floor and classroom.";
    } else {
        statusMessage.textContent =
            "Building selected! Set your location to start navigation.";
    }

    drawNavigation();
}


// 12.1 DISPLAY CLASSROOMS WHEN A FLOOR IS SELECTED

function showFloorSections(buildingID, floor) {

    const building = buildings[buildingID];

    if (!building || !building.floors[floor]) {
        return;
    }

    selectedFloor = floor;
    selectedClassroom = null;

    const sections = building.floors[floor];

    buildingInfo.innerHTML = `
        <h3>${building.name}</h3>

        <h4>${floor}</h4>

        <p>Select your classroom:</p>

        <div id="sectionOptions"></div>

        <button data-back-to-floors
            style="margin-top:12px;padding:10px;cursor:pointer;">
            ← Back to Floors
        </button>
    `;

    const sectionOptions = buildingInfo.querySelector("#sectionOptions");

    sections.forEach(function (section) {

        const button = document.createElement("button");

        button.textContent = section;
        button.setAttribute("data-section", section);

        button.style.display = "block";
        button.style.width = "100%";
        button.style.padding = "12px";
        button.style.marginBottom = "8px";
        button.style.cursor = "pointer";
        button.style.borderRadius = "8px";
        button.style.border = "1px solid #cccccc";

        sectionOptions.appendChild(button);

    });

}


// 12.2 HANDLE FLOOR AND CLASSROOM CLICKS

buildingInfo.addEventListener("click", function (event) {

    const floorButton = event.target.closest("[data-floor]");

    if (floorButton) {

        showFloorSections(
            selectedDestination,
            floorButton.getAttribute("data-floor")
        );

        return;
    }

    const sectionButton = event.target.closest("[data-section]");

    if (sectionButton) {

        selectedClassroom =
            sectionButton.getAttribute("data-section");

        const building = buildings[selectedDestination];

        buildingInfo.innerHTML = `
            <h3>${building.name}</h3>

            <p><strong>Floor:</strong> ${selectedFloor}</p>

            <p><strong>Classroom:</strong> ${selectedClassroom}</p>

            <p>Your classroom has been selected!</p>

            <button data-back-to-floors
                style="padding:10px;cursor:pointer;">
                ← Choose Another Classroom
            </button>
        `;

        if (userLocation) {
            statusMessage.textContent =
                "Route to " + selectedClassroom +
                " selected. Follow the route to " + building.name + ".";
        } else {
            statusMessage.textContent =
                "Classroom selected! Set your starting location to navigate.";
        }

        drawNavigation();

        return;
    }

    if (event.target.closest("[data-back-to-floors]")) {

        selectDestination(selectedDestination);

    }

});

// 13. DESTINATION DROPDOWN

destinationSelect.addEventListener("change", function () {

    const buildingID = destinationSelect.value;

    if (buildingID) {
        selectDestination(buildingID);
    } else {
        selectedDestination = null;

        document.querySelectorAll(".building").forEach(function (polygon) {
            polygon.classList.remove("selected");
        });

        buildingInfo.innerHTML = `
            <h3>No building selected</h3>
            <p>Choose a building on the map to see its information.</p>
        `;

        drawNavigation();
    }
});


// 14. DRAW THE USER LOCATION MARKER

function drawUserMarker() {

    if (!userLocation) {
        return;
    }

    const marker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    marker.setAttribute("cx", userLocation.x);
    marker.setAttribute("cy", userLocation.y);
    marker.setAttribute("r", "11");
    marker.setAttribute("fill", "#1685ff");
    marker.setAttribute("stroke", "white");
    marker.setAttribute("stroke-width", "4");

    routeLayer.appendChild(marker);

    const label = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
    );

    label.setAttribute("x", userLocation.x);
    label.setAttribute("y", userLocation.y - 19);
    label.setAttribute("fill", "#0755a5");
    label.setAttribute("font-size", "16");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("text-anchor", "middle");
    label.textContent = "YOU";

    routeLayer.appendChild(label);
}


// 15. DRAW THE NAVIGATION ROUTE

function drawNavigation() {

    // Remove the previous route and markers.
    routeLayer.innerHTML = "";

    // Show the user marker if a location has been set.
    drawUserMarker();

    // A destination is needed to draw a route.
    if (!userLocation || !selectedDestination) {
        return;
    }

    const destination = buildingCenters[selectedDestination];

    if (!destination) {
        return;
    }

    // Draw an approximate route line.
    const route = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
    );

    route.setAttribute("x1", userLocation.x);
    route.setAttribute("y1", userLocation.y);
    route.setAttribute("x2", destination[0]);
    route.setAttribute("y2", destination[1]);

    route.setAttribute("stroke", "#00b978");
    route.setAttribute("stroke-width", "7");
    route.setAttribute("stroke-linecap", "round");
    route.setAttribute("stroke-dasharray", "12 9");

    routeLayer.appendChild(route);

    // Draw the destination marker.
    const destinationMarker = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
    );

    destinationMarker.setAttribute("cx", destination[0]);
    destinationMarker.setAttribute("cy", destination[1]);
    destinationMarker.setAttribute("r", "11");
    destinationMarker.setAttribute("fill", "#00b978");
    destinationMarker.setAttribute("stroke", "white");
    destinationMarker.setAttribute("stroke-width", "4");

    routeLayer.appendChild(destinationMarker);

    // Keep the user marker visible above the route.
    drawUserMarker();
}


// 16. SEARCH BUILDINGS

searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase().trim();

    document.querySelectorAll(".building").forEach(function (polygon) {

        const buildingID =
            polygon.getAttribute("data-building");

        const buildingName =
            buildings[buildingID].name.toLowerCase();

        const matches =
            buildingID.toLowerCase().includes(searchText) ||
            buildingName.includes(searchText);

        polygon.style.opacity = matches ? "1" : "0.25";
    });

});


// 17. CLEAR NAVIGATION

clearButton.addEventListener("click", function () {

    userLocation = null;
    selectedDestination = null;
    selectedFloor = null;
    selectedClassroom = null;
    isSettingLocation = false;

    routeLayer.innerHTML = "";

    destinationSelect.value = "";
    searchInput.value = "";

    document.querySelectorAll(".building").forEach(function (polygon) {
        polygon.classList.remove("selected");
        polygon.style.opacity = "1";
    });

    buildingInfo.innerHTML = `
        <h3>No building selected</h3>
        <p>Choose a building on the map to see its information.</p>
    `;

    statusMessage.textContent =
        "Navigation cleared. Set your location to begin again.";

    setLocationButton.textContent =
        "📍 Set My Location";

});
