import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-white">Welcome back</h1>
      <p className="mt-2 text-sm text-slate-400">
        Sign in to continue to your LOOP workspace.
      </p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm font-medium text-slate-200">Email</span>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            name="email"
            onChange={handleChange}
            placeholder="you@example.com"
            required
            type="email"
            value={formData.email}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-200">Password</span>
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400"
            name="password"
            onChange={handleChange}
            placeholder="Enter your password"
            required
            type="password"
            value={formData.password}
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
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Need a workspace?{" "}
        <Link className="font-medium text-cyan-400 hover:text-cyan-300" to="/register">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}

export default Login;