const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Otp = require("../../models/Otp");

const router = require("express").Router();

const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: 465,
  auth: {
    user: process.env.MAIL_SENDER_EMAIL,
    pass: process.env.MAIL_PASSWORD,
  },
});

function generateOTP() {

  var digits = '0123456789abcdefghijklmnopqrstuvwxyz';

  var otpLength = 6;

  var otp = '';

  for (let i = 1; i <= otpLength; i++) {

    var index = Math.floor(Math.random() * (digits.length));

    otp = otp + digits[index];

  }

  return otp;

}

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role, location } = req.body;
    let categories = [];
    if (!email || !password || !name || !role || !location) {
      return res.status(202).json({ message: "Fill All Details" });
    }
    const exist = await User.findOne({
      email: { $regex: email, $options: "i" },
    });
    if (exist) {
      return res.status(202).json({ message: "Email Exist" });
    }
    if (role != "beneficiary") {
      categories.push("65bf50f63450b90b4ed5a608");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
      categories,
      location,
    });
    let otp = generateOTP();
    await Otp.create({ user: user._id, otp })
    const subject = "Sign Up OTP";
    let body = `<p>Your One Time Password for Sign up Verification is <strong>${otp}</strong> \n Do not share it</p>`;
    const mailOptions = {
      from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      html: body,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error, "error in mail");
        return res
          .status(202)
          .json({ success: false, message: "Error in sending mail" });
      } else {
        return res.status(201).json({ success: true, message: "Check Mail for OTP", user });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });
    if (!user) {
      return res.status(202).json({ message: "Invalid Credentials" });
    } else if (user.status == "Blocked") {
      return res.status(202).json({ message: "Blocked By Admin" });
    }
    else if (user.verify == false) {
      return res.status(202).json({ message: "OTP not Verified" })
    }
    const hashedPassword = user.password;
    const compare = await bcrypt.compare(password, hashedPassword);
    if (!compare) {
      return res.status(202).json({ message: "Invalid Credentials" });
    }
    res.status(201).json({ message: "Logged In", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.toString() });
  }
});

router.post("/otp", async (req, res) => {
  try {
    const { id, otp } = req.body;
    console.log(id, otp)
    let chk = await Otp.findOne({ user: id, otp });
    if (chk) {
      await Otp.findByIdAndDelete(chk._id)
      let user = await User.findByIdAndUpdate(id, { verify: true }, { new: true });
      return res.status(201).json({ message: "Correct", user });
    }
    else {
      res.status(202).json({ message: "OTP incorrect" })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.toString() });
  }
});

router.post("/forgetPassword", async (req, res) => {
  try {
    const email = req.body.email;
    const newPassword = generateRandomString(8);
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    await User.findOneAndUpdate(
      { email: { $regex: email, $options: "i" } },
      { $set: { password: hashedPassword } }
    );
    const subject = "Forget Password";
    let body = `<p>We have received your Reset Password Request. Your temporary password is ${newPassword} \n Please use these logins and change your password.</p>`;
    const mailOptions = {
      from: `${process.env.MAIL_SENDER_NAME} <${process.env.MAIL_SENDER_EMAIL}>`,
      to: email,
      subject: subject,
      html: body,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error, "error in mail");
        return res
          .status(202)
          .json({ success: false, message: "Error in sending mail" });
      } else {
        return res.status(201).json({ success: true, message: "Email Sent" });
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

router.post("/changePassword", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    const user = await User.findOne({
      email: { $regex: email, $options: "i" },
    });
    if (!user) {
      return res
        .status(202)
        .json({ success: false, message: "Email Not Correct" });
    }
    let compare = await bcrypt.compare(oldPassword, user.password);
    if (compare) {
      let hashedPassword = await bcrypt.hash(newPassword, 8);
      await User.findByIdAndUpdate(user._id, { password: hashedPassword });
      return res
        .status(201)
        .json({ success: true, message: "Password Changed" });
    }
    res
      .status(202)
      .json({ success: false, message: "Old Password not matched" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.toString() });
  }
});

module.exports = router;
