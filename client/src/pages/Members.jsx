import { Plus, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const initialMemberForm = {
  name: "",
  email: "",
  password: "",
  role: "ANALYST",
};

const getErrorMessage = (error, fallbackMessage) =>
  error.response?.data?.message || fallbackMessage;

function Members() {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberForm, setMemberForm] = useState(initialMemberForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const isAdmin = user.role === "ADMIN";

  const loadWorkspaceData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [workspaceResponse, membersResponse] = await Promise.all([
        api.get("/workspace"),
        api.get("/workspace/members"),
      ]);

      setWorkspace(workspaceResponse.data.data.workspace);
      setMembers(membersResponse.data.data.members);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to load workspace members."),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setMemberForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAddMember = async (event) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSubmitting(true);

    try {
      await api.post("/workspace/members", memberForm);

      setMemberForm(initialMemberForm);
      setIsAddingMember(false);
      setMessage({ type: "success", text: "Member added successfully." });
      await loadWorkspaceData();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to add member."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    setMessage({ type: "", text: "" });

    try {
      await api.patch(`/workspace/members/${memberId}/role`, { role });

      setMessage({ type: "success", text: "Member role updated successfully." });
      await loadWorkspaceData();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to update member role."),
      });
    }
  };

  const handleRemoveMember = async (member) => {
    const shouldRemove = window.confirm(
      `Are you sure you want to remove ${member.name}?`,
    );

    if (!shouldRemove) {
      return;
    }

    setMessage({ type: "", text: "" });

    try {
      await api.delete(`/workspace/members/${member.id}`);

      setMessage({ type: "success", text: "Member removed successfully." });
      await loadWorkspaceData();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Unable to remove member."),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading workspace members..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-400">
            {workspace?.name || "Workspace"}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Workspace Members
          </h1>
          <p className="mt-3 text-slate-400">
            {isAdmin
              ? "Manage the people who can access this workspace."
              : "View the people who can access this workspace."}
          </p>
        </div>

        {isAdmin && (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            onClick={() => setIsAddingMember((isOpen) => !isOpen)}
            type="button"
          >
            <Plus size={18} />
            Add Member
          </button>
        )}
      </div>

      {message.text && (
        <p
          className={`mt-6 rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-rose-400/10 text-rose-300"
          }`}
        >
          {message.text}
        </p>
      )}

      {isAdmin && isAddingMember && (
        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-lg font-semibold text-white">Add workspace member</h2>

          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={handleAddMember}
          >
            <label className="block">
              <span className="text-sm font-medium text-slate-200">Name</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                name="name"
                onChange={handleFormChange}
                required
                type="text"
                value={memberForm.name}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Email</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                name="email"
                onChange={handleFormChange}
                required
                type="email"
                value={memberForm.email}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Password</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                minLength="8"
                name="password"
                onChange={handleFormChange}
                required
                type="password"
                value={memberForm.password}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-200">Role</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
                name="role"
                onChange={handleFormChange}
                value={memberForm.role}
              >
                <option value="ANALYST">Analyst</option>
                <option value="VIEWER">Viewer</option>
              </select>
            </label>

            <div className="flex gap-3 sm:col-span-2">
              <button
                className="rounded-lg bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Adding..." : "Add Member"}
              </button>
              <button
                className="rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200"
                onClick={() => setIsAddingMember(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-4">
          <Users className="text-cyan-400" size={20} />
          <h2 className="font-semibold text-white">{members.length} members</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr className="border-b border-slate-800 last:border-0" key={member.id}>
                  <td className="px-6 py-4 font-medium text-slate-200">
                    {member.name}
                    {member.id === user.id && (
                      <span className="ml-2 text-xs font-normal text-slate-500">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{member.email}</td>
                  <td className="px-6 py-4">
                    {isAdmin ? (
                      <select
                        aria-label={`Change ${member.name}'s role`}
                        className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-cyan-400"
                        onChange={(event) =>
                          handleRoleChange(member.id, event.target.value)
                        }
                        value={member.role}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="ANALYST">Analyst</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin && member.id !== user.id ? (
                      <button
                        aria-label={`Remove ${member.name}`}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-rose-300 transition hover:bg-rose-400/10"
                        onClick={() => handleRemoveMember(member)}
                        type="button"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Members;