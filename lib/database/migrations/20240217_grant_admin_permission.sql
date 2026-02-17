-- Grant HIGH_COMMAND privileges to the specified user
-- This requires joining auth.users to find the UUID by email

UPDATE public.profiles
SET 
  role = 'HIGH_COMMAND',
  is_verified = TRUE,
  updated_at = NOW()
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'alokkg3620@gmail.com'
  LIMIT 1
);

-- Verification Query (Optional - run this to check if it worked)
-- SELECT * FROM public.profiles WHERE role = 'HIGH_COMMAND';
