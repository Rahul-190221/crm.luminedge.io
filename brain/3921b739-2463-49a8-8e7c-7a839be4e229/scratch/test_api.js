const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('http://localhost:5000/api/dashboard/bdm/all', {
            headers: {
                // I don't have a token, so this might fail unless I disable auth or find one.
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data.data.statusDistribution, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testApi();
