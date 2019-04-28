// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this
// software and associated documentation files (the "Software"), to deal in the Software
// without restriction, including without limitation the rights to use, copy, modify,
// merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

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

    console.log(event);

    // HTTP?
    if(event.body){
        let b = JSON.parse(event.body)
        mood = moods[b.clickType]
    } else {
        mood = moods[event.deviceEvent.buttonClicked.clickType]
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