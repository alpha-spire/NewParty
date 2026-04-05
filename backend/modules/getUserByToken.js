const User = require("../models/users");

//Fonction qui permet de récupérer dans la BDD un utilisateur à partir de son token
function getUserByToken(token) {
    return User.findOne({ token: token }).then((data) => {
        return data;
    });
}

module.exports = getUserByToken;
