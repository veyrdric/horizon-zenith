// supabase/functions/stripe-webhook/index.ts
//
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// Configurar esta URL como endpoint del webhook en el dashboard de Stripe:
//   https://TU_PROYECTO.supabase.co/functions/v1/stripe-webhook
//
// Este es un STUB funcional con la estructura del flujo (Caso de Uso C
// del documento base). Falta completar:
//   - La llamada real a la API de GitHub para clonar la plantilla.
//   - El envío del mail de bienvenida (Resend / Postmark / etc).
//   - Mapear el price_id de Stripe -> program_type / role.

import Stripe from 'npm:stripe@17'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
})

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )
  } catch (err) {
    return new Response(`Firma inválida: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_details?.email

    if (!email) {
      return new Response('Sin email en la sesión de checkout', { status: 400 })
    }

    // 1. Crear el usuario de Auth (o recuperarlo si ya existe)
    const { data: created, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      })

    if (createError && createError.message !== 'User already registered') {
      console.error('Error creando usuario:', createError)
      return new Response('Error creando usuario', { status: 500 })
    }

    const userId = created?.user?.id
    if (!userId) {
      return new Response('No se pudo obtener el userId', { status: 500 })
    }

    // 2. TODO: llamar a la API de GitHub para clonar la plantilla
    //    const githubRepo = await provisionGithubRepo(email)
    const githubRepo: string | null = null

    // 3. Crear el perfil del alumno
    const { error: profileError } = await supabaseAdmin.from('profiles').insert({
      id: userId,
      name: session.customer_details?.name ?? email,
      role: 'Por definir', // ajustar según metadata del Price de Stripe
      program_type: 'Carrera Completa', // ajustar según metadata del Price
      objective: 'Pendiente de definir en la primera clase',
      github_repo: githubRepo,
    })

    if (profileError) {
      console.error('Error creando perfil:', profileError)
      return new Response('Error creando perfil', { status: 500 })
    }

    // 4. TODO: enviar mail de bienvenida con magic link / credenciales
  }

  if (event.type === 'customer.subscription.deleted') {
    // TODO: mapear customer -> profile y poner status = 'Pausado' o 'Finalizado'
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
