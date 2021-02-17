import {tabs, tabsAreas, addButton, input} from './init.js';
//import * as  taskList from './model.js';


document.addEventListener('DOMContentLoaded', main);

function main() {
    addButton.addEventListener('click', addNewTask);
    tabs.forEach(tab => {tab.addEventListener('click', () => {openTab(tab)})});
}

function addNewTask(event) {

    event.preventDefault();

    let newTask = document.createElement('div');
    let taskName = document.createElement('span');
    let deleteButton = document.createElement('button');
    let checkboxButton = document.createElement('button');
    let activeList = document.querySelector('.active-list');

    newTask.classList.add('task');
    deleteButton.classList.add('delete', 'fas', 'fa-trash');
    checkboxButton.classList.add('check', 'far', 'fa-check-circle');
    taskName.textContent = input.value;
    input.value = '';
    newTask.appendChild(checkboxButton);
    newTask.appendChild(taskName);
    newTask.appendChild(deleteButton);
    activeList.appendChild(newTask);

    deleteButton.onclick = (event) => {deleteTask(event)};
    checkboxButton.onclick = (event) => {checkTask(event)};
}
    
function openTab(tab) {
    document.querySelector('.active-tab').classList.remove('active-tab');
    document.querySelector('.active-list').classList.remove('active-list');
    tab.classList.add('active-tab');
    let activeArea = document.querySelector('.list-'+tab.textContent.toLowerCase());
    activeArea.classList.add('active-list');
}

function deleteTask(event) {
    event.target.parentNode.remove();
}

function checkTask(event) {
    if(event.target.style.color != 'green') {
        event.target.style.color = 'green';
        event.target.parentNode.querySelector('span').style.textDecoration = 'line-through';
    } else {
        event.target.style.color = 'grey';
        event.target.parentNode.querySelector('span').style.textDecoration = 'none';
    }
}