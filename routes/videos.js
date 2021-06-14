const router = require("express").Router();
const { index, show, getSuggestions, stream, toggleLike, upload, toggleDislike } = require("../controllers/videoController");
const checkAuth = require("../middlewares/checkAuth");

router.get("/", index);
router.get("/:videoId", show);
router.get("/:videoId/suggestions", getSuggestions);
router.get("/stream/:filename", stream);
router.put("/:videoId/togglelike", checkAuth, toggleLike);
router.put("/:videoId/toggledislike", checkAuth, toggleDislike);
router.post("/upload", checkAuth, upload);

module.exports = router;
