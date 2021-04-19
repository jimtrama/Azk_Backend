const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const fileupload = require("express-fileupload");
const app = express();
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const UsersModel = require('./app/models/users');
require('dotenv').config();

const port = 8443;


mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);

// We had to remove one extra item that is present due to
// an extra line at the end of the file.
// This may or may not be needed depending on the formatting
// of your .ca-bundle file.


const options = {
    // key: fs.readFileSync('./private.key'),
    // cert: fs.readFileSync('./certificate.crt'),
    // ca: fs.readFileSync('./ca_bundle.crt')
};
app.use(fileupload());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.REACT_APP_SITE }));

let key = "";
app.get('/login', (req, res) => {

    let uname = req.headers.username;
    let pword = req.headers.password;
    console.log(uname, pword);

    UsersModel.find({ username: uname, password: pword }, (er, docs) => {
        if (docs.length > 1) {
            res.send({ "success": "same username and pass exists in db " });
        } else if (docs.length == 1) {
            key = "jim"
            console.log({ data: docs[0] });
            res.send({ data: docs[0] });
        } else {
            res.send({ "success": false });
        }
    })

})
app.use((req, res, next) => {
    let keyFromRequest = req.headers.key;
    if (key !== keyFromRequest) {
        next();
    } else {

        res.send("not a valid key")
        return;
    }

})

require('./app/routes')(app)


mongoose.connect("mongodb://localhost:27017/azk").then((res) => {
    //console.log(res);
    console.log("Connected to Db");
    http.createServer(app).listen(port, () => {
        console.log("Server Running \nPORT " + port);
    });

}).catch(e => console.log(e));




