import * as Joi from "joi";

export const envValidationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(3001),

  // Database
  DATABASE_URL: Joi.string().required(),

  // Redis
  REDIS_URL: Joi.string().required(),

  // Auth - JWT_SECRET is REQUIRED and must NOT be the insecure default
  JWT_SECRET: Joi.string()
    .min(32)
    .disallow("dev-secret-change-me")
    .required()
    .messages({
      "any.invalid":
        "JWT_SECRET must not be the default value. Set a strong random secret in your .env file.",
      "string.min": "JWT_SECRET must be at least 32 characters long.",
      "any.required": "JWT_SECRET is required. Set it in your .env file.",
    }),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),

  // Meilisearch
  MEILISEARCH_HOST: Joi.string().uri().default("http://localhost:7700"),
  MEILISEARCH_API_KEY: Joi.string().allow("").default(""),

  // Cloudflare R2
  R2_ACCOUNT_ID: Joi.string().allow("").optional(),
  R2_ACCESS_KEY_ID: Joi.string().allow("").optional(),
  R2_SECRET_ACCESS_KEY: Joi.string().allow("").optional(),
  R2_BUCKET_NAME: Joi.string().allow("").optional(),
  R2_PUBLIC_URL: Joi.string().uri().allow("").optional(),

  // CORS
  CORS_ORIGINS: Joi.string().allow("").optional(),
});
