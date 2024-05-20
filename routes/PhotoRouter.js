const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // Thư mục để lưu trữ ảnh
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, "../public/images", filename);
  res.sendFile(imagePath);
});

router.get("/photosOfUser/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }
    const photos = await Photo.find({ user_id: userId });
    res.json(photos);
  } catch (error) {
    console.log(error);
  }
});

router.post("/new", upload.single("photo"), async (req, res) => {
  try {
    const fileName = req.file.filename;
    const userId = req.body.userId;

    // create a new photo
    const photo = new Photo({
      file_name: fileName,
      date_time: new Date(),
      user_id: userId,
      comment: [],
    });
    await photo.save();
    res.status(200).json({ message: "Photo uploaded" });
  } catch (error) {
    console.log(error);
  }
});

router.post("/commentsOfPhoto/:photo_id",async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;
  // Validate the comment
  console.log(req.body);
  try {
    const photo = await Photo.findById(photo_id);

    photo.comments.push({
      comment: comment,
      user_id: req.body.userId,
      date_time: new Date(),
    });
    // Save the updated photo
    const updatedPhoto = await photo.save();
    res.status(200).json(updatedPhoto);
  } catch (error) {
    console.error("Failed to add comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
});
module.exports = router;
