#ifndef GRAPH_H
#define GRAPH_H

#include <string>
#include <vector>
#include <map>

using namespace std;

class Graph
{
private:
    map<string, vector<pair<string, int>>> graph;

public:
    void addEdge(string source, string destination, int distance);

    bool loadRoutesFromFile(string fileName);

    vector<pair<string, int>> getNeighbors(string location);

    vector<string> getAllLocations();

    bool hasLocation(string location);

    void displayGraph();
};

#endif