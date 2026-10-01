#include <iostream>
#include "route/Location.h"
#include "route/Graph.h"
#include "route/Dijkstra.h"

using namespace std;

int main() {
    cout << "===== SafeHer: Route Engine Test =====" << endl;
    cout << endl;

    // Create Dehradun route graph.
    Graph dehradunGraph;

    // Route 1: Total distance = 6 km
    dehradunGraph.addEdge("Graphic Era University", "Rajpur Road", 3);
    dehradunGraph.addEdge("Rajpur Road", "Clock Tower", 2);
    dehradunGraph.addEdge("Clock Tower", "Paltan Bazaar", 1);

    // Route 2: Total distance = 9 km
    dehradunGraph.addEdge("Graphic Era University", "Nehru Colony", 4);
    dehradunGraph.addEdge("Nehru Colony", "Patel Nagar", 2);
    dehradunGraph.addEdge("Patel Nagar", "Paltan Bazaar", 3);

    string source = "Graphic Era University";
    string destination = "Paltan Bazaar";

    cout << "Source: " << source << endl;
    cout << "Destination: " << destination << endl;
    cout << endl;

    // Create Dijkstra object using graph.
    Dijkstra routeFinder(dehradunGraph);

    // Find the shortest route.
    vector<string> shortestPath =
        routeFinder.findShortestPath(source, destination);

    int shortestDistance =
        routeFinder.getShortestDistance(source, destination);

    cout << "--- Shortest Route Found by Dijkstra ---" << endl;

    if (shortestPath.empty()) {
        cout << "No route found between selected locations." << endl;
    } else {
        cout << "Path: ";

        for (int i = 0; i < shortestPath.size(); i++) {
            cout << shortestPath[i];

            if (i < shortestPath.size() - 1) {
                cout << " -> ";
            }
        }

        cout << endl;
        cout << "Total Distance: " << shortestDistance << " km" << endl;
    }

    cout << endl;
    cout << "Note: This is the shortest route calculation only." << endl;
    cout << "Safety score will be calculated separately by SafetyAnalyzer." << endl;

    return 0;
}