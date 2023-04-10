const express = require('express')
const router = express.Router()
const UserController = require('../controllers/user')
const path = require('path')

const multer = require("multer")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/images'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname
        cb(null, name)
    }
})
const upload = multer({ storage: storage })

router.post('/register',UserController.postSigup)

router.post('/login',UserController.postLogin)

router.get('/userProfile',UserController.userProfile)

router.post('/editProfilePhoto',upload.single('image'),UserController.editProfilePhoto)



module.exports=router