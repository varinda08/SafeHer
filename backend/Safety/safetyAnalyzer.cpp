#include "safetyAnalyzer.h"
#include <fstream>
#include <sstream>
#include <iostream>
#include <algorithm>

void SafetyAnalyzer::loadSafetyData(string incidentsFile, string hospitalsFile, 
                                     string policeFile, string publicPlacesFile) {
    ifstream file;
    
    // Load incidents
    file.open(incidentsFile);
    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            stringstream ss(line);
            string token;
            vector<string> tokens;
            
            while (getline(ss, token, '|')) {
                tokens.push_back(token);
            }
            
            if (tokens.size() >= 4) {
                int id = stoi(tokens[0]);
                string location = tokens[1];
                string type = tokens[2];
                int severity = stoi(tokens[3]);
                incidents.push_back(Incident(id, location, type, severity));
            }
        }
        file.close();
    }
    
    // Load hospitals
    file.open(hospitalsFile);
    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            stringstream ss(line);
            string token;
            vector<string> tokens;
            
            while (getline(ss, token, '|')) {
                tokens.push_back(token);
            }
            
            if (tokens.size() >= 2) {
                string location = tokens[0];
                string name = tokens[1];
                hospitals.push_back(EmergencyService(location, name));
            }
        }
        file.close();
    }
    
    // Load police stations
    file.open(policeFile);
    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            stringstream ss(line);
            string token;
            vector<string> tokens;
            
            while (getline(ss, token, '|')) {
                tokens.push_back(token);
            }
            
            if (tokens.size() >= 2) {
                string location = tokens[0];
                string name = tokens[1];
                policeStations.push_back(EmergencyService(location, name));
            }
        }
        file.close();
    }
    
    // Load public places
    file.open(publicPlacesFile);
    if (file.is_open()) {
        string line;
        while (getline(file, line)) {
            stringstream ss(line);
            string token;
            vector<string> tokens;
            
            while (getline(ss, token, '|')) {
                tokens.push_back(token);
            }
            
            if (tokens.size() >= 2) {
                string location = tokens[0];
                string name = tokens[1];
                publicPlaces.push_back(EmergencyService(location, name));
            }
        }
        file.close();
    }
}

string SafetyAnalyzer::getSafetyLevel(int score) {
    if (score <= 1) return "Very Low Safety";
    else if (score <= 3) return "Low Safety";
    else if (score <= 5) return "Moderate Safety";
    else if (score <= 7) return "Good Safety";
    else return "High Safety";
}

SafetyResult SafetyAnalyzer::analyzeRoute(vector<string> route) {
    SafetyResult result;
    result.safetyScore = 0;
    result.policeStationsCount = 0;
    result.hospitalsCount = 0;
    result.publicPlacesCount = 0;
    result.incidentsCount = 0;
    
    // Check police stations
    for (const string& location : route) {
        for (const EmergencyService& station : policeStations) {
            if (station.location == location) {
                result.policeStationsCount++;
                result.safetyScore++;
                result.reasons.push_back("+1 Police Station at " + location + " (" + station.name + ")");
            }
        }
    }
    
    // Check hospitals
    for (const string& location : route) {
        for (const EmergencyService& hospital : hospitals) {
            if (hospital.location == location) {
                result.hospitalsCount++;
                result.safetyScore++;
                result.reasons.push_back("+1 Hospital at " + location + " (" + hospital.name + ")");
            }
        }
    }
    
    // Check public places
    for (const string& location : route) {
        for (const EmergencyService& place : publicPlaces) {
            if (place.location == location) {
                result.publicPlacesCount++;
                result.safetyScore++;
                result.reasons.push_back("+1 Public Place at " + location + " (" + place.name + ")");
            }
        }
    }
    
    // Check incidents
    for (const string& location : route) {
        for (const Incident& incident : incidents) {
            if (incident.location == location) {
                result.incidentsCount++;
                result.safetyScore--;
                result.reasons.push_back("-1 Incident at " + location + " (" + incident.type + ")");
            }
        }
    }
    
    result.safetyLevel = getSafetyLevel(result.safetyScore);
    return result;
}