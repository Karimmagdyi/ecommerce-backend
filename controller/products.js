const Product = require("../model/product");
const Category = require("../model/category");
const product = require("../model/product");
const {
  BadRequest,
  InternalServerError,
  NotFound,
} = require("../utils/helper functions/handleError");

getAllProducts = async (req, res, next) => {
  try {
    const filter = { category: "Devices" };
    const pipeline = [
      { $sort: { sold: -1 } }, // Sort by sold in descending order
      {
        $setWindowFields: {
          sortBy: { sold: -1 }, // Sort again to ensure top-sold ranking
          output: {
            rank: { $rank: {} }, // Rank field to assign positions
          },
        },
      },
      {
        $addFields: {
          isBestSeller: {
            $cond: {
              if: { $lte: ["$rank", 3] }, // Mark top 3 as bestsellers
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          _id: 1, // Include the _id
          name: 1, // Include product name
          sold: 1, // Include sold field
          isBestSeller: 1,
          image: 1,
          quantity: 1,
          locked: 1,
          category: 1,
          price:1
        },
      },
    ];

    const products = await product.aggregate(pipeline).exec();

    return res.status(200).json({ products: products });
  } catch (err) {
    return next(new InternalServerError("error while getting the products"));
  }
};

PostAddProduct = async (req, res, next) => {
  const { name, image, price, description, category } = req.body;

  // Check if all fields are provided
  if (!name || !image || !price || !description || !category) {
    return next(new BadRequest("All the field is required"));
  }

  try {
    // let categoryDoc = await Category.findOne({ name: category });

    // if (!categoryDoc) {
    //   categoryDoc = new Category({ name: category });
    //   await categoryDoc.save();
    // }

    let categoryDoc = await Category.findOneAndUpdate(
      { name: category },
      {},
      { upsert: true }
    );

    const product = new Product({
      name,
      price,
      image,
      description,
      category: categoryDoc._id,
      quantity: 5,
    });
    await product.save();
    res.status(200).json({ msg: "Product added successfully", product });
  } catch (error) {
    return next(new InternalServerError("Error adding product"));
  }
};

getCategory = (req, res, next) => {
  try {
    Category.find().then((category) => {
      res.status(200).json({ category: category });
    });
  } catch {
    return next(new NotFound("Not Found Category"));
  }
};

getProductById = (req, res, next) => {
  try {
    Product.findById(req.params.id).then((product) => {
      res.status(200).json({ product: product });
    });
  } catch {
    return next(
      new NotFound(`Not Found product with that id ${req.params.id}`)
    );
  }
};

updateProduct = async (req, res, next) => {
  try {
    const { name, image, price, description, productId } = req.body;
    console.log(req.body, "body");

    //findByIdAndUpdate
    const product = await Product.findById(productId);
    console.log(product, "updated product");
    product.name = name;
    product.price = price;
    product.image = image;
    product.description = description;
    const updatedProduct = await product.save();
    res
      .status(200)
      .json({ msg: "Product updated successfully", product: updatedProduct });
  } catch {
    return next(new BadRequest("cannot update the product"));
  }
};

filteredProduct = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    if (!categoryId) {
      return res.status(400).json({ msg: "Please provide category id" });
    }
    const products = await Product.find({ category: categoryId });
    return res.status(200).json({ products: products });
  } catch {
    return next(new NotFound("products Not Found"));
  }
};
//cron jobs



const searchProduct=async(req,res,next)=>{
  console.log('hi');
  
  const {search}=req.query

  let filter={}

  if(search){
    filter.$or=[
      {name:{$regex:search,$options:'i'}},
      // {description:{$regex:search,$options:'i'}}
    ]
  }
  const searchedProducts=await Product.find(filter).select('name price category description image')
  console.log(searchedProducts,searchedProducts);
  return res.status(200).json({products:searchedProducts,length:searchedProducts.length})
}

module.exports = {
  getAllProducts,
  PostAddProduct,
  getCategory,
  getProductById,
  updateProduct,
  filteredProduct,
  searchProduct
};
