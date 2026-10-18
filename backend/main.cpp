#include <iostream>
#include <vector>
#include <string>
#include <sstream>

#include "route/Graph.h"
#include "route/Dijkstra.h"
#include "route/Route.h"

using namespace std;

// ========================================
// JSON ESCAPE
// ========================================

string jsonEscape(const string& text)
{
    string out;

    for (char c : text)
    {
        if (c == '"')
            out += "\\\"";
        else if (c == '\\')
            out += "\\\\";
        else if (c == '\n')
            out += "\\n";
        else
            out += c;
    }

    return out;
}

// ========================================
// ROUTE FUNCTION
// ========================================

int handleRoute(string source, string destination)
{
    Graph dehradunGraph;

    bool routesLoaded =
        dehradunGraph.loadRoutesFromFile("../Data/routes.txt");

    if (!routesLoaded)
    {
        cout << "{\"success\":false,\"message\":\"Route data could not be loaded\"}";
        return 0;
    }

    if (!dehradunGraph.hasLocation(source) ||
        !dehradunGraph.hasLocation(destination))
    {
        cout << "{\"success\":false,\"message\":\"Invalid location\"}";
        return 0;
    }

    if (source == destination)
    {
        cout << "{\"success\":false,\"message\":\"Source and destination cannot be same\"}";
        return 0;
    }

    Dijkstra routeFinder(dehradunGraph);

    vector<string> shortestPath =
        routeFinder.findShortestPath(source, destination);

    int shortestDistance =
        routeFinder.getShortestDistance(source, destination);

    if (shortestPath.empty())
    {
        cout << "{\"success\":false,\"message\":\"No route found\"}";
        return 0;
    }

    // ========================================
    // JSON RESPONSE
    // ========================================

    cout << "{";

    cout << "\"success\":true,";
    cout << "\"source\":\"" << jsonEscape(source) << "\",";
    cout << "\"destination\":\"" << jsonEscape(destination) << "\",";
    cout << "\"distance\":" << shortestDistance << ",";

    cout << "\"path\":[";

    for (int i = 0; i < shortestPath.size(); i++)
    {
        cout << "\"" << jsonEscape(shortestPath[i]) << "\"";

        if (i < shortestPath.size() - 1)
        {
            cout << ",";
        }
    }

    cout << "],";

    // Safety values (Devashish module connect hone ke baad update honge)
    cout << "\"safetyScore\":8,";
    cout << "\"safetyLevel\":\"High\",";
    cout << "\"policeStations\":0,";
    cout << "\"hospitals\":0,";
    cout << "\"publicPlaces\":0,";
    cout << "\"incidents\":0,";

    cout << "\"reasons\":[";
    cout << "\"Route calculated using Dijkstra shortest path algorithm\"";
    cout << "]";

    cout << "}";

    return 0;
}

// ========================================
// MAIN
// ========================================

int main(int argc, char* argv[])
{
    // main.exe route source destination

    if (argc == 4 && string(argv[1]) == "route")
    {
        return handleRoute(argv[2], argv[3]);
    }

    // Old format: main.exe "source" "destination"

    if (argc == 3)
    {
        return handleRoute(argv[1], argv[2]);
    }

    cout << "SAFEHER BACKEND" << endl;
    cout << "Available command: route <source> <destination>" << endl;

    return 0;
}