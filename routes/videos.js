const router = require("express").Router();
const { index, show, getSuggestions, stream, upload } = require("../controllers/videoController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/", index);
router.get("/:id", show);
router.get("/:id/suggestions", getSuggestions);
router.get("/stream/:filename", stream);
router.post("/upload", checkAuth, upload);

module.exports = router;
