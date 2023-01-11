//Delay function similar to roblox 'task.wait()'
function wait(n) {
    return new Promise(function (resolve) {
        setTimeout(resolve, n * 1000);
    });
}

function showWelcomeScreen() {
    alert('Welcome to the Higher Lower game!')
    alert('Q: How do I play? A: Place a bet, press Computer Throw, choose between Higher/Lower/Draw, press on Player Throw')
}

//If answer is under 18 then re-prompt user with the same question
function checkAge() {
    const answer = prompt('How old are you', '0')
    if (answer < 18) {
        checkAge()
    } else {
        return answer
    }
}

//If name is empty then re-prompt user with same question
function askName() {
    const answer = prompt('Username', 'John Doe')
    if (answer == '') {
        askName()
    } else {
        return answer
    }
}

const age = checkAge()
showWelcomeScreen()
const username = askName()

//Here we are setting all the variables needed for our functions
let credits = 50
let betPlaced = false

const resultLog = []

const higherRadio = document.querySelector('.higherRadio')
const lowerRadio = document.querySelector('.lowerRadio')
const drawRadio = document.querySelector('.drawRadio')

const resultTextLabel = document.querySelector('.result')
const creditsTextLabel = document.querySelector('.credits')
const turnTextLabel = document.querySelector('.turn')

const bettingNumber = document.querySelector('.bettingAmount')

const rollButton1 = document.querySelector('.rollbutton1')
const rollButton2 = document.querySelector('.rollbutton2')

const scoreText1 = document.querySelector('.scoreText1')
const scoreText2 = document.querySelector('.scoreText2')

//session data is a dictionairy that holds are session data such as the rolled number of the dices and scores of the players
const sessionData = {
    num1: null,
    num2: null,
    score1: 0,
    score2: 0,
}

//These 2 variables are used as debounces to prevent the players from spamming buttons
let button1rolled = false
let button2rolled = false


async function determineWinner() {
    console.log('Determining Winner')

    //Storing the numbers in a variable so we can them in a clearer way 
    const playerNum = sessionData.num1 
    const computerNum = sessionData.num2

    //Reset player dice numbers to null so the game can continue 
    sessionData.num1 = null
    sessionData.num2 = null

    //Get the selected radio value
    const selectedMode = document.querySelector('input[name="higherLower"]:checked').value

    //function for if the player wins
    function win(multiplier) {
        console.log('Won')

        if (!multiplier) { multiplier = 1 }

        sessionData.score1 += 1
        scoreText1.innerHTML = sessionData.score1

        credits += bettingNumber.valueAsNumber * multiplier

        resultTextLabel.innerHTML = 'Result: Win'
    }

    //function for if the player loses
    function lose() {
        console.log('Lost')

        sessionData.score2 += 1
        scoreText2.innerHTML = sessionData.score2

        credits -= bettingNumber.valueAsNumber

        resultTextLabel.innerHTML = 'Result: Lose'

        //if the credits are 0 or below
        if (credits <= 0) {
            alert("You're out of credits... :(")
            window.location.replace("/index.html")
        }
    }

    if (selectedMode == 'higher') { //HIGHER
        if (playerNum > computerNum) { //win
            win()
        } else { //lose
            lose()
        }
    } else if (selectedMode == 'lower') { //LOWER
        if (playerNum < computerNum) { //win
            win()
        } else { //lose
            lose()
        }
    } else { //DRAW
        if (playerNum == computerNum) { //win
            win(4)
        } else { //lose
            lose()
        }
    }

    creditsTextLabel.innerHTML = credits
    resultLog.push(resultTextLabel.innerHTML)
    bettingNumber.setAttribute('max', credits)

    console.log(resultLog)

    setTimeout(() => {
        console.log('Ready')

        button2rolled = false
        button1rolled = false
        betPlaced = false
    }, 1000);
}

async function rollDice(id) {
    console.log('Rolling Dice')

    sessionData[`num${id}`] = Math.floor(Math.random() * 6) + 1;

    //A function to create a dice animation by delaying the next routine by .2 seconds
    async function diceAnimation() {
        document.querySelector(`.diceImage${id}`).setAttribute("src", `/img/dice${Math.floor(Math.random() * 6) + 1}.png`);

        await wait(.2);

        return new Promise(function (resolve) {
            resolve();
        })
    }

    turnTextLabel.innerHTML = 'Turn:'

    await diceAnimation();
    await diceAnimation();
    await diceAnimation();
    await diceAnimation();

    if (id == '2') {
        turnTextLabel.innerHTML = 'Turn: Player'
    } else {
        turnTextLabel.innerHTML = 'Turn: Computer'
    }

    document.querySelector(`.diceImage${id}`).setAttribute('src', `/img/dice${sessionData[`num${id}`]}.png`);

    return new Promise(function (resolve) {
        resolve();
    })
}

rollButton1.onclick = async function () {
    const id = '1';
    if (!document.querySelector('input[name="higherLower"]:checked')) {
        console.log('No radio has been selected')
        return;
    }

    if (sessionData.num2 == null) {
        console.log('Computer dice number is null')
        return;
    } else if (button1rolled == true) {
        console.log('Button2 already rolled')
        return;
    }

    button1rolled = true
    resultTextLabel.innerHTML = 'Result:'
    console.log('Player Button Pressed Succesfully')

    await rollDice(id);

    determineWinner();
}

rollButton2.onclick = async function () {
    const id = '2'
    if (isNaN(bettingNumber.valueAsNumber) == true) {
        console.log('bettingNumber.valueAsNumber is NaN')
        return;
    } else if (button2rolled == true) {
        console.log('Button2 already rolled')
        return;
    }

    button2rolled = true
    betPlaced = true;
    rollDice(id);
}

//Prevent the player from inserting a number higher than their credits actually are
let previousNumber;
bettingNumber.addEventListener('change', function () {
    if (betPlaced == true || bettingNumber.valueAsNumber > bettingNumber.getAttribute('max')) {
        bettingNumber.value = previousNumber;
    }

    previousNumber = bettingNumber.valueAsNumber;
})

bettingNumber.setAttribute('max', credits);
creditsTextLabel.innerHTML = `Credit: ${credits}`