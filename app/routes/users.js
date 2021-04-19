const User = require('./../models/users');
const fs = require('fs');
var cors = require('cors');
let pathToDir = "C:/Signs";
let pathToDirAvatar = "C:/Avatars";
function main(app) {
    //app.use(cors({ origin: "*" }));

    app.get('/users', (req, res) => {
        User.find().then(result => res.send(result));
    })
    app.get('/user', (req, res) => {
        let id = req.headers.userId;
        User.findById(id).then(result => {
            res.send(result);
        })

    })
    app.post("/edituser", async (req, res) => {
        let id = req.body.id
        let data = JSON.parse(req.body.data);
        let sign = null;
        let avatar = null;
        if (req.files) {
            sign = req.files.sign;
            avatar = req.files.avatar;
        }

        let dataToUpDate = {};

        for (let obj of data) {
            console.log(obj);
            for (let key in obj) {
                dataToUpDate[key] = obj[key];
            }
        }
        
        if (Object.keys(dataToUpDate).length === 0 && !sign && !avatar) {
            res.send({ success: "notthing to update" });
            return;
        }

        let user = await User.findById(id);

        let avatarPath = user.avatar;
        let signPath = user.sign;
        if (avatarPath && avatar) {
            fs.unlinkSync(avatarPath);
        }
        if (signPath && sign) {
            fs.unlinkSync(signPath);
        }
        if (sign) {
            dataToUpDate["sign"] = pathToDir + "/" + sign.name;
        }
        if (avatar) {
            dataToUpDate["avatar"] = pathToDirAvatar + "/" + avatar.name;
        }
        console.log(dataToUpDate);
        User.findByIdAndUpdate(id, dataToUpDate, (err, docs) => {
            if (sign) {
                fs.writeFileSync(pathToDir + "/" + sign.name, new Buffer.from(sign.data));
            }
            if (avatar) {
                fs.writeFileSync(pathToDirAvatar + "/" + avatar.name, new Buffer.from(avatar.data));
            }

            res.send({ success: true });
        }).catch(e => { console.log(e); res.send({ success: "error on writing files" }) });



    })
    app.post('/newuser', (req, res) => {
        let username = req.body.username;
        let password = req.body.password;
        let file = req.files.file;
        let fileName = file.name;
        if (file === null) {
            res.send({ "error": "can't create user without a sign" });
            res.end();
        }
        User.find({ username: username }, (err, docs) => {
            if (docs.length > 0) {
                res.send({ 'error': 'user Already exists' });
                res.end();
            } else {
                const user = new User({
                    "username": username,
                    "password": password,
                    "sign": pathToDir + "/" + fileName
                })

                user.save().then((result) => {

                    fs.writeFileSync(pathToDir + "/" + fileName, new Buffer.from(file.data));
                    res.send(result);
                }).catch(e => { console.log(e); res.send("error") });
            }
        })




    })
    app.get("/userimg", (req, res) => {
        let path = decodeURIComponent(req.headers.avatar, "utf-8");
        let data = fs.readFileSync(path);
        res.send(data);
    })


}

module.exports = main;