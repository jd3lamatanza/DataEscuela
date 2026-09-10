const supabase = window.supabase.createClient('https://crsiykjmninfbietewpp.supabase.co', 'sb_publishable_HbYPCsrBmb4_q0H3p09eDg_uyFGsiFg');
const profile = JSON.parse(sessionStorage.getItem('dataescuela-profile') || 'null');
if (!profile) window.location.href = 'index.html';
else {
  document.querySelector('#welcome').textContent = `Bienvenido/a, ${profile.full_name}`;
  document.querySelector('#profileText').textContent = `Rol: ${profile.roles.name} · Cuenta: ${profile.email}`;
}
document.querySelector('#logout').addEventListener('click', async () => { await supabase.auth.signOut(); sessionStorage.removeItem('dataescuela-profile'); window.location.href = 'index.html'; });
