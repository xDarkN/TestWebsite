'use strict';

/* Checking if there is a localStorage item called 'tasks'. If there is, it is parsing it into an array
and then stringifying it and saving it back into localStorage. If there isn't, it is creating an
empty array and saving it into localStorage. */

if (localStorage.getItem("tasks")) {
  const taskArray = JSON.parse(localStorage.getItem('tasks'));
  localStorage.setItem('tasks', JSON.stringify(taskArray));
} else {
  const taskArray = [];
  localStorage.setItem('tasks', JSON.stringify(taskArray));
}

/**
 * It returns the number of days left in the current month.
 * @param year - The current year
 * @param month - The current month
 * @returns The number of days left in the current month.
 */

const dateTitle = document.querySelector("#date");
const date = new Date();

const days = {
  0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
  4: "Thursday", 5: "Friday", 6: "Saturday"
};

const abbreviatedDays = {
  0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed",
  4: "Thu", 5: "Fri", 6: "Sat"
};

const months = {
  0: "January", 1: "February", 2: "March", 3: "April",
  4: "May", 5: "June", 6: "July", 7: "August",
  8: "September", 9: "October", 10: "November", 11: "December"
};

const maxDaysPerMonth = {
  0: "January", 1: "February", 2: "March", 3: "April",
  4: "May", 5: "June", 6: "July", 7: "August",
  8: "September", 9: "October", 10: "November", 11: "December"
};

const dateComplete =    months[date.getMonth()]+ ", " +
                        days[date.getDay()] + " " +
                        date.getDate();

dateTitle.innerHTML = dateComplete;

function GetDaysLeft(year, month){
    const daysLeft = new Date(year, month, 0);
    return daysLeft.getDate();
}

const currentDay = date.getDate();
const currentYear = date.getFullYear();
const month = date.getMonth() + 1;
const daysLeft = GetDaysLeft(currentYear,month);






/* Creating a div element for each day of the month and appending it to the calendar div. */

var daysArray = []

var tasksDaysDesign = JSON.parse(localStorage.getItem('tasks'));
const calendar = document.getElementById("calendar")


for (let i = currentDay; i <= daysLeft; i++) {

    let spansToFill = [];

    for (let index = 0; index < tasksDaysDesign.length; index++) {
        let date_task = new Date(tasksDaysDesign[index].date);
        date_task = date_task.getDate() + 1;

        if(i == date_task){
            spansToFill.push(tasksDaysDesign[index].category);
        }
    }

    function fillSpan(){

        var returnItem = "";

        if(spansToFill.includes("Development")){
            returnItem = returnItem + "<span class='span-type span-type-development'></span> \n";
        }
        if(spansToFill.includes("University")){
            returnItem = returnItem + "<span class='span-type span-type-university'></span> \n";
        }
        if(spansToFill.includes("Home")){
            returnItem = returnItem + "<span class='span-type span-type-home'></span> \n";
        }

        return returnItem;

    }


    let div = document.createElement("div");
    i == currentDay ? div.className = "day-box date-selected date-selected-color" : div.className = "day-box no-selected";
    div.id = i;

    let dayCalendar = new Date(currentYear, month - 1, i);

    div.innerHTML = `<p class='day-number'>${i}</p>
                    <p class='day-name'>${abbreviatedDays[dayCalendar.getDay()]}</p>
                    <div class='div-prueba'>
                    ${fillSpan()}
                    </div>`
                    ;

    calendar.appendChild(div)

    var elementCalendar = document.getElementById(i);
    daysArray.push(elementCalendar);
}
















/**
 * It removes the class "date-selected-color" from all the elements in the array "daysArray" except the
 * one that was clicked, then adds the class "date-selected-color" to the element that was clicked.
 */
const changeDayInformation = function () {
	let daySelected = this;

    for (let i = 0; i < daysArray.length; i++) {
        if(i != daySelected){
            daysArray[i].classList.remove("date-selected-color")
            daysArray[i].classList.remove("date-selected")
            daysArray[i].classList.add("no-selected");
        }
    }

    daySelected.classList.add("date-selected-color")
    daySelected.classList.add("date-selected")
    daySelected.classList.remove("no-selected")

    updateDisplay()

}

/* The following code is adding an event listener to each day of the week. */

daysArray.forEach(days => { days.addEventListener("click", changeDayInformation)});

/* The following code is adding an event listener to each of the divs. When the div is clicked, the class
is added to the div. This code works only to change some styles.*/

const form = document.getElementById("form")

const developDiv = document.getElementById("develop-div");
const universityDiv = document.getElementById("university-div");
const homeDiv = document.getElementById("home-div");

developDiv.addEventListener("click", () => {
    universityDiv.classList.remove("university-selected");
    homeDiv.classList.remove("home-selected");
    developDiv.classList.add("develop-selected");
},false);

universityDiv.addEventListener("click", () => {
    developDiv.classList.remove("develop-selected");
    homeDiv.classList.remove("home-selected");
    universityDiv.classList.add("university-selected");
},false);

homeDiv.addEventListener("click", () => {
    developDiv.classList.remove("develop-selected");
    universityDiv.classList.remove("university-selected");
    homeDiv.classList.add("home-selected");
},false);


/* Adding an event listener to the button with the id of "create-task" and when the button is clicked
it will run the function changeDisplay() */

const changeButton = document.getElementById("create-task");
const tasks = document.getElementById("tasks");
const formAddTask = document.getElementById("form-add-tasks");

changeButton.addEventListener("click", () => {
    changeDisplay()
},false)

/**
 * The following code changes the styles of the button and top title when you change sections.
 */

function changeDisplay(){

    if(dateTitle.classList.contains("sectionSide")){
        changeButton.classList.add("sectionSide")
        dateTitle.classList.remove("sectionSide")

        calendar.style.display = "flex";
        tasks.style.display = "block";
        formAddTask.style.display = "none";
        dateTitle.innerHTML = dateComplete;
        changeButton.style.backgroundImage = "url({{ url_for('static', filename='assets/add.svg') }})";

        updateDisplay();

    }else{

        changeButton.classList.remove("sectionSide")
        dateTitle.classList.add("sectionSide")

        calendar.style.display = "none";
        tasks.style.display = "none";
        formAddTask.style.display = "block";
        dateTitle.innerHTML = "Create new Task";
        changeButton.style.backgroundImage = "url(static/assets/back.svg)"

    }

}

/**
 * It takes the tasks from localStorage, filters them by the day selected, and then displays them in
 * the HTML.
**/

function updateDisplay(){
console.log("updateDisplay");
    let updatedTasks = [];
    updatedTasks = JSON.parse(localStorage.getItem('tasks'));
    let dayButtonSelected = parseInt(document.getElementsByClassName("date-selected")[0].id);

    tasks.innerHTML = ""

    var tasksArray = [];

    updatedTasks.forEach(element => {

        let elementDate = element.date;
        let  elementDay = elementDate.split('-');

        if(elementDay[2] == dayButtonSelected){
            tasksArray.push(element);
        }

    });

    if(tasksArray.length >= 1){

        tasksArray.forEach(element => {

        let div = document.createElement("div");

        var divTextColor = "";
        var divMarginColor = "";

        if(element.category == "Development"){
            divTextColor = "type-development";
            divMarginColor = "event-development";
        }else if(element.category == "University"){
            divTextColor = "type-university";
            divMarginColor = "event-university";
        }else{
            divTextColor = "type-home";
            divMarginColor = "event-home";
        }



        div.innerHTML = `

        <div class="event-card">
                <div class="type ${divTextColor}">
                    <p>${element.category}</p>
                </div>
                <div class="event-content ${divMarginColor}">
                    <img src="/static/assets/delete.png" class="delete-task m-${dayButtonSelected}">
                </div>
                <div class="event-content ${divMarginColor}">
                    <img src="/static/assets/menu-card.png" class="menu-card m-${dayButtonSelected}">
                    <h3>${element.name}</h3>
                    <p>${element.comment}</p>
                </div>
                <div class="event-info">
                    <div class="time">${element.startTime} - ${element.finishTime}</div>
                    <div class="status">Active</div>
                </div>
            </div>

        `;

        tasks.appendChild(div)

        });

    }else{

        tasks.innerHTML = ` <p style="text-align: center; margin: 30px;">
                                There are no tasks for this day, press the button to create a new
                            </p>
                            <button onclick="changeDisplay()" id="new-task-secondary" style="width: 100px; display: block; margin: auto; background: var(--blue-main-bg-color); padding: 20px;border-radius: 25px;cursor: pointer;">
                                      <img src="/static/assets/add.svg">
                            </button>
                            `
    }


}


function clearTasks() {
    console.log("clear_tasks");
    fetch('/clear_tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        updateDisplay(); // Update the UI after clearing tasks
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


/**
 * When the save button is clicked, the form is blurred and the task-saved div is displayed. After one
 * second, the blur is removed and the task-saved div is hidden.
 */

function saveAnimation(){
    const taskSavedDiv = document.getElementById("task-saved");
    form.style.filter = "blur(1.5px)";
    taskSavedDiv.style.display = "block";

    setTimeout(() => {
        form.style.filter = "blur(0)";
        taskSavedDiv.style.display = "none";
        changeDisplay()
        location.reload()
    },1500);
}

/**
 * It takes a task object, parses the localStorage item 'tasks' into an array, pushes the task object
 * into the array, and then stringifies the array and saves it back into localStorage.
 * @param task - the task object
 */


   function deleteTask(taskId) {
    console.log("Task ID:", taskId); // Add this line to check the received taskId

    fetch('/delete_task', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            taskId: taskId
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
        // Handle the response and perform any necessary actions
        // For example, you can remove the deleted task from the UI
        // using JavaScript DOM manipulation.
        updateDisplay(); // Call the updateDisplay() function to update the UI
    })
    .catch(error => {
        console.error('Error:', error);
    });
}



function saveTaskToDatabase(task) {
  $.ajax({
    url: "/save_task",
    type: "POST",
    data: JSON.stringify(task),
    contentType: "application/json",
    success: function (response) {
      console.log("Task saved successfully!");

      // Update the UI
      var taskArray = [];
      taskArray = JSON.parse(localStorage.getItem("tasks"));
      taskArray.push(task);
      localStorage.setItem("tasks", JSON.stringify(taskArray));

      saveAnimation();
      updateDisplay(); // Update the UI display
    },
    error: function (error) {
      console.error("Error saving task:", error);
    },
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  var data = new FormData(form);

  var taskName = data.get("task-name");
  var taskDate = data.get("datepicker");
  var taskStartTime = data.get("task-start-time");
  var taskFinishTime = data.get("task-finish-time");
  var taskInfo = data.get("task-info");
  var taskCategory = data.get("category");

  if (
    taskName == "" ||
    taskDate == "" ||
    taskStartTime == "" ||
    taskFinishTime == "" ||
    taskCategory == ""
  ) {
    const error = document.getElementById("error");
    error.classList.add("error");
    error.innerHTML = "There are fields that you still have to fill out";
  } else {
    error.classList.remove("error");
    error.innerHTML = "";

    class Task {
      constructor(
        name,
        date,
        stime,
        ftime,
        category,
        comment = ""
      ) {
        this.comment = comment;
        this.category = category;
        this.startTime = stime;
        this.finishTime = ftime;
        this.date = date;
        this.name = name;
      }
    }

    var newTask = new Task(
      taskName,
      taskDate,
      taskStartTime,
      taskFinishTime,
      taskCategory,
      taskInfo
    );

    form.reset();
    saveTaskToDatabase(newTask);
  }
});


/** Code creates a new time div taking into account the start time */

var inputStartTime = document.getElementById("task-start-time");
var inputEndTime = document.getElementById("task-finish-time");
var taskTimeDiv = document.getElementById("task-time-div");

inputStartTime.addEventListener("mouseleave", function(){

    var inputStartTime = document.getElementById("task-start-time");
    var inputEndTime = document.getElementById("task-finish-time");

    taskTimeDiv.removeChild(inputEndTime);

    let input = document.createElement("input");
    input.name = "task-finish-time";
    input.id = "task-finish-time";
    input.classList.add("timepicker2");
    input.autocomplete = "false";

    taskTimeDiv.appendChild(input);

    setTimeout(() => {
        inputStartTime = document.getElementById("task-start-time");
        var startNumber = 0
        var startTime =inputStartTime.value
        startNumber = startTime.split(':');
        var secondNumber = startNumber[1].split(" ");

        $('.timepicker2').timepicker({
            timeFormat: 'h:mm p',
            interval: 30,
            minTime:  startNumber + ":" + secondNumber[0]+""+secondNumber[1],
            maxTime: '11:59 PM',
            defaultTime: startNumber + ":" + secondNumber[0],
            startTime: startNumber + ":" + secondNumber[0],
            dynamic: false,
            dropdown: true,
            scrollbar: true
        });
    },)
})


/**
 * It deletes tasks from the local storage that are older than today's date.
 */

function deleteTaskPastDays(){
console.log("deleteTaskPastDays");
    var taskArray = [];
    taskArray = JSON.parse(localStorage.getItem('tasks'));
    var newTaskArray = []

    taskArray.forEach(task => {

        var dateFullYear = date.getFullYear();
        var dateFullMonth = parseInt(date.getMonth());
        var dateFullDay = parseInt(date.getDate()-1);

        const TodaysDate = new Date(dateFullYear,dateFullMonth,dateFullDay, 18, 0, 0);
        var taskDate = new Date(task.date);

        if(taskDate >= TodaysDate){
            newTaskArray.push(task);
        }

        localStorage.setItem('tasks', JSON.stringify(newTaskArray));
        updateDisplay();
    });

}

/* The above code is using the jQuery UI datepicker and timepicker plugins to create a datepicker and
timepicker. */

$(function () {
    $("#datepicker").datepicker();
    });

$('.timepicker').timepicker({
    timeFormat: 'h:mm p',
    interval: 30,
    minTime: '00:00am',
    maxTime: '11:30pm',
    defaultTime: '24',
    startTime: '1',
    dynamic: false,
    dropdown: true,
    scrollbar: true
});

$('#datepicker').datepicker({
    dateFormat: "yy-mm-dd",
    minDate: 0
});


deleteTaskPastDays();
updateDisplay();