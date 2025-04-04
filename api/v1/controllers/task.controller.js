const Task = require("../../../models/task.model");

const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    try {
        const find = {
            deleted: false
        }

        if (req.query.status) {
            find.status = req.query.status;
        }

        // Search
        let objectSearch = searchHelper(req.query);

        if (req.query.keyword) {
            find.title = objectSearch.regex
        }
        // End Search

        // Pagination
        let initPagination = {
            currentPage: 1,
            limitItems: 2,
        }
        const countTasks = await Task.countDocuments(find);
        const objectPagination = paginationHelper(
            initPagination,
            req.query,
            countTasks
        )
        // End Pagination

        // Sort
        const sort = {}

        if (req.query.sortKey && req.query.sortValue) {
            sort[req.query.sortKey] = req.query.sortValue;
        }
        // End Sort

        const tasks = await Task.find(find)
                .sort(sort)
                .limit(objectPagination.limitItems)
                .skip(objectPagination.skip)
        ;

        res.json(tasks);
    } catch (error) {
        res.json("Error");
    }
}

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
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

}