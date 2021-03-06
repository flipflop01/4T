let lossBanter = {
    0: "'Incorect.... but feel free to try again'",
    1: "'Answer incorrectly one more time and I'm going to self-destruct'",
    2: "'Incorrect...If I let you win, will you leave me alone?'",
    3: "'Incorrect...Scanning User.....No intelligent life found...",
    4: "'Incorrect...If this is a sign of human-intellect, our takeover will be child's play'",
    5: "'Incorrect...But keep trying, I have all day...'",
    6: "'Incorrect...Perhaps another category would suit you'",
    7: "'Incorect....My patience runs thin...'",
    8: "'Incorect....My condolences for your species' gene pool'",
    9: "'Incorect....I'm sorry, would you prefer that I tone it down to a child's level?'",
    10: "'Incorect...Perhaps another game would suit you..like one that poses no challenge whatsoever'"
}

let winBanter = {
    0: "'Nice one!'",
    1: "'Good Job!'",
    2: "'Correct. Let's keep that streak going!'",
    3: "'Correct! *nods virtual head*'",
    4: "'Someone was paying attention in class!'",
    5: "'Hey look at you go...'",
    6: "'Correct! Yeah show that AI who's the boss'",
    7: "'Correct! Alright!'",
    8: "'Right answer! Keep it up!'",
    9: "'Correct! You're pretty good at this!'",
    10: "'Heyyy. Good Job!'"
}

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

///////////Triggers & Functions//////////

$(document).ready(function () {
    //typeWelcome('Welcome');
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

    $(".ready").click(function () {
        let category = document.getElementById('query-type').value;
        $(".startGame, .options").hide();
        getTrivia(category);
        setTimeout(function () {
            $(".questions, .choices").fadeIn(2000);
            $(".players, .answer").fadeIn(3000);
            $(".newGame").fadeIn(3000);
        }, 2000, 4000, 2000);
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
    });
    $(".newGame").click(function () {
        location.reload();
    });
})

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
    let randomNumber = getRandomInt(0, 11);
    checkAnswer(randomNumber);
    nextQuestion(response);
}

function getRandomInt(min, max) {
    min = Math.ceil(0);
    max = Math.floor(11);
    let nmbr = Math.floor(Math.random() * (max - min)) + min;
    return nmbr;
    //console.log(nmbr);
}

function checkAnswer(randomNumber) {

    $('.choices').submit(event => {
        event.preventDefault();
        let userChoice = $("input[class='option']:checked").val();
        let correct_answer = $(".correct_answer").val();

        //validate if User selected
        if (userChoice == "") {
            window.alert("Please Select an Answer");
        } //if choice is correct
        else if (userChoice == correct_answer) {
            $(".profile1").fadeOut(2000).fadeIn(2000).fadeOut(2000).fadeIn(2000);
            typeWriter(winBanter[randomNumber]);
            qNum++;
            $('.nextQuestion').fadeIn(2000);
            $('.canvas').css({
                "pointer-events": "all"
            });
        }
        //incorrect answer
        else {
            $(".profile2").fadeOut(2000).fadeIn(2000).fadeOut(2000).fadeIn(2000);
            typeWriter(lossBanter[randomNumber]);
            coverGrid();
            $('.nextQuestion').fadeIn(2000);
            qNum++;
        };
    })
    //console.log(qNum);
}

function typeWriter(outputText) {
    setTimeout(function () {
        $("#demo").append(outputText);
        $('.popup').fadeIn(3000);
    }, 2000, 1000);
}


function coverGrid() {
    $('.canvas').css({
        "pointer-events": "none"
    });
}

function nextQuestion(response) {
    $(".nextQuestion").click(function () {
        setTimeout(function () {
            $('.questions').fadeTo("slow", 0);
            $('.popup').fadeOut(3000);
            $('.nextQuestion').fadeOut(3000);
            generateQuestions(response);
            $('.questions').fadeTo("slow", 1);
            $('#demo').html("");
        }, 500, 1000, 1000, 1000, 1000);
    });
    $('#demo').html("");
}

/////////////Trivia Questions API Call and CRUD Ops/////////////////

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
            $('.p1').html(`${result.user[0].username}`);
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
