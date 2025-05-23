import React from 'react';
import { useForm } from 'react-hook-form';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: user?.username || '',
      role: user?.role || 'user',
      password: '',
    }
  });

  const isNewUser = !user;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200">Username</label>
        <input
          {...register('username', { required: 'Username is required' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          placeholder="Enter username"
        />
        {errors.username && (
          <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
        )}
      </div>

      {isNewUser && (
        <div>
          <label className="block text-sm font-medium text-gray-200">Password</label>
          <input
            type="password"
            {...register('password', { 
              required: isNewUser ? 'Password is required for new users' : false 
            })}
            className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-200">Role</label>
        <select
          {...register('role')}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {user ? 'Update' : 'Create'} User
        </button>
      </div>
    </form>
  );
};

export default UserForm; 