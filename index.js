import express from 'express';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import User from "./models/User.js";
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import Todo from './models/Todo.js';

const secret = 'secret123';

dotenv.config()
const MONGO_CNSTRING = process.env.MONGO_CNSTRING;
mongoose.set("strictQuery", true);

await mongoose.connect(MONGO_CNSTRING, {useNewUrlParser:true, useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error', console.log);

const app = express();
app.use(cookieParser());
app.use(bodyParser.json({extended:true}));
app.use(cors({
  credentials:true,
  origin: 'https://todo-list-one-swart.vercel.app',
  // origin: 'http://localhost:3001',
}));

app.get('/', (req, res) => {
  res.send('api rodando');
});

app.post('/user', (req, res) => {
  if (!req.body.id) {
    return res.json({});
  }
  // const payload = jwt.verify(req.cookies.token, secret);
  User.findById(req.body.id)
    .then(userInfo => {
      if (!userInfo) {
        return res.json({});
      }
      res.json({id:userInfo._id,email:userInfo.email});
    });

});

app.post('/register', (req, res) => {
  const {email,password} = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = new User({password:hashedPassword,email});
  user.save().then(userInfo => {
    jwt.sign({id:userInfo._id,email:userInfo.email}, secret, (err,token) => {
      if (err) {
        console.log(err);
        res.sendStatus(500);
      } else {
        res.cookie('token', token).json({id:userInfo._id,email:userInfo.email});
      }
    });
  });
});

app.post('/login', (req, res) => {
  const {email,password} = req.body;
  User.findOne({email})
    .then(userInfo => {
      if (!userInfo) {
        return res.json({});
      }
      const passOk = bcrypt.compareSync(password, userInfo.password);
      if (passOk) {
        jwt.sign({id:userInfo._id,email},secret, (err,token) => {
          if (err) {
            console.log(err);
            res.sendStatus(500);
          } else {
            res.cookie('token', token).json({id:userInfo._id,email:userInfo.email});
          }
        });
      } else {
        res.sendStatus(401);
      }
    })
});

app.post('/logout', (req, res) => {
  res.cookie('token', '').send();
});

app.post('/todoslist', (req, res) => {
  // const payload = jwt.verify(req.cookies.token, secret);
  console.log(req.body.id)

  Todo.where({user: new mongoose.Types.ObjectId(req.body.id)})
  .find((err, todos) => {
    res.json(todos);
  })
})

app.put('/todos', (req, res) =>{
  // const payload = jwt.verify(req.cookies.token, secret);
  const todo = new Todo({
    text:req.body.text,
    done:false,
    user:new mongoose.Types.ObjectId(req.body.id),
  });
  todo.save().then(todo => {
    res.json(todo);
  })
})

app.post('/todos', (req, res) =>{
  // const payload = jwt.verify(req.cookies.token, secret);
  Todo.deleteOne({
     _id:new mongoose.Types.ObjectId(req.body.id),
     user:new mongoose.Types.ObjectId(req.body.userId)
    }).then(() => {
      res.sendStatus(200);
    })
})

app.listen(4000);