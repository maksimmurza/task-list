export {todo};

class ToDo {

    #activeInterval;

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
        interval = interval.toLowerCase();
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

    getLocalTasks() {
        if(!localStorage.getItem('todo')) {
            localStorage.setItem('todo', JSON.stringify(this));
        } else {
            let localTodo = JSON.parse(localStorage.getItem('todo'));
            for (let key in localTodo) {
                let interval = localTodo[key];
                interval.tasks.forEach(task => {
                    this[key].addTask(task.textContent, task.completed, 'local');
                });
            }
        }
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

    addTask(textContent, completed, local) {
        if(typeof textContent == 'string') {
            let task = new Task(textContent, completed);
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

    getTask(taskId) {
        if(typeof taskId == 'number') {
            return this.tasks.find(task => task.id == taskId);
        } else if(typeof taskId == 'string') {
            return this.tasks.find(task => parseInt(task.id) == taskId);
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

    constructor(text, status) {
        this.textContent = text;
        this.completed = this.completed || status;
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

    complete() {

        // localStorage
        let localTodo = JSON.parse(localStorage.getItem('todo'));

        if(this.completed) {
            this.completed = false;
            localTodo[this.interval].tasks[this.id].completed = false;
        } else {
            this.completed = true;
            localTodo[this.interval].tasks[this.id].completed = true;
        }

        localStorage.setItem('todo', JSON.stringify(localTodo));
    }
}

// Making default intervals
let today = new Interval('today'),
    tomorrow = new Interval('tomorrow'),
    week = new Interval('week'),
    month = new Interval('month');

today.active = true;
let todo = new ToDo(today, tomorrow, week, month);
todo.getLocalTasks();
