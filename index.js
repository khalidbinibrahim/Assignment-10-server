const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://khalid-bin-ibrahim-a10.web.app',
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
    const countriesCollection = database.collection("countries");

    // GET all tourist spots
    app.get("/tourist_spots", async (req, res) => {
      try {
        const { country_id } = req.query;
        const filter = country_id ? { country_id } : {};
        const cursor = touristSpotCollection.find(filter);
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error('Error fetching tourist spots:', error);
        res.status(500).json({ error: 'Failed to fetch tourist spots' });
      }
    });

    // GET tourist spots of the currently authenticated user
    app.get("/user_tourist_spots/:id", async (req, res) => {
      try {
        const userId = req.params.id;
        const cursor = touristSpotCollection.find({ user_id: userId });
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error('Error fetching user tourist spots:', error);
        res.status(500).json({ error: 'Failed to fetch user tourist spots' });
      }
    });

    // GET all countries data
    app.get("/countries", async (req, res) => {
      const cursor = countriesCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // GET tourist spots by country ID
    app.get("/countries/:name/tourist_spots", async (req, res) => {
      try {
        const countryName = req.params.name;
        const cursor = touristSpotCollection.find({ country_name: countryName });
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error('Error fetching tourist spots for the country:', error);
        res.status(500).json({ error: 'Failed to fetch tourist spots for the country' });
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
