#ifndef LOCATION_H
#define LOCATION_H

#include <string>

using namespace std;

class Location {
private:
    int id;
    string name;

public:
    Location();
    Location(int locationId, string locationName);

    int getId();
    string getName();
};

#endif