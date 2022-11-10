const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqus0zu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {

        const foodCollection = client.db('foodieExpress').collection('foods');
        const foodDetailsCollection = client.db('foodieExpress').collection('foodDetails');


        //data send to database

        app.post('/service', async (req, res) => {
            const foods = req.body;
            const result = await foodCollection.insertOne(foods);
            res.send(result);
        })

        app.get('/foods', async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const foods = await cursor.limit(3).toArray();
            res.send(foods);
        })
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query);
            const ServiceFoods = await cursor.toArray();
            res.send(ServiceFoods);
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await foodCollection.findOne(query);
            res.send(service);
        })



        app.get('/foodDetails', async (req, res) => {
            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }
            const cursor = foodDetailsCollection.find(query);
            const foodDetail = await cursor.toArray();
            res.send(foodDetail);
        })

        app.post('/foodDetails', async (req, res) => {
            const foodDetail = req.body;
            const result = await foodDetailsCollection.insertOne(foodDetail);
            res.send(result);
        })
        app.put('/foodDetails/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const doc = req.body;
            const option = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: doc.comment

                }
            }
            const result = await foodDetailsCollection.updateOne(filter, updatedDoc, option);
            res.send(result);
        })


    }

    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Foodie Express Is Running!')
})

app.listen(port, () => {
    console.log(`Foodie Express listening on port ${port}`)
})