#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <string>
#include <vector>
#include "Graph.h"

using namespace std;

class Dijkstra
{
private:
    Graph graph;

public:
    Dijkstra(Graph routeGraph);

    vector<string> findShortestPath(string source, string destination);

    int getShortestDistance(string source, string destination);
};

#endif