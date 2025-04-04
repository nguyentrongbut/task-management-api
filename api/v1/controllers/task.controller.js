const Task = require("../models/task.model");

const paginationHelper = require("../../../helpers/pagination");
const searchHelper = require("../../../helpers/search");

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
    const find = {
        $or: [
            {createdBy: req.user.id},
            {listUser: req.user.id}
        ],
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
        limitItems: 3,
    }

    // Sort
    const sort = {}

    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    }
    // End Sort
    try {
        // Pagination
        const countTasks = await Task.countDocuments(find);
        const objectPagination = paginationHelper(
            initPagination,
            req.query,
            countTasks
        )
        // End Pagination

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

// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    const id = req.params.id;
    const status = req.body.status;

    try {
        await Task.updateOne({
            _id: id,
        }, {
            status: status
        })
        res.json({
            code: 200,
            message: "Change status success",
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Change status failed",
        });
    }

}


// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
    const {ids, key, value} = req.body;

    try {
        switch (key) {
            case "status":
                await Task.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    status: value
                })
                res.json({
                    code: 200,
                    message: "Change status success",
                });
                break;
            case "delete":
                await Task.updateMany({
                    _id: {
                        $in: ids
                    }
                }, {
                    deleted: true,
                    deletedAt: new Date()
                })
                res.json({
                    code: 200,
                    message: "Delete task success",
                })
                break;
            default:
                res.json({
                    code: 400,
                    message: "Don't support this key",
                });
                break;
        }


    } catch (error) {
        res.json({
            code: 400,
            message: "Change status failed",
        });
    }

}

// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
    try {
        req.body.createdBy = req.user.id;
        const task = new Task(req.body);
        await task.save();

        res.json({
            code: 200,
            message: "Create task success"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Create task failed",
        });
    }
}

// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
    const id = req.params.id;

    try {
        await Task.updateOne({
            _id: id
        }, req.body);

        res.json({
            code: 200,
            message: "Edit task success"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Edit task failed",
        });
    }
}

// [DELETE] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        await Task.updateOne({
            _id: id
        }, {
            deleted: true,
            deletedAt: new Date()
        })

        res.json({
            code: 200,
            message: "Delete task success"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Delete task failed",
        });
    }
}