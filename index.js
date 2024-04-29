const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
}));

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
    const database = client.db("touristsSpotsDB");
    const touristSpotCollection = database.collection("touristsSpots");

    // GET all tourist spots
    app.get("/tourist_spots", async (req, res) => {
      const cursor = touristSpotCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // GET tourist spots of the currently authenticated user
    app.get("/user_tourist_spots", async (req, res) => {
      const userId = req.userId;
      try {
        const cursor = touristSpotCollection.find({ user_id: userId });
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching user tourist spots:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    // POST a new tourist spot
    app.post("/tourist_spots", async (req, res) => {
      const touristSpot = req.body;
      const result = await touristSpotCollection.insertOne(touristSpot);
      res.send(result);
    })

    // DELETE a tourist spot by ID
    app.delete('/tourist_spots/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.deleteOne(query);
      res.send(result);
    })

    // PUT to update a tourist spot by ID
    app.put('/tourist_spots/:id', async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const query = { _id: new ObjectId(id) };
      const result = await touristSpotCollection.updateOne(query, { $set: updatedData });
      res.send(result);
    });

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
  console.log(`Server is running on port ${port}`);
});
