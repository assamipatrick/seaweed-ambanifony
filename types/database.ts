// types/database.ts
// TypeScript types for Supabase database tables

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string;
          name: string;
          code: string;
          location: string;
          manager_id: string | null;
          zones: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sites']['Insert']>;
      };
      farmers: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          code: string;
          gender: string;
          dob: string;
          birth_place: string;
          id_number: string;
          address: string;
          site_id: string;
          marital_status: string;
          nationality: string;
          parents_info: string;
          phone: string | null;
          status: string;
          join_date: string;
          exit_date: string | null;
          exit_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['farmers']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['farmers']['Insert']>;
      };
      employees: {
        Row: {
          id: string;
          code: string;
          first_name: string;
          last_name: string;
          employee_type: string;
          role: string;
          category: string;
          team: string | null;
          phone: string;
          email: string;
          hire_date: string;
          site_id: string | null;
          gross_wage: number;
          status: string;
          exit_date: string | null;
          exit_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['employees']['Insert']>;
      };
      service_providers: {
        Row: {
          id: string;
          name: string;
          service_type: string;
          contact_person: string | null;
          phone: string;
          email: string | null;
          address: string | null;
          status: string;
          join_date: string;
          exit_date: string | null;
          exit_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['service_providers']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['service_providers']['Insert']>;
      };
      modules: {
        Row: {
          id: string;
          code: string;
          site_id: string;
          zone_id: string;
          farmer_id: string | null;
          lines: number;
          poles: unknown;
          status_history: unknown;
          latitude: string | null;
          longitude: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['modules']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['modules']['Insert']>;
      };
      cultivation_cycles: {
        Row: {
          id: string;
          module_id: string;
          seaweed_type_id: string;
          planting_date: string;
          status: string;
          initial_weight: number;
          cutting_operation_id: string | null;
          lines_planted: number | null;
          harvest_date: string | null;
          harvested_weight: number | null;
          lines_harvested: number | null;
          cuttings_taken_at_harvest_kg: number | null;
          cuttings_intended_use: string | null;
          drying_start_date: string | null;
          drying_completion_date: string | null;
          actual_dry_weight_kg: number | null;
          bagging_start_date: string | null;
          bagged_date: string | null;
          bagged_bags_count: number | null;
          bagged_weight_kg: number | null;
          bag_weights: unknown;
          stock_date: string | null;
          export_date: string | null;
          processing_notes: string | null;
          payment_run_id: string | null;
          planned_duration_days: number | null;
          projected_harvest_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cultivation_cycles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cultivation_cycles']['Insert']>;
      };
      cutting_operations: {
        Row: {
          id: string;
          date: string;
          site_id: string;
          service_provider_id: string;
          module_cuts: unknown;
          unit_price: number;
          total_amount: number;
          is_paid: boolean;
          payment_date: string | null;
          notes: string | null;
          seaweed_type_id: string;
          beneficiary_farmer_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['cutting_operations']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['cutting_operations']['Insert']>;
      };
      seaweed_types: {
        Row: {
          id: string;
          name: string;
          scientific_name: string;
          description: string;
          wet_price: number;
          dry_price: number;
          price_history: unknown;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['seaweed_types']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['seaweed_types']['Insert']>;
      };
      stock_movements: {
        Row: {
          id: string;
          date: string;
          site_id: string;
          seaweed_type_id: string;
          type: string;
          designation: string;
          in_kg: number | null;
          in_bags: number | null;
          out_kg: number | null;
          out_bags: number | null;
          related_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stock_movements']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['stock_movements']['Insert']>;
      };
      farmer_deliveries: {
        Row: {
          id: string;
          slip_no: string;
          date: string;
          site_id: string;
          farmer_id: string;
          seaweed_type_id: string;
          total_weight_kg: number;
          total_bags: number;
          bag_weights: unknown;
          destination: string;
          payment_run_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['farmer_deliveries']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['farmer_deliveries']['Insert']>;
      };
      incidents: {
        Row: {
          id: string;
          date: string;
          site_id: string;
          type: string;
          severity: string;
          affected_module_ids: unknown;
          reported_by_id: string;
          status: string;
          resolution_notes: string | null;
          resolved_date: string | null;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['incidents']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['incidents']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
