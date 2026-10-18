#ifndef EMERGENCY_SERVICE_H
#define EMERGENCY_SERVICE_H

#include <string>
using namespace std;

class EmergencyService {
public:
    string location;
    string name;
    
    EmergencyService(string location, string name);
    string toString();
};

#endif