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

// CSS styles
const styles = `
body {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    margin: 0;
}
.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 80%;
    max-width: 800px;
}
.form {
    width: 45%;
    display: flex;
    flex-direction: column;
}
.form input {
    margin-bottom: 10px;
    padding: 8px;
}
.center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 10%;
}
`;

// Default route
app.get('/', function(req, res) {
  // Check for authentication cookie
  if (req.cookies.auth) {
    res.send(`Authentication cookie exists. Value: ${req.cookies.auth}`);
  } else {
    res.send(`
      <style>${styles}</style>
      <div class="container">
        <div class="form">
            <h2>Login</h2>
            <form action="/login" method="post">
              <input type="text" name="UserID" placeholder="User ID" required><br>
              <input type="password" name="UserPass" placeholder="Password" required><br>
              <button type="submit">Login</button>
            </form>
        </div>
        <div class="form"> <!-- Adjusted form for register -->
            <h2>Register</h2>
            <form action="/register" method="post">
              <input type="text" name="UserID" placeholder="User ID" required><br>
              <input type="password" name="UserPass" placeholder="Password" required><br>
              <button type="submit">Register</button>
            </form>
        </div>
      </div>
    `);
  }
});

// Register route
app.post('/register', async (req, res) => {
  const { UserID, UserPass } = req.body;
  // Insert new user into MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('KBdb2');
    const collection = database.collection('KBthings2');
    await collection.insertOne({ UserID, UserPass });
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
  const { UserID, UserPass } = req.body;
  // Check if user credentials are valid
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const database = client.db('KBdb2');
    const collection = database.collection('KBthings2');
    const user = await collection.findOne({ UserID, UserPass });
    if (user) {
      res.cookie('auth', UserID, { maxAge: 60000 }); // Set authentication cookie
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
