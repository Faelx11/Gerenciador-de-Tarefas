const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const firebaseAdmin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { engine } = require('express-handlebars');
const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } = require('firebase/firestore');

// Inicializa o Firebase Admin SDK
const serviceAccount = require('./firebase-admin.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

// Configuração do Firebase SDK (autenticação do cliente)
const firebaseConfig = {
  apiKey: "AIzaSyAtRBW10bTe8PMbMVPW1SRNkX_VvR3MZk0",
  authDomain: "task-manager-99776.firebaseapp.com",
  projectId: "task-manager-99776",
  storageBucket: "task-manager-99776.firebasestorage.app",
  messagingSenderId: "224063002841",
  appId: "1:224063002841:web:ce106a15d12b1c881d86c8"
};

// Inicializa o Firebase App
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Configuração do servidor Express
const app = express();

// Configurações do Handlebars
app.engine('handlebars', engine({
  helpers: {
    increment: (index) => index + 1 // Incrementa o índice
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para verificar autenticação
function isAuthenticated(req, res, next) {
  const sessionCookie = req.cookies.session || '';
  firebaseAdmin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then(() => next())
    .catch(() => res.redirect('/'));
}

// Rotas
app.get('/', (req, res) => res.render('fazerLogin'));

app.get('/criarConta', (req, res) => res.render('criarConta'));

app.post('/fazerLogin', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await signInWithEmailAndPassword(auth, email, senha);

    const idToken = await userCredential.user.getIdToken();
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 dias
    const sessionCookie = await firebaseAdmin.auth().createSessionCookie(idToken, { expiresIn });

    res.cookie('session', sessionCookie, { maxAge: expiresIn, httpOnly: true });
    res.redirect('/consultar');
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(401).render('fazerLogin', { error: 'Usuário ou senha inválidos.' });
  }
});

app.post('/criarConta', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const auth = getAuth(firebaseApp);
    await createUserWithEmailAndPassword(auth, email, senha);
    res.redirect('/');
  } catch (error) {
    console.error('Erro ao criar conta:', error.message);
    res.status(500).render('criarConta', { error: 'Erro ao criar conta. Tente novamente.' });
  }
});

app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/');
});

app.get('/consultar', isAuthenticated, async (req, res) => {
  try {
    const tarefasSnapshot = await getDocs(collection(db, 'tarefas'));
    const tarefasList = tarefasSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    res.render('consultar', { tarefas: tarefasList });
  } catch (error) {
    console.error('Erro ao consultar tarefas:', error.message);
    res.status(500).send('Erro ao carregar tarefas.');
  }
});

app.get('/criarTarefa', isAuthenticated, (req, res) => res.render('criarTarefa'));

app.post('/criarTarefa', async (req, res) => {
  let { nome_da_tarefa, data_de_inicio, data_de_fechamento, descricao } = req.body;

  // Valida os campos antes de salvar
  if (!nome_da_tarefa || !data_de_inicio || !data_de_fechamento || !descricao) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    await addDoc(collection(db, 'tarefas'), {
      nome_da_tarefa,
      data_de_inicio,
      data_de_fechamento,
      descricao,
      createdAt: new Date().toISOString(),
    });
    res.redirect('/consultar');
  } catch (error) {
    console.error('Erro ao criar tarefa:', error.message);
    res.status(500).send('Erro ao criar tarefa. Tente novamente.');
  }
});

// Outras rotas mantidas como no código original
app.get('/alterarTarefa/:id', isAuthenticated, async (req, res) => {
  const tarefasId = req.params.id;
  try {
    const tarefasRef = doc(db, 'tarefas', tarefasId);
    const tarefasDoc = await getDoc(tarefasRef);

    if (!tarefasDoc.exists()) {
      return res.status(404).send('Tarefa não encontrada.');
    }

    res.render('alterarTarefa', { tarefa: tarefasDoc.data(), id: tarefasId });
  } catch (error) {
    console.error('Erro ao carregar a tarefa:', error.message);
    res.status(500).send('Erro ao carregar a tarefa.');
  }
});

app.post('/alterarTarefa/:id', isAuthenticated, async (req, res) => {
  const tarefaId = req.params.id; // ID da tarefa enviado pela URL
  const { nome_da_tarefa, data_de_inicio, data_de_fechamento, descricao } = req.body;

  // Valida os campos antes de salvar
  if (!nome_da_tarefa || !data_de_inicio || !data_de_fechamento || !descricao) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    const tarefaRef = doc(db, 'tarefas', tarefaId); // Referência ao documento
    await updateDoc(tarefaRef, {
      nome_da_tarefa,
      data_de_inicio,
      data_de_fechamento,
      descricao,
    });
    res.redirect('/consultar'); // Redireciona após a edição bem-sucedida
  } catch (error) {
    console.error('Erro ao alterar tarefa:', error.message);
    res.status(500).send('Erro ao alterar tarefa. Tente novamente.');
  }
});

app.post('/removerTarefa/:id', isAuthenticated, async (req, res) => {
  const tarefaId = req.params.id;
  try {
    const tarefaRef = doc(db, 'tarefas', tarefaId);
    await deleteDoc(tarefaRef);
    res.redirect('/consultar');
  } catch (error) {
    console.error('Erro ao remover tarefa:', error.message);
    res.status(500).send('Erro ao remover tarefa. Tente novamente.');
  }
});

// Inicializa o servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});