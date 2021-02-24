import {main, tabs, tabsAreas, addButton, input, animationDuration} from './init.js';
import {ToDo, Interval, Task} from './init.js';

let draggableTask;
let todo;
document.addEventListener('DOMContentLoaded', init);

function init() {

    // Making default intervals
    let today = new Interval('today');
    let tomorrow = new Interval('tomorrow');
    let week = new Interval('week');
    let month = new Interval('month');
    today.active = true;
    todo = new ToDo(today, tomorrow, week, month);
    
    addButton.addEventListener('click', addNewTask);
    tabs.forEach(tab => {tab.addEventListener('click', () => {openTab(tab)})});
    main.addEventListener('wheel', scrollHorizontally);
}

function openTab(tab) {

    // Making previous tab and it's area inactive
    document.querySelector('.active-tab').classList.remove('active-tab');
    document.querySelector('.active-list').classList.remove('active-list');

    // Making pressed tab and it's area active
    tab.classList.add('active-tab');
    let activeArea = document.querySelector('.list-'+tab.textContent.toLowerCase());
    activeArea.classList.add('active-list');
    todo.active(tab);
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
    deleteButton.classList.add('task-delete-button', 'fas', 'fa-trash');
    completeButton.classList.add('task-complete-button', 'far', 'fa-check-circle');

    taskName.textContent = input.value;
    
    // Add into model and link id
    // console.log(todo.active.last);
    todo.active.addTask(input.value);
    console.dir(todo);
    // newTask.id = todo.active.last.id;
    
    input.value = '';

    newTask.setAttribute('draggable', true);

    newTask.appendChild(completeButton);
    newTask.appendChild(taskName);
    newTask.appendChild(deleteButton);
    activeList.appendChild(newTask);

    // Listeners on buttons of newly created task block 
    deleteButton.onclick = (event) => {deleteTask(event)};
    completeButton.onclick = (event) => {completeTask(event)};
    newTask.ondragstart = (event) => {dragStart(event)};
    newTask.ondragenter = (event) => {toggleDropArea(event)};
    newTask.ondragleave = (event) => {toggleDropArea(event)};
    newTask.ondragend = (event) => {dragEnd(event)};
    newTask.ondragover = (event) => {event.preventDefault()}; // Valid area for dropping
    newTask.ondrop = (event) => {drop(event)};
}

function deleteTask(event) {
    event.target.parentNode.remove();
}

function completeTask(event) {
    event.target.parentNode.classList.toggle('complete');
    event.target.classList.add('animate-complete');
    setTimeout(() => {
        event.target.classList.remove('animate-complete');
    }, animationDuration);
}

function scrollHorizontally(event) {
    if(window.innerWidth > 480) {
        let activeArea = document.querySelector('.active-list');
        if (event.deltaY > 0) 
            activeArea.scrollLeft += 40;
        else 
            activeArea.scrollLeft -= 40;
    }
}

function dragStart(event) {
    draggableTask = event.target;
    event.target.parentNode.childNodes.forEach(task => {
        task.childNodes.forEach(child => {child.style.pointerEvents = 'none'});
    });
}

function toggleDropArea(event) {
    if(event.target != draggableTask) {
        event.target.classList.toggle('drop-area');
    }
}

function dragEnd(event) {
    // In any case of ending drag we must back buttons functionality
    event.target.parentNode.childNodes.forEach(task => {
        task.childNodes.forEach(child => {child.style.pointerEvents = 'initial'});
    });
}

function drop(event) {
    if(event.target != draggableTask) { // prevent error when drop to itself
        if(true) {
            event.target.classList.toggle('drop-area');
            event.target.parentNode.removeChild(draggableTask);
            event.target.parentNode.insertBefore(draggableTask, event.target);
        } else {

        }
        
    }
}