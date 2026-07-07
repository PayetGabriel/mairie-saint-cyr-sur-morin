/**
 * supabase-config.js
 * Client Supabase partagé — importé par tous les scripts du panel
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

export const supabase = createClient(
  'https://eyjooultejiibshzvztm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5am9vdWx0ZWppaWJzaHp2enRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjkzMDksImV4cCI6MjA5NzkwNTMwOX0.G69SkW-FpvP5RGsF6MhfXa3Jl-_OxHbfYURNo9Hqcvw'
)
