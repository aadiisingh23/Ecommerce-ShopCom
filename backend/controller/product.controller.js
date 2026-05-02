import cloudinary from "../config/cloudinary.js";
import Product from "../model/product.model.js";

//   for getting all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res
      .status(200)
      .json(products );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

//  for getting single specific product details

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json( product );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

//  create or listing a new Product by admin only
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;

    let imageUrl = "";

    // if (!name || !price || !descripti on || !category || !stock || !imageUrl) {
    //   return res.status(400).json({ message: "All fields are required" });
    // }

    // here we are using clodinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
  //    console.log(result);

      imageUrl = result.secure_url;
    }

    const newProduct = await Product.create({
      name,
      price,
      description,
      category,
      stock,
      imageUrl,
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};


// updating product by admin only
export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.category = category || product.category;
      product.stock = stock || product.stock;

      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
       // console.log(result);
        product.imageUrl = result.secure_url || product.imageUrl;
      }

      const updatedProduct =  await product.save();
      res.status(200).json(updatedProduct);
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to update product", error: error.message });
  }
};



// deleting specific product
export const deleteProduct = async (req,res)=>{
    try {
        const product = await Product.findById(req.params.id);

        if(product){
           await product.deleteOne();
            return res.status(200).json({ message: "product is deleted successfully" });
        }else
            return res.status(404).json({ message: "product is  not found delete unsuccessful" });
        }
    catch (error) {
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
}
