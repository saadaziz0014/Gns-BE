const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const indexRouter = require("./routes/index");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const cron = require('node-cron');
const Otp = require("./models/Otp");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", indexRouter);

mongoose.connect(process.env.DATABASE_URL).then(async () => {
  let superAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
  if(superAdmin && superAdmin.verify == false){
    await User.findOneAndUpdate({email: { $regex: process.env.ADMIN_EMAIL, $options: "i" }},{$set:{verify:true}})
  }
  if (!superAdmin) {
    const exist = await User.findOne({
      email: { $regex: process.env.ADMIN_EMAIL, $options: "i" },
    });
    let hashedPassword = await bcrypt.hash(process.env.ADMIN_PASS, 10);
    await User.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "superAdmin",
      verify:true
    });
  }
  app.listen(process.env.PORT, () => {
    console.log(`Server listening on http://127.0.0.1:${process.env.PORT}`);
  });
});


// cron.schedule('* * * * *', async () => {
//   await Otp.deleteMany({
//     $expr: {
//       $gt: [
//         { $subtract: [new Date(), '$createdAt'] },
//         10 * 60 * 1000
//       ]
//     }
//   })
// })
