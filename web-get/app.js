const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();
const ssmParams = {
    Name: process.env.SESSION_PARAMETER
};

exports.fetchData = async (sessionName) => {
    let params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            id: sessionName
        }
    }
    return await db.get(params).promise()
}

exports.lambdaHandler = async () => {
    let session = await ssm.getParameter(ssmParams).promise().catch((err) => {
        return err
    })

    let data = await exports.fetchData(session.Parameter.Value).catch(err => {
        return {
            'statusCode': 500,
            'body': JSON.stringify({
                message: "There was a problem fetching the data"
            }),
            'headers': {
                "Access-Control-Allow-Origin": "*"
            }
        }
    })

    if (!data.Item) {
        return {
            'statusCode': 404,
            'body': JSON.stringify({}),
            'headers': {
                "Access-Control-Allow-Origin": "*"
            }
        }
    }

    return {
        'statusCode': 200,
        'body': JSON.stringify(data),
        'headers': {
            "Access-Control-Allow-Origin": "*"
        }
    }
};