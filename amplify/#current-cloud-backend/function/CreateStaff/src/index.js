const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const ses = new AWS.SES({ region: 'us-east-2' }); // Ensure this region matches your SES setup
const { default: fetch, Request } = require('node-fetch');
const nodemailer = require('nodemailer');
const sesTransport = require('nodemailer-ses-transport');
function generateRandomPassword(length) {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

async function sendEmail(email, username, password) {
  const transporter = nodemailer.createTransport(
    sesTransport({
      ses,
      aws: AWS,
    }),
  );

  const mailOptions = {
    from: 'vaishalipanchal6899@gmail.com', // Verified SES email
    to: email, // Pass email directly as a string
    subject: 'Your Account Credentials',
    text: `Hello,
  
  Your account has been created successfully. Here are your login credentials:
  
  Username: ${username}
  Password: ${password}
  
  Please use these credentials to log in to your account.
  
  Best regards,
  Biologic App`,
  };

  console.log('Sending email with options:', mailOptions);

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  let response;

  for (const record of event.Records) {
    console.log('Processing record:', JSON.stringify(record, null, 2));

    if (record.eventName !== 'INSERT' && record.eventName !== 'MODIFY') {
      console.log(`Skipping record with eventName: ${record.eventName}`);
      continue; // Skip REMOVE events
    }

    const newImage = record.dynamodb.NewImage || {};

    const name = newImage.name ? newImage.name.S : null;
    const email = newImage.email ? newImage.email.S : null;

    const tableID = newImage.id ? newImage.id.S : null;

    if (!name || !email || !tableID) {
      response = {
        statusCode: 400,
        body: JSON.stringify({
          message: 'First name, last name, email, and ID are required',
        }),
      };
      console.log('Missing required fields:', {
        name,
        email,
        tableID,
      });
      continue; // Skip to the next record
    }

    // Create a username like "sagpan17"
    const firstPart = name.slice(0, 3).toLowerCase();
    const uniquePart = tableID.slice(-2);
    const username = `${firstPart}${uniquePart}`;

    // Generate a simple random password of length 10
    const randomPassword = generateRandomPassword(10);

    const params = {
      UserPoolId: 'us-east-2_DttbAqXe7', // Replace with your User Pool ID
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'custom:tableId', Value: String(tableID) },
        { Name: 'name', Value: `${name}` },
      ],
      MessageAction: 'SUPPRESS', // Suppress the welcome email
      DesiredDeliveryMediums: [],
    };

    try {
      console.log('TableID value:', tableID, 'Type:', typeof tableID);
      await cognito.adminCreateUser(params).promise();
      const setPasswordParams = {
        Password: randomPassword, // Use the generated random password
        Permanent: true,
        UserPoolId: 'us-east-2_DttbAqXe7', // Replace with your User Pool ID
        Username: username,
      };

      console.log('Setting password with params:', setPasswordParams);
      await cognito.adminSetUserPassword(setPasswordParams).promise();
      console.log('email', email);
      // Send email with credentials
      await sendEmail(email, username, randomPassword);

      response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'User created successfully',
          username: username,
          password: randomPassword,
        }),
      };
      console.log(
        'User created successfully with username:',
        username,
        'and password:',
        randomPassword,
      );
    } catch (error) {
      console.error('Error creating user:', error);
      response = {
        statusCode: 500,
        body: JSON.stringify({ message: error.message }),
      };
    }
  }

  return response;
};
