const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs');


const app = express()

app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

// Use middleware to set the default Content-Type
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
});

// Use middleware to set delay option
app.use(function (req, res, next) {
    if (!req.query.delay) {
        return next()
    }

    const delaySec = Number(req.query.delay)
    if (delaySec < 0 || delaySec > 5) {
        res.status(400).json({
            "error": "delay should be >= 0 && <= 5"
        })
        return
    }

    setTimeout(next, delaySec * 1000)
});

const http = require('http').Server(app)

let data = {
    lastId: 2,
    users: [
        {
            id: 1,
            firstName: "firstName1",
            lastName: "lastName1",
            address: "address 1"
        },
        {
            id: 2,
            firstName: "firstName2",
            lastName: "lastName2",
            address: "address 2"
        }
    ]
}
loadData()

const okResponse = {
    "success": true
}
const errorResponse = {
    "success": false
}

function getRequestUser(req) {
    const errors = []
    if (!req.body.firstName || req.body.firstName.trim() == "") {
        errors.push('firstName is empty or missing')
    }
    if (!req.body.lastName || req.body.lastName.trim() == "") {
        errors.push('lastName is empty or missing')
    }
    if (!req.body.address || req.body.address.trim() == "") {
        errors.push('address is empty or missing')
    }
    if (errors.length > 0) {
        return {
            ...errorResponse,
            errors
        }
    }

    const user =
    {
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        address: req.body.address.trim()
    }

    return user
}

function saveData() {
    var jsonContent = JSON.stringify(data);

    fs.writeFile("data.json", jsonContent, 'utf-8', (err) => {
        if (err) console.log('error saving data.json')
    });
}

function loadData() {
    console.log("Loading data.json")
    fs.readFile('data.json', 'utf-8', (err, text) => {
        if (err) {
            console.log("can't load data.json")
            return
        }
        try {
            data = JSON.parse(text)
            console.log("loaded users: " + data.users.length);
        } catch (e) {
            console.log("can't parse data.json:")
            console.log(e)
        }
    });
}

app.get('/', (req, res) => {
    return res.json(
        { message: "Hello! Try GET /users" }
    )
});

app.get('/users', (req, res) => {
    let users = [...data.users]

    if (req.query.query) {
        const query = req.query.query.trim().toLowerCase()
        if (query !== "") {
            users = users.filter(u => u.firstName.indexOf(query) !== -1)
        }
    }

    if (req.query.orderBy === 'name_asc') {
        users.sort((a, b) => {
            return a.firstName.localeCompare(b.firstName)
        })
    } else if (req.query.orderBy === 'name_desc') {
        users.sort((a, b) => {
            return b.firstName.localeCompare(a.firstName)
        })
    } else if (req.query.orderBy) {
        return res.status(400).json({
            ...errorResponse,
            comment: `Invalid sort order "${req.query.orderBy}". Try name_asc or name_desc.`,
        })
    }

    return res.json({
        users
    });
});

app.get('/users/:userId', (req, res) => {
    const reqId = Number(req.params.userId)
    const user = data.users.find(u => u.id === reqId)

    if (!user) {
        return res.sendStatus(404)
    }

    return res.json(
        user
    )
});

app.put('/users/:userId', (req, res) => {
    const reqId = Number(req.params.userId)
    const user = data.users.find(u => u.id === reqId)

    if (!user) {
        return res.sendStatus(404)
    }

    const userOrError = getRequestUser(req)
    if (userOrError.success === false) {
        return res.status(400).json(userOrError)
    }

    const newUser = userOrError

    data.users = data.users.map(u => {
        if (u.id === newUser.id) {
            return newUser
        }
        return u
    })
    saveData()

    return res.json(user);
});

app.delete('/users/:userId', (req, res) => {
    const reqId = Number(req.params.userId)
    const prevLength = data.users.length
    data.users = data.users.filter(u => u.id !== reqId)
    const newLength = data.users.length

    if (prevLength == newLength) {
        return res.sendStatus(404)
    }

    saveData()

    return res.json({
        ...okResponse,
        "comment": "User with id=" + reqId + " has been deleted",
    })
});


app.post('/users', (req, res) => {
    if (data.users.length > 1000) {
        return res.status(400).json({
            ...errorResponse,
            "comment": "Too many users",
        })
    }

    const userOrError = getRequestUser(req)
    if (userOrError.success === false) {
        return res.status(400).json(userOrError)
    }

    const user = userOrError
    user.id = ++data.lastId

    data.users.push(user)
    saveData()

    return res.json({
        ...okResponse,
        "comment": "User has been created",
        user
    })
});

app.delete('/users', (req, res) => {
    data.users = []
    saveData()

    const response = {
        ...okResponse,
        comment: "All users have been deleted"
    }
    return res.json(response);
});


app.get('*', (req, res) => {
    return res.sendStatus(404)
})

const port = process.env.PORT || 3003
http.listen(port,
    () => console.log(`Server has started: http://localhost:${port}`))
