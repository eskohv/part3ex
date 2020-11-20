const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

morgan.token('info', function getBody(req) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :response-time :info'))
app.use(express.json())
app.use(cors())

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]
const getLength = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId
}
app.get('/info', (request, response) => {
    const info = `<p>Phonebook has info for ${getLength()} people</p> </br> ${new Date()}`
    response.send(info)
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    const duplicate = persons.find(person => person.name === body.name  )

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        })
    } else if (duplicate) {
        return response.status(400).json({
            error: 'Person already exists'
        })
    }

    const person = {
        name: body.name,
        number: body.number || '',
        id: Math.floor(Math.random() * Math.floor(1000000000)),
    }

    persons = persons.concat(person)

    response.json(persons)
})

function assignId (req, res, next) {
    req.id = persons.find(person => person.id === req.id)
    next()
}
const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)