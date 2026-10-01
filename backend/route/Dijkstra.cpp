#include "Dijkstra.h"
#include <queue>
#include <map>
#include <climits>
#include <algorithm>

using namespace std;

// Constructor
Dijkstra::Dijkstra(Graph routeGraph) {
    graph = routeGraph;
}

// Finds the shortest path using Dijkstra's algorithm.
vector<string> Dijkstra::findShortestPath(string source, string destination) {
    map<string, int> distance;
    map<string, string> previous;

    // Min-Heap:
    // pair = (distance, location)
    priority_queue<
        pair<int, string>,
        vector<pair<int, string>>,
        greater<pair<int, string>>
    > minHeap;

    // Initially, every location has infinite distance.
    vector<string> locations = graph.getAllLocations();

    for (string location : locations) {
        distance[location] = INT_MAX;
    }

    // Source distance is zero.
    distance[source] = 0;
    minHeap.push(make_pair(0, source));

    while (!minHeap.empty()) {
        int currentDistance = minHeap.top().first;
        string currentLocation = minHeap.top().second;
        minHeap.pop();

        // Ignore old entry if a shorter distance is already known.
        if (currentDistance > distance[currentLocation]) {
            continue;
        }

        // Destination reached.
        if (currentLocation == destination) {
            break;
        }

        // Check all direct neighbours.
        vector<pair<string, int>> neighbors =
            graph.getNeighbors(currentLocation);

        for (auto neighbor : neighbors) {
            string nextLocation = neighbor.first;
            int edgeDistance = neighbor.second;

            int newDistance = currentDistance + edgeDistance;

            // Update when a shorter route is found.
            if (newDistance < distance[nextLocation]) {
                distance[nextLocation] = newDistance;
                previous[nextLocation] = currentLocation;

                minHeap.push(make_pair(newDistance, nextLocation));
            }
        }
    }

    vector<string> path;

    // If destination was never reached.
    if (distance[destination] == INT_MAX) {
        return path;
    }

    // Make path backwards: destination to source.
    string current = destination;

    while (current != source) {
        path.push_back(current);
        current = previous[current];
    }

    path.push_back(source);

    // Reverse to get source to destination path.
    reverse(path.begin(), path.end());

    return path;
}

// Returns the shortest total distance.
int Dijkstra::getShortestDistance(string source, string destination) {
    map<string, int> distance;

    priority_queue<
        pair<int, string>,
        vector<pair<int, string>>,
        greater<pair<int, string>>
    > minHeap;

    vector<string> locations = graph.getAllLocations();

    for (string location : locations) {
        distance[location] = INT_MAX;
    }

    distance[source] = 0;
    minHeap.push(make_pair(0, source));

    while (!minHeap.empty()) {
        int currentDistance = minHeap.top().first;
        string currentLocation = minHeap.top().second;
        minHeap.pop();

        if (currentDistance > distance[currentLocation]) {
            continue;
        }

        if (currentLocation == destination) {
            return currentDistance;
        }

        vector<pair<string, int>> neighbors =
            graph.getNeighbors(currentLocation);

        for (auto neighbor : neighbors) {
            string nextLocation = neighbor.first;
            int edgeDistance = neighbor.second;

            int newDistance = currentDistance + edgeDistance;

            if (newDistance < distance[nextLocation]) {
                distance[nextLocation] = newDistance;
                minHeap.push(make_pair(newDistance, nextLocation));
            }
        }
    }

    return -1;
}