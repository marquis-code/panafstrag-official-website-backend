const express = require("express");
let router = express.Router();
const Admin = require("../models/Admin");
const AdminVerification = require("../models/AdminVerification");
const OTPVerification = require("../models/OTPVerification");
const { registerSchema } = require("../models/validations/authValidation");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const Subscription = require("../models/Subscription");
const AuthToken = require("../models/AuthToken");
const nodemailer = require("nodemailer");
const nodemailerMailgunTransport = require("nodemailer-mailgun-transport");
const hbs = require("nodemailer-express-handlebars");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const auth = {
  auth: {
    api_key: process.env.MAILGUN_APIKEY,
    domain: process.env.MAILGUN_DOMAIN,
  },
};

const transporter = nodemailer.createTransport(
  nodemailerMailgunTransport(auth)
);

// transporter.use(
//   "compile",
//   hbs({
//     viewEngine: "express-handlebars",
//     viewPath: "./views/",
//   })
// );

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.AUTH_EMAIL,
//     pass: process.env.AUTH_PASSWORD,
//   },
// });

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("ready for message transport");
    console.log(success);
  }
});

router.post("/admin-signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const validationResult = registerSchema.validate(req.body, {
    abortEarly: false,
  });
  if (validationResult.error) {
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
      verified: false,
    });

    newAdmin
      .save()
      .then((result) => {
        sendOTPVerificationEmail(result, res);
      })
      .catch((error) => {
        return res.json({
          errorMessage:
            "Something went wrong, while saving user account, please try again.",
        });
      });
  } catch (error) {
    return res.json({
      errorMessage: "Something went wrong, please try again.",
    });
  }
});

router.post("/admin-signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email }).select("+password");
    if (user) {
      const isMatchPassword = bcrypt.compare(password, user.password);
      if (!isMatchPassword) {
        return res
          .status(400)
          .json({ errorMessage: "INVALID LOGIN CREDENTIALS" });
      } else {
        sendOTPVerificationEmail(user, res);
      }
    } else {
      return res
        .status(400)
        .json({ errorMessage: "INVALID LOGIN CREDENTIALS" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ errorMessage: "SOMETHING WENT WRONG, PLEASE TRY AGAIN." });
  }
});

// const sendVerificationEmail = ({ _id, email }, res) => {
//   const currentUrl = "https://wwww.panafstrag.org";
//   const uniquieString = uuidv4() + _id;
//   const mailOptions = {
//     to: email,
//     from: process.env.AUTH_EMAIL,
//     cc: "abahmarquis@gmail.com",
//     bcc: "abahmarquis@gmail.com",
//     subject: `Verify your email`,
//     html: `
//            <p>Verify your email address to complete the signup and login into your account.</p>
//            <p>This link <b>expires in 6 hours</b>.</p>
//            <p>Press <a href=${
//              currentUrl + "admin/verify/" + _id + "/" + uniquieString
//            }>here</a> to proceed.</p>
//             `,
//     attachments: [{ filename: "success.jpg", path: "./success.jpeg" }],
//   };

//   //hashing unique string
//   const saltRounds = 10;
//   bcrypt
//     .hash(uniquieString, saltRounds)
//     .then((hashedUniqueString) => {
//       const newVerification = new AdminVerification({
//         userId: _id,
//         uniqueString: hashedUniqueString,
//         createdAt: Date().now(),
//         expiresAt: Date.now() + 21600000,
//       });

//       newVerification
//         .save()
//         .then(() => {
//           transporter
//             .sendMail(mailOptions)
//             .then(() => {
//               return res.status(200).json({
//                 errorMessage: "Email was successfully sent",
//               });
//             })
//             .catch(() => {
//               return res.status(500).json({
//                 errorMessage:
//                   "Verification email failed, please try again later",
//               });
//             });
//         })
//         .catch(() => {
//           return res.status(500).json({
//             errorMessage: "An error occured while saving new verification.",
//           });
//         });
//     })
//     .catch(() => {
//       return res.status(500).json({
//         errorMessage: "An error occured while hashing email credentials.",
//       });
//     });
// };

// router.get("/verify/:userId/:uniqueString", (req, res) => {
//   const { userId, uniqueString } = req.params;
//   AdminVerification.find({ userId })
//     .then((result) => {
//       if (result.length > 0) {
//         const { expiresAt } = result[0];
//         const { hashedUniqueString } = result[0].uniqueString;
//         if (expiresAt < Date.now()) {
//           AdminVerification.deleteOne({ userId })
//             .then((result) => {
//               Admin.deleteOne({ _id: userId })
//                 .then(() => {
//                   let message = "Link has expired. Please sign up again.";
//                   res.redirect(`/admin/verified/error=true&message=${message}`);
//                 })
//                 .catch(() => {
//                   let message =
//                     "Clearing user with expired unique string failed.";
//                   res.redirect(`/admin/verified/error=true&message=${message}`);
//                 });
//             })
//             .catch(() => {
//               let message =
//                 "An error occured while clearing user verification record.";
//               res.redirect(`/admin/verified/error=true&message=${message}`);
//             });
//         } else {
//           //handling valid verification record.
//           bcrypt
//             .compare(uniqueString, hashedUniqueString)
//             .then((result) => {
//               if (result) {
//                 Admin.updateOne({ _id: userId }, { verified: true })
//                   .then(() => {
//                     AdminVerification.deleteOne({ userId })
//                       .then(() => {
//                         res.sendFile(
//                           path.join(_dirname, "./../views/verified.html")
//                         ); ///stopped here
//                       })
//                       .catch(() => {
//                         let message =
//                           "An error occured while finalizing successful verification.";
//                         res.redirect(
//                           `/admin/verified/error=true&message=${message}`
//                         );
//                       });
//                   })
//                   .catch(() => {
//                     let message =
//                       "An error occured while updating user record to show verified..";
//                     res.redirect(
//                       `/admin/verified/error=true&message=${message}`
//                     );
//                   });
//               } else {
//                 let message =
//                   "Invalid verification details passed. Check your inbox.";
//                 res.redirect(`/admin/verified/error=true&message=${message}`);
//               }
//             })
//             .catch(() => {
//               let message = "An error occured while comparing unique strings";
//               res.redirect(`/admin/verified/error=true&message=${message}`);
//             });
//         }
//       } else {
//         let message =
//           "Account record doesn't exist or has been verified already. Please sign up or login";
//         res.redirect(`/admin/verified/error=true&message=${message}`);
//       }
//     })
//     .catch(() => {
//       let message =
//         "An error occured while checking for existing user verification record.";
//       res.redirect(`/admin/verified/error=true&message=${message}`);
//     });
// });

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ errorMessage: "User Not Found" });
    }

    if (!user.verified) {
      return res.status(404).json({
        errorMessage: "Email has not been verified yet. Check your inbox.",
      });
    } else {
      const isMatchPassword = bcrypt.compare(password, user.password);

      if (!isMatchPassword) {
        return res
          .status(400)
          .json({ errorMessage: "Invalid Login Credentials" });
      }

      const jwtPayload = { _id: user._id };

      const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      sendOTPVerificationEmail(user, res, accessToken);
      // console.log(verificationResult, 'verification result hereoo');

      // res.set("authorization", `Bearer ${accessToken}`);
      // let modifiedUser = {
      //   firstName: user.firstName,
      //   lastName: user.lastName,
      //   email: user.email,
      //   userId: user._id,
      // };
      // await sendOTPVerificationEmail(user, res)
      //   .then((res) => {
      //     res.status(200).json({ accessToken, user: { modifiedUser } });
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
      // res.status(200).json({ accessToken, user: { modifiedUser } });
    }
  } catch (error) {
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

  try {
    let user = await Subscription.findOne({ email });
    console.log(user);

    if (user) {
      return res.status(404).json({
        errorMessage: "You have already subscribed to our email service",
      });
    }

    const emailOptions = {
      to: email,
      from: process.env.AUTH_EMAIL,
      subject: `Thanks for subscribing to PANAFSTRAG`,
      html: `
            <div style="box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);  border-radius: 25px; padding: 10px">
              <h4>Thank you for subscribing to our newsletter.</h4>
              <p>Your subscription has been confirmed.</p
              <p>If at anytime you wish to stop recieving our newsletter, you can click the Unsubscribe link in the bottom of the news letter</p>
              <p>If you have any questions about PANAFSTRAG, contact us via the following emails:
               <p>panafstraginternational@gmail.com</p>
              <p>isholawilliams@gmail.com</p>
              <p>Sincerely,</p>
              <p>Thank you again!</p>
            </div>
            `,
    };

    const newUser = new Subscription({
      email,
    });

    await newUser.save();
    await transporter.sendMail(emailOptions);
    return res.status(200).json({
      successMessage: "Thanks for subscribing.",
    });
  } catch (error) {
    console.log(error);
    // return res.status(500).json({
    //   errorMessage: error.messages,
    // });
  }
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "PANAFSTRAG Email Verification Code (One Time Password)",
      html: `
           <p>Hi</p>
           <p>We recieved a request to access your PANAFSTRAG Account ${email} through your email address.</p>
           <p>Your One Time OTP verification code is: <h3> ${otp}</h3></p>
           <p>Please enter the OTP $to verify your Email Address.</p>
           <p>If you did not request this code, it is possible that someone else is trying to access the PANAFSTRAG Account ${email}</p>
           <p><b>Do not forward or give this code to anyone.</b></p>
           <p> If you cannot see the email from 'sandbox.mgsend.net' in your inbox, make sure to check your SPAM folder.</p>
          <p>This code <b>expires in 48 hours</b>.</p>
          <p>Sincerely yours,</p>
          <p>The Google Accounts team</p>
      `,
    };

    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp, saltRounds);
    const newOTPVerification = await new OTPVerification({
      userId: _id,
      otp: hashedOtp,
      expiresAt: Date.now() + 172800000,
      createdAt: Date.now(),
    });

    await newOTPVerification.save();
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successMessage: "Verification otp email sent.",
      data: { userId: _id, email },
    });
  } catch (error) {
    return res.status(200).json({
      errorMessage: error.messages,
    });
  }
};

router.post("/verifyOtp", async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
      return res.status(400).json({
        errorMessage: "Empty OTP details are not allowed.",
      });
    } else {
      const userOTPVerificationRecords = await OTPVerification.find({
        userId,
      });

      console.log(userOTPVerificationRecords);

      if (userOTPVerificationRecords.length <= 0) {
        return res.status(400).json({
          errorMessage:
            "Account record doesn't exist or has been verified already. Please signup or log in",
        });
      } else {
        const { expiresAt } = userOTPVerificationRecords[0];
        const hashedOtp = userOTPVerificationRecords[0].otp;

        if (expiresAt < Date.now()) {
          await OTPVerification.deleteMany({ userId });
          return res.status(400).json({
            errorMessage: "Code has expired. Please request again.",
          });
        } else {
          const validOtp = await bcrypt.compare(otp, hashedOtp);

          if (!validOtp) {
            return res.status(400).json({
              errorMessage: "Invalid code passed. Check your inbox.",
            });
          } else {
            await Admin.updateOne({ _id: userId }, { verified: true });
            await OTPVerification.deleteMany({ userId });
            return res.status(200).json({
              successMessage: "Email has been verified.",
              data: { userId },
            });
          }
        }
      }
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
    });
  }
});

router.post("/resendOTPVerificationCode", async (req, res) => {
  try {
    const { userId, email } = req.body;
    if (!userId || !email) {
      return res.status(400).json({
        errorMessage: "Empty user details are not allowed.",
      });
    } else {
      await OTPVerification.deleteMany({ userId });
      sendOTPVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    return res.status(500).json({
      errorMessage: error.message,
    });
  }
});

module.exports = router;
