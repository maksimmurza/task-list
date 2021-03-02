import {todo} from './model.js';

let main = document.querySelector('main'),
    tabs = document.querySelectorAll('.tab'),
    addButton = document.querySelector('.add-task-button'),
    input = document.querySelector('.task-name-input'),
    animationDuration = parseInt(
                                    getComputedStyle(document.documentElement)
                                    .getPropertyValue('--animation-duration')
                                );
let activeList, 
    taskElement, 
    taskNameElement, 
    deleteButtonElement, 
    completeButtonElement, 
    draggableTask;

document.addEventListener('DOMContentLoaded', init);

function init() {

    // Add already existing tasks that we get from local storage
    for (let key in todo) {
        let interval = todo[key];
        interval.tasks.forEach(task => {
            console.log(todo);
            addNewTask(null, task);
        });
    }
    
    addButton.onclick = addNewTask;
    tabs.forEach(tab => {tab.addEventListener('click', () => {openTab(tab)})});
    main.addEventListener('wheel', scrollHorizontally);
    document.querySelector('.download-json').onclick = downloadJson;
    document.querySelector('.upload-json').onclick = uploadJson;
    document.querySelector('.active-list').onscroll = (event) => {setMargins(event.target)}
}

function openTab(tab) {

    // console.log(activeList);

    // Making previous tab and it's area inactive
    document.querySelector('.active-tab').classList.remove('active-tab');
    document.querySelector('.active-list').classList.remove('active-list');

    // Making pressed tab and it's area active
    tab.classList.add('active-tab');
    let activeArea = document.querySelector('.list-'+tab.textContent.toLowerCase());
    activeArea.classList.add('active-list');

    // Change active tab in model
    todo.active = tab.textContent.toLowerCase();

    document.querySelector('.active-list').onscroll = (event) => {setMargins(event.target)}
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
    taskElement = document.createElement('div');
    taskNameElement = document.createElement('span');
    deleteButtonElement = document.createElement('button');
    completeButtonElement = document.createElement('button');

    if(!task) {
        activeList = document.querySelector('.active-list');
    } else {
        activeList = document.querySelector('.list-' + task.interval);
    } 

    taskElement.classList.add('task');
    taskNameElement.classList.add('task-name');
    deleteButtonElement.classList.add('task-delete-button', 'fas', 'fa-trash');
    completeButtonElement.classList.add('task-complete-button', 'far', 'fa-circle');

    if(!task)
        taskNameElement.textContent = input.value;
    else
        taskNameElement.textContent = task.textContent;

    // Add into model and link id ----------------------------------------------------------------
    if(!task) { // From UI
        todo.active.addTask(input.value);
        taskElement.id = todo.active.last.id;
    } else { // From localStorage
        taskElement.id = todo[task.interval].last.id;
    }
    
    input.value = '';
    taskElement.setAttribute('draggable', true);

    taskElement.appendChild(completeButtonElement);
    taskElement.appendChild(taskNameElement);
    taskElement.appendChild(deleteButtonElement);
    activeList.appendChild(taskElement);

    // Listeners on buttons of newly created task block 
    deleteButtonElement.onclick = deleteTask;
    completeButtonElement.onclick = (event) => {completeTask(event, task)};
    taskElement.ondragstart = (event) => {dragStart(event)};
    taskElement.ondragenter = (event) => {toggleDropArea(event)};
    taskElement.ondragleave = (event) => {toggleDropArea(event)};
    taskElement.ondragend = (event) => {dragEnd(event)};
    taskElement.ondragover = (event) => {event.preventDefault()}; // Valid area for dropping
    taskElement.ondrop = (event) => {drop(event)};

    // When localStorage task is already comleted
    if(task && task.completed) {
        completeButtonElement.click(task);
    }
}

function deleteTask() {
    
    // Remove in model
    todo.active.deleteTask(event.target.parentNode.id);

    this.parentNode.remove();

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

function setMargins(activeList) {
    if(activeList.scrollLeft != 0) {
        activeList.style.marginLeft = '1em';
        activeList.style.marginRight = '1em';
    } else {
        activeList.style.marginLeft = 'calc(1em - 10px)';
        activeList.style.marginRight = 'calc(1em - 10px)';
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

function drop(event) {
    let dropAreaTask = event.target;

    if(!draggableTask.isSameNode(dropedOn)) { // prevent error when drop to itself
        dropAreaTask.classList.toggle('drop-area');
        dropedOn.parentNode.removeChild(draggableTask);

        if(draggableTask.id > dropAreaTask.id) {
            dropedOn.parentNode.insertBefore(draggableTask, dropAreaTask);
        } else {
            dropedOn.parentNode.insertBefore(draggableTask, dropAreaTask.nextSibling);
        }

        // Move elements in model
        todo.active.move(parseInt(draggableTask.id), parseInt(dropAreaTask.id));
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

function downloadJson() {
    let fileName = 'tasks.json'
    let data = JSON.stringify(todo, null, '\t')
    let blob = new Blob([data], {type: 'text/json'});
    let a = document.createElement('a');
    a.download = fileName;
    a.href = window.URL.createObjectURL(blob);
    a.click();
}

function uploadJson() {
    let upload = document.querySelector('#select-file');
    let result;

    upload.addEventListener('change', function() {
        if (upload.files.length > 0) {    
            let fileReader = new FileReader();

            fileReader.addEventListener('load', function() {
                result = JSON.parse(fileReader.result); // Parse the result into an object
                console.log(result);
                localStorage.setItem('todo', fileReader.result);
                init();
            });
            fileReader.readAsText(upload.files[0]);
        }
    });
    upload.click();
}