import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Initialize Supabase client for the Edge Function
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    }
  );

  // Verify user authentication (manual JWT verification is needed if verify_jwt is false)
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const { userId, message } = await req.json();

    if (!userId || !message) {
      return new Response(JSON.stringify({ error: 'Missing userId or message' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Fetch user's WhatsApp number from profiles table
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('whatsapp_number')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.whatsapp_number) {
      console.error('Error fetching profile or WhatsApp number:', profileError);
      return new Response(JSON.stringify({ error: 'User WhatsApp number not found or profile error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      });
    }

    const toPhoneNumber = profile.whatsapp_number;

    // --- INTEGRAÇÃO COM API DE WHATSAPP DE TERCEIROS ---
    // AQUI VOCÊ INTEGRARIA COM UMA API COMO TWILIO, META WHATSAPP BUSINESS API, ETC.
    // Este é um exemplo usando Twilio, mas você precisaria ajustar para o seu provedor.

    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER'); // Seu número Twilio habilitado para WhatsApp (ex: "whatsapp:+14155238886")

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      console.error('Twilio environment variables are not set.');
      return new Response(JSON.stringify({ error: 'Twilio configuration missing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const body = new URLSearchParams();
    body.append('To', `whatsapp:${toPhoneNumber}`); // Formato para Twilio WhatsApp
    body.append('From', TWILIO_FROM_NUMBER);
    body.append('Body', message);

    const twilioResponse = await fetch(twilioApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authString}`,
      },
      body: body.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Error sending WhatsApp message via Twilio:', twilioData);
      return new Response(JSON.stringify({ error: 'Failed to send WhatsApp message', details: twilioData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: twilioResponse.status,
      });
    }

    console.log('WhatsApp message sent successfully:', twilioData);
    return new Response(JSON.stringify({ message: 'WhatsApp message sent successfully', twilioResponse: twilioData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-whatsapp-message Edge Function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});