const express = require('express')
const app = express()
require('dotenv').config()
const Person = require('./models/people')
const cors = require('cors')
const morgan = require('morgan')



morgan.token('info', function getBody(req) {
    return JSON.stringify(req.body)
})

app.use(cors())
app.use(morgan(':method :url :response-time :info',))
app.use(express.json())
app.use(express.static('build'))

app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(docCount => {
        response.send(`<p>Phonebook has info for ${docCount} people</p> </br> ${new Date()}`)
    })
        .catch((error) => next(error))
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(people =>{
        response.json(people)
    })
})

app.get('/api/persons/:id', (request, response) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end()
        }
    }).catch(error => {
        console.log(error)
        response.status(400).send({error:"malformatted id"})
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch((error) => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    if(!body.name || !body.number) {
        return response.status(400).send({error: "Invalid arguments"})
    }
    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch((error) => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
    const newPerson = {
        name: body.name,
        number: body.number
    }
    const opts = {
        runValidators: true,
        new: true
    }

    Person.findByIdAndUpdate(request.params.id, newPerson, opts)
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
        .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'mal-formatted id' })
    } else if (error.name === "ValidationError") {
        return response.status(400).send({error:'Faulty input arguments',message:error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)