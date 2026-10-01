#include "Graph.h"
#include <iostream>

using namespace std;

// Adds a bidirectional connection because roads in this prototype
// are considered usable in both directions.
void Graph::addEdge(string source, string destination, int distance) {
    adjacencyList[source].push_back(make_pair(destination, distance));
    adjacencyList[destination].push_back(make_pair(source, distance));
}

// Returns all locations directly connected to the given location.
vector<pair<string, int>> Graph::getNeighbors(string location) {
    return adjacencyList[location];
}

// Returns true when the location is available in the graph.
bool Graph::hasLocation(string location) {
    return adjacencyList.find(location) != adjacencyList.end();
}

// Displays all locations and their connected routes.
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