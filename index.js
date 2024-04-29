const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Express JSON parser
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hguto33.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db("touristsSpotsDB");
    const touristSpotCollection = database.collection("touristsSpots");

    app.get("/tourist_spots", async (req, res) => {
      const cursor = touristSpotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get("/user_tourist_spots/:userId", async (req, res) => {
      const userId = req.params.userId;
      const cursor = touristSpotCollection.find({ user_id: userId });
      const result = await cursor.toArray();
      res.json(result);
    });

    app.post("/tourist_spots", async (req, res) => {
      const touristSpot = req.body;
      console.log(touristSpot);
      const result = await touristSpotCollection.insertOne(touristSpot);
      res.send(result);
    })

    app.delete('/tourist_spots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})
