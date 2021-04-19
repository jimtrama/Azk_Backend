
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FileSchema = new Schema(
    {
        name:{
            type:String,
            required:true
        },
        cae:{
            type:String
        },
        path:{
            type:String,
            required:true
        },
        stage:{
            type:Number,
            required:true
        },
        substage:{
            type:Number,
            required:true
        },
        number:{
            type:Number
        },
        amount:{
            type:Number
        },
        //id,onoma,nickname,sign
        users:[
            {
                type:Object  
            }
        ]
    },{timestamps:true}
);

const FileModel = mongoose.model('files',FileSchema);

module.exports = FileModel;