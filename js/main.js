import {todo} from './model.js';

let main = document.querySelector('main'),
    tabs = document.querySelectorAll('.tab'),
    areas =  document.querySelectorAll('.list'),
    addButton = document.querySelector('.add-task-button'),
    input = document.querySelector('.task-name-input'),
    downloadJSON = document.querySelector('.download-json'),
    uploadJSON = document.querySelector('.upload-json'),
    animationDuration = parseInt(
                                    getComputedStyle(document.documentElement)
                                    .getPropertyValue('--animation-duration')
                                );
let activeList, 
    taskElement, 
    taskNameElement, 
    deleteButtonElement,
    editButtonElement, 
    completeButtonElement, 
    draggableTask;

document.addEventListener('DOMContentLoaded', init);

function init() {

    // Add already existed in localStorage tasks to UI
    for (let key in todo) {
        let interval = todo[key];
        interval.tasks.forEach(task => {
            addTask(null, task);
        });
    }

    console.log(todo);
    
    // Listeners on default elements
    main.addEventListener('wheel', scrollHorizontally);
    tabs.forEach(tab => {tab.addEventListener('click', () => {openTab(tab)})});
    areas.forEach(area => {area.onscroll = setMargins});
    downloadJSON.onclick = downloadJson;
    uploadJSON.onclick = uploadJson;
    addButton.onclick = addTask;
}

function openTab(tab) {

    // Change active tab in model
    todo.active = tab.textContent;

    // View
    document.querySelector('.active-tab').classList.remove('active-tab');
    tab.classList.add('active-tab');

    document.querySelector('.active-list').classList.remove('active-list');
    let activeArea = document.querySelector('.list-'+tab.textContent.toLowerCase());
    activeArea.classList.add('active-list');
}

function addTask(event, localTask) {

    // Prevent reloading (form)
    if(event) event.preventDefault();

    // Validation
    if(!input.validity.valid && !input.value.replace(/\s/g, '').length && !localTask) {
        alert("Name can not be empty and must have a characters");
        input.value = '';
        return;
    }

    // Creating HTML
    taskElement = document.createElement('div');
    taskNameElement = document.createElement('span');
    deleteButtonElement = document.createElement('button');
    editButtonElement = document.createElement('button');
    completeButtonElement = document.createElement('button');

    taskElement.classList.add('task');
    taskNameElement.classList.add('task-name');
    deleteButtonElement.classList.add('task-delete-button', 'fas', 'fa-trash');
    editButtonElement.classList.add('task-edit-button', 'fas', 'fa-edit');
    completeButtonElement.classList.add('task-complete-button', 'far', 'fa-circle');

    if(localTask) { // From localStorage
        activeList = document.querySelector('.list-' + localTask.interval);
        taskNameElement.textContent = localTask.textContent;
        taskElement.id = localTask.id;
        if(localTask.completed) {
            taskElement.classList.add('complete');
            completeButtonElement.classList.remove('fa-circle');
            completeButtonElement.classList.add('fa-check-circle');
        }
    } else {        // From UI
        activeList = document.querySelector('.active-list');
        taskNameElement.textContent = input.value;
        todo.active.addTask(input.value);
        taskElement.id = todo.active.last.id;
        input.value = '';
    }
    
    // Structuring HTML
    taskElement.appendChild(completeButtonElement);
    taskElement.appendChild(taskNameElement);
    taskElement.appendChild(editButtonElement);
    taskElement.appendChild(deleteButtonElement);
    activeList.appendChild(taskElement);
    taskElement.setAttribute('draggable', true);

    // Listeners
    deleteButtonElement.onclick = deleteTask;
    editButtonElement.onclick = editTask;
    completeButtonElement.onclick = completeTask;
    taskElement.ondragstart = dragStart;
    taskElement.ondragenter = toggleDropArea;
    taskElement.ondragleave = toggleDropArea;
    taskElement.ondragend = dragEnd;
    taskElement.ondragover = (event) => {event.preventDefault()}; // Valid area for dropping
    taskElement.ondrop = drop;
}

function editTask() {
    let task = this.parentNode;
    let taskNameElement = task.querySelector('.task-name');
    let taskText = taskNameElement.textContent;
    let editField = document.createElement('input');
    editField.type = 'text';
    editField.value = taskText;
    editField.autofocus = 'true';
    editField.classList.add('edit-field');
    task.replaceChild(editField, taskNameElement);

    let [deleteButton, editButton] = [task.querySelector('.task-delete-button'), task.querySelector('.task-edit-button')];
    task.removeChild(deleteButton);
    task.removeChild(editButton);
    let applyChangesButton = document.createElement('button');
    applyChangesButton.classList.add('apply-edits', 'fas', 'fa-check');
    task.appendChild(applyChangesButton);
    
    applyChangesButton.onclick = () => {
        todo.active.getTask(task.id).edit(editField.value);
        taskNameElement.textContent = editField.value;
        task.removeChild(editField);
        task.removeChild(applyChangesButton);
        task.appendChild(taskNameElement);
        task.appendChild(editButton);
        task.appendChild(deleteButton);
    }
}

function deleteTask() {
    
    // Remove in model
    todo.active.deleteTask(this.parentNode.id);

    // Update view
    this.parentNode.remove();
    document.querySelector('.active-list').childNodes.forEach((task, i) => {
        task.id = i; 
    });
}

function completeTask() {

    // Complete in model
    todo.active.getTask(this.parentNode.id).complete();

    // Update view
    this.parentNode.classList.toggle('complete');

    if(this.parentNode.classList.contains('complete')) {
        this.classList.remove('fa-circle');
        this.classList.add('animate-complete', 'fa-check-circle');
    } else {
        this.classList.remove('fa-check-circle');
        this.classList.add('animate-complete', 'fa-circle');
    }

    // Animation
    setTimeout(() => {
        this.classList.remove('animate-complete');
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

function setMargins() {
    if(this.scrollLeft != 0) {
        this.style.marginLeft = '1em';
        this.style.marginRight = '1em';
    } else {
        this.style.marginLeft = 'calc(1em - 10px)';
        this.style.marginRight = 'calc(1em - 10px)';
    }
}

function dragStart() {
    draggableTask = this;
    this.parentNode.childNodes.forEach(task => {
        task.childNodes.forEach(child => {child.style.pointerEvents = 'none'});
    });
}

function toggleDropArea() {
    if(this != draggableTask) {
        this.classList.toggle('drop-area');
    }
}

function drop() {
    let dropAreaTask = this;

    if(!draggableTask.isSameNode(this)) {

        // Move elements in model
        todo.active.move(parseInt(draggableTask.id), parseInt(dropAreaTask.id));

        // Update view
        dropAreaTask.classList.toggle('drop-area');
        this.parentNode.removeChild(draggableTask);

        if(parseInt(draggableTask.id) > parseInt(dropAreaTask.id)) {
            this.parentNode.insertBefore(draggableTask, dropAreaTask);
        } else {
            this.parentNode.insertBefore(draggableTask, dropAreaTask.nextSibling);
        }
    }
}

function dragEnd() {
    // In any case of ending drag we must back buttons functionality
    this.parentNode.childNodes.forEach(task => {
        task.childNodes.forEach(child => {child.style.pointerEvents = 'initial'});
    });

    //refresh id's for next moves
    document.querySelector('.active-list').childNodes.forEach((task, i) => {
        task.id = i;
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