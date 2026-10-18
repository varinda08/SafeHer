#ifndef GEOCODINGAPI_H
#define GEOCODINGAPI_H

#include <string>

using namespace std;

class GeocodingAPI {

private:

    string apiKey;

public:

    GeocodingAPI(string apiKey);

    bool getCoordinates(
        string location,
        double& latitude,
        double& longitude
    );
};

#endif