const todos = [];
const RENDER_EVENT = "render-todo";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("form");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addTodo();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addTodo() {
  const title = document.getElementById("judul").value;
  const author = document.getElementById("penulis").value;
  const year = document.getElementById("tahun").value;
  const isComplete = document.getElementById("supportCheckbox").checked;

  const generatedID = generateId();
  const todoObject = generateTodoObject(
    generatedID,
    title,
    author,
    parseInt(year),
    isComplete
  );
  todos.push(todoObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(todos);
  const uncompletedTODOList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedTODOList = document.getElementById("completeBookshelfList");

  uncompletedTODOList.innerHTML = "";
  completedTODOList.innerHTML = "";

  for (const todoItem of todos) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isComplete) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  }
});

function makeTodo(todoObject) {
  const textTitle = document.createElement("h3");
  textTitle.classList.add("bookshelf-card-title");
  textTitle.innerText = todoObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.classList.add("bookshelf-card-author");
  textAuthor.innerText = `Penulis: ${todoObject.author}`;

  const textYear = document.createElement("p");
  textYear.classList.add("bookshelf-card-year");
  textYear.innerText = `Tahun: ${todoObject.year}`;

  const textContainer = document.createElement("div");
  textContainer.classList.add("bookshelf-card-content");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("bookshelf-card");
  container.append(textContainer);

  if (!todoObject.isComplete) {
    const completeButton = document.createElement("button");
    completeButton.classList.add("bookshelf-card-button");
    completeButton.innerText = "Selesai dibaca";
    completeButton.addEventListener("click", function () {
      completeTodo(todoObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("bookshelf-card-button");
    deleteButton.innerText = "Hapus";
    deleteButton.addEventListener("click", function () {
      deleteTodo(todoObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("bookshelf-card-button");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", function () {
      editTodoPrompt(todoObject.id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("bookshelf-card-buttons");
    buttonContainer.append(completeButton, editButton, deleteButton);

    container.append(buttonContainer);
  } else {
    const uncompleteButton = document.createElement("button");
    uncompleteButton.classList.add("bookshelf-card-button");
    uncompleteButton.innerText = "Belum dibaca";
    uncompleteButton.addEventListener("click", function () {
      uncompleteTodo(todoObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("bookshelf-card-button");
    deleteButton.innerText = "Hapus";
    deleteButton.addEventListener("click", function () {
      deleteTodo(todoObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("bookshelf-card-button");
    editButton.innerText = "Edit";
    editButton.addEventListener("click", function () {
      editTodoPrompt(todoObject.id);
    });

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("bookshelf-card-buttons");
    buttonContainer.append(uncompleteButton, editButton, deleteButton);

    container.append(buttonContainer);
  }

  return container;
}

function editTodoPrompt(todoId) {
  const todoTarget = findTodo(todoId);
  if (todoTarget == null) return;

  const newTitle = prompt("Ubah judul buku:", todoTarget.title);
  const newAuthor = prompt("Ubah penulis buku:", todoTarget.author);
  let newYear;

  while (true) {
    newYear = prompt("Ubah tahun buku:", todoTarget.year);
    if (newYear === null) break; // User cancelled
    if (!isNaN(newYear) && newYear.trim() !== "") {
      newYear = parseInt(newYear);
      break;
    } else {
      alert("Tahun harus berupa angka!");
    }
  }

  if (newTitle !== null && newAuthor !== null && newYear !== null) {
    todoTarget.title = newTitle;
    todoTarget.author = newAuthor;
    todoTarget.year = newYear;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function completeTodo(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function uncompleteTodo(todoId) {
  const todoTarget = findTodo(todoId);

  if (todoTarget == null) return;

  todoTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function deleteTodo(todoId) {
  const todoTargetIndex = findTodoIndex(todoId);

  if (todoTargetIndex === -1) return;

  const isConfirmed = confirm("Yakin hapus?");
  if (isConfirmed) {
    todos.splice(todoTargetIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = "saved-todo";
const STORAGE_KEY = "TODO_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("searchButton");
  searchButton.addEventListener("click", function () {
    searchBooks();
  });
});

function searchBooks() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const filteredBooks = todos.filter(function (book) {
    return (
      book.title.toLowerCase().includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm) ||
      book.year.toString().includes(searchTerm)
    );
  });
  renderFilteredBooks(filteredBooks);
}

function renderFilteredBooks(filteredBooks) {
  const uncompletedTODOList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completedTODOList = document.getElementById("completeBookshelfList");

  uncompletedTODOList.innerHTML = "";
  completedTODOList.innerHTML = "";

  filteredBooks.forEach(function (todoItem) {
    const todoElement = makeTodo(todoItem);
    if (!todoItem.isComplete) {
      uncompletedTODOList.append(todoElement);
    } else {
      completedTODOList.append(todoElement);
    }
  });
}
