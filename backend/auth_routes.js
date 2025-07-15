const { pool } = require("./database")
const express = require("express");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtp } = require("./email");
dotenv.config();
const auth = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - first_name
 *               - last_name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created, OTP sent
 *       400:
 *         description: Missing fields or email exists
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user and return token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials or missing fields
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/verify-email-otp:
 *   post:
 *     summary: Verify OTP for email verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp_code
 *             properties:
 *               email:
 *                 type: string
 *               otp_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email verified
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for email or password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - assigned_for
 *             properties:
 *               email:
 *                 type: string
 *               assigned_for:
 *                 type: string
 *                 enum: [email verification, password reset]
 *     responses:
 *       201:
 *         description: OTP sent
 *       400:
 *         description: Email not found or missing fields
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/auth/verify-reset-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp_code
 *             properties:
 *               email:
 *                 type: string
 *               otp_code:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified, token issued
 *       400:
 *         description: Invalid or expired OTP
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - otp_token
 *             properties:
 *               password:
 *                 type: string
 *               otp_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password successfully changed
 *       400:
 *         description: Invalid or expired token
 *       500:
 *         description: Server error
 */

//THIS IS THE API TO CREATE AN ACCOUNT
auth.post("/register", async (req, res) => {

    //Get details from body of the request sent from the client
    const {email, first_name, last_name, password} = req.body;

    //Check if any field is missing, if not proceed to check if email already exists on the database.
    if (!email || !first_name || !last_name || !password) {
        res.status(400).json({message: "Some fields are empty"})
    
    } else {

        //Check if a user on the roadsphere_users table already has the email sent by the client. If it already exists, client should register with another email or login with the email.
        try {

            //This is the SQL Query to check if the email exists
            const checkEmailQuery = `
                    SELECT email, password FROM roadsphere_users 
                    WHERE email = $1;
                    `
            //Get the result of the checkEmailQuery       
            const queryResult = await pool.query(checkEmailQuery, [email])
            const user_details = queryResult.rows
            console.log(user_details)

            //If the email exists, the client should be notified that an existing account with the email sent already exists
            if (queryResult.rowCount > 0) {
            res.status(400).json({message : `An account with ${email} already exists. Please use another email or login`})

            //If the email sent does not exist, we proceed to the next step which is to hash password and save to our database
            } else {

                try {
                    //Hash the password sent by the client
                    const hashedPassword = await bcrypt.hash(password, 10)

                    //Values to be inserted into the roadsphere_users table
                    const values = [email, first_name, last_name, hashedPassword]

                    //Query to insert into the roadsphere_users table
                    const createAccountQuery = `
                        INSERT INTO roadsphere_users(email, first_name, last_name, password)
                        VALUES($1, $2, $3, $4)
                        RETURNING *;
                    `
                    
                    //Get the result of the creatAccountQuery
                    const creatAccountQueryResult = await pool.query(createAccountQuery, values)
                    
                    //Get the created user details from the query result
                    const created_user_details = creatAccountQueryResult.rows[0];

                    //Send OTP to the newly created user to verify email
                    try {

                        //Generate random OTP and define otp details to be saved
                        const otp  = Math.floor(100000 + Math.random() * 900000)
                        const creation_time = Date.now();
                        const expiration_time = creation_time + 10 * 60 * 1000;
                        const assigned_to = email;
                        const assigned_for = 'email verification';
                        const otp_values = [otp, assigned_to, creation_time, expiration_time, assigned_for]
                        

                        //Query to save otp
                        const saveOtpQuery = `
                            INSERT INTO roadsphere_otps(otp_code, assigned_to, creation_time, expiration_time, assigned_for)
                            VALUES($1, $2, $3, $4, $5)
                            RETURNING *;
                        `

                        //Get result of saveOtpQuery
                        const saveOtpQueryResult = await pool.query(saveOtpQuery, otp_values);

                        //If OTP was successfully saved, send OTP to the user email
                        if (saveOtpQueryResult.rowCount > 0) {
                            try {
                                const subject = 'Verify Email OTP';
                                const otpEmailStatus = await sendOtp(email, first_name, otp, subject, assigned_for);
                                console.log(otpEmailStatus)

                                //JSON message to the user
                                res.status(201).json({
                                    message: 'Your account has been created. Please check your email to verify OTP',
                                    user: created_user_details
                                })
                            
                            //CATCH for TRY to send otp to email
                            } catch(error) {
                                console.log(error) 
                            }
                        }
                    
                    //CATCH for TRY to save OTP to database
                    } catch(error) {
                        res.status(500).json({message : 'An error occured while saving OTP. Please try again'})
                        console.log(error)
                    }

                //CATCH for TRY to hashpassword and create user account
                } catch(error) {
                    console.log(error);
                    res.status(500).json({message: "Internal Server Error"})
                }
            }

        //CATCH for TRY to check if email exists in database   
        } catch(error) {
            console.log(error)
        }  
    }
})


auth.post('/login', async (req, res) => {

    const {email, password} = req.body;
    const ip = req.ip;
    const headers = req.headers

    console.log(ip, headers)

    if (!email || !password) {
        res.status(400).json({message: "Some field are missing"});
    }

    try {
        const checkEmailQuery = `
        SELECT * FROM roadsphere_users 
        WHERE email = $1;
        `
        const queryResult = await pool.query(checkEmailQuery, [email])
        const user = queryResult.rows[0]
        console.log(user)
        if (queryResult.rowCount > 0) {
            try {
                const isPassword = await bcrypt.compare(password, user.password)
                if (isPassword) {
                    const payload = {
                id: user.id, 
                email: user.email, 
                first_name: user.first_name, 
                last_name:user.last_name,
                role: user.role,
                kyc_level: user.kyc_level,
                phone_number: user.phone_number,    
                is_verified: user.is_verified,        
        }
                    const token = jwt.sign(
                        payload,
                        process.env.JWT_SECRET_KEY, 
                        {expiresIn: process.env.JWT_EXPIRATION_TIME}
                    )
                    res.status(200).json({message: "Login successful", token: token, user: payload})
                } else {
                    res.status(400).json({message: "Password is not correct"})
                }
            } catch(error) {
                res.status(500).json({message: "Internal Server Error"})
            }
        } else {
            res.status(400).json({message : "Email not found. Please create an account"})
        }
    } catch(error) {
        console.log(error);
        res.status(500).json({message: "Internal Server Error"});
    }
})

//API TO VERIFY EMAIL OTP
auth.post("/verify-email-otp", async (req, res) => {

    //Collect email and otp_code from req.body
    const {email, otp_code} = req.body;
    
    //Check for missing fields
    if (!email || !otp_code) {
        res.status(400).json({message: "Some fields are missing"});

    //Else check if otp and related details exist in the database
    } else {
        try {
            const currentTime = Date.now();
            const values = [otp_code, email, currentTime];
            const checkOtpQuery = `
                SELECT * FROM roadsphere_otps
                WHERE otp_code = $1
                    AND assigned_to = $2
                    AND expiration_time > $3
                    AND assigned_for = 'email verification'
                    AND is_verified = FALSE
            `
            const checkOtpQueryResult = await pool.query(checkOtpQuery, values) 
            if (checkOtpQueryResult.rowCount > 0) {
                const otpId = checkOtpQueryResult.rows[0].id; 
                try {
                    const setIsOtpVerifiedQuery = `
                        UPDATE roadsphere_otps
                        SET is_verified = TRUE, verification_time = $2
                        WHERE id = $1
                        RETURNING *;
                    `
                    const setIsOtpVerifiedQueryResult = await pool.query(setIsOtpVerifiedQuery, [otpId, currentTime])
                    if (setIsOtpVerifiedQueryResult.rowCount > 0) {
                        try {
                            const setIsEmailVerifiedQuery = `
                                UPDATE roadsphere_users
                                SET is_verified = TRUE
                                WHERE email = $1
                                RETURNING *;
                            `
                            const setIsEmailVerifiedQueryResult = await pool.query(setIsEmailVerifiedQuery, [email])
                            if (setIsEmailVerifiedQueryResult.rowCount > 0) {
                                res.status(200).json({message: "Email has been successfully verified"});
                            }

                        } catch(error) {
                            console.log(error); 
                            res.status(500).json({message: "Internal Server Error"});
                            
                        }
                    }
                } catch(error) {
                    console.log(error)
                    res.status(500).json({message: "Internal Server Error"});
                }
            } else {
                res.status(400).json({message: "Invalid or Expired Otp"});
            }
        } catch(error){
            console.log(error);
            res.status(500).json({message: "Internal Server Error"});
        }
    }

})


auth.post("/send-otp", async (req, res) => {
    const {email, assigned_for} = req.body;
     if (!email || !assigned_for) {
        res.status(400).json({message: 'Some fields are missing'});
     } else {
        try {
            const checkEmailQuery = `
                SELECT * FROM roadsphere_users 
                WHERE email = $1;
            `
            const queryResult = await pool.query(checkEmailQuery, [email])
            const user = queryResult.rows[0]
            if(queryResult.rowCount == 0) {
                res.status(400).json({
                    message: "Email record does not exist. Please create an account"
                })
            } else {
        try {
            //Generate random OTP and define otp details to be saved
            const otp  = Math.floor(100000 + Math.random() * 900000)
            const creation_time = Date.now();
            const expiration_time = creation_time + 10 * 60 * 1000;
            const assigned_to = email;
            const otp_values = [otp, assigned_to, creation_time, expiration_time, assigned_for]
                        

                        //Query to save otp
            const saveOtpQuery = `
                    INSERT INTO roadsphere_otps(otp_code, assigned_to, creation_time, expiration_time, assigned_for)
                    VALUES($1, $2, $3, $4, $5)
                    RETURNING *;
                `

                        //Get result of saveOtpQuery
            const saveOtpQueryResult = await pool.query(saveOtpQuery, otp_values);

                        //If OTP was successfully saved, send OTP to the user email
            if (saveOtpQueryResult.rowCount > 0) {
                try {
                    const subject = assigned_for === 'email verification'? 'Verify Email OTP': 'Password Reset OTP';
                    const otpEmailStatus = await sendOtp(email, user.first_name, otp, subject, assigned_for);
                    console.log(otpEmailStatus)

                                //JSON message to the user
                    res.status(201).json({
                        message: 'Please check your email inbox or spam to verify the OTP sent to your email'
                    })
                            
                            //CATCH for TRY to send otp to email
                    } catch(error) {
                            console.log(error) 
                        }
                    }
                    
                    //CATCH for TRY to save OTP to database
        } catch(error) {
                        res.status(500).json({message : 'An error occured while saving OTP. Please try again'})
                        console.log(error)
        }
    }
        } catch(error) {
            res.status(500).json({message : 'An error occured while creating. Please try again'})
                        console.log(error)
        } 
     }
})

//API TO VERIFY EMAIL OTP
auth.post("/verify-reset-otp", async (req, res) => {

    //Collect email and otp_code from req.body
    const {email, otp_code} = req.body;
    
    //Check for missing fields
    if (!email || !otp_code) {
        res.status(400).json({message: "Some fields are missing"});

    //Else check if otp and related details exist in the database
    } else {
        try {
            const currentTime = Date.now();
            const values = [otp_code, email, currentTime];
            const checkOtpQuery = `
                SELECT * FROM roadsphere_otps
                WHERE otp_code = $1
                    AND assigned_to = $2
                    AND expiration_time > $3
                    AND assigned_for = 'password reset'
                    AND is_verified = FALSE
            `
            const checkOtpQueryResult = await pool.query(checkOtpQuery, values) 
            if (checkOtpQueryResult.rowCount > 0) {
                const otpId = checkOtpQueryResult.rows[0].id; 
                try {
                    const setIsOtpVerifiedQuery = `
                        UPDATE roadsphere_otps
                        SET is_verified = TRUE, verification_time = $2
                        WHERE id = $1
                        RETURNING *;
                    `
                    const setIsOtpVerifiedQueryResult = await pool.query(setIsOtpVerifiedQuery, [otpId, currentTime])
                    if (setIsOtpVerifiedQueryResult.rowCount > 0) {
                        try {
                            const payload = {
                                email: email,
                                otp: otp_code
                            }
                            const otp_token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: process.env.JWT_EXPIRATION_TIME})
                            res.status(200).json({
                                message: "Otp Successfully Verified.",
                                otp_token: otp_token
                            })

                        } catch(error) {
                            console.log(error); 
                            res.status(500).json({message: "Internal Server Error"});
                            
                        }
                    }
                } catch(error) {
                    console.log(error)
                    res.status(500).json({message: "Internal Server Error"});
                }
            } else {
                res.status(400).json({message: "Invalid or Expired Otp"});
            }
        } catch(error){
            console.log(error);
            res.status(500).json({message: "Internal Server Error"});
        }
    }

})

auth.post("/reset-password", async (req, res) => {
    const {password, otp_token} = req.body

    if (!password || !otp_token) {
        res.status(400).json("Some parameters are missing");
    } else {
        try {
            const decoded = jwt.verify(otp_token, process.env.JWT_SECRET_KEY);
            const email = decoded.email;

            const hashedPassword = await bcrypt.hash(password, 10);

            const changePasswordResult = await pool.query(
                `
                UPDATE roadsphere_users
                SET password = $2
                WHERE email = $1
                RETURNING *;
                `,
                [email, hashedPassword]
            );
            if (changePasswordResult.rowCount > 0) {
                res.status(200).json({
                    message: "Your password has been successfully changed",
                })
            }

        } catch(error){
            if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
                res.status(400).json({message: 'Invalid or Expired token'})
                console.log(error);
            } else {
                console.log(error);
                res.status(500).json({message: "Internal Server Error Occured While changing password."})
            }
        }
    }
})

module.exports = auth;