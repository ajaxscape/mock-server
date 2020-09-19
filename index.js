require('dotenv').config()

const express = require('express')
const {v4: uuid} = require('uuid')
const app = express()
const port = process.env.PORT

const store = {}

app.get('/:model/:id', (req, res) => {
  const { model, id } = req.params
  const data = (store[model] || {})[id]
  if (data  === undefined) {
    res.status(404).json()
  }
  res.json(data)
})

app.post('/:model', (req, res) => {
  const { model } = req.params
  if (!store[model]) {
    store[model] = []
  }
  const id = uuid()
  store[model].push({...req.body, id})
  res.status(201).json(store[model].find((item) => item.id === id))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})