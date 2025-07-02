;(function () {
  "use strict"

  // Construtora de tarefas
  function Task(name, completed = false, createdAt = Date.now(), updatedAt = null) {
    this.name = name
    this.completed = completed
    this.createdAt = createdAt
    this.updatedAt = updatedAt

    this.toggleDone = function () {
      this.completed = !this.completed
      this.updatedAt = Date.now()
    }
  }

  let arrInstancesTasks = []

  function saveTasksToLocalStorage() {
    const plainTasks = arrInstancesTasks.map(task => ({
      name: task.name,
      completed: task.completed,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }))
    localStorage.setItem("tasks", JSON.stringify(plainTasks))
  }

  function loadTasksFromLocalStorage() {
    const stored = localStorage.getItem("tasks")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        arrInstancesTasks = parsed.map(task => new Task(
          task.name,
          task.completed,
          task.createdAt,
          task.updatedAt
        ))
      } catch (err) {
        console.error("Erro ao carregar localStorage:", err)
        arrInstancesTasks = []
      }
    }
  }

  // DOM Elements
  const itemInput = document.getElementById("item-input")
  const todoAddForm = document.getElementById("todo-add")
  const ul = document.getElementById("todo-list")

  function generateLiTask(obj) {
    const li = document.createElement("li")
    const p = document.createElement("p")
    const checkButton = document.createElement("button")
    const editButton = document.createElement("i")
    const deleteButton = document.createElement("i")

    li.className = "todo-item"

    checkButton.className = "button-check"
    checkButton.innerHTML = `
      <i class="fas fa-check ${obj.completed ? "" : "displayNone"}" data-action="checkButton"></i>`
    checkButton.setAttribute("data-action", "checkButton")
    li.appendChild(checkButton)

    p.className = "task-name"
    p.textContent = obj.name
    li.appendChild(p)

    editButton.className = "fas fa-edit"
    editButton.setAttribute("data-action", "editButton")
    li.appendChild(editButton)

    const containerEdit = document.createElement("div")
    containerEdit.className = "editContainer"

    const inputEdit = document.createElement("input")
    inputEdit.setAttribute("type", "text")
    inputEdit.className = "editInput"
    inputEdit.value = obj.name
    inputEdit.setAttribute("name", "edit-task") // resolve aviso de autofill

    containerEdit.appendChild(inputEdit)

    const containerEditButton = document.createElement("button")
    containerEditButton.className = "editButton"
    containerEditButton.textContent = "Edit"
    containerEditButton.setAttribute("data-action", "containerEditButton")
    containerEdit.appendChild(containerEditButton)

    const containerCancelButton = document.createElement("button")
    containerCancelButton.className = "cancelButton"
    containerCancelButton.textContent = "Cancel"
    containerCancelButton.setAttribute("data-action", "containerCancelButton")
    containerEdit.appendChild(containerCancelButton)

    li.appendChild(containerEdit)

    deleteButton.className = "fas fa-trash-alt"
    deleteButton.setAttribute("data-action", "deleteButton")
    li.appendChild(deleteButton)

    return li
  }

  function renderTasks() {
    ul.innerHTML = ""
    arrInstancesTasks.forEach(taskObj => {
      ul.appendChild(generateLiTask(taskObj))
    })
  }

  function addTask(taskName) {
    if (!taskName.trim()) return
    const newTask = new Task(taskName)
    arrInstancesTasks.push(newTask)
    saveTasksToLocalStorage()
    renderTasks()
  }

  function clickedUl(e) {
    const dataAction = e.target.getAttribute("data-action")
    if (!dataAction) return

    let currentLi = e.target
    while (currentLi && currentLi.nodeName !== "LI") {
      currentLi = currentLi.parentElement
    }

    if (!currentLi) return

    const lis = ul.getElementsByTagName("li")
    const currentLiIndex = [...lis].indexOf(currentLi)
    if (currentLiIndex < 0) return

    const actions = {
      editButton: function () {
        const editContainer = currentLi.querySelector(".editContainer");
        [...ul.querySelectorAll(".editContainer")].forEach(container => {
          container.removeAttribute("style")
        })
        editContainer.style.display = "flex"
      },
      deleteButton: function () {
        arrInstancesTasks.splice(currentLiIndex, 1)
        saveTasksToLocalStorage()
        renderTasks()
      },
      containerEditButton: function () {
        const val = currentLi.querySelector(".editInput").value
        if (!val.trim()) return
        arrInstancesTasks[currentLiIndex].name = val
        arrInstancesTasks[currentLiIndex].updatedAt = Date.now()
        saveTasksToLocalStorage()
        renderTasks()
      },
      containerCancelButton: function () {
        currentLi.querySelector(".editContainer").removeAttribute("style")
        currentLi.querySelector(".editInput").value = arrInstancesTasks[currentLiIndex].name
      },
      checkButton: function () {
        arrInstancesTasks[currentLiIndex].toggleDone()
        saveTasksToLocalStorage()
        renderTasks()
      }
    }

    if (typeof actions[dataAction] === "function") {
      actions[dataAction]()
    }
  }

  todoAddForm.addEventListener("submit", function (e) {
    e.preventDefault()
    addTask(itemInput.value)
    itemInput.value = ""
    itemInput.focus()
  })

  ul.addEventListener("click", clickedUl)

  loadTasksFromLocalStorage()
  renderTasks()
})()
