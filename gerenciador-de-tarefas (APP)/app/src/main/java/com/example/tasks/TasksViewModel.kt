package com.example.tasks

import androidx.lifecycle.ViewModel
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.QuerySnapshot

class TasksViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()

    fun addTask(task: String, onResult: (Boolean) -> Unit) {
        val taskData = hashMapOf("task" to task, "completed" to false)
        db.collection("tasks").add(taskData)
            .addOnSuccessListener { onResult(true) }
            .addOnFailureListener { onResult(false) }
    }

    fun updateTask(id: String, newTask: String, onResult: (() -> Unit)? = null) {
        db.collection("tasks").document(id).update("task", newTask)
            .addOnSuccessListener { onResult?.invoke() }
    }

    fun toggleTaskCompletion(id: String, completed: Boolean, onResult: (() -> Unit)? = null) {
        db.collection("tasks").document(id).update("completed", completed)
            .addOnSuccessListener { onResult?.invoke() }
    }

    fun deleteTask(id: String, onResult: (() -> Unit)? = null) {
        db.collection("tasks").document(id).delete()
            .addOnSuccessListener { onResult?.invoke() }
    }

    fun getTasks(onResult: (QuerySnapshot?) -> Unit) {
        db.collection("tasks").get()
            .addOnSuccessListener { result -> onResult(result) }
            .addOnFailureListener { onResult(null) }
    }
}