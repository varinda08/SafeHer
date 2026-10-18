#include "Incident.h"
#include <sstream>

Incident::Incident(int id, string location, string type, int severity) {
    this->id = id;
    this->location = location;
    this->type = type;
    this->severity = severity;
}

string Incident::toString() {
    stringstream ss;
    ss << id << "|" << location << "|" << type << "|" << severity;
    return ss.str();
}