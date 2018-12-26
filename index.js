const AWS = require("aws-sdk");
AWS.config.region = "ap-southeast-2";
const DynamoDB = new AWS.DynamoDB();

exports.handler = async (event, context, callback) => {
    try {
        let id;
        if (event.pathParameters) {
            id = event.pathParameters.id;
        }

        var params = {
            ExpressionAttributeNames: {
                "#ID": "id",
                "#T": "title"
            },
            ProjectionExpression: "#ID, #T",
            TableName: "Projects"
        };

        if (id) {
            params.ExpressionAttributeValues = {
                ":id": {
                    N: id
                }
            };
            params.FilterExpression = "id = :id";
        }

        const dynamoResponse = await DynamoDB.scan(params).promise();

        const projects = [];

        if (dynamoResponse.Items) {
            dynamoResponse.Items.forEach(item => {
                projects.push({
                    id: item.id.N,
                    title: item.title.S
                });
            });
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify(projects),
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        };

        callback(null, response);
    } catch (e) {
        const responseBody = {
            errorMessage: `Something went wrong: ${e.message}`
        };
        const response = {
            statusCode: 500,
            body: JSON.stringify(responseBody),
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        }

        callback(null, response);
    }
};