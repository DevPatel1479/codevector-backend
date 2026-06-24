const express = require("express");
const { getProducts,
    postProduct,
    putProduct,
    partialPatchProduct
 } = require("../controllers/products.controller");

const router = express.Router();

router.get("/", getProducts);
router.post("/", postProduct);
router.put("/:id", putProduct);
router.patch("/:id", partialPatchProduct);


module.exports = router;
