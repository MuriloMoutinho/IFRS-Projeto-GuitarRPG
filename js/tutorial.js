const URL = "https://teachablemachine.withgoogle.com/models/NGhcnziL-/";

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
  webcam = new tmImage.Webcam(126, 126, flip);
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
      prediction[i].className === "cura" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      if (player.health.usage === 0) {
        window.alert("voce não possui mais curas");
      } else {
        await action(() => healthLife(player));
      }
    } else if (
      prediction[i].className === "defesa" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      await action(() => defend(player));
    } else if (
      prediction[i].className === "ataque" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      await action(giveDamege);
    } else if (
      prediction[i].className === "especial" &&
      prediction[i].probability.toFixed(2) == 1
    ) {
      if (player.especial.usage === 0) {
        window.alert("voce não possui mais especiais");
      } else {
        await action(giveEspecial);
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
  damage: 2,
  life: 10,
  especial: {
    damage: 3,
    usage: 1,
  },
  health: {
    usage: 1,
    powerHealth: 5,
  },
  defending: false,
};

var entitys = [
  {
    name: "Slime",
    damage: 1,
    life: 10,
    defending: false,
    death: false,
    divInfos: {
      image: "../../assets/slime.gif",
      imageId: "slimeImage",
    },
  },
  {
    name: "Slime",
    damage: 1,
    life: 10,
    defending: false,
    death: false,
    divInfos: {
      image: "../../assets/slime.gif",
      imageId: "slime2Image",
    },
  },
];

//--------------------------------------------------------------------------------------------------

async function giveDamege() {
  var entitysLifes = entitys.filter((entity) => !entity.death);
  var enemyIndex = Math.floor(Math.random() * entitysLifes.length);

  var enemy = entitysLifes[enemyIndex];

  jogadorDiv.classList.add("jogadorAtacando");
  await new Promise((resolve) => setTimeout(resolve, 500));
  jogadorAtaqueDiv.classList.remove("hide");
  await new Promise((resolve) => setTimeout(resolve, 500));
  jogadorAtaqueDiv.classList.add("hide");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  jogadorDiv.classList.remove("jogadorAtacando");

  receivedDamege(enemy, player.damage);
}

async function giveEspecial() {
  var entitysLifes = entitys.filter((entity) => !entity.death);

  jogadorDiv.classList.add("jogadorEspecial");
  await new Promise((resolve) => setTimeout(resolve, 500));
  jogadorEspecialDiv.classList.remove("hide");
  await new Promise((resolve) => setTimeout(resolve, 500));
  jogadorEspecialDiv.classList.add("hide");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  jogadorDiv.classList.remove("jogadorEspecial");

  entitysLifes.forEach((entity) => {
    if (entity.defending) {
      entity.life -= Math.round(player.especial.damage / 2);
      entity.defending = false;
    } else {
      entity.life -= player.especial.damage;
    }
  });
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
  entity.life += entity.health.powerHealth;
  entity.health.usage--;

  jogadorCuraDiv.classList.remove("hide");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  jogadorCuraDiv.classList.add("hide");
}

async function defend(entity) {
  entity.defending = true;
}

//--------------------------------------------------------------------------------------------------

async function runRoundEnemy() {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  var actionIndex = Math.floor(Math.random() * 7);

  var entitysLifes = entitys.filter((entity) => !entity.death);
  var enemy = entitysLifes[roundEnemy];

  if (actionIndex <= 4) {
    receivedDamege(player, enemy.damage);

    var imageEnemy = document.querySelector(`#${enemy.divInfos.imageId}`);
    imageEnemy.classList.add("inimigoAtacando");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    imageEnemy.classList.remove("inimigoAtacando");
  } else {
    defend(enemy);
  }
}

//--------------------------------------------------------------------------------------------------

async function action(action) {
  await action();
  refreshGame();

  refreshRounds();

  await runRoundEnemy();
  refreshGame();

  refreshRounds();
  roundEnemy++;
  round++;
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
const curasDiv = document.querySelector("#curas");

const jogadorDiv = document.querySelector("#jogador");
const jogadorDefesaDiv = document.querySelector("#defendingPlayer");
const jogadorCuraDiv = document.querySelector("#healthPlayer");
const jogadorEspecialDiv = document.querySelector("#especialPlayer");
const jogadorAtaqueDiv = document.querySelector("#attackPlayer");

const enemysDiv = document.querySelector("#inimigos");

function refreshStatusEnemys() {
  enemysDiv.innerHTML = "";
  entitys.forEach((entity) => {
    if(entity.death){
      enemysDiv.innerHTML += `
      <div class="inimigo">
        <img src="../../assets/lapide.png">
      </div>
      `;
    }else{
      enemysDiv.innerHTML += `
      <div class="inimigo">
        ${
          entity.defending
            ? "<img class='escudo_inimigo' src='../../assets/shild.png'>"
            : ""
        }
        <img
          src="${entity.divInfos.image}"
          id="${entity.divInfos.imageId}"
          class="imagem_inimigo"
        />
        <div class="vida_inimigo">
        <span>${entity.life}</span>
        </div>
      </div>
      `;
    }
  });
}

function refreseStatusPlayer() {
  lifeDiv.innerHTML = player.life;
  defendDiv.innerHTML = player.defending ? "Defendendo" : "Exposto";
  roundDiv.innerHTML = round;
  especialDiv.innerHTML = player.especial.usage;
  curasDiv.innerHTML = player.health.usage;

  if (player.defending) {
    jogadorDefesaDiv.classList.remove("hide");
  } else {
    jogadorDefesaDiv.classList.add("hide");
  }
}

function refreshRounds() {
  var countEnemysLifes = entitys.filter((entity) => !entity.death).length;
  if (roundEnemy >= countEnemysLifes) {
    roundEnemy = 0;
  }
}

function verifyLifes() {
  if (player.life <= 0) {
    window.alert("Você morreu");
    window.location.href = "../../index.html";
  }

  var entitysDeath = entitys.filter((entity) => entity.life <= 0);
  entitysDeath.forEach((entity) => {
    entity.death = true;
    entity.life = 0;
  });
  if (entitysDeath.length === entitys.length) {
    window.alert("Você ganhou");
    window.location.href = "../level1/level1.html";
  }
}

//--------------------------------------------------------------------------------------------------

refreseStatusPlayer();
refreshStatusEnemys();
