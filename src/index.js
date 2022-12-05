const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username)

  if (!user) {
      return response.status(400).json({ error: 'user not found'})
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usersAlreadyExists = users.some((user) => user.username === username)

  if (usersAlreadyExists) {
      return response.status(400).json({ error: 'user already exists!'})
  }
  users.push({
    uuid: uuidv4(),
    name,
    username,
    todos: []
  })

  return response.status(201).send('')
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  user.todos.push({
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  })
  
  return response.status(201).send('')
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const index = user.todos.findIndex((item) => item.id === id)

  if (index === -1) {
    return response.status(400).json({ error: 'task not found'})
  }
  user.todos[index].title = title
  user.todos[index].deadline = new Date(deadline)

  return response.status(201).send('')
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const index = user.todos.findIndex((item) => item.id === id)

  if (index === -1) {
    return response.status(400).json({ error: 'task not found'})
  }
  user.todos[index].done = true

  return response.status(201).send('')
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todos = user.todos.filter((item) => item.id !== id)

  user.todos = todos

  return response.status(201).send(todos)
});

module.exports = app;