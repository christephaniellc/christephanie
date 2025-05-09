// This is a dummy lambda function for CDK deployment
// The actual Lambda code is deployed separately through GitHub Actions
exports.handler = async function(event) {
    return {
      statusCode: 200,
      body: JSON.stringify('Dummy Auth Lambda - Real code deployed via GitHub Actions'),
    };
  };