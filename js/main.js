const lectioSection = document.getElementById("syncLectioLogin");
const apiCallSection = document.getElementById("syncGetEvents");
const createEventSection = document.getElementById("syncUploadProgress");
const formFeedback = document.getElementById("feedback");

var lectioLoginButton = document.getElementById('lectioLoginButton');

var loginUsername = document.getElementById("username");
var loginPassword = document.getElementById("password");

lectioLoginButton.onclick = startSync;

async function startSync() {
	if (loginUsername.value == "" && loginPassword.value == "") {
		formFeedback.innerHTML =
			"<div class='alert alert-danger alert-dismissible fade show'><strong>Error!</strong> Please fill out all the values. <button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div>";
	} else {
		lectioSection.style.display = "none";
		apiCallSection.style.display = "block";
	
		var result = await getSchedule().then((value) => {
			return value;
		});

		apiCallSection.style.display = "none";
		createEventSection.style.display = "block";
		
		var lectioData = result["data"];
		var totalLessons = lectioData.length;
		
		/*console.log("------------")
		console.log(lectioData);
		console.log(totalLessons);*/
	
		var resultCalendarId = await getCalendarId();
		console.log(resultCalendarId);
		if (resultCalendarId != "error") {
			// If calendar already exists
			var resultEventsList = await getEvents();
			console.log(resultEventsList);
			if (resultEventsList != "error") {
				if (resultEventsList < 1) {
					// If events is empty
					createEvents(lectioData, resultCalendarId, totalLessons)
				} else {
					// If events already exists
					await clearEvents();
	
					createEvents(lectioData, resultCalendarId, totalLessons)
				}
			}
		} else {
			//console.log("Hi im here!");
			// If calendar does not exists
			var calenderId = await createCalendar();
			//console.log(calendarId);
			createEvents(lectioData, calenderId, totalLessons)
		}

	}
}