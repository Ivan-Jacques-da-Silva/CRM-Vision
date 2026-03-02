import React from 'react';
import { cn } from '@/lib/utils';
import type { OrigemAuth } from '@/lib/auth-transition';

type PaginaAuth = 'login' | 'register';

interface AuthBackgroundProps {
  pagina: PaginaAuth;
  origemEntrada: OrigemAuth | null;
  comFoco: boolean;
  pulsoFoco: number;
  sequenciaPassagem?: number;
}

function classePassagem(pagina: PaginaAuth, origemEntrada: OrigemAuth | null): string | null {
  if (pagina === 'login' && origemEntrada === 'register') {
    return 'auth-pass-right-to-left';
  }

  if (pagina === 'register' && origemEntrada === 'login') {
    return 'auth-pass-left-to-right';
  }

  return null;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({
  pagina,
  origemEntrada,
  comFoco,
  pulsoFoco,
  sequenciaPassagem = 0,
}) => {
  const gradienteBase =
    pagina === 'login'
      ? 'bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))]'
      : 'bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))]';

  const deslocamentoInativo =
    pagina === 'login' ? '-translate-x-[24%]' : 'translate-x-[24%]';

  const direcaoPulso =
    pagina === 'login' ? 'auth-focus-sweep-from-left' : 'auth-focus-sweep-from-right';

  const passagem = classePassagem(pagina, origemEntrada);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
          className={cn(
            'absolute -inset-36 blur-3xl opacity-45',
            gradienteBase,
            'from-primary/20 via-primary/10 to-background/60',
            pagina === 'login' ? '-translate-x-[34%]' : 'translate-x-[34%]'
          )}
        />

      {passagem ? (
        <div
          key={`${passagem}-${sequenciaPassagem}`}
          className={cn(
            'absolute -inset-36 blur-3xl opacity-0',
            gradienteBase,
            'from-primary/50 via-primary/20 to-background/40',
            passagem
          )}
        />
      ) : null}

      <div
        className={cn(
          'absolute -inset-36 transition-all duration-700 ease-out blur-3xl',
          gradienteBase,
          'from-primary/45 via-primary/15 to-background/65',
          comFoco
            ? 'translate-x-0 scale-[1.02] opacity-95'
            : cn(deslocamentoInativo, 'scale-95 opacity-85')
        )}
      />

      {pulsoFoco > 0 ? (
        <div
          key={`${pagina}-${pulsoFoco}`}
          className={cn(
            'absolute -inset-32 bg-[radial-gradient(circle,_hsl(var(--primary)/0.36)_0%,_transparent_62%)] blur-2xl opacity-0',
            direcaoPulso
          )}
        />
      ) : null}
    </div>
  );
};
