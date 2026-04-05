const User = require("../models/users");

function getUserByToken(token) {
  return User.findOne({ token: token }).then((data) => {
    return data;
  });
}

module.exports = getUserByToken;
