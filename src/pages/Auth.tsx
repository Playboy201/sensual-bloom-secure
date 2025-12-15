import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PremiumButton } from '@/components/ui/PremiumButton';
import { PremiumInput } from '@/components/ui/PremiumInput';
import { PremiumCard } from '@/components/ui/PremiumCard';
import { Logo } from '@/components/ui/Logo';
import { SecurityBadges } from '@/components/ui/SecurityBadge';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate with zod
    const result = authSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

      if (error) {
        if (error.message.includes('Invalid login')) {
          toast.error('Email ou palavra-passe incorretos');
        } else if (error.message.includes('already registered')) {
          toast.error('Este email já está registado. Tente entrar.');
          setIsLogin(true);
        } else {
          toast.error(error.message || 'Erro na autenticação');
        }
      } else {
        toast.success(isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!');
        // Wait a bit for auth state to update, then navigate
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(180deg, hsl(0 0% 5%) 0%, hsl(340 30% 8%) 50%, hsl(0 0% 3%) 100%)'
      }}
    >
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="animate-fade-in-up">
          <PremiumCard goldBorder className="p-8">
            <Logo size="lg" className="mb-8" />
            
            <h2 className="text-xl font-display font-bold text-center mb-6">
              {isLogin ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <PremiumInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                leftIcon={<Mail className="w-5 h-5" />}
                error={errors.email}
                required
              />

              <PremiumInput
                label="Palavra-passe"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-5 h-5" />}
                error={errors.password}
                hint={!isLogin ? 'Mínimo 6 caracteres' : undefined}
                rightIcon={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                required
              />

              <PremiumButton type="submit" isLoading={isLoading} className="w-full">
                {isLogin ? 'Entrar' : 'Criar Conta'}
              </PremiumButton>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Entrar'}
              </button>
            </div>
          </PremiumCard>
        </div>

        <div className="mt-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <SecurityBadges />
        </div>
      </div>
    </div>
  );
}
