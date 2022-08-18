const mongoose = require('mongoose')

const file = new mongoose.Schema({
	path:{
		type:String,
		required:true
	},
	originalName:{
		type:String,
		required:true
	},
	password:String,
	downloadCount:{
		type:String,
		required:true,
		default:0
	}
})
// the first "File" is the name of the model then the second file is schema

// we are creating a model that have File and store the path first, then the originalname,
// password and the downloadCount

module.exports = mongoose.model("File",file)
