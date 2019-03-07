const AWS = require('aws-sdk');
const db = new AWS.DynamoDB();
const ssm = new AWS.SSM();

const moods = {
    "SINGLE": "Cool",
    "DOUBLE": "Uncool",
    "LONG": "Undecided"
}

const ssmParams = {
    Name: process.env.SESSION_PARAMETER
};

exports.update = (params) => {
    return db.updateItem(params).promise()
}

exports.lambdaHandler = async (event) => {
    let mood;
    let session = await ssm.getParameter(ssmParams).promise().catch((err) => {
        return err
    })

    // HTTP?
    if(event.body){
        let b = JSON.parse(event.body)
        mood = moods[b.clickType]
    } else {
        mood = moods[event.clickType]
    }

    let params = {
        TableName: process.env.TABLE_NAME,
        Key: {
            id: {
                "S": session.Parameter.Value
            }
        },
        UpdateExpression: `ADD ${mood} :Val`,
        ExpressionAttributeValues: {
            ":Val": {
                "N": "1"
            }
        }
    }

    await exports.update(params).catch(err => {
        return {
            'statusCode': 500,
            'body': JSON.stringify(err),
            'headers': {
                "Access-Control-Allow-Origin": "*"
            }
        }
    })

    return {
        'statusCode': 200,
        'body': JSON.stringify({success: true}),
        'headers': {
            "Access-Control-Allow-Origin": "*"
        }
    }
};