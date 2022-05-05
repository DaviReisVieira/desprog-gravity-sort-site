const maxIntSize = 25;
const margin = 20;
const beadSize = 15;
const beadSpacing = beadSize + 2;
const outputBuffer = 50;
const dt = 0.05;
const gravity = 20;

function getX(lineNum) {
  return lines[lineNum].translation._x;
}

function makeBead(x, y, color) {
  var bead = two.makeCircle(x, y, beadSize);
  bead.stroke = "invisible";
  bead.fill = color;
  return bead;
}

function plotNumber(num) {
  if (isNaN(num)) {
    alert("Digite um número válido");
    throw "Digite um número válido";
  }

  if (num > maxIntSize) {
    alert("O número " + num + " é maior que " + maxIntSize);
    throw "O número " + num + " é maior que " + maxIntSize;
  }

  if (num <= 0) {
    alert("Número deve ser maior que zero");
    throw "Número deve ser maior que zero";
  }

  var y = height - (margin + (beadSize + beadSpacing) * numbers.length);

  if (y <= margin) {
    alert("Número máximo de linhas atingido!");
    throw "Número máximo de linhas atingido!";
  }

  var beads = [];

  var color = "#" + Math.floor(Math.random() * 16777215).toString(16);

  for (var i = 0; i < num; i++) {
    var bead = makeBead(getX(i), y, color);
    bead.dy = 0;
    beads.push(bead);
  }

  var text = two.makeText(num, innerWidth - outputBuffer, y);

  numbers.push({
    value: num,
    beads,
    text,
  });

  two.update();
}

function computeDrops() {
  var dropTable = [];
  for (var i = 0; i < numbers.length; i++) {
    dropTable.push([]);
    for (var j = 0; j < maxIntSize; j++) {
      dropTable[i].push([0, false]);
    }
  }

  for (var i = 0; i < numbers.length; i++) {
    var currentNum = numbers[i].value;
    for (var j = 0; j < currentNum; j++) {
      if (i == 0) {
        dropTable[i][j] = [0, true];
      } else {
        dropTable[i][j] = dropTable[i - 1][j];
        if (dropTable[i][j][1] === false) {
          dropTable[i][j] = [dropTable[i][j][0], true];
        }

        numbers[i].beads[j].dy = dropTable[i][j][0] * (beadSize + beadSpacing);
      }
    }
    for (var j = currentNum; j < maxIntSize; j++) {
      if (i != 0) {
        dropTable[i][j] = [dropTable[i - 1][j][0] + 1, false];
      } else {
        dropTable[i][j] = [1, false];
      }
    }
  }

  return dropTable;
}

function sort() {
  dropBeads(updateNumbers);
}

function updateNumbers() {
  var sortedNumbers = numbers
    .map(function (e) {
      return e.value;
    })
    .sort(function (a, b) {
      return b - a;
    })
    .forEach(function (num, i) {
      numbers[i].text.value = num;
    });

  two.update();
}

function dropBeads(callback) {
  if (isSorting) {
    return;
  }
  isSorting = true;
  var dropTable = computeDrops();
  var dy = beadSize + beadSpacing;
  var t = dt;

  interval = setInterval(function () {
    var delta = gravity * Math.pow(t, 2);
    var anyDrops = false;
    for (var i = 0; i < numbers.length; i++) {
      var beads = numbers[i].beads;
      for (var j = 0; j < beads.length; j++) {
        if (beads[j].dy > 0) {
          anyDrops = true;
          var currentDelta = delta;
          if (beads[j].dy - currentDelta < 0) {
            currentDelta = beads[j].dy;
          }

          beads[j].dy -= currentDelta;
          beads[j].translation.y += currentDelta;
        }
      }
    }
    two.update();
    if (!anyDrops) {
      clearInterval(interval);
      callback();
    }
    t += dt;
  }, 1000 * dt);
}

function makeLines() {
  var innerWidth = width - margin * 2 - outputBuffer;
  var lines = [];

  var maxX = parseInt(innerWidth / maxIntSize) * (maxIntSize - 1);
  var bonusMargin = (innerWidth - maxX) / 2;

  for (var i = 0; i < maxIntSize; i++) {
    var x = parseInt(innerWidth / maxIntSize) * i + margin + bonusMargin;
    var y = 0;
    lines.push(two.makeLine(x, y, x, height));
  }
  two.update();
  return lines;
}

var lines, numbers, elem, width, height, two, interval, isSorting;

function reset() {
  isSorting = false;
  clearInterval(interval);
  document.getElementById("two").innerHTML = "";
  lines = [];
  elem = document.getElementById("two");
  width = document.body.offsetWidth;
  height = document.body.offsetHeight;
  two = new Two({ width, height }).appendTo(elem);

  numbers = [];
  lines = makeLines();
  two.update();

  // clear numbers list
  document.getElementById("numbers").innerHTML = "";
}

reset();

const input = document.getElementById("numInput");

function addNumber() {
  if (isSorting) {
    reset();
  }
  var number = parseInt(input.value);
  input.value = "";
  plotNumber(number);

  // add number in ul list
  var ul = document.getElementById("numbers");
  var li = document.createElement("li");
  li.appendChild(document.createTextNode(number));
  ul.appendChild(li);
}

input.onkeydown = function (e) {
  // if key is 'enter', add
  if (e.keyCode == 13) {
    addNumber();
  }
};

document.onkeydown = function (e) {
  if (e.keyCode == 83) {
    sort();
  } else if (e.keyCode == 81) {
    reset();
  }
};

document.getElementById("addNumber").onclick = addNumber;
document.getElementById("sort").onclick = sort;
document.getElementById("reset").onclick = reset;

window.onresize = reset;
