const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const File = require('./../models/files');
const Expense = require('./../models/expenses');
const User = require('./../models/users')
const cors = require('cors');
const pathToDir = "/Users/jim/Desktop/data/expenses";
function main(app) {
    app.use(cors({ origin: `${process.env.REACT_APP_SITE}` }));
    app.get('/', async (req, res) => {
        // let expenses = await Expense.find();
        // let c =0;
        // for (let i = 0; i < expenses.length; i++) {
        //     if (expenses[i].files[0]) {
        //         for (let j = 0; j < expenses[i].files[0].length; j++) {
        //             let searchString = expenses[i].files[0][j].path.split('/')[2].split(',')[0].trim()
        //             if (!searchString.includes(expenses[i].name)) {
        //                 let fileToChange = expenses[i].files[0][j];
        //                 c++;
        //                 expenses[i].files[0].splice(j, 1);
        //                 if (fileToChange) {
        //                     for (let ic = 0; ic < expenses.length; ic++) {
        //                         let searchSecond =fileToChange.path.split('/')[2].split(',')[0].trim()
        //                         if (searchSecond.includes(expenses[ic].name)) {
        //                             if (expenses[ic].files[0]) {
        //                                 expenses[ic].files[0].push(fileToChange);
        //                                 console.log("something changed");

        //                             }else{
        //                                 expenses[ic].files.push([])
        //                                 expenses[ic].files.push([])
        //                                 expenses[ic].files[0].push(fileToChange);
        //                                 console.log("something changed add");

        //                             }

        //                         }

        //                     }
        //                 }

        //             }

        //         }
        //     }


        // }
        //let expenses = await JSON.parse( new String(fs.readFileSync('C:/Users/kostas/Desktop/db.txt')))
        // let s = await Expense.deleteMany({});
        // for (const expense of expenses) {
        //     let {files,name,active,cae,amount,project,provider,afm} = expense;
        //     let sa = new Expense({name,files,active,project,provider,cae,amount,afm});
        //     let t= await sa.save();
        // }

        //res.send(.pr)
    })
    app.get('/files', (req, res) => {
        File.find().then(result => res.send(result));
    })
    app.post('/upload', async (req, res) => {
        let expenseId = req.body.expenseId;
        let name = req.files.file.name;
        let substage = req.body.substage;

        let expense = await Expense.findById(expenseId);
        let path = "";
        let dirs = fs.readdirSync(pathToDir);
        for (let dir of dirs) {
            if (dir.includes(expense.name)) {
                path = path = pathToDir + '/' + dir;
                break;
            }
        }
        if (path == "") {
            path = pathToDir + '/' + expense.name + "," + new Date().toDateString();
            fs.mkdir(path, { recursive: true }, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("dir made suss");
                }
            });
        }

        let users = JSON.parse(req.body.users);

        let stage = req.body.stage;
        let fileExists = true;
        try {
            fs.readFileSync(path + "/" + name)
        } catch (e) {
            fileExists = false;
        }




        if (!fileExists) {
            fs.writeFileSync(path + "/" + name, new Buffer.from(req.files.file.data));
            let amount = req.body.amount;
            let file;
            if (amount) {
                file = new File({
                    "name": name,
                    "path": path + "/" + name,
                    "stage": stage,
                    "substage": substage,
                    "users": users,
                    "amount": amount
                })
            } else {
                file = new File({
                    "name": name,
                    "path": path + "/" + name,
                    "stage": stage,
                    "substage": substage,
                    "users": users
                })
            }


            let result = await file.save();
            let currentExpenseToUpdate = await Expense.findById(expenseId);

            if (result.stage < 4) {
                if (currentExpenseToUpdate.files[0] == undefined) {
                    currentExpenseToUpdate.files[0] = [{
                        fileId: result._id,
                        name: result.name,
                        path: result.path,
                        stage: result.stage,
                        substage: substage,
                        users: result.users
                    }]

                } else {
                    currentExpenseToUpdate.files[0] = [...currentExpenseToUpdate.files[0], {
                        fileId: result._id,
                        name: result.name,
                        path: result.path,
                        stage: result.stage,
                        substage: substage,
                        users: result.users
                    }]
                }
            } else {

                if (currentExpenseToUpdate.files[1] == undefined) {
                    currentExpenseToUpdate.files[1] = [];
                    for (let i = 0; i < result.substage; i++) {
                        console.log(currentExpenseToUpdate.files[1][i]);

                        currentExpenseToUpdate.files[1][i] = [];


                    }
                    currentExpenseToUpdate.files[1][result.substage] = [{
                        fileId: result._id,
                        name: result.name,
                        path: result.path,
                        stage: result.stage,
                        substage: substage,
                        users: result.users
                    }]

                } else {
                    for (let i = 0; i < result.substage; i++) {
                        console.log(currentExpenseToUpdate.files[1][i]);
                        if (currentExpenseToUpdate.files[1][i] == undefined) {
                            currentExpenseToUpdate.files[1][i] = [];
                        }

                    }
                    if (currentExpenseToUpdate.files[1][result.substage] == undefined) {
                        console.log("q");
                        currentExpenseToUpdate.files[1][result.substage] = [{
                            fileId: result._id,
                            name: result.name,
                            path: result.path,
                            stage: result.stage,
                            substage: substage,
                            users: result.users
                        }]
                    } else {
                        console.log("g");
                        currentExpenseToUpdate.files[1][result.substage] = [...currentExpenseToUpdate.files[1][result.substage], {
                            fileId: result._id,
                            name: result.name,
                            path: result.path,
                            stage: result.stage,
                            substage: substage,
                            users: result.users
                        }]
                    }

                }
            }
            Expense.findByIdAndUpdate(expenseId, currentExpenseToUpdate, (err, doc) => {
                if (err)
                    res.send(err)
                else
                    res.send(doc);
            });






        } else {
            res.send({ err: "file all ready exists" });
            console.log("exists");
        }


    })

    app.post('/singfile', async (req, res) => {
        let userId = req.body.userId;
        let expenseId = req.body.expId;
        let fileId = req.body.fileId;
        let user = await User.findById(userId);
        let file = await File.findById(fileId).catch(e => { res.status(500); res.send({ e }); res.end() });

        let pdfDoc = await PDFDocument.load(fs.readFileSync(file.path).buffer);

        let image = fs.readFileSync(user.sign).buffer;
        let imagePdf = await pdfDoc.embedPng(image);


        let count = 0;
        file.users.forEach(user => {
            console.log(user);
            if (user.signed)
                count += 1;
        })
        let pages = pdfDoc.getPages();
        for (let page of pages) {
            console.log("Height:" + page.getHeight());
            console.log("Width:" + page.getWidth());
            console.log("Count:" + count);
            if (count === 0) {
                page.drawImage(imagePdf, { y: 60, x: (page.getWidth() - (page.getWidth() / 3)) + 50, width: 100, height: 50 });
            } else if (count === 1) {
                page.drawImage(imagePdf, { y: 60, x: (page.getWidth() - (page.getWidth() / 3 * 2)) + 50, width: 100, height: 50 });
            } else if (count === 2) {
                page.drawImage(imagePdf, { y: 60, x: 50, width: 100, height: 50 });
            }
        }


        const pdfBytes = await pdfDoc.save();
        await fs.writeFileSync(file.path, pdfBytes);


        for (let i = 0; i < file.users.length; i++) {
            if (file.users[i]._id == userId) {
                file.users[i].signed = true;
            }
        }
        File.findByIdAndUpdate(fileId, { users: file.users }, (err, doc) => {
            if (doc) {


            } else {
                res.status(500);
                res.send({ e });
            }

        })
        let expenseToUpdate = await Expense.findById(expenseId);
        if (file.stage >= 4) {
            console.log("b");
            for (let i = 0; i < expenseToUpdate.files[1].length; i++) {
                for (let k = 0; k < expenseToUpdate.files[1][i].length; k++) {

                    if (expenseToUpdate.files[1][i][k].fileId == fileId) {

                        for (let j = 0; j < expenseToUpdate.files[1][i][k].users.length; j++) {

                            if (expenseToUpdate.files[1][i][k].users[j]._id == userId) {

                                expenseToUpdate.files[1][i][k].users[j].signed = true;
                            }
                        }
                    }
                }
            }
        } else {
            for (let i = 0; i < expenseToUpdate.files[0].length; i++) {
                if (expenseToUpdate.files[0][i].fileId == fileId) {

                    for (let j = 0; j < expenseToUpdate.files[0][i].users.length; j++) {

                        if (expenseToUpdate.files[0][i].users[j]._id == userId) {

                            expenseToUpdate.files[0][i].users[j].signed = true;
                        }
                    }
                }
            }
        }


        Expense.findByIdAndUpdate(expenseId, { files: expenseToUpdate.files }, (err, doc) => {
            if (err) {
                res.send({ 'e': 'eroor signing the doc' });
                res.end();
            } else {
                res.send(doc);

            }
        })





    });
    app.get('/whosigned', async (req, res) => {
        let expenseId = req.headers.expenseid;
        let stage = req.headers.stage;
        let substage = req.headers.substage;
        console.log(req.headers);
        console.log(expenseId);
        let expense = await Expense.findById(expenseId);
        let response = []
        if (stage >= 4) {
            for (let s of expense.files[1]) {
                for (file of s) {
                    if (file.stage == stage && file.substage == substage) {
                        for (let user of file.users) {
                            console.log({ username: user.name, signed: user.signed });
                            response.push({ username: user.name, signed: user.signed })
                        }
                        break;
                    }
                }

            }
        } else {
            for (let file of expense.files[0]) {
                if (file.stage == stage && file.substage == substage) {
                    for (let user of file.users) {
                        console.log({ username: user.name, signed: user.signed });
                        response.push({ username: user.name, signed: user.signed })
                    }
                    break;
                }
            }
        }


        res.send({ data: response });
    })
    app.get('/file', (req, res) => {
        let path = decodeURIComponent(req.headers._id, "utf-8");
        let data = fs.readFileSync(path);
        res.send(data);
    })
    app.get('/deletefile', async (req, res) => {

        let fileId = req.headers.fileid;
        let expenseId = req.headers.expid;
        let path = "";
        let result = await File.findById(fileId);
        await File.findByIdAndDelete(fileId);
        if (result !== null) {
            path = result.path;

            let expense = await Expense.findById(expenseId);
            if (result.stage >= 4) {
                for (let i = 0; i < expense.files[1].length; i++) {
                    for (let j = 0; j < expense.files[1][i].length; j++) {

                        if (expense.files[1][i][j].fileId == fileId) {
                            expense.files[1][i].splice(j, 1);
                            break;
                        }
                    }
                    // if (expense.files[1][i].length == 0) {
                    //     expense.files[1].splice(i, 1);
                    // }

                }
            } else {
                for (let i = 0; i < expense.files[0].length; i++) {
                    if (expense.files[0][i].fileId == fileId) {
                        expense.files[0].splice(i, 1);
                    }
                }
                // if (expense.files[0].length == 0) {
                //     expense.files.splice(0, 1);
                // }
            }
            fs.unlinkSync(path);
            Expense.findByIdAndUpdate(expenseId, expense, (err, doc) => {
                res.send({ data: doc, success: true });
            })

        } else {
            res.send({ error: "Fill Not Found" })
        }



    })
    app.get('/download', async (req, res) => {
        let id = req.headers.id;
        let file = await File.findById(id);
        res.send(new Buffer.from(fs.readFileSync(file.path)));

    })


}

module.exports = main;