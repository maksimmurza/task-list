import {tabs, tabsAreas, addButton, input} from './init.js';
//import * as  taskList from './model.js';

let tabsContent = {today:"", tomorrow:"", week:"", month:""};

document.addEventListener('DOMContentLoaded', main);

function main() {
    addButton.addEventListener('click', addNewTask);
    tabs.forEach(tab => {tab.addEventListener('click', ()=>{openTab(tab)})});
}

function addNewTask(event) {

    event.preventDefault();

    let newTask = document.createElement('div');
    let taskName = document.createElement('span');
    let deleteButton = document.createElement('button');
    let activeList = document.querySelector('.active-list');

    newTask.classList.add('task');
    deleteButton.classList.add('delete', 'fas', 'fa-trash');
    taskName.textContent = input.value;
    input.value = '';
    newTask.appendChild(taskName);
    newTask.appendChild(deleteButton);
    activeList.appendChild(newTask);

    deleteButton.onclick = (event) => {deleteTask(event)};
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
    console.log(event.target);
}