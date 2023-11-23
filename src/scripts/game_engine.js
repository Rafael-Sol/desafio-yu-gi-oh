// GAME_ENGINE.JS DO DESAFIO DE YUGI-OH
// POR RAFAEL_SOL_MAKER (RSM)
// EDITADO: 23/11/23

// Variáveis de Estado do Jogo
const gameState = {
    view:{
        selectedCardElementName: document.querySelector("#element_name"),
        selectedCardElementInfo: document.querySelector("#element_icon"),
        selectedCardView: document.querySelector("#card_image"),
        selectedCardName: document.querySelector("#card_name"),

        instructions: document.querySelector(".instructions"),
        playerBankArea: document.querySelector(".player_field"),
        enemyBankArea: document.querySelector(".enemy_field"),

        cardPlayerArena: document.querySelector("#card_player_arena"),
        cardEnemyArena: document.querySelector("#card_enemy_arena"),

        buttonDuel: document.querySelector(".duel-button"),
        buttonContinue: document.querySelector(".continue-button"),
        buttonReset: document.querySelector(".reset-button"),

        scoreWin: document.querySelector("#score_win a"),
        scoreDraw: document.querySelector("#score_draw a"),
        scoreLose: document.querySelector("#score_lose a"),
    },
    values:{
        selectedCard: -1,
        cardsPlayed: 0,
        winsPlayer: 0,
        winsEnemy: 0,
        drawGames: 0,
        gameEnded: false,
    },
    consts:{
        totalUniqueCards: 3,
        maxCardsPerPlayer: 9,
    },
    timers: {/* NÃO HÁ DESSA VEZ! */},
    strings:{
        cardSelect: "Selecione uma carta para jogar",
        cardReady: "Clique em ''Duelo!'' para prosseguir!",
        cardEnemy: "Você não pode selecionar um card do seu inimigo!",
        cardNotSelected: "Você precisa selecionar um card para jogar!",
        cardUsed: "A carta selecionada já foi utilizada!",
        youWin: "Você venceu essa rodada!",
        youLose: "Você perdeu essa rodada!",
        drawGame: "A rodada empatou!",
        reset: "Deseja recomeçar o jogo?",
        gameOver: "Fim de jogo! Deseja jogar novamente?",
        gameOverWin: "O jogo acabou!<br>Parabéns, você venceu o jogo!",
        gameOverDraw: "O jogo acabou!<br>O resultado final foi um empate!",
        gameOverLose: "O jogo acabou!<br>Infelizmente não foi dessa vez...",
    },
};

// Cards utilizados no jogo
const gameCards = [];
gameCards.push({id: 0, name: "Blue-eyed White Dragon",           element: "Attribute: Scisors", elemSrc: "../../assets/extras/scisors.png",
    src: "../../assets/icons/dragon.png", winsFrom: [2], losesFrom: [1]});
gameCards.push({id: 1, name: "Exodia",                  element: "Attribute: Rock", elemSrc: "../../assets/extras/rock.png",
    src: "../../assets/icons/exodia.png", winsFrom: [0], losesFrom: [2]});
gameCards.push({id: 2, name: "Dark Magician",  element: "Attribute: Paper", elemSrc: "../../assets/extras/paper.png",
    src: "../../assets/icons/magician.png", winsFrom: [1], losesFrom: [0]});

// =====================================================================
//  EVENT LISTENERS E EVENTOS AFINS
// =====================================================================

gameState.view.buttonDuel.addEventListener("click", clickDuel);
gameState.view.buttonContinue.addEventListener("click", clickContinue);
gameState.view.buttonReset.addEventListener("click", clickReset);

function clickDuel() {
    if (gameState.values.selectedCard < 0) {
        alert(gameState.strings.cardNotSelected)
        return;
    }
    // It's duel time!!!
    useSelectedCard();
}

async function clickContinue() {
    newRound();
}

function clickReset(resetGame = true) {
    let reset = false;
    if (resetGame == true) reset = confirm(gameState.strings.gameOver);
    else  reset = confirm(gameState.strings.reset);
    if (reset == true) initGame();
}

// =====================================================================
//  FUNÇÕES PRINCIPAIS DA LÓGICA DO JOGO
// =====================================================================

// Verifica informação de carta no painel da esquerda
function clickPlayerCard(cardData, cardPosition, element) {

    // Verificar cards já usados
    if (element.classList.contains("used")) {
        alert(gameState.strings.cardUsed);
        return;
    }

    // Vejamos se o jogo acabou
    if (gameState.values.gameEnded) return;

    // Caso o player clique no card sem clicar em continuar antes
    newRound();

    // Atualiza informação da carta escolhida
    updateCardInfo(cardData);
    gameState.values.selectedCard = cardPosition;
    clearSelectedCards();
    element.classList.add("selected");
    // Atualiza textos
    const text = gameState.strings.cardReady;
    setTextInstructions(text);
}

function updateCardInfo (cardData) {
    gameState.view.selectedCardView.setAttribute("src", cardData.src);
    gameState.view.selectedCardElementInfo.setAttribute("src", cardData.elemSrc);
    gameState.view.selectedCardName.innerHTML = cardData.name;
    gameState.view.selectedCardElementName.innerHTML = cardData.element;
    gameState.view.buttonDuel.classList.remove("down");
}

function clearSelectedCards() {
    const cardsPlayer = document.querySelectorAll(".card_player");
    cardsPlayer.forEach(card => {
        card.classList.remove("selected")
    });
}

function useSelectedCard() {
    const cardsPlayer = document.querySelectorAll(".card_player");
    cardsPlayer.forEach(card => {
        if (card.classList.contains("selected")) {

            // Prepara a carta
            // card.classList.remove("selected");

            // Limpa todas as cartas pra prevenir erros
            // caso haja mais de uma selecionada
            clearSelectedCards();
            card.classList.add("used");

            // Hora de irmos para a arena de duelos!
            const enemyCard = enemyPickCard();
            const cardId = Number(card.dataset.id);
            const enemyCardId = Number(enemyCard.dataset.id);

            // Prepara as  cartas para a batalha e BOOM!
            flipEnemyCard(enemyCard);
            duelCards(cardId, enemyCardId);

            // Torna o botão de continuar visível
            gameState.view.buttonContinue.classList.remove("invisible");

            // Limpa carta usada
            gameState.view.buttonDuel.classList.add("down");
            gameState.values.selectedCard = -1;
            // Prepara a nova rodada
            clearCardInfo();

            // Será que acabaram as cartas?
            gameState.values.cardsPlayed++
            checkGameOver();

            return; // Retorna na primeira chance.
        }
    }); // for each
}

function enemyPickCard() {
    // Há outras maneiras mais eficientes, mas essa aqui é interessante
    const cards = document.querySelectorAll(".card_enemy");
    var cardChosen = undefined;
    var usedCard = true;

    while (usedCard === true) {
        // Gera um número aleatório para ser o card
        let randomCard = generateRandomCard();
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (Number(card.dataset.pos) === randomCard) {
                // Achamos o nosso card, será que ele já foi usado?
                if (card.classList.contains("used")) {
                    // Card já escolhido, hora de buscar outro
                    break; // Quebra o for, sorteia outro número
                } else {
                    // Poderemos usar o seguinte card
                    cardChosen = card;
                    usedCard = false;
                    break; // Quebra o for, já temos nosso card escolhido
                }
            }
        }
        if (usedCard == false) break; // Quebra o while
    }
    // Ssaindo do loop com o card
    return cardChosen;
}

function flipEnemyCard(card) {
    card.classList.add("used");
    cardData = findCardData(Number(card.dataset.id));
    card.innerHTML = "";
    const cardImg = document.createElement("img");
    cardImg.setAttribute("src", cardData.src);
    card.appendChild(cardImg);
}

async function duelCards(cardId, enemyCardId) {
    // Mostra as cartas na arena
    const playerData = gameCards.find((card) => card.id === cardId);
    const enemyData = gameCards.find((card) => card.id === enemyCardId);
    gameState.view.cardPlayerArena.setAttribute("src", playerData.src);
    gameState.view.cardEnemyArena.setAttribute("src", enemyData.src);

    // -------------------------------------
    // HORA DE IMPLEMENTAR A LÓGICA DE DUELO

    // Dados do jogador
    const playerId = playerData.id;
    const playerWins = playerData.winsFrom;
    const playerLoses = playerData.losesFrom;
    let playerScore = 0;

    // Dados do inimigo
    const enemyId = enemyData.id;
    const enemyWins = enemyData.winsFrom;
    const enemyLoses = enemyData.losesFrom;
    let enemyScore = 0;

    // Lógica simples de contar os pontos
    let drawScore = 0;
    if (playerId == enemyId) drawScore++;
    if (playerWins.includes(enemyId)) playerScore++;
    if (enemyWins.includes(playerId)) enemyScore++;

    // Atualiza os placares
    updateScore('player', playerScore);
    updateScore('enemy', enemyScore);
    updateScore('draw', drawScore);

    // Quem ganhou a rodada? Atualiza os textos
    let text;
    if (playerScore == enemyScore) { // Ainda o empate
        text = gameState.strings.drawGame;
        playDraw();
    } else if (enemyScore > playerScore) { // Perdemo
        text = gameState.strings.youLose;
        playLose();
    } else { /* playerScore > enemyScore */ // Agora sim!!
        text = gameState.strings.youWin;
        playWin();
    }
    setTextInstructions(text);
}

function updateScore(type, value) {
    switch (type) {
    case 'player':
        gameState.values.winsPlayer += value;
        gameState.view.scoreWin.innerHTML = gameState.values.winsPlayer;
        break;
    case 'enemy':
        gameState.values.winsEnemy += value;
        gameState.view.scoreLose.innerHTML = gameState.values.winsEnemy;
        break;
    case 'draw':
        gameState.values.drawGames += value;
        gameState.view.scoreDraw.innerHTML = gameState.values.drawGames;
        break;
    }
}

function checkGameOver() {
    if (gameState.values.cardsPlayed >= gameState.consts.maxCardsPerPlayer) {
        gameState.values.gameEnded = true;
        const scorePlayer = gameState.values.winsPlayer;
        const scoreEnemy = gameState.values.winsEnemy;
        const scoreDraw = gameState.values.drawGames;
        let text;
        if (scorePlayer == scoreEnemy) { // Dá-se o empate
            text = gameState.strings.gameOverDraw;
        } else if (scoreEnemy > scorePlayer) { // Perdemo
            text = gameState.strings.gameOverLose;
        } else { /* scorePlayer < scoreEnemy */ // Agora sim!!
        text = gameState.strings.gameOverWin;
        }
        setTextInstructions(text);
        gameState.view.buttonContinue.classList.add("invisible");
        gameState.view.buttonReset.classList.remove("invisible");
        setTimeout(()=>(clickReset(true)), 500);
    }
}

// =====================================================================
//  CRIAÇÃO DE CARTAS ALEATÓRIAS
// =====================================================================

function generateRandomCard () {
    return Math.floor(Math.random()* gameState.consts.maxCardsPerPlayer);
}

async function generateRandomCardId () {
    return Math.floor(Math.random()* gameState.consts.totalUniqueCards);
}

async function createCardEnemy (cardId, cardPos) {
    // Encontra as informações de card no pool de gameCards
    const card = gameCards.find((card) => card.id === cardId);
    if (card === undefined) return;
    // Pega as informações relevantes por hora
    const cardImage = "../../assets/icons/card-back.png"; /* card.src; */
    const cardIndex = card.id;
    // Criando o elemento e colocando as propriedades nele
    const divCard = document.createElement("div");
    divCard.classList.add("card_enemy");
    divCard.setAttribute("data-id", cardIndex);
    divCard.setAttribute("data-pos", cardPos);
    // Cria a imagem interna
    const cardImg = document.createElement("img");
    cardImg.setAttribute("src", cardImage);
    // Adiciona a imagem no elemento e retorna tudo
    divCard.appendChild(cardImg);
    return divCard;
}

async function createCardPlayer (cardData, cardPos) {
    const cardImage = cardData.src;
    const cardIndex = cardData.id;
    // Criando o elemento e colocando as propriedades nele
    const divCard = document.createElement("div");
    divCard.classList.add("card_player");
    divCard.setAttribute("data-id", cardIndex);
    divCard.setAttribute("data-pos", cardPos);
    // Cria a imagem interna
    const cardImg = document.createElement("img");
    cardImg.setAttribute("src", cardImage);
    // Adiciona a imagem no elemento e retorna tudo
    divCard.appendChild(cardImg);
    return divCard;
}

function findCardData(cardId) {
    // Encontra as informações de card no pool de gameCards
    const cardData = gameCards.find((card) => card.id === cardId);
    return cardData;
}

async function shuffleCardsPlayer() {
    for (let i = 0; i < gameState.consts.maxCardsPerPlayer; i++) {
        const cardId = await generateRandomCardId();
        const cardData = /* await */ findCardData(cardId);
        const cardElement = await createCardPlayer(cardData, i);
        cardElement.addEventListener("click", (e) => clickPlayerCard(cardData, i, cardElement));
        gameState.view.playerBankArea.appendChild(cardElement);
    }
}

async function shuffleCardsEnemy() {
    for (let i = 0; i < gameState.consts.maxCardsPerPlayer; i++) {
        const cardId = await generateRandomCardId();
        const cardElement = await createCardEnemy(cardId, i);
        cardElement.addEventListener("click", clickEnemyCard);
        gameState.view.enemyBankArea.appendChild(cardElement);
    }
}

// =====================================================================
//  FUNÇÕES RELACIONADAS À ÁUDIO
// =====================================================================

function playSound(filename, format = "m4a", volume = 100.0, loop = false) {
    let audio = new Audio("../../assets/audios/"+ filename + "." + format);
    audio.volume = volume / 100.0;
    audio.loop = loop;
    audio.play();
}

function playWin() {
    playSound("win", "wav");
}

function playDraw() {
    playSound("draw", "wav");
}

function playLose() {
    playSound("lose", "m4a");
}

function playBackgroundMusic() {
    // Forçar dar o play na música
    const bgm = document.getElementById("bgm");
    bgm.play();
}


// =====================================================================
//  FUNÇÕES AUXILIARES
// =====================================================================

function setTextInstructions(text) {
    gameState.view.instructions.innerHTML = text;
}

function clearAllCards() {
    // Cards do jogador
    const playerBank = gameState.view.playerBankArea;
    clearCards(playerBank);
    // Cards do inimigo
    const enemyBank = gameState.view.enemyBankArea;
    clearCards(enemyBank);
}

function clearCards(bank) {
    while (bank.firstChild != undefined) {
        bank.removeChild(bank.lastChild);
    };
}

function clickEnemyCard() {
    alert(gameState.strings.cardEnemy);
}

function clearCardInfo () {
    gameState.view.selectedCardView.setAttribute("src", "../../assets/icons/card-front.png");
    gameState.view.selectedCardElementInfo.setAttribute("src", "../../assets/extras/none.png");
    gameState.view.selectedCardName.innerHTML = "???";
    gameState.view.selectedCardElementName.innerHTML = "???";
}

function clearScoreView() {
    gameState.view.scoreWin.innerHTML =  "0";
    gameState.view.scoreLose.innerHTML = "0";
    gameState.view.scoreDraw.innerHTML = "0";
}

// =====================================================================
//  FUNÇÕES BÁSICAS
// =====================================================================

function resetAllVariables() {
    gameState.values.gameEnded = false;
    gameState.values.selectedCard = -1;
    gameState.values.cardsPlayed = 0;
    gameState.values.winsPlayer = 0;
    gameState.values.winsEnemy = 0;
    gameState.values.drawGames = 0;
}


function newRound() {
    // Mensagem do início de jogo
    const text = gameState.strings.cardSelect;
    setTextInstructions(text);
    // Prepara os botões da interface
    gameState.view.buttonDuel.classList.add("down");
    gameState.view.buttonContinue.classList.add("invisible");
    gameState.view.buttonReset.classList.add("invisible");
    // Reseta cards da arena
    const srcImage = "../../assets/icons/card-back.png";
    gameState.view.cardPlayerArena.setAttribute("src", srcImage);
    gameState.view.cardEnemyArena.setAttribute("src", srcImage);
}

function initGame() {
    // Preparaçõers gerais
    resetAllVariables();
    clearAllCards();
    shuffleCardsPlayer();
    shuffleCardsEnemy();
    // Inicia uma nova rodada
    clearScoreView();
    clearCardInfo();
    newRound();
    playBackgroundMusic();
}

// Let's gooooo!
initGame();
