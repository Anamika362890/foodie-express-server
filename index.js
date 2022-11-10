const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dqus0zu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);

    if (!authHeader) {
        return res.status(403).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];


    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}



async function run() {
    try {

        const foodCollection = client.db('foodieExpress').collection('foods');
        const foodDetailsCollection = client.db('foodieExpress').collection('foodDetails');
        const ReviewCollection = client.db('foodieExpress').collection('Reviews');


        //jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        })


        //data send to database

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await ReviewCollection.insertOne(review);
            res.send(result);
        })
        app.post('/foods', async (req, res) => {
            const foods = req.body;

            const result = await foodCollection.insertOne(foods);
            res.send(result);
        })

        app.post('/service', async (req, res) => {
            const foods = req.body;
            const result = await foodCollection.insertOne(foods);
            res.send(result);
        })

        app.get('/foods', async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query).sort({ _id: -1 });
            const foods = await cursor.limit(3).toArray();
            res.send(foods);
        })
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = foodCollection.find(query).sort({ _id: -1 });
            const ServiceFoods = await cursor.toArray();
            res.send(ServiceFoods);
        })

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await foodCollection.findOne(query);
            res.send(service);
        })


        //
        app.get('/foodDetails', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log(decoded);

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }



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