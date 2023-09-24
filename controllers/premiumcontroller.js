const User = require("../models/Signup");

exports.leaderboard = async (req, res) => {
  // try{
  // const leaderboardusers=await User.findAll({
  //     attributes:['name','id','totalExpense'], //takeout name,id,totalcost(sum(amount))

  //     order:[['totalExpense','DESC']]// col totalcost to desc
  // });

  // // console.log(leaderboardusers);
  // res.status(200).json(leaderboardusers);
  // }
  // catch(e){
  //     console.log(e);
  //     res.status(500).json({error:e,message:'Something went wrong'});
  // }

  try {
    const leaderboardUsers = await User.aggregate([
      {
        $project: {
          name: 1,
          _id: 1,
          totalExpense: 1,
        },
      },
      {
        $sort: {
          totalExpense: -1, //descending order sort -1
        },
      },
    ]);

    return res.status(200).json(leaderboardUsers);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
