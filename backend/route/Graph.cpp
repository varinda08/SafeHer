#include "Graph.h"
#include <iostream>

using namespace std;

// Adds a two-way road connection between two locations.
void Graph::addEdge(string source, string destination, int distance) {
    adjacencyList[source].push_back(make_pair(destination, distance));
    adjacencyList[destination].push_back(make_pair(source, distance));
}

// Returns all locations directly connected to the given location.
vector<pair<string, int>> Graph::getNeighbors(string location) {
    return adjacencyList[location];
}

// Returns all locations currently stored in the graph.
vector<string> Graph::getAllLocations() {
    vector<string> locations;

    for (auto item : adjacencyList) {
        locations.push_back(item.first);
    }

    return locations;
}

// Checks whether a location exists in the graph.
bool Graph::hasLocation(string location) {
    return adjacencyList.find(location) != adjacencyList.end();
}

// Displays all graph connections for testing.
void Graph::displayGraph() {
    for (auto item : adjacencyList) {
        cout << item.first << " -> ";

        for (auto connection : item.second) {
            cout << connection.first
                 << " (" << connection.second << " km) ";
        }

        cout << endl;
    }
}