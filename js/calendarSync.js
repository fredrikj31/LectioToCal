function getStartEndDate() {
	var startOfWeek = moment(moment().startOf('week').toDate().toString()).add(1, 'days');
	var endOfWeek   = moment(moment().endOf('week').toDate().toString()).add(1, 'days');

	var startDate = moment(startOfWeek.toString()).format("YYYY-MM-DD")
	var endDate = moment(endOfWeek.toString()).format("YYYY-MM-DD")

	return [startDate, endDate];
}

async function getEvents() {
	var resultCalendarId = getCalendarId()
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log(error);
		});

	var calendarId = await resultCalendarId;

	var weekDate = getStartEndDate();
	console.log(weekDate);
	var startDate = weekDate[0] + "T00:00:00+02:00";
	var endDate = weekDate[1] + "T23:59:59+02:00";

	//console.log(startDate)
	//console.log(endDate)

	var resource = {
		calendarId: calendarId,
		singleEvents: true,
		timeMin: startDate,
		timeMax: endDate,
	};

	var result = new Promise((resolve, reject) => {
		/*gapi.client
			.request({
				path: "/calendar/v3/calendars/primary/events",
				method: "POST",
				body: resource,
			})
			.then(function (resp) {
				console.log(resp.result);
			});*/
		var request = gapi.client.calendar.events.list(
			{
				calendarId: calendarId,
				singleEvents: true,
				timeMin: startDate,
				timeMax: endDate,
			},
		);

		request.execute(function(resp) {
			//console.log(resp);
			resolve(resp.items.length);
		});
	});

	return result;
}

async function createCalendar() {
	var result = new Promise((resolve, reject) => {
		var request = gapi.client.calendar.calendars.insert(
			{
				resource: {
					summary: "LectioToCal",
					description: "This is the calendar for LectioToCal",
					timeZone: "Europe/Copenhagen",
				},
			},
			/*(err, result) => {
				if (err) {
					console.log("The API returned an error: " + err);
					reject("error");
				} else {
					resolve("success");
				}
			}*/
		);

		request.execute(function(resp) {
			//console.log(resp);
			resolve(resp.result.id);
		});
	});

	return result;
}

async function getCalendarId() {
	var result = new Promise((resolve, reject) => {
		var request = gapi.client.calendar.calendarList.list();
		request.execute(function (resp) {
			//console.log(result);
			var found = false;
			resp.items.forEach((element) => {
				if (element.summary == "LectioToCal") {
					//console.log("Found it: " + element.id);

					var calendarId = element.id;
					//console.log(calendarId);
					found = true;
					resolve(calendarId);
				}
			});

			if (!found) {
				//console.log("Could not find the calendar");
				resolve("error");
			}
		});
	});

	return result;
}

async function clearEvents() {
	var resultCalendarId = getCalendarId()
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.log(error);
		});

	var calendarId = await resultCalendarId;

	var weekDate = getStartEndDate();
	var startDate = weekDate[0] + "T00:00:00+02:00";
	var endDate = weekDate[1] + "T23:59:59+02:00";

	//console.log(startDate)
	//console.log(endDate)

	// Getting all the events by id
	var result = new Promise((resolve, reject) => {
		var request = gapi.client.calendar.events.list({
			calendarId: calendarId,
			singleEvents: true,
			timeMin: startDate,
			timeMax: endDate,
		});

		request.execute(function (resp) {
			const events = resp.items;
			//console.log(events);
			//console.log("---------------");

			events.forEach((element, i) => {
				setTimeout(() => {
					var params = {
						calendarId: calendarId,
						eventId: element.id,
					};

					var request2 = gapi.client.calendar.events.delete(params);
					request2.execute(function(resp) {
						//console.log(resp);
					});

				}, i * 1000);
			});
			resolve("finish");
		});
	});
}

async function createEvents(dataInput, calendarIdInput, totalEventsInput) {
	var mainMenu = document.getElementById("syncLectioLogin");
	var mainMenuFeedback = document.getElementById("feedback");
	var calendarSyncMenu = document.getElementById("syncUploadProgress");

	var calendarId = calendarIdInput;

	var totalEvents = totalEventsInput;
	var totalEventsProcent = 100 / totalEvents;
	var finishProcent = 0;
	var finishLessons = 1;

	var progressTitle = document.getElementById("progressTitle");

	dataInput.forEach((element, i) => {
		setTimeout(() => {
			// Setting the properties
			var eventColor;
			var eventTitle;
			var eventStartDate;
			var eventEndDate;

			// Setting date
			var splitData = element["Time"].split(" ");
			var startTime = splitData[1];
			var endTime = splitData[3];

			var fullTimeYear = splitData[0].split("-")[1];
			var fullTimeDate = splitData[0].split("-")[0];
			var fullTimeDateReal = fullTimeDate.split("/");
			var fullTimeDay = fullTimeDateReal[0];
			var fullTimeMonth = fullTimeDateReal[1];

			eventStartDate =
				fullTimeYear +
				"-" +
				fullTimeMonth +
				"-" +
				fullTimeDay +
				"T" +
				startTime +
				":00";
			//"+0" + timeOffset + ":00";
			eventEndDate =
				fullTimeYear +
				"-" +
				fullTimeMonth +
				"-" +
				fullTimeDay +
				"T" +
				endTime +
				":00";
			//"+0" + timeOffset + ":00";

			// Setting color
			if (element["Status"] == "Ændret!") {
				eventColor = 10;
			} else if (element["Status"] == "Aflyst!") {
				eventColor = 11;
			} else {
				eventColor = 9;
			}

			// Setting title
			if (element["Status"] != " ") {
				if (element["Title"] != " ") {
					eventTitle =
						element["Status"].trim() +
						", " +
						element["Title"].trim() +
						", " +
						element["Team"].trim();
				} else {
					eventTitle =
						element["Status"].trim() +
						", " +
						element["Team"].trim();
				}
			} else {
				if (element["Title"] != " ") {
					eventTitle =
						element["Title"].trim() + ", " + element["Team"].trim();
				} else {
					eventTitle = element["Team"].trim();
				}
			}

			var event = {
				summary: `${eventTitle}`,
				colorId: `${eventColor}`,
				location: `${element["Room"]}`,
				description: `<b>Status:</b> ${element["Status"]} \n<b>Title:</b> ${element["Title"]} \n<b>Tid:</b> ${element["Time"]} \n<b>Hold:</b> ${element["Team"]} \n<b>Lærer(r):</b> ${element["Teacher"]} \n<b>Lokale:</b> ${element["Room"]}`,
				start: {
					dateTime: `${eventStartDate}`,
					timeZone: "Europe/Copenhagen",
				},
				end: {
					dateTime: `${eventEndDate}`,
					timeZone: "Europe/Copenhagen",
				},
				reminders: {
					useDefault: true,
				},
			};

			//console.log(event)

			var request = gapi.client.calendar.events.insert(
				{
					calendarId: `${calendarId}`,
					resource: event,
				},
			);

			request.execute();

			finishProcent = finishProcent + totalEventsProcent;

			// Animate progress bar
			$(".progress-bar").animate(
				{
					width: Math.ceil(finishProcent) + "%",
				},
				1
			);

			progressTitle.innerHTML =
				"Processing " +
				finishLessons +
				" of " +
				totalEvents +
				" lessons " +
				`(${Math.ceil(finishProcent)}%)`;

			finishLessons = finishLessons + 1;

			//console.log(finishProcent)

			if (finishLessons - 1 >= dataInput.length) {
				calendarSyncMenu.style.display = "none";
				mainMenu.style.display = "block";

				//Empty the inputs
				document.getElementById("username").value = "";
				document.getElementById("password").value = "";

				mainMenuFeedback.innerHTML =
					"<div class='alert alert-success alert-dismissible fade show'><strong>Success!</strong> Your Lectio schedule is now synced with your Google Calendar. <button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button></div></div>";
			}
		}, i * 2000);
	});
}

async function mainSync(data) {
	var lectioData = data["data"];
	var totalLessons = lectioData.length;

	var resultCalendarId = await getCalendarId();
	//console.log(resultCalendarId);
	if (resultCalendarId != "error") {
		// If calendar already exists
		var resultEventsList = await getEvents();
		//console.log(resultEventsList);
		if (resultEventsList != "error") {
			if (resultEventsList < 1) {
				// If events is empty
				createEvents(lectioData, resultCalendarId, totalLessons);
			} else {
				// If events already exists
				await clearEvents();

				createEvents(lectioData, resultCalendarId, totalLessons);
			}
		}
	} else {
		// If calendar does not exists
		await createCalendar();
		createEvents(lectioData, resultCalendarId, totalLessons);
	}
}
