#include "SOS.h"
#include <iostream>

void SOS::prepareAlert(string userName, string guardianPhone, 
                        string currentLocation, string destination) {
    cout << "SOS ACTIVATED" << endl;
    cout << "User: " << userName << endl;
    cout << "Guardian Phone: " << guardianPhone << endl;
    cout << "Current Location: " << currentLocation << endl;
    cout << "Destination: " << destination << endl;
    cout << "Status: Alert prepared only." << endl;
    cout << "No real SMS, call or police notification was sent." << endl;
}