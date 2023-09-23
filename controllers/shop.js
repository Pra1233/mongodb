const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find() //find() in mongoose give products

    // .select("title price -_id") //execulude -id
    // .populate("userId", "name") //provide all detail information not just userid
    .then((products) => {
      // console.log(products, "products");
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  //one product
  const prodId = req.params.productId;
  Product.findById(prodId) //mongoose has findById() -we can pass string id it convert objectid
    .then((product) => {
      console.log(product, "product");
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId") //give all information of product id
    // .execPopulate() //promise
    .then((user) => {
      // console.log("user", user);
      // console.log(user.cart.items, "products of cart"); //array of product in cart
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: user.cart.items,
      });
    })
    .catch((err) => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product); //product id storing in cart (method made in product model)
    })
    .then((result) => {
      console.log(result, "result(postCart)");
      res.redirect("/cart");
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user //accessing user model
    .removeFromCart(prodId) //delete cart item function
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId") //give all information of product id
    // .execPopulate() //promise
    .then((user) => {
      console.log(user, "22222222");
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          productData: { ...i.productId._doc }, //_doc get data of _id
        };
      }); //array of produts
      if (products) {
        console.log(products, "Products"); //we get quantity and productdata
      }

      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart(); //method in user model
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => console.log(err));
};
