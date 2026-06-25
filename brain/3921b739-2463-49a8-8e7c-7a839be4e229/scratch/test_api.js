const fetch = require('node-fetch');

async function testApi() {
    try {
        const response = await fetch('https://crm-qy8u.onrender.com/api/dashboard/bdm/all', {
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
