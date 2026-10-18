#ifndef ROUTE_H
#define ROUTE_H

#include <string>
#include <vector>

using namespace std;

class Route
{
private:
    vector<string> path;
    int distance;
    int safetyScore;
    string riskLevel;

public:
    Route();

    Route(vector<string> routePath, int routeDistance);

    vector<string> getPath();
    int getDistance();
    int getSafetyScore();
    string getRiskLevel();

    void setSafetyScore(int score);
    void setRiskLevel(string level);

    void displayRoute();
};

#endif