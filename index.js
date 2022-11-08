const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        //data send to database
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