const express = require("express");
let router = express.Router();
const BoardMembers = require("../models/BoardMembers");
const Reports = require("../models/Reports");
const Archives = require("../models/Archives");
const Programmes = require("../models/Programmes");
const Objectives = require("../models/Objectives");
const Responsibilities = require("../models/Responsibilities");
const { authenticateJwt } = require("../middleware/authenticator");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

router.post(
  "/board-member",
  authenticateJwt,
  upload.single("image"),
  async (req, res) => {
    const {
      name,
      email,
      university,
      department,
      faculty,
      position,
      bio,
      dateJoined,
    } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ errorMessage: "Please upload an image" });
      }
      const upload_response = await cloudinary.uploader.upload(req.file.path);
      if (upload_response) {
        const data = {
          name,
          email,
          university,
          department,
          faculty,
          position,
          bio,
          dateJoined,
          avatar: upload_response.url,
          cloudinary_id: upload_response.public_id,
        };
        let user = new BoardMembers(data);
        await user.save();
        res.status(200).json({
          successMessage: "New Board Member was sucessfully saved to database",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMessage: "Sorry!!! Internal server Error" });
    }
  }
);

router.get("/board-member", async (req, res) => {
  try {
    let users = await BoardMembers.find();
    return res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.get("/board-member/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    let user = await BoardMembers.findById(_id);
    return res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.put(
  "/board-member/:id",
  authenticateJwt,
  upload.single("image"),
  async (req, res) => {
    const _id = req.params.id;
    try {
      let user = await BoardMembers.findById(_id);

      await cloudinary.uploader.destroy(user.cloudinary_id);

      const result = await cloudinary.uploader.upload(req.file.path);

      const data = {
        name: req.body.name || user.name,
        email: req.body.email || user.email,
        university: req.body.university || user.university,
        department: req.body.department || user.department,
        faculty: req.body.faculty || user.faculty,
        position: req.body.position || user.position,
        bio: req.body.bio || user.bio,
        dateJoined: req.body.dateJoined || user.dateJoined,
        avatar: result.secure_url || user.avatar,
        cloudinary_id: result.public_id || user.cloudinary_id,
      };

      user = await BoardMembers.findByIdAndUpdate(_id, data, { new: true });

      return res
        .status(200)
        .json({ successMessage: `Board Member data was successfully updated` });
    } catch (error) {
      return res.status(500).json({ errorMessage: "Something went wrong" });
    }
  }
);

router.delete("/board-member/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    let user = await BoardMembers.findById(_id);
    await cloudinary.uploader.destroy(user.cloudinary_id);
    await user.remove();
    res.status(200).json({
      successMessage: `${user.name} with was successfully removed from board members`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});

router.post("/objective", authenticateJwt, async (req, res) => {
  const { description } = req.body;
  try {
    const data = {
      description,
    };
    const newObjective = await Objectives.create(data);
    newObjective.save();
    res.status(201).json({
      successMessage: "New Objective was sucessfully saved to database",
    });
  } catch (error) {
    res.status(500).json({ errorMessage: "Sorry!!! Internal server Error" });
  }
});

router.get("/objective", async (req, res) => {
  try {
    const allObjectives = await Objectives.find();
    return res.status(200).json(allObjectives);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.put("/objective/:id", authenticateJwt, async (req, res) => {
  const { description } = req.body;
  const _id = req.params.id;

  try {
    let objective = await Objectives.findOne({ _id });

    if (!objective) {
      return res
        .status(200)
        .json(
          `Objective with ID ${_id} was not found; a new question was created`
        );
    } else {
      objective.description = description;
      await objective.save();
      return res
        .status(200)
        .json({ successMessage: `Objective data was successfully updated` });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
});

router.delete("/objective/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    const deletedObjective = await Objectives.deleteOne({ _id }).exec();

    if (deletedObjective.deletedCount === 0) {
      return res.status(404).json({ errorMessage: `Objective does not Exist` });
    } else {
      res.status(200).json({
        successMessage: `Objective With ID was Successfully Deleted`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});

const cloudinaryImageUploadMethod = async (file) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(file, (err, res) => {
      if (err)
        return res
          .status(500)
          .json({ errorMessage: "Sorry!!! Internal server Error" });
      resolve({
        res: res.secure_url,
      });
    });
  });
};

router.post(
  "/programmes",
  authenticateJwt,
  upload.array("images", 12),
  async (req, res) => {
    if (!req.files) {
      return res.status(400).json({ errorMessage: "Please upload an image" });
    }
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newPath = await cloudinaryImageUploadMethod(path);
      urls.push(newPath);
    }

    const programe = new Programmes({
      title: req.body.title,
      theme: req.body.theme,
      startToEndDate: req.body.startToEndDate,
      uploadedDocumentFiles: urls.map((url) => url.res),
    });

    await programe.save();

    res.status(200).json({
      successMessage: "New Programme was sucessfully saved to database",
    });
  }
);

router.get("/programmes", async (req, res) => {
  try {
    let users = await Programmes.find();
    return res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.delete("/programmes/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    let user = await Programmes.findById(_id);
    await cloudinary.uploader.destroy(user.cloudinary_id);
    await user.remove();
    res.status(200).json({
      successMessage: "Programme was successfully removed",
    });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});

router.post(
  "/reports",
  authenticateJwt,
  upload.single("report"),
  async (req, res) => {
    const { title, publicationDate } = req.body;
    try {
      if (!req.file) {
        return res.status(400).json({ errorMessage: "Please upload an image" });
      }
      const upload_response = await cloudinary.uploader.upload(req.file.path);
      if (upload_response) {
        const data = {
          title,
          publicationDate,
          uploadedDocumentFile: upload_response.url,
          cloudinary_id: upload_response.public_id,
        };
        let report = new Reports(data);
        await report.save();
        res.status(200).json({
          successMessage: "New report was sucessfully saved to database",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ errorMessage: "Sorry!!! Internal server Error" });
    }
  }
);

router.get("/reports", async (req, res) => {
  try {
    let users = await Reports.find();
    return res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.delete("/reports/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    let user = await Reports.findById(_id);
    await cloudinary.uploader.destroy(user.cloudinary_id);
    await user.remove();
    res.status(200).json({
      successMessage: "Programme was successfully removed",
    });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});

router.post(
  "/archives",
  authenticateJwt,
  async (req, res) => {
    const { title, publicationDate, description, uploadedVideoUrl } = req.body;
    try {
        const data = {
          title,
          publicationDate,
          description,
          uploadedVideoUrl
        };
        let archive = new Archives(data);
        await archive.save();
        res.status(200).json({
          successMessage: "New Archive was sucessfully saved to database",
        });
    } catch (error) {
      res.status(500).json({ errorMessage: "Sorry!!! Internal server Error" });
    }
  }
);

router.get("/archives", async (req, res) => {
  try {
    let users = await Archives.find();
    return res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.get("/archives/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    let archive = await Archives.findById(_id);
    return res.status(200).json(archive);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.delete("/archives/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    let user = await Archives.findById(_id);
    await user.remove();
    res.status(200).json({
      successMessage: "Archives was successfully removed",
    });
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});




//Responsibilities

router.post("/responsibilities", authenticateJwt, async (req, res) => {
  const { description } = req.body;
  try {
    const data = {
      description,
    };
    const newResponsibility = await Responsibilities.create(data);
    newResponsibility.save();
    res.status(201).json({
      successMessage: "New responsibility was sucessfully saved to database",
    });
  } catch (error) {
    res.status(500).json({ errorMessage: "Sorry!!! Internal server Error" });
  }
});

router.get("/responsibilities", async (req, res) => {
  try {
    const allResponsibilities = await Responsibilities.find();
    return res.status(200).json(allResponsibilities);
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong, Please try again." });
  }
});

router.put("/responsibilities/:id", authenticateJwt, async (req, res) => {
  const { description } = req.body;
  const _id = req.params.id;

  try {
    let responsibility = await Responsibilities.findOne({ _id });

    if (!responsibility) {
      return res
        .status(200)
        .json(
          `Responsibility with ID ${_id} was not found; a new question was created`
        );
    } else {
      responsibility.description = description;
      await responsibility.save();
      return res
        .status(200)
        .json({ successMessage: `Responsibility was successfully updated` });
    }
  } catch (error) {
    return res.status(500).json({ errorMessage: "Something went wrong" });
  }
});

router.delete("/responsibilities/:id", authenticateJwt, async (req, res) => {
  const _id = req.params.id;
  try {
    const deletedResponsibility = await Responsibilities.deleteOne({ _id }).exec();

    if (deletedResponsibility.deletedCount === 0) {
      return res.status(404).json({ errorMessage: `Responsibility does not Exist` });
    } else {
      res.status(200).json({
        successMessage: `Responsibility With ID was Successfully Deleted`,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ errorMessage: "Something went wrong while fetching user" });
  }
});

module.exports = router;
