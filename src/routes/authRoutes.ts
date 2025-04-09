import express from "express";
import { otpSchema, signInSchema, signUpSchema } from "../validation/userSchema";
import { comparePassword, hashPassword } from "../utils";
import jwt from "jsonwebtoken";
import transporter from '../config/mailer';
import User from "../models/User";
import Otp from "../models/Otp";


const router = express.Router();
const JWT_PASSWORD = process.env.JWT_PASSWORD || "password";

router.post("/signup", async (req, res) => {
    const validation = signUpSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(400).json({
            message: "Invalid Entry",
        });
        return;
    }
    const {name,email, password, phone,type } = validation.data
    const existingUser = await User.findOne({ email });
    if (existingUser){
        res.status(400).json({
            message: "Email already exists"
        })
        return
    }

    const hashedPassword = await hashPassword(password);

    if (!hashedPassword) {
        res.status(400).json({ message: "internal server error" });
        return;
    }
    try {
        const newUser = new User({name, email, phone, password:hashedPassword})
        newUser.save()
        const payload = {userId: newUser.id, role: newUser.role}
        const token = jwt.sign(payload, JWT_PASSWORD, { expiresIn: '1h' });

        res.status(200).json({token});
    } catch (e:any) {
        res.status(400).json({
            message: e.message,
        });
    }
});

router.post("/login", async (req, res) => {
    const validation = signInSchema.safeParse(req.body);
    if (!validation.success) {
        res.status(404).json({
            message: "Incorrect Details",
        });
        return;
    }
    const {email, password} = validation.data
    try {
        const existingUser = await User.findOne({email})
        if (!existingUser) {
            res.status(404).json({
                message: "User not found",
            });
            return;
        }
        const valid = await comparePassword(password, existingUser.password);
        if (!valid) {
            res.status(404).json({
                mes: "Incorrect password",
            });
            return;
        }
        const payload = {userId:existingUser.id, role: existingUser.role}
        const token = jwt.sign(payload, JWT_PASSWORD, {expiresIn: '1h'});
        res.status(200).json({ token });
    } catch (e) {
        res.status(400).json({
            message: "Internal Error",
        });
    }
});



router.post("/otp/send", async (req, res) => {
  try {
    const vaildation = otpSchema.safeParse(req.body)
    if(!vaildation.success){
        res.status(400).json({
            message: "Invalid email"
        })
        return
    }
    const {email} = vaildation.data
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 
    await Otp.findOneAndUpdate(
        {email}, 
        {otp, expiresAt},
        {upsert: true, new: true}
    )

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}. It will expire in 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending OTP email:', error);
        return res.status(500).json({ message: 'Error sending OTP email' });
      }
      res.json({ message: 'OTP sent successfully' });
    });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

router.post("/otp/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne(otp)
    if (!otpRecord){
        res.status(400).json({ message: 'No OTP requested for this email' });
        return
    }

    if (otpRecord.otp !== otp){
        res.status(400).json({ message: 'Invalid OTP' });
        return
    }

    if (otpRecord.expiresAt < new Date()){
        res.status(400).json({ message: 'OTP expired' });
        return
    }

    await Otp.deleteOne({email});
    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
});

export default router;
