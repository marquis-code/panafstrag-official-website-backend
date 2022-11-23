const express = require('express')
let router = express.Router(); 
const Admin = require('../models/Admin');
const { registerSchema } = require("../models/validations/authValidation");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  console.log(req.body);

  const validationResult = registerSchema.validate(req.body, { abortEarly: false });
  console.log(req.body);
  if (validationResult.error) {
    console.log(validationResult.error.details[0].message);
    let errorMsg = validationResult.error.details[0].message
    return res.status(400).json({ errorMessage: errorMsg });
  }

    try {
        const user = await Admin.findOne({email});
        if (user) {   
        return res.status(400).json({ errorMessage: "User Already Exist" });
        }

        const salt = await bcrypt.genSalt(10);
        let hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({ firstName, lastName, email, password:hashedPassword });
        console.log(newAdmin)
        
        await newAdmin.save();

        return res.status(201).json({ successMessage: "Registeration success, Please sign in"});

   } catch (error) {
    console.log(error);
    return res.status(500).json({ errorMessage: "Something went wrong, please try again." });
   }
})


router.post('/signin', async (req, res) => {
  const {email, password} = req.body;

  try {
      const user = await Admin.findOne({email}).select("+password");
      if(!user) {
         return res.status(404).json({ errorMessage: "User Not Found"});
      } 
  
      const isMatchPassword = bcrypt.compare(password, user.password);
      console.log(isMatchPassword);
      if(!isMatchPassword) {
         return res.status(400).json({ errorMessage: "Invalid Login Credentials"});
       } 
      
       const jwtPayload = {_id : user._id}

       const accessToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
       
       res.status(200).json({accessToken})
       res.set('authorization', `Bearer ${accessToken}`)
  
  } catch (error) {
    console.log(error);
  return res.status(500).json({ errorMessage: "Something went wrong, please try again." });
  }
});

module.exports = router;