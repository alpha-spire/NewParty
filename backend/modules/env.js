//charge les variables d'environnement définies dans le fichier .env
//si appli lancée en mode test, on charge le fichier ".env.test"
//sinon on charge le fichier ".env"
require("dotenv").config({path:process.env.NODE_ENV=="test" ? ".env.test" : ".env"})

const CONNECTION_STRING = process.env.CONNECTION_STRING;

if (!CONNECTION_STRING) {
  console.error("error missing CONNECTION_STRING");
}

module.exports = { CONNECTION_STRING };
