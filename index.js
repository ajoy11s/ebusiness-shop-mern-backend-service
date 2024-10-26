require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const serverless = require('serverless-http');
const router = express.Router();

const port = process.env.PORT || 5000;

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
      try {
        const category_id = req.params.category_id;
        const query = { category_id: category_id };
        const result = await database.collection("tbladdproduct").find(query).toArray();
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
        const result = await tbladdcategory.findByIdAndUpdate(
          id,
          { isdelete: true },
          { new: true }
        );

        if (!result) {
          return res.status(404).send({ message: 'Item not found' });
        }
        res.send({ message: 'Item marked as deleted successfully' });
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

  } finally {

  }
}
run().catch((error) => {
  console.log(error);
});

//mongoDB Code end with function

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


app.use('/functions/api', router);

module.exports.handler = serverless(app);
