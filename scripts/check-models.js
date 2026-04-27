
const API_KEY = 'AIzaSyDEKz7mXxivnYjJSNCk_q1sLIkgyDyV6MA';
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY)
  .then(res => res.json())
  .then(data => {
    if (data.models) {
      console.log('Available models:');
      data.models.forEach(m => console.log(m.name));
    } else {
      console.log('Error:', data);
    }
  })
  .catch(err => console.error('Fetch error:', err));

