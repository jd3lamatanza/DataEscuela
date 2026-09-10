const supabaseUrl = 'https://crsiykjmninfbietewpp.supabase.co';
const publishableKey = 'sb_publishable_HbYPCsrBmb4_q0H3p09eDg_uyFGsiFg';
const supabase = window.supabase.createClient(supabaseUrl, publishableKey);

const form = document.querySelector('#loginForm');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#loginButton');
const message = document.querySelector('#loginMessage');

function showMessage(text, isError = true) {
  message.textContent = text;
  message.style.color = isError ? '' : '#26705f';
}

async function loadProfile(user) {
  const { data: profile, error } = await supabase
    .from('users')
    .select('email, full_name, is_active, roles:role_uuid (slug, name, is_active)')
    .eq('uuid', user.id)
    .single();
  if (error) throw new Error('La autenticación funcionó, pero no existe el perfil del usuario en public.users.');
  if (!profile.is_active || !profile.roles?.is_active) throw new Error('El usuario o su rol están desactivados.');
  return profile;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  showMessage('Verificando acceso...', false);
  const { data, error } = await supabase.auth.signInWithPassword({ email: emailInput.value.trim(), password: passwordInput.value });
  if (error) {
    const text = error.message.toLowerCase().includes('email not confirmed')
      ? 'El correo todavía no está confirmado en Supabase.'
      : 'El correo o la contraseña no son correctos.';
    showMessage(text);
    loginButton.disabled = false;
    return;
  }
  try {
    const profile = await loadProfile(data.user);
    sessionStorage.setItem('dataescuela-profile', JSON.stringify(profile));
    window.location.href = 'dashboard.html';
  } catch (profileError) {
    await supabase.auth.signOut();
    showMessage(profileError.message);
    loginButton.disabled = false;
  }
});

document.querySelector('#togglePassword').addEventListener('click', () => {
  const visible = passwordInput.type === 'password';
  passwordInput.type = visible ? 'text' : 'password';
  document.querySelector('#togglePassword').textContent = visible ? 'ocultar' : 'ver';
});
