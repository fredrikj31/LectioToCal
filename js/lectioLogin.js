async function getSchedule() {
	var lectioUsername = document.getElementById("username").value;
	var lectioPassword = document.getElementById("password").value;
	var lectioSchoolId = document.getElementById("schoolId").value;
	var lectioType = document.getElementById("personType").value;

	const response = await fetch("https://lectio-api.herokuapp.com/schedule", {
		method: 'GET',
		headers: {
			/*"Access-Control-Allow-Origin": "http://127.0.0.1:5000/schedule",
			"Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
			"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization",*/
			"Username": lectioUsername,
			"Password": lectioPassword,
			"SchoolId": lectioSchoolId,
			"Type": lectioType,
		},
	});
	return response.json(); // parses JSON response into native JavaScript objects
}