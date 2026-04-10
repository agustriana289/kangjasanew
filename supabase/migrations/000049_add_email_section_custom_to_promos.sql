alter table promos
  add column if not exists email_section_title text not null default 'Dapatkan Update Promo Terbaru',
  add column if not exists email_section_description text not null default 'Masukkan email Anda untuk mendapatkan notifikasi tentang promo dan penawaran spesial lainnya.',
  add column if not exists email_button_text text not null default 'Berlangganan';
