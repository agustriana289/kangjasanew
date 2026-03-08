-- ============================================================
-- 000028_allow_guest_testimonials.sql
-- Allow Guest/Offline users to submit testimonials
-- ============================================================

-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can create testimonial for offline order" ON public.store_testimonials;

-- Create new policy
-- Allow insert if:
-- 1. user_id is null (guest/offline)
-- 2. The order belongs to an offline user (user_id IS NULL in store_orders)
-- 3. The order status is 'completed'
CREATE POLICY "Anyone can create testimonial for offline order" ON public.store_testimonials
    FOR INSERT WITH CHECK (
        (user_id IS NULL) AND
        EXISTS (
            SELECT 1 FROM public.store_orders 
            WHERE id = order_id 
              AND user_id IS NULL 
              AND status = 'completed'
        )
    );
