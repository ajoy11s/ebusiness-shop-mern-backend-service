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
//const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.q2fr3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const URI = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
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
    await client.connect();

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

      // Validate parameters (you can use a library like Joi for more complex validation)
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
        //const result = await query.toArray();
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
      const _id = req.params._id; // Get _id from the URL
      const query = { _id: new ObjectId(_id) }; // Create a query object

      try {
        const tbladdproduct = database.collection("tbladdproduct");
        const result = await tbladdproduct.findOne(query);

        if (result) {
          res.send(result); // Send the found product
        } else {
          res.status(404).send({ message: "Product not found" });
        }
      } catch (error) {
        console.error('Error fetching product:', error.message);
        res.status(500).send({ message: "Internal server error" });
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
        //const result = await query.toArray();
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

  //   app.get("/get_all_customer_buy_data", async (req, res) => {
  //     const query = { category_id: category_id };
  //     const result = await database.collection("tbladdproduct").find(query).toArray();
  //     //const result = await query.toArray();
  //     if (result) {
  //       res.send(result);
  //     } else {
  //       res.status(404).send({ message: "Products not found" });
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send({ message: error });
  //   }
  // });


  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
  // Ensures that the client will close when you finish/error
  //await client.close();
}
}
run().catch((error) => {
  console.log(error);
});

//mongoDB Code end with function

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use('/functions/api', router);

module.exports.handler = serverless(app);
