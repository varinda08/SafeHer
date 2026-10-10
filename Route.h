#ifndef ROUTE_H
#define ROUTE_H

#include <string>

using namespace std;

class Route {

private:

    string source;
    string destination;

    double distance;
    double duration;

public:

    // Constructor
    Route(
        string source,
        string destination,
        double distance,
        double duration
    );

    // Getters
    string getSource() const;
    string getDestination() const;

    double getDistance() const;
    double getDuration() const;

    // Display route information
    void displayRoute() const;
};

#endif