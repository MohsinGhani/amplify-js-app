import Amplify, { Auth, API, graphqlOperation } from 'aws-amplify';

import awsconfig from "./aws-exports";
import { createTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

Amplify.configure(awsconfig);

async function createNewTodo() {
    const todo = {
        name: "Use AppSync",
        description: `Realtime and Offline (${new Date().toLocaleString()})`,
    };

    return await API.graphql(graphqlOperation(createTodo, { input: todo }));
}

async function getData() {
    isLoggedIn()
        .then(_ => {
            API.graphql(graphqlOperation(listTodos)).then((evt) => {
                evt.data.listTodos.items.map((todo, i) => {
                    QueryResult.innerHTML += `<p>${todo.name} - ${todo.description}</p>`;
                });
            });
        })
        .catch((err) => {
            alert("Only Authenticated Users can read and write data")
        })
}

const MutationButton = document.getElementById("MutationEventButton");
const MutationResult = document.getElementById("MutationResult");
const QueryResult = document.getElementById("QueryResult");

MutationButton.addEventListener("click", (evt) => {
    isLoggedIn()
        .then(() => {
            createNewTodo().then((evt) => {
                MutationResult.innerHTML += `<p>${evt.data.createTodo.name} - ${evt.data.createTodo.description}</p>`;
            });
        })
        .catch((err) => {
            alert("Only Authenticated Users can read and write data")
        })
});

getData();

// authentication


// SIGNUP
const signupBtn = document.getElementById("signupBtn");
signupBtn.addEventListener("click", (evt) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    Auth.signUp({
        username: email,
        password
    })
        .then((u) => {
            alert('We sent a email verification code on you email please confirm your email address!')
            console.log('user', {
                email: u.user.username,
                userId: u.userSub,
                verified: u.userConfirmed
            })
            dispayConfirmationCodeForm()
        })
        .catch((error) => {
            alert(error.message);
        });
});

function dispayConfirmationCodeForm() {
    document.getElementById('authForm').style.display = "none"
    document.getElementById('confirmationCodeForm').style.display = "block"
}

// CODE CONFIRMATION
const confirmBtn = document.getElementById("confirmBtn");
confirmBtn.addEventListener("click", (evt) => {
    const email = document.getElementById("email").value;
    const confirmationCode = document.getElementById("code").value;

    Auth.confirmSignUp(email, confirmationCode)
        .then((user) => {
            alert('You email has been verified')
            console.log({ user, email })
            dispayConfirmationLoginForm()
        })
        .catch((error) => alert(error.message));
});

function dispayConfirmationLoginForm() {
    // clear text fields
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    document.getElementById("code").value = "";

    document.getElementById('authForm').style.display = "block"
    document.getElementById('confirmationCodeForm').style.display = "none"
}

// LOGIN
const signinBtn = document.getElementById("signinBtn");
signinBtn.addEventListener("click", (evt) => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    Auth.signIn(email, password)
        .then((user) => {
            alert('You are logged in')

            // fetch todos
            getData()

            // hide Modal
            document.getElementById('id01').style.display = "none"

            // hide auth button and show logout
            document.getElementById("authBtn").style.display = "none";
            document.getElementById("logoutBtn").style.display = "block";
        })
        .catch((error) => alert(error.message));
});

// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener("click", (evt) => {

    Auth.signOut({ global: true })
        .then((user) => {
            alert('You are logged out')
            QueryResult.innerHTML = null
            isLoggedIn()

        })
        .catch((error) => alert(error.message));
});

// IS LOGGED IN
function isLoggedIn() {
    return new Promise((res, rej) => {
        return Auth.currentAuthenticatedUser()
            .then(user => {
                if (user) res()
                // hide auth button and show logout
                document.getElementById("authBtn").style.display = "none";
                document.getElementById("logoutBtn").style.display = "block";
            })
            .catch(() => {
                QueryResult.innerHTML = null
                // hide logout button and show auth
                document.getElementById("authBtn").style.display = "block";
                document.getElementById("logoutBtn").style.display = "none";
                rej()
            })
    })

};

isLoggedIn()