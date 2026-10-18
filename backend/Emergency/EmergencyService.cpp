#include "EmergencyService.h"
#include <sstream>

EmergencyService::EmergencyService(string location, string name) {
    this->location = location;
    this->name = name;
}

string EmergencyService::toString() {
    stringstream ss;
    ss << location << "|" << name;
    return ss.str();
}