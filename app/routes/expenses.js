const User = require('../models/users');
const Expense = require('./../models/expenses');
const File = require('./../models/files');
const cors = require('cors');
const fs = require('fs')

function main(app) {
    app.use(cors({ origin: process.env.REACT_APP_SITE }));
    app.get('/expenses', (req, res) => {
        Expense.find().then(result => res.send(result));
    })
    app.get('/expensestosign', async (req, res) => {
        let name = req.headers.name;
        let expensesToReturn = [];
        let expenses = await Expense.find();
        for (let index = 0; index < expenses.length; index++) {
            const expense = expenses[index];
            let flag = false;

            if (expense.files[0]) {
                loop1:
                for (let i = 0; i < expense.files[0].length; i++) {
                    const file = expense.files[0][i];
                    for (let k = 0; k < file.users.length; k++) {
                        const user = file.users[k];
                        if (user.username == name && !user.signed) {
                            expensesToReturn.push(expense);
                            flag = true;
                            break loop1;
                        }
                    }
                }
            }
            if (expense.files[1] && !flag) {
                loop2:
                for (let i = 0; i < expense.files[1].length; i++) {
                    const arrayOffiles = expense.files[1][i];
                    for (let j = 0; j < arrayOffiles.length; j++) {
                        const file = arrayOffiles[j];
                        for (let k = 0; k < file.users.length; k++) {
                            const user = file.users[k];
                            if (user.username == name && !user.signed) {
                                expensesToReturn.push(expense);
                                break loop2;
                            }
                        }

                    }


                }

            }
        }
        res.send(expensesToReturn);

    })
    app.get('/expenses/active', (req, res) => {

        Expense.find({ "active": 1 }).then(result => {
            if (result) {
                res.send(result);
            }
        })

    })
    app.get('/expenses/archived', (req, res) => {
        Expense.find({ "active": 0 }).then(result => {
            if (result) {
                res.send(result);
            }
        })

    })
    app.get('/expenses/:id', (req, res) => {
        let id = req.params.id;
        Expense.findById(id).then(result => {
            if (result) {
                res.send(result);
            }
        })

    })
    app.post('/newexpense', async (req, res) => {
        let name = req.body.name;
        let cae = req.body.cae;
        let amount = req.body.amount;
        let active = req.body.active;
        let afm = req.body.afm;
        let files = req.body.files;
        let project = req.body.project;
        const checkExistance = await Expense.find({ "name": name });
        if (checkExistance.length > 0) {
            res.send({ error: "name exists" });
            return;
        }

        const expense = new Expense({
            name,
            cae,
            amount,
            project,
            provider: "",
            afm,
            active,
            files
        })
        expense.save().then((result) => {
            res.send(result);
        }).catch(e => { console.log(e); res.send("error") });
    })
    app.get('/fileamount', async (req, res) => {
        let expenses = await Expense.find()
        let returnArray = [];
        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].files[1]) {
                let amount = 0;
                for (let j = 0; j < expenses[i].files[1].length; j++) {
                    for (let k = 0; k < expenses[i].files[1][j].length; k++) {
                        if (expenses[i].files[1][j][k].stage == 6) {

                            let doc = await File.findById(expenses[i].files[1][j][k].fileId);

                            let signedUsers = 0;
                            for (let i = 0; i < doc.users.length; i++) {
                                if (doc.users[i].signed) {
                                    signedUsers++;

                                }
                            }

                            if (signedUsers == doc.users.length) {
                                amount += doc.amount;
                            }


                            returnArray.push({ id: expenses[i]._id, amount: amount })
                        }
                    }


                }


            }

        }

        res.send({ data: returnArray });




    })
    app.post('/editexpense', (req, res) => {
        console.log(req.body);
        let name = req.body.name;
        let cae = req.body.cae;
        let amount = req.body.amount;
        let provider = req.body.provider;
        let afm = req.body.afm;
        let active = req.body.active;
        let project = req.body.project;
        let id = req.body.expId;
        console.log(provider);
        Expense.findByIdAndUpdate(id, { cae, amount, provider, afm, active, project }, (err, doc) => {
            res.send({ doc });
        })
        // Expense.findByIdAndUpdate(id,{name,cae,amount,provider,afm,active,project},(err,doc)=>{
        //     res.send({doc});
        // })

    })
    app.post('/delexpense', async (req, res) => {
        console.log(req.body);
        let id = req.body.id;
        let name = req.body.name;
        let date = req.body.date;
        let filesId = JSON.parse(req.body.data);
        let flag = true;
        let pathToexpenseFolder = "/";
        for (let id of filesId) {
            if (flag) {
                let file = await File.findByIdAndDelete(id);
                console.log(file);
                let found = false
                pathToexpenseFolder += file.path.split("/").map(folder => {
                    if (folder.includes(name)) {
                        found = true;
                        return folder;
                    } else
                        if (!found) {
                            return folder;
                        } else {
                            return null;
                        }
                }).filter(l => { if (l) return true }).join("/")

                flag = false;
            } else {
                await File.findByIdAndDelete(id);
            }


        }
        await Expense.findByIdAndDelete(id);
        fs.rmdirSync(pathToexpenseFolder, { recursive: true }, (err) => {
            if (err) {
                console.log(err);
                res.send({ ok: false })
                return;
            }
            console.log("file " + pathToexpenseFolder + " is deleted");
        });


        res.send({ ok: true })


    })




}

module.exports = main;