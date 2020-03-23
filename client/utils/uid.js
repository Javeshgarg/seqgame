export default () => {
	let uid = sessionStorage.getItem('__uid');
	while (!uid) {
		uid = prompt('Your ID');
		sessionStorage.setItem('__uid', uid);
	}
	return uid;
};
