import mongoose from 'mongoose';
import crypto from 'crypto';
 
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            index: true, // use query instead of scan
            trim: true,
            required: true,
            max: 32
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true
        },
        hashed_password: {
            type: String,
            required: true
        },
        salt: String,
        role: {
            type: String,
            default: 'subscriber'
        },
        resetPasswordLink: {
            type: String,
            default: ''
        }
    },
    { timestamps: true }
);

// virtuals to hash password
userSchema.virtual('password')
            .set(function(password) {
                this._password = password; // temporarity variable _password
                this.salt = this.makeSalt();
                this.hashed_password = this.encryptPassword(password);
            })
            .get(function() {
                return this._password;
            });

userSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },
 
    encryptPassword: function(password) {
        if (!password) return '';
        try {
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        } catch (err) {
            return '';
        }
    },
 
    makeSalt: function() {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    }
};

const User = mongoose.model('User', userSchema);
 
export default User;