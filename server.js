const express = require("express");
const CORS = require('cors')
const app = express()
const path = require('path')
const adminrouter=require("./routes/admin")
const userrouter=require("./routes/user")
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')

app.use(express.json())
app.use(cookieParser())
app.use(CORS({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true,
  allowedHeaders: [
      'Content-Type',
      'Access'
  ]
}))

mongoose.connect('mongodb://127.0.0.1:27017/reactApp',
).then(() => {
    console.log("connected");
}).catch((err) => {
    console.log(err);
})

app.use(express.static(path.join(__dirname, 'public')))
app.use('/public/images/', express.static(path.join(__dirname, 'public/images')));
app.use("/",userrouter)
app.use("/admin",adminrouter)

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});