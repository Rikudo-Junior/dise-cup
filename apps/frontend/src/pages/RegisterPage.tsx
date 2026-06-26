import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api';
import { useAuthStore } from '../store/auth.store';
import toast from 'react-hot-toast';

const PROMOTIONS = ['ISE 1', 'ISE 2', 'ISE 3'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    email: '', username: '', firstName: '', lastName: '', promotion: 'ISE 3', password: '',
  });

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      toast.success('Compte créé ! Bonne chance !');
      navigate('/');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Erreur lors de l\'inscription'),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/logo-ise.png" alt="ISE" className="auth-logo-img" />
          <h1>Inscription</h1>
          <p>Rejoins le championnat de pronostics ISE</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); mutation.mutate(form); }} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input value={form.firstName} onChange={set('firstName')} placeholder="Jean" required />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input value={form.lastName} onChange={set('lastName')} placeholder="Dupont" required />
            </div>
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="jean.dupont@ise-ensea.ci" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Pseudo</label>
              <input value={form.username} onChange={set('username')} placeholder="jean_dupont" required />
            </div>
            <div className="form-group">
              <label>Promotion</label>
              <select value={form.promotion} onChange={set('promotion')}>
                {PROMOTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="Minimum 8 caractères" required minLength={8} />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Inscription...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-switch">
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
