const router = require("express").Router();
const {index , upload} = require('../controllers/videoController');
const checkAuth = require("../middlewares/checkAuth");

router.get('/' , index);
router.post("/upload",checkAuth , upload);

module.exports = router;
