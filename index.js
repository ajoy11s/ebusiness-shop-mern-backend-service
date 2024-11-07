require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


//mongoDB Code added with function
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { error } = require('console');

const URI = process.env.MONGO_URI;

const client = new MongoClient(URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const database = client.db("ebusiness_shop_dbuser");

    const tblregisteruseradd = database.collection("tblregisteruseradd");
    app.post("/register_user_add", async (req, res) => {
      const userlist = req.body;
      const result = await tblregisteruseradd.insertOne(userlist);
      res.send(result);
    });
    app.get("/register_user_data/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      try {
        const result = await tblregisteruseradd.findOne(query);
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/register_user_all_data", async (req, res) => {
      try {
        const query = database.collection("tblregisteruseradd").find();
        const result = await query.toArray();
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });


    app.put('/update_user_data/:email', async (req, res) => {
      const email = req.params.email;
      const { name, tel, address } = req.body;

      if (!email || !name || !tel || !address) {
        return res.status(400).send({ message: 'All fields are required.' });
      }

      const filter = { email: email };
      const options = { upsert: true };

      const updatedUser = {
        $set: {
          name: name,
          address: address,
          tel: tel
        },
      };

      try {
        const result = await tblregisteruseradd.updateOne(filter, updatedUser, options);

        // Check if the update was successful
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).send({ message: 'User not found and no update was made.' });
        }

        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    app.put('/update_user_role/:email', async (req, res) => {
      const email = req.params.email;
      const { isadmin, isgeneraluser } = req.body;

      const filter = { email: email };
      const options = { upsert: true };

      const updatedUser = {
        $set: {
          isadmin: isadmin,
          isgeneraluser: isgeneraluser
        },
      };

      try {
        const result = await tblregisteruseradd.updateOne(filter, updatedUser, options);

        // Check if the update was successful
        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).send({ message: 'User not found and no update was made.' });
        }

        res.send({ message: 'User updated successfully', result });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    const tbladdproduct = database.collection("tbladdproduct");
    app.post("/dashboard_add_product", async (req, res) => {
      const productlist = req.body;
      const result = await tbladdproduct.insertOne(productlist);
      res.send(result);
    });

    app.get("/get_all_product_data", async (req, res) => {
      try {
        const query = database.collection("tbladdproduct").find();
        const result = await query.toArray();
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    app.get("/get_all_product_data_by_categoryid/:category_id", async (req, res) => {
      // try {
      //   const category_id = req.params.category_id;
      //   const query = { category_id: category_id };
      //   const result = await database.collection("tbladdproduct").find(query).toArray();
      //   if (result) {
      //     res.send(result);
      //   } else {
      //     res.status(404).send({ message: "Products not found" });
      //   }
      // } catch (error) {
      //   console.error(error);
      //   res.status(500).send({ message: error });
      // }

      try {
        const tblbuyproductcustomer = await database.collection('tblbuyproductcustomer');

        const averageRatings = await tblbuyproductcustomer.aggregate([
          {
            $group: {
              _id: "$product_id",
              averageRating: { $avg: { $toDouble: '$rating' } }
            }
          }
        ]).toArray();

        const avgRatingsMap = {};
        averageRatings.forEach(item => {
          avgRatingsMap[item._id] = item.averageRating;
        });

        const category_id = req.params.category_id;
        const query = { category_id: category_id };
        const products = await database.collection('tbladdproduct').find(query).toArray();

        const result = products.map(product => ({
          ...product,
          averageRating: avgRatingsMap[product._id] || null
        }));

        res.json(result);
      } catch (error) {
        console.error("Error fetching products with ratings:", error);
        res.status(500).json({ message: "Internal server error" });
      }

    });

    app.get("/get_single_product_by_id/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };

      try {
        const tbladdproduct = database.collection("tbladdproduct");
        const result = await tbladdproduct.findOne(query);

        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).send({ message: "Internal server error" });
      }
    });


    app.put('/update_product_data/:_id', async (req, res) => {
      const id = req.params._id;
      const { product_name, product_details, product_price } = req.body;


      if (!product_name || !id || !product_details || !product_price) {
        return res.status(400).send({ message: 'All fields are required.' });
      }

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedProduct = {
        $set: {
          product_name: product_name,
          product_details: product_details,
          product_price: product_price
        },
      };

      try {
        const result = await tbladdproduct.updateOne(filter, updatedProduct, options);

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).send({ message: 'Product not found and no update was made.' });
        }

        res.send({ message: 'Product updated successfully', result });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    app.delete('/delete_product_data/:_id', async (req, res) => {
      const id = req.params._id;

      try {
        const result = await tbladdproduct.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'Item not found' });
        }

        res.send({ message: 'Item deleted successfully' });
      } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send({ message: 'Error deleting item', error });
      }
    });


    const tbladdcategory = database.collection("tbladdcategory");
    app.post("/dashboard_add_categorylist", async (req, res) => {
      const categorylist = req.body;
      const result = await tbladdcategory.insertOne(categorylist);
      res.send(result);
    });

    app.get("/get_all_category_data", async (req, res) => {
      const query = database.collection("tbladdcategory").find();
      const result = await query.toArray();
      res.send(result);
    });



    app.put('/update_category_data/:_id', async (req, res) => {
      const id = req.params._id;
      const { category_name } = req.body;

      if (!category_name || !id) {
        return res.status(400).send({ message: 'All fields are required.' });
      }

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedCategory = {
        $set: {
          category_name: category_name
        },
      };

      try {
        const result = await tbladdcategory.updateOne(filter, updatedCategory, options);

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).send({ message: 'Category not found and no update was made.' });
        }

        res.send({ message: 'Category updated successfully', result });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });

    app.delete('/delete_category_data/:_id', async (req, res) => {
      const id = req.params._id;

      try {
        const result = await tbladdcategory.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: 'Item not found' });
        }

        res.send({ message: 'Item deleted successfully' });
      } catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).send({ message: 'Error deleting item', error });
      }
    });


    const tblbuyproductcustomer = database.collection("tblbuyproductcustomer");
    app.post("/customer_add_buy_product", async (req, res) => {
      const buyproductinfo = req.body;
      const result = await tblbuyproductcustomer.insertOne(buyproductinfo);
      res.send(result);
    });

    app.get("/get_all_customer_buy_data/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const query = { email: email };
        const result = await database.collection("tblbuyproductcustomer").find(query).toArray();
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Products not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: error });
      }
    });

    app.put('/update__buyer_product_rating/:_id', async (req, res) => {
      const id = req.params._id;
      const { rating } = req.body;


      if (!rating) {
        return res.status(400).send({ message: 'All fields are required.' });
      }

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updatedProduct = {
        $set: {
          rating: rating
        },
      };

      try {
        const result = await tblbuyproductcustomer.updateOne(filter, updatedProduct, options);

        if (result.modifiedCount === 0 && result.upsertedCount === 0) {
          return res.status(404).send({ message: 'Product not found and no update was made.' });
        }

        res.send({ message: 'Rating successfully', result });
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send({ message: 'Internal server error' });
      }
    });


    app.get('/products-with-ratings', async (req, res) => {
      try {
        const tblbuyproductcustomer = database.collection('tblbuyproductcustomer');
        const tbladdproduct = database.collection('tbladdproduct');


        const averageRatings = await tblbuyproductcustomer.aggregate([
          {
            $group: {
              _id: "$product_id",
              averageRating: { $avg: { $toDouble: '$rating' } }
            }
          }
        ]).toArray();

        const avgRatingsMap = {};
        averageRatings.forEach(item => {
          avgRatingsMap[item._id] = item.averageRating;
        });

        const products = await tbladdproduct.find().toArray();

        const result = products.map(product => ({
          ...product,
          averageRating: avgRatingsMap[product._id] || null
        }));

        res.json(result);
      } catch (error) {
        console.error("Error fetching products with ratings:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //Start image upload on clounary server
    // Cloudinary configuration
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Set up multer for file uploads
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    app.post('/upload', upload.single('file'), async (req, res) => {
      try {
        const result = await cloudinary.uploader.upload_stream()(req.file.buffer);
        res.status(200).json({ url: result.secure_url });
      } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
      }
    });

    //End image upload on cloudnary server



  } finally {

  }
}
run().catch((error) => {
  console.log(error);
});

//mongoDB Code end with function

// Your SSLCOMMERZ Sandbox credentials

const SSLCommerzPayment = require('sslcommerz-lts');
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false;

app.post('/initiate-payment', async (req, res) => {

  const data = {
    total_amount: req.body.totalAmount,
    currency: 'BDT',
    tran_id: req.body.tran_id,
    success_url: req.body.successUrl,
    fail_url: req.body.failUrl,
    cancel_url: req.body.cancelUrl,
    ipn_url: req.body.ipn_url,
    shipping_method: req.body.shipping_method,
    product_name: req.body.product_name,
    product_category: req.body.product_category,
    product_profile: 'general',
    cus_name: req.body.cusName,
    cus_email: req.body.cusEmail,
    cus_phone: req.body.cusPhone,
    cus_address: req.body.cusAddress,
    cus_city: req.body.cusCity,
    cus_state: req.body.cusState,
    cus_postcode: req.body.cusPostcode,
    cus_country: req.body.cusCountry,
    cus_fax: '01000000000',
    ship_name: req.body.cusName,
    ship_add1: req.body.cusAddress,
    ship_add2: req.body.cusAddress,
    ship_city: req.body.cusAddress,
    ship_state: req.body.cusAddress,
    ship_postcode: req.body.cusPostcode,
    ship_country: 'Bangladesh',
  };
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
  sslcz.init(data).then(apiResponse => {
    let GatewayPageURL = apiResponse.GatewayPageURL
    res.send({
      url: GatewayPageURL
    });
    //console.log('Redirecting to: ', GatewayPageURL)
  });

});

app.post("/payment_online/success/:tran_id", async (req, res) => {
  try {
    const tran_id = req.params.tran_id;
    if (tran_id) {
      res.send(`
        <html>
          <head>
            <title>Payment Confirmation</title>
            <style>
            body {
              font-family: Arial, sans-serif;
            }
            h1 {
              color: green;
            }
          </style>
          </head>
          <body>
            <h1>Payment successfully done!</h1>
            <p>Your transaction number is: <strong>${tran_id}</strong></p>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

app.post("/payment_online/fail", async (req, res) => {
  try {
    res.send(`
        <html>
          <head>
            <title>Payment Fail</title>
            <style>
            body {
              font-family: Arial, sans-serif;
            }
            h1 {
              color: red;
            }
          </style>
          </head>
          <body>
            <h1>Your payment failed!</h1>
          </body>
        </html>
      `);

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});

app.post("/payment_online/cancel", async (req, res) => {
  try {
    res.send(`
        <html>
          <head>
            <title>Payment Cancel</title>
            <style>
              body {
                font-family: Arial, sans-serif;
              }
              h1 {
                color: red;
              }
            </style>
          </head>
          <body>
            <h1>Your payment Cancel!</h1>
          </body>
        </html>
      `);

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error });
  }
});


app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


module.exports = app;
