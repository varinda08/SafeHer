#include <iostream>
#include <vector>
#include <string>

#include "route/Graph.h"
#include "route/Dijkstra.h"

using namespace std;

// This function prints one route.
void showRoute(vector<string> route, int distance) {
    for (int i = 0; i < route.size(); i++) {
        cout << route[i];

        if (i < route.size() - 1) {
            cout << " -> ";
        }
    }

    cout << endl;
    cout << "Distance: " << distance << " km" << endl;
}

int main() {
    cout << "========================================" << endl;
    cout << "        SAFEHER ROUTE SYSTEM" << endl;
    cout << "========================================" << endl;

    // Create graph for sample Dehradun routes.
    Graph dehradunGraph;

    dehradunGraph.addEdge("Graphic Era University", "Rajpur Road", 3);
    dehradunGraph.addEdge("Rajpur Road", "Clock Tower", 2);
    dehradunGraph.addEdge("Clock Tower", "Paltan Bazaar", 1);

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

    // Check source and destination in the graph.
    if (!dehradunGraph.hasLocation(source) ||
        !dehradunGraph.hasLocation(destination)) {
        cout << "\nInvalid location entered." << endl;
        cout << "Please enter a location from the available list." << endl;
        return 0;
    }

    if (source == destination) {
        cout << "\nSource and destination cannot be the same." << endl;
        return 0;
    }

    // Dijkstra finds the shortest route.
    Dijkstra routeFinder(dehradunGraph);

    vector<string> shortestPath =
        routeFinder.findShortestPath(source, destination);

    int shortestDistance =
        routeFinder.getShortestDistance(source, destination);

    cout << "\n========================================" << endl;
    cout << "        AVAILABLE ROUTE INFORMATION" << endl;
    cout << "========================================" << endl;

    if (shortestPath.empty()) {
        cout << "No route found between selected locations." << endl;
        return 0;
    }

    cout << "\nShortest Route (Dijkstra):" << endl;
    showRoute(shortestPath, shortestDistance);

    // Prototype route options for the main demo case.
    if (source == "Graphic Era University" &&
        destination == "Paltan Bazaar") {

        vector<string> routeA;
        routeA.push_back("Graphic Era University");
        routeA.push_back("Rajpur Road");
        routeA.push_back("Clock Tower");
        routeA.push_back("Paltan Bazaar");

        vector<string> routeB;
        routeB.push_back("Graphic Era University");
        routeB.push_back("Nehru Colony");
        routeB.push_back("Patel Nagar");
        routeB.push_back("Paltan Bazaar");

        cout << "\nOther Available Route Options:" << endl;

        cout << "\nRoute A:" << endl;
        showRoute(routeA, 6);

        cout << "\nRoute B:" << endl;
        showRoute(routeB, 9);

        cout << "\nSafety analysis will be added by Devashish's module." << endl;
        cout << "The final system will compare safety scores of Route A and Route B." << endl;
    } else {
        cout << "\nFor this prototype, detailed route comparison is available" << endl;
        cout << "for Graphic Era University to Paltan Bazaar." << endl;
    }

    cout << "\nNote: Dijkstra gives shortest distance only." << endl;
    cout << "Safety score is calculated separately by SafetyAnalyzer." << endl;

    return 0;
}