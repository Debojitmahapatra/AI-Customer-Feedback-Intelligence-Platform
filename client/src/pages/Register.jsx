import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    workspaceName: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to create your account. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white">Create your workspace</h1>
      <p className="mt-2 text-sm text-slate-400">
        Start organizing customer feedback with LOOP.
      </p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Name</span>
          <input
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            name="name"
            onChange={handleChange}
            required
            type="text"
            value={formData.name}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            name="email"
            onChange={handleChange}
            required
            type="email"
            value={formData.email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Password</span>
          <input
            autoComplete="new-password"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            minLength="8"
            name="password"
            onChange={handleChange}
            required
            type="password"
            value={formData.password}
          />
          <span className="mt-1 block text-xs text-slate-500">
            Use at least 8 characters.
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Workspace name</span>
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-cyan-400"
            name="workspaceName"
            onChange={handleChange}
            required
            type="text"
            value={formData.workspaceName}
          />
        </label>

        {errorMessage && (
          <p className="rounded-lg bg-rose-400/10 px-3 py-2 text-sm text-rose-300">
            {errorMessage}
          </p>
        )}

        <button
          className="w-full rounded-lg bg-cyan-400 px-4 py-2.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link className="font-medium text-cyan-400 hover:text-cyan-300" to="/login">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Register;