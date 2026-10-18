#ifndef SAFETY_ANALYZER_H
#define SAFETY_ANALYZER_H

#include "Incident.h"
#include "../Emergency/EmergencyService.h"
#include <vector>
#include <string>
using namespace std;

struct SafetyResult {
    int safetyScore;
    string safetyLevel;
    int policeStationsCount;
    int hospitalsCount;
    int publicPlacesCount;
    int incidentsCount;
    vector<string> reasons;
};

class SafetyAnalyzer {
private:
    vector<Incident> incidents;
    vector<EmergencyService> policeStations;
    vector<EmergencyService> hospitals;
    vector<EmergencyService> publicPlaces;
    
public:
    void loadSafetyData(string incidentsFile, string hospitalsFile, 
                        string policeFile, string publicPlacesFile);
    SafetyResult analyzeRoute(vector<string> route);
    string getSafetyLevel(int score);
};

#endif