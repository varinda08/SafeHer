#include <iostream>
#include <string>
#include <cstdlib>

#include "AuthManager.h"
#include "Route.h"
#include "RouteAPI.h"
#include "SafetyAnalyzer.h"
#include "GeocodingAPI.h"

using namespace std;


// ========================================
// USER MENU
// ========================================

void userMenu(User* loggedInUser)
{
    int choice;

    do
    {
        cout << "\n\n";
        cout << "================================" << endl;
        cout << "          SAFEHER MENU" << endl;
        cout << "================================" << endl;
        cout << "1. View Profile" << endl;
        cout << "2. Plan a Route" << endl;
        cout << "3. Logout" << endl;

        cout << "\nEnter your choice: ";
        cin >> choice;


        // ========================================
        // VIEW PROFILE
        // ========================================

        if (choice == 1)
        {
            loggedInUser->displayProfile();
        }


        // ========================================
        // PLAN A ROUTE
        // ========================================

        else if (choice == 2)
        {
            cout << "\n================================" << endl;
            cout << "          PLAN A ROUTE" << endl;
            cout << "================================" << endl;


            // ========================================
            // GET API KEY
            // ========================================

            const char* key = getenv("SAFEHER_API_KEY");

            if (key == nullptr)
            {
                cout << "\nAPI key not found!" << endl;
                cout << "Please set SAFEHER_API_KEY in PowerShell."
                     << endl;

                continue;
            }


            // ========================================
            // STARTING LOCATION
            // ========================================
            // TEMPORARY:
            // We are using Dehradun as the starting
            // location.
            //
            // Later we will replace this with
            // automatic current location.

            string startLocation = "Dehradun";

            double startLatitude = 30.327552;
            double startLongitude = 78.035881;


            // ========================================
            // DESTINATION
            // ========================================

            string destination;

            cin.ignore();

            cout << "\nStarting Location : "
                 << startLocation << endl;

            cout << "Enter destination: ";

            getline(cin, destination);


            // ========================================
            // GEOCODING API
            // ========================================

            GeocodingAPI geocodingAPI(key);


            // ========================================
            // DESTINATION COORDINATES
            // ========================================

            double destinationLatitude;
            double destinationLongitude;


            // ========================================
            // FIND DESTINATION
            // ========================================

            bool destinationFound =
                geocodingAPI.getCoordinates(
                    destination,
                    destinationLatitude,
                    destinationLongitude
                );


            if (!destinationFound)
            {
                cout << "\nDestination could not be found."
                     << endl;

                cout << "Please try another location."
                     << endl;

                continue;
            }


            // ========================================
            // DISPLAY LOCATION DETAILS
            // ========================================

            cout << "\n================================" << endl;
            cout << "       LOCATION DETAILS" << endl;
            cout << "================================" << endl;

            cout << "Starting Location : "
                 << startLocation << endl;

            cout << "Start Latitude    : "
                 << startLatitude << endl;

            cout << "Start Longitude   : "
                 << startLongitude << endl;


            cout << "\nDestination       : "
                 << destination << endl;

            cout << "Destination Latitude  : "
                 << destinationLatitude << endl;

            cout << "Destination Longitude : "
                 << destinationLongitude << endl;


            // ========================================
            // ROUTE API
            // ========================================

            cout << "\nFetching route..."
                 << endl;

            RouteAPI routeAPI(key);


            // IMPORTANT:
            // getRoute() returns a Route object,
            // NOT a Route pointer.

            Route route =
                routeAPI.getRoute(
                    startLatitude,
                    startLongitude,
                    destinationLatitude,
                    destinationLongitude
                );


            // ========================================
            // DISPLAY ROUTE
            // ========================================

            cout << "\n================================" << endl;
            cout << "          ROUTE DETAILS" << endl;
            cout << "================================" << endl;

            route.displayRoute();


            // ========================================
            // SAFETY ANALYSIS
            // ========================================

            SafetyAnalyzer analyzer;

            analyzer.displaySafetyAnalysis(route);
        }


        // ========================================
        // LOGOUT
        // ========================================

        else if (choice == 3)
        {
            cout << "\nLogging out..."
                 << endl;

            cout << "Thank you for using SafeHer!"
                 << endl;
        }


        // ========================================
        // INVALID CHOICE
        // ========================================

        else
        {
            cout << "\nInvalid choice!"
                 << endl;
        }

    }
    while (choice != 3);
}


// ========================================
// MAIN FUNCTION
// ========================================

int main()
{
    AuthManager auth;

    int choice;


    // ========================================
    // WELCOME
    // ========================================

    cout << "=============================" << endl;
    cout << "       WELCOME TO SAFEHER" << endl;
    cout << "    Your Travel Safety App" << endl;
    cout << "=============================" << endl;


    cout << "\n1. Register" << endl;
    cout << "2. Login" << endl;
    cout << "3. Exit" << endl;


    cout << "\nEnter your choice: ";
    cin >> choice;


    // ========================================
    // REGISTER
    // ========================================

    if (choice == 1)
    {
        string userID;
        string username;
        string name;
        string email;
        string phone;
        string password;


        cout << "\n----- REGISTER -----"
             << endl;


        cout << "Enter User ID: ";
        cin >> userID;


        cout << "Enter Username: ";
        cin >> username;


        cin.ignore();


        cout << "Enter Full Name: ";
        getline(cin, name);


        cout << "Enter Email: ";
        cin >> email;


        cout << "Enter Phone Number: ";
        cin >> phone;


        cout << "Enter Password: ";
        cin >> password;


        bool success =
            auth.registerUser(
                userID,
                username,
                name,
                email,
                phone,
                password
            );


        if (success)
        {
            cout << "\n================================"
                 << endl;

            cout << "Registration successful!"
                 << endl;

            cout << "You can now login."
                 << endl;

            cout << "================================"
                 << endl;
        }
    }


    // ========================================
    // LOGIN
    // ========================================

    else if (choice == 2)
    {
        string username;
        string password;


        cout << "\n----- LOGIN -----"
             << endl;


        cout << "Username: ";
        cin >> username;


        cout << "Password: ";
        cin >> password;


        User* loggedInUser =
            auth.login(
                username,
                password
            );


        if (loggedInUser != nullptr)
        {
            cout << "\nLogin successful!"
                 << endl;

            cout << "Welcome, "
                 << loggedInUser->getName()
                 << "!"
                 << endl;


            userMenu(loggedInUser);
        }
        else
        {
            cout << "\nInvalid username "
                 << "or password!"
                 << endl;
        }
    }


    // ========================================
    // EXIT
    // ========================================

    else if (choice == 3)
    {
        cout << "\nThank you for using SafeHer!"
             << endl;
    }


    // ========================================
    // INVALID MAIN MENU CHOICE
    // ========================================

    else
    {
        cout << "\nInvalid choice!"
             << endl;
    }


    return 0;
}