const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
    {
        name:{
            type:String,
            required:true
        }
    },{timestamps:true}
);

const ProjectsModel = mongoose.model('projects',ProjectSchema);

module.exports = ProjectsModel;