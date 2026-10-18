#include <iostream>
#include <cstdio>
#include <string>
#include <cstdlib>

#include "RouteAPI.h"

using namespace std;


// Extract a numeric value from JSON
double extractValue(const string& json, const string& key)
{
    string searchKey = "\"" + key + "\"";

    size_t pos = json.find(searchKey);

    if (pos == string::npos)
        return -1;

    pos = json.find(':', pos + searchKey.length());

    if (pos == string::npos)
        return -1;

    pos++;

    while (pos < json.length() &&
           (json[pos] == ' ' || json[pos] == '\n' ||
            json[pos] == '\r' || json[pos] == '\t'))
    {
        pos++;
    }

    size_t end = pos;

    while (end < json.length() &&
           (isdigit(static_cast<unsigned char>(json[end])) ||
            json[end] == '.' || json[end] == '-'))
    {
        end++;
    }

    if (end == pos)
        return -1;

    try
    {
        return stod(json.substr(pos, end - pos));
    }
    catch (...)
    {
        return -1;
    }
}


// Constructor
RouteAPI::RouteAPI(string apiKey)
{
    this->apiKey = apiKey;
}


// Get route from OpenRouteService
bool RouteAPI::getRoute(
    double startLatitude,
    double startLongitude,
    double endLatitude,
    double endLongitude,
    double& distanceKm,
    double& durationMinutes
)
{
    cerr << "\nConnecting to OpenRouteService..." << endl;

    if (apiKey.empty())
    {
        cerr << "ERROR: API key is empty." << endl;
        return false;
    }

    // OpenRouteService requires longitude,latitude
    string url =
        "https://api.openrouteservice.org/v2/directions/"
        "driving-car?api_key=" + apiKey +
        "&start=" + to_string(startLongitude) +
        "," + to_string(startLatitude) +
        "&end=" + to_string(endLongitude) +
        "," + to_string(endLatitude);

    // Capture both response body and HTTP status
    string command =
        "curl.exe -sS -w \"\\nHTTP_STATUS:%{http_code}\" \"" +
        url + "\"";

    FILE* pipe = _popen(command.c_str(), "r");

    if (pipe == nullptr)
    {
        cerr << "ERROR: Could not start curl." << endl;
        return false;
    }

    string response;
    char buffer[4096];

    while (fgets(buffer, sizeof(buffer), pipe) != nullptr)
    {
        response += buffer;
    }

    int result = _pclose(pipe);

    if (result != 0)
    {
        cerr << "ERROR: curl request failed." << endl;
        cerr << response << endl;
        return false;
    }

    // Read HTTP status marker
    string marker = "\nHTTP_STATUS:";
    size_t statusPos = response.rfind(marker);

    if (statusPos == string::npos)
    {
        cerr << "ERROR: Could not read HTTP status." << endl;
        cerr << response << endl;
        return false;
    }

    string statusText = response.substr(
        statusPos + marker.length()
    );

    int httpStatus = atoi(statusText.c_str());

    // Remove status marker, leaving only JSON
    response = response.substr(0, statusPos);

    if (httpStatus != 200)
    {
        cerr << "API HTTP Error: " << httpStatus << endl;
        cerr << "Response: " << response << endl;
        return false;
    }

    // GET endpoint returns GeoJSON; distance/duration
    // are included in its route properties.
    double distanceMeters = extractValue(response, "distance");
    double durationSeconds = extractValue(response, "duration");

    if (distanceMeters < 0 || durationSeconds < 0)
    {
        cerr << "ERROR: Route details not found in API response."
             << endl;
        cerr << response << endl;
        return false;
    }

    distanceKm = distanceMeters / 1000.0;
    durationMinutes = durationSeconds / 60.0;

    cerr << "Route API successful!" << endl;
    cerr << "Distance: " << distanceKm << " km" << endl;
    cerr << "Duration: " << durationMinutes << " minutes" << endl;

    return true;
}