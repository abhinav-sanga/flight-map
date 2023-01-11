import axios from 'axios';

export async function getAllFlights() {
	console.log('here');
		const response = await axios.get('http://localhost:9000/api/flights/');
		console.log('response  ', response)
		return response.data;
}