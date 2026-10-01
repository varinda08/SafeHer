#ifndef GRAPH_H
#define GRAPH_H

#include <string>
#include <vector>
#include <map>

using namespace std;

// Graph class represents Dehradun locations and road connections.
// DSA concept: Weighted Graph using Adjacency List.
class Graph {
private:
    // Key = location name
    // Value = list of connected locations and their distance
    map<string, vector<pair<string, int>>> adjacencyList;

public:
    // Adds a two-way road connection.
    void addEdge(string source, string destination, int distance);

    // Returns all direct neighbors of a location.
    vector<pair<string, int>> getNeighbors(string location);

    // Checks whether a location is present in the graph.
    bool hasLocation(string location);

    // Shows all connections for testing.
    void displayGraph();
};

#endif