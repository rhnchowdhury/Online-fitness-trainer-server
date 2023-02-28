const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// Middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ajoxj5t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt verify
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}


async function run() {
    try {

        const fitnessCollection = client.db('onlineFitness').collection('trainings');
        const reviewCollection = client.db('onlineFitness').collection('reviews');
        const addCollection = client.db('onlineFitness').collection('added');

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
        app.get('/reviews', verifyJWT, async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // to delete reviews data
        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        // to crete added data
        app.post('/add', async (req, res) => {
            const add = req.body;
            const result = await addCollection.insertOne(add);
            res.send(result);
        });

        // to get added data
        app.get('/add', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = addCollection.find(query);
            const added = await cursor.toArray();
            res.send(added);
        });

        // jwt create
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token });
        });

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