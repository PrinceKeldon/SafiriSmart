
# Supabase Migration Guide

## Overview
This guide details how to migrate the existing FastAPI backend to work with Supabase while maintaining all functionality.

## 1. Database Migration

### 1.1 Create Migration Scripts
```sql
-- migrations/001_initial_schema.sql
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create operators table
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    specializations TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'new',
    assigned_operator_id UUID REFERENCES operators(id),
    traveler_name VARCHAR(255) NOT NULL,
    traveler_email VARCHAR(255) NOT NULL,
    traveler_phone VARCHAR(50),
    traveler_country VARCHAR(100),
    preferences JSONB NOT NULL,
    itinerary JSONB,
    quoted_price DECIMAL(10,2),
    quoted_currency VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create lead_notes table
CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_by UUID REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_assigned_operator ON leads(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 1.2 Data Migration Script
```python
# migrate_to_supabase.py
import os
import asyncio
from sqlalchemy import create_engine, text
from supabase import create_client

async def migrate_data():
    # Old database connection
    old_engine = create_engine(os.getenv("OLD_DATABASE_URL"))
    
    # Supabase connection
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )
    
    # Migrate operators
    with old_engine.connect() as conn:
        operators = conn.execute(text("SELECT * FROM operators")).fetchall()
        for operator in operators:
            supabase.table("operators").insert({
                "id": str(operator.id),
                "name": operator.name,
                "email": operator.email,
                "password_hash": operator.password_hash,
                "company": operator.company,
                "specializations": operator.specializations,
                "is_active": operator.is_active,
                "created_at": operator.created_at.isoformat(),
                "updated_at": operator.updated_at.isoformat()
            }).execute()
    
    print("Migration completed!")

if __name__ == "__main__":
    asyncio.run(migrate_data())
```

## 2. Backend Code Updates

### 2.1 Updated database.py
```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase client for direct operations
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# SQLAlchemy for complex operations (optional, can use Supabase client entirely)
DATABASE_URL = os.getenv("SUPABASE_DATABASE_URL")  # PostgreSQL connection string from Supabase

if DATABASE_URL:
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

def get_db():
    if DATABASE_URL:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        # Use Supabase client directly
        yield supabase

def create_tables():
    if DATABASE_URL:
        from models import Base
        Base.metadata.create_all(bind=engine)
```

### 2.2 Updated crud.py with Supabase Integration
```python
from typing import List, Optional, Dict, Any, Union
from sqlalchemy.orm import Session
from supabase import Client
import uuid

def create_lead_supabase(
    supabase_or_db: Union[Client, Session], 
    lead_data: dict, 
    itinerary: Optional[Dict[str, Any]] = None
):
    """Create lead using Supabase or SQLAlchemy"""
    if isinstance(supabase_or_db, Client):
        # Use Supabase client
        result = supabase_or_db.table("leads").insert({
            "traveler_name": lead_data["traveler"]["name"],
            "traveler_email": lead_data["traveler"]["email"],
            "traveler_phone": lead_data["traveler"].get("phone"),
            "traveler_country": lead_data["traveler"].get("country"),
            "preferences": lead_data["preferences"],
            "itinerary": itinerary or lead_data.get("itinerary"),
            "assigned_operator_id": get_next_operator_id(supabase_or_db),
            "status": "new"
        }).execute()
        return result.data[0] if result.data else None
    else:
        # Use existing SQLAlchemy code
        return create_lead(supabase_or_db, lead_data, itinerary)

def get_leads_for_operator_supabase(
    supabase_or_db: Union[Client, Session],
    operator_id: uuid.UUID,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """Get leads using Supabase or SQLAlchemy"""
    if isinstance(supabase_or_db, Client):
        query = supabase_or_db.table("leads").select("*").eq("assigned_operator_id", str(operator_id))
        
        if status:
            query = query.eq("status", status)
        
        if search:
            query = query.or_(f"traveler_name.ilike.%{search}%,traveler_email.ilike.%{search}%")
        
        # Pagination
        offset = (page - 1) * limit
        result = query.range(offset, offset + limit - 1).execute()
        
        # Get total count
        count_result = supabase_or_db.table("leads").select("id", count="exact").eq("assigned_operator_id", str(operator_id))
        if status:
            count_result = count_result.eq("status", status)
        total = count_result.execute().count
        
        return result.data, total
    else:
        # Use existing SQLAlchemy code
        return get_leads_for_operator(supabase_or_db, operator_id, status, search, page, limit)
```

## 3. Authentication Updates

### 3.1 Hybrid Authentication Approach
```python
# auth.py updates
from supabase import Client
import jwt
from datetime import datetime, timedelta

class AuthService:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def authenticate_operator_supabase(self, email: str, password: str):
        """Authenticate using Supabase"""
        try:
            result = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            return result.user
        except Exception as e:
            return None
    
    async def authenticate_operator_custom(self, email: str, password: str):
        """Keep existing custom authentication for operators"""
        result = self.supabase.table("operators").select("*").eq("email", email).execute()
        if result.data and verify_password(password, result.data[0]["password_hash"]):
            return result.data[0]
        return None
```

## 4. Frontend Updates

### 4.1 Supabase Client Setup
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types (generate with Supabase CLI)
export type Database = {
  public: {
    Tables: {
      operators: {
        Row: {
          id: string
          name: string
          email: string
          company: string
          specializations: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          email: string
          password_hash: string
          company: string
          specializations?: string[] | null
        }
        Update: {
          name?: string
          email?: string
          company?: string
          specializations?: string[] | null
          is_active?: boolean
        }
      }
      leads: {
        Row: {
          id: string
          status: string
          assigned_operator_id: string | null
          traveler_name: string
          traveler_email: string
          traveler_phone: string | null
          traveler_country: string | null
          preferences: any
          itinerary: any | null
          quoted_price: number | null
          quoted_currency: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          status?: string
          assigned_operator_id?: string | null
          traveler_name: string
          traveler_email: string
          traveler_phone?: string | null
          traveler_country?: string | null
          preferences: any
          itinerary?: any | null
        }
        Update: {
          status?: string
          quoted_price?: number | null
          quoted_currency?: string | null
        }
      }
    }
  }
}
```

### 4.2 Updated API Hooks
```typescript
// src/hooks/useLeads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export const useLeads = (operatorId: string) => {
  return useQuery({
    queryKey: ['leads', operatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          assigned_operator:operators(*)
        `)
        .eq('assigned_operator_id', operatorId)
      
      if (error) throw error
      return data
    }
  })
}

export const useCreateLead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (leadData: any) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
      
      if (error) throw error
      return data[0]
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
    }
  })
}
```

## 5. Edge Functions for Email

### 5.1 Email Edge Function
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    // Use your preferred email service (Resend, SendGrid, etc.)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'notifications@yourdomain.com',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
```

## 6. Deployment Configuration

### 6.1 Environment Variables for Supabase Integration
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

# Keep existing for gradual migration
DATABASE_URL=postgresql://username:password@localhost:5432/tourmaster_b2b

# AI Service
AI_CORE_SERVICE_URL=https://ai-core.yourdomain.com
AI_CORE_SERVICE_API_KEY=your-ai-service-key

# Email (for Edge Function)
RESEND_API_KEY=your-resend-key
```

This migration guide ensures a smooth transition to Supabase while maintaining all existing functionality and providing a path for gradual migration.
