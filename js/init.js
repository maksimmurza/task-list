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
            console.log(prop);
            if(this[prop] instanceof Interval) {
                if(this[prop].active == true)
                    return this[prop];
            }
        }
    }

    // set all in false, than set active
    set active(interval) {
        for(prop in this) {
            if(prop instanceof Interval) {
                prop.active = false;
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
        return this.tasks.pop();
    }

    // set last(last) {
    //     this.#last = last;
    // }

    addTask(arg) {
        if(typeof arg == 'string') {
            let task = new Task(arg);

            console.log(this.last);
            if(this.last != undefined)
                task.id = this.last.id + 1;
            else
                task.id = 0;

            this.tasks.push(task);
        } else {
            console.log('Incorrect format');
        }
    }

    deleteTask(taskId) {
        this.tasks.splice(taskId, 1);
        this.#last--;
        this.refreshId();
    }

    getTask(arg) {
        if(typeof arg == 'number') {
            return this.tasks.find(task => task.id == arg);
        } else if(typeof arg == 'string') {
            return this.tasks.find(task => task.textContent == arg);
        }
    }

    move(draggedId, dropedOnId) {
        let dragged = this.getTask(draggedId);
        console.log(dragged);
        if(draggedId > dropedOnId) { // put on top and move others down
            this.tasks.splice(draggedId, 1);
            this.tasks = this.tasks.slice(0, dropedOnId)
                .concat(dragged)
                .concat(this.tasks.slice(dropedOnId, this.tasks.length));
        } else if(draggedId < dropedOnId) {
            this.tasks.splice(draggedId, 1);
            this.tasks = this.tasks.slice(0, dropedOnId)
                .concat(dragged)
                // .concat(this.tasks.slice(dropedOnId, this.tasks.length))
        }
        this.refreshId();
    }

    refreshId() {
        this.tasks.forEach((task, index) => {
            task.id = index+1;
        })
    }

    
}

class Task {

    id;
    textContent;
    completed = false;

    constructor(text) {
        this.textContent = text;
    }

    get id() {
        return this.id;
    }

    set id(id) {
        this.id = id;
    }

    edit(newTextContent) {
        this.textContent = newTextContent;
    }

    complete(status) {
        status ? this.completed = true : this.completed = false;
    }
}