/********************************************
Step 1 define functions and objects
************************************/

function Game(el) {
    var grid = 3, // number of squares per row
        size = 100, // size of each square in pixels
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
    $("#qs, .choices, .answer").hide();
    $("#playground").hide();
    $("#accountdeets").hide();
    $("#signup").hide();
    $("#rules").hide();
    $("#updateAccount").hide();
    $(".options").hide();
    $(".canvas").hide();
    $(".newGame").hide();
    $(".nextQuestion").hide();
    $(".players").hide();

    $(".ready").click(function () {
        let category = document.getElementById('query-type').value;
        let difficulty = document.getElementById('level').value;
        $(".startGame, .options").fadeOut(2000)
        setTimeout(function () {
            getTrivia(category, difficulty);
            $(".questions, .choices").fadeIn(2000)
            $(".players, .answer").fadeIn(3000)
        }, 2000, 3000);
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
    });
    $(".goBack2").click(function () {
        $("#signup").fadeOut(2000);
        $("#welcome").fadeIn(4000);
    });
    $(".showrules").click(function () {
        $("#welcome").fadeOut(2000);
        $("#rules").fadeIn(4000);
    });
    $(".nextQuestion").click(function () {
        qNum++;
        $(".canvas, .nextQuestion").fadeOut(2000);
        $('.questions').fadeOut(2000);
        generateQuestions(testBank);
    });
    $(".update").click(function () {
        $('#welcome').hide();
        $("#accountdeets").fadeOut(2000);
        $("#updateAccount").fadeIn(2000);
    });
})


/********************************************
Trivia Questions API Call
************************************/
const triviaUrl = "https://opentdb.com/api.php?amount=20&type=multiple"

function getTrivia(category, difficulty) {

    let cat = parseInt(category, 10);
    let diff = difficulty.toString();

    let param = {
        "category": cat,
        "difficulty": diff
    }

    //console.log(param);
    let buildUrl = "https://opentdb.com/api.php?amount=10&category=" + cat + "&difficulty=" + diff + "&type=multiple";

    console.log(buildUrl);

    let settings = {
        "url": buildUrl,
        "dataType": "json",
        "method": "GET",
    };
    $.ajax(settings)
        .done(function (response) {
            console.log(response);
            let testBank = response;
            generateQuestions(testBank);
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
}

let qNum = 0;

function generateQuestions(response) {
    $('.questions').html(`
        <h3 id="qs">${response.results[qNum].question}</h3>
            <form class="choices">
                <fieldset>
                    <label class="answeroption">
                    <input type="radio" name="answer" value="correct" required><span>${response.results[qNum].correct_answer}</span>
                    </label>
                    <label class="answeroption">
                    <input type="radio" name="answer" value="**questionbankanswer2**" required><span>${response.results[qNum].incorrect_answers[0]}</span>
                    </label>
                    <label class="answeroption">
                    <input type="radio" name="answer" value="**questionbankanswer3**" required><span>${response.results[qNum].incorrect_answers[1]}</span>
                    </label>
                    <label class="answeroption">
                    <input type="radio" name="answer" value="**questionbankanswer4**" required><span>${response.results[qNum].incorrect_answers[2]}</span>
                    </label>
                </fieldset>
                <button type="submit" class="clickHere answer">Answer</button>
            </form>
    `);
    checkAnswer();
}

function checkAnswer() {
    $('.choices').submit(event => {
        event.preventDefault();
        let userChoice = $('input[name="answer"]:checked').val();
        if (userChoice === "correct") {
            $(".canvas").show();
            $('.nextQuestion').show();
        } else {
            window.alert("Sorry. Wrong Answer");
            $('.nextQuestion').show();
        };
    })
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
            password: password
        };

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
                <h3 class="p1">${result.user[0].username}</h3>
                <img class="profilepic profile" src="images/ffpip.png">`);
            $('.user').html(`
            <p>Name:&ensp;<span>${result.user[0].name}</span></p>
            <p>Email Address:&ensp;<span>${result.user[0].email}</span></p>
            <p>Username:&ensp;<span>${result.user[0].username}</span></p>
            <p>Number of games played:&ensp;<span>32</span></p>
            <p>Number of games won:&ensp;<span>25</span></p>
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
function updating(_id) {

    $("#update-form").submit(event => {
        event.preventDefault();
        $("#updateAccount").fadeOut(2000);
        $("#accountdeets").fadeIn(4000);

        let userId = _id;
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
            _id: userId
        };

        console.log(updateUser);

        $.ajax({
                type: "PUT",
                url: '/users/:_id',
                data: JSON.stringify(updateUser),
                dataType: 'json',
                contentType: 'application/json'
            })
            .done(function (result) {
                console.log(result);
                $("#updateAccount").fadeOut(2000);
                populateUserDetails(resutlt.username);
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
    })
}