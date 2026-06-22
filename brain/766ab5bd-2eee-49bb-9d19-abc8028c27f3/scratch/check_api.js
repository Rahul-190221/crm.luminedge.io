const API_URL = 'http://localhost:3000/api/dashboard/bdm/all';

async function checkApi() {
  try {
    // Note: This needs an auth token. I'll try to fetch it from the environment or just see if it fails with 401.
    const response = await fetch(API_URL);
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Data stats:', data.data?.stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkApi();
