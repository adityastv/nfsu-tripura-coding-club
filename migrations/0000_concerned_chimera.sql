CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"options" jsonb,
	"correct_answer" text,
	"input_format" text,
	"output_format" text,
	"sample_input" text,
	"sample_output" text,
	"test_cases" jsonb,
	"time_limit" integer,
	"memory_limit" integer,
	"flag" text,
	"hints" jsonb,
	"difficulty" text NOT NULL,
	"points" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"question_type" text NOT NULL,
	"answer" text NOT NULL,
	"is_correct" boolean NOT NULL,
	"points" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"execution_time" integer,
	"memory_used" integer
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"student_id" text,
	"last_login" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"problems_solved" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;