// Hand-written types matching supabase/migrations. Once the Supabase project
// is linked, these can be regenerated with:
//   npx supabase gen types typescript --project-id <ref> > lib/supabase/types.ts

export type Plan = "free" | "starter" | "pro" | "scale";
export type MemberRole = "owner" | "member";
export type ImportStatus = "processing" | "completed" | "failed";

// postgrest-js requires every table to declare a Relationships array (even
// if empty) to satisfy its GenericTable constraint — otherwise every query
// builder call collapses to `never`. We don't rely on typed embedded
// selects (e.g. `.select("organizations(name)")`) anywhere, so empty
// arrays are correct here; relations are fetched via separate queries.
type NoRelationships = { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
        };
      } & NoRelationships;
      organizations: {
        Row: {
          id: string;
          name: string;
          business_type: string | null;
          country: string | null;
          currency: string;
          team_size: string | null;
          plan: Plan;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          business_type?: string | null;
          country?: string | null;
          currency?: string;
          team_size?: string | null;
          plan?: Plan;
          created_at?: string;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
      } & NoRelationships;
      organization_members: {
        Row: {
          organization_id: string;
          user_id: string;
          role: MemberRole;
          created_at: string;
        };
        Insert: {
          organization_id: string;
          user_id: string;
          role?: MemberRole;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["organization_members"]["Insert"]
        >;
      } & NoRelationships;
      products: {
        Row: {
          id: string;
          organization_id: string;
          sku: string;
          style_name: string;
          category: string | null;
          color: string | null;
          size: string | null;
          cost: number | null;
          price: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          sku: string;
          style_name: string;
          category?: string | null;
          color?: string | null;
          size?: string | null;
          cost?: number | null;
          price?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      } & NoRelationships;
      sales_transactions: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          quantity: number;
          revenue: number;
          sold_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          quantity: number;
          revenue: number;
          sold_at: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["sales_transactions"]["Insert"]
        >;
      } & NoRelationships;
      inventory_snapshots: {
        Row: {
          id: string;
          organization_id: string;
          product_id: string;
          quantity_on_hand: number;
          as_of_date: string;
          lead_time_days: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          product_id: string;
          quantity_on_hand?: number;
          as_of_date: string;
          lead_time_days?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["inventory_snapshots"]["Insert"]
        >;
      } & NoRelationships;
      csv_imports: {
        Row: {
          id: string;
          organization_id: string;
          uploaded_by: string | null;
          filename: string | null;
          row_count: number | null;
          status: ImportStatus;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          uploaded_by?: string | null;
          filename?: string | null;
          row_count?: number | null;
          status?: ImportStatus;
          error_message?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["csv_imports"]["Insert"]>;
      } & NoRelationships;
      reports: {
        Row: {
          id: string;
          organization_id: string;
          created_by: string | null;
          type: string;
          params: Record<string, unknown>;
          generated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          created_by?: string | null;
          type: string;
          params?: Record<string, unknown>;
          generated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reports"]["Insert"]>;
      } & NoRelationships;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
