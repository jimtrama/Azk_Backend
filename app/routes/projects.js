const Project = require('./../models/projects');
const cors = require('cors');
function main(app) {
    app.use(cors({ origin: process.env.REACT_APP_SITE }));
    app.get('/projects', (req, res) => {
        Project.find().then(result => res.send(result));
    })
    app.get('/project', (req, res) => {
        let projectId = req.headers.projectId;
        if (projectId !== undefined) {
            Project.findById(projectId, (err, doc) => {
                if (!err) {
                    res.send(doc);
                } else {
                    console.log(err);
                    res.send(err);
                }
            })
        } else {
            res.send({ "error": "an id is needed" });
        }
    })
    app.get('/deleteproject', (req, res) => {
        let projectId = req.headers.projectid;
        if (projectId !== undefined) {
            Project.findByIdAndDelete(projectId, (err, doc) => {
                if (!err) {
                    res.send({ success: true });
                } else {
                    console.log(err);
                    res.send(err);
                }
            })
        } else {
            res.send({ "error": "an id is needed" });
        }
    })
    app.post('/newproject', (req, res) => {
        let name = req.body.name;
        if (name !== undefined) {
            Project.find({ name }, (err, doc) => {
                if (doc.length == 0) {
                    let project = Project({
                        name
                    })
                    project.save().then(result => res.send({ data: result, success: true }))
                        .catch(err => {
                            console.log(err);
                            res.send(err);
                        })
                }else{
                    res.send({error:"Project Already Exists"});
                }
            })

        }
    })



}

module.exports = main;