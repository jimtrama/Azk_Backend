const User = require('../models/users');
const Expense = require('./../models/expenses');
const File = require('./../models/files');
const cors = require('cors');

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
                            flag=true;
                            break loop1;
                        }
                    }
                }
            }
            if (expense.files[1]&&!flag) {
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
    app.post('/newexpense',async (req, res) => {
        let name = req.body.name;
        let cae = req.body.cae;
        let amount = req.body.amount;
        let active = req.body.active;
        let files = req.body.files;
        let project = req.body.project;
        const checkExistance = await Expense.find({"name":name});
        if(checkExistance.length>0){
            res.send({error:"name exists"});
            return;
        }
        
        const expense = new Expense({
            name,
            cae,
            amount,
            project,
            provider:"",
            afm:" ",
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
            let filesIds = [];
            if (expenses[i].files[1]) {
                expenses[i].files[1].forEach(arrayFiles => {
                    arrayFiles.forEach(file => {
                        if (file.stage == 6) {
                            filesIds.push(file.fileId);
                        }
                    })


                })
                let amount = 0;
                for (let i = 0; i < filesIds.length; i++) {
                    let doc = await File.findById(filesIds[i])
                    amount += doc.amount;
                }
                returnArray.push({ id: expenses[i]._id, amount: amount })

            }

        }
        res.send(returnArray);




    })
    app.post('/editexpense',(req,res)=>{
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
        Expense.findByIdAndUpdate(id,{cae,amount,provider,afm,active,project},(err,doc)=>{
            res.send({doc});
        })
        // Expense.findByIdAndUpdate(id,{name,cae,amount,provider,afm,active,project},(err,doc)=>{
        //     res.send({doc});
        // })
        
    })




}

module.exports = main;