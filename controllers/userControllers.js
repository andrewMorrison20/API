const conn = require('./../utils/dbconn');
const moment = require('moment');
const bcrypt = require('bcrypt');


exports.getUserDetails = async (req, res) => {
    const { username } = req.params;
    console.log(username);
    try {
        // Query the database for the user's hashed password based on the provided username
        const getUserSQL = `SELECT * FROM user WHERE user_name = ?`;
        const [userdetails, meta] = await conn.query(getUserSQL, username);
        console.log(`query results are : ${userdetails}`);
        const data = userdetails[0];
        console.log(data);
        
        // If no user found with the provided username
        if (userdetails.length === 0) {
            return res.status(401).json({ error: 'Incorrect username' });
        }

        // Extract user details from the first row of the userdetails array
        const { user_id, first_name,last_name, password, email,signup_date } = userdetails[0];
        console.log(password);

        // Return success JSON response with extracted user details
        return res.json({
            status: 'success',
            message: 'user exists',
            result: {
                user_id,
                first_name,
                last_name,
                password,
                email,
                signup_date
            }
        });
    } catch (error) {
        // Return error JSON response if an error occurs during login
        return res.status(500).json({ error: 'An error occurred retrieving user details.' });
    }
};

exports.register = async (req, res) => {
    const { username, email, password, firstname, lastname } = req.body;
    
    try {
        // Check if the user already exists
        const checkUserSQL = `SELECT user_name, first_name FROM user WHERE email = ?`;
        const [rows, fields] = await conn.query(checkUserSQL, email);

        if (rows && rows.length > 0) {
            return res.status(400).json({ error: "User already registered!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get the current date/time
        const signupDate = moment().format('YYYY-MM-DD HH:mm:ss');

        // Insert the new user with hashed password and signup date
        const insertUserSQL = 'INSERT INTO `user` (`user_id`, `user_name`, `email`, `password`, `first_name`, `last_name`, `signup_date`) VALUES  (NULL, ?, ?, ?, ?, ?, ?)';
        const vals = [username, email, hashedPassword, firstname, lastname, signupDate];
        await conn.query(insertUserSQL, vals);

        return res.json({
            status: 'success',
            message: 'User successfully registered' });
            
    } catch (error) {
        console.error('An error occurred while registering the user:', error);
        return res.status(500).json({ error: 'An error occurred while registering the user.' });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        // Extract user ID from request parameters
        const user_id = req.params.id;
        const deleteTriggersSQL = `DELETE user,snapshot, snapshot_context_trigger
        FROM user LEFT JOIN snapshot on user.user_id = snapshot.user_id
        LEFT JOIN snapshot_context_trigger ON snapshot.snapshot_id = snapshot_context_trigger.snapshot_id
        WHERE user.user_id = ?`

       const rows = await conn.query(deleteTriggersSQL, [user_id]);
       console.log(rows[0].affectedRows);
        // Return success JSON response
        if (rows[0].affectedRows > 0) {
            res.status(200);
            res.json({
                status: 'success',
                message: `User ID ${user_id} deleted`
            });
        } else {
            res.status(404);
            res.json({
                status: 'failure',
                message: `Invalid ID ${user_id}`
            });
        }
    } catch (error) {
        // Log the error
        console.error('Error deleting Account:', error);

        // Return error JSON response
        return res.status(500).json({ error: 'An error occurred while deleting the Account' });
    }
};