

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."assistant_presets" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "voice_provider" "text" NOT NULL,
    "assistant_id" "text" NOT NULL,
    "voice_id" "text",
    "default_greeting" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."assistant_presets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."call_recordings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "call_sid" "text",
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."call_recordings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_inquiries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "flow" "text" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "inquiry_date" timestamp with time zone DEFAULT "now"(),
    "preferred_service_date" timestamp with time zone,
    "preferred_service_date_text" "text",
    "estimated_completion" timestamp with time zone,
    "budget" numeric(10,2),
    "job_type" "text",
    "job_description" "text",
    "street_address" "text",
    "city" "text",
    "state" "text",
    "postal_code" "text",
    "country" "text" DEFAULT 'Australia'::"text",
    "call_sid" "text",
    "assistant_id" "text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "customer_inquiries_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'scheduled'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."customer_inquiries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_messages" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "email" "text",
    "message" "text" NOT NULL,
    "call_sid" "text",
    "assistant_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ivr_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "call_sid" "text",
    "field" "text",
    "raw_input" "text",
    "interpreted" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."ivr_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_provider_assistants" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "service_provider_id" "uuid" NOT NULL,
    "assistant_id" "text",
    "assistant_preset_id" "uuid",
    "greeting_message" "text",
    "enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."service_provider_assistants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_providers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "auth_user_id" "uuid" NOT NULL,
    "onboarding_status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "business_name" "text",
    "owner_name" "text",
    "business_phone" "text"[],
    "business_email" "text"[],
    "specialty" "text"[],
    "services_offered" "text"[],
    "service_area" "text"[],
    "license_number" "text",
    "insurance_info" "text",
    "rating" numeric(3,2),
    "availability_status" "text" DEFAULT 'available'::"text",
    "subscription_status" "text" DEFAULT 'none'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "completed_must_have_names" CHECK ((("onboarding_status" = 'pending'::"text") OR (("business_name" IS NOT NULL) AND ("owner_name" IS NOT NULL)))),
    CONSTRAINT "service_providers_availability_status_check" CHECK (("availability_status" = ANY (ARRAY['available'::"text", 'busy'::"text", 'unavailable'::"text"]))),
    CONSTRAINT "service_providers_onboarding_status_check" CHECK (("onboarding_status" = ANY (ARRAY['pending'::"text", 'completed'::"text"]))),
    CONSTRAINT "service_providers_subscription_status_check" CHECK (("subscription_status" = ANY (ARRAY['none'::"text", 'active'::"text", 'inactive'::"text", 'trial'::"text"])))
);


ALTER TABLE "public"."service_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "service_provider_id" "uuid" NOT NULL,
    "stripe_customer_id" "text" NOT NULL,
    "stripe_subscription_id" "text",
    "stripe_price_id" "text",
    "status" "text" NOT NULL,
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'canceled'::"text", 'incomplete'::"text", 'incomplete_expired'::"text", 'past_due'::"text", 'trialing'::"text", 'unpaid'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."twilio_phone_numbers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "phone_number" "text" NOT NULL,
    "friendly_name" "text",
    "iso_country" "text" DEFAULT 'AU'::"text",
    "capabilities" "text"[],
    "voice_url" "text",
    "sms_url" "text",
    "twilio_sid" "text" NOT NULL,
    "assigned_to" "uuid",
    "assigned_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "vapi_phone_number_id" "text",
    "vapi_imported_at" timestamp with time zone
);


ALTER TABLE "public"."twilio_phone_numbers" OWNER TO "postgres";


ALTER TABLE ONLY "public"."assistant_presets"
    ADD CONSTRAINT "assistant_presets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."call_recordings"
    ADD CONSTRAINT "call_recordings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_inquiries"
    ADD CONSTRAINT "customer_inquiries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_messages"
    ADD CONSTRAINT "customer_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ivr_logs"
    ADD CONSTRAINT "ivr_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_provider_assistants"
    ADD CONSTRAINT "service_provider_assistants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_auth_user_id_key" UNIQUE ("auth_user_id");



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_stripe_subscription_id_key" UNIQUE ("stripe_subscription_id");



ALTER TABLE ONLY "public"."twilio_phone_numbers"
    ADD CONSTRAINT "twilio_phone_numbers_phone_number_key" UNIQUE ("phone_number");



ALTER TABLE ONLY "public"."twilio_phone_numbers"
    ADD CONSTRAINT "twilio_phone_numbers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."twilio_phone_numbers"
    ADD CONSTRAINT "twilio_phone_numbers_twilio_sid_key" UNIQUE ("twilio_sid");



CREATE OR REPLACE TRIGGER "trg_ci_updated_at" BEFORE UPDATE ON "public"."customer_inquiries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_sp_updated_at" BEFORE UPDATE ON "public"."service_providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_sub_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_tp_updated_at" BEFORE UPDATE ON "public"."twilio_phone_numbers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."service_provider_assistants"
    ADD CONSTRAINT "service_provider_assistants_assistant_preset_id_fkey" FOREIGN KEY ("assistant_preset_id") REFERENCES "public"."assistant_presets"("id");



ALTER TABLE ONLY "public"."service_provider_assistants"
    ADD CONSTRAINT "service_provider_assistants_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_providers"
    ADD CONSTRAINT "service_providers_auth_user_id_fkey" FOREIGN KEY ("auth_user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_service_provider_id_fkey" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."twilio_phone_numbers"
    ADD CONSTRAINT "twilio_phone_numbers_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."service_providers"("id") ON DELETE SET NULL;





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";









































































































































































































GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
























GRANT ALL ON TABLE "public"."assistant_presets" TO "anon";
GRANT ALL ON TABLE "public"."assistant_presets" TO "authenticated";
GRANT ALL ON TABLE "public"."assistant_presets" TO "service_role";



GRANT ALL ON TABLE "public"."call_recordings" TO "anon";
GRANT ALL ON TABLE "public"."call_recordings" TO "authenticated";
GRANT ALL ON TABLE "public"."call_recordings" TO "service_role";



GRANT ALL ON TABLE "public"."customer_inquiries" TO "anon";
GRANT ALL ON TABLE "public"."customer_inquiries" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_inquiries" TO "service_role";



GRANT ALL ON TABLE "public"."customer_messages" TO "anon";
GRANT ALL ON TABLE "public"."customer_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_messages" TO "service_role";



GRANT ALL ON TABLE "public"."ivr_logs" TO "anon";
GRANT ALL ON TABLE "public"."ivr_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ivr_logs" TO "service_role";



GRANT ALL ON TABLE "public"."service_provider_assistants" TO "anon";
GRANT ALL ON TABLE "public"."service_provider_assistants" TO "authenticated";
GRANT ALL ON TABLE "public"."service_provider_assistants" TO "service_role";



GRANT ALL ON TABLE "public"."service_providers" TO "anon";
GRANT ALL ON TABLE "public"."service_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."service_providers" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."twilio_phone_numbers" TO "anon";
GRANT ALL ON TABLE "public"."twilio_phone_numbers" TO "authenticated";
GRANT ALL ON TABLE "public"."twilio_phone_numbers" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
