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
    map<string, vector<pair<string, int>>> adjacencyList;

public:
    void addEdge(string source, string destination, int distance);

    vector<pair<string, int>> getNeighbors(string location);

    vector<string> getAllLocations();

    bool hasLocation(string location);

    void displayGraph();
};

#endif