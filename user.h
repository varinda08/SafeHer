#ifndef USER_H
#define USER_H

#include <string>

using namespace std;

class User {

private:
    string userID;
    string username;
    string name;
    string email;
    string phone;
    string password;

public:

    User(
        string userID,
        string username,
        string name,
        string email,
        string phone,
        string password
    );

    string getUserID() const;
    string getUsername() const;
    string getName() const;
    string getEmail() const;
    string getPhone() const;
    string getPassword() const;

    void displayProfile();
};

#endif