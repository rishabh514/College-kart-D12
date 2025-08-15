// /supabase/functions/listing-image-upload/index.ts [FINAL CORRECTED VERSION]

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { S3Client } from 'https://deno.land/x/s3_lite_client@0.7.0/mod.ts';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize the S3 client
const s3Client = new S3Client({
  region: 'auto',
  // THE FIX IS HERE: We get the full URL from secrets, but strip "https://" before using it.
  endPoint: Deno.env.get('CLOUDFLARE_ENDPOINT')!.replace('https://', ''),
  accessKey: Deno.env.get('CLOUDFLARE_ACCESS_KEY_ID')!,
  secretKey: Deno.env.get('CLOUDFLARE_SECRET_ACCESS_KEY')!,
  bucket: Deno.env.get('CLOUDFLARE_BUCKET_NAME')!,
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File;
    const listingId = formData.get('listing_id') as string;
    const position = formData.get('position') as string;

    if (!file || !listingId || !position) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fileBuffer = await file.arrayBuffer();
    const filePath = `${user.id}/${listingId}/${uuidv4()}-${file.name}`;

    await s3Client.putObject(filePath, new Uint8Array(fileBuffer), {
      contentType: file.type,
    });

    const publicUrlBase = Deno.env.get('CLOUDFLARE_PUBLIC_URL')!;
    const imageUrl = `${publicUrlBase}/${filePath}`;

    const { error: dbError } = await supabaseClient
      .from('listing_images')
      .insert({
        listing_id: listingId,
        image_url: imageUrl,
        position: parseInt(position, 10),
      });

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});