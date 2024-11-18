const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const admin = require('firebase-admin');
const path = require('path');

admin.initializeApp({
  credential: admin.credential.cert(require('./firebase-admin.json')),
});
const db = admin.firestore();
const app = express();
const port = 3000;

// Configuração do Handlebars
const hbs = exphbs.create({
    extname: '.handlebars',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Configuração do body-parser para processar dados dos formulários
app.use(bodyParser.urlencoded({ extended: false }));

// Rota para exibir todas as tarefas
app.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.render('home', { tasks });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    res.status(500).send("Erro ao buscar tarefas");
  }
});

// Rota para adicionar uma tarefa
app.post('/tasks', async (req, res) => {
  const newTask = req.body.task;
  try {
    const taskRef = db.collection('tasks').doc();
    await taskRef.set({
      task: newTask,
      completed: false,
    });
    res.redirect('/');
  } catch (error) {
    console.error("Erro ao adicionar tarefa:", error);
    res.status(500).send("Erro ao adicionar tarefa");
  }
});

// Rota para deletar uma tarefa
app.post('/tasks/delete', async (req, res) => {
  const taskId = req.body.id;
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    await taskRef.delete();
    res.redirect('/');
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error);
    res.status(500).send("Erro ao deletar tarefa");
  }
});

// Rota para completar ou atualizar uma tarefa
app.post('/tasks/complete', async (req, res) => {
  const taskId = req.body.id;
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (taskDoc.exists) {
      await taskRef.update({
        completed: !taskDoc.data().completed,
      });
    }
    res.redirect('/');
  } catch (error) {
    console.error("Erro ao completar tarefa:", error);
    res.status(500).send("Erro ao completar tarefa");
  }
});

// Rota para editar o conteúdo de uma tarefa
app.post('/tasks/edit', async (req, res) => {
    const taskId = req.body.id;
    const newTask = req.body.task;
    try {
      const taskRef = db.collection('tasks').doc(taskId);
      await taskRef.update({
        task: newTask,
      });
      res.redirect('/');
    } catch (error) {
      console.error("Erro ao editar tarefa:", error);
      res.status(500).send("Erro ao editar tarefa");
    }
  });  

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});