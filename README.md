# IoT FeedBack Engine
This application provides an IoT enabled feedback engine for speaking sessions. This project is the backend and can be launched via the AWS Serverless Application Repository.

The purpose of this application is to allow others to rate your session as Cool, Uncool, or Undecided. They can rate you using a connected IoT button or via the website. The client website can be found [here](https://github.com/singledigit/IoT-feedback-web-client)

## Multiple Events
The Session name is stored in the Parameter Store. The name of the parameter can be found in the stack outputs from the CloudFormation build of this project. Changing the value of that parameter will automatically create a new session. That's all you need to do.

If you need to gather feedback on multiple sessions at the same time, just spin up multiple versions of the application. Everything is self contained and will not cause issues.

You will need to spin up multiple versions of the web client as well.

## Structure
```bash
├── README.md
├── get
│   └── app.js
├── license.txt
├── post
│   └── app.js
└── template.yaml
```
* READEME.md: this document
* get/app.js: handles the retrieval of the latest data.
* license.txt: MIT License
* post/app.js: handles the posting of feedback, either from the client or from the Iot Buttons
* template.yaml: SAM template for application

## Services Used

* Lambda
* API Gateway
* IoT
* S3 (Hosting the client)

==============================================

Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0