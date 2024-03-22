const { MongoClient } = require("mongodb");
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
const uri = "mongodb+srv://testUser:testUser@cluster0.7t81nhs.mongodb.net/KBdb2/KBthings2?retryWrites=true&w=majority&appName=Cluster0";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Default route
app.get('/', function(req, res) {
  const myquery = req.query;
  var outstring = 'Starting... ';
  res.send(outstring);
});

// Route to access database
app.get('/api/mongo/:item', function(req, res) {
  const client = new MongoClient(uri);
  const searchKey = "{ UserID: '" + req.params.item + "' }";
  console.log("Looking for: " + searchKey);

  async function run() {
    try {
      await client.connect();
      const database = client.db('KBdb2');
      const Users = database.collection('KBthings2');
      const query = { UserID: req.params.item };

      const user = await Users.findOne(query);
      res.send('Found this: ' + JSON.stringify(user));
    } catch (error) {
      console.error(error);
      res.send('Error accessing database.');
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
});

// Clear cookie route
app.get('/clear-cookie', (req, res) => {
  res.clearCookie('auth');
  res.send('Authentication cookie cleared. <a href="/">Go back</a>');
});

// Listen on port
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));
