const path = require("path");
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("650dbb953f91355cd19831cb").then((user) => {
    console.log("user", user);
    req.user = user; //user is mongoose user model
    next();
  });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://prabhat:prabhat@cluster0.2n1qplp.mongodb.net/shop?retryWrites=true"
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Prabhat",
          email: "Prabhat@gmail.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
    console.log("Done");
  })
  .catch((err) => console.log(err));
