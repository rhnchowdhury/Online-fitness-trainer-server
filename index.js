const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ajoxj5t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const fitnessCollection = client.db('onlineFitness').collection('trainings');
        const reviewCollection = client.db('onlineFitness').collection('reviews');

        // to get limited data from mongodb
        app.get('/fit', async (req, res) => {
            const query = {};
            const cursor = fitnessCollection.find(query).limit(3);
            const fitness = await cursor.toArray();
            res.send(fitness);
        });

        // to get all data from mongodb
        app.get('/fitness', async (req, res) => {
            const query = {};
            const cursor = fitnessCollection.find(query);
            const trainings = await cursor.toArray();
            res.send(trainings);
        });

        // to get all data by id from mongodb
        app.get('/fitness/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            trainingsId = await fitnessCollection.findOne(query);
            res.send(trainingsId);
        });

        // created reviews data
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        });

        // to get reviews data
        app.get('/reviews', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

    }
    finally {

    }
}
run().catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send('fitness server running');
});

app.listen(port, () => {
    console.log(`fitness server running on port ${port}`);
});