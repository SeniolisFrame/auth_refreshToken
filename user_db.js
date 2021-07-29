const mongoose = require('mongoose');

const dbURL = process.env.DB_URL;

const option = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

mongoose.connect(dbURL,option).then(
    () => {
        console.log(`Database uri: ${dbURL} Connected`);
    }).catch(
    (err) => {
        console.log(err);
    }
);
