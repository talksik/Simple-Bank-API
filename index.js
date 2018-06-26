const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const PORT = 8080;

// to read request's body object/dict
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// DB configuration
const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'bank'
});

//  establish connection
con.connect(function(err) {
  if (err) throw err;
  console.log("DB Connected!");
});

app.get('/', function (req, res) {
  console.log('default route');
});

app.listen(PORT, function () {
  console.log('Server running on port: ' + PORT);
});


function makeResObj(message, result=null, success=false) {
  var responseObj = {
    error: success,
    message: message,
    result: result
  };
  return responseObj;
}

/* **BONUS : use this function to verify that the balance is within the limits. The permissions table would hold
*   the limits for that user. Also second helper is for checking if the deposit or withdraw is valid.
*/
function verifyBalance(balance, userId) {
  con.query("SELECT balance from account where map_id=?", [userId], function (err, result, fields) {
    if (err) throw err;

     var balance = result[0];
    con.query("SELECT * from permissions where map_id=?", [userId], function (err, result, fields) {
      if (err) throw err;
      if (balance < result[0].lower_limit || balance > result[0].upper_limit) {
        return res.status(500).send(makeResObj("Current balance is not valid"));
      }
    });
  });
}

function verifyTransactions(amount, userId, deposit=true) {
  con.query("SELECT * from permissions where map_id=?", [userId], function (err, result, fields) {
    if (err) throw err;
    if (deposit) {
      if (amount > result[0].deposit_limit) {
        return res.status(600).send(makeResObj("Depositing too much!"));
      }
    } else {
      if (amount > result[0].withdraw_limit) {
        return res.status(500).send(makeResObj("Withdrawing too much!"));
      }
    }
  });
}



// Adding a user
app.post('/users', function (req, res) {
    let name = req.body.name;

    // check if user in DB
    con.query("SELECT * FROM users WHERE name=?;",[name], function (err, result, fields) {
      if (err) throw err;
      if (result.length > 0) {
        var responseObj = makeResObj('Name already exists, ask customer if they have already made an account');
        return res.status(400).send(responseObj);
      }
    });

    let address = req.body.address;
    let city = req.body.city;
    let state = req.body.state;
    let email = req.body.email;
    let initBalance = req.body.initBalance;

    // check if given data not enough/invalid
    if (!address || !city || !state || !email) {
        return res.status(400).send(makeResObj('Invalid or null input'));
    }

    // insert into users and info as sort of a transaction
    con.query("INSERT INTO users (name) VALUES (?)", [name], function (error, results, fields) {
        if (error) throw error;

        const map_id = results.insertId;
        con.query("INSERT INTO info (map_id, address, city, state, email) VALUES (?,?,?,?,?)", [map_id, address, city, state, email], function (error, results, fields) {
            if (error) throw error;
        });

        con.query("INSERT INTO accounts (map_id, balance) VALUES (?,?)", [map_id, initBalance], function (error, results, fields) {
            if (error) throw error;
        });

        return res.status(500).send(makeResObj("Created User", true));
    });
});


// Retrieve info for particular account for a user
// If the endpoint gives user id, then can search through all accounts for a user (design choice of API)
app.get('/user/:id', function (req, res) {
    let user_id = req.params.id;

    if (!account_id) {
        return res.status(400).send(makeResObj('No given account id'));
    }

    con.query('SELECT * FROM accounts where map_id=?', [user_id], function (error, results, fields) {
        if (error) throw error;
        return res.status(200).send(makeResObj('Account info returned.', results, true));
    });
});


// Deposit or withdraw money dynamically
app.put('/user/action/:id', function (req, res) {
    let user_id = req.params.id;
    let deposit = req.body.isDeposit;
    let amount = req.body.amount;

    if (!amount) {
        return res.status(400).send(makeResObj('No amount specified'));
    }

    con.query('SELECT balance FROM accounts where map_id=?', [user_id], function (error, results, fields) {
        if (error) throw error;
        var balance = results[0];

        // example for bonus, call verifyTransactions hereeee!!

        var query = "UPDATE accounts SET balance=? WHERE map_id=?";
        var items = [];
        if (deposit) {
          items = [balance + amount, user_id];
        } else {
          items = [balance - amount, user_id];
        }
        con.query(query, items, function (error, results, fields) {
            if (error) throw error;

            // perhaps call verifyBalance hereee!!

            return res.status(200).send('Account balance has been updated successfully.', results, true);
        });
    });
});
