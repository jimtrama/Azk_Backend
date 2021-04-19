const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
    {
        username:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        nickname:{
            type:String
        },
        name:{
            type:String
        },
        avatar:{
            type:String
        },
        sign:{
            type:String
        }
    },{timestamps:true}
);

const UsersModel = mongoose.model('users',UserSchema);

module.exports = UsersModel;