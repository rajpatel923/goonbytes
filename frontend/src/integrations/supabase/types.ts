export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_crops: {
        Row: {
          created_at: string | null;
          crop_name: string;
          date_planted: string | null;
          growth_season: string | null;
          harvest_time: string | null;
          id: string;
          image_url: string | null;
          location: string | null;
          notes: string | null;
          plant_type: string | null;
          user_id: string | null;
          disease_status: string | null;
        };
        Insert: {
          created_at?: string | null;
          crop_name: string;
          date_planted?: string | null;
          growth_season?: string | null;
          harvest_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          notes?: string | null;
          plant_type?: string | null;
          user_id?: string | null;
          disease_status?: string | null;
        };
        Update: {
          created_at?: string | null;
          crop_name?: string;
          date_planted?: string | null;
          growth_season?: string | null;
          harvest_time?: string | null;
          id?: string;
          image_url?: string | null;
          location?: string | null;
          notes?: string | null;
          plant_type?: string | null;
          user_id?: string | null;
          disease_status?: string | null;
        };
        Relationships: [];
      };
      saved_farms: {
        Row: {
          created_at: string | null;
          crop_ids: string[] | null;
          date_created: string | null;
          farm_name: string | null;
          farm_type: string | null;
          id: string;
          image_url: string | null;
          location_id: string | null;
          notes: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          crop_ids?: string[] | null;
          date_created?: string | null;
          farm_name?: string | null;
          farm_type?: string | null;
          id?: string;
          image_url?: string | null;
          location_id?: string | null;
          notes?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          crop_ids?: string[] | null;
          date_created?: string | null;
          farm_name?: string | null;
          farm_type?: string | null;
          id?: string;
          image_url?: string | null;
          location_id?: string | null;
          notes?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "saved_farms_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "saved_locations";
            referencedColumns: ["id"];
          }
        ];
      };
      saved_locations: {
        Row: {
          coordinates: Json;
          created_at: string;
          date: string;
          id: string;
          location: string;
          top_crops: string[];
          user_id: string;
        };
        Insert: {
          coordinates: Json;
          created_at?: string;
          date: string;
          id?: string;
          location: string;
          top_crops: string[];
          user_id: string;
        };
        Update: {
          coordinates?: Json;
          created_at?: string;
          date?: string;
          id?: string;
          location?: string;
          top_crops?: string[];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
