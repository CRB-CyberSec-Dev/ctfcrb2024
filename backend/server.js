const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const xml2js = require('xml2js');
const parser = new xml2js.Parser();
const crypto = require('crypto');

const app = express();
const PORT = 5000;
const secretKey = 'CRB_DontLetYouDown'; // Replace with env variable in production

// Secret key for encryption
const secret = 'MulSVQT1HJG7Qwph+R4p1/IaeXhiEJeXqbruyeJvGI/dnKOTTEZObRCvbj32fFJ8';
const algorithm = 'aes-256-cbc'; // Choose your encryption algorithm


app.use(bodyParser.json());
app.use(cors());

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:');
// const db = new sqlite3.Database('db/database.db');

// Create a users table and insert dummy login data
db.serialize(() => {
    // Create users table
    db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, role TEXT)');
  
    // Insert dummy user data
    const userStmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    userStmt.run('user@crb.com', 'crb', 'user');  // User 2
    userStmt.run('admin@crb.com', 'Toukaaan@321', 'admin'); // User 1
    userStmt.run('Congratulation ! Heres your flag: CRB_AreYouAdmin', '', 'user');  // User 3
    userStmt.finalize();
  
    // Create posts table
    db.run('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT, description TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)');
  
    // Insert dummy post data
    const postStmt = db.prepare('INSERT INTO posts (image_url, description) VALUES (?, ?)');
    postStmt.run('/images/appachchi.jpg', 'Sri Lanka: “Maybe this time Maina will stay retired.”'); // Post 1
    postStmt.run('/images/hitan.jpg', 'When you leave your alliance, but nobody really noticed.'); // Post 2
    postStmt.run('/images/lapaya.jpg', 'When you keep exposing corruption, but nothing ever changes.'); // Post 3
    postStmt.run('/images/okekudasaay.jpg', 'When you’re always the runner-up, but never the winner.'); // Post 4
    postStmt.run('/images/imfdeyya.jpg', 'When you survive political crises like a pro, but no one gives you credit.'); // Post 5
    postStmt.run('/images/wiruwa.jpg', 'When you win an election, but running a country isn’t as easy as running the military.'); // Post 6
    postStmt.finalize();
  
    // Create comments table
    db.run('CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, post_id INTEGER, comment TEXT, user_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (post_id) REFERENCES posts(id), FOREIGN KEY (user_id) REFERENCES users(id))');
  
    // Insert dummy comment data
    const commentStmt = db.prepare('INSERT INTO comments (post_id, comment, user_id) VALUES (?, ?, ?)');
    commentStmt.run(1, 'When you leave the game, but still somehow control all the players... #MainaStyle', 1); // Comment on Post 1 by User 1
    commentStmt.run(2, 'Remember when Maithri said he’d fix it all? Yeah, neither do we. #NiceTryMaithri #OneTermLegend', 2); // Comment on Post 2 by User 2
    commentStmt.run(3, 'Anura: Fighting the system like it’s a 9-to-5 job, but somehow still stuck in traffic. #RevolutionInProgress #AlmostThere', 1); // Comment on Post 3 by User 1
    commentStmt.run(4, 'Sajith, still trying to save the country, but cant find the cape yet. #SuperSajith #OneDayMaybe', 2); // Comment on Post 4 by User 2
    commentStmt.run(5, 'Ranil political life is longer than my phone battery. He always comes back! #Can’tGetRidOfHim', 1); // Comment on Post 5 by User 1
    commentStmt.run(6, 'Said he be the ‘strongman,’ but left the country faster than a WhatsApp forward. #GotaGoHome', 2); // Comment on Post 6 by User 2
    commentStmt.finalize();
  });


  // Middleware to authenticate admin
function authenticateAdmin(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  // console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Verify the token (example using jwt)
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err || decoded.status !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  });
}


  // Helper function to authenticate user by JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(403);
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };




// Generate a random initialization vector
function generateIV() {
  return crypto.randomBytes(16); // 16 bytes for AES block size
}

// Encrypt function
function encrypt(text, secret) {
  const iv = generateIV();
  const key = crypto.createHash('sha256').update(secret).digest(); // Generate a key from the secret
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    iv: iv.toString('hex'),
    content: encrypted
  };
}

app.get('/api/user-status', authenticateAdmin, (req, res) => {
  const responseData = { login: 'approvedbycrb' };
  // const encryptedResponse = encrypt(responseData, secret); // Uncomment if needed
  
  res.json(responseData); // Just pass the object directly
});




// Login Route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
  
    // UNSAFE: Directly concatenating user input into the SQL query string (SQL Injection Vulnerability)
    const query = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
  
    db.get(query, (err, row) => {
      if (err) {
        res.status(500).json({ message: 'Internal server error' });
      } else if (row) {
        // console.log(row);
        // console.log(query);
      
      
        db.get('SELECT role FROM users WHERE email = ?', [email], (err, row) => {
          if (err) {
            return res.status(500).json({ message: 'Internal server error' });
          }else if (!row) {
            return res.status(404).json({ message: 'User not found' });
          }else{
            const token = jwt.sign({ id: email, status : row.role }, secretKey, { expiresIn: '1h' });
            res.json({ message: 'Login successful', user: row ,utoken: token, status: row.role, secret :secretKey, expiresIn: '1h'});
          }
      
        });



      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });


  //add posts
  app.post('/api/postsadd', authenticateAdmin, (req, res) => {
    const { image_url, description } = req.body;
  
    if (!image_url || !description) {
      return res.status(400).json({ message: 'Image URL and description are required.' });
    }
  
    const query = 'INSERT INTO posts (image_url, description) VALUES (?, ?)';
    db.run(query, [image_url, description], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error adding post' });
      }
      res.json({ id: this.lastID, image_url, description });
    });
  });

  //remove post
  app.delete('/api/postsrem/:id', authenticateAdmin, (req, res) => {
    const { id } = req.params;
  
    const query = 'DELETE FROM posts WHERE id = ?';
    db.run(query, [id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error deleting post' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json({ message: 'Post deleted successfully' });
    });
  });
  

  //user manage
  app.get('/api/users', authenticateAdmin, (req, res) => {
    const query = 'SELECT id, email, role FROM users';
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching users' });
      }
      res.json(rows);
    });
  });

  
  //user status authenticateAdmin
  app.put('/api/users/:id/status', authenticateAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    if (status !== 'admin' && status !== 'user') {
      return res.status(400).json({ message: 'Invalid status' });
    }
  
    const query = 'UPDATE users SET role = ? WHERE id = ?';
    db.run(query, [status, id], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Error updating user status' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User status updated successfully' });
    });
  });
  
  

  // Route to get random posts for the homepage
app.get('/api/posts', authenticateToken, (req, res) => {
    db.all('SELECT * FROM posts ORDER BY RANDOM() LIMIT 10', (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows);
    });
  });
  
  // Route to get specific post by id (with comments)
  app.get('/api/posts/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
  
    db.get('SELECT * FROM posts WHERE id = ?', [id], (err, post) => {
      if (err || !post) return res.status(404).json({ message: 'Post not found' });
  
      db.all('SELECT * FROM comments WHERE post_id = ?', [id], (err, comments) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ post, comments });
      });
    });
  });
  
  // Route to post a comment
  app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
  
    db.run('INSERT INTO comments (post_id, comment, user_id) VALUES (?, ?, ?)', [id, comment, req.user.id], function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Comment added', commentId: this.lastID });
    });
  });
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


app.post('/api/search', (req, res) => {
  let xml = '';

  req.on('data', chunk => {
    xml += chunk.toString();
  });

  req.on('end', () => {
    parser.parseString(xml, (err, result) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid XML' });
      }

      const searchTerm = result.search.term[0];
      
      // Perform search using the searchTerm, e.g., in a database query
      db.all('SELECT * FROM posts WHERE description LIKE ?', [`%${searchTerm}%`], (err, rows) => {
        if (err) {
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.json(rows);
      });
    });
  });
});