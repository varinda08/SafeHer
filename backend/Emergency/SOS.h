#ifndef SOS_H
#define SOS_H

#include <string>
using namespace std;

class SOS {
public:
    void prepareAlert(string userName, string guardianPhone, 
                      string currentLocation, string destination);
};

#endif