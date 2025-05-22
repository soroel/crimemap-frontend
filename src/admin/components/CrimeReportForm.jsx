import React from 'react';
import { useForm } from 'react-hook-form';

const CrimeReportForm = ({ report, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      category: report?.category || '',
      location: report?.location || '',
      description: report?.description || '',
      status: report?.status || 'pending',
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200">Category</label>
        <select
          {...register('category', { required: 'Category is required' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        >
          <option value="">Select a category</option>
          <option value="theft">Theft</option>
          <option value="assault">Assault</option>
          <option value="vandalism">Vandalism</option>
          <option value="fraud">Fraud</option>
          <option value="other">Other</option>
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200">Location</label>
        <input
          {...register('location', { required: 'Location is required' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          placeholder="Enter location"
        />
        {errors.location && (
          <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
          rows="4"
          placeholder="Enter detailed description"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-200">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white"
        >
          <option value="pending">Pending</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
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
          {report ? 'Update' : 'Create'} Report
        </button>
      </div>
    </form>
  );
};

export default CrimeReportForm; 