"use client";

import { useState } from "react";
import AddCredentialForm from "./AddCredentialForm";
import CredentialsList from "./CredentialsList";

export default function R2CredentialsManager({
  credentials,
  loading,
  onAdd,
  onDelete,
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addingCredential, setAddingCredential] = useState(false);
  const [error, setError] = useState(null);

  const handleAddCredential = async (credentialData) => {
    setAddingCredential(true);
    setError(null);

    try {
      await onAdd(credentialData);
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding credential:", error);
      setError(
        "Failed to add R2 credentials. Please check your details and try again.",
      );
    } finally {
      setAddingCredential(false);
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!confirm("Are you sure you want to delete this R2 credential?")) {
      return;
    }

    try {
      setError(null);
      await onDelete(credentialId);
    } catch (error) {
      console.error("Error deleting credential:", error);
      setError("Failed to delete R2 credentials. Please try again.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">R2 Credentials</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
        >
          {showAddForm ? "Cancel" : "Add R2 Account"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-start">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="mb-6">
          <AddCredentialForm
            onSubmit={handleAddCredential}
            onCancel={() => setShowAddForm(false)}
            isLoading={addingCredential}
          />
        </div>
      )}

      <CredentialsList
        credentials={credentials}
        loading={loading}
        onDelete={handleDeleteCredential}
        onAddNew={() => setShowAddForm(true)}
      />
    </div>
  );
}
