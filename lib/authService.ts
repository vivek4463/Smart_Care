/**
 * Authentication Service
 * Handles user registration, login, and credential validation
 */

export interface User {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    user?: Omit<User, 'password'>;
}

const USERS_KEY = 'smart_care_users';

/**
 * Get all registered users from localStorage
 */
function getUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersData = localStorage.getItem(USERS_KEY);
    return usersData ? JSON.parse(usersData) : [];
}

/**
 * Save users to localStorage
 */
function saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/**
 * Register a new user
 */
export function registerUser(name: string, email: string, password: string): AuthResponse {
    const users = getUsers();

    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return {
            success: false,
            message: 'An account with this email already exists'
        };
    }

    // Validate inputs
    if (!name || name.trim().length < 2) {
        return {
            success: false,
            message: 'Name must be at least 2 characters long'
        };
    }

    if (!email || !email.includes('@')) {
        return {
            success: false,
            message: 'Please enter a valid email address'
        };
    }

    if (!password || password.length < 6) {
        return {
            success: false,
            message: 'Password must be at least 6 characters long'
        };
    }

    // Create new user
    const newUser: User = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password // In production, this should be hashed!
    };

    users.push(newUser);
    saveUsers(users);

    return {
        success: true,
        message: 'Account created successfully!',
        user: {
            name: newUser.name,
            email: newUser.email
        }
    };
}

/**
 * Login user with email and password
 */
export function loginUser(email: string, password: string): AuthResponse {
    const users = getUsers();

    // Validate inputs
    if (!email || !password) {
        return {
            success: false,
            message: 'Please enter both email and password'
        };
    }

    // Find user
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return {
            success: false,
            message: 'No account found with this email address'
        };
    }

    // Check password
    if (user.password !== password) {
        return {
            success: false,
            message: 'Incorrect password'
        };
    }

    return {
        success: true,
        message: 'Login successful!',
        user: {
            name: user.name,
            email: user.email
        }
    };
}

/**
 * Get current logged in user from localStorage
 */
export function getCurrentUser(): Omit<User, 'password'> | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

/**
 * Logout current user
 */
export function logoutUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getCurrentUser() !== null;
}
