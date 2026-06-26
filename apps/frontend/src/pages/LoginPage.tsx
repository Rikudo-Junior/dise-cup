import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success(`Bienvenue ${data.user.firstName} !`);
      navigate('/');
    },
    onError: () => toast.error('Email ou mot de passe incorrect'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-ise.png" alt="ISE" className="auth-logo-img" />
          <h1>ISE Pronostics</h1>
          <p>ENSEA Abidjan · CAN 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jean.dupont@ise-ensea.ci"
              required
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore inscrit ? <Link to="/register">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
