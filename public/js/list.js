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


// Create a new list item when clicking on the "Add" button
function newDF() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("desired_features").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("dfUL").appendChild(li);
  }
  document.getElementById("desired_features").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}

// Languages and Platforms
function newLP() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("language-input").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("lpUL").appendChild(li).setAttribute("class", "badge badge-pill badge-primary bt-badge");
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
    }
  }
}

// Sprints
function newSprint() {
  var li = document.createElement("li");
  li.className = "color1";
  li.setAttribute("onclick", "this.classList.toggle('checked')")
  var inputValue = document.getElementById("sprints-input").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("sUL").appendChild(li);
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
  select.setAttribute("onchange", "this.parentElement.className=this.options[this.selectedIndex].className");
  select.setAttribute("onclick", "event.stopPropagation();")
  li.appendChild(select);
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close close-full";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}

// var list = document.querySelector('ul');
// Add a "checked" symbol when clicking on a list item
// list.addEventListener('click', function(ev) {
//   if (ev.target.tagName === 'LI') {
//     ev.target.classList.toggle('checked');
//   }
// }, false);
