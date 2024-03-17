const express = require('express');
const mysql = require('mysql');
var path = require('path');
const router = express.Router();
var app=express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const pool = mysql.createPool({
  host:"localhost",
  database:'svecwbudget',
  user:'root',
  password:'root'
});


router.get('/budgetform', function(req, res) {
  

let d={'email':req.session.email,'department':req.session.department};

  res.render('index',d);
});


const bcrypt = require('bcrypt');
const saltRounds = 10; 

router.post('/signup', (req, res) => {
  const formData = req.body;

  
  bcrypt.hash(formData.password, saltRounds, (hashError, hash) => {
   


    formData.password = hash;

    pool.getConnection((err, connection) => {
     
      const email = formData.email;
      const checkQuery = 'SELECT COUNT(*) AS count FROM userdetails WHERE email = ?';

      connection.query(checkQuery, [email], (checkError, checkResults) => {
        
        const emailCount = checkResults[0].count;
  
        if (emailCount > 0) {
         
         
          connection.release(); 
          res.render('login',{message:'email id already exists'});
          return;
        }

    
        const insertQuery = 'INSERT INTO userdetails SET ?';
        connection.query(insertQuery, formData, (insertError, insertResults) => {
          connection.release();
         
           
          
         console.log(formData);

          res.render('login', { message: 'Sign up successful' });
        });
      });
    });
  });
});



router.get('/budgetinfo', (req, res) => {
  var department = req.session.department;
  var email = req.session.email;
  pool.getConnection((err, connection) => {
  

 
    connection.query('SELECT * FROM budgettable WHERE department = ?', [department], (error, results) => {
      connection.release(); 

      if (error) {
        console.error('Error executing query:', error);
        return res.status(500).send('Error retrieving budget information');
      }

      // Check if results array is empty or undefined
      if (!results || results.length === 0) {
        console.error('No budget information found');
        return res.status(404).send('No budget information found');
      }

      // If there are results, pass them to the template
      var d = { 'email': email, 'result': results[0] };
      console.log(d);
      res.render('displayBudget', d);
    });
  });
});


router.get('/budgettotal', (req, res) => {
  var email = req.session.email;
  pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error getting database connection:', err);
      return res.status(500).send('Error retrieving budget totals');
    }

    // Get the list of columns in the budgettable
    connection.query('SHOW COLUMNS FROM budgettable', (error, results) => {
      if (error) {
        console.error('Error getting column list:', error);
        connection.release();
        return res.status(500).send('Error retrieving budget totals');
      }

      // Extract the column names from the results
      const columns = results.map(row => row.Field);

      // Construct the SQL query to calculate the sum of each column
      const sumQueries = columns.map(column => `SUM(${column}) AS ${column}`);

      // Join the sum queries into a single SQL statement
      const query = `SELECT ${sumQueries.join(', ')} FROM budgettable`;

      // Execute the constructed query
      connection.query(query, (err, results) => {
        connection.release();
        if (err) {
          console.error('Error executing query:', err);
          return res.status(500).send('Error retrieving budget totals');
        }
console.log(results);
        // Extract the sum values from the results
        const result = results[0];
      
        // Render the template with the sum values
        res.render('total',{ result,email});
      });
    });
  });
});



// Example route to execute MySQL query
router.post('/login', (req, res) => {
  // Get user input from request
  const inputEmail = req.body.email;
  const inputPassword = req.body.password;

  // Check if inputEmail and inputPassword are provided
 
  pool.getConnection((err, connection) => {
   
    // Use the connection to execute a query
    connection.query(
      'SELECT * FROM userdetails WHERE email = ?',
      [inputEmail],
      (error, results) => {
        connection.release(); // Release the connection back to the pool

       

        // Check if a user with the provided email exists
        if (results.length === 0) {
          res.render('login', { message: 'User not found' });
          return;
        }

        const user = results[0];

        // Compare the hashed password stored in the database with the provided password
        bcrypt.compare(inputPassword, user.password, (compareError, match) => {
       
          if (match) {
            // Passwords match, set session variables and render dashboard
            req.session.email = user.email;
            req.session.department = user.department;
            const userData = { email: user.email, department: user.department };
            res.render('dashboard', userData);
          } else {
            // Passwords don't match, render login page with error message
            res.render('login', { message: 'Incorrect email or password' });
          }
        });
      }
    );
  });
});



router.post('/submit', (req, res) => {
 
  const formData = req.body; // Form data is available in req.body
  console.log(formData); // Print the form data to the console
  pool.getConnection((err, connection) => {
   
  
    const query = 'INSERT INTO budgettable SET ?';
    // Use the connection to execute a query
    connection.query( query,formData, (error, results) => {
      connection.release(); // Release the connection back to the pool

     
     

      let d={'email':req.session.email,'department':req.session.department,'message':'Form submitted successfully'};
      res.render('index',d);
      
    });
  });

  
});


module.exports = router;
