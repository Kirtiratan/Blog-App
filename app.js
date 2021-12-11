var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
mongoose.connect("mongodb+srv://mlabuser:0Timongodbp9@mydb-jsu8e.mongodb.net/webdata?retryWrites=true&w=majority" ,{useNewUrlParser: true,useUnifiedTopology: true});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

var schema = new mongoose.Schema({
	title: String,
	image: String,
	content:String,
	created:{type:Date, default:Date.now}
});


var blog = mongoose.model("blog",schema);

var flag = 0, value = 0 ;

app.get("/",function(req,res){
	res.redirect("/p/1");
});

app.get("/p/:page",function(req,res){
	blog.aggregate([
		{ $sort: { created: -1 }},
		],function(err,blogs){
			var total;
			var count = blogs.length;
			if(count%4 > 0){
				total = count/4 + 1;
			}else{
				total = count/4;
			}
			var go = blogs.slice((req.params.page - 1)*4,((req.params.page - 1)*4)+4);
			res.render("index",{blogs:blogs,flag:flag, value:value,cur_page:parseInt(req.params.page),tot_page:total});
			flag = 0;
	});
});


app.get("/sourcenew",function(req,res){
	res.render("new");
});

app.post("/sourcenew",function(req,res){
	blog.create(req.body.blog,function(err,newBlog){
		if(err){
			res.render("/sourcenew");
		}else{
			res.redirect("/");
		}
	});
});

app.get("/request/:link",function(req,res){
	flag = 1;
	value = req.params.link;
	res.redirect("/");
});

app.get("/req/:link",function(req,res){
	flag = 1;
	value = req.params.link;
	blog.aggregate([{ $sample : { size : 1 }}], function(err,blog){
		res.redirect("/"+ blog[0]._id);
	});
	
});

app.get("/:id",function(req,res){
	blog.findById(req.params.id,function(err,found){
		if(err){
			flag = 0;
			res.redirect("/");
		}else{
			res.render("show",{blog:found, flag:flag, value:value});
			flag = 0;
		}
	});
});

app.listen(3000,function(){
	console.log("server started at port 3000");
});