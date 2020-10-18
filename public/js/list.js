
// Click on a close button to hide the current list item
var closeFeatures = document.getElementsByClassName("closef");
var closeLanguages = document.getElementsByClassName("closel");
var closeSprints = document.getElementsByClassName("closes");

const close = (closeType, arr, inp, key) => {
  for (let i = 0; i < closeType.length; i++) {
    closeType[i].onclick = function() {
      this.parentElement.style.display = "none";
      arr[i][key] = "";
      inp.value = JSON.stringify(arr);
    };
  }
}

// Function for redirecting enter keys
const hitEnter = function(inp, btn){
  document.getElementById(inp).addEventListener("keydown", function(event){
    if (event.keyCode === 13) {
      event.preventDefault();
      document.getElementById(btn).click();
    }
  });
};

// Functions to create <li>

// create <li> for features and languages and load it with a span that will close it and remove the entry from the array
const createLi_1 = (innerText, count, listName, spanClasses, liClasses) => {
    let li = document.createElement("li");
    document.getElementById(listName).appendChild(li).setAttribute("class", liClasses);
    li.innerHTML = innerText;
    li.setAttribute("data-id", count);
    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = spanClasses;
    span.appendChild(txt);
    li.appendChild(span);
}
// creates <li> for sprints, loading is more complex because of sprint levels that get colors based on the level as well as cross off function, all of this gets added to the array
const createLi_2 = function(innerText, count, isChecked, sprintNum){
  let li = document.createElement("li");
  li.innerHTML = innerText;
  li.setAttribute("data-id", count);
  document.getElementById("sUL").appendChild(li);
  //Event listener to cross out text
  if (isChecked) {
    li.classList.add('checked');
  }
  li.setAttribute("onclick", "this.classList.toggle('checked')");
  li.addEventListener("click", function() {
    if (sprints[this.dataset.id]["checked"] === false) {
      sprints[this.dataset.id]["checked"] = true;
    } else {
      sprints[this.dataset.id]["checked"] = false;
    }
    sprintInput.value = JSON.stringify(sprints);
  })
// sets up all the options as well as the color classes associated with them
  var select = document.createElement("select");
  for (i = 1; i < 11; i++) {
    var option = document.createElement("option");
    option.value = i;
    option.className = "color" + i;
    option.innerHTML = i;
    if (i === sprintNum) {
      option.selected = 'selected';
      li.classList.add("color" + i);
    }
    select.appendChild(option);
  }
  select.className = "bt-outline bt-gray-text bt-input-framing bt-pos-right";
  // Sets up change and event listeners for sprint levels to change the sprint level color, change the data in the array, and sets up a stop propogation for the select area to prevent from crossing out
  select.setAttribute("data-name", innerText);
  select.addEventListener("change", function() {
    if (sprints[this.parentElement.dataset.id]["checked"]) {
      this.parentElement.className = this.options[this.selectedIndex].className + " checked";
    } else {
      this.parentElement.className = this.options[this.selectedIndex].className;
    }
    sprints[this.parentElement.dataset.id]["sprint_num"] = select.value
    sprintInput.value = JSON.stringify(sprints);
  });
  select.setAttribute("onclick", "event.stopPropagation();")
  li.appendChild(select);
  // close button creation
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full closes";
  span.setAttribute("onclick", "event.stopPropagation();")
  span.appendChild(txt);
  li.appendChild(span);
}


// Desired Features, first sets up DOM objects to capture and load arrays and load <li> items already stored, then a function to create new items
hitEnter("df-input", "df-btn");
var dfInput = document.getElementById("features");
var features = JSON.parse(dfInput.value);
let countDF = 0;
if (features != []) {
  features.forEach((item) => {
    createLi_1(item["feature"], countDF, "dfUL", "close close-full closef", "");
    countDF++;
  });
  close(closeFeatures, features, dfInput, "feature");
}
function newDF() {
  var inputValue = document.getElementById("df-input").value;
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    createLi_1(inputValue, countDF, "dfUL", "close close-full closef", "");
    features[countDF] = {"id": 0, "feature": inputValue};
    dfInput.value = JSON.stringify(features);
    countDF++
  }
  document.getElementById("df-input").value = "";

  close(closeFeatures, features, dfInput, "feature");
}

// Languages and Platforms
hitEnter("language-input", "lang-btn");
var langInput = document.getElementById("languages");
var languages = JSON.parse(langInput.value);
let countLP = 0;
if (languages != []) {
languages.forEach((item) => {
      createLi_1(item["language"], countLP, "lpUL", "close close-badge closel", "badge badge-pill badge-primary bt-badge");
      countLP++;
  });
  close(closeLanguages, languages, langInput, "language");
}
function newLP() {
  var inputValue = document.getElementById("language-input").value;

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    createLi_1(inputValue, countLP, "lpUL", "close close-badge closel", "badge badge-pill badge-primary bt-badge");

    languages[countLP] = {"id": 0, "language": inputValue};
    langInput.value = JSON.stringify(languages);
    countLP++
  }
  document.getElementById("language-input").value = "";

  close(closeLanguages, languages, langInput, "language");
}

// Sprints
hitEnter("sprints-input", "sprint-btn");
var sprintInput = document.getElementById("sprints");
var sprints = JSON.parse(sprintInput.value);
let countSP = 0;
if (sprints != []) {
  sprints.forEach((item) => {
    createLi_2(item.sprint, countSP, item["is_checked"], item.sprint_num);
    countSP++;
  });
  close(closeSprints, sprints, sprintInput, "sprint");
}

function newSprint() {
  var inputValue = document.getElementById("sprints-input").value;

  // If input value is not empty, loads the <li> and sets it up with an id, loads the input value to the id key, updates sprints var, and increases count
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    let checked = false;
    createLi_2(inputValue, countSP, false, 1);
    sprints[countSP] = {
      "id": 0,
      "sprint": inputValue,
      "sprint_num": "1",
      "checked": checked
    };
    sprintInput.value = JSON.stringify(sprints);()
    countSP++;
  }
  document.getElementById("sprints-input").value = "";

  close(closeSprints, sprints, sprintInput, "sprint");
}
