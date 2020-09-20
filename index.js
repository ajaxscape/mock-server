require('dotenv').config()

const merge = require('deepmerge')
const express = require('express')
const { v4: uuid } = require('uuid')
const bodyParser = require('body-parser')

const port = process.env.PORT

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const store = {}

function getItem (model, id) {
  const collection = store[model] || []
  return collection.find((item) => item.id === id)
}

function setItem (model, data) {
  if (!store[model]) {
    store[model] = []
  }
  if (!data.id) {
    data.id = uuid()
    store[model].push(data)
  } else {
    const index = store[model].map(({ id }) => id).indexOf(data.id)
    if (index === -1) {
      throw new Error('Missing entry')
    }
    store[model][index] = data
  }
  return data
}

function deleteItem (model, id) {
  if (!store[model]) {
    throw new Error('Missing entry')
  }
  const index = store[model].map(({ id }) => id).indexOf(id)
  if (index === -1) {
    throw new Error('Missing entry')
  }
  return store[model].splice(index, 1).pop()
}

app.get('/:model', (req, res) => {
  const { model } = req.params
  if (store[model]) {
    // get items filtered by query
    // eslint-disable-next-line eqeqeq
    res.send(store[model].filter((item) => Object.entries(req.query).every(([field, val]) => item[field] == val)))
  }
  res.status(404).send()
})

app.get('/:model/:id', (req, res) => {
  const { model, id } = req.params
  const data = getItem(model, id)
  if (data === undefined) {
    res.status(404).send()
  }
  res.status(200).send(data)
})

app.post('/:model', (req, res) => {
  const { model } = req.params
  // create item
  const data = setItem(model, req.body)
  res.status(201).send(data)
})

app.put('/:model/:id', (req, res) => {
  const { model, id } = req.params
  // replace item
  const data = setItem(model, { ...req.body, id })
  res.status(200).send(data)
})

app.patch('/:model/:id', (req, res) => {
  const { model, id } = req.params
  // update item
  const data = setItem(model, merge(getItem(model, id), req.body))
  res.status(200).send(data)
})

app.delete('/:model/:id', (req, res) => {
  const { model, id } = req.params
  // delete item
  const data = deleteItem(model, id)
  res.status(200).send(data)
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
