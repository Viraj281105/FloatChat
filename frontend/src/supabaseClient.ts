// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Your actual Supabase credentials
const supabaseUrl = 'https://vjdjdwjmxrmlgiaahasg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqZGpkd2pteHJtbGdpYWFoYXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwOTcyNDMsImV4cCI6MjA3MzY3MzI0M30.OTArO-QP5vKRtGLITCZlt9D9edQDbQqnbo_grOd1ouY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);