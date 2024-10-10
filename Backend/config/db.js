// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { getDatabase, ref, set } from "firebase/database"; // For Realtime Database

// const auth = getAuth();
// const database = getDatabase();

// export const register = async (email, password, firstName, lastName) => {
// 	if (!validate_email(email) || !validate_password(password)) {
// 		alert("Email or Password is incorrect!");
// 		return;
// 	}

// 	try {
// 		const userCredential = await createUserWithEmailAndPassword(
// 			auth,
// 			email,
// 			password
// 		);
// 		const user = userCredential.user;
// 		alert("User Created");

// 		const database_ref = ref(database, "users/" + user.uid);
// 		await set(database_ref, {
// 			email: email,
// 			firstName: firstName,
// 			lastName: lastName,
// 			last_login: Date.now(),
// 		});
// 	} catch (error) {
// 		const error_message = error.message;
// 		alert(error_message);
// 	}
// };

// function validate_email(email) {
// 	const expression = /^[^@]+@\w+(\.\w+)+\w$/;
// 	return expression.test(email);
// }

// function validate_password(password) {
// 	return password.length >= 6;
// }
