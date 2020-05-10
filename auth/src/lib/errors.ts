export class UserNotFoundError extends Error {
    constructor(email: string) {
        super(`could not find the user ${email}`);
    }
}

export class InvalidPasswordError extends Error {
    constructor(message: string = 'invalid password') {
        super(message);
    }
}

export class InvalidApplicationCredentialsError extends Error {
    constructor(message: string = 'could not authenticate the application') {
        super(message);
    }
}

export class UserAlreadyExistsError extends Error {
    constructor(email: string) {
        super(`user with email ${email} already exists`);
    }
}
