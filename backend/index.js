const express = require("express")
const jwt = require("jsonwebtoken")
var bcrypt = require('bcryptjs');
require("dotenv").config()
const cors = require("cors")
const mongoose = require("mongoose");
const {UserModel} = require("./models/User.model")
const {BlogModel} = require("./models/Blog.model")
const {connection} = require("./config/db")

// const {authentication} = require("./midlewares/authentication.middleware")

const app = express()
app.use(express.json())
app.use(cors({
    origin : "*"
}))


// authentication------------------------------


const authentication = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.send({msg : "Please login first"})
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if(err){
            return res.send({msg : "Please login first"})
        }
        else{

            req.userID = decoded.userID;
            next();

        }
    })
}

// aothorisation-------------------------

const aothorisation = (permittedRole)=>{
    return async (req,res, next)=>{
            const userID = req.userID;
            const user = await UserModel.findOne({_id : userID})
            const role = user.role
            if(permittedRole.includes(role)){
                next();
            }else{
                res.send(" yoy are not authorised")
            }
}
}



app.get("/", (req, res) => {
    res.send("base api endpoint")
})

app.post("/signup", async (req, res) => {
    const {email, password, name, city} = req.body;
    const user = await UserModel.findOne({email : email})
    if(user){
        res.send({msg : "already registered"})
    }
    bcrypt.hash(password, 4, async function(err, hash) {
        const newuser = new UserModel({
            email,
            password : hash,
            name,
            city
        })
        try {
            await newuser.save();


            res.status(201).json({ msg: " congres... Signup successful" });

          } catch (err) {
            
            res.status(500).json({ msg: "something wrong",err });
          }
    });
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await UserModel.findOne({email})
    if(user){
        const passwordForCheck = is_user.password
        bcrypt.compare(password, passwordForCheck, function(err, result) {
            if(result){
                const token = jwt.sign({userID : user._id}, process.env.SECRET_KEY)
                res.send({msg : "login successfull", token : token})
            }
            else{
                res.send("Login goes failed")
            }
        });
    }
    else{
        res.send(" first Sign up please")
    }
})





// app.use(authentication)

app.get("/blogs", authentication,async (req, res) => {
    try{
        const blogs = await BlogModel.find()
        res.send(blogs)
    }
    catch(err){
     
        res.send({msg : "sorry, but something wrong here" ,err})
    }
})


app.get("/blogs/filter",authentication, async (req, res) => {
    const { Author, category } = req.query;
    const filter = {};
  
    if (category) {
        filter.category = category;
      }

    if (Author) {
      filter.Author = Author;
    }
  
    try {
      const blogs = await BlogModel.find(filter);
      res.send(blogs)
    } catch (err) {
     
      res.send({ msg: "something wrong" },err);
    }
  });


app.post("/blogs/add", authentication , async (req, res) => {
    const {title, Author, Content , category} = req.body;
    const userID = req.userID
    const newblog = new BlogModel({
        title,
        category,
        Author,
        Content,
        user_id : userID
    })


    try{
        await newblog.save()
        return res.send({msg : "Blog add to your page"})
    }


    catch(err){
        console.log(err)
        res.send({msg : "something wrong"})
    }
})


app.delete("/blogs/:blogID", authentication, async (req, res) => {
    const { blogID } = req.params;
    const userID = req.userID;
  
    try {
      const blog = await BlogModel.findOneAndDelete({ _id: blogID, user_id: userID });
  
      if (!blog) {
        return res.status(404).json({ msg: " you not authorized to delete this blog" });
      }
  
      res.send({ msg: "deleted successfully" });
    } catch (err) {
      console.error(err);
      res.send({ msg: "something wrong" });
    }
  });



app.put("/blogs/:blogID", authentication, async (req, res) => {
    const { blogID } = req.params;
    const { title, category, Author, Content, Image } = req.body;
    const userID = req.userID;
  
    try {
      const blog = await BlogModel.findOneAndUpdate(
        { _id: blogID, user_id: userID },
        { title, category, Author, Content, Image },
        { new: true }
      );
  
      if (!blog) {
        return res.status(404).json({ msg: "you not authorized to edit  this blog" });
      }
  
      res.status(200).json({ msg: " updated successfully", blog });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "something wrong" });
    }
  });




app.listen(8000, async () => {
    try{
        await connection()
        console.log("connected  db")
    }
    catch(err){
        console.log("error ,not connect with  DB")
        console.log(err)
    }
    console.log("listening on port 8080")
})