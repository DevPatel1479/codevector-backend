const { validateProductsQuery,
   parseIdParam,
   validateProductCreateBody,
   validateProductPatchBody,
   validateProductPutBody
 } = require("../validators/products.validator");


const { 
  listProducts,
  createProduct,
  patchProduct,
  replaceProduct
} = require("../services/products.service");

async function getProducts(req, res, next) {
  try {
    const query = validateProductsQuery(req.query);
    const result = await listProducts(query);

    res.status(200).json({
      success: true,
      data: result.items,
      pageInfo: result.pageInfo,
    });
  } catch (error) {
    next(error);
  }
}

async function postProduct(req, res, next) {
  try {
    const payload = validateProductCreateBody(req.body);
    const product = await createProduct(payload);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

async function putProduct(req, res, next) {
  try {
    const id = parseIdParam(req.params.id);
    const payload = validateProductPutBody(req.body);
    const product = await replaceProduct(id, payload);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}

async function partialPatchProduct(req, res, next) {
  try {
    const id = parseIdParam(req.params.id);
    const updates = validateProductPatchBody(req.body);
    const product = await patchProduct(id, updates);

    res.status(200).json({
      success: true,
      message: "Product partially updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
}



module.exports = { getProducts,
  postProduct,
  putProduct,
  partialPatchProduct
  
 };
