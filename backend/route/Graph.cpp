#include "Graph.h"
#include <iostream>
#include <fstream>
#include <sstream>

using namespace std;

void Graph::addEdge(string source, string destination, int distance)
{
    graph[source].push_back(make_pair(destination, distance));
    graph[destination].push_back(make_pair(source, distance));
}

bool Graph::loadRoutesFromFile(string fileName)
{
    ifstream file(fileName);

    if (!file.is_open())
    {
        cout << "Could not open route file: " << fileName << endl;
        return false;
    }

    string line;

    while (getline(file, line))
    {
        string source;
        string destination;
        string distanceText;

        stringstream lineStream(line);

        getline(lineStream, source, '|');
        getline(lineStream, destination, '|');
        getline(lineStream, distanceText, '|');

        if (source == "" || destination == "" || distanceText == "")
        {
            continue;
        }

        int distance = stoi(distanceText);

        addEdge(source, destination, distance);
    }

    file.close();

    return true;
}

vector<pair<string, int>> Graph::getNeighbors(string location)
{
    return graph[location];
}

vector<string> Graph::getAllLocations()
{
    vector<string> locations;

    for (auto item : graph)
    {
        locations.push_back(item.first);
    }

    return locations;
}

bool Graph::hasLocation(string location)
{
    return graph.find(location) != graph.end();
}

void Graph::displayGraph()
{
    for (auto item : graph)
    {
        cout << item.first << ": ";

        for (auto road : item.second)
        {
            cout << road.first << "(" << road.second << " km) ";
        }

        cout << endl;
    }
}