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

    return {
        'statusCode': 200,
        'body': JSON.stringify(data.Item || null),
        'headers': {
            "Access-Control-Allow-Origin": "*"
        }
    }
};