const AWS = require("aws-sdk");
AWS.config.region = "ap-southeast-2";
const DynamoDB = new AWS.DynamoDB({
    apiVersion: "2012-08-10",
});

exports.handler = async (event, context, callback) => {
    try {
        let id;
        if (event.pathParameters) {
            id = event.pathParameters.id;
        }

        var params = {
            ExpressionAttributeNames: {
                "#ID": "ID",
                "#T": "Title",
                "#IMG": "ImageLink",
                "#GIT": "GitLink",
            },
            ProjectionExpression: "#ID, #T, #IMG, #GIT",
            TableName: "Projects",
        };

        if (id) {
            params.ExpressionAttributeValues = {
                ":id": {
                    S: id,
                },
            };
            params.FilterExpression = "ID = :id";
            params.ProjectionExpression += ", #DESC, #DATE";
            params.ExpressionAttributeNames["#DESC"] = "Description";
            params.ExpressionAttributeNames["#DATE"] = "Date";
        }

        const dynamoResponse = await DynamoDB.scan(params).promise();

        const projects = [];

        if (dynamoResponse.Items) {
            dynamoResponse.Items.forEach(item => {
                projects.push({
                    id: item.ID.S,
                    title: item.Title.S,
                    img: item.ImageLink ? item.ImageLink.S : "",
                    description: item.Description ? item.Description.S : "",
                    date: item.Date ? item.Date.S : "",
                    git: item.GitLink ? item.GitLink.S : "",
                });
            });
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify(projects),
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
