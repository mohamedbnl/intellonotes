-- Migration: Add objectives and prerequisites to courses table

ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS objectives    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prerequisites TEXT[] DEFAULT '{}';
