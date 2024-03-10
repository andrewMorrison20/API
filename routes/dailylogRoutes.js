//routes relating to the log entries
const express = require('express');
const controller = require('./../controllers/dailyLogControllers');
const router = express.Router();

router.get('/showall/:id', controller.getEntries);
router.get('/newlog', controller.getSnapSchema);
router.post('/new', controller.postNew);
router.post('/addTriggers', controller.insertTriggers);
router.delete('/del/:id', controller.deleteEntry);
router.delete('/delTriggers/:id', controller.deleteTriggers);
router.patch('/update/:id', controller.updateNotes);
router.get('/allTriggers',controller.getAllTriggers);
router.get('/snapTriggers/:id',controller.getEntryTriggers);
router.get('/snap/:id',controller.getSnapshotData);
router.get('/triggerCounts/:id',controller.getTriggerCounts);
router.get('/entryCounts/:id',controller.getTotalEntries);

module.exports = router;