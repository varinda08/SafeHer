#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <string>
#include <vector>
#include "Graph.h"

using namespace std;

// DSA concept: Dijkstra's shortest path algorithm.
// It uses a Min-Heap / Priority Queue internally.
class Dijkstra {
private:
    Graph graph;

public:
    // Constructor receives the route graph.
    Dijkstra(Graph routeGraph);

    // Finds the shortest path between source and destination.
    vector<string> findShortestPath(string source, string destination);

    // Returns the minimum distance between source and destination.
    int getShortestDistance(string source, string destination);
};

#endif