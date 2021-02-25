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

    if(!localStorage.getItem('todo')) {
        localStorage.setItem('todo', JSON.stringify(todo));
    } else {
        let localTodo = JSON.parse(localStorage.getItem('todo'));
        for (let key in localTodo) {
            let interval = localTodo[key];
            interval.tasks.forEach(task => {
                addNewTask(null, task);
            });
        }
    }
    
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

    // Change active tab in model
    todo.active = tab.textContent.toLowerCase();
}

function addNewTask(event, task) {

    // Prevent reloading with novalidate or html validation message after adding new task
    if(event)
        event.preventDefault();

    // Checking on empty field and string contains spaces only
    if(!input.validity.valid && !input.value.replace(/\s/g, '').length && !task) {
        alert("Name can not be empty and must have a characters");
        input.value = '';
        return;
    }

    // Building html-block for task
    let newTask = document.createElement('div');
    let taskName = document.createElement('span');
    let deleteButton = document.createElement('button');
    let completeButton = document.createElement('button');
    let activeList;

    if(!task) {
        activeList = document.querySelector('.active-list');
    } else {
        activeList = document.querySelector('.list-' + task.interval);
    } 

    newTask.classList.add('task');
    taskName.classList.add('task-name');
    deleteButton.classList.add('task-delete-button', 'fas', 'fa-trash');
    completeButton.classList.add('task-complete-button', 'far', 'fa-circle');

    if(!task)
        taskName.textContent = input.value;
    else
        taskName.textContent = task.textContent;

    // Add into model and link id ----------------------------------------------------------------
    if(!task) { // From UI
        todo.active.addTask(input.value);
        newTask.id = todo.active.last.id;
    } else { // From localStorage
        todo[task.interval].addTask(task.textContent, 'local');
        newTask.id = todo[task.interval].last.id;
    }
    
    input.value = '';
    newTask.setAttribute('draggable', true);

    newTask.appendChild(completeButton);
    newTask.appendChild(taskName);
    newTask.appendChild(deleteButton);
    activeList.appendChild(newTask);

    // Listeners on buttons of newly created task block 
    deleteButton.onclick = (event) => {deleteTask(event)};
    completeButton.onclick = (event) => {completeTask(event, task)};
    newTask.ondragstart = (event) => {dragStart(event)};
    newTask.ondragenter = (event) => {toggleDropArea(event)};
    newTask.ondragleave = (event) => {toggleDropArea(event)};
    newTask.ondragend = (event) => {dragEnd(event)};
    newTask.ondragover = (event) => {event.preventDefault()}; // Valid area for dropping
    newTask.ondrop = (event) => {drop(event)};

    // When localStorage task is already comleted
    if(task && task.completed) {
        completeButton.click(task);
    }
}

function deleteTask(event) {
    
    // Remove in model
    todo.active.deleteTask(event.target.parentNode.id);

    event.target.parentNode.remove();

    //refresh id's for next moves
    let id = 0;
    document.querySelector('.active-list').childNodes.forEach(task => {
        task.id = id++; 
    });
}

function completeTask(event, task) {

    let interval;

    if(task) {
        interval = todo[task.interval];
    } else {
        interval = todo.active;
    }

    // Complete task in model
    let id = parseInt(event.target.parentNode.id);
    event.target.parentNode.classList.contains('complete') ?
    interval.getTask(id).complete(false) :
    interval.getTask(id).complete(true);
    
    event.target.parentNode.classList.toggle('complete');

    if(event.target.parentNode.classList.contains('complete')) {
        event.target.classList.remove('fa-circle');
        event.target.classList.add('animate-complete', 'fa-check-circle');
    } else {
        event.target.classList.remove('fa-check-circle');
        event.target.classList.add('animate-complete', 'fa-circle');
    }

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

    //refresh id's for next moves
    let id = 0;
    event.target.parentNode.childNodes.forEach(task => {
        task.id = id++; 
    });
}

function drop(event) {
    if(!draggableTask.isSameNode(event.target)) { // prevent error when drop to itself

        event.target.classList.toggle('drop-area');
        event.target.parentNode.removeChild(draggableTask);

        if(draggableTask.id > event.target.id) {
            event.target.parentNode.insertBefore(draggableTask, event.target);
        } else {
            event.target.parentNode.insertBefore(draggableTask, event.target.nextSibling);
        }

        // Move elements in model
        todo.active.move(parseInt(draggableTask.id), parseInt(event.target.id));
    }
}