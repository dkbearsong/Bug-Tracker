// Code needs some refactoring after adding ability to load up projects page

// Create a "close" button and append it to each list item
var myNodelist = document.getElementById("projectPage").getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var closeFeatures = document.getElementsByClassName("closef");
var closeLanguages = document.getElementsByClassName("closel");
var closeSprints = document.getElementsByClassName("closes");


// Function to create <li> getElementsByTagName
const createLi_1 = (innerText, count, listName, spanClasses, liClasses) => {
    let li = document.createElement("li");
    document.getElementById(listName).appendChild(li).setAttribute("class", liClasses);
    li.innerHTML = innerText;
    li.setAttribute("data-id", count);   //May want to set this to a count rather than an id and then create a id data attribute to hold the actual id
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = spanClasses;
    span.appendChild(txt);
    li.appendChild(span);
}
const createLi_2 = (innerText, count, isChecked, sprintNum) => {
  let li = document.createElement("li");
  li.setAttribute("onclick", "this.classList.toggle('checked')")
  document.getElementById("sUL").appendChild(li);
  var sprintInput = document.getElementById("sprints");
  li.innerHTML = innerText;
  li.setAttribute("data-id", count);
  if (isChecked === true) {
    this.classList.toggle('checked')
  }
  li.addEventListener("click", function() {
    sprints[this.dataset.id]["checked"] = !sprints[this.dataset.id]["checked"];
    sprintInput.value = JSON.stringify(sprints);
  })
  var select = document.createElement("select");
  for (i = 1; i < 11; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.className = "color" + i;
    option.innerHTML = i;
    if (i === sprintNum) {
      option.selected = 'selected';
      li.className = "color" + i;
    }
    select.appendChild(option);
  }
  select.className = "bt-outline bt-gray-text bt-input-framing bt-pos-right";
  const changeSprintLvl = function(sp) {
    sprints[sp]["sprint_num"] = select.value
    sprintInput.value = JSON.stringify(sprints);
  };
  // Sets up change and event listeners
  select.setAttribute("data-name", innerText);
  select.setAttribute("onchange", "this.parentElement.className=this.options[this.selectedIndex].className;");
  select.addEventListener("change", function() {
    changeSprintLvl(this.parentElement.dataset.id)
  });
  select.setAttribute("onclick", "event.stopPropagation();")
  li.appendChild(select);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full closes";
  span.setAttribute("onclick", "event.stopPropagation();")
  span.appendChild(txt);
  li.appendChild(span);
}

// Desired Features
var features = JSON.parse(document.getElementById("features").value);
let countDF = 0;
if (features != {}) {
  Object.keys(features).forEach((item) => {
    createLi_1(features[item]["feature"], countDF, "dfUL", "close close-full closef", "");
    countDF++;
  });
}

function newDF() {
  var inputValue = document.getElementById("df-input").value;
  var dfInput = document.getElementById("features");

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    createLi_1(inputValue, countDF, "dfUL", "close close-full closef", "");
    features[countDF] = {"id": 0, "feature": inputValue};
    dfInput.value = JSON.stringify(features);
    countDF++
  }
  document.getElementById("df-input").value = "";

  for (let i = 0; i < closeFeatures.length; i++) {
    closeFeatures[i].onclick = function() {
      this.parentElement.style.display = "none";
      features[i]["feature"] = "";
      dfInput.value = JSON.stringify(features);
    };
  }
}

// Languages and Platforms
var languages = JSON.parse(document.getElementById("languages").value);
let countLP = 0;
if (languages != {}) {
  Object.keys(languages).forEach((item) => {
      createLi_1(languages[item]["language"], countLP, "lpUL", "close close-badge closel", "badge badge-pill badge-primary bt-badge");
      countLP++;
  });
}

function newLP() {
  var inputValue = document.getElementById("language-input").value;

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    createLi_1(inputValue, countLP, "lpUL", "close close-badge closel", "badge badge-pill badge-primary bt-badge");
    var langInput = document.getElementById("languages");
    languages[countLP] = {"id": 0, "language": inputValue};
    langInput.value = JSON.stringify(languages);
    countLP++
  }
  document.getElementById("language-input").value = "";

  for (let i = 0; i < closeLanguages.length; i++) {
    closeLanguages[i].onclick = function() {
      this.parentElement.style.display = "none";
      languages[i]["language"] = "";
      langInput.value = JSON.stringify(languages);
    }
  }
}

// Sprints
var sprints = JSON.parse(document.getElementById("sprints").value);
let countSP = 0;
if (sprints != {}) {
  Object.keys(sprints).forEach((item) => {
    createLi_2(sprints[item].sprint, countSP, sprints[item].is_checked, sprints[item].sprint_num);
    countSP++;
  });
}

function newSprint() {
  var inputValue = document.getElementById("sprints-input").value;

  // If input value is not empty, loads the <li> and sets it up with an id, loads the input value to the id key, updates sprints var, and increases count
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    var sprintInput = document.getElementById("sprints");
    let checked = false;
    createLi_2(inputValue, countSP, false, 1);
    sprints[countSP] = {
      "id": 0,
      "sprint": inputValue,
      "sprint_num": "1",
      "checked": checked
    };
    sprintInput.value = JSON.stringify(sprints);
    countSP++;
  }
  document.getElementById("sprints-input").value = "";

  // Deletes the li
  for (let i = 0; i < closeSprints.length; i++) {
    closeSprints[i].onclick = function() {
      this.parentElement.style.display = "none";
      sprints[i]["sprint"] = "";
      sprintInput.value = JSON.stringify(sprints);
    }
  }
}
