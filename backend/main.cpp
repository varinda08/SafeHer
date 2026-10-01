#include <iostream>
#include "route/Location.h"
#include "route/Graph.h"

using namespace std;

int main() {
    cout << "===== SafeHer: Archie Route Module Test =====" << endl;
    cout << endl;

    // Testing Location class
    Location location1(1, "Graphic Era University");
    Location location2(2, "Paltan Bazaar");

    cout << "Location 1: " << location1.getName() << endl;
    cout << "Location 2: " << location2.getName() << endl;
    cout << endl;

    // Creating the Dehradun route graph
    Graph dehradunGraph;

    // Route 1
    dehradunGraph.addEdge("Graphic Era University", "Rajpur Road", 3);
    dehradunGraph.addEdge("Rajpur Road", "Clock Tower", 2);
    dehradunGraph.addEdge("Clock Tower", "Paltan Bazaar", 1);

    // Route 2
    dehradunGraph.addEdge("Graphic Era University", "Nehru Colony", 4);
    dehradunGraph.addEdge("Nehru Colony", "Patel Nagar", 2);
    dehradunGraph.addEdge("Patel Nagar", "Paltan Bazaar", 3);

    cout << "Dehradun route graph created successfully." << endl;
    cout << endl;

    cout << "--- Graph Connections ---" << endl;
    dehradunGraph.displayGraph();

    cout << endl;
    cout << "Is Clock Tower present in the graph? ";

    if (dehradunGraph.hasLocation("Clock Tower")) {
        cout << "Yes" << endl;
    } else {
        cout << "No" << endl;
    }

    return 0;
}