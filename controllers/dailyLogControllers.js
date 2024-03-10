const conn = require('./../utils/dbconn');
const moment = require('moment');


//Return snapshot data of all entries for user
exports.getEntries = async (req, res) => {
    try {
        const userid = req.params.id;
        console.log(userid);
        const [snapshotRows] = await conn.query(`SELECT * FROM snapshot WHERE snapshot.user_id = ? ORDER BY time_stamp DESC`, userid);
        if (snapshotRows.length === 0) {
            // Return JSON object indicating no daily snapshot found
            return res.status(404).json({ error: 'Create a daily snapshot first!' });
        }
        // Return JSON object with all required data
        res.status(200).json({
            status: 'success',
            message: `${snapshotRows.length} records retrieved`,
            snapshots: snapshotRows
        });
    } catch (error) {
        console.error('An error occurred while retrieving logs:', error);
        // Return JSON object indicating error occurred
        res.status(500).json({ error: 'An error occurred while retrieving logs' });
    }
};

//get the schema of the snapshot table to extract emotions etc
exports.getSnapSchema = async (req, res) => {
    try {
        // Query to select column names from the snapshot table
        const selectSchemaSQL = `SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS
                                    WHERE table_schema = 'moodify' AND table_name = 'snapshot'`;

        const [schemaRows, schemaFields] = await conn.query(selectSchemaSQL);
        res.status(200).json({
            message: 'Successfully retrieved snapshot schema',
            schemaRows: schemaRows,
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while retrieving schema:', error);
        res.status(500).json({ error: 'An error occurred while retrieving shcema' });
    }
};



// Snapshot Controller - Retrieves single snapshot data
exports.getSnapshotData = async (req, res) => {
    try {
        const snapshotid = req.params.id;
        // Check if the snapshot with the provided ID exists
        const checkUserId = `SELECT * FROM snapshot WHERE snapshot_id = ?`;
        const [snapRows, userFields] = await conn.query(checkUserId, snapshotid);
        // If snapshot with the provided ID does not exist, return an error
        if (snapRows.length === 0) {
            return res.status(404).json({ error: 'Snapshot not found' });
        }
        // Return JSON response with snapshot data
        res.status(200).json({
            message: 'Successfully retrieved snapshot data',
            snapshotData: snapRows
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while retrieving snapshot data:', error);
        res.status(500).json({ error: 'An error occurred while retrieving snapshot data' });
    }
};


//updates triggers and or notes
exports.updateNotes = async (req, res) => {
    try {
        const snapshot_id = req.params.id;
        const { notes } = req.body;
        const updateNotesSQL = `UPDATE snapshot SET notes = ? WHERE snapshot_id = ?`;
        const rows = await conn.query(updateNotesSQL, [notes, snapshot_id]);
        if (rows[0].affectedRows > 0) {
            res.status(200);
            return res.json({
                status: 'success',
                message: `Record ID ${snapshot_id} updated`
            });
        } else {
            res.status(404);
            return res.json({
                status: 'failure',
                message: `Invalid ID ${snapshot_id}`
            });
        }
    } catch (error) {
        console.error('An error occurred while updating log:', error);
        // Send error response
        return res.status(500).json({ success: false, message: 'An error occurred while updating log triggers.' });
    }
};

//insert contextual triggers for snapshot
exports.insertTriggers = async (req, res) => {
    try {
        const { triggers, snapshot_id } = req.body;
        console.log(triggers);
        console.log(req.body);
        const insertValues = [...triggers].map(triggerId => [null, snapshot_id, triggerId]);
        const insertNewTriggersSQL = `INSERT INTO snapshot_context_trigger (snapshot_context_trigger_id, snapshot_id, trigger_id) VALUES ?`;
        await conn.query(insertNewTriggersSQL, [insertValues]);
        return res.status(200).json({
            success: true,
            message: 'Triggers successfully inserted'
        });
    } catch (error) {
        console.error('An error occurred while inserting triggers :', error);
        // Send error response
        return res.status(500).json({ success: false, message: 'An error occurred while inserting log triggers.' });
    }
}

//delete triggers for given snapshot
exports.deleteTriggers = async (req, res) => {
    try {
        // Extract snapshot ID from request parameters
        const snapshot_id = req.params.id;
        console.log(snapshot_id);

        // Delete associated triggers
        const deleteTriggersSQL = `DELETE FROM snapshot_context_trigger WHERE snapshot_id = ?`;
        const rows = await conn.query(deleteTriggersSQL, snapshot_id);

        // Return success JSON response
        if (rows[0].affectedRows > 0) {
            res.status(200);
            return res.json({
                status: 'success',
                message: `Record ID ${snapshot_id} triggers deleted`
            });
        } else {
            res.status(404);
            return res.json({
                status: 'failure',
                message: `No triggers for ${snapshot_id}`
            });
        }
    } catch (error) {
        // Log the error
        console.error('Error deleting entry:', error);

        // Return error JSON response
        return res.status(500).json({ error: 'An error occurred while deleting the entry' });
    }
}

//Deletes single snapshot
exports.deleteEntry = async (req, res) => {
    try {
        // Extract snapshot ID from request parameters
        const snapshot_id = req.params.id;
        console.log(snapshot_id);
        const deleteSnapshotSQL = `DELETE FROM snapshot WHERE snapshot_id = ?`;
        const rows = await conn.query(deleteSnapshotSQL, [snapshot_id]);

        // Return success JSON response
        if (rows[0].affectedRows > 0) {
            res.status(200);
            return res.json({
                status: 'success',
                message: `Record ID ${snapshot_id} deleted`
            });
        } else {
            res.status(404);
            return res.json({
                status: 'failure',
                message: `Invalid ID ${snapshot_id}`
            });
        }
    } catch (error) {
        // Log the error
        console.error('Error deleting entry:', error);

        // Return error JSON response
        return res.status(500).json({ error: 'An error occurred while deleting the entry' });
    }
};


// Triggers Controller - returns all possible trigger selections
exports.getAllTriggers = async (req, res) => {
    try {
        // Query to select all triggers
        const selectAllTriggersSQL = 'SELECT * FROM context_trigger';
        const [rows, fields] = await conn.query(selectAllTriggersSQL);
        //check if any triggers returned
        if(rows.length ===0){
            res.status(404).json({
                status: 'failure',
                message: 'failed to retrieve triggers'

            })
        }
        // Return JSON response with all triggers
        res.status(200).json({
            message: 'Successfully retrieved all triggers',
            triggers: rows
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while retrieving triggers:', error);
        res.status(500).json({ error: 'An error occurred while retrieving triggers' });
    }
};

//returns the key stats of snapshots for a user
exports.getTotalEntries = async (req, res) => {
    try {
        const userid = req.params.id;

        // Query to select snapshot data based on snapshot ID
        const selectSnapSQL = `SELECT COUNT(snapshot_id), MIN(time_stamp) as first_entry ,MAX(time_stamp) As last_entry FROM snapshot WHERE user_id = ?`;
        const [response] = await conn.query(selectSnapSQL, [userid]);
        // Return JSON response with snapshot data and associated triggers
        res.status(200).json({
            message: 'Successfully retrieved totals data',
            totalEntries: response
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while retrieving the log:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the log data' });
    }
};

//Inserts new snapshot shot 
exports.postNew = async (req, res) => {
    try {
        const { user_id, notes, triggers, emotions } = req.body;
        // Ensure that required fields are present in the request body
        if (!user_id || !emotions) {
            return res.status(400).json({ error: 'Missing required fields in the request body' });
        }
        // Get current timestamp in MySQL format- done here to prevent erronous activity and unneccesary errors
        const mysqlTimestamp = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        // Extract emotion keys and values
        const emotionKeys = Object.keys(emotions);
        const emotionValues = Object.values(emotions);

        // Prepare SQL query placeholders and values
        const placeholders = Array(emotionKeys.length).fill('?').join(',');
        const insertSQL = `INSERT INTO snapshot (snapshot_id, user_id, ${emotionKeys.join(',')}, time_stamp, notes) VALUES (NULL, ?, ${placeholders}, ?, ?)`;
        const insertValues = [...emotionValues, mysqlTimestamp, notes];

        // Insert new snapshot
        const [insertRows, fields] = await conn.query(insertSQL, [user_id, ...insertValues]);
        const snapshotId = insertRows.insertId;
        // Return success JSON response
        res.status(201);
        res.json({
            status: 'success',
            snapshotid: snapshotId,
            message: triggers && triggers.length > 0 ? `Record ID ${snapshotId} added with triggers` : `Successfully added record ID ${snapshotId}`
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while adding new log:', error);
        res.status(500).json({ error: 'An error occurred while adding new log' });
    }
};

// Trigger Controller - Retrieves associated triggers of single snapshot
exports.getEntryTriggers = async (req, res) => {
    try {
        const snapshotid = req.params.id;

        // Query to select context triggers associated with the snapshot
        const selectSQL = `SELECT context_trigger.trigger_id, trigger_name 
                           FROM snapshot_context_trigger 
                           LEFT JOIN context_trigger 
                           ON snapshot_context_trigger.trigger_id = context_trigger.trigger_id 
                           WHERE snapshot_id = ?`;
        const [rows1, fields1] = await conn.query(selectSQL, [snapshotid]);

        // Return JSON response with triggers
        res.status(200).json({
            message: 'Successfully retrieved associated triggers',
            triggers: rows1
        });
    } catch (error) {
        // If an error occurs, log it and return an error JSON response
        console.error('An error occurred while retrieving associated triggers:', error);
        res.status(500).json({ error: 'An error occurred while retrieving associated triggers' });
    }
};

//get counts of all triggers for user
exports.getTriggerCounts = async (req, res) => {
    try {
        const userid = req.params.id;
        const [countRows] = await conn.query(`
            SELECT COUNT(*), trigger_name FROM snapshot 
            INNER JOIN snapshot_context_trigger ON snapshot.snapshot_id = snapshot_context_trigger.snapshot_id 
            INNER JOIN context_trigger ON snapshot_context_trigger.trigger_id = context_trigger.trigger_id 
            WHERE user_id = ?
            GROUP BY context_trigger.trigger_id;`, userid);

        if (countRows.length === 0) {
            // Return JSON object indicating no triggers found for the user
            return res.status(404).json({ error: 'No triggers found for the user' });
        }

        // Return JSON object with trigger counts
        res.status(200).json({
            status: 'success',
            message: `${countRows.length} trigger counts retrieved`,
            triggerCounts: countRows
        });
    } catch (error) {
        console.error('An error occurred while retrieving trigger counts:', error);
        // Return JSON object indicating error occurred
        res.status(500).json({ error: 'An error occurred while retrieving trigger counts' });
    }
};
