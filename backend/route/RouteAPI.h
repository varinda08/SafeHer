#ifndef ROUTEAPI_H
#define ROUTEAPI_H

#include <string>

using namespace std;

class RouteAPI
{
private:

    string apiKey;

public:

    RouteAPI(string apiKey);

    bool getRoute(
        double startLatitude,
        double startLongitude,
        double endLatitude,
        double endLongitude,
        double& distanceKm,
        double& durationMinutes
    );
};

#endif