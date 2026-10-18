#ifndef INCIDENT_H
#define INCIDENT_H

#include <string>
using namespace std;

class Incident {
public:
    int id;
    string location;
    string type;
    int severity;
    
    Incident(int id, string location, string type, int severity);
    string toString();
};

#endif