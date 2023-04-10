const userCollection = require("../models/schema/user-Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.postSigup = async (req, res) => {
  try {
    let userSignUpp = {
      Status: false,
      message: null,
    };
    const { enteredEmail, enteredname } = req.body;
    let { enteredPassword } = req.body;
    let user = await userCollection.findOne({ email: enteredEmail });
    if (!user) {
      enteredPassword = await bcrypt.hash(enteredPassword, 10);
      userCollection
        .create({
          Name: enteredname,
          email: enteredEmail,
          password: enteredPassword,
        })
        .then((data) => {
          userSignUpp.Status = true;
          res.send({ userSignUpp });
        });
    } else {
      userSignUpp.message = "email already exists try login with this email";
      res.send({ userSignUpp });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.postLogin = async (req, res) => {
  try {
    let userSignUpp = {
      Status: false,
      message: null,
      token: null,
      name: null,
    };
    const { enteredEmail, enteredPassword } = req.body;
    let user = await userCollection.findOne({ email: enteredEmail });
    if (user) {
      bcrypt.compare(
        enteredPassword,
        user.password,
        function (error, isMatch) {
          if (error) {
            userSignUpp.Status = false;
            userSignUpp.message = error;
            res.send({ userSignUpp });
          } else if (isMatch) {
            userSignUpp.Status = true;
            userSignUpp.name = user.Name;
            const name = user.Name;
            let token = jwt.sign({ id: user._id }, "secretCode", {
              expiresIn: "30d",
            });
            userSignUpp.token = token;
            let obj = {
              token,
              name,
            };
            res
              .cookie("jwt", obj, {
                httpOnly: false,
                maxAge: 6000 * 1000,
              })
              .status(200)
              .send({ userSignUpp });
          } else {
            userSignUpp.message = " Password is wrong";
            userSignUpp.Status = false;
            res.send({ userSignUpp });
          }
        }
      );
    } else {
      userSignUpp.message = "your Email wrong";
      userSignUpp.Status = false;
      res.send({ userSignUpp });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.userProfile = async (req, res) => {
  try {
    const jwtToken = jwt.verify(req.cookies.jwt.token, "secretCode");
    if (jwtToken.id) {
      const UserId = jwtToken.id;
      let user = await userCollection.findOne({ _id: UserId });
      if (user) {
        res.status(200).send({ user });
      } else {
        res.status(500).send({ erroe: "no user" });
      }
    } else {
      res.status(500).send({ erroe: "no user" });
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports.editProfilePhoto = async (req, res) => {
  try {
    
    if (req.cookies.jwt) {
      const jwtToken = jwt.verify(req.cookies.jwt.token, "secretCode");
      const UserId = jwtToken.id;
      if (req.file) {
        const file = req.file;
        await userCollection
          .updateOne(
            { _id: UserId },
            {
              $set: {
                image: file.filename,
              },
            }
          )
          .then(() => {
            res.status(200).send({ changed: true });
          });
      } else {
        res.send({ error: "Please Choose a image" });
      }
    } else {
      res.send({ error: "Please Login" });
    }
  } catch (error) {
    console.log(error);
  }
};
