#include "Dijkstra.h"
#include <queue>
#include <map>
#include <climits>
#include <algorithm>

using namespace std;

Dijkstra::Dijkstra(Graph routeGraph)
{
    graph = routeGraph;
}

vector<string> Dijkstra::findShortestPath(string source, string destination)
{
    map<string, int> distance;
    map<string, string> previous;

    priority_queue<
        pair<int, string>,
        vector<pair<int, string>>,
        greater<pair<int, string>>
    > minHeap;

    vector<string> locations = graph.getAllLocations();

    for (string location : locations)
    {
        distance[location] = INT_MAX;
    }

    distance[source] = 0;
    minHeap.push(make_pair(0, source));

    while (!minHeap.empty())
    {
        int currentDistance = minHeap.top().first;
        string currentLocation = minHeap.top().second;

        minHeap.pop();

        if (currentDistance > distance[currentLocation])
        {
            continue;
        }

        if (currentLocation == destination)
        {
            break;
        }

        vector<pair<string, int>> neighbors =
            graph.getNeighbors(currentLocation);

        for (auto neighbor : neighbors)
        {
            string nextLocation = neighbor.first;
            int edgeDistance = neighbor.second;

            int newDistance = currentDistance + edgeDistance;

            if (newDistance < distance[nextLocation])
            {
                distance[nextLocation] = newDistance;
                previous[nextLocation] = currentLocation;

                minHeap.push(make_pair(newDistance, nextLocation));
            }
        }
    }

    vector<string> path;

    if (distance[destination] == INT_MAX)
    {
        return path;
    }

    string current = destination;

    while (current != source)
    {
        path.push_back(current);
        current = previous[current];
    }

    path.push_back(source);

    reverse(path.begin(), path.end());

    return path;
}

int Dijkstra::getShortestDistance(string source, string destination)
{
    map<string, int> distance;

    priority_queue<
        pair<int, string>,
        vector<pair<int, string>>,
        greater<pair<int, string>>
    > minHeap;

    vector<string> locations = graph.getAllLocations();

    for (string location : locations)
    {
        distance[location] = INT_MAX;
    }

    distance[source] = 0;
    minHeap.push(make_pair(0, source));

    while (!minHeap.empty())
    {
        int currentDistance = minHeap.top().first;
        string currentLocation = minHeap.top().second;

        minHeap.pop();

        if (currentDistance > distance[currentLocation])
        {
            continue;
        }

        if (currentLocation == destination)
        {
            return currentDistance;
        }

        vector<pair<string, int>> neighbors =
            graph.getNeighbors(currentLocation);

        for (auto neighbor : neighbors)
        {
            string nextLocation = neighbor.first;
            int edgeDistance = neighbor.second;

            int newDistance = currentDistance + edgeDistance;

            if (newDistance < distance[nextLocation])
            {
                distance[nextLocation] = newDistance;

                minHeap.push(make_pair(newDistance, nextLocation));
            }
        }
    }

    return -1;
}