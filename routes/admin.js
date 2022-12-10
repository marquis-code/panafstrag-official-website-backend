const express = require("express");
let router = express.Router();
const Admin = require("../models/Admin");
const { registerSchema } = require("../models/validations/authValidation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Subscription = require("../models/Subscription");
const nodemailer = require("nodemailer");
const nodemailerMailgunTransport = require("nodemailer-mailgun-transport");
const hbs = require('nodemailer-express-handlebars');

const auth = {
  auth: {
    api_key: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN
  }
}

const transporter = nodemailer.createTransport(nodemailerMailgunTransport(auth));

transporter.use('compile', hbs({
  viewEngine: 'express-handlebars',
  viewPath: './views/'
}));

router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log(req.body);

  const validationResult = registerSchema.validate(req.body, {
    abortEarly: false,
  });
  console.log(req.body);
  if (validationResult.error) {
    console.log(validationResult.error.details[0].message);
    let errorMsg = validationResult.error.details[0].message;
    return res.status(400).json({ errorMessage: errorMsg });
  }

  try {
    const user = await Admin.findOne({ email });
    if (user) {
      return res.status(400).json({ errorMessage: "User Already Exist" });
    }

    const salt = await bcrypt.genSalt(10);
    let hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });
    console.log(newAdmin);

    await newAdmin.save();

    return res
      .status(201)
      .json({ successMessage: "Registeration success, Please sign in" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again." });
  }
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ errorMessage: "User Not Found" });
    }

    const isMatchPassword = bcrypt.compare(password, user.password);
    console.log(isMatchPassword);
    if (!isMatchPassword) {
      return res
        .status(400)
        .json({ errorMessage: "Invalid Login Credentials" });
    }

    const jwtPayload = { _id: user._id };

    const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    res.set("authorization", `Bearer ${accessToken}`);

    res.status(200).json({ accessToken });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ errorMessage: "Something went wrong, please try again." });
  }
});


router.get("/subscription", async (req, res) => {
  try {
    const allSubscriptions = await Subscription.find();
    return res.status(200).json(allSubscriptions);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  let user = await Subscription.findOne({ email });
  if (user) {
    return res.status(404).json({
      errorMessage: "You have already subscribed to our email service",
    });
  }
  const newUser = new Subscription({
    email,
  });

  await newUser.save();
  transporter.sendMail(
    {
      to: email,
      from: "PANAFSTRAG <noreply@panafstrag.com>",
      cc: "abahmarquis@gmail.com",
      bcc: "abahmarquis@gmail.com",
      subject: `Thanks for subscribing to PANAFSTRAG`,
      html: `
            <div style="box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);  border-radius: 25px; padding: 10px">
              <p>Hello,</p>
              <h1>Thank you for subscribing to our newsletter.</h1>
              <p>Your sunscription has been confirmed.</p
              <hr />
              <p>If at anytime you wish to stop recieving our newsletter, you can click the Unsubscribe link in the bottom of the news letter</p>
              <p>If you have any question about PANAFSTRAG, please free to contact us at panafstraginternational@gmail.com or isholawilliams@gmail.com</p>
              <p>Sincerely,</p>
              <p>Thank you again!</p>
            </div>
            `,
      attachments: [{filename: 'success.jpg', path: './success.jpeg'}],
      template: 'index'
    },
    (error, info) => {
      if (error) {
        console.log(error);
      } else {
        return res.status(200).json({
          successMessage: "Email was sent successfully check your email",
        });
      }
    }
  );

});

module.exports = router;
