#include "Location.h"

Location::Location() {
    id = 0;
    name = "";
}

Location::Location(int locationId, string locationName) {
    id = locationId;
    name = locationName;
}

int Location::getId() {
    return id;
}

string Location::getName() {
    return name;
}