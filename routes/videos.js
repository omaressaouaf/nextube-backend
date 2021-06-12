const router = require("express").Router();
const { index, show, stream, upload } = require("../controllers/videoController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/", index);
router.get("/:id", show);
router.get("/stream/:filename", stream);
router.post("/upload", checkAuth, upload);

module.exports = router;
