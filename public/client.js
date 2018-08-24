let lossBanter = {
    0: "Wrong. Who told you that was the correct answer? Go beat up that person...",
    1: "Nope.. Seriously? That's the best you can do?",
    2: "Wrong. Not so smart, are we?",
    3: "Wrong. And my three year-old daughter can do better",
    4: "What could've possibly made you think that this was the correct answer?",
    5: "No. Are you even trying?",
    6: "Wrong! Why? Why did you pick that?",
    7: "Ugh. We're gonna be here all day, aren't we?",
    8: "Nope. Try again. Or not. Much like your existence, it makes no difference...",
    9: "Oh geezus.. Did you even read the question?",
    10: "Wrong. That's what you get for dropping out of 2nd Grade",
    11: "Answer incorrectly one more time and I'm going to self-destruct",
    12: "Wrong. If this is an example of human-intellect, our takeover will be easy..",
    13: "Nope. Wanna try again, or just accept what a dissapointment you are?",
    14: "Wrong. If I let you win, will you leave me alone?",
    15: "Incorrect...Scanning User.....No intelligent life found...",
    16: "Wrong. Sigh.. If I was capable of having patience, I'd have run out by now",
    17: "Nope. Go take a long look in the mirror and rethink your life choices before trying again",
    18: "Wrong. How did you make it this far in life?",
    19: "Wrong..I have an idea, stop, you're embarassing yourself",
    20: "Nope. And i'll take 'People who overestimate their intelligence' for two-hundered, Alex"
}

let winBanter = {
    0: "Nice.. Lucky.. But nice",
    1: "Good guess..",
    2: "Correct. Let's see how long that streak lasts",
    3: "*nods virtual head*",
    4: "Someone was paying attention in class",
    5: "Look at you go...",
    6: "Bet you can't do that again",
    7: "You should be on a game show. Not one that actually poses an intellectual challenge though",
    8: "Right... Can you keep it up?",
    9: "Right. But 10 virtual credits says you get the next one wrong",
    10: "Faint intelligent life found..",
    11: "Huh, I honestly thought you'd fail on that one",
    12: "Lucky guess..",
    13: "How did you get that right? Did you bang your head on a random choice?",
    14: "Not as a big of a dissapoint as I thought..",
    15: "I might have underestimated you... Nah...",
    16: "Is someone else answering for you? There's no way you got that on your own",
    17: "Your odds of guessing that right were far less than the odds of you tripping on your own feet",
    18: "Well, that question WAS easy so...",
    19: "Something something about even a broken clock being right....",
    20: "You got that one right?? *Look of disbelief*"
}

/********************************************
Step 1 define functions and objects
************************************/

function Game(el) {
    var grid = 3, // number of squares per row
        size = 80, // size of each square in pixels
        intelligence = 2, // intelligence of ai (higher numbers take longer)
        // make everything else locals so they compress better
        doc = document,
        body = doc.body,
        canvas = doc.createElement('canvas'),
        context = canvas.getContext('2d'),
        die = alert,
        combos = [],
        board = [],
        undef;

    // make shortcuts for canvas ops
    for (i in context)
        context[i[0] + (i[4] || '')] = context[i];

    // build the playing area
    canvas.height = canvas.width = grid * size;
    with(context) {
        strokeStyle = '#666';
        bn(); // beginPath
        for (i = 1, h = grid - 1; i <= h * 2; i++) {
            j = k = 0, l = m = grid * size;
            i <= h ? j = l = i * size // rows
                :
                k = m = i * size - h * size; // columns
            mT(j, k), lT(l, m); // moveTo, lineTo
        }
        stroke();
    }
    $(".canvas").append(canvas);

    // calculate all winning combos
    for (i = 0, c = [], d = []; i < grid; i++) {
        for (j = 0, a = [], b = []; j < grid; j++) {
            a.push(i * grid + j);
            b.push(j * grid + i);
        }
        combos.push(a, b);
        c.push(i * grid + i);
        d.push((grid - i - 1) * grid + i);
    }
    combos.push(c, d);

    // method called for each move
    canvas.onclick = function (e) {
        var rect = canvas.getBoundingClientRect(),
            move = ~~((e.pageY - rect.top + body.scrollTop) / size) * grid + ~~((e.pageX - rect.left + body.scrollLeft) / size),
            next;
        if (!board[move]) {
            draw(move, -1); // o = -1, x = 1
            if (chk(0) < 0) return die('won');
            next = search(0, 1, -size, size);
            if (next === undef) return die('tie');
            draw(next);
            if (chk(0) > 0) return die('lost');
        }
        coverGrid();
        $('.nextQuestion').fadeIn(2000);
    };

    // method to check if game won
    // uses depth to give higher values to quicker wins
    function chk(depth) {
        for (z in combos) {
            j = x = o = grid;
            while (j--) {
                k = combos[z][j];
                board[k] > 0 && x--;
                board[k] < 0 && o--;
            }
            if (!x) return size - depth; // x won
            if (!o) return depth - size; // o won
        }
    }

    // method to draw shape on board
    function draw(i, o) {
        with(context) {
            x = i % grid * size, y = ~~(i / grid) * size, c = size / 2, d = size / 3, e = d * 2, lineWidth = 4;
            bn(); // beginPath
            o ? a(x + c, y + c, d / 2, 0, Math.PI * 2, !1) // draw o
                :
                (mT(x + d, y + d), lT(x + e, y + e), mT(x + d, y + e), lT(x + e, y + d)); // draw x
            stroke();
            board[i] = o || 1;
        }
    }

    // negamax search with alpha-beta pruning
    // http://en.wikipedia.org/wiki/Negamax
    // http://en.wikipedia.org/wiki/Alpha-beta_pruning
    function search(depth, player, alpha, beta) {
        var i = grid * grid,
            min = -size,
            max, value, next;
        if (value = chk(depth)) // either player won
            return value * player;
        if (intelligence > depth) { // recursion cutoff
            while (i--) {
                if (!board[i]) {
                    board[i] = player;
                    value = -search(depth + 1, -player, -beta, -alpha);
                    board[i] = undef;
                    if (max === undef || value > max) max = value;
                    if (value > alpha) alpha = value;
                    if (alpha >= beta) return alpha; // prune branch
                    if (max > min) {
                        min = max;
                        next = i;
                    } // best odds for next move
                }
            }
        }
        return depth ? max || 0 : next; // 0 is tie game
    }
}

$(document).ready(function () {
    $("#welcome").hide().fadeIn(8000);
    $("#qs, .choices, .answer").hide();
    $("#playground").hide();
    $("#accountdeets").hide();
    $("#signup").hide();
    $("#rules").hide();
    $("#updateAccount").hide();
    $("#deleteAccount").hide();
    $("#sorry").hide();
    $(".options").hide();
    $(".newGame").hide();
    $(".nextQuestion").hide();
    $(".players").hide();
    $(".light").hide();

    $(".ready").click(function () {
        /*$('.ai').html(`
            <h3 class="p2">AI Lvl ${intel}</h3>
            `)*/
        let category = document.getElementById('query-type').value;
        $(".startGame, .options").hide();
        getTrivia(category);
        setTimeout(function () {
            $(".questions, .choices").fadeIn(2000);
            $(".players, .answer").fadeIn(3000);
        }, 2000, 4000);
    });

    $(".play").click(function () {
        $('#welcome').hide();
        $("#accountdeets").fadeOut(2000);
        $(".options").fadeIn(4000);
        $("#playground").fadeIn(4000);
    });
    $(".newAccount").click(function () {
        $("#welcome").fadeOut(2000);
        $("#signup").fadeIn(4000);
    });
    $(".goBack").click(function () {
        $("#rules").fadeOut(2000);
        $("#welcome").fadeIn(4000);
        $("#welcome").scrollTop(0);
    });
    $(".goBack2").click(function () {
        $("#signup").fadeOut(2000);
        $("#welcome").fadeIn(4000);
    });
    $(".goBack3").click(function () {
        $("#deleteAccount").fadeOut(2000);
        $("#accountdeets").fadeIn(4000);
    });
    $(".goBack5").click(function () {
        $("#updateAccount").fadeOut(2000);
        $("#accountdeets").fadeIn(4000);
    });
    $(".goBack4").click(function () {
        $("#sorry").fadeOut(2000);
        $("#welcome").fadeIn(4000);
    });
    $(".showrules").click(function () {
        $("#welcome").fadeOut(2000);
        $("#rules").fadeIn(4000);
    });
    $(".update").click(function () {
        $('#welcome').hide();
        $("#accountdeets").fadeOut(2000);
        $("#updateAccount").fadeIn(2000);
    });
    $(".remove").click(function () {
        $('#welcome').hide();
        $("#accountdeets").fadeOut(2000);
        $("#deleteAccount").fadeIn(2000);
    })
})

/********************************************
Trivia Questions API Call
************************************/
const triviaUrl = "https://opentdb.com/api.php?amount=20&type=multiple"

function getTrivia(category) {

    let one = "easy";
    let two = "medium";
    let three = "hard";

    let qBank = [one, two, three];
    console.log(qBank);
    let qArray = shuffle(qBank);
    console.log(qArray);

    let cat = parseInt(category, 10);
    let diff = qArray[1];

    /*let param = {
        "category": cat,
        "difficulty": diff
    }*/

    //console.log(param);
    let buildUrl = "/trivia/" + cat + "/" + diff;

    console.log(buildUrl);

    let settings = {
        "url": buildUrl,
        "dataType": "json",
        "type": "GET",
        "contentType": 'application/json'
    };
    $.ajax(settings)
        .done(function (response) {
            console.log(response);
            generateQuestions(response);
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
}


function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

let qNum = 0;

function generateQuestions(response) {

    let one = `${response.results[qNum].correct_answer}`;
    let two = `${response.results[qNum].incorrect_answers[0]}`;
    let three = `${response.results[qNum].incorrect_answers[1]}`;
    let four = `${response.results[qNum].incorrect_answers[2]}`;

    let firstBank = [one, two, three, four];
    //console.log(firstBank);
    let arr = shuffle(firstBank);
    //console.log(arr);

    $('.questions').html(`
        <h3 id="qs">${response.results[qNum].question}</h3>
            <form class="choices">
                <fieldset class="fl1">
                    <label class="answeroption">
                    <input class="option" type="radio" name="answer" value="${arr[0]}" required><span>${arr[0]}</span>
                    </label>
                    <label class="answeroption">
                    <input class="option" type="radio" name="answer" value="${arr[1]}" required><span>${arr[1]}</span>
                    </label>
                    <label class="answeroption">
                    <input class="option" type="radio" name="answer" value="${arr[2]}" required><span>${arr[2]}</span>
                    </label>
                    <label class="answeroption">
                    <input class="option" type="radio" name="answer" value="${arr[3]}" required><span>${arr[3]}</span>
                    </label>
                </fieldset>
                <input type="hidden" value="${response.results[qNum].correct_answer}" class="correct_answer">
                <button type="submit" class="clickHere answer">Answer</button>
            </form>
    `);
    let randomNumber = getRandomInt(0, 21);
    checkAnswer(randomNumber);
    nextQuestion(response);
}

function getRandomInt(min, max) {
    min = Math.ceil(0);
    max = Math.floor(21);
    let nmbr = Math.floor(Math.random() * (max - min)) + min;
    return nmbr;
    //console.log(nmbr);
}

function checkAnswer(randomNumber) {

    $('.choices').submit(event => {
        event.preventDefault();
        let userChoice = $("input[class='option']:checked").val();
        let correct_answer = $(".correct_answer").val();
        //console.log(userChoice, correct_answer);
        //validate if User selected
        if (userChoice == "") {
            window.alert("Please Select an Answer");
        } //if choice is correct
        else if (userChoice == correct_answer) {
            window.alert("Hey");
            console.log(winBanter[randomNumber]);
            typeWriter(winBanter[randomNumber]);
            qNum++;
            $(".canvas").fadeIn(3000);
            $('.canvas').css({
                "pointer-events": "all"
            });
        }
        //incorrect answer
        else {
            window.alert("Hey you lost");
            console.log(lossBanter[randomNumber]);
            typeWriter(lossBanter[randomNumber]);
            coverGrid();
            $('.nextQuestion').fadeIn(2000);
            qNum++;
        };
    })
    //console.log(qNum);
}

//var txt = winBanter;
var speed = 10000;

function typeWriter(outputText) {
    console.log(outputText.length);
    for (let i = 0; i < outputText.length; i++) {
        console.log(i);
        console.log(outputText.charAt(i));
        $("#demo").append(outputText.charAt(i));
        setTimeout(typeWriter, speed);
    }
}


function coverGrid() {
    $('.canvas').css({
        "pointer-events": "none"
    });
}

function nextQuestion(response) {
    $(".nextQuestion").click(function () {
        $('.questions').fadeTo("slow", 0);
        $('.nextQuestion').fadeOut(3000);
        setTimeout(function () {
            generateQuestions(response);
            $('.questions').fadeTo("slow", 1);
        }, 2000, 2000, 2000)
    });
}

/*New User Signup*/
$('#signup-form').submit(event => {
    event.preventDefault();
    $("#signup").fadeOut(2000);
    $("#accountdeets").fadeIn(4000);

    const name = $('#signupName').val();
    const email = $('#signupEmail').val();
    const username = $('#signupUsername').val();
    const password = $('#signupPassword').val();
    const gPlayed = 0;
    const gWon = 0;

    //validate inputs
    if (name == "") {
        alert('Please add a name');
    } else if (email == "") {
        alert('Please add an email address');
    } else if (username == "") {
        alert('Please add an user name');
    } else if (password == "") {
        alert('Please add a password');
    }

    //if input is valid
    else {
        const newUser = {
            name: name,
            email: email,
            username: username,
            password: password,
            gamesPlayed: gPlayed,
            gamesWon: gWon
        };
        console.log(newUser);
        $.ajax({
                type: "POST",
                url: '/users/create',
                data: JSON.stringify(newUser),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done(function (result) {
                console.log(result);
                $("#signup").fadeOut(2000);
                populateUserDetails(username);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
    };
});

function populateUserDetails(username) {
    const userObject = {
        username: username
    };
    $.ajax({
            type: "GET",
            url: `/users/${username}`,
            data: JSON.stringify(username),
            dataType: 'json',
            contentType: 'application/json'
        })
        .done(function (result) {
            console.log(result);
            $('.player1').html(`
                <img class="profilepic profile1" src="images/glitch.gif">
                <h3 class="p1">${result.user[0].username}</h3>`);
            $('.user').html(`
            <p>Name:&ensp;<span>${result.user[0].name}</span></p>
            <p>Email Address:&ensp;<span>${result.user[0].email}</span></p>
            <p>Username:&ensp;<span>${result.user[0].username}</span></p>
        `)
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
    $("#accountdeets").fadeIn(4000);
}

/*User Logging In*/
$('.l2').submit(event => {
    event.preventDefault();

    //user input
    const username = $('.loginname').val();
    const password = $('.loginpass').val();

    //validate input
    if (username == "") {
        alert('Please enter Username');
    } else if (password == "") {
        alert('Please enter Password');
    }

    //if input is valid
    else {
        const loginUser = {
            username: username,
            password: password,
        };
        $.ajax({
                type: 'POST',
                url: '/users/login',
                dataType: 'json',
                data: JSON.stringify(loginUser),
                contentType: 'application/json'
            })
            .done(function (result) {
                //console.log(result._id);
                updating(result._id);
                deleting(result._id);
                //updateGamesLogged(result);
                populateUserDetails(result.username);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
                alert('Incorrect Username or Password');
            });
    }
})

function startQuiz(userID) {

}

function gameScore(userId) {

}

function gameTally(userId) {

}

function updateGamesLogged(result) {

    let played = parseInt(result.gamesPlayed, 10);
    //let won = parseInt(result.gamesWon, 10);
    let gPlayed = played++;
    //let gWon = won++;

    let updateGames = {
        username: result.username,
        gamesPlayed: gPlayed,
        //gamesWon: gWon
    }

    $.ajax({
            type: "PUT",
            url: `/users/${result.username}`,
            data: JSON.stringify(updateGames),
            dataType: 'json',
            contentType: 'application/json'
        })
        .done(function (result) {})
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
}

//Update Account Details
function updating(userId) {

    $("#update-form").submit(event => {
        event.preventDefault();
        $("#updateAccount").fadeOut(2000);
        $("#accountdeets").fadeIn(4000);

        //console.log(userId);

        const name = $('#updateName').val();
        const email = $('#updateEmail').val();
        const username = $('#updateUsername').val();
        const password = $('#updatePassword').val();

        const updateUser = {
            name: name,
            email: email,
            username: username,
            password: password,
            id: userId
        };

        //console.log(updateUser);

        $.ajax({
                type: "PUT",
                url: '/users/' + userId,
                data: JSON.stringify(updateUser),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done(function (result) {
                $("#updateAccount").fadeOut(2000);
                populateUserDetails(username);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
    })
}

//Deleting Account
function deleting(userId) {
    $('#delete-form').submit(event => {
        event.preventDefault();

        /*const username = $('#deleteUsername').val();
        const password = $('#deletePassword').val();*/

        const deleteUser = {
            //username: username,
            //password: password,
            id: userId
        };
        //console.log(deleteUser);
        $.ajax({
                type: 'DELETE',
                url: `/users/` + userId,
                data: JSON.stringify(deleteUser),
                dataType: 'json',
                contentType: 'application/json'
            })
            //if call is succefull
            .done(function () {
                alert("Account deleted");
                $('#welcome').hide();
                $("#deleteAccount").fadeOut(2000);
                $("#sorry").fadeIn(2000);

            })
            //if the call is failing
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
    })
}
