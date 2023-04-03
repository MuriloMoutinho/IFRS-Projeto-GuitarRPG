const URL = "https://teachablemachine.withgoogle.com/models/ME9WH8taA/";

const buttonInit = document.querySelector("#button-init");

buttonInit.addEventListener("click", init);

let model, webcam, labelContainer, maxPredictions;

async function init() {
  hideElement(buttonInit);

  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(150, 150, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className + ": " + prediction[i].probability.toFixed(2);

    if (
      prediction[i].className === "Class 1" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      await action(() => healthLife(player));
    } else if (
      prediction[i].className === "Class 2" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      await action(() => defend(player));
    } else if (
      prediction[i].className === "Class 3" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      await action(giveDamege);
    } else if (
      prediction[i].className === "Class 4" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      if (player.especial.usage === 0) {
        await action(giveEspecial);
        window.alert("voce não possui mais especiais");
      }
    }

    labelContainer.childNodes[i].innerHTML = classPrediction;
  }
}

function hideElement(element) {
  element.style.display = "none";
}

//--------------------------------------------------------------------------------------------------

var player = {
  name: "Jogador",
  damage: 7,
  life: 30,
  especial: {
    damage: 10,
    usage: 2,
  },
  powerHealth: 5,
  defending: false,
};

var entitys = [
  {
    name: "Slime",
    damage: 7,
    life: 10,
    powerHealth: 5,
    defending: false,
    death: false,
    divInfos: {
      id: "slime",
      image:
        "https://i.pinimg.com/originals/45/41/43/45414373211525c8c91d2fd8be5f23dc.gif",
      imageId: "slimeImage",
    },
  },
  {
    name: "Goblin",
    damage: 7,
    life: 10,
    powerHealth: 5,
    defending: false,
    death: false,
    divInfos: {
      id: "goblin",
      image:
        "https://img.itch.zone/aW1hZ2UvNTI4NTM0LzI3NTU1NzQuZ2lm/original/tRHLDs.gif",
      imageId: "goblinImage",
    },
  },
  {
    name: "Orc",
    damage: 7,
    life: 10,
    powerHealth: 5,
    defending: false,
    death: false,
    divInfos: {
      image:
        "https://i.pinimg.com/originals/f1/46/5a/f1465a4549618c496cc67ae1cf827a17.gif",
      imageId: "orcImage",
    },
  },
];

//--------------------------------------------------------------------------------------------------

async function giveDamege() {
  var entitysLifes = entitys.filter((entity) => !entity.death);
  var enemyIndex = Math.floor(Math.random() * entitysLifes.length);

  var enemy = entitysLifes[enemyIndex];

  jogadorDiv.classList.add("jogadorAtacando");

  await new Promise((resolve) => setTimeout(resolve, 1500));
  jogadorDiv.classList.remove("jogadorAtacando");

  receivedDamege(enemy, player.damage);
}

async function giveEspecial() {
  var entitysLifes = entitys.filter((entity) => !entity.death);
  var enemyIndex = Math.floor(Math.random() * entitysLifes.length);

  var enemy = entitysLifes[enemyIndex];

  jogadorDiv.classList.add("jogadorAtacando");

  await new Promise((resolve) => setTimeout(resolve, 1500));
  jogadorDiv.classList.remove("jogadorAtacando");

  if (enemy.defending) {
    damegeReceived = player.especial.damage / 2;
    enemy.defending = false;
    enemy.life -= Math.round(damegeReceived);
  } else {
    enemy.life -= player.especial.damage;
  }
  player.especial.usage--;
}

function receivedDamege(entity, damege) {
  if (entity.defending) {
    damegeReceived = damege / 2;
    entity.defending = false;
    entity.life -= Math.round(damegeReceived);
  } else {
    entity.life -= damege;
  }
}

async function healthLife(entity) {
  entity.life += entity.powerHealth;
}

async function defend(entity) {
  entity.defending = true;
}

//--------------------------------------------------------------------------------------------------

async function runRoundEnemy() {
  var actionIndex = Math.floor(Math.random() * 10);

  var entitysLifes = entitys.filter((entity) => !entity.death);
  var enemy = entitysLifes[roundEnemy];

  if (actionIndex <= 5) {
    receivedDamege(player, enemy.damage);

    var imageEnemy = document.querySelector(`#${enemy.divInfos.imageId}`);
    imageEnemy.classList.add("inimigoAtacando");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    imageEnemy.classList.remove("inimigoAtacando");
  } else if (actionIndex >= 8) {
    healthLife(enemy);
  } else {
    defend(enemy);
  }
}

//--------------------------------------------------------------------------------------------------

async function action(action) {
  console.log(roundEnemy);
  await action();
  refreshGame();

  await runRoundEnemy();
  refreshGame();

  refreshRounds();
  await new Promise((resolve) => setTimeout(resolve, 2000));
}

function refreshGame() {
  verifyLifes();
  refreshStatusEnemys();
  refreseStatusPlayer();
}

//--------------------------------------------------------------------------------------------------

var round = 0;
var roundEnemy = 0;
var atacando = false;

const lifeDiv = document.querySelector("#life");
const defendDiv = document.querySelector("#defend");
const roundDiv = document.querySelector("#round");
const especialDiv = document.querySelector("#especial");

const jogadorDiv = document.querySelector("#jogador");
const enemysDiv = document.querySelector("#inimigos");

function refreshStatusEnemys() {
  enemysDiv.innerHTML = "";
  entitys.forEach((entity) => {
    enemysDiv.innerHTML += `
              <div class="inimigo">
              ${entity.defending ? "<img src='../assets/shild.png'>" : ""}
              <img
                  src="${entity.divInfos.image}"
                  id="${entity.divInfos.imageId}"
                  />
                <div>${entity.life}</div>
              </div>`;
  });
}

function refreseStatusPlayer() {
  lifeDiv.innerHTML = player.life;
  defendDiv.innerHTML = player.defending ? "Defendendo" : "Exposto";
  roundDiv.innerHTML = round;
  especialDiv.innerHTML = player.especial.usage;
}

function refreshRounds() {
  round++;
  roundEnemy++;

  var countEnemysLifes = entitys.filter((entity) => !entity.death).length;
  if (roundEnemy >= countEnemysLifes) {
    roundEnemy = 0;
  }
}

function verifyLifes() {
  if (player.life <= 0) {
    window.alert("Voce morreu");
    location.reload();
  }

  var entitysDeath = entitys.filter((entity) => entity.life <= 0);
  entitysDeath.forEach((entity) => {
    entity.death = true;
    entity.life = 0;
  });
  if (entitysDeath.length === entitys.length) {
    window.alert("Voce ganhou");
    window.location.href = "../index.html";
  }
}

//--------------------------------------------------------------------------------------------------

refreseStatusPlayer();
refreshStatusEnemys();

async function teste() {
  await action(giveDamege);
  await action(giveDamege);
  await action(giveEspecial);
  await action(giveDamege);
  await action(giveDamege);
  await action(giveDamege);
}

teste();
