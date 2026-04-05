const mongoose = require('mongoose');

const { CONNECTION_STRING } = require ('../modules/env')

//connection à la base de donnée mongoose----------------------------------
mongoose.connect(CONNECTION_STRING, { connectTimeoutMS: 2000 })
  .then(() => console.log('Database connected'))
  .catch(error => console.error('Database connection error:',error));

  // Bonus : surveiller les déconnexions
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB déconnecté');
});