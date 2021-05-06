// Client ID and API key from the Developer Console
var CLIENT_ID = '294965687317-qca0crm8d3tu78nkkreuk73sdkdgsivh.apps.googleusercontent.com';
var API_KEY = 'AIzaSyDmjntbx5KlW4db1SYxXNq1lEB3QnbtRyQ';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar";

// Navbar Information
var userImage = document.getElementById('loggedInUserImage');
var userName = document.getElementById('loggedInUserName');
var userEmail = document.getElementById('loggedInUserEmail');

var googleSignInButton = document.getElementById('googleSignInButton');
var googleSignOutButton = document.getElementById('logoutButton');

var googleSignInSection = document.getElementById('syncGoogleLogin');
var lectioSignInSection = document.getElementById('syncLectioLogin');

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
  gapi.client.init({
	apiKey: API_KEY,
	clientId: CLIENT_ID,
	discoveryDocs: DISCOVERY_DOCS,
	scope: SCOPES
  }).then(function () {
	gapi.client.load('calendar', 'v3');

	// Listen for sign-in state changes.
	gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	// Handle the initial sign-in state.
	updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	googleSignInButton.onclick = handleAuthClick;
	googleSignOutButton.onclick = handleSignoutClick;
  }, function(error) {
	alert(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
	// Setting the username and profile picture in the navbar
	var profile = gapi.auth2.getAuthInstance().currentUser.get()
	formatUserInfo(profile);


	googleSignInSection.style.display = 'none';
	lectioSignInSection.style.display = 'block';
  } else {
	googleSignInSection.style.display = 'block';
	lectioSignInSection.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
  location.reload();
}

//
function formatUserInfo(data) {
	userName.innerText = data["ft"]["Te"];
	userEmail.innerText = data["ft"]["Qt"];
	userImage.src = data["ft"]["yJ"];
}
