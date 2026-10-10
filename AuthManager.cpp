#include <iostream>
#include <fstream>
#include <sstream>
#include <cctype>

#include "AuthManager.h"

using namespace std;


// ========================================
// CONSTRUCTOR
// ========================================

AuthManager::AuthManager() {

    loadUsers();
}


// ========================================
// LOAD USERS FROM FILE
// ========================================

void AuthManager::loadUsers() {

    ifstream file("data/users.txt");

    if (!file.is_open()) {

        cout << "Warning: users.txt could not be opened."
             << endl;

        return;
    }

    string line;

    while (getline(file, line)) {

        if (line.empty()) {
            continue;
        }

        stringstream ss(line);

        string userID;
        string username;
        string name;
        string email;
        string phone;
        string password;

        getline(ss, userID, '|');
        getline(ss, username, '|');
        getline(ss, name, '|');
        getline(ss, email, '|');
        getline(ss, phone, '|');
        getline(ss, password, '|');

        User user(
            userID,
            username,
            name,
            email,
            phone,
            password
        );

        users.push_back(user);
    }

    file.close();
}


// ========================================
// EMAIL VALIDATION
// ========================================

bool AuthManager::isValidEmail(string email) {

    size_t atPosition = email.find('@');

    size_t dotPosition =
        email.find('.', atPosition);

    if (atPosition == string::npos) {
        return false;
    }

    if (dotPosition == string::npos) {
        return false;
    }

    if (atPosition == 0) {
        return false;
    }

    if (dotPosition == atPosition + 1) {
        return false;
    }

    if (dotPosition == email.length() - 1) {
        return false;
    }

    return true;
}


// ========================================
// PHONE VALIDATION
// ========================================

bool AuthManager::isValidPhone(string phone) {

    if (phone.length() != 10) {
        return false;
    }

    for (char ch : phone) {

        if (!isdigit(ch)) {
            return false;
        }
    }

    return true;
}


// ========================================
// USERNAME VALIDATION
// ========================================

bool AuthManager::isValidUsername(string username) {

    if (username.length() < 3) {
        return false;
    }

    for (char ch : username) {

        if (isspace(ch)) {
            return false;
        }
    }

    return true;
}


// ========================================
// PASSWORD VALIDATION
// ========================================

bool AuthManager::isValidPassword(string password) {

    if (password.length() < 6) {
        return false;
    }

    return true;
}


// ========================================
// REGISTER USER
// ========================================

bool AuthManager::registerUser(
    string userID,
    string username,
    string name,
    string email,
    string phone,
    string password
) {

    // Username validation
    if (!isValidUsername(username)) {

        cout << "\nUsername must contain at least "
             << "3 characters and no spaces."
             << endl;

        return false;
    }


    // Email validation
    if (!isValidEmail(email)) {

        cout << "\nInvalid email format."
             << endl;

        return false;
    }


    // Phone validation
    if (!isValidPhone(phone)) {

        cout << "\nPhone number must contain exactly "
             << "10 digits."
             << endl;

        return false;
    }


    // Password validation
    if (!isValidPassword(password)) {

        cout << "\nPassword must contain at least "
             << "6 characters."
             << endl;

        return false;
    }


    // Duplicate checking
    for (User& user : users) {

        if (user.getUserID() == userID) {

            cout << "\nThis User ID is already registered!"
                 << endl;

            return false;
        }


        if (user.getUsername() == username) {

            cout << "\nUsername already exists!"
                 << endl;

            return false;
        }


        if (user.getEmail() == email) {

            cout << "\nThis email is already registered!"
                 << endl;

            return false;
        }


        if (user.getPhone() == phone) {

            cout << "\nThis phone number is already registered!"
                 << endl;

            return false;
        }
    }


    // Create new user
    User newUser(
        userID,
        username,
        name,
        email,
        phone,
        password
    );


    // Save user first
    bool saved = saveUser(newUser);

    if (!saved) {

        cout << "\nRegistration failed because "
             << "user data could not be saved."
             << endl;

        return false;
    }


    // Add user to memory
    users.push_back(newUser);

    return true;
}


// ========================================
// SAVE USER TO users.txt
// ========================================

bool AuthManager::saveUser(const User& user) {

    ofstream file(
        "data/users.txt",
        ios::app
    );

    if (!file.is_open()) {

        cout << "\nError: Could not open users.txt"
             << endl;

        return false;
    }


    file << user.getUserID() << "|"
         << user.getUsername() << "|"
         << user.getName() << "|"
         << user.getEmail() << "|"
         << user.getPhone() << "|"
         << user.getPassword()
         << endl;


    file.close();

    return true;
}


// ========================================
// LOGIN
// ========================================

User* AuthManager::login(
    string username,
    string password
) {

    for (User& user : users) {

        if (
            user.getUsername() == username &&
            user.getPassword() == password
        ) {

            return &user;
        }
    }

    return nullptr;
}