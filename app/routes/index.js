const users = require('./users');
const files = require('./files');
const expenses = require('./expenses');
const projects = require('./projects');
module.exports = function(app){
   users(app);
   files(app);
   expenses(app);
   projects(app);
}