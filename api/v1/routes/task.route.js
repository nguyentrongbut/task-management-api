const express = require('express');
const router = express.Router();

const Task = require("../../../models/task.model");

// [GET] /api/v1/tasks
router.get('/', async (req, res) => {
    try {
        const find = {
            deleted: false
        }

        if (req.query.status) {
            find.status = req.query.status;
        }

        // Sort
        const sort = {}

        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }
        // End Sort

        const tasks = await Task.find(find).sort(sort);

        res.json(tasks);
    } catch (error) {
        res.json("Error");
    }
});


// [GET] /api/v1/tasks/detail/:id
router.get('/detail/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const tasks = await Task.findOne({
            _id: id,
            deleted: false
        });

        res.json(tasks);
    } catch (error) {
        res.json("Task not found");
    }

})

module.exports = router;