
import React, { useState, FormEvent } from 'react';
import { auth } from '../firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  FirebaseError
} from 'firebase/auth';
import { USERS } from '../constants';
import type { User } from '../types';
import { Spinner } from './Spinner.tsx';

interface LoginProps {
  t: Record<string, string>;
}

export const Login: React.FC<LoginProps> = ({ t }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState<User>(USERS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthError = (err: unknown) => {
    // FIX: Replaced `instanceof FirebaseError` with a property check (`'code' in err`)
    // to create a more robust type guard. This correctly narrows the type of the `err`
    // variable from `unknown`, allowing safe access to the `code` property.
    if (typeof err === 'object' && err !== null && 'code' in err) {
      switch ((err as { code: string }).code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Correo o contraseña incorrectos.');
          break;
        case 'auth/email-already-in-use':
          setError('Este correo electrónico ya está en uso.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        default:
          setError('Ha ocurrido un error. Por favor, inténtalo de nuevo.');
          break;
      }
    } else {
      setError('Ha ocurrido un error desconocido.');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isLoginView) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName });
        }
      } catch (err) {
        handleAuthError(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          {isLoginView ? t.loginTitle : t.signupTitle}
        </h2>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">{t.emailLabel}</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t.emailLabel}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="-mt-px">
              <label htmlFor="password"  className="sr-only">{t.passwordLabel}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLoginView ? "current-password" : "new-password"}
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm ${!isLoginView ? '' : 'rounded-b-md'}`}
                placeholder={t.passwordLabel}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            {!isLoginView && (
              <>
                <div className="-mt-px">
                    <label htmlFor="confirm-password"  className="sr-only">{t.confirmPasswordLabel}</label>
                    <input
                        id="confirm-password"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                        placeholder={t.confirmPasswordLabel}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                    />
                </div>
                <div className="pt-4">
                    <label className="block text-sm font-medium text-gray-700">{t.chooseProfileLabel}</label>
                    <div className="mt-2 flex space-x-4">
                        {USERS.map(user => (
                            <label key={user} className="flex items-center">
                                <input
                                    type="radio"
                                    name="displayName"
                                    value={user}
                                    checked={displayName === user}
                                    onChange={() => setDisplayName(user)}
                                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{user}</span>
                            </label>
                        ))}
                    </div>
                </div>
              </>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? <Spinner /> : (isLoginView ? t.loginButton : t.signupButton) }
            </button>
          </div>
        </form>
        <div className="text-center mt-4">
          <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="text-sm text-blue-600 hover:underline">
            {isLoginView ? t.switchToSignup : t.switchToLogin}
          </button>
        </div>
      </div>
    </div>
  );
};