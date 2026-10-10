#ifndef AUTHMANAGER_H
#define AUTHMANAGER_H

#include <vector>
#include <string>

#include "user.h"

using namespace std;

class AuthManager {

private:

    vector<User> users;

    void loadUsers();

    bool isValidEmail(string email);
    bool isValidPhone(string phone);
    bool isValidUsername(string username);
    bool isValidPassword(string password);

public:

    AuthManager();

    bool registerUser(
        string userID,
        string username,
        string name,
        string email,
        string phone,
        string password
    );

    User* login(
        string username,
        string password
    );

    bool saveUser(const User& user);
};

#endif