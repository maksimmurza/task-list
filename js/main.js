import {tabs, tabsAreas, addButton, input} from './init.js';
//import * as  taskList from './model.js';


document.addEventListener('DOMContentLoaded', main);

function main() {
    addButton.addEventListener('click', addNewTask);
    tabs.forEach(tab => {tab.addEventListener('click', () => {openTab(tab)})});
}

function openTab(tab) {

    // Making previous tab and it's area inactive
    document.querySelector('.active-tab').classList.remove('active-tab');
    document.querySelector('.active-list').classList.remove('active-list');

    // Making pressed tab and it's area active
    tab.classList.add('active-tab');
    let activeArea = document.querySelector('.list-'+tab.textContent.toLowerCase());
    activeArea.classList.add('active-list');
}

function addNewTask(event) {

    // Prevent reloading with novalidate or html validation message after adding new task
    event.preventDefault();

    // Checking on empty field and string contains spaces only
    if(!input.validity.valid && !input.value.replace(/\s/g, '').length) {
        alert("Name can not be empty and must have a characters");
        input.value = '';
        return;
    }

    // Building html-block for task
    let newTask = document.createElement('div');
    let taskName = document.createElement('span');
    let deleteButton = document.createElement('button');
    let completeButton = document.createElement('button');
    let activeList = document.querySelector('.active-list');

    newTask.classList.add('task');
    taskName.classList.add('task-name');
    deleteButton.classList.add('delete', 'fas', 'fa-trash');
    completeButton.classList.add('complete', 'far', 'fa-check-circle');

    taskName.textContent = input.value;
    input.value = '';

    newTask.appendChild(completeButton);
    newTask.appendChild(taskName);
    newTask.appendChild(deleteButton);
    activeList.appendChild(newTask);

    // Listeners on buttons of newly created task block 
    deleteButton.onclick = (event) => {deleteTask(event)};
    completeButton.onclick = (event) => {completeTask(event)};
}

function deleteTask(event) {
    event.target.parentNode.remove();
}

function completeTask(event) {
    if(event.target.style.color != 'green') {
        event.target.style.color = 'green';
        event.target.parentNode.querySelector('span').style.textDecoration = 'line-through';
    } else {
        event.target.style.color = 'grey';
        event.target.parentNode.querySelector('span').style.textDecoration = 'none';
    }
}