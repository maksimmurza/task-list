export {main, tabs, tabsAreas, addButton, input, animationDuration};
export {ToDo, Interval, Task};

let main = document.querySelector('main');
let tabs = document.querySelectorAll('.tab');
let tabsAreas = document.querySelectorAll('.list');
let addButton = document.querySelector('.add-task-button');
let input = document.querySelector('.task-name-input');
let animationDuration = parseInt(
                                    getComputedStyle(document.documentElement)
                                    .getPropertyValue('--animation-duration')
                                );

class ToDo {

    constructor(...intervals) {
        if(intervals.length != 0) {
            intervals.forEach(interval => {
                this.addInterval(interval);
            })
        }
    }

    // --------- active as pseudo property----------
    // check every valid property and return that active
    get active() {
        for(let prop in this) {
            if(this[prop] instanceof Interval) {
                if(this[prop].active == true)
                    return this[prop];
            }
        }
    }

    // set all in false, than set active
    set active(interval) {
        for(let prop in this) {
            if(this[prop] instanceof Interval) {
                this[prop].active = false;
            }
        }
        this[interval].active = true;
    }

    addInterval(interval) {
        this[interval.name] = interval;
    }
}

class Interval {

    name;
    tasks = [];
    active;
    #last;

    constructor(name) {
        this.name = name;
        this.active = false;
    }

    get last() {
        let index = this.tasks.length;
        return this.tasks[index-1];
    }

    addTask(arg, local) {
        if(typeof arg == 'string') {
            let task = new Task(arg);
            if(this.last != undefined) {
                task.id = this.last.id + 1;
            } else {
                task.id = 0;
            }
            
            task.interval = this.name;
            this.tasks.push(task);

            // Adding to the local storage
            // Checking on source of task. If local, than it's no need to add it to localStorage
            if(!local) {
                let localTodo = JSON.parse(localStorage.getItem('todo'));
                localTodo[this.name].tasks.push(task);
                localStorage.setItem('todo', JSON.stringify(localTodo));
            }
        } else {
            console.log('Incorrect format');
        }
    }

    deleteTask(taskId) {
        if(typeof taskId == 'string')
            taskId = parseInt(taskId);

        this.tasks.splice(taskId, 1);
        this.#last--;
        this.refreshId();

        // Delete from the local storage
        let localTodo = JSON.parse(localStorage.getItem('todo'));
        localTodo[this.name].tasks = this.tasks;
        localStorage.setItem('todo', JSON.stringify(localTodo));

    }

    getTask(arg) {
        if(typeof arg == 'number') {
            return this.tasks.find(task => task.id == arg);
        } else if(typeof arg == 'string') {
            return this.tasks.find(task => task.textContent == arg);
        }
    }

    move(draggedId, dropedOnId) {
        
        let dragged = this.tasks.splice(draggedId, 1)[0];
        this.tasks = this.tasks.slice(0, dropedOnId)
            .concat(dragged)
            .concat(this.tasks.slice(dropedOnId, this.tasks.length));


        this.refreshId();
        // Move in the local storage
        let localTodo = JSON.parse(localStorage.getItem('todo'));
        localTodo[this.name].tasks = this.tasks;
        localStorage.setItem('todo', JSON.stringify(localTodo));
    }

    refreshId() {
        this.tasks.forEach((task, index) => {
            task.id = index;
        });
    }

    
}

class Task {

    #id;
    textContent;
    completed = false;
    interval;

    constructor(text) {
        this.textContent = text;
    }

    get id() {
        return this.#id;
    }

    set id(id) {
        this.#id = id;
    }

    edit(newTextContent) {
        this.textContent = newTextContent;
    }

    complete(status) {

        // localStorage
        let localTodo = JSON.parse(localStorage.getItem('todo'));

        if(status) {
            this.completed = true;
            localTodo[this.interval].tasks[this.id].completed = true;
        } else {
            this.completed = false;
            localTodo[this.interval].tasks[this.id].completed = false;
        }

        localStorage.setItem('todo', JSON.stringify(localTodo));
    }
}