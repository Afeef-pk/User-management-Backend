const adminCollection = require("../models/schema/admin_Schema");
const userCollection = require("../models/schema/user-Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Types } = require("mongoose");

module.exports.postLogin = async (req, res) => {
  try {
    let adminLogin = {
      Status: false,
      message: null,
      token: null,
    };
    const { enteredEmail, enteredPassword } = req.body;
    let admin = await adminCollection.findOne({ email: enteredEmail });
    if (admin) {
      bcrypt.compare(
        enteredPassword,
        admin.password,
        function (error, isMatch) {
          if (error) {
            adminLogin.Status = false;
            adminLogin.message = error;
            res.send({ adminLogin });
          } else if (isMatch) {
            adminLogin.Status = true;
            let Admintoken = jwt.sign({ id: admin._id }, "secretCode", {
              expiresIn: "24h",
            });
            adminLogin.token = Admintoken;
            let obj = {
              Admintoken,
            };
            res
              .cookie("jwt", obj, {
                httpOnly: false,
                maxAge: 6000 * 1000,
              })
              .status(200)
              .send({ adminLogin });
          } else {
            adminLogin.message = "Password is wrong";
            adminLogin.Status = false;
            res.send({ adminLogin });
          }
        }
      );
    } else {
      adminLogin.message = "your Email wrong";
      adminLogin.Status = false;
      res.send({ adminLogin });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.getUserDetails = (req, res) => {
  try {
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      const User = userCollection
        .find()
        .then((data) => {
          res.send({ data });
        })
        .catch(() => {
          res.status(500).send({ erroe: "no user" });
        });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.DeleteUser = async (req, res) => {
  try {
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      await userCollection.deleteOne({ _id: req.params.id });
      const users = await userCollection
        .find()
        .then((data) => {
          res.status(200).send({data});
        })
        .catch((err) => {});
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.EditeUser = async (req, res) => {
  try {
    let obj = {
      message: null,
      EditeUser: null,
    };
    const jwtToken = jwt.verify(req.cookies.jwt.Admintoken, "secretCode");
    if (jwtToken) {
      const { UserEditeEmail, UserEditeName, userId } = req.body;
      let user = await userCollection.find({ email: UserEditeEmail });
      if (user[0]?._id == userId || user?.length === 0) {
        userCollection
          .updateOne(
            { _id: userId },
            {
              $set: {
                Name: UserEditeName,
                email: UserEditeEmail,
              },
            }
          )
          .then(() => {
            obj.EditeUser = true;
            res.status(200).send(obj);
          });
      } else {
        obj.message = "email already exists";
        obj.EditeUser = false;
        res.status(200).send(obj);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
