#ifndef ROUTE_H
#define ROUTE_H

#include <string>
#include <vector>

using namespace std;

// Route class stores details of one route.
class Route {
private:
    vector<string> path;
    int distance;

    int safetyScore;
    string riskLevel;

public:
    // Default constructor
    Route();

    // Constructor with route path and distance
    Route(vector<string> routePath, int routeDistance);

    // Getter functions
    vector<string> getPath();
    int getDistance();
    int getSafetyScore();
    string getRiskLevel();

    // Setter functions
    void setSafetyScore(int score);
    void setRiskLevel(string level);

    // Displays all route details
    void displayRoute();
};

#endif