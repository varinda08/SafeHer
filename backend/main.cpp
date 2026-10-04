#include <iostream>
#include <vector>
#include <string>

#include "route/Graph.h"
#include "route/Dijkstra.h"
#include "route/Route.h"

using namespace std;

int main() {
    cout << "========================================" << endl;
    cout << "        SAFEHER ROUTE SYSTEM" << endl;
    cout << "========================================" << endl;

    // Create graph for sample Dehradun locations.
    Graph dehradunGraph;

    // Route A: 6 km
    dehradunGraph.addEdge("Graphic Era University", "Rajpur Road", 3);
    dehradunGraph.addEdge("Rajpur Road", "Clock Tower", 2);
    dehradunGraph.addEdge("Clock Tower", "Paltan Bazaar", 1);

    // Route B: 9 km
    dehradunGraph.addEdge("Graphic Era University", "Nehru Colony", 4);
    dehradunGraph.addEdge("Nehru Colony", "Patel Nagar", 2);
    dehradunGraph.addEdge("Patel Nagar", "Paltan Bazaar", 3);

    cout << "\nAvailable Locations:" << endl;
    cout << "1. Graphic Era University" << endl;
    cout << "2. Rajpur Road" << endl;
    cout << "3. Clock Tower" << endl;
    cout << "4. Paltan Bazaar" << endl;
    cout << "5. Nehru Colony" << endl;
    cout << "6. Patel Nagar" << endl;

    string source;
    string destination;

    cout << "\nEnter current location exactly as shown: ";
    getline(cin, source);

    cout << "Enter destination exactly as shown: ";
    getline(cin, destination);

    // Validate user input.
    if (!dehradunGraph.hasLocation(source) ||
        !dehradunGraph.hasLocation(destination)) {
        cout << "\nInvalid location entered." << endl;
        cout << "Please select a location from the available list." << endl;
        return 0;
    }

    if (source == destination) {
        cout << "\nSource and destination cannot be the same." << endl;
        return 0;
    }

    // Dijkstra calculates shortest distance route.
    Dijkstra routeFinder(dehradunGraph);

    vector<string> shortestPath =
        routeFinder.findShortestPath(source, destination);

    int shortestDistance =
        routeFinder.getShortestDistance(source, destination);

    if (shortestPath.empty()) {
        cout << "\nNo route found between selected locations." << endl;
        return 0;
    }

    // Route object stores complete route details.
    Route selectedRoute(shortestPath, shortestDistance);

    cout << "\n========================================" << endl;
    cout << "       SHORTEST ROUTE INFORMATION" << endl;
    cout << "========================================" << endl;

    selectedRoute.displayRoute();

    cout << "\nNote:" << endl;
    cout << "Dijkstra calculates distance-based shortest path only." << endl;
    cout << "Safety score and risk level will be added by SafetyAnalyzer." << endl;

    return 0;
}