// src/Components/UserInfo.jsx
import React, { useState } from "react";

const UserInfo = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState(user);

  const startEditing = () => {
    setFormState(user);
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setUser(formState);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormState(user);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl px-6 sm:px-10 py-7">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-[2.2rem] md:text-[2.5rem] font-garamond font-bold bg-gradient-to-r from-[#133729] to-green-700 bg-clip-text text-transparent inline-block">
          Profile Information
        </h2>
        {!isEditing && (
          <button
            type="button"
            onClick={startEditing}
            className="inline-flex items-center justify-center px-10 py-2.5 lg:py-2 rounded-full bg-gradient-to-r from-[#133729] to-green-700 text-white text-[1rem] md:text-[1.05rem] font-semibold shadow hover:bg-green-800 transition"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4 text-[1.1rem] md:text-[1.2rem] font-garamond">
          <ProfileRow label="Name" value={user.name} />
          <ProfileRow label="Email" value={user.email} />
          <ProfileRow label="Department" value={user.department} />
          <ProfileRow label="Phone" value={user.phone} />
          <ProfileRow label="Student ID" value={user.studentId} />
          <ProfileRow label="Batch / Year" value={user.batch} />
          {/* <ProfileRow label="Blood Group" value={user.bloodGroup} />
          <ProfileRow
            label="City / Campus"
            value={`${user.city}, ${user.university}`}
          /> */}
        </div>
      ) : (
        <form
          onSubmit={handleSave}
          className="space-y-4 text-[1.05rem] md:text-[1.15rem] font-garamond"
        >
          <EditableRow
            label="Name"
            value={formState.name}
            onChange={(v) => setFormState({ ...formState, name: v })}
          />
          <EditableRow
            label="Email"
            value={formState.email}
            onChange={(v) => setFormState({ ...formState, email: v })}
          />
          <EditableRow
            label="Department"
            value={formState.department}
            onChange={(v) =>
              setFormState({ ...formState, department: v })
            }
          />
          <EditableRow
            label="Phone"
            value={formState.phone}
            onChange={(v) => setFormState({ ...formState, phone: v })}
          />
          <EditableRow
            label="Student ID"
            value={formState.studentId}
            onChange={(v) =>
              setFormState({ ...formState, studentId: v })
            }
          />
          <EditableRow
            label="Batch / Year"
            value={formState.batch}
            onChange={(v) => setFormState({ ...formState, batch: v })}
          />
          {/* <EditableRow
            label="Blood Group"
            value={formState.bloodGroup}
            onChange={(v) =>
              setFormState({ ...formState, bloodGroup: v })
            }
          /> */}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xl rounded-lg bg-gradient-to-r from-[#133729] to-green-700 text-white font-semibold shadow hover:underline transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-xl rounded-lg border border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

/* helper rows */

const ProfileRow = ({ label, value }) => (
  <div>
    <p className="text-[1.3rem] md:text-[1.5rem] font-semibold text-green-800 mb-2">
      {label}:
    </p>
    <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-3 text-[1.15rem] md:text-[1.3rem] text-gray-800">
      {value}
    </div>
  </div>
);

const EditableRow = ({ label, value, onChange }) => (
  <div>
    <label className="block text-[1.3rem] md:text-[1.5rem] font-semibold text-green-900 mb-2">
      {label}:
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-5 py-3 text-[1.15rem] md:text-[1.3rem] text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
    />
  </div>
);

export default UserInfo;
