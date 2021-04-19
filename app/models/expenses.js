const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        cae: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        project: {
            type: String,
            required: true
        },
        active: {
            type: Number,
            required: true
        },
        afm: {
            type: String
        },
        provider: {
            type: String
        },
        comments: {
            type: String
        },
        //id,name,path,cae,stage,stage,number
        files: [{
            type: Array
        }, { timestamps: true }
        ]
    }, { timestamps: true }
);

const ExpenseModel = mongoose.model('expenses', ExpenseSchema);

module.exports = ExpenseModel;