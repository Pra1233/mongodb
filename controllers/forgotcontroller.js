const Sib = require("sib-api-v3-sdk");
require("dotenv").config();
const uuid = require("uuid");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/Signup");
const Forgotpassword = require("../models/forgotpassword");
require("dotenv").config();

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    console.log("EMAIL", user);
    if (user) {
      const id = uuid.v4(); //generate unique id for password link
      const client = Sib.ApiClient.instance;
      let apiKey = client.authentications["api-key"];
      apiKey.apiKey = process.env.API_KEY;

      const transEmailAPi = new Sib.TransactionalEmailsApi();
      const sender = {
        email: "prabhatsingh5725@gmail.com",
        name: "Prabhat",
      };
      const receivers = [
        {
          email: email,
        },
      ];

      await transEmailAPi.sendTransacEmail({
        sender,
        to: receivers,
        subject: "Verification",
        textContent: "Click on reset",
        htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">http://localhost:3000/password/resetpassword/${id}</a>`,
      });

      await Forgotpassword.create({ id: id, active: true, UserId: user.id });
      res.status(201).json({
        message: "Link to reset password sent to your mail ",
        sucess: true,
      });
    } else {
      throw new Error("User doesnt exist");
    }
  } catch (err) {
    console.error(err);
    res.json({ message: err, sucess: false });
  }
};

const resetpassword = (req, res) => {
  try {
    const id = req.params.id;
    const forgotpasswordrequest = Forgotpassword.findOne({ id });
    if (forgotpasswordrequest) {
      res.status(200).send(`<html>
                                        <body>
                                         <form action="/password/updatepassword/${id}" method="get">
                                             <label for="newpassword">Enter New password</label>
                                             <input name="newpassword" class="new" type="password" required></input>
                                             <button id="reset">reset password</button>
                                         </form>

                                         <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.23.0/axios.js"></script>
                                         <script>
                                         const reset=document.getElementById('reset');
                                         reset.addEventListener('click',updatePassword);

                                          async function updatePassword(e){
                                                 e.preventDefault();
                                                 const pass=document.querySelector('.new').value;
                                                 const obj={
                                                    npass:pass
                                                 }
                                                 console.log(obj);
                            const res=await axios.post("http://localhost:3000/password/updatepassword/${id}",obj)             
                                               alert(res.data.msg);
                                             }
                                         </script>   
                                     </body>    
                                     </html>`);
    }
    res.end();
  } catch (err) {
    console.log(err);
    res.json({ error: err, sucess: false });
  }
};

// const updatepassword = async (req, res) => {
//   try {
//     const { newpassword } = req.query;
//     const { id } = req.params;
//     let forgotuser = await Forgotpassword.findOne({ id: id });
//     console.log("forgot", forgotuser);
//     if (forgotuser.active == false) {
//       return res.status(201).json({ msg: "Link Expired" });
//     }

//     let user = await User.findOne({ id: forgotuser.UserId });
//     console.log("userDetails", user);
//     if (user) {
//       const salt = 10;

//       bcrypt.hash(newpassword, salt, async (err, hash) => {
//         // Store hash in your password DB.
//         if (err) {
//           console.log("err", err);
//           throw new Error(err);
//         }
//         user.password = hashedPassword;
//         await user.save();
//         // await user.update({ password: hash });
//         // const f = await forgotuser.update({ active: false });
//         // Deactivate the ForgotPassword entry
//         forgotuser.active = false;
//         await forgotuser.save();
//         res.status(201).json({ msg: "Successfuly update the new password" });
//       });
//     } else {
//       return res.status(404).json({ error: "No user Exists", success: false });
//     }
//   } catch (error) {
//     return res.status(403).json({ error, success: false });
//   }
// };
const updatepassword = async (req, res) => {
  try {
    const { newpassword } = req.query;
    const { id } = req.params;

    // Find the ForgotPassword entry by its ID
    const forgotUser = await Forgotpassword.findOne({ id });

    if (!forgotUser || !forgotUser.active) {
      return res.status(201).json({ msg: "Link Expired" });
    }

    // Find the user by their ID
    const user = await User.findById(forgotUser.userId);

    if (user) {
      const saltRounds = 10;

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

      // Update the user's password with the hashed password
      user.password = hashedPassword;
      await user.save();

      // Deactivate the ForgotPassword entry
      forgotUser.active = false;
      await forgotUser.save();

      return res
        .status(201)
        .json({ msg: "Successfully updated the new password" });
    } else {
      return res.status(404).json({ error: "No user exists", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(403).json({ error, success: false });
  }
};

module.exports = {
  forgotpassword,
  updatepassword,
  resetpassword,
};
