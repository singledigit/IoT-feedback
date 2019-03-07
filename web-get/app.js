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

    console.log(session);

    let data = await exports.fetchData(session.Parameter.Value)

    if(!data.body){
        let putParams = {
            TableName: process.env.TABLE_NAME,
            Item: {
                id: session.Parameter.Value,
                Cool: 0,
                Uncool: 0,
                Undecided: 0
            }
        }
        await db.put(putParams).promise().catch(err => {
            return err
        })

        data = await exports.fetchData(session.Parameter.Value)
    }

    return {
        'statusCode': 200,
        'body': JSON.stringify(data),
        'headers': {
            "Access-Control-Allow-Origin": "*"
        }
    }
};