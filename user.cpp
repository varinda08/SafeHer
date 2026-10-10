#include <iostream>
#include "user.h"

using namespace std;


// Constructor
User::User(
    string userID,
    string username,
    string name,
    string email,
    string phone,
    string password
) {
    this->userID = userID;
    this->username = username;
    this->name = name;
    this->email = email;
    this->phone = phone;
    this->password = password;
}


// Get User ID
string User::getUserID() const {
    return userID;
}


// Get Username
string User::getUsername() const {
    return username;
}


// Get Name
string User::getName() const {
    return name;
}


// Get Email
string User::getEmail() const {
    return email;
}


// Get Phone
string User::getPhone() const {
    return phone;
}


// Get Password
string User::getPassword() const {
    return password;
}


// Display Profile
void User::displayProfile() {

    cout << "\n=============================" << endl;
    cout << "       SAFEHER PROFILE" << endl;
    cout << "=============================" << endl;

    cout << "User ID  : " << userID << endl;
    cout << "Username : " << username << endl;
    cout << "Name     : " << name << endl;
    cout << "Email    : " << email << endl;
    cout << "Phone    : " << phone << endl;

    cout << "=============================" << endl;
}