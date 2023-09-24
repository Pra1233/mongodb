const Expense = require("../models/Expense");
const User = require("../models/Signup");
const Download = require("../models/download");
const sequelize = require("../util/database");
const Userservices = require("../services/userservices");
const S3services = require("../services/S3services");

exports.downloadbtn = async (req, res) => {
  try {
    // const expense=await req.user.getExpenses();
    const expense = await Userservices.getExpenses(req);
    const strigifyExpenses = JSON.stringify(expense);
    const userid = req.user.id;
    let date = new Date();
    const filename = `expense${userid}/${new Date()}.txt`;
    const fileURL = await S3services.uploadToS3(strigifyExpenses, filename); //async function so used promise
    await Download.create({ date: date, fileURL: fileURL, UserId: userid });
    const getdownload = await Download.findAll({
      where: { userId: req.user.id },
      attributes: ["date", "fileURL"],
    });

    console.log("fileUrl", getdownload);
    res.status(200).json({ fileURL, getdownload: getdownload, success: true });
  } catch (e) {
    console.log("ERROR In DownloadBtn", e);
    res.status(500).json({ fileURL: "", success: false, error: e });
  }
};
function isstringValid(string) {
  if (string == undefined || string.length === 0) return true;
  else return false;
}
exports.postExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    if (
      isstringValid(amount) ||
      isstringValid(description) ||
      isstringValid(category)
    ) {
      document.body.innerHTML += `<h3 style="color:red;">${e}</h3>`;
      return res.status(400).json({ e: "Bad Parameter, Something is missing" });
    }
    let date = new Date();
    let options = { day: "numeric", month: "long", year: "numeric" };
    const today = date.toLocaleDateString("en-IN", options);
    //  const response=await Expense.create({amount,description,category,userId:req.user.id},{transaction:t});//user.id attach in middleware
    const response = await Expense.create({
      date: today,
      amount: amount,
      description: description,
      category: category,
      userId: req.user.id,
    });
    const totalExpense = Number(req.user.totalExpense) + Number(amount);
    // await User.update({
    //   totalExpense: totalExpense,
    // });
    // const userid = req.user.id;
    // const user = await User.findOne({
    //   where: { id: userid },
    //   attributes: ["totalExpense"],
    // });

    const user = await User.findOneAndUpdate(
      { _id: req.user.id }, // want to match
      { totalExpense: totalExpense }, //update
      { new: true } //user value hold updated value
    );
    // console.log(response, "response");
    // console.log(user, "user");
    res.status(200).json({ expense: response, user: totalExpense }); //user: user
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: e });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id, "iddddddddddddddddddddddddddddd");
    console.log(typeof id);
    if (!req.params.id || id.length === 0) {
      res.status(400).json({ err: "Not define ID" });
      console.log("Id Is Missing");
    }

    const expense = await Expense.find({ _id: id }, { amount: 1 }); //amount field want so set it to 1
    const amount = +expense[0].amount;
    const totalExpense = +req.user.totalExpense - amount;

    await User.findByIdAndUpdate(
      { _id: req.user.id }, //where condition
      { totalExpense: totalExpense },
      { new: true }
    );

    const noofrows = await Expense.deleteOne({ _id: id, userId: req.user.id });

    if (noofrows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expense Doesnt belong to user" });
    }
    res
      .status(200)
      .json({ success: true, msg: "Deleted Successful", user: totalExpense }); //user,
  } catch (e) {
    res.status(500).json({ error: e });
    console.log("Delete user is fail", e);
  }
};

exports.getExpenses = async (req, res) => {
  try {
    var ITEMS_PER_PAGE;
    if (isNaN(+req.query.limit)) {
      ITEMS_PER_PAGE = 2;
    } else {
      ITEMS_PER_PAGE = +req.query.limit;
    }
    const page = +req.query.page || 1;

    let totalItems;

    const total = await Expense.countDocuments(); //count()
    totalItems = total;
    // const expenses = await Expense.find(
    //   {
    //     where: { userId: req.user.id },
    //     offset: (page - 1) * ITEMS_PER_PAGE,
    //     limit: ITEMS_PER_PAGE,
    //   }
    // );
    const expenses = await Expense.find({ userId: req.user.id })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const userid = req.user.id;

    const user = await User.findOne({ _id: userid }, { totalExpense: 1 });
    // console.log("1111111111qqqqqqqqqqqqqqqq", user);
    res.status(200).json({
      success: true,
      products: expenses,
      user: user,
      currentPage: page,
      hasnextPage: ITEMS_PER_PAGE * page < totalItems,
      nextPage: page + 1,
      haspreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    console.log("Get Expense is fail", err);
    res.status(500).json({ err });
  }
};
