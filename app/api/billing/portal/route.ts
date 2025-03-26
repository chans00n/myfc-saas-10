import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { generateStripeBillingPortalLink } from '@/utils/stripe/api';
import { dynamic, runtime, preferredRegion } from '@/app/config'

export { dynamic, runtime, preferredRegion }

export async function GET() {
  try {
    // Get current user from Supabase
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Generate the billing portal URL
    const portalUrl = await generateStripeBillingPortalLink(user.email || '');
    
    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error('Error generating billing portal URL:', error);
    return NextResponse.json({ error: 'Failed to generate billing portal URL' }, { status: 500 });
  }
} 