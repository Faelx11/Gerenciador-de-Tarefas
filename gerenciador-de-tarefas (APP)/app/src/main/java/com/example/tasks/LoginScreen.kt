package com.example.tasks

import androidx.compose.material3.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(navController: NavController, authViewModel: AuthViewModel) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isCreatingAccount by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Login", style = MaterialTheme.typography.headlineMedium)

        Spacer(modifier = Modifier.height(20.dp))

        Text(text = "Email", style = MaterialTheme.typography.bodyLarge)
        OutlinedTextField(
            value = email,
            onValueChange = { email = it },
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
            placeholder = { Text(text = "Digite seu email") },
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Email),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.onSurfaceVariant,
                focusedLabelColor = MaterialTheme.colorScheme.primary,
                unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        Text(text = "Senha", style = MaterialTheme.typography.bodyLarge)
        OutlinedTextField(
            value = password,
            onValueChange = { password = it },
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
            placeholder = { Text(text = "Digite sua senha") },
            keyboardOptions = KeyboardOptions.Default.copy(keyboardType = KeyboardType.Password),
            visualTransformation = PasswordVisualTransformation(),
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.onSurfaceVariant,
                focusedLabelColor = MaterialTheme.colorScheme.primary,
                unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant
            )
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = Color.Red)
        }

        Button(onClick = {
            if (isCreatingAccount) {
                authViewModel.createAccountWithEmailAndPassword(email, password) { isSuccessful ->
                    if (isSuccessful) {
                        navController.navigate("tasks")
                    } else {
                        errorMessage = "Erro ao criar conta. Tente novamente."
                    }
                }
            } else {
                authViewModel.signInWithEmailAndPassword(email, password) { isSuccessful ->
                    if (isSuccessful) {
                        navController.navigate("tasks")
                    } else {
                        errorMessage = "Erro ao fazer login. Verifique suas credenciais."
                    }
                }
            }
        }) {
            Text(text = if (isCreatingAccount) "Criar Conta" else "Entrar")
        }

        Spacer(modifier = Modifier.height(16.dp))

        TextButton(onClick = {
            isCreatingAccount = !isCreatingAccount
            errorMessage = ""
        }) {
            Text(text = if (isCreatingAccount) "Já tem uma conta? Entre aqui" else "Não tem uma conta? Crie uma")
        }
    }
}