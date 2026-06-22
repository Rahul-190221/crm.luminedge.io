import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface DecodedToken {
    id?: string;
    userId?: string;
    studentId?: string;
    email?: string;
    role?: string;
    exp?: number;
    iat?: number;
}

const COOKIE_OPTS = { sameSite: 'strict' as const };

function readAnyToken(): string | null {
    return (
        Cookies.get('accessToken') ||
        (typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null) ||
        Cookies.get('studentToken') ||
        (typeof localStorage !== 'undefined' ? localStorage.getItem('studentToken') : null)
    );
}

export const getUserIdFromToken = (): DecodedToken | null => {
    try {
        const token = readAnyToken();
        if (!token) return null;

        const decoded = jwtDecode<DecodedToken>(token);

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            removeToken();
            return null;
        }

        return decoded;
    } catch {
        return null;
    }
};

export const getToken = (): string | null => readAnyToken();

export const removeToken = (): void => {
    Cookies.remove('accessToken', COOKIE_OPTS);
    Cookies.remove('studentToken', COOKIE_OPTS);
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('studentToken');
    }
};

export const isAuthenticated = (): boolean => getUserIdFromToken() !== null;
