
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://laevkfnxdaurkeotdizg.supabase.co';
const supabaseKey = 'sb_publishable__PqGiumBkTrd6j0ipGn2PQ_Soi-FcCh';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Menghubungkan ke Database...');
  
  // 1. Insert Task Fiktif
  const { data: taskData, error: taskError } = await supabase.from('tasks').insert([
    { title: 'Testing Sistem Database Neural', matkul: 'System Admin', deadline: '2026-05-10T10:00:00', status: 'pending' }
  ]).select();
  
  if (taskError) console.error('Error Task:', taskError.message);
  else console.log('Sukses masuk ke tabel Tasks:', taskData[0].title);

  // 2. Insert Inventory Fiktif
  const { data: invData, error: invError } = await supabase.from('inventory').insert([
    { unit: 'iPhone 16 Pro Max 512GB (Test)', buy_price: 22000000, sell_price: 25500000, status: 'ready' }
  ]).select();
  
  if (invError) console.error('Error Inventory:', invError.message);
  else console.log('Sukses masuk ke tabel Inventory:', invData[0].unit);

  // 3. Insert Trade Fiktif
  const { data: tradeData, error: tradeError } = await supabase.from('trades').insert([
    { pair: 'BTCUSD', entry: '64000', result: '+150' }
  ]).select();
  
  if (tradeError) console.error('Error Trade:', tradeError.message);
  else console.log('Sukses masuk ke tabel Trades:', tradeData[0].pair);
  
  console.log('Proses Injeksi Data Selesai.');
}

seed();

