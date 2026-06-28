'use client'

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/lib/auth/actions';
import { UserIcon, LockIcon, ArrowRightIcon } from '@/components/ui/icons';

export default function LoginForm() {
  const router = useRouter();
  // Server Action fuertemente tipado mediante types.ts
  const [state, action, isPending] = useActionState(loginAction, null);

  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  // La redirección se gestiona desde el cliente solo cuando recibimos
  // una confirmación de éxito. Esto evita problemas internos de Next.js
  // al tratar de redirigir desde dentro de un try/catch en el Action.
  useEffect(() => {
    if (state?.ok) {
      router.push(state.redirectTo);
      // Forzamos el refresco completo para asegurar nuevo estado global
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-surface-dark font-sans antialiased relative overflow-hidden flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#ECEEF2_1.5px,transparent_1.5px)] [background-size:18px_18px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">

        {/* Cabecera visual estricta */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 bg-brand" />
            <p className="text-xs font-black tracking-widest text-neutral-400 uppercase">
              Horizon Zenith // Access Node
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-2xl relative overflow-hidden">

          <div className="mb-8">
            <h1 className="text-4xl font-black text-surface-dark tracking-tight uppercase leading-none">
              Identificación
            </h1>
            <p className="text-xs font-bold text-neutral-400 tracking-widest mt-2 uppercase">
              Autenticación requerida para acceder al Hub
            </p>
          </div>

          <form action={action} className="space-y-5">
            {/* Mensajes de error globales o errores de Auth (ej: 'invalid_credentials') */}
            {state?.ok === false && state.error.code !== 'validation_error' && (
              <div className="bg-error/15 border-l-4 border-error text-error-text p-3 text-xs font-bold uppercase tracking-wide">
                {state.error.message}
              </div>
            )}

            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-micro font-black tracking-widest text-surface-dark uppercase">
                Email
              </label>
              <div className={`flex items-center bg-surface-light rounded-xl px-4 py-3.5 transition-all duration-300 ${emailFocus ? 'ring-2 ring-brand bg-white' : ''}`}>
                <UserIcon />
                <input
                  type="email"
                  name="email"
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-sm font-bold text-surface-dark placeholder:text-neutral-400 placeholder:font-normal"
                  placeholder="estudiante@ejemplo.com"
                />
              </div>
              {/* Zod Error para email */}
              {state?.ok === false && state.fieldErrors?.email && (
                <p className="text-error-text text-micro font-bold uppercase tracking-wide mt-1">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-micro font-black tracking-widest text-surface-dark uppercase">
                Clave de Autorización
              </label>
              <div className={`flex items-center bg-surface-light rounded-xl px-4 py-3.5 transition-all duration-300 ${passFocus ? 'ring-2 ring-brand bg-white' : ''}`}>
                <LockIcon />
                <input
                  type="password"
                  name="password"
                  onFocus={() => setPassFocus(true)}
                  onBlur={() => setPassFocus(false)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 ml-3 text-sm font-bold text-surface-dark placeholder:text-neutral-400 placeholder:font-normal"
                  placeholder="••••••••"
                />
              </div>
              {/* Zod Error para password */}
              {state?.ok === false && state.fieldErrors?.password && (
                <p className="text-error-text text-micro font-bold uppercase tracking-wide mt-1">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending || state?.ok === true}
                className="w-full bg-brand hover:bg-brand-hover text-surface-dark flex items-center justify-center gap-3 px-6 py-4 rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-200 disabled:opacity-50 group cursor-pointer"
              >
                {isPending ? 'Estableciendo Enlace...' : 'Conectar al Hub'}
                {!isPending && <span className="group-hover:translate-x-1 transition-transform"><ArrowRightIcon /></span>}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-between text-text-muted">
          <span className="text-mini font-black tracking-widest uppercase">
            Veyrdric
          </span>
          <span className="text-mini font-black tracking-widest uppercase">
            v1.0.0 (SECURE)
          </span>
        </div>
      </div>
    </div>
  );
}
