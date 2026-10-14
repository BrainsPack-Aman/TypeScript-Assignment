import StorageService from "./storageService.js";
import type { User } from "./type.js";

const STORAGE_KEY = "users";


const tableBody = document.getElementById("user-table-body") as HTMLTableSectionElement;
const form = document.getElementById("user-form") as HTMLFormElement;
const formTitle = document.getElementById("form-title") as HTMLHeadingElement;
const userIdInput = document.getElementById("user-id") as HTMLInputElement;
const nameInput = document.getElementById("name") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const ageInput = document.getElementById("age") as HTMLInputElement;
const roleInput = document.getElementById("role") as HTMLSelectElement;
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const messageEl = document.getElementById("message") as HTMLParagraphElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const roleFilter = document.getElementById("role-filter") as HTMLSelectElement;


const seedUsers: User[] = [
  { id: crypto.randomUUID(), name: "Aman Kumar", email: "aman@gmail.com", age: 22, role: "Developer" },
  { id: crypto.randomUUID(), name: "abc", email: "abc@gmail.com", age: 12, role: "Admin" },
];


function loadUsers(): User[] {
  const users = StorageService.getItem<User[]>(STORAGE_KEY);

  if (users !== null) return users;

  saveUsers(seedUsers);
  return seedUsers;
}

function saveUsers(users: User[]): void {
  StorageService.setItem(STORAGE_KEY, users);
}


function showMessage(message: string): void {
  messageEl.textContent = message;
}

function renderUsers(): void {
  const query = searchInput.value.trim().toLowerCase();
  const role = roleFilter.value;

  const users = loadUsers().filter((user) =>
    (user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)) &&
    (!role || user.role === role)
  );

  tableBody.innerHTML = users.length
    ? users.map((user) => `
        <tr data-id="${user.id}">
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.age}</td>
          <td>${user.role}</td>
          <td>
            <button type="button" data-action="edit">Edit</button>
            <button type="button" data-action="delete">Delete</button>
          </td>
        </tr>
      `).join("")
    : '<tr><td colspan="5">No users found.</td></tr>';
}


function resetForm(): void {
  form.reset();
  userIdInput.value = "";
  formTitle.textContent = "Add New User";
  submitBtn.textContent = "Add User";
  cancelBtn.hidden = true;
}

function fillForm(user: User): void {
  userIdInput.value = user.id;
  nameInput.value = user.name;
  emailInput.value = user.email;
  ageInput.value = String(user.age);
  roleInput.value = user.role;

  formTitle.textContent = "Edit User";
  submitBtn.textContent = "Update User";
  cancelBtn.hidden = false;
  nameInput.focus();
}


function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();

  const id = userIdInput.value;
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const age = Number(ageInput.value);
  const role = roleInput.value;

  const users = loadUsers();

  if (users.some((user) =>
    user.email.toLowerCase() === email.toLowerCase() && user.id !== id
  )) {
    showMessage("A user with this email already exists.");
    return;
  }

  if (id) {
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
      showMessage("User not found.");
      resetForm();
      renderUsers();
      return;
    }

    users[index] = { id, name, email, age, role };
    showMessage("User updated.");
  } else {
    users.push({ id: crypto.randomUUID(), name, email, age, role });
    showMessage("User added.");
  }

  saveUsers(users);
  resetForm();
  renderUsers();
}


function handleTableClick(event: MouseEvent): void {
  const target = event.target;

  if (!(target instanceof HTMLButtonElement)) return;

  const row = target.closest("tr");
  const id = row?.dataset.id;
  const action = target.dataset.action;

  if (!id || !action) return;

  const users = loadUsers();
  const user = users.find((user) => user.id === id);

  if (action === "edit") {
    if (!user) {
      showMessage("User not found.");
      renderUsers();
      return;
    }

    fillForm(user);
    showMessage("");
  }

  if (action === "delete") {
    saveUsers(users.filter((user) => user.id !== id));

    if (userIdInput.value === id) resetForm();

    showMessage("User deleted.");
    renderUsers();
  }
}


form.addEventListener("submit", handleSubmit);

cancelBtn.addEventListener("click", () => {
  resetForm();
  showMessage("");
});

tableBody.addEventListener("click", handleTableClick);
searchInput.addEventListener("input", renderUsers);
roleFilter.addEventListener("change", renderUsers);

renderUsers();
