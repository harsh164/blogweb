import express from "express";

import pg from "pg";
import bodyParser from "body-parser";
import session from "express-session";
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';






const app = express();
const port = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true } 
}));


const db =new pg.Client({
  user:"postgres",
  host:"localhost",
  database:"blog",
  password:"1Jyotigupta",
  port: 5432,
});
db.connect();
const users=[];
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));
const blogpost=[];

app.get("/",(req,res)=>{
  res.render("index.ejs");
});


app.get("/contacts",(req,res)=>{
  res.render("contacts.ejs");
});
app.get("/about",(req,res)=>{
  res.render("about.ejs");
});

app.get("/price",(req,res)=>{
    res.render("price.ejs");
  });

app.get("/features",(req,res)=>{
 res.render("features.ejs");
});

app.get("/log",(req,res)=>{
  res.render("login.ejs");
 });





  app.post("/login", async (req, res) => { 
    const email = req.body.email;
    const password = req.body.password;
    
    try {
     
      const result = await db.query("SELECT id, password FROM users WHERE email = $1", [email]);
      
      if (result.rows.length === 0) {
     
        res.send("Invalid email or password");
        return;
      }
      
      const user = result.rows[0];
      const hashedPassword = user.password;

      const passwordMatch = await bcrypt.compare(password, hashedPassword);
      
     
      if (passwordMatch) {
       
        req.session.userId = user.id;
        res.redirect("/blog");
      } else {
        
        res.send("Invalid email or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).send("Internal Server Error");
    }
  });
 
  


 
 app.get("/signup",(req,res)=>{
  res.render("signup.ejs");
 });

 

 
  app.post("/signup",async(req,res)=>{
    const emai=req.body.email;
    const pass=req.body.password;
    const hashedPassword = await bcrypt.hash(pass, 10);
    
    
    const result = await db.query("INSERT INTO users(email,password) VALUES ($1,$2)",[emai,hashedPassword])
    console.log(result);
    res.redirect("/log");
   });
  
app.get("/blog",async(req,res)=>{
  res.render("blog.ejs")
})
 
app.get("/cblog",async(req,res)=>{
  res.render("cblog.ejs")
});

app.post("/cblog",async(req,res)=>{
  const title=req.body.title;
  const blog=req.body.blog;
  const result=await db.query("INSERT INTO blog(title,blog) VALUES ($1,$2)",[title,blog]);
  
 res.redirect("/blog")
})

app.get("/createdblog",async(req,res)=>{
  res.render("createdblog.ejs");
});

app.post("/createdblog",async(req,res)=>{
  const currentuser = req.session.userId;
  const rtitle=await db.query("SELECT title from blog JOIN users ON users.id=userid WHERE userid=$1",[currentuser]);
  const title=rtitle.rows;
  const rblog=await db.query("SELECT blog from blog JOIN users ON users.id=userid WHERE userid=$1",[currentuser]);
  const blog=rblog.rows;
  res.render("createdblog.ejs", { blog });
});
 

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
