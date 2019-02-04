const AWS = require("aws-sdk");
AWS.config.region = "ap-southeast-2";
const DynamoDB = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
});

exports.handler = async (event, context, callback) => {
    try {
        const requestBody = JSON.parse(event.body);
        if (!(requestBody.title && requestBody.description && requestBody.date)) {
            throw Error("Invalid Request");
        }
        const id = createId(requestBody.title);

        var params = {
            Item: {
                ID: {
                    S: id,
                },
                Title: {
                    S: requestBody.title,
                },
                Description: {
                    S: requestBody.description,
                },
                Date: {
                    S: requestBody.date,
                },
            },
            TableName: "Projects",
        };

        if (requestBody.img) {
            params.Item["ImageLink"] = {
                S: requestBody.img,
            };
        }
        if (requestBody.git) {
            params.Item["GitLink"] = {
                S: requestBody.git,
            };
        }

        const dynamoResponse = await DynamoDB.putItem(params).promise();

        const responseBody = {
            message: "Successfully created project",
            id: id,
        };
        const response = {
            statusCode: 200,
            body: JSON.stringify(responseBody),
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        };
        callback(null, response);
    } catch (e) {
        const responseBody = {
            errorMessage: `Something went wrong: ${e.message}`,
        };
        const response = {
            statusCode: 500,
            body: JSON.stringify(responseBody),
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        };

        callback(null, response);
    }
};

function createId(title) {
    const idUnencoded = title.replace(" ", "-").toLowerCase();
    return encodeURIComponent(idUnencoded);
}
