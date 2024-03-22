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
  // Check for authentication cookie
  if (req.cookies.auth) {
    res.send(`Authentication cookie exists. Value: ${req.cookies.auth}`);
  } else {
    res.send(`
      <h2>Login or Register</h2>
      <form action="/login" method="post">
        <input type="text" name="user_ID" placeholder="User ID" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <button type="submit">Login</button>
      </form>
      <form action="/register" method="post">
        <input type="text" name="user_ID" placeholder="User ID" required><br>
        <input type="password" name="password" placeholder="Password" required><br>
        <button type="submit">Register</button>
      </form>
    `);
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { user_ID, password } = req.body;
  // Insert new user into MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('KBdb2');
    const collection = database.collection('KBthings2');
    await collection.insertOne({ user_ID, password });
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.send('Error registering user.');
  } finally {
    await client.close();
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { user_ID, password } = req.body;
  // Check if user credentials are valid
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('KBdb2');
    const collection = database.collection('KBthings2');
    const user = await collection.findOne({ user_ID, password });
    if (user) {
      res.cookie('auth', user_ID, { maxAge: 60000 }); // Set authentication cookie
      res.redirect('/');
    } else {
      res.send('Invalid credentials. <a href="/">Go back</a>');
    }
  } catch (error) {
    console.error(error);
    res.send('Error logging in.');
  } finally {
    await client.close();
  }
});

// Clear cookie route
app.get('/clear-cookie', (req, res) => {
  res.clearCookie('auth');
  res.send('Authentication cookie cleared. <a href="/">Go back</a>');
});

// Listen on port
app.listen(port, () => console.log(`Server started at http://localhost:${port}`));
