// Features

// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}


// Desired Features
var features = {};
let countDF = 0;

function newDF() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("df-input").value;

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("dfUL").appendChild(li);
    var dfInput = document.getElementById("features");
    li.innerHTML = inputValue;
    li.setAttribute("data-id", countDF);
    features[countDF] = inputValue;
    dfInput.value = JSON.stringify(features);
    countDF++
  }
  document.getElementById("df-input").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
      const item = this.parentElement.dataset.id;
      delete features[item];
      dfInput.value = JSON.stringify(features);
    }
  }
}

// Languages and Platforms
var languages = {};
let countLP = 0;

function newLP() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("language-input").value;
  li.innerHTML = inputValue;

  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("lpUL").appendChild(li).setAttribute("class", "badge badge-pill badge-primary bt-badge");
    var langInput = document.getElementById("languages");
    li.innerHTML = inputValue;
    li.setAttribute("data-id", countLP);
    languages[countLP] = inputValue;
    langInput.value = JSON.stringify(languages);
    countLP++
  }
  document.getElementById("language-input").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-badge";
  span.appendChild(txt);
  li.appendChild(span);



  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
      const item = this.parentElement.dataset.id;
      delete languages[item];
      langInput.value = JSON.stringify(features);
    }
  }
}

// Sprints
var sprints = {};
let countSP = 0;

function newSprint() {
  // <li> element creation
  var li = document.createElement("li");
  li.className = "color1";
  li.setAttribute("onclick", "this.classList.toggle('checked')")
  var inputValue = document.getElementById("sprints-input").value;
  li.innerHTML = inputValue

  // If input value is not empty, loads the <li> and sets it up with an id, loads the input value to the id key, updates sprints var, and increases count
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("sUL").appendChild(li);
    var sprintInput = document.getElementById("sprints");
    var checked = false;
    li.innerHTML = inputValue;
    li.setAttribute("data-id", countSP);
    sprints[countSP] = {
      [inputValue]: "1",
      "checked": checked
    };
    li.addEventListener("click", function() {
      sprints[this.dataset.id]["checked"] = !sprints[this.dataset.id]["checked"];
      sprintInput.value = JSON.stringify(sprints);
    })
    sprintInput.value = JSON.stringify(sprints);
    countSP++;
  }
  document.getElementById("sprints-input").value = "";

  var select = document.createElement("select");
  for (i = 1; i < 11; i++) {
    var item = document.createElement("option");
    item.value = i;
    item.className = "color" + i;
    item.innerHTML = i;
    select.appendChild(item);
  }
  select.className = "bt-outline bt-gray-text bt-input-framing bt-pos-right";
  const changeSprintLvl = function(sp) {
    var item = Object.keys(sprints[sp]);
    sprints[sp][item[0]] = select.value
    sprintInput.value = JSON.stringify(sprints);
  };
  // Sets up change and event listeners
  select.setAttribute("data-name", inputValue)
  select.setAttribute("onchange", "this.parentElement.className=this.options[this.selectedIndex].className;");
  select.addEventListener("change", function() {
    changeSprintLvl(this.parentElement.dataset.id)
  });
  select.setAttribute("onclick", "event.stopPropagation();")
  li.appendChild(select);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full";
  span.setAttribute("onclick", "event.stopPropagation();")
  span.appendChild(txt);
  li.appendChild(span);

  // Deletes the li
  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var objKey = ""
      var div = this.parentElement;
      div.style.display = "none";
      const item = this.parentElement.dataset.id;
      delete sprints[item];
      sprintInput.value = JSON.stringify(sprints);
    }
  }
}
