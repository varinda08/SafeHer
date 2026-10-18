#include <iostream>
#include <cstdio>
#include <string>
#include <cctype>

#include "GeocodingAPI.h"

using namespace std;


// ========================================
// Constructor
// ========================================

GeocodingAPI::GeocodingAPI(string apiKey)
{
    this->apiKey = apiKey;
}


// ========================================
// URL Encoding
// ========================================

string encodeURL(string text)
{
    string result = "";

    for (char ch : text)
    {
        if (ch == ' ')
        {
            result += "%20";
        }
        else
        {
            result += ch;
        }
    }

    return result;
}


// ========================================
// Extract Coordinates from JSON
// ========================================

bool extractCoordinates(
    const string& json,
    double& longitude,
    double& latitude
)
{
    size_t position =
        json.find("\"coordinates\"");

    if (position == string::npos)
    {
        return false;
    }


    // Find opening [ of coordinates array

    position =
        json.find(
            '[',
            position
        );

    if (position == string::npos)
    {
        return false;
    }

    position++;


    // ========================================
    // Read Longitude
    // ========================================

    while (
        position < json.length() &&
        (
            json[position] == ' ' ||
            json[position] == '\n' ||
            json[position] == '\r'
        )
    )
    {
        position++;
    }


    size_t start = position;


    while (
        position < json.length() &&
        (
            isdigit(
                static_cast<unsigned char>(
                    json[position]
                )
            ) ||
            json[position] == '.' ||
            json[position] == '-'
        )
    )
    {
        position++;
    }


    if (start == position)
    {
        return false;
    }


    string longitudeText =
        json.substr(
            start,
            position - start
        );


    // ========================================
    // Find comma
    // ========================================

    position =
        json.find(
            ',',
            position
        );

    if (position == string::npos)
    {
        return false;
    }

    position++;


    // ========================================
    // Read Latitude
    // ========================================

    while (
        position < json.length() &&
        (
            json[position] == ' ' ||
            json[position] == '\n' ||
            json[position] == '\r'
        )
    )
    {
        position++;
    }


    start = position;


    while (
        position < json.length() &&
        (
            isdigit(
                static_cast<unsigned char>(
                    json[position]
                )
            ) ||
            json[position] == '.' ||
            json[position] == '-'
        )
    )
    {
        position++;
    }


    if (start == position)
    {
        return false;
    }


    string latitudeText =
        json.substr(
            start,
            position - start
        );


    // ========================================
    // Convert to double
    // ========================================

    try
    {
        longitude =
            stod(longitudeText);

        latitude =
            stod(latitudeText);
    }
    catch (...)
    {
        return false;
    }


    return true;
}


// ========================================
// Get Coordinates
// ========================================

bool GeocodingAPI::getCoordinates(
    string location,
    double& latitude,
    double& longitude
)
{
    // IMPORTANT:
    // Use cerr for debug messages.
    // stdout must remain clean for JSON response.

    cerr << "\nSearching for: "
         << location
         << endl;


    // ----------------------------------------
    // Encode location
    // ----------------------------------------

    string encodedLocation =
        encodeURL(location);


    // ----------------------------------------
    // HEIGIT / Pelias endpoint
    // ----------------------------------------

    string url =
        "https://api.heigit.org/pelias/v1/search"
        "?api_key=" +
        apiKey +
        "&text=" +
        encodedLocation;


    // ----------------------------------------
    // CURL command
    // ----------------------------------------

    string command =
        "curl.exe -s \"" +
        url +
        "\"";


    FILE* pipe =
        _popen(
            command.c_str(),
            "r"
        );


    if (pipe == nullptr)
    {
        cerr << "\nCould not connect to "
             << "Geocoding API."
             << endl;

        return false;
    }


    // ----------------------------------------
    // Read API response
    // ----------------------------------------

    string response;

    char buffer[4096];


    while (
        fgets(
            buffer,
            sizeof(buffer),
            pipe
        ) != nullptr
    )
    {
        response += buffer;
    }


    _pclose(pipe);


    // ----------------------------------------
    // Check response
    // ----------------------------------------

    if (response.empty())
    {
        cerr << "\nNo response received "
             << "from Geocoding API."
             << endl;

        return false;
    }


    // ----------------------------------------
    // Extract coordinates
    // ----------------------------------------

    if (
        !extractCoordinates(
            response,
            longitude,
            latitude
        )
    )
    {
        cerr << "\nCould not find coordinates "
             << "for this location."
             << endl;

        return false;
    }


    // ----------------------------------------
    // Display coordinates
    // ----------------------------------------

    cerr << "\nLocation found!"
         << endl;

    cerr << "Latitude  : "
         << latitude
         << endl;

    cerr << "Longitude : "
         << longitude
         << endl;


    return true;
}