#include <iostream>

#include "Route.h"

using namespace std;


// ========================================
// CONSTRUCTOR
// ========================================

Route::Route(
    string source,
    string destination,
    double distance,
    double duration
) {

    this->source = source;
    this->destination = destination;
    this->distance = distance;
    this->duration = duration;
}


// ========================================
// GET SOURCE
// ========================================

string Route::getSource() const {

    return source;
}


// ========================================
// GET DESTINATION
// ========================================

string Route::getDestination() const {

    return destination;
}


// ========================================
// GET DISTANCE
// ========================================

double Route::getDistance() const {

    return distance;
}


// ========================================
// GET DURATION
// ========================================

double Route::getDuration() const {

    return duration;
}


// ========================================
// DISPLAY ROUTE
// ========================================

void Route::displayRoute() const {

    cout << "\n=============================" << endl;
    cout << "        ROUTE DETAILS" << endl;
    cout << "=============================" << endl;

    cout << "Source      : " << source << endl;
    cout << "Destination : " << destination << endl;
    cout << "Distance    : " << distance << " km" << endl;
    cout << "Duration    : " << duration << " minutes" << endl;

    cout << "=============================" << endl;
}