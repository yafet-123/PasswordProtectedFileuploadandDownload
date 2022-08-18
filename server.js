const express =require('express')
const multer =require('multer')
// used for file sharing
const mongoose =require('mongoose')
const dotEnv =require('dotenv')
const File =require('./model/file.js')
const bcrypt =require('bcrypt')
dotEnv.config()
const app = express()
const upload = multer({dest:"upload"})
// initalizethe multer and the destination will be upload folder 
// upload is the middleware that we put in any place when you save this
// upload folder will be created and when we send file it store the file there and it give it random name
mongoose.connect(process.env.DATABASE_URL)
app.use(express.urlencoded({extended:true}))
// by default express does not understand html form tag so when we add this code
// express will undestand form tat are send by form tag

app.set("view engine", "ejs")
// to told our application to use the ejs library
app.get("/", (req,res)=>{
	res.render("index")
})

app.post("/upload", upload.single("file"), async(req,res)=>{
	// we call upload middleware that upload a single file and the name file is given in the html form
	const fileData = {
		path:req.file.path,
		originalName:req.file.originalname,
	}
	if(req.body.password != null && req.body.password != ""){
		fileData.password = await bcrypt.hash(req.body.password, 10)
	}

	const file = await File.create(fileData)
	 
	res.render("index", {fileLink : `${req.headers.origin}/file/${file._id}`})
	// after it save it will render the index page then give us the link for to download 
	// req.headers.origin it give us the base or the header url in this case localhost:3000
})
app.route("/file/:id").get(handleDownload).post(handleDownload)

// we do this because in the same url there is get and post for handledownload the get request download
// but the post request is for if there is password set
async function handleDownload(req,res){
	const file = await File.findById(req.params.id)
	if(file.password != null){
		if(req.body.password == null){
			res.render("password")
			return
		}
		if(!(await bcrypt.compare(req.body.password, file.password))){
			res.render('password',{error:true})
			return
		}
	}
	file.downloadCount++
	file.save()

	res.download(file.path, file.originalName)
}
app.listen(process.env.PORT)