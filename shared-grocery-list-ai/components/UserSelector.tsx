
import React from 'react';
import type { User } from '../types';

interface UserSelectorProps {
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ users, currentUser, setCurrentUser }) => {
  const userColors = {
    Andrea: 'bg-rose-100 text-rose-700 ring-rose-300',
    Rocío: 'bg-sky-100 text-sky-700 ring-sky-300',
  };

  const inactiveUserColors = {
    Andrea: 'bg-gray-100 text-gray-600 hover:bg-rose-50',
    Rocío: 'bg-gray-100 text-gray-600 hover:bg-sky-50',
  }

  return (
    <div>
      <p className="text-sm font-medium text-gray-600 mb-2 ml-1">Comprando como:</p>
      <div className="flex space-x-2">
        {users.map(user => (
          <button
            key={user}
            onClick={() => setCurrentUser(user)}
            className={`w-full text-center font-semibold py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none ${
              currentUser === user
                ? `${userColors[user]} ring-2`
                : `${inactiveUserColors[user]}`
            }`}
          >
            {user}
          </button>
        ))}
      </div>
    </div>
  );
};
