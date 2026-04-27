
const API_KEY = 'AIzaSyBgp4CNAvutmX4GfHiALPyZKX89j_B3THA';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY)
  .then(res => res.json())
  .then(data => {
    console.log(JSON.stringify(data, null, 2));
  })
  .catch(err => console.error('Fetch error:', err));

