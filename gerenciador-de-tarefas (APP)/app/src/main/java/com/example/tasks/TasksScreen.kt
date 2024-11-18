package com.example.tasks

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TasksScreen(navController: NavController, tasksViewModel: TasksViewModel) {
    var taskText by remember { mutableStateOf("") }
    var tasks by remember { mutableStateOf<List<Triple<String, String, Boolean>>>(emptyList()) }
    var taskBeingEdited by remember { mutableStateOf<Pair<String, String>?>(null) }

    LaunchedEffect(Unit) {
        tasksViewModel.getTasks { result ->
            result?.let {
                tasks = it.documents.map { document ->
                    Triple(
                        document.id,
                        document.getString("task") ?: "",
                        document.getBoolean("completed") ?: false
                    )
                }
            }
        }
    }

    fun refreshTasks() {
        tasksViewModel.getTasks { result ->
            result?.let {
                tasks = it.documents.map { document ->
                    Triple(
                        document.id,
                        document.getString("task") ?: "",
                        document.getBoolean("completed") ?: false
                    )
                }
            }
        }
    }

    fun addTask() {
        if (taskText.isNotBlank()) {
            tasksViewModel.addTask(taskText) { isSuccessful ->
                if (isSuccessful) {
                    taskText = ""
                    refreshTasks()
                    Toast.makeText(navController.context, "Tarefa adicionada", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(navController.context, "Erro ao adicionar tarefa", Toast.LENGTH_SHORT).show()
                }
            }
        } else {
            Toast.makeText(navController.context, "Por favor, digite uma tarefa!", Toast.LENGTH_SHORT).show()
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Gerenciador de Tarefas", style = MaterialTheme.typography.titleLarge)
        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = taskText,
            onValueChange = { taskText = it },
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            placeholder = { Text(text = "Nova Tarefa") },
            singleLine = true,
            keyboardOptions = KeyboardOptions.Default.copy(
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { addTask() }),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        Button(
            onClick = { addTask() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text(text = "Adicionar Tarefa")
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Listagem das tarefas
        tasks.forEach { (id, task, completed) ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = completed,
                    onCheckedChange = {
                        tasksViewModel.toggleTaskCompletion(id, !completed) {
                            refreshTasks()
                        }
                    }
                )

                if (taskBeingEdited?.first == id) {
                    OutlinedTextField(
                        value = taskBeingEdited?.second ?: "",
                        onValueChange = { newText ->
                            taskBeingEdited = id to newText
                        },
                        modifier = Modifier.weight(1f).padding(horizontal = 8.dp),
                        singleLine = true,
                        colors = TextFieldDefaults.outlinedTextFieldColors(
                            focusedBorderColor = MaterialTheme.colorScheme.primary,
                            unfocusedBorderColor = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    )

                    Button(onClick = {
                        taskBeingEdited?.let { (_, newTask) ->
                            tasksViewModel.updateTask(id, newTask)
                            taskBeingEdited = null
                            refreshTasks()
                        }
                    }) {
                        Text("Salvar")
                    }
                } else {
                    Text(
                        text = task,
                        modifier = Modifier.weight(1f),
                        style = MaterialTheme.typography.bodyLarge
                    )

                    Button(onClick = { taskBeingEdited = id to task }) {
                        Text("Editar")
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                Button(onClick = {
                    tasksViewModel.deleteTask(id) {
                        refreshTasks()
                    }
                }) {
                    Text("Excluir")
                }
            }
        }
    }
}