const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4qyig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  await client.connect();
  const inventoryCollection = client.db("bookly").collection("inventory");

  app.get("/inventory", async (req, res) => {
    const query = {};
    const cursor = inventoryCollection.find(query);
    const inventorys = await cursor.toArray();
    res.send(inventorys);
  });

  app.get("/inventory/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const inventory = await inventoryCollection.findOne(query);
    res.send(inventory);
  });

  app.post("/inventory", async (req, res) => {
    const newInventory = req.body;
    const result = await inventoryCollection.insertOne(newInventory);
    res.send(result);
  });

  app.put("/inventory/plus/:id", async (req, res) => {
    const id = req.params.id;
    const quantity = parseInt(req.body.quantity);
    const query = { _id: ObjectId(id) };
    const inventory = await inventoryCollection.findOne(query);

    const newQuantity = quantity + inventory.quantity;
    const updatedInventory = await inventoryCollection.updateOne(query, {
      $set: { quantity: newQuantity },
    });

    res.send(updatedInventory);
  });

  app.put("/inventory/minus/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const inventory = await inventoryCollection.updateOne(query, {
      $inc: { quantity: -1 },
    });

    res.send(inventory);
  });

  app.delete("/inventory/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await inventoryCollection.deleteOne(query);
    res.send(result);
  });
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Bookly Is Okay!!!");
});

app.listen(port, () => {
  console.log("Server is running");
});
