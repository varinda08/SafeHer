#include "Route.h"
#include <iostream>

using namespace std;

Route::Route()
{
    distance = 0;
    safetyScore = 0;
    riskLevel = "Not Calculated";
}

Route::Route(vector<string> routePath, int routeDistance)
{
    path = routePath;
    distance = routeDistance;
    safetyScore = 0;
    riskLevel = "Not Calculated";
}

vector<string> Route::getPath()
{
    return path;
}

int Route::getDistance()
{
    return distance;
}

int Route::getSafetyScore()
{
    return safetyScore;
}

string Route::getRiskLevel()
{
    return riskLevel;
}

void Route::setSafetyScore(int score)
{
    safetyScore = score;
}

void Route::setRiskLevel(string level)
{
    riskLevel = level;
}

void Route::displayRoute()
{
    cout << "Path: ";

    for (int i = 0; i < path.size(); i++)
    {
        cout << path[i];

        if (i < path.size() - 1)
        {
            cout << " -> ";
        }
    }

    cout << endl;
    cout << "Distance: " << distance << " km" << endl;
    cout << "Safety Score: " << safetyScore << endl;
    cout << "Risk Level: " << riskLevel << endl;
}